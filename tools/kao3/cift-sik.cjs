'use strict';
// K3P · deterministik ölçüm ve K3PD-25 hedef kapısı (salt-okur, ağsız node:vm).
// Kullanım: node tools/kao3/cift-sik.cjs [--json]
// --json, K3PD-28'in tüketebileceği schemaVersion=1 toplu çıktısını stdout'a verir.
// Eski genel hedefin ham NOT_MET sonucu korunur; seq139 sapma disposition'ı ve olgun R1 hedefi ayrı raporlanır.
const path = require('node:path');
const H = require(path.join(__dirname, '..', '..', 'tests', 'kao', 'helpers', 'kao-harness.js'));

const SCHEMA = 'k3pd.recognition-gate';
const SCHEMA_VERSION = 1;
const DECISION_REF = 'K3PD-24#recognition:A';
const APPROVED_DEVIATION_REF = 'K3PD-25#recognition-deviation:seq139';
const TARGET_SHARE = 0.60;
const EXPECTED_LESSONS = 109;

function roundRate(numerator, denominator) {
  return denominator > 0 ? Number((numerator / denominator).toFixed(6)) : null;
}

function percent(rate) {
  return rate === null ? null : Number((rate * 100).toFixed(2));
}

function ratioMetric(numerator, denominator) {
  const share = roundRate(numerator, denominator);
  return { numerator, denominator, share, percent: percent(share) };
}

function targetMetric(numerator, denominator, maxShare = TARGET_SHARE, approvedDeviationRef = null) {
  const share = roundRate(numerator, denominator);
  const status = share === null ? 'NOT_MEASURED' : (share <= maxShare ? 'PASS' : 'NOT_MET');
  const deviationRef = typeof approvedDeviationRef === 'string' && approvedDeviationRef.trim()
    ? approvedDeviationRef.trim() : null;
  return {
    numerator,
    denominator,
    share,
    percent: percent(share),
    maxShare,
    maxPercent: Number((maxShare * 100).toFixed(2)),
    status,
    approvedDeviationRef: deviationRef,
    disposition: status === 'NOT_MET' && deviationRef ? 'ACCEPTED_DEVIATION' : status
  };
}

function evaluateGate(targets, integrityFailures = []) {
  const violations = [];
  for (const failure of integrityFailures) violations.push({ type: 'integrity', detail: String(failure) });
  for (const [id, metric] of Object.entries(targets || {})) {
    const deviationAccepted = metric && metric.status === 'NOT_MET'
      && metric.disposition === 'ACCEPTED_DEVIATION'
      && typeof metric.approvedDeviationRef === 'string' && metric.approvedDeviationRef.trim().length > 0;
    if (!metric || (metric.status !== 'PASS' && !deviationAccepted)) {
      violations.push({ type: 'target', id, status: metric ? metric.status : 'NOT_MEASURED' });
    }
  }
  return { status: violations.length ? 'FAIL' : 'PASS', exitCode: violations.length ? 1 : 0, violations };
}

function classifyWordTask(task) {
  if (!task || task.type !== 'word') return 'NON_WORD';
  if (task.kind === 'build') return 'R3';
  if (task.kind === 'cloze') return 'R4';
  return ['R1', 'R2'].includes(task.rung) ? task.rung : 'UNKNOWN';
}

function isMultipleChoiceRung(rung) {
  return rung === 'R1' || rung === 'R2' || rung === 'R4';
}

