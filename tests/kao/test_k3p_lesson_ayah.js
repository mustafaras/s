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

// K3PD-14 · Ses izni KAO audio ayarı + function/boolean quiet-time sözleşmesinden gelir; gerçek saat kullanılmaz.
function gildAudioCase({ audioEnabled, quiet, reducedMotion, audioMode = 'normal', quietMode = 'function' }) {
  let createAudioCalls = 0, playCalls = 0, trackGildAudio = false;
  const surface = {};
  if (quietMode === 'function') surface.isQuietTime = () => quiet;
  else if (quietMode === 'missing') surface.isQuietTime = undefined;
  else if (quietMode === 'boolean-true') surface.isQuietTime = true;
  else if (quietMode === 'boolean-false') surface.isQuietTime = false;
  else if (quietMode === 'invalid-function') surface.isQuietTime = () => undefined;
  if (audioMode !== 'missing') surface.createAudio = (src) => {
    if (trackGildAudio) {
      createAudioCalls += 1;
      if (audioMode === 'throw-create') throw new Error('synthetic createAudio failure');
      if (audioMode === 'null-audio') return null;
    }
    const listeners = {};
    return {
      src,
      addEventListener(name, fn) { listeners[name] = fn; },
      play() {
        if (trackGildAudio) {
          playCalls += 1;
          if (audioMode === 'throw-play') throw new Error('synthetic play failure');
          if (audioMode === 'emit-error' && listeners.error) listeners.error();
          if (listeners.ended) listeners.ended();
        }
        return Promise.resolve();
      }
    };
  };
  const t = bootKao({ surface });
  const q = freshUser(t);
  q.settings.audio = audioEnabled;
  t.win.matchMedia = (query) => ({ matches: reducedMotion && query === '(prefers-reduced-motion:reduce)' });
  assert.equal(startLessonForFixture(t, 'u01.02'), true, 'sentetik ders başlamalı');
  assert.equal(playLesson(t, { stopAt: 'apply' }), true, 'sentetik ders uygulama adımına gelmeli');
  const total = (t.api.kaoOverlayHTML(t.NOW).match(/kao-tezhip-word/g) || []).length;
  assert.ok(total > 1, 'matris âyeti birden çok kelime içermeli');
  t.timers.length = 0;
  trackGildAudio = true;
  assert.equal(t.api.kaoLesson('gild'), true, 'yaldızlama, ses durumundan bağımsız başlamalı');
  return { t, total, createAudioCalls, playCalls };
}

check('K3PD-14 ses izni matrisi: ayar × sessiz saat × hareket azaltma gerçek ses çağrılarını sayar', () => {
  const measurements = [];
  for (const audioEnabled of [false, true]) for (const quiet of [false, true]) for (const reducedMotion of [false, true]) {
    const result = gildAudioCase({ audioEnabled, quiet, reducedMotion });
    const allowed = audioEnabled && !quiet;
    const matrixCell = `ayar=${audioEnabled} sessiz=${quiet} reduce=${reducedMotion}`;
    if (allowed) {
      assert.ok(result.createAudioCalls > 0, `izinli hücrede createAudio olmalı (${matrixCell})`);
      assert.ok(result.playCalls > 0, `izinli hücrede play olmalı (${matrixCell})`);
      // K3PD-15: ses varsa vurgu gerçek klip olaylarıyla ilerler; sabit görsel timer kurulmaz.
      assert.equal(result.t.ui.kaoGildTimer, null, `sesli yolda sabit yaldız timer'ı yok (${matrixCell})`);
      assert.ok(result.t.ui.kaoGildIndex >= 1, `ses başlarken en az ilk kelime yaldızlı (${matrixCell})`);
    } else {
      assert.equal(result.createAudioCalls, 0, `createAudio=0 (${matrixCell})`);
      assert.equal(result.playCalls, 0, `play=0 (${matrixCell})`);
      if (reducedMotion) {
        assert.equal(result.t.ui.kaoGildTimer, null, 'hareket azaltmada görsel zamanlayıcı kapalı');
        assert.equal(result.t.timers.length, 0, 'hareket azaltmada yeni görsel zamanlayıcı yok');
        assert.equal(result.t.ui.kaoGildIndex, result.total, 'hareket azaltmada satır statik yaldızlı');
      } else {
        assert.ok(result.t.ui.kaoGildTimer, 'sessiz yedekte ritmik zamanlayıcı çalışmalı');
        assert.ok(result.t.timers.length > 0, 'sessiz yedekte gerçek sentetik timer kurulmalı');
      }
    }
    measurements.push(`${matrixCell}: createAudio=${result.createAudioCalls}, play=${result.playCalls}`);
  }
  console.log(`K3PD-14 matrix measurements: ${measurements.join(' · ')}`);
});

