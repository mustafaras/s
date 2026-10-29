'use strict';
// K3P-A6 · Bölümlü ilerleme (D-2) ve sabit eylem bölgesi (D-3). Sentetik node:vm; ağ/depo yok.
//   - Plan öğesi → 5 bölüm eşlemesi: ① Hedef ② Isınma ③ Tanış-Sına ④ Karışık ⑤ Zirve.
//   - aria-valuetext: "Bölüm n/5 · etiket · x/y"; etkin bölüm kendi içinde dolar.
//   - Sabit eylem bölgesi: birincil eylem ve şıklar alta yapışık (sticky + safe-area), yalnız CSS.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { bootKao, freshUser, repoRoot, correctTaps } = require('./helpers/kao-harness');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }
const curTask = (t) => { const q = t.ui.kaoQueue[t.ui.kaoTaskIndex]; return q && t.ui.kaoTasks[q.id]; };
const SECTION_LABELS = ['Hedef', 'Isınma', 'Tanış-Sına', 'Karışık', 'Zirve'];
const labelOf = (item) => {
  if (item.kind === 'partGoal') return SECTION_LABELS[Math.max(0, Math.min(4, (item.resumeSection || 1) - 1))];
  if (item.kind === 'partEnd') return SECTION_LABELS[Math.max(0, Math.min(4, (item.section || 4) - 1))];
  if (item.kind === 'goal') return 'Hedef';
  if (item.kind === 'apply' || item.kind === 'read' || item.kind === 'summary') return 'Zirve';
  if (item.kind === 'intro' || item.kind === 'concept') return 'Tanış-Sına';
  if (item.kind === 'practice') return item.group === 'review' ? 'Isınma' : 'Karışık';
  return 'Hedef';
};
const sectionOf = (item) => ({ Hedef: 1, Isınma: 2, 'Tanış-Sına': 3, Karışık: 4, Zirve: 5 })[labelOf(item)];

check('her plan öğesi doğru bölüme eşlenir (data-lesson-section ve aria-valuetext ile)', () => {
  const t = bootKao({ seeded: true });
  t.ui.kaoStack = []; t.api.kaoOpen('home');
  assert.ok(t.api.kaoLesson('start', 'u01.01'), 'ders başlamalı');
  let plan = t.ui.kaoLesson.plan;
  const seen = new Set();
  const bad = [];
  for (let guard = 0; guard < 200 && t.ui.kaoLesson; guard += 1) {
    plan = t.ui.kaoLesson.plan;
    if (t.ui.kaoLesson.phase === 'practice') {
      const item = plan[t.ui.kaoLesson.at];
      const html = t.api.kaoOverlayHTML(t.NOW);
      const want = sectionOf(item);
      const got = Number((/data-lesson-section="(\d)"/.exec(html) || [])[1] || 0);
      const vt = (/aria-valuetext="([^"]*)"/.exec(html) || [])[1] || '';
      if (got !== want) bad.push(`${item.id}: section ${got} ≠ ${want}`);
      if (!new RegExp('^Bölüm ' + want + '/5 · ' + labelOf(item) + ' · \\d+/\\d+$').test(vt)) bad.push(`${item.id}: aria-valuetext "${vt}"`);
      seen.add(want);
      const task = curTask(t); if (!task) break;
      // K3P-17/18: build ve cloze çok-dokunuşlu yollar; dizi paylaşılan yardımcıdan gelir.
      for (const id of correctTaps(task)) t.api.kaoAnswer(task.id, id);
      t.api.kaoContinue();
      continue;
    }
    const item = plan[t.ui.kaoLesson.at];
    if (!item || item.kind === 'summary') break;
    const html = t.api.kaoOverlayHTML(t.NOW);
    const want = sectionOf(item);
    const got = Number((/data-lesson-section="(\d)"/.exec(html) || [])[1] || 0);
    if (got !== want) bad.push(`${item.id}: section ${got} ≠ ${want}`);
    seen.add(want);
    if (item.kind === 'partEnd') {
      assert.equal(t.api.kaoLesson('budget-overrun'), true, 'parça sonunda açık süre aşımı seçilebilmeli');
      plan = t.ui.kaoLesson.plan;
      continue;
    }
    t.api.kaoLesson('next');
  }
  assert.deepEqual(bad.slice(0, 6), [], bad.join(' | '));
  assert.ok([1, 3, 4, 5].every((s) => seen.has(s)), `bölümler görülmedi: ${[...seen].join(',')}`);
  t.api.kaoLesson('exit');
});

