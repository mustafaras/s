'use strict';
// K3P-A4 · Oturum zaman bütçesi (K-O, AKIS §3 "Zaman bütçesi"). Sentetik node:vm; ağ/depo/yazma yok.
//   - 5 dk seçmiş + 60 vadeli kartı olan kullanıcının tahmini gerçek plan süresini gösterir.
//   - Isınma K3P-A3 kuralını korur (vadeli tekrarın en kararlı 3–5'i, en yüksek s).
//   - Bütçe kırpması ve kalan tekrarların plan sırası en düşük R'ye (unutulmaya en yakın) göre.
//   - Plana alınmayan kartlar ertesi gün yine vadeli ve kart verisi değişmemiş (yalnız plan sırası değişir).
const assert = require('node:assert/strict');
const { bootKao, freshUser, read, tap } = require('./helpers/kao-harness');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

const content = (t) => ({ curriculum: t.win.QuranCurriculumV2, lexicon: t.win.QuranLexiconV1, grammar: t.win.QuranGrammarV1, shorts: t.win.QuranShortSurahsV1, phonics: t.win.QuranPhonicsV1 });

// FSRS unutma eğrisi (motorla aynı formül; test motor sabitlerine dokunmaz, bağımsız hesaplar).
const retrievability = (elapsedDays, stability) => Math.pow(1 + (19 / 81) * elapsedDays / stability, -0.5);

// `count` vadeli kart kurar. s aralığı [12,62), son tekrar gün sayısı 1..count → R geniş yayılır.
function seedDue(t, count, { minutes = 5, msPerTask = 12000 } = {}) {
  const q = t.data.quranLearn || freshUser(t);
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
  return { flow, q, reviews, plan: flow.lessonPlan({ quranLearn: q }, lessonId, now, content(t), reviews) };
}
function dueFixtureReviews(q, now, limit = 60) {
  return Object.keys(q.cards).filter((id) => {
    const card = q.cards[id], due = new Date(card.due || 0).getTime();
    return card.orphan !== true && card.state !== 'new' && card.st !== 'new' && Number.isFinite(due) && due <= now.getTime();
  }).slice(0, limit).map((cardId) => ({ id: `fixture:${cardId}`, cardId, isNew: false }));
}
const taskCount = (plan) => plan.filter((i) => ['intro', 'practice', 'apply'].includes(i.kind) && i.group !== 'review').length;
const reviewItems = (plan) => plan.filter((i) => i.group === 'review');
const rOf = (q, cardId, nowMs) => {
  const c = q.cards[cardId];
  const days = Math.max(0, Math.trunc((nowMs - Date.parse(c.r)) / 86400000));
  return retrievability(days, c.s);
};

check('K3PD-05: gerçek toplam tahmin 13×30/60 sn için cap=5 ile maskelenmez; Bugün yalnız bütçeli parçayı gösterir', () => {
  for (const [msPerTask, expected] of [[30000, 7], [60000, 13]]) {
    const t = bootKao(); seedDue(t, 60, { minutes: 5, msPerTask });
    const lessonId = t.win.QuranCurriculumV2.units[0].lessons[0].id, { flow, q, reviews, plan } = planFor(t, lessonId);
    assert.ok(plan && plan.length, 'plan kurulmalı');
    assert.equal(flow.estimateMinutes({}, 13, new Date(t.NOW), 5, msPerTask), expected, `13 × ${msPerTask / 1000} sn = ${expected} dk`);
    const est = flow.estimateMinutes(q.daily, taskCount(plan), new Date(t.NOW), 5, msPerTask);
    assert.equal(est, Math.ceil(taskCount(plan) * msPerTask / 60000), `${taskCount(plan)} görev gerçek medyanla hesaplanmalı`);
    const now = new Date(t.NOW), part = flow.lessonPart({ quranLearn: q }, lessonId, now, content(t), reviews, { sessionMedianMs: msPerTask, usedMs: 0 });
    const selectedTasks = part.filter((item) => ['intro', 'practice', 'apply'].includes(item.kind)).length;
    const step = flow.nextStep({ quranLearn: q }, now, content(t), msPerTask, reviews, 0);
    assert.ok(step.minutes <= 5, `Bugün kartı seçili gerçek parçayı göstermeli: ${step.minutes} dk`);
    assert.equal(step.counts.tasks, selectedTasks, 'Bugün gerçek görev sayısı parça planıyla eşleşmeli');
    assert.equal(step.counts.reviews, reviewItems(part).length, 'Bugün tekrar sayısı parça planıyla eşleşmeli');
    assert.equal(step.minutes, Math.ceil(selectedTasks * msPerTask / 60000), 'Bugün dakika tahmini gerçek parça maliyetinden türemeli');
    assert.match(step.subtitle, /kişisel oturum medyanı/);
    t.api.kaoLesson('exit');
  }
});

