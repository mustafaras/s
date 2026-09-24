'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const relative = 'app/core/quranLearn.js';
const source = fs.readFileSync(path.join(repoRoot, relative), 'utf8');
const appSource = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
const saygiSource = fs.readFileSync(path.join(repoRoot, 'app/core/saygi.js'), 'utf8');
const settingsSource = fs.readFileSync(path.join(repoRoot, 'app/core/settings.js'), 'utf8');
const cssSource = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
const indexSource = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

const sandbox = { window: {}, Date, Math, Number, String, Object, Array, JSON };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranLexiconV1.js'), 'utf8'), sandbox, { filename: 'app/content/quranLexiconV1.js' });
vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranGrammarV1.js'), 'utf8'), sandbox, { filename: 'app/content/quranGrammarV1.js' });
vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranShortSurahsV1.js'), 'utf8'), sandbox, { filename: 'app/content/quranShortSurahsV1.js' });
vm.runInContext(source, sandbox, { filename: relative });
const api = sandbox.window.SeymaQuranLearn;

const quranLearn = {
  settings: { dailyNew: 10 }, cards: {}, units: {}, surahs: {}, daily: {},
  milestones: { fatiha: null, namaz: null, half: null, twoThirds: null, eighty: null, shortSurahs: null },
  ayahs: { understood: [] }
};
const ui = { kaoOpen: false, kaoView: 'home', kaoReturnFocusId: '', kaoQueue: [], kaoTaskIndex: 0, kaoTaskStartedAt: 0, kaoUndo: null, kaoFeedback: '', kaoAudioFailed: false };
let rendered = 0;
assert.equal(api.registerQuranLearn({
  data() { return { quranLearn, settings: { targetBed: '23:00' } }; },
  ui() { return ui; }, save() {}, render() { rendered += 1; },
  todayStr() { return '2026-09-24'; }, esc(value) { return String(value); },
  icon(name) { return `<i>${name}</i>`; }, getDay() { return {}; }
}), true);

let locked = 0;
let unlocked = 0;
let focused = '';
let restored = '';
let mounted = '';
let closeBody = null;
const taskNode = { innerHTML: '', attrs: {}, setAttribute(name, value) { this.attrs[name] = value; }, querySelector() { return null; } };
const audios = [];
assert.equal(api.registerQuranLearnSurface({
  lockBody() { locked += 1; }, unlockBody() { unlocked += 1; },
  focusDialog(id) { focused = id; }, activeElementId() { return 'kao-hub-entry'; },
  restoreFocus(id) { restored = id; },
  sheetClose(card, back, body) { assert.equal(card, 'sey-ov-card'); assert.equal(back, 'sey-ov-back'); closeBody = body; },
  mount(html) { mounted = html; }, taskElement() { return taskNode; },
  createAudio(src) { const audio = { src, preload: '', listeners: {}, addEventListener(name, fn) { this.listeners[name] = fn; }, play() { if (this.listeners.playing) this.listeners.playing(); return Promise.resolve(); } }; audios.push(audio); return audio; },
  isQuietTime() { return false; }, setTimer(fn, ms) { if (ms === 0) fn(); return ms; }, clearTimer() {}
}), true);
assert.equal(api.registerCaffeineTargetBed(() => '23:00'), true);

api.kaoOpen();
assert.equal(ui.kaoOpen, true);
assert.equal(ui.kaoView, 'home');
assert.equal(ui.kaoReturnFocusId, 'kao-hub-entry');
assert.equal(locked, 1);
assert.equal(focused, 'sey-ov-card');
assert.equal(rendered, 1);

const html = api.kaoOverlayHTML(new Date('2026-09-24T22:15:00'));
assert.match(html, /id="sey-ov-back"/);
assert.match(html, /id="sey-ov-card"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*tabindex="-1"/);
assert.match(html, /onkeydown="App\.onModalKeydown\(event,App\.kaoClose\)"/);
assert.match(html, /onclick="App\.kaoClose\(\)"/);
assert.match(html, /Kapsam/i);
assert.match(html, /anlaş/iu);
assert.match(html, /10 yeni/);
assert.match(html, /Gece tekrarı/);
assert.match(html, /App\.kaoStart\(\)/);
assert.match(html, /class="kao-header-mark"[^>]*aria-hidden="true"/);
assert.match(html, /class="kao-hero-rosette"[^>]*aria-hidden="true"/);
assert.match(html, /class="kao-time-chip"/);
assert.match(html, /class="kao-summary-mark"[^>]*aria-hidden="true"/);
assert.doesNotMatch(html, /lang="ar"|dir="rtl"/);

