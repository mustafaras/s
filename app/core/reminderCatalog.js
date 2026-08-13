(function(root){
"use strict";

var CATALOG_VERSION='1.0.0';
var ID_PREFIX='reminder.catalog.v1.';

function freezeDeep(value){
  if(!value||typeof value!=='object'||Object.isFrozen(value)) return value;
  Object.keys(value).forEach(function(key){ freezeDeep(value[key]); });
  return Object.freeze(value);
}

var definitions=[
  {
    id:ID_PREFIX+'prayer',
    category:'ritual',
    priority:'P2',
    triggerType:'prayer-offset',
    deepLink:'faith',
    privateTitle:'Küçük bir durak yaklaşırken',
    privateBody:'İstersen Şeyma’da sakin bir an açabilirsin.',
    detailKeys:['prayerName','time','remainingMinutes','faithActions'],
    defaultWindow:{kind:'offset',timezone:'user',earliestMinutesBefore:30,latestMinutesBefore:5},
    defaultChannel:'in_app',
    snoozeOptions:['10m','30m','todayOff'],
    suppressionRules:['completed','quietHours','categoryCooldown','groupedWithHigherPriority'],
    definitionVersion:CATALOG_VERSION
  },
  {
    id:ID_PREFIX+'zikr',
    category:'ritual',
    priority:'P2',
    triggerType:'scheduled-window',
    deepLink:'zikr',
    privateTitle:'Kısa bir sakinlik alanı hazır',
    privateBody:'İstersen birkaç dakikalık bir durak açabilirsin.',
    detailKeys:['presetId','durationMinutes','reflectionPrompt'],
    defaultWindow:{kind:'time-range',timezone:'user',start:'09:00',end:'22:00'},
    defaultChannel:'in_app',
    snoozeOptions:['10m','30m','1h','todayOff'],
    suppressionRules:['completed','quietHours','categoryCooldown','groupedWithHigherPriority'],
    definitionVersion:CATALOG_VERSION
  },
  {
    id:ID_PREFIX+'therapy',
    category:'support',
    priority:'P2',
    triggerType:'scheduled-window',
    deepLink:'room',
    privateTitle:'Şeyma’da sana ayırabileceğin bir alan var',
    privateBody:'İstersen nefes, ilk adım veya öz şefkat araçlarından birini seç.',
    detailKeys:['toolId','supportNote','safetyResources'],
    defaultWindow:{kind:'time-range',timezone:'user',start:'10:00',end:'21:00'},
    defaultChannel:'in_app',
    snoozeOptions:['30m','1h','todayOff'],
    suppressionRules:['completed','quietHours','categoryCooldown','groupedWithHigherPriority'],
    definitionVersion:CATALOG_VERSION
  },
  {
    id:ID_PREFIX+'saygi',
    category:'ritual',
    priority:'P3',
    triggerType:'scheduled-window',
    deepLink:'saygi',
    privateTitle:'Bugünün ilham durağı hazır',
    privateBody:'Birkaç dakikan varsa bugünkü okumayı açabilirsin.',
    detailKeys:['personId','articleStatus','readAction'],
    defaultWindow:{kind:'time-range',timezone:'user',start:'09:00',end:'20:00'},
    defaultChannel:'in_app',
    snoozeOptions:['30m','1h','todayOff'],
    suppressionRules:['completed','quietHours','categoryCooldown','groupedWithHigherPriority'],
    definitionVersion:CATALOG_VERSION
  },
  {
    id:ID_PREFIX+'reading',
    category:'ritual',
    priority:'P3',
    triggerType:'scheduled-window',
    deepLink:'reading',
    privateTitle:'Okuma yolculuğuna dönebilirsin',
    privateBody:'İstersen kaldığın yerden birkaç sayfa açabilirsin.',
    detailKeys:['itemId','currentPage','readingWindow'],
    defaultWindow:{kind:'time-range',timezone:'user',start:'18:00',end:'23:00'},
    defaultChannel:'in_app',
    snoozeOptions:['30m','1h','thisEvening','tomorrow'],
    suppressionRules:['completed','quietHours','categoryCooldown','groupedWithHigherPriority'],
    definitionVersion:CATALOG_VERSION
  },
  {
    id:ID_PREFIX+'journal',
    category:'reflection',
    priority:'P2',
    triggerType:'scheduled-window',
    deepLink:'gunluk',
    privateTitle:'Günü kapatmak için küçük bir alan var',
    privateBody:'İstersen bugünden bir cümleyi sakince yazabilirsin.',
    detailKeys:['date','mood','intention','note'],
    defaultWindow:{kind:'time-range',timezone:'user',start:'19:00',end:'23:30'},
    defaultChannel:'in_app',
    snoozeOptions:['30m','1h','thisEvening','todayOff'],
    suppressionRules:['completed','quietHours','categoryCooldown','groupedWithHigherPriority'],
    definitionVersion:CATALOG_VERSION
  },
  {
    id:ID_PREFIX+'system',
    category:'system',
    priority:'P0',
    triggerType:'system-event',
    deepLink:'settings',
    privateTitle:'Şeyma’da ilgilenmen gereken bir durum var',
    privateBody:'İstersen ayarlardan durumu sakince kontrol edebilirsin.',
    detailKeys:['statusCode','lastCheckedAt','repairAction'],
    defaultWindow:{kind:'event',timezone:'user',start:null,end:null},
    defaultChannel:'in_app',
    snoozeOptions:['30m','1h','tomorrow'],
    suppressionRules:['resolved','duplicateEvent','quietHours'],
    definitionVersion:CATALOG_VERSION
  }
].map(freezeDeep);

var byId=Object.create(null);
definitions.forEach(function(definition){ byId[definition.id]=definition; });

root.ReminderCatalogV1=Object.freeze({
  version:CATALOG_VERSION,
  idPrefix:ID_PREFIX,
  definitions:Object.freeze(definitions),
  ids:Object.freeze(definitions.map(function(definition){ return definition.id; })),
  get:function(id){ return byId[id]||null; },
  list:function(){ return definitions.slice(); }
});
})(typeof globalThis!=='undefined'?globalThis:this);
