import "@fontsource/bodoni-moda/400.css";
import "@fontsource/bodoni-moda/500.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource-variable/manrope";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./style.css";
import { img, colors, rooms, blackoutInfo, stockInfo, fabrics, categories, products, solutions, reviews, faq } from "./data.js";
import { gather, measurePoint, floorOptions, linings, calcSewing } from "./calc.js";
import { fits, missingText, sceneLabels } from "./fit.js";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: "power3.out", duration: .85 });

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion) document.documentElement.classList.add("has-motion");

const icons = {
  search: `<svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>`,
  heart: `<svg class="icon" viewBox="0 0 24 24"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.4 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>`,
  bag: `<svg class="icon" viewBox="0 0 24 24"><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>`,
  user: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>`,
  menu: `<svg class="icon" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  camera: `<svg class="icon" viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>`,
  arrow: `<span aria-hidden="true">→</span>`,
  plus: `<span aria-hidden="true">＋</span>`,
  sparkle: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 3c.7 4.6 3.4 7.3 8 8-4.6.7-7.3 3.4-8 8-.7-4.6-3.4-7.3-8-8 4.6-.7 7.3-3.4 8-8Z"/></svg>`,
  ruler: `<svg class="icon" viewBox="0 0 24 24"><path d="m3 17 14-14 4 4L7 21z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/></svg>`,
  swatch: `<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="18" rx="2"/><path d="M11 7.5 16 4l4 6-9 6.5"/><circle cx="7" cy="17" r="1.2"/></svg>`,
  check: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>`,
  truck: `<svg class="icon" viewBox="0 0 24 24"><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>`,
  needle: `<svg class="icon" viewBox="0 0 24 24"><path d="M20 4 7 17"/><path d="M17 4h3v3"/><path d="M7 17c-2 1-3 2-3 3s2 0 3-3Z"/></svg>`,
  pin: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>`
};

const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };

const state = {
  cart: load("retoria-cart-v2", []),
  favorites: load("retoria-favorites", []),
  viewed: load("retoria-viewed", []),
  order: load("retoria-checkout", {}),
  pid: null, pv: {}, productQty: 1, setSel: new Set(),
  sew: null, samples: []
};

// UTM сохраняются на сессию и уходят в заказ и заявки (на InSales — в CRM).
const utm = Object.fromEntries([...new URLSearchParams(location.search)].filter(([k]) => k.startsWith("utm_")));
if (Object.keys(utm).length) sessionStorage.setItem("retoria-utm", JSON.stringify(utm));
const getUtm = () => { try { return JSON.parse(sessionStorage.getItem("retoria-utm")) || {}; } catch { return {}; } };
// shortcut: события копятся в dataLayer, на InSales их забирает Яндекс Метрика (электронная коммерция).
const track = (event, data = {}) => (window.dataLayer ||= []).push({ event, ...data });

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const rub = (n) => `${new Intl.NumberFormat("ru-RU").format(n)} ₽`;
const byId = (id) => products.find((p) => p.id === id);
const fabricById = (id) => fabrics.find((f) => f.id === id);
const catById = (id) => categories.find((c) => c.id === id);
const activeCats = categories.filter((c) => products.some((p) => p.cat === c.id));
const colorName = (code) => `№ ${code} ${colors[code].name}`;
const blackoutLabel = (b) => b?.includes("%") ? `Затемнение ${b}` : b;
const todo = (text = "уточнить") => `<mark class="todo" title="Данные подтверждает команда Retoria Home">${text}</mark>`;
const dateFmt = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });
const inDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const deliveryWindow = (stock) => { const [a, b] = stockInfo[stock] || [3, 6]; return `${dateFmt.format(inDays(a))} – ${dateFmt.format(inDays(b))}`; };
const plural = (n, one, few, many) => n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many;
const toast = (message) => {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => el.classList.remove("show"), 2600);
};

/* ---------- Варианты, цены, комплекты ---------- */

const sizeKeys = ["width", "height", "size"];
const optLabels = { width: "Ширина, см", height: "Высота, см", panels: "Количество полотен", fastening: "Крепление", size: "Размер" };

function kitLines(kit, v = {}) {
  const width = v.width ?? kit.opts.width[0];
  const height = v.height ?? kit.opts.height[0];
  return kit.items.map((it) => {
    const p = byId(it.id);
    return { p, qty: it.qty || 1, v: { color: p.colors.includes(v.color) ? v.color : p.colors[0], width: p.opts.width ? width : undefined, height: p.opts.height ? height : undefined, panels: it.panels, fastening: p.opts.fastening?.[0] } };
  });
}

function variantPrice(p, v = {}) {
  if (p.items) return kitLines(p, v).reduce((sum, l) => sum + variantPrice(l.p, l.v) * l.qty, 0);
  const o = p.opts;
  let k = 1;
  if (o.width) k *= (v.width ?? o.width[0]) / 150;
  if (o.height) k *= (v.height ?? o.height[0]) / 250;
  if (v.panels === "Пара") k *= 2;
  if (o.size) k *= 1 + Math.max(0, o.size.indexOf(v.size)) * .3;
  return Math.round(p.base * k / 10) * 10;
}
const minPrice = (p) => variantPrice(p, { panels: p.opts.panels?.[0] });
const hasFrom = (p) => sizeKeys.some((k) => p.opts[k]?.length > 1) || !!p.opts.panels;
const isBlocked = (p, v) => (p.unavailable || []).some((rule) => Object.entries(rule).every(([k, val]) => v[k] === val));
const isReady = (p, v) => sizeKeys.filter((k) => p.opts[k]).every((k) => v[k] != null) && !isBlocked(p, v);
const stockFor = (p, v = {}) => p.stock === "В наличии" && v.width >= 300 ? "Изготовление 1–2 дня" : p.stock;
const defaultVariant = (p) => ({ color: p.colors?.[0], width: p.opts.width?.[0], height: p.opts.height?.[0], panels: p.opts.panels?.[0], fastening: p.opts.fastening?.[0], size: p.opts.size?.[0] });

function variantText(p, v) {
  return [
    v.color && colorName(v.color),
    v.width && v.height && `${v.width} × ${v.height} см`,
    v.size,
    p.opts.panels && v.panels,
    p.opts.fastening && v.fastening
  ].filter(Boolean).join(" · ");
}

function whatYouGet(p, v) {
  if (p.items) return kitLines(p, v).map((l) => `${l.p.cat === "accessories" ? `${l.qty} шт.` : l.v.panels === "Пара" ? "2 полотна" : "1 полотно"} — ${l.p.name}`).join("<br>");
  if (p.opts.panels) {
    const size = v.width && v.height ? `${v.width} × ${v.height} см` : "выбранного размера";
    return `${v.panels === "Пара" ? "Пара: 2 полотна" : "1 полотно"} ${size}${v.fastening ? `, ${v.fastening.toLowerCase()}` : ""}`;
  }
  return `1 шт.${v.size ? `, ${v.size}` : ""}`;
}

function returnText(p, stock) {
  return stock === "Пошив по размерам"
    ? `Изделие по индивидуальным размерам: возврат при браке или повреждении при доставке. ${todo("текст утверждает юрист")}`
    : `Готовое изделие надлежащего качества: обмен и возврат в течение 14 дней при сохранении товарного вида. ${todo("текст утверждает юрист")}`;
}

/* ---------- Корзина ---------- */

const cartQty = () => state.cart.reduce((sum, x) => sum + x.qty, 0);
const lineTotal = (l) => variantPrice(byId(l.id), l.v) * l.qty;
const subtotal = () => state.cart.reduce((sum, l) => sum + lineTotal(l), 0);
const saveCart = () => { save("retoria-cart-v2", state.cart); document.querySelectorAll("[data-cart-count]").forEach((x) => x.textContent = cartQty()); };

function addToCart(id, v, qty = 1, group, groupName) {
  const key = `${id}|${JSON.stringify(v)}|${group || ""}`;
  const found = state.cart.find((x) => x.key === key);
  if (found) found.qty += qty; else state.cart.push({ key, id, v, qty, group, groupName });
  saveCart();
  track("add_to_cart", { id, qty, group: groupName });
}

function addKit(kit, v, qty) {
  const group = `${kit.id}:${Date.now()}`;
  kitLines(kit, v).forEach((l) => addToCart(l.p.id, l.v, l.qty * qty, group, kit.name));
}

/* ---------- Каталог: фильтры ---------- */

const multiKeys = ["cat", "room", "blackout", "color", "fastening", "fabric", "stock"];
const priceRanges = { "0-3000": "До 3 000 ₽", "3000-6000": "3 000 – 6 000 ₽", "6000-12000": "6 000 – 12 000 ₽", "12000-": "От 12 000 ₽" };
const emptyFilter = () => ({ cat: [], room: [], blackout: [], color: [], fastening: [], fabric: [], stock: [], width: "", height: "", price: "", sort: "popular" });

function readFilter(q) {
  const f = emptyFilter();
  multiKeys.forEach((k) => f[k] = q.get(k) ? q.get(k).split(",") : []);
  ["width", "height", "price"].forEach((k) => f[k] = q.get(k) || "");
  f.sort = q.get("sort") || "popular";
  return f;
}

function filterQuery(f) {
  const q = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => { const s = [].concat(v).join(","); if (s && !(k === "sort" && s === "popular")) q.set(k, s); });
  return q.toString();
}
const catalogHref = (f) => { const q = filterQuery({ ...emptyFilter(), ...f }); return `#/catalog${q ? `?${q}` : ""}`; };

