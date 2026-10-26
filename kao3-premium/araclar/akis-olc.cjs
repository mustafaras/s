'use strict';
// K3P · AKIŞ ölçümü (salt-okur, ağsız node:vm). Öğrenme akışını bozan sürtünmeleri sayar:
//  1) açılıştan ilk göreve kaç dokunuş   2) ders içinde görev dışı ara ekran sayısı ve sözcük yükü
//  3) yarıda bırakıp (sayfa yeniden yüklenmiş gibi) dönünce nereden devam edildiği
//  4) art arda yanlışta motorun zorluğu düşürüp düşürmediği (sonraki görevlerin türü)
// Kullanım: node kao3-premium/araclar/akis-olc.cjs [dersId]
const path = require('node:path');
const H = require(path.join(__dirname, '..', '..', 'tests', 'kao', 'helpers', 'kao-harness.js'));
const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const lessonArgs = args.filter((arg) => arg !== '--json');
if (lessonArgs.length > 1 || lessonArgs.some((arg) => !/^u\d{2}\.\d{2}$/.test(arg))) {
  console.error('Kullanım: node kao3-premium/araclar/akis-olc.cjs [dersId] [--json]');
  process.exit(2);
}
const lessonId = lessonArgs[0] || 'u01.02';
const say = (...values) => { if (!jsonMode) console.log(...values); };
let courseReport = null;
// K3P-A8 (D-4): sözcük sayımı İLK GÖRÜNÜM ölçüsüdür. Katlanmış <details> gövdesi sayılmaz; yalnız
// <summary> (açma düğmesi, ekranda hep görünür) sayılır. Kullanıcı açmadan gördüğü yük ölçülür.
const lessonCard = (html) => {
  const src = String(html);
  const start = src.indexOf('<section class="kao-lesson-card');
  if (start < 0) return '';
  let depth = 0;
  for (let i = start; i < src.length; i += 1) {
    if (src.startsWith('<section', i)) { depth += 1; i += 7; continue; }
    if (src.startsWith('</section>', i)) { depth -= 1; if (depth === 0) return src.slice(start, i + 10); i += 9; }
  }
  return src.slice(start);
};
const firstView = (html) => {
  const card = lessonCard(html);
  const visibleText = H.text(String(card).replace(/<details\b[^>]*>[\s\S]*?<\/details>/g, (m) => {
  const s = /<summary\b[^>]*>([\s\S]*?)<\/summary>/.exec(m);
  return ' ' + H.text(s ? s[1] : '') + ' ';
  }));
  return { words: visibleText ? visibleText.split(/\s+/).filter(Boolean).length : 0,
    cardFound: card.length > 0, visibleText: visibleText.length > 0 };
};
const words = (html) => firstView(html).words;
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
say(`1) Açılış → ilk görev: ${taps} dokunuş (birincil: ${tapped && tapped.name}(${tapped && tapped.args.join(',')}))`);

// 2) Bir dersin baştan sona ritmi: görev ve ara ekran dizisi
const L = H.bootKao({ seeded: true });
L.data.quranLearn.onboarding.minutes = 15;
L.ui.kaoLatency = [6000];
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
say(`2) Ders ${lessonId}: ${tasks} görev, ${interCount} ara ekran (toplam ${interWords} sözcük), en uzun kesintisiz görev dizisi ${maxRun}`);
say(`   ritim: ${compact}`);
say(`   art arda en uzun edilgin dizi ${maxPassive} (özet hariç) · ilk yeni içeriğe (tanış) ${introTap || '—'}. dokunuş`);

