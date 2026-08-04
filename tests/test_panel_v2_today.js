// ÆON Panel v2 — Faz 2 Genel Bakış fixture
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

function countMatches(re) {
  const m = html.match(re) || [];
  return m.length;
}

// 1. Boş data'da ae-empty görünür
ctx.AeonV2.init();
// Üstbar + sekme + panel wrapper render edilmiş olur; ae-empty'yi panel içinde arıyoruz
const hasEmpty = html.indexOf('ae-empty') !== -1;
assert(hasEmpty, "Boş data'da ae-empty görünür");
assert(html.indexOf('Genel Bakış') !== -1, "Boş durumda Today başlığı var");

// 2. Seeded data ile render
const seededData = {
  days: {
    "2026-08-04": {
      mood: { value: 4, note: "Huzurlu" },
      cravingSOSCount: 0,
      health: { steps: 8432 },
      nutrition: { waterGlasses: 7 },
      journal: { text: "Bugün güzeldi" }
    },
    "2026-08-03": {
      sleep: { duration: 7.5, quality: 8 },
      mood: { value: 3 },
      health: { steps: 6200 },
      nutrition: { waterGlasses: 5 }
    },
    "2026-08-02": {
      mood: { value: 5 },
      sleep: { duration: 6 },
      health: { steps: 10500 },
      nutrition: { waterGlasses: 9 }
    },
    "2026-08-01": {
      mood: { value: 2 },
      sleep: { duration: 5.5 },
      health: { steps: 3100 },
      nutrition: { waterGlasses: 4 }
    },
    "2026-07-31": {
      mood: { value: 6 },
      sleep: { duration: 8 },
      health: { steps: 12000 },
      nutrition: { waterGlasses: 10 }
    },
    "2026-07-30": {
      mood: { value: 4 },
      sleep: { duration: 7 },
      health: { steps: 7800 },
      nutrition: { waterGlasses: 6 }
    },
    "2026-07-29": {
      mood: { value: 5 },
      sleep: { duration: 6.5 },
      health: { steps: 9100 },
      nutrition: { waterGlasses: 8 }
    }
  }
};

ctx.AeonV2.setData(seededData);
assert(!/class="ae-empty"/.test(html), "Seeded data'da ae-empty kalktı");

// 3. 4 hero kart var
assert((html.match(/ae-card--hero/g) || []).length === 4, "4 hero kart render edildi");
assert(/Huzurlu/.test(html), "Mod kartı Huzurlu değerini gösteriyor");
assert(/7sa 30dk/.test(html), "Uyku kartı süreyi gösteriyor");
assert(/8\.432/.test(html), "Adım kartı değerini gösteriyor");
assert(/Sessiz|SOS/.test(html), "SOS kartı var");

// 4. 7 günlük strip — her metrik için 7 bar (4 metrik * 7 = 28 bar elementi)
// açılış tag'indeki tam class string'ini say (trend-bar__fill dahil etme)
const barCount = (html.match(/<div class="trend-bar [^"]*"/g) || []).length;
assert(barCount === 28, "Trend strip'te 28 bar var (4 metrik × 7 gün): " + barCount);
assert(/Son 7 gün/.test(html), "Trend strip başlığı var");

// 5. Hızlı notlar kartı
assert(/Hızlı notlar/.test(html), "Hızlı notlar bölümü var");
assert(/Günlük/.test(html), "Günlük chip'i var");

// 6. Terapi paylaşımı redacted
const therapyData = JSON.parse(JSON.stringify(seededData));
therapyData.days["2026-08-04"].therapy = { share: { note: "Gizli içerik", score: 7 } };
ctx.AeonV2.setData(therapyData);
assert(/Terapi paylaşımı/.test(html), "Terapi paylaşımı chip'i var");
assert(/redacted/.test(html), "Terapi paylaşımı redacted olarak işaretli");
assert(!/Gizli içerik/.test(html), "Terapi metni DOM'a yansımamış");

// 7. Tarih seçici state değiştiriyor
ctx.AeonV2.shiftDate(-1);
assert(ctx.AeonV2.ui.date === "2026-08-03", "shiftDate(-1) bir gün geri gitti");
ctx.AeonV2.shiftDate(1);
assert(ctx.AeonV2.ui.date === "2026-08-04", "shiftDate(1) bugüne döndü");

ctx.AeonV2.goToDayDetail();
assert(ctx.AeonV2.ui.tab === "day", "goToDayDetail Gün Detayı sekmesine geçti");

// 8. Date setter validasyon
ctx.AeonV2.setDate("bad-date");
assert(ctx.AeonV2.ui.date !== "bad-date", "Geçersiz tarih reddedildi");

console.log("\n🦩 Faz 2 Genel Bakış fixture — TÜM TESTLER BAŞARILI");