function makeProfile(name, lessonCount) {
  return {
    name,
    lessonCount,
    answerTaskVisits: 0,
    validTaskCount: 0,
    eligibleTaskCount: 0,
    invalidTaskCount: 0,
    duplicateTaskIdCount: 0,
    nonwordTaskCount: 0,
    wordTaskCount: 0,
    _mcNumerator: 0,
    firstAcquaintance: { numerator: 0, denominator: 0, share: null, percent: null },
    repeatWordTaskCount: 0,
    byRung: { R1: 0, R2: 0, R3: 0, R4: 0, UNKNOWN: 0 },
    byRungShareOfWordTasks: {},
    isNewByRung: { R1: 0, R2: 0, R3: 0, R4: 0, UNKNOWN: 0 },
    totalMultipleChoiceShare: null,
    fallback: {
      count: 0,
      allRepeatTasks: 0,
      shareOfRepeatTasks: null,
      opportunityCount: 0,
      opportunityRate: null,
      byExpectedRung: {
        R3: { opportunities: 0, fallbackToR2: 0 },
        R4: { opportunities: 0, fallbackToR3: 0, fallbackToR2: 0 }
      }
    },
    byArm: {
      A: { tasks: 0, R1: 0, R2: 0, R3: 0, R4: 0, fallback: 0 },
      B: { tasks: 0, R1: 0, R2: 0, R3: 0, R4: 0, fallback: 0 }
    },
    duplicateChoiceTasks: 0,
    brokenAnswerPools: 0,
    issues: [],
    taskIds: new Set()
  };
}

function stripHarakat(value) {
  return String(value || '').replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/g, '');
}

function inspectWordPool(profile, task, rung) {
  if (!['R1', 'R2', 'R3', 'R4'].includes(rung)) return;
  const choices = Array.isArray(task.choices) ? task.choices : [];
  const choiceIds = choices.map((choice) => choice && choice.choiceId);
  const idsValid = choiceIds.every((id) => typeof id === 'string' && id.length > 0)
    && new Set(choiceIds).size === choiceIds.length;
  let broken = false;
  if (rung === 'R3') {
    const letters = Array.from(stripHarakat(task.answer));
    const correctCount = choices.filter((choice) => choice && choice.correct === true).length;
    broken = !idsValid || task.kind !== 'build' || letters.length < 2
      || choices.length !== letters.length + 2 || correctCount !== letters.length;
  } else {
    const correctCount = choices.filter((choice) => choice && choice.correct === true).length;
    broken = !idsValid || choices.length < 2 || correctCount !== 1;
  }
  if (broken) profile.brokenAnswerPools += 1;
}

function recordTask(profile, task, flow, data) {
  profile.answerTaskVisits += 1;
  if (!task || typeof task.id !== 'string' || !task.id.trim() || typeof task.type !== 'string') {
    profile.invalidTaskCount += 1;
    profile.issues.push('answer-task-object-id-or-type-missing');
    return;
  }
  if (profile.taskIds.has(task.id)) profile.duplicateTaskIdCount += 1;
  profile.taskIds.add(task.id);
  profile.validTaskCount += 1;
  if (task.type !== 'word') {
    profile.nonwordTaskCount += 1;
  } else {
    if (typeof task.isNew !== 'boolean' || typeof task.cardId !== 'string' || !task.cardId.trim()) {
      profile.invalidTaskCount += 1;
      profile.issues.push('word-task-cohort-fields-invalid');
    }
    profile.wordTaskCount += 1;
    const isNew = task.isNew === true;
    if (isNew) profile.firstAcquaintance.numerator += 1;
    else profile.repeatWordTaskCount += 1;
    const rung = classifyWordTask(task);
    profile.byRung[rung] += 1;
    if (isNew) profile.isNewByRung[rung] += 1;
    inspectWordPool(profile, task, rung);

    if (isMultipleChoiceRung(rung)) profile._mcNumerator += 1;
    if (!isNew) {
      const arm = task.arm === 'A' || task.arm === 'B' ? task.arm
        : (task.cardId ? flow.ladderArm(task.cardId) : '');
      const card = task.cardId && data.quranLearn && data.quranLearn.cards
        ? data.quranLearn.cards[task.cardId] : null;
      const expectedRung = arm === 'B' ? 'R1' : (arm === 'A' ? flow.ladderRung(card) : 'UNKNOWN');
      if (arm !== 'A' && arm !== 'B' || expectedRung === 'UNKNOWN' || rung === 'UNKNOWN') {
        profile.issues.push('repeat-task-rung-or-arm-unmeasurable');
      } else {
        const armRow = profile.byArm[arm];
        armRow.tasks += 1;
        armRow[rung] += 1;
        if (expectedRung === 'R3' || expectedRung === 'R4') profile.fallback.opportunityCount += 1;
        if (expectedRung === 'R3') profile.fallback.byExpectedRung.R3.opportunities += 1;
        if (expectedRung === 'R4') profile.fallback.byExpectedRung.R4.opportunities += 1;
        if (rung !== expectedRung) {
          profile.fallback.count += 1;
          armRow.fallback += 1;
          if (expectedRung === 'R3' && rung === 'R2') profile.fallback.byExpectedRung.R3.fallbackToR2 += 1;
          else if (expectedRung === 'R4' && rung === 'R3') profile.fallback.byExpectedRung.R4.fallbackToR3 += 1;
          else if (expectedRung === 'R4' && rung === 'R2') profile.fallback.byExpectedRung.R4.fallbackToR2 += 1;
          else profile.issues.push('repeat-task-has-unclassified-fallback');
        }
      }
    }
  }

  const choices = Array.isArray(task.choices) ? task.choices : [];
  const labels = choices.map((choice) => (task.kind === 'order' ? `#${choice.ordinal}`
    : task.kind === 'build' ? String(choice.choiceId || '') : choice.label));
  if (task.kind !== 'build' && new Set(labels).size < labels.length) {
    profile.duplicateChoiceTasks += 1;
  }
}

