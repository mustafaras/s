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

const partA = passed;

// ---- Bölüm B — gerçek handler'larla ustalık oturumu ve kayıt (K2F-06) ---------------------------------
const { walkLesson } = require('./helpers/kao-harness');
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
const lemmaOf = (task) => String(task.cardId).split(':')[1];

// Ünite 1'in dersleri bitmiş (gerçek bir öğrenci gibi: ders kaydı + kartlar) kullanıcıyla yeni VM.
function bootUnit1Done() {
  const u = bootKao();
  const q = freshUser(u);
  for (const lesson of u.win.QuranCurriculumV2.units[0].lessons) {
    q.path.lessons[lesson.id] = { startedAt: NOW.toISOString(), doneAt: NOW.toISOString(), score: 0.9, introducedLemmas: lesson.lemmaIds.slice() };
    for (const id of lesson.lemmaIds) q.cards[`w:${id}:ar>tr`] = { state: 'review', s: 12, reps: 4, due: '2026-12-01T00:00:00.000Z' };
  }
  return u;
}
// İlk `wrongCount` görevi yanlış, kalanı doğru cevaplayan oynatma; yanlış cevaplanan lemmaları döndürür.
function runMastery(u, wrongCount) {
  const wrong = [];
  let seen = 0;
  const answer = (task) => {
    const wantWrong = seen < wrongCount; seen += 1;
    const pick = wantWrong ? task.choices.find((c) => !c.correct) : task.choices.find((c) => c.correct);
    if (wantWrong) wrong.push(lemmaOf(task));
    return pick.choiceId;
  };
  const done = walkLesson(u, 1, { answer });
  return { done, wrong, seen };
}
const unitRecord = (u) => u.data.quranLearn.path.units['1'];

check('B(a) kaoLesson(start, ünite) ustalık oturumu açar — içerik dersi değil, masteryPlan çıktısı', () => {
  const u = bootUnit1Done();
  assert.equal(u.api.kaoLesson('start', 1), true);
  const st = u.ui.kaoLesson;
  assert.equal(st.kind, 'mastery');
  assert.equal(st.unitId, 1);
  assert.ok(!/^u\d{2}\.\d{2}$/.test(String(st.lessonId)), `ders kimliği içerik dersi olmamalı: ${st.lessonId}`);
  assert.deepEqual(kindsOf(st.plan), ['goal', 'read', ...Array(10).fill('practice'), 'summary']);
  assert.ok(st.plan.every((i) => i.mastery === true));
  assert.equal(u.ui.kaoView, 'session');
});

check('B(a) v1 kullanıcı (yalnız kartlar, ders kaydı yok) ustalık adımını başlatınca gerçek ustalık açılır (R-02)', () => {
  const u = bootKao();
  const cards = {};
  for (const unit of u.win.QuranCurriculumV2.units.slice(0, 3)) for (const l of unit.lessons) for (const id of l.lemmaIds) cards[`w:${id}:ar>tr`] = { state: 'review', s: 30, reps: 6, due: '2026-12-01T00:00:00.000Z' };
  u.data.quranLearn = { schemaVersion: 1, cards, daily: { '2026-09-29': { answered: 10, correct: 9 } } };
  const step = u.api.kaoNextStep(NOW);
  assert.equal(step.kind, 'mastery');
  assert.equal(u.api.kaoLesson('start', step.param), true);
  assert.equal(u.ui.kaoLesson.kind, 'mastery');
  assert.ok(!/^u\d{2}\.\d{2}$/.test(String(u.ui.kaoLesson.lessonId)));
});

check('B(a) tanışılmış lemma yoksa başlatılamaz (false) ve ustalık oturumu açılmaz', () => {
  const u = bootKao();
  freshUser(u);
  assert.equal(u.api.kaoLesson('start', 1), false);
  assert.ok(!u.ui.kaoLesson || u.ui.kaoLesson.kind !== 'mastery');
});

