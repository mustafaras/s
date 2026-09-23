#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STATS_PATH = path.join(ROOT, 'kuran-ogreniyorum', 'evidence', 'KAO-01', 'stats.json');
const CONTRACT_TOKEN_TARGET = 77_430;
const OFFICIAL_RELEASE_WORD_TOTAL = 77_429;

// Tanzil 1.1 Uthmani, comments stripped (see stripTanzilBoilerplate).
// A WHOLE-FILE pin is impossible: the Tanzil copyright block carries a rolling
// year (`Copyright (C) 2007-<current year>`) inside its own verbatim-required
// header, so the same text hashes differently every year. The integrity gate is
// therefore the verse body plus two structural checks (verse count must equal the
// QAC verse count, and every verse line must contain Arabic script).
const UTHMANI_BODY_SHA256 = '7f429d485cb43f0ac78e2830789f6634709725010922c535035a221e531708de';

const INPUTS = Object.freeze({
  morphology: Object.freeze({
    file: 'quranic-corpus-morphology-0.4.txt',
    sha256: 'a1d12923815341face765083805d2148ed2d9f5cc3f7d6665219d887675d8c46',
    url: 'https://corpus.quran.com/download/',
    license: 'GNU GPL; QAC copyright block and attribution must be retained'
  }),
  uthmani: Object.freeze({
    file: 'quran-uthmani.txt',
    bodySha256: UTHMANI_BODY_SHA256,
    url: 'https://tanzil.net/download/',
    download: 'quranType=uthmani · outType=txt · agree=true · alef/marks/sajdah/tatweel açık (Tanzil varsayılanı)',
    license: 'Tanzil terms / CC BY 3.0; verbatim text, attribution and link required',
    note: 'Tam-dosya hash yok (telif bloğu dinamik yıl taşır); kapı = yorumsuz gövde SHA-256 + âyet sayısı + Arapça bütünlüğü'
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

// ---------------------------------------------------------------------------
// KAO-02 candidate-list configuration (03 §9 buckets, 02 §2.1 priority).
// ---------------------------------------------------------------------------

const DRAFT_PATH = path.join(ROOT, 'kuran-ogreniyorum', 'content', 'lexicon.draft.json');
const REVIEW_PATH = path.join(ROOT, 'kuran-ogreniyorum', 'content', 'lexicon.review.md');
const VERIFIED_PATH = path.join(ROOT, 'kuran-ogreniyorum', 'content', 'lexicon.verified.json');
const WORKBOOK_PATH = path.join(ROOT, 'kuran-ogreniyorum', 'content', 'lexicon.workbook.md');
// 06 §2 karar tablosu: "Türkçe mealler (Diyanet, Elmalılı...) — Kopyalanmaz.
// Yalnız insan doğrulayıcının REFERANSI". Bu yüzden ikinci bir kaynak tutulur ve
// üretim paketine (lexicon.verified.json) ASLA girmez; insanın `tr1` yazmasına
// yardımcı bir referanstır. Kaynak: quran.com kelime-kelime API (language=tr),
// kelime başına resmî ses de sağlar (D-08/D-09 için aday).
const REFERENCE_PATH = path.join(ROOT, 'kuran-ogreniyorum', 'content', 'lexicon.reference.json');
const REFERENCE_SOURCE = Object.freeze({
  api: 'https://api.quran.com/api/v4/verses/by_chapter/<n>?words=true&language=tr&word_fields=text_uthmani&per_page=all',
  provider: 'quran.com (Quran.com API v4)',
  wordTranslationLanguage: 'turkish',
  scope: 'reference-only',
  note: 'Doğrulayıcı REFERANSI; kopyalanmaz, üretim paketine girmez (06 §2). Atıf zorunlu.',
  audio: 'her kelime nesnesi audio_url tasir (wbw/<s>_<a>_<w>.mp3) — D-08/D-09 ses hatti icin aday'
});
const DRAFT_REPORT_PATH = path.join(ROOT, 'kuran-ogreniyorum', 'evidence', 'KAO-02', 'draft-report.json');
const CANDIDATE_TARGET = 530;
// 03 §9 reads "sıklık ≤500" as a LEMMA RANK cut-off (bucket D is explicitly
// "sıklık >500 olsa da"), which the corpus measurement confirms: the rank-500
// band yields ~24 such anchor lemmas, matching the plan's "~30".
// Yalnız KOVA ETİKETİ (A) için kullanılır; seçime artık girmez (bkz. rankBand).
const PARTICLE_RANK_MAX = 100;
// 03 §9: "sıklık ≤500" + D kovası (çapa, sıklık>500 olsa da) → toplam ≈530 / %80.
// Ölçüm (2026-09-23): sıra ≤500 (tüm POS) ∪ çapa = 521 lemma / %81,0 → planın
// kendi iki sayısı da TUTUYOR. (Daha önceki 600 değeri, kapsamı POS kapısıyla
// daraltan hatalı bir seçim kuralını telafi ediyordu; kök neden düzeltildi.)
const CONTENT_RANK_MAX = 500;
const MAX_EXAMPLES = 3;
const LEXICON_VERSION = 'quran-lexicon-tr-v1';

// 03 §3 anchor text: al-Fatiha (1:1-7) + al-Ikhlas/al-Falaq/an-Nas (112-114).
const ANCHOR_VERSES = Object.freeze(new Set([
  ...[1, 2, 3, 4, 5, 6, 7].map((ayah) => `1:${ayah}`),
  ...[1, 2, 3, 4].map((ayah) => `112:${ayah}`),
  ...[1, 2, 3, 4, 5].map((ayah) => `113:${ayah}`),
  ...[1, 2, 3, 4, 5, 6].map((ayah) => `114:${ayah}`)
]));

// 03 §3 unit 2 tasbihat. These lemma ids are checked against the corpus at
// runtime (clusterRootDiagnostics); nothing is asserted from memory.
const TESBIHAT_LEMMAS = Object.freeze([
  'suboHa`n', 'Hamod', '>akobar', 'taHiy~ap', 'Salaw`p', 'Tay~ibap',
  'sala`m', 'raHomap', 'baraka`t', 'Eabod', 'rasuwl', '$ahida', '<ila`h'
]);

// 03 §9 bucket A: particles (preposition / pronoun / conjunction / adverb …).
// Content POS (N, V, PN, ADJ) is never bucket A.
const PARTICLE_POS = Object.freeze(new Set([
  'P', 'CONJ', 'SUB', 'NEG', 'PRON', 'REL', 'DEM', 'COND', 'INTG', 'ACC',
  'CERT', 'EXL', 'EXH', 'AVR', 'INC', 'AMD', 'ANS', 'PREV', 'RES', 'RET',
  'PRO', 'LOC', 'T', 'FUT'
]));

const CONTENT_POS = Object.freeze(new Set(['N', 'V', 'PN', 'ADJ']));

// 02 §2.1: priority = 0.55·sıklıkNorm + 0.30·namazMetnindeGeçiyor + 0.15·kognatDeğil
const W_FREQ = 0.55;
const W_ANCHOR = 0.30;
const W_NOT_COGNATE = 0.15;

// 02 §5.7 error taxonomy + R-A5 semantic neighbours. Twelve meaning clusters,
// each keyed by QAC root (Buckwalter). Roots are verified against the corpus and
// any unknown root is reported in clusterRootDiagnostics instead of being assumed.
const SEMANTIC_CLUSTERS = Object.freeze([
  { id: 'KORKU_TAKVA', roots: ['wqy', 'x$y', 'xwf', 'wjl'] },
  { id: 'IMAN_KUFUR', roots: ['Amn', 'kfr', '$rk', 'nfq'] },
  { id: 'ILIM_CEHALET', roots: ['Elm', 'jhl', 'Eql', 'fkr'] },
  { id: 'RAHMET_ZULUM', roots: ['rHm', 'Zlm'] },
  { id: 'HIDAYET_DALALET', roots: ['hdy', 'Dll'] },
  { id: 'AMEL_KARSILIK', roots: ['Eml', 'Ajr', 'E*b', 'Hsb'] },
  { id: 'HAYAT_OLUM', roots: ['Hyy', 'mwt'] },
  { id: 'ALGI_ISITME_GORME', roots: ['smE', 'bSr', 'nZr'] },
  { id: 'NEFIS_KALP', roots: ['nfs', 'rwH', 'qlb'] },
  { id: 'SOZ_EMIR', roots: ['qwl', 'Amr'] },
  { id: 'KULLUK_DUA', roots: ['Ebd', 'dEw', '$kr'] },
  { id: 'SABIR_ITAAT', roots: ['Sbr', 'TwE', 'TEm'] }
]);

// 10-TELAFFUZ §7 — mechanical two-layer transliteration, Buckwalter driven.
// `tr` = Turkish reading (Diyanet style, â î û), `dia` = DİA/İSAM scientific.
// Both are PROPOSALS (`auto:true`); the human verifies or replaces them.
const TRANSLIT_IGNORE = Object.freeze(new Set(['_', '^', '#', '@', '"', '[', ';', ',', '.', '!', '-', '+', '%', ']', 'o']));
const TRANSLIT_TR = Object.freeze({
  "'": '', '|': 'â', '>': '', '&': '', '<': '', '}': '', A: 'â', b: 'b', p: 'e',
  t: 't', v: 's', j: 'c', H: 'h', x: 'h', d: 'd', '*': 'z', r: 'r', z: 'z', s: 's',
  '$': 'ş', S: 's', D: 'd', T: 't', Z: 'z', E: 'ʿ', g: 'g', f: 'f', q: 'k', k: 'k',
  l: 'l', m: 'm', n: 'n', h: 'h', w: 'v', Y: 'î', y: 'y', F: 'en', N: 'un', K: 'in',
  a: 'a', u: 'u', i: 'i', '`': 'â', '{': 'a'
});
const TRANSLIT_DIA = Object.freeze({
  "'": 'ʾ', '|': 'ā', '>': 'ʾ', '&': 'ʾ', '<': 'ʾ', '}': 'ʾ', A: 'ā', b: 'b', p: 't',
  t: 't', v: 's̱', j: 'c', H: 'ḥ', x: 'ḫ', d: 'd', '*': 'ẕ', r: 'r', z: 'z', s: 's',
  '$': 'ş', S: 'ṣ', D: 'ḍ', T: 'ṭ', Z: 'ẓ', E: 'ʿ', g: 'ġ', f: 'f', q: 'ḳ', k: 'k',
  l: 'l', m: 'm', n: 'n', h: 'h', w: 'v', Y: 'ī', y: 'y', F: 'an', N: 'un', K: 'in',
  a: 'a', u: 'u', i: 'i', '`': 'ā', '{': 'a'
});
// Long vowels are handled separately so absorption works (10-TELAFFUZ §7).
// `w`/`y` are only long when NOT followed by sukun (`o`): qawom → kavm, yaquwlu → ...û...
const TRANSLIT_TR_LONG = Object.freeze({ A: 'â', Y: 'î', w: 'û', y: 'î', '|': 'â', '`': 'â' });
const TRANSLIT_DIA_LONG = Object.freeze({ A: 'ā', Y: 'ī', w: 'ū', y: 'ī', '|': 'ā', '`': 'ā' });
// Glides that become consonants before a short vowel/tanwin/sukun; the rest are long.
const GLIDE_LONG = Object.freeze(new Set(['w', 'y']));
// `~` (şedde) de sayılır: şeddeli glide çift ünsüzdür (iyyâ, kuvve).
const GLIDE_CONSONANT_NEXT = Object.freeze(new Set(['a', 'i', 'u', 'F', 'N', 'K', 'o', '~']));
// A dagger alef (`) already carries the long vowel: عَلَىٰ `EalaY` → ʿalâ.
const DAGGER_PAIR = Object.freeze(new Set(['Y', 'y']));
const TR_SHORT_VOWELS = Object.freeze(new Set(['a', 'e', 'u', 'ü', 'i', 'ı']));
const DIA_SHORT_VOWELS = Object.freeze(new Set(['a', 'u', 'i']));

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

function exampleWindow(word, uthmaniByVerse, referenceByRef = new Map()) {
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
  const window = {
    ref,
    word: word.wordIndex,
    startWord: start + 1,
    endWord: end,
    text: verseWords.slice(start, end).join(' ')
  };
  // Referans çevirisi (varsa) AYNI konum aralığından dilimlenir; üretim paketine
  // girmez, yalnız insan doğrulayıcının okumasını hızlandırır (06 §2).
  const referenceWords = referenceByRef.get(ref);
  if (referenceWords) {
    window.referenceTr = referenceWords
      .filter((entry) => entry.position >= window.startWord && entry.position <= window.endWord)
      .map((entry) => entry.tr)
      .filter(Boolean)
      .join(' ');
    const focus = referenceWords.find((entry) => entry.position === word.wordIndex);
    window.referenceWordTr = focus ? focus.tr : null;
  }
  return window;
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
  // Ağ GÜÇLÜ biçimde sınırlanır: `fetch(` yalnız `fetchReference` fonksiyonunda
  // bulunabilir. Böylece türetim yolu (--draft/--workbook/--import-md/--self-test)
  // ağsız kalır (06 §1) ama kaynaklı referans çekimi meşru tek noktadan yapılır.
  // Yorumları sıyır, sonra tara (sıradan bağımsız; self-test kendi metnini eşlemez).
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const fetchCalls = (code.match(/\bfetch\s*\(/g) || []).length;
  assert(/async function fetchReference\(/.test(code),
    'fetchReference fonksiyonu bulunmalı (tek ağ noktası)');
  assert(fetchCalls === 1, `tek fetch çağrısı beklenir, bulunan: ${fetchCalls}`);
  const withoutRefFn = code.replace(/async function fetchReference\([^]*?\n\}/, '');
  assert(!/\bfetch\s*\(/.test(withoutRefFn),
    'fetch yalnız fetchReference içinde olmalı (türetim yolu ağsız kalmalı)');
  assert(!/from\s+['"](?:node:)?https?['"]/.test(source), 'http/https importu bulunmamalı');
  const xhrName = ['XML', 'HttpRequest'].join('');
  assert(!source.includes(xhrName), `${xhrName} bulunmamalı`);

  draftSelfTest();
  const wbFixture = draftFixture();
  const wbParsed = parseMorphology(wbFixture.morphology);
  const wbUthmani = parseUthmani(wbFixture.uthmani, wbParsed.words);
  const wbRef = { words: [
    { ref: '1:1', position: 1, tr: 'REF-AD' }, { ref: '1:1', position: 2, tr: 'REF-ALLAH' },
    { ref: '1:1', position: 3, tr: 'REF-RAHMAN' }, { ref: '1:1', position: 4, tr: 'REF-RAHIM' },
    { ref: '1:1', position: 5, tr: 'REF-HAMD'
    }] };
  workbookSelfTest(lemmaCandidateRecords(wbParsed, wbUthmani.byVerse, {}, new Map(), new Map([['1:1', wbRef.words]])), wbRef);
  console.log('KAO lexicon self-test: PASS (50 satır, çok-segment STEM POS, lemma paydası, besmele/vakıf/split hizası,'
    + ' Tanzil gövde kapısı, taslak kovaları, inceleme turu, ağ yok)');
}

// --- KAO-02 self-tests -----------------------------------------------------

function syntheticVerses(entries) {
  const morphology = ['LOCATION\tFORM\tTAG\tFEATURES'];
  const uthmani = [];
  for (const [ref, words] of entries) {
    const [surah, ayah] = ref.split(':').map(Number);
    const arabic = [];
    words.forEach(([lemma, root, pos], index) => {
      morphology.push(`(${surah}:${ayah}:${index + 1}:1)\t${lemma}\t${pos}\tSTEM|POS:${pos}|LEM:${lemma}|ROOT:${root}`);
      arabic.push(bwToArabic(lemma));
    });
    uthmani.push(arabic.join(' '));
  }
  return { morphology: morphology.join('\n'), uthmani: uthmani.join('\n') };
}

function draftFixture() {
  const anchor = [1, 2, 3, 4, 5, 6, 7].map((ayah) => [`1:${ayah}`, [
    ['Hamod', 'Hmd', 'N'], ['rab~', 'rbb', 'N'], ['{ll~ah', 'Alh', 'PN'],
    ['yawom', 'ywm', 'N'], ['diyn', 'dyn', 'N']
  ]]);
  const rest = [
    ['2:1', [['min', 'min', 'P'], ['kitaAb', 'ktb', 'N'], ['qawom', 'qwm', 'N'], ['Ealima', 'Elm', 'V']]],
    ['2:2', [['min', 'min', 'P'], ['kitaAb', 'ktb', 'N'], ['qawom', 'qwm', 'N'], ['Ealima', 'Elm', 'V']]],
    ['2:3', [['<in~', '<n', 'SUB'], ['kataba', 'ktb', 'V'], ['>aroD', 'ArD', 'N'], ['Ealima', 'Elm', 'V'], ['Eal~ama', 'Elm', 'V']]]
  ];
  return syntheticVerses([...anchor, ...rest]);
}

function draftSelfTest() {
  const fixture = draftFixture();

  // 1 · Tanzil boilerplate gate (comments are not part of the pinned body)
  const raw = '# (C) 2007-2026 Tanzil\r\n# link\r\n' + bwToArabic('bisomi') + '\r\n' + bwToArabic('Hamodu') + '\r\n';
  const body = stripTanzilBoilerplate(raw);
  assert(!body.includes('#'), 'telif bloğu gövdeden çıkarılmalı');
  assert(!body.includes('\r'), 'CRLF normalize edilmeli');
  assert(body === `${bwToArabic('bisomi')}\n${bwToArabic('Hamodu')}`, 'gövde yalnız âyet satırlarını içermeli');

  // 2 · structural gate
  assert(tanzilStructuralMismatch(body, 2) === null, 'iki âyet iki satırla eşleşmeli');
  assert(tanzilStructuralMismatch(body, 3) !== null, 'âyet sayısı uyuşmazlığı yakalanmalı');
  assert(tanzilStructuralMismatch('NOT ARABIC\nNOT ARABIC', 2) !== null, 'Arapça olmayan gövde reddedilmeli');

  // 3 · transliteration is mechanical, deterministic and two-layer
  assert(transliterate('Hamod', TRANSLIT_TR, TRANSLIT_TR_LONG, TR_SHORT_VOWELS) === 'hamd', 'okunuş katmanı tablo üzerinden üretilmeli');
  const maA = 'maA';
  assert(transliterate(maA, TRANSLIT_TR, TRANSLIT_TR_LONG, TR_SHORT_VOWELS) === 'mâ', 'uzun ünlü önceki kısa ünlüyü soğurmalı');
  assert(transliterate('EalaY`', TRANSLIT_TR, TRANSLIT_TR_LONG, TR_SHORT_VOWELS) === 'ʿalâ',
    'hançer elifi (Y`) tek uzun ünlü üretmeli');
  assert(transliterate('<in~', TRANSLIT_TR, TRANSLIT_TR_LONG, TR_SHORT_VOWELS) === 'inn',
    'şedde (ّ) önceki harfi ikilemeli');
  assert(transliterate('{ll~ah', TRANSLIT_TR, TRANSLIT_TR_LONG, TR_SHORT_VOWELS) === 'allah',
    'Buckwalter geminate zaten yazılıysa şedde üçlemez (alllah -> allah)');
  assert(translitTr('<iy~aA') === 'iyyâ',
    'şeddeli glide çift ünsüz okunur (iyyâ; îîâ değil)');
  assert(translitTr('r~aHoma`n') === 'rahmân',
    'Türkçe okunuşta belirteç assimilasyonu yazılmaz (rrahmân -> rahmân)');
  assert(transliterate('yawom', TRANSLIT_TR, TRANSLIT_TR_LONG, TR_SHORT_VOWELS) === 'yavm',
    'sözcük başı/ünlü öncesi y (ya) ünsüz kalmalı');
  assert(transliterate('yaquwlu', TRANSLIT_TR, TRANSLIT_TR_LONG, TR_SHORT_VOWELS).includes('û'),
    'ünsüz öncesi w uzun û üretmeli');
  assert(transliterate('o~', TRANSLIT_TR, TRANSLIT_TR_LONG, TR_SHORT_VOWELS) === '', 'yalnız hareke/şedde taşıyan girdi boş dizge üretmeli');
  assert(transliterate('maA', TRANSLIT_TR, TRANSLIT_TR_LONG, TR_SHORT_VOWELS) !== transliterate('maA', TRANSLIT_DIA, TRANSLIT_DIA_LONG, DIA_SHORT_VOWELS),
    'okunuş ve DİA katmanları ayrışmalı');

  // 4 · draft: buckets, no verification, coverage, family/cluster proposals
  const parsed = parseMorphology(fixture.morphology);
  const uthmani = parseUthmani(fixture.uthmani, parsed.words);
  const draft = lemmaCandidateRecords(parsed, uthmani.byVerse, {});
  const markdown = renderReviewMarkdown(draft);
  const firstId = draft.candidates[0].lemmaId;
  const secondId = draft.candidates[1].lemmaId;
  const fill = (text, id, values) => text.split('\n').map((line) => {
    if (!line.startsWith(`| ${id} |`)) return line;
    const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
    for (const [key, value] of Object.entries(values)) cells[REVIEW_HEADER.indexOf(key)] = value;
    return `| ${cells.join(' | ')} |`;
  }).join('\n');
  const byLemma = new Map(draft.candidates.map((record) => [record.lemmaBw, record]));
  const buckets = new Map(draft.candidates.map((record) => [record.lemmaBw, record.bucket]));
  assert(buckets.get('Hamod') === 'D', 'çapa metin kelimesi D kovasında olmalı');
  assert(buckets.get('min') === 'A' || buckets.get('<in~') === 'A', 'çapa dışı parçacık A kovasında olmalı');
  assert(!draft.candidates.some((record) => record.bucket === 'B'), 'kognat yokken B kovası boş olmalı');
  const cognateProbe = JSON.parse(JSON.stringify(draft.candidates));
  cognateProbe[0].cognateTr = 'örnek kognat';
  assert(cognateProbe[0].bucket !== 'B', 'kova etiketi taslakta üretilir, elle değiştirilmez');
  assert(draft.candidates.every((record) => record.verified === false), 'hiçbir taslak satırı doğrulanmış olmamalı');
  assert(draft.candidates.every((record) => record.tr1 === null && record.cognateTr === null),
    'Türkçe anlam alanları taslakta boş olmalı (insan yazar)');
  assert(draft.candidates.every((record) => record.translit.tr && record.translit.dia && record.translit.auto === true),
    'transliterasyon önerisi iki katmanlı ve auto işaretli olmalı');
  assert(draft.candidates.every((record) => !arabicWordRegex().test(record.lemmaBw) && arabicWordRegex().test(record.ar)),
    'lemmaBw ASCII, ar Arapça olmalı');
  assert(draft.candidates.every((record) => record.examples.length >= 1 && record.examples.every((e) => e.tr === null)),
    'örnek pencere korpustan gelmeli, çevirisi boş olmalı');
  assert(draft.report.verifiedTotal === 0, 'rapor doğrulanmış satır 0 bildirmeli');
  assert(draft.report.userTaskPending === true, 'kart kullanıcı görevi beklemeli');
  assert(typeof draft.report.coverage.ratioLemPool === 'number' && draft.report.coverage.goal === 0.80,
    'kapsam raporu LEM havuzu paydasını ve hedefi taşımalı');
  assert(draft.report.coverage.goalMet === (draft.report.coverage.ratioLemPool >= 0.80),
    'goalMet ölçümle tutarlı olmalı');
  // Regresyon: seçim kuralı POS'a bağlı OLMAMALI. Sıra ≤500'deki her lemma
  // (çapa/tesbihat fark etmeksizin) aday listesinde bulunmalı. Aksi halde
  // <il~aA (sıra 15) gibi yüksek sıklıklı işlev kelimeleri sessizce düşer.
  assert(draft.candidates.every((record) => record.rank <= CONTENT_RANK_MAX
    || record.anchorText || record.tesbihat),
    "seçim POS'a bağlı olmamalı: sıra<=cutoff her lemma aday olmalı");
  assert(draft.report.selectionRule.contentRankMax === CONTENT_RANK_MAX
    && draft.report.selectionRule.particleRankMax === PARTICLE_RANK_MAX,
    'seçim kuralı 03 §9 sıra eşiklerini raporlamalı');
  assert(draft.report.candidateTotal === draft.candidates.length, 'aday sayısı raporla eşleşmeli');
  assert(draft.report.coverage.alternatives.length > 0, 'kapsam alternatifleri raporlanmalı');
  assert(draft.report.exampleStats.rowsWithFewerThanMinimum
    === draft.candidates.filter((record) => record.examples.length < 3).length,
    'örnek eksiği sayısı ölçümle tutarlı olmalı');
  assert(draft.candidates.filter((record) => record.examples.length < 3)
    .every((record) => record.examplesException && record.examplesException.reason === 'corpus_windows_exhausted'),
    'eksik örnekler gerekçeli istisna kaydı taşımalı (uydurma yok)');
  const hamod = byLemma.get('Hamod');
  assert(hamod.anchorText === true, 'çapa bayrağı işaretlenmeli');
  const ealima = byLemma.get('Ealima');
  assert(ealima.semNeighbors.sameRoot.includes(lemmaKey('Eal~ama')),
    'aynı kökten türevler komşu önerisine girmeli');
  assert(ealima.family.some((entry) => entry.lemmaId === lemmaKey('Eal~ama') && arabicWordRegex().test(entry.ar)),
    'aile listesi kimlik ve Arapça biçim taşımalı');
  // Buckwalter 'i'/'a' iki farklı harfi temsil eder → kimlikler çakışmamalı
  assert(draft.candidates.every((record) => !record.family.some((f) => f.lemmaId === record.lemmaId)),
    'aile girdisi kendi kimliğini taşımamalı (self-reference)');
  assert(lemmaKey('in') !== lemmaKey('<in~') && lemmaSlug('in') === lemmaSlug('<in~'),
    'slug çakışsa bile kimlik benzersiz olmalı');
  assert(ealima.semNeighbors.proposed === true, 'komşu önerisi proposed olmalı');
  assert(draft.report.clusterRootDiagnostics.length === SEMANTIC_CLUSTERS.flatMap((c) => c.roots).length,
    'her anlam kümesi kökü için tanı kaydı olmalı');
  assert(draft.candidates.every((record) => record.bucket === 'D' || record.rank <= CONTENT_RANK_MAX),
    'D dışındaki adaylar içerik sıra eşiğinde olmalı');
  assert(draft.candidates.every((record) => record.bucket !== 'A' || record.rank <= PARTICLE_RANK_MAX),
    'A kovası yalnız parçacık sıra eşiğinde olmalı');
  assert(draft.report.clusterRootDiagnostics.every((entry) => typeof entry.known === 'boolean'),
    'kök tanısı known alanı taşımalı');

  // 4b · unique ids + 3-example review columns + dedupe guard
  const ids = draft.candidates.map((record) => record.lemmaId);
  assert(new Set(ids).size === ids.length, 'tüm lemma kimlikleri benzersiz olmalı');
  assert(REVIEW_HEADER.includes('ex3_ref') && REVIEW_HEADER.includes('verifiedAt'),
    'inceleme tablosu 05 §1 üç örnek sütununu ve verifiedAt taşımalı');
  const reviewRow = renderReviewMarkdown(draft).split('\n').find((line) => line.startsWith(`| ${REVIEW_HEADER[0]}`));
  assert(reviewRow.split('|').length - 2 === REVIEW_HEADER.length,
    'başlık hücresi sayısı sütun sayısına eşit olmalı');
  const firstRow = renderReviewMarkdown(draft).split('\n').filter((line) => line.startsWith('| l_'))[0];
  assert(firstRow.split('|').length - 2 === REVIEW_HEADER.length,
    'veri satırı hücre sayısı sütun sayısına eşit olmalı (kayma yok)');
  const dupProbe = parseReviewMarkdown('', [...draft.candidates, ...draft.candidates]);
  assert(dupProbe.duplicated.length === draft.candidates.length,
    'yinelenen lemmaId sessizce eşleştirilmemeli, raporlanmalı');

  // 4c · human work must survive a re-draft (06 §3) — injected, so hermetic
  const humanMap = new Map([['Hamod', { tr: 'rahmet', shift: 'kayma', pattern: 'masdar',
    tr1: 'hamd', tr2: null, verifiedBy: 'insan-1', verifiedAt: '2026-09-20', exampleTr: ['insan çevirisi'] }]]);
  const carried = lemmaCandidateRecords(parseMorphology(fixture.morphology), uthmani.byVerse, {}, humanMap);
  const carriedHamod = carried.candidates.find((record) => record.lemmaBw === 'Hamod');
  assert(carriedHamod.tr1 === 'hamd' && carriedHamod.cognateTr === 'rahmet'
    && carriedHamod.pattern === 'masdar' && carriedHamod.verified === true
    && carriedHamod.verifiedAt === '2026-09-20',
    'insan girdisi (anlam/kognat/kalıp/doğrulama) yeniden taslakta korunmalı');
  assert(carriedHamod.examples[0].tr === 'insan çevirisi', 'örnek çevirisi korunmalı');
  assert(carriedHamod.lemmaId === draft.candidates.find((r) => r.lemmaBw === 'Hamod').lemmaId,
    'kimlikler yeniden üretimde kararlı olmalı');

  // 4d · two-gaze approval rule is machine-verifiable (06 §3)
  assert(parseApprovalDates('insan-1 (2026-09-23; 2026-09-24)').twoDayOk === true,
    'iki ayrı gün kaydı tanınmalı');
  assert(parseApprovalDates('2026-09-23').satisfiesTwoGazeRule === false,
    'tek tarih iki-göz kuralını karşılamaz');
  assert(parseApprovalDates('2026-09-23; 2026-09-23').twoDayOk === false,
    'aynı gün iki kez yazılsa da iki ayrı gün sayılmaz');
  assert(parseApprovalDates('').dates.length === 0, 'tarihsiz onay kaydı boş dönmeli');
  // doğrulanmış + eksik örnek çevirisi tutarsızlık olarak yakalanmalı
  const consProbe = parseReviewMarkdown(
    fill(fill(markdown, firstId, { tr1: 'anlam', verifiedBy: 'insan-1', verifiedAt: '2026-09-23' }),
      secondId, { tr1: 'anlam2', verifiedBy: 'insan-2', verifiedAt: '2026-09-23' }),
    JSON.parse(JSON.stringify(draft.candidates))
  );
  assert(consProbe.consistencyTotal > 0, 'doğrulanmış satırda eksik örnek çevirisi tutarsızlık olmalı');
  assert(consProbe.consistency.every((entry) => entry.issue && entry.lemmaId), 'tutarsızlık kaydı kimlik+neden taşımalı');

  // 5 · determinism (same inputs → byte-identical output)
  const again = lemmaCandidateRecords(parseMorphology(fixture.morphology), uthmani.byVerse, {});
  assert(JSON.stringify(again.candidates) === JSON.stringify(draft.candidates), 'taslak deterministik olmalı');

  // 6 · review round-trip and verification gating (06 §3)
  // Sütun ADINA göre doldur (indeks/regex kırılganlığı yok; sütun eklenmesi testi bozmaz).
  let filled = fill(markdown, firstId, { tr1: 'birinci anlam', verifiedBy: 'insan-1' });
  filled = fill(filled, secondId, { tr1: 'ikinci anlam', verifiedBy: 'insan-2' });
  const parsedReview = parseReviewMarkdown(filled, JSON.parse(JSON.stringify(draft.candidates)));
  assert(parsedReview.unknownTotal === 0, 'bilinmeyen lemmaId olmamalı');
  assert(parsedReview.duplicated.length === 0, 'normal turda yinelenen kimlik olmamalı');
  assert(parsedReview.verifiedTotal === 2, 'tr1 + verifiedBy doldurulunca satırlar doğrulanmalı');
  const firstVerified = parsedReview.records.find((record) => record.lemmaId === firstId);
  assert(firstVerified.verified === true && firstVerified.verifiedAt, 'doğrulanan satıra tarih yazılmalı');
  assert(firstVerified.tr1 === 'birinci anlam', 'tr1 tablodan içe alınmalı');
  const dated = fill(markdown, firstId, { verifiedBy: 'insan-1', verifiedAt: '2026-09-20' });
  const datedParsed = parseReviewMarkdown(dated, JSON.parse(JSON.stringify(draft.candidates)));
  assert(datedParsed.records.find((r) => r.lemmaId === firstId).verifiedAt === '2026-09-20',
    'tabloda girilen doğrulama tarihi korunmalı (06 §3 iki ayrı gün kuralı)');
  // 06 §2 bekçisi: referansı birebir kopyalayan tr1 doğrulanmış SAYILMAZ.
  const refWord = draft.candidates[0].examples[0] && draft.candidates[0].examples[0].referenceWordTr;
  if (refWord) {
    const copied = fill(markdown, firstId, { tr1: refWord, verifiedBy: 'insan-1' });
    const copiedParsed = parseReviewMarkdown(copied, JSON.parse(JSON.stringify(draft.candidates)));
    const copiedRecord = copiedParsed.records.find((r) => r.lemmaId === firstId);
    assert(copiedRecord.copiedFromReference === true && copiedRecord.verified === false,
      'referansı kopyalayan tr1 doğrulanmış sayılmamalı (06 §2)');
    assert(copiedParsed.copiedFromReferenceTotal === 1,
      'kopya sayısı raporlanmalı');
  }
  const onlyBy = fill(markdown, firstId, { verifiedBy: 'insan-1' });
  const byOnly = parseReviewMarkdown(onlyBy, JSON.parse(JSON.stringify(draft.candidates)));
  assert(byOnly.verifiedTotal === 0, 'Türkçe anlam olmadan verifiedBy doğrulamaz');
  const unknown = parseReviewMarkdown(`| ${REVIEW_HEADER.join(' | ')} |\n| x |`, []);
  assert(unknown.unknownTotal === 0, 'eksik satır sessizce atlanmalı (kısa satır)');
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
    if (input.sha256) lines.push(`  beklenen sha256: ${input.sha256}`);
    else lines.push(`  beklenen gövde sha256: ${input.bodySha256} (telif bloğu hariç)`);
    if (input.download) lines.push(`  indirme: ${input.download}`);
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

// Tanzil ships its verbatim-only copyright block as leading `#` lines that carry
// a rolling copyright year. Integrity is checked on the verse body only.
function stripTanzilBoilerplate(text) {
  return text.replace(/\r\n/g, '\n').split('\n')
    .filter((line) => !line.startsWith('#'))
    .join('\n').trim();
}

function tanzilStructuralMismatch(text, expectedVerseTotal) {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  const lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean);
  const bodyLines = lines.filter((line) => !line.startsWith('#'));
  if (bodyLines.length !== expectedVerseTotal) {
    return `Tanzil âyet satırı sayısı ${bodyLines.length}; QAC âyet sayısı ${expectedVerseTotal} ile eşleşmiyor`;
  }
  const badIndex = bodyLines.findIndex((line) => !/[\u0600-\u06FF]/u.test(line));
  if (badIndex !== -1) {
    return `Tanzil ${badIndex + 1}. veri satırında Arapça yazı yok (bozuk indirme veya HTML gövdesi)`;
  }
  return null;
}

function readUthmaniInput(inputDir, expectedVerseTotal) {
  const input = INPUTS.uthmani;
  const filePath = path.join(inputDir, input.file);
  const buffer = fs.readFileSync(filePath);
  const text = buffer.toString('utf8');
  const body = stripTanzilBoilerplate(text);
  const bodyHash = sha256(Buffer.from(body, 'utf8'));
  if (bodyHash !== input.bodySha256) {
    throw new CliError(
      `${input.file}: gövde sha256 uyuşmuyor\nbeklenen: ${input.bodySha256}\ngözlenen: ${bodyHash}\n`
      + `İndirme: ${input.download}\nTelif bloğu (#'li satırlar) hash'e katılmaz.`,
      3
    );
  }
  const structural = tanzilStructuralMismatch(text, expectedVerseTotal);
  if (structural) throw new CliError(`${input.file}: ${structural}\nBeklenen âyet: ${expectedVerseTotal}`, 3);
  return { text, sha256: sha256(buffer), bodySha256: bodyHash };
}

function compile(inputDir) {
  const missing = missingInputs(inputDir);
  if (missing.length) throw new CliError(missingMessage(inputDir, missing), 2);
  const morphology = readPinnedInput(inputDir, INPUTS.morphology);
  const parsed = parseMorphology(morphology.text);
  const expectedVerseTotal = new Set(parsed.words.map((word) => `${word.surah}:${word.ayah}`)).size;
  const uthmani = readUthmaniInput(inputDir, expectedVerseTotal);
  const stats = buildStats(morphology.text, uthmani.text, {
    morphology: morphology.sha256,
    uthmani: uthmani.sha256,
    uthmaniBodySha256: uthmani.bodySha256
  });
  fs.mkdirSync(path.dirname(STATS_PATH), { recursive: true });
  fs.writeFileSync(STATS_PATH, `${JSON.stringify(stats, null, 2)}\n`);
  console.log(`KAO lexicon stats: ${path.relative(ROOT, STATS_PATH)}`);
  console.log(`token=${stats.tokenTotal} lemma=${stats.lemmaCount} root=${stats.rootCount} verse=${stats.verseCount}`);
  if (!stats.contractTokenTargetMatch) {
    console.log(`NOT: plan hedefi ${CONTRACT_TOKEN_TARGET}, gözlenen ${stats.tokenTotal}; stats.json ayrımı korur.`);
  }
}

// ---------------------------------------------------------------------------
// KAO-02 — candidate list, cognate/neighbour proposal, review table
// ---------------------------------------------------------------------------

function arabicWordRegex() { return /[\u0600-\u06FF]/u; }

function transliterate(lemmaBw, table, longTable, shortSet) {
  const characters = Array.from(lemmaBw || '');
  const out = [];
  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    if (character === '~') { // şedde
      // Buckwalter geminate harfi bazen ZATEN iki kez yazar (`{ll~ah`). Bu durumda
      // tekrar ikilemeyiz (alllah -> allah). Diğer durumda ikiler (rab~ -> rabb).
      const prevBase = characters.slice(0, index).reverse()
        .find((c) => !TRANSLIT_IGNORE.has(c) && c !== '~');
      const beforePrevBase = characters.slice(0, index).reverse()
        .filter((c) => !TRANSLIT_IGNORE.has(c) && c !== '~')[1];
      const alreadyWritten = prevBase && beforePrevBase && prevBase === beforePrevBase;
      if (out.length && !alreadyWritten) out.push(out[out.length - 1]);
      continue;
    }
    if (TRANSLIT_IGNORE.has(character)) continue;
    const next = characters[index + 1];
    const long = longTable[character];
    const glideIsConsonant = GLIDE_LONG.has(character) && GLIDE_CONSONANT_NEXT.has(next);
    const daggerHandlesIt = DAGGER_PAIR.has(character) && next === '`';
    if (long && daggerHandlesIt) {
      // hançer elifi (`) uzun ünlüyü kendisi verir: Y` → tek â
      continue;
    }
    if (long && !glideIsConsonant) {
      // uzun ünlü kendinden önceki kısa ünlüyü soğurur (maA → mâ); ikilenmez
      if (out.length && shortSet.has(out[out.length - 1])) out.pop();
      if (out[out.length - 1] === long) continue;
      out.push(long);
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(table, character)) out.push(table[character]);
  }
  return out.join('');
}

function translitTr(lemmaBw) {
  const raw = transliterate(lemmaBw, TRANSLIT_TR, TRANSLIT_TR_LONG, TR_SHORT_VOWELS);
  // Türkçe okunuş imlâsı assimilasyonu yazmaz: baştaki çift ünsüzü teke indirir
  // (Diyanet: "Rahman", "Samad" — "RRahman" değil). DİA katmanı ham kalır.
  return raw.replace(/^([bcçdfgğhjklmnprsştvyz])\1/u, '$1');
}
function translitDia(lemmaBw) { return transliterate(lemmaBw, TRANSLIT_DIA, TRANSLIT_DIA_LONG, DIA_SHORT_VOWELS); }

function lemmaSlug(lemmaBw) {
  return String(lemmaBw || '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'lem';
}

// Buckwalter uses the same ASCII letter for different Arabic letters ('i' = kesra
// AND <in~; 'a' = fetha AND >an~), so a slug-only id collides. The suffix is a
// short deterministic hash of the FULL Buckwalter lemma, which keeps ids stable
// across runs while guaranteeing uniqueness (05 §2: card ids depend on lemmaId).
function shortHash(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex').slice(0, 6);
}

function lemmaKey(lemmaBw) { return `l_${lemmaSlug(lemmaBw)}_${shortHash(lemmaBw)}`; }

// ---------------------------------------------------------------------------
// Referans katmanı (yalnız insan doğrulayıcı için; üretim paketine girmez)
// ---------------------------------------------------------------------------
function readReference() {
  if (!fs.existsSync(REFERENCE_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(REFERENCE_PATH, 'utf8'));
  } catch {
    return null;
  }
}

// Sûre listesini (varsayılan: çapa + tesbihat sûreleri) quran.com API'sinden
// çeker. TEK AĞ NOKTASI: bu fonksiyon; derleyicinin geri kalanı ağsızdır ve
// self-test/`--draft` ağa çıkmaz.
// Varsayılan: TÜM Kur'an (1..114). Sözlükteki 524 aday kelime Kur'an'ın her
// yerine dağılmıştır; insan doğrulayıcının her satırda referansı olmalı (06 §2).
// Küçük bir alt küme için KAO_REFERENCE_CHAPTERS ortam değişkeni kullanılabilir.
function referenceChapters() {
  const override = process.env.KAO_REFERENCE_CHAPTERS;
  if (override) {
    return [...new Set(override.split(',').map((n) => Number(n.trim())).filter((n) => n >= 1 && n <= 114))]
      .sort((a, b) => a - b);
  }
  return Array.from({ length: 114 }, (_, i) => i + 1);
}

async function fetchReference(chapter) {
  const url = REFERENCE_SOURCE.api.replace('<n>', String(chapter));
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new CliError(`referans indirilemedi (${chapter}): HTTP ${response.status}`, 2);
  const body = await response.json();
  const words = [];
  for (const verse of body.verses || []) {
    for (const word of verse.words || []) {
      if (word.char_type_name !== 'word') continue;
      words.push({
        ref: `${verse.chapter_id ?? chapter}:${verse.verse_number}`,
        position: word.position,
        ar: word.text_uthmani || null,
        tr: (word.translation && word.translation.text) || null,
        trLanguage: (word.translation && word.translation.language_name) || null,
        translit: (word.transliteration && word.transliteration.text) || null,
        audio: word.audio_url || null
      });
    }
  }
  return words;
}

async function writeReference() {
  const chapters = referenceChapters();
  const words = [];
  const failures = [];
  for (const chapter of chapters) {
    try {
      const fetched = await fetchReference(chapter);
      words.push(...fetched);
      if (chapters.length <= 10 || chapter % 10 === 0) {
        console.log(`  sûre ${chapter}/${chapters.length}: +${fetched.length} kelime (toplam ${words.length})`);
      }
    } catch (error) {
      failures.push({ chapter, error: String(error && error.message ? error.message : error) });
    }
    // Kaynağa kibar davran: ardışık istekler arasında kısa bekleme.
    await new Promise((resolve) => { setTimeout(resolve, 120); });
  }
  if (failures.length) {
    console.log(`WARN ${failures.length} sûre indirilemedi: ${failures.slice(0, 5).map((f) => f.chapter).join(', ')}`);
  }
  const payload = {
    schemaVersion: 1,
    fetchedAt: new Date().toISOString().slice(0, 10),
    source: REFERENCE_SOURCE,
    chapterTotal: chapters.length,
    chapterFailed: failures.map((f) => f.chapter),
    wordTotal: words.length,
    words
  };
  fs.mkdirSync(path.dirname(REFERENCE_PATH), { recursive: true });
  fs.writeFileSync(REFERENCE_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`KAO reference: ${path.relative(ROOT, REFERENCE_PATH)} (${words.length} kelime)`);
  console.log(`  kaynak: ${REFERENCE_SOURCE.provider} · dil=${REFERENCE_SOURCE.wordTranslationLanguage}`);
}

function countLemmaMap(parsed) {
  const frequency = new Map();
  const positions = new Map();
  const roots = new Map();
  const pos = new Map();
  const anchor = new Set();
  const examples = new Map();
  for (const word of parsed.words) {
    if (word.lemmaSource !== 'LEM') continue;
    const lemma = word.lemmaBw;
    frequency.set(lemma, (frequency.get(lemma) || 0) + 1);
    if (!positions.has(lemma)) positions.set(lemma, []);
    if (positions.get(lemma).length < MAX_EXAMPLES) {
      positions.get(lemma).push(word);
    }
    if (word.rootBw) roots.set(lemma, word.rootBw);
    pos.set(lemma, word.pos || 'UNKNOWN');
    if (ANCHOR_VERSES.has(`${word.surah}:${word.ayah}`)) anchor.add(lemma);
  }
  return { frequency, positions, roots, pos, anchor, examples };
}

function rootLemmaIndex(counts) {
  const index = new Map();
  for (const [lemma, rootBw] of counts.roots) {
    if (!rootBw) continue;
    if (!index.has(rootBw)) index.set(rootBw, []);
    index.get(rootBw).push(lemma);
  }
  return index;
}

function semanticClusters(counts, rootIndex) {
  const diagnostics = [];
  const lemmaClusters = new Map();
  for (const cluster of SEMANTIC_CLUSTERS) {
    const members = [];
    for (const rootBw of cluster.roots) {
      const lemmas = rootIndex.get(rootBw);
      if (!lemmas) {
        diagnostics.push({ cluster: cluster.id, rootBw, known: false });
        continue;
      }
      diagnostics.push({ cluster: cluster.id, rootBw, known: true, lemmaCount: lemmas.length });
      members.push(...lemmas);
    }
    for (const lemma of members) {
      if (!lemmaClusters.has(lemma)) lemmaClusters.set(lemma, []);
      lemmaClusters.get(lemma).push(cluster.id);
    }
  }
  return { lemmaClusters, diagnostics };
}

// Human-owned fields must survive a --draft re-run, otherwise re-generating the
// draft destroys KAO-03 work (06 §3: humans write meanings, cognates, examples).
function readExistingHumanInput() {
  const carried = new Map();
  if (!fs.existsSync(DRAFT_PATH)) return carried;
  try {
    const previous = JSON.parse(fs.readFileSync(DRAFT_PATH, 'utf8'));
    for (const lemma of previous.lemmas || []) {
      const exampleTr = (lemma.examples || []).map((example) => (example ? example.tr : null) || null);
      const hasWork = lemma.cognateTr || lemma.tr1 || lemma.pattern
        || lemma.verifiedBy || exampleTr.some(Boolean);
      if (!hasWork) continue;
      carried.set(lemma.lemmaBw, {
        tr: lemma.cognateTr || null,
        shift: lemma.cognateShift || null,
        pattern: lemma.pattern || null,
        tr1: lemma.tr1 || null,
        tr2: lemma.tr2 || null,
        verifiedBy: lemma.verifiedBy || null,
        verifiedAt: lemma.verifiedAt || null,
        approval: lemma.approval || null,
        examplesException: lemma.examplesException || null,
        exampleTr
      });
    }
  } catch { /* bozuk taslak: insan verisi taşınmaz, taslak yeniden üretilir */
  }
  return carried;
}

// Pure core: no file IO. Human-owned fields arrive as a parameter so tests remain
// hermetic and a re-draft cannot silently reach into the repository.
function lemmaCandidateRecords(parsed, uthmaniByVerse, sourceHashes, humanByLemma = new Map(), referenceByRef = new Map()) {
  const counts = countLemmaMap(parsed);
  const maxFrequency = Math.max(...counts.frequency.values());
  const rank = new Map([...counts.frequency.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([lemma], index) => [lemma, index + 1]));
  const rootIndex = rootLemmaIndex(counts);
  const clusters = semanticClusters(counts, rootIndex);
  const tesbihatPresent = new Set(TESBIHAT_LEMMAS.filter((lemma) => counts.frequency.has(lemma)));
  const candidates = [];
  // 03 §9 literally: "Sıklık ≤500" (POS'tan bağımsız) + "D: çapa metin kelimeleri
  // (sıklık >500 olsa da)". Ölçüm: sıra ≤500 (tüm POS) ∪ çapa = 521 lemma / %81,0,
  // planın kendi sayılarıyla (≈530 lemma, %80) uyuşur. POS kapısı 21 yüksek
  // sıklıklı lemma dışarıda bırakıyordu (<il~aA: sıra 15).
  const rankBand = (cutoff) => {
    const band = new Set();
    for (const lemma of counts.frequency.keys()) {
      if (rank.get(lemma) <= cutoff) band.add(lemma);
    }
    for (const lemma of counts.frequency.keys()) {
      if (counts.anchor.has(lemma) || tesbihatPresent.has(lemma)) band.add(lemma);
    }
    return band;
  };
  const eligible = rankBand(CONTENT_RANK_MAX);
  for (const [lemma, frequency] of counts.frequency) {
    if (!eligible.has(lemma)) continue;
    const pos = counts.pos.get(lemma) || 'UNKNOWN';
    const isAnchor = counts.anchor.has(lemma) || tesbihatPresent.has(lemma);
    const isCognate = Boolean(humanByLemma.get(lemma));
    const isParticle = PARTICLE_POS.has(pos) && rank.get(lemma) <= PARTICLE_RANK_MAX;
    const priority = W_FREQ * (frequency / maxFrequency)
      + W_ANCHOR * (isAnchor ? 1 : 0)
      + W_NOT_COGNATE * (isCognate ? 0 : 1);
    const human = humanByLemma.get(lemma) || null;
    const rootBw = counts.roots.get(lemma) || null;
    const family = rootBw ? (rootIndex.get(rootBw) || []).filter((other) => other !== lemma) : [];
    const examples = [];
    for (const word of counts.positions.get(lemma) || []) {
      const window = exampleWindow(word, uthmaniByVerse, referenceByRef);
      if (window) {
        const priorTr = human && human.exampleTr ? human.exampleTr[examples.length] : null;
        examples.push({
          ar: window.text,
          tr: priorTr || null,
          ref: window.ref,
          referenceTr: window.referenceTr || null,
          referenceWordTr: window.referenceWordTr || null
        });
      }
    }
    // freq 1–2 lemma korpusta yalnız 1 pencere verebilir. 05 §1'in ">=3 örnek"
    // kuralı için iki seçenek var: eksikliği uydurmak (yasak) ya da gerekçeli
    // istisna kaydı. İstisna açıkça işaretlenir; denetim bu kaydı görür.
    const examplesException = examples.length < 3
      ? { reason: 'corpus_windows_exhausted', freq: frequency, have: examples.length, want: 3 }
      : null;
    candidates.push({
      lemmaId: lemmaKey(lemma),
      lemmaBw: lemma,
      ar: bwToArabic(lemma),
      translit: { tr: translitTr(lemma), dia: translitDia(lemma), auto: true },
      tr1: human ? human.tr1 : null,
      tr2: human ? human.tr2 : null,
      root: rootBw ? bwToArabic(rootBw) : null,
      rootBw,
      pattern: human ? human.pattern : null,
      pos,
      freq: frequency,
      rank: rank.get(lemma),
      anchorText: counts.anchor.has(lemma),
      tesbihat: tesbihatPresent.has(lemma),
      cognateTr: human ? human.tr : null,
      cognateShift: human ? human.shift : null,
      cognate: { proposed: Boolean(human), pattern: human ? human.pattern : null, derivatives: [] },
      semNeighbors: {
        proposed: true,
        clusters: clusters.lemmaClusters.get(lemma) || [],
        sameRoot: family.map((other) => lemmaKey(other)),
        sameRootAr: family.map((other) => bwToArabic(other))
      },
      family: family.map((other) => ({ lemmaId: lemmaKey(other), ar: bwToArabic(other), tr: null })),
      examples,
      examplesException: human && human.examplesException ? human.examplesException : examplesException,
      examplesRef: examples.map((example) => example.ref),
      isParticle,
      bucket: null,
      priority: Number(priority.toFixed(6)),
      verified: Boolean(human && human.verifiedBy && human.tr1),
      verifiedBy: human ? human.verifiedBy : null,
      verifiedAt: human ? human.verifiedAt : null,
      approval: human && human.approval ? human.approval : null,
    });
  }

  candidates.sort((left, right) => (
    left.rank - right.rank || left.lemmaBw.localeCompare(right.lemmaBw)
  ));
  const selected = candidates;
  for (const record of selected) {
    if (record.anchorText || record.tesbihat) record.bucket = 'D';
    else if (record.isParticle) record.bucket = 'A';
    else if (record.cognateTr) record.bucket = 'B'; // 03 §9: kognat isim/fiil (insan etiketi)
    else record.bucket = 'C';
  }

  const wordTokenTotal = parsed.words.length;
  const lemPoolTokens = [...counts.frequency.values()].reduce((sum, value) => sum + value, 0);
  const selectedLemPoolTokens = selected.reduce((sum, record) => sum + record.freq, 0);
  const bucketCounts = { A: 0, B: 0, C: 0, D: 0 };
  for (const record of selected) bucketCounts[record.bucket] += 1;
  const anchorUniverse = new Set([...counts.anchor, ...TESBIHAT_LEMMAS]);
  const anchorCovered = [...anchorUniverse].filter((lemma) => counts.frequency.has(lemma));
  const coverageByRank = [500, 600, 700, 800, 1000].map((cutoff) => {
    const band = rankBand(cutoff);
    const tokens = [...band].reduce((sum, lemma) => sum + counts.frequency.get(lemma), 0);
    return { contentRankMax: cutoff, lemmas: band.size, ratioLemPool: Number((tokens / lemPoolTokens).toFixed(4)) };
  });
  const report = {
    schemaVersion: 1,
    generatedBy: 'kao-lexicon-build --draft',
    version: LEXICON_VERSION,
    sourceHashes,
    selectionRule: {
      particleRankMax: PARTICLE_RANK_MAX,
      contentRankMax: CONTENT_RANK_MAX,
      particlePos: [...PARTICLE_POS].sort(),
      contentPos: [...CONTENT_POS].sort(),
      anchorVerses: [...ANCHOR_VERSES].length,
      note: '03 §9: A = sıklık ilk 100 parçacık, B/C = sıklık ≤500 içerik, D = çapa/tesbihat (sıralamadan bağımsız).'
    },
    tokenTotal: wordTokenTotal,
    contractTokenTarget: CONTRACT_TOKEN_TARGET,
    lemPoolTokens,
    lemmaTotal: counts.frequency.size,
    candidateTotal: selected.length,
    planCandidateTarget: CANDIDATE_TARGET,
    bucketCounts,
    bucketTargets: { A: 60, B: 225, C: 215, D: 30 },
    coverage: {
      selectedLemPoolTokens,
      lemPoolTokens,
      ratioLemPool: Number((selectedLemPoolTokens / lemPoolTokens).toFixed(4)),
      ratioWordTokens: Number((selectedLemPoolTokens / wordTokenTotal).toFixed(4)),
      goal: 0.80,
      goalMet: selectedLemPoolTokens / lemPoolTokens >= 0.80,
      denominator: 'LEM etiketli token havuzu',
      alternatives: coverageByRank
    },
    anchorUniverseTotal: anchorUniverse.size,
    anchorPresentTotal: anchorCovered.length,
    anchorMissing: [...anchorUniverse].filter((lemma) => !counts.frequency.has(lemma)),
    anchorOutsideContentBand: anchorCovered.filter((lemma) => rank.get(lemma) > CONTENT_RANK_MAX).length,
    tesbihatPresent: [...tesbihatPresent],
    clusterRootDiagnostics: clusters.diagnostics,
    cognate: {
      channel: 'inceleme tablosu (lexicon.review.md) — cognateTr / cognateShift sütunları',
      matchedTotal: selected.filter((record) => record.cognateTr).length,
      note: 'Kognat eşlemesi ÖNERİdir ve yalnız insan yazar (06 §3); araç TDK listesini hafızadan üretmez.'
    },
    verifiedTotal: selected.filter((record) => record.verified).length,
    exampleStats: {
      minimum: 3,
      rowsWithFewerThanMinimum: selected.filter((record) => record.examples.length < 3).length,
      exceptions: selected.filter((record) => record.examplesException)
        .map((record) => ({ lemmaId: record.lemmaId, lemmaBw: record.lemmaBw, freq: record.freq, examples: record.examples.length })),
      note: '05 §1 nihai sözlükte kart başına ≥3 örnek ister. Çok seyrek lemma (freq 1–2) '
        + 'için korpusta yeterli pencere yoksa araç eksik alanı uydurmaz; sayı burada açıkça raporlanır '
        + 've insan doğrulaması (KAO-03) karar verir.'
    },
    userTaskPending: true,
    warnings: []
  };
  if (report.exampleStats.rowsWithFewerThanMinimum) {
    report.warnings.push(`${report.exampleStats.rowsWithFewerThanMinimum} satırda 3'ten az örnek`
      + ' (çok seyrek lemma); korpusta yeterli pencere yok, uydurulmadı');
  }
  if (!report.coverage.goalMet) {
    report.warnings.push(`kapsam hedefi %80 altında: %${(report.coverage.ratioLemPool * 100).toFixed(1)}`
      + ` (LEM havuzu; içerik sıralaması ≤${CONTENT_RANK_MAX}). Hedefe ulaşan sıralama raporludur,`
      + ' eşiği yükseltmek insan kararıdır.');
  }
  if (report.cognate.matchedTotal === 0) {
    report.warnings.push('kognat sütunu boş (insan doldurur); B kovası boş, cognateTr/cognateShift null');
  }
  if (report.bucketCounts.B !== report.cognate.matchedTotal) {
    report.warnings.push(`cognateTr dolu ${report.cognate.matchedTotal} kayıt ama B kovası`
      + ` ${report.bucketCounts.B} — bazı kognatlar çapa/parçacık kovasında (03 §9 önceliği: D > A > B > C)`);
  }
  if (report.anchorMissing.length) {
    report.warnings.push(`çapa/tesbihat lemma bulunamadı: ${report.anchorMissing.join(', ')}`);
  }
  return { candidates: selected, report, counts, rootIndex, clusters };
}

function buildDraft(morphologySource, uthmaniSource, sourceHashes, options = {}) {
  const parsed = parseMorphology(morphologySource);
  const uthmani = parseUthmani(uthmaniSource, parsed.words);
  const reference = options.reference === undefined ? readReference() : options.reference;
  const referenceByRef = new Map();
  for (const entry of (reference && reference.words) || []) {
    if (!referenceByRef.has(entry.ref)) referenceByRef.set(entry.ref, []);
    referenceByRef.get(entry.ref).push(entry);
  }
  // The cognate/meaning/example columns are human-owned (06 §3). Re-running
  // --draft must not destroy work already entered, so it is carried over from
  // the existing draft unless the caller opts out (tests do).
  const carried = options.carryHuman === false ? new Map() : readExistingHumanInput();
  return lemmaCandidateRecords(parsed, uthmani.byVerse, sourceHashes, carried, referenceByRef);
}

function exampleCells(record, index) {
  const example = record.examples[index];
  if (!example) return ['', '', ''];
  return [example.ar, example.tr || '', example.ref];
}

function reviewCells(record) {
  return [
    record.lemmaId,
    record.ar,
    record.translit.tr,
    record.translit.dia,
    record.tr1 || '',
    record.tr2 || '',
    record.root || '',
    record.pattern || '',
    record.pos,
    String(record.freq),
    record.cognateTr || '',
    record.cognateShift || '',
    record.examples[0] ? (record.examples[0].referenceWordTr || '') : '',
    record.examples[0] ? (record.examples[0].referenceTr || '') : '',
    ...exampleCells(record, 0),
    ...exampleCells(record, 1),
    ...exampleCells(record, 2),
    record.semNeighbors.clusters.join('+'),
    record.bucket,
    record.verifiedBy || '',
    record.verifiedAt || ''
  ];
}

const REVIEW_HEADER = Object.freeze([
  'lemmaId', 'ar', 'translit_tr', 'translit_dia', 'tr1', 'tr2', 'root', 'pattern',
  'pos', 'freq', 'cognateTr', 'cognateShift',
  'ref1_tr', 'ref1_context_tr',
  'ex1_ar', 'ex1_tr', 'ex1_ref',
  'ex2_ar', 'ex2_tr', 'ex2_ref',
  'ex3_ar', 'ex3_tr', 'ex3_ref',
  'semClusters', 'bucket', 'verifiedBy', 'verifiedAt'
]);

function escapeCell(value) {
  return String(value == null ? '' : value).replace(/\|/g, '\\|');
}

function renderReviewMarkdown(draft) {
  const lines = [
    '# KAO-02 · İnsan inceleme tablosu (taslak)',
    '',
    '> **Durum:** `verified:false` — bu tabloda **hiçbir satır onaylı değildir.**',
    '> Arapça ve transliterasyon korpustan **mekanik** üretilir; Türkçe anlamlar (`tr1`, `tr2`)',
    '> ve örnek çevirileri (`ex1_tr`) **boştur** ve insan tarafından doldurulur (06 §3, KAO-03).',
    '> `verifiedBy` boş kalan satır onaylanmamış sayılır; onay kuralı 06 §3 (iki bağımsız göz',
    '> ya da iki ayrı gün).',
    '',
    '## Kova tanımları (03 §9)',
    '| Kova | Ne | Bu taslakta |',
    '|---|---|---|',
    '| A · Parçacıklar (edat/zamir/bağlaç) | lemma sıralamasında ilk 100 işlev kelimesi | korpustan etiketli |',
    '| B · Kognat isim/fiil | sıralama ≤500 ∧ Türkçede karşılığı var | **boş** — `cognateTr` sütunu boş |',
    '| C · Kognat olmayan isim/fiil | sıralama ≤500 ∧ kognat değil | adaylar (`cognateTr=null`) |',
    '| D · Çapa metin kelimeleri | Fâtiha + 112–114 + tesbihat (sıralamadan bağımsız) | korpustan kesişim |',
    '',
    '## Rapor',
    `- Aday havuzu: **${draft.report.candidateTotal}** lemma (plan hedefi ${draft.report.planCandidateTarget}) · toplam lemma: ${draft.report.lemmaTotal}`,
    `- Kovalar: A=${draft.report.bucketCounts.A} · B=${draft.report.bucketCounts.B} · C=${draft.report.bucketCounts.C} · D=${draft.report.bucketCounts.D}`,
    `- Seçim kuralı: parçacık sıra ≤${draft.report.selectionRule.particleRankMax} · içerik sıra ≤${draft.report.selectionRule.contentRankMax} · çapa sıralamadan bağımsız`,
    `- Kapsam (LEM havuzu): **%${(draft.report.coverage.ratioLemPool * 100).toFixed(1)}** (hedef %80) → ${draft.report.coverage.goalMet ? 'TUTTU' : 'TUTMADI'}`,
    `- Kapsam (kelime token): %${(draft.report.coverage.ratioWordTokens * 100).toFixed(1)} · çapa dışı (sıra >${draft.report.selectionRule.contentRankMax}): ${draft.report.anchorOutsideContentBand}`,
    `- Çapa/tesbihat: ${draft.report.anchorPresentTotal}/${draft.report.anchorUniverseTotal} korpusta var`,
    `- Doğrulanmış satır: **${draft.report.verifiedTotal}** (beklenen: 0)`,
    '',
    '## Sütun kılavuzu (KAO-03 adım 1 — ajan içerik ÖNERMEZ)',
    '',
    '| Sütun | Kim yazar | Ne yazılır |',
    '|---|---|---|',
    '| `lemmaId`, `ar`, `translit_*`, `root`, `pos`, `freq`, `bucket` | araç (korpustan) | **dokunma** |',
    '| `tr1` (zorunlu) / `tr2` (ikinci anlam, varsa) | **insan** | Kısa Türkçe anlam(lar) |',
    '| `pattern` | **insan** | Kalıp etiketi (örn. `masdar`, `ism-i fâil`) — 10 §7 |',
    '| `cognateTr` | **insan** | Türkçedeki karşılığı (varsa). TDK kaynaklı; araç üretmez. |',
    '| `cognateShift` | **insan** | Yalnız anlam kayması VARSA doldur (R-A8 uyarısını tetikler) |',
    '| `exN_ar` / `exN_ref` | araç (Tanzil kesiti) | **dokunma** |',
    '| `exN_tr` | **insan** | Örneğin kısa Türkçe çevirisi (tefsir hükmü değil, 06 §2) |',
    '| `semClusters` | araç önerisi | gerekirse düzelt (12 küme; R-A5) |',
    '| `verifiedBy` | **insan** | Onaylayan adı/imzası. Boş = onaysız. |',
    '| `verifiedAt` | **insan** | Onay tarihi `YYYY-AA-GG`. İki ayrı gün kuralı için tabloda tut |',
    '',
    '| `ref1_tr` · `ref1_context_tr` | **REFERANS** (quran.com tr kelime-kelime) | Kopyalama; kendi anlamını yaz — 06 §2 gereği referans, üretim içeriği değil |',
    '',
    '> **Onaysız sayılan:** `verifiedBy` **veya** `tr1` boş olan satır.',
    '> **Onay kuralı (06 §3):** iki bağımsız göz **ya da** aynı kişinin iki ayrı günde kontrolü.',
    '> İkinci durumda `verifiedBy` alanına iki tarih yaz: `insan-1 (2026-09-23; 2026-09-24)`.',
    '> Araç, `verifiedAt` sütununu ve parantezli tarihleri otomatik doğrular.',
    '',
    '## Tablo',
    `| ${REVIEW_HEADER.join(' | ')} |`,
    `|${REVIEW_HEADER.map(() => '---').join('|')}|`
  ];
  for (const record of draft.candidates) {
    lines.push(`| ${reviewCells(record).map(escapeCell).join(' | ')} |`);
  }
  return `${lines.join('\n')}\n`;
}

// 06 §3 onay kuralı makine-doğrulanabilir hale getirilir: `verifiedAt` ya tek bir
// tarih (`YYYY-AA-GG`) ya da parantez içinde iki tarih taşır
// (`insan-1 (2026-09-23; 2026-09-24)`) — ikincisi "iki ayrı günde kontrol" kaydıdır.
function parseApprovalDates(value) {
  const dates = [...String(value || '').matchAll(/\d{4}-\d{2}-\d{2}/g)].map((match) => match[0]);
  const distinctDays = [...new Set(dates)];
  const first = dates.length ? dates[0] : null;
  const singleDayOk = dates.length > 0 && distinctDays.length === 1;
  const twoDayOk = distinctDays.length >= 2 && distinctDays[0] !== distinctDays[1];
  return {
    dates,
    distinctDays,
    twoDayOk,
    singleDayOk,
    satisfiesTwoGazeRule: twoDayOk,
    note: twoDayOk ? 'iki ayrı gün kaydı (06 §3)' : (singleDayOk ? 'tek gün — ikinci gün teyidi yok' : 'tarih yok')
  };
}

function parseReviewMarkdown(markdown, existing) {
  const rows = [];
  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    const cells = trimmed.replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim().replace(/\\\|/g, '|'));
    if (cells.length < REVIEW_HEADER.length) continue;
    if (cells[0] === REVIEW_HEADER[0] || /^-+$/.test(cells[0])) continue;
    const row = {};
    for (const [index, key] of REVIEW_HEADER.entries()) row[key] = cells[index] === '' ? null : cells[index];
    if (!row.lemmaId) continue;
    rows.push(row);
  }
  const byId = new Map();
  const duplicated = [];
  for (const record of existing) {
    if (byId.has(record.lemmaId)) { duplicated.push(record.lemmaId); continue; }
    byId.set(record.lemmaId, record);
  }
  let verifiedTotal = 0;
  let unknownTotal = 0;
  const consistencyCopy = [];
  for (const row of rows) {
    const record = byId.get(row.lemmaId);
    if (!record) { unknownTotal += 1; continue; }
    record.tr1 = row.tr1;
    record.tr2 = row.tr2;
    record.pattern = row.pattern;
    record.cognateTr = row.cognateTr;
    record.cognateShift = row.cognateShift;
    record.semNeighbors.clusters = row.semClusters ? row.semClusters.split('+').filter(Boolean) : record.semNeighbors.clusters;
    if (record.examples[0]) record.examples[0].tr = row.ex1_tr;
    record.verifiedBy = row.verifiedBy;
    record.approval = parseApprovalDates(row.verifiedAt);
    // --- 06 §2 bekçisi: "Türkçe mealler KOPYALANMAZ" ---
    // `tr1`, referans çevirisiyle birebir aynıysa bu bir kopyadır, doğrulama değil.
    const refWord = record.examples[0] ? record.examples[0].referenceWordTr : null;
    const normalize = (v) => String(v || '').trim().toLocaleLowerCase('tr').replace(/\s+/g, ' ');
    const copiedFromReference = Boolean(row.tr1 && refWord && normalize(row.tr1) === normalize(refWord));
    record.copiedFromReference = copiedFromReference;
    // Tabloda girilmiş tarih korunur (06 §3: "iki ayrı günde kontrol" kaydı);
    // boşsa bugünün tarihi yazılır.
    record.verifiedAt = row.verifiedBy
      ? (row.verifiedAt || new Date().toISOString().slice(0, 10))
      : null;
    record.verified = Boolean(row.verifiedBy && record.tr1) && !copiedFromReference;
    if (record.verified) verifiedTotal += 1;
    if (copiedFromReference) {
      consistencyCopy.push({ lemmaId: record.lemmaId, issue: 'copied_from_reference',
        note: '06 §2: referans kopyalanmaz — kendi ifadeni yaz' });
    }
    record.bucket = (record.cognateTr && !record.anchorText && !record.tesbihat && !record.isParticle)
      ? 'B' : record.bucket;
  }
  const verifiedRecords = existing.filter((record) => record.verified);
  // Tutarlılık denetimi (KAO-03 adım 3): her lemma >=3 örnek, ref biçimi S:A,
  // Arapça yalnız Arapça blok + hareke, Türkçe anlam boş değil.
  const consistency = [];
  for (const record of existing) {
    if (record.examples.length < 3 && !record.examplesException) {
      consistency.push({ lemmaId: record.lemmaId, issue: 'examples_lt_3' });
    }
    for (const example of record.examples) {
      if (!/^\d+:\d+$/.test(example.ref || '')) consistency.push({ lemmaId: record.lemmaId, issue: 'bad_ref' });
      if (arabicWordRegex().test(example.ar || '')) continue;
      consistency.push({ lemmaId: record.lemmaId, issue: 'example_not_arabic' });
    }
    if (!arabicWordRegex().test(record.ar || '')) consistency.push({ lemmaId: record.lemmaId, issue: 'lemma_not_arabic' });
    if (record.verified) {
      const dates = (record.approval && record.approval.dates) || [];
      if (!dates.length) consistency.push({ lemmaId: record.lemmaId, issue: 'missing_verified_at' });
      for (const example of record.examples) {
        if (!example.tr) consistency.push({ lemmaId: record.lemmaId, issue: 'missing_example_tr' });
      }
    }
  }
  consistency.push(...consistencyCopy);
  const twoGazeTotal = verifiedRecords.filter((record) => record.approval && record.approval.twoDayOk).length;
  return {
    records: existing,
    verifiedTotal,
    unknownTotal,
    verifiedRecords,
    duplicated,
    matched: rows.length - unknownTotal,
    consistency,
    consistencyTotal: consistency.length,
    twoGazeTotal,
    singleDayVerifiedTotal: verifiedRecords.filter((record) => record.approval && record.approval.singleDayOk).length,
    copiedFromReferenceTotal: consistencyCopy.length
  };
}

function writeDraft(inputDir) {
  const missing = missingInputs(inputDir);
  if (missing.length) throw new CliError(missingMessage(inputDir, missing), 2);
  const morphology = readPinnedInput(inputDir, INPUTS.morphology);
  const parsed = parseMorphology(morphology.text);
  const expectedVerseTotal = new Set(parsed.words.map((word) => `${word.surah}:${word.ayah}`)).size;
  const uthmani = readUthmaniInput(inputDir, expectedVerseTotal);
  const draft = buildDraft(morphology.text, uthmani.text, {
    morphology: morphology.sha256,
    uthmani: uthmani.sha256,
    uthmaniBodySha256: uthmani.bodySha256
  });
  const output = {
    schemaVersion: 1,
    version: LEXICON_VERSION,
    generatedBy: 'kao-lexicon-build --draft',
    generatedAt: new Date().toISOString().slice(0, 10),
    status: 'draft',
    verifiedTotal: draft.report.verifiedTotal,
    report: draft.report,
    lemmas: draft.candidates
  };
  fs.mkdirSync(path.dirname(DRAFT_PATH), { recursive: true });
  fs.writeFileSync(DRAFT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  fs.mkdirSync(path.dirname(DRAFT_REPORT_PATH), { recursive: true });
  fs.writeFileSync(DRAFT_REPORT_PATH, `${JSON.stringify(draft.report, null, 2)}\n`);
  fs.mkdirSync(path.dirname(REVIEW_PATH), { recursive: true });
  fs.writeFileSync(REVIEW_PATH, renderReviewMarkdown(draft));
  console.log(`KAO draft: ${path.relative(ROOT, DRAFT_PATH)}`);
  console.log(`KAO report: ${path.relative(ROOT, DRAFT_REPORT_PATH)}`);
  console.log(`KAO review: ${path.relative(ROOT, REVIEW_PATH)}`);
  console.log(`candidates=${draft.report.candidateTotal} bucket=${JSON.stringify(draft.report.bucketCounts)}`
    + ` coverageLemPool=%${(draft.report.coverage.ratioLemPool * 100).toFixed(1)} verified=${draft.report.verifiedTotal}`);
  for (const warning of draft.report.warnings) console.log(`WARN ${warning}`);
}

function readDraft() {
  if (!fs.existsSync(DRAFT_PATH)) throw new CliError(`taslak yok: ${path.relative(ROOT, DRAFT_PATH)} — önce --draft koş`, 2);
  return JSON.parse(fs.readFileSync(DRAFT_PATH, 'utf8'));
}

// ---------------------------------------------------------------------------
// Seviyeli çalışma kitabı (06 §3: "kullanıcı düzenler" — kod yazmadan)
// Bilimsel gerekçe (03 §1): kelimeler KADEMELİ açılır; bir seferde 524 anlam
// yazmak hem bilişsel yük hem hata kaynağıdır. Ayrıca 02 §2.6 "her kelime
// Kur'an cümlesi içinde": anlamı cümle bağlamında yazmak tek kelimeden
// belirgin biçimde daha doğru ve daha hızlıdır.
// ---------------------------------------------------------------------------
const UNIT_TITLES = Object.freeze({
  D: 'Kova D · Seviye 1 çekirdeği (Fâtiha + İhlâs/Felak/Nâs + tesbihat — zaten okuduğun metin)',
  A: 'Kova A · Parçacıklar (edat/zamir/bağlaç)',
  C1: 'Kova C · sıra ≤100 (Kur’an’ın en sık kelimeleri)',
  C2: 'Kova C · sıra 101–250',
  C3: 'Kova C · sıra 251–500',
  X: 'Kova C · diğer'
});

// D kovası için okuma sırası anahtarı: sûre, sonra âyet (03 §3 "namazın dili"
// zaten okuduğun metin sırasıyla). Örnek yoksa sıklığa düşer.
function anchorReadingKey(record) {
  const ref = record.examples[0] && record.examples[0].ref;
  const match = /^(\d+):(\d+)$/.exec(ref || '');
  if (!match) return [9999, 9999, record.rank || 9999];
  return [Number(match[1]), Number(match[2]), record.rank || 9999];
}

function workbookBand(record) {
  if (record.bucket === 'D') return 'D';
  if (record.bucket === 'A') return 'A';
  const r = record.rank || 9999;
  if (r <= 100) return 'C1';
  if (r <= 250) return 'C2';
  if (r <= CONTENT_RANK_MAX) return 'C3';
  return 'X';
}

function renderWorkbook(draft, reference) {
  const order = ['D', 'A', 'C1', 'C2', 'C3', 'X'];
  const groups = new Map(order.map((key) => [key, []]));
  for (const record of draft.candidates) {
    groups.get(workbookBand(record)).push(record);
  }
  for (const [key, list] of groups) {
    if (key === 'D') {
      // Fâtiha'dan İhlâs/Felak/Nâs'a; tesbihatın örnek penceresi yoksa sona düşer.
      list.sort((a, b) => {
        const ka = anchorReadingKey(a), kb = anchorReadingKey(b);
        return ka[0] - kb[0] || ka[1] - kb[1] || ka[2] - kb[2];
      });
      continue;
    }
    list.sort((a, b) => a.rank - b.rank || a.lemmaBw.localeCompare(b.lemmaBw));
  }
  // Yalnız çevrilecek sütunlar + bağlam; lemmaId gizli değil ama en sonda.
  // `translit_tr` ve `root` MEKANİK üretilir (Buckwalter tablosu / korpus kökü) —
  // içerik değildir, insanın Arapçayı okumasını/aramısını kolaylaştırır.
  // `ref_tr` / `context_ref_tr` = quran.com Türkçe kelime-kelime REFERANSI (06 §2).
  // Üretim paketine GİRMEZ; insanın `tr1`/`context_tr` yazmasına bakış kolaylığı.
  const cols = ['ar', 'translit_tr', 'root', 'context_ar', 'context_ref',
    'ref_tr', 'context_ref_tr', 'tr1', 'tr2', 'pattern',
    'cognateTr', 'cognateShift', 'context_tr', 'verifiedBy', 'verifiedAt', 'lemmaId'];
  const lines = [
    '# KAO · Seviyeli kelime çalışma kitabı (taslak)',
    '',
    '> Amaç: anlamları **kademeli** yazmak (03 §1) ve her kelimeyi **cümle bağlamında**',
    '> görmek (02 §2.6). Arapça ve `context_ar` korpustan gelir — **değiştirme**.',
    '',
    '## Nasıl doldurulur',
    '| Sütun | Yazılacak |',
    '|---|---|',
    '| `ar` · `translit_tr` · `root` · `context_ar` · `context_ref` | **mekanik** (korpustan) — dokunma |',
    '| `ref_tr` · `context_ref_tr` | **REFERANS** (quran.com tr kelime-kelime, 06 §2) — kopyalama, kendi anlamını yaz |',
    '| `tr1` | kelimenin kısa Türkçe anlamı **zorunlu** |',
    '| `tr2` | ikinci anlam (varsa) |',
    '| `pattern` | kalıp etiketi (örn. `masdar`) |',
    '| `cognateTr` | Türkçedeki karşılığı (varsa) |',
    '| `cognateShift` | yalnız anlam kayması varsa |',
    '| `context_tr` | `context_ar` cümlesinin kısa çevirisi |',
    '| `verifiedBy` | onaylayan ad |',
    '| `verifiedAt` | onay tarihi `YYYY-AA-GG` (iki ayrı gün: iki tarih) |',
    '',
    'Onay kuralı 06 §3: iki bağımsız göz **ya da** aynı kişinin iki ayrı günü.',
    '',
    '## Sıra (03 §1: kademeli seviyeler)'
  ];
  for (const key of order) {
    const list = groups.get(key);
    if (!list.length) continue;
    lines.push('', `### ${UNIT_TITLES[key]} — **${list.length}** kelime`, '',
      `| ${cols.join(' | ')} |`, `|${cols.map(() => '---').join('|')}|`);
    for (const record of list) {
      const context = record.examples[0] || {};
      const cells = [
        record.ar,
        record.translit.tr || '',
        record.root || '',
        context.ar || '',
        context.ref || '',
        context.referenceWordTr || '',
        context.referenceTr || '',
        '', '',
        '', '', '',
        '',
        '', '',
        record.lemmaId
      ];
      lines.push(`| ${cells.map(escapeCell).join(' | ')} |`);
    }
  }
  return `${lines.join('\n')}\n`;
}

// self-test: D bölümü okuma sırasında (1:1 önce) ve Fâtiha kelimeleri başta olmalı.
function workbookSelfTest(draft, reference) {
  const text = renderWorkbook(draft, reference);
  const dSection = text.slice(text.indexOf('Kova D ·'), text.indexOf('\n### Kova A'));
  const refs = [...dSection.matchAll(/\| (\d+):(\d+) \|/g)].map((m) => [Number(m[1]), Number(m[2])]);
  assert(refs.length > 0, 'workbook D bölümünde bağlam referansı olmalı');
  for (let i = 1; i < refs.length; i += 1) {
    const prev = refs[i - 1], cur = refs[i];
    assert(prev[0] < cur[0] || (prev[0] === cur[0] && prev[1] <= cur[1]),
      'workbook D bölümü sûre:âyet okuma sırasında olmalı');
  }
  assert(dSection.includes('| 1:1 |'), 'Fâtiha 1:1 D bölümünde bulunmalı');
  // Referans katmanı varsa `ref_tr` kolonu Fâtiha satırlarında dolu olmalı
  if (reference && reference.words && reference.words.length) {
    assert(/\| REF-/.test(text),
      'referans katmanı varsa workbook ref_tr kolonu dolu olmalı');
  }
  // mekanik alanlar boş kalmamalı (insanın okumasını kolaylaştırırlar)
  const rowsAll = text.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('| ar') && !line.startsWith('|---')
    && /\| [\u0600-\u06FF]/.test(line));
  assert(rowsAll.every((line) => {
    const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    return cells[1] && cells[3] && cells[4]; // translit_tr, context_ar, context_ref
  }), 'workbook mekanik alanları (translit/context) dolu olmalı');
}

function writeWorkbook() {
  const draftFile = readDraft();
  fs.mkdirSync(path.dirname(WORKBOOK_PATH), { recursive: true });
  fs.writeFileSync(WORKBOOK_PATH, renderWorkbook({ candidates: draftFile.lemmas, report: draftFile.report }));
  const counts = draftFile.lemmas.reduce((acc, record) => {
    const band = workbookBand(record);
    acc[band] = (acc[band] || 0) + 1;
    return acc;
  }, {});
  console.log(`KAO workbook: ${path.relative(ROOT, WORKBOOK_PATH)}`);
  console.log(`  toplam=${draftFile.lemmas.length} · bantlar=${JSON.stringify(counts)}`);
}

function renderReviewFromDraft() {
  const draftFile = readDraft();
  const draft = { candidates: draftFile.lemmas, report: draftFile.report };
  fs.writeFileSync(REVIEW_PATH, renderReviewMarkdown(draft));
  console.log(`KAO review: ${path.relative(ROOT, REVIEW_PATH)} (${draftFile.lemmas.length} satır)`);
}

function importReview() {
  const draftFile = readDraft();
  if (!fs.existsSync(REVIEW_PATH)) throw new CliError(`inceleme tablosu yok: ${path.relative(ROOT, REVIEW_PATH)}`, 2);
  const { verifiedTotal, unknownTotal, verifiedRecords, duplicated } = parseReviewMarkdown(
    fs.readFileSync(REVIEW_PATH, 'utf8'), draftFile.lemmas
  );
  const rowsTotal = draftFile.lemmas.length - unknownTotal;
  const duplicatedTotal = duplicated.length;
  const copiedFromReferenceTotal = draftFile.lemmas.filter((r) => r.copiedFromReference).length;
  const output = {
    schemaVersion: 1,
    version: LEXICON_VERSION,
    importedBy: 'kao-lexicon-build --import-md',
    importedAt: new Date().toISOString().slice(0, 10),
    verifiedTotal,
    unknownTotal,
    rowsTotal,
    duplicatedTotal,
    copiedFromReferenceTotal,
    lemmas: draftFile.lemmas
  };
  fs.mkdirSync(path.dirname(VERIFIED_PATH), { recursive: true });
  fs.writeFileSync(VERIFIED_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`KAO verified: ${path.relative(ROOT, VERIFIED_PATH)}`);
  console.log(`verified=${verifiedTotal} unknown=${unknownTotal} rows=${rowsTotal}`
    + ` duplicates=${duplicatedTotal} of=${draftFile.lemmas.length}`);
  if (!rowsTotal) {
    console.log('UYARI: tabloda hiç veri satırı bulunamadı — tablo bozulmuş olabilir.');
  }
  if (duplicatedTotal) {
    console.log(`UYARI: ${duplicatedTotal} yinelenen lemmaId atlandı: ${duplicated.slice(0, 5).join(', ')}`);
  }
  if (copiedFromReferenceTotal) {
    console.log(`UYARI: ${copiedFromReferenceTotal} satır REFERANSI birebir kopyalamış`
      + ' → doğrulanmış SAYILMADI (06 §2: "Türkçe mealler kopyalanmaz").');
  }
  if (!verifiedTotal) {
    console.log('NOT: doğrulanmış satır yok; kart waiting_user kalır (06 §3 onay kuralı).');
  }
  return { verifiedTotal, unknownTotal, verifiedRecords, rowsTotal, duplicatedTotal };
}

function usage() {
  return [
    'Kullanım:',
    '  node tools/kao-lexicon-build.mjs --self-test',
    '  node tools/kao-lexicon-build.mjs --inputs kuran-ogreniyorum/content/inputs [--stats]',
    '  node tools/kao-lexicon-build.mjs --inputs kuran-ogreniyorum/content/inputs --draft',
    '  node tools/kao-lexicon-build.mjs --review-md',
    '  node tools/kao-lexicon-build.mjs --reference   # TEK ağ noktası: quran.com tr kelime-kelime referansı',
    '  node tools/kao-lexicon-build.mjs --workbook',
    '  node tools/kao-lexicon-build.mjs --import-md'
  ].join('\n');
}

function inputsPath(argv) {
  const index = argv.indexOf('--inputs');
  if (index === -1 || !argv[index + 1] || argv[index + 1].startsWith('--')) {
    throw new CliError(`--inputs <dizin> gerekli\n${usage()}`, 64);
  }
  return { raw: argv[index + 1], resolved: path.resolve(ROOT, argv[index + 1]) };
}

function rejectUnknown(argv, allowed) {
  const unknown = argv.filter((arg) => !allowed.has(arg));
  if (unknown.length) throw new CliError(`Bilinmeyen argüman: ${unknown.join(', ')}\n${usage()}`, 64);
}

async function main(argv) {
  if (argv.includes('--self-test')) {
    if (argv.length !== 1) throw new CliError(`--self-test başka argüman almaz\n${usage()}`, 64);
    selfTest();
    return;
  }
  if (argv.includes('--review-md')) {
    rejectUnknown(argv, new Set(['--review-md']));
    renderReviewFromDraft();
    return;
  }
  if (argv.includes('--reference')) {
    rejectUnknown(argv, new Set(['--reference']));
    await writeReference();
    return;
  }
  if (argv.includes('--workbook')) {
    rejectUnknown(argv, new Set(['--workbook']));
    writeWorkbook();
    return;
  }
  if (argv.includes('--import-md')) {
    rejectUnknown(argv, new Set(['--import-md']));
    importReview();
    return;
  }
  const inputArg = inputsPath(argv);
  const allowed = new Set(['--inputs', inputArg.raw, '--stats', '--draft']);
  rejectUnknown(argv, allowed);
  const modes = ['--stats', '--draft'].filter((flag) => argv.includes(flag));
  if (modes.length > 1) throw new CliError(`--stats ve --draft birlikte kullanılamaz\n${usage()}`, 64);
  if (modes[0] === '--draft') writeDraft(inputArg.resolved);
  else compile(inputArg.resolved);
}

export { buildStats, bwToArabic, parseMorphology, buildDraft, renderReviewMarkdown, parseReviewMarkdown, stripTanzilBoilerplate, renderWorkbook, workbookBand };

const IS_MAIN = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (IS_MAIN) {
  try {
    await main(process.argv.slice(2));
  } catch (error) {
    console.error(error && error.message ? error.message : String(error));
    process.exitCode = error instanceof CliError ? error.exitCode : 1;
  }
}
