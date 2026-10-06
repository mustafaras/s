'use strict';

// K2F-38 · KAO2 denetimi (2026-09-30) kontrolleri R-01…R-10, kalıcı fixture olarak.
// Kaynak: kao2-duzeltme/denetim/tekrar-uret.cjs (tarihsel kayıt olarak kalır). Her kontrol DOĞRU davranışı bekler.
// Sentetik node:vm; ağ, tarayıcı, zamanlayıcı ve dosya yazımı yok. Durum GERÇEK handler'larla sürülür.
const assert = require('node:assert/strict');
const { bootKao, freshUser, walkLesson, openView, navTitle, read, DEFAULT_NOW: NOW } = require('./helpers/kao-harness');

let passed = 0;
function check(id, finding, run) {
  const [ok, detail] = run();
  assert.ok(ok, `${id} (${finding}) · ${detail}`);
  passed += 1;
  console.log(`PASS  ${id} (${finding}) · ${detail}`);
}

check('R-01', 'K4-01', () => {
  const t = bootKao();
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
  const t = bootKao();
  const cards = {};
  for (const u of t.win.QuranCurriculumV2.units.slice(0, 3)) for (const l of u.lessons) for (const id of l.lemmaIds) cards[`w:${id}:ar>tr`] = { state: 'review', s: 30, reps: 6, due: '2026-12-01T00:00:00.000Z' };
  t.data.quranLearn = { schemaVersion: 1, cards, daily: { '2026-09-29': { answered: 10, correct: 9 } } };
  const step = t.api.kaoNextStep(NOW);
  const t2 = bootKao();
  t2.data.quranLearn = JSON.parse(JSON.stringify(t.data.quranLearn));
  t2.api.kaoLesson('start', step.param);
  const lessonId = t2.ui.kaoLesson && t2.ui.kaoLesson.lessonId;
  const isRealMastery = step.kind !== 'mastery' || !/^u\d{2}\.\d{2}$/.test(String(lessonId));
  return [isRealMastery, `Ü1–3 kelimelerini bilen v1 kullanıcı → ${step.kind} "${step.title}" · başlatınca açılan: ${lessonId} (içerik dersi = gerçek ustalık yok)`];
});

// Gramer görev kuralları (doğrulanmış kaynak: docs/kuran-ogreniyorum/content/grammar.verified.json):
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
  const t = bootKao();
  const verified = JSON.parse(read('docs/kuran-ogreniyorum/content/grammar.verified.json'));
  const bad = [];
  let grammarTasks = 0;
  let lessons = 0;
  for (const unit of t.win.QuranCurriculumV2.units) for (const lesson of unit.lessons) {
    freshUser(t);
    lessons += 1;
    assert.ok(walkLesson(t, lesson.id, {
      visit: (task) => {
        if (task.type !== 'grammar') return;
        grammarTasks += 1;
        bad.push(...grammarDefects(task, lesson.id, verified));
      }
    }), `${lesson.id} özete ulaşamadı`);
  }
  assert.ok(grammarTasks > 0, 'hiç gramer görevi görülmedi (tarama boş)');
  return [bad.length === 0, `${lessons} ders, ${grammarTasks} gramer görevinde ${bad.length} kusur · ör. ${bad.slice(0, 3).join(' | ')}`];
});

check('R-04', 'K5-01', () => {
  const t = bootKao();
  freshUser(t, { start: 's0' });
  const step = t.api.kaoNextStep(NOW);
  // S0 öğrencisi seviye-1 ders planına (goal,apply,summary) düşmemeli; gerçek S0 oturumu 4 aşamalı açılır.
  t.api.kaoS0Start(step.param);
  const html = t.api.kaoS0HTML();
  const stages = /Aşama 1 \/ 4/.test(html);
  return [step.kind === 's0-lesson' && /^s0\.\d\d$/.test(String(step.param)) && stages, `S0 öğrencisi → ${step.kind} ${step.param} · 4 aşamalı S0 oturumu=${stages}`];
});

