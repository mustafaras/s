#!/usr/bin/env node
// KAO2-07 müfredat derleyici. Girdi: curriculum.spec.json (Arapça yok) + donmuş
// KAO içerik modülleri. Çıktı: app/content/quranCurriculumV2.js ve
// docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md. Belirlenimci: zaman damgası
// yok, sıralama yalnız veriye bağlı; ağ, tarayıcı ve kullanıcı verisi yok.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPEC = 'docs/kuran-ogreniyorum/kao2/content/curriculum.spec.json';
const OUT_MODULE = 'app/content/quranCurriculumV2.js';
const OUT_REVIEW = 'docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md';
const TEXTS = 'docs/kuran-ogreniyorum/kao2/content/texts.tr.json';
const BEFORE_K2F20 = 'docs/kuran-ogreniyorum/kao2/content/curriculum.before-k2f20.json';
const OUT_TEXT_REVIEW = 'docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md';
const OUT_CONCEPT_REVIEW = 'docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-18.md';
const OUT_CONCEPT_MODULE = 'app/content/quranConceptTextsV1.js';
const OUT_PRAYER_MAP = 'docs/kuran-ogreniyorum/kao2/content/prayer-lemma-map.json';
const OUT_PRAYER_REVIEW = 'docs/kuran-ogreniyorum/kao2/inceleme/NAMAZ-ESLEME-L2.md';
const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

function fail(message) {
  throw new Error(`kao2-curriculum-build: ${message}`);
}

function loadContent() {
  const box = vm.createContext({ window: {} });
  for (const name of ['Lexicon', 'Grammar', 'ShortSurahs', 'Phonics']) {
    const file = `app/content/quran${name}V1.js`;
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), box, { filename: file });
  }
  const { QuranLexiconV1: lex, QuranGrammarV1: grammar, QuranShortSurahsV1: surahs, QuranPhonicsV1: phonics } = box.window;
  if (!lex || !grammar || !surahs || !phonics) fail('içerik modülleri yüklenemedi');
  return { lex, grammar, surahs, phonics };
}

function readSpec() {
  const raw = fs.readFileSync(path.join(ROOT, SPEC), 'utf8');
  if (ARABIC.test(raw)) fail('spec Arapça içeremez (D-12); yalnız lemma kimliği kullan');
  return JSON.parse(raw);
}

// K2F-24 (K3-02 · D-07): namaz metinlerindeki `lp_*` (namaz eki) kelimelerini öğretilen `l_*` lemmalarına BAĞLAR.
// Muhafazakâr + belirlenimci: harekesiz iskelet (hançer elif elife çevrilir, elif/ya biçimleri birleştirilir); yalnız yaygın
// önek (ve, bi, li, fe, el, vel) ve zamir eki (ke, he, ye, nâ, küm, hüm, hâ) ayıklanmış TAM eşitlik; çok-aday → eşleme yok.
// Çekim/çoğul/fiil kökü tahmini yapılmaz; eşleşmeyenler L2 listesine yazılır. Arapça yalnız kod noktasıyla anılır.
const DIACRITICS = /[\u0640\u064B-\u065F\u06D6-\u06ED]/g;
const PRAYER_PREFIXES = ['', '\u0648', '\u0627\u0644', '\u0648\u0627\u0644', '\u0628', '\u0648\u0628', '\u0644', '\u0648\u0644', '\u0641'];
const PRAYER_SUFFIXES = ['', '\u0643', '\u0647', '\u064A', '\u0646\u0627', '\u0643\u0645', '\u0647\u0645', '\u0647\u0627'];
const PRAYER_CORE_MIN = 2;

