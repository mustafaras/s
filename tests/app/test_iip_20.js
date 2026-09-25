#!/usr/bin/env node
// IIP-20 — bookmarks/reader persistence, conflict safety and panel redaction.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const repoRoot=require('../repo-root');
let passed=0;
function ok(name,condition){ if(!condition) throw new Error(name); passed++; console.log('PASS  '+name); }

// Migration is exercised with a complete synthetic dependency bag; no DOM,
// localStorage, network or real user data is involved.
const stateSrc=fs.readFileSync(path.join(repoRoot,'app/core/state.js'),'utf8');
const stateSandbox={window:{},console,Date,Math,JSON,Object,Array,String,Number,Boolean,RegExp,Error,Promise,isFinite,isNaN};
stateSandbox.window=stateSandbox; vm.runInNewContext(stateSrc,stateSandbox,{filename:'app/core/state.js'});
const names=['migrateReminderState','normalizeSyncReceipt','ensureEventLog','emptyZikrRoot','migrateZikrV2','ensureSaygiDay','emptySaygiRoot','ensureQuranJourney','ensureQuranLearn','emptyLibrary','normBook','emptyWatchlist','normTitle','emptyMusic','normTrack','emptySoulArchive','normSoulItem','backfillArchivesFromDays','todayStr','syncDerivedHabits','ensureProfileAssessment','dailyPhotoCopy','ensureTherapyAllDays','ensurePrayerDay'];
const deps={caffeineDefaultBed:'23:00'}; names.forEach(n=>deps[n]=function(x){return x;});
deps.normalizeSyncReceipt=()=>({schemaVersion:1,status:'idle'}); deps.emptyZikrRoot=()=>({}); deps.emptySaygiRoot=()=>({collection:{},streak:0,lastReadDate:''}); deps.emptyLibrary=()=>({books:[],goal:{}}); deps.emptyWatchlist=()=>({items:[],goal:{}}); deps.emptyMusic=()=>({items:[],goal:{}}); deps.emptySoulArchive=()=>({items:[]}); deps.todayStr=()=> '2026-09-22';
ok('state migration dependency bag kaydolur',stateSandbox.SeymaState.registerMigrate(deps)===true);
const old={version:2,settings:{},days:{},eventLog:{sourceDeviceId:'fixture'}};
const once=stateSandbox.SeymaState.migrate(old); const snapshot=JSON.stringify(once); const twice=stateSandbox.SeymaState.migrate(once);
ok('eski veri bookmarks/reader/programs namespace eklenir',once.bookmarks&&once.reader&&once.programs);
ok('reader preference güvenli varsayılanı vardır',once.reader.preferences.scaleIndex===0&&once.reader.preferences.direction==='auto');
ok('migration ikinci çalışmada idempotenttir',JSON.stringify(twice)===snapshot);
once.reader.positions['saygi:old']={contentId:'saygi:old',revision:'v1',blockId:'p-99',writeRevision:2,ratio:0,updatedAt:'2026-09-22T00:00:00.000Z'};
stateSandbox.SeymaState.migrate(once);
ok('position content revision ve block kimliği korunur',once.reader.positions['saygi:old'].revision==='v1'&&once.reader.positions['saygi:old'].blockId==='p-99');

// Sync merge: higher monotonic revision wins, tombstone is not resurrected,
// and an old client that omits the namespace cannot erase local data.
global.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
global.window={addEventListener:()=>{},SeySync:null}; global.document={getElementById:()=>null}; global.location={protocol:'https:',hostname:'example.com',search:''}; global.fetch=()=>Promise.reject(new Error('network forbidden'));
eval(fs.readFileSync(path.join(repoRoot,'sync.js'),'utf8'));
const sync=global.window.SeySync;
const mergedB=sync.mergeIip20Bookmarks({schemaVersion:1,items:[{bookmarkId:'b1',contentId:'c1',revision:2,tombstone:false,updatedAt:'2026-09-22T01:00:00.000Z',deviceId:'a'}]}, {schemaVersion:1,items:[{bookmarkId:'b1',contentId:'c1',revision:3,tombstone:true,deletedAt:'2026-09-22T02:00:00.000Z',updatedAt:'2026-09-22T02:00:00.000Z',deviceId:'b'}]});
ok('bookmark tombstone yüksek revision ile kazanır',mergedB.items[0].tombstone===true&&mergedB.items[0].revision===3);
const mergedR=sync.mergeIip20Reader({schemaVersion:1,preferences:{scaleIndex:1,revision:1,updatedAt:'2026-09-22T01:00:00.000Z'},positions:{c1:{contentId:'c1',revision:'v1',blockId:'p-1',writeRevision:1}}},{schemaVersion:1,preferences:{scaleIndex:3,revision:2,updatedAt:'2026-09-22T02:00:00.000Z'},positions:{c1:{contentId:'c1',revision:'v2',blockId:'p-1',writeRevision:2}}});
ok('reader preference ve position monotonik birleşir',mergedR.preferences.scaleIndex===3&&mergedR.positions.c1.revision==='v2');
const preserved=sync.mergeData({bookmarks:{schemaVersion:1,items:[{bookmarkId:'keep',revision:1}]},reader:{schemaVersion:1,preferences:{scaleIndex:2,revision:1},positions:{}},programs:{schemaVersion:1,items:{p:{revision:1}}}}, {version:2,settings:{}});
ok('eski istemci namespace bilmeden yazınca yerel veri korunur',preserved.bookmarks.items.some(x=>x.bookmarkId==='keep')&&preserved.reader.preferences.scaleIndex===2);

// Panel projection is fail-closed for raw personal bookmarks/positions.
const panelSandbox={window:{},Date,Math,JSON,Object,Array,String,Number,Boolean,RegExp,Error,Promise,isFinite,isNaN}; panelSandbox.window=panelSandbox; vm.runInNewContext(fs.readFileSync(path.join(repoRoot,'panel/panelCoverageManifest.js'),'utf8'),panelSandbox,{filename:'panel/panelCoverageManifest.js'});
const projection=panelSandbox.PanelCoverageV1.redactForObserver({bookmarks:{schemaVersion:1,items:[{bookmarkId:'private'}]},reader:{preferences:{scaleIndex:4},positions:{c1:{blockId:'p-9'}}},programs:{items:{p:{revision:2}}},savedAt:'2026-09-22T00:00:00.000Z'});
ok('panel ham bookmark/reader/program namespaceini redakte eder',projection.bookmarks===undefined&&projection.reader===undefined&&projection.programs===undefined);
ok('kaynakta visible bookmark ve persistent reader davranışı vardır',/saygiToggleBookmark|bookmarks/.test(fs.readFileSync(path.join(repoRoot,'app/core/saygi.js'),'utf8'))&&/reader\.preferences\.scaleIndex/.test(fs.readFileSync(path.join(repoRoot,'app.js'),'utf8')));
console.log('\nIIP-20: '+passed+' PASS');
