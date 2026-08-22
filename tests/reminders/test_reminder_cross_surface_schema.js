"use strict";

// REM-69 / G14-C — app state schema, sync boundary and current-panel
// projection compatibility. Synthetic only: no browser, network, token,
// real localStorage or data-repository write.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {
  assert,
  assertEqual,
  deepClone,
  deepEqual,
  runTests
} = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const APP_FILES = ["app/content/profileAssessmentV1.js", "app/content/esmaulHusnaV1.js", "app/core/constants.js", "app.js"];
const APP_SOURCE = APP_FILES.map((file) => ({ file, source: fs.readFileSync(path.join(ROOT, file), "utf8") }));
const MANIFEST_SOURCE = fs.readFileSync(path.join(ROOT, "panel/panelCoverageManifest.js"), "utf8");
const SYNC_SOURCE = fs.readFileSync(path.join(ROOT, "sync.js"), "utf8");
const PANEL_SOURCE = fs.readFileSync(path.join(ROOT, "panel/panel.js"), "utf8");
const HASH_SOURCE = "a".repeat(40);
const HASH_LATEST = "b".repeat(40);
const NOW = "2026-08-20T10:00:00.000Z";

function fixtureElement(id) {
  return {
    id: id || "", _html: "", _text: "", style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
    setAttribute() {}, getAttribute() { return null; }, appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; },
    addEventListener() {}, removeEventListener() {}, click() {}, focus() {}, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function baseState(extra) {
  return Object.assign({
    version: 2,
    startDate: "2026-08-19",
    lastOpenedDate: "2026-08-19",
    days: {},
    notifications: [],
    luna: { qa: [] },
    aeon: { qa: [] },
    settings: { nickname: "REM-69 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    __rem69UnknownTopLevel: { keep: true }
  }, extra || {});
}

function bootApp(seed) {
  const store = { "seyma-reset-v1": JSON.stringify(seed) };
  const counters = { fetches: 0 };
  const app = fixtureElement("app");
  const root = fixtureElement("root");
  const document = {
    hidden: false, body: fixtureElement("body"), documentElement: root,
    getElementById(id) { return id === "app" ? app : id === "root" ? root : null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(""); }, createDocumentFragment() { return fixtureElement(""); },
    addEventListener() {}, removeEventListener() {}
  };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); }, removeItem(key) { delete store[key]; }, clear() {},
    _store: store
  };
  class DOMParserStub { parseFromString() { return { body: fixtureElement("body"), querySelector() { return null; }, querySelectorAll() { return []; } }; } }
  const sandbox = {
    console, localStorage, document,
    navigator: { vibrate() {}, userAgent: "rem-69-schema", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { counters.fetches += 1; return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-69-fixture-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-69"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  try {
    APP_SOURCE.forEach(({ file, source }) => vm.runInContext(source, context, { filename: file }));
    sandbox.App.start();
    return { data: JSON.parse(localStorage.getItem("seyma-reset-v1")), sandbox, counters, error: null };
  } catch (error) {
    return { data: null, sandbox, counters, error: error && error.stack ? error.stack : String(error) };
  }
}

function loadManifest() {
  const context = { window: {}, Date, JSON, Array, Object, String, Number, Boolean, Math, RegExp, isNaN, isFinite };
  vm.runInNewContext(MANIFEST_SOURCE, context, { filename: "panel/panelCoverageManifest.js" });
  return context.window.PanelCoverageV1;
}

function loadSync() {
  let storageReads = 0;
  const storage = { getItem() { storageReads += 1; return null; }, setItem() {}, removeItem() {}, clear() {} };
  const context = {
    console, localStorage: storage, location: { protocol: "https:", hostname: "synthetic.example", search: "" },
    fetch() { throw new Error("REM69_NETWORK_MUST_NOT_RUN"); }, setTimeout() { return 0; }, clearTimeout() {},
    addEventListener() {}, removeEventListener() {}, TextEncoder, TextDecoder, Date, Math, JSON, Object, Array,
    String, Number, Boolean, RegExp, Error, Promise, Set, Map, Symbol, Intl, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, atob, btoa
  };
  context.window = context; context.self = context; context.globalThis = context;
  vm.runInNewContext(SYNC_SOURCE, context, { filename: "sync.js" });
  return { sync: context.SeySync, get storageReads() { return storageReads; } };
}

function latestFixture() {
  return {
    version: 2, startDate: "2026-08-19", lastOpenedDate: "2026-08-20", savedAt: NOW,
    days: { "2026-08-20": { mood: "calm", note: "safe note" } },
    settings: { nickname: "Günışığı", ghRepo: "owner/repo", ghBranch: "main", ghToken: "REM69_TOKEN", openaiKey: "REM69_OPENAI", syncUrl: "https://private.invalid" },
    reminders: { schemaVersion: 1, futurePrivateField: "REM69_PRIVATE_REMINDER_FIELD", preferences: { "reminder.future": { body: "REM69_PRIVATE_BODY" } } },
    reminderQueue: { "Anneme ilaç ver": { body: "REM69_PRIVATE_QUEUE_BODY" } },
    futureSafeField: { keep: "yes" },
    notifications: [{ id: "safe", kind: "observer", message: "safe aggregate" }]
  };
}

function receipt(overrides) {
  return Object.assign({
    schemaVersion: 1, status: "accepted", snapshotRevision: HASH_SOURCE,
    sourceUpdatedAt: NOW, submittedAt: "2026-08-20T10:00:01.000Z", acceptedAt: "2026-08-20T10:00:02.000Z", sourceLatestSha: HASH_LATEST
  }, overrides || {});
}

function extractPanelFunction(name) {
  const start = PANEL_SOURCE.indexOf("function " + name + "(");
  if (start < 0) throw new Error(name + " panel.js içinde bulunamadı");
  const end = PANEL_SOURCE.indexOf("\nfunction ", start + 10);
  return PANEL_SOURCE.slice(start, end < 0 ? PANEL_SOURCE.length : end);
}

function loadPanelStatus() {
  const context = { Date, Math, String, Number, Boolean, Object, Array, JSON, isNaN, isFinite, RegExp };
  vm.runInNewContext(["projectionStatusP", "reminderSystemStatusP"].map(extractPanelFunction).join("\n").replace(/^function /gm, "function "), context, { filename: "panel-rem69-status.js" });
  return context;
}

const tests = [
  ["missing reminder root creates current v1 default without touching unrelated state", () => {
    const out = bootApp(baseState());
    assertEqual(out.error, null);
    assertEqual(out.data.reminders.schemaVersion, 1);
    assert(deepEqual(out.data.__rem69UnknownTopLevel, { keep: true }));
    assertEqual(out.sandbox.App.reminderSchemaStatus().code, "current");
    assertEqual(out.counters.fetches, 0);
  }],
  ["version 0 migrates additively and preserves unknown reminder fields", () => {
    const seed = baseState({ reminders: { schemaVersion: 0, futureRootField: { keep: true }, preferences: { "reminder.legacy": { enabled: true, futurePreferenceField: "keep" } } } });
    const out = bootApp(seed);
    assertEqual(out.error, null);
    assertEqual(out.data.reminders.schemaVersion, 1);
    assert(out.data.reminders.futureRootField.keep === true);
    assert(out.data.reminders.preferences["reminder.legacy"].futurePreferenceField === "keep");
    assertEqual(out.sandbox.App.reminderSchemaStatus().supported, true);
  }],
  ["current state is idempotent across a second boot", () => {
    const first = bootApp(baseState({ reminders: { schemaVersion: 1, futureRootField: { keep: true }, preferences: {} } }));
    const second = bootApp(first.data);
    assertEqual(first.error, null); assertEqual(second.error, null);
    assert(deepEqual(first.data.reminders, second.data.reminders));
  }],
  ["malformed legacy fields receive safe defaults while unknown fields survive", () => {
    const out = bootApp(baseState({ reminders: { schemaVersion: "bad", preferences: { "reminder.bad": { enabled: "yes", timezone: "Not/IANA", unknownField: "keep" } }, policy: [], futureRootField: "keep" } }));
    assertEqual(out.error, null);
    assertEqual(out.data.reminders.schemaVersion, 1);
    assertEqual(out.data.reminders.preferences["reminder.bad"].enabled, false);
    assertEqual(out.data.reminders.preferences["reminder.bad"].unknownField, "keep");
    assertEqual(out.data.reminders.policy.nativeDailyCap, 3);
    assertEqual(out.data.reminders.futureRootField, "keep");
  }],
  ["future schema is preserved opaque, not exposed to the v1 runtime", () => {
    const future = { schemaVersion: 9, preferences: { future: { body: "REM69_FUTURE_PRIVATE" } }, futureField: { keep: "new-app" } };
    const out = bootApp(baseState({ reminders: future }));
    assertEqual(out.error, null);
    assert(deepEqual(out.data.reminders, future));
    assertEqual(out.sandbox.App.reminderSchemaStatus().code, "future");
    assertEqual(out.sandbox.App.reminderSchemaStatus().supported, false);
    assertEqual(out.sandbox.App.reminderSchemaStatus().action, "preserve_and_require_update");
  }],
  ["sync preserves safe unknown top-level fields and removes every reminder root", () => {
    const { sync, storageReads } = loadSync();
    const input = latestFixture();
    const before = deepClone(input);
    const payload = sync.sanitize(input);
    assert(deepEqual(input, before));
    assert(payload.futureSafeField.keep === "yes");
    assert(!Object.prototype.hasOwnProperty.call(payload, "reminders"));
    assert(!Object.prototype.hasOwnProperty.call(payload, "reminderQueue"));
    assert(!JSON.stringify(payload).includes("REM69_PRIVATE"));
    assertEqual(storageReads, 0);
  }],
  ["app migration output builds a redacted panel projection without mutating app state", () => {
    const migrated = bootApp(baseState({ reminders: { schemaVersion: 0, preferences: { "reminder.legacy": { body: "REM69_PRIVATE_BODY" } }, futureField: { keep: true } } }));
    assertEqual(migrated.error, null);
    const P = loadManifest();
    const appState = migrated.data;
    const before = deepClone(appState);
    const snapshot = P.buildObserverSnapshot(appState, receipt(), "2026-08-20T10:00:03.000Z");
    const chosen = P.chooseProjection(snapshot, appState, receipt());
    assertEqual(chosen.source, "projection");
    assertEqual(chosen.reason, "ready");
    assert(deepEqual(appState, before));
    assert(!JSON.stringify(chosen).includes("REM69_PRIVATE"));
    assert(!Object.prototype.hasOwnProperty.call(chosen.data, "reminders"));
  }],
  ["partial projection is rebuilt from current safe data and never mutates the input", () => {
    const P = loadManifest();
    const latest = latestFixture();
    const snapshot = P.buildObserverSnapshot(latest, receipt(), "2026-08-20T10:00:03.000Z");
    delete snapshot.sections; delete snapshot.coverage;
    const before = deepClone(snapshot);
    const chosen = P.chooseProjection(snapshot, latest, receipt());
    assertEqual(chosen.source, "projection");
    assertEqual(chosen.compatibility.code, "partial_rebuilt");
    assertEqual(chosen.compatibility.action, "rebuild_with_current_manifest");
    assert(Array.isArray(chosen.coverage.redacted));
    assert(chosen.sections && chosen.sections.lifecycle);
    assert(deepEqual(snapshot, before));
    assert(!JSON.stringify(chosen).includes("REM69_PRIVATE"));
  }],
  ["legacy and future projection versions fail closed with actionable compatibility", () => {
    const P = loadManifest();
    const latest = latestFixture();
    const current = P.buildObserverSnapshot(latest, receipt(), "2026-08-20T10:00:03.000Z");
    const legacy = Object.assign({}, current, { schemaVersion: 0 });
    delete legacy.manifestVersion;
    const future = Object.assign({}, current, { schemaVersion: 9, futureProjectionField: "REM69_FUTURE_PROJECTION" });
    const legacyChosen = P.chooseProjection(legacy, latest, receipt());
    const futureChosen = P.chooseProjection(future, latest, receipt());
    assertEqual(legacyChosen.source, "legacy_fallback");
    assertEqual(legacyChosen.reason, "projection_invalid");
    assertEqual(legacyChosen.compatibility.code, "legacy");
    assertEqual(legacyChosen.compatibility.action, "use_legacy_fallback");
    assertEqual(futureChosen.source, "legacy_fallback");
    assertEqual(futureChosen.compatibility.code, "schema_unsupported");
    assertEqual(futureChosen.compatibility.action, "update_panel_or_rebuild_projection");
    assert(!JSON.stringify(futureChosen).includes("REM69_FUTURE_PROJECTION"));
  }],
  ["future manifest version is not accepted as current projection", () => {
    const P = loadManifest();
    const latest = latestFixture();
    const current = P.buildObserverSnapshot(latest, receipt(), "2026-08-20T10:00:03.000Z");
    current.reminderCoverageVersion = "panel-reminder-coverage-v9";
    const chosen = P.chooseProjection(current, latest, receipt());
    assertEqual(chosen.source, "legacy_fallback");
    assertEqual(chosen.compatibility.code, "manifest_unsupported");
    assertEqual(chosen.compatibility.action, "update_panel_or_rebuild_projection");
  }],
  ["unknown reminder paths are unmapped/masked while unknown safe fields are preserved", () => {
    const P = loadManifest();
    const latest = latestFixture();
    const safe = P.redactForObserver(latest);
    const coverage = P.coverageForData(latest);
    assert(safe.futureSafeField.keep === "yes");
    assert(!JSON.stringify(safe).includes("REM69_PRIVATE"));
    assert(!Object.prototype.hasOwnProperty.call(safe, "reminders"));
    assert(!Object.prototype.hasOwnProperty.call(safe, "reminderQueue"));
    assert(coverage.unmappedPaths.some((value) => value === "reminderQueue"));
    assert(!JSON.stringify(coverage).includes("Anneme ilaç"));
  }],
  ["panel compatibility status is actionable and never green for mismatch", () => {
    const ctx = loadPanelStatus();
    const state = { source: "legacy_fallback", reason: "projection_invalid", compatibility: { code: "schema_unsupported" } };
    const projection = ctx.projectionStatusP(state);
    const reminder = ctx.reminderSystemStatusP(state, { ok: true });
    assertEqual(projection.cls, "b-danger");
    assert(projection.label.includes("uyumsuz"));
    assert(projection.note.includes("fallback"));
    assertEqual(reminder.code, "error");
    assert(reminder.text.includes("uyumsuz"));
  }]
];

runTests(tests);