// 2b) K3P-A8 (D-4/A-8) · Edilgin ekran bütçesi: hedef, tanış ve kavram ekranlarının İLK GÖRÜNÜMÜ ≤ 45 sözcük.
// Zirve ekranları (uygula okuma + özet) kuralın dışındadır. 109 dersin tamamı + tüm yeni kelimeler taranır.
{
  const lessons = H.bootKao().win.QuranCurriculumV2.units.flatMap((u) => u.lessons);
  const thresholds = { goal: 25, intro: 45, concept: 45 };
  const measureProfile = (profile) => {
    const t = H.bootKao({ seeded: true });
    const visible = Object.fromEntries(Object.keys(thresholds).map((kind) => [kind, []]));
    let completedLessons = 0, startedLessons = 0, maxPassiveRun = 0, maxNoveltyTouch = 0, introductions = 0;
    const emptyVisibleScreens = Object.fromEntries(Object.keys(thresholds).map((kind) => [kind, 0]));
    let openingPairOnly = true;
    for (const lesson of lessons) {
      const q = profile === 'fresh' ? H.freshUser(t) : H.seed(t);
      q.onboarding.minutes = 15;
      for (const key of Object.keys(t.ui)) delete t.ui[key];
      Object.assign(t.ui, { kaoOpen: false, kaoView: 'home', kaoStack: [], kaoLatency: [6000] });
      t.api.kaoOpen('home');
      if (!t.api.kaoLesson('start', lesson.id)) continue;
      startedLessons += 1;
      let taps = 1, passive = 0, passiveKinds = [], firstIntro = null, complete = false;
      for (let g = 0; g < 400 && t.ui.kaoLesson; g += 1) {
        if (isTask(t)) {
          const task = curTask(t);
          if (!task) break;
          answer(t, task, true);
          taps += 1;
          if (profile === 'fresh' && (passiveKinds.length > 2
            || (passiveKinds.length === 2 && !(passiveKinds[0] === 'goal' && passiveKinds[1] === 'intro')))) openingPairOnly = false;
          passive = 0;
          passiveKinds = [];
          continue;
        }
        const st = t.ui.kaoLesson, item = st.plan[st.at];
        if (!item) break;
        if (item.kind === 'partEnd') {
          // Count the explicit overrun decision; K3P-23 requires it to be visible and user-chosen.
          if (!t.api.kaoLesson('budget-overrun')) break;
          taps += 1;
          passive = 0;
          passiveKinds = [];
          continue;
        }
        if (item.kind === 'summary') {
          if (profile === 'fresh' && (passiveKinds.length > 2
            || (passiveKinds.length === 2 && !(passiveKinds[0] === 'goal' && passiveKinds[1] === 'intro')))) openingPairOnly = false;
          complete = true;
          break;
        }
        if (item.kind === 'intro') {
          introductions += 1;
          if (firstIntro === null) firstIntro = taps;
        }
        if (Object.hasOwn(visible, item.kind)) {
          const rendered = firstView(t.api.kaoOverlayHTML(t.NOW));
          visible[item.kind].push(rendered.words);
          if (!rendered.cardFound || !rendered.visibleText) emptyVisibleScreens[item.kind] += 1;
        }
        passive += 1;
        passiveKinds.push(item.kind);
        maxPassiveRun = Math.max(maxPassiveRun, passive);
        if (!t.api.kaoLesson('next')) break;
        taps += 1;
      }
      if (complete) completedLessons += 1;
      if (firstIntro !== null) maxNoveltyTouch = Math.max(maxNoveltyTouch, firstIntro);
    }
    const counts = Object.fromEntries(Object.entries(visible).map(([kind, values]) => {
      const maxWords = values.length ? Math.max(...values) : null;
      return [kind, { screens: values.length, minWords: values.length ? Math.min(...values) : null, maxWords,
        emptyScreens: emptyVisibleScreens[kind], limit: thresholds[kind], overLimit: values.filter((value) => value > thresholds[kind]).length }];
    }));
    return { lessonCount: lessons.length, startedLessons, completedLessons, coverageComplete: lessons.length === 109 && startedLessons === 109 && completedLessons === 109,
      maxPassiveRun, maxNoveltyTouch, introductions, freshOpeningPairOnly: profile === 'fresh' ? openingPairOnly : null, visibleText: counts };
  };
  const profiles = { fresh: measureProfile('fresh'), established: measureProfile('established') };
  const over = [];
  for (const kind of Object.keys(thresholds)) {
    const metric = profiles.established.visibleText[kind];
    if (metric.overLimit) over.push(`${kind} ${metric.overLimit}/${metric.screens} (en çok ${metric.maxWords})`);
    say(`2b) ${kind}: ${metric.screens} ekran · ilk görünüm en çok ${metric.maxWords} sözcük · >${metric.limit}: ${metric.overLimit}`);
  }
  say(`2b) edilgin ekran bütçesi (zirve hariç): ${over.length ? 'HAYIR — ' + over.join(' · ') : 'evet'}`);
  courseReport = { profiles };
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
say(`3) Yarıda bırakma: çıkışta ${JSON.stringify(before)} → yeniden açılış Bugün: "${hero}…"`);
say(`   birincil: ${again && again.name}(${again && again.args.join(',')}) → ${JSON.stringify(after)} · aynı görev: ${!!after && after.item === before.item ? 'evet' : 'HAYIR'}`);

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
say(`4) Uyarlanır zorluk: 4 yanlış + devam: ${seq.join(' · ')}`);
say(`   2 yanlıştan sonra şık ≤3: ${afterTwoWrong.every((v) => v > 0 && v <= 3) ? 'evet' : 'HAYIR'} (${afterTwoWrong.join(',')}) · akışa dönünce 4: ${backInFlow.some((v) => v === 4) ? 'evet' : 'HAYIR'} (${backInFlow.join(',')})`);

if (jsonMode) {
  const course = courseReport;
  const report = {
    schema: 'k3pd.flow-measurement', schemaVersion: 1,
    source: 'kaoOverlayHTML:first-view', selectedLesson: { openingToFirstTaskTouches: taps, reachedFirstTask: isTask(t), taskCount: tasks,
      maxPassiveRun: maxPassive, maxNoveltyTouch: introTap || null },
    profiles: course.profiles,
  };
  console.log(JSON.stringify(report));
  const complete = report.selectedLesson.reachedFirstTask
    && ['fresh', 'established'].every((name) => {
      const profile = report.profiles[name];
      return profile.coverageComplete && profile.introductions > 0 && Number.isFinite(profile.maxNoveltyTouch)
        && Object.values(profile.visibleText).every((metric) => metric.screens > 0 && Number.isFinite(metric.maxWords));
    });
  if (!complete) process.exitCode = 1;
}
