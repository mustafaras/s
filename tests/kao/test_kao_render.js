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
const { legacyDraftState } = require('./helpers/kao-harness');
const cssSource = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
const indexSource = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

const sandbox = { window: {}, Date, Math, Number, String, Object, Array, JSON };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranLexiconV1.js'), 'utf8'), sandbox, { filename: 'app/content/quranLexiconV1.js' });
vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranGrammarV1.js'), 'utf8'), sandbox, { filename: 'app/content/quranGrammarV1.js' });
vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranShortSurahsV1.js'), 'utf8'), sandbox, { filename: 'app/content/quranShortSurahsV1.js' });
vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranRevelationOrderV1.js'), 'utf8'), sandbox, { filename: 'app/content/quranRevelationOrderV1.js' });
vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranStrikingVersesV1.js'), 'utf8'), sandbox, { filename: 'app/content/quranStrikingVersesV1.js' });
vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranPhonicsV1.js'), 'utf8'), sandbox, { filename: 'app/content/quranPhonicsV1.js' });
vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranMahrecSchemasV1.js'), 'utf8'), sandbox, { filename: 'app/content/quranMahrecSchemasV1.js' });
vm.runInContext(legacyDraftState('quranCurriculumV2', fs.readFileSync(path.join(repoRoot, 'app/content/quranCurriculumV2.js'), 'utf8')), sandbox, { filename: 'app/content/quranCurriculumV2.js' });
vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/core/quranLearnFlow.js'), 'utf8'), sandbox, { filename: 'app/core/quranLearnFlow.js' });
vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/core/quranLearnViews.js'), 'utf8'), sandbox, { filename: 'app/core/quranLearnViews.js' });
vm.runInContext(source, sandbox, { filename: relative });
const api = sandbox.window.SeymaQuranLearn;

