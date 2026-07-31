#!/usr/bin/env node
// verify-quran-library-ui.mjs — QY-06 (tam ekran sûre kütüphanesi) ve QY-07
// (sûre ayrıntısı + istek CTA'sı) kabul kapısı.
//
// Kapsam:
//   · bilgi mimarisi sırası (Vakit/Hicri → Kıble → Kur'an → hub sekmeleri)
//   · 114 satırlık nüzul listesi, alan sözleşmesi, yatay kaydırma yasağı
//   · arama (Türkçe ad / Arapça ad / mushaf no / tema) ve durum filtreleri
//   · filtre + arama etkileşiminin GLOBAL render tetiklememesi, scroll koruma
//   · sûre ayrıntısı alanları ve duruma göre TEK ana eylem tablosu
//   · istek hattı: tekilleştirme, çift dokunma engeli, güvenli retry,
//     requestId'nin QY-04 taşıma sözleşmesine uyması
//   · bildirim dili (plan §15) ve yanlış iddia denetimi
//   · erişilebilirlik + responsive CSS sözleşmesi
//
// DATA SAFETY: app.js `node:vm` sandbox'ında boot edilir; fetch ve zamanlayıcılar
// ölü stub'tır, gerçek tarayıcı açılmaz, hiçbir dosyaya yazılmaz, seyma-data'ya
// dokunulmaz.
//
// Usage: node .claude/skills/run-seyma/verify-quran-library-ui.mjs
//
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail !== undefined ? ' — ' + JSON.stringify(detail) : '')); }
}
function section(t) { console.log('\n' + t); }

// ── DOM stub ──────────────────────────────────────────────────────────────
// Gerçek DOM yok; ancak app.js'in hedefli boyama (paint) yolları id ile eleman
// arar. Kayıtlı stub'lar sayesinde "global render yerine yalnız ilgili bölgeyi
// boya" davranışını gerçekten ölçebiliyoruz.
let appHTML = '';
let appWrites = 0;
let lastFocus = '';
let writeSeq = 0;
const toasts = [];
const registry = Object.create(null);

function makeEl(id) {
  const el = {
    id: id || '', _html: '', _text: '', hidden: false, disabled: false,
    style: { cssText: '', setProperty() {} },
    _classes: new Set(),
    _attrs: Object.create(null),
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: '', files: [],
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = String(v); this._seq = ++writeSeq; if (this.id === 'app') { appHTML = this._html; appWrites++; } },
    get textContent() { return this._text; },
    set textContent(v) { this._text = String(v); },
    setAttribute(k, v) { this._attrs[k] = String(v); },
    getAttribute(k) { return k in this._attrs ? this._attrs[k] : null; },
    appendChild(c) { this.children.push(c); if (this.id === 'body' && c && c.id === 'sey-toast') toasts.push(c.textContent); return c; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(c) { return c; },
    addEventListener() {}, removeEventListener() {}, click() {},
    focus() { lastFocus = this.id; }, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; },
  };
  el.classList = {
    add(c) { el._classes.add(c); }, remove(c) { el._classes.delete(c); },
    toggle(c, on) {
      if (on === undefined) { if (el._classes.has(c)) el._classes.delete(c); else el._classes.add(c); }
      else if (on) el._classes.add(c); else el._classes.delete(c);
    },
    contains(c) { return el._classes.has(c); },
  };
  return el;
}
function reg(id) { if (!registry[id]) registry[id] = makeEl(id); return registry[id]; }

const appEl = reg('app'), rootEl = reg('root'), bodyEl = reg('body');
const doc = {
  hidden: false, body: bodyEl, documentElement: rootEl, activeElement: null,
  // Bir eleman ancak SON boyanan markup'ta geçiyorsa vardır; bu, gerçek
  // tarayıcıdaki "önce render, sonra odak" akışını sadık biçimde taklit eder.
  getElementById(id) {
    if (registry[id]) return registry[id];
    const painted = appHTML
      + (registry['quran-scroll'] ? registry['quran-scroll']._html : '')
      + (registry['quran-library-results'] ? registry['quran-library-results']._html : '')
      + (registry['quran-detail-region'] ? registry['quran-detail-region']._html : '');
    return painted.indexOf('id="' + id + '"') >= 0 ? reg(id) : null;
  },
  querySelector(sel) { return registry['__sel__' + sel] || null; },
  querySelectorAll() { return []; },
  createElement() { return makeEl(''); }, createDocumentFragment() { return makeEl(''); },
  addEventListener() {}, removeEventListener() {}, DOMParser: undefined,
};
class DOMParserStub { parseFromString() { return { body: makeEl('body'), querySelector() { return null; }, querySelectorAll() { return []; } }; } }
function makeLS(seed) {
  const store = Object.assign({}, seed);
  return { getItem(k) { return k in store ? store[k] : null; }, setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; }, clear() {}, _store: store };
}

