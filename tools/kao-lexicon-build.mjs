#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STATS_PATH = path.join(ROOT, 'kuran-ogreniyorum', 'evidence', 'KAO-01', 'stats.json');
const CONTRACT_TOKEN_TARGET = 77_430;
const OFFICIAL_RELEASE_WORD_TOTAL = 77_429;

const INPUTS = Object.freeze({
  morphology: Object.freeze({
    file: 'quranic-corpus-morphology-0.4.txt',
    sha256: 'a1d12923815341face765083805d2148ed2d9f5cc3f7d6665219d887675d8c46',
    url: 'https://corpus.quran.com/download/',
    license: 'GNU GPL; QAC copyright block and attribution must be retained'
  }),
  uthmani: Object.freeze({
    file: 'quran-uthmani.txt',
    sha256: '7f30c647331a61100ebf24a80507dc0fcdd9f2df97f1312b5b2dfcb982a7f326',
    url: 'https://tanzil.net/download/',
    license: 'Tanzil terms / CC BY-ND 3.0; verbatim text, attribution and link required'
  })
});

// Unicode values are confined to this mechanical Buckwalter conversion table.
// Corpus content is always read from the pinned local inputs, never authored here.
const BUCKWALTER_TO_ARABIC = Object.freeze({
  "'": 'ء', '|': 'آ', '>': 'أ', '&': 'ؤ', '<': 'إ', '}': 'ئ',
  A: 'ا', b: 'ب', p: 'ة', t: 'ت', v: 'ث', j: 'ج', H: 'ح', x: 'خ',
  d: 'د', '*': 'ذ', r: 'ر', z: 'ز', s: 'س', '$': 'ش', S: 'ص', D: 'ض',
  T: 'ط', Z: 'ظ', E: 'ع', g: 'غ', _: 'ـ', f: 'ف', q: 'ق', k: 'ك',
  l: 'ل', m: 'م', n: 'ن', h: 'ه', w: 'و', Y: 'ى', y: 'ي', F: 'ً',
  N: 'ٌ', K: 'ٍ', a: 'َ', u: 'ُ', i: 'ِ', '~': 'ّ', o: 'ْ', '`': 'ٰ',
  '{': 'ٱ', '^': 'ٓ', '#': 'ٔ', '@': '۟', '"': '۠', '[': 'ۢ', ';': 'ۣ',
  ',': 'ۥ', '.': 'ۦ', '!': 'ۨ', '-': '۪', '+': '۫', '%': '۬', ']': 'ۭ'
});

// 01-ARASTIRMA §1 publishes ten concrete lemma/frequency pairs, not a full 25.
const RESEARCH_REFERENCE = Object.freeze([
  ['min', 3226], ['{ll~ah', 2699], ['fiY', 1701], ['<in~', 1682],
  ['EalaY`', 1445], ['{l~a*iY', 1442], ['laA', 1364], ['maA', 1266],
  ['rab~', 975], ['<ilaY`', 742]
]);

class CliError extends Error {
  constructor(message, exitCode) {
    super(message);
    this.exitCode = exitCode;
  }
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function bwToArabic(value) {
  return Array.from(value || '', (character) => (
    Object.prototype.hasOwnProperty.call(BUCKWALTER_TO_ARABIC, character)
      ? BUCKWALTER_TO_ARABIC[character]
      : character
  )).join('');
}

function feature(features, name) {
  const match = String(features || '').match(new RegExp(`(?:^|\\|)${name}:([^|]+)`));
  return match ? match[1] : null;
}

function parseMorphology(source) {
  const words = new Map();
  let dataLineCount = 0;

  for (const [index, rawLine] of source.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line === 'LOCATION\tFORM\tTAG\tFEATURES') continue;

    const columns = rawLine.split('\t');
    if (columns.length < 4) throw new Error(`QAC satır ${index + 1}: dört TSV sütunu bekleniyordu`);
    const [location, form, tag, features] = columns;
    const match = location.match(/^\((\d+):(\d+):(\d+):(\d+)\)$/);
    if (!match) throw new Error(`QAC satır ${index + 1}: geçersiz konum ${location}`);

    const surah = Number(match[1]);
    const ayah = Number(match[2]);
    const wordIndex = Number(match[3]);
    const segmentIndex = Number(match[4]);
    const key = `${surah}:${ayah}:${wordIndex}`;
    const word = words.get(key) || {
      key, surah, ayah, wordIndex, segments: [], lemmaBw: null,
      rootBw: null, pos: null, fallbackPos: null
    };

    word.segments.push({ segmentIndex, form, tag, features });
    const lemma = feature(features, 'LEM');
    const root = feature(features, 'ROOT');
    const pos = feature(features, 'POS');
    const isStem = features.split('|').includes('STEM');
    if (!word.lemmaBw && lemma) word.lemmaBw = lemma;
    if (!word.rootBw && root) word.rootBw = root;
    if (isStem) word.pos = pos || tag;
    else if (!word.fallbackPos) word.fallbackPos = pos || tag;
    words.set(key, word);
    dataLineCount += 1;
  }

