# RETORIA HOME — прототип интернет-магазина

Кликабельный прототип RetoriaHome.ru по ТЗ (этапы «Прототип» и «Дизайн»). Итоговая сборка — на InSales.

- Демо: https://durovg4-alt.github.io/retoria-home/
- Документация: [`DOCUMENTATION/`](DOCUMENTATION) — начать с `00-START-HERE.md`, изменения по ТЗ — `08-ТЗ-ИЗМЕНЕНИЯ.md`.

## Запуск

```bash
npm install
npm run dev
```

AI-примерка (`api/tryon.js`, `api/scene.js`) работает только с сервером: локально через `npm run dev` или на Vercel. Нужен ключ OpenAI в `.env.local`:

```
OPENAI_API_KEY=sk-...
```

На GitHub Pages (статичный хостинг) примерка показывает демо-режим.

Проверки: `node scripts/calc-check.mjs`, `node scripts/fit-check.mjs`.
