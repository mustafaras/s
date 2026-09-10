// MON-33 · SeymaLibrary registry, hub/archive identity and modal parity.
// Network, browser, localStorage and sync.js are intentionally absent.

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const librarySource = fs.readFileSync(path.join(repoRoot, 'app/core/library.js'), 'utf8');
const appSource = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');

function ok(name, condition) {
  assert.equal(condition, true, name);
  console.log('PASS  ' + name);
}

console.log('== MON-33 SeymaLibrary registry sınırı ==\n');

const coldSandbox = { window: {} };
vm.runInNewContext(librarySource, coldSandbox, { filename: 'app/core/library.js#cold' });
const cold = coldSandbox.window.SeymaLibrary;
ok('yüklemede SeymaLibrary registry expose edilir', !!cold && typeof cold.registerLibrary === 'function');
ok('yükleme storage/DOM/timer/ağ çağrısı açmaz', Object.keys(coldSandbox.window).length === 1);
ok('registry app-owned archive sync/backfill gövdelerini taşımaz',
  !/syncEntryTo|backfillArchivesFromDays|SeySync|localStorage|fetch\s*\(/.test(librarySource));
ok('registry dependency listesi data/ui ve resolver sınırını açıkça taşır',
  cold.LIBRARY_DEPENDENCIES.includes('data') && cold.LIBRARY_DEPENDENCIES.includes('ui') &&
  cold.LIBRARY_DEPENDENCIES.includes('ensureLibrary') && cold.LIBRARY_DEPENDENCIES.includes('fmtDur'));

const data = {
  days: {
    '2026-09-10': {
      reading: { entries: [{ id: 'read-entry-1', title: 'Kimlik Kitabı', author: 'Yazar', pages: 4, minutes: 6, bookId: 'book-identity', note: 'kısa not' }] },
      watching: { entries: [{ id: 'watch-entry-1', title: 'Kimlik Dizisi', kind: 'dizi', episodes: 1, minutes: 30, itemId: 'title-identity' }] },
      listening: { entries: [{ id: 'listen-entry-1', title: 'Kimlik Şarkısı', kind: 'sarki', minutes: 10, itemId: 'track-identity' }] },
      learning: { entries: [{ id: 'learn-entry-1', title: 'Kimlik dersi', ts: '2026-09-10T08:00:00.000Z' }] },
      soulActivities: [{ id: 'soul-entry-1', type: 'pilates', duration: 20, note: 'denge' }],
    },
  },
  library: { books: [{ id: 'book-identity', title: 'Kimlik Kitabı', author: 'Yazar', genre: 'Roman', status: 'reading', currentPage: 12, totalPages: 120, quotes: [] }], goal: { dailyPages: 20, yearlyBooks: 12 } },
  watchlist: { items: [{ id: 'title-identity', title: 'Kimlik Dizisi', kind: 'dizi', genre: 'Dram', status: 'watching', watchedEp: 2, totalEp: 8, quotes: [] }], goal: { dailyMinutes: 40, yearlyTitles: 12 } },
  music: { items: [{ id: 'track-identity', title: 'Kimlik Şarkısı', artist: 'Sanatçı', kind: 'sarki', quotes: [] }], goal: { dailyMinutes: 30, yearlyTitles: 12 } },
  soulArchive: { items: [{ id: 'archive-item-identity', type: 'pilates', label: 'Pilates', icon: 'activity', sci: 'beden farkındalığı', totalSessions: 1, totalMinutes: 20, lastAt: '2026-09-10T08:00:00.000Z' }] },
};
const ui = {
  readingView: 'today', watchView: 'today', listeningView: 'today',
  readingDraft: {}, watchDraft: {}, listeningDraft: {}, learningDraft: {}, soulActivityDraft: {},
  bookEdit: null, quoteDraft: null, titleEdit: null, replicaDraft: null,
  trackEdit: null, lyricDraft: null, soulArchiveFilter: null,
};

function addDays(date, amount) {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + amount);
  return d.toISOString().slice(0, 10);
}
function find(items, idKey, id) { return (items || []).find((item) => item && item[idKey] === id) || null; }
function icon(name, size) { return '<i data-icon="' + name + '" data-size="' + (size || 20) + '"></i>'; }
function esc(value) { return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function dateFmt(value) { return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10); }
function pickBook(id) { return find(data.library.books, 'id', id); }
function pickTitle(id) { return find(data.watchlist.items, 'id', id); }
function pickTrack(id) { return find(data.music.items, 'id', id); }
function pickSoul(type) { return find(data.soulArchive.items, 'type', type); }
const deps = {
  data: () => data, ui: () => ui, getDay: (root, date) => root.days[date], todayStr: () => '2026-09-10', addDays,
  dayIndexFor: () => 0, shortDate: (date) => String(date).slice(5), fmt: dateFmt,
  icon, esc, segTabs: (defs, active) => '<nav data-tabs="' + active + '">' + defs.map((item) => item[0]).join('|') + '</nav>',
  progBar: (pct) => '<progress value="' + pct + '"></progress>', starRow: () => '<span>stars</span>',
  miniBars: () => '<div>bars</div>', statTile: (label, value) => '<div>' + label + ':' + value + '</div>',
  ensureLibrary: () => data.library, ensureWatchlist: () => data.watchlist, ensureMusic: () => data.music, ensureSoulArchive: () => data.soulArchive,
  findBook: pickBook, findTitle: pickTitle, findTrack: pickTrack, findSoulItem: pickSoul,
  soulActivityById: (id) => ({ pilates: { id: 'pilates', label: 'Pilates', icon: 'activity', sci: 'beden farkındalığı', blurb: 'denge' }, ney: { id: 'ney', label: 'Ney', icon: 'music', sci: 'nefes', blurb: 'ritim' } }[id] || null),
  soulCatalog: () => [{ id: 'pilates', label: 'Pilates', icon: 'activity', sci: 'beden farkındalığı', blurb: 'denge' }, { id: 'ney', label: 'Ney', icon: 'music', sci: 'nefes', blurb: 'ritim' }],
  bookGenres: () => ['Roman'], titleGenres: () => ['Dram'],
  listenKinds: () => [['sarki', 'Şarkı'], ['album', 'Albüm'], ['podcast', 'Podcast']],
  fmtDur: (minutes) => String(Math.round(Number(minutes) || 0)) + ' dk', saygiSafeUrl: (url) => url || '', wxHm: () => '08:00', ucfirst: (value) => String(value || '').charAt(0).toUpperCase() + String(value || '').slice(1),
};

