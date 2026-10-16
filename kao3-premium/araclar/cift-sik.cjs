'use strict';
// K3P · B-01 yeniden üretimi (salt-okur, ağsız node:vm): yerleşik kullanıcıda aynı şık iki kez görünüyor mu?
// Kullanım: node kao3-premium/araclar/cift-sik.cjs   → çift şıklı görev varsa exit 1.
const path = require('node:path');
const H = require(path.join(__dirname, '..', '..', 'tests', 'kao', 'helpers', 'kao-harness.js'));

// K3P-17: R3 (10 ≤ s < 30) bandı ayrı ve SABİT bir örnekte ölçülür. Harness tohumu s=40 (R4 bandı)
// olduğu için ders taramasında R3 hiç görünmez; karta bağlı bir sayım da FSRS yeniden planlamasıyla
// şişer. Bu örnek her kartı BİR KEZ kurar ve yalnız görev türünü sayar (yazma yok).
function r3Sample() {
  const t = H.bootKao({ seeded: true });
  const flow = t.win.SeymaQuranLearnFlow, q = t.data.quranLearn;
  let cards = 0, build = 0, other = [];
  for (const id of Object.keys(q.cards).sort()) {
    q.cards[id].s = 12;
    const arm = flow.ladderArm(id), rung = flow.ladderRung(q.cards[id]);
    if (arm !== 'A' || rung !== 'R3') continue;
    cards += 1;
    const task = t.api.kaoBuildTask({ id: `r3:${id}`, cardId: id, isNew: false }, t.data, { seed: `r3:${id}` });
    if (task && task.kind === 'build') build += 1; else if (other.length < 5) other.push(`${id}:${task && task.rung}/${task && task.kind}`);
  }
  return { cards, build, other };
}

// K3P-18: kabul ölçütü "tanıma payı ≤ %60" YALNIZ merdiven görevlerinde ve gerçek bir KARIŞIMDA ölçülür.
//   - Yeni kelime tanışı (isNew) merdiven dışıdır; sayılırsa pay yapay olarak şişer (yerleşik tohumda
//     %80, çünkü 1031 görevin 881'i tanış). Ölçüm bu yüzden yalnız TEKRAR görevlerini alır.
//   - Yöntem (kart: "yerleşik kullanıcı ve s ≥ 30 kart karışımı"): 1. geçiş derslerin gerçekten kullandığı
//     kelime kartlarını toplar; 2. geçiş o kartları KARIŞIK kararlılıkla tohumlar (üçte biri s=40 → R4,
//     üçte biri s=12 → R3, üçte biri s=5 → R2), böylece merdivenin dört basamağı da temsil edilir.
//     Tohum kart kimliğine göre deterministiktir; ölçüm tekrarlanabilir.
function lessonCardIds() {
  const t = H.bootKao({ seeded: true });
  const used = new Set();
  for (const unit of t.win.QuranCurriculumV2.units) {
    for (const lesson of unit.lessons) {
      t.ui.kaoLesson = null;
      if (!t.api.kaoLesson('start', lesson.id)) continue;
      H.playLesson(t, { visit(task) { if (task.type === 'word') used.add(task.cardId); } });
      t.api.kaoLesson('exit');
    }
  }
  return [...used].sort();
}

function mixedSample() {
  const ids = lessonCardIds();
  const t = H.bootKao({ seeded: false });
  H.freshUser(t);
  const q = t.data.quranLearn;
  ids.forEach((id, index) => {
    q.cards[id] = { state: 'review', s: index % 3 === 0 ? 40 : (index % 3 === 1 ? 12 : 5), reps: 8, due: '2026-09-29T00:00:00.000Z' };
  });
  let tasks = 0, recognition = 0, cloze = 0, build = 0, other = 0;
  for (const unit of t.win.QuranCurriculumV2.units) {
    for (const lesson of unit.lessons) {
      t.ui.kaoLesson = null;
      if (!t.api.kaoLesson('start', lesson.id)) continue;
      H.playLesson(t, { visit(task) {
        if (task.type !== 'word' || task.isNew) return;
        tasks += 1;
        if (task.rung === 'R1') recognition += 1;
        else if (task.kind === 'cloze') cloze += 1;
        else if (task.kind === 'build') build += 1;
        else other += 1;
      } });
      t.api.kaoLesson('exit');
    }
  }
  return { cards: ids.length, tasks, recognition, cloze, build, other };
}

