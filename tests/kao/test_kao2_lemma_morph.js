'use strict';

// K2F-19 ek tur · QAC lemma-morfoloji tablosu (tests/kao/fixtures/qac-lemma-morph.json) sözleşmesi.
// Tablo elle yazılmaz; tools/kao2-lemma-morph-build.mjs QAC 0.4'ten SAYAR. Girdi (gitignore'daki inputs/) yoksa
// bayt-eşitlik adımı SKIP; öteki kontroller her zaman çalışır. Ağ yok.
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');
const table = JSON.parse(read('tests/kao/fixtures/qac-lemma-morph.json'));
const box = { window: {} };
vm.createContext(box);
vm.runInContext(read('app/content/quranLexiconV1.js'), box);
const lexicon = box.window.QuranLexiconV1;
const byTranslit = (translit) => lexicon.lemmas.find((l) => l.translit === translit);
const row = (translit) => table.lemmas[byTranslit(translit).id];

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

check('şema, kaynaklar ve sha256 girdi kaydı var; tablo 524 lemmanın tamamını kapsar', () => {
  assert.equal(table.schema, 'kao2-lemma-morph/1');
  assert.ok(table.sources.some((s) => s.includes('corpus.quran.com/documentation/morphologicalfeatures.jsp')));
  assert.ok(table.sources.some((s) => s.includes('corpus.quran.com/documentation/tagset.jsp')));
  assert.match(table.input.qacSha256, /^[0-9a-f]{64}$/);
  assert.match(table.input.lexiconSha256, /^[0-9a-f]{64}$/);
  assert.deepEqual(Object.keys(table.lemmas).sort(), Array.from(lexicon.lemmas, (l) => l.id).sort());
});

check('her satır tutarlı: sayımlar tamsayı, kip toplamı ≤ toplam, örnekler ≤3 ve kendi sayımları ≤ toplam', () => {
  for (const [id, r] of Object.entries(table.lemmas)) {
    for (const key of ['perf', 'impf', 'impv', 'voc', 'total']) assert.ok(Number.isInteger(r[key]) && r[key] >= 0, `${id}.${key}`);
    assert.ok(r.perf + r.impf + r.impv <= r.total, `${id}: kip toplamı > toplam`);
    assert.ok(r.voc <= r.total && r.examples.length <= 3);
    for (const e of r.examples) assert.match(e.ref, /^\d+:\d+$/);
  }
});

check('bilinen dilbilgisi gerçekleri QAC sayımlarıyla uyuşur (bağımsız doğrulama)', () => {
  // Seslenme "yā ayyuhā": ayyuhâ 153 geçişin ezici çoğunluğunda VOC önekli.
  assert.ok(row('ayyuhâ').voc >= 100 && row('ayyuhâ').total >= 150);
  // "zikret!", "bağışla!", "merhamet et!" Kur'an'da emirle gelir; 'câ'a' (geldi) hiç emirle gelmez.
  assert.ok(row('zakara').impv > 0 && row('gafara').impv > 0 && row('rahima').impv > 0);
  assert.equal(row("câ'a").impv, 0);
  // Salt geçmiş kullanılan fiil: câ'a tamamı PERF.
  assert.equal(row("câ'a").perf, row("câ'a").total);
  // İsim ve harf lemmalarında fiil kipi yok.
  assert.equal(row('inn').perf + row('inn').impf + row('inn').impv, 0);
});

const asyncChecks = [];
const checkAsync = (name, run) => { asyncChecks.push([name, run]); };
checkAsync('ayrıştırıcı: CRLF, çıplak IMPV kök özelliği sayılır, `l:IMPV+` emir lâmı öneki SAYILMAZ, VOC öneki kelimeye bağlanır', async () => {
  const { parseWords } = await import(path.join(repoRoot, 'tools/kao2-lemma-morph-build.mjs'));
  const sample = [
    '(1:1:1:1)\tlo\tIMPV\tPREFIX|l:IMPV+\r',
    '(1:1:1:2)\tyaqumo\tV\tSTEM|POS:V|IMPF|LEM:qaAma|ROOT:qwm|3MS|MOOD:JUS\r',
    '(1:1:2:1)\t{hodi\tV\tSTEM|POS:V|IMPV|LEM:hadaY|ROOT:hdy|2MS\r',
    '(1:1:3:1)\tya`^\tVOC\tPREFIX|ya+\r',
    '(1:1:3:2)\tay~uhaA\tN\tSTEM|POS:N|LEM:ay~uhaA\r',
    '(1:1:4:1)\tmin\tP\tSTEM|POS:P\r'
  ].join('\n');
  const words = parseWords(sample);
  assert.equal(words.length, 4);
  assert.deepEqual(words.map((w) => w.aspect), ['IMPF', 'IMPV', null, null], 'lâm öneki emir sayılmaz');
  assert.equal(words[2].voc, true);
  assert.equal(words[3].lemma, 'min', 'LEM yoksa parça biçimi (sözlük yapım kuralıyla aynı)');
});

check('girdi varsa tablo araçla bayt-eşit yeniden üretilir (yoksa SKIP)', () => {
  const input = path.join(repoRoot, 'docs/kuran-ogreniyorum/content/inputs/quranic-corpus-morphology-0.4.txt');
  if (!fs.existsSync(input)) { console.log('SKIP  QAC girdisi yok'); return; }
  const result = childProcess.spawnSync(process.execPath, [path.join(repoRoot, 'tools/kao2-lemma-morph-build.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

(async () => {
  for (const [name, run] of asyncChecks) { await run(); passed += 1; console.log(`PASS  ${name}`); }
  console.log(`KAO2 lemma morfolojisi: PASS (${passed} kontrol)`);
})().catch((error) => { console.error(error); process.exit(1); });