// Hançer elif (U+0670) mushafta yazılır ama düz metinde elif olarak ya da hiç yazılmaz: iki iskelet biçimi de anahtar sayılır.
function skeletons(text) {
  const base = String(text).replace(DIACRITICS, '');
  return [...new Set([base.replace(/\u0670/g, ''), base.replace(/\u0670/g, '\u0627')])]
    .map((form) => form.replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627').replace(/\u0649/g, '\u064A'));
}

function prayerCandidates(word, bySkeleton) {
  const full = skeletons(word.ar)[0];
  const found = new Map();
  for (const prefix of PRAYER_PREFIXES) {
    for (const suffix of PRAYER_SUFFIXES) {
      if (!full.startsWith(prefix) || !full.endsWith(suffix)) continue;
      if (full.length - prefix.length - suffix.length < PRAYER_CORE_MIN) continue;
      for (const id of bySkeleton.get(full.slice(prefix.length, full.length - suffix.length)) || []) found.set(id, true);
    }
  }
  return [...found.keys()].sort();
}

function buildPrayerMap({ lex, surahs }) {
  const bySkeleton = new Map();
  for (const lemma of lex.lemmas) {
    for (const key of skeletons(lemma.ar)) {
      if (!bySkeleton.has(key)) bySkeleton.set(key, []);
      if (!bySkeleton.get(key).includes(lemma.id)) bySkeleton.get(key).push(lemma.id);
    }
  }
  const rows = new Map();
  for (const text of surahs.prayerTexts) {
    for (const word of text.words) {
      if (!word.lemmaId.startsWith('lp_')) continue;
      if (!rows.has(word.lemmaId)) rows.set(word.lemmaId, { lemmaId: word.lemmaId, pronunciation: word.pronunciation, tr: word.tr, prayers: [], candidates: prayerCandidates(word, bySkeleton) });
      const row = rows.get(word.lemmaId);
      if (!row.prayers.includes(text.id)) row.prayers.push(text.id);
    }
  }
  const map = {};
  const matched = [];
  const unmatched = [];
  for (const row of [...rows.values()].sort((a, b) => a.lemmaId.localeCompare(b.lemmaId))) {
    if (row.candidates.length === 1) {
      map[row.lemmaId] = row.candidates[0];
      matched.push(row);
    } else {
      unmatched.push(Object.assign({ reason: row.candidates.length ? 'birden çok aday' : 'aday yok' }, row));
    }
  }
  return { map, matched, unmatched };
}

function renderPrayerMapJson({ map, matched }) {
  const details = matched.map((row) => ({ lemmaId: row.lemmaId, lemma: map[row.lemmaId], pronunciation: row.pronunciation, tr: row.tr, prayers: row.prayers }));
  return `${JSON.stringify({
    note: 'Araç çıktısı (tools/kao2-curriculum-build.mjs, K2F-24). Elle düzenlemeyin; Arapça içermez.',
    rule: 'harekesiz iskelet + yaygın önek/zamir eki ayıklanmış tam eşitlik; tek aday → eşleme, aksi hâlde yok',
    map, details
  }, null, 2)}\n`;
}

function renderPrayerReview({ map, matched, unmatched }) {
  const lines = ['# Namaz metni ↔ lemma eşlemesi (L2 inceleme)', '',
    '> Araç çıktısıdır (`tools/kao2-curriculum-build.mjs`, K2F-24); elle düzenlemeyin. Arapça içermez; kelimeler kimlik + okunuşla anılır.',
    '> Kural: harekesiz iskelet + yaygın önek/zamir eki ayıklanmış TAM eşitlik; tek aday → eşleme, birden çok aday ya da aday yok → eşleme YOK (tahmin yok).',
    '> Bu liste yapay zekâ değil, gerçek alan uzmanının (L2) bakması içindir: eşlenmeyen kelimeler uygulamada "açık" görünür, hiçbir lemmaya bağlanmaz.', '',
    `## Eşleşmeyen kelimeler (${unmatched.length})`, '',
    '| Namaz kelimesi | Okunuş | Anlam | Metinler | Neden | Adaylar |', '|---|---|---|---|---|---|'];
  for (const row of unmatched) lines.push(`| ${row.lemmaId} | ${row.pronunciation} | ${row.tr} | ${row.prayers.join(', ')} | ${row.reason} | ${row.candidates.join(', ') || '—'} |`);
  lines.push('', `## Eşlenen kelimeler (${matched.length})`, '');
  for (const row of matched) lines.push(`- ${row.lemmaId} (${row.pronunciation} · ${row.tr}) → ${map[row.lemmaId]} · ${row.prayers.join(', ')}`);
  return `${lines.join('\n')}\n`;
}

// Ünite çapaları namaz metniyse ve dersin ilk lemması örnek cümleye düşüyorsa: dersin lemmalarını (doğrudan ya da eşlemeyle)
// en çok içeren çapa metni uygulama olur (eşitlikte çapa sırası). Hiçbirine bağlanmıyorsa varsayılan korunur.
function prayerApplyFor(unit, lemmaIds, fallback, surahs, map) {
  if (fallback.kind !== 'examples') return fallback;
  const wanted = new Set(lemmaIds);
  let best = null;
  for (const ref of unit.anchor || []) {
    const [kind, id] = ref.split(':');
    if (kind !== 'prayer') continue;
    const text = surahs.prayerTexts.find((p) => p.id === id);
    const hits = new Set(text.words.map((w) => (wanted.has(w.lemmaId) ? w.lemmaId : map[w.lemmaId])).filter((l) => l && wanted.has(l))).size;
    if (hits > 0 && (!best || hits > best.hits)) best = { hits, apply: { kind: 'prayer', ref: id } };
  }
  return best ? best.apply : fallback;
}

// Çapa metninin kelimelerini ilk geçiş sırasıyla verir (sözlük dışı olanlar sonra elenir).
function anchorLemmas(ref, surahs) {
  const [kind, id] = ref.split(':');
  if (kind === 'prayer') {
    const text = surahs.prayerTexts.find((p) => p.id === id) || fail(`bilinmeyen namaz metni ${id}`);
    return text.words.map((w) => ({ id: w.lemmaId, apply: { kind: 'prayer', ref: id } }));
  }
  if (kind === 'surah') {
    const no = Number(id);
    const words = surahs.words.filter((w) => w.surahId === no).sort((a, b) => a.ayah - b.ayah || a.i - b.i);
    if (!words.length) fail(`bilinmeyen sûre ${id}`);
    return words.map((w) => ({ id: w.lemmaId, apply: { kind: 'surah', ref: no } }));
  }
  return [];
}

function ruleMatches(rule, lemma, family) {
  if (rule.pos && !rule.pos.includes(lemma.pos)) return false;
  if (rule.notPos && rule.notPos.includes(lemma.pos)) return false;
  if (rule.pattern && !new RegExp(rule.pattern).test(lemma.pattern || '')) return false;
  if (rule.rootFamily && !(lemma.root && family.has(lemma.root) && family.get(lemma.root) >= rule.rootFamily)) return false;
  return true;
}

// Her lemmayı tam bir üniteye atar: çapalar (1–3) → odak listeleri → havuz kuralları.
function assignUnits(spec, { lex, grammar, surahs }) {
  const byId = new Map(lex.lemmas.map((l) => [l.id, l]));
  const owner = new Map();
  const source = new Map();
  const perUnit = new Map(spec.units.map((u) => [u.id, []]));
  const take = (unitId, id, apply, strict) => {
    if (!byId.has(id)) {
      if (strict) fail(`Ü${unitId}: sözlükte olmayan odak kimliği ${id}`);
      return;
    }
    if (owner.has(id)) return;
    owner.set(id, unitId);
    source.set(id, apply || { kind: 'examples', ref: null });
    perUnit.get(unitId).push(id);
  };
  for (const unit of spec.units) {
    for (const ref of unit.anchor || []) for (const w of anchorLemmas(ref, surahs)) take(unit.id, w.id, w.apply, false);
    if (unit.id <= 3) for (const id of unit.focus || []) take(unit.id, id, null, true);
  }
  for (const unit of spec.units) if (unit.id > 3) for (const id of unit.focus || []) take(unit.id, id, null, true);
  const family = new Map(Object.keys(lex.roots).sort().filter((r) => grammar.unit11.roots.some((x) => x.root === r)).map((r) => [r, lex.roots[r].length]));
  const rest = lex.lemmas.filter((l) => !owner.has(l.id)).sort((a, b) => b.freq - a.freq || a.id.localeCompare(b.id));
  for (const lemma of rest) {
    const rule = spec.poolRules.find((r) => ruleMatches(r, lemma, family)) || fail(`kuralsız lemma ${lemma.id}`);
    take(rule.unit, lemma.id, null, true);
  }
  const rootOrder = new Map(grammar.unit11.roots.map((r, i) => [r.root, i]));
  for (const unit of spec.units) {
    if (unit.order !== 'rootFamily') continue;
    const focus = new Set(unit.focus || []);
    const list = perUnit.get(unit.id);
    const head = list.filter((id) => focus.has(id));
    const tail = list.filter((id) => !focus.has(id)).sort((a, b) => {
      const la = byId.get(a), lb = byId.get(b);
      return (rootOrder.get(la.root) ?? 1e9) - (rootOrder.get(lb.root) ?? 1e9) || lb.freq - la.freq || a.localeCompare(b);
    });
    perUnit.set(unit.id, head.concat(tail));
  }
  return { perUnit, source, byId };
}

// R-A5: anlam komşuları aynı derse düşmez.
function clashes(byId, a, b) {
  return (byId.get(a).semNeighbors || []).includes(b) || (byId.get(b).semNeighbors || []).includes(a);
}

// Sırayı koruyarak 3–7'lik, semNeighbors çakışmasız dilimler; hedefe (5) en yakın bölüm.
function partition(ids, byId, size, minChunks) {
  const okChunk = (i, j) => {
    for (let x = i; x < j; x += 1) for (let y = x + 1; y < j; y += 1) if (clashes(byId, ids[x], ids[y])) return false;
    return true;
  };
  const lengths = [size.target];
  for (let d = 1; d <= size.max - size.min; d += 1) lengths.push(size.target - d, size.target + d);
  const memo = new Map();
  const best = (i, need) => {
    if (i === ids.length) return need <= 0 ? { cost: 0, cuts: [] } : null;
    const key = `${i}:${need}`;
    if (memo.has(key)) return memo.get(key);
    let found = null;
    for (const len of lengths) {
      if (len < size.min || len > size.max || i + len > ids.length || !okChunk(i, i + len)) continue;
      const next = best(i + len, Math.max(0, need - 1));
      if (!next) continue;
      const cost = (len - size.target) ** 2 + next.cost;
      if (!found || cost < found.cost) found = { cost, cuts: [len].concat(next.cuts) };
    }
    memo.set(key, found);
    return found;
  };
  const plan = best(0, minChunks);
  if (!plan) return null;
  let at = 0;
  return plan.cuts.map((len) => ids.slice(at, (at += len)));
}

// Sıra birebir korunamıyorsa (ör. aynı kök ailesinin anlam komşuları art arda):
// kararlı erteleme — ders sayısı en azdan başlayarak artırılır, her ders sıradaki
// çakışmasız kelimelerle dengeli boyutta doldurulur; çakışan kelime sonraki derse kayar.
function spreadNeighbors(ids, byId, size, minChunks) {
  const n = ids.length;
  const first = Math.max(minChunks, Math.ceil(n / size.max), Math.round(n / size.target));
  for (let k = first; k <= Math.floor(n / size.min); k += 1) {
    const base = Math.floor(n / k);
    const sizes = Array.from({ length: k }, (_, i) => base + (i < n % k ? 1 : 0));
    const pending = ids.slice();
    const groups = [];
    for (const want of sizes) {
      const group = [];
      for (let i = 0; i < pending.length && group.length < want; i += 1) {
        if (group.some((g) => clashes(byId, g, pending[i]))) continue;
        group.push(pending.splice(i, 1)[0]);
        i -= 1;
      }
      if (group.length < want) break;
      groups.push(group);
    }
    if (groups.length === k) return groups;
  }
  return null;
}

// K2F-20: spec `lessonSizes` verildiğinde ders sınırları AÇIKTIR (bölümleme aranmaz). Toplam, boyut aralığı ve
// anlam komşusu çakışmasızlığı doğrulanır; böylece ders içerikleri yalnız spec'teki sıradan ve boyutlardan çıkar.
function sliceBySizes(ids, sizes, byId, size, unitId) {
  if (sizes.reduce((a, b) => a + b, 0) !== ids.length) fail(`Ü${unitId}: lessonSizes toplamı ${sizes.reduce((a, b) => a + b, 0)} ≠ ${ids.length} kelime`);
  let at = 0;
  return sizes.map((len, i) => {
    if (len < size.min || len > size.max) fail(`Ü${unitId}: ders ${i + 1} boyutu ${len} aralık dışı`);
    const chunk = ids.slice(at, (at += len));
    for (let x = 0; x < chunk.length; x += 1) for (let y = x + 1; y < chunk.length; y += 1) {
      if (clashes(byId, chunk[x], chunk[y])) fail(`Ü${unitId}: ders ${i + 1} anlam komşuları çakışıyor (${chunk[x]} ~ ${chunk[y]})`);
    }
    return chunk;
  });
}

function lessonsFor(ids, byId, size, minChunks) {
  return partition(ids, byId, size, minChunks)
    || spreadNeighbors(ids, byId, size, minChunks)
    || fail(`${ids.length} kelime 3–7'lik çakışmasız derslere bölünemiyor`);
}

const pad = (n) => String(n).padStart(2, '0');
const draft = () => ({ level: 'draft' });

// KAO2-17: Türkçe metin katmanı. Arapça içeremez (D-12); review.level 'draft' iken
// kullanıcıya gösterilmez. Eksik metin güvenli yer tutucuya düşer, build kırılmaz.
function readTexts() {
  const raw = fs.readFileSync(path.join(ROOT, TEXTS), 'utf8');
  if (ARABIC.test(raw)) fail('metin kaynağı Arapça içeremez (D-12)');
  return JSON.parse(raw);
}

function textFor(texts, id, fallbackTitle, fallbackGoal, section) {
  const bucket = (section && texts[section]) || texts.lessons || {};
  const entry = bucket[id] || {};
  return {
    title: typeof entry.title === 'string' && entry.title ? entry.title : fallbackTitle,
    goal: typeof entry.goal === 'string' && entry.goal ? entry.goal : fallbackGoal,
    review: entry.review && typeof entry.review === 'object' ? entry.review : { level: 'draft' }
  };
}

function build(spec, content, texts) {
  const { perUnit, source, byId } = assignUnits(spec, content);
  const prayerMap = buildPrayerMap(content);
  const lemmaToLesson = {};
  const units = spec.units.map((unit) => {
    for (const cid of unit.conceptIds) if (!content.grammar.byId(cid)) fail(`Ü${unit.id}: geçersiz kavram ${cid}`);
    const chunks = unit.lessonSizes
      ? sliceBySizes(perUnit.get(unit.id), unit.lessonSizes, byId, spec.lessonSize, unit.id)
      : lessonsFor(perUnit.get(unit.id), byId, spec.lessonSize, unit.conceptIds.length);
    const lessons = chunks.map((lemmaIds, i) => {
      const id = `u${pad(unit.id)}.${pad(i + 1)}`;
      for (const lid of lemmaIds) lemmaToLesson[lid] = id;
      const fallback = (unit.lessonTitles && unit.lessonTitles[i]) || `${unit.title} · ${i + 1}. ders`;
      const text = textFor(texts, id, fallback, '');
      return {
        id,
        title: text.title,
        goal: text.goal || null,
        lemmaIds,
        conceptId: unit.conceptIds[i] || null,
        apply: prayerApplyFor(unit, lemmaIds, source.get(lemmaIds[0]), content.surahs, prayerMap.map),
        // KAO2 ustalığı ÜNİTE düzeyindedir (path.units[].masteryAt); içerik dersi hiçbir zaman ustalık dersi değildir.
        mastery: false,
        review: text.review
      };
    });
    const unitText = (texts.units && texts.units[String(unit.id)]) || {};
    return {
      id: unit.id, level: unit.level,
      title: typeof unitText.title === 'string' && unitText.title ? unitText.title : unit.title,
      promise: typeof unitText.promise === 'string' && unitText.promise ? unitText.promise : unit.promise,
      why: typeof unitText.why === 'string' && unitText.why ? unitText.why : null,
      conceptIds: unit.conceptIds.slice(), anchor: unit.anchor.slice(), lessons,
      review: unitText.review && typeof unitText.review === 'object' ? unitText.review : draft()
    };
  });
  const levels = spec.levels.map((lv) => ({ id: lv.id, title: lv.title, unitIds: units.filter((u) => u.level === lv.id).map((u) => u.id) }));
  // (b) Konum tablosu biçimleri ZWJ ile MEKANİK üretilir (elle Arapça yazılmaz).
  // Bağlanmayan harfte baş/orta biçimi YOKTUR — uydurulmaz, "yok" işaretlenir.
  const ZWJ = '\u200d';
  const NON_JOINING_DEFAULT = ['dal', 'dhal', 'ra', 'zay', 'waw', 'hamza'];
  const nonJoining = Array.isArray(content.lex.nonJoining) && content.lex.nonJoining.length
    ? content.lex.nonJoining.slice() : NON_JOINING_DEFAULT.slice();
  // (c) Harf başına gerçek kelime: çıplak biçim hedef harfle başlar, ≤3 hece,
  // klip DİSKTE vardır. Diski yalnız araç görür; seçim modüle yazılır.
  const audioDir = path.join(ROOT, 'assets/kao/audio');
  const audioFiles = fs.existsSync(audioDir) ? new Set(fs.readdirSync(audioDir)) : new Set();
  const syllableCount = (ar) => (String(ar).match(/[\u064e\u064f\u0650\u064b-\u064d]/g) || []).length;
  const s0Letters = {};
  for (const letter of content.phonics.letters) {
    const joins = nonJoining.indexOf(letter.id) < 0;
    const pick = content.lex.lemmas
      .filter((l) => String(l.ar || '').indexOf(String(letter.ar)) === 0 && l.ar !== letter.ar
        && syllableCount(l.ar) <= 3 && audioFiles.has(`w-${l.id}-measured.m4a`))
      .sort((a, b) => syllableCount(a.ar) - syllableCount(b.ar) || String(a.id).localeCompare(String(b.id)))[0];
    s0Letters[letter.id] = {
      letter: String(letter.ar || ''),
      joins,
      cells: joins
        ? [`${letter.ar}`, `${letter.ar}${ZWJ}`, `${ZWJ}${letter.ar}${ZWJ}`, `${ZWJ}${letter.ar}`]
        : [String(letter.ar), null, null, `${ZWJ}${letter.ar}`],
      word: pick ? {
        wordId: pick.id,
        ar: String(pick.ar),
        tr: String((pick.meanings && pick.meanings[0]) || ''),
        syllables: syllableCount(pick.ar),
        startsWithLetter: true,
        file: `w-${pick.id}-measured.m4a`
      } : null
    };
  }
  // KAO2-19 · 20 kısa sûrenin bağlamı. K-4: yalnız `sourced`/`expert` görünür;
  // `draft` metin render'da GİZLENİR (kaoReaderContext null döner).
  const surahs = {};
  for (const [id, entry] of Object.entries((texts.surahs && typeof texts.surahs === 'object') ? texts.surahs : {})) {
    const review = entry.review && typeof entry.review === 'object' ? entry.review : { level: 'draft' };
    surahs[id] = {
      contextTr: typeof entry.contextTr === 'string' && entry.contextTr ? entry.contextTr : null,
      derivedFrom: Array.isArray(entry.derivedFrom) ? entry.derivedFrom.slice() : [],
      review: {
        level: ['sourced', 'expert'].includes(review.level) ? review.level : 'draft',
        sources: Array.isArray(review.sources) ? review.sources.slice() : []
      }
    };
  }
  // K2F-13 · harfsiz S0 dersleri: spec `s0Focus` işaret kimlikleriyle odak verir; örnek kelimeler lexicon'dan BELİRLENİMCİ seçilir
  // (≤3 hece, klip diskte, Latin okunuşlu; en sık geçen önce, fetha/damme/kesre için yalnız o ünlüyü taşıyanlar önce). Arapça elle yazılmaz:
  // işaret yüzeyleri Unicode kod noktasından, işaret simgesi (glyph) noktalı daire + kod noktasından üretilir.
  const MARKS = {
    fatha: { test: (a) => a.includes('\u064e'), glyph: '\u25cc\u064e', vowel: '\u064e' },
    damma: { test: (a) => a.includes('\u064f'), glyph: '\u25cc\u064f', vowel: '\u064f' },
    kasra: { test: (a) => a.includes('\u0650'), glyph: '\u25cc\u0650', vowel: '\u0650' },
    sukun: { test: (a) => a.includes('\u0652'), glyph: '\u25cc\u0652' },
    shadda: { test: (a) => a.includes('\u0651'), glyph: '\u25cc\u0651' },
    'dagger-alif': { test: (a) => a.includes('\u0670'), glyph: '\u25cc\u0670' },
    tanwin: { test: (a) => /[\u064b-\u064d]/.test(a), glyph: '\u25cc\u064b' },
    al: { test: (a) => /^[\u0671\u0627]\u0644/.test(a), glyph: '\u0671\u0644' }
  };
  const FOCUS_KINDS = ['marks', 'positions', 'sukun', 'madd-shadda', 'tanwin-al'];
  const examplePool = content.lex.lemmas
    .filter((l) => syllableCount(l.ar) <= 3 && audioFiles.has(`w-${l.id}-measured.m4a`) && l.translit && l.meanings && l.meanings[0])
    .sort((a, b) => (b.freq || 0) - (a.freq || 0) || String(a.id).localeCompare(String(b.id)));
  const pureVowel = (ar, vowel) => !vowel || ['\u064e', '\u064f', '\u0650'].filter((v) => ar.includes(v)).every((v) => v === vowel);
  const focusFor = (id) => {
    const entry = spec.s0Focus && spec.s0Focus[id];
    if (!entry) return null;
    if (!FOCUS_KINDS.includes(entry.kind)) fail(`${id}: bilinmeyen focus türü ${entry.kind}`);
    const taken = new Set();
    const marks = (entry.marks || []).map((m) => {
      if (!MARKS[m.id]) fail(`${id}: bilinmeyen işaret ${m.id}`);
      if (!m.tr) fail(`${id}/${m.id}: Türkçe ad eksik`);
      return { id: m.id, tr: String(m.tr), glyph: MARKS[m.id].glyph };
    });
    const examples = [];
    for (const m of marks) {
      const def = MARKS[m.id];
      const per = Math.max(1, Math.ceil(3 / Math.max(1, marks.length)));
      const candidates = examplePool.filter((l) => !taken.has(l.id) && def.test(String(l.ar)));
      // Ünlü derslerinde (fetha/damme/kesre) önce yalnız o ünlüyü taşıyan ve henüz öğretilmemiş başka işareti (şedde, sükûn, tenvin, hançer elif, med) olmayan kelimeler.
      const bare = candidates.filter((l) => def.vowel && pureVowel(String(l.ar), def.vowel) && !/[\u0651\u0652\u0670\u064b-\u064d\u0653]/.test(String(l.ar)));
      const pure = candidates.filter((l) => pureVowel(String(l.ar), def.vowel));
      const pool = bare.length >= per ? bare : (pure.length >= per ? pure : candidates);
      for (const l of pool.slice(0, per)) {
        taken.add(l.id);
        examples.push({ wordId: l.id, ar: String(l.ar), tr: String(l.meanings[0]), translit: String(l.translit), syllables: syllableCount(l.ar),
          marks: marks.filter((x) => MARKS[x.id].test(String(l.ar))).map((x) => x.id), file: `w-${l.id}-measured.m4a` });
      }
      if (candidates.length < per) fail(`${id}/${m.id}: yeterli örnek kelime yok (${candidates.length})`);
    }
    if (entry.kind !== 'positions' && examples.length < 3) fail(`${id}: ≥3 örnek kelime gerekir (${examples.length})`);
    return { kind: entry.kind, marks, examples };
  };
  const s0 = { lessons: spec.s0.map((title, i) => {
    const id = `s0.${pad(i + 1)}`;
    const text = textFor(texts, id, title, '', 's0');
    const focus = focusFor(id);
    return Object.assign({ id, title: text.title, goal: text.goal || null, review: text.review },
      focus ? { focus: { kind: focus.kind, marks: focus.marks }, examples: focus.examples } : {});
  }), letters: s0Letters };
  const missing = content.lex.lemmas.filter((l) => !lemmaToLesson[l.id]);
  if (missing.length) fail(`derse girmeyen lemma: ${missing[0].id}`);
  return { version: spec.version, levels, units, s0, surahs, lemmaToLesson, prayerLemmaMap: prayerMap.map, prayerMap };
}

function renderModule(fullData) {
  const { prayerMap, ...data } = fullData; // araç içi ayrıntı (eşleşmeyen liste) modüle girmez
  const freeze = "function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.keys(v).forEach(function(k){freeze(v[k]);});Object.freeze(v);}return v;}";
  const index = "var index={};data.units.forEach(function(u){u.lessons.forEach(function(l){index[l.id]=l;});});";
  const byLesson = "data.byLesson=function(id){return Object.prototype.hasOwnProperty.call(index,id)?index[id]:null;};";
  return '/* KAO2-07 araç çıktısı: tools/kao2-curriculum-build.mjs + docs/kuran-ogreniyorum/kao2/content/curriculum.spec.json. Elle düzenlemeyin. */\n'
    + `(function(){'use strict';${freeze}var data=${JSON.stringify(data)};${index}${byLesson}window.QuranCurriculumV2=freeze(data);})();\n`;
}

const unitSize = (u) => u.lessons.reduce((s, l) => s + l.lemmaIds.length, 0);

// K2F-20: önceki dağılımla (curriculum.before-k2f20.json) karşılaştırılan "değişenler" bölümü ve G2 karar noktaları.
function renderChanges(data, byId, cell) {
  const file = path.join(ROOT, BEFORE_K2F20);
  if (!fs.existsSync(file)) return [];
  const before = JSON.parse(fs.readFileSync(file, 'utf8')).lessons;
  const spec = readSpec();
  const label = (id) => { const l = byId.get(id); return `${cell(l.translit || id)} (\`${id}\`)`; };
  const rows = [];
  let moved = 0;
  for (const u of data.units) for (const l of u.lessons) {
    const was = before[l.id] || [];
    const out = was.filter((id) => !l.lemmaIds.includes(id));
    const inn = l.lemmaIds.filter((id) => !was.includes(id));
    if (!out.length && !inn.length) continue;
    moved += inn.length;
    rows.push(`| ${l.id} | ${cell(l.title)} | ${out.map(label).join(', ') || '—'} | ${inn.map(label).join(', ') || '—'} |`);
  }
  const lines = ['## K2F-20 ile değişenler (G2 onayı bekliyor)', '',
    `${rows.length} ders değişti, ${moved} lemma başka derse taşındı. Ders kimlikleri, sıraları ve boyutları sabittir; Ünite 1–3 değişmedi. Tamamlanmış ders tamamlanmış kalır; derse sonradan taşınan ve tanışılmamış kelimeler sıradaki dersin planında tanıştırılır (A-6). Değişen derslerin başlık/hedef metinleri K2F-21'de yeniden yazılır.`, '',
    '| Ders | Başlık (eski metin) | Çıkan | Giren |', '|---|---|---|---|', ...rows, ''];
  const decisions = Array.isArray(spec.g2Decisions) ? spec.g2Decisions : [];
  if (decisions.length) {
    lines.push('## G2 karar noktaları (kapıyla ölçülen kalan tutarsızlıklar)', '');
    for (const d of decisions) {
      lines.push(`- **${d.lessons.join(', ')}** — ${d.sorun}`);
      for (const option of d.secenekler) lines.push(`  - ${option}`);
    }
    lines.push('');
  }
  return lines;
}

function renderReview(data, spec, { lex, grammar }) {
  const byId = new Map(lex.lemmas.map((l) => [l.id, l]));
  const cell = (s) => String(s).replace(/\|/g, '\\|');
  const lines = [
    '# KAO2 — Müfredat eşlemesi (G2 incelemesi)', '',
    '> Araç çıktısı: `node tools/kao2-curriculum-build.mjs` — elle düzenlemeyin; değişiklik `docs/kuran-ogreniyorum/kao2/content/curriculum.spec.json` üzerinden yapılır.',
    '> Arapça, okunuş ve anlam `QuranLexiconV1` içerik modülünden kopyalanır. Tüm başlık ve vaatler taslaktır (`review.level: draft`).', '',
    '## Özet', '',
    '| Ünite | Seviye | Başlık | Ders | Kelime | Kavramlar | Çapa |', '|---|---|---|---|---|---|---|'
  ];
  for (const u of data.units) {
    lines.push(`| ${u.id} | ${u.level} | ${cell(u.title)} | ${u.lessons.length} | ${unitSize(u)} | ${u.conceptIds.join(', ')} | ${u.anchor.join(', ')} |`);
  }
  const lessonCount = data.units.reduce((s, u) => s + u.lessons.length, 0);
  const total = data.units.reduce((s, u) => s + unitSize(u), 0);
  lines.push('', `Toplam: ${data.units.length} ünite · ${lessonCount} ders · ${total} lemma · Seviye 0: ${data.s0.lessons.length} ders.`, '');
  lines.push(...renderChanges(data, byId, cell));
  lines.push('## Karar bekleyen noktalar', '');
  for (const u of data.units) {
    if (u.id > 3 && u.id < 10 && (unitSize(u) < 20 || unitSize(u) > 60)) {
      lines.push(`- Ünite ${u.id} (${u.title}) ${unitSize(u)} kelime: hedef aralık 20–60 dışında; dağıtım spec \`poolRules\` ile değiştirilebilir.`);
    }
  }
  const focus2 = (spec.units.find((u) => u.id === 2).focus || []).length;
  lines.push(`- Ünite 2 çapası: namaz metinlerinin çoğu kelimesi sözlükte yok (\`lp_*\`); ${focus2} odak kelimesi eski plan listesinden kimlikle eklendi.`);
  lines.push(`- Dağıtım kuralları (ilk eşleşen kazanır): ${spec.poolRules.map((r) => `Ü${r.unit} ${r.why}`).join(' → ')}.`, '');
  lines.push('## Seviye 0', '');
  for (const l of data.s0.lessons) lines.push(`- ${l.id} · ${l.title}`);
  for (const u of data.units) {
    lines.push('', `## Ünite ${u.id} · ${u.title}`, '', `Vaat: ${u.promise}`, '');
    for (const l of u.lessons) {
      const concept = l.conceptId ? `${l.conceptId} ${grammar.byId(l.conceptId).title}` : '—';
      const apply = l.apply.ref === null ? l.apply.kind : `${l.apply.kind}:${l.apply.ref}`;
      lines.push(`### ${l.id} · ${l.title}${l.mastery ? ' · ustalık' : ''}`, '', `Kavram: ${concept} · Uygula: ${apply}`, '');
      lines.push('| # | Arapça | Okunuş | Anlam | Kimlik |', '|---|---|---|---|---|');
      l.lemmaIds.forEach((id, i) => {
        const lemma = byId.get(id);
        lines.push(`| ${i + 1} | ${lemma.ar} | ${cell(lemma.translit)} | ${cell(lemma.meanings[0] || '')} | \`${id}\` |`);
      });
      lines.push('');
    }
  }
  lines.push('## Onay (G2)', '',
    '- [ ] Ünite sırası, çapalar ve ders bölümü uygun.',
    '- [ ] Kelime–ünite eşlemesi uygun (değişiklik isteniyorsa kimlikle yazın).',
    '- [ ] Karar bekleyen noktalar için tercih belirtildi.', '');
  return lines.join('\n');
}

// KAO2-17 · K-4 L1/L2 inceleme sayfası (araç üretir; kullanıcı onayı bu dosyaya işlenir).
function renderTextReview(data) {
  const lines = ['# İnceleme · KAO2-17 — Ünite ve ders metinleri', '',
    '> Bu sayfa `tools/kao2-curriculum-build.mjs` ile üretilir; elle düzenlenmez.',
    '> Onay: kutu işaretlenir, sonra `--apply-review` ile metin kaynağına taşınır.',
    '> Onaylanmamış metinler `draft` kalır ve uygulamada **gösterilmez** (yerine "Ünite N · Ders M" yazar).', '',
    '## Sana düşen', '',
    '1. Aşağıdaki tabloları oku. Bir metni uygun buluyorsan **o satırın kutusunu `[x]` yap**.',
    '2. Dinî bağlam taşıyan ünite metinlerinde L2 kutusu da vardır (alan uzmanı onayı).',
    '3. İşin bitince bana **"L1 işaretlendi"** yaz. Kutusu işaretli olmayan hiçbir metin onaylanmış sayılmaz.', '',
    '## Durum', ''];
  const all = [];
  data.units.forEach((u) => { all.push({ id: `u${u.id}`, kind: 'ünite', title: u.title, goal: u.promise, review: u.review }); u.lessons.forEach((l) => all.push({ id: l.id, kind: 'ders', title: l.title, goal: l.goal, review: l.review })); });
  data.s0.lessons.forEach((l) => all.push({ id: l.id, kind: 'S0', title: l.title, goal: l.goal, review: l.review }));
  const count = (level) => all.filter((t) => t.review.level === level).length;
  const drafts = all.filter((t) => t.review.level === 'draft');
  const reapprove = all.filter((t) => t.review.level !== 'draft');
  lines.push(`- Toplam metin: **${all.length}**`,
    `- \`draft\` (görünmez): **${count('draft')}**`,
    `- \`sourced\` (görünür): **${count('sourced')}**`,
    `- \`expert\` (görünür): **${count('expert')}**`, '');
  // KR-4: yeniden yazılanlar ve kutu onayı olmadan görünür kalanlar ayrı listelenir.
  const cell = (v) => String(v ?? '—').replace(/\|/g, '\\|');
  lines.push('## Yeniden yazılan metinler (`draft`, K2F-21)', '',
    'Bu dersler yeni kelime dağılımına göre yeniden yazıldı; sen onaylayana kadar uygulamada görünmez.', '');
  if (drafts.length) {
    lines.push('| id | başlık | hedef |', '|---|---|---|');
    drafts.forEach((t) => lines.push(`| ${t.id} | ${cell(t.title)} | ${cell(t.goal)} |`));
  } else lines.push('Yok.');
  lines.push('', '## Yeniden onay gerekli', '',
    `Bugün \`sourced\` (görünür) olup **açık kutu onayı olmayan** ${reapprove.length} metin vardır: ${reapprove.map((t) => t.id).join(', ') || '—'}.`,
    'Bunların hiçbiri senin kutu işaretinle onaylanmadı; aşağıdaki tablolarda `[x]` yapmadığın metin onaylı sayılmaz.', '',
    '## Üniteler', '');
  data.units.forEach((u) => {
    lines.push(`### Ünite ${u.id} · ${u.title}`, '',
      `- Vaad: ${u.promise}`,
      u.why ? `- Neden önemli: ${u.why}` : '- Neden önemli: —',
      `- İnceleme: \`${u.review.level}\`${Array.isArray(u.review.sources) && u.review.sources.length ? ` · kaynak: ${u.review.sources.join(', ')}` : ''}`,
      '- [ ] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun', '');
  });
  lines.push('## Dersler', '');
  data.units.forEach((u) => {
    lines.push(`### Ünite ${u.id} dersleri`, '', '| ders | başlık | hedef | inceleme | onay |', '|---|---|---|---|---|');
    u.lessons.forEach((l) => lines.push(`| ${l.id} | ${l.title} | ${l.goal || '—'} | \`${l.review.level}\` | - [ ] |`));
    lines.push('');
  });
  lines.push('## Seviye 0', '', '| ders | başlık | hedef | inceleme | onay |', '|---|---|---|---|---|');
  data.s0.lessons.forEach((l) => lines.push(`| ${l.id} | ${l.title} | ${l.goal || '—'} | \`${l.review.level}\` | - [ ] |`));
  lines.push('');
  return lines.join('\n');
}

// KAO2-18: 25 kavram için workedTr (çözümlü örnek) + errorTr (hata açıklaması).
// draft metinler modüle yazılmaz; uygulama güvenli genel metne düşer.
function buildConceptTexts(texts) {
  const concepts = texts.concepts || {};
  const out = {};
  Object.keys(concepts).sort().forEach((id) => {
    const entry = concepts[id] || {};
    const level = entry.review && ['sourced', 'expert'].includes(entry.review.level) ? entry.review.level : 'draft';
    out[id] = {
      workedTr: level === 'draft' ? null : String(entry.workedTr || '') || null,
      errorTr: level === 'draft' ? null : String(entry.errorTr || '') || null,
      level
    };
  });
  return out;
}

function renderConceptReview(texts, grammar) {
  const concepts = texts.concepts || {};
  const lines = ['# İnceleme · KAO2-18 — Kavram çözümlü örnekleri ve hata açıklamaları', '',
    '> Bu sayfa `tools/kao2-curriculum-build.mjs` ile üretilir; elle düzenlenmez.',
    '> Onaylanmamış (`draft`) metinler uygulamada **gösterilmez**; yerine güvenli genel metin gelir.', ''];
  const ids = Object.keys(concepts).sort();
  const draftCount = ids.filter((id) => !(concepts[id].review && concepts[id].review.level !== 'draft')).length;
  lines.push('## Durum', '', `- Toplam kavram: **${ids.length}**`, `- \`draft\` (görünmez): **${draftCount}**`, '');
  lines.push('## Kavramlar', '');
  ids.forEach((id) => {
    const entry = concepts[id] || {};
    const concept = grammar && typeof grammar.byId === 'function' ? grammar.byId(id) : null;
    lines.push(`### ${id} · ${concept ? concept.title : '—'}`, '',
      `- Çözümlü örnek (workedTr): ${entry.workedTr || '—'}`,
      `- Hata açıklaması (errorTr): ${entry.errorTr || '—'}`,
      `- İnceleme: \`${(entry.review && entry.review.level) || 'draft'}\``,
      '- [ ] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun', '');
  });
  return lines.join('\n');
}

function renderConceptModule(map) {
  return [
    '// KAO2-18 donmuş çıktı: kavram çözümlü örnekleri ve hata açıklamaları.',
    '// `tools/kao2-curriculum-build.mjs` üretir; elle düzenlenmez. draft -> null.',
    '(function(window){',
    "  'use strict';",
    `  var DATA=${JSON.stringify(map)};`,
    '  window.QuranConceptTextsV1=Object.freeze({version:1,byId:function(id){ return Object.prototype.hasOwnProperty.call(DATA,String(id))?DATA[String(id)]:null; },all:DATA});',
    '})(window);',
    ''
  ].join('\n');
}

// KAO2-18 · K-4 onay taşıma. İnceleme sayfası ve KAO2-17 §3 bu yolu vaat ediyordu
// ama araçta yoktu: bilinmeyen bayrak sessizce yok sayılıyordu (exit 0), yani
// kullanıcı onay verse bile metinler `draft` kalıyordu. Burada yalnız İNSAN
// onayı taşınır: kod hiçbir kutuyu kendi işaretlemez ve hiçbir metni yazmaz.
function parseFlags(argv) {
  // `--apply-review` değer almaz; diğerleri alır.
  const BOOLEAN = new Set(['--apply-review']);
  const known = new Set(['--apply-review', '--out-dir', '--texts', '--sheet', '--at']);
  const value = (name) => {
    const i = argv.indexOf(name);
    if (i < 0) return null;
    return argv[i + 1] || fail(`${name} değeri eksik`);
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) fail(`beklenmeyen argüman: ${arg}`);
    if (!known.has(arg)) fail(`bilinmeyen seçenek: ${arg}`);
    if (!BOOLEAN.has(arg)) i += 1; // değerini atla
  }
  return {
    applyReview: argv.includes('--apply-review'),
    outDir: value('--out-dir'),
    texts: value('--texts'),
    sheet: value('--sheet'),
    at: value('--at')
  };
}