check('K3PD-14 sessiz-saat bağımlılığı function/boolean sözleşmesini fail-closed uygular', () => {
  for (const quietMode of ['missing', 'boolean-true', 'invalid-function']) {
    const result = gildAudioCase({ audioEnabled: true, quiet: false, reducedMotion: false, quietMode });
    assert.equal(result.createAudioCalls, 0, `${quietMode}: createAudio=0`);
    assert.equal(result.playCalls, 0, `${quietMode}: play=0`);
    assert.ok(result.t.ui.kaoGildTimer, `${quietMode}: sessiz görsel yaldız sürmeli`);
  }
  const explicitNotQuiet = gildAudioCase({ audioEnabled: true, quiet: false, reducedMotion: false, quietMode: 'boolean-false' });
  assert.ok(explicitNotQuiet.createAudioCalls > 0, 'boolean false sözleşmesinde createAudio başlamalı');
  // K3PD-15: sesli yol gerçek klip olaylarıyla ilerler; vurgu sese bağlı başlar.
  assert.ok(explicitNotQuiet.t.ui.kaoGildIndex >= 1, 'boolean false sözleşmesinde yaldız sesle başlamalı');
});

check('K3PD-14 ses yokluğu veya hata okumayı ve sessiz yaldız zamanlayıcısını durdurmaz', () => {
  for (const audioMode of ['missing', 'null-audio', 'throw-create', 'throw-play', 'emit-error']) {
    const result = gildAudioCase({ audioEnabled: true, quiet: false, reducedMotion: false, audioMode });
    assert.ok(result.t.ui.kaoGildTimer, `${audioMode}: sessiz yedek yaldız zamanlayıcısı kurulmalı`);
    for (let guard = 0; guard < 60 && result.t.ui.kaoGildTimer; guard += 1) {
      const timer = result.t.timers[result.t.ui.kaoGildTimer - 1];
      assert.ok(timer && typeof timer.fn === 'function', `${audioMode}: sentetik timer bulunmalı`);
      timer.fn();
    }
    assert.equal(result.t.ui.kaoGildIndex, result.total, `${audioMode}: okuma/yaldız tamamlanmalı`);
    assert.equal((result.t.api.kaoOverlayHTML(result.t.NOW).match(/is-gild/g) || []).length, result.total, `${audioMode}: satırın tamamı görünmeli`);
  }
});


// ── K3PD-15 · Ders zirvesinde ses–kelime senkronu ve iptal ───────────────────────────────────
// İki ayrı sözleşme: (1) ses varsa vurgu GERÇEK klip olaylarıyla ilerler, doğal kayıt süresi
// hızlandırılmaz/kesilmez; (2) ses yok/kapalı/hatalı/klipsiz satırda ritmik yedek 1,2 sn bütçesiyle yürür.
// Hiç `ended` gelmeden dokuz kelimeyi timer'la yaldızlayan davranış KIRMIZI olmalı.
function gildHarness({ audioEnabled = true, lessonId = 'u01.02', createAudio } = {}) {
  const audios = [], timers = [], cleared = [];
  // Doğal süre: hiçbir klip kendiliğinden bitmez; `ended` yalnız testin elinden gelir.
  const makeAudio = createAudio || ((src) => {
    const listeners = {};
    const audio = {
      src, listeners, paused: false, removed: [],
      addEventListener(name, fn) { listeners[name] = fn; },
      removeEventListener(name, fn) { if (listeners[name] === fn) { delete listeners[name]; audio.removed.push(name); } },
      pause() { audio.paused = true; },
      play() { return Promise.resolve(); },
      fire(name) { if (listeners[name]) listeners[name](); }
    };
    audios.push(audio);
    return audio;
  });
  const surface = {
    setTimer(fn, ms) { timers.push({ fn, ms }); return timers.length; },
    clearTimer(id) { cleared.push(id); },
    createAudio: (src) => makeAudio(src)
  };
  const t = bootKao({ surface });
  const q = freshUser(t);
  q.settings.audio = audioEnabled;
  assert.equal(startLessonForFixture(t, lessonId), true, `${lessonId}: ders başlamalı`);
  assert.equal(playLesson(t, { stopAt: 'apply' }), true, `${lessonId}: kapanışa gelinmeli`);
  const total = (t.api.kaoOverlayHTML(t.NOW).match(/kao-tezhip-word/g) || []).length;
  // Ders adımları kendi ses/timer'larını üretir; ölçüm yalnız yaldızlama turunu kapsar.
  audios.length = 0; timers.length = 0; t.timers.length = 0;
  return { t, audios, timers, cleared, total, gilded: () => (t.api.kaoOverlayHTML(t.NOW).match(/is-gild/g) || []).length };
}

