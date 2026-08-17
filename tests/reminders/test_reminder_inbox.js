"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DATE = "2026-08-13";
const NOW = "2026-08-13T12:34:56.000Z";

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
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {},
    notifications: [{ id: "aeon-fixture", kind: "observer", message: "observer-safe" }],
    luna: { qa: [] }, aeon: { qa: [] }, reminders: { schemaVersion: 1, preferences: {} },
    settings: { nickname: "REM-12 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto",
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW } },
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
    removeItem(key) { delete store[key]; }, clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  let fetches = 0;
  let notificationCalls = 0;
  function NotificationMock() { notificationCalls += 1; }
  NotificationMock.permission = "default";
  NotificationMock.requestPermission = function requestPermission() { return Promise.resolve("default"); };
  const document = {
    hidden: false, body: fixtureElement("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(""); }, createDocumentFragment() { return fixtureElement(""); },
    addEventListener() {}, removeEventListener() {}
  };
  class DOMParserStub { parseFromString() { return { body: fixtureElement("body"), querySelector() { return null; }, querySelectorAll() { return []; } }; } }
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { vibrate() {}, userAgent: "rem-12-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub, fetch() { fetches += 1; return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-12-fixture-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-12"; }, revokeObjectURL() {} }),
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
  return { sandbox, app, localStorage, fetches: () => fetches, notificationCalls: () => notificationCalls };
}

function candidate(definition, occurrenceId, extra) {
  return Object.assign({
    occurrence: { occurrenceId, reminderId: definition.id, localDate: DATE, due: true, past: false,
      scheduledAt: "12:00", priority: definition.priority, category: definition.category },
    definition, preference: { enabled: true, channel: "in_app" }
  }, extra || {});
}

const customDefinition = { id: "reminder.fixture.xss", category: "support", priority: "P2",
  privateTitle: "<img src=x onerror=alert(1)>", privateBody: "<script>secret()</script>", defaultChannel: "in_app" };

runTests([
  ["empty state is explicit and accessible", () => {
    const out = boot(baseState());
    const html = out.sandbox.App.reminderInboxCardHTML({ occurrences: [], nowIso: NOW, timezone: "Europe/Istanbul" });
    assert(html.includes('data-reminder-inbox-state="empty"'));
    assert(html.includes('class="sey-reminder-inbox-empty" role="status"'));
    assert(html.includes("Şimdilik boş"));
    assert(html.includes("Kalan öneri"));
    assertEqual((html.match(/class="sey-reminder-inbox-item/g) || []).length, 0);
  }],
  ["single state exposes private card content and usable actions", () => {
    const out = boot(baseState());
    const def = out.sandbox.ReminderCatalogV1.get("reminder.catalog.v1.therapy");
    const html = out.sandbox.App.reminderInboxCardHTML({ occurrences: [candidate(def, "therapy-1")], nowIso: NOW, timezone: "Europe/Istanbul" });
    assert(html.includes('data-reminder-inbox-state="active"'));
    assert(html.includes(def.privateTitle));
    assert(html.includes(def.privateBody));
    assert(html.includes("Destek ve nefes"));
    assert(html.includes("Bu durağı aç"));
    assert(html.includes("Diğer seçenekler"));
    assert(html.includes("Ertele"));
    assert(html.includes("Bugün sustur"));
    assert(html.includes("Kapat"));
    assert(html.includes(">1</strong><span>Kalan öneri"));
    const view = out.sandbox.App.reminderInboxItems({ occurrences: [candidate(def, "therapy-1")], nowIso: NOW, timezone: "Europe/Istanbul" });
    assertEqual(view.timezone, "Europe/Istanbul");
    assertEqual(view.active.length, 1);
  }],
  ["grouped state keeps P1 user-created before ritual and discovery", () => {
    const out = boot(baseState());
    const p1 = Object.assign({}, customDefinition, { id: "fixture.user", privateTitle: "Kişisel küçük adım", privateBody: "İstersen kendi adımını aç." });
    const ritual = Object.assign({}, customDefinition, { id: "fixture.ritual", category: "ritual", priority: "P2", privateTitle: "Ritüel durağı", privateBody: "Kısa bir ritüel alanı." });
    const discovery = Object.assign({}, customDefinition, { id: "fixture.discovery", category: "discovery", priority: "P3", privateTitle: "Yeni bir keşif", privateBody: "İstersen merak ettiğin alana bak." });
    const input = { occurrences: [candidate(discovery, "d"), candidate(ritual, "r"), Object.assign(candidate(p1, "p"), { userCreated: true, priority: "P1" })], nowIso: NOW, timezone: "Europe/Istanbul" };
    const html = out.sandbox.App.reminderInboxCardHTML(input);
    assert(html.includes('data-reminder-inbox-state="active"'));
    assert(html.includes("3 öneri"));
    assert(html.indexOf("Kişisel küçük adım") < html.indexOf("Ritüel durağı"));
    assert(html.indexOf("Ritüel durağı") < html.indexOf("Yeni bir keşif"));
    assert((html.match(/class="sey-reminder-inbox-item/g) || []).length >= 3);
  }],
  ["suppressed state stays calm and does not replay a historical occurrence", () => {
    const out = boot(baseState());
    const def = out.sandbox.ReminderCatalogV1.get("reminder.catalog.v1.prayer");
    const html = out.sandbox.App.reminderInboxCardHTML({ occurrences: [Object.assign(candidate(def, "suppressed-1"), { policy: { suppressed: true, inAppAllowed: false, reason: "quiet-hours-suppressed" } }),
      Object.assign(candidate(def, "old-1"), { occurrence: { occurrenceId: "old-1", reminderId: def.id, localDate: "2026-08-12", due: true, past: true } })], nowIso: NOW, timezone: "Europe/Istanbul" });
    assert(html.includes('data-reminder-inbox-state="suppressed"'));
    assert(html.includes("Bugün biraz daha sakin"));
    assert(html.includes("Sessiz saatlere göre daha sakin tutuldu"));
    assert(!html.includes("kaçırdın"));
    assert(!html.includes("suçluluk"));
    assertEqual((html.match(/data-reminder-inbox-occurrence=/g) || []).length, 0);
  }],
  ["mute is visible, ephemeral and does not touch canonical storage", () => {
    const out = boot(baseState());
    const before = out.localStorage.getItem("seyma-reset-v1");
    out.sandbox.App.reminderInboxMuteToday();
    const html = out.app.innerHTML;
    assert(html.includes('data-reminder-inbox-state="muted"'));
    assert(html.includes("Bugün susturuldu"));
    assert(html.includes(">0</strong><span>Kalan öneri"));
    assertEqual(out.localStorage.getItem("seyma-reset-v1"), before);
    assert(deepEqual(JSON.parse(before).reminders, JSON.parse(out.localStorage.getItem("seyma-reset-v1")).reminders));
  }],
  ["user reminder text is escaped and no native/network boundary is crossed", () => {
    const out = boot(baseState());
    const html = out.sandbox.App.reminderInboxCardHTML({ definitions: [customDefinition], occurrences: [candidate(customDefinition, "xss-\"-<img>")], nowIso: NOW, timezone: "Europe/Istanbul" });
    assert(html.includes("&lt;img src=x onerror=alert(1)&gt;"));
    assert(html.includes("&lt;script&gt;secret()&lt;/script&gt;"));
    assert(!html.includes("<img src=x onerror=alert(1)>"));
    assert(!html.includes("<script>secret()</script>"));
    assert(!html.includes("Notification("));
    assertEqual(out.fetches(), 0);
    assertEqual(out.notificationCalls(), 0);
  }]
]);
