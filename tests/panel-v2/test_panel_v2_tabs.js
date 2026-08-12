// ÆON Panel v2 — Faz 1 tabs + topbar fixture
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

const { dom, ctx, AeonV2, flushPromises } = boot();

ctx.fetch = function() { return Promise.resolve({ status: 200, ok: true, headers: { get: function() { return null; } }, json: function() { return Promise.resolve({ days: { "2026-07-30": { mood: 5 } }, startDate: "2026-01-01", syncReceipt: { snapshotRevision: "abc123" } }); } }); };
let html = dom.html;

assert(AeonV2.TABS.length === 5, "5 ana sekme tanımlı");
assert(AeonV2.TABS[0].id === "today", "İlk sekme today");
assert(AeonV2.TABS[4].id === "system", "Son sekme system");
assert(typeof AeonV2.TABS[0].icon === "string", "Sekme icon'u var");

AeonV2.init();
html = dom.html;

assert(/role="tablist"/.test(html), "tablist ARIA var");
assert(/role="tab"/.test(html), "tab role var");
assert(/aria-selected="true"/.test(html), "aria-selected true var");
assert(/aria-controls="ae-panel-today"/.test(html), "tab aria-controls var");
assert(/role="tabpanel"/.test(html), "tabpanel role var");
assert(/id="ae-panel-today"/.test(html), "panel id var");
assert(/class="ae-topbar"/.test(html), "topbar render edildi");
assert(/ae-status/.test(html), "status badge render edildi");
assert(/ae-status__dot/.test(html), "status badge dot render edildi");
assert(/ae-btn ae-btn--mini/.test(html), "AeButton mini render edildi");
assert(/Bekliyor/.test(html), "status metni render edildi");
assert(/ÆON/.test(html), "Marka başlığı render edildi");

const tabButtons = html.match(/class="ae-tab(?: is-active)?"/g) || [];
assert(tabButtons.length === 5, "5 sekme butonu var");

AeonV2.setTab("trends");
AeonV2.setData({ days: { "2026-07-30": { mood: 5 } }, startDate: "2026-01-01" });
const trendsHtml = dom.html;
assert(trendsHtml !== html, "setTab sonrası #app HTML değişti");
assert(AeonV2.ui.tab === "trends", "ui.tab trends oldu");
assert(/id="ae-panel-trends"/.test(trendsHtml), "Trendler paneli var");
assert(/aria-selected="true"/.test(trendsHtml), "trends tab selected true");
assert(/ae-btn ae-btn--pill/.test(trendsHtml), "AeButton pill render edildi");

AeonV2.setTab("day");
assert(AeonV2.ui.tab === "day", "ui.tab day oldu");
assert(/Gün Detayı/.test(dom.html), "day placeholder render edildi");

AeonV2.setTab("archives");
assert(/Arşivler/.test(dom.html), "archives placeholder render edildi");

AeonV2.setTab("system");
assert(/Sistem/.test(dom.html), "system placeholder render edildi");

AeonV2.setPanelToken("ghp_demo_token");
AeonV2.refresh().then(function() {
  return flushPromises();
}).then(function() {
  assert(AeonV2.syncStatus.status === "accepted", "refresh sonunda accepted durumuna geçti");

  AeonV2.logout();
  assert(AeonV2.ui.tab === "today", "logout sonrası today sekmesine döndü");
  assert(AeonV2.syncStatus.status === "idle", "logout sonrası status idle");

  console.log("\n🦩 Faz 1 tabs + topbar fixture — TÜM TESTLER BAŞARILI");
});