check('B(b) 10 doğru → path.units[1] tam kayıtla yazılır ve sıradaki adım sonraki üniteye geçer', () => {
  const u = bootUnit1Done();
  const lessonKeysBefore = Object.keys(u.data.quranLearn.path.lessons).sort().join(',');
  const { done, seen } = runMastery(u, 0);
  assert.equal(done, true);
  assert.equal(seen, 10, 'tam 10 soru (yeniden deneme yok)');
  const rec = unitRecord(u);
  assert.match(rec.masteryAt, ISO);
  assert.equal(rec.masteryScore, 1);
  assert.equal(rec.attempts, 1);
  assert.match(rec.lastAttemptAt, ISO);
  assert.equal(rec.repair, null);
  assert.equal(rec.skippedAt, null);
  assert.equal(Object.keys(u.data.quranLearn.path.lessons).sort().join(','), lessonKeysBefore, 'ustalık ders kaydı (path.lessons) yazmaz');
  const next = u.api.kaoNextStep('2026-10-01T12:00:00.000Z');
  assert.notEqual(next.kind, 'mastery', `ustalık geçildi ama adım hâlâ ${next.title}`);
  assert.ok(!/Fâtiha/.test(next.title), `Ünite 1 tekrar önerilmemeli: ${next.title}`);
});

check('B(c) 5 yanlış → masteryAt:null, masteryScore 0.5, repair.lemmaIds = yanlış lemmalar (tekilleştirilmiş)', () => {
  const u = bootUnit1Done();
  const { done, wrong, seen } = runMastery(u, 5);
  assert.equal(done, true);
  assert.equal(seen, 10, 'yanlışta yeniden deneme eklenmez');
  const rec = unitRecord(u);
  assert.equal(rec.masteryAt, null);
  assert.equal(rec.masteryScore, 0.5);
  assert.equal(rec.attempts, 1);
  assert.match(rec.lastAttemptAt, ISO);
  assert.equal(rec.skippedAt, null);
  assert.deepEqual(Array.from(rec.repair.lemmaIds).sort(), [...new Set(wrong)].sort());
  assert.ok(rec.repair.lemmaIds.length > 0);
});

check('B(c) eşik 0,8: 8/10 geçer, 7/10 geçmez', () => {
  const pass = bootUnit1Done(); runMastery(pass, 2);
  assert.match(unitRecord(pass).masteryAt, ISO);
  assert.equal(unitRecord(pass).masteryScore, 0.8);
  const fail = bootUnit1Done(); runMastery(fail, 3);
  assert.equal(unitRecord(fail).masteryAt, null);
  assert.equal(unitRecord(fail).masteryScore, 0.7);
});

check('B kayıt tekrarsız: özet + finish aynı denemeyi bir kez sayar; finish günü tamamlar', () => {
  const u = bootUnit1Done();
  runMastery(u, 0);
  assert.equal(unitRecord(u).attempts, 1);
  assert.equal(u.api.kaoLesson('finish'), true);
  assert.equal(unitRecord(u).attempts, 1, 'finish ikinci deneme yazmaz');
  assert.equal(u.data.quranLearn.daily[u.NOW.slice(0, 10)].sessionDone, true);
  assert.equal(u.ui.kaoView, 'home');
});

check('B ikinci deneme geçilmiş ustalığı bozmaz: masteryAt korunur, deneme sayısı artar', () => {
  const u = bootUnit1Done();
  runMastery(u, 0);
  const first = unitRecord(u).masteryAt;
  u.api.kaoLesson('finish');
  runMastery(u, 6);
  const rec = unitRecord(u);
  assert.equal(rec.masteryAt, first, 'geçilmiş ustalık kaybolmaz');
  assert.equal(rec.attempts, 2);
  assert.equal(rec.repair, null, 'geçilmiş ünitede onarım açılmaz');
});

