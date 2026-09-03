#!/usr/bin/env node
// verify-state-migration-boundary.mjs — L2-b/B2 black-box state parity.
//
// The real app boots only inside a node:vm sandbox with synthetic fixtures. The
// harness observes the migrated object through an in-memory localStorage stub;
// it never reads a device profile, loads sync.js, resolves fetch, or writes the
// private seyma-data repository. This fixture covers the MON-12 registry/shim
// parity and MON-13 getDay parity; it is not permission to touch sync, data
// rebind, or live state.

import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = process.env.SEYMA_REPO ||
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
let passed = 0;
let failed = 0;

function ok(name, condition, detail) {
  if (condition) { passed++; console.log(`PASS  ${name}`); }
  else { failed++; console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`); }
}

function today(offset = 0) {
  const d = new Date(Date.now() + offset * 864e5);
  const p = (n) => (n < 10 ? '0' : '') + n;
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const T = today();
const Y = today(-1);

function makeEl(id) {
  const el = {
    id: id || '', _html: '', _text: '',
    style: { cssText: '', setProperty() {}, width: '', display: '' },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: '', files: [],
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = String(v); },
    get textContent() { return this._text; },
    set textContent(v) { this._text = String(v); },
    setAttribute() {}, getAttribute() { return null; },
    appendChild(c) { this.children.push(c); return c; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(c) { return c; },
    addEventListener() {}, removeEventListener() {}, click() {}, focus() {}, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; },
  };
  return el;
}

const appEl = makeEl('app');
const rootEl = makeEl('root');
const elCache = { app: appEl, root: rootEl };
const doc = {
  hidden: false, body: makeEl('body'), documentElement: rootEl,
  getElementById(id) { return elCache[id] || null; },
  querySelector() { return null; }, querySelectorAll() { return []; },
  createElement() { return makeEl(''); }, createDocumentFragment() { return makeEl(''); },
  addEventListener() {}, removeEventListener() {}, DOMParser: undefined,
};
class DOMParserStub {
  parseFromString() { return { body: makeEl('body'), querySelector() { return null; }, querySelectorAll() { return []; } }; }
}

function makeLocalStorage(seed, counters) {
  const store = Object.assign({}, seed);
  return {
    getItem(k) { return k in store ? store[k] : null; },
    setItem(k, v) { counters.sets++; store[k] = String(v); },
    removeItem(k) { delete store[k]; },
    clear() { for (const k in store) delete store[k]; },
    _store: store,
  };
}

function fixedDate(nowIso) {
  const RealDate = Date;
  const fixedMs = RealDate.parse(nowIso);
  function FixedDate(...args) {
    return new.target
      ? (args.length ? new RealDate(...args) : new RealDate(fixedMs))
      : new RealDate(fixedMs).toString();
  }
  FixedDate.now = () => fixedMs;
  FixedDate.parse = RealDate.parse;
  FixedDate.UTC = RealDate.UTC;
  FixedDate.prototype = RealDate.prototype;
  return FixedDate;
}

function fixedMath() {
  const out = Object.create(Math);
  out.random = () => 0.123456789;
  return out;
}

function buildSandbox(seedData, options = {}) {
  const counters = { sets: 0, fetches: 0 };
  const seed = seedData ? { 'seyma-reset-v1': JSON.stringify(seedData) } : {};
  const localStorage = makeLocalStorage(seed, counters);
  const sandbox = {
    console, localStorage, document: doc,
    navigator: { vibrate() {}, userAgent: 'node-b2', clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: 'http:', hostname: 'localhost', search: '', href: 'http://localhost/', reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { counters.fetches++; return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: {
      getRandomValues(a) { for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 256) | 0; return a; },
      randomUUID() { return 'fixture-uuid-0000-4000-8000-000000000000'; },
    },
    URL: Object.assign(function () {}, { createObjectURL() { return 'blob:fixture'; }, revokeObjectURL() {} }), URLSearchParams,
    Blob: function () {}, File: function () {}, FileReader: function () {},
    TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date: options.nowIso ? fixedDate(options.nowIso) : Date,
    Math: options.deterministicRandom ? fixedMath() : Math,
    JSON, Object, Array, String, Number, Boolean, RegExp, Error,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
    Promise, Set, Map, Symbol, Intl,
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  return { sandbox, counters };
}

function loadInto(sandbox, files) {
  const ctx = vm.createContext(sandbox);
  for (const file of files) {
    const source = fs.readFileSync(path.join(REPO, file), 'utf8');
    vm.runInContext(source, ctx, { filename: file });
  }
  return ctx;
}

// MON-12/13: state registry üretimdeki yükleme sırasıyla app.js'ten önce gelir.
const FILES = ['app/content/profileAssessmentV1.js', 'app/content/esmaulHusnaV1.js', 'app/core/constants.js', 'app/core/dateUtils.js', 'app/core/state.js', 'app.js'];

function defaultSettings() {
  return {
    nickname: 'B2 sentetik', ghToken: '', ghRepo: '', ghBranch: '', openaiKey: '',
    profileAssessmentInactive: true,
  };
}

function baseSeed(extra = {}) {
  return Object.assign({
    version: 2, startDate: Y, lastOpenedDate: Y, days: {}, notifications: [],
    luna: { qa: [] }, aeon: { qa: [] }, settings: defaultSettings(),
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    __b2Sentinel: { owner: 'fixture', nested: { keep: true } },
  }, extra);
}

function boot(seedData) {
  const { sandbox, counters } = buildSandbox(seedData);
  try {
    loadInto(sandbox, FILES);
    if (sandbox.App && typeof sandbox.App.start === 'function') sandbox.App.start();
    const raw = sandbox.localStorage.getItem('seyma-reset-v1');
    return { data: raw ? JSON.parse(raw) : null, counters, error: null };
  } catch (error) {
    return { data: null, counters, error };
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function migrationPair(seedData) {
  const { sandbox, counters } = buildSandbox(null);
  loadInto(sandbox, FILES);
  const registryInput = clone(seedData);
  const shimInput = clone(seedData);
  const before = clone(seedData);
  const registryResult = sandbox.SeymaState.migrate(registryInput);
  const shimResult = sandbox.migrate(shimInput);
  return { before, registryInput, shimInput, registryResult, shimResult, counters };
}

function getDayPair(seedData, date, idx) {
  const { sandbox, counters } = buildSandbox(null);
  loadInto(sandbox, FILES);
  const registryInput = clone(seedData);
  const shimInput = clone(seedData);
  const registryBefore = registryInput.days[date];
  const shimBefore = shimInput.days[date];
  const registryResult = sandbox.SeymaState.getDay(registryInput, date, idx);
  const shimResult = sandbox.getDay(shimInput, date, idx);
  return { registryInput, shimInput, registryBefore, shimBefore, registryResult, shimResult, counters };
}

function defaultDataPair() {
  const { sandbox, counters } = buildSandbox(null, {
    nowIso: '2026-09-03T10:20:30.000Z',
    deterministicRandom: true,
  });
  loadInto(sandbox, FILES);
  const registryResult = sandbox.SeymaState.createDefaultData();
  const shimResult = sandbox.createDefaultData();
  return { sandbox, counters, registryResult, shimResult };
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((out, key) => { out[key] = stable(value[key]); return out; }, {});
  }
  return value;
}

function same(a, b) {
  return JSON.stringify(stable(a)) === JSON.stringify(stable(b));
}

function migrationComparable(value) {
  const copy = JSON.parse(JSON.stringify(value));
  // Boot telemetry is written by the app wrapper after migrate() returns.
  delete copy.lastOpenedAt;
  // The app's live-session observer creates/refreshes this runtime heartbeat
  // after migration; it is not a migration field and is intentionally excluded
  // from the parity projection.
  if (copy && copy.days && typeof copy.days === 'object') {
    Object.keys(copy.days).forEach((date) => {
      if (copy.days[date]) delete copy.days[date].liveSession;
    });
  }
  return copy;
}

function firstDiff(a, b, pathName = '$') {
  if (typeof a !== typeof b) return `${pathName}: type ${typeof a} !== ${typeof b}`;
  if (a === null || b === null || typeof a !== 'object') return a === b ? null : `${pathName}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`;
  if (Array.isArray(a) !== Array.isArray(b)) return `${pathName}: array/object mismatch`;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of [...keys].sort()) {
    if (!(key in a)) return `${pathName}.${key}: missing left`;
    if (!(key in b)) return `${pathName}.${key}: missing right`;
    const diff = firstDiff(a[key], b[key], `${pathName}.${key}`);
    if (diff) return diff;
  }
  return null;
}

const DAY_DEFAULT_KEYS = [
  'dayIndex', 'habits', 'mood', 'cravingSOSCount', 'cravingOptionsUsed',
  'cravingTriggers', 'craving10MinDone', 'foodCravingDone', 'coffeeCravingDone',
  'cravingTriggerNote', 'note', 'intention', 'journal', 'savedAt', 'meals',
  'mealItems', 'water', 'caffeine', 'energy', 'stress', 'sleep', 'walk', 'flow',
  'symptoms', 'discomfort', 'sessions', 'movement', 'reading', 'watching',
  'listening', 'learning', 'gratitude', 'health', 'nutri', 'magnesium', 'therapy',
  'prayer',
];

const DAY_HABIT_KEYS = [
  'sweetManaged', 'foodManaged', 'coffeeManaged', 'eveningControl', 'walked20',
  'protein', 'water', 'vitaminD', 'sleepReg', 'journaled', 'mediaFed', 'freshAir',
  'selfKind', 'caffeineOk', 'magnesium',
];

function expectedEmptyPrayerDay() {
  const entry = {
    time: '', performed: false, inCongregation: false, late: false, madeUp: false,
    nafile: 0, note: '', savedAt: '',
  };
  return {
    fajr: clone(entry), sunrise: clone(entry), dhuhr: clone(entry), asr: clone(entry),
    maghrib: clone(entry), isha: clone(entry),
    fetchedAt: '', fetchedFor: '', fetchedMethod: '', fetchError: '',
  };
}

function expectedNewDay(idx) {
  const habits = {};
  DAY_HABIT_KEYS.forEach((key) => { habits[key] = false; });
  return {
    dayIndex: idx, habits, mood: null, cravingSOSCount: 0, cravingOptionsUsed: [],
    cravingTriggers: [], craving10MinDone: false, foodCravingDone: false,
    coffeeCravingDone: false, cravingTriggerNote: '', note: '', intention: '',
    journal: { text: '', mode: 'free', promptUsed: '', wordCount: 0, charCount: 0,
      savedAt: null, streakAtSave: 0, metGoal: false },
    savedAt: null, meals: { breakfast: '', lunch: '', dinner: '', snack: '' },
    mealItems: { breakfast: [], lunch: [], dinner: [], snack: [] }, water: 0,
    caffeine: { last: null, cups: null }, energy: null, stress: null,
    sleep: { hours: null, quality: null, med: { type: null, note: '' },
      windDown: { steps: { light: false, breath: false, dump: false, cool: false },
        lastMinutes: null, lastDoneAt: null, offloadNote: '', events: [], sessions: [] } },
    walk: { steps: null, minutes: null }, flow: null, symptoms: [],
    discomfort: { regions: {}, note: '', meds: [] }, sessions: [],
    movement: { walkM: 0, vehicleM: 0, totalM: 0, maxSpeed: 0, samples: 0,
      walkSec: 0, vehicleSec: 0, track: [] }, reading: { entries: [] },
    watching: { entries: [] }, listening: { entries: [] }, learning: { entries: [] },
    gratitude: [], health: { steps: 0, walkM: 0, updatedAt: null }, nutri: null,
    magnesium: { taken: false, form: '', mg: null, time: '', reason: [],
      effectNote: '', skipped: false, feedback: null },
    therapy: {
      firstStep: { text: '', startedAt: null, completedAt: null },
      selfCompassion: { prompt: '', note: '', completedAt: null },
      breath: { pattern: '4-7-8', seconds: 0, completedAt: null },
      decision: { optionA: '', optionB: '', choice: '', note: '', completedAt: null },
      thoughts: [], dailyWin: { text: '', completedAt: null },
      share: { sentAt: null, note: '' },
    },
    prayer: expectedEmptyPrayerDay(),
  };
}

const dayPartial = {
  mood: 'calm', note: 'DAY_NOTE_SENTINEL', intention: 'DAY_INTENTION_SENTINEL',
  habits: { water: true, customHabit: 'keep-me' },
  customDayField: { marker: 'day-future-field' },
  reading: { entries: [{ title: 'Fixture Book', author: 'Fixture Author', pages: 3, minutes: 5, ts: '2026-07-01T10:00:00.000Z' }] },
  watching: { entries: [{ title: 'Fixture Film', kind: 'film', minutes: 4, episodes: 1, ts: '2026-07-01T11:00:00.000Z' }] },
  listening: { entries: [{ title: 'Fixture Track', artist: 'Fixture Artist', kind: 'sarki', minutes: 6, ts: '2026-07-01T12:00:00.000Z' }] },
};

const richZikr = {
  schemaVersion: 4, migrationVersion: 'zikr_v2', editorialVersion: 7,
  presets: [{ id: 'fixture_preset', name: 'Fixture Zikir', phrase: 'fixture', target: 33, color: 'zikr', createdAt: '2026-07-01T00:00:00.000Z', updatedAt: '2026-07-01T00:00:00.000Z', builtIn: false, kind: 'core' }],
  journeys: { fixture_preset: { presetId: 'fixture_preset', lifetimeCount: 77, activeHatimId: 'fixture-hatim', lastAt: '2026-07-01T13:00:00.000Z', lastSessionId: 'fixture-session', completedHatims: 2, legacyCompletedHatims: 2, hatims: [{ id: 'fixture-hatim', mode: 'simple', baseTarget: 33, target: 33, count: 11, startedAt: '2026-07-01T00:00:00.000Z', completedAt: null, status: 'active' }] } },
  sessions: { [Y]: { totalCount: 11, completedSets: 0, perPreset: { fixture_preset: { count: 11, completedCycles: 0, lastAt: '2026-07-01T13:00:00.000Z' } }, lastAt: '2026-07-01T13:00:00.000Z' } },
  reflections: [{ id: 'fixture-reflection', date: Y, presetId: 'fixture_preset', feelings: 'keep feelings', thoughts: 'keep thoughts', intention: 'keep intention', updatedAt: '2026-07-01T13:00:00.000Z' }],
  settings: { activePresetId: 'fixture_preset', soundOn: false, haptic: true, autoAdvance: false },
  activeSession: null, streakDate: Y, streak: 2, futureZikrField: 'zikr-future',
};

const richQuran = {
  schemaVersion: 1, catalogVersion: 'quran-revelation-tr-v1', startedAt: '2026-07-01T00:00:00.000Z', activeSurahId: 'alak',
  requests: { alak: {
    requestId: 'qreq-fixture', responseId: 'qresp-fixture', videoId: 'dQw4w9WgXcQ', status: 'watched',
    requestedAt: '2026-07-01T00:00:00.000Z', readyAt: '2026-07-01T01:00:00.000Z', startedWatchingAt: '2026-07-01T02:00:00.000Z', watchedAt: '2026-07-01T03:00:00.000Z',
    videoHistory: [{ videoId: 'dQw4w9WgXcQ', receivedAt: '2026-07-01T01:00:00.000Z' }],
    notes: [{ id: 'qnote-fixture', kind: 'watch', videoId: 'dQw4w9WgXcQ', timestampSec: 12, text: 'video note sentinel', createdAt: '2026-07-01T02:00:00.000Z', updatedAt: '2026-07-01T02:00:00.000Z' }],
    futureRequestField: 'quran-future',
  } }, futureQuranField: { keep: 'yes' },
};

const richSeed = baseSeed({
  // Bugünün kaydı da önceden şekilli: render()ın günlük görünüm için yaptığı
  // getDay backfill'ini migration parity ölçümüne karıştırmıyoruz.
  days: {
    [T]: { mood: null, habits: {}, caffeine: { cups: 0, last: null, drinks: [] } },
    [Y]: Object.assign({}, dayPartial, { prayer: { fajr: { status: 'jamaat', note: 'prayer-sentinel' } } }),
  },
  psych: { consentAccepted: true, responses: { psych_future: { value: 5, marker: 'psych-sentinel' } } },
  profileAssessment: { schemaVersion: 2, deliveryMode: 'single_session', status: 'active', currentItemIndex: 0, responses: { future_item: { value: 4, marker: 'profile-sentinel' } }, consent: { profileProcessingAccepted: true, sensitiveDataAccepted: true, panelSummarySharingAccepted: false } },
  zikr: richZikr,
  quranJourney: richQuran,
  library: { books: [{ id: 'book-fixture', title: 'Stable Book', author: 'A', genre: 'Bilim', totalPages: 100, currentPage: 12, status: 'reading', rating: 4, createdAt: '2026-07-01T00:00:00.000Z', unknownBookField: 'keep' }], goal: { dailyPages: 20, yearlyBooks: 4 } },
  watchlist: { items: [{ id: 'title-fixture', title: 'Stable Film', kind: 'film', totalEp: 1, watchedEp: 1, status: 'finished', createdAt: '2026-07-01T00:00:00.000Z' }], goal: { dailyMinutes: 40, yearlyTitles: 4 } },
  music: { items: [{ id: 'track-fixture', title: 'Stable Track', artist: 'A', kind: 'sarki', rating: 3, createdAt: '2026-07-01T00:00:00.000Z' }], goal: { dailyMinutes: 30, yearlyTitles: 4 } },
  soulArchive: { items: [{ id: 'soul-fixture', type: 'dua', label: 'Dua', icon: 'sparkles', sci: 'dua', totalSessions: 2, totalMinutes: 10, status: 'active', note: 'soul sentinel' }] },
  body: { heightCm: 168, heightSetAt: '2026-07-01T00:00:00.000Z', weights: [{ ts: '2026-07-01', kg: 60 }] },
  scientificProfile: { source: 'fixture', assessedAt: '2026-07-01', confidence: 0.8, consent: 'yes', riasec: ['S'], values: ['autonomy'], traits: { marker: 'scientific-sentinel' }, attachment: {}, strengths: ['keep'], risks: [], note: 'keep note' },
});

console.log('== B2-1 minimal eski kayıt ==');
{
  const out = boot(baseSeed({ settings: { nickname: 'Minimal', ghToken: '', ghRepo: '' } }));
  ok('minimal fixture boot çökmüyor', !out.error && !!out.data, out.error && out.error.message);
  ok('version 2 korunuyor', out.data && out.data.version === 2);
  ok('settings güvenli varsayılanları backfill ediyor', out.data && out.data.settings.ghRepo === 'mustafaras/seyma-data' && out.data.settings.ghBranch === 'main');
  ok('zikr/saygi/quran root oluşuyor', out.data && out.data.zikr && out.data.saygi && out.data.quranJourney);
  ok('bilinmeyen top-level sentinel korunuyor', out.data && out.data.__b2Sentinel.nested.keep === true);
  ok('minimal migration ağ çağrısı yapmıyor', out.counters.fetches === 0);
}

console.log('\n== B2-2 kısmi eski gün + arşiv backfill ==');
{
  const out = boot(baseSeed({ days: { [Y]: dayPartial } }));
  const day = out.data && out.data.days && out.data.days[Y];
  ok('partial fixture boot çökmüyor', !out.error && !!day, out.error && out.error.message);
  ok('gün mood/not/intention korunuyor', day && day.mood === 'calm' && day.note === 'DAY_NOTE_SENTINEL' && day.intention === 'DAY_INTENTION_SENTINEL');
  ok('bilinmeyen nested gün alanı korunuyor', day && day.customDayField.marker === 'day-future-field');
  ok('okuma/izleme/dinleme kayıtları korunuyor', day && day.reading.entries.length === 1 && day.watching.entries.length === 1 && day.listening.entries.length === 1);
  ok('arşiv katalogları backfill ediliyor', out.data.library.books.some((x) => x.title === 'Fixture Book') && out.data.watchlist.items.some((x) => x.title === 'Fixture Film') && out.data.music.items.some((x) => x.title === 'Fixture Track'));
}

console.log('\n== B2-3 zengin gerçekçi state ==');
{
  const out = boot(richSeed);
  const d = out.data;
  ok('rich fixture boot çökmüyor', !out.error && !!d, out.error && out.error.message);
  ok('data.psych bit-bit sentinel korunuyor', d && d.psych && d.psych.responses.psych_future.marker === 'psych-sentinel');
  ok('profil response sentinel korunuyor', d && d.profileAssessment && d.profileAssessment.responses.future_item.marker === 'profile-sentinel');
  ok('Zikirmatik lifetime/reflection korunuyor', d && d.zikr.journeys.fixture_preset.lifetimeCount === 77 && d.zikr.reflections[0].feelings === 'keep feelings');
  ok('Zikirmatik bilinmeyen alan korunuyor', d && d.zikr.futureZikrField === 'zikr-future');
  ok('Kur’an video/not/geçmiş korunuyor', d && d.quranJourney.requests.alak.videoId === 'dQw4w9WgXcQ' && d.quranJourney.requests.alak.notes[0].text === 'video note sentinel' && d.quranJourney.requests.alak.videoHistory.length === 1);
  ok('Kur’an bilinmeyen alan korunuyor', d && d.quranJourney.requests.alak.futureRequestField === 'quran-future' && d.quranJourney.futureQuranField.keep === 'yes');
  ok('prayer ve bilimsel profil sentinel korunuyor', d && d.days[Y].prayer.fajr.note === 'prayer-sentinel' && d.scientificProfile.traits.marker === 'scientific-sentinel');
}

console.log('\n== B2-4 bozuk tipler / fail-safe ==');
{
  const malformed = baseSeed({
    settings: null, luna: [], aeon: 'bad', cycle: { periods: 'bad', avgCycle: 'bad', avgPeriod: null },
    days: { [Y]: { mood: 'still-here', reading: 'bad', watching: [], listening: null, custom: { marker: 'malformed-day-sentinel' } } },
    library: { books: [null, 7, { title: 'surviving book' }], goal: 'bad' },
    watchlist: { items: [null, 'bad', { title: 'surviving title' }], goal: [] },
    music: { items: [null, { title: 'surviving track' }], goal: null },
    soulArchive: { items: [null, { type: 'dua', totalSessions: '2' }] },
    quranJourney: { requests: [], activeSurahId: 12 }, profileAssessment: 'bad',
    malformedFuture: { keep: true },
  });
  const out = boot(malformed);
  const d = out.data;
  ok('malformed fixture boot çökmüyor', !out.error && !!d, out.error && out.error.message);
  ok('malformed state version/root güvenli', d && d.version === 2 && d.settings && d.zikr && d.quranJourney);
  ok('geçerli gün ve bilinmeyen alan kaybolmuyor', d && d.days[Y].mood === 'still-here' && d.days[Y].custom.marker === 'malformed-day-sentinel');
  ok('malformed koleksiyonlar güvenli diziye iniyor', d && Array.isArray(d.library.books) && Array.isArray(d.watchlist.items) && Array.isArray(d.music.items) && Array.isArray(d.soulArchive.items));
  ok('malformed top-level sentinel korunuyor', d && d.malformedFuture.keep === true);
}

console.log('\n== B2-5 legacy/normal/future kök before-after parity ==');
{
  const legacy = migrationPair(baseSeed({ version: 1, legacyRootField: { keep: 'legacy' } }));
  const normal = migrationPair(baseSeed({ version: 2, normalRootField: { keep: 'normal' } }));
  const futureSeed = baseSeed({
    version: 3,
    futureRootField: { keep: 'future' },
    settings: null,
    days: { [Y]: { futureDayField: { keep: true } } },
  });
  const future = migrationPair(futureSeed);

  ok('legacy registry/shim snapshot eşdeğer', same(legacy.registryResult, legacy.shimResult));
  ok('legacy root unknown alanı korunuyor', legacy.registryResult.legacyRootField.keep === 'legacy');
  ok('legacy kök güncel sürüme normalize oluyor', legacy.registryResult.version === 2);
  ok('normal registry/shim snapshot eşdeğer', same(normal.registryResult, normal.shimResult));
  ok('normal root unknown alanı korunuyor', normal.registryResult.normalRootField.keep === 'normal');
  ok('normal kök sürümü değişmeden 2 kalıyor', normal.registryResult.version === 2);
  ok('future registry/shim snapshot eşdeğer', same(future.registryResult, future.shimResult));
  ok('future root fail-closed ve before-after bit eşit', future.registryResult === future.registryInput && same(future.before, future.registryResult));
  ok('future root sürümü ve unknown nested alanları açılmıyor', future.registryResult.version === 3 && future.registryResult.futureRootField.keep === 'future' && future.registryResult.days[Y].futureDayField.keep === true && future.registryResult.settings === null);
  ok('future migration dependency çağrısı/ağ yok', future.counters.fetches === 0);
}

console.log('\n== B2-6 idempotence / deep parity ==');
{
  const first = boot(richSeed);
  const second = first.data ? boot(first.data) : { data: null, counters: { fetches: 0 }, error: new Error('first boot failed') };
  ok('ilk parity bootu başarılı', !first.error && !!first.data, first.error && first.error.message);
  ok('ikinci parity bootu başarılı', !second.error && !!second.data, second.error && second.error.message);
  const parity = !!first.data && !!second.data && same(migrationComparable(first.data), migrationComparable(second.data));
  ok('ikinci migrate derin eşdeğer', parity);
  if (!parity && first.data && second.data) console.log(`INFO  ilk fark: ${firstDiff(stable(migrationComparable(first.data)), stable(migrationComparable(second.data)))}`);
  ok('idempotence turunda psych/profile sentinel duruyor', second.data && second.data.psych.responses.psych_future.marker === 'psych-sentinel' && second.data.profileAssessment.responses.future_item.marker === 'profile-sentinel');
  ok('idempotence turunda video/not/tefekkür duruyor', second.data && second.data.quranJourney.requests.alak.notes[0].text === 'video note sentinel' && second.data.zikr.reflections[0].intention === 'keep intention');
}

console.log('\n== B2-7 MON-13 getDay yeni/var gün parity ==');
{
  const fresh = getDayPair({ days: {} }, T, 17);
  ok('yeni gün registry/shim snapshot eşdeğer', same(fresh.registryResult, fresh.shimResult));
  ok('yeni gün alan envanteri değişmemiş', Object.keys(fresh.registryResult).sort().join('|') === DAY_DEFAULT_KEYS.slice().sort().join('|'));
  ok('yeni gün template varsayılanları sabit', same(fresh.registryResult, expectedNewDay(17)));
  ok('yeni gün day referansı kopyalanmıyor', fresh.registryResult === fresh.registryInput.days[T] && fresh.shimResult === fresh.shimInput.days[T]);
  ok('yeni gün root dışına yazılmıyor', Object.keys(fresh.registryInput).length === 1 && Object.keys(fresh.registryInput)[0] === 'days');

  const nested = { marker: 'nested-day-sentinel' };
  const existingSeed = {
    days: {
      [Y]: {
        mood: 'calm', note: 'DAY_NOTE_SENTINEL', customDayField: nested,
        habits: { water: true, customHabit: 'keep-me' },
        caffeine: { cups: 2, last: '11:20' },
        sleep: { med: { type: 'none' }, windDown: { steps: { light: true } } },
        journal: { text: 'keep journal', wordCount: 'bad' },
      },
    },
  };
  const existing = getDayPair(existingSeed, Y, 4);
  ok('var gün registry/shim snapshot eşdeğer', same(existing.registryResult, existing.shimResult));
  ok('var gün referansı ve nested referans korunuyor', existing.registryResult === existing.registryBefore &&
    existing.shimResult === existing.shimBefore &&
    existing.registryResult.customDayField === existing.registryInput.days[Y].customDayField &&
    existing.registryResult.customDayField.marker === 'nested-day-sentinel');
  ok('var gün bilinmeyen alan ve kayıt korunuyor', existing.registryResult.mood === 'calm' &&
    existing.registryResult.note === 'DAY_NOTE_SENTINEL' &&
    existing.registryResult.habits.customHabit === 'keep-me');
  ok('var gün nested defaults normalize ediliyor', existing.registryResult.caffeine.drinks.length === 2 &&
    existing.registryResult.caffeine.cups === 2 && existing.registryResult.journal.wordCount === 0 &&
    existing.registryResult.therapy && existing.registryResult.prayer);
}

console.log('\n== B2-8 MON-14 createDefaultData root/settings/tarih parity ==');
{
  const defaults = defaultDataPair();
  const registryJson = JSON.stringify(defaults.registryResult);
  const expectedRootKeys = [
    'version', 'startDate', 'lastOpenedDate', 'lastOpenedAt', 'savedAt',
    'syncReceipt', 'eventLog', 'days', 'notifications', 'reminders', 'luna',
    'aeon', 'settings', 'cycle', 'library', 'watchlist', 'music', 'body',
    'labResults',
  ];
  const expectedSettings = {
    nickname: 'Sevgili Günışığı', notificationsWanted: false, haptics: true,
    ghToken: '', ghRepo: 'mustafaras/seyma-data', ghBranch: 'main',
    healthGistId: '', openaiKey: '', locationEnabled: false,
    locationMode: 'auto', lunaConnected: false,
  };
  const fixedNow = '2026-09-03T10:20:30.000Z';

  ok('createDefaultData registry kaydı erişilebilir', typeof defaults.sandbox.SeymaState.createDefaultData === 'function');
  ok('registry/shim default root JSON eşdeğer', registryJson === JSON.stringify(defaults.shimResult));
  ok('default root tam snapshot hash değişmedi', crypto.createHash('sha256').update(registryJson).digest('hex') === '5294f6a84f99d7a7d135f784ce13a9a956984b383417745141945a7da7f48000');
  ok('default root alan sırası ve kapsamı korunuyor', defaults.registryResult && Object.keys(defaults.registryResult).join('|') === expectedRootKeys.join('|'));
  ok('default settings alan/değerleri korunuyor', same(defaults.registryResult.settings, expectedSettings));
  ok('default tarih bağımlılıkları aynı ISO damgasını kullanıyor', defaults.registryResult.startDate === '2026-09-03' &&
    defaults.registryResult.lastOpenedDate === '2026-09-03' && defaults.registryResult.lastOpenedAt === fixedNow &&
    defaults.registryResult.savedAt === fixedNow);
  ok('default çağrıları fresh root/nested referans üretiyor', defaults.registryResult !== defaults.shimResult &&
    defaults.registryResult.days !== defaults.shimResult.days && defaults.registryResult.settings !== defaults.shimResult.settings);
  ok('default üretimi app.js data bağlamını yeniden bağlamıyor', defaults.sandbox.SeymaState.data === null);
  ok('default üretimi ağ çağrısı yapmıyor', defaults.counters.fetches === 0);
}

console.log('\n== B2 güvenlik yüzeyi ==');
const probe = boot(baseSeed());
ok('SeySync yüklenmedi', !probe.error);
ok('fixture fetch sayısı sıfır', probe.counters.fetches === 0);
ok('fixture yalnız sentetik localStorage stub kullandı', probe.counters.sets > 0);

console.log(`\nB2 result: ${failed ? 'FAIL' : 'PASS'} (${passed} passed, ${failed} failed)`);
if (failed) process.exitCode = 1;