check('R-05', 'K5-02 (i)', () => {
  const src = ['app/core/quranLearn.js', 'app/core/quranLearnViews.js', 'app/core/quranLearnFlow.js'].map(read).join('\n');
  const referenced = new Set([...src.matchAll(/App\.(kao[A-Za-z0-9]+)|name:'(kao[A-Za-z0-9]+)'|action:'(kao[A-Za-z0-9]+)'/g)].map((m) => m[1] || m[2] || m[3]));
  const defined = new Set([...read('app.js').matchAll(/App\.(kao[A-Za-z0-9]+) *= *function/g)].map((m) => m[1]));
  const missing = [...referenced].filter((name) => !defined.has(name));
  assert.ok(referenced.size > 20, `işaretlemede çağrılan ad sayısı beklenenden az (${referenced.size})`);
  return [missing.length === 0, `${referenced.size} çağrılan ad; app.js'te tanımsız: ${missing.join(', ') || 'yok'}`];
});

check('R-06', 'K5-02 (iv)', () => {
  const crashed = [];
  for (let i = 1; i <= 12; i += 1) {
    const id = 's0.' + String(i).padStart(2, '0');
    const t = bootKao();
    freshUser(t);
    t.api.kaoS0Start(id);
    try { t.api.kaoS0HTML(); } catch (error) { crashed.push(id); }
  }
  return [crashed.length === 0, `kaoS0HTML çöken dersler: ${crashed.join(', ') || 'yok'}`];
});

check('R-07', 'K3-06', () => {
  const t = bootKao();
  freshUser(t, { intent: 'isha' });
  t.ui.kaoStack = [{ view: 'home', param: null }, { view: 'settings', param: null }];
  t.ui.kaoView = 'settings';
  const line = (t.api.kaoOverlayHTML(NOW).match(/Niyet:[^<]*/) || ['yok'])[0];
  return [!/Henüz seçilmedi/.test(line), `onboarding.intent='isha' → "${line}"`];
});

check('R-08', 'K3-01', () => {
  const t = bootKao();
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
  assert.ok(total > 100, `taranan ders sayısı beklenenden az (${total})`);
  return [empty === 0, `${empty}/${total} derste "Uygula" adımı içeriksiz`];
});

// R-09: testlerin eski kurulum yolu (yığınsız `kaoView` ataması) ana ekranı değil, atanan görünümü çizmeli;
// gerçek yönlendirme (kaoNav) de aynı görünümü açmalı.
check('R-09', 'K6-02', () => {
  const t = bootKao();
  freshUser(t);
  const wrong = [];
  for (const view of ['roots', 's0', 'sources']) {
    t.ui.kaoStack = []; t.ui.kaoView = view;
    const assigned = navTitle(t.api.kaoOverlayHTML(NOW));
    if (!assigned || /Kur(&#39;|')an Arapçası/.test(assigned)) wrong.push(`${view} ataması→"${assigned}"`);
    const nav = openView(t, view);
    if (nav.view !== view || nav.title !== assigned) wrong.push(`${view} kaoNav→${nav.view}/"${nav.title}"`);
  }
  return [wrong.length === 0, `yığınsız atama ve kaoNav ana ekrana düşmüyor: ${wrong.join(', ') || 'yok'}`];
});

check('R-10', 'M-11', () => {
  const src = read('tests/kao/test_kao2_kabul.js');
  const writesUnconditionally = /\nfs\.writeFileSync\(path\.join\(repoRoot, '[^']*A-KABUL\.md'\)/.test(src);
  return [!writesUnconditionally, 'kabul testi izlenen kanıt dosyasını her koşuda koşulsuz yeniden yazıyor ise FAIL'];
});

assert.equal(passed, 10, 'R-01…R-10 hepsi koşmalı');
console.log(`KAO2-38 denetim: PASS (${passed} kontrol)`);
