#!/usr/bin/env node
// KAO-04 · Gramer içeriği derleyicisi (ağsız).
// İlke (06 §1, AGENTS §4): taslakta Arapça YAZILMAZ. Kavramlar yalnız korpus
// referansı (`word`, `ref+from/to`), QAC sorgusu (`query`) ya da doğrulanmış sözlük
// kimliği (`lemmaId`) taşır; Arapça metni bu araç Tanzil/QAC/sözlükten çözer.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  INPUTS, CliError, readPinnedInput, readUthmaniInput, parseUthmani, missingInputs, missingMessage,
  parseMorphology, bwToArabic, validatePattern, parseApproval, arabicWordRegex
} from './kao-lexicon-build.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'kuran-ogreniyorum', 'content');
const DRAFT_PATH = path.join(CONTENT, 'grammar.draft.json');
const REVIEW_PATH = path.join(CONTENT, 'grammar.review.md');
const VERIFIED_PATH = path.join(CONTENT, 'grammar.verified.json');
const LEXICON_PATH = path.join(CONTENT, 'lexicon.verified.json');
const DEFAULT_INPUTS = path.join(CONTENT, 'inputs');
const GRAMMAR_VERSION = 'quran-grammar-tr-v1';

// 02 §2.3 alıştırma türleri — adlar birebir.
const TEMPLATE_TYPES = Object.freeze(['Anlam seç', 'Arapça seç', 'Kök bul', 'Kalıp eşle', 'Ek çöz',
  'Çekim tablosu', 'Kelime dizme', 'Parça çevir', 'Sûre okuma']);
const MIN_TEMPLATES = 3;
const MIN_EXAMPLES = 3;
const MAX_CHOICES = 4; // 02 §5.9: en çok 4 çip / seçenek
const MAX_ORDER_CHIPS = 6; // 02 §2.3: kelime dizme 4–6 çip
const TERM_FROM_UNIT = 3; // 02 §2.9: ilk 2 ünitede terim yok
const UNIT11_MIN_ROOTS = 60; // 12 R-A8
const PGN_RE = /^[123][MF]?[SDP]$/;

// ---------------------------------------------------------------------------
// Korpus
function loadCorpus(inputDir) {
  const missing = missingInputs(inputDir);
  if (missing.length) throw new CliError(missingMessage(inputDir, missing), 2);
  const morphology = readPinnedInput(inputDir, INPUTS.morphology);
  const parsed = parseMorphology(morphology.text);
  const verseTotal = new Set(parsed.words.map((word) => `${word.surah}:${word.ayah}`)).size;
  const uthmani = readUthmaniInput(inputDir, verseTotal);
  const aligned = parseUthmani(uthmani.text, parsed.words);
  return makeCorpus(parsed.words, aligned.byVerse);
}

function makeCorpus(words, byVerse) {
  return { words, byKey: new Map(words.map((word) => [word.key, word])), byVerse };
}

function segmentRole(segment) {
  const head = String(segment.features || '').split('|')[0];
  if (head === 'PREFIX') return 'prefix';
  if (head === 'SUFFIX') return 'suffix';
  return 'stem';
}

function stemFeatures(features) {
  const tokens = String(features || '').split('|');
  const value = (prefix) => (tokens.find((token) => token.startsWith(prefix)) || '').slice(prefix.length) || null;
  const formToken = tokens.find((token) => /^\([IVX]+\)$/.test(token));
  return {
    pos: value('POS:'),
    lemma: value('LEM:'),
    root: value('ROOT:'),
    aspect: ['PERF', 'IMPF', 'IMPV'].find((token) => tokens.includes(token)) || null,
    voice: tokens.includes('PASS') ? 'PASS' : 'ACT',
    mood: value('MOOD:'),
    form: formToken ? formToken.slice(1, -1) : 'I',
    pgn: tokens.find((token) => PGN_RE.test(token)) || null,
    gn: tokens.find((token) => /^[MF][SDP]?$/.test(token)) || null, // isimde cinsiyet/sayı (M, FP…)
    pcpl: tokens.includes('PCPL')
  };
}

