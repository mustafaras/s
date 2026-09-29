'use strict';

// KAO2-16: taş koşulları (07 §6). Sentetik VM; tarayıcı, ağ, gerçek veri yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NOW = '2026-10-05T10:00:00.000Z';

function boot() {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const n of CONTENT) vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), box, { filename: n });
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), box, { filename: f });
  }
  const data = { settings: {}, days: {}, quranLearn: null };
  const ui = {};
  const api = box.window.SeymaQuranLearn;
  assert.equal(api.registerQuranLearn({
    data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-10-05',
    esc, icon: () => '', getDay: () => ({})
  }), true);
  api.ensureQuranLearn(data);
  return { api, box, data, ui, q: data.quranLearn };
}

const SEED = boot();
const LEX = SEED.box.window.QuranLexiconV1;
const SHORTS = SEED.box.window.QuranShortSurahsV1;
const CURRICULUM = SEED.box.window.QuranCurriculumV2;

// prayerTexts, sözlükte doğrulanmış lemma kimliklerini taşır.
const prayerLemmaIds = (id) => {
  const text = SHORTS.prayerTexts.find((item) => item.id === id);
  assert.ok(text, `namaz metni var: ${id}`);
  return Array.from(new Set(text.words.map((word) => word.lemmaId).filter((lemmaId) => lemmaId && LEX.byId(lemmaId) && LEX.byId(lemmaId).verified === true)));
};
const allPrayerLemmaIds = () => Array.from(new Set(SHORTS.prayerTexts.flatMap((text) => text.words.map((w) => w.lemmaId).filter((id) => id && LEX.byId(id) && LEX.byId(id).verified === true))));

const settled = (s) => ({ state: 'review', s, reps: 5, due: '2027-01-01T00:00:00.000Z', r: '2026-09-01T00:00:00.000Z' });
const forward = (q, ids, s) => { ids.forEach((id) => { q.cards[`w:${id}:ar>tr`] = settled(s); }); };
const earned = (api, data) => Array.from(api.kaoMilestoneCheck(data, NOW));
const has = (list, key) => list.includes(key);
const unitKey = (id) => `u${id}`;
const completeUnit = (q, unitId) => { q.path = q.path || {}; q.path.units = q.path.units || {}; q.path.units[String(unitId)] = { masteryAt: '2026-10-01T00:00:00.000Z' }; };

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

check('fâtiha taşı: yalnız Fâtiha lemmalarının tamamı ar>tr review ∧ s≥7 olunca', () => {
  const { api, data, q } = boot();
  const ids = prayerLemmaIds('fatiha');
  assert.ok(ids.length >= 20, `Fâtiha lemmaları: ${ids.length}`);
  forward(q, ids, 7);
  q.cards[`w:${ids[0]}:ar>tr`].s = 6.9;
  assert.equal(has(earned(api, data), 'fatiha'), false, 'biri eşiğin altındayken kazanılmaz');
  q.cards[`w:${ids[0]}:ar>tr`].s = 7;
  assert.equal(has(earned(api, data), 'fatiha'), true, 'hepsi eşikte kazanılır');
  // Yalnız sıklık dilimi (eski koşul) FATİHA taşını vermemeli.
  const { api: api2, data: data2, q: q2 } = boot();
  const slice = LEX.lemmas.slice(0, Math.floor(LEX.lemmas.length / 12));
  forward(q2, slice.map((l) => l.id), 30);
  assert.equal(has(earned(api2, data2), 'fatiha'), false, 'eski sıklık dilimi koşulu artık yetmez (03 §2)');
});

check('namaz taşı: tüm namaz metinlerinin lemmaları eşikte iken', () => {
  const { api, data, q } = boot();
  const all = allPrayerLemmaIds();
  assert.ok(all.length >= 30, `namaz lemmaları: ${all.length}`);
  forward(q, all, 7);
  q.cards[`w:${all[all.length - 1]}:ar>tr`].s = 6.9;
  assert.equal(has(earned(api, data), 'namaz'), false, 'biri eksikken kazanılmaz');
  q.cards[`w:${all[all.length - 1]}:ar>tr`].s = 7;
  assert.equal(has(earned(api, data), 'namaz'), true, 'tamamı eşikte kazanılır');
});

check('besmele taşı: S0.12 tamam ya da yerleştirme ≥7/8', () => {
  const viaLesson = boot();
  assert.equal(has(earned(viaLesson.api, viaLesson.data), 'besmele'), false, 'başlangıçta yok');
  viaLesson.q.path.lessons['s0.12'] = { startedAt: '2026-09-25T10:00:00.000Z', doneAt: '2026-09-25T10:05:00.000Z', score: null };
  assert.equal(has(earned(viaLesson.api, viaLesson.data), 'besmele'), true, 'S0.12 tamamlanınca kazanılır');

  const viaPlacement = boot();
  viaPlacement.q.onboarding.placement = { reading: 6, readingTotal: 8, listening: 0, listeningTotal: 4, audioDeferred: false, missing: [], at: '2026-09-20T10:00:00.000Z' };
  assert.equal(has(earned(viaPlacement.api, viaPlacement.data), 'besmele'), false, '6/8 yetmez');
  viaPlacement.q.onboarding.placement.reading = 7;
  assert.equal(has(earned(viaPlacement.api, viaPlacement.data), 'besmele'), true, '7/8 yeter');
});

