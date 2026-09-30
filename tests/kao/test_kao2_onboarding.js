'use strict';

// KAO2-11/12: ilk açılış (S-01, 05 §3), yerleştirme, geçiş notu ve A-1 ders başlangıcı.
// Sentetik VM, sahte saat; ağ, tarayıcı, ses ya da gerçek veri yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const INSTANT = '2026-09-28T09:00:00.000Z';
const TODAY = '2026-09-28';
const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const read = (file) => fs.readFileSync(path.join(repoRoot, file), 'utf8');

function boot(options = {}) {
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [INSTANT])); }
    static now() { return new Date(INSTANT).getTime(); }
  }
  const box = { window: {}, Date: FixedDate };
  vm.createContext(box);
  for (const name of CONTENT.filter((n) => !(options.without || []).includes(n))) vm.runInContext(read(`app/content/${name}.js`), box, { filename: name });
  for (const file of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) vm.runInContext(read(file), box, { filename: file });
  const state = { data: { settings: {}, days: {}, quranLearn: null }, ui: {}, saves: 0, renders: 0, audio: [] };
  const api = box.window.SeymaQuranLearn;
  assert.equal(api.registerQuranLearn({
    data: () => state.data, ui: () => state.ui, save() { state.saves += 1; }, render() { state.renders += 1; }, todayStr: () => TODAY, esc,
    icon: (name) => `<i data-icon="${name}"></i>`, getDay: () => ({})
  }), true);
  assert.equal(api.registerQuranLearnSurface({
    lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId: () => 'kao-hub-entry', restoreFocus() {},
    sheetClose(_card, _back, close) { close(); }, mount() {},
    createAudio(src) { state.audio.push(src); return { addEventListener() {}, play() { if (options.audioFails) throw new Error('no audio'); return Promise.resolve(); } }; }
  }), true);
  return { api, state, win: box.window };
}
const ISO = '2026-09-20T10:00:00.000Z';
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const call = (name, ...args) => `onclick="App.${name}(${args.map((a) => esc(JSON.stringify(a))).join(',')})"`;
const primaries = (html) => (html.match(/<button\b[^>]*class="kao-primary"[^>]*>[^<]*<\/button>/g) || []);
const overlay = (api) => api.kaoOverlayHTML(INSTANT);
const onboarding = (html) => { const m = html.match(/<section class="kao-screen kao-screen-onboard">[\s\S]*<\/section>/); assert.ok(m, 'ilk açılış ekranı çizildi'); return m[0]; };
function freshUser() { const b = boot(); b.state.data.quranLearn = null; return b; }
function openFresh(options) { const b = options ? boot(options) : freshUser(); assert.equal(b.api.kaoOpen(), true); return b; }
function toStep3(api, choice) { assert.equal(api.kaoOnboard('next'), true); assert.equal(api.kaoOnboard('choose', choice), true); }
function runPlacement(api, state, readingWrong, listeningWrong = []) {
  const tasks = api.kaoPlacementTasks();
  tasks.reading.forEach((task, i) => {
    const wrong = task.choices.find((c) => c !== task.answer);
    assert.equal(api.kaoOnboard('answer', readingWrong.includes(i) ? wrong : task.answer), true, `okuma ${i + 1}`);
  });
  if (state.ui.kaoOnboard.step !== 'placement') return tasks;
  tasks.listening.forEach((task, i) => {
    const wrong = task.choices.find((c) => c.id !== task.answer).id;
    assert.equal(api.kaoOnboard('answer', listeningWrong.includes(i) ? wrong : task.answer), true, `dinleme ${i + 1}`);
  });
  return tasks;
}

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

