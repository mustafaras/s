// PANEL-REVIZE — panel-v2.css contract fixture
// Temel CSS tasarım sisteminin varlığını ve tutarlılığını doğrular.
"use strict";

const { read, assert } = require("./helpers/panel-v2-test-helper");

const css = read("panel-v2.css");
const js = read("panel-v2.js");

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
  "--ae-accent", "--ae-accent2", "--ae-accent3", "--ae-accent-soft", "--ae-accent-glow",
  "--ae-ok", "--ae-warn", "--ae-drop", "--ae-info", "--ae-pause",
  "--ae-glass", "--ae-glass-border", "--ae-glow-accent", "--ae-glow-ok", "--ae-glow-drop",
  "--ae-shadow-sm", "--ae-shadow-md", "--ae-shadow-lg", "--ae-shadow-xl", "--ae-shadow-glow",
  "--ae-card-bg", "--ae-card-bd", "--ae-card-shadow", "--ae-card-radius",
  "--ae-nav-bg", "--ae-nav-active", "--ae-nav-active-text", "--ae-tab-bd",
  "--ae-chip-bg", "--ae-chip-text",
  "--ae-empty-bg", "--ae-empty-icon",
  "--ae-skeleton-bg", "--ae-skeleton-shine",
  "--ae-space-2xs", "--ae-space-xs", "--ae-space-sm", "--ae-space-md", "--ae-space-lg", "--ae-space-xl", "--ae-space-2xl", "--ae-space-3xl",
  "--ae-font", "--ae-mono", "--ae-scale-xs", "--ae-scale-sm", "--ae-scale-md", "--ae-scale-lg", "--ae-scale-xl", "--ae-scale-2xl", "--ae-scale-3xl",
  "--ae-radius-xs", "--ae-radius-sm", "--ae-radius-md", "--ae-radius-lg", "--ae-radius-xl", "--ae-radius-full",
  "--ae-ease"
].forEach(varRule);

// ── Premium token values ──
[
  "--ae-page: #F5F3EF", "--ae-bg: #FDFCFA", "--ae-surface: #FCFAF7", "--ae-elevated: #FAF7F2",
  "--ae-accent: #B08D4E", "--ae-accent3: #A08040",
  "--ae-space-2xs: 2px", "--ae-space-2xl: 32px", "--ae-space-3xl: 48px",
  "--ae-radius-xs: 6px", "--ae-radius-xl: 28px", "--ae-radius-full: 9999px",
  "--ae-page: #0C0A09", "--ae-bg: #11100E", "--ae-surface: #1A1815", "--ae-elevated: #221F1B",
  "--ae-accent: #D4AF6E", "--ae-accent2: #F0D48A", "--ae-accent3: #A08040",
  "--ae-ok: #4CAF7A", "--ae-warn: #D4A84C", "--ae-drop: #C86565", "--ae-info: #5E8AAA",
  "--ae-glass: rgba(255,255,255,0.04)", "--ae-glass-border: rgba(255,255,255,0.06)",
  "--ae-glow-accent: 0 0 30px rgba(212,175,110,0.15)",
  "--ae-glow-ok: 0 0 20px rgba(76,175,122,0.12)",
  "--ae-glow-drop: 0 0 20px rgba(200,101,101,0.12)",
  "--ae-shadow-sm: 0 2px 8px rgba(0,0,0,0.12)",
  "--ae-shadow-md: 0 8px 24px rgba(0,0,0,0.16)",
  "--ae-shadow-lg: 0 16px 48px rgba(0,0,0,0.20)",
  "--ae-shadow-xl: 0 24px 64px rgba(0,0,0,0.25)",
  "--ae-shadow-glow: 0 0 30px rgba(212,175,110,0.10)"
].forEach(function(token) {
  assert(css.includes(token), "Premium token değeri var: " + token);
});

