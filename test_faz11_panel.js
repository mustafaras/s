// Faz 11 — Headless panel özet testleri (sentetik veri, gerçek network YOK)
// panel.html'deki profileAssessmentCardHTML fonksiyonunu kaynak dosyadan çıkarıp
// mock bağımlılıklarla test eder. panel.html IIFE olduğu için vm.runInContext
// çalışmaz — bunun yerine fonksiyon kaynağını çekip minimal mock'larla eval eder.
// Çalıştırma: node test_faz11_panel.js

var fs = require('fs');
var path = require('path');

// panel.html kaynağını oku
var html = fs.readFileSync(path.join(__dirname,'panel.html'),'utf8');

// ICONS map'i çıkar (icon() fonksiyonu için)
var iconsMatch = html.match(/var ICONS\s*=\s*\{[\s\S]*?\};/);
if (!iconsMatch) { console.error('ICONS bulunamadı'); process.exit(1); }

// icon() fonksiyonunu çıkar
var iconFnMatch = html.match(/function icon\(name,size,cls\)\{[\s\S]*?\}/);
if (!iconFnMatch) { console.error('icon() bulunamadı'); process.exit(1); }

// esc() fonksiyonunu çıkar
var escFnMatch = html.match(/function esc\(s\)\{[\s\S]*?\}/);
if (!escFnMatch) { console.error('esc() bulunamadı'); process.exit(1); }

// fmtTR() fonksiyonunu çıkar
var fmtTRMatch = html.match(/function fmtTR\(s\)\{[\s\S]*?\}/);
if (!fmtTRMatch) { console.error('fmtTR() bulunamadı'); process.exit(1); }

// MONTH_TR ve DOW_TR array'lerini çıkar
var monthTRMatch = html.match(/var MONTH_TR=\[[\s\S]*?\];/);
var dowTRMatch = html.match(/var DOW_TR=\[[\s\S]*?\];/);

// cardWrap() fonksiyonunu çıkar
var cardWrapMatch = html.match(/function cardWrap\(o\)\{[\s\S]*?return s;\n\}/);
if (!cardWrapMatch) { console.error('cardWrap() bulunamadı'); process.exit(1); }

// toggleCard() fonksiyonunu çıkar
var toggleCardMatch = html.match(/function toggleCard\(key\)\{[\s\S]*?\}/);
if (!toggleCardMatch) { console.error('toggleCard() bulunamadı'); process.exit(1); }

// profileAssessmentCardHTML() fonksiyonunu çıkar — "function profileAssessmentCardHTML()" ile başlar
// ve bir sonraki "function motivationEntries()" veya "// ---- Motivasyon" satırına kadar
var paFnStart = html.indexOf('function profileAssessmentCardHTML()');
if (paFnStart < 0) { console.error('profileAssessmentCardHTML bulunamadı'); process.exit(1); }
// Fonksiyon sonu: bir sonraki function tanımı veya yorum satırı
var paFnEnd = html.indexOf('\n// ---- Motivasyon V2.1', paFnStart);
if (paFnEnd < 0) paFnEnd = html.indexOf('function motivationEntries', paFnStart);
if (paFnEnd < 0) { console.error('profileAssessmentCardHTML sonu bulunamadı'); process.exit(1); }
var paFn = html.substring(paFnStart, paFnEnd).trim();
// Fonksiyon tanımı kapanışını bul (} ile bitmeli)
var lastBrace = paFn.lastIndexOf('}');
paFn = paFn.substring(0, lastBrace + 1);

// Mock ortam kur ve fonksiyonları eval et
global.window = { toggleCard: function(){} };
global.document = { querySelector: function(){return null;}, getElementById: function(){return {innerHTML:''};} };
global.localStorage = { getItem: function(){return null;}, setItem: function(){} };
var mockCode = [
  monthTRMatch ? monthTRMatch[0] : 'var MONTH_TR=["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];',
  dowTRMatch ? dowTRMatch[0] : 'var DOW_TR=["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"];',
  iconsMatch[0],
  iconFnMatch[0],
  escFnMatch[0],
  fmtTRMatch[0],
  'var UI={expandedCards:{},motivationFilter:"all"};',
  'function toggleCard(key){}',
  'window.toggleCard=toggleCard;',
  cardWrapMatch[0],
  paFn
].join('\n\n');

// D global mock
var D = null;

