"use strict";

// REM-52 — App permission, native adapter ve ÆON boundary.
//
// This fixture proves that the personal reminder notification channel and the
// pre-existing ÆON social notification channel share no permission field, no
// id namespace, no tag namespace, no cap and no history store; that the native
// surface carries only generic private copy; that every permission state is
// reachable without the app ever re-asking on its own; that a malformed click
// payload cannot move app state; and that neither app.js nor sw.js claims a
// background scheduling capability it does not have.
//
// Everything runs in node:vm against synthetic state. No browser, no network,
// no real localStorage, no data repo.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, createNotificationMock, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
const swSource = fs.readFileSync(path.join(rootDir, "sw.js"), "utf8");

const PRAYER_ID = "reminder.catalog.v1.prayer";
const THERAPY_ID = "reminder.catalog.v1.therapy";
const NOW = "2026-08-18T09:34:56.000Z";
const APP_KEY = "seyma-reset-v1";
const DELIVERY_KEY = "seyma-reminder-delivery-v1";
const ACTION_KEY = "seyma-reminder-actions-v1";
const PERMISSION_KEY = "seyma-reminder-permission-v1";
const REMINDER_LOCAL_KEYS = [DELIVERY_KEY, ACTION_KEY, PERMISSION_KEY];

// Synthetic private strings. None of these may ever reach a native payload.
const PRIVATE_MEDICATION_LABEL = "SENTETIK-ILAC-ETIKETI";
const PRIVATE_MEDICATION_NOTE = "SENTETIK-ILAC-NOTU";

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

function seedState() {
  return {
    version: 2, startDate: "2026-08-18", lastOpenedDate: "2026-08-18", days: {},
    notifications: [], luna: { qa: [] }, aeon: { qa: [], shownNotificationIds: [] },
    reminders: {
      schemaVersion: 1,
      preferences: {},
      medications: [{
        id: "rem-med-boundary-1", label: PRIVATE_MEDICATION_LABEL, note: PRIVATE_MEDICATION_NOTE,
        enabled: true, times: ["09:00"], timezone: "Europe/Istanbul", channel: "native"
      }]
    },
    settings: {
      nickname: "REM-52 boundary fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "",
      aeonNotifyPermission: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto",
      auth: { rememberMe: true, usernameHash: "fixture-auth", unlockedAt: "2026-08-18T08:00:00.000Z" }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(permission, options) {
  const opts = options || {};
  const app = fixtureElement("app");
  const root = fixtureElement("root");
  const notification = permission === null ? null : createNotificationMock(permission);
  const store = new Map([[APP_KEY, JSON.stringify(seedState())]]);
  Object.keys(opts.storageSeed || {}).forEach((key) => store.set(key, String(opts.storageSeed[key])));
  const writes = [];
  const localStorage = {
    getItem(key) { return store.has(String(key)) ? store.get(String(key)) : null; },
    setItem(key, value) { writes.push(String(key)); store.set(String(key), String(value)); },
    removeItem(key) { store.delete(String(key)); },
    clear() { store.clear(); }
  };
  const document = {
    hidden: false, body: fixtureElement("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(""); }, createDocumentFragment() { return fixtureElement(""); },
    addEventListener() {}, removeEventListener() {}
  };
  const sandbox = {
    console, localStorage, document,
    navigator: {
      vibrate() {}, standalone: false, userAgent: "rem-52-boundary-fixture",
      clipboard: { writeText() { return Promise.resolve(); } },
      // The app's location hard gate blocks every render until it is satisfied;
      // without this the reminder-centre assertions below never see any markup.
      geolocation: {
        getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); },
        watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; },
        clearWatch() {}
      }
    },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {}, crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-52-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-52"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  if (notification) sandbox.Notification = notification.Notification;
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  const files = ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js"];
  // The boundary module is optional in production today (REM-54 owns the
  // script wiring), so both the module path and the inline fallback must
  // produce identical behavior.
  if (opts.withModule !== false) files.push("app/core/reminderDelivery.js");
  files.forEach((file) => vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file }));
  vm.runInContext(appSource, context, { filename: "app.js" });
  sandbox.App.start();
  return { sandbox, app, storage: localStorage, store, writes, notification };
}

