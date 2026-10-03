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
  assert.equal(api.kaoS0('next'), true, 'dinle-gör aşamasına geç');
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

check('(g/K2F-12) S0 görünümü a11y sözleşmesi: başlık etiketi, Arapça lang/dir, düğme adları ve odak diğer görünümlerle aynı', () => {
  const t = kao.bootKao();
  kao.freshUser(t);
  t.api.kaoOpen('home');
  const focusBefore = t.calls.focus.length;
  assert.equal(t.api.kaoS0('start', 's0.02'), true);
  assert.equal(t.calls.focus.length, focusBefore, 'görünüm değişimi odağı kendiliğinden taşımaz (units/grammar/stats ile aynı sözleşme)');
  const html = t.api.kaoOverlayHTML(t.NOW);
  const label = /<main class="kao-s0"[^>]*aria-labelledby="([^"]+)"/.exec(html);
  assert.ok(label, 'S0 ana bölgesi aria-labelledby taşır');
  assert.equal((html.match(new RegExp(`id="${label[1]}"`, 'g')) || []).length, 1, 'etiketlenen başlık tek ve var');
  assert.match(html, new RegExp(`role="dialog" aria-modal="true" aria-labelledby="${label[1]}"`), 'çerçeve diyaloğu S0 başlığıyla adlanır (K2F-27: eski sabit başlık kalktı)');
  for (const m of html.matchAll(/<[a-z0-9]+[^>]*dir="rtl"[^>]*>/g)) assert.match(m[0], /lang="ar"/, 'dir=rtl olan her öğe lang="ar" taşır: ' + m[0].slice(0, 60));
  const buttons = [...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)].map((m) => ({ tag: m[0], text: kao.text(m[1]) }));
  assert.ok(buttons.length >= 2, 'NavBar geri ve Sıradaki adım düğmeleri (K2F-27: modal X kalktı)');
  for (const b of buttons) assert.ok(b.text || /aria-label="[^"]+"/.test(b.tag), 'her düğmenin erişilebilir adı var: ' + b.tag.slice(0, 80));
  assert.ok(buttons.some((b) => /kaoBack\(\)/.test(b.tag)), 'NavBar geri düğmesi (App.kaoBack) var'); assert.ok(buttons.some((b) => b.text === 'Sıradaki adım'), 'birincil eylem');
  assert.ok(!/tabindex="[1-9]/.test(html), 'pozitif tabindex yok');
});

// ---- (h) K2F-13 · harfsiz 6 S0 dersi içerik kazanır, hiçbir S0 dersi çizimde çökmez ---------------
const FOCUS = {
  's0.01': { kind: 'marks', marks: ['fatha', 'damma', 'kasra'] },
  's0.03': { kind: 'marks', marks: ['kasra', 'damma'] },
  's0.07': { kind: 'positions', marks: [] },
  's0.08': { kind: 'sukun', marks: ['sukun'] },
  's0.09': { kind: 'madd-shadda', marks: ['shadda', 'dagger-alif'] },
  's0.11': { kind: 'tanwin-al', marks: ['tanwin', 'al'] }
};
const MARK_PATTERN = { fatha: /َ/, damma: /ُ/, kasra: /ِ/, sukun: /ْ/, shadda: /ّ/, 'dagger-alif': /ٰ/, tanwin: /[ً-ٍ]/, al: /^[ٱا]ل/ };
const syllablesOf = (ar) => (String(ar).match(/[ًَُِ-ٍ]/g) || []).length;
const hasHtmlError = (html) => /content-error|Seviye 0 dersi bulunamadı/.test(html);

check('(h/K2F-13) 12 S0 dersinin 12\'si kaoS0HTML ile çökmeden çizilir (R-06); her çizim dersin başlığını taşır', () => {
  const t = boot();
  for (const lesson of t.curriculum.s0.lessons) {
    assert.equal(t.api.kaoS0Start(lesson.id), true, `${lesson.id}: başlamalı`);
    let html;
    assert.doesNotThrow(() => { html = decode(t.api.kaoS0HTML()); }, `${lesson.id}: çizim çökmemeli`);
    assert.ok(!hasHtmlError(html), `${lesson.id}: içerik hatası`);
    assert.ok(html.includes(esc(lesson.title)) || html.includes(lesson.title), `${lesson.id}: başlık`);
  }
});

