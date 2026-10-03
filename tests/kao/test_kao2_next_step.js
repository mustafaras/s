'use strict';

// KAO2-08: "sıradaki adım" motoru. Tablo güdümlü, sentetik veri, sahte saat;
// ağ, tarayıcı ya da gerçek kullanıcı verisi yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const NOW_MS = Date.parse('2026-09-28T12:00:00.000Z');
class ClockDate extends Date {
  constructor(...args) { super(...(args.length ? args : [NOW_MS])); }
  static now() { return NOW_MS; }
}
const sandbox = { window: {}, Date: ClockDate, Math, Number, String, Object, Array, JSON };
vm.createContext(sandbox);
for (const relative of [
  'app/content/quranLexiconV1.js',
  'app/content/quranGrammarV1.js',
  'app/content/quranShortSurahsV1.js',
  'app/content/quranPhonicsV1.js',
  'app/content/quranCurriculumV2.js',
  'app/core/quranLearnFlow.js',
  'app/core/quranLearnViews.js',
  'app/core/quranLearn.js'
]) vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), sandbox, { filename: relative });

const api = sandbox.window.SeymaQuranLearn;
const flow = sandbox.window.SeymaQuranLearnFlow;
const cur = sandbox.window.QuranCurriculumV2;
const content = { curriculum: cur };
const now = new ClockDate(NOW_MS);
const TODAY = '2026-09-28';
const ISO = '2026-09-20T10:00:00.000Z';
const plain = (value) => JSON.parse(JSON.stringify(value));

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

for (const name of ['curriculum', 'lessonOf', 'lessonProgress', 'unitProgress', 'nextStep', 'estimateMinutes']) {
  assert.equal(typeof flow[name], 'function', `Flow.${name} eksik`);
}
assert.equal(typeof api.kaoNextStep, 'function', 'kaoNextStep motor sarmalayıcısı eksik');

const unit = (id) => cur.units.find((u) => u.id === id);
function baseQ(extra = {}) {
  const q = api.ensureQuranLearn({});
  q.onboarding = Object.assign({}, q.onboarding, { doneAt: ISO, start: 'level1' });
  return Object.assign(q, extra);
}
function reviewCards(count, dueIso) {
  const cards = {};
  cur.units[5].lessons.flatMap((l) => l.lemmaIds).slice(0, count).forEach((id) => {
    cards[`w:${id}:ar>tr`] = { state: 'review', s: 10, due: dueIso, r: ISO };
  });
  return cards;
}
function doneLessons(q, unitId) {
  unit(unitId).lessons.forEach((l) => { q.path.lessons[l.id] = { startedAt: ISO, doneAt: ISO, score: 1 }; });
}
function step(q, night = false) {
  const snap = { quranLearn: q, night };
  const before = JSON.stringify(snap);
  const result = flow.nextStep(snap, now, content);
  assert.equal(JSON.stringify(snap), before, 'nextStep girdiyi değiştirdi');
  for (const key of ['kind', 'title', 'subtitle', 'action']) assert.equal(typeof result[key], 'string', key);
  assert.ok(result.title.trim() && result.subtitle.trim(), `${result.kind}: başlık/alt başlık boş`);
  assert.ok(Number.isFinite(result.minutes) && result.minutes >= 0, `${result.kind}: dakika`);
  assert.ok('param' in result);
  return result;
}
const PAST = '2026-09-27T08:00:00.000Z';
const FUTURE = '2026-10-10T08:00:00.000Z';

check('(1) ilk açılış yapılmadı → onboarding', () => {
  const q = api.ensureQuranLearn({});
  assert.equal(step(q).kind, 'onboarding');
});

check('(2) gece penceresi → night-review (kaoNightWindow değerleri)', () => {
  const q = baseQ({ cards: reviewCards(12, PAST) });
  const r = step(q, { active: true, durationMinutes: 3, maxCards: 8, reviewOnly: true });
  assert.equal(r.kind, 'night-review');
  assert.equal(r.minutes, 3);
  assert.match(r.subtitle, /8 kart/);
});

check('(3) S0 seçildi, bitmedi → s0-lesson + doğru ders', () => {
  const q = baseQ();
  q.onboarding.start = 's0';
  q.path.lessons['s0.01'] = { startedAt: ISO, doneAt: ISO, score: 1 };
  q.path.lessons['s0.02'] = { startedAt: ISO, doneAt: ISO, score: 1 };
  const r = step(q);
  assert.equal(r.kind, 's0-lesson');
  assert.equal(r.param, 's0.03');
});

