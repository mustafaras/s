// PROMPT-29 — Event log viewer headless fixture.
// Manifest-normalized synthetic events only: no browser, network, token or user data.
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

function event(sequence, id, section, operation, occurredAt, summary, revision) {
  return {
    eventId: id,
    correlationId: "cor-" + id,
    sequence: sequence,
    occurredAt: occurredAt,
    persistedAt: occurredAt,
    section: section,
    path: "data.days.*." + section,
    operation: operation,
    summary: summary,
    source: "app",
    sourceDeviceId: "fixture-device",
    privacyClass: "summary",
    snapshotRevision: revision || "a".repeat(40)
  };
}

function rowCount(html) {
  return (html.match(/class="event-log-row(?:\s|\")/g) || []).length;
}

const { dom, AeonV2 } = boot();
const seed = {
  days: {},
  eventLog: {
    date: "2026-08-11",
    events: [
      event(1, "evt-therapy", "therapy", "record", "2026-08-11T10:00:00Z", "Yansıtma/pratik kaydı güncellendi", "a".repeat(40)),
      event(2, "evt-mood", "mood", "update", "2026-08-10T09:00:00Z", "Güvenli kayıt özeti", "b".repeat(40)),
      event(3, "evt-profile", "profile", "update", "2026-08-09T08:00:00Z", "PROFILE_RAW_RESPONSE_SENTINEL", "c".repeat(40))
    ]
  }
};

AeonV2.init();
AeonV2.setData(seed);
AeonV2.setTab("system");
AeonV2.setSystemSubTab("events");
let html = dom.html;

assert((html.match(/<button[^>]+class="sub-tab/g) || []).length === 5, "Sistem sekmesinde 5 sub-tab var");
assert(/Olaylar/.test(html), "Olaylar sub-tab etiketi var");
assert(/event-log-title/.test(html) && /Olay Günlüğü/.test(html), "Olay günlüğü başlığı render ediliyor");
assert(/event-filter-section/.test(html) && /event-filter-operation/.test(html), "Bölüm ve işlem filtreleri var");
assert(/event-filter-from/.test(html) && /event-filter-to/.test(html), "Tarih aralığı filtreleri var");
assert(/20/.test(html) && /50/.test(html) && /100/.test(html), "20/50/100 sayfa boyutları var");
assert(rowCount(html) === 3, "Normalize edilmiş olaylar listeleniyor");
assert(/event-log-row__time/.test(html) && /Terapi/.test(html) && /Kaydet/.test(html), "Olay satırı saat/bölüm/işlem gösteriyor");
assert(/rev-aaaaaaaa/.test(html), "Olay satırı revizyon kısaltmasını gösteriyor");
assert(!html.includes("PROFILE_RAW_RESPONSE_SENTINEL"), "Ham profil özeti DOM'a taşınmıyor");
assert(/Bir olay seç/.test(html), "Seçim yokken detay drawer boş durumu var");

AeonV2.selectEvent("evt-therapy");
html = dom.html;
assert(/event-detail-drawer/.test(html), "Olay detay drawer'ı render ediliyor");
assert(/Olay ID/.test(html) && /Korelasyon/.test(html) && /Sıra/.test(html), "Drawer kimlik ve sıra alanlarını gösteriyor");
assert(/data.days/.test(html) && /Gizlilik/.test(html) && /fixture-device/.test(html), "Drawer path/kaynak/gizlilik alanlarını gösteriyor");
assert(html.includes("Yansıtma/pratik kaydı güncellendi"), "Drawer güvenli olay özetini gösteriyor");

AeonV2.setEventFilter("section", "mood");
html = dom.html;
assert(rowCount(html) === 1 && /evt-mood/.test(html), "Bölüm filtresi tek eşleşen olayı gösteriyor");
AeonV2.clearEventFilters();
AeonV2.setEventFilter("from", "2026-08-10");
html = dom.html;
assert(rowCount(html) === 2, "Başlangıç tarihi filtresi uygulanıyor");
AeonV2.setEventFilter("to", "2026-08-10");
html = dom.html;
assert(rowCount(html) === 1 && /evt-mood/.test(html), "Bitiş tarihi filtresi uygulanıyor");

const many = [];
for (let i = 1; i <= 105; i += 1) {
  many.push(event(i, "evt-many-" + i, i % 2 ? "mood" : "sleep", i % 2 ? "update" : "record", "2026-08-11T" + String(Math.floor(i / 60)).padStart(2, "0") + ":" + String(i % 60).padStart(2, "0") + ":00Z", "Güvenli kayıt özeti", "d".repeat(40)));
}
AeonV2.setData({ days: {}, eventLog: { events: many } });
AeonV2.selectEvent("");
AeonV2.clearEventFilters();
AeonV2.setEventLimit(20);
html = dom.html;
assert(rowCount(html) === 20 && /Sayfa 1 \/ 6/.test(html), "20'lik sayfalama ilk sayfayı gösteriyor");
AeonV2.setEventLimit(50);
html = dom.html;
assert(rowCount(html) === 50 && /Sayfa 1 \/ 3/.test(html), "50'lik sayfalama çalışıyor");
AeonV2.setEventLimit(100);
html = dom.html;
assert(rowCount(html) === 100 && /Sayfa 1 \/ 2/.test(html), "100'lük sayfalama çalışıyor");
AeonV2.setEventPage(2);
html = dom.html;
assert(rowCount(html) === 5 && /Sayfa 2 \/ 2/.test(html), "İkinci sayfa kalan olayları gösteriyor");

console.log("\n✅ Prompt 29 event-log fixture — TÜM TESTLER BAŞARILI");
