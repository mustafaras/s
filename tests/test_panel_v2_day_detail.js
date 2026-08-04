// ÆON Panel v2 — Faz 4 Gün Detayı fixture
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

ctx.AeonV2.init();

const seededData = {
  days: {
    "2026-08-04": {
      mood: { value: 4, note: "Huzurlu" },
      journal: { text: "Bugün güzeldi" },
      intention: "Sakin kalmak",
      gratitude: "Ailem",
      therapy: {
        thoughts: [{ text: "Endişeli düşünce" }],
        decision: "Bugünü yavaş yaşamak",
        share: { note: "Gizli içerik", score: 7 },
        breath: true,
        dailyWin: true,
        selfCompassion: true,
        firstStep: true
      },
      nutrition: {
        meals: ["kahvaltı", "öğle", "akşam"],
        waterGlasses: 7,
        caffeine: true,
        mealItems: [{ protein: 20, carbs: 40, fat: 12 }]
      },
      prayer: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
      zikr: { count: 165, name: "Ya Fettah" },
      saygi: { personName: "Mevlana", read: true },
      quranJourney: { verseRef: "2:255", requests: 1 },
      health: { steps: 8432 },
      movement: { walkDuration: 0.75, distanceKm: 5.2 },
      location: {
        segments: [
          { category: "ev", start: "08:00", end: "09:00" },
          { category: "dışarı", start: "09:00", end: "10:30" },
          { category: "iş", start: "10:30", end: "18:00" }
        ]
      },
      media: {
        reading: [{ title: "Kitap" }],
        watching: [{ title: "Film" }],
        listening: [{ title: "Podcast" }]
      },
      quotes: [{ text: "Özlü söz" }]
    },
    "2026-08-03": {
      mood: { value: 3 },
      health: { steps: 6200 },
      nutrition: { waterGlasses: 5 }
    },
    "2026-08-02": {
      mood: { value: 5 },
      health: { steps: 10500 },
      nutrition: { waterGlasses: 9 }
    },
    "2026-08-01": {
      mood: { value: 2 },
      health: { steps: 3100 },
      nutrition: { waterGlasses: 4 }
    },
    "2026-07-31": {
      mood: { value: 6 },
      health: { steps: 12000 },
      nutrition: { waterGlasses: 10 }
    },
    "2026-07-30": {
      mood: { value: 4 },
      health: { steps: 7800 },
      nutrition: { waterGlasses: 6 }
    },
    "2026-07-29": {
      mood: { value: 5 },
      health: { steps: 9100 },
      nutrition: { waterGlasses: 8 }
    }
  }
};

ctx.AeonV2.setData(seededData);

// 1. Seçili gün değişince render değişiyor
ctx.AeonV2.setTab("day");
const firstDayHtml = html;
assert(/Gün Detayı|Bugün/.test(html), "Gün Detayı sekmesi başlığı var");
assert(/Ruh hali|Mod|Beslenme|İbadet|Hareket|İçerik|Terapi/.test(html), "Gün detayı bölüm başlıkları var");

ctx.AeonV2.setDate("2026-08-03");
const secondDayHtml = html;
assert(firstDayHtml !== secondDayHtml, "Tarih değişince DOM değişti");
assert(/2026-08-03/.test(html), "Yeni tarih gösteriliyor");

// 2. Ham GPS string'i DOM'da yok
ctx.AeonV2.setDate("2026-08-04");
assert(!/\b41\.[0-9]+/.test(html), "Ham enlem string'i yok");
assert(!/\b28\.[0-9]{4,}/.test(html), "Ham boylam string'i yok");
assert(!/\blat\b|\blng\b|\blatitude\b|\blongitude\b/i.test(html), "Ham konum anahtar kelimeleri yok");
assert(/Konum: ev, dışarı, iş/.test(html), "Konum segmentleri kategori olarak görünür");

// 3. Terapi metinleri redacted
assert(/Terapi paylaşımı/.test(html), "Terapi paylaşımı chip'i var");
assert(/Gizli içerik/.test(html) === false, "Terapi paylaşım metni DOM'da yok");
assert(/Endişeli düşünce/.test(html) === false, "Düşünce metni DOM'da yok");
assert(/Bugün güzeldi/.test(html) === false, "Günlük metni DOM'da yok");
assert(/Sakin kalmak/.test(html) === false, "Niyet metni DOM'da yok");
assert(/Ailem/.test(html) === false, "Şükür metni DOM'da yok");
assert(/Özlü söz/.test(html) === false, "Alıntı metni DOM'da yok");
assert(/redacted/.test(html), "Redacted ibaresi görünür");

// 4. Saygı / ibadet / içerik özetleri var
assert(/Namaz: 5\/5/.test(html), "Namaz durumu 5/5 görünür");
assert(/Zikir: 165/.test(html), "Zikir sayacı görünür");
assert(/Öncü: Mevlana/.test(html), "Günün öncüsü görünür");
assert(/Kur['\u0027]an yolculuğu|Kur&#39;an yolculuğu|Kuran yolculuğu/.test(html), "Kur'an yolculuğu görünür");
assert(/Okuma: 1/.test(html), "Okuma sayısı görünür");
assert(/İzleme: 1/.test(html), "İzleme sayısı görünür");
assert(/Dinleme: 1/.test(html), "Dinleme sayısı görünür");

// 5. Boş gün mesajı doğru
ctx.AeonV2.setDate("2026-06-01");
assert(/Boş gün/.test(html), "Boş gün başlığı görünür");
assert(/Bu tarihe ait kayıt yok/.test(html), "Boş gün açıklaması doğru");

// 6. 30 günlük ısı haritası var
ctx.AeonV2.setDate("2026-08-04");
const heatmapCells = (html.match(/class="day-heatmap__cell/g) || []).length;
assert(heatmapCells === 30, "30 günlük ısı haritası hücresi var: " + heatmapCells);

// 7. Beslenme ve hareket özeti
assert(/Su: 7 bardak/.test(html), "Su bardak sayısı görünür");
assert(/Öğün: 3/.test(html), "Öğün sayısı görünür");
assert(/Adım: 8\.432/.test(html), "Adım sayısı görünür");
assert(/Mesafe: 5,2 km/.test(html), "Yürüyüş mesafesi görünür");

console.log("\n🦩 Faz 4 Gün Detayı fixture — TÜM TESTLER BAŞARILI");
