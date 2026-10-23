'use strict';
// K3P · AKIŞ ölçümü (salt-okur, ağsız node:vm). Öğrenme akışını bozan sürtünmeleri sayar:
//  1) açılıştan ilk göreve kaç dokunuş   2) ders içinde görev dışı ara ekran sayısı ve sözcük yükü
//  3) yarıda bırakıp (sayfa yeniden yüklenmiş gibi) dönünce nereden devam edildiği
//  4) art arda yanlışta motorun zorluğu düşürüp düşürmediği (sonraki görevlerin türü)
// Kullanım: node kao3-premium/araclar/akis-olc.cjs [dersId]
const path = require('node:path');
const H = require(path.join(__dirname, '..', '..', 'tests', 'kao', 'helpers', 'kao-harness.js'));
const lessonId = process.argv[2] || 'u01.02';
// K3P-A8 (D-4): sözcük sayımı İLK GÖRÜNÜM ölçüsüdür. Katlanmış <details> gövdesi sayılmaz; yalnız
// <summary> (açma düğmesi, ekranda hep görünür) sayılır. Kullanıcı açmadan gördüğü yük ölçülür.
const firstView = (html) => H.text(String(html).replace(/<details\b[^>]*>[\s\S]*?<\/details>/g, (m) => {
  const s = /<summary\b[^>]*>([\s\S]*?)<\/summary>/.exec(m);
  return ' ' + H.text(s ? s[1] : '') + ' ';
})).split(' ').filter(Boolean).length;
const words = (html) => firstView(html);
const isTask = (t) => t.ui.kaoLesson && ['practice', 'review'].includes(t.ui.kaoLesson.phase);
const curTask = (t) => { const q = t.ui.kaoQueue[t.ui.kaoTaskIndex]; return q && t.ui.kaoTasks[q.id]; };
const answer = (t, task, right) => {
  // K3P-17/18: 'order', 'build' ve 'cloze' çok-dokunuşlu yollardır; doğru dizi paylaşılan yardımcıdan gelir.
  // Doğru kurulmazsa görev 'pending' kalır ve döngü ilerlemez (bu, K3P-18'den önce ölçümü bozuyordu).
  const picks = right ? H.correctTaps(task).map((choiceId) => ({ choiceId }))
    : (task.kind === 'build'
      ? Array.from({ length: String(task.answer || '').replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/g, '').length },
        (_unused, k) => { const bad = task.choices.filter((c) => c.correct !== true); return bad[k % bad.length]; })
      : (task.kind === 'order'
        ? task.choices.slice().sort((a, b) => b.ordinal - a.ordinal)
        : [task.choices.find((c) => !c.correct) || task.choices[0]]));
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
// Dokunuş (K3P-A3): başlat + her cevap + her "Devam"; cevap panelindeki geç dokunuşu sayılmaz (AKIS §1 tabanı 21 de böyle).
const rhythm = []; let interCount = 0, interWords = 0, maxRun = 0, run = 0, tasks = 0, passive = 0, maxPassive = 0, taps2 = 1, introTap = 0;
for (let g = 0; g < 400 && L.ui.kaoLesson; g += 1) {
  const st = L.ui.kaoLesson, item = st.plan[st.at];
  if (isTask(L)) { const task = curTask(L); if (!task) break; tasks += 1; rhythm.push('G'); run += 1; maxRun = Math.max(maxRun, run); passive = 0; answer(L, task, true); taps2 += 1; continue; }
  if (!item || item.kind === 'summary') break;
  if (item.kind === 'intro' && !introTap) introTap = taps2;
  run = 0; passive += 1; maxPassive = Math.max(maxPassive, passive);
  const w = words(L.api.kaoOverlayHTML(L.NOW)); interCount += 1; interWords += w; rhythm.push(`[${item.kind}:${w}]`); L.api.kaoLesson('next'); taps2 += 1;
}
const compact = rhythm.join(' ').replace(/(G )+/g, (m) => `G×${m.trim().split(' ').length} `);
console.log(`2) Ders ${lessonId}: ${tasks} görev, ${interCount} ara ekran (toplam ${interWords} sözcük), en uzun kesintisiz görev dizisi ${maxRun}`);
console.log(`   ritim: ${compact}`);
console.log(`   art arda en uzun edilgin dizi ${maxPassive} (özet hariç) · ilk yeni içeriğe (tanış) ${introTap || '—'}. dokunuş`);

