'use strict';

// MON-27 · Kriz odası / craving domain registry sınırı.
// Güvenlik-kritik kopyayı, salt görünüm üreticilerini ve app-owned handler
// kabuğunu ağsız node:vm içinde doğrular; browser, storage ve gerçek veri yoktur.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const crisisSource = fs.readFileSync('app/core/crisis.js', 'utf8');
const appSource = fs.readFileSync('app.js', 'utf8');

function ok(name, condition) {
  assert.equal(condition, true, name);
  console.log('PASS  ' + name);
}

console.log('== MON-27 Kriz domain registry sınırı ==\n');

const coldSandbox = { window: {} };
vm.runInNewContext(crisisSource, coldSandbox, { filename: 'app/core/crisis.js#cold' });
const cold = coldSandbox.window.SeymaCrisis;
ok('yüklemede SeymaCrisis registry expose edilir', !!cold && typeof cold.registerCrisis === 'function');
ok('yükleme storage/DOM/timer/ağ çağrısı açmaz', Object.keys(coldSandbox.window).length === 1);
ok('registry dependency listesi tam ve dar',
  JSON.stringify(cold.CRISIS_DEPENDENCIES) === JSON.stringify([
    'data', 'ui', 'dark', 'todayStr', 'isVacationDay', 'icon', 'esc', 'find', 'pad'
  ]));

const ui = {
  crisisKind: 'sweet', crisisOpts: [], crisisTriggers: [], crisisNote: '',
  crisisDone: false, crisisTrigOpen: false, crisisTriedOpen: false,
};
const data = { days: { '2026-09-09': { craving10MinDone: true, foodCravingDone: false, coffeeCravingDone: false } } };
const beforeState = JSON.stringify({ data, ui });
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
const deps = {
  data: dep('data', data), ui: dep('ui', ui), dark: dep('dark', false),
  todayStr: dep('todayStr', '2026-09-09'), isVacationDay: dep('isVacationDay', false),
  icon: dep('icon', (name, size) => '<i data-icon="' + name + '" data-size="' + (size || 20) + '"></i>'),
  esc: dep('esc', escapeHtml),
  find: dep('find', (items, key, value) => (items || []).find((item) => item[key] === value) || null),
  pad: dep('pad', (value) => String(value).padStart(2, '0')),
};
ok('eksik dependency bag reddedilir', !cold.registerCrisis({ data: deps.data }));
ok('tam dependency bag bir kez bağlanır', cold.registerCrisis(deps));
ok('registry ikinci kez bağlanmayı reddeder', !cold.registerCrisis(deps));

const registry = cold;
ok('üç kriz anahtarı ve sırası korunur',
  JSON.stringify(Object.keys(registry.crises())) === JSON.stringify(['sweet', 'food', 'coffee']) &&
  JSON.stringify(registry.crisisOrder()) === JSON.stringify(['sweet', 'food', 'coffee']));
ok('bilinmeyen kriz güvenle yok döner', registry.crisisFor('unknown') === null);
ok('üç kriz katalog kaydı seçenek ve tetikleyicilerini taşır',
  Object.keys(registry.crises()).every((key) => registry.crises()[key].opts.length > 0 && registry.crises()[key].triggers.length > 0));

const criticalCopy = [
  'Panik yok Şeyma — tatlı geldi diye tahtın sarsılmaz.',
  'HALT',
  'Kahve iyidir Şeyma, ama saat kaç? Uykunla pazarlık etmeyelim.',
  'Kafein ~5-6 saat kalıcıdır;',
  'Duyguyu adlandırmak amigdala aktivitesini azaltır, prefrontal korteksi güçlendirir.',
];
const catalogText = JSON.stringify(registry.crises());
const safetyText = catalogText + '\n' + crisisSource;
criticalCopy.forEach((text) => ok('güvenlik kopyası korunur: ' + text.slice(0, 28), safetyText.includes(text)));

const tiles = registry.rasitActionsHTML();
ok('kriz tile görünümü üç SOS handler çağrısını korur',
  tiles.includes("App.openCrisis('sweet')") && tiles.includes("App.openCrisis('food')") && tiles.includes("App.openCrisis('coffee')"));
ok('kriz tile görünümü tamamlanma rozetini korur', tiles.includes('Tatlı') && tiles.includes('yönetildi ✓'));

for (const kind of ['sweet', 'food', 'coffee']) {
  ui.crisisKind = kind;
  ui.crisisOpts = [];
  ui.crisisTriggers = [];
  ui.crisisNote = '';
  ui.crisisDone = false;
  ui.crisisTrigOpen = false;
  ui.crisisTriedOpen = false;
  const C = registry.crisisFor(kind);
  const html = registry.crisisModalHTML();
  ok(kind + ' modal dialog/focus semantiği korunur',
    html.includes('id="sey-crisis-card" role="dialog"') &&
    html.includes('aria-modal="true"') && html.includes('tabindex="-1"') &&
    html.includes('App.onModalKeydown(event,App.closeCrisis)'));
  ok(kind + ' modal güvenlik kopyasını ve bütün seçimleri taşır',
    html.includes(escapeHtml(C.hero)) && html.includes(C.sciTitle) &&
    C.opts.every((item) => html.includes(escapeHtml(item.label))) &&
    C.triggers.every((item) => html.includes(escapeHtml(item.label))));
  ok(kind + ' modal handler görünürlüğü korunur',
    html.includes('App.closeCrisis()') && html.includes('App.onCrisisNote(this)') &&
    html.includes('App.toggleCrisisTrigger(') && html.includes('App.toggleCrisisOpt(') &&
    html.includes('App.completeCrisis()'));
}

ui.crisisKind = 'sweet';
ui.crisisOpts = [];
ui.crisisTriggers = [];
ui.crisisNote = '';
ui.crisisDone = false;
ui.crisisTrigOpen = false;
ui.crisisTriedOpen = false;
const afterState = JSON.stringify({ data, ui });
ok('registry HTML üreticileri state yazmaz', beforeState === afterState);
ok('registryde save/commit/render/fetch çağrısı yok',
  !/\b(?:save|commit|render|fetch)\s*\(/.test(crisisSource));
ok('registryde data/ui alan yazımı yok',
  !/\b(?:data|ui)\.[A-Za-z0-9_]+\s*=/.test(crisisSource));

const crisisHandlers = [
  'openCrisis', 'closeCrisis', 'toggleCrisisDropdown', 'toggleCrisisOpt',
  'toggleCrisisTrigger', 'onCrisisNote', 'completeCrisis', 'resetCrisis',
];
crisisHandlers.forEach((name) => ok('App.' + name + ' handlerı app kabuğunda',
  new RegExp('App\\.' + name + '=function').test(appSource)));
ok('openCrisis mutation kabuğu app.jste kalır',
  /App\.openCrisis=function[\s\S]*?getDay\(data[\s\S]*?save\(\)/.test(appSource));
ok('completeCrisis mutation kabuğu app.jste kalır',
  /App\.completeCrisis=function[\s\S]*?syncDerivedHabits\(day\)[\s\S]*?save\(\)/.test(appSource));
ok('app.js kriz HTML çağrıları registry shiminden geçer',
  /function rasitActionsHTML\(\)\{ return window\.SeymaCrisis\.rasitActionsHTML/.test(appSource) &&
  /function crisisModalHTML\(\)\{ return window\.SeymaCrisis\.crisisModalHTML/.test(appSource));
ok('SeymaCrisis app boot kaydı ve load-order referansı vardır',
  appSource.includes('registerCrisis') && fs.readFileSync('index.html', 'utf8').includes('app/core/crisis.js'));

console.log('\nDone.');
