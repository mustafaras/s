// ÆON Panel v2 — Faz 1 tabs + topbar fixture
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
  setTimeout: function(cb) { if (typeof cb === "function") cb(); return 0; }
};
ctx.window = ctx;

vm.createContext(ctx);
vm.runInContext(read("panelCoverageManifest.js"), ctx);
vm.runInContext(read("panel-v2.js"), ctx);

assert(ctx.AeonV2.TABS.length === 5, "5 ana sekme tanımlı");
assert(ctx.AeonV2.TABS[0].id === "today", "İlk sekme today");
assert(ctx.AeonV2.TABS[4].id === "system", "Son sekme system");
assert(typeof ctx.AeonV2.TABS[0].icon === "string", "Sekme icon'u var");

ctx.AeonV2.init();
const initHtml = html;

assert(/role="tablist"/.test(initHtml), "tablist ARIA var");
assert(/role="tab"/.test(initHtml), "tab role var");
assert(/aria-selected="true"/.test(initHtml), "aria-selected true var");
assert(/aria-controls="ae-panel-today"/.test(initHtml), "tab aria-controls var");
assert(/role="tabpanel"/.test(initHtml), "tabpanel role var");
assert(/id="ae-panel-today"/.test(initHtml), "panel id var");
assert(/class="ae-topbar"/.test(initHtml), "topbar render edildi");
assert(/ae-status/.test(initHtml), "status badge render edildi");
assert(/Bekliyor/.test(initHtml), "status metni render edildi");
assert(/ÆON/.test(initHtml), "Marka başlığı render edildi");

const tabButtons = initHtml.match(/class="ae-tab(?: is-active)?"/g) || [];
assert(tabButtons.length === 5, "5 sekme butonu var");

ctx.AeonV2.setTab("trends");
const trendsHtml = html;
assert(trendsHtml !== initHtml, "setTab sonrası #app HTML değişti");
assert(ctx.AeonV2.ui.tab === "trends", "ui.tab trends oldu");
assert(/id="ae-panel-trends"/.test(trendsHtml), "Trendler paneli var");
assert(/aria-selected="true"/.test(trendsHtml), "trends tab selected true");

ctx.AeonV2.setTab("day");
assert(ctx.AeonV2.ui.tab === "day", "ui.tab day oldu");
assert(/Gün Detayı/.test(html), "day placeholder render edildi");

ctx.AeonV2.setTab("archives");
assert(/Arşivler/.test(html), "archives placeholder render edildi");

ctx.AeonV2.setTab("system");
assert(/Sistem/.test(html), "system placeholder render edildi");

ctx.AeonV2.refresh();
assert(ctx.AeonV2.syncStatus.status === "accepted", "refresh sonunda accepted durumuna geçti");

ctx.AeonV2.logout();
assert(ctx.AeonV2.ui.tab === "today", "logout sonrası today sekmesine döndü");
assert(ctx.AeonV2.syncStatus.status === "idle", "logout sonrası status idle");

console.log("\n🦩 Faz 1 tabs + topbar fixture — TÜM TESTLER BAŞARILI");
