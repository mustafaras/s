"use strict";

// REM-53 — App local privacy, sanitize ve sync adapter (app tarafı).
//
// This fixture proves the app-side half of the chain:
//
//   localStorage (canonical + local-only journals)
//     -> save / saveLocal
//     -> reminder sync payload gate
//     -> safe event summary
//     -> projection / export summary
//     -> native copy
//
// Each of those five surfaces is a SEPARATE schema with its own storage class,
// sync class and field rule, and each is checked against synthetic private
// fixtures: therapy detail, medication label/note, mood, prayer completion,
// journal, free note, tokens, GPS and a raw notification body.
//
// Runs in node:vm against synthetic state. No browser, no network, no real
// localStorage, no data repo.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, createNotificationMock, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");

const APP_KEY = "seyma-reset-v1";
const DELIVERY_KEY = "seyma-reminder-delivery-v1";
const ACTION_KEY = "seyma-reminder-actions-v1";
const PERMISSION_KEY = "seyma-reminder-permission-v1";
const LOCAL_ONLY_KEYS = [DELIVERY_KEY, ACTION_KEY, PERMISSION_KEY];
const PRAYER_ID = "reminder.catalog.v1.prayer";
const THERAPY_ID = "reminder.catalog.v1.therapy";
const NOW = "2026-08-18T09:34:56.000Z";

// Every one of these is synthetic. None may appear in a synced payload, a safe
// event summary, a projection summary or a native copy.
const PRIVATE = {
  therapy: "SENTETIK_TERAPI_DETAYI",
  medicationLabel: "SENTETIK_ILAC_ETIKETI",
  medicationNote: "SENTETIK_ILAC_NOTU",
  mood: "SENTETIK_RUH_HALI_NOTU",
  prayer: "SENTETIK_NAMAZ_TAMAMLAMA",
  journal: "SENTETIK_GUNLUK_METNI",
  note: "SENTETIK_SERBEST_NOT",
  token: "SENTETIK_GH_TOKEN",
  openaiKey: "SENTETIK_OPENAI_KEY",
  syncUrl: "SENTETIK_SYNC_URL",
  medicationName: "SENTETIK_ILAC_ADI",
  gps: "SENTETIK_GPS_ETIKETI",
  rawBody: "SENTETIK_HAM_BILDIRIM_GOVDESI"
};
const PRIVATE_SAMPLES = Object.keys(PRIVATE).map((key) => PRIVATE[key]);
// GPS and mood/journal are legitimate app-level synced data; only the reminder
// schemas must stay free of them. This is the reminder-scoped sample set.
const REMINDER_SCOPED_SAMPLES = [
  PRIVATE.therapy, PRIVATE.medicationName, PRIVATE.medicationLabel, PRIVATE.medicationNote, PRIVATE.mood,
  PRIVATE.prayer, PRIVATE.journal, PRIVATE.note, PRIVATE.token, PRIVATE.openaiKey,
  PRIVATE.syncUrl, PRIVATE.gps, PRIVATE.rawBody
];

