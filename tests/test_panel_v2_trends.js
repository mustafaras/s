// ÆON Panel v2 — Faz 3 Trendler & Uyarılar fixture
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

const { dom, ctx, AeonV2 } = boot();

function countMatches(re) { return (dom.html.match(re) || []).length; }

let html;

// 1. Boş data'da ae-empty görünür (init today sekmesinde açılır; Trendler sekmesini açalım)
AeonV2.init();
AeonV2.setTab("trends");
html = dom.html;
assert(html.indexOf("ae-empty") !== -1, "Boş data'da ae-empty görünür");
assert(/Trendler \& Uyarılar|Henüz synced veri yok/.test(html), "Boş durumda Trendler placeholder'ı var");

// 2. Seeded data ile summary grid
const today = "2026-08-04";
const days = {};
days[today] = {
  mood: "iyi",
  moodNote: "Huzurlu",
  sleep: { hours: 6.5, quality: 7 },
  health: { steps: 8432 },
  water: 7,
  cravingSOSCount: 0,
  journal: { text: "Bugün güzeldi" }
};
for (let i = 1; i <= 6; i++) {
  const d = dateOffset(today, -i);
  days[d] = {
    mood: "normal",
    sleep: { hours: 6.5 + i * 0.1, quality: 7 },
    health: { steps: 7000 + i * 200 },
    water: 6,
    cravingSOSCount: 0
  };
}

const seededData = { settings: { targets: { steps: 10000, waterGlasses: 8 } }, days: days };
AeonV2.setDate(today);
AeonV2.setData(seededData);
AeonV2.setTab("trends");
html = dom.html;
assert(!/Henüz synced veri yok/.test(html), "Veri varlığında placeholder kalktı");
assert(html.indexOf("ae-grid--summary") !== -1, "Summary grid render edildi");
assert(countMatches(/ae-card--summary/g) >= 6, "En az 6 summary kart var");
assert(/Pencere/.test(html), "Pencere seçici var");
assert(/7 gün/.test(html), "7 günlük buton var");
assert(/14 gün/.test(html), "14 günlük buton var");
assert(/30 gün/.test(html), "30 günlük buton var");

// 3. Ortalama değerler doğru
assert(/Uyku ort\./.test(html), "Uyku ortalaması kartı var");
assert(/6,5|6,6|6,7|6,8|6,9|7,0|7,1/.test(html), "Uyku ortalaması değeri doğru");
assert(/Adım ort\./.test(html), "Adım ortalaması kartı var");
assert(/7\.805|7 805/.test(html), "Adım ortalaması değeri doğru");
assert(/Su ort\./.test(html), "Su ortalaması kartı var");
assert(/6,[0-9]|7,0/.test(html), "Su ortalaması değeri doğru");
assert(/SOS yoğ\./.test(html), "SOS yoğunluğu kartı var");
assert(/Eksik gün/.test(html), "Eksik gün kartı var");
assert(/MOH gün/.test(html), "MOH gün kartı var");
assert(countMatches(/class="ae-metric__sparkline ae-metric__sparkline--svg"/g) === 6, "Her summary kartında SVG mini sparkline var");
assert(countMatches(/data-sparkline-window="7"/g) === 6, "Summary sparklinelar 7 günlük pencereyi taşıyor");
assert(countMatches(/class="ae-sparkline ae-sparkline--info"/g) === 2, "Uyku ve adım sparkline rengi info");
assert(countMatches(/class="ae-sparkline ae-sparkline--ok"/g) === 2, "Su ve sıfır SOS sparkline rengi ok");
assert(countMatches(/class="ae-sparkline ae-sparkline--warn"/g) === 1, "Eksik gün sparkline rengi warn");
assert(countMatches(/class="ae-sparkline ae-sparkline--accent"/g) === 1, "MOH sparkline rengi accent");
assert(/Uyku ort\. son 7 gün/.test(html), "Summary sparkline erişilebilir pencere etiketi var");

// 3b. Büyük 30 günlük mod trendi SVG chart
assert(/ae-mood-chart-card/.test(html), "Büyük mod trendi kartı render edildi");
assert(/class="ae-mood-chart__svg"/.test(html), "Mod trendi SVG'si render edildi");
assert(/viewBox="0 0 720 280"/.test(html), "Mod trendi responsive viewBox taşıyor");
assert(/preserveAspectRatio="none"/.test(html), "Mod trendi SVG'si responsive oran ayarı taşıyor");
assert(countMatches(/class="ae-mood-chart__grid-line"/g) === 5, "Mod trendi 5 yatay grid çizgisi taşıyor");
assert(countMatches(/class="ae-mood-chart__y-label"/g) === 5, "Mod trendi Y ekseni 1-5 etiketlerini taşıyor");
assert(countMatches(/class="ae-mood-chart__x-label"/g) === 7, "Mod trendi X ekseni 5 günlük etiketleri taşıyor");
assert(/data-day-index="0"/.test(html) && /data-day-index="5"/.test(html), "Mod trendi X etiket indeksleri doğru");
assert(countMatches(/class="ae-mood-chart__area"/g) >= 1, "Mod trendi area fill taşıyor");
assert(countMatches(/class="ae-mood-chart__line"/g) >= 1, "Mod trendi line path taşıyor");
assert(countMatches(/class="ae-mood-chart__point"/g) === 7, "Mod trendi seeded mood noktalarını taşıyor");
assert(countMatches(/<title>/g) >= 7, "Mod trendi noktalarında hover tooltip başlıkları var");
assert(/aria-label="Son 30 gün mod trendi"/.test(html), "Mod trendi erişilebilir grafik etiketi taşıyor");