function filterProducts(f) {
  const size = { width: f.width ? +f.width : undefined, height: f.height ? +f.height : undefined };
  const [lo, hi] = f.price ? f.price.split("-").map((x) => x ? +x : Infinity) : [0, Infinity];
  const list = products.filter((p) =>
    (!f.cat.length || f.cat.includes(p.cat)) &&
    (!f.room.length || p.rooms?.some((r) => f.room.includes(r))) &&
    (!f.blackout.length || f.blackout.includes(p.blackout)) &&
    (!f.color.length || p.colors?.some((c) => f.color.includes(c))) &&
    (!f.fastening.length || p.opts.fastening?.some((x) => f.fastening.includes(x))) &&
    (!f.fabric.length || f.fabric.includes(p.fabric)) &&
    (!f.stock.length || f.stock.includes(p.stock)) &&
    (!size.width || p.opts.width?.includes(size.width)) &&
    (!size.height || p.opts.height?.includes(size.height)) &&
    (() => { const price = variantPrice(p, { ...size, panels: p.opts.panels?.[0] }); return price >= lo && price < hi; })()
  );
  const price = (p) => variantPrice(p, { ...size, panels: p.opts.panels?.[0] });
  const sorters = {
    popular: (a, b) => a.popular - b.popular,
    new: (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || a.popular - b.popular,
    cheap: (a, b) => price(a) - price(b),
    expensive: (a, b) => price(b) - price(a)
  };
  return list.sort(sorters[f.sort] || sorters.popular);
}

function chipLabel(k, v) {
  if (k === "cat") return catById(v)?.name;
  if (k === "room") return rooms[v];
  if (k === "color") return colorName(v);
  if (k === "fabric") return fabricById(v)?.name;
  if (k === "width") return `Ширина ${v} см`;
  if (k === "height") return `Высота ${v} см`;
  if (k === "price") return priceRanges[v];
  if (k === "blackout") return blackoutLabel(v);
  return v;
}

/* ---------- Общие блоки ---------- */

const navItems = [
  ["#/solutions", "Готовые решения", ["/solutions"], "nav-accent"],
  ["#/tryon", `${icons.sparkle} Примерка`, ["/tryon", "/ai"], "nav-try"],
  ["#/sew", "Пошив по размерам", ["/sew"]],
  ["#/fabrics", "Ткани и образцы", ["/fabrics", "/samples"]],
  ["#/measure", "Как замерить", ["/measure"]],
  ["#/buyers", "Покупателям", ["/buyers", "/contacts"]],
  ["#/about", "О бренде", ["/about"]]
];

function header() {
  const { route } = parseHash();
  const link = (href, label, r, cls = "") => { const on = r.includes(route); return `<a href="${href}" class="${cls}${on ? " active" : ""}"${on ? ` aria-current="page"` : ""}>${label}</a>`; };
  const links = navItems.map(([href, label, r, cls]) => link(href, label, r, cls)).join("");
  return `<div class="service-bar"><span class="demo-tag">Демо</span><span>Доставка по всей России · Пошив по вашим размерам · Помощь мастера по фото окна</span></div>
  <header class="header">
    <div class="shell nav">
      <button class="icon-btn menu-toggle" data-menu aria-label="Открыть меню" aria-expanded="false">${icons.menu}</button>
      <a class="brand" href="#/home" aria-label="Retoria Home, на главную">RETORIA<span>HOME</span></a>
      <nav class="nav-links" aria-label="Основная навигация">
        <div class="nav-drop">${link("#/catalog", "Каталог", ["/catalog", "/product", "/search"])}<div class="nav-drop-panel">${activeCats.map((c) => `<a href="${catalogHref({ cat: [c.id] })}">${c.name}</a>`).join("")}<a class="all" href="#/catalog">Весь каталог ${icons.arrow}</a></div></div>
        ${links}
      </nav>
      <div class="nav-actions">
        <a href="#/search" class="icon-btn search" aria-label="Поиск">${icons.search}</a>
        <a href="#/favorites" class="icon-btn heart" aria-label="Избранное">${icons.heart}</a>
        <a href="#/account" class="icon-btn account" aria-label="Личный кабинет">${icons.user}</a>
        <a href="#/cart" class="icon-btn" aria-label="Корзина">${icons.bag}<span class="cart-count" data-cart-count>${cartQty()}</span></a>
      </div>
    </div>
  </header>
  <nav class="mobile-menu" aria-label="Мобильная навигация">
    <a href="#/catalog">Каталог</a>${activeCats.map((c) => `<a class="sub" href="${catalogHref({ cat: [c.id] })}">${c.name}</a>`).join("")}${links}<a href="#/favorites">Избранное</a><a href="#/account">Личный кабинет</a>
  </nav>`;
}

function footer() {
  return `<footer class="footer"><div class="shell">
    <div class="footer-grid">
      <div class="footer-brand"><a class="brand" href="#/home">RETORIA<span>HOME</span></a><p class="muted">Красивый интерьер.<br>Просто выбрать.</p></div>
      <div class="footer-col"><h3>Каталог</h3>${activeCats.map((c) => `<a href="${catalogHref({ cat: [c.id] })}">${c.name}</a>`).join("")}<a href="#/solutions">Готовые решения</a></div>
      <div class="footer-col"><h3>Покупателям</h3><a href="#/buyers#delivery">Доставка и оплата</a><a href="#/buyers#returns">Возврат и обмен</a><a href="#/buyers#faq">Вопросы и ответы</a><a href="#/buyers#care">Уход</a><a href="#/buyers#tracking">Отслеживание заказа</a><a href="#/measure">Как замерить</a></div>
      <div class="footer-col"><h3>О бренде</h3><a href="#/about">О производстве</a><a href="#/fabrics">Ткани и цвета</a><a href="#/samples">Образцы тканей</a><a href="#/reviews">Отзывы</a><a href="#/help?from=footer">Помощь мастера</a></div>
      <div class="footer-col"><h3>Контакты</h3><a href="#/buyers#contacts">Телефон ${todo()}</a><a href="#/buyers#contacts">E-mail ${todo()}</a><a href="#/buyers#contacts">Telegram · WhatsApp · VK</a><a href="#/buyers#contacts">График работы</a></div>
    </div>
    <div class="footer-bottom"><span>© 2026 Retoria Home · Реквизиты продавца: <a href="#/legal/requisites">ООО / ИП, ИНН, ОГРН</a> ${todo()}</span><span><a href="#/legal/policy">Политика конфиденциальности</a> · <a href="#/legal/offer">Оферта</a> · <a href="#/legal/consent">Согласие на обработку данных</a></span></div>
  </div></footer>`;
}

const crumbs = (items) => `<nav class="shell breadcrumb" aria-label="Хлебные крошки">${items.map(([label, href]) => href ? `<a href="${href}">${label}</a>` : `<span aria-current="page">${label}</span>`).join(" / ")}</nav>`;
const swatchDots = (codes = []) => `<span class="dots">${codes.map((c) => `<i style="background:${colors[c].hex}" title="${colorName(c)}"></i>`).join("")}</span>`;
const blockHead = (title, link, text) => `<div class="block-head reveal"><div><h2>${title}</h2>${text ? `<p>${text}</p>` : ""}</div>${link ? `<a href="${link[1]}">${link[0]} ${icons.arrow}</a>` : ""}</div>`;

function productCard(p) {
  const fav = state.favorites.includes(p.id);
  const o = p.opts;
  const sizes = o.width ? `${Math.min(...o.width)}–${Math.max(...o.width)} × ${Math.min(...o.height)}–${Math.max(...o.height)} см` : o.size ? o.size.join(" / ") : "";
  return `<article class="product-card">
    <div class="media"><a href="#/product/${p.id}" aria-label="${p.name}"><img src="${p.image}" alt="${p.name}" loading="lazy"></a>
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
      <button class="heart icon-btn ${fav ? "selected" : ""}" data-favorite="${p.id}" aria-label="${fav ? "Удалить из избранного" : "Добавить в избранное"}" aria-pressed="${fav}">${icons.heart}</button>
      <button class="quick-add icon-btn" data-quick-add="${p.id}" aria-label="Быстро добавить ${p.name} в корзину">${icons.plus}</button></div>
    <div class="product-meta">
      <div class="row"><h3><a href="#/product/${p.id}">${p.name}</a></h3><strong>${hasFrom(p) ? "от " : ""}${rub(minPrice(p))}</strong></div>
      <div class="card-specs">${swatchDots(p.colors)}${p.blackout ? `<span>${blackoutLabel(p.blackout)}</span>` : ""}${sizes ? `<span>${sizes}</span>` : ""}</div>
      ${p.items ? "" : `<a class="ai-mini" href="#/tryon?product=${p.id}">${icons.sparkle} Примерить в интерьере</a>`}
    </div>
  </article>`;
}

function solutionCard(s) {
  const kit = s.kit && byId(s.kit);
  const from = kit ? minPrice(kit) : Math.min(...filterProducts({ ...emptyFilter(), ...s.filter }).map(minPrice));
  return `<a class="solution-card" href="#/solutions/${s.id}" data-track="solution_${s.id}">
    <div class="solution-media"><img src="${s.image}" alt="${s.title}" loading="lazy"></div>
    <h3>${s.title}</h3><p>${s.promise}</p>
    <ul>${s.facts.map((f) => `<li>${f}</li>`).join("")}</ul>
    <div class="solution-foot"><strong>от ${rub(from)}</strong><span>Смотреть ${icons.arrow}</span></div>
  </a>`;
}

function reviewCard(r) {
  const p = byId(r.product);
  return `<article class="review-card" data-room="${r.room}" data-product="${r.product}">
    ${r.photo ? `<img src="${r.photo}" alt="Интерьер покупателя: ${p.name}" loading="lazy">` : `<div class="photo-ph">Фото после согласия клиента</div>`}
    <div><div class="stars" aria-label="Оценка ${r.stars} из 5">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</div>
    <h3>${r.title}</h3><p>${r.text}</p>
    <dl><div><dt>Комплект</dt><dd><a href="#/product/${p.id}">${p.name}</a></dd></div><div><dt>Размер</dt><dd>${r.window}</dd></div></dl>
    <span class="muted">${r.name}, ${r.city} · ${rooms[r.room]}</span></div>
  </article>`;
}

const faqList = (items = faq) => `<div class="faq">${items.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div>
  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) })}</script>`;

const helpBlock = (from) => `<section class="home-shell block"><div class="final-help reveal">
  <div><h2>Не уверены в размере или ткани?</h2><p>Пришлите фото окна — мастер проверит замеры и предложит 2–3 решения.</p></div>
  <div class="final-help-actions"><a class="pill light" href="#/measure" data-track="help_measure_${from}">Как замерить</a><a class="pill primary" href="#/help?from=${from}" data-track="help_${from}">Получить помощь ${icons.arrow}</a></div>
</div></section>`;

const comparison = (before = img.roomBefore, after = img.roomAfter) => `<div class="comparison" data-comparison><img src="${before}" alt="Комната до примерки"><img class="after" src="${after}" alt="Та же комната с текстилем Retoria Home"><span class="compare-label before">До</span><span class="compare-label after-label">После</span><span class="comparison-line"></span><span class="comparison-handle" aria-hidden="true">↔</span><input class="compare-range" type="range" min="4" max="96" value="50" aria-label="Сравнить до и после примерки"></div>`;

const fabricTile = (f) => `<a class="fabric-tile reveal" href="#/fabrics/${f.id}"><div class="fabric-photo"><img src="${f.photo}" alt="Ткань ${f.name} крупным планом" loading="lazy"><span>${blackoutLabel(f.blackout)}</span></div><div class="fabric-tile-body"><strong>${f.name}</strong><small>${f.composition}</small><div class="fabric-colors">${f.colors.map((c) => `<i style="background:${colors[c].hex}" title="${colorName(c)}"></i>`).join("")}<em>${f.colors.map((c) => `№ ${c}`).join(" · ")}</em></div></div></a>`;

const tryonSteps = () => `<ol class="tryon-steps"><li><b>1</b>Фото комнаты</li><li><b>2</b>Товары из каталога</li><li><b>3</b>Результат примерно за минуту</li></ol>`;

const photoPh = (label) => `<div class="photo-ph"><span>${label}</span></div>`;

/* ---------- Страницы ---------- */

function homePage() {
  const homeCats = activeCats.filter((c) => c.id !== "sets");
  const popular = products.filter((p) => !p.items).sort((a, b) => a.popular - b.popular).slice(0, 8);
  const perks = [[icons.needle, "Шьём в Твери", "Собственное производство"], [icons.sparkle, "Примерка по фото", "Любой товар в вашей комнате"], [icons.check, "Проверка замеров", "Мастер сверит до оплаты"], [icons.truck, "Доставка по России", "Курьер или пункт выдачи"]];
  const steps = [[icons.swatch, "Выбор ткани и цвета", "Готовое решение, каталог или образцы тканей домой.", "#/fabrics", "Ткани и образцы"], [icons.ruler, "Замер", "По нашей схеме за 10 минут: ширина карниза и высота в трёх точках.", "#/measure", "Как замерить"], [icons.check, "Проверка мастером", "Мастер сверяет размеры до оплаты и предупреждает о рисках.", "#/help?from=home-steps", "Отправить замеры"], [icons.truck, "Пошив и доставка", "Шьём в Твери, проверяем швы и размеры, доставляем по России.", "#/buyers#delivery", "Условия доставки"]];
  const prod = ["Проверка замеров", "Раскрой", "Пошив", "Отпаривание", "Контроль швов и размеров", "Упаковка"];
  return `<main id="content" class="page home">
    <section class="home-hero" aria-label="Главный экран">
      <img src="${img.heroClean}" alt="Светлая спальня со шторами и текстилем в оливковых оттенках">
      <div class="home-hero-copy"><div class="hero-card">
        <p class="eyebrow">Готовое оформление окна без сложного подбора</p>
        <h1>Красивый интерьер.<br>Просто выбрать</h1>
        <p class="hero-sub">Выберите стиль, цвет и размер — тюль, шторы и аксессуары уже сочетаются между собой.</p>
        <div class="hero-actions"><a class="pill primary" href="#/solutions" data-track="hero_solutions">Выбрать готовое решение ${icons.arrow}</a><a class="pill light" href="#/catalog" data-track="hero_catalog">Смотреть каталог</a></div>
        <a class="hero-try" href="#/tryon" data-track="hero_tryon">${icons.sparkle} Примерьте любой товар на фото своей комнаты ${icons.arrow}</a>
      </div></div>
    </section>

    <section class="home-shell perks" aria-label="Преимущества">${perks.map(([ic, t, d]) => `<div class="perk">${ic}<div><strong>${t}</strong><span>${d}</span></div></div>`).join("")}</section>

    <section class="home-shell block-tight" aria-label="Категории">
      ${blockHead("Что подобрать для дома", ["Весь каталог", "#/catalog"], "Начните со штор и тюля — покрывала, подушки и пледы дополнят комнату.")}
      <div class="cat-grid">${homeCats.map((c) => `<a class="cat-tile" href="${catalogHref({ cat: [c.id] })}" data-track="home_cat_${c.id}"><img src="${c.image}" alt="" loading="lazy"><span class="cat-name">${c.name}</span><span class="cat-sub">${c.sub}</span></a>`).join("")}</div>
    </section>

    <section class="home-shell block" id="rooms">
      ${blockHead("Готовые решения по комнатам", ["Все решения", "#/solutions"], "Комплекты, в которых шторы, тюль и аксессуары уже подобраны.")}
      <div class="solution-grid">${solutions.slice(0, 4).map(solutionCard).join("")}</div>
    </section>

    <section class="home-shell block">
      ${blockHead("Три способа купить")}
      <div class="ways">
        <a class="way reveal" href="#/catalog" data-track="way_ready"><span>01</span><h3>Готовые размеры</h3><p>Стандартная ширина и высота. Отправка со склада.</p><b>Смотреть каталог ${icons.arrow}</b></a>
        <a class="way reveal" href="#/sew" data-track="way_sew"><span>02</span><h3>Пошив по своим размерам</h3><p>Калькулятор покажет расход ткани и предварительную цену.</p><b>Рассчитать пошив ${icons.arrow}</b></a>
        <a class="way reveal" href="#/help?from=home-ways" data-track="way_help"><span>03</span><h3>Помощь мастера по фото</h3><p>Пришлите фото окна — предложим 2–3 решения.</p><b>Отправить фото ${icons.arrow}</b></a>
      </div>
    </section>

    <section class="home-shell block">
      ${blockHead("Популярные модели", ["Весь каталог", "#/catalog"])}
      <div class="carousel" data-carousel aria-roledescription="карусель" aria-label="Популярные модели">
        <div class="carousel-track" data-carousel-track tabindex="0">${popular.map(productCard).join("")}</div>
        <div class="carousel-controls"><button data-carousel-prev aria-label="Предыдущие товары">←</button><div class="carousel-bar"><i data-carousel-bar></i></div><button data-carousel-next aria-label="Следующие товары">→</button><button class="carousel-pause" data-carousel-pause aria-label="Остановить автопрокрутку">❚❚</button></div>
      </div>
    </section>

    <section class="home-shell block" id="tryon">
      <div class="tryon-band reveal">
        <div class="tryon-copy"><p class="eyebrow">${icons.sparkle} Главное отличие Retoria Home</p><h2>Примерьте наш текстиль в своём интерьере</h2><p>Пришлите фото окна, дивана или кровати — покажем, как будут смотреться шторы, тюль, покрывала, подушки и пледы. До покупки.</p>${tryonSteps()}<a class="pill primary" href="#/tryon" data-track="home_tryon">Примерить на своём фото ${icons.arrow}</a></div>
        <div class="tryon-visual">${comparison()}</div>
      </div>
    </section>

    <section class="home-shell block">
      ${blockHead("Как мы работаем", null, "Четыре шага от выбора до готовых штор на вашем окне.")}
      <ol class="work-steps">${steps.map(([ic, t, d, href, l], i) => `<li class="work-step reveal"><div class="work-icon">${ic}</div><span class="work-num">0${i + 1}</span><h3>${t}</h3><p>${d}</p><a class="text-link" href="${href}">${l} ${icons.arrow}</a></li>`).join("")}</ol>
    </section>

    <section class="home-shell block" id="fabrics">
      ${blockHead("Ткани и цвета", ["Все ткани", "#/fabrics"], "Номер оттенка, затемнение и состав — в одном справочнике. Образцы можно заказать домой.")}
      <div class="fabric-tiles">${fabrics.map(fabricTile).join("")}</div>
      <div class="row-actions"><a class="pill" href="#/fabrics">Каталог тканей</a><a class="pill primary" href="#/samples" data-track="home_samples">Заказать образцы ${icons.arrow}</a></div>
    </section>

    <section class="home-shell block">
      <div class="production reveal">
        <div><p class="eyebrow">Производство в Твери</p><h2>Каждое изделие проходит шесть этапов</h2><ol>${prod.map((x) => `<li>${x}</li>`).join("")}</ol><a class="text-link" href="#/about">О производстве ${icons.arrow}</a></div>
        ${photoPh("Фото производства — заменить реальными после съёмки")}
      </div>
    </section>

    <section class="home-shell block" id="reviews">
      ${blockHead("Отзывы и реальные интерьеры", ["Все отзывы", "#/reviews"])}
      <div class="chip-row" data-review-chips><button class="chip active" data-review-room="all">Все</button>${Object.entries(rooms).map(([id, name]) => `<button class="chip" data-review-room="${id}">${name}</button>`).join("")}</div>
      <div class="review-grid">${reviews.slice(0, 4).map(reviewCard).join("")}</div>
    </section>

    <section class="home-shell block">
      ${blockHead("Вопросы и ответы", ["Все вопросы", "#/buyers#faq"])}
      ${faqList()}
    </section>

    ${helpBlock("home-final")}
  </main>`;
}

function catalogPage(_, q) {
  const f = readFilter(q);
  const group = (title, name, items, extra = "") => `<fieldset class="filter-group"><legend>${title}</legend>${items.map(([value, label, note]) => `<label class="check"><input type="checkbox" name="${name}" value="${value}" ${f[name].includes(value) ? "checked" : ""}><span>${label}${note ? `<small>${note}</small>` : ""}</span></label>`).join("")}${extra}</fieldset>`;
  const sel = (name, label, values) => `<label class="select-field"><span>${label}</span><select name="${name}"><option value="">Любая</option>${values.map((v) => `<option ${String(f[name]) === String(v) ? "selected" : ""}>${v}</option>`).join("")}</select></label>`;
  const widths = [...new Set(products.flatMap((p) => p.opts.width || []))].sort((a, b) => a - b);
  const heights = [...new Set(products.flatMap((p) => p.opts.height || []))].sort((a, b) => a - b);
  return `<main id="content" class="page">${crumbs([["Главная", "#/home"], ["Каталог"]])}
  <section class="shell page-head"><h1 class="section-title small">Каталог</h1><p class="lede">Шторы, тюль и готовые комплекты на окно. Фильтры сохраняются, когда вы возвращаетесь из карточки.</p></section>
  <section class="shell catalog-layout">
    <aside class="filter" id="filter" aria-label="Фильтры">
      <form id="filter-form" data-filter-form>
        <div class="filter-head"><strong>Фильтры</strong><button type="button" data-reset>Сбросить</button></div>
        ${group("Тип товара", "cat", activeCats.map((c) => [c.id, c.name]))}
        ${group("Комната", "room", Object.entries(rooms))}
        ${group("Затемнение", "blackout", Object.entries(blackoutInfo).map(([k, v]) => [k, k, v]))}
        <fieldset class="filter-group"><legend>Цвет</legend><div class="swatch-checks">${Object.entries(colors).map(([code, c]) => `<label title="${colorName(code)}"><input type="checkbox" name="color" value="${code}" ${f.color.includes(code) ? "checked" : ""}><i style="background:${c.hex}"></i><small>${code}</small></label>`).join("")}</div></fieldset>
        <fieldset class="filter-group"><legend>Размер</legend><div class="size-pair">${sel("width", "Ширина, см", widths)}${sel("height", "Высота, см", heights)}</div></fieldset>
        ${group("Крепление", "fastening", Object.keys(gather).map((x) => [x, x]))}
        ${group("Ткань", "fabric", fabrics.map((x) => [x.id, x.name]), `<a class="text-link small" href="#/fabrics">Что за ткани? ${icons.arrow}</a>`)}
        <fieldset class="filter-group"><legend>Цена</legend>${Object.entries(priceRanges).map(([v, label]) => `<label class="check"><input type="radio" name="price" value="${v}" ${f.price === v ? "checked" : ""}><span>${label}</span></label>`).join("")}<label class="check"><input type="radio" name="price" value="" ${!f.price ? "checked" : ""}><span>Любая</span></label><small class="muted">Цена считается для выбранного размера</small></fieldset>
        ${group("Наличие", "stock", Object.keys(stockInfo).map((x) => [x, x]))}
        <button type="button" class="pill primary filter-done" data-filter-toggle>Показать товары</button>
      </form>
    </aside>
    <div>
      <div class="catalog-toolbar"><div><button type="button" class="pill filter-toggle" data-filter-toggle aria-controls="filter">Фильтры <b data-filter-count></b></button><span data-count></span></div>
        <label class="sort"><span class="sr-only">Сортировка</span><select name="sort" form="filter-form"><option value="popular" ${f.sort === "popular" ? "selected" : ""}>Популярные</option><option value="new" ${f.sort === "new" ? "selected" : ""}>Новинки</option><option value="cheap" ${f.sort === "cheap" ? "selected" : ""}>Сначала дешевле</option><option value="expensive" ${f.sort === "expensive" ? "selected" : ""}>Сначала дороже</option></select></label></div>
      <div class="chip-row" data-chips></div>
      <div data-results></div>
    </div>
  </section></main>`;
}

function formFilter(form) {
  const data = new FormData(form);
  const f = emptyFilter();
  multiKeys.forEach((k) => f[k] = data.getAll(k));
  ["width", "height", "price"].forEach((k) => f[k] = data.get(k) || "");
  f.sort = data.get("sort") || "popular";
  return f;
}

function updateCatalog() {
  const form = document.querySelector("[data-filter-form]");
  if (!form) return;
  const f = formFilter(form);
  const q = filterQuery(f);
  history.replaceState(null, "", `#/catalog${q ? `?${q}` : ""}`);
  const list = filterProducts(f);
  const chips = [...multiKeys.flatMap((k) => f[k].map((v) => [k, v])), ...["width", "height", "price"].filter((k) => f[k]).map((k) => [k, f[k]])];
  document.querySelector("[data-chips]").innerHTML = chips.length ? chips.map(([k, v]) => `<button class="chip active" data-chip-key="${k}" data-chip-val="${esc(v)}" aria-label="Убрать фильтр ${esc(chipLabel(k, v))}">${esc(chipLabel(k, v))} ×</button>`).join("") + `<button class="chip" data-reset>Сбросить всё</button>` : "";
  document.querySelector("[data-filter-count]").textContent = chips.length ? `(${chips.length})` : "";
  document.querySelector("[data-count]").textContent = `${list.length} ${plural(list.length, "товар", "товара", "товаров")}`;
  document.querySelector("[data-results]").innerHTML = list.length
    ? `<div class="product-grid">${list.map(productCard).join("")}</div>`
    : `<div class="empty-state"><h2>Ничего не нашлось</h2><p>Уберите часть фильтров или пришлите фото окна — мастер подберёт 2–3 решения.</p><div class="row-actions"><button class="pill" data-reset>Сбросить фильтры</button><a class="pill primary" href="#/help?from=catalog-empty">Помощь консультанта</a></div></div>`;
}

function productPage(id) {
  const p = byId(id);
  if (!p) return notFoundPage();
  if (state.pid !== id) {
    state.pid = id;
    state.pv = { color: p.colors?.[0], panels: p.opts.panels?.[0], fastening: p.opts.fastening?.[0] };
    state.productQty = 1;
    state.setSel = new Set();
    state.viewed = [id, ...state.viewed.filter((x) => x !== id)].slice(0, 8);
    save("retoria-viewed", state.viewed);
    track("view_item", { id, name: p.name });
  }
  const cat = catById(p.cat);
  const fabric = fabricById(p.fabric);
  const own = reviews.filter((r) => r.product === id);
  const shown = own.length ? own : reviews.filter((r) => p.rooms?.includes(r.room)).slice(0, 2);
  const similar = products.filter((x) => x.cat === p.cat && x.id !== id).slice(0, 4);
  const sameRoom = products.filter((x) => x.cat !== p.cat && x.rooms?.some((r) => p.rooms?.includes(r))).slice(0, 4);
  const viewed = state.viewed.filter((x) => x !== id).map(byId).filter(Boolean).slice(0, 4);
  const specs = fabric
    ? [["Ткань", `<a href="#/fabrics/${fabric.id}">${fabric.name}</a>`], ["Состав", fabric.composition], ["Плотность", fabric.density], ["Затемнение", `${p.blackout} — ${blackoutInfo[p.blackout].toLowerCase()}`], ["Уход", fabric.care], ["Возможная усадка", fabric.shrink], ["Высота без шва", `до ${fabric.maxHeight} см`], ["Крепление", p.opts.fastening.join(", ")], ["Страна производства", "Россия, Тверь"]]
    : p.items
      ? [["Состав комплекта", kitLines(p).map((l) => l.p.name).join(", ")], ["Затемнение", p.blackout], ["Комната", p.rooms.map((r) => rooms[r]).join(", ")], ["Страна производства", "Россия, Тверь"]]
      : [["Размеры", (p.opts.size || ["единый"]).join(", ")], ["Цвета", p.colors.map(colorName).join(", ")], ["Уход", todo()], ["Страна производства", "Россия, Тверь"]];
  const crumbsList = [["Главная", "#/home"], ["Каталог", "#/catalog"], [cat.name, catalogHref({ cat: [cat.id] })], [p.name]];
  return `<main id="content" class="page">${crumbs(crumbsList)}
  <section class="shell product-detail">
    <div class="gallery">
      <div class="gallery-main" data-gallery-main><img data-main-image src="${state.pv.color && p.colorImages?.[state.pv.color] || p.image}" alt="${p.name}"></div>
      <div class="thumbs">${p.gallery.map((g, i) => `<button class="thumb ${i === 0 ? "active" : ""}" data-thumb="${g.src || ""}" data-label="${g.label}" aria-label="${g.label}">${g.src ? `<img src="${g.src}" alt="">` : `<span>${g.label}</span>`}</button>`).join("")}</div>
      <p class="muted small">Видео изделия добавим при наличии. Цвет на экране может отличаться — закажите образец.</p>
    </div>
    <div class="product-panel" data-panel>${productPanel(p)}</div>
  </section>

  <section class="section compact shell">
    <p class="eyebrow">Характеристики</p><h2 class="section-title small">${fabric ? "Ткань, уход и крепление" : "Подробности"}</h2>
    <dl class="spec-table">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
  </section>

  ${p.opts.fastening ? `<section class="section compact shell"><div class="measure-card">
    <div><p class="eyebrow">Размер и замер</p><h2 class="section-title small">Как выбрать размер</h2><p class="lede">Ширину полотна берём больше ширины карниза — так шторы ложатся складками. Это коэффициент сборки.</p>
    <div class="row-actions"><a class="pill" href="#/measure">Инструкция по замеру</a><a class="pill primary" href="#/sew?fabric=${p.fabric}&color=${state.pv.color}" data-track="product_sew">Сшить по своим размерам ${icons.arrow}</a></div></div>
    <table class="gather-table"><thead><tr><th>Крепление</th><th>Коэффициент сборки</th><th>Пример: карниз 200 см</th></tr></thead><tbody>${p.opts.fastening.map((x) => `<tr><td>${x}</td><td>× ${gather[x]}</td><td>${Math.round(200 * gather[x])} см ткани</td></tr>`).join("")}</tbody></table>
  </div></section>` : ""}

  ${p.cat === "curtains" ? `<section class="section compact shell"><div class="window-set">
    <div><p class="eyebrow">Комплект на окно</p><h2 class="section-title small">Добавьте тюль и аксессуары</h2><p class="lede">Показываем только варианты, совместимые с выбранным размером. Сумма пересчитывается сразу.</p></div>
    <div data-set>${windowSet(p)}</div>
  </div></section>` : ""}

  ${p.items ? `<section class="section compact shell"><div class="window-set">
    <div><p class="eyebrow">Состав комплекта</p><h2 class="section-title small">Что входит</h2><p class="lede">Позиции уже совпадают по размеру и цвету. В корзине комплект хранится связанными позициями.</p></div>
    <div data-set>${kitComposition(p)}</div>
  </div></section>` : ""}

  <section class="section compact shell">
    <div class="catalog-toolbar"><div><p class="eyebrow">Доверие</p><h2 class="section-title small">Отзывы покупателей</h2></div><a class="pill" href="#/reviews">Все отзывы ${icons.arrow}</a></div>
    <div class="review-grid">${shown.map(reviewCard).join("")}</div>
    <div class="trust-row">
      <div><h3>Контроль качества</h3><p class="muted">Перед упаковкой проверяем швы, размеры и цвет при дневном свете.</p></div>
      <div><h3>Гарантийный порядок</h3><p class="muted">Брак и повреждения при доставке заменяем за наш счёт. ${todo("порядок утверждает собственник")}</p></div>
      <div><h3>Вопросы о товаре</h3>${faqList([faq[0], faq[3], faq[6]])}</div>
    </div>
  </section>

  ${[["Похожие товары", similar], [`Для той же комнаты`, sameRoom], ["Вы недавно смотрели", viewed]].filter(([, list]) => list.length).map(([title, list]) => `<section class="section compact shell"><h2 class="section-title small">${title}</h2><div class="product-grid four" style="margin-top:40px">${list.map(productCard).join("")}</div></section>`).join("")}
  </main>`;
}

function productPanel(p) {
  const v = state.pv;
  const ready = isReady(p, v);
  const price = variantPrice(p, v);
  const stock = stockFor(p, v);
  const cat = catById(p.cat);
  const own = reviews.filter((r) => r.product === p.id);
  const avg = own.length ? (own.reduce((s, r) => s + r.stars, 0) / own.length).toFixed(1) : null;
  const colorBlock = p.colors ? `<div class="option"><div class="option-head"><strong>Цвет</strong><span>${v.color ? colorName(v.color) : ""}</span></div><div class="swatches">${p.colors.map((c) => `<button class="swatch ${v.color === c ? "selected" : ""}" data-opt="color" data-val="${c}" style="background:${colors[c].hex}" aria-label="${colorName(c)}" aria-pressed="${v.color === c}"></button>`).join("")}</div></div>` : "";
  const optBlock = (key) => !p.opts[key] ? "" : `<div class="option"><div class="option-head"><strong>${optLabels[key]}</strong>${key === "height" ? `<a href="#/measure">Как измерить?</a>` : key === "fastening" && v.fastening ? `<span class="muted">сборка × ${gather[v.fastening]}</span>` : ""}</div><div class="choice-row">${p.opts[key].map((x) => { const blocked = isBlocked(p, { ...v, [key]: x }); return `<button class="choice ${v[key] === x ? "selected" : ""}" data-opt="${key}" data-val="${x}" ${blocked ? `disabled title="Недоступно с выбранными параметрами"` : ""}>${x}</button>`; }).join("")}</div></div>`;
  return `<p class="eyebrow">${cat.name} · арт. ${p.sku}</p>
    <h1>${p.name}</h1>
    ${avg ? `<a class="rating" href="#/reviews">★ ${avg} <span class="muted">· ${own.length} ${plural(own.length, "отзыв", "отзыва", "отзывов")}</span></a>` : ""}
    <div class="product-price">${ready ? rub(price) : `от ${rub(minPrice(p))}`}</div>
    <div class="key-facts">${p.blackout ? `<span title="${blackoutInfo[p.blackout]}">${blackoutLabel(p.blackout)}</span>` : ""}${p.rooms ? `<span>${p.rooms.map((r) => rooms[r]).join(", ")}</span>` : ""}<span class="stock">${stock}</span></div>
    <p class="lede">${p.desc}</p>
    ${colorBlock}${["width", "height", "size", "panels", "fastening"].map(optBlock).join("")}
    ${isBlocked(p, v) ? `<p class="warn">Такое сочетание недоступно — выберите другой размер или крепление.</p>` : ""}
    <div class="option"><div class="option-head"><strong>Вы получите</strong></div><span class="muted">${whatYouGet(p, v)}</span></div>
    <div class="buy-row"><div class="qty"><button data-product-minus aria-label="Меньше">−</button><span>${state.productQty}</span><button data-product-plus aria-label="Больше">+</button></div>
      <button class="pill primary" data-add-variant ${ready ? "" : "disabled"}>${ready ? `В корзину · ${rub(price * state.productQty)}` : "Выберите размер"}</button></div>
    <div class="panel-links">${p.items ? "" : `<a class="pill try-pill" href="#/tryon?product=${p.id}" data-track="product_tryon">${icons.sparkle} Примерить в интерьере</a>`}${p.fabric ? `<a class="pill" href="#/sew?fabric=${p.fabric}&color=${v.color}" data-track="product_sew">Сшить по своим размерам</a>` : ""}<a class="pill" href="#/help?from=product-${p.id}" data-track="product_help">${icons.camera} Отправить фото консультанту</a></div>
    <div class="option"><div class="option-head"><strong>Доставка</strong><span>ориентировочно ${deliveryWindow(stock)}</span></div><span class="muted">${stock}. Стоимость рассчитывается по городу при оформлении.</span></div>
    <div class="option"><div class="option-head"><strong>Возврат</strong></div><span class="muted">${returnText(p, stock)}</span></div>`;
}

function setLines(p) {
  const v = state.pv;
  const tulles = products.filter((t) => t.cat === "tulle" && t.opts.width.includes(v.width) && t.opts.height.includes(v.height));
  const extras = ["hooks", "liv", "mira", "astrid"].map(byId);
  return [
    ...tulles.map((t) => ({ p: t, v: { color: t.colors.includes(v.color) ? v.color : t.colors[0], width: v.width, height: v.height, panels: "Одно полотно", fastening: "Шторная лента" }, qty: 1 })),
    ...extras.map((e) => ({ p: e, v: { color: e.colors.includes(v.color) ? v.color : e.colors[0], size: e.opts.size?.[0] }, qty: e.id === "hooks" && v.panels === "Пара" ? 2 : 1 }))
  ];
}

function windowSet(p) {
  const v = state.pv;
  if (!isReady(p, v)) return `<div class="set-empty">Выберите ширину и высоту штор — покажем совместимую тюль и аксессуары с общей суммой.</div>`;
  const lines = setLines(p);
  const main = variantPrice(p, v) * state.productQty;
  const total = main + lines.filter((l) => state.setSel.has(l.p.id)).reduce((s, l) => s + variantPrice(l.p, l.v) * l.qty, 0);
  return `<div class="set-list">
    <div class="set-line fixed"><input type="checkbox" checked disabled aria-label="${p.name}"><img src="${p.image}" alt=""><span><strong>${p.name}</strong><small>${variantText(p, v)} · ${state.productQty} шт.</small></span><b>${rub(main)}</b></div>
    ${lines.map((l) => `<label class="set-line"><input type="checkbox" data-set-toggle="${l.p.id}" ${state.setSel.has(l.p.id) ? "checked" : ""}><img src="${l.p.image}" alt=""><span><strong>${l.p.name}</strong><small>${variantText(l.p, l.v)} · ${l.qty} шт.</small></span><b>${rub(variantPrice(l.p, l.v) * l.qty)}</b></label>`).join("")}
    <div class="set-line muted-line"><span></span><span></span><span><strong>Карниз</strong><small>Появится после утверждения ассортимента</small></span><b>—</b></div>
  </div>
  <div class="set-total"><span>Итого за комплект</span><strong>${rub(total)}</strong></div>
  <button class="pill primary" data-add-set>Добавить комплект в корзину</button>
  <p class="muted small">Скидка за комплект включается из панели управления после расчёта экономики.</p>`;
}

function kitComposition(p) {
  const v = state.pv;
  const lines = kitLines(p, v);
  return `<div class="set-list">${lines.map((l) => `<div class="set-line"><span></span><img src="${l.p.image}" alt=""><span><strong><a href="#/product/${l.p.id}">${l.p.name}</a></strong><small>${variantText(l.p, l.v)} · ${l.qty} шт.</small></span><b>${rub(variantPrice(l.p, l.v) * l.qty)}</b></div>`).join("")}</div>
  <div class="set-total"><span>${isReady(p, v) ? "Итого за комплект" : "Цена от"}</span><strong>${rub(variantPrice(p, v))}</strong></div>`;
}

function solutionsPage(id) {
  if (id) {
    const s = solutions.find((x) => x.id === id);
    if (!s) return notFoundPage();
    const kit = s.kit && byId(s.kit);
    const items = filterProducts({ ...emptyFilter(), ...s.filter }).filter((p) => p.cat !== "sets");
    return `<main id="content" class="page">${crumbs([["Главная", "#/home"], ["Готовые решения", "#/solutions"], [s.title]])}
    <section class="shell solution-hero">
      <div class="reveal"><p class="eyebrow">Готовое решение</p><h1 class="section-title">${s.title}</h1><p class="lede">${s.promise}</p><ul class="fact-list">${s.facts.map((f) => `<li>${f}</li>`).join("")}</ul>
      <div class="row-actions">${kit ? `<a class="pill primary" href="#/product/${kit.id}" data-track="solution_kit_${s.id}">Выбрать комплект · от ${rub(minPrice(kit))}</a>` : ""}<a class="pill" href="${catalogHref(s.filter)}">Все товары для комнаты ${icons.arrow}</a></div></div>
      <img class="reveal" src="${s.image}" alt="${s.title}">
    </section>
    ${kit ? `<section class="section compact shell"><div class="window-set"><div><p class="eyebrow">Комплект</p><h2 class="section-title small">${kit.name}</h2><p class="lede">${kit.desc}</p><a class="pill primary" href="#/product/${kit.id}">Выбрать размер и цвет ${icons.arrow}</a></div><div>${(() => { const saved = state.pv; state.pv = {}; const html = kitComposition(kit); state.pv = saved; return html; })()}</div></div></section>` : ""}
    <section class="section compact shell"><h2 class="section-title small">Можно собрать самостоятельно</h2><div class="product-grid four" style="margin-top:40px">${items.map(productCard).join("")}</div></section>
    ${helpBlock(`solution-${s.id}`)}
    </main>`;
  }
  return `<main id="content" class="page">${crumbs([["Главная", "#/home"], ["Готовые решения"]])}
  <section class="shell page-head"><h1 class="section-title">Готовые решения</h1><p class="lede">Выберите комнату — шторы, тюль и аксессуары в комплекте уже сочетаются по цвету, плотности и размеру.</p></section>
  <section class="shell"><div class="solution-grid three">${solutions.map(solutionCard).join("")}</div></section>
  ${helpBlock("solutions")}</main>`;
}

function sewPage(_, q) {
  if (!state.sew || q.get("fabric")) {
    const fabric = fabricById(q.get("fabric")) || fabrics[1];
    state.sew = { fabric: fabric.id, color: fabric.colors.includes(q.get("color")) ? q.get("color") : fabric.colors[0], rod: 300, height: 260, floor: "Ровно в пол", fastening: fabric.fastenings[0], panels: 2, lining: "Без подкладки" };
  }
  return `<main id="content" class="page">${crumbs([["Главная", "#/home"], ["Пошив по размерам"]])}
  <section class="shell page-head"><h1 class="section-title">Пошив по вашим размерам</h1><p class="lede">Введите параметры — покажем расход ткани и предварительную цену. Мастер проверит замеры и подтвердит цену до раскроя.</p></section>
  <section class="shell sew-layout" data-sew>${sewForm()}</section></main>`;
}

function sewForm() {
  const s = state.sew;
  const fabric = fabricById(s.fabric);
  const radios = (name, values, current) => `<div class="choice-row">${values.map((x) => `<label class="choice-radio"><input type="radio" name="${name}" value="${x}" ${String(current) === String(x) ? "checked" : ""}><span>${name === "panels" ? (x === 1 ? "Одно полотно" : "Пара") : x}</span></label>`).join("")}</div>`;
  return `<form class="sew-form" data-sew-form>
    <div class="field"><label for="sew-fabric">Ткань</label><select id="sew-fabric" name="fabric">${fabrics.map((f) => `<option value="${f.id}" ${f.id === s.fabric ? "selected" : ""}>${f.name} · ${blackoutLabel(f.blackout)}</option>`).join("")}</select></div>
    <div class="field"><span class="label">Цвет</span><div class="swatch-checks">${fabric.colors.map((c) => `<label title="${colorName(c)}"><input type="radio" name="color" value="${c}" ${c === s.color ? "checked" : ""}><i style="background:${colors[c].hex}"></i><small>${c}</small></label>`).join("")}</div><small class="muted">${colorName(s.color)}</small></div>
    <div class="field-grid">
      <div class="field"><label for="sew-rod">Ширина карниза, см</label><input id="sew-rod" name="rod" type="number" min="60" max="800" required value="${s.rod}"><small class="muted">Между крайними крючками, без наконечников</small></div>
      <div class="field"><label for="sew-height">Высота, см</label><input id="sew-height" name="height" type="number" min="100" max="400" required value="${s.height}"><small class="muted" data-height-hint>Измеряйте ${measurePoint[s.fastening]}</small></div>
    </div>
    <div class="field"><span class="label">Положение относительно пола</span>${radios("floor", Object.keys(floorOptions), s.floor)}</div>
    <div class="field"><span class="label">Крепление</span>${radios("fastening", fabric.fastenings, s.fastening)}</div>
    <div class="field"><span class="label">Количество полотен</span>${radios("panels", [1, 2], s.panels)}</div>
    <div class="field"><span class="label">Подкладка</span>${radios("lining", fabric.linings, s.lining)}</div>
    <p class="muted small">Крепление «Французская складка» и подкладки — после подтверждения технологом. <a class="text-link" href="#/measure">Как замерить ${icons.arrow}</a></p>
  </form>
  <aside class="summary sew-result" data-sew-result>${sewResult()}</aside>`;
}

function sewResult() {
  const s = state.sew;
  const fabric = fabricById(s.fabric);
  if (!(s.rod >= 60 && s.height >= 100)) return `<h2>Расчёт</h2><p class="muted">Введите ширину карниза (от 60 см) и высоту (от 100 см).</p>`;
  const r = calcSewing({ ...s, fabric });
  return `<h2>Предварительный расчёт</h2>
    <div class="summary-row"><span>Ширина до сборки</span><strong>${r.widthBefore} см${s.panels === 2 ? ` (2 × ${r.panelWidthBefore})` : ""}</strong></div>
    <div class="summary-row"><span>Ширина в готовом виде</span><strong>${r.finishedWidth} см</strong></div>
    <div class="summary-row"><span>Высота изделия</span><strong>${r.finishedHeight} см</strong></div>
    <div class="summary-row"><span>Расход ткани</span><strong>${String(r.meters).replace(".", ",")} м${r.seamless ? "" : " · со швом"}</strong></div>
    <div class="summary-row"><span>Затемнение</span><strong>${r.blackout}</strong></div>
    <div class="summary-row"><span>Срок</span><strong>6–10 раб. дней ${todo()}</strong></div>
    <div class="summary-row total"><span>Ориентировочно</span><span>${rub(r.price)}</span></div>
    <p class="warn">Расчёт предварительный. В раскрой заказ автоматически не уходит: мастер проверит замеры и подтвердит цену.</p>
    <form data-lead="sew" class="lead-mini">
      <input type="hidden" name="Расчёт" value="${esc(`${fabric.name}, ${colorName(s.color)}, карниз ${s.rod} см, высота ${s.height} см, ${s.floor}, ${s.fastening}, полотен ${s.panels}, ${s.lining}; до сборки ${r.widthBefore} см, расход ${r.meters} м, ${r.price} ₽`)}">
      <div class="field"><label>Имя</label><input name="Имя" required autocomplete="name"></div>
      <div class="field"><label>Телефон или мессенджер</label><input name="Контакт" required autocomplete="tel"></div>
      ${consent()}
      <button class="pill primary">Отправить расчёт мастеру</button>
    </form>`;
}

const consent = () => `<label class="check consent"><input type="checkbox" name="Согласие" value="да" required><span>Согласен на <a href="#/legal/consent">обработку персональных данных</a></span></label>`;

function fabricsPage(id) {
  if (id) {
    const f = fabricById(id);
    if (!f) return notFoundPage();
    const made = products.filter((p) => p.fabric === id);
    return `<main id="content" class="page">${crumbs([["Главная", "#/home"], ["Ткани и цвета", "#/fabrics"], [f.name]])}
    <section class="shell fabric-detail">
      <div class="reveal"><p class="eyebrow">Ценовая группа ${f.group}</p><h1 class="section-title">${f.name}</h1><p class="lede">${f.text}</p>
      <div class="row-actions"><a class="pill primary" href="#/sew?fabric=${f.id}">Рассчитать пошив ${icons.arrow}</a><a class="pill" href="#/samples">Заказать образцы</a></div></div>
      <div><img class="fabric-hero-photo" src="${f.photo}" alt="Ткань ${f.name} крупным планом"><div class="color-cards">${f.colors.map((c) => `<a class="color-card" href="#/sew?fabric=${f.id}&color=${c}"><i style="background:${colors[c].hex}"></i><strong>№ ${c}</strong><span>${colors[c].name}</span></a>`).join("")}</div></div>
    </section>
    <section class="section compact shell"><dl class="spec-table">${[["Затемнение", `${f.blackout} — ${blackoutInfo[f.blackout].toLowerCase()}`], ["Состав", f.composition], ["Плотность", f.density], ["Высота без шва", `до ${f.maxHeight} см`], ["Уход", f.care], ["Возможная усадка", f.shrink], ["Крепления", f.fastenings.join(", ")], ["Подкладка", f.linings.join(", ")], ["Цена ткани", `${rub(f.pricePerMeter)} / м ${todo()}`]].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl></section>
    ${made.length ? `<section class="section compact shell"><h2 class="section-title small">Изделия из этой ткани</h2><div class="product-grid four" style="margin-top:40px">${made.map(productCard).join("")}</div></section>` : ""}
    </main>`;
  }
  return `<main id="content" class="page">${crumbs([["Главная", "#/home"], ["Ткани и цвета"]])}
  <section class="shell page-head"><h1 class="section-title">Ткани и цвета</h1><p class="lede">Единый справочник: номер оттенка, затемнение, состав и доступные крепления. Перед заказом можно получить образцы домой.</p><div class="row-actions"><a class="pill primary" href="#/samples">Заказать образцы ${icons.arrow}</a></div></section>
  <section class="shell fabric-grid">${fabrics.map((f) => `<a class="fabric-card reveal" href="#/fabrics/${f.id}"><img class="fabric-swatch" src="${f.photo}" alt="Ткань ${f.name} крупным планом" loading="lazy"><h2>${f.name}</h2><p class="muted">${f.text}</p><div class="key-facts"><span>${blackoutLabel(f.blackout)}</span><span>Группа ${f.group}</span><span>до ${f.maxHeight} см без шва</span></div>${swatchDots(f.colors)}<small class="muted">Цвета: ${f.colors.map((c) => `№ ${c}`).join(", ")}</small></a>`).join("")}</section>
  </main>`;
}

function samplesPage() {
  const all = fabrics.flatMap((f) => f.colors.map((c) => ({ key: `${f.id}:${c}`, f, c })));
  return `<main id="content" class="page">${crumbs([["Главная", "#/home"], ["Ткани и цвета", "#/fabrics"], ["Образцы"]])}
  <section class="shell page-head"><h1 class="section-title">Образцы тканей</h1><p class="lede">Выберите до пяти образцов. Проверьте цвет дома при дневном свете — экран может искажать оттенок.</p></section>
  <section class="shell samples-layout">
    <div class="sample-grid">${all.map(({ key, f, c }) => `<button class="sample ${state.samples.includes(key) ? "selected" : ""}" data-sample="${key}" aria-pressed="${state.samples.includes(key)}"><i style="background:${colors[c].hex}"></i><strong>${f.name}</strong><span>${colorName(c)}</span></button>`).join("")}</div>
    <aside class="summary"><h2>Выбрано <span data-sample-count>${state.samples.length}</span> из 5</h2><div data-sample-list class="muted">${sampleList()}</div>
      <form data-lead="samples"><input type="hidden" name="Образцы" data-sample-field value="${esc(sampleList(true))}">
      <div class="field"><label>Имя</label><input name="Имя" required></div><div class="field"><label>Телефон</label><input name="Телефон" required type="tel"></div><div class="field"><label>Адрес доставки</label><input name="Адрес" required></div>
      ${consent()}<p class="muted small">Стоимость и срок доставки образцов ${todo()}</p><button class="pill primary">Заказать образцы</button></form></aside>
  </section></main>`;
}
const sampleList = (plain) => {
  const names = state.samples.map((k) => { const [fid, c] = k.split(":"); return `${fabricById(fid).name}, ${colorName(c)}`; });
  return plain ? names.join("; ") : names.length ? names.map((n) => `<div>${n}</div>`).join("") : "Пока ничего не выбрано";
};

function measurePage() {
  return `<main id="content" class="page">${crumbs([["Главная", "#/home"], ["Как замерить"]])}
  <section class="shell page-head"><h1 class="section-title">Как замерить окно</h1><p class="lede">Замер займёт 10 минут. Карниз лучше установить заранее — мерить будем от него.</p></section>
  <section class="shell measure-layout">
    <svg class="measure-svg" viewBox="0 0 520 440" role="img" aria-label="Схема замера: ширина карниза между крайними крючками и высота от точки крепления до пола в трёх местах">
      <rect x="150" y="90" width="220" height="230" rx="4" fill="#eeebe2" stroke="#232218" stroke-width="2"/><path d="M260 90v230M150 205h220" stroke="#232218" stroke-width="1.5"/>
      <line x1="70" y1="50" x2="450" y2="50" stroke="#232218" stroke-width="4" stroke-linecap="round"/>
      ${[90, 130, 170, 210, 250, 290, 330, 370, 410, 430].map((x) => `<circle cx="${x}" cy="56" r="4" fill="none" stroke="#595b3b" stroke-width="2"/>`).join("")}
      <path d="M90 26h340" stroke="#a55735" stroke-width="2" marker-start="url(#a)" marker-end="url(#a)"/><text x="260" y="18" text-anchor="middle" font-size="14" fill="#a55735">Ширина: между крайними крючками</text>
      ${[110, 260, 410].map((x, i) => `<path d="M${x} 62v348" stroke="#595b3b" stroke-width="2" stroke-dasharray="6 5"/><text x="${x + 6}" y="${230 + i * 14}" font-size="13" fill="#595b3b">${["H1", "H2", "H3"][i]}</text>`).join("")}
      <line x1="20" y1="412" x2="500" y2="412" stroke="#232218" stroke-width="2"/><text x="260" y="434" text-anchor="middle" font-size="13" fill="#77766d">Пол · берём наименьшую из H1, H2, H3</text>
      <defs><marker id="a" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#a55735"/></marker></defs>
    </svg>
    <div>
      <ol class="measure-steps">
        <li><h3>Ширина</h3><p>Измерьте карниз между крайними крючками, без декоративных наконечников.</p></li>
        <li><h3>Высота в трёх местах</h3><p>Слева, по центру и справа — пол часто неровный. Берите наименьшее значение.</p></li>
        <li><h3>Точка замера зависит от крепления</h3><table class="gather-table"><tbody>${Object.entries(measurePoint).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</tbody></table></li>
        <li><h3>Длина относительно пола</h3><p><b>Не касается пола</b> — минус 1 см, удобно для уборки. <b>Ровно в пол</b> — классика. <b>С заломом</b> — плюс 5–10 см, мягкая волна на полу.</p></li>
      </ol>
      <p class="warn">Перед раскроем мастер обязательно проверит ваши замеры и подтвердит их с вами.</p>
      <div class="row-actions"><a class="pill primary" href="#/sew">Рассчитать пошив ${icons.arrow}</a><a class="pill" href="#/help?from=measure">Прислать фото мастеру</a></div>
    </div>
  </section></main>`;
}

function helpPage(_, q) {
  const from = esc(q.get("from") || "direct");
  return `<main id="content" class="page">${crumbs([["Главная", "#/home"], ["Помощь мастера"]])}
  <section class="shell page-head"><h1 class="section-title">Помощь мастера по фото</h1><p class="lede">Пришлите фото окна и размеры — мастер проверит замеры и предложит 2–3 готовых решения. Это бесплатно.</p></section>
  <section class="shell help-layout">
    <form class="help-form" data-lead="help">
      <input type="hidden" name="Источник" value="${from}">
      <div class="ai-upload-strip"><div><strong>Фото окна</strong><div class="muted">JPG или PNG · до 3 фото · лучше днём, окно целиком</div><div class="photo-previews" data-photo-previews></div></div><label class="pill primary" for="help-photo">Загрузить фото</label><input class="file-input" id="help-photo" name="Фото" type="file" accept="image/*" multiple></div>
      <div class="field-grid">
        <div class="field"><label for="h-w">Ширина карниза, см</label><input id="h-w" name="Ширина" type="number" min="0" placeholder="Если знаете"></div>
        <div class="field"><label for="h-h">Высота до пола, см</label><input id="h-h" name="Высота" type="number" min="0" placeholder="Если знаете"></div>
        <div class="field"><label for="h-room">Комната</label><select id="h-room" name="Комната">${Object.values(rooms).map((r) => `<option>${r}</option>`).join("")}<option>Другое</option></select></div>
        <div class="field"><label for="h-color">Желаемый цвет</label><select id="h-color" name="Цвет"><option>Подберите сами</option>${Object.keys(colors).map((c) => `<option>${colorName(c)}</option>`).join("")}</select></div>
        <div class="field"><label for="h-budget">Бюджет</label><select id="h-budget" name="Бюджет"><option>До 10 000 ₽</option><option>10 000 – 20 000 ₽</option><option>20 000 – 40 000 ₽</option><option>Больше 40 000 ₽</option></select></div>
        <div class="field"><label for="h-name">Имя</label><input id="h-name" name="Имя" required autocomplete="name"></div>
        <div class="field full"><label for="h-contact">Телефон, Telegram или WhatsApp</label><input id="h-contact" name="Контакт" required></div>
        <div class="field full"><label for="h-msg">Комментарий</label><textarea id="h-msg" name="Комментарий" placeholder="Что важно: затемнение, стиль, сроки"></textarea></div>
      </div>
      ${consent()}
      <button class="pill primary">Отправить мастеру</button>
    </form>
    <aside class="help-aside"><h2>Что будет дальше</h2><ol class="measure-steps"><li><h3>Ответим в рабочее время</h3><p>Первичный ответ — до 5 минут ${todo("график уточнить")}</p></li><li><h3>Проверим замеры</h3><p>Предупредим о рисках ошибки до оплаты.</p></li><li><h3>Предложим 2–3 решения</h3><p>С составом комплекта, ценой и сроком.</p></li></ol>
    <a class="text-link" href="#/tryon?from=help">${icons.sparkle} Хотите увидеть шторы на своём фото? Примерка ${icons.arrow}</a></aside>
  </section></main>`;
}

const tryKinds = { curtains: "curtains", tulle: "sheer tulle curtains", bedspreads: "quilted bedspread", pillows: "decorative pillow", plaids: "knitted throw blanket", accessories: "fabric curtain tie-backs" };
const tryCats = activeCats.filter((c) => c.id !== "sets");

function tryonPage(_, q) {
  state.try ||= { room: null, sel: [], cat: "curtains", q: "", color: "", result: null, busy: false, error: "", scene: null, sceneBusy: false };
  const pre = byId(q.get("product"));
  if (pre && !pre.items && !state.try.sel.some((x) => x.id === pre.id)) {
    state.try.sel = [{ id: pre.id, color: pre.colors.includes(q.get("color")) ? q.get("color") : pre.colors[0] }];
    state.try.cat = pre.cat;
    state.try.result = null;
  }
  const t = state.try;
  return `<main id="content" class="page">${crumbs([["Главная", "#/home"], ["Примерка в интерьере"]])}
  <section class="shell page-head try-head"><p class="eyebrow">${icons.sparkle} Примерка Retoria Home</p><h1 class="section-title">Примерьте наш текстиль в своём интерьере</h1><p class="lede">Загрузите фото окна, дивана или кровати, выберите товар из каталога — и сравните «до» и «после» прямо здесь.</p>${tryonSteps()}</section>
  <section class="shell try-layout">
    <div class="try-steps">
      <div class="tryon-step"><h2><b>1</b>Фото вашей комнаты</h2>
        <div class="ai-upload-strip"><div class="try-room">${t.room ? `<img src="${t.room}" alt="Ваше фото">` : ""}<div><strong>${t.room ? "Фото загружено" : "Окно, диван, кровать или стол"}</strong><div class="muted">JPG или PNG · днём и общим планом · лицо людей в кадре не нужно</div></div></div><label class="pill primary" for="try-photo">${t.room ? "Заменить фото" : "Загрузить фото"}</label><input class="file-input" id="try-photo" type="file" accept="image/jpeg,image/png,image/webp"></div>
        <div class="try-scene" data-try-scene>${tryScene()}</div>
      </div>
      <div class="tryon-step"><h2><b>2</b>Что примерить <small class="muted">до 2 товаров</small></h2>
        <div class="try-filters">
          <div class="chip-row" data-try-tabs>${tryTabs()}</div>
          <input class="try-search" data-try-search type="search" value="${esc(t.q)}" placeholder="Поиск по названию или артикулу" aria-label="Поиск товара для примерки">
          <div class="try-colors" aria-label="Фильтр по цвету"><button class="chip ${t.color ? "" : "active"}" data-try-color-filter="">Все цвета</button>${Object.entries(colors).map(([code, c]) => `<button class="try-dot ${t.color === code ? "active" : ""}" data-try-color-filter="${code}" style="background:${c.hex}" aria-label="${colorName(code)}" title="${colorName(code)}"></button>`).join("")}</div>
        </div>
        <div class="try-grid" data-try-grid>${tryGrid()}</div>
        <div class="try-selected" data-try-selected>${trySelected()}</div>
      </div>
    </div>
    <aside class="try-panel" data-try-panel>${tryPanel()}</aside>
  </section>
  ${helpBlock("tryon")}</main>`;
}

const sceneKnown = () => state.try.room && state.try.scene;
const tryTabs = () => tryCats.map((c) => { const off = sceneKnown() && !fits(c.id, state.try.scene); return `<button class="chip ${state.try.cat === c.id ? "active" : ""} ${off ? "chip-off" : ""}" data-try-cat="${c.id}" ${off ? `title="${missingText(c.id)}"` : ""}>${c.name}</button>`; }).join("");

function tryScene() {
  const t = state.try;
  if (!t.room) return "";
  if (t.sceneBusy) return `<span class="try-spinner small"></span><span>Смотрим, что на фото…</span>`;
  if (!t.scene) return "";
  const none = !Object.values(t.scene).some(Boolean);
  return `<span>На фото:</span>${Object.entries(sceneLabels).map(([k, label]) => `<button class="chip ${t.scene[k] ? "active" : ""}" data-try-scene-toggle="${k}" aria-pressed="${t.scene[k]}">${t.scene[k] ? "✓ " : ""}${label}</button>`).join("")}<small class="muted">${none ? "Не видим окна или мебели — отметьте вручную или загрузите другое фото." : "Ошиблись? Нажмите, чтобы исправить."}</small>`;
}

// Убираем из выбора то, что некуда поставить на этом фото, и переключаемся на подходящую категорию.
function applyScene() {
  const t = state.try;
  const dropped = t.sel.filter((x) => !fits(byId(x.id).cat, t.scene));
  if (dropped.length) {
    t.sel = t.sel.filter((x) => !dropped.includes(x));
    toast(`${dropped.map((x) => byId(x.id).name).join(", ")}: ${missingText(byId(dropped[0].id).cat).toLowerCase()}`);
  }
  if (!fits(t.cat, t.scene)) t.cat = tryCats.find((c) => fits(c.id, t.scene))?.id || t.cat;
  t.result = null;
  refreshTry("scene", "tabs", "grid", "selected", "panel");
}

async function detectScene() {
  const t = state.try;
  const room = t.room;
  Object.assign(t, { scene: null, sceneBusy: true });
  refreshTry("scene", "panel");
  let scene = null;
  const r = await fetch("api/scene", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ room }) }).catch(() => null);
  // Нет сервера (GitHub Pages, автономный файл) или не задан ключ — показываем демо-режим, а не блокируем товары.
  const noServer = !r || [404, 405, 501, 503].includes(r.status);
  if (!noServer) {
    const data = await r.json().catch(() => ({}));
    scene = r.ok && data.scene ? data.scene : { window: false, bed: false, sofa: false, armchair: false };
    if (!data.scene) toast("Не получилось распознать фото — отметьте, что на нём есть");
  }
  if (t.room !== room) return; // пока распознавали, загрузили другое фото
  Object.assign(t, { scene, sceneBusy: false, noServer });
  track("tryon_scene", scene);
  applyScene();
}

