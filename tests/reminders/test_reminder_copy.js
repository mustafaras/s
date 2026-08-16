"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DATE = "2026-08-13";
const SECRET = "PRIVATE_REMINDER_FIXTURE_THERAPY_MED_NOTE_MOOD_PRAYER_TOKEN";

function element(id) {
  return { id: id || "", _html: "", style: { cssText: "", setProperty() {} }, classList: { add() {}, remove() {}, toggle() {} },
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); }, setAttribute() {}, getAttribute() { return null; },
    appendChild() {}, removeChild() {}, addEventListener() {}, removeEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }, focus() {} };
}

function state() {
  return {
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {}, notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {}, medications: [{
      id: "reminder.medication.v1.synthetic", kind: "medication", name: "SENTINEL MEDICATION", privateLabel: "SENTINEL LABEL",
      note: SECRET, time: "08:00", timezone: "Europe/Istanbul", enabled: true, channel: "native"
    }] },
    settings: { nickname: "REM-27 copy fixture", ghToken: SECRET, ghRepo: "private/repo", ghBranch: "main", openaiKey: SECRET, profileAssessmentInactive: true,
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: "2026-08-13T08:00:00.000Z" } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(seed) {
  const app = element("app");
  const root = element("root");
  root.setAttribute = function setAttribute(name, value) { this[name] = String(value); };
  root.getAttribute = function getAttribute(name) { return this[name] || null; };
  const entries = { "seyma-reset-v1": JSON.stringify(seed) };
  const localStorage = { getItem(key) { return entries[key] || null; }, setItem(key, value) { entries[key] = String(value); }, removeItem(key) { delete entries[key]; }, clear() { Object.keys(entries).forEach((key) => delete entries[key]); } };
  let fetches = 0;
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  NotificationMock.requestPermission = function requestPermission() { return Promise.resolve("granted"); };
  const document = { hidden: false, activeElement: null, body: element("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement() { return element(""); }, createDocumentFragment() { return element(""); }, addEventListener() {}, removeEventListener() {} };
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock, navigator: { vibrate() {}, userAgent: "rem-27-copy-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { fetches += 1; return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {}, requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-27-copy-uuid"; } }, URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-27"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file }));
  sandbox.App.start();
  fetches = 0;
  return { sandbox, app, fetches: () => fetches };
}

function assertNoSecret(value) {
  const serialized = JSON.stringify(value);
  assert(!serialized.includes(SECRET));
  assert(!serialized.includes("SENTINEL MEDICATION"));
  assert(!serialized.includes("SENTINEL LABEL"));
  assert(!serialized.includes("SECRET_THERAPY_TEXT"));
}

runTests([
  ["rich synthetic therapy, medication, mood, prayer and note fields never reach native delivery copy", () => {
    const out = boot(state());
    const definitions = out.sandbox.ReminderCatalogV1.list();
    definitions.forEach((definition, index) => {
      const occurrence = {
        occurrenceId: "rem-27-rich-" + index, reminderId: definition.id, deepLink: definition.deepLink, timezone: "Europe/Istanbul",
        therapyText: "SECRET_THERAPY_TEXT", therapyNote: SECRET, medicationName: "SENTINEL MEDICATION", dose: "999 mg",
        mood: "SECRET_MOOD", note: SECRET, prayerName: "SECRET_PRAYER", prayerCompletion: true, personId: SECRET, articleTitle: SECRET,
        privateTitle: SECRET, privateBody: SECRET, nativeTitle: SECRET, nativeBody: SECRET
      };
      if (definition.id === "reminder.catalog.v1.therapy") occurrence.therapyToolId = "breath";
      const copy = out.sandbox.App.reminderNativeDeliveryCopy({ reminderId: definition.id, occurrence });
      assert(copy.ok);
      assertNoSecret(copy);
      assert(copy.title.length > 0 && copy.body.length > 0);
    });
    const medication = out.sandbox.App.reminderNativeDeliveryCopy({
      reminderId: "reminder.medication.v1.synthetic",
      occurrence: { occurrenceId: "rem-27-medication", reminderId: "reminder.medication.v1.synthetic", deepLink: "health", timezone: "Europe/Istanbul", note: SECRET, dose: "999 mg", nativeBody: SECRET }
    });
    assert(medication.ok);
    assertNoSecret(medication);
    assertEqual(medication.title, "Bir küçük hatırlatman hazır");
    assert(medication.body.includes("Seçtiğin saati kontrol etmek"));
  }],
  ["generic native preview remains generic and private fields stay in-app only", () => {
    const out = boot(state());
    const safe = out.sandbox.App.reminderNativeSafeCopy({ definition: out.sandbox.ReminderCatalogV1.get("reminder.catalog.v1.journal"), occurrence: { note: SECRET, mood: "SECRET_MOOD" } });
    assertNoSecret(safe);
    assertEqual(safe.title, "Şeyma’da küçük bir durak hazır");
    assert(safe.body.includes("uygulamayı açıp"));
    const source = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
    assert(source.includes("native title/body, user text, therapy text"));
    assert(source.includes("therapy text,\n// medication detail"));
  }],
  ["center copy is warm, optional and free of shame or clinical-authority language", () => {
    const out = boot(state());
    out.sandbox.App.go("ayarlar");
    out.sandbox.App.openReminderCenter();
    const html = out.app.innerHTML;
    ["başarısız", "kaçırdın", "ceza", "zorundasın", "eksik"].forEach((term) => assert(!html.toLocaleLowerCase("tr-TR").includes(term)));
    ["İstersen", "Kontrol sende", "tıbbi gereklilik iddiası taşımaz", "doz, tedavi veya tıbbi karar önermez"].forEach((term) => assert(html.includes(term)));
  }],
  ["native surface has no sync/network side effect in the synthetic fixture", () => {
    const out = boot(state());
    const before = out.sandbox.App.reminderSyncPayload ? out.sandbox.App.reminderSyncPayload() : null;
    assertNoSecret(before || {});
    assertEqual(out.fetches(), 0);
  }]
]);
