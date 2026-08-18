"use strict";

// REM-54 — G12-K app runtime acceptance gate.
//
// Bu fixture yeni bir davranış tanımlamaz; REM-44–REM-53 ile kurulan app
// runtime hattını gerçek headless boot'lar üzerinde birlikte kapatır:
// boot / modül kablolaması, modül ↔ fallback denkliği, iki tema, mobil
// genişlik, overlay + draft, offline, permission ve no-network sınırı.
//
// Sınırlar: gerçek tarayıcı yok, gerçek ağ yok, gerçek localStorage yok,
// `mustafaras/seyma-data` yazması yok. Her boot `node:vm` içinde sentetik
// state ile çalışır ve `fetch` çağrıldığında sayaç artar (assertion konusu).

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const INDEX = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const APP_SOURCE = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const STYLES = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
const MOBILE_MAX_WIDTH = 460;

// app.js'in çalışma anında tercih ettiği saf modüller. Her satır bir
// sözleşmedir: "app.js bu global'i arıyorsa index.html onu yüklemelidir".
const RUNTIME_MODULES = [
  { global: "ReminderCatalogV1", file: "app/core/reminderCatalog.js" },
  { global: "ReminderDeliveryV1", file: "app/core/reminderDelivery.js" },
  { global: "ReminderEngineV1", file: "app/core/reminderEngine.js" },
  { global: "ReminderSchedulerV1", file: "app/core/reminderScheduler.js" }
];

const BASE_FILES = ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js"];

function readSource(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function makeElement(id, documentRef, options) {
  const attrs = {};
  const classes = new Set();
  const opts = options || {};
  return {
    id: id || "",
    tagName: String(opts.tagName || "DIV").toUpperCase(),
    _html: "",
    _text: "",
    style: { cssText: "", overflow: "", overscrollBehavior: "", setProperty() {} },
    classList: {
      add(...tokens) { tokens.forEach((token) => classes.add(token)); },
      remove(...tokens) { tokens.forEach((token) => classes.delete(token)); },
      toggle(token, force) {
        if (force === true || (force !== false && !classes.has(token))) classes.add(token);
        else classes.delete(token);
        return classes.has(token);
      },
      contains(token) { return classes.has(token); }
    },
    dataset: {},
    children: [],
    scrollTop: 0,
    offsetWidth: opts.width || 390,
    clientWidth: opts.width || 390,
    clientHeight: 780,
    scrollHeight: 1800,
    value: "",
    files: [],
    parentNode: null,
    get innerHTML() { return this._html; },
    set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; },
    set textContent(value) { this._text = String(value); },
    setAttribute(name, value) { attrs[name] = String(value); },
    getAttribute(name) { return Object.prototype.hasOwnProperty.call(attrs, name) ? attrs[name] : null; },
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild(child) { this.children = this.children.filter((item) => item !== child); },
    remove() {}, replaceWith() {}, insertBefore(child) { return child; },
    addEventListener() {}, removeEventListener() {}, click() {},
    focus() { if (documentRef) documentRef.activeElement = this; },
    blur() { if (documentRef && documentRef.activeElement === this) documentRef.activeElement = null; },
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: opts.width || 390, height: 780 }; }
  };
}

// Reminder onboarding'i TAMAMLANMAMIS durum. Auth alanlari dolu, cunku
// `needsAuth()` yalnizca varlik kontrol eder; kilit ekrani ayri bir case'te
// dogrulanir ve gercek kimlik bilgisi hicbir zaman fixture'a girmez.
function onboardingState() {
  const state = seededState();
  state.reminders = { schemaVersion: 1, preferences: {}, onboarding: { completed: false, selectedCategories: [] } };
  state.days = {};
  state.settings.nickname = "REM-54 onboarding fixture";
  return state;
}

