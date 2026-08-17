"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
const NOW = "2026-08-16T12:00:00.000Z";

function element(id) {
  return {
    id: id || "", _html: "", _text: "", style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
    setAttribute() {}, getAttribute() { return null; }, appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; }, addEventListener() {}, removeEventListener() {},
    click() {}, focus() {}, blur() {}, querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; }, getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function state() {
  return {
    version: 2, startDate: "2026-08-16", lastOpenedDate: "2026-08-16", days: {}, notifications: [],
    luna: { qa: [] }, aeon: { qa: [] }, reminders: { schemaVersion: 1, preferences: {} },
    settings: { nickname: "REM-37 performance fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto",
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot() {
  const app = element("app");
  const root = element("root");
  const entries = { "seyma-reset-v1": JSON.stringify(state()) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(entries, key) ? entries[key] : null; },
    setItem(key, value) { entries[key] = String(value); }, removeItem(key) { delete entries[key]; }, clear() { Object.keys(entries).forEach((key) => delete entries[key]); }
  };
  const document = { hidden: false, body: element("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return element(""); }, createDocumentFragment() { return element(""); }, addEventListener() {}, removeEventListener() {} };
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { vibrate() {}, userAgent: "rem-37-performance-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {}, crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-37-performance-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-37"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  return { App: sandbox.App, app };
}

function candidate() {
  return {
    occurrenceId: "rem-37-noop", reminderId: "rem-37-noop", localDate: "2026-08-16", scheduledAt: "12:00",
    timezone: "Europe/Istanbul", category: "reflection", priority: "P2", due: true,
    definition: { id: "rem-37-noop", category: "reflection", priority: "P2", defaultChannel: "in_app" },
    preference: { reminderId: "rem-37-noop", enabled: true, channel: "in_app" }
  };
}

function evaluate(out) {
  return out.App.reminderLifecycleEvaluate("timer", {
    nowIso: NOW, occurrences: [candidate()], visibilityState: "visible",
    context: { localTime: "12:00", permissionState: "granted", visibilityState: "visible", timezone: "Europe/Istanbul" }
  });
}

runTests([
  ["candidate signature is stable and unchanged timer ticks are render no-ops", () => {
    const out = boot();
    const first = evaluate(out);
    const afterFirst = out.App.reminderLifecycleState();
    const second = evaluate(out);
    const afterSecond = out.App.reminderLifecycleState();
    assertEqual(first.candidateChanged, true);
    assertEqual(second.candidateChanged, false);
    assertEqual(second.rendered, false);
    assert(afterFirst.renderCount >= 1);
    assertEqual(afterSecond.renderCount, afterFirst.renderCount);
    assert(afterSecond.noOpCount >= 1);
    assertEqual(afterSecond.renderErrorCount, 0);
    assertEqual(afterSecond.lastRenderReason, "candidate-stable");
  }],
  ["repeated no-op scheduler ticks stay bounded and preserve the candidate signature", () => {
    const out = boot();
    evaluate(out);
    const before = out.App.reminderLifecycleState();
    const start = process.hrtime.bigint();
    for (let index = 0; index < 25; index += 1) evaluate(out);
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
    const after = out.App.reminderLifecycleState();
    assert(elapsedMs < 1000);
    assertEqual(after.candidateSignature, before.candidateSignature);
    assertEqual(after.renderCount, before.renderCount);
    assert(after.noOpCount >= before.noOpCount + 25);
    console.log(`REM-37 candidate no-op: ${elapsedMs.toFixed(2)}ms/25 ticks; renders=${after.renderCount}; noOps=${after.noOpCount}`);
  }],
  ["scheduler implementation keeps the full render outside the timer entrypoint", () => {
    const tick = appSource.match(/function reminderLifecycleTick\(\)\{[\s\S]*?\}/);
    assert(tick && !/\brender\s*\(/.test(tick[0]));
    assert(appSource.includes("reminderLifecycleCandidateSignature"));
    assert(appSource.includes("reminderLifecycleRenderIfNeeded"));
    assert(appSource.includes("setInterval(reminderLifecycleTick,REMINDER_LIFECYCLE_INTERVAL_MS)"));
  }]
]).catch(() => process.exitCode = 1);
