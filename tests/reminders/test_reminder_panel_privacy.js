"use strict";

// REM-64 — G13-J panel privacy, redaction ve secret scanner.
//
// Bu fixture aynı sentetik private corpus'u projection, legacy/stale/error
// dalları, coverage, timeline ve DOM sınırlarında arar. Gerçek kullanıcı
// verisi, browser, localStorage, fetch ve GitHub yoktur. Panel-v2 ayrı bir
// regression yüzeyidir.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepClone, deepEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const COVERAGE_SOURCE = fs.readFileSync(path.join(ROOT, "panel/panelCoverageManifest.js"), "utf8");
const PANEL_SOURCE = fs.readFileSync(path.join(ROOT, "panel/panel.js"), "utf8");
const PANEL_HTML = fs.readFileSync(path.join(ROOT, "panel.html"), "utf8");

const SHA_LATEST = "a".repeat(40);
const SHA_OTHER = "f".repeat(40);
const REVISION = "b".repeat(40);
const SOURCE_UPDATED_AT = "2026-08-20T08:00:00.000Z";
const ACCEPTED_AT = "2026-08-20T08:01:00.000Z";
const BUILT_AT = "2026-08-20T08:01:05.000Z";

const SENTINELS = {
  therapy: "REM64_THERAPY_<script>alert('therapy')</script>",
  medication: "REM64_MEDICATION_NAME_42",
  mood: "REM64_MOOD_PRIVATE",
  prayerCompletion: "REM64_PRAYER_COMPLETION_PRIVATE",
  journal: "REM64_JOURNAL_PRIVATE",
  note: "REM64_NOTE_PRIVATE",
  privateTitle: "REM64_PRIVATE_TITLE_19:30",
  schedule: "REM64_SCHEDULE_PRIVATE",
  token: "Bearer github_pat_REM64_SECRET",
  gps: "41.012345",
  rawProfile: "REM64_RAW_PROFILE_RESPONSE",
  media: "REM64_BASE64_MEDIA_PRIVATE",
  filename: "REM64_FILE\"><img src=x onerror=alert('filename')>"
};
const SENTINEL_VALUES = Object.keys(SENTINELS).map((key) => SENTINELS[key]);

function loadCoverage() {
  const context = { window: {}, Date, JSON, Array, Object, String, Number, Boolean, Math, isNaN, isFinite };
  vm.runInNewContext(COVERAGE_SOURCE, context, { filename: "panel/panelCoverageManifest.js" });
  return context.window.PanelCoverageV1;
}

function receipt(overrides) {
  return Object.assign({
    status: "accepted",
    snapshotRevision: REVISION,
    sourceUpdatedAt: SOURCE_UPDATED_AT,
    submittedAt: "2026-08-20T08:00:30.000Z",
    acceptedAt: ACCEPTED_AT,
    sourceLatestSha: SHA_LATEST
  }, overrides || {});
}

