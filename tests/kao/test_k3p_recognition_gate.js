'use strict';
// K3PD-25 · ölçüm sözleşmesi ve fail-closed hedef kapısı; sentetik görev nesneleri.
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const gate = require('../../kao3-premium/araclar/cift-sik.cjs');

assert.equal(gate.SCHEMA, 'k3pd.recognition-gate');
assert.equal(gate.SCHEMA_VERSION, 1);
assert.equal(gate.classifyWordTask({ type: 'word', rung: 'R1', kind: 'choice' }), 'R1');
assert.equal(gate.classifyWordTask({ type: 'word', rung: 'R2', kind: 'choice' }), 'R2');
assert.equal(gate.classifyWordTask({ type: 'word', rung: 'R3', kind: 'build' }), 'R3');
assert.equal(gate.classifyWordTask({ type: 'word', rung: 'R4', kind: 'cloze' }), 'R4');
assert.equal(gate.classifyWordTask({ type: 'word', rung: 'R2', kind: 'build' }), 'R3');
assert.equal(gate.classifyWordTask({ type: 'word', rung: 'R1', kind: 'cloze' }), 'R4');
assert.equal(gate.classifyWordTask({ type: 'grammar', rung: 'R1', kind: 'choice' }), 'NON_WORD');
assert.equal(gate.classifyWordTask({ type: 'word', rung: 'unknown', kind: 'choice' }), 'UNKNOWN');
assert.equal(gate.isMultipleChoiceRung('R1'), true);
assert.equal(gate.isMultipleChoiceRung('R2'), true, 'R2 eşleme çoktan seçmeli olarak görünür kalır');
assert.equal(gate.isMultipleChoiceRung('R3'), false, 'çok çipli build çoktan seçmeli sayılmaz');
assert.equal(gate.isMultipleChoiceRung('R4'), true, 'cloze çoktan seçmelidir');

const count = gate.makeProfile('fresh', 109);
const answerChoices = [
  { label: 'dogru', correct: true },
  { label: 'yanlis', correct: false }
];
for (const [id, rung, kind] of [
  ['new-r1', 'R1', 'choice'], ['new-r2', 'R2', 'choice'], ['new-r4', 'R4', 'cloze']
]) {
  gate.recordTask(count, {
    id, cardId: `w:${id}:ar>tr`, type: 'word', isNew: true, arm: 'A', rung, kind,
    choices: answerChoices.map((choice, index) => ({ ...choice, choiceId: `${id}:${index}` }))
  }, { ladderRung: () => 'R1', ladderArm: () => 'A' }, { quranLearn: { cards: {} } });
}
gate.recordTask(count, {
  id: 'new-r3', cardId: 'w:new-r3:ar>tr', type: 'word', isNew: true, arm: 'A', rung: 'R3', kind: 'build',
  answer: 'بَت', choices: [
    { label: 'ب', correct: true, choiceId: 'new-r3:0' }, { label: 'ت', correct: true, choiceId: 'new-r3:1' },
    { label: 'ا', correct: false, choiceId: 'new-r3:2' }, { label: 'د', correct: false, choiceId: 'new-r3:3' }
  ]
}, { ladderRung: () => 'R1', ladderArm: () => 'A' }, { quranLearn: { cards: {} } });
const counted = gate.finishProfile(count);
assert.equal(counted.validTaskCount, 4);
assert.deepEqual(counted.byRung, { R1: 1, R2: 1, R3: 1, R4: 1, UNKNOWN: 0 });
assert.equal(counted.firstAcquaintance.numerator, 4);
assert.equal(counted.firstAcquaintance.denominator, 4);
assert.equal(counted.totalMultipleChoiceShare.numerator, 3, 'isNew MC görevleri genel ölçünün payında kalır');
assert.equal(counted.totalMultipleChoiceShare.denominator, 4);
assert.equal(counted.totalMultipleChoiceShare.percent, 75);
assert.equal(counted.brokenAnswerPools, 0);