check('ünite taşları: ustalık kontrolü tamamlanınca u1…u12', () => {
  const { api, data, q } = boot();
  assert.equal(CURRICULUM.units.length, 12, '12 ünite');
  for (const unit of CURRICULUM.units) {
    assert.equal(has(earned(api, data), unitKey(unit.id)), false, `başlangıçta yok: ${unit.id}`);
    completeUnit(q, unit.id);
    assert.equal(has(earned(api, data), unitKey(unit.id)), true, `ustalıkta kazanılır: ${unit.id}`);
  }
  assert.deepEqual(Array.from(CURRICULUM.units, (u) => `u${u.id}`), Array.from({ length: 12 }, (_, i) => `u${i + 1}`), 'anahtarlar u1…u12');
  const src = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');
  assert.match(src, /KAO_MILESTONE_CORE=\{besmele:true/, 'taş çekirdek sözlüğü besmele içerir');
});

check('kapsam taşları korunur; etiketler taş sözlüğünde', () => {
  const { api, data, q } = boot();
  const byFreq = LEX.lemmas.slice().sort((a, b) => b.freq - a.freq);
  const durable = { state: 'review', s: 30, reps: 8, due: '2027-01-01T00:00:00.000Z', r: '2026-09-01T00:00:00.000Z' };
  const known = (count) => byFreq.slice(0, count).forEach((l) => { q.cards[`w:${l.id}:ar>tr`] = Object.assign({}, durable); q.cards[`w:${l.id}:tr>ar`] = Object.assign({}, durable); });
  const countFor = (ratio) => { let sum = 0; for (let i = 0; i < byFreq.length; i += 1) { sum += byFreq[i].freq; if (sum / 77430 >= ratio) return i + 1; } return Infinity; };
  known(countFor(0.5));
  assert.equal(has(earned(api, data), 'half'), true, 'half kapsam 0,50');
  assert.equal(has(earned(api, data), 'twoThirds'), false, 'twoThirds henüz yok');
  known(countFor(0.68));
  assert.equal(has(earned(api, data), 'twoThirds'), true, 'twoThirds kapsam 0,68');
  known(countFor(0.75));
  assert.equal(has(earned(api, data), 'eighty'), true, 'eighty kapsam 0,75');
});

check('etiketler: besmele ve ünite taşları okunur, u1 ünite adını taşır', () => {
  const { api, q } = boot();
  const labels = api.kaoMilestoneLabels();
  assert.match(labels.besmele, /Besmele/, 'besmele etiketi var');
  assert.match(labels.namaz, /Namaz/, 'namaz etiketi var');
  const first = CURRICULUM.units[0];
  // KAO2-17: draft başlık gizlenir; taş etiketi güvenli başlığı kullanır.
  assert.equal(labels.u1, api.kaoUnitTitle(first) + ' ünitesini bitirdim', 'u1 etiketi güncel ünite başlığını taşır');
  assert.equal(Object.keys(labels).filter((k) => /^u\d+$/.test(k)).length, 12, '12 ünite etiketi');
  completeUnit(q, 1);
  q.milestones.u1 = NOW;
  assert.equal(api.kaoMilestoneLabel(q), labels.u1, 'kazanılan taşın etiketi okunur');
});

check('eski koşulla kazanılmış taş silinmez; yeni anahtar ayrıca hesaplanır', () => {
  const { api, data, q } = boot();
  q.milestones = { fatiha: '2026-09-01T00:00:00.000Z', half: '2026-09-02T00:00:00.000Z' };
  const before = JSON.stringify(q.milestones);
  const list = earned(api, data);
  assert.equal(has(list, 'fatiha'), false, 'kazanılmış fatiha yeniden aday olmaz');
  assert.equal(q.milestones.fatiha, '2026-09-01T00:00:00.000Z', 'eski kayıt korunur');
  assert.equal(q.milestones.half, '2026-09-02T00:00:00.000Z', 'kapsam kaydı korunur');
  completeUnit(q, 1);
  assert.equal(has(earned(api, data), 'u1'), true, 'legacy fatiha u1 taşını engellemez (ayrı anahtar)');
  assert.equal(JSON.stringify({ ...JSON.parse(before), u1: q.milestones.u1 }), JSON.stringify(q.milestones), 'yalnız yeni anahtar eklenir');
});

check('P10: taş yalnız doğrulanmış durumdan türesin, uydurma kazanım yok', () => {
  const { api, data, q } = boot();
  const ids = prayerLemmaIds('fatiha');
  forward(q, ids, 7);
  forward(q, allPrayerLemmaIds().filter((id) => !ids.includes(id)), 7);
  completeUnit(q, 1);
  q.path.lessons['s0.12'] = { doneAt: '2026-09-25T10:00:00.000Z' };
  const list = earned(api, data);
  assert.deepEqual(list.slice().sort(), ['besmele', 'fatiha', 'namaz', 'u1'].sort(), 'yalnız gerçek koşullar kazanılır');
  assert.equal(has(list, 'u2'), false, 'tamamlanmamış ünite taşı verilmez');
  assert.equal(has(list, 'half'), false, 'kapsam yetmezken kapsam taşı verilmez');
});

console.log(`KAO2-16 milestones: PASS (${passed} kontrol)`);