check('(h/K2F-13) harfsiz 6 ders `focus` taşır; ≥3 örnek kelime: ≤3 hece, hedef işareti içerir, klip diskte, Latin okunuşlu, tekrarsız', () => {
  const t = boot();
  const phonicsLetters = new Set(Array.from(t.phonics.letters, (l) => String(l.ar)));
  for (const [id, expected] of Object.entries(FOCUS)) {
    const lesson = t.curriculum.s0.lessons.find((l) => l.id === id);
    assert.ok(lesson.focus, `${id}: focus yok`);
    assert.equal(lesson.focus.kind, expected.kind, `${id}: focus türü`);
    assert.deepEqual(Array.from(lesson.focus.marks, (m) => m.id), expected.marks, `${id}: işaret kimlikleri`);
    for (const m of lesson.focus.marks) assert.ok(m.tr && m.glyph, `${id}/${m.id}: Türkçe ad ve işaret`);
    if (expected.kind === 'positions') continue;
    assert.ok(lesson.examples.length >= 3, `${id}: ${lesson.examples.length} örnek < 3`);
    assert.equal(new Set(Array.from(lesson.examples, (e) => e.wordId)).size, lesson.examples.length, `${id}: yinelenen örnek`);
    for (const e of lesson.examples) {
      assert.ok(syllablesOf(e.ar) <= 3, `${id}/${e.wordId}: ${syllablesOf(e.ar)} hece`);
      assert.ok(e.marks.some((m) => MARK_PATTERN[m].test(e.ar)), `${id}/${e.wordId}: hedef işaret yok`);
      assert.ok(fs.existsSync(path.join(repoRoot, 'assets/kao/audio', e.file)), `${id}/${e.wordId}: klip diskte yok (${e.file})`);
      assert.ok(e.translit && !/[؀-ۿ]/.test(e.translit), `${id}/${e.wordId}: Latin okunuş`);
      assert.ok(e.tr, `${id}/${e.wordId}: Türkçe anlam`);
    }
    for (const m of expected.marks) assert.ok(lesson.examples.some((e) => MARK_PATTERN[m].test(e.ar)), `${id}: ${m} için örnek yok`);
  }
  void phonicsLetters;
});

check('(h/K2F-13) harfsiz derslerin çizimi örnekleri okunuşuyla gösterir; konum dersi 28 harflik tabloyu taşır; ses düğmesi örnek indeksiyle çalışır', () => {
  const t = boot();
  for (const id of ['s0.01', 's0.03', 's0.08', 's0.09', 's0.11']) {
    t.api.kaoS0Start(id);
    assert.equal(t.api.kaoS0('next'), true, `${id}: dinle aşamasına geç`);
    const html = decode(t.api.kaoS0HTML());
    const lesson = t.curriculum.s0.lessons.find((l) => l.id === id);
    for (const e of lesson.examples) assert.ok(html.includes(e.ar) && html.includes(e.translit), `${id}: ${e.wordId} Arapça + okunuş görünmeli`);
    for (const m of lesson.focus.marks) assert.ok(html.includes(m.tr), `${id}: ${m.id} Türkçe adı görünmeli`);
  }
  t.api.kaoS0Start('s0.07');
  assert.equal(t.api.kaoS0('next'), true);
  const positions = decode(t.api.kaoS0HTML());
  assert.equal((positions.match(/class="kao-s0-pos-row"/g) || []).length, 28, '28 harflik konum tablosu');
  t.api.kaoS0Start('s0.01');
  assert.equal(t.api.kaoS0('audio', 0), true, 'ilk örnek çalınır (aşamadan bağımsız eylem)');
  assert.match(t.played[t.played.length - 1], /\.m4a$/, 'klip dosyası çalındı');
  assert.equal(t.api.kaoS0('audio', 99), false, 'olmayan örnek reddedilir');
});