function fixtureElement(id) {
  return {
    id: id || "", _html: "", _text: "", style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: "", files: [], parentNode: null,
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

// A state carrying every negative fixture the prompt requires.
function seedState() {
  return {
    version: 2, startDate: "2026-08-18", lastOpenedDate: "2026-08-18",
    days: {
      "2026-08-18": {
        mood: 3, moodNote: PRIVATE.mood, note: PRIVATE.note,
        journal: PRIVATE.journal, prayerCompletion: PRIVATE.prayer,
        updatedAt: "2026-08-18T08:00:00.000Z"
      }
    },
    location: { lat: 39.9334, lng: 32.8597, acc: 20, label: PRIVATE.gps, ts: "2026-08-18T08:00:00.000Z" },
    locationHistory: [{ lat: 39.9334, lng: 32.8597, label: PRIVATE.gps }],
    notifications: [], luna: { qa: [] }, aeon: { qa: [], shownNotificationIds: [] },
    reminders: {
      schemaVersion: 1,
      preferences: {
        [THERAPY_ID]: {
          reminderId: THERAPY_ID, enabled: true, channel: "in_app", privacyMode: "private",
          privateDetail: PRIVATE.therapy, userNote: PRIVATE.note
        },
        [PRAYER_ID]: { reminderId: PRAYER_ID, enabled: true, channel: "native", privacyMode: "private" }
      },
      medications: [{
        id: "reminder.medication.v1.privacy-fixture", kind: "medication",
        name: PRIVATE.medicationName, privateLabel: PRIVATE.medicationLabel, note: PRIVATE.medicationNote,
        time: "09:00", timezone: "Europe/Istanbul", enabled: true,
        createdAt: "2026-08-18T07:00:00.000Z", updatedAt: "2026-08-18T07:00:00.000Z"
      }]
    },
    settings: {
      nickname: "REM-53 privacy fixture",
      ghToken: PRIVATE.token, ghRepo: "mustafaras/seyma-data", ghBranch: "main",
      openaiKey: PRIVATE.openaiKey, syncUrl: PRIVATE.syncUrl,
      auth: { rememberMe: true, usernameHash: "fixture-auth", token: PRIVATE.token, unlockedAt: "2026-08-18T08:00:00.000Z" },
      aeonNotifyPermission: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto"
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(options) {
  const opts = options || {};
  const app = fixtureElement("app");
  const root = fixtureElement("root");
  const notification = createNotificationMock(opts.permission || "granted");
  const store = new Map([[APP_KEY, JSON.stringify(opts.state || seedState())]]);
  const localStorage = {
    getItem(key) { return store.has(String(key)) ? store.get(String(key)) : null; },
    setItem(key, value) { store.set(String(key), String(value)); },
    removeItem(key) { store.delete(String(key)); },
    clear() { store.clear(); }
  };
  const scheduled = [];
  const sync = {
    schedule(payload) { scheduled.push(JSON.parse(JSON.stringify(payload))); },
    pushNow() { return Promise.resolve(null); },
    statusText() { return "sentetik"; },
    retryIfPending() {}
  };
  const document = {
    hidden: false, body: fixtureElement("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(""); }, createDocumentFragment() { return fixtureElement(""); },
    addEventListener() {}, removeEventListener() {}
  };
  const network = { calls: 0 };
  const sandbox = {
    console, localStorage, document, Notification: notification.Notification,
    navigator: { vibrate() {}, standalone: false, userAgent: "rem-53-privacy-fixture", clipboard: { writeText() { return Promise.resolve(); } } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { network.calls += 1; return Promise.reject(new Error("REM53_NETWORK_MUST_NOT_RUN")); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {}, crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-53-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-53"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  sandbox.SeySync = sync;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app/core/reminderDelivery.js"]
    .forEach((file) => vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file }));
  vm.runInContext(appSource, context, { filename: "app.js" });
  sandbox.App.start();
  return { sandbox, app, storage: localStorage, store, scheduled, notification, network };
}

function candidate(out, occurrenceId, reminderId) {
  const id = reminderId || PRAYER_ID;
  return {
    occurrence: {
      occurrenceId, reminderId: id, category: "ritual", priority: "P2",
      deepLink: id === THERAPY_ID ? "room" : "faith", localDate: "2026-08-18", scheduledAt: "12:00",
      timezone: "Europe/Istanbul", definitionVersion: "1.0.0", due: true, past: false, replay: false, nativeReplay: false,
      nativeBody: PRIVATE.rawBody, detail: PRIVATE.therapy
    },
    definition: out.sandbox.ReminderCatalogV1.get(id),
    preference: { reminderId: id, enabled: true, channel: "native", privacyMode: "private" },
    reminderId: id,
    due: true
  };
}

function evaluate(out, item) {
  return out.sandbox.App.evaluateReminders("manual", {
    nowIso: NOW, visibilityState: "visible", catchUp: false,
    context: { localTime: "12:34", timezone: "Europe/Istanbul" }, occurrences: [item]
  });
}

function noSample(value, samples) {
  const text = JSON.stringify(value === undefined ? null : value);
  return (samples || REMINDER_SCOPED_SAMPLES).every((sample) => text.indexOf(sample) < 0);
}

runTests([
  ["the five reminder surfaces are declared as separate schemas with separate classes", () => {
    const out = boot();
    const schemas = out.sandbox.App.reminderPrivacySchemas();
    const ids = ["localOnlyKey", "canonicalPreference", "safeEventSummary", "projectionSummary", "nativeCopy"];
    ids.forEach((id) => {
      assert(!!schemas[id]);
      assertEqual(schemas[id].id, id);
      assert(typeof schemas[id].storage === "string" && schemas[id].storage.length > 0);
      assertEqual(typeof schemas[id].synced, "boolean");
    });
    // Exactly one of the five may cross the sync boundary, and it is the
    // fixed-string event summary — not the preference, not the journal.
    assertEqual(ids.filter((id) => schemas[id].synced === true).join(","), "safeEventSummary");
    assertEqual(schemas.localOnlyKey.inCanonicalData, false);
    assertEqual(schemas.canonicalPreference.inCanonicalData, true);
    assertEqual(schemas.canonicalPreference.synced, false);
    assertEqual(schemas.canonicalPreference.fieldRule, "additive-local-only");
    assertEqual(schemas.nativeCopy.allowedFields.join(","), "title,body,tag,deepLink");
    assertEqual(schemas.safeEventSummary.fixedSummary, "Bildirim yaşam döngüsü güncellendi");
    assert(schemas.canonicalPreference.blockedSyncRoots.indexOf("reminders") >= 0);

    // The reporter is a real gate, not a rubber stamp.
    assertEqual(out.sandbox.App.reminderPrivacyReport("nope", {}).ok, false);
    assertEqual(out.sandbox.App.reminderPrivacyReport("nativeCopy", { title: "t", body: "b", tag: "x", deepLink: "faith" }).ok, true);
    assertEqual(out.sandbox.App.reminderPrivacyReport("nativeCopy", { title: "t", body: "b", tag: "x", deepLink: "faith", note: PRIVATE.note }).ok, false);
    assertEqual(out.sandbox.App.reminderPrivacyReport("nativeCopy", { title: PRIVATE.therapy, body: "b", tag: "x", deepLink: "faith" }, [PRIVATE.therapy]).ok, false);
  }],

  ["the canonical preference stays on the device and is removed from every sync payload", () => {
    const out = boot();
    // It really is in local canonical state, private fields and all.
    const saved = JSON.parse(out.storage.getItem(APP_KEY));
    assert(JSON.stringify(saved.reminders).indexOf(PRIVATE.therapy) >= 0);
    assert(JSON.stringify(saved.reminders).indexOf(PRIVATE.medicationLabel) >= 0);

    // And it is absent from what the app hands to sync.
    const payload = out.sandbox.App.reminderCurrentSyncPayload();
    assertEqual(payload.reminders, undefined);
    ["delivery", "deliveryLog", "reminderDelivery", "reminderDeliveries", "reminderHistory", "notificationDelivery"].forEach((root) => {
      assertEqual(payload[root], undefined);
    });
    assert(noSample(payload, [PRIVATE.therapy, PRIVATE.medicationName, PRIVATE.medicationLabel, PRIVATE.medicationNote]));

    // Every app path that schedules a sync goes through the same gate.
    out.scheduled.length = 0;
    out.sandbox.App.setReminderEnabled(THERAPY_ID, false);
    assert(out.scheduled.length > 0);
    out.scheduled.forEach((entry) => {
      assertEqual(entry.reminders, undefined);
      assert(noSample(entry, [PRIVATE.therapy, PRIVATE.medicationName, PRIVATE.medicationLabel, PRIVATE.medicationNote]));
    });
    // REM-53 fix: the movement sync path used to hand raw `data` to SeySync.
    assert(appSource.indexOf("function scheduleMoveSync(){ var payload=reminderSyncPayload(data);") > 0);
    assertEqual(appSource.split("SeySync.schedule(data)").length - 1, 0);
  }],

  ["local-only journals never enter canonical data and carry no private content", () => {
    const out = boot();
    evaluate(out, candidate(out, "rem-privacy-journal-1"));
    out.sandbox.App.reminderInboxSnooze("rem-privacy-journal-1", "10m", PRAYER_ID, { nowIso: NOW });

    LOCAL_ONLY_KEYS.forEach((key) => {
      const raw = out.storage.getItem(key);
      if (raw === null) return;
      const parsed = JSON.parse(raw);
      const report = out.sandbox.App.reminderPrivacyReport("localOnlyKey", parsed, REMINDER_SCOPED_SAMPLES);
      assertEqual(report.forbiddenFields.length, 0);
      assertEqual(report.leakedSamples.length, 0);
      assertEqual(report.unexpectedFields.length, 0);
      assertEqual(report.synced, false);
    });

    // None of the three keys leaked into the canonical app state or its payload.
    const saved = JSON.parse(out.storage.getItem(APP_KEY));
    ["delivery", "deliveryLog", "reminderDelivery", "reminderHistory", "notificationDelivery"].forEach((root) => {
      assertEqual(saved[root], undefined);
    });
    assert(JSON.stringify(saved).indexOf("seyma-reminder-v1:") < 0);
    assert(JSON.stringify(saved).indexOf(PRIVATE.rawBody) < 0);
  }],

  ["the only reminder trace that syncs is a fixed summary with a hashed correlation id", () => {
    const out = boot();
    evaluate(out, candidate(out, "rem-privacy-event-1"));
    out.sandbox.App.reminderInboxSnooze("rem-privacy-event-1", "10m", PRAYER_ID, { nowIso: NOW });
    out.sandbox.App.setReminderEnabled(PRAYER_ID, false);

    const payload = out.sandbox.App.reminderCurrentSyncPayload();
    const events = ((payload.eventLog || {}).events || []).filter((event) => String(event.path || "") === "data.reminders");
    assert(events.length > 0);
    events.forEach((event) => {
      assertEqual(event.summary, "Bildirim yaşam döngüsü güncellendi");
      assert(String(event.correlationId).indexOf("reminder-v1:") === 0);
      // The correlation id is a digest, never the occurrence or reminder id.
      assert(String(event.correlationId).indexOf("rem-privacy-event-1") < 0);
      assert(String(event.correlationId).indexOf(PRAYER_ID) < 0);
      assert(noSample(event));
      const report = out.sandbox.App.reminderPrivacyReport("safeEventSummary", { summary: event.summary, correlationId: event.correlationId, section: event.section, path: event.path, operation: event.operation, privacyClass: event.privacyClass }, REMINDER_SCOPED_SAMPLES);
      assertEqual(report.ok, true);
      assertEqual(report.synced, true);
    });
    // Same synthetic key always digests to the same correlation id (dedupe
    // works without carrying identity).
    const again = boot();
    again.sandbox.App.setReminderEnabled(PRAYER_ID, false);
    const firstDigest = events.map((event) => event.correlationId).sort();
    const secondDigest = ((again.sandbox.App.reminderCurrentSyncPayload().eventLog || {}).events || [])
      .filter((event) => String(event.path || "") === "data.reminders").map((event) => event.correlationId).sort();
    assert(secondDigest.every((id) => String(id).indexOf("reminder-v1:") === 0));
    assert(firstDigest.length > 0 && secondDigest.length > 0);
  }],

  ["the projection / export summary is aggregate-only", () => {
    const out = boot();
    evaluate(out, candidate(out, "rem-privacy-projection-1"));
    out.sandbox.App.reminderInboxTodayOff("rem-privacy-projection-1", PRAYER_ID, { nowIso: NOW });

    const summary = out.sandbox.App.reminderRetentionSummary({ download: false, nowIso: NOW });
    assertEqual(summary.localOnly, true);
    assertEqual(typeof summary.preferences.configuredCount, "number");
    assertEqual(typeof summary.deliveryJournal.entryCount, "number");
    assertEqual(typeof summary.notificationHistory.entryCount, "number");
    const report = out.sandbox.App.reminderPrivacyReport("projectionSummary", summary, REMINDER_SCOPED_SAMPLES);
    assertEqual(report.forbiddenFields.length, 0);
    assertEqual(report.leakedSamples.length, 0);
    // Every declared privacy boundary flag is false, and the summary agrees.
    Object.keys(summary.privacyBoundary).forEach((flag) => assertEqual(summary.privacyBoundary[flag], false));
    assert(noSample(summary));
    // No occurrence identity in the aggregate either.
    assert(JSON.stringify(summary).indexOf("rem-privacy-projection-1") < 0);
  }],

  ["the native copy is the only surface that leaves the device and carries no detail", () => {
    const out = boot();
    evaluate(out, candidate(out, "rem-privacy-native-1"));
    const call = out.notification.getCalls()[0];
    assert(!!call);
    const surface = { title: call.title, body: call.options.body, tag: call.options.tag, deepLink: call.options.data.deepLink };
    const report = out.sandbox.App.reminderPrivacyReport("nativeCopy", surface, REMINDER_SCOPED_SAMPLES);
    assertEqual(report.ok, true);
    assert(noSample(call));

    // A therapy delivery uses the generic private copy, not the room detail.
    const therapy = boot();
    evaluate(therapy, candidate(therapy, "rem-privacy-native-2", THERAPY_ID));
    const therapyCall = therapy.notification.getCalls()[0];
    if (therapyCall) {
      assert(noSample(therapyCall));
      assert(String(therapyCall.options.body).indexOf(PRIVATE.therapy) < 0);
    }
  }],

  ["reminder surfaces stay free of mood, prayer completion, journal, note, token and GPS", () => {
    const out = boot();
    evaluate(out, candidate(out, "rem-privacy-negative-1"));
    out.sandbox.App.reminderInboxSnooze("rem-privacy-negative-1", "10m", PRAYER_ID, { nowIso: NOW });

    const surfaces = [
      ["localOnlyKey", JSON.parse(out.storage.getItem(DELIVERY_KEY) || "null")],
      ["localOnlyKey", JSON.parse(out.storage.getItem(ACTION_KEY) || "null")],
      ["projectionSummary", out.sandbox.App.reminderRetentionSummary({ download: false, nowIso: NOW })],
      ["nativeCopy", (() => { const c = out.notification.getCalls()[0]; return c ? { title: c.title, body: c.options.body, tag: c.options.tag, deepLink: c.options.data.deepLink } : { title: "t", body: "b", tag: "x", deepLink: "faith" }; })()]
    ];
    surfaces.forEach(([schema, value]) => {
      if (value === null) return;
      const report = out.sandbox.App.reminderPrivacyReport(schema, value, REMINDER_SCOPED_SAMPLES);
      assertEqual(report.leakedSamples.length, 0);
      assertEqual(report.forbiddenFields.length, 0);
    });

    // Honest scope note: `data.location` and the day records ARE app-level
    // synced fields (the panel redacts them separately). What REM-53 asserts is
    // that they never enter a reminder surface.
    const payload = out.sandbox.App.reminderCurrentSyncPayload();
    assert(!!payload.location);
    assertEqual(payload.reminders, undefined);
    const reminderEvents = ((payload.eventLog || {}).events || []).filter((event) => String(event.path || "") === "data.reminders");
    reminderEvents.forEach((event) => assert(noSample(event)));
    // Secrets are still the app's own boundary (sync.js sanitize strips them).
    assertEqual(payload.settings.ghToken, PRIVATE.token);
    assertEqual(out.network.calls, 0);
  }],

  ["sync status maps to a distinct honest app UI state for every failure mode", () => {
    const out = boot();
    const cases = [
      [{ configured: false }, "disabled"],
      [{ configured: true, offline: true, receipt: { status: "idle" } }, "offline"],
      [{ configured: true, receipt: { status: "queued" } }, "pending"],
      [{ configured: true, receipt: { status: "retrying" } }, "pending"],
      [{ configured: true, receipt: { status: "local_saved" } }, "pending"],
      [{ configured: true, receipt: { status: "error", lastErrorCode: "anti_clobber" } }, "error"],
      [{ configured: true, receipt: { status: "conflict" } }, "error"],
      [{ configured: true, receipt: { status: "accepted", acceptedAt: NOW } }, "synced"]
    ];
    const seen = {};
    cases.forEach(([input, expected]) => {
      const report = out.sandbox.App.reminderSystemStatus(Object.assign({ nowIso: NOW, online: input.offline !== true }, input));
      assertEqual(report.syncState, expected);
      seen[expected] = true;
      // The user-facing copy is distinct per state and never technical.
      const copy = out.sandbox.App.reminderSystemStatusCopy("sync", report.syncState);
      assert(copy.label.length > 0 && copy.detail.length > 0);
      assert(noSample(copy));
      assert(copy.detail.indexOf(PRIVATE.token) < 0 && copy.detail.indexOf("Bearer ") < 0);
    });
    assertEqual(Object.keys(seen).sort().join(","), "disabled,error,offline,pending,synced");

    // A projection/receipt failure must not close the in-app reminder path.
    const failing = out.sandbox.App.reminderSystemStatus({ nowIso: NOW, configured: true, receipt: { status: "error", lastErrorCode: "remote_unreadable" } });
    assertEqual(failing.syncState, "error");
    assertEqual(failing.capability.inApp, "available");
    assertEqual(failing.backgroundState, "unsupported");
  }],

  ["a full-replace remote snapshot cannot delete the device's reminder state", () => {
    const out = boot();
    out.sandbox.App.setReminderEnabled(THERAPY_ID, false);
    const before = JSON.stringify(JSON.parse(out.storage.getItem(APP_KEY)).reminders);
    assert(before.indexOf(PRIVATE.therapy) >= 0);

    // What sync would push is reminder-free, so no remote snapshot can ever
    // carry a reminder root back down; a full replace is a no-op for it.
    const payload = out.sandbox.App.reminderCurrentSyncPayload();
    assertEqual(payload.reminders, undefined);

    // Re-boot from the same local storage: the local reminder state survives
    // untouched and the private fields are still only local.
    const rebooted = boot({ state: JSON.parse(out.storage.getItem(APP_KEY)) });
    const after = JSON.stringify(JSON.parse(rebooted.storage.getItem(APP_KEY)).reminders);
    assert(after.indexOf(PRIVATE.therapy) >= 0);
    assert(after.indexOf(PRIVATE.medicationLabel) >= 0);
    assertEqual(rebooted.sandbox.App.reminderCurrentSyncPayload().reminders, undefined);

    // Fail closed: an unserializable state produces NO payload rather than a
    // partial one that might carry the private subtree past the gate.
    const cyclic = { days: {} }; cyclic.self = cyclic;
    assertEqual(out.sandbox.App.reminderSyncPayload(cyclic), null);
    assertEqual(out.sandbox.App.reminderSyncPayload(null), null);
    assertEqual(out.sandbox.App.reminderSyncPayload("not-an-object"), null);
    assertEqual(out.sandbox.App.reminderSyncPayload([1, 2]), null);
    // A payload that still carried the subtree would never be produced; the
    // gate deletes the root even when it arrives from an unexpected shape.
    assertEqual(out.sandbox.App.reminderSyncPayload({ reminders: { secret: PRIVATE.therapy }, days: {} }).reminders, undefined);
    assertEqual(out.sandbox.App.reminderPrivacyReport("canonicalPreference", { reminderId: THERAPY_ID, enabled: false }).synced, false);
  }],

  ["no real network, no data repo and no user localStorage were touched", () => {
    const out = boot();
    evaluate(out, candidate(out, "rem-privacy-safety-1"));
    assertEqual(out.network.calls, 0);
    const keys = [];
    out.store.forEach((value, key) => keys.push(key));
    const allowedKeys = [APP_KEY, "seyma-event-device-v1"].concat(LOCAL_ONLY_KEYS);
    keys.forEach((key) => assert(allowedKeys.indexOf(key) >= 0));

    // The sync seam is a local stub: nothing was ever handed a transport, and
    // every payload it did receive is reminder-free.
    out.scheduled.forEach((entry) => {
      assertEqual(entry.reminders, undefined);
      LOCAL_ONLY_KEYS.forEach((key) => assert(JSON.stringify(entry).indexOf(key) < 0));
    });
    assertEqual(typeof out.sandbox.SeySync.schedule, "function");
    assertEqual(out.network.calls, 0);
    // And the real data repo is only ever a settings value here, never a target.
    assertEqual(JSON.parse(out.storage.getItem(APP_KEY)).settings.ghRepo, "mustafaras/seyma-data");
  }]
]).catch(() => process.exitCode = 1);
