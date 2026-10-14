'use strict';

// KAO2-09: Bugün ekranı (S-02). Sentetik VM, sahte saat; ağ, tarayıcı ya da gerçek veri yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const INSTANT = '2026-09-28T09:00:00.000Z';
class FixedDate extends Date {
  constructor(...args) { super(...(args.length ? args : [INSTANT])); }
  static now() { return Date.parse(INSTANT); }
}
const box = { window: {}, Date: FixedDate };
vm.createContext(box);
for (const name of ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1']) {
  const file = `app/content/${name}.js`;
  vm.runInContext(fs.readFileSync(path.join(repoRoot, file), 'utf8'), box, { filename: file });
}
for (const file of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
  vm.runInContext(fs.readFileSync(path.join(repoRoot, file), 'utf8'), box, { filename: file });
}
const api = box.window.SeymaQuranLearn;
const flow = box.window.SeymaQuranLearnFlow;
const cur = box.window.QuranCurriculumV2;
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let data = {};
const ui = { kaoOpen: true, kaoView: 'home' };
let targetBed = null;
assert.equal(api.registerQuranLearn({
  data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-28', esc,
  icon: (name) => `<i data-icon="${name}"></i>`, getDay: () => ({})
}), true);
api.registerCaffeineTargetBed(() => targetBed);

