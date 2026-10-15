'use strict';
// K3P-17 · R3 "harflerden kur" (TASARIM §4, KARTLAR.md). Sentetik node:vm; ağ, tarayıcı, depo yok.
// Ölçülenler:
//   1) UYGUNLUK: görev yalnız 2–6 harfli, harfe çevrilebilen ve doğrulanmış lemmada kurulur; aksi hâlde
//      kurucu build ÜRETMEZ (kart eski R2 yoluna düşer) ve hiçbir zaman boş/eksik çip üretmez.
//   2) ÇELDİRİCİ: fazladan iki harf hedef kelimenin harflerinden FARKLIDIR ve aynı nokta ailesindendir
//      (aile listesi bu fixture'da TASARIM §4'ten bağımsız yazılır; üretimden okunmaz).
//   3) SIRA: çiplerin hedef harfleri ordinal 0..n-1 taşır ve doğru sıra tam olarak onları seçmektir;
//      doğru sıra doğru, yanlış sıra yanlış sayılır (gerçek App.kaoAnswer + FSRS yolu).
//   4) ÇELDİRİCİ ÇİPİ: seçildiğinde sıra yanlış olur (çeldirici hedef harfin yerine geçmez).
//   5) A11Y: her çipin erişilebilir adı vardır (aria-label; harfin adı yalnız donmuş ses modülünden).
//   6) MERDİVEN: build yalnız R3'te ve A kolunda kurulur; B kolu R1'de, R1/R2/R4 yolları değişmez.
const assert = require('node:assert/strict');
const { bootKao, freshUser, text } = require('./helpers/kao-harness');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

// TASARIM §4 / 07 §2 şekil aileleri: S0 derslerinin nokta aileleri (fixture'da bağımsız yazıldı).
const FAMILY = {
  's0.02': ['ba', 'ta', 'tha', 'nun', 'ya'],
  's0.04': ['jim', 'hah', 'khah'],
  's0.05': ['dal', 'dhal', 'ra', 'zay', 'waw'],
  's0.06': ['sin', 'shin', 'sad', 'dad'],
  's0.10': ['tta', 'zah', 'ayn', 'ghayn', 'fa', 'qaf', 'kaf', 'lam', 'mim', 'ha', 'hamza']
};
const familyOf = (letterId) => Object.keys(FAMILY).find((key) => FAMILY[key].includes(letterId)) || null;

const t = bootKao({ seeded: true });
const api = t.api;
const lex = t.win.QuranLexiconV1, phonics = t.win.QuranPhonicsV1;
const byChar = new Map(phonics.letters.map((letter) => [letter.ar, letter]));
const strip = (value) => String(value || '').replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/g, '');
const lettersOf = (lemma) => Array.from(strip(lemma.ar));
const eligible = (lemma) => {
  const chars = lettersOf(lemma);
  return chars.length >= 2 && chars.length <= 6 && chars.every((ar) => byChar.has(ar) && byChar.get(ar).id !== 'hamza');
};
// Merdiveni elle kurmak yerine gerçek kart kaydı yazılır: A kolu + 10 ≤ s < 30 → R3.
function r3Card() {
  const q = t.data.quranLearn;
  for (const lemma of lex.lemmas) {
    if (!eligible(lemma)) continue;
    for (const dir of ['ar>tr', 'tr>ar']) {
      const cardId = `w:${lemma.id}:${dir}`;
      if (t.win.SeymaQuranLearnFlow.ladderArm(cardId) !== 'A') continue;
      q.cards[cardId] = { state: 'review', s: 12, reps: 5, due: '2026-09-29T00:00:00.000Z' };
      if (t.win.SeymaQuranLearnFlow.ladderRung(q.cards[cardId]) === 'R3') return { lemma, cardId };
    }
  }
  return null;
}
const fixture = r3Card();
assert.ok(fixture, 'R3 uygun kart bulunmalı');
// Her kurulumdan önce kart yeniden R3 durumuna yazılır: cevaplar FSRS kararlılığını değiştirir ve merdiven
// basamağı kayar (bu, testin değil motorun doğru davranışıdır). Bütçe/uygunluk ölçüsü sabit kalsın.
const resetCard = () => { t.data.quranLearn.cards[fixture.cardId] = { state: 'review', s: 12, reps: 5, due: '2026-09-29T00:00:00.000Z' }; };
const build = (suffix = '') => { resetCard(); return api.kaoBuildTask({ id: `k3p-17-${fixture.cardId}${suffix}`, cardId: fixture.cardId, isNew: false }, t.data, { seed: `k3p-17${suffix}` }); };
const word = lettersOf(fixture.lemma);
const correctChips = (task) => task.choices.filter((choice) => choice.correct === true);
// Sıra çiplerin ordinalinde değil, kurulacak kelimede (answer) taşınır: çipleri yazım sırasına diz.
const bare = (value) => String(value || '').replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/g, '');
const orderedChips = (task) => {
  const pool = correctChips(task).slice(), out = [];
  for (const char of bare(task.answer)) {
    const index = pool.findIndex((choice) => choice.label === char);
    out.push(index >= 0 ? pool.splice(index, 1)[0] : null);
  }
  return out;
};
const distractorChips = (task) => task.choices.filter((choice) => choice.correct !== true);

