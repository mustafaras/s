// ÆON Panel v2 — Prompt 39 yeni komponent ve yaşam döngüsü kontrat fixture'ı
// Headless VM; gerçek browser, network, user data veya secret yok.
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

function countMatches(value, pattern) {
  return (String(value).match(pattern) || []).length;
}

function event(sequence, id, section, operation, occurredAt, summary) {
  return {
    eventId: id,
    correlationId: "fixture-correlation-" + id,
    sequence: sequence,
    occurredAt: occurredAt,
    persistedAt: occurredAt,
    section: section,
    path: "data.days.*." + section,
    operation: operation,
    summary: summary,
    source: "fixture",
    sourceDeviceId: "prompt39-device",
    privacyClass: "summary",
    snapshotRevision: String(sequence).padStart(40, "0")
  };
}

const helper = boot();
const { dom, ctx, AeonV2 } = helper;

// AeMetric — value, delta, sparkline and count contract.
const metric = AeonV2.AeMetric({
  title: "Uyku",
  value: "7.5",
  unit: "sa",
  countValue: 7.5,
  countFormat: "hours",
  color: "info",
  delta: { value: "↑ 0.5", tone: "ok", label: "Önceki haftaya göre" },
  sparkline: [6, 7, null, 7.5],
  sparklineType: "svg",
  sparklineLimit: 4,
  sparklineLabel: "Uyku son 4 kayıt"
});
assert(/^<article class="/.test(metric), "AeMetric article yüzeyi oluşturuyor");
assert(/ae-metric__value/.test(metric) && />7\.5<\/span>/.test(metric), "AeMetric değeri gösteriyor");
assert(/ae-metric__unit/.test(metric) && />sa<\/span>/.test(metric), "AeMetric birimi gösteriyor");
assert(/ae-metric__delta ae-metric__delta--ok/.test(metric) && /Önceki haftaya göre/.test(metric), "AeMetric delta tone ve etiketi taşıyor");
assert(/ae-sparkline__line/.test(metric) && /data-sparkline-window="4"/.test(metric), "AeMetric SVG sparkline ve pencere bilgisini taşıyor");
assert(/data-count-target="7\.5"/.test(metric) && /data-count-format="hours"/.test(metric), "AeMetric count-up metadata taşıyor");

// AeSparkline — SVG path, null gap, color normalization and empty state.
const sparkline = AeonV2.AeSparkline([1, null, 3, 5], "mood", 42, "Ruh hali");
assert(/ae-sparkline ae-sparkline--accent/.test(sparkline), "AeSparkline mood rengini accent'e normalize ediyor");
assert(countMatches(sparkline, /class="ae-sparkline__line"/g) === 2, "AeSparkline null aralığında iki SVG line segmenti üretiyor");
assert(countMatches(sparkline, /class="ae-sparkline__area"/g) === 2, "AeSparkline null aralığında iki area segmenti üretiyor");
assert(countMatches(sparkline, /class="ae-sparkline__dot"/g) === 3, "AeSparkline yalnızca geçerli noktaları çiziyor");
assert(countMatches(sparkline, /data-last="true"/g) === 1 && /aria-label="Ruh hali"/.test(sparkline), "AeSparkline son noktayı ve erişilebilir etiketi işaretliyor");
assert(!/NaN|undefined/.test(sparkline), "AeSparkline SVG çıktısında NaN/undefined yok");
const emptySparkline = AeonV2.AeSparkline([null, "", undefined], "unknown", 10, "Boş seri");
assert(/ae-sparkline--empty/.test(emptySparkline) && /veri yok/.test(emptySparkline), "AeSparkline boş veriyi güvenli placeholder olarak gösteriyor");
const cappedSparkline = AeonV2.AeSparkline(Array.from({ length: 40 }, function(_, index) { return index; }), "ok", 42);
assert(countMatches(cappedSparkline, /class="ae-sparkline__dot"/g) === 30, "AeSparkline seriyi 30 noktada sınırlandırıyor");

// AeProgressRing — percentage clamp, fallback color and accessible label.
const ringLow = AeonV2.AeProgressRing({ value: -25, color: "not-a-token", label: "Düşük" });
const ringHigh = AeonV2.AeProgressRing({ value: 125, color: "warn", label: "Tamamlandı" });
assert(/aria-label="Düşük: 0%"/.test(ringLow) && /ae-ring__value[^>]*>0%/.test(ringLow), "AeProgressRing alt sınırı 0%'a sıkıştırıyor");
assert(/stroke="var\(--ae-accent\)"/.test(ringLow), "AeProgressRing bilinmeyen rengi accent'e düşürüyor");
assert(/aria-label="Tamamlandı: 100%"/.test(ringHigh) && /stroke-dashoffset="0\.00"/.test(ringHigh), "AeProgressRing üst sınırı 100%'e sıkıştırıyor");
assert(/stroke="var\(--ae-warn\)"/.test(ringHigh), "AeProgressRing renk tokenını kullanıyor");

// AeDivider — gradient separator, label and inline element.
const divider = AeonV2.AeDivider({ label: "Ruh & beden" });
const inlineDivider = AeonV2.AeDivider({ inline: true });
assert(/class="ae-divider ae-divider--label"/.test(divider) && /role="separator"/.test(divider), "AeDivider etiketli gradient separator üretiyor");
assert(/aria-label="Ruh &amp; beden"/.test(divider) && /ae-divider__label/.test(divider), "AeDivider etiketi escape edip görünür kılıyor");
assert(/^<span class="ae-divider"/.test(inlineDivider) && !/ae-divider--label/.test(inlineDivider), "AeDivider inline ve etiketsiz varyantı destekliyor");

// AeSkeleton — all variants, shimmer class and hidden semantics.
["text", "card", "circle"].forEach(function(variant) {
  const skeleton = AeonV2.AeSkeleton({ variant: variant, className: "fixture-skeleton" });
  assert(new RegExp("ae-skeleton ae-skeleton--" + variant + " ae-shimmer").test(skeleton), "AeSkeleton " + variant + " varyantını ve shimmer'ı taşıyor");
  assert(/aria-hidden="true"/.test(skeleton) && /fixture-skeleton/.test(skeleton), "AeSkeleton " + variant + " erişilebilirlik ve ek sınıf taşıyor");
});
assert(/ae-skeleton--text/.test(AeonV2.AeSkeleton({ variant: "invalid" })), "AeSkeleton bilinmeyen varyantı text'e düşürüyor");

// AeToast — roles, dismissibility, escaping and automatic lifecycle.
const directErrorToast = AeonV2.AeToast({ id: "error fixture", type: "error", message: "<gizli>", dismissible: false });
assert(/role="alert"/.test(directErrorToast) && !/ae-toast__close/.test(directErrorToast), "AeToast hata rolü ve dismissible=false kontratını taşıyor");
assert(/&lt;gizli&gt;/.test(directErrorToast) && /id="ae-toast-error-fixture"/.test(directErrorToast), "AeToast mesajı ve id değerini güvenli escape ediyor");
const toastId = AeonV2.showToast("Kaydedildi", "success");
assert(toastId !== null && /ae-toast--success/.test(dom.html) && /Kaydedildi/.test(dom.html), "showToast success bildirimini render ediyor");
AeonV2.dismissToast(toastId + 1);
assert(/ae-toast--success/.test(dom.html), "AeToast yanlış id ile kapatılamıyor");
AeonV2.dismissToast(toastId);
assert(!/ae-toast--success/.test(dom.html), "dismissToast doğru id ile bildirimi kapatıyor");
AeonV2.showToast("Otomatik kapanır", "info");
assert(/ae-toast--info/.test(dom.html), "showToast info bildirimi render ediyor");
helper.runTimers();
assert(!/ae-toast--info/.test(dom.html), "AeToast süresi dolunca otomatik kapanıyor");

// Polling — lifecycle and p50/p95 telemetry contract.
AeonV2.init();
assert(AeonV2.getPollingState().intervalId === null, "Polling tokensız başlamıyor");
AeonV2.setPanelToken("prompt39-fixture-token");
assert(AeonV2.getPollingState().intervalId !== null, "Polling token ile başlıyor");
const pollingId = AeonV2.getPollingState().intervalId;
AeonV2.startPolling();
assert(AeonV2.getPollingState().intervalId === pollingId, "Polling tekrar başlatılınca interval çoğalmıyor");
AeonV2.syncStatus._latencyWindow = [];
[40, 120, 80, 200, 100, 60, 140, 90, 110, 180, 70, 130, 150, 50, 160, 100, 90, 80, 120, 200].forEach(function(ms) {
  AeonV2.updateLatencyTelemetry(ms);
});
assert(AeonV2.syncStatus.p50LatencyMs === 100, "Polling telemetry p50 değerini hesaplıyor");
assert(AeonV2.syncStatus.p95LatencyMs === 200, "Polling telemetry p95 değerini hesaplıyor");
AeonV2.stopPolling();
assert(AeonV2.getPollingState().intervalId === null, "Polling durdurulunca interval temizleniyor");

// Event log — normalized filtering, pagination and detail drawer.
const events = [
  event(1, "evt-mood", "mood", "update", "2026-08-11T10:00:00Z", "Ruh hali özeti"),
  event(2, "evt-sleep", "sleep", "record", "2026-08-10T09:00:00Z", "Uyku özeti"),
  event(3, "evt-settings", "settings", "update", "2026-08-09T08:00:00Z", "Ayar özeti")
];
for (let index = 4; index <= 21; index += 1) {
  events.push(event(index, "evt-many-" + index, index % 2 ? "mood" : "sleep", "record", "2026-08-08T08:00:00Z", "Güvenli olay özeti"));
}
AeonV2.setData({ days: {}, eventLog: { events: events } });
AeonV2.setTab("system");
AeonV2.setSystemSubTab("events");
let html = dom.html;
assert((html.match(/class="event-log-row(?:\s|")/g) || []).length === 20, "Event log ilk sayfada 20 kayıt gösteriyor");
assert(/event-filter-section/.test(html) && /event-filter-operation/.test(html), "Event log filtre kontrollerini gösteriyor");
AeonV2.setEventFilter("section", "mood");
html = dom.html;
assert((html.match(/class="event-log-row(?:\s|")/g) || []).length === 10, "Event log bölüm filtresini uyguluyor");
AeonV2.clearEventFilters();
AeonV2.setEventLimit(20);
AeonV2.setEventPage(2);
html = dom.html;
assert(/Sayfa 2 \/ 2/.test(html) && (html.match(/class="event-log-row(?:\s|")/g) || []).length === 1, "Event log sayfalama ikinci sayfayı gösteriyor");
AeonV2.selectEvent("evt-mood");
html = dom.html;
assert(/event-detail-drawer/.test(html) && /evt-mood/.test(html) && /Olay ID/.test(html), "Event log detay drawer'ı güvenli özeti açıyor");

console.log("\n🦩 Prompt 39 komponent/lifecycle contract fixture — TÜM TESTLER BAŞARILI");