// ── Typography tokens / mono data surface ──
[
  "--ae-font: 'Inter', -apple-system, sans-serif",
  "--ae-mono: 'JetBrains Mono', 'SF Mono', monospace",
  "--ae-scale-xs: 10px", "--ae-scale-sm: 12px", "--ae-scale-md: 14px",
  "--ae-scale-lg: 18px", "--ae-scale-xl: 24px", "--ae-scale-2xl: 32px", "--ae-scale-3xl: 42px"
].forEach(function(token) {
  assert(css.includes(token), "Tipografi token değeri var: " + token);
});
[
  ".ae-value", ".summary-card__value", ".day-date-picker__iso", ".date-picker__iso",
  ".loc-timeline-compact", ".sess-item__value", ".status-row__value", ".loc-dot__coord"
].forEach(function(selector) {
  assert(css.includes(selector), "Mono veri yüzeyi seçicisi var: " + selector);
});
assert(!/font-size:\s*[0-9]+px/.test(css), "Tüm font-size değerleri scale token kullanıyor");

// ── Dark theme override block ──
assert(css.includes('#root[data-theme="dark"]'), "Dark theme override bloğu var");
assert(css.includes("--ae-page"), "Dark theme --ae-page override var");

// ── Layout / app shell ──
classRule("ae-app");
classRule("ae-app__body");

// ── Cards ──
classRule("ae-card");
classRule("ae-card--glass");
classRule("ae-card--solid");
classRule("ae-card--gradient");
classRule("ae-card--outline");
classRule("ae-card--hero");
classRule("hero-card");
assert(css.includes("backdrop-filter: blur(20px)"), "Glass blur efekti var");
assert(css.includes("-webkit-backdrop-filter: blur(20px)"), "WebKit glass blur efekti var");
assert(css.includes("transform: translateY(-4px)"), "Kart hover yükselme efekti var");
assert(css.includes("var(--ae-shadow-lg), var(--ae-shadow-glow)"), "Kart hover glow gölgesi var");

// ── Tabs / navigation ──
classRule("ae-tabs");
classRule("ae-tab");
classRule("ae-tab.is-active");
classRule("sub-tabs");
classRule("sub-tab");
classRule("sub-tab.is-active");

// ── Buttons ──
classRule("ae-btn");
classRule("ae-btn--glow");
classRule("ae-status-btn");
classRule("density-btn");
assert(css.includes("background: linear-gradient(135deg, var(--ae-accent), var(--ae-accent2));"), "Primary/pill gradient var");
assert(css.includes("box-shadow: var(--ae-shadow-md), var(--ae-glow-accent);"), "Primary hover glow shadow var");
assert(css.includes("transform: translateY(-1px) scale(1.02);"), "Primary hover spring scale var");
assert(css.includes("transform: scale(0.97);"), "Button active spring scale var");
assert(css.includes("background: linear-gradient(135deg, var(--ae-drop),"), "Drop button red gradient var");
assert(css.includes(".ae-btn--pill.is-active"), "Active pill selector var");
assert(css.includes("box-shadow: 0 0 8px var(--ae-ok);"), "OK status dot glow var");
assert(css.includes("@keyframes aeStatusDropPulse"), "Drop status pulse animation var");
assert(css.includes("box-shadow: 0 0 12px var(--ae-drop);"), "Drop status dot red glow var");

// ── Animation system ──
[
  "ae-slide-up", "ae-scale-in", "ae-shimmer", "ae-count-up", "ae-pulse", "ae-stagger"
].forEach(classRule);
[
  "@keyframes aeSlideUp", "@keyframes aeScaleIn", "@keyframes aeShimmer",
  "@keyframes aeCountUp", "@keyframes aePulse"
].forEach(function(animation) {
  assert(css.includes(animation), "Animasyon tanımı var: " + animation);
});
assert(css.includes("translateY(12px)"), "Slide-up başlangıç mesafesi var");
assert(css.includes("scale(0.95)"), "Scale-in başlangıç ölçeği var");
assert(css.includes("background-position: -200% 0"), "Shimmer başlangıç pozisyonu var");
assert(css.includes("translateY(8px)"), "Count-up başlangıç mesafesi var");
assert(css.includes(".ae-stagger > .ae-card:nth-child(6)"), "Stagger gecikme zinciri var");
assert(js.includes("ae-stagger"), "Render çıktılarında stagger kullanılıyor");
assert(js.includes("ae-count-up"), "Render çıktılarında count-up kullanılıyor");
assert(!js.includes("ae-fade-in"), "JS eski fade-in sınıfını kullanmıyor");

