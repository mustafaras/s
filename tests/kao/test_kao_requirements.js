'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

function loadApi(extraDeps) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (const relative of ['app/content/quranLexiconV1.js', 'app/content/quranGrammarV1.js', 'app/content/quranShortSurahsV1.js', 'app/content/quranRevelationOrderV1.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), sandbox, { filename: relative });
  }
  const api = sandbox.window.SeymaQuranLearn;
  const deps = Object.fromEntries(['data', 'ui', 'save', 'render', 'todayStr', 'esc', 'icon', 'getDay'].map((name) => [name, function fixture() {}]));
  Object.assign(deps, extraDeps || {});
  assert.equal(api.registerQuranLearn(deps), true);
  return api;
}

const noHealth = loadApi();
assert.equal(noHealth.kaoNightWindow({ settings: { targetBed: '23:30' } }, '2026-09-24T22:30:00'), false, 'health dep yoksa öneri yok');

const api = loadApi({ caffeineTargetBed() { return '23:30'; } });
assert.equal(api.kaoNightWindow({ settings: {} }, '2026-09-24T22:30:00'), false, 'açık targetBed yoksa öneri yok');
assert.equal(api.kaoNightWindow({ settings: { targetBed: '23:30' } }, '2026-09-24T21:59:00'), false);
assert.deepEqual(JSON.parse(JSON.stringify(api.kaoNightWindow({ settings: { targetBed: '23:30' } }, '2026-09-24T22:00:00'))), {
  active: true, targetBed: '23:30', startsAt: '22:00', durationMinutes: 3, maxCards: 8, reviewOnly: true
});
assert.ok(api.kaoNightWindow({ settings: { targetBed: '23:30' } }, '2026-09-24T23:30:00'));
assert.equal(api.kaoNightWindow({ settings: { targetBed: '23:30' } }, '2026-09-24T23:31:00'), false);
const midnightApi = loadApi({ caffeineTargetBed() { return '00:30'; } });
assert.equal(midnightApi.kaoNightWindow({ settings: { targetBed: '00:30' } }, '2026-09-24T22:59:00'), false);
assert.ok(midnightApi.kaoNightWindow({ settings: { targetBed: '00:30' } }, '2026-09-24T23:00:00'), 'gece yarısını aşan pencere açılmalı');
assert.ok(midnightApi.kaoNightWindow({ settings: { targetBed: '00:30' } }, '2026-09-25T00:30:00'));
assert.equal(midnightApi.kaoNightWindow({ settings: { targetBed: '00:30' } }, '2026-09-25T00:31:00'), false);

const catalog = { target: { pos: 'N', root: 'target', meanings: ['hedef'] } };
const cards = { target: { state: 'review', s: 35 } };
for (let i = 0; i < 30; i += 1) {
  const id = `safe-${i}`;
  catalog[id] = { pos: 'N', root: `root-${i}`, meanings: [`güvenli-${i}`] };
  cards[id] = { state: 'review', s: 21 + i };
}
catalog.newUnsafe = { pos: 'N', root: 'unsafe-new', meanings: ['yeni'] };
catalog.lowUnsafe = { pos: 'N', root: 'unsafe-low', meanings: ['düşük'] };
catalog.posUnsafe = { pos: 'V', root: 'unsafe-pos', meanings: ['fiil'] };
catalog.rootUnsafe = { pos: 'N', root: 'target', meanings: ['aynı kök'] };
cards.newUnsafe = { state: 'new', s: 100 };
cards.lowUnsafe = { state: 'review', s: 20.999999 };
cards.posUnsafe = { state: 'review', s: 100 };
cards.rootUnsafe = { state: 'review', s: 100 };
const data = { quranLearn: { cards } };
let previous = [];
let violations = 0;
for (let session = 0; session < 1000; session += 1) {
  const picked = api.kaoPickDistractors(data, 'target', 3, { catalog, seed: `session-${session}`, previousDistractors: { target: previous } });
  for (const item of picked) {
    const card = cards[item.cardId], meta = catalog[item.cardId];
    if (card.state !== 'review' || card.s < 21 || meta.pos !== 'N' || meta.root === 'target' || previous.includes(item.cardId)) violations += 1;
  }
  previous = picked.map((item) => item.cardId);
}
assert.equal(violations, 0, 'R-A2: 1.000 sentetik oturum ihlal 0');