check('B oturum sürerken aynı ünite yeniden başlatılırsa sıfırlanmaz', () => {
  const u = bootUnit1Done();
  u.api.kaoLesson('start', 1);
  const st = u.ui.kaoLesson;
  st.at = 2; st.phase = 'practice';
  assert.equal(u.api.kaoLesson('start', 1), true);
  assert.equal(u.ui.kaoLesson, st, 'aynı durum nesnesi');
  assert.equal(u.ui.kaoLesson.at, 2);
});

check('B(d) eski biçim path.units[1]={masteryAt} korunur, yeni alanlar varsayılanla eklenir', () => {
  const u = bootKao();
  const at = '2026-09-20T00:00:00.000Z';
  u.data.quranLearn = { schemaVersion: 1, path: { units: { 1: { masteryAt: at } } } };
  const q = u.api.ensureQuranLearn(u.data);
  assert.deepEqual({ ...q.path.units['1'] }, { masteryAt: at, masteryScore: null, attempts: 0, lastAttemptAt: null, repair: null, skippedAt: null });
  const again = u.api.ensureQuranLearn(u.data);
  assert.deepEqual(JSON.parse(JSON.stringify(again.path.units)), JSON.parse(JSON.stringify(q.path.units)), 'idempotent');
});

check('B(d) bozuk tipler varsayılana düşer; geçerli onarım/deneme alanları korunur', () => {
  const u = bootKao();
  const at = '2026-09-21T10:00:00.000Z';
  u.data.quranLearn = { schemaVersion: 1, path: { units: {
    1: { masteryAt: 5, masteryScore: 'x', attempts: 'üç', lastAttemptAt: 7, repair: 'bozuk', skippedAt: 9 },
    2: { masteryAt: null, masteryScore: 0.5, attempts: 2.9, lastAttemptAt: at, repair: { lemmaIds: ['l_abc_a1b2c3', 3, 'l_abc_a1b2c3', 'l_xyz_0f0f0f'], at }, skippedAt: at }
  } } };
  const q = u.api.ensureQuranLearn(u.data);
  assert.deepEqual({ ...q.path.units['1'] }, { masteryAt: null, masteryScore: null, attempts: 0, lastAttemptAt: null, repair: null, skippedAt: null });
  const second = q.path.units['2'];
  assert.equal(second.attempts, 2);
  assert.equal(second.lastAttemptAt, at);
  assert.equal(second.skippedAt, at);
  assert.deepEqual({ lemmaIds: Array.from(second.repair.lemmaIds), at: second.repair.at }, { lemmaIds: ['l_abc_a1b2c3', 'l_xyz_0f0f0f'], at });
});

const partB = passed;

// ---- Bölüm C — onarım, atlama ve 12 ünite simülasyonu (K2F-07) ----------------------------------------
const AT = '2026-09-30T10:00:00.000Z';
const U1 = () => unitLemmas(1);
// Ünite 1 bitmiş + başarısız ustalık (onarım listesiyle) kullanıcısı.
function bootRepairUser(repairIds) {
  const u = bootUnit1Done();
  u.data.quranLearn.path.units['1'] = { masteryAt: null, masteryScore: 0.5, attempts: 1, lastAttemptAt: AT, repair: { lemmaIds: repairIds, at: AT }, skippedAt: null };
  return u;
}

check('C repairPlan (saf): goal → onarım lemmaları × iki yön → summary; yalnız onarım listesi, tanış yok', () => {
  const ids = U1().slice(0, 3);
  const q = bootRepairUser(ids).data.quranLearn;
  assert.equal(typeof flow.repairPlan, 'function');
  const plan = flow.repairPlan(snapshotOf(q), 1, NOW, content);
  assert.deepEqual(kindsOf(plan), ['goal', ...Array(6).fill('practice'), 'summary']);
  const practice = practiceOf(plan);
  assert.deepEqual([...new Set(practice.map((p) => p.lemmaId))].sort(), ids.slice().sort());
  assert.deepEqual([...new Set(practice.map((p) => p.direction))].sort(), ['ar>tr', 'tr>ar']);
  assert.ok(practice.every((p) => p.repair === true && p.mastery !== true && p.choiceCount === 4));
  assert.equal(new Set(practice.map((p) => p.id)).size, practice.length);
  assert.ok(!plan.some((i) => i.kind === 'intro'), 'onarımda tanış adımı atlanır');
});