// eval mock scope'ta çalışsın
try {
  eval(mockCode);
} catch(e) {
  console.error('Mock JS yüklenemedi:', e.message);
  process.exit(1);
}

if (typeof profileAssessmentCardHTML !== 'function') {
  console.error('profileAssessmentCardHTML eval edilemedi');
  process.exit(1);
}

// ── Test yardımcıları ────────────────────────────────────────────────────────
var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name + (detail ? ' — '+detail : '')); }
}
function iso(ts){ return new Date(ts).toISOString(); }
function makePA(overrides){
  var base = {
    schemaVersion:2, instrumentVersion:'1.0.0', deliveryMode:'single_session',
    status:'not_started', startedAt:null, completedAt:null, currentItemIndex:0,
    consent:{version:'1.0.0',informationShownAt:iso(1000),acceptedAt:iso(2000),
      profileProcessingAccepted:true,sensitiveDataAccepted:true,panelSummarySharingAccepted:false},
    responses:{}, moduleProgress:{}, scores:{}, quality:{}, report:{}, panelSummary:{}
  };
  if (overrides) for (var k in overrides) base[k] = overrides[k];
  return base;
}
function completedPA(){
  return makePA({
    status:'completed',
    completedAt:'2026-07-10T12:00:00.000Z',
    consent:{ panelSummarySharingAccepted:true },
    panelSummary:{
      confidenceScore:78,
      confidenceCategory:'good',
      bigFive:{ conscientiousness:{mean:5.2,band:'high'}, extraversion:{mean:3.1,band:'moderate'} },
      riasec:{ topThree:['social','artistic','investigative'] },
      values:{ topThree:['özerklik','başarı','iyilikseverlik'] },
      attachment:{ anxiety:3.5, avoidance:4.2 },
      shortReport:'Kısa karakter özeti metni burada.'
    }
  });
}

console.log('\n=== Faz 11 — Panel Özet Entegrasyonu Testleri ===\n');

// ── Test 1: paylaşım kapalı ─────────────────────────────────────────────────
console.log('[1] Paylaşım kapalı');
(function(){
  D = { profileAssessment: makePA({ status:'completed', completedAt:'2026-07-10T12:00:00.000Z',
    consent:{ panelSummarySharingAccepted:false } }) };
  var h = profileAssessmentCardHTML();
  ok('kart render oldu', h.indexOf('profileAssessment') >= 0);
  ok('paylaşım kapalı mesajı var', h.indexOf('paylaşılmıyor') >= 0);
  ok('detaylı özet gösterilmedi', h.indexOf('Big Five') < 0);
  ok('RAISEC detayı gösterilmedi', h.indexOf('RAISEC İlgi') < 0);
})();

// ── Test 2: paylaşım açık ───────────────────────────────────────────────────
console.log('[2] Paylaşım açık — özet gösterilir');
(function(){
  D = { profileAssessment: completedPA() };
  var h = profileAssessmentCardHTML();
  ok('tamamlanma tarihi var', h.indexOf('Tamamlandı') >= 0);
  ok('güven skoru var', h.indexOf('78') >= 0 || h.indexOf('Ölçüm Güveni') >= 0);
  ok('Big Five başlığı var', h.indexOf('Big Five') >= 0);
  ok('RAISEC başlığı var', h.indexOf('RAISEC') >= 0);
  ok('değer öncelikleri var', h.indexOf('Değer Öncelikleri') >= 0);
  ok('bağlanma başlığı var', h.indexOf('Bağlanma') >= 0);
  ok('kısa rapor var', h.indexOf('Kısa Karakter Özeti') >= 0);
  ok('sınırlamalar notu var', h.indexOf('klinik tanı değildir') >= 0);
})();

// ── Test 3: tamamlanmamış profil ────────────────────────────────────────────
console.log('[3] Tamamlanmamış profil — kesin yorum yok');
(function(){
  D = { profileAssessment: makePA({ status:'active', currentItemIndex:45,
    consent:{ panelSummarySharingAccepted:true } }) };
  var h = profileAssessmentCardHTML();
  ok('devam ediyor mesajı var', h.indexOf('Devam ediyor') >= 0 || h.indexOf('tamamlanmadan') >= 0);
  ok('kesin yorum gösterilmedi', h.indexOf('Big Five') < 0);
  ok('RAISEC detayı gösterilmedi', h.indexOf('RAISEC İlgi') < 0);
  ok('kısa rapor yok', h.indexOf('Kısa Karakter Özeti') < 0);
})();

