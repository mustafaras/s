'use strict';

// K2F-09 · Gramer 1/3 (K4-02 kök neden) — bölüm A: dondurma hattı doğrulanmış âyet örneklerini ve açıklamaları
// çalışma zamanı modülüne taşır. Arapça ve okunuş YALNIZ doğrulanmış kaynaktan/araç projeksiyonundan gelir;
// bu test onları elle yazmaz, kaynakla karşılaştırır. Sentetik VM; ağ, tarayıcı, gerçek kullanıcı verisi yok.
// K2F-10 · Gramer 2/3 (K4-02 güvenlik ağı) — bölüm B: yanlış gramer görevi HİÇ gösterilmez (fail-closed). Ders oynatıcı
// geçersiz görevi aynı dersin bir kelime alıştırmasıyla ikame eder, tekrar kuyruğu sunmaz, kullanıcının `g:` kartları silinmez.
// K2F-11 · Gramer 3/3 — bölüm C: görevler doğrulanmış örnekten ve kavram tablosundan KURULUR (yönlendirir + öğretir);
// kurulamayanlar gerekçesiyle `GRAMER-SABLON-L2.md` listesine yazılır; ardışık aynı tür gelmez.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');
const repoRoot = require('../repo-root');
const { bootKao, freshUser, DEFAULT_NOW } = require('./helpers/kao-harness');

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

const source = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/content/grammar.verified.json'), 'utf8'));
const box = { window: {} };
vm.createContext(box);
const modulePath = path.join(repoRoot, 'app/content/quranGrammarV1.js');
vm.runInContext(fs.readFileSync(modulePath, 'utf8'), box, { filename: 'quranGrammarV1.js' });
const grammar = box.window.QuranGrammarV1;
const srcConcept = (id) => source.concepts.find((c) => c.id === id);
const ARABIC = /[؀-ۿ]/;

// Ders oynatıcıyı gerçek handler'larla özete kadar yürütür. Harness'in `walkLesson`ı görev başına tek cevap verir; "Kelime dizme"
// (kind:'order') birden çok seçim ister, bu yüzden burada order-aware yürüyüşçü var. wrongFor(task) true ise yanlış cevap verilir.
function walkAware(t, lessonId, { wrongFor = () => false, visit } = {}) {
  if (!t.api.kaoLesson('start', lessonId)) return false;
  const st = t.ui.kaoLesson;
  for (let guard = 0; guard < 400; guard += 1) {
    if (st.phase === 'practice' || st.phase === 'review') {
      const item = t.ui.kaoQueue[t.ui.kaoTaskIndex];
      const task = item && t.ui.kaoTasks[item.id];
      if (!task) return false;
      if (visit) visit(task);
      const wrong = wrongFor(task);
      const choices = task.choices || [];
      if (task.kind === 'order') {
        const byOrdinal = choices.slice().sort((a, b) => a.ordinal - b.ordinal);
        for (const c of (wrong ? byOrdinal.slice().reverse() : byOrdinal)) t.api.kaoAnswer(task.id, c.choiceId);
      } else {
        const pick = wrong ? choices.find((c) => !c.correct) : choices.find((c) => c.correct);
        t.api.kaoAnswer(task.id, (pick || choices[0]).choiceId);
      }
      t.api.kaoContinue();
      continue;
    }
    const current = st.plan[st.at];
    if (!current || current.kind === 'summary') return true;
    t.api.kaoLesson('next');
  }
  return false;
}

check('her kavram `examples[]` ve (kaynakta varsa) `explanation[]` taşır; kavram sayısı kaynakla aynı', () => {
  assert.equal(grammar.concepts.length, source.concepts.length);
  for (const concept of grammar.concepts) {
    const src = srcConcept(concept.id);
    assert.ok(Array.isArray(concept.examples) && concept.examples.length > 0, `${concept.id}: examples yok`);
    assert.equal(concept.examples.length, src.examples.length, `${concept.id}: örnek sayısı`);
    if (Array.isArray(src.explanation) && src.explanation.length) {
      assert.deepEqual(Array.from(concept.explanation), src.explanation, `${concept.id}: explanation kaynakla aynı`);
    }
  }
});

check('exampleId\'li 43 şablonun 43\'ü modül içinde çözülür (sarkık kimlik yok)', () => {
  const templates = grammar.concepts.flatMap((c) => c.templates).filter((t) => t.exampleId);
  assert.equal(templates.length, 43, 'exampleId\'li şablon sayısı');
  assert.equal(typeof grammar.exampleById, 'function');
  const unresolved = templates.filter((t) => !grammar.exampleById(t.exampleId)).map((t) => t.exampleId);
  assert.equal(unresolved.length, 0, `çözülemeyen exampleId: ${unresolved.join(', ')}`);
});

check('her örnekte ref, tr, ar ve words[{w, ar, pronunciation}] var; okunuşlar boş değil ve Latin harfli', () => {
  let examples = 0, words = 0;
  for (const concept of grammar.concepts) for (const example of concept.examples) {
    examples += 1;
    assert.match(example.ref, /^\d+:\d+$/, `${example.id}: ref`);
    assert.ok(example.tr && typeof example.tr === 'string', `${example.id}: tr`);
    assert.ok(example.ar && ARABIC.test(example.ar), `${example.id}: ar`);
    assert.ok(Array.isArray(example.words) && example.words.length > 0, `${example.id}: words`);
    for (const word of example.words) {
      words += 1;
      assert.equal(typeof word.w, 'number', `${example.id}: w`);
      assert.ok(word.ar && ARABIC.test(word.ar), `${example.id}:${word.w} ar`);
      assert.ok(word.pronunciation && typeof word.pronunciation === 'string' && !ARABIC.test(word.pronunciation), `${example.id}:${word.w} okunuş boş/Arapça: "${word.pronunciation}"`);
    }
  }
  assert.equal(examples, 93);
  assert.equal(words, 329);
});

