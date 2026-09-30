'use strict';

// KAO2-15: S-10 gramer notları kütüphanesi. Sentetik VM; tarayıcı, ağ,
// gerçek kullanıcı verisi veya kalıcı yazma yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function boot() {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const name of CONTENT) vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${name}.js`), 'utf8'), box, { filename: name });
  for (const file of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, file), 'utf8'), box, { filename: file });
  }
  const curriculum = box.window.QuranCurriculumV2;
  const grammar = box.window.QuranGrammarV1;
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
  return { api, curriculum, grammar, data, ui, q };
}

const SEED = boot();
const GRAMMAR = SEED.grammar;
const CURRICULUM = SEED.curriculum;
const allLessons = () => [].concat(...CURRICULUM.units.map((unit) => unit.lessons));
const lessonsOfConcept = (id) => allLessons().filter((lesson) => lesson.conceptId === id);

function lessonDone(q, lesson) {
  const lemmaIds = Array.isArray(lesson.lemmaIds) ? lesson.lemmaIds : [];
  q.path = q.path || {};
  q.path.lessons = q.path.lessons || {};
  q.path.lessons[lesson.id] = { startedAt: '2026-09-20T10:00:00.000Z', doneAt: '2026-09-20T10:10:00.000Z', introducedLemmas: lemmaIds.slice() };
  for (const id of lemmaIds) q.cards[`w:${id}:ar>tr`] = { state: 'review', s: 30, reps: 4, due: '2026-12-01T00:00:00.000Z' };
}

function decode(html) { return html.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'); }

let passed = 0;
function check(name, run) { run(); passed += 1; console.log(`PASS  ${name}`); }

check('liste: 25 kavram ünite sırasıyla gruplanır, her grup seviye ve ünite adını taşır', () => {
  const { api, data } = boot();
  const before = JSON.stringify(data);
  assert.equal(api.kaoNav('grammar'), true);
  const html = decode(api.kaoOverlayHTML());
  assert.match(html, /class="kao-screen[^"]*kao-screen-grammar/);
  assert.match(html, /Gramer notları/);
  assert.match(html, /Bir kez oku, sonra kavramı ders içinde uygula\./);
  assert.equal((html.match(/class="kao-grammar-group"/g) || []).length, 12, 'her ünite için bir grup');
  const unitIds = [...html.matchAll(/data-unit="(\d+)"/g)].map((match) => Number(match[1]));
  assert.deepEqual(unitIds, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'gruplar ünite sırasında');
  for (const concept of GRAMMAR.concepts) {
    const unit = CURRICULUM.units.find((item) => item.id === concept.unit);
    const level = CURRICULUM.levels.find((item) => item.id === unit.level);
    assert.ok(html.includes(`Seviye ${unit.level} ·`), `grup seviye başlığı: ${concept.unit}`);
    // KAO2-17: draft başlıklar gizlenir; grup başlığı güvenli 'Ünite N' biçimine düşer.
    assert.ok(html.includes(api.kaoUnitTitle(unit)), `grup ünite adı: ${concept.unit}`);
    assert.ok(html.includes(level.title), `seviye adı: ${concept.unit}`);
    assert.ok(html.includes(concept.title), `kavram satırı: ${concept.id}`);
  }
  assert.equal((html.match(/class="kao-grammar-row"/g) || []).length, 25, '25 kavram satırı');
  assert.match(html, /onclick="App\.kaoNav\("concept","g0_5"\)"/);
  assert.doesNotMatch(html, /kao-grammar-row[^>]*disabled/, 'kavram satırları etkisiz değil');
  assert.equal(JSON.stringify(data), before, 'liste renderı kalıcı veriyi değiştirmez');
  assert.equal(api.kaoBack(), true);
  assert.equal(api.kaoOverlayHTML().includes('kao-grammar-row'), false, 'geri dönüş kavram listesini bırakır');
});

check('kavram sayfası: günlük Türkçe önce, terim katlanır, tablo içerikten ve okunuşuyla gelir', () => {
  const { api, data } = boot();
  const concept = GRAMMAR.byId('g0_5');
  const table = concept.tables[0];
  const before = JSON.stringify(data);
  assert.equal(api.kaoNav('concept', 'g0_5'), true);
  const html = decode(api.kaoOverlayHTML());
  assert.match(html, /Fiil önce gelir/);
  assert.ok(html.includes(concept.plainTr), 'düz Türkçe anlatım gösterilir');
  assert.match(html, /<table class="kao-grammar-table"/);
  for (const column of table.columns) assert.match(html, new RegExp(`<th scope="col">${escapeRegExp(column)}</th>`), `tablo başlığı: ${column}`);
  assert.match(html, /<th scope="row">/);
  let arabicCells = 0;
  for (const row of table.rows) {
    for (const cell of row.cells) {
      if (!Array.isArray(cell)) continue;
      arabicCells += 1;
      assert.ok(html.includes(cell[1]), `Arapça hücre içerikten: ${cell[1]}`);
      assert.ok(html.includes(cell[2]), `hücre okunuşu: ${cell[2]}`);
    }
  }
  assert.ok(arabicCells >= 3, 'Arapça hücreler görünür');
  assert.match(html, /<details class="kao-grammar-term"><summary>[^<]*Terim/);
  assert.ok(html.includes(concept.termTr), 'terim katlanabilir bölümde');
  assert.match(html, /Bu kavramın geçtiği dersler/);
  const own = lessonsOfConcept('g0_5');
  assert.ok(own.length >= 1);
  assert.match(html, new RegExp(`onclick="App\\.kaoLesson\\("start","${escapeRegExp(own[0].id)}"\\)"`), 'ders gerçek rotaya bağlanır');
  assert.equal(JSON.stringify(data), before, 'kavram renderı kalıcı veriyi değiştirmez');
});

