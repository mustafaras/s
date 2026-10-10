'use strict';
// K3P · AKIŞ ölçümü (salt-okur, ağsız node:vm). Öğrenme akışını bozan sürtünmeleri sayar:
//  1) açılıştan ilk göreve kaç dokunuş   2) ders içinde görev dışı ara ekran sayısı ve sözcük yükü
//  3) yarıda bırakıp (sayfa yeniden yüklenmiş gibi) dönünce nereden devam edildiği
//  4) art arda yanlışta motorun zorluğu düşürüp düşürmediği (sonraki görevlerin türü)
// Kullanım: node kao3-premium/araclar/akis-olc.cjs [dersId]
const path = require('node:path');
const H = require(path.join(__dirname, '..', '..', 'tests', 'kao', 'helpers', 'kao-harness.js'));
const lessonId = process.argv[2] || 'u01.02';
const words = (html) => H.text(html).split(' ').filter(Boolean).length;
const isTask = (t) => t.ui.kaoLesson && ['practice', 'review'].includes(t.ui.kaoLesson.phase);
const curTask = (t) => { const q = t.ui.kaoQueue[t.ui.kaoTaskIndex]; return q && t.ui.kaoTasks[q.id]; };
const answer = (t, task, right) => {
  const picks = task.kind === 'order' ? task.choices.slice().sort((a, b) => a.ordinal - b.ordinal) : [task.choices.find((c) => !!c.correct === right) || task.choices[0]];
  if (task.kind === 'order' && !right) picks.reverse();
  picks.forEach((c) => t.api.kaoAnswer(task.id, c.choiceId));
  t.api.kaoContinue();
};

// 1) Açılıştan ilk göreve: hub → kaoOpen (1) → Bugün birincil (1) → ara ekranlar
const t = H.bootKao({ seeded: true });
t.ui.kaoStack = []; t.api.kaoOpen('home');
let taps = 1; const tapped = H.tapPrimary(t); taps += 1;
const inter = [];
for (let g = 0; g < 50 && t.ui.kaoLesson && !isTask(t); g += 1) { inter.push(words(t.api.kaoOverlayHTML(t.NOW))); t.api.kaoLesson('next'); taps += 1; }
console.log(`1) Açılış → ilk görev: ${taps} dokunuş (birincil: ${tapped && tapped.name}(${tapped && tapped.args.join(',')}))`);

// 2) Bir dersin baştan sona ritmi: görev ve ara ekran dizisi
const L = H.bootKao({ seeded: true });
L.ui.kaoStack = []; L.api.kaoOpen('home'); L.api.kaoLesson('start', lessonId);
const rhythm = []; let interCount = 0, interWords = 0, maxRun = 0, run = 0, tasks = 0;
for (let g = 0; g < 400 && L.ui.kaoLesson; g += 1) {
  const st = L.ui.kaoLesson, item = st.plan[st.at];
  if (isTask(L)) { const task = curTask(L); if (!task) break; tasks += 1; rhythm.push('G'); run += 1; maxRun = Math.max(maxRun, run); answer(L, task, true); continue; }
  if (!item || item.kind === 'summary') break;
  run = 0; const w = words(L.api.kaoOverlayHTML(L.NOW)); interCount += 1; interWords += w; rhythm.push(`[${item.kind}:${w}]`); L.api.kaoLesson('next');
}
const compact = rhythm.join(' ').replace(/(G )+/g, (m) => `G×${m.trim().split(' ').length} `);
console.log(`2) Ders ${lessonId}: ${tasks} görev, ${interCount} ara ekran (toplam ${interWords} sözcük), en uzun kesintisiz görev dizisi ${maxRun}`);
console.log(`   ritim: ${compact}`);

// 3) Yarıda bırak → sayfa yeniden yüklenmiş gibi ui sıfırla → aç → birincil eyleme bas
const R = H.bootKao({ seeded: true });
R.ui.kaoStack = []; R.api.kaoOpen('home'); R.api.kaoLesson('start', lessonId);
let done = 0;
for (let g = 0; g < 200 && R.ui.kaoLesson && done < 8; g += 1) { if (isTask(R)) { answer(R, curTask(R), true); done += 1; } else R.api.kaoLesson('next'); }
const before = { phase: R.ui.kaoLesson.phase, at: R.ui.kaoLesson.at, idx: R.ui.kaoTaskIndex };
R.api.kaoLesson('exit');
for (const k of Object.keys(R.ui)) delete R.ui[k];
Object.assign(R.ui, { kaoOpen: false, kaoView: 'home', kaoStack: [] });
R.api.kaoOpen('home');
const hero = H.text(R.api.kaoOverlayHTML(R.NOW)).slice(0, 140);
const again = H.tapPrimary(R);
const after = R.ui.kaoLesson ? { phase: R.ui.kaoLesson.phase, at: R.ui.kaoLesson.at, idx: R.ui.kaoTaskIndex } : null;
console.log(`3) Yarıda bırakma: çıkışta ${JSON.stringify(before)} → yeniden açılış Bugün: "${hero}…"`);
console.log(`   birincil: ${again && again.name}(${again && again.args.join(',')}) → ${JSON.stringify(after)}`);

// 4) Art arda 4 yanlış: sonraki görev türleri değişiyor mu (zorluk düşüyor mu)?
const W = H.bootKao({ seeded: true });
W.ui.kaoStack = []; W.api.kaoOpen('home'); W.api.kaoLesson('start', lessonId);
const seq = []; let n = 0;
for (let g = 0; g < 300 && W.ui.kaoLesson && n < 10; g += 1) {
  if (!isTask(W)) { W.api.kaoLesson('next'); continue; }
  const task = curTask(W); const wrong = n < 4; seq.push(`${wrong ? '✕' : '✓'}${task.kind || task.type}/${task.direction || ''}/${(task.choices || []).length}şık`); answer(W, task, !wrong); n += 1;
}
console.log(`4) 4 yanlış + devam: ${seq.join(' · ')}`);