check('dersin özü bütçeden önce ayrılır: yeni lemma tanışları ve kavram görevi korunur', () => {
  const t = bootKao(); seedDue(t, 0, { minutes: 5 });
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
  const t = bootKao(), q = seedDue(t, 60, { minutes: 5 }), lessonId = t.win.QuranCurriculumV2.units[0].lessons[0].id;
  const reviews = dueFixtureReviews(q, new Date(t.NOW)), plan = t.win.SeymaQuranLearnFlow.lessonPlan({ quranLearn: q }, lessonId, new Date(t.NOW), content(t), reviews);
  const firstIntro = plan.findIndex((i) => i.kind === 'intro');
  const warm = plan.filter((i) => i.warmup === true);
  assert.ok(warm.length >= 3 && warm.length <= 5, `ısınma ${warm.length}`);
  assert.ok(warm.every((i) => i.group === 'review'), 'ısınma tekrar kartlarından');
  const stability = (i) => (q.cards[i.cardId] || {}).s;
  const rest = reviewItems(plan).filter((i) => !warm.includes(i));
  if (rest.length) assert.ok(Math.min(...warm.map(stability)) >= Math.max(...rest.map(stability)), 'ısınma en kararlıları seçer');
  t.api.kaoLesson('exit');
});

check('parça en düşük R\'li tekrarları seçer; en kararlı ısınma önceliği istisnadır', () => {
  const t = bootKao(), q = seedDue(t, 60, { minutes: 5 });
  const nowMs = Date.parse(t.NOW);
  const lessonId = t.win.QuranCurriculumV2.units[0].lessons[0].id, flow = t.win.SeymaQuranLearnFlow, reviews = dueFixtureReviews(q, new Date(t.NOW));
  const plan = flow.lessonPart({ quranLearn: q }, lessonId, new Date(t.NOW), content(t), reviews, { sessionMedianMs: 12000, usedMs: 0 });
  const placed = Array.from(reviewItems(plan), (i) => i.cardId);
  assert.ok(placed.length >= 3 && placed.length < reviews.length, `tekrar kırpılmalı: alınan ${placed.length} / sunulan ${reviews.length}`);
  // K3PD-04: kararlı ısınma önce; kalan kapasite en düşük R'li kartlara gider.
  const offered = reviews.map((i) => String(i.cardId));
  assert.ok(offered.length > 20, `küresel seçim için 20'den fazla vadeli aday (${offered.length})`);
  const byR = offered.slice().sort((a, b) => rOf(q, a, nowMs) - rOf(q, b, nowMs) || a.localeCompare(b));
  const warmIds = plan.filter((i) => i.warmup === true).map((i) => i.cardId);
  const nonWarmPlaced = placed.filter((id) => warmIds.indexOf(id) < 0);
  const lowestNonWarm = byR.filter((id) => warmIds.indexOf(id) < 0).slice(0, nonWarmPlaced.length);
  assert.equal(JSON.stringify(nonWarmPlaced), JSON.stringify(lowestNonWarm), 'ısınma dışı tekrarlar seçimde ve sırada en düşük R olmalı');
  const warmCards = reviews.filter((i) => warmIds.includes(String(i.cardId)));
  assert.ok(warmCards.length >= 3 && warmCards.length <= 5, `ısınma ${warmCards.length}`);
  assert.ok(Math.min(...warmCards.map((i) => q.cards[i.cardId].s)) >= Math.max(...reviews.filter((i) => !warmIds.includes(String(i.cardId))).map((i) => q.cards[i.cardId].s)), 'ısınma s değeri sunulanların en yükseği olmalı');
  assert.ok(placed.every((id) => offered.indexOf(id) >= 0), 'plana yalnız sunulan kartlar girer');
  t.api.kaoLesson('exit');
});

