'use strict';
var fs=require('fs');
var path=require('path');
var vm=require('vm');
var repoRoot=require('./repo-root');
var src=fs.readFileSync(path.join(repoRoot,'quran-flow-demo.html'),'utf8');
var pass=0,fail=0;
function ok(v,label){if(v){pass++;console.log('  ✓ '+label);}else{fail++;console.error('  ✗ '+label);}}
console.log('=== Kur’an Yolculuğu güvenli demo denetimi ===');
ok(!/localStorage|sessionStorage|SeySync|api\.github\.com|fetch\s*\(|XMLHttpRequest/.test(src),'ağ, storage ve gerçek sync bağımlılığı yok');
ok(src.indexOf('GÜVENLİ DEMO')>=0&&src.indexOf('İzole önizleme')>=0,'demo niteliği görünür ve açık');
ok(/İstek[\s\S]*Mail[\s\S]*Cevap[\s\S]*Kullanıcı/.test(src),'dört aşamalı akış var');
ok(src.indexOf('[KURAN-REQ:qr_DEMO12345678:')>=0,'mail konusu requestId ve sahte demo tokenı gösteriyor');
ok(src.indexOf('yalnızca tek bir YouTube video bağlantısıyla')>=0,'mail tek-link talimatını gösteriyor');
ok(src.indexOf('requestId + reply token eşleşmesi')>=0&&src.indexOf('Doğru sûre: Müzzemmil')>=0,'cevap doğrulama sınırları görünür');
ok(src.indexOf('youtube-nocookie.com')>=0&&src.indexOf('click-to-load')>=0,'kullanıcı video güvenlik davranışı gösteriliyor');
var scripts=Array.from(src.matchAll(/<script>([\s\S]*?)<\/script>/g)).map(function(m){return m[1];});
ok(scripts.length===1,'tek inline demo scripti var');
try{new vm.Script(scripts[0],{filename:'quran-flow-demo.html'});ok(true,'inline JavaScript sözdizimi geçerli');}catch(e){ok(false,'inline JavaScript sözdizimi geçerli: '+e.message);}
console.log('\n'+(fail?'❌':'✅')+' '+pass+'/'+(pass+fail)+' geçti');
process.exit(fail?1:0);
