#!/usr/bin/env node
// KAO2-FIX denetim-2 senkron denetimi — D2F-STATE.json · CURRENT-STATE.md · LEDGER.md · gerçek kod pinleri
// aynı gerçeği mi söylüyor? Salt okur; ağ yok, dosya yazımı yok.
//   node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs            → temel denetim
//   node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs --clean    → + git çalışma ağacı temiz mi (prompt başı)
//   node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs --repro    → + tekrar-uret-2.cjs: STATE'te "pass" olan her N gerçekten PASS
//   node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs --strict   → + süreç kapıları (a–f): tek commit, önek, yayın, KANIT, onay, bayat durum
//   node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs --audit-k2f → KAO2-FIX dönemine aynı kuralları yalnız RAPOR olarak uygular (çıkış kodu etkilenmez)
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
// Kapanmış program: kod kapanış commit'inden okunur; sonraki programların (D3F…) pin yükseltmesi bu kaydı bozmaz.
const readCode = (rel) => {
  if (!state.closeCommit) return read(rel, REPO);
  try { return execFileSync('git', ['show', `${state.closeCommit}:${rel}`], { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }); }
  catch (error) { fail(`${state.closeCommit}:${rel} okunamadı`); return ''; }
};
const appJs = readCode('app.js');
const measured = {
  // fix-sync-check.mjs ile aynı kalıp
  kaoHandlers: new Set([...appJs.matchAll(/App\.(kao[A-Za-z0-9]+) *= *function/g)].map((m) => m[1])).size,
  // tests/app/test_app_surface_daily_boundary.js ile aynı kalıplar
  appSurface: new Set((appJs.match(/App\.[A-Za-z0-9_]+\s*=[^=]/g) || []).map((v) => v.match(/App\.[A-Za-z0-9_]+/)[0])).size,
  appAssignments: [...appJs.matchAll(/App\.([A-Za-z0-9_$]+)\s*=\s*(?:function|async\s+function)/g)].length,
};
// tests/app/test_fx2_touch_coverage.js combinedSource'u ile aynı dosya kümesi
{
  const src = (rel) => readCode(rel);
  const ql = src('app/core/quranLearn.js');
  const qlHub = ql.slice(ql.indexOf('function kaoHubCardHTML'), ql.indexOf('function kaoOverlayHTML'));
  const combined = appJs + ['motivation', 'crisis', 'journal', 'health', 'library', 'report', 'map', 'profile', 'settings'].map((n) => src(`app/core/${n}.js`)).join('')
    + qlHub + src('app/core/messaging.js') + src('app/core/render.js') + src('app/core/reminders.js') + src('app/core/reminderSurface.js') + src('app/core/appSurface.js');
  measured.onclick = (combined.match(/onclick=/g) || []).length;
}
const indexHtml = readCode('index.html');
measured.release = (/app\/core\/quranLearn\.js\?v=(\w+)/.exec(indexHtml) || [])[1] || null;
const swVersion = (/SW_VERSION\s*=\s*'(\w+)'/.exec(readCode('sw.js')) || [])[1] || null;
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

