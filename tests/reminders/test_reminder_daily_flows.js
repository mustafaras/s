"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DATE = "2026-08-16";
const NOW = "2026-08-16T10:30:00.000Z";
const TIMEZONE = "Europe/Istanbul";
const PRIVATE_NOTE = "PRIVATE_DAILY_FLOW_NOTE";

function element(id) {
  return {
    id: id || "", _html: "", _text: "", style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }, dataset: {}, children: [],
    scrollTop: 0, offsetWidth: 0, value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
    setAttribute() {}, getAttribute() { return null; }, appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; }, addEventListener() {}, removeEventListener() {},
    click() {}, focus() {}, blur() {}, querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; }, getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function baseState() {
  return {
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {}, notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    reminders: {
      schemaVersion: 1, preferences: {},
      policy: { quietHours: { start: "22:30", end: "07:30" }, nativeDailyCap: 3, lowPriorityNativeCap: 1, dailyFlowBudget: 2, sameCategoryCooldownMinutes: 0, capacityMode: "balanced" }
    },
    settings: { nickname: "REM-31 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto", auth: { rememberMe: true, usernameHash: "fixture-auth", unlockedAt: NOW } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot() {
  const app = element("app");
  const root = element("root");
  const store = { "seyma-reset-v1": JSON.stringify(baseState()) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  const document = {
    hidden: false, body: element("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return element(""); }, createDocumentFragment() { return element(""); }, addEventListener() {}, removeEventListener() {}
  };
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { userAgent: "rem-31-daily-flow-fixture", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {}, crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-31-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-31"; }, revokeObjectURL() {} }), URLSearchParams,
    Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "saygiPeople.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  return { App: sandbox.App, app, localStorage, sandbox };
}

function candidate(out, id, deepLink, category, priority, time, extra) {
  const definition = out.sandbox.ReminderCatalogV1.get(id) || { id, deepLink, category, priority, defaultChannel: "in_app", definitionVersion: "1", snoozeOptions: ["todayOff"] };
  const occurrence = {
    reminderId: id, occurrenceId: `fixture:${id}:${DATE}:${time}`, localDate: DATE, scheduledAt: time, timezone: TIMEZONE,
    deepLink, category, priority, due: true, past: false, replay: false, nativeReplay: false
  };
  return Object.assign({ occurrence, definition, reminderId: id, preference: { reminderId: id, enabled: true, channel: "in_app" }, detail: PRIVATE_NOTE }, extra || {});
}

function context(localTime, extra) {
  return Object.assign({ localDate: DATE, localTime, nowIso: NOW, timezone: TIMEZONE, capacityMode: "balanced", dailyFlowBudget: 2, nativeDailyCap: 3, permissionState: "granted", quietHours: { start: "22:30", end: "07:30" } }, extra || {});
}

function mixedCandidates(out) {
  return [
    candidate(out, "reminder.catalog.v1.prayer", "faith", "ritual", "P2", "09:00"),
    candidate(out, "reminder.catalog.v1.zikr", "zikr", "ritual", "P2", "09:15", { userSelected: true }),
    candidate(out, "reminder.catalog.v1.reading", "reading", "ritual", "P3", "09:30"),
    candidate(out, "reminder.catalog.v1.journal", "gunluk", "reflection", "P2", "09:45"),
    candidate(out, "reminder.care.v1.water", "health", "care", "P2", "10:00", { careKey: "water" })
  ];
}

function noGuilt(value) {
  const text = JSON.stringify(value).toLocaleLowerCase("tr-TR");
  ["başarısız", "kaçırdın", "zorunlu", "suç", "skor", "hedef"].forEach((word) => assert(!text.includes(word), `low-capacity copy leaked ${word}`));
}

runTests([
  ["one policy selects morning, day, evening and light flow", () => {
    const out = boot();
    assertEqual(out.App.reminderDailyFlowPolicy({ context: context("08:30") }).flowId, "morning");
    assertEqual(out.App.reminderDailyFlowPolicy({ context: context("13:00") }).flowId, "day");
    assertEqual(out.App.reminderDailyFlowPolicy({ context: context("20:00") }).flowId, "evening");
    const light = out.App.reminderDailyFlowPolicy({ context: context("13:00", { capacityMode: "light" }) });
    assertEqual(light.flowId, "light");
    assertEqual(light.maxCandidates, 1);
  }],
  ["ritual, reflection and care candidates coalesce into one bounded flow", () => {
    const out = boot();
    const result = out.App.reminderDailyFlowCoalesce(mixedCandidates(out), context("10:30"));
    assertEqual(result.length, 1);
    assertEqual(result[0].flowId, "morning");
    assertEqual(result[0].occurrence.flowGroup.count, 5);
    assertEqual(result[0].occurrence.coalescedFromCount, 5);
    assertEqual(result[0].occurrence.nativeReplay, false);
    assert(!JSON.stringify(result).includes(PRIVATE_NOTE));
    assert(out.App.reminderDeepLinkTarget({ reminderId: result[0].reminderId, deepLink: result[0].occurrence.deepLink }).ok);
  }],
  ["three daily periods never exceed the common flow budget", () => {
    const out = boot();
    ["08:30", "13:00", "20:00"].forEach((localTime) => {
      const result = out.App.reminderDailyFlowCoalesce(mixedCandidates(out), context(localTime));
      assert(result.length <= 2);
      assert(result.length <= out.App.reminderDailyFlowPolicy({ context: context(localTime) }).candidateBudget);
    });
  }],
  ["light day keeps only an explicit P1 choice and remains optional", () => {
    const out = boot();
    const quiet = out.App.reminderDailyFlowCoalesce(mixedCandidates(out), context("13:00", { capacityMode: "light" }));
    assertEqual(quiet.length, 0);
    const selected = candidate(out, "reminder.light.v1", "room", "support", "P1", "13:00", { userCreated: true, explicitlySelected: true, privateTitle: "Zorunlu hedef skoru", detail: "Başarısız olma, bunu tamamla", preference: { reminderId: "reminder.light.v1", enabled: true, channel: "in_app", userCreated: true, explicitlySelected: true } });
    const result = out.App.reminderDailyFlowCoalesce([selected], context("13:00", { capacityMode: "light" }));
    assertEqual(result.length, 1);
    assertEqual(result[0].flowId, "light");
    noGuilt(result);
    assertEqual(result[0].title, "Bugün tek bir küçük adım yeterli olabilir");
    assert(String(result[0].occurrence.deepLink) === "room");
  }],
  ["app-open, focus, visibility and pageshow share one occurrence", () => {
    const out = boot();
    const occurrences = mixedCandidates(out);
    out.App.reminderDeliveryClear();
    const sources = ["app-open", "focus", "visibilitychange", "pageshow"];
    const results = sources.map((source) => out.App.evaluateReminderLifecycle(source, { nowIso: NOW, visibilityState: "visible", occurrences, context: context("10:30") }));
    assertEqual(results[0].shownCount, 1);
    assert(results.slice(1).every((result) => result.shownCount === 0 && result.duplicateCount >= 1));
    assertEqual(new Set(out.App.reminderDeliveryEntries(NOW).map((entry) => entry.occurrenceId)).size, 1);
  }],
  ["deep-link and now-not exit are safe and idempotent", () => {
    const out = boot();
    const occurrence = out.App.reminderDailyFlowCoalesce(mixedCandidates(out), context("20:00"))[0];
    const items = out.App.reminderInboxItems({ nowIso: NOW, localDate: DATE, occurrences: [occurrence], context: context("20:00") });
    assertEqual(items.active.length, 1);
    assert(items.active[0].deepLink);
    assertEqual(items.active[0].nowNotAction, "todayOff");
    const html = out.App.reminderInboxCardHTML({ nowIso: NOW, localDate: DATE, occurrences: [occurrence], context: context("20:00") });
    assert(html.includes("Şimdi değil"));
    assert(html.includes("data-reminder-inbox-flow=\"evening\""));
    const first = out.App.reminderInboxOverflow(items.active[0].occurrenceId, "nowNot", items.active[0].reminderId);
    const second = out.App.reminderInboxOverflow(items.active[0].occurrenceId, "nowNot", items.active[0].reminderId);
    assert(first.ok); assert(second.ok); assert(second.duplicate === true);
  }]
]);
