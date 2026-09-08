// Premium FX gate varsayılanları — gerçek migrate() + gerçek FX modülleri.
//
// NEDEN VAR: mevcut premium fixture ailesi gate'i her testte kendisi enjekte
// ediyordu (`setSettings({premiumAtmosphere:true, ...})`), bu yüzden 249/249 PASS
// olmasına rağmen gerçek kullanıcı durumunda ses/titreşim/saat teması sessizdi:
// `settings.premiumAtmosphere` migrate() tarafından hiç yazılmıyordu, ayarlar
// kartı ise `!(x===false)` okuduğu için "Açık" gösteriyordu. Bu fixture spec
// kopyası değil, sevk edilen app/core/*.js gövdelerini çalıştırır.
//
// Çalıştırma: node tests/app/test_premium_fx_gate_defaults.js

'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var repoRoot = require('../repo-root');

var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name + (detail ? ' — '+detail : '')); }
}
function read(rel){ return fs.readFileSync(path.join(repoRoot, rel), 'utf8'); }

// ── 1) Gerçek migrate(): FX gate alanları dolduruluyor mu? ──────────────────
console.log('\n[1] migrate() FX gate alanlarını dolduruyor');

var MIGRATE_DEPS = [
  'migrateReminderState','normalizeSyncReceipt','ensureEventLog','emptyZikrRoot',
  'migrateZikrV2','ensureSaygiDay','emptySaygiRoot','ensureQuranJourney','emptyLibrary',
  'normBook','emptyWatchlist','normTitle','emptyMusic','normTrack','emptySoulArchive',
  'normSoulItem','backfillArchivesFromDays','todayStr','syncDerivedHabits',
  'ensureProfileAssessment','dailyPhotoCopy','ensureTherapyAllDays','ensurePrayerDay'
];

function bootState(){
  var sb = { console: console, Date: Date, Math: Math, JSON: JSON, isNaN: isNaN,
             Number: Number, String: String, Object: Object, Array: Array };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(read('app/core/state.js'), sb, { filename: 'app/core/state.js' });
  var deps = { caffeineDefaultBed: '23:00' };
  MIGRATE_DEPS.forEach(function(n){ deps[n] = function(x){ return x; }; });
  // Kök normalleştiricilerin nesne döndürmesi beklenir.
  ['emptyZikrRoot','emptySaygiRoot','emptyLibrary','emptyWatchlist','emptyMusic',
   'emptySoulArchive','normalizeSyncReceipt','ensureEventLog'].forEach(function(n){
    deps[n] = function(x){ return (x && typeof x === 'object') ? x : {}; };
  });
  deps.todayStr = function(){ return '2026-09-04'; };
  var registered = sb.window.SeymaState.registerMigrate(deps);
  return { sb: sb, registered: registered };
}

var st = bootState();
ok('migrate bağımlılıkları kaydedildi', st.registered === true);

var fresh = st.sb.window.SeymaState.migrate({});
ok('premiumAtmosphere === true  (master gate açık)', fresh.settings.premiumAtmosphere === true,
   'gerçek değer: ' + JSON.stringify(fresh.settings.premiumAtmosphere));
ok('uiSounds === true', fresh.settings.uiSounds === true,
   'gerçek değer: ' + JSON.stringify(fresh.settings.uiSounds));
ok('richHaptics === true', fresh.settings.richHaptics === true,
   'gerçek değer: ' + JSON.stringify(fresh.settings.richHaptics));

