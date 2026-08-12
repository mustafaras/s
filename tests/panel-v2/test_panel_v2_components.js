// ÆON Panel v2 — Prompt 11 komponent kontrat fixture
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

const { AeonV2 } = boot();

["AeCard", "AeButton", "AeEmpty", "AeStatusBadge", "AeMetric", "SummaryCard", "AnomalyCard", "DetailSection", "DetailBlock"].forEach(function(name) {
  assert(typeof AeonV2[name] === "function", name + " export ediliyor");
});

["glass", "solid", "gradient", "outline"].forEach(function(variant) {
  const card = AeonV2.AeCard({ variant: variant, children: "İçerik" });
  assert(new RegExp("ae-card--" + variant).test(card), "AeCard " + variant + " varyantını render ediyor");
});

const primaryButton = AeonV2.AeButton({ label: "Kaydet", variant: "primary" });
assert(/ae-btn--primary/.test(primaryButton) && /ae-btn--glow/.test(primaryButton), "AeButton gradient/glow varyantlarını taşıyor");
const statusBadge = AeonV2.AeStatusBadge({ status: "accepted", label: "Senkronize" });
assert(/role="status"/.test(statusBadge) && /ae-status--ok/.test(statusBadge), "AeStatusBadge erişilebilir status markup üretiyor");

const empty = AeonV2.AeEmpty({ icon: "◎", title: "Boş", message: "Henüz kayıt yok." });
assert(/class="ae-empty ae-scale-in"/.test(empty), "AeEmpty premium temel sınıfları taşıyor");
assert(/role="status"/.test(empty) && /aria-live="polite"/.test(empty), "AeEmpty boş durum duyurusunu erişilebilir kılıyor");

const summary = AeonV2.SummaryCard({ title: "Uyku ort.", value: "7.2", unit: "sa", windowDays: 7, status: "normal", trend: "↑" });
assert(/ae-metric/.test(summary) && /summary-card/.test(summary), "SummaryCard AeMetric üzerinden render ediliyor");
assert(/ae-card--solid/.test(summary) && /summary-card--normal/.test(summary), "SummaryCard solid/status varyantını taşıyor");
assert(!/summary-card__value/.test(summary), "SummaryCard legacy value markup üretmiyor");

const anomaly = AeonV2.AnomalyCard({ severity: "risk", kind: "sleep", message: "Uyku düşüşü", linkDate: "2026-08-04" });
assert(/ae-card--gradient/.test(anomaly) && /anomaly-card--risk/.test(anomaly), "AnomalyCard gradient/risk varyantını taşıyor");
assert(/anomaly-card__severity--risk/.test(anomaly), "AnomalyCard severity badge render ediyor");

const detailSection = AeonV2.DetailSection({ title: "Ruh Hali", emptyText: "Kayıt yok." });
assert(/detail-section/.test(detailSection) && /ae-card--glass/.test(detailSection), "DetailSection glass kart sistemini kullanıyor");
assert(/detail-section__empty/.test(detailSection), "DetailSection boş durumu render ediyor");

const detailBlock = AeonV2.DetailBlock({ icon: "◎", title: "Gizli", body: "redacted", redacted: true });
assert(/detail-block ae-scale-in detail-block--redacted/.test(detailBlock), "DetailBlock premium giriş ve redacted sınıflarını taşıyor");

console.log("\n🦩 Prompt 11 komponent kontrat fixture — TÜM TESTLER BAŞARILI");
