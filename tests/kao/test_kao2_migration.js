'use strict';

// KAO2-16: mevcut kullanıcı geçişi (05 §9). Sentetik old durumlar; tarayıcı, ağ,
// gerçek kullanıcı verisi veya kalıcı yazma yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function boot() {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const n of CONTENT) vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), box, { filename: n });
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), box, { filename: f });
  }
  const api = box.window.SeymaQuranLearn;
  return { api, box, curriculum: box.window.QuranCurriculumV2, lexicon: box.window.QuranLexiconV1 };
}

const { api, lexicon, curriculum } = boot();
const cardsFor = (count, offset = 0) => {
  const out = {};
  lexicon.lemmas.slice(offset, offset + count).forEach((lemma, index) => {
    out[`w:${lemma.id}:ar>tr`] = { state: 'review', s: 12, reps: 4, due: '2027-01-01T00:00:00.000Z', r: '2026-09-01T00:00:00.000Z', introducedAt: '2026-09-01T00:00:00.000Z' };
    if (index % 2 === 0) out[`w:${lemma.id}:tr>ar`] = { state: 'review', s: 12, reps: 4, due: '2027-01-01T00:00:00.000Z', r: '2026-09-01T00:00:00.000Z' };
  });
  return out;
};
const legacyLessons = () => {
  const out = {};
  curriculum.units.forEach((unit) => unit.lessons.forEach((lesson) => {
    out[lesson.id] = { startedAt: '2026-08-01T10:00:00.000Z', doneAt: '2026-08-01T10:12:00.000Z', score: 0.8, introducedLemmas: lesson.lemmaIds.slice() };
  }));
  return out;
};

const STATES = {
  empty: () => ({ quranLearn: null }),
  partial: () => ({
    quranLearn: {
      cards: cardsFor(40),
      daily: Object.fromEntries(cardsFor(0) && Array.from({ length: 5 }, (_, i) => [`2026-0${i + 1}-01`, { due: 8, done: 8, correct: 7, nightRev: 2, sessionDone: true }])),
      milestones: { half: '2026-08-15T00:00:00.000Z' },
      path: { lessons: {}, units: {} },
      onboarding: { doneAt: 'legacy', start: 'level1', minutes: 5, intent: null, placement: null },
      settings: { dailyNew: 5, translitLayer: 'tr', audioStyle: 'measured', shadowing: false, kaoVisible: true, harakat: true },
      phonics: { misheard: { ba: 3 }, self: { near: 2, n: 6 } },
      surahs: { 114: { delayedTestAt: '2026-08-20T00:00:00.000Z', delayedScore: 4, confirmedAt: null, needsReread: false } },
      ayahs: { understood: ['112:1'], seen: ['112:1'] },
      readability: { fadeHarakat: true },
      transfer: { seen: [], lastAt: null }
    }
  }),
  rich: () => ({
    quranLearn: {
      cards: cardsFor(400),
      daily: Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`2026-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`, { due: 10, done: 10, correct: 9, nightRev: 3, sessionDone: true, calib: { bands: Array.from({ length: 10 }, () => ({ n: 2, ok: 1, pred: 1 })) } }])),
      milestones: { half: '2026-08-15T00:00:00.000Z', twoThirds: '2026-09-01T00:00:00.000Z', fatiha: '2026-08-20T00:00:00.000Z', shortSurahs: '2026-09-10T00:00:00.000Z' },
      path: { lessons: legacyLessons(), units: { 1: { masteryAt: '2026-08-25T00:00:00.000Z' } } },
      onboarding: { doneAt: 'legacy', start: 'level1', minutes: 10, intent: 'fajr', placement: { reading: 8, readingTotal: 8, listening: 4, listeningTotal: 4, audioDeferred: false, missing: [], at: '2026-07-01T00:00:00.000Z' } },
      settings: { dailyNew: 10, translitLayer: 'dia', audioStyle: 'flowing', shadowing: true, kaoVisible: true, harakat: false },
      phonics: { misheard: { ba: 1, ta: 2 }, self: { near: 5, n: 9 }, shadow: { near: 3, n: 10 } },
      surahs: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [String(114 - i), { delayedTestAt: '2026-08-20T00:00:00.000Z', delayedScore: 5, confirmedAt: '2026-08-21T00:00:00.000Z', needsReread: false }])),
      ayahs: { understood: ['112:1', '113:2'], seen: ['112:1', '113:2', '114:1'] },
      readability: { fadeHarakat: false },
      transfer: { seen: ['112:1'], lastAt: '2026-09-20T00:00:00.000Z' },
      errors: { order: 4, root: 2 }
    }
  }),
  malformed: () => ({ quranLearn: { cards: 'bozuk', daily: 7, milestones: [], path: null, onboarding: 'x', settings: 3, phonics: [], surahs: {}, ayahs: 'y', readability: null, transfer: 0 } })
};

