"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DATE = "2026-08-13";
const PRAYER_ID = "reminder.catalog.v1.prayer";
const ZIKR_ID = "reminder.catalog.v1.zikr";
const THERAPY_ID = "reminder.catalog.v1.therapy";

function fixtureElement(id) {
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

function baseState(reminders) {
  return {
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {},
    notifications: [{ id: "observer-fixture", kind: "observer", message: "observer-safe" }],
    luna: { qa: [] }, aeon: { qa: [] }, reminders: reminders || { schemaVersion: 1, preferences: {} },
    settings: { nickname: "REM-06 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto", auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: "2026-08-13T08:00:00.000Z" } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function richState() {
  return baseState({
    schemaVersion: 1,
    profile: "balanced",
    onboarding: { completed: true, selectedCategories: ["ritual"] },
    preferences: {
      [PRAYER_ID]: { reminderId: PRAYER_ID, enabled: false, privacyMode: "private", channel: "native", futurePreference: { keep: true } },
      [ZIKR_ID]: { reminderId: ZIKR_ID, enabled: true, privacyMode: "private", channel: "in_app", userChoice: "keep" }
    },
    futureRootField: { keep: true }
  });
}

function boot(seed) {
  const app = fixtureElement("app");
  const root = fixtureElement("root");
  const store = { "seyma-reset-v1": JSON.stringify(seed) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  let permissionRequests = 0;
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  NotificationMock.requestPermission = function requestPermission() { permissionRequests += 1; return Promise.resolve("granted"); };
  const document = {
    hidden: false, body: fixtureElement("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(""); }, createDocumentFragment() { return fixtureElement(""); },
    addEventListener() {}, removeEventListener() {}
  };
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { vibrate() {}, userAgent: "rem-06-profile-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-06-profile-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-06"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {}, Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  return { sandbox, app, root, localStorage, permissionRequests: () => permissionRequests };
}

function openCenter(out) {
  out.sandbox.App.go("ayarlar");
  out.sandbox.App.openReminderCenter();
}

function storedData(out) {
  return JSON.parse(out.localStorage.getItem("seyma-reset-v1"));
}

runTests([
  ["profile merge preserves existing preference fields and unknown root data", () => {
    const out = boot(richState());
    openCenter(out);
    assert(out.app.innerHTML.includes("Sakin"));
    assert(out.app.innerHTML.includes("Dengeli"));
    assert(out.app.innerHTML.includes("Destekleyici"));
    assert(out.app.innerHTML.includes("Ritüel odaklı"));
    assert(out.app.innerHTML.includes("Özel"));
    assert(!out.app.innerHTML.includes("Gün içinde neleri hatırlamamı istersin?"));

    out.sandbox.App.setReminderProfile("supportive");
    const data = storedData(out);
    assertEqual(data.reminders.profile, "supportive");
    assertEqual(data.reminders.preferences[PRAYER_ID].enabled, false);
    assertEqual(data.reminders.preferences[PRAYER_ID].channel, "native");
    assert(data.reminders.preferences[PRAYER_ID].futurePreference.keep === true);
    assertEqual(data.reminders.preferences[ZIKR_ID].enabled, true);
    assertEqual(data.reminders.preferences[ZIKR_ID].channel, "in_app");
    assertEqual(data.reminders.futureRootField.keep, true);
    assertEqual(data.notifications[0].id, "observer-fixture");
    assert(data.reminders.preferences[THERAPY_ID]);
    assertEqual(out.permissionRequests(), 0);
  }],
  ["first setup caps starting categories at three and merges selected suggestions", () => {
    const out = boot(baseState());
    openCenter(out);
    assert(out.app.innerHTML.includes("Gün içinde neleri hatırlamamı istersin?"));
    out.sandbox.App.setReminderProfile("ritual");
    ["ritual", "support", "reflection", "system"].forEach((category) => out.sandbox.App.toggleReminderSetupCategory(category));
    assert(out.app.innerHTML.includes("3/3"));
    out.sandbox.App.confirmReminderSetup();
    const data = storedData(out);
    assertEqual(data.reminders.onboarding.completed, true);
    assertEqual(data.reminders.onboarding.selectedCategories.length, 3);
    assert(!data.reminders.onboarding.selectedCategories.includes("system"));
    [PRAYER_ID, ZIKR_ID, THERAPY_ID].forEach((id) => assert(data.reminders.preferences[id]));
    assertEqual(data.reminders.preferences[PRAYER_ID].enabled, true);
    assertEqual(data.reminders.preferences[THERAPY_ID].enabled, true);
    assertEqual(data.reminders.preferences["reminder.catalog.v1.system"].enabled, false);
    assert(out.app.innerHTML.includes('data-reminder-category-control="ritual"'));
  }],
  ["category toggle and channel choice persist without changing other data", () => {
    const out = boot(richState());
    openCenter(out);
    out.sandbox.App.setReminderCategoryEnabled("support", true);
    out.sandbox.App.setReminderCategoryChannel("support", "native");
    const data = storedData(out);
    assertEqual(data.reminders.preferences[THERAPY_ID].enabled, true);
    assertEqual(data.reminders.preferences[THERAPY_ID].channel, "native");
    assert(data.notifications[0].message === "observer-safe");
    assert(data.reminders.preferences[THERAPY_ID].lastEditedAt);
    assert(out.app.innerHTML.includes('data-reminder-category-control="support"'));
    assert(out.app.innerHTML.includes("Native · izin varsa; uygulama içi yedek açık"));
    assertEqual(out.permissionRequests(), 0);
  }]
]).catch(() => process.exitCode = 1);