check('C repairPlan: 10 öğeyle sınırlı (çok lemma), belirlenimci; onarım yok/geçersiz → null', () => {
  const many = U1().slice(0, 8);
  const q = bootRepairUser(many).data.quranLearn;
  const a = flow.repairPlan(snapshotOf(q), 1, NOW, content);
  assert.equal(practiceOf(a).length, 10);
  assert.equal(JSON.stringify(a), JSON.stringify(flow.repairPlan(snapshotOf(q), 1, NOW, content)));
  assert.equal(flow.repairPlan(snapshotOf(userWithUnit(1)), 1, NOW, content), null, 'repair kaydı yok');
  const empty = bootRepairUser([]).data.quranLearn;
  assert.equal(flow.repairPlan(snapshotOf(empty), 1, NOW, content), null, 'boş onarım listesi');
  const foreign = bootRepairUser([unitLemmas(4)[0]]).data.quranLearn;
  assert.equal(flow.repairPlan(snapshotOf(foreign), 1, NOW, content), null, 'başka ünitenin lemması sayılmaz');
  assert.equal(flow.repairPlan(snapshotOf(q), 999, NOW, content), null);
});

check('C kaoLesson(start, "repair:<ünite>") onarım oturumu açar; bitince repair:null, ustalık/ders kaydı yazılmaz', () => {
  const ids = U1().slice(0, 3);
  const u = bootRepairUser(ids);
  const lessonKeys = Object.keys(u.data.quranLearn.path.lessons).sort().join(',');
  assert.equal(u.api.kaoLesson('start', 'repair:1'), true);
  assert.equal(u.ui.kaoLesson.kind, 'repair');
  assert.equal(u.ui.kaoLesson.lessonId, 'repair:1');
  const seenLemmas = new Set();
  const done = walkLesson(u, 'repair:1', { answer: 'correct', visit: (task) => seenLemmas.add(lemmaOf(task)) });
  assert.equal(done, true);
  const rec = unitRecord(u);
  assert.equal(rec.repair, null, 'onarım bitince repair:null');
  assert.equal(rec.masteryAt, null, 'onarım ustalığı vermez');
  assert.equal(rec.attempts, 1, 'onarım deneme saymaz');
  assert.equal(Object.keys(u.data.quranLearn.path.lessons).sort().join(','), lessonKeys, 'ders kaydı yok');
  assert.ok([...seenLemmas].every((id) => ids.includes(id)), 'yalnız onarım lemmaları soruldu');
  assert.equal(u.api.kaoNextStep(NOW.toISOString()).kind, 'mastery', 'onarım bitti → yeniden ustalık');
});

check('C onarım yarıda bırakılırsa repair korunur; onarım yokken başlatma false', () => {
  const u = bootRepairUser(U1().slice(0, 2));
  u.api.kaoLesson('start', 'repair:1');
  u.api.kaoLesson('exit');
  assert.equal(unitRecord(u).repair.lemmaIds.length, 2);
  const none = bootUnit1Done();
  assert.equal(none.api.kaoLesson('start', 'repair:1'), false);
  assert.ok(!none.ui.kaoLesson || none.ui.kaoLesson.kind !== 'repair');
});

check('C kaoLesson(skip-mastery, ünite): skippedAt yazar, masteryAt/taş yazmaz; sıradaki adım sonraki ünite', () => {
  const u = bootUnit1Done();
  const milestonesBefore = JSON.stringify(u.data.quranLearn.milestones);
  assert.equal(u.api.kaoLesson('skip-mastery', 1), true);
  const rec = unitRecord(u);
  assert.match(rec.skippedAt, ISO);
  assert.equal(rec.masteryAt, null);
  assert.equal(JSON.stringify(u.data.quranLearn.milestones), milestonesBefore, 'atlamak taş kazandırmaz');
  const next = u.api.kaoNextStep(NOW.toISOString());
  assert.equal(next.kind, 'next-unit');
  assert.equal(u.api.kaoLesson('skip-mastery', 999), false, 'bilinmeyen ünite');
});

