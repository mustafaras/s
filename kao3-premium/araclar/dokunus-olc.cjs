'use strict';
// K3P · K-C taban ölçümü (salt-okur, ağsız): bir dersi baştan sona bitirmek kaç dokunuş ister?
// Dokunuş = her gerçek kullanıcı eylemi: şık/harf seçimi (kaoAnswer), "Devam" (kaoContinue),
// zorunlu ileri (kaoLesson('next')), bütçe kararı (partEnd) ve bitirme (summary).
// K3PD-23: çok dokunuşlu görevler (build/order/cloze) HER seçimiyle sayılır — tek tık saymak yasak.
// Kullanım: node kao3-premium/araclar/dokunus-olc.cjs [ders]
const path = require('node:path');
const H = require(path.join(__dirname, '..', '..', 'tests', 'kao', 'helpers', 'kao-harness.js'));
const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const allMode = args.includes('--all');
const lessonArgs = args.filter((arg) => arg !== '--json' && arg !== '--all');
if (lessonArgs.length > 1 || lessonArgs.some((arg) => !/^u\d{2}\.\d{2}$/.test(arg)) || (allMode && lessonArgs.length)) {
  console.error('Kullanım: node kao3-premium/araclar/dokunus-olc.cjs [dersId] [--all] [--json]');
  process.exit(2);
}
const requestedLesson = lessonArgs[0] || 'u01.01';