  const orderedWords = [...words.values()].sort((left, right) => (
    left.surah - right.surah || left.ayah - right.ayah || left.wordIndex - right.wordIndex
  ));
  for (const word of orderedWords) {
    word.segments.sort((left, right) => left.segmentIndex - right.segmentIndex);
    word.formBw = word.segments.map((segment) => segment.form).join('');
    word.lemmaSource = word.lemmaBw ? 'LEM' : 'FORM_FALLBACK';
    if (!word.pos) word.pos = word.fallbackPos || 'UNKNOWN';
    delete word.fallbackPos;
  }

  if (!orderedWords.length) throw new Error('QAC girdisinde morfoloji satırı bulunamadı');
  return { words: orderedWords, dataLineCount };
}

function normalizeArabic(value) {
  return String(value || '').normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/gu, '')
    .replace(/ـ/gu, '')
    .replace(/[ٱأإآ]/gu, 'ا')
    .replace(/ى/gu, 'ي');
}

function parseUthmani(source, qacWords) {
  const lines = source.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  const wordsByVerse = new Map();
  for (const word of qacWords) {
    const ref = `${word.surah}:${word.ayah}`;
    if (!wordsByVerse.has(ref)) wordsByVerse.set(ref, []);
    wordsByVerse.get(ref).push(word);
  }
  const verseRefs = [...wordsByVerse.keys()];
  if (lines.length !== verseRefs.length) {
    throw new Error(`Tanzil satır sayısı (${lines.length}) QAC âyet sayısıyla (${verseRefs.length}) eşleşmiyor`);
  }
  const diagnostics = {
    ignoredStandaloneMarkTotal: 0,
    removedBasmalaTokenTotal: 0,
    mergedTanzilTokenTotal: 0,
    alignedVerseTotal: 0
  };
  const byVerse = new Map();

  for (const [index, reference] of verseRefs.entries()) {
    const qacVerseWords = wordsByVerse.get(reference);
    let tokens = lines[index].split(/\s+/).filter((token) => {
      const isWord = /\p{L}/u.test(token);
      if (!isWord) diagnostics.ignoredStandaloneMarkTotal += 1;
      return isWord;
    });
    const firstWord = qacVerseWords[0];
    if (firstWord.ayah === 1 && firstWord.surah !== 1 && firstWord.surah !== 9
      && tokens.length >= qacVerseWords.length + 4) {
      tokens = tokens.slice(4);
      diagnostics.removedBasmalaTokenTotal += 4;
    }

    while (tokens.length > qacVerseWords.length) {
      let mergeIndex = -1;
      for (let candidate = 0; candidate < qacVerseWords.length && candidate + 1 < tokens.length; candidate += 1) {
        const combined = normalizeArabic(tokens[candidate] + tokens[candidate + 1]);
        const qacForm = normalizeArabic(bwToArabic(qacVerseWords[candidate].formBw));
        if (combined === qacForm) {
          mergeIndex = candidate;
          break;
        }
      }
      if (mergeIndex === -1) break;
      tokens.splice(mergeIndex, 2, `${tokens[mergeIndex]} ${tokens[mergeIndex + 1]}`);
      diagnostics.mergedTanzilTokenTotal += 1;
    }

    if (tokens.length !== qacVerseWords.length) {
      throw new Error(`Tanzil/QAC kelime hizası bozuk ${reference}: Tanzil ${tokens.length}, QAC ${qacVerseWords.length}`);
    }
    byVerse.set(reference, tokens);
    diagnostics.alignedVerseTotal += 1;
  }
  return { byVerse, diagnostics };
}

