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

// ── Archive search / filters / views ──
classRule("archive-controls");
classRule("archive-search");
classRule("archive-filter-grid");
classRule("archive-view-toggle");
classRule("archive-list--grid");
assert(css.includes(".archive-controls__summary"), "Arşiv filtre özeti stili var");
assert(css.includes(".archive-list--grid .archive-row"), "Arşiv ızgara satır düzeni var");

// ── System visual refresh ──
classRule("system-progress");
classRule("system-progress__track");
classRule("system-live-metrics");
classRule("status-error");
classRule("audit-timeline");
classRule("audit-timeline__marker");
classRule("message-summary");
classRule("message-bubble--unread");
classRule("settings-card");
assert(css.includes("@keyframes aeNotificationIn"), "Bildirim giriş animasyonu var");
assert(css.includes("@keyframes aeNotificationPulse"), "Okunmamış bildirim pulse animasyonu var");
assert(css.includes(".system-progress--unknown"), "Bilinmeyen progress durumu var");

// ── Buttons ──
classRule("ae-btn");
classRule("ae-btn--glow");
classRule("ae-status-btn");
classRule("density-btn");
assert(css.includes(".ae-status-btn {"), "Senkron durum düğmesi tarayıcı varsayılanından arındırıldı");
assert(css.includes(".ae-tabs {"), "Ana navigasyon kabuğu var");
assert(css.includes("margin: var(--ae-space-sm) var(--ae-space-md) 0"), "Header ve navigasyon arasında premium boşluk var");
assert(css.includes("flex-direction: row"), "Tarih seçiciler yatay düzende tutuluyor");
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
assert(css.includes(".ae-stagger > *"), "Tüm sayfa çocukları stagger zincirine dahil");
assert(css.includes("animation-delay: 0ms"), "Stagger başlangıcı 0ms");
assert(css.includes("animation-delay: 80ms"), "Stagger adımı 80ms");
assert(css.includes("@keyframes aeStaggerIn"), "Genel stagger animasyonu var");
assert(css.includes(".ae-page-transition"), "Sayfa geçişi sınıfı var");
assert(css.includes("@keyframes aePageEnter"), "Sayfa giriş animasyonu var");
assert(css.includes("@keyframes aePageExit"), "Sayfa çıkış animasyonu var");
assert(css.includes("::view-transition-old(aeon-root)"), "Eski sayfa View Transition çıkışı var");
assert(css.includes("::view-transition-new(aeon-root)"), "Yeni sayfa View Transition girişi var");
assert(js.includes("ae-stagger"), "Render çıktılarında stagger kullanılıyor");
assert(js.includes("ae-count-up"), "Render çıktılarında count-up kullanılıyor");
assert(js.includes("startViewTransition"), "Sekme değişiminde View Transition API kullanılıyor");
assert(js.includes("ae-page-transition"), "Sekme paneli geçiş sınıfını kullanıyor");
assert(!js.includes("ae-fade-in"), "JS eski fade-in sınıfını kullanmıyor");

// ── Hero / summary / empty ──
classRule("today-view__intro");
classRule("today-view__eyebrow");
classRule("today-view__title");
classRule("today-view__meta");
classRule("today-view__secondary-grid");
classRule("today-section-card");
assert(css.includes(".today-view__section--picker"), "Today tarih seçici giriş animasyonu var");
assert(css.includes(".today-view__section--trend"), "Today trend giriş animasyonu var");
assert(css.includes(".today-view__secondary-grid { grid-template-columns: repeat(2"), "Today ikincil grid responsive iki kolona çıkıyor");
assert(css.includes(".today-section-card"), "Today ikincil kart yüzeyi var");
assert(js.includes("today-view__intro"), "renderToday premium giriş başlığını oluşturuyor");
assert(js.includes("today-view__secondary-grid ae-stagger"), "renderToday staggered ikincil alanı oluşturuyor");
assert(js.includes('variant: "glass"'), "Today kartları glass varyantını kullanıyor");
assert(js.includes("renderLocationTimeline(date)"), "Today konum kartına seçili tarih aktarılıyor");
classRule("ae-grid--hero");
classRule("ae-metric");
classRule("ae-metric__sparkline");
classRule("ae-metric__delta");
classRule("ae-ring");
classRule("ae-ring__progress");
classRule("summary-card");
classRule("anomaly-card__severity");
assert(css.includes(".summary-card.ae-metric"), "SummaryCard kompakt AeMetric stilleri var");
assert(css.includes(".summary-card.ae-metric .ae-metric__sparkline--svg"), "SummaryCard SVG mini sparkline stilleri var");
assert(js.includes("function AeCard"), "AeCard komponenti JS'de var");
assert(js.includes("cardVariants"), "AeCard canonical variant listesi var");
assert(js.includes("return AeMetric({"), "SummaryCard AeMetric'e delege ediyor");
assert(js.includes("function DetailSection"), "DetailSection komponenti JS'de var");
assert(js.includes("function DetailBlock"), "DetailBlock komponenti JS'de var");
assert(js.includes('sparklineType === "svg"'), "Summary SVG sparkline render kontratı var");
assert(js.includes("data-sparkline-window"), "Summary sparkline pencere metadata'sı var");
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
classRule("zikr-detail");
classRule("zikr-detail__kpis");
classRule("zikr-breakdown__row");
classRule("zikr-reflection");
classRule("loc-history-details");
classRule("loc-history-details__summary");
classRule("loc-actions");
classRule("loc-map-link");
assert(css.includes(".zikr-detail[open]"), "Zikir expander açık durum stili var");
assert(css.includes(".loc-history-details[open]"), "Konum expander açık durum stili var");
assert(css.includes(".loc-map-link:focus-visible"), "Google Maps bağlantısı focus stiline sahip");
assert(js.includes("function renderZikrDetail"), "Zikir ve Esmâ ayrıntı render fonksiyonu var");
assert(js.includes("zikrReflectionWordCount"), "Tefekkür kelime sayısı gösterim kontratı var");
assert(js.includes("loc-history-details"), "Konum geçmişi expander render kontratı var");
assert(js.includes("compressLocationHistory"), "GPS örneklerini anlamlı konumlara indirgeyen helper var");
assert(js.includes("www.google.com/maps/search/"), "Google Maps nokta URL kontratı var");
assert(!js.includes("www.google.com/maps/dir/"), "Google Maps rota URL'si kullanılmıyor");
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