check('(4) bugün ders yok → daily (tekrar + ders parçası + dakika)', () => {
  const q = baseQ({ cards: reviewCards(3, PAST) });
  const r = step(q);
  assert.equal(r.kind, 'daily');
  assert.equal(r.param, 'u01.01');
  assert.deepEqual(plain(r.counts), { reviews: 3, fresh: 3 });
  assert.match(r.subtitle, /3 tekrar/);
  assert.ok(r.minutes >= 1);
});

check('(5) ünite dersleri bitti, ustalık yok → mastery', () => {
  const q = baseQ();
  doneLessons(q, 1);
  const r = step(q);
  assert.equal(r.kind, 'mastery');
  assert.equal(r.param, 1);
});

check('(6) ünite tamam → next-unit', () => {
  const q = baseQ();
  doneLessons(q, 1);
  q.path.units['1'] = { masteryAt: ISO, masteryScore: 0.9 };
  const r = step(q);
  assert.equal(r.kind, 'next-unit');
  assert.equal(r.param, unit(2).lessons[0].id);
  assert.ok(r.title.includes(unit(2).title));
});

// K2F-07: onarım, atlama ve öncelik (repair > mastery). Ünite tamam = dersler bitti ∧ (masteryAt ∨ skippedAt).
check('(5a) dersler bitti + onarım var → repair (başlık "Onarım: <ünite>", eylem repair:<id>)', () => {
  const q = baseQ();
  doneLessons(q, 1);
  const lemmaIds = unit(1).lessons[0].lemmaIds.slice(0, 2);
  q.path.units['1'] = { masteryAt: null, masteryScore: 0.5, attempts: 1, lastAttemptAt: ISO, repair: { lemmaIds, at: ISO }, skippedAt: null };
  const r = step(q);
  assert.equal(r.kind, 'repair');
  assert.equal(r.param, 'repair:1');
  assert.equal(r.title, `Onarım: ${unit(1).title}`);
  assert.ok(r.minutes >= 1);
});

check('(5b) onarım bitti (repair:null, deneme>0) → yeniden mastery', () => {
  const q = baseQ();
  doneLessons(q, 1);
  q.path.units['1'] = { masteryAt: null, masteryScore: 0.5, attempts: 1, lastAttemptAt: ISO, repair: null, skippedAt: null };
  const r = step(q);
  assert.equal(r.kind, 'mastery');
  assert.equal(r.param, 1);
});

check('(5c) skippedAt dolu → sonraki ünitenin adımı (taş yok)', () => {
  const q = baseQ();
  doneLessons(q, 1);
  q.path.units['1'] = { masteryAt: null, skippedAt: ISO };
  const r = step(q);
  assert.equal(r.kind, 'next-unit');
  assert.equal(r.param, unit(2).lessons[0].id);
});

check('(5d) öncelik: masteryAt dolu ve onarım kalıntısı olsa da sonraki ünite; repair > mastery', () => {
  const q = baseQ();
  doneLessons(q, 1);
  q.path.units['1'] = { masteryAt: ISO, masteryScore: 0.9, repair: { lemmaIds: unit(1).lessons[0].lemmaIds.slice(0, 1), at: ISO } };
  assert.equal(step(q).kind, 'next-unit');
  q.path.units['1'] = { masteryAt: null, attempts: 2, repair: { lemmaIds: unit(1).lessons[0].lemmaIds.slice(0, 1), at: ISO } };
  assert.equal(step(q).kind, 'repair');
});

check('(5e) dersler bitmeden ustalık/onarım sunulmaz: sıradaki ders önce gelir', () => {
  const q = baseQ();
  unit(1).lessons.slice(0, 2).forEach((l) => { q.path.lessons[l.id] = { startedAt: ISO, doneAt: ISO, score: 1 }; });
  q.path.units['1'] = { masteryAt: null, attempts: 1, repair: { lemmaIds: unit(1).lessons[0].lemmaIds.slice(0, 1), at: ISO } };
  const r = step(q);
  assert.notEqual(r.kind, 'repair');
  assert.notEqual(r.kind, 'mastery');
});

check('(7) bugün bitti → rest', () => {
  const q = baseQ();
  q.daily[TODAY] = { answered: 12, correct: 10, new: 5, reviewed: 7, sessionDone: true };
  assert.equal(step(q).kind, 'rest');
});

check('(kenar) tekrar borcu > 60 → yeni kelime 0', () => {
  const q = baseQ({ cards: reviewCards(61, PAST) });
  const r = step(q);
  assert.equal(r.kind, 'daily');
  assert.equal(r.counts.fresh, 0);
  assert.equal(r.counts.reviews, 20);
});

