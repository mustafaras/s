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
      // K3P-17: A kolunda R3 "harflerden kur" olur (uygunsa); R4 K3P-18'in işi, o yüzden R2'ye düşer.
      // R3'te uygun olmayan lemma (harfe çevrilemeyen yazım, uzunluk dışı) build kuramaz ve R2'ye düşer.
      const expectedRung = rung === 'R4' || (rung === 'R3' && task.kind !== 'build') ? 'R2' : rung;
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
      if (task.kind === 'build') buildSeen += 1;
      assert.equal(JSON.stringify(data), before);
    }
  }
}
assert.equal(test.calls.save, saves);
assert.ok(buildSeen > 0, 'R3 basamağında build görevi kurulmalı (K3P-17)');
console.log(`test_k3p_ladder: PASS (A=${countA}/1000; eşikler, yön, B/R1, yedek, değişmezlik; build ${buildSeen})`);
