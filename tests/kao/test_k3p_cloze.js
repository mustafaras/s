'use strict';
// K3P-18 · R4 "âyette boşluk" (TASARIM §4, KARTLAR.md). Sentetik node:vm; ağ, tarayıcı, depo yok.
// Ölçülenler:
//   1) UYGUNLUK: görev yalnız lemma.verified ∧ örnek âyet (ar/tr/ref/okunuş) ∧ hedef kelime âyette
//      TAM KELİME olarak geçtiğinde kurulur; aksi hâlde kurucu cloze ÜRETMEZ ve kart BİR basamak iner.
//   2) BOŞLUK KONUMU: âyette ve okunuşta boşluk AYNI kelime konumundadır; boşalan kelime tam olarak
//      hedef kelimedir ve cevap ne âyette ne okunuşta tam kelime olarak kalmaz (sızma yok).
//   3) ŞIKLAR: dört şık, etiketler ve kimlikler TEKİL; tam bir doğru şık vardır ve o şık hedef kelimedir;
//      çeldiriciler aynı türden ve farklı kökten gelir (kaoPickDistractors süzgeci).
//   4) CEVAP YOLU: gerçek App.kaoAnswer ile doğru şık doğru, yanlış şık yanlış sayılır ve FSRS ilerler.
//   5) A11Y: her şıkkın erişilebilir adı vardır (glif + donmuş okunuş).
//   6) DOĞRULANMAMIŞ ÖRNEK KULLANILMAZ: verified olmayan lemma cloze kurmaz (hiçbir örnek âyeti gösterilmez).
const assert = require('node:assert/strict');
const { bootKao, playLesson } = require('./helpers/kao-harness');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

const t = bootKao({ seeded: true });
const api = t.api;
const lex = t.win.QuranLexiconV1;
const bare = (value) => String(value || '').replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/g, '');
const BLANK = '…';

// Kurucu, örneği yalnız kaoIntroExample'dan (verified kapısı) alır; fixture kendi uygunluğunu bağımsız kurar.
const usable = (lemma) => lemma.verified === true && Array.isArray(lemma.examples) && lemma.examples.length > 0
  && ['ar', 'tr', 'ref', 'pronunciation'].every((key) => typeof lemma.examples[0][key] === 'string' && lemma.examples[0][key]);
const blankIndex = (lemma) => {
  const example = lemma.examples[0];
  const words = example.ar.split(/\s+/).map(bare);
  return words.indexOf(bare(lemma.ar));
};
const eligible = (lemma) => usable(lemma) && blankIndex(lemma) >= 0
  && lemma.examples[0].ar.split(/\s+/).length === lemma.examples[0].pronunciation.split(/\s+/).length;
const ineligible = (lemma) => !eligible(lemma);

// R4 kartı: A kolu + s ≥ 30. Her kurulumdan önce kart aynı duruma yazılır (FSRS basamağı kaydırmasın).
// Kart, R4 için üç çeldirici de ister (aynı tür/farklı kök, s≥21 komşular). Havuzu yetmeyen kart
// cloze kurmaz ve R3'e iner; fixture bu yüzden havuzu YETERLİ olan kartı seçer.
const hasPool = (cardId) => (api.kaoPickDistractors(t.data, cardId, 3, { seed: 'pool' }) || []).length >= 3;
const r4Card = () => {
  const q = t.data.quranLearn;
  for (const lemma of lex.lemmas) {
    if (!eligible(lemma)) continue;
    for (const dir of ['ar>tr', 'tr>ar']) {
      const cardId = `w:${lemma.id}:${dir}`;
      if (t.win.SeymaQuranLearnFlow.ladderArm(cardId) !== 'A') continue;
      if (!hasPool(cardId)) continue;
      q.cards[cardId] = { state: 'review', s: 40, reps: 8, due: '2026-09-29T00:00:00.000Z' };
      if (t.win.SeymaQuranLearnFlow.ladderRung(q.cards[cardId]) === 'R4') return { lemma, cardId };
    }
  }
  return null;
};
const fixture = r4Card();
assert.ok(fixture, 'R4 uygun kart bulunmalı');
const resetCard = () => { t.data.quranLearn.cards[fixture.cardId] = { state: 'review', s: 40, reps: 8, due: '2026-09-29T00:00:00.000Z' }; };
const cloze = (suffix = '') => { resetCard(); return api.kaoBuildTask({ id: `k3p-18-${fixture.cardId}${suffix}`, cardId: fixture.cardId, isNew: false }, t.data, { seed: `k3p-18${suffix}` }); };

