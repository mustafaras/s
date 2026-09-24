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

console.log(`KAO requirements: PASS (R-A1/A2/A4/A5, R-C2/C3/C5; iki yön, bit-bit undo, hedefli ${transitionMs.toFixed(3)} ms <50 ms)`);
