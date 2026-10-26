import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "node:url";

// /api/tryon и /api/scene локально — те же функции, что на Vercel (api/*.js). Ключ читается из .env.local и в бандл не попадает.
const mountTryon = (server) => {
  for (const name of ["tryon", "scene"]) server.middlewares.use(`/api/${name}`, async (req, res) => (await import(`./api/${name}.js`)).default(req, res));
};
const tryonApi = { name: "api-tryon", configureServer: mountTryon, configurePreviewServer: mountTryon };

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, fileURLToPath(new URL(".", import.meta.url)), "OPENAI_"));
  return { base: "./", plugins: [tryonApi] };
});