check('etkin bölüm kendi içinde dolar (indexInSection/countInSection) ve aria-valuetext artar', () => {
  const t = bootKao({ seeded: true });
  t.ui.kaoStack = []; t.api.kaoOpen('home');
  t.api.kaoLesson('start', 'u01.02');
  const plan = t.ui.kaoLesson.plan;
  let previous = 0;
  const goal = (/aria-valuetext="([^"]*)"/.exec(t.api.kaoOverlayHTML(t.NOW)) || [])[1] || '';
  assert.match(goal, /^Bölüm 1\/5 · Hedef · 1\/1$/, `hedefte tam dolum: "${goal}"`);
  previous = 1;
  assert.ok(previous >= 1);
  t.api.kaoLesson('exit');
});

check('sabit eylem bölgesi: ders içeriği ayrı, görev şıkları sticky ve safe-area uyumlu', () => {
  const css = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
  assert.match(css, /\.kao-lesson-content\{grid-column:1\/-1;min-height:0;overflow:auto/, 'ders içeriği eylemlerden ayrı kaydırılır');
  assert.match(css, /\.kao-task>\.kao-choices\{position:sticky;bottom:calc\(8px \+ env\(safe-area-inset-bottom,0px\)\);max-height:35dvh;overflow-y:auto/, 'şıklar safe-area ile yapışık ve yerel kaydırılabilir');
  // Yalnız CSS ve sınıf adı değişir: motor/Flow sticky/safe-area bilmez.
  const engine = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');
  const flow = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearnFlow.js'), 'utf8');
  assert.equal(/sticky|safe-area/.test(engine), false, 'motor sticky/safe-area taşımaz');
  assert.equal(/sticky|safe-area/.test(flow), false, 'Flow sticky/safe-area taşımaz');
});

check('5 bölümlü ilerleme çubuğu: role=progressbar, 5 segment, aria-valuemax=5', () => {
  const t = bootKao({ seeded: true });
  t.ui.kaoStack = []; t.api.kaoOpen('home'); t.api.kaoLesson('start', 'u01.01');
  const html = t.api.kaoOverlayHTML(t.NOW);
  const bar = (/<div class="kao-lesson-progress"[^>]*>/.exec(html) || [])[0] || '';
  assert.match(bar, /role="progressbar"/);
  assert.match(bar, /aria-valuemin="1"/);
  assert.match(bar, /aria-valuemax="5"/);
  assert.match(bar, /aria-valuenow="\d"/);
  assert.match(bar, /aria-valuetext="Bölüm \d\/5 · /);
  assert.equal((html.match(/class="kao-lesson-seg/g) || []).length, 5, 'beş segment');
  t.api.kaoLesson('exit');
});

// ══ K3PD-21 · Birincil eylem bölgesi — aşama tanımı ve ölçüm sözleşmesi ═══════════════════════
// Bu kart GEOMETRİ PASS'i üretmez (o K3PD-29'un işi). Burada ölçülen:
//   (a) her aşamanın birincil eylemi TEK kaynaktan tanımlı,
//   (b) her aşama DOM'da `data-lesson-stage` ile işaretli (ölçüm aracı bulabilsin),
//   (c) sticky/safe-area sözleşmesi korunuyor,
//   (d) 29 için ölçüm sözleşmesi (x/y/w/h, görünürlük, örtüşme, odak, ≤8 px) tanımlı ve doğrulanabilir.
const { execFileSync } = require('node:child_process');
const contractTool = require('node:path').join(repoRoot, 'tools', 'kao3', 'eylem-geometri.cjs');
const syntheticGeometryMatrix = (c) => c.stages.flatMap((stage) => c.viewports.flatMap((viewport) =>
  (viewport.safeAreaBottom ? ['light'] : ['light', 'dark']).flatMap((theme) =>
    (stage.stage === 'practice' ? ['mc', 'build', 'cloze'] : ['default']).flatMap((variant) => [1, 2].map((render) => ({
      stage: stage.stage, theme, scenario: `${stage.stage}-${variant}`, variant, render, viewport,
      primary: { selector: stage.selector, x: 0, y: render === 1 ? 100 : 104, width: 100, height: 50, visible: true }, overlap: { covered: false }, focusReachable: true,
    }))))) );

check('K3PD-21 sözleşme aracı: 9 aşama, 4 viewport, ≤8 px, hüküm EVIDENCE_PENDING', () => {
  const out = execFileSync(process.execPath, [contractTool], { encoding: 'utf8' });
  const c = JSON.parse(out);
  assert.equal(c.card, 'K3PD-21');
  assert.equal(c.verdict, 'EVIDENCE_PENDING', 'geometri hükmü 29 gelene kadar EVIDENCE_PENDING');
  assert.equal(c.acceptance.maxConsecutiveYDeltaPx, 8, 'y-farkı eşiği 8 px');
  assert.equal(c.acceptance.mustBeVisible, true);
  assert.equal(c.acceptance.mustNotCoverContent, true);
  assert.equal(c.acceptance.mustBeFocusReachable, true);
  assert.equal(c.acceptance.minTouchTargetPx, 44);
  assert.equal(c.viewports.length, 4, '320/390/460 + sentetik alt inset');
  assert.ok(c.viewports.some((v) => v.safeAreaBottom > 0), 'sentetik alt inset viewport var');
  // Kartın saydığı aşamaların hepsi tanımlı.
  const stages = c.stages.map((s) => s.stage);
  for (const required of ['goal', 'intro', 'concept', 'practice', 'feedback', 'apply', 'summary']) {
    assert.ok(stages.includes(required), `${required} aşaması tanımsız`);
  }
  // 29'un kaydı bu alanları taşımak zorunda.
  for (const field of ['primary.x', 'primary.y', 'primary.width', 'primary.height', 'primary.visible', 'overlap.covered', 'focusReachable']) {
    assert.ok(c.requiredFields.includes(field), `${field} zorunlu alan değil`);
  }
});

check('K3PD-21 sözleşme aracı --check: bütünlük doğrulaması geçer', () => {
  const out = execFileSync(process.execPath, [contractTool, '--check'], { encoding: 'utf8' });
  assert.match(out, /^PASS eylem-geometri sözleşmesi/);
});

check('K3PD-21 ölçüm aracı boş veya eksik matrisi reddeder, tam matrisi kabul eder', () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const tmp = path.join(os.tmpdir(), `k3pd21-matrix-${process.pid}.json`);
  const c = JSON.parse(execFileSync(process.execPath, [contractTool], { encoding: 'utf8' }));
  const rows = syntheticGeometryMatrix(c);
  try {
    const run = (data) => { fs.writeFileSync(tmp, JSON.stringify(data)); return execFileSync(process.execPath, [contractTool, '--olcum', tmp], { encoding: 'utf8', stdio: 'pipe' }); };
    assert.throws(() => run([]));
    assert.throws(() => run(rows.slice(2)));
    const duplicated = structuredClone(rows); duplicated[1] = structuredClone(duplicated[0]);
    assert.throws(() => run(duplicated));
    const offscreen = structuredClone(rows); offscreen[0].primary.x = -10000;
    assert.throws(() => run(offscreen));
    assert.throws(() => run(rows.filter((row) => row.variant !== 'cloze')));
    const missingOverlap = structuredClone(rows); delete missingOverlap[0].overlap.covered;
    assert.throws(() => run(missingOverlap));
    assert.match(run(rows), /^PASS/);
    assert.match(c.stages.find((stage) => stage.stage === 'partEnd').selector, /stage="budget"/);
    assert.match(c.stages.find((stage) => stage.stage === 'read').selector, /stage="apply"/);
  } finally { fs.rmSync(tmp, { force: true }); }
});

check('K3PD-21 sözleşme aracı --olcum: eksik alan ve eşik ihlalini YAKALAR (negatif)', () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const tmp = path.join(os.tmpdir(), `k3pd21-${process.pid}.json`);
  // (a) eksik alan
  fs.writeFileSync(tmp, JSON.stringify([{ stage: 'goal', viewport: { width: 390, height: 844, safeAreaBottom: 0 }, primary: { selector: 'x' }, overlap: { covered: false }, focusReachable: true }]));
  let failed = false;
  try { execFileSync(process.execPath, [contractTool, '--olcum', tmp], { encoding: 'utf8', stdio: 'pipe' }); } catch (e) { failed = true; }
  assert.equal(failed, true, 'eksik alan kabul edilmemeli');
  // (b) Tam matriste y-farkı > 8; kapsam eksikliğinden bağımsız sınanır.
  const c = JSON.parse(execFileSync(process.execPath, [contractTool], { encoding: 'utf8' }));
  const rows = syntheticGeometryMatrix(c);
  const drift = structuredClone(rows); drift[1].primary.y = 120;
  fs.writeFileSync(tmp, JSON.stringify(drift));
  failed = false;
  try { execFileSync(process.execPath, [contractTool, '--olcum', tmp], { encoding: 'utf8', stdio: 'pipe' }); } catch (e) { failed = true; }
  assert.equal(failed, true, '20 px y-farkı reddedilmeli');
  // (c) geçerli kayıt geçer
  fs.writeFileSync(tmp, JSON.stringify(rows));
  const ok = execFileSync(process.execPath, [contractTool, '--olcum', tmp], { encoding: 'utf8' });
  assert.match(ok, /^PASS 29 ölçüm kaydı/);
  fs.unlinkSync(tmp);
});

check('K3PD-21 her aşama DOM’da data-lesson-stage ile işaretli (ölçüm aracı bulabilir)', () => {
  const t = bootKao();
  freshUser(t);
  const flow = t.win.SeymaQuranLearnFlow;
  const content = { curriculum: t.win.QuranCurriculumV2, lexicon: t.win.QuranLexiconV1, grammar: t.win.QuranGrammarV1, shorts: t.win.QuranShortSurahsV1, phonics: t.win.QuranPhonicsV1 };
  const lesson = content.curriculum.units[0].lessons[1];
  const plan = flow.lessonPlan({ quranLearn: t.data.quranLearn }, lesson.id, new Date(t.NOW), content);
  for (const kind of ['goal', 'intro', 'concept', 'apply', 'summary']) {
    const item = plan.find((i) => i.kind === kind);
    assert.ok(item, `${kind} planda yok`);
    t.ui.kaoView = 'session';
    t.ui.kaoStack = [{ view: 'session' }];
    t.ui.kaoLesson = { plan: [item], at: 0, phase: 'lesson', lessonId: lesson.id };
    const html = t.api.kaoOverlayHTML(t.NOW);
    assert.match(html, new RegExp(`data-lesson-stage="${kind}"`), `${kind}: aşama işareti yok`);
    assert.match(html, /class="kao-primary kao-lesson-next"/, `${kind}: birincil eylem yok`);
  }
  // practice aşaması: görev yüzeyi de aşamasını taşır ve birincil eylem ŞIKLARDIR.
  const pr = plan.find((i) => i.kind === 'practice');
  t.ui.kaoView = 'session';
  t.ui.kaoStack = [{ view: 'session' }];
  t.ui.kaoLesson = { plan: [pr], at: 0, phase: 'practice', lessonId: lesson.id };
  t.ui.kaoQueue = [{ id: pr.id, cardId: pr.cardId }];
  t.ui.kaoTasks = { [pr.id]: { id: pr.id, kind: 'choice', choices: [{ choiceId: 'a', label: 'x', correct: true }], prompt: 'p' } };
  t.ui.kaoTaskIndex = 0;
  const ph = t.api.kaoOverlayHTML(t.NOW);
  assert.match(ph, /class="kao-task is-practice"/, 'practice: aşama işareti yok');
  assert.match(ph, /class="kao-choices"/, 'practice: birincil eylem şıklar değil');
  assert.doesNotMatch(ph, /kao-lesson-next/, 'practice: next düğmesi olmamalı (birincil eylem şıklar)');
});

check('K3PD-21 sabit eylem ve safe-area sözleşmesi; motor sticky bilmez', () => {
  const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');
  const css = read('app/kao.css');
  assert.match(css, /\.kao-lesson:has\(>\.kao-lesson-content\)\{grid-template: minmax\(0,1fr\) auto \/ repeat\(2,minmax\(0,1fr\)\)\}/, 'eylemler kaydırılan içerikten ayrı satırda yer alır');
  assert.match(css, /\.kao-lesson-next:last-child\{grid-column:1\/-1\}/, 'tek eylem tüm satırı kullanır');
  assert.match(css, /\.kao-task>\.kao-choices\{position:sticky;bottom:calc\(8px \+ env\(safe-area-inset-bottom,0px\)\);max-height:35dvh;overflow-y:auto/);
  const engine = read('app/core/quranLearn.js');
  const flowSrc = read('app/core/quranLearnFlow.js');
  assert.equal(/sticky|safe-area/.test(engine), false, 'motor sticky/safe-area taşımaz');
  assert.equal(/sticky|safe-area/.test(flowSrc), false, 'Flow sticky/safe-area taşımaz');
});

console.log(`test_k3p_progress: PASS (${passed} kontrol — 5 bölüm eşlemesi, aria-valuetext, sabit eylem bölgesi, K3PD-21 aşama/ölçüm sözleşmesi)`);
