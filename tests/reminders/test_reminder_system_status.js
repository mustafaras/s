"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DATE = "2026-08-15";
const NOW = "2026-08-15T09:00:00.000Z";
const LOCATION = "41.0082,28.9784,İstanbul";
const TIMES = { fajr: "05:30", sunrise: "06:58", dhuhr: "13:08", asr: "16:55", maghrib: "20:04", isha: "21:35" };
const PRAYER_ID = "reminder.catalog.v1.prayer";

function element(id) {
  return {
    id: id || "", _html: "", _text: "", style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
    setAttribute() {}, getAttribute() { return null; }, appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; }, addEventListener() {}, removeEventListener() {},
    click() {}, focus() {}, blur() {}, querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; }, getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function prayerData(overrides = {}) {
  return Object.assign({
    localDate: DATE, fetchedAt: "2026-08-15T08:00:00.000Z", fetchedFor: LOCATION, method: "diyanet",
    revision: "rem-33-prayer-r1", times: Object.assign({}, TIMES)
  }, overrides);
}

function baseState(overrides = {}) {
  const state = {
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {}, notifications: [],
    luna: { qa: [] }, aeon: { qa: [] },
    reminders: { schemaVersion: 1, profile: "balanced", preferences: {
      [PRAYER_ID]: { reminderId: PRAYER_ID, enabled: true, channel: "native" }
    } },
    settings: {
      nickname: "REM-33 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true,
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW },
      prayer: { method: "diyanet", location: { lat: 41.0082, lon: 28.9784, cityName: "İstanbul" }, reminderOffsetMinutes: 15 }
    },
    syncReceipt: { status: "accepted", acceptedAt: NOW },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
  return Object.assign(state, overrides);
}

