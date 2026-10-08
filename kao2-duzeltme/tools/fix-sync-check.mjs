#!/usr/bin/env node
// KAO2-FIX senkron denetimi — FIX-STATE.json · .anti-amnesia/CURRENT-STATE.md · .anti-amnesia/LEDGER.md
// · PROMPTLAR.md · gerçek kod pinleri aynı gerçeği mi söylüyor? Salt okur; ağ yok.
//   node kao2-duzeltme/tools/fix-sync-check.mjs            → temel denetim
//   node kao2-duzeltme/tools/fix-sync-check.mjs --repro    → + tekrar-uret.cjs sonuçları STATE.repro ile aynı mı
//   node kao2-duzeltme/tools/fix-sync-check.mjs --clean    → + git çalışma ağacı temiz mi (prompt başı P1)
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const PLAN_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = resolve(PLAN_DIR, '..');
const args = new Set(process.argv.slice(2));
const errors = [];
const fail = (message) => errors.push(message);
const read = (rel, base = PLAN_DIR) => {
  const full = join(base, rel);
  if (!existsSync(full)) { fail(`eksik dosya: ${rel}`); return ''; }
  return readFileSync(full, 'utf8');
};

const STATUSES = new Set(['pending', 'in_progress', 'done', 'blocked', 'waiting_user']);
const PROGRAM_STATUSES = new Set(['planned', 'active', 'completed']);

// 1 · STATE
let state = {};
try { state = JSON.parse(read('FIX-STATE.json')); } catch (error) { fail(`FIX-STATE.json okunamadı: ${error.message}`); }
for (const key of ['program', 'status', 'nextPrompt', 'ledgerLastSeq', 'prompts', 'pins', 'repro', 'decisions', 'releaseApproval']) {
  if (!(key in state)) fail(`FIX-STATE.json alanı yok: ${key}`);
}
if (state.status && !PROGRAM_STATUSES.has(state.status)) fail(`geçersiz program durumu: ${state.status}`);
const ids = Object.keys(state.prompts || {});
// Kapanmış program: kod pinleri kapanış commit'inde dondurulur; sonraki programların (D3F…) pin yükseltmesi bu kaydı bozmaz.
const readCode = (rel) => {
  if (!state.closeCommit) return read(rel, REPO);
  try { return execFileSync('git', ['show', `${state.closeCommit}:${rel}`], { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }); }
  catch (error) { fail(`${state.closeCommit}:${rel} okunamadı`); return ''; }
};

