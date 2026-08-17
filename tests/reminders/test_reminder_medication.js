"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {
  assert,
  assertEqual,
  deepEqual,
  runTests
} = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const DELIVERY_KEY = "seyma-reminder-delivery-v1";
const ACTION_KEY = "seyma-reminder-actions-v1";
const MED_ID = "reminder.medication.v1.fixture";
const OTHER_ID = "reminder.catalog.v1.other";

function fixtureElement(id) {
  return {
    id: id || "", _html: "", _text: "", style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: "", parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
    setAttribute() {}, getAttribute() { return null; }, appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; },
    addEventListener() {}, removeEventListener() {}, click() {}, focus() {}, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function boot(seed, options) {
  const opts = options || {};
  const counters = { fetches: 0, schedules: 0, lastScheduled: null };
  const app = fixtureElement("app");
  const root = fixtureElement("root");
  const store = Object.assign({}, opts.storageSeed || {}, { "seyma-reset-v1": JSON.stringify(seed) });
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); },
    getJSON(key) { const raw = this.getItem(key); return raw === null ? null : JSON.parse(raw); }
  };
  const document = {
    hidden: false, body: fixtureElement("body"), documentElement: root,
    getElementById(id) { return id === "app" ? app : id === "root" ? root : null; },
    querySelector() { return null; }, querySelectorAll() { return []; }, createElement() { return fixtureElement(""); },
    createDocumentFragment() { return fixtureElement(""); }, addEventListener() {}, removeEventListener() {}
  };
  const sandbox = {
    console, localStorage, document,
    navigator: { vibrate() {}, userAgent: "rem-20-medication", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { counters.fetches += 1; return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-20-fixture-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-20"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat,
    isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  if (opts.withSync) {
    sandbox.SeySync = {
      schedule(payload) { counters.schedules += 1; counters.lastScheduled = JSON.parse(JSON.stringify(payload)); },
      pushNow() { return Promise.resolve(); }
    };
  }
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  try {
    ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app.js"].forEach((file) => {
      vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), context, { filename: file });
    });
    sandbox.App.start();
    return { sandbox, storage: localStorage, counters, data: localStorage.getJSON("seyma-reset-v1"), error: null };
  } catch (error) {
    return { sandbox, storage: localStorage, counters, data: null, error: error && error.message ? error.message : "REMINDER_MEDICATION_FIXTURE_FAILED" };
  }
}

function baseState(extra) {
  return Object.assign({
    version: 2, startDate: "2026-08-15", lastOpenedDate: "2026-08-15", days: {},
    notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    weather: { mode: "live", fetchedAt: new Date().toISOString(), spots: [{ key: "live" }, { key: "ev" }, { key: "is" }], coords: { lat: 39.9334, lng: 32.8597 } },
    settings: { nickname: "REM-20 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto" },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    reminders: { schemaVersion: 1, preferences: {}, medications: [] }
  }, extra || {});
}

function schedule(extra) {
  return Object.assign({
    id: MED_ID, kind: "medication", name: "PRIVATE_MEDICATION_NAME", privateLabel: "PRIVATE_LABEL",
    time: "08:00", note: "PRIVATE_NOTE", timezone: "Europe/Istanbul", enabled: true,
    createdAt: "2026-08-14T10:00:00.000Z", updatedAt: "2026-08-14T10:00:00.000Z"
  }, extra || {});
}