check('(a) kartsız ve doneAt boş kullanıcıda kaoOpen() → ilk açılış adım 1 (veri yazılmaz)', () => {
  const { api, state } = freshUser();
  assert.equal(api.kaoOpen(), true);
  assert.equal(state.ui.kaoView, 'home', 'ilk açılış ana ekranın modu; gezinme yığını değişmez');
  assert.equal(state.ui.kaoOnboard.step, 1);
  const html = onboarding(overlay(api));
  assert.match(html, /<h2[^>]*id="kao-onboard-title"[^>]*>Namazda söylediklerini anlamaya başla<\/h2>/);
  assert.match(text(html), /1\/3/);
  const lex = api.kaoOnboardFacts();
  assert.equal(lex.words, 524, 'kelime sayısı sözlükten türetilir');
  assert.equal(lex.percent, 77, 'kapsam yüzdesi sıklık verisinden türetilir (sabit metin yok)');
  assert.match(text(html), /524 kelime/); assert.match(text(html), /%77/);
  assert.equal(primaries(html).length, 1, 'tek birincil eylem');
  assert.ok(primaries(html)[0].includes(call('kaoOnboard', 'next')));
  assert.match(primaries(html)[0], />Başlayalım</);
  assert.ok(html.includes(call('kaoOnboard', 'skip')), 'Atla her adımda');
  assert.ok(html.includes('onclick="App.kaoClose()"'), 'ilk açılışta gezinme çubuğu kapatır (geri değil)');
  assert.equal(state.saves, 0, 'açılış veri yazmaz');
  assert.equal(api.ensureQuranLearn(state.data).onboarding.doneAt, null);
});

check('(a2) açık görünüm isteği ve hub eylemi: ilk açılış yalnız ana ekran yerine geçer', () => {
  const { api, state } = freshUser();
  assert.equal(api.kaoOpen('settings'), true);
  assert.equal(state.ui.kaoView, 'settings');
  assert.match(api.kaoHubCardHTML(), /onclick="App\.kaoOpen\(\)"/);
  api.kaoClose();
  assert.equal(api.kaoOpen(), true);
  assert.equal(state.ui.kaoOnboard.step, 1);
  assert.match(overlay(api), /kao-screen-onboard/);
});

check('(b) legacy kullanıcı: ilk açılış yok, "Yeni düzen" notu bir kez (whatsNewAt yazılır)', () => {
  const { api, state, win } = boot();
  const q = api.ensureQuranLearn(state.data);
  const lemma = win.QuranCurriculumV2.units[0].lessons[0].lemmaIds[0];
  q.cards[`w:${lemma}:ar>tr`] = { state: 'review', s: 3, reps: 2, due: '2026-10-01T00:00:00.000Z' };
  api.ensureQuranLearn(state.data);
  assert.equal(q.onboarding.doneAt, 'legacy');
  const cardsBefore = JSON.stringify(q.cards);
  assert.equal(api.kaoOpen(), true);
  assert.equal(state.ui.kaoView, 'home');
  assert.equal(q.onboarding.whatsNewAt, INSTANT, 'not gösterildiği an kaydedilir');
  assert.equal(state.saves, 1);
  const html = overlay(api);
  assert.match(html, /class="kao-notice"/);
  assert.match(text(html), /Yeni düzen/);
  assert.equal((html.match(/<li class="kao-notice-item">/g) || []).length, 3, '3 madde');
  assert.ok(html.includes(call('kaoOnboard', 'whats-new-close')), 'kapatılabilir');
  assert.equal(primaries(html).length, 1, 'not birincil eylem eklemez');
  assert.equal(api.kaoOnboard('whats-new-close'), true);
  assert.doesNotMatch(overlay(api), /class="kao-notice"/);
  api.kaoClose();
  assert.equal(api.kaoOpen(), true);
  assert.doesNotMatch(overlay(api), /class="kao-notice"/, 'ikinci açılışta not yok');
  assert.equal(q.onboarding.whatsNewAt, INSTANT);
  assert.equal(state.saves, 1, 'yalnız bir kez yazılır');
  assert.equal(JSON.stringify(q.cards), cardsBefore, 'FSRS kartları değişmez');
  assert.equal(api.kaoOnboard('start'), false, 'legacy kullanıcı ilk açılışa zorlanamaz');
});

