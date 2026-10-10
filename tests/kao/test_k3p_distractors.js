'use strict';
// K3P-01 · B-01: aynı şık bir görevde iki kez çıkmamalı. Çeldiriciler lemma ve gösterilen etiket bazında tekildir.
// Kullanım: node tests/kao/test_k3p_distractors.js [--taban-yaz]
//   --taban-yaz  : çiftsiz görevlerin seçim listelerini $TMPDIR/k3p-01-secimler-onceki.json dosyasına yazar (düzeltmeden önce).
//   Dosya varsa test, bugün çiftsiz olan her görevin şıklarının ve sırasının değişmediğini denetler; yoksa bu adımı atlar.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const H = require('./helpers/kao-harness.js');

const BASELINE_FILE = process.env.K3P_SECIM_TABANI || path.join(process.env.TMPDIR || os.tmpdir(), 'k3p-01-secimler-onceki.json');
const WRITE_BASELINE = process.argv.includes('--taban-yaz');
const DEFAULT_CHOICES = 4;

const failures = [];
const fail = (msg) => { if (failures.length < 40) failures.push(msg); };

// Gösterilen etiket: tr>ar görevinde Arapça, ar>tr görevinde anlam (choice.label zaten görünen metindir).
const shownLabels = (task) => (task.choices || []).map((c) => String(c.label));
// Dizme görevinde (kind:'order') şık, âyetin bir sözcük konumudur: aynı sözcük âyette iki kez geçebilir ve iki çip
// birbirinin yerine geçer (D2F-03). Orada tekillik sıra numarasıyla (ordinal) ölçülür. Kullanıcı kararı, K3P-01.
const choiceKeys = (task) => (task.kind === 'order' ? (task.choices || []).map((c) => `#${c.ordinal}`) : shownLabels(task));
const hasDup = (task) => { const keys = choiceKeys(task); return new Set(keys).size !== keys.length; };
const lemmaOf = (cardId) => { const m = /^w:([^:]+):(ar>tr|tr>ar)$/.exec(String(cardId || '')); return m ? m[1] : null; };
const choiceKey = (task) => (task.choices || []).map((c) => `${c.cardId}=${c.label}${c.correct ? '*' : ''}`).join(' | ');

function checkTask(task, expectedCount, where) {
  if (hasDup(task)) fail(`${where}: çift şık → ${shownLabels(task).join(' · ')}`);
  const correct = (task.choices || []).filter((c) => c.correct === true).length;
  if (task.kind !== 'order' && correct !== 1) fail(`${where}: doğru şık sayısı ${correct}`);
  if (!/^w:/.test(String(task.cardId || ''))) return;
  const target = lemmaOf(task.cardId);
  const distractorLemmas = task.choices.filter((c) => !c.correct).map((c) => lemmaOf(c.cardId) || c.cardId);
  if (new Set(distractorLemmas).size !== distractorLemmas.length) fail(`${where}: çeldirici lemma tekrarı → ${distractorLemmas.join(', ')}`);
  if (distractorLemmas.includes(target)) fail(`${where}: çeldirici hedef lemmayla aynı (${target})`);
  if (task.choices.length !== expectedCount) fail(`${where}: şık sayısı ${task.choices.length} ≠ ${expectedCount}`);
}

// 109 dersi gerçek handler'larla oynatır; her görevi denetler ve seçim listesini kaydeder.
function scan(seeded) {
  const t = H.bootKao({ seeded });
  if (!seeded) H.freshUser(t);
  const record = {};
  let tasks = 0;
  for (const unit of t.win.QuranCurriculumV2.units) {
    for (const lesson of unit.lessons) {
      t.ui.kaoLesson = null;
      if (!t.api.kaoLesson('start', lesson.id)) continue;
      H.playLesson(t, {
        visit(task) {
          tasks += 1;
          const item = (t.ui.kaoQueue || []).find((q) => q.id === task.id) || {};
          const expected = typeof item.choiceCount === 'number' ? Math.max(2, Math.min(DEFAULT_CHOICES, Math.floor(item.choiceCount))) : DEFAULT_CHOICES;
          checkTask(task, expected, `${seeded ? 'yerleşik' : 'yeni'} ${lesson.id} ${task.id}`);
          record[`${lesson.id}|${task.id}|${tasks}`] = { dup: hasDup(task), choices: choiceKey(task) };
        }
      });
      t.api.kaoLesson('exit');
    }
  }
  return { tasks, record };
}

