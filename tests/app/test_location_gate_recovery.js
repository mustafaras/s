'use strict';
// Konum kapısı kurtarma yolu — regresyon kilidi
//
// GEÇMİŞ KUSUR (2026-09-21): `locationGateSilentVerify` app.js'te TANIMLIYDI ama
// HİÇ ÇAĞRILMIYORDU. İşlevi: izin geçmişte verilmişse (data.settings.locationEnabled)
// Permissions API ile izni konum ALMADAN okuyup kapıyı açmak. Çağrı kaldırıldığı
// için kapıyı açmanın TEK yolu taze `getCurrentPosition` olmuştu; OS düzeyinde
// konum servisleri kapalıyken (kod 2 POSITION_UNAVAILABLE) izinli kullanıcı
// "Konum doğrulamanadı" ekranında KİLİTLİ kalıyordu ve uygulamaya hiç giremiyordu.
//
// Bu fixture iki sözleşmeyi sabitler:
//   A) Kurtarma yolu çağrılır (tanımlı olmak yetmez).
//   B) Kod 2 geçici hatası tek seferlik düşük-hassasiyet denemesiyle telafi edilir
//      ve retry hakkı her hata kapanışında yenilenir.
//   C) İzin verildikten sonraki watchPosition kod 2/3 hataları uygulamayı yeniden
//      konum kapısına düşürmez; yalnız gerçek izin iptali (kod 1) kapıyı kapatır.
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const app = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const surface = fs.readFileSync(path.join(ROOT, 'app/core/appSurface.js'), 'utf8');
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

let passed = 0, failed = 0;
function ok(name, condition, detail) {
  if (condition) { passed++; console.log('PASS  ' + name); }
  else { failed++; console.log('FAIL  ' + name + (detail ? ' -> ' + detail : '')); }
}