let neighborViolations = 0;
for (let session = 0; session < 1000; session += 1) {
  const queue = api.kaoBuildQueue({ quranLearn: { settings: { dailyNew: 10 }, cards: {} } }, `2026-09-${String(1 + session % 28).padStart(2, '0')}T12:00:00.000Z`, {
    sessionId: `neighbor-${session}`,
    candidates: [
      { id: 'w:l_aAmana_966a5c:ar>tr', isNew: true },
      { id: 'w:l_kafara_af1746:ar>tr', isNew: true },
      { id: `w:neutral-${session}:ar>tr`, isNew: true }
    ]
  });
  if (queue.some((item) => item.cardId === 'w:l_aAmana_966a5c:ar>tr') && queue.some((item) => item.cardId === 'w:l_kafara_af1746:ar>tr')) neighborViolations += 1;
}
assert.equal(neighborViolations, 0, 'R-A5: 1.000 sentetik oturum ihlal 0');

const sessionData = { quranLearn: null };
const sessionUi = { kaoQueue: [], kaoTaskIndex: 0, kaoTaskStartedAt: 0, kaoUndo: null, kaoFeedback: '', kaoAudioFailed: false };
let saves = 0;
let fullRenders = 0;
let quiet = false;
const sessionApi = loadApi({
  data() { return sessionData; }, ui() { return sessionUi; }, save() { saves += 1; }, render() { fullRenders += 1; },
  todayStr() { return '2026-09-24'; }, esc(value) { return String(value); }, icon() { return ''; }, getDay() { return {}; }
});
const taskNode = { innerHTML: '', attrs: {}, setAttribute(name, value) { this.attrs[name] = value; }, querySelector() { return null; } };
assert.equal(sessionApi.registerQuranLearnSurface({
  lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return ''; }, restoreFocus() {}, sheetClose(_card, _back, body) { body(); }, mount() {},
  taskElement() { return taskNode; }, createAudio() { return { addEventListener() {}, play() { return Promise.resolve(); } }; },
  isQuietTime() { return quiet; }, setTimer(fn, ms) { if (ms === 0) fn(); return ms; }, clearTimer() {}, toast() {}
}), true);
sessionApi.ensureQuranLearn(sessionData);
sessionData.quranLearn.settings.audio = false;
sessionData.quranLearn.daily['2026-09-24'] = { seed: 'bit-bit korunmalı' };
assert.ok(sessionApi.kaoStart() >= 2, 'R-A4: iki yönlü ilk kelime oturumu başlamalı');
assert.equal(fullRenders, 1);
const directions = new Set(sessionUi.kaoQueue.map((item) => sessionApi.kaoBuildTask(item, sessionData, { seed: item.id }).direction).filter(Boolean));
assert.deepEqual([...directions].sort(), ['ar>tr', 'tr>ar'], 'tam oturum iki görev türünü taşımalı');
const firstItem = sessionUi.kaoQueue.find((item) => item.type !== 'fragment' && sessionApi.kaoBuildTask(item, sessionData, { seed: item.id }).clipId);
assert.ok(firstItem, 'sesli kelime görevi bulunmalı');
sessionUi.kaoTaskIndex = sessionUi.kaoQueue.indexOf(firstItem);
const firstTask = sessionApi.kaoBuildTask(firstItem, sessionData, { seed: firstItem.id });
const beforeCard = JSON.stringify(sessionData.quranLearn.cards[firstTask.cardId]);
const beforeDaily = JSON.stringify(sessionData.quranLearn.daily['2026-09-24']);
const correctChoice = firstTask.choices.find((choice) => choice.correct);
const transitionStart = process.hrtime.bigint();
assert.equal(sessionApi.kaoAnswer(firstTask.id, correctChoice.choiceId).correct, true);
const transitionMs = Number(process.hrtime.bigint() - transitionStart) / 1e6;
assert.ok(transitionMs < 50, `R-C5: hedefli geçiş ${transitionMs.toFixed(3)} ms`);
assert.equal(fullRenders, 1, 'cevap tam render çağırmamalı');
assert.ok(taskNode.innerHTML.length > 0, '#kao-task alt ağacı yenilenmeli');
assert.deepEqual(JSON.parse(JSON.stringify(sessionData.quranLearn.daily['2026-09-24'].calib)), { pred: 1, ok: 1, n: 1 }, 'R-A3: her cevap kalibrasyon toplamına eklenmeli');
assert.equal(sessionApi.kaoUndo(), true);
assert.equal(JSON.stringify(sessionData.quranLearn.cards[firstTask.cardId]), beforeCard, 'R-C3: kart bit-bit geri sarılmalı');
assert.equal(JSON.stringify(sessionData.quranLearn.daily['2026-09-24']), beforeDaily, 'R-C3: günlük kayıt bit-bit geri sarılmalı');

