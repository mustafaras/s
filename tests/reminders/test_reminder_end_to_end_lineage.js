"use strict";

// REM-67 / G14-A — app action -> local state -> safe event -> sanitize ->
// receipt -> projection -> current panel status/timeline lineage.
// Gerçek browser, endpoint, token, localStorage veya sync/data repo yoktur.
// Her aşama in-memory VM ve sabit saat ile yeniden üretilebilir.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {
  assert,
  assertEqual,
  createMemoryLocalStorage,
  deepClone,
  deepEqual,
  runTests
} = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const NOW = "2026-08-20T10:30:00.000Z";
const LOCAL_DATE = "2026-08-20";
const SOURCE_UPDATED_AT = "2026-08-20T10:29:00.000Z";
const SUBMITTED_AT = "2026-08-20T10:30:05.000Z";
const ACCEPTED_AT = "2026-08-20T10:30:07.000Z";
const BUILT_AT = "2026-08-20T10:30:08.000Z";
const SOURCE_SHA = "a".repeat(40);
const SNAPSHOT_REVISION = "b".repeat(40);
const DEVICE = "dev_rem67fixture";
const SAFE_SUMMARY = "Bildirim yaşam döngüsü güncellendi";
const PRIVATE = [
  "REM67_THERAPY_PRIVATE_DETAIL",
  "REM67_MEDICATION_NAME",
  "REM67_RAW_REMINDER_BODY",
  "REM67_USER_NOTE",
  "REM67_OCCURRENCE_SECRET",
  "REM67_SYNC_TOKEN"
];

const OWNERS = Object.freeze({
  action: "app",
  localState: "app",
  safeEvent: "app.eventLog",
  sanitize: "sync.sanitize",
  receipt: "sync.receipt",
  projection: "panelCoverageManifest.buildObserverSnapshot",
  sourceSelection: "panelCoverageManifest.chooseProjection",
  timeline: "panel.js.eventLogCardHTMLP"
});

function source(name) {
  return fs.readFileSync(path.join(ROOT, name), "utf8");
}

function makeFixedDate() {
  const RealDate = Date;
  function FixedDate(...args) {
    return args.length ? new RealDate(...args) : new RealDate(NOW);
  }
  FixedDate.prototype = RealDate.prototype;
  FixedDate.parse = RealDate.parse;
  FixedDate.UTC = RealDate.UTC;
  FixedDate.now = () => Date.parse(NOW);
  return FixedDate;
}

function loadAppEventAdapter() {
  const app = source("app.js");
  const start = app.indexOf("var SYNC_RECEIPT_STATUSES=");
  const end = app.indexOf("var REMINDER_PREFERENCE_SCHEMA_VERSION=");
  if (start < 0 || end < 0) throw new Error("REM-67 app event adapter boundary missing");
  const storage = createMemoryLocalStorage({ "seyma-event-device-v1": DEVICE });
  const fixedMath = Object.create(Math);
  fixedMath.random = () => 0.25;
  const context = {
    localStorage: storage,
    Date: makeFixedDate(),
    Math: fixedMath,
    JSON, Object, Array, String, Number, Boolean, RegExp, Error,
    isNaN, isFinite, parseInt, parseFloat
  };
  vm.runInNewContext(app.slice(start, end), context, { filename: "app-rem67-event-adapter.js" });
  return context;
}

function loadSyncAdapter() {
  const sync = source("sync.js");
  const hook = "window.__REM67_EVENT_LOG_FOR_PUSH__ = eventLogForPush;";
  const marker = sync.lastIndexOf("})();");
  if (marker < 0) throw new Error("REM-67 sync hook boundary missing");
  let networkCalls = 0;
  const storage = createMemoryLocalStorage();
  const context = {
    console,
    localStorage: storage,
    location: { protocol: "https:", hostname: "synthetic.example", search: "" },
    fetch() {
      networkCalls += 1;
      throw new Error("REM67_NETWORK_MUST_NOT_RUN");
    },
    setTimeout() { return 0; }, clearTimeout() {},
    addEventListener() {}, removeEventListener() {},
    TextEncoder, TextDecoder, Date, Math, JSON, Object, Array, String, Number,
    Boolean, RegExp, Error, Promise, Set, Map, Symbol, Intl, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, atob, btoa
  };
  context.window = context;
  context.self = context;
  context.globalThis = context;
  vm.runInNewContext(sync.slice(0, marker) + hook + sync.slice(marker), context, { filename: "sync-rem67.js" });
  return { sync: context.SeySync, eventLogForPush: context.__REM67_EVENT_LOG_FOR_PUSH__, storage, get networkCalls() { return networkCalls; } };
}