// ── [1] Kurtarma yolu: tanımlı VE çağrılır ─────────────────────────────────
console.log('[1] Kurtarma yolu tanımlı ve ÇAĞRILIR');
{
  ok('app.js kurtarma fonksiyonunu tanımlar',
    /function locationGateSilentVerify\(\)\{/.test(app));

  // Çağrı appSurface'te, lifecycle bağımlılığı olarak yapılır (app.js'te değil:
  // oradaki çıplak çağrı formu MON2-07 sonrası kasıtlı olarak yasaklı).
  ok('appSurface.js kurtarma yolunu çağırır (lifecycle veya boot)',
    /lifecycleCall\('locationGateSilentVerify'\)|bootCall\('locationGateSilentVerify'\)/.test(surface));

  ok('çağrı initialRender (boot) içindedir',
    /function initialRender\(\)\{[\s\S]*?locationGateSilentVerify[\s\S]*?\n  \}/.test(surface));

  ok('çağrı try/catch ile sarılıdır (boot asla bu yüzden düşmez)',
    /try\{\s*(lifecycleCall|bootCall)\('locationGateSilentVerify'\);\s*\}catch\(e\)\{\}/.test(surface));

  // app.js'teki çıplak form hâlâ yasak (map boundary negatif iddiasının korunması).
  ok('app.js\'te çıplak çağrı formu YOK (map boundary iddiası korunur)',
    !/try\{ locationGateSilentVerify\(\); \}catch\(e\)\{\}/.test(app));

  // Kurtarma yolu konum ALMADAN karar vermeli: Permissions API yolunu içerir.
  ok('kurtarma yolu Permissions API ile izni konum almadan okur',
    /navigator\.permissions\.query\(\{name:'geolocation'\}\)/.test(app));
  ok('granted durumunda kapı doğrudan açılır',
    /st\.state==='granted'[\s\S]{0,80}accept\(\)/.test(app));
  ok('denied durumunda doğru hata gösterilir',
    /st\.state==='denied'[\s\S]{0,90}locationGateFailure\(1,'permission-denied'\)/.test(app));
  ok('önbellek yoklaması düşük hassasiyet + uzun maximumAge kullanır',
    /enableHighAccuracy:false,timeout:8000,maximumAge:900000/.test(app));
}

// ── [2] Kod 2 (POSITION_UNAVAILABLE) telafisi ──────────────────────────────
console.log('[2] Kod 2 geçici hatası düşük-hassasiyet denemesiyle telafi edilir');
{
  ok('kapıda kod 2 dalı vardır',
    /if\(code===2&&reason==='position-unavailable'/.test(surface));
  ok('kod 2 dalı düşük hassasiyetle yeniden dener',
    /code===2&&reason==='position-unavailable'[\s\S]{0,700}enableHighAccuracy:false,timeout:25000,maximumAge:600000/.test(surface));
  ok('yeniden deneme HATA gösterip beklemez (erken döner)',
    /code===2&&reason==='position-unavailable'[\s\S]{0,900}render\(\);\s*return;/.test(surface));
  ok('retry hakkı her hata kapanışında YENİLENİR (kalıcı kilit yok)',
    /function locationGateFailure\(code,reason\)\{[\s\S]{0,400}ui\.locationGateLowAccuracyTried=false;/.test(surface));
  // Vakit GPS akışı (kapı dışındaki ikinci yol) aynı telafiyi almalı.
  ok('App.fetchPrayerLocationGPS zaman aşımında yeniden dener',
    /App\.fetchPrayerLocationGPS[\s\S]{0,1200}prayerGpsLowTried/.test(app));
  ok('vakit GPS yolu ham err.message GÖSTERMEZ (yerelleştirilmiş metin)',
    /App\.fetchPrayerLocationGPS[\s\S]{0,1400}locationGateErrorText\(/.test(app) &&
    !/Konum alınamadı: '\+String\(err&&err\.message/.test(app));
}

// ── [3] Eyleme dönük mesaj ─────────────────────────────────────────────────
console.log('[3] Hata mesajı hangi menünün açılacağını söyler');
{
  ok('OS düzeyi ipucu yardımcısı vardır', /function osLocationHint\(\)\{/.test(surface));
  ok('kod 2 mesajı OS ipucunu içerir',
    /if\(code===2\) return 'Konum bulunamadı[\s\S]{0,120}osLocationHint\(\)/.test(surface));
  ok('ipucu Konum Servisleri menüsünü adıyla söyler',
    /Konum Servisleri açık mı/.test(surface) && /Gizlilik ve Güvenlik/.test(surface));
  ok('iOS/PWA için ayrı yönlendirme var', /isStandalonePWA\(\)[\s\S]{0,220}Uygulamayı Kullanırken/.test(surface));
  ok('eski belirsiz metin kaldırıldı',
    !/Cihazın Konum Servisleri açıkken yeniden dene/.test(surface) &&
    !/Cihazın Konum Servisleri açıkken yeniden dene/.test(app));
}

// ── [4] Sınırlar korunur ───────────────────────────────────────────────────
console.log('[4] Sınırlar — sw.js fetch yasağı, yeni App üyesi yok');
{
  ok('sw.js hâlâ fetch/localStorage/Authorization içermez',
    !/\bfetch\s*\(/.test(sw) && !/localStorage/.test(sw) && !/Authorization/.test(sw));
  ok('appSurface.js yeni App üyesi ATAMAZ', !/App\.[A-Za-z]+\s*=/.test(surface));
  // Dondurulmuş reminder/privacy tarayıcıları da bunu doğrular; burada hızlı bekçi.
  ok('appSurface.js konum bağımlılıkları lifecycle kaydında',
    /'startLocationWatch','tryLocNudge','moveState'/.test(surface));
  ok('watch başlatma kapı açıldığında yapılır (accept içinde)',
    /function accept\(\)\{[\s\S]{0,900}startLocationWatch\(false\)/.test(app));
}

// ── [5] Arka plan izleme hatası kapıyı yeniden kapatamaz ───────────────────
console.log('[5] Geçici watchPosition hatası konum kapısını yeniden açmaz');
{
  ok('watch hataları ayrı bir işleyiciye gider',
    /function locationWatchFailure\(code,reason\)\{/.test(app) &&
    /watchPosition\([\s\S]{0,700}locationWatchFailure\(/.test(app));
  ok('watch kod 1 gerçek izin iptali olarak kapı işleyicisine gider',
    /function locationWatchFailure\(code,reason\)\{[\s\S]{0,900}code===1[\s\S]{0,180}locationGateFailure\(1,'permission-denied'\)/.test(app));
  ok('watch kod 2/3 kapı durumunu unavailable yapmaz',
    /function locationWatchFailure\(code,reason\)\{[\s\S]{0,700}ui\.locationGateState='granted'/.test(app));
  ok('watch kod 2/3 konum izlemeyi sessizce sonlandırır',
    /function locationWatchFailure\(code,reason\)\{[\s\S]{0,700}stopLocationWatch\(\)/.test(app));
}

console.log('\nLocation gate recovery contract: ' + passed + ' PASS, ' + failed + ' FAIL');
if (failed) process.exitCode = 1;
