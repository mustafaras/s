'use strict';
// K3P-19 · Okunuşun soldurulması (KARARLAR K-A son madde, P4/H4). Sentetik node:vm; ağ, tarayıcı, depo yok.
// Ölçülenler:
//   1) SINIR: s < 21 kartta okunuş bugünkü görünür satırdır; s ≥ 21 kartta katlanır. Sınır tam s = 21'dir.
//   2) KATLAMA: katlanmış okunuş yerel bir <details><summary>Okunuş</summary>…</details> içinde durur,
//      VARSAYILAN KAPALIDIR (open yok) ve açmak için HANDLER yoktur (tarayıcı <summary> kendi açar).
//   3) AYAR: settings.translit === false ise okunuş HTML'de HİÇ bulunmaz (katlı da olsa).
//   4) NOT: katlama notu etkilemez — aynı cevap, ayar açık/kapalı, aynı FSRS notunu üretir.
//   5) SÖZLEŞME: görünür okunuş satırı sayısı, katlanmış okunuş eklenince Arapça satır sayısına eşitlenir
//      (okunuş HTML'de durur, yalnız katlıdır — test_kao_pronunciation_contract bunu bekler).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { bootKao, repoRoot, correctTaps } = require('./helpers/kao-harness');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

const t = bootKao({ seeded: true });
const api = t.api;
const flow = t.win.SeymaQuranLearnFlow;
const q = t.data.quranLearn;
const FOLD = 'kao-pronunciation-fold';
const LINE = 'kao-pronunciation-line';

// Kademeli kelime kartı (A kolu) sınırı ölçmek için doğrudan kurulur; FSRS basamağı elle yazılır.
function cardAt(stability) {
  for (const id of Object.keys(q.cards)) {
    if (!/^w:/.test(id) || flow.ladderArm(id) !== 'A') continue;
    // Kart TAMamen taze yazılır: birikmiş `lastDistractors` gibi alanlar kolları farklılaştırır
    // (çeldirici havuzu değişince görev dizisi de değişir ve not karşılaştırması anlamsızlaşır).
    q.cards[id] = { state: 'review', s: stability, reps: 6, due: '2026-09-29T00:00:00.000Z' };
    return id;
  }
  return null;
}
const buildAt = (id, seed) => api.kaoBuildTask({ id: `k3p-19:${seed}`, cardId: id, isNew: false }, t.data, { seed });
const countFolds = (html) => (String(html).match(new RegExp(`class="${FOLD}"`, 'g')) || []).length;
const countLines = (html) => (String(html).match(new RegExp(`class="${LINE}"`, 'g')) || []).length;
const countArabic = (html) => (String(html).match(/class="kao-arabic-text"/g) || []).length;
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function prepareH4(stability, { seed, translit = true, orphan = false, readerUnknown = false, reviewAt = t.NOW } = {}) {
  const id = Object.keys(q.cards).find((key) => /^w:/.test(key) && flow.ladderArm(key) === 'B');
  assert.ok(id, 'H4 için B kolunda kelime kartı bulunmalı');
  q.cards[id] = { state: 'review', s: stability, d: 10, reps: 6, r: reviewAt, due: '2026-09-29T00:00:00.000Z', orphan, readerUnknown };
  q.settings.translit = translit;
  const taskId = `k3pd03:${seed}`;
  const task = api.kaoBuildTask({ id: taskId, cardId: id, isNew: false }, t.data, { seed: taskId });
  t.ui.kaoQueue = [{ id: task.id, cardId: id, isNew: false }];
  t.ui.kaoTasks = { [task.id]: task };
  t.ui.kaoTaskIndex = 0;
  t.ui.kaoTaskStartedAt = Date.now();
  t.ui.kaoUndo = null;
  t.ui.kaoPanel = { open: false };
  t.ui.kaoOrderDraft = [];
  t.ui.kaoFeedback = '';
  q.daily['2026-09-30'] = { answered: 0, correct: 0, new: 0, reviewed: 0 };
  return { id, task, html: api.kaoTaskHTML(task) };
}

function h4Counts() {
  const s21 = q.daily['2026-09-30'] && q.daily['2026-09-30'].calib && q.daily['2026-09-30'].calib.s21;
  return { n: s21 ? s21.n : 0, ok: s21 ? s21.ok : 0 };
}