check('(h/K2F-13) gerçek giriş satırı: Keşfet\'teki "Seviye 0" satırı (s0.01) açılır ve çizilir; 12 dersin hepsi görünüm üzerinden çökmeden açılır', () => {
  const t = kao.bootKao({ seeded: true });
  const home = t.api.kaoOverlayHTML(t.NOW);
  const m = /onclick="App\.kaoS0\(([^"]*)\)"/.exec(home);
  assert.ok(m, 'ana ekranda S0 satırı');
  const args = JSON.parse('[' + decode(m[1]) + ']');
  assert.deepEqual(args, ['start', 's0.01']);
  assert.equal(t.api.kaoS0(...args), true);
  assert.equal(t.ui.kaoView, 's0');
  let out;
  assert.doesNotThrow(() => { out = t.api.kaoOverlayHTML(t.NOW); }, 'giriş dersi görünüm üzerinden çizilmeli');
  assert.equal(kao.navTitle(out), 'Harfler');
  for (const lesson of t.win.QuranCurriculumV2.s0.lessons) {
    assert.equal(t.api.kaoS0('start', lesson.id), true, lesson.id);
    assert.doesNotThrow(() => t.api.kaoOverlayHTML(t.NOW), `${lesson.id}: görünüm çökmemeli`);
  }
});

// ---- (i) K2F-14 · 4 aşama gerçekten farklı; 6–8 puanlı alıştırma ---------------------------------
const primaries = (html) => (html.match(/<button[^>]*class="kao-primary"[^>]*>/g) || []);
const stageOf = (html) => (/data-stage="([a-z]+)"/.exec(html) || [])[1];
const nextQuestion = (t) => { const d = t.ui.kaoS0.drill; return d.items[d.index]; };
const answerWith = (t, wanted) => { const q = nextQuestion(t); const c = q.choices.find((x) => x.correct === wanted); return t.api.kaoS0('answer', c.id); };

function playAll(t, id, { wrongFirst = false } = {}) {
  const sig = {};
  assert.equal(t.api.kaoS0Start(id), true, id);
  sig.intro = decode(t.api.kaoS0HTML());
  assert.equal(stageOf(sig.intro), 'intro', `${id}: ilk aşama intro`);
  assert.equal(t.api.kaoS0('next'), true);
  sig.listen = decode(t.api.kaoS0HTML());
  assert.equal(stageOf(sig.listen), 'listen', `${id}: ikinci aşama listen`);
  assert.equal(t.api.kaoS0('next'), true);
  sig.drill = decode(t.api.kaoS0HTML());
  assert.equal(stageOf(sig.drill), 'drill', `${id}: üçüncü aşama drill`);
  const total = t.ui.kaoS0.drill.items.length;
  for (let i = 0; i < total; i += 1) {
    assert.equal(t.api.kaoS0('next'), false, `${id}: cevaplanmadan next pasif (soru ${i + 1})`);
    assert.equal(answerWith(t, !(wrongFirst && i === 0)), true);
    assert.equal(t.api.kaoS0('answer', 'c0'), false, `${id}: aynı soru ikinci kez cevaplanamaz`);
    if (i === 0) sig.feedback = decode(t.api.kaoS0HTML());
    assert.equal(t.api.kaoS0('next'), true);
  }
  sig.read = decode(t.api.kaoS0HTML());
  assert.equal(stageOf(sig.read), 'read', `${id}: dördüncü aşama read`);
  assert.equal(t.api.kaoS0('read', 'toggle'), true);
  sig.readShown = decode(t.api.kaoS0HTML());
  assert.equal(t.api.kaoS0('read'), true, 'Okudum');
  sig.done = decode(t.api.kaoS0HTML());
  assert.equal(stageOf(sig.done), 'done');
  return { sig, total, correct: t.ui.kaoS0.drill.correct };
}

