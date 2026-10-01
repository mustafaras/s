'use strict';

// KAO2-13: S-03 yol ve S-04 ünite ekranları. Sentetik VM; tarayıcı, ağ,
// gerçek kullanıcı verisi veya kalıcı yazma yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function boot() {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const name of CONTENT) vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${name}.js`), 'utf8'), box, { filename: name });
  for (const file of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, file), 'utf8'), box, { filename: file });
  }
  const curriculum = box.window.QuranCurriculumV2;
  const data = { settings: {}, days: {}, quranJourney: { requests: {} }, quranLearn: null };
  const ui = { kaoOpen: true, kaoView: 'home', kaoStack: [], kaoQueue: [], kaoTaskIndex: 0 };
  const api = box.window.SeymaQuranLearn;
  assert.equal(api.registerQuranLearn({
    data: () => data,
    ui: () => ui,
    save() { throw new Error('salt-okunur ekran veriyi kaydetmemeli'); },
    render() {},
    todayStr: () => '2026-09-29',
    esc,
    icon: (name) => `<i data-icon="${esc(name)}"></i>`,
    getDay: () => ({})
  }), true);
  const q = api.ensureQuranLearn(data);
  q.onboarding.doneAt = '2026-09-20T10:00:00.000Z';
  return { api, box, curriculum, data, ui, q };
}

function lessonDone(q, lesson) {
  const lemmaIds = Array.isArray(lesson.lemmaIds) ? lesson.lemmaIds : [];
  q.path = q.path || {};
  q.path.lessons = q.path.lessons || {};
  q.path.lessons[lesson.id] = { startedAt: '2026-09-20T10:00:00.000Z', doneAt: '2026-09-20T10:10:00.000Z', introducedLemmas: lemmaIds.slice() };
  for (const id of lemmaIds) q.cards[`w:${id}:ar>tr`] = { state: 'review', s: 30, reps: 4, due: '2026-12-01T00:00:00.000Z' };
}

