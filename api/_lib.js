// Общие помощники для функций api/* (файлы с «_» Vercel не публикует как отдельные эндпоинты).
export const MAX_IMAGE_BYTES = 3_000_000;

export const send = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
};

export const clientIp = (req) => String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "local").split(",")[0].trim();

// shortcut: лимит в памяти одного инстанса; при публичном запуске — Upstash/Redis или Vercel Firewall
export function limiter(perHour) {
  const hits = new Map();
  return (ip) => {
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => now - t < 3_600_000);
    if (recent.length >= perHour) return true;
    hits.set(ip, [...recent, now]);
    return false;
  };
}

export async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 3 * MAX_IMAGE_BYTES * 1.4) throw Object.assign(new Error("Слишком большой запрос"), { status: 413 });
  }
  return JSON.parse(raw || "{}");
}

export function checkDataUrl(dataUrl) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || "");
  if (!m) throw Object.assign(new Error("Нужна картинка JPG, PNG или WebP"), { status: 400 });
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > MAX_IMAGE_BYTES) throw Object.assign(new Error("Фото слишком большое"), { status: 413 });
  return { type: m[1], buf };
}
