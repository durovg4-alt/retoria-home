// Предварительный расчёт пошива (MVP по ТЗ). Формулы черновые: до раскроя расчёт проверяет мастер,
// коэффициенты и цены утверждает технолог. На InSales формулы хранятся в настройках, не в шаблоне.
export const gather = { "Шторная лента": 2, "Люверсы": 1.8, "Скрытые петли": 1.5, "Французская складка": 2.5 };

export const measurePoint = {
  "Шторная лента": "от крючка карниза до пола",
  "Люверсы": "от верха штанги карниза до пола",
  "Скрытые петли": "от верха штанги карниза до пола",
  "Французская складка": "от крючка карниза до пола"
};

export const floorOptions = { "Не касается пола": -1, "Ровно в пол": 0, "С заломом": 8 };
export const linings = { "Без подкладки": 0, "Блэкаут": 590, "Термоподкладка": 790 };

const HEMS = 20;        // припуски на верх и низ, см
const ROLL = 140;       // ширина рулона, если высота больше высоты ткани без шва
const SEWING = 1490;    // пошив одного полотна, ₽

export function calcSewing({ rod, height, floor, fastening, panels, lining, fabric }) {
  const widthBefore = Math.ceil(rod * gather[fastening]);
  const finishedHeight = height + floorOptions[floor];
  const cutHeight = finishedHeight + HEMS;
  const seamless = cutHeight <= fabric.maxHeight;
  const meters = seamless
    ? widthBefore / 100 + .1 * panels
    : Math.ceil(widthBefore / ROLL) * cutHeight / 100;
  const price = Math.round((meters * fabric.pricePerMeter + SEWING * panels + meters * linings[lining]) / 10) * 10;
  return {
    widthBefore,
    panelWidthBefore: Math.ceil(widthBefore / panels),
    finishedWidth: rod,
    finishedHeight,
    meters: Math.round(meters * 100) / 100,
    seamless,
    blackout: lining === "Блэкаут" ? "100%" : fabric.blackout,
    price
  };
}