ok('eksik dependency bag reddedilir', cold.registerLibrary({ data: deps.data }) === false);
ok('tam dependency bag bir kez kaydedilir', cold.registerLibrary(deps) === true);
ok('registry ikinci kayıtla yeniden bağlanmaz', cold.registerLibrary(deps) === false);

const before = JSON.stringify(data);
function modalParity(name, html, markers) {
  ok(name + ' dialog/focus semantiği taşır', /role="dialog"/.test(html) && /aria-modal="true"/.test(html) && /tabindex="-1"/.test(html));
  ok(name + ' ortak modal keydown handlerını taşır', html.includes('App.onModalKeydown(event,'));
  markers.forEach((marker) => ok(name + ' kimlik korunur: ' + marker, html.includes(marker)));
}

ui.readingView = 'today';
modalParity('okuma bugün', cold.readingOverlayHTML(), ['read-entry-1', 'App.removeReading']);
ui.readingView = 'library';
modalParity('okuma arşiv', cold.readingOverlayHTML(), ['book-identity', 'App.openBookEdit']);
ui.watchView = 'today';
modalParity('izleme bugün', cold.watchOverlayHTML(), ['watch-entry-1', 'App.removeWatching']);
ui.watchView = 'archive';
modalParity('izleme arşiv', cold.watchOverlayHTML(), ['title-identity', 'App.openTitleEdit']);
ui.listeningView = 'today';
modalParity('dinleme bugün', cold.listeningOverlayHTML(), ['listen-entry-1', 'App.removeListening']);
ui.listeningView = 'favs';
modalParity('dinleme arşiv', cold.listeningOverlayHTML(), ['track-identity', 'App.openTrackEdit']);
modalParity('öğrenme hub', cold.learningOverlayHTML(), ['learn-entry-1', 'App.removeLearning']);
modalParity('soul pratik', cold.soulActivityOverlayHTML(), ['App.saveSoulActivity']);
ui.soulArchiveFilter = 'pilates';
modalParity('soul arşiv', cold.soulArchiveOverlayHTML(), ['soul-entry-1', 'App.removeSoulArchiveSession']);

ok('beş hub read-only çağrıları state mutasyonu yapmaz', JSON.stringify(data) === before);
ok('entry/archive identity alanları app-owned kaynakta durur',
  /function syncEntryToLibrary/.test(appSource) && /function syncEntryToWatchlist/.test(appSource) &&
  /function syncEntryToMusic/.test(appSource) && /function syncEntryToSoulArchive/.test(appSource) &&
  /archiveId=x\.id/.test(appSource));
ok('beş hub App-owned mutation surface korunur',
  ['App.addReading', 'App.addWatching', 'App.addListening', 'App.addLearning', 'App.saveSoulActivity'].every((name) => appSource.includes(name)));

console.log('\nDone.');
