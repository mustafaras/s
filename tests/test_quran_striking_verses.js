// test_quran_striking_verses.js — İY-A kabul kapısı: Kur’an Yolculuğu hub
// kartının dönen vitrini için 100 âyetlik içerik modülünün (quranStrikingVersesV1.js)
// bütünlük denetimi. quranRevelationOrderV1.js ile birlikte çıplak bir
// node:vm sandbox'ında yüklenir (ağ YOK, tarayıcı YOK, localStorage YOK).
//
// Bu test DİN BİLGİSİ DOĞRULUĞUNU kanıtlayamaz — yalnızca YAPISAL bütünlüğü
// (100 kayıt, tekrarsız kimlik, geçerli sûre çapraz referansı, Arapça/Türkçe
// alanların dolu olması, "insan doğrulaması zorunlu" bayrağının dürüstçe
// false olarak ayarlanmış olması) kanıtlar. Metin doğruluğu için modülün
// kendi başındaki ZORUNLU İNSAN DOĞRULAMASI notuna bakın.
//
// Çalıştırma: node tests/test_quran_striking_verses.js

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var repoRoot = require('./repo-root');

var SRC_FILE = 'quranStrikingVersesV1.js';
var CATALOG_FILE = 'quranRevelationOrderV1.js';
var EXPECTED_TOTAL = 100;
var ARABIC_RE = /[؀-ۿ]/;

var pass = 0, fail = 0;
function ok(cond, label, detail) {
  if (cond) { pass++; return true; }
  fail++;
  console.error('  ✗ ' + label + (detail ? ' — ' + detail : ''));
  return false;
}
function section(t) { console.log('\n' + t); }

section('1. İzolasyon ve yükleme');
var src = fs.readFileSync(path.join(repoRoot, SRC_FILE), 'utf8');
var code = src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[\r\n])\s*\/\/[^\r\n]*/g, '$1');
var FORBIDDEN = ['localStorage', 'sessionStorage', 'fetch(', 'XMLHttpRequest',
                 'SeySync', 'document.', 'indexedDB', 'ghToken', 'require(', 'Date.now', 'Math.random'];