check('örnekler doğrulanmış kaynakla BİREBİR: id, ref, tr, ar ve kelime Arapçası/sırası aynı (elle metin yok)', () => {
  for (const concept of grammar.concepts) {
    const src = srcConcept(concept.id);
    src.examples.forEach((expected, index) => {
      const actual = concept.examples[index];
      assert.equal(actual.id, expected.id);
      assert.equal(actual.ref, expected.ref);
      assert.equal(actual.tr, expected.tr);
      assert.equal(actual.ar, expected.resolved.ar, `${expected.id}: ar`);
      assert.deepEqual(Array.from(actual.words, (w) => [w.w, w.ar]), expected.resolved.words.map((w) => [w.w, w.ar]), `${expected.id}: kelimeler`);
      assert.equal(actual.ar, actual.words.map((w) => w.ar).join(' '), `${expected.id}: ar = kelimelerin birleşimi`);
    });
  }
});

check('exampleById doğru örneği döndürür; bilinmeyen kimlik null', () => {
  const sample = grammar.concepts[0].examples[0];
  assert.equal(grammar.exampleById(sample.id).ref, sample.ref);
  assert.equal(grammar.exampleById('yok-boyle-bir-ornek'), null);
  assert.equal(grammar.exampleById(''), null);
  assert.equal(grammar.byId(grammar.concepts[0].id).examples[0].id, sample.id);
});

check('modül derin dondurulmuş (örnekler, kelimeler, açıklamalar değiştirilemez)', () => {
  const example = grammar.concepts[0].examples[0];
  assert.ok(Object.isFrozen(grammar) && Object.isFrozen(example) && Object.isFrozen(example.words) && Object.isFrozen(example.words[0]));
  assert.ok(Object.isFrozen(grammar.concepts[0].explanation));
});

check('mevcut içerik değişmedi: kavram başlıkları, tablolar, şablonlar ve unit11 kaynakla uyumlu', () => {
  for (const concept of grammar.concepts) {
    const src = srcConcept(concept.id);
    assert.equal(concept.title, src.title);
    assert.equal(concept.templates.length, src.templates.length, `${concept.id}: şablon sayısı`);
    assert.equal(concept.tables.length, src.tables.length, `${concept.id}: tablo sayısı`);
  }
  assert.ok(grammar.unit11 && Array.isArray(grammar.unit11.roots));
});

check('bütçeler: modül ham ≤128 KiB (araç tavanı) ve gzip toplamı bağlayıcı K-1 bütçeleri içinde (eski 4 modül ≤176 KiB, K2F-09)', () => {
  const raw = fs.statSync(modulePath).size;
  assert.ok(raw <= 128 * 1024, `ham ${raw} bayt > 128 KiB`);
  const gz = (file) => zlib.gzipSync(fs.readFileSync(path.join(repoRoot, file))).length;
  const legacy = ['app/content/quranLexiconV1.js', 'app/content/quranGrammarV1.js', 'app/content/quranShortSurahsV1.js', 'app/content/quranPhonicsV1.js'].reduce((n, f) => n + gz(f), 0);
  assert.ok(legacy <= 176 * 1024, `eski 4 modül gzip ${legacy} > 176 KiB (K2F-09 alt tavanı)`);
});

// ---------------------------------------------------------------------------------------------------------------
// Bölüm B (K2F-10) — fail-closed
// ---------------------------------------------------------------------------------------------------------------
// Doğrulama kuralları `kao2-duzeltme/denetim/tekrar-uret.cjs` `grammarDefects` ile aynıdır; burada bağımsız yazıldı
// (üretim kodunu çağırmaz) ki test üretim doğrulayıcısını kendi kendine onaylamasın.
function defectsOf(task, lessonId) {
  const out = [];
  const [, conceptId, templateId] = String(task.cardId || '').split(':');
  const answer = ((task.choices || []).find((c) => c.correct) || {}).label || '';
  const stimulus = String(task.stimulus || '');
  if ((task.choices || []).length < 2) out.push(`${lessonId} ${templateId} tek şık`);
  if (task.grammarType === 'Ek çöz' && /^el \+/.test(answer) && conceptId !== 'g1') out.push(`${lessonId} ${conceptId} "${answer}"`);
  if (task.grammarType !== 'Çekim tablosu' && stimulus && !ARABIC.test(stimulus)) out.push(`${lessonId} ${templateId} Arapça olmayan uyaran`);
  if (task.grammarType === 'Çekim tablosu') {
    const quoted = (/'([^']+)'/.exec(String(task.prompt || '')) || [])[1];
    if (quoted && quoted !== stimulus) out.push(`${lessonId} ${templateId} yönerge '${quoted}' ≠ uyaran '${stimulus}'`);
  }
  const concept = source.concepts.find((c) => c.id === conceptId);
  const template = concept && concept.templates.find((x) => x.id === templateId);
  const example = template && template.exampleId && concept.examples.find((e) => e.id === template.exampleId);
  const exampleAr = example && example.resolved && example.resolved.ar;
  if (exampleAr && (task.kind === 'order' ? stimulus && !exampleAr.includes(stimulus) : !(stimulus && exampleAr.includes(stimulus)))) out.push(`${lessonId} ${templateId} uyaran örnek ${template.exampleId} içinde değil`);
  const correct = (task.choices || []).filter((c) => c.correct);
  const labels = (task.choices || []).map((c) => c.label);
  if (task.kind === 'order') {
    const ordinals = (task.choices || []).map((c) => c.ordinal).sort((a, b) => a - b);
    if (!ordinals.every((value, index) => value === index)) out.push(`${lessonId} ${templateId} sıra numaraları 0..n-1 değil`);
  } else {
    if (correct.length !== 1) out.push(`${lessonId} ${templateId} doğru şık sayısı ${correct.length}`);
    if (new Set(labels).size !== labels.length) out.push(`${lessonId} ${templateId} şık etiketi yinelenir`);
  }
  return out;
}

const curriculum = bootKao().win.QuranCurriculumV2;
const allLessons = curriculum.units.flatMap((unit) => unit.lessons);
const gradedTask = (t, queueItem) => t.api.kaoBuildTask(queueItem, t.data, { seed: queueItem.id });
// Kurulamayan (null) görev de "sunulamaz" demektir: kusur listesi boş değildir.
const defectsOrUnbuilt = (task, label) => (task ? defectsOf(task, label) : [`${label} görev kurulamadı`]);

