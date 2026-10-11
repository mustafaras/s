'use strict';

// K3P-A3 · Nefes ritmi (AKIS §3; A-1, A-2, K-L): hedef → ısınma (vadeli tekrarın en kararlı 3–5'i) → [tanış → hemen 2 şıklı soru]
// × yeni kelime → kavram + hemen 1 görev → karışık pekiştirme (tür blokları) → zirve (uygula) → özet.
// 109 ders GERÇEK handler'larla oynatılır. Dokunuş: başlat + her cevap + her "Devam" (cevap panelindeki geç dokunuşu sayılmaz;
// AKIS §1 tabanı "21" de böyle sayıldı). Özet ekranı kapanıştır, edilgin dizi sayımına girmez. Sentetik node:vm; ağ/depo yok.
const assert = require('node:assert/strict');
const { bootKao, seed, freshUser, tapPrimary } = require('./helpers/kao-harness');

const MAX_PASSIVE_RUN = 1;
const MAX_TAPS_TO_INTRO = 7;
const TASK_COUNT_BAND = 0.2;
// Değişiklik öncesi (K3P-A2, 2026-10-11) tohumlu kullanıcıda ders başına gösterilen görev sayısı (yeniden deneme hariç), 109 ders sırasıyla.
const TASKS_BEFORE = '30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,29,29,29,30,30,30'.split(',').map(Number);

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

const isTask = (t) => !!t.ui.kaoLesson && ['practice', 'review'].includes(t.ui.kaoLesson.phase);
const curItem = (t) => t.ui.kaoQueue[t.ui.kaoTaskIndex];
const curTask = (t) => { const item = curItem(t); return item && t.ui.kaoTasks[item.id]; };
function answerRight(t, task) {
  const picks = task.kind === 'order' ? task.choices.slice().sort((a, b) => a.ordinal - b.ordinal) : [task.choices.find((c) => c.correct) || task.choices[0]];
  picks.forEach((c) => t.api.kaoAnswer(task.id, c.choiceId));
  t.api.kaoContinue();
}
function resetUi(t) {
  for (const key of Object.keys(t.ui)) delete t.ui[key];
  Object.assign(t.ui, { kaoOpen: true, kaoView: 'home', kaoStack: [] });
}
// Başlamış dersi oynatır; ekran dizisini {step, tap, itemId, cardId, choices, lemmaId} olarak döndürür.
function play(t, lessonId, { stopAfterTasks = Infinity } = {}) {
  const steps = [];
  let taps = 1, tasks = 0;
  for (let guard = 0; guard < 400; guard += 1) {
    if (isTask(t)) {
      if (tasks >= stopAfterTasks) return steps;
      const task = curTask(t);
      assert.ok(task, `${lessonId}: görev kurulamadı`);
      steps.push({ step: 'task', tap: taps, itemId: curItem(t).id, cardId: task.cardId, choices: (task.choices || []).length, retry: !!task.retry });
      answerRight(t, task); taps += 1; tasks += 1;
      continue;
    }
    const st = t.ui.kaoLesson, item = st && st.plan[st.at];
    assert.ok(item, `${lessonId}: plan dışına düştü`);
    steps.push({ step: item.kind, tap: taps, lemmaId: item.lemmaId || '' });
    if (item.kind === 'summary') return steps;
    assert.equal(t.api.kaoLesson('next'), true, `${lessonId}: Devam çalışmadı (${item.kind})`);
    taps += 1;
  }
  throw new Error(`${lessonId}: özete ulaşılamadı`);
}
function walk(t, lessonId, options) {
  assert.equal(t.api.kaoLesson('start', lessonId), true, `${lessonId}: başlamadı`);
  return play(t, lessonId, options);
}
function passiveRuns(steps) {
  const runs = []; let run = [];
  for (const s of steps) {
    if (s.step === 'summary') break;
    if (s.step === 'task') { if (run.length) runs.push(run); run = []; } else run.push(s.step);
  }
  if (run.length) runs.push(run);
  return runs;
}

const t = bootKao({ seeded: true });
const lessons = t.win.QuranCurriculumV2.units.flatMap((unit) => unit.lessons);

