'use strict';

// KAO2-10: hub kartı v2 (05 §8, 06 §5). Tek bilgi + tek eylem + gerçek ünite ilerlemesi.
// Sentetik VM, sahte saat; ağ, tarayıcı ya da gerçek veri yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const INSTANT = '2026-09-28T09:00:00';
const TODAY = '2026-09-28';
const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function boot(options = {}) {
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [INSTANT])); }
    static now() { return new Date(INSTANT).getTime(); }
  }
  const box = { window: {}, Date: FixedDate };
  vm.createContext(box);
  const content = options.withoutCurriculum ? CONTENT.filter((n) => n !== 'quranCurriculumV2') : CONTENT;
  for (const name of content) vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${name}.js`), 'utf8'), box, { filename: name });
  const core = options.withoutFlow ? ['app/core/quranLearnViews.js', 'app/core/quranLearn.js'] : ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js'];
  for (const file of core) vm.runInContext(fs.readFileSync(path.join(repoRoot, file), 'utf8'), box, { filename: file });
  const state = { data: { settings: {}, days: {}, quranLearn: null }, bed: null };
  const api = box.window.SeymaQuranLearn;
  assert.equal(api.registerQuranLearn({
    data: () => state.data, ui: () => ({}), save() {}, render() {}, todayStr: () => TODAY, esc,
    icon: (name) => `<i data-icon="${name}"></i>`, getDay: () => ({})
  }), true);
  api.registerCaffeineTargetBed(() => state.bed);
  return { api, state, cur: box.window.QuranCurriculumV2 };
}
const ISO = '2026-09-20T10:00:00.000Z';
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const onclicks = (html) => html.match(/onclick="[^"]*"/g) || [];
function card(html) {
  assert.equal((html.match(/<button\b/g) || []).length, 1, 'tüm kart tek düğme');
  assert.match(html, /^<button type="button" id="kao-hub-entry" class="kao-hub-card" onclick="App\.kaoOpen\(\)" aria-haspopup="dialog"/, 'kimlik, sınıf, tek eylem ve dialog ipucu korunur');
  assert.deepEqual(onclicks(html), ['onclick="App.kaoOpen()"']);
  assert.doesNotMatch(html, /kao-hub-path|Kelime<\/b>|Günde yaklaşık 6 dakika|kao-hub-foot|kao-hub-kicker/, 'sahte yol ve sabit süre vaadi yok');
  const title = (html.match(/class="kao-hub-title">([^<]*)</) || [])[1];
  const sub = (html.match(/class="kao-hub-sub">([^<]*)</) || [])[1];
  const cta = (html.match(/class="kao-hub-cta">([^<]*)</) || [])[1];
  const ring = (html.match(/class="kao-progress-ring" role="img" aria-label="[^"]*: (\d+)%"/) || [])[1];
  const label = (html.match(/aria-label="([^"]*)"/) || [])[1];
  return { title, sub, cta: cta && cta.trim(), ring: ring === undefined ? null : Number(ring), label };
}
function settle(q, lemmaIds) { lemmaIds.forEach((id) => { q.cards[`w:${id}:ar>tr`] = { state: 'review', s: 30, reps: 4, due: '2026-12-01T00:00:00.000Z' }; }); }

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

check('(a) hiç başlamadı: 05 §8 metinleri, halka yok, %0 yok', () => {
  const { api, state } = boot();
  state.data.quranLearn = null;
  const html = api.kaoHubCardHTML();
  const c = card(html);
  assert.equal(c.title, 'Kur’an Arapçası');
  assert.equal(c.sub, 'Namazda söylediklerini anlamaya başla · 5 dk');
  assert.equal(c.cta, 'Başla');
  assert.equal(c.ring, null, 'başlanmamışken halka yok');
  assert.doesNotMatch(text(html), /\b0\s*%|%\s*0\b/);
  assert.match(c.label, /^Kur’an Arapçası Öğreniyorum; /, 'erişilebilir ad tam adı taşır');
});

check('(b) günlük ders bekliyor: ünite başlığı, sıradaki ders, gerçek süre, gerçek halka', () => {
  const { api, state, cur } = boot();
  const q = api.ensureQuranLearn(state.data); q.onboarding.doneAt = ISO;
  const u1 = cur.units[0];
  settle(q, u1.lessons[0].lemmaIds);
  const c = card(api.kaoHubCardHTML());
  assert.equal(c.title, 'Kur’an Arapçası · Ünite 1');
  // K2F-22: Ünite 1 ders metinleri draft; kart güvenli kimlik-türevli başlığı gösterir, ham başlığı değil.
  assert.equal(api.kaoReviewLevel(u1.lessons[1].review), 'draft', 'u01.02 onaysız');
  assert.match(c.sub, /^Sıradaki: Ünite 1 · Ders 2 · \d+ dk$/);
  assert.doesNotMatch(c.sub, new RegExp(u1.lessons[1].title), 'draft ders başlığı sızmaz');
  assert.equal(c.cta, 'Devam');
  assert.equal(c.ring, Math.round(100 / u1.lessons.length), 'halka = biten ders / ünite dersi');
  assert.match(c.label, new RegExp(`Ünite 1 ilerlemesi %${c.ring}`));
});

check('(b2) niyet önerisi yalnız "bekliyor" durumunda alt satırın yerine geçer', () => {
  const { api, state, cur } = boot();
  const q = api.ensureQuranLearn(state.data); q.onboarding.doneAt = ISO;
  settle(q, cur.units[0].lessons[0].lemmaIds);
  state.data.days[TODAY] = { prayer: Object.fromEntries(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((k) => [k, { time: '23:59' }])) };
  assert.equal(card(api.kaoHubCardHTML()).sub, 'Niyet önerisi: sabah namazından sonra 5 dakika (23:59)');
  q.daily[TODAY] = { answered: 2, correct: 2, new: 0, reviewed: 2 };
  assert.match(card(api.kaoHubCardHTML()).sub, /^Sıradaki: /, 'bugün çalışıldıysa öneri yok');
  q.daily[TODAY].sessionDone = true;
  assert.doesNotMatch(card(api.kaoHubCardHTML()).sub, /Niyet/, 'bugün tamamken öneri yok');
});

check('(b3) K2F-16 · niyet varsa öneri o vaktin saatiyle; niyet yoksa/özelse sıradaki-vakit davranışı', () => {
  const { api, state, cur } = boot();
  const q = api.ensureQuranLearn(state.data); q.onboarding.doneAt = ISO;
  settle(q, cur.units[0].lessons[0].lemmaIds);
  const times = { fajr: '05:10', dhuhr: '13:05', asr: '16:30', maghrib: '19:00', isha: '20:30' };
  state.data.days[TODAY] = { prayer: Object.fromEntries(Object.entries(times).map(([k, v]) => [k, { time: v }])) };
  q.onboarding.intent = 'isha';
  assert.equal(card(api.kaoHubCardHTML()).sub, 'Niyet önerisi: yatsı namazından sonra 5 dakika (20:30)', 'sıradaki vakit sabah/öğle olsa bile niyet vakti');
  q.onboarding.intent = 'asr';
  assert.equal(card(api.kaoHubCardHTML()).sub, 'Niyet önerisi: ikindi namazından sonra 5 dakika (16:30)');
  q.onboarding.intent = 'custom';
  assert.match(card(api.kaoHubCardHTML()).sub, /^Niyet önerisi: (sabah|öğle|ikindi|akşam|yatsı) namazından sonra|^Niyet önerisi: yarın sabah/, 'özel niyet: sıradaki vakit');
  q.onboarding.intent = 'isha';
  q.daily[TODAY] = { answered: 1, correct: 1, new: 0, reviewed: 1 };
  assert.match(card(api.kaoHubCardHTML()).sub, /^Sıradaki: /, 'bugün çalışıldıysa niyet önerisi yok');
  // Saf yardımcı: dördüncü argüman niyet; vakit verisi yoksa niyet olsa da öneri yok.
  assert.equal(api.kaoIntentSuggestion(state.data, '2026-09-30T10:00:00', TODAY, 'maghrib'), 'akşam namazından sonra 5 dakika (19:00)');
  assert.equal(api.kaoIntentSuggestion(state.data, '2026-09-30T21:00:00', TODAY, 'maghrib'), 'yarın akşam namazından sonra 5 dakika (19:00)', 'vakit geçtiyse yarın');
  assert.equal(api.kaoIntentSuggestion(state.data, '2026-09-30T10:00:00', '2026-10-06', 'maghrib'), '', 'vakit verisi yoksa öneri yok');
});

check('(c) bugün tamam: ✓ başlık, yarınki tekrar sayısı, "Aç"', () => {
  const { api, state, cur } = boot();
  const q = api.ensureQuranLearn(state.data); q.onboarding.doneAt = ISO;
  settle(q, cur.units[0].lessons[0].lemmaIds);
  const tomorrow = cur.units[5].lessons[0].lemmaIds.concat(cur.units[5].lessons[1].lemmaIds).slice(0, 6);
  tomorrow.forEach((id) => { q.cards[`w:${id}:ar>tr`] = { state: 'review', s: 3, reps: 2, due: '2026-09-29T08:00:00' }; });
  q.cards['w:l_min_1f6fa6:tr>ar'] = { state: 'review', s: 9, reps: 3, due: '2026-10-05T08:00:00' };
  q.daily[TODAY] = { answered: 9, correct: 8, new: 3, reviewed: 6, sessionDone: true };
  const c = card(api.kaoHubCardHTML());
  assert.equal(c.title, 'Kur’an Arapçası ✓');
  assert.equal(c.sub, 'Bugünlük tamam · yarın 6 tekrar');
  assert.equal(c.cta, 'Aç');
  tomorrow.forEach((id) => { delete q.cards[`w:${id}:ar>tr`]; });
  assert.equal(card(api.kaoHubCardHTML()).sub, 'Bugünlük tamam', 'yarın tekrar yoksa sayı yazılmaz');
});

check('(d) gece penceresi: "Uyumadan önce N kart · M dk", "Tekrar et"', () => {
  const { api, state, cur } = boot();
  const q = api.ensureQuranLearn(state.data); q.onboarding.doneAt = ISO;
  const due = cur.units[5].lessons.flatMap((l) => l.lemmaIds).slice(0, 12);
  assert.equal(due.length, 12, 'gece üst sınırını (8) aşan vadeli kart');
  due.forEach((id) => { q.cards[`w:${id}:ar>tr`] = { state: 'review', s: 3, reps: 2, due: '2026-09-27T08:00:00' }; });
  state.data.settings.targetBed = '10:00'; state.bed = '10:00';
  state.data.days[TODAY] = { prayer: { fajr: { time: '23:59' } } };
  const c = card(api.kaoHubCardHTML());
  assert.equal(c.title, 'Kur’an Arapçası');
  assert.equal(c.sub, 'Uyumadan önce 8 kart · 3 dk');
  assert.equal(c.cta, 'Tekrar et');
});

check('kaoVisible=false → boş dize; hub render veriyi değiştirmez', () => {
  const { api, state, cur } = boot();
  state.data.quranLearn = { cards: {}, settings: { kaoVisible: false } };
  assert.equal(api.kaoHubCardHTML(), '');
  state.data.quranLearn = { cards: { [`w:${cur.units[0].lessons[0].lemmaIds[0]}:ar>tr`]: { reps: 1, state: 'learning', s: 1, due: '2026-09-27T00:00:00' } }, daily: 'bozuk' };
  const before = JSON.stringify(state.data);
  card(api.kaoHubCardHTML());
  assert.equal(JSON.stringify(state.data), before, 'hub render sırasında veri yazmaz/normalize etmez');
});

check('motor ya da müfredat yüklenmemişse kart yine çizilir (ana sekme kırılmaz)', () => {
  for (const opts of [{ withoutFlow: true }, { withoutCurriculum: true }]) {
    const { api, state } = boot(opts);
    state.data.quranLearn = { cards: { 'w:l_min_1f6fa6:ar>tr': { reps: 1 } } };
    const c = card(api.kaoHubCardHTML());
    assert.equal(c.title, 'Kur’an Arapçası');
    assert.equal(c.cta, 'Aç');
    assert.equal(c.ring, null);
  }
});

check('06 §5 CSS: yalnız --kao-* renk tokenı, 600/700, süs yok, hover kaldırma yok', () => {
  const css = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
  const start = css.indexOf('/* KAO2-10');
  assert.ok(start >= 0, 'KAO2-10 CSS bloğu');
  const block = css.slice(start, css.indexOf('/* KAO2-10 son */'));
  for (const sel of ['.kao-hub-row', '.kao-hub-icon', '.kao-hub-title', '.kao-hub-sub', '.kao-hub-cta']) assert.ok(block.includes(sel), sel);
  const vars = [...new Set((block.match(/var\(--[a-z0-9-]+/g) || []).map((v) => v.slice(4)))];
  assert.deepEqual(vars.filter((v) => !/^--(?:kao|f)-/.test(v)), [], 'kao dışı token');
  assert.ok((block.match(/font-weight:\s*(\d+)/g) || []).every((w) => /600|700/.test(w)));
  assert.doesNotMatch(block, /text-transform|letter-spacing|box-shadow|gradient|:hover|translateY/);
  assert.match(block, /\.kao-hub-icon\{[^}]*width:32px;height:32px/);
});

console.log(`KAO2-10 hub: PASS (${passed} kontrol)`);