function tryGrid() {
  const { cat, q, color, sel } = state.try;
  const words = q.trim().toLowerCase();
  const off = sceneKnown() && !fits(cat, state.try.scene);
  const list = products.filter((p) => p.cat === cat && (!color || p.colors.includes(color)) && (!words || `${p.name} ${p.sku}`.toLowerCase().includes(words)));
  if (!list.length) return `<p class="muted">Ничего не нашлось — смените категорию или цвет.</p>`;
  const note = off ? `<p class="warn try-off">${missingText(cat)}: на вашем фото примерить не получится. Выберите другую категорию или загрузите другое фото.</p>` : "";
  return note + list.map((p) => { const on = sel.some((x) => x.id === p.id); return `<button class="try-item ${on ? "selected" : ""}" data-try-pick="${p.id}" aria-pressed="${on}" ${off ? "disabled" : ""}><img src="${p.image}" alt="" loading="lazy"><span>${p.name}</span><small>${hasFrom(p) ? "от " : ""}${rub(minPrice(p))}</small></button>`; }).join("");
}

function trySelected() {
  const { sel } = state.try;
  if (!sel.length) return `<p class="muted small">Выберите товар — потом можно уточнить цвет.</p>`;
  return sel.map(({ id, color }) => { const p = byId(id); return `<div class="try-sel"><img src="${p.image}" alt=""><div><strong>${p.name}</strong><div class="swatches">${p.colors.map((c) => `<button class="swatch ${c === color ? "selected" : ""}" data-try-item-color="${id}:${c}" style="background:${colors[c].hex}" aria-label="${colorName(c)}" aria-pressed="${c === color}"></button>`).join("")}</div><small class="muted">${colorName(color)}</small></div><button class="try-remove" data-try-remove="${id}" aria-label="Убрать ${p.name}">×</button></div>`; }).join("");
}