check('109 ders (yerleşik kullanıcı): art arda edilgin ekran ≤ 1 (hedef dâhil); ilk tanış ≤ 7. dokunuşta; her tanıştan hemen sonra o kelimenin 2 şıklı görevi; görev sayısı ±%20', () => {
  assert.equal(lessons.length, 109);
  assert.equal(TASKS_BEFORE.length, 109);
  const bad = [];
  let worstRun = 0, worstTaps = 0, intros = 0;
  lessons.forEach((lesson, index) => {
    seed(t); resetUi(t);
    const steps = walk(t, lesson.id);
    const longest = Math.max(0, ...passiveRuns(steps).map((run) => run.length));
    worstRun = Math.max(worstRun, longest);
    if (longest > MAX_PASSIVE_RUN) bad.push(`${lesson.id}: edilgin dizi ${longest}`);
    const firstIntro = steps.find((s) => s.step === 'intro');
    if (firstIntro) { worstTaps = Math.max(worstTaps, firstIntro.tap); if (firstIntro.tap > MAX_TAPS_TO_INTRO) bad.push(`${lesson.id}: ilk tanış ${firstIntro.tap}. dokunuşta`); }
    steps.forEach((s, at) => {
      if (s.step !== 'intro') return;
      intros += 1;
      const after = steps[at + 1];
      if (!after || after.step !== 'task' || after.cardId !== `w:${s.lemmaId}:ar>tr` || after.choices !== 2) bad.push(`${lesson.id}: ${s.lemmaId} tanışından sonra ${after ? after.step + ':' + (after.cardId || '') + '/' + after.choices : 'hiçbir şey'}`);
    });
    const shown = steps.filter((s) => s.step === 'task' && !s.retry).length, before = TASKS_BEFORE[index];
    if (Math.abs(shown - before) > before * TASK_COUNT_BAND) bad.push(`${lesson.id}: görev ${shown} (önce ${before})`);
  });
  assert.deepEqual(bad.slice(0, 8), [], `${bad.length} ihlal`);
  assert.ok(intros > 0, 'hiç tanış ekranı yok');
  console.log(`      en uzun edilgin dizi ${worstRun} · ilk tanışa en çok ${worstTaps} dokunuş · ${intros} tanış`);
});

check('ritim sırası: hedef → ısınma → tanış-sına → kavram + 1 görev → karışık → uygula → özet (u01.02)', () => {
  seed(t); resetUi(t);
  const kinds = walk(t, 'u01.02').map((s) => s.step);
  assert.equal(kinds[0], 'goal');
  const firstIntro = kinds.indexOf('intro'), concept = kinds.indexOf('concept'), apply = kinds.indexOf('apply');
  const warm = kinds.slice(1, firstIntro);
  assert.ok(warm.length >= 3 && warm.length <= 5 && warm.every((k) => k === 'task'), `ısınma ${warm.join(',')}`);
  assert.ok(firstIntro < concept && concept < apply, 'tanış → kavram → uygula');
  assert.equal(kinds[concept + 1], 'task', 'kavramdan hemen sonra görev');
  assert.ok(kinds.slice(concept + 1, apply).every((k) => k === 'task'), 'karışık pekiştirme kesintisiz görev');
  assert.equal(kinds.at(-1), 'summary'); assert.equal(kinds.at(-2), 'apply');
});