check('C atlama geçilmiş ustalığı bozmaz', () => {
  const u = bootUnit1Done();
  runMastery(u, 0); u.api.kaoLesson('finish');
  const before = JSON.stringify(unitRecord(u));
  assert.equal(u.api.kaoLesson('skip-mastery', 1), true);
  assert.equal(JSON.stringify(unitRecord(u)), before, 'geçilmiş ünitede kayıt aynı');
});

check('C 12 ünite simülasyonu: Bugün adımı her ünitede ilerler, Ünite 3 kaldı → onarım → geçti, sonunda "Tüm üniteler tamam"', () => {
  const u = bootKao();
  freshUser(u);
  const masterySteps = [], kinds = [];
  let failedOnce = false, finalTitle = '', guard = 0;
  // Saat sabit (harness todayStr de sabit): her oturumdan sonra günün sessionDone'ı sıfırlanır → "yeni gün" benzetimi
  // (ısınma/boşluk adımı ve gerçek takvim bağımlılığı olmadan).
  const nextDay = () => { const day = u.data.quranLearn.daily[u.NOW.slice(0, 10)]; if (day) day.sessionDone = false; };
  for (; guard < 400; guard += 1) {
    const step = u.api.kaoNextStep(u.NOW);
    kinds.push(step.kind);
    if (step.kind === 'rest') { finalTitle = step.title; break; }
    assert.ok(['daily', 'next-unit', 'mastery', 'repair'].includes(step.kind), `beklenmeyen adım: ${step.kind} (${step.title})`);
    if (step.kind === 'mastery') {
      masterySteps.push(step.param);
      const failNow = step.param === 3 && !failedOnce;
      if (failNow) failedOnce = true;
      assert.equal(u.api.kaoLesson('start', step.param), true, `ustalık ${step.param} açılmalı`);
      let seen = 0;
      const answer = (task) => { const wrongNow = failNow && seen < 5; seen += 1; return (wrongNow ? task.choices.find((c) => !c.correct) : task.choices.find((c) => c.correct)).choiceId; };
      assert.equal(walkLesson(u, step.param, { answer }), true);
      u.api.kaoLesson('finish'); nextDay();
      continue;
    }
    const lessonId = step.param;
    assert.equal(walkLesson(u, lessonId, { answer: 'correct' }), true, `${step.kind} ${lessonId} oynatılmalı`);
    u.api.kaoLesson('finish'); nextDay();
  }
  assert.ok(guard < 400, 'sıradaki adım döngüye girdi');
  assert.equal(finalTitle, 'Tüm üniteler tamam ✓');
  const unique = [...new Set(masterySteps)];
  assert.deepEqual(unique, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'ustalık adımları ünite sırasıyla ilerledi');
  assert.equal(masterySteps.filter((id) => id === 3).length, 2, 'Ünite 3 iki kez (kaldı + geçti)');
  assert.ok(kinds.includes('repair'), 'onarım adımı görüldü');
  assert.equal(kinds.indexOf('repair') > kinds.indexOf('mastery'), true);
  const units = u.data.quranLearn.path.units;
  for (let id = 1; id <= 12; id += 1) assert.match(units[String(id)].masteryAt, ISO, `Ünite ${id} ustalık kaydı`);
  assert.equal(units['3'].attempts, 2);
  assert.equal(units['3'].repair, null);
});

const partC = passed;

