// ÆON Panel v2 — Shared headless test helper
// DOM, timers ve minimal globals; panel-v2.js + panelCoverageManifest.js boot.
"use strict";

const fs = require("fs");
const path = require("path");
// This helper lives at tests/panel-v2/helpers; always resolve from repository root.
const root = path.resolve(__dirname, "..", "..", "..");
const vm = require("vm");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function assert(cond, msg) {
  if (!cond) {
    console.error("❌ FAIL: " + msg);
    process.exitCode = 1;
    throw new Error(msg);
  }
  console.log("✅ PASS: " + msg);
}

function createDom(initialTheme, initialDensity) {
  let html = "";
  let theme = initialTheme || "dark";
  let density = initialDensity || "comfortable";
  const appListeners = {};
  const appAttributes = {};
  const appElement = {
    get innerHTML() { return html; },
    set innerHTML(v) { html = v; },
    addEventListener: function(type, listener) {
      if (!appListeners[type]) appListeners[type] = [];
      appListeners[type].push(listener);
    },
    removeEventListener: function(type, listener) {
      const listeners = appListeners[type] || [];
      appListeners[type] = listeners.filter(function(fn) { return fn !== listener; });
    },
    setAttribute: function(name, value) { appAttributes[name] = String(value); },
    getAttribute: function(name) { return appAttributes[name] === undefined ? null : appAttributes[name]; },
    dispatchEvent: function(event) {
      const listeners = (appListeners[event.type] || []).slice();
      listeners.forEach(function(listener) { listener.call(appElement, event); });
      return true;
    },
    listenerCount: function(type) { return (appListeners[type] || []).length; }
  };
  return {
    get html() { return html; },
    set html(v) { html = v; },
    get theme() { return theme; },
    get density() { return density; },
    dispatchAppEvent: function(event) { return appElement.dispatchEvent(event); },
    appListenerCount: function(type) { return appElement.listenerCount(type); },
    appAttribute: function(name) { return appElement.getAttribute(name); },
    getElementById: function(id) {
      if (id === "app") {
        return appElement;
      }
      if (id === "root") {
        return {
          setAttribute: function(k, v) {
            if (k === "data-theme") theme = v;
            if (k === "data-density") density = v;
          },
          getAttribute: function(k) {
            if (k === "data-theme") return theme;
            if (k === "data-density") return density;
            return null;
          }
        };
      }
      return null;
    }
  };
}

function boot(opts) {
  opts = opts || {};
  const dom = createDom(opts.theme, opts.density);
  global.document = dom;
  const pendingTimers = [];
  const intervals = [];

  const ctx = {
    window: {},
    document: dom,
    console: console,
    setTimeout: function(cb, ms) {
      if (typeof cb === "function") {
        if (ms > 0) {
          pendingTimers.push(cb);
        } else {
          cb();
        }
      }
      return 0;
    },
    setImmediate: function(cb) { if (typeof cb === "function") cb(); return 0; },
    setInterval: function(cb, ms) {
      var entry = { id: intervals.length + 1, callback: cb, ms: ms, active: true };
      intervals.push(entry);
      return entry.id;
    },
    clearTimeout: function() {},
    clearInterval: function(id) {
      intervals.forEach(function(entry) { if (entry.id === id) entry.active = false; });
    }
  };
  ctx.window = ctx;

  // Minimal localStorage mock with per-context storage
  const store = {};
  ctx.localStorage = {
    getItem: function(k) { return store[k] === undefined ? null : store[k]; },
    setItem: function(k, v) { store[k] = String(v); },
    removeItem: function(k) { delete store[k]; }
  };

  // Promise-based fetch mock: call-site can override via ctx.fetch = ...
  ctx.fetch = function() { return Promise.resolve({ status: 200, ok: true, headers: {}, json: function() { return Promise.resolve({ days: {}, startDate: "2026-01-01" }); } }); };

  vm.createContext(ctx);
  vm.runInContext(read("panelCoverageManifest.js"), ctx);
  vm.runInContext(read("panel-v2.js"), ctx);

  const helper = {
    dom: dom,
    ctx: ctx,
    AeonV2: ctx.AeonV2,
    read: read,
    assert: assert,
    runTimers: function() {
      var cbs = pendingTimers.slice();
      pendingTimers.length = 0;
      cbs.forEach(function(cb) { try { cb(); } catch (e) {} });
      return cbs.length;
    },
    runIntervals: function() {
      var active = intervals.filter(function(entry) { return entry.active; }).slice();
      active.forEach(function(entry) { if (typeof entry.callback === "function") entry.callback(); });
      return active.length;
    },
    intervalInfo: function() {
      return intervals.map(function(entry) {
        return { id: entry.id, ms: entry.ms, active: entry.active };
      });
    },
    flushPromises: async function() {
      await new Promise(function(resolve) { setImmediate(resolve); });
    }
  };

  return helper;
}

module.exports = { boot, read, assert };
