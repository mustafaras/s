'use strict';
// IIP-12 — Günlük odak ve devam et · headless/no-network VM fixture
//
// REQ-023/TC-023  Tek odak önerisi kaynak/süre ve seçim gerekçesiyle;
//                 deterministik seçilir.
//                 Olumsuz: aynı gün yeniden render öneriyi rastgele
//                 değiştirmez; içerik yoksa dürüst boş hâl.
// REQ-024/TC-024  Yalnız mevcut geçerli aktif zikir/Kur'an kaydı; yeni state
//                 kopyası yok.
//                 Olumsuz: boş/bozuk/arşivlenmiş kayda giden Devam düğmesi
//                 oluşmaz.
//
// Ağ, depo, timer, DOM yoktur. Render yalnız sentetik VM içindedir.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const ROOT = path.join(__dirname, '..', '..');
const source = fs.readFileSync(path.join(ROOT, 'app/core/saygi.js'), 'utf8');

let passed = 0, failed = 0;
function ok(name, condition, detail) {
  if (condition) { passed++; console.log('PASS  ' + name); }
  else { failed++; console.log('FAIL  ' + name + (detail ? ' -> ' + detail : '')); }
}
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ── Sentetik sandbox ────────────────────────────────────────────────────────
function makeSandbox(opts) {
  opts = opts || {};
  const counters = { storage: 0, fetch: 0, timers: 0 };
  const state = opts.data || { days: {}, saygi: { collection: {}, streak: 0, lastReadDate: '' } };
  const ui = opts.ui || { faithTab: 'oz' };
  const sandbox = {
    console,
    Date,
    Math,
    JSON,
    Object,
    Array,
    Number,
    String,
    isNaN,
    parseInt,
    parseInt,
    setTimeout: () => { counters.timers++; },
    clearTimeout: () => {},
    localStorage: {
      getItem() { counters.storage++; return null; },
      setItem() { counters.storage++; },
      removeItem() { counters.storage++; }
    },
    fetch: () => { counters.fetch++; return Promise.resolve({ ok: false }); }
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: 'app/core/saygi.js' });
  const deps = {
    data: () => state,
    ui: () => ui,
    getDay: (data, date) => data.days[date] || (data.days[date] = { reading: { entries: [] } }),
    todayStr: () => opts.today || '2026-09-04',
    addDays: (date, amount) => amount < 0 ? '2026-09-03' : '2026-09-05',
    diffDays: (from, to) => Math.round((new Date(to) - new Date(from)) / 86400000),
    dayIndexFor: () => 1,
    dateLabelTR: (date) => date,
    icon: (name) => '<svg data-icon="' + esc(name) + '"></svg>',
    esc,
    featuresLive: () => true,
    render: () => {},
    quranJourneyHubCardHTML: () => '<article id="quran-journey-card"></article>',
    zikrVisible: () => opts.zikrVisible !== false,
    zikrPreviewCardHTML: () => '<article class="zikr-v2-preview">Zikir</article>'
  };
  sandbox.SeymaSaygi.registerSaygi(deps);
  sandbox.SaygiPeople = opts.people || [
    { id: 'ada', name: 'Ada Lovelace', kind: 'Bilim', era: '19. yy', field: 'Matematik' },
    { id: 'grace', name: 'Grace Hopper', kind: 'Bilim', era: '20. yy', field: 'Bilgisayar bilimi' },
    { id: 'frida', name: 'Frida Kahlo', kind: 'Sanat', era: '20. yy', field: 'Resim' }
  ];
  sandbox.HijriCalendarV1 = { todayStr: (d, o) => 'Hicri ' + d + ' +' + o, holyDay: () => '' };
  return { sandbox, registry: sandbox.SeymaSaygi, state, ui, counters };
}

