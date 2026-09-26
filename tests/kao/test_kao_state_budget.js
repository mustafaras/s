'use strict';

// KAO-FIX-09 (O-2) · kullanıcı kararı KF-10 (2026-09-26): `daily` budanmaz, 100 KB durum sınırı kaldırıldı.
// Bu fixture kararı korur: ensureQuranLearn hiçbir günü silmez, idempotenttir ve kayıt kaybı olmaz.
// Boyut yalnız bilgi olarak basılır (sınır yok). Senkron 1 MB üstünü Blobs API ile okur (sync.js QY-22).

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const box = { window: {} };
vm.createContext(box);
for (const relative of ['app/content/quranLexiconV1.js', 'app/core/quranLearn.js']) {
  vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), box, { filename: relative });
}
const api = box.window.SeymaQuranLearn;
let today = '2026-12-31';
assert.equal(api.registerQuranLearn({
  data() { return null; }, ui() { return {}; }, save() {}, render() {}, todayStr() { return today; },
  esc: String, icon() { return ''; }, getDay() { return {}; }
}), true);

const DAYS = 400;
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (offset) => { const d = new Date(Date.UTC(2025, 11, 1) + offset * 86400000); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };
const daily = {};
for (let i = 0; i < DAYS; i += 1) {
  daily[dayKey(i)] = { answered: 20, correct: 18, new: 5, reviewed: 15, calib: { pred: 17.5, ok: 18, n: 20 } };
}
const data = { quranLearn: { daily: JSON.parse(JSON.stringify(daily)) } };
api.ensureQuranLearn(data);
const keys = Object.keys(data.quranLearn.daily);
assert.equal(keys.length, DAYS, `KF-10: ${DAYS} günün hiçbiri budanmamalı (${keys.length})`);
for (const key of Object.keys(daily)) {
  assert.deepEqual(JSON.parse(JSON.stringify(data.quranLearn.daily[key])), daily[key], `${key}: günlük kayıt değişmeden korunmalı`);
}
const once = JSON.stringify(data.quranLearn);
today = '2027-06-30'; // referans gün ilerlese de hiçbir gün silinmez
api.ensureQuranLearn(data);
assert.equal(JSON.stringify(data.quranLearn), once, 'ensureQuranLearn idempotent (bayt-eş)');

const kb = (Buffer.byteLength(once) / 1024).toFixed(1);
console.log(`KAO state budget: PASS (KF-10 sınırsız; ${DAYS} gün korundu, idempotent, ${kb} KB bilgi amaçlı)`);
