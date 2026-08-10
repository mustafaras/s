// ÆON Panel v2 — Faz 2 Genel Bakış fixture
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

const { dom, ctx, AeonV2 } = boot();

assert(typeof AeonV2.AeMetric === "function", "AeMetric export ediliyor");
assert(typeof AeonV2.AeProgressRing === "function", "AeProgressRing export ediliyor");
assert(typeof AeonV2.AeSparkline === "function", "AeSparkline export ediliyor");
assert(typeof AeonV2.animateCountUp === "function", "animateCountUp export ediliyor");
const ringFixture = AeonV2.AeProgressRing({ value: 72, color: "ok", label: "Test ilerlemesi" });
assert(/class="ae-ring"/.test(ringFixture), "Progress ring dış kabı var");
assert(/class="ae-ring__progress"/.test(ringFixture), "Progress ring ilerleme çemberi var");
assert(/stroke-dasharray=/.test(ringFixture) && /stroke-dashoffset=/.test(ringFixture), "Progress ring SVG ölçüleri var");
const sparkFixture = AeonV2.AeSparkline([1, 3, 2, 5, 4, 6, 3], "ok", 42);
assert(/class="ae-sparkline ae-sparkline--ok"/.test(sparkFixture), "AeSparkline renk sınıfı var");
assert(/class="ae-sparkline__line"/.test(sparkFixture), "AeSparkline SVG line path var");
assert(/class="ae-sparkline__area"/.test(sparkFixture), "AeSparkline area fill path var");
assert((sparkFixture.match(/class="ae-sparkline__dot"/g) || []).length === 7, "AeSparkline veri noktaları var");
assert((sparkFixture.match(/data-last="true"/g) || []).length === 1, "AeSparkline son noktayı vurguluyor");
assert(/viewBox="0 0 160 42"/.test(sparkFixture), "AeSparkline responsive viewBox taşıyor");
const emptySparkFixture = AeonV2.AeSparkline([], "ok", 42);
assert(/ae-sparkline--empty/.test(emptySparkFixture) && /ae-sparkline__empty-line/.test(emptySparkFixture), "Boş AeSparkline düz placeholder çizgisi gösteriyor");

function countMatches(re) {
  const m = dom.html.match(re) || [];
  return m.length;
}

let html;

// 1. Boş data'da ae-empty görünür (init today sekmesinde açılır; ae-empty'yi panel içinde arıyoruz)
AeonV2.init();
html = dom.html;
// Üstbar + sekme + panel wrapper render edilmiş olur; ae-empty'yi panel içinde arıyoruz
ctx.AeonV2.init();
// Üstbar + sekme + panel wrapper render edilmiş olur; ae-empty'yi panel içinde arıyoruz
const hasEmpty = html.indexOf('ae-empty') !== -1;
assert(hasEmpty, "Boş data'da ae-empty görünür");
assert(html.indexOf('Genel Bakış') !== -1, "Boş durumda Today başlığı var");

// 2. Seeded data ile render
const seededData = {
  settings: { targets: { steps: 10000, waterGlasses: 8 } },
  days: {
    "2026-08-04": {
      mood: "iyi",
      moodNote: "Huzurlu",
      cravingSOSCount: 0,
      health: { steps: 8432 },
      water: 7,
      journal: { text: "Bugün güzeldi" }
    },
    "2026-08-03": {
      sleep: { hours: 7.5, quality: 8 },
      mood: "normal",
      health: { steps: 6200 },
      water: 5
    },
    "2026-08-02": {
      mood: "cok-iyi",
      sleep: { hours: 6 },
      health: { steps: 10500 },
      water: 9
    },
    "2026-08-01": {
      mood: "zorlandim",
      sleep: { hours: 5.5 },
      health: { steps: 3100 },
      water: 4
    },
    "2026-07-31": {
      mood: "cok-iyi",
      sleep: { hours: 8 },
      health: { steps: 12000 },
      water: 10
    },
    "2026-07-30": {
      mood: "iyi",
      sleep: { hours: 7 },
      health: { steps: 7800 },
      water: 6
    },
    "2026-07-29": {
      mood: "cok-iyi",
      sleep: { hours: 6.5 },
      health: { steps: 9100 },
      water: 8
    }
  }
};

AeonV2.setDate("2026-08-04");
AeonV2.setData(seededData);
html = dom.html;
assert(!/class="ae-empty"/.test(html), "Seeded data'da ae-empty kalktı");

// 2b. Genel Bakış premium sayfa iskeleti
assert(/today-view__intro/.test(html), "Genel Bakış premium giriş başlığı var");
assert(/sinyalleri/.test(html), "Genel Bakış tarihli sinyal başlığı var");
assert(/today-view__section--picker/.test(html), "Genel Bakış tarih seçici bölümü var");
assert(/today-view__section--hero/.test(html), "Genel Bakış hero bölümü var");
assert(/today-view__section--trend/.test(html), "Genel Bakış trend bölümü var");
assert(/today-view__secondary-grid ae-stagger/.test(html), "Genel Bakış ikincil alanı stagger ile render ediliyor");
assert(/today-section-card--notes/.test(html), "Hızlı notlar Today glass kart sınıfını taşıyor");
assert(/ae-card--glass today-section-card/.test(html), "Hızlı notlar glass kart içinde");

