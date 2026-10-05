'use strict';

// KAO2-27 → K2F-36 · Kabul ölçütleri A-1…A-10, GERÇEK koşullardan ölçülür (09 §2).
// Sentetik node:vm; ağ, tarayıcı, gerçek kullanıcı verisi yok. A-11/A-12 cihazda/kullanıcıda.
// K2F-36 ilkesi: totoloji (sabit sayı), dosya sayımı ve regex sayımı ölçüm sayılmaz. Her satır, gerçek handler
// çağrılarının, gerçek render çıktısının ya da çalıştırılan alt sürecin çıkış kodunun sonucudur.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn, execFileSync } = require('node:child_process');
const os = require('node:os');
const { bootKao, freshUser, seed, openView, walkLesson, playLesson, text, repoRoot } = require('./helpers/kao-harness');

const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');
const decode = (h) => String(h).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
// Dolgulu birincil düğme: yalnız tam sınıf adı (kao-primary-x gibi türevler sayılmaz).
const primaries = (html) => (String(html).match(/class="(?:[^"]*\s)?kao-primary(?:\s[^"]*)?"/g) || []).length;
// Üst çubuk: NavBar'ın kendisi (başlık/alt öğeleri değil).
const navbars = (html) => (String(html).match(/class="(?:[^"]*\s)?kao-navbar(?:\s[^"]*)?"/g) || []).length;

const rows = [];
const measure = (id, label, target, value, pass) => {
  rows.push({ id, label, target, value, pass: !!pass });
  assert.ok(pass, `${id} FAIL — ${label}: ${value} (hedef ${target})`);
};

// "Dokunma": ekranda GERÇEKTEN bulunan düğmenin onclick'ini bulur, sayar ve motora iletir.
function makeToucher(t) {
  const touch = { count: 0 };
  touch.click = (name, ...args) => {
    const html = decode(t.api.kaoOverlayHTML(t.NOW));
    const want = `onclick="App.${name}(${args.map((a) => JSON.stringify(a)).join(',')})"`;
    assert.ok(html.includes(want), `ekranda düğme yok: ${want}`);
    touch.count += 1;
    const ok = t.api[name](...args);
    assert.equal(ok, true, `${name}(${args.join(',')}) reddedildi`);
    return ok;
  };
  return touch;
}
const freshBoot = (options) => { const t = bootKao(options); t.data.quranLearn = null; t.api.kaoOpen('home'); return t; };

// ---- A-1: sıfır kullanıcı ≤3 dokunuş (iki yol: rahat okur / harf bilmez) ----------------------------
{
  // Rahat okur: Başlayalım → "Evet, rahat okurum" → "Fâtiha ile başla" → ilk tanış kartı.
  const t = freshBoot(), touch = makeToucher(t);
  assert.equal(t.ui.kaoOnboard && t.ui.kaoOnboard.step, 1, 'ilk açılış ekranı gelmedi');
  touch.click('kaoOnboard', 'next');
  touch.click('kaoOnboard', 'choose', 'fluent');
  touch.click('kaoOnboard', 'finish');
  const html = t.api.kaoOverlayHTML(t.NOW);
  const level1 = { taps: touch.count, intro: /data-lesson-stage="intro"/.test(html) || /data-lesson-stage="goal"/.test(html), view: t.ui.kaoView };
  const lesson1 = t.ui.kaoLesson && t.ui.kaoLesson.plan[t.ui.kaoLesson.at];

  // Harf bilmez: Başlayalım → "Henüz değil" → "Harflerle başla" → ilk harf dersi (S0) aşaması.
  const s = freshBoot(), sTouch = makeToucher(s);
  sTouch.click('kaoOnboard', 'next');
  sTouch.click('kaoOnboard', 'choose', 'none');
  sTouch.click('kaoOnboard', 'finish');
  const sHtml = text(s.api.kaoOverlayHTML(s.NOW));
  const s0 = { taps: sTouch.count, view: s.ui.kaoView, stage: /Aşama 1 \/ \d/.test(sHtml) };
  measure('A-1', 'Sıfır kullanıcı: modal açılışından ilk öğrenme kartına dokunuş (iki yol)', '≤3',
    `rahat okur ${level1.taps} dokunuş → ${level1.view}/${lesson1 && lesson1.kind} · harf bilmez ${s0.taps} dokunuş → ${s0.view} (Aşama 1)`,
    level1.taps <= 3 && level1.intro && level1.view === 'session' && lesson1 && lesson1.kind &&
    s0.taps <= 3 && s0.view === 's0' && s0.stage);
}