check('uygunluk: cloze yalnız doğrulanmış örnekte ve hedef kelime âyette tam kelimeyken kurulur', () => {
  const task = cloze();
  assert.equal(task.kind, 'cloze');
  assert.equal(task.rung, 'R4');
  assert.equal(task.cardId, fixture.cardId);
  const example = fixture.lemma.examples[0];
  assert.equal(task.meaning, `${example.tr} · ${example.ref}`, 'anlam ve âyet künyesi görünür');
  assert.ok(usable(fixture.lemma), 'hedefin örneği doğrulanmış');
});

check('boşluk konumu: âyette ve okunuşta aynı kelime boşalır; boşalan kelime hedeftir, cevap sızmaz', () => {
  const task = cloze();
  const example = fixture.lemma.examples[0];
  const expected = blankIndex(fixture.lemma);
  const ayahWords = task.ar.split(/\s+/), pronWords = task.pronunciation.split(/\s+/);
  assert.equal(ayahWords.indexOf(BLANK), expected, 'boşluk âyette doğru konumda');
  assert.equal(pronWords.indexOf(BLANK), expected, 'boşluk okunuşta aynı konumda');
  assert.equal(ayahWords.length, example.ar.split(/\s+/).length, 'kelime sayısı korunur');
  assert.equal(pronWords.length, example.pronunciation.split(/\s+/).length, 'okunuş kelime sayısı korunur');
  // Sızma kontrolü TAM KELİME üzerinden: harekeli cevap başka kelimenin alt dizisi olabilir («مَن» ⊂ «ءَامَنَّا»).
  assert.ok(!ayahWords.map(bare).includes(bare(fixture.lemma.ar)), 'cevap âyette tam kelime olarak kalmamalı');
  assert.ok(!pronWords.map(bare).includes(bare(task.translit)), 'okunuşta hedefin okunuşu kalmamalı');
  // Boşalan konum gerçekten hedef kelimeydi: örnek âyetin o kelimesi hedefle aynıdır.
  assert.equal(bare(example.ar.split(/\s+/)[expected]), bare(fixture.lemma.ar), 'boşalan kelime hedef kelimedir');
});

check('şıklar: dört tekil şık, tam bir doğru ve çeldiriciler aynı türden farklı kökten', () => {
  const task = cloze();
  assert.equal(task.choices.length, 4, 'dört şık');
  assert.equal(new Set(task.choices.map((choice) => choice.label)).size, 4, 'etiketler tekil');
  assert.equal(new Set(task.choices.map((choice) => choice.choiceId)).size, 4, 'kimlikler tekil');
  const correct = task.choices.filter((choice) => choice.correct === true);
  assert.equal(correct.length, 1, 'tam bir doğru şık');
  assert.equal(correct[0].label, task.answer, 'doğru şık hedef kelimedir');
  assert.equal(bare(correct[0].label), bare(fixture.lemma.ar));
  const target = fixture.lemma;
  for (const choice of task.choices.filter((item) => item.correct !== true)) {
    assert.notEqual(bare(choice.label), bare(target.ar), 'çeldirici hedef kelime değil');
    const other = lex.byId(String(choice.cardId).replace(/^w:(.+):(ar>tr|tr>ar)$/, '$1'));
    assert.ok(other, 'çeldirici bir lemmaya bağlı');
    assert.equal(other.pos, target.pos, `çeldirici aynı türden olmalı (${other.pos}/${target.pos})`);
    if (target.root && other.root) assert.notEqual(other.root, target.root, 'çeldirici farklı kökten');
  }
});