function loadCoverage() {
  const context = { window: {}, Date, JSON, Array, Object, String, Number, Boolean, Math, isNaN, isFinite };
  vm.runInNewContext(source("panelCoverageManifest.js"), context, { filename: "panelCoverageManifest.js" });
  if (!context.window.PanelCoverageV1) throw new Error("PanelCoverageV1 yüklenemedi");
  return context.window.PanelCoverageV1;
}

function extractPanelFunction(panelSource, name) {
  const start = panelSource.indexOf("function " + name + "(");
  if (start < 0) throw new Error(name + " panel.js içinde bulunamadı");
  const end = panelSource.indexOf("\nfunction ", start + 10);
  return panelSource.slice(start, end < 0 ? panelSource.length : end);
}

function loadPanelTimeline(events, projection) {
  const panelSource = source("panel.js");
  const names = [
    "projectionStatusP",
    "applySectionFailureP",
    "reminderSystemStatusP",
    "eventLogSourceP", "eventStatusP", "eventTimeP", "safeEventSummaryP",
    "eventSourceKindForP", "eventCategoryDefsP", "eventClassificationP",
    "eventPathLabelP", "eventOperationLabelP", "eventChangeDescriptorP",
    "eventMatchesFilterP", "eventFeatureForP", "isReminderEventP",
    "reminderEventActionP", "reminderEventLabelP", "eventDateStateP",
    "eventJsArgP", "setEventLimitP", "statusToneP", "panelStatusBadgeHTMLP",
    "panelLegacyBadgeHTMLP", "eventLogCardInnerHTMLP", "eventLogCardHTMLP"
  ];
  const escapeHtml = (value) => String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const context = {
    window: {},
    PROJECTION: projection,
    EVENT_LOG_STATE: { source: "event_files", events, audit: { ok: true, issueCount: 0, issues: [] }, loadedAt: ACCEPTED_AT },
    UI: { eventLimit: 20, eventFilter: "all", d4SelectedModule: null },
    Date, JSON, Array, Object, String, Number, Boolean, Math, RegExp, isFinite,
    STALE_DANGER_DAYS: 7,
    today: () => LOCAL_DATE,
    icon: () => "",
    esc: escapeHtml,
    tsShort: (value) => String(value),
    p3TimeP: (value) => value ? String(value) : "—",
    render() {}
  };
  vm.runInNewContext(names.map((name) => extractPanelFunction(panelSource, name)).join("\n"), context, { filename: "panel-rem67-timeline.js" });
  return context;
}

function makeLocalState(appAdapter) {
  return {
    savedAt: NOW,
    settings: {
      ghRepo: "synthetic-owner/synthetic-data",
      ghBranch: "main",
      ghToken: PRIVATE[5]
    },
    reminders: {
      preferences: {
        "reminder.catalog.v1.synthetic": {
          reminderId: "reminder.catalog.v1.synthetic",
          enabled: true,
          privateDetail: PRIVATE[0],
          medicationName: PRIVATE[1],
          body: PRIVATE[2],
          userNote: PRIVATE[3]
        }
      }
    },
    deliveryLog: [{ occurrenceId: PRIVATE[4], body: PRIVATE[2] }],
    syncReceipt: {
      status: "accepted",
      snapshotRevision: SNAPSHOT_REVISION,
      sourceLatestSha: SOURCE_SHA,
      sourceUpdatedAt: SOURCE_UPDATED_AT,
      submittedAt: SUBMITTED_AT,
      acceptedAt: ACCEPTED_AT
    },
    eventLog: { schemaVersion: 1, sourceDeviceId: DEVICE, nextSequence: 1, events: [], days: {} },
    remindersEvidenceOwner: OWNERS.localState,
    _fixtureClock: appAdapter ? NOW : null
  };
}