function seededState() {
  return {
    version: 2,
    startDate: "2026-08-18",
    lastOpenedDate: "2026-08-18",
    days: {
      "2026-08-18": { mood: 4, note: "", ticks: {} }
    },
    notifications: [],
    luna: { qa: [] },
    aeon: { qa: [] },
    reminders: {
      schemaVersion: 1,
      preferences: {},
      profile: "balanced",
      onboarding: { completed: true, selectedCategories: ["faith"] }
    },
    settings: {
      nickname: "REM-54 acceptance fixture",
      ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "",
      profileAssessmentInactive: true, locationEnabled: false, locationMode: "auto",
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: "2026-08-18T06:00:00.000Z" }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

// Tek boot yardımcısı. `modules` seçeneği modül ↔ fallback denkliğini
// kanıtlamayı mümkün kılar; `permission` ve `online` gerçek sistem yerine
// sentetik sınırları sürer.
function boot(options) {
  const opts = options || {};
  const registry = {};
  const consoleErrors = [];
  let documentRef = null;
  let fetchCalls = 0;
  const fetchUrls = [];
  let paints = 0;

  let networkBaseline = 0;

  function register(element) { if (element && element.id) registry[element.id] = element; return element; }

  const width = opts.width || 390;
  const app = register(makeElement("app", null, { width }));
  Object.defineProperty(app, "innerHTML", {
    configurable: true,
    get() { return app._html; },
    set(value) {
      app._html = String(value);
      paints += 1;
      const pattern = /\bid=["']([^"']+)["']/gu;
      let match;
      while ((match = pattern.exec(app._html))) register(makeElement(match[1], documentRef, { width }));
    }
  });
  const root = register(makeElement("root", null, { width }));
  const body = register(makeElement("body", null, { width }));

  const store = opts.seed ? { "seyma-reset-v1": JSON.stringify(opts.seed) } : {};
  if (opts.theme) store["seyma-theme"] = opts.theme;
  const writtenKeys = new Set(Object.keys(store));
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); writtenKeys.add(key); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };

  const document = {
    hidden: false,
    activeElement: null,
    body,
    documentElement: root,
    getElementById(id) { return registry[id] || null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement() { return makeElement("", documentRef, { width }); },
    createDocumentFragment() { return makeElement("", documentRef, { width }); },
    addEventListener() {}, removeEventListener() {}
  };
  documentRef = document;

  let permissionRequests = 0;
  const permission = Object.prototype.hasOwnProperty.call(opts, "permission") ? opts.permission : "granted";
  let NotificationMock;
  if (permission !== "unsupported") {
    NotificationMock = function NotificationMock() {};
    NotificationMock.permission = permission;
    NotificationMock.requestPermission = function requestPermission() {
      permissionRequests += 1;
      return Promise.resolve(permission);
    };
  }

  class DOMParserStub {
    parseFromString() {
      return { body: makeElement("body", documentRef, { width }), querySelector() { return null; }, querySelectorAll() { return []; } };
    }
  }

  const consoleProxy = {
    log() {},
    info() {},
    debug() {},
    warn(...args) { consoleErrors.push(["warn", args.map(String).join(" ")]); },
    error(...args) { consoleErrors.push(["error", args.map(String).join(" ")]); }
  };

  const sandbox = {
    console: consoleProxy,
    localStorage,
    document,
    navigator: {
      userAgent: "rem-54-acceptance-fixture",
      onLine: opts.online === false ? false : true,
      vibrate() {},
      clipboard: { writeText() { return Promise.resolve(); } },
      geolocation: {
        getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20 } }); },
        watchPosition() { return 1; },
        clearWatch() {}
      }
    },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    innerWidth: width,
    innerHeight: 780,
    matchMedia(query) {
      const matches = typeof query === "string" && /max-width:\s*(\d+)/u.test(query)
        ? width <= Number(/max-width:\s*(\d+)/u.exec(query)[1])
        : false;
      return { matches, media: String(query || ""), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} };
    },
    DOMParser: DOMParserStub,
    fetch(resource) {
      fetchCalls += 1;
      fetchUrls.push(String((resource && resource.url) || resource || ""));
      return new Promise(() => {});
    },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-54-acceptance-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-54"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
    Promise, Set, Map, Symbol, Intl
  };
  if (NotificationMock) sandbox.Notification = NotificationMock;
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;

  const context = vm.createContext(sandbox);
  BASE_FILES.forEach((file) => vm.runInContext(readSource(file), context, { filename: file }));
  const moduleFiles = opts.modules === undefined ? RUNTIME_MODULES.map((entry) => entry.file) : opts.modules;
  moduleFiles.forEach((file) => vm.runInContext(readSource(file), context, { filename: file }));
  vm.runInContext(APP_SOURCE, context, { filename: "app.js" });

  return {
    sandbox,
    App: sandbox.App,
    // Uygulamayi gercek kullanici gibi acar: once boot, sonra konum kapisini
    // acik bir kullanici eylemiyle gecer. Bu kapi gecilmezse hicbir reminder
    // yuzeyi cizilmez ve render assertion'lari BOS kalirdi (REM-52 dersi).
    startUnlocked() {
      sandbox.App.start();
      sandbox.App.requestLocationGatePermission();
      networkBaseline = fetchCalls;
      return sandbox.App;
    },
    networkBaseline: () => networkBaseline,
    fetchUrls: () => fetchUrls.slice(),
    html: () => app._html,
    root,
    store,
    writtenKeys: () => [...writtenKeys],
    fetchCalls: () => fetchCalls,
    paints: () => paints,
    consoleErrors: () => consoleErrors.slice(),
    permissionRequests: () => permissionRequests
  };
}

