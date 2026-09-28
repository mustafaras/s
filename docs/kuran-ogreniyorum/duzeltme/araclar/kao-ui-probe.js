'use strict';
// KAO denetimi: E1…E11 HTML yoklaması (boş + 60 günlük durum), migrate idempotans, gizlilik taraması.
// Kullanım: node kao-ui-probe.js <repoRoot>
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repo = process.argv[2];

let nowMs = new Date('2026-03-01T10:00:00').getTime();
class FakeDate extends Date { constructor(...a) { if (a.length === 0) super(nowMs); else super(...a); } static now() { return nowMs; } }
const sb = { window: {}, console, Date: FakeDate };
vm.createContext(sb);
for (const rel of ['app/content/quranLexiconV1.js', 'app/content/quranGrammarV1.js', 'app/content/quranShortSurahsV1.js', 'app/content/quranPhonicsV1.js', 'app/content/quranRevelationOrderV1.js', 'app/core/quranLearn.js']) {
  vm.runInContext(fs.readFileSync(path.join(repo, rel), 'utf8'), sb, { filename: rel });
}
const api = sb.window.SeymaQuranLearn;
const data = { settings: { targetBed: '23:30' } };
const ui = {};
const pad = (n) => String(n).padStart(2, '0');
const today = () => { const d = new FakeDate(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
api.registerQuranLearn({ data: () => data, ui: () => ui, save: () => {}, render: () => {}, todayStr: today,
  esc: (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`), icon: (n) => `<svg data-i="${n}"></svg>`, getDay: () => ({}) });
api.registerCaffeineTargetBed(() => '23:30');
api.ensureQuranLearn(data);

const views = {
  'E1 home': () => api.kaoHomeHTML(),
  'E2 session': () => { api.kaoStart(); return api.kaoTaskHTML(ui.kaoTasks[ui.kaoQueue[0] && ui.kaoQueue[0].id]); },
  'E3 done': () => api.kaoTaskHTML(null),
  'E4 units': () => api.kaoUnitsHTML(),
  'E5 word': () => { api.kaoOpenWord(api.kaoUnits()[0].lemmaId); return api.kaoWordHTML(); },
  'E6 reader': () => { api.kaoOpenSurah(112); return api.kaoReaderHTML(); },
  'E7 settings': () => api.kaoSettingsHTML(),
  'E8 phonics': () => { api.kaoOpenPhonics(); return api.kaoPhonicsHTML(); },
  'E9 ayah': () => { api.kaoOpenAyah(); return api.kaoAyahHTML(); },
  'E10 map': () => { api.kaoOpenMap(); return api.kaoMapHTML(); },
  'E11 prayer': () => { api.kaoOpenPrayer(); return api.kaoPrayerHTML(); },
  'Stats': () => api.kaoStatsHTML(),
  'Gate': () => (api.kaoGateHTML ? api.kaoGateHTML() : ''),
  'Hub card': () => api.kaoHubCardHTML(),
  'Overlay': () => { ui.kaoOpen = true; ui.kaoView = 'home'; return api.kaoOverlayHTML(); }
};

function scan(html) {
  const issues = [];
  if (typeof html !== 'string' || !html.length) return ['boş HTML'];
  for (const bad of ['undefined', 'NaN', '[object Object]']) if (html.includes(bad)) issues.push(`içerir: ${bad}`);
  const arabicText = (html.match(/>[^<]*[\u0600-\u06ff][^<]*</g) || []).length;
  if (arabicText && !/lang="ar"/.test(html)) issues.push(`Arapça metin (${arabicText}) ama lang="ar" yok`);
  const noType = (html.match(/<button\b[^>]*>/g) || []).filter((b) => !/type="button"/.test(b)).length;
  if (noType) issues.push(`${noType} button type="button" değil`);
  if (/\bpuan\b|\bXP\b/i.test(html.replace(/<[^>]+>/g, ' '))) issues.push('puan/XP dizgisi');
  return issues;
}

function runAll(label) {
  console.log(`--- ${label}`);
  for (const [name, fn] of Object.entries(views)) {
    let html = '', issues;
    try { html = fn(); issues = scan(html); } catch (e) { issues = [`HATA: ${e.message}`]; }
    console.log(`${name.padEnd(12)} ${String(html ? html.length : 0).padStart(6)} B ${issues.length ? issues.join('; ') : 'ok'}`);
  }
}
runAll('boş durum');

for (let day = 0; day < 60; day += 1) {
  nowMs = new Date('2026-03-01T10:00:00').getTime() + day * 86400000;
  api.kaoStart();
  let g = 0;
  while (ui.kaoTaskIndex < ui.kaoQueue.length && g++ < 300) {
    const item = ui.kaoQueue[ui.kaoTaskIndex];
    const t = ui.kaoTasks[item.id] || (ui.kaoTasks[item.id] = api.kaoBuildTask(item, data, { seed: item.id }));
    nowMs += 3000;
    if (t.kind === 'order') { for (const c of t.choices.slice().sort((a, b) => a.ordinal - b.ordinal)) api.kaoAnswer(t.id, c.choiceId); }
    else api.kaoAnswer(t.id, (t.choices.find((c) => c.correct) || t.choices[0]).choiceId);
  }
}
if (api.kaoFlag) api.kaoFlag(Object.keys(data.quranLearn.cards)[0], 'meaning');
data.quranLearn.phonics.misheard = { hah: 3, ayn: 2 };
runAll('60 gün sonrası');

const cases = { null: null, array: [], str: 'x', partial: { cards: { 'w:x:ar>tr': { s: 'bad', due: 5 } }, daily: [] }, oldLexicon: { lexiconVersion: 'old', cards: { 'w:gone:ar>tr': { s: 1 } } } };
for (const [k, v] of Object.entries(cases)) {
  const d = { quranLearn: JSON.parse(JSON.stringify(v)) };
  let a, b, err = null;
  try { api.ensureQuranLearn(d); a = JSON.stringify(d); api.ensureQuranLearn(d); b = JSON.stringify(d); } catch (e) { err = e.message; }
  console.log(`migrate ${k.padEnd(10)} ${err ? 'HATA ' + err : (a === b ? 'idempotent' : 'İDEMPOTENT DEĞİL')}${k === 'oldLexicon' && !err ? ' orphan=' + JSON.stringify(d.quranLearn.cards['w:gone:ar>tr'].orphan) : ''}`);
}

const psb = { window: {}, console };
vm.createContext(psb);
vm.runInContext(fs.readFileSync(path.join(repo, 'panel/panelCoverageManifest.js'), 'utf8'), psb, { filename: 'manifest' });
const P = psb.window.PanelCoverageV1 || psb.PanelCoverageV1;
data.quranLearn.summary = api.kaoPanelSummary(data);
let snapText;
try { snapText = JSON.stringify(P.buildObserverSnapshot({ ...data, days: {} }, null, new Date().toISOString())); } catch (e) { snapText = 'HATA ' + e.message; }
const lemmaIds = Object.keys(data.quranLearn.cards).map((id) => (id.match(/^w:([^:]+)/) || [])[1]).filter(Boolean);
const leaks = ['"w:', 'misheard', '"cards"', 'hah', 'nightAt', 'predictedR', ...lemmaIds].filter((n) => snapText.includes(n));
console.log('snapshot bayt', snapText.length, '· sızıntı', leaks.length ? leaks.slice(0, 10) : 'yok');
console.log('panel projeksiyonu', JSON.stringify(P.quranLearnProjection(data.quranLearn, today())));
console.log('60 gün: kod kapsamı %', Math.floor(api.kaoCoverage(data).ratio * 100), '· kod "bilinen"', Object.keys(api.kaoKnownLemmaSet(data)).length,
  '· review∧s≥21 kelime kartı', Object.entries(data.quranLearn.cards).filter(([id, c]) => /^w:/.test(id) && c.state === 'review' && c.s >= 21).length);
