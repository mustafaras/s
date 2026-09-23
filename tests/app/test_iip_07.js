#!/usr/bin/env node
// IIP-07 — Zikir/Kur'an ortak durum dili ve geçiş koruması.
// No-network/node:vm fixture; gerçek token, localStorage, kişisel veri ve
// uygulama boot'u kullanılmaz. Render çıktısı sentetik sabitlerle üretilir.

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const zikirSource = fs.readFileSync(path.join(root, 'app/core/zikir.js'), 'utf8');
const renderSource = fs.readFileSync(path.join(root, 'app/core/render.js'), 'utf8');
const quranSource = fs.readFileSync(path.join(root, 'app/core/quran.js'), 'utf8');
const cssSource = fs.readFileSync(path.join(root, 'app/styles.css'), 'utf8');

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

const surah = {
  id: 'bakara', nameTr: 'Bakara', nameAr: 'البقرة', revelationOrder: 87,
  mushafOrder: 2, ayahCount: 286, themeTr: 'İman, sorumluluk ve sabır.'
};
const baseRequest = {
  status: 'watching', videoId: 'abcdefghijk', readyAt: '2026-09-20T10:00:00Z',
  notes: [], videoHistory: []
};
const state = {
  quranJourney: { activeSurahId: surah.id, requests: { [surah.id]: baseRequest } }
};
const ui = {
  quranJourneyView: 'detail', quranDetailId: surah.id, quranJourneyOpen: true,
  quranRemoteStatus: 'checking', quranRemoteError: '', quranRefreshing: false,
  quranPlayerLoadedId: surah.id, zikrView: 'counter'
};

const sandbox = {
  console, URL, URLSearchParams, Date, Math, JSON, Object, Array, String,
  Number, Boolean, RegExp, Error, Promise, Set, Map, Intl, encodeURIComponent,
  decodeURIComponent, isNaN, isFinite, document: {},
  window: {}, self: {}, globalThis: {}
};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.globalThis = sandbox;
const context = vm.createContext(sandbox);
vm.runInContext(renderSource, context, { filename: 'app/core/render.js' });
const render = sandbox.SeymaRender;

