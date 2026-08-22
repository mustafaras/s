// PANEL — stalenessBadgeP fixture (Faz 2 / Prompt 2.1).
// Sentetik zaman damgaları; gerçek ağ, browser, token, localStorage yoktur.
'use strict';
var fs=require('fs'),path=require('path'),vm=require('vm');
var repoRoot=require('../repo-root');
var panelSource=fs.readFileSync(path.join(repoRoot,'panel/panel.js'),'utf8');
var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
function extractFunction(name){ var start=panelSource.indexOf('function '+name+'('); if(start<0) throw new Error(name+' bulunamadı'); var end=panelSource.indexOf('\nfunction ',start+10); return panelSource.slice(start,end<0?panelSource.length:end); }
function extractVar(name){ var re=new RegExp('var '+name+'\\s*=.*?;'); var m=panelSource.match(re); if(!m) throw new Error(name+' bulunamadı'); return m[0]; }
function esc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
var context={Date:Date,Math:Math,String:String,Number:Number,isNaN:isNaN,esc:esc};
vm.runInNewContext(extractVar('STALE_WARN_DAYS')+'\n'+extractFunction('stalenessBadgeP'),context,{filename:'panel-staleness-badge.js'});

console.log('\n=== PANEL — stalenessBadgeP fixture ===\n');
ok('veri yok (null) -> muted "Veri yok" rozeti',context.stalenessBadgeP(null).includes('status-muted')&&context.stalenessBadgeP(null).includes('Veri yok'));
ok('geçersiz tarih -> muted "Veri yok" rozeti',context.stalenessBadgeP('not-a-date').includes('status-muted'));
var nowIso=new Date().toISOString();
ok('şimdi (0 saat önce) -> ok "Güncel" rozeti',context.stalenessBadgeP(nowIso).includes('status-ok')&&context.stalenessBadgeP(nowIso).includes('Güncel'));
var twelveHoursAgo=new Date(Date.now()-12*3600000).toISOString();
ok('12 saat önce -> hâlâ ok "Güncel" rozeti (24 saat eşiği aşılmadı)',context.stalenessBadgeP(twelveHoursAgo).includes('status-ok'));
var threeDaysAgo=new Date(Date.now()-3*86400000).toISOString();
var threeDaysHtml=context.stalenessBadgeP(threeDaysAgo);
ok('3 gün önce -> warning "N gün önce" rozeti',threeDaysHtml.includes('status-warning')&&threeDaysHtml.includes('3 gün önce'));
var tenDaysAgo=new Date(Date.now()-10*86400000).toISOString();
var tenDaysHtml=context.stalenessBadgeP(tenDaysAgo);
ok('10 gün önce -> danger "Eski · N gün önce" rozeti',tenDaysHtml.includes('status-danger')&&tenDaysHtml.includes('Eski · 10 gün önce'));
ok('rozet çıktısı mevcut status-badge HTML sözleşmesini kullanır',tenDaysHtml.includes('class="badge status-badge')&&tenDaysHtml.includes('data-component="status-badge"'));

console.log('\nPANEL staleness badge fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
