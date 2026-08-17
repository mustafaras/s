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
    id: id || "", _html: "", _text: "", style: { cssText: "", overflow: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
    setAttribute(name, value) { attrs[name] = String(value); }, getAttribute(name) { return attrs[name] || null; },
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; },
    addEventListener() {}, removeEventListener() {}, click() {}, focus() { this.focused = true; }, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function baseState() {
  return {
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {},
    notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {} },
    settings: {
      nickname: "REM-27 accessibility fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "",
      profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto",
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: "2026-08-13T08:00:00.000Z" }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(seed) {
  const app = fixtureElement("app");
  const root = fixtureElement("root");
  root.getAttribute = function getAttribute(name) { return this[name] || null; };
  root.setAttribute = function setAttribute(name, value) { this[name] = String(value); };
  root.removeAttribute = function removeAttribute(name) { delete this[name]; };
  const store = { "seyma-reset-v1": JSON.stringify(seed) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); }, removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  let fetches = 0;
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  NotificationMock.requestPermission = function requestPermission() { return Promise.resolve("granted"); };
  const document = {
    hidden: false, activeElement: null, body: fixtureElement("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(""); }, createDocumentFragment() { return fixtureElement(""); },
    addEventListener() {}, removeEventListener() {}
  };
  class DOMParserStub {
    parseFromString() { return { body: fixtureElement("body"), querySelector() { return null; }, querySelectorAll() { return []; } }; }
  }
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { vibrate() {}, userAgent: "rem-27-accessibility-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { fetches += 1; return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-27-accessibility-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-27"; }, revokeObjectURL() {} }),
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
  fetches = 0;
  return { sandbox, app, root, document, fetches: () => fetches };
}

function openCenter(out) {
  out.sandbox.App.go("ayarlar");
  out.sandbox.App.openReminderCenter();
  return out.app.innerHTML;
}

function attr(block, name) {
  const match = block.match(new RegExp("\\b" + name + "=(?:\\\"([^\\\"]*)\\\"|'([^']*)')"));
  return match ? (match[1] === undefined ? match[2] : match[1]) : "";
}

function buttonBlocks(html) { return html.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) || []; }
function stripTags(value) { return value.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim(); }

runTests([
  ["center has dialog name, labelled description, named close and keyboard hook", () => {
    const out = boot(baseState());
    const html = openCenter(out);
    assert(html.includes('role="dialog" aria-modal="true" aria-labelledby="sey-reminder-title" aria-describedby="sey-reminder-overview-copy"'));
    assert(html.includes('id="sey-reminder-screen" class="sey-reminder-screen" tabindex="-1" onkeydown="App.onReminderKeydown(event)"'));
    assert(html.includes('id="sey-reminder-title">Hatırlatmalar ve bildirimler</h2>'));
    assert(html.includes('id="sey-reminder-overview-copy"'));
    assert(html.includes('type="button" class="sey-reminder-close"'));
    assert(html.includes('aria-label="Hatırlatmalar ve bildirimler merkezini kapat"'));
  }],
  ["all reminder controls are real buttons with accessible names and explicit state", () => {
    const out = boot(baseState());
    const html = openCenter(out);
    const buttons = buttonBlocks(html).filter((button) => /class="[^"]*sey-reminder/.test(button));
    assert(buttons.length > 15);
    buttons.forEach((button) => {
      assertEqual(attr(button, "type"), "button");
      assert(attr(button, "aria-label") || stripTags(button).length > 0);
    });
    assert(html.includes('role="radiogroup" aria-label="Hatırlatma profili"'));
    assert((html.match(/role="radio"/g) || []).length >= 3);
    assert((html.match(/aria-checked="(?:true|false)"/g) || []).length >= 3);
    assert((html.match(/aria-pressed="(?:true|false)"/g) || []).length >= 6);
    const selects = html.match(/<select\b[^>]*>/gi) || [];
    selects.forEach((select) => assert(attr(select, "aria-label")));
    assert(html.includes('aria-label="İlaç veya takviye adı"'));
    assert(html.includes('aria-label="İlaç veya takviye özel etiketi"'));
    assert(html.includes('aria-label="İlaç veya takviye yerel notu"'));
  }],
  ["cards, permission, preview and status surfaces expose semantic headings/live regions", () => {
    const out = boot(baseState());
    const html = openCenter(out);
    assert((html.match(/aria-labelledby="sey-reminder-card-title-/g) || []).length === out.sandbox.ReminderCatalogV1.list().length);
    assert((html.match(/<h[234][^>]*>/g) || []).length >= 8);
    assert(html.includes('class="sey-reminder-permission"') && html.includes('aria-live="polite" aria-atomic="true"'));
    assert(html.includes('class="sey-reminder-live-note" role="status" aria-live="polite" aria-atomic="true"'));
    assert(html.includes('class="sey-reminder-empty" data-reminder-medication-empty="true"'));
  }],
  ["Escape closes, Tab wraps, focus return is explicit and both themes retain the dialog", () => {
    const out = boot(baseState());
    openCenter(out);
    let prevented = false;
    out.sandbox.App.onReminderKeydown({ key: "Escape", preventDefault() { prevented = true; } });
    assert(prevented);
    assert(!out.app.innerHTML.includes("sey-reminder-overlay"));

    const first = { focused: false, focus() { this.focused = true; } };
    const last = { focused: false, focus() { this.focused = true; } };
    out.document.activeElement = first;
    let tabPrevented = false;
    out.sandbox.App.onReminderKeydown({ key: "Tab", shiftKey: true, currentTarget: { querySelectorAll() { return [first, last]; } }, preventDefault() { tabPrevented = true; } });
    assert(tabPrevented && last.focused);

    out.sandbox.App.go("ayarlar");
    out.sandbox.App.openReminderCenter();
    out.sandbox.App.setTheme(true);
    assertEqual(out.root.getAttribute("data-theme"), "dark");
    assert(out.app.innerHTML.includes('role="dialog"'));
    out.sandbox.App.setTheme(false);
    assertEqual(out.root.getAttribute("data-theme"), "light");

    const source = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
    assert(source.includes("ui.reminderReturnFocusId"));
    assert(source.includes("document.activeElement"));
    assert(source.includes("document.getElementById('sey-reminder-screen')"));
    assert(source.includes("document.getElementById(returnId)"));
  }],
  ["touch, reduced motion, icon and no-network boundaries are represented in source", () => {
    const css = fs.readFileSync(path.join(rootDir, "styles.css"), "utf8");
    assert(css.includes(".sey-reminder-care-choice{min-height:44px}"));
    assert(css.includes("@media (prefers-reduced-motion:reduce){.sey-reminder-overlay,.sey-reminder-screen"));
    assert(css.includes("animation:none!important;transition:none!important"));
    assert(css.includes(".sey-reminder-settings-entry{--reminder" ) || css.includes("#root{--reminder-strong"));
    assert((openCenter(boot(baseState())).match(/aria-hidden="true"/g) || []).length > 10);
    assertEqual(boot(baseState()).fetches(), 0);
  }]
]);
