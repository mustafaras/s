'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

let now = Date.parse('2026-09-28T12:00:00.000Z');
class ClockDate extends Date {
  constructor(...args) { super(...(args.length ? args : [now])); }
  static now() { return now; }
}

const sandbox = { window: {}, Date: ClockDate, Math, Number, String, Object, Array, JSON };
vm.createContext(sandbox);
for (const relative of [
  'app/content/quranLexiconV1.js',
  'app/content/quranGrammarV1.js',
  'app/content/quranShortSurahsV1.js',
  'app/content/quranRevelationOrderV1.js',
  'app/content/quranStrikingVersesV1.js',
  'app/content/quranPhonicsV1.js',
  'app/core/quranLearnFlow.js',
  'app/core/quranLearnViews.js',
  'app/core/quranLearn.js'
]) vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), sandbox, { filename: relative });

const api = sandbox.window.SeymaQuranLearn;
const timers = [];
const audioCalls = [];
let data = { quranLearn: { settings: { dailyNew: 10, audio: true, autoAdvance: false } } };
const ui = { kaoQueue: [], kaoTasks: {}, kaoTaskIndex: 0, kaoTaskStartedAt: 0, kaoUndo: null, kaoFeedback: '', kaoAudioFailed: false };
let focusedContinue = 0;
let focusedQuestion = 0;
let questionNode = null;
let headingNode = null;
const taskNode = {
  innerHTML: '', attrs: {},
  setAttribute(name, value) { this.attrs[name] = value; },
  removeAttribute(name) { delete this.attrs[name]; },
  querySelector(selector) {
    if (selector === '.kao-feedback-continue') return { focus() { focusedContinue += 1; } };
    if (selector === '.kao-question' && questionNode) return questionNode;
    if (selector === 'h2' && headingNode) return headingNode;
    return null;
  }
};

assert.equal(api.registerQuranLearn({
  data() { return data; }, ui() { return ui; }, save() {}, render() {},
  todayStr() { return '2026-09-28'; }, esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); },
  icon(name) { return `<i>${name}</i>`; }, getDay() { return {}; }
}), true);
assert.equal(api.registerQuranLearnSurface({
  lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return ''; }, restoreFocus() {},
  sheetClose() {}, mount() {}, taskElement() { return taskNode; },
  createAudio(src) { const audio = { src, preload: '', listeners: {}, addEventListener(name, fn) { this.listeners[name] = fn; }, play() { audioCalls.push(src); return Promise.resolve(); } }; return audio; },
  isQuietTime() { return false; }, setTimer(fn, ms) { timers.push({ fn, ms }); return timers.length; }, clearTimer() {}, toast() {}
}), true);

function freshData(settings = {}) {
  data = { quranLearn: Object.assign(api.emptyQuranLearn(), { settings: Object.assign({ dailyNew: 10, audio: true, autoAdvance: false }, settings) }) };
  api.ensureQuranLearn(data);
  ui.kaoQueue = []; ui.kaoTasks = {}; ui.kaoTaskIndex = 0; ui.kaoTaskStartedAt = now - 800;
  ui.kaoUndo = null; ui.kaoFeedback = ''; ui.kaoOrderDraft = []; ui.kaoPanel = { open: false };
  ui.kaoDurableCount = 0; taskNode.innerHTML = ''; taskNode.attrs = {}; timers.length = 0;
}

function choice(choiceId, label, correct, extra = {}) { return Object.assign({ choiceId, label, correct }, extra); }
function wordTask(id, cardId, options = {}) {
  return Object.assign({
    id, cardId, type: 'word', kind: 'meaning', direction: 'tr>ar', meaning: 'Sözlük anlamı', answer: 'Doğru anlam', isNew: true,
    choices: [choice('right', 'Doğru anlam', true), choice('wrong', 'Yanlış anlam', false), choice('other', 'Başka anlam', false)]
  }, options);
}
function show(task) {
  ui.kaoQueue = [{ id: task.id, cardId: task.cardId, type: task.type, fragmentKind: task.fragmentKind, isNew: task.isNew }];
  ui.kaoTasks = { [task.id]: task }; ui.kaoTaskIndex = 0; ui.kaoTaskStartedAt = now - 800;
  api.kaoTaskHTML(task);
}

