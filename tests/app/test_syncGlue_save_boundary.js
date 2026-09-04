// MON-17 · syncGlue save gövdesi sınırı.
// Yalnız sentetik resolver-bag ile çalışır; gerçek localStorage, ağ, timer,
// app.js bootu veya sync.js yüklemesi yoktur.
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');
const source = fs.readFileSync(path.join(repoRoot, 'app/core/syncGlue.js'), 'utf8');

let passed = 0;
function ok(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  passed += 1;
  console.log(`PASS ${message}`);
}

let currentData = {
  marker: 'normal',
  days: { '2026-09-04': { habits: { prayer: 1 } } },
  syncReceipt: { status: 'accepted' }
};
let currentUi = { saveState: 'clean' };
let storageWrites = [];
let order = [];
let syncObject = null;
let sideEffects = 0;

const sandbox = {
  Date,
  JSON,
  Object,
  Array,
  String,
  Number,
  Boolean,
  Error,
  console,
  fetch() { sideEffects += 1; },
  setTimeout() { sideEffects += 1; },
  localStorage: { setItem() { sideEffects += 1; } }
};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.globalThis = sandbox;
const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'app/core/syncGlue.js' });

ok(typeof sandbox.SeymaSave === 'object', 'registry load-safe object olarak açılır');
ok(typeof sandbox.SeymaSave.registerSave === 'function', 'registerSave dışa açıktır');
ok(sandbox.SeymaSave.save === undefined, 'kayıt öncesi save undefined kalır');
ok(sandbox.SeymaSave.registerSave({}) === false, 'eksik resolver bag reddedilir');
ok(sideEffects === 0, 'registry yüklemesi DOM/storage/ağ/timer çalıştırmaz');

const deps = {
  data: () => currentData,
  ui: () => currentUi,
  activeDate() { order.push('activeDate'); return '2026-09-04'; },
  syncDerivedHabits(day, date) { order.push(`syncDerivedHabits:${date}`); day.habits.derived = true; },
  normalizeSyncReceipt(receipt) { order.push('normalizeSyncReceipt'); return receipt || { status: 'idle' }; },
  appendEvent(data, message, meta) { order.push('appendEvent'); data.event = { message, meta }; },
  mergePersistedReminderState() { order.push('mergePersistedReminderState'); },
  reminderSyncPayload(data) { order.push('reminderSyncPayload'); return { marker: data.marker }; },
  updateHeaderSave() { order.push('updateHeaderSave'); },
  storage() {
    order.push('storage');
    return { setItem(key, value) { order.push(`localStorage.setItem:${key}`); storageWrites.push([key, JSON.parse(value)]); } };
  },
  key: 'seyma-reset-v1',
  sync() { order.push('sync.resolve'); return syncObject; }
};

ok(sandbox.SeymaSave.registerSave(deps) === true, 'tam resolver bag tek kez kaydedilir');
ok(sandbox.SeymaSave.registerSave(deps) === false, 'ikinci registry kaydı reddedilir');
ok(typeof sandbox.SeymaSave.save === 'function', 'kayıt sonrası save fonksiyonu görünür');

syncObject = { schedule(payload) { order.push(`schedule:${payload.marker}`); } };
order = [];
const normalReturn = sandbox.SeymaSave.save('user', { message: 'fixture event', meta: { source: 'MON-17' } });
ok(normalReturn === undefined, 'normal save dönüşü undefined');
ok(currentUi.saveState === 'dirty', 'normal save header stateini dirty yapar');
ok(currentData.event.message === 'fixture event', 'event payload gövdeye eklenir');
ok(currentData.days['2026-09-04'].habits.derived === true, 'derived habit yolu korunur');
ok(storageWrites.length === 1 && storageWrites[0][0] === 'seyma-reset-v1', 'canonical localStorage yazısı yapılır');
ok(order.join('>') === [
  'updateHeaderSave', 'activeDate', 'syncDerivedHabits:2026-09-04',
  'normalizeSyncReceipt', 'appendEvent', 'mergePersistedReminderState',
  'storage', 'localStorage.setItem:seyma-reset-v1', 'reminderSyncPayload',
  'sync.resolve', 'schedule:normal'
].join('>'), 'normal save local persistence → projection → schedule sırasını korur');

currentData = {
  marker: 'rebound',
  days: { '2026-09-04': { habits: {} } },
  syncReceipt: { status: 'idle' }
};
currentUi = { saveState: 'clean' };
order = [];
const reboundReturn = sandbox.SeymaSave.save(false);
ok(reboundReturn === undefined, 'save(false) dönüşü undefined');
ok(storageWrites[storageWrites.length - 1][1].marker === 'rebound', 'data resolver rebind sonrası taze kökü persist eder');
ok(!order.includes('updateHeaderSave') && !order.includes('appendEvent'), 'save(false) dirty ve event yollarını atlar');
ok(order.includes('sync.resolve') && order.includes('schedule:rebound'), 'SeySync çağrı anında lazy çözülür');
ok(sideEffects === 0, 'sentetik save ağ/timer/gerçek storage yan etkisi üretmez');

console.log(`MON-17 save boundary PASS (${passed} assertions)`);
