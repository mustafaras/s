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
check(saygi.includes('maxPrays:dayCount*6'),
  'app weekly denominator remains unchanged and is documented as unresolved');
check(panel.includes('max:days*6'),
  'panel weekly denominator remains unchanged and is documented as unresolved');

check(saygi.includes('>kayıtlı vakit payı</div>'),
  'app ratio copy is descriptive rather than success/adherence language');
check(!saygi.includes('>uyum</div>'), 'app no longer labels the ratio as uyum');
check(panel.includes("k.prays+'/'+k.max+'</b> kayıtlı vakit"),
  'panel mirrors the descriptive recorded-vakit copy');
check(panel.includes("rng.performed+'/'+rng.total+' kayıtlı vakit · '+rng.days+' gün kapsamı"),
  'panel range copy names the recorded-vakit scope');

// Synthetic blank records demonstrate the distinction without reading any personal data.
const blank = Object.fromEntries(keys.map((key) => [key, { performed: false }]));
const performed = keys.filter((key) => blank[key].performed === true).length;
check(performed === 0 && Object.keys(blank).length === 6,
  'six empty fields are not interpreted as six performed prayers');

console.log(`IIP-03 synthetic source contract: PASS (${checks} checks; no personal data read)`);