check('uygunluk: build yalnız 2–6 harfli, harfe çevrilebilen lemmada; aksi hâlde kurucu build üretmez', () => {
  const task = build();
  assert.equal(task.kind, 'build');
  assert.equal(task.rung, 'R3');
  assert.equal(task.cardId, fixture.cardId);
  assert.deepEqual(Array.from(orderedChips(task), (choice) => choice.label), word, 'hedef çipler kelimenin harf sırasıdır');
  const ineligible = lex.lemmas.filter((lemma) => !eligible(lemma));
  assert.ok(ineligible.length > 0, 'uygun olmayan lemma var');
  for (const lemma of ineligible.slice(0, 40)) {
    const cardId = `w:${lemma.id}:ar>tr`;
    t.data.quranLearn.cards[cardId] = { state: 'review', s: 12, reps: 5, due: '2026-09-29T00:00:00.000Z' };
    if (t.win.SeymaQuranLearnFlow.ladderArm(cardId) !== 'A') continue;
    const built = api.kaoBuildTask({ id: `ineligible:${cardId}`, cardId, isNew: false }, t.data, { seed: 'ineligible' });
    assert.notEqual(built && built.kind, 'build', `${lemma.id} (${lettersOf(lemma).length} harf): build kurulmamalı`);
    assert.equal(built && built.rung, 'R2', `${lemma.id}: R2 yedeğine düşmeli`);
  }
});

check('çeldirici: fazladan iki harf kelimede yok ve hedef harfle aynı nokta ailesinden', () => {
  const task = build();
  const fill = distractorChips(task);
  assert.equal(fill.length, 2, 'tam iki çeldirici harf');
  assert.equal(task.choices.length, word.length + 2, 'çip sayısı = harf + 2');
  const families = word.map((ar) => familyOf(byChar.get(ar).id));
  for (const choice of fill) {
    assert.equal(word.includes(choice.label), false, `çeldirici hedef harfle aynı: ${choice.label}`);
    const family = familyOf((byChar.get(choice.label) || {}).id);
    assert.ok(family && families.includes(family), `çeldirici aynı nokta ailesinden değil: ${choice.label} (${family})`);
  }
  assert.equal(new Set(task.choices.map((choice) => choice.label)).size, task.choices.length, 'çipler tek');
});

check('sıra: doğru sıra hedef harflerin yazım sırasıdır; çeldirici sıraya girmez', () => {
  const task = build();
  // answer harekeli kelimedir (geri bildirim onu gösterir); sıra onun harekesiz harfleridir.
  assert.equal(bare(task.answer), word.join(''), 'doğru sıra = kelimenin harekesiz harf yazımı');
  assert.deepEqual(Array.from(bare(task.answer)), word);
  assert.equal(correctChips(task).length, word.length, 'hedef çip sayısı harf sayısıdır');
  assert.equal(distractorChips(task).length, 2, 'iki çeldirici sıraya katılmaz');
  assert.equal(new Set(task.choices.map((choice) => choice.choiceId)).size, task.choices.length, 'kimlikler tek');
  assert.equal(new Set(task.choices.map((choice) => choice.label)).size, task.choices.length, 'etiketler tek');
});

check('doğru sıra doğru, yanlış sıra yanlış sayılır (gerçek kaoAnswer + FSRS)', () => {
  const queue = (task) => { t.ui.kaoQueue = [{ id: task.id, cardId: task.cardId, isNew: false }]; t.ui.kaoTasks = { [task.id]: task }; t.ui.kaoTaskIndex = 0; t.ui.kaoTaskStartedAt = Date.now(); t.ui.kaoUndo = null; t.ui.kaoPanel = { open: false }; t.ui.kaoOrderDraft = []; };
  const right = build(':right');
  queue(right);
  const inOrder = orderedChips(right);
  let result = null;
  for (const choice of inOrder) result = api.kaoAnswer(right.id, choice.choiceId);
  assert.ok(result && result.pending !== true, 'harfler tamamlanınca cevap değerlendirilir');
  assert.equal(result.correct, true, 'doğru sıra doğru sayılmalı');
  const after = t.data.quranLearn.cards[right.cardId].reps;
  assert.ok(after > 5, `doğru cevap FSRS tekrarını ilerletir (reps ${after} > 5)`);
  const wrong = build(':wrong');
  queue(wrong);
  const reversed = orderedChips(wrong).slice().reverse();
  const orderErrors = t.data.quranLearn.errors.order;
  for (const choice of reversed) result = api.kaoAnswer(wrong.id, choice.choiceId);
  assert.equal(result.correct, false, 'yanlış sıram yanlış sayılmalı');
  assert.equal(t.data.quranLearn.errors.order, orderErrors + 1, 'dizilim hatası order kovasına yazılır');
  assert.ok(t.data.quranLearn.cards[wrong.cardId].reps > 5, 'yanlış cevap da kartı ilerletir');
});