// ── Büyük mood trend chart ──
classRule("ae-mood-chart-card");
classRule("ae-mood-chart__svg");
classRule("ae-mood-chart__grid-line");
classRule("ae-mood-chart__y-label");
classRule("ae-mood-chart__x-label");
classRule("ae-mood-chart__area");
classRule("ae-mood-chart__line");
classRule("ae-mood-chart__point");
classRule("ae-mood-chart__empty");
assert(css.includes(".ae-mood-chart__point:hover"), "Mood trend noktası hover/focus efekti var");
assert(css.includes("filter: drop-shadow(0 0 5px"), "Mood trend line glow efekti var");
assert(js.includes("function renderMoodTrendChart"), "Mood trend chart render fonksiyonu var");
assert(js.includes("lastNDates(30, endDate)"), "Mood trend chart 30 günlük veri kullanıyor");
assert(js.includes("sparklineAreaPath"), "Mood trend chart area path kullanıyor");
assert(js.includes("<title>"), "Mood trend chart native SVG tooltip kullanıyor");

// ── Uyku / adım / su area chart'ları ──
classRule("ae-metric-chart-grid");
classRule("ae-metric-chart-card");
classRule("ae-metric-chart-card--sleep");
classRule("ae-metric-chart-card--steps");
classRule("ae-metric-chart-card--water");
classRule("ae-metric-chart");
classRule("ae-metric-chart__svg");
classRule("ae-metric-chart__grid-line");
classRule("ae-metric-chart__y-label");
classRule("ae-metric-chart__x-label");
classRule("ae-metric-chart__area");
classRule("ae-metric-chart__line");
classRule("ae-metric-chart__target");
classRule("ae-metric-chart__point");
classRule("ae-metric-chart__empty");
assert(css.includes("--ae-chart-color: var(--ae-info)"), "Area chart varsayılan info rengi var");
assert(css.includes(".ae-metric-chart--ok"), "Su area chart ok rengi var");
assert(css.includes("stroke-dasharray: 7 6"), "Area chart hedef çizgisi kesikli");
assert(css.includes("url(#ae-metric-chart-fill-sleep)"), "Uyku area gradient'i var");
assert(css.includes("url(#ae-metric-chart-fill-steps)"), "Adım area gradient'i var");
assert(css.includes("url(#ae-metric-chart-fill-water)"), "Su area gradient'i var");
assert(css.includes(".ae-metric-chart__point:hover"), "Area chart noktası hover/focus efekti var");
assert(css.includes(".ae-metric-chart__point,") && css.includes("prefers-reduced-motion: reduce"), "Area chart reduced-motion desteği var");
assert(js.includes("function renderMetricChart"), "Genel renderMetricChart fonksiyonu var");
assert(js.includes("function renderMetricCharts"), "Üç metrik chart grid render fonksiyonu var");
assert(js.includes('renderMetricChart("sleep"'), "Uyku chart çağrısı var");
assert(js.includes('renderMetricChart("steps"'), "Adım chart çağrısı var");
assert(js.includes('renderMetricChart("water"'), "Su chart çağrısı var");
assert(js.includes('targetKey: "steps"'), "Adım hedef anahtarı var");
assert(js.includes('targetKey: "waterGlasses"'), "Su hedef anahtarı var");

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
classRule("day-heatmap__weekdays");
classRule("day-heatmap__weekday");
classRule("day-heatmap__grid");
classRule("day-heatmap__cell");
classRule("day-heatmap__cell--empty");
classRule("day-heatmap__cell--today");
classRule("day-heatmap__cell--selected");
classRule("day-heatmap__tooltip");
assert(css.includes(".day-heatmap__cell--mood-1"), "Isı haritası mood-1 sınıfı var");
assert(css.includes(".day-heatmap__cell--mood-7"), "Isı haritası mood-7 sınıfı var");
assert(css.includes("radial-gradient(circle"), "Boş günler noktalı desen taşıyor");
assert(css.includes(".day-heatmap__cell:hover .day-heatmap__tooltip"), "Isı haritası hover tooltip görünürlüğü var");
assert(css.includes(".day-heatmap__cell:focus .day-heatmap__tooltip"), "Isı haritası focus tooltip görünürlüğü var");
assert(css.includes("@media (max-width: 374px)"), "Isı haritası küçük ekranda 5 sütuna düşüyor");
assert(js.includes("actualToday"), "Isı haritası bugün hücresini işaretliyor");
assert(js.includes("day-heatmap__weekdays"), "Isı haritası hafta etiketlerini render ediyor");

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