// ── sentetik başlangıç durumu (gerçek kişisel veri YOK) ───────────────────
const ISO = (h) => '2026-07-30T' + String(h).padStart(2, '0') + ':00:00.000Z';
const SEED_REQUESTS = {
  kalem: { requestId: 'qr_' + 'a'.repeat(24), status: 'awaiting_reply', requestedAt: ISO(9), notifiedAt: ISO(10), updatedAt: ISO(10), videoHistory: [] },
  fatiha: { requestId: 'qr_' + 'b'.repeat(24), status: 'ready', requestedAt: ISO(9), notifiedAt: ISO(10), responseId: 'qrr_' + 'b'.repeat(24), videoId: 'dQw4w9WgXcQ', readyAt: ISO(11), updatedAt: ISO(11), videoHistory: [] },
  asr: { requestId: 'qr_' + 'c'.repeat(24), status: 'watched', requestedAt: ISO(9), notifiedAt: ISO(10), responseId: 'qrr_' + 'c'.repeat(24), videoId: 'aaaaaaaaaaa', readyAt: ISO(11), startedWatchingAt: ISO(12), watchedAt: ISO(13), updatedAt: ISO(13), videoHistory: [] },
  ihlas: { requestId: 'qr_' + 'd'.repeat(24), status: 'request_error', requestedAt: ISO(9), updatedAt: ISO(9), videoHistory: [] },
  kadir: { requestId: 'qr_' + 'e'.repeat(24), status: 'video_unavailable', requestedAt: ISO(9), notifiedAt: ISO(10), readyAt: ISO(11), updatedAt: ISO(12), videoHistory: [{ videoId: 'zzzzzzzzzzz', at: ISO(12), reason: 'kaldırıldı' }] },
};
const seedState = {
  onboarded: true, startDate: '2026-07-01', days: {},
  // Profil değerlendirme kapısı ana arayüzde inaktif (üretimdeki varsayılan
  // davranış); aksi halde render() kapı ekranını basar ve hub'a hiç gelinmez.
  // `auth` sentetiktir: kilit ekranı testi engellemesin diye "beni hatırla"
  // yolu açık bırakılır. Gerçek bir parola/hash değildir.
  settings: {
    theme: 'light', name: 'Şeyma', profileAssessmentInactive: true,
    auth: { rememberMe: true, usernameHash: 'harness-stub-hash', unlockedAt: ISO(8) },
  },
  quranJourney: {
    schemaVersion: 1, catalogVersion: 'quran-revelation-tr-v1',
    startedAt: ISO(9), activeSurahId: 'alak', requests: SEED_REQUESTS,
  },
};

const sandbox = {
  console, localStorage: makeLS({ 'seyma-reset-v1': JSON.stringify(seedState) }),
  document: doc, __SEYMA_TEST_ZIKR__: true,
  navigator: { vibrate() {}, userAgent: 'node-harness', clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
  location: { protocol: 'http:', hostname: 'localhost', search: '', href: 'http://localhost/', reload() {} },
  matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
  DOMParser: DOMParserStub,
  fetch() { return new Promise(() => {}); },
  setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
  requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
  crypto: { getRandomValues(a) { for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 256) | 0; return a; } },
  URL: Object.assign(function () {}, { createObjectURL() { return 'blob:stub'; }, revokeObjectURL() {} }), URLSearchParams,
  Blob: function () {}, File: function () {}, FileReader: function () {},
  TextDecoder, TextEncoder, atob, btoa,
  alert() {}, confirm() { return true; }, prompt() { return null; },
  addEventListener() {}, removeEventListener() {},
  Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error,
  parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
  Promise, Set, Map, Symbol, Intl,
};
sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
sandbox.AudioContext = function () { return { state: 'running', currentTime: 0, resume() {}, createOscillator() { return { type: '', frequency: { value: 0 }, connect() {}, start() {}, stop() {} }; }, createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }, destination: {} }; };

const FILES = ['motivationProgramV2.js', 'motivationNarratives.js', 'profileAssessmentV1.js', 'saygiPeople.js',
  'hijriCalendar.js', 'quranRevelationOrderV1.js', 'quranTransportV1.js', 'esmaulHusnaV1.js', 'esmaulHusnaV2.js',
  'zikirCoreContentV1.js', 'app.js'];
const ctx = vm.createContext(sandbox);
for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(REPO, f), 'utf8'), ctx, { filename: f });

const App = sandbox.App;
const CAT = sandbox.QuranRevelationOrderV1;
const TRANSPORT = sandbox.QuranTransportV1;
const CSS = fs.readFileSync(path.join(REPO, 'styles.css'), 'utf8');
// app.js tek bir IIFE'dir; `data`/`ui` global değildir. Kalıcı durum
// localStorage'tan, kalıcı olmayan görünüm durumu App'in salt-okunur
// anlık kopyasından okunur.
const journey = () => { try { return JSON.parse(sandbox.localStorage.getItem('seyma-reset-v1')).quranJourney; } catch (e) { return null; } };
const uiState = () => App.quranUiState();
// İlk açılışta tüm gövde quran-scroll'a yazılır; hedefli boyamalar ise kendi
// bölgelerine yazar. Test her iki yolu da aynı okuyucudan görür.
const results = () => freshest('quran-library-results', 'quran-scroll');
// En son yazılan bölge okunur; aksi halde eski bir hedefli boyama bayat
// içerik döndürür ve test yanlış şeyi ölçer.
const freshest = (...ids) => {
  const els = ids.map((i) => registry[i]).filter((e) => e && e._html);
  if (!els.length) return '';
  return els.sort((a, b) => (b._seq || 0) - (a._seq || 0))[0]._html;
};
const detailHTML = () => freshest('quran-detail-region', 'quran-scroll');
const rowIds = (html) => (String(html).match(/id="quran-row-([a-z-]+)"/g) || []).map((s) => s.slice(14, -1));