check('(c) "Henüz değil" → start=s0, S0 Ders 1; "Evet, rahat okurum" → level1, Ünite 1 Ders 1', () => {
  let b = openFresh();
  toStep3(b.api, 'none');
  assert.equal(b.state.ui.kaoOnboard.step, 3);
  assert.match(primaries(onboarding(overlay(b.api)))[0], />Harflerle başla</);
  assert.equal(b.api.kaoOnboard('finish'), true);
  let q = b.api.ensureQuranLearn(b.state.data);
  assert.equal(q.onboarding.start, 's0');
  assert.equal(q.onboarding.doneAt, INSTANT);
  assert.equal(b.state.ui.kaoView, 'session', 'son düğme S0 ders oynatıcısını açar');
  let step = b.api.kaoNextStep(INSTANT);
  assert.equal(step.kind, 's0-lesson'); assert.equal(step.param, 's0.01');

  b = openFresh();
  toStep3(b.api, 'fluent');
  const unit1 = b.win.QuranCurriculumV2.units[0];
  assert.match(primaries(onboarding(overlay(b.api)))[0], new RegExp(`>${unit1.title} ile başla<`));
  assert.equal(b.api.kaoOnboard('finish'), true);
  assert.equal(b.state.ui.kaoView, 'session', 'son düğme Fâtiha dersini açar');
  q = b.api.ensureQuranLearn(b.state.data);
  assert.equal(q.onboarding.start, 'level1');
  step = b.api.kaoNextStep(INSTANT);
  assert.equal(step.kind, 'daily'); assert.equal(step.param, unit1.lessons[0].id);
});

check('(A-1) üç dokunuş: Başlayalım → Evet, rahat okurum → Fâtiha ile başla → ilk tanış kartı', () => {
  const b = openFresh(), unit1 = b.win.QuranCurriculumV2.units[0], first = unit1.lessons[0].lemmaIds[0];
  assert.equal(b.api.kaoOnboard('next'), true);
  assert.equal(b.api.kaoOnboard('choose', 'fluent'), true);
  assert.match(primaries(onboarding(overlay(b.api)))[0], new RegExp(`>${unit1.title} ile başla<`));
  assert.equal(b.api.kaoOnboard('finish'), true);
  assert.equal(b.state.ui.kaoView, 'session');
  const html = overlay(b.api);
  assert.match(html, /data-lesson-stage="intro"/);
  assert.match(html, /class="kao-lesson-ar" lang="ar" dir="rtl"/);
  assert.match(html, /class="kao-lesson-reading" lang="tr"/);
  assert.match(html, /class="kao-lesson-audio"/);
  assert.equal(b.state.ui.kaoLesson.plan[b.state.ui.kaoLesson.at].lemmaId, first);
  assert.deepEqual(Array.from(b.api.ensureQuranLearn(b.state.data).path.lessons[unit1.lessons[0].id].introducedLemmas), [first]);
});

check('(c2) "Harekeyle, yavaşça" → 8 okuma + 4 dinleme; kapı görevlerinin alt kümesi, Arapça içerikten', () => {
  const { api, state, win } = openFresh();
  assert.equal(api.kaoOnboard('next'), true);
  assert.equal(api.kaoOnboard('choose', 'slow'), true);
  assert.equal(state.ui.kaoOnboard.step, 'placement');
  const tasks = api.kaoPlacementTasks(), gate = api.kaoGateTasks();
  assert.equal(tasks.reading.length, 8); assert.equal(tasks.listening.length, 4);
  const gateReading = new Map(gate.reading.map((t) => [t.id, t])), gateListening = new Map(gate.listening.map((t) => [t.id, t]));
  assert.ok(tasks.reading.every((t) => JSON.stringify(gateReading.get(t.id)) === JSON.stringify(t)), 'okuma = kapı görevinin aynısı');
  assert.ok(tasks.listening.every((t) => JSON.stringify(gateListening.get(t.id)) === JSON.stringify(t)), 'dinleme = kapı görevinin aynısı');
  const lex = win.QuranLexiconV1;
  assert.ok(tasks.reading.every((t) => lex.byId(t.id.slice(5)).ar === t.ar), 'Arapça yalnız sözlük modülünden');
  const html = onboarding(overlay(api));
  assert.match(text(html), /Okuma 1\/8/);
  assert.ok(html.includes('lang="ar" dir="rtl"'));
  assert.equal(primaries(html).length, 0);
  runPlacement(api, state, [], []);
  assert.equal(state.ui.kaoOnboard.step, 3);
  assert.match(text(onboarding(overlay(api))), /Okuma 8\/8/);
});