check('H4 aynı deterministik ders görev ID’si yeni görev örneğinde yeni s koşulunu dondurur', () => {
  const id = Object.keys(q.cards).find((key) => /^w:/.test(key) && flow.ladderArm(key) === 'B');
  assert.ok(id, 'ders görevi için B kolunda kelime kartı bulunmalı');
  const lemmaId = id.slice(2, id.lastIndexOf(':'));
  const taskId = `practice:u01.01:${lemmaId}:ar>tr`;
  q.cards[id] = { state: 'review', s: 20, d: 10, reps: 6, r: t.NOW, due: '2026-09-29T00:00:00.000Z' };
  q.settings.translit = true;
  const first = api.kaoBuildTask({ id: taskId, cardId: id, isNew: false }, t.data, { seed: taskId });
  assert.equal(countFolds(api.kaoTaskHTML(first)), 0, 'ilk görev gösteriminde s=20 görünür');

  q.cards[id].s = 40;
  const resumed = api.kaoBuildTask({ id: taskId, cardId: id, isNew: false }, t.data, { seed: taskId });
  assert.equal(resumed.id, first.id, 'lesson restart aynı deterministik practice ID’yi üretti');
  t.ui.kaoQueue = [{ id: taskId, cardId: id, isNew: false }];
  t.ui.kaoTasks = { [taskId]: resumed };
  t.ui.kaoTaskIndex = 0;
  t.ui.kaoTaskStartedAt = Date.now();
  t.ui.kaoPanel = { open: false };
  t.ui.kaoOrderDraft = [];
  q.daily['2026-09-30'] = { answered: 0, correct: 0, new: 0, reviewed: 0 };
  assert.equal(countFolds(api.kaoTaskHTML(resumed)), 1, 'yeni görev örneği s=40 cevabı öncesi katlanır');
  assert.equal(t.ui.kaoH4Presentation[taskId].eligible, true, 'yeni örnek kendi görev başı koşulunu saklar');
});

check('H4 sınır matrisi: cevap öncesi s ve gerçek kapalı okunuş belirleyicidir', () => {
  const cases = [];
  for (const s of [20, 21, 40]) {
    for (const correct of [true, false]) {
      const reviewAt = s === 20 && correct ? '2026-09-23T12:00:00.000Z' : t.NOW;
      const { id, task, html } = prepareH4(s, { seed: `${s}-${correct ? 'correct' : 'wrong'}`, reviewAt });
      assert.equal(task.type, 'word');
      assert.notEqual(task.kind, 'build');
      assert.notEqual(task.kind, 'order');
      assert.ok(task.translit || task.choices.some((choice) => choice.pronunciation), 'görevde gerçek Latin okunuşu var');
      const wasFolded = s >= 21 && html.includes(`<details class="${FOLD}">`);
      assert.equal(wasFolded, s >= 21, `başlangıç s=${s}: gerçek okunuş sunumu`);
      const choiceId = correct ? correctTaps(task)[0] : task.choices.find((choice) => !choice.correct).choiceId;
      const answer = api.kaoAnswer(task.id, choiceId);
      assert.equal(answer.correct, correct);
      const scheduled = q.cards[id];
      if (s === 20 && correct) assert.ok(scheduled.s >= 21, 's=20 doğru cevabı sonrası zamanlanmış s sınırı aşar');
      if (s >= 21 && !correct) assert.ok(scheduled.s < 21, `s=${s} yanlış cevabı sonrası scheduled.s sınırın altına iner`);
      const counts = h4Counts();
      assert.deepEqual(counts, { n: wasFolded ? 1 : 0, ok: wasFolded && correct ? 1 : 0 }, `cevap öncesi s=${s}, correct=${correct}`);
      cases.push({ s, correct, scheduledS: scheduled.s, ...counts });
    }
  }
  assert.equal(cases.length, 6, '20/21/40 × doğru/yanlış matrisi tamamlandı');
});

check('H4 aynı görevde çift cevabı saymaz; undo n/ok anlık görüntüsünü geri yükler', () => {
  const { id, task } = prepareH4(21, { seed: 'undo-idempotence' });
  const wrong = task.choices.find((choice) => !choice.correct).choiceId;
  const first = api.kaoAnswer(task.id, wrong);
  assert.equal(first.correct, false);
  assert.ok(q.cards[id].s < 21, 'yanlış cevap scheduled.s değerini eşik altına indirdi');
  assert.deepEqual(h4Counts(), { n: 1, ok: 0 });
  assert.equal(api.kaoAnswer(task.id, wrong), false, 'aynı aktif görevin yinelenen cevap olayı reddedilir');
  assert.deepEqual(h4Counts(), { n: 1, ok: 0 });
  assert.equal(api.kaoUndo(), true, 'undo kabul edilir');
  assert.deepEqual(h4Counts(), { n: 0, ok: 0 }, 'önceki günlük sayaç geri yüklenir');
  const afterUndo = api.kaoAnswer(task.id, wrong);
  assert.equal(afterUndo.correct, false);
  assert.deepEqual(h4Counts(), { n: 1, ok: 0 }, 'aynı görevin yeniden cevabı en çok bir yeni gözlem yazar');
  assert.equal(api.kaoAnswer(task.id, wrong), false);
  assert.deepEqual(h4Counts(), { n: 1, ok: 0 });
});

