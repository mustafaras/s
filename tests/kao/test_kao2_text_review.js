'use strict';

// KAO2-17 · K-4 L0 otomatik kapılar. Sentetik VM; tarayıcı, ağ, gerçek veri yok.
// Kapsam: archive/kuran-ogreniyorum-v2/UYGULAMA-PROMPTLARI.md KAO2-17 (a)–(f).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

// (c) Yasak ifade listesi — dosya başında sabit; hüküm/fetva dili, kaynaksız nakil.
const FORBIDDEN = [
  'haramdır', 'helâldır', 'helaldır', 'caizdir', 'caiz değildir', 'farzdır', 'vaciptir',
  'sünnettir', 'mekruhtur', 'müstehaptır', 'günahtır', 'sevaptır', 'bidattir',
  'fetva', 'hüküm budur', 'kesinlikle doğrudur', 'mezhebe göre', 'hanefî', 'şâfiî', 'malikî', 'hanbelî'
];
// (b) Diyanet imlâsı — doğru yazım; yanlış varyantlar taranır.
const ORTHOGRAPHY = [
  ['Kur\'an', ['Kuran', 'Kur`an', "Kur’an'ı" ]],
  ['Fâtiha', ['Fatiha', 'Fatihâ']],
  ['Besmele', ['Bismillah', 'Besmele\'yi']],
  ['Rahmân', ['Rahman']],
  ['Rahîm', ['Rahim']],
  ['Müslüman', ['Musluman']],
  ['âyet', ['ayet']],
  ['sûre', ['sure']]
];
const RELIGIOUS = /Kur|Fâtiha|Fatiha|namaz|Namaz|âyet|sûre|Peygamber|Allah|Rab|Besmele|salât|dua|âhiret|cennet|cehennem|melek|vahiy|Kâbe|kıble/i;

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const box = { window: {}, Date };
vm.createContext(box);
for (const n of ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1']) {
  vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), box, { filename: n });
}
for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
  vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), box, { filename: f });
}
const W = box.window;
const CURRICULUM = W.QuranCurriculumV2;
const data = { settings: {}, days: {}, quranLearn: null };
const ui = {};
const api = W.SeymaQuranLearn;
assert.equal(api.registerQuranLearn({
  data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-29',
  esc, icon: () => '', getDay: () => ({})
}), true);
api.ensureQuranLearn(data);

const units = CURRICULUM.units;
const lessons = units.flatMap((u) => u.lessons);
const unitText = (u) => [u.title, u.promise, u.why].filter((v) => typeof v === 'string' && v);
const lessonText = (l) => [l.title, l.goal].filter((v) => typeof v === 'string' && v);
const LEVELS = ['draft', 'sourced', 'expert'];

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };
const html = () => api.kaoOverlayHTML();

check('(a) dinî bağlam içeren her metinde sources var', () => {
  const texts = [];
  units.forEach((u) => { if (RELIGIOUS.test(unitText(u).join(' '))) texts.push({ id: `u${u.id}`, review: u.review, why: u.why }); });
  lessons.forEach((l) => { if (RELIGIOUS.test(lessonText(l).join(' '))) texts.push({ id: l.id, review: l.review, why: null }); });
  for (const text of texts) {
    assert.ok(text.review && LEVELS.includes(text.review.level), `${text.id}: review kaydı geçerli`);
    if (text.why) assert.ok(Array.isArray(text.review.sources) && text.review.sources.length > 0, `${text.id}: dinî bağlamlı 'why' kaynak taşır`);
  }
});

