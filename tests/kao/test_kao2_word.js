'use strict';

// KAO2-25 · Kelime detayı v2 (S-08) + panel aynası.
// Sentetik VM; ağ, tarayıcı, gerçek kullanıcı verisi yok.
// Bağlam: 05 §2 (S-08) · 02 T-19 · 01 Y-11 · KAO-19 (R-C1, R-C8) · 08 §6.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const decode = (h) => h.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranMahrecSchemasV1',
  'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];

function boot() {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const n of CONTENT) vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), box, { filename: n });
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), box, { filename: f });
  }
  const data = { settings: {}, days: {}, quranLearn: null, lastOpenedDate: '2026-09-30' };
  const ui = { kaoOpen: true, kaoView: 'word', kaoStack: [] };
  const api = box.window.SeymaQuranLearn;
  api.registerQuranLearn({ data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-30', esc, icon: () => '', getDay: () => ({}) });
  api.registerQuranLearnSurface({
    toast() {}, isQuietTime: false, mount() {}, lockBody() {}, unlockBody() {}, focusDialog() {}, restoreFocus() {},
    activeElementId: () => '', sheetClose(e, bk, done) { done && done(); }, taskElement: () => null
  });
  const q = api.ensureQuranLearn(data);
  q.onboarding.doneAt = '2026-09-20T00:00:00.000Z';
  const lemmas = box.window.QuranLexiconV1.lemmas;
  // Üç örnek: biri doğrulanmış okunuşlu, biri doğrulanmamış (hiç gösterilmemeli).
  // Bölüm testleri tam kapsam ister: örnek + kök + kognat taşıyan doğrulanmış bir lemma.
  const pick = (pred) => lemmas.find(pred);
  const lemma = pick((l) => l.verified === true && l.root && l.cognate && l.cognate.tr && Array.isArray(l.examples) && l.examples.length >= 2)
    || pick((l) => l.verified === true && Array.isArray(l.examples) && l.examples.length >= 2);
  const openWord = (id) => { ui.kaoWordId = id; ui.kaoView = 'word'; return api.kaoWordHTML(); };
  return { api, box, data, ui, q, lemmas, lemma, openWord };
}

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

// ---- (1) Katman sayfalaması kalktı ---------------------------------------
check('katman sayfalaması yok: tek kaydırmalı detay (T-19)', () => {
  const t = boot();
  const html = decode(t.openWord(t.lemma.id));
  assert.doesNotMatch(html, /Katman\s*\d\s*\/\s*3/, 'katman sayacı kaldı');
  assert.doesNotMatch(html, /kaoWordLayer/, 'katman düğmesi kaldı');
  assert.doesNotMatch(html, /data-word-layer/, 'katman durumu kaldı');
  const source = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');
  assert.doesNotMatch(source, /function kaoWordLayer/, 'App.kaoWordLayer hâlâ var');
  assert.equal(typeof t.api.kaoWordLayer, 'undefined', 'kaoWordLayer export ediliyor');
  assert.equal((fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8').match(/App\.kaoWordLayer/g) || []).length, 0, 'app.js shim kaldı');
});

// ---- (2) Bölümler ve sıra ----------------------------------------------
check('bölümler tek sayfada ve P10 sırasında', () => {
  const t = boot();
  const html = decode(t.openWord(t.lemma.id));
  const at = (re) => { const m = html.match(re); return m ? m.index : -1; };
  const iHero = at(/kao-word-hero/), iMeaning = at(/kao-word-meanings/), iCognate = at(/kao-word-cognate/),
    iRoot = at(/kao-word-root/), iExamples = at(/kao-word-examples/), iLearning = at(/kao-word-learning/);
  for (const [name, idx] of [['hero', iHero], ['anlam', iMeaning], ['köken', iCognate], ['kök', iRoot], ['örnek', iExamples], ['öğrenme', iLearning]]) {
    assert.ok(idx >= 0, `${name} bölümü yok`);
  }
  assert.ok(iHero < iMeaning && iMeaning < iExamples, 'ilk bakışta büyük Arapça → anlam → örnekler');
  assert.ok(iCognate < iRoot && iRoot < iExamples, 'kök ve örnekler ikincil sırada');
  assert.ok(iLearning > iExamples, 'öğrenme durumu sonda');
  // Büyük Arapça başlık erişilebilir ad taşır.
  assert.match(html, /id="kao-word-title"[^>]*lang="ar"[^>]*dir="rtl"/, 'Arapça başlık lang/dir taşımıyor');
});

check('anlam katmanı okunuş + dinle düğmesini gerçek erişilebilir adla taşır', () => {
  const t = boot();
  const html = decode(t.openWord(t.lemma.id));
  assert.match(html, /class="kao-pronunciation"/, 'okunuş bloğu yok');
  assert.match(html, /aria-label="[^"]+telaffuz[^"]*"/i, 'dinle düğmesi erişilebilir adsız');
  assert.match(html, /kao-word-cognate/, 'Türkçede bölümü yok');
  assert.match(html, /Türkçede var:/, 'kognat metni yok');
});

// ---- (3) Doğrulanmamış örnek: hiç gösterilmez, hata kutusu yok (Y-11) ----
check('doğrulanmamış örnek HİÇ gösterilmez; hata kutusu sızmaz', () => {
  const t = boot();
  const lemma = t.lemma;
  const good = lemma.examples.filter((e) => typeof e.pronunciation === 'string' && e.pronunciation).length;
  const html = decode(t.openWord(lemma.id));
  assert.doesNotMatch(html, /kao-content-error/, 'iç kalite hatası kullanıcıya sızıyor');
  assert.doesNotMatch(html, /gösterilemez/i, 'hata metni sızıyor');
  const rendered = [...html.matchAll(/class="kao-word-example"/g)].length;
  assert.equal(rendered, Math.min(3, good), `yalnız doğrulanmış örnekler: ${rendered} vs ${Math.min(3, good)}`);
  if (good === 0) assert.match(html, /doğrulanmış okunuş|Örnekler hazırlanıyor/i, 'boş durum metni yok');
});

// ---- (4) Kök bağlantısı -------------------------------------------------
check('kök bölümü kök ailesine gerçek bağlantı verir', () => {
  const t = boot();
  const lemma = t.lemma;
  const html = decode(t.openWord(lemma.id));
  if (!lemma.root) { assert.ok(!/kao-word-root/.test(html), 'köksüz kelimede kök bölümü var'); return; }
  assert.match(html, /<h3>Kök<\/h3>/, 'kök başlığı yok');
  assert.match(html, /kao-root-pair|kao-derivatives/, 'kök içeriği yok');
  assert.match(html, /App\.kaoRoots\(&#39;open&#39;|App\.kaoRoots\('open'/, 'kök ailesi bağlantısı yok');
});

// ---- (5) Öğrenme durumu + derse dönüş ----------------------------------
check('öğrenme durumu sonraki tekrarı ve ders bağlantısını yazar', () => {
  const t = boot();
  t.q.cards[`w:${t.lemma.id}:ar>tr`] = { state: 'review', s: 30, due: '2026-10-04T00:00:00.000Z', reps: 4 };
  const html = decode(t.openWord(t.lemma.id));
  assert.match(html, /Sonraki tekrar/, 'sonraki tekrar yok');
  assert.match(html, /App\.kaoSetView\(&#39;units&#39;\)|App\.kaoSetView\('units'\)/, 'derse dönüş eylemi yok');
  assert.match(html, /Hata bildir[\s\S]*$/, 'hata bildir en altta değil');
});

// ---- (6) Pin: yeni handler yok -----------------------------------------
check('kelime ekranı yeni App.kao* handler eklemez', () => {
  const source = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');
  const exported = [...source.matchAll(/^\s{4}(kao[A-Za-z0-9_]*):/gm)].map((m) => m[1]);
  assert.equal(new Set(exported).size, exported.length, 'yinelenen export');
  const appSource = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
  const handlers = new Set([...appSource.matchAll(/App\.(kao[A-Za-z0-9_]*)\s*=\s*function/g)].map((m) => m[1]));
  assert.equal(handlers.size, 42, `App.kao* pin kaydı: ${handlers.size}`);
});

// ---- (7) Panel aynası: yeni alanlar, anlatı metni yok ------------------
check('kaoPanelSummary yeni alanları üretir ve anlatı metni taşımaz', () => {
  const t = boot();
  const q = t.q;
  const lemma = t.lemmas[0];
  for (const dir of ['ar>tr', 'tr>ar']) q.cards[`w:${lemma.id}:${dir}`] = { state: 'review', s: 40, reps: 6 };
  // Yeni kullanıcıda başlangıç yoktur: alan null olabilir (panel satırı gizlenir).
  assert.equal(t.api.kaoPanelSummary(t.data).start, null, 'başlamamış kullanıcıda start null olmalı');
  q.startedAt = '2026-09-20T10:00:00.000Z';
  const summary = t.api.kaoPanelSummary(t.data);
  assert.equal(summary.start, '2026-09-20T10:00:00.000Z', 'start ISO değil');
  assert.ok(Number.isFinite(summary.unit) || summary.unit === null, 'unit sayı ya da null olmalı');
  assert.ok(summary.lesson === null || /^[a-z0-9._-]{1,32}$/.test(summary.lesson), `lesson kimliği temiz değil: ${summary.lesson}`);
  assert.ok(Number.isFinite(summary.lessonsDone), 'lessonsDone sayı değil');
  assert.match(summary.milestones, /^([a-z0-9]+,)*[a-z0-9]*$/, `milestones anahtar listesi değil: ${summary.milestones}`);
  // Türkçe anlatı metni yasak: hiçbir alan cümle taşımaz.
  for (const [key, value] of Object.entries(summary)) {
    if (typeof value !== 'string') continue;
    assert.ok(!/\s{2,}/.test(value), `${key} anlatı metni taşıyor`);
    if (key !== 'topSoundClass') assert.doesNotMatch(value, /[çğıöşüÇĞİÖŞÜ]/, `${key} Türkçe metin taşıyor`);
  }
});

// ---- (8) Panel manifesti yeni alanları geçirir, metni reddeder --------
check('panel manifesti yeni alanları geçirir; bozuk değerleri düşürür', () => {
  const box = { window: {} };
  vm.createContext(box);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, 'panel/panelCoverageManifest.js'), 'utf8'), box, { filename: 'manifest' });
  const P = box.window.PanelCoverageV1;
  assert.ok(P && typeof P.quranLearnProjection === 'function', 'quranLearnProjection yok');
  const ok = P.quranLearnProjection({
    summary: {
      v: 1, coveragePercent: 45, knownWords: 50, understoodAyahs: 2, lastStudiedDate: '2026-09-30', streakDays: 4,
      topSoundClass: 'Kalınlık', flaggedCount: 0, updatedAt: '2026-09-30T10:00:00.000Z',
      start: '2026-09-01T10:00:00.000Z', unit: 3, lesson: 'u3.l2', lessonsDone: 5, milestones: 'half,twoThirds'
    }
  }, '2026-09-30');
  assert.equal(ok.status, 'ok');
  assert.equal(ok.unit, 3, 'unit geçmedi');
  assert.equal(ok.lesson, 'u3.l2', 'lesson geçmedi');
  assert.equal(ok.lessonsDone, 5, 'lessonsDone geçmedi');
  assert.equal(ok.milestones, 'half,twoThirds', 'milestones geçmedi');
  assert.equal(ok.start, '2026-09-01T10:00:00.000Z', 'start geçmedi');
  // Bozuk / anlatı değerler düşürülür.
  const bad = P.quranLearnProjection({
    summary: {
      v: 1, coveragePercent: 999, knownWords: -1, lesson: 'Ünite 3 dersini bitir', unit: 'üç', lessonsDone: -5,
      milestones: 'Fâtiha’yı anlıyorum, half', start: 'dün', topSoundClass: 'Kalınlık'
    }
  });
  assert.equal(bad.coveragePercent, null, 'aralık dışı sayı geçti');
  assert.equal(bad.knownWords, null, 'negatif sayı geçti');
  assert.equal(bad.lesson, null, 'anlatı metni lesson olarak geçti');
  assert.equal(bad.unit, null, 'sayı olmayan unit geçti');
  assert.equal(bad.lessonsDone, null, 'negatif lessonsDone geçti');
  assert.equal(bad.milestones, null, 'bozuk milestones geçti');
  assert.equal(bad.start, null, 'geçersiz start geçti');
  // Eski veri: alanlar yoksa satır gizlenir, kırılmaz.
  const legacy = P.quranLearnProjection({ summary: { v: 1, coveragePercent: 10, knownWords: 4, understoodAyahs: 0, streakDays: 1, flaggedCount: 0 } });
  assert.equal(legacy.status, 'ok');
  assert.equal(legacy.unit, null); assert.equal(legacy.lesson, null); assert.equal(legacy.milestones, null);
});

// ---- (9) Panel kartı: yeni satır yalnız alan varsa --------------------
check('panel kartı yeni alanları bir satırda gösterir, yoksa gizler', () => {
  const source = fs.readFileSync(path.join(repoRoot, 'panel/panel.js'), 'utf8');
  assert.match(source, /q\.unit|q\.lessonsDone|q\.milestones/, 'panel kartı yeni alanları okumuyor');
  // Satır gerçek veriye koşullu: yoksa HTML üretilmez.
  assert.match(source, /q\.(unit|lessonsDone|milestones)[\s\S]{0,200}\?[\s\S]{0,200}['"]:['"]/, 'yeni satır koşulsuz');
  const appSource = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');
  assert.match(appSource, /start:q\.startedAt|start:.*startedAt/, 'özet start alanını kaynaktan almıyor');
});

// ---- (10) Panel sızıntısı yok -----------------------------------------
check('panel kartı kelime düzeyi bilgi sızdırmaz', () => {
  const t = boot();
  const summary = t.api.kaoPanelSummary(t.data);
  const text = JSON.stringify(summary);
  assert.doesNotMatch(text, /ٱ|[\u0600-\u06FF]/, 'Arapça metin sızdı');
  assert.doesNotMatch(text, /(anlam|örnek|çeviri)/i, 'içerik metni sızdı');
});

console.log(`\nKAO2-25 kelime + panel aynası: ${passed} kontrol PASS`);
