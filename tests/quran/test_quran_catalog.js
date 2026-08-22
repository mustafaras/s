// QY-01 — Kur’an nüzul kataloğu doğrulama harness'i (ağ YOK, tarayıcı YOK)
// quranRevelationOrderV1.js dosyasını yalnız `window` içeren çıplak bir
// node:vm sandbox'ında çalıştırır. Sandbox'ta localStorage/fetch/document/
// process bulunmadığı için modül bunlara dokunursa test anında patlar —
// yani "içerik uygulama state'ine karışmıyor" iddiası kanıtlanır.
// Çalıştırma: node tests/quran/test_quran_catalog.js

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var repoRoot = require('../repo-root');

var SRC_FILE = 'quranRevelationOrderV1.js';
var TOTAL = 114;
// Kûfe (Hafs) sayımına göre Kur’an’ın toplam âyet sayısı. Tek bir kayıttaki
// yazım hatasını bile yakalayan çapraz bütünlük kontrolü.
var TOTAL_AYAH_KUFI = 6236;

var pass = 0, fail = 0;
function ok(cond, label, detail) {
  if (cond) { pass++; return true; }
  fail++;
  console.error('  ✗ ' + label + (detail ? ' — ' + detail : ''));
  return false;
}
function section(t) { console.log('\n' + t); }

// ---- Modülü izole sandbox'ta yükle -----------------------------------------
var src = fs.readFileSync(path.join(repoRoot, SRC_FILE), 'utf8');

section('1. İzolasyon ve yükleme');

// Statik tarama: kullanıcı state'i / ağ / depolama sızıntısı olmamalı.
// Yorumlar taramanın dışında tutulur — açıklama metni "localStorage'a
// dokunmaz" diyebilmeli, fakat çalışan kodda bu adlar geçmemeli.
var code = src
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/(^|[\r\n])\s*\/\/[^\r\n]*/g, '$1');
var FORBIDDEN = ['localStorage', 'sessionStorage', 'fetch(', 'XMLHttpRequest',
                 'SeySync', 'document.', 'indexedDB', 'ghToken', 'require('];
