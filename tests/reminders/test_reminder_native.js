"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, createNotificationMock, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");

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
    settings: { nickname: "REM-22 native fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, auth: { rememberMe: true, usernameHash: "fixture-auth", unlockedAt: "2026-08-13T08:00:00.000Z" } },
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
    navigator: { vibrate() {}, standalone: !!opts.pwaLimited, userAgent: "rem-22-native-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
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
  }]
]).catch(() => process.exitCode = 1);