// ---- Bölüm D — görünümler, taşlar ve dokunarak uçtan uca geçiş (K2F-08) ------------------------------
const { openView, tap, tapPrimary, tapSecondary, playLesson, countClass, text } = require('./helpers/kao-harness');
const unit1Title = () => curriculum.units[0].title;
const masteryState = (html) => (/data-mastery-state="(\w+)"/.exec(html) || [])[1];
const unitHtml = (u, id = 1) => openView(u, 'unit', id).html;
const homeHtml = (u) => { u.ui.kaoOpen = false; u.ui.kaoStack = []; u.ui.kaoView = 'home'; u.api.kaoOpen('home'); return u.api.kaoOverlayHTML(u.NOW); };
const nextDay = (u) => { const day = u.data.quranLearn.daily[u.NOW.slice(0, 10)]; if (day) day.sessionDone = false; };

check('D(a) Ünite ekranı: dersler listesinden AYRI "Ustalık" satırı; dersler bitmeden kilitli ○, içerik başlığında "Ustalık:" öneki yok', () => {
  const u = bootKao();
  const q = freshUser(u);
  unitOf(1).lessons.slice(0, 2).forEach((l) => { q.path.lessons[l.id] = { startedAt: AT, doneAt: AT, score: 1, introducedLemmas: l.lemmaIds.slice() }; });
  const html = unitHtml(u);
  assert.equal(masteryState(html), 'locked');
  assert.match(text(html), /Ustalık/);
  assert.doesNotMatch(text(html), /Ustalık: /, 'ders başlıklarında "Ustalık:" öneki olmamalı (lesson.mastery yok sayılır)');
  assert.equal(countClass(html, 'kao-primary'), 1, 'ekran başına ≤1 birincil');
  assert.ok(html.indexOf('kao-unit-mastery') > html.indexOf('kao-unit-steps'), 'ustalık satırı ders listesinden sonra, ayrı bölümde');
});

check('D(a) Ustalık satırı durumları: sırada ●, geçti ✓ (%puan), atlandı, onarım', () => {
  const cur = bootUnit1Done();
  assert.equal(masteryState(unitHtml(cur)), 'current');
  const passed1 = bootUnit1Done();
  passed1.data.quranLearn.path.units['1'] = { masteryAt: AT, masteryScore: 0.9, attempts: 1, lastAttemptAt: AT, repair: null, skippedAt: null };
  const ph = unitHtml(passed1);
  assert.equal(masteryState(ph), 'passed');
  assert.match(text(ph), /Ustalık geçildi/);
  assert.match(text(ph), /%90/);
  const skipped = bootUnit1Done();
  skipped.api.kaoLesson('skip-mastery', 1);
  const sh = unitHtml(skipped);
  assert.equal(masteryState(sh), 'skipped');
  assert.match(text(sh), /Atlandı/);
  const repair = bootRepairUser(U1().slice(0, 2));
  const rh = unitHtml(repair);
  assert.equal(masteryState(rh), 'repair');
  assert.match(text(rh), /Onarım/);
});

check('D(a) Ünite ekranının tek birincil düğmesi: dersler bitince "Ustalığa başla" (ünite), onarımda "Onarım turuna başla"', () => {
  const cur = bootUnit1Done();
  const h = unitHtml(cur);
  assert.equal(countClass(h, 'kao-primary'), 1);
  assert.match(text(h), /Ustalığa başla/);
  const tapped = tapPrimary(cur);
  assert.deepEqual([tapped.name, tapped.args], ['kaoLesson', ['start', 1]], 'birincil düğme ünite ustalığını başlatır');
  assert.equal(cur.ui.kaoLesson.kind, 'mastery');
  const rep = bootRepairUser(U1().slice(0, 2));
  const rh = unitHtml(rep);
  assert.equal(countClass(rh, 'kao-primary'), 1);
  assert.match(text(rh), /Onarım turuna başla/);
  assert.ok(/repair:1/.test(rh), 'onarım eylemi repair:<id>');
});