function tryPanel() {
  const t = state.try;
  const ready = t.room && t.sel.length && !t.busy && !t.sceneBusy && !t.noServer;
  const run = `<button class="pill primary try-run" data-try-run ${ready ? "" : "disabled"}>${t.busy ? "Примеряем…" : `${icons.sparkle} Примерить`}</button>`;
  const showRoom = t.room && !t.noServer;
  const frame = (html) => `<div class="try-frame" style="--ar:${showRoom ? t.ar : 990 / 830}">${html}</div>`;
  if (t.busy) return `${frame(`<div class="try-busy"><img src="${t.room}" alt=""><div class="try-busy-veil"><span class="try-spinner"></span><strong>Примеряем ${esc(t.sel.map((x) => byId(x.id).name).join(" и "))}</strong><span data-try-timer>0:00</span><small>Обычно 30–60 секунд. Не закрывайте страницу.</small></div></div>`)}${run}`;
  if (t.result) {
    const main = byId(t.sel[0].id);
    return `${frame(comparison(t.room, t.result))}
      <p class="muted small">Визуализация приблизительная: оттенок на экране может отличаться. Точный цвет — по <a class="text-link" href="#/samples">образцу ткани</a>.</p>
      <div class="row-actions try-actions"><a class="pill primary" href="#/product/${main.id}">В карточку товара ${icons.arrow}</a>${run.replace(`${icons.sparkle} Примерить`, "Примерить снова")}<a class="pill" href="${t.result}" download="retoria-primerka.png">Скачать</a><a class="pill" href="#/help?from=tryon-result">Обсудить с мастером</a></div>`;
  }
  return `${frame(showRoom ? `<img class="try-photo" src="${t.room}" alt="Ваше фото">` : comparison())}
    ${t.noServer ? `<p class="warn">Это демо-версия сайта без сервера: AI-примерка работает в полной версии. Выше — пример результата.</p>` : t.error ? `<p class="warn">${esc(t.error)}</p>` : ""}
    <p class="muted small">${t.room ? (t.sel.length ? "Всё готово — нажмите «Примерить»." : "Теперь выберите товар слева.") : "Пример результата. Загрузите своё фото, чтобы примерить."}</p>
    ${run}`;
}

