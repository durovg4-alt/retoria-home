// RETORIA HOME: анимации главной (перенесены из прототипа, src/main.js initMotion / initCategoryGallery).
(function () {
  var root = document.querySelector(".rh-site");
  if (!root) return;

  // «до / после» и подписка работают и без анимаций
  root.addEventListener("input", function (e) {
    if (e.target.matches(".compare-range")) e.target.closest("[data-comparison]").style.setProperty("--split", e.target.value + "%");
  });
  root.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form.matches("[data-demo-form]")) return;
    e.preventDefault();
    form.reset();
    var btn = form.querySelector("button");
    btn.textContent = "Спасибо!";
    setTimeout(function () { btn.textContent = "Подписаться"; }, 2500);
  });

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  // без GSAP (не загрузился CDN) просто показываем всё как есть
  if (!gsap || !ST || reduce) { initGallery(null); return; }
  gsap.registerPlugin(ST);

  gsap.timeline({ defaults: { ease: "power4.out" } })
    .fromTo(".exact-hero > img", { scale: 1.075 }, { scale: 1.025, duration: 1.7, ease: "power2.out" })
    .fromTo(".exact-live-title > span", { yPercent: 112, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.1, duration: 1.15 }, 0.18)
    .fromTo(".exact-live-copy > *", { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.82 }, 0.52)
    .fromTo(".exact-live-categories", { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9 }, 0.68);

  gsap.set(".rh-site .reveal", { y: 34, autoAlpha: 0, filter: "blur(7px)" });
  ST.batch(".rh-site .reveal", {
    start: "top 88%", once: true, interval: 0.08, batchMax: 6,
    onEnter: function (batch) {
      gsap.to(batch, { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.95, stagger: 0.075, ease: "power4.out", overwrite: true,
        onComplete: function () { gsap.set(batch, { clearProps: "transform,filter" }); } });
    }
  });

  document.querySelectorAll(".exact-hero > img, .exact-touch-grid > img").forEach(function (image) {
    gsap.to(image, { yPercent: image.matches(".exact-hero > img") ? 3.5 : -4.5, ease: "none",
      scrollTrigger: { trigger: image.parentElement, start: "top bottom", end: "bottom top", scrub: 1.15, invalidateOnRefresh: true } });
  });

  initGallery(gsap);
  if (document.fonts) document.fonts.ready.then(function () { ST.refresh(); });
  addEventListener("load", function () { ST.refresh(); });

  // Лента категорий: на компьютере закрепляется и едет вбок при прокрутке, на телефоне — свайп.
  function initGallery(gsap) {
    var gallery = root.querySelector("[data-category-gallery]");
    var track = root.querySelector("[data-category-track]");
    if (!gallery || !track) return;
    var slides = track.children;
    var progress = root.querySelector("[data-category-progress]");
    var current = root.querySelector("[data-category-current]");
    var prev = root.querySelector("[data-category-prev]");
    var next = root.querySelector("[data-category-next]");
    var show = function (p) {
      progress.style.transform = "scaleX(" + Math.max(0.035, p) + ")";
      current.textContent = String(Math.round(p * (slides.length - 1)) + 1).padStart(2, "0");
    };
    if (!gsap || !matchMedia("(min-width: 901px)").matches) {
      gallery.classList.add("rh-swipe");
      track.addEventListener("scroll", function () { show(track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth)); }, { passive: true });
      prev.addEventListener("click", function () { track.scrollBy({ left: -track.clientWidth * 0.84, behavior: "smooth" }); });
      next.addEventListener("click", function () { track.scrollBy({ left: track.clientWidth * 0.84, behavior: "smooth" }); });
      show(0);
      return;
    }
    var tween = gsap.to(track, {
      x: function () { return -(track.scrollWidth - gallery.clientWidth); },
      ease: "none",
      scrollTrigger: {
        trigger: gallery, start: "top 12%", scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
        end: function () { return "+=" + Math.min(Math.max((track.scrollWidth - gallery.clientWidth) * 0.62, innerHeight * 0.85), innerHeight * 1.65); },
        onUpdate: function (self) { show(self.progress); }
      }
    });
    var go = function (dir) {
      var st = tween.scrollTrigger;
      var target = Math.max(0, Math.min(slides.length - 1, Math.round(st.progress * (slides.length - 1)) + dir));
      scrollTo({ top: st.start + (target / (slides.length - 1)) * (st.end - st.start), behavior: "smooth" });
    };
    prev.addEventListener("click", function () { go(-1); });
    next.addEventListener("click", function () { go(1); });
    show(0);
  }
})();