const fallback = gate.makeProfile('mixedRepeat', 109);
gate.recordTask(fallback, {
  id: 'r4-to-r3', cardId: 'w:fallback:ar>tr', type: 'word', isNew: false, arm: 'A', rung: 'R3', kind: 'build',
  answer: 'بَت', choices: [
    { label: 'ب', correct: true, choiceId: 'r4-to-r3:0' }, { label: 'ت', correct: true, choiceId: 'r4-to-r3:1' },
    { label: 'ا', correct: false, choiceId: 'r4-to-r3:2' }, { label: 'د', correct: false, choiceId: 'r4-to-r3:3' }
  ]
}, { ladderArm: () => 'A', ladderRung: () => 'R4' }, { quranLearn: { cards: { 'w:fallback:ar>tr': { state: 'review', s: 40 } } } });
const fallbackCounted = gate.finishProfile(fallback);
assert.equal(fallbackCounted.fallback.count, 1);
assert.equal(fallbackCounted.fallback.byExpectedRung.R4.fallbackToR3, 1);
assert.equal(fallbackCounted.fallback.opportunityRate.percent, 100);
assert.equal(fallbackCounted.byArm.A.fallback, 1);

const legacyNotMet = gate.targetMetric(93, 100, 0.60);
const repeatPass = gate.targetMetric(49, 100, 0.60);
const strict = gate.evaluateGate({ legacyGeneralFresh: legacyNotMet, matureRepeatR1: repeatPass });
assert.equal(legacyNotMet.status, 'NOT_MET');
assert.equal(repeatPass.status, 'PASS');
assert.equal(strict.status, 'FAIL', 'R1 PASS toplamMC NOT_MET sonucunu gizleyemez');
assert.equal(strict.exitCode, 1);
assert.deepEqual(strict.violations.map((entry) => entry.id), ['legacyGeneralFresh']);

const zero = gate.targetMetric(0, 0, 0.60);
assert.equal(zero.status, 'NOT_MEASURED');
assert.equal(gate.evaluateGate({ legacy: zero }).exitCode, 1, 'sıfır görev PASS olamaz');
const broken = gate.makeProfile('broken', 109);
broken.lessonRuns = {
  plannedLessons: 109, startedLessons: 109, completedLessons: 108,
  budgetPausedLessonCount: 1, uniqueBudgetPausedLessonCount: 1, accountedLessons: 109
};
broken.validTaskCount = 1;
broken.brokenAnswerPools = 1;
assert.ok(gate.collectIntegrityFailures([broken]).some((item) => item.includes('broken answer pool')));
assert.equal(gate.evaluateGate({ metric: repeatPass }, ['reserve pool broken']).exitCode, 1);

const resumablePause = gate.makeProfile('fresh', 109);
resumablePause.lessonRuns = {
  plannedLessons: 109, startedLessons: 109, completedLessons: 108,
  partEndBoundaryCount: 1, budgetOverrunContinuations: 0, resumedTaskVisits: 0,
  accountedLessons: 108, coverageComplete: false
};
resumablePause.validTaskCount = 1;
resumablePause.answerTaskVisits = 1;
assert.ok(gate.collectIntegrityFailures([resumablePause]).some((item) => item.includes('lesson coverage')),
  'partEnd işareti dersi tamamlanmış saydırmaz; devam/resume zorunludur');

const acceptedDeviation = gate.targetMetric(90, 100, 0.60, 'K3PD-explicit-deviation');
assert.equal(acceptedDeviation.status, 'NOT_MET', 'sapma özgün sonucu gizlemez');
assert.equal(acceptedDeviation.disposition, 'ACCEPTED_DEVIATION');
assert.equal(acceptedDeviation.approvedDeviationRef, 'K3PD-explicit-deviation');
assert.equal(gate.evaluateGate({ legacy: acceptedDeviation, repeat: repeatPass }).exitCode, 0);
assert.equal(gate.evaluateGate({ legacy: { ...acceptedDeviation, approvedDeviationRef: null }, repeat: repeatPass }).exitCode, 1,
  'atıfsız ACCEPTED_DEVIATION hedefi kapıyı geçemez');
assert.equal(gate.evaluateGate({ legacy: acceptedDeviation, repeat: repeatPass }, ['lesson coverage incomplete']).exitCode, 1,
  'onaylı hedef sapması integrity ihlalini gizleyemez');

