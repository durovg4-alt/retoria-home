# RETORIA HOME — визуальные материалы

## 1. Product images

Все основные карточки товаров находятся в `src/assets/generated/` и имеют формат WebP `1400 × 1750 px`:

- `product-astrid-hq.webp`
- `product-eira-hq.webp`
- `product-liv-hq.webp`
- `product-mira-hq.webp`
- `product-norra-hq.webp`
- `product-solveig-hq.webp`

## 2. Interior collections

WebP `1600 × 1200 px`:

- `room-bedroom-hq.webp`
- `room-living-hq.webp`
- `room-dining-hq.webp`
- `room-bath-hq.webp`

## 3. Главная страница

- `home-exact/hero-clean-v2.webp` — `1920 × 917 px`.
- `home-exact/hero.webp` — `1920 × 918 px`.
- `home-exact/touch.webp` — `1814 × 1179 px`.
- `home-exact/ai-compare.webp` — `1609 × 1041 px`.
- `home-exact/room-*.webp` — около `680–706 × 572 px`.
- `home-exact/cat-*.webp` — `402 × 316 px`.
- `home-exact/social.webp` — `370 × 95 px`.
- `home-exact/benefits.webp` — исходный вспомогательный raster `2998 × 308 px`; в рабочем интерфейсе benefits отрисованы HTML/CSS и SVG, чтобы оставаться резкими и интерактивными.

## 4. AI-примерка и контакты

- `room-before.webp` — `1200 × 900 px`.
- `room-after.webp` — `1200 × 900 px`.
- `showroom.webp` — `1400 × 900 px`.

## 5. Иконки

Основные интерфейсные иконки встроены как SVG strings в `src/main.js`. Они используют единый outline-стиль: `stroke-width` около `1.7`, rounded caps/joins.

## 6. Правила экспорта новых материалов

- Товары: WebP, `1400 × 1750 px`, quality `82–88`.
- Интерьеры: WebP, минимум `1600 px` по ширине.
- Hero: WebP, минимум `1920 px` по ширине; важный объект не размещать у краёв.
- Сохранять master в PNG/TIFF отдельно, в сайт отдавать оптимизированный WebP/AVIF.
- Не встраивать текст в изображение, если его можно сделать HTML.
- Для каждого изображения добавлять осмысленный alt-текст.

Все визуальные материалы в пакете должны пройти отдельную проверку прав использования перед коммерческим запуском. Генеративные и референсные материалы нельзя автоматически считать юридически очищенными для любой рекламы или перепродажи.