function scriptSources() {
  return [...INDEX.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gu)].map((match) => match[1]);
}

// Konum kapisini acik kullanici eylemiyle gecmek, app'in ONCEDEN VAR OLAN
// namaz/konum ozelligini tetikler ve bu reminder'a ait degildir. Bu yuzden
// iddia "hic fetch yok" degil, "reminder yolu SIFIR ag cagrisi ekler"dir --
// ve hicbir cagri reminder yuzeyine ait bir adres tasimaz.
function assertReminderAddedNoNetwork(out) {
  assertEqual(out.fetchCalls(), out.networkBaseline());
  out.fetchUrls().forEach((url) => {
    ["reminder", "seyma-reminder", "observer-inbox", "aeon-outbox"].forEach((needle) => {
      assert(!url.toLowerCase().includes(needle));
    });
  });
}

function reminderCenterHTML(out) {
  out.startUnlocked();
  out.App.go("ayarlar");
  out.App.openReminderCenter();
  return out.html();
}

// Reminder Center gerçekten çizildi mi? REM-52'nin dersi: bir hard gate
// ekranı boşaltırsa "içerik yok" assertion'ları sessizce doğru çıkar.
// Bu yüzden her render iddiasından önce ekranın DOLU olduğu kanıtlanır.
function assertReminderCenterRendered(html) {
  assert(html.length > 1200);
  assert(html.includes('id="sey-reminder-screen"'));
  assert(html.includes('id="sey-reminder-overlay"'));
  assert(html.includes("sey-reminder-categories"));
  assert(html.includes("sey-reminder-catalog"));
  assert(html.includes('class="sey-reminder-close"'));
  assert(html.includes('id="sey-reminder-system-status"'));
}

