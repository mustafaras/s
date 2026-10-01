'use strict';

// K2F-09 · Gramer 1/3 (K4-02 kök neden) — bölüm A: dondurma hattı doğrulanmış âyet örneklerini ve açıklamaları
// çalışma zamanı modülüne taşır. Arapça ve okunuş YALNIZ doğrulanmış kaynaktan/araç projeksiyonundan gelir;
// bu test onları elle yazmaz, kaynakla karşılaştırır. Sentetik VM; ağ, tarayıcı, gerçek kullanıcı verisi yok.
// K2F-10 · Gramer 2/3 (K4-02 güvenlik ağı) — bölüm B: yanlış gramer görevi HİÇ gösterilmez (fail-closed). Ders oynatıcı
// geçersiz görevi aynı dersin bir kelime alıştırmasıyla ikame eder, tekrar kuyruğu sunmaz, kullanıcının `g:` kartları silinmez.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');
const repoRoot = require('../repo-root');
const { bootKao, freshUser, walkLesson, DEFAULT_NOW } = require('./helpers/kao-harness');

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
  if (exampleAr && !(stimulus && exampleAr.includes(stimulus))) out.push(`${lessonId} ${templateId} uyaran örnek ${template.exampleId} içinde değil`);
  const correct = (task.choices || []).filter((c) => c.correct);
  const labels = (task.choices || []).map((c) => c.label);
  if (correct.length !== 1) out.push(`${lessonId} ${templateId} doğru şık sayısı ${correct.length}`);
  if (new Set(labels).size !== labels.length) out.push(`${lessonId} ${templateId} şık etiketi yinelenir`);
  return out;
}

const curriculum = bootKao().win.QuranCurriculumV2;
const allLessons = curriculum.units.flatMap((unit) => unit.lessons);
const gradedTask = (t, queueItem) => t.api.kaoBuildTask(queueItem, t.data, { seed: queueItem.id });

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
    const done = walkLesson(t, lesson.id, { visit: (task) => {
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
  const exTemplate = grammar.byId('g1').templates.find((x) => x.exampleId);
  const stim = grammar.exampleById(exTemplate.exampleId).words[0].ar;
  const root = { type: 'grammar', grammarType: 'Kök bul', cardId: 'g:g19:g19-k1', stimulus: stim, prompt: 'Kök?', choices: choices('a', 'b', 'c') };
  const affix = { type: 'grammar', grammarType: 'Ek çöz', stimulus: stim, prompt: 'Ek?' };
  const table = { type: 'grammar', grammarType: 'Çekim tablosu', cardId: 'g:g13:g13-k1', stimulus: 'ben', prompt: "'ben' formu?", choices: choices('a', 'b') };
  const withExample = { type: 'grammar', grammarType: 'Kelime dizme', cardId: `g:g1:${exTemplate.id}`, stimulus: stim, prompt: 'Dizin', choices: choices('a', 'b') };
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
  assert.equal(valid({ ...withExample, stimulus: stim + 'x' }), false, 'uyaran örnek içinde değil');
  assert.equal(valid({ ...withExample, stimulus: '' }), false, 'örnekli şablonda boş uyaran');
});

check('B3 · geçersiz gramer görevi içeren ders: plan öğesi kelime alıştırmasıyla ikame edilir (kimlik, sıra ve sayı aynı)', () => {
  const t = bootKao();
  let hit = null;
  for (const lesson of allLessons) {
    freshUser(t);
    const plan = t.win.SeymaQuranLearnFlow.lessonPlan({ quranLearn: t.data.quranLearn }, lesson.id, new Date(DEFAULT_NOW), { curriculum, lexicon: t.win.QuranLexiconV1, grammar });
    const bad = plan.filter((item) => item.group === 'concept').filter((item) => defectsOf(gradedTask(t, { id: item.id, cardId: item.cardId, type: 'grammar' }), lesson.id).length);
    if (bad.length) { hit = { lesson, plan, bad }; break; }
  }
  assert.ok(hit, 'ham planda geçersiz görev içeren ders bulunamadı (test verisi)');
  freshUser(t);
  assert.ok(t.api.kaoLesson('start', hit.lesson.id));
  const shown = t.ui.kaoLesson.plan;
  assert.equal(shown.length, hit.plan.length, 'plan uzunluğu');
  for (const item of hit.bad) {
    const at = hit.plan.findIndex((x) => x.id === item.id);
    assert.equal(shown[at].id, item.id, 'kimlik korunur (devam noktası kararlı)');
    assert.equal(shown[at].group, 'lemma', 'kelime alıştırması');
    assert.notEqual(shown[at].type, 'grammar');
    assert.equal(shown[at].substitutedFor, item.cardId, 'ikame edilen kart izlenir');
  }
  const lemmaIds = new Set(shown.find((x) => x.kind === 'goal').lemmaIds);
  assert.ok(shown.filter((x) => x.substitutedFor).every((x) => lemmaIds.has(x.lemmaId)), 'ikame kelimesi aynı dersin kelimesi');
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
    assert.deepEqual(defectsOf(gradedTask(t, queue[0]), concept.id), [], `${cardId}: sunuldu ama geçersiz`);
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
  for (const item of queue.filter((x) => x.type === 'grammar')) assert.deepEqual(defectsOf(gradedTask(t, item), item.cardId), [], `${item.cardId}: geçersiz sunuldu`);
});

check('B6 · yanlış cevap sonrası "yeniden dene" farklı tohumla kurulur: geçersiz olacaksa eklenmez, geçerli tekrar sunulur', () => {
  const t = bootKao();
  let target = null;
  for (const lesson of allLessons) {
    freshUser(t);
    assert.ok(t.api.kaoLesson('start', lesson.id));
    for (const item of t.ui.kaoLesson.plan.filter((x) => x.kind === 'practice' && x.group === 'concept')) {
      const retry = gradedTask(t, { ...item, id: `${item.id}:retry`, type: 'grammar', retry: true });
      if (defectsOf(retry, lesson.id).length) { target = { lesson, cardId: item.cardId }; break; }
    }
    if (target) break;
  }
  assert.ok(target, 'geçerli görevi olup tekrarı geçersiz tohuma düşen kart bulunamadı (test verisi)');
  freshUser(t);
  const shown = [];
  const done = walkLesson(t, target.lesson.id, { answer: (task) => {
    const choices = task.choices || [];
    const hit = task.cardId === target.cardId && !task.retry ? choices.find((c) => !c.correct) : choices.find((c) => c.correct);
    return (hit || choices[0]).choiceId;
  }, visit: (task) => shown.push({ id: task.id, cardId: task.cardId, retry: !!task.retry, bad: task.type === 'grammar' ? defectsOf(task, target.lesson.id) : [] }) });
  assert.ok(done, 'ders özete ulaşmalı');
  assert.ok(shown.some((x) => x.cardId === target.cardId && !x.retry), 'hedef gramer görevi gösterilmeli (yanlış cevaplandı)');
  assert.equal(shown.filter((x) => x.cardId === target.cardId && x.retry).length, 0, 'geçersiz tohumlu tekrar eklenmemeli');
  assert.deepEqual(shown.filter((x) => x.bad.length), [], 'gösterilen hiçbir görev kusurlu olmamalı');
});

console.log(`test_kao2_grammar_tasks (bölüm A+B): ${passed} kontrol PASS`);
