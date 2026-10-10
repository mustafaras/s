// K3P · hızlı kapı (her prompt'un kapanışında). Ağsız; uygulama verisine dokunmaz.
//   node kao3-premium/araclar/kapi-hizli.mjs --kart K3P-01 [--yavas]
// Sırasıyla: sözdizimi → tests/kao ailesi → sözleşme/pin fixture'ları → run-seyma driver →
// etkin ölçü kapıları (K3P-STATE.measureGates; activeFrom kartından itibaren zorunlu) → bilgi amaçlı akış ölçümleri.
// Tam kapı (bash tools/kapi/kapilar.sh) bunun yerine geçmez; dalga sonlarında ayrıca koşulur.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const base = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.join(base, '..');
const args = process.argv.slice(2);
const card = args.includes('--kart') ? args[args.indexOf('--kart') + 1] : null;
// Yavaş testler (ölçüm 2026-10-10: kabul 526 sn, grammar_tasks 286 sn, denetim 51 sn). Varsayılan olarak atlanır;
// --yavas ile koşulur. Dalga sonundaki tam kapı (kapilar.sh) bunları her zaman koşar.
const SLOW = new Set(['test_kao2_kabul.js', 'test_kao2_grammar_tasks.js', 'test_kao2_denetim.js']);
const withSlow = args.includes('--yavas');
const state = JSON.parse(fs.readFileSync(path.join(base, 'K3P-STATE.json'), 'utf8'));
const order = state.executionOrder;
if (!card || !order.includes(card)) { console.error('kullanım: kapi-hizli.mjs --kart <K3P-ID> (executionOrder içinden)'); process.exit(2); }
const logDir = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'k3p-kapi-'));
const failed = [];
const run = (label, cmd, cmdArgs) => {
  const t0 = Date.now();
  // KAO2_ACCEPT_SLOW_HOST=1: yalnız perf testinin GÖRELİ p95 bandını atlar; mutlak tavanlar (içerik/runtime/css KiB, p95) zorunlu kalır.
  // Taban (2026-10-10, main): bu makinede göreli bant K3P'den önce de kırmızı (steady 7,4 ms > 5,09 ms).
  const r = spawnSync(cmd, cmdArgs, { cwd: repo, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: { ...process.env, KAO2_ACCEPT_SLOW_HOST: '1' } });
  const ok = r.status === 0;
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  if (!ok) {
    const log = path.join(logDir, label.replace(/[^A-Za-z0-9._-]+/g, '_') + '.log');
    fs.writeFileSync(log, (r.stdout || '') + (r.stderr || ''));
    failed.push(label);
    console.log(`  ✕ ${label} (${secs} sn) → ${log}`);
  } else console.log(`  ✓ ${label} (${secs} sn)`);
  return r;
};
const exists = (rel) => fs.existsSync(path.join(repo, rel));

console.log(`== K3P hızlı kapı · ${card} ==`);
console.log('-- sözdizimi');
for (const f of ['app.js', 'sync.js', 'app/core/quranLearn.js', 'app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/helpers.js']) if (exists(f)) run(`node --check ${f}`, 'node', ['--check', f]);
console.log('-- tests/kao');
for (const f of fs.readdirSync(path.join(repo, 'tests/kao')).filter((n) => /^test_.*\.js$/.test(n)).sort()) {
  if (SLOW.has(f) && !withSlow) { console.log(`  · tests/kao/${f} atlandı (yavaş; --yavas ya da dalga sonu tam kapı)`); continue; }
  run(`tests/kao/${f}`, 'node', [`tests/kao/${f}`]);
}
console.log('-- sözleşme ve pin fixture\'ları');
const contract = fs.readdirSync(path.join(repo, 'tests/app')).filter((n) => /^test_(fx2_.*|iip_22|v3_welcome|state_rebind_boundary|modal_.*)\.js$/.test(n)).sort();
for (const f of contract) run(`tests/app/${f}`, 'node', [`tests/app/${f}`]);
console.log('-- run-seyma');
run('run-seyma driver', 'node', ['.claude/skills/run-seyma/driver.mjs']);
console.log('-- ölçü kapıları');
const at = order.indexOf(card);
for (const g of state.measureGates || []) {
  if (order.indexOf(g.activeFrom) <= at) run(`${path.basename(g.tool)} (${g.note})`, 'node', [g.tool]);
  else console.log(`  · ${path.basename(g.tool)} henüz etkin değil (${g.activeFrom} ile girer)`);
}
console.log('-- bilgi: akış ve dokunuş ölçümleri');
for (const tool of ['kao3-premium/araclar/akis-olc.cjs', 'kao3-premium/araclar/dokunus-olc.cjs']) {
  const r = spawnSync('node', [tool], { cwd: repo, encoding: 'utf8' });
  console.log((r.stdout || r.stderr || '').trim().split('\n').map((l) => '    ' + l).join('\n'));
}
console.log(failed.length ? `SONUÇ: KIRMIZI (${failed.length}) · günlükler: ${logDir}` : 'SONUÇ: HIZLI KAPI YEŞİL');
if (state.waveEnd && state.waveEnd.includes(card)) console.log(`NOT: ${card} dalga sonu → ayrıca "bash tools/kapi/kapilar.sh" koşulmalı.`);
process.exit(failed.length ? 1 : 0);
