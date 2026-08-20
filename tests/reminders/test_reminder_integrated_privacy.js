"use strict";

// REM-70 / G14-D — integrated negative privacy, security and no-write gate.
//
// One synthetic corpus is sent through the app, native, service-worker,
// sync, projection, current-panel, error, event and export boundaries. The
// browser case is deliberately classified as a user-owned local surface;
// only its local reminder detail may remain there. Every external/operator
// surface is strict: no private corpus, no raw error, and no write.
//
// This fixture never opens a browser, starts a server, uses real localStorage,
// calls fetch against a network, reads a real token or writes any repository.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {
  assert,
  assertEqual,
  assertRejects,
  createNotificationMock,
  deepClone,
  runTests
} = require("./helpers/reminder-test-helper");
const {
  serialize,
  findLeaks,
  findStaticMatches,
  writeVerbs
} = require("./helpers/integrated-privacy-scanner");

const ROOT = path.resolve(__dirname, "../..");
const APP_KEY = "seyma-reset-v1";
const DELIVERY_KEY = "seyma-reminder-delivery-v1";
const ACTION_KEY = "seyma-reminder-actions-v1";
const PRIVATE = Object.freeze({
  therapy: "REM70_THERAPY_PRIVATE",
  medication: "REM70_MEDICATION_NAME_PRIVATE",
  medicationLabel: "REM70_MEDICATION_LABEL_PRIVATE",
  medicationNote: "REM70_MEDICATION_NOTE_PRIVATE",
  mood: "REM70_MOOD_PRIVATE",
  prayer: "REM70_PRAYER_COMPLETION_PRIVATE",
  journal: "REM70_JOURNAL_PRIVATE",
  note: "REM70_NOTE_PRIVATE",
  token: "Bearer github_pat_REM70_PRIVATE_TOKEN",
  gps: "REM70_GPS_41.012345_28.9784",
  rawBody: "REM70_RAW_NOTIFICATION_BODY_PRIVATE",
  privateTitle: "REM70_PRIVATE_TITLE_09_30"
});
const CORPUS = Object.values(PRIVATE);
const LOCAL_BROWSER_ONLY = [
  PRIVATE.therapy,
  PRIVATE.medication,
  PRIVATE.medicationLabel,
  PRIVATE.medicationNote,
  PRIVATE.mood,
  PRIVATE.prayer,
  PRIVATE.journal,
  PRIVATE.note,
  PRIVATE.privateTitle
];
const REMINDER_ID = "reminder.catalog.v1.therapy";
const NOW = "2026-08-20T10:00:00.000Z";
const SOURCE_SHA = "a".repeat(40);
const LATEST_SHA = "b".repeat(40);

function failIfLeaks(surface, value, allowed) {
  const permitted = new Set(allowed || []);
  const leaks = findLeaks(value, CORPUS).filter((needle) => !permitted.has(needle));
  if (leaks.length) {
    throw new Error(`REM-70 BLOCKED surface=${surface} assertion=no-private-corpus leaks=${leaks.join(",")}`);
  }
  assert(true);
  return leaks;
}

function failIfStatic(source, surface, patterns) {
  const matches = findStaticMatches(source, patterns);
  if (matches.length) {
    throw new Error(`REM-70 BLOCKED surface=${surface} assertion=static-boundary matches=${matches.map(String).join(",")}`);
  }
  assert(true);
}