// 8 · İsteğe bağlı: süreç kapıları (--strict) — yalnız baseCommit'ten sonraki D2F commit'leri
const KANIT_SECTIONS = ['İlerleme günlüğü', 'Yapılan', 'TDD', 'Kapılar', 'Ölçümler', 'Bilerek değişen testler', 'Kanıt düzeyleri', 'Sürprizler'];
const GATES_CLOSED = ['D2F-12', 'D2F-15', 'D2F-16'];
const GATES_WAITING = ['D2F-11', 'D2F-14'];
const RELEASE_PROMPT = 'D2F-15';
const K2F_BASE = '07802fa6';
const K2F_PLANNED_RELEASES = new Set(['K2F-18', 'K2F-43']);
const PIN_PICKAXE = '\\?v=|SW_VERSION';
// belge ve kayıt dosyaları pin sayılmaz: yalnız kod/test/kabuk dosyalarındaki ?v= ve SW_VERSION değişimi
const PIN_PATHSPEC = [':(exclude)kao2-duzeltme', ':(exclude)docs', ':(exclude)*.md'];
const git = (argv) => execFileSync('git', argv, { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
const commitsIn = (range) => git(['log', '--format=%H%x09%s', range]).split('\n').filter(Boolean)
  .map((line) => ({ hash: line.slice(0, line.indexOf('\t')), subject: line.slice(line.indexOf('\t') + 1) }));
const pinHashesIn = (range) => new Set(git(['log', `-G${PIN_PICKAXE}`, '--format=%H', range, '--', '.', ...PIN_PATHSPEC]).split('\n').filter(Boolean));
const isDirty = () => git(['status', '--porcelain']).trim() !== '';

if (args.has('--strict')) {
  const exceptions = Array.isArray(state.strictExceptions) ? state.strictExceptions : [];
  const exempt = new Set();
  for (const ex of exceptions) {
    if (!ex || !/^[a-f]$/.test(ex.rule) || !ex.ref || !ex.reason) fail(`strictExceptions kaydı geçersiz (rule/ref/reason zorunlu): ${JSON.stringify(ex)}`);
    else exempt.add(`${ex.rule}:${ex.ref}`);
  }
  const used = new Set();
  const violate = (rule, ref, message) => {
    const hit = [...exempt].find((key) => { const [r, f] = [key.slice(0, 1), key.slice(2)]; return r === rule && (ref === f || (f.length >= 7 && ref.startsWith(f))); });
    if (hit) { used.add(hit); return; }
    fail(`[strict-${rule}] ${ref}: ${message}`);
  };
  // kapanmış programın aralığı kapanış commit'inde biter; sonraki programların commit'leri ve çalışma ağacı bu kapıya girmez
  const range = `${state.baseCommit}..${state.closeCommit || 'HEAD'}`;
  const commits = commitsIn(range);
  const pending = state.closeCommit ? false : isDirty();
  const lastDone = [...ids].reverse().find((id) => state.prompts[id].status === 'done') || null;
  const byPrompt = {};
  // (b) önek
  for (const c of commits) {
    const m = /^(D2F-\d{2}):/.exec(c.subject);
    if (!m) violate('b', c.hash.slice(0, 8), `öneksiz commit: "${c.subject.slice(0, 60)}"`);
    else if (!EXPECTED_IDS.includes(m[1])) violate('b', c.hash.slice(0, 8), `bilinmeyen önek ${m[1]}`);
    else (byPrompt[m[1]] ||= []).push(c);
  }
  // (a) bitmiş her prompt için tam bir commit (en son bitmiş prompt, çalışma ağacı kirliyken henüz commit'lenmemiş olabilir)
  for (const id of ids.filter((x) => state.prompts[x].status === 'done')) {
    const count = (byPrompt[id] || []).length;
    if (count === 1) continue;
    if (count === 0 && id === lastDone && pending) continue;
    violate('a', id, `${count} commit (tam 1 olmalı)`);
  }
  // (c) yayın: ?v= / SW_VERSION yalnız D2F-15'te ve YAYIN.md ile
  const pinHashes = pinHashesIn(range);
  const hasReleaseNote = existsSync(join(PLAN_DIR, 'evidence', RELEASE_PROMPT, 'YAYIN.md'));
  for (const c of commits.filter((x) => pinHashes.has(x.hash))) {
    if (!c.subject.startsWith(`${RELEASE_PROMPT}:`)) violate('c', c.hash.slice(0, 8), `pin değiştiren commit ${RELEASE_PROMPT} değil: "${c.subject.slice(0, 60)}"`);
    else if (!hasReleaseNote) violate('c', c.hash.slice(0, 8), `evidence/${RELEASE_PROMPT}/YAYIN.md yok`);
  }
  if (pending && git(['diff', 'HEAD', `-G${PIN_PICKAXE}`, '--name-only', '--', '.', ...PIN_PATHSPEC]).trim() && lastDone !== RELEASE_PROMPT && state.nextPrompt !== RELEASE_PROMPT) {
    violate('c', 'çalışma-ağacı', `commit'lenmemiş ?v=/SW_VERSION değişimi var, yayın promptu ${RELEASE_PROMPT} değil`);
  }
  // (d) KANIT: 8 bölüm + Oturum satırı, oturum adresi tekil
  const sessionOwner = new Map();
  for (const id of ids.filter((x) => state.prompts[x].status === 'done')) {
    const rel = state.prompts[id].evidence;
    if (!rel || !existsSync(join(REPO, rel))) continue; // eksik dosya bölüm 2'de zaten FAIL
    const text = readFileSync(join(REPO, rel), 'utf8');
    const missing = KANIT_SECTIONS.filter((name) => !new RegExp(`^## ${name}(?=\\s|$)`, 'm').test(text));
    if (missing.length) violate('d', id, `KANIT bölümü eksik: ${missing.join(', ')}`);
    const session = (/^Oturum:\s*(\S+)/m.exec(text) || [])[1];
    if (!session) { violate('d', id, 'KANIT\'ta "Oturum:" satırı yok'); continue; }
    if (state.prompts[id].session && state.prompts[id].session !== session) violate('d', id, `STATE.session ≠ KANIT Oturum (${session})`);
    if (sessionOwner.has(session)) violate('d', id, `oturum adresi ${sessionOwner.get(session)} ile paylaşılıyor`);
    else sessionOwner.set(session, id);
  }
  // (e) onay kapıları: LEDGER'da GATE kaydı
  const gateEntries = [...ledger.matchAll(/^## seq \d+ · \d{4}-\d{2}-\d{2} · GATE · (D2F-\d{2})\s*$([\s\S]*?)(?=^## seq |(?![\s\S]))/gm)];
  const gateStatus = (id, wanted) => gateEntries.some((g) => g[1] === id && new RegExp(`^- status:\\s*${wanted}\\b`, 'm').test(g[2]));
  for (const id of GATES_CLOSED) if (state.prompts[id]?.status === 'done' && !gateStatus(id, 'closed')) violate('e', id, 'LEDGER\'da GATE status: closed kaydı yok');
  for (const id of GATES_WAITING) if (state.prompts[id]?.status === 'done' && !gateStatus(id, 'waiting')) violate('e', id, 'LEDGER\'da GATE status: waiting kaydı yok');
  // (f) CURRENT-STATE "Canlı gerçekler" tarihi son LEDGER kaydından eski olamaz
  const liveDate = (/^## Canlı gerçekler[^\n]*?(\d{4}-\d{2}-\d{2})/m.exec(current) || [])[1];
  const lastDate = entries.length ? entries[entries.length - 1][2] : null;
  if (!liveDate) violate('f', 'CURRENT-STATE', '"Canlı gerçekler" başlığında tarih yok');
  else if (lastDate && liveDate < lastDate) violate('f', 'CURRENT-STATE', `"Canlı gerçekler" ${liveDate}, son prompt kaydı ${lastDate}`);
  for (const key of exempt) if (!used.has(key)) console.log(`  not: strictExceptions "${key}" artık kullanılmıyor`);
  console.log(`D2F strict: ${commits.length} commit incelendi (${range.slice(0, 8)}…${(state.closeCommit || 'HEAD').slice(0, 8)}) · ${used.size}/${exempt.size} kayıtlı istisna kullanıldı`);
}

// 9 · İsteğe bağlı: KAO2-FIX dönemi denetimi — yalnız rapor
if (args.has('--audit-k2f')) {
  const era = commitsIn(`${K2F_BASE}..${state.baseCommit}`).filter((c) => !c.subject.startsWith('KAO2-FIX denetim-2'));
  const per = {};
  let unprefixed = 0;
  for (const c of era) {
    const m = /^(K2F-\d{2})\b/.exec(c.subject);
    if (m) (per[m[1]] ||= []).push(c); else unprefixed += 1;
  }
  const pinSet = pinHashesIn(`${K2F_BASE}..${state.baseCommit}`);
  const eraPins = era.filter((c) => pinSet.has(c.hash));
  const offPlan = eraPins.filter((c) => { const m = /^(K2F-\d{2})\b/.exec(c.subject); return m && !K2F_PLANNED_RELEASES.has(m[1]); });
  const kanits = Object.keys(per).map((id) => join(REPO, 'kao2-duzeltme', 'evidence', id, 'KANIT.md')).filter(existsSync).map((f) => readFileSync(f, 'utf8'));
  const noSession = kanits.filter((t) => !/^Oturum:\s*\S+/m.test(t)).length;
  const sectionGaps = kanits.filter((t) => KANIT_SECTIONS.some((name) => !new RegExp(`^## ${name}(?=\\s|$)`, 'm').test(t))).length;
  const promptCount = Object.keys(per).length;
  const multi = Object.values(per).filter((list) => list.length > 1).length;
  console.log(`K2F denetimi (yalnız rapor, çıkış kodunu etkilemez) ${K2F_BASE}..${state.baseCommit.slice(0, 8)}`);
  console.log(`  (a) ${era.length} commit · ${promptCount} prompt · ${promptCount - multi} tek commit'li · ${multi} çok commit'li prompt`);
  console.log(`  (b) ${unprefixed} öneksiz commit`);
  console.log(`  (c) ${eraPins.length} pin değiştiren commit · ${offPlan.length} plan dışı pin (planlı: ${[...K2F_PLANNED_RELEASES].join(', ')}; öneksiz pin commit'leri b'de)`);
  console.log(`  (d) ${kanits.length} KANIT · ${noSession} tanesinde "Oturum:" satırı yok · ${sectionGaps} tanesinde 8 bölümden eksik var`);
  console.log('  (e)(f) K2F LEDGER/CURRENT-STATE biçimi farklı: bu araçta uygulanmaz');
}

const done = ids.filter((id) => state.prompts[id].status === 'done').length;
const nPass = nIds.filter((id) => state.n[id] === 'pass').length;
if (errors.length) {
  console.error(`D2F senkron: FAIL (${errors.length})`);
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log(`D2F senkron: PASS · ${done}/${ids.length} prompt done · nextPrompt ${state.nextPrompt ?? 'none'} · ledger seq ${state.ledgerLastSeq} · N ${nPass}/${nIds.length} pass · App.kao* ${measured.kaoHandlers} · yüzey ${measured.appSurface} · atama ${measured.appAssignments} · onclick ${measured.onclick} · pin ${measured.release}`);