// 2 · PROMPTLAR.md başlık sırası = STATE sırası
const promptsMd = read('PROMPTLAR.md');
const headings = [...promptsMd.matchAll(/^#### (K2F-\d{2}) · /gm)].map((m) => m[1]);
if (headings.join(',') !== ids.join(',')) {
  fail(`PROMPTLAR.md başlıkları STATE.prompts ile aynı sırada değil (md ${headings.length}, state ${ids.length}; ilk fark: ${headings.find((h, i) => h !== ids[i]) || ids.find((h, i) => h !== headings[i]) || '?'})`);
}

// 3 · Prompt durumları ve nextPrompt tekliği
let inProgress = 0, firstOpen = null;
ids.forEach((id, index) => {
  const prompt = state.prompts[id] || {};
  if (!STATUSES.has(prompt.status)) fail(`${id}: geçersiz durum ${prompt.status}`);
  if (prompt.status === 'in_progress') inProgress += 1;
  if (prompt.status !== 'done' && firstOpen === null) firstOpen = id;
  if (prompt.status === 'done') {
    if (!prompt.evidence) fail(`${id}: done ama evidence alanı boş`);
    else if (!existsSync(join(REPO, prompt.evidence))) fail(`${id}: evidence dosyası yok: ${prompt.evidence}`);
    const earlierOpen = ids.slice(0, index).find((prev) => state.prompts[prev].status !== 'done');
    if (earlierOpen) fail(`${id} done ama önceki ${earlierOpen} done değil (sıra atlandı)`);
  }
});
if (inProgress > 1) fail(`aynı anda ${inProgress} prompt in_progress (en çok 1)`);
const expectedNext = firstOpen;
if (state.status === 'completed') {
  if (state.nextPrompt !== null) fail('program completed ama nextPrompt null değil');
  if (firstOpen) fail(`program completed ama ${firstOpen} done değil`);
} else if (state.nextPrompt !== expectedNext) {
  fail(`nextPrompt ${state.nextPrompt} ama ilk tamamlanmamış prompt ${expectedNext}`);
}

// 4 · CURRENT-STATE senkron bloğu
const current = read('.anti-amnesia/CURRENT-STATE.md');
const block = /<!-- k2f-sync\s*\nnextPrompt:\s*(\S+)\s*\nlastSeq:\s*(\d+)\s*\nstatus:\s*(\S+)\s*\n-->/.exec(current);
if (!block) fail('CURRENT-STATE.md içinde k2f-sync bloğu yok ya da biçimi bozuk');
else {
  const next = block[1] === 'none' ? null : block[1];
  if (next !== state.nextPrompt) fail(`CURRENT-STATE nextPrompt ${block[1]} ≠ STATE ${state.nextPrompt}`);
  if (Number(block[2]) !== state.ledgerLastSeq) fail(`CURRENT-STATE lastSeq ${block[2]} ≠ STATE ${state.ledgerLastSeq}`);
  if (block[3] !== state.status) fail(`CURRENT-STATE status ${block[3]} ≠ STATE ${state.status}`);
}

// 5 · LEDGER: kesintisiz seq, son seq = STATE, son kaydın next'i = nextPrompt
const ledger = read('.anti-amnesia/LEDGER.md');
const entries = [...ledger.matchAll(/^## seq (\d+) · (\d{4}-\d{2}-\d{2}) · ([A-Z]+) · (\S+)/gm)];
entries.forEach((m, i) => { if (Number(m[1]) !== i + 1) fail(`LEDGER seq kesintili: ${i + 1} bekleniyordu, ${m[1]} bulundu`); });
const lastSeq = entries.length ? Number(entries[entries.length - 1][1]) : 0;
if (lastSeq !== state.ledgerLastSeq) fail(`LEDGER son seq ${lastSeq} ≠ STATE.ledgerLastSeq ${state.ledgerLastSeq}`);
const tail = entries.length ? ledger.slice(entries[entries.length - 1].index) : '';
const nextLine = /^- next:\s*(\S+)/m.exec(tail);
if (!nextLine) fail('LEDGER son kaydında "- next:" satırı yok');
else if ((nextLine[1] === 'none' ? null : nextLine[1]) !== state.nextPrompt) fail(`LEDGER son next ${nextLine[1]} ≠ STATE ${state.nextPrompt}`);

// 6 · Kod pinleri gerçekle aynı mı (sayaç karmaşası olmasın)
const appJs = readCode('app.js');
const kaoHandlers = new Set([...appJs.matchAll(/App\.(kao[A-Za-z0-9]+) *= *function/g)].map((m) => m[1])).size;
const index = readCode('index.html');
const pin = (/app\/core\/quranLearn\.js\?v=(\w+)/.exec(index) || [])[1] || null;
if (state.pins && state.pins.kaoHandlers !== kaoHandlers) fail(`pins.kaoHandlers ${state.pins.kaoHandlers} ≠ app.js'teki ${kaoHandlers}`);
if (state.pins && state.pins.release !== pin) fail(`pins.release ${state.pins.release} ≠ index.html quranLearn.js pini ${pin}`);

// 7 · İsteğe bağlı: tekrar-uret sonuçları STATE ile aynı; PASS olan geri FAIL olamaz
if (args.has('--repro')) {
  let out = '';
  try { out = execFileSync(process.execPath, [join(PLAN_DIR, 'denetim/tekrar-uret.cjs')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (error) { out = String(error.stdout || ''); }
  const actual = Object.fromEntries([...out.matchAll(/^(PASS|FAIL)\s+(R-\d{2})/gm)].map((m) => [m[2], m[1].toLowerCase()]));
  for (const [id, recorded] of Object.entries(state.repro || {})) {
    if (!actual[id]) fail(`tekrar-uret çıktısında ${id} yok`);
    else if (actual[id] !== recorded) fail(`${id}: STATE ${recorded}, gerçek ${actual[id]}${recorded === 'pass' ? ' (GERİLEME)' : ' (STATE güncellenmemiş)'}`);
  }
}

// 8 · İsteğe bağlı: temiz çalışma ağacı
if (args.has('--clean')) {
  try {
    const status = execFileSync('git', ['status', '--porcelain'], { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (status) fail(`çalışma ağacı temiz değil:\n${status}`);
  } catch (error) { fail(`git status çalışmadı: ${error.message}`); }
}

const done = ids.filter((id) => state.prompts[id].status === 'done').length;
if (errors.length) {
  console.error(`KAO2-FIX senkron: FAIL (${errors.length})`);
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log(`KAO2-FIX senkron: PASS · ${done}/${ids.length} prompt done · nextPrompt ${state.nextPrompt ?? 'none'} · ledger seq ${state.ledgerLastSeq} · App.kao* ${kaoHandlers} · pin ${pin}${state.closeCommit ? ` (dondurulmuş: ${state.closeCommit.slice(0, 8)})` : ''}`);
