#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=require('../repo-root');
const source=fs.readFileSync(path.join(root,'app/core/saygi.js'),'utf8');
const quranSource=fs.readFileSync(path.join(root,'app/content/quranStrikingVersesV1.js'),'utf8');
const css=fs.readFileSync(path.join(root,'app/styles.css'),'utf8');
let passed=0;
function test(name,fn){try{fn();passed++;console.log('PASS  '+name);}catch(e){console.error('FAIL  '+name+' — '+e.message);process.exitCode=1;}}
const sandbox={console,Date,Math,JSON,Object,Array,String,Number,Boolean,RegExp,Error,Promise,Set,Map,Intl,URL,URLSearchParams,encodeURIComponent,decodeURIComponent,isFinite,isNaN,document:{}};
sandbox.window=sandbox;sandbox.self=sandbox;sandbox.globalThis=sandbox;
vm.runInContext(source,vm.createContext(sandbox),{filename:'saygi.js'});
const r=sandbox.SeymaSaygi;
const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
assert.equal(r.registerSaygi({data:()=>({}),ui:()=>({faithTab:'oz'}),getDay:()=>({}),todayStr:()=> '2026-09-21',addDays:()=>'',diffDays:()=>0,dayIndexFor:()=>0,dateLabelTR:v=>v,icon:n=>'<i>'+esc(n)+'</i>',esc,featuresLive:()=>true,render:()=>{},quranJourneyHubCardHTML:()=>'',zikrVisible:()=>false,zikrPreviewCardHTML:()=>''}),true);
const verse={id:'x',surahNameTr:'Çok Uzun & <Sûre>',ayetNo:'1-200',arabic:'رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا',transliterationTr:'Rabbenâ lâ tüâhiznâ in nesînâ ev ahta’nâ.',meal:'Meal <güvenli>',themeTr:'Dua · Sabır',verified:true,verifiedAt:'2026-08-01'};
const catalog={byId:()=>verse};
const html=r.iip17ReaderHTML('2026-09-21',catalog);
let visualSpirit='';
test('Arapça RTL ve hareke korunur',()=>{assert.match(html,/lang="ar" dir="rtl"/);assert.ok(html.includes(verse.arabic));assert.match(css,/letter-spacing:normal/);});
test('okunuş ve meal ayrı başlıklardır',()=>{assert.match(html,/>Okunuş</);assert.match(html,/>Diyanet meali</);assert.ok(!html.includes('Meal <güvenli>'));assert.ok(html.includes('Meal &lt;güvenli&gt;'));});
test('editoryal tefekkür dinî metinden ayrı ve açık etiketlidir',()=>{assert.match(html,/<aside class="iip17-reflection"/);assert.match(html,/EDİTORYAL · TEFSİR DEĞİLDİR/);assert.match(html,/Tematik izler/);});
test('temalar ve gerçek derinleşme eylemi ayrıdır',()=>{assert.match(html,/>Dua</);assert.match(html,/>Sabır</);assert.equal((html.match(/iip17-theme-chip/g)||[]).length,2);assert.match(html,/<button type="button" class="iip17-deepen"/);assert.match(html,/App\.openQuranJourney\(\)/);});
test('temel atıf ayrıntı açılmadan görünür',()=>{assert.match(html,/iip17-attribution/);assert.match(html,/Diyanet İşleri Başkanlığı/);assert.match(html,/<details class="iip17-source">/);assert.match(html,/yeni sekmede aç/);});
test('uzun referans kaçışlı ve taşmaya dayanıklı',()=>{assert.ok(html.includes('Çok Uzun &amp; &lt;Sûre&gt; 1-200'));assert.match(css,/overflow-wrap:anywhere/);});
test('font fallback zinciri vardır',()=>{assert.match(css,/Noto Naskh Arabic/);assert.match(css,/Geeza Pro/);assert.match(css,/serif/);});
test('katalog yüklenmezse ana yüzey güvenli hata verir',()=>{const out=r.iip17ReaderHTML('2026-09-21',null);assert.match(out,/Kaynaklı seçki şu anda yüklenemedi/);assert.match(out,/Ana İlham &amp; İbadet araçları/);assert.ok(!out.includes('<details'));});
test('doğrulanmamış kayıt gösterilmez',()=>{const out=r.iip17ReaderHTML('2026-09-21',{byId:()=>({...verse,verified:false})});assert.match(out,/Bugünün doğrulanmış metni bulunamadı/);assert.ok(!out.includes(verse.arabic));});
test('onaylı Latin harfli okunuş ayrı alanda gösterilir',()=>{assert.match(html,/Rabbenâ lâ tüâhiznâ in nesînâ ev ahta’nâ/);});
test('okunuşu olmayan kayıt güvenli boş durum gösterir',()=>{const out=r.iip17ReaderHTML('2026-09-21',{byId:()=>({...verse,transliterationTr:null})});assert.match(out,/onaylı Latin harfli okunuş bulunmuyor/);});
test('otomatik doğrulandı rozeti üretilmez',()=>{assert.ok(!html.includes('iip17-verified'));assert.ok(!html.includes('İnsan doğrulamalı'));assert.match(html,/ÂYET · DUA/);});
test('manevi özet emojisiz, yapılandırılmış vakit ve ay döngüsü sunar',()=>{sandbox.HijriCalendarV1={hijriFrom:()=>({day:12,monthName:'Rebiülevvel',year:1448}),holyDay:()=>''};visualSpirit=r.spiritBarHTML();assert.match(visualSpirit,/SIRADAKİ VAKİT/);assert.match(visualSpirit,/HİCRÎ TARİH/);assert.match(visualSpirit,/12 Rebiülevvel 1448/);assert.match(visualSpirit,/İlk dördün sonrası/);assert.ok(!/[🌙☽☾🌒🌓🌔🌕🌖🌗🌘]/u.test(visualSpirit));});
test('12 pilot kaydın tamamında alan sahibi onaylı okunuş vardır',()=>{const contentSandbox={window:{},Object};vm.runInNewContext(quranSource,contentSandbox,{filename:'quranStrikingVersesV1.js'});const ids=['bakara-255','ihlas-1','fatiha-5','fatiha-6-7','bakara-286','bakara-153','bakara-186','bakara-152','kehf-10','taha-25','taha-114','yusuf-87'];for(const id of ids){const item=contentSandbox.window.QuranStrikingVersesV1.byId(id);assert.ok(item.transliterationTr,id);assert.equal(item.transliterationVerifiedAt,'2026-09-22');assert.equal(item.transliterationReviewer,'user-domain-owner');}assert.equal(contentSandbox.window.QuranStrikingVersesV1.catalogVersion,'quran-striking-verses-tr-v2');});
if(process.exitCode)process.exit(1);
if(process.argv.includes('--render')){
  const artifact='<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>IIP-17 render matrisi</title><link rel="stylesheet" href="../../../app/styles.css"><style>body{margin:0;padding:24px;background:#d9dce8;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.matrix{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px}.shot{max-width:430px;margin:auto;border-radius:32px;overflow:hidden;box-shadow:0 22px 70px rgba(20,24,40,.24)}.shot>header{padding:12px 18px;background:#202942;color:#fff;font-weight:800}.shot #root{padding:16px;display:grid;gap:14px;min-height:900px;background:var(--bg);color:var(--text)}@media(max-width:520px){body{padding:8px}.matrix{grid-template-columns:1fr;gap:12px}}</style></head><body><main class="matrix"><section class="shot"><header>Açık tema · 375 px</header><div id="root" data-theme="light">'+visualSpirit+html+'</div></section><section class="shot"><header>Koyu tema · 430 px</header><div id="root" data-theme="dark">'+visualSpirit+html+'</div></section></main></body></html>';
  const out=path.join(root,'archive/ilham-ibadet-premium-plan/evidence/IIP-17/render-matrix.html');
  fs.writeFileSync(out,artifact);
  console.log('RENDER '+out);
}
console.log('PASS: IIP-17 '+passed+'/14');
