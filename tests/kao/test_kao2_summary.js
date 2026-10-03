'use strict';

// KAO2-14: ders özeti; sentetik veri, sabit saat ve Node VM. Ağ, tarayıcı ve kullanıcı deposu yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');
const kaoCss = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');

const NOW_MS = Date.parse('2026-09-29T12:00:00.000Z');
class ClockDate extends Date {
  constructor(...args) { super(...(args.length ? args : [NOW_MS])); }
  static now() { return NOW_MS; }
}
const box = { window: {}, Date: ClockDate, Math, Number, String, Object, Array, JSON };
vm.createContext(box);
for (const relative of [
  'app/content/quranLexiconV1.js',
  'app/content/quranGrammarV1.js',
  'app/content/quranShortSurahsV1.js',
  'app/content/quranPhonicsV1.js',
  'app/content/quranCurriculumV2.js',
  'app/core/quranLearnFlow.js',
  'app/core/quranLearnViews.js',
  'app/core/quranLearn.js'
]) vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), box, { filename: relative });

const win = box.window;
const api = win.SeymaQuranLearn;
const curriculum = win.QuranCurriculumV2;
const lexicon = win.QuranLexiconV1;
const today = '2026-09-29';
const now = new ClockDate(NOW_MS);
const unitLesson = curriculum.units[0].lessons[0];
const htmlEscape = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const state = { data: { settings: {}, quranLearn: null }, ui: {}, renders: 0, confetti: 0, animate: true };
win.SeyFx = { shouldAnimate() { return state.animate; } };
win.SeymaHelpers = { confetti() { state.confetti += 1; } };
assert.equal(api.registerQuranLearn({
  data() { return state.data; }, ui() { return state.ui; }, save() {}, render() { state.renders += 1; }, todayStr() { return today; },
  esc: htmlEscape, icon() { return ''; }, getDay() { return {}; }
}), true);
assert.equal(api.registerQuranLearnSurface({
  lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return 'kao-hub-entry'; }, restoreFocus() {},
  sheetClose(_card, _back, close) { close(); }, mount() {}, taskElement() { return null; }, setTimer() { return 1; }, clearTimer() {}, toast() {}
}), true);

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }
function beginSummary(options = {}) {
  state.data = { settings: {}, quranLearn: null };
  state.ui = { kaoOpen: true, kaoView: 'home', kaoStack: [] };
  state.confetti = 0;
  state.animate = options.animate !== false;
  const q = api.ensureQuranLearn(state.data);
  q.onboarding = Object.assign({}, q.onboarding, { doneAt: '2026-09-20T10:00:00.000Z', start: 'level1', minutes: 5 });
  q.settings.dailyNew = 0;
  q.startedAt = options.omitStartedAt ? null : new Date(NOW_MS - (options.daysSinceStart || 0) * 86400000).toISOString();
  q.milestones = {};
  (options.earnedMilestones || []).forEach((key) => { q.milestones[key] = '2026-09-29T11:00:00.000Z'; });
  (options.dueTomorrow || []).forEach((lemma, index) => {
    q.cards[`w:${lemma.id}:ar>tr`] = { state: 'review', s: 4, reps: 2, due: new Date(NOW_MS + 13 * 60 * 60 * 1000 + index * 60000).toISOString() };
  });
  assert.equal(api.kaoLesson('start', unitLesson.id, 'intro'), true);
  const ids = options.wordIds || lexicon.lemmas.slice(0, 12).map((lemma) => lemma.id);
  const record = q.path.lessons[unitLesson.id];
  record.introducedLemmas = ids.slice();
  state.ui.kaoDurableCount = options.durableCount || 0;
  state.ui.kaoLesson.plan = [
    { kind: 'apply', lessonId: unitLesson.id },
    { kind: 'summary', lessonId: unitLesson.id, newLemmaIds: ids.slice() }
  ];
  state.ui.kaoLesson.at = 0;
  state.ui.kaoLesson.phase = 'lesson';
  state.ui.kaoLesson.correct = options.correct == null ? 3 : options.correct;
  state.ui.kaoLesson.answered = options.answered == null ? 4 : options.answered;
  state.ui.kaoLesson.earnedMilestones = options.earnedMilestones || [];
  assert.equal(api.kaoLesson('next'), true);
  return { q, ids, html: () => api.kaoOverlayHTML(now) };
}

