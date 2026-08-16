"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const swSource = fs.readFileSync(path.join(rootDir, "sw.js"), "utf8");

function client(url) {
  return {
    url,
    messages: [],
    focusCount: 0,
    postMessage(message) { this.messages.push(JSON.parse(JSON.stringify(message))); },
    focus() { this.focusCount += 1; return Promise.resolve(this); }
  };
}

function boot(options) {
  const opts = options || {};
  const handlers = {};
  const state = {
    matchAllCalls: 0,
    openWindowCalls: 0,
    showNotificationCalls: 0,
    openedUrls: [],
    clients: Array.isArray(opts.clients) ? opts.clients : [],
    openClient: opts.openClient || client("https://seyma.test/index.html")
  };
  const clientsApi = {
    matchAll() {
      state.matchAllCalls += 1;
      return Promise.resolve(state.clients);
    },
    openWindow(url) {
      state.openWindowCalls += 1;
      state.openedUrls.push(String(url));
      return Promise.resolve(state.openClient);
    },
    claim() { return Promise.resolve(); }
  };
  const self = {
    location: { origin: "https://seyma.test", pathname: "/sw.js" },
    registration: { showNotification() { state.showNotificationCalls += 1; return Promise.resolve(); } },
    addEventListener(type, handler) { handlers[type] = handler; },
    skipWaiting() {}
  };
  const context = vm.createContext({
    console, self, clients: clientsApi, URL, Promise, Object, String, Number, Boolean,
    RegExp, Array, JSON, Error, TypeError, Math
  });
  vm.runInContext(swSource, context, { filename: "sw.js" });
  return { click: handlers.notificationclick, push: handlers.push, state };
}

async function fire(out, data, action) {
  const event = {
    action: action || "",
    notification: {
      data,
      closed: false,
      close() { this.closed = true; }
    },
    waited: null,
    waitUntil(promise) { this.waited = promise; }
  };
  out.click(event);
  if (event.waited) await event.waited;
  return event;
}

async function push(out, data) {
  const event = {
    data: { json() { return data; } },
    waited: null,
    waitUntil(promise) { this.waited = promise; }
  };
  out.push(event);
  if (event.waited) await event.waited;
  return event;
}

function validReminderData(extra) {
  return Object.assign({
    type: "reminder",
    occurrenceId: "rem-sw-occurrence-1",
    reminderId: "reminder.catalog.v1.prayer",
    deepLink: "faith",
    targetId: "faith",
    openDetail: false,
    therapyToolId: "",
    timezone: "Europe/Istanbul",
    snoozeOption: "10m"
  }, extra || {});
}

runTests([
  ["existing ÆON notification click keeps the legacy message and focus route", async () => {
    const app = client("https://seyma.test/index.html");
    const out = boot({ clients: [app] });
    const event = await fire(out, { type: "aeon-message", id: "aeon-1", body: "PRIVATE_AEON_BODY" });
    assert(event.notification.closed);
    assertEqual(out.state.matchAllCalls, 1);
    assertEqual(out.state.openWindowCalls, 0);
    assertEqual(app.focusCount, 1);
    assertEqual(JSON.stringify(app.messages[0]), JSON.stringify({ type: "aeon-open-mesaj" }));
    assert(!JSON.stringify(app.messages).includes("PRIVATE_AEON_BODY"));
  }],
  ["valid reminder click is target-allowlisted and forwards only the safe contract", async () => {
    const app = client("https://seyma.test/");
    const out = boot({ clients: [app] });
    const event = await fire(out, validReminderData({
      body: "PRIVATE_BODY_SECRET",
      title: "PRIVATE_TITLE_SECRET",
      medicationName: "PRIVATE_MEDICATION_SECRET",
      userNote: "PRIVATE_NOTE_SECRET"
    }), "snooze");
    const message = app.messages[0];
    assert(event.notification.closed);
    assert(message && message.type === "reminder-native-click");
    assertEqual(message.payload.type, "reminder");
    assertEqual(message.payload.occurrenceId, "rem-sw-occurrence-1");
    assertEqual(message.payload.deepLink, "faith");
    assertEqual(message.payload.targetId, "faith");
    assertEqual(message.payload.action, "snooze");
    assertEqual(message.payload.snoozeOption, "10m");
    assert(!JSON.stringify(message).includes("PRIVATE_BODY_SECRET"));
    assert(!JSON.stringify(message).includes("PRIVATE_TITLE_SECRET"));
    assert(!JSON.stringify(message).includes("PRIVATE_MEDICATION_SECRET"));
    assert(!JSON.stringify(message).includes("PRIVATE_NOTE_SECRET"));
  }],
  ["closed-app route opens one client once and posts the same safe payload", async () => {
    const opened = client("https://seyma.test/index.html");
    const out = boot({ clients: [], openClient: opened });
    const event = await fire(out, validReminderData(), "todayOff");
    assert(event.notification.closed);
    assertEqual(out.state.matchAllCalls, 1);
    assertEqual(out.state.openWindowCalls, 1);
    assertEqual(out.state.openedUrls[0], "https://seyma.test/index.html");
    assertEqual(opened.messages[0].payload.action, "todayOff");
  }],
  ["invalid, mismatched, sensitive-shaped or unsupported reminder payloads are ignored", async () => {
    const cases = [
      [validReminderData({ occurrenceId: "" }), "open"],
      [validReminderData({ deepLink: "javascript:alert(1)", targetId: "faith" }), "open"],
      [validReminderData({ targetId: "settings" }), "open"],
      [validReminderData({ snoozeOption: "PRIVATE_OPTION" }), "snooze"],
      [validReminderData(), "delete"]
    ];
    for (const [data, action] of cases) {
      const app = client("https://seyma.test/index.html");
      const out = boot({ clients: [app] });
      const event = await fire(out, data, action);
      assert(event.notification.closed);
      assertEqual(event.waited, null);
      assertEqual(out.state.matchAllCalls, 0);
      assertEqual(out.state.openWindowCalls, 0);
      assertEqual(app.messages.length, 0);
    }
  }],
  ["reminder-shaped push cannot create a background notification while ÆON push remains available", async () => {
    const out = boot();
    const reminderPush = await push(out, { type: "reminder", title: "PRIVATE_TITLE_SECRET", data: validReminderData() });
    assertEqual(reminderPush.waited, null);
    assertEqual(out.state.showNotificationCalls, 0);
    await push(out, { type: "aeon-message", title: "ÆON", body: "Yeni mesaj" });
    assertEqual(out.state.showNotificationCalls, 1);
  }],
  ["SW has no reminder scheduler, network retry, token or local alarm surface", () => {
    assert(!/\bsetTimeout\s*\(/.test(swSource));
    assert(!/\bsetInterval\s*\(/.test(swSource));
    assert(!/\bfetch\s*\(/.test(swSource));
    assert(!/localStorage|Authorization|githubToken|ghToken/.test(swSource));
    assert(swSource.includes("notificationclick"));
    assert(swSource.includes("reminder-native-click"));
  }]
]).catch(() => process.exitCode = 1);
