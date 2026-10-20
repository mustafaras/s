'use strict';
const assert = require('node:assert/strict');
const H = require('./helpers/kao-harness');
const test = H.bootKao({ seeded: true });
const flow = test.win.SeymaQuranLearnFlow;
// K3P-17: build'de doğru sıra = hedef harfler (answer); dizme yolunun okuduğu etiket listesi.
// K3P-17: build'in doğru dizisi harekeli cevabın HARekesiz harfleridir (çipler harekesiz yazılır).
const bare = (value) => String(value || '').replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/g, '');
const kaoLabels = (t, task) => (task.kind === 'build' ? Array.from(bare(task.answer)) : task.choices.slice().sort((a, b) => a.ordinal - b.ordinal).map((choice) => choice.label));
for (const [card, expected] of [
  [undefined, 'R1'], [{ state: 'new', s: 99 }, 'R1'],
  [{ s: 0 }, 'R1'], [{ s: 2.999 }, 'R1'], [{ s: 3 }, 'R2'],
  [{ s: 9.999 }, 'R2'], [{ s: 10 }, 'R3'], [{ s: 29.999 }, 'R3'],
  [{ s: 30 }, 'R4'], [{ s: 100 }, 'R4'], [{ s: NaN }, 'R1'],
  [{ state: 'relearning', s: 2 }, 'R1'], [{ state: 'relearning', s: 3 }, 'R1'],
  [{ state: 'relearning', s: 10 }, 'R2'], [{ state: 'relearning', s: 30 }, 'R3'],
  [{ st: 'relearning', s: 30 }, 'R3']
]) assert.equal(flow.ladderRung(card && Object.freeze(card)), expected);
let countA = 0, buildSeen = 0;
for (let index = 0; index < 1000; index += 1) {
  const id = `w:ladder-${index}:ar>tr`;
  const expected = test.api.seededRank('k3p-ladder', id) % 2 === 0 ? 'A' : 'B';
  assert.equal(flow.ladderArm(id), expected);
  assert.equal(flow.ladderArm(id), flow.ladderArm(id));
  if (expected === 'A') countA += 1;
}
assert.ok(countA >= 450 && countA <= 550, `A=${countA}/1000`);
const other = H.bootKao();
for (const id of Object.keys(test.data.quranLearn.cards)) assert.equal(flow.ladderArm(id), other.win.SeymaQuranLearnFlow.ladderArm(id));
const saves = test.calls.save;
for (const id of Object.keys(test.data.quranLearn.cards)) {
  for (const state of ['new', 'review', 'relearning']) {
    for (const stability of [0, 3, 10, 30]) for (const audioOnly of [false, true]) {
      const data = Object.freeze({ quranLearn: Object.freeze({ cards: Object.freeze({ [id]: Object.freeze({ state, s: stability }) }) }) });
      const before = JSON.stringify(data);
      const task = test.api.kaoBuildTask(Object.freeze({ id: `task:${id}`, cardId: id }), data, Object.freeze({ audioOnly }));
      const arm = flow.ladderArm(id), rung = arm === 'B' ? 'R1' : flow.ladderRung(data.quranLearn.cards[id]);
      // K3P-18: A kolunda R4 "âyette boşluk" olur (doğrulanmış örnek varsa); yoksa BİR basamak iner (R3):
      // uygunsa build, değilse R2. İki basamak düşmez (TASARIM §4 "unutma kuralı").
      let expectedRung;
      if (rung === 'R4') expectedRung = task.kind === 'cloze' ? 'R4' : (task.kind === 'build' ? 'R3' : 'R2');
      else if (rung === 'R3' && task.kind !== 'build') expectedRung = 'R2';
      else expectedRung = rung;
      assert.equal(task.rung, expectedRung);
      assert.equal(task.arm, arm);
      if (task.kind === 'build') {
        // Build: şıklar harf çipleri; doğru çip sayısı kelimenin harf sayısıdır, doğru sıra = answer.
        const chars = String(task.answer || '');
        assert.ok(String(chars).length >= 2, `${id}: build harf taşır`);
        const letters = bare(chars);
        assert.equal(task.choices.filter((choice) => choice.correct === true).length, letters.length);
        assert.equal(task.choices.filter((choice) => choice.correct !== true).length, 2);
        assert.equal(task.choices.length, letters.length + 2);
        assert.deepEqual(Array.from(kaoLabels(test, task)), Array.from(letters));
      } else if (task.kind === 'cloze') {
        // K3P-18: cevap harekeli hedef kelimedir; âyet (task.ar) ve okunuş aynı konumda boşalır,
        // seçenekler Arapçadır ve doğru şık tam olarak cevaptır. Cevap âyette görünmez (sızma yok).
        assert.ok(task.ar.includes('…'), `${id}: âyette boşluk olmalı`);
        // Sızma kontrolü TAM KELİME üzerinden: harekeli cevap başka bir kelimenin alt dizisi olabilir
        // (örn. «مَن» ⊂ «ءَامَنَّا»); ölçü "boşluk bir kelime yedi ve o kelime cevaptı" olmalı.
        const ayahWords = task.ar.split(/\s+/).map(bare);
        assert.ok(!ayahWords.includes(bare(task.answer)), `${id}: cevap âyette tam kelime olarak kalmamalı`);
        assert.ok(task.pronunciation.includes('…'), `${id}: okunuşta boşluk olmalı`);
        assert.equal(task.choices.filter((choice) => choice.correct).length, 1);
        assert.equal(task.choices.find((choice) => choice.correct).label, task.answer);
        assert.ok(task.choices.every((choice) => /[\u0600-\u06ff]/.test(choice.label)));
      } else {
        const expectedAudio = task.rung === 'R2' && audioOnly;
        assert.equal(task.direction, task.rung === 'R1' || expectedAudio ? 'ar>tr' : 'tr>ar');
        assert.equal(task.audioOnly, expectedAudio);
        assert.equal(task.answer, task.rung === 'R1' || expectedAudio ? task.meaning : task.ar);
        assert.equal(task.choices.filter((choice) => choice.correct).length, 1);
      }
      assert.equal(task.cardId, id);
      assert.equal(task.id, `task:${id}`);
      assert.equal(new Set(task.choices.map((choice) => choice.label)).size, task.choices.length);
      if (task.kind === 'build') {
        buildSeen += 1;
      }
      assert.equal(JSON.stringify(data), before);
    }
  }
}
assert.equal(test.calls.save, saves);
assert.ok(buildSeen > 0, 'R3 basamağında build görevi kurulmalı (K3P-17)');
const lexicon = test.win.QuranLexiconV1;
let letterCapCandidate = null;
for (const lemma of lexicon.lemmas) {
  const cardId = `w:${lemma.id}:ar>tr`;
  if (flow.ladderArm(cardId) !== 'A') continue;
  const probeData = JSON.parse(JSON.stringify(test.data));
  probeData.quranLearn.cards[cardId] = { state: 'review', s: 10, d: 10, reps: 1, due: '2026-09-30T00:00:00.000Z' };
  const probe = test.api.kaoBuildTask({ id: `k3pd09-probe:${cardId}`, cardId, isNew: false }, probeData, { seed: `k3pd09-probe:${cardId}` });
  if (probe.kind === 'build' && probe.choices.length > 4) {
    letterCapCandidate = { cardId, choices: probe.choices.length };
    break;
  }
}
assert.ok(letterCapCandidate, 'dört seçenekten fazla gerçek harf çipi olan build örneği bulunmalı');
// K3PD-09: doğru görev zinciri içinde kaygı sınırı, çoktan seçmeli şık sayısı gibi harf çiplerine uygulanmamalı.
test.api.kaoOpen('home');
assert.ok(test.api.kaoLesson('start', 'u01.01'), 'gerçek ders handler zinciri başlamalı');
test.data.quranLearn.cards[letterCapCandidate.cardId] = { state: 'review', s: 10, d: 10, reps: 1, due: '2026-09-30T00:00:00.000Z' };
const letterItem = { id: 'k3pd09-letter-cap', cardId: letterCapCandidate.cardId, isNew: false };
test.ui.kaoQueue = [letterItem]; test.ui.kaoTasks = {}; test.ui.kaoTaskIndex = 0;
test.ui.kaoWrongStreak = 3; test.ui.kaoWindow = [0, 0];
assert.equal(test.api.kaoAnswer(letterItem.id, 'missing-choice'), false, 'olmayan seçim yanıtı görevi çözmemeli');
const letterTask = test.ui.kaoTasks[letterItem.id];
assert.equal(letterTask.kind, 'build', 'gerçek ladder/build görevi olarak kalmalı');
assert.equal(letterTask.choices.length, letterCapCandidate.choices, '3 yanlışta build harf çipleri sayısı görev üretimindeki sayıda kalmalı');
assert.ok(letterTask.choices.length > 4, 'harf çipi sayısı dört-seçenek varsayımından büyük olmalı');
const letterButtons = Array.from(test.api.kaoTaskHTML(letterTask).matchAll(/<button\b[^>]*onclick="App\.kaoAnswer\(/g)).length;
assert.equal(letterButtons, letterTask.choices.length, 'gerçek build HTML’si bütün harf çiplerini sunmalı');
let bArmMeaningTask = null;
for (const lemma of lexicon.lemmas) {
  if (lemma.verified !== true || !Array.isArray(lemma.meanings) || !lemma.meanings.some((meaning) => typeof meaning === 'string' && meaning.trim())) continue;
  const cardId = `w:${lemma.id}:ar>tr`;
  if (flow.ladderArm(cardId) !== 'B') continue;
  const data = JSON.parse(JSON.stringify(test.data));
  data.quranLearn.cards[cardId] = { state: 'review', s: 12, d: 10, reps: 1, due: '2026-09-30T00:00:00.000Z' };
  bArmMeaningTask = test.api.kaoBuildTask({ id: `k3pd10-b-arm:${cardId}`, cardId, isNew: false, retry: true }, data, { seed: 'k3pd10-b-arm' });
  break;
}
assert.ok(bArmMeaningTask, 'doğrulanmış anlamlı B kolu fixture bulunmalı');
assert.equal(bArmMeaningTask.arm, 'B');
assert.equal(bArmMeaningTask.rung, 'R1');
assert.notEqual(bArmMeaningTask.kind, 'build', 'B kolu K3PD-10 ipucu değişikliğiyle harf kurmaya geçmemeli');
assert.equal(test.api.kaoTaskHTML(bArmMeaningTask).includes('Anlamı:'), false, 'B kolunun mevcut görev anlamı build ipucu olarak gösterilmemeli');
assert.equal(bArmMeaningTask.retry, true, 'B kolundaki görev retry bağlamını korumalı');
console.log(`test_k3p_ladder: PASS (A=${countA}/1000; eşikler, yön, B/R1, yedek, değişmezlik; build ${buildSeen}; kaygıda build ${letterButtons} çip)`);
