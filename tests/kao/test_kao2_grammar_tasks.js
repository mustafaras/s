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
// D2F-03: orderFor(task) dizme görevinde seçim sırasını (çip listesi) verir; after(task) cevaptan sonra, Devam'dan önce çağrılır.
function walkAware(t, lessonId, { wrongFor = () => false, visit, orderFor, after } = {}) {
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
        const picks = orderFor ? orderFor(task) : (wrong ? byOrdinal.slice().reverse() : byOrdinal);
        for (const c of picks) t.api.kaoAnswer(task.id, c.choiceId);
      } else {
        const pick = wrong ? choices.find((c) => !c.correct) : choices.find((c) => c.correct);
        t.api.kaoAnswer(task.id, (pick || choices[0]).choiceId);
      }
      if (after) after(task);
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


// K2F ek iş: gerçek modülde 86/86 şablon desteklendiği için fail-closed yedek yolu (ikame, kuyruktan eleme) sentetik bir VM'de
// sınanır: "fâil"/"haber" sütun adları kaldırılır, böylece g10-k3, g19-k1/k2/k3 gibi tablo-bağımlı şablonlar kurulamaz.
const BREAK_COLUMNS = (name, source) => (name === 'quranGrammarV1' ? source.split('(fâil)').join('').split('(haber)').join('') : source);
const bootBroken = () => bootKao({ transformSource: BREAK_COLUMNS });

const curriculum = bootKao().win.QuranCurriculumV2;
const allLessons = curriculum.units.flatMap((unit) => unit.lessons);
const gradedTask = (t, queueItem) => t.api.kaoBuildTask(queueItem, t.data, { seed: queueItem.id });
// Kurulamayan (null) görev de "sunulamaz" demektir: kusur listesi boş değildir.
const defectsOrUnbuilt = (task, label) => (task ? defectsOf(task, label) : [`${label} görev kurulamadı`]);
// D2F-04: kullanıcının gördüğü gramer sorusu — tür + yönerge + uyaran + şık yazıları (sırasız); bölüm B3 ve E kullanır.
const shownSignature = (task) => [task.grammarType, task.prompt, task.stimulus, (task.choices || []).map((c) => c.label).sort().join('/')].join('|');

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
  const t = bootBroken();
  // D2F-04: ikame yolu ders içi birebir tekrar soruyu da (sunulabilir ama aynı) ikame eder; bu kontrol sunulamayan görevin ikamesini arar.
  const unpresentable = (item) => (t.api.kaoGrammarSupport(item.substitutedFor) || (gradedTask(t, { id: item.id, cardId: item.substitutedFor, type: 'grammar' }) ? '' : 'kurulamadı')) !== '';
  let hit = null;
  for (const lesson of allLessons) {
    freshUser(t);
    assert.ok(t.api.kaoLesson('start', lesson.id));
    const subs = t.ui.kaoLesson.plan.filter((item) => item.substitutedFor);
    if (subs.some(unpresentable)) { hit = { lesson, plan: t.ui.kaoLesson.plan, subs }; break; }
  }
  assert.ok(hit, 'ikame edilen alıştırması olan ders bulunamadı (test verisi)');
  const lemmaIds = new Set(hit.plan.find((x) => x.kind === 'goal').lemmaIds);
  for (const item of hit.subs) {
    const [, conceptId, templateId] = item.substitutedFor.split(':');
    assert.equal(item.id, `practice:${hit.lesson.id}:${conceptId}:${templateId}`, 'kimlik korunur (devam noktası kararlı)');
    assert.equal(item.group, 'lemma', 'kelime alıştırması');
    assert.notEqual(item.type, 'grammar');
    assert.ok(lemmaIds.has(item.lemmaId), 'ikame kelimesi aynı dersin kelimesi');
    if (unpresentable(item)) continue;
    // Sunulabilir ikame yalnız D2F-04 tekrarıdır: aynı plandaki daha önceki bir gramer öğesinin gösterilen sorusuyla birebir aynı.
    const shown = (x) => shownSignature(gradedTask(t, { id: x.id, cardId: x.substitutedFor || x.cardId, type: 'grammar' }));
    const at = hit.plan.indexOf(item);
    assert.ok(hit.plan.slice(0, at).some((x) => x.kind === 'practice' && x.group === 'concept' && shown(x) === shown(item)), 'yalnız sunulamayan ya da ders içinde tekrar eden görev ikame edilir');
  }
  const practice = hit.plan.filter((x) => x.kind === 'practice');
  assert.ok(practice.length >= 6 && practice.length <= 10, `alıştırma sayısı ${practice.length}`);
  for (const item of practice.filter((x) => x.group === 'concept')) assert.deepEqual(defectsOrUnbuilt(gradedTask(t, { id: item.id, cardId: item.cardId, type: 'grammar' }), hit.lesson.id), [], `${item.cardId}: kalan gramer görevi geçerli olmalı`);
});