check('(kenar) tekrar borcu > 60 + yeni ünite → next-unit değil, yalnız tekrar (05 §10)', () => {
  const q = baseQ({ cards: reviewCards(61, PAST) });
  doneLessons(q, 1);
  q.path.units['1'] = { masteryAt: ISO, masteryScore: 0.9 };
  const r = step(q);
  assert.equal(r.kind, 'daily');
  assert.deepEqual(plain(r.counts), { reviews: 20, fresh: 0 });
  assert.doesNotMatch(r.title, /Sıradaki ünite/);
  assert.match(r.subtitle, /önce tekrarları bitirelim/);
});

check('(kenar) 7+ gün ara → warmup (en zayıf 10)', () => {
  const q = baseQ({ cards: reviewCards(14, FUTURE) });
  q.daily['2026-09-20'] = { answered: 8, correct: 6, new: 2, reviewed: 6 };
  const r = step(q);
  assert.equal(r.kind, 'warmup');
  assert.equal(r.counts.reviews, 10);
});

check('lessonOf, lessonProgress, unitProgress, türetilmiş tamamlama', () => {
  assert.equal(flow.lessonOf(content, 'l_ll_ah_d0a09b'), 'u01.01');
  assert.equal(flow.lessonOf(content, 'yok'), null);
  const q = baseQ();
  const first = unit(1).lessons[0];
  assert.deepEqual(plain(flow.lessonProgress(q, first.id, content)), { total: first.lemmaIds.length, introduced: 0, settled: 0, done: false });
  first.lemmaIds.forEach((id) => { q.cards[`w:${id}:ar>tr`] = { state: 'review', s: 9, due: FUTURE }; });
  assert.deepEqual(plain(flow.lessonProgress(q, first.id, content)), { total: first.lemmaIds.length, introduced: first.lemmaIds.length, settled: first.lemmaIds.length, done: true });
  const up = flow.unitProgress(q, 1, content);
  assert.equal(up.words, 23); assert.equal(up.lessons, unit(1).lessons.length);
  assert.equal(up.lessonsDone, 1); assert.equal(up.known, first.lemmaIds.length); assert.equal(up.mastery, false);
  assert.equal(flow.curriculum(content).lessonById[first.id].id, first.id);
});

check('estimateMinutes: veri yoksa 0,55 dk/görev; günlük süre üst sınırı', () => {
  assert.equal(flow.estimateMinutes({}, 10, now, 15), 6);
  assert.equal(flow.estimateMinutes({}, 100, now, 5), 5);
  assert.equal(flow.estimateMinutes({}, 0, now, 5), 0);
  assert.equal(flow.estimateMinutes({ [TODAY]: { answered: 10, ms: 60000 } }, 10, now, 30), 1);
});

check('Flow saf: DOM/ağ/zamanlayıcı/depo/Date.now yok', () => {
  const src = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearnFlow.js'), 'utf8');
  for (const banned of ['document', 'location', 'fetch', 'setTimeout', 'localStorage', 'Date.now']) {
    assert.ok(!src.includes(banned), `Flow içinde yasak: ${banned}`);
  }
});

let motorData = null;
check('motor: kaoNextStep gerçek veriyle Flow çağırır; kaoContinue oturum sonunda sessionDone yazar', () => {
  const data = { quranLearn: api.emptyQuranLearn() };
  motorData = data;
  const ui = { kaoQueue: [], kaoTasks: {}, kaoTaskIndex: 0, kaoPanel: { open: false } };
  assert.equal(api.registerQuranLearn({
    data() { return data; }, ui() { return ui; }, save() {}, render() {}, todayStr() { return TODAY; },
    esc(v) { return String(v == null ? '' : v); }, icon(n) { return n; }, getDay() { return {}; }
  }), true);
  assert.equal(api.registerQuranLearnSurface({
    lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return ''; }, restoreFocus() {},
    sheetClose() {}, mount() {}, taskElement() { return null; }, setTimer() { return 0; }, clearTimer() {}, toast() {}
  }), true);
  assert.equal(api.kaoNextStep(now).kind, 'onboarding');
  data.quranLearn.onboarding.doneAt = ISO; data.quranLearn.onboarding.start = 'level1';
  assert.equal(api.kaoNextStep(now).kind, 'daily');
  ui.kaoQueue = [{ id: 'a' }, { id: 'b' }]; ui.kaoTaskIndex = 0; ui.kaoPanel = { open: true };
  api.kaoContinue();
  assert.equal((data.quranLearn.daily[TODAY] || {}).sessionDone, undefined, 'oturum bitmeden sessionDone yazıldı');
  ui.kaoPanel = { open: true };
  api.kaoContinue();
  assert.equal(data.quranLearn.daily[TODAY].sessionDone, true);
  assert.equal(api.kaoNextStep(now).kind, 'rest');
  ui.kaoQueue = [{ id: 'n' }]; ui.kaoTaskIndex = 0; ui.kaoNight = true; ui.kaoPanel = { open: true };
  delete data.quranLearn.daily[TODAY].sessionDone;
  api.kaoContinue();
  assert.equal(data.quranLearn.daily[TODAY].sessionDone, undefined, 'gece tekrarı günlük dersi tamamlamaz');
});