check('K3PD-15 sesli yol: hiç ended gelmeden kelimeler timer ile yaldızlanmaz', () => {
  const h = gildHarness();
  assert.ok(h.total > 1, `satır çok kısa (${h.total})`);
  h.t.timers.length = 0;
  assert.equal(h.t.api.kaoLesson('gild'), true, 'yaldızlama başlamalı');
  assert.ok(h.audios.length >= 1, 'ilk klip yaratılmalı');
  assert.equal(h.gilded(), 1, 'ses başlarken yalnız ilk kelime yaldızlı olmalı');
  assert.equal(h.t.ui.kaoGildTimer, null, 'sesli yolda sabit görsel timer kurulmamalı');
  assert.equal(h.timers.length, 0, 'sesli yolda hiç timer eklenmemeli');
});

check('K3PD-15 sesli yol: ended olayları kelimeyi sırayla ilerletir, son ended satırı tamamlar', () => {
  const h = gildHarness();
  assert.equal(h.t.api.kaoLesson('gild'), true);
  const seen = [];
  for (let step = 1; step < h.total; step += 1) {
    const audio = h.audios[step - 1];
    assert.ok(audio, `${step}. klip yok`);
    audio.fire('ended');
    const gilded = h.gilded();
    seen.push(gilded);
    assert.equal(gilded, step + 1, `${step}. ended sonrası vurgu ${step + 1} olmalı`);
  }
  assert.deepEqual(seen, seen.map((_v, i) => i + 2), 'vurgu öne geçmemeli, geride kalmamalı');
  assert.equal(h.t.ui.kaoGildIndex, h.total, 'tüm kelimeler sesle tamamlanmalı');
  assert.equal(h.timers.length, 0, 'sesli yolda timer yok');
});

check('K3PD-15 ses hatası: kalan kelimeler sessiz yedekle tamamlanır, okuma durmaz', () => {
  const h = gildHarness();
  assert.equal(h.t.api.kaoLesson('gild'), true);
  h.audios[0].fire('ended');
  const before = h.gilded();
  h.audios[1].fire('error');
  assert.ok(h.t.ui.kaoGildTimer, 'hata sonrası sessiz yedek timer kurulmalı');
  assert.equal(h.gilded(), before, 'hata anında vurgu geri sıçramamalı');
  for (let guard = 0; guard < 80 && h.t.ui.kaoGildTimer; guard += 1) {
    const timer = h.timers[h.t.ui.kaoGildTimer - 1];
    assert.ok(timer && typeof timer.fn === 'function', 'sentetik timer bulunmalı');
    timer.fn();
  }
  assert.equal(h.gilded(), h.total, 'kalan satır sessiz yedekle tamamlanmalı');
  assert.equal(h.t.ui.kaoGildIndex, h.total, 'vurgu satır sonuna ulaşmalı');
});

