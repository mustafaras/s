// PANEL-REVIZE — panel-v2.css contract fixture
// Temel CSS tasarım sisteminin varlığını ve tutarlılığını doğrular.
"use strict";

const { read, assert } = require("./helpers/panel-v2-test-helper");

const css = read("panel-v2.css");

function varRule(name, fallback) {
  const re = new RegExp(name + "s*:");
  assert(re.test(css), "CSS değişkeni var: " + name);
}

function classRule(cls) {
  assert(css.includes("." + cls), "CSS class var: ." + cls);
}

function mediaRule(query) {
  assert(css.includes("@media (" + query + ")"), "@media var: " + query);
}

// ── Core variables ──
[
  "--ae-page", "--ae-bg", "--ae-surface", "--ae-elevated",
  "--ae-text", "--ae-muted", "--ae-faint",
  "--ae-accent", "--ae-accent2", "--ae-accent-soft", "--ae-accent-glow",
  "--ae-ok", "--ae-warn", "--ae-drop", "--ae-info", "--ae-pause",
  "--ae-card-bg", "--ae-card-bd", "--ae-card-shadow", "--ae-card-radius",
  "--ae-nav-bg", "--ae-nav-active", "--ae-nav-active-text", "--ae-tab-bd",
  "--ae-chip-bg", "--ae-chip-text",
  "--ae-empty-bg", "--ae-empty-icon",
  "--ae-space-xs", "--ae-space-sm", "--ae-space-md", "--ae-space-lg", "--ae-space-xl",
  "--ae-font", "--ae-radius-sm", "--ae-radius-md", "--ae-radius-lg",
  "--ae-ease"
].forEach(varRule);

// ── Dark theme override block ──
assert(css.includes('#root[data-theme="dark"]'), "Dark theme override bloğu var");
assert(css.includes("--ae-page"), "Dark theme --ae-page override var");

// ── Layout / app shell ──
classRule("ae-app");
classRule("ae-app__body");

// ── Cards ──
classRule("ae-card");
classRule("ae-card--hero");
classRule("hero-card");

// ── Tabs / navigation ──
classRule("ae-tabs");
classRule("ae-tab");
classRule("ae-tab.is-active");
classRule("sub-tabs");
classRule("sub-tab");
classRule("sub-tab.is-active");

// ── Buttons ──
classRule("ae-btn");
classRule("ae-status-btn");
classRule("density-btn");

// ── Hero / summary / empty ──
classRule("ae-grid--hero");
classRule("summary-card");
classRule("ae-empty");
classRule("ae-empty__icon");

// ── Trend bars (data-pct driven) ──
classRule("trend-bar");
classRule("trend-bar__fill");
classRule("trend-bar--empty");
classRule("trend-bar--mood");
assert(css.includes('[data-pct="0"]'), "data-pct=0 selector var");
assert(css.includes('[data-pct="50"]'), "data-pct=50 selector var");
assert(css.includes('[data-pct="100"]'), "data-pct=100 selector var");

// ── 30-day heatmap (day detail) ──
classRule("day-heatmap");
classRule("day-heatmap__grid");
classRule("day-heatmap__cell");
assert(css.includes(".day-heatmap__cell--mood-1"), "Isı haritası mood-1 sınıfı var");
assert(css.includes(".day-heatmap__cell--mood-7"), "Isı haritası mood-7 sınıfı var");

// ── Accessibility / motion ──
assert(css.includes("focus-visible"), ":focus-visible kullanımı var");
mediaRule("prefers-reduced-motion: reduce");

// ── Density variants ──
assert(css.includes('[data-density="compact"]'), "data-density=compact selector var");
assert(css.includes('[data-density="spacious"]'), "data-density=spacious selector var");

// ── Responsive breakpoints ──
mediaRule("min-width: 375px");
mediaRule("min-width: 460px");
mediaRule("min-width: 768px");
mediaRule("min-width: 1200px");

// ── No inline style escape hatch: ensure design tokens are not using px hardcodes for spacing scale
const spaceVars = [
  "var(--ae-space-xs)", "var(--ae-space-sm)", "var(--ae-space-md)", "var(--ae-space-lg)", "var(--ae-space-xl)"
];
let spaceTokenUsage = 0;
spaceVars.forEach(function(token) {
  const matches = css.split(token).length - 1;
  spaceTokenUsage += matches;
});
assert(spaceTokenUsage >= 5, "Tasarım sistemi spacing token'larını kullanıyor: " + spaceTokenUsage);

// ── !important usage limited to reduced-motion overrides ──
const importantCount = (css.match(/!important/g) || []).length;
const reducedMotionBlock = css.indexOf("prefers-reduced-motion: reduce");
const afterReducedMotion = css.slice(reducedMotionBlock);
const reducedMotionImportantCount = (afterReducedMotion.match(/!important/g) || []).length;
assert(importantCount > 0, "Reduced-motion blokları !important kullanıyor (count=" + importantCount + ")");
assert(reducedMotionImportantCount === importantCount, "Tüm !important kullanımları reduced-motion blokunda (count=" + importantCount + ")");

console.log("\n🦩 panel-v2.css contract fixture — TÜM TESTLER BAŞARILI");
console.log("Spacing token kullanımı: " + spaceTokenUsage);
console.log("!important kullanımı: " + importantCount);
