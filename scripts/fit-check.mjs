// node scripts/fit-check.mjs — какие товары можно примерить на каком фото
import assert from "node:assert/strict";
import { fits, missingText } from "../src/fit.js";

const windowOnly = { window: true, bed: false, sofa: false, armchair: false };
const sofaOnly = { window: false, bed: false, sofa: true, armchair: false };
assert.equal(fits("curtains", windowOnly), true);
assert.equal(fits("bedspreads", windowOnly), false);   // покрывало на окно — нельзя
assert.equal(fits("pillows", windowOnly), false);
assert.equal(fits("pillows", sofaOnly), true);
assert.equal(fits("tulle", sofaOnly), false);
assert.equal(fits("bedspreads", undefined), true);      // фото ещё не распознано — не блокируем
assert.equal(missingText("bedspreads"), "Нужна кровать на фото");
assert.equal(missingText("tulle"), "Нужно окно на фото");
assert.equal(missingText("plaids"), "Нужна кровать, диван или кресло на фото");
console.log("fit ok");