const refreshTry = (...parts) => parts.forEach((part) => { const el = document.querySelector(`[data-try-${part}]`); if (el) el.innerHTML = { tabs: tryTabs, grid: tryGrid, selected: trySelected, panel: tryPanel, scene: tryScene }[part](); });

// Уменьшаем фото в браузере: быстрее, дешевле и проходит в лимит тела запроса.
function imageToDataUrl(src, max) {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(im.naturalWidth * k);
      c.height = Math.round(im.naturalHeight * k);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      resolve({ url: c.toDataURL("image/jpeg", .86), ar: c.width / c.height });
    };
    im.onerror = () => reject(new Error("Не удалось прочитать фото"));
    im.src = src;
  });
}

async function runTryon() {
  const t = state.try;
  t.busy = true; t.error = ""; t.result = null;
  refreshTry("panel");
  const started = Date.now();
  const timer = setInterval(() => { const el = document.querySelector("[data-try-timer]"); const s = Math.round((Date.now() - started) / 1000); if (el) el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }, 500);
  track("tryon_start", { items: t.sel.map((x) => x.id) });
  try {
    const items = await Promise.all(t.sel.map(async ({ id, color }) => {
      const p = byId(id);
      return { name: p.name, kind: tryKinds[p.cat], cat: p.cat, colorName: colors[color].en, colorHex: colors[color].hex, image: (await imageToDataUrl(p.image, 768)).url };
    }));
    const r = await fetch("api/tryon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ room: t.room, items, scene: t.scene }) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.image) throw new Error(data.error || "Сервис примерки недоступен");
    t.result = data.image;
    track("tryon_done", { items: t.sel.map((x) => x.id), seconds: Math.round((Date.now() - started) / 1000) });
  } catch (err) {
    t.error = location.protocol === "file:" ? "Примерка работает на сайте с сервером — в автономном файле она недоступна." : err.message;
  } finally {
    clearInterval(timer);
    t.busy = false;
    refreshTry("panel");
  }
}

function aboutPage() {
  const steps = [["Проверка размеров", "Мастер сверяет замеры клиента до раскроя."], ["Раскрой", "Режем по утверждённой карте, учитываем направление рисунка."], ["Пошив", "Шторная лента, люверсы или петли — по выбранному креплению."], ["Отпаривание", "Изделие получает аккуратную форму складок."], ["Контроль", "Проверяем швы, размеры и цвет при дневном свете."], ["Упаковка", "Складываем без заломов, вкладываем инструкцию по уходу."]];
  return `<main id="content" class="page">${crumbs([["Главная", "#/home"], ["О бренде"]])}
  <section class="shell page-head"><p class="eyebrow">Retoria Home · Тверь</p><h1 class="section-title">Шьём в Твери. Отвечаем за каждый заказ</h1><p class="lede">Retoria Home — бренд готовых текстильных решений: начинаем с удобного оформления окна и расширяемся до комнаты и дома. ${todo("история бренда — текст от собственника")}</p></section>
  <section class="shell"><ol class="prod-steps">${steps.map(([t, d], i) => `<li class="reveal">${photoPh(`Фото: ${t.toLowerCase()}`)}<span>${String(i + 1).padStart(2, "0")}</span><h3>${t}</h3><p class="muted">${d}</p></li>`).join("")}</ol></section>
  <section class="section compact shell"><div class="trust-row"><div><h3>Команда</h3><p class="muted">Мастера, технолог и менеджеры, которые проверяют замеры. ${todo("фото и имена")}</p></div><div><h3>Сроки</h3><p class="muted">Стандартный заказ — 1–2 рабочих дня производства после подтверждения замеров. ${todo("подтвердить с руководителем производства")}</p></div><div><h3>Контроль качества</h3><p class="muted">Чек-лист комплекта перед передачей в доставку.</p></div></div></section>
  ${helpBlock("about")}</main>`;
}

function buyersPage() {
  const careItems = [["Стирка", "Деликатный режим 30 °C без отжима, если иное не указано на ярлыке."], ["Сушка", "Вешайте влажными на карниз — складки расправятся сами."], ["Глажка", "С изнанки, через влажную ткань. Блэкаут не гладить при высокой температуре."]];
  return `<main id="content" class="page">${crumbs([["Главная", "#/home"], ["Покупателям"]])}
  <section class="shell page-head"><h1 class="section-title">Покупателям</h1><nav class="chip-row" aria-label="Разделы">${[["delivery", "Доставка и оплата"], ["returns", "Возврат и обмен"], ["faq", "Вопросы и ответы"], ["care", "Уход"], ["contacts", "Контакты"], ["tracking", "Отслеживание заказа"]].map(([id, t]) => `<a class="chip" href="#/buyers#${id}">${t}</a>`).join("")}</nav></section>
  <section class="shell info-section" id="delivery"><h2>Доставка и оплата</h2><div class="trust-row"><div><h3>Курьер до двери</h3><p class="muted">По всей России. Стоимость рассчитывается до оплаты по городу и весу.</p></div><div><h3>Пункт выдачи</h3><p class="muted">Ближайший ПВЗ выбирается при оформлении.</p></div><div><h3>Оплата</h3><p class="muted">Банковская карта и СБП на защищённой странице банка, онлайн-чек. Оплата при получении — если доступна в вашем городе.</p></div></div><p class="muted">Оператор доставки и тарифы ${todo("утверждает собственник")}</p></section>
  <section class="shell info-section" id="returns"><h2>Возврат и обмен</h2><div class="trust-row"><div><h3>Готовые изделия</h3><p class="muted">Обмен и возврат в течение 14 дней при сохранении товарного вида.</p></div><div><h3>По индивидуальным размерам</h3><p class="muted">Возврат возможен только при браке.</p></div><div><h3>Брак или повреждение</h3><p class="muted">Пришлите фото — первичный ответ в день обращения, замена за наш счёт.</p></div></div><p class="muted">Все условия ${todo("утверждают собственник и юрист")}</p></section>
  <section class="shell info-section" id="faq"><h2>Вопросы и ответы</h2>${faqList()}</section>
  <section class="shell info-section" id="care"><h2>Уход</h2><div class="trust-row">${careItems.map(([t, d]) => `<div><h3>${t}</h3><p class="muted">${d}</p></div>`).join("")}</div></section>
  <section class="shell info-section" id="contacts"><h2>Контакты</h2><div class="trust-row"><div><h3>Телефон</h3><p>${todo("номер")}</p><p class="muted">График работы ${todo()}</p></div><div><h3>Мессенджеры</h3><p>Telegram · WhatsApp · VK ${todo("ссылки")}</p></div><div><h3>Производство</h3><p>Тверь ${todo("адрес")}</p><p class="muted">E-mail ${todo()}</p></div></div></section>
  <section class="shell info-section" id="tracking"><h2>Отслеживание заказа</h2><form class="track-form" data-track-form><div class="field"><label for="track-no">Номер заказа</label><input id="track-no" name="no" required placeholder="RH-000000"></div><button class="pill primary">Проверить</button></form><div data-track-result></div></section>
  ${helpBlock("buyers")}</main>`;
}

const orderStatuses = ["Заказ принят", "Проверка замеров", "Пошив и комплектация", "Передан в доставку", "Получен"];
const statusList = (step = 0) => `<ol class="status-list">${orderStatuses.map((s, i) => `<li class="${i <= step ? "done" : ""}">${s}</li>`).join("")}</ol>`;

function reviewsPage() {
  const avg = (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1);
  return `<main id="content" class="page">${crumbs([["Главная", "#/home"], ["Отзывы"]])}
  <section class="shell page-head"><h1 class="section-title">Отзывы и реальные интерьеры</h1><p class="lede">★ ${avg} · ${reviews.length} ${plural(reviews.length, "отзыв", "отзыва", "отзывов")}. Публикуем только с согласия покупателя. ${todo("демо-отзывы — заменить реальными")}</p></section>
  <section class="shell"><div class="review-toolbar"><label class="select-field"><span>Комната</span><select data-review-filter="room"><option value="">Все комнаты</option>${Object.entries(rooms).map(([id, n]) => `<option value="${id}">${n}</option>`).join("")}</select></label><label class="select-field"><span>Товар</span><select data-review-filter="product"><option value="">Все товары</option>${[...new Set(reviews.map((r) => r.product))].map((id) => `<option value="${id}">${byId(id).name}</option>`).join("")}</select></label></div>
  <div class="review-grid">${reviews.map(reviewCard).join("")}</div></section></main>`;
}

function favoritesPage() {
  const saved = products.filter((p) => state.favorites.includes(p.id));
  return `<main id="content" class="page">${crumbs([["Главная", "#/home"], ["Избранное"]])}<section class="section compact shell favorites-page">
    <div class="favorites-heading"><h1 class="section-title">Избранное</h1><span class="muted">${saved.length} ${plural(saved.length, "товар", "товара", "товаров")}</span></div>
    ${saved.length ? `<div class="product-grid favorites-grid">${saved.map(productCard).join("")}</div>` : `<div class="favorites-empty"><span class="favorites-empty-icon">${icons.heart}</span><h2>Пока ничего не сохранено</h2><p>Отмечайте понравившиеся товары сердцем — они останутся здесь.</p><a class="pill primary" href="#/catalog">Перейти в каталог ${icons.arrow}</a></div>`}
  </section></main>`;
}

const flowHeader = (current, title) => `${crumbs([["Главная", "#/home"], ["Корзина", "#/cart"], ...(current > 1 ? [[title]] : [])])}<div class="shell flow-header"><div><p class="eyebrow">Оформление заказа</p><h1 class="section-title small">${title}</h1></div><div class="steps"><span class="step ${current === 1 ? "active" : ""}">01 Корзина</span><span class="step ${current === 2 ? "active" : ""}">02 Доставка</span><span class="step ${current === 3 ? "active" : ""}">03 Оплата</span></div></div>`;

function deliveryCost(city, method) {
  const c = (city || "").trim().toLowerCase();
  if (!c) return null;
  const t = c.startsWith("тверь") ? [300, 0] : /москва|санкт-петербург|спб/.test(c) ? [490, 290] : [790, 390];
  return method === "Пункт выдачи" ? t[1] : t[0];
}

function summaryCard(next, label) {
  const ship = deliveryCost(state.order.city, state.order.method || "Курьер до двери");
  const total = subtotal() + (ship || 0);
  return `<h2>Ваш заказ</h2><div class="summary-row"><span>Товары, ${cartQty()} шт.</span><strong>${rub(subtotal())}</strong></div>
    <div class="summary-row"><span>Доставка</span><strong>${ship == null ? "на следующем шаге" : ship ? rub(ship) : "0 ₽"}</strong></div>
    <div class="summary-row total"><span>Итого</span><span>${rub(total)}</span></div>
    ${next ? `<a class="pill primary" href="${next}" data-next>${label} ${icons.arrow}</a>` : ""}
    <p class="muted small">Изделия по индивидуальным размерам оплачиваются после подтверждения замеров мастером.</p>`;
}

function cartRows() {
  const groups = [];
  state.cart.forEach((l) => { const g = l.group ? groups.find((x) => x.id === l.group) : null; if (g) g.lines.push(l); else groups.push({ id: l.group, name: l.groupName, lines: [l] }); });
  const row = (l) => { const p = byId(l.id); return `<article class="cart-item"><img src="${p.image}" alt="${p.name}"><div><h3><a href="#/product/${p.id}">${p.name}</a></h3><span class="muted">${variantText(p, l.v)}</span><div class="actions"><div class="qty"><button data-cart-minus="${esc(l.key)}" aria-label="Меньше">−</button><span>${l.qty}</span><button data-cart-plus="${esc(l.key)}" aria-label="Больше">+</button></div><button data-remove="${esc(l.key)}" class="muted">Удалить</button></div></div><strong class="price">${rub(lineTotal(l))}</strong></article>`; };
  return groups.map((g) => g.id ? `<div class="cart-group"><div class="cart-group-head"><strong>${g.name}</strong><span class="muted">${g.lines.length} ${plural(g.lines.length, "позиция", "позиции", "позиций")} · ${rub(g.lines.reduce((s, l) => s + lineTotal(l), 0))}</span><button class="muted" data-remove-group="${g.id}">Удалить комплект</button></div>${g.lines.map(row).join("")}</div>` : g.lines.map(row).join("")).join("");
}

function cartPage() {
  if (!state.cart.length) return `<main id="content" class="page">${flowHeader(1, "Корзина")}<section class="shell"><div class="empty-state"><h2>Корзина пуста</h2><p>Начните с готового решения для комнаты — так проще всего.</p><div class="row-actions"><a class="pill primary" href="#/solutions">Готовые решения</a><a class="pill" href="#/catalog">Каталог</a></div></div></section></main>`;
  const inCart = new Set(state.cart.map((l) => l.id));
  const addons = products.filter((p) => ["accessories", "pillows", "plaids", "bedspreads"].includes(p.cat) && !inCart.has(p.id)).slice(0, 3);
  return `<main id="content" class="page">${flowHeader(1, "Корзина")}<section class="section compact shell" style="padding-top:25px"><div class="checkout-layout"><div><div class="cart-list">${cartRows()}</div>
  ${addons.length ? `<div style="margin-top:65px"><p class="eyebrow">Добавить к заказу</p><div class="addon-grid">${addons.map((p) => `<article class="addon"><img src="${p.image}" alt="${p.name}"><div><h3>${p.name}</h3><div>${hasFrom(p) ? "от " : ""}${rub(minPrice(p))}</div><button class="text-link" data-quick-add="${p.id}">＋ Добавить</button></div></article>`).join("")}</div></div>` : ""}</div>
  <aside class="summary" data-summary>${summaryCard("#/delivery", "Перейти к доставке")}</aside></div></section></main>`;
}

function deliveryPage() {
  if (!state.cart.length) return cartPage();
  const o = state.order;
  const dates = [2, 3, 4, 5, 6].map((n) => dateFmt.format(inDays(n)));
  const val = (k, d = "") => esc(o[k] ?? d);
  return `<main id="content" class="page">${flowHeader(2, "Доставка")}<section class="section compact shell" style="padding-top:25px"><div class="checkout-layout"><form data-checkout-form novalidate>
  <div class="form-section"><h2>Получатель</h2><div class="field-grid"><div class="field"><label for="d-name">Имя</label><input id="d-name" name="name" required autocomplete="name" value="${val("name")}"></div><div class="field"><label for="d-phone">Телефон</label><input id="d-phone" name="phone" required type="tel" autocomplete="tel" value="${val("phone")}"></div><div class="field full"><label for="d-email">E-mail</label><input id="d-email" name="email" required type="email" autocomplete="email" value="${val("email")}"></div></div></div>
  <div class="form-section"><h2>Способ доставки</h2><div class="delivery-grid">${["Курьер до двери", "Пункт выдачи"].map((m) => `<label class="delivery-option ${(o.method || "Курьер до двери") === m ? "selected" : ""}"><input type="radio" name="method" value="${m}" ${(o.method || "Курьер до двери") === m ? "checked" : ""}><strong>${m}</strong><span class="muted">Стоимость — после ввода города</span></label>`).join("")}</div></div>
  <div class="form-section"><h2>Адрес и время</h2><div class="field-grid"><div class="field full"><label for="d-city">Город</label><input id="d-city" name="city" required list="cities" value="${val("city")}" autocomplete="address-level2"><datalist id="cities"><option>Тверь</option><option>Москва</option><option>Санкт-Петербург</option></datalist></div><div class="field full"><label for="d-street">Улица</label><input id="d-street" name="street" required value="${val("street")}" autocomplete="address-line1"></div><div class="field"><label for="d-house">Дом</label><input id="d-house" name="house" required value="${val("house")}"></div><div class="field"><label for="d-flat">Квартира</label><input id="d-flat" name="flat" value="${val("flat")}"></div>
  <div class="field"><label for="d-date">Дата доставки</label><select id="d-date" name="date">${dates.map((d) => `<option ${o.date === d ? "selected" : ""}>${d}</option>`).join("")}</select></div><div class="field"><label for="d-time">Время доставки</label><select id="d-time" name="time">${["10:00–14:00", "14:00–18:00", "18:00–22:00"].map((t) => `<option ${o.time === t ? "selected" : ""}>${t}</option>`).join("")}</select></div>
  <div class="field full"><label for="d-comment">Комментарий курьеру</label><textarea id="d-comment" name="comment" placeholder="Код домофона, этаж или пожелания">${val("comment")}</textarea></div></div></div>
  <button class="pill primary" data-go="#/payment">Сохранить и перейти к оплате ${icons.arrow}</button></form>
  <aside class="summary" data-summary>${summaryCard()}</aside></div></section></main>`;
}

function paymentPage() {
  if (!state.cart.length) return cartPage();
  if (!state.order.city) return deliveryPage();
  const pay = state.order.payment || "Банковская карта";
  return `<main id="content" class="page">${flowHeader(3, "Оплата")}<section class="section compact shell" style="padding-top:25px"><div class="checkout-layout"><form data-pay-form>
  <div class="form-section"><h2>Способ оплаты</h2>${[["Банковская карта", "МИР · Visa · Mastercard"], ["СБП", "Оплата по QR-коду в приложении банка"], ["При получении", "Картой или наличными, если доступно в городе"]].map(([t, d]) => `<label class="payment-option ${pay === t ? "selected" : ""}"><input type="radio" name="payment" value="${t}" ${pay === t ? "checked" : ""}><span><strong>${t}</strong><br><small class="muted">${d}</small></span></label>`).join("")}
  <p class="muted small">Оплата картой и по СБП проходит на защищённой странице банка — сайт не получает и не хранит данные карты. Онлайн-чек придёт на ${esc(state.order.email)}.</p></div>
  <div class="form-section"><h2>Доставка</h2><p>${esc(state.order.method)} · ${esc(state.order.city)}, ${esc(state.order.street)}, ${esc(state.order.house)}${state.order.flat ? `–${esc(state.order.flat)}` : ""}<br><span class="muted">${esc(state.order.date)}, ${esc(state.order.time)} · <a href="#/delivery">Изменить</a></span></p></div>
  ${consent()}
  <button class="pill primary">${pay === "При получении" ? "Оформить заказ" : "Перейти к оплате"} · ${rub(subtotal() + (deliveryCost(state.order.city, state.order.method) || 0))}</button></form>
  <aside class="summary" data-summary>${summaryCard()}</aside></div></section></main>`;
}

function confirmationPage() {
  const order = load("retoria-orders", [])[0];
  if (!order) return notFoundPage();
  return `<main id="content" class="page"><section class="section shell"><div class="success-mark">✓</div><p class="eyebrow">Заказ № ${order.no}</p><h1 class="section-title">Спасибо за заказ</h1><p class="lede">Мы сообщим о каждом этапе изготовления и доставки. Подтверждение отправлено на ${esc(order.email)}.</p>
  <div class="confirmation-grid"><div class="confirmation-card"><h2>Статус</h2>${statusList(0)}<p class="muted small">После получения пришлём инструкцию по уходу и попросим оставить отзыв.</p></div>
  <div class="confirmation-card"><h2>Доставка</h2><p><strong>${esc(order.date)}, ${esc(order.time)}</strong></p><p class="muted">${esc(order.method)} · ${esc(order.city)}, ${esc(order.street)}, ${esc(order.house)}${order.flat ? `–${esc(order.flat)}` : ""}<br>Получатель: ${esc(order.name)} · ${esc(order.phone)}</p><p>Оплата: ${esc(order.payment)}</p></div>
  <div class="confirmation-card wide"><h2>Состав заказа · ${rub(order.total)}</h2>${order.lines.map((l) => `<div class="order-mini"><img src="${byId(l.id).image}" alt=""><div><strong>${byId(l.id).name}</strong>${l.groupName ? ` <span class="muted">· ${l.groupName}</span>` : ""}<br><span class="muted">${variantText(byId(l.id), l.v)} · ${l.qty} шт.</span></div></div>`).join("")}</div></div>
  <div class="row-actions" style="margin-top:40px"><a class="pill primary" href="#/catalog">Вернуться в каталог ${icons.arrow}</a><a class="pill" href="#/account">Личный кабинет</a></div></section></main>`;
}

function accountPage() {
  const orders = load("retoria-orders", []);
  return `<main id="content" class="page">${crumbs([["Главная", "#/home"], ["Личный кабинет"]])}
  <section class="shell page-head"><h1 class="section-title">Личный кабинет</h1><p class="lede">Вход по номеру телефона. На InSales подключается штатный кабинет покупателя.</p></section>
  <section class="shell account-layout"><form class="summary" data-account-form><h2>Вход</h2><div class="field"><label for="acc-phone">Телефон</label><input id="acc-phone" type="tel" required placeholder="+7"></div><button class="pill primary">Получить код</button></form>
  <div><h2 class="section-title small">История заказов</h2>${orders.length ? orders.map((o) => `<div class="order-row"><div><strong>№ ${o.no}</strong><span class="muted"> · ${o.created} · ${rub(o.total)}</span></div>${statusList(0)}</div>`).join("") : `<p class="muted">Заказов пока нет. История покупок поможет подобрать текстиль для следующей комнаты.</p>`}
  <div class="row-actions"><a class="pill" href="#/favorites">Избранное</a><a class="pill" href="#/buyers#tracking">Отследить заказ</a></div></div></section></main>`;
}

function searchPage(_, q) {
  const term = q.get("q") || "";
  return `<main id="content" class="page">${crumbs([["Главная", "#/home"], ["Поиск"]])}
  <section class="shell page-head"><h1 class="section-title small">Поиск</h1><form data-search-form role="search"><input class="search-input" data-search-input type="search" value="${esc(term)}" placeholder="Название, артикул, ткань, цвет или комната" aria-label="Поиск по каталогу" autofocus></form></section>
  <section class="shell" data-search-results>${searchResults(term)}</section></main>`;
}

function searchResults(term) {
  const t = term.trim().toLowerCase();
  if (!t) return `<p class="muted">Например: «блэкаут», «RH-C-101», «оливковый», «детская».</p>`;
  const hay = (p) => [p.name, p.sku, fabricById(p.fabric)?.name, ...(p.colors || []).map((c) => `${colors[c].name} ${c}`), ...(p.rooms || []).map((r) => rooms[r]), catById(p.cat).name, p.blackout].join(" ").toLowerCase();
  const found = products.filter((p) => t.split(/\s+/).every((w) => hay(p).includes(w)));
  return found.length ? `<p class="muted">Найдено: ${found.length}</p><div class="product-grid four">${found.map(productCard).join("")}</div>` : `<div class="empty-state"><h2>Ничего не нашлось</h2><p>Попробуйте другое слово или спросите мастера.</p><a class="pill primary" href="#/help?from=search">Помощь консультанта</a></div>`;
}

function legalPage(id) {
  const titles = { policy: "Политика конфиденциальности", offer: "Публичная оферта", consent: "Согласие на обработку персональных данных", requisites: "Реквизиты продавца" };
  if (!titles[id]) return notFoundPage();
  return `<main id="content" class="page">${crumbs([["Главная", "#/home"], [titles[id]]])}<section class="shell page-head"><h1 class="section-title small">${titles[id]}</h1><p class="lede">Текст готовят и утверждают собственник и юрист до публикации. ${todo()}</p></section></main>`;
}

function notFoundPage() {
  return `<main id="content" class="page"><section class="shell page-head center"><p class="eyebrow">Ошибка 404</p><h1 class="section-title">Такой страницы нет</h1><p class="lede">Возможно, ссылка устарела. Начните с каталога или готовых решений.</p><div class="row-actions"><a class="pill primary" href="#/catalog">Каталог</a><a class="pill" href="#/solutions">Готовые решения</a></div></section></main>`;
}

const routes = {
  "/home": homePage, "/catalog": catalogPage, "/product": productPage, "/solutions": solutionsPage, "/sew": sewPage,
  "/fabrics": fabricsPage, "/samples": samplesPage, "/measure": measurePage, "/help": helpPage, "/tryon": tryonPage, "/ai": tryonPage,
  "/about": aboutPage, "/buyers": buyersPage, "/contacts": buyersPage, "/reviews": reviewsPage, "/favorites": favoritesPage,
  "/cart": cartPage, "/delivery": deliveryPage, "/payment": paymentPage, "/confirmation": confirmationPage,
  "/account": accountPage, "/search": searchPage, "/legal": legalPage
};

function parseHash() {
  const raw = location.hash.slice(1) || "/home";
  const [pathQ, anchor] = raw.split("#");
  const [path, qs = ""] = pathQ.split("?");
  const seg = path.split("/").filter(Boolean);
  return { route: `/${seg[0] || "home"}`, param: seg[1], query: new URLSearchParams(qs), anchor: anchor || (seg[0] === "contacts" ? "contacts" : ""), path };
}

/* ---------- Motion ---------- */

let lenis;
let lenisTicker;
let motionContext;
let motionCleanup = [];
let activePath = "";

function addMotionListener(element, event, handler) {
  element.addEventListener(event, handler);
  motionCleanup.push(() => element.removeEventListener(event, handler));
}

function initPointerMotion() {
  if (reduceMotion || matchMedia("(pointer: coarse)").matches) return;
  document.querySelectorAll(".pill:not([disabled]), .quick-add").forEach((element) => {
    const xTo = gsap.quickTo(element, "x", { duration: .48, ease: "power3.out" });
    const yTo = gsap.quickTo(element, "y", { duration: .48, ease: "power3.out" });
    addMotionListener(element, "pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      xTo((event.clientX - rect.left - rect.width / 2) * .12);
      yTo((event.clientY - rect.top - rect.height / 2) * .2);
    });
    addMotionListener(element, "pointerleave", () => { xTo(0); yTo(0); });
  });
  document.querySelectorAll(".solution-card, .cat-tile").forEach((card) => {
    const xTo = gsap.quickTo(card, "rotationY", { duration: .55, ease: "power3.out" });
    const yTo = gsap.quickTo(card, "rotationX", { duration: .55, ease: "power3.out" });
    addMotionListener(card, "pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      xTo(((event.clientX - rect.left) / rect.width - .5) * 2.2);
      yTo(-((event.clientY - rect.top) / rect.height - .5) * 2.2);
    });
    addMotionListener(card, "pointerleave", () => { xTo(0); yTo(0); });
  });
}

