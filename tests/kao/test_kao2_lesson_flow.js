'use strict';

// KAO2-12: ders planı ve oynatıcı; sentetik durum, sabit saat, DOM/ağ yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const NOW_MS = Date.parse('2026-09-29T09:00:00.000Z');
class ClockDate extends Date {
  constructor(...args) { super(...(args.length ? args : [NOW_MS])); }
  static now() { return NOW_MS; }
}
const sandbox = { window: {}, Date: ClockDate, Math, Number, String, Object, Array, JSON };
vm.createContext(sandbox);
for (const relative of [
  'app/content/quranLexiconV1.js',
  'app/content/quranGrammarV1.js',
  'app/content/quranShortSurahsV1.js',
  'app/content/quranPhonicsV1.js',
  'app/content/quranCurriculumV2.js',
  'app/core/quranLearnFlow.js',
  'app/core/quranLearnViews.js',
  'app/core/quranLearn.js'
]) vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), sandbox, { filename: relative });

const { window: win } = sandbox;
const api = win.SeymaQuranLearn;
const flow = win.SeymaQuranLearnFlow;
const curriculum = win.QuranCurriculumV2;
const now = new ClockDate(NOW_MS);
const content = {
  curriculum,
  lexicon: win.QuranLexiconV1,
  grammar: win.QuranGrammarV1,
  shorts: win.QuranShortSurahsV1,
  phonics: win.QuranPhonicsV1,
  audioLemmas: Object.fromEntries(win.QuranLexiconV1.lemmas.map((lemma) => [lemma.id, true]))
};
const lesson = curriculum.units[0].lessons[0];
const plain = (value) => JSON.parse(JSON.stringify(value));

assert.equal(typeof flow.lessonPlan, 'function', 'Flow.lessonPlan eksik');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }
function freshQ() {
  const q = api.ensureQuranLearn({});
  q.onboarding.doneAt = '2026-09-20T10:00:00.000Z';
  q.onboarding.start = 'level1';
  q.settings.dailyNew = 5;
  return q;
}

check('sıra: hedef → yeni kelimelerin tanışı → kavram → pekiştir → uygula → özet', () => {
  const q = freshQ(), before = JSON.stringify(q);
  const plan = flow.lessonPlan({ quranLearn: q }, lesson.id, now, content);
  assert.equal(JSON.stringify(q), before, 'ders planı veriyi değiştirdi');
  assert.equal(plan[0].kind, 'goal'); assert.equal(plan.at(-2).kind, 'apply'); assert.equal(plan.at(-1).kind, 'summary');
  const conceptAt = plan.findIndex((item) => item.kind === 'concept');
  const practiceAt = plan.findIndex((item) => item.kind === 'practice');
  assert.ok(conceptAt > 0 && conceptAt < practiceAt, 'kavram tanıtımı pekiştirmeden önce');
  assert.ok(plan.slice(conceptAt + 1, practiceAt).every((item) => item.kind === 'intro'));
  assert.equal(plan[0].lessonId, lesson.id);
});

check('A-2: her yeni lemma kendi tanış kartından sonra ilk kez pekiştirilir', () => {
  const q = freshQ(), plan = flow.lessonPlan({ quranLearn: q }, lesson.id, now, content);
  const intros = plan.filter((item) => item.kind === 'intro');
  const practices = plan.filter((item) => item.kind === 'practice');
  const wordPractice = practices.filter((item) => item.group === 'lemma');
  assert.deepEqual(plain(intros.map((item) => item.lemmaId)), plain(lesson.lemmaIds));
  for (const intro of intros) {
    const first = plan.findIndex((item) => item.kind === 'practice' && item.lemmaId === intro.lemmaId);
    assert.ok(first > plan.indexOf(intro), `${intro.lemmaId} tanış kartından önce pekiştirme var`);
  }
  assert.ok(wordPractice.length >= lesson.lemmaIds.length);
});