// ── Hero / summary / empty ──
classRule("ae-grid--hero");
classRule("ae-metric");
classRule("ae-metric__sparkline");
classRule("ae-metric__delta");
classRule("ae-ring");
classRule("ae-ring__progress");
classRule("summary-card");
classRule("anomaly-card__severity");
assert(css.includes(".summary-card.ae-metric"), "SummaryCard kompakt AeMetric stilleri var");
assert(js.includes("function AeCard"), "AeCard komponenti JS'de var");
assert(js.includes("cardVariants"), "AeCard canonical variant listesi var");
assert(js.includes("return AeMetric({"), "SummaryCard AeMetric'e delege ediyor");
assert(js.includes("function DetailSection"), "DetailSection komponenti JS'de var");
assert(js.includes("function DetailBlock"), "DetailBlock komponenti JS'de var");
classRule("ae-empty");
classRule("ae-empty__icon");
classRule("ae-divider");
classRule("ae-divider--label");
classRule("ae-toast");
classRule("ae-toast--success");
classRule("ae-toast--error");
classRule("ae-toast--info");
classRule("ae-skeleton");
classRule("ae-skeleton--text");
classRule("ae-skeleton--card");
classRule("ae-skeleton--circle");
classRule("ae-tooltip");
assert(css.includes("background: linear-gradient(90deg, var(--ae-skeleton-bg)"), "Skeleton gradient var");
assert(css.includes(".ae-tooltip::after"), "Tooltip arrow var");
assert(css.includes("backdrop-filter: blur(16px) saturate(1.2)"), "Tooltip glass blur var");
assert(css.includes(".ae-tooltip-wrap:hover .ae-tooltip"), "Tooltip hover görünürlüğü var");
assert(css.includes(".ae-tooltip-wrap:focus-within .ae-tooltip"), "Tooltip focus görünürlüğü var");
assert(css.includes("linear-gradient(90deg, transparent"), "Divider gradient çizgisi var");
assert(css.includes("@keyframes aeToastIn"), "Toast slide-in animasyonu var");
assert(css.includes("backdrop-filter: blur(20px) saturate(1.15)"), "Toast glass blur var");
assert(js.includes("function AeDivider"), "AeDivider JS komponenti var");
assert(js.includes("function AeToast"), "AeToast JS komponenti var");
assert(js.includes("function showToast"), "showToast JS fonksiyonu var");

// ── SVG sparklines ──
classRule("trend-strip__sparkline");
classRule("ae-sparkline");
classRule("ae-sparkline__svg");
classRule("ae-sparkline__line");
classRule("ae-sparkline__area");
classRule("ae-sparkline__dot");
classRule("ae-sparkline--accent");
classRule("ae-sparkline--info");
classRule("ae-sparkline--ok");
assert(css.includes('.ae-sparkline__dot[data-last="true"]'), "Sparkline son nokta vurgusu var");
assert(css.includes('preserveAspectRatio="none"') || js.includes('preserveAspectRatio="none"'), "Sparkline responsive SVG oranı var");
assert(css.includes("color-mix(in srgb, var(--ae-spark-color) 18%, transparent)"), "Sparkline area fill token rengi var");
assert(js.includes("function AeSparkline"), "AeSparkline JS komponenti var");
assert(!js.includes("metricBar("), "Trend strip eski metricBar fonksiyonunu kullanmıyor");
assert(!css.includes(".trend-bar"), "CSS eski trend bar bileşenini taşımıyor");

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