check('cevap yolu: doğru şık doğru, yanlış şık yanlış sayılır (gerçek kaoAnswer + FSRS)', () => {
  const queue = (task) => { t.ui.kaoQueue = [{ id: task.id, cardId: task.cardId, isNew: false }]; t.ui.kaoTasks = { [task.id]: task };
    t.ui.kaoTaskIndex = 0; t.ui.kaoTaskStartedAt = Date.now(); t.ui.kaoUndo = null; t.ui.kaoPanel = { open: false }; t.ui.kaoOrderDraft = []; };
  const good = cloze(':right');
  queue(good);
  const result = api.kaoAnswer(good.id, good.choices.find((choice) => choice.correct === true).choiceId);
  assert.equal(result.correct, true, 'doğru şık doğru sayılmalı');
  assert.ok(t.data.quranLearn.cards[good.cardId].reps > 8, `doğru cevap FSRS tekrarını ilerletir (reps ${t.data.quranLearn.cards[good.cardId].reps})`);
  const bad = cloze(':wrong');
  queue(bad);
  const wrongChoice = bad.choices.find((choice) => choice.correct !== true);
  const before = t.data.quranLearn.errors.root;
  const wrongResult = api.kaoAnswer(bad.id, wrongChoice.choiceId);
  assert.equal(wrongResult.correct, false, 'yanlış şık yanlış sayılmalı');
  assert.equal(t.data.quranLearn.errors.root, before + 1, 'kök karışması errors.root kovasına yazılır');
  assert.ok(t.data.quranLearn.cards[bad.cardId].reps > 8, 'yanlış cevap da kartı ilerletir');
  assert.equal(t.data.quranLearn.cards[bad.cardId].lastDistractors.length > 0, true, 'çeldiriciler hatırlanır');
});