check('(i/K2F-14) 12 ders × 4 aşama: aşama HTML\'leri birbirinden farklı, aşama başına ≤1 .kao-primary, her derste 6–8 soru, cevaplamadan next pasif', () => {
  for (const lesson of boot().curriculum.s0.lessons) {
    const t = boot();
    const { sig, total } = playAll(t, lesson.id);
    assert.ok(total >= 6 && total <= 8, `${lesson.id}: ${total} soru (6–8 olmalı)`);
    const stages = ['intro', 'listen', 'drill', 'read', 'done'];
    assert.equal(new Set(stages.map((k) => sig[k].replace(/\s+/g, ' '))).size, 5, `${lesson.id}: 5 aşama HTML'i birbirinden farklı`);
    for (const k of stages) assert.ok(primaries(sig[k]).length <= 1, `${lesson.id}/${k}: birden çok .kao-primary`);
    assert.match(sig.drill, /<button[^>]*class="kao-primary"[^>]*disabled/, `${lesson.id}: cevaplanmamış soruda birincil düğme pasif`);
    assert.match(sig.drill, /aria-live="polite"/, `${lesson.id}: geri bildirim aria-live`);
    assert.match(sig.read, /okunuşu gizli/, `${lesson.id}: okunuş başta gizli`);
    assert.doesNotMatch(sig.readShown, /okunuşu gizli/, `${lesson.id}: okunuş gösterilince açılır`);
    assert.match(sig.readShown, /Okunuşu gizle/);
  }
});

check('(i/K2F-14) puanlama: yanlış cevap doğrusunu gösterir ve doğru sayısını artırmaz; bitişte "n−1 / n doğru"', () => {
  const t = boot();
  const { sig, total, correct } = playAll(t, 's0.02', { wrongFirst: true });
  assert.equal(correct, total - 1, 'ilk soru yanlış → n−1 doğru');
  assert.match(sig.feedback, /Doğrusu: /, 'yanlışta doğru cevap gösterilir');
  assert.match(sig.feedback, /kao-choice-wrong/);
  assert.match(sig.feedback, /kao-choice-correct/);
  assert.match(sig.done, new RegExp(`${total - 1} / ${total} doğru`));
  const t2 = boot();
  const all = playAll(t2, 's0.02');
  assert.equal(all.correct, all.total);
  assert.match(all.sig.done, new RegExp(`${all.total} / ${all.total} doğru`));
});

check('(i/K2F-14) soru türleri dersin focus\'una göre; çeldiriciler benzersiz (2–4 şık, tek doğru); aynı ders tohumuyla bayt-eşit', () => {
  const kindsOf = (t, id) => { t.api.kaoS0Start(id); t.api.kaoS0('next'); t.api.kaoS0('next'); return new Set(t.ui.kaoS0.drill.items.map((x) => x.type)); };
  const t = boot();
  const expectKinds = {
    's0.02': ['letter-id', 'position', 'shape'], 's0.01': ['mark-name', 'word-sound', 'word-meaning'], 's0.03': ['mark-name', 'word-sound', 'word-meaning'],
    's0.07': ['position', 'form-letter'], 's0.08': ['mark-name', 'word-sound', 'word-meaning'], 's0.09': ['mark-name', 'word-sound', 'word-meaning'],
    's0.11': ['mark-name', 'word-sound', 'word-meaning'], 's0.12': ['word-meaning']
  };
  for (const [id, kinds] of Object.entries(expectKinds)) {
    const got = kindsOf(t, id);
    for (const k of kinds) assert.ok(got.has(k), `${id}: ${k} sorusu yok (${[...got].join(',')})`);
  }
  for (const lesson of t.curriculum.s0.lessons) {
    t.api.kaoS0Start(lesson.id); t.api.kaoS0('next'); t.api.kaoS0('next');
    for (const item of t.ui.kaoS0.drill.items) {
      assert.ok(item.choices.length >= 2 && item.choices.length <= 4, `${item.id}: şık sayısı`);
      assert.equal(item.choices.filter((c) => c.correct).length, 1, `${item.id}: tek doğru`);
      assert.equal(new Set(Array.from(item.choices, (c) => c.label)).size, item.choices.length, `${item.id}: şıklar benzersiz`);
    }
  }
  const run = () => { const b = boot(); b.api.kaoS0Start('s0.05'); b.api.kaoS0('next'); b.api.kaoS0('next'); return JSON.stringify(b.ui.kaoS0.drill.items); };
  assert.equal(run(), run(), 'aynı ders aynı sorular (belirlenimci)');
});

