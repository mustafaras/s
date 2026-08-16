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
const APP_KEY = "seyma-reset-v1";
const DELIVERY_KEY = "seyma-reminder-delivery-v1";
const PRAYER_ID = "reminder.catalog.v1.prayer";
const THERAPY_ID = "reminder.catalog.v1.therapy";
const OCCURRENCE_ID = "reminder-38-occurrence";
const NOW = "2026-08-16T12:00:00.000Z";

function element(id) {
  return {
    id: id || "",
    _html: "",
    _text: "",
    style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {},
    children: [],
    scrollTop: 0,
    offsetWidth: 0,
    value: "",
    files: [],
    parentNode: null,
    get innerHTML() { return this._html; },
    set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; },
    set textContent(value) { this._text = String(value); },
    setAttribute() {},
    getAttribute() { return null; },
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {},
    remove() {},
    replaceWith() {},
    insertBefore(child) { return child; },
    addEventListener() {},
    removeEventListener() {},
    click() {},
    focus() {},
    blur() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    closest() { return null; },
    replaceChildren() {},
    contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function baseState() {
  const old = "2026-08-15T08:00:00.000Z";
  return {
    version: 2,
    startDate: "2026-08-15",
    lastOpenedDate: "2026-08-15",
    savedAt: old,
    days: {},
    notifications: [{ id: "observer-safe", kind: "observer", message: "safe" }],
    luna: { qa: [] },
    aeon: { qa: [] },
    reminders: {
      schemaVersion: 1,
      preferences: {
        [PRAYER_ID]: { reminderId: PRAYER_ID, enabled: true, privacyMode: "private", channel: "in_app", lastEditedAt: old },
        [THERAPY_ID]: { reminderId: THERAPY_ID, enabled: true, privacyMode: "private", channel: "in_app", lastEditedAt: old }
      }
    },
    settings: {
      nickname: "REM-38 fixture",
      ghToken: "",
      ghRepo: "",
      ghBranch: "",
      openaiKey: "",
      profileAssessmentInactive: true,
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function createSharedStorage(seed) {
  const store = Object.assign({}, seed || {});
  const listeners = new Map();
  let deliverEvents = true;
  const queued = [];
  const api = {
    read(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setDelivery(value) { deliverEvents = value === true; },
    flush() {
      while (queued.length) {
        const item = queued.shift();
        (listeners.get(item.owner) || []).forEach(() => {});
        (item.targets || []).forEach((target) => target(item.event));
      }
    },
    storageFor(owner) {
      return {
        getItem(key) { return api.read(key); },
        setItem(key, value) {
          const oldValue = api.read(key);
          store[key] = String(value);
          const event = { key, oldValue, newValue: store[key], storageArea: this };
          listeners.forEach((handlers, targetOwner) => {
            if (targetOwner === owner) return;
            const targets = handlers.slice();
            if (deliverEvents) targets.forEach((handler) => handler(event));
            else queued.push({ owner, targets: targets.map((handler) => handler), event });
          });
        },
        removeItem(key) {
          const oldValue = api.read(key);
          delete store[key];
          const event = { key, oldValue, newValue: null, storageArea: this };
          listeners.forEach((handlers, targetOwner) => {
            if (targetOwner === owner) return;
            const targets = handlers.slice();
            if (deliverEvents) targets.forEach((handler) => handler(event));
            else queued.push({ owner, targets: targets.map((handler) => handler), event });
          });
        },
        clear() { Object.keys(store).forEach((key) => this.removeItem(key)); }
      };
    },
    addListener(owner, type, handler) {
      if (type !== "storage") return;
      if (!listeners.has(owner)) listeners.set(owner, []);
      listeners.get(owner).push(handler);
    }
  };
  return api;
}

function bootTab(shared, owner, notificationLog) {
  const app = element("app");
  const root = element("root");
  const localStorage = shared.storageFor(owner);
  const windowHandlers = {};
  const documentHandlers = {};
  const document = {
    hidden: false,
    body: element("body"),
    documentElement: root,
    getElementById(id) { return { app, root }[id] || null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement() { return element(""); },
    createDocumentFragment() { return element(""); },
    addEventListener(type, handler) { documentHandlers[type] = handler; },
    removeEventListener() {}
  };
  function NotificationMock(title, options) {
    notificationLog.push({ title, options });
  }
  NotificationMock.permission = "granted";
  const sandbox = {
    console,
    localStorage,
    document,
    Notification: NotificationMock,
    navigator: { userAgent: "rem-38-tab", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); },
    setTimeout() { return 0; },
    clearTimeout() {},
    setInterval() { return 0; },
    clearInterval() {},
    requestAnimationFrame() { return 0; },
    cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return `rem-38-${owner}`; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-38"; }, revokeObjectURL() {} }),
    URLSearchParams,
    Blob: function Blob() {},
    File: function File() {},
    FileReader: function FileReader() {},
    TextDecoder,
    TextEncoder,
    atob,
    btoa,
    alert() {},
    confirm() { return true; },
    prompt() { return null; },
    addEventListener(type, handler) {
      if (!windowHandlers[type]) windowHandlers[type] = [];
      windowHandlers[type].push(handler);
      shared.addListener(owner, type, handler);
    },
    removeEventListener() {},
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
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    encodeURIComponent,
    decodeURIComponent,
    Promise,
    Set,
    Map,
    Symbol,
    Intl
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  return {
    App: sandbox.App,
    storage: localStorage,
    listeners: {
      window: windowHandlers,
      document: documentHandlers
    },
    emit(type, event) { (windowHandlers[type] || []).forEach((handler) => handler(event)); },
    data() { return JSON.parse(localStorage.getItem(APP_KEY)); }
  };
}

function deliveryCandidate() {
  return {
    occurrenceId: OCCURRENCE_ID,
    reminderId: PRAYER_ID,
    localDate: "2026-08-16",
    scheduledAt: "12:00",
    timezone: "Europe/Istanbul",
    category: "ritual",
    priority: "P2",
    due: true,
    deepLink: "faith",
    definition: { id: PRAYER_ID, category: "ritual", priority: "P2", defaultChannel: "native", deepLink: "faith" },
    preference: { reminderId: PRAYER_ID, enabled: true, channel: "native" }
  };
}

function loadSyncFixture(options) {
  const opts = options || {};
  const store = Object.assign({}, opts.storage || {});
  const calls = [];
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  const sandbox = {
    console,
    localStorage,
    document: { getElementById() { return null; } },
    location: { protocol: "https:", hostname: "synthetic.example", search: "" },
    fetch(url, request) {
      calls.push({ url, request });
      return opts.fetch ? opts.fetch(url, request) : Promise.reject(new Error("REM-38_NETWORK_UNEXPECTED"));
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
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "sync.js"), "utf8"), sandbox, { filename: "sync.js" });
  return { sync: sandbox.SeySync, storage: localStorage, calls };
}

function response(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json() { return Promise.resolve(body || {}); },
    text() { return Promise.resolve(""); }
  };
}

runTests([
  ["iki tab aynı occurrence için tek terminal delivery ve tek native gösterim üretir", () => {
    const shared = createSharedStorage({
      [APP_KEY]: JSON.stringify(baseState()),
      [DELIVERY_KEY]: JSON.stringify({ schemaVersion: 1, entries: [] })
    });
    const notificationsA = [];
    const notificationsB = [];
    const tabA = bootTab(shared, "a", notificationsA);
    const tabB = bootTab(shared, "b", notificationsB);
    const occurrence = deliveryCandidate();
    const claimA = tabA.App.reminderDeliveryShow({ occurrenceId: OCCURRENCE_ID, channel: "native", now: NOW });
    const nativeA = claimA.changed ? tabA.App.reminderNativeDisplay({
      source: "boot", visibilityState: "visible", occurrence, reminderId: PRAYER_ID,
      occurrenceId: OCCURRENCE_ID, deepLink: "faith", policy: { nativeAllowed: true, channel: "native" }
    }) : { ok: false, reason: "duplicate" };
    const claimB = tabB.App.reminderDeliveryShow({ occurrenceId: OCCURRENCE_ID, channel: "native", now: NOW });
    const nativeB = claimB.changed ? tabB.App.reminderNativeDisplay({
      source: "focus", visibilityState: "visible", occurrence, reminderId: PRAYER_ID,
      occurrenceId: OCCURRENCE_ID, deepLink: "faith", policy: { nativeAllowed: true, channel: "native" }
    }) : { ok: false, reason: "duplicate" };
    const log = tabA.App.reminderDeliveryLoad(NOW);
    assertEqual(claimA.changed, true);
    assertEqual(nativeA.ok, true);
    assertEqual(claimB.duplicate, true);
    assertEqual(nativeB.reason, "duplicate");
    assertEqual(notificationsA.length + notificationsB.length, 1);
    assertEqual(log.entries.length, 1);
    assertEqual(log.entries[0].occurrenceId, OCCURRENCE_ID);
    assertEqual(log.entries[0].status, "shown");
  }],
  ["storage event gecikse bile stale tab preference full-replace ile kaybolmaz", () => {
    const shared = createSharedStorage({ [APP_KEY]: JSON.stringify(baseState()) });
    const tabA = bootTab(shared, "a", []);
    const tabB = bootTab(shared, "b", []);
    shared.setDelivery(false);
    const editedA = tabA.App.setReminderEnabled(PRAYER_ID, false, { nowIso: "2026-08-16T10:00:00.000Z" });
    const editedB = tabB.App.setReminderEnabled(THERAPY_ID, false, { nowIso: "2026-08-16T11:00:00.000Z" });
    const persisted = tabA.data();
    assertEqual(editedA.changed, true);
    assertEqual(editedB.changed, true);
    assertEqual(persisted.reminders.preferences[PRAYER_ID].enabled, false);
    assertEqual(persisted.reminders.preferences[THERAPY_ID].enabled, false);
    assert(!Object.prototype.hasOwnProperty.call(persisted, "delivery"));
    shared.setDelivery(true);
    shared.flush();
    assertEqual(tabA.data().reminders.preferences[PRAYER_ID].enabled, false);
    assertEqual(tabA.data().reminders.preferences[THERAPY_ID].enabled, false);
    assertEqual(tabB.data().reminders.preferences[PRAYER_ID].enabled, false);
    assertEqual(tabB.data().reminders.preferences[THERAPY_ID].enabled, false);
    assert(typeof tabB.listeners.window.storage[0] === "function");
  }],
  ["offline delivery journal canonical preference'tan ayrı kalır ve online recovery duplicate üretmez", () => {
    const shared = createSharedStorage({
      [APP_KEY]: JSON.stringify(baseState()),
      [DELIVERY_KEY]: JSON.stringify({ schemaVersion: 1, entries: [] })
    });
    const tab = bootTab(shared, "offline", []);
    assertEqual(typeof tab.listeners.window.online[0], "function");
    assertEqual(typeof tab.listeners.window.storage[0], "function");
    tab.emit("offline", { online: false, offline: true });
    const offlineDelivery = tab.App.reminderDeliveryShow({ occurrenceId: OCCURRENCE_ID, now: NOW, channel: "in_app" });
    const beforeOnline = tab.data();
    assertEqual(offlineDelivery.changed, true);
    assertEqual(beforeOnline.reminders.preferences[PRAYER_ID].enabled, true);
    assertEqual(tab.storage.getItem(DELIVERY_KEY).includes(OCCURRENCE_ID), true);
    assertEqual(Object.prototype.hasOwnProperty.call(beforeOnline, "delivery"), false);
    tab.emit("online", { online: true, offline: false });
    const retry = tab.App.reminderDeliveryShow({ occurrenceId: OCCURRENCE_ID, now: NOW, channel: "in_app" });
    const afterOnline = tab.data();
    assertEqual(retry.duplicate, true);
    assertEqual(tab.App.reminderDeliveryEntries(NOW).length, 1);
    assert(deepEqual(afterOnline.reminders.preferences, beforeOnline.reminders.preferences));
    assertEqual(Object.prototype.hasOwnProperty.call(afterOnline, "delivery"), false);
  }],
  ["sync receipt ve retry local reminder owner'ını korur; remote-safe projection reminder taşımaz", () => {
    const canonical = baseState();
    canonical.settings.ghToken = "SYNTHETIC_TOKEN";
    canonical.settings.ghRepo = "owner/repo";
    canonical.settings.ghBranch = "main";
    const fixture = loadSyncFixture({ storage: { [APP_KEY]: JSON.stringify(canonical) } });
    const safeProjection = { settings: canonical.settings, days: {}, syncReceipt: {} };
    fixture.sync.schedule(safeProjection);
    const afterSchedule = JSON.parse(fixture.storage.getItem(APP_KEY));
    assert(afterSchedule.reminders && afterSchedule.reminders.preferences[PRAYER_ID]);
    assertEqual(afterSchedule.reminders.preferences[PRAYER_ID].enabled, true);
    fixture.sync.retryIfPending();
    const afterRetry = JSON.parse(fixture.storage.getItem(APP_KEY));
    assert(afterRetry.reminders && afterRetry.reminders.preferences[THERAPY_ID]);
    assertEqual(fixture.calls.length, 0);
    assertEqual(fixture.sync.sanitize(canonical).reminders, undefined);
  }],
  ["mock GET→merge→PUT uzak günü korur ve stale full-replace anti-clobber kanıtı üretir", async () => {
    const remote = {
      version: 2,
      days: {
        "2026-08-15": { mood: 3, updatedAt: "2026-08-15T10:00:00.000Z" },
        "2026-08-16": { mood: 4, updatedAt: "2026-08-16T10:00:00.000Z" }
      },
      settings: { ghRepo: "owner/repo", ghBranch: "main" }
    };
    const remoteContent = Buffer.from(JSON.stringify(remote), "utf8").toString("base64");
    const fixture = loadSyncFixture({
      fetch(url, request) {
        if (!request || !request.method) return Promise.resolve(response(200, { sha: "abcdef1234567", content: remoteContent }));
        return Promise.resolve(response(200, { content: { sha: "fedcba7654321" }, commit: { sha: "123456789abcd" } }));
      }
    });
    const local = {
      version: 2,
      days: { "2026-08-15": { mood: 5, updatedAt: "2026-08-15T11:00:00.000Z" } },
      settings: { ghRepo: "owner/repo", ghBranch: "main" }
    };
    await fixture.sync.putLatestGuarded({ token: "SYNTHETIC_TOKEN", owner: "owner", repo: "repo", branch: "main" }, "{}", local);
    assertEqual(fixture.calls.length, 2);
    assert(local.days["2026-08-16"]);
    const putBody = JSON.parse(fixture.calls[1].request.body);
    const written = JSON.parse(Buffer.from(putBody.content, "base64").toString("utf8"));
    assert(written.days["2026-08-15"]);
    assert(written.days["2026-08-16"]);
    assertEqual(written.days["2026-08-15"].mood, 5);
  }]
]).catch(() => { process.exitCode = 1; });