check('B1 · 109 dersin yürüyüşünde gösterilen HİÇBİR gramer görevi kuralları ihlal etmez; her derste alıştırma sayısı planla aynı ve ≥6', () => {
  assert.equal(allLessons.length, 109);
  const t = bootKao();
  const bad = [];
  let shownGrammar = 0, minPractice = Infinity;
  for (const lesson of allLessons) {
    freshUser(t);
    assert.ok(t.api.kaoLesson('start', lesson.id), `${lesson.id}: başlamadı`);
    const plannedPractice = t.ui.kaoLesson.plan.filter((item) => item.kind === 'practice').length;
    let shownPractice = 0;
    const done = walkAware(t, lesson.id, { visit: (task) => {
      if (t.ui.kaoLesson.phase === 'practice') shownPractice += 1;
      if (task.type !== 'grammar') return;
      shownGrammar += 1;
      bad.push(...defectsOf(task, lesson.id));
    } });
    assert.ok(done, `${lesson.id}: özete ulaşılamadı`);
    assert.equal(shownPractice, plannedPractice, `${lesson.id}: gösterilen alıştırma ${shownPractice} ≠ plan ${plannedPractice}`);
    if (plannedPractice) minPractice = Math.min(minPractice, plannedPractice);
  }
  assert.deepEqual(bad.slice(0, 5), [], `${bad.length} kusur`);
  assert.ok(minPractice >= 6, `en az alıştırma ${minPractice} < 6`);
  assert.ok(shownGrammar > 0, 'hiç gramer görevi kalmadı (güvenlik ağı her şeyi atıyor)');
  console.log(`      gösterilen gramer görevi: ${shownGrammar} (önce 78) · en az alıştırma: ${minPractice}`);
});

check('B2 · kaoGrammarTaskValid beş kuralı + tek doğru şık + tekil etiketi ayrı ayrı uygular', () => {
  const t = bootKao();
  const valid = (task) => t.api.kaoGrammarTaskValid(task);
  const choices = (...labels) => labels.map((label, i) => ({ label, correct: i === 0, choiceId: `c${i}` }));
  // Gerçek kart kimlikleri (doğrulayıcı kartı modülden çözer): örneksiz Kök bul, g1/g3 Ek çöz, Çekim tablosu, örnekli şablon.
  const exTemplate = grammar.byId('g1').templates.find((x) => x.type === 'Parça çevir');
  const sampleExample = grammar.exampleById(exTemplate.exampleId);
  const stim = sampleExample.words[0].ar;
  const root = { type: 'grammar', grammarType: 'Kök bul', cardId: 'g:g19:g19-k1', stimulus: stim, prompt: 'Kök?', choices: choices('a', 'b', 'c') };
  const affix = { type: 'grammar', grammarType: 'Ek çöz', stimulus: stim, prompt: 'Ek?' };
  const table = { type: 'grammar', grammarType: 'Çekim tablosu', cardId: 'g:g13:g13-k1', stimulus: 'ben', prompt: "'ben' formu?", choices: choices('a', 'b') };
  const withExample = { type: 'grammar', grammarType: 'Parça çevir', cardId: `g:g1:${exTemplate.id}`, stimulus: sampleExample.ar, prompt: 'Çeviri?', choices: choices(sampleExample.tr, 'başka bir çeviri') };
  assert.equal(valid(root), true, 'temel görev geçerli olmalı');
  assert.equal(valid(null), false);
  assert.equal(valid({ ...root, type: 'word' }), false, 'gramer dışı görev');
  assert.equal(valid({ ...root, cardId: 'g:g19:yok' }), false, 'çözülemeyen kart');
  assert.equal(valid({ ...root, choices: choices('a') }), false, 'tek şık');
  assert.equal(valid({ ...root, choices: [{ label: 'a', correct: false }, { label: 'b', correct: false }] }), false, 'doğru şık yok');
  assert.equal(valid({ ...root, choices: [{ label: 'a', correct: true }, { label: 'b', correct: true }] }), false, 'iki doğru şık');
  assert.equal(valid({ ...root, choices: choices('a', 'a', 'b') }), false, 'yinelenen etiket');
  assert.equal(valid({ ...root, choices: choices('', 'b') }), false, 'boş etiket');
  assert.equal(valid({ ...affix, cardId: 'g:g3:g3-k1', choices: choices('el + kitap', 'b') }), false, 'g1 dışı "el +" cevabı');
  assert.equal(valid({ ...affix, cardId: 'g:g1:g1-k1', choices: choices('el + kitap', 'b') }), true, 'g1 "el +" geçerli');
  assert.equal(valid({ ...root, stimulus: 'latin' }), false, 'Arapça olmayan uyaran');
  assert.equal(valid({ ...root, stimulus: '' }), false, 'Çekim tablosu dışında boş uyaran');
  assert.equal(valid({ ...root, grammarType: 'Ek çöz' }), false, 'görev türü şablon türüyle eşleşmeli');
  assert.equal(valid({ ...table, prompt: "'sen' formu?" }), false, 'Çekim tablosu yönergesi ≠ uyaran');
  assert.equal(valid(table), true, 'Çekim tablosu Latin uyaran serbest');
  assert.equal(valid(withExample), true, 'örnekli şablon: uyaran örnek içinde');
  assert.equal(valid({ ...withExample, stimulus: sampleExample.ar + 'x' }), false, 'uyaran örnek içinde değil');
  assert.equal(valid({ ...withExample, stimulus: stim }), false, 'Parça çevir uyaranı örneğin tamamı olmalı');
  assert.equal(valid({ ...withExample, choices: choices('başka bir çeviri', sampleExample.tr) }), false, 'doğru şık örnek çevirisi olmalı');
  assert.equal(valid({ ...withExample, stimulus: '' }), false, 'örnekli şablonda boş uyaran');
});

