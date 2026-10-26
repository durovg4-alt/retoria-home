// Демо-данные прототипа. На InSales всё это приходит из каталога: товары, варианты, характеристики.
// Цены, сроки и составы черновые: заменить паспортом SKU от команды Retoria Home.
import eira from "./assets/generated/product-eira-hq.webp";
import norra from "./assets/generated/product-norra-hq.webp";
import liv from "./assets/generated/product-liv-hq.webp";
import mira from "./assets/generated/product-mira-hq.webp";
import astrid from "./assets/generated/product-astrid-hq.webp";
import heroRoom from "./assets/hero-room-clean.jpg";
import roomAfter from "./assets/room-after-clean.jpg";
import roomBefore from "./assets/room-before-clean.jpg";
import showroom from "./assets/showroom.webp";
import heroClean from "./assets/home-exact/hero-clean-v2.webp";
import roomBedroom from "./assets/generated/room-bedroom-hq.webp";
import roomLiving from "./assets/generated/room-living-hq.webp";
import roomDining from "./assets/generated/room-dining-hq.webp";
import touch from "./assets/home-exact/touch.webp";
import catTulle from "./assets/home-exact/cat-tulle.webp";
import catAccessories from "./assets/home-exact/cat-accessories.webp";
import fBlackout from "./assets/fabrics/blackout.jpg";
import fLinen from "./assets/fabrics/linen-blackout.jpg";
import fVelvet from "./assets/fabrics/velvet.jpg";
import fRogozhka from "./assets/fabrics/rogozhka.jpg";
import fTulle from "./assets/fabrics/tulle-linen.jpg";
import fVoile from "./assets/fabrics/voile.jpg";

export const img = { eira, norra, liv, mira, astrid, heroRoom, roomAfter, roomBefore, showroom, heroClean, roomBedroom, roomLiving, roomDining, touch, catTulle, catAccessories };

// Единый справочник цветов: номер + словесное название.
export const colors = {
  "01": { en: "white", name: "Белый", hex: "#f4f2ec" },
  "02": { en: "milky off-white", name: "Молочный", hex: "#e8dfcf" },
  "03": { en: "natural linen beige", name: "Льняной", hex: "#d4c4a8" },
  "04": { en: "warm sand beige", name: "Песочный", hex: "#b89c7a" },
  "05": { en: "greige, grey-beige", name: "Серо-бежевый", hex: "#a39a8b" },
  "06": { en: "dark graphite grey", name: "Графит", hex: "#3f3f3b" },
  "07": { en: "muted olive green", name: "Оливковый", hex: "#686a43" }
};

export const rooms = { bedroom: "Спальня", living: "Гостиная", kids: "Детская", kitchen: "Кухня" };

export const blackoutInfo = {
  "100%": "Комната полностью тёмная даже днём",
  "85–95%": "Мягкий полумрак, контуры предметов видны",
  "Рассеивает свет": "Приватность днём, свет мягкий и тёплый",
  "Прозрачный": "Лёгкая ткань, пропускает почти весь свет"
};

export const stockInfo = {
  "В наличии": [2, 4],
  "Изготовление 1–2 дня": [4, 7],
  "Пошив по размерам": [6, 10]
};

export const fastenings = ["Шторная лента", "Люверсы", "Скрытые петли", "Французская складка"];

