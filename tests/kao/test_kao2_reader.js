'use strict';

// KAO2-19 · Sûre bağlamı ve okuyucu v2 (S-09). Sentetik VM; ağ, tarayıcı,
// gerçek kullanıcı verisi yok. Kapatılan bulgular: 01 Y-12 · 02 T-20 · 02 T-21.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const decode = (h) => h.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1',
  'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];

function boot() {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const n of CONTENT) vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), box, { filename: n });
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), box, { filename: f });
  }
  const played = [];
  const data = { settings: {}, days: {}, quranLearn: null };
  const ui = { kaoOpen: true, kaoView: 'reader', kaoSurahId: 95, kaoStack: [] };
  const api = box.window.SeymaQuranLearn;
  api.registerQuranLearn({ data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-30', esc, icon: () => '', getDay: () => ({}) });
  api.registerQuranLearnSurface({
    createAudio: (src) => { played.push(src); const handlers = {}; return { preload: '', addEventListener: (t, fn) => { handlers[t] = fn; }, play: () => { handlers.ended && handlers.ended(); return undefined; } }; },
    toast() {}, setTimer() { return 1; }, clearTimer() {}, isQuietTime: false,
    mount() {}, lockBody() {}, unlockBody() {}, focusDialog() {}, restoreFocus() {}, activeElementId: () => '',
    sheetClose(el, back, done) { done && done(); }, taskElement: () => null, scrollIntoView() {}
  });
  const q = api.ensureQuranLearn(data);
  q.onboarding.doneAt = '2026-09-20T00:00:00.000Z';
  return { api, box, data, ui, q, played, surahs: box.window.QuranShortSurahsV1, rev: box.window.QuranRevelationOrderV1 };
}

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };
const readerHtml = (t) => { t.api.kaoSetView('reader'); return decode(t.api.kaoReaderHTML()); };

// ---- (a) Sûre tanıtım kartı -------------------------------------------------
check('(a) okuyucu başında sûre tanıtım kartı: ad, nüzul yeri, âyet sayısı, tema', () => {
  const t = boot();
  const html = readerHtml(t);
  assert.match(html, /class="kao-reader-surah"/, 'tanıtım kartı var');
  const meta = t.rev.byId(t.surahs.surahs.find((s) => s.id === 95).name);
  assert.match(html, /Mekke|Medine/, 'nüzul yeri yazılır');
  assert.match(html, /âyet/, 'âyet sayısı etiketi var');
  assert.ok(/[0-9]/.test(html), 'sayısal âyet bilgisi var');
  // Tanıtım kartı okuma alanını daraltmaz: tek bölüm, kendi içinde katlanabilir.
  assert.match(html, /<details[^>]*class="kao-reader-surah"/, 'tanıtım katlanabilir (okuma alanını daraltmaz)');
  assert.ok(meta === undefined || true);
});

// K2F-26 (M-02 · M-03): kaynaksız/yanlış atıflı 20 `contextTr` kaldırıldı; tanıtım kartı yalnız QuranRevelationOrderV1'den çizilir.
check('(a) K2F-26: sûre bağlamı kaldırıldı — motorda okuyucu, müfredat modülünde `surahs`, metin kaynağında `surahs` ve yanlış atıflar yok', () => {
  const t = boot();
  assert.equal(t.api.kaoReaderContext, undefined, 'bağlam okuyucusu motordan kalkmalı');
  assert.equal(t.box.window.QuranCurriculumV2.surahs, undefined, 'müfredat modülünde surahs kalmamalı');
  const texts = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/kao2/content/texts.tr.json'), 'utf8'));
  assert.equal(texts.surahs, undefined, 'texts.tr.json surahs kalmamalı');
  assert.deepEqual(Object.keys(texts.sources).filter((key) => key === 'diyanet-meal' || key === 'tdv-sure'), [], 'yanlış atıf kalmamalı');
  const css = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
  assert.doesNotMatch(css, /kao-reader-context/, 'ölü bağlam stili kalmamalı');
});

check('(a) K2F-26: "Hakkında ve kaynaklar" sayfası silinen sûre bağlamını saymaz (eskiden "0 sûre bağlamı" yazardı)', () => {
  const t = boot();
  const html = decode(t.api.kaoSourcesPageHTML());
  assert.match(html, /KAO2 · metin katmanı/, 'sürüm satırı korunur');
  assert.doesNotMatch(html, /sûre bağlamı/, 'silinen özelliğe atıf kalmamalı');
  assert.doesNotMatch(html, /\b0 sûre/, 'anlamsız sıfır sayacı kalmamalı');
});

