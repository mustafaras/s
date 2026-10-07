'use strict';

// D2F-08 · tests/kao/README.md envanteri gerçek dosya listesine eşit kalır.
// Salt okunur, ağsız: yalnız dizin listesi ve README metni okunur.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const repoRoot = require('../repo-root');

const kaoDir = path.join(repoRoot, 'tests/kao');
const readme = fs.readFileSync(path.join(kaoDir, 'README.md'), 'utf8');
const rows = readme.split('\n');

function listFiles(dir, pattern) {
  return fs.readdirSync(path.join(kaoDir, dir)).filter((name) => pattern.test(name)).sort();
}

// Bir dosya adı README'de yalnız `ad` (ters tırnaklı, tam ad) olarak sayılır; alt dize eşleşmesi yetmez.
function isListed(name) {
  const quoted = '`' + name + '`';
  const prefixed = /^[a-z]+\//.test(name) ? null : ['`helpers/' + name + '`', '`fixtures/' + name + '`'];
  return rows.some((line) => line.includes(quoted) || (prefixed && prefixed.some((p) => line.includes(p))));
}

const testFiles = listFiles('.', /^test_.*\.js$/);
assert.ok(testFiles.length >= 54, 'tests/kao altında en az 54 test dosyası beklenir (' + testFiles.length + ')');

// 1) Diskteki her test dosyası README'de bir satırda geçer.
const unlisted = testFiles.filter((name) => !isListed(name));
assert.deepEqual(unlisted, [], 'README envanterinde olmayan test dosyaları: ' + unlisted.join(', '));

// 2) README'de adı geçen her test dosyası diskte vardır (hayalet satır yok).
const mentioned = Array.from(new Set(Array.from(readme.matchAll(/`(test_[A-Za-z0-9_]+\.js)`/g), (m) => m[1])));
const ghosts = mentioned.filter((name) => !fs.existsSync(path.join(kaoDir, name)));
assert.deepEqual(ghosts, [], 'README\'de olup diskte olmayan test dosyaları: ' + ghosts.join(', '));

// 3) helpers/ ve fixtures/ içerikleri de listelenmiştir.
const supportFiles = [
  ...listFiles('helpers', /\.js$/).map((name) => 'helpers/' + name),
  ...listFiles('fixtures', /\.json$/).map((name) => 'fixtures/' + name),
];
assert.ok(supportFiles.length >= 3, 'helpers/ ve fixtures/ boş olmamalı');
const unlistedSupport = supportFiles.filter((rel) => !rows.some((line) => line.includes('`' + rel + '`')));
assert.deepEqual(unlistedSupport, [], 'README envanterinde olmayan yardımcı/fixture dosyaları: ' + unlistedSupport.join(', '));

console.log('PASS test_kao2_inventory: ' + testFiles.length + ' test + ' + supportFiles.length + ' yardımcı/fixture envanterde');