FORBIDDEN.forEach(function (needle) {
  ok(code.indexOf(needle) < 0, 'çalışan kod "' + needle + '" içermiyor');
});
ok(/^\(function\s*\(\)\s*\{\s*[\r\n]+\s*'use strict';/.test(src),
   "IIFE + 'use strict' deseni repo standardıyla aynı");

var sandbox = { window: {} };
vm.createContext(sandbox);
var catalogSrc = fs.readFileSync(path.join(repoRoot, CATALOG_FILE), 'utf8');
var loadErr = null;
try {
  vm.runInContext(catalogSrc, sandbox, { filename: CATALOG_FILE, timeout: 5000 });
  vm.runInContext(src, sandbox, { filename: SRC_FILE, timeout: 5000 });
} catch (e) { loadErr = e; }
ok(!loadErr, 'çıplak sandbox’ta (katalogla birlikte) hatasız yüklendi', loadErr && loadErr.message);
if (loadErr) { console.error('\nYükleme başarısız, test durdu.'); process.exit(1); }

ok(Object.keys(sandbox.window).length === 2,
   'window’a yalnız iki global yazıldı (katalog + âyet modülü)',
   'yazılanlar: ' + Object.keys(sandbox.window).join(', '));

var CAT = sandbox.window.QuranRevelationOrderV1;
var V = sandbox.window.QuranStrikingVersesV1;
ok(!!CAT, 'QuranRevelationOrderV1 yüklendi (çapraz referans için gerekli)');
ok(!!V, 'window.QuranStrikingVersesV1 tanımlı');
if (!V) { console.error('\nModül yok, test durdu.'); process.exit(1); }

section('2. Üst düzey sözleşme');
ok(V.catalogVersion === 'quran-striking-verses-tr-v1', 'catalogVersion doğru', V.catalogVersion);
ok(V.totalCount === EXPECTED_TOTAL, 'totalCount === 100', V.totalCount);
ok(Array.isArray(V.verses) && V.verses.length === EXPECTED_TOTAL, 'verses dizisi tam 100 kayıt', V.verses && V.verses.length);
ok(typeof V.methodologyTr === 'string' && V.methodologyTr.length > 40, 'methodologyTr dolu ve anlamlı uzunlukta');
ok(/doğruland/i.test(V.methodologyTr) || /İNSAN DOĞRULAMASI/i.test(src),
   'methodologyTr veya modül başlığı doğrulama durumunu açıkça belirtiyor');
ok(Array.isArray(V.sourceRefs) && V.sourceRefs.length > 0, 'sourceRefs dolu');
// 2026-08-01: kullanıcı 100 kaydı satır satır kontrol edip doğru/güvenilir
// bulduğunu bildirdi — bayrak buna göre çevrildi (bkz. modülün kendi
// başlığındaki "İNSAN DOĞRULAMASI TAMAMLANDI" notu). İçerik yeniden
// değişirse bu iki assertion (ve modüldeki verified/verifiedAt alanları)
// tekrar false'a çekilmeli.
ok(V.requiresHumanVerification === false,
   'requiresHumanVerification === false (kullanıcı doğrulaması tamamlandı olarak işaretli)');
ok(typeof V.verifiedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(V.verifiedAt), 'verifiedAt tarih damgası var', V.verifiedAt);
ok(typeof V.byId === 'function', 'byId fonksiyonu var');
ok(Object.isFrozen(V), 'üst nesne dondurulmuş');
ok(Object.isFrozen(V.verses), 'verses dizisi dondurulmuş');

section('3. Her kayıt alan bütünlüğü');
var ids = {}, dupIds = [], surahAyetKeys = {}, dupSurahAyet = [];
var surahCounts = {};
var missingArabicUnicode = [], emptyField = [], notFrozen = [], badSurahRef = [], notVerified = [], badVerifiedAt = [];
V.verses.forEach(function (rec) {
  if (ids[rec.id]) dupIds.push(rec.id); else ids[rec.id] = true;
  var key = rec.surahId + '|' + rec.ayetNo;
  if (surahAyetKeys[key]) dupSurahAyet.push(key); else surahAyetKeys[key] = true;
  surahCounts[rec.surahId] = (surahCounts[rec.surahId] || 0) + 1;
  ['id', 'surahId', 'surahNameTr', 'ayetNo', 'arabic', 'meal', 'themeTr'].forEach(function (k) {
    if (typeof rec[k] !== 'string' || !rec[k].trim()) emptyField.push(rec.id + '.' + k);
  });
  if (!ARABIC_RE.test(rec.arabic || '')) missingArabicUnicode.push(rec.id);
  if (!Object.isFrozen(rec)) notFrozen.push(rec.id);
  if (!CAT.byId(rec.surahId)) badSurahRef.push(rec.id + ' -> ' + rec.surahId);
  if (rec.verified !== true) notVerified.push(rec.id);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(rec.verifiedAt || '')) badVerifiedAt.push(rec.id);
});
ok(dupIds.length === 0, 'tekrarlayan id yok', dupIds);
ok(dupSurahAyet.length === 0, 'aynı sûre+âyet numarası iki kez eklenmemiş', dupSurahAyet);
ok(emptyField.length === 0, 'boş/eksik alan yok', emptyField);
ok(missingArabicUnicode.length === 0, 'her kaydın arabic alanı gerçek Arapça Unicode aralığı içeriyor', missingArabicUnicode);
ok(notFrozen.length === 0, 'her kayıt ayrı ayrı da dondurulmuş', notFrozen);
ok(badSurahRef.length === 0, 'her surahId, QuranRevelationOrderV1 kataloğunda GERÇEKTEN var (kırık çapraz referans yok)', badSurahRef);
ok(notVerified.length === 0,
   'TÜM kayıtlar verified:true (2026-08-01 kullanıcı doğrulaması sonrası) — yeni eklenen bir kayıt varsa burada yakalanır', notVerified);
ok(badVerifiedAt.length === 0, 'her kaydın geçerli bir verifiedAt tarih damgası var', badVerifiedAt);

section('4. Tema/sûre çeşitliliği (tek birkaç sûreye yığılmasın)');
var distinctSurahs = Object.keys(surahCounts).length;
var maxPerSurah = Object.keys(surahCounts).reduce(function (m, k) { return Math.max(m, surahCounts[k]); }, 0);
ok(distinctSurahs >= 55, 'en az 55 farklı sûreden âyet var (geniş yelpaze)', distinctSurahs);
ok(maxPerSurah <= 8, 'hiçbir sûre 8’den fazla kez tekrarlanmıyor (tek sûreye yığılma yok)', maxPerSurah);

var themes = {};
V.verses.forEach(function (rec) { String(rec.themeTr).split('·').forEach(function (t) { themes[t.trim()] = true; }); });
ok(Object.keys(themes).length >= 25, 'en az 25 farklı tema etiketi var', Object.keys(themes).length);

section('5. byId() sözleşmesi');
var sample = V.verses[0];
ok(V.byId(sample.id) === sample, 'byId geçerli kimlikte doğru kaydı döndürür');
ok(V.byId('olmayan-kimlik-xyz') === null, 'byId bilinmeyen kimlikte null döner (throw etmez)');
ok(V.byId(undefined) === null, 'byId undefined ile çökmez');

console.log('\n' + (fail === 0 ? '✅' : '❌') + ' Kur’an çarpıcı âyetler (İY-A) bütünlük denetimi: ' + pass + '/' + (pass + fail) + ' geçti');
if (fail === 0) {
  console.log('✅ Tüm kayıtlar verified:true, verifiedAt:2026-08-01 — kullanıcı doğrulaması tamamlandı olarak işaretli.');
  console.log('   Bu test yalnız YAPISAL bütünlüğü kanıtlar; içerik yeniden değişirse doğrulama tekrarlanmalı.');
}
process.exit(fail === 0 ? 0 : 1);
