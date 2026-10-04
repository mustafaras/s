'use strict';

// KAO2-24 · İlerleme (S-12) birleşik ekranı.
// Sentetik VM; ağ, tarayıcı, gerçek kullanıcı verisi yok.
// Bağlam: 05 §2 (S-12) · 03 §1 (kapsam eğrisi) · 04 §D-19 (yumuşak seri).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const decode = (h) => h.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranMahrecSchemasV1',
  'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];

// 03 §1 tablosu (lexicon `freq` toplamından türetilir; burada bağımsız referans).
const CURVE_REF = { 50: 45.2, 100: 54.8, 200: 64.5, 300: 70.3, 524: 77.4 };

function boot() {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const n of CONTENT) vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), box, { filename: n });
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), box, { filename: f });
  }
  const data = { settings: {}, days: {}, quranLearn: null };
  const ui = { kaoOpen: true, kaoView: 'stats', kaoStack: [] };
  const api = box.window.SeymaQuranLearn;
  api.registerQuranLearn({ data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-30', esc, icon: () => '', getDay: () => ({}) });
  api.registerQuranLearnSurface({
    toast() {}, isQuietTime: false, mount() {}, lockBody() {}, unlockBody() {}, focusDialog() {}, restoreFocus() {},
    activeElementId: () => '', sheetClose(e, bk, done) { done && done(); }, taskElement: () => null
  });
  const q = api.ensureQuranLearn(data);
  q.onboarding.doneAt = '2026-09-20T00:00:00.000Z';
  const NOW = '2026-09-30T12:00:00.000Z';
  const NOW_DATE = new Date(NOW);
  // Sıklık sırasına göre ilk N lemma (kapsam eğrisinin gerçek ekseni).
  const byFreq = box.window.QuranLexiconV1.lemmas.slice().sort((a, b) => (b.freq || 0) - (a.freq || 0));
  const know = (n) => {
    for (const lemma of byFreq.slice(0, n)) {
      for (const dir of ['ar>tr', 'tr>ar']) q.cards[`w:${lemma.id}:${dir}`] = { state: 'review', s: 40, due: '2026-12-01T00:00:00.000Z' };
    }
  };
  const study = (offset, answered) => {
    const d = new Date(NOW_DATE.getTime() - offset * 86400000).toISOString().slice(0, 10);
    q.daily[d] = { answered, correct: answered, new: 0, reviewed: answered };
  };
  return { api, box, data, ui, q, NOW, know, study, byFreq };
}

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

// ---- (1) Üst bölüm: kelime sayısı + kapsam % + "ilk 50" anlatısı ----------
check('üst bölüm tanıdık kelime sayısını ve kapsam yüzdesini gösterir', () => {
  const t = boot();
  t.know(50);
  const html = decode(t.api.kaoStatsHTML(t.NOW));
  assert.match(html, /Tanıdık kelime/, 'tanıdık kelime etiketi yok');
  assert.match(html, /50/, 'kelime sayısı yazılmıyor');
  assert.match(html, /\/\s*524/, 'toplam lemma yazılmıyor');
});

check('"ilk 50 kelime ≈ %45" anlatısı gerçek eğriden yazılır', () => {
  const t = boot();
  t.know(50);
  const html = decode(t.api.kaoStatsHTML(t.NOW));
  assert.match(html, /İlk 50 kelime/i, 'kapsam anlatısı yok');
  assert.match(html, /%45/, 'ilk 50 kelime yüzdesi yanlış');
});

// ---- (2) Kapsam eğrisi 03 §1 ile tutarlı ---------------------------------
check('kapsam eğrisi 03 §1 noktalarıyla ±0,1 tutarlı', () => {
  const t = boot();
  const model = t.api.kaoProgressModel(t.data, t.NOW);
  assert.ok(Array.isArray(model.curve) && model.curve.length >= 5, 'eğri noktaları yok');
  for (const n of [50, 100, 200, 300, 524]) {
    const point = model.curve.find((p) => p.n === n);
    assert.ok(point, `eğri noktası yok: ${n}`);
    assert.ok(Math.abs(point.percent - CURVE_REF[n]) <= 0.1, `%${n} sapması: ${point.percent} vs ${CURVE_REF[n]}`);
  }
});

check('eğri kazanılan/kazanılmayanı işaretler ve sıradaki hedefi adlandırır', () => {
  const t = boot();
  t.know(50);
  const model = t.api.kaoProgressModel(t.data, t.NOW);
  assert.equal(model.curve.find((p) => p.n === 50).earned, true, '50 kazanılmadı');
  assert.equal(model.curve.find((p) => p.n === 100).earned, false, '100 kazanıldı sayıldı');
  assert.equal(model.nextPoint.n, 100, 'sıradaki hedef 100 olmalı');
  const html = decode(t.api.kaoStatsHTML(t.NOW));
  assert.match(html, /Sıradaki hedef[\s\S]{0,120}(100|%54)/, 'sıradaki hedef anlatılmıyor');
});

// ---- (3) Taşlar: kazanılan + sıradaki (koşul metniyle) -------------------
check('taşlar kazanılanı ve sıradakini KOŞUL METNİYLE gösterir', () => {
  const t = boot();
  t.know(300);
  // Model saftır: taş KAZANDIRMAZ; ekran açılışı (kaoStatsHTML) uzlaştırır.
  assert.equal(Object.keys(t.q.milestones).filter((k) => t.q.milestones[k]).length, 0, 'model taş kazandırdı (saf olmalı)');
  t.api.kaoStatsHTML(t.NOW);
  const model = t.api.kaoProgressModel(t.data, t.NOW);
  assert.ok(Array.isArray(model.stones.earned) && model.stones.earned.length >= 1, 'kazanılan taş yok');
  assert.ok(model.stones.next && model.stones.next.label, 'sıradaki taş yok');
  assert.ok(model.stones.next.condition && model.stones.next.condition.length > 8, 'sıradaki taş koşulsuz');
  const html = decode(t.api.kaoStatsHTML(t.NOW));
  for (const label of model.stones.earned.slice(0, 3)) assert.ok(html.includes(label), `kazanılan taş yazılmıyor: ${label}`);
  assert.ok(html.includes(model.stones.next.label), 'sıradaki taş yazılmıyor');
  assert.ok(html.includes(model.stones.next.condition), 'sıradaki taşın koşulu yazılmıyor');
});

check('kazanılan taş bir kez yazılır (kapsam düşse de geri alınmaz)', () => {
  const t = boot();
  t.know(300);
  t.api.kaoStatsHTML(t.NOW); // taşları kazan
  const earned = Object.keys(t.q.milestones).filter((k) => t.q.milestones[k]);
  assert.ok(earned.length >= 1, 'taş kazanılmadı');
  const first = t.api.kaoProgressModel(t.data, t.NOW).stones.earned.slice();
  // kapsam düşür: kartlar silinir
  t.q.cards = {};
  const after = t.api.kaoProgressModel(t.data, t.NOW).stones.earned;
  assert.deepEqual(Array.from(after), Array.from(first), 'kazanılan taş geri alındı');
});

// ---- (4) Haftalık etkinlik + yumuşak seri (D-19) ------------------------
check('haftalık etkinlik 7 günü gösterir ve seri cezalandırıcı değil', () => {
  const t = boot();
  t.study(0, 12); t.study(1, 8); t.study(3, 5); t.study(6, 3);
  const model = t.api.kaoProgressModel(t.data, t.NOW);
  assert.equal(model.week.days.length, 7, '7 gün yok');
  assert.equal(model.week.days.filter((day) => day.studied).length, 4, 'bu hafta 4 gün olmalı');
  assert.equal(model.week.studied, 4, 'yumuşak seri sayısı yanlış');
  const html = decode(t.api.kaoStatsHTML(t.NOW));
  assert.match(html, /Bu hafta\s*4\s*gün/, 'yumuşak seri metni yok');
  for (const bad of ['seri bozuldu', 'Serin bozuldu', 'kaybettin', 'Seri: 0']) {
    assert.ok(!html.includes(bad), `cezalandırıcı metin: ${bad}`);
  }
});

check('boş haftada da cezalandırıcı dil yok', () => {
  const t = boot();
  const html = decode(t.api.kaoStatsHTML(t.NOW));
  assert.match(html, /Bu hafta\s*0\s*gün|Henüz bu hafta kaydın yok/, 'boş hafta metni yok');
  for (const bad of ['kaybettin', 'bozdun', 'baştan']) assert.ok(!html.includes(bad), `cezalandırıcı metin: ${bad}`);
});

// ---- (5) Mushaf haritası tek ekranda ------------------------------------
check('mushaf haritası bölümü İlerleme içinde ve hücreleri gerçek', () => {
  const t = boot();
  const html = decode(t.api.kaoStatsHTML(t.NOW));
  assert.match(html, /114 sûre/, 'harita bölümü yok');
  const cells = [...html.matchAll(/class="kao-map-cell" data-l="(\d)" aria-label="([^"]+)"/g)];
  assert.equal(cells.length, 114, `harita hücresi: ${cells.length}`);
  const model = t.api.kaoProgressModel(t.data, t.NOW);
  assert.equal(model.map.length, 114, 'model haritası 114 değil');
  assert.equal(model.map.filter((c) => c.hasData).length, 0, 'veri yokken işaretli hücre var');
});

check('harita hücreleri öğrenilen sûrede gerçek yüzdeyi taşır', () => {
  const t = boot();
  t.q.surahs['112'] = { understoodAt: '2026-09-25T00:00:00.000Z', delayedTestAt: '2026-10-02T00:00:00.000Z', delayedScore: 5, confirmedAt: '2026-10-02T00:05:00.000Z', needsReread: false };
  t.q.ayahs.understood = ['112:1', '112:2'];
  const model = t.api.kaoProgressModel(t.data, t.NOW);
  const cell = model.map.find((c) => c.number === 112);
  assert.equal(cell.hasData, true, 'sûre işaretlenmedi');
  assert.equal(cell.percent, 100, 'kesinleşen sûre %100 olmalı');
  const html = decode(t.api.kaoStatsHTML(t.NOW));
  assert.match(html, /İhlâs/, 'sûre adı haritada yok');
});

// ---- (6) Algı doğruluğu + kalibrasyon ----------------------------------
check('algı doğruluğu ve kalibrasyon özeti mevcut veriden okunur', () => {
  const t = boot();
  t.q.phonics.misheard = { qaf: 3, sad: 1 };
  t.study(1, 20);
  t.q.daily[new Date(new Date(t.NOW).getTime() - 86400000).toISOString().slice(0, 10)] = {
    answered: 20, correct: 16, new: 0, reviewed: 18,
    calib: { bands: Array.from({ length: 10 }, () => ({ pred: 0, ok: 0, n: 0 })) },
    dayFollow: { n: 18, ok: 14 }
  };
  const html = decode(t.api.kaoStatsHTML(t.NOW));
  assert.match(html, /Tekrar doğruluğu/, 'kalibrasyon satırı yok');
  assert.match(html, /R-bandı|Öngörülen R/, 'R-bandı tablosu yok');
  assert.match(html, /Yeni âyet testi/, 'aktarım özeti yok');
  const model = t.api.kaoProgressModel(t.data, t.NOW);
  assert.ok(model.perception.flagged >= 1, 'işaretli harf sayılmadı');
  assert.ok(Array.isArray(model.perception.sounds) && model.perception.sounds.length >= 1, 'ses sınıfı özeti yok');
});

// ---- (7) Tek yönlendirme: ayrı map görünümü yok ------------------------
check('eski ayrı harita görünümü İlerleme\'ye yönlenir', () => {
  const t = boot();
  t.ui.kaoOpen = true;
  const nav = t.api.kaoNav && t.api.kaoNav.bind(t.api);
  assert.equal(typeof nav, 'function', 'kaoNav yok');
  t.ui.kaoView = 'stats';
  // map görünümü istenir → İlerleme'ye akar (05 §2: S-12 birleşimi)
  t.api.kaoSetView('map');
  assert.equal(t.ui.kaoView, 'stats', `map görünümü birleşmedi: ${t.ui.kaoView}`);
  // ayrılmış başlık artık tek ekranda
  const titles = t.box.window.SeymaQuranLearn.KAO_VIEW_TITLES;
  assert.equal(titles.map, undefined, 'ayrı harita başlığı hâlâ kayıtlı');
});

check('İlerleme başlığı tek ve tutarlı', () => {
  const t = boot();
  const html = decode(t.api.kaoStatsHTML(t.NOW));
  assert.match(html, /aria-labelledby="kao-stats-title"/, 'erişilebilir başlık yok');
  const headings = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1]);
  assert.equal(headings.length, 1, `tek h2 beklenir: ${headings.join(' | ')}`);
});

