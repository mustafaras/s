'use strict';

// KAO2-23 · Ayarlar (S-13) iOS düzeni + "Hakkında ve kaynaklar" alt sayfası.
// Sentetik VM; ağ, tarayıcı, gerçek kullanıcı verisi yok.
// Bağlam: 06 §2 (GroupedList/Switch/Segmented) · 02 T-22, T-23 · 01 O-04.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const decode = (h) => h.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranMahrecSchemasV1',
  'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];

function boot() {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const n of CONTENT) vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), box, { filename: n });
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), box, { filename: f });
  }
  const data = { settings: {}, days: {}, quranLearn: null };
  const ui = { kaoOpen: true, kaoView: 'settings', kaoStack: [] };
  const api = box.window.SeymaQuranLearn;
  api.registerQuranLearn({ data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-30', esc, icon: () => '', getDay: () => ({}) });
  api.registerQuranLearnSurface({
    toast() {}, isQuietTime: false, mount() {}, lockBody() {}, unlockBody() {}, focusDialog() {}, restoreFocus() {},
    activeElementId: () => '', sheetClose(e, bk, done) { done && done(); }, taskElement: () => null
  });
  const q = api.ensureQuranLearn(data);
  q.onboarding.doneAt = '2026-09-20T00:00:00.000Z';
  return { api, box, data, ui, q };
}

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

// ---- (1) Grup sırası ve içerikleri ----------------------------------------
check('K2F-29: ayarlar amaca göre gruplanır — Günlük hedef · Ses · Okuma · Gölgeleme · Görünürlük · Veri · Hakkında', () => {
  const t = boot();
  const html = decode(t.api.kaoSettingsHTML());
  const titles = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map((m) => m[1]);
  assert.deepEqual(titles, ['Günlük hedef', 'Ses', 'Okuma', 'Gölgeleme', 'Görünürlük', 'Veri', 'Hakkında'], 'grup sırası 06/KAO2-23');
  for (const old of ['Okunuş ve hareke', 'Gölgeleme (mikrofon)', 'Seviye 0 ve dışa aktarma', 'Ses · gölgeleme', 'Okuma · görünürlük', 'Okuma · görünüm', 'Diğer']) {
    assert.ok(!titles.includes(old), `eski bölüm başlığı kaldı: ${old}`);
  }
});

check('K2F-29: tüm aç/kapat ayarları gerçek anahtardır; etiket değer içermez, "X: açık" metin düğmesi yok', () => {
  const t = boot();
  for (const on of [false, true]) {
    t.q.settings.harakat = t.q.settings.kaoVisible = t.q.settings.shadowing = on;
    t.q.readability.fadeHarakat = t.q.readability.coloredHarakat = on;
    const html = decode(t.api.kaoSettingsHTML());
    const switches = [...html.matchAll(/<button\b[^>]*role="switch"[^>]*>[\s\S]*?<\/button>/g)].map((m) => m[0]);
    assert.equal(switches.length, 5, 'beş anahtar');
    for (const sw of switches) {
      assert.match(sw, new RegExp(`aria-checked="${on}"`), 'durum aria-checked ile');
      assert.match(sw, /class="kao-switch-row"/);
      assert.match(sw, /<span class="kao-switch-track" aria-hidden="true"><span class="kao-switch-thumb">/, 'gerçek anahtar bileşeni');
    }
    assert.doesNotMatch(html, /:\s*(?:açık|kapalı)\s*<\/button>/, 'etiket değer içermez');
    assert.doesNotMatch(html, /kao-toggle/, 'eski metin düğmesi yok');
  }
  const html = decode(t.api.kaoSettingsHTML());
  for (const label of ['Harekeleri göster', 'Tekrarda harekeyi soldur', 'Renkli hareke (Seviye 0)', 'Gölgeleme', 'İlham & İbadet’te kartı göster']) {
    assert.ok(html.includes(`aria-label="${label}"`), `anahtar etiketi: ${label}`);
  }
});

check('K2F-29: yüzey overflow:hidden olduğundan satır odak halkası içeri çizilir (kırpılmaz)', () => {
  const css = require('fs').readFileSync(require('path').join(require('../repo-root'), 'app/kao.css'), 'utf8');
  assert.match(css, /\.kao-group-surface\{[^}]*overflow:hidden/, 'yüzey taşmayı keser');
  assert.match(css, /\.kao-group-surface :is\(\.kao-switch-row,\.kao-group-row\):focus-visible\{outline-offset:-3px\}/, 'yüzey içi satırlarda negatif outline-offset');
});

check('K2F-29: Okuma grubu sırası — okunuş, hareke, soldur, satır aralığı, kelime boşluğu, renkli hareke, önizleme; Veri ve Hakkında satırları', () => {
  const t = boot();
  const html = decode(t.api.kaoSettingsHTML());
  const okuma = html.match(/<h3[^>]*>Okuma<\/h3>[\s\S]*?(?=<h3[^>]*>Gölgeleme)/)[0];
  const order = ['Latin okunuş katmanı', 'Harekeleri göster', 'Tekrarda harekeyi soldur', 'Arapça satır aralığı', 'Kelime boşluğu', 'Renkli hareke', 'kao-settings-sample'].map((x) => okuma.indexOf(x));
  assert.ok(order.every((x) => x >= 0), `hepsi var ${order}`);
  assert.deepEqual([...order].sort((a, b) => a - b), order, 'sıra korunur');
  assert.match(html, /<h3[^>]*>Gölgeleme<\/h3>[\s\S]*?kaoToggleShadowing[\s\S]*?kao-group-footer[^>]*>[^<]*Mikrofon yalnız sen başlatınca/, 'gizlilik açıklaması footer');
  assert.match(html, /<h3[^>]*>Veri<\/h3>[\s\S]*?kaoExportCsv[\s\S]*?kaoReopenGate/, 'Veri grubu');
  assert.match(html, /<h3[^>]*>Hakkında<\/h3>[\s\S]*?Hakkında ve kaynaklar/, 'Hakkında satırı');
});

check('Günlük hedef: süre segmenti (5/10/15) + niyet satırı', () => {
  const t = boot();
  const html = decode(t.api.kaoSettingsHTML());
  assert.match(html, /Günlük hedef[\s\S]*kaoSetDailyNew/, 'süre segmenti gruba bağlı');
  for (const n of [5, 10, 15]) assert.match(html, new RegExp(`>${n}<`), `${n} dk seçeneği`);
  assert.match(html, /niyet|Niyet/, 'niyet satırı görünür (D-18 uygulama niyeti)');
});

check('K2F-16 · Niyet: onboarding.intent Ayarlar\'da görünür, kaoSetIntent ile değişir, geçersiz değer reddedilir', () => {
  const t = boot();
  assert.match(decode(t.api.kaoSettingsHTML()), /Niyet: Henüz seçilmedi/, 'niyet yokken');
  t.q.onboarding.intent = 'isha';
  const html = decode(t.api.kaoSettingsHTML());
  assert.match(html, /Niyet: Her yatsı namazından sonra 5 dakika/, 'onboarding.intent okunur (K3-06)');
  // Seçim segmenti: 5 vakit + kendim; mevcut seçim basılı.
  const seg = html.match(/<div class="kao-seg" role="group" aria-label="Niyet">[\s\S]*?<\/div>/);
  assert.ok(seg, 'niyet segmenti var');
  assert.equal((seg[0].match(/App\.kaoSetIntent\(/g) || []).length, 6, 'sabah/öğle/ikindi/akşam/yatsı/kendim');
  assert.match(seg[0], /aria-pressed="true" onclick="App\.kaoSetIntent\('isha'\)"/, 'mevcut niyet basılı');
  for (const v of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'custom']) {
    assert.equal(t.api.kaoSetIntent(v), true, `${v} kabul`);
    assert.equal(t.q.onboarding.intent, v);
  }
  assert.match(decode(t.api.kaoSettingsHTML()), /Niyet: Kendim seçerim/, 'custom satırı');
  t.api.kaoSetIntent('dhuhr');
  for (const bad of ['', 'noon', null, undefined, 5, '__proto__', 'FAJR']) {
    assert.equal(t.api.kaoSetIntent(bad), false, `${String(bad)} reddedilir`);
    assert.equal(t.q.onboarding.intent, 'dhuhr', 'geçersiz değer mevcut niyeti bozmaz');
  }
});

check('Ses grubu: otomatik ses + hız/üslup segmenti + gölgeleme; sessiz saat notu', () => {
  const t = boot();
  const html = decode(t.api.kaoSettingsHTML());
  const ses = html.match(/<h3[^>]*>Ses<\/h3>[\s\S]*?(?=<h3[^>]*>Okuma)/);
  assert.ok(ses, 'Ses grubu var');
  assert.match(ses[0], /kaoSetAudioStyle/, 'üslup segmenti');
  assert.match(ses[0], /Sessiz saat/, 'sessiz saat notu (23–07) korunur');
  // K2F-29: gölgeleme kendi grubunda.
  assert.match(html, /<h3[^>]*>Gölgeleme<\/h3>[\s\S]*?kaoToggleShadowing/, 'gölgeleme kendi grubunda');
});

check('Okuma grubu: okunuş katmanı, hareke anahtarları, satır aralığı, kelime boşluğu', () => {
  const t = boot();
  const html = decode(t.api.kaoSettingsHTML());
  const okuma = html.match(/<h3[^>]*>Okuma<\/h3>[\s\S]*$/);
  assert.ok(okuma, 'Okuma grubu var');
  for (const handler of ['kaoSetTranslit', 'kaoToggleHarakat', 'kaoToggleFade', 'kaoSetReadability']) {
    assert.match(okuma[0], new RegExp(handler), `${handler} Okuma grubunda`);
  }
  assert.match(okuma[0], /satır aralığı/i, 'satır aralığı');
  assert.match(okuma[0], /kelime boşluğ/i, 'kelime boşluğu');
});

// ---- (2) Hakkında ve kaynaklar ALT SAYFASI (T-23) --------------------------
check('kaynaklar artık Ayarlar’ın altında uzun liste DEĞİL, ayrı alt sayfa', () => {
  const t = boot();
  const html = decode(t.api.kaoSettingsHTML());
  assert.doesNotMatch(html, /<section class="kao-sources"/, 'uzun kaynak listesi Ayarlar gövdesinde yok');
  assert.match(html, /App\.kaoSetView\((['"&#;a-z])*sources/, 'kaynaklara alt sayfa bağlantısı var');
  // Alt sayfa erişilebilir olmalı.
  assert.equal(t.api.kaoNav('sources'), true, 'sources görünümü yönlendirilebilir');
  const page = decode(t.api.kaoSourcesPageHTML());
  assert.match(page, /Hakkında ve kaynaklar/, 'alt sayfa başlığı');
  assert.match(page, /kao-back/, 'geri yolu var');
  assert.doesNotMatch(page, /kao-settings/, 'alt sayfada ayar gövdesi yok');
});

check('alt sayfa kaynak/lisans + sürüm + gizlilik bilgisini taşır', () => {
  const t = boot();
  const page = decode(t.api.kaoSourcesPageHTML());
  for (const name of ['Tadabur', 'CC BY-NC 4.0', 'Tanzil', 'CC BY 3.0', 'ts-fsrs', 'MIT']) {
    assert.ok(page.includes(name), `kaynak/lisans: ${name}`);
  }
  assert.match(page, /Sürüm|sürüm/, 'sürüm bilgisi');
  assert.match(page, /gizli|cihazda|yalnız bu cihazda/i, 'gizlilik notu');
});

// ---- (3) Handler sayısı DEĞİŞMEDİ (kartın kabul ölçütü) --------------------
check('handler sayısı: App.kao* 44 (K2F-16 kaoSetIntent ekledi)', () => {
  const app = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
  const kao = new Set((app.match(/App\.kao[A-Za-z0-9_]*\s*=[^=]/g) || []).map((s) => s.match(/App\.kao[A-Za-z0-9_]*/)[0]));
  assert.equal(kao.size, 44, `App.kao* sayısı 44 olmalı — KAO2-25 katman sayfalamasını kaldırdı, K2F-12 kaoS0, K2F-16 kaoSetIntent ekledi (ölçülen ${kao.size})`);
});

check('ayarlar hâlâ TEK veri kaynağı: IIP sekmesine kopyalanmaz', () => {
  const src = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');
  // Ayar yazımı yalnız KAO motorunda olmalı.
  assert.match(src, /function kaoSettingsOf/, 'ayar okuyucusu tek yerde');
  const saygi = fs.readFileSync(path.join(repoRoot, 'app/core/saygi.js'), 'utf8');
  assert.doesNotMatch(saygi, /dailyNew|audioStyle|fadeHarakat/, 'IIP sekmesi KAO ayarlarını kopyalamaz');
});

console.log(`KAO2 settings: PASS (${passed} kontrol)`);
