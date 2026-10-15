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
console.log('R1/R2 ayrımı TASARIM §4 sınıflamasıdır; R2 de çoktan seçmelidir. K3P-17 R3 "harflerden kur" üretim görevini ekledi (üstte build sayısı); R4 K3P-18 işidir, yüzde 60 hedefi o kartta doğrulanır.');
if (seeded.dups[0]) console.log('örnek:', JSON.stringify(seeded.dups[0]));
process.exit(fresh.dups.length + seeded.dups.length > 0 ? 1 : 0);