// İnceleme sayfasından ONAYLANMIŞ metin kimliklerini çıkarır. Yalnız işaretli
// (`[x]`) kutular onay sayılır; işaretsiz satır hiçbir şeyi onaylamaz.
// Onay satırı iki kutu taşıyabilir ("L1 metin uygun" · "L2 (dinî bağlam) uygun");
// herhangi birinin işaretlenmesi metnin onaylandığı anlamına gelir — L1/L2
// ayrımı K-4 gereği inceleyicinin sorumluluğundadır, araç rol atamaz.
function readApproved(sheetPath) {
  const lines = fs.readFileSync(sheetPath, 'utf8').split('\n');
  const approved = new Set();
  let heading = null;
  const headingId = (text) => {
    const unit = /^### Ünite (\d+) ·/.exec(text);
    if (unit) return `u${unit[1]}`;                        // ünitenin kendi onay kutusu
    if (/^### Ünite \d+ dersleri/.test(text)) return null;  // dersler tabloda işaretlenir
    if (/^### Seviye 0/.test(text)) return null;            // S0 dersleri tabloda işaretlenir
    const plain = /^### (\S+)/.exec(text);
    return plain ? plain[1] : null;                        // kavram kimliği
  };
  for (const line of lines) {
    if (/^### /.test(line)) { heading = headingId(line); continue; }
    // Ders/S0 tablo satırı: | <kimlik> | ... | `draft` | - [x] |
    const row = /^\|\s*(\S+)\s*\|/.exec(line);
    if (row && /\[x\]/i.test(line)) { approved.add(row[1]); continue; }
    // Başlık altı onay kutusu (ünite ya da kavram).
    if (heading && /^\s*-\s*\[/.test(line) && /\[x\]/i.test(line)) approved.add(heading);
  }
  return approved;
}

// Metin kaynağı: units { "<no>": {review} }, lessons/s0 { "<kimlik>": {review} },
// concepts { "<kimlik>": {review} } — dördü de aynı onay işlemini alır.
function collectHolders(texts) {
  const holders = [];
  for (const key of Object.keys(texts.units || {})) holders.push({ id: `u${key}`, entry: texts.units[key] });
  for (const bucket of ['lessons', 's0', 'concepts']) {
    const map = texts[bucket] || {};
    for (const key of Object.keys(map)) holders.push({ id: key, entry: map[key] });
  }
  return holders;
}

// --- KAO2-18 · onay öncesi L0 kuru denetimi --------------------------------
// Araç, L0 kapısını (`tests/kao/test_kao2_text_review.js`) bozan bir durumu
// ASLA yazmamalı: aksi halde "onayla" komutu kullanıcıyı kırmızı bir repoya
// sokar. Aşağıdaki liste L0 ile aynı kuralları taşır.
const RELIGIOUS = /Kur|Fâtiha|Fatiha|namaz|Namaz|âyet|sûre|Peygamber|Allah|Rab|Besmele|salât|dua|âhiret|cennet|cehennem|melek|vahiy|Kâbe|kıble/i;
const FORBIDDEN = [
  'haramdır', 'helâldır', 'helaldır', 'caizdir', 'caiz değildir', 'farzdır', 'vaciptir',
  'sünnettir', 'mekruhtur', 'müstehaptır', 'günahtır', 'sevaptır', 'bidattir',
  'fetva', 'hüküm budur', 'kesinlikle doğrudur', 'mezhebe göre', 'hanefî', 'şâfiî', 'malikî', 'hanbelî'
];
const ORTHOGRAPHY = [
  ['Kur\'an', ['Kuran', 'Kur`an', "Kur’an'ı"]],
  ['Fâtiha', ['Fatiha', 'Fatihâ']],
  ['Besmele', ['Bismillah', 'Besemle\'yi']],
  ['Rahmân', ['Rahman']],
  ['Rahîm', ['Rahim']],
  ['Müslüman', ['Musluman']],
  ['âyet', ['ayet']],
  ['sûre', ['sure']]
];
const LEVELS = ['draft', 'sourced', 'expert'];

function lintTexts(texts) {
  const problems = [];
  const textsOf = (entry) => Object.values(entry).filter((v) => typeof v === 'string');
  const units = Object.keys(texts.units || {}).map((k) => ({ id: `u${k}`, entry: texts.units[k] }));
  const flat = ['lessons', 's0', 'concepts'].flatMap((bucket) =>
    Object.keys(texts[bucket] || {}).map((k) => ({ id: k, entry: texts[bucket][k] })));
  for (const { id, entry } of [...units, ...flat]) {
    const review = entry.review;
    if (!review || !LEVELS.includes(review.level)) { problems.push(`${id}: review.level geçersiz`); continue; }
    // by: yalnız rol kodu; yeniden yazılan (henüz kimse onaylamamış) metinde null.
    if (review.by !== undefined && !(review.by === null && review.level === 'draft') && !['owner', 'expert'].includes(review.by)) problems.push(`${id}: rol kodu geçersiz`);
    // (d) elle Arapça yok
    for (const value of textsOf(entry)) {
      if (/[\u0600-\u06ff]/.test(value)) problems.push(`${id}: elle Arapça`);
    }
    // (a) dinî bağlamlı 'why' kaynak taşır
    if (entry.why && RELIGIOUS.test(entry.why) && !(Array.isArray(review.sources) && review.sources.length)) {
      problems.push(`${id}: dinî bağlamlı 'why' kaynak taşımıyor`);
    }
    // (c) yasak ifade
    const joined = textsOf(entry).join(' ').toLocaleLowerCase('tr');
    for (const banned of FORBIDDEN) if (joined.includes(banned)) problems.push(`${id}: yasak ifade "${banned}"`);
    // (b) Diyanet imlâsı
    for (const [, wrongs] of ORTHOGRAPHY) {
      for (const wrong of wrongs) {
        const pattern = new RegExp(`(^|[^\\p{L}])${wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'u');
        if (textsOf(entry).some((v) => pattern.test(v))) problems.push(`${id}: yanlış imlâ "${wrong}"`);
      }
    }
  }
  return problems;
}

function applyReview({ textsPath, sheetPath, outDir, at }) {
  if (!textsPath) fail('--apply-review için --texts gerekli');
  if (!sheetPath) fail('--apply-review için --sheet gerekli');
  const date = at || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail('--at biçimi YYYY-AA-GG olmalı');
  const approved = readApproved(sheetPath);
  if (!approved.size) fail('inceleme sayfasında işaretli kutu yok (onay taşınmadı)');
  const texts = JSON.parse(fs.readFileSync(textsPath, 'utf8'));
  const holders = collectHolders(texts);
  const known = new Set(holders.map((h) => h.id));
  const missing = [...approved].filter((id) => !known.has(id));
  if (missing.length) fail(`işaretli kutu metin kaynağında yok: ${missing.join(', ')}`);
  const matched = holders.filter((h) => approved.has(h.id));
  if (!matched.length) fail('işaretli kutular mevcut metinlerle eşleşmedi (kimlik yazımını kontrol et)');
  let count = 0;
  for (const { entry } of matched) {
    if (!entry.review || entry.review.level !== 'draft') continue; // zaten onaylıysa dokunma
    entry.review.level = 'sourced';
    entry.review.by = 'owner';
    entry.review.at = date;
    count += 1;
  }
  // Onay yazılmadan ÖNCE L0 kuru denetimi: kırmızı bir repo bırakma.
  const problems = lintTexts(texts);
  if (problems.length) fail(`onay L0 kapısını bozar, yazılmadı:\n  - ${problems.join('\n  - ')}`);
  fs.writeFileSync(textsPath, `${JSON.stringify(texts, null, 2)}\n`);
  // Türetilen modüller onayla birlikte güncellenir.
  const spec = readSpec();
  const content = loadContent();
  const data = build(spec, content, texts);
  for (const [file, text] of [[OUT_MODULE, renderModule(data)],
    [OUT_CONCEPT_MODULE, renderConceptModule(buildConceptTexts(texts))]]) {
    const target = path.join(outDir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, text);
  }
  return count;
}

function main() {
  const flags = parseFlags(process.argv.slice(2));
  if (flags.applyReview) {
    const outDir = flags.outDir ? path.resolve(flags.outDir) : ROOT;
    const count = applyReview({
      textsPath: path.resolve(flags.texts), sheetPath: path.resolve(flags.sheet), outDir, at: flags.at
    });
    console.log(`kao2-curriculum-build: onay taşındı · ${count} metin sourced`);
    return;
  }
  const args = process.argv.slice(2);
  const at = args.indexOf('--out-dir');
  const outDir = at >= 0 ? path.resolve(args[at + 1] || fail('--out-dir değeri eksik')) : ROOT;
  const spec = readSpec();
  const content = loadContent();
  const texts = readTexts();
  const data = build(spec, content, texts);
  const conceptTexts = buildConceptTexts(texts);
  const outputs = [[OUT_MODULE, renderModule(data)], [OUT_REVIEW, renderReview(data, spec, content)], [OUT_TEXT_REVIEW, renderTextReview(data)],
    [OUT_CONCEPT_REVIEW, renderConceptReview(texts, content.grammar)], [OUT_CONCEPT_MODULE, renderConceptModule(conceptTexts)],
    [OUT_PRAYER_MAP, renderPrayerMapJson(data.prayerMap)], [OUT_PRAYER_REVIEW, renderPrayerReview(data.prayerMap)]];
  for (const [file, text] of outputs) {
    const target = path.join(outDir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, text);
  }
  const lessons = data.units.reduce((s, u) => s + u.lessons.length, 0);
  console.log(`kao2-curriculum-build: ${data.units.length} ünite · ${lessons} ders · ${Object.keys(data.lemmaToLesson).length} lemma`);
}

main();