const firstHubHtml = api.kaoHubCardHTML();
assert.match(firstHubHtml, /id="kao-hub-entry"/);
assert.match(firstHubHtml, /Kur’an Arapçası Öğreniyorum/);
assert.match(firstHubHtml, /Kelime<\/b>.*Kök<\/b>.*Gramer<\/b>.*Âyet<\/b>/);
assert.match(firstHubHtml, /class="kao-hub-spine"[^>]*aria-hidden="true"/);
assert.match(firstHubHtml, /class="kao-hub-ornament"[^>]*aria-hidden="true"/);
assert.match(firstHubHtml, /İlk oturum hazır/);
assert.match(firstHubHtml, /onclick="App\.kaoOpen\(\)"[^>]*aria-haspopup="dialog"/);
const firstLemma = sandbox.window.QuranLexiconV1.lemmas[0];
quranLearn.startedAt = '2026-09-24T12:00:00.000Z';
quranLearn.cards[`w:${firstLemma.id}:ar>tr`] = { reps: 2, state: 'review' };
quranLearn.daily['2026-09-24'] = { answered: 3 };
const resumeHubHtml = api.kaoHubCardHTML();
assert.match(resumeHubHtml, /1 kelime tanıdık/);
assert.match(resumeHubHtml, /3 cevap bugün/);
assert.match(resumeHubHtml, /Devam et/);

const shiftLemma = sandbox.window.QuranLexiconV1.lemmas.find((lemma) => lemma.cognate && lemma.cognate.shift);
const otherLemma = sandbox.window.QuranLexiconV1.lemmas.find((lemma) => lemma.id !== shiftLemma.id && lemma.pos === shiftLemma.pos && lemma.root !== shiftLemma.root);
quranLearn.cards[`w:${otherLemma.id}:ar>tr`] = { state: 'review', s: 25, reps: 3 };
const meaningTask = api.kaoBuildTask({ id: 'meaning-task', cardId: `w:${shiftLemma.id}:ar>tr`, isNew: true }, { quranLearn }, { seed: 'render' });
const arabicTask = api.kaoBuildTask({ id: 'arabic-task', cardId: `w:${shiftLemma.id}:tr>ar`, isNew: true }, { quranLearn }, { seed: 'render' });
const meaningHtml = api.kaoTaskHTML(meaningTask);
const arabicHtml = api.kaoTaskHTML(arabicTask);
assert.match(meaningHtml, /Anlamı seç/);
assert.match(meaningHtml, /lang="ar" dir="rtl" data-kao-ar/);
assert.match(arabicHtml, /Arapçayı seç/);
assert.match(arabicHtml, /aria-live="polite"/);
assert.match(arabicHtml, /onpointerdown=.*350/);
assert.match(arabicHtml, /event\.shiftKey\?'flowing':'measured'/);
assert.match(arabicHtml, /kao-cognate is-shift/);
assert.match(arabicHtml, /dikkat/);
assert.match(arabicHtml, /Türkçede var/);

const grammarHtml = api.kaoGrammarCandidates().map((candidate) => {
  const grammarTask = api.kaoBuildGrammarTask({ id: `render:${candidate.id}`, cardId: candidate.id, type: 'grammar', isNew: true }, { quranLearn }, { seed: candidate.id });
  return api.kaoTaskHTML(grammarTask);
}).join('\n');
for (const label of ['Ek çöz', 'Çekim tablosu', 'Kök bul', 'Kalıp eşle']) assert.match(grammarHtml, new RegExp(label));
assert.match(grammarHtml, /class="kao-chip"/);
assert.match(grammarHtml, /aria-live="polite"/);
assert.doesNotMatch(grammarHtml, /<(?:input|textarea|select)\b/i, 'gramer görevleri klavyesiz olmalı');
assert.match(cssSource, /\.kao-choices \.kao-chip\{min-height:44px\}/);

