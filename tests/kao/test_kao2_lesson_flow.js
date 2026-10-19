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

// K3P-A3 (AKIS §3): eski sıra "tanış ×N → kavram → pekiştir" idi (6 edilgin ekran art arda). Yeni ritimde her tanıştan hemen
// sonra o kelimenin 2 şıklı sorusu, kavramdan hemen sonra bir görev gelir; ayrıntılı 109 ders taraması test_k3p_rhythm.js.
check('sıra: hedef → [tanış → hemen sına] × yeni kelime → kavram + 1 görev → pekiştir → uygula → özet', () => {
  const q = freshQ(), before = JSON.stringify(q);
  const plan = flow.lessonPlan({ quranLearn: q }, lesson.id, now, content);
  assert.equal(JSON.stringify(q), before, 'ders planı veriyi değiştirdi');
  assert.equal(plan[0].kind, 'goal'); assert.equal(plan.at(-2).kind, 'apply'); assert.equal(plan.at(-1).kind, 'summary');
  const conceptAt = plan.findIndex((item) => item.kind === 'concept');
  const lastIntro = plan.map((item) => item.kind).lastIndexOf('intro');
  assert.ok(lastIntro > 0 && conceptAt > lastIntro, 'kavram tanış-sına döngüsünden sonra');
  plan.forEach((item, at) => {
    if (item.kind !== 'intro') return;
    const next = plan[at + 1];
    assert.equal(next.kind, 'practice', `${item.lemmaId} tanışından hemen sonra görev`);
    assert.equal(next.cardId, `w:${item.lemmaId}:ar>tr`); assert.equal(next.choiceCount, 2);
  });
  assert.equal(plan[conceptAt + 1].kind, 'practice', 'kavramdan hemen sonra görev');
  assert.ok(plan.slice(conceptAt + 1, -2).every((item) => item.kind === 'practice'), 'kavramdan sonra uygula ekranına kadar görev');
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

// K3P-A3: eski kontrol "ilk görev 2 şık" ve tek sıralı yön dizisi (ar>tr → ses → tr>ar → kavram) idi. Yeni ritimde tanış-sına
// görevleri 2 şıklı, diğerleri 4; karışık bölümde her tür tek blok hâlinde gelir (gramer yalnız K2F-11 için bölünebilir).
check('pekiştirme: 6–10 görev; tanış-sına görevleri 2, diğerleri 4 seçenek; karışık bölümde tür blokları', () => {
  const q = freshQ(), plan = flow.lessonPlan({ quranLearn: q }, lesson.id, now, content);
  const items = plan.filter((item) => item.kind === 'practice');
  assert.ok(items.length >= 6 && items.length <= 10, `görev sayısı ${items.length}`);
  const probes = plan.filter((item, at) => at > 0 && plan[at - 1].kind === 'intro');
  assert.ok(probes.length > 0 && probes.every((item) => item.choiceCount === 2), 'tanış-sına 2 şık');
  assert.ok(items.filter((item) => !probes.includes(item)).every((item) => item.choiceCount === 4), 'diğerleri 4 şık');
  const cat = (item) => item.group === 'concept' ? 'grammar' : item.direction;
  const mixed = plan.slice(plan.findIndex((item) => item.kind === 'concept') + 2, -2).map(cat);
  const seen = [];
  mixed.forEach((key, i) => { if (i && key === mixed[i - 1]) return; assert.ok(key === 'grammar' || !seen.includes(key), `${key} bloğu bölündü: ${mixed.join(',')}`); seen.push(key); });
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

// K3P-A3: eski kontrol "vadeli tekrar ayrı bir ön fazda (review), hedeften önce" idi. Yeni ritimde hedef önce, vadeli tekrar ısınmada.
check('oynatıcı: hedef önce, vadeli tekrar ısınmada; intro → hemen FSRS pekiştirme; çıkışta aynı görev; sesli soru Arapçayı saklar', () => {
  const q = freshQ(), reviewLemma = win.QuranLexiconV1.lemmas.find((item) => !lesson.lemmaIds.includes(item.id));
  const reviewCard = `w:${reviewLemma.id}:ar>tr`;
  q.cards[reviewCard] = { state: 'review', s: 8, reps: 2, due: '2026-09-28T00:00:00.000Z', introducedAt: '2026-09-20T00:00:00.000Z' };
  const data = { settings: {}, days: {}, quranLearn: q }, ui = { kaoView: 'home' }, state = { saves: 0, renders: 0 };
  assert.equal(api.registerQuranLearn({ data: () => data, ui: () => ui, save() { state.saves += 1; }, render() { state.renders += 1; }, todayStr: () => '2026-09-29', esc: (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])), icon: () => '', getDay: () => ({}) }), true);
  assert.equal(api.kaoLesson('start', lesson.id), true);
  assert.equal(ui.kaoLesson.phase, 'lesson'); assert.equal(ui.kaoLesson.plan[ui.kaoLesson.at].kind, 'goal', 'önce hedef');
  assert.equal(api.kaoLesson('next'), true);
  assert.equal(ui.kaoLesson.phase, 'practice');
  assert.equal(ui.kaoQueue.length, 1, 'tek vadeli kart ısınmada');
  const review = ui.kaoTasks[ui.kaoQueue[0].id];
  assert.equal(review.cardId, reviewCard);
  assert.equal(api.kaoAnswer(review.id, review.choices.find((choice) => choice.correct).choiceId).correct, true);
  assert.equal(api.kaoContinue(), true);
  assert.equal(ui.kaoLesson.phase, 'lesson'); assert.equal(ui.kaoLesson.plan[ui.kaoLesson.at].kind, 'intro', 'ısınmadan sonra ilk tanış');
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
  const audioPlan = curriculum.units.flatMap((unit) => unit.lessons).flatMap((entry) => flow.lessonPlan({ quranLearn: q }, entry.id, now, content)).find((item) => item.audioOnly && flow.ladderArm(item.cardId) === 'A');
  assert.ok(audioPlan, 'A kolunda ses görevi bulunur');
  q.cards[audioPlan.cardId] = { state: 'review', s: 3, reps: 1 };
  const audioTask = api.kaoBuildTask({ id: audioPlan.id, cardId: audioPlan.cardId, isNew: false }, data, { seed: audioPlan.id, choiceCount: 2, audioOnly: true });
  assert.equal(audioTask.rung, 'R2');
  assert.equal(audioTask.choices.length, 2); assert.equal(audioTask.audioOnly, true);
  const html = api.kaoTaskHTML(audioTask);
  assert.match(html, /Dinlediğin kelimenin anlamını seç/); assert.match(html, /class="kao-audio"/);
  assert.doesNotMatch(html, /lang="ar"|data-kao-ar/, 'ses sorusu cevaptan önce Arapça metni açığa çıkarmaz');
  assert.ok(state.saves >= 4, 'ilerleme ve FSRS kaydı kalıcılaştırıldı');
});

// K3P-13 (K-G): her ders bir âyet satırıyla açılır ve o satırın yaldızlanarak okunmasıyla kapanır.
// Çapa metni olan (namaz/sûre) derste satır, hedef lemmaların çapa metnindeki ilk-son geçişi arasındaki
// penceredir; çapa metni olmayan derste yeni lemmaların doğrulanmış ilk örnek cümlelerindeki kelimeler.
// Açılış (goal) ve kapanış (apply) AYNI satırı kullanır (goal.words === apply.words).
const allLessons = curriculum.units.flatMap((unit) => unit.lessons);

check("K3P-13 (K-G): 109 dersin 109'unda açılış ve kapanış AYNI satırı paylaşır (goal.words === apply.words)", () => {
  const q = freshQ();
  let prayer = 0, examples = 0;
  for (const item of allLessons) {
    const plan = flow.lessonPlan({ quranLearn: q }, item.id, now, content);
    const goal = plan.find((entry) => entry.kind === 'goal'), apply = plan.find((entry) => entry.kind === 'apply');
    assert.ok(goal && apply, `${item.id}: açılış/kapanış öğesi yok`);
    assert.equal(goal.words, apply.words, `${item.id}: açılış ve kapanış AYNI satırı paylaşmalı`);
    assert.ok(Array.isArray(apply.words), `${item.id}: satır dizisi yok`);
    if (item.apply.kind === 'examples') { examples += 1; assert.equal(apply.words.length, 0, `${item.id}: örnek modunda çapa kelimesi satırı boş`); }
    else { prayer += 1; assert.ok(apply.words.length > 0, `${item.id}: çapa metni satırı boş`); }
  }
  assert.equal(prayer, 14, 'çapa metinli (namaz/sûre) ders sayısı');
  assert.equal(examples, 95, 'çapa metni olmayan ders sayısı');
});

check('K3P-13 (K-G): çapa metni olan derste satır, çapa metninin hedef lemmalarını içeren penceresidir', () => {
  const q = freshQ();
  for (const item of allLessons.filter((entry) => entry.apply && entry.apply.kind !== 'examples')) {
    const plan = flow.lessonPlan({ quranLearn: q }, item.id, now, content);
    const goal = plan.find((entry) => entry.kind === 'goal'), apply = plan.find((entry) => entry.kind === 'apply');
    const ids = goal.lemmaIds.concat(goal.newLemmaIds), words = apply.words;
    const inside = words.map((word, index) => (ids.includes(word.mappedLemmaId || word.lemmaId) ? index : -1)).filter((index) => index >= 0);
    assert.ok(inside.length > 0, `${item.id}: çapa metninde hedef lemma yok`);
    // Pencere kuralı çalışma zamanında (görünüm testi) doğrulanır; burada çapa metni ve hedef tutarlılığı.
    assert.ok(words.length > 0, `${item.id}: çapa metni boş`);
  }
});

check('K3P-13 (K-G): günlük yeni kelime 0 (eski/içe aktarılmış veri) olsa da hiçbir derste kapanış satırı boş kalmaz', () => {
  // Çapa metinli ders satırını apply.words taşır; çapa metni olmayan ders satırını yeni lemmaların
  // örnek cümlelerinden çalışma zamanında kurar (bkz. test_k3p_lesson_ayah). Burada plan tutarlılığı denetlenir.
  for (const dailyNew of [0, 1]) {
    const q = freshQ(); q.settings.dailyNew = dailyNew;
    for (const item of allLessons) {
      const plan = flow.lessonPlan({ quranLearn: q }, item.id, now, content);
      const apply = plan.find((entry) => entry.kind === 'apply'), goal = plan.find((entry) => entry.kind === 'goal');
      assert.equal(goal.words, apply.words, `${item.id} (dailyNew=${dailyNew}): açılış/kapanış satırı ortak değil`);
      assert.ok((goal.lessonIds || []).length > 0, `${item.id} (dailyNew=${dailyNew}): ders lemması yok`);
      if (item.apply.kind !== 'examples') assert.ok((apply.words || []).length > 0, `${item.id} (dailyNew=${dailyNew}): çapa metni satırı boş`);
    }
  }
});

check('K3P-13 (K-G): açılış ve kapanış AYNI satırı Tezhip olarak çizer; "Yaldızla" kelimeleri sırayla yaldızlar', () => {
  const t = bootKao();
  const q = freshUser(t);
  q.onboarding.minutes = 15;
  t.ui.kaoLatency = [6000];
  const target = t.win.QuranCurriculumV2.units[3].lessons[0];
  assert.equal(t.api.kaoLesson('start', target.id), true);
  const rowOf = (html) => (html.match(/<div class="kao-lesson-apply-tezhip">([\s\S]*?)<\/div>/) || ['', ''])[1];
  const goalRow = rowOf(t.api.kaoOverlayHTML(t.NOW));
  assert.ok(goalRow.includes('kao-tezhip-word'), 'açılışta Tezhip satırı yok');
  assert.equal(playLesson(t, { stopAt: 'apply' }), true, 'kapanış adımına ulaşılamadı');
  const applyHtml = t.api.kaoOverlayHTML(t.NOW);
  assert.equal(rowOf(applyHtml), goalRow, 'açılış ve kapanış satırı aynı değil');
  assert.match(applyHtml, /kao-play-start/, 'Yaldızla düğmesi yok');
  assert.equal((applyHtml.match(/is-gild/g) || []).length, 0, 'başlangıçta yaldız statik değil');
  // Statik ilerleme (hareket azaltma yok, timer yok): kelimeler sırayla yaldızlanır.
  assert.equal(t.api.kaoLesson('gild'), true);
  for (let guard = 0; guard < 50 && t.ui.kaoGildTimer; guard += 1) { const timer = t.timers[t.ui.kaoGildTimer - 1]; if (timer && timer.fn) timer.fn(); else break; }
  const words = (goalRow.match(/kao-tezhip-word/g) || []).length;
  assert.equal((t.api.kaoOverlayHTML(t.NOW).match(/is-gild/g) || []).length, words, 'tüm satır yaldızlanmadı');
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
  // Sayı değil KÜME sabitlenir: kural gevşer ya da metin değişirse yeni (belki yanlış-pozitif) eşleme bilinçli onay ister.
  assert.deepEqual(Object.keys(MAP).sort(), ['lp_060fad1342', 'lp_10bcd8764a', 'lp_25704375a0', 'lp_31fee142df', 'lp_5cfe478ddb', 'lp_67dad87faf',
    'lp_6cc3dd4445', 'lp_779a7fd410', 'lp_79cb46c8fc', 'lp_7ae90ff4c5', 'lp_7cb56720c0', 'lp_820672c615', 'lp_832ee02139', 'lp_99236de03d',
    'lp_999a97b04a', 'lp_99f327d450', 'lp_cd25a85435', 'lp_e3ae18f2ca', 'lp_e5958c3b77'], 'eşlenen kelime kümesi değişti (19 beklenir)');
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
  const file = JSON.parse(fs.readFileSync(path.join(repoRoot, 'kaynak/kuran/kao2/prayer-lemma-map.json'), 'utf8'));
  assert.deepEqual(plain(file.map), plain(MAP));
  const review = fs.readFileSync(path.join(repoRoot, 'kaynak/kuran/inceleme/NAMAZ-ESLEME-L2.md'), 'utf8');
  const uniqueLp = new Set(prayerWordsAll().map((w) => w.lemmaId).filter((id) => id.startsWith('lp_')));
  const unmatched = [...uniqueLp].filter((id) => !MAP[id]);
  assert.ok(unmatched.length > 0);
  for (const id of unmatched) assert.ok(review.includes(id), `${id} L2 listesinde yok`);
  for (const id of Object.keys(MAP)) assert.ok(!review.includes(`| ${id} |`), `${id} eşlenmiş ama listede`);
  assert.ok(review.includes('lp_c7d096cadc') && /birden çok aday/.test(review), 'belirsiz aday nedeni yazılmamış');
  assert.equal(Object.keys(MAP).length + unmatched.length, uniqueLp.size);
  assert.ok(!/[\u0600-\u06FF]/.test(JSON.stringify(file)) && !/[\u0600-\u06FF]/.test(review), 'eşleme çıktıları Arapça harf içermez (P9)');
});

// K2F-25 (K5-05 · D-01): tanış kartı katmanları — doğrulanmış örnek âyet + "Neden böyle?" (kök anlamı, unit11 türevleri, kognat kayması).
// K3P-A8 (D-4/A-8): bu katmanlar artık tek bir yerel <details><summary>Daha fazla</summary>…</details> içinde
// açılır (ilk görünüm ≤ 45 sözcük). İçerik metni değişmedi; yalnız sunum değişti.
const unit11Roots = new Map(win.QuranGrammarV1.unit11.roots.map((row) => [row.root, row]));
const expectedWhy = (lemma) => ({ root: unit11Roots.get(lemma.root) || null, shift: lemma.cognate && lemma.cognate.shift ? String(lemma.cognate.shift) : '' });
// K3P-A3: tanış ekranları artık art arda değil (her birinden sonra bir görev); görevler gerçek handler'la cevaplanıp kavrama kadar sürülür.
function introCards(t, lessonId) {
  assert.equal(t.api.kaoLesson('start', lessonId), true);
  const cards = [];
  for (let guard = 0; guard < 80; guard += 1) {
    if (t.ui.kaoLesson.phase === 'practice') {
      const task = t.ui.kaoTasks[t.ui.kaoQueue[t.ui.kaoTaskIndex].id];
      t.api.kaoAnswer(task.id, (task.choices.find((choice) => choice.correct) || task.choices[0]).choiceId); t.api.kaoContinue();
      continue;
    }
    const item = t.ui.kaoLesson.plan[t.ui.kaoLesson.at];
    if (!item) break;
    if (item.kind === 'intro') cards.push({ lemmaId: item.lemmaId, html: t.api.kaoOverlayHTML(t.NOW) });
    if (item.kind === 'concept' || item.kind === 'apply' || item.kind === 'summary') break;
    t.api.kaoLesson('next');
  }
  return cards;
}

check('K2F-25 tanış kartı: her yeni kelimede doğrulanmış ilk örnek âyet (Arapça + okunuş + Türkçe + künye) gösterilir; 12 ünitenin ilk dersi, gerçek akış', () => {
  let seen = 0;
  for (const unit of curriculum.units) {
    const t = bootKao();
    freshUser(t);
    for (const card of introCards(t, unit.lessons[0].id)) {
      const lemma = win.QuranLexiconV1.byId(card.lemmaId);
      const example = lemma.examples[0];
      const flat = text(card.html);
      assert.ok(card.html.includes(example.ar), `${card.lemmaId}: örnek Arapça yok`);
      assert.ok(flat.includes(example.pronunciation), `${card.lemmaId}: okunuş yok`);
      assert.ok(flat.includes(example.tr), `${card.lemmaId}: Türkçe yok`);
      assert.ok(flat.includes(example.ref), `${card.lemmaId}: künye yok`);
      seen += 1;
    }
  }
  assert.ok(seen >= 24, `az tanış kartı sınandı: ${seen}`);
});

check('K2F-25 + K3P-A8 "Daha fazla": kök anlamı + unit11 türevleri + kognat kayması + örnek âyet; katman içeriğe göre kurulur ve en çok bir <details>; ≤1 kao-primary', () => {
  let withLayer = 0, withoutLayer = 0, sawRoot = 0, sawShift = 0, sawExample = 0;
  for (const unit of curriculum.units) {
    const t = bootKao();
    freshUser(t);
    for (const card of introCards(t, unit.lessons[0].id)) {
      const why = expectedWhy(win.QuranLexiconV1.byId(card.lemmaId));
      const flat = text(card.html);
      const details = (card.html.match(/<details/g) || []).length;
      assert.ok(details <= 1, `${card.lemmaId}: ${details} details`);
      assert.ok((card.html.match(/kao-primary/g) || []).length <= 1, `${card.lemmaId}: birden çok kao-primary`);
      if (!why.root && !why.shift) { assert.ok(!flat.includes('Neden böyle?'), `${card.lemmaId}: içeriksiz "Neden böyle?" başlığı`); withoutLayer += 1; continue; }
      assert.equal(details, 1, `${card.lemmaId}: "Neden böyle?" yok`);
      assert.match(card.html, /<details class="kao-lesson-more"><summary>Daha fazla<\/summary>/, `${card.lemmaId}: katlanan blok "Daha fazla" başlığı taşımıyor`);
      assert.ok(flat.includes('Neden böyle?'), `${card.lemmaId}: başlık yok`);
      withLayer += 1;
      if (/<details class="kao-lesson-more"/.test(card.html) && card.html.includes('kao-lesson-example')) sawExample += 1;
      if (why.root) { sawRoot += 1; assert.ok(flat.includes(why.root.meaning), `${card.lemmaId}: kök anlamı yok`); why.root.derivatives.forEach((d) => assert.ok(flat.includes(d.tr), `${card.lemmaId}: türev ${d.tr} yok`)); }
      if (why.shift) { sawShift += 1; assert.ok(flat.includes(why.shift), `${card.lemmaId}: kayma uyarısı yok`); }
    }
  }
  assert.ok(withLayer > 0 && withoutLayer > 0 && sawRoot > 0 && sawShift > 0, `kapsam: katmanlı ${withLayer} katmansız ${withoutLayer} kök ${sawRoot} kayma ${sawShift}`);
});

check('K2F-25 doğrulanmamış örnek hiç gösterilmez (verified:false ya da okunuşsuz): kartta örnek bloğu ve künye yok', () => {
  const firstLesson = curriculum.units[0].lessons[0];
  const firstId = firstLesson.lemmaIds[0];
  const reference = win.QuranLexiconV1.byId(firstId).examples[0];
  // Her varyant taze VM'de: ikinci başlatmada kelime zaten tanışılmış sayılır.
  const cardWith = (patch) => {
    const t = bootKao();
    freshUser(t);
    const original = t.win.QuranLexiconV1;
    t.win.QuranLexiconV1 = Object.assign({}, original, { byId: (id) => { const lemma = original.byId(id); return id === firstId ? Object.assign({}, lemma, patch(lemma)) : lemma; } });
    return introCards(t, firstLesson.id).find((c) => c.lemmaId === firstId);
  };
  // Pozitif kontrol: doğrulanmış ve okunuşlu örnek sözlükten karta ulaşır (aşağıdaki "gizli" sonuçları boş yere geçmesin).
  const control = cardWith((lemma) => ({ examples: [Object.assign({}, lemma.examples[0], { tr: 'KONTROL-CEVIRI' })] }));
  assert.ok(control && text(control.html).includes('KONTROL-CEVIRI'), 'doğrulanmış örnek sözlükten karta ulaşmadı (kontrol)');
  for (const patch of [() => ({ verified: false }), (lemma) => ({ examples: [Object.assign({}, lemma.examples[0], { pronunciation: '' })] })]) {
    const card = cardWith(patch);
    assert.ok(card, 'tanış kartı üretilmedi');
    assert.ok(!card.html.includes(reference.ar), 'doğrulanmamış örneğin Arapçası göründü');
    assert.ok(!text(card.html).includes(reference.tr), 'doğrulanmamış örneğin çevirisi göründü');
  }
});

// K2F-26 ek tur: geri getirme kartı kalkıp yerini ders girişi alırken klavye/ekran okuyucu odağı kaybolmaz.
check('K2F-26 ek tur: Arapça sekmesinde kartı geri getirince odak yeni ders girişine (kao-hub-entry) verilir; başka sekmede odak çağrısı yok', () => {
  const t = bootKao();
  freshUser(t);
  t.data.quranLearn.settings.kaoVisible = false;
  t.ui.faithTab = 'arapca';
  assert.match(t.api.kaoHubCardHTML(), /id="kao-hub-restore"/);
  assert.equal(t.api.kaoToggleVisible(), true);
  assert.deepEqual(t.calls.restore, ['kao-hub-entry'], 'odak ders girişine dönmedi');
  assert.match(t.api.kaoHubCardHTML(), /id="kao-hub-entry"/);
  const other = bootKao();
  freshUser(other);
  other.ui.faithTab = 'oz';
  other.api.kaoToggleVisible();
  assert.deepEqual(other.calls.restore, [], 'Arapça dışında odak çağrısı olmamalı');
});

check('K2F-37 ek (ekran görüntüsü): ders oynatıcıdaki kavram tablosu hücrelerinde Arapça + okunuş gösterilir, çıplak âyet referansı (2:17:3) gösterilmez', () => {
  const t = bootKao();
  const q = freshUser(t);
  q.onboarding.minutes = 15;
  t.ui.kaoLatency = [6000];
  const grammar = t.win.QuranGrammarV1, cur = t.win.QuranCurriculumV2;
  const conceptLessons = [];
  cur.units.forEach((u) => u.lessons.forEach((l) => conceptLessons.push(l.id)));
  assert.equal(conceptLessons.length, 109, 'tüm dersler taranır; kavram aşaması olmayan atlanır');
  let tables = 0, arabicCells = 0;
  const bad = [];
  for (const lessonId of conceptLessons) {
    assert.equal(t.api.kaoLesson('start', lessonId), true);
    const plan = t.ui.kaoLesson.plan;
    const at = plan.findIndex((item) => item.kind === 'concept');
    if (at < 0) continue;
    t.ui.kaoLesson.at = at; t.ui.kaoLesson.phase = 'lesson';
    const html = t.api.kaoOverlayHTML(t.NOW).replace(/&#39;/g, "'");
    for (const table of html.match(/<table class="kao-lesson-table">[\s\S]*?<\/table>/g) || []) {
      tables += 1;
      for (const cell of table.match(/<td>[\s\S]*?<\/td>/g) || []) {
        const inner = text(cell);
        if (/^\d+:\d+(?::\d+)?$/.test(inner)) bad.push(`${lessonId}: ${inner}`);
        if (/lang="ar"/.test(cell)) arabicCells += 1;
      }
    }
    t.api.kaoLesson('exit');
  }
  assert.ok(grammar.concepts.some((c) => (c.tables || []).some((tb) => (tb.rows || []).some((r) => (r.cells || []).some(Array.isArray)))), 'veri: Arapça hücreli tablo yok');
  assert.deepEqual(bad, [], `tablo hücresinde çıplak referans: ${bad.slice(0, 4).join(' | ')}`);
  assert.ok(tables >= 10 && arabicCells >= 30, `Arapça hücreler çizilmiyor (tablo ${tables}, Arapça hücre ${arabicCells})`);
});

console.log(`KAO2-12 lesson flow: PASS (${passed} kontrol)`);
