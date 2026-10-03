'use strict';

// KAO2-12: ders planı ve oynatıcı; sentetik durum, sabit saat, DOM/ağ yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');
const { bootKao, freshUser, playLesson, text } = require('./helpers/kao-harness');

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

// K2F-23 (K3-01, R-08): çapa metni olmayan 95 derste (K2F-24: Ünite 2'nin 2 dersi namaz çapasına bağlandı, 97 → 95) "Uygula" adımı doğrulanmış örnek cümlelerle dolar.
const allLessons = curriculum.units.flatMap((unit) => unit.lessons);
const SENTENCE_KEYS = ['lemmaId', 'ar', 'pronunciation', 'tr', 'ref'];

check('K2F-23 uygula: 109 dersin 109\'unda adım içerikli (kelime ya da cümle); boş liste yok', () => {
  const q = freshQ();
  let examples = 0;
  for (const item of allLessons) {
    const apply = flow.lessonPlan({ quranLearn: q }, item.id, now, content).find((entry) => entry.kind === 'apply');
    assert.ok(apply, `${item.id}: uygula adımı yok`);
    const count = (apply.words || []).length + (apply.sentences || []).length;
    assert.ok(count > 0, `${item.id}: uygula adımı içeriksiz`);
    if (item.apply && item.apply.kind === 'examples') {
      examples += 1;
      assert.equal(apply.mode, 'examples', `${item.id}: mode`);
      assert.equal((apply.words || []).length, 0, `${item.id}: örnek modunda çapa kelimesi olmaz`);
    }
  }
  assert.equal(examples, 95, 'çapa metni olmayan ders sayısı');
});

check('K2F-23 uygula: örnek cümleler dersin lemmalarından (önce yeni), en çok 3, doğrulanmış examples[0]; tahmin yok', () => {
  const q = freshQ();
  for (const item of allLessons.filter((entry) => entry.apply && entry.apply.kind === 'examples')) {
    const plan = flow.lessonPlan({ quranLearn: q }, item.id, now, content);
    const apply = plan.find((entry) => entry.kind === 'apply');
    const sentences = plain(apply.sentences);
    assert.ok(sentences.length >= 1 && sentences.length <= 3, `${item.id}: cümle sayısı ${sentences.length}`);
    const fresh = plain(plan[0].newLemmaIds);
    const eligible = plain(plan[0].lemmaIds);
    const order = fresh.concat(eligible.filter((id) => !fresh.includes(id)));
    assert.deepEqual(sentences.map((entry) => entry.lemmaId), order.slice(0, sentences.length), `${item.id}: sıra (önce yeni lemma)`);
    for (const sentence of sentences) {
      assert.deepEqual(Object.keys(sentence).sort(), SENTENCE_KEYS.concat('lemmaPronunciation').sort(), `${item.id}: biçim`);
      const lemma = content.lexicon.byId(sentence.lemmaId);
      assert.equal(lemma.verified, true, `${sentence.lemmaId}: doğrulanmamış lemma`);
      const source = lemma.examples[0];
      assert.deepEqual({ ar: sentence.ar, pronunciation: sentence.pronunciation, tr: sentence.tr, ref: sentence.ref },
        { ar: source.ar, pronunciation: source.pronunciation, tr: source.tr, ref: source.ref }, `${sentence.lemmaId}: örnek veriyle aynı değil`);
    }
  }
});

check('K2F-23 uygula: günlük yeni kelime 0 (eski/içe aktarılmış veri) olsa da hiçbir derste adım boş kalmaz', () => {
  for (const dailyNew of [0, 1]) {
    const q = freshQ(); q.settings.dailyNew = dailyNew;
    for (const item of allLessons) {
      const apply = flow.lessonPlan({ quranLearn: q }, item.id, now, content).find((entry) => entry.kind === 'apply');
      assert.ok((apply.words || []).length + (apply.sentences || []).length > 0, `${item.id} (dailyNew=${dailyNew}): uygula adımı boş`);
    }
  }
});

check('K2F-23 uygula: görünüm cümleyi Arapça + okunuş + Türkçe + âyet künyesi + "Bu dersin kelimesi" ile çizer; gerçek akışta ulaşılır', () => {
  const t = bootKao();
  freshUser(t);
  const target = t.win.QuranCurriculumV2.units[3].lessons[0];
  assert.equal(target.apply.kind, 'examples');
  assert.equal(t.api.kaoLesson('start', target.id), true);
  assert.equal(playLesson(t, { stopAt: 'apply' }), true, 'uygula adımına ulaşılamadı');
  const item = t.ui.kaoLesson.plan[t.ui.kaoLesson.at];
  assert.equal(item.kind, 'apply');
  const html = t.api.kaoOverlayHTML(t.NOW);
  const flat = text(html);
  assert.ok(item.sentences.length >= 1);
  for (const sentence of item.sentences) {
    assert.ok(html.includes(sentence.ar), `${sentence.lemmaId}: Arapça yok`);
    assert.ok(flat.includes(sentence.pronunciation), `${sentence.lemmaId}: okunuş yok`);
    assert.ok(flat.includes(sentence.tr), `${sentence.lemmaId}: Türkçe yok`);
    assert.ok(flat.includes(sentence.ref), `${sentence.lemmaId}: künye yok`);
    assert.ok(flat.includes(`Bu dersin kelimesi: ${sentence.lemmaPronunciation}`), `${sentence.lemmaId}: ders kelimesi satırı yok`);
  }
  assert.equal((html.match(/kao-primary/g) || []).length >= 1, true);
});

