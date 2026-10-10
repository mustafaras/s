'use strict';
// K3P-02 · B-02 / B-05 (K-C "kayma ile hatayı ayırmak"): geri bildirim ve özet metni.
//   - Doğru cevap panelinde geri alma (kaoUndo) yok; gövde "Doğru" başlığını tekrar etmiyor.
//   - Yanlış cevap panelinde geri alma düğmesi "Yanlışlıkla dokundum"; "Aslında biliyordum" hiçbir yerde yok.
//   - Ders özetinde "tamamlandı" bir kez geçiyor; başlıkta yalnız dersin adı var.
// Gerçek dersler harness ile oynatılır (yerleşik + yeni kullanıcı); her görev sırayla doğru ve yanlış cevaplanır.
const assert = require('node:assert/strict');
const H = require('./helpers/kao-harness.js');

const LESSONS = ['u01.01', 'u01.02', 'u08.02'];
const WALK_GUARD = 400;
const failures = [];
const fail = (msg) => { if (failures.length < 30) failures.push(msg); };
const sheetOf = (html) => { const at = html.indexOf('<section class="kao-feedback-sheet'); return at < 0 ? '' : html.slice(at, html.indexOf('</section>', at) + 10); };
const seen = { correct: 0, wrong: 0, order: 0, summary: 0 };

function checkSheet(sheet, correct, where) {
  if (!sheet) { fail(`${where}: geri bildirim paneli yok`); return; }
  if (/Aslında biliyordum/.test(sheet)) fail(`${where}: "Aslında biliyordum" hâlâ var`);
  const title = (/<h3 class="kao-feedback-title">([^<]*)<\/h3>/.exec(sheet) || [])[1];
  if (correct) {
    if (/kaoUndo/.test(sheet)) fail(`${where}: doğru cevap panelinde geri alma var`);
    if (title !== 'Doğru') fail(`${where}: doğru panel başlığı "${title}"`);
    if (/<p class="kao-feedback-body[^"]*"[^>]*>Doğru(?:<| —)/.test(sheet)) fail(`${where}: gövde "Doğru" başlığını tekrar ediyor`);
  } else {
    const undo = /<button type="button" class="kao-feedback-action kao-feedback-undo" onclick="App\.kaoUndo\(\)">([^<]*)<\/button>/.exec(sheet);
    if (!undo) fail(`${where}: yanlış cevap panelinde geri alma düğmesi yok`);
    else if (undo[1] !== 'Yanlışlıkla dokundum') fail(`${where}: geri alma etiketi "${undo[1]}"`);
  }
}

// Görevleri sırayla doğru/yanlış cevaplar; her cevaptan sonra paneli denetler, sonra özeti.
function walk(seeded, lessonId) {
  const t = H.bootKao({ seeded });
  if (!seeded) H.freshUser(t);
  assert.ok(t.api.kaoLesson('start', lessonId), `${lessonId} başlamalı`);
  const st = t.ui.kaoLesson;
  let n = 0;
  for (let guard = 0; guard < WALK_GUARD; guard += 1) {
    if (st.phase === 'practice' || st.phase === 'review') {
      const item = t.ui.kaoQueue[t.ui.kaoTaskIndex];
      const task = item && t.ui.kaoTasks[item.id];
      assert.ok(task, `${lessonId}: görev bulunmalı`);
      const correct = n % 2 === 0;
      n += 1;
      if (task.kind === 'order') {
        const byOrdinal = task.choices.slice().sort((a, b) => a.ordinal - b.ordinal);
        for (const c of (correct ? byOrdinal : byOrdinal.slice().reverse())) t.api.kaoAnswer(task.id, c.choiceId);
        seen.order += 1;
      } else {
        const pick = task.choices.find((c) => c.correct === correct) || task.choices[0];
        t.api.kaoAnswer(task.id, pick.choiceId);
      }
      const panel = t.ui.kaoPanel;
      if (panel && panel.open) {
        seen[panel.correct ? 'correct' : 'wrong'] += 1;
        checkSheet(sheetOf(t.api.kaoTaskHTML(task)), panel.correct, `${seeded ? 'yerleşik' : 'yeni'} ${lessonId} ${task.id}`);
      }
      t.api.kaoContinue();
      continue;
    }
    const current = st.plan[st.at];
    if (!current || current.kind === 'summary') break;
    t.api.kaoLesson('next');
  }
  const html = t.api.kaoOverlayHTML(t.NOW);
  const at = html.indexOf('kao-lesson-summary');
  assert.ok(at > 0, `${lessonId}: özet ekranı görünmeli`);
  seen.summary += 1;
  const summary = html.slice(html.lastIndexOf('<section', at), html.indexOf('</section>', html.indexOf('id="kao-lesson-title"')));
  const count = (summary.match(/tamamlandı/g) || []).length;
  if (count !== 1) fail(`${lessonId} özet: "tamamlandı" ${count} kez`);
  const title = (/<h3 id="kao-lesson-title">([^<]*)<\/h3>/.exec(summary) || [])[1];
  if (!title || /tamamlandı/.test(title)) fail(`${lessonId} özet başlığı "${title}"`);
  if (/Aslında biliyordum/.test(html)) fail(`${lessonId} özet: "Aslında biliyordum" var`);
}

for (const seeded of [false, true]) for (const lessonId of LESSONS) walk(seeded, lessonId);
assert.ok(seen.correct > 10 && seen.wrong > 10 && seen.order > 0 && seen.summary === LESSONS.length * 2, `kapsam yetersiz: ${JSON.stringify(seen)}`);

if (failures.length) {
  console.error(failures.map((f) => '  ✗ ' + f).join('\n'));
  console.error(`K3P feedback copy: FAIL (${JSON.stringify(seen)})`);
  process.exit(1);
}
console.log(`K3P feedback copy: PASS (doğru ${seen.correct} · yanlış ${seen.wrong} panel, dizme ${seen.order}, özet ${seen.summary})`);