check('K3PD-15 iptal: çıkış eski ses/timer callback\'ini etkisizleştirir ve sesi susturur', () => {
  const h = gildHarness();
  assert.equal(h.t.api.kaoLesson('gild'), true);
  h.audios[0].fire('ended');
  const stale = h.audios[1];
  const created = h.audios.length;
  assert.equal(h.t.api.kaoLesson('exit'), true, 'çıkış çalışmalı');
  const afterExit = h.t.ui.kaoGildIndex;
  stale.fire('ended');
  assert.equal(h.t.ui.kaoGildIndex, afterExit, 'çıkıştan sonra eski ended vurguyu değiştirmemeli');
  assert.equal(h.audios.length, created, 'çıkıştan sonra eski ended yeni ses başlatmamalı');
  assert.equal(h.t.ui.kaoGildRun, null, 'aktif yaldız oturumu temizlenmeli');
  assert.equal(stale.paused, true, 'eski ses susturulmalı (iki ses üst üste binmez)');
});

check('K3PD-15 yeniden yaldızla: tek aktif oturum; önceki oturumun ended\'i yeni ekranı değiştirmez', () => {
  const h = gildHarness();
  assert.equal(h.t.api.kaoLesson('gild'), true);
  const first = h.audios[0];
  assert.equal(h.t.api.kaoLesson('gild'), true, 'ikinci kez yaldızlanabilmeli');
  assert.ok(h.audios.length >= 2, 'ikinci tur yeni klip yaratmalı');
  const freshIndex = h.t.ui.kaoGildIndex;
  first.fire('ended');
  assert.equal(h.t.ui.kaoGildIndex, freshIndex, 'eski oturumun ended\'i yeni turu ilerletmemeli');
  assert.ok(first.paused === true || first.removed.length >= 1, 'eski oturum sesi susturulmalı');
});

check('K3PD-15 sızıntı: sesli yol ve iptal sonrası timer/dinleyici sızıntısı yok', () => {
  const h = gildHarness();
  assert.equal(h.t.api.kaoLesson('gild'), true);
  for (let step = 0; step < h.total; step += 1) if (h.audios[step]) h.audios[step].fire('ended');
  assert.equal(h.timers.length, 0, 'sesli yolda timer sızıntısı 0');
  const active = h.t.ui.kaoGildRun;
  assert.ok(active && active.audio, 'aktif oturum çalan sesi izlemeli');
  assert.equal(h.t.api.kaoLesson('gild'), true, 'yeniden yaldızla');
  assert.equal(active.audio.paused, true, 'önceki oturumun sesi susturulmalı');
  h.t.api.kaoLesson('exit');
  assert.equal(h.t.ui.kaoGildTimer, null, 'iptal sonrası timer yok');
  assert.equal(h.t.ui.kaoGildRun, null, 'iptal sonrası oturum yok');
});

check('K3PD-15 klipsiz satır: yanlış indeksle eşleme yok, dürüst sessiz yedek uygulanır', () => {
  // u04.01 kapanışı örnek cümlelerden kurulur: kelimelerin lemma kimliği yoktur → klip hizası yoktur.
  const h = gildHarness({ lessonId: 'u04.01' });
  assert.equal(h.t.api.kaoLesson('gild'), true, 'yaldızlama klipsiz satırda da çalışmalı');
  const run = h.t.ui.kaoGildRun;
  assert.equal(run.audio, undefined, 'klipsiz satırda hiç ses yaratılmamalı');
  assert.equal(h.audios.length, 0, 'klipsiz satırda createAudio çağrılmamalı');
  assert.ok(h.t.ui.kaoGildTimer, 'klipsiz satırda sessiz yedek zamanlayıcısı kurulmalı');
  const step = h.timers[h.t.ui.kaoGildTimer - 1];
  assert.ok(step.ms * h.total <= 1200 + step.ms, `dekoratif yedek bütçesi ≤ 1,2 sn (${step.ms}×${h.total})`);
  for (let guard = 0; guard < 80 && h.t.ui.kaoGildTimer; guard += 1) {
    const timer = h.timers[h.t.ui.kaoGildTimer - 1];
    if (!timer) break;
    timer.fn();
  }
  assert.equal(h.gilded(), h.total, 'sessiz yedek satırı baştan sona yaldızlamalı');
});