const cases = [
  // ── A. Boot ve modül kablolaması ────────────────────────────────────
  ["every reminder module app.js prefers at runtime is actually loaded by index.html", () => {
    const scripts = scriptSources();
    const bare = scripts.map((src) => src.split("?")[0]);
    const appIndex = bare.indexOf("app.js");
    assert(appIndex >= 0);
    RUNTIME_MODULES.forEach((entry) => {
      // app.js bu global'i gerçekten arıyor mu? (indirect `window[key]`
      // erişimi de sayılır — string kaçamağı sözleşmeyi bozmamalı.)
      const referenced = APP_SOURCE.includes(`window.${entry.global}`)
        || APP_SOURCE.includes(`'${entry.global}'`)
        || APP_SOURCE.includes(`"${entry.global}"`);
      assert(referenced);
      const moduleIndex = bare.indexOf(entry.file);
      assert(moduleIndex >= 0);
      assert(moduleIndex < appIndex);
      assert(/\?v=[^&\s"]+$/u.test(scripts[moduleIndex]));
    });
  }],
  ["no app/core module ships unloaded and every classic script is cache-busted", () => {
    const scripts = scriptSources();
    const bare = scripts.map((src) => src.split("?")[0]);
    fs.readdirSync(path.join(ROOT, "app/core"))
      .filter((name) => name.endsWith(".js"))
      .forEach((name) => assert(bare.includes(`app/core/${name}`)));
    scripts.forEach((src) => assert(/\?v=[^&\s"]+$/u.test(src)));
    assertEqual(new Set(bare).size, bare.length);
  }],
  ["script tags balance and constants stay ahead of every reminder module", () => {
    const open = (INDEX.match(/<script\b/gu) || []).length;
    const close = (INDEX.match(/<\/script>/gu) || []).length;
    assertEqual(open, close);
    const bare = scriptSources().map((src) => src.split("?")[0]);
    const constantsIndex = bare.indexOf("app/core/constants.js");
    assert(constantsIndex >= 0);
    RUNTIME_MODULES.forEach((entry) => assert(bare.indexOf(entry.file) > constantsIndex));
    assert(bare.indexOf("app.js") < bare.indexOf("sync.js"));
  }],
  ["modules expose frozen namespaces and cannot clobber App or constants", () => {
    const out = boot({ seed: seededState() });
    RUNTIME_MODULES.forEach((entry) => {
      const value = out.sandbox[entry.global];
      assert(value && typeof value === "object");
      assert(Object.isFrozen(value));
      assert(value !== out.sandbox.App);
      assert(value !== out.sandbox.SeymaConstants);
    });
    assert(out.sandbox.App && typeof out.sandbox.App.reminderPolicyForState === "function");
    assertEqual(out.fetchCalls(), 0);
  }],

  // ── B. Modül ↔ fallback denkliği ────────────────────────────────────
  ["delivery module and inline fallback describe an identical channel boundary", () => {
    const withModule = boot({ seed: seededState() });
    const withoutModule = boot({ seed: seededState(), modules: ["app/core/reminderCatalog.js"] });
    const a = withModule.App.reminderNotificationBoundary();
    const b = withoutModule.App.reminderNotificationBoundary();
    assertEqual(a.moduleLoaded, true);
    assertEqual(b.moduleLoaded, false);
    // Modul, fallback'in tanimladigi her alani AYNI degerle tasir ve
    // uzerine ek metadata ekler. Sozlesme "birebir ayni nesne" degil,
    // "fallback modulun degerce ozdes alt kumesi"dir; davranis (siniflandirma)
    // ise tam olarak ayni kalmalidir.
    ["aeon", "reminder"].forEach((channel) => {
      const moduleChannel = a.channels[channel];
      const fallbackChannel = b.channels[channel];
      assert(moduleChannel && fallbackChannel);
      Object.keys(fallbackChannel).forEach((field) => {
        assert(deepEqual(fallbackChannel[field], moduleChannel[field]));
      });
    });
    assertEqual(a.channels.aeon.permissionField === a.channels.reminder.permissionField, false);
    assertEqual(a.channels.aeon.historyField === a.channels.reminder.historyField, false);
    assertEqual(a.channels.aeon.tagPrefix === a.channels.reminder.tagPrefix, false);
    assert(deepEqual(a.capabilities, b.capabilities));
    assert(deepEqual(a.permissionStates, b.permissionStates));
    assert(deepEqual(a.permissionAliases, b.permissionAliases));
    assertEqual(a.disjoint.ok, true);
    [
      { data: { type: "reminder" }, tag: "" },
      { data: { type: "aeon-message" }, tag: "aeon-message" },
      { data: {}, tag: "seyma-reminder-v1:abc" },
      { data: { type: "reminder-preview" }, tag: "reminder-preview-v1" },
      { data: { type: "unknown" }, tag: "unknown" }
    ].forEach((payload) => {
      assertEqual(
        withModule.App.reminderNotificationChannel(payload),
        withoutModule.App.reminderNotificationChannel(payload)
      );
    });
  }],
  ["engine module and inline fallback generate identical occurrences", () => {
    const withModule = boot({ seed: seededState() });
    const withoutModule = boot({ seed: seededState(), modules: ["app/core/reminderCatalog.js"] });
    const inputs = [
      { reminderId: "reminder.catalog.v1.faith", localDate: "2026-08-18", dayPart: "morning", timezone: "Europe/Istanbul", nowIso: "2026-08-18T05:00:00.000Z", definitionVersion: "1" },
      { reminderId: "reminder.catalog.v1.care", localDate: "2026-08-18", time: "21:30", timezone: "Europe/Istanbul", nowIso: "2026-08-18T15:00:00.000Z", definitionVersion: "1" },
      { reminderId: "reminder.catalog.v1.zikr", localDate: "2026-02-29", dayPart: "night", timezone: "Europe/Istanbul", nowIso: "2026-08-18T20:00:00.000Z", definitionVersion: "1" },
      { reminderId: "", localDate: "not-a-date", timezone: "Mars/Olympus", nowIso: "nope", definitionVersion: "" }
    ];
    inputs.forEach((input) => {
      const a = withModule.App.reminderGenerateOccurrence(input);
      const b = withoutModule.App.reminderGenerateOccurrence(input);
      assert(deepEqual(a, b));
      assertEqual(
        withModule.App.reminderOccurrenceId(input.reminderId, input.localDate, input.nowIso, input.timezone, input.definitionVersion),
        withoutModule.App.reminderOccurrenceId(input.reminderId, input.localDate, input.nowIso, input.timezone, input.definitionVersion)
      );
    });
    assertEqual(
      JSON.stringify(withModule.App.reminderEngineLocalParts(Date.parse("2026-08-18T12:00:00.000Z"), "Europe/Istanbul")),
      JSON.stringify(withoutModule.App.reminderEngineLocalParts(Date.parse("2026-08-18T12:00:00.000Z"), "Europe/Istanbul"))
    );
  }],
  ["scheduler module and inline fallback account for the same trigger sequence", () => {
    const sequence = ["boot", "foreground", "foreground", "focus", "online", "timer", "manual", "not-a-trigger"];
    const withModule = boot({ seed: seededState() });
    const withoutModule = boot({ seed: seededState(), modules: ["app/core/reminderCatalog.js"] });
    withModule.App.start();
    withoutModule.App.start();
    withModule.App.reminderSchedulerReset();
    withoutModule.App.reminderSchedulerReset();
    sequence.forEach((trigger) => {
      withModule.App.reminderSchedulerTrigger(trigger);
      withoutModule.App.reminderSchedulerTrigger(trigger);
    });
    const a = withModule.App.reminderSchedulerState();
    const b = withoutModule.App.reminderSchedulerState();
    assertEqual(Object.keys(a).sort().join(","), Object.keys(b).sort().join(","));
    ["receivedCount", "evaluateCount", "coalescedCount", "deliveryCount", "lastTrigger",
     "burstMs", "catchUpMaxAgeMs", "foregroundOnly", "backgroundScheduling",
     "nativeReplay", "appClosedGuarantee"].forEach((field) => {
      assert(deepEqual(a[field], b[field]));
    });
    // `lastAtMs` duvar saatidir; iki ardisik boot arasinda dogal olarak
    // milisaniye farkiyla ayrilir. Sozlesme sayaclarin ve "hic tetiklenmedi"
    // durumunun ozdesligidir, zaman damgasinin degil.
    const counters = (matrix) => Object.keys(matrix).sort().map((name) => {
      const cell = matrix[name];
      return [name, cell.received, cell.evaluated, cell.coalesced, cell.lastAtMs === null].join(":");
    }).join("|");
    assertEqual(counters(a.triggerMatrix), counters(b.triggerMatrix));
    assert(deepEqual(a.triggerOrder, b.triggerOrder));
    assert(a.receivedCount > 0);
    assert(a.coalescedCount > 0);
    // Gecersiz trigger iki yolda da sessizce yeni bir kanal ACMAZ; bilinen
    // `manual` kanalina fail-closed dusurulur.
    assertEqual(Object.prototype.hasOwnProperty.call(a.triggerMatrix, "not-a-trigger"), false);
    assertEqual(Object.prototype.hasOwnProperty.call(b.triggerMatrix, "not-a-trigger"), false);
    assertEqual(a.lastTrigger, "manual");
    assertEqual(a.triggerMatrix.manual.received, 2);
    assertEqual(a.triggerMatrix.manual.evaluated, 1);
    assertEqual(a.backgroundScheduling, false);
    assertEqual(a.foregroundOnly, true);
    assertEqual(withModule.fetchCalls(), 0);
    assertEqual(withoutModule.fetchCalls(), 0);
  }],

  // ── C. Render kabulü ────────────────────────────────────────────────
  ["a locked boot stops at the auth gate and leaks no reminder surface", () => {
    // Gercek kimlik bilgisi fixture'a hic girmez; kilitli durumun reminder
    // yuzeyini sizdirmadigi kanitlanir.
    const out = boot({ seed: null });
    out.App.start();
    assert(out.html().includes("sey-auth-backdrop"));
    assert(!out.html().includes("sey-reminder-screen"));
    out.App.openReminderCenter();
    assert(!out.html().includes("sey-reminder-screen"));
    assertEqual(out.fetchCalls(), 0);
  }],
  ["reminder-onboarding boot opens a populated Reminder Center without network", () => {
    const out = boot({ seed: onboardingState() });
    out.startUnlocked();
    assert(!out.html().includes("sey-auth-backdrop"));
    assert(!out.html().includes('data-location-gate-state="required"'));
    const html = reminderCenterHTML(out);
    assertReminderCenterRendered(html);
    // Onboarding tamamlanmadi: kurulum yolu acik kalmali.
    assert(html.includes("sey-reminder-categories"));
    assertReminderAddedNoNetwork(out);
    assertEqual(out.consoleErrors().length, 0);
  }],
  ["seeded boot renders the Reminder Center with catalog-backed categories", () => {
    const out = boot({ seed: seededState() });
    const html = reminderCenterHTML(out);
    assertReminderCenterRendered(html);
    assert(out.paints() >= 2);
    assertReminderAddedNoNetwork(out);
    assertEqual(out.consoleErrors().length, 0);
  }],
  ["Reminder Center renders in both themes and the theme choice is honoured", () => {
    const light = boot({ seed: seededState(), theme: "light" });
    const lightHTML = reminderCenterHTML(light);
    assertReminderCenterRendered(lightHTML);
    assertEqual(light.root.getAttribute("data-theme"), "light");

    light.App.toggleTheme();
    light.App.openReminderCenter();
    const darkHTML = light.html();
    assertReminderCenterRendered(darkHTML);
    assertEqual(light.root.getAttribute("data-theme"), "dark");

    const dark = boot({ seed: seededState(), theme: "dark" });
    const bootedDark = reminderCenterHTML(dark);
    assertReminderCenterRendered(bootedDark);
    assertEqual(dark.root.getAttribute("data-theme"), "dark");
    assertEqual(dark.consoleErrors().length, 0);
  }],
  ["reminder styling stays theme-variable driven and mobile-safe", () => {
    // CLAUDE.md ilke 2: yeni aksanlar CSS degiskeni olmali; ilke: tasarim
    // <=460px viewport hedefler. Sabit genis piksel bir mobil regresyondur.
    const reminderRules = STYLES.split(/(?=\.sey-reminder)/u).filter((chunk) => chunk.startsWith(".sey-reminder"));
    assert(reminderRules.length > 0);
    const joined = reminderRules.join("\n");
    const widths = [...joined.matchAll(/(?:^|[^-])width\s*:\s*(\d+)px/gu)].map((match) => Number(match[1]));
    widths.forEach((value) => assert(value <= MOBILE_MAX_WIDTH));
    const darkBlock = STYLES.includes('#root[data-theme="dark"]');
    assert(darkBlock);
  }],
  ["mobile-width boot keeps the Reminder Center renderable", () => {
    const out = boot({ seed: seededState(), width: 360 });
    const html = reminderCenterHTML(out);
    assertReminderCenterRendered(html);
    assertReminderAddedNoNetwork(out);
    assertEqual(out.consoleErrors().length, 0);
  }],

  // ── D. Etkileşim: overlay, draft, offline, permission ───────────────
  ["overlay open/close preserves an in-progress medication draft", () => {
    const out = boot({ seed: seededState() });
    reminderCenterHTML(out);
    out.App.setReminderMedicationDraftField("kind", "medication");
    out.App.setReminderMedicationDraftField("name", "SENTETIK_REM54_ILAC");
    out.App.setReminderMedicationDraftField("time", "08:30");

    // Draft `ui` icinde yasar ve disari acilmaz; korunmayi ic degiskeni
    // kurcalayarak degil, overlay turundan SONRA kaydin ayni degerlerle
    // olusmasiyla kanitliyoruz.
    out.App.openFaithCorner();
    out.App.closeFaithCorner();
    out.App.openReminderCenter();
    assertReminderCenterRendered(out.html());

    const saved = out.App.saveReminderMedicationDraft();
    assertEqual(saved.ok, true);
    assertEqual(saved.schedule.time, "08:30");
    assertEqual(saved.schedule.kind, "medication");
    assertEqual(saved.updated, false);

    // Ilac adi local-only kalir: sync payload'ina hicbir bicimde girmez.
    const payload = JSON.stringify(out.App.reminderCurrentSyncPayload() || {});
    assert(!payload.includes("SENTETIK_REM54_ILAC"));
    assertReminderAddedNoNetwork(out);
  }],
  ["offline boot reports an honest status without closing the in-app path", () => {
    const offline = boot({ seed: seededState(), online: false });
    const offlineStatus = offline.App.reminderSystemStatus();
    assertEqual(offlineStatus.networkState, "offline");
    assertEqual(offlineStatus.state, "offline");
    assertEqual(offlineStatus.capability.inApp, "available");
    assertEqual(offlineStatus.capability.native, "in_app_only");
    assertEqual(offlineStatus.backgroundState, "unsupported");
    const html = reminderCenterHTML(offline);
    assertReminderCenterRendered(html);
    assertReminderAddedNoNetwork(offline);
    assertEqual(offline.consoleErrors().length, 0);

    const online = boot({ seed: seededState(), online: true });
    assertEqual(online.App.reminderSystemStatus().networkState, "online");
  }],
  ["every permission state renders and none of them requests permission by itself", () => {
    const seen = new Map();
    [
      ["granted", "granted"],
      ["denied", "denied"],
      ["default", "default"],
      ["unsupported", "unsupported"]
    ].forEach(([permission, expected]) => {
      const out = boot({ seed: seededState(), permission });
      const snapshot = out.App.reminderPermissionSnapshot();
      assertEqual(snapshot, expected);
      const status = out.App.reminderSystemStatus();
      assertEqual(status.permissionState, expected);
      assertEqual(status.capability.inApp, "available");
      const html = reminderCenterHTML(out);
      assertReminderCenterRendered(html);
      const explanation = out.App.reminderPermissionExplanation(snapshot);
      assert(explanation && typeof explanation === "object");
      seen.set(expected, JSON.stringify(explanation));
      // Hicbir durum kendiliginden izin istemez (REM-52 sozlesmesi).
      assertEqual(out.permissionRequests(), 0);
      assertReminderAddedNoNetwork(out);
      assertEqual(out.consoleErrors().length, 0);
    });
    assertEqual(seen.size, 4);
    assertEqual(new Set(seen.values()).size, 4);
  }],
  ["revoked permission stays renderable and distinct from denied", () => {
    const out = boot({ seed: seededState(), permission: "default" });
    const revoked = out.App.reminderPermissionState({ state: "revoked" });
    assertEqual(revoked, "revoked");
    const revokedCopy = JSON.stringify(out.App.reminderPermissionExplanation("revoked"));
    const deniedCopy = JSON.stringify(out.App.reminderPermissionExplanation("denied"));
    assert(revokedCopy.length > 2);
    assert(revokedCopy !== deniedCopy);
    assertEqual(out.permissionRequests(), 0);
  }],

  // ── E. Sınırlar: no-network, local-only, app-only scope ─────────────
  ["no boot performs a network call or writes an unexpected storage key", () => {
    const allowed = new Set([
      "seyma-reset-v1", "seyma-theme", "seyma-event-device-v1",
      "seyma-reminder-delivery-v1", "seyma-reminder-actions-v1", "seyma-reminder-permission-v1"
    ]);
    [
      { seed: null },
      { seed: seededState() },
      { seed: seededState(), online: false },
      { seed: seededState(), permission: "denied" },
      { seed: seededState(), modules: [] }
    ].forEach((options) => {
      const out = boot(options);
      reminderCenterHTML(out);
      out.App.reminderSchedulerTrigger("foreground");
      out.App.reminderSystemStatus();
      assertReminderAddedNoNetwork(out);
      assertEqual(out.consoleErrors().length, 0);
      out.writtenKeys().forEach((key) => assert(allowed.has(key)));
    });
  }],
  ["the app runtime never reaches into panel-owned surfaces or live actions", () => {
    // REM-54 app-only scope kaniti: app runtime panel yazicilarina,
    // panel projection dosyalarina veya dogrudan bir GitHub write verb'une
    // bagli degil. (sync.js ayri, yetkili ve REM-53'te kanitli sinirdir.)
    // Panel'e ait yaziclar / projection yukleyicileri app runtime'inda yok.
    // (`data/observer-inbox.json` ve `data/aeon-outbox.json` app'in KENDI
    // onceden var olan AEON sosyal transport hattidir, panel yuzeyi degildir;
    // bu yuzden burada needle degildir.)
    ["putInbox", "putTransportFileP", "loadObserverProjectionP", "observer-snapshot.json",
     "PanelCoverageV1", "panelCoverageManifest", "coverageForData", "redactForObserver"]
      .forEach((needle) => assert(!APP_SOURCE.includes(needle)));
    // Modul safligi: string literal degil, GERCEK API kullanimi aranir.
    const impureApis = [
      /\bfetch\s*\(/u, /\bXMLHttpRequest\b/u, /(?:window\.)?localStorage\s*\./u,
      /\bdocument\s*\./u, /\bsetTimeout\s*\(/u, /\bsetInterval\s*\(/u,
      /\bnavigator\s*\./u, /\bNotification\s*\(/u
    ];
    RUNTIME_MODULES.forEach((entry) => {
      const source = readSource(entry.file);
      impureApis.forEach((pattern) => assert(!pattern.test(source)));
    });
    const bare = scriptSources().map((src) => src.split("?")[0]);
    assert(!bare.includes("panel.js"));
    assert(!bare.includes("panel.css"));
  }]
];

runTests(cases).catch(() => { process.exitCode = 1; });
