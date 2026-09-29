#!/usr/bin/env node
// KAO2-07 müfredat derleyici. Girdi: curriculum.spec.json (Arapça yok) + donmuş
// KAO içerik modülleri. Çıktı: app/content/quranCurriculumV2.js ve
// kuran-ogreniyorum-v2/inceleme/MUFREDAT-ESLEME.md. Belirlenimci: zaman damgası
// yok, sıralama yalnız veriye bağlı; ağ, tarayıcı ve kullanıcı verisi yok.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPEC = 'kuran-ogreniyorum-v2/content/curriculum.spec.json';
const OUT_MODULE = 'app/content/quranCurriculumV2.js';
const OUT_REVIEW = 'kuran-ogreniyorum-v2/inceleme/MUFREDAT-ESLEME.md';
const TEXTS = 'kuran-ogreniyorum-v2/content/texts.tr.json';
const OUT_TEXT_REVIEW = 'kuran-ogreniyorum-v2/inceleme/INCELEME-KAO2-17.md';
const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

function fail(message) {
  throw new Error(`kao2-curriculum-build: ${message}`);
}

function loadContent() {
  const box = vm.createContext({ window: {} });
  for (const name of ['Lexicon', 'Grammar', 'ShortSurahs']) {
    const file = `app/content/quran${name}V1.js`;
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), box, { filename: file });
  }
  const { QuranLexiconV1: lex, QuranGrammarV1: grammar, QuranShortSurahsV1: surahs } = box.window;
  if (!lex || !grammar || !surahs) fail('içerik modülleri yüklenemedi');
  return { lex, grammar, surahs };
}

function readSpec() {
  const raw = fs.readFileSync(path.join(ROOT, SPEC), 'utf8');
  if (ARABIC.test(raw)) fail('spec Arapça içeremez (D-12); yalnız lemma kimliği kullan');
  return JSON.parse(raw);
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
  const lemmaToLesson = {};
  const units = spec.units.map((unit) => {
    for (const cid of unit.conceptIds) if (!content.grammar.byId(cid)) fail(`Ü${unit.id}: geçersiz kavram ${cid}`);
    const chunks = lessonsFor(perUnit.get(unit.id), byId, spec.lessonSize, unit.conceptIds.length);
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
        apply: source.get(lemmaIds[0]),
        mastery: i === chunks.length - 1,
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
  const s0 = { lessons: spec.s0.map((title, i) => {
    const id = `s0.${pad(i + 1)}`;
    const text = textFor(texts, id, title, '', 's0');
    return { id, title: text.title, goal: text.goal || null, review: text.review };
  }) };
  const missing = content.lex.lemmas.filter((l) => !lemmaToLesson[l.id]);
  if (missing.length) fail(`derse girmeyen lemma: ${missing[0].id}`);
  return { version: spec.version, levels, units, s0, lemmaToLesson };
}

function renderModule(data) {
  const freeze = "function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.keys(v).forEach(function(k){freeze(v[k]);});Object.freeze(v);}return v;}";
  const index = "var index={};data.units.forEach(function(u){u.lessons.forEach(function(l){index[l.id]=l;});});";
  const byLesson = "data.byLesson=function(id){return Object.prototype.hasOwnProperty.call(index,id)?index[id]:null;};";
  return '/* KAO2-07 araç çıktısı: tools/kao2-curriculum-build.mjs + kuran-ogreniyorum-v2/content/curriculum.spec.json. Elle düzenlemeyin. */\n'
    + `(function(){'use strict';${freeze}var data=${JSON.stringify(data)};${index}${byLesson}window.QuranCurriculumV2=freeze(data);})();\n`;
}

const unitSize = (u) => u.lessons.reduce((s, l) => s + l.lemmaIds.length, 0);

function renderReview(data, spec, { lex, grammar }) {
  const byId = new Map(lex.lemmas.map((l) => [l.id, l]));
  const cell = (s) => String(s).replace(/\|/g, '\\|');
  const lines = [
    '# KAO2 — Müfredat eşlemesi (G2 incelemesi)', '',
    '> Araç çıktısı: `node tools/kao2-curriculum-build.mjs` — elle düzenlemeyin; değişiklik `kuran-ogreniyorum-v2/content/curriculum.spec.json` üzerinden yapılır.',
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
    '> Onaylanmamış metinler `draft` kalır ve uygulamada **gösterilmez**.', '',
    '## Durum', ''];
  const all = [];
  data.units.forEach((u) => { all.push({ id: `u${u.id}`, kind: 'ünite', review: u.review }); u.lessons.forEach((l) => all.push({ id: l.id, kind: 'ders', review: l.review })); });
  data.s0.lessons.forEach((l) => all.push({ id: l.id, kind: 'S0', review: l.review }));
  const count = (level) => all.filter((t) => t.review.level === level).length;
  lines.push(`- Toplam metin: **${all.length}**`,
    `- \`draft\` (görünmez): **${count('draft')}**`,
    `- \`sourced\` (görünür): **${count('sourced')}**`,
    `- \`expert\` (görünür): **${count('expert')}**`, '',
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

function main() {
  const args = process.argv.slice(2);
  const at = args.indexOf('--out-dir');
  const outDir = at >= 0 ? path.resolve(args[at + 1] || fail('--out-dir değeri eksik')) : ROOT;
  const spec = readSpec();
  const content = loadContent();
  const texts = readTexts();
  const data = build(spec, content, texts);
  const outputs = [[OUT_MODULE, renderModule(data)], [OUT_REVIEW, renderReview(data, spec, content)], [OUT_TEXT_REVIEW, renderTextReview(data)]];
  for (const [file, text] of outputs) {
    const target = path.join(outDir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, text);
  }
  const lessons = data.units.reduce((s, u) => s + u.lessons.length, 0);
  console.log(`kao2-curriculum-build: ${data.units.length} ünite · ${lessons} ders · ${Object.keys(data.lemmaToLesson).length} lemma`);
}

main();
