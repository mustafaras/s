'use strict';
// K3P-A7 · Görünür devam: "Kaldığın yerden" (A-5, D-7). Sentetik node:vm; ağ/depo/yok, yeni veri alanı yok.
//   - Ders yarıda bırakılır, sayfa yeniden yüklenmiş gibi ui sıfırlanır.
//   - Bugün ekranındaki birincil eylem "Kaldığın yerden · Bölüm n/5" olur.
//   - Hub kartının alt satırı "Kaldığın yerden devam et" der.
//   - Derse dönünce ilerleme çubuğu kalınan bölümden dolu başlar.
//   - Bilgi yalnız mevcut path.lessons[id].resume alanından okunur.
const assert = require('node:assert/strict');
const { bootKao, freshUser, correctTaps } = require('./helpers/kao-harness');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

const curTask = (t) => { const q = t.ui.kaoQueue[t.ui.kaoTaskIndex]; return q && t.ui.kaoTasks[q.id]; };
function toTask(t) { for (let g = 0; g < 80; g += 1) { const tk = curTask(t); if (tk) return tk; if (!t.ui.kaoLesson || t.ui.kaoLesson.phase === 'lesson') { if (!t.api.kaoLesson('next')) return null; } else return null; } return null; }
function answer(t, task) {
  for (const id of correctTaps(task)) t.api.kaoAnswer(task.id, id);
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

check('K3PD-06: parça sınırı aynı çözülmemiş introya döner; tamamlanan iş yinelenmez ve tam özet öncesi ödül yok', () => {
  const t = bootKao(), q = freshUser(t), lessonId = 'u01.01';
  q.settings.dailyNew = 5; q.onboarding.minutes = 5; t.ui.kaoLatency = [60000];
  const milestonesBefore = JSON.parse(JSON.stringify(q.milestones));
  assert.equal(t.api.kaoLesson('start', lessonId), true);
  for (let guard = 0; guard < 80; guard += 1) {
    const state = t.ui.kaoLesson, item = state.plan[state.at];
    if (item.kind === 'partEnd') break;
    if (state.phase === 'practice') {
      const task = curTask(t); assert.ok(task, 'seçili görev kurulmalı'); answer(t, task); t.api.kaoContinue();
    } else assert.equal(t.api.kaoLesson('next'), true, `ilerleme ${item.kind}`);
  }
  const state = t.ui.kaoLesson, marker = state.plan[state.at], record = q.path.lessons[lessonId];
  assert.equal(marker.kind, 'partEnd', 'bütçe markerına ulaşılmalı');
  assert.equal(marker.requiredTasks, 2, 'intro + hemen gelen görev tek atomik grup olarak durmalı');
  assert.equal(record.resume.itemId, marker.resumeItemId, 'resume tam sıradaki çözülmemiş işe işaret etmeli');
  assert.equal(record.resume.lessonItemId, marker.resumeItemId);
  const answeredLemmas = record.introducedLemmas.slice();
  assert.equal(answeredLemmas.length, 2, 'iki tanış-sına grubu tamamlandı');
  assert.ok(marker.resumeItemId.startsWith('intro:'), 'sonraki iş yeni tanış kartı');
  assert.equal(record.doneAt, null, 'tamamlanmamış ders doneAt almamalı');
  assert.equal(q.daily[t.NOW.slice(0, 10)].sessionDone, undefined, 'parça bitişi günü tamamlandı saymamalı');
  assert.deepEqual(q.milestones, milestonesBefore, 'parça bitişi ödül/taş vermemeli');

  t.api.kaoLesson('exit'); reload(t);
  assert.equal(t.api.kaoOnboard(10), true, 'mevcut süre ayarı devam öncesi artırılabilmeli');
  assert.equal(q.onboarding.minutes, 10);
  assert.equal(t.api.kaoLesson('start', lessonId), true, 'aynı ders resume ile başlamalı');
  const resumed = t.ui.kaoLesson.plan;
  assert.equal(resumed[1].id, marker.resumeItemId, 'ilk iş aynı çözülmemiş görev');
  assert.equal(resumed.filter((item) => item.kind === 'intro' && answeredLemmas.includes(item.lemmaId)).length, 0, 'tamamlanan tanışlar yinelenmemeli');
  assert.equal(q.path.lessons[lessonId].doneAt, null, 'resume tam ders ödülü vermemeli');
  t.api.kaoLesson('exit');
});

check('K3PD-06: yanlış cevabın retry görevi aynı parçanın sonunda da sunulur', () => {
  const t = bootKao({ seeded: true }), q = t.data.quranLearn, lessonId = 'u01.01';
  q.onboarding.minutes = 5;
  assert.equal(t.api.kaoLesson('start', lessonId), true);
  while (t.ui.kaoLesson.phase !== 'practice') assert.equal(t.api.kaoLesson('next'), true);
  const original = t.ui.kaoQueue[t.ui.kaoTaskIndex], task = curTask(t), wrong = task.choices.find((choice) => !choice.correct);
  assert.ok(wrong, 'yanlış seçenek bulunmalı');
  assert.equal(t.api.kaoAnswer(task.id, wrong.choiceId).correct, false);
  assert.ok(t.ui.kaoQueue.some((item) => item.retry === true), 'yanlış cevap retry kuyruğa eklemeli');
  assert.equal(t.api.kaoContinue(), true);
  for (let guard = 0; guard < 20 && !t.ui.kaoQueue[t.ui.kaoTaskIndex].retry; guard += 1) {
    const current = curTask(t); assert.ok(current, 'ara görev kurulmalı'); answer(t, current); assert.equal(t.api.kaoContinue(), true);
  }
  const retryItem = t.ui.kaoQueue[t.ui.kaoTaskIndex], retry = curTask(t);
  assert.equal(retryItem.retry, true, 'retry sonraki bütçe parçasına sessizce atılmamalı');
  assert.equal(retry.cardId, task.cardId, 'aynı başarısız kart yeniden denenmeli');
  assert.equal(retry.retry, true);
  answer(t, retry); assert.equal(t.api.kaoContinue(), true, 'retry yanıtından sonra plan sürmeli');
  assert.equal(q.path.lessons[lessonId].doneAt, null, 'retry ve parça sonu tam ders ödülü vermemeli');
  t.api.kaoLesson('exit');
});

console.log(`test_k3p_resume: PASS (${passed} kontrol — parça resume, retry, tam ders ödülü)`);