function exampleWindow(word, uthmaniByVerse) {
  const ref = `${word.surah}:${word.ayah}`;
  const verseWords = uthmaniByVerse.get(ref);
  if (!verseWords || !verseWords.length) return null;
  const center = Math.max(0, Math.min(word.wordIndex - 1, verseWords.length - 1));
  let start = Math.max(0, center - 2);
  let end = Math.min(verseWords.length, center + 3);
  while (end - start < Math.min(3, verseWords.length)) {
    if (start > 0) start -= 1;
    else if (end < verseWords.length) end += 1;
    else break;
  }
  return {
    ref,
    word: word.wordIndex,
    startWord: start + 1,
    endWord: end,
    text: verseWords.slice(start, end).join(' ')
  };
}

function buildStats(morphologySource, uthmaniSource, sourceHashes, generatedBy = 'local-inputs') {
  const parsed = parseMorphology(morphologySource);
  const verseRefs = [...new Set(parsed.words.map((word) => `${word.surah}:${word.ayah}`))];
  const uthmani = parseUthmani(uthmaniSource, parsed.words);
  const lemmas = new Map();
  const roots = new Set();
  let annotatedTokenTotal = 0;

  for (const word of parsed.words) {
    if (word.lemmaSource === 'LEM') annotatedTokenTotal += 1;
    if (word.rootBw) roots.add(word.rootBw);
    if (word.lemmaSource !== 'LEM') continue;
    const lemma = lemmas.get(word.lemmaBw) || {
      lemmaBw: word.lemmaBw,
      lemmaAr: bwToArabic(word.lemmaBw),
      frequency: 0,
      annotatedFrequency: 0,
      roots: new Set(),
      pos: new Map(),
      examples: []
    };
    lemma.frequency += 1;
    lemma.annotatedFrequency += 1;
    if (word.rootBw) lemma.roots.add(word.rootBw);
    lemma.pos.set(word.pos || 'UNKNOWN', (lemma.pos.get(word.pos || 'UNKNOWN') || 0) + 1);
    if (lemma.examples.length < 3) {
      const example = exampleWindow(word, uthmani.byVerse);
      if (example) lemma.examples.push(example);
    }
    lemmas.set(word.lemmaBw, lemma);
  }

  const topLemmas = [...lemmas.values()]
    .sort((left, right) => right.frequency - left.frequency || left.lemmaBw.localeCompare(right.lemmaBw))
    .slice(0, 25)
    .map((lemma, index) => ({
      rank: index + 1,
      lemmaBw: lemma.lemmaBw,
      lemmaAr: lemma.lemmaAr,
      frequency: lemma.frequency,
      annotatedFrequency: lemma.annotatedFrequency,
      rootsBw: [...lemma.roots].sort(),
      pos: [...lemma.pos].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
        .map(([tag, count]) => ({ tag, count })),
      examples: lemma.examples
    }));

  const frequencyByLemma = new Map([...lemmas].map(([key, value]) => [key, value.frequency]));
  const researchComparison = RESEARCH_REFERENCE.map(([lemmaBw, expected]) => {
    const observed = frequencyByLemma.get(lemmaBw) || 0;
    return { lemmaBw, expected, observed, delta: observed - expected, matches: observed === expected };
  });

  return {
    schemaVersion: 1,
    generatedBy,
    sourceHashes,
    tokenTotal: parsed.words.length,
    contractTokenTarget: CONTRACT_TOKEN_TARGET,
    officialReleaseWordTotal: OFFICIAL_RELEASE_WORD_TOTAL,
    contractTokenTargetMatch: parsed.words.length === CONTRACT_TOKEN_TARGET,
    officialReleaseWordTotalMatch: parsed.words.length === OFFICIAL_RELEASE_WORD_TOTAL,
    morphologySegmentTotal: parsed.dataLineCount,
    annotatedTokenTotal,
    fallbackTokenTotal: parsed.words.length - annotatedTokenTotal,
    lemmaCount: lemmas.size,
    rootCount: roots.size,
    verseCount: verseRefs.length,
    alignment: uthmani.diagnostics,
    topLemmas,
    researchReference: {
      publishedPairs: RESEARCH_REFERENCE.length,
      requestedTopCount: 25,
      note: '01-ARASTIRMA §1 yalnız 10 somut lemma/frekans çifti yayımlar; kalan 15 için karşılaştırma uydurulmadı.',
      comparison: researchComparison
    }
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(`self-test: ${message}`);
}

function syntheticInputs() {
  const lemmaSpecs = [
    ['min', 'byn', 'P'], ['rab~', 'rbb', 'N'], ['kitAb', 'ktb', 'N'],
    ['Ealima', 'Elm', 'V'], ['qawom', 'qwm', 'N']
  ];
  const morphology = ['LOCATION\tFORM\tTAG\tFEATURES'];
  const verses = [];
  for (let ayah = 1; ayah <= 10; ayah += 1) {
    const verse = [];
    for (let word = 1; word <= 5; word += 1) {
      const [lemma, root, pos] = lemmaSpecs[(ayah + word) % lemmaSpecs.length];
      morphology.push(`(1:${ayah}:${word}:1)\t${lemma}\t${pos}\tSTEM|POS:${pos}|LEM:${lemma}|ROOT:${root}`);
      verse.push(bwToArabic(lemma));
    }
    verses.push(verse.join(' '));
  }
  return { morphology: morphology.join('\n'), uthmani: verses.join('\n') };
}

function selfTest() {
  const synthetic = syntheticInputs();
  const stats = buildStats(synthetic.morphology, synthetic.uthmani, {
    morphology: sha256(Buffer.from(synthetic.morphology)),
    uthmani: sha256(Buffer.from(synthetic.uthmani))
  }, 'embedded-50-line-self-test');

  assert(stats.morphologySegmentTotal === 50, 'sentetik korpus tam 50 veri satırı olmalı');
  assert(stats.tokenTotal === 50, '50 token ayrıştırılmalı');
  assert(stats.lemmaCount === 5, '5 lemma gruplanmalı');
  assert(stats.rootCount === 5, '5 kök gruplanmalı');
  assert(stats.verseCount === 10, '10 âyet satırı eşleşmeli');
  assert(stats.topLemmas.length === 5, 'top liste sentetik lemma sayısına inmeli');
  assert(stats.topLemmas.every((lemma) => lemma.examples.length === 3), 'her lemma için üç örnek tutulmalı');
  assert(stats.topLemmas.flatMap((lemma) => lemma.examples)
    .every((example) => example.endWord - example.startWord + 1 >= 3
      && example.endWord - example.startWord + 1 <= 7), 'örnek pencereler 3–7 kelime olmalı');
  assert(bwToArabic('bsm') === [BUCKWALTER_TO_ARABIC.b, BUCKWALTER_TO_ARABIC.s, BUCKWALTER_TO_ARABIC.m].join(''),
    'Buckwalter dönüşümü tablo üzerinden çalışmalı');

  const regressionMorphology = [
    'LOCATION\tFORM\tTAG\tFEATURES',
    '(2:1:1:1)\tbi\tP\tPREFIX|bi+',
    '(2:1:1:2)\tsomi\tN\tSTEM|POS:N|LEM:{som|ROOT:smw|M|GEN',
    '(2:1:2:1)\trab~i\tN\tSTEM|POS:N|LEM:rab~|ROOT:rbb|M|GEN',
    '(2:1:3:1)\tkitAbi\tN\tSTEM|POS:N|LEM:kitaAb|ROOT:ktb|M|GEN',
    '(2:1:4:1)\tbaEoda maA\tP\tSTEM|POS:P|LEM:baEodamaA',
    '(2:1:5:1)\txayor\tN\tSTEM|POS:N|ROOT:xyr|M|GEN'
  ].join('\n');
  const basmala = ['bi', 'somi', '{ll~ahi', '{lraHiymi'].map(bwToArabic);
  const regressionUthmani = [...basmala, bwToArabic('bisomi'), bwToArabic('rab~i'),
    BUCKWALTER_TO_ARABIC[';'], bwToArabic('kitAbi'), bwToArabic('baEoda'), bwToArabic('maA'),
    bwToArabic('xayor')].join(' ');
  const regressionParsed = parseMorphology(regressionMorphology);
  const regressionStats = buildStats(regressionMorphology, regressionUthmani, {}, 'embedded-regression');
  assert(regressionParsed.words[0].pos === 'N', 'prefix POS yerine STEM POS seçilmeli');
  assert(regressionStats.lemmaCount === 4, 'LEM içermeyen yüzey biçimi lemma sayılmamalı');
  assert(regressionStats.fallbackTokenTotal === 1, 'LEM içermeyen token ayrı paydada sayılmalı');
  assert(regressionStats.alignment.removedBasmalaTokenTotal === 4, 'ekli besmele QAC indeksinden çıkarılmalı');
  assert(regressionStats.alignment.ignoredStandaloneMarkTotal === 1, 'bağımsız vakıf işareti kelime sayılmamalı');
  assert(regressionStats.alignment.mergedTanzilTokenTotal === 1, 'Tanzil 1.1 bölünmüş kelimesi QAC konumuna birleşmeli');
  assert(regressionStats.topLemmas.every((lemma) => lemma.pos.every((entry) => entry.tag !== 'P')
    || lemma.lemmaBw === 'baEodamaA'), 'prefix etiketi lemma POS dağılımına sızmamalı');

  const source = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  assert(!/\bfetch\s*\(/.test(source), 'fetch çağrısı bulunmamalı');
  assert(!/from\s+['"](?:node:)?https?['"]/.test(source), 'http/https importu bulunmamalı');
  const xhrName = ['XML', 'HttpRequest'].join('');
  assert(!source.includes(xhrName), `${xhrName} bulunmamalı`);
  console.log('KAO lexicon self-test: PASS (50 satır, çok-segment STEM POS, lemma paydası, besmele/vakıf/split hizası, ağ yok)');
}

function missingInputs(inputDir) {
  return Object.values(INPUTS).filter((input) => !fs.existsSync(path.join(inputDir, input.file)));
}

function missingMessage(inputDir, missing) {
  const lines = [
    `KAO lexicon: yerel girdi eksik (${path.resolve(inputDir)})`,
    'Dosyaları tarayıcıda resmi kaynaktan indirip bu klasöre koy; araç ağ erişimi yapmaz:'
  ];
  for (const input of missing) {
    lines.push(`- ${input.file}`);
    lines.push(`  kaynak: ${input.url}`);
    lines.push(`  beklenen sha256: ${input.sha256}`);
  }
  lines.push('Ham dosyaları değiştirme ve Git’e ekleme; content/inputs/ ignore kapsamındadır.');
  return lines.join('\n');
}

function readPinnedInput(inputDir, input) {
  const filePath = path.join(inputDir, input.file);
  const buffer = fs.readFileSync(filePath);
  const actual = sha256(buffer);
  if (actual !== input.sha256) {
    throw new CliError(
      `${input.file}: sha256 uyuşmuyor\nbeklenen: ${input.sha256}\ngözlenen: ${actual}\nDosyayı değiştirme; resmi kaynaktan yeniden indir.`,
      3
    );
  }
  return { text: buffer.toString('utf8'), sha256: actual };
}

function compile(inputDir) {
  const missing = missingInputs(inputDir);
  if (missing.length) throw new CliError(missingMessage(inputDir, missing), 2);
  const morphology = readPinnedInput(inputDir, INPUTS.morphology);
  const uthmani = readPinnedInput(inputDir, INPUTS.uthmani);
  const stats = buildStats(morphology.text, uthmani.text, {
    morphology: morphology.sha256,
    uthmani: uthmani.sha256
  });
  fs.mkdirSync(path.dirname(STATS_PATH), { recursive: true });
  fs.writeFileSync(STATS_PATH, `${JSON.stringify(stats, null, 2)}\n`);
  console.log(`KAO lexicon stats: ${path.relative(ROOT, STATS_PATH)}`);
  console.log(`token=${stats.tokenTotal} lemma=${stats.lemmaCount} root=${stats.rootCount} verse=${stats.verseCount}`);
  if (!stats.contractTokenTargetMatch) {
    console.log(`NOT: plan hedefi ${CONTRACT_TOKEN_TARGET}, gözlenen ${stats.tokenTotal}; stats.json ayrımı korur.`);
  }
}

function usage() {
  return [
    'Kullanım:',
    '  node tools/kao-lexicon-build.mjs --self-test',
    '  node tools/kao-lexicon-build.mjs --inputs kuran-ogreniyorum/content/inputs [--stats]'
  ].join('\n');
}

function main(argv) {
  if (argv.includes('--self-test')) {
    if (argv.length !== 1) throw new CliError(`--self-test başka argüman almaz\n${usage()}`, 64);
    selfTest();
    return;
  }
  const inputIndex = argv.indexOf('--inputs');
  if (inputIndex === -1 || !argv[inputIndex + 1] || argv[inputIndex + 1].startsWith('--')) {
    throw new CliError(usage(), 64);
  }
  const allowed = new Set(['--inputs', '--stats', argv[inputIndex + 1]]);
  const unknown = argv.filter((arg) => !allowed.has(arg));
  if (unknown.length) throw new CliError(`Bilinmeyen argüman: ${unknown.join(', ')}\n${usage()}`, 64);
  compile(path.resolve(ROOT, argv[inputIndex + 1]));
}

export { buildStats, bwToArabic, parseMorphology };

const IS_MAIN = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (IS_MAIN) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error && error.message ? error.message : String(error));
    process.exitCode = error instanceof CliError ? error.exitCode : 1;
  }
}
