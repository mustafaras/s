'use strict';
// K3P-10 · `kaoFx` hareket birim testi (TASARIM §5.4, D-5/D-6) — gerçek motor, sentetik VM; ağ/tarayıcı/depo yok.
//
// 1) Yanlışta (`kaoFx('wrong', şık)`): seçilen şık sınıfı sarsılır; yalnız SeyHaptics.error çalışır; SES ÇALMAZ (D-6).
// 2) Sarsıntı doğru ŞIKKA uygulanır (düğüm seçicisi o şıkkı hedefler).
// 3) Hareket azaltma: SeyFx.shouldAnimate() === false iken ne animasyon sınıfı ne de error titreşimi çalışır.
// 4) Doğru yolda sarsıntı sınıfı eklenmez (yalnız yanlışa özgü).
const assert = require('node:assert/strict');
const { bootKao, freshUser } = require('./helpers/kao-harness');

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

// Sahte DOM: gerçek motorun paintTask + kaoChoiceNode yolunu sürer (sınıf kaydı + seçici kaydı).
function fakeDom() {
  const selectors = [];
  const make = (log) => ({ _s: new Set(), add(c) { log.add(c); }, remove(c) { log.delete(c); }, contains(c) { return log.has(c); } });
  const choiceClasses = new Set();
  const choiceNode = { classList: make(choiceClasses), addEventListener() {}, removeEventListener() {}, offsetWidth: 0 };
  const taskClasses = new Set();
  const taskNode = { classList: make(taskClasses), innerHTML: '', setAttribute() {}, removeAttribute() {}, offsetWidth: 0, addEventListener() {}, removeEventListener() {}, querySelector(sel) { selectors.push(sel); return /\.kao-choices button/.test(sel) ? choiceNode : null; } };
  return { taskNode, choiceNode, choiceClasses, taskClasses, selectors };
}

// FX modüllerini sahteleyen sayaçlı ortam.
function fxEnv(t, { animate }) {
  const calls = [];
  t.win.SeyHaptics = { tap() { calls.push('haptic.tap'); }, error() { calls.push('haptic.error'); }, success() { calls.push('haptic.success'); } };
  t.win.SeyAudio = { tap() { calls.push('audio.tap'); }, error() { calls.push('audio.error'); }, success() { calls.push('audio.success'); } };
  t.win.SeyFx = { shouldAnimate() { return animate; }, enter() { calls.push('fx.enter'); } };
  t.win.SeymaHelpers = { confetti() { calls.push('confetti'); } };
  return calls;
}

function answerWrong(t, dom) {
  const lemma = t.win.QuranLexiconV1.lemmas[0];
  const item = { id: 'motion-1', cardId: `w:${lemma.id}:ar>tr`, isNew: true };
  t.ui.kaoQueue = [item]; t.ui.kaoTasks = {}; t.ui.kaoTaskIndex = 0; t.ui.kaoTaskStartedAt = Date.now(); t.ui.kaoUndo = null;
  t.ui.kaoOrderDraft = []; t.ui.kaoPaintedId = undefined;
  const task = t.api.kaoBuildTask(item, t.data, { seed: 'motion-1' });
  t.ui.kaoTasks[task.id] = task;
  const wrong = task.choices.find((c) => !c.correct);
  assert.ok(wrong, 'yanlış şık var');
  return { task, wrong, result: t.api.kaoAnswer(task.id, wrong.choiceId) };
}

// 1+2 · Animasyon açıkken: şık sarsılır, yalnız error titreşimi, ses yok.
{
  const dom = fakeDom();
  const t = bootKao({ surface: { taskElement: () => dom.taskNode } });
  freshUser(t);
  const calls = fxEnv(t, { animate: true });
  const { wrong, result } = answerWrong(t, dom);
  check('yanlış cevap işlendi', () => assert.equal(result.correct, false));
  check('seçilen şık bir kez sarsılır (kao-shake)', () => assert.ok(dom.choiceClasses.has('kao-shake'), 'kao-shake sınıfı şıkta'));
  check('sarsıntı doğru ŞIKKA uygulanır', () => assert.ok(dom.selectors.some((s) => s.includes('kao-choices button') && s.includes(wrong.choiceId)), 'seçici o şıkkı hedefler'));
  check('yalnız error titreşimi çalışır', () => assert.deepEqual(calls.filter((c) => c.startsWith('haptic')), ['haptic.error']));
  check('yanlışta SES çalmaz (D-6)', () => assert.deepEqual(calls.filter((c) => c.startsWith('audio')), []));
  check('yanlışta doğru-geri bildirim titreşimi yok', () => assert.ok(!calls.includes('haptic.tap') && !calls.includes('haptic.success')));
}

// 3 · Hareket azaltma: ne sarsıntı ne görev-geçiş animasyonu (titreşim kendi kapısıyla çağrılır, mediaFx içinde susar).
{
  const dom = fakeDom();
  const t = bootKao({ surface: { taskElement: () => dom.taskNode } });
  freshUser(t);
  fxEnv(t, { animate: false });
  const { result } = answerWrong(t, dom);
  check('hareket azaltmada yanlış yine işlendi', () => assert.equal(result.correct, false));
  check('hareket azaltmada sarsıntı sınıfı yok', () => assert.ok(!dom.choiceClasses.has('kao-shake')));
  check('hareket azaltmada görev-geçiş animasyonu yok', () => assert.ok(!dom.taskClasses.has('kao-task-in')));
}

// 3b · matchMedia geri düşüşü: SeyFx yoksa prefers-reduced-motion kapıdır.
{
  const dom = fakeDom();
  const t = bootKao({ surface: { taskElement: () => dom.taskNode } });
  freshUser(t);
  delete t.win.SeyFx;
  t.win.matchMedia = (q) => ({ matches: /prefers-reduced-motion/.test(q) === true, media: q });
  const { result } = answerWrong(t, dom);
  check('SeyFx yokken reduce eşleşmesi sarsıntıyı kapatır', () => assert.equal(result.correct, false) && !dom.choiceClasses.has('kao-shake'));
}

// 4 · Doğru yolda sarsıntı sınıfı eklenmez (davranış ayrışır).
{
  const dom = fakeDom();
  const t = bootKao({ surface: { taskElement: () => dom.taskNode } });
  freshUser(t);
  const calls = fxEnv(t, { animate: true });
  const lemma = t.win.QuranLexiconV1.lemmas[1];
  const item = { id: 'motion-2', cardId: `w:${lemma.id}:ar>tr`, isNew: true };
  t.ui.kaoQueue = [item]; t.ui.kaoTasks = {}; t.ui.kaoTaskIndex = 0; t.ui.kaoTaskStartedAt = Date.now(); t.ui.kaoUndo = null; t.ui.kaoPaintedId = undefined;
  const task = t.api.kaoBuildTask(item, t.data, { seed: 'motion-2' }); t.ui.kaoTasks[task.id] = task;
  const right = task.choices.find((c) => c.correct);
  assert.equal(t.api.kaoAnswer(task.id, right.choiceId).correct, true);
  check('doğruda sarsıntı sınıfı eklenmez', () => assert.ok(!dom.choiceClasses.has('kao-shake')));
  check('doğruda dokunma titreşimi + sesi çalışır', () => assert.ok(calls.includes('haptic.tap') && calls.includes('audio.tap')));
}

console.log(`test_k3p_motion_fx: ${passed} kontrol PASS`);