// ══ K3PD-20 · Hedef ekranının 25 sözcük sınırı ═════════════════════════════════════════════════
// İKİ ÖLÇÜ AYRI TUTULUR (hard stop):
//   (a) GERÇEK İLK GÖRÜNÜM toplam metni ≤25 — kicker/başlık/summary dâhil, <details> gövdesi hariç
//   (b) âyet satırının kendi uzunluğu (kapsama/uzunluk ölçüsü)
// Yalnız (b)'yi ölçüp ekranı PASS saymıyoruz.
const goalCardOf = (html) => {
  const src = String(html);
  const start = src.indexOf('<section class="kao-lesson-card');
  if (start < 0) return '';
  let depth = 0;
  for (let i = start; i < src.length; i += 1) {
    if (src.startsWith('<section', i)) { depth += 1; i += 7; continue; }
    if (src.startsWith('</section>', i)) { depth -= 1; if (depth === 0) return src.slice(start, i + 10); i += 9; }
  }
  return src.slice(start);
};
const firstViewWords = (card) => {
  const firstView = String(card).replace(/<details\b[^>]*>[\s\S]*?<\/details>/g, (details) => {
    const summary = /<summary\b[^>]*>([\s\S]*?)<\/summary>/.exec(details);
    return summary ? ' ' + summary[1] + ' ' : ' ';
  });
  const t = text(firstView).replace(/\s+/g, ' ').trim();
  return t ? t.split(' ').length : 0;
};

function goalSweep() {
  const t = bootKao();
  freshUser(t);
  const flow = t.win.SeymaQuranLearnFlow;
  const content = { curriculum: t.win.QuranCurriculumV2, lexicon: t.win.QuranLexiconV1, grammar: t.win.QuranGrammarV1, shorts: t.win.QuranShortSurahsV1, phonics: t.win.QuranPhonicsV1 };
  const rows = [];
  for (const lesson of content.curriculum.units.flatMap((unit) => unit.lessons)) {
    const q = freshUser(t, { minutes: 15 });
    for (const key of Object.keys(t.ui)) delete t.ui[key];
    Object.assign(t.ui, { kaoOpen: false, kaoView: 'home', kaoStack: [], kaoLatency: [6000] });
    t.api.kaoOpen('home');
    if (!startLessonForFixture(t, lesson.id)) continue;
    const state = t.ui.kaoLesson;
    const plan = state.plan;
    const goal = plan[state.at || 0];
    if (!goal) continue;
    const card = goalCardOf(t.api.kaoOverlayHTML(t.NOW));
    rows.push({ lessonId: lesson.id, card, words: firstViewWords(card), goal, plan, title: state.title, q });
  }
  return { t, rows, content, flow };
}

const goalSweepResult = goalSweep();

check('K3PD-20 hedef ekranı: 109 dersin TAMAMINDA ilk görünüm ≤25 sözcük', () => {
  assert.equal(goalSweepResult.rows.length, 109, `hedef ekranı sayısı ${goalSweepResult.rows.length}`);
  for (const row of goalSweepResult.rows) assert.ok(row.title, `${row.lessonId}: gerçek ders başlığı eksik`);
  const over = goalSweepResult.rows.filter((row) => row.words > 25);
  assert.deepEqual(over.map((row) => `${row.lessonId}:${row.words}`), [], '25 sözcüğü aşan hedef ekranları');
  const max = Math.max(...goalSweepResult.rows.map((row) => row.words));
  assert.ok(max <= 25, `en yüksek hedef ilk görünümü ${max}`);
});

check('K3PD-20 hedef: uzun hedef cümlesi ve süre vaadi KATLI (ilk görünümde değil)', () => {
  const withGoal = goalSweepResult.rows.filter((row) => row.goal && row.goal.title);
  assert.ok(withGoal.length > 0);
  for (const row of goalSweepResult.rows) {
    const visible = String(row.card).replace(/<details[\s\S]*?<\/details>/g, ' ');
    assert.doesNotMatch(visible, /kao-lesson-goal-line/, `${row.lessonId}: hedef cümlesi ilk görünümde`);
  }
  // Katlanan gövde gerçekten var ve hedef cümlesini taşıyor.
  const sample = goalSweepResult.rows.find((row) => /kao-lesson-goal-line/.test(row.card));
  assert.ok(sample, 'hedef cümlesi hiçbir yerde yok (içerik kaybı)');
  assert.match(sample.card, /<details class="kao-lesson-more">/, 'hedef cümlesi katlanmış olmalı');
  const details = /<details class="kao-lesson-more">([\s\S]*?)<\/details>/.exec(sample.card);
  assert.ok(details && details[1].includes('kao-lesson-apply-tezhip'), 'tam hedef satırı ayrıntıda korunmalı');
  assert.match(details[1], /<summary>Hedefi ve metni gör<\/summary>/, 'açılır bölümün özeti erişilebilir olmalı');
});

