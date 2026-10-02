const ids = [
  "modelWeight",
  "printHours",
  "spoolPrice",
  "spoolWeight",
  "printerPower",
  "electricityRate",
  "printerPrice",
  "printerLife",
  "wastePercent",
  "marginPercent",
  "manualWork",
  "extraCosts"
];

const defaults = {
  modelWeight: 120,
  printHours: 8,
  spoolPrice: 1800,
  spoolWeight: 1000,
  printerPower: 150,
  electricityRate: 7,
  printerPrice: 45000,
  printerLife: 6000,
  wastePercent: 10,
  marginPercent: 50,
  manualWork: 0,
  extraCosts: 0
};

const els = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));

const out = {
  wasteOutput: document.getElementById("wasteOutput"),
  marginOutput: document.getElementById("marginOutput"),
  finalPrice: document.getElementById("finalPrice"),
  baseCost: document.getElementById("baseCost"),
  filamentCost: document.getElementById("filamentCost"),
  electricityCost: document.getElementById("electricityCost"),
  wearCost: document.getElementById("wearCost"),
  wasteCost: document.getElementById("wasteCost"),
  manualCostOut: document.getElementById("manualCostOut"),
  extraCostOut: document.getElementById("extraCostOut"),
  rubPerGram: document.getElementById("rubPerGram"),
  rubPerHour: document.getElementById("rubPerHour"),
  profitValue: document.getElementById("profitValue")
};

const fmt = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2
});

function n(el, fallback = 0) {
  const value = Number(el.value);
  return Number.isFinite(value) ? value : fallback;
}

function rub(value) {
  if (!Number.isFinite(value)) value = 0;
  return `${fmt.format(Math.max(0, value))} ₽`;
}

function saveSettings() {
  const data = {};
  ids.forEach(id => data[id] = els[id].value);
  localStorage.setItem("fila-calc-settings", JSON.stringify(data));
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("fila-calc-settings"));
    if (!saved) return;
    ids.forEach(id => {
      if (saved[id] !== undefined) els[id].value = saved[id];
    });
  } catch (_) {}
}

function calculate() {
  const modelWeight = Math.max(0, n(els.modelWeight));
  const printHours = Math.max(0, n(els.printHours));
  const spoolPrice = Math.max(0, n(els.spoolPrice));
  const spoolWeight = Math.max(1, n(els.spoolWeight, 1));
  const printerPower = Math.max(0, n(els.printerPower));
  const electricityRate = Math.max(0, n(els.electricityRate));
  const printerPrice = Math.max(0, n(els.printerPrice));
  const printerLife = Math.max(1, n(els.printerLife, 1));
  const wastePercent = Math.max(0, n(els.wastePercent));
  const marginPercent = Math.max(0, n(els.marginPercent));
  const manualWork = Math.max(0, n(els.manualWork));
  const extraCosts = Math.max(0, n(els.extraCosts));

  const filament = (modelWeight / spoolWeight) * spoolPrice;
  const electricity = (printerPower / 1000) * printHours * electricityRate;
  const wear = (printerPrice / printerLife) * printHours;

  const productionBase = filament + electricity + wear;
  const waste = productionBase * (wastePercent / 100);

  const baseCost = productionBase + waste + manualWork + extraCosts;
  const profit = baseCost * (marginPercent / 100);
  const finalPrice = baseCost + profit;

  out.wasteOutput.textContent = `${wastePercent}%`;
  out.marginOutput.textContent = `${marginPercent}%`;

  out.filamentCost.textContent = rub(filament);
  out.electricityCost.textContent = rub(electricity);
  out.wearCost.textContent = rub(wear);
  out.wasteCost.textContent = rub(waste);
  out.manualCostOut.textContent = rub(manualWork);
  out.extraCostOut.textContent = rub(extraCosts);
  out.baseCost.textContent = rub(baseCost);
  out.finalPrice.textContent = rub(finalPrice);
  out.profitValue.textContent = rub(profit);

  const rubPerGram = modelWeight > 0 ? finalPrice / modelWeight : 0;
  const rubPerHour = printHours > 0 ? finalPrice / printHours : 0;

  out.rubPerGram.textContent = `${fmt.format(rubPerGram)} ₽/г`;
  out.rubPerHour.textContent = `${fmt.format(rubPerHour)} ₽/ч`;

  saveSettings();
}

ids.forEach(id => {
  els[id].addEventListener("input", calculate);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  Object.entries(defaults).forEach(([id, value]) => {
    els[id].value = value;
  });
  localStorage.removeItem("fila-calc-settings");
  calculate();
});

loadSettings();
calculate();