check('S-07: Arapça ve anlam listesi en çok 10 kelimeyi gösterir, fazlasını sayar', () => {
  const { ids, html } = beginSummary();
  const output = html();
  assert.equal((output.match(/class="kao-lesson-summary-word\b/g) || []).length, 10);
  assert.match(output, /lang="ar" dir="rtl"/);
  assert.ok(output.includes(lexicon.byId(ids[0]).ar));
  assert.ok(output.includes(lexicon.byId(ids[0]).meanings[0]));
  assert.match(output, /ve 2 daha/);
});

check('S-07: doğruluk, yarının tekrar tahmini ve sıradaki adım gerçek durumdan gelir', () => {
  const due = lexicon.lemmas.slice(20, 22);
  const { html } = beginSummary({ dueTomorrow: due, correct: 3, answered: 4 });
  const output = html();
  assert.match(output, /%75/);
  assert.match(output, /Yarın/);
  // K2F-31: yarının dakikası tekrar + dersin gerçek görev sayısından gelir (eski beklenti ~2 dk, yalnız tekrar + yeni kelime sayısıydı).
  assert.match(output, /2 tekrar kartı · günlük plan ~4 dk/);
  assert.match(output, /Sıradaki adım/);
  assert.ok(output.indexOf('Bu derste tanıştıkların') < output.indexOf('Yarın'));
  assert.ok(output.indexOf('Yarın') < output.indexOf('Sıradaki adım'));
});

check('boş özet yeni kelime ya da doğruluk uydurmaz ve canlı duyuruyu korur', () => {
  const output = beginSummary({ wordIds: [], correct: 0, answered: 0 }).html();
  assert.match(output, /Bu oturumda yeni kelime tanıtılmadı/);
  assert.match(output, /Pekiştirme yanıtı kaydı yok/);
  assert.doesNotMatch(output, /NaN|%0 doğruluk/);
  assert.match(output, /class="kao-lesson-card kao-lesson-summary"[^>]*aria-live="polite"/);
});

check('ilk yedi günde sıfır kalıcı iddiası gizli; sonrasında yalnız pozitif sayaç görünür', () => {
  assert.doesNotMatch(beginSummary({ daysSinceStart: 6, durableCount: 2 }).html(), /kalıcı oldu/);
  assert.doesNotMatch(beginSummary({ daysSinceStart: 8, durableCount: 0 }).html(), /kalıcı oldu/);
  assert.match(beginSummary({ daysSinceStart: 8, durableCount: 2 }).html(), /2 kelime daha kalıcı oldu/);
});

check('ilk ders program başlangıç gününü mevcut KAO alanında kaydeder', () => {
  const { q } = beginSummary({ omitStartedAt: true });
  assert.equal(q.startedAt, new Date(NOW_MS).toISOString());
});

check('tek birincil Bugün yeter eylemi ve ikincil 5 dakika daha eylemi vardır', () => {
  const output = beginSummary().html();
  assert.match(output, /class="kao-primary kao-lesson-next"[^>]*>Bugün yeter<\/button>/);
  assert.match(output, /class="kao-lesson-audio kao-lesson-more"[^>]*>5 dakika daha<\/button>/);
  assert.equal((output.match(/class="kao-primary\b/g) || []).length, 1);
});

check('P10/06: mevcut KAO tokenları dar ekranda sarılır ve ikincil hedef 44 px kalır', () => {
  assert.match(kaoCss, /#root\[data-theme="dark"\] \.kao-dialog/);
  assert.match(kaoCss, /\.kao-lesson-apply-word\{[^}]*grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/);
  assert.match(kaoCss, /\.kao-lesson-audio\{[^}]*min-height:44px/);
  assert.match(kaoCss, /\.kao-lesson-audio:focus-visible[^\{]*\{outline:3px solid var\(--kao-tint\)/);
  assert.match(kaoCss, /@media \(forced-colors:active\)/);
});

check('taş özeti tek kez ve yalnız hareket izninde konfeti üretir', () => {
  const earned = beginSummary({ earnedMilestones: ['fatiha'], animate: true });
  assert.match(earned.html(), /Bir kilometre taşını tamamladın:/);
  assert.equal(state.confetti, 1);
  earned.html();
  assert.equal(state.confetti, 1, 'aynı özet tekrar çizilince yeniden kutlama yok');
  const reduced = beginSummary({ earnedMilestones: ['fatiha'], animate: false });
  assert.match(reduced.html(), /Bir kilometre taşını tamamladın:/);
  assert.equal(state.confetti, 0, 'hareket kapalıyken konfeti yok');
});

check('5 dakika daha dersi tamamlayıp beş dakikaya sığan yeni oturum açar', () => {
  const { q } = beginSummary();
  lexicon.lemmas.slice(30, 45).forEach((lemma, index) => {
    q.cards[`w:${lemma.id}:ar>tr`] = { state: 'review', s: 4, reps: 2, due: new Date(NOW_MS - 3600000 + index).toISOString() };
  });
  assert.equal(api.kaoLesson('more'), true);
  assert.equal(state.ui.kaoLesson, null);
  assert.equal(state.ui.kaoView, 'session');
  assert.ok(q.path.lessons[unitLesson.id].doneAt);
  assert.ok(state.ui.kaoQueue.length > 0, 'öneri gerçek bir tekrar oturumu açmalı');
  const flow = win.SeymaQuranLearnFlow;
  assert.ok(flow.estimateMinutes(q.daily, state.ui.kaoQueue.length, now, 0) <= 5);
});

console.log(`KAO2-14 summary: PASS (${passed} kontrol)`);
