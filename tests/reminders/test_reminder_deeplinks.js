"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

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
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {}, notifications: [],
    luna: { qa: [] }, aeon: { qa: [] }, reminders: { schemaVersion: 1, preferences: {} },
    settings: { nickname: "REM-13 deep-link fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true,
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot() {
  const seed = baseState();
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
    navigator: { vibrate() {}, userAgent: "rem-13-deeplinks-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub, fetch() { fetches += 1; return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-13-deeplink-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-13"; }, revokeObjectURL() {} }),
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
  fetches = 0;
  return { sandbox, app, fetches: () => fetches, notificationCalls: () => notificationCalls };
}

const targets = [
  ["reminder.catalog.v1.prayer", "faith", "faithOpen", true],
  ["reminder.catalog.v1.zikr", "zikr", "zikrOpen", true],
  ["reminder.catalog.v1.therapy", "room", "roomOpen", true],
  ["reminder.catalog.v1.saygi", "saygi", "tab", "saygi"],
  ["reminder.catalog.v1.reading", "reading", "readingOpen", true],
  ["reminder.catalog.v1.journal", "gunluk", "journalOpen", true],
  ["reminder.catalog.v1.system", "settings", "tab", "ayarlar"]
];

runTests([
  ["catalogue maps every REM-13 target through one allowlisted contract", () => {
    const out = boot();
    targets.forEach(([reminderId, deepLink, targetId]) => {
      const target = out.sandbox.App.reminderDeepLinkTarget({ reminderId });
      assert(target.ok);
      assertEqual(target.deepLink, deepLink);
      assertEqual(target.targetId, deepLink === "settings" ? "ayarlar" : deepLink === "saygi" ? "saygi" : deepLink);
      assert(out.sandbox.App.reminderDeepLinkTargets().some((item) => item.deepLink === deepLink));
    });
    assert(!out.sandbox.App.reminderDeepLinkTarget({ reminderId: "reminder.catalog.v1.prayer", deepLink: "settings" }).ok);
    assert(!out.sandbox.App.reminderDeepLinkTarget({ reminderId: "reminder.catalog.v1.therapy", deepLink: "javascript:alert(1)" }).ok);
    assert(!out.sandbox.App.reminderDeepLinkTarget({ reminderId: "fixture.unknown" }).ok);
  }],
  ["in-app card click and native click resolve the same target input", () => {
    const out = boot();
    const prayer = "reminder.catalog.v1.prayer";
    const calls = [];
    const original = out.sandbox.App.openReminderTarget;
    out.sandbox.App.openReminderTarget = (input) => { calls.push(input); return { ok: true }; };
    out.sandbox.App.reminderInboxPrimary("occ-card", prayer);
    out.sandbox.App.handleReminderNativeClick({ occurrenceId: "occ-native", reminderId: prayer, deepLink: "faith" });
    out.sandbox.App.openReminderTarget = original;
    assertEqual(calls.length, 2);
    const cardTarget = out.sandbox.App.reminderDeepLinkTarget(calls[0]);
    const nativeTarget = out.sandbox.App.reminderDeepLinkTarget(calls[1]);
    assertEqual(cardTarget.deepLink, nativeTarget.deepLink);
    assertEqual(cardTarget.targetId, nativeTarget.targetId);
    assertEqual(cardTarget.kind, nativeTarget.kind);
  }],
  ["target execution opens the intended tab or overlay without native/network work", () => {
    const markers = {
      "reminder.catalog.v1.prayer": "sey-faith-ov-back",
      "reminder.catalog.v1.zikr": "id=\"zikr-overlay\"",
      "reminder.catalog.v1.therapy": "id=\"sey-room-overlay\"",
      "reminder.catalog.v1.saygi": "İlham &amp; İbadet",
      "reminder.catalog.v1.reading": "Ne okudum?",
      "reminder.catalog.v1.journal": "id=\"sey-journal-text\"",
      "reminder.catalog.v1.system": "Ayarlar"
    };
    targets.forEach(([reminderId]) => {
      const out = boot();
      const result = out.sandbox.App.openReminderTarget({ reminderId });
      assert(result.ok);
      assert(out.app.innerHTML.includes(markers[reminderId]));
      assertEqual(out.fetches(), 0);
      assertEqual(out.notificationCalls(), 0);
    });
  }],
  ["native open payload requires an occurrence and preserves the allowlisted target", () => {
    const out = boot();
    const calls = [];
    const original = out.sandbox.App.openReminderTarget;
    out.sandbox.App.openReminderTarget = (input) => { calls.push(input); return { ok: true }; };
    const result = out.sandbox.App.handleReminderNativeClick({
      type: "reminder", occurrenceId: "rem-native-click-1", reminderId: "reminder.catalog.v1.prayer", deepLink: "faith", action: "open"
    });
    out.sandbox.App.openReminderTarget = original;
    assert(result.ok);
    assertEqual(calls.length, 1);
    assertEqual(calls[0].deepLink, "faith");
    assertEqual(calls[0].occurrenceId, "rem-native-click-1");
    assert(!out.sandbox.App.handleReminderNativeClick({ reminderId: "reminder.catalog.v1.prayer", deepLink: "faith", action: "open" }).ok);
    assert(!out.sandbox.App.handleReminderNativeClick({ occurrenceId: "rem-native-click-2", reminderId: "reminder.catalog.v1.prayer", deepLink: "settings", action: "open" }).ok);
  }],
  ["native snooze and mute actions route to the local action contract without opening a wrong target", () => {
    const snooze = boot();
    let snoozeOpened = 0;
    snooze.sandbox.App.openReminderTarget = () => { snoozeOpened += 1; return { ok: true }; };
    const snoozeResult = snooze.sandbox.App.handleReminderNativeClick({
      type: "reminder", occurrenceId: "rem-native-snooze-1", reminderId: "reminder.catalog.v1.prayer", deepLink: "faith", action: "snooze", snoozeOption: "10m"
    });
    assert(snoozeResult.ok);
    assertEqual(snoozeOpened, 0);
    assert(snoozeResult.action && snoozeResult.action.entry.action === "snooze");
    assertEqual(snoozeResult.action.entry.option, "10m");

    const mute = boot();
    let muteOpened = 0;
    mute.sandbox.App.openReminderTarget = () => { muteOpened += 1; return { ok: true }; };
    const muteResult = mute.sandbox.App.handleReminderNativeClick({
      type: "reminder", occurrenceId: "rem-native-mute-1", reminderId: "reminder.catalog.v1.prayer", deepLink: "faith", action: "mute"
    });
    assert(muteResult.ok);
    assertEqual(muteOpened, 0);
    assert(muteResult.action && muteResult.action.entry.action === "todayOff");
    assertEqual(muteResult.action.entry.reason, "today-muted");
  }],
  ["service worker adapter strips untrusted fields before the existing native click route", () => {
    const out = boot();
    const calls = [];
    const original = out.sandbox.App.handleReminderNativeClick;
    out.sandbox.App.handleReminderNativeClick = (input) => { calls.push(input); return { ok: true }; };
    const result = out.sandbox.App.handleReminderServiceWorkerClick({
      type: "reminder", occurrenceId: "rem-sw-adapter-1", reminderId: "reminder.catalog.v1.prayer",
      deepLink: "faith", targetId: "faith", action: "open", timezone: "Europe/Istanbul",
      body: "PRIVATE_BODY_SECRET", userNote: "PRIVATE_NOTE_SECRET", medicationName: "PRIVATE_MEDICATION_SECRET"
    });
    const invalid = out.sandbox.App.handleReminderServiceWorkerClick({
      type: "reminder", occurrenceId: "rem-sw-adapter-2", reminderId: "reminder.catalog.v1.prayer",
      deepLink: "settings", targetId: "faith", action: "open"
    });
    out.sandbox.App.handleReminderNativeClick = original;
    assert(result.ok);
    assertEqual(calls.length, 1);
    assertEqual(calls[0].deepLink, "faith");
    assertEqual(calls[0].targetId, "faith");
    assert(!JSON.stringify(calls[0]).includes("PRIVATE_BODY_SECRET"));
    assert(!JSON.stringify(calls[0]).includes("PRIVATE_NOTE_SECRET"));
    assert(!JSON.stringify(calls[0]).includes("PRIVATE_MEDICATION_SECRET"));
    assert(!invalid.ok);
  }]
]);
