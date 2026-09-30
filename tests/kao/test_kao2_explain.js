'use strict';

// KAO2-18: hata sınıfına göre açıklamalar + kavram çözümlü örnekleri.
// Ayrıca kullanıcı geri bildirimiyle kapatılan üç gezinme/anlam kusuru:
//   (Y-01) Bugün'deki "Yolun" kartı üniteye götürmüyordu ("Tüm yolu gör" → Yol listesi)
//   (Y-02) ders oynatıcıda bağlam başlığı yoktu (hangi ünite/ders?)
//   (Y-03) ders listesindeki hedef cümleleri hiçbir ekranda gösterilmiyordu
// Sentetik VM; tarayıcı, ağ, gerçek veri yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];

function boot(seed) {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const n of CONTENT) vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), box, { filename: n });
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), box, { filename: f });
  }
  const data = { settings: {}, days: {}, quranLearn: null };
  const ui = { kaoOpen: true, kaoView: 'home', kaoStack: [] };
  const api = box.window.SeymaQuranLearn;
  assert.equal(api.registerQuranLearn({
    data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-29',
    esc, icon: () => '', getDay: () => ({})
  }), true);
  const q = api.ensureQuranLearn(data);
  q.onboarding.doneAt = '2026-09-20T00:00:00.000Z';
  if (seed) seed(q, api, box.window.QuranCurriculumV2);
  return { api, box, data, ui, q, curriculum: box.window.QuranCurriculumV2, grammar: box.window.QuranGrammarV1 };
}

