#!/usr/bin/env node
// KAO2-FIX denetim-2 senkron denetimi — D2F-STATE.json · CURRENT-STATE.md · LEDGER.md · gerçek kod pinleri
// aynı gerçeği mi söylüyor? Salt okur; ağ yok, dosya yazımı yok.
//   node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs            → temel denetim
//   node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs --clean    → + git çalışma ağacı temiz mi (prompt başı)
//   node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs --repro    → + tekrar-uret-2.cjs: STATE'te "pass" olan her N gerçekten PASS
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const PLAN_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = resolve(PLAN_DIR, '../..');
const args = new Set(process.argv.slice(2));
const errors = [];
const fail = (message) => errors.push(message);
const read = (rel, base = PLAN_DIR) => {
  const full = join(base, rel);
  if (!existsSync(full)) { fail(`eksik dosya: ${rel}`); return ''; }
  return readFileSync(full, 'utf8');
};

const STATUSES = new Set(['pending', 'in_progress', 'done', 'blocked', 'waiting_user']);
const PROGRAM_STATUSES = new Set(['active', 'completed']);
const N_STATUSES = new Set(['fail', 'pass']);
const EXPECTED_IDS = Array.from({ length: 16 }, (_, i) => `D2F-${String(i + 1).padStart(2, '0')}`);
const EXPECTED_N = Array.from({ length: 9 }, (_, i) => `N-${String(i + 1).padStart(2, '0')}`);

// 1 · STATE yapısı
let state = {};
try { state = JSON.parse(read('D2F-STATE.json')); } catch (error) { fail(`D2F-STATE.json okunamadı: ${error.message}`); }
for (const key of ['program', 'status', 'baseCommit', 'nextPrompt', 'ledgerLastSeq', 'prompts', 'n', 'pins', 'userGates']) {
  if (!(key in state)) fail(`D2F-STATE.json alanı yok: ${key}`);
}
if (state.program !== 'KAO2-FIX denetim-2') fail(`program adı beklenmedik: ${state.program}`);
if (state.status && !PROGRAM_STATUSES.has(state.status)) fail(`geçersiz program durumu: ${state.status}`);
if (state.baseCommit) {
  try { execFileSync('git', ['cat-file', '-e', `${state.baseCommit}^{commit}`], { cwd: REPO, stdio: 'ignore' }); }
  catch (_) { fail(`baseCommit git'te yok: ${state.baseCommit}`); }
}
const ids = Object.keys(state.prompts || {});
if (ids.join(',') !== EXPECTED_IDS.join(',')) fail(`prompts D2F-01…D2F-16 sırasında değil: ${ids.join(',')}`);
const nIds = Object.keys(state.n || {});
if (nIds.join(',') !== EXPECTED_N.join(',')) fail(`n N-01…N-09 sırasında değil: ${nIds.join(',')}`);
for (const id of nIds) if (!N_STATUSES.has(state.n[id])) fail(`${id}: geçersiz durum ${state.n[id]}`);
for (const gate of state.userGates || []) if (!ids.includes(gate)) fail(`userGates bilinmeyen prompt: ${gate}`);