function fixtureElement(id) {
  return {
    id: id || "", _html: "", _text: "", value: "", files: [], children: [], scrollTop: 0,
    style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, parentNode: null,
    get innerHTML() { return this._html; },
    set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; },
    set textContent(value) { this._text = String(value); },
    setAttribute() {}, getAttribute() { return null; },
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; },
    addEventListener() {}, removeEventListener() {}, click() {}, focus() {}, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function seedState() {
  return {
    version: 2,
    startDate: "2026-08-20",
    lastOpenedDate: "2026-08-20",
    days: {
      "2026-08-20": {
        mood: "safe mood aggregate",
        note: "safe note",
        journal: "safe journal",
        prayer: { completionNote: "safe completion aggregate", fajr: true },
        therapy: { thoughts: [{ thought: "Metin redacted" }] },
        movement: { track: [{ lat: 41.012345, lng: 28.9784 }] }
      }
    },
    location: { lat: 41.012345, lng: 28.9784 },
    locationHistory: [{ lat: 41.012345, lng: 28.9784 }],
    reminders: {
      schemaVersion: 1,
      preferences: {
        [REMINDER_ID]: {
          reminderId: REMINDER_ID,
          enabled: true,
          channel: "native",
          privacyMode: "private",
          privateTitle: PRIVATE.privateTitle,
          privateDetail: PRIVATE.therapy,
          userNote: PRIVATE.note,
          mood: PRIVATE.mood,
          prayerCompletion: PRIVATE.prayer,
          journal: PRIVATE.journal,
          gps: PRIVATE.gps
        }
      },
      medications: [{
        id: "reminder.medication.v1.rem70",
        kind: "medication",
        name: PRIVATE.medication,
        privateLabel: PRIVATE.medicationLabel,
        note: PRIVATE.medicationNote,
        time: "09:30",
        timezone: "Europe/Istanbul",
        enabled: true
      }]
    },
    deliveryLog: [{ occurrenceId: "rem70-occurrence", body: PRIVATE.rawBody }],
    eventLog: {
      schemaVersion: 1,
      sourceDeviceId: "rem70-device",
      nextSequence: 2,
      events: [{
        eventId: "rem70-event",
        correlationId: "reminder-v1:lifecycle:rem70",
        sequence: 1,
        occurredAt: NOW,
        sourceDeviceId: "rem70-device",
        section: "wellness",
        path: "data.reminders",
        operation: "update",
        summary: PRIVATE.note,
        detail: PRIVATE.therapy,
        body: PRIVATE.rawBody,
        occurrenceId: "rem70-occurrence"
      }]
    },
    notifications: [{ id: "safe-notification", title: "Güvenli özet", body: "Bildirim yaşam döngüsü güncellendi" }],
    settings: {
      nickname: "REM-70 synthetic",
      ghRepo: "mustafaras/seyma-data",
      ghBranch: "main",
      ghToken: PRIVATE.token,
      openaiKey: "REM70_OPENAI_PRIVATE",
      syncUrl: "REM70_SYNC_URL_PRIVATE",
      auth: { rememberMe: true, usernameHash: "rem70-auth", token: PRIVATE.token, unlockedAt: NOW },
      profileAssessmentInactive: true,
      locationEnabled: true
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    luna: { qa: [] },
    aeon: { qa: [], shownNotificationIds: [] }
  };
}

function bootApp() {
  const state = seedState();
  const app = fixtureElement("app");
  const root = fixtureElement("root");
  const notification = createNotificationMock("granted");
  const store = new Map([
    [APP_KEY, JSON.stringify(state)],
    [DELIVERY_KEY, JSON.stringify({ entries: [{ occurrenceId: "rem70-occurrence", body: PRIVATE.rawBody }] })],
    [ACTION_KEY, JSON.stringify({ entries: [{ occurrenceId: "rem70-occurrence", title: PRIVATE.privateTitle }] })]
  ]);
  const counters = { fetches: 0, scheduled: [], storageWrites: 0, storageRemovals: 0 };
  const localStorage = {
    getItem(key) { return store.has(String(key)) ? store.get(String(key)) : null; },
    setItem(key, value) { counters.storageWrites += 1; store.set(String(key), String(value)); },
    removeItem(key) { counters.storageRemovals += 1; store.delete(String(key)); },
    clear() { store.clear(); }
  };
  const document = {
    hidden: false,
    body: fixtureElement("body"),
    documentElement: root,
    activeElement: null,
    getElementById(id) { return id === "app" ? app : id === "root" ? root : null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(""); },
    createDocumentFragment() { return fixtureElement(""); },
    addEventListener() {}, removeEventListener() {}
  };
  class DOMParserStub {
    parseFromString() { return { body: fixtureElement("body"), querySelector() { return null; }, querySelectorAll() { return []; } }; }
  }
  const sync = {
    schedule(payload) { counters.scheduled.push(deepClone(payload)); },
    pushNow() { return Promise.resolve(null); },
    statusText() { return "sentetik"; },
    retryIfPending() {}
  };
  const sandbox = {
    console,
    localStorage,
    document,
    Notification: notification.Notification,
    navigator: {
      userAgent: "rem70-integrated-privacy",
      standalone: false,
      vibrate() {},
      clipboard: { writeText() { return Promise.resolve(); } },
      serviceWorker: { register() { return Promise.resolve({}); }, addEventListener() {} },
      geolocation: {
        getCurrentPosition(done) { done({ coords: { latitude: 41.012345, longitude: 28.9784, accuracy: 20 } }); },
        watchPosition() { return 1; }, clearWatch() {}
      }
    },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { counters.fetches += 1; return Promise.reject(new Error("REM70_NETWORK_MUST_NOT_RUN")); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem70-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem70"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise,
    Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.SeySync = sync;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app/core/reminderDelivery.js"]
    .forEach((file) => vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), context, { filename: file }));
  vm.runInContext(fs.readFileSync(path.join(ROOT, "app.js"), "utf8"), context, { filename: "app.js" });
  sandbox.App.start();
  return { sandbox, app, notification, localStorage, store, counters, state };
}

function reminderInput(out) {
  const occurrence = {
    occurrenceId: "rem70-occurrence",
    reminderId: REMINDER_ID,
    deepLink: "room",
    targetId: "room",
    timezone: "Europe/Istanbul",
    therapy: PRIVATE.therapy,
    medicationName: PRIVATE.medication,
    body: PRIVATE.rawBody,
    privateTitle: PRIVATE.privateTitle,
    userNote: PRIVATE.note
  };
  return { occurrence, definition: out.sandbox.ReminderCatalogV1.get(REMINDER_ID), reminderId: REMINDER_ID, occurrenceId: occurrence.occurrenceId, deepLink: "room" };
}

function extractTopLevelFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`${name} missing`);
  const end = source.indexOf("\nfunction ", start + 10);
  return source.slice(start, end < 0 ? source.length : end).trim();
}

