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
const K3PD_BRANCH = 'k3pd-denetim-duzeltmeleri';
const K3PD_CLOSE_CARD = 'K3PD-32';
const K3PD_CARD_IDS = Array.from({ length: 34 }, (_, index) => `K3PD-${String(index).padStart(2, '0')}`);
const K3PD_CARD_STATUSES = new Set([
  'todo', 'in_progress', 'ready_for_audit', 'source_ready', 'done',
  'awaiting_owner_decision', 'blocked',
]);
const git = (args) => execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).trim();

function isExactPinnedAssetPath(file, pinnedAssetPaths) {
  if (typeof file !== 'string' || !file || file !== file.trim() || file.includes('\\')
    || file.includes('*') || file.includes('?') || file.startsWith('/') || file.endsWith('/')) return false;
  if (path.posix.normalize(file) !== file || file.split('/').includes('..') || file.split('/').includes('.')) return false;
  if (!/^(?:(?:app|panel|assets)\/(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+|app\.js|sync\.js|manifest\.json)$/.test(file)) return false;
  return pinnedAssetPaths instanceof Set && pinnedAssetPaths.has(file);
}

function resolveK3pdDeferredFiles(state, actualBranch, pinnedAssetPaths) {
  const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  if (!isObject(state) || actualBranch !== K3PD_BRANCH
    || state.program !== 'K3PD' || state.planVersion !== 1 || state.branch !== K3PD_BRANCH
    || state.status !== 'active' || !/^[0-9a-f]{40}$/.test(state.baselineHead || '')) return [];
  if (!Array.isArray(state.executionOrder)
    || state.executionOrder.length !== K3PD_CARD_IDS.length
    || state.executionOrder.some((id, index) => id !== K3PD_CARD_IDS[index])) return [];
  if (!isObject(state.cards) || Object.keys(state.cards).length !== K3PD_CARD_IDS.length
    || K3PD_CARD_IDS.some((id) => !isObject(state.cards[id])
      || state.cards[id].id !== id || !K3PD_CARD_STATUSES.has(state.cards[id].status))) return [];
  if (!K3PD_CARD_IDS.includes(state.nextPrompt)
    || state.cards[state.nextPrompt].status === 'done'
    || state.cards[K3PD_CLOSE_CARD].status === 'done') return [];

  const release = state.releaseApproval;
  if (!isObject(release) || release.status !== 'NOT_APPROVED'
    || release.candidateSha !== null || !Array.isArray(release.scope) || release.scope.length !== 0
    || release.response !== null || release.approvedAt !== null) return [];

  const pin = state.pinDeferral;
  if (!isObject(pin) || Object.keys(pin).sort().join('|') !== 'branch|files|mainExceptions|until'
    || pin.branch !== K3PD_BRANCH || pin.until !== K3PD_CLOSE_CARD
    || !Array.isArray(pin.files) || !Array.isArray(pin.mainExceptions) || pin.mainExceptions.length !== 0) return [];
  if (new Set(pin.files).size !== pin.files.length
    || pin.files.some((file) => !isExactPinnedAssetPath(file, pinnedAssetPaths))) return [];
  return pin.files.slice();
}

function resolveLegacyK3pDeferredFiles(deferral, actualBranch) {
  if (actualBranch === 'main') return [];
  return deferral && deferral.branch && actualBranch === deferral.branch && Array.isArray(deferral.files)
    ? deferral.files : [];
}

module.exports = { resolveK3pdDeferredFiles, resolveLegacyK3pDeferredFiles };

if (require.main === module) {
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
// K3P (K-P): tarihsel erteleme sözleşmesi BAGLAM §6.3'e göre korunur.
const deferral = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(repoRoot, 'kao3-premium', 'K3P-STATE.json'), 'utf8')).pinDeferral || null; } catch { return null; }
})();
const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
const legacyDeferredFiles = resolveLegacyK3pDeferredFiles(deferral, branch);
const k3pdState = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(repoRoot, 'kao3-premium', 'duzeltme-plani', 'DURUM.json'), 'utf8'));
  } catch {
    return null;
  }
})();
const pinnedAssetPaths = new Set([...refs.keys()].map((ref) => ref.split('?')[0]));
const k3pdDeferredFiles = resolveK3pdDeferredFiles(k3pdState, branch, pinnedAssetPaths);
const deferredFiles = new Set([...legacyDeferredFiles, ...k3pdDeferredFiles]);
const deferred = stale.filter((line) => deferredFiles.has(line.split('?')[0]));
const blocking = stale.filter((line) => !deferred.includes(line));
const fullyFreshCount = refs.size - stale.length;
console.log(`ÖLÇÜM  ${fullyFreshCount} tam taze · ${deferred.length} ERTELENDİ · ${blocking.length} engelleyici bayat pin / ${refs.size} benzersiz bağlantı`);
if (k3pdDeferredFiles.length) console.log(`K3PD ERTELENDİ  dal ${branch} · ${K3PD_CLOSE_CARD} öncesi yalnız tam listeli dosyalar`);
if (legacyDeferredFiles.length) console.log(`K3P ERTELENDİ  dal ${branch} · ${deferral.until || '?'} öncesi eski exact-file listesi`);
assert.deepEqual(blocking, [], `bayat önbellek pini (dosya değişti, ?v= aynı kaldı):\n  ${blocking.join('\n  ')}`);
if (deferred.length) console.log(`ERTELENDİ  ${deferred.length} bayat pin, PASS sayılmadan ertelendi:\n  ${deferred.join('\n  ')}`);
console.log(`PASS  ${fullyFreshCount} tam taze ?v= bağlantısı (${HOSTS.join(', ')}); ${deferred.length} erteleme release PASS'i değildir`);
console.log('asset pin freshness: PASS (1 kontrol)');
}