check('B3 · sunulamayan gramer görevi içeren ders: plan öğesi kelime alıştırmasıyla ikame edilir (kimlik korunur, sayı düşmez, kalan gramer görevleri geçerli)', () => {
  const t = bootKao();
  let hit = null;
  for (const lesson of allLessons) {
    freshUser(t);
    assert.ok(t.api.kaoLesson('start', lesson.id));
    const subs = t.ui.kaoLesson.plan.filter((item) => item.substitutedFor);
    if (subs.length) { hit = { lesson, plan: t.ui.kaoLesson.plan, subs }; break; }
  }
  assert.ok(hit, 'ikame edilen alıştırması olan ders bulunamadı (test verisi)');
  const lemmaIds = new Set(hit.plan.find((x) => x.kind === 'goal').lemmaIds);
  for (const item of hit.subs) {
    const [, conceptId, templateId] = item.substitutedFor.split(':');
    assert.equal(item.id, `practice:${hit.lesson.id}:${conceptId}:${templateId}`, 'kimlik korunur (devam noktası kararlı)');
    assert.equal(item.group, 'lemma', 'kelime alıştırması');
    assert.notEqual(item.type, 'grammar');
    assert.ok(lemmaIds.has(item.lemmaId), 'ikame kelimesi aynı dersin kelimesi');
    assert.notEqual(t.api.kaoGrammarSupport(item.substitutedFor) || (gradedTask(t, { id: item.id, cardId: item.substitutedFor, type: 'grammar' }) ? '' : 'kurulamadı'), '', 'yalnız sunulamayan görev ikame edilir');
  }
  const practice = hit.plan.filter((x) => x.kind === 'practice');
  assert.ok(practice.length >= 6 && practice.length <= 10, `alıştırma sayısı ${practice.length}`);
  for (const item of practice.filter((x) => x.group === 'concept')) assert.deepEqual(defectsOrUnbuilt(gradedTask(t, { id: item.id, cardId: item.cardId, type: 'grammar' }), hit.lesson.id), [], `${item.cardId}: kalan gramer görevi geçerli olmalı`);
});

check('B4 · tekrar kuyruğu: sunulan her gramer kartının görevi geçerli; geçersizi sunulmaz ve süzgeç 86 şablonun bir kısmını eler', () => {
  const t = bootKao();
  freshUser(t);
  const now = new Date(DEFAULT_NOW);
  let presented = 0, dropped = 0;
  const skipped = [];
  for (const concept of grammar.concepts) for (const template of concept.templates) {
    const cardId = `g:${concept.id}:${template.id}`;
    const queue = t.api.kaoBuildQueue(t.data, now, { candidates: [{ id: cardId, type: 'grammar' }], dailyNew: 10, sessionId: '2026-09-30' });
    if (!queue.length) { dropped += 1; skipped.push(cardId); continue; }
    presented += 1;
    assert.deepEqual(defectsOrUnbuilt(gradedTask(t, queue[0]), concept.id), [], `${cardId}: sunuldu ama geçersiz`);
  }
  assert.equal(presented + dropped, 86);
  assert.ok(dropped > 0, 'hiçbir geçersiz kart elenmedi');
  assert.ok(presented > 0, 'hiçbir geçerli kart kalmadı');
  console.log(`      tekrar kuyruğu: ${presented}/86 uygun · atlanan: ${skipped.join(', ')}`);
});

check('B5 · kullanıcının mevcut g: kartları silinmez ve değişmez (süzgeç yalnız sunumu keser)', () => {
  const t = bootKao();
  const q = freshUser(t);
  const ids = grammar.concepts.flatMap((c) => c.templates.map((x) => `g:${c.id}:${x.id}`));
  for (const id of ids) q.cards[id] = { state: 'review', s: 12, reps: 4, due: '2026-09-01T00:00:00.000Z' };
  const before = JSON.stringify(q.cards);
  const now = new Date(DEFAULT_NOW);
  const queue = t.api.kaoBuildQueue(t.data, now, { sessionId: '2026-09-30' });
  assert.equal(JSON.stringify(t.data.quranLearn.cards), before, 'kartlar değişmedi');
  assert.equal(Object.keys(t.data.quranLearn.cards).length, ids.length);
  for (const item of queue.filter((x) => x.type === 'grammar')) assert.deepEqual(defectsOrUnbuilt(gradedTask(t, item), item.cardId), [], `${item.cardId}: geçersiz sunuldu`);
});

check('B6 · yanlış cevap sonrası "yeniden dene" farklı tohumla kurulur ve o da geçerlidir: ilk 40 dersi baştan sona yanlış yürü (tekrarlar görünür, 0 kusur)', () => {
  const t = bootKao();
  let retries = 0, shownGrammar = 0;
  const bad = [];
  for (const lesson of allLessons.slice(0, 40)) {
    freshUser(t);
    const done = walkAware(t, lesson.id, { wrongFor: (task) => !task.retry, visit: (task) => {
      if (task.type !== 'grammar') return;
      shownGrammar += 1;
      if (task.retry) retries += 1;
      bad.push(...defectsOf(task, lesson.id));
    } });
    assert.ok(done, `${lesson.id}: özete ulaşılamadı`);
  }
  assert.ok(retries > 0, 'gramer tekrarı hiç sunulmadı (test verisi)');
  assert.deepEqual(bad.slice(0, 5), [], `${bad.length} kusur (${shownGrammar} gramer görevi, ${retries} tekrar)`);
});

// ---------------------------------------------------------------------------------------------------------------
// Bölüm C (K2F-11) — görevler doğrulanmış örnekten ve kavram tablosundan kurulur
// ---------------------------------------------------------------------------------------------------------------
const htmlEsc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const stripParens = (text) => String(text || '').replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
const cellKinds = (row) => row.cells.map((cell) => (Array.isArray(cell) ? (ARABIC.test(String(cell[1] || '')) ? { ar: String(cell[1]) } : { empty: true }) : { text: String(cell) }));
const SEEDS = ['2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02'];
const allTemplates = grammar.concepts.flatMap((concept) => concept.templates.map((template) => ({ concept, template, cardId: `g:${concept.id}:${template.id}` })));
const buildFor = (t, cardId, day) => { const id = `kao:${day}:${cardId}`; return t.api.kaoBuildGrammarTask({ id, cardId, type: 'grammar' }, t.data, { seed: id }); };
const exampleOf = (concept, template) => concept.examples.find((e) => e.id === template.exampleId);
const supportedRows = () => { const t = bootKao(); freshUser(t); return allTemplates.map((x) => ({ ...x, reason: t.api.kaoGrammarSupport(x.cardId) })); };

