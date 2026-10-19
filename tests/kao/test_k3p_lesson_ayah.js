'use strict';

// K3P-13 (K-G) · Ders âyetle açılır ve kapanır. Üç bağımsız ölçüm:
//  1) REFERANS: her dersin açılış (goal) ve kapanış (apply) öğeleri AYNI âyet referansını taşır;
//     satırı (goal.words === apply.words) paylaşır. 109 ders taranır.
//  2) SATIR: dersin hedef lemmaları (ders lemmaları + yeni lemmalar) satırda bulunur; satır en çok 25
//     sözcüktür. Uymayan ders GEREKÇELİ istisna listesine girer; liste YALNIZ KÜÇÜLEBİLİR (bayat istisna kırmızı).
//  3) SUNUM: açılış ve kapanış ekranı aynı satırı `tezhipPage` ile çizer (öğreniliyor = yumuşak altın,
//     yeni = mürekkep); "Yaldızla" kelimeleri SIRAYLA yaldızlar; hareket azaltmada yaldız STATİK;
//     ses yoksa zamanlayıcıyla ilerler. Sentetik node:vm; ağ/depo yok.
const assert = require('node:assert/strict');
const { bootKao, freshUser, playLesson: playLessonRaw, text } = require('./helpers/kao-harness');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }
function startLessonForFixture(t, lessonId) {
  return t.api.kaoLesson('start', lessonId)
    || t.api.kaoLesson('start', lessonId, 'budget-overrun');
}
function playLesson(t, options = {}) {
  for (let guard = 0; guard < 40; guard += 1) {
    const state = t.ui.kaoLesson;
    if (!state) return false;
    const from = state.at || 0;
    const boundary = state.plan.findIndex((item, index) => index >= from && item.kind === 'partEnd');
    const target = options.stopAt
      ? state.plan.findIndex((item, index) => index >= from && item.kind === options.stopAt)
      : -1;
    const stopAt = target >= 0 && (boundary < 0 || target < boundary) ? options.stopAt : (boundary >= 0 ? 'partEnd' : options.stopAt);
    if (!playLessonRaw(t, Object.assign({}, options, { stopAt }))) return false;
    const currentState = t.ui.kaoLesson, current = currentState && currentState.plan[currentState.at || 0];
    if (current && current.kind === 'partEnd') {
      if (!t.api.kaoLesson('budget-overrun')) return false; // synthetic user explicitly accepts the displayed overrun
      continue;
    }
    return true;
  }
  return false;
}

// --- Gerekçeli istisnalar (yalnız küçülür) -------------------------------------------------
// SÖZCÜK: 25 sözcük sınırı, çapa metni olmayan derste yeni lemmaların doğrulanmış örnek cümlelerinin
// TOPLAM uzunluğudur (kaynak bir âyet değil, birkaç ayrı cümlenin birleşimidir). Varsayılan günlük yeni
// kelime (5) ile 95 örnek dersinin tamamı ≤ 25 sözcüktür → istisna YOK.
const WORD_EXEMPT = {};
// LEMMA: dersin bazı lemmaları, dersin çapa metninde (namaz/sûre) hiç geçmez — ders planı çapa metnine
// göre değil, dersin kendi lemmalarına göre kurulur. Çapa metni olmayan derste ise ders lemmalarından
// çapa "yeni lemma" olmayan biri, yeni lemmaların örnek cümlelerinde geçmez. Liste yalnız küçülür:
// ders düzelirse test kırmızıya döner ve satır silinir.
const LEMMA_EXEMPT = {
  'u02.01': '5 tekbir lemmasından 4\'ü tekbir metninde geçmez (ders planı çapa metnine göre kurulmaz).',
  'u02.02': '5 tahiyyat lemmasından 2\'si çapa metninde geçmez.',
  'u02.03': '6 tahiyyat lemmasından 4\'ü çapa metninde geçmez.',
  'u03.02': '5 İhlâs lemmasından 3\'ü çapa metninde geçmez.',
  'u03.05': '4 Felak lemmasından 2\'si çapa metninde geçmez.',
  'u06.29': 'Çapa metni yok; 6 ders lemmasından biri yeni lemmaların örnek cümlelerinde geçmez.',
  'u06.30': 'Çapa metni yok; 6 ders lemmasından biri yeni lemmaların örnek cümlelerinde geçmez.',
  'u08.09': 'Çapa metni yok; 6 ders lemmasından biri yeni lemmaların örnek cümlelerinde geçmez.',
  'u09.10': 'Çapa metni yok; 6 ders lemmasından biri yeni lemmaların örnek cümlelerinde geçmez.',
  'u09.11': 'Çapa metni yok; 6 ders lemmasından biri yeni lemmaların örnek cümlelerinde geçmez.',
};