// ---- A-2 + A-4 (simülasyon): 12 üniteyi GERÇEK handler'larla baştan sona oynat -------------------------
// A-2: her yeni lemmanın ilk görünümü tanış kartıdır (planda tanış, aynı lemmanın her alıştırmasından önce gelir ve
//      kayıtlı `introducedLemmas` içine düşer). A-4: nextStep her adımda tek, tanımlı ve beklenen türde.
const sim = {};
{
  const t = bootKao();
  freshUser(t);
  const cur = t.win.QuranCurriculumV2;
  const lemmaOf = (task) => String(task.cardId).split(':')[1];
  const nextDay = () => { const day = t.data.quranLearn.daily[t.NOW.slice(0, 10)]; if (day) day.sessionDone = false; };
  const kinds = [], violations = [], masterySteps = [], seenLessons = new Set(), newLemmas = new Set();
  let lessonsPlayed = 0, tasksVisited = 0, failedOnce = false, finalTitle = '', guard = 0;
  for (; guard < 500; guard += 1) {
    const step = t.api.kaoNextStep(t.NOW);
    for (const key of ['kind', 'title', 'subtitle', 'action']) assert.equal(typeof step[key], 'string', `adım ${key} yok`);
    kinds.push(step.kind);
    if (step.kind === 'rest') { finalTitle = step.title; break; }
    assert.ok(['daily', 'next-unit', 'mastery', 'repair'].includes(step.kind), `A-4 FAIL — beklenmeyen adım: ${step.kind} (${step.title})`);
    if (step.kind === 'mastery') {
      masterySteps.push(step.param);
      const failNow = step.param === 3 && !failedOnce;
      if (failNow) failedOnce = true;
      let seen = 0;
      const answer = (task) => { const wrongNow = failNow && seen < 5; seen += 1; return (wrongNow ? task.choices.find((c) => !c.correct) : task.choices.find((c) => c.correct)).choiceId; };
      assert.equal(t.api.kaoLesson('start', step.param), true);
      assert.equal(playLesson(t, { answer }), true, `ustalık ${step.param} oynatılamadı`);
      t.api.kaoLesson('finish'); nextDay();
      continue;
    }
    const lessonId = step.param;
    assert.equal(typeof lessonId === 'string' || typeof lessonId === 'number', true, 'adımın dersi yok');
    assert.equal(t.api.kaoLesson('start', lessonId), true, `ders ${lessonId} açılamadı`);
    const plan = t.ui.kaoLesson.plan, goal = plan.find((item) => item.kind === 'goal');
    const fresh = goal ? (goal.newLemmaIds || []) : [];
    if (step.kind !== 'repair' && fresh.length) {
      seenLessons.add(lessonId);
      for (const id of fresh) {
        newLemmas.add(id);
        const introAt = plan.findIndex((item) => item.kind === 'intro' && item.lemmaId === id);
        const useAt = plan.findIndex((item) => item.kind !== 'intro' && item.kind !== 'goal' && item.lemmaId === id);
        if (introAt < 0 || (useAt >= 0 && introAt > useAt)) violations.push(`${lessonId}:${id}:plan`);
      }
    }
    // Görev bazında: yeni lemmanın herhangi bir görevi, tanış kaydı yazıldıktan SONRA gelir.
    const visit = (task) => {
      tasksVisited += 1;
      const id = lemmaOf(task), rec = t.data.quranLearn.path.lessons[String(lessonId)] || {};
      if (fresh.includes(id) && !(rec.introducedLemmas || []).includes(id)) violations.push(`${lessonId}:${id}:görev`);
    };
    assert.equal(playLesson(t, { answer: 'correct', visit }), true, `${step.kind} ${lessonId} oynatılamadı`);
    const rec = t.data.quranLearn.path.lessons[String(lessonId)] || {};
    for (const id of fresh) if (step.kind !== 'repair' && !(rec.introducedLemmas || []).includes(id)) violations.push(`${lessonId}:${id}:kayıt`);
    t.api.kaoLesson('finish'); nextDay(); if (step.kind !== 'repair') lessonsPlayed += 1;
  }
  assert.ok(guard < 500, 'A-4 FAIL — sıradaki adım 500 adımda sona ermedi (ünite ilerlemiyor)');
  Object.assign(sim, { t, kinds, violations, masterySteps, lessonsPlayed, tasksVisited, finalTitle, newLemmas, seenLessons, cur });
}
{
  const { cur, kinds, violations, lessonsPlayed, tasksVisited, newLemmas } = sim;
  const lessonCount = cur.units.reduce((n, u) => n + u.lessons.length, 0);
  measure('A-2', 'Her yeni lemmanın ilk görünümü tanış kartı (109 ders, gerçek oynatma)', '%100',
    `${lessonsPlayed}/${lessonCount} ders oynatıldı (onarım turları ayrı) · ${tasksVisited} görev · ${newLemmas.size} yeni lemma · ihlal ${violations.length}${violations.length ? ' (' + violations.slice(0, 3).join(', ') + ')' : ''}`,
    lessonsPlayed === lessonCount && newLemmas.size === 524 && violations.length === 0);
  void kinds;
}