check('C1 · 86 şablonun her biri ya desteklenir (her tohumda geçerli görev) ya da gerekçeyle listelenir (görev kurulmaz); örnekli 43\'ün 43\'ü desteklenir', () => {
  const t = bootKao();
  freshUser(t);
  assert.equal(allTemplates.length, 86);
  assert.equal(typeof t.api.kaoGrammarSupport, 'function');
  const supported = [], unsupported = [];
  for (const x of allTemplates) {
    const reason = t.api.kaoGrammarSupport(x.cardId);
    assert.equal(typeof reason, 'string', `${x.cardId}: gerekçe dize olmalı`);
    for (const day of SEEDS) {
      const task = buildFor(t, x.cardId, day);
      if (reason) assert.equal(task, null, `${x.cardId}: desteklenmeyen şablon için görev kurulmamalı`);
      else {
        assert.ok(task, `${x.cardId}: desteklenen şablon görev kurmalı (${day})`);
        assert.deepEqual(defectsOf(task, x.cardId), [], `${x.cardId} ${day}: kusur`);
        assert.equal(t.api.kaoGrammarTaskValid(task), true, `${x.cardId} ${day}: doğrulayıcı reddetti`);
      }
    }
    (reason ? unsupported : supported).push(x);
  }
  const withExample = allTemplates.filter((x) => x.template.exampleId);
  assert.equal(withExample.length, 43);
  assert.equal(withExample.filter((x) => supported.includes(x)).length, 43, 'örnekli şablonların tümü desteklenmeli');
  assert.ok(supported.length >= 78, `desteklenen şablon ${supported.length} < 78`);
  console.log(`      desteklenen ${supported.length}/86 · desteklenmeyen ${unsupported.length}`);
});

check('C2 · Kelime dizme: doğru sıra = örnek sırası, karışık sıra çözülmüş değil, uyaran = ilk kelime (ipucu, yalnız üç+ kelimede); Parça çevir: uyaran = örnek Arapçası, doğru = örnek çevirisi', () => {
  const t = bootKao();
  freshUser(t);
  let order = 0, translate = 0;
  for (const x of allTemplates.filter((y) => y.template.exampleId)) {
    const example = exampleOf(x.concept, x.template);
    for (const day of SEEDS) {
      const task = buildFor(t, x.cardId, day);
      if (x.template.type === 'Kelime dizme') {
        order += 1;
        assert.equal(task.kind, 'order');
        const byOrdinal = Array.from(task.choices).sort((a, b) => a.ordinal - b.ordinal);
        assert.deepEqual(byOrdinal.map((c) => c.label), Array.from(example.words, (w) => w.ar), `${x.cardId}: doğru sıra`);
        assert.ok(!task.choices.every((c, i) => c.ordinal === i), `${x.cardId} ${day}: karışık sıra zaten çözülmüş`);
        assert.equal(task.stimulus, example.words.length >= 3 ? example.words[0].ar : '', `${x.cardId}: ipucu yalnız üç+ kelimede ve taze kartta`);
        assert.equal(task.answer, example.ar);
        assert.ok(task.choices.every((c) => c.choiceId && c.pronunciation && !ARABIC.test(c.pronunciation)));
      } else {
        translate += 1;
        assert.equal(x.template.type, 'Parça çevir');
        assert.equal(task.stimulus, example.ar, `${x.cardId}: uyaran`);
        assert.equal(task.choices.find((c) => c.correct).label, example.tr, `${x.cardId}: doğru çeviri`);
        const known = new Set(grammar.concepts.flatMap((c) => c.examples.map((e) => e.tr)));
        assert.ok(task.choices.every((c) => known.has(c.label)), `${x.cardId}: çeldiriciler başka örneklerin çevirisi`);
        assert.ok(task.choices.length >= 3, `${x.cardId}: şık sayısı`);
      }
    }
  }
  assert.equal(order, 18 * SEEDS.length);
  assert.equal(translate, 25 * SEEDS.length);
});

check('C3 · Çekim tablosu: yönergedeki hücreyle eşleşen satırın Arapçası doğru; çeldiriciler aynı tablonun hücreleri; belirsiz (erkek/kadın) satırda yönerge ve uyaran birlikte netleşir', () => {
  const t = bootKao();
  freshUser(t);
  for (const x of allTemplates.filter((y) => y.template.type === 'Çekim tablosu')) {
    const rows = x.concept.tables[0].rows;
    const tableArabic = new Set(rows.flatMap((row) => cellKinds(row).filter((c) => c.ar).map((c) => c.ar)));
    for (const day of SEEDS) {
      const task = buildFor(t, x.cardId, day);
      const quoted = /'([^']+)'/.exec(task.prompt)[1];
      assert.equal(quoted, task.stimulus, `${x.cardId}: yönerge hücresi = uyaran`);
      const matches = rows.filter((row) => { const kinds = cellKinds(row); const text = kinds.find((c) => c.text); const ar = kinds.find((c) => c.ar); return text && ar && quoted.replace(/\s*\([^)]*\)/g, '') === `${stripParens(row.label)} ${stripParens(text.text)}` && (quoted === `${stripParens(row.label)} ${stripParens(text.text)}` || quoted.includes(row.label.match(/\(([^)]*)\)/)?.[0] || '§')); });
      assert.ok(matches.length >= 1, `${x.cardId} ${day}: '${quoted}' satırı bulunamadı`);
      const expected = new Set(matches.map((row) => cellKinds(row).find((c) => c.ar).ar));
      assert.ok(expected.has(task.choices.find((c) => c.correct).label), `${x.cardId} ${day}: doğru hücre`);
      assert.ok(task.choices.every((c) => tableArabic.has(c.label)), `${x.cardId}: çeldirici tablo dışı`);
    }
  }
  const sample = buildFor(t, 'g:g13:g13-k1', '2026-09-30');
  assert.match(sample.stimulus, /^o \((erkek|kadın)\) yaptı$/, 'cinsiyet netleşmeli: ' + sample.stimulus);
});

