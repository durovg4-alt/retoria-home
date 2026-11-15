// RETORIA HOME: поведение шапки, карточки товара и каталога (перенесено из прототипа src/main.js).
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // --- шапка: меню на телефоне и тень при прокрутке
  var head = $("[data-rh-header]");
  if (head) {
    var toggle = $("[data-menu]", head);
    toggle.addEventListener("click", function () {
      var open = !head.classList.contains("menu-open");
      head.classList.toggle("menu-open", open);
      document.documentElement.style.overflow = open ? "hidden" : "";
      toggle.setAttribute("aria-expanded", open);
    });
    var header = $(".header", head);
    var onScroll = function () { header.classList.toggle("scrolled", scrollY > 8); };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // --- карточка товара
  var buy = $("[data-rh-buy]");
  if (buy) {
    var main = $("[data-rh-main]");
    var thumbs = $$("[data-rh-thumb]");
    var showPhoto = function (i) {
      if (!thumbs.length) return;
      i = (i + thumbs.length) % thumbs.length;
      thumbs.forEach(function (t, k) { t.classList.toggle("active", k === i); });
      main.src = thumbs[i].getAttribute("data-rh-thumb");
    };
    var current = function () { return Math.max(0, thumbs.findIndex(function (t) { return t.classList.contains("active"); })); };
    thumbs.forEach(function (t, i) { t.addEventListener("click", function () { showPhoto(i); }); });
    $$("[data-rh-step]").forEach(function (b) { b.addEventListener("click", function () { showPhoto(current() + Number(b.getAttribute("data-rh-step"))); }); });
    main.addEventListener("click", function () { showPhoto(current() + 1); });

    var select = $("[data-rh-variants]", buy);
    var opts = Array.prototype.slice.call(select.options).map(function (o) {
      var p = o.getAttribute("data-title").split("/").map(function (s) { return s.trim(); });
      return { el: o, w: p[0], h: p[1] };
    });
    var wRow = $('[data-rh-opt="w"]'), hRow = $('[data-rh-opt="h"]');
    var pick = { w: null, h: null };
    var uniq = function (arr) { return arr.filter(function (v, i) { return v && arr.indexOf(v) === i; }).sort(function (a, b) { return a - b; }); };
    var render = function () {
      if (!wRow) return;
      var draw = function (row, key, values, ok) {
        row.innerHTML = values.map(function (v) {
          var off = !ok(v);
          return '<button type="button" class="choice' + (pick[key] === v ? " selected" : "") + (off ? ' rh-off" title="Нет в этом сочетании — второй размер сбросится"' : '"') + ' data-v="' + v + '">' + v + "</button>";
        }).join("");
      };
      draw(wRow, "w", uniq(opts.map(function (o) { return o.w; })), function (w) { return !pick.h || opts.some(function (o) { return o.w === w && o.h === pick.h; }); });
      draw(hRow, "h", uniq(opts.map(function (o) { return o.h; })), function (h) { return !pick.w || opts.some(function (o) { return o.h === h && o.w === pick.w; }); });
    };
    var update = function () {
      var match = opts.filter(function (o) { return o.w === pick.w && o.h === pick.h; })[0];
      var add = $("[data-rh-add]", buy);
      if (!match) {
        if (opts.length > 1) { add.disabled = true; add.textContent = "Выберите размер"; }
        select.value = "";
        $("[data-rh-price]").textContent = start.price; $("[data-rh-old]").textContent = start.old;
        var d0 = $("[data-rh-disc]"); d0.textContent = start.disc; d0.hidden = !start.disc;
        $("[data-rh-size]").textContent = start.size;
        return;
      }
      select.value = match.el.value;
      var o = match.el;
      $("[data-rh-price]").textContent = o.getAttribute("data-price");
      $("[data-rh-old]").textContent = o.getAttribute("data-old");
      var disc = $("[data-rh-disc]");
      disc.hidden = !o.getAttribute("data-disc");
      disc.textContent = o.getAttribute("data-disc") ? "−" + o.getAttribute("data-disc") + "%" : "";
      $("[data-rh-size]").textContent = "размер " + match.w + " × " + match.h + " см";
      var sku = $("[data-rh-sku]"); if (sku && o.getAttribute("data-sku")) sku.textContent = o.getAttribute("data-sku");
      var available = o.getAttribute("data-available") !== "false";
      $("[data-rh-stock]").textContent = available ? "В наличии" : "Нет в наличии";
      add.disabled = !available;
      add.textContent = available ? "В корзину" : "Нет в наличии";
    };
    [wRow, hRow].forEach(function (row) {
      if (!row) return;
      row.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-v]");
        if (!b) return;
        var key = row === wRow ? "w" : "h", other = key === "w" ? "h" : "w";
        pick[key] = pick[key] === b.getAttribute("data-v") ? null : b.getAttribute("data-v");
        // такого сочетания нет — сбрасываем второй размер, чтобы выбор не застревал
        if (pick[key] && pick[other] && !opts.some(function (o) { return o[key] === pick[key] && o[other] === pick[other]; })) pick[other] = null;
        render(); update();
      });
    });
    render();
    if (opts.length === 1) { pick.w = opts[0].w; pick.h = opts[0].h; update(); }
    else {
      // пока размер не выбран — старая цена и скидка самого дешёвого варианта, как в каталоге
      var num = function (o) { return parseFloat(o.el.getAttribute("data-price").replace(/[^\d.,]/g, "").replace(",", ".")) || 0; };
      var cheap = opts.slice().sort(function (a, b) { return num(a) - num(b); })[0];
      if (cheap && cheap.el.getAttribute("data-disc")) {
        $("[data-rh-old]").textContent = cheap.el.getAttribute("data-old");
        var dd = $("[data-rh-disc]"); dd.hidden = false; dd.textContent = "−" + cheap.el.getAttribute("data-disc") + "%";
        $("[data-rh-size]").textContent = "минимальный размер " + cheap.w + " × " + cheap.h + " см";
      }
    }
    var start = { price: $("[data-rh-price]").textContent, old: $("[data-rh-old]").textContent, disc: $("[data-rh-disc]").hidden ? "" : $("[data-rh-disc]").textContent, size: $("[data-rh-size]").textContent };

    var qty = 1, qtyInput = $("[data-rh-qty-input]", buy), qtyVal = $("[data-rh-qty-val]", buy);
    $$("[data-rh-qty]", buy).forEach(function (b) {
      b.addEventListener("click", function () {
        qty = Math.max(1, Math.min(99, qty + Number(b.getAttribute("data-rh-qty"))));
        qtyInput.value = qty; qtyVal.textContent = qty;
      });
    });
    buy.addEventListener("submit", function (e) { if (!select.value || $("[data-rh-add]", buy).disabled) e.preventDefault(); });
  }

  // --- каталог: фильтры и сортировка по карточкам на странице
  var form = $("[data-rh-filter]");
  if (form) {
    var grid = $("[data-rh-grid]");
    var cards = $$("[data-rh-card]", grid);
    var rub = function (n) { return Math.round(n).toLocaleString("ru-RU") + " ₽"; };
    cards.forEach(function (c) {
      // варианты «ширина/высота|цена|старая цена;» — цену карточки берём у самого дешёвого
      var vars = c.getAttribute("data-variants").split(";").filter(Boolean).map(function (s) {
        var p = s.split("|"), wh = p[0].split("/").map(Number);
        return { w: wh[0], h: wh[1], price: parseFloat(p[1]) || 0, old: parseFloat(p[2]) || 0 };
      });
      var sizes = vars.map(function (v) { return [v.w, v.h]; });
      c._sizes = sizes;
      var min = vars.slice().sort(function (a, b) { return a.price - b.price || a.w * a.h - b.w * b.h; })[0];
      if (min) {
        c.setAttribute("data-price", min.price);
        $("[data-rh-card-price]", c).textContent = (vars.length > 1 ? "от " : "") + rub(min.price);
        if (min.old > min.price) {
          $("[data-rh-card-old]", c).textContent = rub(min.old);
          var d = $("[data-rh-card-disc]", c); d.hidden = false; d.textContent = "−" + Math.round((min.old - min.price) / min.old * 100) + "%";
        }
        if (min.h) $("[data-rh-card-size]", c).textContent = "за " + min.w + " × " + min.h + " см";
      }
      if (sizes.length) {
        var ws = sizes.map(function (s) { return s[0]; }), hs = sizes.map(function (s) { return s[1]; });
        var range = function (a) { var lo = Math.min.apply(null, a), hi = Math.max.apply(null, a); return lo === hi ? lo : lo + "–" + hi; };
        var el = $("[data-rh-size-range]", c);
        if (el && hs.every(function (h) { return h; })) el.textContent = "Размеры " + range(ws) + " × " + range(hs) + " см";
      }
    });
    var values = function (name) { return $$('[name="' + name + '"]:checked', form).map(function (i) { return i.value; }); };
    var apply = function () {
      var rooms = values("room"), blackout = values("blackout");
      var w = Number(form.elements.width.value) || 0, h = Number(form.elements.height.value) || 0;
      var price = (values("price")[0] || "").split("-").map(Number);
      var shown = 0;
      cards.forEach(function (c) {
        var p = parseFloat(c.getAttribute("data-price")) || 0;
        var ok = (!rooms.length || rooms.some(function (r) { return c.getAttribute("data-rooms").indexOf(r) >= 0; }))
          && (!blackout.length || blackout.some(function (b) { return c.getAttribute("data-blackout").indexOf(b) >= 0; }))
          && (!w && !h || c._sizes.some(function (s) { return (!w || s[0] === w) && (!h || s[1] === h); }))
          && (!price[0] && !price[1] || (p >= (price[0] || 0) && (!price[1] || p <= price[1])));
        c.hidden = !ok; if (ok) shown++;
      });
      var n = shown % 10 === 1 && shown % 100 !== 11 ? "товар" : [2, 3, 4].indexOf(shown % 10) >= 0 && [12, 13, 14].indexOf(shown % 100) < 0 ? "товара" : "товаров";
      $("[data-rh-count]").textContent = shown + " " + n;
      $("[data-rh-empty]").hidden = shown > 0;
      var active = rooms.length + blackout.length + (w ? 1 : 0) + (h ? 1 : 0) + (price[0] || price[1] ? 1 : 0);
      $("[data-rh-filter-count]").textContent = active ? "(" + active + ")" : "";
    };
    form.addEventListener("change", function (e) {
      if (e.target.hasAttribute("data-rh-nav")) { location.href = e.target.value; return; }
      apply();
    });
    $$("[data-rh-reset]").forEach(function (b) {
      b.addEventListener("click", function () {
        $$('input[type="checkbox"]', form).forEach(function (i) { i.checked = false; });
        form.elements.width.value = ""; form.elements.height.value = "";
        var anyPrice = $('[name="price"][value=""]', form); if (anyPrice) anyPrice.checked = true;
        apply();
      });
    });
    $$("[data-rh-filter-toggle]").forEach(function (b) { b.addEventListener("click", function () { $("#filter").classList.toggle("open"); }); });
    var sort = $("[data-rh-sort]");
    sort.addEventListener("change", function () {
      var key = function (c) { return parseFloat(c.getAttribute("data-price")) || 0; };
      cards.slice().sort(function (a, b) {
        if (sort.value === "cheap") return key(a) - key(b);
        if (sort.value === "expensive") return key(b) - key(a);
        return a.getAttribute("data-index") - b.getAttribute("data-index");
      }).forEach(function (c) { grid.appendChild(c); });
    });
    apply();
  }
})();