FORBIDDEN.forEach(function (needle) {
  ok(code.indexOf(needle) < 0, 'çalışan kod "' + needle + '" içermiyor');
});
ok(/^\(function\s*\(\)\s*\{\s*[\r\n]+\s*'use strict';/.test(src),
   "IIFE + 'use strict' deseni repo standardıyla aynı");

var sandbox = { window: {} };
vm.createContext(sandbox);
var loadErr = null;
try {
  vm.runInContext(src, sandbox, { filename: SRC_FILE, timeout: 5000 });
} catch (e) { loadErr = e; }
ok(!loadErr, 'çıplak sandbox’ta hatasız yüklendi', loadErr && loadErr.message);
if (loadErr) { console.error('\nYükleme başarısız, test durdu.'); process.exit(1); }

ok(Object.keys(sandbox.window).length === 1,
   'window’a yalnız tek global yazıldı',
   'yazılanlar: ' + Object.keys(sandbox.window).join(', '));

var C = sandbox.window.QuranRevelationOrderV1;
ok(!!C, 'window.QuranRevelationOrderV1 tanımlı');
if (!C) { process.exit(1); }

// ---- Katalog düzeyi ---------------------------------------------------------
section('2. Katalog meta verisi');
ok(C.catalogVersion === 'quran-revelation-tr-v1', 'catalogVersion plandaki değerle aynı', C.catalogVersion);
ok(Array.isArray(C.surahs), 'surahs bir dizi');
ok(C.surahs.length === TOTAL, 'tam ' + TOTAL + ' kayıt var', 'bulunan: ' + C.surahs.length);
ok(C.totalCount === TOTAL, 'totalCount === ' + TOTAL, String(C.totalCount));
ok(C.firstSurahId === 'alak', 'yolculuk Alak sûresiyle başlıyor', C.firstSurahId);
ok(typeof C.methodologyTr === 'string' && C.methodologyTr.length > 200,
   'yöntem notu (kaynak farkı açıklaması) dolu', 'uzunluk: ' + (C.methodologyTr || '').length);
ok(/nüzul/i.test(C.methodologyTr) && /ihtilaf/i.test(C.methodologyTr),
   'yöntem notu nüzul tertibini ve ihtilafı açıkça anıyor');
ok(Array.isArray(C.sourceRefs) && C.sourceRefs.length >= 2,
   'katalog seviyesinde en az iki kaynak künyesi var');

// ---- Kayıt şeması -----------------------------------------------------------
section('3. Kayıt şeması ve içerik');
var FIELDS = ['id', 'revelationOrder', 'mushafOrder', 'nameTr', 'nameAr',
              'revelationPlace', 'ayahCount', 'themeTr', 'sourceRefs', 'editorialStatus'];
var ARABIC = /[ء-ي]/;
var SLUG = /^[a-z]+(-[a-z]+)*$/;

var missingField = [], badId = [], emptyTr = [], badAr = [], badPlace = [],
    badAyah = [], badTheme = [], noRefs = [], notReviewed = [], htmlish = [];

C.surahs.forEach(function (s) {
  FIELDS.forEach(function (f) {
    if (!(f in s)) missingField.push(s.id + '.' + f);
  });
  if (typeof s.id !== 'string' || !SLUG.test(s.id)) badId.push(String(s.id));
  if (typeof s.nameTr !== 'string' || !s.nameTr.trim()) emptyTr.push(s.id);
  if (typeof s.nameAr !== 'string' || !ARABIC.test(s.nameAr)) badAr.push(s.id);
  if (s.revelationPlace !== 'Mekke' && s.revelationPlace !== 'Medine') badPlace.push(s.id);
  if (!Number.isInteger(s.ayahCount) || s.ayahCount < 3 || s.ayahCount > 286) badAyah.push(s.id);
  if (typeof s.themeTr !== 'string' || s.themeTr.trim().length < 25) badTheme.push(s.id);
  if (!Array.isArray(s.sourceRefs) || s.sourceRefs.length === 0 ||
      s.sourceRefs.some(function (r) { return typeof r !== 'string' || !r.trim(); })) noRefs.push(s.id);
  if (s.editorialStatus !== 'reviewed') notReviewed.push(s.id);
  if (/[<>]/.test(s.nameTr + s.nameAr + s.themeTr)) htmlish.push(s.id);
});

ok(missingField.length === 0, 'her kayıtta 10 zorunlu alan var', missingField.slice(0, 5).join(', '));
ok(badId.length === 0, 'tüm id’ler ASCII slug', badId.slice(0, 5).join(', '));
ok(emptyTr.length === 0, 'Türkçe adlar boş değil', emptyTr.slice(0, 5).join(', '));
ok(badAr.length === 0, 'Arapça adlar dolu ve Arap harfi içeriyor', badAr.slice(0, 5).join(', '));
ok(badPlace.length === 0, 'revelationPlace yalnız Mekke/Medine', badPlace.slice(0, 5).join(', '));
ok(badAyah.length === 0, 'ayahCount makul tam sayı (3..286)', badAyah.slice(0, 5).join(', '));
ok(badTheme.length === 0, 'tema özetleri anlamlı uzunlukta', badTheme.slice(0, 5).join(', '));
ok(noRefs.length === 0, 'kaynak referansı olmayan kayıt yok', noRefs.slice(0, 5).join(', '));
ok(notReviewed.length === 0, 'tüm kayıtlar editorialStatus=reviewed', notReviewed.slice(0, 5).join(', '));
ok(htmlish.length === 0, 'metinlerde ham < > karakteri yok (XSS yüzeyi)', htmlish.slice(0, 5).join(', '));

// ---- Sıra bütünlüğü ---------------------------------------------------------
section('4. Nüzul ve mushaf sıra bütünlüğü');
function permutationReport(values) {
  var seen = {}, dup = [], out = [];
  values.forEach(function (v) {
    if (!Number.isInteger(v) || v < 1 || v > TOTAL) out.push(v);
    if (seen[v]) dup.push(v); else seen[v] = true;
  });
  var missing = [];
  for (var n = 1; n <= TOTAL; n++) if (!seen[n]) missing.push(n);
  return { dup: dup, out: out, missing: missing };
}

var revRep = permutationReport(C.surahs.map(function (s) { return s.revelationOrder; }));
ok(revRep.out.length === 0, 'revelationOrder değerleri 1..114 aralığında', revRep.out.join(', '));
ok(revRep.dup.length === 0, 'revelationOrder’da tekrar yok', revRep.dup.join(', '));
ok(revRep.missing.length === 0, 'eksik nüzul sırası yok', revRep.missing.join(', '));

var mushRep = permutationReport(C.surahs.map(function (s) { return s.mushafOrder; }));
ok(mushRep.out.length === 0, 'mushafOrder değerleri 1..114 aralığında', mushRep.out.join(', '));
ok(mushRep.dup.length === 0, 'mushafOrder’da tekrar yok', mushRep.dup.join(', '));
ok(mushRep.missing.length === 0, 'eksik mushaf sırası yok', mushRep.missing.join(', '));

var ids = C.surahs.map(function (s) { return s.id; });
ok(new Set(ids).size === TOTAL, 'id’ler benzersiz');
var namesTr = C.surahs.map(function (s) { return s.nameTr; });
ok(new Set(namesTr).size === TOTAL, 'Türkçe adlar benzersiz');
var namesAr = C.surahs.map(function (s) { return s.nameAr; });
ok(new Set(namesAr).size === TOTAL, 'Arapça adlar benzersiz');

var sorted = C.surahs.every(function (s, i) { return s.revelationOrder === i + 1; });
ok(sorted, 'dizi nüzul sırasına göre artan biçimde dizili');

// ---- Çapraz bütünlük --------------------------------------------------------
section('5. Çapraz doğrulama');
var ayahSum = C.surahs.reduce(function (a, s) { return a + s.ayahCount; }, 0);
ok(ayahSum === TOTAL_AYAH_KUFI,
   'toplam âyet sayısı Kûfe sayımıyla uyuşuyor (' + TOTAL_AYAH_KUFI + ')',
   'hesaplanan: ' + ayahSum);

var mekke = C.surahs.filter(function (s) { return s.revelationPlace === 'Mekke'; });
var medine = C.surahs.filter(function (s) { return s.revelationPlace === 'Medine'; });
ok(mekke.length === 86 && medine.length === 28,
   'Mekke 86 / Medine 28 dağılımı tertiple tutarlı',
   mekke.length + ' / ' + medine.length);
ok(mekke.every(function (s) { return s.revelationOrder <= C.lastMeccanOrder; }) &&
   medine.every(function (s) { return s.revelationOrder > C.lastMeccanOrder; }),
   'Mekke/Medine blokları nüzul sırasında kesintisiz');

// Bilinen sabit noktalar (elle doğrulanmış referans değerler).
var SPOTS = [
  ['alak', 1, 96, 19], ['kalem', 2, 68, 52], ['fatiha', 5, 1, 7],
  ['ihlas', 22, 112, 4], ['sad', 38, 38, 88], ['bakara', 87, 2, 286],
  ['nisa', 92, 4, 176], ['tevbe', 113, 9, 129], ['nasr', 114, 110, 3]
];
SPOTS.forEach(function (sp) {
  var s = C.byId(sp[0]);
  ok(!!s && s.revelationOrder === sp[1] && s.mushafOrder === sp[2] && s.ayahCount === sp[3],
     'sabit nokta ' + sp[0] + ' = nüzul ' + sp[1] + ' / mushaf ' + sp[2] + ' / ' + sp[3] + ' âyet',
     s ? (s.revelationOrder + '/' + s.mushafOrder + '/' + s.ayahCount) : 'bulunamadı');
});

ok(Array.isArray(C.disputedPlaceIds) && C.disputedPlaceIds.length > 0,
   'ihtilaflı niteleme listesi dolu');
ok(C.disputedPlaceIds.every(function (id) { return !!C.byId(id); }),
   'disputedPlaceIds içindeki her id gerçek bir kayda çözülüyor');

// ---- Lookup API -------------------------------------------------------------
section('6. Lookup fonksiyonları');
ok(C.byId('alak') === C.surahs[0], 'byId doğru kaydı döndürüyor');
ok(C.byRevelationOrder(114).id === 'nasr', 'byRevelationOrder doğru kaydı döndürüyor');
ok(C.byMushafOrder(1).id === 'fatiha', 'byMushafOrder doğru kaydı döndürüyor');
ok(C.byId('yok-boyle-bir-sure') === null, 'bilinmeyen id için null');
ok(C.byRevelationOrder(0) === null && C.byRevelationOrder(115) === null, 'aralık dışı nüzul sırası için null');
ok(C.byMushafOrder(999) === null, 'aralık dışı mushaf sırası için null');
ok(C.byId('toString') === null && C.byId('constructor') === null,
   'prototype anahtarları kayıt olarak sızmıyor');
ok(C.isPlaceDisputed('fatiha') === true && C.isPlaceDisputed('alak') === false,
   'isPlaceDisputed doğru çalışıyor');

// Her kayıt kendi anahtarlarıyla geri bulunabilmeli.
var lookupBroken = C.surahs.filter(function (s) {
  return C.byId(s.id) !== s || C.byRevelationOrder(s.revelationOrder) !== s ||
         C.byMushafOrder(s.mushafOrder) !== s;
});
ok(lookupBroken.length === 0, '114 kaydın tamamı üç anahtarla da geri bulunuyor',
   lookupBroken.map(function (s) { return s.id; }).slice(0, 5).join(', '));

// ---- Dondurulmuşluk ---------------------------------------------------------
section('7. Dondurulmuş içerik güvencesi');
ok(Object.isFrozen(C), 'katalog kökü donmuş');
ok(Object.isFrozen(C.surahs), 'surahs dizisi donmuş');
ok(C.surahs.every(Object.isFrozen), 'her kayıt donmuş');
ok(Object.isFrozen(C.sourceRefs) && Object.isFrozen(C.disputedPlaceIds), 'kaynak/ihtilaf listeleri donmuş');

var before = C.surahs[0].nameTr;
try { C.surahs[0].nameTr = 'BOZULDU'; } catch (e) { /* strict modda atma normal */ }
ok(C.surahs[0].nameTr === before, 'kayıt alanı dışarıdan değiştirilemiyor');
var lenBefore = C.surahs.length;
try { C.surahs.push({ id: 'sahte' }); } catch (e) { /* donmuş dizide normal */ }
ok(C.surahs.length === lenBefore, 'diziye dışarıdan kayıt eklenemiyor');

// ---- Sonuç ------------------------------------------------------------------
console.log('\n' + (fail === 0 ? '✅' : '❌') + ' Kur’an kataloğu: ' + pass + '/' + (pass + fail) + ' geçti');
process.exit(fail === 0 ? 0 : 1);
