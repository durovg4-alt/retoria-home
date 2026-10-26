import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(projectRoot, "dist");
const outputDir = join(projectRoot, "portable-site");

let html = readFileSync(join(distDir, "index.html"), "utf8");
const scriptMatch = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
const styleMatch = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/);

if (!scriptMatch || !styleMatch) {
  throw new Error("Не удалось найти собранные CSS и JavaScript в dist/index.html");
}

const resolveAsset = (path) => join(distDir, path.replace(/^\.\//, "").replace(/^\//, ""));
const javascript = readFileSync(resolveAsset(scriptMatch[1]), "utf8")
  .replaceAll("</script", "<\\/script")
  .replace(/new URL\("(?!assets\/)([^"?]+\.(?:webp|png|jpe?g|svg|woff2?))",import\.meta\.url\)/g, 'new URL("assets/$1",import.meta.url)');
const stylesheet = readFileSync(resolveAsset(styleMatch[1]), "utf8")
  .replaceAll("url(./", "url(./assets/");

html = html
  // функция вместо строки: иначе "$&" из кода бандла трактуется как шаблон замены
  .replace(scriptMatch[0], () => `<script type="module">${javascript}</script>`)
  .replace(styleMatch[0], () => `<style>${stylesheet}</style>`);

mkdirSync(outputDir, { recursive: true });
cpSync(join(distDir, "assets"), join(outputDir, "assets"), { recursive: true, force: true });
writeFileSync(join(outputDir, "OPEN-SITE.html"), html);
writeFileSync(
  join(outputDir, "READ-ME.txt"),
  "RETORIA HOME\n\nДважды нажмите на файл OPEN-SITE.html. Сайт откроется в браузере.\nИнтернет и установка программ не требуются.\n"
);

console.log(join(outputDir, "OPEN-SITE.html"));