function latestFixture() {
  return {
    version: 2,
    startDate: "2026-08-01",
    lastOpenedDate: "2026-08-20",
    savedAt: SOURCE_UPDATED_AT,
    settings: {
      ghToken: SENTINELS.token,
      openaiKey: "REM64_OPENAI_SECRET",
      syncUrl: "https://private.invalid/REM64_SYNC_SECRET",
      auth: { session: "REM64_AUTH_SECRET" },
      prayer: { remindersEnabled: true, reminderOffsetMinutes: 15 }
    },
    profileAssessment: {
      responses: { item_1: SENTINELS.rawProfile },
      panelSummary: { status: "available", shortReport: "Güvenli özet" }
    },
    location: { lat: Number(SENTINELS.gps), lon: "28.9784", accuracy: 3, ts: SOURCE_UPDATED_AT },
    locationHistory: [{ lat: Number(SENTINELS.gps), lon: 28.9784, ts: SOURCE_UPDATED_AT }],
    reminders: {
      preferences: {
        [SENTINELS.privateTitle]: {
          enabled: true,
          schedule: SENTINELS.schedule,
          body: SENTINELS.note,
          note: SENTINELS.journal,
          therapyNote: SENTINELS.therapy,
          medicationName: SENTINELS.medication,
          mood: SENTINELS.mood,
          prayerCompletion: SENTINELS.prayerCompletion
        }
      }
    },
    delivery: { entries: [{ title: SENTINELS.privateTitle, body: SENTINELS.note }] },
    deliveryLog: { entries: [{ occurrenceId: "REM64_OCCURRENCE", body: SENTINELS.note }] },
    reminderDelivery: { body: SENTINELS.note },
    reminderDeliveries: [{ title: SENTINELS.privateTitle, body: SENTINELS.note }],
    reminderHistory: [{ title: SENTINELS.privateTitle, schedule: SENTINELS.schedule }],
    notificationDelivery: { body: SENTINELS.note },
    eventLog: {
      events: [{
        eventId: "rem64-event-1",
        correlationId: "reminder-v1:lifecycle:rem64",
        sequence: 1,
        occurredAt: "2026-08-20T08:02:00.000Z",
        section: "wellness",
        path: "data.reminders",
        operation: "update",
        summary: "Bildirim yaşam döngüsü güncellendi",
        sourceDeviceId: "synthetic-rem64-device",
        privacyClass: "summary"
      }]
    },
    days: {
      "2026-08-20": {
        mood: "iyi",
        note: "Güvenli günlük özeti",
        journal: { text: "Güvenli günlük özeti" },
        therapy: { thoughts: [{ thought: SENTINELS.therapy, createdAt: "2026-08-20T07:00:00.000Z" }] },
        prayer: { fajr: true, completionNote: SENTINELS.prayerCompletion },
        movement: { track: [{ lat: Number(SENTINELS.gps), lng: 28.9784 }] },
        media: { mime: "image/png", data: SENTINELS.media, filename: SENTINELS.filename }
      }
    },
    notifications: [{ id: "n-rem64", body: SENTINELS.note, ts: "2026-08-20T08:00:00.000Z" }],
    labResults: [{ files: [{ name: SENTINELS.filename, data: SENTINELS.media }] }]
  };
}

function serialize(value) {
  return JSON.stringify(value === undefined ? null : value);
}

function leaks(value) {
  const text = serialize(value);
  return SENTINEL_VALUES.filter((needle) => text.includes(needle));
}

function extractTopLevelFunction(name) {
  const start = PANEL_SOURCE.indexOf("function " + name + "(");
  if (start < 0) throw new Error(name + " panel.js içinde bulunamadı");
  const end = PANEL_SOURCE.indexOf("\nfunction ", start + 10);
  return PANEL_SOURCE.slice(start, end < 0 ? PANEL_SOURCE.length : end).trim();
}

function extractFunctionBody(name) {
  const start = PANEL_SOURCE.indexOf("function " + name + "(");
  if (start < 0) throw new Error(name + " panel.js içinde bulunamadı");
  let depth = 0;
  let inString = null;
  for (let i = start; i < PANEL_SOURCE.length; i += 1) {
    const c = PANEL_SOURCE[i];
    if (inString) {
      if (c === "\\") i += 1;
      else if (c === inString) inString = null;
      continue;
    }
    if (c === "\"" || c === "'") { inString = c; continue; }
    if (c === "{") depth += 1;
    if (c === "}" && --depth === 0) return PANEL_SOURCE.slice(start, i + 1);
  }
  throw new Error(name + " gövdesi dengelenemedi");
}

function loadHtmlBoundary(extra) {
  const context = Object.assign({
    Date, Math, String, Number, Boolean, Object, Array, JSON, isNaN, isFinite,
    RegExp, icon: () => ""
  }, extra || {});
  vm.runInNewContext([
    extractTopLevelFunction("esc"),
    extractTopLevelFunction("jsArgP"),
    extractTopLevelFunction("mediaDimensionP"),
    extractTopLevelFunction("safePanelErrorTextP")
  ].join("\n"), context, { filename: "panel-rem64-html-boundary.js" });
  return context;
}

function loadMediaSlot() {
  const ctx = loadHtmlBoundary();
  vm.runInNewContext(extractTopLevelFunction("pmMediaSlotHTML"), ctx, { filename: "panel-rem64-media-slot.js" });
  return ctx;
}