// 2 · Prompt durumları ve nextPrompt tekliği
let inProgress = 0, firstOpen = null;
ids.forEach((id, index) => {
  const prompt = state.prompts[id] || {};
  if (!prompt.title) fail(`${id}: başlık yok`);
  if (!STATUSES.has(prompt.status)) fail(`${id}: geçersiz durum ${prompt.status}`);
  if (prompt.status === 'in_progress') inProgress += 1;
  if (prompt.status !== 'done' && firstOpen === null) firstOpen = id;
  if (prompt.status === 'done') {
    if (!prompt.evidence) fail(`${id}: done ama evidence alanı boş`);
    else if (!existsSync(join(REPO, prompt.evidence))) fail(`${id}: evidence dosyası yok: ${prompt.evidence}`);
    else if (!/^Oturum: \S+/m.test(readFileSync(join(REPO, prompt.evidence), 'utf8'))) fail(`${id}: KANIT'ta "Oturum:" satırı yok`);
    if (!prompt.session) fail(`${id}: done ama session alanı boş`);
    const earlierOpen = ids.slice(0, index).find((prev) => state.prompts[prev].status !== 'done');
    if (earlierOpen) fail(`${id} done ama önceki ${earlierOpen} done değil (sıra atlandı)`);
  }
});
if (inProgress > 1) fail(`aynı anda ${inProgress} prompt in_progress (en çok 1)`);
if (state.status === 'completed') {
  if (state.nextPrompt !== null) fail('program completed ama nextPrompt null değil');
  if (firstOpen) fail(`program completed ama ${firstOpen} done değil`);
} else if (state.nextPrompt !== firstOpen) {
  fail(`nextPrompt ${state.nextPrompt} ama ilk tamamlanmamış prompt ${firstOpen}`);
}

// 3 · CURRENT-STATE senkron bloğu
const current = read('CURRENT-STATE.md');
const block = /<!-- d2f-sync\s*\nnextPrompt:\s*(\S+)\s*\nlastSeq:\s*(\d+)\s*\nstatus:\s*(\S+)\s*\n-->/.exec(current);
if (!block) fail('CURRENT-STATE.md içinde d2f-sync bloğu yok ya da biçimi bozuk');
else {
  const next = block[1] === 'none' ? null : block[1];
  if (next !== state.nextPrompt) fail(`CURRENT-STATE nextPrompt ${block[1]} ≠ STATE ${state.nextPrompt}`);
  if (Number(block[2]) !== state.ledgerLastSeq) fail(`CURRENT-STATE lastSeq ${block[2]} ≠ STATE ${state.ledgerLastSeq}`);
  if (block[3] !== state.status) fail(`CURRENT-STATE status ${block[3]} ≠ STATE ${state.status}`);
}

