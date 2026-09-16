// MON2-02 debug: boot dizisini dosya dosya try/catch ile çalıştır,
// hangi script'in ve hangi satırın "reading 'keys'" hatası verdiğini bul.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const T = 'tests/reminders/test_reminder_boot.js';

// test_reminder_boot.js'deki boot() fonksiyonunu aynen kur
const src = fs.readFileSync(path.join(ROOT, T), 'utf8');
const stateSeedMatch = src.match(/function stateSeed\(\) \{[\s\S]*?\n\}/);
const stateSeedBody = stateSeedMatch ? stateSeedMatch[0] : '';

function fixtureElement(tag) {
  return {
    tagName: String(tag || '').toUpperCase(), innerHTML: '', value: '',
    style: {}, children: [], classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {}, appendChild() {}, removeChild() {},
    addEventListener() {}, removeEventListener() {}, focus() {}, blur() {}, click() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    getBoundingClientRect() { return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }; },
    insertAdjacentHTML() {}, closest() { return null; }, contains() { return false; }, focus() {}, scrollIntoView() {},
    set textContent(v) {}, get textContent() { return ''; },
    set scrollTop(v) {}, get scrollTop() { return 0; }, set tabindex(v) {}, get tabindex() { return null; },
  };
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function bootDebug({ catalog = true, seed = null } = {}) {
  const app = fixtureElement('app');
  const rootEl = fixtureElement('root');
  const store = seed ? { 'seyma-reset-v1': JSON.stringify(seed) } : {};
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  function NotificationMock() {}
  NotificationMock.permission = 'granted';
  NotificationMock.requestPermission = () => Promise.resolve('granted');
  const document = {
    hidden: false,
    body: fixtureElement('body'),
    documentElement: rootEl,
    getElementById(id) { return { app, root: rootEl }[id] || null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(''); }, createDocumentFragment() { return fixtureElement(''); },
    addEventListener() {}, removeEventListener() {}
  };
  class DOMParserStub { parseFromString() { return { body: fixtureElement('body'), querySelector() { return null; }, querySelectorAll() { return []; } }; } }
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { userAgent: 'dbg', vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } },
      geolocation: { getCurrentPosition(s) { s({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition() { return 1; }, clearWatch() {} } },
    location: { protocol: 'http:', hostname: 'localhost', search: '', href: 'http://localhost/', reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(a) { return a; }, randomUUID() { return 'dbg-uuid'; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return 'blob:dbg'; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat,
    isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  const files = [
    'app/content/profileAssessmentV1.js', 'app/content/esmaulHusnaV1.js', 'app/core/constants.js',
    'app/core/dateUtils.js', 'app/core/state.js', 'app/core/syncGlue.js', 'app/core/helpers.js',
    'app/core/prayer.js', 'app/core/zikir.js', 'app/core/quran.js', 'app/core/saygi.js',
    'app/core/motivation.js', 'app/core/crisis.js', 'app/core/journal.js', 'app/core/health.js',
    'app/core/library.js', 'app/core/report.js', 'app/core/map.js', 'app/core/profile.js',
    'app/core/settings.js'
  ];
  if (catalog) files.push('app/core/reminderCatalog.js');
  files.push('app/core/reminders.js', 'app/core/reminderSurface.js', 'app/core/messaging.js',
    'app/core/render.js', 'app/core/appSurface.js', 'app.js');
  for (const file of files) {
    try {
      vm.runInContext(read(file), context, { filename: file });
      console.log('OK   ' + file);
    } catch (e) {
      console.log('FAIL ' + file + ' :: ' + e.message);
      console.log(e.stack.split('\n').slice(0, 12).join('\n'));
      return { sandbox, failed: file };
    }
  }
  return { sandbox, failed: null };
}

console.log('--- clean boot (seed yok) ---');
bootDebug({ catalog: true });