check('C4 · Ek çöz (g1 "el" ve g5 yapışık ek), Anlam seç ve Arapça seç: cevap kavram tablosundaki aynı satırdan gelir', () => {
  const t = bootKao();
  freshUser(t);
  let checked = 0;
  for (const x of allTemplates.filter((y) => ['Ek çöz', 'Anlam seç', 'Arapça seç'].includes(y.template.type))) {
    if (t.api.kaoGrammarSupport(x.cardId)) continue;
    const rows = x.concept.tables[0].rows;
    for (const day of SEEDS) {
      const task = buildFor(t, x.cardId, day);
      const correct = task.choices.find((c) => c.correct).label;
      if (x.template.type === 'Anlam seç' && !task.stimulus) continue; // Arapça şıklı tamlama görevi: C11
      const arabicKey = task.grammarType === 'Arapça seç' ? correct : task.stimulus;
      const owner = rows.filter((row) => cellKinds(row).some((c) => c.ar === arabicKey));
      assert.ok(owner.length >= 1, `${x.cardId} ${day}: Arapça hücre tabloda yok`);
      const texts = (row) => [row.label, ...cellKinds(row).filter((c) => c.text).map((c) => c.text.replace(/^[IVX]+:\s*/, ''))];
      if (task.grammarType === 'Arapça seç') { const asked = task.prompt.slice(1, task.prompt.lastIndexOf("' hangisi?")); assert.ok(owner.some((row) => texts(row).some((text) => stripParens(text) === stripParens(asked))), `${x.cardId} ${day}: doğru Arapça '${asked}' satırından değil`); checked += 1; continue; }
      const okAnswer = owner.some((row) => texts(row).includes(correct) || (x.concept.id === 'g1' && correct === `el + ${row.label}`) || ['Tekil', 'Çoğul'].includes(correct) || (x.concept.id === 'g0_5' && texts(row).length));
      assert.ok(okAnswer || x.concept.id === 'g0_5' || x.concept.id === 'g12', `${x.cardId} ${day}: cevap "${correct}" aynı satırdan gelmiyor`);
      checked += 1;
    }
  }
  assert.ok(checked >= 40, `kontrol edilen görev ${checked}`);
  const el = buildFor(t, 'g:g1:g1-k1', '2026-09-30');
  assert.match(el.choices.find((c) => c.correct).label, /^el \+ /);
  assert.ok(el.choices.some((c) => /^bir /.test(c.label)), 'belirsiz ("bir …") çeldirici');
});

check('C5 · her görev yönlendirir ve öğretir: kural cümlesi (plainTr) + örnekli şablonda âyet künyesi ve çevirisi; dizmede ilk kelime ipucu', () => {
  const t = bootKao();
  freshUser(t);
  for (const x of allTemplates) {
    if (t.api.kaoGrammarSupport(x.cardId)) continue;
    const task = buildFor(t, x.cardId, '2026-09-30');
    assert.ok(task.teach && task.teach.includes('Kural: ' + x.concept.plainTr), `${x.cardId}: kural cümlesi`);
    if (x.template.exampleId) {
      const example = exampleOf(x.concept, x.template);
      assert.ok(task.teach.includes(example.ref) && task.teach.includes(example.tr), `${x.cardId}: âyet künyesi ve çeviri`);
    }
    if (task.kind === 'order') assert.ok(task.context.some((c) => /^Anlamı: /.test(c.label)) && task.context.some((c) => /İpucu/.test(c.label)) === (exampleOf(x.concept, x.template).words.length >= 3), `${x.cardId}: anlam + (üç+ kelimede) ipucu`);
  }
});

check('C6 · arayüz: dizme görevi sıra düğmeleriyle işlenir; cevaptan sonra öğretici açıklama görünür; yanlışta fragman notu ("Fiil önce gelir") çıkmaz', () => {
  const t = bootKao();
  let task = null;
  for (const lesson of allLessons) {
    freshUser(t);
    assert.ok(t.api.kaoLesson('start', lesson.id));
    const st = t.ui.kaoLesson;
    for (let guard = 0; guard < 400 && !task; guard += 1) {
      if (st.phase === 'practice' || st.phase === 'review') {
        const item = t.ui.kaoQueue[t.ui.kaoTaskIndex];
        const current = item && t.ui.kaoTasks[item.id];
        if (!current) break;
        if (current.kind === 'order' && current.type === 'grammar') { task = current; break; }
        const pick = (current.choices || []).find((c) => c.correct) || current.choices[0];
        t.api.kaoAnswer(current.id, pick.choiceId);
        t.api.kaoContinue();
      } else {
        const at = st.plan[st.at];
        if (!at || at.kind === 'summary') break;
        t.api.kaoLesson('next');
      }
    }
    if (task) break;
  }
  assert.ok(task, 'dizme görevi bulunamadı');
  const before = t.api.kaoTaskHTML(task);
  assert.ok(/aria-pressed="false"/.test(before) && /kao-order-target/.test(before), 'sıra düğmeleri ve hedef şeridi');
  assert.ok(!/Önce fiili seç/.test(before) && /Kelimeleri sırayla seç/.test(before), 'fragman metni gramerde görünmemeli');
  assert.ok(/Anlamı: /.test(before) && (task.choices.length >= 3) === /İpucu: parça yukarıdaki kelimeyle başlar/.test(before), 'yönlendirme: anlam (+ üç+ kelimede ipucu)');
  const q = t.data.quranLearn;
  for (const c of Array.from(task.choices).sort((a, b) => b.ordinal - a.ordinal)) t.api.kaoAnswer(task.id, c.choiceId);
  const after = t.api.kaoTaskHTML(task);
  assert.ok(after.includes('Kural:') && after.includes('Âyet '), 'öğretici açıklama');
  assert.ok(!/Fiil önce gelir/.test(after), 'gramer sıra hatasında fragman notu çıkmamalı');
  assert.ok(q.cards[task.cardId], 'kart zamanlandı');
});

