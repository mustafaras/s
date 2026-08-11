// QY-22 — Panel 1 / Panel v2 canonical Kur'an state parity contract.
// Static contract fixture: iki panelin de aynı latest.json root kaydını
// (data.quranJourney) requestId/status/provenance/timestamp alanlarıyla
// göstermesini denetler; ağ, token ve gerçek kullanıcı verisi yoktur.
'use strict';
var fs=require('fs'),path=require('path');
var root=require('./repo-root');
var p1=fs.readFileSync(path.join(root,'panel.js'),'utf8');
var p2=fs.readFileSync(path.join(root,'panel-v2.js'),'utf8');
var h1=fs.readFileSync(path.join(root,'panel.html'),'utf8');
var h2=fs.readFileSync(path.join(root,'panel-v2.html'),'utf8');
var passed=0,failed=0;
function ok(name,condition,detail){if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));}}
var fixture={requestId:'qr_muddessir_20260810',status:'ready',videoId:'dQw4w9WgXcQ',responseId:'qrr_muddessir_20260810',responseSource:'gmail_reply',deliverySentAt:'2026-08-10T18:00:00Z',responseReceivedAt:'2026-08-10T18:30:00Z',responseValidatedAt:'2026-08-10T18:31:00Z'};
var fields=Object.keys(fixture);
function all(source,keys){return keys.every(function(k){return source.indexOf(k)>=0;});}

console.log('\n=== QY-22 — Panel 1 / Panel v2 canonical Kur’an parity ===\n');
ok('Panel 1 canonical root quranJourney kaydını okuyor',/function quranJourneyRootP\(\)[\s\S]*?D\.quranJourney/.test(p1));
ok('Panel v2 canonical root quranJourney kaydını okuyor',/function getRootQuranJourney\(\)[\s\S]*?appData\.quranJourney/.test(p2));
ok('Panel 1 response transport kaynağını ve fail-closed notice’u taşıyor',p1.indexOf('QRESPONSES')>=0&&p1.indexOf('QTRANSPORT')>=0&&p1.indexOf('Transport kaynağı doğrulanamadı')>=0);
ok('Panel 1 fixture alanlarının tamamını render sözleşmesinde taşıyor',all(p1,fields),fields.filter(function(k){return p1.indexOf(k)<0;}).join(','));
ok('Panel v2 fixture alanlarının tamamını render sözleşmesinde taşıyor',all(p2,fields),fields.filter(function(k){return p2.indexOf(k)<0;}).join(','));
ok('İki panel de aynı requestId/status/provenance/timestamp sözleşmesini içeriyor',all(p1,['requestId','status','responseSource','responseReceivedAt','responseValidatedAt'])&&all(p2,['requestId','status','responseSource','responseReceivedAt','responseValidatedAt']));
ok('iki shell de ilgili değişen JS için cache-busting taşıyor',/panel\.js\?v=20260811a/.test(h1)&&/panel-v2\.js\?v=20260811a/.test(h2));
ok('Panel v2 canonical quran kartını today görünümüne bağlıyor',/renderQuranJourneyV2\(\)/.test(p2)&&/Kur’an Yolculuğu/.test(p2));
ok('parity fixture secret veya write kanalı içermiyor',!JSON.stringify(fixture).match(/token|password|secret/i)&&!p2.slice(p2.indexOf('function renderQuranJourneyV2'),p2.indexOf('function getLocationInfo')).match(/fetch\(|PUT|SeySync/));

console.log('\nQY-22 parity result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
process.exit(failed?1:0);
