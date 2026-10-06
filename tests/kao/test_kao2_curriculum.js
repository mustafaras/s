'use strict';

// KAO2-07: müfredat omurgası. Salt okunur, ağsız VM; gerçek veri ya da tarayıcı yok.
// Beklentiler içerik modüllerinden bağımsız hesaplanır; araç çıktısı elle yazılmaz.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');
const { execFileSync } = require('node:child_process');
const root = require('../repo-root');

const MODULE = 'app/content/quranCurriculumV2.js';
const REVIEW = 'docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md';
const SPEC = 'docs/kuran-ogreniyorum/kao2/content/curriculum.spec.json';
const TOOL = 'tools/kao2-curriculum-build.mjs';
const read = (file) => fs.readFileSync(path.join(root, file));

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`PASS  ${name}`);
}

const box = vm.createContext({ window: {} });
for (const name of ['Lexicon', 'Grammar', 'ShortSurahs', 'Phonics']) {
  const file = `app/content/quran${name}V1.js`;
  vm.runInContext(read(file).toString('utf8'), box, { filename: file });
}
assert.ok(fs.existsSync(path.join(root, MODULE)), `${MODULE} eksik`);
vm.runInContext(read(MODULE).toString('utf8'), box, { filename: MODULE });
const { QuranLexiconV1: lex, QuranGrammarV1: grammar, QuranShortSurahsV1: surahs, QuranCurriculumV2: cur } = box.window;
assert.ok(cur, 'window.QuranCurriculumV2 eksik');

// VM dizileri başka bir realm'dan gelir; deepEqual için ana bağlama kopyalanır.
const lemmaIds = [...lex.lemmas.map((l) => l.id)];
const known = new Set(lemmaIds);
const byId = new Map(lex.lemmas.map((l) => [l.id, l]));
const unitIds = [...cur.units.map((u) => u.id)];
const lessons = cur.units.flatMap((u) => u.lessons.map((lesson) => ({ unit: u, lesson })));
const unitLemmas = (u) => [...u.lessons.flatMap((lesson) => [...lesson.lemmaIds])];