function finishProfile(profile, { legacyTarget = true } = {}) {
  const mcNumerator = profile._mcNumerator;
  delete profile.taskIds;
  delete profile._mcNumerator;
  profile.firstAcquaintance.denominator = profile.wordTaskCount;
  profile.eligibleTaskCount = profile.validTaskCount;
  profile.eligibleTaskDefinition = legacyTarget
    ? 'all valid answer-task visits in this 109-lesson profile'
    : 'all valid isNew=false word answer-task visits in this mixed-repeat sample';
  const firstRate = roundRate(profile.firstAcquaintance.numerator, profile.firstAcquaintance.denominator);
  profile.firstAcquaintance.share = firstRate;
  profile.firstAcquaintance.percent = percent(firstRate);
  for (const rung of ['R1', 'R2', 'R3', 'R4', 'UNKNOWN']) {
    const share = roundRate(profile.byRung[rung], profile.wordTaskCount);
    profile.byRungShareOfWordTasks[rung] = { numerator: profile.byRung[rung], denominator: profile.wordTaskCount, share, percent: percent(share) };
  }
  profile.totalMultipleChoiceShare = legacyTarget
    ? targetMetric(mcNumerator, profile.validTaskCount)
    : ratioMetric(mcNumerator, profile.validTaskCount);
  profile.fallback.allRepeatTasks = profile.repeatWordTaskCount;
  profile.fallback.shareOfRepeatTasks = ratioMetric(profile.fallback.count, profile.repeatWordTaskCount);
  profile.fallback.opportunityRate = ratioMetric(profile.fallback.count, profile.fallback.opportunityCount);
  return profile;
}

function isMatchingBudgetResume(t, lessonId) {
  const state = t.ui.kaoLesson;
  const item = state && state.plan && state.plan[state.at || 0];
  const saved = t.data.quranLearn && t.data.quranLearn.path
    && t.data.quranLearn.path.lessons && t.data.quranLearn.path.lessons[lessonId]
    && t.data.quranLearn.path.lessons[lessonId].resume;
  return item && item.kind === 'partEnd'
    && typeof item.resumeItemId === 'string' && item.resumeItemId.length > 0
    && saved && saved.itemId === item.resumeItemId;
}