export const fabrics = [
  { id: "blackout", photo: fBlackout, name: "Блэкаут", composition: "100% полиэстер, трёхслойное плетение", blackout: "100%", density: "280 г/м²", maxHeight: 300, care: "Деликатная стирка 30 °C без отжима", shrink: "до 1%", colors: ["02", "05", "06", "07"], fastenings: ["Шторная лента", "Люверсы", "Скрытые петли"], linings: ["Без подкладки"], group: "B", pricePerMeter: 1290, text: "Плотная ткань для спальни и детской: не пропускает свет, мягко драпируется." },
  { id: "linen-blackout", photo: fLinen, name: "Лён-блэкаут", composition: "45% лён, 55% полиэстер с затемняющим слоем", blackout: "85–95%", density: "310 г/м²", maxHeight: 290, care: "Стирка 30 °C, гладить с изнанки", shrink: "до 2%", colors: ["02", "03", "04", "07"], fastenings, linings: ["Без подкладки", "Блэкаут", "Термоподкладка"], group: "C", pricePerMeter: 1890, text: "Фактура натурального льна и плотный полумрак." },
  { id: "velvet", photo: fVelvet, name: "Бархат", composition: "100% полиэстер, микровелюр", blackout: "85–95%", density: "330 г/м²", maxHeight: 300, care: "Сухая чистка или деликатная стирка 30 °C", shrink: "до 1%", colors: ["04", "05", "06", "07"], fastenings: ["Шторная лента", "Люверсы", "Французская складка"], linings: ["Без подкладки", "Блэкаут"], group: "C", pricePerMeter: 1690, text: "Глубокий цвет и мягкий блеск для гостиной." },
  { id: "rogozhka", photo: fRogozhka, name: "Рогожка", composition: "70% полиэстер, 30% хлопок", blackout: "Рассеивает свет", density: "220 г/м²", maxHeight: 300, care: "Стирка 40 °C", shrink: "до 3%", colors: ["01", "02", "03", "05"], fastenings: ["Шторная лента", "Люверсы", "Скрытые петли"], linings: ["Без подкладки", "Блэкаут"], group: "A", pricePerMeter: 990, text: "Практичная фактурная ткань для кухни и гостиной." },
  { id: "tulle-linen", photo: fTulle, name: "Тюль под лён", composition: "100% полиэстер с фактурой льна", blackout: "Прозрачный", density: "110 г/м²", maxHeight: 310, care: "Стирка 30 °C", shrink: "до 1%", colors: ["01", "02", "03"], fastenings: ["Шторная лента", "Люверсы"], linings: ["Без подкладки"], group: "A", pricePerMeter: 690, text: "Мягкий дневной свет и фактура льна без утяжеления окна." },
  { id: "voile", photo: fVoile, name: "Вуаль", composition: "100% полиэстер", blackout: "Прозрачный", density: "60 г/м²", maxHeight: 300, care: "Стирка 30 °C", shrink: "нет", colors: ["01", "02"], fastenings: ["Шторная лента"], linings: ["Без подкладки"], group: "A", pricePerMeter: 490, text: "Самая лёгкая ткань: воздух и максимум света." }
];

export const categories = [
  { id: "curtains", name: "Шторы", sub: "Блэкаут и портьеры", image: eira },
  { id: "tulle", name: "Тюль", sub: "Лёгкий свет", image: norra },
  { id: "sets", name: "Комплекты на окно", sub: "Готовые сочетания", image: roomBedroom },
  { id: "bedspreads", name: "Покрывала", sub: "Для спальни", image: liv },
  { id: "pillows", name: "Декоративные подушки", sub: "Акценты и фактура", image: mira },
  { id: "plaids", name: "Пледы", sub: "Тёплые детали", image: astrid },
  { id: "accessories", name: "Аксессуары", sub: "Подхваты и фурнитура", image: catAccessories }
];

const curtainOpts = (heights = [250, 270, 290], fast = fastenings) => ({ width: [150, 200, 250, 300], height: heights, panels: ["Одно полотно", "Пара"], fastening: fast });
const tulleOpts = (heights) => ({ width: [150, 200, 250, 300, 400], height: heights, panels: ["Одно полотно"], fastening: ["Шторная лента"] });
const ph = (label) => ({ src: null, label });