check('(c3) yerleştirme ≥7/8 → level1; <7/8 → s0 + yalnız eksik S0 dersleri önerilir', () => {
  let b = openFresh();
  b.api.kaoOnboard('next'); b.api.kaoOnboard('choose', 'slow');
  runPlacement(b.api, b.state, [3], [0, 1, 2, 3]);
  assert.match(primaries(onboarding(overlay(b.api)))[0], /ile başla</);
  assert.equal(b.api.kaoOnboard('finish'), true);
  let q = b.api.ensureQuranLearn(b.state.data);
  assert.equal(q.onboarding.start, 'level1', 'karar okumaya göre (7/8)');
  assert.equal(q.onboarding.placement.reading, 7);
  assert.equal(q.onboarding.placement.readingTotal, 8);
  assert.deepEqual(Object.keys(q.path.lessons).filter((id) => /^s0\./.test(id)), [], 'level1 S0 işaretlemez');

  b = openFresh();
  b.api.kaoOnboard('next'); b.api.kaoOnboard('choose', 'slow');
  const tasks = runPlacement(b.api, b.state, [0, 1, 2], [0]);
  assert.match(primaries(onboarding(overlay(b.api)))[0], />Harflerle başla</);
  assert.match(text(onboarding(overlay(b.api))), /Okuma 5\/8/);
  b.api.kaoOnboard('finish');
  q = b.api.ensureQuranLearn(b.state.data);
  const s0 = b.win.QuranCurriculumV2.s0.lessons.map((l) => l.id), missing = q.onboarding.placement.missing;
  assert.equal(q.onboarding.start, 's0');
  assert.ok(missing.length > 0 && missing.length < s0.length, 'eksik ders listesi tam yol değil');
  assert.deepEqual(missing, s0.filter((id) => missing.includes(id)), 'müfredat sırasında');
  assert.ok(missing.includes('s0.12'), 'okuma provası her zaman kalır (Besmele taşı yerleştirmeyle verilmez)');
  assert.ok(missing.includes('s0.07'), 'okuma hatası → konum şekilleri');
  // Yanlış: min (mim·esre·nun), mâ (mim·üstün·elif), inn (hemzeli elif·esre·nun·şedde); ta/tta çifti.
  // → üstün s0.01 · nokta ailesi s0.02 · esre s0.03 · elif s0.05 · konum s0.07 · med/şedde s0.09 · kalan harfler s0.10 · prova s0.12
  assert.deepEqual(Array.from(missing), ['s0.01', 's0.02', 's0.03', 's0.05', 's0.07', 's0.09', 's0.10', 's0.12']);
  assert.ok(!missing.includes('s0.08') && !missing.includes('s0.11'), 'sükûn/tenvin içermeyen hatalar o dersleri istemez');
  assert.equal(tasks.reading[0].answer, 'min', 'fikstür sözlük sırasına bağlı');
  const pair = tasks.listening[0];
  pair.choices.forEach((c) => assert.ok(missing.includes(b.api.kaoS0LessonOfLetter(c.id)), `yanlış çift harfi ${c.id}`));
  s0.forEach((id) => {
    const rec = q.path.lessons[id];
    if (missing.includes(id)) {
      if (id === missing[0]) { assert.ok(rec && rec.startedAt, `${id} ilk eksik S0 dersi açılır`); assert.equal(rec.doneAt, null); }
      else assert.equal(rec, undefined, `${id} eksik → işaretlenmez`);
    }
    else { assert.equal(rec.doneAt, INSTANT); assert.equal(rec.via, 'placement'); assert.equal(rec.score, null); }
  });
  const step = b.api.kaoNextStep(INSTANT);
  assert.equal(step.kind, 's0-lesson'); assert.equal(step.param, missing[0], 'sıradaki S0 dersi ilk eksik ders');
});