check('a11y: her şıkkın erişilebilir adı var (glif + donmuş okunuş)', () => {
  const task = cloze();
  const html = api.kaoTaskHTML(task);
  // Görünüm etiketi HTML kaçışından geçer («'» → «&#39;»); karşılaştırma kaçış çözülerek yapılır.
  const unescape = (value) => String(value).replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"');
  const names = new Set([...html.matchAll(/aria-label="([^"]*)"/g)].map((match) => unescape(match[1])));
  for (const choice of task.choices) {
    assert.ok(choice.pronunciation, `${choice.label}: okunuş var`);
    assert.ok(names.has(`${choice.label}, okunuşu ${choice.pronunciation}`), `${choice.label}: erişilebilir ad`);
  }
  assert.ok(html.includes('Âyette boşluk'), 'başlık cloze görevini anlatır');
  assert.ok(!html.includes('kao-content-error'), 'okunuş doğrulanmış, uyarı çıkmaz');
});

check('doğrulanmamış örnek hiç kullanılmaz: uygun olmayan lemma cloze kurmaz', () => {
  const bad = lex.lemmas.filter(ineligible);
  assert.ok(bad.length > 0, 'uygun olmayan lemma var');
  for (const lemma of bad.slice(0, 40)) {
    for (const dir of ['ar>tr', 'tr>ar']) {
      const cardId = `w:${lemma.id}:${dir}`;
      t.data.quranLearn.cards[cardId] = { state: 'review', s: 40, reps: 8, due: '2026-09-29T00:00:00.000Z' };
      if (t.win.SeymaQuranLearnFlow.ladderArm(cardId) !== 'A') continue;
      const built = api.kaoBuildTask({ id: `ineligible:${cardId}`, cardId, isNew: false }, t.data, { seed: 'ineligible' });
      assert.notEqual(built && built.kind, 'cloze', `${lemma.id} (${dir}): cloze kurulmamalı`);
      // R4 uygun değilse BİR basamak iner (R3) — iki değil (TASARIM §4 "unutma kuralı").
      assert.ok(built && (built.rung === 'R3' || built.rung === 'R2'), `${lemma.id}: en çok bir basamak inmeli`);
      assert.notEqual(built && built.rung, 'R4', `${lemma.id}: R4'te kalmamalı`);
    }
  }
});

// Gerçek ders taramasında da cloze üretildiğini doğrula (yalnız kurucu değil, akış da bağlı).
check('akis: yerleşik kullanıcının ders taramasında cloze görevi üretilir', () => {
  let seen = 0;
  for (const unit of t.win.QuranCurriculumV2.units) {
    for (const lesson of unit.lessons) {
      t.ui.kaoLesson = null;
      if (!api.kaoLesson('start', lesson.id)) continue;
      playLesson(t, { visit(task) { if (task.type === 'word' && task.kind === 'cloze') seen += 1; } });
      api.kaoLesson('exit');
    }
  }
  assert.ok(seen > 0, `akışta cloze üretilmeli (görülen ${seen})`);
});

check('tam lemma × iki yön × üç tohum matrisi: yalnız aynı POS, kök şartı ve sızıntısız cloze', () => {
  const matrix = bootKao({ seeded: true });
  const matrixLex = matrix.win.QuranLexiconV1;
  const matrixLemmas = matrixLex.lemmas.filter(eligible);
  const matrixCards = matrix.data.quranLearn.cards;
  for (const lemma of matrixLex.lemmas) {
    for (const direction of ['ar>tr', 'tr>ar']) {
      matrixCards[`w:${lemma.id}:${direction}`] = { state: 'review', s: 40, reps: 8, due: '2026-09-29T00:00:00.000Z' };
    }
  }
  const before = JSON.stringify(matrix.data.quranLearn.cards);
  const counts = { pairs: 0, seeds: 0, armA: 0, armB: 0, cloze: 0, repeatedFallback: 0,
    insufficientFallback: 0, wrongPos: 0, sameKnownRoot: 0, duplicateLabels: 0,
    wrongCorrectCount: 0, repeatedLeaks: 0, rootlessTargetClozes: 0, deterministic: false };
  for (const lemma of matrixLemmas) {
    const targetBare = bare(lemma.ar);
    const exampleWords = lemma.examples[0].ar.split(/\s+/).map(bare);
    const targetOccurrences = exampleWords.filter((word) => word === targetBare).length;
    for (const direction of ['ar>tr', 'tr>ar']) {
      const cardId = `w:${lemma.id}:${direction}`;
      const arm = matrix.win.SeymaQuranLearnFlow.ladderArm(cardId);
      counts.pairs += 1;
      counts[arm === 'A' ? 'armA' : 'armB'] += 1;
      for (let seedIndex = 0; seedIndex < 3; seedIndex += 1) {
        const seed = `k3pd12-matrix-${seedIndex}`;
        const taskId = `k3pd12-matrix-${seedIndex}-${cardId}`;
        const task = matrix.api.kaoBuildTask({ id: taskId, cardId, isNew: false }, matrix.data, { seed });
        counts.seeds += 1;
        assert.ok(task, `${taskId}: task exists`);
        if (arm === 'B') {
          assert.notEqual(task.kind, 'cloze', `${taskId}: B arm does not produce R4 cloze`);
          continue;
        }
        if (targetOccurrences !== 1) {
          counts.repeatedFallback += 1;
          assert.notEqual(task.kind, 'cloze', `${taskId}: repeated target uses safe fallback`);
          assert.ok(task.rung === 'R3' || task.rung === 'R2', `${taskId}: one-step example fallback or recorded R2 rule`);
          if (task.ar) {
            const remaining = task.ar.split(/\s+/).map(bare).filter((word) => word === targetBare).length;
            if (remaining > 0) counts.repeatedLeaks += 1;
          }
          continue;
        }
        if (task.kind !== 'cloze') {
          counts.insufficientFallback += 1;
          assert.equal(task.rung, 'R2', `${taskId}: insufficient suitable options fall to recorded R2`);
          continue;
        }
        counts.cloze += 1;
        assert.equal(task.rung, 'R4', `${taskId}: cloze remains R4`);
        assert.equal(task.choices.length, 4, `${taskId}: exactly four choices`);
        const correct = task.choices.filter((choice) => choice.correct === true);
        assert.equal(correct.length, 1, `${taskId}: exactly one correct choice`);
        assert.equal(correct[0].label, task.answer, `${taskId}: correct choice is the target`);
        if (new Set(task.choices.map((choice) => choice.choiceId)).size !== 4
          || new Set(task.choices.map((choice) => choice.label)).size !== 4) counts.duplicateLabels += 1;
        const arWords = task.ar.split(/\s+/).map(bare);
        const pronWords = task.pronunciation.split(/\s+/);
        assert.equal(arWords.filter((word) => word === BLANK).length, 1, `${taskId}: one Arabic blank`);
        assert.equal(pronWords.filter((word) => word === BLANK).length, 1, `${taskId}: one pronunciation blank`);
        assert.equal(arWords.indexOf(BLANK), pronWords.indexOf(BLANK), `${taskId}: aligned blank position`);
        if (arWords.includes(targetBare)) counts.repeatedLeaks += 1;
        assert.ok(!arWords.includes(targetBare), `${taskId}: target does not leak in Arabic text`);
        const targetReading = String(task.translit || '').trim();
        assert.ok(!targetReading || !pronWords.includes(targetReading), `${taskId}: target reading does not leak`);
        if (!lemma.root) counts.rootlessTargetClozes += 1;
        for (const choice of task.choices.filter((item) => item.correct !== true)) {
          const match = /^w:([^:]+):(ar>tr|tr>ar)$/.exec(String(choice.cardId || ''));
          const other = match && matrixLex.byId(match[1]);
          if (!other || other.pos !== lemma.pos) counts.wrongPos += 1;
          if (other && lemma.root && other.root && other.root === lemma.root) counts.sameKnownRoot += 1;
        }
        if (!counts.deterministic) {
          const repeat = matrix.api.kaoBuildTask({ id: taskId, cardId, isNew: false }, matrix.data, { seed });
          assert.deepEqual(repeat, task, `${taskId}: same input produces same cloze`);
          counts.deterministic = true;
        }
      }
    }
  }
  assert.equal(counts.repeatedLeaks, 0, 'no repeated target leak');
  assert.equal(counts.wrongPos, 0, 'no different-POS cloze distractors');
  assert.equal(counts.sameKnownRoot, 0, 'roots differ when both roots exist');
  assert.equal(counts.duplicateLabels, 0, 'choice labels and IDs are unique');
  assert.equal(counts.wrongCorrectCount, 0, 'all clozes have one correct choice');
  assert.ok(counts.cloze > 0, 'matrix includes valid cloze tasks');
  assert.ok(counts.repeatedFallback > 0, 'matrix includes repeated-target fallback');
  assert.ok(counts.deterministic, 'determinism was checked');
  assert.equal(JSON.stringify(matrix.data.quranLearn.cards), before, 'task construction does not mutate card data');
  console.log(`cloze-matrix: ${JSON.stringify(counts)}`);
});

check('önceki çeldirici dışlanır ve iki uygun çeldiricide cloze doğrudan R2’ye düşer', () => {
  const probe = bootKao({ seeded: true });
  const probeLex = probe.win.QuranLexiconV1;
  const singleOccurrence = (lemma) => eligible(lemma)
    && lemma.examples[0].ar.split(/\s+/).map(bare).filter((word) => word === bare(lemma.ar)).length === 1;
  let previousCase = null;
  for (const lemma of probeLex.lemmas) {
    if (!singleOccurrence(lemma)) continue;
    for (const direction of ['ar>tr', 'tr>ar']) {
      const cardId = `w:${lemma.id}:${direction}`;
      if (probe.win.SeymaQuranLearnFlow.ladderArm(cardId) !== 'A') continue;
      for (const candidate of probeLex.lemmas) {
        probe.data.quranLearn.cards[`w:${candidate.id}:ar>tr`] = { state: 'review', s: 40, reps: 8 };
      }
      probe.data.quranLearn.cards[cardId] = { state: 'review', s: 40, reps: 8 };
      const pool = probe.api.kaoPickDistractors(probe.data, cardId, 4, { seed: 'k3pd12-previous', cloze: true });
      if (pool.length >= 4) { previousCase = { lemma, cardId, previous: pool[0].cardId }; break; }
    }
    if (previousCase) break;
  }
  assert.ok(previousCase, 'önceki çeldirici deneyi için 4 uygun aday var');
  probe.data.quranLearn.cards[previousCase.cardId].lastDistractors = [previousCase.previous];
  const afterPrevious = probe.api.kaoBuildTask({ id: 'k3pd12-previous', cardId: previousCase.cardId }, probe.data, { seed: 'k3pd12-previous' });
  assert.equal(afterPrevious.kind, 'cloze', 'kalan 3 uygun seçenek cloze için yeterli');
  const previousLemma = String(previousCase.previous).replace(/^w:([^:]+):(ar>tr|tr>ar)$/, '$1');
  assert.ok(!afterPrevious.choices.some((choice) => String(choice.cardId).replace(/^w:([^:]+):(ar>tr|tr>ar)$/, '$1') === previousLemma), 'önceki lemma iki yönde de dışlanır');

  let limitedCase = null;
  for (const lemma of probeLex.lemmas) {
    if (!singleOccurrence(lemma)) continue;
    for (const direction of ['ar>tr', 'tr>ar']) {
      const cardId = `w:${lemma.id}:${direction}`;
      if (probe.win.SeymaQuranLearnFlow.ladderArm(cardId) !== 'A') continue;
      const candidates = probeLex.lemmas.filter((other) => other.id !== lemma.id
        && other.pos === lemma.pos && (!lemma.root || !other.root || lemma.root !== other.root)
        && other.ar && other.ar !== lemma.ar)
        .filter((other, index, all) => all.findIndex((item) => item.ar === other.ar) === index)
        .slice(0, 2);
      if (candidates.length === 2) { limitedCase = { lemma, cardId, candidates }; break; }
    }
    if (limitedCase) break;
  }
  assert.ok(limitedCase, 'iki aynı-POS uygun distractor bulunmalı');
  const limitedData = { quranLearn: { cards: {
    [limitedCase.cardId]: { state: 'review', s: 40, reps: 8 },
    [`w:${limitedCase.candidates[0].id}:ar>tr`]: { state: 'review', s: 40, reps: 8 },
    [`w:${limitedCase.candidates[1].id}:ar>tr`]: { state: 'review', s: 40, reps: 8 }
  } } };
  const limited = probe.api.kaoBuildTask({ id: 'k3pd12-limited', cardId: limitedCase.cardId }, limitedData, { seed: 'k3pd12-limited' });
  assert.notEqual(limited.kind, 'cloze', 'generic fallback cannot be carried into cloze');
  assert.equal(limited.rung, 'R2', 'valid example with fewer than 3 suitable distractors follows recorded R2 decision');
});

console.log(`test_k3p_cloze: PASS (${passed} kontrol — uygunluk, boşluk konumu, şıklar, cevap yolu, a11y, doğrulanmamış örnek, akış, tam matris, yedek ve önceki çeldirici)`);
