'use strict';

// K2F-05 · Ünite ustalığı, bölüm A — saf Flow: `masteryPlan` ve `unitMastery` (K4-01, KR-1).
// Sentetik VM; ağ, tarayıcı, gerçek veri yok; sabit saat. Arapça metin yalnız içerik modüllerinden gelir.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { bootKao, freshUser, read, repoRoot } = require('./helpers/kao-harness');

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

const t = bootKao();
const win = t.win;
const flow = win.SeymaQuranLearnFlow;
const NOW = new Date('2026-09-30T12:00:00.000Z');
const curriculum = win.QuranCurriculumV2;
const lex = win.QuranLexiconV1;
const allAudio = Object.fromEntries(lex.lemmas.map((l) => [l.id, true]));
const contentOf = (audioLemmas) => ({
  curriculum, lexicon: lex, grammar: win.QuranGrammarV1, shorts: win.QuranShortSurahsV1, phonics: win.QuranPhonicsV1, audioLemmas
});
const content = contentOf(allAudio);
const silent = contentOf({});
const unitOf = (id) => curriculum.units.find((u) => u.id === id);
const unitLemmas = (id) => [...new Set(unitOf(id).lessons.flatMap((l) => l.lemmaIds))];
const snapshotOf = (q) => ({ quranLearn: q });
const deepFreeze = (o) => { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(deepFreeze); } return o; };

// Ünite `id`nin tüm derslerini bitirmiş kullanıcı; kartlar `stability(i)` ile kurulur (null → kart yok).
function userWithUnit(id, { lessons = null, stability = (i) => 10 + i } = {}) {
  const q = freshUser(t);
  const unit = unitOf(id);
  const picked = lessons === null ? unit.lessons : unit.lessons.slice(0, lessons);
  let i = 0;
  for (const lesson of picked) {
    q.path.lessons[lesson.id] = { startedAt: NOW.toISOString(), doneAt: NOW.toISOString(), score: 0.9, introducedLemmas: lesson.lemmaIds.slice() };
    for (const lemmaId of lesson.lemmaIds) {
      const s = stability(i++);
      if (s !== null) q.cards[`w:${lemmaId}:ar>tr`] = { state: 'review', s, reps: 3, due: NOW.toISOString() };
    }
  }
  return q;
}
const practiceOf = (items) => items.filter((i) => i.kind === 'practice');
const kindsOf = (items) => Array.from(items, (i) => i.kind);

check('Flow dış yüzeyinde masteryPlan ve unitMastery var', () => {
  assert.equal(typeof flow.masteryPlan, 'function');
  assert.equal(typeof flow.unitMastery, 'function');
});

check('(a) sıra: goal → read → 10 × practice → summary (Ünite 1, prayer çapası)', () => {
  const plan = flow.masteryPlan(snapshotOf(userWithUnit(1)), 1, NOW, content);
  assert.deepEqual(kindsOf(plan), ['goal', 'read', ...Array(10).fill('practice'), 'summary']);
  assert.ok(plan.every((item) => item.mastery === true), 'her öğe ustalık işaretli');
  assert.ok(plan.every((item) => item.unitId === 1), 'her öğe ünite kimliğini taşır');
});

check('(a) lemma-pool çapalı ünitede read öğesi yoktur (Ünite 4)', () => {
  const plan = flow.masteryPlan(snapshotOf(userWithUnit(4)), 4, NOW, content);
  assert.deepEqual(kindsOf(plan), ['goal', ...Array(10).fill('practice'), 'summary']);
});

check('(d) read öğesi çapa metninin kelimelerini içerikten verir — Fâtiha', () => {
  const plan = flow.masteryPlan(snapshotOf(userWithUnit(1)), 1, NOW, content);
  const source = win.QuranShortSurahsV1.prayerTexts.find((p) => p.id === 'fatiha').words;
  const readItem = plan.find((i) => i.kind === 'read');
  assert.deepEqual(Array.from(readItem.words, (w) => w.ar), Array.from(source, (w) => w.ar), 'Arapça yalnız kaynaktan, sırayla');
  assert.ok(readItem.words.length > 0);
  assert.deepEqual(Array.from(readItem.anchors), ['prayer:fatiha']);
});

check('(d) read öğesi çoklu çapayı birleştirir — Ünite 2 (altı namaz metni) ve Ünite 3 (üç sûre)', () => {
  for (const id of [2, 3]) {
    const plan = flow.masteryPlan(snapshotOf(userWithUnit(id)), id, NOW, content);
    const readItem = plan.find((i) => i.kind === 'read');
    assert.ok(readItem, `Ünite ${id} için read öğesi`);
    assert.deepEqual(Array.from(readItem.anchors), Array.from(unitOf(id).anchor));
    assert.ok(readItem.words.length > 0);
  }
});

