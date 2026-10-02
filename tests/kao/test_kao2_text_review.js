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
    if (u.review.by !== undefined && !(u.review.by === null && u.review.level === 'draft')) assert.ok(['owner', 'expert'].includes(u.review.by), `u${u.id}: rol kodu (null yalnız draft)`);
  }
  for (const l of lessons) {
    assert.ok(l.review && LEVELS.includes(l.review.level), `${l.id}: review.level`);
    if (l.review.by !== undefined && !(l.review.by === null && l.review.level === 'draft')) assert.ok(['owner', 'expert'].includes(l.review.by), `${l.id}: rol kodu (null yalnız draft)`);
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
  const approvedUnit = units.find((u) => api.kaoReviewLevel(u.review) === 'sourced' && Array.isArray(u.review.sources) && u.review.sources.length);
  assert.ok(approvedUnit, 'kaynaklı onaylı en az bir ünite metni var');
  assert.match(api.kaoTextSourceLabel(approvedUnit.review), /^Kaynak: /, 'onaylı metin kaynak satırı taşır');
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

// K2F-20/21 (KR-4): kelime kümesi değişen bir dersin eski (onaylı) metni geçersizdir. Ders ya `draft` olmalı ya da
// değişiklikten SONRA bir sahibin açık onayıyla (by + at ≥ 2026-10-02) `sourced` yapılmış olmalı.
check('kelime kümesi değişen her ders draft ya da değişiklik sonrası açık onaylı', () => {
  const before = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/content/curriculum.before-k2f20.json'), 'utf8')).lessons;
  let changed = 0;
  for (const lesson of lessons) {
    const was = before[lesson.id] || [];
    const now = Array.from(lesson.lemmaIds);
    const differs = was.length !== now.length || now.some((id) => !was.includes(id));
    if (!differs) continue;
    changed += 1;
    const ok = api.kaoReviewLevel(lesson.review) === 'draft' || (lesson.review.by && String(lesson.review.at || '') >= '2026-10-02');
    assert.ok(ok, `${lesson.id}: kelime kümesi değişti ama eski onaylı metin duruyor`);
  }
  assert.ok(changed >= 26, `değişen ders sayısı ${changed}`);
});

// K2F-21 (KR-4): draft metin HİÇBİR ekranda görünmez; yerine güvenli başlık ("Ünite N · Ders M") yazar.
// Bağımsız denetimde 35 draft dersin hepsinde ünite ekranında ve ders oynatıcıda ham başlığın sızdığı bulundu.
check('draft ders başlığı/hedefi ünite ekranında, ders oynatıcıda ve hub kartında SIZMAZ (tüm draft dersler)', () => {
  const draftLessons = lessons.filter((l) => api.kaoReviewLevel(l.review) === 'draft');
  assert.ok(draftLessons.length >= 35, `draft ders sayısı ${draftLessons.length}`);
  const escText = (v) => esc(String(v));
  for (const lesson of draftLessons) {
    const m = /^u0*(\d+)\.0*(\d+)$/.exec(lesson.id);
    const safe = `Ünite ${m[1]} · Ders ${m[2]}`;
    const unit = units.find((u) => u.lessons.includes(lesson));
    // 1) ünite ekranı
    assert.equal(api.kaoNav('unit', unit.id), true);
    const unitHtml = html();
    // Ders adımı <li> bloğu: kavram başlığı gibi başka bölümler ders başlığıyla aynı sözcükleri taşıyabilir.
    const step = unitHtml.split('<li class="kao-unit-step').find((part) => part.includes(safe));
    assert.ok(step, `${lesson.id}: ünite ekranında güvenli başlık "${safe}" yok`);
    assert.equal(step.includes(escText(lesson.title)), false, `${lesson.id}: ünite ekranında ham başlık sızdı`);
    if (lesson.goal) assert.equal(step.includes(escText(lesson.goal)), false, `${lesson.id}: ünite ekranında ham hedef sızdı`);
    // 2) ders oynatıcı (tüm önceki dersler tamamlanmış sayılır; ders gerçek handler ile başlatılır)
    const q = api.ensureQuranLearn(data);
    q.onboarding.doneAt = '2026-09-20T00:00:00.000Z'; q.onboarding.start = 'level1';
    q.path = { lessons: {}, units: {} };
    for (const prior of lessons) { if (prior.id === lesson.id) break; q.path.lessons[prior.id] = { startedAt: '2026-09-20T10:00:00.000Z', doneAt: '2026-09-20T10:10:00.000Z', introducedLemmas: prior.lemmaIds.slice() }; }
    for (const u of units) if (u.id < unit.id) q.path.units[String(u.id)] = { masteryAt: '2026-09-21T10:00:00.000Z', masteryScore: 1, attempts: 1, lastAttemptAt: '2026-09-21T10:00:00.000Z', repair: null, skippedAt: null };
    ui.kaoStack = []; ui.kaoView = 'home'; ui.kaoOpen = true; ui.kaoLesson = null;
    assert.equal(api.kaoLesson('start', lesson.id), true, `${lesson.id}: başlamadı`);
    const playerHtml = html();
    assert.equal(playerHtml.includes(escText(lesson.title)), false, `${lesson.id}: ders oynatıcıda ham başlık sızdı`);
    if (lesson.goal) assert.equal(playerHtml.includes(escText(lesson.goal)), false, `${lesson.id}: ders oynatıcıda ham hedef sızdı`);
    assert.ok(playerHtml.includes(safe), `${lesson.id}: ders oynatıcıda güvenli başlık yok`);
    ui.kaoLesson = null;
    // 3) hub kartı ("Sıradaki: …"): sıradaki ders bu draft ders olduğunda ham başlık görünmez
    const hubHtml = api.kaoHubCardHTML();
    assert.equal(hubHtml.includes(escText(lesson.title)), false, `${lesson.id}: hub kartında ham başlık sızdı`);
    if (hubHtml.includes('Sıradaki:')) assert.ok(hubHtml.includes(safe), `${lesson.id}: hub kartında güvenli başlık yok`);
  }
});

console.log(`KAO2-17 text review: PASS (${passed} kontrol)`);
