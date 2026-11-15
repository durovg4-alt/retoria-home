// RETORIA HOME: интерактив страниц (перенесено из прототипа src/main.js и src/calc.js):
// калькулятор пошива, выбор образцов, отправка заявок в InSales, ползунок «до / после», якоря «Покупателям».
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var rub = function (n) { return Math.round(n).toLocaleString("ru-RU") + " ₽"; };
  var CONSENT = '<label class="check consent"><input type="checkbox" name="Согласие" value="да" required><span>Согласен на <a href="/page/oferta#consent">обработку персональных данных</a></span></label>';

  // --- «Покупателям»: /page/contacts открывается сразу на контактах
  var anchorBox = $("[data-rh-anchor]");
  if (anchorBox && !location.hash) {
    var target = document.getElementById(anchorBox.getAttribute("data-rh-anchor"));
    if (target && anchorBox.getAttribute("data-rh-anchor") !== "delivery") setTimeout(function () { target.scrollIntoView(); }, 50);
  }

  // --- «до / после»
  document.addEventListener("input", function (e) {
    if (e.target.matches(".compare-range")) e.target.closest("[data-comparison]").style.setProperty("--split", e.target.value + "%");
  });

  // --- заявки: уходят в «Обратную связь» InSales (админка → Обратная связь), запасной путь — WhatsApp
  var SUBJECT = { sew: "Расчёт пошива", samples: "Заказ образцов", help: "Помощь мастера по фото" };
  document.addEventListener("submit", function (e) {
    var form = e.target;
    var kind = form.getAttribute("data-rh-lead");
    if (!kind) return;
    e.preventDefault();
    var data = new FormData(form), lines = [], name = "", phone = "";
    data.forEach(function (v, k) {
      if (k === "Согласие" || !String(v).trim()) return;
      if (k === "Имя") name = v;
      if (k === "Контакт" || k === "Телефон") phone = v;
      lines.push(k + ": " + v);
    });
    var text = lines.join("\n");
    var btn = form.querySelector("button"); var label = btn.textContent;
    btn.disabled = true; btn.textContent = "Отправляем…";
    var body = new URLSearchParams({ name: name, phone: phone, subject: SUBJECT[kind] || "Заявка с сайта", content: text, agree: "1" });
    var done = function (ok) {
      btn.disabled = false; btn.textContent = label;
      var note = form.querySelector(".rh-lead-note") || form.appendChild(Object.assign(document.createElement("p"), { className: "rh-lead-note" }));
      if (ok) { note.className = "rh-lead-note ok"; note.textContent = "Спасибо! Заявка отправлена — мастер свяжется с вами в рабочее время."; form.reset(); }
      else {
        note.className = "rh-lead-note warn";
        note.innerHTML = 'Не получилось отправить. Напишите нам в <a class="text-link" target="_blank" rel="noopener" href="https://wa.me/79201812013?text=' + encodeURIComponent(SUBJECT[kind] + "\n" + text) + '">WhatsApp</a> или позвоните 8 920 181-20-13.';
      }
    };
    fetch("/client_account/feedback.json", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "Accept": "application/json" }, body: body.toString() })
      .then(function (r) { return r.json().catch(function () { return { status: r.ok ? "ok" : "error" }; }).then(function (j) { done(r.ok && j.status !== "error"); }); })
      .catch(function () { done(false); });
  });

  // --- образцы: до пяти, список уходит в заявку
  var samples = [];
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-sample]");
    if (!b) return;
    var key = b.getAttribute("data-sample"), label = b.querySelector("strong").textContent + ", " + b.querySelector("span").textContent;
    var has = samples.some(function (s) { return s.key === key; });
    if (!has && samples.length >= 5) { alert("Можно выбрать до пяти образцов"); return; }
    samples = has ? samples.filter(function (s) { return s.key !== key; }) : samples.concat({ key: key, label: label });
    b.classList.toggle("selected", !has); b.setAttribute("aria-pressed", !has);
    $("[data-sample-count]").textContent = samples.length;
    $("[data-sample-list]").innerHTML = samples.length ? samples.map(function (s) { return esc(s.label); }).join("<br>") : "Пока ничего не выбрано";
    var field = $("[data-sample-field]"); if (field) field.value = samples.map(function (s) { return s.label; }).join("; ");
  });

  // --- калькулятор пошива (формулы src/calc.js; ставки ₽/м² посчитаны по готовым размерам каждой ткани)
  var sew = $("[data-sew]");
  if (sew) {
    var D = {
      gather: { "Шторная лента": 2, "Люверсы": 1.8, "Скрытые петли": 1.5, "Французская складка": 2.5 },
      measurePoint: { "Шторная лента": "от крючка карниза до пола", "Люверсы": "от верха штанги карниза до пола", "Скрытые петли": "от верха штанги карниза до пола", "Французская складка": "от крючка карниза до пола" },
      floor: { "Не касается пола": -1, "Ровно в пол": 0, "С заломом": 8 },
      lining: { "Без подкладки": 0, "Блэкаут": 590, "Термоподкладка": 790 },
      colors: { "10": ["Шоколадный мрамор", "#5a4232"], "01": ["Белый", "#f4f2ec"], "02": ["Молочный", "#e8dfcf"], "03": ["Льняной", "#d4c4a8"], "04": ["Песочный", "#b89c7a"], "05": ["Серо-бежевый", "#a39a8b"], "06": ["Графит", "#3f3f3b"], "07": ["Оливковый", "#686a43"], "08": ["Чёрный", "#1f1e1b"], "09": ["Серебро", "#c9c8c2"] },
      // shortcut: ткани и ставки перенесены из прототипа на 2026-11-15; при смене цен — пересчитать (scripts/calc-check.mjs в исходниках)
      fabrics: [
        ["len-molniya", "Тюль под лён «Молния»", "Рассеивает свет", ["01", "02"], 237], ["len-babochka", "Тюль под лён «Бабочка»", "Рассеивает свет", ["01"], 254],
        ["len-zoloto", "Тюль под лён «Блеск золото»", "Рассеивает свет", ["01"], 198], ["len-spiral", "Тюль под лён «Спираль»", "Прозрачный", ["01"], 288],
        ["len-rasteniya", "Тюль под лён «Растения»", "Прозрачный", ["01"], 276], ["len-zvezda", "Тюль под лён «Звезда»", "Рассеивает свет", ["01"], 246],
        ["len-kolco", "Тюль под лён «Кольца»", "Рассеивает свет", ["01"], 206], ["len-kvadrat", "Тюль под лён «Квадрат»", "Рассеивает свет", ["09"], 246],
        ["len-organza", "Тюль под лён «Органза»", "Рассеивает свет", ["01"], 246], ["voile", "Вуаль белая однотонная", "Прозрачный", ["01"], 246],
        ["blackout-molniya", "Бархат блэкаут «Молния»", "85–95%", ["08"], 1014], ["blackout-marble", "Бархат блэкаут «Мрамор»", "85–95%", ["10"], 1014]
      ].map(function (f) { return { id: f[0], name: f[1], blackout: f[2], colors: f[3], rate: f[4], fastenings: ["Шторная лента"], linings: ["Без подкладки"] }; })
    };
    var fabricById = function (id) { return D.fabrics.filter(function (f) { return f.id === id; })[0]; };
    var colorName = function (c) { return "№ " + c + " " + D.colors[c][0]; };
    var blackoutLabel = function (b) { return b === "85–95%" ? "Затемнение 85–95%" : b; };
    var param = new URLSearchParams(location.search).get("fabric");
    var start = fabricById(param) || D.fabrics[1];
    var s = { fabric: start.id, color: start.colors[0], rod: 300, height: 260, floor: "Ровно в пол", fastening: "Шторная лента", panels: 2, lining: "Без подкладки" };

    var calc = function (fabric) {
      var widthBefore = Math.ceil(s.rod * D.gather[s.fastening]);
      var finishedHeight = s.height + D.floor[s.floor];
      var meters = widthBefore / 100 + 0.1 * s.panels; // высоту рулона ещё не прислали — считаем без шва
      var price = fabric.rate ? Math.round(s.rod * finishedHeight / 1e4 * fabric.rate / 10) * 10 : null;
      return { widthBefore: widthBefore, panelWidthBefore: Math.ceil(widthBefore / s.panels), finishedHeight: finishedHeight, meters: Math.round(meters * 100) / 100, price: price };
    };
    var radios = function (name, values, current) {
      return '<div class="choice-row">' + values.map(function (x) {
        return '<label class="choice-radio"><input type="radio" name="' + name + '" value="' + x + '"' + (String(current) === String(x) ? " checked" : "") + "><span>" + (name === "panels" ? (x === 1 ? "Одно полотно" : "Пара") : x) + "</span></label>";
      }).join("") + "</div>";
    };
    var formHtml = function () {
      var f = fabricById(s.fabric);
      return '<form class="sew-form" data-sew-form>' +
        '<div class="field"><label for="sew-fabric">Ткань</label><select id="sew-fabric" name="fabric">' + D.fabrics.map(function (x) { return '<option value="' + x.id + '"' + (x.id === s.fabric ? " selected" : "") + ">" + x.name + " · " + blackoutLabel(x.blackout) + "</option>"; }).join("") + "</select></div>" +
        '<div class="field"><span class="label">Цвет</span><div class="swatch-checks">' + f.colors.map(function (c) { return '<label title="' + colorName(c) + '"><input type="radio" name="color" value="' + c + '"' + (c === s.color ? " checked" : "") + '><i style="background:' + D.colors[c][1] + '"></i><small>' + c + "</small></label>"; }).join("") + '</div><small class="muted">' + colorName(s.color) + "</small></div>" +
        '<div class="field-grid"><div class="field"><label for="sew-rod">Ширина карниза, см</label><input id="sew-rod" name="rod" type="number" min="60" max="800" required value="' + s.rod + '"><small class="muted">Между крайними крючками, без наконечников</small></div>' +
        '<div class="field"><label for="sew-height">Высота, см</label><input id="sew-height" name="height" type="number" min="100" max="400" required value="' + s.height + '"><small class="muted" data-height-hint>Измеряйте ' + D.measurePoint[s.fastening] + "</small></div></div>" +
        '<div class="field"><span class="label">Положение относительно пола</span>' + radios("floor", Object.keys(D.floor), s.floor) + "</div>" +
        '<div class="field"><span class="label">Крепление</span>' + radios("fastening", f.fastenings, s.fastening) + "</div>" +
        '<div class="field"><span class="label">Количество полотен</span>' + radios("panels", [1, 2], s.panels) + "</div>" +
        '<div class="field"><span class="label">Подкладка</span>' + radios("lining", f.linings, s.lining) + "</div>" +
        '<p class="muted small">Крепление «Французская складка» и подкладки — после подтверждения технологом. <a class="text-link" href="/page/measure">Как замерить <span aria-hidden="true">→</span></a></p></form>' +
        '<div class="summary sew-result" data-sew-result>' + resultHtml() + "</div>";
    };
    var resultHtml = function () {
      var f = fabricById(s.fabric);
      if (!(s.rod >= 60 && s.height >= 100)) return '<h2>Расчёт</h2><p class="muted">Введите ширину карниза (от 60 см) и высоту (от 100 см).</p>';
      var r = calc(f);
      var summary = f.name + ", " + colorName(s.color) + ", карниз " + s.rod + " см, высота " + s.height + " см, " + s.floor + ", " + s.fastening + ", полотен " + s.panels + ", " + s.lining + "; до сборки " + r.widthBefore + " см, расход " + r.meters + " м" + (r.price ? ", ≈ " + r.price + " ₽" : "");
      return "<h2>Предварительный расчёт</h2>" +
        '<div class="summary-row"><span>Ширина до сборки</span><strong>' + r.widthBefore + " см" + (s.panels === 2 ? " (2 × " + r.panelWidthBefore + ")" : "") + "</strong></div>" +
        '<div class="summary-row"><span>Ширина в готовом виде</span><strong>' + s.rod + " см</strong></div>" +
        '<div class="summary-row"><span>Высота изделия</span><strong>' + r.finishedHeight + " см</strong></div>" +
        '<div class="summary-row"><span>Расход ткани</span><strong>' + String(r.meters).replace(".", ",") + " м</strong></div>" +
        '<div class="summary-row"><span>Затемнение</span><strong>' + f.blackout + "</strong></div>" +
        '<div class="summary-row"><span>Срок</span><strong>3–5 рабочих дней</strong></div>' +
        '<div class="summary-row total"><span>Ориентировочно</span><span>' + (r.price ? "≈ " + rub(r.price) : "рассчитает мастер") + "</span></div>" +
        (r.price ? '<p class="muted small">Оценка по ценам наших готовых размеров' + (s.lining !== "Без подкладки" ? ", без учёта подкладки" : "") + ".</p>" : "") +
        '<p class="warn">Расчёт предварительный. В раскрой заказ автоматически не уходит: мастер проверит замеры и подтвердит цену.</p>' +
        '<form data-rh-lead="sew" class="lead-mini"><input type="hidden" name="Расчёт" value="' + esc(summary) + '">' +
        '<div class="field"><label>Имя</label><input name="Имя" required autocomplete="name"></div>' +
        '<div class="field"><label>Телефон или мессенджер</label><input name="Контакт" required autocomplete="tel"></div>' + CONSENT +
        '<button class="pill primary">Отправить расчёт мастеру</button></form>';
    };
    var draw = function () { sew.innerHTML = formHtml(); };
    sew.addEventListener("input", function (e) {
      var form = e.target.form;
      if (!form || !form.matches("[data-sew-form]")) return;
      var d = Object.fromEntries(new FormData(form));
      var changed = d.fabric !== s.fabric, f = fabricById(d.fabric);
      s = { fabric: f.id, color: f.colors.indexOf(d.color) >= 0 ? d.color : f.colors[0], rod: +d.rod, height: +d.height, floor: d.floor, fastening: f.fastenings.indexOf(d.fastening) >= 0 ? d.fastening : f.fastenings[0], panels: +d.panels, lining: f.linings.indexOf(d.lining) >= 0 ? d.lining : f.linings[0] };
      if (changed || e.target.name === "color") { draw(); return; }
      $("[data-height-hint]", sew).textContent = "Измеряйте " + D.measurePoint[s.fastening];
      $("[data-sew-result]", sew).innerHTML = resultHtml();
    });
    draw();
  }
})();