const ISO = '2026-09-20T10:00:00.000Z';
const unit1 = cur.units[0];
const unit1Words = unit1.lessons.reduce((n, l) => n + l.lemmaIds.length, 0);
function reset(onboarding = { doneAt: ISO, start: 'level1' }) {
  data = { settings: {}, quranLearn: api.emptyQuranLearn() };
  const q = api.ensureQuranLearn(data);
  Object.assign(q.onboarding, onboarding);
  targetBed = null;
  return q;
}
const home = () => api.kaoHomeHTML(INSTANT);
const tagsWith = (html, cls) => (html.match(/<[^>]+>/g) || []).filter((t) => ((t.match(/\bclass="([^"]*)"/) || [])[1] || '').split(/\s+/).includes(cls));
const onclickOf = (tag) => ((tag.match(/onclick="([^"]*)"/) || [])[1] || '');
function primaryAction(html) {
  const primary = tagsWith(html, 'kao-primary');
  assert.equal(primary.length, 1, 'ekranda tek .kao-primary');
  return onclickOf(primary[0]);
}
function lessonAction(step) {
  const id = typeof step.param === 'number' ? String(step.param) : `&quot;${step.param}&quot;`;
  return `App.kaoLesson(&quot;start&quot;,${id})`;
}
function settle(q, lemmaIds) {
  // kaoKnownLemmaSet: iki yönde kalıcı (s≥21) kart = bilinen kelime.
  lemmaIds.forEach((id) => { for (const dir of ['ar>tr', 'tr>ar']) q.cards[`w:${id}:${dir}`] = { reps: 3, state: 'review', s: 25, d: 5, due: '2026-10-20T09:00:00.000Z' }; });
}

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

// K3P-12 (§3.1): Bugün yeni yapı — Tezhip an kartı (tamamı tek eylem) + hedef eğimi + tek birincil eylem + haftalık hedef + kısayollar.
const todayScreen = (html) => (String(html).match(/<main class="kao-today-screen"[\s\S]*?<\/main>/) || [''])[0];
const todayButtons = (html) => (todayScreen(html).match(/<button/g) || []).length;

check('(a) Bugün ekranı yapısı: Tezhip an kartı + hedef eğimi + haftalık hedef + 3 kısayol', () => {
  reset();
  const html = home();
  assert.match(html, /class="kao-today-hero kao-moment"/, 'an kartı (kao-moment) var');
  assert.match(html, /<figure class="kao-tezhip">[\s\S]*?<figcaption class="kao-tezhip-title">Fâtiha<\/figcaption>/, 'an kartı ünitenin çapa sûresini (Fâtiha) taşır');
  assert.match(html, /class="kao-today-goal">\d+ kelime sonra Fâtiha tamam</, 'hedef eğimi cümlesi');
  assert.match(html, /Bu hafta <strong>0 \/ 5<\/strong> gün/, 'haftalık hedef 5 günden');
  assert.doesNotMatch(html, /seri|kaybettin|caydın/i, 'ceza dili yok (K-H)');
});

check('(b) tek birincil eylem ve nextStep eşlemesi', () => {
  reset();
  let step = api.kaoNextStep(new FixedDate());
  assert.equal(step.kind, 'daily');
  assert.equal(primaryAction(home()), lessonAction(step), 'daily → ders oynatıcı');
  reset({ doneAt: null, start: null });
  assert.equal(api.kaoNextStep(new FixedDate()).kind, 'onboarding');
  assert.equal(primaryAction(home()), 'App.kaoOnboard(&quot;start&quot;)', 'onboarding → KAO2-11 ilk açılış');
  let q = reset({ doneAt: ISO, start: 's0' });
  step = api.kaoNextStep(new FixedDate());
  assert.equal(step.kind, 's0-lesson');
  assert.equal(primaryAction(home()), 'App.kaoS0(&quot;start&quot;,&quot;s0.01&quot;)', 's0 → Seviye 0 yüzeyi (K2F-15)');
  q = reset();
  unit1.lessons.forEach((lesson) => { q.path.lessons[lesson.id] = { doneAt: ISO, score: 1 }; });
  step = api.kaoNextStep(new FixedDate());
  assert.equal(step.kind, 'mastery');
  assert.equal(primaryAction(home()), lessonAction(step), 'ustalık → ders oynatıcı');
  q = reset();
  q.daily['2026-09-28'] = { answered: 10, sessionDone: true };
  assert.equal(api.kaoNextStep(new FixedDate()).kind, 'rest');
  assert.equal(primaryAction(home()), 'App.kaoOpenAyah()', 'rest → öneri');
  q = reset();
});

check('(b2) karıştırılanlar satırı an kartının altbilgisinde', () => {
  const q = reset();
  q.errors.cognate = 5; q.errors.root = 3;
  assert.match(home(), /class="kao-hero-note"[\s\S]*En çok karıştırdıkların: Türkçe benzeri kelimeler \(5\) · kök \(3\)/);
});

check('(c) an kartının tamamı okuyucuyu açar; kapsam %N yalnız kelime ≥1', () => {
  const q = reset();
  settle(q, unit1.lessons[0].lemmaIds.concat(unit1.lessons[1].lemmaIds));
  const html = home();
  // Ünite 1 çapası namaz metni (prayer:fatiha) → kartın tamamı okuyucuyu açar.
  const hero = html.slice(html.indexOf('kao-today-hero-link'), html.indexOf('kao-today-hero-link') + 200);
  assert.ok(hero.includes('onclick="App.kaoSetView(&quot;reader&quot;)"'), 'kaplama düğmesi okuyucuyu açar: ' + hero.slice(0, 120));
  assert.match(html, /Kur’an kapsamı %<span data-countup="\d+" data-countup-key="kao-coverage">\d+<\/span>/, 'kapsam satırı %N (K2F-35 biçimi)');
  reset();
  assert.doesNotMatch(home(), /Kur’an kapsamı/, 'sıfır kullanıcıda kapsam yok');
});

check('(d) Kısayollar: Sûreler, Namazda ne diyorum, Kütüphane', () => {
  reset();
  const html = home();
  const m = html.match(/<h3 class="kao-group-title">Kısayollar<\/h3><div class="kao-group-surface">([\s\S]*?)<\/div><\/section>/);
  assert.ok(m, 'Kısayollar bölümü');
  assert.deepEqual([...m[1].matchAll(/<button type="button" class="kao-group-row" onclick="([^"]*)">[\s\S]*?<span class="kao-group-label">([^<]*)<\/span>/g)].map((x) => [x[2], x[1]]), [
    ['Sûreler', 'App.kaoSetView(&quot;reader&quot;)'],
    ['Namazda ne diyorum', 'App.kaoOpenPrayer()'],
    ['Kütüphane', 'App.kaoSetView(&quot;library&quot;)']
  ]);
  assert.doesNotMatch(html, /Keşfet<\/h3>|>İlerleme<|>Ayarlar</, 'Keşfet/Sen listeleri Bugün’de kalktı');
  assert.doesNotMatch(html, /data-icon=""/, 'tüm satır ikonları mevcut setten');
});

check('(e) Bugün ekranı en çok 5 etkileşimli öğe taşır (K-F)', () => {
  reset();
  assert.ok(todayButtons(home()) <= 5, `Bugün ekranı ${todayButtons(home())} düğme (≤5 olmalı)`);
});

check('Kütüphane görünümü: keşif tek alt sayfada; İlerleme ve Ayarlar buradan', () => {
  reset();
  assert.equal(api.kaoSetView('library'), true, 'library açılır');
  ui.kaoView = 'library';
  const html = api.kaoOverlayHTML(INSTANT);
  assert.match(html, /<main class="kao-library-screen"/, 'Kütüphane kabuğu');
  const rows = [...html.matchAll(/<span class="kao-group-label">([^<]*)<\/span>/g)].map((x) => x[1]);
  // Seviye 0 satırı K2F-15 kapısına tabidir (start==='s0'/başlanmış ders/kart); varsayılan level1'de gizlidir.
  for (const label of ['Yol', 'Kısa sûreler', 'Günün âyeti', 'Namazda ne diyorum', 'Telaffuz stüdyosu', 'Gramer notları', 'İlerleme', 'Ayarlar']) {
    assert.ok(rows.includes(label), `Kütüphane satırı: ${label}`);
  }
  assert.equal(api.KAO_VIEW_TITLES.library, 'Kütüphane');
});

check('erişilebilirlik korunur: harita İlerleme’den, âyet sayacı Günün âyeti ekranında', () => {
  const q = reset();
  q.ayahs.understood = ['1:1', '1:2'];
  ui.kaoView = 'stats';
  assert.equal([...api.kaoOverlayHTML(INSTANT).matchAll(/class="kao-map-cell"/g)].length, 114, 'İlerleme içinde 114 sûre hücresi');
  ui.kaoView = 'ayah';
  assert.match(api.kaoOverlayHTML(INSTANT), /Anlaşılan âyet sayısı: <strong>2<\/strong>/);
  ui.kaoView = 'home';
  assert.equal(tagsWith(api.kaoOverlayHTML(INSTANT), 'kao-primary').length, 1, 'kaplamada tek birincil eylem');
});

console.log(`KAO2-09 today: PASS (${passed} kontrol)`);
