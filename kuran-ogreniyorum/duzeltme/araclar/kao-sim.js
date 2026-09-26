'use strict';
// KAO denetimi: 365 günlük simülasyon — gerçek kaoStart/kaoAnswer akışı, sahte saat.
// Kullanım: node kao-sim.js <repoRoot> [days] [pCorrect] [startLocalISO]
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repo = process.argv[2];
const DAYS = Number(process.argv[3] || 365);
const P = Number(process.argv[4] || 0.9);
const START = process.argv[5] || '2026-01-01T08:00:00';

function makeRng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const rng = makeRng(20260926);

let nowMs = new Date(START).getTime();
const RealDate = Date;
class FakeDate extends RealDate {
  constructor(...args) { if (args.length === 0) super(nowMs); else super(...args); }
  static now() { return nowMs; }
}

function boot() {
  const sandbox = { window: {}, console, Date: FakeDate };
  sandbox.window.Date = FakeDate;
  vm.createContext(sandbox);
  for (const rel of ['app/content/quranLexiconV1.js', 'app/content/quranGrammarV1.js', 'app/content/quranShortSurahsV1.js', 'app/content/quranPhonicsV1.js', 'app/content/quranRevelationOrderV1.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repo, rel), 'utf8'), sandbox, { filename: rel });
  }
  return sandbox.window;
}

const win = boot();
const api = win.SeymaQuranLearn;
const data = { settings: {} };
const ui = {};
let saves = 0;
const pad = (n) => String(n).padStart(2, '0');
const today = () => { const d = new FakeDate(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
api.registerQuranLearn({
  data: () => data, ui: () => ui, save: () => { saves += 1; }, render: () => {}, todayStr: today,
  esc: (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`), icon: () => '', getDay: () => ({})
});
api.ensureQuranLearn(data);

const st = { sessions: 0, tasks: 0, perDay: [], runViol: 0, maxRun: 0, grammarMax: 0, fragMax: 0, newMax: 0,
  directions: { 'ar>tr': 0, 'tr>ar': 0 }, overdue: [], dueAtStart: [], size: [], errors: [] };

for (let day = 0; day < DAYS; day += 1) {
  nowMs = new Date(START).getTime() + day * 86400000;
  const dueBefore = Object.values(data.quranLearn.cards).filter((c) => c.state !== 'new' && new Date(c.due).getTime() <= nowMs).length;
  st.dueAtStart.push(dueBefore);
  try { api.kaoStart(); } catch (e) { st.errors.push(`day ${day} kaoStart: ${e.message}`); continue; }
  st.sessions += 1;
  const types = ui.kaoQueue.map((x) => x.type);
  let run = 1;
  for (let i = 1; i < types.length; i += 1) { run = types[i] === types[i - 1] ? run + 1 : 1; if (run > 2) st.runViol += 1; st.maxRun = Math.max(st.maxRun, run); }
  st.grammarMax = Math.max(st.grammarMax, types.filter((t) => t === 'grammar').length);
  st.fragMax = Math.max(st.fragMax, types.filter((t) => t === 'fragment').length);
  st.newMax = Math.max(st.newMax, ui.kaoQueue.filter((x) => x.isNew).length);
  let guard = 0;
  while (ui.kaoTaskIndex < ui.kaoQueue.length && guard < 400) {
    guard += 1;
    const item = ui.kaoQueue[ui.kaoTaskIndex];
    ui.kaoTasks[item.id] = ui.kaoTasks[item.id] || api.kaoBuildTask(item, data, { seed: item.id });
    const cur = ui.kaoTasks[item.id];
    nowMs += 4000;
    const ok = rng() < P;
    if (cur.kind === 'order') {
      const ordered = cur.choices.slice().sort((a, b) => a.ordinal - b.ordinal);
      for (const c of (ok ? ordered : ordered.slice().reverse())) api.kaoAnswer(cur.id, c.choiceId);
    } else {
      const choice = ok ? cur.choices.find((c) => c.correct) : (cur.choices.find((c) => !c.correct) || cur.choices[0]);
      if (!choice) { st.errors.push(`day ${day}: seçenek yok ${cur.id}`); ui.kaoTaskIndex += 1; continue; }
      if (api.kaoAnswer(cur.id, choice.choiceId) === false) { st.errors.push(`day ${day}: kaoAnswer false ${cur.id}`); ui.kaoTaskIndex += 1; continue; }
    }
    if (cur.direction && !cur.grammarType && cur.type !== 'fragment') st.directions[cur.direction] += 1;
    st.tasks += 1;
  }
  st.perDay.push(ui.kaoQueue.length);
  const endNow = nowMs;
  st.overdue.push(Object.values(data.quranLearn.cards).filter((c) => c.state === 'review' && new Date(c.due).getTime() < endNow - 86400000).length);
  if ((day + 1) % 90 === 0 || day === DAYS - 1) st.size.push({ day: day + 1, KB: +(Buffer.byteLength(JSON.stringify(data.quranLearn)) / 1024).toFixed(1), dailyRows: Object.keys(data.quranLearn.daily).length, cards: Object.keys(data.quranLearn.cards).length });
}
const cards = data.quranLearn.cards;
const lemmaDirs = {};
for (const id of Object.keys(cards)) { const m = id.match(/^w:(.+):(ar>tr|tr>ar)$/); if (m) (lemmaDirs[m[1]] = lemmaDirs[m[1]] || new Set()).add(m[2]); }
const knownPlan = Object.entries(lemmaDirs).filter(([l, s]) => s.size === 2 && [...s].every((d) => { const c = cards[`w:${l}:${d}`]; return c.state === 'review' && c.s >= 21; })).length;
const cov = api.kaoCoverage(data);
const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
console.log(JSON.stringify({
  days: DAYS, pCorrect: P, start: START, sessions: st.sessions, tasks: st.tasks,
  sessionLen: { min: Math.min(...st.perDay), median: med(st.perDay), max: Math.max(...st.perDay) },
  dueAtStart: { median: med(st.dueAtStart), max: Math.max(...st.dueAtStart), last: st.dueAtStart[st.dueAtStart.length - 1] },
  maxSameTypeRun: st.maxRun, runViolations: st.runViol, grammarMax: st.grammarMax, fragmentMax: st.fragMax, newMax: st.newMax,
  directions: st.directions, lemmasSeen: Object.keys(lemmaDirs).length, lemmasBothDirections: Object.values(lemmaDirs).filter((s) => s.size === 2).length,
  knownByPlanDefinition: knownPlan, knownByCode: Object.keys(api.kaoKnownLemmaSet(data)).length, codeCoveragePct: +(cov.ratio * 100).toFixed(2),
  overdueReviewAtEnd: { max: Math.max(...st.overdue), last: st.overdue[st.overdue.length - 1] },
  size: st.size, saves, errorCount: st.errors.length, errors: st.errors.slice(0, 5), milestones: data.quranLearn.milestones
}, null, 1));