check('(c4) içerik eksikse yerleştirme sınamadan ders işaretlemez; tam S0 yolu önerilir', () => {
  const b = openFresh({ without: ['quranLexiconV1'] });
  b.api.kaoOnboard('next');
  assert.equal(b.api.kaoOnboard('choose', 'slow'), true);
  assert.equal(b.state.ui.kaoOnboard.step, 3, 'okuma görevi yoksa doğrudan adım 3');
  b.api.kaoOnboard('finish');
  const q = b.api.ensureQuranLearn(b.state.data), s0 = b.win.QuranCurriculumV2.s0.lessons.map((l) => l.id);
  assert.equal(q.onboarding.start, 's0');
  assert.deepEqual(Array.from(q.onboarding.placement.missing), Array.from(s0), 'kanıt yok → tüm S0 dersleri eksik sayılır');
  assert.ok(!q.path.lessons[s0[0]].doneAt, 'hiçbir ders yerleştirmeyle tamam işaretlenmez; ilk ders yalnız açılır');
  assert.equal(Object.keys(q.path.lessons).length, 1, 'yalnız ilk S0 dersi oynatıcıda başlar');
});

check('(d) Adım 3: süre → dailyNew, niyet → intent, ses anahtarı → settings.audio (measured)', () => {
  let b = openFresh();
  toStep3(b.api, 'fluent');
  let html = onboarding(overlay(b.api));
  assert.match(text(html), /Günde ne kadar\?/);
  assert.match(html, /aria-pressed="true"[^>]*>5 dk</);
  assert.match(text(html), /Günde ~5 yeni kelime/);
  assert.match(html, /role="switch" aria-checked="true" aria-label="Sesli öğren"/, 'ses varsayılan açık (O-02)');
  assert.equal(b.api.kaoOnboard('minutes', 10), true);
  assert.equal(b.api.kaoOnboard('minutes', 7), false, 'yalnız 5/10/15');
  assert.equal(b.api.kaoOnboard('intent', 'isha'), true);
  assert.equal(b.api.kaoOnboard('intent', 'brunch'), false);
  html = onboarding(overlay(b.api));
  assert.match(text(html), /Günde ~10 yeni kelime/);
  assert.match(html, /aria-pressed="true"[^>]*>Yatsı</);
  assert.equal(b.state.saves, 0, 'seçimler bitene kadar yazılmaz');
  b.api.kaoOnboard('finish');
  let q = b.api.ensureQuranLearn(b.state.data);
  assert.equal(q.onboarding.minutes, 10); assert.equal(q.settings.dailyNew, 10);
  assert.equal(q.onboarding.intent, 'isha');
  assert.equal(q.settings.audio, true); assert.equal(q.settings.audioStyle, 'measured');
  assert.equal(b.state.saves, 2, 'onboarding ayarları ve ilk tanış ilerlemesi ayrı ayrı kaydedilir');

  b = openFresh();
  toStep3(b.api, 'fluent');
  b.state.data.quranLearn.settings.audioStyle = 'flowing';
  assert.equal(b.api.kaoOnboard('audio'), true);
  assert.match(onboarding(overlay(b.api)), /role="switch" aria-checked="false" aria-label="Sesli öğren"/);
  b.api.kaoOnboard('minutes', 15);
  b.api.kaoOnboard('finish');
  q = b.api.ensureQuranLearn(b.state.data);
  assert.equal(q.settings.audio, false); assert.equal(q.settings.dailyNew, 15); assert.equal(q.onboarding.intent, null);
});