function count(html, className) { return (html.match(new RegExp(`class="[^"]*\\b${className}\\b[^"]*"`, 'g')) || []).length; }
function decode(html) { return html.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'); }

let passed = 0;
function check(name, run) { run(); passed += 1; console.log(`PASS  ${name}`); }

check('yol: yedi seviye, tematik üniteler ve tek önerilen gerçek sıradaki adım', () => {
  const { api, curriculum, data, ui, q } = boot();
  lessonDone(q, curriculum.units[0].lessons[0]);
  lessonDone(q, curriculum.s0.lessons[0]);
  api.ensureQuranLearn(data);
  const before = JSON.stringify(data);
  assert.equal(api.kaoNav('units'), true);
  const html = decode(api.kaoOverlayHTML());
  assert.equal(count(html, 'kao-path-level-section'), 7, 'S0–S6 için yedi bölüm');
  assert.equal(count(html, 'kao-path-unit-row'), 12, '12 tematik ünite müfredat sırasıyla görünür');
  // KAO2-17: L1 onayı sonrası ünite metinleri görünür.
  assert.match(html, /Fâtiha/);
  assert.match(html, /Her namazda okuduğun Fâtiha/);
  assert.match(html, /onclick="App\.kaoNav\("unit",1\)"/);
  assert.equal((html.match(/aria-current="step"/g) || []).length, 1, 'tek sıradaki ünite step olarak işaretlenir');
  assert.match(html, /class="kao-progress-ring" role="img" aria-label="Fâtiha ders ilerlemesi: 20%"/);
  assert.match(html, /onclick="App\.kaoLesson\("start","s0\.02"\)"/, 'S0 satırı gerçek ilk tamamlanmamış derse gider');
  assert.match(html, /onclick="App\.kaoOpenSurah\(114\)"/, 'S5 satırı var olan kısa sûre okuyucusunu açar');
  assert.match(html, /Seviye 6/);
  assert.doesNotMatch(html, /kao-levels|App\.kaoOpenWord|disabled|Kilitli/i, 'etkisiz seviye kutusu veya eski ilk-kelime rotası yok');
  assert.equal(ui.kaoView, 'units');
  assert.equal(JSON.stringify(data), before, 'yol renderı kalıcı veriyi değiştirmez');
});

check('ünite: vaat, gerçek ilerleme, sıradaki ders ve statik kavram listesi', () => {
  const { api, box, curriculum, data, ui, q } = boot();
  const unit = curriculum.units[0];
  lessonDone(q, unit.lessons[0]);
  api.ensureQuranLearn(data);
  assert.equal(api.kaoNav('units'), true);
  assert.equal(api.kaoNav('unit', unit.id), true, 'ünite yolu KAO gezinme yığınında açılır');
  assert.equal(ui.kaoView, 'units', 'unit detayı mevcut units geçmiş yolu içinde tutulur');
  const before = JSON.stringify(data);
  const html = decode(api.kaoOverlayHTML());
  const total = unit.lessons.reduce((sum, lesson) => sum + lesson.lemmaIds.length, 0);
  assert.match(html, /class="kao-screen[^\"]*kao-screen-unit/);
  // KAO2-17: L1 onayı sonrası ünite metinleri görünür.
  assert.match(html, /Fâtiha/);
  assert.match(html, /Her namazda okuduğun Fâtiha/);
  assert.match(html, new RegExp(`3 / ${total} kelime · 1 / ${unit.lessons.length} ders`));
  assert.match(html, /Ders 2’e devam et/);
  assert.match(html, /onclick="App\.kaoLesson\("start","u01\.02"\)"/);
  assert.equal(count(html, 'kao-primary'), 1, 'ünite ekranında tek birincil eylem');
  assert.equal((html.match(/aria-current="step"/g) || []).length, 1, 'yalnız sıradaki ders step olarak işaretlenir');
  assert.match(html, /Fiil önce gelir/);
  assert.match(html, /Kelimeler · \d+/);
  const firstLemma = box.window.QuranLexiconV1.byId(unit.lessons[0].lemmaIds[0]);
  assert.ok(firstLemma.verified);
  assert.ok(html.includes(esc(firstLemma.ar)), 'Arapça yalnız doğrulanmış sözlük kaynağından gelir');
  assert.ok(html.includes(esc(firstLemma.translit)), 'okunuş sözlük kaynağından gelir');
  assert.ok(html.includes(esc(firstLemma.meanings[0])), 'anlam sözlük kaynağından gelir');
  assert.match(html, /Tanıdık|Çalışılıyor|Sırada/);
  assert.match(html, /Çapa metin/);
  assert.doesNotMatch(html, /App\.kaoOpenWord/, 'kelime satırları sahte/yanlış yönlendirmeli düğme değildir');
  assert.equal(JSON.stringify(data), before, 'ünite renderı kalıcı veriyi değiştirmez');
  assert.equal(api.kaoBack(), true);
  assert.equal(ui.kaoView, 'units', 'geri, önceki Yol ekranına döner');
  assert.match(decode(api.kaoOverlayHTML()), /class="kao-screen[^\"]*kao-screen-units/, 'geri ekranı gerçekten Yol listesidir');
});

check('tamamlanmış ünite CTA ve halka durumunu yalnız ders kayıtlarından türetir', () => {
  const { api, curriculum, q } = boot();
  const unit = curriculum.units[0];
  unit.lessons.forEach((lesson) => lessonDone(q, lesson));
  assert.equal(api.kaoNav('unit', unit.id), true);
  const html = decode(api.kaoOverlayHTML());
  assert.match(html, /100%/);
  assert.match(html, /Bu ünitedeki dersler tamamlandı/);
  // K2F-08: dersler bitince birincil düğme ÇALIŞAN ustalık eylemidir (eski beklenti: düğme yok → artık "Ustalığa başla");
  // ustalık geçilmişse yine hiçbir devam düğmesi yoktur.
  assert.equal((html.match(/class="kao-primary"/g) || []).length, 1, 'dersler bitince tek ve çalışan ustalık düğmesi');
  assert.match(html, /Ustalığa başla/);
  q.path.units['1'] = { masteryAt: '2026-09-20T10:00:00.000Z', masteryScore: 0.9, attempts: 1, lastAttemptAt: '2026-09-20T10:00:00.000Z', repair: null, skippedAt: null };
  assert.equal(api.kaoNav('unit', unit.id), true);
  assert.doesNotMatch(decode(api.kaoOverlayHTML()), /class="kao-primary"/, 'ustalığı geçilmiş ünite için devam düğmesi gösterilmez');
});

check('06: KAO tokenları, 44px hedefler ve dar/geniş metinde sarmalanan dikey düzen', () => {
  const css = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
  const start = css.indexOf('/* KAO2-13');
  assert.ok(start >= 0, 'KAO2-13 stil bloğu');
  const block = css.slice(start, css.indexOf('/* KAO2-13 son */', start));
  assert.ok(block.length > 0, 'kart stilleri kapalı ve yerel bir blokta');
  for (const selector of ['.kao-path-screen', '.kao-path-level-section', '.kao-path-unit-row', '.kao-unit-screen', '.kao-unit-steps', '.kao-unit-words']) assert.ok(block.includes(selector), selector);
  assert.ok((block.match(/min-height:76px/g) || []).length >= 1, 'yol satırları dokunma alanını korur');
  assert.match(block, /min-height:var\(--kao-row\)/);
  assert.match(css, /--kao-row:44px/, 'özet/ders satırlarının hedefi en az 44px');
  assert.match(block, /min-width:0/);
  assert.match(block, /overflow-wrap:anywhere/);
  assert.doesNotMatch(block, /--quran-|Georgia|font-family:\s*serif|text-transform|letter-spacing|box-shadow|:hover/);
  assert.match(block, /\.kao-path-levels\{[^}]*display:grid/);
});

console.log(`KAO2-13 path: PASS (${passed} kontrol)`);
