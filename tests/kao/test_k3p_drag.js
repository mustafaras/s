'use strict';
// K3P-20 · Kelime/harf dizmede sürükle-bırak (TASARIM/P4; K-D pin denetimi). Sentetik node:vm; ağ/depo yok.
// Ölçülenler:
//   1) SAF FONKSİYON: `kaoDropIndex(rects, point)` — boş liste / eksik nokta → −1, kutu içi → indeks,
//      kenarlar DAHİL, dışı → −1. Sürükleme mantığının karar verdiği yer budur.
//   2) BIRAKMA: pointerdown + hareket + hedef bölgeye bırakma → mevcut `App.kaoAnswer(taskId, choiceId)`
//      TAM BİR KEZ çağrılır; bölge DIŞINA bırakma → hiç çağrılmaz.
//   3) YÜZEY: mantık `window.SeymaQuranLearn.kaoDrag`'ta yaşar, `App`'de DEĞİL; `App.kao*` sayısı 45 kalır.
//   4) DOKUNMA/KLAVYE: çipte tam bir `onclick="App.kaoAnswer(...)"` vardır (tek dokunuş yolu korunur) ve
//      her çipte tam bir `onpointerdown` vardır; `onclick` sayısı pin'e göre artmaz.
//   5) HAREKET AZALTMA: hareket kapalıyken (kaoMotionAllowed false) animasyon denenmez, bırakma çalışır.
//   6) SÜRÜKLENEBİLİRLİK: yalnız dizme görevlerinde (order/build) ve etkin çiplerde `draggable="true"`.
const assert = require('node:assert/strict');
const { bootKao } = require('./helpers/kao-harness');

let passed = 0;
// Animasyon yolu (`Element.animate().finished`) Promise döndürür: bırakma commit'i bir mikrogörev sonra
// yazılır. Bu yüzden kontroller async'tir; her kontrol sırayla beklenir.
async function check(name, fn) { await fn(); passed += 1; console.log(`PASS  ${name}`); }
const flush = () => Promise.resolve();

const t = bootKao({ seeded: true });
const api = t.api;
const flow = t.win.SeymaQuranLearnFlow;
const q = t.data.quranLearn;

// ---- Sürükleme sahnesi: gerçek DOM yok; kaoDrag'ın dokunduğu yüzey kadarını sağlayan sahte düğüm. ----
function scene({ zoneRect, chipRects, reducedMotion = false, withAnimate = true }) {
  // `kaoMotionAllowed` UYGULAMA ayarını okur (`data.settings.premiumAtmosphere`), quranLearn ayarını değil.
  t.data.settings.premiumAtmosphere = !reducedMotion;
  const listeners = {};
  const doc = {
    addEventListener: (name, fn) => { listeners[name] = fn; },
    removeEventListener: (name) => { delete listeners[name]; },
    querySelectorAll: () => [zone]
  };
  const makeChip = (rect) => ({ getBoundingClientRect: () => rect });
  const chipNodes = chipRects.map(makeChip);
  const zone = {
    getBoundingClientRect: () => zoneRect,
    querySelectorAll: () => chipNodes
  };
  const el = {
    ownerDocument: doc,
    classList: { list: new Set(), add(c) { this.list.add(c); }, remove(c) { this.list.delete(c); }, contains(c) { return this.list.has(c); } },
    style: {},
    getBoundingClientRect: () => chipRects[0],
    setPointerCapture(id) { this.captured = id; },
    animate: withAnimate ? (frames, opts) => { el.animated = (el.animated || 0) + 1; el.animateFrames = frames; el.animateOpts = opts; return { finished: Promise.resolve() }; } : undefined
  };
  return { el, zone, listeners, doc, chipNodes };
}

const dropEvent = (sceneRef, x, y) => ({ currentTarget: sceneRef.el, clientX: x, clientY: y, pointerId: 7,
  preventDefault() { sceneRef.prevented = true; } });

