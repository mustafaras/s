'use strict';
const assert = require('node:assert/strict');
const H = require('./helpers/kao-harness');
const test = H.bootKao({ seeded: true });
const flow = test.win.SeymaQuranLearnFlow;
for (const [card, expected] of [
  [undefined, 'R1'], [{ state: 'new', s: 99 }, 'R1'],
  [{ s: 0 }, 'R1'], [{ s: 2.999 }, 'R1'], [{ s: 3 }, 'R2'],
  [{ s: 9.999 }, 'R2'], [{ s: 10 }, 'R3'], [{ s: 29.999 }, 'R3'],
  [{ s: 30 }, 'R4'], [{ s: 100 }, 'R4'], [{ s: NaN }, 'R1'],
  [{ state: 'relearning', s: 2 }, 'R1'], [{ state: 'relearning', s: 3 }, 'R1'],
  [{ state: 'relearning', s: 10 }, 'R2'], [{ state: 'relearning', s: 30 }, 'R3'],
  [{ st: 'relearning', s: 30 }, 'R3']
]) assert.equal(flow.ladderRung(card && Object.freeze(card)), expected);
let countA = 0;
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
      const expected = flow.ladderArm(id) === 'B' ? 'R1' : flow.ladderRung(data.quranLearn.cards[id]) === 'R1' ? 'R1' : 'R2';
      assert.equal(task.rung, expected);
      assert.equal(task.arm, flow.ladderArm(id));
      const expectedAudio = expected === 'R2' && audioOnly;
      assert.equal(task.direction, expected === 'R1' || expectedAudio ? 'ar>tr' : 'tr>ar');
      assert.equal(task.audioOnly, expectedAudio);
      assert.equal(task.cardId, id);
      assert.equal(task.id, `task:${id}`);
      assert.equal(task.answer, expected === 'R1' || expectedAudio ? task.meaning : task.ar);
      assert.equal(task.choices.filter((choice) => choice.correct).length, 1);
      assert.equal(new Set(task.choices.map((choice) => choice.label)).size, task.choices.length);
      assert.equal(JSON.stringify(data), before);
    }
  }
}
assert.equal(test.calls.save, saves);
console.log(`test_k3p_ladder: PASS (A=${countA}/1000; eşikler, yön, B/R1, yedek, değişmezlik)`);
