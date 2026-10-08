#!/usr/bin/env node
// KAO plan denetleyici — salt-okur (yalnız --render CURRENT-STATE.md yazar).
// Kaynak: kuran-ogreniyorum/KAO-STATE.json (tek doğruluk kaynağı).
// Kullanım:
//   node kuran-ogreniyorum/tools/kao-plan-check.mjs            # tüm kontroller, FAIL → exit 1
//   node kuran-ogreniyorum/tools/kao-plan-check.mjs --render   # + .anti-amnesia/CURRENT-STATE.md üret
//   node kuran-ogreniyorum/tools/kao-plan-check.mjs --self-test
//   node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-07   # yalnız o kartın kapsam/kontrol özeti
//   node kuran-ogreniyorum/tools/kao-plan-check.mjs --commits       # + kart başına commit sayısı (yalnız bilgi)
//   node docs/kuran-ogreniyorum/tools/kao-plan-check.mjs --since <hash>  # yalnız <hash>'ten sonraki commitleri denetle
//                                                                       # (verilmezse kao2-duzeltme/FIX-STATE.json.planCheckBase)
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const PLAN = path.join(ROOT, 'docs', 'kuran-ogreniyorum');
const STATE_PATH = path.join(PLAN, 'KAO-STATE.json');
const LEDGER_PATH = path.join(PLAN, '.anti-amnesia', 'LEDGER.md');
const CURRENT_PATH = path.join(PLAN, '.anti-amnesia', 'CURRENT-STATE.md');
const PROMPTS_PATH = path.join(PLAN, 'UYGULAMA-PROMPTLARI.md');
const REQ_DOC = path.join(PLAN, '12-EK-GEREKSINIMLER.md');

