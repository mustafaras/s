// ÆON Panel v2 — Faz 4 Gün Detayı fixture
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

const helper = boot();
const { dom, ctx, AeonV2 } = helper;

assert(typeof AeonV2.AeDivider === "function", "AeDivider export ediliyor");
assert(typeof AeonV2.AeToast === "function", "AeToast export ediliyor");
assert(typeof AeonV2.showToast === "function", "showToast export ediliyor");
assert(typeof AeonV2.dismissToast === "function", "dismissToast export ediliyor");
const dividerFixture = AeonV2.AeDivider({ label: "Ruh hali" });
assert(/class="ae-divider ae-divider--label"/.test(dividerFixture), "Etiketli divider markup doğru");
assert(/role="separator"/.test(dividerFixture), "Divider separator rolü var");
const toastFixture = AeonV2.AeToast({ message: "Tamamlandı", type: "success", id: "fixture" });
assert(/class="ae-toast ae-toast--success"/.test(toastFixture), "Success toast markup doğru");
assert(/role="status"/.test(toastFixture), "Success toast status rolü var");

AeonV2.init();

let html;

const seededData = {
  zikr: {
    presets: [
      { id: "esma_01", name: "Ya Fettah", kind: "esma", ebced: 489, target: 489 },
      { id: "subhanallah", name: "Sübhanallah", kind: "core", target: 33 }
    ],
    sessions: {
      "2026-08-04": {
        totalCount: 165,
        completedSets: 2,
        perPreset: { esma_01: { count: 120 }, subhanallah: { count: 45, completedCycles: 1 } }
      }
    },
    reflections: [{
      id: "zn_2026-08-04_esma_01",
      date: "2026-08-04",
      presetId: "esma_01",
      feelings: "Sakin",
      thoughts: "Bugünü fark ederek yaşadım.",
      intention: "Şükürle devam etmek",
      wordCount: 6,
      updatedAt: "2026-08-04T20:10:00Z"
    }]
  },
  days: {
    "2026-08-04": {
      mood: "iyi",
      moodNote: "Huzurlu",
      sleep: { hours: 7.5, quality: 8 },
      water: 7,
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
      meals: { breakfast: "yumurta", lunch: "salata", dinner: "çorba" },
      prayer: { fajr: { performed: true }, dhuhr: { performed: true }, asr: { performed: true }, maghrib: { performed: true }, isha: { performed: true } },
      zikr: { count: 165, name: "Ya Fettah" },
      saygi: { personName: "Mevlana", read: true },
      quranRequests: [1],
      health: { steps: 8432 },
      movement: { walkM: 5200, vehicleM: 0 },
      location: {
        segments: [
          { category: "ev", start: "08:00", end: "09:00" },
          { category: "dışarı", start: "09:00", end: "10:30" },
          { category: "iş", start: "10:30", end: "18:00" }
        ]
      },
      reading: { entries: [{ title: "Kitap" }] },
      watching: { entries: [{ title: "Film" }] },
      listening: { entries: [{ title: "Podcast" }] },
      quotes: [{ text: "Özlü söz" }]
    },
    "2026-08-03": {
      mood: "normal",
      health: { steps: 6200 },
      water: 5
    },
    "2026-08-02": {
      mood: "cok-iyi",
      health: { steps: 10500 },
      water: 9
    },
    "2026-08-01": {
      mood: "zorlandim",
      health: { steps: 3100 },
      water: 4
    },
    "2026-07-31": {
      mood: "cok-iyi",
      health: { steps: 12000 },
      water: 10
    },
    "2026-07-30": {
      mood: "iyi",
      health: { steps: 7800 },
      water: 6
    },
    "2026-07-29": {
      mood: "cok-iyi",
      health: { steps: 9100 },
      water: 8
    }
  }
};

AeonV2.setDate("2026-08-04");
AeonV2.setData(seededData);

