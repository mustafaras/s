#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INPUTS, readPinnedInput, readUthmaniInput, parseMorphology, parseUthmani, bwToArabic, translitTr, wordTranslitTr } from './kao-lexicon-build.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'kuran-ogreniyorum/content');
const OUT = path.join(ROOT, 'app/content');
const QAC = path.join(CONTENT, 'inputs/quranic-corpus-morphology-0.4.txt');
const DIANET_DUALAR = 'https://dijital.diyanet.gov.tr/File/Download?id=6054&path=6054_1.pdf';
const DIANET_NAMAZ = 'https://dijital.diyanet.gov.tr/File/Download?id=4218&path=4218_1.pdf';

const JSON_SHA256 = Object.freeze({
  'lexicon.reference.json': '2ee7ca3d011a4fef232bffb407fac9f079ebb9b66baca5475b1a783617ed8ef6',
  'grammar.verified.json': 'd03cd3be7e14a799025c112b2deeb1a981e501a4492d1bcc55ba50afb6f6b4fd',
  'phonics.verified.json': '895d4d5a58aa5d457cf38d8ebffb5843bce07c896f8c7afaeb00ebf147b23384',
  'lexicon.verified.json': '16a1593415b1363493eb034a421e99a7bdc65e548cb2d517d9db27311d5d6d41'
});
function readJson(file) {
  const buffer = fs.readFileSync(path.join(CONTENT, file));
  const actual = crypto.createHash('sha256').update(buffer).digest('hex');
  if (actual !== JSON_SHA256[file]) throw new Error(`${file}: sha256 uyuşmuyor (${actual}) (pini güncelle: shasum -a 256 kuran-ogreniyorum/content/${file})`);
  return JSON.parse(buffer.toString('utf8'));
}
function deepFreezeRuntime() {
  return "function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.keys(v).forEach(function(k){freeze(v[k]);});Object.freeze(v);}return v;}";
}
function wrapper(globalName, version, data, extras = '') {
  return `(function(){'use strict';${deepFreezeRuntime()}var data=${JSON.stringify(data)};${extras}data.version=${JSON.stringify(version)};window.${globalName}=freeze(data);})();\n`;
}
function write(relative, source, budget) {
  const bytes = Buffer.byteLength(source);
  if (bytes > budget) throw new Error(`${relative}: ${bytes} bayt > ${budget}`);
  fs.writeFileSync(path.join(ROOT, relative), source);
  console.log(`${relative}: ${bytes} bayt`);
}
function turkishPronunciation(value) {
  return String(value || '').toLowerCase()
    .replace(/q/g, 'k').replace(/w/g, 'v').replace(/j/g, 'c')
    .replace(/ā/g, 'â').replace(/ī/g, 'î').replace(/ū/g, 'û')
    .replace(/ḥ/g, 'h').replace(/ṣ/g, 's').replace(/ḍ/g, 'd').replace(/ṭ/g, 't').replace(/ẓ/g, 'z');
}
function qacPronunciation(word, includePrefixes = true) {
  return turkishPronunciation(wordTranslitTr(word, includePrefixes));
}
function compactCell(cell, pronunciationSources) {
  if (cell.text) return cell.text;
  const resolved = cell.resolved || {};
  let pronunciation = resolved.translit || '';
  if (!pronunciation && resolved.ref) {
    const qac = pronunciationSources.qac.get(resolved.ref);
    if (qac) {
      const all = qac.segments.map((segment) => segment.form).join('');
      pronunciation = qacPronunciation(qac, normalizedArabic(bwToArabic(all)) === normalizedArabic(resolved.ar));
    }
  }
  pronunciation = turkishPronunciation(pronunciation);
  if (resolved.ar && !pronunciation) throw new Error(`${resolved.ref || resolved.lemmaId || 'hücre'}: Arapça hücre okunuşsuz dondurulamaz`);
  return [resolved.ref || null, resolved.ar || null, pronunciation || null];
}
function freezeGrammar() {
  const input = readJson('grammar.verified.json');
  if (input.consistencyTotal !== 0 || input.verifiedTotal !== 26) throw new Error('grammar.verified doğrulama kapısı geçmedi');
  const qac = parseMorphology(readPinnedInput(path.dirname(QAC), INPUTS.morphology).text).words;
  const pronunciationSources = { qac: new Map(qac.map((word) => [word.key, word])) };
  const concepts = input.concepts.map((item) => ({
    id: item.id, unit: item.unit, order: item.order, title: item.title,
    plainTr: item.plainTr, termTr: item.termTr,
    tables: item.tables.map((table) => ({
      title: table.title, columns: table.columns,
      rows: table.rows.map((row) => ({ label: row.label, cells: row.cells.map((cell) => compactCell(cell, pronunciationSources)) }))
    })),
    templates: item.templates.map((template) => ({
      id: template.id, type: template.type, exampleId: template.exampleId,
      errorClass: template.errorClass, prompt: template.prompt
    })), verified: true
  }));
  const unit11 = {
    id: input.unit11.id, title: input.unit11.title, note: input.unit11.note,
    roots: input.unit11.roots.map((root) => ({
      root: root.resolved.root, pronunciation: Array.from(turkishPronunciation(translitTr(root.rootBw))).join('–'), meaning: root.meaning,
      derivatives: root.derivatives.map((item) => ({ tr: item.tr, pattern: item.pattern }))
    })), verified: true
  };
  const data = {
    METHODOLOGY_TR: 'KAO-04 D-12 doğrulanmış gramer katmanının boyut-bütçeli, ağsız ve salt çalışma zamanı izdüşümüdür.',
    ATTRIBUTION: { source: 'grammar.verified.json', pronunciation: 'Pinned QAC 0.4 Buckwalter surface forms; deterministic D-12 Turkish-Latin projection', verification: 'D-12', generatedAt: '2026-09-25' },
    concepts, unit11
  };
  const extras = "var byId=Object.create(null);data.concepts.forEach(function(x){byId[x.id]=x;});data.byId=function(id){return byId[id]||null;};";
  write('app/content/quranGrammarV1.js', wrapper('QuranGrammarV1', 'quran-grammar-tr-v1', data, extras), 60 * 1024);
}