function boot(seed = baseState(), options = {}) {
  const app = element("app");
  const root = element("root");
  const store = { "seyma-reset-v1": JSON.stringify(seed) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  let notificationCalls = 0;
  function NotificationMock() { notificationCalls += 1; }
  NotificationMock.permission = options.permission || "granted";
  NotificationMock.requestPermission = function requestPermission() { return Promise.resolve(NotificationMock.permission); };
  const document = {
    hidden: false, body: element("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return element(""); }, createDocumentFragment() { return element(""); }, addEventListener() {}, removeEventListener() {}
  };
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { userAgent: "rem-33-status-fixture", onLine: options.online !== false, vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {}, requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-33-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-33"; }, revokeObjectURL() {} }), URLSearchParams,
    Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  const context = vm.createContext(Object.assign(sandbox, { window: sandbox, self: sandbox, globalThis: sandbox }));
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  return { sandbox, app, localStorage, notificationCalls: () => notificationCalls };
}

function statusInput(extra = {}) {
  return Object.assign({
    nowIso: NOW, localDate: DATE, timezone: "Europe/Istanbul", prayerData: prayerData(),
    locationHash: LOCATION, prayerMethod: "diyanet", permissionState: "granted", configured: true,
    receipt: { status: "accepted" }, online: true
  }, extra);
}

function prayerCandidate(out, occurrenceId = "rem-33-occurrence") {
  const definition = out.sandbox.ReminderCatalogV1.get(PRAYER_ID);
  return {
    occurrence: { reminderId: PRAYER_ID, occurrenceId, localDate: DATE, scheduledAt: "08:45", timezone: "Europe/Istanbul", priority: "P1", triggerType: "prayer-offset", prayerKey: "fajr", due: true, past: false, replay: false, nativeReplay: false },
    definition,
    preference: { reminderId: PRAYER_ID, enabled: true, channel: "native" },
    reminderId: PRAYER_ID,
    due: true
  };
}

runTests([
  ["fresh, stale and unavailable are distinct deterministic capability states", () => {
    const out = boot();
    const fresh = out.sandbox.App.reminderSystemStatus(statusInput());
    assertEqual(fresh.state, "fresh"); assertEqual(fresh.prayerState, "fresh"); assertEqual(fresh.prayerCanGenerate, true);
    assertEqual(fresh.syncState, "synced"); assertEqual(fresh.backgroundState, "unsupported"); assertEqual(fresh.capability.native, "possible");
    const stale = out.sandbox.App.reminderSystemStatus(statusInput({ prayerData: prayerData({ fetchedAt: "2026-08-12T08:00:00.000Z" }) }));
    assertEqual(stale.state, "stale"); assertEqual(stale.prayerState, "stale"); assertEqual(stale.prayerCanGenerate, false); assertEqual(stale.capability.prayerInApp, "blocked");
    const unavailable = out.sandbox.App.reminderSystemStatus(statusInput({ prayerData: prayerData({ times: {} }) }));
    assertEqual(unavailable.state, "unavailable"); assertEqual(unavailable.prayerState, "unavailable"); assertEqual(unavailable.prayerCanGenerate, false);
  }],
  ["permission, offline and recovery states stay separate and private", () => {
    const out = boot();
    const denied = out.sandbox.App.reminderSystemStatus(statusInput({ permissionState: "denied" }));
    assertEqual(denied.permissionState, "denied"); assertEqual(denied.capability.native, "in_app_only");
    const unsupported = out.sandbox.App.reminderSystemStatus(statusInput({ permissionState: "unsupported" }));
    assertEqual(unsupported.permissionState, "unsupported"); assertEqual(unsupported.capability.inApp, "available");
    const temporaryError = out.sandbox.App.reminderSystemStatus(statusInput({ permissionState: "temporary-error" }));
    assertEqual(temporaryError.permissionState, "temporary-error"); assertEqual(temporaryError.capability.native, "in_app_only");
    const pwaLimited = out.sandbox.App.reminderSystemStatus(statusInput({ permissionState: "pwa-limited" }));
    assertEqual(pwaLimited.permissionState, "pwa-limited"); assertEqual(pwaLimited.capability.native, "in_app_only");
    const offline = out.sandbox.App.reminderSystemStatus(statusInput({ online: false }));
    assertEqual(offline.state, "offline"); assertEqual(offline.networkState, "offline"); assertEqual(offline.syncState, "offline"); assertEqual(offline.capability.native, "in_app_only");
    const recovery = out.sandbox.App.reminderSystemStatus(statusInput({ recovery: true }));
    assertEqual(recovery.state, "recovery"); assertEqual(recovery.recoveryState, "recovery");
    const serialized = JSON.stringify(recovery);
    assert(!serialized.includes("ghp_") && !serialized.includes("PRIVATE") && !serialized.includes("http_500"));
  }],
  ["stale prayer data cannot reach in-app or native lifecycle delivery", () => {
    const out = boot();
    const candidate = prayerCandidate(out, "rem-33-stale");
    const result = out.sandbox.App.reminderLifecycleEvaluate("manual", {
      nowIso: NOW, timezone: "Europe/Istanbul", visibilityState: "visible", prayerData: prayerData({ fetchedAt: "2026-08-12T08:00:00.000Z" }), occurrences: [candidate]
    });
    assertEqual(result.systemStatus.prayerState, "stale"); assertEqual(result.stalePrayerBlocked, 1); assertEqual(result.results.length, 0);
    assertEqual(result.nativeShownCount, 0); assertEqual(out.sandbox.App.reminderDeliveryEntries(NOW).length, 0); assertEqual(out.notificationCalls(), 0);
  }],
  ["offline delivery remains local and online recovery catches up once without replay", () => {
    const out = boot();
    const candidate = prayerCandidate(out, "rem-33-recovery");
    const offline = out.sandbox.App.reminderLifecycleEvaluate("offline", { nowIso: NOW, offline: true, online: false, timezone: "Europe/Istanbul", visibilityState: "visible", prayerData: prayerData(), occurrences: [candidate] });
    assertEqual(offline.systemStatus.state, "offline"); assertEqual(offline.nativeShownCount, 0); assertEqual(offline.catchUpPerformed, false);
    assertEqual(out.sandbox.App.reminderLifecycleState().recoveryPending, true);
    assertEqual(out.sandbox.App.reminderDeliveryEntries(NOW).length, 1); assertEqual(out.sandbox.App.reminderDeliveryEntries(NOW)[0].channel, "in_app");
    const recovered = out.sandbox.App.reminderLifecycleEvaluate("online", { nowIso: NOW, offline: false, online: true, timezone: "Europe/Istanbul", visibilityState: "visible", prayerData: prayerData(), occurrences: [candidate] });
    assertEqual(recovered.recoveryState, "recovery"); assertEqual(recovered.catchUpPerformed, true); assertEqual(recovered.nativeShownCount, 0);
    assertEqual(out.sandbox.App.reminderLifecycleState().recoveryPending, false);
    const repeated = out.sandbox.App.reminderLifecycleEvaluate("online", { nowIso: NOW, offline: false, online: true, timezone: "Europe/Istanbul", visibilityState: "visible", prayerData: prayerData(), occurrences: [candidate] });
    assertEqual(repeated.recoveryState, "idle"); assertEqual(repeated.catchUpPerformed, false); assertEqual(out.sandbox.App.reminderDeliveryEntries(NOW).length, 1); assertEqual(out.notificationCalls(), 0);
    const offlineAgain = out.sandbox.App.reminderLifecycleEvaluate("offline", { nowIso: NOW, offline: true, online: false, timezone: "Europe/Istanbul", visibilityState: "visible", prayerData: prayerData(), occurrences: [candidate] });
    assertEqual(offlineAgain.systemStatus.state, "offline"); assertEqual(out.sandbox.App.reminderLifecycleState().recoveryPending, true);
    const recoveredAgain = out.sandbox.App.reminderLifecycleEvaluate("online", { nowIso: NOW, offline: false, online: true, timezone: "Europe/Istanbul", visibilityState: "visible", prayerData: prayerData(), occurrences: [candidate] });
    assertEqual(recoveredAgain.recoveryState, "recovery"); assertEqual(recoveredAgain.catchUpPerformed, true); assertEqual(out.sandbox.App.reminderLifecycleState().recoveryPending, false);
    assertEqual(out.sandbox.App.reminderDeliveryEntries(NOW).length, 1); assertEqual(out.notificationCalls(), 0);
  }],
  ["sync pending/error and background limits are actionable without raw error or token", () => {
    const seed = baseState({ settings: Object.assign({}, baseState().settings, { ghToken: "synthetic-token", ghRepo: "fixture/repo" }), syncReceipt: { status: "error", lastErrorCode: "network", lastErrorDetail: "http_500" } });
    const out = boot(seed);
    const pending = out.sandbox.App.reminderSystemStatus(statusInput({ receipt: { status: "queued" } }));
    assertEqual(pending.syncState, "pending"); assertEqual(pending.capability.inApp, "available");
    const error = out.sandbox.App.reminderSystemStatus(statusInput({ receipt: { status: "error", lastErrorCode: "network", lastErrorDetail: "http_500" } }));
    assertEqual(error.syncState, "error"); assertEqual(error.capability.inApp, "available");
    out.sandbox.App.go("ayarlar"); out.sandbox.App.openReminderCenter();
    const html = out.app.innerHTML;
    assert(html.includes("Ne mümkün, ne bekliyor?")); assert(html.includes("Senkron tamamlanamadı")); assert(html.includes("Arka plan zamanlaması garanti değil"));
    assert(html.includes('data-reminder-system-state="unavailable"')); assert(html.includes('aria-live="polite"'));
    assert(!html.includes("synthetic-token") && !html.includes("http_500") && !html.includes("PRIVATE"));
  }]
]);