// Sağlam kök: üç harf, illet (w/y/A), hemze ve ikiz harf yok — çekim tablosu düzenli kalır.
function isSoundRoot(root) {
  const letters = Array.from(String(root || ''));
  return letters.length === 3 && !letters.some((letter) => /[wyAY'><&}|]/.test(letter)) && letters[1] !== letters[2];
}

// Özne eki hangi siygada bulunur? (Arapça çekim): mâzide 3MS/3FS'de yok; muzâride yalnız
// ikil, çoğul ve 2FS'de; emirde 2MS'de yok. Bu siygalardaki ek NESNE ekidir.
function subjectSuffixExpected(aspect, pgn) {
  const value = String(pgn || '');
  if (aspect === 'PERF') return !['3MS', '3FS'].includes(value);
  if (aspect === 'IMPF') return /[DP]$/.test(value) || value === '2FS';
  if (aspect === 'IMPV') return value !== '2MS';
  return false;
}

function suffixPgn(segment) {
  const match = String(segment.features || '').match(/PRON:([123][MF]?[SDP])/);
  return match ? match[1] : null;
}

function tanzilToken(corpus, word) {
  const verse = corpus.byVerse.get(`${word.surah}:${word.ayah}`);
  const token = verse ? verse[word.wordIndex - 1] : null;
  if (!token) throw new CliError(`Tanzil kelimesi yok: ${word.key}`, 1);
  return token;
}

function resolveWord(corpus, ref) {
  const word = corpus.byKey.get(ref);
  if (!word) throw new CliError(`korpusta kelime yok: ${ref}`, 1);
  return {
    ref,
    ar: tanzilToken(corpus, word),
    lemmaBw: word.lemmaBw,
    rootBw: word.rootBw,
    segments: word.segments.map((segment) => ({
      ar: bwToArabic(segment.form), role: segmentRole(segment), tag: segment.tag
    })),
    source: 'tanzil+qac'
  };
}

function resolveSpan(corpus, ref, from, to) {
  const verse = corpus.byVerse.get(ref);
  if (!verse) throw new CliError(`korpusta âyet yok: ${ref}`, 1);
  if (!(Number.isInteger(from) && Number.isInteger(to) && from >= 1 && to <= verse.length && from <= to)) {
    throw new CliError(`geçersiz kelime aralığı ${ref} ${from}-${to} (âyet ${verse.length} kelime)`, 1);
  }
  const words = verse.slice(from - 1, to).map((ar, index) => ({ w: from + index, ar }));
  return { ar: words.map((item) => item.ar).join(' '), words, source: 'tanzil' };
}

function matchesQuery(word, query) {
  const segments = word.segments;
  const stems = segments.filter((segment) => segmentRole(segment) === 'stem');
  if (stems.length !== 1) return false;
  if (!query.allowPrefix && segments.some((segment) => segmentRole(segment) === 'prefix')) return false;
  const features = stemFeatures(stems[0].features);
  if (query.pgnAny && !query.pgnAny.includes(features.pgn)) return false;
  // Bağlamda başka siyga anlamı taşıyan eşsesli geçiş (QAC etiketi biçimce doğru ama öğretici değil).
  if (query.skipRefs && query.skipRefs.includes(word.key)) return false;
  for (const key of ['pos', 'aspect', 'lemma', 'form', 'pgn', 'gn']) {
    if (query[key] && features[key] !== query[key]) return false;
  }
  if (query.lemma === null && features.lemma) return false; // ayrık zamir: QAC lemma taşımaz
  if (query.pcpl != null && features.pcpl !== query.pcpl) return false;
  if (query.soundRoot && !isSoundRoot(features.root)) return false;
  if ((query.voice || 'ACT') !== features.voice) return false;
  if (features.aspect === 'IMPF' && !query.mood && features.mood && features.mood !== 'IND') return false;
  if (query.mood && features.mood !== query.mood) return false;
  const suffixes = segments.filter((segment) => segmentRole(segment) === 'suffix');
  if (query.suffixPgn) {
    return suffixes.length === 1 && suffixPgn(suffixes[0]) === query.suffixPgn;
  }
  // Yalnız özne eki (gövdeyle aynı şahıs; ikilde cinsiyet QAC'de yazılmayabilir) kabul;
  // nesne eki taşıyan biçim tabloya girmez.
  const genderless = (pgn) => String(pgn || '').replace(/[MF](?=[SDP]$)/, '');
  return suffixes.length === 0
    || (suffixes.length === 1 && subjectSuffixExpected(features.aspect, features.pgn)
      && genderless(suffixPgn(suffixes[0])) === genderless(features.pgn));
}

function resolveQuery(corpus, query) {
  const word = corpus.words.find((candidate) => matchesQuery(candidate, query));
  if (!word) return { unattested: true, query, source: 'qac-query' };
  const resolved = { ...resolveWord(corpus, word.key), source: 'qac-query' };
  const prefixed = word.segments.some((segment) => segmentRole(segment) === 'prefix');
  if (!prefixed) return resolved;
  // Önek (ve-, fe-…) tabloda gösterilmez: gövde + ek QAC bölütlerinden mekanik birleştirilir.
  const core = word.segments.filter((segment) => segmentRole(segment) !== 'prefix').map((segment) => bwToArabic(segment.form)).join('');
  return { ...resolved, token: resolved.ar, ar: core, source: 'qac-segments' };
}

// ---------------------------------------------------------------------------
// Sözlük
function loadLexicon(file = LEXICON_PATH) {
  if (!fs.existsSync(file)) throw new CliError(`doğrulanmış sözlük yok: ${path.relative(ROOT, file)}`, 2);
  const lexicon = JSON.parse(fs.readFileSync(file, 'utf8'));
  return {
    byId: new Map(lexicon.lemmas.map((lemma) => [lemma.lemmaId, lemma])),
    roots: new Map(lexicon.lemmas.filter((lemma) => lemma.rootBw).map((lemma) => [lemma.rootBw, lemma.root]))
  };
}

function resolveLemma(lexicon, lemmaId) {
  const lemma = lexicon.byId.get(lemmaId);
  if (!lemma) throw new CliError(`sözlükte lemma yok: ${lemmaId}`, 1);
  if (!lemma.verified) throw new CliError(`doğrulanmamış lemma kullanılamaz: ${lemmaId}`, 1);
  return { lemmaId, ar: lemma.ar, translit: lemma.translit.tr, tr1: lemma.tr1, rootBw: lemma.rootBw,
    root: lemma.root, source: 'lexicon' };
}

// ---------------------------------------------------------------------------
// Çözümleme
function resolveCell(ctx, cell) {
  if (cell.word) return { ...cell, resolved: resolveWord(ctx.corpus, cell.word) };
  if (cell.query) return { ...cell, resolved: resolveQuery(ctx.corpus, cell.query) };
  if (cell.lemmaId) return { ...cell, resolved: resolveLemma(ctx.lexicon, cell.lemmaId) };
  if (cell.text != null || cell.empty) return { ...cell, resolved: null };
  throw new CliError(`tanımsız hücre: ${JSON.stringify(cell)}`, 1);
}

function stripResolved(value) {
  if (Array.isArray(value)) return value.map(stripResolved);
  if (!value || typeof value !== 'object') return value;
  const out = {};
  for (const [key, item] of Object.entries(value)) {
    if (['resolved', 'termVisible', 'lemmas', 'distractorLemmas', 'report'].includes(key)) continue;
    out[key] = stripResolved(item);
  }
  return out;
}

function resolveConcept(ctx, concept) {
  const examples = concept.examples.map((example) => ({
    ...example, resolved: resolveSpan(ctx.corpus, example.ref, example.from, example.to)
  }));
  const tables = (concept.tables || []).map((table) => ({
    ...table,
    rows: table.rows.map((row) => ({ ...row, cells: row.cells.map((cell) => resolveCell(ctx, cell)) }))
  }));
  const templates = concept.templates.map((template) => resolveTemplate(ctx, template));
  return { ...concept, termVisible: concept.unit >= TERM_FROM_UNIT, examples, tables, templates };
}

function resolveTemplate(ctx, template) {
  const out = { ...template };
  if (template.cell) out.cell = resolveCell(ctx, template.cell);
  if (template.options && template.type === 'Arapça seç') out.options = template.options.map((cell) => resolveCell(ctx, cell));
  if (template.word) out.resolved = resolveWord(ctx.corpus, template.word);
  if (template.lemmaIds) out.lemmas = template.lemmaIds.map((id) => resolveLemma(ctx.lexicon, id));
  if (template.distractorLemmaIds) {
    out.distractorLemmas = template.distractorLemmaIds.map((id) => resolveLemma(ctx.lexicon, id));
  }
  return out;
}

function resolveUnit11(ctx, unit11) {
  return {
    ...unit11,
    roots: unit11.roots.map((entry) => ({
      ...entry,
      resolved: { root: ctx.lexicon.roots.get(entry.rootBw) || null,
        lemmas: (entry.lemmaIds || []).map((id) => resolveLemma(ctx.lexicon, id)) }
    }))
  };
}

// ---------------------------------------------------------------------------
// Denetim
const hasArabic = (value) => arabicWordRegex().test(String(value || ''));

function turkishFields(concept) {
  const fields = [concept.title, concept.plainTr, concept.termTr, ...(concept.explanation || [])];
  for (const example of concept.examples) fields.push(example.tr);
  for (const table of concept.tables || []) {
    fields.push(table.title, ...(table.columns || []));
    for (const row of table.rows) fields.push(row.label, ...row.cells.map((cell) => cell.text));
  }
  for (const template of concept.templates) {
    fields.push(template.prompt, template.promptTr, ...(template.parts || []));
    if (template.type !== 'Arapça seç') fields.push(...(template.options || []));
  }
  return fields.filter((field) => field != null);
}

function templateIssues(concept, template) {
  const issues = [];
  const add = (issue) => issues.push({ id: concept.id, template: template.id, issue });
  if (!TEMPLATE_TYPES.includes(template.type)) add(`unknown_type:${template.type}`);
  const exampleIds = new Set(concept.examples.map((example) => example.id));
  const optionCheck = () => {
    if (!Array.isArray(template.options) || template.options.length < 2 || template.options.length > MAX_CHOICES) add('options_count');
    if (!Number.isInteger(template.answer) || template.answer < 0 || template.answer >= (template.options || []).length) add('answer_index');
  };
  switch (template.type) {
    case 'Anlam seç':
      if (!template.cell) add('missing_cell');
      optionCheck();
      break;
    case 'Arapça seç':
      if (!template.promptTr) add('missing_promptTr');
      optionCheck();
      if ((template.options || []).some((cell) => cell.resolved && cell.resolved.unattested)) add('unattested_option');
      break;
    case 'Kök bul': {
      const target = template.cell && template.cell.resolved;
      if (!target || !target.rootBw) add('missing_root');
      const roots = (template.distractorLemmas || []).map((lemma) => lemma.rootBw);
      if (roots.length < 1 || roots.length > MAX_CHOICES - 1 || roots.some((root) => !root || (target && root === target.rootBw))
        || new Set(roots).size !== roots.length) add('root_distractors');
      break;
    }
    case 'Kalıp eşle': {
      const lemmas = template.lemmas || [];
      if (lemmas.length !== 3 || new Set(lemmas.map((lemma) => lemma.rootBw)).size !== 1) add('pattern_match_same_root_3');
      break;
    }
    case 'Ek çöz': {
      const segments = template.resolved ? template.resolved.segments : [];
      if (segments.length < 2) add('segments_lt_2');
      if (!Array.isArray(template.parts) || template.parts.length !== segments.length) add('parts_segment_mismatch');
      break;
    }
    case 'Çekim tablosu': {
      const table = (concept.tables || []).find((item) => item.id === template.tableId);
      const cellAt = ([row, col]) => table && table.rows[row] && table.rows[row].cells[col];
      const cells = [template.blank, ...(template.distractors || [])].map((coord) => (Array.isArray(coord) ? cellAt(coord) : null));
      if (!table) add('missing_table');
      else if (cells.some((cell) => !cell || !cell.resolved || cell.resolved.unattested || !cell.resolved.ar)) add('blank_or_distractor_unresolved');
      if ((template.distractors || []).length < 1 || (template.distractors || []).length > MAX_CHOICES - 1) add('distractor_count');
      break;
    }
    case 'Kelime dizme': {
      const example = concept.examples.find((item) => item.id === template.exampleId);
      const count = example && example.resolved ? example.resolved.words.length : 0;
      if (!example) add('missing_example');
      else if (count < 3 || count > MAX_ORDER_CHIPS) add('chip_count');
      break;
    }
    case 'Parça çevir': {
      const example = concept.examples.find((item) => item.id === template.exampleId);
      optionCheck();
      if (!example) add('missing_example');
      else if ((template.options || [])[template.answer] !== example.tr) add('answer_not_example_tr');
      if (new Set(template.options || []).size !== (template.options || []).length) add('duplicate_options');
      break;
    }
    case 'Sûre okuma':
      if (!template.exampleId || !exampleIds.has(template.exampleId)) add('missing_example');
      break;
    default:
      break;
  }
  return issues;
}

function conceptIssues(concept) {
  const issues = [];
  const add = (issue) => issues.push({ id: concept.id, issue });
  if (!/^g(0_5|[1-9]|1\d|2[0-4])$/.test(concept.id)) add('bad_id');
  if (!Number.isInteger(concept.unit) || concept.unit < 1 || concept.unit > 12) add('bad_unit');
  if (!concept.title || !concept.plainTr || !concept.termTr) add('missing_text');
  if (concept.examples.length < MIN_EXAMPLES) add('examples_lt_3');
  if (concept.examples.some((example) => !example.tr)) add('missing_example_tr');
  if (concept.templates.length < MIN_TEMPLATES) add('templates_lt_3');
  if (new Set(concept.templates.map((template) => template.type)).size < 2) add('template_types_lt_2');
  const ids = [...concept.examples, ...concept.templates, ...(concept.tables || [])].map((item) => item.id);
  if (new Set(ids).size !== ids.length) add('duplicate_ids');
  if (turkishFields(concept).some(hasArabic)) add('arabic_in_turkish_field');
  for (const table of concept.tables || []) {
    for (const row of table.rows) {
      if (row.cells.length !== table.columns.length - 1) add(`table_shape:${table.id}`);
    }
  }
  for (const template of concept.templates) issues.push(...templateIssues(concept, template));
  return issues;
}

function unit11Issues(unit11, lexicon) {
  const issues = [];
  const add = (issue) => issues.push({ id: 'unit11', issue });
  if (!unit11 || !Array.isArray(unit11.roots)) return [{ id: 'unit11', issue: 'missing' }];
  if (unit11.roots.length < UNIT11_MIN_ROOTS) add(`roots_lt_${UNIT11_MIN_ROOTS}`);
  const seen = new Set();
  for (const entry of unit11.roots) {
    if (seen.has(entry.rootBw)) add(`duplicate_root:${entry.rootBw}`);
    seen.add(entry.rootBw);
    if (!lexicon.roots.has(entry.rootBw)) add(`root_not_in_lexicon:${entry.rootBw}`);
    if (!Array.isArray(entry.derivatives) || entry.derivatives.length < 2) add(`derivatives_lt_2:${entry.rootBw}`);
    for (const item of entry.derivatives || []) {
      if (!item.tr || hasArabic(item.tr) || /[()]/.test(item.tr)) add(`bad_derivative:${entry.rootBw}:${item.tr}`);
      if (!validatePattern(item.pattern) || / · /.test(item.pattern)) add(`bad_pattern:${entry.rootBw}:${item.tr}`);
    }
    for (const id of entry.lemmaIds || []) {
      const lemma = lexicon.byId.get(id);
      if (!lemma || lemma.rootBw !== entry.rootBw) add(`lemma_root_mismatch:${entry.rootBw}:${id}`);
    }
  }
  return issues;
}

function auditDraft(draft, lexicon) {
  const issues = [];
  for (const concept of draft.concepts) issues.push(...conceptIssues(concept));
  const ids = draft.concepts.map((concept) => concept.id);
  if (new Set(ids).size !== ids.length) issues.push({ id: '*', issue: 'duplicate_concept' });
  const g05 = draft.concepts.find((concept) => concept.id === 'g0_5');
  if (!g05) issues.push({ id: 'g0_5', issue: 'missing' });
  else {
    if (g05.unit !== 1 || g05.errorClass !== 'order') issues.push({ id: 'g0_5', issue: 'r_a7_unit1_order' });
    if (!g05.templates.some((template) => template.type === 'Kelime dizme')) issues.push({ id: 'g0_5', issue: 'r_a7_needs_ordering' });
  }
  const expected = ['g0_5', ...Array.from({ length: 24 }, (_, index) => `g${index + 1}`)];
  for (const id of expected) if (!ids.includes(id)) issues.push({ id, issue: 'missing_concept' });
  issues.push(...unit11Issues(draft.unit11, lexicon));
  return issues;
}

// ---------------------------------------------------------------------------
// Komutlar
function readJson(file) {
  if (!fs.existsSync(file)) throw new CliError(`dosya yok: ${path.relative(ROOT, file)}`, 2);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function unattestedCells(concepts) {
  const out = [];
  for (const concept of concepts) {
    for (const table of concept.tables) {
      for (const row of table.rows) {
        row.cells.forEach((cell, index) => {
          if (cell.resolved && cell.resolved.unattested) out.push(`${concept.id}/${table.id}/${row.label}/${table.columns[index + 1]}`);
        });
      }
    }
  }
  return out;
}

function build(inputDir) {
  const spec = stripResolved(readJson(DRAFT_PATH));
  const ctx = { corpus: loadCorpus(inputDir), lexicon: loadLexicon() };
  const concepts = spec.concepts.map((concept) => resolveConcept(ctx, concept));
  const draft = { ...spec, schemaVersion: 1, version: GRAMMAR_VERSION, generatedBy: 'kao-grammar-build --build',
    concepts, unit11: resolveUnit11(ctx, spec.unit11) };
  const issues = auditDraft(draft, ctx.lexicon);
  const unattested = unattestedCells(concepts);
  draft.report = { conceptTotal: concepts.length, templateTotal: concepts.reduce((sum, c) => sum + c.templates.length, 0),
    exampleTotal: concepts.reduce((sum, c) => sum + c.examples.length, 0), unit11Roots: draft.unit11.roots.length,
    unit11Derivatives: draft.unit11.roots.reduce((sum, entry) => sum + entry.derivatives.length, 0),
    unattestedCells: unattested, issues };
  fs.writeFileSync(DRAFT_PATH, `${JSON.stringify(draft, null, 2)}\n`);
  console.log(`KAO grammar draft: ${path.relative(ROOT, DRAFT_PATH)}`);
  console.log(`concepts=${draft.report.conceptTotal} templates=${draft.report.templateTotal} examples=${draft.report.exampleTotal}`
    + ` unit11Roots=${draft.report.unit11Roots} unattested=${unattested.length} issues=${issues.length}`);
  for (const issue of issues.slice(0, 40)) console.log(`  ${JSON.stringify(issue)}`);
  return draft;
}

const escapeCell = (value) => String(value == null ? '' : value).replace(/\|/g, '\\|').replace(/\n/g, ' ');

function cellText(cell) {
  if (!cell) return '';
  if (cell.text != null) return cell.text;
  if (cell.empty) return '—';
  const resolved = cell.resolved;
  if (!resolved) return '';
  if (resolved.unattested) return '(Kur\'an\'da geçmez)';
  return `${resolved.ar}${resolved.ref ? ` [${resolved.ref}]` : ''}`;
}

function renderReview(draft, signatures) {
  const lines = ['# KAO-04 · Gramer inceleme tablosu', '',
    '> Arapça metnin tamamı korpustan çözülür (`tools/kao-grammar-build.mjs --build`); bu dosyada',
    '> yalnız onay sütunları (`verifiedBy`, `verifiedAt`) düzenlenir. Onay kuralı D-12 (06 §3):',
    '> tek doğrulayıcı + tek tarih + kavram denetimi 0 sorun.', '',
    '## Onay tablosu', '', '| id | ünite | başlık | şablon | örnek | tablo | verifiedBy | verifiedAt |', '|---|---|---|---|---|---|---|---|'];
  const rows = [...draft.concepts.map((concept) => [concept.id, concept.unit, concept.title, concept.templates.length,
    concept.examples.length, concept.tables.length]), ['unit11', 11, 'Türkçedeki akrabalar (R-A8)', '—', '—', draft.unit11.roots.length]];
  for (const row of rows) {
    const sig = signatures.get(row[0]) || {};
    lines.push(`| ${[...row, sig.verifiedBy || '', sig.verifiedAt || ''].map(escapeCell).join(' | ')} |`);
  }
  for (const concept of draft.concepts) {
    lines.push('', `## ${concept.id} · Ünite ${concept.unit} · ${concept.title}`, '',
      `- **Terimsiz:** ${concept.plainTr}`, `- **Terimli** (${concept.termVisible ? 'görünür' : 'gizli — ünite <3'}): ${concept.termTr}`);
    for (const line of concept.explanation || []) lines.push(`- ${line}`);
    for (const table of concept.tables) {
      lines.push('', `**${table.title}**`, '', `| ${table.columns.map(escapeCell).join(' | ')} |`, `|${table.columns.map(() => '---').join('|')}|`);
      for (const row of table.rows) lines.push(`| ${[row.label, ...row.cells.map(cellText)].map(escapeCell).join(' | ')} |`);
    }
    lines.push('', '**Örnekler**', '');
    for (const example of concept.examples) lines.push(`- \`${example.ref}:${example.from}-${example.to}\` ${example.resolved.ar} — ${example.tr}`);
    lines.push('', '**Şablonlar**', '');
    for (const template of concept.templates) lines.push(`- ${template.id} · ${template.type}: ${template.prompt || template.promptTr || ''}`);
  }
  lines.push('', '## unit11 · Türkçedeki akrabalar (R-A8)', '', '| kök | Türkçe türevler (kalıp) |', '|---|---|');
  for (const entry of draft.unit11.roots) {
    lines.push(`| ${escapeCell(entry.resolved.root)} | ${escapeCell(entry.derivatives.map((item) => `${item.tr} = ${item.pattern}`).join(' · '))} |`);
  }
  return `${lines.join('\n')}\n`;
}

function parseSignatures(markdown) {
  const signatures = new Map();
  for (const line of markdown.split('\n')) {
    const cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
    if (cells.length !== 8 || !/^(g\d|g0_5|unit11)/.test(cells[0])) continue;
    signatures.set(cells[0], { verifiedBy: cells[6] || null, verifiedAt: cells[7] || null });
  }
  return signatures;
}

function existingSignatures() {
  if (fs.existsSync(REVIEW_PATH)) return parseSignatures(fs.readFileSync(REVIEW_PATH, 'utf8'));
  return new Map();
}

function writeReview() {
  const draft = readJson(DRAFT_PATH);
  fs.writeFileSync(REVIEW_PATH, renderReview(draft, existingSignatures()));
  console.log(`KAO grammar review: ${path.relative(ROOT, REVIEW_PATH)}`);
}

function applySignatures(draft, signatures, lexicon) {
  const issues = auditDraft(draft, lexicon);
  const sign = (item) => {
    const sig = signatures.get(item.id) || {};
    const approval = sig.verifiedBy ? parseApproval(sig.verifiedAt) : null;
    const itemIssues = issues.filter((issue) => issue.id === item.id);
    if (sig.verifiedBy && !(approval && approval.valid)) issues.push({ id: item.id, issue: 'invalid_verified_at' });
    return { ...item, verifiedBy: sig.verifiedBy || null, verifiedAt: approval && approval.valid ? approval.date : null,
      verified: Boolean(sig.verifiedBy && approval && approval.valid && !itemIssues.length) };
  };
  const concepts = draft.concepts.map(sign);
  const unit11 = sign({ ...draft.unit11, id: 'unit11' });
  return { concepts, unit11, issues };
}

function importGrammar() {
  const draft = readJson(DRAFT_PATH);
  if (!fs.existsSync(REVIEW_PATH)) throw new CliError(`inceleme tablosu yok: ${path.relative(ROOT, REVIEW_PATH)}`, 2);
  const lexicon = loadLexicon();
  const { concepts, unit11, issues } = applySignatures(draft, parseSignatures(fs.readFileSync(REVIEW_PATH, 'utf8')), lexicon);
  const unsigned = [...concepts, unit11].filter((item) => !item.verifiedBy).map((item) => item.id);
  const verifiedTotal = concepts.filter((concept) => concept.verified).length + (unit11.verified ? 1 : 0);
  const output = { schemaVersion: 1, version: GRAMMAR_VERSION, importedBy: 'kao-grammar-build --import-grammar',
    importedAt: new Date().toISOString().slice(0, 10), approvalRule: 'D-12 (06 §3)', attribution: draft.attribution,
    verifiedTotal, itemTotal: concepts.length + 1, unsigned, consistencyTotal: issues.length, consistency: issues,
    report: draft.report, concepts, unit11 };
  fs.writeFileSync(VERIFIED_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`KAO grammar verified: ${path.relative(ROOT, VERIFIED_PATH)}`);
  console.log(`verified=${verifiedTotal}/${output.itemTotal} unsigned=${unsigned.length} consistency=${issues.length}`);
  for (const issue of issues.slice(0, 20)) console.log(`  ${JSON.stringify(issue)}`);
}

function printExample(inputDir, spec) {
  const corpus = loadCorpus(inputDir);
  const [surah, ayah, range] = spec.split(':');
  const ref = `${surah}:${ayah}`;
  const verse = corpus.byVerse.get(ref);
  if (!verse) throw new CliError(`âyet yok: ${ref}`, 1);
  const [from, to] = range ? range.split('-').map(Number) : [1, verse.length];
  const span = resolveSpan(corpus, ref, from, to);
  for (const item of span.words) {
    const word = corpus.byKey.get(`${ref}:${item.w}`);
    const parts = word.segments.map((segment) => `${segmentRole(segment)}:${segment.tag}:${segment.form}`).join('+');
    console.log(`${ref}:${item.w}\t${item.ar}\t${word.lemmaBw || ''}\t${parts}`);
  }
}

// ---------------------------------------------------------------------------
// Self-test (sentetik korpus; ağ ve dosya yok)
function assert(condition, message) { if (!condition) throw new Error(`self-test: ${message}`); }

function syntheticCorpus() {
  const seg = (form, tag, features) => ({ form, tag, features });
  const word = (key, segments) => {
    const [surah, ayah, wordIndex] = key.split(':').map(Number);
    const lemma = segments.map((segment) => segment.features.match(/LEM:([^|]+)/)).find(Boolean);
    return { key, surah, ayah, wordIndex, segments, lemmaBw: lemma ? lemma[1] : null, rootBw: 'qwl' };
  };
  const words = [
    word('1:1:1', [seg('wa', 'CONJ', 'PREFIX|w:CONJ+'), seg('qaAla', 'V', 'STEM|POS:V|PERF|LEM:qaAla|ROOT:qwl|3MS')]),
    word('1:1:2', [seg('qaAla', 'V', 'STEM|POS:V|PERF|LEM:qaAla|ROOT:qwl|3MS')]),
    word('1:1:3', [seg('qaAlu', 'V', 'STEM|POS:V|PERF|LEM:qaAla|ROOT:qwl|3MP'), seg('wA', 'PRON', 'SUFFIX|PRON:3MP')]),
    word('1:1:4', [seg('qaAla', 'V', 'STEM|POS:V|PERF|LEM:qaAla|ROOT:qwl|3MS'), seg('hum', 'PRON', 'SUFFIX|PRON:3MP')]),
    word('1:1:5', [seg('yaquwlu', 'V', 'STEM|POS:V|IMPF|LEM:qaAla|ROOT:qwl|3MS|MOOD:JUS')])
  ];
  return makeCorpus(words, new Map([['1:1', ['T1', 'T2', 'T3', 'T4', 'T5']]]));
}

function selfTest() {
  const corpus = syntheticCorpus();
  assert(resolveQuery(corpus, { pos: 'V', aspect: 'PERF', pgn: '3MS' }).ref === '1:1:2', 'önekli biçim tabloya girmemeli');
  assert(resolveQuery(corpus, { pos: 'V', aspect: 'PERF', pgn: '3MP' }).ref === '1:1:3', 'özne eki kabul edilmeli');
  assert(resolveQuery(corpus, { pos: 'V', aspect: 'PERF', suffixPgn: '3MP', pgn: '3MS' }).ref === '1:1:4', 'nesne eki sorgusu');
  assert(resolveQuery(corpus, { pos: 'V', aspect: 'IMPF', pgn: '3MS' }).unattested === true, 'cezm kipli muzâri düz sorguda sayılmamalı');
  assert(resolveQuery(corpus, { pos: 'V', aspect: 'PERF', pgn: '2FD' }).unattested === true, 'geçmeyen biçim uydurulmamalı');
  assert(resolveQuery(corpus, { pos: 'V', aspect: 'PERF', pgn: '3MS', lemma: null }).unattested === true, 'lemma:null yalnız lemmasız gövdeyi seçer');
  const prefixed = resolveQuery(corpus, { pos: 'V', aspect: 'PERF', pgn: '3MS', allowPrefix: true });
  assert(prefixed.ref === '1:1:1' && prefixed.source === 'qac-segments' && prefixed.token === 'T1', 'önekli biçim gövde+ek olarak gösterilmeli');
  assert(resolveQuery(corpus, { pos: 'V', aspect: 'PERF', pgnAny: ['3MP', '3D'] }).ref === '1:1:3', 'pgnAny eşleşmesi');
  assert(!subjectSuffixExpected('IMPF', '3FS') && subjectSuffixExpected('IMPF', '3MP') && subjectSuffixExpected('PERF', '1S')
    && !subjectSuffixExpected('PERF', '3MS') && subjectSuffixExpected('IMPF', '2FS'), 'özne eki siyga kuralı');
  assert(isSoundRoot('ktb') && !isSoundRoot('qwl') && !isSoundRoot('mdd') && !isSoundRoot('Amn'), 'sağlam kök ayrımı');
  assert(resolveWord(corpus, '1:1:3').segments.length === 2 && resolveWord(corpus, '1:1:3').ar === 'T3', 'kelime Tanzil + QAC segmentleri');
  assert(resolveSpan(corpus, '1:1', 2, 4).words.length === 3, 'aralık çözümü');
  let threw = false;
  try { resolveSpan(corpus, '1:1', 4, 9); } catch { threw = true; }
  assert(threw, 'âyet dışı aralık reddedilmeli');
  const base = { id: 'g1', unit: 1, title: 'x', plainTr: 'x', termTr: 'x', tables: [],
    examples: [1, 2, 3].map((n) => ({ id: `e${n}`, ref: '1:1', from: 1, to: 3, tr: `t${n}`, resolved: { words: [{}, {}, {}] } })) };
  const good = { ...base, templates: [
    { id: 't1', type: 'Kelime dizme', exampleId: 'e1' },
    { id: 't2', type: 'Parça çevir', exampleId: 'e2', options: ['t2', 'y', 'z'], answer: 0 },
    { id: 't3', type: 'Ek çöz', word: '1:1:3', parts: ['dedi', 'onlar'], resolved: resolveWord(corpus, '1:1:3') }] };
  assert(conceptIssues(good).length === 0, `geçerli kavram sorunsuz olmalı: ${JSON.stringify(conceptIssues(good))}`);
  const badType = { ...good, templates: [...good.templates, { id: 't4', type: 'Serbest yazma' }] };
  assert(conceptIssues(badType).some((issue) => /unknown_type/.test(issue.issue)), '02 §2.3 dışı tür reddedilmeli');
  assert(conceptIssues({ ...good, plainTr: bwToArabic('qaAla') }).some((issue) => issue.issue === 'arabic_in_turkish_field'),
    'Türkçe alana Arapça yazılamaz');
  const wrongAnswer = { ...good, templates: [good.templates[0], { ...good.templates[1], options: ['a', 'b'] }, good.templates[2]] };
  assert(conceptIssues(wrongAnswer).some((issue) => issue.issue === 'answer_not_example_tr'), 'parça çevir cevabı örnek çevirisi olmalı');
  const fewParts = { ...good, templates: [good.templates[0], good.templates[1], { ...good.templates[2], parts: ['dedi'] }] };
  assert(conceptIssues(fewParts).some((issue) => issue.issue === 'parts_segment_mismatch'), 'ek çöz parça sayısı segmentle eşleşmeli');
  const oneType = { ...good, templates: good.templates.map((template, index) => ({ ...template, id: `k${index}`, type: 'Kelime dizme', exampleId: 'e1' })) };
  assert(conceptIssues(oneType).some((issue) => issue.issue === 'template_types_lt_2'), 'tek türden şablon serpiştirmeyi bozar');
  const sigs = parseSignatures('| g1 | 1 | x | 3 | 3 | 0 | yz | 2026-09-23 |');
  assert(sigs.get('g1').verifiedBy === 'yz' && sigs.get('g1').verifiedAt === '2026-09-23', 'onay sütunları okunmalı');
  assert(stripResolved({ a: { resolved: 1, b: 2 }, termVisible: true }).a.resolved === undefined, 'çözülmüş alanlar spesifikasyondan ayıklanmalı');
  assert(JSON.stringify(stripResolved({ distractors: [[0, 1]] }).distractors) === '[[0,1]]', 'yazar alanı (distractors) ayıklanmamalı');
  console.log('KAO grammar self-test: PASS (korpus sorgusu, özne/nesne eki, geçmeyen biçim, aralık, şablon türleri, serpiştirme, Arapça sızıntı bekçisi, onay)');
}

function usage() {
  return ['Kullanım:', '  node tools/kao-grammar-build.mjs --self-test',
    '  node tools/kao-grammar-build.mjs --build [--inputs <dizin>]',
    '  node tools/kao-grammar-build.mjs --review-md', '  node tools/kao-grammar-build.mjs --import-grammar',
    '  node tools/kao-grammar-build.mjs --example S:A[:ilk-son] [--inputs <dizin>]'].join('\n');
}

function inputsArg(argv) {
  const index = argv.indexOf('--inputs');
  return index === -1 ? DEFAULT_INPUTS : path.resolve(ROOT, argv[index + 1] || '');
}

function main(argv) {
  if (argv.includes('--self-test')) return selfTest();
  if (argv.includes('--build')) return build(inputsArg(argv));
  if (argv.includes('--review-md')) return writeReview();
  if (argv.includes('--import-grammar')) return importGrammar();
  const exampleIndex = argv.indexOf('--example');
  if (exampleIndex !== -1 && argv[exampleIndex + 1]) return printExample(inputsArg(argv), argv[exampleIndex + 1]);
  throw new CliError(usage(), 64);
}

export { loadCorpus, loadLexicon, resolveQuery, resolveWord, resolveSpan, conceptIssues, auditDraft, TEMPLATE_TYPES };

const IS_MAIN = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (IS_MAIN) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error && error.message ? error.message : String(error));
    process.exitCode = error instanceof CliError ? error.exitCode : 1;
  }
}
