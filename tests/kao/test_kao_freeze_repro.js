'use strict';

// KAO-FIX-01 (O-4): dört donmuş içerik modülü, repodaki araçlarla geçici bir
// kopyada yeniden üretildiğinde bayt-bayt aynı çıkmalıdır. Repoya yazılmaz;
// git dışı girdiler (QAC/Tanzil, lexicon.reference.json) yoksa SKIP.

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const repoRoot = require('../repo-root');

const CONTENT_REL = 'kuran-ogreniyorum/content';
const TOOLS = ['tools/kao-lexicon-build.mjs', 'tools/kao-content-freeze.mjs'];
const REQUIRED_INPUTS = [
  `${CONTENT_REL}/inputs/quranic-corpus-morphology-0.4.txt`,
  `${CONTENT_REL}/inputs/quran-uthmani.txt`,
  `${CONTENT_REL}/lexicon.reference.json`
];
const STEPS = [
  ['tools/kao-lexicon-build.mjs', '--freeze'],
  ['tools/kao-content-freeze.mjs', '--freeze-grammar'],
  ['tools/kao-content-freeze.mjs', '--freeze-surahs'],
  ['tools/kao-content-freeze.mjs', '--freeze-phonics']
];
const MODULES = [
  'app/content/quranLexiconV1.js',
  'app/content/quranGrammarV1.js',
  'app/content/quranShortSurahsV1.js',
  'app/content/quranPhonicsV1.js'
];
const STEP_TIMEOUT_MS = 180000;

const missing = REQUIRED_INPUTS.filter((rel) => !fs.existsSync(path.join(repoRoot, rel)));
if (missing.length) {
  console.log(`SKIP: girdi yok (${missing.join(', ')})`);
  process.exit(0);
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
function repoModuleHashes() {
  return MODULES.map((rel) => sha256(fs.readFileSync(path.join(repoRoot, rel))));
}
function firstDiff(a, b) {
  const limit = Math.min(a.length, b.length);
  for (let i = 0; i < limit; i += 1) if (a[i] !== b[i]) return i;
  return limit;
}

// Çalışma ağacının kopyası: yalnız araçlar ve içerik kaynakları. app/content boş
// başlar; böylece her modül gerçekten bu koşuda üretilmiş olur.
const before = repoModuleHashes();
const copy = fs.mkdtempSync(path.join(os.tmpdir(), 'kao-freeze-repro-'));
try {
  for (const rel of TOOLS) {
    fs.mkdirSync(path.dirname(path.join(copy, rel)), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, rel), path.join(copy, rel));
  }
  fs.cpSync(path.join(repoRoot, CONTENT_REL), path.join(copy, CONTENT_REL), {
    recursive: true,
    filter: (src) => path.basename(src) !== '.claude'
  });
  fs.mkdirSync(path.join(copy, 'app/content'), { recursive: true });

  for (const [tool, flag] of STEPS) {
    const run = childProcess.spawnSync(process.execPath, [tool, flag], {
      cwd: copy, encoding: 'utf8', timeout: STEP_TIMEOUT_MS
    });
    const detail = `${(run.stderr || '').trim()} ${(run.stdout || '').trim()}`.slice(0, 400);
    assert.equal(run.status, 0, `${tool} ${flag} exit ${run.status}: ${detail}`);
  }

  for (const rel of MODULES) {
    const expected = fs.readFileSync(path.join(repoRoot, rel));
    const actual = fs.readFileSync(path.join(copy, rel));
    assert.ok(expected.equals(actual),
      `${rel}: yeniden üretim bayt-eş değil (repo ${expected.length} · üretilen ${actual.length} bayt, ilk fark ${firstDiff(expected, actual)})`);
  }
} finally {
  fs.rmSync(copy, { recursive: true, force: true });
}

assert.deepEqual(repoModuleHashes(), before, 'test repodaki içerik modüllerine yazmamalı');
console.log(`KAO freeze repro: PASS (${MODULES.length} modül bayt-eş)`);
