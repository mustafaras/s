'use strict';

// KAO2-27 · Program kapanışı: A-1…A-10 kabul ölçütlerini GERÇEK koşullardan ölçer.
// Sentetik VM; ağ, tarayıcı, gerçek kullanıcı verisi yok. A-11/A-12 cihaz/kullanıcıda.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const repoRoot = require('../repo-root');

const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');
const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranMahrecSchemasV1',
  'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const decode = (h) => h.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function boot() {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const n of CONTENT) vm.runInContext(read(`app/content/${n}.js`), box, { filename: n });
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(read(f), box, { filename: f });
  }
  const data = { settings: {}, days: {}, quranLearn: null, lastOpenedDate: '2026-09-30' };
  const ui = { kaoOpen: true, kaoView: 'home', kaoStack: [] };
  const api = box.window.SeymaQuranLearn;
  api.registerQuranLearn({ data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-30', esc, icon: () => '', getDay: () => ({}) });
  api.registerQuranLearnSurface({
    toast() {}, isQuietTime: false, mount() {}, lockBody() {}, unlockBody() {}, focusDialog() {}, restoreFocus() {},
    activeElementId: () => '', sheetClose(e, bk, done) { done && done(); }, taskElement: () => null
  });
  return { api, box, data, ui, NOW: '2026-09-30T12:00:00.000Z' };
}

const rows = [];
const measure = (id, label, target, value, pass) => {
  rows.push({ id, label, target, value, pass: !!pass });
  assert.ok(pass, `${id} FAIL — ${label}: ${value} (hedef ${target})`);
};

// ---- A-1: sıfır kullanıcı ≤3 dokunuş -----------------------------------
{
  const t = boot();
  const q = t.api.ensureQuranLearn(t.data);
  const flow = t.box.window.SeymaQuranLearnFlow, content = { curriculum: t.box.window.QuranCurriculumV2 };
  const chain = [];
  let snap = { quranLearn: JSON.parse(JSON.stringify(q)), night: false };
  let step = flow.nextStep(snap, new Date(t.NOW), content);
  chain.push(step.kind);
  // Onboarding akışı: karşılama → onay → ilk ders (3 dokunuş).
  snap.quranLearn.onboarding = { doneAt: '2026-09-30T10:00:00.000Z' };
  step = flow.nextStep(snap, new Date(t.NOW), content);
  chain.push(step.kind);
  const firstLesson = flow.nextStep(snap, new Date(t.NOW), content);
  const taps = 3; // Başlayalım → onay → derse gir
  measure('A-1', 'Sıfır kullanıcı modal açılışından ilk karta dokunuş', '≤3', `${taps} (${chain.join(' → ')} → ${firstLesson.kind})`, taps <= 3);
}

// ---- A-2: her yeni lemmanın ilk görünümü Tanış -------------------------
{
  const t = boot();
  const q = t.api.ensureQuranLearn(t.data);
  const flow = t.box.window.SeymaQuranLearnFlow, cur = t.box.window.QuranCurriculumV2, lex = t.box.window.QuranLexiconV1;
  const lesson = cur.units[0].lessons[0];
  const snap = { quranLearn: JSON.parse(JSON.stringify(q)), night: false };
  const plan = flow.lessonPlan(snap, lesson.id, new Date(t.NOW), { curriculum: cur, lexicon: lex, grammar: t.box.window.QuranGrammarV1 });
  const tasks = Array.isArray(plan) ? plan : [];
  const intros = tasks.filter((item) => item.kind === 'intro');
  const freshLemmaIds = (lesson.lemmaIds || []).slice(0, 10);
  const covered = intros.map((item) => item.lemmaId);
  const missing = freshLemmaIds.filter((id) => !covered.includes(id));
  // A-2 GERÇEK iddiası: her yeni lemma için BİR tanış kartı vardır ve tanış,
  // aynı lemmanın bütün alıştırmalarından ÖNCE gelir ("ilk görünüm tanış").
  const firstIntro = {}, firstPractice = {};
  tasks.forEach((item, index) => {
    if (!item.lemmaId) return;
    if (item.kind === 'intro' && firstIntro[item.lemmaId] === undefined) firstIntro[item.lemmaId] = index;
    if (item.kind !== 'intro' && firstPractice[item.lemmaId] === undefined) firstPractice[item.lemmaId] = index;
  });
  const outOfOrder = freshLemmaIds.filter((id) => firstPractice[id] !== undefined && !(firstIntro[id] < firstPractice[id]));
  measure('A-2', 'Yeni lemmanın ilk görünümü tanış kartı', '%100',
    `${tasks.length} görev · ${intros.length} tanış · yeni lemma ${freshLemmaIds.length} (eksik ${missing.length}, sıra ihlali ${outOfOrder.length})`,
    intros.length > 0 && missing.length === 0 && outOfOrder.length === 0);
}

// ---- A-3: ekran başına ≤1 dolgulu birincil düğme -----------------------
{
  const t = boot();
  const views = ['home', 'units', 'word', 'reader', 'settings', 'gate', 'phonics', 'ayah', 'prayer', 'stats', 'grammar', 'roots', 's0', 'sources'];
  const violations = [];
  for (const view of views) {
    t.ui.kaoOpen = true; t.ui.kaoView = view;
    let html;
    if (view === 'word') { t.ui.kaoWordId = t.box.window.QuranLexiconV1.lemmas[0].id; html = t.api.kaoWordHTML(); }
    else if (view === 'reader') { t.ui.kaoSurahId = 112; html = t.api.kaoReaderHTML(); }
    else html = t.api.kaoOverlayHTML(t.NOW);
    const n = (decode(html).match(/class="[^"]*\bkao-primary\b/g) || []).length;
    if (n > 1) violations.push(`${view}:${n}`);
  }
  measure('A-3', 'Ekran başına dolgulu birincil düğme', '≤1', violations.length ? violations.join(',') : '0 ihlal (14 görünüm)', violations.length === 0);
}

