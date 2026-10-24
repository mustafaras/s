'use strict';
// K3P · K-C taban ölçümü (salt-okur, ağsız): bir dersi baştan sona bitirmek kaç dokunuş ister?
// Dokunuş = her gerçek kullanıcı eylemi: şık/harf seçimi (kaoAnswer), "Devam" (kaoContinue),
// zorunlu ileri (kaoLesson('next')), bütçe kararı (partEnd) ve bitirme (summary).
// K3PD-23: çok dokunuşlu görevler (build/order/cloze) HER seçimiyle sayılır — tek tık saymak yasak.
// Kullanım: node kao3-premium/araclar/dokunus-olc.cjs [ders]
const path = require('node:path');
const H = require(path.join(__dirname, '..', '..', 'tests', 'kao', 'helpers', 'kao-harness.js'));

// arm: 'off' (ayar kapalı) · 'fast' (ölçümsüz → yavaş/şerit) · 'timed' (medyan kurulur; her cevap medyan altında → hızlı).
function measure(lessonId, arm, fromHome) {
  const t = H.bootKao({ seeded: true });
  const q = t.data.quranLearn;
  const autoAdvance = arm !== 'off';
  q.settings.autoAdvance = autoAdvance;
  const taps = { answer: 0, cont: 0, next: 0, budget: 0, finish: 0, tasks: 0, fast: 0, slow: 0, strips: 0, parts: 0, screens: [] };
  t.ui.kaoStack = []; t.api.kaoOpen('home');
  t.api.kaoLesson('start', lessonId, fromHome ? 'h' : undefined);
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
    if (item.kind === 'summary') { taps.finish += 1; taps.screens.push('summary'); break; }
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
  return { ...taps, total: taps.answer + taps.cont + taps.next + taps.budget + taps.finish };
}
const lesson = process.argv[2] || 'u01.01';
const off = measure(lesson, 'off', true), fast = measure(lesson, 'fast', true), home = measure(lesson, 'fast', false);
const line = (label, m) => `  ${label}: ${m.total} dokunuş = ${m.answer} cevap + ${m.cont} devam + ${m.next} ileri + ${m.budget} bütçe + ${m.finish} bitir · ${m.tasks} görev · ${m.parts} parça`;
console.log(`ders ${lesson} (hepsi doğru, tam ders — bütün parçalar):`);
console.log(line('otomatik geçiş KAPALI', off));
console.log(line('otomatik geçiş AÇIK  ', fast));
console.log(line('AÇIK + ana ekrandan  ', home));
console.log(`  K3P-15 kollar: yavaş(şerit) ${fast.slow} · hızlı ${fast.fast} · şerit ${fast.strips}`);
console.log(`  ekranlar: ${fast.screens.join(' → ')}`);
console.log(`  fark (kapalı→açık): −${off.total - fast.total} dokunuş (%${Math.round((off.total - fast.total) / off.total * 100)})`);