freshData();
const primary = wordTask('answer-main', 'w:l_feedback:ar>tr', { clipId: 'w-l_feedback_abcdef', cognate: { tr: 'akran', shift: 'anlam kayması yok' } });
show(primary);
const wrongResult = api.kaoAnswer(primary.id, 'wrong');
assert.equal(wrongResult.correct, false);
assert.equal(ui.kaoTaskIndex, 0, 'cevap indeks artırmadan geri bildirimde kalmalı');
assert.equal(ui.kaoPanel.open, true);
assert.equal(ui.kaoPanel.correct, false);
assert.ok(data.quranLearn.cards[primary.cardId], 'FSRS kartı cevap anında yazılmalı');
assert.equal(data.quranLearn.daily['2026-09-28'].answered, 1, 'günlük sayaç cevap anında yazılmalı');
let html = api.kaoTaskHTML(primary);
assert.match(html, /class="[^"]*kao-choice-correct/);
assert.match(html, /class="[^"]*kao-choice-wrong/);
assert.match(html, /class="[^"]*kao-choice-dim/);
assert.equal((html.match(/<button[^>]*disabled/g) || []).length, 3, 'panel açıkken tüm şıklar devre dışı olmalı');
assert.match(html, /Doğru cevap: Doğru anlam/);
assert.match(html, /akran/);
assert.match(html, /App\.kaoUndo\(\)/);
assert.match(html, /App\.kaoContinue\(\)/);
assert.match(html, /class="kao-task-progress"[^>]*role="progressbar"/);
assert.match(html, /\d+ \/ \d+/);
assert.match(html, /Doğal hız/);
assert.match(html, /onpointerdown=.*350/);
assert.equal(focusedContinue, 1, 'panel açıldığında odak Devam düğmesine taşınmalı');
assert.equal(timers.some((timer) => timer.ms === 3000), false, '3 saniyelik undo zaman aşımı bulunmamalı');

const savedCard = JSON.stringify(data.quranLearn.cards[primary.cardId]);
now += 5000;
assert.equal(api.kaoUndo(), true, 'Geri al panelde zaman aşımı olmadan çalışmalı');
assert.equal(JSON.stringify(data.quranLearn.cards[primary.cardId]), undefined, 'yeni kart geri alınmalı');
assert.equal(data.quranLearn.daily['2026-09-28'], undefined, 'günlük sayaç geri alınmalı');
assert.equal(ui.kaoPanel.open, false);
assert.equal(ui.kaoTaskIndex, 0);

freshData();
data.quranLearn.settings.autoAdvance = true;
const auto = wordTask('answer-auto', 'w:l_auto:ar>tr');
const next = wordTask('next-audio', 'w:l_audio:ar>tr', { clipId: 'w-l_audio_abcdef', isNew: true });
ui.kaoQueue = [
  { id: auto.id, cardId: auto.cardId, type: auto.type, isNew: true },
  { id: next.id, cardId: next.cardId, type: next.type, isNew: true }
];
ui.kaoTasks = { [auto.id]: auto, [next.id]: next }; ui.kaoTaskIndex = 0; ui.kaoTaskStartedAt = now - 800;
assert.equal(api.kaoAnswer(auto.id, 'right').correct, true);
assert.equal(ui.kaoTaskIndex, 0, 'otomatik devam zamanlayana kadar indeks sabit kalmalı');
assert.match(api.kaoTaskHTML(auto), /<h3 class="kao-feedback-title">Doğru<\/h3>/, 'doğru cevapta Doğru bilgisi gösterilmeli');
const advanceTimer = timers.find((timer) => timer.ms === 900);
assert.ok(advanceTimer, 'doğru cevap ve autoAdvance için 900 ms zamanlayıcı olmalı');
advanceTimer.fn();
assert.equal(ui.kaoTaskIndex, 1);
assert.equal(ui.kaoPanel.open, false);
assert.ok(audioCalls.some((src) => src.includes('w-l_audio_abcdef-measured.m4a')), 'Devam mevcut otomatik ses davranışını korumalı');

// K2F-31 (a): cevapta ölçülen süre günlük kayda eklenir (0–120 s ile sınırlı); geri alma günlüğü eski hâline döndürür.
for (const [elapsed, expected] of [[800, 800], [500000, 120000], [-5000, 0]]) {
  freshData();
  const timed = wordTask('answer-ms', 'w:l_ms:ar>tr');
  show(timed); ui.kaoTaskStartedAt = now - elapsed;
  api.kaoAnswer(timed.id, 'right');
  assert.equal(data.quranLearn.daily['2026-09-28'].ms, expected, `${elapsed} ms → ${expected}`);
}
freshData();
const timedTwo = [wordTask('ms-a', 'w:l_msa:ar>tr'), wordTask('ms-b', 'w:l_msb:ar>tr')];
show(timedTwo[0]); ui.kaoTaskStartedAt = now - 1000; api.kaoAnswer('ms-a', 'right');
assert.equal(data.quranLearn.daily['2026-09-28'].ms, 1000);
api.kaoUndo();
assert.equal(data.quranLearn.daily['2026-09-28'], undefined, 'geri alma günlük süreyi de geri alır');

// K2F-30: ayar gerçek handler ile açılır (ayar değişimi görev önbelleğini temizler → önce çevir, sonra göster).
const autoItem = wordTask('answer-toggle', 'w:l_toggle:ar>tr');
freshData();
assert.equal(data.quranLearn.settings.autoAdvance, false);
assert.equal(api.kaoToggleAutoAdvance(), true);
assert.equal(data.quranLearn.settings.autoAdvance, true);
show(autoItem);
assert.equal(api.kaoAnswer(autoItem.id, 'wrong').correct, false);
assert.equal(timers.some((timer) => timer.ms === 900), false, 'yanlış cevapta otomatik devam zamanlayıcısı yok');
freshData();
api.kaoToggleAutoAdvance(); show(autoItem);
assert.equal(api.kaoAnswer(autoItem.id, 'right').correct, true);
assert.ok(timers.some((timer) => timer.ms === 900), 'anahtarla açılan ayar doğru cevapta 900 ms zamanlayıcı kurar');
freshData();
api.kaoToggleAutoAdvance(); api.kaoToggleAutoAdvance(); show(autoItem);
api.kaoAnswer(autoItem.id, 'right');
assert.equal(timers.some((timer) => timer.ms === 900), false, 'kapatılan ayar zamanlayıcı kurmaz');

