// ÆON Panel v2 — Faz 5 Arşivler fixture
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

ctx.AeonV2.setData(buildData());
ctx.AeonV2.setTab("archives");

// 1. Sub-tabs render
assert(/sub-tab/.test(html), "Sub-tab butonları render edildi");
assert(/Kütüphane/.test(html), "Kütüphane sub-tab var");
assert(/İzleme/.test(html), "İzleme sub-tab var");
assert(/Dinleme/.test(html), "Dinleme sub-tab var");
assert(/Alıntılar/.test(html), "Alıntılar sub-tab var");

// 2. Kütüphane listesi varsayılan
assert(/archive-row/.test(html), "Kütüphane satırları var");
assert(/Kitap 1/.test(html), "Kitap 1 başlığı var");
assert(/Kitap 5/.test(html), "Kitap 5 başlığı var");
assert(/Bitti/.test(html), "Bitti badge'i var");
assert(/Okunuyor/.test(html), "Okunuyor badge'i var");

// 3. İzleme listesi
ctx.AeonV2.setArchiveSubTab("watch");
assert(/Dizi 1/.test(html), "İzleme listesinde Dizi 1 var");
assert(/İzleniyor/.test(html), "İzleniyor badge'i var");
assert(/Film/.test(html), "Film kategorisi var");

// 4. Dinleme listesi
ctx.AeonV2.setArchiveSubTab("listen");
assert(/Şarkı 1/.test(html), "Dinleme listesinde Şarkı 1 var");
assert(/Podcast/.test(html), "Podcast kategorisi var");
assert(/Sanatçı 1/.test(html), "Sanatçı adı meta olarak var");

// 5. Alıntılar listesi
ctx.AeonV2.setArchiveSubTab("quotes");
assert(/Alıntı kitap 2/.test(html), "Kitap alıntısı var");
assert(/Replik 1/.test(html), "İzleme replik alıntısı var");
assert(/Söz 1/.test(html), "Müzik söz alıntısı var");

// 6. Boş arşiv durumu
ctx.AeonV2.setData({ days: {}, library: { books: [] }, watchlist: { items: [] }, music: { items: [] } });
ctx.AeonV2.setArchiveSubTab("library");
assert(/Kütüphane boş/.test(html), "Boş kütüphane mesajı var");
ctx.AeonV2.setArchiveSubTab("watch");
assert(/İzleme listesi boş/.test(html), "Boş izleme mesajı var");
ctx.AeonV2.setArchiveSubTab("listen");
assert(/Dinleme listesi boş/.test(html), "Boş dinleme mesajı var");
ctx.AeonV2.setArchiveSubTab("quotes");
assert(/Alıntı yok/.test(html), "Boş alıntı mesajı var");

// 7. Pagination 100+ öğe
const manyBooks = [];
for (let i = 1; i <= 120; i++) {
  manyBooks.push({ id: "mb_" + i, title: "Kitap " + i, author: "Yazar", status: "reading", createdAt: "2026-07-01T00:00:00Z" });
}
ctx.AeonV2.setData({ days: {}, library: { books: manyBooks }, watchlist: { items: [] }, music: { items: [] } });
ctx.AeonV2.setArchiveSubTab("library");
const firstPageRows = (html.match(/class=\"archive-row\"/g) || []).length;
assert(firstPageRows === 20, "İlk sayfada 20 satır var: " + firstPageRows);
assert(/pagination/.test(html), "Pagination kontrolü var");
assert(/1 \/ 6/.test(html), "Sayfa 1/6 gösteriliyor");

ctx.AeonV2.setArchivePage(2);
assert(/2 \/ 6/.test(html), "Sayfa 2/6 gösteriliyor");
const secondPageRows = (html.match(/class=\"archive-row\"/g) || []).length;
assert(secondPageRows === 20, "İkinci sayfada 20 satır var: " + secondPageRows);

// 8. Son sayfa
ctx.AeonV2.setArchivePage(6);
assert(/6 \/ 6/.test(html), "Son sayfa gösteriliyor");
const lastPageRows = (html.match(/class=\"archive-row\"/g) || []).length;
assert(lastPageRows === 20, "Son sayfada 20 satır var: " + lastPageRows);

// 9. Geçersiz sub-tab reddedilir
ctx.AeonV2.setArchiveSubTab("invalid");
assert(/Kütüphane/.test(html), "Geçersiz sub-tab sonrası Kütüphane sekmesi aktif kaldı");

// 10. Geçersiz sayfa numarası
ctx.AeonV2.setArchivePage(-5);
assert(/1 \/ 6/.test(html), "Negatif sayfa 1'e sıfırlandı");

console.log("\n🦩 Faz 5 Arşivler fixture — TÜM TESTLER BAŞARILI");