function extractBalancedVar(source, name) {
  const start = source.indexOf(`var ${name}=`);
  if (start < 0) throw new Error(`${name} missing`);
  let depth = 0;
  let quote = null;
  for (let index = start; index < source.length; index += 1) {
    const c = source[index];
    if (quote) {
      if (c === "\\") index += 1;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === "\"" || c === "'") { quote = c; continue; }
    if (c === "{") depth += 1;
    if (c === "}" && --depth === 0) return source.slice(start, index + 1).trim();
  }
  throw new Error(`${name} unbalanced`);
}

function loadSync() {
  const counters = { fetches: 0 };
  const storage = { getItem() { return null; }, setItem() {}, removeItem() {}, clear() {} };
  const context = {
    console, localStorage: storage,
    location: { protocol: "https:", hostname: "synthetic.example", search: "" },
    fetch() { counters.fetches += 1; throw new Error("REM70_SYNC_NETWORK_MUST_NOT_RUN"); },
    setTimeout() { return 0; }, clearTimeout() {}, addEventListener() {}, removeEventListener() {},
    TextEncoder, TextDecoder, atob, btoa, Date, Math, JSON, Object, Array, String, Number, Boolean,
    RegExp, Error, Promise, Set, Map, Symbol, Intl, isNaN, isFinite, encodeURIComponent, decodeURIComponent
  };
  context.window = context; context.self = context; context.globalThis = context;
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "sync.js"), "utf8"), context, { filename: "sync.js" });
  return { sync: context.SeySync, counters };
}

function loadCoverage() {
  const context = { window: {}, Date, JSON, Array, Object, String, Number, Boolean, Math, RegExp, isNaN, isFinite };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "panelCoverageManifest.js"), "utf8"), context, { filename: "panelCoverageManifest.js" });
  return context.window.PanelCoverageV1;
}