export const products = [
  { id: "eira", sku: "RH-C-101", name: "Шторы Эйра", cat: "curtains", fabric: "linen-blackout", style: "Натуральный", rooms: ["bedroom", "living"], blackout: "85–95%", colors: ["07", "03", "02"], opts: curtainOpts(), unavailable: [{ fastening: "Люверсы", height: 290 }], base: 4990, stock: "В наличии", popular: 1, badge: "Бестселлер", image: eira, colorImages: { "03": roomAfter },
    gallery: [{ src: eira, label: "Интерьер" }, { src: roomAfter, label: "Шторы закрыты" }, ph("Фактура при дневном свете"), ph("Крепление"), ph("Упаковка")],
    desc: "Фактурный лён с затемняющим слоем: мягкий полумрак днём и спокойный сон ночью." },
  { id: "nord", sku: "RH-C-102", name: "Шторы Норд", cat: "curtains", fabric: "blackout", style: "Современный", rooms: ["bedroom", "kids"], blackout: "100%", colors: ["06", "05", "02"], opts: curtainOpts([250, 270, 290], ["Шторная лента", "Люверсы", "Скрытые петли"]), base: 4490, stock: "В наличии", popular: 2, image: heroRoom,
    gallery: [{ src: heroRoom, label: "Интерьер" }, ph("Шторы закрыты"), ph("Фактура"), ph("Крепление"), ph("Упаковка")],
    desc: "Плотный блэкаут: комната остаётся тёмной даже в солнечный день." },
  { id: "vera", sku: "RH-C-103", name: "Шторы Вера", cat: "curtains", fabric: "velvet", style: "Классика", rooms: ["living"], blackout: "85–95%", colors: ["04", "07", "06"], opts: curtainOpts([250, 270, 290], ["Шторная лента", "Люверсы", "Французская складка"]), unavailable: [{ fastening: "Французская складка", width: 150 }], base: 5490, stock: "Изготовление 1–2 дня", popular: 4, isNew: true, badge: "Новинка", image: roomLiving,
    gallery: [{ src: roomLiving, label: "Интерьер" }, ph("Фактура бархата"), ph("Крепление"), ph("Упаковка")],
    desc: "Бархат с мягким блеском: собранный образ гостиной и тёплый вечерний свет." },
  { id: "sola", sku: "RH-C-104", name: "Шторы Сола", cat: "curtains", fabric: "rogozhka", style: "Натуральный", rooms: ["kitchen", "living"], blackout: "Рассеивает свет", colors: ["02", "03", "05"], opts: curtainOpts([160, 180, 250, 270], ["Шторная лента", "Люверсы", "Скрытые петли"]), base: 2990, stock: "В наличии", popular: 6, image: roomAfter,
    gallery: [{ src: roomAfter, label: "Интерьер" }, ph("Фактура рогожки"), ph("Крепление")],
    desc: "Практичная рогожка: короткие шторы для кухни или длинные для гостиной." },
  { id: "mia", sku: "RH-C-105", name: "Шторы Мия", cat: "curtains", fabric: "blackout", style: "Спокойный", rooms: ["kids", "bedroom"], blackout: "100%", colors: ["02", "05"], opts: curtainOpts([250, 270], ["Шторная лента", "Скрытые петли"]), base: 4290, stock: "Изготовление 1–2 дня", popular: 7, isNew: true, image: touch,
    gallery: [{ src: touch, label: "Интерьер" }, ph("Фактура"), ph("Крепление")],
    desc: "Спокойная палитра и полное затемнение для дневного сна." },
  { id: "norra", sku: "RH-T-201", name: "Тюль Норра", cat: "tulle", fabric: "tulle-linen", style: "Натуральный", rooms: ["bedroom", "living", "kids"], blackout: "Прозрачный", colors: ["02", "01", "03"], opts: tulleOpts([250, 270, 290]), base: 2490, stock: "В наличии", popular: 3, badge: "Хит", image: norra,
    gallery: [{ src: norra, label: "Интерьер" }, ph("Фактура при дневном свете"), ph("Крепление")],
    desc: "Тюль с фактурой льна: рассеивает дневной свет и смягчает окно." },
  { id: "lina", sku: "RH-T-202", name: "Тюль Лина", cat: "tulle", fabric: "voile", style: "Лёгкий", rooms: ["kitchen", "kids", "living"], blackout: "Прозрачный", colors: ["01", "02"], opts: tulleOpts([160, 180, 250, 270, 290]), base: 1690, stock: "В наличии", popular: 5, image: catTulle,
    gallery: [{ src: catTulle, label: "Интерьер" }, ph("Фактура"), ph("Крепление")],
    desc: "Невесомая вуаль для небольших окон и светлых комнат." },
  { id: "kit-bedroom", sku: "RH-K-301", name: "Комплект «Спальня Blackout»", cat: "sets", rooms: ["bedroom"], blackout: "100%", colors: ["06", "05", "02"], opts: { width: [200, 250, 300], height: [250, 270, 290] }, items: [{ id: "nord", panels: "Пара" }, { id: "norra", panels: "Одно полотно" }, { id: "hooks", qty: 2 }], stock: "В наличии", popular: 1, badge: "Готовое решение", image: roomBedroom,
    gallery: [{ src: roomBedroom, label: "Комплект в спальне" }, { src: heroRoom, label: "Шторы Норд" }, { src: norra, label: "Тюль Норра" }],
    desc: "Пара штор блэкаут, тюль и подхваты: всё уже сочетается по цвету и размеру." },
  { id: "kit-living", sku: "RH-K-302", name: "Комплект «Гостиная»", cat: "sets", rooms: ["living"], blackout: "85–95%", colors: ["04", "07", "06"], opts: { width: [200, 250, 300], height: [250, 270, 290] }, items: [{ id: "vera", panels: "Пара" }, { id: "norra", panels: "Одно полотно" }, { id: "hooks", qty: 2 }], stock: "Изготовление 1–2 дня", popular: 2, image: heroClean,
    gallery: [{ src: heroClean, label: "Комплект в интерьере" }, { src: roomLiving, label: "Шторы Вера" }, { src: norra, label: "Тюль Норра" }],
    desc: "Бархатные шторы и светлый тюль: собранный интерьер и мягкий дневной свет." },
  { id: "kit-kids", sku: "RH-K-303", name: "Комплект «Детская»", cat: "sets", rooms: ["kids"], blackout: "100%", colors: ["02", "05"], opts: { width: [200, 250], height: [250, 270] }, items: [{ id: "mia", panels: "Пара" }, { id: "lina", panels: "Одно полотно" }], stock: "Изготовление 1–2 дня", popular: 3, image: showroom,
    gallery: [{ src: showroom, label: "Комплект в интерьере" }, { src: touch, label: "Шторы Мия" }],
    desc: "Полное затемнение для дневного сна и лёгкий тюль на день. Спокойная палитра." },
  { id: "kit-kitchen", sku: "RH-K-304", name: "Комплект «Кухня»", cat: "sets", rooms: ["kitchen"], blackout: "Рассеивает свет", colors: ["02", "03", "05"], opts: { width: [150, 200], height: [160, 180] }, items: [{ id: "sola", panels: "Пара" }, { id: "lina", panels: "Одно полотно" }], stock: "В наличии", popular: 4, image: roomDining,
    gallery: [{ src: roomDining, label: "Комплект на кухне" }, { src: roomAfter, label: "Шторы Сола" }],
    desc: "Короткие практичные шторы и вуаль для небольшого окна." },
  { id: "liv", sku: "RH-B-401", name: "Покрывало Лив", cat: "bedspreads", rooms: ["bedroom"], colors: ["07", "03"], opts: { size: ["160 × 220 см", "220 × 240 см"] }, base: 5990, stock: "В наличии", popular: 8, image: liv, gallery: [{ src: liv, label: "Интерьер" }, ph("Фактура")], desc: "Стёганое покрывало в природных оттенках." },
  { id: "mira", sku: "RH-P-501", name: "Подушка Мира", cat: "pillows", rooms: ["bedroom", "living"], colors: ["04", "03"], opts: { size: ["45 × 45 см", "50 × 50 см"] }, base: 1490, stock: "В наличии", popular: 9, image: mira, gallery: [{ src: mira, label: "Интерьер" }, ph("Фактура")], desc: "Декоративная подушка со съёмным чехлом." },
  { id: "astrid", sku: "RH-L-601", name: "Плед Астрид", cat: "plaids", rooms: ["bedroom", "living"], colors: ["03", "02"], opts: { size: ["130 × 170 см", "150 × 200 см"] }, base: 1990, stock: "В наличии", popular: 10, image: astrid, gallery: [{ src: astrid, label: "Интерьер" }, ph("Фактура")], desc: "Мягкий плед для дивана и кровати." },
  { id: "hooks", sku: "RH-A-701", name: "Подхваты Узел", cat: "accessories", rooms: ["bedroom", "living", "kids", "kitchen"], colors: ["03", "07", "06"], opts: {}, base: 690, stock: "В наличии", popular: 11, image: catAccessories, gallery: [{ src: catAccessories, label: "Подхват" }], desc: "Текстильный подхват для штор, 1 шт." }
];

