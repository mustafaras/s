#!/usr/bin/env node
// IIP-05 — Öncü okuyucusu görsel kalite.
// No-network/node:vm contract fixture: long titles, missing/broken portraits,
// source footer, loading/error/return states and the existing scroll gate.

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const saygiSource = fs.readFileSync(path.join(repoRoot, 'app/core/saygi.js'), 'utf8');
const cssSource = fs.readFileSync(path.join(repoRoot, 'app/styles.css'), 'utf8');
let passed = 0;
let failed = 0;

function check(name, condition, detail) {
  if (condition) {
    passed++;
    console.log('PASS  ' + name);
  } else {
    failed++;
    console.log('FAIL  ' + name + (detail ? ' — ' + detail : ''));
  }
}

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const date = '2026-09-04';
const person = {
  id: 'ada',
  name: 'Ada Lovelace',
  kind: 'Bilim',
  era: '19. yy',
  field: 'Matematik ve bilgisayar bilimi'
};
const longTitle = 'Türkçe karakterli ve dar ekranda satırdan taşmaması gereken uzun öncü adı';
const longLicense = 'Creative Commons Attribution-Share Alike 4.0 International lisansı ve uzun kaynak açıklaması';
const article = {
  personId: person.id,
  dailyKey: date + '|' + person.id,
  lang: 'tr',
  title: longTitle,
  description: 'Matematiksel düşünceyi hesaplama fikriyle buluşturan öncü bir çalışma.',
  lead: 'Bir fikrin değeri, başka insanların onunla ne yapabildiğinde görünür.',
  blocks: [
    { type: 'h', text: 'Bir fikrin başlangıcı' },
    { type: 'p', text: 'Bu sentetik paragraf, 45 ile 75 karakterlik okuma ölçüsünü ve uzun metnin dar ekranda güvenle sarılmasını doğrulamak için kullanılır.' },
    { type: 'p', text: 'İkinci paragraf kaynak, biyografi ve okuma ritmi arasında görsel ayrımın korunduğunu kontrol eder.' },
    { type: 'list', text: 'Kısa bir düşünceyi ayrı bir bilgi yüzeyi olarak gösterir.' }
  ],
  thumbnail: null,
  sourceUrl: 'https://tr.wikipedia.org/wiki/Ada_Lovelace',
  licenseTitle: longLicense,
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.tr',
  links: []
};

const state = {
  days: { [date]: { reading: { entries: [] } } },
  saygi: { collection: {}, streak: 0, lastReadDate: '' }
};
const ui = {
  tab: 'saygi',
  faithTab: 'oncu',
  saygiPersonOpen: true,
  saygiBrowseId: person.id,
  saygiArticle: null,
  saygiLoading: false,
  saygiError: null,
  saygiReadReady: false,
  saygiRequestId: 0
};
const counters = { fetch: 0, storage: 0, timers: 0 };
const sandbox = {
  console,
  URL,
  URLSearchParams,
  Date,
  Math,
  JSON,
  Object,
  Array,
  String,
  Number,
  Boolean,
  RegExp,
  Error,
  Promise,
  Set,
  Map,
  Intl,
  encodeURIComponent,
  decodeURIComponent,
  isNaN,
  isFinite,
  localStorage: {
    getItem() { counters.storage++; return null; },
    setItem() { counters.storage++; }
  },
  fetch() { counters.fetch++; return Promise.reject(new Error('network forbidden')); },
  setTimeout() { counters.timers++; return 0; },
  clearTimeout() {},
  document: {},
  SaygiPeople: [person],
  HijriCalendarV1: undefined
};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.globalThis = sandbox;
const context = vm.createContext(sandbox);
vm.runInContext(saygiSource, context, { filename: 'app/core/saygi.js' });
const registry = sandbox.SeymaSaygi;
const deps = {
  data: () => state,
  ui: () => ui,
  getDay: (data, key) => data.days[key] || (data.days[key] = { reading: { entries: [] } }),
  todayStr: () => date,
  addDays: (value, amount) => amount < 0 ? '2026-09-03' : '2026-09-05',
  diffDays: () => 0,
  dayIndexFor: () => 1,
  dateLabelTR: value => value,
  icon: name => '<svg data-icon="' + esc(name) + '"></svg>',
  esc,
  featuresLive: () => true,
  render: () => {},
  quranJourneyHubCardHTML: () => '',
  zikrVisible: () => false,
  zikrPreviewCardHTML: () => ''
};

check('IIP-05 registry boot is available', registry && registry.registerSaygi(deps) === true);
check('render contract does not open network/storage/timers', counters.fetch === 0 && counters.storage === 0 && counters.timers === 0);

const textArticle = registry.saygiArticleBodyHTML(person, article, false, '', true);
check('REQ-009 positive: long Turkish title stays in escaped article markup', textArticle.includes(esc(longTitle)) && textArticle.includes('saygi-article'));
check('REQ-009 positive: lead/quote treatment is a distinct reading surface', textArticle.includes('class="saygi-lead"') && textArticle.includes(esc(article.lead)));
check('REQ-009 positive: source footer has explicit source/license grouping', textArticle.includes('saygi-attribution-copy') && textArticle.includes('Kaynak ve lisans') && textArticle.includes(esc(longLicense)));
check('REQ-009 negative: missing portrait has a readable text fallback', textArticle.includes('saygi-hero-media is-empty') && textArticle.includes('Portre yok') && textArticle.includes('Metinli okuma devam ediyor'));