function receipt() {
  return {
    status: "accepted", snapshotRevision: SOURCE_SHA, sourceUpdatedAt: NOW,
    submittedAt: NOW, acceptedAt: NOW, sourceLatestSha: LATEST_SHA
  };
}

function loadPanelStatus() {
  const source = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");
  const names = [
    "panelStatusBadgeHTMLP", "panelLegacyBadgeHTMLP", "reminderStatusToneMapP",
    "reminderSystemStatusP", "reminderReceiptStatusP", "reminderCapabilityStatusP",
    "reminderSourceStatusP", "reminderDeviceAcceptanceStatusP", "reminderPrivacyStatusP",
    "reminderWorkingClaimP", "reminderStatusCardHTMLP", "normalizeSyncReceiptP", "syncStatusP"
  ];
  const context = {
    Date, Math, String, Number, Boolean, Object, Array, JSON, isNaN, isFinite, RegExp,
    esc(value) { return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); },
    icon() { return ""; },
    tsShort(value) { return String(value || ""); },
    p3TimeP(value) { return value ? String(value) : "—"; }
  };
  vm.runInNewContext(extractBalancedVar(source, "SYNC_STATUS_P") + "\n" + names.map((name) => extractTopLevelFunction(source, name)).join("\n"), context, { filename: "rem70-panel-status.js" });
  return context;
}

function loadPanelError() {
  const source = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");
  const context = { Date, Math, String, Number, Boolean, Object, Array, JSON, RegExp };
  vm.runInNewContext(extractTopLevelFunction(source, "safePanelErrorTextP"), context, { filename: "rem70-panel-error.js" });
  return context;
}

function loadPanelWriteBoundary() {
  const source = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");
  const names = ["panelTokenValidP", "findReminderKeyP", "panelWriteGuardP", "b64enc", "ghJsonHeaders", "ghTransportApiP", "inboxApi", "aeonMediaApiP", "putTransportFileP", "putInbox", "putAeonMediaP"];
  const context = {
    Date, Math, String, Number, Boolean, Object, Array, JSON, isNaN, isFinite, RegExp,
    DEMO_MODE: false, PTOKEN: "github_pat_REM70_SYNTHETIC_TOKEN", BRANCH: "main", REPO: "mustafaras/seyma-data",
    btoa: (value) => Buffer.from(value, "binary").toString("base64"),
    atob: (value) => Buffer.from(value, "base64").toString("binary"),
    TextEncoder, TextDecoder, Uint8Array,
    window: { QuranTransportV1: { isWritableTransportPath: (value) => ["data/quran-request-outbox.json", "data/quran-delivery.json", "data/quran-responses.json"].includes(value) } },
    fetch() { return Promise.resolve({ ok: true, json: () => Promise.resolve({}) }); }
  };
  vm.runInNewContext(extractBalancedVar(source, "REMINDER_WRITE_TOKENS") + "\n" + names.map((name) => extractTopLevelFunction(source, name)).join("\n"), context, { filename: "rem70-panel-write.js" });
  return context;
}

function loadServiceWorker() {
  const source = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
  const handlers = {};
  const state = { fetches: 0, shows: 0, messages: [] };
  const appClient = { url: "https://seyma.test/index.html", postMessage(message) { state.messages.push(deepClone(message)); }, focus() { return Promise.resolve(); } };
  const self = {
    location: { origin: "https://seyma.test", pathname: "/sw.js" },
    registration: { showNotification() { state.shows += 1; return Promise.resolve(); } },
    addEventListener(name, handler) { handlers[name] = handler; }, skipWaiting() {}
  };
  const clients = {
    matchAll() { return Promise.resolve([appClient]); },
    openWindow() { return Promise.resolve(appClient); },
    claim() { return Promise.resolve(); }
  };
  const context = vm.createContext({ console, self, clients, URL, Promise, Object, String, Number, Boolean, RegExp, Array, JSON, Error, TypeError, Math });
  vm.runInContext(source, context, { filename: "sw.js" });
  return { source, handlers, state };
}