check('ısınma: vadeli tekrarların kararlılığı (s) en yüksek olanları; kalan tekrarlar karışık bölüme blok blok serpiştirilir', () => {
  const q = seed(t); resetUi(t);
  Object.keys(q.cards).forEach((id, i) => { q.cards[id].s = 10 + (i * 7) % 40; });
  assert.equal(t.api.kaoLesson('start', 'u01.02'), true);
  const plan = t.ui.kaoLesson.plan;
  const firstIntro = plan.findIndex((item) => item.kind === 'intro'), concept = plan.findIndex((item) => item.kind === 'concept');
  const apply = plan.findIndex((item) => item.kind === 'apply');
  const warm = plan.slice(1, firstIntro), reviews = plan.filter((item) => item.group === 'review');
  assert.ok(warm.length >= 3 && warm.length <= 5, `ısınma ${warm.length}`);
  assert.ok(warm.every((item) => item.group === 'review'), 'ısınma tekrar kartlarından');
  const stability = (item) => q.cards[item.cardId].s;
  const restMax = Math.max(...reviews.filter((item) => !warm.includes(item)).map(stability));
  assert.ok(Math.min(...warm.map(stability)) >= restMax, `ısınma s ${warm.map(stability)} · kalan en yüksek ${restMax}`);
  const mixed = plan.slice(concept + 1, apply);
  assert.equal(reviews.length, warm.length + mixed.filter((item) => item.group === 'review').length, 'kalan tekrarlar karışık bölümde');
  assert.ok(mixed.some((item) => item.group === 'review') && mixed.some((item) => item.group !== 'review'), 'karışık bölüm tekrar + ders görevi');
  // Görev türü her soruda değil, bloklar hâlinde değişir; tek tür 5'ten uzun sürmez (ikiden fazla blok varsa).
  const cat = (item) => item.group === 'review' ? 'review' : item.group === 'concept' ? 'grammar' : item.audioOnly ? 'audio' : item.direction;
  const blocks = [];
  mixed.forEach((item, i) => { if (i && cat(item) === cat(mixed[i - 1])) blocks[blocks.length - 1] += 1; else blocks.push(1); });
  assert.ok(blocks.length < mixed.length / 2, `karışık bölümde ${blocks.length} blok / ${mixed.length} görev`);
  assert.ok(blocks.every((size) => size <= 5), `blok boyları ${blocks}`);
  t.api.kaoLesson('exit');
});

check('yeni kullanıcı (tekrar yok): her tanıştan hemen sonra görev; yalnız hedef + ilk tanış yan yana olabilir', () => {
  const bad = [];
  for (const lesson of lessons) {
    freshUser(t); resetUi(t);
    const steps = walk(t, lesson.id);
    for (const run of passiveRuns(steps)) {
      if (run.length > 2 || (run.length === 2 && !(run[0] === 'goal' && run[1] === 'intro'))) bad.push(`${lesson.id}: ${run.join('+')}`);
    }
    steps.forEach((s, at) => { if (s.step === 'intro' && (steps[at + 1] || {}).cardId !== `w:${s.lemmaId}:ar>tr`) bad.push(`${lesson.id}: ${s.lemmaId} sınanmadı`); });
  }
  assert.deepEqual(bad.slice(0, 8), [], `${bad.length} ihlal`);
});

check('devam noktası: yarıda bırak → sayfa yeniden yüklenmiş gibi ui sıfırla → Bugün birincil → aynı görevden sürer; çözülen görev yeniden sorulmaz', () => {
  for (const stopAt of [3, 7, 9]) {
    seed(t); resetUi(t); t.ui.kaoOpen = false; t.api.kaoOpen('home');
    const started = tapPrimary(t);
    assert.ok(started && started.ok, 'Bugün birincil dersi başlatmadı');
    const lessonId = t.ui.kaoLesson.lessonId;
    const answered = play(t, lessonId, { stopAfterTasks: stopAt }).filter((s) => s.step === 'task').map((s) => s.itemId);
    const pending = curItem(t).id;
    assert.equal(t.api.kaoLesson('exit'), true);
    resetUi(t); t.ui.kaoOpen = false; t.api.kaoOpen('home');
    const again = tapPrimary(t);
    assert.ok(again && again.ok && t.ui.kaoLesson && t.ui.kaoLesson.lessonId === lessonId, `${stopAt}: aynı ders açılmadı`);
    assert.ok(isTask(t), `${stopAt}: görevle değil ${t.ui.kaoLesson.plan[t.ui.kaoLesson.at].kind} ile açıldı`);
    assert.equal(curItem(t).id, pending, `${stopAt}: yarıda kalan görevden sürmedi`);
    const reasked = play(t, lessonId).filter((s) => s.step === 'task' && answered.includes(s.itemId)).map((s) => s.itemId);
    assert.deepEqual(reasked, [], `${stopAt}: çözülen görev yeniden soruldu`);
  }
});

console.log(`\nK3P-A3 rhythm: ${passed}/5 PASS`);