// ---- A-3: ekran başına ≤1 dolgulu birincil düğme ve tek üst çubuk (görünüm × durum × oturum aşamaları) -------
{
  const VIEWS = ['home', 'units', 'unit', 'word', 'reader', 'settings', 'phonics', 'ayah', 'prayer', 'stats', 'gate', 'session', 'grammar', 'concept', 'roots', 's0', 'sources'];
  const MARKER = { unit: 'kao-screen-unit', concept: 'kao-screen-concept' };
  const surfaces = [];
  const record = (label, html, marker) => {
    const view = decode(html);
    surfaces.push({ label, primary: primaries(view), navbars: navbars(view), marked: marker ? view.includes(marker) : true, length: view.length });
  };
  const states = [['boş', (t) => freshUser(t)], ['tohumlu', (t) => seed(t)]];
  for (const [stateName, make] of states) {
    const t = bootKao();
    make(t);
    const lex = t.win.QuranLexiconV1, grammar = t.win.QuranGrammarV1;
    const concept = Array.isArray(grammar.concepts) ? grammar.concepts[0].id : Object.keys(grammar.concepts)[0];
    const params = { unit: 1, word: lex.lemmas[0].id, reader: 112, concept };
    for (const view of VIEWS) {
      const r = openView(t, view, params[view]);
      assert.equal(r.ok, true, `${stateName}/${view} açılamadı`);
      record(`${stateName}/${view}`, r.html, MARKER[view] || `kao-screen-${view}`);
    }
  }
  // İlk açılış: 3 adım + yerleştirme (okuma, dinleme) — gerçek handler'larla.
  {
    const t = freshBoot();
    record('ilk-açılış/1', t.api.kaoOverlayHTML(t.NOW), 'kao-screen-onboard');
    t.api.kaoOnboard('next'); record('ilk-açılış/2', t.api.kaoOverlayHTML(t.NOW), 'kao-screen-onboard');
    t.api.kaoOnboard('choose', 'slow'); record('ilk-açılış/yerleştirme-okuma', t.api.kaoOverlayHTML(t.NOW), 'kao-screen-onboard');
    const tasks = t.api.kaoPlacementTasks();
    tasks.reading.forEach((task) => t.api.kaoOnboard('answer', task.answer));
    record('ilk-açılış/yerleştirme-dinleme', t.api.kaoOverlayHTML(t.NOW), 'kao-screen-onboard');
    tasks.listening.forEach((task) => t.api.kaoOnboard('answer', task.answer));
    record('ilk-açılış/3', t.api.kaoOverlayHTML(t.NOW), 'kao-screen-onboard');
  }
  // Ders oynatıcı: her aşama + cevap sonrası geri bildirim paneli (panel açık) + özet; ustalık oturumu.
  {
    const t = bootKao();
    freshUser(t);
    const cur = t.win.QuranCurriculumV2;
    const stages = new Set();
    assert.equal(t.api.kaoLesson('start', cur.units[0].lessons[0].id), true);
    for (let guard = 0; guard < 80; guard += 1) {
      const st = t.ui.kaoLesson, item = st.plan[st.at];
      if (st.phase === 'practice') {
        const queued = t.ui.kaoQueue[t.ui.kaoTaskIndex], task = queued && t.ui.kaoTasks[queued.id];
        if (!task) break;
        if (task.kind === 'order') {
          (task.choices || []).slice().sort((a, b) => a.ordinal - b.ordinal).forEach((c) => t.api.kaoAnswer(task.id, c.choiceId));
        } else {
          t.api.kaoAnswer(task.id, (task.choices.find((c) => !c.correct) || task.choices[0]).choiceId);
        }
        stages.add('panel-açık'); record('oturum/panel-açık', t.api.kaoOverlayHTML(t.NOW), 'kao-feedback');
        t.api.kaoContinue();
        continue;
      }
      stages.add(item.kind);
      record(`oturum/${item.kind}`, t.api.kaoOverlayHTML(t.NOW), 'data-lesson-stage');
      if (item.kind === 'summary') break;
      t.api.kaoLesson('next');
    }
    assert.ok(['goal', 'intro', 'panel-açık', 'apply', 'summary'].every((k) => stages.has(k)), `ders aşamaları eksik: ${[...stages].join(',')}`);
    t.api.kaoLesson('finish');
    // Ustalık ve S0: ayrı oturum türleri.
    const m = bootKao();
    freshUser(m);
    m.win.QuranCurriculumV2.units[0].lessons.forEach((l) => { walkLesson(m, l.id); m.api.kaoLesson('finish'); });
    assert.equal(m.api.kaoLesson('start', 1), true);
    record('oturum/ustalık', m.api.kaoOverlayHTML(m.NOW), 'data-lesson-stage');
    const s = bootKao();
    freshUser(s, { start: 's0' });
    assert.equal(s.api.kaoS0('start', 's0.01'), true);
    record('s0/aşama-1', s.api.kaoOverlayHTML(s.NOW), 'kao-screen-s0');
  }
  const bad = surfaces.filter((s) => s.primary > 1 || s.navbars > 1 || !s.marked || s.length < 200);
  const biggestPrimary = Math.max(...surfaces.map((s) => s.primary));
  measure('A-3', 'Ekran başına dolgulu birincil düğme ve tek üst çubuk', '≤1 · NavBar ≤1',
    `${surfaces.length} yüzey (17 görünüm × {boş, tohumlu} + ilk açılış 5 + ders aşamaları + panel-açık + ustalık + S0) · en çok ${biggestPrimary} birincil · ihlal ${bad.length}${bad.length ? ' (' + bad.map((b) => b.label).slice(0, 4).join(', ') + ')' : ''}`,
    surfaces.length >= 45 && bad.length === 0);
}