function allLessonRuns(t, onTask, issues) {
  const lessons = t.win.QuranCurriculumV2.units.flatMap((unit) => unit.lessons);
  let started = 0, completed = 0, partEndBoundaryCount = 0, budgetOverrunContinuations = 0;
  let resumedTaskVisits = 0;
  for (const lesson of lessons) {
    t.ui.kaoLesson = null;
    if (!t.api.kaoLesson('start', lesson.id)) {
      issues.push('lesson-start-failed');
      continue;
    }
    started += 1;
    let walkDone = false;
    let parts = 0;
    while (parts < 20) {
      const segmentDone = H.playLesson(t, {
        stopAt: 'partEnd',
        visit(task) { if (parts > 0) resumedTaskVisits += 1; onTask(task); }
      });
      const state = t.ui.kaoLesson;
      const item = state && state.plan && state.plan[state.at || 0];
      if (item && item.kind === 'summary' && segmentDone) {
        walkDone = true;
        break;
      }
      if (!item || item.kind !== 'partEnd' || !isMatchingBudgetResume(t, lesson.id)) {
        issues.push('lesson-walk-incomplete-after-resume-or-without-matching-budget-marker');
        break;
      }
      partEndBoundaryCount += 1;
      if (!t.api.kaoLesson('budget-overrun')) {
        issues.push('budget-overrun-resume-action-failed');
        break;
      }
      budgetOverrunContinuations += 1;
      parts += 1;
    }
    if (walkDone) completed += 1;
    else if (parts >= 20) issues.push('lesson-resume-continuation-limit-exceeded');
    t.api.kaoLesson('exit');
  }
  return {
    plannedLessons: lessons.length,
    startedLessons: started,
    completedLessons: completed,
    partEndBoundaryCount,
    budgetOverrunContinuations,
    resumedTaskVisits,
    accountedLessons: completed,
    coverageComplete: completed === lessons.length
  };
}

function defaultBudgetLessonRuns(t, onTask, issues) {
  const lessons = t.win.QuranCurriculumV2.units.flatMap((unit) => unit.lessons);
  let started = 0, completed = 0, partEndLessons = 0;
  for (const lesson of lessons) {
    t.ui.kaoLesson = null;
    if (!t.api.kaoLesson('start', lesson.id)) {
      issues.push('default-budget-lesson-start-failed');
      continue;
    }
    started += 1;
    const walked = H.playLesson(t, { visit: onTask, stopAt: 'partEnd' });
    const state = t.ui.kaoLesson;
    const item = state && state.plan && state.plan[state.at || 0];
    if (walked && item && item.kind === 'summary') completed += 1;
    else if (item && item.kind === 'partEnd' && isMatchingBudgetResume(t, lesson.id)) partEndLessons += 1;
    else issues.push('default-budget-lesson-walk-unclassified');
    t.api.kaoLesson('exit');
  }
  return {
    plannedLessons: lessons.length,
    startedLessons: started,
    completedLessons: completed,
    partEndLessons,
    accountedLessons: completed + partEndLessons,
    coverageComplete: completed === lessons.length,
    coverageStatus: completed === lessons.length ? 'COMPLETE' : 'PARTIAL_BY_DEFAULT_BUDGET_PART_END'
  };
}

