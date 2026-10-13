// K3P-27 · yayın pini aracı (salt-okur önizleme + tek geçişte yükseltme).
//   node kao3-premium/araclar/pin-yukselt.mjs <yeniSurum> [--dene]
//
// Ne yapar:
//   1. `git diff main --name-only` ile program dalında değişen varlıkları bulur.
//   2. Değişen varlıkları ORTAK yayın sürümüne taşır: aynı `?v=` değerini paylaşan TÜM dosyalar
//      (index.html, sw.js, panel-v2.html) birlikte yükseltilir — yarım sürüm kalmaz.
//   3. `SW_VERSION`, `SW_OFFLINE_VERSION`, `index.html` serviceWorker.register satırı ve
//      pini doğrulayan test dosyalarındaki sürüm sabitleri tek geçişte güncellenir.
//   4. `--dene` yalnız planı ve farkı basar; hiçbir dosyaya yazmaz.
//
// Neden ORTAK sürüm: KAO2-FIX yayın yöntemi (bkz. LEDGER seq 27/29) tüm pinleri tek sürümde
// toplar; ayrıca `tests/app/test_iip_22.js` tek `release` sabitini tüm KAO varlıkları için
// doğrular. Varlık başına ayrı sürüm bu sözleşmeyi kırar.
//
// Ağ yok, push yok, deploy yok. Yalnız çalışma ağacındaki metin dosyalarını düzenler.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const base = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.join(base, '..');
const args = process.argv.slice(2);
const dryRun = args.includes('--dene');
const next = args.find((a) => !a.startsWith('--'));
if (!next || !/^[0-9a-z]{6,}$/.test(next)) {
  console.error('kullanım: node kao3-premium/araclar/pin-yukselt.mjs <yeniSurum> [--dene]');
  process.exit(2);
}

const runGit = (a, required = true) => {
  const r = spawnSync('git', a, { cwd: repo, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) {
    if (required) { console.error(`git ${a.join(' ')} başarısız: ${(r.stderr || '').trim()}`); process.exit(2); }
    return '';
  }
  return r.stdout;
};

const HEAD = runGit(['rev-parse', '--abbrev-ref', 'HEAD']).trim();
if (HEAD !== 'kao3-premium') {
  console.error(`bu araç yalnız kao3-premium dalında koşar (şu an: ${HEAD})`);
  process.exit(2);
}

// 1) Dalın main'e göre değiştirdiği + henüz commit'lenmemiş dosyalar.
const changed = new Set([
  ...runGit(['diff', 'main', '--name-only']).split('\n'),
  ...runGit(['diff', 'HEAD', '--name-only']).split('\n'),
  ...runGit(['ls-files', '--others', '--exclude-standard']).split('\n'),
].map((s) => s.trim()).filter(Boolean));
const assets = [...changed]
  .filter((f) => /^(app|panel|assets)\//.test(f) || /^(app\.js|sync\.js|manifest\.json)$/.test(f))
  .sort();

const HOSTS = ['index.html', 'panel-v2.html', 'sw.js'];
const read = (f) => fs.readFileSync(path.join(repo, f), 'utf8');
const REF = /(?:\.\/)?((?:app|panel|assets)\/[^"'?\s]+|app\.js|sync\.js|manifest\.json)\?v=([0-9a-z]+)/g;

// 2) Yükseltilecek sürümleri bul: değişen her varlığın bugünkü pini.
const versions = new Set();
for (const host of HOSTS) {
  for (const m of read(host).matchAll(REF)) if (assets.includes(m[1])) versions.add(m[2]);
}
if (!versions.size) {
  console.log('uyarı: değişen varlıkların hiçbiri ?v= pini taşımıyor; yalnız SW_VERSION/sürüm sabitleri güncellenir.');
}
const current = [...read('sw.js').matchAll(/SW_VERSION = '([0-9a-z]+)'/g)].map((m) => m[1])[0];
if (versions.has(next)) {
  console.error(`yeni sürüm mevcut sürümle aynı (${next}); farklı bir sürüm ver.`);
  process.exit(2);
}
// Ortak sürüm kuralı: birden çok farklı pin varsa hepsi birlikte yükseltilir (yarım sürüm bırakma).
const pinSet = new Set(versions);
if (current) pinSet.add(current);

const TEST_RE = /2026[0-9]{4}[a-z]/;
const testFiles = (() => {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(path.join(repo, dir), { withFileTypes: true })) {
      const rel = path.join(dir, e.name);
      if (e.isDirectory()) walk(rel);
      else if (/\.(js|cjs|mjs)$/.test(e.name) && TEST_RE.test(read(rel))) out.push(rel);
    }
  };
  for (const d of ['tests/app', 'tests/kao', 'tests/panel', 'tests/panel-v2', 'tests/quran', 'tests/reminders']) {
    if (fs.existsSync(path.join(repo, d))) walk(d);
  }
  return out.sort();
})();

// 3) Planı kur: dosya → [ [regex, yeni], ... ]
const edits = [];
const push = (file, list) => {
  const found = edits.find(([f]) => f === file);
  if (found) found[1] = found[1].concat(list); else edits.push([file, list]);
};
for (const host of HOSTS) {
  const src = read(host);
  const list = [];
  for (const old of pinSet) {
    const re = new RegExp(`\\?v=${old}\\b`, 'g');
    if (re.test(src)) list.push([re, `?v=${next}`]);
  }
  if (list.length) push(host, list);
}
if (current) {
  push('sw.js', [
    [new RegExp(`SW_VERSION = '${current}'`), `SW_VERSION = '${next}'`],
    [new RegExp(`SW_OFFLINE_VERSION = 'iip22-${current}'`), `SW_OFFLINE_VERSION = 'iip22-${next}'`],
  ]);
  if (read('index.html').includes(`sw.js?v=${current}`)) {
    push('index.html', [[new RegExp(`sw\\.js\\?v=${current}`), `sw.js?v=${next}`]]);
  }
}
for (const file of testFiles) {
  const src = read(file);
  const list = [];
  for (const old of pinSet) {
    const re = new RegExp(old, 'g');
    if (re.test(src)) list.push([re, next]);
  }
  if (list.length) push(file, list);
}

// 4) Uygula ya da göster.
let total = 0, files = 0;
for (const [file, list] of edits) {
  const before = read(file);
  let after = before;
  for (const [re, value] of list) after = after.replace(re, value);
  if (after === before) continue;
  const count = list.reduce((sum, [re]) => sum + (before.match(re) || []).length, 0);
  total += count; files += 1;
  console.log(`${dryRun ? '·' : '✓'} ${file.padEnd(46)} ${count} geçiş`);
  if (!dryRun) fs.writeFileSync(path.join(repo, file), after);
}
console.log(`\n${dryRun ? 'ÖNİZLEME' : 'UYGULANDI'}: ${files} dosya · ${total} geçiş · ${[...pinSet].join(', ')} → ${next}`);
if (assets.length) console.log(`değişen varlıklar (${assets.length}): ${assets.join(', ')}`);
if (dryRun) console.log('not: --dene kipinde hiçbir dosyaya yazılmadı.');
