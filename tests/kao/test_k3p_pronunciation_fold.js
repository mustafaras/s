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

check('sınır: s = 20 görünür, s = 21 katlı — okunuş s ≥ 21 olan kartta soluyor', () => {
  const id = cardAt(20);
  assert.ok(id, 'A kolu kelime kartı bulunmalı');
  const open = api.kaoTaskHTML(buildAt(id, 's20'));
  cardAt(21); // aynı kart, kararlılık sınırın öbür tarafına yazılır
  const folded = api.kaoTaskHTML(buildAt(id, 's21'));
  assert.equal(countFolds(open), 0, 's = 20: katlama yok');
  assert.ok(countLines(open) > 0, 's = 20: okunuş görünür satır olarak duruyor');
  // s = 21'de görevdeki HER Arapça satır katlanır (görev tipine göre birden çok: soru + şık çipleri).
  assert.ok(countFolds(folded) > 0, 's = 21: okunuş katlandı');
  assert.equal(countFolds(folded), countArabic(folded), 's = 21: bütün Arapça satırlar katlı');
});

check('katlama: yerel <details>, varsayılan kapalı ve handler yok', () => {
  const id = cardAt(21);
  const html = api.kaoTaskHTML(buildAt(id, 'fold'));
  assert.match(html, new RegExp(`<details class="${FOLD}"><summary>Okunuş</summary>`), 'okunuş kendi <details> içinde');
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
  const foldedHtml = api.kaoTaskHTML(buildAt(cardAt(21), 'sum-fold'));
  assert.equal(countLines(foldedHtml), countArabic(foldedHtml), 's ≥ 21: okunuş yine HTML\'de, yalnız <details> içinde');
  assert.equal(countFolds(foldedHtml), countArabic(foldedHtml), 's ≥ 21: hepsi katlı');
});

check('CSS: katlanan okunuşun açılır işaretçisi ve hareket azaltma kuralı var', () => {
  const css = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
  assert.match(css, /\.kao-pronunciation-fold>summary::after\{[^}]*content:/, 'işaretçi (›) olmalı');
  assert.match(css, /\.kao-pronunciation-fold\[open\]>summary::after\{[^}]*rotate/, 'açıkken işaretçi döner');
  assert.match(css, /prefers-reduced-motion[^{]*\{[^}]*\.kao-pronunciation-fold>summary::after[^}]*animation:none;transition:none/, 'hareket azaltmada geçiş yok');
});

console.log(`test_k3p_19: PASS (${passed} kontrol — sınır, katlama, ayar, not etkisizliği, sözleşme, CSS)`);
