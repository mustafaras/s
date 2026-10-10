'use strict';
// K3P · K-C taban ölçümü (salt-okur, ağsız): bir dersi baştan sona bitirmek kaç dokunuş ister?
// Dokunuş = kaoAnswer + kaoContinue + kaoLesson('next'). Otomatik geçiş açık/kapalı karşılaştırılır.
// Kullanım: node kao3-premium/araclar/dokunus-olc.cjs
const path = require('node:path');
const H = require(path.join(__dirname, '..', '..', 'tests', 'kao', 'helpers', 'kao-harness.js'));

function measure(lessonId, autoAdvance) {
  const t = H.bootKao({ seeded: true });
  const q = t.data.quranLearn;
  q.settings.autoAdvance = autoAdvance;
  const taps = { answer: 0, cont: 0, next: 0, tasks: 0, correct: 0 };
  t.ui.kaoStack = []; t.api.kaoOpen('home');
  t.api.kaoLesson('start', lessonId);
  for (let guard = 0; guard < 400 && t.ui.kaoLesson; guard += 1) {
    const st = t.ui.kaoLesson, item = st.plan[st.at];
    if (st.phase === 'practice' || st.phase === 'review') {
      const qi = t.ui.kaoQueue[t.ui.kaoTaskIndex], task = qi && t.ui.kaoTasks[qi.id];
      if (!task) break;
      taps.tasks += 1;
      const picks = task.kind === 'order' ? task.choices.slice().sort((a, b) => a.ordinal - b.ordinal) : [task.choices.find((c) => c.correct)];
      picks.forEach((c) => { t.api.kaoAnswer(task.id, c.choiceId); taps.answer += 1; });
      // Otomatik geçişte doğru cevabın "Devam"ı zamanlayıcıdan gelir (dokunuş sayılmaz).
      const timer = t.timers.pop();
      if (autoAdvance && timer && t.ui.kaoPanel && t.ui.kaoPanel.correct) { timer.fn(); continue; }
      t.api.kaoContinue(); taps.cont += 1;
      continue;
    }
    if (!item || item.kind === 'summary') break;
    t.api.kaoLesson('next'); taps.next += 1;
  }
  return { ...taps, total: taps.answer + taps.cont + taps.next };
}
const lesson = process.argv[2] || 'u01.01';
const off = measure(lesson, false), on = measure(lesson, true);
console.log(`ders ${lesson} (hepsi doğru):`);
console.log(`  otomatik geçiş KAPALI: ${off.total} dokunuş = ${off.answer} cevap + ${off.cont} devam + ${off.next} ileri · ${off.tasks} görev`);
console.log(`  otomatik geçiş AÇIK  : ${on.total} dokunuş = ${on.answer} cevap + ${on.cont} devam + ${on.next} ileri`);
console.log(`  fark: −${off.total - on.total} dokunuş (%${Math.round((off.total - on.total) / off.total * 100)})`);