function scanProfile(seeded) {
  const t = H.bootKao({ seeded });
  if (!seeded) H.freshUser(t);
  const profile = makeProfile(seeded ? 'established' : 'fresh', 0);
  const flow = t.win.SeymaQuranLearnFlow;
  const completeCardIds = new Set();
  profile.lessonRuns = allLessonRuns(t, (task) => {
    recordTask(profile, task, flow, t.data);
    if (task && task.type === 'word' && typeof task.cardId === 'string') completeCardIds.add(task.cardId);
  }, profile.issues);
  profile.lessonCount = profile.lessonRuns.plannedLessons;
  const defaultBudgetHarness = H.bootKao({ seeded });
  if (!seeded) H.freshUser(defaultBudgetHarness);
  const defaultBudget = makeProfile(`${profile.name}-default-budget-snapshot`, 0);
  const defaultBudgetCardIds = new Set();
  defaultBudget.lessonRuns = defaultBudgetLessonRuns(defaultBudgetHarness,
    (task) => {
      recordTask(defaultBudget, task, defaultBudgetHarness.win.SeymaQuranLearnFlow, defaultBudgetHarness.data);
      if (task && task.type === 'word' && typeof task.cardId === 'string') defaultBudgetCardIds.add(task.cardId);
    },
    defaultBudget.issues);
  defaultBudget.lessonCount = defaultBudget.lessonRuns.plannedLessons;
  profile.defaultBudgetSnapshot = finishProfile(defaultBudget);
  profile.defaultBudgetSnapshot.lessonRuns = defaultBudget.lessonRuns;
  return { profile: finishProfile(profile), completeCardIds: [...completeCardIds].sort(), defaultBudgetCardIds: [...defaultBudgetCardIds].sort() };
}

function mixedRepeatProfile(cardIds, { completeLessons = true, name = 'mixedRepeat' } = {}) {
  const issues = [];
  const ids = [...cardIds].sort();
  const t = H.bootKao({ seeded: false });
  H.freshUser(t);
  const q = t.data.quranLearn;
  ids.forEach((id, index) => {
    q.cards[id] = { state: 'review', s: index % 3 === 0 ? 40 : (index % 3 === 1 ? 12 : 5), reps: 8, due: '2026-09-29T00:00:00.000Z' };
  });
  const profile = makeProfile(name, 0);
  const flow = t.win.SeymaQuranLearnFlow;
  const visit = (task) => {
    if (!task || task.type !== 'word' || task.isNew === true) return;
    recordTask(profile, task, flow, t.data);
  };
  if (completeLessons) profile.lessonRuns = allLessonRuns(t, visit, issues);
  else profile.lessonRuns = defaultBudgetLessonRuns(t, visit, issues);
  profile.lessonCount = profile.lessonRuns.plannedLessons;
  profile.cards = ids.length;
  profile.setupIssues = issues;
  return finishProfile(profile, { legacyTarget: false });
}

function r3Sample() {
  const t = H.bootKao({ seeded: true });
  const flow = t.win.SeymaQuranLearnFlow, q = t.data.quranLearn;
  const sample = { candidateCards: 0, buildTasks: 0, fallbackTasks: 0, brokenFallbackPools: 0 };
  for (const id of Object.keys(q.cards).sort()) {
    q.cards[id].s = 12;
    const arm = flow.ladderArm(id), rung = flow.ladderRung(q.cards[id]);
    if (arm !== 'A' || rung !== 'R3') continue;
    sample.candidateCards += 1;
    const task = t.api.kaoBuildTask({ id: `r3:${id}`, cardId: id, isNew: false }, t.data, { seed: `r3:${id}` });
    if (task && task.kind === 'build') {
      sample.buildTasks += 1;
      const pool = makeProfile('r3-build-sample', 0);
      inspectWordPool(pool, task, 'R3');
      if (pool.brokenAnswerPools) sample.brokenFallbackPools += pool.brokenAnswerPools;
    }
    else {
      sample.fallbackTasks += 1;
      const rung = classifyWordTask(task);
      const pool = makeProfile('r3-fallback-sample', 0);
      inspectWordPool(pool, task, rung);
      if (!task || !['R1', 'R2', 'R3', 'R4'].includes(rung) || pool.brokenAnswerPools) {
        sample.brokenFallbackPools += 1;
      }
    }
  }
  return sample;
}

function addRatioFields(profile) {
  profile.totalMultipleChoiceShare = targetMetric(
    profile.totalMultipleChoiceShare.numerator,
    profile.totalMultipleChoiceShare.denominator,
    TARGET_SHARE,
    APPROVED_DEVIATION_REF
  );
  profile.targets = {
    legacyGeneralMultipleChoiceMax60: {
      ...profile.totalMultipleChoiceShare,
      decisionRef: DECISION_REF,
      binding: profile.totalMultipleChoiceShare.status === 'PASS'
    }
  };
  return profile;
}

