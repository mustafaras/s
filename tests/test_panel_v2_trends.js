// ÆON Panel v2 — Faz 3 Trendler & Uyarılar fixture
"use strict";

const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

function read(rel) { return fs.readFileSync(path.join(root, rel), "utf8"); }

function assert(cond, msg) {
  if (!cond) {
    console.error("❌ FAIL: " + msg);
    process.exitCode = 1;
    throw new Error(msg);
  }
  console.log("✅ PASS: " + msg);
}

let html = "";
global.document = {
  getElementById: function(id) {
    if (id === "app") {
      return {
        innerHTML: html,
        set innerHTML(v) { html = v; }
      };
    }
    if (id === "root") {
      let theme = "dark";
      return {
        setAttribute: function(k, v) { if (k === "data-theme") theme = v; },
        getAttribute: function(k) { return k === "data-theme" ? theme : null; }
      };
    }
    return null;
  }
};

const vm = require("vm");
const ctx = {
  window: {},
  document: global.document,
  console: console,
  setTimeout: function(cb) { if (typeof cb === "function") cb(); return 0; },
  setInterval: function() { return 0; },
  clearTimeout: function() {},
  clearInterval: function() {}
};
ctx.window = ctx;

vm.createContext(ctx);
vm.runInContext(read("panelCoverageManifest.js"), ctx);
vm.runInContext(read("panel-v2.js"), ctx);

function countMatches(re) { return (html.match(re) || []).length; }

// 1. Boş data'da ae-empty görünür (init today sekmesinde açılır; Trendler sekmesini açalım)
ctx.AeonV2.init();
ctx.AeonV2.setTab("trends");
assert(html.indexOf("ae-empty") !== -1, "Boş data'da ae-empty görünür");
assert(/Trendler \& Uyarılar|Henüz synced veri yok/.test(html), "Boş durumda Trendler placeholder'ı var");

// 2. Seeded data ile summary grid
const today = "2026-08-04";
const days = {};
days[today] = {
  mood: { value: 4, note: "Huzurlu" },
  sleep: { duration: 6.5, quality: 7 },
  health: { steps: 8432 },
  nutrition: { waterGlasses: 7 },
  cravingSOSCount: 0,
  journal: { text: "Bugün güzeldi" }
};
for (let i = 1; i <= 6; i++) {
  const d = ctx.AeonV2.shiftDate ? null : null;
}

const seededData = { days: days };
ctx.AeonV2.setData(seededData);
ctx.AeonV2.setTab("trends");
assert(!/Henüz synced veri yok/.test(html), "Veri varlığında placeholder kalktı");
assert(html.indexOf("ae-grid--summary") !== -1, "Summary grid render edildi");
assert(countMatches(/ae-card--summary/g) >= 6, "En az 6 summary kart var");
assert(/Pencere/.test(html), "Pencere seçici var");
assert(/7 gün/.test(html), "7 günlük buton var");
assert(/14 gün/.test(html), "14 günlük buton var");
assert(/30 gün/.test(html), "30 günlük buton var");

// 3. Ortalama değerler doğru
assert(/Uyku ort\./.test(html), "Uyku ortalaması kartı var");
assert(/6,5\s*<span class="summary-card__unit">sa/.test(html), "Uyku ortalaması değeri doğru");
assert(/Adım ort\./.test(html), "Adım ortalaması kartı var");
assert(/8\.432\s*<span class="summary-card__unit">adım/.test(html), "Adım ortalaması değeri doğru");
assert(/Su ort\./.test(html), "Su ortalaması kartı var");
assert(/7,0\s*<span class="summary-card__unit">bardak/.test(html), "Su ortalaması değeri doğru");
assert(/SOS yoğ\./.test(html), "SOS yoğunluğu kartı var");
assert(/Eksik gün/.test(html), "Eksik gün kartı var");
assert(/MOH gün/.test(html), "MOH gün kartı var");

// 4. Pencere değişimi
assert(ctx.AeonV2.ui.trendWindow === 7, "Varsayılan pencere 7 gün");
ctx.AeonV2.setTrendWindow(14);
assert(ctx.AeonV2.ui.trendWindow === 14, "Pencere 14 güne geçti");
ctx.AeonV2.setTrendWindow(30);
assert(ctx.AeonV2.ui.trendWindow === 30, "Pencere 30 güne geçti");
ctx.AeonV2.setTrendWindow(99);
assert(ctx.AeonV2.ui.trendWindow === 30, "Aşırı pencere 30'a sınırlı");

// 5. Uyku düşüşü anomalisi
const sleepDropData = { days: {} };
for (let i = 0; i < 7; i++) {
  const d = dateOffset(today, -i);
  sleepDropData.days[d] = {
    mood: { value: 4 },
    sleep: { duration: 5 },
    health: { steps: 3000 },
    nutrition: { waterGlasses: 3 }
  };
}
for (let i = 7; i < 14; i++) {
  const d = dateOffset(today, -i);
  sleepDropData.days[d] = {
    mood: { value: 4 },
    sleep: { duration: 8 },
    health: { steps: 3000 },
    nutrition: { waterGlasses: 3 }
  };
}
ctx.AeonV2.setData(sleepDropData);
assert(/Uyku süresi son 7 günde %/.test(html), "Uyku düşüşü anomalisi tespit edildi");
assert(/anomaly-card--risk/.test(html), "Uyku düşüşü risk olarak işaretlendi");

// 6. SOS artışı anomalisi
const sosRiseData = { days: {} };
for (let i = 0; i < 7; i++) {
  const d = dateOffset(today, -i);
  sosRiseData.days[d] = {
    mood: { value: 4 },
    sleep: { duration: 7 },
    health: { steps: 5000 },
    nutrition: { waterGlasses: 5 },
    cravingSOSCount: 2
  };
}
ctx.AeonV2.setData(sosRiseData);
assert(/SOS kaydı artışı/.test(html), "SOS artışı anomalisi tespit edildi");

// 7. Eksik gün anomalisi
const missingData = { days: {} };
for (let i = 3; i < 14; i++) {
  const d = dateOffset(today, -i);
  missingData.days[d] = { mood: { value: 4 } };
}
ctx.AeonV2.setData(missingData);
assert(/gün arka arkaya kayıt yok/.test(html), "Eksik gün anomalisi tespit edildi");

// 8. Anomaliden gün detayına atlama
ctx.AeonV2.goToDayDetail("2026-08-01");
assert(ctx.AeonV2.ui.tab === "day", "goToDayDetail Gün Detayı sekmesine geçti");
assert(ctx.AeonV2.ui.date === "2026-08-01", "goToDayDetail tarihi güncelledi");

// 9. Anomali yokken ae-empty
const normalData = { days: {} };
for (let i = 0; i < 14; i++) {
  const d = dateOffset(today, -i);
  normalData.days[d] = {
    mood: { value: 5 },
    sleep: { duration: 7.5, quality: 8 },
    health: { steps: 9000 },
    nutrition: { waterGlasses: 8 },
    cravingSOSCount: 0,
    journal: { text: "gün " + i }
  };
}
ctx.AeonV2.setData(normalData);
ctx.AeonV2.setDate(today);
ctx.AeonV2.setTab("trends");
ctx.AeonV2.setTrendWindow(7);
assert(html.indexOf("Uyarı yok") !== -1, "Anomali yokken uyarı yok mesajı görünür");

console.log("\n🦩 Faz 3 Trendler & Uyarılar fixture — TÜM TESTLER BAŞARILI");

function dateOffset(base, days) {
  const d = new Date(base + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
