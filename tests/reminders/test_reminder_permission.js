"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DATE = "2026-08-13";

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

function state() {
  return {
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {},
    notifications: [{ id: "observer-fixture", kind: "observer", message: "observer-safe" }],
    luna: { qa: [] }, aeon: { qa: [] }, reminders: { schemaVersion: 1, preferences: {} },
    settings: { nickname: "REM-06 permission fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: "2026-08-13T08:00:00.000Z" } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(permission) {
  const app = fixtureElement("app");
  const root = fixtureElement("root");
  const store = { "seyma-reset-v1": JSON.stringify(state()) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  let permissionRequests = 0;
  function NotificationMock() {}
  NotificationMock.permission = permission;
  NotificationMock.requestPermission = function requestPermission() { permissionRequests += 1; return Promise.resolve(permission); };
  const document = {
    hidden: false, body: fixtureElement("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(""); }, createDocumentFragment() { return fixtureElement(""); },
    addEventListener() {}, removeEventListener() {}
  };
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { vibrate() {}, userAgent: "rem-06-permission-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {}, crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-06-permission-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-06"; }, revokeObjectURL() {} }),
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
  return { sandbox, app, permissionRequests: () => permissionRequests };
}

runTests([
  ["all permission states have separate, user-facing explanations without browser access", () => {
    const out = boot("granted");
    const expected = {
      unsupported: ["Desteklenmiyor", "native bildirim sunmuyor"],
      default: ["Henüz sorulmadı", "henüz seçilmedi"],
      granted: ["Verildi", "Native kanal kullanılabilir"],
      denied: ["Reddedildi", "uygulama içi hatırlatmalar açık kalır"],
      "temporary-error": ["Geçici hata", "uygulama içi kart korunur"],
      "pwa-limited": ["PWA sınırlaması", "zamanlama garanti edilemiyor"]
    };
    Object.keys(expected).forEach((state) => {
      assertEqual(out.sandbox.App.reminderPermissionState({ state }), state);
      const explanation = out.sandbox.App.reminderPermissionExplanation(state);
      assertEqual(explanation.state, state);
      assert(explanation.label === expected[state][0]);
      assert(explanation.meaning.includes(expected[state][1]) || explanation.action.includes(expected[state][1]));
    });
    assertEqual(out.sandbox.App.reminderPermissionState({ supported: false }), "unsupported");
    assertEqual(out.sandbox.App.reminderPermissionState({ permission: "default" }), "default");
    assertEqual(out.sandbox.App.reminderPermissionState({ permission: "granted" }), "granted");
    assertEqual(out.sandbox.App.reminderPermissionState({ permission: "denied" }), "denied");
    assertEqual(out.sandbox.App.reminderPermissionState({ temporaryError: true }), "temporary-error");
    assertEqual(out.sandbox.App.reminderPermissionState({ pwaLimited: true, permission: "granted" }), "pwa-limited");
    assertEqual(out.sandbox.App.reminderPermissionState({ permission: "unknown" }), "temporary-error");
  }],
  ["denied permission keeps in-app controls visible and never starts a request loop", () => {
    const out = boot("denied");
    out.sandbox.App.go("ayarlar");
    out.sandbox.App.openReminderCenter();
    assert(out.app.innerHTML.includes('data-reminder-permission-state="denied"'));
    assert(out.app.innerHTML.includes("Tarayıcı izni kapalı"));
    assert(out.app.innerHTML.includes("uygulama içi hatırlatmalar açık kalır"));
    assert(out.app.innerHTML.includes("Uygulama içi"));
    out.sandbox.App.setReminderCategoryChannel("ritual", "native");
    out.sandbox.App.setReminderCategoryEnabled("ritual", true);
    assert(out.app.innerHTML.includes("kartlar reddedilen izinde açık kalır"));
    assertEqual(out.permissionRequests(), 0);
  }],
  ["REM-06 permission explanation block contains no permission request call", () => {
    const source = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
    const start = source.indexOf("function reminderPermissionState");
    const end = source.indexOf("function validReminderTime", start);
    assert(start >= 0 && end > start);
    assert(!source.slice(start, end).includes("requestPermission"));
    assert(!source.slice(start, end).includes("new Notification"));
  }]
]).catch(() => process.exitCode = 1);
