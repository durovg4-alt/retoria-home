// node scripts/calc-check.mjs — самопроверка формул калькулятора
import assert from "node:assert/strict";
import { calcSewing } from "../src/calc.js";

const fabric = { blackout: "85–95%", maxHeight: 290, pricePerMeter: 1000 };
const r = calcSewing({ rod: 300, height: 260, floor: "Ровно в пол", fastening: "Шторная лента", panels: 2, lining: "Без подкладки", fabric });
assert.equal(r.widthBefore, 600);
assert.equal(r.panelWidthBefore, 300);
assert.equal(r.finishedHeight, 260);
assert.equal(r.seamless, true);           // 280 см кроя <= 290
assert.equal(r.meters, 6.2);
assert.equal(r.price, 9180);              // 6.2*1000 + 2*1490

const tall = calcSewing({ rod: 200, height: 280, floor: "С заломом", fastening: "Люверсы", panels: 1, lining: "Блэкаут", fabric });
assert.equal(tall.seamless, false);       // 308 > 290 — шьём по ширине рулона
assert.equal(tall.meters, 9.24);          // ceil(360/140)=3 * 3.08
assert.equal(tall.blackout, "100%");
console.log("calc ok");
