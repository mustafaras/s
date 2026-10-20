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
function boredomView(windowValues, { direction = 'ar>tr', translit = true } = {}) {
  const t = bootKao({ seeded: true });
  const q = t.data.quranLearn;
  const id = Object.keys(q.cards).find((key) => new RegExp(`^w:.+:${direction}$`).test(key));
  assert.ok(id, `${direction} yönünde sentetik kelime kartı bulunmalı`);
  q.cards[id] = { state: 'review', s: 6, d: 10, reps: 1, due: '2026-09-30T00:00:00.000Z' };
  q.settings.translit = translit;
  q.readability = { fadeHarakat: true };
  const task = t.api.kaoBuildTask({ id: `k3pd07:${direction}`, cardId: id, isNew: false }, t.data, { seed: `k3pd07:${direction}` });
  if (!translit) {
    task.translit = 'K3PD07-TASK-READING-SENTINEL';
    task.choices.forEach((choice, index) => { if (/[\u0600-\u06ff]/.test(choice.label)) choice.pronunciation = `K3PD07-CHOICE-READING-${index}`; });
  }
  t.ui.kaoWindow = windowValues.slice();
  t.ui.kaoQueue = [{ id: task.id, cardId: id, isNew: false }];
  t.ui.kaoTasks = { [task.id]: task };
  t.ui.kaoTaskIndex = 0;
  t.ui.kaoPanel = { open: false };
  t.ui.kaoOrderDraft = [];
  return { t, task, html: t.api.kaoTaskHTML(task) };
}

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

check('sıkılma yalnız 8 sonuçtan sonra açılır; gerçek okunuş kapalı ve ayar kapalıyken yoktur', () => {
  const beforeThreshold = [
    { label: 'boş pencere', values: [] },
    { label: '1/1', values: [1] },
    { label: '7/7', values: Array(7).fill(1) },
    { label: 'p=.92', values: Array(23).fill(1).concat([0, 0]) }
  ];
  for (const sample of beforeThreshold) {
    const { html } = boredomView(sample.values);
    assert.doesNotMatch(html, /<details class="kao-pronunciation-fold">/, `${sample.label}: gerçek Latin okunuş katlanmamalı`);
    assert.doesNotMatch(html, /class="kao-fade(?: |\")/, `${sample.label}: hareke soldurma kolu açılmamalı`);
  }

  const bored = boredomView(Array(8).fill(1), { direction: 'tr>ar' });
  const arabicChoices = bored.task.choices.filter((choice) => /[\u0600-\u06ff]/.test(choice.label));
  assert.equal(arabicChoices.length, 4, 'dört Arapça seçenek korunur; doğru seçenek gizlenmez');
  const answerButtons = Array.from(bored.html.matchAll(/<button\b[^>]*onclick="App\.kaoAnswer\([^"]*\)"[^>]*>[\s\S]*?<\/button>/g), (match) => ({ html: match[0], end: match.index + match[0].length }));
  assert.equal(answerButtons.length, arabicChoices.length, 'dört cevap düğmesi gerçek görev HTML’sinde var');
  assert.ok(answerButtons.every((button) => !button.html.includes('<details')), 'okunuş disclosure cevap düğmelerinin içinde değil');
  const foldIndex = bored.html.indexOf('<details class="kao-pronunciation-fold">');
  assert.ok(foldIndex >= Math.max(...answerButtons.map((button) => button.end)), 'bağımsız okunuş disclosure cevap düğmelerinden sonra kardeş öğe; summary tıklaması cevap handlerına kabarmaz');
  const folded = bored.html.slice(foldIndex, bored.html.indexOf('</details>', foldIndex));
  assert.ok(folded.includes('<summary>Şıkların okunuşlarını gör</summary>'), 'ilk görünümde yerel açılır başlık kullanılır');
  for (const choice of arabicChoices) {
    assert.ok(folded.includes(choice.label) && folded.includes(choice.pronunciation), 'her gerçek Arapça/okunuş çifti tek katlı disclosure içinde korunur');
  }
  assert.doesNotMatch(folded, /<details[^>]*\sopen(?:\s|>)/, 'okunuş ilk görünümde kapalıdır');
  const ariaLabels = Array.from(bored.html.matchAll(/aria-label="([^"]*)"/g), (match) => match[1]);
  for (const choice of arabicChoices) assert.ok(!ariaLabels.some((label) => label.includes(choice.pronunciation)), 'katlı Latin destek erişilebilir adla sızmaz');
  assert.doesNotMatch(bored.html, /kao-choice-correct|kao-feedback-sheet/, 'yanıt öncesi doğru seçenek veya geri bildirim açığa çıkmaz');

  const disabled = boredomView(Array(8).fill(1), { direction: 'tr>ar', translit: false });
  assert.doesNotMatch(disabled.html, /kao-pronunciation-(?:fold|line)/, 'translit=false iken okunuş DOM düğümü yoktur');
  const disabledArabicChoices = disabled.task.choices.filter((choice) => /[\u0600-\u06ff]/.test(choice.label));
  const disabledAria = Array.from(disabled.html.matchAll(/aria-label="([^"]*)"/g), (match) => match[1]);
  for (const choice of disabledArabicChoices) assert.ok(!disabledAria.some((label) => label.includes(choice.pronunciation)), 'translit=false iken Latin okunuş ARIA içine sızmaz');
  assert.doesNotMatch(disabled.html, /K3PD07-(?:TASK|CHOICE)-READING/, 'translit=false iken benzersiz okunuş metni hiçbir DOM metnine sızmaz');

  const normalSettingsOff = boredomView([], { direction: 'tr>ar', translit: false });
  const normalArabicChoices = normalSettingsOff.task.choices.filter((choice) => /[\u0600-\u06ff]/.test(choice.label));
  const normalAria = Array.from(normalSettingsOff.html.matchAll(/aria-label="([^"]*)"/g), (match) => match[1]);
  for (const choice of normalArabicChoices) assert.ok(!normalAria.some((label) => label.includes(choice.pronunciation)), 'sıkılma kapalıyken de translit=false Latin okunuşu erişilebilir addan çıkarır');
  assert.doesNotMatch(normalSettingsOff.html, /K3PD07-(?:TASK|CHOICE)-READING/, 'sıkılma kapalıyken ayar kapalı okunuş sentinel değerleri HTML içinde yoktur');
});

check('p > %92 (8 sonuç) → şık 4 korunur ve gerçek okunuş katlanır', () => {
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
  const html = api(t).kaoTaskHTML(bore);
  assert.match(html, /<details class="kao-pronunciation-fold">[\s\S]*?<summary>Okunuş<\/summary>/, 'gerçek görev HTML’sinde Latin okunuş kapalı katlanır');
  assert.doesNotMatch(html, /<details class="kao-pronunciation-fold"[^>]*\sopen(?:\s|>)/, 'okunuş kullanıcı açmadan görünmez');
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