sessionData.quranLearn.settings.audio = true;
assert.equal(sessionApi.kaoShouldAutoplay(firstTask, sessionData), true, 'R-A4: n<2 yeni kartta otomatik ses');
sessionData.quranLearn.cards[firstTask.cardId] = { reps: 2 };
assert.equal(sessionApi.kaoShouldAutoplay(firstTask, sessionData), false, 'n>=2 otomatik ses olmamalı');
delete sessionData.quranLearn.cards[firstTask.cardId]; quiet = true;
assert.equal(sessionApi.kaoShouldAutoplay(firstTask, sessionData), false, 'sessiz saatte otomatik ses olmamalı');
quiet = false; sessionData.quranLearn.settings.audio = false;
assert.equal(sessionApi.kaoShouldAutoplay(firstTask, sessionData), false, 'ses ayarı kapalıysa otomatik ses olmamalı');

const fragmentKinds = new Set(sessionUi.kaoQueue.filter((item) => item.type === 'fragment').map((item) => item.fragmentKind));
assert.deepEqual([...fragmentKinds].sort(), ['order', 'translate'], 'E2 kelime dizme ve parça çeviri aynı tam oturumda bulunmalı');

const thresholdCardId = sessionUi.kaoQueue.find((item) => item.type !== 'fragment').cardId;
sessionData.quranLearn.cards[thresholdCardId] = { state: 'review', s: 20, d: 5, r: '2026-08-01T00:00:00.000Z', due: '2026-08-02T00:00:00.000Z', reps: 3, lapses: 0 };
sessionUi.kaoDurableCount = 0;
sessionUi.kaoTaskIndex = 0;

while (sessionUi.kaoTaskIndex < sessionUi.kaoQueue.length) {
  const item = sessionUi.kaoQueue[sessionUi.kaoTaskIndex];
  const task = sessionApi.kaoBuildTask(item, sessionData, { seed: item.id });
  if (task.kind === 'order') {
    task.choices.slice().sort((a, b) => a.ordinal - b.ordinal).forEach((choice) => sessionApi.kaoAnswer(task.id, choice.choiceId));
  } else {
    const correct = task.choices.find((choice) => choice.correct);
    assert.ok(correct);
    sessionApi.kaoAnswer(task.id, correct.choiceId);
  }
}
const doneHtml = sessionApi.kaoTaskHTML(null);
assert.equal(sessionUi.kaoDurableCount, 1, 'R-B4: yalnız s<21 iken s>=21 olan kart sayılmalı');
assert.match(doneHtml, new RegExp(`Bugün ${sessionUi.kaoDurableCount} kelime daha kalıcı oldu`), 'R-B4: sayı oturum eşik sayacından gelmeli');
assert.match(doneHtml, /Bugün yeter/);
assert.match(doneHtml, /5 dakika daha/);
assert.doesNotMatch(doneHtml, /puan|XP/i);
const calib = sessionData.quranLearn.daily['2026-09-24'].calib;
assert.equal(calib.n, sessionData.quranLearn.daily['2026-09-24'].answered, 'R-A3: kalibrasyon n tüm cevapları saymalı');
assert.ok(calib.pred >= 0 && calib.pred <= calib.n && calib.ok >= 0 && calib.ok <= calib.n);
assert.ok(saves >= sessionUi.kaoQueue.length + 1, 'sessiz modda tam oturum kalıcı ilerlemeli');

const rootsWithPatterns = sessionApi.kaoRootCatalog().filter((root) => root.derivatives.length && root.derivatives.every((item) => item.tr && item.pattern));
assert.ok(rootsWithPatterns.length >= 60, 'R-A8: en az 60 kök kalıp etiketli Türkçe türev taşımalı');
assert.ok(rootsWithPatterns.every((root) => sandboxSafeLexRoot(sessionApi, root.root)), 'R-A8: türev kökleri sözlük kökleriyle kesişmeli');