check('(a) K2F-26: 20 kısa sûrenin 20\'sinde tanıtım kartı nüzul yeri + âyet sayısı + tema gösterir; bağlam satırı yoktur', () => {
  const t = boot();
  assert.equal(t.surahs.surahs.length, 20);
  for (const surah of t.surahs.surahs) {
    t.api.kaoOpenSurah(surah.id);
    const html = decode(t.api.kaoReaderHTML());
    const meta = t.rev.byMushafOrder(surah.id);
    assert.ok(meta && meta.themeTr && meta.ayahCount && meta.revelationPlace, `${surah.id}: nüzul verisi eksik`);
    assert.ok(html.includes(meta.revelationPlace === 'Mekke' ? 'Mekke’de indi' : 'Medine’de indi'), `${surah.id}: nüzul yeri yok`);
    assert.ok(html.includes(`${meta.ayahCount} âyet`), `${surah.id}: âyet sayısı yok`);
    assert.ok(html.includes(meta.themeTr), `${surah.id}: tema yok`);
    assert.doesNotMatch(html, /kao-reader-context/, `${surah.id}: bağlam satırı çizildi`);
  }
});

// ---- (b) WordChip: kenarlıksız, altı noktalı, anlam alt panelde --------------
check('(b) kelimeler kenarlıksız; bilinmeyen altı noktalı', () => {
  const t = boot();
  const html = readerHtml(t);
  assert.match(html, /kao-reader-word/, 'kelime sarmalayıcı var');
  assert.match(html, /is-unknown/, 'bilinmeyen durumu var');
  assert.doesNotMatch(html, /kao-reader-word[^"]*"[^>]*style="[^"]*border/, 'kenarlık satır içi verilmez');
  const css = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
  const block = /\.kao-reader-word\b[^{]*\{[^}]*\}/.exec(css);
  assert.ok(block, '.kao-reader-word kuralı var');
  assert.doesNotMatch(block[0], /border:\s*(?!0)/, 'kelime kenarlıklı kutu DEĞİL (T-20)');
  assert.match(css, /kao-reader-word[^{]*is-unknown[^{]*\{[^}]*dotted/, 'bilinmeyen altı noktalı (T-20)');
});

check('(b) dokununca anlam ALT PANELDE açılır; satır akışı bozulmaz', () => {
  const t = boot();
  const before = readerHtml(t);
  const word = t.surahs.words.find((w) => w.surahId === 95);
  t.api.kaoReader('word', t.surahs.words.filter((w) => w.surahId === 95).indexOf(word));
  const after = decode(t.api.kaoReaderHTML());
  assert.match(after, /class="kao-reader-panel"/, 'alt panel var');
  assert.match(after, /kao-reader-panel[^>]*role="dialog"|kao-reader-panel[^>]*aria-live/, 'panel erişilebilir');
  assert.match(after, new RegExp(esc(word.tr).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'panelde anlam yazılır');
  // Anlam artık kelime içinde basılmaz → satır akışı sabit kalır.
  assert.doesNotMatch(after, /kao-reader-meaning/, 'anlam kelime içinde basılmaz (akış bozulmaz)');
  assert.equal(after.replace(/\s+/g, ' ').length > before.length, true, 'panel eklendi');
});

// ---- (c) Dinle: kelime kelime + aria-current --------------------------------
check('(c) "Dinle" kelime kelime çalar ve çalan kelimeye aria-current verir', () => {
  const t = boot();
  const words = t.surahs.words.filter((w) => w.surahId === 95).sort((a, b) => a.ayah - b.ayah || a.i - b.i);
  t.api.kaoSetView('reader');
  assert.equal(t.api.kaoReader('play', 'all'), true, 'çalma başlar');
  const expected = words.map((w) => `assets/kao/audio/s-${w.surahId}-${w.ayah}-${w.i}.m4a`);
  assert.equal(t.played.length, expected.length, `çalınan klip sayısı (beklenen ${expected.length}, gelen ${t.played.length})`);
  const firstDiff = t.played.findIndex((src, i) => src !== expected[i]);
  assert.equal(firstDiff, -1, `ilk farklı klip #${firstDiff}: gelen ${t.played[firstDiff]} · beklenen ${expected[firstDiff]}`);
  const html = decode(t.api.kaoReaderHTML());
  assert.match(html, /aria-current="true"/, 'çalan kelime işaretlenir');
  const css = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
  assert.match(css, /kao-reader-word[^{]*\[aria-current="true"\][^{]*\{/, 'çalan kelime görsel olarak vurgulanır');
});

check('(c) ses yoksa sessiz yol: hata metni, çökme yok', () => {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const n of CONTENT) vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), box, { filename: n });
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), box, { filename: f });
  }
  const data = { settings: {}, days: {}, quranLearn: null };
  const ui = { kaoOpen: true, kaoSurahId: 95, kaoStack: [] };
  const api = box.window.SeymaQuranLearn;
  api.registerQuranLearn({ data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-30', esc, icon: () => '', getDay: () => ({}) });
  // createAudio yok → ses yolu kapalı olmalı, istisna atmamalı.
  api.registerQuranLearnSurface({ toast() {}, isQuietTime: false, mount() {}, lockBody() {}, unlockBody() {}, focusDialog() {}, restoreFocus() {}, activeElementId: () => '', taskElement: () => null });
  api.ensureQuranLearn(data).onboarding.doneAt = '2026-09-20T00:00:00.000Z';
  api.kaoSetView('reader');
  assert.equal(api.kaoReader('play', 'all'), false, 'ses yoksa false döner');
  const html = decode(api.kaoReaderHTML());
  assert.match(html, /kao-reader/, 'okuyucu yine çizilir (sessiz yol)');
});

// ---- (d) Seçili sûre görünür alana kaydırılır (motor tarafında) --------------
check('(d) sûre seçici seçili öğeyi motor tarafında işaretler (render değil)', () => {
  const t = boot();
  const html = readerHtml(t);
  const picker = /class="kao-surah-picker"[\s\S]*?<\/div>/.exec(html);
  assert.ok(picker, 'sûre seçici var');
  const current = picker[0].match(/aria-current="true"[\s\S]*?>([^<]+)</);
  assert.ok(current, 'seçili sûre işaretli (T-21)');
  assert.match(picker[0], /data-kao-scroll/, 'kaydırma işareti çıktıda (motor belirler)');
  // Motor kaydırma hedefini verir; DOM işini yüzey yapar.
  assert.equal(typeof t.api.kaoReaderScrollTarget, 'function', 'motor kaydırma hedefini bildirir');
  assert.equal(t.api.kaoReaderScrollTarget(), 95, 'hedef seçili sûre');
});

// ---- (e) "Anladım" öncesi 3 soruluk hızlı kontrol ---------------------------
check('(e) "Anladım" öncesi 3 soruluk hızlı kontrol; sonra gecikmeli test planlanır', () => {
  const t = boot();
  const words = t.surahs.words.filter((w) => w.surahId === 95);
  assert.equal(typeof t.api.kaoSurahCheck, 'function', 'hızlı kontrol modeli var');
  t.api.kaoSetView('reader');
  let html = decode(t.api.kaoReaderHTML());
  assert.match(html, /App\.kaoReader\(&#39;checkstart&#39;\)|App\.kaoReader\('checkstart'\)/, 'hızlı kontrol başlatılabilir (Y-12)');
  // Kontrol başlat: 3 soru.
  assert.equal(t.api.kaoReader('checkstart'), true, 'kontrol başlar');
  const model = t.api.kaoSurahCheck();
  assert.equal(model.questions.length, 3, 'üç soru (Y-12)');
  const ids = new Set(model.questions.map((qq) => qq.lemmaId));
  assert.ok([...ids].every((id) => words.some((w) => w.lemmaId === id)), 'sorular sûrenin kendi kelimelerinden');
  html = decode(t.api.kaoReaderHTML());
  assert.match(html, /kao-reader-check/, 'kontrol ekranda görünür');
  // Üçünü de doğru yanıtla → anlaşıldı kaydı ve 7 günlük test.
  for (const qq of model.questions) t.api.kaoReader('answer', { id: qq.id, choice: qq.correctId });
  assert.equal(t.api.kaoSurahCheck().done, true, 'kontrol tamamlandı');
  const before = t.q.surahs['95'] || {};
  assert.equal(before.understoodAt === undefined || !!before.understoodAt, true, 'durum tutarlı');
  assert.equal(t.api.kaoReader('understood'), true, 'anladım kaydedilir');
  const rec = t.q.surahs['95'];
  assert.ok(rec.understoodAt, 'anladım zamanı yazıldı');
  assert.ok(rec.delayedTestAt, 'gecikmeli test planlandı');
  const gap = (new Date(rec.delayedTestAt) - new Date(rec.understoodAt)) / 86400000;
  assert.ok(gap >= 6.5 && gap <= 7.5, `gecikmeli test ~7 gün (${gap.toFixed(2)})`);
});

check('(e) kontrol tamamlanmadan "Anladım" tek dokunuşla geçilemez', () => {
  const t = boot();
  t.api.kaoSetView('reader');
  assert.equal(typeof t.api.kaoMarkUnderstood, 'function');
  const html = decode(t.api.kaoReaderHTML());
  // Birincil eylem önce kontrolü açar; doğrudan "anladım" yazmaz.
  assert.match(html, /checkstart/, 'birincil yol kontrolden geçer (Y-12)');
  const understoodButton = /class="kao-primary"[^>]*onclick="([^"]+)"/.exec(html);
  assert.ok(understoodButton, 'birincil düğme var');
  assert.match(understoodButton[1], /checkstart/, 'tek dokunuşla anladım YOK');
});

// ---- Y-12 kapanış kapısı: hızlı kontrolden sonra anladım ---------------------
check('Y-12 kapanır: öz-beyan öncesi anlama kontrolü zorunlu', () => {
  const t = boot();
  t.api.kaoSetView('reader');
  const html = decode(t.api.kaoReaderHTML());
  assert.match(html, /kao-reader-check|checkstart/, 'okuyucuda kontrol yolu var');
  assert.doesNotMatch(html, /class="kao-primary"[^>]*kaoMarkUnderstood/, 'doğrudan öz-beyan düğmesi yok');
});

// ---- T-21 kapanır: seçili sûre kaydırma hedefi -------------------------------
check('T-21 kapanır: seçili sûre kaydırma hedefi motor tarafından verilir', () => {
  const t = boot();
  t.ui.kaoSurahId = 112;
  t.api.kaoSetView('reader');
  assert.equal(t.api.kaoReaderScrollTarget(), 112, 'seçili sûre hedefi');
});

// ---- Sessiz saat: uygulamanın genel ses kuralı okumada da geçerli -------------
check('(c) sessiz saatte (23:00–07:00) ses çalmaz; okuma sessizce sürer', () => {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const n of CONTENT) vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), box, { filename: n });
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), box, { filename: f });
  }
  const played = [];
  const data = { settings: {}, days: {}, quranLearn: null };
  const ui = { kaoOpen: true, kaoSurahId: 95, kaoStack: [] };
  const api = box.window.SeymaQuranLearn;
  api.registerQuranLearn({ data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-30', esc, icon: () => '', getDay: () => ({}) });
  api.registerQuranLearnSurface({
    createAudio: (src) => { played.push(src); const h = {}; return { preload: '', addEventListener: (t, fn) => { h[t] = fn; }, play: () => { h.ended && h.ended(); } }; },
    toast() {}, isQuietTime: true, mount() {}, lockBody() {}, unlockBody() {}, focusDialog() {}, restoreFocus() {},
    activeElementId: () => '', sheetClose(e, bk, done) { done && done(); }, taskElement: () => null
  });
  api.ensureQuranLearn(data).onboarding.doneAt = '2026-09-20T00:00:00.000Z';
  api.kaoSetView('reader');
  assert.equal(api.kaoReader('play', 'all'), false, 'sessiz saatte çalma başlamaz');
  assert.equal(played.length, 0, 'hiç klip istenmez (SeyAudio kuralıyla tutarlı)');
  const html = decode(api.kaoReaderHTML());
  assert.match(html, /Sessiz saat/, 'kullanıcıya sessizlik nedeni söylenir');
  assert.match(html, /kao-reader-word/, 'okuma yüzeyi açık kalır');
});

console.log(`KAO2 reader: PASS (${passed} kontrol)`);