check('çekirdek görevlerden sonra kalan tekrarlar tam ve artan R sırasındadır', () => {
  const t = bootKao(), q = seedDue(t, 60, { minutes: 10 });
  const nowMs = Date.parse(t.NOW);
  const lessonId = t.win.QuranCurriculumV2.units[0].lessons[0].id, flow = t.win.SeymaQuranLearnFlow, reviews = dueFixtureReviews(q, new Date(t.NOW));
  const plan = flow.lessonPart({ quranLearn: q }, lessonId, new Date(t.NOW), content(t), reviews, { sessionMedianMs: 12000, usedMs: 0 });
  const end = plan.findIndex((i) => i.kind === 'partEnd'), selected = plan.slice(0, end < 0 ? undefined : end);
  const warm = selected.filter((i) => i.warmup === true), extra = selected.filter((i) => i.group === 'review' && !i.warmup);
  const coreLast = selected.reduce((last, item, index) => item.group !== 'review' && ['intro', 'practice', 'concept'].includes(item.kind) ? index : last, -1);
  assert.ok(extra.length >= 2, `en az iki düşük R tekrar sığmalı (${extra.length})`);
  assert.ok(extra.every((item, index) => index === 0 || rOf(q, extra[index - 1].cardId, nowMs) <= rOf(q, item.cardId, nowMs)), 'düşük R seçimleri tam artan sırada');
  assert.ok(selected.findIndex((i) => i.group === 'review' && !i.warmup) > coreLast, 'ek tekrarlar tüm çekirdek işten sonra gelmeli');
  assert.ok(warm.length >= 3 && warm.length <= 5, `ısınma ${warm.length}`);
  t.api.kaoLesson('exit');
});

check('parça dışındaki kartların plan öncesi due/reps/s ve ilerlemesi aynı; yarın da vadelidir', () => {
  const t = bootKao(); const q = seedDue(t, 60, { minutes: 5, msPerTask: 60000 });
  const lessonId = t.win.QuranCurriculumV2.units[0].lessons[0].id;
  const reviews = dueFixtureReviews(q, new Date(t.NOW));
  const beforeCards = JSON.parse(JSON.stringify(q.cards)), beforePath = JSON.parse(JSON.stringify(q.path));
  const plan = t.win.SeymaQuranLearnFlow.lessonPart({ quranLearn: q }, lessonId, new Date(t.NOW), content(t), reviews, { sessionMedianMs: 60000, usedMs: 0 });
  const placed = reviewItems(plan).map((i) => i.cardId);
  const leftover = reviews.map((i) => String(i.cardId)).filter((id) => placed.indexOf(id) < 0);
  assert.ok(leftover.length > 0, 'bütçe dışı kalan kart olmalı');
  assert.deepEqual(q.cards, beforeCards, 'Flow planı hiçbir kart alanını yazmamalı');
  assert.deepEqual(q.path, beforePath, 'Flow planı ilerleme/resume yazmamalı');
  leftover.forEach((id) => {
    for (const field of ['due', 'reps', 's']) assert.equal(q.cards[id][field], beforeCards[id][field], `${id}.${field} değişmemeli`);
    assert.ok(!q.cards[id].due || Date.parse(q.cards[id].due) <= Date.parse(t.NOW) + 86400000, `${id} yarın da vadeli kalmalı`);
  });
  t.api.kaoLesson('exit');
});