// ---- A-4: durum × beklenen sıradaki adım türü (Flow gerçek veriyle) --------------------------------------
{
  const cases = [];
  const run = (name, expected, build, options) => {
    const t = bootKao(options);
    const q = freshUser(t);
    build(t, q);
    const step = t.api.kaoNextStep(t.NOW);
    cases.push({ name, expected, got: step.kind, param: step.param, ok: step.kind === expected && typeof step.title === 'string' && step.title.trim() !== '' && typeof step.action === 'string' });
  };
  const ISO = '2026-09-20T10:00:00.000Z';
  const doneUnit = (t, q, unitId) => t.win.QuranCurriculumV2.units.find((u) => u.id === unitId).lessons.forEach((l) => { q.path.lessons[l.id] = { startedAt: ISO, doneAt: ISO, score: 1 }; });
  const dueCards = (t, q, count, dueIso) => t.win.QuranLexiconV1.lemmas.slice(0, count).forEach((l) => { q.cards[`w:${l.id}:ar>tr`] = { state: 'review', s: 10, due: dueIso, r: ISO }; });
  run('onboarding', 'onboarding', (t) => { t.data.quranLearn = JSON.parse(JSON.stringify(t.api.ensureQuranLearn({ quranLearn: null }))); t.data.quranLearn.onboarding.doneAt = null; });
  run('s0-lesson', 's0-lesson', (t, q) => { q.onboarding.start = 's0'; });
  run('daily', 'daily', () => {});
  // Gece penceresi: hedef yatış saatinin 90 dk öncesi (gerçek kaoNightWindow); çözücü kayıt API'siyle verilir.
  run('night-review', 'night-review', (t, q) => { t.data.settings.targetBed = '00:30'; assert.equal(t.api.registerCaffeineTargetBed(() => '00:30'), true); dueCards(t, q, 12, '2026-09-30T08:00:00.000Z'); }, { now: '2026-09-30T23:30:00.000Z' });
  run('rest', 'rest', (t, q) => { q.daily['2026-09-30'] = { answered: 12, correct: 10, new: 5, reviewed: 7, sessionDone: true }; });
  run('mastery', 'mastery', (t, q) => doneUnit(t, q, 1));
  run('next-unit', 'next-unit', (t, q) => { doneUnit(t, q, 1); q.path.units['1'] = { masteryAt: ISO, masteryScore: 0.9 }; });
  run('repair', 'repair', (t, q) => { doneUnit(t, q, 1); q.path.units['1'] = { masteryAt: null, masteryScore: 0.5, attempts: 1, lastAttemptAt: ISO, repair: { lemmaIds: t.win.QuranCurriculumV2.units[0].lessons[0].lemmaIds.slice(0, 2), at: ISO }, skippedAt: null }; });
  run('warmup', 'warmup', (t, q) => { dueCards(t, q, 14, '2026-10-20T08:00:00.000Z'); q.daily['2026-09-20'] = { answered: 8, correct: 6, new: 2, reviewed: 6 }; });
  const { kinds, masterySteps, finalTitle } = sim;
  const unique = [...new Set(masterySteps)];
  const simKinds = [...new Set(kinds)];
  measure('A-4', 'Her durumda tek, tanımlı sıradaki adım (9 durum + 12 ünite simülasyonu)', '9/9 durum · 12/12 ünite',
    `durum ${cases.filter((c) => c.ok).length}/${cases.length} [${cases.map((c) => `${c.name}→${c.got}`).join(' · ')}] · simülasyon ustalık sırası ${unique.join(',')} · türler ${simKinds.join('/')} · son "${finalTitle}"`,
    cases.every((c) => c.ok) && unique.join(',') === '1,2,3,4,5,6,7,8,9,10,11,12' && finalTitle === 'Tüm üniteler tamam ✓' &&
    simKinds.includes('repair') && simKinds.includes('mastery') && simKinds.includes('next-unit') && simKinds.includes('daily'));
}

