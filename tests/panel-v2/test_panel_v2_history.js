// ÆON Panel v2 — gerçek kayıt geçmişi ve adım metriği regresyon fixture'ı
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

const { dom, AeonV2 } = boot();
const today = "2026-08-10";
const yesterday = "2026-08-09";

function stepPointCount(html) {
  return (html.match(/class="ae-metric-chart__point"/g) || []).length;
}

assert(AeonV2.getSteps({ movement: { walkM: 0 } }) === null, "Varsayılan walkM=0 sahte adım noktası üretmiyor");
assert(AeonV2.getSteps({ walk: { steps: null }, movement: { walkM: 0 } }) === null, "Kanonik null walk.steps sahte adım noktası üretmiyor");
assert(AeonV2.getSteps({ walk: { steps: 321 } }) === 321, "Elle girilen walk.steps kanonik önceliği koruyor");
assert(AeonV2.getSteps({ health: { steps: 4321 } }) === 4321, "Sağlık senkronu adım değerini koruyor");
assert(AeonV2.getSteps({ movement: { walkM: 720 } }) === 1000, "Gerçek walkM kaydı adım tahminine dönüşüyor");
const locationClusters = AeonV2.compressLocationHistory([
  { lat: 41.0, lng: 29.0, ts: "2026-08-10T08:00:00Z" },
  { lat: 41.0002, lng: 29.0001, ts: "2026-08-10T08:05:00Z" },
  { lat: 41.01, lng: 29.01, ts: "2026-08-10T09:00:00Z" }
]);
assert(locationClusters.length === 2 && locationClusters[0].samples === 2, "Konum GPS gürültüsü 120 metre eşiğiyle gruplanıyor");
assert(/maps\.google\.com|google\.com\/maps/.test(AeonV2.locationMapsUrl({ lat: 41, lng: 29 })) && !/directions|route/i.test(AeonV2.locationMapsUrl({ lat: 41, lng: 29 })), "Konum bağlantısı yalnızca nokta Google Maps araması açıyor");

const seededData = {
  settings: { targets: { steps: 10000, waterGlasses: 8 } },
  days: {
    [today]: {
      note: "Günün ana notu",
      mood: "iyi",
      moodNote: "Sakin bir akış",
      intention: "Yavaşlamak",
      gratitude: ["Ailem", "Sağlığım"],
      journal: { text: "Günlükteki uzun not", mode: "free" },
      otherNotes: ["Ek not"],
      reading: { entries: [{ title: "Bir kitap", note: "Okuma notu", pages: 12 }] },
      watching: { entries: [{ title: "Bir film", note: "İzleme notu", minutes: 90 }] },
      discomfort: { note: "Boyun gerginliği" },
      prayer: {
        fajr: { performed: true, note: "Vaktinde" },
        dhuhr: { performed: true },
        asr: { performed: false },
        maghrib: { performed: true },
        isha: { performed: true }
      },
      health: { steps: 4321 },
      movement: { walkM: 0 }
    },
    [yesterday]: {
      mood: "normal",
      health: { steps: 1200 },
      movement: { walkM: 0 }
    }
  },
  zikr: {
    presets: [{ id: "esma", name: "Ya Fettah", kind: "esma", ebced: 489 }],
    sessions: {
      [today]: {
        totalCount: 165,
        completedSets: 2,
        perPreset: { esma: { count: 165 } }
      }
    },
    reflections: [{
      id: "reflection-1",
      date: today,
      presetName: "Ya Fettah",
      feelings: "Sakin",
      thoughts: "Farkındalık notu",
      intention: "Şükür"
    }]
  },
  library: {
    books: [{
      id: "book-1",
      title: "Arşiv kitabı",
      author: "Yazar",
      status: "finished",
      finishedAt: yesterday,
      note: "Arşiv notu",
      quotes: [{ id: "quote-1", text: "Arşiv alıntısı", ts: yesterday }]
    }]
  }
};

AeonV2.setDate(today);
AeonV2.setData(seededData);
AeonV2.setTab("trends");

let html = dom.html;
assert(!/Henüz synced veri yok/.test(html), "Kayıtlı veri Trendler ekranını açıyor");
assert(/Notlar, Zikirler ve İbadetler/.test(html), "Geçmiş kayıt bölümü render ediliyor");
assert(/Günün ana notu/.test(html) && /Günlükteki uzun not/.test(html), "Not ve günlük metni geçmişte görünüyor");
assert(/Okuma notu/.test(html) && /İzleme notu/.test(html), "Okuma ve izleme notları geçmişte görünüyor");
assert(/Arşiv notu/.test(html) && /Arşiv alıntısı/.test(html), "Arşiv notu ve alıntısı geçmişte görünüyor");
assert(/Esma \/ zikir kaydı/.test(html) && /165/.test(html), "Zikir toplamı ve kaydı geçmişte görünüyor");
assert(/Tefekkür/.test(html) && /Farkındalık notu/.test(html), "Tefekkür kaydı geçmişte görünüyor");
assert(/Namaz kaydı/.test(html) && /4\/5 vakit/.test(html), "Namaz günlük toplamı ve hedefi görünüyor");
assert(/history-filters/.test(html) && /Tüm kaynaklar/.test(html) && /Tüm günler/.test(html), "Kaynak ve gün filtreleri render ediliyor");
assert(stepPointCount(html) >= 2, "Gerçek adım kayıtları chart noktası üretiyor");
assert(!/class="ae-metric-chart__point"[^>]*data-value="0"/.test(html), "Eksik adım günleri sahte sıfır noktası üretmiyor");

AeonV2.setTrendWindow(14);
assert(AeonV2.ui.historyWindow === 14, "Trend penceresi geçmiş filtresine aktarılıyor");
assert(/Son 14 gün/.test(dom.html) && /history-records/.test(dom.html), "14 günlük görünüm geçmiş kayıtlarını koruyor");

AeonV2.setHistoryWindow("all");
assert(AeonV2.ui.historyWindow === "all", "Tümü geçmiş penceresi seçilebiliyor");
assert(/Tümü/.test(dom.html), "Tümü filtresi seçili olarak render ediliyor");

AeonV2.setHistoryFilter("source", "Zikir");
assert(AeonV2.ui.historySource === "Zikir", "Kaynak filtresi state'e yazılıyor");
assert(/Esma \/ zikir kaydı/.test(dom.html), "Kaynak filtresi zikir kaydını koruyor");

const directChart = AeonV2.renderMetricChart("steps", {
  values: [null, 1200, null],
  dates: [today, yesterday, "2026-08-08"],
  windowDays: 7
}, "info");
assert(stepPointCount(directChart) === 1, "Eksik seri değerleri SVG'de nokta olarak çizilmiyor");
assert(!/class="ae-metric-chart__point"[^>]*data-value="0"/.test(directChart), "Boş seri doğrudan chart çağrısında da sıfıra çevrilmiyor");

const source = require("fs").readFileSync(require("path").resolve(__dirname, "..", "..", "panel/v2/panel-v2.js"), "utf8");
assert(!/\p{Extended_Pictographic}/u.test(source), "Panel-v2 JS kaynak kodunda emoji yok");

console.log("Panel-v2 history/steps fixture tamamlandı.");