check('H4 legacy destek koşulları korunur: okunuş kapalı, orphan ve readerUnknown dışarıda', () => {
  const cases = [
    { seed: 'disabled', translit: false },
    { seed: 'orphan', orphan: true },
    { seed: 'reader-unknown', readerUnknown: true }
  ];
  for (const options of cases) {
    const { task, html } = prepareH4(40, options);
    assert.equal(html.includes(`<details class="${FOLD}">`), false, `${options.seed}: kullanılabilir katlı destek yok`);
    const wrong = task.choices.find((choice) => !choice.correct).choiceId;
    const result = api.kaoAnswer(task.id, wrong);
    assert.equal(result.correct, false);
    assert.deepEqual(h4Counts(), { n: 0, ok: 0 }, `${options.seed}: sayaç dışında`);
  }
});

check('H4 details toggle yalnız güncel task ve disclosure düğümünü işaretler', () => {
  const makeDetails = (summaryText) => {
    const listeners = {};
    return {
      open: false,
      summaryText,
      listeners,
      addEventListener(type, listener) { (listeners[type] = listeners[type] || []).push(listener); },
      toggle(open) { this.open = open; for (const listener of listeners.toggle || []) listener.call(this, { target: this }); }
    };
  };
  const root = {
    details: [],
    html: '',
    render(html) {
      this.html = String(html || '');
      const count = (this.html.match(/<details class="kao-pronunciation-fold">/g) || []).length;
      this.details = Array.from({ length: count }, makeDetails);
    },
    insertAdjacentHTML(_where, html) { this.render(html); },
    set innerHTML(html) { this.render(html); },
    get innerHTML() { return this.html; },
    querySelectorAll(selector) { return selector === `.kao-pronunciation-fold` ? this.details : []; },
    querySelector() { return null; },
    setAttribute() {},
    removeAttribute() {},
    classList: { add() {}, remove() {} }
  };
  const dom = bootKao({ seeded: true, surface: { taskElement: () => root } });
  const domQ = dom.data.quranLearn, domFlow = dom.win.SeymaQuranLearnFlow;
  const id = Object.keys(domQ.cards).find((key) => /^w:/.test(key) && domFlow.ladderArm(key) === 'B');
  domQ.cards[id] = { state: 'review', s: 40, d: 10, reps: 6, r: dom.NOW, due: '2026-09-29T00:00:00.000Z' };
  const task = dom.api.kaoBuildTask({ id: 'k3pd03:native-details', cardId: id, isNew: false }, dom.data, { seed: 'k3pd03:native-details' });
  dom.ui.kaoQueue = [{ id: task.id, cardId: id, isNew: false }];
  dom.ui.kaoTasks = { [task.id]: task };
  dom.ui.kaoTaskIndex = 0;
  dom.ui.kaoTaskStartedAt = Date.now();
  dom.ui.kaoPanel = { open: false };
  dom.ui.kaoOrderDraft = [];
  dom.data.quranLearn.daily['2026-09-30'] = { answered: 0, correct: 0, new: 0, reviewed: 0 };
  dom.ui.kaoView = 'session';
  dom.ui.kaoOpen = true;
  const doc = { getElementById(key) { return key === 'app' ? root : null; } };
  dom.api.kaoPatchOverlay(doc, dom.api.kaoOverlayHTML(dom.NOW));
  assert.ok(root.details.length > 0, 'ilk çizimde katlı okunuş details düğümü var');
  assert.ok(root.details.every((detail) => detail.listeners.toggle && detail.listeners.toggle.length === 1), 'yerel toggle olayı izleniyor');
  const staleDetails = root.details[0];
  const sameIdTask = Object.assign({}, task);
  assert.notEqual(sameIdTask, task, 'aynı deterministik ID için yeni task nesnesi oluşturuldu');
  dom.ui.kaoTasks[task.id] = sameIdTask;
  dom.api.kaoPatchOverlay(doc, dom.api.kaoOverlayHTML(dom.NOW));
  const currentDetails = root.details[0];
  assert.equal(currentDetails.open, false, 'yeni görev disclosure düğümü kapalı başlar');
  assert.equal(dom.ui.kaoH4Presentation[task.id].taskRef, sameIdTask, 'sunum snapshot yeni görev nesnesine bağlandı');
  staleDetails.toggle(true);
  assert.equal(dom.ui.kaoH4Presentation[task.id].opened, false, 'eski ayrılmış düğümün gecikmiş olayı yeni görevi işaretlemez');
  assert.equal(currentDetails.open, false, 'eski düğümün olayı yeni disclosure düğümünü açmaz');
  const currentWrong = sameIdTask.choices.find((choice) => !choice.correct).choiceId;
  dom.api.kaoAnswer(sameIdTask.id, currentWrong);
  const freshS21 = dom.data.quranLearn.daily['2026-09-30'].calib.s21;
  assert.deepEqual({ n: freshS21.n, ok: freshS21.ok }, { n: 1, ok: 0 }, 'yeni görev kapalı destekle yanıtlanınca H4 cohortuna girer');
  assert.equal(dom.api.kaoUndo(), true, 'stale event regresyon vakası geri alınabilir');
  const afterStaleUndo = dom.data.quranLearn.daily['2026-09-30'].calib && dom.data.quranLearn.daily['2026-09-30'].calib.s21;
  assert.deepEqual(afterStaleUndo ? { n: afterStaleUndo.n, ok: afterStaleUndo.ok } : { n: 0, ok: 0 }, { n: 0, ok: 0 }, 'stale event testinden sonra günlük sayaç eski haline döner');
  dom.ui.kaoTasks[task.id] = task;
  dom.api.kaoPatchOverlay(doc, dom.api.kaoOverlayHTML(dom.NOW));
  dom.ui.kaoH4Presentation[task.id].opened = false;
  staleDetails.open = false;
  staleDetails.toggle(true);
  assert.equal(dom.ui.kaoH4Presentation[task.id].opened, false, 'aynı task nesnesine ait olsa bile ayrılmış düğüm olayı sayılmaz');
  root.details[0].toggle(true);
  assert.equal(dom.ui.kaoH4Presentation[task.id].opened, true, 'açma olayı yalnız ui sunum kaydını işaretler');
  assert.equal(JSON.stringify(dom.data.quranLearn).includes('kaoH4Presentation'), false, 'sunum işareti kalıcı veriye yazılmaz');
  dom.api.kaoPatchOverlay(doc, dom.api.kaoOverlayHTML(dom.NOW));
  assert.ok(root.details.every((detail) => detail.listeners.toggle && detail.listeners.toggle.length === 1), 'yeniden çizilen disclosure da izleniyor');
  const wrong = task.choices.find((choice) => !choice.correct).choiceId;
  dom.api.kaoAnswer(task.id, wrong);
  const s21 = dom.data.quranLearn.daily['2026-09-30'].calib.s21;
  assert.deepEqual({ n: s21.n, ok: s21.ok }, { n: 0, ok: 0 }, 'önceden açılmış destek sayaca girmez');
  assert.equal(dom.api.kaoUndo(), true, 'açılmış destekli yanıt geri alınabilir');
  assert.equal(dom.ui.kaoH4Presentation[task.id].opened, true, 'undo açılma bilgisini aynı görevde korur');
  const restoredCalib21 = dom.data.quranLearn.daily['2026-09-30'].calib && dom.data.quranLearn.daily['2026-09-30'].calib.s21;
  assert.deepEqual(restoredCalib21 ? { n: restoredCalib21.n, ok: restoredCalib21.ok } : { n: 0, ok: 0 }, { n: 0, ok: 0 }, 'undo günlük n/ok değerlerini geri yükler');
  assert.equal(dom.api.kaoAnswer(task.id, wrong).correct, false);
  const afterUndoCalib21 = dom.data.quranLearn.daily['2026-09-30'].calib.s21;
  assert.deepEqual({ n: afterUndoCalib21.n, ok: afterUndoCalib21.ok }, { n: 0, ok: 0 }, 'undo sonrası yeniden yanıtlanan açılmış destek de dışarıda kalır');
});

