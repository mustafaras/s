'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const sandbox = { window: {} };
vm.createContext(sandbox);
for (const relative of [
  'app/content/quranLexiconV1.js',
  'app/content/quranGrammarV1.js',
  'app/content/quranShortSurahsV1.js',
  'app/content/quranPhonicsV1.js',
  // KAO2-16: taş anahtarları müfredattan türetilir; curriculum modülü gerekir.
  'app/content/quranCurriculumV2.js',
  'app/core/quranLearn.js'
]) vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), sandbox, { filename: relative });

const api = sandbox.window.SeymaQuranLearn;
assert.ok(api && typeof api.ensureQuranLearn === 'function');
assert.equal(api.schemaVersion, 1);
assert.equal(api.lexiconVersion, 'quran-lexicon-tr-v1');

const emptyRoot = {};
const fresh = api.ensureQuranLearn(emptyRoot);
assert.equal(emptyRoot.quranLearn, fresh);
assert.deepEqual(JSON.parse(JSON.stringify(fresh)), {
  schemaVersion: 1,
  lexiconVersion: 'quran-lexicon-tr-v1',
  startedAt: null,
  gate: { passed: false, skipped: false, score: null, at: null },
  settings: { dailyNew: 10, audio: false, autoAdvance: false, audioStyle: 'measured', harakat: true, translit: true, translitLayer: 'tr', shadowing: false, kaoVisible: true },
  cards: {}, units: {}, surahs: {}, daily: {},
  milestones: { besmele: null, fatiha: null, namaz: null, half: null, twoThirds: null, eighty: null, shortSurahs: null, u1: null, u2: null, u3: null, u4: null, u5: null, u6: null, u7: null, u8: null, u9: null, u10: null, u11: null, u12: null },
  phonics: { style: 'muallim', misheard: {} },
  errors: { sound: 0, root: 0, affix: 0, cognate: 0, rule: 0, order: 0 },
  ayahs: { understood: [] },
  readability: { lineHeight: 'normal', wordSpacing: 'normal', coloredHarakat: true, fadeHarakat: false },
  summary: null,
  onboarding: { doneAt: null, start: null, minutes: 5, intent: null, whatsNewAt: null },
  path: { lessons: {}, units: {} }
});

const old = { quranLearn: {
  schemaVersion: 0, lexiconVersion: 'old-v0', startedAt: '2026-01-02T03:04:05.000Z',
  cards: {
    'w:l_ll_ah_d0a09b:ar>tr': { n: 7 },
    's:114:1:1': { n: 2 },
    'g:g1:future-slot-9': { n: 1 },
    'w:removed-lemma:ar>tr': { n: 9 },
    'future:opaque': { custom: true }
  },
  units: { u1: { startedAt: 'x' } }, surahs: { nas: { understoodAt: 'x' } },
  daily: { '2026-09-24': { rev: 3 } }, futureField: { preserve: true }
} };
const migrated = api.ensureQuranLearn(old);
assert.equal(migrated.schemaVersion, 1);
assert.equal(migrated.lexiconVersion, api.lexiconVersion);
assert.deepEqual(JSON.parse(JSON.stringify(migrated.futureField)), { preserve: true });
assert.equal(migrated.cards['w:l_ll_ah_d0a09b:ar>tr'].orphan, undefined);
assert.equal(migrated.cards['s:114:1:1'].orphan, undefined);
assert.equal(migrated.cards['g:g1:future-slot-9'].orphan, undefined);
assert.equal(migrated.cards['w:removed-lemma:ar>tr'].orphan, true);
assert.equal(migrated.cards['future:opaque'].orphan, true);
assert.equal(migrated.cards['w:removed-lemma:ar>tr'].n, 9, 'orphan kart silinmemeli');