check('(b) practice: mastery:true, choiceCount:4, yalnız ünitenin tanışılmış lemmaları, 10 benzersiz kimlik', () => {
  const plan = flow.masteryPlan(snapshotOf(userWithUnit(1)), 1, NOW, content);
  const practice = practiceOf(plan);
  const allowed = new Set(unitLemmas(1));
  assert.equal(practice.length, 10);
  for (const item of practice) {
    assert.equal(item.mastery, true);
    assert.equal(item.choiceCount, 4);
    assert.ok(allowed.has(item.lemmaId), `${item.lemmaId} ünitede değil`);
    assert.equal(item.group, 'lemma');
    assert.match(item.cardId, /^w:/);
  }
  assert.equal(new Set(practice.map((p) => p.id)).size, 10, 'kimlikler benzersiz');
});

check('(b) yalnız TANIŞILMIŞ lemmalar: ilk 2 ders bitmişse diğer derslerin lemmaları gelmez', () => {
  const plan = flow.masteryPlan(snapshotOf(userWithUnit(1, { lessons: 2 })), 1, NOW, content);
  const allowed = new Set(unitOf(1).lessons.slice(0, 2).flatMap((l) => l.lemmaIds));
  assert.ok(practiceOf(plan).every((p) => allowed.has(p.lemmaId)));
});

check('(b) en zayıftan: ar>tr turunda kartın kararlılığı (s) azalmayan sırada gelir', () => {
  const q = userWithUnit(1, { stability: (i) => 100 - i });
  const plan = flow.masteryPlan(snapshotOf(q), 1, NOW, content);
  const firstPass = practiceOf(plan).filter((p) => p.direction === 'ar>tr');
  assert.ok(firstPass.length >= 2);
  const stab = firstPass.map((p) => q.cards[p.cardId].s);
  assert.deepEqual(stab, stab.slice().sort((a, b) => a - b), 'zayıf → güçlü');
  const weakest = Math.min(...unitLemmas(1).map((id) => q.cards[`w:${id}:ar>tr`].s));
  assert.equal(q.cards[firstPass[0].cardId].s, weakest, 'ilk soru en zayıf kelime');
});

check('(b) kartı olmayan tanışılmış lemma en zayıf sayılır (s=0)', () => {
  const q = userWithUnit(1, { stability: (i) => (i === 3 ? null : 40) });
  const cardless = unitOf(1).lessons.flatMap((l) => l.lemmaIds)[3];
  const plan = flow.masteryPlan(snapshotOf(q), 1, NOW, content);
  assert.equal(practiceOf(plan)[0].lemmaId, cardless);
});

check('(b) tanışılmış lemma <10 ise yönler çeşitlenerek 10\'a tamamlanır (sesli dahil)', () => {
  const q = userWithUnit(1, { lessons: 1 });
  const few = unitOf(1).lessons[0].lemmaIds.length;
  assert.ok(few > 0 && few < 10, `test önkoşulu: ilk ders ${few} lemma`);
  const practice = practiceOf(flow.masteryPlan(snapshotOf(q), 1, NOW, content));
  assert.equal(practice.length, 10);
  const directions = new Set(practice.map((p) => p.direction));
  assert.ok(directions.has('ar>tr') && directions.has('tr>ar'), `yönler: ${[...directions]}`);
  assert.ok(directions.has('audio>meaning'), 'ses varsa sesli yön de kullanılır');
  assert.equal(new Set(practice.map((p) => p.id)).size, 10, 'tekrarlar da benzersiz kimlikli');
  assert.ok(practice.filter((p) => p.direction === 'audio>meaning').every((p) => p.audioOnly === true && allAudio[p.lemmaId]));
});

check('(b) ses yoksa sesli yön hiç üretilmez', () => {
  const plan = flow.masteryPlan(snapshotOf(userWithUnit(1, { lessons: 1 })), 1, NOW, silent);
  assert.equal(practiceOf(plan).length, 10);
  assert.ok(practiceOf(plan).every((p) => p.direction !== 'audio>meaning' && p.audioOnly === false));
});

check('(b) tanışılmış lemma 0 ise ve ünite yoksa null', () => {
  assert.equal(flow.masteryPlan(snapshotOf(freshUser(t)), 1, NOW, content), null);
  assert.equal(flow.masteryPlan(snapshotOf(userWithUnit(1)), 999, NOW, content), null);
  assert.equal(flow.masteryPlan(snapshotOf(userWithUnit(1)), 'yok', NOW, content), null);
});

