'use strict';

// KAO2 K-1: salt okunur, ağsız, boş VM; gerçek veri veya tarayıcı kullanılmaz.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');
const { performance } = require('node:perf_hooks');
const root = require('../repo-root');
const read = (file) => fs.readFileSync(path.join(root, file));
const exists = (file) => fs.existsSync(path.join(root, file));
const legacy = ['Lexicon', 'Grammar', 'ShortSurahs', 'Phonics'].map((name) => `app/content/quran${name}V1.js`);
const curriculum = 'app/content/quranCurriculumV2.js';
// KAO2-07 sonrası müfredat modülü zorunlu; K-1 bütçesi beş içerik modülünü birlikte ölçer.
assert.ok(exists(curriculum), 'quranCurriculumV2.js eksik');
const content = legacy.concat([curriculum]);
const runtime = fs.readdirSync(path.join(root, 'app/core')).filter((file) => /^quranLearn.*\.js$/.test(file))
  .sort((a, b) => (a === 'quranLearn.js') - (b === 'quranLearn.js') || a.localeCompare(b))
  .map((file) => `app/core/${file}`);
assert.ok(runtime.includes('app/core/quranLearn.js'), 'motor eksik');
const gzip = (files) => files.reduce((sum, file) => sum + zlib.gzipSync(read(file), { level: 9 }).length, 0);
const contentGzip = gzip(content), legacyGzip = gzip(legacy);
const runtimeGzip = gzip(runtime), cssGzip = gzip(['app/kao.css']);
assert.ok(contentGzip <= 256 * 1024, `content ${contentGzip} bytes exceeds budget`);
assert.ok(legacyGzip <= 164 * 1024, `legacy ${legacyGzip} bytes exceeds 164 KiB`);
assert.ok(gzip([curriculum]) <= 48 * 1024, 'curriculum exceeds 48 KiB');
assert.ok(runtimeGzip <= 80 * 1024, 'runtime exceeds 80 KiB');
assert.ok(cssGzip <= 14 * 1024, 'css exceeds 14 KiB');
const sources = content.concat(runtime).map((file) => ({ file, source: read(file).toString('utf8') }));
const samples = [];
for (let i = 0; i < 20; i += 1) {
  const box = vm.createContext({ window: {} });
  const start = performance.now();
  for (const { file, source } of sources) vm.runInContext(source, box, { filename: file });
  samples.push(performance.now() - start);
  assert.ok(box.window.SeymaQuranLearn, 'VM motor registry eksik');
}
samples.sort((a, b) => a - b);
const p95Ms = samples[Math.ceil(samples.length * 0.95) - 1];
assert.ok(p95Ms <= 40, `p95 ${p95Ms.toFixed(3)} ms exceeds 40 ms`);
const baselineFile = 'kuran-ogreniyorum-v2/evidence/KAO2-01/perf-baseline.json';
if (process.env.KAO2_WRITE_BASELINE === '1') {
  // Açık opt-in; mevcut taban sessizce yenilenemez, ölçüm kapıları önce geçer.
  fs.writeFileSync(path.join(root, baselineFile), JSON.stringify({
    date: new Date().toISOString(), node: process.version, p95Ms,
    contentGzip, runtimeGzip, cssGzip
  }, null, 2) + '\n', { flag: 'wx' });
}
if (exists(baselineFile)) {
  const baseline = JSON.parse(read(baselineFile));
  assert.ok(Number.isFinite(baseline.p95Ms) && baseline.p95Ms > 0, 'geçersiz p95 tabanı');
  assert.ok(p95Ms <= baseline.p95Ms * 1.25, `p95 ${p95Ms.toFixed(3)} ms exceeds baseline +25% (${baseline.p95Ms} ms)`);
}
const kib = (n) => (n / 1024).toFixed(3);
console.log(`KAO2 perf: PASS (content ${kib(contentGzip)} KiB · runtime ${kib(runtimeGzip)} KiB · css ${kib(cssGzip)} KiB · p95 ${p95Ms.toFixed(3)} ms)`);