// 3. 4 hero kart var
assert((html.match(/ae-card--hero/g) || []).length === 4, "4 hero kart render edildi");
assert((html.match(/class="ae-card ae-card--hero hero-card ae-metric/g) || []).length === 4, "4 AeMetric kartı render edildi");
assert((html.match(/class="ae-ring"/g) || []).length === 4, "Her metrikte ProgressRing render edildi");
assert((html.match(/ae-metric__sparkline/g) || []).length === 4, "Her metrikte mini sparkline var");
assert((html.match(/class="ae-metric__delta ae-metric__delta--/g) || []).length === 4, "Her metrikte delta oku var");
assert(/Huzurlu/.test(html), "Mod kartı Huzurlu değerini gösteriyor");
assert(/7sa 30dk/.test(html), "Uyku kartı süreyi gösteriyor");
assert(/8\.432|8 432/.test(html), "Adım kartı değerini gösteriyor");
assert(/Sessiz|SOS/.test(html), "SOS kartı var");
assert((html.match(/data-count-target=/g) || []).length >= 7, "Hero ve trend sayıları count-up hedefi taşıyor");
assert(/data-count-format="hours"/.test(html), "Uyku sayısı saat formatıyla işaretli");
assert(/data-count-format="integer"/.test(html), "Tam sayılar integer formatıyla işaretli");

// 4. 7 günlük strip — her metrik için bir SVG sparkline
const sparklineCount = (html.match(/class="ae-sparkline ae-sparkline--/g) || []).length;
assert(sparklineCount === 4, "Trend strip'te 4 SVG sparkline var: " + sparklineCount);
assert((html.match(/class="ae-sparkline__line"/g) || []).length === 4, "Trend strip'te 4 line path var");
assert((html.match(/class="ae-sparkline__area"/g) || []).length === 4, "Trend strip'te 4 area fill var");
assert((html.match(/data-last="true"/g) || []).length === 4, "Trend strip'te her metrik son noktayı vurguluyor");
assert((html.match(/ae-sparkline--accent/g) || []).length === 1, "Mod sparkline accent rengi kullanıyor");
assert((html.match(/ae-sparkline--info/g) || []).length === 2, "Uyku ve adım sparkline info rengi kullanıyor");
assert((html.match(/ae-sparkline--ok/g) || []).length === 1, "Su sparkline ok rengi kullanıyor");
assert(!/class="trend-bar/.test(html), "Trend strip'te eski CSS bar markup'ı yok");
assert(/Son 7 gün/.test(html), "Trend strip başlığı var");
assert((html.match(/class="trend-strip__value ae-count-up"/g) || []).length === 4, "Trend strip'te 4 sayısal değer var");

// 5. Hızlı notlar kartı
assert(/Hızlı notlar/.test(html), "Hızlı notlar bölümü var");
assert(/Günlük/.test(html), "Günlük chip'i var");

// 5b. Konum kartı yalnızca konum geçmişi olduğunda güvenli biçimde görünür
const locationData = JSON.parse(JSON.stringify(seededData));
locationData.locationHistory = [{ ts: "2026-08-04T10:15:00Z", lat: 41.0082, lng: 28.9784, acc: 12 }];
locationData.location = { lat: 41.0082, lng: 28.9784 };
locationData.settings.locationEnabled = true;
AeonV2.setData(locationData);
html = dom.html;
assert(/today-section-card--location/.test(html), "Konum Today glass kart sınıfını taşıyor");
assert(/ae-card--glass today-section-card today-section-card--location/.test(html), "Konum glass kart içinde");
assert(/class="loc-map"/.test(html), "Konum kartı harita yüzeyi taşıyor");
assert(/loc-timeline-compact/.test(html), "Konum kartı zaman çizelgesi taşıyor");

// 6. Terapi paylaşımı redacted
const therapyData = JSON.parse(JSON.stringify(seededData));
therapyData.days["2026-08-04"].therapy = { share: { note: "Gizli içerik", score: 7 } };
AeonV2.setData(therapyData);
html = dom.html;
assert(/Terapi paylaşımı/.test(html), "Terapi paylaşımı chip'i var");
assert(/redacted/.test(html), "Terapi paylaşımı redacted olarak işaretli");
assert(!/Gizli içerik/.test(html), "Terapi metni DOM'a yansımamış");

// 7. Tarih seçici state değiştiriyor
AeonV2.shiftDate(-1);
assert(AeonV2.ui.date === "2026-08-03", "shiftDate(-1) bir gün geri gitti");
AeonV2.shiftDate(1);
assert(AeonV2.ui.date === "2026-08-04", "shiftDate(1) bugüne döndü");

AeonV2.goToDayDetail();
assert(AeonV2.ui.tab === "day", "goToDayDetail Gün Detayı sekmesine geçti");

// 8. Date setter validasyon
AeonV2.setDate("bad-date");
assert(AeonV2.ui.date !== "bad-date", "Geçersiz tarih reddedildi");

console.log("\n🦩 Faz 2 Genel Bakış fixture — TÜM TESTLER BAŞARILI");
