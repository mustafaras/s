#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const saygiSource = fs.readFileSync(path.join(repoRoot, 'app/core/saygi.js'), 'utf8');
const panelSource = fs.readFileSync(path.join(repoRoot, 'panel/panel.js'), 'utf8');
const panelV2Source = fs.readFileSync(path.join(repoRoot, 'panel/v2/panel-v2.js'), 'utf8');
let passed = 0;
function ok(name, condition) { assert.ok(condition, name); passed++; console.log('PASS  ' + name); }
function addDays(date, amount) { const d = new Date(date + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + amount); return d.toISOString().slice(0, 10); }
function history(prayer) {
  prayer = prayer && typeof prayer === 'object' ? prayer : {};
  const tracked = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const records = tracked.map((key) => ({ key, kind: 'tracked_prayer', hasRecord: !!(prayer[key] && typeof prayer[key] === 'object') }));
  const sourceRecordCount = records.filter((x) => x.hasRecord).length;
  return { records, trackedPerformed: tracked.filter((k) => prayer[k] && prayer[k].performed).length, sourceRecordCount, historicalSunrise: prayer.sunrise && typeof prayer.sunrise === 'object' ? prayer.sunrise : null, denominatorReliable: false, rate: null, uncertainty: 'Payda bilinmiyor.' };
}

const data = {
  days: {
    '2024-02-27': { note: 'Yalnız not' },
    '2024-02-28': { prayer: { fajr: { performed: false }, sunrise: { performed: true } }, reading: { entries: [] } },
    '2024-02-29': { prayer: { fajr: { performed: true }, dhuhr: { performed: true } }, reading: { entries: [{ id: 'r1' }, { id: 'r2' }] } },
    '2024-03-01': { prayer: { asr: { performed: true }, maghrib: { performed: false } }, reading: { entries: [{ id: 'old' }] } }
  },
  zikr: { sessions: { '2024-02-29': { totalCount: 33 }, '2024-03-01': { totalCount: 7 } } }
};
const sandbox = { console, Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Promise, Set, Map, Intl, URL, URLSearchParams, encodeURIComponent, decodeURIComponent, isNaN, isFinite, document: {}, localStorage: { getItem() { return null; }, setItem() {} }, fetch() { throw new Error('network forbidden'); }, setTimeout() { throw new Error('timer forbidden'); }, clearTimeout() {}, SeymaPrayer: { prayerHistoryPresentation: history } };
sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
vm.runInContext(saygiSource, vm.createContext(sandbox), { filename: 'app/core/saygi.js' });
sandbox.SeymaSaygi.registerSaygi({ data: () => data, ui: () => ({}), getDay: (d, k) => d.days[k], todayStr: () => '2024-03-02', addDays, diffDays: () => 0, dayIndexFor: () => 1, dateLabelTR: (x) => x, icon: () => '', esc: String, featuresLive: () => false, render: () => {}, quranJourneyHubCardHTML: () => '', zikrVisible: () => true, zikrPreviewCardHTML: () => '' });

const appWeek = sandbox.SeymaSaygi.faithRhythmWeek('2024-03-02');
ok('REQ-029 vakit, zikir ve okuma toplamları ayrı hesaplanır', appWeek.totals.vakit === 3 && appWeek.totals.zikr === 40 && appWeek.totals.okuma === 3);
ok('REQ-029 birleşik skor, oran veya sahte payda üretilmez', appWeek.rate === null && appWeek.denominatorReliable === false && /Payda bilinmiyor/.test(appWeek.compatibilityLabel));
ok('TC-029 yalnız not günü bilinmeyen kalır', appWeek.rows.find((x) => x.date === '2024-02-27').known === false);
ok('TC-029 bilinçli sıfır ile tarihsel Güneş kaydı kayıpsız ve ayrı kalır', (() => { const x = appWeek.rows.find((r) => r.date === '2024-02-28'); return x.known && x.vakit === 0 && x.historicalSunrise; })());
ok('TC-029 artık gün ve karma eski kayıt bağımsız oracle ile aynıdır', appWeek.rows.find((x) => x.date === '2024-02-29').vakit === 2 && appWeek.rows.find((x) => x.date === '2024-03-01').okuma === 1);
const html = sandbox.SeymaSaygi.faithRaporCardHTML();
ok('REQ-029 gün listesi ve bilinmeyen etiketi render edilir', html.includes('role="list"') && html.includes('2024-02-27') && html.includes('Bilinmiyor · faaliyet kaydı yok'));
ok('boş durum yedi bilinmeyen gün olarak dürüstçe döner', (() => { const oldDays = data.days, oldZikr = data.zikr; data.days = {}; data.zikr = { sessions: {} }; const x = sandbox.SeymaSaygi.faithRhythmWeek('2024-03-02'); data.days = oldDays; data.zikr = oldZikr; return x.totals.unknownDays === 7 && x.totals.vakit === 0 && x.totals.zikr === 0 && x.totals.okuma === 0; })());

ok('REQ-030 current-panel aynı beş-vakit kayıt tanımını kullanır', /var PRAYER_TRACKED_ORDER_P=\['fajr','dhuhr','asr','maghrib','isha'\]/.test(panelSource) && /function faithRhythmDayP\(date\)/.test(panelSource));
ok('REQ-030 current-panel payda ve yüzdeyi kapatır', /denominatorReliable:false/.test(panelSource) && /Payda bilinmiyor · uyum yüzdesi hesaplanmadı/.test(panelSource) && !/k\.prays\+'\/'\+k\.max/.test(panelSource));
ok('current-panel klavye/ekran okuyucu için gün listesi taşır', /faith-rhythm-days[^]*role="list"[^]*role="listitem"/.test(panelSource));
ok('Panel-v2 ayrı regresyonda Güneş kaydını beş vakit toplamından ayırır', /tracked = \["fajr", "dhuhr", "asr", "maghrib", "isha"\]/.test(panelV2Source) && /Güneş · tarihsel kayıt/.test(panelV2Source));
ok('Panel-v2 boş ve bilinmeyen durumu açık gösterir', panelV2Source.includes('Ritim: Bilinmiyor · faaliyet kaydı yok'));
ok('yükleniyor/hata/dönüş panel veri durumları korunur', ['loading', 'error', 'return'].every((token) => panelV2Source.toLowerCase().includes(token)) && /Canonical hata; önceki güvenli görünüm korunuyor/.test(panelSource));

console.log('\nIIP-15 ritim doğruluğu: ' + passed + ' PASS, 0 FAIL');