const cli = spawnSync(process.execPath, [
  path.join(__dirname, '..', '..', 'kao3-premium', 'araclar', 'cift-sik.cjs'), '--json'
], { encoding: 'utf8', env: { ...process.env, KAO2_EVIDENCE_OUT: '' } });
assert.equal(cli.status, 0, `seq139 sapma kararı ve R1 PASS ile --json geçmeli; stderr=${cli.stderr}`);
const machine = JSON.parse(cli.stdout);
assert.equal(machine.schema, 'k3pd.recognition-gate');
assert.equal(machine.schemaVersion, 1);
assert.equal(machine.gate.status, 'PASS');
assert.equal(machine.gate.exitCode, 0);
assert.equal(machine.targets.legacyGeneralFresh.status, 'NOT_MET');
assert.equal(machine.targets.legacyGeneralEstablished.status, 'NOT_MET');
assert.equal(machine.targets.legacyGeneralFresh.disposition, 'ACCEPTED_DEVIATION');
assert.equal(machine.targets.legacyGeneralEstablished.disposition, 'ACCEPTED_DEVIATION');
assert.equal(machine.targets.legacyGeneralFresh.approvedDeviationRef, 'K3PD-25#recognition-deviation:seq139');
assert.equal(machine.targets.legacyGeneralEstablished.approvedDeviationRef, 'K3PD-25#recognition-deviation:seq139');
assert.equal(machine.targets.legacyGeneralFresh.binding, false);
assert.equal(machine.targets.legacyGeneralEstablished.binding, false);
assert.equal(machine.targets.matureRepeatR1.status, 'PASS');
assert.equal(machine.targets.matureRepeatR1.binding, true);
assert.deepEqual(machine.approvedDeviation.appliesTo, ['legacyGeneralFresh', 'legacyGeneralEstablished']);
assert.equal(machine.approvedDeviation.reference, 'K3PD-25#recognition-deviation:seq139');
assert.equal(machine.approvedDeviation.disposition, 'ACCEPTED_DEVIATION');
assert.equal(machine.targets.legacyGeneralFresh.numerator, 1010);
assert.equal(machine.targets.legacyGeneralFresh.denominator, 1087);
assert.equal(machine.targets.legacyGeneralEstablished.numerator, 1025);
assert.equal(machine.targets.legacyGeneralEstablished.denominator, 1125);
assert.equal(machine.targets.matureRepeatR1.numerator, 648);
assert.equal(machine.targets.matureRepeatR1.denominator, 1324);
assert.equal(machine.targets.legacyGeneralFresh.percent, 92.92);
assert.equal(machine.targets.legacyGeneralEstablished.percent, 91.11);
assert.equal(machine.targets.matureRepeatR1.percent, 48.94);
assert.deepEqual(machine.cohorts.fresh.byRung, { R1: 912, R2: 98, R3: 0, R4: 0, UNKNOWN: 0 });
assert.deepEqual(machine.cohorts.established.byRung, { R1: 902, R2: 123, R3: 6, R4: 0, UNKNOWN: 0 });
assert.deepEqual(machine.cohorts.mixedRepeat.byRung, { R1: 648, R2: 388, R3: 238, R4: 50, UNKNOWN: 0 });
assert.equal(machine.cohorts.fresh.validTaskCount, 1087);
assert.equal(machine.cohorts.established.validTaskCount, 1125);
assert.equal(machine.cohorts.mixedRepeat.validTaskCount, 1324);
assert.equal(machine.cohorts.mixedRepeat.cards, 814);
assert.equal(machine.cohorts.fresh.firstAcquaintance.numerator, 1010);
assert.equal(machine.cohorts.fresh.firstAcquaintance.denominator, 1010);
assert.equal(machine.cohorts.established.firstAcquaintance.numerator, 972);
assert.equal(machine.cohorts.established.firstAcquaintance.denominator, 1031);
assert.equal(machine.cohorts.mixedRepeat.totalMultipleChoiceShare.numerator, 1086);
assert.equal(machine.cohorts.established.fallback.count, 36);
assert.equal(machine.cohorts.established.fallback.opportunityCount, 36);
assert.equal(machine.cohorts.mixedRepeat.fallback.count, 265);
assert.equal(machine.cohorts.mixedRepeat.fallback.opportunityCount, 450);
assert.equal(machine.cohorts.fresh.defaultBudgetSnapshot.totalMultipleChoiceShare.numerator, 1010,
  'preserve the exact K3PD-24 default-budget MC numerator as a labeled snapshot');