console.log('== QY-06 / QY-07 Kur’an Yolculuğu kütüphane + ayrıntı doğrulaması ==');

// ── 1) Bilgi mimarisi ─────────────────────────────────────────────────────
section('1. Bilgi mimarisi ve hub kartı (QY-05 regresyonu)');
{
  App.go('saygi');
  const iSpirit = appHTML.indexOf('sg-spirit-bar');
  const iQibla = appHTML.indexOf('sg-qibla-card');
  const iQuran = appHTML.indexOf('id="quran-journey-card"');
  const iTabs = appHTML.indexOf('sg-faith-tabs');
  ok('Kur’an kartı render ediliyor', iQuran > 0);
  ok('sıra: Vakit/Hicri → Kıble → Kur’an → hub sekmeleri',
    iSpirit > 0 && iSpirit < iQibla && iQibla < iQuran && iQuran < iTabs, { iSpirit, iQibla, iQuran, iTabs });
  ok('kartın kütüphaneyi açan erişilebilir adı var', appHTML.includes('aria-label="Kur’an Yolculuğu kütüphanesini aç"'));
}

// ── 2) Overlay ve 114 satırlık liste ──────────────────────────────────────
section('2. Tam ekran kütüphane (QY-06)');
{
  ['quran-screen', 'quran-scroll', 'quran-head-lead', 'quran-library-results',
    'quran-filter-panel', 'quran-search-input', 'quran-search-clear', 'quran-detail-region',
    'quran-journey-card'].forEach(reg);
  const expander = makeEl('expander');
  expander.querySelector = () => reg('__summary__');
  registry['__sel__.quran-v2-filter-expander'] = expander;

  App.openQuranJourney();
  ok('overlay dialog semantiği', appHTML.includes('role="dialog"') && appHTML.includes('aria-modal="true"'));
  ok('overlay Türkçe erişilebilir ad taşıyor', appHTML.includes('aria-label="Raşit ile Kur’an Yolculuğu"'));
  ok('kaydırma kabuğu id="quran-scroll"', appHTML.includes('id="quran-scroll"'));
  ok('klavye işleyicisi bağlandı', appHTML.includes('App.onQuranKeydown(event)'));
  ok('açılışta odak kabuğa gitti', lastFocus === 'quran-screen', lastFocus);

  const rows = appHTML.match(/class="quran-v2-row[^"]*"/g) || [];
  ok('114 sûre satırı listelendi', rows.length === 114, rows.length);

  const ordered = rowIds(appHTML);
  const expected = CAT.surahs.map((x) => x.id);
  ok('satırlar nüzul sırasında', JSON.stringify(ordered) === JSON.stringify(expected),
    { got: ordered.slice(0, 3), expected: expected.slice(0, 3) });

  const alak = CAT.byId('alak');
  ok('satırda nüzul no var', appHTML.includes('<b>1</b><i>durak</i>'));
  ok('satırda Türkçe ad var', appHTML.includes('<strong>Alak</strong>'));
  ok('satırda Arapça ad lang/dir ile var', appHTML.includes('<span class="arabic" lang="ar" dir="rtl">' + alak.nameAr + '</span>'));
  ok('satırda Mekkî/Medenî + âyet + mushaf var', appHTML.includes('Mekkî · 19 âyet · Mushaf 96'));
  ok('Medenî sûreler doğru etiketleniyor', appHTML.includes('Medenî · '));
  ok('satır aria-label tam bağlam taşıyor',
    appHTML.includes('aria-label="1. durak · Alak sûresi · Mekkî · 19 âyet · mushaf sırası 96 · İstenmedi"'));
  ok('durum rozetleri metinle görünür (renk tek başına anlam taşımıyor)',
    appHTML.includes('>İstenmedi<') && appHTML.includes('>Cevap bekleniyor<') &&
    appHTML.includes('>Anlatım hazır<') && appHTML.includes('>İzlendi<'));
  ok('ilerleme özeti var', appHTML.includes('<strong>1 / 114</strong> izlendi'));
  ok('katalog yöntem notu görünüyor', appHTML.includes('Mısır/Kahire'));
}

// ── 3) Arama ──────────────────────────────────────────────────────────────
section('3. Arama sözleşmesi');
{
  App.setQuranQuery({ value: 'alak' });
  // Alt dize eşleşmesi: 'alak' hem Alak hem Talâk'ı getirir; beklenen davranış.
  ok('Türkçe ada göre arama', rowIds(results()).includes('alak') && rowIds(results()).length <= 3, rowIds(results()));
  App.setQuranQuery({ value: 'muzzemmil' });
  ok('tam ada göre tekil sonuç', JSON.stringify(rowIds(results())) === JSON.stringify(['muzzemmil']), rowIds(results()));

  App.setQuranQuery({ value: 'FÂTİHA' });
  ok('Türkçe büyük/küçük ve diyakritik duyarsız', rowIds(results()).includes('fatiha'), rowIds(results()));

  App.setQuranQuery({ value: CAT.byId('kalem').nameAr });
  ok('Arapça ada göre arama', rowIds(results()).includes('kalem'), rowIds(results()));

  App.setQuranQuery({ value: '96' });
  ok('mushaf numarasına göre arama', rowIds(results()).includes('alak'), rowIds(results()));

  App.setQuranQuery({ value: 'yetimi itmek' });
  ok('tema metnine göre arama', rowIds(results()).includes('maun'), rowIds(results()));

  App.setQuranQuery({ value: 'zzzzqqq' });
  ok('eşleşme yoksa boş durum gösterilir', results().includes('Bu mercekte eşleşme yok.') && rowIds(results()).length === 0);

  App.clearQuranQuery();
  ok('arama temizlenince 114 satır döner', rowIds(results()).length === 114, rowIds(results()).length);
  ok('temizle düğmesi gizlendi', registry['quran-search-clear'].hidden === true);
}

