"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DATE = "2026-08-17";
const NOW = "2026-08-17T12:34:56.000Z";

function fixtureElement(id, documentRef) {
  const attrs = {};
  const classes = new Set();
  const element = {
    id: id || "", _html: "", _text: "", style: { cssText: "", overflow: "", overscrollBehavior: "", setProperty() {} },
    classList: {
      add(...tokens) { tokens.forEach((token) => classes.add(token)); },
      remove(...tokens) { tokens.forEach((token) => classes.delete(token)); },
      toggle(token, force) { if (force === true || (force !== false && !classes.has(token))) classes.add(token); else classes.delete(token); return classes.has(token); },
      contains(token) { return classes.has(token); }
    },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 390, clientHeight: 600, scrollHeight: 1800,
    value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
    setAttribute(name, value) { attrs[name] = String(value); }, getAttribute(name) { return attrs[name] || null; },
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; },
    addEventListener() {}, removeEventListener() {}, click() {},
    focus() { if (documentRef) documentRef.activeElement = this; },
    blur() { if (documentRef && documentRef.activeElement === this) documentRef.activeElement = null; },
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
  return element;
}

function baseState() {
  return {
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {}, notifications: [],
    luna: { qa: [] }, aeon: { qa: [] }, reminders: { schemaVersion: 1, preferences: {} },
    settings: { nickname: "REM-48 navigation fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto",
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot() {
  const seed = baseState();
  const registry = {};
  let documentRef;
  function register(element) { if (element && element.id) registry[element.id] = element; return element; }
  const app = register(fixtureElement("app", null));
  const root = register(fixtureElement("root", null));
  const body = register(fixtureElement("body", null));
  const store = { "seyma-reset-v1": JSON.stringify(seed) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; }, clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  function collectIds(html) {
    const ids = new Set();
    const pattern = /\bid=["']([^"']+)["']/g;
    let match;
    while ((match = pattern.exec(html))) ids.add(match[1]);
    ids.forEach((id) => register(fixtureElement(id, documentRef)));
  }
  Object.defineProperty(app, "innerHTML", {
    configurable: true,
    get() { return app._html; },
    set(value) { app._html = String(value); collectIds(app._html); }
  });
  const document = {
    hidden: false, body, documentElement: root, activeElement: null,
    getElementById(id) { return registry[id] || null; },
    querySelector(selector) {
      if (selector === "[data-scroll]") return register(fixtureElement("fixture-main-scroll", documentRef));
      return null;
    }, querySelectorAll() { return []; },
    createElement(id) { return fixtureElement(id || "", documentRef); }, createDocumentFragment() { return fixtureElement("", documentRef); },
    addEventListener() {}, removeEventListener() {}
  };
  documentRef = document;
  const NotificationMock = function NotificationMock() {};
  NotificationMock.permission = "default";
  NotificationMock.requestPermission = function requestPermission() { return Promise.resolve("default"); };
  class DOMParserStub { parseFromString() { return { body: fixtureElement("body", documentRef), querySelector() { return null; }, querySelectorAll() { return []; } }; } }
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { vibrate() {}, userAgent: "rem-48-navigation-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub, fetch() { return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-48-navigation-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-48"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat,
    isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["motivationProgramV2.js", "motivationNarratives.js", "profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  return { sandbox, app, body, document, registry };
}

function openFromSettings(out) {
  out.sandbox.App.go("ayarlar");
  const entry = out.document.getElementById("sey-reminder-settings-entry");
  assert(entry);
  entry.focus();
  out.sandbox.App.openReminderCenter();
  return entry;
}

runTests([
  ["settings owns the Reminder Center entry and opening locks the page", () => {
    const out = boot();
    const entry = openFromSettings(out);
    assert(out.app.innerHTML.includes('id="sey-reminder-overlay"'));
    assert(out.app.innerHTML.includes('id="sey-reminder-scroll"'));
    assert(out.app.innerHTML.includes('aria-modal="true"'));
    assertEqual(out.body.style.overflow, "hidden");
    assertEqual(out.body.style.overscrollBehavior, "none");
    assert(out.body.classList.contains("sey-reminder-body-locked"));
    assertEqual(out.document.activeElement.id, "sey-reminder-screen");
    assert(entry.id === "sey-reminder-settings-entry");
  }],
  ["Escape closes the overlay and returns focus to the Settings entry", () => {
    const out = boot();
    openFromSettings(out);
    let prevented = false;
    out.sandbox.App.onReminderKeydown({ key: "Escape", preventDefault() { prevented = true; } });
    assert(prevented);
    assert(!out.app.innerHTML.includes('id="sey-reminder-overlay"'));
    assertEqual(out.body.style.overflow, "");
    assertEqual(out.body.style.overscrollBehavior, "");
    assert(!out.body.classList.contains("sey-reminder-body-locked"));
    assertEqual(out.document.activeElement.id, "sey-reminder-settings-entry");
  }],
  ["center re-renders keep draft, scroll position and field focus", () => {
    const out = boot();
    openFromSettings(out);
    out.sandbox.App.setReminderMedicationDraftField("name", "Vitamin");
    out.sandbox.App.setReminderMedicationDraftField("note", "Kısa yerel not");
    const scroll = out.document.getElementById("sey-reminder-scroll");
    scroll.scrollTop = 177;
    out.document.getElementById("sey-reminder-medication-note").focus();
    const result = out.sandbox.App.previewReminderSafe("reminder.catalog.v1.prayer");
    assert(result.ok);
    assert(out.app.innerHTML.includes("Kısa yerel not"));
    assertEqual(out.document.getElementById("sey-reminder-scroll").scrollTop, 177);
    assertEqual(out.document.activeElement.id, "sey-reminder-medication-note");
    assert(out.app.innerHTML.includes('id="sey-reminder-overlay"'));
  }],
  ["deep-link opens a real handler while preserving tab, date and draft", () => {
    const out = boot();
    openFromSettings(out);
    out.sandbox.App.go("rapor");
    const result = out.sandbox.App.openReminderTarget({ reminderId: "reminder.catalog.v1.reading" });
    assert(result.ok);
    assert(out.app.innerHTML.includes("Ne okudum?"));
    assert(out.app.innerHTML.includes('aria-label="Rapor" aria-current="page"'));
    assertEqual(out.body.style.overflow, "hidden");
    out.sandbox.App.closeReading();
    assertEqual(out.body.style.overflow, "");
    assertEqual(out.document.activeElement.id, "sey-reminder-settings-entry");
  }],
  ["unavailable targets are explicit and do not invent a parallel route", () => {
    const out = boot();
    openFromSettings(out);
    const result = out.sandbox.App.openReminderTarget({ reminderId: "fixture.unknown", deepLink: "future-surface" });
    assert(!result.ok);
    assertEqual(result.kind, "unavailable");
    assertEqual(result.reason, "unknown-reminder-target");
    assert(out.app.innerHTML.includes("Bu hatırlatmanın hedefi bulunamadı."));
    assert(out.app.innerHTML.includes('id="sey-reminder-overlay"'));
    assert(out.app.innerHTML.includes("Ayarlar"));
  }],
  ["native click and in-app click share the same canonical target contract", () => {
    const out = boot();
    const calls = [];
    const original = out.sandbox.App.openReminderTarget;
    out.sandbox.App.openReminderTarget = (input) => { calls.push(input); return { ok: true }; };
    out.sandbox.App.reminderInboxPrimary("occ-card", "reminder.catalog.v1.reading");
    out.sandbox.App.handleReminderNativeClick({ type: "reminder", occurrenceId: "occ-native", reminderId: "reminder.catalog.v1.reading", deepLink: "reading", action: "open" });
    out.sandbox.App.openReminderTarget = original;
    assertEqual(calls.length, 2);
    const card = out.sandbox.App.reminderDeepLinkTarget(calls[0]);
    const native = out.sandbox.App.reminderDeepLinkTarget(calls[1]);
    assertEqual(card.targetId, native.targetId);
    assertEqual(card.deepLink, native.deepLink);
    assertEqual(card.handler, native.handler);
  }]
]);