function loadFail(diag) {
  const app = { innerHTML: "" };
  const ctx = loadHtmlBoundary({
    document: { getElementById: () => app },
    Date,
    // REM: fail() artık HTTP durum kodunu görünür kılan bir tanı satırı yazar.
    // Bu satır YALNIZ durum/sınıf/deneme/sıfırlanma saati taşır; token, URL ve
    // kullanıcı verisi taşımadığı aşağıdaki redaction testleriyle doğrulanır.
    PANEL_LAST_DIAG: Object.assign(
      { status: null, kind: null, attempts: 0, at: null, resetAt: null, retryAfterMs: null },
      diag || {}
    )
  });
  vm.runInNewContext(extractTopLevelFunction("panelDiagTextP"), ctx, { filename: "panel-rem64-diag.js" });
  vm.runInNewContext(extractFunctionBody("fail"), ctx, { filename: "panel-rem64-fail.js" });
  return { ctx, app };
}

function loadTimeline() {
  const names = [
    "isReminderEventP", "reminderEventActionP", "reminderEventLabelP", "eventClassificationP",
    "eventFeatureForP", "eventPathLabelP", "eventOperationLabelP", "eventChangeDescriptorP",
    "eventMatchesFilterP", "eventDateStateP", "safeEventSummaryP", "eventStatusP",
    "eventSourceKindForP", "eventCategoryDefsP", "eventTimeP", "refreshEventLogP",
    "setEventFilterP", "setEventLimitP", "eventLogSourceP", "statusToneP",
    "panelStatusBadgeHTMLP", "panelLegacyBadgeHTMLP", "eventLogCardInnerHTMLP", "eventLogCardHTMLP"
  ];
  const context = loadHtmlBoundary({
    window: {},
    UI: { eventLimit: 5, eventFilter: "all" },
    EVENT_LOG_STATE: {
      source: "event_files",
      events: [{
        eventId: "REM64_EVENT_ID",
        correlationId: "reminder-v1:lifecycle:REM64",
        sequence: 1,
        occurredAt: "2026-08-20T08:02:00.000Z",
        section: "wellness",
        path: SENTINELS.privateTitle,
        operation: "update",
        summary: SENTINELS.note,
        source: "app",
        sourceDeviceId: "synthetic",
        privacyClass: "summary"
      }],
      audit: { ok: true, issueCount: 0, issues: [], deviceCount: 1 },
      loadedAt: "2026-08-20T08:03:00.000Z"
    },
    STALE_WARN_DAYS: 1,
    STALE_DANGER_DAYS: 7,
    document: { getElementById: () => null },
    render: () => {},
    today: () => "2026-08-20",
    tsShort: (value) => String(value || ""),
    p3TimeP: (value) => value ? String(value) : "—"
  });
  vm.runInNewContext(names.map(extractTopLevelFunction).join("\n"), context, { filename: "panel-rem64-timeline.js" });
  return context;
}