check('pekiştirme: 6–10 görev; ilk görev 2, diğerleri 4 seçenek; yön sırası sabit', () => {
  const q = freshQ(), plan = flow.lessonPlan({ quranLearn: q }, lesson.id, now, content);
  const items = plan.filter((item) => item.kind === 'practice');
  assert.ok(items.length >= 6 && items.length <= 10, `görev sayısı ${items.length}`);
  assert.equal(items[0].choiceCount, 2); assert.ok(items.slice(1).every((item) => item.choiceCount === 4));
  const ranks = items.map((item) => item.group === 'concept' ? 3 : item.direction === 'ar>tr' ? 0 : item.direction === 'audio>meaning' ? 1 : 2);
  assert.deepEqual(plain(ranks), [...plain(ranks)].sort((a, b) => a - b), 'ar>tr → ses→anlam → tr>ar → kavram blokları');
  const grammar = items.filter((item) => item.group === 'concept');
  assert.ok(grammar.length >= 1);
  assert.ok(grammar.every((item) => plan.indexOf(item) > plan.findIndex((value) => value.kind === 'concept')));
  assert.ok(items.filter((item) => item.direction === 'audio>meaning').every((item) => content.audioLemmas[item.lemmaId]));
});

check('uygula: kaynak metni kelime kelime; yeni, bilinen ve açık durumları ayrılır', () => {
  const q = freshQ(), source = content.shorts.prayerTexts.find((item) => item.id === lesson.apply.ref);
  const knownId = lesson.lemmaIds[0];
  q.cards[`w:${knownId}:ar>tr`] = { state: 'review', s: 3, reps: 1, introducedAt: '2026-09-20T10:00:00.000Z' };
  const plan = flow.lessonPlan({ quranLearn: q }, lesson.id, now, content);
  const apply = plan.find((item) => item.kind === 'apply');
  assert.equal(apply.ref.ref, lesson.apply.ref);
  assert.deepEqual(plain(apply.words.map(({ ar, tr, lemmaId }) => ({ ar, tr, lemmaId }))), plain(source.words.map(({ ar, tr, lemmaId }) => ({ ar, tr, lemmaId }))));
  assert.equal(apply.words.find((item) => item.lemmaId === knownId).state, 'known');
  assert.ok(apply.words.some((item) => item.state === 'new'));
});

check('dailyNew sınırı: yeni tanış kartı sayısı ayar sınırını aşmaz', () => {
  const q = freshQ(); q.settings.dailyNew = 2;
  const plan = flow.lessonPlan({ quranLearn: q }, lesson.id, now, content);
  assert.equal(plan.filter((item) => item.kind === 'intro').length, 2);
  assert.equal(plan[0].newLemmaIds.length, 2);
});

check('öğrenilmiş lemma için tekrar tanış kartı üretilmez', () => {
  const q = freshQ();
  lesson.lemmaIds.forEach((id) => { q.cards[`w:${id}:ar>tr`] = { state: 'review', s: 8, reps: 2, introducedAt: '2026-09-20T10:00:00.000Z' }; });
  const plan = flow.lessonPlan({ quranLearn: q }, lesson.id, now, content);
  assert.equal(plan.filter((item) => item.kind === 'intro').length, 0);
  assert.equal(plan.find((item) => item.kind === 'goal').newLemmaIds.length, 0);
});

check('ilerleme: tanış kaydı tek başına dersi bitirmez; oturum FSRS kartını yeni sayar', () => {
  const q = freshQ();
  q.path.lessons[lesson.id] = { startedAt: '2026-09-29T08:00:00.000Z', introducedLemmas: [lesson.lemmaIds[0]], score: null };
  const plan = flow.lessonPlan({ quranLearn: q }, lesson.id, now, content);
  assert.deepEqual(plain(plan.filter((item) => item.kind === 'intro').map((item) => item.lemmaId)), plain(lesson.lemmaIds.slice(1)));
  assert.equal(plan.find((item) => item.kind === 'practice' && item.lemmaId === lesson.lemmaIds[0]).isNew, true);
  const progress = flow.lessonProgress(q, lesson.id, content);
  assert.equal(progress.introduced, 1); assert.equal(progress.done, false);
  q.path.lessons[lesson.id].doneAt = '2026-09-29T09:00:00.000Z';
  assert.equal(flow.lessonProgress(q, lesson.id, content).done, true);
});

