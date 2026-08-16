"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {
  assert,
  assertEqual,
  deepClone,
  deepEqual,
  runTests
} = require("./helpers/reminder-test-helper");

const repoRoot = path.resolve(__dirname, "../..");
const DELIVERY_KEY = "seyma-reminder-delivery-v1";
const PRIVATE_FIXTURES = [
  "SYNC_TOKEN_SECRET",
  "OPENAI_SECRET",
  "SYNC_URL_SECRET",
  "PRIVATE_MEDICATION_NAME",
  "PRIVATE_MEDICATION_LABEL",
  "PRIVATE_MEDICATION_NOTE",
  "THERAPY_DETAIL_SECRET",
  "RAW_BODY_SECRET",
  "USER_NOTE_SECRET",
  "DELIVERY_BODY_SECRET",
  "OCCURRENCE_SECRET",
  "RAW_ERROR_SECRET",
  "REMOTE_THERAPY_SECRET",
  "OLD_DEVICE_TOKEN"
];

function loadSync() {
  const counters = { fetches: 0, storageReads: 0 };
  const storage = {
    getItem(key) {
      counters.storageReads += 1;
      return key === DELIVERY_KEY ? JSON.stringify({ entries: [{ occurrenceId: "OCCURRENCE_SECRET" }] }) : null;
    },
    setItem() {},
    removeItem() {},
    clear() {}
  };
  const sandbox = {
    console,
    localStorage: storage,
    document: { getElementById() { return null; } },
    location: { protocol: "https:", hostname: "synthetic.example", search: "" },
    fetch() {
      counters.fetches += 1;
      throw new Error("REM-25_NETWORK_MUST_NOT_RUN");
    },
    setTimeout() { return 0; },
    clearTimeout() {},
    addEventListener() {},
    removeEventListener() {},
    TextEncoder,
    TextDecoder,
    atob,
    btoa,
    Date,
    Math,
    JSON,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
    Error,
    Promise,
    Set,
    Map,
    Symbol,
    Intl,
    isNaN,
    isFinite,
    encodeURIComponent,
    decodeURIComponent
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(repoRoot, "sync.js"), "utf8"), sandbox, { filename: "sync.js" });
  return { sync: sandbox.SeySync, counters };
}

function richState() {
  return {
    version: 2,
    savedAt: "2026-08-16T08:00:00.000Z",
    lastOpenedDate: "2026-08-16",
    days: {
      "2026-08-15": { mood: 3, water: 4, updatedAt: "2026-08-15T10:00:00.000Z" }
    },
    notifications: [{ id: "observer-safe", kind: "observer", message: "safe aggregate" }],
    body: { heightCm: 170, weights: [{ kg: 70, at: "2026-08-15" }] },
    settings: {
      nickname: "sentetik kullanıcı",
      ghRepo: "mustafaras/seyma-data",
      ghBranch: "main",
      ghToken: "SYNC_TOKEN_SECRET",
      openaiKey: "OPENAI_SECRET",
      syncUrl: "SYNC_URL_SECRET",
      auth: { token: "SYNC_TOKEN_SECRET" }
    },
    reminders: {
      schemaVersion: 1,
      preferences: {
        "reminder.catalog.v1.therapy": {
          reminderId: "reminder.catalog.v1.therapy",
          enabled: true,
          privateDetail: "THERAPY_DETAIL_SECRET",
          body: "RAW_BODY_SECRET",
          userNote: "USER_NOTE_SECRET"
        }
      },
      medications: [{
        id: "reminder.medication.v1.synthetic",
        name: "PRIVATE_MEDICATION_NAME",
        privateLabel: "PRIVATE_MEDICATION_LABEL",
        note: "PRIVATE_MEDICATION_NOTE",
        time: "08:00",
        enabled: true
      }],
      delivery: {
        occurrenceId: "OCCURRENCE_SECRET",
        body: "DELIVERY_BODY_SECRET"
      }
    },
    delivery: { occurrenceId: "OCCURRENCE_SECRET", body: "DELIVERY_BODY_SECRET" },
    deliveryLog: [{ occurrenceId: "OCCURRENCE_SECRET", body: "DELIVERY_BODY_SECRET" }],
    reminderDelivery: { occurrenceId: "OCCURRENCE_SECRET" },
    syncReceipt: {
      status: "accepted",
      snapshotRevision: "abcdef1234567",
      sourceUpdatedAt: "2026-08-16T08:00:00.000Z",
      lastErrorDetail: "RAW_ERROR_SECRET"
    }
  };
}

function assertNoPrivateText(value) {
  const text = JSON.stringify(value);
  PRIVATE_FIXTURES.forEach((fixture) => assert(!text.includes(fixture)));
}

