'use strict';
// Bu kartın başlangıç commit'i ile saf içerik eşliği; ağ/depo/gerçek veri yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../..');
const file = 'app/content/quranLexiconV1.js';
const before = cp.execFileSync('git', ['show', 'a47a68f:' + file], { cwd: root, encoding: 'utf8', maxBuffer: 5000000 });
const after = fs.readFileSync(path.join(root, file), 'utf8');
function load(source) { const box = { window: {} }; vm.runInNewContext(source, box); return box.window.QuranLexiconV1; }
const a = load(before), b = load(after);
assert.equal(JSON.stringify(a), JSON.stringify(b), 'tüm serileştirilebilir içerik aynı');
assert.deepEqual(Object.keys(a), Object.keys(b), 'API anahtarları aynı');
for (const lemma of a.lemmas) {
  assert.equal(JSON.stringify(a.byId(lemma.id)), JSON.stringify(b.byId(lemma.id)));
  assert.ok(Object.isFrozen(b.byId(lemma.id)));
}
assert.equal(a.byId('missing'), b.byId('missing'));
assert.ok(Object.isFrozen(b) && Object.isFrozen(b.lemmas) && Object.isFrozen(b.roots));
console.log('Semantic parity PASS: ' + b.lemmas.length + ' lemma, byId, roots, attribution, freeze; SHA256 ' + crypto.createHash('sha256').update(JSON.stringify(b)).digest('hex'));
