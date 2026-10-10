'use strict';
// K3P · B-01 yeniden üretimi (salt-okur, ağsız node:vm): yerleşik kullanıcıda aynı şık iki kez görünüyor mu?
// Kullanım: node kao3-premium/araclar/cift-sik.cjs   → çift şıklı görev varsa exit 1.
const path = require('node:path');
const H = require(path.join(__dirname, '..', '..', 'tests', 'kao', 'helpers', 'kao-harness.js'));

function scan(seeded) {
  const t = H.bootKao({ seeded });
  if (!seeded) H.freshUser(t);
  let tasks = 0;
  const dups = [];
  for (const unit of t.win.QuranCurriculumV2.units) {
    for (const lesson of unit.lessons) {
      t.ui.kaoLesson = null;
      if (!t.api.kaoLesson('start', lesson.id)) continue;
      H.playLesson(t, {
        visit(task) {
          tasks += 1;
          const labels = (task.choices || []).map((c) => c.label);
          if (new Set(labels).size < labels.length) dups.push({ lesson: lesson.id, task: task.id, cards: task.choices.map((c) => c.cardId) });
        }
      });
      t.api.kaoLesson('exit');
    }
  }
  return { tasks, dups };
}

const fresh = scan(false);
const seeded = scan(true);
console.log(`yeni kullanıcı : ${fresh.dups.length}/${fresh.tasks} görevde çift şık`);
console.log(`yerleşik (20 kelime review): ${seeded.dups.length}/${seeded.tasks} görevde çift şık`);
if (seeded.dups[0]) console.log('örnek:', JSON.stringify(seeded.dups[0]));
process.exit(fresh.dups.length + seeded.dups.length > 0 ? 1 : 0);