check('K3PD-04: runtime plan 20 sonrası adaylardaki en düşük R tekrarlarını da sıralar', () => {
  const t = bootKao(), q = seedDue(t, 30, { minutes: 5, msPerTask: 12000 });
  const now = new Date(t.NOW), nowMs = now.getTime(), lessonId = t.win.QuranCurriculumV2.units[0].lessons[0].id;
  t.win.QuranLexiconV1.lemmas.slice(0, 30).forEach((lemma) => {
    const forward = q.cards[`w:${lemma.id}:ar>tr`];
    q.cards[`w:${lemma.id}:tr>ar`] = Object.assign({}, forward);
  });
  const queueForToday = () => t.api.kaoBuildQueue(t.data, now, { sessionId: t.NOW.slice(0, 10), candidates: t.api.kaoCandidates(), dailyNew: 0 }).filter((item) => !item.isNew);
  const offered = queueForToday();
  assert.equal(offered.length, 60, 'en çok 60 vadeli aday runtime kuyruğuna ulaşmalı');
  const orderedIds = offered.map((item) => String(item.cardId));
  const firstTwenty = new Set(orderedIds.slice(0, 20));
  orderedIds.forEach((id, index) => {
    const card = q.cards[id];
    const daysAgo = index < 20 ? 1 : 60;
    card.s = index < 20 ? 62 : 1 + index - 20;
    card.r = new Date(nowMs - daysAgo * 86400000).toISOString();
  });
  assert.deepEqual(queueForToday().map((item) => String(item.cardId)), orderedIds, 'aday kuyruğu R fixture’ından bağımsız kalmalı');
  assert.ok(orderedIds.slice(20).every((id) => rOf(q, id, nowMs) < rOf(q, orderedIds[0], nowMs)), 'ilk 20 dışındaki adaylar daha düşük R taşımalı');

  assert.equal(t.api.kaoLesson('start', lessonId), true, 'gerçek ders başlatıcısı planı kurmalı');
  const plan = t.ui.kaoLesson.plan, plannedReviews = plan.filter((item) => item.group === 'review');
  const warmIds = new Set(plannedReviews.filter((item) => item.warmup === true).map((item) => item.cardId));
  const extraIds = plannedReviews.filter((item) => item.warmup !== true).map((item) => item.cardId);
  assert.ok(extraIds.length > 0, 'bütçe içinde ek tekrar seçilmeli');
  assert.ok(extraIds.some((id) => !firstTwenty.has(id)), 'ilk 20 kesilseydi en düşük R’li aday kaybolacaktı');
  const expected = orderedIds.filter((id) => !warmIds.has(id)).sort((a, b) => rOf(q, a, nowMs) - rOf(q, b, nowMs) || a.localeCompare(b)).slice(0, extraIds.length);
  assert.deepEqual(extraIds, expected, 'ısınma istisnası dışında bütün due havuzundan en düşük R seçilmeli');
  t.api.kaoLesson('exit');
});

check('K3PD-06: Bugün tahmini, gerçek bütçeli parçanın maliyeti ve görev sayısıyla eşleşir', () => {
  for (const msPerTask of [9000, 20000, 30000]) {
    const t = bootKao(); const q = seedDue(t, 60, { minutes: 5, msPerTask });
    const now = new Date(t.NOW), flow = t.win.SeymaQuranLearnFlow, cur = t.win.QuranCurriculumV2;
    const lessonId = cur.units[0].lessons[0].id, { reviews } = planFor(t, lessonId);
    const part = flow.lessonPart({ quranLearn: q }, lessonId, now, content(t), reviews, { sessionMedianMs: msPerTask, usedMs: 0 });
    const selectedTasks = part.filter((item) => ['intro', 'practice', 'apply'].includes(item.kind)).length;
    const step = flow.nextStep({ quranLearn: q }, now, content(t), msPerTask, reviews, 0);
    assert.equal(step.kind, 'daily', 'Bugün ders adımı önerilmeli');
    const expected = Math.ceil(selectedTasks * msPerTask / 60000);
    assert.equal(step.minutes, expected, `Bugün tahmini seçili görev maliyetini içermeli (ms ${msPerTask})`);
    assert.ok(step.minutes <= 5, `seçili parça bütçeyi aşmamalı: ${step.minutes} dk`);
    assert.match(step.subtitle, /kişisel oturum medyanı/);
    assert.equal(step.counts.tasks, selectedTasks, `görev sayısı parça planıyla aynı (ms ${msPerTask})`);
    assert.equal(step.counts.reviews, reviewItems(part).length, `tekrar sayısı parça planıyla aynı (ms ${msPerTask})`);
    t.api.kaoLesson('exit');
  }
});

check('Flow kaynakta yazma yok: plan saf, kart şeması/FSRS/migrate değişmez', () => {
  const src = read('app/core/quranLearnFlow.js');
  assert.doesNotMatch(src, /FSRS_WEIGHTS|migrate\(/, 'Flow FSRS sabitlerine ya da migrate\'e dokunmaz');
  assert.doesNotMatch(src, /\.due\s*=|\.cards\s*\[[^\]]*\]\s*=/, 'Flow kart vadesini/verisini yazmaz');
});

