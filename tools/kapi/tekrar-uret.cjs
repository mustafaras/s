'use strict';

// KAO2 denetimi (2026-09-30) · kritik ve yüksek bulguları yeniden üretir.
// tarihsel kayıt; güncel kontroller tests/kao/test_kao2_denetim.js — R-01/R-10 D2F-05'te güçlendi
// Her kontrol DOĞRU davranışı bekler: bugün FAIL, düzeltmeden sonra PASS olmalıdır.
// Salt okur: node:vm içinde sentetik veri; ağ, tarayıcı, zamanlayıcı ve dosya yazımı yok.
// Çalıştır: node tools/kapi/tekrar-uret.cjs  (çıkış kodu = FAIL sayısı)
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '../..');
const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');
const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranMahrecSchemasV1',
  'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];
const NOW = '2026-09-30T12:00:00.000Z';
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function boot() {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const n of CONTENT) vm.runInContext(read(`app/content/${n}.js`), box, { filename: n });
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) vm.runInContext(read(f), box, { filename: f });
  const data = { settings: {}, days: {}, quranLearn: null, lastOpenedDate: '2026-09-30' };
  const ui = { kaoOpen: true, kaoView: 'home', kaoStack: [] };
  const api = box.window.SeymaQuranLearn;
  api.registerQuranLearn({ data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-30', esc, icon: () => '', getDay: () => ({}) });
  api.registerQuranLearnSurface({
    toast() {}, isQuietTime: false, mount() {}, lockBody() {}, unlockBody() {}, focusDialog() {}, restoreFocus() {},
    activeElementId: () => '', sheetClose(_e, _b, done) { if (done) done(); }, taskElement: () => null
  });
  return { api, win: box.window, data, ui };
}

function freshUser(t, extra) {
  const q = JSON.parse(JSON.stringify(t.api.ensureQuranLearn({ quranLearn: null })));
  q.onboarding.doneAt = '2026-09-20T00:00:00.000Z';
  q.onboarding.start = 'level1';
  Object.assign(q.onboarding, extra || {});
  t.data.quranLearn = q;
  return q;
}

// Ders oynatıcısını gerçek handler'larla sonuna kadar yürütür; her görevi `visit` ile gösterir.
function walkLesson(t, lessonId, visit) {
  if (!t.api.kaoLesson('start', lessonId)) return false;
  const st = t.ui.kaoLesson;
  for (let guard = 0; guard < 300; guard += 1) {
    if (st.phase === 'practice' || st.phase === 'review') {
      const item = t.ui.kaoQueue[t.ui.kaoTaskIndex];
      const task = item && t.ui.kaoTasks[item.id];
      if (!task) return false;
      if (visit) visit(task);
      if (task.kind === 'order') {
        // K2F-11 ek turu: "Kelime dizme" birden çok seçim ister; ordinal sırayla seçilmezse yürüyüşçü aynı görevde takılır.
        for (const c of (task.choices || []).slice().sort((a, b) => a.ordinal - b.ordinal)) t.api.kaoAnswer(task.id, c.choiceId);
        t.api.kaoContinue();
        continue;
      }
      const pick = (task.choices || []).find((c) => c.correct) || (task.choices || [])[0];
      if (!pick) return false;
      t.api.kaoAnswer(task.id, pick.choiceId);
      t.api.kaoContinue();
      continue;
    }
    const current = st.plan[st.at];
    if (!current || current.kind === 'summary') return true;
    t.api.kaoLesson('next');
  }
  return false;
}

const results = [];
function check(id, finding, run) {
  let ok = false, detail = '';
  try { [ok, detail] = run(); } catch (error) { ok = false; detail = 'istisna: ' + error.message; }
  results.push({ id, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id} (${finding}) · ${detail}`);
}

check('R-01', 'K4-01', () => {
  const t = boot();
  const q = freshUser(t);
  for (const l of t.win.QuranCurriculumV2.units[0].lessons) q.path.lessons[l.id] = { startedAt: NOW, doneAt: NOW, score: 0.9, introducedLemmas: l.lemmaIds };
  const step = t.api.kaoNextStep(NOW);
  t.api.kaoLesson('start', step.param);
  const st = t.ui.kaoLesson;
  st.at = st.plan.length - 1; st.phase = 'lesson';
  t.api.kaoLesson('finish');
  t.data.quranLearn.daily = {};
  const after = t.api.kaoNextStep('2026-10-01T12:00:00.000Z');
  const recorded = Object.keys(t.data.quranLearn.path.units || {}).length > 0;
  return [recorded || after.title !== step.title, `ustalık öncesi "${step.title}" · sonrası "${after.title}" · path.units kaydı=${recorded}`];
});

check('R-02', 'K4-01 (v1 kullanıcı)', () => {
  const t = boot();
  const cards = {};
  for (const u of t.win.QuranCurriculumV2.units.slice(0, 3)) for (const l of u.lessons) for (const id of l.lemmaIds) cards[`w:${id}:ar>tr`] = { state: 'review', s: 30, reps: 6, due: '2026-12-01T00:00:00.000Z' };
  t.data.quranLearn = { schemaVersion: 1, cards, daily: { '2026-09-29': { answered: 10, correct: 9 } } };
  const step = t.api.kaoNextStep(NOW);
  const t2 = boot();
  t2.data.quranLearn = JSON.parse(JSON.stringify(t.data.quranLearn));
  t2.api.kaoLesson('start', step.param);
  const lessonId = t2.ui.kaoLesson && t2.ui.kaoLesson.lessonId;
  const isRealMastery = step.kind !== 'mastery' || !/^u\d{2}\.\d{2}$/.test(String(lessonId));
  return [isRealMastery, `Ü1–3 kelimelerini bilen v1 kullanıcı → ${step.kind} "${step.title}" · başlatınca açılan: ${lessonId} (içerik dersi = gerçek ustalık yok)`];
});

// Gramer görev kuralları (doğrulanmış kaynak: kaynak/kuran/icerik/grammar.verified.json):
// (1) ≥2 şık · (2) "Ek çöz" cevabı yalnız g1'de "el +" ile başlar · (3) "Çekim tablosu" dışında uyaran Arapça
// (4) "Çekim tablosu" yönergesindeki tırnaklı hücre = uyaran · (5) exampleId'li şablonda uyaran o örneğin içinde.
function grammarDefects(task, lessonId, verified) {
  const out = [];
  const [, conceptId, templateId] = String(task.cardId || '').split(':');
  const answer = ((task.choices || []).find((c) => c.correct) || {}).label || '';
  const stimulus = String(task.stimulus || '');
  if ((task.choices || []).length < 2) out.push(`${lessonId} ${templateId} tek şık`);
  if (task.grammarType === 'Ek çöz' && /^el \+/.test(answer) && conceptId !== 'g1') out.push(`${lessonId} ${conceptId} "${answer}"`);
  if (task.grammarType !== 'Çekim tablosu' && stimulus && !/[؀-ۿ]/.test(stimulus)) out.push(`${lessonId} ${templateId} Arapça olmayan uyaran "${stimulus}"`);
  if (task.grammarType === 'Çekim tablosu') {
    const quoted = (/'([^']+)'/.exec(String(task.prompt || '')) || [])[1];
    if (quoted && quoted !== stimulus) out.push(`${lessonId} ${templateId} yönerge '${quoted}' ≠ uyaran '${stimulus}'`);
  }
  const concept = (verified.concepts || []).find((c) => c.id === conceptId);
  const template = concept && (concept.templates || []).find((x) => x.id === templateId);
  const example = template && template.exampleId && (concept.examples || []).find((e) => e.id === template.exampleId);
  const exampleAr = example && example.resolved && example.resolved.ar;
  // Kelime dizme (kind:'order') ipucu soldurduğunda uyaran boş olabilir (rehberlik soldurma); doluysa örnek içinde olmalı.
  // Dizmenin doğruluğu ayrıca kaynak örnekle karşılaştırılır: ordinal sırası = örneğin kelime sırası.
  if (task.kind === 'order') {
    if (stimulus && exampleAr && !exampleAr.includes(stimulus)) out.push(`${lessonId} ${templateId} uyaran "${stimulus}" örnek ${template.exampleId} içinde değil`);
    const expected = example && example.resolved && example.resolved.words ? example.resolved.words.map((w) => w.ar) : null;
    const actual = (task.choices || []).slice().sort((a, b) => a.ordinal - b.ordinal).map((c) => c.label);
    if (expected && expected.join(' ') !== actual.join(' ')) out.push(`${lessonId} ${templateId} dizme sırası örnekle uyuşmuyor`);
  } else if (exampleAr && !(stimulus && exampleAr.includes(stimulus))) out.push(`${lessonId} ${templateId} uyaran "${stimulus}" örnek ${template.exampleId} içinde değil`);
  return out;
}

check('R-03', 'K4-02', () => {
  const t = boot();
  const verified = JSON.parse(read('kaynak/kuran/icerik/grammar.verified.json'));
  const bad = [];
  let grammarTasks = 0;
  for (const unit of t.win.QuranCurriculumV2.units) for (const lesson of unit.lessons) {
    freshUser(t);
    walkLesson(t, lesson.id, (task) => {
      if (task.type !== 'grammar') return;
      grammarTasks += 1;
      bad.push(...grammarDefects(task, lesson.id, verified));
    });
  }
  return [bad.length === 0, `${grammarTasks} gramer görevinde ${bad.length} kusur · ör. ${bad.slice(0, 3).join(' | ')}`];
});

check('R-04', 'K5-01', () => {
  const t = boot();
  freshUser(t, { start: 's0' });
  const step = t.api.kaoNextStep(NOW);
  t.api.kaoLesson('start', step.param);
  const kinds = (t.ui.kaoLesson && t.ui.kaoLesson.plan || []).map((i) => i.kind).join(',');
  return [step.kind === 's0-lesson' && kinds !== 'goal,apply,summary', `S0 öğrencisi → ${step.param} planı: ${kinds}`];
});

check('R-05', 'K5-02 (i)', () => {
  const src = ['app/core/quranLearn.js', 'app/core/quranLearnViews.js', 'app/core/quranLearnFlow.js'].map(read).join('\n');
  const referenced = new Set([...src.matchAll(/App\.(kao[A-Za-z0-9]+)|name:'(kao[A-Za-z0-9]+)'|action:'(kao[A-Za-z0-9]+)'/g)].map((m) => m[1] || m[2] || m[3]));
  const defined = new Set([...read('app.js').matchAll(/App\.(kao[A-Za-z0-9]+) *= *function/g)].map((m) => m[1]));
  const missing = [...referenced].filter((name) => !defined.has(name));
  return [missing.length === 0, `işaretlemede çağrılıp app.js'te tanımsız: ${missing.join(', ') || 'yok'}`];
});

check('R-06', 'K5-02 (iv)', () => {
  const crashed = [];
  for (let i = 1; i <= 12; i += 1) {
    const id = 's0.' + String(i).padStart(2, '0');
    const t = boot();
    freshUser(t);
    t.api.kaoS0Start(id);
    try { t.api.kaoS0HTML(); } catch (error) { crashed.push(id); }
  }
  return [crashed.length === 0, `kaoS0HTML çöken dersler: ${crashed.join(', ') || 'yok'}`];
});

check('R-07', 'K3-06', () => {
  const t = boot();
  freshUser(t, { intent: 'isha' });
  t.ui.kaoStack = [{ view: 'home', param: null }, { view: 'settings', param: null }];
  t.ui.kaoView = 'settings';
  const line = (t.api.kaoOverlayHTML(NOW).match(/Niyet:[^<]*/) || ['yok'])[0];
  return [!/Henüz seçilmedi/.test(line), `onboarding.intent='isha' → "${line}"`];
});

check('R-08', 'K3-01', () => {
  const t = boot();
  const q = freshUser(t);
  const flow = t.win.SeymaQuranLearnFlow;
  const content = { curriculum: t.win.QuranCurriculumV2, lexicon: t.win.QuranLexiconV1, grammar: t.win.QuranGrammarV1, shorts: t.win.QuranShortSurahsV1 };
  let empty = 0, total = 0;
  for (const unit of content.curriculum.units) for (const lesson of unit.lessons) {
    const plan = flow.lessonPlan({ quranLearn: q }, lesson.id, new Date(NOW), content) || [];
    const apply = plan.find((i) => i.kind === 'apply');
    total += 1;
    // Uygula adımı çapa metni kelimeleri (`words`) ya da doğrulanmış örnek cümleler (`sentences`) taşıyabilir.
    if (!apply || !((apply.words || []).length || (apply.sentences || []).length)) empty += 1;
  }
  return [empty === 0, `${empty}/${total} derste "Uygula" adımı içeriksiz`];
});

check('R-09', 'K6-02', () => {
  const t = boot();
  freshUser(t);
  const wrong = [];
  for (const view of ['roots', 's0', 'sources']) {
    t.ui.kaoStack = []; t.ui.kaoView = view;
    const nav = (t.api.kaoOverlayHTML(NOW).match(/kao-navbar-title[^>]*>([^<]*)/) || [])[1] || '';
    if (/Kur(&#39;|')an Arapçası/.test(nav)) wrong.push(view);
  }
  return [wrong.length === 0, `yığınsız kaoView ataması ana ekranı çiziyor (testlerin kurulum yolu): ${wrong.join(', ') || 'yok'}`];
});

check('R-10', 'M-11', () => {
  const src = read('tests/kao/test_kao2_kabul.js');
  const writesUnconditionally = /\nfs\.writeFileSync\(path\.join\(repoRoot, '[^']*A-KABUL\.md'\)/.test(src);
  return [!writesUnconditionally, 'kabul testi izlenen kanıt dosyasını her koşuda koşulsuz yeniden yazıyor'];
});

const failed = results.filter((r) => !r.ok).length;
console.log(`\nKAO2 denetim tekrar üretimi: ${results.length - failed}/${results.length} PASS · ${failed} FAIL`);
process.exitCode = failed;
