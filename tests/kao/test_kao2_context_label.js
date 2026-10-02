'use strict';

// KAO2-FIX ek iş · Ders oynatıcı bağlam satırı: draft ünite başlığı güvenli başlığa ("Ünite N") düşer;
// satır "Ünite N · Ünite N · Ders M / K" gibi çift ön ek göstermemeli. Sentetik VM; ağ ve gerçek veri yok.
const assert = require('node:assert/strict');
const { bootKao, freshUser, text } = require('./helpers/kao-harness');

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

const contextOf = (html) => {
  const m = /<p class="kao-lesson-context">([^<]*)<\/p>/.exec(html);
  return m ? text(m[1]) : '';
};

const t = bootKao();
freshUser(t);
const curriculum = t.win.QuranCurriculumV2;
const draftUnit = curriculum.units.find((u) => u.review && u.review.level === 'draft');
const sourcedUnit = curriculum.units.find((u) => u.review && u.review.level === 'sourced');

check('draft ünitede bağlam satırı "Ünite N" ön ekini yalnız bir kez taşır', () => {
  assert.ok(draftUnit, 'draft ünite bulunamadı');
  const lesson = draftUnit.lessons[0];
  assert.equal(t.api.kaoLesson('start', lesson.id), true);
  const line = contextOf(t.api.kaoOverlayHTML(t.NOW));
  const count = (line.match(/Ünite/g) || []).length;
  assert.equal(count, 1, `çift ön ek: "${line}"`);
  assert.match(line, new RegExp(`^Ünite ${draftUnit.id} · Ders 1 / ${draftUnit.lessons.length}$`));
});

check('yayımlanmış (sourced) ünitede başlık bağlam satırında kalır', () => {
  assert.ok(sourcedUnit, 'sourced ünite bulunamadı');
  t.ui.kaoLesson = null; t.ui.kaoOpen = false;
  freshUser(t);
  assert.equal(t.api.kaoLesson('start', sourcedUnit.lessons[0].id), true);
  const line = contextOf(t.api.kaoOverlayHTML(t.NOW));
  assert.ok(line.includes(sourcedUnit.title), `başlık kayıp: "${line}"`);
  assert.equal((line.match(/Ünite/g) || []).length, 1, `çift ön ek: "${line}"`);
});

console.log(`\nkao2 context label: ${passed} PASS`);
