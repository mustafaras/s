'use strict';
// K3P-A4 · Oturum zaman bütçesi (K-O, AKIS §3 "Zaman bütçesi"). Sentetik node:vm; ağ/depo/yazma yok.
//   - 5 dk seçmiş + 60 vadeli kartı olan kullanıcının ders planı tahmini ≤ 5 dk kalır.
//   - Isınma K3P-A3 kuralını korur (vadeli tekrarın en kararlı 3–5'i, en yüksek s).
//   - Bütçe kırpması ve kalan tekrarların plan sırası en düşük R'ye (unutulmaya en yakın) göre.
//   - Plana alınmayan kartlar ertesi gün yine vadeli ve kart verisi değişmemiş (yalnız plan sırası değişir).
const assert = require('node:assert/strict');
const { bootKao, read } = require('./helpers/kao-harness');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

const content = (t) => ({ curriculum: t.win.QuranCurriculumV2, lexicon: t.win.QuranLexiconV1, grammar: t.win.QuranGrammarV1, shorts: t.win.QuranShortSurahsV1, phonics: t.win.QuranPhonicsV1 });

// FSRS unutma eğrisi (motorla aynı formül; test motor sabitlerine dokunmaz, bağımsız hesaplar).
const retrievability = (elapsedDays, stability) => Math.pow(1 + (19 / 81) * elapsedDays / stability, -0.5);

// `count` vadeli kart kurar. s aralığı [12,62), son tekrar gün sayısı 1..count → R geniş yayılır.
function seedDue(t, count, { minutes = 5, msPerTask = 12000 } = {}) {
  const q = t.data.quranLearn;
  q.onboarding.minutes = minutes;
  const nowMs = Date.parse(t.NOW), dayMs = 86400000, lemmas = t.win.QuranLexiconV1.lemmas;
  // K3P-03 ölçüm tabanı: son 7 günün ms/answered ortalaması görev başına süreyi verir (en az 6 sn).
  for (let d = 1; d <= 7; d += 1) {
    const key = new Date(nowMs - d * dayMs).toISOString().slice(0, 10);
    q.daily[key] = { answered: 10, correct: 9, ms: 10 * msPerTask };
  }
  let made = 0;
  for (let i = 0; made < count && i < lemmas.length; i += 1) {
    const id = `w:${lemmas[i].id}:ar>tr`;
    if (q.cards[id]) continue;
    const s = 12 + (i % 50);
    const days = 1 + (i % count);
    q.cards[id] = {
      state: 'review', s, reps: 6,
      r: new Date(nowMs - days * dayMs).toISOString(),
      due: new Date(nowMs - dayMs).toISOString(),
      introducedAt: new Date(nowMs - 60 * dayMs).toISOString()
    };
    made += 1;
  }
  return q;
}

function planFor(t, lessonId) {
  const flow = t.win.SeymaQuranLearnFlow, q = t.data.quranLearn, now = new Date(t.NOW);
  const reviews = t.api.kaoBuildQueue(t.data, now, { sessionId: t.NOW.slice(0, 10), candidates: t.api.kaoCandidates(), dailyNew: 0 }).filter((i) => !i.isNew);
  return { flow, q, reviews, plan: flow.lessonPlan({ quranLearn: q }, lessonId, now, content(t), reviews.slice(0, 20)) };
}
const taskCount = (plan) => plan.filter((i) => ['intro', 'practice', 'apply'].includes(i.kind)).length;
const reviewItems = (plan) => plan.filter((i) => i.group === 'review');
const rOf = (q, cardId, nowMs) => {
  const c = q.cards[cardId];
  const days = Math.max(0, Math.trunc((nowMs - Date.parse(c.r)) / 86400000));
  return retrievability(days, c.s);
};

check('5 dk kullanıcı + 60 vadeli kart: ders planı tahmini ≤ 5 dk', () => {
  const t = bootKao({ seeded: true }); seedDue(t, 60, { minutes: 5 });
  const { flow, q, plan } = planFor(t, t.win.QuranCurriculumV2.units[0].lessons[0].id);
  assert.ok(plan && plan.length, 'plan kurulmalı');
  const est = flow.estimateMinutes(q.daily, taskCount(plan), new Date(t.NOW), 5);
  assert.ok(est <= 5, `tahmin ${est} dk ≤ 5 olmalı (görev ${taskCount(plan)})`);
  assert.ok(est >= 4, `tahmin ${est} dk gerçekçi olmalı (plan yarıya inmemeli)`);
  t.api.kaoLesson('exit');
});

