// ÆON Panel v2 — Faz 0 skeleton fixture
// Headless Node testi: shared helper ile panel-v2.js boot.
"use strict";

const { boot, read, assert } = require("./helpers/panel-v2-test-helper");

const { dom, ctx, flushPromises } = boot();

const panelHtml = read("panel-v2.html");
const panelCss = read("panel/v2/panel-v2.css");

assert(panelHtml.includes('<!DOCTYPE html>'), "panel-v2.html DOCTYPE var");
assert(panelHtml.includes('html lang="tr"'), "panel-v2.html lang=tr");
assert(panelHtml.includes('id="app"'), "panel-v2.html #app var");
assert(panelHtml.includes('panel/v2/panel-v2.css'), "panel-v2.html CSS yükleniyor");
assert(panelHtml.includes('panel/v2/panel-v2.js'), "panel-v2.html JS yükleniyor");
assert(panelHtml.includes('fonts.googleapis.com/css2?family=Inter'), "Inter font link'i var");
assert(panelHtml.includes('JetBrains+Mono'), "JetBrains Mono font link'i var");
assert(panelHtml.includes('panel/panelCoverageManifest.js'), "panel-v2.html coverage manifest yükleniyor");

assert(panelCss.includes('.ae-card'), "panel-v2.css .ae-card var");
assert(panelCss.includes('.ae-card--glass'), "panel-v2.css glass kart varyantı var");
assert(panelCss.includes('.ae-card--solid'), "panel-v2.css solid kart varyantı var");
assert(panelCss.includes('.ae-card--gradient'), "panel-v2.css gradient kart varyantı var");
assert(panelCss.includes('.ae-card--outline'), "panel-v2.css outline kart varyantı var");
assert(panelCss.includes('.ae-tabs'), "panel-v2.css .ae-tabs var");
assert(panelCss.includes('.ae-tab'), "panel-v2.css .ae-tab var");
assert(panelCss.includes('.ae-grid--hero'), "panel-v2.css .ae-grid--hero var");
assert(panelCss.includes('.ae-empty'), "panel-v2.css .ae-empty var");
assert(panelCss.includes('[data-theme="dark"]'), "panel-v2.css dark theme var");
assert(panelCss.includes('.ae-skeleton'), "panel-v2.css .ae-skeleton var");
assert(panelCss.includes('.ae-skeleton--text'), "panel-v2.css skeleton text varyantı var");
assert(panelCss.includes('.ae-skeleton--card'), "panel-v2.css skeleton card varyantı var");
assert(panelCss.includes('.ae-skeleton--circle'), "panel-v2.css skeleton circle varyantı var");
assert(panelCss.includes('.ae-tooltip'), "panel-v2.css .ae-tooltip var");
assert(panelCss.includes('.ae-tooltip::after'), "panel-v2.css tooltip ok işareti var");
assert(panelCss.includes('background-position: -200% 0'), "skeleton shimmer başlangıcı var");

assert(typeof ctx.AeonV2 === "object", "window.AeonV2 export ediliyor");
assert(typeof ctx.AeonV2.render === "function", "AeonV2.render fonksiyonu var");
assert(typeof ctx.AeonV2.setTab === "function", "AeonV2.setTab fonksiyonu var");
assert(typeof ctx.AeonV2.init === "function", "AeonV2.init fonksiyonu var");
assert(typeof ctx.AeonV2.projectData === "function", "AeonV2.projectData fonksiyonu var");
assert(typeof ctx.AeonV2.AeSkeleton === "function", "AeSkeleton export ediliyor");
assert(typeof ctx.AeonV2.AeTooltip === "function", "AeTooltip export ediliyor");
assert(typeof ctx.AeonV2.renderLoadingState === "function", "renderLoadingState export ediliyor");

const skeletonCard = ctx.AeonV2.AeSkeleton({ variant: "card" });
assert(skeletonCard.includes("ae-skeleton ae-skeleton--card ae-shimmer"), "AeSkeleton card markup doğru");
const tooltip = ctx.AeonV2.AeTooltip({ id: "fixture-tip", text: "Bilgi", label: "?" });
assert(tooltip.includes('class="ae-tooltip-wrap"'), "AeTooltip wrapper markup doğru");
assert(tooltip.includes('role="tooltip"'), "AeTooltip role=tooltip var");
assert(tooltip.includes('aria-describedby="fixture-tip"'), "AeTooltip aria-describedby var");

ctx.AeonV2.init();
const afterInit = dom.html;
assert(afterInit.includes('role="tablist"'), "İnit sonrası tablist render edildi");
assert(afterInit.includes('Genel Bakış'), "İnit sonrası today sekmesi var");

ctx.AeonV2.setTab("trends");
const afterTrends = dom.html;
assert(afterTrends !== afterInit, "setTab('trends') sonrası #app HTML değişti");
assert(afterTrends.includes('Trendler'), "Trendler sekmesi render edildi");

// projectData smoke tests
const emptyProjection = ctx.AeonV2.projectData(null);
assert(emptyProjection.ok === true, "projectData(null) ok=true döner");
assert(typeof emptyProjection.coverage === "object", "projectData coverage objesi döner");
assert(Array.isArray(emptyProjection.coverage.redacted), "coverage.redacted array");

const sampleData = { days: { "2026-08-04": { mood: 4 } }, savedAt: "2026-08-04T00:00:00Z" };
const sampleProjection = ctx.AeonV2.projectData(sampleData);
assert(sampleProjection.dayCount === 1, "projectData dayCount doğru");

let resolveFetch;
ctx.fetch = function() {
  return new Promise(function(resolve) {
    resolveFetch = resolve;
  });
};
ctx.AeonV2.setPanelToken("ghp_demo_token");
const refreshPromise = ctx.AeonV2.refresh();
const loadingHtml = dom.html;
assert(loadingHtml.includes('class="ae-loading ae-slide-up"'), "Fetch sırasında loading shell render edildi");
assert(loadingHtml.includes("ae-skeleton--card"), "Fetch sırasında card skeleton render edildi");
assert(loadingHtml.includes("Veriler yükleniyor"), "Fetch sırasında loading etiketi var");

resolveFetch({
  status: 200,
  ok: true,
  headers: { get: function() { return null; } },
  json: function() { return Promise.resolve(sampleData); }
});

refreshPromise.then(function() {
  return flushPromises();
}).then(function() {
  assert(!dom.html.includes('class="ae-loading ae-slide-up"'), "Fetch tamamlanınca loading shell kaldırıldı");
  assert(dom.html.includes("Trendler"), "Fetch tamamlanınca gerçek panel içeriği render edildi");
  console.log("\n🦩 Faz 0 skeleton + tooltip fixture — TÜM TESTLER BAŞARILI");
}).catch(function(error) {
  console.error("❌ FAIL: " + error.message);
  process.exitCode = 1;
});
