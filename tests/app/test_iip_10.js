#!/usr/bin/env node
// IIP-10 — Öncü arama ve filtre (REQ-019 / REQ-020).
// No-network/node:vm fixture: 100 kişilik sentetik koleksiyon üzerinde isim/alan/
// okundu filtreleri, Türkçe normalizasyon, numara gridinin ikincil özete
// indirilmesi ve boş/yükleniyor/hata/dönüş durumları doğrulanır. Gerçek kişisel
// veri, token, localStorage, ağ veya tarayıcı kullanılmaz.

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const saygiSource = fs.readFileSync(path.join(root, 'app/core/saygi.js'), 'utf8');
const cssSource = fs.readFileSync(path.join(root, 'app/styles.css'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
let passed = 0;
let failed = 0;
function check(name, condition, detail) {
  if (condition) { passed++; console.log('PASS  ' + name); }
  else { failed++; console.log('FAIL  ' + name + (detail ? ' — ' + detail : '')); }
}

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── Sentetik 100 kişilik koleksiyon ──
// Gerçek seçkinin şekli korunur (id/name/trTitle/enTitle/field/kind/era) ama
// içerik uydurmadır; kişisel veri yoktur. Türkçe i/İ/ı/I vakaları özellikle
// yerleştirilmiştir çünkü REQ-019 olumsuz kontrolü tam olarak bunları ister.
const BILIM_FIELDS = ['Matematik · Bilgisayar bilimi', 'Fizik', 'Kimya', 'Astronomi · Fizik', 'Genetik', 'Mikrobiyoloji · Kimya'];
const SANAT_FIELDS = ['Resim', 'Şiir · Tiyatro', 'Roman · Deneme', 'Sinema · Fotoğraf', 'Heykel · Resim · Mimarlık', 'Bestecilik'];
const NAMES = [
  'İbn Sina', 'Isaac Newton', 'Işıl Deniz', 'ırmak Yıldız', 'Idris Kaya', 'Ada Lovelace',
  'Albert Einstein', 'Alan Turing', 'Rosalind Franklin', 'Marie Curie', 'Hypatia', 'Piri Reis',
  'İbrahim Çallı', 'Nâzım Hikmet', 'Frida Kahlo', 'Georgia O’Keeffe', 'Akira Kurosawa', 'Âşık Veysel',
  'Şükrü Sarı', 'Çiğdem Öz', 'Ğülcan Ateş', 'Ömer Ünal'
];
const PEOPLE = [];
for (let i = 0; i < 100; i++) {
  const isArt = i % 2 === 1;
  // Alan etiketleri i%6 yerine ayrı bir sayaca bağlanır; aksi hâlde Bilim ve
  // Sanat listelerinin yarısı hiç kullanılmaz ve bazı alan sorguları yapay
  // olarak sıfır sonuç verirdi.
  const slot = Math.floor(i / 2);
  const name = i < NAMES.length ? NAMES[i] : (isArt ? 'Sanatçı' : 'Bilimci') + ' ' + String(i + 1).padStart(2, '0');
  PEOPLE.push({
    id: 'syn-' + String(i + 1).padStart(3, '0'),
    name,
    trTitle: name,
    enTitle: name,
    field: isArt ? SANAT_FIELDS[slot % SANAT_FIELDS.length] : BILIM_FIELDS[slot % BILIM_FIELDS.length],
    kind: isArt ? 'Sanat' : 'Bilim',
    era: '1900–2000'
  });
}
const BY_ID = new Map(PEOPLE.map((person) => [person.id, person]));

const READ_IDS = ['syn-002', 'syn-004', 'syn-006']; // okunmuş kayıtlar
const state = {
  days: { '2026-09-21': { reading: { entries: [] } } },
  saygi: { collection: {}, streak: 0, lastReadDate: '' }
};
READ_IDS.forEach((id) => {
  const person = BY_ID.get(id);
  state.saygi.collection[id] = { name: person.name, field: person.field, readAt: '2026-09-20T08:00:00.000Z', favorite: false };
});
const ui = {
  faithTab: 'oncu', saygiPersonOpen: false, saygiBrowseId: null, saygiArticle: null,
  saygiLoading: false, saygiError: null, saygiReadReady: false, saygiRequestId: 0,
  saygiQuery: '', saygiKindFilter: 'all', saygiReadFilter: 'all', saygiGridOpen: false,
  qiblaHeading: null, qiblaListening: false, qiblaSensorSource: '', qiblaAccuracy: null, qiblaSensorError: ''
};

const counters = { storage: 0, fetch: 0, timers: 0 };
const sandbox = {
  console, URL, URLSearchParams, Date, Math, JSON, Object, Array, String, Number,
  Boolean, RegExp, Error, Promise, Set, Map, Intl, encodeURIComponent, decodeURIComponent,
  isNaN, isFinite, document: {},
  localStorage: { getItem() { counters.storage++; return null; }, setItem() { counters.storage++; } },
  fetch() { counters.fetch++; return Promise.reject(new Error('network forbidden')); },
  setTimeout() { counters.timers++; return 0; }, clearTimeout() {},
  SaygiPeople: PEOPLE, HijriCalendarV1: undefined,
  SeymaPrayer: {
    PRAYER_ORDER: ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'],
    PRAYER_NAMES: { fajr: 'İmsak', sunrise: 'Güneş', dhuhr: 'Öğle', asr: 'İkindi', maghrib: 'Akşam', isha: 'Yatsı' },
    prayerSettings() { return { hijriOffset: 0 }; },
    prayerLocation() { return { lat: 39.9334, lon: 32.8597, cityName: 'Ankara', source: 'fixture' }; },
    ensurePrayerDay(day) { return (day && day.prayer) || {}; },
    prayerDaySummary() { return { performed: 2, congregation: 1, madeUp: 0, late: 0, nafile: 0, total: 6 }; },
    prayerStreak() { return 3; },
    prayerTimesFromDay() { return { fajr: { time: '05:12' } }; },
    currentPrayerIndex() { return 0; },
    nextPrayerInfo() { return { key: 'dhuhr', name: 'Öğle', label: '2 saat' }; },
    emptyPrayerEntry() { return {}; }
  }
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
  getDay: (data, date) => data.days[date] || (data.days[date] = { reading: { entries: [] } }),
  todayStr: () => '2026-09-21',
  addDays: (date, amount) => {
    const parts = String(date).split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + Number(amount || 0));
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },
  diffDays: (from, to) => Math.round((new Date(to) - new Date(from)) / 86400000),
  dayIndexFor: () => 1,
  dateLabelTR: (date) => date,
  icon: (name) => '<svg data-icon="' + esc(name) + '"></svg>',
  esc,
  featuresLive: () => true,
  render: () => {},
  quranJourneyHubCardHTML: () => '<article id="quran-journey-card"></article>',
  zikrVisible: () => true,
  zikrPreviewCardHTML: () => '<article class="zikr-v2-preview">Zikir</article>'
};

check('IIP-10 registry boots with the unchanged dependency bag', registry && registry.registerSaygi(deps) === true);
check('IIP-10 registration stays fail-closed on a second call', registry.registerSaygi(deps) === false);
check('IIP-10 view/index work opens no storage, network or timers',
  counters.storage === 0 && counters.fetch === 0 && counters.timers === 0);

// ── REQ-019 · Türkçe normalizasyon ──
check('REQ-019 normalization folds Turkish I/İ/ı/i to a single letter',
  registry.saygiNormalize('İbn') === 'ibn' && registry.saygiNormalize('ISAAC') === 'isaac' &&
  registry.saygiNormalize('Işıl') === 'isil' && registry.saygiNormalize('ırmak') === 'irmak' &&
  registry.saygiNormalize('IDRIS') === 'idris');
check('REQ-019 normalization folds remaining Turkish diacritics',
  registry.saygiNormalize('Şükrü') === 'sukru' && registry.saygiNormalize('Çiğdem') === 'cigdem' &&
  registry.saygiNormalize('Ğülcan') === 'gulcan' && registry.saygiNormalize('Ömer') === 'omer' &&
  registry.saygiNormalize('Nâzım') === 'nazim' && registry.saygiNormalize('Âşık') === 'asik');
check('REQ-019 normalization is exposed but never mutates the content module',
  typeof registry.saygiFold === 'function' && PEOPLE.every((person) => /[İıŞşĞğÇçÖöÜüÂâÎîÛû]/.test(person.name + person.field) === /[İıŞşĞğÇçÖöÜüÂâÎîÛû]/.test(person.name + person.field)) &&
  registry.saygiPeople()[0].name === PEOPLE[0].name);

function lens(query, kind, read) {
  ui.saygiQuery = query == null ? '' : query;
  ui.saygiKindFilter = kind == null ? 'all' : kind;
  ui.saygiReadFilter = read == null ? 'all' : read;
  return registry.saygiLens();
}
function ids(result) { return result.results.map((person) => person.id); }

// ── REQ-019 · olumlu: isim / alan / okundu araması ──
const byName = lens('einstein');
check('REQ-019 positive: name search finds exactly the matching pioneer',
  byName.results.length === 1 && byName.results[0].name === 'Albert Einstein');
check('REQ-019 positive: empty query is the full, unfiltered collection',
  lens('').results.length === 100 && lens('').hasLens === false && lens('').total === 100);
const byFieldWord = lens('matematik');
check('REQ-019 positive: field word matches the composite field label',
  byFieldWord.results.length > 1 && byFieldWord.results.every((person) => registry.saygiNormalize(person.field).indexOf('matematik') > -1));
const byFieldPair = lens('matematik bilgisayar');
check('REQ-019 positive: a multi-word field query matches the composite label',
  byFieldPair.results.length > 0 && byFieldPair.results.some((person) => person.field === 'Matematik · Bilgisayar bilimi'));
const byEra = lens('1900');
check('REQ-019 positive: era is searchable', byEra.results.length === 100);
const byKindWord = lens('sanat');
check('REQ-019 positive: kind word is searchable',
  byKindWord.results.length === 50 && byKindWord.results.every((person) => person.kind === 'Sanat'));
const readOnly = lens('', 'all', 'read');
const unreadOnly = lens('', 'all', 'unread');
check('REQ-019 positive: read filter returns exactly the stored read records',
  readOnly.results.length === READ_IDS.length && ids(readOnly).sort().join(',') === READ_IDS.slice().sort().join(','));
check('REQ-019 positive: unread filter is the complement of the read records',
  unreadOnly.results.length === 100 - READ_IDS.length && ids(unreadOnly).every((id) => READ_IDS.indexOf(id) < 0));
const kindFilter = lens('', 'Bilim');
check('REQ-019 positive: kind filter narrows to the science half',
  kindFilter.results.length === 50 && kindFilter.results.every((person) => person.kind === 'Bilim'));
const combined = lens('ibn', 'Bilim', 'all');
check('REQ-019 positive: query and filter combine instead of overriding each other',
  combined.results.length === 1 && combined.results[0].name === 'İbn Sina' && combined.activeCount === 1);

// ── REQ-019 · olumsuz: I/İ/ı/i, boş sorgu, çok filtre, sıfır sonuç ──
check('REQ-019 negative: lowercase ascii query finds the capitalized Turkish name',
  lens('ibn').results.length === 1 && lens('ibn').results[0].name === 'İbn Sina');
check('REQ-019 negative: uppercase ascii query finds the same Turkish name',
  lens('IBN').results.length === 1 && lens('IBN').results[0].name === 'İbn Sina');
check('REQ-019 negative: dotless ı and dotted i are interchangeable both ways',
  lens('ırmak').results.length === 1 && lens('irmak').results.length === 1 &&
  lens('ırmak').results[0].name === lens('irmak').results[0].name && lens('IRMAK').results.length === 1);
check('REQ-019 negative: ascii query finds diacritic names',
  lens('cigdem').results.length === 1 && lens('sukru').results.length === 1 && lens('omer').results.length === 1);
check('REQ-019 negative: a one-character query never silently shows a zero-result dead end',
  lens('i').results.length === 100 && lens('i').tooShort === true && lens('i').hasLens === true &&
  registry.saygiResultCountText(lens('i')).includes('iki harf yeter'));
check('REQ-019 negative: query text is trimmed, whitespace-collapsed and bounded',
  lens('   ibn   sina  ').query === 'ibn sina' && lens('x'.repeat(200)).query.length === 80);
check('REQ-019 negative: unknown filter values fall back to "all" instead of a dead end',
  lens('', 'Mars', 'maybe').kind === 'all' && lens('', 'Mars', 'maybe').read === 'all' &&
  lens('', 'Mars', 'maybe').results.length === 100);
check('REQ-019 negative: multiple simultaneous filters can legitimately return zero',
  lens('einstein', 'Sanat', 'unread').results.length === 0 &&
  lens('einstein', 'Sanat', 'unread').activeCount === 2);
check('REQ-019 negative: a zero-result query keeps the exact query text so it can be recovered',
  lens('zzzznomatch').query === 'zzzznomatch' && lens('zzzznomatch').results.length === 0);
check('REQ-019 negative: zero results never lose the total collection size',
  lens('zzzznomatch').total === 100 && lens('zzzznomatch').readCount === READ_IDS.length);
check('REQ-019 boundary: an empty collection yields no results instead of throwing',
  (function () {
    const saved = sandbox.SaygiPeople;
    sandbox.SaygiPeople = [];
    const empty = lens('');
    const ok = empty.results.length === 0 && empty.total === 0;
    sandbox.SaygiPeople = saved;
    return ok;
  })());

// ── REQ-019 · yükleniyor / hata / dönüş görünümleri ──
ui.saygiQuery = '';
ui.saygiKindFilter = 'all';
ui.saygiReadFilter = 'all';
const idleHtml = registry.saygiFilteredResultsHTML(registry.saygiLens(), PEOPLE[0].id);
check('REQ-019 loading state: the named list is rendered before any network call',
  idleHtml.includes('id="saygi-person-list"') && idleHtml.includes('sg-p-search-person') && counters.fetch === 0);
const emptyHtml = registry.saygiFilteredResultsHTML(lens('zzzznomatch'), PEOPLE[0].id);
check('REQ-019 zero-result state: an explicit empty view with a single recovery action is shown',
  emptyHtml.includes('id="saygi-search-empty"') && emptyHtml.includes('Sonuç yok') &&
  emptyHtml.includes("App.saygiLens('reset')") && emptyHtml.includes('Tüm filtreleri temizle'));
check('REQ-019 zero-result state: the failed query is echoed back escaped, never as markup',
  registry.saygiFilteredResultsHTML(lens('<img src=x onerror=alert(1)>'), PEOPLE[0].id).includes('&lt;img') &&
  !registry.saygiFilteredResultsHTML(lens('<img src=x onerror=alert(1)>'), PEOPLE[0].id).includes('<img'));
const shortHtml = registry.saygiFilteredResultsHTML(lens('i'), PEOPLE[0].id);
check('REQ-019 return state: a sub-two-character query keeps the full list and explains the rule',
  shortHtml.includes('id="saygi-person-list"') && registry.saygiResultCountText(lens('i')).includes('iki harf yeter'));
check('REQ-019 return state: the result count is a polite live region, not a per-keystroke announcement',
  registry.saygiResultCountHTML(registry.saygiLens()).includes('role="status"') &&
  registry.saygiResultCountHTML(registry.saygiLens()).includes('id="saygi-result-count"'));
check('REQ-019 error state: an unavailable collection has its own distinguishable view',
  registry.saygiFilteredResultsHTML((function () { const saved = sandbox.SaygiPeople; sandbox.SaygiPeople = []; const l = lens(''); sandbox.SaygiPeople = saved; return l; })(), null)
    .includes('Koleksiyon henüz hazırlanıyor'));
check('REQ-019: the search controls preserve an existing query through a full re-render',
  registry.saygiSearchControlsHTML(lens('fizik')).includes('value="fizik"') &&
  registry.saygiSearchControlsHTML(lens('fizik')).includes("App.saygiLens('query',this.value)"));
check('REQ-019: clear control is only actionable when there is a query to clear',
  !registry.saygiSearchControlsHTML(lens('')).includes('id="saygi-search-clear" class="sg-p-search-clear" type="button" aria-label="Aramayı temizle" hidden') === false &&
  registry.saygiSearchControlsHTML(lens('fizik')).includes('aria-label="Aramayı temizle"'));
check('REQ-019: the reset control stays in the DOM but is hidden when no filter is active',
  registry.saygiSearchControlsHTML(lens('')).includes('id="saygi-search-reset"') &&
  registry.saygiSearchControlsHTML(lens('')).includes('hidden') &&
  !registry.saygiSearchControlsHTML(lens('fizik')).includes('id="saygi-search-reset" class="sg-p-search-reset" hidden'));

// ── REQ-020 · isimli liste birincil, grid ikincil ──
ui.saygiQuery = ''; ui.saygiKindFilter = 'all'; ui.saygiReadFilter = 'all';
const card = registry.saygiCollectionCardHTML(PEOPLE[0]);
const detailsAt = card.indexOf('<details');
const detailsEnd = card.indexOf('</details>');
check('REQ-020 positive: the named list is the primary collection surface',
  card.indexOf('id="saygi-person-list"') > -1 && detailsAt > -1 && card.indexOf('id="saygi-person-list"') < detailsAt);
check('REQ-020 positive: the number grid is a collapsed secondary summary',
  detailsAt > -1 && card.indexOf('<summary') > detailsAt && card.indexOf('<summary') < detailsEnd &&
  card.indexOf('İkincil özet görünümü') > -1);
check('REQ-020 positive: the grid is collapsed by default and only opens when remembered',
  detailsAt > -1 && card.slice(detailsAt, detailsAt + 80).indexOf(' open') < 0);
ui.saygiGridOpen = true;
const reopened = registry.saygiCollectionCardHTML(PEOPLE[0]);
check('REQ-020 positive: a remembered open grid state survives re-render',
  reopened.slice(reopened.indexOf('<details'), reopened.indexOf('<details') + 80).indexOf(' open') > -1);
ui.saygiGridOpen = false;
check('REQ-020 positive: the collection card renders the search controls before the results',
  card.indexOf('id="saygi-search-input"') > -1 && card.indexOf('id="saygi-search-input"') < detailsAt);
check('REQ-020 positive: every listed person has a name, field, description and read state',
  registry.saygiFilteredResultsHTML(lens('einstein'), PEOPLE[0].id).includes('Albert Einstein') &&
  registry.saygiFilteredResultsHTML(lens('einstein'), PEOPLE[0].id).includes('sg-p-search-field') &&
  registry.saygiFilteredResultsHTML(lens('einstein'), PEOPLE[0].id).includes('sg-p-search-desc') &&
  registry.saygiFilteredResultsHTML(lens('einstein'), PEOPLE[0].id).includes('Okunmadı'));
check('REQ-020 positive: read state is declared truthfully in both the row and its label',
  registry.saygiFilteredResultsHTML(lens(BY_ID.get('syn-002').name), PEOPLE[0].id).includes('Okundu') &&
  registry.saygiFilteredResultsHTML(lens(BY_ID.get('syn-002').name), PEOPLE[0].id).includes('· okundu') &&
  registry.saygiFilteredResultsHTML(lens(BY_ID.get('syn-003').name), PEOPLE[0].id).includes('Okunmadı'));
check('REQ-020 positive: today\'s pioneer is marked on the primary row, not only in the grid',
  registry.saygiFilteredResultsHTML(lens(PEOPLE[0].name), PEOPLE[0].id).includes('todayd') &&
  registry.saygiFilteredResultsHTML(lens(PEOPLE[0].name), PEOPLE[0].id).includes('sg-p-search-person'));

// ── REQ-020 · olumsuz: klavye 100 anlamsız numara zincirine mahkûm edilmez ──
check('REQ-020 negative: keyboard order reaches named people, not 100 anonymous numbers',
  registry.saygiFilteredResultsHTML(lens(''), PEOPLE[0].id).split('sg-p-search-person').length - 1 === 100 &&
  registry.saygiFilteredResultsHTML(lens('matematik'), PEOPLE[0].id).includes('sg-p-search-name'));
check('REQ-020 negative: the filtered view does not force the whole 100-cell grid open',
  registry.saygiFilteredResultsHTML(lens('einstein'), PEOPLE[0].id).indexOf('sg-collect-grid') < 0);
check('REQ-020 negative: a person appears exactly once in the primary list, never duplicated',
  registry.saygiFilteredResultsHTML(lens(''), PEOPLE[0].id).split('id="saygi-person-' + PEOPLE[3].id + '"').length - 1 === 1);
check('REQ-020 negative: the grid cells keep their number labels for the secondary view',
  registry.saygiCollectionGridHTML(PEOPLE[0], state.saygi.collection, READ_IDS.length, 100).includes('<span>1</span>') &&
  registry.saygiCollectionGridHTML(PEOPLE[0], state.saygi.collection, READ_IDS.length, 100).includes('aria-label="100 öncü sayı düzeni'));
check('REQ-020 negative: the secondary grid never becomes the only path to a person',
  registry.saygiCollectionCardHTML(PEOPLE[0]).indexOf('id="saygi-person-list"') > -1 &&
  registry.saygiCollectionGridHTML(PEOPLE[0], state.saygi.collection, READ_IDS.length, 100).includes("App.openSaygiCollectionPerson('syn-002')"));

check('REQ-020: the grid meta line reports truthful read progress',
  registry.saygiCollectionGridHTML(PEOPLE[0], state.saygi.collection, READ_IDS.length, 100).includes(READ_IDS.length + '/100 okundu'));
check('REQ-020: read progress is mirrored on the list footer',
  registry.saygiFilteredResultsHTML(lens(''), PEOPLE[0].id).includes(READ_IDS.length + '/100 okundu'));

// ── Sözleşme: tek dispatcher, arama indeksi okuma yolunda ──
check('scope contract: search reads the query through the existing ui channel only',
  /function saygiUiQuery\(\)\{ var u=stateUi\(\); return \(u&&u\.saygiQuery!=null\)\?String\(u\.saygiQuery\):''; \}/.test(saygiSource) &&
  !/dep\('query'\)/.test(saygiSource) &&
  !/SAYGI_DEPENDENCIES=\[[^\]]*'query'/.test(saygiSource));
check('scope contract: the query never leaves the ephemeral ui channel',
  !/data\.saygiQuery/.test(saygiSource) && !/saygiQuery[^\n]{0,40}setItem/.test(saygiSource) &&
  !/data\.saygiSearch/.test(saygiSource));
check('scope contract: saygi.js still owns no App assignment, migration or storage write',
  !/App\.[A-Za-z0-9_]+\s*=[^=]/.test(saygiSource) && !saygiSource.includes('localStorage.setItem'));
check('scope contract: one dispatcher handler serves every search interaction',
  /App\.saygiLens=function\(action,value\)\{/.test(appSource) &&
  (appSource.match(/App\.saygiLens=function/g) || []).length === 1 &&
  appSource.includes("var SAYGI_LENS_ACTIONS={"));
check('scope contract: search markup routes through the single dispatcher',
  !/on(click|input|keydown|toggle)="App\.(set|clear|toggle)[A-Za-z]*Saygi/.test(saygiSource) &&
  (saygiSource.match(/App\.saygiLens\(/g) || []).length >= 10);
check('scope contract: an unknown dispatcher action is a safe no-op',
  /if\(!SAYGI_LENS_ACTIONS\[act\]\) return;/.test(appSource));
check('scope contract: the search region is painted in place so caret and focus survive typing',
  /var region=document\.getElementById\('saygi-search-region'\)/.test(appSource) &&
  /if\(!region\) return false;/.test(appSource) && appSource.includes('if(!saygiPaintLens()) render();'));
check('style contract: search, chips, named rows and secondary grid are fully token-styled',
  cssSource.includes('.sg-p-search-input{') && cssSource.includes('.sg-p-chip.on{') &&
  cssSource.includes('.sg-p-search-person{') && cssSource.includes('.sg-collect-grid-wrap{'));
check('style contract: narrow viewport and reduced-motion variants are explicit',
  cssSource.includes('.sg-collect-grid-summary:focus-visible') &&
  /@media\(prefers-reduced-motion:reduce\)\{[\s\S]{0,400}\.sg-p-chip:active/.test(cssSource) &&
  /@media\(max-width:389px\)\{[\s\S]{0,200}\.sg-p-search-state\{max-width:100%/.test(cssSource));
check('style contract: the named row keeps a single tap target for one biography',
  (registry.saygiFilteredResultsHTML(lens(''), PEOPLE[0].id).match(/<button/g) || []).length === 100 &&
  (registry.saygiFilteredResultsHTML(lens(''), PEOPLE[0].id).match(/<a /g) || []).length === 0);

console.log(`\nIIP-10 search and filter contract: ${passed} PASS, ${failed} FAIL`);
if (failed) process.exitCode = 1;
