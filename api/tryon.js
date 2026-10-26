// Примерка: фото комнаты + фото товара → OpenAI Images edit → картинка «после».
// Ключ живёт только на сервере (Vercel env или .env.local), в браузер не попадает.
// Работает как Vercel Function и как middleware dev-сервера Vite (vite.config.js).

import { send, clientIp, limiter, readJson, checkDataUrl } from "./_lib.js";
import { fits, missingText } from "../src/fit.js";

const MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
const LIMIT_PER_HOUR = 5;
const limited = limiter(LIMIT_PER_HOUR);

const placement = {
  curtains: "hang the curtains on the window from a rod just below the ceiling, floor length, as a natural pair framing the window",
  tulle: "hang the sheer tulle on the window from a rod just below the ceiling, floor length, softly diffusing the daylight",
  bedspreads: "lay the bedspread neatly on the bed",
  pillows: "place the decorative pillows on the sofa or the bed",
  plaids: "drape the throw blanket casually over the sofa, armchair or bed",
  accessories: "use the fabric tie-backs to hold the curtains open; add simple curtains in a matching color if there are none"
};

const toBlob = (dataUrl) => { const { type, buf } = checkDataUrl(dataUrl); return new Blob([buf], { type }); };

export function buildPrompt(items) {
  const lines = items.map((it, i) => `Reference photo ${i + 2}: product "${it.name}" (${it.kind}), color ${it.colorName} (${it.colorHex}). Task: ${placement[it.cat] || "place the product naturally in the room"}.`);
  return [
    "Photo 1 is a real customer's room. Edit photo 1 so that it shows the home textile products from the reference photos installed in this room.",
    ...lines,
    "Keep the room exactly as it is: same walls, windows, furniture, floor, lighting, perspective, camera angle and image framing. Change nothing except adding the products.",
    "Never add new furniture, beds, sofas, windows or curtain rods that are not in photo 1. Place each product only on a matching object that already exists in photo 1.",
    "Reproduce the fabric texture, weave, transparency and folds from the reference photos, recolored to the requested color. Realistic scale, natural shadows and daylight.",
    "No text, no logos, no watermarks, no people."
  ].join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Только POST" });
  if (!process.env.OPENAI_API_KEY) return send(res, 503, { error: "Примерка не настроена: нет OPENAI_API_KEY на сервере" });

  try {
    const { room, items, scene } = await readJson(req);
    if (!Array.isArray(items) || !items.length || items.length > 2) return send(res, 400, { error: "Выберите один или два товара" });
    const misfit = items.find((it) => !fits(it.cat, scene));
    if (misfit) return send(res, 400, { error: `${misfit.name}: ${missingText(misfit.cat).toLowerCase()}` });
    // лимит считаем только для настоящих генераций
    if (limited(clientIp(req))) return send(res, 429, { error: `Лимит: ${LIMIT_PER_HOUR} примерок в час. Попробуйте позже или напишите мастеру.` });

    const form = new FormData();
    form.append("model", MODEL);
    form.append("prompt", buildPrompt(items));
    form.append("image[]", toBlob(room), "room.jpg");
    items.forEach((it, i) => form.append("image[]", toBlob(it.image), `product-${i + 1}.jpg`));
    form.append("size", "auto");
    form.append("quality", "medium");
    form.append("n", "1");

    const r = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
      signal: AbortSignal.timeout(170_000)
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("[tryon] OpenAI", r.status, data?.error?.message);
      return send(res, 502, { error: r.status === 429 ? "Сервис перегружен, попробуйте через минуту" : "Не удалось сделать визуализацию. Попробуйте другое фото." });
    }
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return send(res, 502, { error: "Сервис не вернул картинку" });
    return send(res, 200, { image: `data:image/png;base64,${b64}`, model: MODEL });
  } catch (err) {
    console.error("[tryon]", err);
    return send(res, err.status || 500, { error: err.status ? err.message : "Ошибка сервера примерки" });
  }
}

export const config = { maxDuration: 180 };
