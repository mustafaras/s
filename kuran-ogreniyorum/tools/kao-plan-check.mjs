#!/usr/bin/env node
// KAO plan denetleyici — salt-okur (yalnız --render CURRENT-STATE.md yazar).
// Kaynak: kuran-ogreniyorum/KAO-STATE.json (tek doğruluk kaynağı).
// Kullanım:
//   node kuran-ogreniyorum/tools/kao-plan-check.mjs            # tüm kontroller, FAIL → exit 1
//   node kuran-ogreniyorum/tools/kao-plan-check.mjs --render   # + .anti-amnesia/CURRENT-STATE.md üret
//   node kuran-ogreniyorum/tools/kao-plan-check.mjs --self-test
//   node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-07   # yalnız o kartın kapsam/kontrol özeti
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const PLAN = path.join(ROOT, 'kuran-ogreniyorum');
const STATE_PATH = path.join(PLAN, 'KAO-STATE.json');
const LEDGER_PATH = path.join(PLAN, '.anti-amnesia', 'LEDGER.md');
const CURRENT_PATH = path.join(PLAN, '.anti-amnesia', 'CURRENT-STATE.md');
const PROMPTS_PATH = path.join(PLAN, 'UYGULAMA-PROMPTLARI.md');
const REQ_DOC = path.join(PLAN, '12-EK-GEREKSINIMLER.md');