const broken = { quranLearn: {
  gate: [], settings: 'bad', cards: [], units: null, surahs: [], daily: 'bad',
  milestones: [], phonics: null, errors: { sound: -2, root: 'x' },
  ayahs: { understood: ['112:1', null, '112:1', ...Array.from({ length: 405 }, (_, i) => `x:${i}`)] },
  readability: { lineHeight: 'giant', wordSpacing: 4, coloredHarakat: 'yes' }
} };
const repaired = api.ensureQuranLearn(broken);
assert.equal(Array.isArray(repaired.gate), false);
assert.equal(Array.isArray(repaired.cards), false);
assert.equal(repaired.errors.sound, 0);
assert.equal(repaired.errors.root, 0);
assert.equal(repaired.readability.lineHeight, 'normal');
assert.equal(repaired.readability.wordSpacing, 'normal');
assert.equal(repaired.readability.coloredHarakat, true);
assert.equal(repaired.ayahs.understood.length, 400);
assert.equal(new Set(repaired.ayahs.understood).size, repaired.ayahs.understood.length);

const once = JSON.stringify(repaired);
assert.equal(api.ensureQuranLearn(broken), repaired);
assert.equal(JSON.stringify(repaired), once, 'ikinci migration bit-bit aynı olmalı');
assert.equal(api.ensureQuranLearn(null), null);
assert.equal(api.ensureQuranLearn([]), null);

const allSurahs = { quranLearn: { surahs: {} } };
for (let id = 1; id <= 114; id += 1) allSurahs.quranLearn.surahs[String(id)] = { understoodAt: `t${id}` };
api.ensureQuranLearn(allSurahs);
assert.equal(Object.keys(allSurahs.quranLearn.surahs).length, 114);
assert.equal(allSurahs.quranLearn.surahs['1'].understoodAt, 't1');
assert.equal(allSurahs.quranLearn.surahs['114'].understoodAt, 't114');

// KAO2-08: onboarding/path yalnız eklenir; kartı olan eski kullanıcı ilk açılışı görmez.
assert.equal(migrated.onboarding.doneAt, 'legacy');
assert.deepEqual(JSON.parse(JSON.stringify(migrated.path)), { lessons: {}, units: {} });
const brokenFlow = { quranLearn: { onboarding: 'x', path: [1, 2], cards: {} } };
const bf = api.ensureQuranLearn(brokenFlow);
assert.deepEqual(JSON.parse(JSON.stringify(bf.onboarding)), { doneAt: null, start: null, minutes: 5, intent: null, whatsNewAt: null });
assert.deepEqual(JSON.parse(JSON.stringify(bf.path)), { lessons: {}, units: {} });
const keepFlow = { quranLearn: {
  onboarding: { doneAt: '2026-10-01T18:04:11.000Z', start: 'placement', minutes: 15, intent: 'isha', whatsNewAt: 'bad-date', extra: 1 },
  path: {
    lessons: { 'u01.01': { startedAt: '2026-10-01T18:05:00.000Z', doneAt: 'nope', score: 2 }, 's0.03': 'bozuk', 'u01.02': { score: 0.5 } },
    units: { '1': { masteryAt: '2026-10-02T10:00:00.000Z', masteryScore: 0.8 }, x: { masteryAt: 'a' }, '2': 7 }
  }
} };
const kf = api.ensureQuranLearn(keepFlow);
assert.equal(kf.onboarding.doneAt, '2026-10-01T18:04:11.000Z');
assert.equal(kf.onboarding.start, 'placement');
assert.equal(kf.onboarding.minutes, 15);
assert.equal(kf.onboarding.intent, 'isha');
assert.equal(kf.onboarding.whatsNewAt, null);
assert.equal(kf.onboarding.extra, 1, 'bilinmeyen alan korunur');
assert.deepEqual(JSON.parse(JSON.stringify(kf.path.lessons)), {
  'u01.01': { startedAt: '2026-10-01T18:05:00.000Z', doneAt: null, score: null },
  'u01.02': { startedAt: null, doneAt: null, score: 0.5 }
});
assert.deepEqual(JSON.parse(JSON.stringify(kf.path.units)), { '1': { masteryAt: '2026-10-02T10:00:00.000Z', masteryScore: 0.8 } });
const kfAgain = JSON.stringify(api.ensureQuranLearn(keepFlow));
assert.equal(JSON.stringify(api.ensureQuranLearn(keepFlow)), kfAgain, 'onboarding/path normalizasyonu idempotent');

console.log('KAO migration: PASS (empty/old/broken/idempotent/orphan/114 surah/onboarding/path)');