check('sıkılma katlaması aynı güncel task disclosure izleyicisini kullanır', () => {
  const makeDetails = (summaryText) => {
    const listeners = {};
    return {
      open: false,
      summaryText,
      listeners,
      addEventListener(type, listener) { (listeners[type] = listeners[type] || []).push(listener); },
      toggle(open) { this.open = open; for (const listener of listeners.toggle || []) listener.call(this, { target: this }); }
    };
  };
  const root = {
    details: [], html: '',
    render(html) {
      this.html = String(html || '');
      const summaries = Array.from(this.html.matchAll(/<details class="kao-pronunciation-fold"><summary>([^<]*)<\/summary>/g), (match) => match[1]);
      this.details = summaries.map(makeDetails);
    },
    insertAdjacentHTML(_where, html) { this.render(html); },
    set innerHTML(html) { this.render(html); },
    get innerHTML() { return this.html; },
    querySelectorAll(selector) { return selector === '.kao-pronunciation-fold' ? this.details : []; },
    querySelector() { return null; },
    setAttribute() {}, removeAttribute() {},
    classList: { add() {}, remove() {} }
  };
  const dom = bootKao({ seeded: true, surface: { taskElement: () => root } });
  const q = dom.data.quranLearn;
  const id = Object.keys(q.cards).find((key) => /^w:.+:ar>tr$/.test(key));
  assert.ok(id, 'sıkılma sunumu için Arapçadan anlama giden kelime kartı bulunur');
  q.cards[id] = { state: 'review', s: 6, d: 10, reps: 1, due: '2026-09-30T00:00:00.000Z' };
  q.settings.translit = true;
  dom.ui.kaoWindow = Array(8).fill(1);
  const task = dom.api.kaoBuildTask({ id: 'k3pd07:task-scoped-fold', cardId: id, isNew: false }, dom.data, { seed: 'k3pd07:task-scoped-fold' });
  dom.ui.kaoQueue = [{ id: task.id, cardId: id, isNew: false }];
  dom.ui.kaoTasks = { [task.id]: task };
  dom.ui.kaoTaskIndex = 0;
  dom.ui.kaoPanel = { open: false };
  dom.ui.kaoOrderDraft = [];
  dom.ui.kaoView = 'session';
  dom.ui.kaoOpen = true;
  const doc = { getElementById(key) { return key === 'app' ? root : null; } };
  dom.api.kaoPatchOverlay(doc, dom.api.kaoOverlayHTML(dom.NOW));
  const choiceDetails = root.details.find((detail) => detail.summaryText === 'Şıkların okunuşlarını gör');
  assert.ok(choiceDetails, 'sekiz doğru sonrası şık okunuşları gerçek görev DOM ağacında katlı çizilir');
  assert.equal(dom.ui.kaoH4Presentation[task.id].folded, false, 'FSRS/H4 kararlılık koşulu değişmeden kalır');
  assert.equal(dom.ui.kaoH4Presentation[task.id].eligible, false, 'sıkılma sunumu tek başına H4 kohortuna girmez');
  choiceDetails.toggle(true);
  assert.equal(dom.ui.kaoH4Presentation[task.id].opened, true, 'şık okunuş disclosure düğümü mevcut task H4 UI izleyicisine bağlanır');
  assert.equal(JSON.stringify(dom.data.quranLearn).includes('kaoH4Presentation'), false, 'açılma işareti yalnız ui içinde kalır');
});

