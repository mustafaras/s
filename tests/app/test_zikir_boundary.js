'use strict';

// MON-20/21 · SeymaZikr motor + görünüm registry sınırı.
// Yalnız sentetik root ve resolverlar kullanır; browser, gerçek localStorage,
// ağ veya seyma-data yazımı yoktur.

var fs=require('fs');
var path=require('path');
var vm=require('vm');
var repoRoot=require('../repo-root');
var source=fs.readFileSync(path.join(repoRoot,'app/core/zikir.js'),'utf8');
var appSource=fs.readFileSync(path.join(repoRoot,'app.js'),'utf8');
var passed=0,failed=0;
function ok(name,condition,detail){
  if(condition){ passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name+(detail?' — '+detail:'')); }
}

console.log('\n=== MON-20 — SeymaZikr motor boundary ===\n');

var loadCalls={storage:0,fetch:0,timer:0};
var tapCalls=0,saveCalls=0;
var sandbox={
  console:console, Date:Date, Math:Math, JSON:JSON, Object:Object, Array:Array,
  String:String, Number:Number, Boolean:Boolean, RegExp:RegExp, Error:Error,
  Promise:Promise, isNaN:isNaN, isFinite:isFinite, window:null,
  SeyAudio:{tap:function(){ tapCalls++; }},
  localStorage:{getItem:function(){ loadCalls.storage++; return null; },setItem:function(){ loadCalls.storage++; }},
  fetch:function(){ loadCalls.fetch++; return Promise.reject(new Error('MON-20 network')); },
  setTimeout:function(){ loadCalls.timer++; return 1; },
  clearTimeout:function(){ loadCalls.timer++; }
};
sandbox.window=sandbox;
vm.runInNewContext(source,sandbox,{filename:'app/core/zikir.js'});
var z=sandbox.SeymaZikr;

ok('SeymaZikr load-safe registry expose edildi',!!z&&typeof z==='object');
ok('modül yüklemede storage/fetch/timer açılmadı',loadCalls.storage===0&&loadCalls.fetch===0&&loadCalls.timer===0);
ok('modül root data rebind etmiyor',!/^[ \t]*(?:var[ \t]+)?data[ \t]*=/m.test(source));
ok('modül DOM/ağ/timer sahibi değil',source.indexOf('document')<0&&source.indexOf('fetch(')<0&&source.indexOf('setTimeout(')<0);
ok('eksik resolver bag fail-closed reddediliyor',z.registerZikr({})===false);
ok('seed kardinalitesi ve preset kimlikleri korunuyor',z.ZIKR_SEED.length===5&&z.ZIKR_SEED.map(function(p){return p.id;}).join(',')==='subhanallah,elhamdulillah,allahu_ekber,la_ilaha_illallah,estagfirullah');
ok('tap FX guardı modülde korunuyor',/if\(window\.SeyAudio && typeof window\.SeyAudio\.tap === 'function'\)/.test(source));

var current={startDate:'2026-09-04',days:{}};
var deps={
  data:function(){ return current; },
  getDay:function(root,date){ return root.days[date]||(root.days[date]={}); },
  todayStr:function(){ return '2026-09-04'; },
  addDays:function(s,n){ return n<0?'2026-09-03':'2026-09-04'; },
  dayIndexFor:function(){ return 0; },
  save:function(){ saveCalls++; }
};
ok('tam resolver bag tek kez kaydediliyor',z.registerZikr(deps)===true&&z.registerZikr(deps)===false);
var root=z.ensureZikrRoot(current);
ok('ensureZikrRoot canlı roota beş çekirdek seed kuruyor',root===current.zikr&&root.presets.length===5&&root.settings.activePresetId==='subhanallah');
var p=z.zikrActivePreset();
var before=z.zikrMath(p,0), result=z.zikrTouchTick();
ok('zikrTouchTick hedef/sayaç/oturum eşdeğerini koruyor',result&&result.count===1&&result.total===1&&result.journey.lifetimeCount===1&&result.sessionStarted===true&&z.zikrSessionState(p)==='active');
ok('gün aynası getDay resolverından geçiyor',current.days['2026-09-04'].zikr&&current.days['2026-09-04'].zikr.totalCount===1&&z.zikrMath(p,0).baseTarget===before.baseTarget);
root.settings.soundOn=false; z.zikrTickSound();
root.settings.soundOn=true; z.zikrTickSound();
ok('SeyAudio.tap yalnız soundOn guardı geçince bir kez çağrılıyor',tapCalls===1);
z.zikrPauseSession();
ok('pause motoru aktif oturumu duraklatıyor',!!root.activeSession&&typeof root.activeSession.pausedAt==='string');

var appTap=appSource.slice(appSource.indexOf('App.zikrTap=function'),appSource.indexOf('App.zikrUndo=function'));
ok('guide başlangıç/tamamlanma/yarı-hedef çağrıları app-owned kabukta',appTap.indexOf('guides.zikirStart')>=0&&appTap.indexOf('guides.zikirComplete')>=0&&appTap.indexOf('guides.zikirHalf')>=0);
ok('streak haptic ve bell çağrıları app-owned kabukta',appTap.indexOf('SeyHaptics.streak')>=0&&appTap.indexOf('SeyAudio.bell')>=0);
ok('view gövdeleri registryde, overlay/paint kabuğu app-owned',
  typeof z.zikrCounterViewHTML==='function'&&typeof z.zikrPresetsViewHTML==='function'&&
  typeof z.zikrHatimsViewHTML==='function'&&typeof z.zikrHistoryViewHTML==='function'&&
  typeof z.zikrSettingsViewHTML==='function'&&
  /function zikrHistoryViewHTML\(z\)\{ return window\.SeymaZikr\.zikrHistoryViewHTML\.apply\(null,arguments\); \}/.test(appSource)&&
  /function zikrSettingsViewHTML\(z\)\{ return window\.SeymaZikr\.zikrSettingsViewHTML\.apply\(null,arguments\); \}/.test(appSource)&&
  /function zikroverlayHTML\(/.test(appSource)&&/function zikrPaintView\(/.test(appSource));
ok('motor save resolverı explicit manual çağrıda çalışıyor',!!z.zikrManualApply('subhanallah',2,'2026-09-04','boundary')&&saveCalls===1);

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
if(failed) process.exitCode=1;