// K2F-24 (K3-02 · D-07): namaz metinlerindeki lp_* kelimeleri öğretilen l_* lemmalarına muhafazakâr belirlenimci eşlemeyle bağlanır.
const MAP = curriculum.prayerLemmaMap || {};
const unit2 = curriculum.units.find((unit) => unit.id === 2);
const prayerWords = (id) => content.shorts.prayerTexts.find((item) => item.id === id).words;
const introduceAll = (q, ids) => ids.forEach((id) => { q.cards[`w:${id}:ar>tr`] = { state: 'review', s: 4, reps: 1, introducedAt: '2026-09-20T10:00:00.000Z' }; });

check('K2F-24 eşleme: yalnız namaz-eki (lp_) → sözlük (l_) ve doğrulanmış lemma; birden çok adaylı kelime eşlenmez', () => {
  const keys = Object.keys(MAP);
  assert.ok(keys.length >= 10, `eşleme sayısı ${keys.length}`);
  for (const key of keys) {
    assert.ok(key.startsWith('lp_'), `${key}: anahtar lp_ değil`);
    assert.ok(content.lexicon.byId(MAP[key]), `${key}: hedef sözlükte yok (${MAP[key]})`);
    assert.ok(prayerWordsAll().some((w) => w.lemmaId === key), `${key}: namaz metninde geçmiyor`);
  }
  assert.equal(MAP.lp_7cb56720c0, 'l_sala_m_daff0b', 'es-selâm → selâm lemması');
  assert.equal(MAP.lp_5cfe478ddb, 'l_suboHa_n_59533b', 'subhânaka → subhân lemması');
  assert.equal(MAP.lp_c7d096cadc, undefined, "'abduhu iki adaylı (kul / kulluk etti): eşleme yok");
  assert.equal(MAP.lp_f0473a3990, undefined, 'adayı olmayan kelime eşlenmez (tahmin yok)');
});

function prayerWordsAll() { return content.shorts.prayerTexts.flatMap((item) => item.words); }

// K2F-24 ek tur: düzenli çoğul (-în/-ûn) kuralı yalnız çoğullanabilir özne/sıfat lemmalarına (fâil/mef'ûl/sıfat-ı müşebbehe,
// çoğul olmayan) uygulanır; elatif (ef'al) ile fiil 1. tekil (e-) kalıpları harekeli metinde bile ayırt edilemediği için eşlenmez.
check('K2F-24 ek tur: düzenli çoğul kuralı gerçek metinde yalnız es-sâlihîn → sâlih lemmasını ekler; fiil/elatif/kırık çoğul eşlenmez', () => {
  assert.equal(MAP.lp_79cb46c8fc, 'l_Sa_liH_30bb88', 'es-sâlihîn → sâlih (ism-i fâil)');
  for (const id of ['lp_d9d03c781d', 'lp_db3e429022', 'lp_f0473a3990', 'lp_692bba530a', 'lp_98e5be5669', 'lp_c7d096cadc', 'lp_ccce7cf12f', 'lp_436fccf6c0', 'lp_6e8c2964fc']) {
    assert.equal(MAP[id], undefined, `${id}: eşlenmemeli (tahmin yok)`);
  }
  assert.equal(Object.keys(MAP).length, 19, 'eşleme sayısı 18 + 1');
});

check('K2F-24 ek tur: çoğul kuralı sentetik yanlış-pozitif sınaması (isim değil, fâil/sıfat; çoğul lemma değil; çekirdek ≥3)', () => {
  const tool = require('../../tools/kao2-curriculum-build.mjs');
  const salih = 'صالح';
  const misk = 'مسك';
  const lemma = (id, ar, pattern) => ({ id, ar, pos: 'N', pattern });
  const lex = { lemmas: [lemma('l_salih', salih, "ism-i fâil (fâ'il)"), lemma('l_misk', misk, "câmid isim (fa'l)"), lemma('l_cog', `${salih}ات`, "ism-i fâil (fâ'il, çoğul)")] };
  const word = (id, ar) => ({ ar, lemmaId: id, pronunciation: id, tr: id });
  const surahs = { prayerTexts: [{ id: 't', words: [
    word('lp_in', `ال${salih}ين`), word('lp_un', `ال${salih}ون`),
    word('lp_misk', `ال${misk}ين`), word('lp_cog', `${salih}اتين`),
    word('lp_fiil', 'أشهد')] }] };
  const { map } = tool.buildPrayerMap({ lex, surahs });
  assert.equal(map.lp_in, 'l_salih', '-în çoğulu fâil lemmasına bağlanır');
  assert.equal(map.lp_un, 'l_salih', '-ûn çoğulu fâil lemmasına bağlanır');
  assert.equal(map.lp_misk, undefined, 'câmid isim + -în (müsk+ín gibi) eşlenmez');
  assert.equal(map.lp_cog, undefined, 'zaten çoğul olan lemma tekrar çoğullanmaz');
  assert.equal(map.lp_fiil, undefined, 'e- önekli fiil eşlenmez');
});