check('D(b) Bugün kahramanı (mastery): tek birincil "Ustalığa başla" + ikincil "Şimdilik atla" (skip-mastery); ≤1 .kao-primary', () => {
  const u = bootUnit1Done();
  const h = homeHtml(u);
  assert.equal(countClass(h, 'kao-primary'), 1);
  assert.equal(countClass(h, 'kao-hero-secondary'), 1);
  assert.match(text(h), /Ustalığa başla/);
  assert.match(text(h), /Şimdilik atla/);
  const primary = tapPrimary(u);
  assert.deepEqual([primary.name, primary.args], ['kaoLesson', ['start', 1]]);
  assert.equal(u.ui.kaoLesson.kind, 'mastery');
  const v = bootUnit1Done();
  homeHtml(v);
  const secondary = tapSecondary(v);
  assert.deepEqual([secondary.name, secondary.args], ['kaoLesson', ['skip-mastery', 1]]);
  assert.equal(secondary.ok, true);
  assert.match(v.data.quranLearn.path.units['1'].skippedAt, ISO);
});

check('D(b) Bugün kahramanı (repair) onarım düğmesi gösterir, atla düğmesi yok', () => {
  const u = bootRepairUser(U1().slice(0, 2));
  const h = homeHtml(u);
  assert.match(text(h), /Onarım turuna başla/);
  assert.equal(countClass(h, 'kao-hero-secondary'), 0);
  assert.equal(countClass(h, 'kao-primary'), 1);
});

check('D(c) ustalık özeti: "10 sorudan N doğru", geçti → tek taş satırı + sıradaki adım; kaldı → onarım cümlesi', () => {
  const pass = bootUnit1Done();
  runMastery(pass, 1);
  const ph = pass.api.kaoOverlayHTML(pass.NOW);
  assert.match(text(ph), /10 sorudan 9 doğru/);
  assert.match(text(ph), /Ustalık geçildi/);
  assert.equal((text(ph).match(/Bir kilometre taşını tamamladın/g) || []).length, 1, 'tek sakin taş satırı');
  assert.match(text(ph), new RegExp(`${unit1Title()} ünitesini bitirdim`));
  assert.match(text(ph), /Sıradaki adım/);
  assert.equal(countClass(ph, 'kao-primary'), 1);
  const fail = bootUnit1Done();
  runMastery(fail, 4);
  const fh = fail.api.kaoOverlayHTML(fail.NOW);
  assert.match(text(fh), /10 sorudan 6 doğru/);
  assert.match(text(fh), /onarım/i);
  assert.doesNotMatch(text(fh), /Bir kilometre taşını/);
});

check('D(d) Yol: aria-current="step" Flow\'un ünite tamam kuralıyla aynı üniteye (atlanan ünite sayılır)', () => {
  const u = bootUnit1Done();
  const current = (u2) => (/aria-current="step"[^>]*>(?:<[^>]+>)*Ünite (\d+)/.exec(openView(u2, 'units').html) || [])[1];
  assert.equal(current(u), '1', 'ders bitti ama ustalık yok → hâlâ Ünite 1');
  u.api.kaoLesson('skip-mastery', 1);
  assert.equal(current(u), '2', 'atlanınca Ünite 2');
  const p = bootUnit1Done();
  runMastery(p, 0); p.api.kaoLesson('finish');
  assert.equal(current(p), '2', 'geçince Ünite 2');
});

check('D(e) u<n> taşı yalnız ustalık geçilince; atlamak taş vermez; kaoPanelSummary.unitMilestones artar', () => {
  const skip = bootUnit1Done();
  skip.api.kaoLesson('skip-mastery', 1);
  assert.ok(!skip.data.quranLearn.milestones.u1, 'atlamak taş vermez');
  assert.equal(skip.api.kaoPanelSummary(skip.data).unitMilestones, 0);
  const failed = bootUnit1Done(); runMastery(failed, 5);
  assert.ok(!failed.data.quranLearn.milestones.u1, 'kalınca taş yok');
  const pass = bootUnit1Done();
  assert.equal(pass.api.kaoPanelSummary(pass.data).unitMilestones, 0);
  runMastery(pass, 0);
  assert.match(pass.data.quranLearn.milestones.u1, ISO, 'geçince u1 taşı');
  assert.equal(pass.api.kaoPanelSummary(pass.data).unitMilestones, 1);
  assert.ok(pass.ui.kaoLesson.earnedMilestones.includes('u1'), 'özet için kazanılan taş kaydı');
});

