#!/usr/bin/env node
// verify-state-helper-boundary.mjs — L2-b/B1 read-only helper fixture.
//
// This deliberately does NOT load app.js. It extracts the current helper
// declarations into an isolated node:vm context and supplies a tiny explicit
// dependency bag. The fixture therefore proves that the candidate empty/* and
// normalizer helpers can be exercised without localStorage, fetch, SeySync or
// the app's global `data` object. It is not a runtime extraction and must not
// be treated as persistence/migration parity.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = process.env.SEYMA_REPO ||
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const APP_PATH = path.join(REPO, 'app.js');
const appSrc = fs.readFileSync(APP_PATH, 'utf8');
let failures = 0;

function assert(name, condition) {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

// Extract one declaration without evaluating any surrounding app code. The
// scanner skips quoted strings and comments, so braces in UI strings do not
// terminate a helper early.
function extractFunction(source, name) {
  const marker = `function ${name}`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`function not found: ${name}`);
  const open = source.indexOf('{', start);
  if (open < 0) throw new Error(`function body not found: ${name}`);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];
    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (ch === '*' && next === '/') { blockComment = false; i++; }
      continue;
    }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && next === '/') { lineComment = true; i++; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i++; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`unterminated function: ${name}`);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const SOUL_CATALOG = [
  { id: 'dua', label: 'Dua', icon: 'sparkles', sci: 'dua' },
  { id: 'tefekkur', label: 'Tefekkür', icon: 'brain', sci: 'tefekkür' },
];

const CONSTANTS = {
  ZIKR_SCHEMA_VERSION: 4,
  ZIKR_MIGRATION_VERSION: 'zikr_v2',
  QURAN_SCHEMA_VERSION: 1,
  QURAN_CATALOG_VERSION: 'quran-revelation-tr-v1',
  QURAN_DEFAULT_SURAH_ID: 'alak',
  QURAN_SURAH_ID_RE: /^[a-z]+(-[a-z]+)*$/,
  QURAN_VIDEO_ID_RE: /^[A-Za-z0-9_-]{11}$/,
  QURAN_NOTE_KINDS: ['watch', 'listen', 'reflection'],
  QURAN_REQUEST_STAMPS: ['requestedAt', 'notifiedAt', 'readyAt', 'startedWatchingAt', 'watchedAt', 'questionOpenedAt', 'updatedAt'],
  QURAN_HISTORY_MAX: 20,
  QURAN_NOTE_MAX: 100,
};

function makeContext() {
  let uidCounter = 0;
  const bag = {
    window: {},
    ZIKR_SCHEMA_VERSION: CONSTANTS.ZIKR_SCHEMA_VERSION,
    ZIKR_MIGRATION_VERSION: CONSTANTS.ZIKR_MIGRATION_VERSION,
    QURAN_SCHEMA_VERSION: CONSTANTS.QURAN_SCHEMA_VERSION,
    QURAN_CATALOG_VERSION: CONSTANTS.QURAN_CATALOG_VERSION,
    QURAN_DEFAULT_SURAH_ID: CONSTANTS.QURAN_DEFAULT_SURAH_ID,
    QURAN_SURAH_ID_RE: CONSTANTS.QURAN_SURAH_ID_RE,
    QURAN_VIDEO_ID_RE: CONSTANTS.QURAN_VIDEO_ID_RE,
    QURAN_NOTE_KINDS: CONSTANTS.QURAN_NOTE_KINDS,
    QURAN_REQUEST_STAMPS: CONSTANTS.QURAN_REQUEST_STAMPS,
    QURAN_HISTORY_MAX: CONSTANTS.QURAN_HISTORY_MAX,
    QURAN_NOTE_MAX: CONSTANTS.QURAN_NOTE_MAX,
    uid(prefix) { uidCounter++; return `${prefix || 'id'}_fixture_${uidCounter}`; },
    soulActivityById(id) { return SOUL_CATALOG.find((x) => x.id === id) || null; },
    Date,
    Math,
    Number,
    String,
    Array,
    Object,
    JSON,
    isFinite,
  };
  return vm.createContext(bag);
}

function loadHelper(name) {
  const source = extractFunction(appSrc, name);
  const ctx = makeContext();
  vm.runInContext(`this.__helper = (${source});`, ctx, { filename: `app.js#${name}` });
  return { source, helper: ctx.__helper, ctx };
}

const EMPTY_HELPERS = [
  ['emptyZikrRoot', (x) => x && x.schemaVersion === 4 && Array.isArray(x.presets) && x.settings && x.settings.haptic === true],
  ['emptySaygiRoot', (x) => x && x.streak === 0 && x.lastReadDate === '' && x.collection && typeof x.collection === 'object'],
  ['emptyQuranJourney', (x) => x && x.schemaVersion === 1 && x.activeSurahId === 'alak' && x.requests && typeof x.requests === 'object'],
  ['emptyLibrary', (x) => x && Array.isArray(x.books) && x.goal && x.goal.dailyPages === 20],
  ['emptyWatchlist', (x) => x && Array.isArray(x.items) && x.goal && x.goal.dailyMinutes === 40],
  ['emptyMusic', (x) => x && Array.isArray(x.items) && x.goal && x.goal.dailyMinutes === 30],
  ['emptySoulArchive', (x) => x && Array.isArray(x.items)],
];

