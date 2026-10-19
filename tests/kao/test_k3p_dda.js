'use strict';
// K3P-A5 · Uyarlanır zorluk: akış bandını korumak (A-3, K-K; AKIS §4). Sentetik node:vm; ağ/depo/yazma yok.
//   - Art arda 2 yanlış → sıradaki görev 3 şıklı ve ses otomatik.
//   - Art arda 3 yanlış → yeniden tanış paneli (anlam, örnek/ses) — mevcut panel yolu, yeni ekran değil.
//   - p < %70 → araya bilinen kolay kart (yalnız kuyruk, ui).
//   - p > %92 (≥8 görev sonra) → şık 4'e döner ve okunuş gizlenir (yalnız sunum).
//   - Kolaylaştırılmış doğru → kaoGrade 2; normal doğru notu değişmez.
//   - Kayan pencere yalnız ui; data'ya hiçbir şey yazılmaz.
const assert = require('node:assert/strict');
const { bootKao, correctTaps } = require('./helpers/kao-harness');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

const api = (t) => t.api;
const curTask = (t) => { const q = t.ui.kaoQueue[t.ui.kaoTaskIndex]; return q && t.ui.kaoTasks[q.id]; };
function startLesson(t, lessonId = 'u01.01') {
  t.data.quranLearn.settings.audio = true; // "ses otomatik çalar" kolunu sınamak için ses açık
  t.ui.kaoStack = []; t.api.kaoOpen('home');
  assert.ok(t.api.kaoLesson('start', lessonId), 'ders başlamalı');
  return t.ui.kaoLesson;
}
function nextTask(t) { if (t.ui.kaoLesson && t.ui.kaoLesson.phase === 'lesson') t.api.kaoLesson('next'); return curTask(t); }
// Ders adımlarını (goal/kavram) geçip ilk uygulama görevine iner.
function toTask(t) { for (let g = 0; g < 60; g += 1) { const task = curTask(t); if (task) return task; const state=t.ui.kaoLesson,current=state&&state.plan[state.at]; if(current&&current.kind==='partEnd'){ if(!t.api.kaoLesson('budget-overrun')) return null; continue; } if (!state || state.phase === 'lesson') { if (!t.api.kaoLesson('next')) return null; } else return null; } return null; }
function answerAndNext(t, correct) {
  const task = toTask(t); assert.ok(task, 'görev bulunmalı');
  // K3P-17/18: build ve cloze çok-dokunuşlu yollar. Doğru dizi paylaşılan yardımcıdan gelir.
  // 'wrong' kolunda çok-dokunuşlu görev TAM ve YANLIŞ doldurulmalı; tek dokunuş 'pending' bırakır ve
  // yanlış sayılmaz (dda bu yüzden yanlış diziyi görev tipine göre kurar).
  const ids = correctTaps(task);
  if (correct) { for (const id of ids) t.api.kaoAnswer(task.id, id); return task; }
  if (task.kind === 'order') {
    for (const id of task.choices.slice().sort((a, b) => b.ordinal - a.ordinal).map((c) => c.choiceId)) t.api.kaoAnswer(task.id, id);
  } else if (task.kind === 'build') {
    const bad = task.choices.filter((c) => c.correct !== true).map((c) => c.choiceId);
    const need = String(task.answer || '').replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/g, '').length;
    for (let k = 0; k < need; k += 1) t.api.kaoAnswer(task.id, bad[k % bad.length]);
  } else {
    t.api.kaoAnswer(task.id, wrongPick(task));
  }
  return task;
}
function wrongPick(task) { return (task.choices.find((c) => !c.correct) || task.choices[0]).choiceId; }
function rightPick(task) { return (task.choices.find((c) => c.correct) || task.choices[0]).choiceId; }

check('art arda 2 yanlış → sıradaki görev 3 şıklı ve sesi otomatik çalar', () => {
  const t = bootKao({ seeded: true }); startLesson(t);
  // İlk iki görevi yanlış cevapla.
  for (let i = 0; i < 2; i += 1) { answerAndNext(t, false); t.api.kaoContinue(); }
  assert.ok(t.ui.kaoWrongStreak >= 2, `art arda yanlış sayacı ${t.ui.kaoWrongStreak}`);

  const capped = toTask(t);
  assert.ok(capped, 'sıradaki görev var');
  assert.ok(!capped.choices || capped.choices.length <= 3, `kaygı kolunda şık ≤3 (ölçülen ${capped.choices && capped.choices.length})`);
  assert.ok(t.ui.kaoWrongStreak >= 2);
  const probe = Object.assign({}, capped, { clipId: 'w-l_probe_abcdef', isNew: false });
  assert.equal(api(t).kaoShouldAutoplay(probe, t.data), true, 'kaygı kolunda ses otomatik çalar');
  t.api.kaoLesson('exit');
});