function sandboxSafeLexRoot(apiUnderTest, root) {
  return apiUnderTest.kaoRootLemmaIds(root).length > 0;
}

const flagData = { quranLearn: sessionApi.emptyQuranLearn() };
const flagUi = {};
const flagApi = loadApi({
  data() { return flagData; }, ui() { return flagUi; }, save() {}, render() {}, todayStr() { return '2026-09-24'; }, esc(value) { return String(value); }, icon() { return ''; }, getDay() { return {}; }
});
assert.equal(flagApi.registerQuranLearnSurface({ lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return ''; }, restoreFocus() {}, sheetClose(_c, _b, body) { body(); }, mount() {}, toast() {} }), true);
const flagLemma = rootsWithPatterns.map((root) => flagApi.kaoRootLemmaIds(root.root)[0]).find(Boolean);
const flagCardId = `w:${flagLemma}:ar>tr`;
assert.equal(flagApi.kaoFlag(flagCardId, 'free text must fail'), false, 'R-C1: serbest metin türü reddedilmeli');
assert.equal(flagData.quranLearn.cards[flagCardId], undefined);
assert.equal(flagApi.kaoFlag(flagCardId, 'example'), true);
assert.deepEqual(Object.keys(flagData.quranLearn.cards[flagCardId].flagged).sort(), ['at', 'kind']);

const delayedData = { quranLearn: null };
const delayedUi = { kaoQueue: [], kaoTaskIndex: 0, kaoTaskStartedAt: 0, kaoUndo: null, kaoFeedback: '', kaoAudioFailed: false };
const delayedApi = loadApi({
  data() { return delayedData; }, ui() { return delayedUi; }, save() {}, render() {},
  todayStr() { return '2026-09-25'; }, esc(value) { return String(value); }, icon() { return ''; }, getDay() { return {}; }
});
const delayedTaskNode = { innerHTML: '', attrs: {}, setAttribute(name, value) { this.attrs[name] = value; }, removeAttribute(name) { delete this.attrs[name]; }, querySelectorAll() { return []; } };
assert.equal(delayedApi.registerQuranLearnSurface({
  lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return ''; }, restoreFocus() {}, sheetClose(_c, _b, body) { body(); }, mount() {},
  taskElement() { return delayedTaskNode; }, createAudio() { return null; }, isQuietTime() { return false; }, setTimer(fn, ms) { if (ms === 0) fn(); return ms; }, clearTimer() {}, toast() {}
}), true);
delayedApi.ensureQuranLearn(delayedData);
delayedData.quranLearn.surahs['112'] = {
  understoodAt: '2026-09-17T12:00:00.000Z', delayedTestAt: '2026-09-24T12:00:00.000Z', delayedScore: null
};
const delayedQueue = delayedApi.kaoBuildQueue(delayedData, '2026-09-25T12:00:00.000Z', { candidates: [] });
assert.equal(delayedQueue.length, 5, 'R-C6: vadesi gelen sûre tam beş parça-çevir görevi üretmeli');
assert.ok(delayedQueue.every((item) => item.delayedSurahId === 112 && item.fragmentKind === 'delayed'));
const delayedTasks = delayedQueue.map((item) => delayedApi.kaoBuildTask(item, delayedData, { seed: item.id }));
assert.ok(delayedTasks.every((task) => task && task.kind === 'translate' && task.pronunciation && task.choices.length === 4), 'gecikmeli görevler gerçek Arapça, okunuş ve dört seçenek taşımalı');
delayedUi.kaoQueue = delayedQueue;
delayedUi.kaoTasks = Object.fromEntries(delayedTasks.map((task) => [task.id, task]));
for (let index = 0; index < delayedTasks.length; index += 1) {
  const task = delayedTasks[index];
  const choice = index < 4 ? task.choices.find((item) => item.correct) : task.choices.find((item) => !item.correct);
  const result = delayedApi.kaoAnswer(task.id, choice.choiceId);
  assert.equal(result.correct, index < 4);
}
assert.equal(delayedData.quranLearn.surahs['112'].delayedScore, 4);
assert.match(delayedData.quranLearn.surahs['112'].confirmedAt, /^\d{4}-\d{2}-\d{2}T/, 'R-C6: 4/5 anlaşılmayı kesinleştirmeli');
assert.equal(delayedData.quranLearn.surahs['112'].needsReread, false);