// --- Satır kurulumu (üretim kuralının aynısı) ----------------------------------------------
const norm = (map, id) => map[id] || id;
function windowFor(applyKind, goal, lemmaById) {
  const ids = goal.lessonIds.concat(goal.newLemmaIds);
  const words = applyKind === 'examples' ? [] : goal.words;
  if (words.length) {
    let first = -1, last = -1;
    words.forEach((word, index) => { const id = word.mappedLemmaId || word.lemmaId; if (ids.indexOf(id) >= 0) { if (first < 0) first = index; last = index; } });
    if (first >= 0) return words.slice(first, last + 1);
  }
  const out = [];
  const exampleIds = goal.newLemmaIds.length ? goal.newLemmaIds : goal.lessonIds;
  exampleIds.forEach((id) => { const lemma = lemmaById(id); const example = lemma && lemma.verified === true && lemma.examples && lemma.examples[0]; if (!example) return; example.ar.split(/\s+/).filter(Boolean).forEach(() => out.push({ lemmaId: id, mappedLemmaId: id })); });
  return out;
}

check('K3P-13 referans: 109 dersin açılış ve kapanışı AYNI âyet referansını ve AYNI satırı paylaşır', () => {
  const t = bootKao();
  const q = freshUser(t);
  const flow = t.win.SeymaQuranLearnFlow;
  const content = { curriculum: t.win.QuranCurriculumV2, lexicon: t.win.QuranLexiconV1, grammar: t.win.QuranGrammarV1, shorts: t.win.QuranShortSurahsV1, phonics: t.win.QuranPhonicsV1 };
  const lessons = content.curriculum.units.flatMap((unit) => unit.lessons);
  assert.equal(lessons.length, 109, `ders sayısı ${lessons.length}`);
  for (const lesson of lessons) {
    const plan = flow.lessonPlan({ quranLearn: q }, lesson.id, new Date(t.NOW), content);
    const goal = plan.find((item) => item.kind === 'goal'), apply = plan.find((item) => item.kind === 'apply');
    assert.ok(goal && apply, `${lesson.id}: açılış/kapanış yok`);
    assert.deepEqual(goal.apply, apply.ref, `${lesson.id}: referans farklı`);
    assert.deepEqual(goal.apply, lesson.apply, `${lesson.id}: referans dersin çapasından gelmeli`);
    assert.equal(goal.words, apply.words, `${lesson.id}: açılış ve kapanış aynı satırı paylaşmalı`);
  }
});

check('K3P-13 satır: hedef lemmalar satırda; en çok 25 sözcük. İstisna listesi gerekçeli ve yalnız küçülür', () => {
  const t = bootKao();
  const q = freshUser(t);
  const flow = t.win.SeymaQuranLearnFlow;
  const lexicon = t.win.QuranLexiconV1, curriculum = t.win.QuranCurriculumV2;
  const content = { curriculum, lexicon, grammar: t.win.QuranGrammarV1, shorts: t.win.QuranShortSurahsV1, phonics: t.win.QuranPhonicsV1 };
  const pmap = curriculum.prayerLemmaMap || {}, lemmaById = (id) => lexicon.byId(id);
  const wordOver = new Set(), lemmaOver = new Set();
  for (const lesson of curriculum.units.flatMap((unit) => unit.lessons)) {
    const plan = flow.lessonPlan({ quranLearn: q }, lesson.id, new Date(t.NOW), content);
    const goal = plan.find((item) => item.kind === 'goal');
    const words = windowFor(lesson.apply.kind, goal, lemmaById);
    if (words.length > 25) wordOver.add(lesson.id);
    const targets = goal.lessonIds.concat(goal.newLemmaIds).map((id) => norm(pmap, id));
    const present = new Set(words.map((word) => norm(pmap, word.mappedLemmaId || word.lemmaId)));
    if (!targets.every((id) => present.has(id))) lemmaOver.add(lesson.id);
  }
  // Yalnız küçülür: tanımlı istisna ile gerçek istisna kümeleri BİREBİR aynı olmalı.
  assert.deepEqual([...wordOver].sort(), Object.keys(WORD_EXEMPT).sort(), `sözcük istisnaları değişti: ${[...wordOver].join(',')}`);
  assert.deepEqual([...lemmaOver].sort(), Object.keys(LEMMA_EXEMPT).sort(), `lemma istisnaları değişti: ${[...lemmaOver].join(',')}`);
  for (const [id, reason] of Object.entries({ ...WORD_EXEMPT, ...LEMMA_EXEMPT })) assert.ok(reason && reason.length > 20, `${id}: gerekçe yetersiz`);
});