// 2b) K3P-A8 (D-4/A-8) · Edilgin ekran bütçesi: hedef, tanış ve kavram ekranlarının İLK GÖRÜNÜMÜ ≤ 45 sözcük.
// Zirve ekranları (uygula okuma + özet) kuralın dışındadır. 109 dersin tamamı + tüm yeni kelimeler taranır.
{
  const lessons = H.bootKao().win.QuranCurriculumV2.units.flatMap((u) => u.lessons);
  const budgets = { goal: [], intro: [], concept: [] };
  for (const lesson of lessons) {
    const t = H.bootKao({ seeded: true }); t.ui.kaoStack = []; t.api.kaoOpen('home');
    if (!t.api.kaoLesson('start', lesson.id)) continue;
    for (let g = 0; g < 400 && t.ui.kaoLesson; g += 1) {
      if (isTask(t)) { const task = curTask(t); if (!task) break; answer(t, task, true); continue; }
      const st = t.ui.kaoLesson, item = st.plan[st.at];
      if (!item || item.kind === 'summary') break;
      if (budgets[item.kind]) budgets[item.kind].push([words(t.api.kaoOverlayHTML(t.NOW)), lesson.id]);
      t.api.kaoLesson('next');
    }
  }
  const over = [];
  for (const kind of Object.keys(budgets)) {
    const list = budgets[kind];
    const max = list.reduce((a, b) => (b[0] > a[0] ? b : a), [0, '—']);
    const badN = list.filter((x) => x[0] > 45).length;
    if (badN) over.push(`${kind} ${badN}/${list.length} (en çok ${max[0]} · ${max[1]})`);
    console.log(`2b) ${kind}: ${list.length} ekran · ilk görünüm en çok ${max[0]} sözcük (${max[1]}) · >45: ${badN}`);
  }
  console.log(`2b) edilgin ekran bütçesi ≤ 45 sözcük (zirve hariç): ${over.length ? 'HAYIR — ' + over.join(' · ') : 'evet'}`);
}

// 3) Yarıda bırak → sayfa yeniden yüklenmiş gibi ui sıfırla → aç → birincil eyleme bas
const R = H.bootKao({ seeded: true });
R.ui.kaoStack = []; R.api.kaoOpen('home'); H.tapPrimary(R); // Bugün'ün başlattığı ders: yeniden açılış da onu sürdürür
const resumedLesson = R.ui.kaoLesson.lessonId;
let done = 0;
for (let g = 0; g < 200 && R.ui.kaoLesson && done < 8; g += 1) { if (isTask(R)) { answer(R, curTask(R), true); done += 1; } else R.api.kaoLesson('next'); }
// K3PD-22: bütçe kesme ekranı (partEnd) kendi kimliğini değil, çözmeyi beklediği işi temsil eder
// (resumeItemId). Aksi hâlde "aynı göreve dönüldü mü" ölçümü yanlış HAYIR veriyordu.
const pendingOf = (t) => {
  const q = t.ui.kaoLesson && t.ui.kaoQueue[t.ui.kaoTaskIndex];
  if (q) return q.id;
  const item = t.ui.kaoLesson && t.ui.kaoLesson.plan[t.ui.kaoLesson.at];
  return item ? String(item.resumeItemId || item.id) : '';
};
const before = { lesson: resumedLesson, phase: R.ui.kaoLesson.phase, item: pendingOf(R) };
R.api.kaoLesson('exit');
for (const k of Object.keys(R.ui)) delete R.ui[k];
Object.assign(R.ui, { kaoOpen: false, kaoView: 'home', kaoStack: [] });
R.api.kaoOpen('home');
const hero = H.text(R.api.kaoOverlayHTML(R.NOW)).slice(0, 140);
const again = H.tapPrimary(R);
const after = R.ui.kaoLesson ? { lesson: R.ui.kaoLesson.lessonId, phase: R.ui.kaoLesson.phase, item: pendingOf(R) } : null;
console.log(`3) Yarıda bırakma: çıkışta ${JSON.stringify(before)} → yeniden açılış Bugün: "${hero}…"`);
console.log(`   birincil: ${again && again.name}(${again && again.args.join(',')}) → ${JSON.stringify(after)} · aynı görev: ${!!after && after.item === before.item ? 'evet' : 'HAYIR'}`);

// 4) Art arda 4 yanlış: sonraki görev türleri değişiyor mu (zorluk düşüyor mu)?
const W = H.bootKao({ seeded: true });
W.ui.kaoStack = []; W.api.kaoOpen('home'); W.api.kaoLesson('start', lessonId);
const seq = []; let n = 0;
for (let g = 0; g < 300 && W.ui.kaoLesson && n < 10; g += 1) {
  if (!isTask(W)) { W.api.kaoLesson('next'); continue; }
  const task = curTask(W); const wrong = n < 4; seq.push(`${wrong ? '✕' : '✓'}${task.kind || task.type}/${task.direction || ''}/${(task.choices || []).length}şık`); answer(W, task, !wrong); n += 1;
}
// K3P-A5 (AKIS §4): kaygı kolunda şık sayısı düşer (4→3→2) ve ses otomatik çalar; akışa dönünce 4'e çıkar.
const afterTwoWrong = seq.slice(2, 4).map((x) => Number((/(\d+)şık/.exec(x) || [])[1] || 0));
const backInFlow = seq.slice(4).map((x) => Number((/(\d+)şık/.exec(x) || [])[1] || 0));
console.log(`4) Uyarlanır zorluk: 4 yanlış + devam: ${seq.join(' · ')}`);
console.log(`   2 yanlıştan sonra şık ≤3: ${afterTwoWrong.every((v) => v > 0 && v <= 3) ? 'evet' : 'HAYIR'} (${afterTwoWrong.join(',')}) · akışa dönünce 4: ${backInFlow.some((v) => v === 4) ? 'evet' : 'HAYIR'} (${backInFlow.join(',')})`);
