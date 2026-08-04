// ÆON Panel v2 — Shared headless test helper
// DOM, timers ve minimal globals; panel-v2.js + panelCoverageManifest.js boot.
"use strict";

const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..", "..");
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
  return {
    get html() { return html; },
    set html(v) { html = v; },
    get theme() { return theme; },
    get density() { return density; },
    getElementById: function(id) {
      if (id === "app") {
        return {
          get innerHTML() { return html; },
          set innerHTML(v) { html = v; }
        };
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
    setInterval: function() { return 0; },
    clearTimeout: function() {},
    clearInterval: function() {}
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
    flushPromises: async function() {
      await new Promise(function(resolve) { setImmediate(resolve); });
    }
  };

  return helper;
}

module.exports = { boot, read, assert };