check('K2F-24 Ünite 2: her dersin uygula adımı kendi namaz çapasına bağlı (örnek cümleye düşmez)', () => {
  const anchors = unit2.anchor.map((a) => a.replace(/^prayer:/, ''));
  for (const item of unit2.lessons) {
    assert.equal(item.apply.kind, 'prayer', `${item.id}: apply ${item.apply.kind}`);
    assert.ok(anchors.includes(item.apply.ref), `${item.id}: çapa dışı metin ${item.apply.ref}`);
    const ids = new Set(item.lemmaIds);
    const reach = prayerWords(item.apply.ref).some((w) => ids.has(w.lemmaId) || ids.has(MAP[w.lemmaId]));
    assert.ok(reach, `${item.id}: ${item.apply.ref} metni dersin hiçbir lemmasına bağlanmıyor`);
  }
  const lessonOfSalam = unit2.lessons.find((item) => item.lemmaIds.includes('l_sala_m_daff0b'));
  assert.equal(lessonOfSalam.apply.ref, 'tahiyyat', 'selâm/tayyibât/berekât dersi tahiyyat metnine bağlı');
});

check('K2F-24 uygula durumu: eşlenen lp_ kelimesi öğretilmişse known, ders yeniyse new, eşlenmeyen open; doğrudan l_ kelimeleri değişmez', () => {
  const target = unit2.lessons.find((item) => item.lemmaIds.includes('l_sala_m_daff0b'));
  const fresh = flow.lessonPlan({ quranLearn: freshQ() }, target.id, now, content).find((item) => item.kind === 'apply');
  const salam = fresh.words.find((w) => w.lemmaId === 'lp_7cb56720c0');
  assert.equal(salam.state, 'new', 'bu dersin yeni kelimesi namaz metninde "new"');
  assert.equal(salam.mappedLemmaId, 'l_sala_m_daff0b');
  const q = freshQ();
  introduceAll(q, unit2.lessons.flatMap((item) => item.lemmaIds));
  const done = flow.lessonPlan({ quranLearn: q }, target.id, now, content).find((item) => item.kind === 'apply');
  assert.equal(done.words.find((w) => w.lemmaId === 'lp_7cb56720c0').state, 'known');
  assert.equal(done.words.find((w) => w.lemmaId === 'lp_c7d096cadc').state, 'open', 'eşlenmeyen kelime open kalır');
  assert.equal(done.words.find((w) => w.lemmaId === 'l_ll_ah_d0a09b').state, 'open', 'Ünite 1 lemması bu ünitede öğretilmedi');
  assert.deepEqual(plain(done.words.map(({ ar, tr, lemmaId }) => ({ ar, tr, lemmaId }))), plain(prayerWords(target.apply.ref).map(({ ar, tr, lemmaId }) => ({ ar, tr, lemmaId }))));
});

check('K2F-24 tanış kartı: eşlenen namaz kelimesi çapa olarak kartta görünür', () => {
  const target = unit2.lessons.find((item) => item.lemmaIds.includes('l_sala_m_daff0b'));
  const intro = flow.lessonPlan({ quranLearn: freshQ() }, target.id, now, content).find((item) => item.kind === 'intro' && item.lemmaId === 'l_sala_m_daff0b');
  assert.ok(intro && intro.anchor && intro.anchor.lemmaId === 'lp_7cb56720c0', 'intro çapası eşlenen namaz kelimesi değil');
});

check('K2F-24 eşleme dosyası ve L2 listesi: araç çıktısı modülle aynı; eşleşmeyenler kimlik + neden ile listelenir', () => {
  const file = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/content/prayer-lemma-map.json'), 'utf8'));
  assert.deepEqual(plain(file.map), plain(MAP));
  const review = fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/inceleme/NAMAZ-ESLEME-L2.md'), 'utf8');
  const uniqueLp = new Set(prayerWordsAll().map((w) => w.lemmaId).filter((id) => id.startsWith('lp_')));
  const unmatched = [...uniqueLp].filter((id) => !MAP[id]);
  assert.ok(unmatched.length > 0);
  for (const id of unmatched) assert.ok(review.includes(id), `${id} L2 listesinde yok`);
  for (const id of Object.keys(MAP)) assert.ok(!review.includes(`| ${id} |`), `${id} eşlenmiş ama listede`);
  assert.ok(review.includes('lp_c7d096cadc') && /birden çok aday/.test(review), 'belirsiz aday nedeni yazılmamış');
  assert.equal(Object.keys(MAP).length + unmatched.length, uniqueLp.size);
  assert.ok(!/[\u0600-\u06FF]/.test(JSON.stringify(file)) && !/[\u0600-\u06FF]/.test(review), 'eşleme çıktıları Arapça harf içermez (P9)');
});

console.log(`KAO2-12 lesson flow: PASS (${passed} kontrol)`);