function bootSw(options) {
  const opts = options || {};
  const handlers = {};
  const state = { messages: [], openWindowCalls: 0, showNotificationCalls: 0, shown: [] };
  const appClient = {
    url: "https://seyma.test/index.html",
    postMessage(message) { state.messages.push(JSON.parse(JSON.stringify(message))); },
    focus() { return Promise.resolve(this); }
  };
  const clientsApi = {
    matchAll() { return Promise.resolve(opts.noClient ? [] : [appClient]); },
    openWindow() { state.openWindowCalls += 1; return Promise.resolve(appClient); },
    claim() { return Promise.resolve(); }
  };
  const self = {
    location: { origin: "https://seyma.test", pathname: "/sw.js" },
    registration: {
      showNotification(title, options) {
        state.showNotificationCalls += 1;
        state.shown.push({ title: String(title), options: JSON.parse(JSON.stringify(options || {})) });
        return Promise.resolve();
      }
    },
    addEventListener(type, handler) { handlers[type] = handler; },
    skipWaiting() {}
  };
  const context = vm.createContext({
    console, self, clients: clientsApi, URL, Promise, Object, String, Number, Boolean,
    RegExp, Array, JSON, Error, TypeError, Math
  });
  vm.runInContext(swSource, context, { filename: "sw.js" });
  return { click: handlers.notificationclick, push: handlers.push, state, context };
}

async function fireClick(sw, notification, action) {
  const waits = [];
  const event = {
    action: action || "",
    notification: Object.assign({ close() {} }, notification),
    waitUntil(promise) { waits.push(Promise.resolve(promise)); }
  };
  sw.click(event);
  await Promise.all(waits);
  return sw.state;
}

async function firePush(sw, payload) {
  const waits = [];
  sw.push({ data: { json() { return payload; } }, waitUntil(promise) { waits.push(Promise.resolve(promise)); } });
  await Promise.all(waits);
  return sw.state;
}

function candidate(out, occurrenceId, extra) {
  const overrides = extra || {};
  const reminderId = overrides.reminderId || PRAYER_ID;
  const occurrence = Object.assign({
    occurrenceId, reminderId, category: "ritual", priority: "P2",
    deepLink: overrides.deepLink || "faith", localDate: "2026-08-18", scheduledAt: "12:00",
    timezone: "Europe/Istanbul", definitionVersion: "1.0.0", due: true, past: false, replay: false, nativeReplay: false
  }, overrides.occurrence || {});
  return {
    occurrence,
    definition: out.sandbox.ReminderCatalogV1.get(reminderId),
    preference: { reminderId, enabled: true, channel: "native", privacyMode: "private" },
    reminderId,
    due: true
  };
}

function evaluate(out, item, extra) {
  return out.sandbox.App.evaluateReminders("manual", Object.assign({
    nowIso: NOW, visibilityState: "visible", catchUp: false,
    context: { localTime: "12:34", timezone: "Europe/Istanbul" }, occurrences: [item]
  }, extra || {}));
}

function stateSnapshot(out) {
  const local = {};
  [APP_KEY].concat(REMINDER_LOCAL_KEYS).forEach((key) => { local[key] = out.storage.getItem(key); });
  return JSON.stringify({ data: out.sandbox.App.debugData ? out.sandbox.App.debugData() : null, local });
}

function localSnapshot(out) {
  const local = {};
  [APP_KEY].concat(REMINDER_LOCAL_KEYS).forEach((key) => { local[key] = out.storage.getItem(key); });
  return JSON.stringify(local);
}