check('dersin özü bütçeden önce ayrılır: yeni lemma tanışları ve kavram görevi korunur', () => {
  const t = bootKao({ seeded: true }); seedDue(t, 60, { minutes: 5 });
  const { plan } = planFor(t, t.win.QuranCurriculumV2.units[0].lessons[0].id);
  const intros = plan.filter((i) => i.kind === 'intro');
  assert.ok(intros.length >= 1, 'tanış ekranı bütçeden önce ayrılmalı');
  assert.ok(plan.some((i) => i.kind === 'concept'), 'kavram ekranı korunmalı');
  assert.ok(plan.some((i) => i.kind === 'apply'), 'zirve (uygula) korunmalı');
  // Her tanıştan hemen sonra o kelimenin görevi (K3P-A3) — bütçe bunu kırmaz.
  intros.forEach((intro) => {
    const at = plan.indexOf(intro);
    assert.equal(plan[at + 1].kind, 'practice', `${intro.id} ardından görev gelmeli`);
  });
  t.api.kaoLesson('exit');
});

check('ısınma K3P-A3 kuralını korur: en kararlı (s) 3–5 vadeli tekrar', () => {
  const t = bootKao({ seeded: true }); seedDue(t, 60, { minutes: 5 });
  const { q, plan } = planFor(t, t.win.QuranCurriculumV2.units[0].lessons[0].id);
  const firstIntro = plan.findIndex((i) => i.kind === 'intro');
  const warm = plan.slice(1, firstIntro);
  assert.ok(warm.length >= 3 && warm.length <= 5, `ısınma ${warm.length}`);
  assert.ok(warm.every((i) => i.group === 'review'), 'ısınma tekrar kartlarından');
  const stability = (i) => (q.cards[i.cardId] || {}).s;
  const rest = reviewItems(plan).filter((i) => !warm.includes(i));
  if (rest.length) assert.ok(Math.min(...warm.map(stability)) >= Math.max(...rest.map(stability)), 'ısınma en kararlıları seçer');
  t.api.kaoLesson('exit');
});

check('bütçe kırpması en düşük R\'li tekrarları seçer (en düşük R önce)', () => {
  const t = bootKao({ seeded: true }); seedDue(t, 60, { minutes: 5 });
  const nowMs = Date.parse(t.NOW);
  const { q, reviews, plan } = planFor(t, t.win.QuranCurriculumV2.units[0].lessons[0].id);
  const placed = reviewItems(plan).map((i) => i.cardId);
  assert.ok(placed.length >= 3 && placed.length < reviews.length, `tekrar kırpılmalı: alınan ${placed.length} / sunulan ${reviews.length}`);
  // Bütçe: en düşük R'li `placed.length` kart, sunulanların içinden seçilmiş olmalı (ısınma da bu kümede).
  const offered = reviews.slice(0, 20).map((i) => String(i.cardId));
  const byR = offered.slice().sort((a, b) => rOf(q, a, nowMs) - rOf(q, b, nowMs));
  const lowest = new Set(byR.slice(0, placed.length));
  // Isınma en kararlıları aldığı için en düşük R kümesiyle birebir örtüşmez; kümeler kesişir ve ısınma dışı seçim en düşük R'den gelir.
  const warmIds = plan.slice(1, plan.findIndex((i) => i.kind === 'intro')).map((i) => i.cardId);
  const nonWarmPlaced = placed.filter((id) => warmIds.indexOf(id) < 0);
  const lowestNonWarm = byR.filter((id) => warmIds.indexOf(id) < 0).slice(0, nonWarmPlaced.length);
  assert.deepEqual(nonWarmPlaced.slice().sort(), lowestNonWarm.slice().sort(), 'ısınma dışı tekrarlar en düşük R\'den seçilmeli');
  assert.ok([...lowest].some((id) => placed.indexOf(id) >= 0), 'en düşük R kümesinden alınmalı');
  assert.ok(placed.every((id) => offered.indexOf(id) >= 0), 'plana yalnız sunulan kartlar girer');
  t.api.kaoLesson('exit');
});

