'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

function loadApi(extraDeps) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (const relative of ['app/content/quranLexiconV1.js', 'app/content/quranGrammarV1.js', 'app/content/quranShortSurahsV1.js', 'app/content/quranCurriculumV2.js', 'app/content/quranRevelationOrderV1.js', 'app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
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
// KAO-FIX-14 · R-A5 komşuluğu sözlük modülünden (O-7); elle yazılmış küme yok.
{
  const learnSource = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');
  assert.doesNotMatch(learnSource, /KAO_SEMANTIC_CLUSTERS|KAO_CLUSTER_BY_LEMMA/, 'elle yazılmış küme kaldırılmalı');
  const both = (a, b, nowIso, sessionId, opts) => {
    const queue = noHealth.kaoBuildQueue({ quranLearn: { settings: { dailyNew: 10 }, cards: {} } }, nowIso, Object.assign({ sessionId, candidates: [{ id: `w:${a}:ar>tr`, isNew: true }, { id: `w:${b}:ar>tr`, isNew: true }] }, opts || {}));
    return queue.some((i) => i.cardId === `w:${a}:ar>tr`) && queue.some((i) => i.cardId === `w:${b}:ar>tr`);
  };
  let crossRoot = 0, excluded = 0, catalogPair = 0;
  for (let s = 0; s < 1000; s += 1) {
    const at = `2026-09-${String(1 + s % 28).padStart(2, '0')}T12:00:00.000Z`;
    if (both('l_hadaY_a88771', 'l_aDal_a_5ed954', at, `hd-${s}`)) crossRoot += 1;
    if (both('l_anfaqa_0b12ad', 'l_kafara_af1746', at, `nf-${s}`)) excluded += 1;
    if (both('x_a', 'x_b', at, `cat-${s}`, { catalog: { 'w:x_a:ar>tr': { semNeighbors: ['x_b'] } } })) catalogPair += 1;
  }
  assert.equal(crossRoot, 0, 'R-A5: hidâyet ↔ dalâlet (farklı kök, doğrulanmış küme) aynı oturumda yeni gelmez');
  assert.equal(excluded, 1000, 'D-12 dışlanan anfaqa (harcadı) iman/küfür komşusu değil');
  assert.equal(catalogPair, 0, 'katalog semNeighbors seçeneği (test) korunur');
}


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
assert.ok(sessionApi.kaoStart() >= 2, 'R-A4: ilk kelime oturumu başlamalı');
assert.equal(fullRenders, 1);
// KAO-FIX-06 (Y-2): ilk oturumda her yeni lemma ar>tr ile açılır; tr>ar en erken ertesi gün gelir
// (kelime düzeyi iki yön: test_kao_queue.js 120 günlük tarama).
const directions = new Set(sessionUi.kaoQueue.map((item) => sessionApi.kaoBuildTask(item, sessionData, { seed: item.id }).direction).filter(Boolean));
assert.deepEqual([...directions].sort(), ['ar>tr'], 'ilk oturumda ters yön (tr>ar) henüz açılmamalı');
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
  sessionApi.kaoContinue();
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
  delayedApi.kaoContinue();
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
  // KAO2-09 (f): aç/kapat anahtarları role="switch" + aria-checked; segment düğmeleri aria-pressed. Toplam seçili sayı aynı.
  const pressedOn = (settingsHtml.match(/aria-pressed="true"/g) || []).length, switchOn = (settingsHtml.match(/role="switch" aria-checked="true"/g) || []).length;
  assert.equal(pressedOn + switchOn, 8, 'her grupta tek seçili düğme + açık anahtarlar (görünürlük dahil)');
  assert.ok(switchOn > 0 && !/class="kao-toggle" aria-pressed=/.test(settingsHtml), 'anahtarlar switch semantiğinde');
  assert.match(settingsHtml, /role="group" aria-label="Günlük yeni kelime"/);
  assert.match(e7.kaoHomeHTML('2026-09-25T10:00:00'), /App\.kaoSetView\(&quot;settings&quot;\)/, 'S-02 Sen → Ayarlar satırı');
  assert.equal(e7.kaoReopenGate(), true); assert.equal(e7Ui.kaoView, 'gate', 'Seviye 0 tekrar açılır');
  assert.equal(q.gate.passed, false);

  // DİA katmanı: çalışma zamanı dönüşümü derleme aracının doğrulanmış çıktısıyla 524/524 aynı.
  const verified = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/content/lexicon.verified.json'), 'utf8'));
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
  // KAO-FIX-15: soldurma yalnız review ∧ s≥30 kartta (durable30); isNew=false tek başına yetmez.
  const fadeCardId = 'w:' + lemma.id + ':ar>tr';
  delete e7Data.quranLearn.cards[fadeCardId];
  const newTask = e7.kaoBuildTask({ id: fadeCardId, isNew: true }, e7Data, { seed: 'e7' });
  e7Data.quranLearn.cards[fadeCardId] = { state: 'learning', s: 3, reps: 1 };
  assert.doesNotMatch(e7.kaoTaskHTML(e7.kaoBuildTask({ id: fadeCardId, isNew: false }, e7Data, { seed: 'e7' })), /kao-fade/, 'learning kartında soldurma yok');
  e7Data.quranLearn.cards[fadeCardId] = { state: 'review', s: 30, reps: 6 };
  const reviewTask = e7.kaoBuildTask({ id: fadeCardId, isNew: false }, e7Data, { seed: 'e7' });
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
  delete e7Data.quranLearn.cards[fadeCardId]; // soldurma fixture kartı: aşağıdaki ses kontrolleri yeni kart ister

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
  // KAO-FIX-07 (02 §3): CSV yalnız iki yönde kalıcı (review ∧ s≥21) lemmayı yazar.
  q.cards['w:' + lex[0].lemmaId + ':ar>tr'] = { reps: 6, state: 'review', s: 25 };
  q.cards['w:' + lex[0].lemmaId + ':tr>ar'] = { reps: 5, state: 'review', s: 21 };
  q.cards['w:' + lex[1].lemmaId + ':ar>tr'] = { reps: 6, state: 'review', s: 40 };
  q.cards['w:' + lex[2].lemmaId + ':ar>tr'] = { reps: 1, readerUnknown: true };
  q.cards['w:' + lex[3].lemmaId + ':ar>tr'] = { reps: 3, orphan: true };
  q.cards['g:g0_5:1'] = { reps: 4 };
  const csv = e7.kaoCsv(e7Data).trimEnd().split('\r\n');
  assert.equal(csv[0], 'ar,tr,translit,root,tags');
  assert.equal(csv.length - 1, 1, 'satır = bilinen kelime (iki yönde kalıcı; tek yön, okuyucu-bilinmeyen ve yetim hariç)');
  assert.ok(csv.slice(1).every((row) => row.split(',').length >= 5));
  assert.ok(csv.some((row) => row.startsWith(lex[0].ar + ',')));
}

function sandboxLemma(api, lemmaId) {
  const durable = { state: 'review', s: 21, reps: 6 };
  const html = api.kaoCsv({ quranLearn: { cards: { ['w:' + lemmaId + ':ar>tr']: durable, ['w:' + lemmaId + ':tr>ar']: durable } } }).split('\r\n')[1];
  return { id: lemmaId, ar: html.split(',')[0] };
}


// KAO-28b · R-C6: gecikmeli sûre testi ısı haritasına yansır (≥4/5 koyu, altı "tekrar oku").
{
  const box = { window: {} };
  vm.createContext(box);
  for (const relative of ['app/content/quranShortSurahsV1.js', 'app/content/quranCurriculumV2.js', 'app/content/quranRevelationOrderV1.js', 'app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), box, { filename: relative });
  const mapApi = box.window.SeymaQuranLearn;
  const cell = (record, understood) => mapApi.kaoSurahMap({ quranLearn: { surahs: { '108': record }, ayahs: { understood: understood || [] } } })[107];
  assert.equal(mapApi.kaoSurahMap({ quranLearn: {} }).length, 114);
  assert.ok(mapApi.kaoSurahMap({ quranLearn: {} }).every((item) => item.level === 0 && !item.hasData && item.percent === 0), 'boş veri: tüm hücreler boş');
  assert.equal(cell({ understoodAt: 'x', delayedScore: 4, confirmedAt: 'y' }).level, 5, '4/5 → koyu');
  assert.equal(cell({ understoodAt: 'x', delayedScore: 4 }).level < 5, true, 'confirmedAt olmadan koyulaşmaz');
  assert.equal(cell({ understoodAt: 'x', delayedScore: 3, needsReread: true }, ['108:1']).status, 'gecikmeli test 3/5 · tekrar oku');
  assert.equal(cell({ understoodAt: 'x', delayedTestAt: 'z' }).status, '7 günlük test bekliyor');
  assert.deepEqual([cell({}, ['108:1']).percent, cell({}, ['108:1', '108:2', '108:3']).percent], [33, 100], 'Kevser 3 âyet');
}

// KAO-FIX-08 (R-A2, O-1): enjeksiyonsuz — aynı hedef iki ardışık gün kaoStart → kaoAnswer ile sunulur;
// çeldirici kümeleri kesişmez (lastDistractors üretim yolunda yazılır ve okunur).
{
  const lexBox = { window: {} };
  vm.createContext(lexBox);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranLexiconV1.js'), 'utf8'), lexBox);
  const all = lexBox.window.QuranLexiconV1.lemmas;
  const target = all.find((lemma) => lemma.pos && lemma.root && all.filter((other) => other.pos === lemma.pos && other.root && other.root !== lemma.root).length >= 6);
  const pool = all.filter((other) => other.id !== target.id && other.pos === target.pos && other.root && other.root !== target.root).slice(0, 6);
  assert.equal(pool.length, 6, 'havuzda 6 uygun kart');
  let day = '2026-10-01';
  const data = { quranLearn: null };
  const ui = {};
  const api = loadApi({ data() { return data; }, ui() { return ui; }, todayStr() { return day; } });
  api.ensureQuranLearn(data);
  const q = data.quranLearn;
  q.settings.dailyNew = 0; q.settings.audio = false;
  const far = '2027-01-01T00:00:00.000Z';
  for (const lemma of pool) q.cards[`w:${lemma.id}:ar>tr`] = { state: 'review', s: 30, d: 5, reps: 6, due: far, r: '2026-09-01T00:00:00.000Z' };
  const targetId = `w:${target.id}:ar>tr`;
  const seen = [];
  for (const date of ['2026-10-01', '2026-10-02']) {
    day = date;
    q.cards[targetId] = Object.assign({ state: 'review', s: 30, d: 5, reps: 6, r: '2026-09-01T00:00:00.000Z' }, q.cards[targetId] || {}, { due: '2026-09-02T00:00:00.000Z' }); // gerçek saatten önce: her gün vadesi gelmiş
    api.kaoStart();
    const index = ui.kaoQueue.findIndex((item) => item.cardId === targetId);
    assert.ok(index >= 0, `${date}: hedef kart kuyrukta`);
    ui.kaoTaskIndex = index;
    const item = ui.kaoQueue[index];
    ui.kaoTasks = ui.kaoTasks || {};
    const task = ui.kaoTasks[item.id] = api.kaoBuildTask(item, data, { seed: item.id });
    const distractors = Array.from(task.choices.filter((choice) => !choice.correct), (choice) => choice.cardId); // VM dizisini ana alana taşı
    assert.equal(distractors.length, 3, `${date}: 3 çeldirici`);
    seen.push(distractors);
    assert.notEqual(api.kaoAnswer(task.id, task.choices.find((choice) => choice.correct).choiceId), false, `${date}: cevap kaydedilmeli`);
    assert.deepEqual(Array.from(q.cards[targetId].lastDistractors || []), distractors.map((id) => id.split(':')[1]), `${date}: lastDistractors (lemma kimliği) cevapta yazılmalı`);
    api.kaoContinue();
  }
  assert.deepEqual(seen[1].filter((id) => seen[0].includes(id)), [], 'R-A2: ardışık iki tekrarda aynı çeldirici gelmez (üretim yolu)');
}

// KAO-FIX-11 eki (kullanıcı onayı): kökü olmayan işlev kelimeleri de dâhil her kelime görevi 3 farklı çeldirici taşır.
{
  const api = loadApi();
  const lexBox = { window: {} };
  vm.createContext(lexBox);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranLexiconV1.js'), 'utf8'), lexBox);
  const empty = { quranLearn: { cards: {}, settings: {} } };
  const short = [];
  for (const lemma of lexBox.window.QuranLexiconV1.lemmas) {
    for (const direction of ['ar>tr', 'tr>ar']) {
      const cardId = `w:${lemma.id}:${direction}`;
      const task = api.kaoBuildTask({ id: `kao:x:${cardId}`, cardId, type: direction === 'tr>ar' ? 'arabic' : 'meaning', isNew: true }, empty, { seed: cardId });
      const wrong = task.choices.filter((choice) => !choice.correct);
      const labels = new Set(wrong.map((choice) => choice.label));
      const answer = task.choices.find((choice) => choice.correct).label;
      const parts = (label) => String(label).toLocaleLowerCase('tr').split(/[,;()/]+/).map((part) => part.trim()).filter(Boolean);
      const clash = wrong.some((choice) => parts(choice.label).some((part) => parts(answer).includes(part)));
      if (wrong.length !== 3 || labels.size !== 3 || labels.has(answer) || (!lemma.root && clash)) short.push(`${cardId}(${lemma.pos}):${wrong.length}${clash ? ':çakışma' : ''}`);
    }
  }
  assert.deepEqual(short, [], `her kelime görevi 3 farklı çeldirici; köksüz işlev kelimelerinde doğru cevapla anlam parçası çakışmaz (eksik: ${short.length})`);
}

// KAO-FIX-11 (O-5): undo `errors` geri sarımı (M04) ve oturum içi tek tekrar (02 §2.10).
{
  const data = { quranLearn: null };
  const ui = {};
  const api = loadApi({ data() { return data; }, ui() { return ui; }, todayStr() { return '2026-10-06'; } });
  api.ensureQuranLearn(data);
  const q = data.quranLearn;
  q.settings.audio = false;
  const answerCurrent = (pickCorrect) => {
    const item = ui.kaoQueue[ui.kaoTaskIndex];
    const task = api.kaoBuildTask(item, data, { seed: item.id });
    const choice = task.choices.find((option) => option.correct === pickCorrect);
    assert.ok(choice, `${task.id}: ${pickCorrect ? 'doğru' : 'yanlış'} seçenek olmalı`);
    return { task, result: api.kaoAnswer(task.id, choice.choiceId) };
  };
  // Undo errors: errorClass taşıyan gramer görevi yanlış → errors[cls] +1 → kaoUndo → errors bit-bit eski.
  const grammarId = Array.from(api.kaoGrammarCandidates(), (candidate) => candidate.id)[0];
  ui.kaoQueue = [{ id: `kao:2026-10-06:${grammarId}`, cardId: grammarId, type: 'grammar', isNew: true }];
  ui.kaoTaskIndex = 0;
  const grammarTask = api.kaoBuildTask(ui.kaoQueue[0], data, { seed: ui.kaoQueue[0].id });
  assert.ok(grammarTask.errorClass && Object.prototype.hasOwnProperty.call(q.errors, grammarTask.errorClass), 'gramer görevi errorClass taşır');
  const errorsBefore = JSON.stringify(q.errors);
  answerCurrent(false);
  assert.equal(q.errors[grammarTask.errorClass], JSON.parse(errorsBefore)[grammarTask.errorClass] + 1, 'yanlış cevap hata sınıfını artırır');
  assert.equal(api.kaoUndo(), true);
  assert.equal(JSON.stringify(q.errors), errorsBefore, 'R-C3: undo errors sayacını bit-bit geri sarar');
  // Oturum içi tekrar: yanlış kelime görevi kuyruk sonuna :retry ile bir kez eklenir; retry de yanlışsa ikinci kez eklenmez.
  const lexBox = { window: {} };
  vm.createContext(lexBox);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranLexiconV1.js'), 'utf8'), lexBox);
  // İsim lemması: kökü olmayan işlev kelimelerinde çeldirici yok (ayrı bulgu, FIX-11 kanıtı); tekrar davranışı ondan bağımsız sınanır.
  const wordId = `w:${lexBox.window.QuranLexiconV1.lemmas.find((lemma) => lemma.pos === 'N' && lemma.root).id}:ar>tr`;
  ui.kaoQueue = [{ id: `kao:2026-10-06:${wordId}`, cardId: wordId, type: 'meaning', isNew: true }];
  ui.kaoTaskIndex = 0; ui.kaoUndo = null;
  answerCurrent(false);
  const retries = () => ui.kaoQueue.filter((item) => /:retry$/.test(item.id));
  assert.equal(retries().length, 1, 'yanlış cevap kuyruğa bir tekrar ekler');
  assert.equal(ui.kaoQueue[ui.kaoQueue.length - 1].id, `kao:2026-10-06:${wordId}:retry`, 'tekrar kuyruğun sonunda');
  assert.equal(ui.kaoQueue[ui.kaoQueue.length - 1].retry, true);
  assert.equal(ui.kaoTaskIndex, 0, 'yanlış cevap paneli açıkken indeks sabit');
  assert.equal(ui.kaoPanel.open, true);
  api.kaoContinue();
  assert.equal(ui.kaoTaskIndex, ui.kaoQueue.length - 1, 'Devam ile sıradaki görev tekrar');
  answerCurrent(false);
  assert.equal(retries().length, 1, 'tekrar da yanlışsa ikinci tekrar eklenmez');
}

// KAO-FIX-10 (O-3, 03 §10): milestone eşiği korunur; panel undo cevap etkilerini geri alır.
{
  const lexBox = { window: {} };
  vm.createContext(lexBox);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranLexiconV1.js'), 'utf8'), lexBox);
  const lemmas = lexBox.window.QuranLexiconV1.lemmas;
  const slice = (index) => lemmas.slice(Math.floor(index * lemmas.length / 12), Math.floor((index + 1) * lemmas.length / 12));
  const settled = (s) => ({ state: 'review', s, reps: 5, due: '2027-01-01T00:00:00.000Z', r: '2026-09-01T00:00:00.000Z' });
  const durable = { state: 'review', s: 30, reps: 8, due: '2027-01-01T00:00:00.000Z', r: '2026-09-01T00:00:00.000Z' };
  const now = '2026-10-05T10:00:00.000Z';
  const data = { quranLearn: null };
  const ui = {};
  const api = loadApi({ data() { return data; }, ui() { return ui; }, todayStr() { return '2026-10-05'; } });
  api.ensureQuranLearn(data);
  const q = data.quranLearn;
  const forward = (list, s) => { for (const lemma of list) q.cards[`w:${lemma.id}:ar>tr`] = settled(s); };
  // fatiha: Ünite 1'in tüm lemmaları ar>tr review ∧ s≥7; biri 6.9 iken yok.
  forward(slice(0), 7); q.cards[`w:${slice(0)[0].id}:ar>tr`].s = 6.9;
  assert.deepEqual(Array.from(api.kaoMilestoneCheck(data, now)), [], 'fatiha: eşiğin altında kazanılmaz');
  q.cards[`w:${slice(0)[0].id}:ar>tr`].s = 7;
  assert.deepEqual(Array.from(api.kaoMilestoneCheck(data, now)), ['fatiha'], 'fatiha: eşikte kazanılır');
  // namaz: Ünite 1–3.
  forward(slice(1), 7); forward(slice(2), 7); q.cards[`w:${slice(2)[0].id}:ar>tr`].s = 6.9;
  assert.deepEqual(Array.from(api.kaoMilestoneCheck(data, now)), ['fatiha'], 'namaz: Ünite 3 eksikken yok');
  q.cards[`w:${slice(2)[0].id}:ar>tr`].s = 7;
  assert.deepEqual(Array.from(api.kaoMilestoneCheck(data, now)), ['fatiha', 'namaz'], 'namaz: Ünite 1–3 tamam');
  // Kapsam taşları: bilinen = iki yönde kalıcı (FIX-07); en yüksek frekanstan eşiğe kadar.
  const byFreq = lemmas.slice().sort((a, b) => b.freq - a.freq);
  const known = (count) => { for (const lemma of byFreq.slice(0, count)) { q.cards[`w:${lemma.id}:ar>tr`] = Object.assign({}, durable); q.cards[`w:${lemma.id}:tr>ar`] = Object.assign({}, durable); } };
  const countFor = (ratio) => { let sum = 0; for (let i = 0; i < byFreq.length; i += 1) { sum += byFreq[i].freq; if (sum / 77430 >= ratio) return i + 1; } return Infinity; };
  const halfAt = countFor(0.5), twoThirdsAt = countFor(0.68), eightyAt = countFor(0.75);
  known(halfAt - 1);
  assert.ok(!api.kaoMilestoneCheck(data, now).includes('half'), 'half: kapsam 0,50 altında yok');
  known(halfAt);
  assert.ok(api.kaoMilestoneCheck(data, now).includes('half') && !api.kaoMilestoneCheck(data, now).includes('twoThirds'), 'half eşikte; twoThirds henüz yok');
  known(twoThirdsAt);
  assert.ok(api.kaoMilestoneCheck(data, now).includes('twoThirds'), 'twoThirds kapsam 0,68');
  // KAO-FIX-20 (kullanıcı kararı KF-12): 'eighty' taşı eşiği 0,75 (tavan %77,42; %80 kazanılamıyordu). Anahtar aynı kalır.
  known(eightyAt - 1);
  assert.ok(!api.kaoMilestoneCheck(data, now).includes('eighty'), 'eighty: kapsam 0,75 altında yok');
  known(eightyAt);
  assert.ok(api.kaoCoverage(data).ratio >= 0.75 && api.kaoMilestoneCheck(data, now).includes('eighty'), 'eighty: kapsam 0,75 eşikte kazanılır');
  assert.match(fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8'), /eighty:'%75 kapsam'/, 'etiket %75 kapsam');
  known(lemmas.length);
  // Üretim yolu: bir cevap kazanılanları ISO tarihle yazar; kapsam düşse ve undo yapılsa da taş kalır.
  const target = slice(11)[5];
  q.cards[`w:${target.id}:ar>tr`] = Object.assign({}, durable, { due: '2026-09-02T00:00:00.000Z' });
  q.settings.dailyNew = 0; q.settings.audio = false;
  api.kaoStart();
  const index = ui.kaoQueue.findIndex((item) => item.cardId === `w:${target.id}:ar>tr`);
  assert.ok(index >= 0, 'cevap için kart kuyrukta');
  ui.kaoTaskIndex = index; ui.kaoTasks = ui.kaoTasks || {};
  const item = ui.kaoQueue[index];
  const task = ui.kaoTasks[item.id] = api.kaoBuildTask(item, data, { seed: item.id });
  const beforeAnswer = JSON.stringify(q.milestones);
  api.kaoAnswer(task.id, task.choices.find((choice) => choice.correct).choiceId);
  for (const key of ['fatiha', 'namaz', 'half', 'twoThirds', 'eighty']) assert.match(String(q.milestones[key]), /^\d{4}-\d{2}-\d{2}T/, `${key} ISO tarihle yazılır`);
  assert.match(ui.kaoPanel.note, /✦$/, 'yeni taş panel notunda görünür');
  const earned = JSON.stringify(q.milestones);
  api.kaoUndo();
  assert.notEqual(earned, beforeAnswer, 'fixture cevapta yeni milestone kazandırdı');
  assert.equal(JSON.stringify(q.milestones), beforeAnswer, 'KAO2-06 panel undo milestone etkisini de geri alır');
  for (const id of Object.keys(q.cards)) if (id.endsWith(':tr>ar')) delete q.cards[id];
  assert.deepEqual(Array.from(api.kaoMilestoneCheck(data, now)), ['fatiha', 'namaz'], 'milestone kontrolü adayları kart kapsamından hesaplar; kayıt henüz kazanılmadı');
  assert.equal(JSON.stringify(q.milestones), beforeAnswer, 'kapsam düşse de geri alınmış milestone kaydı boş kalır');
}

// KAO-FIX-07 (Y-1, 02 §3): bilinen lemma = her iki yönde review ∧ s≥21 (yetim ve okuyucu-bilinmeyen hariç).
{
  const api = loadApi();
  const lexBox = { window: {} };
  vm.createContext(lexBox);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranLexiconV1.js'), 'utf8'), lexBox);
  const [a, b, c, e] = lexBox.window.QuranLexiconV1.lemmas;
  const durable = (s) => ({ state: 'review', s, reps: 6 });
  const cards = {
    [`w:${a.id}:ar>tr`]: durable(30),
    [`w:${b.id}:ar>tr`]: durable(21), [`w:${b.id}:tr>ar`]: durable(21),
    [`w:${c.id}:ar>tr`]: durable(40), [`w:${c.id}:tr>ar`]: { state: 'learning', s: 2, reps: 2 },
    [`w:${e.id}:ar>tr`]: { reps: 1, state: 'learning', s: 0 }
  };
  const known = api.kaoKnownLemmaSet({ quranLearn: { cards } });
  assert.equal(!!known[a.id], false, 'tek yönü review ∧ s=30 → bilinmiyor');
  assert.equal(!!known[b.id], true, 'iki yönü review ∧ s=21 → biliniyor');
  assert.equal(!!known[c.id], false, 'bir yönü learning → bilinmiyor');
  assert.equal(!!known[e.id], false, 'tek yanlış cevap (reps:1, learning) → bilinmiyor');
  assert.deepEqual(Object.keys(known), [b.id], 'yalnız iki yönde kalıcı lemma bilinir');
  const blocked = Object.assign({}, cards, { [`w:${b.id}:tr>ar`]: Object.assign(durable(21), { readerUnknown: true }) });
  assert.deepEqual(Object.keys(api.kaoKnownLemmaSet({ quranLearn: { cards: blocked } })), [], 'okuyucu-bilinmeyen yön bilineni düşürür');
  assert.equal(api.kaoCoverage({ quranLearn: { cards } }).known, b.freq, 'kaoCoverage = Σfreq(bilinen)');
  assert.equal(api.kaoCoverage({ quranLearn: { cards } }).ratio, b.freq / 77430, 'kaoCoverage paydası 77.430');
}

// KAO-FIX-21 (02 §5.6, KF-6): "bağ kur" görevi — öğrenilen her 5. yeni kelimeden (toplam sayaç: introducedAt'lı ar>tr
// kartlar + oturumdaki sıra) sonra, son 5 yeni kelimeden Türkçe türevi (cognate.tr) olanı sorulur. FSRS kartı yazmaz;
// sonuç daily[gün].link = {n, ok}. Gece oturumunda yok.
{
  const lexBox = { window: {} };
  vm.createContext(lexBox);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranLexiconV1.js'), 'utf8'), lexBox);
  const lemmas = lexBox.window.QuranLexiconV1.lemmas;
  const byId = Object.fromEntries(lemmas.map((lemma) => [lemma.id, lemma]));
  const pad = (n) => String(n).padStart(2, '0');
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();
  let bed = null;
  const data = { quranLearn: null, settings: {} };
  const ui = {};
  const api = loadApi({ data() { return data; }, ui() { return ui; }, todayStr() { return today; }, caffeineTargetBed() { return bed; } });
  const fresh = (introduced) => {
    data.quranLearn = null; api.ensureQuranLearn(data); data.quranLearn.settings.dailyNew = 20;
    // Önceden tanıtılmış lemmalar (vadesi gelecekte, kuyruğa girmez): toplam sayacı başlatır.
    for (const lemma of introduced) data.quranLearn.cards[`w:${lemma.id}:ar>tr`] = { state: 'learning', s: 2, reps: 1, due: '2099-01-01T00:00:00.000Z', introducedAt: '2026-09-01T10:00:00.000Z' };
  };
  const isNewForward = (item) => item.isNew && /^w:.+:ar>tr$/.test(item.cardId);
  const withCognate = lemmas.filter((lemma) => lemma.cognate && lemma.cognate.tr);
  let checked = 0;
  for (let prior = 0; prior <= 12; prior += 1) {
    fresh(prior ? withCognate.slice(-prior) : []);
    api.kaoStart();
    const queue = ui.kaoQueue;
    let counter = prior, expected = 0;
    queue.forEach((item, index) => {
      if (!isNewForward(item)) return;
      counter += 1;
      if (counter % 5 === 0) {
        expected += 1;
        const next = queue[index + 1];
        assert.ok(next && next.type === 'link' && /^k:/.test(next.cardId), `prior=${prior}: ${counter}. yeni kelimeden sonra bağ kur`);
        const lemmaId = next.cardId.slice(2);
        const window5 = queue.slice(0, index + 1).filter(isNewForward).map((x) => x.cardId.split(':')[1]).reverse().concat(Object.keys(data.quranLearn.cards).filter((id) => data.quranLearn.cards[id].introducedAt).map((id) => id.split(':')[1])).slice(0, 5);
        assert.ok(window5.includes(lemmaId), 'hedef son 5 yeni kelimeden biri');
        assert.ok(byId[lemmaId].cognate && byId[lemmaId].cognate.tr, 'hedefin Türkçe türevi var');
        assert.equal(next.isNew, false, 'bağ kur yeni kart sayılmaz');
        checked += 1;
      }
    });
    assert.equal(queue.filter((item) => item.type === 'link').length, expected, `prior=${prior}: bağ kur sayısı toplam sayaçla tutarlı`);
    for (let i = 2; i < queue.length; i += 1) assert.ok(!(queue[i].type === queue[i - 1].type && queue[i].type === queue[i - 2].type), 'bağ kur eklenince de aynı tür ≤2');
  }
  assert.ok(checked >= 5, `en az 5 bağ kur görevi sınandı (${checked})`);
  // Görev + cevap: bağ kur içeren ilk başlangıç sayısıyla.
  let link = null;
  for (let prior = 0; prior <= 12 && !link; prior += 1) { fresh(prior ? withCognate.slice(-prior) : []); api.kaoStart(); link = ui.kaoQueue.find((item) => item.type === 'link'); }
  assert.ok(link, 'bağ kur içeren oturum bulundu');
  const task = ui.kaoTasks[link.id];
  const target = byId[link.cardId.slice(2)];
  assert.equal(task.type, 'link');
  assert.equal(task.answer, target.cognate.tr);
  assert.equal(task.ar, target.ar, 'Arapça sözlük modülünden');
  assert.equal(task.cognate, null, 'cevap "Türkçede var" satırıyla sızmaz');
  assert.equal(task.choices.length, 4); assert.equal(task.choices.filter((choice) => choice.correct).length, 1);
  assert.equal(new Set(task.choices.map((choice) => choice.label)).size, 4, 'etiketler tekil');
  const html = api.kaoTaskHTML(task);
  assert.match(html, /Bağ kur/); assert.match(html, /class="kao-arabic-text" lang="ar"/); assert.doesNotMatch(html, /Türkçede var/);
  ui.kaoTaskIndex = ui.kaoQueue.indexOf(link); ui.kaoUndo = null;
  const cardsBefore = Object.keys(data.quranLearn.cards).length;
  api.kaoAnswer(task.id, task.choices.find((choice) => choice.correct).choiceId);
  assert.deepEqual(JSON.parse(JSON.stringify(data.quranLearn.daily[today].link)), { n: 1, ok: 1 });
  assert.equal(Object.keys(data.quranLearn.cards).length, cardsBefore, 'bağ kur FSRS kartı yazmaz');
  assert.ok(!Object.keys(data.quranLearn.cards).some((id) => /^k:/.test(id)));
  assert.equal(ui.kaoTaskIndex, ui.kaoQueue.indexOf(link), 'cevap panelinde indeks sabit kalır');
  assert.equal(ui.kaoPanel.open, true, 'bağ kur geri bildirim paneli açılır');
  api.kaoContinue();
  ui.kaoTaskIndex = ui.kaoQueue.indexOf(link); ui.kaoPanel = { open: false };
  api.kaoAnswer(task.id, task.choices.find((choice) => !choice.correct).choiceId);
  assert.deepEqual(JSON.parse(JSON.stringify(data.quranLearn.daily[today].link)), { n: 2, ok: 1 });
  assert.equal(ui.kaoPanel.answer, task.answer, 'yanlışta doğru türev panel durumuna yazılır');
  // Gece oturumu (hedef yatıştan 30 dk önce): yalnız tekrar kartları, bağ kur yok.
  const soon = new Date(Date.now() + 30 * 60000);
  bed = `${pad(soon.getHours())}:${pad(soon.getMinutes())}`;
  fresh(withCognate.slice(0, 4)); data.settings.targetBed = bed;
  api.kaoStart();
  assert.equal(ui.kaoNight, true, 'fixture: gece penceresi');
  assert.ok(!ui.kaoQueue.some((item) => item.type === 'link'), 'gece oturumunda bağ kur yok');
  data.settings.targetBed = undefined; bed = null;
}

// KAO-FIX-22 (02 §5.7, KF-6): hata taksonomisi → zayıf sınıf (≥3 hata, en yüksek) kuyrukta öne alınır; ana ekranda
// "en çok karıştırdıkların" tek satırı. 80 lemma × 2 yön vadesi gelmiş / 60 sınır: kognat zayıfsa anlamı kaymış 20 lemmanın
// 40 kartının hepsi girer (iki yön: KF-9 aynı tür ≤2 kuralı tek yönlü kuyruğu 2 görevde durdurur).
{
  const lexBox = { window: {} };
  vm.createContext(lexBox);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranLexiconV1.js'), 'utf8'), lexBox);
  const lemmas = lexBox.window.QuranLexiconV1.lemmas;
  const shifted = lemmas.filter((lemma) => lemma.cognate && lemma.cognate.shift).slice(0, 20);
  const plain = lemmas.filter((lemma) => !(lemma.cognate && lemma.cognate.shift)).slice(0, 60);
  const data = { quranLearn: null, settings: {} };
  const ui = {};
  const api = loadApi({ data() { return data; }, ui() { return ui; }, todayStr() { return '2026-10-05'; }, esc(value) { return String(value); }, icon(name) { return `<i>${name}</i>`; } });
  const setup = (errors) => {
    data.quranLearn = null; api.ensureQuranLearn(data); data.quranLearn.settings.dailyNew = 0;
    for (const lemma of shifted.concat(plain)) for (const dir of ['ar>tr', 'tr>ar']) data.quranLearn.cards[`w:${lemma.id}:${dir}`] = { state: 'review', s: 10, reps: 3, due: '2026-09-01T00:00:00.000Z', introducedAt: '2026-08-01T00:00:00.000Z' };
    Object.assign(data.quranLearn.errors, errors);
  };
  const shiftedInQueue = () => {
    const queue = api.kaoBuildQueue(data, '2026-10-05T10:00:00.000Z', { sessionId: '2026-10-05', candidates: api.kaoCandidates() });
    assert.equal(queue.length, 60, 'fixture: 60 vadesi gelmiş kart sınırı dolu');
    return queue.filter((item) => shifted.some((lemma) => item.cardId.startsWith(`w:${lemma.id}:`))).length;
  };
  setup({ cognate: 5, root: 1 });
  assert.equal(api.kaoWeakClass(data.quranLearn), 'cognate', 'zayıf sınıf: en yüksek, ≥3');
  assert.equal(shiftedInQueue(), 40, 'kognat zayıfken anlamı kaymış 20 lemmanın 40 kartının hepsi 60 sınırına girer');
  setup({ cognate: 2 });
  assert.equal(api.kaoWeakClass(data.quranLearn), null, '3 hatanın altında zayıf sınıf yok');
  assert.ok(shiftedInQueue() < 40, 'ağırlık yokken rastgele sıra: bazıları dışarıda kalır');
  setup({ root: 4, affix: 4, cognate: 3 });
  assert.equal(api.kaoWeakClass(data.quranLearn), 'root', 'eşitlikte sabit sıra (ses, kök, ek, kognat, kural, sıra): ilk en yüksek');
  // Ana ekran satırı: en çok iki sınıf, sayılarıyla; hata yoksa satır yok.
  setup({ cognate: 5, root: 3, order: 1 });
  let home = api.kaoHomeHTML('2026-10-05T10:00:00.000Z');
  assert.match(home, /En çok karıştırdıkların: Türkçe benzeri kelimeler \(5\) · kök \(3\)/);
  setup({});
  home = api.kaoHomeHTML('2026-10-05T10:00:00.000Z');
  assert.doesNotMatch(home, /En çok karıştırdıkların/);
}

// KAO-FIX-23 (02 §5.8, KF-6): uygulama niyeti — bugünün namaz vakitleri yalnız okunur (gün kaydı oluşturulmaz, yazılmaz),
// sıradaki vakitten sonra "5 dakika" önerisi yalnız hub kartında; bildirim yok, bugün çalışıldıysa ya da gece penceresinde yok.
{
  const times = { fajr: { time: '05:10' }, sunrise: { time: '06:35' }, dhuhr: { time: '13:05' }, asr: { time: '16:20' }, maghrib: { time: '19:01' }, isha: { time: '20:30' } };
  const data = { quranLearn: null, settings: {}, days: { '2026-10-05': { prayer: times } } };
  const ui = {};
  const pad = (n) => String(n).padStart(2, '0');
  let today = '2026-10-05';
  const api = loadApi({ data() { return data; }, ui() { return ui; }, todayStr() { return today; }, esc(value) { return String(value); }, icon(name) { return `<i>${name}</i>`; } });
  api.ensureQuranLearn(data);
  const before = JSON.stringify(data.days);
  assert.equal(api.kaoIntentSuggestion(data, '2026-10-05T10:00:00', '2026-10-05'), 'öğle namazından sonra 5 dakika (13:05)');
  assert.equal(api.kaoIntentSuggestion(data, '2026-10-05T04:00:00', '2026-10-05'), 'sabah namazından sonra 5 dakika (05:10)');
  assert.equal(api.kaoIntentSuggestion(data, '2026-10-05T19:30:00', '2026-10-05'), 'yatsı namazından sonra 5 dakika (20:30)');
  assert.equal(api.kaoIntentSuggestion(data, '2026-10-05T21:00:00', '2026-10-05'), 'yarın sabah namazından sonra 5 dakika', 'yatsıdan sonra yarın sabah');
  assert.equal(api.kaoIntentSuggestion(data, '2026-10-05T10:00:00', '2026-10-06'), '', 'vakit verisi yoksa öneri yok');
  assert.equal(JSON.stringify(data.days), before, 'namaz verisi yalnız okunur; gün kaydı oluşturulmaz');
  // Hub kartı: gerçek saatten bağımsız olsun diye bugünün tüm vakitleri 23:59.
  const now = new Date();
  today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const late = Object.fromEntries(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((key) => [key, { time: '23:59' }]));
  data.days[today] = { prayer: late };
  let hub = api.kaoHubCardHTML();
  if (now.getHours() * 60 + now.getMinutes() < 23 * 60 + 59) assert.match(hub, /<b>Niyet önerisi:<\/b> sabah namazından sonra 5 dakika \(23:59\)/);
  data.quranLearn.daily[today] = { answered: 2 };
  hub = api.kaoHubCardHTML();
  assert.doesNotMatch(hub, /Niyet önerisi/, 'bugün çalışıldıysa öneri yok');
  delete data.quranLearn.daily[today];
  assert.doesNotMatch(fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8'), /Notification|showNotification|SeyReminder/, 'bildirim üretilmez');
}

// KAO-FIX-24 (02 §5.10, KF-6): haftalık aktarım testi — son testten ≥7 gün sonra, hiç görülmemiş (anlaşıldı işaretli,
// önceki test ya da parça kartıyla eğitilmiş değil) ≥%95 kapsamlı âyette kelime kelime çeviri seçimi; sonuç q.transfer.
{
  const box = { window: {} };
  vm.createContext(box);
  for (const relative of ['app/content/quranLexiconV1.js', 'app/content/quranShortSurahsV1.js']) vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), box);
  const lemmas = box.window.QuranLexiconV1.lemmas;
  const words = box.window.QuranShortSurahsV1.words;
  const pad = (n) => String(n).padStart(2, '0');
  const now = new Date();
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const data = { quranLearn: null, settings: {} };
  const ui = {};
  const api = loadApi({ data() { return data; }, ui() { return ui; }, todayStr() { return today; }, esc(value) { return String(value); }, icon(name) { return `<i>${name}</i>`; } });
  const fresh = api.ensureQuranLearn({});
  assert.equal(fresh.transfer, undefined, 'taze durum şekli değişmez (alan ilk testte doğar)');
  api.ensureQuranLearn(data);
  data.quranLearn.settings.dailyNew = 0;
  for (const lemma of lemmas) for (const dir of ['ar>tr', 'tr>ar']) data.quranLearn.cards[`w:${lemma.id}:${dir}`] = { state: 'review', s: 40, reps: 8, due: '2099-01-01T00:00:00.000Z', introducedAt: '2026-01-01T00:00:00.000Z' };
  const first = api.kaoTransferCandidate(data, now);
  assert.ok(first && /^\d+:\d+$/.test(first.key), 'görülmemiş ≥%95 âyet bulunur');
  assert.ok(first.coverage.ratio >= 0.95);
  const [sid, ay] = first.key.split(':').map(Number);
  data.quranLearn.cards[`s:${sid}:${ay}:1`] = { state: 'review', s: 5, reps: 1, due: '2099-01-01T00:00:00.000Z' };
  assert.notEqual(api.kaoTransferCandidate(data, now).key, first.key, 'parça kartıyla eğitilmiş âyet dışlanır');
  delete data.quranLearn.cards[`s:${sid}:${ay}:1`];
  data.quranLearn.ayahs.understood = [first.key];
  assert.notEqual(api.kaoTransferCandidate(data, now).key, first.key, 'anlaşıldı işaretli âyet dışlanır');
  data.quranLearn.ayahs.understood = [];
  api.kaoStart();
  const last = ui.kaoQueue[ui.kaoQueue.length - 1];
  assert.equal(last.type, 'transfer', 'oturumun sonunda haftalık test');
  const task = ui.kaoTasks[last.id];
  const ayahWords = words.filter((word) => `${word.surahId}:${word.ayah}` === task.key).sort((a, b) => a.i - b.i);
  assert.equal(task.answer, ayahWords.map((word) => word.tr).join(' '), 'doğru cevap: kelime kelime Türkçe (doğrulanmış katman)');
  assert.equal(task.ar, ayahWords.map((word) => word.ar).join(' '), 'Arapça kısa sûre modülünden');
  assert.equal(task.choices.length, 4); assert.equal(task.choices.filter((choice) => choice.correct).length, 1);
  assert.equal(new Set(task.choices.map((choice) => choice.label)).size, 4, 'seçenekler tekil');
  const html = api.kaoTaskHTML(task);
  assert.match(html, /Yeni âyet/); assert.match(html, /class="kao-arabic-text" lang="ar"/);
  ui.kaoTaskIndex = ui.kaoQueue.length - 1; ui.kaoUndo = null;
  api.kaoAnswer(task.id, task.choices.find((choice) => choice.correct).choiceId);
  const t = JSON.parse(JSON.stringify(data.quranLearn.transfer));
  assert.equal(t.n, 1); assert.equal(t.ok, 1); assert.deepEqual(t.seen, [task.key]); assert.match(t.lastAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.ok(!Object.keys(data.quranLearn.cards).some((id) => /^t:/.test(id)), 'FSRS kartı yazılmaz');
  assert.equal(api.kaoTransferCandidate(data, now), null, '7 gün dolmadan yeni test yok');
  api.kaoStart();
  assert.ok(!ui.kaoQueue.some((item) => item.type === 'transfer'), 'aynı hafta ikinci test yok');
  data.quranLearn.transfer.lastAt = new Date(now.getTime() - 8 * 86400000).toISOString();
  const next = api.kaoTransferCandidate(data, now);
  assert.ok(next && next.key !== task.key, '8 gün sonra yeni ve görülmemiş âyet');
  assert.match(api.kaoStatsHTML(now.toISOString()), /Yeni âyet testi[\s\S]*1 \/ 1 doğru/);
  // ensureQuranLearn: bozuk alan normalleşir, veri silinmez.
  const junk = { quranLearn: { transfer: { n: 'x', ok: -2, seen: 'y', lastAt: 5 } } };
  assert.deepEqual(JSON.parse(JSON.stringify(api.ensureQuranLearn(junk).transfer)), { lastAt: null, n: 0, ok: 0, seen: [] });
}

// KAO-FIX-25 (04 §4, KF-6): FX — doğru cevapta SeyHaptics.tap + SeyAudio.tap; yeni kilometre taşında .success + konfeti
// (yalnız SeyFx.shouldAnimate); görev geçişinde SeyFx.enter(#kao-task düğümü); kapsam sayacı data-countup (render.js
// sweepCounters → SeyFx.countUp). FX modülleri yoksa sessizce atlanır; kendi kapıları (ayar, sessiz saat) onlarda.
{
  const calls = [];
  let animate = true;
  const sandbox = { window: {
    SeyAudio: { tap() { calls.push('audio.tap'); }, success() { calls.push('audio.success'); } },
    SeyHaptics: { tap() { calls.push('haptic.tap'); }, success() { calls.push('haptic.success'); } },
    SeyFx: { shouldAnimate() { return animate; }, enter(target) { calls.push(`enter:${target && target.id}`); } },
    SeymaHelpers: { confetti() { calls.push('confetti'); } }
  } };
  vm.createContext(sandbox);
  for (const relative of ['app/content/quranLexiconV1.js', 'app/content/quranGrammarV1.js', 'app/content/quranShortSurahsV1.js', 'app/content/quranCurriculumV2.js', 'app/content/quranRevelationOrderV1.js', 'app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), sandbox, { filename: relative });
  const api = sandbox.window.SeymaQuranLearn;
  const data = { quranLearn: null, settings: {} };
  const ui = {};
  const node = { id: 'kao-task', innerHTML: '', setAttribute() {}, removeAttribute() {}, querySelector() { return null; } };
  const deps = Object.fromEntries(['save', 'render'].map((name) => [name, function fixture() {}]));
  assert.equal(api.registerQuranLearn(Object.assign(deps, { data() { return data; }, ui() { return ui; }, todayStr() { return '2026-10-05'; }, esc(value) { return String(value); }, icon() { return ''; }, getDay() { return {}; } })), true);
  assert.equal(api.registerQuranLearnSurface({ lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return ''; }, restoreFocus() {}, sheetClose() {}, mount() {}, taskElement() { return node; }, createAudio() { return { addEventListener() {}, play() { return Promise.resolve(); } }; }, isQuietTime() { return false; }, setTimer() { return 0; }, clearTimer() {}, toast() {} }), true);
  api.ensureQuranLearn(data);
  const lemma = sandbox.window.QuranLexiconV1.lemmas.find((item) => item.root && !(item.cognate && item.cognate.shift));
  const item = { id: 'fx-1', cardId: `w:${lemma.id}:ar>tr`, isNew: true };
  const answer = (correct) => {
    ui.kaoQueue = [Object.assign({}, item), { id: 'fx-next', cardId: item.cardId, isNew: false }]; ui.kaoTasks = {}; ui.kaoTaskIndex = 0; ui.kaoTaskStartedAt = Date.now(); ui.kaoUndo = null;
    const task = api.kaoBuildTask(ui.kaoQueue[0], data, { seed: 'fx-1' }); ui.kaoTasks[task.id] = task;
    calls.length = 0;
    api.kaoAnswer(task.id, task.choices.find((choice) => choice.correct === correct).choiceId);
    api.kaoContinue();
    return calls.slice();
  };
  let got = answer(true);
  assert.ok(got.includes('haptic.tap') && got.includes('audio.tap'), 'doğru cevapta dokunma sesi + titreşim');
  assert.ok(got.includes('enter:kao-task'), 'görev geçişinde SeyFx.enter');
  assert.ok(!got.includes('confetti') && !got.includes('audio.success'), 'taş yokken kutlama yok');
  got = answer(false);
  assert.ok(!got.includes('audio.tap') && !got.includes('haptic.tap'), 'yanlışta doğru sesi yok');
  // Yeni taş: Ünite 1 lemmaları ar>tr s≥7 → fatiha; cevapla kazanılır.
  const unit1 = sandbox.window.QuranLexiconV1.lemmas.slice(0, Math.floor(sandbox.window.QuranLexiconV1.lemmas.length / 12));
  for (const l of unit1) data.quranLearn.cards[`w:${l.id}:ar>tr`] = { state: 'review', s: 8, reps: 4, due: '2099-01-01T00:00:00.000Z' };
  got = answer(true);
  assert.ok(data.quranLearn.milestones.fatiha, 'fixture: fatiha kazanıldı');
  assert.ok(got.includes('audio.success') && got.includes('haptic.success') && got.includes('confetti'), 'yeni taşta kutlama + konfeti');
  data.quranLearn.milestones.fatiha = null; animate = false;
  got = answer(true);
  assert.ok(got.includes('audio.success') && !got.includes('confetti'), 'hareket kapalıyken konfeti yok (ses kendi kapısıyla)');
  animate = true;
  // FX modülü yoksa atlanır.
  const bare = loadApi({ data() { return data; }, ui() { return ui; }, todayStr() { return '2026-10-05'; } });
  assert.doesNotThrow(() => bare.kaoHomeHTML('2026-10-05T10:00:00.000Z'));
  // KAO2-09 (c): kapsam yalnız bilinen kelime ≥1 iken görünür; en sık lemma iki yönde kalıcı yapılır.
  for (const dir of ['ar>tr', 'tr>ar']) data.quranLearn.cards[`w:${sandbox.window.QuranLexiconV1.lemmas[0].id}:${dir}`] = { state: 'review', s: 25, reps: 6, due: '2099-01-01T00:00:00.000Z' };
  assert.match(api.kaoHomeHTML('2026-10-05T10:00:00.000Z'), /<span data-countup="\d+" data-countup-key="kao-coverage">\d+<\/span>%/, 'kapsam sayacı countUp için işaretli');
}

console.log(`KAO requirements: PASS (R-A1/A2/A4/A5/A9, R-B1/B5/B8, R-C2/C3/C4/C5/C6; E7 ayarları kalıcı, DİA 524/524; iki yön, bit-bit undo, hedefli ${transitionMs.toFixed(3)} ms <50 ms)`);