check('(c) aynı girdiyle bayt-eşit (belirlenimci); aynı gün içinde saat değişse de aynı plan', () => {
  const q = userWithUnit(1, { stability: () => 12 });
  const a = JSON.stringify(flow.masteryPlan(snapshotOf(q), 1, NOW, content));
  const b = JSON.stringify(flow.masteryPlan(snapshotOf(JSON.parse(JSON.stringify(q))), 1, new Date(NOW.getTime() + 3600000), content));
  assert.equal(a, b);
});

check('(c) tohum unitId + gün: eşit kararlılıkta sıra gün değişince değişir, aynı günde bayt-eşit kalır', () => {
  const q = userWithUnit(1, { stability: () => 12 });
  const orders = new Set();
  for (let d = 0; d < 6; d += 1) {
    const day = new Date(NOW.getTime() + d * 86400000);
    const plan = flow.masteryPlan(snapshotOf(q), 1, day, content);
    orders.add(practiceOf(plan).map((p) => p.lemmaId).join(','));
    assert.equal(JSON.stringify(plan), JSON.stringify(flow.masteryPlan(snapshotOf(q), 1, day, content)), 'aynı gün bayt-eşit');
  }
  assert.ok(orders.size >= 2, 'tohum gün ile değişmeli (eşitlikler günlük karışır)');
});

check('saflık: derin dondurulmuş girdiyle çalışır, now geçersizse TypeError, Flow kaynağında yasak API yok', () => {
  const frozen = deepFreeze(snapshotOf(userWithUnit(1)));
  assert.doesNotThrow(() => flow.masteryPlan(frozen, 1, NOW, content));
  assert.throws(() => flow.masteryPlan(frozen, 1, 'bugün', content), { name: 'TypeError' });
  const src = read('app/core/quranLearnFlow.js');
  for (const banned of ['Date.now', 'localStorage', 'sessionStorage', 'document.', 'fetch(', 'XMLHttpRequest', 'setTimeout', 'Math.random']) {
    assert.ok(!src.includes(banned), `Flow saf kalmalı: ${banned}`);
  }
});

check('(e) unitMastery: durum tablosu none/passed/failed/repair/skipped + puan ve deneme', () => {
  const at = '2026-09-30T10:00:00.000Z';
  const cases = [
    [undefined, { state: 'none', score: null, attempts: 0 }],
    [{}, { state: 'none', score: null, attempts: 0 }],
    [{ masteryAt: at }, { state: 'passed', score: null, attempts: 0 }],
    [{ masteryAt: at, masteryScore: 0.9, attempts: 2 }, { state: 'passed', score: 0.9, attempts: 2 }],
    [{ masteryAt: null, masteryScore: 0.5, attempts: 1, lastAttemptAt: at, repair: null }, { state: 'failed', score: 0.5, attempts: 1 }],
    [{ masteryAt: null, masteryScore: 0.5, attempts: 1, repair: { lemmaIds: ['l_x'] } }, { state: 'repair', score: 0.5, attempts: 1 }],
    [{ masteryAt: null, skippedAt: at }, { state: 'skipped', score: null, attempts: 0 }],
    [{ masteryAt: at, skippedAt: at, repair: { lemmaIds: ['l_x'] } }, { state: 'passed', score: null, attempts: 0 }],
    [{ masteryAt: null, repair: { lemmaIds: [] }, attempts: 2 }, { state: 'failed', score: null, attempts: 2 }],
    [{ masteryAt: 7, masteryScore: 'x', attempts: -3, repair: 'bozuk' }, { state: 'none', score: null, attempts: 0 }],
    [{ masteryAt: null, masteryScore: 4, attempts: 1.9 }, { state: 'failed', score: 1, attempts: 1 }]
  ];
  for (const [record, expected] of cases) {
    const q = { path: { units: record === undefined ? {} : { 1: record } } };
    assert.deepEqual({ ...flow.unitMastery(q, 1) }, expected, JSON.stringify(record));
  }
  assert.deepEqual({ ...flow.unitMastery(null, 1) }, { state: 'none', score: null, attempts: 0 });
  assert.deepEqual({ ...flow.unitMastery({ path: { units: { 2: { masteryAt: '2026-09-30T10:00:00.000Z' } } } }, '2') }, { state: 'passed', score: null, attempts: 0 });
});

check('runtime bütçesi tavanı (128 KiB gzip) içinde kalır', () => {
  const files = ['app/core/quranLearn.js', 'app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js'];
  const kib = files.reduce((sum, f) => sum + zlib.gzipSync(fs.readFileSync(path.join(repoRoot, f))).length, 0) / 1024;
  assert.ok(kib <= 128, `runtime gzip ${kib.toFixed(3)} KiB > 128`);
});

console.log(`test_kao2_mastery (bölüm A): ${passed} kontrol PASS`);