check('oynatıcı: vadeli tekrar önce; intro → FSRS pekiştirme; çıkışta aynı görev; sesli soru Arapçayı saklar', () => {
  const q = freshQ(), reviewLemma = win.QuranLexiconV1.lemmas.find((item) => !lesson.lemmaIds.includes(item.id));
  const reviewCard = `w:${reviewLemma.id}:ar>tr`;
  q.cards[reviewCard] = { state: 'review', s: 8, reps: 2, due: '2026-09-28T00:00:00.000Z', introducedAt: '2026-09-20T00:00:00.000Z' };
  const data = { settings: {}, days: {}, quranLearn: q }, ui = { kaoView: 'home' }, state = { saves: 0, renders: 0 };
  assert.equal(api.registerQuranLearn({ data: () => data, ui: () => ui, save() { state.saves += 1; }, render() { state.renders += 1; }, todayStr: () => '2026-09-29', esc: (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])), icon: () => '', getDay: () => ({}) }), true);
  assert.equal(api.kaoLesson('start', lesson.id), true);
  assert.equal(ui.kaoLesson.phase, 'review');
  assert.equal(ui.kaoQueue.length, 1, 'bir vadeli kart tekrar kuyruğunun başında');
  const review = ui.kaoTasks[ui.kaoQueue[0].id];
  assert.equal(review.cardId, reviewCard);
  assert.equal(api.kaoAnswer(review.id, review.choices.find((choice) => choice.correct).choiceId).correct, true);
  assert.equal(api.kaoContinue(), true);
  assert.equal(ui.kaoLesson.phase, 'lesson'); assert.equal(ui.kaoLesson.plan[ui.kaoLesson.at].kind, 'goal');
  while (ui.kaoLesson.phase === 'lesson' && ui.kaoLesson.plan[ui.kaoLesson.at].kind !== 'practice') api.kaoLesson('next');
  assert.equal(ui.kaoLesson.phase, 'practice');
  const firstItem = ui.kaoQueue[0], firstTask = ui.kaoTasks[firstItem.id];
  assert.equal(firstTask.choices.length, 2, 'ilk pekiştirme iki seçenekli');
  assert.ok(q.path.lessons[lesson.id].introducedLemmas.length > 0, 'tanış ilerlemesi saklandı');
  const fsrs = api.kaoAnswer(firstTask.id, firstTask.choices.find((choice) => choice.correct).choiceId);
  assert.equal(fsrs.correct, true); assert.ok(q.cards[firstTask.cardId].reps >= 1, 'cevap mevcut FSRS yolundan geçti');
  assert.equal(q.daily['2026-09-29'].new, 1, 'yeni ders cevabı günlük yeni sayacına yazıldı');
  const currentId = ui.kaoQueue[ui.kaoTaskIndex].id;
  assert.equal(api.kaoLesson('exit'), true);
  assert.equal(ui.kaoView, 'home'); assert.equal(q.path.lessons[lesson.id].resume.phase, 'practice');
  assert.equal(api.kaoLesson('start', lesson.id), true);
  assert.equal(ui.kaoQueue[ui.kaoTaskIndex].id, currentId, 'yeniden giriş aynı görevden sürer');
  const audioPlan = ui.kaoLesson.plan.find((item) => item.audioOnly);
  const audioTask = api.kaoBuildTask({ id: audioPlan.id, cardId: audioPlan.cardId, isNew: true }, data, { seed: audioPlan.id, choiceCount: 2, audioOnly: true });
  assert.equal(audioTask.choices.length, 2); assert.equal(audioTask.audioOnly, true);
  const html = api.kaoTaskHTML(audioTask);
  assert.match(html, /Dinlediğin kelimenin anlamını seç/); assert.match(html, /class="kao-audio"/);
  assert.doesNotMatch(html, /lang="ar"|data-kao-ar/, 'ses sorusu cevaptan önce Arapça metni açığa çıkarmaz');
  assert.ok(state.saves >= 4, 'ilerleme ve FSRS kaydı kalıcılaştırıldı');
});

console.log(`KAO2-12 lesson flow: PASS (${passed} kontrol)`);