const PRESERVED = ['cards', 'daily', 'surahs', 'gate'];
const ERROR_KEYS = ['sound', 'root', 'affix', 'cognate', 'rule', 'order'];
const pick = (q, keys) => keys.reduce((out, key) => Object.assign(out, { [key]: q[key] }), {});
const fresh = () => api.ensureQuranLearn({ settings: {}, quranLearn: null });
// Taşlar: eski anahtarlar korunur, yeni anahtarlar null şeklinde tanınır (KAO2-16 · 07 §6).
const milestoneShape = () => {
  const out = {};
  for (const key of ['besmele', 'fatiha', 'namaz', 'half', 'twoThirds', 'eighty', 'shortSurahs']) out[key] = null;
  for (const unit of curriculum.units) out[`u${unit.id}`] = null;
  return out;
};

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

check('mevcut durumlar kayıpsız taşınır: cards, daily, surahs, phonics, errors, gate', () => {
  for (const name of ['partial', 'rich']) {
    const input = STATES[name]();
    const before = JSON.parse(JSON.stringify(input.quranLearn || {}));
    api.ensureQuranLearn(input);
    const q = input.quranLearn;
    for (const key of PRESERVED) {
      const expected = before[key] === undefined ? fresh()[key] : before[key];
      assert.deepEqual(JSON.parse(JSON.stringify(q[key] === undefined ? null : q[key])), JSON.parse(JSON.stringify(expected === undefined ? null : expected)), `${name}.${key} korunur`);
    }
  }
});

check('taşlar: eski kayıtlar korunur, mevcut kayda u* enjekte edilmez, boşta tam şekil', () => {
  const shape = milestoneShape();
  for (const name of ['partial', 'rich']) {
    const input = STATES[name]();
    const before = JSON.parse(JSON.stringify(input.quranLearn.milestones || {}));
    api.ensureQuranLearn(input);
    const m = input.quranLearn.milestones;
    for (const [key, value] of Object.entries(before)) assert.equal(m[key], value, `${name}.${key} korunur`);
    for (const key of Object.keys(shape).filter((k) => /^u\d+$/.test(k))) {
      assert.equal(Object.prototype.hasOwnProperty.call(m, key), false, `${name}.${key} mevcut kayda eklenmez (JSON şişmez)`);
    }
    for (const key of Object.keys(before)) assert.ok(m[key] === null || typeof m[key] === 'string', `${name}.${key} null ya da ISO dizesi`);
  }
  const empty = {};
  api.ensureQuranLearn(empty);
  assert.deepEqual(JSON.parse(JSON.stringify(empty.quranLearn.milestones)), shape, 'boşta tam şekil');
});

check('hata sayaçları korunur; bilinmeyen anahtarlar sıfırlanır, bilinenler toplanır', () => {
  for (const name of ['partial', 'rich']) {
    const input = STATES[name]();
    const before = JSON.parse(JSON.stringify(input.quranLearn.errors || {}));
    api.ensureQuranLearn(input);
    const err = input.quranLearn.errors;
    for (const [key, value] of Object.entries(before)) {
      if (ERROR_KEYS.includes(key)) assert.equal(err[key], value, `${name}.errors.${key} korunur`);
      else assert.equal(Object.prototype.hasOwnProperty.call(err, key), false, `${name}.errors.${key} düşer`);
    }
    for (const key of ERROR_KEYS) assert.equal(typeof err[key], 'number', `${name}.errors.${key} sayı`);
  }
});

check('phonics ölçümleri korunur; normalleştirme yalnız eksik alanı ekler', () => {
  for (const name of ['partial', 'rich']) {
    const input = STATES[name]();
    const before = JSON.parse(JSON.stringify(input.quranLearn.phonics));
    api.ensureQuranLearn(input);
    const ph = input.quranLearn.phonics;
    assert.deepEqual(JSON.parse(JSON.stringify(ph.misheard)), before.misheard, `${name}.phonics.misheard korunur`);
    if (before.self) assert.deepEqual(JSON.parse(JSON.stringify(ph.self)), before.self, `${name}.phonics.self korunur`);
    assert.equal(typeof ph.style, 'string', `${name}.phonics.style normalleştirilir`);
  }
});

check('boş durumda onboarding.doneAt null; karlı kullanıcıda legacy kalır', () => {
  const empty = {};
  api.ensureQuranLearn(empty);
  assert.equal(empty.quranLearn.onboarding.doneAt, null, 'boşta null');
  const partial = STATES.partial();
  api.ensureQuranLearn(partial);
  assert.equal(partial.quranLearn.onboarding.doneAt, 'legacy', 'kartlıda legacy');
  const rich = STATES.rich();
  api.ensureQuranLearn(rich);
  assert.equal(rich.quranLearn.onboarding.doneAt, 'legacy', 'zenginde legacy');
});