check('25/25 kavram erişilebilir; her kavramın en az bir dersi vardır', () => {
  const { api } = boot();
  for (const concept of GRAMMAR.concepts) {
    assert.equal(api.kaoNav('concept', concept.id), true, `kavram açılır: ${concept.id}`);
    const html = decode(api.kaoOverlayHTML());
    assert.ok(html.includes(concept.title), `başlık: ${concept.id}`);
    assert.ok(html.includes(concept.plainTr), `düz anlatım: ${concept.id}`);
    const own = lessonsOfConcept(concept.id);
    assert.ok(own.length >= 1, `kavramın dersi var: ${concept.id}`);
    assert.match(html, new RegExp(`onclick="App\\.kaoLesson\\("start","${escapeRegExp(own[0].id)}"\\)"`), `ders bağlantısı: ${concept.id}`);
  }
  assert.equal(api.kaoNav('concept', 'yok_boyle_kavram'), false, 'bilinmeyen kavram açılmaz');
});

check('girişler: Keşfet satırı görünür, ünite kavramları dokunulabilir', () => {
  const { api, q } = boot();
  const unit = CURRICULUM.units[0];
  lessonDone(q, unit.lessons[0]);
  api.ensureQuranLearn({ settings: {}, days: {}, quranLearn: q });
  const home = decode(api.kaoOverlayHTML());
  const discover = home.match(/<h3 class="kao-group-title">Keşfet<\/h3><div class="kao-group-surface">([\s\S]*?)<\/div><\/section>/);
  assert.ok(discover, 'Keşfet bölümü var');
  const labels = [...discover[1].matchAll(/<span class="kao-group-label">([^<]*)<\/span>/g)].map((match) => match[1]);
  assert.deepEqual(labels, ['Kısa sûreler', 'Namazda ne diyorum', 'Gramer notları', 'Kök aileleri', 'Seviye 0 · şekil aileleri', 'Telaffuz stüdyosu', 'Günün âyeti']);
  assert.match(discover[1], /App\.kaoOpenRoots\(\)/);
  assert.match(discover[1], /onclick="App\.kaoSetView\("grammar"\)"/);
  assert.equal(api.kaoNav('unit', unit.id), true);
  const unitHtml = decode(api.kaoOverlayHTML());
  assert.match(unitHtml, /<ul class="kao-unit-concepts">/);
  for (const id of unit.conceptIds) {
    assert.match(unitHtml, new RegExp(`onclick="App\\.kaoNav\\("concept","${escapeRegExp(id)}"\\)"`), `ünite kavramı dokunulabilir: ${id}`);
    assert.ok(unitHtml.includes(GRAMMAR.byId(id).title), `ünite kavram başlığı: ${id}`);
  }
});

check('P10/06: kaydırma yalnız tablo sarmalayıcısında, tokenlar ve 44 px korunur', () => {
  const css = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
  const start = css.indexOf('/* KAO2-15');
  assert.ok(start >= 0, 'KAO2-15 stil bloğu kapalı');
  const block = css.slice(start, css.indexOf('/* KAO2-15 son */', start));
  assert.ok(block.length > 0, 'blok kapalı ve yerel');
  for (const selector of ['.kao-grammar-list', '.kao-grammar-group', '.kao-grammar-row', '.kao-grammar-concept', '.kao-grammar-table-wrap', '.kao-grammar-table']) {
    assert.ok(block.includes(selector), selector);
  }
  assert.match(block, /\.kao-grammar-table-wrap\{[^}]*overflow-x:auto/, 'kaydırma yalnız tablo sarmalayıcısında');
  assert.doesNotMatch(block, /#(?!root)[0-9a-fA-F]{3,8}\b/, 'sabit hex renk yok');
  assert.match(block, /var\(--kao-/, 'KAO tokenları kullanılır');
  assert.match(block, /min-height:44px/, 'dokunma hedefi 44 px');
  assert.match(block, /@media\s*\(forced-colors:active\)/, 'zorunlu renk modu kuralı');
  assert.match(block, /:focus-visible/, 'odak halkası');
});

console.log(`KAO2-15 grammar notes: PASS (${passed} kontrol)`);