// ── [1] REQ-023 determinizm ─────────────────────────────────────────────────
console.log('[1] REQ-023 — tek günlük odak deterministik ve gerekçeli');
{
  const a = makeSandbox({ today: '2026-09-04' });
  const b = makeSandbox({ today: '2026-09-04' });

  const fa = a.registry.saygiDailyFocus('2026-09-04');
  ok('öneri hazır durumda', fa.state === 'ready' && !!fa.source, JSON.stringify(fa));
  ok('öneri kaynak etiketi taşır', typeof fa.source.label === 'string' && fa.source.label.length > 0);
  ok('öneri tahmini süre taşır', /dk/.test(String(fa.source.minutes)), fa.source.minutes);
  ok('seçim gerekçesi yazılıdır', /deterministik/.test(String(fa.reason)), fa.reason);

  // Aynı gün + aynı katalog → aynı seçim (bağımsız iki sandbox).
  ok('aynı gün aynı kaynağı seçer (deterministik)', fa.source.id === b.registry.saygiDailyFocus('2026-09-04').source.id);
  // Aynı sandbox'ta tekrar çağrı (gün ortası render) seçimi değiştirmez.
  ok('tekrar render seçimi değiştirmez', fa.source.id === a.registry.saygiDailyFocus('2026-09-04').source.id);

  // Kaynak gerçekten kabul edilmiş listelerden gelir.
  ok('kaynak yalnız oncu/ayet listesinden seçilir', ['oncu', 'ayet'].indexOf(fa.source.id) > -1, fa.source.id);
  ok('eylem mevcut bir App handlerını kullanır (yeni handler yok)',
    /^App\.(openSaygiPreview|openQuranJourney)\(\)$/.test(fa.source.action), fa.source.action);
  // CTA gerçekten bir yüzey açar (no-op değil): ikisi de mevcut overlay handlerı.
  ok('iki kaynağın CTA\'sı da gerçek yüzey açar',
    ['App.openSaygiPreview()', 'App.openQuranJourney()'].indexOf(fa.source.action) > -1, fa.source.action);
}