check('(i/K2F-14) tüm Arapça içerik modüllerden: soru uyaranı ve Arapça şıklar harf/konum/örnek/Fâtiha verisinde var; harf dersi çeldiricileri önce aynı aileden', () => {
  const t = boot();
  const allowed = new Set();
  for (const l of t.phonics.letters) allowed.add(String(l.ar));
  for (const r of t.api.kaoS0PositionTable().rows) for (const c of r.cells) if (c.ar) allowed.add(c.ar);
  for (const l of t.curriculum.s0.lessons) for (const e of (l.examples || [])) allowed.add(e.ar);
  for (const w of t.api.kaoS0Lesson('s0.12').words) allowed.add(w.ar);
  const marks = new Set(); for (const l of t.curriculum.s0.lessons) for (const m of ((l.focus && l.focus.marks) || [])) marks.add(m.glyph);
  for (const lesson of t.curriculum.s0.lessons) {
    t.api.kaoS0Start(lesson.id); t.api.kaoS0('next'); t.api.kaoS0('next');
    for (const item of t.ui.kaoS0.drill.items) {
      if (item.stimulus.ar) assert.ok(allowed.has(item.stimulus.ar), `${item.id}: uyaran Arapçası modülde yok`);
      if (item.stimulus.glyph) assert.ok(marks.has(item.stimulus.glyph), `${item.id}: işaret simgesi modülde yok`);
      for (const c of item.choices) if (c.ar) assert.ok(allowed.has(c.label), `${item.id}: Arapça şık modülde yok`);
    }
  }
  t.api.kaoS0Start('s0.05'); t.api.kaoS0('next'); t.api.kaoS0('next');
  const family = new Set(['dal', 'dhal', 'ra', 'zay', 'waw'].map((id) => t.phonics.letters.find((l) => l.id === id).ar));
  const shape = t.ui.kaoS0.drill.items.find((x) => x.type === 'shape');
  assert.ok(shape.choices.filter((c) => !c.correct && family.has(c.label)).length >= 2, 'şekil sorusunda çeldiriciler önce aynı aileden');
});

