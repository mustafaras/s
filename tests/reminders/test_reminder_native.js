"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, createNotificationMock, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const PRAYER_ID = "reminder.catalog.v1.prayer";
const NOW = "2026-08-13T12:34:56.000Z";

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

function seedState() {
  return {
    version: 2, startDate: "2026-08-13", lastOpenedDate: "2026-08-13", days: {},
    notifications: [], luna: { qa: [] }, aeon: { qa: [] }, reminders: { schemaVersion: 1, preferences: {} },
    settings: { nickname: "REM-22 native fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto", auth: { rememberMe: true, usernameHash: "fixture-auth", unlockedAt: "2026-08-13T08:00:00.000Z" } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(permission, options) {
  const opts = options || {};
  const app = fixtureElement("app");
  const root = fixtureElement("root");
  const notification = createNotificationMock(permission);
  const store = new Map([["seyma-reset-v1", JSON.stringify(seedState())]]);
  const localStorage = {
    getItem(key) { return store.has(String(key)) ? store.get(String(key)) : null; },
    setItem(key, value) { store.set(String(key), String(value)); },
    removeItem(key) { store.delete(String(key)); },
    clear() { store.clear(); }
  };
  const document = {
    hidden: false, body: fixtureElement("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(""); }, createDocumentFragment() { return fixtureElement(""); },
    addEventListener() {}, removeEventListener() {}
  };
  const sandbox = {
    console, localStorage, document, Notification: notification.Notification,
    navigator: { vibrate() {}, standalone: !!opts.pwaLimited, userAgent: "rem-22-native-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: !!opts.pwaLimited, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {}, crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-22-native-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-22"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  return { sandbox, app, storage: localStorage, notification };
}

function candidate(out, occurrenceId, extra) {
  const occurrence = Object.assign({
    occurrenceId,
    reminderId: PRAYER_ID,
    category: "ritual",
    priority: "P2",
    deepLink: "faith",
    localDate: "2026-08-13",
    scheduledAt: "12:00",
    timezone: "Europe/Istanbul",
    definitionVersion: "1.0.0",
    due: true,
    past: false,
    replay: false,
    nativeReplay: false
  }, extra || {});
  return {
    occurrence,
    definition: out.sandbox.ReminderCatalogV1.get(PRAYER_ID),
    preference: { reminderId: PRAYER_ID, enabled: true, channel: "native", privacyMode: "private" },
    reminderId: PRAYER_ID,
    due: true
  };
}

function evaluate(out, item, extra) {
  return out.sandbox.App.evaluateReminders("manual", Object.assign({
    nowIso: NOW,
    visibilityState: "visible",
    catchUp: false,
    context: { localTime: "12:34", timezone: "Europe/Istanbul" },
    occurrences: [item]
  }, extra || {}));
}

runTests([
  ["boot never requests native permission and native channel is explicit", async () => {
    const out = boot("default");
    assertEqual(out.notification.getRequestCount(), 0);
    const change = out.sandbox.App.setReminderCategoryChannel("ritual", "native");
    assert(change && change.ok);
    assertEqual(out.notification.getRequestCount(), 1);
    const request = await change.permissionRequest;
    assert(request.ok);
    assertEqual(request.state, "granted");
  }],
  ["reminder permission does not write the ÆON permission field", async () => {
    const out = boot("default");
    await out.sandbox.App.requestReminderPermission("separation-test");
    const saved = JSON.parse(out.storage.getItem("seyma-reset-v1"));
    assertEqual(saved.settings.aeonNotifyPermission, "");
    assertEqual(JSON.parse(out.storage.getItem("seyma-reminder-permission-v1")).state, "granted");
    assert(out.storage.getItem("seyma-reminder-permission-v1") !== out.storage.getItem("seyma-reset-v1"));
  }],
  ["granted preview uses generic private-safe copy and no ÆON body", () => {
    const out = boot("granted");
    const result = out.sandbox.App.previewReminderNotification();
    assert(result.ok);
    assertEqual(result.copy.title, "Şeyma’da küçük bir durak hazır");
    assert(result.copy.body.includes("uygulamayı açıp"));
    const calls = out.notification.getCalls();
    assertEqual(calls.length, 1);
    assertEqual(calls[0].title, result.copy.title);
    assertEqual(calls[0].options.body, result.copy.body);
    assertEqual(calls[0].options.tag, "reminder-preview-v1");
  }],
  ["denied and PWA-limited preview fall back to in-app without another request", () => {
    const denied = boot("denied");
    denied.sandbox.App.go("ayarlar");
    denied.sandbox.App.openReminderCenter();
    assert(denied.app.innerHTML.includes("data-reminder-permission-help=\"true\""));
    const deniedResult = denied.sandbox.App.previewReminderNotification();
    assert(!deniedResult.ok);
    assert(deniedResult.inAppFallback);
    assertEqual(denied.notification.getRequestCount(), 0);

    const pwa = boot("granted", { pwaLimited: true });
    const pwaResult = pwa.sandbox.App.previewReminderNotification();
    assert(!pwaResult.ok);
    assertEqual(pwaResult.state, "pwa-limited");
    assert(pwaResult.inAppFallback);
  }],
  ["pure evaluator stays display-free; persisted native delivery uses the separate adapter", () => {
    const out = boot("granted");
    const item = candidate(out, "rem-native-pure-1");
    const pure = out.sandbox.App.evaluateRemindersPure({
      nowIso: NOW, visibilityState: "visible", context: { localTime: "12:34", timezone: "Europe/Istanbul", permissionState: "granted" }, occurrences: [item]
    });
    assertEqual(pure.results[0].channel, "native");
    assertEqual(out.notification.getCalls().length, 0);
    const result = evaluate(out, item);
    assert(result.nativeResults && result.nativeResults[0].status === "shown");
    assertEqual(result.nativeShownCount, 1);
    assertEqual(out.notification.getCalls().length, 1);
    const journal = out.sandbox.App.reminderDeliveryGet("rem-native-pure-1", NOW);
    assertEqual(journal.status, "shown");
    assertEqual(journal.channel, "native");
  }],
  ["foreground native payload is private, tagged, actionable and occurrence-bound", () => {
    const out = boot("granted");
    const item = candidate(out, "rem-native-contract-1", { nativeTitle: "PRIVATE TITLE", nativeBody: "PRIVATE BODY" });
    const result = evaluate(out, item);
    const call = out.notification.getCalls()[0];
    assert(result.nativeResults[0].status === "shown");
    assertEqual(call.title, "Küçük bir durak yaklaşırken");
    assert(call.options.body.includes("sakin bir an"));
    assert(!call.options.body.includes("PRIVATE"));
    assert(call.options.tag.startsWith("seyma-reminder-v1:"));
    assertEqual(call.options.renotify, false);
    assertEqual(call.options.data.type, "reminder");
    assertEqual(call.options.data.occurrenceId, "rem-native-contract-1");
    assertEqual(call.options.data.reminderId, PRAYER_ID);
    assertEqual(call.options.data.deepLink, "faith");
    assertEqual(call.options.data.mainAction, "open");
    assertEqual(call.options.data.snoozeAction, "snooze");
    assertEqual(call.options.data.muteAction, "todayOff");
    assertEqual(call.options.actions[0].action, "open");
    assertEqual(call.options.actions[1].action, "snooze");
    assertEqual(call.options.actions[2].action, "todayOff");
    assertEqual(call.options.data.snoozeOption, "10m");
  }],
  ["permission, budget, quiet, visibility and duplicate policy failures never call native", () => {
    const blocked = [
      ["denied", {}, "permission-denied"],
      ["granted", { visibilityState: "hidden" }, "not-visible"],
      ["granted", { context: { localTime: "23:00" } }, "quiet-hours-deferred"],
      ["granted", { context: { nativeDailyCap: 0 } }, "native-daily-cap"]
    ];
    blocked.forEach(([permission, extra, reason]) => {
      const out = boot(permission);
      const result = evaluate(out, candidate(out, `rem-native-block-${reason}`), extra);
      assertEqual(out.notification.getCalls().length, 0);
      assert(result.nativeResults.length === 0);
      assert(result.results[0].reason === reason || result.results[0].policyReason === reason || reason === "not-visible" && result.results[0].reason === "not-visible");
    });
    const duplicate = boot("granted");
    const item = candidate(duplicate, "rem-native-duplicate-1");
    evaluate(duplicate, item);
    const second = evaluate(duplicate, item);
    assertEqual(duplicate.notification.getCalls().length, 1);
    assertEqual(second.nativeResults.length, 0);
    assertEqual(second.results[0].duplicate, true);
  }],
  ["adapter rejects non-foreground and malformed policy without requesting permission", () => {
    const out = boot("granted");
    const item = candidate(out, "rem-native-direct-1");
    const base = { source: "manual", visibilityState: "visible", occurrence: item.occurrence, definition: item.definition, reminderId: PRAYER_ID, policy: { nativeAllowed: true, channel: "native", reason: "native-allowed" } };
    assertEqual(out.sandbox.App.reminderNativeDisplay(Object.assign({}, base, { source: "background" })).reason, "not-foreground");
    assertEqual(out.sandbox.App.reminderNativeDisplay(Object.assign({}, base, { visibilityState: "hidden" })).reason, "not-visible");
    assertEqual(out.sandbox.App.reminderNativeDisplay(Object.assign({}, base, { duplicate: true })).reason, "duplicate");
    assertEqual(out.sandbox.App.reminderNativeDisplay(Object.assign({}, base, { policy: { nativeAllowed: false, channel: "in_app", reason: "native-daily-cap" } })).reason, "daily-budget");
    assertEqual(out.notification.getCalls().length, 0);
  }]
]).catch(() => process.exitCode = 1);
