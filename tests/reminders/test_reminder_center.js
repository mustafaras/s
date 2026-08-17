"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepEqual, runTests } = require("./helpers/reminder-test-helper");

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

function baseState() {
  return {
    version: 2,
    startDate: DATE,
    lastOpenedDate: DATE,
    days: {},
    notifications: [{ id: "aeon-fixture", kind: "observer", message: "observer-safe" }],
    luna: { qa: [] },
    aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {} },
    settings: {
      nickname: "REM-05 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "",
      profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto",
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: "2026-08-13T08:00:00.000Z" }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
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
  let fetches = 0;
  let permissionRequests = 0;
  let notificationCalls = 0;
  function NotificationMock() { notificationCalls += 1; }
  // Existing ÆON boot loop is held at an already-resolved permission so this
  // fixture measures only the REM-05 center path.
  NotificationMock.permission = "granted";
  NotificationMock.requestPermission = function requestPermission() {
    permissionRequests += 1;
    return Promise.resolve("default");
  };
  const document = {
    hidden: false, body: fixtureElement("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(""); }, createDocumentFragment() { return fixtureElement(""); },
    addEventListener() {}, removeEventListener() {}
  };
  class DOMParserStub {
    parseFromString() { return { body: fixtureElement("body"), querySelector() { return null; }, querySelectorAll() { return []; } }; }
  }
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { vibrate() {}, userAgent: "rem-05-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { fetches += 1; return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-05-fixture-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-05"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat,
    isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  // App boot's unrelated weather/photo probes are outside REM-05; reset the
  // mocked counter so the center's own no-network boundary is measured.
  fetches = 0;
  return { sandbox, app, root, localStorage, fetches: () => fetches, permissionRequests: () => permissionRequests, notificationCalls: () => notificationCalls };
}

function htmlForCenter(out) {
  out.sandbox.App.go("ayarlar");
  out.sandbox.App.openReminderCenter();
  return out.app.innerHTML;
}

runTests([
  ["normal catalog renders settings entry, summary and every catalog card", () => {
    const out = boot(baseState());
    const html = htmlForCenter(out);
    const definitions = out.sandbox.ReminderCatalogV1.list();
    assert(html.includes("Hatırlatmalar ve bildirimler"));
    assert(html.includes("Bugünün modu"));
    assert(html.includes("Dengeli"));
    assert(html.includes("Kalan öneri"));
    assert(html.includes("Native izin"));
    assert(html.includes("22:30–07:30"));
    assert(html.includes("0 / 3"));
    assert(html.includes("Uygulama içi önizleme/test"));
    assertEqual((html.match(/class="sey-reminder-card"/g) || []).length, definitions.length);
    definitions.forEach((definition) => {
      assert(html.includes('data-reminder-id="' + definition.id + '"'));
      assert(html.includes(definition.privateTitle));
      assert(html.includes(definition.category));
      assert(html.includes(definition.triggerType));
      assert(html.includes(String(definition.priority) + " · Öneri"));
      assert(html.includes(definition.deepLink));
      assert(html.includes("Tanım v" + definition.definitionVersion));
    });
    definitions.forEach((definition) => assert(!html.includes(definition.privateBody)));
    assertEqual(out.permissionRequests(), 0);
    assertEqual(out.notificationCalls(), 0);
    assertEqual(out.fetches(), 0);
  }],
  ["preview is in-app only and exposes private body only after the explicit action", () => {
    const out = boot(baseState());
    htmlForCenter(out);
    const definition = out.sandbox.ReminderCatalogV1.list()[0];
    out.sandbox.App.previewReminder(definition.id);
    const previewHtml = out.app.innerHTML;
    assert(previewHtml.includes("UYGULAMA İÇİ ÖNİZLEME"));
    assert(previewHtml.includes(definition.privateBody));
    assert(previewHtml.includes("native izin, bildirim veya kayıt oluşturmaz"));
    assertEqual(out.permissionRequests(), 0);
    assertEqual(out.notificationCalls(), 0);
    assertEqual(out.fetches(), 0);
  }],
  ["today mute remains ephemeral and does not touch canonical state", () => {
    const out = boot(baseState());
    htmlForCenter(out);
    const before = out.localStorage.getItem("seyma-reset-v1");
    out.sandbox.App.muteReminderToday();
    assert(out.app.innerHTML.includes("Kalan öneri"));
    assert(out.app.innerHTML.includes(">0<"));
    assert(out.app.innerHTML.includes("Bugün susturuldu · geri getir"));
    assertEqual(out.localStorage.getItem("seyma-reset-v1"), before);
    const afterData = JSON.parse(out.localStorage.getItem("seyma-reset-v1"));
    assert(deepEqual(afterData.reminders, JSON.parse(before).reminders));
    assert(!Object.prototype.hasOwnProperty.call(afterData, "reminderDelivery"));
  }],
  ["light and dark render share the same shell and close without persistence", () => {
    const out = boot(baseState());
    htmlForCenter(out);
    out.sandbox.App.setTheme(true);
    assertEqual(out.root.getAttribute("data-theme"), "dark");
    assert(out.app.innerHTML.includes("sey-reminder-overlay"));
    out.sandbox.App.setTheme(false);
    assertEqual(out.root.getAttribute("data-theme"), "light");
    out.sandbox.App.closeReminderCenter();
    assert(!out.app.innerHTML.includes("sey-reminder-overlay"));
  }],
  ["empty catalog is an accessible no-card state", () => {
    const out = boot(baseState());
    out.sandbox.ReminderCatalogV1 = { list() { return []; } };
    const html = htmlForCenter(out);
    assert(html.includes("Şimdilik katalogda etkin hatırlatma yok."));
    assert(html.includes('class="sey-reminder-empty" role="status"'));
    assertEqual((html.match(/class="sey-reminder-card"/g) || []).length, 0);
    assert(html.includes("Native izin"));
    out.sandbox.App.previewReminder();
    assertEqual(out.permissionRequests(), 0);
    assertEqual(out.notificationCalls(), 0);
  }],
  ["accessibility and native boundary are represented in source", () => {
    const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
    const cssSource = fs.readFileSync(path.join(rootDir, "styles.css"), "utf8");
    assert(appSource.includes("App.openReminderCenter"));
    assert(appSource.includes("ReminderCatalogV1"));
    assert(!appSource.includes("REM-05: Notification.requestPermission"));
    assert(cssSource.includes(".sey-reminder-settings-entry:focus-visible"));
    assert(cssSource.includes("env(safe-area-inset-bottom)"));
    assert(cssSource.includes("@media (prefers-reduced-motion:reduce)"));
    assert(cssSource.includes("@media (max-width:390px)"));
  }]
]);
