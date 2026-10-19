'use strict';
// K3P-15 · Üç kollu geri bildirim (K-C, A-4). Sentetik VM; ağ, tarayıcı, gerçek veri yok.
//   - Hızlı doğru (süre kişisel medyanın altı): tam panel açılmaz; şık doğru + ✓; 600 ms sonra otomatik geçiş.
//   - Yavaş doğru (medyanın üstü ya da bu görevde ses dinlendi): tek satırlık şerit; 1.600 ms sonra geçiş;
//     şeride dokunulursa (Devam = mevcut kaoContinue çoğaltıcısı) otomatik geçiş durur ve aynı dokunuş ilerletir.
//   - Yanlış: tam kart, otomatik geçiş yok, "Yanlışlıkla dokundum" geri alması var.
//   - Ayar kapalıysa (autoAdvance === false): doğru cevapta kompakt şerit + tek "Devam" dokunuşu.
//   - Medyan yalnız `ui.kaoLatency` içinde (son 50); kalıcı yazılmaz. Yeni kullanıcı varsayılanı autoAdvance: true,
//     mevcut kullanıcının kayıtlı değeri değişmez.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

let now = Date.parse('2026-10-11T12:00:00.000Z');
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
  'app/content/quranCurriculumV2.js',
  'app/content/quranPhonicsV1.js',
  'app/content/quranRevelationOrderV1.js',
  'app/content/quranStrikingVersesV1.js',
  'app/core/quranLearnFlow.js',
  'app/core/quranLearnViews.js',
  'app/core/quranLearn.js'
]) vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), sandbox, { filename: relative });

const api = sandbox.window.SeymaQuranLearn;
const timers = [];
let cleared = 0;
let data = { quranLearn: null };
const ui = { kaoQueue: [], kaoTasks: {}, kaoTaskIndex: 0, kaoTaskStartedAt: 0, kaoUndo: null, kaoFeedback: '', kaoAudioFailed: false, kaoPanel: { open: false } };

assert.equal(api.registerQuranLearn({
  data() { return data; }, ui() { return ui; }, save() {}, render() {},
  todayStr() { return '2026-10-11'; }, esc(value) { return String(value == null ? '' : value); }, icon(name) { return `<i>${name}</i>`; }, getDay() { return {}; }
}), true);
assert.equal(api.registerQuranLearnSurface({
  lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return ''; }, restoreFocus() {},
  sheetClose(_e, _b, done) { if (done) done(); }, mount() {}, taskElement() { return null; },
  createAudio(src) { return { src, preload: '', addEventListener() {}, play() { return Promise.resolve(); } }; },
  isQuietTime() { return false; }, setTimer(fn, ms) { timers.push({ fn, ms }); return timers.length; }, clearTimer() { cleared += 1; }, toast() {}
}), true);

function freshData(settings = {}) {
  data = { quranLearn: Object.assign(api.emptyQuranLearn(), { settings: Object.assign({ dailyNew: 10, audio: false, autoAdvance: true }, settings) }) };
  api.ensureQuranLearn(data);
  ui.kaoQueue = []; ui.kaoTasks = {}; ui.kaoTaskIndex = 0; ui.kaoTaskStartedAt = now - 300;
  ui.kaoUndo = null; ui.kaoFeedback = ''; ui.kaoOrderDraft = []; ui.kaoPanel = { open: false };
  ui.kaoDurableCount = 0; ui.kaoLatency = []; ui.kaoPlayed = false;
  timers.length = 0; cleared = 0;
}

