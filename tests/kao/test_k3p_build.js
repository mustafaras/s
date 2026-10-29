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
//   5) K3PD-11: erişilebilir harf adları yalnız Open University OpenLearn kaynak tablosundan alınır.
//   6) MERDİVEN: build yalnız R3'te ve A kolunda kurulur; B kolu R1'de; R1/R2 değişmez, R4 ya cloze ya R3.
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
// Golden names: Open University OpenLearn, Introduction to Arabic, Table 3.1;
// hamza is explicitly named in section 2.2. Arabic spellings are copied from the source.
const SOURCE_NAMES = Object.freeze({
  ba: 'بَاء', ta: 'تَاء', tha: 'ثَاء', jim: 'جِيم', hah: 'حَاء', khah: 'خَاء', dal: 'دَال', dhal: 'ذَال',
  ra: 'رَاء', zay: 'زَاي', sin: 'سِين', shin: 'شِين', sad: 'صَاد', dad: 'ضَاد', tta: 'طَاء', zah: 'ظَاء',
  ayn: 'عَين', ghayn: 'غَين', fa: 'فَاء', qaf: 'قَاف', kaf: 'كَاف', lam: 'لَام', mim: 'مِيم', nun: 'نُون',
  ha: 'هَاء', waw: 'وَاو', ya: 'يَاء', hamza: 'الهَمْزَة'
});
const strip = (value) => String(value || '').replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/g, '');
const lettersOf = (lemma) => Array.from(strip(lemma.ar));
const eligible = (lemma) => {
  const chars = lettersOf(lemma);
  return lemma.verified === true && Array.isArray(lemma.meanings) && lemma.meanings.some((meaning) => typeof meaning === 'string' && meaning.trim()) &&
    chars.length >= 2 && chars.length <= 6 && chars.every((ar) => byChar.has(ar) && SOURCE_NAMES[byChar.get(ar).id]);
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
const nonJoiningLetterIds = new Set(['dal', 'dhal', 'ra', 'zay', 'waw', 'hamza']);
function buildForLemma(lemma, suffix) {
  for (const direction of ['tr>ar', 'ar>tr']) {
    const cardId = `w:${lemma.id}:${direction}`;
    t.data.quranLearn.cards[cardId] = { state: 'review', s: 12, reps: 5, due: '2026-09-29T00:00:00.000Z' };
    if (t.win.SeymaQuranLearnFlow.ladderArm(cardId) !== 'A' ||
        t.win.SeymaQuranLearnFlow.ladderRung(t.data.quranLearn.cards[cardId]) !== 'R3') continue;
    const task = api.kaoBuildTask({ id: `k3pd11-${suffix}-${cardId}`, cardId, isNew: false }, t.data, { seed: `k3pd11-${suffix}` });
    if (task && task.kind === 'build') return { lemma, cardId, task };
  }
  return null;
}
function findBuildCase(predicate, suffix) {
  for (const lemma of lex.lemmas) {
    if (!eligible(lemma)) continue;
    const candidate = buildForLemma(lemma, suffix);
    if (candidate && predicate(lettersOf(lemma), candidate.task)) return candidate;
  }
  return null;
}
function queueTask(task) {
  t.ui.kaoQueue = [{ id: task.id, cardId: task.cardId, isNew: false }];
  t.ui.kaoTasks = { [task.id]: task };
  t.ui.kaoTaskIndex = 0;
  t.ui.kaoTaskStartedAt = Date.now();
  t.ui.kaoUndo = null;
  t.ui.kaoPanel = { open: false };
  t.ui.kaoOrderDraft = [];
}
function buildTargetInner(html) {
  const target = String(html).match(/<div class="kao-order-target"[^>]*>([\s\S]*?)<\/div>/);
  assert.ok(target, 'seçim hedefi gerçek task HTML’sinde bulunmalı');
  return target[1];
}
function taskDom() {
  const doc = { body: {} };
  doc.activeElement = doc.body;
  const question = { focus() { doc.activeElement = this; }, setAttribute() {} };
  const node = {
    ownerDocument: doc, attrs: Object.create(null), buttons: [], classList: { values: new Set(), add(name) { this.values.add(name); }, remove(name) { this.values.delete(name); } },
    contains(target) { return this.buttons.includes(target) || target === question; },
    setAttribute(name, value) { this.attrs[name] = String(value); },
    getAttribute(name) { return this.attrs[name] || null; },
    removeAttribute(name) { delete this.attrs[name]; },
    querySelectorAll(selector) { return selector === '[data-kao-choice-id]' ? this.buttons.slice() : []; },
    querySelector(selector) { return selector === '.kao-question' || selector === 'h2' ? question : null; },
    _html: '',
    get innerHTML() { return this._html; },
    set innerHTML(value) {
      this._html = String(value);
      const previous = this.buttons;
      this.buttons = [...this._html.matchAll(/<button\b([^>]*)>/g)].map((match) => {
        const attrs = match[1];
        const get = (name) => {
          const found = attrs.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`));
          return found ? found[1] : null;
        };
        const button = {
          disabled: /(?:^|\s)disabled(?:\s|$)/.test(attrs),
          getAttribute: get,
          focus(options) { if (!this.disabled) { this.focusOptions = options; doc.activeElement = this; } }
        };
        return button;
      });
      if (previous.includes(doc.activeElement)) doc.activeElement = doc.body;
    }
  };
  return { doc, node };
}
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

check('K3PD-11: tekrar harfli ve birleşmeyen harfli gerçek kelime tek RTL önizleme düğümünde kurulur; sıra ve undo korunur', () => {
  const repeated = findBuildCase((chars, task) => {
    const ids = chars.map((char) => byChar.get(char).id);
    return new Set(chars).size < chars.length && chars.join('') !== chars.slice().reverse().join('') &&
      ids.some((id, index) => index < ids.length - 1 && nonJoiningLetterIds.has(id)) &&
      correctChips(task).length === chars.length;
  }, 'repeat');
  assert.ok(repeated, 'doğrulanmış içerikte A/R3 kolunda tekrar ve birleşmeyen harf içeren görev bulunmalı');
  const task = repeated.task, target = Array.from(bare(task.answer)), picks = orderedChips(task);
  assert.ok(new Set(target).size < target.length, 'gerçek cevap aynı harfi tekrar içerir');
  assert.ok(target.slice(0, -1).some((char) => nonJoiningLetterIds.has(byChar.get(char).id)), 'seçilen gerçek kelimede birleşmeyen harf bulunur');
  assert.equal(picks.length, target.length);
  assert.equal(new Set(picks.map((choice) => choice.choiceId)).size, target.length, 'tekrar eden gliflerin ayrı seçim kimlikleri vardır');
  assert.deepEqual(Array.from(picks, (choice) => choice.label), target, 'hedef sırası gerçek doğrulanmış cevaptan gelir');

  queueTask(task);
  for (const choice of picks.slice(0, -1)) assert.equal(api.kaoAnswer(task.id, choice.choiceId).pending, true, 'son harften önce görev bekler');
  const partial = target.slice(0, -1).join('');
  const html = api.kaoTaskHTML(task);
  assert.equal(buildTargetInner(html), `<span class="kao-order-preview kao-arabic-text" lang="ar" dir="rtl">${partial}</span>`,
    'seçilen Arapça dizge tek, bölünmemiş RTL metin düğümüdür');
  const firstName = SOURCE_NAMES[byChar.get(picks[0].label).id];
  const firstButton = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].find((match) => match[1].includes(`aria-label="${firstName}"`) && /aria-pressed="true"/.test(match[1]));
  assert.ok(firstButton && / disabled/.test(firstButton[1]), 'seçilen çip kaynak adını, pressed ve disabled durumunu korur');

  const filler = distractorChips(task)[0];
  const wrong = api.kaoAnswer(task.id, filler.choiceId);
  assert.equal(wrong.correct, false, 'çeldirici son seçim yanlış sırayı değerlendirir');
  const fillerName = SOURCE_NAMES[byChar.get(filler.label).id], wrongHTML = api.kaoTaskHTML(task);
  const wrongButton = [...wrongHTML.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].find((match) => match[1].includes(`aria-label="${fillerName}"`) && /aria-pressed="true"/.test(match[1]));
  assert.ok(wrongButton && /disabled/.test(wrongButton[1]), 'yanlış seçilen çip kaynak adını, pressed ve disabled durumunu korur');
  assert.match(wrongHTML, /role="status"[\s\S]*Bir daha bakalım/, 'yanıt sonucu erişilebilir durum panelinden bildirilir');
  assert.equal(api.kaoUndo(), true, 'yanlış son seçim geri alınabilir');
  assert.deepEqual(Array.from(t.ui.kaoOrderDraft), picks.slice(0, -1).map((choice) => choice.choiceId), 'undo önceki doğru harf seçimlerini korur');
  assert.equal(buildTargetInner(api.kaoTaskHTML(task)), `<span class="kao-order-preview kao-arabic-text" lang="ar" dir="rtl">${partial}</span>`,
    'undo birleşik önizlemeyi önceki harf dizisine döndürür');
  const solved = api.kaoAnswer(task.id, picks[picks.length - 1].choiceId);
  assert.equal(solved.correct, true, 'tekrar harf içeren doğru sıra gerçek answer/FSRS yolunda kabul edilir');

  queueTask(task);
  let reversedResult;
  for (const choice of picks.slice().reverse()) reversedResult = api.kaoAnswer(task.id, choice.choiceId);
  assert.equal(reversedResult.correct, false, 'farklı gerçek ters sıra yanlış sayılır');
  assert.equal(buildTargetInner(api.kaoTaskHTML(task)), `<span class="kao-order-preview kao-arabic-text" lang="ar" dir="rtl">${target.slice().reverse().join('')}</span>`,
    'ters seçim de aynı tek preview düğümünde görünür');
});

check('K3PD-11: mevcut word-order görevi ayrı token görünümünü korur', () => {
  const candidate = api.kaoFragmentCandidates()[0];
  assert.ok(candidate && candidate.fragmentKind === 'order', 'gerçek içerikten word-order adayı bulunmalı');
  const orderTask = api.kaoBuildFragmentTask(candidate, { seed: 'k3pd11-order-control' });
  assert.equal(orderTask.kind, 'order');
  t.ui.kaoOrderDraft = [orderTask.choices[0].choiceId];
  const inner = buildTargetInner(api.kaoTaskHTML(orderTask));
  assert.match(inner, /^<span>.+<\/span>$/, 'order görünümü seçilen kelimeyi token olarak tutar');
  assert.doesNotMatch(inner, /kao-order-preview/, 'tek harf önizlemesi word-order görevine sızmaz');
});

check('K3PD-11: OpenLearn harf-adı kaynağı gerçek build çiplerinde Arapça erişilebilir ada dönüşür', () => {
  const task = build(':a11y');
  const actualTask = build(':actual-source-name');
  for (const choice of actualTask.choices) {
    const letter = byChar.get(choice.label);
    assert.ok(letter, `${choice.choiceId}: üretim harfi fonik envanterde bulunmalı`);
    assert.equal(choice.ariaLabel, SOURCE_NAMES[letter.id], `${choice.choiceId}: gerçek builder adı doğrudan onaylı kaynakla eşleşmeli`);
  }
  const actualHTML = api.kaoTaskHTML(actualTask);
  const actualChips = [...actualHTML.matchAll(/<button\b([^>]*)>[\s\S]*?<\/button>/g)].filter((match) => /\bkao-drag\b/.test(match[1]));
  for (const choice of actualTask.choices) {
    const letter = byChar.get(choice.label);
    const chip = actualChips.find((match) => match[1].includes(`data-kao-choice-id="${choice.choiceId}"`));
    assert.ok(chip, `${choice.choiceId}: gerçek builder çipi DOM'a çizilmeli`);
    assert.match(chip[1], /onclick="App\.kaoAnswer\(/, `${choice.choiceId}: gerçek çipin klavye etkinleştirmesi korunmalı`);
    assert.ok(chip[1].includes(`aria-label="${SOURCE_NAMES[letter.id]}"`), `${choice.choiceId}: gerçek DOM adı onaylı kaynakla birebir eşleşmeli`);
  }
  const matrix = Object.assign({}, task, { id: 'k3pd11-source-name-matrix', choices: phonics.letters.filter((letter) => SOURCE_NAMES[letter.id]).map((letter, index) => ({
    choiceId: `k3pd11-source-name-matrix:choice:${index}`, label: letter.ar, pronunciation: '', correct: index === 0, ariaLabel: SOURCE_NAMES[letter.id]
  })) });
  queueTask(matrix);
  const html = api.kaoTaskHTML(matrix);
  assert.match(html, /Harflerden kur/, 'görev başlığı türü söyler');
  assert.match(html, /class="kao-order-target"/, 'kurulan kelime alanı görünür');
  const chips = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].filter((match) => /\bkao-drag\b/.test(match[1]));
  assert.equal(chips.length, Object.keys(SOURCE_NAMES).length, 'kaynak matrisi tek gerçek chip düğümünde işlenir');
  for (const letter of phonics.letters.filter((item) => SOURCE_NAMES[item.id])) {
    const chip = chips.find((match) => match[1].includes(`onclick="App.kaoAnswer('k3pd11-source-name-matrix','k3pd11-source-name-matrix:choice:${phonics.letters.filter((entry) => SOURCE_NAMES[entry.id]).findIndex((entry) => entry.id === letter.id)}')`));
    assert.ok(chip, `${letter.id}: gerçek klavye seçim düğmesi korunur`);
    assert.ok(chip[1].includes(`aria-label="${SOURCE_NAMES[letter.id]}"`), `${letter.id}: erişilebilir ad kaynakta doğrulanmış Arapça harf adıdır`);
    assert.match(chip[1], /lang="ar"/, `${letter.id}: erişilebilir ad Arapça dil etiketi taşır`);
    assert.doesNotMatch(chip[1], /aria-labelledby=/, `${letter.id}: kaynak dışı gizli label düğümü kullanılmaz`);
    const attrs = chip[1];
    assert.match(attrs, /aria-pressed="false"/, `${letter.id}: seçili durum semantiği korunur`);
    assert.match(attrs, /draggable="true"/, `${letter.id}: sürükleme semantiği korunur`);
    assert.match(attrs, /onpointerdown="window\.SeymaQuranLearn\.kaoDrag/, `${letter.id}: sürükleme hedefi korunur`);
    assert.match(attrs, /onclick="App\.kaoAnswer/, `${letter.id}: klavye/dokunma seçimi korunur`);
  }
  assert.ok(text(html).length > 0, 'çiplerin görünür glifleri korunur');
});

check('K3PD-11 kaynak kapsamı: bütün gerçek fonik harfleri tabloda eşleşir; build hedef/çeldiricileri eksiksiz adlandırılır', () => {
  const unsupported = Array.from(phonics.letters).filter((letter) => !SOURCE_NAMES[letter.id]).map((letter) => letter.id).sort();
  assert.deepEqual(unsupported, [], 'her fonik harfin kaynak adı doğrulanmış olmalı');
  const task = build(':unsupported-source-guard');
  assert.ok(task.choices.every((choice) => SOURCE_NAMES[byChar.get(choice.label).id]), 'gerçek build şıklarında kaynak dışı harf yok');
});

check('K3PD-11: kısmi klavye seçimi DOM yeniden çiziminden sonra odağı sıradaki doğru harfe taşır', () => {
  const focusSurface = taskDom();
  const focusHarness = bootKao({ seeded: true, surface: { taskElement: () => focusSurface.node } });
  const focusApi = focusHarness.api, focusTask = build(':focus-restoration');
  focusHarness.data.quranLearn.cards[focusTask.cardId] = { state: 'review', s: 12, reps: 5, due: '2026-09-29T00:00:00.000Z' };
  focusHarness.ui.kaoQueue = [{ id: focusTask.id, cardId: focusTask.cardId, isNew: false }];
  focusHarness.ui.kaoTasks = { [focusTask.id]: focusTask };
  focusHarness.ui.kaoTaskIndex = 0;
  focusHarness.ui.kaoTaskStartedAt = Date.now();
  focusHarness.ui.kaoUndo = null;
  focusHarness.ui.kaoPanel = { open: false };
  focusHarness.ui.kaoOrderDraft = [];
  focusHarness.ui.kaoPaintedId = focusTask.id;
  focusSurface.node.setAttribute('data-task-id', focusTask.id);
  focusSurface.node.innerHTML = focusApi.kaoTaskHTML(focusTask);

  const first = orderedChips(focusTask)[0];
  const focusedBefore = focusSurface.node.buttons.find((button) => button.getAttribute('data-kao-choice-id') === first.choiceId);
  assert.ok(focusedBefore, 'gerçek build düğmesi odak testinde çizilmeli');
  focusedBefore.focus();
  const result = focusApi.kaoAnswer(focusTask.id, first.choiceId);
  assert.equal(result.pending, true, 'ilk doğru harf kısmi seçim olarak kalmalı');
  assert.notEqual(focusSurface.doc.activeElement, focusSurface.doc.body, 'yeniden çizim odağı body üzerinde bırakmamalı');
  assert.equal(focusSurface.doc.activeElement.getAttribute('data-kao-choice-id'), orderedChips(focusTask)[1].choiceId,
    'odak sıradaki gerekli, seçilmemiş gerçek harf çipine gider');
  const selected = focusSurface.node.buttons.find((button) => button.getAttribute('data-kao-choice-id') === first.choiceId);
  assert.equal(selected.getAttribute('aria-pressed'), 'true', 'seçilen çip aria-pressed durumunu korur');
  assert.equal(selected.disabled, true, 'seçilen çip tekrar etkinleştirilemez');
  assert.equal(focusSurface.doc.activeElement.disabled, false, 'odaklanan sonraki çip etkin kalır');
  assert.notEqual(focusSurface.doc.activeElement.focusOptions?.preventScroll, true, 'sonraki çip odağı görünür alana kaydırabilir');
});

check('K3PD-10: gerçek build HTML’si doğrulanmış Türkçe anlam ipucunu gösterir, cevabı sızdırmaz ve kaynaklardan bağımsızdır', () => {
  const task = api.kaoBuildTask({ id: 'k3pd10-hint', cardId: fixture.cardId, isNew: true, retry: true }, t.data, { seed: 'k3pd10-hint' });
  const meaning = fixture.lemma.meanings.find((value) => typeof value === 'string' && value.trim());
  assert.equal(task.kind, 'build');
  assert.equal(task.prompt, `Anlamı: ${meaning}`, 'ipucu doğrulanmış sözlük anlamından gelmeli');
  assert.equal(task.direction, 'tr>ar', 'harf kurma yönü Türkçeden Arapçaya korunmalı');
  assert.equal(task.cardId, fixture.cardId, 'kart kimliği korunmalı');
  assert.equal(task.isNew, true, 'isNew korunmalı');
  assert.equal(task.retry, true, 'retry korunmalı');
  assert.equal(task.arm, 'A', 'merdiven kolu korunmalı');
  const html = api.kaoTaskHTML(task);
  assert.match(html, /<h2 class="kao-question[^\"]*">/, 'ipucu gerçek ve erişilebilir soru başlığında bulunmalı');
  assert.ok(html.includes(meaning), 'ipucu görünür sözlük anlamını taşımalı');
  assert.equal(html.includes(task.answer), false, 'harekeli hedef cevap ilk görünümde bulunmamalı');
  assert.equal(html.includes(bare(task.answer)), false, 'harekesiz hedef cevap ilk görünümde bulunmamalı');

  const altered = { ...task, answer: 'değiştirilmiş hedef cevap', choices: task.choices.map((choice, index) => ({ ...choice, label: `değiştirilmiş şık ${index}` })) };
  const alteredHtml = api.kaoTaskHTML(altered);
  assert.ok(alteredHtml.includes(meaning), 'cevap ve şıklar değişince sözlük ipucu aynı kalmalı');
  assert.equal(alteredHtml.includes(altered.answer), false, 'cevap ipucu olarak kullanılmamalı');
});

check('K3PD-10: verified anlam yoksa cevaplanamaz görev kurmaz ve HTML’de boş başlık göstermez', () => {
  const originalLexicon = t.win.QuranLexiconV1;
  const emptyMeaningLemma = { ...fixture.lemma, meanings: [] };
  t.win.QuranLexiconV1 = Object.assign({}, originalLexicon, {
    byId(id) { return id === fixture.lemma.id ? emptyMeaningLemma : originalLexicon.byId(id); }
  });
  try {
    resetCard();
    const fallback = api.kaoBuildTask({ id: 'k3pd10-empty-meaning', cardId: fixture.cardId, isNew: false }, t.data, { seed: 'k3pd10-empty-meaning' });
    assert.equal(fallback, null, 'hiçbir doğrulanmış anlam kaynağı yoksa içerik uydurmak yerine görev kurulmaz');
    const html = api.kaoTaskHTML(fallback);
    assert.match(html, /Bugünkü oturum tamam/, 'görev yok durumu boş soru yerine güvenli tamamlanma görünümü verir');
    assert.doesNotMatch(html, /<h2 class="kao-question"><\/h2>/, 'boş anlam boş soru başlığına dönüşmez');

    const originalData = t.data.quranLearn, originalUi = JSON.parse(JSON.stringify(t.ui));
    const queuedData = JSON.parse(JSON.stringify(originalData));
    queuedData.cards = { [fixture.cardId]: { state: 'review', s: 12, reps: 5, due: '2026-09-29T00:00:00.000Z' } };
    const dailyBefore = JSON.parse(JSON.stringify(queuedData.daily[t.NOW.slice(0, 10)] || null));
    t.data.quranLearn = queuedData;
    t.win.QuranLexiconV1 = Object.assign({}, originalLexicon, {
      lemmas: [emptyMeaningLemma],
      byId(id) { return id === fixture.lemma.id ? emptyMeaningLemma : null; }
    });
    try {
      const proposed = api.kaoBuildQueue(t.data, new Date(t.NOW), { candidates: [{ id: fixture.cardId, type: 'meaning' }] });
      assert.equal(proposed.length, 1, 'eksik içerikli kart gerçek günlük kuyruğa aday olur');
      const started = api.kaoStart();
      assert.equal(started, t.ui.kaoQueue.length, 'başlatıcı yalnız cevaplanabilir görevleri sayar');
      assert.equal(t.ui.kaoQueue.some((item) => item.cardId === fixture.cardId), false, 'cevaplanamayan kart aktif UI kuyruğundan çıkarılır');
      assert.equal(Object.keys(t.ui.kaoTasks).length, t.ui.kaoQueue.length, 'her kalan kuyruk girdisinin gerçek görevi var');
      for (const item of t.ui.kaoQueue) {
        const html = api.kaoTaskHTML(t.ui.kaoTasks[item.id]);
        assert.doesNotMatch(html, /<h2 class="kao-question"><\/h2>/, 'geçerli kuyrukta boş soru başlığı yok');
      }
      assert.deepEqual(queuedData.cards[fixture.cardId], { state: 'review', s: 12, reps: 5, due: '2026-09-29T00:00:00.000Z' }, 'atlanan kartın FSRS kaydı değişmez');
      assert.deepEqual(queuedData.daily[t.NOW.slice(0, 10)] || null, dailyBefore, 'atlanan kart yanıt veya günlük notlama yazmaz');
    } finally {
      t.data.quranLearn = originalData;
      for (const key of Object.keys(t.ui)) delete t.ui[key];
      Object.assign(t.ui, originalUi);
    }
  } finally {
    t.win.QuranLexiconV1 = originalLexicon;
    resetCard();
  }
});

check('K3PD-10: yalnız verified=true lemma build ipucu üretebilir', () => {
  const originalLexicon = t.win.QuranLexiconV1;
  const unverifiedLemma = { ...fixture.lemma, verified: 1 };
  t.win.QuranLexiconV1 = Object.assign({}, originalLexicon, {
    byId(id) { return id === fixture.lemma.id ? unverifiedLemma : originalLexicon.byId(id); }
  });
  try {
    resetCard();
    const fallback = api.kaoBuildTask({ id: 'k3pd10-unverified', cardId: fixture.cardId, isNew: false }, t.data, { seed: 'k3pd10-unverified' });
    assert.notEqual(fallback.kind, 'build', 'truthy ama doğrulanmamış lemma build edilmez');
    assert.equal(fallback.rung, 'R2', 'doğrulanmamış lemma güvenli R2 görevine düşer');
  } finally {
    t.win.QuranLexiconV1 = originalLexicon;
    resetCard();
  }
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
    // K3P-18: R4 uygunsa cloze; uygun değilse BİR basamak iner (R3) — orada build meşrudur.
    if (rung === 'R4') {
      assert.ok(built.kind === 'cloze' || built.rung === 'R3', `s=${stability} (${arm}): R4 cloze ya da R3 olmalı`);
      assert.notEqual(built.rung, 'R2', `s=${stability} (${arm}): R4'ten iki basamak düşülmez`);
      continue;
    }
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

console.log(`test_k3p_build: PASS (${passed} kontrol — uygunluk, birleşik preview, kaynak adları, sıra/undo, order ayrımı, merdiven)`);
