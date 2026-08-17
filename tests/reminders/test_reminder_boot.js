"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const INDEX = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const APP_SOURCE = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const CATALOG_SOURCE = fs.readFileSync(path.join(ROOT, "app/core/reminderCatalog.js"), "utf8");
const CONSTANTS_SOURCE = fs.readFileSync(path.join(ROOT, "app/core/constants.js"), "utf8");

function fixtureElement(id, htmlState) {
  const attrs = {};
  return {
    id: id || "",
    _html: "",
    style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; },
    set innerHTML(value) { this._html = String(value); if (id === "app" && htmlState) htmlState.value = this._html; },
    get textContent() { return this._html; },
    set textContent(value) { this._html = String(value); },
    setAttribute(name, value) { attrs[name] = String(value); },
    getAttribute(name) { return attrs[name] || null; },
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; },
    addEventListener() {}, removeEventListener() {}, click() {}, focus() {}, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function stateSeed() {
  return {
    version: 2,
    startDate: "2026-08-13",
    lastOpenedDate: "2026-08-13",
    days: {},
    notifications: [],
    luna: { qa: [] },
    aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {} },
    settings: {
      nickname: "REM-44 seeded fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "",
      profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto",
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: "2026-08-13T08:00:00.000Z" }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot({ catalog = true, seed = null } = {}) {
  const htmlState = { value: "" };
  const app = fixtureElement("app", htmlState);
  const root = fixtureElement("root");
  const store = seed ? { "seyma-reset-v1": JSON.stringify(seed) } : {};
  let fetchCalls = 0;
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  NotificationMock.requestPermission = () => Promise.resolve("granted");
  const document = {
    hidden: false,
    body: fixtureElement("body"),
    documentElement: root,
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
    navigator: {
      userAgent: "rem-44-boot-fixture", vibrate() {},
      clipboard: { writeText() { return Promise.resolve(); } },
      geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition() { return 1; }, clearWatch() {} }
    },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { fetchCalls += 1; return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-44-boot-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-44"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat,
    isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), context, { filename: file });
  });
  if (catalog) vm.runInContext(CATALOG_SOURCE, context, { filename: "app/core/reminderCatalog.js" });
  vm.runInContext(APP_SOURCE, context, { filename: "app.js" });
  return { sandbox, app, html: () => htmlState.value, fetchCalls: () => fetchCalls };
}

function scriptSources() {
  return [...INDEX.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((match) => match[1]);
}

const cases = [
  ["classic script order and owners are explicit", () => {
    const scripts = scriptSources();
    const indexOf = (needle) => scripts.findIndex((src) => src.startsWith(needle));
    const constantsIndex = indexOf("app/core/constants.js?");
    const catalogIndex = indexOf("app/core/reminderCatalog.js?");
    const appIndex = indexOf("app.js?");
    const syncIndex = indexOf("sync.js?");
    assert(constantsIndex >= 0 && catalogIndex >= 0 && appIndex >= 0 && syncIndex >= 0);
    assert(constantsIndex < appIndex);
    assert(catalogIndex < appIndex);
    assert(appIndex < syncIndex);
    assertEqual(scripts[constantsIndex].split("?")[0], "app/core/constants.js");
    assertEqual(scripts[catalogIndex].split("?")[0], "app/core/reminderCatalog.js");
    assertEqual(scripts[appIndex].split("?")[0], "app.js");
    assertEqual(scripts[syncIndex].split("?")[0], "sync.js");
    [scripts[constantsIndex], scripts[catalogIndex], scripts[appIndex], scripts[syncIndex]].forEach((src) => assert(/\?v=[^&\s]+$/.test(src)));
  }],
  ["clean boot exposes isolated constants, catalog and App adapters", () => {
    const out = boot();
    assert(out.html().length > 200);
    assert(out.sandbox.SeymaConstants && typeof out.sandbox.SeymaConstants.KEY === "string");
    assert(out.sandbox.ReminderCatalogV1 && out.sandbox.ReminderCatalogV1.list().length === 7);
    assert(out.sandbox.App && typeof out.sandbox.App.reminderPolicyForState === "function");
    assert(typeof out.sandbox.App.reminderGenerateOccurrence === "function");
    assert(out.sandbox.App !== out.sandbox.SeymaConstants);
    assert(out.sandbox.App !== out.sandbox.ReminderCatalogV1);
    assert(!out.sandbox.ReminderStateV1 && !out.sandbox.ReminderEngineV1);
  }],
  ["seeded boot remains renderable and adapters are ready after app.js", () => {
    const out = boot({ seed: stateSeed() });
    out.sandbox.App.start();
    assert(out.html().length > 500);
    assert(typeof out.sandbox.App.reminderPolicyForState() === "object");
    assert(typeof out.sandbox.App.reminderGenerateOccurrence === "function");
  }],
  ["missing catalog boot fails safe without throwing or inventing definitions", () => {
    const out = boot({ catalog: false, seed: stateSeed() });
    out.sandbox.App.start();
    assertEqual(typeof out.sandbox.ReminderCatalogV1, "undefined");
    assert(typeof out.sandbox.App.reminderPolicyForState === "function");
    assert(typeof out.sandbox.App.reminderGenerateOccurrence === "function");
    out.sandbox.App.go("ayarlar");
    out.sandbox.App.openReminderCenter();
    assert(out.html().length > 200);
    assert(!/reminder\.catalog\.v1\.[a-z]+/.test(out.html()));
    assertEqual(out.fetchCalls(), 0);
  }],
  ["catalog cannot clobber App or constants namespaces", () => {
    const sandbox = { App: { sentinel: true }, SeymaConstants: { sentinel: true } };
    vm.createContext(sandbox);
    vm.runInContext(CATALOG_SOURCE, sandbox, { filename: "app/core/reminderCatalog.js" });
    assertEqual(sandbox.App.sentinel, true);
    assertEqual(sandbox.SeymaConstants.sentinel, true);
    assert(sandbox.ReminderCatalogV1 && sandbox.ReminderCatalogV1 !== sandbox.App);
  }],
  ["cache-bust covers the adapter assets without adding unrelated modules", () => {
    assert(INDEX.includes('app/core/reminderCatalog.js?v=20260813a'));
    assert(INDEX.includes('app.js?v=20260817a'));
    assert(!INDEX.includes('app/core/reminderState.js'));
    assert(!INDEX.includes('app/core/reminderEngine.js'));
    assert(!APP_SOURCE.includes("window.ReminderStateV1"));
    assert(!APP_SOURCE.includes("window.ReminderEngineV1"));
  }]
];

runTests(cases).catch(() => { process.exitCode = 1; });
