"use strict";

// MON-41 — Reminder Center view registry sınırı.
// Yalnız node:vm sentetik resolver'ları kullanır: DOM, storage, timer, ağ,
// native permission ve gerçek kullanıcı verisi yoktur. App-owned section
// strings/handlers yalnız mevcut API yüzeyinden enjekte edilir.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "../..");
const moduleSource = fs.readFileSync(path.join(ROOT, "app/core/reminders.js"), "utf8");
const appSource = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const driverSource = fs.readFileSync(path.join(ROOT, ".claude/skills/run-seyma/driver.mjs"), "utf8");
const zikrSource = fs.readFileSync(path.join(ROOT, ".claude/skills/run-seyma/zikr-harness.mjs"), "utf8");
const rebindSource = fs.readFileSync(path.join(ROOT, "tests/app/test_state_rebind_boundary.js"), "utf8");

function ok(name, condition) {
  assert.equal(condition, true, name);
  console.log("PASS  " + name);
}

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const coldSandbox = { window: {}, console };
vm.runInNewContext(moduleSource, coldSandbox, { filename: "app/core/reminders.js#cold" });
const registry = coldSandbox.window.SeymaReminders;
ok("SeymaReminders view registry yüklemede expose edilir", !!registry && Object.isFrozen(registry));
ok("module load sırasında DOM/storage/timer/ağ açılmaz", !/\b(?:document|localStorage|fetch|setTimeout|setInterval|navigator\.)\s*\.?\s*\(?/u.test(moduleSource));
ok("native permission ve remote write API'si view modülünde yok", !/Notification\s*\(|requestPermission\s*\(|\b(?:XMLHttpRequest|WebSocket)\b/u.test(moduleSource));
ok("view üyeleri ve tek-seferlik registration API'si vardır",
  typeof registry.registerReminderView === "function" &&
  typeof registry.reminderCardHTML === "function" &&
  typeof registry.reminderCenterOverlayHTML === "function" &&
  typeof registry.reminderCategoryState === "function");

const definitions = [{
  id: "reminder.catalog.v1.fixture",
  category: "ritual",
  priority: "P1",
  triggerType: "fixed-time",
  deepLink: "faith",
  privateTitle: "Katalog başlığı fixture",
  privateBody: "Katalog gövdesi fixture",
  defaultWindow: { kind: "fixed-time", time: "09:00" },
  defaultChannel: "in_app",
  definitionVersion: "1.0.0",
}];
const state = {
  preferences: {},
  profile: "balanced",
  policy: {
    quietHours: { start: "22:30", end: "07:30" },
    nativeDailyCap: 3,
    lowPriorityNativeCap: 1,
    sameCategoryCooldownMinutes: 360,
    capacityMode: "balanced",
  },
};
const ui = { reminderPreviewId: "", reminderPreviewLegacyId: "", reminderTodayMuted: false };
const calls = Object.create(null);
function counted(name, fn) {
  return function () {
    calls[name] = (calls[name] || 0) + 1;
    return fn.apply(null, arguments);
  };
}
const deps = {
  ui: counted("ui", () => ui),
  root: counted("root", () => state),
  definitions: counted("definitions", () => definitions),
  copy: counted("copy", (key, fallback) => fallback),
  icon: counted("icon", (name, size) => `<i data-icon="${esc(name)}" data-size="${size || 20}"></i>`),
  esc: counted("esc", esc),
  normalizePolicy: counted("normalizePolicy", (value) => Object.assign({
    quietHours: { start: "22:30", end: "07:30" },
    nativeDailyCap: 3,
    lowPriorityNativeCap: 1,
    sameCategoryCooldownMinutes: 360,
    capacityMode: "balanced",
  }, value || {})),
  permissionSnapshot: counted("permissionSnapshot", () => "default"),
  permissionExplanation: counted("permissionExplanation", () => ({ label: "İzin durumu", meaning: "Uygulama içi yol açık." })),
  profileLabel: counted("profileLabel", () => "Dengeli"),
  sections: counted("sections", () => ({
    notice: "<div data-fixture-section=notice></div>",
    systemStatus: "<div data-fixture-section=status></div>",
    profile: "<div data-fixture-section=profile></div>",
    digestLauncher: "<div data-fixture-section=digest></div>",
    digest: "",
    testPreview: "",
    policy: "<div data-fixture-section=policy></div>",
    personalization: "",
    permission: "<div data-fixture-section=permission></div>",
    categories: "<div data-fixture-section=categories></div>",
    specialDays: "",
    care: "",
    medication: "",
    history: "",
    retention: "",
  })),
  deepLinkTarget: counted("deepLinkTarget", () => ({ ok: true })),
  previewSafeCopy: counted("previewSafeCopy", () => ({ detail: "Uygulama içi sentetik önizleme" })),
  channels: counted("channels", () => ({ in_app: true, native: true })),
  validTime: counted("validTime", (value) => /^(?:[01]\d|2[0-3]):[0-5]\d$/u.test(value)),
};

ok("eksik view dependency bag fail-closed reddedilir", registry.registerReminderView({}) === false);
ok("tam view dependency bag bir kez kaydolur", registry.registerReminderView(deps) === true);
ok("ikinci view dependency bag reddedilir", registry.registerReminderView(deps) === false);

const before = JSON.stringify({ state, ui });
const card = registry.reminderCardHTML(definitions[0], 0);
const overlay = registry.reminderCenterOverlayHTML();
const after = JSON.stringify({ state, ui });
ok("katalog-backed card builder mevcut metni ve App handler shimini taşır",
  card.includes("Katalog başlığı fixture") &&
  card.includes("App.previewReminderSafe(") &&
  card.includes("App.setReminderEnabled(") &&
  card.includes("Uygulama içi önizleme"));
ok("Reminder Center dış kabuğu modal/focus semantiğini korur",
  overlay.includes('id="sey-reminder-overlay"') &&
  overlay.includes('role="dialog"') &&
  overlay.includes('aria-modal="true"') &&
  overlay.includes('tabindex="-1"') &&
  overlay.includes("App.onReminderKeydown(event)") &&
  overlay.includes("App.closeReminderCenter()"));
ok("registry HTML üretimi state/ui yazmaz", before === after);
ok("registry mevcut Catalog/API resolverlarını gerçekten tüketir",
  (calls.definitions || 0) > 0 && (calls.copy || 0) > 0 && (calls.deepLinkTarget || 0) > 0 &&
  (calls.sections || 0) > 0 && (calls.icon || 0) > 0 && (calls.esc || 0) > 0);
ok("view source frozen Catalog private copy'sini kopyalamaz",
  !moduleSource.includes("Katalog başlığı fixture") && !moduleSource.includes("Katalog gövdesi fixture"));
ok("view source mutation/DOM/storage/network/notification yüzeyine sahip değil",
  !/\b(?:document|localStorage|fetch|setTimeout|setInterval|navigator\.)\s*\.?\s*\(?/u.test(moduleSource) &&
  !/Notification\s*\(|requestPermission\s*\(|\.setItem\s*\(|\b(?:save|commit|render)\s*\(/u.test(moduleSource));

ok("app.js view shim ve app-owned modal/permission handlerları korunuyor",
  /function reminderCenterOverlayHTML\(\)\{[\s\S]*?SEYMA_REMINDERS\.reminderCenterOverlayHTML/u.test(appSource) &&
  /App\.openReminderCenter=function/u.test(appSource) &&
  /App\.closeReminderCenter=function/u.test(appSource) &&
  /App\.onReminderKeydown=function/u.test(appSource) &&
  /App\.requestReminderPermission=function/u.test(appSource));
ok("reminder.js cache-bust ve üç headless FILES zinciri güncel",
  indexSource.includes('app/core/reminders.js?v=20260911b') &&
  driverSource.includes("'app/core/reminders.js'") &&
  zikrSource.includes("'app/core/reminders.js'") &&
  rebindSource.includes("'app/core/reminders.js'"));
ok("driver reminder dump yolu ve no-network modal kanıtı tanımlı",
  driverSource.includes("dumpTab === 'reminder'") &&
  driverSource.includes("sb2.App.openReminderCenter()"));

console.log("\nMON-41 view boundary: PASS");
