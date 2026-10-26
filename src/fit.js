// Куда товар можно «поставить» на фото комнаты. Общий файл для сайта и сервера примерки.
export const sceneLabels = { window: "Окно", bed: "Кровать", sofa: "Диван", armchair: "Кресло" };

export const needs = {
  curtains: ["window"],
  tulle: ["window"],
  accessories: ["window"],
  bedspreads: ["bed"],
  pillows: ["bed", "sofa", "armchair"],
  plaids: ["bed", "sofa", "armchair"]
};

export const fits = (cat, scene) => !scene || (needs[cat] || []).some((k) => scene[k]);

export const missingText = (cat) => ({
  window: "Нужно окно на фото",
  bed: "Нужна кровать на фото"
})[needs[cat]?.length === 1 ? needs[cat][0] : ""] || "Нужна кровать, диван или кресло на фото";