check('art arda 3 yanlış → yeniden tanış paneli (anlam + örnek/ses), mevcut panel yolu', () => {
  const t = bootKao({ seeded: true }); startLesson(t);
  let task = null;
  for (let i = 0; i < 3; i += 1) { task = answerAndNext(t, false); if (i < 2) t.api.kaoContinue(); }
  assert.ok(t.ui.kaoWrongStreak >= 3, 'üç yanlış');
  assert.ok(t.ui.kaoPanel && t.ui.kaoPanel.reintro, 'yeniden tanış verisi panele yazılmalı');
  const ri = t.ui.kaoPanel.reintro;
  assert.ok(ri.ar && ri.meaning, 'yeniden tanış: anlam ve örnek');
  assert.ok(ri.clipId, 'yeniden tanış: ses');
  const html = t.api.kaoTaskHTML(task);
  assert.match(html, /kao-reintro-panel/, 'yeniden tanış paneli çizilir');
  assert.match(html, /kao-feedback-sheet/, 'yeni ekran değil, mevcut geri bildirim paneli');
  t.api.kaoLesson('exit');
});

check('p < %70 → araya bilinen kolay kart girer (yalnız kuyruk, ui)', () => {
  const t = bootKao({ seeded: true }); startLesson(t);
  // Kolay kart için kuyruğa uygun bilinen lemma: harness seed s=40 (≥21) kurar.
  let injected = false;
  for (let i = 0; i < 4 && !injected; i += 1) {
    answerAndNext(t, false);
    injected = t.ui.kaoQueue.some((it) => it.easy === true);
    t.api.kaoContinue();
  }
  assert.ok(injected, 'kaygı bandında kolay kart kuyruğa eklenmeli');
  assert.equal(JSON.stringify(t.data).includes('kao-easy'), false, 'kolay kart data\'ya yazılmaz (yalnız ui)');
  t.api.kaoLesson('exit');
});

check('p > %92 (≥8 görev sonra) → şık 4\'e döner ve okunuş gizlenir (sunum)', () => {
  const t = bootKao({ seeded: true }); startLesson(t);
  // 8 doğru → pencere %100 (sıkılma bandı). Ders sonuna kadar gerekirse ilerle.
  for (let i = 0; i < 8; i += 1) { answerAndNext(t, true); t.api.kaoContinue(); }
  assert.equal(t.ui.kaoWindow.length, 8, 'pencere 8 görev');
  const rate = t.ui.kaoWindow.reduce((a, b) => a + (b ? 1 : 0), 0) / t.ui.kaoWindow.length;
  assert.ok(rate > 0.92, `sıkılma bandı (ölçülen ${rate})`);
  // Sıkılma kolunda şık kapağı 4'tür: gerçek görev 4 şıkla gelir (kaygıdaki 3'e inmez).
  const bore = toTask(t);
  assert.ok(bore && bore.choices, 'görev kuruldu');
  assert.equal(bore.choices.length, 4, `sıkılma kolunda 4 şık (ölçülen ${bore.choices.length})`);
  // Okunuş gizlenir (sunum): sıkılma kolu motorda tanımlı ve Arapça çiftlerde kullanılır.
  const src = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', '..', 'app/core/quranLearn.js'), 'utf8');
  assert.match(src, /kaoBoredomHideHarakat\(\)/, 'sıkılma sunum kolu motorda tanımlı');
  // K3P-19: okunuş katlaması aynı yuvayı paylaştığı için çağrı artık `kaoBoredomHideHarakat(), pronunciationFolded`
  // biçiminde; katı argüman dizilimini sabitlemek yerine soldurma kolunun GERÇEKTEN bağlı olduğu ölçülür.
  assert.ok(/kaoArabicPairHTML\([^;]*kaoBoredomHideHarakat\(\)[^;]*\)/.test(src), 'sıkılmada harekeler soluyor sunumu bağlı');
  t.api.kaoLesson('exit');
});

check('kolaylaştırılmış doğru → kaoGrade 2; normal doğru notu değişmez', () => {
  const t = bootKao({ seeded: true });
  assert.equal(t.api.kaoGrade(true, 1000, 5), 4, 'normal doğru (hızlı, n≥3) → Easy (eski davranış)');
  assert.equal(t.api.kaoGrade(true, 3000, 1), 3, 'normal doğru (orta) → Good');
  assert.equal(t.api.kaoGrade(true, 8001, 1), 2, '>8 s → Hard');
  assert.equal(t.api.kaoGrade(true, 1000, 5, 2), 2, 'kolaylaştırılmış doğru (difficulty 2) → Hard');
  assert.equal(t.api.kaoGrade(true, 1000, 5, 3), 4, 'kolaylaştırılmamış hızlı doğru → Easy');
  assert.equal(t.api.kaoGrade(false, 1000, 5, 2), 1, 'yanlış daima Again');
});

check('kayan pencere ve uyarlanır durum yalnız ui; data\'ya yazılmaz', () => {
  const t = bootKao({ seeded: true });
  const baseline = JSON.stringify(t.data.quranLearn);
  startLesson(t);
  answerAndNext(t, true);
  t.api.kaoContinue();
  assert.ok(Array.isArray(t.ui.kaoWindow), 'pencere ui içinde');
  const q = JSON.stringify(t.data.quranLearn);
  for (const banned of ['kaoWindow', 'kaoWrongStreak', 'kao-easy', 'reintro', 'difficulty']) {
    assert.equal(q.includes(banned), false, `${banned} data'ya yazılmamalı`);
  }
  assert.ok(baseline.length > 0);
  t.api.kaoLesson('exit');
});

console.log(`test_k3p_dda: PASS (${passed} kontrol — kaygı/akış/sıkılma bantları, notlama adaleti, yalnız ui)`);