function collectIntegrityFailures(profiles) {
  const failures = [];
  for (const profile of profiles) {
    if (profile.lessonCount !== EXPECTED_LESSONS) failures.push(`${profile.name}: expected ${EXPECTED_LESSONS} lessons, got ${profile.lessonCount}`);
    if (!profile.lessonRuns || profile.lessonRuns.plannedLessons !== EXPECTED_LESSONS
      || profile.lessonRuns.startedLessons !== EXPECTED_LESSONS
      || profile.lessonRuns.accountedLessons !== EXPECTED_LESSONS
      || profile.lessonRuns.completedLessons !== EXPECTED_LESSONS
      || profile.lessonRuns.coverageComplete !== true) {
      failures.push(`${profile.name}: lesson coverage has an unaccounted run`);
    }
    if (profile.validTaskCount === 0) failures.push(`${profile.name}: zero valid tasks`);
    if (profile.answerTaskVisits !== profile.validTaskCount) failures.push(`${profile.name}: invalid visits excluded from valid task count`);
    if (profile.invalidTaskCount || profile.duplicateTaskIdCount || profile.byRung.UNKNOWN) failures.push(`${profile.name}: invalid or unclassified tasks`);
    const rungTotal = ['R1', 'R2', 'R3', 'R4', 'UNKNOWN'].reduce((sum, rung) => sum + profile.byRung[rung], 0);
    if (rungTotal !== profile.wordTaskCount) failures.push(`${profile.name}: rung counts do not cover every word task`);
    if (profile.firstAcquaintance.numerator + profile.repeatWordTaskCount !== profile.wordTaskCount) {
      failures.push(`${profile.name}: isNew/repeat cohort counts do not cover every word task`);
    }
    if (profile.duplicateChoiceTasks || profile.brokenAnswerPools) failures.push(`${profile.name}: duplicate choices or broken answer pool`);
    failures.push(...(profile.issues || []).map((issue) => `${profile.name}: ${issue}`));
  }
  return failures;
}

