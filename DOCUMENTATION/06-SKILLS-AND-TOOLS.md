# RETORIA HOME — скиллы, подходы и инструменты

## Дизайн-направления

В итоговом проекте применены следующие группы дизайн-компетенций:

- **Web design / homepage design** — композиция главной, hero, редакционная структура.
- **E-commerce UX** — каталог, фильтры, товар, корзина, checkout и cross-sell.
- **Layout & grid hierarchy** — контейнеры, адаптивные сетки, выравнивание toolbar и формы доставки.
- **Typography** — парное использование Cormorant/Bodoni и Manrope, display scale и короткие текстовые блоки.
- **Design system** — токены цвета, радиусы, spacing, кнопки, карточки и состояния.
- **Microinteractions & motion** — hover, reveal, page transition, slider и scroll storytelling.
- **Accessibility** — keyboard focus, labels, alt text, skip-link и reduced motion.
- **Performance / Core Web Vitals principles** — WebP, локальные шрифты, lazy-loading карточек и production bundling.
- **Design handoff** — текущий комплект спецификаций, брендбук и QA checklist.
- **AI image generation workflow** — согласованный фотостиль продуктовых и интерьерных изображений.

Это перечень применённых методологий и skill-направлений, а не журнал каждого внутреннего вызова инструмента.

## Технические инструменты

- Vite — dev/build.
- Vanilla JavaScript — SPA, state и interactions.
- CSS — responsive layout и visual system.
- GSAP + ScrollTrigger — motion system.
- Lenis — smooth scrolling.
- Fontsource — self-hosted fonts.
- GitHub Pages — резервная публичная публикация.
- Vercel — основная публичная публикация.

## Шрифты

- Cormorant Garamond 400.
- Bodoni Moda 400/500.
- Manrope Variable.

Шрифты подключены npm-пакетами Fontsource и входят в production bundle; отдельная загрузка с Google Fonts не требуется.

## Архитектурные решения

- Hash-routing для работы на любом static hosting без rewrite rules.
- UI templates находятся в функциях страниц внутри `src/main.js`.
- Состояние прототипа хранится на клиенте.
- Все критические брендовые стили централизованы в CSS variables.
- Главная и внутренние страницы используют одну визуальную систему, но разные display-шрифты для точного соответствия выбранной арт-дирекции.
