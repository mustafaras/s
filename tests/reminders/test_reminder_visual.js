"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const css = fs.readFileSync(path.join(rootDir, "styles.css"), "utf8");
const index = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
const visualStart = css.lastIndexOf("/* REM-37: reminder visual system");
const visualBlock = css.slice(visualStart);

function element(id) {
  const attrs = {};
  return {
    id: id || "", _html: "", _text: "", style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
    setAttribute(name, value) { attrs[name] = String(value); this[name] = String(value); },
    getAttribute(name) { return attrs[name] || this[name] || null; },
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
    version: 2, startDate: "2026-08-16", lastOpenedDate: "2026-08-16", days: {},
    notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {} },
    settings: {
      nickname: "REM-37 visual fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "",
      profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto",
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: "2026-08-16T08:00:00.000Z" }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(seed) {
  const app = element("app");
  const root = element("root");
  root.setAttribute("data-theme", "light");
  const store = { "seyma-reset-v1": JSON.stringify(seed || baseState()) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); }, removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  const document = {
    hidden: false, activeElement: null, body: element("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return element(""); }, createDocumentFragment() { return element(""); }, addEventListener() {}, removeEventListener() {}
  };
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  NotificationMock.requestPermission = function requestPermission() { return Promise.resolve("granted"); };
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { vibrate() {}, userAgent: "rem-37-visual-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-37-visual-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-37"; }, revokeObjectURL() {} }),
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
  return { sandbox, app, root };
}

function openCenter(out) {
  out.sandbox.App.go("ayarlar");
  out.sandbox.App.openReminderCenter();
  return out.app.innerHTML;
}

runTests([
  ["REM-37 visual layer defines light/dark semantic tokens and components consume variables", () => {
    assert(visualStart >= 0);
    assert(/#root\{[^\n]*--reminder-status-ok:#[0-9A-F]{6}/.test(visualBlock));
    assert(/#root\[data-theme="dark"\]\{[^\n]*--reminder-status-ok:#[0-9A-F]{6}/.test(visualBlock));
    assert(visualBlock.includes("--reminder-action-ink"));
    const componentLines = visualBlock.split("\n").filter((line) => line && !line.startsWith("#root{" ) && !line.startsWith("#root[data-theme="));
    assert(componentLines.every((line) => !/(?:background|color|border(?:-[^:]+)?):\s*#[0-9A-F]{3,8}/i.test(line)));
  }],
  ["responsive, safe-area, long-copy, focus, touch and reduced-motion contracts are present", () => {
    assert(visualBlock.includes("@media (max-width:460px)"));
    assert(visualBlock.includes("env(safe-area-inset-top)"));
    assert(visualBlock.includes("overflow-wrap:anywhere"));
    assert(visualBlock.includes(":focus-visible"));
    assert(visualBlock.includes("min-height:44px"));
    assert(visualBlock.includes("@media (prefers-reduced-motion:reduce)"));
    assert(visualBlock.includes("animation:none!important"));
    assert(index.includes("styles.css?v=20260817b"));
    assert(index.includes("app.js?v=20260817a"));
  }],
  ["light and dark reminder center renders the same premium hierarchy", () => {
    const out = boot();
    const light = openCenter(out);
    ["sey-reminder-overlay", "sey-reminder-screen", "sey-reminder-header", "sey-reminder-card", "sey-reminder-preview", "sey-reminder-empty"].forEach((className) => assert(light.includes(className)));
    ["sey-reminder-retention", "sey-reminder-retention-metric", "sey-reminder-retention-primary-actions", "sey-reminder-retention-danger"].forEach((className) => assert(light.includes(className)));
    assert(light.includes("role=\"list\" aria-label=\"Hatırlatma saklama özeti\""));
    assert(light.includes("sey-reminder-retention-danger-label"));
    assert(light.includes("Dikkat · yerel temizleme"));
    assert(light.includes("role=\"dialog\""));
    assert(light.includes("uzun Türkçe metin" ) === false);
    out.sandbox.App.setTheme(true);
    const dark = out.app.innerHTML;
    ["sey-reminder-overlay", "sey-reminder-screen", "sey-reminder-header", "sey-reminder-card", "sey-reminder-preview", "sey-reminder-empty"].forEach((className) => assert(dark.includes(className)));
    assertEqual(out.root.getAttribute("data-theme"), "dark");
    out.sandbox.App.setTheme(false);
    assertEqual(out.root.getAttribute("data-theme"), "light");
  }]
]).catch(() => process.exitCode = 1);