function buildReport() {
  const freshScan = scanProfile(false);
  const establishedScan = scanProfile(true);
  const fresh = addRatioFields(freshScan.profile);
  const established = addRatioFields(establishedScan.profile);
  const mixedRepeat = mixedRepeatProfile(establishedScan.completeCardIds);
  mixedRepeat.defaultBudgetSnapshot = mixedRepeatProfile(establishedScan.defaultBudgetCardIds, {
    completeLessons: false,
    name: 'mixedRepeat-default-budget-snapshot'
  });
  const buildCoverage = r3Sample();
  const repeatR1 = targetMetric(mixedRepeat.byRung.R1, mixedRepeat.validTaskCount);
  const integrityFailures = collectIntegrityFailures([fresh, established, mixedRepeat]);
  if (buildCoverage.candidateCards === 0 || buildCoverage.buildTasks === 0
    || buildCoverage.buildTasks + buildCoverage.fallbackTasks !== buildCoverage.candidateCards
    || buildCoverage.brokenFallbackPools > 0) {
    integrityFailures.push('R3 build/fallback coverage sample is empty, incomplete or has a broken answer pool');
  }
  if (mixedRepeat.setupIssues.length) integrityFailures.push(...mixedRepeat.setupIssues);
  const targets = {
    legacyGeneralFresh: fresh.targets.legacyGeneralMultipleChoiceMax60,
    legacyGeneralEstablished: established.targets.legacyGeneralMultipleChoiceMax60,
    matureRepeatR1: { ...repeatR1, decisionRef: DECISION_REF, binding: true }
  };
  const gate = evaluateGate(targets, integrityFailures);
  return {
    schema: SCHEMA,
    schemaVersion: SCHEMA_VERSION,
    decisionRef: DECISION_REF,
    method: {
      expectedLessons: EXPECTED_LESSONS,
      scheduleInputs: 'existing fresh/seeded harness defaults; no onboarding-minute or task-latency override; when a lesson reaches its existing partEnd, the harness follows its saved resume marker through the user-visible budget-overrun action to count the entire planned lesson; the original default-budget visit snapshot is retained separately.',
      legacyGeneral: 'numerator=R1+R2+R4 word answer-task visits; denominator=all valid answer-task visits; fresh and established are separate; isNew tasks remain in this denominator and numerator when MC.',
      matureRepeatR1: 'numerator=R1 repeat word tasks; denominator=R1+R2+R3+R4 repeat word tasks; isNew=false; mixed s=5/12/40; A and B combined primary, arm breakdown reported.',
      fallback: 'fallback means actual rung differs from the A/B-assigned ladder rung before answer; R3/R4 opportunities are the fallback-rate denominator; all repeat words are also reported as a separate denominator.',
      multipleChoice: 'R1, R2 and R4 are multiple-choice; R3 build is production and excluded from the MC numerator. R2 remains visible.'
    },
    cohorts: { fresh, established, mixedRepeat },
    buildCoverage,
    targets,
    approvedDeviation: {
      status: 'APPROVED',
      decisionId: 'recognition',
      reference: APPROVED_DEVIATION_REF,
      decisionRef: DECISION_REF,
      appliesTo: ['legacyGeneralFresh', 'legacyGeneralEstablished'],
      rawStatus: 'NOT_MET remains visible',
      disposition: 'ACCEPTED_DEVIATION',
      operativeTarget: 'matureRepeatR1'
    },
    gate
  };
}