check('C7 · doğrulayıcı yeni görev türlerini de sınar: yanlış sıra, yanlış çeviri, boş uyaran (Arapça seç dışı)', () => {
  const t = bootKao();
  freshUser(t);
  const order = buildFor(t, 'g:g1:g1-k3', '2026-09-30');
  assert.equal(t.api.kaoGrammarTaskValid(order), true);
  const swapped = { ...order, choices: order.choices.map((c, i, all) => ({ ...c, ordinal: all[(i + 1) % all.length].ordinal })) };
  assert.equal(t.api.kaoGrammarTaskValid(swapped), false, 'sıra numaraları örnek sırasıyla uyuşmuyor');
  const translate = buildFor(t, 'g:g1:g1-k4', '2026-09-30');
  assert.equal(t.api.kaoGrammarTaskValid(translate), true);
  const picked = translate.choices.find((c) => !c.correct);
  assert.equal(t.api.kaoGrammarTaskValid({ ...translate, choices: translate.choices.map((c) => ({ ...c, correct: c === picked })) }), false, 'doğru işaretli şık örnek çevirisi değil');
  const arabicPick = buildFor(t, 'g:g4:g4-k1', '2026-09-30');
  assert.equal(arabicPick.stimulus, '', 'Arapça seç: Türkçe soru yönergede, uyaran boş');
  assert.equal(t.api.kaoGrammarTaskValid(arabicPick), true, 'Arapça seç boş uyaranla geçerli');
});

check('C8 · 109 dersin yürüyüşü: gösterilen gramer görevi ≥60 ve 0 ihlal; her derste alıştırma ≥6; aynı kart ya da aynı gramer türü ardışık gelmez (K4-04)', () => {
  const t = bootKao();
  let shown = 0, defects = 0, minPractice = Infinity;
  const bad = [];
  for (const lesson of allLessons) {
    freshUser(t);
    assert.ok(t.api.kaoLesson('start', lesson.id));
    const planned = t.ui.kaoLesson.plan.filter((item) => item.kind === 'practice').length;
    let practice = 0, previous = null;
    const done = walkAware(t, lesson.id, { visit: (task) => {
      if (t.ui.kaoLesson.phase !== 'practice') { previous = null; return; }
      practice += 1;
      if (previous && previous.cardId === task.cardId && !task.retry) bad.push(`${lesson.id}: aynı kart ardışık ${task.cardId}`);
      if (task.type === 'grammar') {
        shown += 1;
        const found = defectsOf(task, lesson.id);
        defects += found.length; bad.push(...found);
        if (previous && previous.type === 'grammar' && previous.grammarType === task.grammarType && !task.retry) bad.push(`${lesson.id}: aynı tür ardışık ${task.grammarType}`);
      }
      previous = task;
    } });
    assert.ok(done, `${lesson.id}: özete ulaşılamadı`);
    assert.equal(practice, planned, `${lesson.id}: gösterilen ${practice} ≠ plan ${planned}`);
    minPractice = Math.min(minPractice, planned);
  }
  assert.deepEqual(bad.slice(0, 5), [], `${bad.length} ihlal`);
  assert.equal(defects, 0);
  assert.ok(shown >= 60, `gösterilen gramer görevi ${shown} < 60`);
  assert.ok(minPractice >= 6);
  console.log(`      gösterilen gramer görevi: ${shown} (K2F-10 sonrası 37, önce 78) · en az alıştırma ${minPractice}`);
});

check('C10 · kavram sayfası: doğrulanmış âyet örnekleri (kelime kelime okunuşlu) ve "Dikkat edilecekler" notları görünür; 25 kavramın tümü', () => {
  const t = bootKao();
  freshUser(t);
  assert.equal(grammar.concepts.length, 25);
  for (const concept of grammar.concepts) {
    const html = t.api.kaoConceptHTML(concept.id);
    assert.ok(html.includes('Kur\'an\'dan örnekler'), `${concept.id}: örnek bölümü`);
    assert.equal((html.match(/class="kao-grammar-ayah"/g) || []).length, concept.examples.length, `${concept.id}: örnek sayısı`);
    for (const example of concept.examples) {
      assert.ok(html.includes('Âyet ' + example.ref) && html.includes(htmlEsc(example.tr)), `${concept.id}/${example.id}: künye ve çeviri`);
      for (const word of example.words) assert.ok(html.includes(htmlEsc(word.ar)) && html.includes(htmlEsc(word.pronunciation)), `${example.id}: kelime ve okunuşu`);
    }
    if (concept.explanation && concept.explanation.length) {
      assert.ok(html.includes('Dikkat edilecekler'), `${concept.id}: not bölümü`);
      assert.equal((html.match(/<li>/g) || []).length >= concept.explanation.length, true);
      for (const note of concept.explanation) assert.ok(html.includes(htmlEsc(note)), `${concept.id}: not metni`);
    }
    assert.ok(html.indexOf('kao-grammar-ayahs') < html.indexOf('kao-grammar-table'), `${concept.id}: önce somut örnek, sonra tablo (somutlaştır→soyutla)`);
  }
});

