#!/usr/bin/env node
// D3F-08 · denetim-2 dönemindeki her GitHub Pages yayını (run) denetim-2 kayıtlarında geçiyor mu? Salt okur.
// Dönem: head'i baseCommit'in ardılı ve closeCommit'in atası (ya da kendisi) olan run'lar (D2F-STATE).
// Kaynak: aynı dizindeki pages-runs.json (API anlık görüntüsü, ağ gerektirmez). --live: API'den yeniden çeker (api.github.com).
//   node kao2-duzeltme/denetim-3/evidence/D3F-08/pages-kayit-denetimi.mjs [--live]
// Kayıtsız run varsa listeler ve çıkış 1 verir.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../../../..');
const D2F = join(REPO, 'kao2-duzeltme/denetim-2');
const state = JSON.parse(readFileSync(join(D2F, 'D2F-STATE.json'), 'utf8'));
const git = (...args) => execFileSync('git', args, { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const isAncestor = (a, b) => { try { git('merge-base', '--is-ancestor', a, b); return true; } catch { return false; } };

let runs;
if (process.argv.includes('--live')) {
  const res = await fetch('https://api.github.com/repos/mustafaras/s/actions/workflows/pages.yml/runs?per_page=30');
  if (!res.ok) { console.error(`API ${res.status}`); process.exit(2); }
  runs = (await res.json()).workflow_runs;
} else {
  runs = JSON.parse(readFileSync(join(HERE, 'pages-runs.json'), 'utf8')).runs;
}

// denetim-2 kayıtları: LEDGER, CURRENT-STATE, DUZELTME-SONUCU, D2F-STATE ve evidence/** metni
const texts = [];
const walk = (dir) => readdirSync(dir).forEach((name) => {
  const full = join(dir, name);
  if (statSync(full).isDirectory()) walk(full);
  else if (/\.(md|json|txt)$/.test(name)) texts.push(readFileSync(full, 'utf8'));
});
walk(D2F);
const corpus = texts.join('\n');

const base = state.baseCommit;
const close = state.closeCommit;
const inPeriod = runs.filter((r) => r.event === 'push' && r.head_branch === 'main'
  && r.head_sha !== base && isAncestor(base, r.head_sha) && isAncestor(r.head_sha, close));
const unrecorded = inPeriod.filter((r) => !corpus.includes(String(r.id)));
for (const r of inPeriod) {
  const ok = !unrecorded.includes(r);
  console.log(`${ok ? 'KAYITLI ' : 'KAYITSIZ'}  run ${r.id} · ${r.created_at} · ${r.head_sha.slice(0, 8)} · ${r.conclusion} · ${String(r.display_title).slice(0, 60)}`);
}
if (!inPeriod.length) { console.error('dönemde run bulunamadı (anlık görüntü dönemi kapsamıyor olabilir)'); process.exit(2); }
if (unrecorded.length) { console.error(`pages-kayit: FAIL — ${unrecorded.length}/${inPeriod.length} run denetim-2 kayıtlarında yok`); process.exit(1); }
console.log(`pages-kayit: PASS — ${inPeriod.length}/${inPeriod.length} run kayıtlı (dönem ${base.slice(0, 8)}..${close.slice(0, 8)})`);