const imageArticle = Object.assign({}, article, { thumbnail: 'https://upload.wikimedia.org/example/portrait.jpg' });
const imageHtml = registry.saygiArticleBodyHTML(person, imageArticle, false, '', true);
check('REQ-009 negative: broken portrait is recoverable without removing the article', imageHtml.includes("onerror=\"this.hidden=true;this.parentElement.classList.add('is-broken');\"") && imageHtml.includes('saygi-hero-media-fallback'));
check('REQ-009 negative: long source/footer text is present for wrap testing', imageHtml.includes('saygi-attribution-copy') && imageHtml.includes(esc(longLicense)));

check('REQ-010 positive: locked inline action exposes its reason', textArticle.includes('saygi-read-button') && textArticle.includes('Yazının sonuna inince açılır'));
check('REQ-010 positive: existing scroll gate remains IntersectionObserver based', saygiSource.includes('IntersectionObserver') && saygiSource.includes('threshold:.72'));
check('REQ-010 positive: fallback scroll gate remains available', saygiSource.includes('sc.scrollTop+sc.clientHeight>=sc.scrollHeight-28'));

ui.saygiArticle = article;
ui.saygiReadReady = false;
const lockedFab = registry.saygiFloatingReadHTML();
check('REQ-010 negative: fixed action remains disabled before the end gate', lockedFab.includes('class="sg-person-read-fab is-locked"') && lockedFab.includes('disabled') && lockedFab.includes('Yazının sonuna inince açılır'));
check('REQ-010 positive: fixed action has an accessible lock description', lockedFab.includes('aria-describedby="saygi-read-sub-modal"') && lockedFab.includes('id="saygi-read-sub-modal"'));
check('REQ-010 positive: fixed action leaves positioning to the scoped stylesheet', !lockedFab.includes('style=') && !/style="[^"]*2147483640/.test(lockedFab));

ui.saygiReadReady = true;
const readyFab = registry.saygiFloatingReadHTML();
check('REQ-010 positive: gate unlock preserves the mark-read handler', readyFab.includes('class="sg-person-read-fab is-ready"') && readyFab.includes('App.markSaygiRead()'));

state.days[date].reading.entries.push({ id: 'reading-1', source: 'saygi', personId: person.id, saygiDate: date, ts: date + 'T08:00:00Z' });
const doneFab = registry.saygiFloatingReadHTML();
check('REQ-010 return: read state keeps the existing reading return action', doneFab.includes('class="sg-person-read-fab is-done"') && doneFab.includes('App.openSaygiReading()') && doneFab.includes('Ne okudum kaydını aç'));

ui.saygiArticle = null;
ui.saygiLoading = true;
const loadingHtml = registry.saygiPersonModalHTML();
check('loading state: status region remains visible', loadingHtml.includes('class="saygi-loading"') && loadingHtml.includes('role="status"') && !loadingHtml.includes('Yeniden dene'));

ui.saygiLoading = false;
ui.saygiError = 'Uzun ve Türkçe bir hata açıklaması taşma yapmadan görünür kalır.';
const errorHtml = registry.saygiPersonModalHTML();
check('error state: retry and source fallback remain available', errorHtml.includes('class="saygi-error"') && errorHtml.includes('Yeniden dene') && errorHtml.includes('Wikipedia’da aç'));
check('empty/error state: explicit failure reason is escaped into the surface', errorHtml.includes(esc(ui.saygiError)));

ui.saygiError = null;
ui.saygiArticle = article;
const returnModal = registry.saygiPersonModalHTML();
check('return state: article modal keeps dialog and sentinel contracts', returnModal.includes('role="dialog"') && returnModal.includes('saygi-article-modal') && returnModal.includes('saygi-read-sentinel-modal'));

check('style contract: article width and readable character measure are explicit', cssSource.includes('.saygi-article{width:100%;max-width:43rem') && cssSource.includes('.saygi-biography p{max-width:68ch'));
check('style contract: long headings and source copy wrap', cssSource.includes('.saygi-hero h2{overflow-wrap:anywhere') && cssSource.includes('.saygi-attribution-copy>span') && cssSource.includes('overflow-wrap:anywhere'));
check('style contract: portrait fallback states are visible and distinct', cssSource.includes('.saygi-hero-media.is-broken .saygi-hero-media-fallback') && cssSource.includes('.saygi-hero-media.is-empty'));
check('style contract: fixed action uses safe-area and bounded z-index', cssSource.includes('.sg-person-read-fab{position:fixed;z-index:560') && cssSource.includes('bottom:calc(12px + env(safe-area-inset-bottom))'));
check('style contract: modal body reserves space below fixed action', cssSource.includes('.sg-person-ov-body{padding:18px 18px calc(142px + env(safe-area-inset-bottom))'));
check('style contract: narrow view and reduced motion remain explicit', cssSource.includes('@media (max-width:380px)') && cssSource.includes('@media (prefers-reduced-motion:reduce)') && cssSource.includes('.sg-person-read-fab'));
check('scope contract: no App assignment or migration change was introduced', !/App\.[A-Za-z0-9_]+\s*=/.test(saygiSource) && !saygiSource.includes('migrate('));
check('scope contract: no network was used while rendering all fixture states', counters.fetch === 0);

console.log(`\nIIP-05 visual reader contract: ${passed} PASS, ${failed} FAIL`);
if (failed) process.exitCode = 1;
