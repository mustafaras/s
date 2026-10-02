'use strict';

// K2F-02 · KAO test düzeneği: durumu elle kurmak yerine GERÇEK handler'larla sürmek için.
// Sentetik node:vm; ağ, tarayıcı, zamanlayıcı ve depo yok. Saat yalnız parametre.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../../repo-root');

const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranMahrecSchemasV1',
  'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];
const RUNTIME = ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js'];
const DEFAULT_NOW = '2026-09-30T12:00:00.000Z';
const WALK_GUARD = 300;

const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Görünen metin: etiketleri boşlukla değiştirir, varlıkları çözer.
function text(html) {
  return String(html || '').replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

// NavBar başlığı (kao-navbar-title); yoksa boş dize.
function navTitle(html) {
  const m = String(html || '').match(/kao-navbar-title[^>]*>([^<]*)/);
  return m ? text(m[1]) : '';
}

// Taslak (draft) gizleme davranışını gerçek veriden bağımsız sınamak için: tüm metinler onaylandığında hiç draft kalmaz.
// Bu dönüştürücü yalnız `quranCurriculumV2` kaynağını okur ve K2F-22 sonundaki duruma döndürür: yalnız aşağıdaki metinler onaylı
// (Ünite 12, 27 ders, 8 S0 dersi), geri kalanı `draft`. Repodaki veriye dokunmaz; `transformSource` seçeneğiyle kullanılır.
const LEGACY_SOURCED = new Set(['u12', 's0.02', 's0.03', 's0.04', 's0.05', 's0.07', 's0.08', 's0.09', 's0.12',
  'u01.04', 'u02.01', 'u02.02', 'u03.04', 'u04.01', 'u04.02', 'u04.04', 'u04.05', 'u06.01', 'u06.04', 'u06.07', 'u07.01', 'u07.02',
  'u07.03', 'u07.04', 'u07.06', 'u07.09', 'u08.07', 'u08.09', 'u09.06', 'u09.07', 'u09.11', 'u10.01', 'u10.03', 'u10.20', 'u11.03', 'u11.04']);
function legacyDraftState(name, source) {
  if (name !== 'quranCurriculumV2') return source;
  const start = source.indexOf('var data=') + 'var data='.length;
  const end = source.indexOf(';var index={}');
  const data = JSON.parse(source.slice(start, end));
  const demote = (entry, id) => {
    if (entry.review && entry.review.level === 'sourced' && !LEGACY_SOURCED.has(id)) entry.review = { ...entry.review, level: 'draft', by: null };
  };
  data.units.forEach((unit) => { demote(unit, `u${unit.id}`); unit.lessons.forEach((lesson) => demote(lesson, lesson.id)); });
  ((data.s0 && data.s0.lessons) || []).forEach((lesson) => demote(lesson, lesson.id));
  return source.slice(0, start) + JSON.stringify(data) + source.slice(end);
}

// Boş VM: içerik + Flow/Views/motor, `register*` sahteleriyle. `seeded` kartlı bir öğrenci kurar.
function bootKao({ now = DEFAULT_NOW, seeded = false, transformSource = null } = {}) {
  const box = { window: {}, Date };
  vm.createContext(box);
  // transformSource(ad, kaynak) → kaynak: yalnız testte, içerik modülünü sentetik biçimde bozmak için (ör. bir şablonu desteksiz yapmak).
  for (const n of CONTENT) { const src = read(`app/content/${n}.js`); vm.runInContext(transformSource ? transformSource(n, src) : src, box, { filename: n }); }
  for (const f of RUNTIME) vm.runInContext(read(f), box, { filename: f });
  const data = { settings: {}, days: {}, quranLearn: null, lastOpenedDate: now.slice(0, 10) };
  const ui = { kaoOpen: true, kaoView: 'home', kaoStack: [] };
  const timers = [];
  const calls = { lock: 0, unlock: 0, focus: [], restore: [], mount: 0, render: 0, save: 0 };
  const api = box.window.SeymaQuranLearn;
  api.registerQuranLearn({
    data: () => data, ui: () => ui, save() { calls.save += 1; }, render() { calls.render += 1; },
    todayStr: () => now.slice(0, 10), esc, icon: () => '', getDay: () => ({})
  });
  api.registerQuranLearnSurface({
    toast() {}, isQuietTime: false, mount() { calls.mount += 1; },
    lockBody() { calls.lock += 1; }, unlockBody() { calls.unlock += 1; },
    focusDialog(id) { calls.focus.push(id); }, restoreFocus(id) { calls.restore.push(id); },
    activeElementId: () => '', sheetClose(_e, _b, done) { if (done) done(); }, taskElement: () => null,
    setTimer(fn, ms) { timers.push({ fn, ms }); return timers.length; }
  });
  const t = { api, box, win: box.window, data, ui, calls, timers, NOW: now };
  if (seeded) seed(t);
  return t;
}

function seed(t) {
  const q = freshUser(t);
  for (const lemma of t.win.QuranLexiconV1.lemmas.slice(0, 20)) {
    for (const dir of ['ar>tr', 'tr>ar']) q.cards[`w:${lemma.id}:${dir}`] = { state: 'review', s: 40, reps: 6 };
  }
  q.daily['2026-09-29'] = { answered: 12, correct: 10, new: 4, reviewed: 8 };
  return q;
}

// Onboarding bitmiş, temiz bir kullanıcı; `onboardingPatch` alanları üstüne yazar.
function freshUser(t, onboardingPatch) {
  const q = JSON.parse(JSON.stringify(t.api.ensureQuranLearn({ quranLearn: null })));
  q.onboarding.doneAt = '2026-09-20T00:00:00.000Z';
  q.onboarding.start = 'level1';
  Object.assign(q.onboarding, onboardingPatch || {});
  t.data.quranLearn = q;
  return q;
}

// Görünümü GERÇEK yönlendirmeyle açar (yığın elle kurulmaz): kaoOpen('home') + kaoNav.
// `mode:'set'` kaoSetView'u (sıfırlayarak) kullanır. Sonuç: {ok, view, stack, title, html}.
function openView(t, view, param, { mode = 'nav' } = {}) {
  t.ui.kaoStack = []; t.ui.kaoView = 'home'; t.ui.kaoOpen = false;
  t.api.kaoOpen('home');
  const ok = mode === 'set' ? t.api.kaoSetView(view) : t.api.kaoNav(view, param);
  const html = t.api.kaoOverlayHTML(t.NOW);
  return { ok, view: t.ui.kaoView, stack: Array.from(t.ui.kaoStack || [], (e) => e.view), title: navTitle(html), html };
}

// Başlamış bir ders/ustalık/onarım oturumunu gerçek handler'larla özet ekranına kadar oynatır.
// answer: 'correct' | 'wrong' | (task) => choiceId. visit(task) her görevde çağrılır. Özette true, takılırsa false.
function playLesson(t, { answer = 'correct', visit } = {}) {
  const st = t.ui.kaoLesson;
  if (!st) return false;
  const choose = (task) => {
    const choices = task.choices || [];
    if (typeof answer === 'function') return answer(task);
    const hit = answer === 'wrong' ? choices.find((c) => !c.correct) : choices.find((c) => c.correct);
    return (hit || choices[0] || {}).choiceId;
  };
  for (let guard = 0; guard < WALK_GUARD; guard += 1) {
    if (st.phase === 'practice' || st.phase === 'review') {
      const item = t.ui.kaoQueue[t.ui.kaoTaskIndex];
      const task = item && t.ui.kaoTasks[item.id];
      if (!task) return false;
      if (visit) visit(task);
      if (task.kind === 'order') {
        // K2F-11: "Kelime dizme" (kind:'order') birden çok seçim ister: ordinal sırayla (answer:'wrong' → ters sıra) tek tek seçilir.
        const byOrdinal = (task.choices || []).slice().sort((a, b) => a.ordinal - b.ordinal);
        for (const c of (answer === 'wrong' ? byOrdinal.slice().reverse() : byOrdinal)) t.api.kaoAnswer(task.id, c.choiceId);
        t.api.kaoContinue();
        continue;
      }
      const pick = choose(task);
      if (pick === undefined) return false;
      t.api.kaoAnswer(task.id, pick);
      t.api.kaoContinue();
      continue;
    }
    const current = st.plan[st.at];
    if (!current || current.kind === 'summary') return true;
    t.api.kaoLesson('next');
  }
  return false;
}

// Dersi başlatır ve özet ekranına kadar oynatır (bkz. playLesson).
function walkLesson(t, lessonId, options = {}) {
  if (!t.api.kaoLesson('start', lessonId)) return false;
  return playLesson(t, options);
}

// "Dokunma": ekrandaki bir düğmenin onclick'ini gerçek `App.kao*` adıyla motora yönlendirir (işaretlemeden okunur).
// cls: düğme sınıfı (kao-primary | kao-hero-secondary). Dönüş: {name, args, ok}; düğme yoksa null.
function tap(t, cls) {
  const html = t.api.kaoOverlayHTML(t.NOW);
  const m = new RegExp(`class="(?:[^"]* )?${cls}(?: [^"]*)?"[^>]*onclick="App\\.(kao\\w+)\\(([^"]*)\\)"`).exec(html);
  if (!m) return null;
  const args = JSON.parse('[' + m[2].replace(/&quot;/g, '"').replace(/&#39;/g, "'") + ']');
  return { name: m[1], args, ok: t.api[m[1]](...args) };
}
const tapPrimary = (t) => tap(t, 'kao-primary');
const tapSecondary = (t) => tap(t, 'kao-hero-secondary');
const countClass = (html, cls) => (String(html).match(new RegExp(`class="${cls}[" ]`, 'g')) || []).length;

module.exports = { legacyDraftState, bootKao, freshUser, seed, openView, walkLesson, playLesson, tap, tapPrimary, tapSecondary, countClass, text, navTitle, esc, read, repoRoot, DEFAULT_NOW };