// ---- A-5: müfredat bütünlüğü ------------------------------------------
{
  const t = bootKao();
  const cur = t.win.QuranCurriculumV2, lex = t.win.QuranLexiconV1, grammar = t.win.QuranGrammarV1;
  const lemmaIds = lex.lemmas.filter((l) => l.verified === true).map((l) => l.id);
  const lessonById = new Map();
  cur.units.forEach((u) => u.lessons.forEach((l) => lessonById.set(l.id, l)));
  // Her lemma: müfredatta tam bir derse bağlı ve o ders lemmayı gerçekten listeliyor.
  const unmapped = lemmaIds.filter((id) => { const lesson = lessonById.get(cur.lemmaToLesson[id]); return !lesson || !(lesson.lemmaIds || []).includes(id); });
  const conceptIds = (Array.isArray(grammar.concepts) ? grammar.concepts : Object.keys(grammar.concepts)).map((c) => (typeof c === 'string' ? c : c.id));
  const bound = conceptIds.filter((id) => cur.units.some((u) => (u.conceptIds || []).includes(id)));
  // 20 kısa sûrenin tanıtımı GERÇEK render ile: nüzul yeri + âyet sayısı + tema (QuranRevelationOrderV1).
  const order = t.win.QuranRevelationOrderV1, shorts = t.win.QuranShortSurahsV1.surahs;
  const withIntro = shorts.filter((surah) => {
    const meta = order.byMushafOrder(surah.id);
    t.api.kaoOpenSurah(surah.id);
    const html = decode(t.api.kaoReaderHTML());
    return meta && html.includes(meta.revelationPlace === 'Mekke' ? 'Mekke’de indi' : 'Medine’de indi') && html.includes(`${meta.ayahCount} âyet`) && html.includes(meta.themeTr) && !html.includes('kao-reader-context');
  });
  // Gramer görevleri: her gramer kavramı dersinde kavram sayfası gerçekten açılır (boş sayfa yok).
  const emptyConcepts = conceptIds.filter((id) => { const r = openView(t, 'concept', id); return !r.ok || text(r.html).length < 120; });
  measure('A-5', 'Müfredat bütünlüğü (lemma/kavram/sûre tanıtımı)', '524/25/20',
    `${lemmaIds.length - unmapped.length}/524 lemma derse bağlı (ders listesinde doğrulandı) · ${bound.length}/${conceptIds.length} kavram bağlı, boş sayfa ${emptyConcepts.length} · ${withIntro.length}/20 sûre tanıtımı (tema + yer + âyet sayısı, render ile)`,
    lemmaIds.length === 524 && unmapped.length === 0 && conceptIds.length === 25 && bound.length === 25 && emptyConcepts.length === 0 && shorts.length === 20 && withIntro.length === 20);
}

// ---- A-6: eski veri güvenliği (v1 kullanıcısı bozulmaz VE ilerleyebilir) ----------------------------------
{
  const t = bootKao();
  const cardId = `w:${t.win.QuranLexiconV1.lemmas[0].id}:ar>tr`;
  const legacy = {
    schemaVersion: 1, lexiconVersion: 1, startedAt: '2026-08-01T00:00:00.000Z',
    cards: { [cardId]: { state: 'review', s: 40, reps: 9, due: '2026-12-01T00:00:00.000Z', flagged: { at: '2026-09-01T00:00:00.000Z', kind: 'meaning' } } },
    daily: { '2026-09-20': { answered: 12, correct: 10, new: 4, reviewed: 8, calib: { bands: [] }, dayFollow: { n: 8, ok: 7 } } },
    milestones: { besmele: '2026-09-01T00:00:00.000Z', half: '2026-09-20T00:00:00.000Z' },
    phonics: { misheard: { tta: 3 }, style: 'muallim' }, gate: { passed: true, score: 24 }, settings: { dailyNew: 15, audio: true },
    surahs: { 112: { understoodAt: '2026-09-10T00:00:00.000Z', delayedScore: 5, confirmedAt: '2026-09-17T00:00:00.000Z' } },
    ayahs: { understood: ['112:1'] }, transfer: { n: 3, ok: 3 }, path: { lessons: { 'u1.1': { doneAt: '2026-09-05T00:00:00.000Z', score: 0.9 } } }
  };
  const before = JSON.parse(JSON.stringify(legacy));
  t.data.quranLearn = legacy;
  const q = t.api.ensureQuranLearn(t.data);
  const subset = (value, expected) => {
    if (expected === null || typeof expected !== 'object') return value === expected;
    if (Array.isArray(expected)) return Array.isArray(value) && JSON.stringify(value) === JSON.stringify(expected);
    return value && typeof value === 'object' && Object.keys(expected).every((k) => subset(value[k], expected[k]));
  };
  const keys = ['cards', 'daily', 'milestones', 'phonics', 'gate', 'surahs', 'ayahs', 'transfer', 'path'];
  const drift = keys.filter((key) => !subset(q[key], before[key]));
  const settingsKept = q.settings.dailyNew === 15 && q.settings.audio === true;
  // İlerleyebilir: v1 kullanıcısına sıradaki adım gelir, ders açılır, bir görev cevaplanır; eski değerler YİNE korunur.
  const step = t.api.kaoNextStep(t.NOW);
  const canStart = ['daily', 'mastery', 'next-unit', 'warmup', 'rest', 'repair', 's0-lesson', 'night-review'].includes(step.kind);
  let progressed = false;
  if (step.action === 'kaoLesson') {
    assert.equal(t.api.kaoLesson('start', step.param), true, 'v1 kullanıcısı ders açamadı');
    progressed = playLesson(t, { answer: 'correct' }) === true;
    t.api.kaoLesson('finish');
  } else {
    // Isınma/tekrar oturumu (kaoStart): sıradaki görevleri gerçek handler'larla cevapla.
    assert.ok(t.api[step.action](step.param), `v1 kullanıcısı ${step.action} başlatamadı`);
    let answered = 0;
    for (let guard = 0; guard < 60 && t.ui.kaoQueue && t.ui.kaoTaskIndex < t.ui.kaoQueue.length; guard += 1) {
      const queued = t.ui.kaoQueue[t.ui.kaoTaskIndex], task = queued && t.ui.kaoTasks[queued.id];
      if (!task) break;
      if (task.kind === 'order') (task.choices || []).slice().sort((x, y) => x.ordinal - y.ordinal).forEach((c) => t.api.kaoAnswer(task.id, c.choiceId));
      else t.api.kaoAnswer(task.id, (task.choices.find((c) => c.correct) || task.choices[0]).choiceId);
      t.api.kaoContinue(); answered += 1;
    }
    progressed = answered > 0 && t.data.quranLearn.daily['2026-09-30'] && t.data.quranLearn.daily['2026-09-30'].answered > 0;
  }
  const after = t.data.quranLearn;
  // Gerçek oturum kayıtları ilerletir: sûrenin gecikmeli kontrolü sayaçları artırır (kayıp değil, ilerleme). Diğer kökler birebir kalır;
  // sûrede ise kimlik/ilk anlama tarihi korunur ve sayaç yalnız ileri gider.
  const surahBefore = before.surahs[112], surahAfter = after.surahs && after.surahs[112];
  const surahOk = !!surahAfter && surahAfter.understoodAt === surahBefore.understoodAt && surahAfter.delayedScore >= surahBefore.delayedScore;
  const driftAfter = ['milestones', 'phonics', 'gate', 'ayahs', 'transfer'].filter((key) => !subset(after[key], before[key])).concat(surahOk ? [] : ['surahs']);
  const cardKept = after.cards[cardId].reps >= 9 && after.cards[cardId].flagged && after.cards[cardId].flagged.kind === 'meaning';
  measure('A-6', 'Eski veri güvenliği (kart/günlük/taş değerleri korunur) ve v1 kullanıcısı ilerleyebilir', 'eski değerler derin eşit · ders oynanır',
    `9 kök alan ${keys.length - drift.length}/9 korundu · ayarlar ${settingsKept} · ders sonrası kayıp ${driftAfter.length}${driftAfter.length ? ' [' + driftAfter.join(',') + ']' : ''} · kart/işaret ${cardKept} · adım ${step.kind} (ders oynandı: ${progressed})`,
    drift.length === 0 && settingsKept && canStart && progressed && driftAfter.length === 0 && cardKept);
}