const decode = (h) => h.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const screenOf = (h) => { const m = h.match(/<section class="kao-screen[^"]*kao-screen-([a-z-]+)"/); return m ? m[1] : ''; };

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

// ---- Y-01: Bugün'deki Yolun kartı üniteye götürmeli -------------------------
check('Y-01 Yolun kartı birincil olarak içinde bulunulan üniteyi açar', () => {
  const { api, ui, curriculum } = boot();
  api.kaoNav('home');
  const html = decode(api.kaoOverlayHTML());
  const unit = curriculum.units[0];
  assert.match(html, /class="kao-path-more"/, 'Yolun kartı var');
  assert.match(html, new RegExp(`App\\.kaoNav\\("unit",${unit.id}\\)`), 'kart üniteye götürür');
  assert.match(html, /kao-path-more[^>]*App\.kaoSetView\("units"\)/, 'Yol listesi ikincil bağlantı olarak korunur');
  assert.ok(html.indexOf('kao-path-unit-open') < html.indexOf('kao-path-more'), 'birincil ünite eylemi ikincil Yol bağlantısından önce gelir');
  // Basıldığında gerçekten ünite ekranı açılmalı.
  assert.equal(api.kaoNav('unit', unit.id), true);
  assert.equal(screenOf(decode(api.kaoOverlayHTML())), 'unit', 'ünite ekranı açılır');
  assert.equal(ui.kaoView, 'units');
});

// ---- Y-02: Ders oynatıcıda bağlam başlığı ----------------------------------
check('Y-02 ders oynatıcı hangi ünitenin kaçıncı dersi olduğunu söyler', () => {
  const { api, curriculum } = boot();
  const unit = curriculum.units[0];
  assert.equal(api.kaoLesson('start', unit.lessons[0].id), true);
  const html = decode(api.kaoOverlayHTML());
  assert.equal(screenOf(html), '', 'ders odak modunda tam ekran değil');
  assert.match(html, /kao-lesson-context/, 'bağlam satırı var');
  assert.match(html, new RegExp(unit.title), 'ünite adı görünür');
  assert.match(html, /Ders\s*1\s*\/\s*\d+/, 'kaçıncı ders olduğu görünür');
  assert.equal(html.includes(unit.lessons[0].goal), true, 'dersin hedefi görünür');
});

// ---- Y-03: ders listesinde hedef cümlesi ----------------------------------
check('Y-03 ünite ekranı her dersin hedef cümlesini gösterir', () => {
  const { api, curriculum } = boot();
  const unit = curriculum.units[0];
  assert.equal(api.kaoNav('unit', unit.id), true);
  const html = decode(api.kaoOverlayHTML());
  assert.match(html, /kao-unit-step-goal/, 'hedef satırı sınıfı var');
  let shown = 0;
  for (const lesson of unit.lessons) if (lesson.goal && html.includes(lesson.goal)) shown += 1;
  assert.equal(shown, unit.lessons.filter((l) => l.goal).length, 'her dersin hedefi listelenir');
});

// ---- KAO2-18: explain() sözleşmesi ----------------------------------------
check('explain boş dönmez: her görev türü ve doğru/yanlış için metin üretir', () => {
  const { api, data, q } = boot();
  const kinds = ['word', 'order', 'grammar', 'fragment', 'link', 'transfer'];
  for (const kind of kinds) {
    const task = { id: 'k:' + kind, cardId: 'w:l_som_585f33:ar>tr', type: kind, kind, answer: 'rahmet', ar: '', choices: [] };
    const ok = api.kaoExplain(task, null, true);
    const bad = api.kaoExplain(task, null, false);
    assert.ok(typeof ok === 'string' && ok.length > 0, `${kind}/doğru: metin`);
    assert.ok(typeof bad === 'string' && bad.length > 0, `${kind}/yanlış: metin`);
    assert.equal(/undefined|NaN|\[object/.test(ok + bad), false, `${kind}: bozuk metin yok`);
    assert.ok(bad.length > ok.length, `${kind}: yanlışta daha çok açıklama`);
  }
  void data; void q;
});

check('açıklama doğru cevabı ve nedeni verir; utandırmaz', () => {
  const { api } = boot();
  const task = { id: 'k1', cardId: 'w:l_som_585f33:ar>tr', type: 'word', kind: 'word', answer: 'rahmet', choices: [] };
  const bad = api.kaoExplain(task, null, false);
  assert.match(bad, /rahmet/, 'doğru cevabı söyler');
  assert.equal(/\b(yanlış|hatalı|başarısız|olmuyor)\b/i.test(bad), false, 'utandıran kelime yok');
  assert.match(bad, /bak|dinle|düşün|anımsa|dene|gör/i, 'düzeltme adımı önerir');
});

check('cognate.shift olan lemmada anlam kayması uyarısı çıkar', () => {
  const { api, box } = boot();
  const lex = box.window.QuranLexiconV1;
  const withShift = lex.lemmas.find((l) => l.cognate && l.cognate.tr && l.cognate.shift);
  assert.ok(withShift, 'shift örnek lemma var');
  // Gerçek görev nesnesi cognate:{tr,shift} taşır (kaoBuildTask çıktısıyla aynı biçim).
  const task = { id: 'k1', cardId: `w:${withShift.id}:ar>tr`, type: 'word', kind: 'word', answer: '', choices: [], cognate: withShift.cognate };
  const bad = api.kaoExplain(task, null, false);
  assert.match(bad, new RegExp(withShift.cognate.tr), 'Türkçe akrabayı anar');
  assert.match(bad, /Dikkat|ama|farklı|başka/i, 'anlam kayması uyarısı');
});

check('gramer görevi errorTr draft ise güvenli genel metne düşer', () => {
  const { api, grammar } = boot();
  const concept = grammar.byId('g0_5');
  const task = { id: 'g1', cardId: `g:${concept.id}:${concept.templates[0].id}`, type: 'grammar', kind: 'grammar', answer: 'x', choices: [] };
  const bad = api.kaoExplain(task, null, false);
  assert.ok(bad.length > 0, 'metin üretir');
  assert.equal(/undefined/.test(bad), false, 'boş alan sızmaz');
  // errorTr onaylıysa (sourced/expert) o metin kullanılır.
  const sourced = { id: 'g2', cardId: `g:${concept.id}:${concept.templates[0].id}`, type: 'grammar', kind: 'grammar', answer: 'x', choices: [], errorTr: 'Ekin işlevini yeniden düşün.', errorReview: { level: 'sourced', by: 'owner' } };
  assert.match(api.kaoExplain(sourced, null, false), /Ekin işlevini yeniden düşün/, 'onaylı errorTr kullanılır');
});

check('Arapça yalnız görev nesnesinden gelir; explain sözlüğe bakmaz', () => {
  const src = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');
  const body = src.slice(src.indexOf('function kaoExplain'), src.indexOf('function ', src.indexOf('function kaoExplain') + 10));
  assert.doesNotMatch(body, /QuranLexiconV1|byId\(/, 'explain sözlüğe doğrudan bakmaz');
  const { api } = boot();
  const arTask = { id: 'k', cardId: 'w:l_som_585f33:ar>tr', type: 'word', kind: 'word', answer: 'a', ar: 'رَحْمَة', choices: [] };
  assert.match(api.kaoExplain(arTask, null, false), /رَحْمَة/, 'görevdeki Arapça kullanılır');
});

check('kavram çözümlü örnekleri: workedTr onaylıysa explain içinde görünür', () => {
  const { api, grammar } = boot();
  const concept = grammar.byId('g0_5');
  const tpl = concept.templates[0];
  const task = { id: 'g', cardId: `g:${concept.id}:${tpl.id}`, type: 'grammar', kind: 'grammar', answer: 'x', choices: [], workedTr: 'Örnek: önce iş, sonra yapan.', workedReview: { level: 'sourced', by: 'owner' } };
  assert.match(api.kaoExplain(task, null, false), /Örnek: önce iş/, 'çözümlü örnek görünür');
  const draft = Object.assign({}, task, { workedReview: { level: 'draft' } });
  assert.equal(/Örnek: önce iş/.test(api.kaoExplain(draft, null, false)), false, 'draft çözümlü örnek gösterilmez');
});

check('L0: texts.tr.json concepts girişleri geçerli ve Arapça içermez', () => {
  const raw = fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/content/texts.tr.json'), 'utf8');
  const data = JSON.parse(raw);
  assert.ok(data.concepts && typeof data.concepts === 'object', 'concepts bölümü var');
  const ids = Object.keys(data.concepts);
  assert.equal(ids.length, 25, `25 kavram: ${ids.length}`);
  assert.doesNotMatch(raw, /[\u0600-\u06ff]/, 'Arapça yok');
  for (const id of ids) {
    const entry = data.concepts[id];
    assert.ok(['draft', 'sourced', 'expert'].includes(entry.review.level), `${id}: review.level`);
    assert.ok(typeof entry.workedTr === 'string' && entry.workedTr.length > 0, `${id}: workedTr`);
    assert.ok(typeof entry.errorTr === 'string' && entry.errorTr.length > 0, `${id}: errorTr`);
  }
});

check('inceleme sayfası ve kavram sayfası explain/workedTr kullanır', () => {
  assert.ok(fs.existsSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-18.md')), 'INCELEME-KAO2-18.md var');
  const sheet = fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-18.md'), 'utf8');
  assert.match(sheet, /workedTr|Çözümlü örnek/, 'inceleme sayfası çözümlü örneği listeler');
  assert.match(sheet, /errorTr|Hata açıklaması/, 'inceleme sayfası hata açıklamasını listeler');
  const viewSrc = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearnViews.js'), 'utf8');
  assert.match(viewSrc, /kao-grammar-worked|worked/, 'kavram sayfası çözümlü örnek satırı taşır');
});

console.log(`KAO2-18 explain: PASS (${passed} kontrol)`);