// ── KAO-17 · E7 ayarlar: R-A4, R-A9, R-B5, R-B8, R-C4 ─────────────────────────
{
  const e7Data = { settings: { premiumAtmosphere: true }, quranLearn: null };
  const e7Ui = {};
  let saves = 0, renders = 0, quiet = false;
  const played = [];
  const e7 = loadApi({ data() { return e7Data; }, ui() { return e7Ui; }, save() { saves += 1; }, render() { renders += 1; }, todayStr() { return '2026-09-25'; }, esc(value) { return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }, icon() { return ''; } });
  assert.equal(e7.registerQuranLearnSurface({ lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return ''; }, restoreFocus() {}, sheetClose(_c, _b, body) { body(); }, mount() {}, taskElement() { return null; }, createAudio(src) { played.push(src); return { src, addEventListener() {}, play() { return { catch() {} }; } }; }, isQuietTime() { return quiet; }, setTimer() { return 1; }, clearTimer() {} }), true);
  const q = e7.ensureQuranLearn(e7Data);
  assert.equal(q.settings.audioStyle, 'measured');
  assert.equal(q.settings.translitLayer, 'tr');

  // Kalıcılık: her ayar data.quranLearn.settings/readability'ye yazılır, save+render çağrılır.
  for (const bad of [0, 7, 20, null, 'on', undefined]) assert.equal(e7.kaoSetDailyNew(bad), false, 'dailyNew yalnız 5/10/15');
  assert.equal(e7.kaoSetDailyNew(15), true); assert.equal(q.settings.dailyNew, 15);
  assert.equal(e7.kaoSetAudioStyle('loud'), false);
  assert.equal(e7.kaoSetAudioStyle('flowing'), true); assert.equal(q.settings.audio, true); assert.equal(q.settings.audioStyle, 'flowing');
  assert.equal(e7.kaoSetAudioStyle('off'), true); assert.equal(q.settings.audio, false); assert.equal(q.settings.audioStyle, 'flowing', 'kapatmak stili unutmaz');
  assert.equal(e7.kaoToggleHarakat(), true); assert.equal(q.settings.harakat, false);
  assert.equal(e7.kaoToggleHarakat(), true); assert.equal(q.settings.harakat, true);
  assert.equal(e7.kaoToggleFade(), true); assert.equal(q.readability.fadeHarakat, true);
  assert.equal(e7.kaoSetTranslit('latin'), false);
  assert.equal(e7.kaoSetTranslit('dia'), true); assert.equal(q.settings.translitLayer, 'dia');
  assert.equal(e7.kaoSetReadability('lineHeight', '3'), false);
  assert.equal(e7.kaoSetReadability('fontSize', 'big'), false);
  assert.equal(e7.kaoSetReadability('lineHeight', '2.5'), true); assert.equal(q.readability.lineHeight, '2.5');
  assert.equal(e7.kaoSetReadability('wordSpacing', 'wide'), true);
  assert.equal(e7.kaoSetReadability('coloredHarakat', false), true); assert.equal(q.readability.coloredHarakat, false);
  assert.equal(saves, 10, 'her geçerli ayar tam bir kez kaydedilir'); assert.equal(renders, 10);
  const persisted = JSON.parse(JSON.stringify(e7Data));
  const reloaded = e7.ensureQuranLearn(persisted);
  assert.deepEqual([reloaded.settings.dailyNew, reloaded.settings.audioStyle, reloaded.settings.translitLayer, reloaded.readability.lineHeight, reloaded.readability.wordSpacing, reloaded.readability.fadeHarakat], [15, 'flowing', 'dia', '2.5', 'wide', true], 'ayarlar JSON gidiş-dönüşünde korunur');
  const broken = e7.ensureQuranLearn({ quranLearn: { settings: { audioStyle: 'x', translitLayer: 7 } } });
  assert.deepEqual([broken.settings.audioStyle, broken.settings.translitLayer], ['measured', 'tr'], 'bozuk ayar varsayılana döner');

  // R-A9: okunabilirlik değişkenleri diyalogun tamamına uygulanır; ayar ekranı eksiksiz.
  e7Ui.kaoOpen = true; e7Ui.kaoView = 'settings';
  const settingsHtml = e7.kaoOverlayHTML('2026-09-25T10:00:00');
  assert.match(settingsHtml, /class="kao-dialog" style="--kao-ar-lh:2\.5;--kao-ar-ws:\.18em"/);
  for (const handler of ['kaoSetDailyNew(15)', "kaoSetAudioStyle('flowing')", "kaoSetTranslit('dia')", 'kaoToggleHarakat()', 'kaoToggleFade()', "kaoSetReadability('lineHeight','2.5')", "kaoSetReadability('wordSpacing','wide')", "kaoSetReadability('coloredHarakat',true)", 'kaoReopenGate()', 'kaoExportCsv()']) assert.ok(settingsHtml.includes('App.' + handler), handler);
  assert.equal((settingsHtml.match(/aria-pressed="true"/g) || []).length, 7, 'her grupta tek seçili düğme + açık anahtarlar');
  assert.match(settingsHtml, /role="group" aria-label="Günlük yeni kelime"/);
  assert.match(e7.kaoHomeHTML('2026-09-25T10:00:00'), /App\.kaoSetView\('settings'\)/, 'E1 ana ekrandan ayarlara geçiş');
  assert.equal(e7.kaoReopenGate(), true); assert.equal(e7Ui.kaoView, 'gate', 'Seviye 0 tekrar açılır');
  assert.equal(q.gate.passed, false);

  // DİA katmanı: çalışma zamanı dönüşümü derleme aracının doğrulanmış çıktısıyla 524/524 aynı.
  const verified = JSON.parse(fs.readFileSync(path.join(repoRoot, 'kuran-ogreniyorum/content/lexicon.verified.json'), 'utf8'));
  const verifiedLemmas = Array.isArray(verified.lemmas) ? verified.lemmas : Object.values(verified.lemmas || verified);
  const mismatches = verifiedLemmas.filter((record) => e7.kaoDiaReading(record.ar) !== record.translit.dia);
  assert.equal(verifiedLemmas.length, 524); assert.deepEqual(mismatches.map((record) => record.lemmaId), [], 'DİA sapması yok');
  const sampleLemma = verifiedLemmas.find((record) => record.translit.dia !== record.translit.tr);
  assert.equal(e7.kaoLemmaReading(sampleLemma.lemmaId, 'x'), sampleLemma.translit.dia, 'DİA seçiliyken kelime okunuşu DİA');
  e7.kaoSetTranslit('tr');
  assert.equal(e7.kaoLemmaReading(sampleLemma.lemmaId, 'x'), sampleLemma.translit.tr);
  assert.equal(e7.kaoLemmaReading('l_yok_000000', 'yedek'), 'yedek', 'sözlük dışı kayıt kendi doğrulanmış okunuşunu korur');

  // Hareke kapalı / soldurma (R-B5) / hareket ayarı ve reduced-motion dalı.
  const lemma = e7Data.quranLearn && sandboxLemma(e7, sampleLemma.lemmaId);
  const reviewTask = e7.kaoBuildTask({ id: 'w:' + lemma.id + ':ar>tr', isNew: false }, e7Data, { seed: 'e7' });
  const newTask = e7.kaoBuildTask({ id: 'w:' + lemma.id + ':ar>tr', isNew: true }, e7Data, { seed: 'e7' });
  e7Ui.kaoQueue = [{ id: reviewTask.id }]; e7Ui.kaoTaskIndex = 0;
  let html = e7.kaoTaskHTML(reviewTask);
  assert.match(html, /class="kao-fade" aria-label="Harekeler soluyor; geri getirmek için dokun" onclick="this\.classList\.add\('is-back'\)"><span class="kao-fade-base" aria-hidden="true">([^<]+)<\/span><span class="kao-fade-full">/);
  assert.equal(RegExp.$1, e7.kaoStripHarakat(lemma.ar));
  assert.doesNotMatch(e7.kaoTaskHTML(newTask), /kao-fade/, 'yeni kartta soldurma yok');
  e7Data.settings.premiumAtmosphere = false;
  assert.match(e7.kaoTaskHTML(reviewTask), /class="kao-fade is-instant"/, 'uygulama hareket ayarı kapalıyken anında');
  e7Data.settings.premiumAtmosphere = true;
  e7.kaoToggleFade();
  assert.doesNotMatch(e7.kaoTaskHTML(reviewTask), /kao-fade/, 'ayar kapalıyken soldurma yok');
  e7.kaoToggleHarakat();
  html = e7.kaoTaskHTML(reviewTask);
  assert.ok(html.includes('>' + e7.kaoStripHarakat(lemma.ar) + '<') && !/[ً-ْ]/.test(html.match(/kao-arabic-text[^>]*>([^<]*)</)[1]), 'hareke kapalıyken harekesiz metin');
  e7.kaoToggleHarakat();
  const css = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
  assert.match(css, /\.kao-fade-full\{[^}]*animation:kaoHarakatFade var\(--dur-5\)/, 'R-B5: --dur-5 tokenı');
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{\.kao-fade-full\{animation:none;opacity:0\}/, 'reduced-motion: anında');
  assert.match(css, /\.kao-fade\.is-back \.kao-fade-full,\.kao-fade\.is-instant\.is-back \.kao-fade-full\{animation:none;opacity:1\}/, 'dokununca geri');

  // R-A4 + ses stili: otomatik ses seçilen stille ve sessiz saatte hiç çalmaz; R-B8 iki hız düğmesi korunur.
  e7.kaoSetAudioStyle('flowing');
  const withClip = Object.assign({}, newTask, { clipId: 'w-' + lemma.id });
  assert.equal(e7.kaoShouldAutoplay(withClip, e7Data), true);
  assert.match(e7.kaoTaskHTML(withClip), /data-autoplay="1"/);
  quiet = true; assert.equal(e7.kaoShouldAutoplay(withClip, e7Data), false, 'sessiz saatte otomatik ses yok'); assert.doesNotMatch(e7.kaoTaskHTML(withClip), /data-autoplay/); quiet = false;
  e7.kaoSetAudioStyle('off'); assert.equal(e7.kaoShouldAutoplay(withClip, e7Data), false, 'ses kapalıyken otomatik ses yok');
  const audioButton = e7.kaoTaskHTML(withClip);
  assert.match(audioButton, /App\.kaoPlay\('w-[^']+','flowing'\)/); assert.match(audioButton, /App\.kaoPlay\('w-[^']+','measured'\)/); assert.match(audioButton, /event\.shiftKey/);
  e7.kaoSetAudioStyle('flowing'); e7Ui.kaoWordId = lemma.id; e7Ui.kaoWordLayer = 1;
  assert.match(e7.kaoWordHTML(), /App\.kaoPlay\('w-[^']+','flowing'\)/, 'kelime kartı tek düğmesi seçilen stili çalar');

  // R-C4: CSV başlığı + satır sayısı = bilinen (tekilleştirilmiş) kelime kartı.
  const lex = verifiedLemmas.slice(0, 4);
  q.cards = {};
  q.cards['w:' + lex[0].lemmaId + ':ar>tr'] = { reps: 2 };
  q.cards['w:' + lex[0].lemmaId + ':tr>ar'] = { reps: 1 };
  q.cards['w:' + lex[1].lemmaId + ':ar>tr'] = { reps: 1 };
  q.cards['w:' + lex[2].lemmaId + ':ar>tr'] = { reps: 1, readerUnknown: true };
  q.cards['w:' + lex[3].lemmaId + ':ar>tr'] = { reps: 3, orphan: true };
  q.cards['g:g0_5:1'] = { reps: 4 };
  const csv = e7.kaoCsv(e7Data).trimEnd().split('\r\n');
  assert.equal(csv[0], 'ar,tr,translit,root,tags');
  assert.equal(csv.length - 1, 2, 'satır = bilinen kelime (yön tekil, okuyucu-bilinmeyen/yetim hariç)');
  assert.ok(csv.slice(1).every((row) => row.split(',').length >= 5));
  assert.ok(csv.some((row) => row.startsWith(lex[0].ar + ',')));
}

function sandboxLemma(api, lemmaId) {
  const html = api.kaoCsv({ quranLearn: { cards: { ['w:' + lemmaId + ':ar>tr']: { reps: 1 } } } }).split('\r\n')[1];
  return { id: lemmaId, ar: html.split(',')[0] };
}

console.log(`KAO requirements: PASS (R-A1/A2/A4/A5/A9, R-B5/B8, R-C2/C3/C4/C5; E7 ayarları kalıcı, DİA 524/524; iki yön, bit-bit undo, hedefli ${transitionMs.toFixed(3)} ms <50 ms)`);