function initMotion() {
  motionContext?.revert();
  ScrollTrigger.getAll().forEach((t) => t.kill());
  if (lenis) lenis.destroy();
  if (lenisTicker) gsap.ticker.remove(lenisTicker);
  motionCleanup.forEach((cleanup) => cleanup());
  motionCleanup = [];
  if (!document.querySelector(".motion-progress")) document.body.insertAdjacentHTML("beforeend", '<div class="motion-progress" aria-hidden="true"></div>');

  if (reduceMotion) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.remove("reveal"));
    gsap.set(".motion-progress", { display: "none" });
    return;
  }
  lenis = new Lenis({ lerp: .082, smoothWheel: true, wheelMultiplier: .9 });
  lenis.on("scroll", ScrollTrigger.update);
  lenisTicker = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(lenisTicker);
  gsap.ticker.lagSmoothing(0);

  motionContext = gsap.context(() => {
    if (document.querySelector(".home-hero")) {
      gsap.timeline({ defaults: { ease: "power4.out" } })
        .fromTo(".home-hero > img", { scale: 1.075 }, { scale: 1.025, duration: 1.7, ease: "power2.out" })
        .fromTo(".hero-card > *", { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .1, duration: .9 }, .2)
        .fromTo(".cat-tile", { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .06, duration: .8 }, .5);
    } else {
      const heading = document.querySelector("main h1");
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo("main", { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, clearProps: "transform" });
      if (heading) tl.fromTo(heading, { y: 30, clipPath: "inset(0 0 100% 0)" }, { y: 0, clipPath: "inset(0 0 0% 0)", duration: 1 }, .12);
    }
    gsap.set(".reveal", { y: 34, autoAlpha: 0, filter: "blur(7px)" });
    ScrollTrigger.batch(".reveal", {
      start: "top 88%", once: true, interval: .08, batchMax: 6,
      onEnter: (batch) => gsap.to(batch, { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: .95, stagger: .075, ease: "power4.out", overwrite: true, onComplete: () => gsap.set(batch, { clearProps: "transform,filter" }) })
    });
    document.querySelectorAll(".home-hero > img").forEach((image) => {
      gsap.to(image, { yPercent: 3.5, ease: "none", scrollTrigger: { trigger: image.parentElement, start: "top top", end: "bottom top", scrub: 1.15 } });
    });
    const progress = document.querySelector(".motion-progress");
    gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => gsap.set(progress, { scaleX: self.progress }) });
  }, document.querySelector("#app"));

  initPointerMotion();
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

