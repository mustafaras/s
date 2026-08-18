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
    settings: { nickname: "REM-51 surface conformance fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto",
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(overrides) {
  const seed = Object.assign(baseState(), overrides || {});
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
    navigator: { vibrate() {}, userAgent: "rem-13-deeplinks-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
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


// ── REM-51 · App surface adapter ve deep-link conformance ──────────────────
// Gorev 1..5'in her biri ayri ayri kanitlanir. Gercek ag, tarayici veya
// seyma-data yazmasi YOKTUR; app.js node:vm icinde calisir.
const LINKS = ["faith", "zikr", "room", "saygi", "reading", "gunluk", "health", "settings"];

const cases = [
  // ── Gorev 1: her tanim icin target / handler / requiredState / backPath ──
  ["every catalog definition resolves to a real tab, bound handler, required state and back path", () => {
    const out = boot();
    const table = out.sandbox.App.reminderSurfaceTable();
    assert(table.length > 0);
    table.forEach((row) => {
      assert(row.reminderId.length > 0);
      assert(LINKS.indexOf(row.deepLink) >= 0);          // katalogda tanimsiz link yok
      assert(row.targetId.length > 0);
      assert(row.kind === "tab" || row.kind === "overlay");
      assert(row.handlerBound === true);                  // handler App'te GERCEKTEN var
      assert(row.requiredState.length > 0);
      assertEqual(row.backPath, "bugun");                 // geri yolu her hedefte tanimli
      assert(Object.prototype.hasOwnProperty.call(row, "surfaceState"));
    });
  }],

  ["the surface table covers every registered deep-link target exactly once per definition", () => {
    const out = boot();
    const table = out.sandbox.App.reminderSurfaceTable();
    const registered = out.sandbox.App.reminderDeepLinkTargets().map((t) => t.deepLink).sort();
    assertEqual(JSON.stringify(registered), JSON.stringify(LINKS.slice().sort()));
    table.forEach((row) => assert(registered.indexOf(row.deepLink) >= 0));
  }],

  // ── Gorev 2: ozellik durumlari AYRI gosterilir, yol kapatilmaz ───────────
  ["healthy state reports ready without inventing an unavailable reason", () => {
    const out = boot({ library: { books: [{ id: "b1", title: "Kitap", status: "reading" }], goal: { dailyPages: 20, yearlyBooks: null } } });
    const state = out.sandbox.App.reminderSurfaceState("reading-library");
    assertEqual(state.state, "ready");
    assertEqual(state.reason, null);
  }],

  ["prayer stale, zikr paused, therapy opt-out, saygi content, reading empty and care disabled are distinct reasons", () => {
    const seen = {};
    // namaz: eski vakit verisi
    seen.prayer = boot({ prayerData: { localDate: "2020-01-01", fetchedAt: "2020-01-01T00:00:00.000Z",
      times: { fajr: "05:00", sunrise: "06:30", dhuhr: "13:00", asr: "16:30", maghrib: "19:45", isha: "21:15" } } })
      .sandbox.App.reminderSurfaceState("prayer-data");
    // zikir: duraklatilmis oturum
    seen.zikr = boot({ zikr: { session: { paused: true, count: 12 } } }).sandbox.App.reminderSurfaceState("zikr-session");
    // terapi: arac secilmemis (opt-out)
    seen.therapy = boot().sandbox.App.reminderSurfaceState("therapy-tool");
    // okuma: kitaplik bos
    seen.reading = boot({ library: { books: [], goal: { dailyPages: 20, yearlyBooks: null } } }).sandbox.App.reminderSurfaceState("reading-library");
    // bakim: ilac programi kurulmamis
    seen.care = boot().sandbox.App.reminderSurfaceState("care-config");

    assertEqual(seen.prayer.state, "degraded");
    assertEqual(seen.prayer.reason, "prayer-data-stale");
    assertEqual(seen.zikr.state, "degraded");
    assertEqual(seen.zikr.reason, "zikr-session-paused");
    assertEqual(seen.therapy.state, "degraded");
    assertEqual(seen.therapy.reason, "therapy-tool-unselected");
    assertEqual(seen.reading.state, "degraded");
    assertEqual(seen.reading.reason, "reading-library-empty");
    assertEqual(seen.care.state, "degraded");
    assertEqual(seen.care.reason, "care-unconfigured");
    // Sebepler BIRBIRINDEN AYRI olmali; tek bir genel "kullanilamiyor" yok.
    const reasons = Object.keys(seen).map((k) => seen[k].reason);
    assertEqual(new Set(reasons).size, reasons.length);
  }],

  ["missing prayer data is reported as unavailable data, not as a stale reading", () => {
    const state = boot().sandbox.App.reminderSurfaceState("prayer-data");
    assertEqual(state.state, "degraded");
    assertEqual(state.reason, "prayer-data-unavailable");
  }],

  ["a degraded feature state still opens its surface (state is shown, the path is not blocked)", () => {
    const out = boot({ library: { books: [], goal: { dailyPages: 20, yearlyBooks: null } } });
    const target = out.sandbox.App.reminderDeepLinkTarget({ reminderId: "reminder.catalog.v1.reading" });
    assertEqual(target.ok, true);                       // yol acik
    assertEqual(target.surfaceState, "degraded");        // ama durum durustce bildiriliyor
    assertEqual(target.unavailableReason, "reading-library-empty");
    assertEqual(target.requiredState, "reading-library");
    assertEqual(target.backPath, "bugun");
  }],

  // ── Gorev 3: acmak completion / streak / habit tick yazmaz ───────────────
  ["opening a reminder target writes no completion, streak or habit tick", () => {
    const out = boot();
    const before = out.sandbox.localStorage.getItem("seyma-reset-v1");
    const target = out.sandbox.App.openReminderTarget({ reminderId: "reminder.catalog.v1.zikr" });
    assertEqual(target.ok, true);
    const after = JSON.parse(out.sandbox.localStorage.getItem("seyma-reset-v1"));
    const previous = JSON.parse(before);
    // Gun kayitlari, streak ve zikir sayaci acilistan ETKILENMEZ.
    assertEqual(JSON.stringify(after.days || {}), JSON.stringify(previous.days || {}));
    assertEqual(JSON.stringify(after.zikr || null), JSON.stringify(previous.zikr || null));
    assertEqual(JSON.stringify(after.library || null), JSON.stringify(previous.library || null));
  }],

  // ── Gorev 4: kullanici eylemi ile reminder onerisi ayri semantik ─────────
  ["a reminder suggestion and a user action are not the same event", () => {
    const out = boot();
    const suggestion = out.sandbox.App.reminderDeepLinkTarget({ reminderId: "reminder.catalog.v1.zikr" });
    assertEqual(suggestion.ok, true);
    // Oneri cozumlemek TEK BASINA hicbir eylem kaydi uretmez.
    const store = JSON.parse(out.sandbox.localStorage.getItem("seyma-reset-v1"));
    const actions = (store.reminders && store.reminders.actions) || [];
    assertEqual(actions.length, 0);
  }],

  // ── Gorev 5: bilinmeyen hedef / handler / flag fail-closed ───────────────
  ["an unknown reminder id fails closed", () => {
    const target = boot().sandbox.App.reminderDeepLinkTarget({ reminderId: "reminder.catalog.v1.__yok__" });
    assertEqual(target.ok, false);
    assertEqual(target.available, false);
    assertEqual(target.reason, "unknown-reminder-target");
    assertEqual(target.kind, "unavailable");
  }],

  ["a mismatched deep link fails closed instead of silently redirecting", () => {
    const target = boot().sandbox.App.reminderDeepLinkTarget({ reminderId: "reminder.catalog.v1.zikr", deepLink: "settings" });
    assertEqual(target.ok, false);
    assertEqual(target.reason, "target-mismatch");
    assertEqual(target.targetId, "");
  }],

  ["a target whose handler is not bound on App fails closed", () => {
    const out = boot();
    const original = out.sandbox.App.openZikr;
    delete out.sandbox.App.openZikr;                     // handler kaybolursa
    const target = out.sandbox.App.reminderDeepLinkTarget({ reminderId: "reminder.catalog.v1.zikr" });
    out.sandbox.App.openZikr = original;
    assertEqual(target.ok, false);
    assertEqual(target.reason, "handler-missing");
    assertEqual(target.kind, "unavailable");             // acilmis gibi davranilmaz
  }],

  ["an unavailable target never leaks a usable handler or tab id", () => {
    const out = boot();
    ["reminder.catalog.v1.__yok__"].forEach((id) => {
      const target = out.sandbox.App.reminderDeepLinkTarget({ reminderId: id });
      assertEqual(target.targetId, "");
      assertEqual(target.handler, "");
    });
  }],

  // ── Sinir: surface teshisi native yuzeye sizmaz (REM-51 gizlilik siniri) ──
  ["surface diagnostics stay in-app and never enter the native delivery copy", () => {
    const out = boot({ library: { books: [], goal: { dailyPages: 20, yearlyBooks: null } } });
    const copy = out.sandbox.App.reminderNativeDeliveryCopy({
      reminderId: "reminder.catalog.v1.reading",
      occurrence: { occurrenceId: "rem-51-native", reminderId: "reminder.catalog.v1.reading", deepLink: "reading", timezone: "Europe/Istanbul" }
    });
    assertEqual(copy.ok, true);
    const text = JSON.stringify(copy);
    ["requiredState", "surfaceState", "unavailableReason", "reading-library-empty", "backPath"].forEach((leak) => assert(!text.includes(leak)));
  }],

  ["no network call is made anywhere in the surface conformance path", () => {
    const out = boot();
    out.sandbox.App.reminderSurfaceTable();
    out.sandbox.App.openReminderTarget({ reminderId: "reminder.catalog.v1.gunluk" });
    assertEqual(out.fetches(), 0);
  }]
];

runTests(cases).catch(() => { process.exitCode = 1; });