// Birim vaka: iki yönlü kart çifti (w:X:ar>tr + w:X:tr>ar) aynı çeldirici sayılmalı.
function pairCase() {
  const t = H.bootKao();
  const lex = t.win.QuranLexiconV1.lemmas;
  const nouns = [];
  for (const lemma of lex) {
    if (lemma.pos !== 'N' || !lemma.root || nouns.some((n) => n.root === lemma.root || n.meanings[0] === lemma.meanings[0] || n.ar === lemma.ar)) continue;
    nouns.push(lemma);
    if (nouns.length === 4) break;
  }
  assert.equal(nouns.length, 4, 'birim vaka için 4 farklı kökten isim gerekir');
  const [target, x, y, z] = nouns;
  const cards = {};
  cards[`w:${target.id}:ar>tr`] = { state: 'review', s: 40 };
  for (const lemma of [x, y, z]) for (const dir of ['ar>tr', 'tr>ar']) cards[`w:${lemma.id}:${dir}`] = { state: 'review', s: 40 };
  const d = { quranLearn: { cards } };
  for (let i = 0; i < 25; i += 1) {
    const seed = `cift-${i}`;
    const picked = JSON.parse(JSON.stringify(t.api.kaoPickDistractors(d, `w:${target.id}:ar>tr`, 3, { seed })));
    const lemmas = picked.map((p) => lemmaOf(p.cardId));
    if (picked.length !== 3 || new Set(lemmas).size !== 3) fail(`birim ${seed}: 3 tekil çeldirici lemma beklenir → ${lemmas.join(', ')}`);
    for (const dir of ['ar>tr', 'tr>ar']) {
      const task = JSON.parse(JSON.stringify(t.api.kaoBuildTask({ id: `t-${dir}-${i}`, cardId: `w:${target.id}:${dir}` }, d, { seed })));
      checkTask(task, DEFAULT_CHOICES, `birim ${seed} ${dir}`);
    }
  }
}

pairCase();
const fresh = scan(false);
const seeded = scan(true);
const record = { yeni: fresh.record, yerlesik: seeded.record };
const dupCount = (r) => Object.values(r).filter((v) => v.dup).length;

if (WRITE_BASELINE) {
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(record));
  console.log(`taban yazıldı: ${BASELINE_FILE} (yeni ${dupCount(fresh.record)}/${fresh.tasks}, yerleşik ${dupCount(seeded.record)}/${seeded.tasks} çift)`);
} else if (fs.existsSync(BASELINE_FILE)) {
  const before = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  // R-A2 zinciri: hedef kart, önceki tekrarındaki çeldiricileri (card.lastDistractors) dışlar. Aynı hedef kartın daha
  // önceki bir görevi çiftliyse ve düzeldiyse, dışlanan liste de meşru olarak değişir. Yalnız bu durum ayrı sayılır.
  const targetOf = (choices) => (choices.split(' | ').find((c) => c.endsWith('*')) || '').split('=')[0];
  let compared = 0;
  const chained = [];
  for (const who of ['yeni', 'yerlesik']) {
    const dupTargets = new Set();
    for (const [key, old] of Object.entries(before[who] || {})) {
      const target = targetOf(old.choices);
      if (old.dup) { dupTargets.add(target); continue; }
      compared += 1;
      const now = record[who][key];
      if (!now) fail(`kararlılık ${who} ${key}: görev artık yok`);
      else if (now.choices !== old.choices && target && dupTargets.has(target)) chained.push(`${who} ${key}`);
      else if (now.choices !== old.choices) fail(`kararlılık ${who} ${key}: şıklar değişti\n    önce: ${old.choices}\n    sonra: ${now.choices}`);
    }
  }
  console.log(`kararlılık: ${compared} çiftsiz görev tabanla karşılaştırıldı (${BASELINE_FILE}); R-A2 zinciriyle değişen ${chained.length}${chained.length ? ': ' + chained.join(', ') : ''}`);
} else {
  console.log(`kararlılık: taban yok (${BASELINE_FILE}); karşılaştırma atlandı`);
}

if (failures.length) {
  console.error(failures.map((f) => '  ✗ ' + f).join('\n'));
  console.error(`K3P distractors: FAIL (yeni ${dupCount(fresh.record)}/${fresh.tasks}, yerleşik ${dupCount(seeded.record)}/${seeded.tasks} çift şık)`);
  process.exit(1);
}
console.log(`K3P distractors: PASS (birim çift yön ×25 · yeni ${fresh.tasks} + yerleşik ${seeded.tasks} görev; çift şık 0, çeldirici lemma tekil, şık sayısı korunur)`);