function printHuman(report) {
  const rungSummary = (profile) => ['R1', 'R2', 'R3', 'R4'].map((rung) => {
    const rate = profile.byRungShareOfWordTasks[rung];
    return `${rung}=${rate.numerator}/${rate.denominator} (${rate.percent === null ? 'N/A' : rate.percent + '%'})`;
  }).join(' ');
  const rateText = (metric) => metric.percent === null ? 'N/A' : `${metric.percent}%`;
  for (const profile of [report.cohorts.fresh, report.cohorts.established]) {
    const mc = profile.totalMultipleChoiceShare;
    const fb = profile.fallback;
    console.log(`${profile.name}: eligible=${profile.eligibleTaskCount}; ${rungSummary(profile)}; firstAcquaintance=${profile.firstAcquaintance.numerator}/${profile.firstAcquaintance.denominator} (${rateText(profile.firstAcquaintance)}); totalMC=${mc.numerator}/${mc.denominator} (${mc.percent}%) ${mc.status}; fallback=${fb.count}/${fb.allRepeatTasks} (${rateText(fb.shareOfRepeatTasks)} of repeats; ${fb.count}/${fb.opportunityCount}=${rateText(fb.opportunityRate)} of R3/R4 opportunities)`);
  }
  const mixed = report.cohorts.mixedRepeat;
  const r1 = report.targets.matureRepeatR1;
  const fb = mixed.fallback;
  console.log(`mixed repeat: lessons=${mixed.lessonCount}, cards=${mixed.cards}, eligible=${mixed.eligibleTaskCount}; ${rungSummary(mixed)}; totalMC=${mixed.totalMultipleChoiceShare.numerator}/${mixed.totalMultipleChoiceShare.denominator} (${mixed.totalMultipleChoiceShare.percent}%); repeat R1 target=${r1.numerator}/${r1.denominator} (${r1.percent}%) ${r1.status}; fallback=${fb.count}/${fb.allRepeatTasks} (${rateText(fb.shareOfRepeatTasks)} of repeats; ${fb.count}/${fb.opportunityCount}=${rateText(fb.opportunityRate)} of R3/R4 opportunities)`);
  console.log(`R3 build sample: build=${report.buildCoverage.buildTasks}/${report.buildCoverage.candidateCards} candidates (${rateText(ratioMetric(report.buildCoverage.buildTasks, report.buildCoverage.candidateCards))}); fallback=${report.buildCoverage.fallbackTasks}/${report.buildCoverage.candidateCards} (${rateText(ratioMetric(report.buildCoverage.fallbackTasks, report.buildCoverage.candidateCards))}); broken fallback pools=${report.buildCoverage.brokenFallbackPools}; duplicates fresh/established/mixed=${report.cohorts.fresh.duplicateChoiceTasks}/${report.cohorts.established.duplicateChoiceTasks}/${mixed.duplicateChoiceTasks}; schema=${SCHEMA} v${SCHEMA_VERSION}`);
  console.log(`mixed A/B: ${['A', 'B'].map((arm) => {
    const row = mixed.byArm[arm];
    return `${arm}=${row.tasks} tasks (R1/R2/R3/R4=${row.R1}/${row.R2}/${row.R3}/${row.R4}; fallback=${row.fallback})`;
  }).join('; ')}`);
  const profiles = [report.cohorts.fresh, report.cohorts.established, mixed];
  console.log(`lesson coverage: ${profiles.map((profile) => `${profile.name} ${profile.lessonRuns.completedLessons}/${profile.lessonRuns.plannedLessons} reached summary; partEnd boundaries=${profile.lessonRuns.partEndBoundaryCount}, explicit resume continuations=${profile.lessonRuns.budgetOverrunContinuations}, resumed task visits=${profile.lessonRuns.resumedTaskVisits}`).join('; ')}; integrity violations=${report.gate.violations.filter((item) => item.type === 'integrity').length}`);
  console.log(`K3PD-24 default-budget snapshot (lesson coverage explicitly partial): fresh totalMC=${report.cohorts.fresh.defaultBudgetSnapshot.totalMultipleChoiceShare.numerator}/${report.cohorts.fresh.defaultBudgetSnapshot.totalMultipleChoiceShare.denominator}; established=${report.cohorts.established.defaultBudgetSnapshot.totalMultipleChoiceShare.numerator}/${report.cohorts.established.defaultBudgetSnapshot.totalMultipleChoiceShare.denominator}; mixed-repeat tasks=${report.cohorts.mixedRepeat.defaultBudgetSnapshot.validTaskCount}, cards=${report.cohorts.mixedRepeat.defaultBudgetSnapshot.cards} (${report.cohorts.mixedRepeat.defaultBudgetSnapshot.lessonRuns.coverageStatus})`);
  const violations = report.gate.violations.map((item) => item.type === 'target' ? `${item.id} ${item.status}` : `integrity: ${item.detail}`).join(' | ') || 'none';
  console.log(`legacy general target: fresh=${report.targets.legacyGeneralFresh.status}/${report.targets.legacyGeneralFresh.disposition}, established=${report.targets.legacyGeneralEstablished.status}/${report.targets.legacyGeneralEstablished.disposition}; deviation=${report.approvedDeviation.reference}; repeat R1 target=${r1.status}; gate=${report.gate.status}; violations=${violations}; exit=${report.gate.exitCode}`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--json') || args.filter((arg) => arg === '--json').length > 1) {
    console.error('Kullanım: node tools/kao3/cift-sik.cjs [--json]');
    process.exitCode = 2;
  } else {
    const report = buildReport();
    if (args.includes('--json')) console.log(JSON.stringify(report));
    else printHuman(report);
    process.exitCode = report.gate.exitCode;
  }
}

module.exports = {
  SCHEMA,
  SCHEMA_VERSION,
  classifyWordTask,
  isMultipleChoiceRung,
  targetMetric,
  evaluateGate,
  makeProfile,
  recordTask,
  finishProfile,
  collectIntegrityFailures,
  buildReport
};