// ── Test 4: tamamlanmış profil ──────────────────────────────────────────────
console.log('[4] Tamamlanmış profil — tam özet');
(function(){
  D = { profileAssessment: completedPA() };
  var h = profileAssessmentCardHTML();
  ok('tamamlanma tarihi gösterilir', h.indexOf('Tamamlandı') >= 0);
  ok('güven kategori chip var', h.indexOf('good') >= 0 || h.indexOf('Ölçüm Güveni') >= 0);
  ok('Big Five değerleri var (5.2/7)', h.indexOf('5.2') >= 0);
  ok('RAISEC top three var (Sosyal)', h.indexOf('Sosyal') >= 0);
  ok('değerler var (özerklik)', h.indexOf('özerklik') >= 0);
  ok('bağlanma kaygısı var (3.5/7)', h.indexOf('3.5') >= 0);
})();

// ── Test 5: eski kullanıcıda alan yok ───────────────────────────────────────
console.log('[5] Eski kullanıcıda alan yok — güvenli boş durum');
(function(){
  D = {};
  var h = profileAssessmentCardHTML();
  ok('boş durum mesajı var', h.indexOf('henüz') >= 0 || h.indexOf('Henüz') >= 0 || h.indexOf('başlanmadı') >= 0);
  ok('hata üretmedi (cardWrap döndü)', h.indexOf('card') >= 0 || h.indexOf('Bilimsel') >= 0);
  ok('Big Five SONUÇ bölümü gösterilmedi (sadece açıklama metni)', h.indexOf('Big Five Alanları') < 0);
})();

// ── Test 6: hassas ham cevapların DOMa gelmemesi ────────────────────────────
console.log('[6] Hassas ham cevaplar DOMa gelmez');
(function(){
  var pa = completedPA();
  pa.responses = {
    'rel_01': { value:5, scoredValue:5, answeredAt:'2026-07-10T10:00:00.000Z' },
    'rel_02': { value:3, scoredValue:3, answeredAt:'2026-07-10T10:01:00.000Z' }
  };
  D = { profileAssessment: pa };
  var h = profileAssessmentCardHTML();
  ok('ham rel_01 cevabı DOMda yok', h.indexOf('rel_01') < 0);
  ok('ham rel_02 cevabı DOMda yok', h.indexOf('rel_02') < 0);
  ok('value:5 ham cevap yok', h.indexOf('"value":5') < 0);
  ok('panelSummary özeti var (ham veri değil)', h.indexOf('Big Five') >= 0);
})();

// ── Test 7: eksik score alanları ────────────────────────────────────────────
console.log('[7] Eksik score alanları — hata vermez, güvenli boş');
(function(){
  var pa = makePA({ status:'completed', completedAt:'2026-07-10T12:00:00.000Z',
    consent:{ panelSummarySharingAccepted:true },
    panelSummary:{}, scores:{}, quality:{}, report:{} });
  D = { profileAssessment: pa };
  var threw = false, h;
  try { h = profileAssessmentCardHTML(); } catch(e){ threw = true; }
  ok('hata fırlatmadı', !threw);
  ok('kart render oldu', h && h.indexOf('Bilimsel') >= 0);
  ok('tamamlanma tarihi var', h && h.indexOf('Tamamlandı') >= 0);
  ok('sınırlamalar notu yine de var', h && h.indexOf('klinik tanı değildir') >= 0);
})();

// ── Test 8: panelSummary yok ama scores/report var (fallback) ───────────────
console.log('[8] panelSummary yok — scores/report fallback');
(function(){
  var pa = makePA({ status:'completed', completedAt:'2026-07-10T12:00:00.000Z',
    consent:{ panelSummarySharingAccepted:true },
    panelSummary:{},
    quality:{ score:65, category:'mid' },
    report:{ sections:{ characterSummary:{ body:'Fallback karakter özeti.' } } }
  });
  D = { profileAssessment: pa };
  var h = profileAssessmentCardHTML();
  ok('quality fallback güven skoru var', h.indexOf('65') >= 0);
  ok('report fallback kısa özet var', h.indexOf('Fallback karakter özeti') >= 0);
})();

// ── Özet ────────────────────────────────────────────────────────────────────
console.log('\n=== Özet: '+passed+' geçti, '+failed+' kaldı ===');
if (failed > 0) process.exit(1);