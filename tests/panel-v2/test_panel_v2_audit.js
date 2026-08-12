// PROMPT-32 — Panel-v2 sequence audit + snapshot revision history fixture.
// Tamamen sentetik event metadata; gerçek ağ, browser, token veya kullanıcı verisi yok.
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

const { dom, AeonV2 } = boot();
const REV_A = "a".repeat(40);
const REV_B = "b".repeat(40);
const REV_C = "c".repeat(40);

function event(sequence, id, occurredAt, revision, summary) {
  return {
    eventId: id,
    correlationId: id,
    sequence: sequence,
    occurredAt: occurredAt,
    persistedAt: occurredAt,
    acceptedAt: "2026-08-11T12:10:00.000Z",
    section: "therapy",
    path: "data.days.*.reflection",
    operation: "record",
    summary: summary || "Yansıtma/pratik kaydı güncellendi",
    source: "app",
    sourceDeviceId: "dev_a",
    privacyClass: "summary",
    snapshotRevision: revision
  };
}

const data = {
  lastOpenedDate: "2026-08-11",
  days: {},
  eventLog: {
    date: "2026-08-11",
    events: [
      event(1, "evt-1", "2026-08-11T12:00:00.000Z", REV_A),
      event(3, "evt-3", "2026-08-11T12:01:00.000Z", REV_A),
      event(2, "evt-2", "2026-08-11T12:02:00.000Z", REV_B),
      event(2, "evt-2-duplicate-seq", "2026-08-11T12:03:00.000Z", REV_B),
      event(5, "evt-5", "2026-08-11T12:04:00.000Z", REV_C, "ghp_SECRET lat:41.0 lon:29.0")
    ]
  }
};

AeonV2.init();
AeonV2.setData(data);
AeonV2.updateStatus({
  status: "accepted",
  snapshotRevision: REV_C,
  lastSyncedAt: "2026-08-11T12:10:00.000Z"
});
AeonV2.setTab("system");
AeonV2.setSystemSubTab("audit");

const report = AeonV2.auditSequenceReport();
assert(report.source === "PanelCoverageV1 eventSequenceAudit", "Canonical eventSequenceAudit kaynağı kullanılıyor");
assert(report.counts.outOfOrder === 1, "Sıra dışı olay sayısı doğru hesaplanıyor");
assert(report.counts.missing === 1, "Sequence gap gerçek eksik olay sayısına çevriliyor");
assert(report.counts.duplicate === 1, "Çift sequence sayısı doğru hesaplanıyor");
assert(report.issues.length === 3, "Detay raporu üç canonical issue taşıyor");
assert(report.revisions.length === 3, "Snapshot revision'lar tekilleştiriliyor");
assert(report.revisions[0].revision === REV_C && report.revisions[0].current === true, "Güncel snapshot revision öne alınıyor");

const html = dom.html;
assert(/Sıra Denetimi/.test(html), "Sıra denetimi kartı render ediliyor");
assert(/Sıra dışı olay/.test(html) && /Eksik olay/.test(html) && /Çift kayıt/.test(html), "Üç sıra metriği görünür");
assert((html.match(/audit-sequence-metric__value/g) || []).length === 3, "Üç sıra metriği değeri render ediliyor");
assert(/Sıra dışı · dev_a · seq 2/.test(html), "Out-of-order sequence detayda görünür");
assert(/Eksik · dev_a · seq 3 → 5/.test(html), "Eksik sequence aralığı detayda görünür");
assert(/Çift kayıt · dev_a · seq 2/.test(html), "Duplicate sequence detayda görünür");
assert(/Revizyon Geçmişi/.test(html), "Revizyon geçmişi kartı render ediliyor");
assert((html.match(/class="audit-revision-row(?: |")/g) || []).length === 3, "Son snapshot revision listesi render ediliyor");
assert(/rev-cccccccc/.test(html) && /Güncel/.test(html), "Güncel revision etiketi görünür");
assert(!html.includes("ghp_SECRET") && !html.includes("lat:41.0"), "Ham event özeti DOM'a sızmıyor");

console.log("\n✅ Prompt 32 sequence audit fixture — TÜM TESTLER BAŞARILI");