check('K3P-13 sunum: açılış ve kapanış AYNI satırı Tezhip olarak çizer; hedef kelimeler soluk altın/mürekkep', () => {
  const t = bootKao();
  freshUser(t);
  const rowOf = (html) => (html.match(/<div class="kao-lesson-apply-tezhip">([\s\S]*?)<\/div>/) || ['', ''])[1];
  const rowKey = (row) => String(row)
    .replace(/class="kao-tezhip-word is-(?:known|new|learning)"/g, 'class="kao-tezhip-word"')
    .replace(/aria-label="([^\"]+), (?:biliniyor|henüz bilinmiyor|öğreniliyor)"/g, 'aria-label="$1"');
  for (const lessonId of ['u01.02', 'u04.01']) {
    const t2 = bootKao(); freshUser(t2);
    assert.equal(startLessonForFixture(t2, lessonId), true);
    const goalRow = rowOf(t2.api.kaoOverlayHTML(t2.NOW));
    assert.ok(goalRow.includes('kao-tezhip-word'), `${lessonId}: açılışta Tezhip satırı yok`);
    // Hedef kelimeler "öğreniliyor" (yumuşak altın) ya da "yeni" (mürekkep) durumunda; altın METİN yok.
    assert.match(goalRow, /kao-tezhip-word is-(learning|new|known)/, `${lessonId}: kelime durumu yok`);
    assert.equal(playLesson(t2, { stopAt: 'apply' }), true, `${lessonId}: kapanışa ulaşılamadı`);
    const applyHtml = t2.api.kaoOverlayHTML(t2.NOW);
    assert.equal(rowKey(rowOf(applyHtml)), rowKey(goalRow), `${lessonId}: açılış ve kapanış âyet satırı/kelime sırası farklı`);
    assert.match(applyHtml, /kao-play-start/, `${lessonId}: "Yaldızla" yok`);
    assert.equal((applyHtml.match(/is-gild/g) || []).length, 0, `${lessonId}: başlangıçta yaldız yok`);
  }
});

check('K3P-13 zirve: yaldız kelimeleri sırayla ilerler; toplam an ≤ 1,2 sn', () => {
  const t = bootKao();
  freshUser(t);
  assert.equal(startLessonForFixture(t, 'u01.02'), true);
  assert.equal(playLesson(t, { stopAt: 'apply' }), true);
  const total = (t.api.kaoOverlayHTML(t.NOW).match(/kao-tezhip-word/g) || []).length;
  assert.ok(total > 1, `satır çok kısa (${total})`);
  assert.equal(t.api.kaoLesson('gild'), true);
  let steps = 0, maxStep = 0;
  for (let guard = 0; guard < 60 && t.ui.kaoGildTimer; guard += 1) {
    const timer = t.timers[t.ui.kaoGildTimer - 1];
    if (!timer || typeof timer.fn !== 'function') break;
    maxStep = Math.max(maxStep, timer.ms); timer.fn(); steps += 1;
  }
  assert.equal((t.api.kaoOverlayHTML(t.NOW).match(/is-gild/g) || []).length, total, 'tüm kelimeler yaldızlanmadı');
  assert.ok(maxStep * steps <= 1200 + maxStep, `toplam an > 1,2 sn (${maxStep}×${steps})`);
  assert.ok(maxStep <= 320, `adım aralığı çok uzun (${maxStep} ms)`);
});

check('K3P-13 zirve: hareket azaltmada yaldız STATİK (zamanlayıcı kurulmaz)', () => {
  const t = bootKao();
  freshUser(t);
  t.win.SeyFx = { shouldAnimate: () => false };
  assert.equal(startLessonForFixture(t, 'u01.02'), true);
  assert.equal(playLesson(t, { stopAt: 'apply' }), true);
  const total = (t.api.kaoOverlayHTML(t.NOW).match(/kao-tezhip-word/g) || []).length;
  t.timers.length = 0;
  assert.equal(t.api.kaoLesson('gild'), true);
  assert.equal(t.ui.kaoGildTimer, null, 'statik modda zamanlayıcı kurulmamalı');
  assert.equal(t.timers.length, 0, 'statik modda timer eklenmemeli');
  assert.equal((t.api.kaoOverlayHTML(t.NOW).match(/is-gild/g) || []).length, total, 'statik yaldız tüm satırı kaplamalı');
});

console.log(`test_k3p_lesson_ayah: PASS (${passed} kontrol)`);