freshData();
const order = {
  id: 'order-task', cardId: 'fragment:order', type: 'fragment', fragmentKind: 'order', kind: 'order', isNew: true,
  answer: 'bir · iki', choices: [choice('one', 'bir', false, { ordinal: 0 }), choice('two', 'iki', false, { ordinal: 1 })]
};
order.choices[0].correct = false; order.choices[1].correct = false;
show(order);
assert.deepEqual(JSON.parse(JSON.stringify(api.kaoAnswer(order.id, 'one'))), { pending: true });
assert.equal(ui.kaoPanel.open, false, 'order ara seçiminde panel açılmamalı');
assert.equal(ui.kaoTaskIndex, 0);
api.kaoAnswer(order.id, 'two');
assert.equal(ui.kaoPanel.open, true, 'order son seçiminde panel açılmalı');
assert.equal(ui.kaoPanel.correct, true);
assert.equal(ui.kaoTaskIndex, 0);

for (const type of ['delayed', 'link', 'transfer']) {
  freshData();
  let task;
  if (type === 'delayed') task = wordTask('delayed-task', 'surah:112:delayed', { type: 'fragment', fragmentKind: 'delayed', delayedSurahId: 112, answer: 'Doğru çeviri', choices: [choice('right', 'Doğru çeviri', true), choice('wrong', 'Yanlış çeviri', false)] });
  else if (type === 'link') task = wordTask('link-task', 'w:l_link:link', { type: 'link', answer: 'Türkçe akraba', choices: [choice('right', 'Türkçe akraba', true), choice('wrong', 'Başka sözcük', false)] });
  else task = wordTask('transfer-task', 't:verse-1', { type: 'transfer', key: 'verse-1', surah: 'Örnek sûre', answer: 'Doğru çeviri', choices: [choice('right', 'Doğru çeviri', true), choice('wrong', 'Yanlış çeviri', false)] });
  show(task);
  api.kaoAnswer(task.id, 'wrong');
  assert.equal(ui.kaoPanel.open, true, `${type}: panel açılmalı`);
  assert.equal(ui.kaoPanel.correct, false, `${type}: panel doğruluğu tutmalı`);
  assert.equal(ui.kaoPanel.answer, task.answer, `${type}: panel doğru cevabı taşımalı`);
  assert.equal(ui.kaoTaskIndex, 0, `${type}: indeks artmamalı`);
  assert.match(api.kaoTaskHTML(task), /Doğru cevap/);
  assert.ok(api.kaoTaskHTML(task).includes(task.answer), `${type}: panel doğru cevabı göstermeli`);
  assert.equal(api.kaoUndo(), true, `${type}: panel undo çalışmalı`);
  assert.equal(ui.kaoPanel.open, false, `${type}: undo paneli kapatmalı`);
}

freshData();
const normalized = api.ensureQuranLearn({ quranLearn: { settings: { autoAdvance: 'yes' } } });
assert.equal(normalized.settings.autoAdvance, false, 'autoAdvance bozuk/eski veride kapalıya normalize olmalı');

// K2F-28: yeni görev çizilince odak soruya gider; aynı görevin yeniden çizimi odağı çalmaz.
{
  freshData();
  const attrs = {};
  questionNode = { setAttribute(n, v) { attrs[n] = v; }, focus() { focusedQuestion += 1; } };
  const first = wordTask('focus-1', 'w:focus:1');
  show(first); ui.kaoPaintedId = undefined;
  api.kaoAnswer(first.id, 'wrong');
  assert.equal(focusedQuestion, 1, 'yeni görev çizilince odak soruya gitmeli');
  assert.equal(attrs.tabindex, '-1', 'soru programatik odaklanabilir olmalı');
  api.kaoUndo();
  assert.equal(focusedQuestion, 1, 'aynı görevin yeniden çizimi odağı almamalı');
  questionNode = null;
  // "Oturum tamam" ekranında soru yoktur; odak başlığa (h2) düşer.
  const headingAttrs = {};
  headingNode = { setAttribute(n, v) { headingAttrs[n] = v; }, focus() { focusedQuestion += 1; } };
  const second = wordTask('focus-2', 'w:focus:2');
  show(second); ui.kaoPaintedId = undefined;
  api.kaoAnswer(second.id, 'wrong');
  assert.equal(focusedQuestion, 2, 'soru yoksa odak başlığa düşmeli');
  assert.equal(headingAttrs.tabindex, '-1');
  headingNode = null;
}

console.log('KAO2-06 feedback PASS');
