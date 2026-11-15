// RETORIA HOME: поведение шапки, карточки товара и каталога (перенесено из прототипа src/main.js).
// Характеристики товаров берём из JSON InSales (/product/<handle>.json, /collection/<handle>.json):
// в Liquid InSales они не выводились, а расчёт скидки падал с Liquid argument error.
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rub = function (n) { return Math.round(n).toLocaleString("ru-RU") + " ₽"; };
  var num = function (v) { return parseFloat(v) || 0; };
  var pct = function (price, old) { return old > price ? Math.round((old - price) / old * 100) : 0; };
  // название варианта InSales: «[цвет /] ширина / высота» — берём два последних значения (у комплектов перед размером стоит цвет)
  var sizeOf = function (title) { var p = String(title).split("/").map(function (s) { return s.trim(); }); return { c: p.slice(0, -2).join(" / "), w: p[p.length - 2], h: p[p.length - 1] }; };

  // параметры товара из JSON: { "Затемнение": "Полупрозрачный", ... } в порядке InSales
  var specsOf = function (p) {
    var byId = {};
    (p.characteristics || []).forEach(function (c) { (byId[c.property_id] = byId[c.property_id] || []).push(c.title); });
    var out = [];
    (p.properties || []).forEach(function (pr) { if (byId[pr.id]) out.push([pr.title, byId[pr.id].join(", ")]); });
    return out;
  };
  var spec = function (list, name) { var row = list.filter(function (r) { return r[0] === name; })[0]; return row ? row[1] : ""; };
  // как в прототипе: «Полупрозрачный» показываем как «Рассеивает свет»
  var lightLabel = function (v) { return /блэкаут/i.test(v) ? "Блэкаут" : v ? "Рассеивает свет" : ""; };
  // shortcut: цвета нет в параметрах InSales — берём из параметра «Цвет», если его добавят, иначе по названию; добавить «Параметр: Цвет» в импорт
  var colorOf = function (list, title) {
    var c = spec(list, "Цвет");
    if (c && /\+/.test(c)) return { name: c, hex: "linear-gradient(90deg, #1f1e1b 50%, #f4f2ec 50%)" }; // «Чёрные шторы + белый тюль»
    if (c) return { name: c, hex: /чёрн|черн/i.test(c) ? "#1f1e1b" : "#f4f2ec" };
    // у комплектов цвет при импорте стал свойством варианта, а не параметром — все комплекты: чёрные шторы + белый тюль
    if (/^Комплект/.test(title)) return { name: "Чёрные шторы + белый тюль", hex: "linear-gradient(90deg, #1f1e1b 50%, #f4f2ec 50%)" };
    if (/^Комплект/.test(title) && /чёрн|черн/i.test(title)) return { name: "Белый тюль + чёрные шторы", hex: "linear-gradient(90deg, #f4f2ec 50%, #1f1e1b 50%)" };
    return /чёрн|черн/i.test(title) && !/^Комплект/.test(title) ? { name: "№ 08 Чёрный", hex: "#1f1e1b" } : { name: "№ 01 Белый", hex: "#f4f2ec" };
  };

  // --- шапка: меню на телефоне и тень при прокрутке
  var head = $("[data-rh-header]");
  if (head) {
    var toggle = $("[data-menu]", head);
    toggle.addEventListener("click", function () {
      var open = !head.classList.contains("menu-open");
      // меню открывается сразу под шапкой (в CSS прототипа top: var(--menu-top))
      $(".mobile-menu", head).style.setProperty("--menu-top", Math.max(0, $(".header", head).getBoundingClientRect().bottom) + "px");
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
    var root = $("[data-rh-product]");
    var title = $("h1", root).textContent.trim();
    var isKit = /^Комплект/.test(title);
    var main = $("[data-rh-main]");
    var thumbs = $$("[data-rh-thumb]");
    // листаем только видимые миниатюры (у «Молнии» видны фото выбранного цвета)
    var visible = function () { return thumbs.filter(function (t) { return !t.hidden; }); };
    var showPhoto = function (i) {
      var v = visible();
      if (!v.length) return;
      i = (i + v.length) % v.length;
      thumbs.forEach(function (t) { t.classList.toggle("active", t === v[i]); });
      main.src = v[i].getAttribute("data-rh-thumb");
    };
    var current = function () { return Math.max(0, visible().findIndex(function (t) { return t.classList.contains("active"); })); };
    thumbs.forEach(function (t) { t.addEventListener("click", function () { showPhoto(visible().indexOf(t)); }); });
    $$("[data-rh-step]").forEach(function (b) { b.addEventListener("click", function () { showPhoto(current() + Number(b.getAttribute("data-rh-step"))); }); });
    main.addEventListener("click", function () { showPhoto(current() + 1); });

    var select = $("[data-rh-variants]", buy);
    var opts = Array.prototype.slice.call(select.options).map(function (o) {
      var p = sizeOf(o.getAttribute("data-title"));
      return { el: o, c: p.c, w: p.w, h: p.h, price: num(o.getAttribute("data-p")), old: num(o.getAttribute("data-o")), sku: o.getAttribute("data-sku"), available: o.getAttribute("data-available") !== "false" };
    });
    var cheap = opts.slice().sort(function (a, b) { return a.price - b.price || a.w * a.h - b.w * b.h; })[0];
    var fastening = "";
    var category = /^Шторы/.test(title) ? "Шторы" : isKit ? "Комплект на окно" : "Тюль";
    var setEyebrow = function (sku) { $("[data-rh-eyebrow]").textContent = category + (sku ? " · арт. " + sku : ""); };
    var getText = function (o) {
      if (!o) return "Выберите размер";
      var size = o.w + " × " + o.h + " см";
      if (isKit) return "Комплект на окно " + size + ": тюль и 2 шторы";
      return "1 полотно " + size + (fastening ? ", " + fastening.toLowerCase() : "");
    };
    var wRow = $('[data-rh-opt="w"]'), hRow = $('[data-rh-opt="h"]');
    var pick = { c: "", w: null, h: null };
    // цвет как свойство варианта («Белый» / «Белый с золотом» у «Молнии»): кликабельные образцы
    var colorList = opts.map(function (o) { return o.c; }).filter(function (c, i, a) { return c && a.indexOf(c) === i; });
    var multiColor = colorList.length > 1;
    var hexOf = function (c) { return /золот/i.test(c) ? "linear-gradient(135deg, #f4f2ec 55%, #c9a24a 55%)" : /шоколад|мрамор/i.test(c) ? "#5a4232" : /чёрн|черн/i.test(c) ? "#1f1e1b" : "#f4f2ec"; };
    var inColor = function (o) { return !multiColor || o.c === pick.c; };
    // фото по цвету: метка цвета в имени файла (золотой «Молнии» — *-gold-*, штор — *-black-* / *-marble-*);
    // файл без метки относится к цвету без метки (белая «Молния»); общие инфографики (*-common-*) видны всегда
    var tagOf = function (c) { return /золот/i.test(c) ? /gold/ : /шоколад|мрамор/i.test(c) ? /marble/ : /чёрн|черн/i.test(c) ? /black/ : null; };
    var filterThumbs = function () {
      if (!multiColor) return;
      var tag = tagOf(pick.c), tags = colorList.map(tagOf).filter(Boolean);
      thumbs.forEach(function (t) {
        var src = t.getAttribute("data-rh-thumb");
        t.hidden = !/common/.test(src) && (tag ? !tag.test(src) : tags.some(function (r) { return r.test(src); }));
      });
      showPhoto(0);
    };
    var drawColors = function () {
      if (!multiColor) return;
      $("[data-rh-color]").hidden = false;
      $("[data-rh-color-name]").textContent = pick.c;
      $("[data-rh-color] .swatches").innerHTML = colorList.map(function (c) {
        return '<button type="button" class="swatch' + (c === pick.c ? " selected" : "") + '" aria-pressed="' + (c === pick.c) + '" aria-label="' + c + '" title="' + c + '" data-c="' + c + '" style="background:' + hexOf(c) + '"></button>';
      }).join("");
    };
    var uniq = function (arr) { return arr.filter(function (v, i) { return v && arr.indexOf(v) === i; }).sort(function (a, b) { return a - b; }); };
    var render = function () {
      if (!wRow) return;
      var draw = function (row, key, values, ok) {
        row.innerHTML = values.map(function (v) {
          var off = !ok(v);
          return '<button type="button" class="choice' + (pick[key] === v ? " selected" : "") + (off ? ' rh-off" title="Нет в этом сочетании — второй размер сбросится"' : '"') + ' data-v="' + v + '">' + v + "</button>";
        }).join("");
      };
      var cOpts = opts.filter(inColor);
      draw(wRow, "w", uniq(cOpts.map(function (o) { return o.w; })), function (w) { return !pick.h || cOpts.some(function (o) { return o.w === w && o.h === pick.h; }); });
      draw(hRow, "h", uniq(cOpts.map(function (o) { return o.h; })), function (h) { return !pick.w || cOpts.some(function (o) { return o.h === h && o.w === pick.w; }); });
    };
    var showPrice = function (o, from) {
      $("[data-rh-price]").textContent = (from ? "от " : "") + rub(o.price);
      $("[data-rh-old]").textContent = o.old > o.price ? rub(o.old) : "";
      var d = $("[data-rh-disc]"), p = pct(o.price, o.old);
      d.hidden = !p; d.textContent = p ? "−" + p + "%" : "";
    };
    var update = function () {
      var match = opts.filter(function (o) { return inColor(o) && o.w === pick.w && o.h === pick.h; })[0];
      var add = $("[data-rh-add]", buy);
      $("[data-rh-get]").textContent = getText(match);
      if (!match) {
        add.disabled = true; add.textContent = "Выберите размер"; select.value = "";
        showPrice(cheap, opts.length > 1);
        $("[data-rh-size]").textContent = cheap.h ? "минимальный размер " + cheap.w + " × " + cheap.h + " см" : "";
        setEyebrow("");
        return;
      }
      select.value = match.el.value;
      showPrice(match, false);
      $("[data-rh-size]").textContent = match.h ? "размер " + match.w + " × " + match.h + " см" : "";
      setEyebrow(match.sku);
      $("[data-rh-stock]").textContent = match.available ? "В наличии" : "Нет в наличии";
      add.disabled = !match.available;
      add.textContent = match.available ? "В корзину" : "Нет в наличии";
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
    // заказчик 2026-11-16: сразу выбран минимальный размер (самый дешёвый, при равной цене — самый маленький)
    if (cheap) { pick.c = cheap.c; pick.w = cheap.w; pick.h = cheap.h; }
    filterThumbs(); drawColors(); render(); update();
    if (multiColor) $("[data-rh-color]").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-c]");
      if (!b) return;
      pick.c = b.getAttribute("data-c");
      if (!opts.some(function (o) { return inColor(o) && o.w === pick.w && o.h === pick.h; })) { pick.w = null; pick.h = null; }
      filterThumbs(); drawColors(); render(); update();
    });

    // характеристики, цвет, крепление — из JSON товара
    fetch(root.getAttribute("data-rh-product") + ".json").then(function (r) { return r.json(); }).then(function (j) {
      var list = specsOf(j.product || {});
      var light = lightLabel(spec(list, "Затемнение")), rooms = spec(list, "Помещение");
      $("[data-rh-facts]").innerHTML = [light, rooms].filter(Boolean).map(function (t) { return "<span>" + t + "</span>"; }).join("");
      if (!multiColor) {
        var color = colorOf(list, title);
        $("[data-rh-color-name]").textContent = color.name;
        var sw = $("[data-rh-swatch]"); sw.style.background = color.hex; sw.setAttribute("aria-label", color.name);
        $("[data-rh-color]").hidden = false;
      }
      fastening = spec(list, "Крепление") || (isKit ? "Шторная лента" : "");
      if (fastening) { $("[data-rh-fastening-val]").textContent = fastening; $("[data-rh-fastening]").hidden = false; }
      if (!isKit && !spec(list, "Комплект")) { $("[data-rh-panels-val]").textContent = "Одно полотно"; $("[data-rh-panels]").hidden = false; }
      if (spec(list, "Комплект")) $("[data-rh-get]").textContent = spec(list, "Комплект");
      else update();
      $("[data-rh-short]").textContent = spec(list, "Краткое описание");
      var rows = list.filter(function (r) { return ["Помещение", "Краткое описание"].indexOf(r[0]) < 0; });
      if (rows.length) {
        $("[data-rh-spec-list]").innerHTML = rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("");
        $("[data-rh-specs]").hidden = false;
      }
    }).catch(function () { /* без JSON остаётся карточка с размерами и ценой */ });

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
    cards.forEach(function (c) {
      // варианты «ширина/высота|цена|старая цена;» — цену карточки берём у самого дешёвого
      var vars = c.getAttribute("data-variants").split(";").filter(Boolean).map(function (s) {
        var p = s.split("|"), z = sizeOf(p[0]), wh = [Number(z.w), Number(z.h)];
        return { w: wh[0], h: wh[1], price: num(p[1]), old: num(p[2]) };
      });
      c._sizes = vars.map(function (v) { return [v.w, v.h]; });
      var min = vars.slice().sort(function (a, b) { return a.price - b.price || a.w * a.h - b.w * b.h; })[0];
      if (min) {
        c.setAttribute("data-price", min.price);
        $("[data-rh-card-price]", c).textContent = (vars.length > 1 ? "от " : "") + rub(min.price);
        var p = pct(min.price, min.old);
        if (p) {
          $("[data-rh-card-old]", c).textContent = rub(min.old);
          var d = $("[data-rh-card-disc]", c); d.hidden = false; d.textContent = "−" + p + "%";
        }
        if (min.h) $("[data-rh-card-size]", c).textContent = "за " + min.w + " × " + min.h + " см";
      }
      if (vars.length && vars.every(function (v) { return v.h; })) {
        var range = function (a) { var lo = Math.min.apply(null, a), hi = Math.max.apply(null, a); return lo === hi ? lo : lo + "–" + hi; };
        $("[data-rh-size-range]", c).textContent = "Размеры " + range(vars.map(function (v) { return v.w; })) + " × " + range(vars.map(function (v) { return v.h; })) + " см";
      }
    });
    var values = function (name) { return $$('[name="' + name + '"]:checked', form).map(function (i) { return i.value; }); };
    var apply = function () {
      var rooms = values("room"), blackout = values("blackout");
      var w = Number(form.elements.width.value) || 0, h = Number(form.elements.height.value) || 0;
      var price = (values("price")[0] || "").split("-").map(Number);
      var shown = 0;
      cards.forEach(function (c) {
        var p = num(c.getAttribute("data-price"));
        var ok = (!rooms.length || rooms.some(function (r) { return (c.getAttribute("data-rooms") || "").indexOf(r) >= 0; }))
          && (!blackout.length || blackout.some(function (b) { return (c.getAttribute("data-blackout") || "").indexOf(b) >= 0; }))
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
    // комната и затемнение — из JSON категории
    fetch(location.pathname.replace(/\/$/, "") + ".json").then(function (r) { return r.json(); }).then(function (j) {
      var byUrl = {};
      (j.products || []).forEach(function (p) { byUrl[p.url] = specsOf(p); });
      cards.forEach(function (c) {
        var list = byUrl[c.getAttribute("data-url")];
        if (!list) return;
        var light = spec(list, "Затемнение");
        c.setAttribute("data-rooms", spec(list, "Помещение"));
        c.setAttribute("data-blackout", light);
        var row = $("[data-rh-card-light]", c);
        if (light && row) { row.textContent = lightLabel(light); row.parentNode.hidden = false; }
      });
      apply();
    }).catch(function () {});
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
      var key = function (c) { return num(c.getAttribute("data-price")); };
      cards.slice().sort(function (a, b) {
        if (sort.value === "cheap") return key(a) - key(b);
        if (sort.value === "expensive") return key(b) - key(a);
        return a.getAttribute("data-index") - b.getAttribute("data-index");
      }).forEach(function (c) { grid.appendChild(c); });
    });
    apply();
  }
})();
