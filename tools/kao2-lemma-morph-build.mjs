#!/usr/bin/env node
// K2F-19 ek tur · QAC morfolojisinden lemma başına fiil kipi/zamanı ve seslenme tablosu.
//
// Neden: içerik modüllerinde (QuranLexiconV1) emir/geçmiş/şimdiki/seslenme etiketi yoktur; "Emir kipi" gibi
// ders başlıklarının kelimelerle uyumu bu yüzden ölçülemiyordu. Bu araç Quranic Arabic Corpus (QAC) 0.4
// morfolojisinden (Dukes & Habash 2010; GPL, telif bloğu korunur) şunları SAYAR — hiçbir etiket uydurmaz:
//   • PERF / IMPF / IMPV: fiil kökünün yapısal özelliği (https://corpus.quran.com/documentation/morphologicalfeatures.jsp).
//     Not: `l:IMPV+` önek özelliği (emir lâmı) fiil kipinden AYRIDIR ve burada sayılmaz.
//   • VOC: seslenme edatı önekli kelime (https://corpus.quran.com/documentation/tagset.jsp).
// Çıktı tests/kao/fixtures/qac-lemma-morph.json: uygulamaya, içerik modüllerine, bütçeye ve yayın pinine
// DOKUNMAZ; yalnız ders tutarlılık kapısının bilimsel dayanağıdır. Ağa çıkmaz; girdi yoksa SKIP (çıkış 0).
//
// Kullanım:
//   node tools/kao2-lemma-morph-build.mjs --write   fixture'ı üretir
//   node tools/kao2-lemma-morph-build.mjs --check   fixture'ın girdiden bayt-eşit üretildiğini doğrular
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const QAC = join(ROOT, 'kaynak/kuran/icerik/inputs/quranic-corpus-morphology-0.4.txt');
const LEXICON = join(ROOT, 'kaynak/kuran/icerik/lexicon.verified.json');
const OUT = join(ROOT, 'tests/kao/fixtures/qac-lemma-morph.json');
const MAX_EXAMPLES = 3;
const SOURCES = [
  'https://corpus.quran.com/documentation/morphologicalfeatures.jsp',
  'https://corpus.quran.com/documentation/tagset.jsp',
  'Dukes & Habash 2010, Morphological Annotation of Quranic Arabic, LREC'
];

// QAC 0.4 morfolojisi GNU GPL altındadır; sayımlar türetilmiş eserdir ve telif/lisans bildirimi burada yeniden üretilir.
const LICENSE = {
  holder: 'Kais Dukes',
  year: 2011,
  name: 'GNU General Public License',
  notice: 'The Quranic Arabic Corpus (morphology, version 0.4), Copyright (C) 2011 Kais Dukes. License: GNU General Public License. Bu tablo o korpustan türetilmiş sayımlardır.',
  source: 'https://corpus.quran.com/download/'
};

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

// Satır: (sûre:âyet:kelime:parça) \t biçim \t etiket \t özellikler. Kelime = ilk üç sayı.
// Lemma anahtarı kao-lexicon-build.mjs ile AYNI kuraldır: kelimenin ilk LEM özelliği; yoksa parça biçimlerinin birleşimi.
export function parseWords(text) {
  const words = new Map();
  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    const match = /^\((\d+):(\d+):(\d+):(\d+)\)\t([^\t]*)\t([^\t]*)\t(.*)$/.exec(line);
    if (!match) continue;
    const key = `${match[1]}:${match[2]}:${match[3]}`;
    const features = match[7].split('|');
    const word = words.get(key) || { ref: `${match[1]}:${match[2]}`, lem: null, forms: [], aspect: null, voc: false };
    word.forms.push({ index: Number(match[4]), form: match[5] });
    const lem = features.find((f) => f.startsWith('LEM:'));
    if (!word.lem && lem) word.lem = lem.slice(4);
    // Yalnız kök parçadaki çıplak PERF/IMPF/IMPV; `l:IMPV+` öneki ayrı özelliktir ve eşleşmez.
    if (features.includes('STEM')) for (const tag of ['PERF', 'IMPF', 'IMPV']) if (features.includes(tag)) word.aspect = tag;
    if (features.includes('PREFIX') && match[6] === 'VOC') word.voc = true;
    words.set(key, word);
  }
  return [...words.values()].map((w) => ({
    ref: w.ref,
    lemma: w.lem || w.forms.sort((x, y) => x.index - y.index).map((f) => f.form).join(''),
    aspect: w.aspect,
    voc: w.voc
  }));
}