function appendSyntheticAction() {
  const app = loadAppEventAdapter();
  const state = makeLocalState(app);
  const reminderKey = `${PRIVATE[4]}|${LOCAL_DATE}|10:30`;
  const event = app.appendReminderEvent(state, "delivered", reminderKey);
  assert(event && event.summary === SAFE_SUMMARY);
  assertEqual(event.section, "wellness");
  assertEqual(event.source, "app");
  assertEqual(event.privacyClass, "summary");
  assert(event.correlationId.startsWith("reminder-v1:delivered:"));
  return { app, state, event, reminderKey };
}

function makeReceipt() {
  return {
    status: "accepted",
    snapshotRevision: SNAPSHOT_REVISION,
    sourceLatestSha: SOURCE_SHA,
    sourceUpdatedAt: SOURCE_UPDATED_AT,
    submittedAt: SUBMITTED_AT,
    acceptedAt: ACCEPTED_AT,
    lastErrorCode: null
  };
}

function runLineage() {
  const action = appendSyntheticAction();
  const syncHarness = loadSyncAdapter();
  const sanitized = syncHarness.sync.sanitize(action.state);
  const receipt = syncHarness.sync.normalizeSyncReceipt(makeReceipt());
  const eventGroups = syncHarness.eventLogForPush(sanitized, receipt);
  const acceptedData = deepClone(sanitized);
  acceptedData.eventLog.events = eventGroups[LOCAL_DATE] || [];
  const coverage = loadCoverage();
  const snapshot = coverage.buildObserverSnapshot(acceptedData, receipt, BUILT_AT);
  const chosen = coverage.chooseProjection(JSON.stringify(snapshot), sanitized, receipt);
  const timeline = loadPanelTimeline(eventGroups[LOCAL_DATE], chosen);
  const card = timeline.eventLogCardHTMLP();
  return { action, syncHarness, sanitized, receipt, eventGroups, acceptedData, snapshot, chosen, timeline, card };
}

function publicLineage(result) {
  return {
    event: result.eventGroups[LOCAL_DATE],
    receipt: result.receipt,
    projection: result.chosen,
    card: result.card
  };
}

function assertNoPrivate(value) {
  const text = JSON.stringify(value);
  PRIVATE.forEach((needle) => assert(!text.includes(needle), `private sentinel leaked: ${needle}`));
}

function assertOwners(result) {
  assertEqual(result.action.state.remindersEvidenceOwner, OWNERS.localState);
  assertEqual(result.action.event.source, OWNERS.action);
  assertEqual(result.sanitized.eventLog.events[0].source, "app");
  assertEqual(OWNERS.safeEvent, "app.eventLog");
  assertEqual(OWNERS.sanitize, "sync.sanitize");
  assertEqual(OWNERS.receipt, "sync.receipt");
  assertEqual(OWNERS.projection, "panelCoverageManifest.buildObserverSnapshot");
  assertEqual(OWNERS.sourceSelection, "panelCoverageManifest.chooseProjection");
  assertEqual(OWNERS.timeline, "panel.js.eventLogCardHTMLP");
}