function lemmaKey(value) {
  const slug = String(value || 'unknown').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24) || 'unknown';
  return `ls_${slug}_${crypto.createHash('sha1').update(String(value || 'unknown')).digest('hex').slice(0, 8)}`;
}
function verseData() {
  const inputDir = path.dirname(QAC);
  const morphology = readPinnedInput(inputDir, INPUTS.morphology);
  const qacWords = parseMorphology(morphology.text).words;
  const verseTotal = new Set(qacWords.map((word) => `${word.surah}:${word.ayah}`)).size;
  const uthmaniSource = readUthmaniInput(inputDir, verseTotal).text;
  const aligned = parseUthmani(uthmaniSource, qacWords).byVerse;
  const wordsByVerse = new Map();
  for (const word of qacWords) {
    const ref = `${word.surah}:${word.ayah}`;
    if (!wordsByVerse.has(ref)) wordsByVerse.set(ref, []);
    wordsByVerse.get(ref).push(word);
  }
  return { qacWords, aligned, wordsByVerse, uthmaniSource };
}
function referenceMap() {
  return new Map(readJson('lexicon.reference.json').words.map((item) => [`${item.ref}:${item.position}`, item]));
}
function normalizedArabic(value) {
  return String(value || '').normalize('NFKD').replace(/\p{M}/gu, '').replace(/ـ/gu, '').replace(/[ٱأإآ]/gu, 'ا').replace(/ى/gu, 'ي');
}
function prayerWord(ar, tr, pronunciation, lemmaIndex, supplements) {
  const normalized = normalizedArabic(ar.replace(/^[وفبكل]+(?=\p{L}{2})/u, ''));
  const match = lemmaIndex.find((item) => normalizedArabic(item.ar) === normalized);
  const id = match ? match.lemmaId : `lp_${crypto.createHash('sha1').update(normalized).digest('hex').slice(0, 10)}`;
  if (!match && !supplements.has(id)) supplements.set(id, { id, ar, tr, source: 'Diyanet prayer text; D-12 verified' });
  return { ar, tr, lemmaId: id, pronunciation };
}
// Diyanet dua satırlarının Latin okunuşu (KAO-16b, D-12 yapay zekâ doğrulaması): Fâtiha/İhlâs'ın mekanik okunuş biçimini
// izler (al- öneki, li-/va-/bi-, â î û, ʿ); Diyanet imlâsında vasıl/hançer elif olmadığı için elle, kelime kelime verilir.
const PRAYER_READINGS = Object.freeze({"tekbir":["allahu","akbaru"],"subhaneke":["subhânaka","allahumma","va-bi-hamdika","va-tabâraka","ismuka","va-taʿâlâ","cadduka","va-lâ","ilâha","gayruka"],"ruku":["subhâna","rabbiya","al-ʿazîmi"],"secde":["subhâna","rabbiya","al-aʿlâ"],"tahiyyat":["al-tahiyyâtu","li-lahi","va-al-salavâtu","va-al-tayyibâtu","al-salâmu","ʿalayka","ayyuhâ","al-nabiyyu","va-rahmetu","allahi","va-barakâtuhu","al-salâmu","ʿalaynâ","va-ʿalâ","ʿibâdi","allahi","al-sâlihîna","aşhadu","an","lâ","ilâha","illâ","allahu","va-aşhadu","anna","muhammaden","ʿabduhu","va-rasûluhu"],"selam":["al-salâmu","ʿalaykum","va-rahmetu","allahi"]});
function prayerLine(id, title, text, meanings, readings, lemmaIndex, supplements) {
  const tokens = text.trim().split(/\s+/);
  if (tokens.length !== meanings.length || tokens.length !== readings.length) throw new Error(`${id}: prayer word/meaning/reading mismatch ${tokens.length}/${meanings.length}/${readings.length}`);
  return { id, title, words: tokens.map((ar, index) => prayerWord(ar, meanings[index], readings[index], lemmaIndex, supplements)) };
}
function freezeSurahs() {
  const { qacWords, aligned, wordsByVerse, uthmaniSource } = verseData();
  const refs = [...wordsByVerse.keys()];
  const rawLines = uthmaniSource.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#'));
  const rawByRef = new Map(refs.map((ref, index) => [ref, rawLines[index]]));
  const reference = referenceMap();
  const verified = readJson('lexicon.verified.json').lemmas;
  const knownByBw = new Map(verified.map((item) => [item.lemmaBw, item]));
  const supplements = new Map();
  const words = [];
  const waqfMarks = [];
  const allowed = new Set(['ۚ', 'ۖ', 'ۗ', 'ۘ', 'ۙ', 'ۛ']);
  for (const qac of qacWords.filter((word) => word.surah >= 95 && word.surah <= 114)) {
    const ref = `${qac.surah}:${qac.ayah}`;
    const ar = aligned.get(ref)[qac.wordIndex - 1];
    const known = knownByBw.get(qac.lemmaBw);
    const lemmaId = known ? known.lemmaId : lemmaKey(qac.lemmaBw || qac.formBw);
    const translated = reference.get(`${ref}:${qac.wordIndex}`);
    if (!translated?.tr) throw new Error(`${ref}:${qac.wordIndex}: Türkçe referans yok`);
    if (!known && !supplements.has(lemmaId)) supplements.set(lemmaId, {
      id: lemmaId, ar: bwToArabic(qac.lemmaBw || qac.formBw), tr: translated.tr,
      lemmaBw: qac.lemmaBw, source: 'QAC lemma + D-12 verified Quran.com Turkish word reference'
    });
    const pronunciation = qacPronunciation(qac);
    if (!pronunciation) throw new Error(`${ref}:${qac.wordIndex}: Latin okunuş yok`);
    words.push({ id: `s-${qac.surah}-${qac.ayah}-${qac.wordIndex}`, surahId: qac.surah, ayah: qac.ayah, i: qac.wordIndex, ar, lemmaId, tr: translated.tr, pronunciation });
  }
  for (const ref of refs.filter((value) => Number(value.split(':')[0]) >= 95)) {
    const [surah, ayah] = ref.split(':').map(Number);
    let tokens = rawByRef.get(ref).split(/\s+/);
    const expected = wordsByVerse.get(ref).length;
    if (ayah === 1 && surah !== 9 && tokens.filter((x) => /\p{L}/u.test(x)).length >= expected + 4) {
      let skipped = 0;
      tokens = tokens.filter((token) => { if (skipped < 4 && /\p{L}/u.test(token)) { skipped += 1; return false; } return skipped >= 4; });
    }
    let position = 0;
    for (const token of tokens) {
      if (/\p{L}/u.test(token)) position += 1;
      for (const mark of Array.from(token).filter((char) => allowed.has(char))) {
        waqfMarks.push({ mark, afterWordId: `s-${surah}-${ayah}-${Math.max(1, position)}` });
      }
    }
  }
  const fatiha = [];
  for (const qac of qacWords.filter((word) => word.surah === 1)) {
    const ref = `1:${qac.ayah}`; const ar = aligned.get(ref)[qac.wordIndex - 1];
    const known = knownByBw.get(qac.lemmaBw); const lemmaId = known ? known.lemmaId : lemmaKey(qac.lemmaBw || qac.formBw);
    const translated = reference.get(`${ref}:${qac.wordIndex}`);
    if (!known && !supplements.has(lemmaId)) supplements.set(lemmaId, { id: lemmaId, ar: bwToArabic(qac.lemmaBw || qac.formBw), tr: translated.tr, source: 'QAC lemma + D-12 verified reference' });
    const pronunciation = qacPronunciation(qac);
    if (!pronunciation) throw new Error(`${ref}:${qac.wordIndex}: Fâtiha Latin okunuşu yok`);
    fatiha.push({ ar, tr: translated.tr, lemmaId, pronunciation });
  }
  const p = (id, title, text, meanings) => prayerLine(id, title, text, meanings, PRAYER_READINGS[id], verified, supplements);
  const prayerTexts = [
    p('tekbir', 'İftitah tekbiri', 'اللَّهُ أَكْبَرُ', ['Allah', 'en büyüktür']),
    p('subhaneke', 'Sübhâneke', 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ', ['seni tenzih ederim', 'Allahım', 'hamdinle', 'bereketlidir', 'adın', 'yücedir', 'şanın', 've yoktur', 'ilah', 'senden başka']),
    { id: 'fatiha', title: 'Fâtiha', words: fatiha },
    { id: 'zamm_sure', title: 'Zamm-ı sûre (İhlâs)', words: words.filter((word) => word.surahId === 112).map(({ ar, tr, lemmaId, pronunciation }) => ({ ar, tr, lemmaId, pronunciation })) },
    p('ruku', 'Rükû tesbihi', 'سُبْحَانَ رَبِّيَ الْعَظِيمِ', ['tenzih ederim', 'Rabbimi', 'yüce']),
    p('secde', 'Secde tesbihi', 'سُبْحَانَ رَبِّيَ الْأَعْلَى', ['tenzih ederim', 'Rabbimi', 'en yüce']),
    p('tahiyyat', 'Tahiyyat', 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ', ['hürmetler', 'Allah içindir', 'dualar', 'güzel sözler', 'selam', 'senin üzerine', 'ey', 'peygamber', 'rahmeti', 'Allahın', 'bereketleri', 'selam', 'bizim üzerimize', 've üzerine', 'kullarının', 'Allahın', 'salihlerin', 'şahitlik ederim', 'ki', 'yoktur', 'ilah', 'başka', 'Allah', 've şahitlik ederim', 'ki', 'Muhammed', 'kuludur', 'elçisidir']),
    p('selam', 'Selâm', 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ', ['selam', 'üzerinize', 'rahmeti', 'Allahın'])
  ];
  for (const item of prayerTexts) for (const word of item.words) if (!word.pronunciation) throw new Error(`${item.id}: ${word.ar} Latin okunuşsuz dondurulamaz`);
  const names = ['Nâs','Felak','İhlâs','Tebbet','Nasr','Kâfirûn','Kevser','Mâûn','Kureyş','Fîl','Hümeze','Asr','Tekâsür','Kâria','Âdiyât','Zilzâl','Beyyine','Kadir','Alak','Tîn'];
  const surahs = names.map((name, index) => ({ id: 114 - index, name }));
  const data = {
    METHODOLOGY_TR: 'Kur’an kelimeleri pinned Tanzil Uthmani metni ile QAC 0.4 morfolojisinden hizalandı; Türkçe kelime katmanı D-12 kapsamında yerel referans üzerinden doğrulandı. Ana 524 lemma dışında kalan kayıtlar bu modülde tamamlayıcı sözlük olarak tutulur.',
    ATTRIBUTION: { generatedAt: '2026-09-24', sources: [
      { name: 'Tanzil Uthmani', license: 'CC BY 3.0', url: 'https://tanzil.net/download/' },
      { name: 'Quranic Arabic Corpus 0.4', license: 'GNU GPL', url: 'https://corpus.quran.com/download/' },
      { name: 'Diyanet Namaz Duaları', url: DIANET_DUALAR }, { name: 'Diyanet Temel Dini Bilgiler', url: DIANET_NAMAZ }
    ], verification: 'D-12' },
    S: surahs.map((item) => [item.id, item.name]),
    W: words.map((item) => [item.id, item.surahId, item.ayah, item.i, item.ar, item.lemmaId, item.tr, item.pronunciation]),
    M: waqfMarks.map((item) => [item.mark, item.afterWordId]),
    L: [...supplements.values()].map((item) => [item.id, item.ar, item.tr, item.lemmaBw || null, item.source, true]),
    P: prayerTexts.map((item) => [item.id, item.title, item.words.map((word) => [word.ar, word.tr, word.lemmaId, word.pronunciation || null])])
  };
  const extras = "data.surahs=data.S.map(function(x){return{id:x[0],name:x[1]};});data.words=data.W.map(function(x){return{id:x[0],surahId:x[1],ayah:x[2],i:x[3],ar:x[4],lemmaId:x[5],tr:x[6],pronunciation:x[7]};});data.waqfMarks=data.M.map(function(x){return{mark:x[0],afterWordId:x[1]};});data.supplements=data.L.map(function(x){return{id:x[0],ar:x[1],tr:x[2],lemmaBw:x[3],source:x[4],verified:x[5]===true};});data.prayerTexts=data.P.map(function(x){return{id:x[0],title:x[1],verified:true,words:x[2].map(function(w){return{ar:w[0],tr:w[1],lemmaId:w[2],pronunciation:w[3]};})};});delete data.S;delete data.W;delete data.M;delete data.L;delete data.P;var supplementIndex=Object.create(null);data.supplements.forEach(function(x){supplementIndex[x.id]=x;});data.lemmaById=function(id){return (window.QuranLexiconV1&&window.QuranLexiconV1.byId(id))||supplementIndex[id]||null;};";
  write('app/content/quranShortSurahsV1.js', wrapper('QuranShortSurahsV1', 'quran-short-surahs-tr-v1', data, extras), 90 * 1024);
}

function freezePhonics() {
  const input = readJson('phonics.verified.json');
  if (input.status !== 'verified' || input.review?.consistencyTotal !== 0) throw new Error('phonics.verified doğrulama kapısı geçmedi');
  const data = {
    METHODOLOGY_TR: 'KAO-23 D-12 doğrulanmış 28 harf, minimal çift, mahreç ve iki katmanlı transliterasyon içeriğidir.',
    ATTRIBUTION: { source: 'phonics.verified.json', verification: 'D-12', generatedAt: '2026-09-24' },
    letters: input.letters, pairs: input.pairs, rules: input.rules, translit: input.translit
  };
  write('app/content/quranPhonicsV1.js', wrapper('QuranPhonicsV1', 'quran-phonics-tr-v1', data), 40 * 1024);
}

const modes = new Map([
  ['--freeze-grammar', freezeGrammar], ['--freeze-surahs', freezeSurahs], ['--freeze-phonics', freezePhonics]
]);
const selected = process.argv.slice(2);
if (selected.length !== 1 || !modes.has(selected[0])) {
  console.error('Kullanım: node tools/kao-content-freeze.mjs --freeze-grammar|--freeze-surahs|--freeze-phonics');
  process.exitCode = 64;
} else {
  modes.get(selected[0])();
}