const cases = [
  ["the negative corpus is fully redacted from projection and source remains unchanged", () => {
    const P = loadCoverage();
    const data = latestFixture();
    const before = deepClone(data);
    const snapshot = P.buildObserverSnapshot(data, receipt(), BUILT_AT);
    assert(deepEqual(leaks(P.redactForObserver(data)), []));
    assert(deepEqual(leaks(snapshot), []));
    assert(deepEqual(data, before));
    assertEqual(data.reminders.preferences[SENTINELS.privateTitle].body, SENTINELS.note);
    assertEqual(data.days["2026-08-20"].media.data, SENTINELS.media);
    assertEqual(data.location.lat, Number(SENTINELS.gps));
    ["reminders", "delivery", "deliveryLog", "reminderDelivery", "reminderDeliveries", "reminderHistory", "notificationDelivery"].forEach((key) => {
      assert(!Object.prototype.hasOwnProperty.call(snapshot.data, key));
    });
  }],

  ["safe aggregate and coverage metadata are minimum-necessary and path-masked", () => {
    const P = loadCoverage();
    const data = latestFixture();
    const report = P.reminderCoverageReport(data);
    assertEqual(report.ok, true);
    assertEqual(P.REMINDER_COVERAGE.decision, "local_only");
    assertEqual(P.REMINDER_COVERAGE.expectedInProjection, false);
    const summary = P.REMINDER_COVERAGE.fields.filter((field) => field.mode === "summary");
    assertEqual(summary.length, 1);
    assertEqual(summary[0].field, "safeAggregate");
    assertEqual(summary[0].paths.join(","), "eventLog,eventLog.events");
    P.REMINDER_COVERAGE.fields.filter((field) => field.field !== "safeAggregate").forEach((field) => {
      assert(["redacted", "unmapped"].includes(field.mode));
    });
    const coverage = P.coverageForData(data);
    assert(deepEqual(leaks(coverage), []));
    assert(!serialize(coverage).includes(SENTINELS.privateTitle));
    assert(coverage.redacted.includes("reminders"));
    assert(coverage.redacted.includes("settings.ghToken"));
    const hostile = P.coverageForData({ reminders: { preferences: { [SENTINELS.privateTitle]: { body: SENTINELS.note } } } });
    assert(deepEqual(leaks(hostile), []));
    assert(!serialize(hostile).includes(SENTINELS.privateTitle));
    assert(hostile.redacted.includes("reminders"));
  }],

  ["ready, legacy, stale, invalid and malformed branches stay private", () => {
    const P = loadCoverage();
    const data = latestFixture();
    const snapshot = P.buildObserverSnapshot(data, receipt(), BUILT_AT);
    const branches = {
      ready: P.chooseProjection(snapshot, data, receipt()),
      legacy: P.chooseProjection(null, data, receipt()),
      invalid: P.chooseProjection("{malformed", data, receipt()),
      missingReceipt: P.chooseProjection(snapshot, data, null),
      staleSha: P.chooseProjection(snapshot, data, receipt({ sourceLatestSha: SHA_OTHER })),
      staleRevision: P.chooseProjection(snapshot, data, receipt({ snapshotRevision: "c".repeat(40) }))
    };
    Object.keys(branches).forEach((name) => {
      const branch = branches[name];
      assert(deepEqual(leaks(branch), []), name + " leaked private corpus");
      assert(!serialize(branch.data || {}).includes("\"reminderDeliveries\":"));
      assert(!serialize(branch.data || {}).includes("\"notificationDelivery\":"));
    });
    assertEqual(branches.ready.reason, "ready");
    assertEqual(branches.legacy.reason, "projection_missing");
    assertEqual(branches.invalid.reason, "projection_invalid");
    assertEqual(branches.staleSha.reason, "projection_stale");
    assert(!Object.prototype.hasOwnProperty.call(branches.staleSha.snapshot, "data"));
    assert(!Object.prototype.hasOwnProperty.call(branches.staleSha.snapshot, "sections"));
    assert(!Object.prototype.hasOwnProperty.call(branches.staleSha.snapshot, "coverage"));
    assertThrowsMalformed(P, data);
  }],

  ["untrusted sections, paths and extra snapshot keys cannot bypass redaction", () => {
    const P = loadCoverage();
    const data = latestFixture();
    const remote = P.buildObserverSnapshot(data, receipt(), BUILT_AT);
    remote.sections.reminderHealth = { body: SENTINELS.note, title: SENTINELS.privateTitle };
    remote.sections.therapyProvenance.reminderNote = SENTINELS.therapy;
    remote.sections.therapyProvenance.ghToken = SENTINELS.token;
    remote.coverage.summary.push("reminderQueue." + SENTINELS.privateTitle + ".body");
    remote.reminderDebugDump = { profile: SENTINELS.rawProfile, media: SENTINELS.media };
    const before = deepClone(remote);
    const chosen = P.chooseProjection(remote, data, receipt());
    assert(deepEqual(leaks(chosen), []));
    assert(!Object.prototype.hasOwnProperty.call(chosen.sections, "reminderHealth"));
    assert(!serialize(chosen.coverage).includes(SENTINELS.privateTitle));
    assert(!Object.prototype.hasOwnProperty.call(chosen.snapshot, "reminderDebugDump"));
    assert(chosen.adoption.droppedSectionKeys.includes("reminderHealth"));
    assert(chosen.adoption.droppedFields >= 2);
    assert(deepEqual(remote, before));
  }],

  ["event timeline output is metadata-only and has no action or private path", () => {
    const ctx = loadTimeline();
    const html = ctx.eventLogCardHTMLP();
    assert(deepEqual(leaks(html), []));
    assert(!html.includes("<img"));
    assert(!html.includes(SENTINELS.privateTitle));
    assert(!html.includes('data-event-action="'));
    assert(!html.includes("onclick=\"App."));
    assert(html.includes("Reminder") || html.includes("Bildirim"));
  }],

  ["text, attribute, inline-handler and media filename boundaries are escaped", () => {
    const ctx = loadHtmlBoundary();
    const hostile = "<img src=x onerror=alert('REM64_XSS')> \" ' \u0000";
    const escaped = ctx.esc(hostile);
    assert(escaped.includes("&lt;img"));
    assert(escaped.includes("&quot;"));
    assert(escaped.includes("&#39;"));
    assert(!escaped.includes("<img"));
    assert(!escaped.includes("\u0000"));
    const argument = ctx.jsArgP(SENTINELS.filename);
    assert(argument.includes("\\u003C"));
    assert(argument.includes("\\u003E"));
    assert(!argument.includes("</script>"));
    const media = loadMediaSlot();
    const html = media.pmMediaSlotHTML("image", SENTINELS.filename, "1\";alert(1)", "2\"><x");
    assert(!html.includes("<img"));
    assert(!html.includes("onclick=\"alert"));
    assert(html.includes("aeonOpenImageP(&quot;"));
    assert(html.includes("aspect-ratio:1/1"));
    assert(!html.includes("1\";alert"));
  }],

  ["error output is stable and never exposes raw transport text", () => {
    const ctx = loadHtmlBoundary();
    const raw = new Error("401 Bearer github_pat_REM64_SECRET <img src=x> REM64_PRIVATE_TITLE_19:30");
    assertEqual(ctx.safePanelErrorTextP(raw), "Yetki doğrulanamadı.");
    assert(!ctx.safePanelErrorTextP(new Error(SENTINELS.therapy)).includes("REM64"));
    assert(!/alert\([^\n]*String\(e&&e\.message/.test(PANEL_SOURCE));
    assert(!/alert\([^\n]*\(e&&e\.message\)/.test(PANEL_SOURCE));
    ["Kuyruklanamadı", "Kaydedilemedi", "Geri çekilemedi", "Mesaj gönderilemedi", "Silinemedi"].forEach((label) => {
      assert(PANEL_SOURCE.includes(label + ': "+safePanelErrorTextP(e)'));
    });
    assert(PANEL_SOURCE.includes('gönderilemedi: "+safePanelErrorTextP(e)'));
    const failed = loadFail();
    failed.ctx.fail(new Error("REM64_RAW_ERROR_BODY <img src=x> Bearer github_pat_REM64_SECRET"));
    assert(!failed.app.innerHTML.includes("REM64_RAW_ERROR_BODY"));
    assert(!failed.app.innerHTML.includes("github_pat_REM64_SECRET"));
    assert(!failed.app.innerHTML.includes("<img"));
    assert(failed.app.innerHTML.includes("İşlem tamamlanamadı."));
  }],

  ["malformed JSON boundary fails closed without mutating input", () => {
    const P = loadCoverage();
    [null, undefined, "{", 42, [], {}, { schemaVersion: 1, data: {} }].forEach((value) => {
      const parsed = P.parseObserverSnapshot(value);
      assertEqual(parsed.ok, false);
      assert(deepEqual(leaks(parsed), []));
    });
    const data = latestFixture();
    const before = deepClone(data);
    assert(deepEqual(leaks(P.chooseProjection("{\"data\":", data, receipt())), []));
    assert(deepEqual(data, before));
  }]
];

function assertThrowsMalformed(P, data) {
  const parsed = P.parseObserverSnapshot("{\"schemaVersion\":1,\"data\":");
  assertEqual(parsed.ok, false);
  assert(deepEqual(leaks(P.redactForObserver({ reminderQueue: [{ body: SENTINELS.note }] })), []));
  assert(deepEqual(leaks(P.buildObserverSnapshot(data, receipt(), BUILT_AT)), []));
}

runTests(cases).catch(() => { process.exitCode = 1; });