const choice = (choiceId, label, correct) => ({ choiceId, label, correct });
function wordTask(id, cardId) {
  return { id, cardId, type: 'word', kind: 'meaning', direction: 'tr>ar', meaning: 'Anlam', answer: 'Doğru anlam', isNew: true,
    choices: [choice('right', 'Doğru anlam', true), choice('wrong', 'Yanlış anlam', false), choice('other', 'Başka anlam', false)] };
}
function show(task) {
  ui.kaoQueue = [{ id: task.id, cardId: task.cardId, type: task.type, isNew: task.isNew }];
  ui.kaoTasks = { [task.id]: task }; ui.kaoTaskIndex = 0; ui.kaoTaskStartedAt = now - 300;
}
const sheet = (html) => (html.match(/<section class="kao-feedback-sheet[\s\S]*?<\/section>/) || [''])[0];
const strip = (html) => /<p class="kao-feedback-strip" role="status"/.test(html);
const stripContinue = (html) => /class="kao-feedback-strip-continue"[^>]*onclick="App\.kaoContinue\(\)"/.test(html);

// ---- A · Hızlı doğru (autoAdvance açık): panel açılmaz, 600 ms sonra otomatik geçiş ----------
freshData({ autoAdvance: true });
ui.kaoLatency = [1000];                 // kişisel medyan 1000 ms
ui.kaoTaskStartedAt = now - 300;        // bu yanıt 300 ms → hızlı
const fast = wordTask('fast', 'w:l_fast:ar>tr');
show(fast); ui.kaoTaskStartedAt = now - 300;
assert.equal(api.kaoAnswer(fast.id, 'right').correct, true);
const fastHtml = api.kaoTaskHTML(fast);
assert.equal(ui.kaoPanel.open, true);
assert.equal(ui.kaoPanel.slow, false, 'hızlı doğru yavaş kola düşmemeli');
assert.match(fastHtml, /kao-choice-correct/, 'doğru şık işaretli');
assert.match(fastHtml, /kao-choice-mark" aria-hidden="true">✓/, 'doğru şık ✓ işareti alır');
assert.ok(!sheet(fastHtml), 'hızlı doğruda tam panel açılmaz');
assert.ok(!strip(fastHtml), 'hızlı doğruda pekiştirme şeridi de yok');
assert.equal(timers.length, 1, 'hızlı doğruda tek otomatik geçiş zamanlayıcısı');
assert.equal(timers[0].ms, 600, 'hızlı doğru 600 ms');
assert.deepEqual(ui.kaoLatency, [1000, 300], 'doğru yanıt süresi yalnız feedback açılırken bir kez eklenir');
timers[0].fn();
assert.equal(ui.kaoTaskIndex, 1, '600 ms sonra zamanlayıcı ilerletir');
assert.equal(ui.kaoPanel.open, false);
assert.deepEqual(ui.kaoLatency, [1000, 300], 'Devam/otomatik ilerleme aynı yanıtı ikinci kez eklemez');

// ---- B · Yavaş doğru (medyanın üstü): pekiştirme şeridi, 1.600 ms, dokunuş durdurur ----------
freshData({ autoAdvance: true });
ui.kaoLatency = [1000];
ui.kaoTaskStartedAt = now - 2000;       // medyanın üstü → yavaş
const slow = wordTask('slow', 'w:l_slow:ar>tr');
show(slow); ui.kaoTaskStartedAt = now - 2000;
assert.equal(api.kaoAnswer(slow.id, 'right').correct, true);
assert.equal(ui.kaoPanel.slow, true, 'yavaş doğru yavaş kol');
const slowHtml = api.kaoTaskHTML(slow);
assert.ok(strip(slowHtml), 'tek satırlık pekiştirme şeridi görünür');
assert.ok(!sheet(slowHtml), 'yavaş doğruda tam kart yerine şerit');
assert.equal(timers.length, 1);
assert.equal(timers[0].ms, 1600, 'yavaş doğru 1.600 ms');
timers[0].fn();
assert.equal(ui.kaoTaskIndex, 1, '1.600 ms sonra ilerletir');

freshData({ autoAdvance: true });
ui.kaoLatency = [1000];
ui.kaoTaskStartedAt = now - 100;        // hızlı olsa bile ses dinlendi → yavaş kol
ui.kaoPlayed = true;
const replayed = wordTask('replayed', 'w:l_replay:ar>tr');
show(replayed); ui.kaoTaskStartedAt = now - 100; ui.kaoPlayed = true;
assert.equal(api.kaoAnswer(replayed.id, 'right').correct, true);
assert.equal(ui.kaoPanel.slow, true, 'ses dinlenen görevde doğru cevap yavaş kol');
assert.equal(timers[0].ms, 1600);

// dokunuş: şeritteki "Devam" otomatik geçişi durdurur ve ilerletir (mevcut kaoContinue çoğaltıcısı).
freshData({ autoAdvance: true });
ui.kaoLatency = [1000];
ui.kaoTaskStartedAt = now - 2000;
const tapped = wordTask('tapped', 'w:l_tap:ar>tr');
show(tapped); ui.kaoTaskStartedAt = now - 2000;
api.kaoAnswer(tapped.id, 'right');
assert.ok(stripContinue(api.kaoTaskHTML(tapped)), 'yavaş şeritte "Devam" dokunuşu var');
assert.equal(timers.length, 1);
assert.equal(api.kaoContinue(), true, 'şerit Devam ilerletir');
assert.ok(cleared >= 1, 'dokunuş bekleyen otomatik geçiş zamanlayıcısını durdurur');
assert.equal(ui.kaoTaskIndex, 1);

// ---- C · Yanlış: tam kart, otomatik geçiş yok, geri alma var --------------------------------
freshData({ autoAdvance: true });
ui.kaoLatency = [1000];
const wrong = wordTask('wrong', 'w:l_wrong:ar>tr');
show(wrong);
assert.equal(api.kaoAnswer(wrong.id, 'wrong').correct, false);
const wrongHtml = api.kaoTaskHTML(wrong);
assert.ok(sheet(wrongHtml), 'yanlışta tam kart açılır');
assert.match(wrongHtml, /Yanlışlıkla dokundum/, 'geri alma düğmesi');
assert.match(wrongHtml, /App\.kaoUndo\(\)/);
assert.match(wrongHtml, /App\.kaoContinue\(\)/, 'yanlışta Devam beklenir');
assert.equal(timers.length, 0, 'yanlışta otomatik geçiş zamanlayıcısı yok');
assert.equal(ui.kaoPanel.open, true);
assert.notEqual(ui.kaoPanel.slow, true, 'yanlışta yavaş işareti yok');
assert.deepEqual(ui.kaoLatency, [1000, 300], 'yanlış yanıt da geçerli oturum örneğine katılır');

// ---- D · Ayar kapalı: kompakt şerit + tek "Devam" dokunuşu ----------------------------------
freshData({ autoAdvance: false });
const off = wordTask('off', 'w:l_off:ar>tr');
show(off);
assert.equal(api.kaoAnswer(off.id, 'right').correct, true);
const offHtml = api.kaoTaskHTML(off);
assert.ok(strip(offHtml), 'ayar kapalıyken kompakt şerit');
assert.ok(stripContinue(offHtml), 'tek "Devam" dokunuşu');
assert.ok(!sheet(offHtml), 'tam kart yok');
assert.equal(timers.length, 0, 'ayar kapalıyken otomatik geçiş yok');
assert.equal(api.kaoContinue(), true);
assert.equal(ui.kaoTaskIndex, 1, 'tek dokunuş ilerletir');

// ---- E · Varsayılan ve medyan: yeni kullanıcı açık, mevcut kapalıya dokunulmaz ---------------
assert.equal(api.emptyQuranLearn().settings.autoAdvance, true, 'yeni kullanıcı varsayılanı açık');
const kept = api.ensureQuranLearn({ quranLearn: { settings: { autoAdvance: false } } });
assert.equal(kept.settings.autoAdvance, false, 'mevcut kullanıcının kapalı ayarı korunur');
const repaired = api.ensureQuranLearn({ quranLearn: { settings: {} } });
assert.equal(repaired.settings.autoAdvance, false, 'eksik alan normalizasyonda kapalıya düşer; yalnız emptyQuranLearn açık başlatır');

freshData({ autoAdvance: true });
for (let i = 1; i <= 60; i += 1) { ui.kaoLatency.push(i); ui.kaoLatency = ui.kaoLatency.slice(-50); }
assert.equal(ui.kaoLatency.length, 50, 'medyan penceresi en çok 50 ölçüm');
assert.equal(ui.kaoLatency[0], 11, 'pencere en eskiyi düşürür');
assert.equal(JSON.stringify(data).includes('kaoLatency'), false, 'medyan kalıcı veriye yazılmaz');

// K3PD-05: bağımsız sınırlar — invalid örnekler dışarıda, son 50 geçerli örnek, doğru+yanlış birlikte.
freshData({ autoAdvance: true });
ui.kaoLatency = [0, NaN, -10, 1000, 3000]; // geçerli medyan 2000 ms
const invalidWindow = wordTask('invalid-window', 'w:l_invalid_window:ar>tr');
show(invalidWindow); ui.kaoTaskStartedAt = now - 1999;
assert.equal(api.kaoAnswer(invalidWindow.id, 'right').correct, true);
assert.equal(ui.kaoPanel.slow, false, '0/NaN/negatif örnekler dışlanınca 1999 ms < medyan 2000 ms');
assert.equal(ui.kaoLatency.length, 3, 'bozuk eski örnekler temizlenip tek yeni örnek tutulur');

freshData({ autoAdvance: true });
ui.kaoLatency = [0, NaN, -1];
const emptyWindow = wordTask('empty-window', 'w:l_empty_window:ar>tr');
show(emptyWindow); ui.kaoTaskStartedAt = now - 100;
assert.equal(api.kaoAnswer(emptyWindow.id, 'right').correct, true);
assert.equal(ui.kaoPanel.slow, true, 'boş geçerli pencere açıkça yavaş kola düşer');
assert.deepEqual(ui.kaoLatency, [100], 'geçersiz süre örnekleri medyana eklenmez');

freshData({ autoAdvance: true });
ui.kaoLatency = Array.from({ length: 51 }, (_, index) => index + 1);
const lastFifty = wordTask('last-fifty', 'w:l_last_fifty:ar>tr');
show(lastFifty); ui.kaoTaskStartedAt = now - 26;
assert.equal(api.kaoAnswer(lastFifty.id, 'right').correct, true);
assert.equal(ui.kaoPanel.slow, false, 'son 50 örneğin medyanı 26,5 ms; 26 ms hızlı kalır');
assert.equal(ui.kaoLatency.length, 50, 'pencere 50 geçerli örnekle sınırlı kalır');

freshData({ autoAdvance: true });
ui.kaoLatency = [1000, 2000, 3000, 4000, 100000];
const outlierMedian = wordTask('outlier-median', 'w:l_outlier_median:ar>tr');
show(outlierMedian); ui.kaoTaskStartedAt = now - 10000;
assert.equal(api.kaoAnswer(outlierMedian.id, 'right').correct, true);
assert.equal(ui.kaoPanel.slow, true, '10 sn yanıt medyan 3 sn eşiğini geçer; 100 sn uç değer ortalamaya çevrilmez');

freshData({ autoAdvance: true });
const wrongSample = wordTask('mixed-wrong', 'w:l_mixed_wrong:ar>tr');
show(wrongSample); ui.kaoTaskStartedAt = now - 20000;
assert.equal(api.kaoAnswer(wrongSample.id, 'wrong').correct, false);
assert.deepEqual(ui.kaoLatency, [20000], 'yanlış yanıt örneği dahil edilir');
assert.equal(api.kaoContinue(), true);
const correctSample = wordTask('mixed-correct', 'w:l_mixed_correct:ar>tr');
show(correctSample); ui.kaoTaskStartedAt = now - 10000;
assert.equal(api.kaoAnswer(correctSample.id, 'right').correct, true);
assert.equal(ui.kaoPanel.slow, false, '10 sn, önceki yanlış yanıtın oluşturduğu 20 sn medyandan hızlıdır');
assert.deepEqual(ui.kaoLatency, [20000, 10000], 'doğru ve yanlış aynı oturum medyanına birer kez girer');
assert.equal(api.kaoContinue(), true);
assert.deepEqual(ui.kaoLatency, [20000, 10000], 'doğru cevapta devam ikinci latency örneği eklemez');
const mixedMedianBoundary = wordTask('mixed-boundary', 'w:l_mixed_boundary:ar>tr');
show(mixedMedianBoundary); ui.kaoTaskStartedAt = now - 14999;
assert.equal(api.kaoAnswer(mixedMedianBoundary.id, 'right').correct, true);
assert.equal(ui.kaoPanel.slow, false, 'bağımsız karma medyan (20+10)/2=15 sn; 14,999 ms hızlıdır');

// medyan hesabı: doğru kol seçilir (5 örnek → 3. değer).
freshData({ autoAdvance: true });
for (const value of [10, 20, 30, 40, 50]) { ui.kaoLatency.push(value); }
const mid = wordTask('mid', 'w:l_mid:ar>tr');
show(mid); ui.kaoTaskStartedAt = now - 35; // medyan 30 → 35 yavaş
assert.equal(api.kaoAnswer(mid.id, 'right').correct, true);
assert.equal(ui.kaoPanel.slow, true, 'medyanı aşan süre yavaş kol');

// K3PD-05: kişisel pencere yalnız açık öğrenme oturumuna aittir.
freshData({ autoAdvance: true });
ui.kaoLatency = [12000, 18000];
api.kaoStart();
assert.ok(Array.isArray(ui.kaoLatency), 'yeni oturum latency penceresini dizi olarak başlatmalı');
assert.equal(ui.kaoLatency.length, 0, 'yeni oturum önceki oturumun latency medyanını taşımamalı');

freshData({ autoAdvance: true });
ui.kaoLatency = [12000, 18000];
assert.equal(api.kaoLesson('start', 'u01.01'), true, 'yeni ders oturumu başlamalı');
assert.equal(ui.kaoLatency.length, 0, 'yeni ders oturumu önceki latency medyanını taşımamalı');
ui.kaoLatency = [14000];
assert.equal(api.kaoLesson('start', 'u01.01'), true, 'etkin ders aynı oturum olarak açılmalı');
assert.deepEqual(ui.kaoLatency, [14000], 'etkin ders oturumuna dönmek aynı medyanı korumalı');

freshData({ autoAdvance: true });
const firstUnit = sandbox.window.QuranCurriculumV2.units[0];
const firstLemma = firstUnit.lessons[0].lemmaIds[0];
data.quranLearn.path.lessons[firstUnit.lessons[0].id] = { introducedLemmas: [firstLemma] };
ui.kaoLatency = [12000, 18000];
assert.equal(api.kaoLesson('start', firstUnit.id), true, 'yeni ustalık oturumu başlamalı');
assert.equal(ui.kaoLatency.length, 0, 'yeni ustalık oturumu önceki latency medyanını taşımamalı');
ui.kaoLatency = [14000];
assert.equal(api.kaoLesson('start', firstUnit.id), true, 'etkin ustalık aynı oturum olarak açılmalı');
assert.deepEqual(ui.kaoLatency, [14000], 'etkin ustalık oturumuna dönmek aynı medyanı korumalı');

freshData({ autoAdvance: true });
const repairUnit = sandbox.window.QuranCurriculumV2.units[0];
data.quranLearn.path.units[String(repairUnit.id)] = { repair: { lemmaIds: [repairUnit.lessons[0].lemmaIds[0]] } };
ui.kaoLatency = [12000, 18000];
assert.equal(api.kaoLesson('start', `repair:${repairUnit.id}`), true, 'yeni onarım oturumu başlamalı');
assert.equal(ui.kaoLatency.length, 0, 'yeni onarım oturumu önceki latency medyanını taşımamalı');
ui.kaoLatency = [14000];
assert.equal(api.kaoLesson('start', `repair:${repairUnit.id}`), true, 'etkin onarım aynı oturum olarak açılmalı');
assert.deepEqual(ui.kaoLatency, [14000], 'etkin onarım oturumuna dönmek aynı medyanı korumalı');

console.log('test_k3p_feedback_arms: PASS (hızlı/yavaş/yanlış/kapalı kollar, varsayılan, medyan)');