// FX2-26: kimlik ayarları varsayılan AÇIK (M8 daraltması) — launchRitual ve
// voiceLocalFallback artık true gelir. Tercih ayarları (voiceGuidance,
// ambientSounds) opt-in kalır — kendiliğinden ses çıkardıkları için false.
[['launchRitual','kimlik — varsayılan açık'],['voiceLocalFallback','kimlik — varsayılan açık']
].forEach(function(row){
  ok(row[0]+' === true ('+row[1]+')', fresh.settings[row[0]] === true,
     'gerçek değer: ' + JSON.stringify(fresh.settings[row[0]]));
});
[['voiceGuidance','opt-in'],['ambientSounds','opt-in']].forEach(function(row){
  ok(row[0]+' === false ('+row[1]+')', fresh.settings[row[0]] === false,
     'gerçek değer: ' + JSON.stringify(fresh.settings[row[0]]));
});
// D4 kullanıcı kararı: bulut TTS varsayılan AÇIK (voiceGuidance kapalıyken atıl).
ok('voiceCloudTts === true (FX kararı D4)', fresh.settings.voiceCloudTts === true,
   'gerçek değer: ' + JSON.stringify(fresh.settings.voiceCloudTts));

// ── 2) Kullanıcının bilinçli kapatma tercihi korunuyor mu? ──────────────────
console.log('\n[2] Kullanıcı tercihi migrate() tarafından ezilmiyor');
var optedOut = st.sb.window.SeymaState.migrate({ settings: { premiumAtmosphere: false, uiSounds: false } });
ok('premiumAtmosphere:false korundu', optedOut.settings.premiumAtmosphere === false);
ok('uiSounds:false korundu', optedOut.settings.uiSounds === false);
var idem = st.sb.window.SeymaState.migrate(st.sb.window.SeymaState.migrate({}));
ok('migrate idempotent (iki geçiş aynı gate)', idem.settings.premiumAtmosphere === true &&
   idem.settings.voiceCloudTts === true && idem.settings.voiceGuidance === false);

// ── 3) Uçtan uca: bu varsayılanlarla gerçek FX modülleri çalışıyor mu? ──────
console.log('\n[3] Gerçek mediaFx/timeTheme bu varsayılanlarla ses/titreşim/tema üretiyor');

function bootFx(settings){
  var osc = 0, vibes = [], classes = [];
  var root = { id: 'root', classList: {
    add: function(){ for(var i=0;i<arguments.length;i++){ if(classes.indexOf(arguments[i])<0) classes.push(arguments[i]); } },
    remove: function(){ for(var i=0;i<arguments.length;i++){ var j=classes.indexOf(arguments[i]); if(j>=0) classes.splice(j,1); } },
    contains: function(c){ return classes.indexOf(c) >= 0; } } };
  var sb = { console: console, Date: Date, Math: Math, Number: Number, String: String,
             isNaN: isNaN, setTimeout: function(){ return 0; }, clearTimeout: function(){},
             navigator: { vibrate: function(p){ vibes.push(p); return true; } },
             document: { getElementById: function(id){ return id === 'root' ? root : null; },
                         createElement: function(){ return { style:{}, classList:{add:function(){},remove:function(){}},
                           appendChild:function(){}, remove:function(){} }; },
                         body: { appendChild: function(){} } },
             matchMedia: function(){ return { matches: false }; } };
  sb.window = sb;
  sb.AudioContext = function(){ return {
    createOscillator: function(){ osc++; return { connect:function(){}, start:function(){}, stop:function(){},
      frequency:{ setValueAtTime:function(){} }, type:'' }; },
    createGain: function(){ return { connect:function(){}, gain:{ setValueAtTime:function(){},
      exponentialRampToValueAtTime:function(){}, linearRampToValueAtTime:function(){} } }; },
    destination: {}, currentTime: 0, state: 'running', resume: function(){} }; };
  vm.createContext(sb);
  vm.runInContext(read('app/core/mediaFx.js'), sb, { filename: 'app/core/mediaFx.js' });
  vm.runInContext(read('app/core/timeTheme.js'), sb, { filename: 'app/core/timeTheme.js' });
  sb.window.SeymaState = { data: { settings: settings } };
  try { sb.window.SeyAudio.tap(); } catch(e){}
  try { sb.window.SeyHaptics.tap(); } catch(e){}
  try { sb.window.SeyTimeTheme.apply(); } catch(e){}
  try { sb.window.SeyTimeTheme.applySeasonal(); } catch(e){}
  return { osc: osc, vibes: vibes, classes: classes };
}