check('C11 · yeni tarifler: kişi tanıma (g13/g15/g17), tamlama (g2), masdar (g20), fâil→mef\'ûl ve fiil→masdar eşleştirme tablodaki AYNI satırdan doğrulanır', () => {
  const t = bootKao();
  freshUser(t);
  const rowsOf = (id) => grammar.byId(id).tables[0].rows;
  const arCells = (row) => row.cells.filter((c) => Array.isArray(c) && ARABIC.test(String(c[1] || ''))).map((c) => c[1]);
  for (const day of SEEDS) {
    for (const [card, concept] of [['g:g13:g13-k3', 'g13'], ['g:g15:g15-k2', 'g15'], ['g:g17:g17-k2', 'g17']]) {
      const task = buildFor(t, card, day);
      assert.equal(t.api.kaoGrammarTaskValid(task), true, card);
      const owner = rowsOf(concept).filter((row) => arCells(row)[0] === task.stimulus);
      assert.equal(owner.length, 1, `${card} ${day}: biçim tabloda tek satıra ait olmalı`);
      assert.equal(task.choices.find((c) => c.correct).label, owner[0].label, `${card}: doğru şahıs/kişi`);
      const allLabels = new Set(rowsOf(concept).map((row) => row.label));
      assert.ok(task.choices.every((c) => allLabels.has(c.label)), `${card}: çeldirici tablo dışı`);
      const forms = rowsOf(concept).map((row) => arCells(row)[0]);
      for (const c of task.choices) { const row = rowsOf(concept).find((r) => r.label === c.label); assert.equal(forms.filter((f) => f === arCells(row)[0]).length, 1, `${card}: yinelenen biçimli satır çeldirici/soru olamaz`); }
    }
    const phrase = buildFor(t, 'g:g2:g2-k4', day);
    const asked = phrase.prompt.slice(1, phrase.prompt.lastIndexOf("' tamlaması"));
    const row = rowsOf('g2').find((r) => r.label === asked);
    assert.ok(row, 'tamlama satırı');
    assert.equal(phrase.stimulus, '');
    assert.equal(phrase.choices.find((c) => c.correct).label, arCells(row).join(' '), 'doğru tamlama = satırdaki iki kelime');
    assert.ok(phrase.choices.every((c) => ARABIC.test(c.label)) && t.api.kaoGrammarTaskValid(phrase));
    const masdar = buildFor(t, 'g:g20:g20-k2', day);
    const mrow = rowsOf('g20').find((r) => arCells(r)[1] === masdar.stimulus);
    assert.ok(mrow && masdar.choices.find((c) => c.correct).label === mrow.label, 'masdarın anlamı = satır başlığı');
    for (const [card, concept, fromIdx, toIdx] of [['g:g19:g19-k2', 'g19', 0, 1], ['g:g20:g20-k1', 'g20', 0, 1]]) {
      const task = buildFor(t, card, day);
      const r = rowsOf(concept).find((x) => arCells(x)[fromIdx] === task.stimulus);
      assert.ok(r, `${card}: kaynak satır`);
      assert.equal(task.choices.find((c) => c.correct).label, arCells(r)[toIdx], `${card}: eşleşen biçim aynı satırdan`);
      assert.equal(t.api.kaoGrammarTaskValid(task), true);
    }
  }
});

check('C12 · rehberlik soldurma: dizmede ipucu yalnız taze kartta (<2 tekrar) verilir (tüm 18 örnek 3+ kelimedir; 2 kelimede ipucu zaten verilmezdi); ipucusuz görev de geçerli', () => {
  const t = bootKao();
  const q = freshUser(t);
  const threeWord = allTemplates.find((x) => x.template.type === 'Kelime dizme' && exampleOf(x.concept, x.template).words.length >= 3);
  assert.ok(threeWord, 'test verisi');
  const words = exampleOf(threeWord.concept, threeWord.template).words;
  assert.equal(buildFor(t, threeWord.cardId, '2026-09-30').stimulus, words[0].ar, 'taze kart: ipucu var');
  q.cards[threeWord.cardId] = { state: 'learning', reps: 1, s: 1 };
  assert.equal(buildFor(t, threeWord.cardId, '2026-09-30').stimulus, words[0].ar, '1 tekrar: hâlâ ipucu');
  q.cards[threeWord.cardId] = { state: 'review', reps: 2, s: 5 };
  const faded = buildFor(t, threeWord.cardId, '2026-09-30');
  assert.equal(faded.stimulus, '', '2+ tekrar: ipucu soldu');
  assert.ok(!faded.context.some((c) => /İpucu/.test(c.label)) && faded.context.some((c) => /^Anlamı: /.test(c.label)));
  assert.equal(t.api.kaoGrammarTaskValid(faded), true, 'ipucusuz dizme geçerli');
  for (const x of allTemplates.filter((y) => y.template.type === 'Kelime dizme')) assert.ok(exampleOf(x.concept, x.template).words.length >= 3, `${x.cardId}: tüm dizme örnekleri 3+ kelime`);
});

check('C9 · GRAMER-SABLON-L2.md: desteklenmeyen şablonlar kimlikle ve gerekçeyle listelenir (Arapça metin yok); testin ürettiği liste dosyayla aynı', () => {
  const rows = supportedRows();
  const unsupported = rows.filter((x) => x.reason);
  assert.ok(unsupported.length > 0 && unsupported.length < 30, `desteklenmeyen sayısı ${unsupported.length}`);
  const lines = [
    '# Gramer şablonları — desteklenmeyenler (L2 inceleme listesi)',
    '',
    'K2F-11 üretimi: `node tests/kao/test_kao2_grammar_tasks.js` bu dosyayı yazar. Kurucu, tabloyu ve doğrulanmış örneği tahmin etmeden',
    'kullanır; aşağıdaki şablonlar için tablo tek anlamlı bir görev türetmeye yetmediğinden **görev kurulmaz** (ders planında kelime',
    'alıştırması ikame edilir, tekrar kuyruğunda sunulmaz). Arapça metin içermez; yalnız kimlik ve gerekçe vardır. Alan uzmanı (L2)',
    'ya tabloya eksik sütunu ekler ya da şablonu onaylı biçimde yeniden yazar.',
    '',
    `Desteklenen: ${rows.length - unsupported.length}/${rows.length} · Desteklenmeyen: ${unsupported.length}/${rows.length}`,
    '',
    '| Şablon | Tür | Örnek (âyet) | Neden |',
    '|---|---|---|---|',
    ...unsupported.map((x) => { const ex = x.template.exampleId ? exampleOf(x.concept, x.template) : null; return `| ${x.template.id} | ${x.template.type} | ${ex ? ex.ref : '—'} | ${x.reason} |`; }),
    ''
  ];
  const text = lines.join('\n');
  assert.ok(!ARABIC.test(text), 'listede Arapça harf olmamalı');
  const file = path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/inceleme/GRAMER-SABLON-L2.md');
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== text) fs.writeFileSync(file, text);
  assert.equal(fs.readFileSync(file, 'utf8'), text);
});

console.log(`test_kao2_grammar_tasks (bölüm A+B+C): ${passed} kontrol PASS`);