check('(e) "Atla" her adımda: level1, 5 dk, ses açık + doneAt; Bugün ekranı', () => {
  const routes = [[], ['next'], ['next', ['choose', 'slow']], ['next', ['choose', 'none'], ['minutes', 15]]];
  for (const route of routes) {
    const b = openFresh();
    route.forEach((a) => (Array.isArray(a) ? b.api.kaoOnboard(...a) : b.api.kaoOnboard(a)));
    assert.ok(onboarding(overlay(b.api)).includes(call('kaoOnboard', 'skip')), `Atla görünür (${JSON.stringify(route)})`);
    assert.equal(b.api.kaoOnboard('skip'), true);
    const q = b.api.ensureQuranLearn(b.state.data);
    assert.deepEqual({ start: q.onboarding.start, minutes: q.onboarding.minutes, dailyNew: q.settings.dailyNew, audio: q.settings.audio, doneAt: q.onboarding.doneAt },
      { start: 'level1', minutes: 5, dailyNew: 5, audio: true, doneAt: INSTANT });
    assert.equal(b.state.ui.kaoView, 'home');
    assert.equal(b.api.kaoNextStep(INSTANT).kind, 'daily');
    assert.equal(b.api.kaoOnboard('skip'), false, 'bitmiş ilk açılış yeniden yazılmaz');
  }
});

check('(f) geri ve son düğme etiketi seçime göre; adım sırası korunur', () => {
  const { api, state } = openFresh();
  assert.equal(api.kaoOnboard('back'), false, 'adım 1 geri yok');
  api.kaoOnboard('next');
  const html = onboarding(overlay(api));
  assert.match(text(html), /Arapça harfleri okuyabiliyor musun\?/);
  assert.ok(html.includes(call('kaoOnboard', 'back')));
  ['none', 'slow', 'fluent'].forEach((c) => assert.ok(html.includes(call('kaoOnboard', 'choose', c)), c));
  assert.equal(primaries(html).length, 0, 'seçenekler eylemdir, ayrı birincil düğme yok');
  assert.equal(api.kaoOnboard('choose', 'maybe'), false);
  api.kaoOnboard('choose', 'none');
  assert.match(primaries(onboarding(overlay(api)))[0], />Harflerle başla</);
  api.kaoOnboard('back');
  assert.equal(state.ui.kaoOnboard.step, 2);
  api.kaoOnboard('choose', 'fluent');
  assert.match(primaries(onboarding(overlay(api)))[0], /ile başla</);
  assert.doesNotMatch(primaries(onboarding(overlay(api)))[0], /Harflerle/);
  assert.equal(api.kaoOnboard('answer', 'x'), false, 'yerleştirme dışında cevap yok');
  assert.equal(api.kaoOnboard('bogus'), false);
});

check('(g) ses yüklenemezse yerleştirme yalnız okumayla karar verir (R-C2)', () => {
  const b = openFresh({ audioFails: true });
  b.api.kaoOnboard('next'); b.api.kaoOnboard('choose', 'slow');
  const tasks = b.api.kaoPlacementTasks();
  tasks.reading.forEach((t, i) => b.api.kaoOnboard('answer', i < 2 ? t.choices.find((c) => c !== t.answer) : t.answer));
  assert.equal(b.api.kaoOnboard('audio-skip'), false, 'ses hatası olmadan atlanmaz');
  let html = onboarding(overlay(b.api));
  assert.match(text(html), /Dinleme 1\/4/);
  assert.ok(html.includes(call('kaoOnboard', 'play', tasks.listening[0].pairId)));
  assert.equal(b.api.kaoOnboard('play', tasks.listening[0].pairId), true);
  assert.equal(b.state.ui.kaoAudioFailed, true);
  html = onboarding(overlay(b.api));
  assert.ok(html.includes(call('kaoOnboard', 'audio-skip')), 'ses hatasında dinleme atlanabilir');
  assert.equal(b.api.kaoOnboard('audio-skip'), true);
  assert.equal(b.state.ui.kaoOnboard.step, 3);
  b.api.kaoOnboard('finish');
  const q = b.api.ensureQuranLearn(b.state.data);
  assert.equal(q.onboarding.placement.audioDeferred, true); assert.equal(q.onboarding.placement.listening, null); assert.equal(q.onboarding.placement.reading, 6);
  assert.equal(q.onboarding.start, 's0');
});