// 4 · LEDGER: kesintisiz seq, son seq = STATE, son kaydın next'i = nextPrompt
const ledger = read('LEDGER.md');
const entries = [...ledger.matchAll(/^## seq (\d+) · (\d{4}-\d{2}-\d{2}) · (PROMPT|GATE|NOTE|BLOCKED) · (D2F-\d{2})\s*$/gm)];
const rawHeads = (ledger.match(/^## seq /gm) || []).length;
if (rawHeads !== entries.length) fail(`LEDGER'da biçimi bozuk ${rawHeads - entries.length} kayıt başlığı var`);
entries.forEach((m, i) => {
  if (Number(m[1]) !== i + 1) fail(`LEDGER seq kesintili: ${i + 1} bekleniyordu, ${m[1]} bulundu`);
  if (!EXPECTED_IDS.includes(m[4])) fail(`LEDGER seq ${m[1]}: bilinmeyen prompt ${m[4]}`);
});
const lastSeq = entries.length ? Number(entries[entries.length - 1][1]) : 0;
if (lastSeq !== state.ledgerLastSeq) fail(`LEDGER son seq ${lastSeq} ≠ STATE.ledgerLastSeq ${state.ledgerLastSeq}`);
const tail = entries.length ? ledger.slice(entries[entries.length - 1].index) : '';
const nextLine = /^- next:\s*(\S+)/m.exec(tail);
if (!nextLine) fail('LEDGER son kaydında "- next:" satırı yok');
else if ((nextLine[1] === 'none' ? null : nextLine[1]) !== state.nextPrompt) fail(`LEDGER son next ${nextLine[1]} ≠ STATE ${state.nextPrompt}`);

// 5 · Kod pinleri gerçekle aynı mı (sayım kalıpları pin testleriyle aynı)
const appJs = read('app.js', REPO);
const measured = {
  // fix-sync-check.mjs ile aynı kalıp
  kaoHandlers: new Set([...appJs.matchAll(/App\.(kao[A-Za-z0-9]+) *= *function/g)].map((m) => m[1])).size,
  // tests/app/test_app_surface_daily_boundary.js ile aynı kalıplar
  appSurface: new Set((appJs.match(/App\.[A-Za-z0-9_]+\s*=[^=]/g) || []).map((v) => v.match(/App\.[A-Za-z0-9_]+/)[0])).size,
  appAssignments: [...appJs.matchAll(/App\.([A-Za-z0-9_$]+)\s*=\s*(?:function|async\s+function)/g)].length,
};
// tests/app/test_fx2_touch_coverage.js combinedSource'u ile aynı dosya kümesi
{
  const src = (rel) => read(rel, REPO);
  const ql = src('app/core/quranLearn.js');
  const qlHub = ql.slice(ql.indexOf('function kaoHubCardHTML'), ql.indexOf('function kaoOverlayHTML'));
  const combined = appJs + ['motivation', 'crisis', 'journal', 'health', 'library', 'report', 'map', 'profile', 'settings'].map((n) => src(`app/core/${n}.js`)).join('')
    + qlHub + src('app/core/messaging.js') + src('app/core/render.js') + src('app/core/reminders.js') + src('app/core/reminderSurface.js') + src('app/core/appSurface.js');
  measured.onclick = (combined.match(/onclick=/g) || []).length;
}
const indexHtml = read('index.html', REPO);
measured.release = (/app\/core\/quranLearn\.js\?v=(\w+)/.exec(indexHtml) || [])[1] || null;
const swVersion = (/SW_VERSION\s*=\s*'(\w+)'/.exec(read('sw.js', REPO)) || [])[1] || null;
if (swVersion !== measured.release) fail(`sw.js SW_VERSION ${swVersion} ≠ index.html quranLearn.js pini ${measured.release}`);
for (const [key, value] of Object.entries(measured)) {
  if (!state.pins || !(key in state.pins)) fail(`pins.${key} STATE'te yok (ölçülen ${value})`);
  else if (state.pins[key] !== value) fail(`pins.${key} ${state.pins[key]} ≠ ölçülen ${value}`);
}

// 6 · İsteğe bağlı: tekrar-uret-2 — STATE'te pass olan geri FAIL olamaz
if (args.has('--repro')) {
  let out = '';
  try { out = execFileSync(process.execPath, [join(PLAN_DIR, 'tekrar-uret-2.cjs')], { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (error) { out = String(error.stdout || ''); }
  const actual = Object.fromEntries([...out.matchAll(/^(PASS|FAIL)\s+(N-\d{2})/gm)].map((m) => [m[2], m[1].toLowerCase()]));
  for (const [id, recorded] of Object.entries(state.n || {})) {
    if (!actual[id]) fail(`tekrar-uret-2 çıktısında ${id} yok`);
    else if (recorded === 'pass' && actual[id] !== 'pass') fail(`${id}: STATE pass, gerçek ${actual[id]} (GERİLEME)`);
    else if (recorded === 'fail' && actual[id] === 'pass') fail(`${id}: gerçek pass ama STATE fail (STATE güncellenmemiş)`);
  }
}

// 7 · İsteğe bağlı: temiz çalışma ağacı
if (args.has('--clean')) {
  try {
    const status = execFileSync('git', ['status', '--porcelain'], { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (status) fail(`çalışma ağacı temiz değil:\n${status}`);
  } catch (error) { fail(`git status çalışmadı: ${error.message}`); }
}

const done = ids.filter((id) => state.prompts[id].status === 'done').length;
const nPass = nIds.filter((id) => state.n[id] === 'pass').length;
if (errors.length) {
  console.error(`D2F senkron: FAIL (${errors.length})`);
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log(`D2F senkron: PASS · ${done}/${ids.length} prompt done · nextPrompt ${state.nextPrompt ?? 'none'} · ledger seq ${state.ledgerLastSeq} · N ${nPass}/${nIds.length} pass · App.kao* ${measured.kaoHandlers} · yüzey ${measured.appSurface} · atama ${measured.appAssignments} · onclick ${measured.onclick} · pin ${measured.release}`);
