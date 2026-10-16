'use strict';
// K3P · K-C taban ölçümü (salt-okur, ağsız): bir dersi baştan sona bitirmek kaç dokunuş ister?
// Dokunuş = kaoAnswer + kaoContinue + kaoLesson('next'). K3P-15 üç kol: hızlı doğru 600 ms, yavaş doğru 1.600 ms
// şerit (dokunulursa Devam sayılır), yanlış tam kart. Yanıt süresi kişisel medyana göre kol seçer.
// Kullanım: node kao3-premium/araclar/dokunus-olc.cjs [ders]
const path = require('node:path');
const H = require(path.join(__dirname, '..', '..', 'tests', 'kao', 'helpers', 'kao-harness.js'));

// arm: 'off' (ayar kapalı) · 'fast' (ölçümsüz → yavaş/şerit) · 'timed' (medyan kurulur; her cevap medyan altında → hızlı).
function measure(lessonId, arm) {
  const t = H.bootKao({ seeded: true });
  const q = t.data.quranLearn;
  const autoAdvance = arm !== 'off';
  q.settings.autoAdvance = autoAdvance;
  const taps = { answer: 0, cont: 0, next: 0, tasks: 0, fast: 0, slow: 0, strips: 0 };
  t.ui.kaoStack = []; t.api.kaoOpen('home');
  t.api.kaoLesson('start', lessonId);
  let startedTask = null;
  for (let guard = 0; guard < 400 && t.ui.kaoLesson; guard += 1) {
    const st = t.ui.kaoLesson, item = st.plan[st.at];
    if (st.phase === 'practice' || st.phase === 'review') {
      const qi = t.ui.kaoQueue[t.ui.kaoTaskIndex], task = qi && t.ui.kaoTasks[qi.id];
      if (!task) break;
      taps.tasks += 1; startedTask = task.id;
      // K3P-17/18: 'order', 'build' ve 'cloze' çok-dokunuşlu yollardır; doğru dizi paylaşılan yardımcıdan gelir.
      H.correctTaps(task).forEach((choiceId) => { t.api.kaoAnswer(task.id, choiceId); taps.answer += 1; });
      const panel = t.ui.kaoPanel;
      if (panel && panel.correct === true) { if (panel.slow === true) taps.slow += 1; else taps.fast += 1; if (t.api.kaoTaskHTML(task).includes('kao-feedback-strip')) taps.strips += 1; }
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
// 'fast': latency yok → doğru cevaplar 1.600 ms şeritte bekler (dokunuş yok, zamanlayıcı ilerletir).
const off = measure(lesson, 'off'), fast = measure(lesson, 'fast');
console.log(`ders ${lesson} (hepsi doğru):`);
console.log(`  otomatik geçiş KAPALI: ${off.total} dokunuş = ${off.answer} cevap + ${off.cont} devam + ${off.next} ileri · ${off.tasks} görev`);
console.log(`  otomatik geçiş AÇIK  : ${fast.total} dokunuş = ${fast.answer} cevap + ${fast.cont} devam + ${fast.next} ileri`);
console.log(`  K3P-15 kollar: yavaş(şerit) ${fast.slow} · hızlı ${fast.fast} · şerit ${fast.strips}`);
console.log(`  fark: −${off.total - fast.total} dokunuş (%${Math.round((off.total - fast.total) / off.total * 100)})`);