const quranLearn = {
  settings: { dailyNew: 10 }, cards: {}, units: {}, surahs: {}, daily: {},
  milestones: { fatiha: null, namaz: null, half: null, twoThirds: null, eighty: null, shortSurahs: null },
  ayahs: { understood: [] }
};
const ui = { kaoOpen: false, kaoView: 'home', kaoReturnFocusId: '', kaoQueue: [], kaoTaskIndex: 0, kaoTaskStartedAt: 0, kaoUndo: null, kaoFeedback: '', kaoAudioFailed: false };
const appData = { quranLearn, settings: { targetBed: '23:00' }, quranJourney: { requests: {} } };
let rendered = 0;
assert.equal(api.registerQuranLearn({
  data() { return appData; },
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
let toastMessage = '';
const taskNode = { innerHTML: '', attrs: {}, setAttribute(name, value) { this.attrs[name] = value; }, querySelector() { return null; } };
const audios = [];
assert.equal(api.registerQuranLearnSurface({
  lockBody() { locked += 1; }, unlockBody() { unlocked += 1; },
  focusDialog(id) { focused = id; }, activeElementId() { return 'kao-hub-entry'; },
  restoreFocus(id) { restored = id; },
  sheetClose(card, back, body) { assert.equal(card, 'sey-ov-card'); assert.equal(back, 'sey-ov-back'); closeBody = body; },
  mount(html) { mounted = html; }, taskElement() { return taskNode; },
  createAudio(src) { const audio = { src, preload: '', listeners: {}, addEventListener(name, fn) { this.listeners[name] = fn; }, play() { if (this.listeners.playing) this.listeners.playing(); return Promise.resolve(); } }; audios.push(audio); return audio; },
  isQuietTime() { return false; }, setTimer(fn, ms) { if (ms === 0) fn(); return ms; }, clearTimer() {}, toast(message) { toastMessage = message; }
}), true);
assert.equal(api.registerCaffeineTargetBed(() => '23:00'), true);

// KAO2-11: kartsız ve doneAt boş kullanıcı önce ilk açılışı görür; ana ekran beklentileri ilk açılışı bitirmiş sıfır kullanıcı içindir.
quranLearn.onboarding = { doneAt: '2026-09-24T12:00:00.000Z' };
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
// KAO2-09 (S-02): sıfır kullanıcıda %0 kapsam yerine ilk hedef; tek HeroCard; gece satırı altbilgide.
assert.match(html, /İlk hedef: Fâtiha’yı anlamak · \d+ kelime/);
assert.doesNotMatch(html, /data-countup-key="kao-coverage"/);
assert.match(html, /class="kao-hero-card"/);
assert.match(html, /Fâtiha · Ders 1/, 'ilk açılış sonrası kahraman günlük dersi gösterir');
assert.match(html, /class="kao-hero-foot"[\s\S]*Gece tekrarı/);
assert.match(html, /App\.kaoLesson\("start","u01\.01"\)/);
assert.doesNotMatch(html, /class="(?:kao-dialog-frame|kao-header-mark|kao-hero-rosette|kao-summary-mark|kao-done-mark)"/);
assert.doesNotMatch(html, /lang="ar"|dir="rtl"/);

quranLearn.onboarding.doneAt = null;
assert.match(api.kaoOverlayHTML(new Date('2026-09-24T22:15:00')), /Hoş geldin/, 'ilk açılış yapılmamış sıfır kullanıcı karşılanır');
const firstHubHtml = api.kaoHubCardHTML();
assert.match(firstHubHtml, /id="kao-hub-entry"/);
assert.match(firstHubHtml, /Kur’an Arapçası Öğreniyorum/);
// KAO2-10 (05 §8, Y-01/T-05): hub tek bilgi + tek eylem; sahte yol noktaları yok. KAO-16 okuyucusu Keşfet listesinde keşfedilebilir.
assert.match(api.kaoHomeHTML('2026-09-24T12:00:00'), /App\.kaoOpenSurah\(114\)[\s\S]*?Kısa sûreler/, 'KAO-16 okuyucusu ana ekranda keşfedilebilir olmalı');
assert.doesNotMatch(firstHubHtml, /kao-hub-path|Kelime<\/b>/);
assert.doesNotMatch(firstHubHtml, /class="kao-hub-(?:spine|frame|ornament)"/);
assert.match(firstHubHtml, /Namazda söylediklerini anlamaya başla · 5 dk/);
assert.match(firstHubHtml, /onclick="App\.kaoOpen\(\)"[^>]*aria-haspopup="dialog"/);
const firstLemma = sandbox.window.QuranLexiconV1.lemmas[0];
quranLearn.startedAt = '2026-09-24T12:00:00.000Z';
quranLearn.cards[`w:${firstLemma.id}:ar>tr`] = { reps: 2, state: 'review', s: 21 };
quranLearn.cards[`w:${firstLemma.id}:tr>ar`] = { reps: 2, state: 'review', s: 21 };
quranLearn.daily['2026-09-24'] = { answered: 3 };
const resumeHubHtml = api.kaoHubCardHTML();
// KAO2-10: sayaçlar yerine "bekliyor" durumu — ünite, sıradaki ders ve gerçek süre; eylem "Devam".
assert.match(resumeHubHtml, /Kur’an Arapçası · Ünite \d+/);
assert.match(resumeHubHtml, /Sıradaki: [^<]+ · \d+ dk/);
assert.match(resumeHubHtml, /class="kao-hub-cta">Devam /);
assert.equal(Object.keys(api.kaoKnownLemmaSet(appData)).length, 1, 'iki yönde kalıcı kelime sayılır');

const shiftLemma = sandbox.window.QuranLexiconV1.lemmas.find((lemma) => lemma.cognate && lemma.cognate.shift);
const otherLemma = sandbox.window.QuranLexiconV1.lemmas.find((lemma) => lemma.id !== shiftLemma.id && lemma.pos === shiftLemma.pos && lemma.root !== shiftLemma.root);
quranLearn.cards[`w:${otherLemma.id}:ar>tr`] = { state: 'review', s: 25, reps: 3 };
const meaningTask = api.kaoBuildTask({ id: 'meaning-task', cardId: `w:${shiftLemma.id}:ar>tr`, isNew: true }, { quranLearn }, { seed: 'render' });
const arabicTask = api.kaoBuildTask({ id: 'arabic-task', cardId: `w:${shiftLemma.id}:tr>ar`, isNew: true }, { quranLearn }, { seed: 'render' });
const meaningHtml = api.kaoTaskHTML(meaningTask);
const arabicHtml = api.kaoTaskHTML(arabicTask);
assert.match(meaningHtml, /Anlamı seç/);
assert.match(meaningHtml, /data-kao-ar>.*class="kao-arabic-text" lang="ar" dir="rtl"/);
assert.match(meaningHtml, /class="kao-pronunciation-line"[^>]*>[^<]+<\/span>/);
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
assert.match(cssSource, /\.kao-choices \.kao-chip\{min-height:64px\}/);

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

// KAO-FIX-15 (D-5, R-B5 / 02 §5.3): hareke soldurma yalnız kalıcılaşmış kartta (review ∧ s≥30; task.durable30).
{
  const fadeLemma = sandbox.window.QuranLexiconV1.lemmas.find((lemma) => /[\u064b-\u0652]/.test(lemma.ar));
  const fadeCardId = `w:${fadeLemma.id}:ar>tr`;
  const savedCard = quranLearn.cards[fadeCardId];
  const savedFade = quranLearn.readability.fadeHarakat;
  quranLearn.readability.fadeHarakat = true;
  const fadeHtml = (card) => {
    quranLearn.cards[fadeCardId] = card;
    const task = api.kaoBuildTask({ id: `fade:${card.state}:${card.s}`, cardId: fadeCardId, isNew: false }, { quranLearn }, { seed: 'fade' });
    return { task, html: api.kaoTaskHTML(task) };
  };
  const learning = fadeHtml({ state: 'learning', s: 2, reps: 1, due: '2026-09-20T00:00:00.000Z' });
  assert.equal(learning.task.durable30, false, 'learning kartı durable30 değil');
  assert.doesNotMatch(learning.html, /kao-fade/, 'learning kartında (isNew=false) soldurma yok');
  const young = fadeHtml({ state: 'review', s: 29.9, reps: 4, due: '2026-09-20T00:00:00.000Z' });
  assert.doesNotMatch(young.html, /kao-fade/, 'review s<30 kartında soldurma yok');
  const settled = fadeHtml({ state: 'review', s: 30, reps: 6, due: '2026-09-20T00:00:00.000Z' });
  assert.equal(settled.task.durable30, true, 'review s≥30 kartı durable30');
  assert.match(settled.html, /class="kao-fade/, 'review s≥30 kartında soldurma var');
  quranLearn.readability.fadeHarakat = false;
  assert.doesNotMatch(api.kaoTaskHTML(settled.task), /kao-fade/, 'ayar kapalıyken soldurma yok');
  quranLearn.readability.fadeHarakat = savedFade;
  if (savedCard) quranLearn.cards[fadeCardId] = savedCard; else delete quranLearn.cards[fadeCardId];
}

// KAO-FIX-15 (D-5): kelime görevinde yanlış cevap + hedefte cognate.shift → errors.cognate +1; shift yoksa artmaz.
{
  const answerWrong = (cardId, id) => {
    const queueItem = { id, cardId, isNew: true };
    ui.kaoQueue = [queueItem]; ui.kaoTasks = {}; ui.kaoTaskIndex = 0; ui.kaoTaskStartedAt = Date.now(); ui.kaoUndo = null;
    const task = api.kaoBuildTask(queueItem, { quranLearn }, { seed: id });
    const wrong = task.choices.find((choice) => !choice.correct);
    assert.ok(wrong, `${id}: yanlış seçenek olmalı`);
    return { task, answered: api.kaoAnswer(task.id, wrong.choiceId) };
  };
  const cognateBefore = quranLearn.errors.cognate;
  const shifted = answerWrong(`w:${shiftLemma.id}:ar>tr`, 'error:cognate');
  assert.equal(shifted.task.errorClass, 'cognate');
  assert.equal(quranLearn.errors.cognate, cognateBefore + 1, 'kognat hata sayacı artmalı');
  const plainLemma = sandbox.window.QuranLexiconV1.lemmas.find((lemma) => !(lemma.cognate && lemma.cognate.shift) && lemma.id !== shiftLemma.id);
  const soundBefore = quranLearn.errors.sound;
  answerWrong(`w:${plainLemma.id}:tr>ar`, 'error:plain');
  assert.equal(quranLearn.errors.cognate, cognateBefore + 1, 'kayma yoksa kognat sayacı artmaz');
  assert.equal(quranLearn.errors.sound, soundBefore, 'kelime görevi errors.sound artırmaz (telaffuz → phonics.misheard)');
}

const layeredLemma = sandbox.window.QuranLexiconV1.lemmas.find((lemma) => lemma.root && lemma.cognate && lemma.examples.length >= 3 && sandbox.window.QuranGrammarV1.unit11.roots.some((item) => item.root === lemma.root));
assert.ok(layeredLemma, 'zengin kelime fixture lemması bulunmalı');
const layeredCardId = `w:${layeredLemma.id}:ar>tr`;
quranLearn.cards[layeredCardId] = { state: 'review', s: 24, reps: 4, due: '2026-09-28T12:00:00.000Z' };
assert.equal(api.kaoOpenWord(layeredLemma.id), true);
assert.equal(ui.kaoView, 'word');
// KAO2-25 (02 T-19): katman sayfalaması YOK; tek kaydırmalı detay sayfası.
assert.equal(ui.kaoWordLayer, undefined, 'katman durumu kaldırılmalı');
const wordPage = api.kaoWordHTML();
assert.match(wordPage, new RegExp(layeredLemma.ar));
assert.match(wordPage, new RegExp(layeredLemma.meanings[0]));
assert.match(wordPage, /class="kao-pronunciation"/);
assert.match(wordPage, new RegExp(layeredLemma.translit));
assert.match(wordPage, /Okunuş|DİA okunuşu/);
assert.match(wordPage, /aria-label="[^"]*Arapça telaffuzunu dinle"/);
assert.match(wordPage, /Telaffuzu dinle/);
// Bütün bölümler AYNI sayfada (P10 sırası testi test_kao2_word.js'te).
assert.match(wordPage, /class="kao-word-meanings"/);
assert.match(wordPage, /class="kao-word-root"/);
assert.match(wordPage, /Türkçedeki akrabaları/);
assert.match(wordPage, /class="kao-pattern"/);
assert.equal((wordPage.match(/class="kao-word-example"/g) || []).length, 3);
assert.equal((wordPage.match(/class="kao-example-pronunciation/g) || []).length, 3);
assert.equal((wordPage.match(/Cümlenin okunuşu/g) || []).length, 3);
assert.doesNotMatch(wordPage, /tam okunuşu henüz doğrulanmadı/);
assert.match(wordPage, /Sonraki tekrar/);
assert.doesNotMatch(wordPage, /Katman\s*\d\s*\/\s*3/, 'katman sayacı kalmamalı');
assert.doesNotMatch(wordPage, /kaoWordLayer/, 'katman düğmesi kalmamalı');

const verifiedAyahExample = { ref: '1:5', ar: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' };
assert.equal(api.kaoVerifiedAyahPronunciation(verifiedAyahExample), 'İyyâke na‘büdü ve iyyâke nesteîn.');
assert.equal(api.kaoVerifiedAyahPronunciation({ ref: '2:3', ar: 'وَيُقِيمُونَ ٱلصَّلَوٰةَ' }), '', 'kısmi veya doğrulanmamış âyet için okunuş uydurulmamalı');

const shiftedWord = sandbox.window.QuranLexiconV1.lemmas.find((lemma) => lemma.cognate && lemma.cognate.shift && sandbox.window.QuranGrammarV1.unit11.roots.some((root) => root.root === lemma.root));
assert.ok(shiftedWord);
api.kaoOpenWord(shiftedWord.id);
const shiftedWordHtml = api.kaoWordHTML();
assert.match(shiftedWordHtml, /kao-cognate is-shift/);
assert.match(shiftedWordHtml, /triangle-alert/);
assert.match(shiftedWordHtml, /dikkat/);

api.kaoOpenWord(layeredLemma.id);
assert.match(api.kaoWordHTML(), /Hata bildir/);
assert.equal(api.kaoFlag(layeredCardId, 'meaning'), true);
assert.equal(quranLearn.cards[layeredCardId].flagged.kind, 'meaning');
assert.match(quranLearn.cards[layeredCardId].flagged.at, /^\d{4}-\d{2}-\d{2}T/);
assert.equal(toastMessage, 'Teşekkürler, sonraki içerik sürümünde bakılacak');

const firstUnit = sandbox.window.QuranCurriculumV2.units[0];
assert.equal(api.kaoNav('units'), true);
const pathHtml = api.kaoPathHTML();
assert.equal((pathHtml.match(/class="kao-path-level-section/g) || []).length, 7, 'müfredatın yedi seviyesi görünmeli');
assert.equal((pathHtml.match(/class="kao-path-unit-row/g) || []).length, 12, 'yol, 12 tematik müfredat ünitesini göstermeli');
// K2F-22: Ünite 1 metni draft → yolda ham başlık yok; onaylı (sourced) ünitenin gerçek başlığı görünür.
const approvedPathUnit = sandbox.window.QuranCurriculumV2.units.find((u) => api.kaoReviewLevel(u.review) === 'sourced');
assert.equal(api.kaoReviewLevel(firstUnit.review), 'draft', 'Ünite 1 onaysız');
assert.ok(approvedPathUnit, 'en az bir onaylı ünite metni var');
assert.doesNotMatch(pathHtml, new RegExp(firstUnit.title), 'draft ünite adı yolda sızmaz');
assert.ok(pathHtml.includes(approvedPathUnit.title), 'onaylı ünite adı yolda görünür');
assert.doesNotMatch(pathHtml, /kao-levels|App\.kaoOpenWord|Kilitli/i, 'eski etkisiz kutular ve ilk-kelime rotası kalkmalı');
assert.equal(api.kaoNav('unit', firstUnit.id), true, 'Ünite ayrıntısı gezinme yığınına eklenmeli');
const unitsHtml = api.kaoUnitHTML(firstUnit.id);
// K2F-22: draft ünite vaadi ünite ekranında görünmez.
assert.equal(unitsHtml.includes(firstUnit.promise), false, 'draft ünite vaadi sızmaz');
assert.match(unitsHtml, /Dersler/);
assert.match(unitsHtml, /Kelimeler · \d+/);

const shortSurahs = api.kaoSurahs();
assert.equal(shortSurahs.length, 20, 'E6 tam 20 kısa sûre sunmalı');
assert.equal(api.kaoOpenSurah(114), true);
assert.equal(ui.kaoView, 'reader');
assert.equal(ui.kaoSurahId, 114);
const nasWords = sandbox.window.QuranShortSurahsV1.words.filter((word) => word.surahId === 114);
const nasHtml = api.kaoReaderHTML();
assert.equal((nasHtml.match(/class="kao-reader-word/g) || []).length, nasWords.length);
assert.equal((nasHtml.match(/class="kao-pronunciation-line/g) || []).length, nasWords.length, 'K11: her Arapça okuyucu kelimesinin görünür okunuşu olmalı');
assert.doesNotMatch(nasHtml, /kao-content-error/, 'dondurulmuş 20 sûre okunuş eksiği taşımamalı');
assert.match(nasHtml, /bilinmeyen kelime, dokunarak aç/);
const unknown = nasWords[1];
// KAO2-10: kalıcı sayaç hub'dan kalktı; aynı sayı regex yedeği olmadan doğrudan kaoKnownLemmaSet'ten okunur.
const knownBeforeReveal = Object.keys(api.kaoKnownLemmaSet(appData)).length;
const revealStarted = Date.now();
// T-20/KAO2-19: anlam artık kelime İÇİNDE değil ALT PANELDE açılır; panel okuyucu
// eylemiyle açılır (çıplak kaoRevealWord paneli açmaz).
assert.equal(api.kaoReader('word', 1), true);
assert.match(quranLearn.surahs['114'].words[unknown.id].revealedAt, /^\d{4}-\d{2}-\d{2}T/);
assert.equal(quranLearn.surahs['114'].words[unknown.id].status, 'unknown');
assert.ok(new Date(quranLearn.cards[`w:${unknown.lemmaId}:ar>tr`].due).getTime() >= revealStarted + 86400000 - 1000, 'bilinmeyen kelime yarın kuyruğuna alınmalı');
assert.equal(Object.keys(api.kaoKnownLemmaSet(appData)).length, knownBeforeReveal, 'yarın kuyruğundaki bilinmeyen kelime kalıcı sayacını artırmamalı');
assert.match(api.kaoReaderHTML(), new RegExp(unknown.tr));
assert.equal(api.kaoOpenSurah(98), true);
const waqfHtml = api.kaoReaderHTML();
const surah98Marks = sandbox.window.QuranShortSurahsV1.waqfMarks.filter((mark) => mark.afterWordId.startsWith('s-98-'));
assert.equal((waqfHtml.match(/class="kao-waqf"/g) || []).length, surah98Marks.length);
assert.match(waqfHtml, /burada dur: cümle\/anlam sınırı/);
const understoodStarted = Date.now();
assert.equal(api.kaoMarkUnderstood(), true);
assert.match(quranLearn.surahs['98'].understoodAt, /^\d{4}-\d{2}-\d{2}T/);
assert.ok(new Date(quranLearn.surahs['98'].delayedTestAt).getTime() >= understoodStarted + 7 * 86400000 - 1000);
assert.equal(quranLearn.surahs['98'].delayedScore, null);

const gateTasks = api.kaoGateTasks();
assert.equal(gateTasks.reading.length, 20, 'giriş kontrolü 20 okunuş sorusu taşımalı');
assert.equal(gateTasks.listening.length, 12, 'giriş kontrolü 12 minimal çift taşımalı');
assert.equal(gateTasks.lessons.length, 12, 'Seviye 0 tam 12 mini ders taşımalı');
assert.ok(gateTasks.lessons.every((lesson) => lesson.sounds.length <= 3), 'ders başına en çok üç yeni ses olmalı');
const colored = api.kaoColorHarakat('بَ بِ بُ');
assert.equal(colored.replace(/<[^>]+>/g, ''), 'بَ بِ بُ', 'hareke sarıcı metni değiştirmemeli');
for (const className of ['kao-h-fatha', 'kao-h-kesra', 'kao-h-damma']) assert.match(colored, new RegExp(className));

assert.equal(api.kaoGate('start'), true);
assert.equal(ui.kaoView, 'gate');
assert.equal(ui.kaoGatePhase, 'reading');
for (const task of gateTasks.reading) assert.equal(api.kaoGate('answer', task.answer), true);
assert.equal(ui.kaoGatePhase, 'listening');
for (const task of gateTasks.listening.slice(0, 10)) assert.equal(api.kaoGate('answer', task.answer), true);
for (const task of gateTasks.listening.slice(10)) assert.equal(api.kaoGate('answer', 'wrong'), true);
assert.equal(quranLearn.gate.passed, true);
assert.equal(quranLearn.gate.skipped, true);
assert.equal(quranLearn.gate.score, 30);
assert.match(quranLearn.gate.at, /^\d{4}-\d{2}-\d{2}T/);

quranLearn.gate = { passed: false, skipped: false, score: null, at: null };
api.kaoGate('start');
for (const task of gateTasks.reading.slice(0, 18)) api.kaoGate('answer', task.answer);
for (const task of gateTasks.reading.slice(18)) api.kaoGate('answer', 'wrong');
ui.kaoAudioFailed = true;
assert.equal(api.kaoGate('audio-unavailable'), true);
assert.equal(quranLearn.gate.passed, true, 'ses yüklenemezse 18/20 okuma kapıyı geçirmeli');
assert.equal(quranLearn.gate.skipped, false, 'ses bölümü ertelenmiş olarak kalmalı');
assert.match(api.kaoGateHTML(), /ilk ses erişiminde|ertelendi/i);

assert.equal(api.kaoGate('readability', { lineHeight: '2.5', wordSpacing: 'wide', coloredHarakat: false }), true);
assert.equal(quranLearn.readability.lineHeight, '2.5');
assert.equal(quranLearn.readability.wordSpacing, 'wide');
assert.equal(quranLearn.readability.coloredHarakat, false);
assert.match(api.kaoReadabilityStyle(), /--kao-ar-lh:2\.5/);
assert.match(api.kaoReadabilityStyle(), /--kao-ar-ws:\.18em/);
assert.match(api.kaoGateHTML(), /İstersen hızlıca hatırlayalım/);

api.kaoMount(new Date('2026-09-24T22:15:00'));
assert.match(mounted, /id="sey-ov-card"/);
const renderedBeforeHome = rendered;
api.kaoSetView('home');
assert.equal(ui.kaoView, 'home');
assert.equal(rendered, renderedBeforeHome + 1);
api.kaoClose();
assert.equal(typeof closeBody, 'function');
closeBody();
assert.equal(ui.kaoOpen, false);
assert.equal(unlocked, 1);
assert.equal(restored, 'kao-hub-entry');

assert.match(appSource, /App\.kaoOpen=function\(view\)\{ return window\.SeymaQuranLearn\.kaoOpen\.apply\(null,arguments\); \};/);
assert.match(appSource, /App\.kaoClose=function\(\)\{ return window\.SeymaQuranLearn\.kaoClose\.apply\(null,arguments\); \};/);
assert.match(appSource, /App\.kaoSetView=function\(v\)\{ return window\.SeymaQuranLearn\.kaoSetView\.apply\(null,arguments\); \};/);
for (const name of ['kaoStart', 'kaoAnswer', 'kaoContinue', 'kaoUndo', 'kaoPlay', 'kaoOpenWord', 'kaoFlag', 'kaoGate', 'kaoOpenSurah', 'kaoRevealWord', 'kaoMarkUnderstood']) assert.match(appSource, new RegExp(`App\\.${name}=function`));
assert.doesNotMatch(settingsSource, /kao-settings-entry|App\.kaoOpen\(\)/, 'geçici Ayarlar girişi kaldırılmalı');
assert.match(appSource, /kaoHubCardHTML:function\(\)\{ return window\.SeymaQuranLearn\?window\.SeymaQuranLearn\.kaoHubCardHTML\(\):''; \}/);
assert.match(saygiSource, /function arabicLearningHTML\(\)[\s\S]*?kaoHub\(\)[\s\S]*?function saygiPreviewHubHTML/, 'KAO hub kartı yeni Arapça öğrenme sayfasında mevcut ilerlemeyi sunmalı');
assert.match(saygiSource, /tab==='arapca'\)body=arabicLearningHTML\(\)/, 'Arapça navigasyonu kurs sayfasını açmalı');
assert.doesNotMatch(saygiSource, /quranHub\(\)\+kaoHub\(\)/, 'küçük KAO kartı Bugün Kur’an girişine karışmamalı');
assert.match(indexSource, /app\/kao\.css\?v=\d{8}[a-z]/);
for (const selector of ['.kao-hub-card', '.kao-hub-seal', '.kao-hub-path', '.kao-hub-foot', '.kao-time-chip', '.kao-unit-card', '.kao-word-hero', '.kao-root-tree', '.kao-word-example', '.kao-gate', '.kao-h-fatha', '.kao-h-kesra', '.kao-h-damma', '.kao-reader', '.kao-reader-word', '.kao-waqf']) assert.ok(cssSource.includes(selector), selector);
assert.doesNotMatch(cssSource, /:root\s*\{/);
assert.doesNotMatch(cssSource, /#[0-9a-f]{3,8}\b/i);
const cssVars = [...cssSource.matchAll(/var\((--[a-z0-9-]+)/gi)].map((match) => match[1]);
assert.ok(cssVars.length > 0 && cssVars.every((name) => /^(?:--(?:quran|faith|f-|dur-|kao-ar-)|--kao-(?:bg|surface|label(?:-2)?|sep|tint|accent|ok(?:-bg)?|fix(?:-bg)?|r-(?:card|ctl|pill)|gutter|gap-[1-4]|row))/.test(name)), 'KAO CSS yalnız izinli token ailelerini veya kartın okunabilirlik değişkenlerini tüketmeli');

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


// KAO-26 · E8 Telaffuz stüdyosu render sözleşmesi.
{
  const constantsBox = { window: {} };
  vm.createContext(constantsBox);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/core/constants.js'), 'utf8'), constantsBox);
  const iconNames = new Set(Object.keys(constantsBox.window.SeymaConstants.ICONS));
  const usedIcons = [...new Set([...source.matchAll(/icon\('([a-z0-9-]+)'/g)].map((match) => match[1]))];
  assert.deepEqual(usedIcons.filter((name) => !iconNames.has(name)), [], 'KAO kullandığı her ikon ikon haritasında olmalı (simge + metin)');
  ui.kaoOpen = true; ui.kaoAudioFailed = false;
  assert.equal(api.kaoOpenPhonics(), true);
  assert.equal(ui.kaoView, 'phonics');
  const phonicsHome = api.kaoOverlayHTML('2026-09-25T10:00:00');
  assert.match(phonicsHome, /aria-labelledby="kao-phonics-title"/);
  assert.match(phonicsHome, /Kova B · Yakın ama farklı[\s\S]*Kova C · Türkçede yok/);
  const bcLetters = sandbox.window.QuranPhonicsV1.letters.filter((letter) => letter.bucket === 'B' || letter.bucket === 'C');
  assert.equal((phonicsHome.match(/App\.kaoPhonics\('lesson','/g) || []).length, bcLetters.length, 'her B/C harfinin dersi');
  assert.match(phonicsHome, /App\.kaoPhonics\('start'\)/); assert.match(phonicsHome, /App\.kaoPhonics\('silent'\)/);
  assert.match(api.kaoHomeHTML('2026-09-25T10:00:00'), /App\.kaoOpenPhonics\(\)/, 'E1 ana ekrandan stüdyo girişi');
  assert.equal(api.kaoOpenPhonics('ayn'), true);
  const lesson = api.kaoPhonicsHTML();
  assert.match(lesson, /<span class="kao-mahrec"><svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]*role="img" fill="currentColor"><title>/, 'R-B6: inline SVG currentColor');
  assert.doesNotMatch(lesson, /<img/);
  assert.match(lesson, /Karıştırılan çift/); assert.match(lesson, /kao-pronunciation-line/);
  assert.match(cssSource, /\.kao-mahrec\{display:block;color:var\(--quran-mid\)\}/, 'SVG rengi tema tokenından');
  api.kaoPhonics('start');
  const taskHtml = api.kaoPhonicsHTML();
  assert.match(taskHtml, /id="kao-phonics-task"/); assert.match(taskHtml, /App\.kaoPhonics\('play'\)/); assert.match(taskHtml, /aria-live="polite"/);
  assert.match(taskHtml, /Sessiz devam et/);
  for (const name of ['kaoOpenPhonics', 'kaoPhonics']) assert.match(appSource, new RegExp(`App\\.${name}=function\\([^)]*\\)\\{ return window\\.SeymaQuranLearn\\.${name}\\.apply\\(null,arguments\\); \\};`));
  ui.kaoPhonics = { phase: 'home' }; ui.kaoView = 'home'; ui.kaoOpen = false;
}

// KAO-FIX-26 (10 §9, KF-6): kova B/C algı doğruluğu (phonics.buckets) ve gölgeleme "Yakın" öz-değerlendirme oranı
// (phonics.self) kaydedilir; telaffuz stüdyosu ana ekranında raporlanır (hedef ≥%85; puan değil).
{
  const bucketOf = (id) => (sandbox.window.QuranPhonicsV1.letters.find((letter) => letter.id === id) || {}).bucket;
  quranLearn.phonics.buckets = undefined; quranLearn.phonics.self = undefined;
  ui.kaoPhonics = { phase: 'home' };
  api.kaoPhonics('start');
  const expected = { B: { n: 0, ok: 0 }, C: { n: 0, ok: 0 } };
  let flip = true;
  for (let guard = 0; guard < 40 && ui.kaoPhonics.phase === 'task'; guard += 1) {
    const st = ui.kaoPhonics, task = st.tasks[st.index];
    if (task.kind === 'order') { for (const id of task.order) api.kaoPhonics('answer', id); continue; }
    const choice = task.choices.find((item) => item.correct === flip);
    const bucket = task.targetLetter ? bucketOf(task.targetLetter) : null;
    if (bucket === 'B' || bucket === 'C') { expected[bucket].n += 1; if (flip) expected[bucket].ok += 1; }
    api.kaoPhonics('answer', choice.id); flip = !flip;
  }
  const recorded = JSON.parse(JSON.stringify(quranLearn.phonics.buckets || {}));
  assert.ok(expected.B.n + expected.C.n > 0, 'fixture: B/C algı görevi var');
  for (const bucket of ['B', 'C']) if (expected[bucket].n) assert.deepEqual(recorded[bucket], expected[bucket], `kova ${bucket} algı doğruluğu kaydı`);
  ui.kaoShadow = { phase: 'recorded', clipId: 'w-test' };
  api.kaoRecordDiscard('near');
  ui.kaoShadow = { phase: 'recorded', clipId: 'w-test' };
  api.kaoRecordDiscard();
  assert.deepEqual(JSON.parse(JSON.stringify(quranLearn.phonics.self)), { near: 1, n: 2 }, 'Yakın öz-değerlendirme sayacı');
  ui.kaoPhonics = { phase: 'home' };
  const report = api.kaoPhonicsHTML();
  assert.match(report, /Algı doğruluğu/); assert.match(report, /hedef ≥%85/);
  if (expected.B.n) assert.ok(report.includes(`Kova B: %${Math.round(expected.B.ok / expected.B.n * 100)} (${expected.B.n})`), 'kova B oranı');
  assert.match(report, /Yakın: 1 \/ 2/, 'Yakın oranı raporu, puan değil');
  assert.deepEqual(JSON.parse(JSON.stringify(api.ensureQuranLearn({ quranLearn: { phonics: { buckets: { B: { n: 'x', ok: 9 }, Z: 1 }, self: { near: 5, n: 2 } } } }).phonics)).buckets, { B: { n: 0, ok: 0 }, C: { n: 0, ok: 0 } }, 'bozuk kova kaydı normalleşir');
  ui.kaoPhonics = { phase: 'home' }; ui.kaoShadow = null;
}


// KAO-28b · E10 Mushaf ısı haritası render sözleşmesi (R-B1).
{
  const mapData = { quranLearn: { cards: {}, ayahs: { understood: ['112:1', '112:2', '112:2', '1:1', '1:9', 'x:1', '114:1'] }, surahs: {
    '112': { understoodAt: '2026-09-10T10:00:00.000Z', delayedTestAt: '2026-09-17T10:00:00.000Z', delayedScore: 5, confirmedAt: '2026-09-17T10:05:00.000Z' },
    '114': { understoodAt: '2026-09-10T10:00:00.000Z', delayedTestAt: '2026-09-17T10:00:00.000Z', delayedScore: 2, needsReread: true },
    '113': { understoodAt: '2026-09-24T10:00:00.000Z', delayedTestAt: '2026-10-01T10:00:00.000Z', delayedScore: null } } } };
  const saved = appData.quranLearn; appData.quranLearn = mapData.quranLearn;
  // KAO2-24 (S-12): ayrı harita görünümü kaldırıldı; harita artık İlerleme ekranının bölümü.
  ui.kaoOpen = true; assert.equal(api.kaoOpenMap(), true); assert.equal(ui.kaoView, 'stats', 'harita İlerleme bölümüdür');
  const mapHtml = api.kaoStatsHTML('2026-09-25T10:00:00');
  const cells = [...mapHtml.matchAll(/class="kao-map-cell" data-l="(\d)" aria-label="([^"]+)"/g)];
  assert.equal(cells.length, 114, '114 hücre');
  assert.ok(cells.every((match) => /^.+: %\d{1,3} anlaşıldı$/.test(match[2])), 'aria-label "Sûre adı: %n anlaşıldı"');
  const byName = (name) => cells.find((match) => match[2].startsWith(name + ':'));
  assert.equal(byName('Fâtiha')[2], 'Fâtiha: %14 anlaşıldı', 'geçersiz âyet no (1:9) sayılmaz; 1/7'); assert.equal(byName('Fâtiha')[1], '1');
  assert.equal(byName('İhlâs')[1], '5', 'gecikmeli testi 5/5 geçen sûre koyu'); assert.equal(byName('İhlâs')[2], 'İhlâs: %100 anlaşıldı');
  assert.equal(byName('Nâs')[1], '1', 'testi geçemeyen sûre koyulaşmaz');
  assert.ok(Number(byName('Felak')[1]) >= 1, 'Anladım kaydı olan sûre veri sayılır');
  assert.equal(byName('Bakara')[1], '0', 'veri yoksa boş'); assert.match(mapHtml, /aria-label="Bakara: %0 anlaşıldı"[^>]*role="img"><small>2<\/small><b><\/b>/);
  assert.match(mapHtml, /aria-label="İhlâs: %100 anlaşıldı"[^>]*onclick="App\.kaoOpenSurah\(112\)"><small>112<\/small><b>%100<\/b>/, 'renk + sayı; kısa sûre okuyucuya açılır');
  assert.match(mapHtml, /<li value="112">İhlâs — %100 anlaşıldı \(2 \/ 4 âyet\) · gecikmeli test 5\/5 · kesinleşti<\/li>/, 'eşdeğer metin listesi');
  assert.match(mapHtml, /<li value="114">Nâs — %\d+ anlaşıldı \(1 \/ 6 âyet\) · gecikmeli test 2\/5 · tekrar oku<\/li>/);
  assert.match(mapHtml, /110 sûrede henüz veri yok/);
  // KAO2-24: harita ana ekrandan kalktı ve İlerleme ekranının İÇİNE girdi (ayrı görünüm yok).
  assert.doesNotMatch(api.kaoHomeHTML('2026-09-25T10:00:00'), /App\.kaoOpenMap\(\)/, 'S-02 ana ekranda harita satırı yok');
  assert.doesNotMatch(api.kaoStatsHTML('2026-09-25T10:00:00'), /App\.kaoOpenMap\(\)/, 'harita girişi yerine harita gömülü');
  assert.equal([...api.kaoStatsHTML('2026-09-25T10:00:00').matchAll(/class="kao-map-cell"/g)].length, 114, 'İlerleme içinde 114 hücre');
  assert.match(appSource, /App\.kaoOpenMap=function\(\)\{ return window\.SeymaQuranLearn\.kaoOpenMap\.apply\(null,arguments\); \};/);
  assert.match(cssSource, /\.kao-map-cell\[data-l="5"\],\.kao-map-legend i\[data-l="5"\]\{background:var\(--quran-mid\);color:var\(--quran-surface\)\}/);
  appData.quranLearn = saved; ui.kaoView = 'home'; ui.kaoOpen = false;
}


// KAO-16b · E11 Namazda ne diyorum (R-B2).
{
  const prayers = sandbox.window.QuranShortSurahsV1.prayerTexts;
  assert.deepEqual(Array.from(prayers, (item) => item.id), ['tekbir', 'subhaneke', 'fatiha', 'zamm_sure', 'ruku', 'secde', 'tahiyyat', 'selam'], 'rekât sırası');
  const lex = sandbox.window.QuranLexiconV1;
  const knownLemma = prayers[0].words[0].lemmaId; // Allah
  // KAO-FIX-07 (02 §3): açık kelime = iki yönde review ∧ s≥21.
  const prayerData = { quranLearn: { cards: { [`w:${knownLemma}:ar>tr`]: { reps: 2, state: 'review', s: 21 }, [`w:${knownLemma}:tr>ar`]: { reps: 2, state: 'review', s: 21 } }, ayahs: { understood: [] } } };
  const saved = appData.quranLearn; appData.quranLearn = prayerData.quranLearn;
  ui.kaoOpen = true; assert.equal(api.kaoOpenPrayer(), true); assert.equal(ui.kaoView, 'prayer');
  let html = api.kaoOverlayHTML('2026-09-25T10:00:00');
  assert.match(html, /aria-labelledby="kao-prayer-title"/);
  const titles = [...html.matchAll(/<h3 id="kao-prayer-[a-z_]+"><span>(\d)<\/span> ([^<]+)<\/h3>/g)].map((match) => match[2]);
  assert.deepEqual(titles, Array.from(prayers, (item) => item.title), '8 satır prayerTexts sırasında');
  const total = prayers.reduce((sum, item) => sum + item.words.length, 0);
  const openCount = prayers.reduce((sum, item) => sum + item.words.filter((word) => word.lemmaId === knownLemma).length, 0);
  assert.match(html, new RegExp(`${openCount} / ${total} kelime açık`), 'açık/kapalı oranı data.quranLearn’den');
  assert.equal((html.match(/kao-prayer-word is-known/g) || []).length, openCount);
  assert.equal((html.match(/kao-prayer-word is-closed/g) || []).length, total - openCount, 'bilinmeyen kapalı');
  assert.doesNotMatch(html, /kao-content-error/, 'her namaz kelimesinin doğrulanmış okunuşu var');
  const closedIndex = prayers[1].words.findIndex((word) => word.lemmaId !== knownLemma);
  const closed = prayers[1].words[closedIndex];
  assert.equal(api.kaoPrayerWord(1, closedIndex), true);
  const card = prayerData.quranLearn.cards[`w:${closed.lemmaId}:ar>tr`];
  assert.ok(card && card.readerUnknown === true && card.tomorrowReason === 'prayer_unknown' && card.state === 'learning', 'kapalı kelime yarının kuyruğuna');
  html = api.kaoPrayerHTML();
  assert.match(html, /kao-prayer-word is-revealed/); assert.ok(html.includes(closed.tr)); assert.match(html, /yarınki tekrarına eklendi/);
  assert.equal(api.kaoPrayerWord(99, 0), false);
  assert.equal(api.kaoPrayerWord(0, 0), true, 'bilinen kelime → kelime kartı köprüsü'); assert.equal(ui.kaoView, 'word');
  assert.match(api.kaoHomeHTML('2026-09-25T10:00:00'), /App\.kaoOpenPrayer\(\)/, 'hub → E1 girişi');
  // E3 tek satırlık Seviye 1 önerisi yalnız Ünite 1–3 review iken.
  const unitEnd = Math.floor(3 * lex.lemmas.length / 12);
  assert.equal(api.kaoLevel1Ready({ quranLearn: { cards: {} } }), false);
  const level1 = { quranLearn: { cards: Object.fromEntries(lex.lemmas.slice(0, unitEnd).map((lemma) => [`w:${lemma.id}:tr>ar`, { state: 'review', reps: 3 }])) } };
  assert.equal(api.kaoLevel1Ready(level1), true);
  delete level1.quranLearn.cards[`w:${lex.lemmas[unitEnd - 1].id}:tr>ar`];
  assert.equal(api.kaoLevel1Ready(level1), false, 'tek eksik kart yeter');
  appData.quranLearn = Object.assign({}, prayerData.quranLearn, { cards: Object.fromEntries(lex.lemmas.slice(0, unitEnd).map((lemma) => [`w:${lemma.id}:tr>ar`, { state: 'review', reps: 3 }])) });
  assert.equal((api.kaoTaskHTML(null).match(/App\.kaoOpenPrayer\(\)/g) || []).length, 1, 'E3 tek satır');
  appData.quranLearn = { cards: {} };
  assert.doesNotMatch(api.kaoTaskHTML(null), /kaoOpenPrayer/);
  for (const name of ['kaoOpenPrayer', 'kaoPrayerWord']) assert.match(appSource, new RegExp(`App\\.${name}=function\\([^)]*\\)\\{ return window\\.SeymaQuranLearn\\.${name}\\.apply\\(null,arguments\\); \\};`));
  appData.quranLearn = saved; ui.kaoView = 'home'; ui.kaoOpen = false;
}


// KAO-18 · 44 px dokunma hedefi, odak halkası ve WCAG kontrast denetimi (R-A9).
{
  const rules = [...cssSource.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({ selectors: match[1].split(',').map((item) => item.trim()), body: match[2] }));
  const kaoRow = Number((cssSource.match(/--kao-row:(\d+)px/) || [])[1]) || 0;
  const target = (selector) => { let size = null; for (const rule of rules) if (rule.selectors.includes(selector)) { const match = rule.body.match(/(?:^|;)\s*(?:min-height|height)\s*:\s*(?:(\d+)px|var\(--kao-row\))/); if (match) size = match[1] ? Number(match[1]) : kaoRow; } return size; };
  const buttonClasses = [...new Set([...source.matchAll(/<button[^>]*class="([a-z0-9 -]+)/g)].flatMap((match) => match[1].split(' ')).filter((name) => name.startsWith('kao-')))];
  const inherited = { 'kao-chip': '.kao-choices button', 'kao-level1': '.kao-link-button', 'kao-map-cell': '.kao-map-cell' };
  const small = buttonClasses.filter((name) => !((target('.' + name) || target(inherited[name] || '')) >= 44));
  assert.deepEqual(small, [], '44 px altı düğme sınıfı yok');
  for (const selector of ['.kao-choices button', '.kao-seg button', '.kao-surah-picker button', '.kao-ph-letters button', '.kao-ayah-words button', '.kao-ph-attention li button', '.kao-lesson-grid button', '.kao-readability button', '.kao-flag button', '.kao-navbar-action', '.kao-focus-exit', '.kao-waqf']) assert.ok(target(selector) >= 44, `${selector} ≥44 px`);
  assert.match(cssSource, /\.kao-fade\{[^}]*min-width:44px;min-height:44px/, 'soldurma dokunma hedefi');
  assert.match(cssSource, /\.kao-hub-card:focus-visible,\.kao-dialog button:focus-visible\{outline:3px solid var\(--quran-mid\);outline-offset:3px\}/, 'odak halkası görünür ve kontrastlı');
  assert.doesNotMatch(cssSource, /var\(--quran-gold-ink\)/, 'koyu temada okunmayan gold-ink metin rengi kullanılmaz');
  // %200 metin / 320 px yeniden akış (statik): metin satırı zorlanmaz, akıştaki sabit genişlikler 320 − 2×16 px içinde kalır,
  // yazı boyutları rem/token tabanlıdır (metin büyütmeyle ölçeklenir), sayı taşıyan rozetler büyüyebilir.
  assert.doesNotMatch(cssSource, /white-space:nowrap/, 'KAO metni tek satıra zorlanmaz');
  const flowWidths = rules.filter((rule) => !rule.selectors.every((item) => /::(?:before|after)/.test(item)) && !/position:absolute/.test(rule.body)).flatMap((rule) => [...rule.body.matchAll(/(?:^|;)\s*(?:min-)?width\s*:\s*(\d+)px/g)].map((match) => Number(match[1])));
  assert.ok(flowWidths.every((width) => width <= 288), `akış genişlikleri ≤288 px (${Math.max(...flowWidths)})`);
  assert.doesNotMatch(cssSource, /font-size:\s*\d+(?:\.\d+)?px/, 'px yazı boyutu yok');
  for (const selector of ['.kao-unit-number', '.kao-prayer-line h3 span']) assert.match(cssSource, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\{min-width:\\d+px;min-height:\\d+px'), `${selector} metinle büyür`);
  const { execFileSync } = require('node:child_process');
  const report = JSON.parse(execFileSync(process.execPath, [path.join(repoRoot, 'docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs'), '--json'], { encoding: 'utf8' }));
  assert.equal(report.failed, 0, 'tüm KAO renk çiftleri ≥4.5:1 metin / 3:1 arayüz');
  for (const tone of ['Hareke · fetha', 'Hareke · kesra', 'Hareke · damma']) for (const theme of ['AÇIK', 'KOYU']) assert.ok(report.results.some((row) => row.label === tone && row.theme === theme && row.pass), `${tone} × ${theme}`);
}

// KAO-21 · hub görünürlüğü (settings.kaoVisible) ve geri getirme yolu.
{
  const saved = appData.quranLearn;
  appData.quranLearn = { settings: { kaoVisible: true }, cards: {}, ayahs: { understood: [] } };
  api.ensureQuranLearn(appData);
  assert.match(api.kaoHubCardHTML(), /id="kao-hub-entry"/);
  assert.match(api.kaoSettingsHTML(), /App\.kaoToggleVisible\(\)[^>]*>İlham & İbadet’te kartı göster: açık/);
  assert.equal(api.kaoToggleVisible(), true); assert.equal(appData.quranLearn.settings.kaoVisible, false);
  assert.equal(api.kaoHubCardHTML(), '', 'gizliyken hub kartı yok');
  assert.equal(api.kaoToggleVisible(), true); assert.equal(appData.quranLearn.settings.kaoVisible, true);
  assert.equal(api.ensureQuranLearn({ quranLearn: { settings: { kaoVisible: 'x' } } }).settings.kaoVisible, true, 'bozuk değer görünür sayılır');
  assert.match(settingsSource, /var kaoHidden=!!\(data\.quranLearn&&data\.quranLearn\.settings&&data\.quranLearn\.settings\.kaoVisible===false\);/);
  assert.match(settingsSource, /if\(kaoHidden\) h\+='<button onclick="App\.kaoToggleVisible\(\)"[\s\S]*?Kur’an Arapçası kartını geri getir/, 'uygulama Ayarları → Gizlenen kartlar');
  assert.match(appSource, /App\.kaoToggleVisible=function\(\)\{ return window\.SeymaQuranLearn\.kaoToggleVisible\.apply\(null,arguments\); \};/);
  appData.quranLearn = saved;
}

// KAO-FIX-12 · E7 kaynaklar ve lisanslar (O-6): statik bölüm, düz bağlantılar, metin kaynaktan okunur.
{
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/content/audio-manifest.json'), 'utf8'));
  // KAO2-23 (T-23): kaynak/lisans listesi Ayarlar gövdesinden ÇIKARILDI;
  // "Hakkında ve kaynaklar" alt sayfasında yaşar. Ayarlar yalnız bağlantı verir.
  const settingsHtml = api.kaoSettingsHTML();
  assert.doesNotMatch(settingsHtml, /<section class="kao-sources"/, 'uzun liste Ayarlar gövdesinde değil');
  assert.match(settingsHtml, /App\.kaoSetView\('sources'\)/, 'Ayarlar alt sayfaya bağlanır');
  const page = api.kaoSourcesPageHTML();
  const match = page.match(/<section class="kao-sources"[\s\S]*?<\/section>/);
  assert.ok(match, 'E7 kaynaklar bölümü alt sayfada yok');
  assert.ok(page.indexOf(match[0]) < page.lastIndexOf('</main>'), 'bölüm E7 içinde');
  const block = match[0];
  for (const name of ['Tadabur', 'CC BY-NC 4.0', 'AQQD', 'CC0', 'Tanzil', 'CC BY 3.0', 'Quranic Arabic Corpus', 'Diyanet', 'ts-fsrs', 'MIT']) assert.ok(block.includes(name), `kaynak eksik: ${name}`);
  for (const d of manifest.datasets) {
    for (const value of [d.license, d.attribution, d.url]) assert.ok(block.includes(value), `ses kaynağı manifestle eş değil: ${value}`);
  }
  for (const mod of [sandbox.window.QuranLexiconV1, sandbox.window.QuranShortSurahsV1]) {
    for (const s of mod.ATTRIBUTION.sources) if (s.url) assert.ok(block.includes(`href="${s.url}"`), `modül atfı okunmadı: ${s.url}`);
  }
  assert.doesNotMatch(source, /tanzil\.net|corpus\.quran\.com|dijital\.diyanet/, 'içerik atfı tekrar yazılmaz, modülden okunur');
  const links = block.match(/<a\b[^>]*>/g) || [];
  assert.ok(links.length >= 6, `bağlantı sayısı: ${links.length}`);
  for (const a of links) {
    assert.match(a, /\bhref="https:\/\/[^"]+"/);
    assert.match(a, /\brel="noopener"/);
    assert.match(a, /\btarget="_blank"/);
  }
  assert.doesNotMatch(block, /\bon[a-z]+=|App\./, 'statik bölüm: işleyici yok');
  const css = (cssSource.match(/\.kao-sources[^{]*\{[^}]*\}/g) || []).join('');
  assert.ok(css.length > 0, 'kao-sources stili yok');
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i, 'yalnız token');
  for (const token of css.match(/var\(--[a-z0-9-]+/g) || []) assert.match(token, /var\(--(quran|f-)/, `izinsiz token: ${token}`);
}

// KAO-FIX-13 · Arapça yazı tipi yığını (O-9): KAO Arapçası planın yığınıyla, yalnız KAO kapsamında.
{
  const STACK = '"Noto Naskh Arabic","Amiri","Scheherazade New","Times New Roman",serif';
  const rules = [...cssSource.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selectors: m[1].split(',').map((s) => s.trim()), body: m[2] }));
  const prop = (body, name) => { const m = body.match(new RegExp(`(?:^|;)\\s*${name}\\s*:\\s*([^;]+)`)); return m ? m[1].trim() : null; };
  const stackRule = rules.find((r) => r.selectors.includes('.kao-arabic-text') && r.selectors.includes('.kao-dialog [lang="ar"]'));
  assert.ok(stackRule, 'tek kural: .kao-arabic-text,.kao-dialog [lang="ar"]');
  assert.equal(prop(stackRule.body, 'font-family'), STACK);
  assert.equal(prop(stackRule.body, 'letter-spacing'), 'normal', 'Arapça harf bitişimi: letter-spacing normal');
  const arabic = rules.filter((r) => r.selectors.some((s) => s.includes('kao-arabic-text') || s.includes('[lang="ar"]')));
  for (const r of arabic) {
    const family = prop(r.body, 'font-family');
    if (family !== null) assert.ok(family.startsWith('"Noto Naskh Arabic"'), `Arapça seçicide yığın dışı font: ${r.selectors.join(',')} → ${family}`);
    const spacing = prop(r.body, 'letter-spacing');
    if (spacing !== null) assert.equal(spacing, 'normal', `Arapça seçicide letter-spacing: ${r.selectors.join(',')}`);
  }
  for (const r of rules) for (const sel of r.selectors) assert.ok(!sel.replace(/^@[^{]*$/, '').startsWith('[lang="ar"]'), `çıplak [lang="ar"]: kao.css diğer yüzeylerin Arapçasını ezmez (${sel})`);
  assert.doesNotMatch(cssSource, /kao-arabic-text\{font-family:serif/);
}

console.log('KAO render: PASS (KAO-FIX-13 Arapça yığın, KAO-FIX-12 E7 kaynaklar, KAO-18 44 px + odak + kontrast, E11 namaz, E10 ısı haritası 114 hücre, E8 stüdyo + ikon haritası, hub card, dialog/aria, focus return, grammar/session UI, CSS wiring)');