// ---- A-7: tasarım sözleşmesi 06 §7 + tek üst çubuk + switch bileşeni --------------------------------------
{
  const out = execFileSync(process.execPath, [path.join(repoRoot, 'tests/kao/test_kao2_design_contract.js')], { encoding: 'utf8' });
  const line = out.split('\n').find((l) => l.startsWith('KAO2 design:'));
  const strict = line && line.match(/strict weights=(\d+) uppercase=(\d+) deco=(\d+) serif=(\d+)/);
  assert.ok(strict, 'tasarım sözleşmesi satırı okunamadı');
  const contrast = JSON.parse(execFileSync(process.execPath, [path.join(repoRoot, 'docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs'), '--json'], { encoding: 'utf8' }));
  const below = (contrast.failures || []).filter(Boolean).length;
  // Tek üst çubuk ve switch: gerçek ayar ekranında.
  const t = bootKao();
  freshUser(t);
  const settings = decode(openView(t, 'settings').html);
  const switches = (settings.match(/role="switch"/g) || []).length;
  const rawCheckbox = (settings.match(/type="checkbox"/g) || []).length;
  measure('A-7', 'Tasarım sözleşmesi (06 §7 tamamı)', 'weights≤4 · deco/uppercase/serif 0 · kontrast 0 ihlal · switch bileşeni',
    `weights=${strict[1]} uppercase=${strict[2]} deco=${strict[3]} serif=${strict[4]} · kontrast ${below} ihlal (${(contrast.pairs || contrast.total || '?')} çift) · ayarlarda ${switches} switch, ham checkbox ${rawCheckbox}`,
    Number(strict[1]) <= 4 && strict[2] === '0' && strict[3] === '0' && strict[4] === '0' && below === 0 && switches >= 5 && rawCheckbox === 0);
}

// ---- A-8: geri bildirim "Devam"a kadar görünür (gerçek kaoContinue) ---------------------------------------
{
  const t = bootKao();
  freshUser(t);
  const lesson = t.win.QuranCurriculumV2.units[0].lessons[0];
  assert.equal(t.api.kaoLesson('start', lesson.id), true);
  while (t.ui.kaoLesson.phase !== 'practice') assert.equal(t.api.kaoLesson('next'), true);
  const queued = t.ui.kaoQueue[t.ui.kaoTaskIndex], task = t.ui.kaoTasks[queued.id];
  const wrong = (task.choices.find((c) => !c.correct) || task.choices[0]);
  const indexBefore = t.ui.kaoTaskIndex;
  t.api.kaoAnswer(task.id, wrong.choiceId);
  // Cevap sonrası birkaç kez yeniden çizim: panel (doğru cevap + Devam) HER çizimde durmalı.
  const draws = [1, 2, 3].map(() => decode(t.api.kaoOverlayHTML(t.NOW)));
  const panelOpen = t.ui.kaoPanel && t.ui.kaoPanel.open === true;
  const alwaysVisible = draws.every((h) => /kao-feedback/.test(h) && /App\.kaoContinue\(\)/.test(h));
  const stillSameTask = t.ui.kaoTaskIndex === indexBefore;
  assert.equal(t.api.kaoContinue(), true, 'kaoContinue reddedildi');
  const after = decode(t.api.kaoOverlayHTML(t.NOW));
  const closed = !(t.ui.kaoPanel && t.ui.kaoPanel.open === true) && !/App\.kaoContinue\(\)/.test(after);
  const advanced = t.ui.kaoTaskIndex > indexBefore || t.ui.kaoLesson.phase !== 'practice';
  measure('A-8', 'Cevap sonrası geri bildirim "Devam"a kadar görünür', '%100',
    `cevap sonrası 3 çizimde görünür=${alwaysVisible} · panel açık=${panelOpen} · aynı görev=${stillSameTask} · kaoContinue sonrası kapalı=${closed} · ilerledi=${advanced}`,
    alwaysVisible && panelOpen && stillSameTask && closed && advanced);
}

