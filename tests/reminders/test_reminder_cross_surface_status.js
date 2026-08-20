"use strict";

// REM-68 — Cross-surface status ve failure semantics.
//
// App, sync receipt, projection ve observer paneli aynı olayın ayrı kanıt
// sahipleridir. Bu fixture yalnız sabit sentetik nesnelerle saf adapter'ları
// çalıştırır; browser, gerçek endpoint, token, localStorage, network ve
// yazma yoktur. Başarı kanıtı sayısı değil, layer code + owner + transition
// signature test edilir.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const APP_SOURCE = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const SYNC_SOURCE = fs.readFileSync(path.join(ROOT, "sync.js"), "utf8");
const PANEL_SOURCE = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");

function extractFunction(source, name) {
  const start = source.indexOf("function " + name + "(");
  if (start < 0) throw new Error(name + " bulunamadı");
  const end = source.indexOf("\nfunction ", start + 10);
  return source.slice(start, end < 0 ? source.length : end).trim();
}

function extractVar(source, name) {
  const start = source.indexOf("var " + name + "=");
  if (start < 0) throw new Error(name + " bulunamadı");
  let depth = 0;
  let quote = null;
  for (let i = start; i < source.length; i += 1) {
    const c = source[i];
    if (quote) {
      if (c === "\\") i += 1;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '"') quote = c;
    else if (c === "{") depth += 1;
    else if (c === "}" && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(name + " dengeli değil");
}

function appContext() {
  const names = [
    "reminderCrossSurfaceLayer",
    "reminderCrossSurfaceReceiptEvidence",
    "reminderCrossSurfaceCapability",
    "reminderCrossSurfaceRank",
    "reminderCrossSurfaceTransition",
    "reminderCrossSurfaceStatus"
  ];
  const context = { Object, Array, String, Number, Boolean, Math };
  vm.runInNewContext(names.map((name) => extractFunction(APP_SOURCE, name)).join("\n"), context, { filename: "app-rem68-status.js" });
  return context;
}

function syncContext() {
  const storage = new Map();
  const fetchCalls = [];
  const context = {
    console,
    Date,
    Math,
    JSON,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
    Promise,
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
      removeItem(key) { storage.delete(key); }
    },
    location: { protocol: "https:", hostname: "fixture.invalid", search: "" },
    fetch() { fetchCalls.push(true); throw new Error("REM-68 network disabled"); },
    setTimeout() { return 0; },
    clearTimeout() {},
    addEventListener() {},
    removeEventListener() {}
  };
  context.window = context;
  vm.runInNewContext(SYNC_SOURCE, context, { filename: "sync-rem68-status.js" });
  return { context, fetchCalls };
}

function panelContext() {
  const names = [
    "normalizeSyncReceiptP",
    "syncReceiptEvidenceP",
    "syncStatusP",
    "reminderStatusToneMapP",
    "reminderSystemStatusP",
    "reminderReceiptStatusP",
    "reminderCapabilityStatusP",
    "reminderSourceStatusP",
    "reminderPrivacyStatusP",
    "reminderDeviceAcceptanceStatusP",
    "reminderWorkingClaimP",
    "panelStatusBadgeHTMLP",
    "panelLegacyBadgeHTMLP",
    "reminderStatusCardHTMLP"
  ];
  const context = {
    Date, Math, String, Number, Boolean, Object, Array, JSON, isNaN, isFinite, RegExp,
    esc(value) { return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); },
    p3TimeP(value) { return value ? String(value) : "—"; },
    tsShort(value) { return value ? String(value) : "—"; }
  };
  vm.runInNewContext(
    extractVar(PANEL_SOURCE, "SYNC_STATUS_P") + "\n" + names.map((name) => extractFunction(PANEL_SOURCE, name)).join("\n"),
    context,
    { filename: "panel-rem68-status.js" }
  );
  return context;
}

const COMPLETE_RECEIPT = Object.freeze({
  status: "accepted",
  snapshotRevision: "a".repeat(40),
  sourceLatestSha: "b".repeat(40),
  sourceUpdatedAt: "2026-08-20T09:00:00.000Z",
  submittedAt: "2026-08-20T09:00:01.000Z",
  acceptedAt: "2026-08-20T09:00:02.000Z"
});

