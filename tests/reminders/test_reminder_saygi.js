"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DATE = "2026-08-15";
const NOW = "2026-08-15T18:30:00.000Z";
const TIMEZONE = "Europe/Istanbul";
const SAYGI_ID = "reminder.catalog.v1.saygi";
const ARTICLE_TITLE = "ARTICLE_TITLE_PRIVATE";
const PERSON_NAME = "PERSON_NAME_PRIVATE";

function element(id) {
  return {
    id: id || "", _html: "", _text: "", style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
    setAttribute() {}, getAttribute() { return null; }, appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; }, addEventListener() {}, removeEventListener() {},
    click() {}, focus() {}, blur() {}, querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; }, getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function baseState(preference) {
  const state = {
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {}, notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {}, policy: { quietHours: { start: "22:30", end: "07:30" }, nativeDailyCap: 3, lowPriorityNativeCap: 1, sameCategoryCooldownMinutes: 0, capacityMode: "balanced" } },
    settings: { nickname: "REM-17 Saygı fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, auth: { rememberMe: true, usernameHash: "fixture-auth", unlockedAt: NOW } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
  if (preference) state.reminders.preferences[SAYGI_ID] = preference;
  return state;
}

function boot(seed, options) {
  const opts = options || {};
  const app = element("app");
  const root = element("root");
  const store = { "seyma-reset-v1": JSON.stringify(seed) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; }, clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  const document = {
    hidden: false, body: element("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return element(""); }, createDocumentFragment() { return element(""); }, addEventListener() {}, removeEventListener() {}
  };
  const sandbox = {
    console, localStorage, document,
    navigator: { userAgent: "rem-17-saygi-fixture", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch: opts.fetch || function fetch() { return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {}, requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-17-saygi-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-17"; }, revokeObjectURL() {} }), URLSearchParams,
    Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  NotificationMock.requestPermission = function requestPermission() { return Promise.resolve("granted"); };
  sandbox.Notification = NotificationMock;
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "saygiPeople.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  return { sandbox, localStorage, app };
}

function preference(extra) {
  return Object.assign({
    reminderId: SAYGI_ID, enabled: true, channel: "in_app", frequency: "daily",
    timeWindow: { start: "18:00", end: "20:00" }, daysOfWeek: [6]
  }, extra || {});
}

function personForDate(out, date) {
  const people = out.sandbox.SaygiPeople;
  const epoch = Date.UTC(2026, 6, 13);
  const target = Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)));
  return people[((Math.floor((target - epoch) / 86400000) % people.length) + people.length) % people.length];
}

function articleFor(person, date = DATE, text = "Bu kişi hakkında okunabilir ve yeterince uzun bir biyografi metni.") {
  return { personId: person.id, dailyKey: `${date}|${person.id}`, title: ARTICLE_TITLE, blocks: [{ type: "p", text }], lead: text };
}

function occurrenceInput(out, pref, extra = {}) {
  const person = extra.person || out.sandbox.SaygiPeople[0];
  return Object.assign({ preference: pref, person, personId: person.id, article: articleFor(person), timezone: TIMEZONE, nowIso: NOW, localDate: DATE, localTime: "18:30" }, extra);
}

function privateFree(value) {
  const text = JSON.stringify(value);
  return !text.includes(ARTICLE_TITLE) && !text.includes(PERSON_NAME);
}

runTests([
  ["no preference or no explicit reading window produces no Saygı reminder", () => {
    const out = boot(baseState());
    const noPreference = out.sandbox.App.reminderSaygiOccurrence(occurrenceInput(out, { reminderId: SAYGI_ID }, { article: articleFor(out.sandbox.SaygiPeople[0]) }));
    assertEqual(noPreference.ok, false); assertEqual(noPreference.reason, "preference-disabled");
    const missing = out.sandbox.App.reminderSaygiOccurrence(occurrenceInput(out, preference(), { article: articleFor(out.sandbox.SaygiPeople[0]) }));
    assertEqual(missing.ok, true);
    const noWindow = out.sandbox.App.reminderSaygiOccurrence(occurrenceInput(out, { reminderId: SAYGI_ID, enabled: true, channel: "in_app" }));
    assertEqual(noWindow.ok, false); assertEqual(noWindow.reason, "reading-window-not-selected");
    const disabled = out.sandbox.App.reminderSaygiLifecycleCandidates(occurrenceInput(out, preference({ enabled: false })));
    assertEqual(disabled.length, 0);
  }],
  ["selected window yields at most one deterministic daily occurrence", () => {
    const out = boot(baseState());
    const pref = preference();
    const input = occurrenceInput(out, pref, { person: out.sandbox.SaygiPeople[0] });
    const first = out.sandbox.App.reminderSaygiOccurrence(input);
    const second = out.sandbox.App.reminderSaygiOccurrence(input);
    assert(first.ok); assertEqual(first.frequency, "daily"); assertEqual(first.occurrence.deepLink, "saygi"); assertEqual(first.occurrence.openDetail, true);
    assertEqual(first.occurrence.occurrenceId, second.occurrence.occurrenceId);
    assertEqual(out.sandbox.App.reminderSaygiLifecycleCandidates(input).length, 1);
    assert(privateFree(first));
  }],
  ["missing, loading, error and short articles fail closed and never count as read", () => {
    const out = boot(baseState());
    const person = out.sandbox.SaygiPeople[0];
    [
      ["missing", { article: undefined }], ["loading", { article: undefined, articleStatus: "loading" }], ["error", { article: undefined, articleStatus: "error" }],
      ["short", { article: articleFor(person, DATE, "kısa") }]
    ].forEach(([label, extra]) => {
      const result = out.sandbox.App.reminderSaygiOccurrence(occurrenceInput(out, preference(), Object.assign({ person }, extra || {})));
      assertEqual(result.ok, false); assertEqual(result.reason, "article-unavailable"); assertEqual(result.articleStatus, label === "short" ? "missing" : label);
    });
    assertEqual(out.sandbox.App.reminderSaygiArticleState(person, { localDate: DATE, articleStatus: "error" }).status, "error");
    assertEqual(out.sandbox.App.reminderSaygiArticleState(person, { localDate: DATE, article: articleFor(person, DATE, "kısa") }).status, "missing");
    out.sandbox.App.openSaygiCollectionPerson(person.id);
    out.sandbox.App.markSaygiRead();
    const state = JSON.parse(out.localStorage.getItem("seyma-reset-v1"));
    assert(!state.days[DATE] || !state.days[DATE].reading || state.days[DATE].reading.entries.length === 0);
  }],
  ["readAt suppresses the reminder without changing the existing reading/media gate", () => {
    const out = boot(baseState());
    const person = out.sandbox.SaygiPeople[0];
    const result = out.sandbox.App.reminderSaygiOccurrence(occurrenceInput(out, preference(), { person, readState: { personId: person.id, readAt: NOW } }));
    assertEqual(result.ok, false); assertEqual(result.reason, "already-read");
    const state = JSON.parse(out.localStorage.getItem("seyma-reset-v1"));
    assert(!state.days[DATE] || !state.days[DATE].reading || state.days[DATE].reading.entries.length === 0);
  }],
  ["native copy is generic and delivery never carries identity or article text", () => {
    const pref = preference({ channel: "native", nativeOptIn: true });
    const out = boot(baseState(pref));
    const person = personForDate(out, DATE);
    const article = articleFor(person);
    const copy = out.sandbox.App.reminderSaygiPrivateCopy({ occurrence: { personId: person.id, articleTitle: ARTICLE_TITLE } }, out.sandbox.ReminderCatalogV1.get(SAYGI_ID));
    assert(copy); assert(privateFree(copy)); assert(!copy.title.includes("Ada") && !copy.detail.includes("Wikipedia"));
    const candidate = out.sandbox.App.reminderSaygiLifecycleCandidates({ preference: pref, person, personId: person.id, article, timezone: TIMEZONE, nowIso: NOW, localDate: DATE, localTime: "18:30" })[0];
    assert(candidate); assert(privateFree(candidate));
    const evaluated = out.sandbox.App.reminderEvaluateReminders({
      nowIso: NOW, visibilityState: "visible", context: { timezone: TIMEZONE, localDate: DATE, localTime: "18:30", permissionState: "granted", nativeDailyCap: 3, lowPriorityNativeCap: 1, sameCategoryCooldownMinutes: 0 },
      occurrences: [candidate], deliveryLog: { schemaVersion: 1, entries: [] }
    });
    assertEqual(evaluated.results.length, 1); assertEqual(evaluated.results[0].channel, "native"); assert(privateFree(evaluated));
  }],
  ["selected person identity rejects a stale article and deep-link opens the modal", () => {
    const out = boot(baseState());
    const first = out.sandbox.SaygiPeople[0], second = out.sandbox.SaygiPeople[1];
    const stale = out.sandbox.App.reminderSaygiArticleState(second, { localDate: DATE, article: articleFor(first) });
    assertEqual(stale.status, "missing");
    assertEqual(out.sandbox.App.reminderSaygiArticleState(first, { localDate: DATE, article: articleFor(first, "2026-08-14") }).status, "missing");
    const target = out.sandbox.App.reminderDeepLinkTarget({ reminderId: SAYGI_ID, openDetail: true });
    assert(target.ok); assertEqual(target.deepLink, "saygi"); assertEqual(target.openDetail, true);
  }],
  ["late article result cannot replace the selected person", async () => {
    const pending = [];
    const out = boot(baseState(), { fetch(url) { return new Promise((resolve, reject) => pending.push({ url: String(url), resolve, reject, done: false })); } });
    out.sandbox.App.openSaygiCollectionPerson(out.sandbox.SaygiPeople[0].id);
    out.sandbox.App.openSaygiCollectionPerson(out.sandbox.SaygiPeople[1].id);
    assert(pending.length >= 2);
    // Complete the older request first; its request id must be discarded even
    // after the complete summary -> page -> external-links chain resolves.
    const response = (title) => ({
      ok: true,
      json() {
        return Promise.resolve({
          title,
          extract: `${title} için yeterince uzun, okunabilir bir biyografi metnidir.`,
          content_urls: { desktop: { page: `https://tr.wikipedia.org/wiki/${title}` } }
        });
      }
    });
    const flush = async () => { for (let i = 0; i < 8; i += 1) await Promise.resolve(); };
    const resolvePending = (needle, payload) => {
      const item = pending.find((entry) => !entry.done && entry.url.includes(needle));
      assert(item, `pending request not found: ${needle}`);
      item.done = true;
      item.resolve(payload);
    };
    resolvePending("tr.wikipedia.org/api/rest_v1/page/summary/", response("First"));
    await flush();
    resolvePending("tr.wikipedia.org/w/rest.php/v1/page/First/with_html", response("First"));
    await flush();
    resolvePending("tr.wikipedia.org/w/api.php", { ok: true, json() { return Promise.resolve({ query: { pages: [{ extlinks: [] }] } }); } });
    await flush();
    const articleAfterStale = out.sandbox.App.reminderSaygiArticleState(out.sandbox.SaygiPeople[1], { localDate: DATE, article: null });
    assertEqual(articleAfterStale.status, "loading");
    assert(!JSON.stringify(out.app.innerHTML).includes("First"));
    resolvePending("tr.wikipedia.org/api/rest_v1/page/summary/Albert_Einstein", response("Second"));
    await flush();
    resolvePending("tr.wikipedia.org/w/rest.php/v1/page/Second/with_html", response("Second"));
    await flush();
    resolvePending("tr.wikipedia.org/w/api.php", { ok: true, json() { return Promise.resolve({ query: { pages: [{ extlinks: [] }] } }); } });
    await flush();
    assertEqual(out.sandbox.App.reminderSaygiArticleState(out.sandbox.SaygiPeople[1], { localDate: DATE, article: null }).status, "ready");
  }]
]).catch(() => process.exitCode = 1);
