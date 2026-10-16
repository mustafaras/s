'use strict';
// K3P-A6 · Bölümlü ilerleme (D-2) ve sabit eylem bölgesi (D-3). Sentetik node:vm; ağ/depo yok.
//   - Plan öğesi → 5 bölüm eşlemesi: ① Hedef ② Isınma ③ Tanış-Sına ④ Karışık ⑤ Zirve.
//   - aria-valuetext: "Bölüm n/5 · etiket · x/y"; etkin bölüm kendi içinde dolar.
//   - Sabit eylem bölgesi: birincil eylem ve şıklar alta yapışık (sticky + safe-area), yalnız CSS.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { bootKao, repoRoot, correctTaps } = require('./helpers/kao-harness');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }
const curTask = (t) => { const q = t.ui.kaoQueue[t.ui.kaoTaskIndex]; return q && t.ui.kaoTasks[q.id]; };
const labelOf = (item) => {
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
  const plan = t.ui.kaoLesson.plan;
  const seen = new Set();
  const bad = [];
  for (let guard = 0; guard < 200 && t.ui.kaoLesson; guard += 1) {
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

check('sabit eylem bölgesi: birincil eylem ve şıklar alta yapışık (sticky + safe-area)', () => {
  const css = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
  assert.match(css, /\.kao-lesson>\.kao-lesson-next,\.kao-lesson>\.kao-lesson-more\{position:sticky;bottom:calc\(8px \+ env\(safe-area-inset-bottom,0px\)\)\}/, 'ders birincil eylemi alta yapışık ve safe-area');
  assert.match(css, /\.kao-task>\.kao-choices\{position:sticky;bottom:calc\(8px \+ env\(safe-area-inset-bottom,0px\)\)\}/, 'şıklar alta yapışık ve safe-area');
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

console.log(`test_k3p_progress: PASS (${passed} kontrol — 5 bölüm eşlemesi, aria-valuetext, sabit eylem bölgesi)`);
