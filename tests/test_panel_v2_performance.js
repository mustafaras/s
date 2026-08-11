// PANEL-REVIZE Prompt 38 — containment, lazy map/archive ve event pacing fixture
"use strict";

const { boot, read, assert } = require("./helpers/panel-v2-test-helper");

const html = read("panel-v2.html");
const css = read("panel-v2.css");
const js = read("panel-v2.js");

assert(css.includes("contain: layout style paint"), "Kartlarda layout/style/paint containment var");
assert(css.includes("content-visibility: auto"), "Offscreen bölümlerde content-visibility auto var");
assert(css.includes("contain-intrinsic-size: auto 160px"), "Offscreen bölümler için intrinsic boyut var");
assert(css.includes("contain-intrinsic-size: auto 420px"), "Arşiv listesi için intrinsic boyut var");
assert(html.includes("panel-v2.css?v=20260811m"), "CSS cache-bust Prompt 38 sürümüne yükseltildi");
assert(html.includes("panel-v2.js?v=20260811m"), "JS cache-bust Prompt 38 sürümüne yükseltildi");
assert(!html.includes("unpkg.com/leaflet@1.9.4/dist/leaflet.js"), "Leaflet script'i eager yüklenmiyor");
assert(!html.includes("unpkg.com/leaflet@1.9.4/dist/leaflet.css"), "Leaflet CSS'i eager yüklenmiyor");
assert(js.includes("function throttle("), "Scroll throttle helper'ı var");
assert(js.includes("function debounce("), "Resize debounce helper'ı var");
assert(js.includes("IntersectionObserver"), "Harita görünürlük gözlemcisi var");
assert(js.includes("ensureLeafletAssets"), "Leaflet dinamik yükleme helper'ı var");
assert(js.includes("getArchivePageState"), "Arşiv aktif sayfa state helper'ı var");
assert(js.includes("data-archive-page"), "Arşiv DOM'u aktif sayfa metadata'sı taşıyor");

const { dom, ctx, runTimers } = boot();
const listeners = {};
ctx.addEventListener = function(type, listener) {
  listeners[type] = listener;
};

ctx.AeonV2.init();
let perf = ctx.AeonV2.getPerformanceState();
assert(perf.rootListenersBound === true, "Root resize/scroll listener'ları bağlandı");
assert(perf.mapScheduleCount === 0, "Konum verisi yokken harita planlanmıyor");

listeners.scroll({ target: { scrollTop: 42 } });
perf = ctx.AeonV2.getPerformanceState();
assert(perf.scrollHandled === 1 && perf.lastScrollTop === 42, "Scroll throttle ilk olayı işler");

const beforeResize = perf.resizeHandled;
listeners.resize({ target: ctx });
perf = ctx.AeonV2.getPerformanceState();
assert(perf.resizeHandled === beforeResize, "Resize debounce hemen çalışmaz");
ctx.AeonV2.render();
runTimers();
perf = ctx.AeonV2.getPerformanceState();
assert(perf.resizeHandled === beforeResize + 1, "Resize debounce gecikmeli çalışır");

const books = [];
for (let i = 1; i <= 25; i += 1) {
  books.push({ id: "book-" + i, title: "Kitap " + i, status: "reading", totalPages: 100, currentPage: i });
}
ctx.AeonV2.setData({ days: {}, library: { books } });
ctx.AeonV2.setTab("archives");
let archive = dom.html;
assert(archive.includes('data-archive-page="1"'), "Arşiv ilk sayfayı metadata ile işaretler");
assert(archive.includes('data-archive-total="25"'), "Arşiv toplam kayıt sayısını taşır");
assert((archive.match(/class="archive-row"/g) || []).length === 20, "Arşiv ilk sayfada yalnızca 20 satır materyalize eder");

ctx.AeonV2.setArchivePage(2);
archive = dom.html;
assert(archive.includes('data-archive-page="2"'), "Sayfa değişince yalnızca yeni aktif sayfa işaretlenir");
assert(archive.includes("Kitap 21"), "Arşiv ikinci sayfanın ilk kaydını render eder");
assert(!archive.includes("Kitap 1"), "Arşiv ikinci sayfa önceki sayfa satırlarını taşımıyor");

console.log("\n🦩 Prompt 38 performans fixture — TÜM TESTLER BAŞARILI");