function firstSeen(ids, exclude) {
  const seen = new Set(exclude);
  const out = [];
  for (const id of ids) {
    if (!known.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}
const prayer = (id) => surahs.prayerTexts.find((p) => p.id === id).words.map((w) => w.lemmaId);
const surahWords = (no) => surahs.words.filter((w) => w.surahId === no)
  .sort((a, b) => a.ayah - b.ayah || a.i - b.i).map((w) => w.lemmaId);

check('sürüm ve yapı', () => {
  assert.equal(cur.version, 'quran-curriculum-tr-v2');
  assert.ok(Array.isArray(cur.levels) && cur.levels.length >= 5, 'levels eksik');
  assert.equal(typeof cur.byLesson, 'function');
  assert.ok(Object.isFrozen(cur) && Object.isFrozen(cur.units), 'modül dondurulmalı');
});

check('(a) 524 l_* lemmanın her biri tam bir derste', () => {
  assert.equal(lemmaIds.length, 524);
  const counts = new Map();
  for (const { lesson } of lessons) for (const id of lesson.lemmaIds) counts.set(id, (counts.get(id) || 0) + 1);
  const missing = lemmaIds.filter((id) => !counts.has(id));
  const dup = [...counts].filter(([, n]) => n !== 1).map(([id]) => id);
  const foreign = [...counts.keys()].filter((id) => !known.has(id));
  assert.deepEqual(missing, [], `derste olmayan lemma: ${missing.slice(0, 5)}`);
  assert.deepEqual(dup, [], `birden çok derste: ${dup.slice(0, 5)}`);
  assert.deepEqual(foreign, [], `sözlük dışı (ls_/lp_) lemma derste: ${foreign.slice(0, 5)}`);
});

check('(b) 12 ünite, derste 3–7 yeni kelime, başlık dolu, içerik dersi mastery:false (ustalık ünite düzeyinde)', () => {
  assert.deepEqual(unitIds, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const report = cur.units.map((u) => `Ü${u.id}=${unitLemmas(u).length}/${u.lessons.length}d`).join(' ');
  console.log(`      dağılım: ${report} · toplam ${lessons.length} ders`);
  for (const { unit, lesson } of lessons) {
    const n = lesson.lemmaIds.length;
    assert.ok(n >= 3 && n <= 7, `${lesson.id}: ${n} yeni kelime (3–7)`);
    assert.ok(lesson.title && typeof lesson.title === 'string', `${lesson.id}: başlık boş`);
    // KAO2-17: L1 (proje sahibi) onayıyla metinler yayına açılır; 'draft' da geçerli bir durumdur.
    assert.ok(['draft', 'sourced', 'expert'].includes(lesson.review && lesson.review.level), `${lesson.id}: geçerli review.level`);
    // K2F-20: ustalık ÜNİTE düzeyindedir (path.units[].masteryAt); hiçbir içerik dersi ustalık dersi değildir.
    assert.equal(lesson.mastery, false, `${lesson.id}: içerik dersi mastery:true taşımaz`);
  }
  for (const u of cur.units) {
    assert.ok(u.title && u.promise, `Ü${u.id}: başlık/vaat boş`);
    assert.equal(u.level, u.id <= 3 ? 1 : u.id <= 6 ? 2 : u.id <= 9 ? 3 : 4, `Ü${u.id}: seviye`);
  }
});

check('(b2) semNeighbors aynı derse düşmez (R-A5)', () => {
  for (const { lesson } of lessons) {
    const set = new Set(lesson.lemmaIds);
    for (const id of lesson.lemmaIds) {
      const clash = [...(byId.get(id).semNeighbors || []).filter((n) => set.has(n))];
      assert.deepEqual(clash, [], `${lesson.id}: ${id} ↔ ${clash}`);
    }
  }
});

check('(c) Ünite 1–3 çapaları ve ilk geçiş sırası', () => {
  const u = (id) => cur.units.find((x) => x.id === id);
  const u1 = firstSeen(prayer('fatiha'), []);
  assert.deepEqual(unitLemmas(u(1)), u1, 'Ünite 1 = Besmele + Fâtiha lemmaları, ilk geçiş sırası');
  const u2 = firstSeen(['tekbir', 'subhaneke', 'ruku', 'secde', 'tahiyyat', 'selam'].flatMap(prayer), u1);
  const got2 = unitLemmas(u(2));
  assert.deepEqual(got2.slice(0, u2.length), u2, 'Ünite 2 çapa bloğu namaz metinleri sırasıyla başlar');
  const u3 = firstSeen([112, 113, 114].flatMap(surahWords), u1.concat(got2));
  assert.deepEqual(unitLemmas(u(3)), u3, 'Ünite 3 = İhlâs/Felak/Nâs lemmaları (öncekilerde olmayanlar)');
  const spec = JSON.parse(read(SPEC));
  const focus2 = spec.units.find((x) => x.id === 2).focus || [];
  for (const id of got2.slice(u2.length)) assert.ok(focus2.includes(id), `Ünite 2 ek kelimesi spec odak listesinde değil: ${id}`);
});

check('(d) kavram kimlikleri geçerli; 25 kavramın her biri bir derse bağlı', () => {
  const linked = new Set();
  for (const { unit, lesson } of lessons) {
    if (lesson.conceptId === null) continue;
    assert.ok(grammar.byId(lesson.conceptId), `${lesson.id}: geçersiz conceptId ${lesson.conceptId}`);
    assert.ok(unit.conceptIds.includes(lesson.conceptId), `${lesson.id}: kavram ünitede değil`);
    linked.add(lesson.conceptId);
  }
  assert.equal(grammar.concepts.length, 25);
  const unlinked = [...grammar.concepts.map((c) => c.id).filter((id) => !linked.has(id))];
  assert.deepEqual(unlinked, [], 'derse bağlanmamış kavram');
  for (const c of grammar.concepts) {
    assert.ok(cur.units.find((u) => u.id === c.unit).conceptIds.includes(c.id), `${c.id} kendi ünitesinde değil`);
  }
});

check('(e) Seviye 0: s0.01…s0.12', () => {
  const ids = [...cur.s0.lessons.map((l) => l.id)];
  assert.deepEqual(ids, Array.from({ length: 12 }, (_, i) => `s0.${String(i + 1).padStart(2, '0')}`));
  // KAO2-17: L1 onayıyla S0 metinleri de yayına açılabilir.
  for (const l of cur.s0.lessons) assert.ok(l.title && ['draft','sourced','expert'].includes(l.review.level), `${l.id}: başlık/review`);
});

check('(f) lemmaToLesson ve byLesson tutarlı', () => {
  assert.equal(Object.keys(cur.lemmaToLesson).length, 524);
  for (const { lesson } of lessons) {
    for (const id of lesson.lemmaIds) assert.equal(cur.lemmaToLesson[id], lesson.id, id);
    assert.equal(cur.byLesson(lesson.id), lesson);
  }
  assert.equal(new Set(lessons.map((x) => x.lesson.id)).size, lessons.length, 'ders kimliği tekrar');
  assert.equal(cur.byLesson('yok'), null);
});

check('spec elle yazılmış Arapça içermez; inceleme listesi tam', () => {
  assert.ok(!/[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/.test(read(SPEC).toString('utf8')), 'spec Arapça içeriyor');
  const md = read(REVIEW).toString('utf8');
  assert.match(md, /- \[ \] /, 'inceleme listesinde onay kutusu yok');
  for (const id of lemmaIds) assert.ok(md.includes(byId.get(id).ar), `inceleme listesinde yok: ${id}`);
});

check('(g) araç iki çalıştırmada bayt-eşit ve depodaki çıktıyla aynı', () => {
  const runs = [0, 1].map(() => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kao2-cur-'));
    execFileSync(process.execPath, [path.join(root, TOOL), '--out-dir', dir], { stdio: 'pipe' });
    const out = [MODULE, REVIEW].map((f) => fs.readFileSync(path.join(dir, f)));
    fs.rmSync(dir, { recursive: true, force: true });
    return out;
  });
  assert.ok(runs[0][0].equals(runs[1][0]) && runs[0][1].equals(runs[1][1]), 'iki çalıştırma farklı');
  assert.ok(runs[0][0].equals(read(MODULE)), `${MODULE} araç çıktısıyla aynı değil`);
  assert.ok(runs[0][1].equals(read(REVIEW)), `${REVIEW} araç çıktısıyla aynı değil`);
  assert.ok(!/generatedAt|\d{4}-\d{2}-\d{2}T\d{2}:/.test(runs[0][0].toString('utf8')), 'zaman damgası var');
});

check('(K2F-13) S0 focus: spec `s0Focus` ↔ modül tutarlı; örnek kelimeler sözlükte var ve yüzey/anlam/okunuş sözlükle aynı; spec Arapça içermez', () => {
  const spec = JSON.parse(read(SPEC).toString('utf8'));
  assert.ok(!/[\u0600-\u06ff]/.test(JSON.stringify(spec)), 'spec Arapça içeremez (D-12)');
  const focusIds = Object.keys(spec.s0Focus).filter((k) => !k.startsWith('_')).sort();
  assert.deepEqual(focusIds, ['s0.01', 's0.03', 's0.07', 's0.08', 's0.09', 's0.11'], 'harfsiz 6 ders');
  for (const lesson of cur.s0.lessons) {
    const entry = spec.s0Focus[lesson.id];
    if (!entry) { assert.ok(!lesson.focus, `${lesson.id}: spec'te yok, modülde var`); continue; }
    assert.equal(lesson.focus.kind, entry.kind, `${lesson.id}: tür`);
    assert.deepEqual([...lesson.focus.marks.map((m) => m.id)], entry.marks.map((m) => m.id), `${lesson.id}: işaretler`);
    for (const e of lesson.examples) {
      const lemma = byId.get(e.wordId);
      assert.ok(lemma, `${lesson.id}: ${e.wordId} sözlükte yok`);
      assert.equal(e.ar, lemma.ar); assert.equal(e.translit, lemma.translit); assert.equal(e.tr, lemma.meanings[0]);
    }
  }
});

check('(h) gzip ≤ 48 KiB', () => {
  const size = zlib.gzipSync(read(MODULE), { level: 9 }).length;
  console.log(`      gzip ${(size / 1024).toFixed(3)} KiB`);
  assert.ok(size <= 48 * 1024, `gzip ${size} > 48 KiB`);
});

check('yükleme listeleri: index.html, sw.js ve üç FILES listesi', () => {
  const html = read('index.html').toString('utf8');
  const a = html.indexOf('app/content/quranPhonicsV1.js');
  const b = html.indexOf('app/content/quranCurriculumV2.js?v=20261006a');
  assert.ok(a > 0 && b > a, 'index.html: quranPhonicsV1.js sonrası 20261006a pinli satır yok');
  assert.ok(read('sw.js').toString('utf8').includes("'./app/content/quranCurriculumV2.js?v=20261006a'"), 'sw.js önbellek listesi');
  for (const file of ['.claude/skills/run-seyma/driver.mjs', '.claude/skills/run-seyma/zikr-harness.mjs', 'tests/app/test_state_rebind_boundary.js']) {
    const src = read(file).toString('utf8');
    const p = src.indexOf("'app/content/quranPhonicsV1.js'");
    const c = src.indexOf("'app/content/quranCurriculumV2.js'");
    assert.ok(p > 0 && c > p, `${file}: FILES listesinde quranPhonicsV1 sonrası yok`);
  }
});

console.log(`KAO2 curriculum: PASS (${passed} kontrol)`);