const blank = () => ({ perf: 0, impf: 0, impv: 0, voc: 0 });
function count(target, word) {
  if (word.aspect === 'PERF') target.perf += 1;
  if (word.aspect === 'IMPF') target.impf += 1;
  if (word.aspect === 'IMPV') target.impv += 1;
  if (word.voc) target.voc += 1;
}

export function buildTable(qacText, lexiconJson) {
  const lemmas = JSON.parse(lexiconJson).lemmas;
  const byLemma = new Map();
  const byVerse = new Map();
  for (const word of parseWords(qacText)) {
    const entry = byLemma.get(word.lemma) || { ...blank(), total: 0 };
    entry.total += 1;
    count(entry, word);
    byLemma.set(word.lemma, entry);
    const verseKey = `${word.ref}|${word.lemma}`;
    const verse = byVerse.get(verseKey) || blank();
    count(verse, word);
    byVerse.set(verseKey, verse);
  }
  const table = {};
  for (const lemma of [...lemmas].sort((a, b) => a.lemmaId.localeCompare(b.lemmaId))) {
    const entry = byLemma.get(lemma.lemmaBw);
    if (!entry) throw new Error(`QAC'ta lemma yok: ${lemma.lemmaId} (${lemma.lemmaBw})`);
    const examples = (lemma.examples || []).slice(0, MAX_EXAMPLES).map((example) => ({
      ref: example.ref, ...(byVerse.get(`${example.ref}|${lemma.lemmaBw}`) || blank())
    }));
    table[lemma.lemmaId] = { ...entry, examples };
  }
  return {
    schema: 'kao2-lemma-morph/1',
    note: 'QAC 0.4 (GPL; telif/lisans `license` alanında) morfolojisinden SAYILMIŞ değerler. Elle yazılmaz: node tools/kao2-lemma-morph-build.mjs --write',
    license: LICENSE,
    sources: SOURCES,
    input: { qacSha256: sha256(Buffer.from(qacText)), lexiconSha256: sha256(Buffer.from(lexiconJson)) },
    fields: { perf: 'PERF kök sayısı', impf: 'IMPF kök sayısı', impv: 'IMPV (emir) kök sayısı', voc: 'VOC önekli kelime sayısı', total: 'lemmayı İLK LEM olarak taşıyan kelime sayısı (sözlükteki freq ile birebir eşit; çok parçalı kelimede ikinci kök sayılmaz)', examples: 'lemmanın ilk 3 örnek âyetinde aynı sayımlar' },
    lemmas: table
  };
}

function render() {
  if (!existsSync(QAC) || !existsSync(LEXICON)) return null;
  const table = buildTable(readFileSync(QAC, 'utf8'), readFileSync(LEXICON, 'utf8'));
  // Okunabilir ve küçük: üst düzey alanlar girintili, her lemma tek satır.
  const lemmaLines = Object.entries(table.lemmas).map(([id, row]) => `  ${JSON.stringify(id)}: ${JSON.stringify(row)}`);
  const head = JSON.stringify({ ...table, lemmas: undefined }, null, 1).replace(/\n}$/, '');
  return `${head},\n "lemmas": {\n${lemmaLines.join(',\n')}\n }\n}\n`;
}

// Sembolik bağ (/tmp → /private/tmp) ve özel karakterli yollar için gerçek yol karşılaştırılır.
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const mode = process.argv[2];
  const rendered = ['--write', '--check'].includes(mode) ? render() : undefined;
  if (rendered === undefined) {
    console.error('Kullanım: --write | --check');
    process.exit(2);
  } else if (rendered === null) {
    console.log("kao2-lemma-morph-build: SKIP (QAC girdisi yok; gitignore'daki inputs/)");
  } else if (mode === '--write') {
    writeFileSync(OUT, rendered);
    console.log(`kao2-lemma-morph-build: yazıldı ${OUT} (${rendered.length} bayt)`);
  } else if (mode === '--check') {
    const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
    if (current !== rendered) {
      console.error('kao2-lemma-morph-build: FAIL fixture girdiden üretilenle bayt-eşit değil');
      process.exit(1);
    }
    console.log('kao2-lemma-morph-build: PASS bayt-eşit');
  } else {
    console.error('Kullanım: --write | --check');
    process.exit(2);
  }
}