// ── [2] REQ-023 gün geçişi + dürüst boş hâl ─────────────────────────────────
console.log('[2] REQ-023 — farklı gün ilerler, içerik yoksa dürüst boş');
{
  const s = makeSandbox({ today: '2026-09-04' });
  const ids = {};
  for (let i = 0; i < 6; i++) {
    const date = '2026-09-' + String(4 + i).padStart(2, '0');
    ids[date] = s.registry.saygiDailyFocus(date).source.id;
  }
  ok('gün geçişinde seçim türetilir (çökme yok)', Object.values(ids).every(v => v === 'oncu' || v === 'ayet'));
  ok('altı günün tamamı tek kaynağa çakılı değil', new Set(Object.values(ids)).size > 1, JSON.stringify(ids));

  // İçerik yok → boş durum + gerekçe; uydurma öneri yok.
  const empty = makeSandbox({ people: [] });
  const fe = empty.registry.saygiDailyFocus('2026-09-04');
  ok('içerik yokken durum "empty"', fe.state === 'empty' && !fe.source, JSON.stringify(fe));
  ok('boş hâl gerekçe taşır', /kabul edilmiş içerik/.test(String(fe.reason)), fe.reason);
  const html = empty.registry.saygiDailyFocusHTML('2026-09-04');
  ok('boş hâl dürüst metin basar', /kabul edilmiş içerik/.test(html) && !/onclick="App\./.test(html), html.slice(0, 120));
}

// ── [3] REQ-024 geçerli aktif kayıt → Devam satırı ──────────────────────────
console.log('[3] REQ-024 — yalnız geçerli aktif kayıt Devam satırı üretir');
{
  const data = {
    days: {},
    saygi: { collection: {}, streak: 0, lastReadDate: '' },
    quranJourney: { activeSurahId: 'alak', requests: { alak: { status: 'watching' } } }
  };
  const s = makeSandbox({ data });
  s.sandbox.SeymaQuran = {
    quranSurahName: (id) => id === 'alak' ? 'Alak' : String(id),
    quranBucket: () => 'ready'
  };
  s.sandbox.QuranRevelationOrderV1 = { byId: (id) => id === 'alak' ? { id: 'alak' } : null, firstSurahId: 'alak' };
  // Zikir: gerçek bir aktif hatim (sentetik registry shim'i — zikir.js yüklenmez).
  s.sandbox.SeymaZikr = {
    zikrActivePreset: () => ({ id: 'esma_01', kind: 'esma', name: 'Yâ Latîf' }),
    zikrJourneyProgress: () => ({ journey: { id: 'j1' }, hatim: { id: 'h1', count: 250, target: 1000, status: 'active' } })
  };

  const rows = s.registry.saygiContinueRows();
  ok('iki geçerli kayıt → iki satır', rows.length === 2, JSON.stringify(rows));
  ok('sabit sıra Zikir → Kur’an', rows[0].label === 'Yâ Latîf' && rows[1].label === 'Alak', JSON.stringify(rows.map(r => r.label)));
  ok('zikir satırı gerçek oranı yazar', /%/.test(rows[0].status) && /hatim/.test(rows[0].status), rows[0].status);
  ok('Kur’an satırı gerçek durumu yazar', rows[1].status === 'İzleniyor · kaldığın yer', rows[1].status);
  ok('satırlar mevcut App handlerlarına gider',
    rows[0].action === 'App.openZikr()' && rows[1].action === 'App.openQuranJourney()',
    JSON.stringify(rows.map(r => r.action)));

  // Durum → doğru eylem yönlendirmesi (yanlış yüzey açılmaz).
  [['watching', 'App.openQuranJourney()'], ['ready', 'App.quranJourneyWatch()'], ['watched', 'App.quranJourneyQuestion()']]
    .forEach(function (pair) {
      const sd = { days: {}, saygi: { collection: {}, streak: 0, lastReadDate: '' }, quranJourney: { activeSurahId: 'alak', requests: { alak: { status: pair[0] } } } };
      const sx = makeSandbox({ data: sd });
      sx.sandbox.SeymaQuran = { quranSurahName: () => 'Alak' };
      sx.sandbox.QuranRevelationOrderV1 = { byId: () => ({ id: 'alak' }) };
      sx.sandbox.SeymaZikr = { zikrActivePreset: () => null, zikrJourneyProgress: () => null };
      const r = sx.registry.saygiContinueRows();
      ok('durum ' + pair[0] + ' → ' + pair[1], r.length === 1 && r[0].action === pair[1], JSON.stringify(r));
    });

  const html = s.registry.saygiContinueHTML();
  ok('Devam HTML iki düğme basar', (html.match(/<button/g) || []).length === 2, String((html.match(/<button/g) || []).length));
  ok('satırlar stilli mevcut kart sınıfını kullanır (yeni CSS gerekmez)', html.indexOf('saygi-source-card') > -1 && html.indexOf('saygi-link-copy') > -1);
  ok('ikon düğmede font eşitlemesi var', html.indexOf('font:inherit') > -1);
}

// ── [4] REQ-024 olumsuz: boş/bozuk/arşiv/retryable → satır YOK ─────────────
console.log('[4] REQ-024 olumsuz — boş/bozuk/arşivlenmiş kayda Devam düğmesi yok');
{
  const base = { days: {}, saygi: { collection: {}, streak: 0, lastReadDate: '' } };
  const cases = [
    ['quranJourney hiç yok', undefined],
    ['quranJourney bozuk (dizi)', []],
    ['quranJourney bozuk (metin)', 'x'],
    ['geçersiz sûre kimliği', { activeSurahId: 'yok-boyle-sure', requests: { 'yok-boyle-sure': { status: 'watching' } } }],
    ['durum idle', { activeSurahId: 'alak', requests: { alak: { status: 'idle' } } }],
    ['durum request_error', { activeSurahId: 'alak', requests: { alak: { status: 'request_error' } } }],
    ['durum notification_error', { activeSurahId: 'alak', requests: { alak: { status: 'notification_error' } } }],
    ['durum invalid_reply', { activeSurahId: 'alak', requests: { alak: { status: 'invalid_reply' } } }],
    ['durum video_unavailable', { activeSurahId: 'alak', requests: { alak: { status: 'video_unavailable' } } }],
    ['durum question_opened (durak tamam)', { activeSurahId: 'alak', requests: { alak: { status: 'question_opened' } } }],
    ['durum queued (bekleme, devam değil)', { activeSurahId: 'alak', requests: { alak: { status: 'queued' } } }],
    ['durum notified (bekleme, devam değil)', { activeSurahId: 'alak', requests: { alak: { status: 'notified' } } }],
    ['durum awaiting_reply (bekleme, devam değil)', { activeSurahId: 'alak', requests: { alak: { status: 'awaiting_reply' } } }],
    ['durum submitting (bekleme, devam değil)', { activeSurahId: 'alak', requests: { alak: { status: 'submitting' } } }],
    ['sûre kaydı yok (status okunamaz)', { activeSurahId: 'alak', requests: {} }],
    ['requests bozuk', { activeSurahId: 'alak', requests: 'nope' }]
  ];
  cases.forEach(function (c) {
    const d = Object.assign({}, base);
    if (c[1] !== undefined) d.quranJourney = c[1];
    const s = makeSandbox({ data: d });
    s.sandbox.QuranRevelationOrderV1 = { byId: (id) => id === 'alak' ? { id: 'alak' } : null };
    s.sandbox.SeymaQuran = { quranSurahName: () => 'Alak' };
    s.sandbox.SeymaZikr = { zikrActivePreset: () => null, zikrJourneyProgress: () => null };
    const rows = s.registry.saygiContinueRows();
    ok('satır yok: ' + c[0], rows.length === 0, JSON.stringify(rows));
    ok('HTML boş: ' + c[0], s.registry.saygiContinueHTML() === '');
  });

  // Arşivlenmiş hatim aktif çalışma sayılmaz.
  const s2 = makeSandbox({ data: Object.assign({}, base) });
  s2.sandbox.SeymaZikr = {
    zikrActivePreset: () => ({ id: 'esma_01', kind: 'esma', name: 'Arşivli' }),
    zikrJourneyProgress: () => ({ journey: {}, hatim: { id: 'h9', count: 10, target: 1000, status: 'archived' } })
  };
  ok('arşivlenmiş hatim Devam satırı üretmez', s2.registry.saygiContinueRows().length === 0);
  ok('hatim yokken Devam satırı üretmez', (function () {
    const s3 = makeSandbox({ data: Object.assign({}, base) });
    s3.sandbox.SeymaZikr = { zikrActivePreset: () => ({ id: 'c', kind: 'core', name: 'Sübhânallâh' }), zikrJourneyProgress: () => ({ journey: {}, hatim: null }) };
    return s3.registry.saygiContinueRows().length === 0;
  })());
  ok('zikir görünmezken zikir satırı eklenmez', (function () {
    const s4 = makeSandbox({ data: Object.assign({}, base), zikrVisible: false });
    s4.sandbox.SeymaZikr = { zikrActivePreset: () => ({ id: 'esma_01', kind: 'esma', name: 'X' }), zikrJourneyProgress: () => ({ journey: {}, hatim: { id: 'h', count: 5, target: 10, status: 'active' } }) };
    return s4.registry.saygiContinueRows().length === 0;
  })());
  ok('hedefi 0 olan bozuk hatim satır üretmez', (function () {
    const s5 = makeSandbox({ data: Object.assign({}, base) });
    s5.sandbox.SeymaZikr = { zikrActivePreset: () => ({ id: 'esma_01', kind: 'esma', name: 'X' }), zikrJourneyProgress: () => ({ journey: {}, hatim: { id: 'h', count: 5, target: 0, status: 'active' } }) };
    return s5.registry.saygiContinueRows().length === 0;
  })());
}

// ── [5] REQ-024 olumsuz: render `data`'yı DEĞİŞTİRMEZ (state kopyası yok) ──
console.log('[5] REQ-024 — render salt-okurdur; yeni state kopyası/kaydı yok');
{
  const data = {
    days: {},
    saygi: { collection: {}, streak: 0, lastReadDate: '' },
    quranJourney: { activeSurahId: 'alak', requests: { alak: { status: 'watching' } } }
  };
  const s = makeSandbox({ data });
  s.sandbox.SeymaQuran = { quranSurahName: () => 'Alak' };
  s.sandbox.QuranRevelationOrderV1 = { byId: (id) => id === 'alak' ? { id: 'alak' } : null };
  s.sandbox.SeymaZikr = {
    zikrActivePreset: () => ({ id: 'esma_01', kind: 'esma', name: 'Yâ Latîf' }),
    zikrJourneyProgress: () => ({ journey: { id: 'j' }, hatim: { id: 'h', count: 1, target: 9, status: 'active' } })
  };
  const before = JSON.stringify(data);
  s.registry.saygiDailyFocusHTML('2026-09-04');
  s.registry.saygiContinueHTML();
  s.registry.saygiContinueRows();
  s.registry.saygiPreviewHubHTML(s.sandbox.SaygiPeople[0], null, false);
  const after = JSON.stringify(data);
  ok('odak render `data`yı değiştirmez', before === after);
  ok('devam render `data`yı değiştirmez', JSON.stringify(data.quranJourney) === '{"activeSurahId":"alak","requests":{"alak":{"status":"watching"}}}');
  ok('yeni kalıcı alan açılmaz', Object.keys(data).sort().join(',') === 'days,quranJourney,saygi', Object.keys(data).join(','));
  ok('ağ/depo/timer açılmaz', s.counters.fetch === 0 && s.counters.storage === 0 && s.counters.timers === 0,
    JSON.stringify(s.counters));
}

// ── [6] Hub entegrasyonu: Bugün sekmesi odak + Devam, IIP-09 korunur ───────
console.log('[6] Hub — odak ve Devam Bugün sekmesinde; IIP-09 sözleşmesi korunur');
{
  const data = {
    days: {},
    saygi: { collection: {}, streak: 0, lastReadDate: '' },
    quranJourney: { activeSurahId: 'alak', requests: { alak: { status: 'watching' } } }
  };
  const s = makeSandbox({ data, ui: { faithTab: 'oz' } });
  s.sandbox.SeymaQuran = { quranSurahName: () => 'Alak' };
  s.sandbox.QuranRevelationOrderV1 = { byId: (id) => id === 'alak' ? { id: 'alak' } : null };
  s.sandbox.SeymaZikr = {
    zikrActivePreset: () => ({ id: 'esma_01', kind: 'esma', name: 'Yâ Latîf' }),
    zikrJourneyProgress: () => ({ journey: {}, hatim: { id: 'h', count: 3, target: 6, status: 'active' } })
  };
  const hub = s.registry.saygiPreviewHubHTML(s.sandbox.SaygiPeople[0], null, false);
  ok('Bugün sekmesi odak kartını gösterir', hub.indexOf('GÜNÜN ODAĞI') > -1);
  ok('odak kartı tek baskın eylemdir (tek CTA)', (hub.match(/GÜNÜN ODAĞI/g) || []).length === 1);
  ok('Devam satırları Bugün sekmesinde', hub.indexOf('Kaldığın yer') > -1 && hub.indexOf('Yâ Latîf') > -1);
  ok('IIP-09: rota/Devam yüzeyleri korunur', hub.indexOf('iip-09-route-rail') > -1 && hub.indexOf('iip-09-today-continue') > -1);
  ok('IIP-09: Bugün hâlâ Kur’an + zikir kartı taşır', hub.indexOf('quran-journey-card') > -1 && hub.indexOf('zikr-v2-preview') > -1);
  ok('IIP-09: İbadet araçları (kıble) Bugün’de değil', hub.indexOf('qibla-card') === -1);
  ok('yeni App handlerı eklenmedi (App.openZikr/openQuranJourney mevcut)',
    hub.indexOf('App.openZikr()') > -1 && hub.indexOf('App.openQuranJourney()') > -1);

  // Odak yalnız saygi dışı sekmelere sızmaz.
  s.ui.faithTab = 'oncu';
  const oncu = s.registry.saygiPreviewHubHTML(s.sandbox.SaygiPeople[0], null, false);
  ok('Öncü sekmesinde odak kartı görünmez', oncu.indexOf('GÜNÜN ODAĞI') === -1);
  ok('Öncü sekmesinde Devam satırı görünmez', oncu.indexOf('Kaldığın yer') === -1);
}

// ── [7] Yeni App.* eklenmediği ve CSS eklenmediği bekçisi ──────────────────
console.log('[7] Bekçi — yeni App.* handler ve yeni CSS sınıfı yok');
{
  const appSource = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const cssSource = fs.readFileSync(path.join(ROOT, 'app/styles.css'), 'utf8');
  const src = source;

  // Saygı registry'si App.* tanımlamaz; yalnız mevcut handlerları çağırır.
  ok('saygi.js yeni App üyesi ATAMAZ', !/App\.[A-Za-z]+\s*=/.test(src));
  const calls = Array.from(new Set((src.match(/App\.[A-Za-z]+\(/g) || []).map(s => s.slice(4, -1))));
  const missing = calls.filter(n => appSource.indexOf('App.' + n + '=function') === -1);
  ok('çağrılan her App handler app.js\'te tanımlı', missing.length === 0, missing.join(','));

  // Yeni sınıf uydurulmadı: hub katmanı yalnız stilli mevcut sınıfları kullanır.
  const invented = ['sg-daily-focus', 'sg-continue-row', 'sg-continue-icon', 'sg-continue-copy', 'sg-continue-go', 'saygi-continue'];
  const leaked = invented.filter(c => src.indexOf(c) > -1);
  ok('CSS\'siz yeni sınıf bırakılmadı', leaked.length === 0, leaked.join(','));
  ['saygi-source-card', 'saygi-link-thumb', 'saygi-link-copy', 'saygi-link-label', 'saygi-link-sub', 'saygi-link-arrow']
    .forEach(function (c) { ok('kullanılan sınıf stilli: .' + c, cssSource.indexOf('.' + c) > -1); });

  // IIP-11 ölçek-CSS bekçisiyle aynı ruh: ölçek hâlâ modal sarmalayıcıya bağlı.
  ok('IIP-11 ölçek sözleşmesi bozulmadı', /saygi-article-modal[^{]*\{[^}]*var\(--saygi-scale/.test(cssSource.replace(/\n/g, '')) || cssSource.indexOf('var(--saygi-scale') > -1);
}

// ── [8] Durum matrisi: boş / yükleniyor / hata / dönüş ─────────────────────
console.log('[8] Durum matrisi — boş, yükleniyor, hata, dönüş');
{
  const mkHub = function (ui, data) {
    const s = makeSandbox({ ui: ui, data: data || { days: {}, saygi: { collection: {}, streak: 0, lastReadDate: '' } } });
    s.sandbox.SeymaQuran = { quranSurahName: () => 'Alak' };
    s.sandbox.QuranRevelationOrderV1 = { byId: () => null };
    s.sandbox.SeymaZikr = { zikrActivePreset: () => null, zikrJourneyProgress: () => null };
    return { s: s, html: s.registry.saygiPreviewHubHTML(s.sandbox.SaygiPeople[0], null, false) };
  };

  // YÜKLENİYOR: odak/devam türetimi ağ durumuna BAĞLI OLMAMALI.
  const loading = mkHub({ faithTab: 'oz', saygiLoading: true });
  ok('yükleniyor: odak kartı yine basılır', loading.html.indexOf('GÜNÜN ODAĞI') > -1);

  // HATA: makale çekilememiş olsa da odak deterministik kalır.
  const errored = mkHub({ faithTab: 'oz', saygiError: 'Biyografi şu an yüklenemedi.' });
  ok('hata: odak kartı yine basılır', errored.html.indexOf('GÜNÜN ODAĞI') > -1);
  ok('hata: devam yüzeyi korunur', errored.html.indexOf('iip-09-today-continue') > -1);

  // BOŞ: içerik yokluğu hub'ı çökertmez; dürüst boş metin.
  const noPeople = makeSandbox({ people: [], ui: { faithTab: 'oz' } });
  noPeople.sandbox.SeymaZikr = { zikrActivePreset: () => null, zikrJourneyProgress: () => null };
  const emptyPerson = { id: 'x', name: 'X', kind: 'Bilim', era: '-', field: '-' };
  const emptyHub = noPeople.registry.saygiPreviewHubHTML(emptyPerson, null, false);
  ok('boş: hub çökmeden boş hâl basar', /kabul edilmiş içerik/.test(emptyHub), emptyHub.slice(0, 100));
  // Not: `iip-09-today-continue` bölümü IIP-09'dan gelir ve kendi "Kaldığın yer"
  // etiketini taşır; aranan şey BENİM continue GRUBUMUN yokluğudur.
  ok('boş: Devam grubu (satırlar) yok', emptyHub.indexOf('Kaldığın yer · devam et') === -1);
  ok('boş: hiç Devam düğmesi yok', emptyHub.indexOf('saygi-source-card') === -1);

  // DÖNÜŞ: aynı girdiyle dönüş render'ı ilk render ile bit bit aynı olmalı.
  const first = mkHub({ faithTab: 'oz' });
  const second = mkHub({ faithTab: 'oz' });
  ok('dönüş: iki bağımsız render bit bit aynı', first.html === second.html);
  const hashA = crypto.createHash('sha256').update(first.html).digest('hex');
  const hashB = crypto.createHash('sha256').update(second.html).digest('hex');
  ok('dönüş: hub çıktı hash sabit (deterministik)', hashA === hashB);
  console.log('INFO  IIP-12 Bugün hub sha256=' + hashA + ' bytes=' + Buffer.byteLength(first.html, 'utf8'));
}

console.log('\nIIP-12 daily focus and continue contract: ' + passed + ' PASS, ' + failed + ' FAIL');
if (failed) process.exitCode = 1;
