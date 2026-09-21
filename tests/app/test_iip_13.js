'use strict';
// IIP-13 — Vakit kaynağı ve tazelik · headless/no-network VM fixture
//
// REQ-025/TC-025  Tarih/şehir/yöntem eşleşmeyen cache açıkça eski gösterilir.
//                 Olumsuz: gece yarısı, şehir değişimi, timeout ve yöntem
//                 değişimi SAHTE GÜNCEL SAAT üretmez.
// REQ-026/TC-026  Türkiye kapsamı açık; seyahat için otomatik destek iddiası
//                 yok.
//                 Olumsuz: GPS yurtdışında olsa bile Istanbul saati yerel saat
//                 diye sunulmaz.
//
// Ağ, depo, timer, DOM yoktur; yalnız sentetik VM.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..', '..');
const prayerSource = fs.readFileSync(path.join(ROOT, 'app/core/prayer.js'), 'utf8');
const saygiSource = fs.readFileSync(path.join(ROOT, 'app/core/saygi.js'), 'utf8');
const cssSource = fs.readFileSync(path.join(ROOT, 'app/styles.css'), 'utf8');

let passed = 0, failed = 0;
function ok(name, condition, detail) {
  if (condition) { passed++; console.log('PASS  ' + name); }
  else { failed++; console.log('FAIL  ' + name + (detail ? ' -> ' + detail : '')); }
}
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ── prayer.js VM kurulumu ───────────────────────────────────────────────────
function bootPrayer(opts) {
  opts = opts || {};
  const store = Object.create(null);
  const counters = { storageGet: 0, storageSet: 0, fetch: 0, timers: 0, save: 0 };
  const data = opts.data || { days: {}, settings: { prayer: { method: 'diyanet', location: { lat: 41.0082, lon: 28.9784, cityName: 'İstanbul', source: 'city' } } } };
  const sandbox = {
    console, Date, Math, JSON, Object, Array, Number, String, isNaN, parseInt, isFinite,
    setTimeout: () => { counters.timers++; }, clearTimeout: () => {},
    localStorage: {
      getItem(k) { counters.storageGet++; return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem(k, v) { counters.storageSet++; store[k] = String(v); },
      removeItem(k) { delete store[k]; }
    },
    fetch: () => { counters.fetch++; return Promise.reject(new Error('ağ kapalı')); }
  };
  sandbox.window = sandbox; sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(prayerSource, sandbox, { filename: 'app/core/prayer.js' });
  const P = sandbox.SeymaPrayer;
  P.registerPrayer({
    data: () => data,
    getDay: (d, date) => d.days[date] || (d.days[date] = {}),
    dayIndexFor: () => 1,
    todayStr: () => opts.today || '2026-09-04',
    addDays: () => '',
    pad: (n) => String(n).padStart(2, '0'),
    esc,
    save: () => { counters.save++; },
    storage: () => sandbox.localStorage,
    fetch: sandbox.fetch
  });
  return { sandbox, P, store, counters, data };
}

// ── [1] REQ-025 · prayer.js tazelik/yöntem/konum eşleşmesi ──────────────────
console.log('[1] REQ-025 — cache geçerliliği gün+konum+yöntem eşleşmesiyle');
{
  const b = bootPrayer({ today: '2026-09-04' });
  const { P, store } = b;
  const NOW = Date.parse('2026-09-04T12:00:00Z');
  const locHash = P.prayerLocationHash();
  const times = { fajr: '05:12', dhuhr: '13:02' };

  ok('eşik sabiti 48 saat', P.PRAYER_STALE_HOURS === 48);

  // Hiç önbellek yok
  const none = P.prayerCacheFreshness({ nowMs: NOW });
  ok('önbellek yokken durum "none"', none.state === 'none' && !none.usable, JSON.stringify(none));
  ok('önbellek yokken "güncel" denmez', none.stale === true && none.label.indexOf('Güncel') === -1, none.label);

  // Taze kayıt
  P.prayerWriteCache('2026-09-04', locHash, 'diyanet', times);
  const fresh = P.prayerCacheFreshness({ nowMs: NOW });
  ok('taze kayıt "fresh" ve kullanılabilir',
    fresh.state === 'fresh' && fresh.usable === true && fresh.stale === false, JSON.stringify(fresh));
  ok('taze kayıt yaş bilgisi taşır', typeof fresh.ageH === 'number', String(fresh.ageH));

  // Yaşlı kayıt (72 saat önce)
  store[P.prayerCacheKey('2026-09-04', locHash)] = JSON.stringify({ date: '2026-09-04', locHash, method: 'diyanet', times, fetchedAt: new Date(NOW - 72 * 3600000).toISOString() });
  const old = P.prayerCacheFreshness({ nowMs: NOW });
  ok('48 saati aşan kayıt "stale"', old.state === 'stale' && old.stale === true && old.usable === false, JSON.stringify(old));
  ok('yaşlı kayıt etiketi açıkça "Eski"', /Eski/.test(old.label), old.label);

  // YÖNTEM uyuşmazlığı: kayıt diyanet, seçili mwl → taze olsa bile geçersiz
  store[P.prayerCacheKey('2026-09-04', locHash)] = JSON.stringify({ date: '2026-09-04', locHash, method: 'diyanet', times, fetchedAt: new Date(NOW).toISOString() });
  const mism = P.prayerCacheFreshness({ method: 'mwl', nowMs: NOW });
  ok('yöntem uyuşmazlığı "mismatch" ve kullanılamaz',
    mism.state === 'mismatch' && mism.usable === false && mism.stale === true, JSON.stringify(mism));
  ok('uyuşmazlık ayrıntısı iki yöntemi adıyla yazar',
    /Diyanet/.test(mism.detail) && /Muslim World League/.test(mism.detail), mism.detail);

  // KONUM (şehir) uyuşmazlığı: kayıt İstanbul, sorgu Ankara hash'i → kayıt yok
  const ankaHash = '39.9334,32.8597,Ankara';
  const other = P.prayerCacheFreshness({ locHash: ankaHash, nowMs: NOW });
  ok('başka şehir sorgusu eski şehrin kaydını kullanmaz', other.state === 'none' && other.usable === false, JSON.stringify(other));
  ok('başka şehir kaydı üretilmedi (sızma yok)', P.prayerCacheEntry('2026-09-04', ankaHash) === null);

  // GÜN eşleşmesi: dünkü kayıt bugün için geçerli değil
  const yest = P.prayerCacheFreshness({ date: '2026-09-03', nowMs: NOW });
  ok('başka gün sorgusu kayıt bulmaz', yest.state === 'none', JSON.stringify(yest));

  // Yardımcılar salt-okur: sayaçlar artmadı
  ok('tazelik yardımcıları state/depo YAZMAZ', b.counters.storageSet === 1 && b.counters.save === 0, JSON.stringify(b.counters));
  ok('tazelik yardımcıları ağa ÇIKMAZ', b.counters.fetch === 0);
}

// ── [2] REQ-025 olumsuz · gece yarısı (gün dönümü) ─────────────────────────
console.log('[2] REQ-025 olumsuz — gece yarısı sahte güncel saat üretmez');
{
  const b = bootPrayer({ today: '2026-09-05' });   // uygulama günü ilerledi
  const { P } = b;
  const NOW = Date.parse('2026-09-05T00:20:00Z');
  // Dünkü vakit kaydı hâlâ duruyor (23:50'de yazıldı)
  const day = P.prayerDayFreshness('2026-09-04T23:50:00.000Z', '2026-09-05', NOW);
  ok('gece yarısı sonrası dünkü kayıt "otherday"', day.state === 'otherday' && day.dayMatch === false, JSON.stringify(day));
  ok('gün dönümü kaydı "güncel" sayılmaz', day.stale === true, JSON.stringify(day));
  ok('gün dönümü ayrıntısı iki tarihi yazar',
    /2026-09-04/.test(day.detail) && /2026-09-05/.test(day.detail), day.detail);

  // Bugünün kaydı normal
  const same = P.prayerDayFreshness('2026-09-05T00:05:00.000Z', '2026-09-05', NOW);
  ok('aynı gün kaydı taze kabul edilir', same.state === 'fresh' && same.dayMatch === true, JSON.stringify(same));

  // Kayıt hiç yok
  const none = P.prayerDayFreshness('', '2026-09-05', NOW);
  ok('kayıt yokken durum "none"', none.state === 'none' && none.stale === true, JSON.stringify(none));

  // Bozuk zaman damgası taze sayılmaz
  const bad = P.prayerAgeInfo('bozuk-tarih', NOW);
  ok('bozuk zaman damgası stale ve yaşsız', bad.stale === true && bad.ageH === null, JSON.stringify(bad));
}

// ── [3] REQ-025 olumsuz · timeout / hata durumu ────────────────────────────
console.log('[3] REQ-025 olumsuz — timeout/hata eski saati güncel göstermez');
{
  function bootSaygi(fetchMetaOpts) {
    const ui = { faithTab: 'iman' };
    const state = { days: {}, settings: { prayer: { method: 'diyanet', location: { lat: 41.0082, lon: 28.9784, cityName: 'İstanbul', source: 'city' } } } };
    const sandbox = {
      console, Date, Math, JSON, Object, Array, Number, String, isNaN, parseInt, isFinite,
      setTimeout: () => {}, clearTimeout: () => {},
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      fetch: () => Promise.reject(new Error('ağ kapalı'))
    };
    sandbox.window = sandbox; sandbox.globalThis = sandbox;
    vm.createContext(sandbox);
    const P = sandbox.SeymaPrayer = JSON.parse(fs.readFileSync('/dev/null', 'utf8').length ? '{}' : '{}');
    // prayer registry'yi saygi sandbox'ına enjekte et
    vm.runInContext(prayerSource, sandbox, { filename: 'app/core/prayer.js' });
    sandbox.SeymaPrayer.registerPrayer({
      data: () => state, getDay: (d, date) => d.days[date] || (d.days[date] = {}),
      dayIndexFor: () => 1, todayStr: () => fetchMetaOpts.today || '2026-09-04',
      addDays: () => '', pad: (n) => String(n).padStart(2, '0'), esc,
      save: () => {}, storage: () => sandbox.localStorage, fetch: sandbox.fetch
    });
    vm.runInContext(saygiSource, sandbox, { filename: 'app/core/saygi.js' });
    sandbox.SeymaSaygi.registerSaygi({
      data: () => state, ui: () => ui,
      getDay: (d, date) => d.days[date] || (d.days[date] = { reading: { entries: [] }, prayer: fetchMetaOpts.dayPrayer || {} }),
      todayStr: () => fetchMetaOpts.today || '2026-09-04',
      addDays: () => '', diffDays: () => 0, dayIndexFor: () => 1, dateLabelTR: (d) => d,
      icon: (n) => '<svg data-icon="' + esc(n) + '"></svg>', esc,
      featuresLive: () => true, render: () => {}, quranJourneyHubCardHTML: () => '',
      zikrVisible: () => true, zikrPreviewCardHTML: () => ''
    });
    sandbox.SaygiPeople = [{ id: 'p1', name: 'Sentetik', kind: 'Bilim', era: '20. yy', field: 'Alan' }];
    sandbox.HijriCalendarV1 = { todayStr: (d, o) => 'Hicri ' + d, holyDay: () => '' };
    return { sandbox, registry: sandbox.SeymaSaygi, state };
  }

  // (a) timeout / fetch hatası → error durumu, eski saat güncel gösterilmez
  const err = bootSaygi({ dayPrayer: { fetchError: 'Vakit API zaman aşımı', fetchedAt: '2026-09-04T05:00:00.000Z' } });
  const errHtml = err.registry.faithCornerOverlayHTML();
  ok('timeout/hata durumu is-error ile gösterilir', /is-error/.test(errHtml), errHtml.slice(0, 0) || '');
  ok('hata ayrıntısı eski saatin gösterilmediğini söyler', /eski saatler gosterilmiyor|eski saatler gösterilmiyor/.test(errHtml));
  ok('hata durumunda "Önbellek hazır"/"Bugüne ait" YAZMAZ', !/Önbellek hazır/.test(errHtml) && !/Bugüne ait/.test(errHtml));

  // (b) başka güne ait kayıt → stale
  const other = bootSaygi({ today: '2026-09-05', dayPrayer: { fetchedAt: '2026-09-04T23:50:00.000Z', fetchedFor: '41.0082,28.9784,İstanbul', fetchedMethod: 'diyanet' } });
  const otherHtml = other.registry.faithCornerOverlayHTML();
  ok('başka güne ait kayıt "Başka güne ait" etiketiyle', /Başka güne ait/.test(otherHtml), otherHtml.slice(0, 0) || '');
  ok('gün dönümü kaydı "güncel" sunulmaz', !/Bugüne ait/.test(otherHtml));

  // (c) yöntem uyuşmazlığı → stale + iki yöntem adı
  const mm = bootSaygi({ dayPrayer: { fetchedAt: '2026-09-04T05:00:00.000Z', fetchedFor: '41.0082,28.9784,İstanbul', fetchedMethod: 'mwl' } });
  const mmHtml = mm.registry.faithCornerOverlayHTML();
  ok('yöntem uyuşmazlığı "Yöntem uyuşmuyor"', /Yöntem uyuşmuyor/.test(mmHtml), '');
  ok('uyuşmazlık iki yöntemi adıyla yazar', /Muslim World League/.test(mmHtml) && /Diyanet/.test(mmHtml));

  // (d) konum uyuşmazlığı → stale
  const lm = bootSaygi({ dayPrayer: { fetchedAt: '2026-09-04T05:00:00.000Z', fetchedFor: '39.9334,32.8597,Ankara', fetchedMethod: 'diyanet' } });
  const lmHtml = lm.registry.faithCornerOverlayHTML();
  ok('konum uyuşmazlığı "Konum uyuşmuyor"', /Konum uyuşmuyor/.test(lmHtml), '');

  // (e) taze ve eşleşen kayıt → ready (uygulama günü sabit: 2026-09-04)
  const good = bootSaygi({ dayPrayer: { fetchedAt: '2026-09-04T05:00:00.000Z', fetchedFor: '41.0082,28.9784,İstanbul', fetchedMethod: 'diyanet' } });
  const goodHtml = good.registry.faithCornerOverlayHTML();
  ok('eşleşen taze kayıt "Bugüne ait"', /Bugüne ait/.test(goodHtml), goodHtml.slice(0, 0) || '');
  ok('taze kayıt is-ready sınıfı taşır', /is-ready/.test(goodHtml));
  // Gerçek saat kullanılırsa (başka gün) gün eşleşmesi haklı olarak reddeder.
  const clockSkew = bootSaygi({ dayPrayer: { fetchedAt: new Date().toISOString(), fetchedFor: '41.0082,28.9784,İstanbul', fetchedMethod: 'diyanet' } });
  ok('gerçek saatten gelen kayıt (farklı gün) "güncel" sayılmaz',
    !/Bugüne ait/.test(clockSkew.registry.faithCornerOverlayHTML()));

  // (f) hiç kayıt yok → idle
  const none = bootSaygi({ dayPrayer: {} });
  const noneHtml = none.registry.faithCornerOverlayHTML();
  ok('kayıt yokken "Saatler bekleniyor"', /Saatler bekleniyor/.test(noneHtml), '');
  ok('kayıt yokken is-idle', /is-idle/.test(noneHtml));
}

// ── [4] REQ-026 · Türkiye kapsamı açık ─────────────────────────────────────
console.log('[4] REQ-026 — Türkiye kapsamı açık; otomatik seyahat desteği yok');
{
  const b = bootPrayer();
  const { P } = b;

  ok('İstanbul TR kutusunda', P.prayerInTurkey(41.0082, 28.9784) === true);
  ok('Ankara TR kutusunda', P.prayerInTurkey(39.9334, 32.8597) === true);
  ok('Berlin TR dışında', P.prayerInTurkey(52.52, 13.405) === false);
  ok('Londra TR dışında', P.prayerInTurkey(51.5074, -0.1278) === false);
  ok('geçersiz koordinat TR sayılmaz', P.prayerInTurkey('x', null) === false);

  const inside = P.prayerCoverage({ lat: 41.0082, lon: 28.9784, cityName: 'İstanbul', source: 'city' });
  ok('TR içi kapsam "inside"', inside.state === 'inside' && inside.inTurkey === true, JSON.stringify(inside));
  ok('TR içi kapsam ayrıntısı liste+yöntem yazar', /81 il/.test(inside.detail) && /Diyanet/.test(inside.detail), inside.detail);
  ok('TR içi otomatik timezone desteği İDDİA ETMEZ', inside.needsOwnTimezone === false);

  const outside = P.prayerCoverage({ lat: 52.52, lon: 13.405, cityName: 'Berlin', source: 'gps' });
  ok('yurtdışı kapsam "outside"', outside.state === 'outside' && outside.inTurkey === false, JSON.stringify(outside));
  ok('yurtdışı kapsam "yerel saat olarak sunulmaz" der', /yerel saat olarak sunulmaz/.test(outside.detail), outside.detail);
  ok('yurtdışı için ayrı timezone gerektiği işaretlenir', outside.needsOwnTimezone === true);

  const none = P.prayerCoverage({});
  ok('konum yokken kapsam "none"', none.state === 'none' && none.inTurkey === false, JSON.stringify(none));
  // Argümansız çağrı seçili konuma düşer (fallback bilinçli).
  ok('argümansız çağrı seçili konuma düşer', P.prayerCoverage().state === 'inside');
}

// ── [5] REQ-026 olumsuz · GPS yurtdışı Istanbul saati diye sunulmaz ────────
console.log('[5] REQ-026 olumsuz — GPS yurtdışı olsa bile Istanbul saati yerel sunulmaz');
{
  function bootSaygiWithLoc(loc, opts) {
    opts = opts || {};
    const ui = { faithTab: 'iman' };
    const state = { days: {}, settings: { prayer: { method: 'diyanet', location: loc } } };
    const sandbox = {
      console, Date, Math, JSON, Object, Array, Number, String, isNaN, parseInt, isFinite,
      setTimeout: () => {}, clearTimeout: () => {},
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      fetch: () => Promise.reject(new Error('ağ kapalı'))
    };
    sandbox.window = sandbox; sandbox.globalThis = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(prayerSource, sandbox, { filename: 'app/core/prayer.js' });
    sandbox.SeymaPrayer.registerPrayer({
      data: () => state, getDay: (d, date) => d.days[date] || (d.days[date] = {}),
      dayIndexFor: () => 1, todayStr: () => '2026-09-04', addDays: () => '',
      pad: (n) => String(n).padStart(2, '0'), esc, save: () => {},
      storage: () => sandbox.localStorage, fetch: sandbox.fetch
    });
    vm.runInContext(saygiSource, sandbox, { filename: 'app/core/saygi.js' });
    sandbox.SeymaSaygi.registerSaygi({
      data: () => state, ui: () => ui,
      getDay: (d, date) => d.days[date] || (d.days[date] = { reading: { entries: [] }, prayer: opts.dayPrayer || {} }),
      todayStr: () => '2026-09-04', addDays: () => '', diffDays: () => 0, dayIndexFor: () => 1,
      dateLabelTR: (d) => d, icon: (n) => '<svg data-icon="' + esc(n) + '"></svg>', esc,
      featuresLive: () => true, render: () => {}, quranJourneyHubCardHTML: () => '',
      zikrVisible: () => true, zikrPreviewCardHTML: () => ''
    });
    sandbox.SaygiPeople = [{ id: 'p1', name: 'Sentetik', kind: 'Bilim', era: '20. yy', field: 'Alan' }];
    sandbox.HijriCalendarV1 = { todayStr: (d) => 'Hicri ' + d, holyDay: () => '' };
    return { registry: sandbox.SeymaSaygi };
  }

  const abroad = bootSaygiWithLoc({ lat: 52.52, lon: 13.405, cityName: 'Berlin', source: 'gps', accuracy: 12 });
  const html = abroad.registry.faithCornerOverlayHTML();
  ok('GPS yurtdışı "Türkiye dışı" olarak gösterilir', /Türkiye dışı/.test(html), '');
  ok('yurtdışı kapsam hücresi yerel saat iddiasını reddeder', /yerel saat olarak sunulmaz/.test(html));
  ok('yurtdışı kapsam "Türkiye kapsamı içinde" DEMEZ', !/Türkiye kapsamı içinde/.test(html));
  ok('GPS konum etiketi korunur (hassasiyet ayrı)', /GPS konumu/.test(html) && /12 m hassasiyet/.test(html));

  // TR içi GPS: kapsam içinde gösterilir ama yine "Türkiye kapsamı" denir
  const home = bootSaygiWithLoc({ lat: 41.0082, lon: 28.9784, cityName: 'İstanbul', source: 'gps', accuracy: 8 });
  const homeHtml = home.registry.faithCornerOverlayHTML();
  ok('TR içi GPS kapsam içinde', /Türkiye kapsamı içinde/.test(homeHtml), '');

  // Kapsam verisi yoksa hücre hiç basılmaz (uydurma yok)
  const bare = bootSaygiWithLoc(null);
  const bareHtml = bare.registry.faithCornerOverlayHTML();
  ok('konum yokken kapsam hücresi de "Konum yok" der', /Konum yok/.test(bareHtml), '');
  ok('kapsam hücresi her durumda tek kez basılır', (bareHtml.match(/<span>Kapsam<\/span>/g) || []).length === 1);
}

// ── [6] Bekçi · salt-okur, yeni App.* yok, stilli sınıflar ─────────────────
console.log('[6] Bekçi — salt-okur, yeni App.* ve stilli sınıf');
{
  const appSource = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  ok('prayer.js yeni App üyesi ATAMAZ', !/App\.[A-Za-z]+\s*=/.test(prayerSource));
  ok('saygi.js yeni App üyesi ATAMAZ', !/App\.[A-Za-z]+\s*=/.test(saygiSource));
  const calls = Array.from(new Set((saygiSource.match(/App\.[A-Za-z]+\(/g) || []).map(s => s.slice(4, -1))));
  ok('çağrılan her App handler app.js\'te tanımlı',
    calls.filter(n => appSource.indexOf('App.' + n + '=function') === -1).length === 0,
    calls.filter(n => appSource.indexOf('App.' + n + '=function') === -1).join(','));

  // Yeni CSS sınıfı yazılmadı: yalnız mevcut stilli sınıflar kullanıldı.
  const invented = ['sg-fresh', 'sg-stale', 'sg-coverage', 'faith-source-note', 'sg-cache-badge'];
  ok('CSS\'siz yeni sınıf bırakılmadı', invented.filter(c => saygiSource.indexOf(c) > -1).length === 0);
  ['sg-tool-meta-grid', 'sg-tool-meta'].forEach(function (c) {
    ok('kullanılan sınıf stilli: .' + c, cssSource.indexOf('.' + c) > -1);
  });
  ['is-ready', 'is-error', 'is-idle'].forEach(function (c) {
    ok('durum sınıfı stilli: .sg-tool-meta-grid strong.' + c,
      new RegExp('\\.sg-tool-meta-grid strong\\.' + c).test(cssSource));
  });
  ok('"stale" durumu mevcut is-error ile gösterilir (yeni sınıf gerekmez)',
    /faithPrayerFetchMeta[\s\S]{0,1500}state:'stale'/.test(saygiSource) &&
    saygiSource.indexOf('class="is-\'+fetchMeta.state') > -1);

  // Yeni zorunlu bağımlılık eklenmedi (fixture sözleşmesi korunur)
  const depLine = (saygiSource.match(/var SAYGI_DEPENDENCIES=\[[^\]]*\]/) || [''])[0];
  ok('SAYGI_DEPENDENCIES listesi büyümedi (15 bağımlılık)',
    (depLine.match(/'/g) || []).length / 2 === 15, String((depLine.match(/'/g) || []).length / 2));
  const prayerDepLine = (prayerSource.match(/var PRAYER_DEPENDENCIES=\[[^\]]*\]/) || [''])[0];
  ok('PRAYER_DEPENDENCIES listesi büyümedi (10 bağımlılık)',
    (prayerDepLine.match(/'/g) || []).length / 2 === 10, String((prayerDepLine.match(/'/g) || []).length / 2));

  // Render tazelik yolu GERÇEK SAATE bağlanmamalı: aksi hâlde çıktı cihaz
  // saatine göre değişir (gizli determinizm kusuru; bir kez yaşandı).
  const metaSeg = (saygiSource.match(/function faithPrayerFetchMeta[\s\S]*?\n  \}/) || [''])[0];
  ok('render tazelik yolu gerçek-saat yaş hesabı KULLANMAZ',
    metaSeg.length > 0 && metaSeg.indexOf('prayerAgeInfo') === -1 && metaSeg.indexOf('Date.now') === -1,
    'uzunluk=' + metaSeg.length);
  ok('render tazelik yolu gün/metot/konum eşleşmesini kullanır',
    /slice\(0,10\)!==today/.test(metaSeg) && /fetchedMethod/.test(metaSeg) && /fetchedFor/.test(metaSeg));
  ok('yaşa dayalı bayatlama açıkça prayerCacheFreshness(nowMs) ile ölçülür',
    /function prayerCacheFreshness/.test(prayerSource) && /nowMs/.test(prayerSource));

  // Tazelik yardımcıları export edildi
  ['prayerAgeInfo', 'prayerCacheFreshness', 'prayerDayFreshness', 'prayerCoverage', 'prayerInTurkey', 'prayerMethodLabel', 'PRAYER_STALE_HOURS']
    .forEach(function (n) { ok('export: ' + n, prayerSource.indexOf(n + ':' + n) > -1 || prayerSource.indexOf(n + ':PRAYER_STALE_HOURS') > -1); });
}