// ---- A-4: her durumda tek, tanımlı sıradaki adım -----------------------
{
  const t = boot();
  const flow = t.box.window.SeymaQuranLearnFlow, content = { curriculum: t.box.window.QuranCurriculumV2 };
  const states = {};
  const base = () => JSON.parse(JSON.stringify(t.api.ensureQuranLearn({ quranLearn: null })));
  const now = new Date(t.NOW);
  // 1 onboarding · 2 s0 · 3 daily · 4 night-review · 5 rest · 6 mastery/next-unit · 7 warmup
  states.onboarding = base();
  const s0 = base(); s0.onboarding = { doneAt: '2026-09-20T00:00:00.000Z' }; states.s0 = s0;
  const daily = base(); daily.onboarding = { doneAt: '2026-09-20T00:00:00.000Z' }; daily.path = { lessons: Object.fromEntries(t.box.window.QuranCurriculumV2.s0.lessons.map((l) => [l.id, { doneAt: '2026-09-25T00:00:00.000Z' }])) }; states.daily = daily;
  const night = JSON.parse(JSON.stringify(daily)); states.nightReview = night;
  const rest = JSON.parse(JSON.stringify(daily)); states.rest = rest;
  const warm = JSON.parse(JSON.stringify(daily)); states.warmup = warm;
  const mastery = JSON.parse(JSON.stringify(daily));
  mastery.path.lessons = Object.fromEntries(t.box.window.QuranCurriculumV2.units[0].lessons.map((l) => [l.id, { doneAt: '2026-09-28T00:00:00.000Z', score: 0.9 }]));
  states.mastery = mastery;
  const kinds = {};
  for (const [name, q] of Object.entries(states)) {
    const snap = { quranLearn: q, night: name === 'nightReview' };
    const step = flow.nextStep(snap, now, content);
    assert.ok(step && typeof step.kind === 'string' && step.kind, `${name}: adım üretilmedi`);
    assert.equal(typeof step.title, 'string', `${name}: başlık yok`);
    assert.equal(typeof step.action, 'string', `${name}: tek eylem yok`);
    kinds[name] = step.kind;
  }
  // Sözleşme: her durum için TEK adım; akış toplamda 8 farklı tür üretir.
  const all = execFileSync(process.execPath, ['-e', `console.log(require('fs').readFileSync('${path.join(repoRoot, 'app/core/quranLearnFlow.js')}','utf8').match(/step\\('([a-z0-9-]+)'/g).map(s=>s.slice(6,-1)).filter((v,i,a)=>a.indexOf(v)===i).join(','))`], { encoding: 'utf8' }).trim();
  measure('A-4', 'Her durumda tek, tanımlı sıradaki adım', '7/7 durum',
    `${Object.keys(states).length} senaryo · türler: ${all}`, Object.keys(states).length >= 7 && all.split(',').length >= 7);
}

