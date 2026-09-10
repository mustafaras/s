'use strict';

// MON-28 · Günlük Işığı / terapi notu registry sınırı.
// Metin/count/streak görünümünü ve app-owned save sırasını ağsız node:vm'de
// doğrular; browser, storage ve gerçek veri yoktur.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const journalSource = fs.readFileSync('app/core/journal.js', 'utf8');
const appSource = fs.readFileSync('app.js', 'utf8');
const healthSource = fs.readFileSync('app/core/health.js', 'utf8');
const indexSource = fs.readFileSync('index.html', 'utf8');
const driverSource = fs.readFileSync('.claude/skills/run-seyma/driver.mjs', 'utf8');
const zikrSource = fs.readFileSync('.claude/skills/run-seyma/zikr-harness.mjs', 'utf8');
const rebindSource = fs.readFileSync('tests/app/test_state_rebind_boundary.js', 'utf8');

function ok(name, condition) {
  assert.equal(condition, true, name);
  console.log('PASS  ' + name);
}

console.log('== MON-28 Günlük Işığı registry sınırı ==\n');

const coldSandbox = { window: {} };
vm.runInNewContext(journalSource, coldSandbox, { filename: 'app/core/journal.js#cold' });
const cold = coldSandbox.window.SeymaJournal;
ok('yüklemede SeymaJournal registry expose edilir', !!cold && typeof cold.registerJournal === 'function');
ok('yükleme storage/DOM/timer/ağ çağrısı açmaz', Object.keys(coldSandbox.window).length === 1);
ok('registry dependency listesi tam ve dar',
  JSON.stringify(cold.JOURNAL_DEPENDENCIES) === JSON.stringify([
    'data', 'ui', 'activeDate', 'dayIndexFor', 'todayStr', 'addDays',
    'icon', 'esc', 'find', 'motivationProgram'
  ]));

const data = {
  settings: { journalGoal: { words: 5, chars: 24 } },
  days: {
    '2026-09-09': { note: '', journal: { text: 'Bugün kendimi izledim', wordCount: 4, charCount: 21, savedAt: '2026-09-09T10:00:00.000Z' } },
    '2026-09-08': { note: 'Dün kısa bir not aldım', journal: { text: '', savedAt: '' } },
    '2026-09-07': { note: '', journal: { text: 'Bir başka gün', savedAt: '2026-09-07T10:00:00.000Z' } },
    '2026-09-06': { note: '', journal: { text: '', savedAt: '' } }
  }
};
const ui = {
  journalOpen: true,
  journalMode: 'affect',
  journalText: 'Bir iki üç dört',
  journalPromptUsed: 'Bugünün içindeki duyguyu adlandır.',
};
const calls = Object.create(null);
function dep(name, value) {
  return function () {
    calls[name] = (calls[name] || 0) + 1;
    return typeof value === 'function' ? value.apply(null, arguments) : value;
  };
}
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function addDays(date, amount) {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + amount);
  return d.toISOString().slice(0, 10);
}
const deps = {
  data: dep('data', data), ui: dep('ui', ui),
  activeDate: dep('activeDate', '2026-09-09'),
  dayIndexFor: dep('dayIndexFor', 3), todayStr: dep('todayStr', '2026-09-09'),
  addDays: dep('addDays', addDays),
  icon: dep('icon', (name, size) => '<i data-icon="' + name + '" data-size="' + (size || 20) + '"></i>'),
  esc: dep('esc', escapeHtml),
  find: dep('find', (items, key, value) => (items || []).find((item) => item[key] === value) || null),
  motivationProgram: dep('motivationProgram', null),
};

ok('eksik dependency bag reddedilir', !cold.registerJournal({ data: deps.data }));
ok('tam dependency bag bir kez bağlanır', cold.registerJournal(deps));
ok('registry ikinci kez bağlanmayı reddeder', !cold.registerJournal(deps));
const registry = cold;

ok('sekiz günlük modu ve dört program fazı korunur',
  registry.journalModes().length === 8 &&
  JSON.stringify(Object.keys(registry.journalPhasePrompts())) === JSON.stringify(['F1', 'F2', 'F3', 'F4']));
ok('journalStreak note veya journal.text üzerinden ardışık sayar', registry.journalStreak() === 3);
ok('journalStreak canlı data resolver çağırır', (calls.data || 0) > 0 && (calls.todayStr || 0) > 0);

const beforeState = JSON.stringify({ data, ui });
const light = registry.journalLightCardHTML(data.days['2026-09-09'], registry.journalStreak());
ok('kaydedilmiş Günlük Işığı kartı text/count/savedAt kopyasını taşır',
  light.includes('Bugünün ışığı parlıyor') && light.includes('4 kelime') &&
  light.includes('App.openJournalModal()') && light.includes('sgl-journal-card'));
const emptyLight = registry.journalLightCardHTML({ journal: { text: '', savedAt: '' } }, 2);
ok('boş Günlük Işığı kartı streak ve açılış handlerını taşır',
  emptyLight.includes('2 günlük seri · yazmak seriyi korur') && emptyLight.includes('App.openJournalModal()'));

const modal = registry.journalModalHTML();
ok('journal modal gerçek dialog/focus semantiği taşır',
  modal.includes('id="sey-journal-dialog" role="dialog"') &&
  modal.includes('aria-modal="true"') && modal.includes('tabindex="-1"') &&
  modal.includes('App.onModalKeydown(event,App.closeJournalModal)'));
