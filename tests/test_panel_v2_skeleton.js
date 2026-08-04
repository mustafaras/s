// ÆON Panel v2 — Faz 0 skeleton fixture
// Headless Node testi: DOM mock + panel-v2.js boot.
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

// DOM mock
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

const panelHtml = read("panel-v2.html");
const panelCss = read("panel-v2.css");

assert(panelHtml.includes('<!DOCTYPE html>'), "panel-v2.html DOCTYPE var");
assert(panelHtml.includes('html lang="tr"'), "panel-v2.html lang=tr");
assert(panelHtml.includes('id="app"'), "panel-v2.html #app var");
assert(panelHtml.includes('panel-v2.css'), "panel-v2.html CSS yükleniyor");
assert(panelHtml.includes('panel-v2.js'), "panel-v2.html JS yükleniyor");
assert(panelHtml.includes('panelCoverageManifest.js'), "panel-v2.html coverage manifest yükleniyor");

assert(panelCss.includes('.ae-card'), "panel-v2.css .ae-card var");
assert(panelCss.includes('.ae-tabs'), "panel-v2.css .ae-tabs var");
assert(panelCss.includes('.ae-tab'), "panel-v2.css .ae-tab var");
assert(panelCss.includes('.ae-grid--hero'), "panel-v2.css .ae-grid--hero var");
assert(panelCss.includes('.ae-empty'), "panel-v2.css .ae-empty var");
assert(panelCss.includes('[data-theme="dark"]'), "panel-v2.css dark theme var");

// Load coverage manifest + panel-v2.js in fresh VM
const vm = require("vm");
const ctx = { window: {}, document: global.document, console };
ctx.window = ctx;

vm.createContext(ctx);
vm.runInContext(read("panelCoverageManifest.js"), ctx);
vm.runInContext(read("panel-v2.js"), ctx);

assert(typeof ctx.AeonV2 === "object", "window.AeonV2 export ediliyor");
assert(typeof ctx.AeonV2.render === "function", "AeonV2.render fonksiyonu var");
assert(typeof ctx.AeonV2.setTab === "function", "AeonV2.setTab fonksiyonu var");
assert(typeof ctx.AeonV2.init === "function", "AeonV2.init fonksiyonu var");
assert(typeof ctx.AeonV2.projectData === "function", "AeonV2.projectData fonksiyonu var");

ctx.AeonV2.init();
const afterInit = html;
assert(afterInit.includes('role="tablist"'), "İnit sonrası tablist render edildi");
assert(afterInit.includes('Genel Bakış'), "İnit sonrası today sekmesi var");

ctx.AeonV2.setTab("trends");
const afterTrends = html;
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

console.log("\n🦩 Faz 0 skeleton fixture — TÜM TESTLER BAŞARILI");
