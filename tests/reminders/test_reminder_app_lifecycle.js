"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const NOW = "2026-08-14T12:00:00.000Z";
const SCHEDULER_SOURCE = fs.readFileSync(path.join(rootDir, "app/core/reminderScheduler.js"), "utf8");

function element(id) {
  return {
    id: id || "", _html: "", _text: "", style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
    setAttribute() {}, getAttribute() { return null; },
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
    version: 2, startDate: "2026-08-14", lastOpenedDate: "2026-08-14", days: {},
    notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {} },
    settings: {
      nickname: "REM-50 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "",
      profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto",
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(seed) {
  const app = element("app");
  const root = element("root");
  const store = { "seyma-reset-v1": JSON.stringify(seed || baseState()) };
  const listeners = { document: {}, window: {} };
  const intervals = [];
  const timeouts = [];
  let nextTimerId = 1;
  let fetchCalls = 0;
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  const document = {
    hidden: false, body: element("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return element(""); }, createDocumentFragment() { return element(""); },
    addEventListener(type, handler) { listeners.document[type] = handler; }, removeEventListener() {}
  };
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: {
      userAgent: "rem-50-lifecycle-fixture", vibrate() {},
      clipboard: { writeText() { return Promise.resolve(); } },
      geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition() { return 1; }, clearWatch() {} }
    },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { fetchCalls += 1; return new Promise(() => {}); },
    setTimeout(fn, ms) { const timer = { id: nextTimerId++, fn, ms, kind: "timeout" }; timeouts.push(timer); return timer.id; },
    clearTimeout() {},
    setInterval(fn, ms) { const timer = { id: nextTimerId++, fn, ms, kind: "interval" }; intervals.push(timer); return timer.id; },
    clearInterval() {}, requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-50-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-50"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener(type, handler) { listeners.window[type] = handler; }, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat,
    isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  vm.runInContext(SCHEDULER_SOURCE, context, { filename: "app/core/reminderScheduler.js" });
  vm.runInContext(fs.readFileSync(path.join(rootDir, "app.js"), "utf8"), context, { filename: "app.js" });
  sandbox.App.start();
  return { App: sandbox.App, document, listeners, intervals, timeouts, fetchCalls: () => fetchCalls, storage: localStorage, sandbox };
}

function candidate(id, overrides) {
  return Object.assign({
    occurrenceId: id, reminderId: id, localDate: "2026-08-14", scheduledAt: "12:00",
    timezone: "Europe/Istanbul", category: "reflection", priority: "P2", due: true,
    definition: { id, category: "reflection", priority: "P2", defaultChannel: "in_app" },
    preference: { reminderId: id, enabled: true, channel: "in_app" }
  }, overrides || {});
}

function evalContext(extra) {
  return Object.assign({
    timezone: "Europe/Istanbul", localDate: "2026-08-14", localTime: "12:00",
    permissionState: "granted", visibilityState: "visible", offline: false, dailyFlowBudget: 8
  }, extra || {});
}

runTests([
  ["pure scheduler records deterministic trigger matrix and coalesces one burst", () => {
    let clock = 1000;
    let evaluations = 0;
    const pureSandbox = {};
    vm.createContext(pureSandbox);
    vm.runInContext(SCHEDULER_SOURCE, pureSandbox, { filename: "app/core/reminderScheduler.js" });
    const scheduler = pureSandbox.ReminderSchedulerV1.create({
      burstMs: 100, now: () => clock,
      evaluate(source) { evaluations += 1; return { ok: true, source, status: "evaluated", shownCount: 1, changed: true }; }
    });
    const first = scheduler.trigger("focus", { triggerAtMs: 1000 });
    const burst = scheduler.trigger("focus", { triggerAtMs: 1050 });
    clock = 1200;
    const next = scheduler.trigger("focus", {});
    const state = scheduler.snapshot();
    assertEqual(first.status, "evaluated");
    assertEqual(burst.status, "coalesced");
    assertEqual(next.status, "evaluated");
    assertEqual(evaluations, 2);
    assertEqual(state.triggerMatrix.focus.received, 3);
    assertEqual(state.triggerMatrix.focus.evaluated, 2);
    assertEqual(state.triggerMatrix.focus.coalesced, 1);
    assertEqual(state.deliveryCount, 2);
    assertEqual(state.backgroundScheduling, false);
    assertEqual(state.appClosedGuarantee, false);
    assertEqual(state.nativeReplay, false);
  }],
  ["app boot, foreground, visibility, online and periodic triggers are distinct", () => {
    const out = boot();
    const before = out.App.reminderSchedulerState();
    assertEqual(before.triggerMatrix.boot.evaluated, 1);
    out.App.reminderSchedulerTrigger("foreground", { triggerAtMs: 2000, nowIso: NOW });
    out.listeners.window.focus();
    out.listeners.window.pageshow();
    out.listeners.window.online();
    out.document.hidden = true;
    out.listeners.document.visibilitychange();
    out.document.hidden = false;
    out.listeners.document.visibilitychange();
    const timer = out.App.reminderLifecycleTick();
    const state = out.App.reminderSchedulerState();
    ["boot", "foreground", "focus", "pageshow", "online", "hidden", "visibilitychange", "timer"].forEach((source) => {
      assertEqual(state.triggerMatrix[source].received >= 1, true);
      assertEqual(state.triggerMatrix[source].evaluated >= 1, true);
    });
    assertEqual(timer.source, "timer");
    assertEqual(state.foregroundOnly, true);
    assertEqual(state.backgroundScheduling, false);
    assertEqual(state.appClosedGuarantee, false);
    assertEqual(state.catchUpMaxAgeMs, 86400000);
  }],
  ["same app trigger burst yields one evaluation and one durable delivery", () => {
    const out = boot();
    out.App.reminderSchedulerReset();
    const item = candidate("rem-50-burst");
    const first = out.App.reminderSchedulerTrigger("focus", {
      triggerAtMs: 10000, nowIso: NOW, occurrences: [item], context: evalContext()
    });
    const second = out.App.reminderSchedulerTrigger("focus", {
      triggerAtMs: 10500, nowIso: NOW, occurrences: [item], context: evalContext()
    });
    const state = out.App.reminderSchedulerState();
    assertEqual(first.shownCount, 1);
    assertEqual(second.status, "coalesced");
    assertEqual(state.triggerMatrix.focus.evaluated, 1);
    assertEqual(state.triggerMatrix.focus.coalesced, 1);
    assertEqual(state.deliveryCount, 1);
    assertEqual(out.App.reminderDeliveryEntries(NOW).length, 1);
  }],
  ["poll and reminder timers are separate and offline recovery is bounded/no-spam", () => {
    const out = boot();
    const pollTimers = out.intervals.filter((timer) => timer.ms === 30000 && String(timer.fn).includes("pollRemote"));
    const reminderTimers = out.intervals.filter((timer) => timer.ms === 30000 && String(timer.fn).includes("reminderLifecycleTick"));
    assertEqual(pollTimers.length, 1);
    assertEqual(reminderTimers.length, 1);
    assert(pollTimers[0].id !== reminderTimers[0].id);
    out.App.reminderSchedulerReset();
    const before = out.App.reminderSchedulerState().evaluateCount;
    pollTimers[0].fn();
    assertEqual(out.App.reminderSchedulerState().evaluateCount, before);
    reminderTimers[0].fn();
    assertEqual(out.App.reminderSchedulerState().evaluateCount, before + 1);

    const offline = out.App.reminderSchedulerTrigger("offline", {
      triggerAtMs: 30000, nowIso: NOW, offline: true, online: false, occurrences: [],
      context: evalContext({ offline: true, online: false })
    });
    const past = candidate("rem-50-catchup", {
      localDate: "2026-08-14", scheduledAt: "11:00", past: true,
      definition: { id: "rem-50-catchup", category: "reflection", priority: "P2", defaultChannel: "native" },
      preference: { reminderId: "rem-50-catchup", enabled: true, channel: "native", nativeOptIn: true }
    });
    const recovered = out.App.reminderSchedulerTrigger("online", {
      triggerAtMs: 32000, nowIso: NOW, offline: false, online: true, occurrences: [past],
      context: evalContext({ offline: false, online: true })
    });
    assertEqual(offline.catchUpPerformed, false);
    assertEqual(recovered.catchUpPerformed, true);
    assertEqual(recovered.catchUpSummaries.length, 1);
    assertEqual(recovered.catchUpSummaries[0].nativeReplay, false);
    assertEqual(recovered.nativeShownCount, 0);
    assertEqual(out.App.reminderSchedulerState().triggerMatrix.online.evaluated, 1);
    assertEqual(out.App.reminderSchedulerState().triggerMatrix.offline.evaluated, 1);
  }]
]).catch(() => { process.exitCode = 1; });
