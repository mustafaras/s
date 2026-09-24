'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const fixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/kao/fixtures/fsrs-vectors.json'), 'utf8'));
const relative = 'app/core/quranLearn.js';
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), sandbox, { filename: relative });
const api = sandbox.window.SeymaQuranLearn;

assert.ok(api && typeof api.kaoSchedule === 'function', 'kaoSchedule yayımlanmalı');
assert.equal(typeof api.kaoGrade, 'function', 'kaoGrade yayımlanmalı');
assert.equal(fixture.source.repository, 'https://github.com/open-spaced-repetition/ts-fsrs');
assert.equal(fixture.source.tag, 'v4.5.2');
assert.equal(fixture.source.commit, 'cdd9158eedf81f3b962bf63f8d49346fcdccf8e6');
assert.equal(fixture.source.license, 'MIT');
assert.equal(fixture.source.testPath, '__tests__/FSRSV5.test.ts');
assert.equal(fixture.weights.length, 19);
assert.equal(fixture.count, fixture.vectors.length);
assert.ok(fixture.vectors.length >= 20, 'en az 20 yayımlanmış referans vektörü gerekli');
assert.deepEqual(Array.from(api.fsrsWeights), fixture.weights);

function close(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) <= fixture.tolerance, `${label}: ${actual} != ${expected}`);
}

for (const vector of fixture.vectors) {
  const before = JSON.stringify(vector.card);
  const actual = api.kaoSchedule(vector.card, vector.grade, vector.now);
  const expected = vector.expected;
  close(actual.s, expected.s, `${vector.id}.s`);
  close(actual.d, expected.d, `${vector.id}.d`);
  assert.equal(actual.r, expected.r, `${vector.id}.r`);
  assert.equal(actual.due, expected.due, `${vector.id}.due`);
  assert.equal(actual.interval, expected.interval, `${vector.id}.interval`);
  assert.equal(actual.reps, expected.reps, `${vector.id}.reps`);
  assert.equal(actual.lapses, expected.lapses, `${vector.id}.lapses`);
  assert.equal(actual.state, expected.state, `${vector.id}.state`);
  assert.ok(actual.predictedR > 0 && actual.predictedR <= 1, `${vector.id}.predictedR`);
  assert.equal(JSON.stringify(vector.card), before, `${vector.id}: girdi değişmemeli`);
}

for (const vector of fixture.retrievabilityVectors) {
  const source = fixture.vectors.find((item) => item.id === vector.sourceVector);
  const card = { ...source.expected };
  delete card.interval;
  const actual = api.kaoSchedule(card, 3, source.expected.due);
  close(actual.predictedR, vector.expected, `${vector.sourceVector}.predictedR`);
}

const intervalHistory = fixture.vectors.filter((item) => item.sequence === 'FSRSV5 ivl_history').map((item) => item.expected.interval);
assert.deepEqual(intervalHistory, [0, 4, 14, 44, 125, 328, 0, 0, 7, 16, 34, 71, 142]);
const finalPreview = fixture.vectors.find((item) => item.id === 'memory-state-preview-good').expected;
assert.equal(Number(finalPreview.s.toFixed(4)), 48.4848, 'yayımlanmış 4 basamaklı son stability');
assert.equal(Number(finalPreview.d.toFixed(4)), 7.0866, 'yayımlanmış 4 basamaklı son difficulty');

const reviewCard = { s: 10, d: 5, r: '2026-08-01T00:00:00.000Z', due: '2026-08-10T00:00:00.000Z', reps: 8, lapses: 1, state: 'review' };
const intervals = [1, 2, 3, 4].map((grade) => api.kaoSchedule(reviewCard, grade, '2026-08-11T00:00:00.000Z').interval);
assert.ok(intervals[0] < intervals[1] && intervals[1] < intervals[2] && intervals[2] < intervals[3], `aralıklar monoton olmalı: ${intervals}`);

assert.equal(api.kaoGrade(false, 100, 99), 1, 'yanlış → Again');
assert.equal(api.kaoGrade(true, 8001, 99), 2, 'doğru ve >8 s → Hard');
assert.equal(api.kaoGrade(true, 8000, 99), 3, '8 s sınırı → Good');
assert.equal(api.kaoGrade(true, 2499, 3), 4, 'doğru, <2,5 s ve n≥3 → Easy');
assert.equal(api.kaoGrade(true, 2500, 3), 3, '2,5 s sınırı → Good');
assert.equal(api.kaoGrade(true, 2000, 2), 3, 'n<3 → Good');
assert.throws(() => api.kaoSchedule(reviewCard, 0, '2026-08-11T00:00:00.000Z'), /grade/);
assert.throws(() => api.kaoSchedule(reviewCard, 3, 'geçersiz'), /now/);

console.log(`KAO FSRS: PASS (${fixture.vectors.length} published vectors, ±${fixture.tolerance}, monotonic, grade mapping, predictedR)`);