runTests([
  ["ÆON and reminder channels own disjoint permission, id, tag, cap and history fields", () => {
    [true, false].forEach((withModule) => {
      const out = boot("granted", { withModule });
      const boundary = out.sandbox.App.reminderNotificationBoundary();
      assertEqual(boundary.moduleLoaded, withModule);
      assertEqual(boundary.disjoint.ok, true);
      assertEqual(boundary.disjoint.shared.length, 0);

      const aeon = boundary.channels.aeon;
      const reminder = boundary.channels.reminder;
      ["permissionField", "tagPrefix", "capField", "historyField"].forEach((field) => {
        assert(aeon[field] !== reminder[field]);
        assert(!!aeon[field] && !!reminder[field]);
      });
      // Reminder state is local-only; ÆON state rides the synced `data` object.
      assertEqual(reminder.permissionScope, "local-only");
      assertEqual(reminder.historyScope, "local-only");
      assertEqual(aeon.permissionScope, "synced-state");
      assertEqual(aeon.historyScope, "synced-state");
      assertEqual(reminder.bodySource, "catalog-private-copy");
      assertEqual(aeon.bodySource, "message-content");
      assert(reminder.permissionField.indexOf("localStorage:") === 0);
      assert(aeon.permissionField.indexOf("data.settings.") === 0);

      // Capability statement is honest in both wiring modes.
      assertEqual(boundary.capabilities.backgroundScheduling, false);
      assertEqual(boundary.capabilities.backgroundReplay, false);
      assertEqual(boundary.capabilities.closedAppTimedDelivery, false);
      assertEqual(boundary.capabilities.reminderPush, false);
      assertEqual(boundary.capabilities.aeonPush, true);
      assertEqual(boundary.capabilities.serviceWorkerRole, "click-transport-only");
    });
  }],

  ["tag and payload namespaces classify every notification to exactly one channel", () => {
    [true, false].forEach((withModule) => {
      const out = boot("granted", { withModule });
      const channel = out.sandbox.App.reminderNotificationChannel;
      assertEqual(channel({ tag: "seyma-reminder-v1:abc" }), "reminder");
      assertEqual(channel({ tag: "reminder-preview-v1" }), "reminder");
      assertEqual(channel({ data: { type: "reminder" } }), "reminder");
      assertEqual(channel({ data: { type: "reminder-preview" } }), "reminder");
      assertEqual(channel({ tag: "aeon-message" }), "aeon");
      assertEqual(channel({ tag: "aeon-answer" }), "aeon");
      assertEqual(channel({ data: { type: "aeon-message" } }), "aeon");
      assertEqual(channel({ tag: "something-else" }), "");
      assertEqual(channel({}), "");
      // A reminder payload wearing an ÆON tag still resolves as reminder-owned,
      // so it is dropped rather than routed into the social flow.
      assertEqual(channel({ tag: "aeon-message", data: { type: "reminder" } }), "reminder");

      const tag = out.sandbox.App.reminderNativeTag("rem-boundary-tag-1");
      assertEqual(tag, "seyma-reminder-v1:rem-boundary-tag-1");
      assertEqual(channel({ tag }), "reminder");
      assert(tag.indexOf("aeon-") !== 0);
      assertEqual(out.sandbox.App.reminderNativeTag("bad token!"), "");
    });
  }],

  ["a reminder delivery never writes ÆON permission, id history or the social inbox", () => {
    const out = boot("granted");
    const before = JSON.parse(out.storage.getItem(APP_KEY));
    assertEqual(before.settings.aeonNotifyPermission, "");
    const aeonBefore = JSON.stringify(before.aeon);

    const result = evaluate(out, candidate(out, "rem-boundary-delivery-1"));
    assertEqual(result.nativeShownCount, 1);
    assertEqual(out.notification.getCalls().length, 1);

    const after = JSON.parse(out.storage.getItem(APP_KEY));
    assertEqual(after.settings.aeonNotifyPermission, "");
    assertEqual((after.aeon.shownNotificationIds || []).length, 0);
    assertEqual((after.notifications || []).length, 0);
    // The whole ÆON subtree is byte-identical after a reminder delivery.
    assertEqual(JSON.stringify(after.aeon), aeonBefore);
    // The reminder trail lives only in the local-only journal keys.
    assert(out.storage.getItem(DELIVERY_KEY) !== null);
    assert(JSON.stringify(after).indexOf("seyma-reminder-v1:") < 0);
  }],

  ["native copy carries only routing fields and never the private in-app detail", () => {
    const out = boot("granted");
    const item = candidate(out, "rem-boundary-copy-1", {
      occurrence: { nativeTitle: PRIVATE_MEDICATION_LABEL, nativeBody: PRIVATE_MEDICATION_NOTE, detail: PRIVATE_MEDICATION_NOTE }
    });
    evaluate(out, item);
    const call = out.notification.getCalls()[0];
    const serialized = JSON.stringify(call);
    assert(serialized.indexOf(PRIVATE_MEDICATION_LABEL) < 0);
    assert(serialized.indexOf(PRIVATE_MEDICATION_NOTE) < 0);
    assertEqual(call.title, "Küçük bir durak yaklaşırken");
    assert(call.options.body.indexOf("sakin bir an") >= 0);
    // Surface diagnosis added by REM-51 must stay in-app.
    ["requiredState", "surfaceState", "unavailableReason", "detail", "handlerBound"].forEach((field) => {
      assert(serialized.indexOf(field) < 0);
    });

    const copy = out.sandbox.App.reminderNativeDeliveryCopy({
      reminderId: THERAPY_ID, occurrenceId: "rem-boundary-copy-2",
      occurrence: { occurrenceId: "rem-boundary-copy-2", reminderId: THERAPY_ID, deepLink: "room", timezone: "Europe/Istanbul" }
    });
    assert(copy.ok);
    const surface = { title: copy.title, body: copy.body, tag: copy.tag, deepLink: copy.deepLink };
    const report = out.sandbox.ReminderDeliveryV1.nativeCopyReport(surface, [PRIVATE_MEDICATION_LABEL, PRIVATE_MEDICATION_NOTE]);
    assertEqual(report.ok, true);
    assertEqual(report.extraFields.length, 0);
    assertEqual(report.leaked.length, 0);
    assertEqual(report.tooLong, false);
    // The same helper rejects a copy that smuggles detail or an extra field.
    assertEqual(out.sandbox.ReminderDeliveryV1.nativeCopyReport({ title: "t", body: PRIVATE_MEDICATION_NOTE, tag: "x", deepLink: "room" }, [PRIVATE_MEDICATION_NOTE]).ok, false);
    assertEqual(out.sandbox.ReminderDeliveryV1.nativeCopyReport({ title: "t", body: "b", tag: "x", deepLink: "room", detail: "leak" }, []).ok, false);
  }],

  ["every permission state is reachable and only an explicit action can ask", async () => {
    const unsupported = boot(null);
    assertEqual(unsupported.sandbox.App.reminderPermissionSnapshot(), "unsupported");
    const unsupportedRequest = await unsupported.sandbox.App.requestReminderPermission("boundary");
    assertEqual(unsupportedRequest.requested, false);
    assertEqual(unsupportedRequest.state, "unsupported");

    const denied = boot("denied");
    assertEqual(denied.sandbox.App.reminderPermissionSnapshot(), "denied");
    const deniedRequest = await denied.sandbox.App.requestReminderPermission("boundary");
    assertEqual(deniedRequest.requested, false);
    assertEqual(denied.notification.getRequestCount(), 0);
    assertEqual(denied.sandbox.App.reminderPermissionCanRequest("denied"), false);

    const granted = boot("granted");
    assertEqual(granted.sandbox.App.reminderPermissionSnapshot(), "granted");
    const grantedRequest = await granted.sandbox.App.requestReminderPermission("boundary");
    assertEqual(grantedRequest.requested, false);
    assertEqual(granted.notification.getRequestCount(), 0);

    // `prompt` is the Permissions API spelling of `default`; both resolve the
    // same way and neither implies a pending question the app may re-ask.
    const prompt = boot("default");
    assertEqual(prompt.sandbox.App.reminderPermissionState({ permission: "prompt" }), "default");
    assertEqual(prompt.sandbox.App.reminderPermissionState({ state: "prompt" }), "default");
    assertEqual(prompt.sandbox.App.reminderPermissionSnapshot(), "default");
    for (let i = 0; i < 25; i += 1) prompt.sandbox.App.reminderPermissionSnapshot();
    prompt.sandbox.App.go("ayarlar");
    prompt.sandbox.App.openReminderCenter();
    assert(prompt.app.innerHTML.indexOf('data-reminder-permission-state="default"') >= 0);
    assertEqual(prompt.notification.getRequestCount(), 0);
    assertEqual(prompt.sandbox.App.reminderPermissionCanRequest("default"), true);
  }],

  ["a revoked grant is reported as revoked, explained, and asked at most once", async () => {
    const out = boot("granted");
    assertEqual(out.sandbox.App.reminderPermissionSnapshot(), "granted");
    const stored = JSON.parse(out.storage.getItem(PERMISSION_KEY));
    assertEqual(stored.everGranted, true);

    out.notification.setPermission("default");
    assertEqual(out.sandbox.App.reminderPermissionSnapshot(), "revoked");
    const explanation = out.sandbox.App.reminderPermissionExplanation("revoked");
    assertEqual(explanation.state, "revoked");
    assertEqual(explanation.tone, "caution");
    assert(explanation.label.length > 0 && explanation.meaning.length > 0 && explanation.action.length > 0);

    // Rendering the centre repeatedly must not turn into a permission loop.
    for (let i = 0; i < 25; i += 1) out.sandbox.App.reminderPermissionSnapshot();
    out.sandbox.App.go("ayarlar");
    out.sandbox.App.openReminderCenter();
    assert(out.app.innerHTML.indexOf('data-reminder-permission-state="revoked"') >= 0);
    assertEqual(out.notification.getRequestCount(), 0);

    // A single explicit user action may re-open the browser prompt.
    assertEqual(out.sandbox.App.reminderPermissionCanRequest("revoked"), true);
    const request = await out.sandbox.App.requestReminderPermission("explicit-user-action");
    assertEqual(request.requested, true);
    assertEqual(out.notification.getRequestCount(), 1);
    assertEqual(request.state, "granted");

    // A device that was never granted stays at `default`, never `revoked`.
    const fresh = boot("default");
    assertEqual(fresh.sandbox.App.reminderPermissionSnapshot(), "default");
    assertEqual(fresh.sandbox.App.reminderPermissionState({ permission: "default" }), "default");
    assertEqual(fresh.sandbox.App.reminderPermissionState({ permission: "default", previouslyGranted: true }), "revoked");
  }],

  ["every permission state renders exactly the control it can actually honour", async () => {
    // Regression guard: `revoked` was computed, explained and reported but had
    // no branch in the rendered permission block, so its copy promised a way
    // back that the UI never drew. The invariant below is the real contract:
    // a state offers a request control if and only if it can open the prompt.
    function renderFor(out) {
      out.sandbox.App.go("ayarlar");
      out.sandbox.App.openReminderCenter();
      return out.app.innerHTML;
    }

    const reachable = [];

    const unsupported = boot(null);
    reachable.push(["unsupported", renderFor(unsupported), unsupported]);

    const denied = boot("denied");
    reachable.push(["denied", renderFor(denied), denied]);

    const granted = boot("granted");
    reachable.push(["granted", renderFor(granted), granted]);

    const prompt = boot("default");
    reachable.push(["default", renderFor(prompt), prompt]);

    const revoked = boot("granted");
    assertEqual(revoked.sandbox.App.reminderPermissionSnapshot(), "granted");
    revoked.notification.setPermission("default");
    assertEqual(revoked.sandbox.App.reminderPermissionSnapshot(), "revoked");
    reachable.push(["revoked", renderFor(revoked), revoked]);

    // temporary-error is only reachable through a throwing requestPermission.
    const failing = boot("default");
    const throwing = { calls: 0 };
    failing.sandbox.Notification.requestPermission = function () {
      throwing.calls += 1;
      throw new Error("synthetic-permission-failure");
    };
    await failing.sandbox.App.requestReminderPermission("boundary");
    assertEqual(throwing.calls, 1);
    assertEqual(failing.sandbox.App.reminderPermissionSnapshot(), "temporary-error");
    reachable.push(["temporary-error", renderFor(failing), failing]);

    assertEqual(reachable.length, 6);
    reachable.forEach(([state, html, out]) => {
      // The state is actually shown, with its own explanation copy.
      assert(html.indexOf('data-reminder-permission-state="' + state + '"') >= 0);
      const copy = out.sandbox.App.reminderPermissionExplanation(state);
      assert(html.indexOf(copy.label) >= 0);

      // The invariant.
      const canRequest = out.sandbox.App.reminderPermissionCanRequest(state);
      const offersRequest = html.indexOf('data-reminder-permission-action="request"') >= 0
        || html.indexOf('data-reminder-permission-action="retry"') >= 0;
      assertEqual(offersRequest, canRequest);

      // Nothing renders a promise it cannot keep: a state that cannot ask must
      // still tell the user what remains available.
      if (!canRequest) assert(html.indexOf("sey-reminder-permission") >= 0 && copy.action.length > 0);
    });

    // And rendering the block never asks by itself, in any state. The only
    // call in this whole case is the one explicit request that produced
    // temporary-error; re-rendering does not repeat it.
    reachable.forEach(([, , out]) => {
      assertEqual(out.notification ? out.notification.getRequestCount() : 0, 0);
    });
    renderFor(failing);
    renderFor(failing);
    assertEqual(throwing.calls, 1);
    assertEqual(failing.sandbox.App.reminderPermissionSnapshot(), "temporary-error");
  }],
  ["boot and lifecycle triggers never start an ÆON or reminder permission loop", () => {
    // The ÆON 2-minute re-ask loop must remain unreferenced by any call site.
    const loopCallSites = appSource.split("startAeonPermissionLoop(").length - 1;
    assertEqual(loopCallSites, 1); // the declaration only
    assert(appSource.indexOf("startAeonPermissionLoop();") < 0);

    const out = boot("default");
    ["boot", "foreground", "focus", "pageshow", "online", "visibilitychange", "timer", "manual"].forEach((trigger) => {
      out.sandbox.App.reminderSchedulerTrigger(trigger);
    });
    out.sandbox.App.reminderLifecycleTick();
    assertEqual(out.notification.getRequestCount(), 0);
    const saved = JSON.parse(out.storage.getItem(APP_KEY));
    assertEqual(saved.settings.aeonNotifyPermission, "");
  }],

  ["malformed service worker click payloads change no app state", () => {
    const out = boot("granted");
    evaluate(out, candidate(out, "rem-boundary-click-1"));
    const baseline = localSnapshot(out);

    const malformed = [
      null,
      undefined,
      "reminder",
      { type: "aeon-message", occurrenceId: "rem-boundary-click-1" },
      { type: "reminder" },
      { type: "reminder", occurrenceId: "rem-boundary-click-1" },
      { type: "reminder", occurrenceId: "rem-boundary-click-1", reminderId: PRAYER_ID, deepLink: "faith", targetId: "mesaj", action: "open" },
      { type: "reminder", occurrenceId: "rem-boundary-click-1", reminderId: PRAYER_ID, deepLink: "https://evil.test", targetId: "faith", action: "open" },
      { type: "reminder", occurrenceId: "bad token!", reminderId: PRAYER_ID, deepLink: "faith", targetId: "faith", action: "open" },
      { type: "reminder", occurrenceId: "rem-boundary-click-1", reminderId: PRAYER_ID, deepLink: "faith", targetId: "faith", action: "wipe" },
      { type: "reminder", occurrenceId: "rem-boundary-click-1", reminderId: PRAYER_ID, deepLink: "faith", targetId: "faith", action: "open", timezone: "../../etc" },
      { type: "reminder", occurrenceId: "rem-boundary-click-1", reminderId: PRAYER_ID, deepLink: "faith", targetId: "faith", action: "snooze", snoozeOption: "99y" },
      { type: "reminder", occurrenceId: "rem-boundary-click-1", reminderId: PRAYER_ID, deepLink: "faith", targetId: "faith", action: "open", openDetail: "yes" },
      { type: "reminder-preview", occurrenceId: "rem-boundary-click-1", reminderId: PRAYER_ID, deepLink: "faith", targetId: "faith", action: "open" }
    ];
    malformed.forEach((payload) => {
      const result = out.sandbox.App.handleReminderServiceWorkerClick(payload);
      assertEqual(result.ok, false);
      assertEqual(localSnapshot(out), baseline);
    });

    // The allowlisted shape still works and is the only thing that does.
    const valid = out.sandbox.App.handleReminderServiceWorkerClick({
      type: "reminder", occurrenceId: "rem-boundary-click-1", reminderId: PRAYER_ID,
      deepLink: "faith", targetId: "faith", action: "open", openDetail: false, timezone: "Europe/Istanbul"
    });
    assertEqual(valid.ok, true);
    assertEqual(valid.deepLink, "faith");
    assertEqual(out.sandbox.App.reminderDeliveryGet("rem-boundary-click-1", NOW).status, "opened");
  }],

  ["the service worker drops reminder-namespaced clicks it cannot validate instead of routing them to ÆON", async () => {
    const validData = {
      type: "reminder", occurrenceId: "rem-boundary-sw-1", reminderId: PRAYER_ID,
      deepLink: "faith", targetId: "faith", openDetail: false, timezone: "Europe/Istanbul"
    };

    const ok = bootSw();
    await fireClick(ok, { tag: "seyma-reminder-v1:rem-boundary-sw-1", data: validData }, "open");
    assertEqual(ok.state.messages.length, 1);
    assertEqual(ok.state.messages[0].type, "reminder-native-click");
    assertEqual(ok.state.messages[0].payload.targetId, "faith");

    // Reminder preview notification: reminder-owned, not a valid click payload.
    const preview = bootSw();
    await fireClick(preview, { tag: "reminder-preview-v1", data: { type: "reminder-preview", deepLink: "settings" } }, "");
    assertEqual(preview.state.messages.length, 0);
    assertEqual(preview.state.openWindowCalls, 0);

    // Reminder tag with a broken payload: dropped, never downgraded.
    const broken = bootSw();
    await fireClick(broken, { tag: "seyma-reminder-v1:rem-boundary-sw-2", data: { type: "reminder", deepLink: "faith" } }, "open");
    assertEqual(broken.state.messages.length, 0);
    assertEqual(broken.state.openWindowCalls, 0);

    // Reminder payload riding an ÆON tag is a namespace collision, not a route.
    const collided = bootSw();
    await fireClick(collided, { tag: "aeon-message", data: validData }, "open");
    assertEqual(collided.state.messages.length, 0);
    assertEqual(collided.state.openWindowCalls, 0);

    // The ÆON social route is untouched.
    const social = bootSw();
    await fireClick(social, { tag: "aeon-message", data: { id: "m1", type: "aeon-message" } }, "");
    assertEqual(social.state.messages.length, 1);
    assertEqual(social.state.messages[0].type, "aeon-open-mesaj");
    const legacy = bootSw();
    await fireClick(legacy, { tag: "aeon-answer", data: {} }, "");
    assertEqual(legacy.state.messages[0].type, "aeon-open-mesaj");
  }],

  ["the service worker claims no background scheduling and no reminder push", async () => {
    const reminderPush = bootSw();
    await firePush(reminderPush, { type: "reminder", title: "x", body: "y", tag: "seyma-reminder-v1:rem-boundary-push-1" });
    assertEqual(reminderPush.state.showNotificationCalls, 0);
    await firePush(reminderPush, { title: "x", body: "y", data: { type: "reminder" } });
    assertEqual(reminderPush.state.showNotificationCalls, 0);
    await firePush(reminderPush, { title: "x", body: "y", tag: "reminder-preview-v1" });
    assertEqual(reminderPush.state.showNotificationCalls, 0);

    const aeonPush = bootSw();
    await firePush(aeonPush, { title: "ÆON", body: "Yeni mesaj", tag: "aeon-message" });
    assertEqual(aeonPush.state.showNotificationCalls, 1);
    assertEqual(aeonPush.state.shown[0].options.tag, "aeon-message");

    // The declared capability record and the source agree: no alarm surface.
    assert(swSource.indexOf("backgroundScheduling: false") > 0);
    assert(swSource.indexOf("closedAppTimedDelivery: false") > 0);
    assert(swSource.indexOf("reminderPush: false") > 0);
    ["setTimeout(", "setInterval(", "periodicsync", "registration.sync", "registration.periodicSync", "fetch("].forEach((surface) => {
      assertEqual(swSource.indexOf(surface), -1);
    });
  }],

  ["the ÆON channel cannot borrow the reminder tag namespace", () => {
    const out = boot("granted");
    const before = out.notification.getCalls().length;
    // The social sender is guarded by the same channel classifier.
    assertEqual(out.sandbox.App.reminderNotificationChannel({ tag: "seyma-reminder-v1:x" }), "reminder");
    assert(appSource.indexOf("if(reminderNotificationChannel({tag:opts.tag||'aeon-message'})==='reminder') return;") > 0);
    assertEqual(out.notification.getCalls().length, before);

    // And the reminder sender fails closed rather than emitting off-namespace.
    assert(appSource.indexOf("return {ok:false,reason:'channel-boundary'") > 0);
  }]
]).catch(() => process.exitCode = 1);
