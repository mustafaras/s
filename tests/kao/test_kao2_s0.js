'use strict';

// KAO2-21 · Seviye 0 yeniden kuruluş (K-3 kademe B). Sentetik VM; ağ, tarayıcı,
// gerçek kullanıcı verisi yok. Kapsam: 07 §2 sırası (şekil aileleri) + konum
// tablosu 28×4 + harf başına kelime sesi + S0 ders akışı + kapının yalnız
// yerleştirme kalması.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
// Depo kökü konumdan bağımsız bulunur: bu dosya tests/kao DIŞINDA yaşar (kırmızı
// kalacağı için test glob'unu kirletmez), bu yüzden '../repo-root' çözülmez.
const repoRoot = (() => {
  let dir = __dirname;
  for (let i = 0; i < 6; i += 1) {
    if (fs.existsSync(path.join(dir, 'index.html')) && fs.existsSync(path.join(dir, 'app.js'))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error('HEDEF-SPEC: depo kökü bulunamadı');
})();

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const decode = (h) => h.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranMahrecSchemasV1',
  'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];

// 07 §2 sırası: başlıklar birebir (şekil aileleri, ses kovaları DEĞİL).
const S0_ORDER = [
  'Sağdan sola, harf ve hareke', 'Nokta ailesi', 'Esre ve ötre', 'Çengel ailesi',
  'Bağlanmayan harfler', 'Dişli aile', 'Konum şekilleri', 'Sükûn ve kapalı hece',
  'Uzatma (med) ve şedde', 'Kalan harfler', 'Tenvin, elif-lâm, vasıl', 'İlk okuma provası'
];
// Bağlanmayan 6 harf (07 §2 · ders 0.5).
// A3 (kullanıcı kararı): elif (ا) donmuş içerikte YOK; küme veriyle sınırlı.
const NON_JOINING = ['dal', 'dhal', 'ra', 'zay', 'waw', 'hamza'];

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
  api.registerQuranLearn({ data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-30', esc, icon: () => '', getDay: () => ({}) });
  const played = [];
  api.registerQuranLearnSurface({
    createAudio: (src) => { played.push(src); const h = {}; return { preload: '', addEventListener: (t, fn) => { h[t] = fn; }, play: () => { h.ended && h.ended(); } }; },
    toast() {}, isQuietTime: false, mount() {}, lockBody() {}, unlockBody() {}, focusDialog() {}, restoreFocus() {},
    activeElementId: () => '', sheetClose(e, bk, done) { done && done(); }, taskElement: () => null
  });
  const q = api.ensureQuranLearn(data);
  q.onboarding.doneAt = '2026-09-20T00:00:00.000Z';
  if (seed) seed(q, api, box.window);
  return { api, box, data, ui, q, played, phonics: box.window.QuranPhonicsV1, curriculum: box.window.QuranCurriculumV2 };
}

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

// ---- (a) 12 S0 dersi 07 §2 sırasıyla ---------------------------------------
check('(a) S0 dersleri 07 §2 sırasını birebir izler', () => {
  const t = boot();
  const lessons = t.curriculum.s0.lessons;
  assert.equal(lessons.length, 12, 'tam 12 Seviye 0 dersi');
  assert.deepEqual(Array.from(lessons, (l) => String(l.title)), S0_ORDER, 'başlık sırası 07 §2');
  assert.deepEqual(Array.from(lessons, (l) => String(l.id)), S0_ORDER.map((_, i) => `s0.${String(i + 1).padStart(2, '0')}`), 'kimlik sırası');
});

check('(a) her harf tam bir ilk tanıtım dersinde (çift tanıtım yok)', () => {
  const t = boot();
  const model = t.api.kaoS0Model();
  const letters = Array.from(t.phonics.letters, (l) => String(l.id));
  assert.equal(model.introductions.length, letters.length, '28 harf tanıtılır');
  assert.equal(model.introductions.filter((i) => i.silent).length, 0, 'sessiz harf 0');
  const seen = Array.from(model.introductions, (i) => String(i.letterId));
  assert.equal(new Set(seen).size, seen.length, 'hiçbir harf iki kez tanıtılmaz');
  assert.deepEqual([...seen].sort(), [...letters].sort(), 'tüm harfler kapsanır');
  for (const item of model.introductions) assert.ok(/^s0\.\d{2}$/.test(item.lessonId), `${item.letterId}: ders kimliği`);
});

// ---- (b) Konum tablosu 28 × 4 ----------------------------------------------
check('(b) konum tablosu 28 harf × 4 biçim üretir', () => {
  const t = boot();
  const table = t.api.kaoS0PositionTable();
  assert.equal(table.rows.length, 28, '28 satır');
  assert.deepEqual(Array.from(table.columns, (c) => String(c.key)), ['isolated', 'initial', 'medial', 'final'], 'dört biçim sütunu');
  for (const row of table.rows) {
    assert.equal(row.cells.length, 4, `${row.letterId}: dört hücre`);
    for (const cell of row.cells) assert.equal(typeof cell.ar, 'string', 'hücre Arapça metin taşır');
  }
});

check('(b) biçimler araçla üretilir: ZWJ bağlama kuralları', () => {
  const t = boot();
  const table = t.api.kaoS0PositionTable();
  const ZWJ = '\u200d';
  for (const row of table.rows) {
    const [iso, ini, med, fin] = Array.from(row.cells, (c) => String(c.ar));
    assert.equal(iso, row.letter, `${row.letterId}: tek biçim = çıplak harf`);
    if (row.joins) {
      assert.equal(ini, row.letter + ZWJ, `${row.letterId}: baş = harf+ZWJ`);
      assert.equal(med, ZWJ + row.letter + ZWJ, `${row.letterId}: orta = ZWJ+harf+ZWJ`);
      assert.equal(fin, ZWJ + row.letter, `${row.letterId}: son = ZWJ+harf`);
    } else {
      // Bağlanmayan harfte baş/orta biçimi YOK işareti (uydurma biçim üretilmez).
      for (const [label, cell] of [['initial', row.cells[1]], ['medial', row.cells[2]]]) {
        assert.equal(cell.ar, '', `${row.letterId}: ${label} biçimi yok`);
        assert.equal(cell.unavailable, true, `${row.letterId}: ${label} "yok" işaretli`);
      }
      assert.equal(fin, ZWJ + row.letter, `${row.letterId}: son biçim ZWJ+harf`);
    }
  }
});

check('(b) bağlanmayan 6 harf tam olarak işaretli', () => {
  const t = boot();
  const table = t.api.kaoS0PositionTable();
  const nonJoin = Array.from(table.rows).filter((r) => !r.joins).map((r) => String(r.letterId)).sort();
  assert.deepEqual(nonJoin, [...NON_JOINING].sort(), 'bağlanmayan harf kümesi 07 §2 ile aynı');
});

// ---- (c) Her harf için ≥1 kelime sesi --------------------------------------
check('(c) her harf için gerçek kelime sesi; dosya diskte var', () => {
  const t = boot();
  const audioDir = path.join(repoRoot, 'assets/kao/audio');
  const have = new Set(fs.readdirSync(audioDir));
  const model = t.api.kaoS0Model();
  let silent = 0;
  for (const item of model.introductions) {
    if (!item.wordClip) { silent += 1; continue; }
    assert.ok(have.has(item.wordClip.file), `${item.letterId}: klip diskte (${item.wordClip.file})`);
    // Çıplak biçim hedef harfle başlar ve ≤3 hece.
    assert.equal(item.wordClip.startsWithLetter, true, `${item.letterId}: kelime hedef harfle başlar`);
    assert.ok(item.wordClip.syllables <= 3, `${item.letterId}: ≤3 hece (${item.wordClip.syllables})`);
  }
  // Sessiz harf sayısı kanıta yazılır; hedef 0.
  assert.ok(silent === 0, `sessiz harf sayısı 0 olmalı (ölçülen ${silent})`);
});

// ---- (d) S0 ders akışı -----------------------------------------------------
check('(d) S0 ders akışı: açıklama → dinle-gör → alıştırmalar → gerçek kelime', () => {
  const t = boot();
  const flow = t.api.kaoS0Lesson('s0.02');
  assert.equal(flow.stages[0].kind, 'intro', 'ilk aşama açıklama');
  assert.equal(flow.stages[1].kind, 'listen', 'ikinci aşama dinle-gör');
  const drills = flow.stages.filter((s) => s.kind === 'drill');
  assert.ok(drills.length >= 1, 'alıştırma aşaması var');
  const total = drills.reduce((n, d) => n + d.count, 0);
  assert.ok(total >= 6 && total <= 8, `6–8 alıştırma (ölçülen ${total})`);
  const kinds = new Set(drills.flatMap((d) => d.drills.map((x) => x.kind)));
  assert.ok(kinds.has('letter-id'), 'harf tanıma alıştırması');
  assert.ok(kinds.has('position'), 'konum alıştırması');
  assert.equal(flow.stages[flow.stages.length - 1].kind, 'read', 'son aşama gerçek kelime okuma');
});

check('(d) ses yoksa görsel akışla tamamlanır; çalışmayan ses düğmesi gösterilmez', () => {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const n of CONTENT) vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), box, { filename: n });
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), box, { filename: f });
  }
  const data = { settings: {}, days: {}, quranLearn: null };
  const ui = { kaoOpen: true, kaoView: 'gate', kaoStack: [] };
  const api = box.window.SeymaQuranLearn;
  api.registerQuranLearn({ data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-30', esc, icon: () => '', getDay: () => ({}) });
  // createAudio YOK → ses yolu kapalı.
  api.registerQuranLearnSurface({ toast() {}, isQuietTime: false, mount() {}, lockBody() {}, unlockBody() {}, focusDialog() {}, restoreFocus() {}, activeElementId: () => '', sheetClose(e, bk, done) { done && done(); }, taskElement: () => null });
  api.ensureQuranLearn(data).onboarding.doneAt = '2026-09-20T00:00:00.000Z';
  api.kaoS0Start('s0.02');
  const html = decode(api.kaoS0HTML());
  assert.match(html, /kao-s0/, 'S0 akışı çizilir');
  assert.doesNotMatch(html, /App\.kaoS0\(&#39;audio&#39;\)|App\.kaoS0\('audio'\)/, 'ses yoksa ses düğmesi gösterilmez');
  assert.match(html, /ses kapalı/, 'kullanıcıya sessiz yol anlatılır');
});

// ---- (e) S0.12 Besmele + Fâtiha 1: kelime kelime dinlerken oku --------------
check('(e) son ders kelime kelime dinlerken oku sunar', () => {
  const t = boot();
  const flow = t.api.kaoS0Lesson('s0.12');
  assert.equal(flow.kind, 'reading', 'son ders okuma provası');
  assert.ok(flow.words.length > 0, 'kelime listesi var');
  for (const word of flow.words.slice(0, 3)) {
    assert.ok(word.ar && word.tr, 'kelime Arapça + Türkçe anlam');
    // Fâtiha bir NAMAZ metnidir (sûre değil): klipler kelime lemmasına bağlıdır.
    assert.ok(word.clip && /^w-[A-Za-z0-9_]+-measured\.m4a$/.test(word.clip), `klip adı (${word.clip})`);
    assert.ok(fs.existsSync(path.join(repoRoot, 'assets/kao/audio', word.clip)), `klip diskte (${word.clip})`);
  }
  // Ses yolu açıkken genel eylem çalmayı başlatır ve klipler diskte vardır.
  assert.equal(t.api.kaoS0Start('s0.12'), true);
  assert.equal(t.api.kaoS0('playall'), true, 'kelime kelime çalma başlar');
  assert.ok(t.played.length > 0, 'en az bir klip istendi');
});

// ---- (f) Kapı yalnız yerleştirme -------------------------------------------
check('(f/B2) kapı DOKUNULMAZ; yeni S0 akışı AYRI yüzey', () => {
  const t = boot();
  // B2 kararı: kapı yalnız yerleştirme kalır, mini dersler KALIR (commit'li sözleşme).
  const tasks = t.api.kaoGateTasks();
  assert.ok(tasks, 'kapı görevleri var');
  assert.equal(tasks.lessons.length, 12, 'kapıdaki 12 mini ders korunur (B2)');
  assert.equal(tasks.reading.length, 20, '20 okunuş sorusu kalır');
  assert.equal(tasks.listening.length, 12, '12 minimal çift kalır');
  // Yeni S0 yüzeyi ayrı ve erişilebilir.
  assert.equal(t.curriculum.s0.lessons.length, 12, 'S0 müfredatı ayrı yaşar');
  assert.equal(t.api.kaoS0Start('s0.02'), true, 'S0 dersi ayrı yüzeyde başlar');
  const html = decode(t.api.kaoS0HTML());
  assert.match(html, /kao-s0/, 'S0 ekranı çizilir');
  assert.doesNotMatch(html, /kao-gate/, 'kapı yüzeyi S0 ekranına karışmaz');
});

// ---- (g) K2F-12 · App.kaoS0 tanımlı ve S0 görünümü gerçekten açılır ---------------
const kao = require('./helpers/kao-harness');
check('(g/K2F-12) kaoS0("start") yığına s0 görünümünü iter: NavBar "Harfler", ders ekranı çizilir, geri ana ekrana döner', () => {
  const t = kao.bootKao();
  kao.freshUser(t);
  assert.equal(t.api.kaoOpen('home'), true);
  assert.equal(t.api.kaoS0('start', 's0.02'), true, 'S0 dersi başlar');
  assert.equal(t.ui.kaoView, 's0', 'görünüm s0');
  const views = Array.from(t.ui.kaoStack, (e) => e.view);
  assert.deepEqual(views.slice(-2), ['home', 's0'], 'yığın: ana ekran → s0 (gerçek yönlendirme)');
  const html = t.api.kaoOverlayHTML(t.NOW);
  assert.equal(kao.navTitle(html), 'Harfler', 'NavBar başlığı');
  assert.match(html, /kao-s0/, 'S0 ekranı çizilir');
  assert.match(kao.text(html), /Nokta ailesi/, 'seçilen dersin başlığı');
  assert.equal(t.api.kaoS0('next'), true, 'sıradaki adım çalışır');
  assert.equal(t.ui.kaoView, 's0', 'sıradaki adım görünümü değiştirmez');
  assert.equal(t.api.kaoS0('start', 's0.03'), true, 'ikinci ders başlar');
  assert.equal(Array.from(t.ui.kaoStack, (e) => e.view).filter((v) => v === 's0').length, 1, 'ders değişince s0 yığında ikilenmez (replace)');
  assert.equal(t.api.kaoS0('start', 'yok-boyle-ders'), false, 'bilinmeyen ders reddedilir, görünüm değişmez');
  assert.equal(t.ui.kaoView, 's0');
  t.api.kaoBack();
  assert.equal(t.ui.kaoView, 'home', 'geri ana ekrana döner');
});

check('(g/K2F-12) app.js tek satırlık App.kaoS0 shim\'ini taşır ve motor yüzeyinde kaoS0 var', () => {
  const appSrc = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
  assert.match(appSrc, /App\.kaoS0 *= *function\(\)\{ *return window\.SeymaQuranLearn\.kaoS0\.apply\(null, *arguments\); *\};/);
  assert.equal(typeof kao.bootKao().api.kaoS0, 'function');
});

console.log(`KAO2 s0: PASS (${passed} kontrol)`);