check('(b) Diyanet imlâsı: yanlış varyantlar metinlerde geçmez', () => {
  const all = [...units.flatMap(unitText), ...lessons.flatMap(lessonText)];
  for (const [correct, wrongs] of ORTHOGRAPHY) {
    for (const wrong of wrongs) {
      const hit = all.find((text) => new RegExp(`(^|[^\\p{L}])${wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'u').test(text));
      assert.equal(hit, undefined, `yanlış imlâ "${wrong}" bulundu (doğrusu "${correct}"): ${hit || ''}`);
    }
  }
});

check('(c) yasak ifade listesi: hüküm/fetva dili ve kaynaksız nakil yok', () => {
  const all = [...units.flatMap(unitText), ...lessons.flatMap(lessonText)];
  for (const banned of FORBIDDEN) {
    const hit = all.find((text) => String(text).toLocaleLowerCase('tr').includes(banned));
    assert.equal(hit, undefined, `yasak ifade "${banned}": ${hit || ''}`);
  }
});

check('(d) elle Arapça yok: metinler Arapça karakter taşımaz', () => {
  const all = [...units.flatMap(unitText), ...lessons.flatMap(lessonText)];
  for (const text of all) {
    assert.doesNotMatch(String(text), /[\u0600-\u06ff]/, `metinde elle Arapça var: ${text}`);
  }
  const src = fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/content/texts.tr.json'), 'utf8');
  assert.doesNotMatch(src, /[\u0600-\u06ff]/, 'metin kaynağı Arapça karakter taşımaz');
});

check('(e) her metinde review kaydı; by yalnız rol kodu', () => {
  for (const u of units) {
    assert.ok(u.review && LEVELS.includes(u.review.level), `u${u.id}: review.level`);
    if (u.review.by !== undefined) assert.ok(['owner', 'expert'].includes(u.review.by), `u${u.id}: rol kodu`);
  }
  for (const l of lessons) {
    assert.ok(l.review && LEVELS.includes(l.review.level), `${l.id}: review.level`);
    if (l.review.by !== undefined) assert.ok(['owner', 'expert'].includes(l.review.by), `${l.id}: rol kodu`);
  }
  for (const lesson of CURRICULUM.s0.lessons) assert.ok(lesson.review && LEVELS.includes(lesson.review.level), `${lesson.id}: review.level`);
});

check('(f) [KAYNAK?] işareti kalmamış', () => {
  const all = [...units.flatMap(unitText), ...lessons.flatMap(lessonText)];
  for (const text of all) assert.doesNotMatch(String(text), /\[KAYNAK\?\]/, `metinde [KAYNAK?] kaldı: ${text}`);
  const src = fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/content/texts.tr.json'), 'utf8');
  assert.doesNotMatch(src, /\[KAYNAK\?\]/, 'metin kaynağında [KAYNAK?] kaldı');
});

check('onaylı metinler render\'da görünür; draft metin gizlenir', () => {
  assert.equal(api.kaoNav('units'), true);
  const listHtml = html();
  for (const u of units) {
    if (api.kaoReviewLevel(u.review) === 'sourced') {
      assert.ok(listHtml.includes(esc(u.promise)), `Yol: onaylı vaat görünür (u${u.id})`);
    } else {
      assert.equal(listHtml.includes(esc(u.promise)), false, `Yol: draft vaat gizli (u${u.id})`);
    }
  }
  // draft metin güvenli başlığa düşer.
  const draftUnit = { id: 9, review: { level: 'draft' }, title: 'Gizli', promise: 'Gizli vaat' };
  assert.equal(api.kaoUnitTitle(draftUnit), 'Ünite 9', 'draft ünite güvenli başlığa düşer');
  assert.equal(api.kaoReviewLevel({ level: 'sourced' }), 'sourced');
  assert.equal(api.kaoReviewLevel({}), 'draft');
  assert.equal(api.kaoTextSourceLabel({ level: 'draft' }), '', 'draft kaynak satırı üretmez');
  assert.match(api.kaoTextSourceLabel(units[0].review), /^Kaynak: /, 'onaylı metin kaynak satırı taşır');
});

check('sourced/expert görünür; dinî bağlamlı olanda "Kaynak:" satırı var', () => {
  const sourced = {
    id: 1, level: 1, title: 'Fâtiha', promise: 'Her namazda okuduğun Fâtiha’yı anlayacaksın.',
    why: 'Namazda her gün okunur.', conceptIds: ['g0_5'], anchor: ['prayer:fatiha'],
    review: { level: 'sourced', by: 'owner', at: '2026-10-05', sources: ['diyanet-meal-fatiha'] },
    lessons: CURRICULUM.units[0].lessons.map((l) => Object.assign({}, l, { review: { level: 'sourced', by: 'owner', at: '2026-10-05' } }))
  };
  assert.ok(sourced.review.sources.length > 0);
  assert.equal(RELIGIOUS.test(sourced.why), true);
  const label = api.kaoTextSourceLabel ? api.kaoTextSourceLabel(sourced.review) : '';
  assert.match(String(label), /Kaynak:/, 'dinî bağlamlı sourced metinde Kaynak satırı üretilir');
});

check('inceleme sayfası ve metin kaynağı mevcut', () => {
  assert.ok(fs.existsSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/content/texts.tr.json')), 'texts.tr.json var');
  assert.ok(fs.existsSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md')), 'INCELEME-KAO2-17.md var');
  const sheet = fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md'), 'utf8');
  for (const u of units) assert.ok(sheet.includes(`Ünite ${u.id}`), `inceleme sayfası: Ünite ${u.id}`);
  assert.ok(sheet.includes('- [ ]'), 'onay kutuları var');
});

console.log(`KAO2-17 text review: PASS (${passed} kontrol)`);