// ── 4) Filtreler ──────────────────────────────────────────────────────────
section('4. Durum filtreleri ve premium expander');
{
  const counts = App.quranFilterCounts();
  ok('beş filtre var', /Tümü[\s\S]*İstenmedi[\s\S]*Bekleniyor[\s\S]*Hazır[\s\S]*İzlendi/.test(results()));
  ok('sayımlar toplamı 114', counts.unrequested + counts.waiting + counts.ready + counts.watched === 114, counts);
  ok('Bekleniyor kovası hata durumlarını da kapsıyor', counts.waiting === 3, counts.waiting);
  ok('Hazır kovası ready/watching', counts.ready === 1, counts.ready);
  ok('İzlendi kovası watched/question_opened', counts.watched === 1, counts.watched);

  App.setQuranFilter('watched');
  ok('İzlendi filtresi yalnız izlenenleri getirir', JSON.stringify(rowIds(results())) === JSON.stringify(['asr']), rowIds(results()));
  App.setQuranFilter('ready');
  ok('Hazır filtresi yalnız hazır olanı getirir', JSON.stringify(rowIds(results())) === JSON.stringify(['fatiha']), rowIds(results()));
  App.setQuranFilter('waiting');
  ok('Bekleniyor filtresi bekleyen + hatalıları getirir',
    JSON.stringify(rowIds(results()).slice().sort()) === JSON.stringify(['ihlas', 'kadir', 'kalem'].sort()), rowIds(results()));
  App.setQuranFilter('unrequested');
  ok('İstenmedi filtresi kalan 109 sûreyi getirir', rowIds(results()).length === 109, rowIds(results()).length);
  App.setQuranFilter('bozuk-deger');
  ok('bilinmeyen filtre güvenle Tümü’ye düşer', rowIds(results()).length === 114 && uiState().filter === 'all');

  ok('filtre paneli varsayılan kapalı', results().includes('class="quran-v2-filter-panel" hidden'));
  ok('expander aria-expanded/aria-controls taşıyor',
    results().includes('aria-expanded="false"') && results().includes('aria-controls="quran-filter-panel"'));
  ok('filtreler alt alta (dar ekranda güvenli)', /\.quran-v2-chips\{[^}]*flex-direction:column/.test(CSS));
  App.toggleQuranFilters();
  ok('expander açılınca panel görünür', registry['quran-filter-panel'].hidden === false && uiState().filtersOpen === true);
  ok('expander açık sınıfı işaretlendi', registry['__sel__.quran-v2-filter-expander'].classList.contains('is-open'));
  App.toggleQuranFilters();
  ok('expander tekrar kapanır', registry['quran-filter-panel'].hidden === true);
}

// ── 5) Etkileşim maliyeti ve kaydırma konumu ──────────────────────────────
section('5. Etkileşim global render tetiklemiyor, scroll korunuyor');
{
  const before = appWrites;
  App.setQuranFilter('all');
  App.setQuranQuery({ value: 'nur' });
  App.clearQuranQuery();
  App.toggleQuranFilters();
  App.toggleQuranFilters();
  ok('filtre/arama tıklaması GLOBAL render yapmıyor', appWrites === before, { before, after: appWrites });

  registry['quran-scroll'].scrollTop = 742;
  App.openQuranSurah('asr');
  ok('ayrıntıya geçince liste konumu saklandı', uiState().listScroll === 742, uiState().listScroll);
  ok('ayrıntı görünümü en üstten başlar', registry['quran-scroll'].scrollTop === 0);
  ok('ayrıntıda odak başlığa gitti', lastFocus === 'quran-detail-title', lastFocus);
  App.backToQuranLibrary();
  ok('kütüphaneye dönünce scroll konumu geri geldi', registry['quran-scroll'].scrollTop === 742, registry['quran-scroll'].scrollTop);
  ok('geri dönüşte odak gelinen satıra döner', lastFocus === 'quran-row-asr', lastFocus);
  const navWrites = appWrites;
  App.openQuranSurah('alak'); App.backToQuranLibrary();
  ok('ayrıntı ↔ kütüphane geçişi de global render yapmıyor', appWrites === navWrites);
}