const cases = [
  ["synthetic user action reaches current panel timeline through every safe boundary", () => {
    const result = runLineage();
    assertOwners(result);
    assert(result.action.state.reminders.preferences["reminder.catalog.v1.synthetic"].privateDetail === PRIVATE[0]);
    assert(!Object.prototype.hasOwnProperty.call(result.sanitized, "reminders"));
    assert(!Object.prototype.hasOwnProperty.call(result.sanitized, "deliveryLog"));
    assertEqual(result.eventGroups[LOCAL_DATE].length, 1);
    assertEqual(result.eventGroups[LOCAL_DATE][0].summary, SAFE_SUMMARY);
    assertEqual(result.eventGroups[LOCAL_DATE][0].snapshotRevision, SNAPSHOT_REVISION);
    assertEqual(result.eventGroups[LOCAL_DATE][0].submittedAt, SUBMITTED_AT);
    assertEqual(result.eventGroups[LOCAL_DATE][0].acceptedAt, ACCEPTED_AT);
    assertEqual(result.chosen.source, "projection");
    assertEqual(result.chosen.reason, "ready");
    assertEqual(result.chosen.snapshot.sourceLatestSha, SOURCE_SHA);
    assertEqual(result.chosen.snapshot.snapshotRevision, SNAPSHOT_REVISION);
    assertEqual(result.chosen.snapshot.projectionBuiltAt, BUILT_AT);
    assert(result.card.includes("Reminder Gösterildi"));
    assert(result.card.includes(SAFE_SUMMARY));
    assert(result.card.includes("Uzak kabul"));
    assert(result.card.includes(SNAPSHOT_REVISION.slice(0, 12)));
    assert(!result.card.includes("onclick=\"App."));
    assertNoPrivate(result.sanitized);
    assertNoPrivate(result.snapshot);
    assertNoPrivate(result.chosen);
    assertNoPrivate(result.card);
  }],
  ["the same fixed clock and synthetic action produce byte-stable public lineage", () => {
    const first = runLineage();
    const second = runLineage();
    assert(deepEqual(publicLineage(first), publicLineage(second)));
    assertEqual(first.syncHarness.networkCalls, 0);
    assertEqual(second.syncHarness.networkCalls, 0);
  }],
  ["missing receipt and stale projection never become a panel success claim", () => {
    const result = runLineage();
    const missing = result.chosen && loadCoverage().chooseProjection(result.snapshot, result.sanitized, null);
    assertEqual(missing.source, "legacy_fallback");
    assertEqual(missing.reason, "receipt_missing");
    const stale = loadCoverage().chooseProjection(result.snapshot, result.sanitized, Object.assign({}, result.receipt, { snapshotRevision: "c".repeat(40) }));
    assertEqual(stale.source, "legacy_fallback");
    assertEqual(stale.reason, "projection_stale");
    const panel = loadPanelTimeline(result.eventGroups[LOCAL_DATE], missing);
    assert(panel.projectionStatusP(missing).label === "Receipt bekleniyor" || panel.projectionStatusP(missing).label === "Projection yok");
  }],
  ["malformed event, partial fetch and legacy fallback fail closed without deleting healthy safe data", () => {
    const result = runLineage();
    const malformed = result.syncHarness.sync.normalizeEvent({ eventId: "bad", sequence: 0, occurredAt: "bad" }, DEVICE);
    assertEqual(malformed, null);
    const coverage = loadCoverage();
    const legacy = coverage.chooseProjection(null, result.sanitized, result.receipt);
    assertEqual(legacy.source, "legacy_fallback");
    assertEqual(legacy.reason, "projection_missing");
    assert(!Object.prototype.hasOwnProperty.call(legacy.data, "reminders"));
    const panel = loadPanelTimeline(result.eventGroups[LOCAL_DATE], result.chosen);
    const failed = panel.applySectionFailureP(result.chosen.sections, new Error("network down with private detail"));
    assertEqual(failed.sectionFetchState.ok, false);
    assertEqual(failed.sectionFetchState.lastError, "network");
    assert(deepEqual(failed.sections, result.chosen.sections));
    assertEqual(panel.reminderSystemStatusP(result.chosen, failed.sectionFetchState).code, "unavailable");
    assert(!JSON.stringify(failed).includes("network down with private detail"));
  }],
  ["lineage source, revision, timestamps, privacy mode and evidence owners remain explicit", () => {
    const result = runLineage();
    assertOwners(result);
    const event = result.eventGroups[LOCAL_DATE][0];
    assertEqual(event.source, "app");
    assertEqual(event.privacyClass, "summary");
    assertEqual(event.snapshotRevision, SNAPSHOT_REVISION);
    assertEqual(event.occurredAt, NOW);
    assertEqual(result.receipt.status, "accepted");
    assertEqual(result.receipt.sourceLatestSha, SOURCE_SHA);
    assertEqual(result.chosen.snapshot.serverAcceptedAt, ACCEPTED_AT);
    assertEqual(result.chosen.snapshot.projectionBuiltAt, BUILT_AT);
    assert(result.timeline.eventLogSourceP().label === "Günlük event dosyaları");
    assertEqual(result.timeline.eventClassificationP(event).key, "reminder");
    assertEqual(result.timeline.reminderEventActionP(event), "delivered");
  }]
];

runTests(cases).catch((error) => { console.error(error && error.stack || error); process.exitCode = 1; });