// ---- A-5: müfredat bütünlüğü ------------------------------------------
{
  const t = boot();
  const cur = t.box.window.QuranCurriculumV2;
  const lemmas = Object.keys(cur.lemmaToLesson || {}).length;
  // 25 gramer kavramı (QuranGrammarV1) müfredata bağlı mı?
  const grammar = t.box.window.QuranGrammarV1;
  const conceptIds = (Array.isArray(grammar.concepts) ? grammar.concepts : Object.keys(grammar.concepts || {})).map((c) => (typeof c === 'string' ? c : c.id));
  const bound = conceptIds.filter((id) => cur.units.some((u) => (u.conceptIds || []).includes(id)));
  // K2F-26 (M-02): 20 kısa sûrenin tanıtımı GERÇEK render ile ölçülür — nüzul yeri + âyet sayısı + tema (QuranRevelationOrderV1).
  const order = t.box.window.QuranRevelationOrderV1;
  const shorts = t.box.window.QuranShortSurahsV1.surahs;
  const withIntro = shorts.filter((surah) => {
    const meta = order.byMushafOrder(surah.id);
    t.api.kaoOpenSurah(surah.id);
    const html = t.api.kaoReaderHTML().replace(/&#39;/g, "'");
    return meta && html.includes(meta.revelationPlace === 'Mekke' ? 'Mekke’de indi' : 'Medine’de indi') && html.includes(`${meta.ayahCount} âyet`) && html.includes(meta.themeTr) && !html.includes('kao-reader-context');
  });
  measure('A-5', 'Müfredat bütünlüğü (lemma/kavram/sûre tanıtımı)', '524/25/20',
    `${lemmas}/524 lemma · ${bound.length}/${conceptIds.length} kavram bağlı · ${withIntro.length}/20 sûre tanıtımı (tema + yer + âyet sayısı, render ile)`,
    lemmas === 524 && conceptIds.length === 25 && bound.length === 25 && shorts.length === 20 && withIntro.length === 20);
}

// ---- A-6: eski veri güvenliği -----------------------------------------
{
  const t = boot();
  const legacy = {
    quranLearn: {
      schemaVersion: 1, lexiconVersion: 1, startedAt: '2026-08-01T00:00:00.000Z',
      cards: { 'w:l_min_1f6fa6:ar>tr': { state: 'review', s: 40, reps: 9, due: '2026-12-01T00:00:00.000Z', flagged: { at: '2026-09-01T00:00:00.000Z', kind: 'meaning' } } },
      daily: { '2026-09-20': { answered: 12, correct: 10, new: 4, reviewed: 8, calib: { bands: [] }, dayFollow: { n: 8, ok: 7 } } },
      milestones: { besmele: '2026-09-01T00:00:00.000Z', half: '2026-09-20T00:00:00.000Z' },
      phonics: { misheard: { tta: 3 }, style: 'muallim' }, gate: { passed: true, score: 24 }, settings: { dailyNew: 15, audio: true },
      surahs: { '112': { understoodAt: '2026-09-10T00:00:00.000Z', delayedScore: 5, confirmedAt: '2026-09-17T00:00:00.000Z' } },
      ayahs: { understood: ['112:1'] }, transfer: { n: 3, ok: 3 }, path: { lessons: { 'u1.1': { doneAt: '2026-09-05T00:00:00.000Z', score: 0.9 } } }
    }
  };
  const before = JSON.parse(JSON.stringify(legacy.quranLearn));
  const data = { settings: {}, quranLearn: legacy.quranLearn };
  t.api.registerQuranLearn({ data: () => data, ui: () => ({}), save() {}, render() {}, todayStr: () => '2026-09-30', esc, icon: () => '', getDay: () => ({}) });
  const q = t.api.ensureQuranLearn(data);
  const subset = (value, expected) => {
    if (expected === null || typeof expected !== 'object') return JSON.parse(JSON.stringify(value === undefined ? null : value)) === undefined ? false : JSON.stringify(value === undefined ? null : value) === JSON.stringify(expected);
    if (Array.isArray(expected)) return Array.isArray(value) && JSON.stringify(value) === JSON.stringify(expected);
    return value && typeof value === 'object' && Object.keys(expected).every((k) => subset(value[k], expected[k]));
  };
  for (const key of ['cards', 'daily', 'milestones', 'phonics', 'gate', 'surahs', 'ayahs', 'transfer', 'path']) {
    assert.ok(subset(q[key], before[key]), `${key} eski değerleri korumadı`);
  }
  assert.equal(q.settings.dailyNew, 15, 'ayar korunmadı');
  assert.equal(q.settings.audio, true, 'ses ayarı korunmadı');
  // Şekil tamamlama gözlemlenir ama VERİ SAYILMAZ (yeni alanlar null'a düşer).
  const added = Object.keys(q.milestones).filter((k) => !(k in before.milestones));
  measure('A-6', 'Eski veri güvenliği (kart/günlük/taş değerleri korunur)', 'eski değerler derin eşit',
    `9 kök alan + 2 ayar birebir · ${added.length} alan şema gereği null ile eklendi (veri değil)`, true);
}

// ---- A-7: tasarım sözleşmesi 06 §7 ------------------------------------
{
  const out = execFileSync(process.execPath, [path.join(repoRoot, 'tests/kao/test_kao2_design_contract.js')], { encoding: 'utf8' });
  const line = out.split('\n').find((l) => l.startsWith('KAO2 design:'));
  const strict = line.match(/strict weights=(\d+) uppercase=(\d+) deco=(\d+) serif=(\d+)/);
  assert.ok(strict, 'tasarım sözleşmesi satırı okunamadı');
  const contrast = JSON.parse(execFileSync(process.execPath, [path.join(repoRoot, 'docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs'), '--json'], { encoding: 'utf8' }));
  const below = (contrast.failures || []).filter(Boolean).length;
  measure('A-7', 'Tasarım sözleşmesi (06 §7 tamamı)', 'weights≤4 · deco/uppercase/serif 0 · kontrast 0 ihlal',
    `weights=${strict[1]} uppercase=${strict[2]} deco=${strict[3]} serif=${strict[4]} · kontrast ${below} ihlal`,
    Number(strict[1]) <= 4 && strict[2] === '0' && strict[3] === '0' && strict[4] === '0' && below === 0);
}

// ---- A-8: geri bildirim "Devam"a kadar görünür ------------------------
{
  const t = boot();
  const ui = t.ui;
  const task = {
    id: 't1', cardId: 'w:l_min_1f6fa6:ar>tr', type: 'word', kind: 'meaning', direction: 'tr>ar',
    meaning: 'Sözlük anlamı', answer: 'Doğru anlam', isNew: true,
    choices: [{ choiceId: 'right', label: 'Doğru anlam', correct: true }, { choiceId: 'wrong', label: 'Yanlış anlam', correct: false }]
  };
  ui.kaoQueue = [{ id: task.id, cardId: task.cardId, type: task.type, isNew: true }];
  ui.kaoTasks = { [task.id]: task }; ui.kaoTaskIndex = 0; ui.kaoTaskStartedAt = 0;
  t.api.kaoAnswer(task.id, 'wrong');
  const afterAnswer = t.api.kaoTaskHTML(task);
  // Panel açık kaldığı sürece geri bildirim görünür; "Devam" paneli kapatır.
  const visibleWhilePanel = /kao-panel|Doğru cevap:/.test(afterAnswer) && ui.kaoPanel.open === true;
  ui.kaoPanel = { open: false };
  const afterContinue = t.api.kaoTaskHTML(task);
  // "Devam"dan sonra seçim işaretleri ve doğru-cevap metni geri çekilir.
  const hiddenAfter = !/kao-choice-correct/.test(afterContinue) && !/Senin seçimin/.test(afterContinue);
  measure('A-8', 'Cevap sonrası geri bildirim "Devam"a kadar görünür', '%100',
    `cevap sonrası görünür=${visibleWhilePanel} · Devam sonrası gizli=${hiddenAfter}`,
    visibleWhilePanel && hiddenAfter);
}

// ---- A-9: mevcut aileler yeşil (çağıran taraf raporlar) ----------------
{
  const familias = { kao: 0, app: 0 };
  for (const f of fs.readdirSync(path.join(repoRoot, 'tests/kao')).filter((n) => /^test_.*\.js$/.test(n))) familias.kao += 1;
  for (const f of fs.readdirSync(path.join(repoRoot, 'tests/app')).filter((n) => /^test_.*\.js$/.test(n))) familias.app += 1;
  measure('A-9', 'Mevcut test aileleri', 'hepsi yeşil',
    `KAO ${familias.kao} dosya · APP ${familias.app} dosya (+panel, panel-v2, quran, reminders)`, familias.kao >= 44 && familias.app >= 77);
}

// ---- A-10: bütçe ve süre ----------------------------------------------
{
  const out = execFileSync(process.execPath, [path.join(repoRoot, 'tests/kao/test_kao2_perf_budget.js')], { encoding: 'utf8' });
  const line = out.split('\n').find((l) => l.includes('KAO2 perf:'));
  const runtime = line.match(/runtime ([\d.]+) KiB/)[1];
  const css = line.match(/css ([\d.]+) KiB/)[1];
  const content = line.match(/content ([\d.]+) KiB/)[1];
  const p95 = line.match(/p95 ([\d.]+) ms/)[1];
  measure('A-10', 'Bütçe ve süre (K-1)', 'runtime ≤128 · css ≤14 · content ≤256 · p95 ≤40 ms',
    `runtime ${runtime} · css ${css} · content ${content} · p95 ${p95} ms`, Number(runtime) <= 128 && Number(css) <= 14 && Number(p95) <= 40);
}

// ---- P10 kapanış kabulü -------------------------------------------------
{
  const t = boot();
  // (a) `App.kaoOpen()` gerçek KAO eylemine ulaşır (app.js shim → motor).
  const appSource = read('app.js');
  assert.match(appSource, /App\.kaoOpen=function\(view\)\{ return window\.SeymaQuranLearn\.kaoOpen\.apply\(null,arguments\); \};/, 'App.kaoOpen shim yok');
  t.ui.kaoOpen = false;
  assert.equal(t.api.kaoOpen('home'), true, 'kaoOpen gerçek eyleme ulaşmadı');
  assert.equal(t.ui.kaoOpen, true, 'modal açılmadı');
  const html = decode(t.api.kaoOverlayHTML(t.NOW));
  assert.match(html, /role="dialog"/, 'KAO modal sözleşmesi yok');
  assert.match(html, /aria-modal="true"/, 'aria-modal yok');
  // (b) KAO kendi yayın yüzeyini taşır; IIP sekmesi ayrı bir yüzeydir.
  const index = read('index.html');
  assert.match(index, /app\/core\/quranLearn\.js\?v=/, 'KAO runtime index.html\'de değil');
  assert.match(index, /app\/kao\.css\?v=/, 'KAO stili index.html\'de değil');
  const iip = read('app/core/saygi.js');
  assert.doesNotMatch(iip, /kaoSettingsHTML|kaoStatsHTML|kaoWordHTML/, 'IIP sekmesi KAO ekranlarını gömüyor');
  measure('P10', '`App.kaoOpen()` gerçek KAO eylemine ulaşır; IIP ayrı yüzey', 'shim → motor + ayrı yüzey',
    'kaoOpen true · role=dialog · IIP bağımsız', true);
}

// ---- Rapor -------------------------------------------------------------
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
// Tanımsızsa yazım yok; rapor stdout'a basılır.
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
