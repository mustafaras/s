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
    settings: { nickname: "REM-27 copy fixture", ghToken: SECRET, ghRepo: "private/repo", ghBranch: "main", openaiKey: SECRET, profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto",
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
    console, localStorage, document, Notification: NotificationMock, navigator: { vibrate() {}, userAgent: "rem-27-copy-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
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

function stringLeaves(value, pathName, out) {
  const result = out || [];
  if (typeof value === "string") {
    result.push({ path: pathName, value });
    return result;
  }
  if (!value || typeof value !== "object") return result;
  Object.keys(value).forEach((key) => stringLeaves(value[key], pathName ? pathName + "." + key : key, result));
  return result;
}

function hasTurkishOrLatinText(value) {
  return /[A-Za-zÇĞİÖŞÜçğıöşü0-9]/u.test(value);
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
    const safe = out.sandbox.App.reminderNativeSafeCopy({ nativeTitle: SECRET, nativeBody: SECRET, definition: out.sandbox.ReminderCatalogV1.get("reminder.catalog.v1.journal"), occurrence: { note: SECRET, mood: "SECRET_MOOD", nativeTitle: SECRET, nativeBody: SECRET } });
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
  ["canonical lexicon covers private, native, empty, error, permission, stale, snooze, mute and recovery copy", () => {
    const out = boot(state());
    const catalog = out.sandbox.ReminderCatalogV1;
    const required = [
      "private.prayer.title", "private.journal.body", "native.generic.title", "native.medication.body",
      "inApp.empty.digestBody", "inApp.error.nativeBody", "inApp.permission.default.action",
      "inApp.status.overall.stale.detail", "inApp.snooze.30m", "inApp.mute.todayAll", "inApp.recovery.detail"
    ];
    assert(Object.isFrozen(catalog.copy));
    required.forEach((key) => {
      const value = catalog.getCopy(key);
      assert(typeof value === "string" && value.length > 0);
      assertEqual(out.sandbox.App.reminderCopy(key), value);
    });
    catalog.list().forEach((definition) => {
      const shortId = definition.id.split(".").pop();
      assertEqual(definition.privateTitle, catalog.getCopy("private." + shortId + ".title"));
      assertEqual(definition.privateBody, catalog.getCopy("private." + shortId + ".body"));
    });
    const synthetic = out.sandbox.App.testReminder();
    assertEqual(synthetic.copy.title, catalog.getCopy("inApp.preview.syntheticTitle"));
    assertEqual(synthetic.copy.body, catalog.getCopy("inApp.preview.syntheticResultBody"));
    out.sandbox.App.go("ayarlar");
    out.sandbox.App.openReminderCenter();
    assert(out.app.innerHTML.includes(catalog.getCopy("inApp.history.title")));
    assert(out.app.innerHTML.includes(catalog.getCopy("inApp.history.label")));
    stringLeaves(catalog.copy, "").forEach(({ value }) => {
      assert(hasTurkishOrLatinText(value));
      assert(!value.includes("\n"));
      assert(value.length <= 480);
    });
  }],
  ["negative copy suite rejects shame, blame and clinical-authority phrasing", () => {
    const out = boot(state());
    out.sandbox.App.go("ayarlar");
    out.sandbox.App.openReminderCenter();
    const lexiconText = stringLeaves(out.sandbox.ReminderCatalogV1.copy, "").map((entry) => entry.value).join("\n");
    const surfaces = lexiconText + "\n" + out.app.innerHTML;
    ["başarısız", "kaçırdın", "zorundasın", "tedavi et", "normal değilsin", "ceza", "borç", "başaramadın", "ihmal ettin", "yapmalısın"].forEach((term) => {
      assert(!surfaces.toLocaleLowerCase("tr-TR").includes(term));
    });
    const native = [out.sandbox.App.reminderNativeSafeCopy({ nativeTitle: SECRET, nativeBody: SECRET, occurrence: { nativeTitle: SECRET, nativeBody: SECRET, note: SECRET } })];
    out.sandbox.ReminderCatalogV1.list().forEach((definition) => {
      const occurrence = { occurrenceId: "rem-36-negative-" + definition.id, reminderId: definition.id, deepLink: definition.deepLink, timezone: "Europe/Istanbul" };
      if (definition.id === "reminder.catalog.v1.therapy") occurrence.therapyToolId = "breath";
      const copy = out.sandbox.App.reminderNativeDeliveryCopy({ reminderId: definition.id, occurrence });
      assert(copy.ok);
      native.push(copy);
    });
    native.forEach((copy) => {
      const text = JSON.stringify(copy).toLocaleLowerCase("tr-TR");
      ["terapi", "ilaç", "mood", "ibadet", "not", "doz", "tedavi", SECRET.toLocaleLowerCase("tr-TR")].forEach((term) => assert(!text.includes(term)));
    });
  }],
  ["long Turkish copy remains measurable and wrap-safe at the 460px surface boundary", () => {
    const out = boot(state());
    const css = fs.readFileSync(path.join(rootDir, "styles.css"), "utf8");
    assert(css.includes("overflow-wrap:anywhere") || css.includes("overflow-wrap: anywhere"));
    [".sey-reminder-card-copy", ".sey-reminder-system-copy", ".sey-reminder-permission", ".sey-reminder-digest-intro"].forEach((selector) => assert(css.includes(selector)));
    const native = out.sandbox.ReminderCatalogV1.copy.native;
    assert(native.generic.title.length <= 80);
    assert(native.generic.body.length <= 180);
    assert(native.medication.title.length <= 80);
    assert(native.medication.body.length <= 180);
  }],
  ["native surface has no sync/network side effect in the synthetic fixture", () => {
    const out = boot(state());
    const before = out.sandbox.App.reminderSyncPayload ? out.sandbox.App.reminderSyncPayload() : null;
    assertNoSecret(before || {});
    assertEqual(out.fetches(), 0);
  }]
]);