var live = bootFx(fresh.settings);
ok('SeyAudio.tap() ses üretti', live.osc > 0, 'oscillator: ' + live.osc);
ok('SeyHaptics.tap() titreşim tetikledi', live.vibes.length > 0, 'vibrate: ' + live.vibes.length);
ok('SeyTimeTheme.apply() saat sınıfı ekledi',
   live.classes.some(function(c){ return c.indexOf('theme-time-') === 0; }),
   'sınıflar: ' + JSON.stringify(live.classes));
ok('SeyTimeTheme.applySeasonal() mevsim sınıfı ekledi',
   live.classes.some(function(c){ return c.indexOf('theme-season-') === 0; }),
   'sınıflar: ' + JSON.stringify(live.classes));

var muted = bootFx(optedOut.settings);
ok('kullanıcı kapattığında ses yok', muted.osc === 0);
ok('kullanıcı kapattığında titreşim yok', muted.vibes.length === 0);
ok('kullanıcı kapattığında tema sınıfı yok', muted.classes.length === 0,
   'sınıflar: ' + JSON.stringify(muted.classes));

// ── 4) applySeasonal gerçekten app.js'ten çağrılıyor mu? (ölü CSS koruması) ──
console.log('\n[4] app.js ↔ styles.css bağlantısı');
var appSrc = read('app.js');
var cssSrc = read('app/styles.css');
ok('app.js SeyTimeTheme.applySeasonal() çağırıyor',
   /SeyTimeTheme\.applySeasonal\(\)/.test(appSrc));
ok('styles.css theme-season-* kuralları tanımlı', /#root\.theme-season-/.test(cssSrc));

// ── 5) Master anahtar idempotent mi? (gerçek App.toggleSetting gövdesi) ─────
console.log('\n[5] App.toggleSetting segmentli çift için idempotent');
var m = appSrc.match(/App\.toggleSetting=function\(key,value\)\{[\s\S]*?\n\};/);
ok('toggleSetting gövdesi app.js\'ten çıkarıldı', !!m);
if (m){
  var tsb = { console: console };
  tsb.window = tsb;
  tsb.App = {};
  tsb.data = { settings: {} };
  tsb.save = function(){};
  tsb.render = function(){};
  vm.createContext(tsb);
  vm.runInContext(m[0], tsb, { filename: 'app.js#toggleSetting' });

  tsb.App.toggleSetting('premiumAtmosphere', false);
  var afterFirstOff = tsb.data.settings.premiumAtmosphere;
  tsb.App.toggleSetting('premiumAtmosphere', false);
  ok('"Kapalı"ya iki kez basmak kapalı bırakır',
     afterFirstOff === false && tsb.data.settings.premiumAtmosphere === false,
     'değerler: ' + afterFirstOff + ' → ' + tsb.data.settings.premiumAtmosphere);

  tsb.App.toggleSetting('premiumAtmosphere', true);
  tsb.App.toggleSetting('premiumAtmosphere', true);
  ok('"Açık"a iki kez basmak açık bırakır', tsb.data.settings.premiumAtmosphere === true);

  tsb.data.settings.uiSounds = true;
  tsb.App.toggleSetting('uiSounds');
  var flipped = tsb.data.settings.uiSounds;
  tsb.App.toggleSetting('uiSounds');
  ok('değer verilmeyen tek düğmeli satır hâlâ çeviriyor',
     flipped === false && tsb.data.settings.uiSounds === true);

  tsb.App.toggleSetting('ghToken', true);
  ok('whitelist dışı anahtar reddediliyor', tsb.data.settings.ghToken === undefined);
}

console.log('\n' + (failed === 0 ? 'PASS' : 'FAIL') + ' — ' + passed + ' geçti, ' + failed + ' kaldı');
process.exit(failed === 0 ? 0 : 1);
