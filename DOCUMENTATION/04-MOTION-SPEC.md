# RETORIA HOME — motion specification

## 1. Характер движения

Анимация должна ощущаться премиальной и спокойной: медленный уверенный reveal, мягкое ускорение, минимальная амплитуда и отсутствие лишних пружинящих эффектов.

## 2. Библиотеки

- GSAP `3.13.x`.
- GSAP ScrollTrigger.
- Lenis `1.3.x`.

Глобальный GSAP default: `ease: power3.out`, `duration: 0.85 s`.

## 3. Smooth scroll

```js
new Lenis({
  lerp: 0.082,
  smoothWheel: true,
  wheelMultiplier: 0.9
})
```

Lenis синхронизирован с GSAP ticker и ScrollTrigger.

## 4. Hero intro

- Hero photo: scale `1.075 → 1.025`, `1.7 s`, `power2.out`.
- Header elements: `y -18 → 0`, opacity `0 → 1`, stagger `0.08 s`, duration `0.78 s`.
- Большой заголовок: `yPercent 112 → 0`, stagger `0.1 s`, duration `1.15 s`.
- Hero copy: `y 24 → 0`, stagger `0.1 s`, duration `0.82 s`.
- Категории: `y 24 → 0`, duration `0.9 s`.

## 5. Scroll reveals

- Начальное состояние: `y: 34`, `opacity: 0`, `blur: 7px`.
- Trigger: верх элемента достигает `84%` viewport.
- Конечное состояние: `y: 0`, `opacity: 1`, `blur: 0`.
- Duration `0.95 s`, stagger `0.075 s`, easing `power4.out`.
- Элементы проигрываются один раз.

Заголовки дополнительно раскрываются через `clip-path` снизу вверх, duration `1 s`.

## 6. Горизонтальный showcase категорий

На desktop (`min-width: 901px`) вертикальный скролл временно pin-ит блок и двигает track по горизонтали.

- `scrub: 1`.
- Максимальная длина pinned-секции ограничена примерно `1.65 viewport height`.
- Есть progress line, текущий номер и кнопки prev/next.
- На touch/mobile используется нативный horizontal scroll + scroll snap.

## 7. Parallax

- Hero: `yPercent +3.5`.
- Каталожный hero, touch и contacts: `yPercent -4.5`.
- ScrollTrigger scrub `1.15`.

## 8. Microinteractions

- Magnetic CTA: смещение по X до `12%` положения указателя и по Y до `20%`; возврат `0.48 s`.
- Card tilt: rotation X/Y примерно до `2.2°`; возврат `0.55 s`.
- Image hover: scale `1.025–1.035`, duration `0.65–1 s`.
- Arrow hover: `translateX(6px)`, duration `0.4 s`.
- Route leave: `y -10`, fade, `0.24 s`; затем вход новой страницы.
- Верхняя progress line отображает прогресс по странице.

Magnetic и tilt-эффекты отключены на coarse pointer устройствах.

## 9. Reduced motion

При `prefers-reduced-motion: reduce`:

- Lenis не запускается.
- ScrollTrigger-анимации не запускаются.
- Элементы `.reveal` отображаются сразу.
- Progress line скрывается.
- CSS отключает animation/transition и возвращает обычный scroll behavior.

## 10. Правила развития

- Не добавлять автопрокрутку каруселей без контроля пользователя.
- Не использовать bounce/elastic в commerce-flow.
- Любая анимация должна объяснять иерархию, направление перехода или состояние.
- Для UI-событий держаться диапазона `180–360 ms`; для editorial reveal — `700–1100 ms`.