// 4. Pencere değişimi
assert(AeonV2.ui.trendWindow === 7, "Varsayılan pencere 7 gün");
AeonV2.setTrendWindow(14);
assert(AeonV2.ui.trendWindow === 14, "Pencere 14 güne geçti");
html = dom.html;
assert(countMatches(/data-sparkline-window="14"/g) === 6, "Summary sparklinelar 14 günlük pencereye geçti");
assert(/Uyku ort\. son 14 gün/.test(html), "14 günlük sparkline etiketi güncellendi");
AeonV2.setTrendWindow(30);
assert(AeonV2.ui.trendWindow === 30, "Pencere 30 güne geçti");
html = dom.html;
assert(countMatches(/data-sparkline-window="30"/g) === 6, "Summary sparklinelar 30 günlük pencereye geçti");
assert(/Uyku ort\. son 30 gün/.test(html), "30 günlük sparkline etiketi güncellendi");
AeonV2.setTrendWindow(99);
assert(AeonV2.ui.trendWindow === 30, "Aşırı pencere 30'a sınırlı");

// 5. Uyku düşüşü anomalisi
const sleepDropData = { settings: { targets: { steps: 10000, waterGlasses: 8 } }, days: {} };
for (let i = 0; i < 7; i++) {
  const d = dateOffset(today, -i);
  sleepDropData.days[d] = {
    mood: "normal",
    sleep: { hours: 5 },
    health: { steps: 3000 },
    water: 3
  };
}
for (let i = 7; i < 14; i++) {
  const d = dateOffset(today, -i);
  sleepDropData.days[d] = {
    mood: "normal",
    sleep: { hours: 8 },
    health: { steps: 3000 },
    water: 3
  };
}
AeonV2.setData(sleepDropData);
html = dom.html;
assert(/Uyku süresi son 7 günde %/.test(html), "Uyku düşüşü anomalisi tespit edildi");
assert(/anomaly-card--risk/.test(html), "Uyku düşüşü risk olarak işaretlendi");

// 6. SOS artışı anomalisi
const sosRiseData = { settings: { targets: { steps: 10000, waterGlasses: 8 } }, days: {} };
for (let i = 0; i < 7; i++) {
  const d = dateOffset(today, -i);
  sosRiseData.days[d] = {
    mood: "normal",
    sleep: { hours: 7 },
    health: { steps: 5000 },
    water: 5,
    cravingSOSCount: 2
  };
}
AeonV2.setData(sosRiseData);
html = dom.html;
assert(/SOS kaydı artışı/.test(html), "SOS artışı anomalisi tespit edildi");

// 7. Eksik gün anomalisi
const missingData = { days: {} };
for (let i = 3; i < 14; i++) {
  const d = dateOffset(today, -i);
  missingData.days[d] = { mood: "normal" };
}
AeonV2.setData(missingData);
html = dom.html;
assert(/gün arka arkaya kayıt yok/.test(html), "Eksik gün anomalisi tespit edildi");

// 8. Anomaliden gün detayına atlama
AeonV2.goToDayDetail("2026-08-01");
assert(AeonV2.ui.tab === "day", "goToDayDetail Gün Detayı sekmesine geçti");
assert(AeonV2.ui.date === "2026-08-01", "goToDayDetail tarihi güncelledi");

// 9. Anomali yokken ae-empty
const normalData = { settings: { targets: { steps: 10000, waterGlasses: 8 } }, days: {} };
for (let i = 0; i < 14; i++) {
  const d = dateOffset(today, -i);
  normalData.days[d] = {
    mood: "iyi",
    sleep: { hours: 7.5, quality: 8 },
    health: { steps: 9000 },
    water: 8,
    cravingSOSCount: 0,
    journal: { text: "gün " + i }
  };
}
AeonV2.setData(normalData);
AeonV2.setDate(today);
AeonV2.setTab("trends");
AeonV2.setTrendWindow(7);
html = dom.html;
assert(html.indexOf("Uyarı yok") !== -1, "Anomali yokken uyarı yok mesajı görünür");

console.log("\n🦩 Faz 3 Trendler & Uyarılar fixture — TÜM TESTLER BAŞARILI");

function dateOffset(base, days) {
  const d = new Date(base + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