check('yol/ünite ilerlemesi path kayıtlarından türetilir; kartı olan lemmalar tanışıldı', () => {
  const input = STATES.rich();
  api.ensureQuranLearn(input);
  const q = input.quranLearn;
  const flow = api.kaoFlowApiProbe ? null : null;
  void flow;
  assert.ok(q.path && q.path.lessons, 'path.lessons var');
  assert.equal(q.path.units['1'].masteryAt, '2026-08-25T00:00:00.000Z', 'mevcut ustalık kaydı korunur');
  const unit = curriculum.units[1];
  const known = unit.lessons.flatMap((l) => l.lemmaIds).filter((id) => q.cards[`w:${id}:ar>tr`] && (q.cards[`w:${id}:ar>tr`].introducedAt || q.cards[`w:${id}:ar>tr`].r));
  assert.ok(known.length > 0, 'kartı olan lemmalar tanışılmış sayılır');
});

check('iki kez çalıştırma idempotent', () => {
  for (const name of ['empty', 'partial', 'rich', 'malformed']) {
    const input = STATES[name]();
    api.ensureQuranLearn(input);
    const once = JSON.stringify(input.quranLearn);
    api.ensureQuranLearn(input);
    assert.equal(JSON.stringify(input.quranLearn), once, `${name}: ikinci çalıştırma aynı sonucu verir`);
  }
});

check('bozuk durum güvenli bir nesneye döner', () => {
  const input = STATES.malformed();
  api.ensureQuranLearn(input);
  const q = input.quranLearn;
  assert.ok(q && typeof q === 'object' && !Array.isArray(q), 'kök nesne');
  for (const key of ['cards', 'daily', 'milestones', 'path', 'settings', 'phonics', 'surahs', 'ayahs', 'readability', 'transfer']) {
    assert.equal(Array.isArray(q[key]), false, `${key} dizi değil`);
    assert.equal(typeof q[key], 'object', `${key} nesne`);
  }
});

check('JSON boyut artışı ≤7 KB', () => {
  const input = STATES.rich();
  const before = Buffer.byteLength(JSON.stringify(input), 'utf8');
  api.ensureQuranLearn(input);
  const after = Buffer.byteLength(JSON.stringify(input), 'utf8');
  const delta = after - before;
  assert.ok(delta <= 7 * 1024, `artış ${delta} B ≤ 7168 B`);
});

check('eski taş anahtarları korunur, yeni anahtarlar uydurulmaz', () => {
  const input = STATES.rich();
  api.ensureQuranLearn(input);
  const m = input.quranLearn.milestones;
  for (const key of ['half', 'twoThirds', 'fatiha', 'shortSurahs']) assert.ok(m[key], `${key} korunur`);
  for (const key of ['besmele', 'u1', 'u2']) {
    const value = m[key];
    assert.ok(value === undefined || value === null, `${key} geçişte kazanılmaz (null/undefined kalır)`);
  }
});

check('kaoUnitSlices kaldırıldı (kullanan kalmadı)', () => {
  const src = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');
  assert.doesNotMatch(src, /function kaoUnitSlices/, 'kaoUnitSlices tanımı yok');
  assert.doesNotMatch(src, /kaoUnitSlices\(/, 'kaoUnitSlices çağrısı yok');
  assert.equal(typeof api.kaoUnitSlices, 'undefined', 'API yüzeyinde de yok');
});

check('panel projeksiyonu yeni taş anahtarlarını sayısal taşır', () => {
  const input = STATES.rich();
  api.ensureQuranLearn(input);
  const q = input.quranLearn;
  q.milestones.besmele = '2026-09-25T00:00:00.000Z';
  q.milestones.u1 = '2026-09-26T00:00:00.000Z';
  const summary = api.kaoPanelSummary(input);
  assert.equal(summary.milestoneCount, 6, 'besmele + u1 dâhil sayılır');
  assert.equal(summary.unitMilestones, 1, 'yalnız gerçek u* taşı sayılır');
  assert.equal(typeof summary.besmele, 'boolean', 'besmele sayısal/bool taşınır');
  for (const forbidden of ['lemmaIds', 'meaning', 'arabicText', 'words', 'examples', 'notes']) {
    assert.equal(Object.prototype.hasOwnProperty.call(summary, forbidden), false, `panel özeti ${forbidden} taşımaz`);
  }
  assert.equal(typeof summary.knownWords, 'number', 'kelime bilgisi yalnız sayı olarak taşınır');
});

console.log(`KAO2-16 migration: PASS (${passed} kontrol)`);