// arm: 'off' (ayar kapalı) · 'fast' (ölçümsüz → yavaş/şerit) · 'timed' (medyan kurulur; her cevap medyan altında → hızlı).
function measure(lessonId, arm, fromHome) {
  const t = H.bootKao({ seeded: true });
  const q = t.data.quranLearn;
  q.onboarding.minutes = 15;
  t.ui.kaoLatency = [6000];
  const autoAdvance = arm !== 'off';
  q.settings.autoAdvance = autoAdvance;
  const taps = { answer: 0, cont: 0, next: 0, budget: 0, finish: 0, tasks: 0, fast: 0, slow: 0, strips: 0, parts: 0, screens: [] };
  t.ui.kaoStack = []; t.api.kaoOpen('home');
  const started = t.api.kaoLesson('start', lessonId, fromHome ? 'h' : undefined) === true;
  let completed = false;
  for (let guard = 0; guard < 2000 && t.ui.kaoLesson; guard += 1) {
    const st = t.ui.kaoLesson, item = st.plan[st.at];
    if (st.phase === 'practice' || st.phase === 'review') {
      const qi = t.ui.kaoQueue[t.ui.kaoTaskIndex], task = qi && t.ui.kaoTasks[qi.id];
      if (!task) break;
      taps.tasks += 1;
      // K3P-17/18: 'order', 'build' ve 'cloze' çok-dokunuşlu yollardır; doğru dizi paylaşılan yardımcıdan gelir.
      H.correctTaps(task).forEach((choiceId) => { t.api.kaoAnswer(task.id, choiceId); taps.answer += 1; });
      const panel = t.ui.kaoPanel;
      if (panel && panel.correct === true) { if (panel.slow === true) taps.slow += 1; else taps.fast += 1; if (t.api.kaoTaskHTML(task).includes('kao-feedback-strip')) taps.strips += 1; }
      const timer = t.timers.pop();
      if (autoAdvance && timer && t.ui.kaoPanel && t.ui.kaoPanel.correct) { timer.fn(); continue; }
      t.api.kaoContinue(); taps.cont += 1;
      continue;
    }
    if (!item) break;
    if (item.kind === 'summary') { taps.finish += 1; taps.screens.push('summary'); completed = true; break; }
    if (item.kind === 'partEnd') {
      // K3PD-23: bütçe kesme ekranı gerçek bir karar dokunuşudur; 'next' burada false döner.
      // K3PD-23: kesme artık yalnız gerçekten görev kalıyorsa üretilir; yine de görülürse sayılır.
      taps.parts += 1; taps.budget += 1; taps.screens.push('partEnd');
      if (!t.api.kaoLesson('budget-overrun')) break;
      continue;
    }
    taps.screens.push(item.kind);
    if (!t.api.kaoLesson('next')) break;
    taps.next += 1;
  }
  return { ...taps, started, completed, total: taps.answer + taps.cont + taps.next + taps.budget + taps.finish };
}
const lesson = requestedLesson;
const curriculum = H.bootKao().win.QuranCurriculumV2.units.flatMap((unit) => unit.lessons);
const lessonIds = allMode ? curriculum.map((item) => item.id) : [lesson];
const standardLessonId = allMode && lessonIds.includes('u01.01') ? 'u01.01' : lesson;
const offResults = lessonIds.map((id) => measure(id, 'off', true));
const fastResults = lessonIds.map((id) => measure(id, 'fast', true));
const homeResults = lessonIds.map((id) => measure(id, 'fast', false));
const off = offResults[0], fast = fastResults[0], home = homeResults[0];
const selectedIndex = lessonIds.indexOf(standardLessonId);
const line = (label, m) => `  ${label}: ${m.total} dokunuş = ${m.answer} cevap + ${m.cont} devam + ${m.next} ileri + ${m.budget} bütçe + ${m.finish} bitir · ${m.tasks} görev · ${m.parts} parça`;
if (jsonMode) {
  const summarize = (results) => {
    const totals = results.map((item) => item.total);
    const valid = results.filter((item) => item.started && item.completed && Number.isFinite(item.total));
    return {
      lessonCount: results.length,
      startedLessons: results.filter((item) => item.started).length,
      completedLessons: results.filter((item) => item.completed).length,
      validLessons: valid.length,
      coverageComplete: results.length === 109 && valid.length === 109,
      minTouches: totals.length ? Math.min(...totals) : null,
      maxTouches: totals.length ? Math.max(...totals) : null,
      meanTouches: totals.length ? Number((totals.reduce((sum, value) => sum + value, 0) / totals.length).toFixed(3)) : null,
      above40: totals.filter((value) => value > 40).length,
      above42: totals.filter((value) => value > 42).length,
    };
  };
  const report = {
    schema: 'k3pd.touch-measurement', schemaVersion: 1,
    source: 'kaoLesson/kaoAnswer/kaoContinue actual handler sequence',
    expectedLessonCount: 109,
    scope: allMode ? 'all-current-lessons' : 'single-lesson',
    selectedLesson: {
      lessonId: standardLessonId,
      autoAdvanceOff: { started: offResults[selectedIndex].started, completed: offResults[selectedIndex].completed, total: offResults[selectedIndex].total },
      autoAdvanceOn: { started: fastResults[selectedIndex].started, completed: fastResults[selectedIndex].completed, total: fastResults[selectedIndex].total },
      autoAdvanceOnFromHome: { started: homeResults[selectedIndex].started, completed: homeResults[selectedIndex].completed, total: homeResults[selectedIndex].total },
    },
    profiles: {
      autoAdvanceOff: summarize(offResults),
      autoAdvanceOn: summarize(fastResults),
      autoAdvanceOnFromHome: summarize(homeResults),
    },
  };
  console.log(JSON.stringify(report));
  if (allMode && Object.values(report.profiles).some((profile) => !profile.coverageComplete)) process.exitCode = 1;
} else {
  console.log(`ders ${lesson} (hepsi doğru, tam ders — bütün parçalar):`);
  console.log(line('otomatik geçiş KAPALI', off));
  console.log(line('otomatik geçiş AÇIK  ', fast));
  console.log(line('AÇIK + ana ekrandan  ', home));
  console.log(`  K3P-15 kollar: yavaş(şerit) ${fast.slow} · hızlı ${fast.fast} · şerit ${fast.strips}`);
  console.log(`  ekranlar: ${fast.screens.join(' → ')}`);
  console.log(`  fark (kapalı→açık): −${off.total - fast.total} dokunuş (%${Math.round((off.total - fast.total) / off.total * 100)})`);
}
