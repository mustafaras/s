#!/usr/bin/env node
// IIP-11 — Okuyucu etkileşimleri (REQ-021 / REQ-022).
// No-network/node:vm fixture: oturumluk yazı büyütme, bölüm atlama, okuma konumu
// koruma, RTL yön ve scroll-gate'in erişilebilir alternatifi doğrulanır. Gerçek
// kişisel veri, token, localStorage, ağ veya tarayıcı kullanılmaz.

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
function esc(v) {
  return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const PERSON = { id: 'syn-1', name: 'Sentetik Kişi', kind: 'Bilim', era: '1900–2000', field: 'Fizik' };
// 1 ve 20 paragraflık sentetik metin (S03 kabul ölçütü), + bölüm başlıkları.
function articleWith(paragraphs, headings, rtl) {
  const blocks = [];
  blocks.push({ type: 'p', text: 'Açılış paragrafı: ' + 'lorem ipsum dolor sit amet '.repeat(6) });
  for (let h = 0; h < headings; h++) {
    blocks.push({ type: 'h', text: 'Bölüm ' + (h + 1) + ' başlığı' });
    for (let p = 0; p < Math.ceil((paragraphs - 1) / Math.max(1, headings)); p++) {
      blocks.push({ type: 'p', text: ('Paragraf ' + (p + 1) + ': ' + 'okuma metni gövdesi '.repeat(14)).trim() });
    }
  }
  const a = {
    personId: PERSON.id, dailyKey: '', lang: 'tr', title: 'Sentetik Biyografi',
    canonical: 'Sentetik Biyografi', description: 'Kısa açıklama', lead: '',
    blocks, thumbnail: '', sourceUrl: 'https://tr.wikipedia.org/wiki/X',
    licenseTitle: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    revision: 1, links: [], fetchedAt: '2026-09-21T06:00:00.000Z'
  };
  if (rtl) a.rtl = true;
  return a;
}

const state = { days: { '2026-09-21': { reading: { entries: [] } } } };
const ui = {
  faithTab: 'oncu', saygiPersonOpen: true, saygiBrowseId: PERSON.id,
  saygiArticle: null, saygiLoading: false, saygiError: null, saygiReadReady: false,
  saygiRequestId: 0, saygiQuery: '', saygiKindFilter: 'all', saygiReadFilter: 'all',
  saygiGridOpen: false, saygiScaleIndex: 0, saygiPosition: null
};
const counters = { storage: 0, fetch: 0, timers: 0 };
const sandbox = {
  console, URL, URLSearchParams, Date, Math, JSON, Object, Array, String, Number,
  Boolean, RegExp, Error, Promise, Set, Map, Intl, encodeURIComponent, decodeURIComponent,
  isNaN, isFinite, document: {},
  localStorage: { getItem() { counters.storage++; return null; }, setItem() { counters.storage++; } },
  fetch() { counters.fetch++; return Promise.reject(new Error('network forbidden')); },
  setTimeout() { counters.timers++; return 0; }, clearTimeout() {},
  SaygiPeople: [PERSON], HijriCalendarV1: undefined,
  SeymaPrayer: {
    PRAYER_ORDER: ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'],
    PRAYER_NAMES: { fajr: 'İmsak', sunrise: 'Güneş', dhuhr: 'Öğle', asr: 'İkindi', maghrib: 'Akşam', isha: 'Yatsı' },
    prayerSettings() { return { hijriOffset: 0 }; },
    prayerLocation() { return { lat: 39.9, lon: 32.8, cityName: 'Ankara', source: 'fixture' }; },
    ensurePrayerDay(d) { return (d && d.prayer) || {}; },
    prayerDaySummary() { return { performed: 1, congregation: 0, madeUp: 0, late: 0, nafile: 0, total: 6 }; },
    prayerStreak() { return 1; }, prayerTimesFromDay() { return {}; }, currentPrayerIndex() { return 0; },
    nextPrayerInfo() { return {}; }, emptyPrayerEntry() { return {}; }
  }
};
sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
vm.runInContext(saygiSource, vm.createContext(sandbox), { filename: 'app/core/saygi.js' });
const R = sandbox.SeymaSaygi;
const deps = {
  data: () => state, ui: () => ui,
  getDay: (d, x) => d.days[x] || (d.days[x] = { reading: { entries: [] } }),
  todayStr: () => '2026-09-21', addDays: (a) => a, diffDays: () => 0, dayIndexFor: () => 1,
  dateLabelTR: (x) => x, icon: (n) => '<svg data-icon="' + esc(n) + '"></svg>', esc,
  featuresLive: () => true, render: () => {}, quranJourneyHubCardHTML: () => '',
  zikrVisible: () => true, zikrPreviewCardHTML: () => ''
};
check('IIP-11 registry boots with the unchanged dependency bag', R.registerSaygi(deps) === true);
check('IIP-11 view work opens no storage, network or timers',
  counters.storage === 0 && counters.fetch === 0 && counters.timers === 0);

// ── REQ-021 · yazı büyütme (oturumluk) ──
check('REQ-021 scale starts at the default step',
  R.saygiScalePercent() === 100 && R.saygiScaleLabel() === '100%' && R.saygiScaleIsDefault() === true);
check('REQ-021 scale steps are bounded and ascending',
  JSON.stringify(R.saygiScaleSteps) === '[100,112,125,140,160]');
ui.saygiScaleIndex = 2;
check('REQ-021 a mid scale reports its own label', R.saygiScalePercent() === 125 && R.saygiScaleIsDefault() === false);
ui.saygiScaleIndex = 99;
check('REQ-021 an out-of-range scale index falls back safely instead of breaking',
  R.saygiScalePercent() === 100);
ui.saygiScaleIndex = 0;

const art = articleWith(20, 3, false);
ui.saygiArticle = art;
const bodyHtml = R.saygiArticleBodyHTML(PERSON, Object.assign(Object.create(art), { suffix: '-modal' }), false, 'saygi-article-modal', false);
check('REQ-021 article carries an explicit scale token and hook',
  bodyHtml.includes('data-saygi-scale="100"') && bodyHtml.includes('--saygi-scale:1.00'));
ui.saygiScaleIndex = 4;
const bigHtml = R.saygiArticleBodyHTML(PERSON, Object.assign(Object.create(art), { suffix: '-modal' }), false, 'saygi-article-modal', false);
check('REQ-021 a larger scale changes only the reader body token',
  bigHtml.includes('data-saygi-scale="160"') && bigHtml.includes('--saygi-scale:1.60'));
ui.saygiScaleIndex = 0;

// ── REQ-021 · bölüm atlama ──
const sections = R.saygiSections(art, PERSON);
check('REQ-021 positive: heading blocks become numbered skip targets',
  sections.length === 3 && sections[0].number === 1 && sections[2].number === 3);
check('REQ-021 positive: skip targets carry stable anchor ids derived from person + index',
  sections[0].anchorId === R.saygiAnchorId(PERSON, sections[0].index) &&
  sections[0].anchorId.startsWith('saygi-blok-syn-1-'));
const skipHtml = R.saygiSectionSkipHTML(art, PERSON, '-modal');
check('REQ-021 positive: the skip control is a native labelled select',
  skipHtml.includes('saygi-skip-select') && skipHtml.includes('<label') &&
  skipHtml.includes('Bölüme atla') && skipHtml.includes('1. Bölüm 1 başlığı'));
check('REQ-021 positive: every section is reachable from the skip control',
  (skipHtml.match(/<option value="saygi-blok-/g) || []).length === 3);
const noSections = articleWith(3, 0, false);
check('REQ-021 negative: a heading-less article renders no empty skip control',
  R.saygiHasSections(noSections, PERSON) === false && R.saygiSectionSkipHTML(noSections, PERSON, '') === '');
check('REQ-021 negative: anchors are attached to the rendered blocks',
  bodyHtml.includes('id="saygi-blok-syn-1-1"') && bodyHtml.includes('tabindex="-1"'));

// ── REQ-021 · okuma konumu (oturum içinde korunur) ──
check('REQ-021 position starts empty', R.saygiPosition() === null && R.saygiHasPosition() === false);
R.saygiRememberPosition('saygi-blok-syn-1-5', -0.4);
const pos = R.saygiPosition();
check('REQ-021 position stores anchor + relative ratio (not a raw pixel offset)',
  pos.anchorId === 'saygi-blok-syn-1-5' && Math.abs(pos.ratio + 0.4) < 1e-9 && R.saygiHasPosition() === true);
R.saygiRememberPosition('saygi-blok-syn-1-9', 99);
check('REQ-021 ratio is clamped so a bad value cannot corrupt restore',
  R.saygiPosition().ratio === 1);
R.saygiClearPosition();
check('REQ-021 "back to start" clears the remembered position (separate from Aa)',
  R.saygiPosition() === null);
check('REQ-021 position lives only in the session channel, never in data',
  !/data\.saygiPosition/.test(saygiSource) && !/saygiPosition[^\n]{0,40}setItem/.test(saygiSource));

// ── REQ-021 · RTL ──
const rtlArt = articleWith(20, 2, true);
check('REQ-021 negative: an RTL article carries its own direction metadata',
  R.saygiIsRtl(rtlArt) === true && R.saygiReadingDirection(rtlArt) === 'rtl' &&
  R.saygiDirectionLabel(rtlArt) === 'Sağdan sola yazı yönü');
check('REQ-021 LTR stays the default direction for normal articles',
  R.saygiIsRtl(art) === false && R.saygiReadingDirection(art) === 'ltr');
const rtlHtml = R.saygiArticleBodyHTML(PERSON, Object.assign(Object.create(rtlArt), { suffix: '-modal' }), false, 'saygi-article-modal', false);
check('REQ-021 negative: RTL is declared in markup, not implied by styling',
  rtlHtml.includes('dir="rtl"') && rtlHtml.includes('saygi-dir-tag') && rtlHtml.includes('Sağdan sola yazı yönü'));
check('REQ-021 RTL does not leak into a non-RTL article',
  !bodyHtml.includes('dir="rtl"') && bodyHtml.includes('dir="ltr"'));
check('style contract: RTL is handled on both article wrappers',
  /\.saygi-article\[dir="rtl"\],\.saygi-article-modal\[dir="rtl"\]\{text-align:right;\}/.test(cssSource));

// ── REQ-022 · mevcut gate A'da korunur ──
check('REQ-022 positive: the existing IntersectionObserver scroll gate is untouched',
  saygiSource.includes('IntersectionObserver') && saygiSource.includes('threshold:.72'));
check('REQ-022 positive: the scroll fallback path is still present',
  saygiSource.includes('sc.scrollTop+sc.clientHeight>=sc.scrollHeight-28'));
check('REQ-022 positive: the sentinel + "Okudum" action still gate the record',
  saygiSource.includes('saygi-read-sentinel') && saygiSource.includes('App.markSaygiRead()'));

// ── REQ-022 · B: erişilebilir alternatif ──
check('REQ-022 positive: the accessible alternative is on by default',
  R.saygiA11yAlternativeOn() === true);
const altHtml = R.saygiA11yAltHTML('-modal', false);
check('REQ-022 positive: the alternative exposes a keyboard-reachable section-end action',
  altHtml.includes('id="saygi-a11y-end-modal"') && altHtml.includes('Bölüm sonuna git') &&
  altHtml.includes('onclick="App.saygiReader(\'a11y-end\')"'));
check('REQ-022 positive: the alternative announces itself politely, not as an alert',
  altHtml.includes('role="status"') && altHtml.includes('aria-live="polite"'));
check('REQ-022 positive: the alternative states up front that it does not create a record',
  altHtml.includes('kaydı kendiliğinden oluşturmaz') || altHtml.includes('eşdeğerdir'));
check('REQ-022 positive: the alternative is rendered inside the reader body',
  bodyHtml.includes('saygi-a11y-alt') && bodyHtml.includes('saygi-a11y-end'));
ui.saygiA11yAlt = false;
check('REQ-022 negative: the alternative can be turned off without touching the gate',
  R.saygiA11yAltHTML('', false) === '' && R.saygiA11yAlternativeOn() === false);
ui.saygiA11yAlt = true;

// ── REQ-022 · olumsuz: kaydırma/ekran okuyucu erişimi OTOMATİK kayıt oluşturmaz ──
check('REQ-022 negative: the alternative never writes a reading entry itself',
  !/saygiMarkRead\s*\(/.test(saygiSource.slice(saygiSource.indexOf('function saygiA11yAltHTML'), saygiSource.indexOf('function saygiA11yAltHTML') + 700)) &&
  !/day\.reading\.entries\.push/.test(saygiSource));
check('REQ-022 negative: reaching the end only signals readiness, never the record',
  /act==='a11y-end'/.test(appSource) && /ui\.saygiReadReady=true;/.test(appSource.slice(appSource.indexOf("act==='a11y-end'"), appSource.indexOf("act==='a11y-end'") + 400)) &&
  !/save\(\)/.test(appSource.slice(appSource.indexOf("act==='a11y-end'"), appSource.indexOf("act==='a11y-end'") + 400)));
check('REQ-022 negative: marking read still requires the explicit action and a real entry',
  appSource.includes('App.markSaygiRead=function()') &&
  appSource.includes('day.reading.entries.push(entry)') &&
  /saygiArticleReadableFor\(person,article\)/.test(appSource));
check('REQ-022 negative: the accessibility path does not add a timed or quiz gate',
  !/quiz/i.test(saygiSource) && !/saygiReadTimer|requiredQuiz|zorunluQuiz/i.test(saygiSource));

// ── Tek dispatcher sözleşmesi ──
check('scope contract: one reader dispatcher serves every reader interaction',
  /App\.saygiReader=function\(action,value\)\{/.test(appSource) &&
  (appSource.match(/App\.saygiReader=function/g) || []).length === 1 &&
  appSource.includes('var SAYGI_READER_ACTIONS={'));
check('scope contract: reader markup routes through the single dispatcher',
  !/on(click|change)="App\.(set|toggle|clear)[A-Za-z]*(Scale|Zoom|Position)/.test(saygiSource) &&
  (saygiSource.match(/App\.saygiReader\(/g) || []).length >= 6);
check('scope contract: an unknown reader action is a safe no-op',
  /if\(!SAYGI_READER_ACTIONS\[act\]\) return;/.test(appSource));
check('scope contract: saygi.js still owns no App assignment and no storage write',
  !/App\.[A-Za-z0-9_]+\s*=[^=]/.test(saygiSource) && !saygiSource.includes('localStorage.setItem'));
check('scope contract: no migration / data-shape behavior was introduced',
  !saygiSource.includes('migrate(') && !/data\.saygiScale/.test(saygiSource));
check('style contract: reader controls are fully token-styled',
  cssSource.includes('.saygi-aa{') && cssSource.includes('.saygi-aa-btn{') &&
  cssSource.includes('.saygi-skip{') && cssSource.includes('.saygi-a11y-alt{') &&
  cssSource.includes('.saygi-reader-region') === false);
check('style contract: the scale is applied to article text, not the app shell',
  /font-size:calc\(clamp\(\.9375rem,1\.8vw,1\.0625rem\) \* var\(--saygi-scale,1\)\)/.test(cssSource) &&
  /\.saygi-article-modal \.saygi-biography p/.test(cssSource) &&
  !/font-size:calc\(1em \* var\(--saygi-scale/.test(cssSource));
check('style contract: reduced-motion and narrow viewport variants are explicit',
  /@media\(prefers-reduced-motion:reduce\)\{[\s\S]{0,300}\.saygi-aa/.test(cssSource) &&
  /@media\(max-width:389px\)\{[\s\S]{0,300}\.sg-person-ov-card \.sg-person-ov-head\{flex-wrap:wrap/.test(cssSource));

// ── Yetim handler bekçisi (bu kartta bulunan gerçek bir regresyonun dersi) ──
// IIP-11 sırasında `App.openSaygiReading` yanlışlıkla silinmişti. Yüzey SAYISI
// 719=719 kaldığı için (bir handler silinip bir yenisi eklendi) hiçbir pin
// yakalamadı; ama saygi.js markup'ı onu İKİ yerde çağırıyordu ve okunmuş
// içerikte "Okudum" düğmesi kırılıyordu. Bu bekçi, markup'ta çağrılıp app.js'te
// TANIMSIZ kalan her App.* handler'ını yakalar — yüzey sayısından bağımsız.
const SURFACE_FILES = ['app/core/saygi.js', 'app/core/render.js', 'app/core/appSurface.js',
  'app/core/zikir.js', 'app/core/quran.js', 'app/core/profile.js', 'app/core/motivation.js',
  'app/core/settings.js', 'app/core/report.js', 'app/core/health.js', 'app/core/library.js',
  'app/core/map.js', 'app/core/crisis.js', 'app/core/journal.js', 'app/core/messaging.js',
  'app/core/prayer.js', 'app/core/reminders.js', 'app/core/reminderSurface.js'];
const definedHandlers = new Set((appSource.match(/App\.[A-Za-z0-9_]+\s*=/g) || [])
  .map((m) => m.match(/App\.[A-Za-z0-9_]+/)[0]));
const calledHandlers = new Set();
for (const file of SURFACE_FILES) {
  let src = '';
  try { src = fs.readFileSync(path.join(root, file), 'utf8'); } catch { continue; }
  for (const m of src.matchAll(/App\.([A-Za-z0-9_]+)\s*\(/g)) calledHandlers.add('App.' + m[1]);
}
const orphanHandlers = [...calledHandlers].filter((name) => !definedHandlers.has(name));
check('REQ-022 orphan guard: every App.* handler the markup calls is defined in app.js',
  orphanHandlers.length === 0,
  orphanHandlers.length ? 'tanımsız: ' + orphanHandlers.join(', ') : '');
check('REQ-022 orphan guard: the reading-record bridge survived the reader work',
  definedHandlers.has('App.openSaygiReading') &&
  /App\.openSaygiReading=function\(\)\{ App\.openReading\(\); \};/.test(appSource));
check('REQ-022 orphan guard: the guard is not vacuous (it sees the real call graph)',
  calledHandlers.size > 300 && definedHandlers.size > 600);

// ── Ölçek CSS matematiği (bu kartta bulunan gerçek bir kusurun dersi) ──
// İlk uygulama `font-size:calc(1em * var(--saygi-scale))` yazıyordu ve
// `.saygi-article`'ı hedefliyordu. İki hatası vardı:
//  (a) okuyucu modal'ı `.saygi-article-modal` kullanır → ölçek asıl yüzeyde
//      HİÇ uygulanmıyordu;
//  (b) `1em` ebeveyn boyutuna göre çözülür ve özgün tabanı (clamp/.token)
//      ezdiği için varsayılan %100'de bile metin boyutu değişiyordu.
const scaleRule = cssSource.slice(cssSource.indexOf('IIP-11 · Okuyucu etkileşimleri'),
  cssSource.indexOf('/* Sonraki vakit geri sayım */'));
// Her ölçek kuralı modal sarmalayıcıyı KAPSAMALI. `includes(...)` yeterli değil:
// kural iki yerde geçtiği için biri bozulsa bile test geçiyordu (mutasyonla
// görüldü). Bu yüzden ölçek içeren HER kural bloğu ayrı ayrı denetlenir.
const scaleRules = scaleRule.match(/[^{}]*\{[^{}]*var\(--saygi-scale[^{}]*\}/g) || [];
const rulesMissingModal = scaleRules.filter((r) => !/saygi-article-modal/.test(r));
check('REQ-021 every scale rule covers the reader modal wrapper',
  scaleRules.length >= 4 && rulesMissingModal.length === 0,
  'modal içermeyen kural: ' + rulesMissingModal.length);
check('REQ-021 scale CSS covers BOTH article wrappers (modal included)',
  /\.saygi-article,\.saygi-article-modal\{--saygi-scale:1;\}/.test(scaleRule) &&
  /\.saygi-article-modal \.saygi-biography p\{/.test(scaleRule.replace(/\s+/g, ' ')));
check('REQ-021 scale multiplies each block’s REAL base (no 1em trap)',
  /font-size:calc\(clamp\(\.9375rem,1\.8vw,1\.0625rem\) \* var\(--saygi-scale,1\)\)/.test(scaleRule) &&
  /font-size:calc\(var\(--f-callout\) \* var\(--saygi-scale,1\)\)/.test(scaleRule) &&
  /font-size:calc\(var\(--f-footnote\) \* var\(--saygi-scale,1\)\)/.test(scaleRule));
check('REQ-021 scale CSS never uses the parent-relative 1em form',
  !/font-size:calc\(1em \* var\(--saygi-scale/.test(scaleRule));
check('REQ-021 the reading body scales but the hero title does not',
  !/\.saygi-hero h2/.test(scaleRule) && !/\.saygi-description/.test(scaleRule));
check('REQ-021 the narrow-viewport base override keeps the scale applied',
  /@media\(max-width:380px\)\{[\s\S]{0,240}var\(--f-footnote\) \* var\(--saygi-scale,1\)/.test(scaleRule));
// Varsayılan (100%) ölçekte taban boyut DEĞİŞMEMELİ: bu, ölçek öncesi/sonrası
// eşitliğinin sözleşmesidir.
check('REQ-021 at the default step the scale multiplier is exactly 1',
  /--saygi-scale:1;/.test(scaleRule));

console.log(`\nIIP-11 reader interaction contract: ${passed} PASS, ${failed} FAIL`);
if (failed) process.exitCode = 1;
