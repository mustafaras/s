#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
  'lexicon.verified.json': '16a1593415b1363493eb034a421e99a7bdc65e548cb2d517d9db27311d5d6d41',
  'surahs.verified.json': '83194a3c90ef1fc43e61666305a22c2a7bfc87e3780045c3651d4e089127a6e3'
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
  if (!match && !supplements.has(id)) supplements.set(id, { id, ar, tr, source: 'Diyanet prayer text + D-12 verified KAO Turkish layer (surahs.verified.json)' });
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
// `verifiedRows` verilirse (dondurma) Türkçe yalnız surahs.verified.json'dan gelir; referans
// yalnız hizalama ve kopya kapısı için okunur. Verilmezse (çalışma kitabı) referans tr döner.
function collectSurahs(verifiedRows = null) {
  const { qacWords, aligned, wordsByVerse, uthmaniSource } = verseData();
  const refs = [...wordsByVerse.keys()];
  const rawLines = uthmaniSource.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#'));
  const rawByRef = new Map(refs.map((ref, index) => [ref, rawLines[index]]));
  const reference = referenceMap();
  const trFor = (id, refKey) => {
    const referenceTr = reference.get(refKey)?.tr;
    if (!referenceTr) throw new Error(`${refKey}: Türkçe referans yok`);
    if (!verifiedRows) return referenceTr;
    const tr = verifiedRows[id]?.tr;
    if (!tr) throw new Error(`${id}: surahs.verified.json satırı yok`);
    if (isReferenceCopy(tr, referenceTr)) throw new Error(`${id}: referans kopyası (06 §2)`);
    return tr;
  };
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
    const id = `s-${qac.surah}-${qac.ayah}-${qac.wordIndex}`;
    const tr = trFor(id, `${ref}:${qac.wordIndex}`);
    if (!known && !supplements.has(lemmaId)) supplements.set(lemmaId, {
      id: lemmaId, ar: bwToArabic(qac.lemmaBw || qac.formBw), tr: trFor(lemmaId, `${ref}:${qac.wordIndex}`),
      lemmaBw: qac.lemmaBw, source: 'QAC lemma + D-12 verified KAO Turkish layer (surahs.verified.json)'
    });
    const pronunciation = qacPronunciation(qac);
    if (!pronunciation) throw new Error(`${ref}:${qac.wordIndex}: Latin okunuş yok`);
    words.push({ id, surahId: qac.surah, ayah: qac.ayah, i: qac.wordIndex, ar, lemmaId, tr, pronunciation });
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
    const refKey = `${ref}:${qac.wordIndex}`;
    const tr = trFor(`f-1-${qac.ayah}-${qac.wordIndex}`, refKey);
    if (!known && !supplements.has(lemmaId)) supplements.set(lemmaId, { id: lemmaId, ar: bwToArabic(qac.lemmaBw || qac.formBw), tr: trFor(lemmaId, refKey), source: 'QAC lemma + D-12 verified KAO Turkish layer (surahs.verified.json)' });
    const pronunciation = qacPronunciation(qac);
    if (!pronunciation) throw new Error(`${ref}:${qac.wordIndex}: Fâtiha Latin okunuşu yok`);
    fatiha.push({ ar, tr, lemmaId, pronunciation });
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
  const fatihaRefs = qacWords.filter((word) => word.surah === 1).map((word) => `1:${word.ayah}:${word.wordIndex}`);
  // Dua kelimesi tamamlayıcıları (lp_) quran.com referansı taşımaz; Türkçesi yine yerel katmandan.
  const resolved = !verifiedRows ? supplements : new Map([...supplements].map(([id, item]) => {
    if (!id.startsWith('lp_')) return [id, item];
    const tr = verifiedRows[id]?.tr;
    if (!tr) throw new Error(`${id}: surahs.verified.json satırı yok`);
    return [id, { ...item, tr }];
  }));
  return { words, fatiha, fatihaRefs, waqfMarks, supplements: resolved, prayerTexts, reference };
}
function freezeSurahs() {
  const surahVerified = readJson('surahs.verified.json');
  const { total, filled, copy, language } = surahVerified.counts || {};
  if (!total || filled !== total || copy || language) throw new Error(`surahs.verified.json eksik ya da kapı açık: ${JSON.stringify(surahVerified.counts)}`);
  const { words, waqfMarks, supplements, prayerTexts } = collectSurahs(surahVerified.rows);
  const names = ['Nâs','Felak','İhlâs','Tebbet','Nasr','Kâfirûn','Kevser','Mâûn','Kureyş','Fîl','Hümeze','Asr','Tekâsür','Kâria','Âdiyât','Zilzâl','Beyyine','Kadir','Alak','Tîn'];
  const surahs = names.map((name, index) => ({ id: 114 - index, name }));
  const data = {
    METHODOLOGY_TR: 'Kur’an kelimeleri pinned Tanzil Uthmani metni ile QAC 0.4 morfolojisinden hizalandı; Türkçe kelime katmanı KAO’nun kendi çevirisidir (kuran-ogreniyorum/content/surahs.verified.json, D-12); quran.com kelime referansı yalnız kopya denetiminde kullanıldı, dağıtılmaz. Ana 524 lemma dışında kalan kayıtlar bu modülde tamamlayıcı sözlük olarak tutulur.',
    ATTRIBUTION: { generatedAt: '2026-09-26', sources: [
      { name: 'Tanzil Uthmani', license: 'CC BY 3.0', url: 'https://tanzil.net/download/' },
      { name: 'Quranic Arabic Corpus 0.4', license: 'GNU GPL', url: 'https://corpus.quran.com/download/' },
      { name: 'Diyanet Namaz Duaları', url: DIANET_DUALAR }, { name: 'Diyanet Temel Dini Bilgiler', url: DIANET_NAMAZ }
    ], verification: 'D-12 · kuran-ogreniyorum/content/surahs.verified.json (yerel çeviri; quran.com yalnız kopya-denetim referansı, dağıtılmaz)' },
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

// --- KAO-FIX-02: kısa sûre çeviri çalışma kitabı ve içe alma kapısı (K-1, Y-3) ---
// Türkçe katman quran.com referansından değil `surahs.verified.json`'dan gelecek (FIX-04).
// Referans yalnız kopya denetimi ve kısaltılmış ipucu için okunur; çalışma kitabına tamamı yazılmaz.
const SURAH_REVIEW = path.join(CONTENT, 'surahs.review.md');
const SURAH_VERIFIED = path.join(CONTENT, 'surahs.verified.json');
const SURAH_PARTS = Object.freeze([
  ['A', 'Parti A (95–98)'], ['B', 'Parti B (99–105)'], ['C', 'Parti C (106–114)'], ['D', 'Parti D (Fâtiha + tamamlayıcı sözlük)']
]);
const SURAH_COLUMNS = ['id', 'ar', 'pronunciation', 'lemmaId', 'ref', 'referans-ipucu', 'tr', 'verifiedBy', 'verifiedAt'];
const SURAH_ROW_ID = /^(?:s-\d+-\d+-\d+|f-1-\d+-\d+|ls_\S+|lp_\S+)$/;
const HINT_CHARS = 24;
const ENGLISH_MARKERS = new Set(['the', 'their', 'his', 'those', 'which', 'they', 'them', 'of', 'and', 'will', 'shall', 'your', 'our', 'who', 'what', 'that']);

function surahPart(surahId) {
  if (surahId >= 95 && surahId <= 98) return 'A';
  if (surahId >= 99 && surahId <= 105) return 'B';
  return 'C';
}
function copyForms(value) {
  const normalize = (text) => text.toLocaleLowerCase('tr').replace(/[\p{P}\p{S}]+/gu, ' ').replace(/\s+/g, ' ').trim();
  const text = String(value || '');
  return new Set([normalize(text), normalize(text.replace(/\([^)]*\)|\[[^\]]*\]/g, ' '))].filter(Boolean));
}
function isReferenceCopy(tr, referenceTr) {
  const referenceForms = copyForms(referenceTr);
  return [...copyForms(tr)].some((form) => referenceForms.has(form));
}
function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
// Tek satırın denetimi. Boş `tr` → `missing` (içe almada hata değil, kademeli doldurma).
function validateSurahRow(row, referenceTr) {
  const tr = String(row.tr || '').trim();
  if (!tr) return [{ code: 'missing', message: 'tr boş' }];
  const errors = [];
  if (/[|\r\n]/.test(tr)) errors.push({ code: 'format', message: 'tr tablo ayırıcısı ya da satır sonu taşıyamaz' });
  if (referenceTr && isReferenceCopy(tr, referenceTr)) errors.push({ code: 'copy', message: 'referansın kopyası (06 §2) — kendi ifadeni yaz' });
  const english = tr.toLowerCase().split(/[^\p{L}]+/u).filter((word) => ENGLISH_MARKERS.has(word));
  if (english.length) errors.push({ code: 'language', message: `İngilizce işaret kelimesi: ${[...new Set(english)].join(', ')}` });
  if (!String(row.verifiedBy || '').trim()) errors.push({ code: 'verifiedBy', message: 'verifiedBy boş' });
  if (!isIsoDate(String(row.verifiedAt || '').trim())) errors.push({ code: 'verifiedAt', message: 'verifiedAt YYYY-AA-GG olmalı' });
  return errors;
}
function hintOf(text) {
  const chars = Array.from(String(text || '').replace(/[|\r\n]+/g, ' / ').trim());
  return chars.length ? `${chars.slice(0, HINT_CHARS).join('')}…` : '—';
}
function cell(value) {
  return String(value ?? '').replace(/[|\r\n]+/g, ' / ').trim();
}
// Kaynak satırlar: 618 sûre kelimesi (A–C), 29 Fâtiha kelimesi ve tamamlayıcı sözlük (D).
function surahSourceRows() {
  const { words, fatiha, fatihaRefs, supplements, prayerTexts, reference } = collectSurahs();
  const referenceTr = (ref) => reference.get(ref)?.tr || null;
  const rows = words.map((word) => {
    const ref = `${word.surahId}:${word.ayah}:${word.i}`;
    return { part: surahPart(word.surahId), id: word.id, ar: word.ar, pronunciation: word.pronunciation, lemmaId: word.lemmaId, ref, referenceTr: referenceTr(ref), hint: referenceTr(ref) };
  });
  fatiha.forEach((word, index) => {
    const ref = fatihaRefs[index];
    const [, ayah, position] = ref.split(':');
    rows.push({ part: 'D', id: `f-1-${ayah}-${position}`, ar: word.ar, pronunciation: word.pronunciation, lemmaId: word.lemmaId, ref, referenceTr: referenceTr(ref), hint: referenceTr(ref) });
  });
  // Tamamlayıcı kaydın bağlamı: onu ilk yaratan kelime (üretim sırasıyla aynı tarama).
  const firstUse = new Map();
  const note = (lemmaId, ref, word) => { if (!firstUse.has(lemmaId)) firstUse.set(lemmaId, { ref, word }); };
  words.forEach((word) => note(word.lemmaId, `${word.surahId}:${word.ayah}:${word.i}`, word));
  fatiha.forEach((word, index) => note(word.lemmaId, fatihaRefs[index], word));
  prayerTexts.filter((item) => item.id !== 'fatiha' && item.id !== 'zamm_sure')
    .forEach((item) => item.words.forEach((word) => note(word.lemmaId, `prayer:${item.id}`, word)));
  for (const item of supplements.values()) {
    const use = firstUse.get(item.id);
    if (!use) throw new Error(`${item.id}: tamamlayıcı kaydın kaynağı bulunamadı`);
    const isPrayer = use.ref.startsWith('prayer:');
    rows.push({
      part: 'D', id: item.id, ar: item.ar, pronunciation: isPrayer ? use.word.pronunciation : '—', lemmaId: item.id, ref: use.ref,
      referenceTr: isPrayer ? null : referenceTr(use.ref), hint: isPrayer ? use.word.tr : referenceTr(use.ref)
    });
  }
  const ids = new Set();
  for (const row of rows) {
    if (!SURAH_ROW_ID.test(row.id)) throw new Error(`${row.id}: beklenmeyen satır kimliği`);
    if (ids.has(row.id)) throw new Error(`${row.id}: yinelenen kaynak satırı`);
    ids.add(row.id);
  }
  return rows;
}
function renderSurahWorkbook(sourceRows, values = new Map()) {
  const lines = [
    '# KAO kısa sûre çeviri çalışma kitabı (KAO-FIX-02)',
    '',
    '> Üretildi: `node tools/kao-content-freeze.mjs --surah-workbook` · içe alma: `--surah-import` → `surahs.verified.json`.',
    '> Yalnız `tr`, `verifiedBy`, `verifiedAt` sütunları doldurulur; diğer sütunlar araç çıktısıdır, elle düzenlenmez.',
    '> `referans-ipucu` quran.com kelime referansının ilk 24 karakteridir (lp_ satırlarında Diyanet dua anlamı); bağlam içindir, **kopyalanmaz** (06 §2).',
    '> Kapı: boş `tr` = missing · referansla aynı = copy · İngilizce işaret kelimesi = language · `verifiedAt` biçimi `YYYY-AA-GG`.',
    ''
  ];
  for (const [part, title] of SURAH_PARTS) {
    const partRows = sourceRows.filter((row) => row.part === part);
    lines.push(`## ${title}`, '', `| ${SURAH_COLUMNS.join(' | ')} |`, `|${SURAH_COLUMNS.map(() => '---').join('|')}|`);
    for (const row of partRows) {
      const value = values.get(row.id) || {};
      lines.push(`| ${[row.id, row.ar, row.pronunciation, row.lemmaId, row.ref, hintOf(row.hint), value.tr, value.verifiedBy, value.verifiedAt].map(cell).join(' | ')} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}
function parseSurahWorkbook(markdown) {
  const rows = [];
  const seen = new Set();
  for (const line of String(markdown).split(/\r?\n/)) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((value) => value.trim());
    if (cells[0] === 'id' || cells.every((value) => /^-+$/.test(value))) continue;
    if (cells.length !== SURAH_COLUMNS.length || !SURAH_ROW_ID.test(cells[0])) throw new Error(`tanınmayan tablo satırı: ${line.slice(0, 80)}`);
    if (seen.has(cells[0])) throw new Error(`${cells[0]}: yinelenen satır`);
    seen.add(cells[0]);
    rows.push({ id: cells[0], tr: cells[6], verifiedBy: cells[7], verifiedAt: cells[8] });
  }
  return rows;
}
function classifySurahRows(sourceRows, parsedRows) {
  const byId = new Map(parsedRows.map((row) => [row.id, row]));
  const known = new Set(sourceRows.map((row) => row.id));
  const unknown = parsedRows.filter((row) => !known.has(row.id)).map((row) => row.id);
  if (unknown.length) throw new Error(`bilinmeyen satır kimliği: ${unknown.slice(0, 5).join(', ')}`);
  const counts = { total: sourceRows.length, filled: 0, copy: 0, language: 0, missing: 0, invalid: 0 };
  const rows = {};
  const problems = [];
  for (const source of sourceRows) {
    const row = byId.get(source.id) || { id: source.id };
    const found = validateSurahRow(row, source.referenceTr).map((error) => error.code);
    if (!found.length) {
      counts.filled += 1;
      rows[source.id] = { tr: row.tr.trim(), verifiedBy: row.verifiedBy.trim(), verifiedAt: row.verifiedAt.trim() };
      continue;
    }
    const category = ['missing', 'copy', 'language'].find((code) => found.includes(code)) || 'invalid';
    counts[category] += 1;
    if (category !== 'missing') problems.push({ id: source.id, codes: found });
  }
  return { counts, rows, problems };
}
function readSurahVerified() {
  return fs.existsSync(SURAH_VERIFIED) ? JSON.parse(fs.readFileSync(SURAH_VERIFIED, 'utf8')) : null;
}
function surahWorkbook(part) {
  if (part && !SURAH_PARTS.some(([key]) => key === part)) throw new Error(`--part A|B|C|D olmalı (${part})`);
  const sourceRows = surahSourceRows();
  // Doldurulmuş satır silinmez: önce doğrulanmış JSON, üstüne mevcut çalışma kitabının dolu satırları.
  const values = new Map(Object.entries(readSurahVerified()?.rows || {}));
  if (fs.existsSync(SURAH_REVIEW)) {
    for (const row of parseSurahWorkbook(fs.readFileSync(SURAH_REVIEW, 'utf8'))) if (row.tr) values.set(row.id, row);
  }
  fs.writeFileSync(SURAH_REVIEW, renderSurahWorkbook(sourceRows, values));
  for (const [key, title] of SURAH_PARTS.filter(([key]) => !part || key === part)) {
    const partRows = sourceRows.filter((row) => row.part === key);
    console.log(`${title}: ${partRows.length} satır, ${partRows.filter((row) => values.get(row.id)?.tr).length} dolu`);
  }
  console.log(`${path.relative(ROOT, SURAH_REVIEW)}: ${sourceRows.length} satır`);
}
function surahImport() {
  if (!fs.existsSync(SURAH_REVIEW)) throw new Error('surahs.review.md yok; önce --surah-workbook');
  const sourceRows = surahSourceRows();
  const { counts, rows, problems } = classifySurahRows(sourceRows, parseSurahWorkbook(fs.readFileSync(SURAH_REVIEW, 'utf8')));
  const previous = readSurahVerified();
  // Satırlar değişmediyse importedAt korunur; dosya ve hash'i gereksiz yere değişmez.
  const unchanged = previous && JSON.stringify(previous.rows) === JSON.stringify(rows);
  const importedAt = unchanged ? previous.importedAt : new Date().toISOString();
  fs.writeFileSync(SURAH_VERIFIED, `${JSON.stringify({ schemaVersion: 1, importedAt, rows, counts }, null, 2)}\n`);
  for (const problem of problems.slice(0, 20)) console.error(`${problem.id}: ${problem.codes.join(', ')}`);
  console.log(`surah-import ${JSON.stringify(counts)}`);
  if (counts.copy > 0 || counts.language > 0 || counts.invalid > 0) process.exitCode = 1;
}

const USAGE = 'Kullanım: node tools/kao-content-freeze.mjs --freeze-grammar|--freeze-surahs|--freeze-phonics|--surah-workbook [--part A|B|C|D]|--surah-import';
function runCli(argv) {
  const modes = new Map([
    ['--freeze-grammar', freezeGrammar], ['--freeze-surahs', freezeSurahs], ['--freeze-phonics', freezePhonics], ['--surah-import', surahImport]
  ]);
  if (argv[0] === '--surah-workbook' && (argv.length === 1 || (argv.length === 3 && argv[1] === '--part'))) {
    surahWorkbook(argv[2]);
    return;
  }
  if (argv.length !== 1 || !modes.has(argv[0])) {
    console.error(USAGE);
    process.exitCode = 64;
    return;
  }
  modes.get(argv[0])();
}

export { validateSurahRow, renderSurahWorkbook, parseSurahWorkbook, classifySurahRows };

const IS_MAIN = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (IS_MAIN) runCli(process.argv.slice(2));
