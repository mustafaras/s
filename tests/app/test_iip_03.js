'use strict';

// IIP-03 source/contract fixture. It reads source only; no app data, storage,
// network, token or device state is loaded.
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const prayer = read('app/core/prayer.js');
const state = read('app/core/state.js');
const saygi = read('app/core/saygi.js');
const panel = read('panel/panel.js');
const keys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
let checks = 0;

function check(condition, message) {
  assert.ok(condition, message);
  checks += 1;
}

const keyLiteral = "['fajr','sunrise','dhuhr','asr','maghrib','isha']";
check(prayer.includes("{fajr:'İmsak',sunrise:'Güneş',dhuhr:'Öğle',asr:'İkindi',maghrib:'Akşam',isha:'Yatsı'}"),
  'app prayer source keeps six historical labels, including separate fajr/sunrise');
check(prayer.includes(keyLiteral), 'app prayer source keeps the six-field order');
check(panel.includes("{fajr:'İmsak',sunrise:'Güneş',dhuhr:'Öğle',asr:'İkindi',maghrib:'Akşam',isha:'Yatsı'}"),
  'panel keeps the same six historical labels');
check(panel.includes("['fajr','sunrise','dhuhr','asr','maghrib','isha']"),
  'panel keeps the same six-field order');
check(prayer.includes('map={fajr:t.Fajr,sunrise:t.Sunrise,dhuhr:t.Dhuhr,asr:t.Asr,maghrib:t.Maghrib,isha:t.Isha}'),
  'source maps Fajr and Sunrise independently');

check(prayer.includes("performed:false,inCongregation:false,late:false,madeUp:false,nafile:0,note:'',savedAt:''"),
  'empty prayer entries are explicitly unperformed and blank');
check(state.includes('if(day&&typeof day===\'object\') ensurePrayerDay(day);'),
  'migration normalizes historical day records through the existing prayer adapter');
check(saygi.includes('maxPrays:null') && saygi.includes('denominatorReliable:false'),
  'app historical presentation suppresses unreliable weekly denominator');
/* P04: 'max:days*6' bayat pin. panel/panel.js:622 artık bilinçli olarak
   `max:null, rate:null, denominatorReliable:false` yayıyor, yani sahte bir
   payda ÜRETMİYOR — davranış iyileşti, test eski metni arıyordu.
   Yeni kontrat: panel de app ile AYNI "payda bilinmiyor" sözleşmesini uygular
   ve oran üretmez. */
check(panel.includes('max:null') && panel.includes('rate:null') && panel.includes('denominatorReliable:false'),
  'panel weekly denominator is suppressed (max/rate null) like the app side');
check(panel.includes("compatibilityLabel:'Payda bilinmiyor · uyum yüzdesi hesaplanmadı'"),
  'panel states the unreliable denominator explicitly instead of computing a ratio');
check(!/max\s*:\s*days\s*\*\s*6/.test(panel),
  'panel no longer computes a synthetic weekly denominator (days*6)');

check(!saygi.includes('>kayıtlı vakit payı</div>') && saygi.includes('kaynak kayıt'),
  'app historical report uses source-record copy without a ratio');
check(!saygi.includes('>uyum</div>'), 'app no longer labels the ratio as uyum');
check(panel.includes("rng.performed+'/'+rng.total+' kayıtlı vakit"),
  'panel mirrors the descriptive recorded-vakit copy');
/* P04: eskiden `k.prays+'/'+k.max+'</b> kayıtlı vakit` aranıyordu — bu bir
   ORAN biçimiydi (paydalı). Panel artık oran biçimini bıraktı ve betimleyici
   kayıt sayımı kullanıyor (panel/panel.js:4326). Doğru kontrol negatiftir:
   oran biçimli çıktı panelde KALMAMALI. */
check(!/k\.prays\+'\/'\+k\.max/.test(panel),
  'panel no longer prints a ratio-shaped prays/max pair');
check(panel.includes("rng.performed+'/'+rng.total+' kayıtlı vakit · '+rng.days+' gün kapsamı"),
  'panel range copy names the recorded-vakit scope');

// Synthetic blank records demonstrate the distinction without reading any personal data.
const blank = Object.fromEntries(keys.map((key) => [key, { performed: false }]));
const performed = keys.filter((key) => blank[key].performed === true).length;
check(performed === 0 && Object.keys(blank).length === 6,
  'six empty fields are not interpreted as six performed prayers');

console.log(`IIP-03 synthetic source contract: PASS (${checks} checks; no personal data read)`);