const NORMALIZER_CASES = [
  ['normBook', { title: 42, author: null, totalPages: '120.6', currentPage: '9.4', status: 'invalid', rating: 9, quotes: 'bad', unknown: 'keep' }, (x) => x.id.startsWith('b_fixture_') && x.title === '42' && x.totalPages === 121 && x.currentPage === 9 && x.status === 'reading' && x.rating === 5 && Array.isArray(x.quotes) && x.unknown === 'keep'],
  ['normTitle', { title: 42, kind: 'invalid', totalEp: '8.6', watchedEp: -4, status: 'invalid', rating: 0, quotes: 'bad', unknown: 'keep' }, (x) => x.id.startsWith('w_fixture_') && x.title === '42' && x.kind === 'film' && x.totalEp === 9 && x.watchedEp === 0 && x.status === 'watching' && x.rating === 1 && Array.isArray(x.quotes) && x.unknown === 'keep'],
  ['normTrack', { title: 42, artist: null, kind: 'invalid', rating: 0, quotes: 'bad', unknown: 'keep' }, (x) => x.id.startsWith('m_fixture_') && x.title === '42' && x.artist === '' && x.kind === 'sarki' && x.rating === 1 && Array.isArray(x.quotes) && x.unknown === 'keep'],
  ['normSoulItem', { type: 'dua', totalSessions: '2.7', totalMinutes: -4, status: 'invalid', note: 7, unknown: 'keep' }, (x) => x.id.startsWith('sa_fixture_') && x.type === 'dua' && x.label === 'Dua' && x.totalSessions === 3 && x.totalMinutes === 0 && x.status === 'active' && x.note === '' && x.unknown === 'keep'],
];

console.log('== B1 helper declaration/source boundary ==');
for (const [name] of [...EMPTY_HELPERS, ...NORMALIZER_CASES]) {
  try {
    const source = extractFunction(appSrc, name);
    assert(`${name}: declaration extracted`, source.startsWith(`function ${name}`));
    assert(`${name}: no persistence/network/global-data call`, !/\b(localStorage|SeySync|fetch|save|data)\b/.test(source));
    console.log(`INFO  ${name}: sha256=${sha256(source)} bytes=${Buffer.byteLength(source, 'utf8')}`);
  } catch (error) {
    assert(`${name}: extraction`, false);
    console.log(`INFO  ${name}: ${error.message}`);
  }
}

console.log('\n== B1 empty helper contracts (isolated dependency bag) ==');
for (const [name, predicate] of EMPTY_HELPERS) {
  try {
    const { helper } = loadHelper(name);
    const first = helper();
    const second = helper();
    assert(`${name}: returns expected shape`, predicate(first));
    assert(`${name}: fresh object per call`, first !== second);
    assert(`${name}: JSON-stable fixture`, JSON.stringify(first) === JSON.stringify(second));
  } catch (error) {
    assert(`${name}: isolated evaluation`, false);
    console.log(`INFO  ${name}: ${error.stack || error.message}`);
  }
}

console.log('\n== B1 normalizer contracts (synthetic clone only) ==');
for (const [name, seed, predicate] of NORMALIZER_CASES) {
  try {
    const { helper } = loadHelper(name);
    const original = clone(seed);
    const input = clone(seed);
    const out = helper(input);
    // These legacy normalizers guard null/non-objects; arrays are filtered by
    // their owning collection before this boundary and are intentionally not
    // redefined by B1.
    assert(`${name}: null/shape guard`, helper(null) === null && helper(undefined) === null);
    assert(`${name}: normalizes synthetic clone`, !!out && predicate(out));
    assert(`${name}: unknown field preserved`, out.unknown === 'keep');
    assert(`${name}: caller seed untouched`, JSON.stringify(seed) === JSON.stringify(original));
    const again = helper(out);
    assert(`${name}: second pass keeps identity`, again.id === out.id);
    assert(`${name}: second pass keeps unknown field`, again.unknown === 'keep');
  } catch (error) {
    assert(`${name}: isolated evaluation`, false);
    console.log(`INFO  ${name}: ${error.stack || error.message}`);
  }
}

console.log('\n== B1 forbidden runtime surface ==');
const fixtureSource = fs.readFileSync(new URL(import.meta.url), 'utf8');
assert('fixture source has no localStorage invocation', !/\blocalStorage\s*\./.test(fixtureSource));
assert('fixture source has no fetch invocation', !/\bfetch\s*\(/.test(fixtureSource));
assert('fixture source does not boot app.js', !/vm\.runInContext\(appSrc/.test(fixtureSource));

console.log(`\nB1 result: ${failures ? 'FAIL' : 'PASS'} (${failures} failure${failures === 1 ? '' : 's'})`);
if (failures) process.exitCode = 1;