function completeInput(overrides = {}) {
  return Object.assign({
    capability: { inApp: "available", permissionState: "granted", prayerState: "fresh" },
    local: { scheduled: true },
    delivery: { status: "shown", delivered: true, channel: "in_app" },
    sync: { configured: true, receipt: COMPLETE_RECEIPT },
    projection: { source: "projection", reason: "ready", built: true },
    panel: { visible: true, pollStatus: "updated" },
    device: { accepted: true }
  }, overrides);
}

function layerCodes(status) {
  return Object.fromEntries(Object.entries(status.layers).map(([key, value]) => [key, value.code]));
}

const APP = appContext();
const SYNC = syncContext();
const PANEL = panelContext();

runTests([
  ["all seven layers are independent and a complete synthetic chain is the only full claim", () => {
    const result = APP.reminderCrossSurfaceStatus(completeInput());
    assertEqual(result.overall.code, "accepted");
    assertEqual(result.overall.claim, true);
    assertEqual(result.overall.green, true);
    Object.entries(result.layers).forEach(([name, layer]) => {
      assertEqual(layer.name, name);
      assert(typeof layer.owner === "string" && layer.owner.length > 0);
      assert(layer.evidence !== undefined);
    });
    assertEqual(SYNC.context.window.SeySync.reminderReceiptEvidence(COMPLETE_RECEIPT).code, "accepted");
    assertEqual(PANEL.syncReceiptEvidenceP(COMPLETE_RECEIPT).code, "accepted");
    assertEqual(PANEL.syncStatusP(COMPLETE_RECEIPT).code, "accepted");
  }],
  ["one layer PASS never propagates to projection, panel or device acceptance", () => {
    const receiptOnly = APP.reminderCrossSurfaceStatus({ sync: { configured: true, receipt: COMPLETE_RECEIPT } });
    assertEqual(receiptOnly.layers.syncAccepted.code, "accepted");
    assertEqual(receiptOnly.layers.projectionBuilt.code, "missing");
    assertEqual(receiptOnly.layers.panelVisible.code, "not_visible");
    assertEqual(receiptOnly.layers.deviceAccepted.code, "unverified");
    assertEqual(receiptOnly.overall.code, "unverified");
    assertEqual(receiptOnly.overall.green, false);

    const projectionOnly = APP.reminderCrossSurfaceStatus({ projection: { source: "projection", reason: "ready", built: true } });
    assertEqual(projectionOnly.layers.projectionBuilt.code, "built");
    assertEqual(projectionOnly.layers.syncAccepted.code, "missing");
    assertEqual(projectionOnly.overall.claim, false);
  }],
  ["accepted without proof is unverified in sync and panel, never green", () => {
    const malformed = Object.assign({}, COMPLETE_RECEIPT, { snapshotRevision: undefined });
    const syncEvidence = SYNC.context.window.SeySync.reminderReceiptEvidence(malformed);
    const panelEvidence = PANEL.syncReceiptEvidenceP(malformed);
    assertEqual(syncEvidence.code, "receipt_missing");
    assertEqual(panelEvidence.code, "receipt_missing");
    assertEqual(PANEL.syncStatusP(malformed).code, "receipt_missing");
    assertEqual(PANEL.reminderReceiptStatusP(malformed).tone, "pending");
    const result = APP.reminderCrossSurfaceStatus(completeInput({ sync: { configured: true, receipt: malformed } }));
    assertEqual(result.layers.syncAccepted.code, "unverified");
    assertEqual(result.overall.green, false);
    assert(!JSON.stringify(result).includes("PRIVATE"));
  }],
  ["offline, permission denied, stale prayer, conflict, projection missing and device unverified remain distinct", () => {
    const offline = APP.reminderCrossSurfaceStatus(completeInput({ offline: true }));
    assertEqual(offline.layers.syncAccepted.code, "offline");
    assertEqual(offline.layers.syncAccepted.reason, "sync-offline");

    const permission = APP.reminderCrossSurfaceStatus(completeInput({ capability: { inApp: "available", permissionState: "denied", prayerState: "fresh" } }));
    assertEqual(permission.layers.capability.code, "available");
    assertEqual(permission.layers.capability.evidence.native, "blocked");
    assertEqual(permission.layers.capability.reason, "native-permission-denied");

    const stalePrayer = APP.reminderCrossSurfaceStatus(completeInput({ capability: { inApp: "available", permissionState: "granted", prayerState: "stale" } }));
    assertEqual(stalePrayer.layers.capability.code, "blocked");
    assertEqual(stalePrayer.layers.capability.reason, "prayer-stale");

    const conflict = APP.reminderCrossSurfaceStatus(completeInput({ sync: { configured: true, receipt: { status: "conflict", lastErrorCode: "conflict" } } }));
    assertEqual(conflict.layers.syncAccepted.code, "conflict");
    assertEqual(conflict.layers.syncAccepted.reason, "sync-conflict");

    const projectionMissing = APP.reminderCrossSurfaceStatus(completeInput({ projection: { source: "legacy_fallback", reason: "projection_missing" } }));
    assertEqual(projectionMissing.layers.projectionBuilt.code, "missing");
    assertEqual(projectionMissing.layers.projectionBuilt.reason, "projection-missing");

    const device = APP.reminderCrossSurfaceStatus(completeInput({ device: { accepted: false } }));
    assertEqual(device.layers.deviceAccepted.code, "unverified");
    assertEqual(device.overall.code, "unverified");
  }],
  ["panel 304 preserves an existing visible revision but cannot create visibility", () => {
    const preserved = APP.reminderCrossSurfaceStatus(completeInput({ panel: { visible: true, pollStatus: "304" } }));
    assertEqual(preserved.layers.panelVisible.code, "not_modified");
    assertEqual(preserved.layers.panelVisible.reason, "panel-304-preserved");
    const empty304 = APP.reminderCrossSurfaceStatus(completeInput({ panel: { visible: false, pollStatus: "304" } }));
    assertEqual(empty304.layers.panelVisible.code, "not_visible");
    assertEqual(empty304.overall.claim, false);
  }],
  ["regressions are explicit, layer-scoped and explainable", () => {
    const before = APP.reminderCrossSurfaceStatus(completeInput());
    const after = APP.reminderCrossSurfaceStatus(Object.assign(completeInput({
      offline: true,
      capability: { inApp: "available", permissionState: "granted", prayerState: "stale" },
      projection: { source: "legacy_fallback", reason: "projection_stale" },
      panel: { visible: false, pollStatus: "304" },
      device: { accepted: false }
    }), { previousStatus: before }));
    assertEqual(after.transition.nonMonotonic, true);
    assertEqual(after.transition.direction, "regression");
    ["capability", "syncAccepted", "projectionBuilt", "panelVisible", "deviceAccepted"].forEach((name) => {
      const change = after.transition.changes.find((item) => item.layer === name);
      assert(change && change.direction === "regression");
      assert(typeof change.reason === "string" && change.reason.length > 0);
    });
    const same = APP.reminderCrossSurfaceStatus(Object.assign(completeInput(), { previousStatus: before }));
    assertEqual(same.transition.direction, "unchanged");
    assertEqual(same.transition.nonMonotonic, false);
  }],
  ["user and operator copy stay fixed, generic and free of private detail", () => {
    const copyStart = APP_SOURCE.indexOf("function reminderSystemStatusCopy(");
    assert(copyStart >= 0);
    assert(APP_SOURCE.includes("App.reminderCrossSurfaceStatus=reminderCrossSurfaceStatus"));
    assert(APP_SOURCE.includes("function reminderSystemStatusCopy("));
    const card = PANEL.reminderStatusCardHTMLP(
      Object.assign({}, COMPLETE_RECEIPT, { lastErrorDetail: "http_500" }),
      "2026-08-20T09:05:00.000Z",
      { source: "projection", reason: "ready", snapshot: { reminderCoverageVersion: "panel-reminder-coverage-v1", projectionBuiltAt: "2026-08-20T09:04:00.000Z" } },
      { ok: true }
    );
    assert(!card.includes("http_500"));
    assert(!card.includes("PRIVATE"));
    assert(card.includes("data-reminder-dim=\"source\""));
    assert(card.includes("data-reminder-dim=\"device\""));
  }],
  ["the fixture stays deterministic and network-free", () => {
    assertEqual(SYNC.fetchCalls.length, 0);
    assertEqual(JSON.stringify(layerCodes(APP.reminderCrossSurfaceStatus(completeInput()))), JSON.stringify({
      capability: "available", localScheduled: "scheduled", delivered: "delivered", syncAccepted: "accepted",
      projectionBuilt: "built", panelVisible: "visible", deviceAccepted: "accepted"
    }));
    assert(!APP_SOURCE.includes("App.reminderCrossSurfaceStatus=reminderCrossSurfaceStatus\nApp.reminderCrossSurfaceStatus=reminderCrossSurfaceStatus"));
  }]
]);