check('H4 s=21 çok adımlı Arapça seçim okunuşu cevap düğmelerinden ayrı ve izlenir', () => {
  const makeDetails = (summaryText) => {
    const listeners = {};
    return {
      open: false,
      summaryText,
      listeners,
      addEventListener(type, listener) { (listeners[type] = listeners[type] || []).push(listener); },
      toggle(open) { this.open = open; for (const listener of listeners.toggle || []) listener.call(this, { target: this }); }
    };
  };
  const root = {
    details: [], html: '',
    render(html) {
      this.html = String(html || '');
      const summaries = Array.from(this.html.matchAll(/<details class="kao-pronunciation-fold"><summary>([^<]*)<\/summary>/g), (match) => match[1]);
      this.details = summaries.map(makeDetails);
    },
    insertAdjacentHTML(_where, html) { this.render(html); },
    set innerHTML(html) { this.render(html); },
    get innerHTML() { return this.html; },
    querySelectorAll(selector) { return selector === '.kao-pronunciation-fold' ? this.details : []; },
    querySelector() { return null; },
    setAttribute() {}, removeAttribute() {},
    classList: { add() {}, remove() {} }
  };
  const dom = bootKao({ seeded: true, surface: { taskElement: () => root } });
  const q = dom.data.quranLearn, flow = dom.win.SeymaQuranLearnFlow;
  const id = Object.keys(q.cards).find((key) => /^w:/.test(key) && flow.ladderArm(key) === 'A');
  assert.ok(id, 'çok adımlı H4 sınaması için A kolunda kelime kartı bulunur');
  q.cards[id] = { state: 'review', s: 21, d: 10, reps: 6, r: dom.NOW, due: '2026-09-29T00:00:00.000Z' };
  q.settings.translit = true;
  dom.ui.kaoWindow = [];
  const task = dom.api.kaoBuildTask({ id: 'k3pd07:h4-build-choice-fold', cardId: id, isNew: false }, dom.data, { seed: 'k3pd07:h4-build-choice-fold' });
  assert.equal(task.kind, 'build', 'A kolu s=21 görev türü çok adımlı harf kurma olarak kalır');
  dom.ui.kaoQueue = [{ id: task.id, cardId: id, isNew: false }];
  dom.ui.kaoTasks = { [task.id]: task };
  dom.ui.kaoTaskIndex = 0;
  dom.ui.kaoPanel = { open: false };
  dom.ui.kaoOrderDraft = [];
  dom.ui.kaoView = 'session';
  dom.ui.kaoOpen = true;
  const doc = { getElementById(key) { return key === 'app' ? root : null; } };
  dom.api.kaoPatchOverlay(doc, dom.api.kaoOverlayHTML(dom.NOW));
  const choiceDetails = root.details.find((detail) => detail.summaryText === 'Şıkların okunuşlarını gör');
  assert.ok(choiceDetails, 'H4 s=21 şık okunuşları tek disclosure içinde katlıdır');
  const answerButtons = Array.from(root.html.matchAll(/<button\b[^>]*onclick="App\.kaoAnswer\([^"]*\)"[^>]*>[\s\S]*?<\/button>/g), (match) => ({ html: match[0], end: match.index + match[0].length }));
  assert.equal(answerButtons.length, task.choices.length);
  assert.ok(answerButtons.every((button) => !button.html.includes('<details')), 'H4 disclosure hiçbir cevap düğmesinin içine girmez');
  assert.ok(root.html.indexOf('<details class="kao-pronunciation-fold"><summary>Şıkların okunuşlarını gör</summary>') >= Math.max(...answerButtons.map((button) => button.end)), 'H4 disclosure tüm cevap düğmelerinden sonra kardeş öğedir');
  assert.equal(dom.ui.kaoH4Presentation[task.id].folded, true, 'mevcut H4 s=21 katlama durumu korunur');
  choiceDetails.toggle(true);
  assert.equal(dom.ui.kaoH4Presentation[task.id].opened, true, 'H4 disclosure mevcut görev izleyicisine bağlıdır');
  assert.equal(JSON.stringify(dom.data.quranLearn).includes('kaoH4Presentation'), false, 'H4 açılma işareti yalnız ui içinde kalır');
});