/* ---------- Рендер и события ---------- */

function render() {
  const { route, param, query, anchor, path } = parseHash();
  const page = routes[route];
  activePath = path;
  document.body.classList.remove("menu-open");
  document.querySelector("#app").innerHTML = header() + (page ? page(param, query) : notFoundPage()) + footer();
  document.title = `${document.querySelector("main h1")?.textContent.trim() || "Retoria Home"} — Retoria Home`;
  window.scrollTo(0, 0);
  if (route === "/catalog") updateCatalog();
  initCarousel();
  requestAnimationFrame(() => {
    initMotion();
    if (anchor) { const el = document.getElementById(anchor); if (el) lenis ? lenis.scrollTo(el, { offset: -100, immediate: true }) : el.scrollIntoView(); }
  });
}

function transitionRender() {
  const { path, anchor } = parseHash();
  if (path === activePath && anchor) {
    const target = document.getElementById(anchor);
    if (target) lenis ? lenis.scrollTo(target, { offset: -100 }) : target.scrollIntoView();
    return;
  }
  if (reduceMotion || !document.querySelector("#app main")) return render();
  lenis?.stop();
  gsap.to("#app", { y: -10, autoAlpha: 0, duration: .24, ease: "power2.in" });
  // Рендер по таймеру, а не onComplete: в фоновой вкладке rAF стоит, и переход бы завис.
  clearTimeout(window.__route);
  window.__route = setTimeout(() => { gsap.killTweensOf("#app"); gsap.set("#app", { y: 0, autoAlpha: 1 }); render(); }, 240);
}

let carouselTimer;
function initCarousel() {
  clearInterval(carouselTimer);
  const track = document.querySelector("[data-carousel-track]");
  if (!track) return;
  const root = track.closest("[data-carousel]");
  const bar = root.querySelector("[data-carousel-bar]");
  const sync = () => bar.style.transform = `scaleX(${Math.min(1, (track.scrollLeft + track.clientWidth) / track.scrollWidth)})`;
  root.go = (dir) => {
    const step = track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    const atStart = track.scrollLeft <= 4;
    const left = dir > 0 && atEnd ? 0 : dir < 0 && atStart ? track.scrollWidth : track.scrollLeft + dir * step;
    track.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
  };
  track.addEventListener("scroll", sync, { passive: true });
  sync();
  // Пауза, пока человек смотрит карточки; автопрокрутки нет при reduced motion.
  root.addEventListener("pointerenter", () => root.hold = true);
  root.addEventListener("pointerleave", () => root.hold = false);
  root.addEventListener("focusin", () => root.hold = true);
  root.addEventListener("focusout", () => root.hold = false);
  root.addEventListener("touchstart", () => { root.hold = true; clearTimeout(root.release); }, { passive: true });
  root.addEventListener("touchend", () => { root.release = setTimeout(() => root.hold = false, 6000); }, { passive: true });
  if (reduceMotion) root.dataset.paused = "true";
  carouselTimer = setInterval(() => { if (root.dataset.paused !== "true" && !root.hold && !document.hidden && root.isConnected) root.go(1); }, 4000);
}