const loaded = loadSync();
const sync = loaded.sync;

runTests([
  ["rich sanitize keeps safe fields and removes local-only/private fields", () => {
    assertEqual(typeof sync.sanitize, "function");
    const input = richState();
    const before = deepClone(input);
    const remotePayload = sync.sanitize(input);

    assert(deepEqual(input, before));
    assertEqual(remotePayload.version, 2);
    assertEqual(remotePayload.days["2026-08-15"].mood, 3);
    assertEqual(remotePayload.notifications[0].id, "observer-safe");
    assertEqual(remotePayload.body.heightCm, 170);
    assertEqual(remotePayload.settings.ghRepo, "mustafaras/seyma-data");
    assert(!Object.prototype.hasOwnProperty.call(remotePayload, "reminders"));
    ["delivery", "deliveryLog", "reminderDelivery", "reminderHistory", "notificationDelivery"].forEach((key) => {
      assert(!Object.prototype.hasOwnProperty.call(remotePayload, key));
    });
    ["ghToken", "openaiKey", "syncUrl", "auth"].forEach((key) => {
      assert(!Object.prototype.hasOwnProperty.call(remotePayload.settings, key));
    });
    assertEqual(remotePayload.syncReceipt.lastErrorDetail, null);
    assertNoPrivateText(remotePayload);
    assertEqual(loaded.counters.fetches, 0);
    assertEqual(loaded.counters.storageReads, 0);
  }],
  ["full-replace projection preserves merged safe data without importing private reminders", () => {
    const local = richState();
    local.days["2026-08-15"].mood = 2;
    local.days["2026-08-15"].updatedAt = "2026-08-16T08:00:00.000Z";
    const remote = richState();
    remote.days["2026-08-15"].mood = 5;
    remote.days["2026-08-15"].water = 8;
    remote.days["2026-08-15"].updatedAt = "2026-08-16T09:00:00.000Z";
    remote.days["2026-08-14"] = { mood: 4, updatedAt: "2026-08-14T09:00:00.000Z" };
    remote.notifications.push({ id: "observer-remote", kind: "observer", message: "remote-safe" });
    remote.reminders.preferences["reminder.catalog.v1.therapy"].privateDetail = "REMOTE_THERAPY_SECRET";

    const merged = sync.mergeData(local, remote);
    assertEqual(merged.days["2026-08-15"].mood, 5);
    assertEqual(merged.days["2026-08-15"].water, 8);
    assert(merged.days["2026-08-14"]);
    assert(merged.notifications.some((item) => item.id === "observer-remote"));
    assert(deepEqual(merged.reminders, local.reminders));

    const fullReplacePayload = sync.sanitize(merged);
    assert(fullReplacePayload.days["2026-08-14"]);
    assertEqual(fullReplacePayload.days["2026-08-15"].mood, 5);
    assert(!Object.prototype.hasOwnProperty.call(fullReplacePayload, "reminders"));
    assertNoPrivateText(fullReplacePayload);
  }],
  ["old device never imports remote local-only roots during conflict merge", () => {
    const oldDevice = {
      version: 2,
      days: { "2026-08-13": { mood: 1, updatedAt: "2026-08-13T09:00:00.000Z" } },
      notifications: [],
      settings: { ghRepo: "mustafaras/seyma-data", ghToken: "OLD_DEVICE_TOKEN" }
    };
    const remote = richState();
    const merged = sync.mergeData(oldDevice, remote);

    assert(merged.days["2026-08-16"] === undefined);
    assert(merged.days["2026-08-15"]);
    assert(!Object.prototype.hasOwnProperty.call(merged, "reminders"));
    assert(!Object.prototype.hasOwnProperty.call(merged, "delivery"));
    assert(!Object.prototype.hasOwnProperty.call(merged, "deliveryLog"));
    assertEqual(merged.settings.ghToken, "OLD_DEVICE_TOKEN");

    const payload = sync.sanitize(merged);
    assert(!Object.prototype.hasOwnProperty.call(payload, "reminders"));
    assert(!Object.prototype.hasOwnProperty.call(payload.settings, "ghToken"));
    assertNoPrivateText(payload);
    assertEqual(loaded.counters.fetches, 0);
    assertEqual(loaded.counters.storageReads, 0);

    const newDevice = sync.mergeData(null, remote);
    assert(newDevice.days["2026-08-15"]);
    assert(!Object.prototype.hasOwnProperty.call(newDevice, "reminders"));
    assertEqual(newDevice.settings.ghToken, undefined);
    assertNoPrivateText(newDevice);
  }]
]).catch(() => { process.exitCode = 1; });
