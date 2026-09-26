'use strict';
// KAO denetimi: içerik doğruluğu — Tanzil alt dizi, QAC frekans, tohumlu örneklem dökümü.
// Kullanım: node kao-content-check.js <repoRoot> [seed]
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repo = process.argv[2];
const SEED = Number(process.argv[3] || 20260926);

const sb = { window: {} };
vm.createContext(sb);
for (const rel of ['app/content/quranLexiconV1.js', 'app/content/quranShortSurahsV1.js', 'app/content/quranGrammarV1.js']) vm.runInContext(fs.readFileSync(path.join(repo, rel), 'utf8'), sb);
const L = sb.window.QuranLexiconV1, S = sb.window.QuranShortSurahsV1, G = sb.window.QuranGrammarV1;

const tanzil = fs.readFileSync(path.join(repo, 'kuran-ogreniyorum/content/inputs/quran-uthmani.txt'), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
const qacRaw = fs.readFileSync(path.join(repo, 'kuran-ogreniyorum/content/inputs/quranic-corpus-morphology-0.4.txt'), 'utf8').split(/\r?\n/);
const verseRefs = [];
const lemmaWords = new Map();
for (const line of qacRaw) {
  const m = line.match(/^\((\d+):(\d+):(\d+):(\d+)\)\t[^\t]*\t[^\t]*\t(.*)$/);
  if (!m) continue;
  const vref = `${m[1]}:${m[2]}`;
  if (verseRefs[verseRefs.length - 1] !== vref) verseRefs.push(vref);
  const lem = (m[5].match(/LEM:([^|]+)/) || [])[1];
  if (lem) { if (!lemmaWords.has(lem)) lemmaWords.set(lem, new Set()); lemmaWords.get(lem).add(`${m[1]}:${m[2]}:${m[3]}`); }
}
const verseText = new Map(verseRefs.map((r, i) => [r, tanzil[i]]));
console.log('Tanzil satır', tanzil.length, 'QAC âyet', verseRefs.length);

let ex = 0, exOk = 0; const exBad = [];
for (const lemma of L.lemmas) for (const e of lemma.examples || []) {
  ex += 1; const v = verseText.get(e.ref) || '';
  if (v.includes(e.ar)) exOk += 1; else if (exBad.length < 8) exBad.push(`${lemma.id} ${e.ref}: ${e.ar}`);
}
console.log(`örnek cümle: ${exOk}/${ex} Tanzil âyetinde birebir alt dizi`);
exBad.forEach((x) => console.log('  UYUMSUZ', x));

const verified = JSON.parse(fs.readFileSync(path.join(repo, 'kuran-ogreniyorum/content/lexicon.verified.json'), 'utf8')).lemmas;
const bwById = new Map(verified.map((v) => [v.lemmaId, v.lemmaBw]));
let fOk = 0; const fBad = [];
for (const lemma of L.lemmas) {
  const bw = bwById.get(lemma.id); const n = bw && lemmaWords.has(bw) ? lemmaWords.get(bw).size : -1;
  if (n === lemma.freq) fOk += 1; else fBad.push(`${lemma.id} bw=${bw} freq=${lemma.freq} qac=${n}`);
}
console.log(`frekans: ${fOk}/${L.lemmas.length} QAC bağımsız sayımıyla eşit`); fBad.slice(0, 8).forEach((x) => console.log('  FARK', x));
const sumFreq = L.lemmas.reduce((acc, l) => acc + l.freq, 0);
console.log('Σfreq', sumFreq, '/ 77430 =', (sumFreq / 77430 * 100).toFixed(2) + '%');

let sw = 0, swOk = 0;
for (const w of S.words) { sw += 1; if ((verseText.get(`${w.surahId}:${w.ayah}`) || '').includes(w.ar)) swOk += 1; }
console.log(`kısa sûre kelimesi: ${swOk}/${sw} Tanzil âyetinde`);

const silentCases = [];
for (const lemma of L.lemmas) for (const e of lemma.examples || []) {
  const words = e.ar.split(/\s+/), reads = String(e.pronunciation || '').split(/\s+/);
  words.forEach((w, i) => { if (w.includes('۟')) silentCases.push({ ref: e.ref, ar: w, pr: reads[i] || '?' }); });
}
console.log(`۟ içeren örnek kelime: ${silentCases.length}`);
const ulaV = silentCases.filter((c) => /أُو۟ل/.test(c.ar) && /v/.test(c.pr));
console.log('  أُو۟لـ formunda "v" okunan:', ulaV.length, ulaV.slice(0, 3).map((c) => `${c.ref} ${c.ar}→${c.pr}`).join(' | '));
const misaligned = L.lemmas.flatMap((l) => (l.examples || []).filter((e) => e.ar.split(/\s+/).length !== String(e.pronunciation || '').split(/\s+/).length).map((e) => `${l.id} ${e.ref}`));
console.log('kelime sayısı ≠ okunuş sayısı olan örnek:', misaligned.length, misaligned.slice(0, 5).join(' | '));

let s = SEED >>> 0; const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
const pick = (arr, n) => { const a = arr.slice(); const out = []; while (out.length < n && a.length) out.push(a.splice(Math.floor(rnd() * a.length), 1)[0]); return out; };
console.log(`\n=== ÖRNEKLEM tohum=${SEED}`);
for (const l of pick(L.lemmas, 40)) {
  const e = (l.examples || [])[0] || {};
  console.log(`L ${l.id} | ${l.ar} | ${l.translit} | ${l.meanings.join(' / ')} | kök=${l.root} | ${l.pattern} | f=${l.freq} | cog=${l.cognate ? JSON.stringify(l.cognate) : '-'} | ex ${e.ref}: ${e.ar} ⇒ ${e.pronunciation} ⇒ ${e.tr}`);
}
for (const w of pick(S.words, 12)) console.log(`S ${w.id} | ${w.ar} | ${w.pronunciation} | ${w.tr} | ${w.lemmaId}`);
const gKeys = Object.keys(G);
console.log('gramer anahtarları', gKeys.join(','));
const concepts = G.concepts || G.items || [];
const gItems = [];
for (const c of concepts) for (const t of (c.templates || c.exercises || [])) gItems.push({ c: c.id, t });
console.log('gramer kavram', concepts.length, 'şablon', gItems.length);
for (const g of pick(gItems, 10)) console.log(`G ${g.c} | ${JSON.stringify(g.t).slice(0, 320)}`);