check('(i/K2F-14) ses yoksa alıştırma ve okuma yine tamamlanır; "ses kapalı" notu dinle aşamasında görünür, çalışmayan ses düğmesi yok', () => {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const n of CONTENT) vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), box, { filename: n });
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), box, { filename: f });
  const data = { settings: {}, days: {}, quranLearn: null }; const ui = { kaoOpen: true, kaoView: 'home', kaoStack: [] };
  const api = box.window.SeymaQuranLearn;
  api.registerQuranLearn({ data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-30', esc, icon: () => '', getDay: () => ({}) });
  api.registerQuranLearnSurface({ toast() {}, isQuietTime: false, mount() {}, lockBody() {}, unlockBody() {}, focusDialog() {}, restoreFocus() {}, activeElementId: () => '', sheetClose(e, bk, done) { done && done(); }, taskElement: () => null });
  api.ensureQuranLearn(data).onboarding.doneAt = '2026-09-20T00:00:00.000Z';
  for (const id of ['s0.02', 's0.01', 's0.12']) {
    api.kaoS0Start(id); api.kaoS0('next');
    const listen = decode(api.kaoS0HTML());
    assert.match(listen, /ses kapalı/, `${id}: sessiz yol anlatılır`);
    assert.doesNotMatch(listen, /App\.kaoS0\('(audio|playall)'/, `${id}: çalışmayan ses düğmesi yok`);
    api.kaoS0('next');
    for (let i = 0; i < ui.kaoS0.drill.items.length; i += 1) { const q = ui.kaoS0.drill.items[ui.kaoS0.drill.index]; api.kaoS0('answer', q.choices.find((c) => c.correct).id); api.kaoS0('next'); }
    assert.equal(api.kaoS0('read'), true, `${id}: sessiz cihazda okuma tamamlanır`);
    assert.match(decode(api.kaoS0HTML()), /Ders tamam/);
  }
});

// ---- (j) K2F-15 · okuyamayan kullanıcı Bugün'den S0'a ulaşır; S0 gerçekten tamamlanır ----------------
const S0_IDS = Array.from({ length: 12 }, (_, i) => `s0.${String(i + 1).padStart(2, '0')}`);
const hasHubRow = (t) => /App\.kaoS0\(&quot;start&quot;,&quot;s0\.01&quot;\)/.test(t.api.kaoOverlayHTML(t.NOW));
// Gerçek handler'larla bir S0 dersini sonuna kadar oynar (tüm cevaplar doğru ya da `wrong` kadarı yanlış), "Okudum"a basar.
function finishS0(t, id, { wrong = 0 } = {}) {
  assert.equal(t.api.kaoS0('start', id), true, `${id}: başlamalı`);
  assert.equal(t.api.kaoS0('next'), true); assert.equal(t.api.kaoS0('next'), true);
  const total = t.ui.kaoS0.drill.items.length;
  for (let i = 0; i < total; i += 1) {
    const q = t.ui.kaoS0.drill.items[t.ui.kaoS0.drill.index];
    const pick = q.choices.find((c) => c.correct === (i >= wrong));
    assert.equal(t.api.kaoS0('answer', pick.id), true); assert.equal(t.api.kaoS0('next'), true);
  }
  return { total, correct: total - wrong, finish: () => t.api.kaoS0('read') };
}

check('(j/K2F-15 a,g) "Henüz değil" seçen sıfır kullanıcı: ilk açılıştan S0 içeriğine ≤3 dokunuş; sonra Bugün birincil düğmesi kaoS0("start","s0.01")', () => {
  const t = kao.bootKao();
  assert.equal(t.api.kaoOpen('home'), true);
  assert.equal(t.api.kaoOnboard('start'), true, 'ilk açılış başlar (dokunuş sayılmaz: açılış ekranı)');
  let taps = 0;
  assert.equal(t.api.kaoOnboard('next'), true); taps += 1;
  assert.equal(t.api.kaoOnboard('choose', 'none'), true); taps += 1;
  assert.equal(t.api.kaoOnboard('finish'), true); taps += 1;
  assert.ok(taps <= 3, `${taps} dokunuş`);
  assert.equal(t.ui.kaoView, 's0', 'ilk S0 içeriği açıldı');
  assert.equal(t.ui.kaoS0.lessonId, 's0.01');
  t.api.kaoBack();
  const tapped = kao.tapPrimary(t);
  assert.ok(tapped, 'Bugün birincil düğmesi var');
  assert.equal(tapped.name, 'kaoS0', 'birincil düğme S0 yüzeyine gider');
  assert.deepEqual(tapped.args, ['start', 's0.01']);
  assert.equal(t.ui.kaoView, 's0');
});

check('(j/K2F-15 b) kaoLessonStart("s0.xx") ve kaoLesson("start","s0.xx") S0 yüzeyine devreder; boş ders planı (goal,apply,summary) kurulmaz', () => {
  for (const call of [(t) => t.api.kaoLesson('start', 's0.03'), (t) => t.api.kaoLessonStart('s0.03')]) {
    const t = kao.bootKao();
    kao.freshUser(t, { start: 's0' });
    t.api.kaoOpen('home');
    assert.equal(call(t), true);
    assert.equal(t.ui.kaoView, 's0');
    assert.equal(t.ui.kaoS0.lessonId, 's0.03');
    assert.ok(!t.ui.kaoLesson, 'ders oynatıcı planı kurulmadı');
  }
});

check('(j/K2F-15 c) S0 dersi YALNIZ read aşaması bitince path.lessons kaydı yazar: {startedAt, doneAt, score = doğru/toplam}', () => {
  const t = kao.bootKao();
  const q = kao.freshUser(t, { start: 's0' });
  t.api.kaoOpen('home');
  const played = finishS0(t, 's0.02', { wrong: 2 });
  const mid = q.path.lessons['s0.02'] || {};
  assert.ok(!mid.doneAt, 'alıştırma bitti ama read bitmedi: doneAt yok');
  assert.equal(t.api.kaoS0('read', 'toggle'), true);
  assert.ok(!(q.path.lessons['s0.02'] || {}).doneAt, 'okunuşu göstermek tamamlama değildir');
  assert.equal(played.finish(), true);
  const rec = q.path.lessons['s0.02'];
  assert.ok(rec.startedAt && rec.doneAt, 'startedAt ve doneAt');
  assert.equal(rec.score, (played.total - 2) / played.total, 'score = doğru/toplam');
});

check('(j/K2F-15 d,e) 12 S0 dersi uçtan uca → sonra Fâtiha; Besmele taşı YALNIZ s0.12 tamamlanınca verilir', () => {
  const t = kao.bootKao();
  const q = kao.freshUser(t, { start: 's0' });
  t.api.kaoOpen('home');
  for (let i = 0; i < 12; i += 1) {
    const step = t.api.kaoNextStep(t.NOW);
    assert.equal(step.kind, 's0-lesson', `${i + 1}. adım S0 dersi (${step.kind})`);
    assert.equal(step.param, S0_IDS[i], 'müfredat sırasında');
    assert.ok(!q.milestones.besmele, `${S0_IDS[i]} öncesi Besmele taşı yok`);
    const played = finishS0(t, step.param);
    played.finish();
    assert.ok(q.path.lessons[step.param].doneAt, `${step.param}: kayıt`);
    if (i < 11) assert.ok(!q.milestones.besmele, `${step.param} sonrası Besmele taşı hâlâ yok (yalnız s0.12)`);
  }
  assert.ok(q.milestones.besmele, 's0.12 tamamlanınca Besmele taşı kazanıldı');
  const after = t.api.kaoNextStep(t.NOW);
  assert.notEqual(after.kind, 's0-lesson', '12 ders sonrası S0 bitti');
  assert.equal(after.param, 'u01.01', 'sonra Fâtiha (Ünite 1, Ders 1)');
});

check('(j/K2F-15 f) Keşfet\'teki S0 satırı: onboarding.start==="s0" ya da başlanmış S0 dersi ya da kart varsa görünür; aksi hâlde gizli', () => {
  const none = kao.bootKao(); kao.freshUser(none, { start: 'level1' }); none.api.kaoOpen('home');
  assert.equal(hasHubRow(none), false, 'level1 + kart yok + S0 başlamamış: gizli');
  const s0 = kao.bootKao(); kao.freshUser(s0, { start: 's0' }); s0.api.kaoOpen('home');
  assert.equal(hasHubRow(s0), true, 'start==="s0": görünür');
  const started = kao.bootKao(); const sq = kao.freshUser(started, { start: 'level1' }); sq.path.lessons['s0.04'] = { startedAt: '2026-09-29T10:00:00.000Z', doneAt: null, score: null }; started.api.kaoOpen('home');
  assert.equal(hasHubRow(started), true, 'başlanmış S0 dersi: görünür');
  const cards = kao.bootKao({ seeded: true }); cards.api.kaoOpen('home');
  assert.equal(hasHubRow(cards), true, 'kart var: görünür');
});

console.log(`KAO2 s0: PASS (${passed} kontrol)`);
