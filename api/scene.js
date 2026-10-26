// Что есть на фото комнаты: окно, кровать, диван, кресло. Нужно, чтобы не «примерять» покрывало на окно.
import { send, clientIp, limiter, readJson, checkDataUrl } from "./_lib.js";

const MODEL = process.env.OPENAI_VISION_MODEL || "gpt-4.1-mini";
const limited = limiter(40);
const keys = ["window", "bed", "sofa", "armchair"];

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Только POST" });
  if (!process.env.OPENAI_API_KEY) return send(res, 503, { error: "Нет OPENAI_API_KEY на сервере" });
  if (limited(clientIp(req))) return send(res, 429, { error: "Слишком много фото подряд, попробуйте позже" });
  try {
    const { room } = await readJson(req);
    checkDataUrl(room);
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "This is a photo of a room. For each item answer true only if it is clearly visible in the photo (at least partly): window (any window or glass balcony door), bed, sofa, armchair." },
            { type: "image_url", image_url: { url: room, detail: "low" } }
          ]
        }],
        response_format: {
          type: "json_schema",
          json_schema: { name: "scene", strict: true, schema: { type: "object", additionalProperties: false, required: keys, properties: Object.fromEntries(keys.map((k) => [k, { type: "boolean" }])) } }
        }
      })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("[scene] OpenAI", r.status, data?.error?.message);
      return send(res, 502, { error: "Не удалось распознать фото" });
    }
    const scene = JSON.parse(data.choices[0].message.content);
    return send(res, 200, { scene: Object.fromEntries(keys.map((k) => [k, scene[k] === true])) });
  } catch (err) {
    console.error("[scene]", err);
    return send(res, err.status || 500, { error: err.status ? err.message : "Ошибка распознавания" });
  }
}

export const config = { maxDuration: 40 };
