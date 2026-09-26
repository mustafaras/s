'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

function load(relative, sandbox) {
  const file = path.join(repoRoot, relative);
  assert.ok(fs.existsSync(file), `${relative} bulunmalı`);
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: relative });
  return fs.statSync(file).size;
}

const sandbox = { window: {} };
vm.createContext(sandbox);
load('app/content/quranLexiconV1.js', sandbox);
const grammarBytes = load('app/content/quranGrammarV1.js', sandbox);
const surahBytes = load('app/content/quranShortSurahsV1.js', sandbox);
const phonicsBytes = load('app/content/quranPhonicsV1.js', sandbox);
assert.ok(grammarBytes <= 60 * 1024, 'gramer modülü 60 KB bütçesini aşmamalı');
assert.ok(surahBytes <= 90 * 1024, 'kısa sûre modülü 90 KB bütçesini aşmamalı');
assert.ok(phonicsBytes <= 40 * 1024, 'fonetik modülü 40 KB bütçesini aşmamalı');

const grammar = sandbox.window.QuranGrammarV1;
assert.ok(grammar && Object.isFrozen(grammar));
assert.equal(grammar.concepts.length, 25);
assert.ok(grammar.byId('g0_5'), 'G0.5 kavramı bulunmalı');
assert.equal(grammar.unit11.roots.length, 73);
assert.equal(grammar.unit11.roots.reduce((sum, root) => sum + root.derivatives.length, 0), 242);

const phonics = sandbox.window.QuranPhonicsV1;
assert.ok(phonics && Object.isFrozen(phonics));
assert.equal(phonics.letters.length, 28);
assert.equal(new Set(phonics.letters.map((item) => item.id)).size, 28);
assert.equal(phonics.pairs.length, 12);
assert.equal(phonics.rules.length, 7);
assert.equal(Object.keys(phonics.translit.bwToOkunus).length, 28);
assert.equal(Object.keys(phonics.translit.bwToDia).length, 28);
const paired = new Set(phonics.pairs.flatMap((pair) => [pair.a, pair.b]));
for (const letter of phonics.letters.filter((item) => item.bucket === 'B' || item.bucket === 'C')) {
  assert.ok(paired.has(letter.id), `${letter.id}: B/C harfinin minimal çifti olmalı`);
  assert.ok(letter.svg, `${letter.id}: B/C harfinin SVG kimliği olmalı`);
}

const surahs = sandbox.window.QuranShortSurahsV1;
assert.ok(surahs && Object.isFrozen(surahs));
assert.equal(surahs.surahs.length, 20);
assert.deepEqual(Array.from(surahs.surahs, (item) => item.id), Array.from({ length: 20 }, (_, i) => 114 - i));
assert.equal(surahs.words.length, 618);
const allowedWaqf = new Set(['ۚ', 'ۖ', 'ۗ', 'ۘ', 'ۙ', 'ۛ']);
assert.ok(surahs.waqfMarks.length > 0, 'kısa sûrelerdeki vakıf işaretleri korunmalı');
assert.equal(surahs.waqfMarks.length, 6, 'pinned Tanzil kısa sûre vakıf toplamı korunmalı');
assert.equal(surahs.waqfMarks.filter((item) => item.mark === 'ۚ').length, 4);
assert.equal(surahs.waqfMarks.filter((item) => item.mark === 'ۖ').length, 2);
const wordIds = new Set(surahs.words.map((word) => word.id));
for (const mark of surahs.waqfMarks) {
  assert.ok(allowedWaqf.has(mark.mark), `bilinmeyen vakıf işareti: ${mark.mark}`);
  assert.match(mark.afterWordId, /^s-\d+-\d+-\d+$/);
  assert.ok(wordIds.has(mark.afterWordId), `${mark.afterWordId}: vakıf konumu gerçek kelimeye bağlanmalı`);
}
assert.deepEqual(Array.from(surahs.prayerTexts, (item) => item.id),
  ['tekbir', 'subhaneke', 'fatiha', 'zamm_sure', 'ruku', 'secde', 'tahiyyat', 'selam']);
for (const item of surahs.prayerTexts) {
  assert.equal(item.verified, true, `${item.id}: D-12 doğrulaması gerekli`);
  assert.ok(item.words.length > 0, `${item.id}: kelime içermeli`);
  for (const word of item.words) {
    const lemma = surahs.lemmaById(word.lemmaId);
    assert.ok(lemma, `${item.id}: ${word.lemmaId} çözümlenmeli`);
    assert.equal(lemma.verified, true, `${item.id}: ${word.lemmaId} doğrulanmış olmalı`);
  }
}