// ---- (7b) K2F-32: kendi başlığı + katlanan kalibrasyon ayrıntısı --------
check('K2F-32: LargeTitle "İlerleme"; eski "İstatistik / Tutunma ve kalibrasyon" başlığı yok', () => {
  const t = boot();
  const html = decode(t.api.kaoStatsHTML(t.NOW));
  const h2 = html.match(/<h2 id="kao-stats-title">([^<]+)<\/h2>/);
  assert.ok(h2, 'başlık h2 bulunamadı');
  assert.equal(h2[1], 'İlerleme');
  assert.doesNotMatch(html, /Tutunma ve kalibrasyon/, 'eski başlık duruyor');
  assert.doesNotMatch(html, /<p class="kao-eyebrow">İstatistik<\/p>/, 'eski "İstatistik" üst etiketi duruyor');
});

check('K2F-32: R-bandı tablosu kapalı başlayan <details> içinde, özeti tek cümle', () => {
  const t = boot();
  const html = decode(t.api.kaoStatsHTML(t.NOW));
  const m = html.match(/<details(?![^>]*\bopen\b)[^>]*>\s*<summary>([^<]+)<\/summary>([\s\S]*?)<\/details>/);
  assert.ok(m, 'kapalı <details> yok');
  assert.match(m[2], /<table class="kao-stats-table"/, 'tablo <details> dışında');
  assert.equal(m[1].trim().split(/[.!?]/).filter(Boolean).length, 1, `özet tek cümle olmalı: ${m[1]}`);
  assert.doesNotMatch(html.replace(m[0], ''), /kao-stats-table/, 'tablo <details> dışında da var');
  // Aynı bölümdeki doğruluk satırları (Son 2/6 hafta) katlanmadan görünür kalır.
  assert.ok(html.indexOf('Son 2 hafta') < html.indexOf('<details'), 'doğruluk satırları katlanmış');
});

// ---- (8) Model saflığı: determinizm ve sıra ----------------------------
check('kaoProgressModel saf ve deterministiktir', () => {
  const t = boot();
  t.know(100);
  const mark = () => Object.keys(t.q.milestones).filter((k) => t.q.milestones[k]).join(',');
  const before = mark();
  const a = JSON.stringify(t.api.kaoProgressModel(t.data, t.NOW));
  const b = JSON.stringify(t.api.kaoProgressModel(t.data, t.NOW));
  assert.equal(a, b, 'model deterministik değil');
  assert.equal(mark(), before, 'model durumu değiştirdi (saf olmalı)');
  const source = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');
  const fn = source.slice(source.indexOf('function kaoProgressModel'));
  assert.ok(!/fetch\(|localStorage|document\./.test(fn.slice(0, fn.indexOf('\n  }'))), 'model yan etkili');
});

console.log(`\nKAO2-24 İlerleme: ${passed} kontrol PASS`);