// ---- A-9: mevcut test aileleri YEŞİL (alt süreç, çıkış kodu) -----------------------------------------------
// Aileler gerçekten çalıştırılır. Bu dosyanın kendisi ve A-10'un çalıştırdığı bütçe testi hariçtir (özyineleme/çift sayım).
const FAMILIES = [['tests/kao', 'kao'], ['tests/app', 'app'], ['tests/panel', 'panel'], ['tests/panel-v2', 'panel-v2'], ['tests/quran', 'quran']];
const SELF = 'test_kao2_kabul.js', EXCLUDED = new Set([SELF, 'test_kao2_perf_budget.js']);
function runFiles(files) {
  const results = [], queue = files.slice();
  const workers = Math.max(1, Math.min(4, os.cpus().length));
  const next = () => new Promise((resolve) => {
    const file = queue.shift();
    if (!file) return resolve();
    const child = spawn(process.execPath, [path.join(repoRoot, file)], { stdio: 'ignore', env: Object.assign({}, process.env, { KAO2_KABUL_CHILD: '1' }) });
    child.on('exit', (code) => { results.push({ file, code }); next().then(resolve); });
    child.on('error', () => { results.push({ file, code: -1 }); next().then(resolve); });
  });
  return Promise.all(Array.from({ length: workers }, next)).then(() => results);
}

