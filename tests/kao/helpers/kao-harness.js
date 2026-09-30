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

// Boş VM: içerik + Flow/Views/motor, `register*` sahteleriyle. `seeded` kartlı bir öğrenci kurar.
function bootKao({ now = DEFAULT_NOW, seeded = false } = {}) {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const n of CONTENT) vm.runInContext(read(`app/content/${n}.js`), box, { filename: n });
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

// Ders oynatıcısını gerçek handler'larla sürer. answer: 'correct' | 'wrong' | (task) => choiceId.
// visit(task) her görevde çağrılır. Bitişte true (özet ekranı), takılırsa false.
function walkLesson(t, lessonId, { answer = 'correct', visit } = {}) {
  if (!t.api.kaoLesson('start', lessonId)) return false;
  const st = t.ui.kaoLesson;
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

module.exports = { bootKao, freshUser, seed, openView, walkLesson, text, navTitle, esc, read, repoRoot, DEFAULT_NOW };