check('B4 · tekrar kuyruğu: sunulan her gramer kartının görevi geçerli; geçersizi sunulmaz ve süzgeç 86 şablonun bir kısmını eler', () => {
  const t = bootBroken();
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
// D3F-11: tablo etiketinden kişi; parantez notu cinsiyetse ("o (erkek)") kişiye aittir, değilse ("siz (kulluk)") anlam notudur.
const personKey = (label) => String(label).replace(/\s*\((?!(?:erkek|kadın)\))[^)]*\)/g, '').replace(/\s+/g, ' ').trim();
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
  assert.equal(supported.length, 86, `desteklenen şablon ${supported.length} ≠ 86 (desteklenmeyen: ${unsupported.map((x) => x.template.id).join(', ')})`);
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
    if (['g10-k3', 'g14-k2', 'g19-k3'].includes(x.template.id)) continue; // K2F ek iş: kendi kuralları C10'da
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
      const okAnswer = owner.some((row) => texts(row).includes(correct) || (x.concept.id === 'g1' && correct === `el + ${row.label}`) || ['Tekil', 'Çoğul'].includes(correct) || (x.concept.id === 'g0_5' && texts(row).length) || (['g13', 'g15', 'g17'].includes(x.concept.id) && personKey(row.label) === correct));
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
  // Geri bildirim gövdesi satır satır: Arapça cevap kendi RTL satırında; âyet künyesi ve kural ayrı paragraflar (tek paragraf değil).
  const feedback = after.slice(after.indexOf('kao-feedback-sheet'));
  assert.ok((feedback.match(/<p class="kao-feedback-body/g) || []).length >= 4, 'cevap etiketi + Arapça cevap + âyet + kural ayrı paragraflar');
  assert.match(feedback, /<p class="kao-feedback-body kao-feedback-ar" lang="ar" dir="rtl">/, 'Arapça cevap RTL satırı');
  assert.doesNotMatch(feedback, / · Âyet | · Kural:/, 'bölümler " · " ile tek paragrafa yapıştırılmaz');
  assert.ok(feedback.includes('<p class="kao-feedback-body">Kural: '), 'kural kendi paragrafında');
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

// D3F-11 (denetim-3 F-11): kişi tanıma sorusu kişiyi sınar, anlamı değil (personKey: dosya başında).
check('D3F-11 · kişi sorusunda şıklar yalnız kişidir ve hiçbir ikisi aynı kişiyi göstermez (g13/g15/g17)', () => {
  const t = bootKao();
  freshUser(t);
  const rowsOf = (id) => grammar.byId(id).tables[0].rows;
  const arCells = (row) => row.cells.filter((c) => Array.isArray(c) && ARABIC.test(String(c[1] || ''))).map((c) => c[1]);
  for (const day of SEEDS) {
    for (const [card, concept] of [['g:g13:g13-k3', 'g13'], ['g:g15:g15-k2', 'g15'], ['g:g17:g17-k2', 'g17']]) {
      const task = buildFor(t, card, day);
      assert.equal(t.api.kaoGrammarTaskValid(task), true, `${card} ${day}: geçerli görev`);
      const labels = task.choices.map((c) => c.label);
      for (const label of labels) assert.equal(label, personKey(label), `${card} ${day}: şık anlam notu taşıyor: "${label}"`);
      assert.equal(new Set(labels.map(personKey)).size, labels.length, `${card} ${day}: iki şık aynı kişiyi gösteriyor: ${labels.join(' / ')}`);
      const owner = rowsOf(concept).find((row) => arCells(row)[0] === task.stimulus);
      assert.ok(owner, `${card} ${day}: uyaran tabloda yok`);
      assert.equal(task.choices.find((c) => c.correct).label, personKey(owner.label), `${card} ${day}: doğru cevap uyaranın kişisi`);
      const keys = new Set(rowsOf(concept).map((row) => personKey(row.label)));
      assert.ok(labels.every((label) => keys.has(label)), `${card} ${day}: tabloda olmayan kişi şıkkı`);
      if (concept === 'g17') assert.match(task.prompt, /tek kişiye mi, topluluğa mı\?/, `${card}: yönerge kişiyi (tek/topluluk) sorduğunu söylemiyor`);
    }
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
      // D3F-11: şık satır etiketinin kişi kısmıdır (personKey); anlam notu atılır, cinsiyet notu kalır.
      assert.equal(task.choices.find((c) => c.correct).label, personKey(owner[0].label), `${card}: doğru şahıs/kişi`);
      const allLabels = new Set(rowsOf(concept).map((row) => personKey(row.label)));
      assert.ok(task.choices.every((c) => allLabels.has(c.label)), `${card}: çeldirici tablo dışı`);
      const forms = rowsOf(concept).map((row) => arCells(row)[0]);
      for (const c of task.choices) { const rows = rowsOf(concept).filter((r) => personKey(r.label) === c.label); assert.ok(rows.some((row) => forms.filter((f) => f === arCells(row)[0]).length === 1), `${card}: yinelenen biçimli satır çeldirici/soru olamaz`); }
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
  assert.ok(unsupported.length < 30, `desteklenmeyen sayısı ${unsupported.length}`);
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
    ...(unsupported.length
      ? ['| Şablon | Tür | Örnek (âyet) | Neden |', '|---|---|---|---|']
      : ['Tüm şablonlar için doğrulanmış tablo/örnek verisinden görev kurulur; L2 bekleyen şablon yoktur.']),
    ...unsupported.map((x) => { const ex = x.template.exampleId ? exampleOf(x.concept, x.template) : null; return `| ${x.template.id} | ${x.template.type} | ${ex ? ex.ref : '—'} | ${x.reason} |`; }),
    ''
  ];
  const text = lines.join('\n');
  assert.ok(!ARABIC.test(text), 'listede Arapça harf olmamalı');
  const file = path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/inceleme/GRAMER-SABLON-L2.md');
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== text) fs.writeFileSync(file, text);
  assert.equal(fs.readFileSync(file, 'utf8'), text);
});

check('C13 · g10-k3 / g14-k2 / g19-k3: görev yalnız doğrulanmış tablo ve örnekten kurulur; doğru şık kaynak veriyle eşleşir', () => {
  const t = bootKao();
  freshUser(t);
  const byId = (id) => allTemplates.find((x) => x.template.id === id);
  const table = (x) => x.concept.tables[0];
  const arAt = (row, i) => { const cell = row.cells[i]; return Array.isArray(cell) && ARABIC.test(String(cell[1] || '')) ? String(cell[1]) : null; };
  // g10-k3: doğru şık = satırın haber hücresi (2. sütun); aynı satırın mübtedası şık olarak bulunur ama doğru değildir.
  const g10 = byId('g10-k3');
  for (const day of SEEDS) {
    const task = buildFor(t, g10.cardId, day);
    const correct = task.choices.filter((c) => c.correct);
    assert.equal(correct.length, 1, `g10-k3 ${day}: tek doğru şık`);
    const label = /^'(.*)' cümlesinde/.exec(task.prompt)[1];
    const row = table(g10).rows.find((r) => r.label === label);
    assert.ok(row, `g10-k3 ${day}: yönergedeki cümle tabloda yok (${label})`);
    assert.equal(correct[0].label, arAt(row, 1), `g10-k3 ${day}: doğru şık haber hücresi değil`);
    assert.ok(task.choices.some((c) => c.label === arAt(row, 0)), `g10-k3 ${day}: aynı satırın mübtedası çeldirici olmalı`);
  }
  // g14-k2: uyaran = doğrulanmış g14-e1 örneğinin "kânû + fiil" kelimeleri; doğru şık kavramın kural cümlesindeki anlamdır.
  const g14 = byId('g14-k2');
  const e1 = g14.concept.examples.find((e) => e.id === 'g14-e1');
  const expectStimulus = `${e1.words[1].ar} ${e1.words[2].ar}`;
  for (const day of SEEDS) {
    const task = buildFor(t, g14.cardId, day);
    assert.equal(task.stimulus, expectStimulus, `g14-k2 ${day}: uyaran örnekle aynı olmalı`);
    const correct = task.choices.filter((c) => c.correct);
    assert.equal(correct.length, 1);
    assert.match(correct[0].label, /-ıyordu|-ırdı/, 'doğru şık kural cümlesindeki anlamı taşımalı');
  }
  // g19-k3: uyaran fâil ya da mef'ûl sütunundan gelir; doğru şık o sütunun adıdır.
  const g19 = byId('g19-k3');
  const headers = table(g19).columns;
  const failIdx = headers.findIndex((h) => /fâil/i.test(h)) - 1, mefIdx = headers.findIndex((h) => /mef/i.test(h)) - 1;
  const seenSides = new Set();
  for (const day of SEEDS) {
    const task = buildFor(t, g19.cardId, day);
    const correct = task.choices.find((c) => c.correct);
    const rowIdx = table(g19).rows.findIndex((r) => arAt(r, failIdx) === task.stimulus || arAt(r, mefIdx) === task.stimulus);
    assert.ok(rowIdx >= 0, `g19-k3 ${day}: uyaran tabloda yok`);
    const row = table(g19).rows[rowIdx];
    const isFail = arAt(row, failIdx) === task.stimulus;
    assert.match(correct.label, isFail ? /Yapan/ : /Yapılan/, `g19-k3 ${day}: doğru şık sütunla uyuşmuyor`);
    seenSides.add(isFail);
  }
  assert.ok(seenSides.size >= 1);
});

// ---------------------------------------------------------------------------------------------------------------
// Bölüm D (D2F-03 · D2-01) — aynı yazılı dizme çipleri birbirinin yerine geçer
// ---------------------------------------------------------------------------------------------------------------
// Kullanıcı yalnız çip yazısını görür: aynı yazılı iki çipten hangisini önce seçtiği görünür sırayı değiştirmez. Sıra kontrolü
// çip kimliğine (ordinal) değil yazıya dayanmalı. Akış gerçek handler'larla sürülür (kaoLesson/kaoStart/kaoAnswer/kaoContinue).
const byOrdinalOf = (task) => (task.choices || []).slice().sort((a, b) => a.ordinal - b.ordinal);
const labelsOf = (picks) => picks.map((c) => c.label);
const hasDupLabel = (task) => { const l = labelsOf(task.choices || []); return l.some((x, i) => l.indexOf(x) !== i); };
// Aynı yazılı çiplerin konumlarını kendi aralarında ters çevirir: yazı dizisi aynı kalır, çip kimlikleri yer değiştirir.
function swapSameLabel(picks) {
  const out = picks.slice();
  for (const label of new Set(labelsOf(picks))) {
    const at = picks.map((c, i) => (c.label === label ? i : -1)).filter((i) => i >= 0);
    at.forEach((pos, k) => { out[pos] = picks[at[at.length - 1 - k]]; });
  }
  return out;
}
// Görünür yazı dizisi doğru sıradan farklı olan bir sıra (bir kaydırma).
const rotated = (picks) => picks.slice(1).concat(picks.slice(0, 1));
const todayKeyOf = (t) => t.NOW.slice(0, 10);
const answerState = (t, task) => {
  const q = t.data.quranLearn, daily = q.daily[todayKeyOf(t)] || {};
  return { feedback: t.ui.kaoFeedback, panelCorrect: !!(t.ui.kaoPanel && t.ui.kaoPanel.correct), correct: daily.correct || 0, answered: daily.answered || 0,
    errors: { ...q.errors }, queueLen: t.ui.kaoQueue.length, lessonCorrect: (t.ui.kaoLesson && t.ui.kaoLesson.correct) || 0, html: task ? t.api.kaoTaskHTML(task) : '' };
};

// u08.02'yi oynatır; g16-k2 dizme görevinde seçim sırasını pickFor(canonical) belirler. Cevaptan önce/sonra durum döner.
function playU0802(pickFor) {
  const t = bootKao();
  freshUser(t);
  let hit = null;
  const finished = walkAware(t, 'u08.02', {
    orderFor: (task) => {
      const canonical = byOrdinalOf(task);
      if (hit || task.retry || !/g16-k2$/.test(task.cardId)) return canonical;
      const picks = pickFor(canonical);
      hit = { task, canonical, picks, before: answerState(t, null) };
      return picks;
    },
    after: (task) => { if (hit && hit.task === task && !hit.after) hit.after = answerState(t, task); }
  });
  assert.ok(finished, 'u08.02 özete kadar yürümedi');
  assert.ok(hit && hit.after, 'u08.02 g16-k2 "Kelime dizme" görevi gösterilmedi');
  assert.equal(hit.task.grammarType, 'Kelime dizme');
  assert.ok(hasDupLabel(hit.task), 'ön koşul: g16-k2 görevinde aynı yazılı iki çip var');
  return hit;
}

check('D1 · D2-01 u08.02 g16-k2: aynı yazılı iki çip yer değiştirerek görünürde doğru sırayla seçilince "Doğru"; günlük doğru +1, hata sayacı değişmez, yeniden deneme eklenmez', () => {
  const hit = playU0802(swapSameLabel);
  assert.deepEqual(labelsOf(hit.picks), labelsOf(hit.canonical), 'görünür sıra doğru sıra');
  assert.notDeepEqual(hit.picks.map((c) => c.choiceId), hit.canonical.map((c) => c.choiceId), 'çip kimlikleri yer değiştirdi');
  const { before, after } = hit;
  assert.equal(after.feedback, 'Doğru', `geri bildirim: ${after.feedback}`);
  assert.equal(after.panelCorrect, true);
  assert.equal(after.answered, before.answered + 1);
  assert.equal(after.correct, before.correct + 1, 'günlük doğru sayısı artar');
  assert.equal(after.lessonCorrect, before.lessonCorrect + 1, 'ders doğru sayısı artar');
  assert.deepEqual(after.errors, before.errors, 'hata sayacına yazılmaz');
  assert.equal(after.queueLen, before.queueLen, 'yanlış sayılıp yeniden deneme eklenmez');
  assert.ok(!/kao-choice-wrong/.test(after.html), 'çiplerden hiçbiri yanlış işaretlenmez');
  assert.ok(/kao-choice-correct/.test(after.html), 'seçilen çipler doğru işaretlenir');
});

check('D2 · D2-01 u08.02 g16-k2: gerçekten yanlış sıra (aynı yazılı çipler de yer değiştirse) yine yanlış; hata sayacı +1, yeniden deneme eklenir', () => {
  for (const pickFor of [rotated, (c) => swapSameLabel(rotated(c))]) {
    const hit = playU0802(pickFor);
    assert.notDeepEqual(labelsOf(hit.picks), labelsOf(hit.canonical), 'görünür sıra yanlış');
    const { before, after } = hit;
    assert.match(after.feedback, /^Doğru cevap: /);
    assert.equal(after.panelCorrect, false);
    assert.equal(after.correct, before.correct, 'günlük doğru sayısı artmaz');
    assert.equal(after.errors[hit.task.errorClass], before.errors[hit.task.errorClass] + 1, `errors.${hit.task.errorClass} +1`);
    assert.equal(after.queueLen, before.queueLen + 1, 'yeniden deneme eklenir');
    assert.ok(/kao-choice-wrong/.test(after.html), 'yanlış konumdaki çip işaretlenir');
  }
});

check('D3 · 109 dersin bütün dizme görevlerinde aynı yazılı çiplerin yer değiştirmesi sonucu değiştirmez (doğru sıra doğru, yanlış sıra yanlış)', () => {
  const t = bootKao();
  let orderTasks = 0, dupTasks = 0;
  const dupCards = new Set(), bad = [];
  for (const wrongPass of [false, true]) {
    for (const lesson of allLessons) {
      freshUser(t);
      let pending = null;
      const finished = walkAware(t, lesson.id, {
        orderFor: (task) => {
          const canonical = byOrdinalOf(task);
          if (task.retry) { pending = null; return canonical; }
          const base = wrongPass ? rotated(canonical) : canonical;
          pending = { task, expectCorrect: !wrongPass };
          if (!wrongPass) { orderTasks += 1; if (hasDupLabel(task)) { dupTasks += 1; dupCards.add(task.cardId); } }
          return swapSameLabel(base);
        },
        after: (task) => {
          if (!pending || pending.task !== task) return;
          const ok = !!(t.ui.kaoPanel && t.ui.kaoPanel.correct);
          if (ok !== pending.expectCorrect) bad.push(`${lesson.id} ${task.cardId}: ${wrongPass ? 'yanlış sıra' : 'doğru sıra'} → "${t.ui.kaoFeedback}"`);
          pending = null;
        }
      });
      assert.ok(finished, `${lesson.id}: özete kadar yürümedi`);
    }
  }
  assert.equal(bad.length, 0, bad.slice(0, 5).join(' | '));
  assert.ok(orderTasks >= 10, `dizme görevi sayısı ${orderTasks}`);
  assert.ok(dupTasks >= 1 && [...dupCards].some((id) => /g16-k2$/.test(id)), `aynı yazılı çipli dizme görevi: ${[...dupCards].join(', ') || 'yok'}`);
});

// Parça (fragment) dizme aynı cevap yolunu kullanır. Gerçek kısa sûre gruplarında tekrar eden kelime yok; sentetik VM'de 95:4
// grubunun bir kelimesine aynı grubun başka bir kelimesinin yazı+okunuşu kopyalanır (modülden türetilir, elle Arapça yazılmaz).
const DUP_FRAGMENT = (name, src) => {
  if (name !== 'quranShortSurahsV1') return src;
  // Sıkıştırılmış kelime kaydı: [id, sûre, âyet, sıra, ar, lemmaId, tr, okunuş].
  const re = /\["s-95-4-(\d+)",[^[\]]*\]/g;
  const recs = {};
  for (const m of src.matchAll(re)) recs[m[1]] = m[0];
  assert.ok(recs['3'] && recs['5'], 'sentetik kurulum: 95:4 kayıtları bulunamadı');
  const from = JSON.parse(recs['3']), to = JSON.parse(recs['5']);
  assert.equal(from.length, 8, 'sentetik kurulum: kayıt biçimi');
  to[4] = from[4]; to[7] = from[7];
  return src.split(recs['5']).join(JSON.stringify(to));
};
function playFragment(transformSource, pickFor) {
  const t = transformSource ? bootKao({ transformSource }) : bootKao();
  freshUser(t);
  t.api.kaoStart();
  const item = t.ui.kaoQueue[t.ui.kaoTaskIndex];
  const task = item && t.ui.kaoTasks[item.id];
  assert.ok(task && task.type === 'fragment' && task.kind === 'order', 'ilk görev parça dizme olmalı');
  const canonical = byOrdinalOf(task), picks = pickFor(canonical), before = answerState(t, null);
  for (const c of picks) t.api.kaoAnswer(task.id, c.choiceId);
  return { t, task, canonical, picks, before, after: answerState(t, task) };
}

check('D4 · parça (fragment) dizme: aynı yazılı çipler yer değişse de görünür doğru sıra "Doğru"; gerçekten yanlış sıra yanlış (errors.order +1)', () => {
  const real = playFragment(null, (c) => c);
  assert.equal(real.after.feedback, 'Doğru', 'gerçek veride doğru sıra doğru');
  assert.ok(!hasDupLabel(real.task), 'gerçek parça grubunda tekrar eden kelime yok (sentetik kurulumun gerekçesi)');
  const swap = playFragment(DUP_FRAGMENT, swapSameLabel);
  assert.ok(hasDupLabel(swap.task), 'ön koşul: sentetik parçada aynı yazılı iki çip');
  assert.deepEqual(labelsOf(swap.picks), labelsOf(swap.canonical));
  assert.notDeepEqual(swap.picks.map((c) => c.choiceId), swap.canonical.map((c) => c.choiceId));
  assert.equal(swap.after.feedback, 'Doğru', `geri bildirim: ${swap.after.feedback}`);
  assert.equal(swap.after.correct, swap.before.correct + 1);
  assert.deepEqual(swap.after.errors, swap.before.errors);
  assert.equal(swap.after.queueLen, swap.before.queueLen);
  assert.ok(!/kao-choice-wrong/.test(swap.after.html));
  const wrong = playFragment(DUP_FRAGMENT, (c) => swapSameLabel(rotated(c)));
  assert.notDeepEqual(labelsOf(wrong.picks), labelsOf(wrong.canonical));
  assert.equal(wrong.after.panelCorrect, false);
  assert.equal(wrong.after.correct, wrong.before.correct);
  assert.equal(wrong.after.errors.order, wrong.before.errors.order + 1);
  assert.equal(wrong.after.queueLen, wrong.before.queueLen + 1);
});

// ---------------------------------------------------------------------------------------------------------------
// Bölüm E (D2F-04 · D2-09 + LEDGER seq 4 NOT) — ders içinde aynı gramer sorusu bir kez; dizme çözülmüş açılmaz
// ---------------------------------------------------------------------------------------------------------------
// Kullanıcının gördüğü soru: tür + yönerge + uyaran + şık yazıları (sırasız). Farklı şablonlar (ör. u01.02 g1-k1 ve g1-k2) aynı
// tohum ailesinden birebir aynı soruyu kurabiliyordu; "ardışık aynı tür yok" kuralı bir görev arayla gelen tekrarı yakalamaz.
// D2F-04 öncesi ölçülen değerler (109 ders, taze kullanıcı, doğru cevaplı gerçek yürüyüş): alıştırma sayısı her derste 10, yalnız
// u11.04/u11.05/u11.06'da 9; gösterilen gramer görevi 78, ders içi aynı soru çifti 1 (u01.02 g1-k1 ≡ g1-k2).
const PRACTICE_BEFORE = (lessonId) => (['u11.04', 'u11.05', 'u11.06'].includes(lessonId) ? 9 : 10);
const GRAMMAR_SHOWN_BEFORE = 78, DUP_PAIRS_BEFORE = 1;

check('E1 · D2-09 109 dersin yürüyüşünde hiçbir derste aynı gramer sorusu (tür + yönerge + uyaran + şıklar) iki kez gösterilmez; alıştırma sayısı her derste değişmez; gösterilen gramer yalnız çift sayısı kadar azalır', () => {
  assert.equal(allLessons.length, 109);
  const t = bootKao();
  const dup = [], countDiff = [];
  let shown = 0, substituted = 0;
  for (const lesson of allLessons) {
    freshUser(t);
    const seen = new Map();
    let practice = 0;
    const done = walkAware(t, lesson.id, { visit: (task) => {
      if (t.ui.kaoLesson.phase !== 'practice') return;
      practice += 1;
      if (task.type !== 'grammar' || task.retry) return;
      shown += 1;
      const sig = shownSignature(task);
      if (seen.has(sig)) dup.push(`${lesson.id}: ${seen.get(sig)} ≡ ${task.cardId}`); else seen.set(sig, task.cardId);
    } });
    assert.ok(done, `${lesson.id}: özete ulaşılamadı`);
    substituted += t.ui.kaoLesson.plan.filter((item) => item.kind === 'practice' && item.substitutedFor).length;
    if (practice !== PRACTICE_BEFORE(lesson.id)) countDiff.push(`${lesson.id}: ${practice} ≠ ${PRACTICE_BEFORE(lesson.id)}`);
  }
  assert.deepEqual(dup, [], `ders içi aynı gramer sorusu: ${dup.join(', ')}`);
  assert.deepEqual(countDiff, [], 'alıştırma sayısı değişti');
  assert.equal(substituted, DUP_PAIRS_BEFORE, `ikame edilen gramer öğesi ${substituted} ≠ çift sayısı ${DUP_PAIRS_BEFORE}`);
  assert.equal(shown, GRAMMAR_SHOWN_BEFORE - DUP_PAIRS_BEFORE, `gösterilen gramer ${shown} ≠ ${GRAMMAR_SHOWN_BEFORE} − ${DUP_PAIRS_BEFORE}`);
  console.log(`      gösterilen gramer görevi: ${GRAMMAR_SHOWN_BEFORE} → ${shown} · ikame ${substituted} · ders içi tekrar 0`);
});

check('E2 · u01.02: ikinci kopya (g1-k2) aynı dersin kullanılmamış bir kelime alıştırmasıyla ikame edilir — öğe kimliği/sırası korunur, lemma tanış kartından sonra gelir, ilk kopya (g1-k1) kalır', () => {
  const t = bootKao();
  freshUser(t);
  assert.ok(t.api.kaoLesson('start', 'u01.02'));
  const plan = t.ui.kaoLesson.plan, goal = plan.find((item) => item.kind === 'goal');
  const index = plan.findIndex((item) => item.id === 'practice:u01.02:g1:g1-k2');
  assert.ok(index >= 0, 'öğe kimliği (devam noktası) korunur');
  const item = plan[index];
  assert.equal(item.group, 'lemma');
  assert.equal(item.substitutedFor, 'g:g1:g1-k2');
  assert.ok(goal.lemmaIds.includes(item.lemmaId), 'ikame aynı dersin lemmasıdır');
  assert.equal(plan.filter((x) => x.kind === 'practice' && x.cardId === item.cardId).length, 1, 'ikame kartı planda başka yerde yok');
  const introAt = plan.findIndex((x) => x.kind === 'intro' && x.lemmaId === item.lemmaId);
  assert.ok(introAt < 0 ? !goal.newLemmaIds.includes(item.lemmaId) : introAt < index, 'yeni lemmanın tanış kartı ikameden önce');
  assert.ok(plan.some((x) => x.kind === 'practice' && x.cardId === 'g:g1:g1-k1'), 'ilk kopya kalır');
});

// 18 dizme şablonu × 2000 tohum (gerçek kuyruk kimliği biçimi `kao:<gün>:<kart>`, 2026-01-01'den ardışık 2000 gün).
// Kullanıcı yalnız çip yazısını görür: ekrandaki yazı dizisi doğru yazı dizisine eşitse soru çözülmüş açılmıştır (aynı yazılı çipler
// yer değiştirdiğinde kimlik sırası "karışık" görünse bile).
const ORDER_DAYS = Array.from({ length: 2000 }, (_, i) => new Date(Date.UTC(2026, 0, 1) + i * 864e5).toISOString().slice(0, 10));
check('E3 · Kelime dizme: 18 şablonun her biri 2000 tohumla kurulunca ekrandaki yazı dizisi HİÇBİR zaman doğru yazı dizisine eşit değil (0/36000); doğru sıra yine örnek sırası', () => {
  const t = bootKao();
  freshUser(t);
  let templates = 0, tasks = 0;
  const solved = {};
  for (const x of allTemplates) {
    if (x.template.type !== 'Kelime dizme') continue;
    const example = exampleOf(x.concept, x.template);
    templates += 1;
    const correct = Array.from(example.words, (w) => w.ar).join('\u0001');
    for (const day of ORDER_DAYS) {
      const task = buildFor(t, x.cardId, day);
      tasks += 1;
      assert.equal(byOrdinalOf(task).map((c) => c.label).join('\u0001'), correct, `${x.cardId} ${day}: doğru sıra örnek sırası`);
      if (task.choices.map((c) => c.label).join('\u0001') === correct) solved[x.cardId] = (solved[x.cardId] || 0) + 1;
    }
  }
  assert.equal(templates, 18);
  assert.equal(tasks, 36000);
  assert.deepEqual(solved, {}, `çözülmüş açılan dizme: ${JSON.stringify(solved)}`);
});

// D3F-01 (denetim-3 F-01): g21-k1 "Aynı kökten üç kelime" diyordu ama tablonun ilk üç satırını (ʿ-l-m, n-z-l, ġ-f-r) gösteriyordu.
// Kalıp eşle şablonunun lemmaları dondurma hattından gelir (elle Arapça yok); görev o lemmalardan kurulur ve "aynı kök" diyen
// bir görevin Arapça bağlamı tek kökten değilse doğrulayıcı reddeder (fail-closed).
check('F1 · Kalıp eşle şablonlarının lemmaları kaynakla aynı (Arapça, okunuş, anlam, kök) — elle yazılmadı', () => {
  let n = 0;
  for (const x of allTemplates.filter((item) => item.template.type === 'Kalıp eşle')) {
    const src = srcConcept(x.concept.id).templates.find((tpl) => tpl.id === x.template.id);
    assert.ok(Array.isArray(x.template.lemmas) && x.template.lemmas.length === src.lemmas.length, `${x.template.id}: lemma listesi dondurulmalı`);
    x.template.lemmas.forEach((row, i) => {
      assert.equal(row[0], src.lemmas[i].ar, `${x.template.id}#${i} Arapça`);
      assert.ok(row[1], `${x.template.id}#${i} okunuş boş`);
      assert.equal(row[2], src.lemmas[i].tr1, `${x.template.id}#${i} anlam`);
      assert.equal(row[3], src.lemmas[i].root, `${x.template.id}#${i} kök`);
    });
    n += 1;
  }
  assert.equal(n, 3, 'g19-k2 · g20-k1 · g21-k1');
});

check('F2 · g21-k1 her tohumda aynı kökten üç kelime gösterir; uyaran ve doğru anlam aynı lemmadan; doğrulayıcı kabul eder', () => {
  const t = bootKao();
  freshUser(t);
  const lemmas = grammar.byId('g21').templates.find((tpl) => tpl.id === 'g21-k1').lemmas;
  assert.equal(new Set(lemmas.map((row) => row[3])).size, 1, 'kaynak lemmalar tek kökten');
  for (const day of ORDER_DAYS.slice(0, 200)) {
    const task = buildFor(t, 'g:g21:g21-k1', day);
    assert.ok(task, `${day}: görev kurulmalı`);
    assert.deepEqual(Array.from(task.context, (c) => c.label), Array.from(lemmas, (row) => row[0]), `${day}: bağlam şablon lemmaları`);
    const hit = lemmas.find((row) => row[0] === task.stimulus);
    assert.ok(hit, `${day}: uyaran lemmalardan biri`);
    assert.equal(task.answer, hit[2], `${day}: doğru şık uyaranın anlamı`);
    assert.doesNotMatch(task.prompt, /eşleştir/, 'tek şıklı arayüzde "eşleştir" denmez');
    assert.match(task.prompt, /[Aa]ynı kök/);
    assert.equal(t.api.kaoGrammarTaskValid(task), true, `${day}: doğrulayıcı`);
  }
});

check('F3 · mutasyon: "aynı kök" diyen görevin bağlamına başka kökten kelime girerse doğrulayıcı reddeder', () => {
  const t = bootKao();
  freshUser(t);
  const task = buildFor(t, 'g:g21:g21-k1', '2026-10-08');
  const foreign = grammar.byId('g21').tables[0].rows[0].cells.find((cell) => Array.isArray(cell) && cell[1]);
  assert.ok(foreign && !task.context.some((c) => c.label === foreign[1]), 'başka kökten tablo hücresi');
  const mixed = { ...task, context: [task.context[0], task.context[1], { label: foreign[1], pronunciation: foreign[2] }] };
  assert.equal(t.api.kaoGrammarTaskValid(mixed), false, 'karışık kök bağlamı');
  assert.equal(t.api.kaoGrammarTaskValid({ ...task, stimulus: foreign[1] }), false, 'uyaran lemmalardan değil');
});

console.log(`test_kao2_grammar_tasks (bölüm A+B+C+D+E+F): ${passed} kontrol PASS`);