for (const source of [
  fs.readFileSync(path.join(repoRoot, 'app/content/quranGrammarV1.js'), 'utf8'),
  fs.readFileSync(path.join(repoRoot, 'app/content/quranShortSurahsV1.js'), 'utf8'),
  fs.readFileSync(path.join(repoRoot, 'app/content/quranPhonicsV1.js'), 'utf8')
]) assert.ok(!/\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB)\b/.test(source));


// ── KAO-26 · E8 Telaffuz stüdyosu: R-B6 SVG sözleşmesi + görev/FSRS/R-C2 sözleşmesi ─────────
const svgDir = path.join(repoRoot, 'assets/kao/svg');
const svgFiles = fs.readdirSync(svgDir).filter((name) => name.endsWith('.svg')).sort();
assert.equal(svgFiles.length, 13, 'R-B6: 13 mahreç SVG');
const studioBox = { window: {}, Date, Math, Number, String, Object, Array, JSON };
vm.createContext(studioBox);
for (const relative of ['app/content/quranLexiconV1.js', 'app/content/quranShortSurahsV1.js', 'app/content/quranPhonicsV1.js', 'app/core/quranLearn.js']) load(relative, studioBox);
const studio = studioBox.window.SeymaQuranLearn;
for (const name of svgFiles) {
  const body = fs.readFileSync(path.join(svgDir, name), 'utf8');
  assert.ok(Buffer.byteLength(body) <= 4096, `${name}: ≤4 KB`);
  assert.match(body, /^<svg[^>]*fill="currentColor"/, `${name}: currentColor`);
  assert.doesNotMatch(body, /#[0-9a-f]{3,8}\b|<script|href=/i, `${name}: sabit renk/betik/bağlantı yok`);
  assert.equal(studio.kaoMahrecSvg[name.replace(/\.svg$/, '')], body.trim(), `${name}: gömülü kopya varlıkla birebir`);
}
assert.equal(Object.keys(studio.kaoMahrecSvg).length, 13);
for (const letter of phonics.letters.filter((item) => item.svg)) assert.ok(studio.kaoMahrecSvg[letter.svg.replace(/^.*\//, '').replace(/\.svg$/, '')], `${letter.id}: SVG gömülü`);

const studioData = { settings: {}, quranLearn: null };
const studioUi = {};
const played = [];
let failNextAudio = false;
assert.equal(studio.registerQuranLearn({ data() { return studioData; }, ui() { return studioUi; }, save() {}, render() {}, todayStr() { return '2026-09-25'; }, esc(value) { return String(value); }, icon() { return ''; }, getDay() { return {}; } }), true);
assert.equal(studio.registerQuranLearnSurface({ lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return ''; }, restoreFocus() {}, sheetClose(_c, _b, body) { body(); }, mount() {}, createAudio(src) { const listeners = {}; const audio = { src, preload: 'auto', addEventListener(name, fn) { listeners[name] = fn; }, play() { played.push(audio); if (failNextAudio) { listeners.error(); return { catch() {} }; } if (listeners.ended) listeners.ended(); return { catch() {} }; } }; return audio; } }), true);
const studioQ = studio.ensureQuranLearn(studioData);

const tasks = studio.kaoPhonicsTasks(studioData, '2026-09-25T09:00:00', {});
assert.deepEqual(JSON.parse(JSON.stringify(tasks)), JSON.parse(JSON.stringify(studio.kaoPhonicsTasks(studioData, '2026-09-25T09:00:00', {}))), 'deterministik');
assert.deepEqual([...new Set(tasks.map((task) => task.kind))].sort(), ['letter', 'medd', 'order', 'shadda', 'waqf', 'word'], 'altı görev türü');
const audioFiles = new Set(fs.readdirSync(path.join(repoRoot, 'assets/kao/audio')));
for (const task of tasks) {
  assert.match(task.cardKey, /^p:/);
  assert.equal(task.choices.filter((choice) => choice.correct).length, task.kind === 'order' ? 0 : 1, `${task.id}: tek doğru`);
  for (const clip of task.clips || []) { assert.match(clip, /^assets\/kao\/audio\/[A-Za-z0-9_-]+\.m4a$/); assert.ok(audioFiles.has(clip.slice('assets/kao/audio/'.length)), `${clip} paketli olmalı`); }
  assert.equal(!!task.audio, task.kind !== 'waqf', `${task.id}: yalnız vakıf görevi sessiz`);
}
const styles = new Set(tasks.filter((task) => task.pairId).map((task) => task.clips[0].match(/-(measured|flowing)\.m4a$/)[1]));
assert.deepEqual([...styles].sort(), ['flowing', 'measured'], 'HVPT: iki farklı model stili');
for (const task of tasks.filter((item) => item.kind === 'letter')) {
  const pair = phonics.pairs.find((item) => item.id === task.pairId);
  assert.equal(task.choices.length, 3); assert.ok([pair.a, pair.b].includes(task.targetLetter));
  assert.equal(task.clips[0].includes(pair.exampleWords[pair.a === task.targetLetter ? 0 : 1]), true, 'klip hedef harfin örnek kelimesi');
}
for (const task of tasks.filter((item) => item.kind === 'word')) assert.ok(task.clips[0].includes(task.choices.find((choice) => choice.correct).id));
const medd = tasks.find((task) => task.kind === 'medd'), shadda = tasks.find((task) => task.kind === 'shadda');
assert.equal(/[âîû]/.test(medd.lemma.translit), medd.choices.find((choice) => choice.id === 'yes').correct, 'med cevabı doğrulanmış okunuştan');
assert.equal(shadda.lemma.ar.includes('\u0651'), shadda.choices.find((choice) => choice.id === 'yes').correct, 'şedde cevabı Arapça metinden');
const order = tasks.find((task) => task.kind === 'order');
assert.deepEqual(order.clips, order.order.map((id) => `assets/kao/audio/${id}.m4a`), 'dinle-diz klip sırası = doğru sıra');
const waqf = tasks.find((task) => task.kind === 'waqf');
assert.ok(surahs.waqfMarks.some((mark) => mark.afterWordId === waqf.choices.find((choice) => choice.correct).id), 'vakıf cevabı veri konumundan');
const focused = studio.kaoPhonicsTasks(studioData, '2026-09-25T09:00:00', { letterId: 'ayn' }).filter((task) => task.pairId);
assert.ok(focused.length && focused.every((task) => { const pair = phonics.pairs.find((item) => item.id === task.pairId); return pair.a === 'ayn' || pair.b === 'ayn'; }), 'harf odaklı stüdyo');
const silentTasks = studio.kaoPhonicsTasks(studioData, '2026-09-25T09:00:00', { silent: true });
assert.ok(silentTasks.length >= 1 && silentTasks.every((task) => task.audio === false), 'R-C2: sessiz modda dinleme görevi yok');

// FSRS + dikkat listesi: tümü yanlış cevaplanır.
assert.equal(studio.kaoOpenPhonics('yok'), false);
studioUi.kaoOpen = true;
assert.equal(studio.kaoOpenPhonics(), true); assert.equal(studioUi.kaoView, 'phonics');
assert.equal(studio.kaoPhonics('start'), true);
const session = studioUi.kaoPhonics;
while (session.phase === 'task') {
  const task = session.tasks[session.index];
  if (task.kind === 'order') { for (const id of task.order.slice().reverse()) studio.kaoPhonics('answer', id); continue; }
  assert.equal(studio.kaoPhonics('answer', 'geçersiz'), false);
  studio.kaoPhonics('answer', task.choices.find((choice) => !choice.correct).id);
}
assert.equal(session.phase, 'done'); assert.equal(session.correct, 0);
for (const task of session.tasks) { assert.equal(studioQ.phonics[task.cardKey].state, 'learning', `${task.cardKey}: FSRS kartı`); assert.match(studioQ.phonics[task.cardKey].due, /^\d{4}-/); }
const misheardLetters = session.tasks.filter((task) => task.targetLetter).map((task) => task.targetLetter);
assert.ok(misheardLetters.every((id) => studioQ.phonics.misheard[id] >= 1), 'yanlış duyulan harf sayılır');
const attention = studio.kaoPhonicsAttention(studioData, 5);
assert.deepEqual(attention.map((item) => item.letter.id).sort(), [...new Set(misheardLetters)].sort());
assert.ok(attention.every((item) => item.words.length > 0 && item.words.every((lemma) => lemma.ar.includes(item.letter.ar))), 'dikkat listesi harfi içeren kelimeler');
assert.match(studio.kaoPhonicsHTML(), /Dikkat listesi[\s\S]*dikkat · /);

// R-C2: ses yüklenemezse oturum sessiz görevlere düşer ve yine biter.
studio.kaoPhonics('home');
studioUi.kaoAudioFailed = false; session.silent = false;
studio.kaoPhonics('start');
assert.ok(studioUi.kaoPhonics.tasks[0].audio);
failNextAudio = true; assert.equal(studio.kaoPhonics('play'), true); failNextAudio = false;
assert.equal(studioUi.kaoPhonics.silent, true); assert.equal(studioUi.kaoAudioFailed, true);
assert.ok(studioUi.kaoPhonics.tasks.every((task) => task.audio === false), 'kalan görevler sessiz');
assert.match(studioUi.kaoPhonics.feedback, /Ses yüklenemedi/);
while (studioUi.kaoPhonics.phase === 'task') studio.kaoPhonics('answer', studioUi.kaoPhonics.tasks[studioUi.kaoPhonics.index].choices.find((choice) => choice.correct).id);
assert.equal(studioUi.kaoPhonics.phase, 'done', 'sessiz modda da biter');
assert.ok(studioUi.kaoPhonics.correct >= 1);
assert.doesNotMatch(studio.kaoPhonicsHTML(), /App\.kaoPhonics\('silent'\)/, 'sessiz modda tekrar sessiz düğmesi yok');

// Dinle-diz klipleri sırayla çalar (bir önceki bitince sonraki).
studioUi.kaoAudioFailed = false; studio.kaoOpenPhonics(); studio.kaoPhonics('start');
const orderSession = studioUi.kaoPhonics; orderSession.index = orderSession.tasks.findIndex((task) => task.kind === 'order');
played.length = 0; studio.kaoPhonics('play');
assert.deepEqual(played.map((audio) => audio.src), Array.from(orderSession.tasks[orderSession.index].clips));
assert.ok(played.every((audio) => audio.preload === 'none'));

// Migration: bozuk telaffuz kayıtları temizlenir.
const migrated = studio.ensureQuranLearn({ quranLearn: { phonics: { style: 'muallim', 'p:bad': 'x', 'p:ok': { s: 1 }, misheard: { ayn: 2, qaf: -3, tha: 'x' } } } });
assert.deepEqual(JSON.parse(JSON.stringify(migrated.phonics)), { style: 'muallim', 'p:ok': { s: 1 }, misheard: { ayn: 2 } });


// KAO-16b · okunuş içeriği bütünlüğü (dondurma aracı düzeltmeleri kalıcı).
{
  for (const item of surahs.prayerTexts) for (const word of item.words) assert.ok(word.pronunciation, `${item.id}: ${word.ar} Latin okunuşu olmalı`);
  assert.equal(surahs.prayerTexts.reduce((sum, item) => sum + item.words.length, 0), 94);
  const lexicon = sandbox.window.QuranLexiconV1;
  const readings = surahs.words.map((word) => [word.ar, word.pronunciation]).concat(lexicon.lemmas.flatMap((lemma) => (lemma.examples || []).filter((example) => example.pronunciation).map((example) => [example.ar, example.pronunciation])));
  const silentViolations = readings.filter(([ar, reading]) => {
    const tokens = ar.split(/\s+/), latin = reading.split(/\s+/);
    return tokens.length === latin.length && tokens.some((token, index) => /[^\u0670]\u0627\u06df$/.test(token) && /â$/.test(latin[index]));
  });
  assert.deepEqual(Array.from(silentViolations, ([ar, reading]) => ar + ' => ' + reading), [], 'Uthmani ۟ işaretli elif okunmaz');
  assert.equal(readings.filter(([, reading]) => /ûâ(?=\s|$)/.test(reading)).length, 0);
  const byId = new Map(surahs.words.map((word) => [word.id, word.pronunciation]));
  assert.deepEqual(['s-110-1-5', 's-110-2-3', 's-105-1-6', 's-98-4-10', 's-100-2-2', 's-98-5-4'].map((id) => byId.get(id)), ['va-al-fathu', 'yadhulûna', 'bi-ashâbi', "câ'athumu", 'kadhen', 'li-yaʿbudû'], 'iki harfli (th/dh/sh/kh) yeniden yazım bozulması yok');
  assert.equal(grammar.unit11.roots.find((root) => root.root === 'دخل').pronunciation, 'd–h–l');
  const freezeSource = fs.readFileSync(path.join(repoRoot, 'tools/kao-content-freeze.mjs'), 'utf8');
  assert.doesNotMatch(freezeSource, /replace\(\/th\/g|replace\(\/sh\/g|replace\(\/dh\/g|replace\(\/kh\/g/, 'Türkçe okunuşa ikinci kez digraf dönüşümü uygulanmaz');
}

console.log(`KAO content contract: PASS (E8 stüdyo: 13 SVG gömülü, 6 görev türü, FSRS + dikkat, sessiz mod; grammar=${grammarBytes}, surahs=${surahBytes}, phonics=${phonicsBytes})`);