export const solutions = [
  { id: "bedroom", title: "Спальня Blackout", promise: "Темнота для спокойного сна и готовое сочетание для спальни.", kit: "kit-bedroom", filter: { room: ["bedroom"], blackout: ["100%"] }, image: roomBedroom, facts: ["Затемнение 95–100%", "Ширина 200–300 см", "Шторы, тюль и подхваты"] },
  { id: "living", title: "Гостиная", promise: "Собранный интерьер и мягкий дневной свет.", kit: "kit-living", filter: { room: ["living"] }, image: roomLiving, facts: ["Бархат и тюль под лён", "Шторы + тюль", "4 оттенка"] },
  { id: "kids", title: "Детская", promise: "Практичные и безопасные решения для дневного и ночного сна.", kit: "kit-kids", filter: { room: ["kids"], blackout: ["100%"] }, image: touch, facts: ["Плотное затемнение", "Стирка 30 °C", "Спокойная палитра"] },
  { id: "kitchen", title: "Кухня", promise: "Лёгкие и практичные решения для небольшого окна.", kit: "kit-kitchen", filter: { room: ["kitchen"] }, image: roomDining, facts: ["Тюль или короткая штора", "Высота 160–180 см", "Стирка 40 °C"] },
  { id: "light", title: "Светлая квартира", promise: "Максимум света и воздуха: молочный тюль и светлые ткани.", filter: { blackout: ["Прозрачный", "Рассеивает свет"] }, image: heroClean, facts: ["Прозрачные и рассеивающие ткани", "Белый, молочный, льняной"] },
  { id: "family", title: "Тёплый семейный дом", promise: "Тёплые оттенки, бархат, покрывала и пледы для всей семьи.", filter: { color: ["04", "07"] }, image: showroom, facts: ["Песочный и оливковый", "Шторы, покрывала, пледы"] }
];

