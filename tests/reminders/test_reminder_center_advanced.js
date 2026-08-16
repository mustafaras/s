"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DATE = "2026-08-16";
const NOW = "2026-08-16T12:34:56.000Z";

function element(id) {
  const attrs = {};
  return {
    id: id || "", _html: "", _text: "", style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
    setAttribute(name, value) { attrs[name] = String(value); }, getAttribute(name) { return attrs[name] || null; },
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; },
    addEventListener() {}, removeEventListener() {}, click() {}, focus() {}, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function baseState() {
  return {
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {},
    notifications: [{ id: "observer-safe", kind: "observer", message: "observer-safe" }],
    luna: { qa: [] }, aeon: { qa: [] },
    reminders: { schemaVersion: 1, profile: "balanced", preferences: {
      "reminder.catalog.v1.prayer": { reminderId: "reminder.catalog.v1.prayer", enabled: true, channel: "native" },
      "reminder.catalog.v1.zikr": { reminderId: "reminder.catalog.v1.zikr", enabled: true, channel: "in_app" }
    } },
    settings: {
      nickname: "REM-32 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "",
      profileAssessmentInactive: true,
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(seed, options) {
  const opts = options || {};
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
  let permissionRequests = 0;
  function NotificationMock() { notificationCalls += 1; }
  NotificationMock.permission = opts.permission || "granted";
  NotificationMock.requestPermission = function requestPermission() {
    permissionRequests += 1;
    return Promise.resolve(NotificationMock.permission);
  };
  const document = {
    hidden: false, body: element("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return element(""); }, createDocumentFragment() { return element(""); },
    addEventListener() {}, removeEventListener() {}
  };
  const sandbox = {
    console, localStorage, document,
    navigator: { userAgent: "rem-32-advanced-fixture", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-32-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-32"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat,
    isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl,
    Notification: NotificationMock
  };
  if (opts.noNotification) delete sandbox.Notification;
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  return {
    sandbox, app, root, localStorage,
    notificationCalls: () => notificationCalls,
    permissionRequests: () => permissionRequests
  };
}

function openCenter(out) {
  out.sandbox.App.go("ayarlar");
  out.sandbox.App.openReminderCenter();
  return out.app.innerHTML;
}

runTests([
  ["center presents one accessible control flow for profile, categories, policy, mute and permission", () => {
    const out = boot(baseState());
    const html = openCenter(out);
    const requiredLabels = ["Profilini seç", "KATEGORİ TERCİHLERİ", "Bugünün modu", "Günlük akış bütçesi", "Native günlük üst sınır", "Düşük öncelik sınırı", "Sessiz saatler", "Bugün tümünü sustur", "Native izin", "Son reminder geçmişi"];
    requiredLabels.forEach((label) => assert(html.includes(label)));
    const extraChecks = ["Kategori override’ları korunur.", 'aria-label="Bugünün reminder modu"', 'aria-label="Sessiz saat başlangıcı"', 'aria-label="Düşük öncelikli native sınırı"'];
    extraChecks.forEach((label) => assert(html.includes(label)));
    assertEqual(out.permissionRequests(), 0);
  }],
  ["global reset and undo preserve an explicit category override", () => {
    const out = boot(baseState());
    openCenter(out);
    out.sandbox.App.setReminderCapacityMode("silent");
    out.sandbox.App.setReminderCategoryChannel("ritual", "native");
    let saved = JSON.parse(out.localStorage.getItem("seyma-reset-v1"));
    const beforeChannel = saved.reminders.preferences["reminder.catalog.v1.prayer"].channel;
    const reset = out.sandbox.App.resetReminderCenter();
    assert(reset.ok && reset.categoryOverridesPreserved);
    saved = JSON.parse(out.localStorage.getItem("seyma-reset-v1"));
    assertEqual(saved.reminders.policy.capacityMode, "balanced");
    assertEqual(saved.reminders.preferences["reminder.catalog.v1.prayer"].channel, beforeChannel);
    assert(out.app.innerHTML.includes("kategori kararların korundu"));
    const undo = out.sandbox.App.undoReminderCenterReset();
    assert(undo.ok);
    saved = JSON.parse(out.localStorage.getItem("seyma-reset-v1"));
    assertEqual(saved.reminders.policy.capacityMode, "silent");
    assertEqual(saved.reminders.preferences["reminder.catalog.v1.prayer"].channel, beforeChannel);
  }],
  ["synthetic test reminder never constructs Notification or writes history/private body", () => {
    const out = boot(baseState());
    openCenter(out);
    const beforeState = out.localStorage.getItem("seyma-reset-v1");
    const beforeHistory = out.localStorage.getItem("seyma-reminder-delivery-v1");
    const result = out.sandbox.App.testReminder();
    assert(result.ok && result.synthetic && result.external === false && result.notificationCreated === false);
    assert(out.app.innerHTML.includes('data-reminder-test="synthetic"'));
    assert(out.app.innerHTML.includes("Gerçek Notification oluşturulmadı"));
    assert(!out.app.innerHTML.includes("privateBody"));
    assertEqual(out.notificationCalls(), 0);
    assertEqual(out.localStorage.getItem("seyma-reset-v1"), beforeState);
    assertEqual(out.localStorage.getItem("seyma-reminder-delivery-v1"), beforeHistory);
    const repeated = out.sandbox.App.testReminder();
    assert(repeated.ok && repeated.notificationCreated === false && repeated.external === false);
    assertEqual(out.notificationCalls(), 0);
  }],
  ["history is metadata-only, short-lived, clearable and undoable", () => {
    const out = boot(baseState());
    openCenter(out);
    out.sandbox.App.reminderDeliveryShow({ occurrenceId: "history-occurrence", channel: "native", now: NOW, nativeBody: "PRIVATE_BODY_FIXTURE" });
    out.sandbox.App.reminderInboxTodayOff("history-occurrence", "reminder.catalog.v1.prayer", { nowIso: NOW });
    assert(out.app.innerHTML.includes("Son reminder geçmişi"));
    assert(out.app.innerHTML.includes("Bugün susturuldu"));
    assert(!out.app.innerHTML.includes("PRIVATE_BODY_FIXTURE"));
    const cleared = out.sandbox.App.clearReminderHistory();
    assert(cleared.ok);
    assertEqual(out.sandbox.App.reminderDeliveryEntries(NOW).length, 0);
    assertEqual(out.sandbox.App.reminderActionState(NOW).entries.length, 0);
    assert(out.app.innerHTML.includes("Henüz geçmiş yok."));
    assert(out.app.innerHTML.includes("Geri al"));
    const undone = out.sandbox.App.undoReminderHistory();
    assert(undone.ok);
    assert(out.sandbox.App.reminderDeliveryEntries(NOW).length >= 1);
    assert(out.sandbox.App.reminderActionState(NOW).entries.length >= 1);
  }],
  ["unsupported permission, disabled and empty states remain honest and accessible", () => {
    const unsupported = boot(baseState(), { noNotification: true });
    let html = openCenter(unsupported);
    assert(html.includes('data-reminder-permission-state="unsupported"'));
    assert(html.includes("Native yerine uygulama içi hatırlatmalar kullanılabilir."));
    unsupported.sandbox.App.setReminderCategoryEnabled("ritual", false);
    assert(unsupported.app.innerHTML.includes("Kapalı"));
    unsupported.sandbox.App.clearReminderHistory();
    unsupported.sandbox.ReminderCatalogV1 = { list() { return []; } };
    html = openCenter(unsupported);
    assert(html.includes("Şimdilik katalogda etkin hatırlatma yok."));
    assert(html.includes('data-reminder-history-state="empty"'));
    assertEqual(unsupported.notificationCalls(), 0);
  }]
]);