ok('modal text/count/goal/streak görünümünü korur',
  modal.includes('4 kelime · 15 karakter') && modal.includes('Hedef: 5 kelime veya 24 karakter') &&
  modal.includes('3 günlük seri') && modal.includes('Gün 3'));
ok('modal mode/prompt/save/close handlerlarını korur',
  modal.includes('App.setJournalMode(') && modal.includes('App.useJournalPrompt()') &&
  modal.includes('App.onJournalText(this)') && modal.includes('App.closeJournalModal()') &&
  modal.includes('App.saveJournal()'));
ok('modal textarea ve journal copy korunur',
  modal.includes('id="sey-journal-text"') &&
  modal.includes('Bir satır bile yeter, Sevgili Günışığı.') &&
  modal.includes('Bilimsel ipucu:'));

const afterState = JSON.stringify({ data, ui });
ok('registry HTML/streak üreticileri state yazmaz', beforeState === afterState);
ok('registryde DOM/storage/timer/ağ yan etkisi yok',
  !/\b(?:document|localStorage|setTimeout|setInterval|fetch)\b/.test(journalSource));
ok('registryde mutation/save/render çağrısı yok',
  !/\b(?:save|commit|render)\s*\(/.test(journalSource));
ok('registryde data/ui alan yazımı yok',
  !/\b(?:data|ui)\.[A-Za-z0-9_]+\s*=/.test(journalSource));

const journalHandlers = [
  'openJournalModal', 'closeJournalModal', 'setJournalMode', 'onJournalText',
  'useJournalPrompt', 'saveJournal'
];
journalHandlers.forEach((name) => ok('App.' + name + ' handlerı app kabuğunda',
  new RegExp('App\\.' + name + '=function').test(appSource)));
ok('journal save gövdesi app.jste kalır',
  /App\.saveJournal=function[\s\S]*?j\.text=text[\s\S]*?j\.savedAt=[\s\S]*?save\(false,[\s\S]*?render\(\)/.test(appSource));
const saveStart = appSource.indexOf('App.saveJournal=function');
const saveEnd = appSource.indexOf('\n\n// ── Tatil Modu', saveStart);
const saveBody = appSource.slice(saveStart, saveEnd);
const saveOrder = ['j.text=text', 'j.wordCount=words', 'j.streakAtSave=journalStreak()', 'j.savedAt=', 'syncDerivedHabits(day)', 'save(false,', 'updateCardByKey(\'reflection\')', 'updateCardByKey(\'habits\')', 'ui.journalOpen=false', 'render()'];
ok('journal save sırası text/count/streak/savedAt → derived → save → UI olarak korunur',
  saveEnd > saveStart && saveOrder.every((token, i, list) => i === 0 || saveBody.indexOf(token) > saveBody.indexOf(list[i - 1])));
ok('journal görünümleri registry shiminden çağrılır',
  /function journalLightCardHTML\(\)\{ return window\.SeymaJournal\.journalLightCardHTML/.test(appSource) &&
  /function journalModalHTML\(\)\{ return window\.SeymaJournal\.journalModalHTML/.test(appSource) &&
  /function journalStreak\(\)\{ return window\.SeymaJournal\.journalStreak/.test(appSource));
ok('eski journal katalog/helper gövdeleri app.jste yeniden sahiplenilmez',
  !/var JOURNAL_MODES=/.test(appSource) && !/var JOURNAL_PHASE_PROMPTS=/.test(appSource));

const indexOrder = ['app/core/motivation.js', 'app/core/crisis.js', 'app/core/journal.js', 'app/core/health.js', 'app/core/library.js', 'app/core/report.js', 'app/core/map.js', 'app/core/mediaFx.js'];
const positions = indexOrder.map((file) => indexSource.indexOf('src="' + file));
ok('index cache-bust ve motivation→crisis→journal→health→library→report→map→mediaFx sırası korunur',
  positions.every((position) => position >= 0) && positions.every((position, i) => i === 0 || positions[i - 1] < position) &&
  indexSource.includes('app/core/journal.js?v=20260909a') && indexSource.includes('app/core/health.js?v=20260910a') && indexSource.includes('app/core/library.js?v=20260910a') && indexSource.includes('app/core/report.js?v=20260910a') && indexSource.includes('app/core/map.js?v=20260910a'));
ok('driver/zikr/state-rebind FILES zincirinde journal, health ve map vardır',
  driverSource.includes("'app/core/journal.js'") && zikrSource.includes("'app/core/journal.js'") &&
  rebindSource.includes("'app/core/journal.js'") && driverSource.includes("'app/core/health.js'") &&
  zikrSource.includes("'app/core/health.js'") && rebindSource.includes("'app/core/health.js'") && driverSource.includes("'app/core/library.js'") && zikrSource.includes("'app/core/library.js'") && rebindSource.includes("'app/core/library.js'") && driverSource.includes("'app/core/report.js'") && zikrSource.includes("'app/core/report.js'") && rebindSource.includes("'app/core/report.js'") && driverSource.includes("'app/core/map.js'") && zikrSource.includes("'app/core/map.js'") && rebindSource.includes("'app/core/map.js'"));
ok('app boot registerJournal ve journal registry expose vardır',
  appSource.includes('registerJournal') && appSource.includes('window.SeymaJournal'));
ok('health registry app boot kaydı vardır',
  healthSource.includes('window.SeymaHealth') && appSource.includes('registerHealth') && appSource.includes('window.SeymaHealth'));

console.log('\nDone.');