export const reviews = [
  { name: "Анна", city: "Тверь", room: "bedroom", product: "kit-bedroom", window: "Окно 160 × 145 см · карниз 260 см · пара 2 × 150 × 270", stars: 5, title: "В спальне наконец темно", text: "Взяли комплект целиком, тюль и шторы совпали по цвету. Мастер проверил замеры по фото до оплаты.", photo: roomBedroom },
  { name: "Мария", city: "Москва", room: "living", product: "kit-living", window: "Окно 210 × 160 см · карниз 320 см · пара 2 × 200 × 270", stars: 5, title: "Гостиная стала собранной", text: "Боялась ошибиться с оттенком, заказала образцы. Бархат вживую такой же, как на образце.", photo: heroClean },
  { name: "Елена", city: "Санкт-Петербург", room: "bedroom", product: "eira", window: "Окно 150 × 150 см · карниз 250 см · одно полотно 250 × 270", stars: 4, title: "Хорошо держит полумрак", text: "Днём мягкий свет, вечером приватно. Лён после стирки немного сел, в пределах заявленного.", photo: roomAfter },
  { name: "Ольга", city: "Тверь", room: "kitchen", product: "kit-kitchen", window: "Окно 120 × 130 см · карниз 180 см · высота 160 см", stars: 5, title: "Идеально для маленького окна", text: "Короткие шторы не мешают подоконнику. Стираю часто, ткань держится.", photo: roomDining },
  { name: "Ирина", city: "Казань", room: "kids", product: "kit-kids", window: "Окно 140 × 150 см · карниз 220 см · пара 2 × 150 × 250", stars: 5, title: "Ребёнок спит днём", text: "Затемнение полное, цвет спокойный. Подсказали, как перевесить карниз выше.", photo: null }
];

export const faq = [
  ["Сколько времени занимает изготовление?", "Готовые размеры отправляем со склада. Изделия по вашим размерам шьём после подтверждения замеров мастером; точный срок называем до оплаты и отдельно указываем срок доставки."],
  ["Как правильно замерить окно?", "Карниз лучше установить заранее. Ширину измеряйте между крайними крючками, высоту — от точки крепления до пола в трёх местах. Подробная схема — на странице «Как замерить»."],
  ["Можно ли вернуть товар?", "Условия различаются для готовых изделий, изделий по индивидуальным размерам, брака и повреждения при доставке. Подробно — в разделе «Возврат и обмен»."],
  ["Что такое блэкаут?", "Это плотная ткань, которая не пропускает свет. 100% — комната тёмная даже днём; 85–95% — мягкий полумрак, контуры предметов видны."],
  ["Сколько ткани нужно?", "Ширина ткани до сборки больше ширины карниза в 1,5–2,5 раза — это коэффициент сборки, он зависит от крепления. Точный расход посчитает калькулятор или мастер."],
  ["Можно ли сшить модель по моим размерам?", "Да. В карточке нажмите «Сшить по своим размерам» — калькулятор откроется с уже выбранной тканью и цветом."],
  ["Почему цена предварительная?", "Итог зависит от точных размеров, крепления и комплектации. Мастер подтверждает цену до раскроя."]
];