// ── 6) Sûre ayrıntısı (QY-07) ─────────────────────────────────────────────
section('6. Sûre ayrıntısı ve duruma göre TEK ana eylem');
{
  App.openQuranSurah('fatiha');
  const d = detailHTML();
  const x = CAT.byId('fatiha');
  ok('Arapça ad lang/dir ile gösteriliyor', d.includes('<span class="arabic" lang="ar" dir="rtl">' + x.nameAr + '</span>'));
  ok('Türkçe ad var', d.includes('Fâtiha Sûresi'));
  ok('nüzul sırası gösteriliyor', d.includes('<dt>Nüzul sırası</dt><dd>5 / 114</dd>'));
  ok('mushaf sırası gösteriliyor', d.includes('<dt>Mushaf sırası</dt><dd>1 / 114</dd>'));
  ok('nüzul yeri gösteriliyor', d.includes('<dt>Nüzul yeri</dt><dd>Mekkî'));
  ok('âyet sayısı gösteriliyor', d.includes('<dt>Âyet sayısı</dt><dd>7</dd>'));
  ok('kısa tema özeti gösteriliyor', d.includes('hamd, rahmet, kulluk'));
  ok('ihtilaflı niteleme dipnotla işaretlendi', d.includes('klasik kaynaklarda ihtilaflıdır'));
  ok('durum bölgesi aria-live taşıyor', d.includes('role="status" aria-live="polite"'));
  ok('başlık odaklanabilir', d.includes('id="quran-detail-title" tabindex="-1"'));
  // QY-12: 'ready' durumunda video kartı (kendi "İzlemeye başla" kapağıyla)
  // genel `.quran-v2-cta` düğmesinin YERİNİ alır — aynı işi yapan ikinci bir
  // düğme göstermemek için. "Tek ana eylem" ilkesi bozulmuyor; eylem artık
  // `.quran-v2-video .cover` düğmesi.
  ok('ayrıntıda TEK ana eylem var (video kartının kapak düğmesi, ayrı CTA yok)', (d.match(/class="quran-v2-cta/g) || []).length === 0 && (d.match(/class="cover"/g) || []).length === 1);
  ok('hazır sûrede ana eylem “İzlemeye başla”', d.includes('İzlemeye başla'));
  ok('başlıkta geri düğmesi belirdi', registry['quran-head-lead'].innerHTML.includes('Sûre kütüphanesine dön'));
  ok('geri düğmesi boş kutu değil (ikon çizildi)', registry['quran-head-lead'].innerHTML.includes('<svg class="seyIcon"'));
  ok('ana eylem (video kartı kapağı) ikonuyla birlikte çiziliyor', /class="cover"[\s\S]{0,400}?<svg class="seyIcon"/.test(d));

  // Plan §5 "duruma göre ana eylem" tablosunun tamamı
  const table = [
    ['idle', 'Raşit’ten iste', false],
    ['submitting', 'İletiliyor…', true],
    ['queued', 'İstek kaydedildi', true],
    ['notified', 'Raşit’in cevabı bekleniyor', true],
    ['awaiting_reply', 'Raşit’in cevabı bekleniyor', true],
    ['validating_reply', 'Raşit’in cevabı bekleniyor', true],
    ['ready', 'İzlemeye başla', false],
    ['watching', 'İzlemeye başla', false],
    ['watched', 'Raşit’e sor', false],
    ['question_opened', 'Raşit’e sor', false],
    ['request_error', 'Raşit’ten iste', false],
    ['notification_error', 'Raşit’ten iste', false],
    ['invalid_reply', 'Yeni bağlantı iste', false],
    ['video_unavailable', 'Yeni bağlantı iste', false],
  ];
  let tableOk = true; const bad = [];
  for (const [st, label, disabled] of table) {
    const a = App.quranDetailAction('alak', Object.assign(App.quranNewRequest(), { status: st }));
    if (a.label !== label || !!a.disabled !== disabled) { tableOk = false; bad.push(st + '→' + a.label + '/' + !!a.disabled); }
  }
  ok('14 durumun tamamı doğru ana eylemi veriyor', tableOk, bad);
  ok('pasif eylemin tıklama hedefi yok',
    !App.quranDetailAction('alak', Object.assign(App.quranNewRequest(), { status: 'submitting' })).action);

  App.openQuranSurah('kalem');
  ok('bekleyen sûrede buton gerçekten disabled', detailHTML().includes('disabled aria-disabled="true"'));
  App.openQuranSurah('kadir');
  ok('video geçmişi korunuyor ve gösteriliyor', detailHTML().includes('Önceki anlatımlar'));

  // ── QY-12: güvenli, mahremiyet geliştirilmiş YouTube video kartı ─────────
  App.openQuranSurah('fatiha'); // status: ready, videoId: dQw4w9WgXcQ (seed)
  let vd = detailHTML();
  ok('ilk render: HİÇ iframe yok (click-to-load)', !vd.includes('<iframe'));
  ok('kapak: sabit aspect-ratio konteyneri var', vd.includes('quran-v2-video-frame'));
  ok('kapak: güvenli ytimg thumbnail img', /src="https:\/\/i\.ytimg\.com\/vi\/dQw4w9WgXcQ\/hqdefault\.jpg"/.test(vd));
  ok('kapak: gerçek buton semantiği + erişilebilir ad', /<button class="cover"[^>]*aria-label="[^"]+"/.test(vd));

  App.quranJourneyWatch('fatiha');
  vd = detailHTML();
  ok('dokunuşta iframe enjekte edilir', vd.includes('<iframe'));
  ok('yalnız youtube-nocookie.com embed kullanılır', /src="https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/.test(vd));
  ok('URL’de autoplay parametresi yok', !/[?&]autoplay=1/.test(vd));
  ok('allow listesinde "autoplay" YOK (otomatik oynatma kapalı)', /allow="[^"]*"/.exec(vd) && !/allow="[^"]*autoplay/.test(vd));
  ok('referrerpolicy no-referrer', vd.includes('referrerpolicy="no-referrer"'));
  ok('sandbox uygulanmış, allow-forms/top-navigation YOK', /sandbox="[^"]*"/.test(vd) && !/sandbox="[^"]*(allow-forms|allow-top-navigation)/.test(vd));
  ok('durum ready→watching geçti (izlemeye başladı kaydı)', journey().requests.fatiha.status === 'watching', journey().requests.fatiha.status);

  App.quranJourneyWatch('fatiha'); // yeniden izleme — idempotent, çökme yok
  ok('tekrar dokunuş güvenle no-op (durum bozulmaz)', journey().requests.fatiha.status === 'watching');

  App.backToQuranLibrary(); App.openQuranSurah('fatiha');
  ok('ekrana her yeniden girişte kapak katmanına dönülür (kalıcı auto-load yok)', !detailHTML().includes('<iframe'));

  App.openQuranSurah('kadir'); // status: video_unavailable
  vd = detailHTML();
  ok('erişilemeyen videoda kapak/iframe YOK, yalnız açıklama', !vd.includes('quran-v2-video-frame') && vd.includes('Bu anlatım artık erişilebilir değil'));
  ok('erişilemeyen videoda genel CTA hâlâ görünür (Yeni bağlantı iste)', vd.includes('Yeni bağlantı iste'));

  App.openQuranSurah('asr'); // status: watched, videoId: aaaaaaaaaaa
  vd = detailHTML();
  ok('izlenmiş sûrede video kartı hâlâ var (yeniden izlenebilir)', vd.includes('quran-v2-video-frame'));
  ok('izlenmiş sûrede “Raşit’e sor” CTA’sı da birlikte görünür', vd.includes('Raşit’e sor') && /class="quran-v2-cta/.test(vd));
}

// ── 7) İstek hattı ────────────────────────────────────────────────────────
section('7. İstek gönderimi, tekilleştirme ve güvenli retry');
{
  // 7a) Taşıma kanalı henüz yokken: kayıt durur, dürüst hata verilir.
  App.openQuranSurah('tekvir');
  toasts.length = 0;
  App.quranJourneySubmit('tekvir');
  const r1 = journey().requests.tekvir;
  ok('istek yerel olarak kaydedildi', !!r1 && !!r1.requestedAt);
  ok('kanal yokken durum request_error (dürüst hata)', r1.status === 'request_error', r1 && r1.status);
  ok('requestId QY-04 taşıma desenine uyuyor', TRANSPORT.isValidRequestId(r1.requestId), r1 && r1.requestId);
  ok('kullanıcı metni plan §15 ile birebir',
    toasts.includes('İstek şu an iletilemedi. Kaydın duruyor; yeniden deneyebilirsin.'), toasts);
  ok('uçuş kilidi serbest bırakıldı', uiState().submittingId === '');
  ok('aktif sûre isteğe taşındı', journey().activeSurahId === 'tekvir');

  // 7b) Hata sonrası retry güvenli ve tek kayıt üretir.
  const firstId = r1.requestId;
  App.quranJourneySubmit('tekvir');
  const r2 = journey().requests.tekvir;
  ok('hata sonrası yeniden denenebiliyor', r2.status === 'request_error');
  ok('retry yeni requestId üretiyor', r2.requestId !== firstId && TRANSPORT.isValidRequestId(r2.requestId));

  // 7c) Açık istek varken ikinci istek yok.
  toasts.length = 0;
  const beforeKalem = JSON.stringify(journey().requests.kalem);
  App.quranJourneySubmit('kalem');
  ok('awaiting_reply durumundaki sûre tekrar istenemez', JSON.stringify(journey().requests.kalem) === beforeKalem);
  ok('kullanıcı nedenini öğreniyor', toasts.some((t) => t.includes('ikinci istek gönderilmiyor')), toasts);

  // 7d) watched geriye gitmez.
  const beforeAsr = JSON.stringify(journey().requests.asr);
  App.quranJourneySubmit('asr');
  ok('izlenmiş sûre isteğe geri düşmüyor', JSON.stringify(journey().requests.asr) === beforeAsr);

  // 7e) Çift dokunma engeli: yazıcı callback'i geciktirilir.
  let pending = null;
  sandbox.SeySync = { pushQuranRequest(payload, cb) { pending = { payload, cb }; } };
  App.openQuranSurah('ala');
  App.quranJourneySubmit('ala');
  const mid = journey().requests.ala;
  ok('gönderim sırasında durum submitting', mid.status === 'submitting', mid.status);
  ok('uçuş kilidi kuruldu', uiState().submittingId === 'ala');
  const idDuringFlight = mid.requestId;
  App.quranJourneySubmit('ala');
  App.quranJourneySubmit('duha');
  ok('çift dokunma ikinci istek üretmiyor', journey().requests.ala.requestId === idDuringFlight);
  ok('uçuş sırasında başka sûre de gönderilemiyor', !journey().requests.duha);
  ok('outbox payload’ı sözleşmeye uygun',
    !!pending && pending.payload.surahId === 'ala' && pending.payload.revelationOrder === 8 &&
    pending.payload.mushafOrder === 87 && pending.payload.surahName === 'A’lâ' &&
    TRANSPORT.isValidRequestId(pending.payload.requestId), pending && pending.payload);
  ok('payload’da token/sır taşınmıyor',
    !!pending && !('replyToken' in pending.payload) && !TRANSPORT.containsSecret(JSON.stringify(pending.payload)));

  // 7f) Başarılı yazma → queued + doğru metin, tekrar çağrı idempotent.
  toasts.length = 0;
  pending.cb(null);
  ok('outbox yazılınca durum queued', journey().requests.ala.status === 'queued', journey().requests.ala.status);
  ok('kullanıcı metni “İsteğin kaydedildi.”', toasts.includes('İsteğin kaydedildi.'), toasts);
  ok('kilit çözüldü', uiState().submittingId === '');
  pending.cb(null);
  ok('aynı callback tekrar çağrılsa durum değişmiyor', journey().requests.ala.status === 'queued');

  // 7g) Promise dönen yazıcı.
  let rejectFn;
  sandbox.SeySync = { pushQuranRequest() { return new Promise((_, rej) => { rejectFn = rej; }); } };
  App.quranJourneySubmit('leyl');
  ok('promise yazıcıda submitting bekliyor', journey().requests.leyl.status === 'submitting');
  rejectFn(new Error('network'));
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  ok('promise reddi güvenli hataya düşüyor', journey().requests.leyl.status === 'request_error', journey().requests.leyl.status);

  // 7h) Fırlatan yazıcı uygulamayı çökertmiyor.
  sandbox.SeySync = { pushQuranRequest() { throw new Error('boom'); } };
  let threw = false;
  try { App.quranJourneySubmit('fecr'); } catch (e) { threw = true; }
  ok('fırlatan yazıcı yakalanıyor', !threw && journey().requests.fecr.status === 'request_error');
  delete sandbox.SeySync;

  // 7i) Bilinmeyen sûre id'si state'e yazılmıyor.
  const keysBefore = Object.keys(journey().requests).length;
  App.quranJourneySubmit('__kotu__');
  App.quranJourneySubmit('olmayan-sure');
  ok('doğrulanmamış id state anahtarı olmuyor', Object.keys(journey().requests).length === keysBefore);
}

// ── 8) Bildirim dili ──────────────────────────────────────────────────────
section('8. Kullanıcı iletişimi dürüstlüğü (plan §5/§15)');
{
  const map = [
    ['queued', 'İsteğin kaydedildi.'],
    ['notified', 'Raşit’e haber verildi.'],
    ['awaiting_reply', 'Raşit’in cevabı bekleniyor.'],
    ['request_error', 'İstek şu an iletilemedi. Kaydın duruyor; yeniden deneyebilirsin.'],
    ['invalid_reply', 'Gelen bağlantı doğrulanamadı. Güvenli bir bağlantı bekleniyor.'],
    ['video_unavailable', 'Bu video artık erişilebilir değil. Raşit’ten yeni bağlantı istenecek.'],
    ['question_opened', 'WhatsApp açıldı; sorun henüz gönderilmiş sayılmaz.'],
  ];
  let allOk = true; const bad = [];
  for (const [st, text] of map) { const got = App.quranStatusNote(st, 'Alak'); if (got !== text) { allOk = false; bad.push(st + '→' + got); } }
  ok('durum metinleri plan §15 ile birebir', allOk, bad);
  ok('ready metni sûre adını taşıyor', App.quranStatusNote('ready', 'Alak') === 'Alak anlatımı hazır.');

  App.backToQuranLibrary();
  const forbidden = ['Raşit okudu', 'Video hazırlanıyor', 'Sorun gönderildi', 'Mesaj gönderildi', 'Raşit gördü'];
  const hit = forbidden.filter((f) => appHTML.includes(f) || results().includes(f));
  ok('yanlış iddia içeren metin yok', hit.length === 0, hit);
}

// ── 9) Erişilebilirlik ve responsive CSS sözleşmesi ───────────────────────
section('9. CSS sözleşmesi (QY-06 layout + QY-17 ön kontrolleri)');
{
  // Blok yalnız Kur'an Yolculuğu kurallarıyla sınırlanır; sonraki yorum
  // başlığı bittiği yeri işaretler. Aksi halde dosyanın kalanı da ölçülürdü.
  const tail = CSS.slice(CSS.indexOf('.quran-v2-overlay{'));
  const stop = tail.indexOf('\n/*');
  const block = stop > 0 ? tail.slice(0, stop) : tail;
  ok('kütüphane listesi dikey akış (yatay kaydırma yok)', /\.quran-v2-list\{[^}]*flex-direction:column/.test(block));
  ok('kaydırma kabuğu yatay taşmayı kapatıyor', /\.quran-v2-scroll\{[^}]*overflow-x:hidden/.test(block));
  ok('quran bloğunda overflow-x:auto/scroll yok', !/overflow-x:(auto|scroll)/.test(block));
  ok('satır esnek genişlikte (minmax(0,1fr))', /\.quran-v2-row\{[^}]*minmax\(0,1fr\)/.test(block));
  ok('uzun Türkçe ad ellipsis ile kırpılıyor', /\.quran-v2-row \.titleline strong\{[^}]*text-overflow:ellipsis/.test(block));
  ok('uzun Arapça ad taşmıyor', /\.quran-v2-row \.titleline \.arabic\{[^}]*max-width:4\d%/.test(block));
  ok('durum rozeti meta satırında sarmalanıyor', /\.quran-v2-row \.metarow\{[^}]*flex-wrap:wrap/.test(block));
  ok('ana CTA en az 52px', /\.quran-v2-cta\{[^}]*min-height:52px/.test(block));
  ok('filtre rozetleri en az 44px dokunma hedefi', /\.quran-v2-chips button\{[^}]*min-height:44px/.test(block));
  ok('kapat ve geri düğmeleri 44px',
    /\.quran-v2-header \.close\{[^}]*width:44px;height:44px/.test(block) && /\.quran-v2-header \.back\{[^}]*width:44px;height:44px/.test(block));
  ok('satır dokunma hedefi 64px', /\.quran-v2-row\{[^}]*min-height:64px/.test(block));
  ok('metin arkasında blur filtresi yok', !/backdrop-filter|filter:blur/.test(block));
  ok('dar ekran (≤389px) uyarlaması var', block.includes('@media(max-width:389px)'));
  ok('geniş ekran kabuğu var', block.includes('@media(min-width:681px)'));
  ok('reduced-motion overlay animasyonunu kapatıyor', /@media\(prefers-reduced-motion:reduce\)\{[\s\S]*?\.quran-v2-overlay\{animation:none\}/.test(block));
  const hexes = (block.replace(/color:#fff/g, '').match(/#[0-9a-fA-F]{3,8}\b/g) || []);
  ok('renkler tema değişkenlerinden geliyor (hardcode hex yok)', hexes.length === 0, hexes.slice(0, 3));
  ok('odak halkaları tanımlı', (block.match(/focus-visible/g) || []).length >= 6);
  ok('100dvh tam ekran kabuğu', /\.quran-v2-screen\{[^}]*height:100dvh/.test(block));

  // icon() bilinmeyen adda sessizce '' döner; boş bir 44px geri düğmesi
  // bırakmamak için kullanılan her ikon adı ICONS setinde OLMALI.
  const APPSRC = fs.readFileSync(path.join(REPO, 'app.js'), 'utf8');
  const qSrc = APPSRC.slice(APPSRC.indexOf('function quranCatalog('), APPSRC.indexOf('function saygiHTML('));
  const iconSet = APPSRC.slice(0, APPSRC.indexOf('function icon('));
  const usedIcons = Array.from(new Set(
    Array.from(qSrc.matchAll(/icon\('([a-z0-9-]+)'/g)).map((m) => m[1])
      .concat(Array.from(qSrc.matchAll(/icon:'([a-z0-9-]+)'/g)).map((m) => m[1]))));
  const missingIcons = usedIcons.filter((n) => iconSet.indexOf("'" + n + "':'") < 0);
  ok('kullanılan tüm ikon adları ICONS setinde tanımlı', missingIcons.length === 0, missingIcons);
  ok('ikon denetimi gerçekten çalıştı', usedIcons.length >= 8, usedIcons);
}

// ── 10) Dayanıklılık ve kapanış ───────────────────────────────────────────
section('10. Dayanıklılık, klavye ve şema regresyonu');
{
  const savedCat = sandbox.QuranRevelationOrderV1;
  sandbox.QuranRevelationOrderV1 = null;
  let threw = false;
  try { App.setQuranFilter('all'); } catch (e) { threw = true; }
  ok('katalog yüklenmezse uygulama çökmüyor', !threw);
  ok('katalog yokken boş durum gösteriliyor', results().includes('Bu mercekte eşleşme yok.'));
  sandbox.QuranRevelationOrderV1 = savedCat;
  App.setQuranFilter('all');
  ok('katalog dönünce liste geri geliyor', (results().match(/quran-v2-row/g) || []).length >= 114);

  App.onQuranKeydown({ key: 'Escape', preventDefault() {} });
  ok('Escape kütüphanede overlay’i kapatır', uiState().open === false);
  ok('kapanışta odak hub kartına döner', lastFocus === 'quran-journey-card', lastFocus);

  App.openQuranJourney();
  App.openQuranSurah('nas');
  App.onQuranKeydown({ key: 'Escape', preventDefault() {} });
  ok('Escape ayrıntıda önce kütüphaneye döner',
    uiState().view === 'library' && uiState().open === true);

  const j = journey();
  ok('şema sürümü korunuyor', j.schemaVersion === 1 && j.catalogVersion === 'quran-revelation-tr-v1');
  ok('tüm istek kayıtları şema uyumlu', Object.keys(j.requests).every((k) => {
    const r = j.requests[k];
    return typeof r.status === 'string' && (r.updatedAt === null || /^\d{4}-\d{2}-\d{2}T/.test(r.updatedAt));
  }));
  ok('seed edilen kayıtların hiçbiri kaybolmadı',
    ['kalem', 'fatiha', 'asr', 'ihlas', 'kadir'].every((k) => !!j.requests[k]));
}

// `--dump library` veya `--dump detail:<surahId>` ile üretilen markup incelenebilir.
{
  const at = process.argv.indexOf('--dump');
  if (at > 0) {
    const what = process.argv[at + 1] || 'library';
    App.openQuranJourney();
    if (what.indexOf('detail:') === 0) { App.openQuranSurah(what.slice(7)); console.log('\n--- detail ---\n' + detailHTML()); }
    else console.log('\n--- library ---\n' + registry['quran-scroll']._html);
  }
}

console.log('\n' + (failed === 0 ? '✅ ' : '❌ ') + passed + ' geçti, ' + failed + ' kaldı.');
process.exit(failed === 0 ? 0 : 1);