// ── [7] Durum matrisi: boş / yükleniyor / hata / dönüş ─────────────────────
console.log('[7] Durum matrisi — boş, yükleniyor, hata, dönüş');
{
  const b = bootPrayer({ today: '2026-09-04' });
  const { P } = b;
  const NOW = Date.parse('2026-09-04T12:00:00Z');
  const locHash = P.prayerLocationHash();

  // BOŞ: kayıt yok → none, hiçbir zaman "güncel" denmez
  ok('boş: durum "none" ve stale', P.prayerCacheFreshness({ nowMs: NOW }).state === 'none');

  // YÜKLENİYOR: yazma sonrası okuma taze döner (ağ yok, sentetik)
  P.prayerWriteCache('2026-09-04', locHash, 'diyanet', { fajr: '05:12' });
  ok('yazma sonrası okuma "fresh"', P.prayerCacheFreshness({ nowMs: NOW }).state === 'fresh');

  // HATA: bozuk JSON depoda → kayıt yok sayılır, çökmez
  b.store[P.prayerCacheKey('2026-09-04', locHash)] = '{bozuk json';
  ok('bozuk önbellek çökmeden "none" döner', P.prayerCacheFreshness({ nowMs: NOW }).state === 'none');

  // DÖNÜŞ: aynı girdi aynı çıktı (deterministik)
  P.prayerWriteCache('2026-09-04', locHash, 'diyanet', { fajr: '05:12' });
  const a1 = JSON.stringify(P.prayerCacheFreshness({ nowMs: NOW }));
  const a2 = JSON.stringify(P.prayerCacheFreshness({ nowMs: NOW }));
  ok('dönüş: aynı girdi aynı çıktı (deterministik)', a1 === a2, a1);
  const c1 = JSON.stringify(P.prayerCoverage({ lat: 41.0082, lon: 28.9784, cityName: 'İstanbul' }));
  const c2 = JSON.stringify(P.prayerCoverage({ lat: 41.0082, lon: 28.9784, cityName: 'İstanbul' }));
  ok('dönüş: kapsam çıktısı deterministik', c1 === c2);
}

console.log('\nIIP-13 prayer source and freshness contract: ' + passed + ' PASS, ' + failed + ' FAIL');
if (failed) process.exitCode = 1;