const fragmentCandidates = api.kaoFragmentCandidates();
const orderCandidate = fragmentCandidates.find((item) => item.fragmentKind === 'order');
const translateCandidate = fragmentCandidates.find((item) => item.fragmentKind === 'translate');
assert.ok(orderCandidate && translateCandidate, 'E2 iki parça görevi üretmeli');
const orderItem = { id: 'fragment-order', cardId: orderCandidate.id, type: 'fragment', fragmentKind: 'order', isNew: true };
const translateItem = { id: 'fragment-translate', cardId: translateCandidate.id, type: 'fragment', fragmentKind: 'translate', isNew: true };
const orderTask = api.kaoBuildTask(orderItem, { quranLearn }, { seed: orderItem.id });
const translateTask = api.kaoBuildTask(translateItem, { quranLearn }, { seed: translateItem.id });
assert.equal(orderTask.kind, 'order');
assert.ok(orderTask.choices.length >= 4 && orderTask.choices.length <= 6, 'kelime dizme 4–6 çip olmalı');
const orderHtml = api.kaoTaskHTML(orderTask);
assert.match(orderHtml, /Kelimeleri sırayla seç/);
assert.match(orderHtml, /class="kao-order-target"/);
assert.match(orderHtml, /aria-pressed="false"/);
assert.equal(translateTask.kind, 'translate');
assert.match(api.kaoTaskHTML(translateTask), /Parçayı çevir/);
assert.doesNotMatch(orderHtml, /<(?:input|textarea|select)\b/i, 'parça görevi klavyesiz olmalı');

ui.kaoDurableCount = 3;
const doneHtml = api.kaoTaskHTML(null);
assert.match(doneHtml, /Bugün 3 kelime daha kalıcı oldu/);
assert.match(doneHtml, /Bugün yeter/);
assert.match(doneHtml, /5 dakika daha/);
assert.doesNotMatch(doneHtml, /puan|XP/i);
api.ensureQuranLearn({ quranLearn });
for (const errorClass of ['affix', 'root', 'rule']) {
  const candidate = api.kaoGrammarCandidates().find((item) => api.kaoBuildGrammarTask({ cardId: item.id }, { quranLearn }, { seed: item.id }).errorClass === errorClass);
  const queueItem = { id: `error:${errorClass}`, cardId: candidate.id, type: 'grammar', isNew: true };
  ui.kaoQueue = [queueItem]; ui.kaoTasks = {}; ui.kaoTaskIndex = 0; ui.kaoTaskStartedAt = Date.now(); ui.kaoUndo = null;
  const grammarTask = api.kaoBuildGrammarTask(queueItem, { quranLearn }, { seed: queueItem.id });
  const wrong = grammarTask.choices.find((choice) => !choice.correct);
  const before = quranLearn.errors[errorClass];
  api.kaoAnswer(grammarTask.id, wrong.choiceId);
  assert.equal(quranLearn.errors[errorClass], before + 1, `${errorClass} hata sayacı artmalı`);
}

ui.kaoQueue = [orderItem]; ui.kaoTasks = { [orderItem.id]: orderTask }; ui.kaoTaskIndex = 0; ui.kaoTaskStartedAt = Date.now(); ui.kaoUndo = null; ui.kaoOrderDraft = [];
const wrongOrder = orderTask.choices.slice().sort((a, b) => b.ordinal - a.ordinal);
const orderErrorsBefore = quranLearn.errors.order;
for (const choice of wrongOrder) api.kaoAnswer(orderTask.id, choice.choiceId);
assert.equal(quranLearn.errors.order, orderErrorsBefore + 1, 'SOV/dizilim hatası sıra sınıfına yazılmalı');
assert.match(ui.kaoFeedback, /Fiil önce gelir/);

api.kaoMount(new Date('2026-09-24T22:15:00'));
assert.match(mounted, /id="sey-ov-card"/);
api.kaoSetView('home');
assert.equal(ui.kaoView, 'home');
assert.equal(rendered, 2);
api.kaoClose();
assert.equal(typeof closeBody, 'function');
closeBody();
assert.equal(ui.kaoOpen, false);
assert.equal(unlocked, 1);
assert.equal(restored, 'kao-hub-entry');