async function main() {
  if (process.env.KAO2_KABUL_CHILD === '1') { console.log('KAO2-27 kabul: iç içe çalıştırma atlandı'); return; }
  const files = [];
  const counts = {};
  for (const [dir, name] of FAMILIES) {
    const list = fs.readdirSync(path.join(repoRoot, dir)).filter((n) => /^test_.*\.(js|mjs)$/.test(n) && !EXCLUDED.has(n)).sort();
    counts[name] = list.length;
    list.forEach((n) => files.push(`${dir}/${n}`));
  }
  const reminders = 'tests/reminders/run-reminder-smoke.mjs';
  if (fs.existsSync(path.join(repoRoot, reminders))) { files.push(reminders); counts.reminders = 1; }
  const results = await runFiles(files);
  const failed = results.filter((r) => r.code !== 0);
  measure('A-9', 'Mevcut test aileleri gerçekten çalıştırıldı', 'hepsi yeşil (çıkış kodu 0)',
    `${results.length - failed.length}/${results.length} dosya çıkış 0 [${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(' · ')}]${failed.length ? ' · KIRMIZI: ' + failed.map((f) => f.file).slice(0, 5).join(', ') : ''}`,
    results.length >= 150 && failed.length === 0);

  // ---- A-10: bütçe ve süre (K-1): bütçe testi alt süreç olarak çalışır -----------------------------------
  // Göreli p95 bandı (5,09 ms × 1,25) KAO2-01 makinesine bağlıdır. Yavaş bir konteynerde yalnız o bant kırmızı olabilir:
  // KAO2_ACCEPT_SLOW_HOST=1 verilirse bütçe testi kendi göreli bandı hariç mutlak kapılarla (içerik/runtime/css, p95 ≤40 ms) ölçülür
  // ve satır bunu açıkça yazar. Varsayılan KATIDIR.
  const slow = process.env.KAO2_ACCEPT_SLOW_HOST === '1';
  let out = '', status = 0, stderr = '';
  try { out = execFileSync(process.execPath, [path.join(repoRoot, 'tests/kao/test_kao2_perf_budget.js')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (error) { status = error.status || 1; stderr = String(error.stderr || ''); out = String(error.stdout || ''); }
  let note = '';
  if (status !== 0) {
    const message = (stderr.match(/AssertionError[^\n]*/) || [''])[0];
    const relativeOnly = /^AssertionError \[ERR_ASSERTION\]: steady p95 [\d.]+ ms exceeds baseline \+25%/.test(message);
    assert.ok(slow && relativeOnly, `A-10 FAIL — bütçe testi kırmızı:\n${stderr.split('\n').slice(0, 6).join('\n')}`);
    note = ' · GÖRELİ p95 BANDI ATLANDI (yavaş konteyner; KAO2_ACCEPT_SLOW_HOST=1) — mutlak kapılar aşağıda ölçüldü';
    out = '';
  }
  const zlib = require('node:zlib');
  const gz = (files) => files.reduce((sum, f) => sum + zlib.gzipSync(fs.readFileSync(path.join(repoRoot, f)), { level: 9 }).length, 0) / 1024;
  const contentFiles = ['Lexicon', 'Grammar', 'ShortSurahs', 'Phonics'].map((n) => `app/content/quran${n}V1.js`).concat(['app/content/quranCurriculumV2.js']);
  const runtimeFiles = fs.readdirSync(path.join(repoRoot, 'app/core')).filter((f) => /^quranLearn.*\.js$/.test(f)).map((f) => `app/core/${f}`);
  const content = gz(contentFiles), runtime = gz(runtimeFiles), css = gz(['app/kao.css']);
  const line = out.split('\n').find((l) => l.includes('KAO2 perf:'));
  const p95 = line ? Number(line.match(/p95 ([\d.]+) ms/)[1]) : null;
  measure('A-10', 'Bütçe ve süre (K-1)', 'runtime ≤128 · css ≤14 · content ≤256 KiB · p95 ≤40 ms',
    `runtime ${runtime.toFixed(3)} · css ${css.toFixed(3)} · content ${content.toFixed(3)}${p95 === null ? '' : ` · p95 ${p95.toFixed(3)} ms`}${note}`,
    runtime <= 128 && css <= 14 && content <= 256 && (p95 === null || p95 <= 40));

  // ---- P10 kapanış kabulü ---------------------------------------------------------------------------------
  {
    const t = bootKao();
    const appSource = read('app.js');
    assert.match(appSource, /App\.kaoOpen=function\(view\)\{ return window\.SeymaQuranLearn\.kaoOpen\.apply\(null,arguments\); \};/, 'App.kaoOpen shim yok');
    t.ui.kaoOpen = false;
    assert.equal(t.api.kaoOpen('home'), true, 'kaoOpen gerçek eyleme ulaşmadı');
    assert.equal(t.ui.kaoOpen, true, 'modal açılmadı');
    const html = decode(t.api.kaoOverlayHTML(t.NOW));
    assert.match(html, /role="dialog"/, 'KAO modal sözleşmesi yok');
    assert.match(html, /aria-modal="true"/, 'aria-modal yok');
    const index = read('index.html');
    assert.match(index, /app\/core\/quranLearn\.js\?v=/, 'KAO runtime index.html\'de değil');
    assert.match(index, /app\/kao\.css\?v=/, 'KAO stili index.html\'de değil');
    const iip = read('app/core/saygi.js');
    assert.doesNotMatch(iip, /kaoSettingsHTML|kaoStatsHTML|kaoWordHTML/, 'IIP sekmesi KAO ekranlarını gömüyor');
    measure('P10', '`App.kaoOpen()` gerçek KAO eylemine ulaşır; IIP ayrı yüzey', 'shim → motor + ayrı yüzey',
      'kaoOpen true · role=dialog · aria-modal · IIP bağımsız', true);
  }

  // ---- Rapor --------------------------------------------------------------------------------------------------
  const md = ['# KAO2 · A-1…A-12 kabul ölçütleri (ölçüm)', '',
    `Ölçüm: ${new Date().toISOString().slice(0, 19)}Z · node tests/kao/test_kao2_kabul.js`, '',
    '| # | Ölçüt | Hedef | Ölçülen | Durum | Kanıt düzeyi |',
    '|---|---|---|---|---|---|'];
  for (const row of rows) md.push(`| ${row.id} | ${row.label} | ${row.target} | ${row.value} | ${row.pass ? '✅ PASS' : '❌ FAIL'} | Fixture |`);
  md.push('| A-11 | İlk hafta dönüş günleri ve ilk tekrar doğruluğu | ≥4/7 gün · ≥%80 | ölçülmedi | ⏳ | **Cihaz/kullanıcı** |');
  md.push('| A-12 | "Şimdi ne yapmalıyım?" anı | 0 | ölçülmedi | ⏳ | **Cihaz/kullanıcı** |');
  const p10 = rows.filter((r) => r.id === 'P10');
  if (p10.length) md.push('', '## P10 kapanış kabulü', '', '| Kontrol | Ölçülen | Durum |', '|---|---|---|', `| ${p10[0].label} | ${p10[0].value} | ${p10[0].pass ? '✅ PASS' : '❌ FAIL'} |`);
  // K2F-04 (M-11): rapor izlenen kanıt dosyasını her koşuda yeniden yazmaz. Yazım yalnız açık istekle:
  //   KAO2_EVIDENCE_OUT=<yol> node tests/kao/test_kao2_kabul.js
  const report = md.join('\n') + '\n';
  const evidenceOut = process.env.KAO2_EVIDENCE_OUT;
  if (evidenceOut) {
    fs.writeFileSync(path.resolve(evidenceOut), report);
    console.log(`KAO2-27 kabul raporu yazıldı: ${path.resolve(evidenceOut)}`);
  } else {
    console.log(report);
  }
  const fixtureRows = rows.filter((r) => r.id.startsWith('A-'));
  console.log(`KAO2-27 kabul: ${fixtureRows.filter((r) => r.pass).length}/${fixtureRows.length} ölçüt PASS · P10 kapanış kabulü PASS (A-11/A-12 cihazda)`);
}

main().catch((error) => { console.error(error && error.stack ? error.stack : error); process.exit(1); });