check('D(f) uçtan uca (sıfır kullanıcı): ilk açılıştan yalnız birincil düğmelerle Ünite 1 → ustalık → Ünite 2', () => {
  const u = bootKao();
  u.api.kaoOpen('home');
  let guard = 0;
  // Onboarding: birincil düğme ya da (seçim ekranlarında) ilk seçenek — kullanıcı yalnız dokunur.
  while (u.ui.kaoOnboard && guard++ < 40) { const t = tapPrimary(u) || tap(u, 'kao-onboard-option'); assert.ok(t && t.ok !== false, `onboarding dokunuşu çalışmalı (${guard})`); }
  assert.ok(!u.ui.kaoOnboard, 'onboarding bitti');
  const seen = [];
  for (guard = 0; guard < 120; guard += 1) {
    const step = u.api.kaoNextStep(u.NOW);
    seen.push(step.kind + ':' + step.param);
    if (step.kind === 'next-unit' && unitOf(2).lessons.some((l) => l.id === step.param)) break;
    homeHtml(u);
    const tapped = tapPrimary(u);
    assert.ok(tapped && tapped.ok, `Bugün birincil düğmesi çalışmalı: ${step.kind}`);
    assert.ok(u.ui.kaoLesson, `düğme oturum açmalı: ${step.kind}`);
    assert.equal(playLesson(u, { answer: 'correct' }), true);
    const done = tapPrimary(u); // özetin birincil düğmesi ("Bugün yeter")
    assert.ok(done && done.ok, 'özet düğmesi günü kapatmalı');
    nextDay(u);
  }
  assert.ok(guard < 120, 'Ünite 2\'ye ulaşılamadı');
  assert.ok(seen.includes('mastery:1'), `ustalık adımı görüldü: ${seen.join(' ')}`);
  assert.match(u.data.quranLearn.path.units['1'].masteryAt, ISO, 'Ünite 1 ustalığı dokunuşlarla geçildi');
  assert.match(u.data.quranLearn.milestones.u1, ISO);
});

check('D(f) uçtan uca (v1 kullanıcı Ü1–3 kartlı): ustalık teklif edilir, "Şimdilik atla" ile Ünite 4\'e ulaşır', () => {
  const u = bootKao();
  const cards = {};
  for (const unit of curriculum.units.slice(0, 3)) for (const l of unit.lessons) for (const id of l.lemmaIds) cards[`w:${id}:ar>tr`] = { state: 'review', s: 30, reps: 6, due: '2026-12-01T00:00:00.000Z' };
  u.data.quranLearn = { schemaVersion: 1, cards, daily: { '2026-09-29': { answered: 10, correct: 9 } } };
  const skipped = [];
  for (let i = 0; i < 6; i += 1) {
    const step = u.api.kaoNextStep(u.NOW);
    if (step.kind !== 'mastery') break;
    const h = homeHtml(u);
    assert.match(text(h), /Ustalığa başla/);
    assert.match(text(h), /Şimdilik atla/);
    skipped.push(step.param);
    assert.equal(tapSecondary(u).ok, true);
  }
  assert.deepEqual(skipped, [1, 2, 3], 'Ü1–3 ustalıkları sırayla atlandı');
  const after = u.api.kaoNextStep(u.NOW);
  const inUnit4 = unitOf(4).lessons.some((l) => l.id === after.param);
  assert.ok(inUnit4, `Ünite 4'e ulaşıldı: ${after.kind} ${after.param}`);
  for (const id of ['u1', 'u2', 'u3']) assert.ok(!u.data.quranLearn.milestones[id], `${id} taşı atlamakla verilmez`);
});

console.log(`test_kao2_mastery: bölüm A ${partA} + B ${partB - partA} + C ${partC - partB} + D ${passed - partC} = ${passed} kontrol PASS`);