assert.match(appSource, /App\.kaoOpen=function\(view\)\{ return window\.SeymaQuranLearn\.kaoOpen\.apply\(null,arguments\); \};/);
assert.match(appSource, /App\.kaoClose=function\(\)\{ return window\.SeymaQuranLearn\.kaoClose\.apply\(null,arguments\); \};/);
assert.match(appSource, /App\.kaoSetView=function\(v\)\{ return window\.SeymaQuranLearn\.kaoSetView\.apply\(null,arguments\); \};/);
for (const name of ['kaoStart', 'kaoAnswer', 'kaoUndo', 'kaoPlay']) assert.match(appSource, new RegExp(`App\\.${name}=function`));
assert.doesNotMatch(settingsSource, /kao-settings-entry|App\.kaoOpen\(\)/, 'geçici Ayarlar girişi kaldırılmalı');
assert.match(appSource, /kaoHubCardHTML:function\(\)\{ return window\.SeymaQuranLearn\?window\.SeymaQuranLearn\.kaoHubCardHTML\(\):''; \}/);
assert.match(saygiSource, /quranHub\(\)\+kaoHub\(\)/, 'Kur’an öğrenme kartı Bugün girişlerinde Kur’an Yolculuğu sonrasında olmalı');
assert.match(indexSource, /app\/kao\.css\?v=\d{8}[a-z]/);
for (const selector of ['.kao-hub-card', '.kao-hub-seal', '.kao-hub-path', '.kao-hub-foot', '.kao-dialog-frame', '.kao-header-mark', '.kao-hero-rosette', '.kao-time-chip']) assert.ok(cssSource.includes(selector), selector);
assert.doesNotMatch(cssSource, /:root\s*\{/);
assert.doesNotMatch(cssSource, /#[0-9a-f]{3,8}\b/i);
const cssVars = [...cssSource.matchAll(/var\((--[a-z0-9-]+)/gi)].map((match) => match[1]);
assert.ok(cssVars.length > 0 && cssVars.every((name) => /^--(?:quran|faith|f-|dur-)/.test(name)), 'KAO CSS yalnız izinli token ailelerini tüketmeli');

const selectorStart = appSource.indexOf('var MODAL_FOCUS_SELECTOR=');
const handlerEnd = appSource.indexOf('\nApp.onReminderKeydown=', selectorStart);
assert.ok(selectorStart >= 0 && handlerEnd > selectorStart, 'ortak modal klavye gövdesi bulunmalı');
const first = { disabled: false, hidden: false, getAttribute() { return null; }, focus() { doc.activeElement = first; } };
const last = { disabled: false, hidden: false, getAttribute() { return null; }, focus() { doc.activeElement = last; } };
const dialog = { querySelectorAll() { return [first, last]; } };
const doc = { activeElement: last };
const keySandbox = { App: {}, document: doc };
vm.createContext(keySandbox);
vm.runInContext(appSource.slice(selectorStart, handlerEnd), keySandbox);
let prevented = 0;
let stopped = 0;
let escaped = 0;
keySandbox.App.onModalKeydown({ key: 'Tab', currentTarget: dialog, shiftKey: false, preventDefault() { prevented += 1; }, stopPropagation() { stopped += 1; } }, () => {});
assert.equal(doc.activeElement, first, 'Tab son öğeden ilk öğeye dönmeli');
doc.activeElement = first;
keySandbox.App.onModalKeydown({ key: 'Tab', currentTarget: dialog, shiftKey: true, preventDefault() { prevented += 1; }, stopPropagation() { stopped += 1; } }, () => {});
assert.equal(doc.activeElement, last, 'Shift+Tab ilk öğeden son öğeye dönmeli');
keySandbox.App.onModalKeydown({ key: 'Escape', currentTarget: dialog, preventDefault() { prevented += 1; }, stopPropagation() { stopped += 1; } }, () => { escaped += 1; });
assert.equal(escaped, 1, 'Escape kapatma callbackini çalıştırmalı');
assert.ok(prevented >= 3 && stopped >= 3);

console.log('KAO render: PASS (hub card, dialog/aria, focus return, grammar/session UI, CSS wiring)');