const CARD_STATUSES = ['pending', 'active', 'waiting_user', 'implemented', 'done', 'blocked'];
const LOAD_LISTS = ['index.html', '.claude/skills/run-seyma/driver.mjs', '.claude/skills/run-seyma/zikr-harness.mjs', 'tests/app/test_state_rebind_boundary.js'];
const KAO_SOURCE_FILES = ['app/core/quranLearn.js', 'app/content/quranLexiconV1.js', 'app/content/quranGrammarV1.js', 'app/content/quranShortSurahsV1.js', 'app/content/quranPhonicsV1.js'];
const FORBIDDEN_ANYWHERE = ['SeyAudio.say'];
const FORBIDDEN_IN_REGISTRY = ['localStorage', 'XMLHttpRequest', 'SeySync', 'ghToken', 'openaiKey', 'sessionStorage', 'indexedDB'];

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function git(args) { try { return execSync(`git -c core.fsmonitor=false ${args}`, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } }
function globToRe(g) {
  const esc = g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*');
  return new RegExp('^' + esc + '$');
}
function inScope(file, globs) { return globs.some(g => globToRe(g).test(file)); }
function promptIndex(state, id) { return state.promptOrder.indexOf(id); }

export function check(state, ctx) {
  const fails = [], warns = [];
  const fail = (m) => fails.push(m), warn = (m) => warns.push(m);
  const cards = state.cards || {};
  const order = state.promptOrder || [];
  const cardIds = Object.keys(cards);

  // 1 · şema
  if (!Array.isArray(order) || !order.length) fail('promptOrder boş');
  for (const id of cardIds) if (!order.includes(id)) fail(`kart promptOrder'da yok: ${id}`);
  for (const id of order) if (!cards[id] && !/^KAO-(P00|D\d)$/.test(id)) fail(`promptOrder'da tanımsız kart: ${id}`);
  const waveCards = new Set(Object.values(state.waves || {}).flatMap(w => w.cards));
  for (const id of cardIds) if (!waveCards.has(id)) fail(`kart hiçbir dalgada değil: ${id}`);
  for (const id of waveCards) if (!cards[id]) fail(`dalgada tanımsız kart: ${id}`);
  for (const [id, c] of Object.entries(cards)) {
    if (!CARD_STATUSES.includes(c.status)) fail(`${id}: geçersiz status ${c.status}`);
    if (!Array.isArray(c.files) || !c.files.length) fail(`${id}: files boş`);
    if (!Array.isArray(c.checks)) fail(`${id}: checks yok`);
    for (const d of c.deps || []) {
      if (!cards[d]) fail(`${id}: bağımlılık tanımsız ${d}`);
      else if (promptIndex(state, d) > promptIndex(state, id)) fail(`${id}: bağımlılık ${d} sırada sonra geliyor`);
    }
  }
  // 2 · gereksinim sahipliği
  const reqIds = (state.requirements && state.requirements.ids) || [];
  const owned = new Set(Object.values(cards).flatMap(c => c.req || []));
  for (const r of reqIds) if (!owned.has(r)) fail(`gereksinimin sahibi kart yok: ${r}`);
  for (const r of owned) if (!reqIds.includes(r)) fail(`kartta bilinmeyen gereksinim: ${r}`);
  if (ctx.reqDoc) { const inDoc = new Set(ctx.reqDoc.match(/R-[ABC]\d/g) || []); for (const r of reqIds) if (!inDoc.has(r)) fail(`12-EK-GEREKSINIMLER'de yok: ${r}`); }
  // 3 · prompt dosyası
  if (ctx.prompts != null) {
    const heads = [...ctx.prompts.matchAll(/^## (KAO-(?:P00|D\d|\d+b?))\b/gm)].map(m => m[1]);
    for (const id of order) if (!heads.includes(id)) fail(`UYGULAMA-PROMPTLARI'nda başlık yok: ${id}`);
    const filtered = heads.filter(h => order.includes(h));
    for (let i = 0; i < filtered.length; i++) if (filtered[i] !== order[i]) { fail(`prompt sırası STATE ile uyuşmuyor: ${i + 1}. ${filtered[i]} ≠ ${order[i]}`); break; }
  } else warn('UYGULAMA-PROMPTLARI.md bulunamadı');
  // 4 · ledger
  if (ctx.ledger != null) {
    const seqs = [...ctx.ledger.matchAll(/^\| (\d+) \|/gm)].map(m => Number(m[1]));
    if (!seqs.length) fail('LEDGER satırı yok');
    for (let i = 1; i < seqs.length; i++) if (seqs[i] !== seqs[i - 1] + 1) fail(`LEDGER seq atlıyor: ${seqs[i - 1]} → ${seqs[i]}`);
  } else fail('LEDGER.md yok');
  // 5 · aktif/son/engel tutarlılığı
  const { activePrompt, lastCompletedPrompt, blockedPrompt } = state;
  if (lastCompletedPrompt && !order.includes(lastCompletedPrompt)) fail(`lastCompletedPrompt tanımsız: ${lastCompletedPrompt}`);
  if (activePrompt && !order.includes(activePrompt)) fail(`activePrompt tanımsız: ${activePrompt}`);
  if (activePrompt && lastCompletedPrompt && promptIndex(state, activePrompt) !== promptIndex(state, lastCompletedPrompt) + 1) fail(`activePrompt ${activePrompt} sıradaki değil (son: ${lastCompletedPrompt})`);
  if (activePrompt && !lastCompletedPrompt && promptIndex(state, activePrompt) !== 0) fail(`ilk prompt ${order[0]} olmalı, activePrompt ${activePrompt}`);
  if (blockedPrompt && activePrompt && blockedPrompt !== activePrompt) fail('blockedPrompt ile activePrompt farklı');
  for (const [id, c] of Object.entries(cards)) {
    if (c.status === 'done' || c.status === 'implemented') {
      for (const d of c.deps || []) if (cards[d].status !== 'done') fail(`${id} ${c.status} ama bağımlılık ${d} done değil`);
      if (ctx.evidenceExists && !ctx.evidenceExists(id)) fail(`${id} ${c.status} ama evidence/${id}/EVIDENCE.json yok`);
    }
    if (c.status === 'active' && activePrompt !== id) fail(`${id} active ama activePrompt ${activePrompt}`);
    if (c.gate && ['active', 'implemented', 'done'].includes(c.status) && !(c.gateApproval && c.gateApproval.by && c.gateApproval.at)) fail(`${id} kapılı kart (${c.gate}) — gateApproval olmadan ${c.status} olamaz`);
  }
  if (state.releaseApproval !== 'NOT_APPROVED' && !(state.releaseApprovalRecord && state.releaseApprovalRecord.by)) fail('releaseApproval NOT_APPROVED değil ama kayıt yok');
  // 6 · commit kapsamı: konusu KAO-NN ile başlayan her commit yalnız o kartın izinli dosyalarına dokunur
  const CHORE_SCOPE = ['kuran-ogreniyorum/KAO-STATE.json', 'kuran-ogreniyorum/.anti-amnesia/**', 'kuran-ogreniyorum/evidence/**'];
  for (const cm of ctx.commits || []) {
    if (/^chore\(kao\)/.test(cm.subject)) { for (const f of cm.files) if (!inScope(f, CHORE_SCOPE)) fail(`commit ${cm.hash.slice(0, 7)} chore(kao) kapsam dışı dosya: ${f}`); continue; }
    const m = cm.subject.match(/^(KAO-(?:P00|D\d|\d+b?))\b/); if (!m) continue;
    const id = m[1];
    const scope = cards[id] ? cards[id].files : (id === 'KAO-P00' ? (state.bootstrap && state.bootstrap.files) : (state.auditScope && state.auditScope.files));
    if (!scope) { fail(`commit ${cm.hash.slice(0, 7)} tanımsız karta atıf: ${id}`); continue; }
    for (const f of cm.files) if (!inScope(f, scope)) fail(`commit ${cm.hash.slice(0, 7)} (${id}) kapsam dışı dosya: ${f}`);
  }
  // 7 · kaynak yasakları ve yükleme listeleri
  for (const f of KAO_SOURCE_FILES) {
    const src = ctx.readSource ? ctx.readSource(f) : null; if (src == null) continue;
    for (const p of FORBIDDEN_ANYWHERE) if (src.includes(p)) fail(`${f}: yasak ifade ${p}`);
    if (f.endsWith('quranLearn.js')) {
      for (const p of FORBIDDEN_IN_REGISTRY) if (src.includes(p)) fail(`${f}: registry'de yasak ${p}`);
      for (const mm of src.matchAll(/fetch\(\s*([^)]*)\)/g)) if (!/assets\/kao\//.test(mm[1])) fail(`${f}: fetch yalnız assets/kao/ olabilir → ${mm[1].slice(0, 60)}`);
      if (/MediaRecorder/.test(src) && /(save\(|SeymaSave)/.test(src)) warn(`${f}: MediaRecorder ve save birlikte — kayıt kalıcı yola çıkmıyor mu, elle incele (05 §4)`);
    } else if (/verified\s*:\s*false|"verified"\s*:\s*false/.test(src)) fail(`${f}: verified:false kayıt üretim paketinde`);
    const base = path.basename(f);
    for (const L of LOAD_LISTS) { const t = ctx.readSource(L); if (t != null && !t.includes(base)) fail(`${base} ${L} yükleme listesinde yok (MON-25 dört liste kuralı)`); }
  }
  return { fails, warns };
}

function realCtx() {
  const readSource = (rel) => { const p = path.join(ROOT, rel); return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null; };
  const commits = git('log --format=%H%x1f%s -n 400').split('\n').filter(Boolean).map(l => { const [hash, subject] = l.split('\x1f'); return { hash, subject, files: git(`show --pretty=format: --name-only ${hash}`).split('\n').filter(Boolean) }; });
  return {
    prompts: fs.existsSync(PROMPTS_PATH) ? fs.readFileSync(PROMPTS_PATH, 'utf8') : null,
    ledger: fs.existsSync(LEDGER_PATH) ? fs.readFileSync(LEDGER_PATH, 'utf8') : null,
    reqDoc: fs.existsSync(REQ_DOC) ? fs.readFileSync(REQ_DOC, 'utf8') : null,
    evidenceExists: (id) => fs.existsSync(path.join(PLAN, 'evidence', id, 'EVIDENCE.json')),
    readSource, commits,
  };
}

function render(state) {
  const order = state.promptOrder;
  const next = state.activePrompt || (state.lastCompletedPrompt ? order[promptIndex(state, state.lastCompletedPrompt) + 1] : order[0]);
  const auditStatus = state.auditStatus || {};
  const rows = order.map(id => {
    const c = state.cards[id];
    const title = c ? c.title : (id === 'KAO-P00' ? 'Başlangıç (branch, tests/kao iskeleti, plan-check)' : `Dalga ${id.slice(-1)} denetimi`);
    const status = c ? c.status : (id === 'KAO-P00' ? (state.lastCompletedPrompt ? 'done' : 'pending') : (auditStatus[id] || 'pending'));
    return `| ${id} | ${title} | ${status} | ${c && c.req && c.req.length ? c.req.join(' ') : '—'} |`;
  });
  const done = Object.values(state.cards).filter(c => c.status === 'done').length;
  const lastLedger = fs.existsSync(LEDGER_PATH) ? (fs.readFileSync(LEDGER_PATH, 'utf8').trim().split('\n').filter(l => /^\| \d+ \|/.test(l)).pop() || '—') : '—';
  const out = `# KAO · Güncel durum (üretilmiş dosya — elle düzenleme; \`node kuran-ogreniyorum/tools/kao-plan-check.mjs --render\`)

**Güncelleme:** ${new Date().toISOString().slice(0, 10)} · **Durum:** \`${state.status}\` · **Sürüm:** ${state.version} · **Tamamlanan kart:** ${done}/${Object.keys(state.cards).length}
**activePrompt:** ${state.activePrompt || '—'} · **lastCompletedPrompt:** ${state.lastCompletedPrompt || '—'} · **blockedPrompt:** ${state.blockedPrompt || '—'} · **Sıradaki:** **${next || '—'}**
**releaseApproval:** ${state.releaseApproval} · **Baseline:** ${state.baseline.commit} (${state.baseline.branch})

## Açık kararlar
${Object.entries(state.decisions).filter(([, d]) => d.status === 'open').map(([k, d]) => `- **${k}** — ${d.q}${d.recommended ? ` _(öneri: ${d.recommended})_` : ''}`).join('\n') || '- (yok)'}

## Prompt sırası ve durum
| Prompt | Başlık | Durum | Gereksinimler |
|---|---|---|---|
${rows.join('\n')}

## Gereksinim durumu (12-EK-GEREKSINIMLER)
${state.requirements.ids.map(r => `${r}:${state.requirements.status[r]}`).join(' · ')}

## Son ledger satırı
${lastLedger}
`;
  fs.writeFileSync(CURRENT_PATH, out);
  return out;
}

function selfTest() {
  const base = readJson(STATE_PATH);
  const clone = () => JSON.parse(JSON.stringify(base));
  const ctx0 = { prompts: null, ledger: '| 1 | d | e | k |', reqDoc: null, evidenceExists: () => true, readSource: () => null, commits: [] };
  const cases = [
    ['temiz state geçer', clone(), ctx0, (r) => r.fails.length === 0],
    ['bağımlılık sırası', (() => { const s = clone(); s.cards['KAO-01'].deps = ['KAO-22']; return s; })(), ctx0, (r) => r.fails.some(f => f.includes('sırada sonra'))],
    ['sahipsiz gereksinim', (() => { const s = clone(); for (const c of Object.values(s.cards)) c.req = (c.req || []).filter(r => r !== 'R-C9'); return s; })(), ctx0, (r) => r.fails.some(f => f.includes('R-C9'))],
    ['sıra atlama', (() => { const s = clone(); s.lastCompletedPrompt = 'KAO-01'; s.activePrompt = 'KAO-05'; return s; })(), ctx0, (r) => r.fails.some(f => f.includes('sıradaki değil'))],
    ['kapılı kart onaysız', (() => { const s = clone(); s.lastCompletedPrompt = 'KAO-23'; s.activePrompt = 'KAO-24'; s.cards['KAO-24'].status = 'active'; return s; })(), ctx0, (r) => r.fails.some(f => f.includes('gateApproval'))],
    ['done ama evidence yok', (() => { const s = clone(); s.cards['KAO-01'].status = 'done'; return s; })(), { ...ctx0, evidenceExists: () => false }, (r) => r.fails.some(f => f.includes('EVIDENCE.json'))],
    ['commit kapsamı', clone(), { ...ctx0, commits: [{ hash: 'abc1234def', subject: 'KAO-08: fsrs', files: ['app/core/saygi.js'] }] }, (r) => r.fails.some(f => f.includes('kapsam dışı'))],
    ['fetch yasağı + yükleme listesi', clone(), { ...ctx0, readSource: (f) => f === 'app/core/quranLearn.js' ? 'fetch("https://x")' : (LOAD_LISTS.includes(f) ? 'quranLearn.js' : null) }, (r) => r.fails.some(f => f.includes('fetch yalnız')) && !r.fails.some(f => f.includes('yükleme listesinde'))],
    ['yükleme listesi eksik', clone(), { ...ctx0, readSource: (f) => f === 'app/core/quranLearn.js' ? '' : (LOAD_LISTS.includes(f) ? '' : null) }, (r) => r.fails.filter(f => f.includes('yükleme listesinde')).length === 4],
    ['verified:false paket', clone(), { ...ctx0, readSource: (f) => f === 'app/content/quranLexiconV1.js' ? '{verified:false}' : (LOAD_LISTS.includes(f) ? 'quranLexiconV1.js' : null) }, (r) => r.fails.some(f => f.includes('verified:false'))],
    ['P00 kapsamı', clone(), { ...ctx0, commits: [{ hash: 'p00p00p00', subject: 'KAO-P00: iskelet', files: ['app.js'] }] }, (r) => r.fails.some(f => f.includes('kapsam dışı'))],
    ['chore(kao) kapsamı', clone(), { ...ctx0, commits: [{ hash: 'c0c0c0c0c', subject: 'chore(kao): state', files: ['app.js'] }] }, (r) => r.fails.some(f => f.includes('chore(kao) kapsam dışı'))],
    ['ledger seq atlama', clone(), { ...ctx0, ledger: '| 1 | a | b | c |\n| 3 | a | b | c |' }, (r) => r.fails.some(f => f.includes('seq atlıyor'))],
  ];
  let ok = 0;
  for (const [name, st, ctx, pred] of cases) { const pass = pred(check(st, ctx)); console.log(`${pass ? 'PASS' : 'FAIL'} self-test: ${name}`); if (pass) ok++; }
  console.log(`self-test ${ok}/${cases.length}`); process.exit(ok === cases.length ? 0 : 1);
}

const IS_MAIN = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
const args = process.argv.slice(2);
if (!IS_MAIN) { /* import edildi (test/simülasyon): CLI çalışmaz */ }
else if (args.includes('--self-test')) selfTest();
else {
  const state = readJson(STATE_PATH);
  if (args.includes('--card')) {
    const id = args[args.indexOf('--card') + 1]; const c = state.cards[id];
    if (!c) { console.error('kart yok: ' + id); process.exit(1); }
    console.log(JSON.stringify({ id, ...c, commonChecks: state.commonChecks, position: promptIndex(state, id) + 1, of: state.promptOrder.length }, null, 2));
    process.exit(0);
  }
  const { fails, warns } = check(state, realCtx());
  for (const w of warns) console.log('WARN ' + w);
  for (const f of fails) console.log('FAIL ' + f);
  if (args.includes('--render')) { render(state); console.log('rendered .anti-amnesia/CURRENT-STATE.md'); }
  console.log(fails.length ? `kao-plan-check: FAIL (${fails.length})` : `kao-plan-check: PASS (${warns.length} warn)`);
  process.exit(fails.length ? 1 : 0);
}