// ---- 1) Saf bırakma-noktası hesabı -------------------------------------------------------------------
async function main() {
await check('kaoDropIndex saf: kutu içi indeks, kenarlar dâhil, dışı ve eksik girdi −1', async () => {
  const rects = [
    { left: 0, top: 0, right: 10, bottom: 10 },
    { left: 12, top: 0, right: 22, bottom: 10 },
    { left: 24, top: 0, right: 34, bottom: 10 }
  ];
  assert.equal(typeof api.kaoDropIndex, 'function', 'kaoDropIndex dışa açık');
  assert.equal(api.kaoDropIndex(rects, { x: 5, y: 5 }), 0);
  assert.equal(api.kaoDropIndex(rects, { x: 15, y: 5 }), 1);
  assert.equal(api.kaoDropIndex(rects, { x: 33, y: 9 }), 2);
  // Kenarlar dâhil: sol/üst ve sağ/alt sınırlar geçerlidir.
  assert.equal(api.kaoDropIndex(rects, { x: 0, y: 0 }), 0);
  assert.equal(api.kaoDropIndex(rects, { x: 12, y: 10 }), 1);
  assert.equal(api.kaoDropIndex(rects, { x: 34, y: 10 }), 2);
  // Kutular arasındaki boşluk ve dışı → −1.
  assert.equal(api.kaoDropIndex(rects, { x: 11, y: 5 }), -1);
  assert.equal(api.kaoDropIndex(rects, { x: 40, y: 5 }), -1);
  assert.equal(api.kaoDropIndex(rects, { x: 5, y: 20 }), -1);
  // Eksik/bozuk girdi güvenli: patlamaz, −1 döner.
  assert.equal(api.kaoDropIndex([], { x: 1, y: 1 }), -1);
  assert.equal(api.kaoDropIndex(null, { x: 1, y: 1 }), -1);
  assert.equal(api.kaoDropIndex(rects, null), -1);
  assert.equal(api.kaoDropIndex(rects, { x: 'a', y: 5 }), -1);
  assert.equal(api.kaoDropIndex([null, rects[1]], { x: 15, y: 5 }), 1, 'boş kutu atlanır');
});

// ---- 2) Bırakma yolu ----------------------------------------------------------------------------------
await check('bırakma: hedef bölgeye bırakınca mevcut App.kaoAnswer tam bir kez; dışına bırakınca hiç', async () => {
  const answers = [];
  const previous = t.win.App && t.win.App.kaoAnswer;
  t.win.App = t.win.App || {};
  t.win.App.kaoAnswer = (taskId, choiceId) => { answers.push(`${taskId}|${choiceId}`); return { correct: true }; };
  const zoneRect = { left: 0, top: 100, right: 300, bottom: 200 };
  const chipRects = [
    { left: 4, top: 110, right: 44, bottom: 150 },
    { left: 48, top: 110, right: 88, bottom: 150 }
  ];
  // İçeri bırakma
  const inside = scene({ zoneRect, chipRects });
  assert.equal(api.kaoDrag(dropEvent(inside, 20, 120), 'task-1', 'c0'), true, 'kaoDrag true döner');
  assert.equal(inside.prevented, true, 'pointerdown varsayılanı engellenir (metin seçimi/sürükleme çakışması)');
  assert.equal(answers.length, 0, 'hareket olmadan cevap verilmez (dokunma yolu bozulmaz)');
  assert.equal(inside.el.captured, 7, 'pointer capture alınır');
  assert.equal(inside.el.classList.contains('is-dragging'), true, 'sürükleme sınıfı eklenir');
  inside.listeners.pointermove({ clientX: 60, clientY: 130 });
  assert.match(inside.el.style.transform, /^translate\(/, 'çip pointer ile taşınır (transform)');
  inside.listeners.pointerup({ clientX: 20, clientY: 120 });
  await flush(); // animasyon yolu commit'i bir mikrogörev sonra yazar
  assert.deepEqual(answers, ['task-1|c0'], 'hedefe bırakılınca tam bir kez cevaplanır');
  assert.equal(inside.el.classList.contains('is-dragging'), false, 'sürükleme sınıfı temizlenir');
  assert.equal(inside.el.style.transform, '', 'transform sıfırlanır');
  assert.ok(!inside.listeners.pointermove && !inside.listeners.pointerup, 'dinleyiciler bırakılır');
  // Dışarı bırakma
  answers.length = 0;
  const outside = scene({ zoneRect, chipRects });
  api.kaoDrag(dropEvent(outside, 20, 120), 'task-2', 'c1');
  outside.listeners.pointermove({ clientX: 400, clientY: 900 });
  outside.listeners.pointerup({ clientX: 400, clientY: 900 });
  assert.deepEqual(answers, [], 'bölge dışına bırakma cevap üretmez');
  if (previous === undefined) delete t.win.App.kaoAnswer; else t.win.App.kaoAnswer = previous;
});

// ---- 3) Yüzey ve pin ----------------------------------------------------------------------------------
await check('yüzey: mantık SeymaQuranLearn.kaoDrag\'ta, App değil; App.kao* sayısı 45 kalır', () => {
  assert.equal(typeof t.win.SeymaQuranLearn.kaoDrag, 'function', 'kaoDrag motor yüzeyinde');
  assert.equal(typeof t.win.SeymaQuranLearn.kaoDropIndex, 'function', 'kaoDropIndex motor yüzeyinde');
  assert.notEqual(t.win.App && t.win.App.kaoDrag, true, 'App.kaoDrag YOK (yeni handler eklenmedi)');
  const appSource = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', '..', 'app.js'), 'utf8');
  const surface = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', '..', 'app/core/appSurface.js'), 'utf8');
  const kaoAssignments = (appSource + surface).match(/App\.kao[A-Za-z0-9_]+\s*=/g) || [];
  assert.equal(kaoAssignments.length, 45, `App.kao* 45 kalmalı (ölçülen ${kaoAssignments.length})`);
});

// ---- 4) Dokunma ve klavye yolu ------------------------------------------------------------------------
await check('dokunma/klavye: her çipte tam bir onclick (App.kaoAnswer) ve tam bir onpointerdown', async () => {
  const cardId = Object.keys(q.cards).find((id) => /^w:/.test(id) && flow.ladderArm(id) === 'A');
  q.cards[cardId] = { state: 'review', s: 12, reps: 6, due: '2026-09-29T00:00:00.000Z' };
  const task = api.kaoBuildTask({ id: `k3p-20:${cardId}`, cardId, isNew: false }, t.data, { seed: 'k3p-20' });
  assert.equal(task.kind, 'build', 'dizme görevi kuruldu');
  const html = api.kaoTaskHTML(task);
  const chips = html.match(/<button type="button" class="[^"]*kao-chip[^"]*"[\s\S]*?<\/button>/g) || [];
  assert.equal(chips.length, task.choices.length, 'her şık bir çip');
  for (const chip of chips) {
    assert.equal((chip.match(/onclick=/g) || []).length, 1, 'çipte TAM bir onclick');
    assert.match(chip, /onclick="App\.kaoAnswer\(/, 'onclick dokunma yolunu korur');
    assert.equal((chip.match(/onpointerdown=/g) || []).length, 1, 'çipte TAM bir onpointerdown');
    assert.match(chip, /onpointerdown="window\.SeymaQuranLearn\.kaoDrag\(/, 'pointerdown sürüklemeyi başlatır');
    assert.match(chip, /draggable="true"/, 'etkin çip sürüklenebilir');
  }
  assert.match(html, /data-kao-drop=""/, 'hedef bölge bırakma kancası taşır');
});

// ---- 5) Hareket azaltma -------------------------------------------------------------------------------
await check('hareket azaltma: hareket kapalıyken animasyon denenmez, bırakma yine çalışır', async () => {
  const answers = [];
  t.win.App = t.win.App || {};
  const previous = t.win.App.kaoAnswer;
  t.win.App.kaoAnswer = (taskId, choiceId) => { answers.push(choiceId); return { correct: true }; };
  const zoneRect = { left: 0, top: 100, right: 300, bottom: 200 };
  const chipRects = [{ left: 4, top: 110, right: 44, bottom: 150 }];
  // Hareket azaltma AÇIK (premiumAtmosphere kapalı) → el.animate hiç çağrılmamalı.
  const reduced = scene({ zoneRect, chipRects, reducedMotion: true });
  api.kaoDrag(dropEvent(reduced, 20, 120), 'task-r', 'cr');
  reduced.listeners.pointermove({ clientX: 24, clientY: 124 });
  reduced.listeners.pointerup({ clientX: 20, clientY: 120 });
  assert.equal(reduced.el.animated, undefined, 'hareket azaltmada animasyon yok');
  assert.deepEqual(answers, ['cr'], 'animasyonsuz bırakma SENKRON cevaplar');
  // Hareket AÇIK → animasyon denenir (görsel geri bildirim).
  answers.length = 0;
  const moving = scene({ zoneRect, chipRects, reducedMotion: false });
  api.kaoDrag(dropEvent(moving, 20, 120), 'task-m', 'cm');
  moving.listeners.pointermove({ clientX: 24, clientY: 124 });
  moving.listeners.pointerup({ clientX: 20, clientY: 120 });
  assert.equal(moving.el.animated, 1, 'hareket açıkken animasyon kullanılır');
  await flush();
  assert.deepEqual(answers, ['cm'], 'animasyonlu bırakma da tam bir kez cevaplar');
  if (previous === undefined) delete t.win.App.kaoAnswer; else t.win.App.kaoAnswer = previous;
});

// ---- 6) Sürüklenebilirlik kapsamı ---------------------------------------------------------------------
await check('sürüklenebilirlik: yalnız dizme görevlerinde; düz seçim şıkkı sürüklenmez', async () => {
  const cardId = Object.keys(q.cards).find((id) => /^w:/.test(id) && flow.ladderArm(id) === 'A');
  // R1 (düz tanıma) görevi: şıklar sürüklenemez, yalnız dokunulur.
  q.cards[cardId] = { state: 'review', s: 1, reps: 1, due: '2026-09-29T00:00:00.000Z' };
  const choiceTask = api.kaoBuildTask({ id: `k3p-20-plain:${cardId}`, cardId, isNew: true }, t.data, { seed: 'plain' });
  assert.notEqual(choiceTask.kind, 'build');
  const html = api.kaoTaskHTML(choiceTask);
  assert.ok(!/draggable="true"/.test(html), 'düz seçimde sürükleme yok');
  assert.ok(!/kaoDrag\(/.test(html), 'düz seçimde sürükleme kancası yok');
  assert.match(html, /onclick="App\.kaoAnswer\(/, 'dokunma yolu yine var');
});

console.log(`test_k3p_drag: PASS (${passed} kontrol — saf bırakma hesabı, bırakma yolu, yüzey/pin, dokunma+klavye, hareket azaltma, sürüklenebilirlik kapsamı)`);
}

main();
