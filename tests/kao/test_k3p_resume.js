'use strict';
// K3P-A7 · Görünür devam: "Kaldığın yerden" (A-5, D-7). Sentetik node:vm; ağ/depo/yok, yeni veri alanı yok.
//   - Ders yarıda bırakılır, sayfa yeniden yüklenmiş gibi ui sıfırlanır.
//   - Bugün ekranındaki birincil eylem "Kaldığın yerden · Bölüm n/5" olur.
//   - Hub kartının alt satırı "Kaldığın yerden devam et" der.
//   - Derse dönünce ilerleme çubuğu kalınan bölümden dolu başlar.
//   - Bilgi yalnız mevcut path.lessons[id].resume alanından okunur.
const assert = require('node:assert/strict');
const { bootKao } = require('./helpers/kao-harness');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

const curTask = (t) => { const q = t.ui.kaoQueue[t.ui.kaoTaskIndex]; return q && t.ui.kaoTasks[q.id]; };
function toTask(t) { for (let g = 0; g < 80; g += 1) { const tk = curTask(t); if (tk) return tk; if (!t.ui.kaoLesson || t.ui.kaoLesson.phase === 'lesson') { if (!t.api.kaoLesson('next')) return null; } else return null; } return null; }
function answer(t, task) {
  if (task.kind === 'order') task.choices.slice().sort((a, b) => a.ordinal - b.ordinal).forEach((c) => t.api.kaoAnswer(task.id, c.choiceId));
  else t.api.kaoAnswer(task.id, (task.choices.find((c) => c.correct) || task.choices[0]).choiceId);
}
// Sayfa yeniden yüklenmiş gibi: ui tamamen sıfırlanır, yalnız kalıcı data kalır.
function reload(t) { for (const k of Object.keys(t.ui)) delete t.ui[k]; Object.assign(t.ui, { kaoOpen: false, kaoView: 'home', kaoStack: [] }); t.api.kaoOpen('home'); }
// `answers` görevi cevaplayıp dersi yarıda bırakır.
function leaveMidway(t, lessonId, answers) {
  t.ui.kaoStack = []; t.api.kaoOpen('home');
  assert.ok(t.api.kaoLesson('start', lessonId), 'ders başlamalı');
  for (let i = 0; i < answers; i += 1) { const tk = toTask(t); if (!tk) break; answer(t, tk); t.api.kaoContinue(); }
  t.api.kaoLesson('exit');
  return t.data.quranLearn.path.lessons[lessonId].resume;
}

check('yarım kalan ders: Bugün birincil eylemi "Kaldığın yerden · Bölüm n/5"', () => {
  const t = bootKao({ seeded: true });
  const resume = leaveMidway(t, 'u01.01', 3);
  assert.ok(resume && resume.itemId, 'resume yazılmalı (mevcut alan)');
  reload(t);
  const html = t.api.kaoOverlayHTML(t.NOW);
  assert.match(html, /Kaldığın yerden · Bölüm [1-5]\/5/, 'birincil eylem etiketi');
  assert.ok(!/Kaldığın yerden · Bölüm 1\/5/.test(html), 'ilk bölümde değil (yarıda kalınan bölüm)');
});

check('hub kartı alt satırı "Kaldığın yerden devam et" der', () => {
  const t = bootKao({ seeded: true });
  leaveMidway(t, 'u01.01', 3);
  reload(t);
  const hub = t.api.kaoHubCardHTML();
  assert.match(hub, /Kaldığın yerden devam et/, 'hub alt satırı');
});

check('derse dönünce ilerleme çubuğu kalınan bölümden dolu başlar', () => {
  const t = bootKao({ seeded: true });
  leaveMidway(t, 'u01.01', 3);
  reload(t);
  t.api.kaoLesson('start', 'u01.01');
  const section = Number((/data-lesson-section="(\d)"/.exec(t.api.kaoOverlayHTML(t.NOW)) || [])[1] || 0);
  assert.ok(section >= 2, `kalınan bölüm ≥2 (ölçülen ${section})`);
  t.api.kaoLesson('exit');
});

check('bilgi yalnız mevcut path.lessons[id].resume alanından okunur; yeni veri alanı yok', () => {
  const t = bootKao({ seeded: true });
  leaveMidway(t, 'u01.01', 3);
  const record = t.data.quranLearn.path.lessons['u01.01'];
  assert.deepEqual(Object.keys(record).sort(), ['doneAt', 'resume', 'score', 'startedAt'].sort(), 'ders kaydı yeni alan kazanmaz');
  assert.deepEqual(Object.keys(record.resume).sort(), ['itemId', 'lessonItemId', 'phase'].sort(), 'resume şeması sabit');
  reload(t);
  // data'da yeni uyarlanır/devam alanı yok.
  const dump = JSON.stringify(t.data);
  for (const banned of ['kaoResume', 'resumeSection', 'kaoBölüm']) assert.equal(dump.includes(banned), false, `${banned} data'ya yazılmamalı`);
});

check('yarım kalan ders yokken birincil eylem "Kaldığın yerden" demez', () => {
  const t = bootKao({ seeded: true });
  t.ui.kaoStack = []; t.api.kaoOpen('home');
  const html = t.api.kaoOverlayHTML(t.NOW);
  assert.equal(/Kaldığın yerden · Bölüm/.test(html), false, 'temiz kullanıcıda devam ipucu yok');
});

console.log(`test_k3p_resume: PASS (${passed} kontrol — birincil eylem, hub alt satırı, kalınan bölüm, yalnız resume alanı)`);