check('Bugün kahramanı: onboarding eylemi ilk açılışa bağlı; normalizasyon yerleştirmeyi korur', () => {
  const { api, state } = freshUser();
  api.kaoOpen('settings');
  api.kaoSetView('home');
  assert.ok(primaries(overlay(api))[0].includes(call('kaoOnboard', 'start')));
  assert.equal(api.kaoOnboard('start'), true);
  assert.equal(state.ui.kaoView, 'home'); assert.equal(state.ui.kaoOnboard.step, 1);
  const d = { quranLearn: { onboarding: { doneAt: ISO, start: 's0', placement: { reading: 5, readingTotal: 8, listening: 3, listeningTotal: 4, audioDeferred: false, missing: ['s0.12', 'x', 's0.07', 's0.07'], at: ISO } } } };
  api.ensureQuranLearn(d);
  assert.deepEqual(JSON.parse(JSON.stringify(d.quranLearn.onboarding.placement)), { reading: 5, readingTotal: 8, listening: 3, listeningTotal: 4, audioDeferred: false, missing: ['s0.07', 's0.12'], at: ISO });
  const bad = { quranLearn: { onboarding: { doneAt: ISO, placement: 'bozuk' } } };
  api.ensureQuranLearn(bad);
  assert.equal(bad.quranLearn.onboarding.placement, null);
  const old = { quranLearn: { onboarding: { doneAt: ISO } } };
  api.ensureQuranLearn(old);
  assert.equal('placement' in old.quranLearn.onboarding, false, 'eski kayda alan eklenmez');
});

check('handler sayacı 41 (§4 + KAO2-19 okuyucu) ve app.js tek satır shim; yorumlarda pin tuzağı yok', () => {
  const app = read('app.js');
  const names = new Set((app.match(/App\.kao[A-Za-z0-9_]*\s*=[^=]/g) || []).map((s) => s.match(/App\.kao[A-Za-z0-9_]*/)[0]));
  // KAO2-19 okuyucu eylemiyle 40 -> 41.
  assert.equal(names.size, 41);
  assert.ok(names.has('App.kaoOnboard'));
  assert.equal((app.match(/App\.kaoOnboard=function\(action,value\)\{ return window\.SeymaQuranLearn\.kaoOnboard\.apply\(null,arguments\); \};/g) || []).length, 1);
  for (const file of ['app/core/quranLearn.js', 'app/core/quranLearnViews.js']) {
    const comments = (read(file).match(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g) || []).join('\n');
    assert.doesNotMatch(comments, /App\.[A-Za-z0-9_]+\s*=|onclick/, `${file} yorumları`);
  }
});

check('06 CSS: KAO2-11 bloğu yalnız --kao-*/--f-* tokenı, 600/700, süs yok', () => {
  const css = read('app/kao.css');
  const start = css.indexOf('/* KAO2-11');
  assert.ok(start >= 0, 'KAO2-11 CSS bloğu');
  const block = css.slice(start, css.indexOf('/* KAO2-11 son */'));
  for (const sel of ['.kao-onboard', '.kao-onboard-points', '.kao-onboard-option', '.kao-onboard-seg', '.kao-onboard-ar', '.kao-notice']) assert.ok(block.includes(sel), sel);
  const vars = [...new Set((block.match(/var\(--[a-z0-9-]+/g) || []).map((v) => v.slice(4)))];
  assert.deepEqual(vars.filter((v) => !/^--(?:kao|f|dur)-/.test(v)), [], 'kao dışı token');
  assert.ok((block.match(/font-weight:\s*(\d+)/g) || []).every((w) => /600|700/.test(w)));
  assert.doesNotMatch(block, /text-transform|letter-spacing|box-shadow|gradient|:hover|translateY|#[0-9a-f]{3,6}\b/i);
  assert.match(block, /forced-colors/);
});

console.log(`KAO2-12 onboarding: PASS (${passed} kontrol)`);