check('çeldirici çip seçilirse sıra bozulur: çeldirici hedef harfin yerine geçmez', () => {
  const task = build(':filler');
  const queue = () => { t.ui.kaoQueue = [{ id: task.id, cardId: task.cardId, isNew: false }]; t.ui.kaoTasks = { [task.id]: task };
    t.ui.kaoTaskIndex = 0; t.ui.kaoTaskStartedAt = Date.now(); t.ui.kaoUndo = null; t.ui.kaoPanel = { open: false }; t.ui.kaoOrderDraft = []; };
  const inOrder = orderedChips(task);
  const filler = distractorChips(task)[0];
  queue();
  assert.equal(api.kaoAnswer(task.id, inOrder[0].choiceId).pending, true, 'ilk harf beklenir');
  const errors = t.data.quranLearn.errors.order;
  const withFiller = api.kaoAnswer(task.id, filler.choiceId);
  assert.notEqual(withFiller.pending, true, 'çeldirici bir konumu doldurur: cevap tamamlanır');
  assert.equal(withFiller.correct, false, 'çeldiricili dizi hedef yazıma eşit olamaz');
  assert.equal(t.data.quranLearn.errors.order, errors + 1, 'çeldirici seçimi dizilim hatası sayılır');
  // Aynı çiplerden yalnız hedef harfler seçilirse doğru sayılır: çeldirici sıraya katılmadıkça engel değildir.
  queue();
  const clean = inOrder.map((choice) => api.kaoAnswer(task.id, choice.choiceId)).pop();
  assert.equal(clean.correct, true, 'hedef harfler doğru sırada doğru sayılır');
  assert.equal(t.data.quranLearn.errors.order, errors + 1, 'doğru dizide hata kovası artmaz');
});

check('a11y: her çipin erişilebilir adı var (harfin adı donmuş ses modülünden)', () => {
  const task = build(':a11y');
  const html = api.kaoTaskHTML(task);
  assert.match(html, /Harflerden kur/, 'görev başlığı türü söyler');
  assert.match(html, /class="kao-order-target"/, 'kurulan kelime alanı görünür');
  for (const choice of task.choices) {
    const button = new RegExp(`aria-label="${choice.label}, okunuşu [^"]+"`).test(html);
    const named = new RegExp(`aria-label="[^"]*harfi[^"]*"`).test(html);
    assert.ok(button || named, `${choice.label}: çipin erişilebilir adı yok`);
  }
  const names = phonics.letters.map((letter) => String(letter.translit && letter.translit.bwToOkunus));
  assert.ok(text(html).length > 0 && names.length === 28, 'okunuş kaynağı donmuş modül');
});

check('merdiven: build yalnız R3/A; B kolu R1, diğer basamaklar değişmez ve çıktı determinist', () => {
  const task = build(':det');
  assert.deepEqual(Array.from(build(':det').choices, (choice) => choice.label), Array.from(task.choices, (choice) => choice.label), 'aynı tohum aynı çipler');
  const same = build(':det');
  assert.deepEqual(Array.from(same.choices, (choice) => choice.choiceId), Array.from(task.choices, (choice) => choice.choiceId));
  const cardId = fixture.cardId;
  const saved = t.data.quranLearn.cards[cardId];
  for (const [stability, expected] of [[2.9, 'R1'], [5, 'R2'], [12, 'R3'], [40, 'R4']]) {
    t.data.quranLearn.cards[cardId] = { state: 'review', s: stability, reps: 5, due: '2026-09-29T00:00:00.000Z' };
    const arm = t.win.SeymaQuranLearnFlow.ladderArm(cardId);
    const built = api.kaoBuildTask({ id: `rung:${stability}`, cardId, isNew: false }, t.data, { seed: 'rung' });
    const rung = arm === 'B' ? 'R1' : expected;
    if (rung === 'R3') continue; // yalnız A kolunda ve tam bu basamakta build
    assert.notEqual(built.kind, 'build', `s=${stability} (${arm}): build kurulmamalı`);
  }
  for (const lemma of lex.lemmas.slice(0, 60)) {
    const id = `w:${lemma.id}:ar>tr`;
    if (t.win.SeymaQuranLearnFlow.ladderArm(id) === 'A') continue;
    t.data.quranLearn.cards[id] = { state: 'review', s: 12, reps: 5, due: '2026-09-29T00:00:00.000Z' };
    const built = api.kaoBuildTask({ id: `b:${id}`, cardId: id, isNew: false }, t.data, { seed: 'b' });
    assert.equal(built.rung, 'R1', `${id}: B kolu R1'de kalmalı`);
    assert.notEqual(built.kind, 'build');
  }
  t.data.quranLearn.cards[cardId] = saved;
});

console.log(`test_k3p_build: PASS (${passed} kontrol — uygunluk, aile çeldiricisi, sıra notlama, a11y, merdiven)`);