// ---- K2F-31 · görev sayısına dayalı süre tahmini ----------------------------------
const W = sandbox.window;
const fullContent = { curriculum: cur, lexicon: W.QuranLexiconV1, grammar: W.QuranGrammarV1, shorts: W.QuranShortSurahsV1, phonics: W.QuranPhonicsV1 };
const planTasks = (q, lessonId) => flow.lessonPlan({ quranLearn: q }, lessonId, now, fullContent).filter((i) => ['intro', 'practice', 'apply'].includes(i.kind)).length;
const fullStep = (q) => flow.nextStep({ quranLearn: q }, now, fullContent);
const withCap = (q, minutes) => { q.onboarding.minutes = minutes; return q; };

check('K2F-31 (b): ders dakikası görev sayısından gelir (tekrar + tanış + alıştırma + uygula); uzun ders "~2 dk" değildir', () => {
  const q = withCap(baseQ(), 15);
  const r = fullStep(q), tasks = planTasks(q, 'u01.01');
  assert.ok(tasks >= 12, `gerçek ders plan adımı: ${tasks}`);
  assert.equal(r.minutes, flow.estimateMinutes({}, tasks, now, 15));
  assert.ok(r.minutes >= 6, `dakika: ${r.minutes}`);
  assert.match(r.subtitle, new RegExp(`~${r.minutes} dk$`));
});

check('K2F-31 (b): tekrar sayısı göreve eklenir', () => {
  const lean = withCap(baseQ(), 15), busy = withCap(baseQ({ cards: reviewCards(12, PAST) }), 15);
  const a = fullStep(lean), b = fullStep(busy);
  assert.equal(b.counts.reviews, 12);
  assert.equal(b.minutes, flow.estimateMinutes({}, 12 + planTasks(busy, 'u01.01'), now, 15));
  assert.ok(b.minutes > a.minutes);
});

check('K2F-31 (c): son 7 günün ölçülmüş süresi varsa ortalama kullanılır', () => {
  const q = withCap(baseQ(), 15);
  q.daily['2026-09-27'] = { answered: 10, ms: 300000 };
  const r = fullStep(q), tasks = planTasks(q, 'u01.01');
  assert.equal(r.minutes, flow.estimateMinutes(q.daily, tasks, now, 15));
  assert.ok(r.minutes < flow.estimateMinutes({}, tasks, now, 15), 'ölçülmüş 0,5 dk/görev, varsayılan 0,55 dk/görevden kısa');
});

check('K2F-31 (d): tekrar 0 iken alt satır "N yeni kelime · ~M dk" — "0 tekrar" yazılmaz', () => {
  const q = withCap(baseQ(), 15);
  const r = fullStep(q);
  assert.equal(r.counts.reviews, 0);
  assert.ok(r.counts.fresh > 0);
  assert.equal(r.subtitle, `${r.counts.fresh} yeni kelime · ~${r.minutes} dk`);
  assert.doesNotMatch(r.subtitle, /0 tekrar/);
});

check('K2F-31: üretim yolu (kaoNextStep) tam içerikle çalışır — dakika/alt satır fullContent ile aynıdır', () => {
  const q = motorData.quranLearn; // 'motor' kontrolünün kaydettiği veri (api tek kez kayıtlıdır)
  Object.assign(q.onboarding, { doneAt: ISO, start: 'level1', minutes: 15 });
  const prod = api.kaoNextStep(now), full = flow.nextStep({ quranLearn: q }, now, fullContent);
  assert.equal(prod.kind, 'daily');
  assert.equal(prod.minutes, full.minutes);
  assert.equal(prod.subtitle, full.subtitle);
  assert.ok(prod.minutes > flow.nextStep({ quranLearn: q }, now, { curriculum: cur }).minutes, 'eksik içerik daha az adım sayardı');
});

console.log(`KAO2-08 next step: PASS (${passed} kontrol)`);