const CARD_STATUSES = ['pending', 'active', 'waiting_user', 'implemented', 'done', 'blocked'];
const LOAD_LISTS = ['index.html', '.claude/skills/run-seyma/driver.mjs', '.claude/skills/run-seyma/zikr-harness.mjs', 'tests/app/test_state_rebind_boundary.js'];
const KAO_SOURCE_FILES = ['app/core/quranLearn.js', 'app/content/quranLexiconV1.js', 'app/content/quranGrammarV1.js', 'app/content/quranShortSurahsV1.js', 'app/content/quranPhonicsV1.js'];
const FORBIDDEN_ANYWHERE = ['SeyAudio.say'];
// O-11 (KAO-FIX-17): KAO dosya kümesine dokunan her commit tanınan bir önek taşımalı. Taban (düzeltme programının
// başladığı `58e0ceb`) sonrası ihlal FAIL, öncesi yalnız WARN (a9fa40c, ecc7ac7 kayıt amaçlı görünür).
const FIX_BASE = '58e0ceb';
const KAO_FILE_SCOPE = ['app/core/quranLearn.js', 'app/kao.css', 'app/content/quranLexiconV1.js', 'app/content/quranGrammarV1.js', 'app/content/quranShortSurahsV1.js', 'app/content/quranPhonicsV1.js', 'tools/kao-*.mjs', 'tests/kao/**', 'assets/kao/**'];
// KAO-P00/KAO-Dn eski programın başlangıç/denetim kartlarıdır; "(ek)" düzeltme programının ek commit biçimidir.
// KAO-ARSIV: program kapanışında plan klasörünün kökten docs/ altına taşınması (2026-09-27); tek seferlik yol güncellemesi.
// K2F-NN: KAO2-FIX programı (kao2-duzeltme/, 44 prompt: K2F-00…K2F-43); tek hane ya da aralık dışı numara tanınmaz.
// D2F-NN: denetim-2 düzeltme programı (kao2-duzeltme/denetim-2/, 16 prompt: D2F-01…D2F-16); tek hane ya da aralık dışı numara tanınmaz.
// D3F-NN: denetim-3 düzeltme programı (kao2-duzeltme/denetim-3/, D3F-00 altyapı + bulgu başına bir kart, D3F-00…D3F-20); tek hane ya da aralık dışı numara tanınmaz.
const KAO_SUBJECT_RE = /^(?:(?:KAO2-(?:[01]\d|2[0-7])|K2F-(?:[0-3]\d|4[0-3])|D2F-(?:0[1-9]|1[0-6])|D3F-(?:[01]\d|20)|KAO-(?:P00|D\d|\d+b?)|KAO-FIX-\d+(?:\/[A-D])?(?: \(ek\))?|KAO-DENETIM|KAO-ARSIV):|chore\(kao\))/;
// Tek hash istisnaları (D2F-02, denetim-2 D2-12): tanınmayan önekle main'e girmiş, geçmişi yazılamayan commit'ler.
// Genel bir önek izni değil; yalnız tam hash + birebir konu öneki eşleşirse kabul edilir.
// 65e94db2 `K2F-38 ek:` (2026-10-06): kullanıcı isteğiyle ek iş; 5b267dde bunu genel "K2F-NN ek:" iznine çevirmişti, burada tek commit'e daraltıldı.
// 8e583a9 `denetim-2:` (2026-10-07, seq 10 NOTE): D2F-05/06 ortam kırmızılarını gideren NOTE commit'i; öneki tanınmıyordu, tek commit'e daraltıldı.
const SUBJECT_EXCEPTIONS = {
  '65e94db29eda6d81753dd70a7c5785e10052ebed': /^K2F-38 ek:/,
  '8e583a93e7b49211f21d93021dbd8fb67dd4c7df': /^denetim-2:/,
};
export function subjectRecognized(cm) {
  if (KAO_SUBJECT_RE.test(cm.subject)) return true;
  const re = SUBJECT_EXCEPTIONS[cm.hash];
  return Boolean(re && re.test(cm.subject));
}
const CARD_OF_SUBJECT_RE = /^(KAO2-(?:[01]\d|2[0-7])|K2F-(?:[0-3]\d|4[0-3])|D2F-(?:0[1-9]|1[0-6])|D3F-(?:[01]\d|20)|KAO-FIX-\d+(?:\/[A-D])?|KAO-(?:P00|D\d|\d+b?))(?=[: ])/;
// K2F-01 (M-10): plan-check tabanı — bu commit'ten SONRAKİ commitler denetlenir, öncesi tarihsel sayılır.
const FIX_STATE_PATH = path.join(ROOT, 'kao2-duzeltme', 'FIX-STATE.json');
const AUDIT_STATUSES = ['pass', 'fail', 'findings'];
const SHADOW_BLOCK_FORBIDDEN = /\bsave\(|SeymaSave|kaoSave\(|\.data\(\)|localStorage|sessionStorage|indexedDB|SeySync|\bfetch\(|sendBeacon/;
const FORBIDDEN_IN_REGISTRY = ['localStorage', 'XMLHttpRequest', 'SeySync', 'ghToken', 'openaiKey', 'sessionStorage', 'indexedDB'];

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function git(args) { try { return execSync(`git -c core.fsmonitor=false ${args}`, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } }
function globToRe(g) {
  const esc = g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*');
  return new RegExp('^' + esc + '$');
}
function inScope(file, globs) { return globs.some(g => globToRe(g).test(file)); }
function promptIndex(state, id) { return state.promptOrder.indexOf(id); }

export function cardSummary(state, id) {
  const card = state.cards[id];
  if (!card) return null;
  const dependencyStatuses = (card.deps || []).map(depId => ({
    id: depId,
    status: state.cards[depId] ? state.cards[depId].status : 'missing',
    done: Boolean(state.cards[depId] && state.cards[depId].status === 'done'),
  }));
  const gateStatus = {
    required: Boolean(card.gate),
    name: card.gate || null,
    approved: !card.gate || Boolean(card.gateApproval && card.gateApproval.by && card.gateApproval.at),
  };
  return {
    id,
    ...card,
    dependencyStatuses,
    gateStatus,
    startable: dependencyStatuses.every(dep => dep.done) && gateStatus.approved,
    commonChecks: state.commonChecks,
    position: promptIndex(state, id) + 1,
    of: state.promptOrder.length,
  };
}

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
  // chore(kao) kapsamı: durum/kanıt dosyaları + FIX programının belge ve yardımcı betik alanı
  // (duzeltme/**) + KAO araçları (tools/**). 2026-09-27: `duzeltme/araclar/kao-*.sh` eklenince
  // eski liste (yalnız kök state + .anti-amnesia + evidence) yetersiz kaldı (46a2f8f FAIL).
  // KAO-ARSIV: klasör docs/ altına taşındı; eski önekler geçmiş commit'ler için kalır.
  const CHORE_SCOPE = ['', 'docs/'].flatMap(p => [`${p}kuran-ogreniyorum/KAO-STATE.json`, `${p}kuran-ogreniyorum/.anti-amnesia/**`, `${p}kuran-ogreniyorum/evidence/**`, `${p}kuran-ogreniyorum/duzeltme/**`, `${p}kuran-ogreniyorum/tools/**`]);
  for (const cm of ctx.commits || []) {
    if (cm.beforePlanBase) continue; // tarihsel: plan-check tabanından önce (K2F-01)
    if (/^chore\(kao\)/.test(cm.subject)) { for (const f of cm.files) if (!inScope(f, CHORE_SCOPE)) fail(`commit ${cm.hash.slice(0, 7)} chore(kao) kapsam dışı dosya: ${f}`); continue; }
    const m = cm.subject.match(/^(KAO-(?:P00|D\d|\d+b?))\b/); if (!m) continue;
    const id = m[1];
    const scope = cards[id] ? cards[id].files : (id === 'KAO-P00' ? (state.bootstrap && state.bootstrap.files) : (state.auditScope && state.auditScope.files));
    if (!scope) { fail(`commit ${cm.hash.slice(0, 7)} tanımsız karta atıf: ${id}`); continue; }
    for (const f of cm.files) if (!inScope(f, scope)) fail(`commit ${cm.hash.slice(0, 7)} (${id}) kapsam dışı dosya: ${f}; izinli kapsam: ${scope.join(', ')}`);
  }
  // 7 · KAO dosya kümesi → commit öneki (O-11); konu önekinden bağımsız her commit taranır
  if (ctx.planBaseMissing) fail(`plan-check tabanı ${ctx.planBase} bulunamadı (FIX-STATE.json.planCheckBase ya da --since): tarihsel commitler ayrılamıyor`);
  if (ctx.baseMissing) warn(`taban commit ${FIX_BASE} bulunamadı: KAO dosyası commit'leri taban öncesi sayıldı (yalnız WARN)`);
  for (const cm of ctx.commits || []) {
    if (cm.beforePlanBase) continue;
    const touched = cm.files.filter(f => inScope(f, KAO_FILE_SCOPE));
    if (!touched.length || subjectRecognized(cm)) continue;
    const msg = `commit ${cm.hash.slice(0, 7)} KAO dosyasına tanınmayan önekle dokunuyor ("${cm.subject.slice(0, 60)}"): ${touched.join(', ')}`;
    if (cm.afterBase) fail(msg); else warn(`taban öncesi ${msg}`);
  }
  // 8 · dalga denetim durumları: findings gerekçesiz kalamaz (eski STATE yalnız okunur, V8)
  const accepted = state.auditFindingsAccepted || {};
  for (const [id, st] of Object.entries(state.auditStatus || {})) {
    if (!AUDIT_STATUSES.includes(st)) fail(`${id}: geçersiz auditStatus ${st} (${AUDIT_STATUSES.join('|')})`);
    else if (st === 'findings' && !String(accepted[id] || '').trim()) warn(`${id}: auditStatus findings ama auditFindingsAccepted[${id}] gerekçesi yok`);
  }
  // 9 · kaynak yasakları ve yükleme listeleri
  for (const f of KAO_SOURCE_FILES) {
    const src = ctx.readSource ? ctx.readSource(f) : null; if (src == null) continue;
    for (const p of FORBIDDEN_ANYWHERE) if (src.includes(p)) fail(`${f}: yasak ifade ${p}`);
    if (f.endsWith('quranLearn.js')) {
      for (const p of FORBIDDEN_IN_REGISTRY) if (src.includes(p)) fail(`${f}: registry'de yasak ${p}`);
      for (const mm of src.matchAll(/fetch\(\s*([^)]*)\)/g)) if (!/assets\/kao\//.test(mm[1])) fail(`${f}: fetch yalnız assets/kao/ olabilir → ${mm[1].slice(0, 60)}`);
      if (/MediaRecorder/.test(src)) {
        // 05 §4 / 10 §9: gölgeleme kaydı yalnız bellekte; kayıt bloğu (kaoShadowCleanup…kaoShadowVerdict öncesi) depo/senkron/ağa dokunamaz.
        const from = src.indexOf('function kaoShadowCleanup'), to = src.indexOf('function kaoShadowVerdict');
        if (from < 0 || to <= from) fail(`${f}: MediaRecorder var ama kayıt bloğu sınırları (kaoShadowCleanup…kaoShadowVerdict) bulunamadı`);
        else {
          const hit = src.slice(from, to).match(SHADOW_BLOCK_FORBIDDEN);
          if (hit) fail(`${f}: gölgeleme kayıt bloğunda kalıcı/ağ yolu ${hit[0]} (05 §4)`);
        }
      }
    } else if (/verified\s*:\s*false|"verified"\s*:\s*false/.test(src)) fail(`${f}: verified:false kayıt üretim paketinde`);
    const base = path.basename(f);
    for (const L of LOAD_LISTS) { const t = ctx.readSource(L); if (t != null && !t.includes(base)) fail(`${base} ${L} yükleme listesinde yok (MON-25 dört liste kuralı)`); }
  }
  return { fails, warns };
}

// Kart başına commit sayısı (--commits; yalnız bilgi). Konu önekinden kart kimliği; tanınmayanlar sayılmaz.
export function commitCounts(commits) {
  const counts = {};
  for (const cm of commits || []) { const m = cm.subject.match(CARD_OF_SUBJECT_RE); if (m) counts[m[1]] = (counts[m[1]] || 0) + 1; }
  return counts;
}

// Plan-check tabanı: `--since <hash>` önce, yoksa FIX-STATE.json.planCheckBase; ikisi de yoksa null (eski davranış).
export function resolvePlanBase(args, fixState) {
  const i = (args || []).indexOf('--since');
  const cli = i >= 0 ? args[i + 1] : null;
  if (cli && !cli.startsWith('--')) return cli;
  return (fixState && typeof fixState.planCheckBase === 'string' && fixState.planCheckBase) || null;
}

function realCtx(planBase) {
  const readSource = (rel) => { const p = path.join(ROOT, rel); return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null; };
  const baseMissing = !git(`rev-parse --verify --quiet ${FIX_BASE}^{commit}`);
  const afterBase = new Set(baseMissing ? [] : git(`rev-list ${FIX_BASE}..HEAD`).split('\n').filter(Boolean));
  // Taban verilmişse ama çözülemiyorsa sessizce tümünü denetleme/atlama: hata olarak yüzeye çıkar.
  const planBaseMissing = Boolean(planBase) && !git(`rev-parse --verify --quiet ${planBase}^{commit}`);
  const afterPlanBase = planBase && !planBaseMissing ? new Set(git(`rev-list ${planBase}..HEAD`).split('\n').filter(Boolean)) : null;
  const commits = git('log --format=%H%x1f%s -n 400').split('\n').filter(Boolean).map(l => { const [hash, subject] = l.split('\x1f'); return { hash, subject, afterBase: afterBase.has(hash), beforePlanBase: afterPlanBase ? !afterPlanBase.has(hash) : false, files: git(`show --pretty=format: --name-only ${hash}`).split('\n').filter(Boolean) }; });
  return { baseMissing, planBase: planBase || null, planBaseMissing,
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

const IS_MAIN = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
const args = process.argv.slice(2);
if (!IS_MAIN) { /* import edildi (test/simülasyon): CLI çalışmaz */ }
else if (args.includes('--self-test')) {
  const { runSelfTests } = await import('./kao-plan-check.test.mjs');
  process.exitCode = runSelfTests({ check, cardSummary, commitCounts, resolvePlanBase }, readJson(STATE_PATH)) ? 0 : 1;
}
else {
  const state = readJson(STATE_PATH);
  if (args.includes('--card')) {
    const id = args[args.indexOf('--card') + 1]; const summary = cardSummary(state, id);
    if (!summary) { console.error('kart yok: ' + id); process.exit(1); }
    console.log(JSON.stringify(summary, null, 2));
    process.exit(0);
  }
  const fixState = fs.existsSync(FIX_STATE_PATH) ? readJson(FIX_STATE_PATH) : null;
  const ctx = realCtx(resolvePlanBase(args, fixState));
  const { fails, warns } = check(state, ctx);
  if (ctx.planBase && !ctx.planBaseMissing) console.log(`INFO plan-check tabanı ${ctx.planBase.slice(0, 7)}: ${ctx.commits.filter(c => c.beforePlanBase).length} tarihsel commit taranmadı, ${ctx.commits.filter(c => !c.beforePlanBase).length} commit denetlendi`);
  if (args.includes('--commits')) for (const [id, n] of Object.entries(commitCounts(ctx.commits)).sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))) console.log(`commits ${id}: ${n}`);
  for (const w of warns) console.log('WARN ' + w);
  for (const f of fails) console.log('FAIL ' + f);
  if (args.includes('--render')) { render(state); console.log('rendered .anti-amnesia/CURRENT-STATE.md'); }
  console.log(fails.length ? `kao-plan-check: FAIL (${fails.length})` : `kao-plan-check: PASS (${warns.length} warn)`);
  process.exit(fails.length ? 1 : 0);
}