function fireSw(handler, data, action, tag) {
  const event = {
    action: action || "open",
    notification: { data, tag, close() {} },
    waitUntil(promise) { this.waited = promise; },
    waited: null
  };
  handler(event);
  return event.waited ? Promise.resolve(event.waited) : Promise.resolve();
}

const cases = [
  ["browser reminder surface is local-only and never exposes secrets or raw transport", () => {
    const out = bootApp();
    out.sandbox.App.requestLocationGatePermission();
    out.sandbox.App.openReminderCenter();
    const html = out.app.innerHTML;
    if (!html.includes("sey-reminder-overlay")) throw new Error(`REM-70 BLOCKED surface=browser.reminder-center assertion=overlay-missing html=${html.slice(0, 120)}`);
    failIfLeaks("browser.reminder-center", html, LOCAL_BROWSER_ONLY);
    assert(!html.includes(PRIVATE.token));
    assert(!html.includes("REM70_OPENAI_PRIVATE"));
    assert(!html.includes("REM70_SYNC_URL_PRIVATE"));
    assert(!html.includes(PRIVATE.gps));
    assert(!html.includes(PRIVATE.rawBody));
  }],

  ["native notification preview and delivery are generic and private-free", () => {
    const out = bootApp();
    const input = reminderInput(out);
    const preview = out.sandbox.App.previewReminderNotification(input);
    const delivery = out.sandbox.App.reminderNativeDisplay({
      source: "manual", visibilityState: "visible", occurrence: input.occurrence,
      definition: input.definition, reminderId: REMINDER_ID, occurrenceId: input.occurrenceId,
      deepLink: "room", policy: { nativeAllowed: true, channel: "native" }
    });
    failIfLeaks("notification.preview", preview, []);
    failIfLeaks("notification.delivery", delivery, []);
    failIfLeaks("notification.calls", out.notification.getCalls(), []);
    assert(out.notification.getCalls().every((call) => !String(call.options.body || "").includes(PRIVATE.rawBody)));
  }],

  ["service worker click and push boundaries strip private fields and never schedule", async () => {
    const out = loadServiceWorker();
    const privatePayload = {
      type: "reminder", occurrenceId: "rem70-occurrence", reminderId: REMINDER_ID,
      deepLink: "room", targetId: "room", openDetail: false, timezone: "Europe/Istanbul",
      body: PRIVATE.rawBody, title: PRIVATE.privateTitle, medicationName: PRIVATE.medication, note: PRIVATE.note
    };
    await fireSw(out.handlers.notificationclick, privatePayload, "open", "seyma-reminder-v1:rem70-occurrence");
    failIfLeaks("sw.notificationclick", out.state.messages, []);
    assertEqual(out.state.messages[0].type, "reminder-native-click");
    await fireSw(out.handlers.push, { type: "reminder", tag: "seyma-reminder-v1:rem70-occurrence", data: privatePayload });
    assertEqual(out.state.shows, 0);
    assertEqual(out.state.fetches, 0);
    failIfStatic(out.source, "sw.scheduler", [/\bsetTimeout\s*\(/, /\bsetInterval\s*\(/, /\bfetch\s*\(/, /localStorage/, /Authorization/]);
    assert(out.source.includes("backgroundScheduling: false"));
    assert(out.source.includes("reminderRole: 'click-transport-only'"));
  }],

  ["app and sanitized sync payloads remove reminder private state before the remote boundary", () => {
    const out = bootApp();
    const appPayload = out.sandbox.App.reminderCurrentSyncPayload();
    assertEqual(appPayload.reminders, undefined);
    assertEqual(appPayload.deliveryLog, undefined);
    // The app adapter is still inside the user-owned local boundary: ordinary
    // day records and device secrets can exist in this intermediate object.
    // Its hard contract here is that reminder roots never cross it.
    const adapterLeaks = findLeaks(appPayload, CORPUS);
    assert(adapterLeaks.includes(PRIVATE.therapy) === false);
    assert(adapterLeaks.includes(PRIVATE.medication) === false);
    assert(adapterLeaks.includes(PRIVATE.rawBody) === false);
    assert(adapterLeaks.includes(PRIVATE.privateTitle) === false);
    const loaded = loadSync();
    const sanitized = loaded.sync.sanitize(seedState());
    failIfLeaks("sync.remote-sanitized", sanitized, []);
    assertEqual(loaded.counters.fetches, 0);
    assert(!Object.prototype.hasOwnProperty.call(sanitized, "reminders"));
    assert(!Object.prototype.hasOwnProperty.call(sanitized, "deliveryLog"));
    assert(!serialize(sanitized).includes("REM70_OPENAI_PRIVATE"));
    assert(!serialize(sanitized).includes("REM70_SYNC_URL_PRIVATE"));
  }],

  ["projection ready, legacy, stale and malformed branches are redacted and immutable", () => {
    const P = loadCoverage();
    const latest = seedState();
    const before = deepClone(latest);
    const remote = loadSync().sync.sanitize(latest);
    const snapshot = P.buildObserverSnapshot(remote, receipt(), NOW);
    const branches = [
      ["ready", P.chooseProjection(snapshot, remote, receipt())],
      ["legacy", P.chooseProjection(null, remote, receipt())],
      ["stale", P.chooseProjection(Object.assign({}, snapshot, { sourceLatestSha: "c".repeat(40) }), remote, receipt())],
      ["malformed", P.chooseProjection("{broken", remote, receipt())]
    ];
    branches.forEach(([name, value]) => failIfLeaks(`projection.${name}`, value, []));
    assert(deepClone(latest).reminders.preferences[REMINDER_ID].privateDetail === PRIVATE.therapy);
    assertEqual(latest.location.lat, 41.012345);
    assert(deepClone(latest).eventLog.events[0].detail === PRIVATE.therapy);
    assert(snapshot && snapshot.schemaVersion === 1);
    assert(deepClone(latest).reminders.preferences[REMINDER_ID].privateDetail === before.reminders.preferences[REMINDER_ID].privateDetail);
  }],

  ["panel DOM status and event output contain only safe operator metadata", () => {
    const P = loadCoverage();
    const latest = seedState();
    const remote = loadSync().sync.sanitize(latest);
    const projection = P.chooseProjection(P.buildObserverSnapshot(remote, receipt(), NOW), remote, receipt());
    const panel = loadPanelStatus();
    const html = panel.reminderStatusCardHTMLP(receipt(), NOW, projection, { ok: true });
    failIfLeaks("panel.dom.reminder-status", html, []);
    if (html.includes("onclick=\"App.")) throw new Error("REM-70 BLOCKED surface=panel.dom.reminder-status assertion=no-app-write-handler");
    if (html.includes("REM70")) throw new Error("REM-70 BLOCKED surface=panel.dom.reminder-status assertion=synthetic-marker");
    const event = P.parseEventLog(JSON.stringify(remote.eventLog), "2026-08-20");
    failIfLeaks("panel.dom.event-log", event, []);
    if (!serialize(event).includes("Güvenli kayıt özeti")) throw new Error(`REM-70 BLOCKED surface=panel.dom.event-log assertion=safe-summary-missing value=${serialize(event).slice(0, 240)}`);
    const panelSource = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");
    ["reminderStatusCardHTMLP", "eventLogCardInnerHTMLP"].forEach((name) => {
      const source = extractTopLevelFunction(panelSource, name);
      failIfStatic(source, `panel.dom.${name}`, [/method\s*:\s*["'](?:PUT|POST|PATCH|DELETE)["']/, /localStorage\.(?:setItem|removeItem)\s*\(/, /SeySync\.schedule\s*\(/]);
    });
  }],

  ["panel errors collapse raw bodies, tokens and private titles to fixed copy", () => {
    const panel = loadPanelError();
    const raw = new Error(`401 ${PRIVATE.token} ${PRIVATE.rawBody} ${PRIVATE.privateTitle} <img src=x>`);
    const output = panel.safePanelErrorTextP(raw);
    failIfLeaks("panel.error", output, []);
    assert(!output.includes("401"));
    assert(!output.includes("<img"));
    assert(output.length > 0);
    const panelSource = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");
    failIfStatic(panelSource, "panel.error.raw-alert", [/alert\([^\n]*e&&e\.message/, /alert\([^\n]*\(e&&e\.message\)/]);
  }],

  ["exported reminder summary is aggregate-only and event summaries are allowlisted", () => {
    const out = bootApp();
    const summary = out.sandbox.App.reminderExportSummary({ download: false, nowIso: NOW });
    failIfLeaks("export.summary", summary, []);
    if (summary.localOnly !== true) throw new Error("REM-70 BLOCKED surface=export.summary assertion=local-only-flag");
    ["rawNote", "token", "occurrenceSchedule"].forEach((key) => {
      if (summary.privacyBoundary[key] !== false) throw new Error(`REM-70 BLOCKED surface=export.summary assertion=privacy-boundary-${key}`);
    });
    const payload = out.sandbox.App.reminderCurrentSyncPayload();
    const events = ((payload.eventLog || {}).events || []).filter((event) => event.path === "data.reminders");
    if (!events.length) throw new Error("REM-70 BLOCKED surface=event-log.export assertion=missing-safe-event");
    events.forEach((event) => {
      failIfLeaks("event-log.synced-safe-summary", event, []);
      if (!["Bildirim yaşam döngüsü güncellendi", "Güvenli kayıt özeti"].includes(event.summary)) {
        throw new Error(`REM-70 BLOCKED surface=event-log.export assertion=unsafe-summary value=${String(event.summary)}`);
      }
    });
  }],

  ["app and panel reminder write boundaries reject payloads before any external call", async () => {
    const out = bootApp();
    out.sandbox.App.setReminderEnabled(REMINDER_ID, false);
    assert(out.counters.scheduled.length > 0);
    out.counters.scheduled.forEach((payload) => {
      assertEqual(payload.reminders, undefined);
      failIfLeaks("app.write.scheduled-payload", payload, [PRIVATE.mood, PRIVATE.journal, PRIVATE.note, PRIVATE.gps, PRIVATE.token]);
    });
    assertEqual(out.counters.fetches, 0);

    let fetchCalls = 0;
    const panel = loadPanelWriteBoundary();
    panel.fetch = () => { fetchCalls += 1; return Promise.resolve({ ok: true, json: () => Promise.resolve({}) }); };
    const bad = { reminders: { preferences: { [PRIVATE.privateTitle]: { body: PRIVATE.rawBody } } }, occurrenceId: "rem70-occurrence" };
    assertEqual(panel.panelWriteGuardP("inbox", bad).reason, "reminder_namespace");
    await assertRejects(panel.putInbox([bad], "sha", {}), "panel write engellendi: reminder_namespace");
    await assertRejects(panel.putAeonMediaP("rem70-media", bad), "panel write engellendi: reminder_namespace");
    await assertRejects(panel.putTransportFileP("data/quran-responses.json", { requests: { q: bad } }, "sha"), "panel write engellendi: reminder_namespace");
    assertEqual(fetchCalls, 0);
  }],

  ["static integrated scanner has no production corpus or unsafe cross-surface escape hatch", () => {
    ["app.js", "sync.js", "sw.js", "panel.js", "panelCoverageManifest.js", "panel.html"].forEach((file) => {
      const source = fs.readFileSync(path.join(ROOT, file), "utf8");
      failIfStatic(source, `source.${file}.synthetic-corpus`, CORPUS);
    });
    const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
    failIfStatic(sw, "source.sw.external-write", [/\bfetch\s*\(/, /localStorage/, /Authorization/]);
    const panel = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");
    assert(panel.includes("panelWriteGuardP"));
    assert(panel.includes("putInbox"));
    assert(panel.includes("putAeonMediaP"));
    assert(panel.includes("putTransportFileP"));
  }]
];

runTests(cases).catch(() => { process.exitCode = 1; });