runTests([
  ["normalize applies bounded user fields and drops clinical fields", () => {
    const out = boot(baseState());
    assertEqual(out.error, null);
    const normalized = out.sandbox.App.reminderMedicationNormalize({
      id: MED_ID, kind: "supplement", name: "N".repeat(120), privateLabel: "L".repeat(100),
      time: "08:30", note: "X".repeat(400), dose: "50mg", treatment: "TREATMENT_SECRET", healthText: "HEALTH_SECRET"
    });
    assert(normalized && normalized.name.length === 80 && normalized.privateLabel.length === 60 && normalized.note.length === 240);
    assertEqual(normalized.time, "08:30");
    ["dose", "dosage", "treatment", "interaction", "healthText", "missedDoseAction"].forEach((key) => assert(!Object.prototype.hasOwnProperty.call(normalized, key)));
    assertEqual(out.sandbox.App.reminderMedicationNormalize({ id: MED_ID, name: "", time: "08:30" }), null);
    assertEqual(out.sandbox.App.reminderMedicationNormalize({ id: MED_ID, name: "ok", time: "25:99" }), null);
  }],
  ["migration is additive, local and strips medication aliases from the canonical record", () => {
    const out = boot(baseState({ reminders: {
      schemaVersion: 1, preferences: {}, medicationSchedules: [schedule({ id: MED_ID, dose: "DOSE_SECRET", healthText: "HEALTH_SECRET" })],
      futureReminderField: { keep: true }
    } }));
    assertEqual(out.error, null);
    assertEqual(out.data.reminders.medications.length, 1);
    assertEqual(out.data.reminders.medications[0].name, "PRIVATE_MEDICATION_NAME");
    assert(out.data.reminders.futureReminderField.keep === true);
    assert(!Object.prototype.hasOwnProperty.call(out.data.reminders, "medicationSchedules"));
    assert(!Object.prototype.hasOwnProperty.call(out.data.reminders.medications[0], "dose"));
    assert(!Object.prototype.hasOwnProperty.call(out.data.reminders.medications[0], "healthText"));
  }],
  ["occurrence is user-owned, generic at native boundary and never catch-up advice", () => {
    const out = boot(baseState({ reminders: { schemaVersion: 1, preferences: {}, medications: [schedule()] } }));
    assertEqual(out.error, null);
    const atTime = out.sandbox.App.reminderMedicationOccurrence({ schedule: schedule(), nowIso: "2026-08-15T05:00:00.000Z" });
    assert(atTime.ok && atTime.occurrence.due === true && atTime.occurrence.missed === false);
    const serialized = JSON.stringify(atTime.occurrence);
    ["PRIVATE_MEDICATION_NAME", "PRIVATE_LABEL", "PRIVATE_NOTE", "DOSE_SECRET", "HEALTH_SECRET"].forEach((secret) => assert(!serialized.includes(secret)));
    assert(!serialized.includes("dose"));
    assertEqual(atTime.occurrence.nativeTitle, "Bir küçük hatırlatman hazır");
    assertEqual(atTime.occurrence.nativeBody, "Seçtiğin saati kontrol etmek için Şeyma’yı açabilirsin.");
    const missed = out.sandbox.App.reminderMedicationOccurrence({ schedule: schedule(), nowIso: "2026-08-15T06:00:00.000Z" });
    assert(missed.ok && missed.occurrence.missed === true && missed.occurrence.due === false);
    assert(missed.occurrence.replay === false && missed.occurrence.nativeReplay === false && missed.occurrence.shouldReplay === false);
    const candidates = out.sandbox.App.reminderMedicationLifecycleCandidates({
      root: out.data.reminders, context: { nowIso: "2026-08-15T06:00:00.000Z", localDate: "2026-08-15", localTime: "09:00", timezone: "Europe/Istanbul" }
    });
    assertEqual(candidates.length, 1);
    assertEqual(candidates[0].occurrence.localDate, "2026-08-15");
    assert(candidates[0].occurrence.medicationScheduleId === MED_ID);
  }],
  ["in-app inbox resolves private fields locally while native copy remains generic", () => {
    const out = boot(baseState({ reminders: { schemaVersion: 1, preferences: {}, medications: [schedule()] } }));
    assertEqual(out.error, null);
    const inbox = out.sandbox.App.reminderInboxItems({ nowIso: "2026-08-15T05:00:00.000Z", context: { nowIso: "2026-08-15T05:00:00.000Z", localDate: "2026-08-15", localTime: "08:00", timezone: "Europe/Istanbul" } });
    const item = inbox.items.find((candidate) => candidate.reminderId === MED_ID);
    assert(item && item.title === "PRIVATE_LABEL" && item.detail.includes("PRIVATE_MEDICATION_NAME") && item.detail.includes("PRIVATE_NOTE"));
    const native = out.sandbox.App.reminderMedicationNativeCopy({ name: "PRIVATE_MEDICATION_NAME", note: "PRIVATE_NOTE", dose: "DOSE_SECRET" });
    assert(!JSON.stringify(native).includes("PRIVATE_MEDICATION_NAME") && !JSON.stringify(native).includes("PRIVATE_NOTE") && !JSON.stringify(native).includes("DOSE_SECRET"));
  }],
  ["add, edit and delete are explicit local schedule actions", () => {
    const out = boot(baseState());
    assertEqual(out.error, null);
    out.sandbox.App.openReminderCenter();
    out.sandbox.App.setReminderMedicationDraftField("kind", "supplement");
    out.sandbox.App.setReminderMedicationDraftField("name", "LOCAL_ADD_NAME");
    out.sandbox.App.setReminderMedicationDraftField("privateLabel", "LOCAL_ADD_LABEL");
    out.sandbox.App.setReminderMedicationDraftField("time", "09:15");
    out.sandbox.App.setReminderMedicationDraftField("note", "LOCAL_ADD_NOTE");
    const added = out.sandbox.App.saveReminderMedicationDraft();
    assert(added.ok && added.schedule.id.startsWith("reminder.medication.v1."));
    const id = added.schedule.id;
    assertEqual(out.storage.getJSON("seyma-reset-v1").reminders.medications[0].time, "09:15");
    out.sandbox.App.editReminderMedication(id);
    out.sandbox.App.setReminderMedicationDraftField("time", "10:20");
    out.sandbox.App.setReminderMedicationDraftField("note", "LOCAL_EDIT_NOTE");
    assert(out.sandbox.App.saveReminderMedicationDraft().updated === true);
    const edited = out.storage.getJSON("seyma-reset-v1").reminders.medications[0];
    assertEqual(edited.time, "10:20"); assertEqual(edited.note, "LOCAL_EDIT_NOTE");
    assert(out.sandbox.App.deleteReminderMedication(id).ok);
    assertEqual(out.storage.getJSON("seyma-reset-v1").reminders.medications.length, 0);
  }],
  ["today mute is local and applies only to the selected occurrence", () => {
    const out = boot(baseState({ reminders: { schemaVersion: 1, preferences: {}, medications: [schedule()] } }));
    assertEqual(out.error, null);
    const muted = out.sandbox.App.muteReminderMedicationToday(MED_ID, { nowIso: "2026-08-15T05:00:00.000Z" });
    assert(muted.ok);
    const delivery = out.storage.getJSON(DELIVERY_KEY);
    assert(delivery.entries.some((entry) => entry.status === "suppressed" && entry.reason === "today-muted"));
    const inbox = out.sandbox.App.reminderInboxItems({ nowIso: "2026-08-15T05:00:00.000Z", context: { nowIso: "2026-08-15T05:00:00.000Z", localDate: "2026-08-15", localTime: "08:00", timezone: "Europe/Istanbul" } });
    const item = inbox.items.find((candidate) => candidate.reminderId === MED_ID);
    assert(item && item.suppressed === true);
    const nextDay = out.sandbox.App.reminderMedicationOccurrence({ schedule: schedule(), nowIso: "2026-08-16T05:00:00.000Z" });
    assert(nextDay.ok && nextDay.occurrence.localDate === "2026-08-16");
  }],
  ["retention removes old delivery entries and local clear preserves unrelated reminders", () => {
    const medOccurrence = "reminder-medication-v1:" + encodeURIComponent(MED_ID) + ":2026-08-01:08%3A00:Europe%2FIstanbul";
    const storageSeed = {
      [DELIVERY_KEY]: JSON.stringify({ schemaVersion: 1, entries: [
        { occurrenceId: medOccurrence, status: "shown", channel: "in_app", at: "2026-07-01T05:00:00.000Z" },
        { occurrenceId: "other-occurrence", status: "shown", channel: "in_app", at: "2026-08-14T05:00:00.000Z" }
      ] }),
      [ACTION_KEY]: JSON.stringify({ schemaVersion: 1, entries: [
        { actionId: "med-action", action: "todayOff", reminderId: MED_ID, occurrenceId: medOccurrence, recordedAt: "2026-08-14T05:00:00.000Z", status: "suppressed" },
        { actionId: "other-action", action: "open", reminderId: OTHER_ID, occurrenceId: "other-occurrence", recordedAt: "2026-08-14T05:00:00.000Z", status: "completed" }
      ] })
    };
    const out = boot(baseState({ reminders: { schemaVersion: 1, preferences: {}, medications: [schedule()] } }), { storageSeed });
    assertEqual(out.error, null);
    const retained = out.sandbox.App.reminderMedicationRetention("2026-08-15T05:00:00.000Z");
    assert(retained.entries.some((entry) => entry.occurrenceId === "other-occurrence"));
    assert(!retained.entries.some((entry) => entry.occurrenceId === medOccurrence));
    const cleared = out.sandbox.App.clearReminderMedicationLocal();
    assert(cleared.ok && cleared.cleared === 1);
    assertEqual(out.storage.getJSON("seyma-reset-v1").reminders.medications.length, 0);
    assert(out.storage.getJSON(DELIVERY_KEY).entries.some((entry) => entry.occurrenceId === "other-occurrence"));
    assert(out.storage.getJSON(ACTION_KEY).entries.some((entry) => entry.reminderId === OTHER_ID));
  }],
  ["sync projection omits the entire private reminder root", () => {
    const out = boot(baseState({ reminders: { schemaVersion: 1, preferences: {}, medications: [schedule()] } }), { withSync: true });
    assertEqual(out.error, null);
    out.sandbox.App.saveNow();
    assert(out.counters.lastScheduled && !Object.prototype.hasOwnProperty.call(out.counters.lastScheduled, "reminders"));
    const remoteText = JSON.stringify(out.counters.lastScheduled);
    ["PRIVATE_MEDICATION_NAME", "PRIVATE_LABEL", "PRIVATE_NOTE", "DOSE_SECRET", "HEALTH_SECRET", "REMINDER_MEDICATION_SAFETY"].forEach((secret) => assert(!remoteText.includes(secret)));
    assertEqual(out.counters.fetches, 0);
  }]
]).catch(() => process.exitCode = 1);
