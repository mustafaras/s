'use strict';

// K2F-26 ek tur: Arapça sekmesi (saygi.js) ile GERÇEK KAO hub kartı (quranLearn.js) uçtan uca.
// Cihaz bildirimi: kart gizliyken sekmede "Ders alanı şu an görünmüyor" yazıyor, ders girişi yoktu.
// Sentetik VM; ağ, tarayıcı, gerçek kullanıcı verisi yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');
const { bootKao, freshUser } = require('./helpers/kao-harness');

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };
const esc = (value) => String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const t = bootKao();
freshUser(t);
const person = { id: 'ada', name: 'Ada Lovelace', kind: 'Bilim', era: '19. yy', field: 'Matematik' };
const sandbox = {
  console, URL, URLSearchParams, Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Promise, Set, Map, Intl,
  encodeURIComponent, decodeURIComponent, isNaN, isFinite, document: {}, SaygiPeople: [person], HijriCalendarV1: undefined,
  SeymaPrayer: {
    PRAYER_ORDER: ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'],
    PRAYER_NAMES: { fajr: 'Sabah', sunrise: 'Güneş', dhuhr: 'Öğle', asr: 'İkindi', maghrib: 'Akşam', isha: 'Yatsı' },
    ensurePrayerDay: () => ({ fetchedAt: '2026-09-20T08:00:00Z', fetchedMethod: 'diyanet' }), prayerLocation: () => ({ cityName: 'Ankara', source: 'city' }),
    prayerDaySummary: () => ({ performed: 2, congregation: 1, madeUp: 0, late: 0, nafile: 0, total: 6 }), prayerStreak: () => 1,
    prayerTimesFromDay: () => ({ fajr: '05:00', sunrise: '06:30', dhuhr: '12:45', asr: '16:20', maghrib: '19:00', isha: '20:30' }),
    currentPrayerIndex: () => 0, emptyPrayerEntry: () => ({ time: '--:--' })
  },
  SeymaZikr: { zikrWeek: () => ({ total: 4, days: 1 }) }
};
sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/core/saygi.js'), 'utf8'), sandbox, { filename: 'app/core/saygi.js' });
function addDaysFixture(value, amount) {
  const parts = String(value).split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  date.setDate(date.getDate() + Number(amount || 0));
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}
const appState = { days: { '2026-09-20': {} }, saygi: { collection: {}, streak: 0 } };
assert.equal(sandbox.SeymaSaygi.registerSaygi({
  data: () => appState, ui: () => t.ui, getDay: () => ({}), todayStr: () => '2026-09-20', addDays: addDaysFixture, diffDays: () => 0, dayIndexFor: () => 1,
  dateLabelTR: (v) => v, icon: (name) => `<svg data-icon="${esc(name)}"></svg>`, esc, featuresLive: () => true, render: () => {},
  quranJourneyHubCardHTML: () => '<article id="quran-journey-card">Kur’an kartı</article>',
  // Gerçek KAO hub kartı: saygi.js'in app.js köprüsüyle çağırdığı fonksiyonun aynısı.
  kaoHubCardHTML: () => t.api.kaoHubCardHTML(),
  zikrVisible: () => true, zikrPreviewCardHTML: () => '<article>Zikir</article>', prayer: true
}), true);

const arapca = () => { t.ui.faithTab = 'arapca'; return sandbox.SeymaSaygi.saygiPreviewHubHTML(person, null, false); };
const count = (html, needle) => html.split(needle).length - 1;

check('kart görünürken: Arapça sekmesinde tek ders girişi var, yedek mesaj yok', () => {
  const html = arapca();
  assert.equal(count(html, 'id="kao-hub-entry"'), 1);
  assert.equal(count(html, 'App.kaoOpen()'), 1);
  assert.ok(!html.includes('Ders alanı şu an görünmüyor'));
  assert.ok(!html.includes('kao-hub-restore'));
});

check('kart gizliyken: Arapça sekmesi çıkmaz sokmaz — "Ders kartı gizli · Göster" geri getirme kartı, yedek mesaj yok, tek handler', () => {
  t.data.quranLearn.settings.kaoVisible = false;
  const html = arapca();
  assert.equal(count(html, 'id="kao-hub-restore"'), 1, 'geri getirme kartı yok');
  assert.equal(count(html, 'App.kaoToggleVisible()'), 1);
  assert.ok(!html.includes('kao-hub-entry'), 'gizliyken ders girişi çizilmemeli');
  assert.ok(!html.includes('Ders alanı şu an görünmüyor'), 'yanıltıcı yedek mesaj çıkmamalı');
  assert.ok(/Ders kartı gizli/.test(html) && /Göster/.test(html));
  assert.ok(/<ol class="iip-arabic-course-path"/.test(html), 'öğrenme yolu açıklaması korunur');
});

check('gizliyken Arapça dışı sekmelerde KAO kartı hiç çizilmez (eski sözleşme)', () => {
  for (const tab of ['oz', 'oncu', 'iman', 'rapor']) {
    t.ui.faithTab = tab;
    const html = sandbox.SeymaSaygi.saygiPreviewHubHTML(person, null, false);
    assert.ok(!html.includes('kao-hub-restore') && !html.includes('kao-hub-entry'), `${tab}: KAO kartı sızdı`);
  }
});

check('geri getirme dokunuşu (kaoToggleVisible) ders girişini geri getirir', () => {
  t.ui.faithTab = 'arapca';
  assert.equal(t.api.kaoToggleVisible(), true);
  assert.equal(t.data.quranLearn.settings.kaoVisible, true);
  const html = arapca();
  assert.equal(count(html, 'id="kao-hub-entry"'), 1);
  assert.ok(!html.includes('kao-hub-restore') && !html.includes('Ders alanı şu an görünmüyor'));
});

console.log(`KAO2 Arapça sekmesi uçtan uca: PASS (${passed} kontrol)`);