function refreshProduct() {
  const p = byId(state.pid);
  const panel = document.querySelector("[data-panel]");
  if (!p || !panel) return;
  panel.innerHTML = productPanel(p);
  const set = document.querySelector("[data-set]");
  if (set) set.innerHTML = p.items ? kitComposition(p) : windowSet(p);
  const main = document.querySelector("[data-main-image]");
  const src = p.colorImages?.[state.pv.color];
  if (main && src) main.src = src;
}

function refreshSummary() {
  document.querySelectorAll("[data-summary]").forEach((el) => el.innerHTML = summaryCard(el.querySelector("[data-next]")?.getAttribute("href"), "Перейти к доставке"));
}

function saveLead(form) {
  const type = form.dataset.lead;
  const data = {};
  for (const [k, v] of new FormData(form)) { const val = v instanceof File ? v.name : v; if (val) data[k] = data[k] ? `${data[k]}, ${val}` : val; }
  const lead = { type, ...data, Источник: data["Источник"] || parseHash().path, UTM: getUtm(), Дата: new Date().toLocaleString("ru-RU") };
  save("retoria-leads", [lead, ...load("retoria-leads", [])]);
  track(`lead_${type}`, { source: lead["Источник"] });
  form.outerHTML = `<div class="lead-done"><div class="success-mark">✓</div><h3>Заявка отправлена</h3><p class="muted">Мастер свяжется с вами в рабочее время. В CRM ушло:</p><dl>${Object.entries(lead).filter(([k]) => k !== "type" && k !== "UTM").map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div>`;
  if (type === "samples") { state.samples = []; }
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("button, a, [data-sample]");
  if (!t) return;
  const d = t.dataset;
  if (d.track) track(d.track);
  if (d.menu !== undefined) { const open = document.body.classList.toggle("menu-open"); t.setAttribute("aria-expanded", open); return; }
  if (t.closest(".mobile-menu")) document.body.classList.remove("menu-open");
  if (d.quickAdd) {
    e.preventDefault();
    const p = byId(d.quickAdd);
    const v = defaultVariant(p);
    p.items ? addKit(p, v, 1) : addToCart(p.id, v, 1);
    toast(`${p.name} в корзине${p.opts.width ? `: ${variantText(p, { width: v.width, height: v.height })}. Размер можно изменить в карточке` : ""}`);
    if (parseHash().route === "/cart") render();
    return;
  }
  if (d.favorite) {
    e.preventDefault();
    const id = d.favorite;
    const saved = !state.favorites.includes(id);
    state.favorites = saved ? [...state.favorites, id] : state.favorites.filter((x) => x !== id);
    save("retoria-favorites", state.favorites);
    if (parseHash().route === "/favorites") return render();
    document.querySelectorAll(`[data-favorite="${id}"]`).forEach((b) => { b.classList.toggle("selected", saved); b.setAttribute("aria-pressed", saved); b.setAttribute("aria-label", saved ? "Удалить из избранного" : "Добавить в избранное"); });
    toast(saved ? `${byId(id).name} в избранном` : `${byId(id).name} удалён из избранного`);
    return;
  }
  if (d.opt) {
    const val = d.opt === "width" || d.opt === "height" ? +d.val : d.val;
    state.pv = { ...state.pv, [d.opt]: val };
    track("select_variant", { id: state.pid, [d.opt]: val });
    return refreshProduct();
  }
  if (d.thumb !== undefined) {
    const box = document.querySelector("[data-gallery-main]");
    box.innerHTML = d.thumb ? `<img data-main-image src="${d.thumb}" alt="${esc(d.label)}">` : photoPh(`${d.label} — фото после съёмки`);
    document.querySelectorAll("[data-thumb]").forEach((x) => x.classList.toggle("active", x === t));
    return;
  }
  if (d.productMinus !== undefined || d.productPlus !== undefined) { state.productQty = Math.max(1, state.productQty + (d.productPlus !== undefined ? 1 : -1)); return refreshProduct(); }
  if (d.addVariant !== undefined) {
    const p = byId(state.pid);
    p.items ? addKit(p, state.pv, state.productQty) : addToCart(p.id, { ...state.pv }, state.productQty);
    return toast(`${p.name} в корзине`);
  }
  if (d.addSet !== undefined) {
    const p = byId(state.pid);
    const group = `set:${p.id}:${Date.now()}`;
    const name = `Комплект на окно: ${p.name}`;
    addToCart(p.id, { ...state.pv }, state.productQty, group, name);
    setLines(p).filter((l) => state.setSel.has(l.p.id)).forEach((l) => addToCart(l.p.id, l.v, l.qty, group, name));
    return toast(`Комплект на окно добавлен в корзину`);
  }
  if (d.tryCat) { state.try.cat = d.tryCat; return refreshTry("tabs", "grid"); }
  if (d.tryColorFilter !== undefined) { state.try.color = d.tryColorFilter; document.querySelectorAll("[data-try-color-filter]").forEach((x) => x.classList.toggle("active", x.dataset.tryColorFilter === d.tryColorFilter)); return refreshTry("grid"); }
  if (d.trySceneToggle) { state.try.scene = { ...state.try.scene, [d.trySceneToggle]: !state.try.scene[d.trySceneToggle] }; return applyScene(); }
  if (d.tryPick) {
    const t_ = state.try;
    const has = t_.sel.some((x) => x.id === d.tryPick);
    if (!has && sceneKnown() && !fits(byId(d.tryPick).cat, t_.scene)) return toast(missingText(byId(d.tryPick).cat));
    if (!has && t_.sel.length >= 2) return toast("Можно примерить до двух товаров за раз, например шторы и тюль");
    t_.sel = has ? t_.sel.filter((x) => x.id !== d.tryPick) : [...t_.sel, { id: d.tryPick, color: byId(d.tryPick).colors[0] }];
    t_.result = null;
    return refreshTry("grid", "selected", "panel");
  }
  if (d.tryItemColor) { const [id, c] = d.tryItemColor.split(":"); state.try.sel = state.try.sel.map((x) => x.id === id ? { id, color: c } : x); state.try.result = null; return refreshTry("selected", "panel"); }
  if (d.tryRemove) { state.try.sel = state.try.sel.filter((x) => x.id !== d.tryRemove); state.try.result = null; return refreshTry("grid", "selected", "panel"); }
  if (d.tryRun !== undefined) { if (!state.try.busy) runTryon(); return; }
  if (d.carouselPrev !== undefined || d.carouselNext !== undefined) { t.closest("[data-carousel]").go(d.carouselNext !== undefined ? 1 : -1); return; }
  if (d.carouselPause !== undefined) {
    const root = t.closest("[data-carousel]");
    const paused = root.dataset.paused !== "true";
    root.dataset.paused = paused;
    t.textContent = paused ? "▶" : "❚❚";
    t.setAttribute("aria-label", paused ? "Включить автопрокрутку" : "Остановить автопрокрутку");
    return;
  }
  if (d.filterToggle !== undefined) { document.querySelector("#filter").classList.toggle("open"); return; }
  if (d.reset !== undefined) { const form = document.querySelector("[data-filter-form]"); form.reset(); form.querySelectorAll("input").forEach((i) => i.checked = i.type === "radio" && i.value === ""); form.querySelectorAll("select").forEach((s) => s.selectedIndex = 0); document.querySelector("[name=sort]").value = "popular"; return updateCatalog(); }
  if (d.chipKey) {
    const form = document.querySelector("[data-filter-form]");
    const el = form.querySelector(`[name="${d.chipKey}"]${["width", "height"].includes(d.chipKey) ? "" : `[value="${CSS.escape(d.chipVal)}"]`}`);
    if (!el) return updateCatalog();
    if (el.tagName === "SELECT") el.value = ""; else if (d.chipKey === "price") form.querySelector('[name="price"][value=""]').checked = true; else el.checked = false;
    return updateCatalog();
  }
  if (d.cartPlus || d.cartMinus) { const l = state.cart.find((x) => x.key === (d.cartPlus || d.cartMinus)); l.qty = Math.max(1, l.qty + (d.cartPlus ? 1 : -1)); saveCart(); return render(); }
  if (d.remove) { state.cart = state.cart.filter((x) => x.key !== d.remove); saveCart(); return render(); }
  if (d.removeGroup) { state.cart = state.cart.filter((x) => x.group !== d.removeGroup); saveCart(); return render(); }
  if (d.next !== undefined) { track("begin_checkout", { value: subtotal() }); return; }
  if (d.go) {
    e.preventDefault();
    const form = t.closest("form");
    if (!form.reportValidity()) return;
    state.order = { ...state.order, ...Object.fromEntries(new FormData(form)) };
    save("retoria-checkout", state.order);
    location.hash = d.go;
    return;
  }
  if (d.sample) {
    const has = state.samples.includes(d.sample);
    if (!has && state.samples.length >= 5) return toast("Можно выбрать до пяти образцов");
    state.samples = has ? state.samples.filter((x) => x !== d.sample) : [...state.samples, d.sample];
    t.classList.toggle("selected", !has);
    t.setAttribute("aria-pressed", !has);
    document.querySelector("[data-sample-count]").textContent = state.samples.length;
    document.querySelector("[data-sample-list]").innerHTML = sampleList();
    const field = document.querySelector("[data-sample-field]");
    if (field) field.value = sampleList(true);
    return;
  }
  if (d.reviewRoom) {
    document.querySelectorAll("[data-review-room]").forEach((x) => x.classList.toggle("active", x === t));
    document.querySelectorAll(".review-card").forEach((r) => r.hidden = d.reviewRoom !== "all" && r.dataset.room !== d.reviewRoom);
  }
});

document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.form?.matches("[data-filter-form]")) return updateCatalog();
  if (t.id === "try-photo" && t.files[0]) {
    const url = URL.createObjectURL(t.files[0]);
    imageToDataUrl(url, 1536).then(({ url: dataUrl, ar }) => {
      URL.revokeObjectURL(url);
      Object.assign(state.try, { room: dataUrl, ar, result: null, error: "" });
      detectScene();
      const strip = t.closest(".ai-upload-strip");
      strip.querySelector(".try-room").innerHTML = `<img src="${dataUrl}" alt="Ваше фото"><div><strong>Фото загружено</strong><div class="muted">Можно заменить в любой момент</div></div>`;
      strip.querySelector("label").textContent = "Заменить фото";
      refreshTry("panel");
    }).catch((err) => toast(err.message));
    return;
  }
  if (t.dataset.setToggle) { t.checked ? state.setSel.add(t.dataset.setToggle) : state.setSel.delete(t.dataset.setToggle); document.querySelector("[data-set]").innerHTML = windowSet(byId(state.pid)); return; }
  if (t.id === "help-photo") {
    const files = [...t.files].slice(0, 3);
    document.querySelector("[data-photo-previews]").innerHTML = files.map((f) => `<figure><img src="${URL.createObjectURL(f)}" alt=""><figcaption>${esc(f.name)}</figcaption></figure>`).join("");
    return toast(`Фото добавлено: ${files.length}`);
  }
  if (t.dataset.reviewFilter !== undefined) {
    const f = Object.fromEntries([...document.querySelectorAll("[data-review-filter]")].map((s) => [s.dataset.reviewFilter, s.value]));
    document.querySelectorAll(".review-card").forEach((r) => r.hidden = (f.room && r.dataset.room !== f.room) || (f.product && r.dataset.product !== f.product));
  }
  if (t.closest(".delivery-option, .payment-option")) { const group = t.closest(".delivery-grid, .form-section"); group.querySelectorAll(".delivery-option, .payment-option").forEach((x) => x.classList.toggle("selected", x.contains(t))); }
  if (t.form?.matches("[data-pay-form]") && t.name === "payment") { state.order.payment = t.value; save("retoria-checkout", state.order); }
});

document.addEventListener("input", (e) => {
  const t = e.target;
  const sewFormEl = t.form?.matches("[data-sew-form]") && t.form;
  if (sewFormEl) {
    const data = Object.fromEntries(new FormData(sewFormEl));
    const fabricChanged = data.fabric !== state.sew.fabric;
    const fabric = fabricById(data.fabric);
    state.sew = { fabric: data.fabric, color: fabric.colors.includes(data.color) ? data.color : fabric.colors[0], rod: +data.rod, height: +data.height, floor: data.floor, fastening: fabric.fastenings.includes(data.fastening) ? data.fastening : fabric.fastenings[0], panels: +data.panels, lining: fabric.linings.includes(data.lining) ? data.lining : fabric.linings[0] };
    if (fabricChanged) { document.querySelector("[data-sew]").innerHTML = sewForm(); return; }
    document.querySelector("[data-height-hint]").textContent = `Измеряйте ${measurePoint[state.sew.fastening]}`;
    document.querySelector("[data-sew-result]").innerHTML = sewResult();
    return;
  }
  if (t.form?.matches("[data-checkout-form]")) { state.order = { ...state.order, ...Object.fromEntries(new FormData(t.form)) }; save("retoria-checkout", state.order); refreshSummary(); return; }
  if (t.matches("[data-try-search]")) { state.try.q = t.value; refreshTry("grid"); return; }
  if (t.matches("[data-search-input]")) { history.replaceState(null, "", `#/search?q=${encodeURIComponent(t.value)}`); document.querySelector("[data-search-results]").innerHTML = searchResults(t.value); }
  if (t.matches(".compare-range")) t.closest("[data-comparison]").style.setProperty("--split", `${t.value}%`);
});

document.addEventListener("submit", (e) => {
  const form = e.target;
  e.preventDefault();
  if (form.dataset.lead) return saveLead(form);
  if (form.matches("[data-pay-form]")) {
    const no = `RH-${String(Date.now()).slice(-6)}`;
    const order = { ...state.order, no, lines: state.cart, total: subtotal() + (deliveryCost(state.order.city, state.order.method) || 0), created: dateFmt.format(new Date()), utm: getUtm() };
    save("retoria-orders", [order, ...load("retoria-orders", [])]);
    track("purchase", { id: no, value: order.total });
    state.cart = [];
    saveCart();
    location.hash = "#/confirmation";
    return;
  }
  if (form.matches("[data-track-form]")) {
    const no = form.no.value.trim().toUpperCase();
    const order = load("retoria-orders", []).find((o) => o.no === no);
    document.querySelector("[data-track-result]").innerHTML = order ? `<p><strong>Заказ № ${order.no}</strong></p>${statusList(0)}` : `<p class="warn">Заказ не найден. Проверьте номер или напишите нам.</p>`;
    return;
  }
  if (form.matches("[data-account-form]")) return toast("Демо: вход по коду подключается на InSales");
});

const headerScroll = () => document.querySelector(".header")?.classList.toggle("scrolled", scrollY > 20);
addEventListener("scroll", headerScroll, { passive: true });
addEventListener("hashchange", transitionRender);
render();
