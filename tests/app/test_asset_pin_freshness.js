'use strict';

// D3F-10 (denetim-3 F-10) · Önbellek pini tazeliği (CLAUDE.md kural 5).
// index.html, panel-v2.html ve sw.js içindeki her `<dosya>?v=<pin>` bağlantısı için: o URL'nin herhangi bir host
// dosyasında İLK göründüğü commit'ten sonra dosyanın kendisi değişmişse pin bayattır. Tarayıcı ve service worker
// önbelleği URL'ye göre çalışır; aynı URL eski içeriği sunabilir. Commit'lenmemiş bir dosya değişikliği, pini
// commit'lenmiş bir URL'de de bayat sayılır. Henüz commit'lenmemiş yeni pin tazedir.
// Ağsız, salt okur; git yoksa SKIP yazar (sessiz PASS değil).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const repoRoot = require('../repo-root');

const HOSTS = ['index.html', 'panel-v2.html', 'sw.js'];
const REF = /(?:\.\/)?((?:app|panel|assets)\/[^"'?\s]+|app\.js|sync\.js|manifest\.json)\?v=([0-9a-z]+)/g;
const git = (args) => execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).trim();

try { git(['rev-parse', '--git-dir']); } catch {
  console.log('SKIP  git yok: pin tazeliği denetlenmedi');
  process.exit(0);
}
if (git(['rev-parse', '--is-shallow-repository']) === 'true') {
  console.log('SKIP  sığ klon: pinin ilk göründüğü commit bilinemez, pin tazeliği denetlenmedi');
  process.exit(0);
}

const refs = new Map();
for (const host of HOSTS) {
  for (const m of fs.readFileSync(path.join(repoRoot, host), 'utf8').matchAll(REF)) {
    const ref = `${m[1]}?v=${m[2]}`;
    if (!refs.has(ref)) refs.set(ref, new Set());
    refs.get(ref).add(host);
  }
}
assert.ok(refs.size > 40, `beklenenden az ?v= bağlantısı bulundu (${refs.size}); desen bozulmuş olabilir`);

const stale = [];
for (const [ref, hosts] of refs) {
  const asset = ref.split('?')[0];
  assert.ok(fs.existsSync(path.join(repoRoot, asset)), `${ref}: dosya yok`);
  const intros = git(['log', '--format=%H %ct', '-S', ref, '--', ...HOSTS]).split('\n').filter(Boolean).map((l) => l.split(' '));
  if (!intros.length) continue; // commit'lenmemiş yeni pin: taze
  const first = intros.sort((a, b) => Number(a[1]) - Number(b[1]))[0][0];
  const later = git(['log', '--format=%h %cs', `${first}..HEAD`, '--', asset]).split('\n').filter(Boolean);
  const dirty = git(['status', '--porcelain', '--', asset]);
  if (later.length || dirty) {
    stale.push(`${ref} [${[...hosts].join(', ')}] pin ${first.slice(0, 8)}'de kondu; sonra ${later.length ? `${later.length} commit (son ${later[0]})` : 'çalışma ağacında'} değişti`);
  }
}
assert.deepEqual(stale, [], `bayat önbellek pini (dosya değişti, ?v= aynı kaldı):\n  ${stale.join('\n  ')}`);
console.log(`PASS  ${refs.size} benzersiz ?v= bağlantısı taze (${HOSTS.join(', ')})`);
console.log('asset pin freshness: PASS (1 kontrol)');