function scan(seeded) {
  const t = H.bootKao({ seeded });
  if (!seeded) H.freshUser(t);
  let tasks = 0;
  let recognition = 0;
  let mapping = 0;
  let build = 0;
  let wordChoices = 0;
  const dups = [];
  for (const unit of t.win.QuranCurriculumV2.units) {
    for (const lesson of unit.lessons) {
      t.ui.kaoLesson = null;
      if (!t.api.kaoLesson('start', lesson.id)) continue;
      H.playLesson(t, {
        visit(task) {
          tasks += 1;
          if (task.type === 'word' && Array.isArray(task.choices)) {
            wordChoices += 1;
            if (task.rung === 'R1') recognition += 1;
            if (task.rung === 'R2') mapping += 1;
            if (task.kind === 'build') build += 1;
          }
          // Dizme görevinde aynı sözcük âyette iki kez geçebilir (D2F-03); orada tekillik sıra numarasıyla ölçülür (K3P-01).
          const labels = (task.choices || []).map((c) => (task.kind === 'order' ? `#${c.ordinal}` : c.label));
          if (new Set(labels).size < labels.length) dups.push({ lesson: lesson.id, task: task.id, cards: task.choices.map((c) => c.cardId) });
        }
      });
      t.api.kaoLesson('exit');
    }
  }
  return { tasks, recognition, mapping, build, wordChoices, dups };
}

const fresh = scan(false);
const seeded = scan(true);
console.log(`yeni kullanıcı : ${fresh.dups.length}/${fresh.tasks} görevde çift şık`);
console.log(`yerleşik (20 kelime review): ${seeded.dups.length}/${seeded.tasks} görevde çift şık`);
for (const [label, result] of [['yeni', fresh], ['yerleşik', seeded]]) {
  console.log(`${label}: R1 tanıma ${result.recognition}/${result.tasks} (%${(100 * result.recognition / result.tasks).toFixed(2)}), R2 eşleme ${result.mapping}/${result.tasks}, R3 harflerden kur (build) ${result.build}/${result.tasks}, toplam kelime çoktan seçmeli ${result.wordChoices}/${result.tasks} (%${(100 * result.wordChoices / result.tasks).toFixed(2)})`);
}
const sample = r3Sample();
console.log(`R3 örneği (yerleşik tohum, 10 ≤ s < 30, A kolu): ${sample.cards} kart, ${sample.build} build görevi${sample.other.length ? ' · build kurulamayan: ' + sample.other.join(', ') : ''}`);
const mixed = mixedSample();
const share = mixed.tasks ? 100 * mixed.recognition / mixed.tasks : 0;
console.log(`karışık örnek (${mixed.cards} ders kartı, s karışımı 40/12/5): ${mixed.tasks} TEKRAR görevi · R1 tanıma ${mixed.recognition} (%${share.toFixed(2)}) · R4 Âyette boşluk ${mixed.cloze} · R3 harflerden kur ${mixed.build} · R2 eşleme ${mixed.other}`);
console.log(`K3P-18 kabul ölçütü: tanıma payı ≤ %60 → %${share.toFixed(2)} ${share <= 60 ? 'PASS' : 'FAIL'}`);
console.log('R1/R2 ayrımı TASARIM §4 sınıflamasıdır; R2 de çoktan seçmelidir. K3P-17 R3 "harflerden kur", K3P-18 R4 "âyette boşluk" üretim görevlerini ekledi. Tanış (isNew) görevleri merdiven dışıdır, ölçüme girmez.');
if (seeded.dups[0]) console.log('örnek:', JSON.stringify(seeded.dups[0]));
process.exit(fresh.dups.length + seeded.dups.length > 0 || share > 60 ? 1 : 0);
