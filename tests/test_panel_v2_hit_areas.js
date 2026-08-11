// PROMPT-27 — Touch-friendly hit-area contract for Panel-v2.
// Static contract fixture: no browser, network, token or user data.
"use strict";

const { read, assert } = require("./helpers/panel-v2-test-helper");

const css = read("panel-v2.css");
const html = read("panel-v2.html");
const js = read("panel-v2.js");

function bodyFor(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp("(?:^|\\n)" + escaped + "\\s*\\{([\\s\\S]*?)\\n\\}"));
  assert(match, "CSS kuralı var: " + selector);
  return match[1];
}

function declaration(selector, property, value) {
  assert(new RegExp(property + "\\s*:\\s*" + value).test(bodyFor(selector)), selector + " " + property + "=" + value);
}

// All button/tab/disclosure trigger surfaces are at least 44×44 CSS pixels.
[
  ".ae-btn",
  ".ae-tab",
  ".sub-tab",
  ".density-btn",
  ".ae-status-btn",
  ".ae-toast__close",
  ".ae-tooltip-trigger",
  ".day-heatmap__cell"
].forEach(function(selector) {
  declaration(selector, "min-width", "44px");
  declaration(selector, "min-height", "44px");
});

declaration(".ae-chip", "min-height", "32px");
declaration(".loc-map-link", "min-height", "44px");
declaration(".token-input", "min-height", "44px");
declaration(".history-filter select", "min-height", "44px");

assert(css.includes(".loc-dot__map,\n.loc-popup-map-link {"), "Konum bağlantıları ortak hit-area kuralında");
assert(/\.loc-dot__map,[\s\S]*?min-width:\s*44px/.test(css), "Geçmiş konum bağlantısı min-width 44px");
assert(/\.loc-dot__map,[\s\S]*?min-height:\s*44px/.test(css), "Geçmiş konum bağlantısı min-height 44px");
assert(/\.archive-search input,[\s\S]*?min-height:\s*44px/.test(css), "Arşiv input/select yüzeyleri min-height 44px");

// Breakpoint coverage: base contract applies at 375/414/460/768; mobile-specific
// navigation remains active through 460px and the narrow heatmap has a safe fallback.
assert(css.includes("@media (max-width: 460px)"), "375/414/460px mobil breakpoint'i var");
assert(css.includes("@media (max-width: 374px)"), "Dar ekran heatmap fallback breakpoint'i var");
assert(css.includes("@media (min-width: 768px)"), "768px masaüstü breakpoint'i var");
assert(html.includes("panel-v2.css?v=20260811e"), "Panel-v2 CSS cache-bust sürümü güncel");
assert(js.includes('class="ae-tab'), "Ana tablar gerçek button yüzeyi üretiyor");
assert(js.includes('class="sub-tab'), "Alt tablar gerçek button yüzeyi üretiyor");

console.log("\n✅ Prompt 27 hit-area contract — TÜM TESTLER BAŞARILI");