check('H4 destekle ilgili ARIA okunuşu ve çok dokunuşlu build kohorta girmez', () => {
  const { id, task: wordTask } = prepareH4(40, { seed: 'aria-choice' });
  const cloze = {
    id: 'k3pd03:aria-cloze',
    cardId: id,
    type: 'word',
    kind: 'cloze',
    direction: 'tr>ar',
    answer: 'كِتَابٌ',
    ar: 'هَٰذَا كِتَابٌ',
    pronunciation: 'hādhā kitābun',
    translit: wordTask.translit,
    meaning: 'Bu bir kitaptır',
    choices: [
      { choiceId: 'right', label: 'كِتَابٌ', pronunciation: 'kitābun', correct: true },
      { choiceId: 'wrong-1', label: 'قَلَمٌ', pronunciation: 'qalamun', correct: false },
      { choiceId: 'wrong-2', label: 'بَيْتٌ', pronunciation: 'baytun', correct: false },
      { choiceId: 'wrong-3', label: 'مَاءٌ', pronunciation: 'māʾun', correct: false }
    ]
  };
  t.ui.kaoQueue = [{ id: cloze.id, cardId: id, isNew: false }];
  t.ui.kaoTasks = { [cloze.id]: cloze };
  t.ui.kaoPanel = { open: false };
  t.ui.kaoOrderDraft = [];
  q.daily['2026-09-30'] = { answered: 0, correct: 0, new: 0, reviewed: 0 };
  const clozeHtml = api.kaoTaskHTML(cloze);
  assert.match(clozeHtml, /aria-label="[^\"]*okunuşu kitābun/, 'Arapça cevap düğmesinin erişilebilir adı okunuşu açığa çıkarıyor');
  const clozeAnswerButtons = Array.from(clozeHtml.matchAll(/<button\b[^>]*onclick="App\.kaoAnswer\([^"]*\)"[^>]*>[\s\S]*?<\/button>/g), (match) => ({ html: match[0], end: match.index + match[0].length }));
  assert.equal(clozeAnswerButtons.length, cloze.choices.length);
  assert.ok(clozeAnswerButtons.every((button) => !button.html.includes('<details')), 'cloze ARIA okunuşu korunurken disclosure cevap düğmesine gömülmez');
  const clozeChoiceFoldIndex = clozeHtml.indexOf('<details class="kao-pronunciation-fold"><summary>Şıkların okunuşlarını gör</summary>');
  assert.ok(clozeChoiceFoldIndex >= Math.max(...clozeAnswerButtons.map((button) => button.end)), 'cloze şık disclosure tüm cevap düğmelerinden sonra kardeş öğedir');
  api.kaoAnswer(cloze.id, 'wrong-1');
  assert.deepEqual(h4Counts(), { n: 0, ok: 0 }, 'erişilebilir adla sunulan okunuş shown sayılır');

  const buildId = Object.keys(q.cards).find((key) => /^w:/.test(key) && flow.ladderArm(key) === 'A');
  q.cards[buildId] = { state: 'review', s: 21, d: 10, reps: 6, r: t.NOW, due: '2026-09-29T00:00:00.000Z' };
  const build = api.kaoBuildTask({ id: 'k3pd03:build-excluded', cardId: buildId, isNew: false }, t.data, { seed: 'k3pd03:build-excluded' });
  assert.equal(build.kind, 'build', 's=21 A kolu gerçek harf kurma görevi üretir');
  t.ui.kaoQueue = [{ id: build.id, cardId: buildId, isNew: false }];
  t.ui.kaoTasks = { [build.id]: build };
  t.ui.kaoPanel = { open: false };
  t.ui.kaoOrderDraft = [];
  q.daily['2026-09-30'] = { answered: 0, correct: 0, new: 0, reviewed: 0 };
  for (const choiceId of correctTaps(build)) api.kaoAnswer(build.id, choiceId);
  assert.deepEqual(h4Counts(), { n: 0, ok: 0 }, 'build hedefi cevap öncesi Latin okunuşu açığa çıkardığı için dışarıda');
});

check('H4 sunum ayarı FSRS notunu değiştirmez', () => {
  const before = q.settings.translit;
  const answerOnce = (translit, seed) => {
    const { id, task } = prepareH4(40, { seed, translit, reviewAt: t.NOW });
    t.ui.kaoTaskStartedAt = Date.now() - 3000;
    api.kaoAnswer(task.id, correctTaps(task)[0]);
    const card = q.cards[id];
    return { s: card.s, d: card.d, dueMinute: card.due.slice(0, 16), reps: card.reps, lapses: card.lapses, state: card.state };
  };
  const folded = answerOnce(true, 'fsrs-folded');
  const disabled = answerOnce(false, 'fsrs-disabled');
  assert.deepEqual(disabled, folded, 'gizli/katlı Latin desteği FSRS alanlarını değiştirmez');
  if (before === undefined) delete q.settings.translit;
  else q.settings.translit = before;
});

check('sınır: s = 20 görünür, s = 21 katlı — okunuş s ≥ 21 olan kartta soluyor', () => {
  const id = cardAt(20);
  assert.ok(id, 'A kolu kelime kartı bulunmalı');
  const open = api.kaoTaskHTML(buildAt(id, 's20'));
  cardAt(21); // aynı kart, kararlılık sınırın öbür tarafına yazılır
  const folded = api.kaoTaskHTML(buildAt(id, 's21'));
  assert.equal(countFolds(open), 0, 's = 20: katlama yok');
  assert.ok(countLines(open) > 0, 's = 20: okunuş görünür satır olarak duruyor');
  // s = 21'de görev ve şık okunuşları kapalı details içinde kalır; çok adımlı şıklar tek kardeş disclosure paylaşır.
  const foldBlocks = Array.from(folded.matchAll(/<details class="kao-pronunciation-fold">[\s\S]*?<\/details>/g), (match) => match[0]);
  assert.ok(foldBlocks.length > 0, 's = 21: okunuş katlandı');
  assert.equal(countLines(folded), foldBlocks.reduce((sum, block) => sum + countLines(block), 0), 's = 21: bütün Latin okunuş satırları kapalı katlamaların içinde');
});

check('katlama: yerel <details>, varsayılan kapalı ve handler yok', () => {
  const id = cardAt(21);
  const html = api.kaoTaskHTML(buildAt(id, 'fold'));
  assert.match(html, /<details class="kao-pronunciation-fold"><summary>(?:Okunuş|Şıkların okunuşlarını gör)<\/summary>/, 'okunuş kendi <details> içinde');
  assert.ok(!new RegExp(`<details class="${FOLD}" open`).test(html), 'varsayılan olarak kapalı');
  // Açma/kapama tarayıcının işidir: <summary> ya da <details> üzerinde handler olmamalı.
  const block = html.slice(html.indexOf(`class="${FOLD}"`), html.indexOf('</details>'));
  assert.ok(!/onclick=|ontoggle=|onpointerdown=/.test(block), 'katlamada handler yok (yerel <details>)');
  assert.ok(block.includes(`class="${LINE}"`), 'okunuş metni katlamanın içinde duruyor');
});

check('ayar: settings.translit === false ise okunuş HTML\'de hiç yok', () => {
  const id = cardAt(21);
  const before = q.settings.translit;
  q.settings.translit = false;
  const hidden = api.kaoTaskHTML(buildAt(id, 'off'));
  assert.equal(countLines(hidden), 0, 'kapalı: görünür okunuş satırı yok');
  assert.equal(countFolds(hidden), 0, 'kapalı: katlama da yok');
  assert.ok(!/kao-pronunciation/.test(hidden), 'kapalı: okunuş HTML\'de hiç geçmiyor');
  assert.ok(countArabic(hidden) > 0, 'kapalı: Arapça yine görünür');
  // Ayar açık (ya da eski kayıtta tanımsız) iken bugünkü davranış korunur: okunuş döner.
  q.settings.translit = true;
  assert.ok(countLines(api.kaoTaskHTML(buildAt(id, 'on'))) > 0, 'açık: okunuş HTML\'de duruyor');
  delete q.settings.translit;
  assert.ok(countLines(api.kaoTaskHTML(buildAt(id, 'unset'))) > 0, 'tanımsız: eski kayıt bozulmaz');
  q.settings.translit = before;
});

check('not: katlama notu etkilemez (FSRS aynı)', () => {
  const id = cardAt(21);
  // Görev tipi s ≥ 21'de build/cloze olabilir: çok-dokunuşlu görevde TAM doğru dizi gerekir
  // (tek dokunuş 'pending' bırakır ve notu hiç yazmaz). Dizi paylaşılan yardımcıdan gelir.
  const answer = (seed) => {
    const task = buildAt(id, seed);
    t.ui.kaoQueue = [{ id: task.id, cardId: task.cardId, isNew: false }];
    t.ui.kaoTasks = { [task.id]: task };
    t.ui.kaoTaskIndex = 0; t.ui.kaoTaskStartedAt = Date.now(); t.ui.kaoUndo = null;
    t.ui.kaoPanel = { open: false }; t.ui.kaoOrderDraft = [];
    let result = null;
    for (const choiceId of correctTaps(task)) result = api.kaoAnswer(task.id, choiceId);
    return { correct: result && result.correct, reps: q.cards[id].reps, s: q.cards[id].s, state: q.cards[id].state };
  };
  const arm = (translit) => {
    q.settings.translit = translit;
    cardAt(21);            // her kol AYNI temiz durumdan başlar
    return answer('grade');
  };
  const shown = arm(true), hidden = arm(false);
  q.settings.translit = true;
  assert.equal(shown.correct, true, 'okunuş açıkken doğru cevap doğru sayılır');
  assert.equal(hidden.correct, true, 'okunuş kapalıyken doğru cevap doğru sayılır');
  assert.equal(hidden.reps, shown.reps, 'tekrar sayısı aynı');
  assert.equal(hidden.state, shown.state, 'kart durumu aynı');
  assert.equal(hidden.s, shown.s, 'kararlılık aynı');
});

check('sözleşme: her Arapça satırın okunuş HTML\'i vardır; katlama onu gizler, silmez', () => {
  // Katlanmış okunuş satırı <details> İÇİNDE durur: sayım katlamadan bağımsız eşit kalır
  // (test_kao_pronunciation_contract bunu bekler: okunuş HTML\'de durur, yalnız katlı).
  const openHtml = api.kaoTaskHTML(buildAt(cardAt(20), 'sum-open'));
  assert.equal(countLines(openHtml), countArabic(openHtml), 's < 21: her Arapça satırın görünür okunuşu var');
  assert.equal(countFolds(openHtml), 0, 's < 21: katlama yok');
  // Önceki kontrollerden kalan geçici durum ek Arapça satır çizer: açık geri bildirim paneli ve
  // dizme görevinin seçili çipleri (`kao-order-target`). Sözleşme GÖREVİN kendi satırlarını ölçer.
  t.ui.kaoPanel = { open: false };
  t.ui.kaoOrderDraft = [];
  const foldedTask = buildAt(cardAt(21), 'sum-fold');
  const foldedHtml = api.kaoTaskHTML(foldedTask);
  const foldBlocks = Array.from(foldedHtml.matchAll(/<details class="kao-pronunciation-fold">[\s\S]*?<\/details>/g), (match) => match[0]);
  assert.ok(foldBlocks.length > 0, 's ≥ 21: en az bir kapalı okunuş katlaması var');
  assert.equal(countLines(foldedHtml), foldBlocks.reduce((sum, block) => sum + countLines(block), 0), 's ≥ 21: okunuş HTML\'de, tümü kapalı details içinde');
  const groupedChoiceFold = foldBlocks.find((block) => block.includes('<summary>Şıkların okunuşlarını gör</summary>')) || '';
  for (const choice of foldedTask.choices || []) {
    if (/[\u0600-\u06ff]/.test(choice.label || '')) {
      assert.ok(groupedChoiceFold.includes(escapeHtml(choice.label)) && groupedChoiceFold.includes(escapeHtml(choice.pronunciation)), 'katlı şık disclosure gerçek Arapça/okunuş çiftini korur');
    }
  }
});

check('CSS: katlanan okunuşun açılır işaretçisi ve hareket azaltma kuralı var', () => {
  const css = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
  assert.match(css, /\.kao-pronunciation-fold>summary::after\{[^}]*content:/, 'işaretçi (›) olmalı');
  assert.match(css, /\.kao-pronunciation-fold\[open\]>summary::after\{[^}]*rotate/, 'açıkken işaretçi döner');
  assert.match(css, /prefers-reduced-motion[^{]*\{[^}]*\.kao-pronunciation-fold>summary::after[^}]*animation:none;transition:none/, 'hareket azaltmada geçiş yok');
});

console.log(`test_k3p_19: PASS (${passed} kontrol — sınır, katlama, ayar, not etkisizliği, sözleşme, CSS)`);