const depMatch = renderSource.match(/var RENDER_DEPENDENCIES=\[([\s\S]*?)\];/);
const depNames = [...depMatch[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
const deps = Object.fromEntries(depNames.map(name => [name, () => '']));
Object.assign(deps, {
  data: () => state,
  ui: () => ui,
  dark: () => false,
  esc,
  icon: name => '<svg data-icon="' + esc(name) + '"></svg>',
  quranJourneyViewHTML: () => '',
  quranViewBodyHTML: () => '<div class="fixture-library">sentetik kütüphane</div>',
  ensureQuranJourney: () => state.quranJourney,
  quranCatalog: () => ({ methodologyTr: 'Yaygın nüzul tertibi; sentetik fixture.' }),
  quranSurah: id => id === surah.id ? surah : null,
  quranTotal: () => 114,
  quranRequestOf: (_q, id) => state.quranJourney.requests[id] || { status: 'idle', notes: [], videoHistory: [] },
  quranActiveFilter: () => 'all',
  quranActiveVerse: () => null,
  quranCanRequest: () => true,
  quranDetailAction: () => ({ label: 'İzlemeye başla', icon: 'play', action: 'App.quranJourneyWatch(\'bakara\')' }),
  quranQuestionAction: () => ({ label: 'Raşit’e sor', icon: 'message-circle', action: 'App.quranJourneyQuestion(\'bakara\')' }),
  quranEmbedOrigin: () => 'https://example.invalid',
  quranFilterCounts: () => ({ all: 1, idle: 1, waiting: 0, ready: 0, watched: 0 }),
  quranFilterLabel: value => value,
  quranFilteredSurahs: () => [surah],
  quranJourneyCardCopy: () => ({ line: 'Sentetik durum', statusLabel: 'Hazır', ctaLabel: 'Aç', ctaAction: '' }),
  quranJourneyStats: () => ({ total: 114, watched: 0, requested: 1, pct: 0 }),
  quranNoteDraftFor: () => ({ kind: 'watch', timestamp: '', tag: '', text: '' }),
  quranNoteKindMeta: () => ({ icon: 'bookmark', label: 'İzlerken' }),
  quranNoteTimeLabel: value => value ? value + ' sn' : '',
  quranPlaceDisputed: () => false,
  quranPlaceLabel: () => 'Mekkî',
  quranPreviewToneOf: () => 'ready',
  quranRowState: status => ({ tone: status === 'video_unavailable' ? 'warn' : 'ready', label: status }),
  quranSortNotes: notes => Array.isArray(notes) ? notes : [],
  quranStatusNote: status => 'Sentetik ' + status + ' durumu',
  quranVideoThumbUrl: id => 'https://example.invalid/' + id + '.jpg',
  QURAN_VIDEO_ID_RE: () => /^[A-Za-z0-9_-]{11}$/,
  QURAN_DEFAULT_SURAH_ID: () => surah.id,
  QURAN_FILTERS: () => [['all', 'Tümü']],
  zikrActivePreset: () => ({ id: 'fixture', name: 'Sentetik zikir' }),
  zikrViewBodyHTML: () => '<section class="zikr-v2-counter"><button id="zikr-tap-button" onclick="App.zikrTap()">Say</button><button id="zikr-undo-button" onclick="App.zikrUndo()">Geri al</button></section>',
  ensureZikrRoot: () => ({ settings: { reducedMotion: false } })
});

check('IIP-07 render registry boots with a dependency bag', render && render.registerRender(deps) === true);
check('IIP-07 second render registration is rejected', render.registerRender(deps) === false);

const overlay = render.quranJourneyOverlayHTML();
check('REQ-014 positive: Quran header/title/refresh/close share the common surface classes',
  overlay.includes('quran-v2-header iip-07-header') && overlay.includes('iip-07-title') &&
  overlay.includes('quran-refresh-button') && overlay.includes('iip-07-button') &&
  overlay.includes('App.closeQuranJourney()'));
check('REQ-014 loading: remote checking status remains a live common state',
  overlay.includes('quran-v2-remote-status iip-07-state iip-07-state-remote is-checking') &&
  overlay.includes('Kontrol ediliyor'));

ui.quranRemoteStatus = 'error';
ui.quranRemoteError = 'Sentetik uzak kayıt hatası';
const remoteError = render.quranRemoteStatusHTML();
check('REQ-014 negative: remote error remains visible and escaped in the status surface',
  remoteError.includes('is-error') && remoteError.includes('Kontrol başarısız') &&
  remoteError.includes(esc(ui.quranRemoteError)));

state.quranJourney.requests[surah.id] = Object.assign({}, baseRequest, { status: 'watching', notes: [] });
ui.quranPlayerLoadedId = surah.id;
const watching = render.quranDetailViewHTML(surah.id);
check('REQ-014 positive: loaded video keeps stable frame/player/fallback nodes and actions',
  watching.includes('id="quran-video-frame"') && watching.includes('id="quran-yt-player"') &&
  watching.includes('id="quran-watched-fallback"') && watching.includes('App.quranMarkWatched') &&
  watching.includes('quran-v2-note-save iip-07-button'));
check('REQ-014 positive: video notes keep their stable host and field handlers',
  watching.includes('id="quran-video-notes"') && watching.includes('App.quranNoteField') &&
  watching.includes('App.quranAddNote'));

state.quranJourney.requests[surah.id] = { status: 'idle', notes: [], videoHistory: [] };
ui.quranPlayerLoadedId = '';
const locked = render.quranDetailViewHTML(surah.id);
check('REQ-014 empty/locked: missing video explains why notes are unavailable',
  locked.includes('quran-v2-notes-lock iip-07-state') && locked.includes('Video hazır olduğunda not yazma açılır') &&
  locked.includes('quran-v2-notes-empty iip-07-state iip-07-state-empty') &&
  locked.includes('disabled aria-disabled="true"'));

state.quranJourney.requests[surah.id] = { status: 'video_unavailable', notes: [], videoHistory: [] };
const unavailable = render.quranDetailViewHTML(surah.id);
check('REQ-014 error: unavailable video is an explanatory state without a fake iframe',
  unavailable.includes('quran-v2-video is-unavailable iip-07-state iip-07-state-error') &&
  unavailable.includes('Bu anlatım artık erişilebilir değil') && !unavailable.includes('quran-yt-player'));
check('REQ-014 return: detail view keeps the library return action',
  unavailable.includes('quran-v2-back-link iip-07-button') && unavailable.includes('App.backToQuranLibrary()'));

check('REQ-013 positive: advanced counter entry points remain intact',
  zikirSource.includes('id="zikr-tap-button"') && zikirSource.includes('id="zikr-undo-button"') &&
  zikirSource.includes('id="zikr-manual-button"') && zikirSource.includes('id="zikr-note-host"'));
check('REQ-013 positive: counter/manual/undo/note handlers remain intact',
  zikirSource.includes('App.zikrTap') && zikirSource.includes('App.zikrUndo') &&
  zikirSource.includes('App.saveZikrManual') && zikirSource.includes('App.saveZikrNote') &&
  zikirSource.includes('class="iip-07-button" onclick="App.saveZikrNote()"') &&
  zikirSource.includes('class="primary iip-07-button" onclick="App.saveZikrManual()"'));
check('REQ-013 negative: common empty state covers history and hatim without removing return actions',
  zikirSource.includes('zikr-v2-empty iip-07-state iip-07-state-empty') &&
  zikirSource.includes('class="iip-07-button" onclick="App.setZikrView'));
check('REQ-013 return: zikir shell keeps close, tabs, and view transition handlers',
  renderSource.includes('class="zikr-v2-header iip-07-header') &&
  renderSource.includes('App.closeZikr()') && renderSource.includes('App.setZikrView'));

const watchedStart = quranSource.indexOf('function quranPaintWatchedState');
const watchedEnd = quranSource.indexOf('function quranPaintNotes', watchedStart);
const watchedPaint = quranSource.slice(watchedStart, watchedEnd);
const markStart = quranSource.indexOf('function App_quranMarkWatched');
const markEnd = quranSource.indexOf('\n};', markStart);
const markWatched = quranSource.slice(markStart, markEnd);
check('REQ-014 negative: watched repaint targets status/action only',
  watchedStart >= 0 && watchedPaint.includes("getElementById('quran-detail-status')") &&
  watchedPaint.includes("getElementById('quran-detail-action-region')") &&
  !watchedPaint.includes('quranPaintDetail()'));
check('REQ-014 negative: note repaint targets the stable notes host only',
  quranSource.includes("function quranPaintNotes(sid)") &&
  quranSource.includes("getElementById('quran-video-notes')") &&
  quranSource.includes('quranVideoNotesInnerHTML(x,req)'));
check('REQ-014 negative: mark-watched avoids rebuilding a loaded player',
  markWatched.includes('quranPlayerLoadedId===sid&&quranPaintWatchedState(sid)') &&
  markWatched.includes('quranPaintDetail()'));

check('shared visual grammar: title, button, source and state classes are explicit',
  cssSource.includes('.iip-07-title') && cssSource.includes('.iip-07-button') &&
  cssSource.includes('.iip-07-source') && cssSource.includes('.iip-07-state'));
check('shared visual grammar: empty/error/remote states have distinct wrap-safe treatment',
  cssSource.includes('.iip-07-state-empty') && cssSource.includes('.iip-07-state-error') &&
  cssSource.includes('.iip-07-state-remote') && cssSource.includes('overflow-wrap:anywhere'));
check('responsive/reduced-motion contract remains explicit',
  cssSource.includes('@media(max-width:389px)') && cssSource.includes('@media(prefers-reduced-motion:reduce)'));
check('scope contract: IIP-07 production sources do not add migration/storage/network writes',
  !/localStorage|migrate\s*\(|fetch\s*\(|XMLHttpRequest/.test(zikirSource) &&
  !/localStorage|migrate\s*\(|fetch\s*\(|XMLHttpRequest/.test(renderSource));

function visualArtifact() {
  const quranReady = watching;
  const quranEmpty = locked;
  const zikir = '<section class="zikr-v2-screen"><header class="zikr-v2-header iip-07-header"><div class="brand iip-07-title"><strong>Zikirmatik</strong><small>Kalıcı, odaklı ve sana ait</small></div><button class="close iip-07-button">Kapat</button></header><div class="iip-07-state iip-07-state-empty"><strong>Henüz tefekkür kaydı yok.</strong><span>İlk notunu yazdığında burada arşivlenecek.</span></div></section>';
  return '<!doctype html><meta charset="utf-8"><title>IIP-07 synthetic render</title><link rel="stylesheet" href="../../app/styles.css"><style>body{margin:0;padding:16px;background:#f7f4ef;color:#29231f;font:16px system-ui}body>main{display:grid;gap:16px;max-width:460px;margin:auto}.fixture{padding:16px;border:1px solid #d8cec0;border-radius:24px;background:#fff}.fixture h2{margin:0 0 8px;font-size:14px}</style><main><section class="fixture"><h2>Açık tema · ortak durum/kaynak dili</h2>'+zikir+quranReady+'</section><section class="fixture" data-theme="dark" style="background:#1d2225;color:#f1eee6"><h2>Koyu tema · boş/kilitli dönüş</h2>'+quranEmpty+'</section></main>';
}

const artifactFlag = process.argv.indexOf('--write-artifact');
if (artifactFlag >= 0 && process.argv[artifactFlag + 1]) {
  const artifactPath = path.resolve(process.cwd(), process.argv[artifactFlag + 1]);
  fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
  fs.writeFileSync(artifactPath, visualArtifact() + '\n', 'utf8');
  console.log('ARTIFACT ' + path.relative(root, artifactPath));
}

console.log(`\nIIP-07 zikir/quran transition contract: ${passed} PASS, ${failed} FAIL`);
if (failed) process.exitCode = 1;
