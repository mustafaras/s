// ÆON Panel v2 — Faz 5 Arşivler fixture
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

const { dom, ctx, AeonV2 } = boot();

AeonV2.init();

let html;

function dateStr(offsetDays) {
  const d = new Date("2026-08-04T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function buildData() {
  const books = [];
  for (let i = 1; i <= 5; i++) {
    books.push({
      id: "b_" + i,
      title: "Kitap " + i,
      author: "Yazar " + i,
      emoji: "📖",
      totalPages: 300,
      currentPage: i * 60,
      status: i === 5 ? "finished" : "reading",
      startedAt: "2026-07-01T00:00:00Z",
      finishedAt: i === 5 ? "2026-08-03T00:00:00Z" : null,
      createdAt: "2026-07-01T00:00:00Z",
      quotes: i % 2 === 0 ? [{ id: "q_" + i, text: "Alıntı kitap " + i, page: i * 10, ts: "2026-08-03T00:00:00Z" }] : []
    });
  }

  const watchItems = [];
  for (let i = 1; i <= 3; i++) {
    watchItems.push({
      id: "w_" + i,
      title: "Dizi " + i,
      kind: i % 2 === 0 ? "film" : "dizi",
      emoji: "📺",
      totalEp: i % 2 === 0 ? null : 12,
      watchedEp: i % 2 === 0 ? 0 : 5,
      status: "watching",
      createdAt: "2026-07-01T00:00:00Z",
      quotes: i === 1 ? [{ id: "wq_1", text: "Replik 1", ts: "2026-08-02T00:00:00Z" }] : []
    });
  }

  const musicItems = [];
  for (let i = 1; i <= 4; i++) {
    musicItems.push({
      id: "m_" + i,
      title: "Şarkı " + i,
      artist: "Sanatçı " + i,
      kind: i === 4 ? "podcast" : "sarki",
      emoji: "🎵",
      createdAt: "2026-07-01T00:00:00Z",
      quotes: i === 2 ? [{ id: "lq_1", text: "Söz 1", ts: "2026-08-01T00:00:00Z" }] : []
    });
  }

  const seededData = {
    days: {
      "2026-08-04": {
        mood: { value: 4 },
        reading: { entries: [
          { id: "r_1", title: "Kitap 1", author: "Yazar 1", pages: 20, minutes: 30, bookId: "b_1", ts: "2026-08-04T10:00:00Z" },
          { id: "r_2", title: "Günlük Okuma", author: "Anonim", pages: 12, minutes: 20, bookId: null, ts: "2026-08-04T11:00:00Z" }
        ]},
        watching: { entries: [
          { id: "we_1", title: "Dizi 1", kind: "dizi", episodes: 1, minutes: 45, itemId: "w_1", ts: "2026-08-04T20:00:00Z" }
        ]},
        listening: { entries: [
          { id: "l_1", title: "Şarkı 1", artist: "Sanatçı 1", kind: "sarki", minutes: 4, itemId: "m_1", ts: "2026-08-04T21:00:00Z" }
        ]}
      }
    },
    library: { books: books, goal: { dailyPages: 20, yearlyBooks: null } },
    watchlist: { items: watchItems, goal: { dailyMinutes: 40, yearlyTitles: null } },
    music: { items: musicItems, goal: { dailyMinutes: 30, yearlyTitles: null } }
  };
  return seededData;
}

AeonV2.setData(buildData());
AeonV2.setTab("archives");
html = dom.html;

// 1. Sub-tabs render
assert(/sub-tab/.test(html), "Sub-tab butonları render edildi");
assert(/Kütüphane/.test(html), "Kütüphane sub-tab var");
assert(/İzleme/.test(html), "İzleme sub-tab var");
assert(/Dinleme/.test(html), "Dinleme sub-tab var");
assert(/Alıntılar/.test(html), "Alıntılar sub-tab var");
assert(/archive-controls/.test(html), "Arşiv filtre paneli var");
assert(/Arşivlerde ara/.test(html), "Arşiv arama alanı var");
assert(/ae-archive-filter-status/.test(html), "Durum filtresi var");
assert(/ae-archive-filter-kind/.test(html), "Tür filtresi var");
assert(/Başlangıç/.test(html) && /Bitiş/.test(html), "Tarih aralığı filtreleri var");
assert(/Liste görünümü/.test(html) && /Izgara görünümü/.test(html), "Liste ve ızgara görünümü kontrolleri var");

// 2. Kütüphane listesi varsayılan
assert(/archive-row/.test(html), "Kütüphane satırları var");
assert(/Kitap 1/.test(html), "Kitap 1 başlığı var");
assert(/Kitap 5/.test(html), "Kitap 5 başlığı var");
assert(/Bitti/.test(html), "Bitti badge'i var");
assert(/Okunuyor/.test(html), "Okunuyor badge'i var");

// 3. İzleme listesi
AeonV2.setArchiveSubTab("watch");
html = dom.html;
assert(/Dizi 1/.test(html), "İzleme listesinde Dizi 1 var");
assert(/İzleniyor/.test(html), "İzleniyor badge'i var");
assert(/Film/.test(html), "Film kategorisi var");

// 4. Dinleme listesi
AeonV2.setArchiveSubTab("listen");
html = dom.html;
assert(/Şarkı 1/.test(html), "Dinleme listesinde Şarkı 1 var");
assert(/Podcast/.test(html), "Podcast kategorisi var");
assert(/Sanatçı 1/.test(html), "Sanatçı adı meta olarak var");

// 5. Alıntılar listesi
AeonV2.setArchiveSubTab("quotes");
html = dom.html;
assert(/Alıntı kitap 2/.test(html), "Kitap alıntısı var");
assert(/Replik 1/.test(html), "İzleme replik alıntısı var");
assert(/Söz 1/.test(html), "Müzik söz alıntısı var");

// 6. Arama, durum/tür/tarih filtreleri ve görünüm seçimi
AeonV2.setArchiveSubTab("library");
AeonV2.setArchiveSearch("Kitap 1");
html = dom.html;
assert(/Kitap 1/.test(html), "Arama sonucu eşleşen kitabı gösteriyor");
assert(!/Kitap 5/.test(html), "Arama sonucu eşleşmeyen kitabı gizliyor");

AeonV2.resetArchiveFilters();
AeonV2.setArchiveFilter("status", "finished");
html = dom.html;
assert(/Kitap 5/.test(html), "Durum filtresi biten kitabı gösteriyor");
assert(!/Kitap 1/.test(html), "Durum filtresi okunmakta olan kitabı gizliyor");

AeonV2.setArchiveSubTab("watch");
AeonV2.setArchiveFilter("kind", "dizi");
html = dom.html;
assert(/Dizi 1/.test(html), "Tür filtresi diziyi gösteriyor");
assert(!/Dizi 2/.test(html), "Tür filtresi filmi gizliyor");

AeonV2.setArchiveSubTab("library");
AeonV2.setArchiveFilter("from", "2026-08-04");
AeonV2.setArchiveFilter("to", "2026-08-04");
html = dom.html;
assert(/Kitap 1/.test(html), "Tarih aralığı güncel okuma kaydını gösteriyor");
assert(/Günlük Okuma/.test(html), "Tarih aralığı günlük kaydı gösteriyor");

AeonV2.setArchiveView("grid");
html = dom.html;
assert(/archive-list--grid/.test(html), "Izgara görünümü sınıfı var");
AeonV2.setArchiveView("list");
html = dom.html;
assert(!/archive-list--grid/.test(html), "Liste görünümü ızgara sınıfını kaldırıyor");

AeonV2.setArchiveSearch("kesinlikle-yok");
html = dom.html;
assert(/Sonuç bulunamadı/.test(html), "Filtre sonucu yoksa AeEmpty gösteriliyor");
assert(/Seçili filtrelerle eşleşen arşiv kaydı yok/.test(html), "Filtre boş durumu açıklaması var");

// 7. Boş arşiv durumu
AeonV2.resetArchiveFilters();
AeonV2.setData({ days: {}, library: { books: [] }, watchlist: { items: [] }, music: { items: [] } });
AeonV2.setArchiveSubTab("library");
html = dom.html;
assert(/Kütüphane boş/.test(html), "Boş kütüphane mesajı var");
AeonV2.setArchiveSubTab("watch");
html = dom.html;
assert(/İzleme listesi boş/.test(html), "Boş izleme mesajı var");
AeonV2.setArchiveSubTab("listen");
html = dom.html;
assert(/Dinleme listesi boş/.test(html), "Boş dinleme mesajı var");
AeonV2.setArchiveSubTab("quotes");
html = dom.html;
assert(/Alıntı yok/.test(html), "Boş alıntı mesajı var");

// 7. Pagination 100+ öğe
const manyBooks = [];
for (let i = 1; i <= 120; i++) {
  manyBooks.push({ id: "mb_" + i, title: "Kitap " + i, author: "Yazar", status: "reading", createdAt: "2026-07-01T00:00:00Z" });
}
AeonV2.setData({ days: {}, library: { books: manyBooks }, watchlist: { items: [] }, music: { items: [] } });
AeonV2.setArchiveSubTab("library");
html = dom.html;
const firstPageRows = (html.match(/class=\"archive-row\"/g) || []).length;
assert(firstPageRows === 20, "İlk sayfada 20 satır var: " + firstPageRows);
assert(/pagination/.test(html), "Pagination kontrolü var");
assert(/1 \/ 6/.test(html), "Sayfa 1/6 gösteriliyor");

AeonV2.setArchivePage(2);
html = dom.html;
assert(/2 \/ 6/.test(html), "Sayfa 2/6 gösteriliyor");
const secondPageRows = (html.match(/class=\"archive-row\"/g) || []).length;
assert(secondPageRows === 20, "İkinci sayfada 20 satır var: " + secondPageRows);

// 8. Son sayfa
AeonV2.setArchivePage(6);
html = dom.html;
assert(/6 \/ 6/.test(html), "Son sayfa gösteriliyor");
const lastPageRows = (html.match(/class=\"archive-row\"/g) || []).length;
assert(lastPageRows === 20, "Son sayfada 20 satır var: " + lastPageRows);

// 9. Geçersiz sub-tab reddedilir
AeonV2.setArchiveSubTab("invalid");
html = dom.html;
assert(/Kütüphane/.test(html), "Geçersiz sub-tab sonrası Kütüphane sekmesi aktif kaldı");

// 10. Geçersiz sayfa numarası
AeonV2.setArchivePage(-5);
html = dom.html;
assert(/1 \/ 6/.test(html), "Negatif sayfa 1'e sıfırlandı");

console.log("\n🦩 Faz 5 Arşivler fixture — TÜM TESTLER BAŞARILI");
