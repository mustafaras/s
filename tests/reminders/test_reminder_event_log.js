"use strict";

// REM-47 — app event-log shape must remain compatible with the existing sync
// event contract. This fixture evaluates sync.js with memory-only mocks.
const fs = require("node:fs");
const path = require("node:path");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const source = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const syncSource = fs.readFileSync(path.join(ROOT, "sync.js"), "utf8");
let passedSource = 0;

const store = {};
global.localStorage = {
  getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
  setItem(key, value) { store[key] = String(value); },
  removeItem(key) { delete store[key]; }
};
global.window = { addEventListener() {}, SeySync: null };
global.document = { getElementById() { return null; } };
global.location = { protocol: "https:", hostname: "example.test", search: "" };
global.fetch = function fetchUnexpected() { return Promise.reject(new Error("REMINDER_TEST_NETWORK_DISABLED")); };
if (typeof TextEncoder === "undefined") global.TextEncoder = require("node:util").TextEncoder;
if (typeof TextDecoder === "undefined") global.TextDecoder = require("node:util").TextDecoder;
if (typeof btoa === "undefined") global.btoa = (value) => Buffer.from(value, "binary").toString("base64");
if (typeof atob === "undefined") global.atob = (value) => Buffer.from(value, "base64").toString("binary");
eval(syncSource);
const sync = global.window.SeySync;

function event(id, section, pathName, summary, operation) {
  return {
    eventId: id, correlationId: id, sequence: 1, occurredAt: "2026-08-17T12:00:00.000Z", persistedAt: "2026-08-17T12:00:00.000Z",
    submittedAt: null, acceptedAt: null, section, path: pathName, operation: operation || "update", summary,
    source: "app", sourceDeviceId: "dev_rem47", privacyClass: "summary", snapshotRevision: null
  };
}

runTests([
  ["REM-47 app adapter declares safe personal and separate social event categories", () => {
    assert(source.includes("REMINDER_EVENT_ACTIONS"));
    assert(source.includes("section:'wellness',path:'data.reminders'"));
    assert(source.includes("section:'notifications',path:'data.aeon'"));
    assert(source.includes("function reminderEventDigest"));
    assert(!source.includes("nativeBody:spec") && !source.includes("therapyText:spec") && !source.includes("medicationName:spec"));
    passedSource += 5;
  }],
  ["existing sync normalizer accepts both categories but redacts unsafe summaries", () => {
    const personal = sync.normalizeEvent(event("reminder-1", "wellness", "data.reminders", "Bildirim yaşam döngüsü güncellendi", "complete"), "dev_rem47");
    const social = sync.normalizeEvent(event("aeon-1", "notifications", "data.aeon", "Bildirim yaşam döngüsü güncellendi"), "dev_rem47");
    const unsafe = sync.normalizeEvent(Object.assign({}, personal, { eventId: "unsafe-1", summary: "THERAPY_BODY medicationName DOSE mood journal" }), "dev_rem47");
    assertEqual(personal.section, "wellness");
    assertEqual(personal.path, "data.reminders");
    assertEqual(personal.operation, "complete");
    assertEqual(social.section, "notifications");
    assertEqual(social.path, "data.aeon");
    assertEqual(unsafe.summary, "Güvenli kayıt özeti");
    assert(!JSON.stringify(unsafe).includes("THERAPY_BODY"));
  }],
  ["merge is append-only/idempotent across personal and social categories", () => {
    const personal = event("reminder-1", "wellness", "data.reminders", "Bildirim yaşam döngüsü güncellendi", "complete");
    const social = event("aeon-1", "notifications", "data.aeon", "Bildirim yaşam döngüsü güncellendi");
    const merged = sync.mergeEventLog({ sourceDeviceId: "dev_rem47", events: [personal, personal] }, { sourceDeviceId: "dev_aeon", events: [personal, social] });
    assertEqual(merged.events.length, 2);
    assertEqual(merged.events.filter((item) => item.eventId === "reminder-1").length, 1);
    assert(merged.events.some((item) => item.section === "wellness" && item.path === "data.reminders"));
    assert(merged.events.some((item) => item.section === "notifications" && item.path === "data.aeon"));
  }],
  ["sanitize removes private reminder state and keeps only safe event projection", () => {
    const safe = sync.sanitize({
      reminders: { preferences: { privateLabel: "MEDICATION_NAME", note: "THERAPY_BODY" } },
      eventLog: { sourceDeviceId: "dev_rem47", nextSequence: 2, events: [event("reminder-1", "wellness", "data.reminders", "Bildirim yaşam döngüsü güncellendi")] },
      syncReceipt: { status: "accepted", snapshotRevision: "a".repeat(40) }
    });
    assert(!Object.prototype.hasOwnProperty.call(safe, "reminders"));
    assertEqual(safe.eventLog.events.length, 1);
    assertEqual(safe.eventLog.events[0].section, "wellness");
    assert(!JSON.stringify(safe).includes("MEDICATION_NAME"));
    assert(!JSON.stringify(safe).includes("THERAPY_BODY"));
    assertEqual(safe.syncReceipt.status, "accepted");
  }]
]).then(() => {
  if (passedSource !== 5) process.exitCode = 1;
}).catch(() => { process.exitCode = 1; });