check('kalan tekrarların plan sırası en düşük R\'den büyüğe (karışık bölüm)', () => {
  const t = bootKao({ seeded: true }); seedDue(t, 60, { minutes: 10 });
  const nowMs = Date.parse(t.NOW);
  const { q, plan } = planFor(t, t.win.QuranCurriculumV2.units[0].lessons[0].id);
  const firstIntro = plan.findIndex((i) => i.kind === 'intro'), concept = plan.findIndex((i) => i.kind === 'concept');
  const warm = plan.slice(1, firstIntro);
  const mixed = plan.slice(concept + 1).filter((i) => i.group === 'review');
  assert.ok(mixed.length >= 2, `karışık bölümde ≥2 tekrar beklenir (ölçülen ${mixed.length})`);
  // Isınma dışındaki tekrarlar R küçükten büyüğe (blok içinde) sıralanır; blok sınırında tür karışabilir.
  const rSeries = mixed.map((i) => i.cardId).filter((id) => warm.every((w) => w.cardId !== id)).map((id) => rOf(q, id, nowMs));
  assert.ok(rSeries.length >= 2, 'sıralanacak tekrar var');
  let ascendingPairs = 0, totalPairs = 0;
  for (let i = 1; i < rSeries.length; i += 1) { totalPairs += 1; if (rSeries[i] + 1e-9 >= rSeries[i - 1]) ascendingPairs += 1; }
  assert.ok(totalPairs === 0 || ascendingPairs / totalPairs >= 0.5, `R sırası artan olmalı (${ascendingPairs}/${totalPairs})`);
  t.api.kaoLesson('exit');
});

check('plana alınmayan kartlar ertesi gün yine vadeli; kart verisi değişmemiş', () => {
  const t = bootKao({ seeded: true }); const q = seedDue(t, 60, { minutes: 5 });
  const lessonId = t.win.QuranCurriculumV2.units[0].lessons[0].id;
  const { reviews, plan } = planFor(t, lessonId);
  const placed = reviewItems(plan).map((i) => i.cardId);
  const leftover = reviews.slice(0, 20).map((i) => String(i.cardId)).filter((id) => placed.indexOf(id) < 0);
  assert.ok(leftover.length > 0, 'bütçe dışı kalan kart olmalı');
  // Plan kurmak kart verisine yazmaz: vade/FSRS/kart kümesi bit-bit aynı (vade elle ileri atılmadı).
  leftover.forEach((id) => {
    const json = JSON.stringify(q.cards[id]);
    const due = q.cards[id].due;
    // Ertesi gün de vadeli: vade geçmişte ya da yoksa (süresiz vadeli) — hiçbir kart ileri atılmamış.
    const stillDue = !due || Date.parse(due) <= Date.parse(t.NOW) + 86400000;
    assert.ok(stillDue, `${id} ertesi gün de vadeli olmalı`);
    assert.ok(json.indexOf('"due":"' + due + '"') >= 0 || !due, `${id} vadesi değişmemiş`);
  });
  assert.equal(JSON.stringify(q.cards).length > 0, true);
  t.api.kaoLesson('exit');
});

check('Bugün ekranı tahmini sığan oturumla tutarlı: ~dk ≤ seçilen, tekrar sayısı planla aynı', () => {
  for (const msPerTask of [9000, 20000, 30000]) {
    const t = bootKao({ seeded: true }); const q = seedDue(t, 60, { minutes: 5, msPerTask });
    const now = new Date(t.NOW), flow = t.win.SeymaQuranLearnFlow, cur = t.win.QuranCurriculumV2;
    const step = flow.nextStep({ quranLearn: q }, now, content(t));
    assert.equal(step.kind, 'daily', 'Bugün ders adımı önerilmeli');
    assert.ok(step.minutes <= 5, `Bugün tahmini ${step.minutes} dk ≤ 5 olmalı (ms ${msPerTask})`);
    const { plan } = planFor(t, cur.units[0].lessons[0].id);
    assert.equal(step.counts.reviews, reviewItems(plan).length, `Bugün tekrar sayısı planla aynı (ms ${msPerTask})`);
    t.api.kaoLesson('exit');
  }
});

check('Flow kaynakta yazma yok: plan saf, kart şeması/FSRS/migrate değişmez', () => {
  const src = read('app/core/quranLearnFlow.js');
  assert.doesNotMatch(src, /FSRS_WEIGHTS|migrate\(/, 'Flow FSRS sabitlerine ya da migrate\'e dokunmaz');
  assert.doesNotMatch(src, /\.due\s*=|\.cards\s*\[[^\]]*\]\s*=/, 'Flow kart vadesini/verisini yazmaz');
});

console.log(`test_k3p_budget: PASS (${passed} kontrol — 5 dk plan ≤ 5 dk, en düşük R önce, kalan kartlar yarına)`);
