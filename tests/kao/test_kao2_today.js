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

check('(a) sıfır kullanıcı: %0 yok, ilk hedef Fâtiha', () => {
  reset();
  const html = home();
  assert.doesNotMatch(html, /%\s*0\b|0\s*%/, '%0 metni görünmemeli');
  assert.ok(html.includes(`İlk hedef: Fâtiha’yı anlamak · ${unit1Words} kelime`), 'ilk hedef satırı');
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
  assert.equal(primaryAction(home()), lessonAction(step), 's0 → ders oynatıcı');
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
  settle(q, cur.units[5].lessons[0].lemmaIds);
  Object.values(q.cards).forEach((c) => { c.due = '2026-09-27T09:00:00.000Z'; });
  const local = new FixedDate(), bedMinute = (local.getHours() * 60 + local.getMinutes() + 30) % 1440;
  const bed = `${String(Math.floor(bedMinute / 60)).padStart(2, '0')}:${String(bedMinute % 60).padStart(2, '0')}`;
  data.settings.targetBed = bed;
  targetBed = bed;
  const night = api.kaoNextStep(new FixedDate());
  assert.equal(night.kind, 'night-review');
  const html = home();
  assert.equal(primaryAction(html), 'App.kaoStart()', 'gece penceresi yalnız vadeli tekrar yolunu korur');
  assert.match(html, /Gece tekrarına başla · en çok 8 kart/);
  assert.match(html, /class="kao-hero-foot"[\s\S]*Gece tekrarı açık/, 'gece satırı HeroCard altbilgisinde');
});

check('(b2) karıştırılanlar satırı HeroCard altbilgisinde', () => {
  const q = reset();
  q.errors.cognate = 5; q.errors.root = 3;
  assert.match(home(), /class="kao-hero-foot"[\s\S]*En çok karıştırdıkların: Türkçe benzeri kelimeler \(5\) · kök \(3\)/);
});

check('(c) Yolun kartı: seviye + gerçek ünite ilerlemesi; kapsam yalnız kelime ≥1', () => {
  const q = reset();
  settle(q, unit1.lessons[0].lemmaIds.concat(unit1.lessons[1].lemmaIds));
  const html = home();
  const progress = flow.unitProgress(q, 1, { curriculum: cur });
  const pct = Math.round(progress.lessonsDone / progress.lessons * 100);
  assert.match(html, /Seviye 1 · Namazın dili/);
  assert.match(html, /Ünite 1\/3 · Fâtiha/);
  assert.match(html, new RegExp(`role="progressbar"[^>]*aria-valuenow="${pct}"`));
  assert.match(html, /<span data-countup="\d+" data-countup-key="kao-coverage">\d+<\/span>%/);
  assert.match(html, /Tüm yolu gör/);
  assert.match(html, /onclick="App\.kaoSetView\(&quot;units&quot;\)"/);
  reset();
  assert.doesNotMatch(home(), /data-countup-key="kao-coverage"/, 'sıfır kullanıcıda kapsam yok');
});

check('(d) Keşfet ve Sen grouped list satırları', () => {
  reset();
  const html = home();
  const section = (title) => {
    const m = html.match(new RegExp(`<h3 class="kao-group-title">${title}</h3><div class="kao-group-surface">([\\s\\S]*?)</div></section>`));
    assert.ok(m, `${title} bölümü`);
    return [...m[1].matchAll(/<button type="button" class="kao-group-row" onclick="([^"]*)">[\s\S]*?<span class="kao-group-label">([^<]*)<\/span>/g)].map((x) => [x[2], x[1]]);
  };
  assert.deepEqual(section('Keşfet'), [
    ['Kısa sûreler', 'App.kaoOpenSurah(114)'],
    ['Namazda ne diyorum', 'App.kaoOpenPrayer()'],
    ['Gramer notları', 'App.kaoSetView(&quot;grammar&quot;)'],
    ['Telaffuz stüdyosu', 'App.kaoOpenPhonics()'],
    ['Günün âyeti', 'App.kaoOpenAyah()']
  ]);
  assert.deepEqual(section('Sen'), [
    ['İlerleme', 'App.kaoSetView(&quot;stats&quot;)'],
    ['Ayarlar', 'App.kaoSetView(&quot;settings&quot;)']
  ]);
  assert.doesNotMatch(html, /Kök aileleri/, 'ilgili kartlar gelene kadar gizli');
  assert.doesNotMatch(html, /data-icon=""/, 'tüm satır ikonları mevcut setten');
});

check('(e) .kao-link-button ve eski süs bölümleri yok', () => {
  reset();
  const html = home();
  assert.doesNotMatch(html, /kao-link-button/);
  assert.doesNotMatch(html, /Bugün anlayabildiğin âyet|Kelime kapsamın/);
});

check('erişilebilirlik korunur: harita İlerleme’den, âyet sayacı Günün âyeti ekranında', () => {
  const q = reset();
  q.ayahs.understood = ['1:1', '1:2'];
  ui.kaoView = 'stats';
  assert.match(api.kaoOverlayHTML(INSTANT), /onclick="App\.kaoOpenMap\(\)"/);
  ui.kaoView = 'ayah';
  assert.match(api.kaoOverlayHTML(INSTANT), /Anlaşılan âyet sayısı: <strong>2<\/strong>/);
  ui.kaoView = 'home';
  const overlay = api.kaoOverlayHTML(INSTANT);
  assert.equal(tagsWith(overlay, 'kao-primary').length, 1, 'kaplamada tek birincil eylem');
});

console.log(`KAO2-09 today: PASS (${passed} kontrol)`);