check('K3PD-06: 5/10/15 × yeni/yerleşik/borçlu × 60/30/6 sn gerçek parça maliyeti bütçeyi aşmaz', () => {
  const taskCost = (plan) => plan.reduce((n, item) => n + (['intro', 'practice', 'apply'].includes(item.kind) ? 1 : 0), 0);
  for (const minutes of [5, 10, 15]) for (const cohort of ['new', 'established', 'debt']) for (const msPerTask of [60000, 30000, 6000]) {
    const t = bootKao();
    const q = seedDue(t, cohort === 'new' ? 0 : (cohort === 'debt' ? 61 : 24), { minutes, msPerTask });
    q.daily[t.NOW.slice(0, 10)] = { answered: 0, correct: 0, ms: 0 };
    const lessonId = t.win.QuranCurriculumV2.units[0].lessons[0].id;
    const { flow, reviews } = planFor(t, lessonId);
    const plan = flow.lessonPart({ quranLearn: q }, lessonId, new Date(t.NOW), content(t), reviews, { sessionMedianMs: msPerTask, usedMs: 0 });
    const costMs = taskCost(plan) * msPerTask;
    assert.ok(costMs <= minutes * 60000, `${minutes} dk · ${cohort} · ${msPerTask / 1000} sn: ${taskCost(plan)} seçili görev = ${costMs} ms`);
    assert.ok(plan.some((item) => item.kind === 'partEnd' || item.kind === 'summary'), 'parça sonu veya tam özet açıkça bulunmalı');
    assert.equal(q.path.lessons[lessonId], undefined, 'Flow parçalarken resume/ilerleme yazmamalı');
    t.api.kaoLesson('exit');
  }
});

check('K3PD-04: kalan süreye tek sonraki görev sığmayınca otomatik başlamaz; Ayarlar ve açık aşım seçenekleri görünür', () => {
  const t = bootKao({ seeded: true }), q = t.data.quranLearn, day = t.NOW.slice(0, 10);
  q.onboarding.minutes = 5; q.daily[day] = { answered: 5, correct: 5, ms: 300000 };
  const blocked = t.api.kaoNextStep(new Date(t.NOW));
  assert.equal(blocked.kind, 'budget-blocked');
  assert.ok(blocked.minutes > 0 && /Sıradaki görev/.test(blocked.subtitle));
  t.ui.kaoStack = []; t.api.kaoOpen('home');
  const html = t.api.kaoOverlayHTML(t.NOW);
  assert.match(html, /Süreyi artır/);
  assert.match(html, /Süre aşımını kabul ederek devam et/);
  assert.equal(t.ui.kaoLesson, undefined, 'bütçe doluyken ders kendiliğinden açılmamalı');
  const settings = tap(t, 'kao-primary');
  assert.ok(settings && settings.ok && t.ui.kaoView === 'settings', 'birincil seçenek mevcut Ayarlar görünümünü açmalı');
  assert.match(t.api.kaoOverlayHTML(t.NOW), /Günlük süre/);
  assert.match(t.api.kaoOverlayHTML(t.NOW), /App\.kaoOnboard\(10\)/, 'mevcut onboarding handler günlük süreyi değiştirmeli');
  assert.equal(t.api.kaoOnboard(10), true);
  assert.equal(q.onboarding.minutes, 10);
  assert.equal(Object.keys(q.onboarding).includes('budgetMinutes'), false, 'yeni kalıcı alan eklenmemeli');

  const overrun = bootKao({ seeded: true }), overrunQ = overrun.data.quranLearn;
  overrunQ.onboarding.minutes = 5; overrunQ.daily[overrun.NOW.slice(0, 10)] = { answered: 5, correct: 5, ms: 300000 };
  overrun.ui.kaoStack = []; overrun.api.kaoOpen('home');
  const accepted = tap(overrun, 'kao-hero-secondary');
  assert.ok(accepted && accepted.ok && overrun.ui.kaoLesson, 'yalnız açık kullanıcı seçimi bir taşma parçası başlatmalı');
  const started = overrun.ui.kaoLesson.plan;
  assert.ok(started.some((item) => item.kind === 'partEnd' && item.overrun === true), 'aşım markerı dürüstçe planda kalmalı');
  assert.equal(overrunQ.path.lessons[overrun.ui.kaoLesson.lessonId].doneAt, null, 'tamamlanmayan ders doneAt almamalı');
  overrun.api.kaoLesson('exit');
});

console.log(`test_k3p_budget: PASS (${passed} kontrol — gerçek seçili parça, zaman bütçesi ve en düşük R önceliği)`);