// 1. Seçili gün değişince render değişiyor
AeonV2.setTab("day");
html = dom.html;
const firstDayHtml = html;
assert(/Gün Detayı|Bugün/.test(html), "Gün Detayı sekmesi başlığı var");
assert(/Ruh hali|Mod|Beslenme|İbadet|Hareket|İçerik|Terapi/.test(html), "Gün detayı bölüm başlıkları var");
assert((html.match(/class="ae-divider ae-divider--label/g) || []).length >= 5, "Gün detayında divider bölücüleri var");
assert(/Ruh hali &amp; Terapi/.test(html), "Gün detayı divider etiketi var");
assert(/class="day-detail-groups ae-stagger"/.test(html), "Gün detay ana bölümleri stagger kabuğunda");
assert((html.match(/class="day-detail-accordion ae-slide-up"/g) || []).length >= 8, "Ana bölümler native akordeon olarak render ediliyor");
assert((html.match(/class="day-detail-accordion ae-slide-up" open/g) || []).length >= 8, "Akordeon bölümleri varsayılan olarak açık");
assert((html.match(/class="day-detail-accordion__chevron"/g) || []).length >= 8, "Akordeon aç/kapat göstergeleri var");
assert(/class="detail-section__chips"/.test(html), "Bölüm chip'leri bölüm içeriğinin üstünde render ediliyor");
const requiredSectionOrder = ["Zamanlar", "Ruh Hali", "Alışkanlıklar", "Beslenme", "İbadet", "Hareket", "Konum", "Döngü"];
const renderedSectionLabels = Array.from(html.matchAll(/class="ae-divider ae-divider--label"[^>]*>[\s\S]*?<span class="ae-divider__label">([^<]+)<\/span>/g)).map(function(match) {
  return match[1];
});
assert(requiredSectionOrder.every(function(label) { return renderedSectionLabels.indexOf(label) !== -1; }), "Gün detayı ana bölüm divider etiketleri eksiksiz");
assert(requiredSectionOrder.every(function(label, index) {
  return index === 0 || renderedSectionLabels.indexOf(label) > renderedSectionLabels.indexOf(requiredSectionOrder[index - 1]);
}), "Gün detayı ana bölüm sırası doğru");

// Kayıt alanları boş olsa bile bölüm kabukları ve yönlendirici mesajlar korunuyor.
AeonV2.setData({ days: { "2026-08-05": {} } });
AeonV2.setDate("2026-08-05");
html = dom.html;
assert(requiredSectionOrder.every(function(label) { return html.indexOf('class="ae-divider ae-divider--label') !== -1 && html.indexOf(label) !== -1; }), "Boş gün ana bölüm dividerları korunuyor");
assert(/Bu gün için kayıt zamanı bilgisi yok/.test(html), "Boş zamanlar mesajı görünür");
assert(/Bu gün için ruh hali veya terapi özeti kaydı yok/.test(html), "Boş ruh hali mesajı görünür");
assert(/Bugün için alışkanlık kaydı yok/.test(html), "Boş alışkanlık mesajı görünür");
assert(/Beslenme, su veya kafein kaydı yok/.test(html), "Boş beslenme mesajı görünür");
assert(/Bugün için ibadet, zikir veya Saygı kaydı yok/.test(html), "Boş ibadet mesajı görünür");
assert(/Bugün için hareket veya adım kaydı yok/.test(html), "Boş hareket mesajı görünür");
assert(/Bu gün için konum geçmişi kaydı yok/.test(html), "Boş konum mesajı görünür");
assert(/Bugün için döngü veya semptom kaydı yok/.test(html), "Boş döngü mesajı görünür");
AeonV2.setData(seededData);
AeonV2.setDate("2026-08-04");
html = dom.html;

AeonV2.showToast("Kayıt tamamlandı", "success");
html = dom.html;
assert(/class="ae-toast ae-toast--success"/.test(html), "Success toast görünür");
assert(/Kayıt tamamlandı/.test(html), "Toast mesajı görünür");
AeonV2.dismissToast();
assert(!/class="ae-toast ae-toast--success"/.test(dom.html), "Toast manuel kapatılabiliyor");
AeonV2.showToast("Bilgi", "info");
assert(/class="ae-toast ae-toast--info"/.test(dom.html), "Info toast görünür");
helper.runTimers();
assert(!/class="ae-toast ae-toast--info"/.test(dom.html), "Toast süresi dolunca otomatik kapanıyor");

AeonV2.setDate("2026-08-03");
html = dom.html;
const secondDayHtml = html;
assert(firstDayHtml !== secondDayHtml, "Tarih değişince DOM değişti");
assert(/2026-08-03/.test(html), "Yeni tarih gösteriliyor");

// 2. Ham GPS string'i DOM'da yok
AeonV2.setDate("2026-08-04");
html = dom.html;
assert(!/\b41\.[0-9]+/.test(html), "Ham enlem string'i yok");
assert(!/\b28\.[0-9]{4,}/.test(html), "Ham boylam string'i yok");
assert(!/\blat\b|\blng\b|\blatitude\b|\blongitude\b/i.test(html), "Ham konum anahtar kelimeleri yok");
assert(/Konum kategorileri: ev/.test(html), "Konum segmentleri kategori olarak görünür");

// 3. Terapi metinleri redacted; günlük/niyet/şükür/alıntı full-detail olarak görünür
assert(/Terapi paylaşımı/.test(html), "Terapi paylaşımı chip'i var");
assert(/Gizli içerik/.test(html) === false, "Terapi paylaşım metni DOM'da yok");
assert(/Endişeli düşünce/.test(html) === false, "Düşünce metni DOM'da yok");
assert(/Bugün güzeldi/.test(html) === true, "Günlük metni DOM'da görünür");
assert(/Sakin kalmak/.test(html) === true, "Niyet metni DOM'da görünür");
assert(/Ailem/.test(html) === true, "Şükür metni DOM'da görünür");
assert(/Özlü söz/.test(html) === true, "Alıntı metni DOM'da görünür");
assert(/redacted/.test(html), "Redacted ibaresi görünür");

// 4. Saygı / ibadet / içerik özetleri var
assert(/Namaz: 5\/5/.test(html), "Namaz durumu 5/5 görünür");
assert(/Zikir: 165/.test(html), "Zikir sayacı görünür");
assert(/class="zikr-detail"/.test(html), "Zikir ayrıntısı expander olarak görünür");
assert(/Zikir ve Esmâ/.test(html), "Zikir ve Esmâ başlığı görünür");
assert(/165 toplam/.test(html), "Zikir toplam sayısı net görünür");
assert(/Ya Fettah/.test(html) && /Esmâ-i Hüsnâ/.test(html), "Esmâ adı ve türü görünür");
assert(/Tefekkürler/.test(html) && /Hislerim/.test(html) && /Düşüncelerim/.test(html), "Tefekkür ayrıntıları görünür");
assert(/6 kelime/.test(html), "Tefekkür kelime sayısı görünür");
assert(/Öncü: Mevlana/.test(html), "Günün öncüsü görünür");
assert(/Kur['\u0027]an yolculuğu|Kur&#39;an yolculuğu|Kuran yolculuğu/.test(html), "Kur'an yolculuğu görünür");
assert(/Okuma: 1/.test(html), "Okuma sayısı görünür");
assert(/İzleme: 1/.test(html), "İzleme sayısı görünür");
assert(/Dinleme: 1/.test(html), "Dinleme sayısı görünür");

// 5. Boş gün mesajı doğru
AeonV2.setDate("2026-06-01");
html = dom.html;
assert(/Boş gün/.test(html), "Boş gün başlığı görünür");
assert(/Bu tarihe ait kayıt yok/.test(html), "Boş gün açıklaması doğru");

// 6. 30 günlük ısı haritası var
AeonV2.setDate("2026-08-04");
html = dom.html;
const heatmapCells = (html.match(/class="day-heatmap__cell/g) || []).length;
assert(heatmapCells === 30, "30 günlük ısı haritası hücresi var: " + heatmapCells);
assert(/class="day-heatmap__weekdays"/.test(html), "Isı haritası hafta başlıkları var");
["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].forEach(function(label) {
  assert(html.indexOf('class="day-heatmap__weekday"') !== -1 && html.indexOf(">" + label + "</span>") !== -1, "Hafta etiketi var: " + label);
});
assert((html.match(/class="day-heatmap__tooltip"/g) || []).length === 30, "Her ısı haritası hücresinde tooltip var");
assert(/data-date="2026-08-04"/.test(html), "Isı haritası hücreleri tarih metadata'sı taşıyor");
assert(/Huzurlu/.test(html), "Isı haritası tooltip'i mod/not bilgisini taşıyor");
assert(/day-heatmap__cell--empty/.test(html), "Boş günler ayrı pattern sınıfı taşıyor");
assert(/day-heatmap__cell--selected/.test(html), "Seçili gün hücresi vurgulanıyor");

// 7. Beslenme ve hareket özeti
assert(/Su: 7 bardak/.test(html), "Su bardak sayısı görünür");
assert(/Öğün: 3/.test(html), "Öğün sayısı görünür");
assert(/Adım: 8\.432/.test(html), "Adım sayısı görünür");
assert(/Yürüyüş: 5200 m/.test(html), "Yürüyüş mesafesi görünür");

// 8. Konum geçmişi varsayılan olarak daraltılmış expander içinde kalır.
const locationData = JSON.parse(JSON.stringify(seededData));
locationData.locationHistory = [
  { ts: "2026-08-03T18:20:00Z", lat: 39.9400, lng: 32.8700, acc: 14 },
  { ts: "2026-08-04T10:15:00Z", lat: 39.9533, lng: 32.8889, acc: 16 },
  { ts: "2026-08-04T10:16:00Z", lat: 39.9534, lng: 32.8888, acc: 8 },
  { ts: "2026-08-04T10:40:00Z", lat: 39.9600, lng: 32.9000, acc: 12 }
];
AeonV2.setData(locationData);
AeonV2.setDate("2026-08-04");
html = dom.html;
assert(/class="loc-history-details"/.test(html), "Konum geçmişi expander içinde");
assert(!/class="loc-history-details" open/.test(html), "Konum geçmişi varsayılan olarak kapalı");
assert(/3 nokta/.test(html), "Konum geçmişi tüm günlerden gerçek yer değişikliği sayısını gösterir");
assert(/2 örnek/.test(html), "Aynı yerdeki GPS örnekleri gruplanır");
assert(/href="https:\/\/www\.google\.com\/maps\/search\/\?api=1&amp;query=/.test(html), "Gün detayında Google Maps nokta bağlantısı var");
assert((html.match(/class="loc-dot__map"/g) || []).length === 3, "Her anlamlı geçmiş konumun Google Maps noktası var");

console.log("\n🦩 Faz 4 Gün Detayı fixture — TÜM TESTLER BAŞARILI");