check('K3PD-20 goal/apply AYNI doğrulanmış satırı paylaşır (gerileme yok)', () => {
  for (const row of goalSweepResult.rows) {
    const apply = row.plan.find((item) => item.kind === 'apply');
    if (!apply) continue;
    assert.equal(row.goal.words, apply.words, `${row.lessonId}: goal ve apply farklı satır`);
    assert.deepEqual(row.goal.apply, apply.ref, `${row.lessonId}: referans farklı`);
  }
});

check('K3PD-20 satır uzunluğu AYRI ölçü: çapa metin satırları kaynak uzunluğunda, gerekçeli', () => {
  // Satır uzunluğu ekran ölçüsünden AYRIDIR. Çapa metin (Fâtiha/namaz) satırları kaynağın
  // kendi uzunluğunu taşır; bunları kırpmak Arapça metni bozmak olurdu (hard stop).
  // Bu yüzden liste KAPALI ve GEREKÇELİdir: yalnız çapa metin dersleri, kaynak uzunluğuyla.
  const ROW_EXEMPT = {
    'u01.01': 29, 'u01.02': 29, 'u01.03': 29, 'u01.04': 29, 'u01.05': 29,
    'u02.02': 28, 'u02.03': 28
  };
  const over = goalSweepResult.rows.filter((row) => Array.isArray(row.goal.words) && row.goal.words.length > 25);
  assert.deepEqual(
    over.map((row) => `${row.lessonId}:${row.goal.words.length}`).sort(),
    Object.entries(ROW_EXEMPT).map(([id, n]) => `${id}:${n}`).sort(),
    'satır istisna listesi değişti (yalnız küçülebilir)'
  );
  // İstisnaların hepsi çapa metin (prayer/surah) dersidir — örnek cümle birleşimi değil.
  for (const row of over) {
    const apply = row.plan.find((item) => item.kind === 'apply');
    assert.ok(apply && apply.ref && (apply.ref.kind === 'prayer' || apply.ref.kind === 'surah'),
      `${row.lessonId}: çapa metin dışı satır 25'i aşıyor`);
  }
});

check('K3PD-20 intro/concept ≤45 korunur (K3PD-19 gerilemedi)', () => {
  const t = goalSweepResult.t;
  const flow = goalSweepResult.flow;
  const content = goalSweepResult.content;
  const over = [];
  for (const lesson of content.curriculum.units.flatMap((unit) => unit.lessons)) {
    const plan = flow.lessonPlan({ quranLearn: t.data.quranLearn }, lesson.id, new Date(t.NOW), content);
    for (const item of plan) {
      if (item.kind !== 'intro' && item.kind !== 'concept') continue;
      t.ui.kaoView = 'session';
      t.ui.kaoStack = [{ view: 'session' }];
      t.ui.kaoLesson = { plan: [item], at: 0, phase: 'lesson', lessonId: lesson.id };
      const w = firstViewWords(goalCardOf(t.api.kaoOverlayHTML(t.NOW)));
      if (w > 45) over.push(`${lesson.id}:${w}`);
    }
  }
  assert.deepEqual(over, [], 'intro/concept 45 sözcüğü aştı');
});

check('K3PD-20 gerekçeli lemma istisna listesi gerilemedi (yalnız küçülür)', () => {
  // K3P-13 istisna listeleri bu dosyada sabittir; sayıları artmadı.
  assert.equal(Object.keys(WORD_EXEMPT).length, 0, 'sözcük istisnası eklenmemeli');
  assert.equal(Object.keys(LEMMA_EXEMPT).length, 10, 'lemma istisnası 10 kaldı');
});

console.log(`test_k3p_lesson_ayah: PASS (${passed} kontrol)`);