assert.equal(machine.cohorts.fresh.defaultBudgetSnapshot.totalMultipleChoiceShare.denominator, 1084);
assert.equal(machine.cohorts.established.defaultBudgetSnapshot.totalMultipleChoiceShare.numerator, 1022);
assert.equal(machine.cohorts.established.defaultBudgetSnapshot.totalMultipleChoiceShare.denominator, 1119);
assert.equal(machine.cohorts.mixedRepeat.defaultBudgetSnapshot.validTaskCount, 1316);
assert.equal(machine.cohorts.mixedRepeat.defaultBudgetSnapshot.cards, 812);
assert.equal(machine.cohorts.mixedRepeat.defaultBudgetSnapshot.byRung.R1, 648);
assert.equal(machine.cohorts.mixedRepeat.defaultBudgetSnapshot.byRung.R2, 403);
assert.equal(machine.cohorts.mixedRepeat.defaultBudgetSnapshot.byRung.R3, 224);
assert.equal(machine.cohorts.mixedRepeat.defaultBudgetSnapshot.byRung.R4, 41);
assert.equal(machine.cohorts.mixedRepeat.defaultBudgetSnapshot.totalMultipleChoiceShare.numerator, 1092);
assert.equal(machine.cohorts.mixedRepeat.defaultBudgetSnapshot.totalMultipleChoiceShare.denominator, 1316);
assert.equal(machine.cohorts.mixedRepeat.defaultBudgetSnapshot.lessonRuns.coverageComplete, false);
assert.equal(machine.cohorts.mixedRepeat.defaultBudgetSnapshot.lessonRuns.coverageStatus, 'PARTIAL_BY_DEFAULT_BUDGET_PART_END');
assert.deepEqual(machine.cohorts.mixedRepeat.byArm.A, { tasks: 676, R1: 0, R2: 388, R3: 238, R4: 50, fallback: 265 });
assert.deepEqual(machine.cohorts.mixedRepeat.byArm.B, { tasks: 648, R1: 648, R2: 0, R3: 0, R4: 0, fallback: 0 });
assert.equal(machine.cohorts.fresh.lessonRuns.completedLessons, 109, 'all lesson tasks must be followed through resume to summary');
assert.equal(machine.cohorts.established.lessonRuns.completedLessons, 109);
assert.equal(machine.cohorts.mixedRepeat.lessonRuns.completedLessons, 109);
assert.equal(machine.cohorts.fresh.lessonRuns.budgetOverrunContinuations, 1);
assert.equal(machine.cohorts.established.lessonRuns.budgetOverrunContinuations, 1);
assert.equal(machine.cohorts.mixedRepeat.lessonRuns.budgetOverrunContinuations, 1);
assert.equal(machine.cohorts.fresh.lessonRuns.accountedLessons, 109);
assert.equal(machine.cohorts.established.lessonRuns.accountedLessons, 109);
assert.equal(machine.cohorts.mixedRepeat.lessonRuns.accountedLessons, 109);
assert.doesNotMatch(JSON.stringify(machine), /u01\.01|w:/, '28 makine çıktısı ders/kart kimliği taşımaz');
assert.deepEqual(machine.gate.violations.filter((item) => item.type === 'integrity'), [], 'all 109 lessons must fully reach summary');
assert.ok(machine.buildCoverage.buildTasks > 0, 'R3 build örneği boş olamaz');
assert.equal(machine.buildCoverage.candidateCards, 26);
assert.equal(machine.buildCoverage.buildTasks, 6);
assert.equal(machine.buildCoverage.fallbackTasks, 20);
assert.equal(machine.buildCoverage.brokenFallbackPools, 0, 'yedek havuz bozuksa gate başarısız olmalı');

console.log('test_k3p_recognition_gate: PASS (R1–R4, R2 MC, isNew payda, fallback, zero-task, reserve-pool, seq139 accepted-deviation, integrity strict exit)');
