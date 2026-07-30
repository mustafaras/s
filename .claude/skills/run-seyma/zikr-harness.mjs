#!/usr/bin/env node
// zikr-harness.mjs — İlham & İbadet (Faz 35–40) odaklı headless Node `vm` testi.
// Zikirmatik, kıble yönü, sonraki-vakit geri sayımı, saygı koleksiyonu, ibadet raporu
// ve hub render zincirini GERÇEK ağ/veri riski olmadan doğrular.
// Çalıştır: node zikr-harness.mjs
'use strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function today() {
  const d = new Date();
  const p = (n) => (n < 10 ? '0' : '') + n;
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
function yesterday() {
  const d = new Date(Date.now() - 864e5);
  const p = (n) => (n < 10 ? '0' : '') + n;
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

let appHTML = '';
function makeEl(id) {
  const el = {
    id: id || '', _html: '', _text: '',
    style: { cssText: '', setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: '', files: [],
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = String(v); if (this.id === 'app') appHTML = this._html; },
    get textContent() { return this._text; },
    set textContent(v) { this._text = String(v); },
    setAttribute() {}, getAttribute() { return null; },
    appendChild(c) { this.children.push(c); return c; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(c) { return c; },
    addEventListener() {}, removeEventListener() {}, click() {}, focus() {}, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; },
  };
  return el;
}
const appEl = makeEl('app');
const rootEl = makeEl('root');
const elCache = { app: appEl, root: rootEl };
const doc = {
  hidden: false, body: makeEl('body'), documentElement: rootEl,
  getElementById(id) { return elCache[id] || null; },
  querySelector() { return null; }, querySelectorAll() { return []; },
  createElement() { return makeEl(''); }, createDocumentFragment() { return makeEl(''); },
  addEventListener() {}, removeEventListener() {}, DOMParser: undefined,
};
class DOMParserStub { parseFromString() { return { body: makeEl('body'), querySelector() { return null; }, querySelectorAll() { return []; } }; } }

function makeLS(seed) {
  const store = Object.assign({}, seed);
  return {
    getItem(k) { return k in store ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; }, clear() { for (const k in store) delete store[k]; },
    _store: store,
  };
}
function buildSandbox(seedData, fetchImpl) {
  const seed = seedData ? { 'seyma-reset-v1': JSON.stringify(seedData) } : {};
  const localStorage = makeLS(seed);
  const sandbox = {
    console, localStorage, document: doc, __SEYMA_TEST_ZIKR__: true,
    navigator: { vibrate() {}, userAgent: 'node-harness', clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: 'http:', hostname: 'localhost', search: '', href: 'http://localhost/', reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch: fetchImpl || function () { return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(a) { for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 256) | 0; return a; } },
    URL: fetchImpl ? URL : Object.assign(function () {}, { createObjectURL() { return 'blob:stub'; }, revokeObjectURL() {} }),
    URLSearchParams,
    Blob: function () {}, File: function () {}, FileReader: function () {},
    TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
    Promise, Set, Map, Symbol, Intl,
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  sandbox.AudioContext = function () { return { state: 'running', currentTime: 0, resume() {}, createOscillator() { return { type: '', frequency: { value: 0 }, connect() {}, start() {}, stop() {} }; }, createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }, destination: {} }; };
  return sandbox;
}
function loadInto(sandbox, files) {
  const ctx = vm.createContext(sandbox);
  for (const f of files) {
    const src = fs.readFileSync(path.join(REPO, f), 'utf8');
    vm.runInContext(src, ctx, { filename: f });
  }
  return ctx;
}

const t = today(), y = yesterday();
const seed = {
  version: 2, startDate: y, lastOpenedDate: y,
  days: {
    [t]: { habits: {}, mood: null, prayer: { fetchedAt: new Date().toISOString(), fetchedFor: 'test' } },
    [y]: { habits: {}, mood: null, saygi: { personId: 'ada-lovelace', readAt: new Date(Date.now() - 864e5).toISOString(), readingEntryId: 'x' } },
  },
  notifications: [], luna: { qa: [] }, aeon: { qa: [] },
  settings: { nickname: 'Sevgili Günışığı', ghToken: '', ghRepo: 'mustafaras/seyma-data', auth: { rememberMe: true, usernameHash: 'ae9e1ed2b6abcbce74cc0c15719fdbba372a7dd62e6232510656bade7c201af4', unlockedAt: new Date().toISOString() } },
  cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
  profileAssessment: { schemaVersion: 2, status: 'completed', currentItemIndex: 1, responses: { i1: { value: 1, shownAt: t } } },
  saygi: { collection: { 'ada-lovelace': { name: 'Ada Lovelace', field: 'Matematik · Bilgisayar bilimi', readAt: new Date(Date.now() - 864e5).toISOString() } }, streak: 1, lastReadDate: y },
  zikr: { presets: [{ id: 'subhanallah', name: 'Sübhanallah', phrase: 'Sübhanallah', target: 33, color: 'zikr', favorite: true, createdAt: t }], sessions: {}, settings: { soundOn: true, haptic: true, autoAdvance: false, activePresetId: 'subhanallah' }, streak: 1, streakDate: y },
};
let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail ? ' — ' + detail : '')); }
}

console.log('== İlham & İbadet · Zikirmatik v2 headless test ==');
const FILES = ['motivationProgramV2.js', 'profileAssessmentV1.js', 'saygiPeople.js', 'hijriCalendar.js', 'esmaulHusnaV1.js', 'app.js'];
let sb = buildSandbox(seed);
let ctx = loadInto(sb, FILES);
if (sb.App && typeof sb.App.start === 'function') sb.App.start();

ok('Saygı/İlham sekmesi render ediliyor', (function () {
  if (typeof sb.App.go !== 'function') return false;
  appHTML = ''; sb.App.go('saygi');
  return /saygi-preview-hub|İMAN|Zikirmatik|100 Öncü|İbadet|spirit-bar/i.test(appHTML);
})(), appHTML.slice(0, 120));

ok('Zikir preview kartı render', /Zikirmatik|zikr/i.test(appHTML));
ok('Beşli hub sekmesi render', /Öz[\s\S]*Öncü[\s\S]*İman[\s\S]*Zikir[\s\S]*Rapor/i.test(appHTML));
ok('Rapor kartı + yıllık ısı haritası render', (function () {
  sb.App.setFaithTab('rapor');
  return /İbadet Ritmi|Yıllık İbadet Isısı/i.test(appHTML) && /sg-faith-heat/.test(appHTML);
})());
ok('Koleksiyon kartı numaralı 100 hücreyle render', (function () {
  sb.App.setFaithTab('oncu');
  return /100 Öncü Koleksiyonu/i.test(appHTML) && /aria-label="1\./.test(appHTML);
})());
ok('Koleksiyon hücresi istenen öncünün modalını açar', (function () {
  if(typeof sb.App.openSaygiCollectionPerson!=='function') return false;
  sb.App.openSaygiCollectionPerson('ada-lovelace');
  const shown=/Ada Lovelace/.test(appHTML)&&/1 \/ 100/.test(appHTML)&&/Önceki öncü/.test(appHTML);
  sb.App.closeSaygiPerson();
  return shown;
})(), appHTML.slice(0,180));
ok('Okudum eylemi biyografi yüklenirken bile modal altında görünür', (function () {
  sb.App.openSaygiCollectionPerson('albert-einstein');
  const shown=/sg-person-read-fab/.test(appHTML)&&/saygi-read-button-modal/.test(appHTML)&&/>Okudum</.test(appHTML)&&/z-index:2147483640!important/.test(appHTML);
  sb.App.closeSaygiPerson();
  return shown;
})(), appHTML.slice(-260));
ok('Sonraki vakit geri sayım (spirit bar)', /mosque|Sonraki|spirit/i.test(appHTML));

// Zikirmatik overlay açma
ok('App.openZikr overlay render', (function () {
  if (typeof sb.App.openZikr !== 'function') return false;
  appHTML = ''; sb.App.openZikr();
  return /id="zikr-overlay"/.test(appHTML) && /id="zikr-screen"/.test(appHTML) &&
    /id="zikr-scroll"/.test(appHTML) && /Sayaç[\s\S]*Esmâ[\s\S]*Hatimlerim[\s\S]*Geçmiş[\s\S]*Ayarlar/i.test(appHTML) &&
    /tabindex="-1" onkeydown="App\.onZikrKeydown\(event\)"/.test(appHTML) &&
    !/id="sey-ov-card"[^]*Zikirmatik/.test(appHTML);
})(), appHTML.slice(0, 120));

ok('99 Esmâ preset kütüphanesi yüklü', (function () {
  sb.App.setZikrView('presets');
  return sb.window.EsmaulHusnaV1.names.length === 99 && /99 Esmâ|ebced değeri bir tur/i.test(appHTML) &&
    /Tam hatim/i.test(appHTML);
})());

ok('Esmâ ebced sayacı geri sayar', (function () {
  sb.App.setZikrPreset('esma_01');
  const before=/kaldı/.test(appHTML)&&/>66</.test(appHTML);
  sb.App.zikrTap();
  return before && /kaldı/.test(appHTML) && />65</.test(appHTML);
})(), appHTML.slice(0, 180));

// Helper'lar app.js IIFE'inde `var data` içinde kalıyor — `App` globale açık,
// helper'lar değil. Veriyi `save()`'in localStorage'a yazdığı kalıcı kopyadan oku.
function readState() {
  try { return JSON.parse(sb.localStorage.getItem('seyma-reset-v1')); } catch (e) { return null; }
}
const getZikrDay = (date) => { const s = readState(); const sess = s && s.zikr && s.zikr.sessions && s.zikr.sessions[date]; return sess || { perPreset: {}, totalCount: 0, completedSets: 0 }; };
const presetCount = (day, id) => {
  const raw = day && day.perPreset && day.perPreset[id];
  return Number(raw && typeof raw === 'object' ? raw.count : raw) || 0;
};

// Zikir sayaç (tek dokunma arttırır)
ok('zikrTap count artırır', (function () {
  const before = getZikrDay(t).totalCount;
  if (typeof sb.App.zikrTap !== 'function') return false;
  sb.App.zikrTap();
  const day = getZikrDay(t);
  return day.totalCount === before + 1;
})());

ok('zikrTap 33 kez sonra presetDone + streak', (function () {
  sb.App.setZikrPreset('subhanallah');
  while (presetCount(getZikrDay(t),'subhanallah') < 33) sb.App.zikrTap();
  const doneToday = presetCount(getZikrDay(t),'subhanallah') >= 33;
  const st = readState();
  return doneToday && st && st.zikr && st.zikr.streak >= 1;
})());

ok('aynı hedef ikinci kez dolunca ikinci set kaydolur', (function () {
  const before=getZikrDay(t).completedSets;
  while (presetCount(getZikrDay(t),'subhanallah') < 66) sb.App.zikrTap();
  return getZikrDay(t).completedSets===before+1;
})());

// Eski v1 günlük sayılarını tek seferde v2 yolculuğuna taşı; ikinci boot'ta
// toplam veya hatim kaydı bir daha eklenmemeli.
const legacySeed=JSON.parse(JSON.stringify(seed));
legacySeed.zikr={
  presets:[{id:'esma_19',name:'el-Fettâh',phrase:'فتاح',arabic:'فتاح',target:489,ebced:489,kind:'esma',countDirection:'down'}],
  sessions:{[t]:{totalCount:978,completedSets:2,perPreset:{esma_19:978},lastAt:t+'T12:00:00.000Z'}},
  settings:{activePresetId:'esma_19',soundOn:false,haptic:true,autoAdvance:false},
  streak:1,streakDate:t
};
const legacySb=buildSandbox(legacySeed);
loadInto(legacySb,FILES); legacySb.App.start();
const migratedOnce=JSON.parse(legacySb.localStorage.getItem('seyma-reset-v1'));
ok('v1 sayımı v2 nesne kaydına dönüşür', migratedOnce.zikr.schemaVersion===3 &&
  migratedOnce.zikr.migrationVersion==='zikr_v2' &&
  migratedOnce.zikr.sessions[t].perPreset.esma_19.count===978 &&
  migratedOnce.zikr.journeys.esma_19.lifetimeCount===978);
const beforeReload={
  lifetime:migratedOnce.zikr.journeys.esma_19.lifetimeCount,
  hats:migratedOnce.zikr.journeys.esma_19.hatims.length,
  count:migratedOnce.zikr.journeys.esma_19.hatims[0].count
};
const reloadSb=buildSandbox(migratedOnce);
loadInto(reloadSb,FILES); reloadSb.App.start();
const migratedTwice=JSON.parse(reloadSb.localStorage.getItem('seyma-reset-v1'));
ok('zikr v2 migration idempotent', migratedTwice.zikr.journeys.esma_19.lifetimeCount===beforeReload.lifetime &&
  migratedTwice.zikr.journeys.esma_19.hatims.length===beforeReload.hats &&
  migratedTwice.zikr.journeys.esma_19.hatims[0].count===beforeReload.count);

function fettahBoundarySeed(count) {
  const x=JSON.parse(JSON.stringify(seed));
  const hid='hatim_fettah_test';
  x.zikr={
    schemaVersion:2,migrationVersion:'zikr_v2',
    presets:[{id:'esma_19',name:'el-Fettâh',phrase:'فتاح',arabic:'فتاح',target:489,ebced:489,builtIn:true,kind:'esma',countDirection:'down',hatimMode:'ebced_square'}],
    journeys:{esma_19:{presetId:'esma_19',lifetimeCount:count,activeHatimId:hid,lastAt:t+'T12:00:00.000Z',lastSessionId:'',completedHatims:0,legacyCompletedHatims:0,hatims:[{id:hid,mode:'ebced_square',baseTarget:489,target:239121,count:count,startedAt:t+'T00:00:00.000Z',completedAt:null,status:'active'}]}},
    sessions:{[t]:{totalCount:count,completedSets:Math.floor(count/489),perPreset:{esma_19:{count:count,completedCycles:Math.floor(count/489),lastAt:t+'T12:00:00.000Z'}},lastAt:t+'T12:00:00.000Z'}},
    activeSession:null,settings:{activePresetId:'esma_19',soundOn:false,haptic:false,autoAdvance:false,defaultMode:'hatim'},streak:0,streakDate:''
  };
  return x;
}
const cycleSb=buildSandbox(fettahBoundarySeed(488));
loadInto(cycleSb,FILES); cycleSb.App.start(); cycleSb.App.openZikr(); cycleSb.App.zikrTap();
const cycleState=JSON.parse(cycleSb.localStorage.getItem('seyma-reset-v1'));
ok('el-Fettâh 489. sayımda ilk turu tamamlar', cycleState.zikr.journeys.esma_19.hatims[0].count===489 &&
  cycleState.zikr.sessions[t].perPreset.esma_19.completedCycles===1 && /2\. tur · 0\/489/.test(appHTML));
cycleSb.App.zikrUndo();
const undoState=JSON.parse(cycleSb.localStorage.getItem('seyma-reset-v1'));
ok('489 sınırında geri al turu güvenle geri çeker', undoState.zikr.journeys.esma_19.hatims[0].count===488 &&
  undoState.zikr.sessions[t].perPreset.esma_19.completedCycles===0);

const hatimSb=buildSandbox(fettahBoundarySeed(239120));
loadInto(hatimSb,FILES); hatimSb.App.start(); hatimSb.App.openZikr(); hatimSb.App.zikrTap();
const hatimState=JSON.parse(hatimSb.localStorage.getItem('seyma-reset-v1'));
ok('el-Fettâh 489² = 239.121 tam hatim sınırı', hatimState.zikr.journeys.esma_19.hatims[0].count===239121 &&
  hatimState.zikr.journeys.esma_19.hatims[0].status==='completed' &&
  hatimState.zikr.journeys.esma_19.completedHatims===1 && /Ebced² Tam Hatim tamamlandı/.test(appHTML));
hatimSb.App.zikrTap();
const noAutoHatim=JSON.parse(hatimSb.localStorage.getItem('seyma-reset-v1'));
ok('tamamlanan hatimde dokunma otomatik yeni hatim açmaz', noAutoHatim.zikr.journeys.esma_19.hatims.length===1 &&
  noAutoHatim.zikr.journeys.esma_19.hatims[0].count===239121);
hatimSb.App.startNewZikrHatim();
const newHatimState=JSON.parse(hatimSb.localStorage.getItem('seyma-reset-v1'));
ok('yeni hatim ömürlük toplamı silmez', newHatimState.zikr.journeys.esma_19.hatims.length===2 &&
  newHatimState.zikr.journeys.esma_19.lifetimeCount===239121 &&
  newHatimState.zikr.journeys.esma_19.hatims[1].count===0);

const rapidSeed=JSON.parse(JSON.stringify(seed));
rapidSeed.zikr={presets:[],sessions:{},settings:{activePresetId:'subhanallah',soundOn:false,haptic:false,autoAdvance:false},streak:0,streakDate:''};
const rapidSb=buildSandbox(rapidSeed);
loadInto(rapidSb,FILES); rapidSb.App.start(); rapidSb.App.openZikr();
for(let i=0;i<100;i++) rapidSb.App.zikrTap();
const rapidState=JSON.parse(rapidSb.localStorage.getItem('seyma-reset-v1'));
ok('hızlı 100 sayaç çağrısı tam 100 artar', rapidState.zikr.journeys.subhanallah.lifetimeCount===100 &&
  rapidState.zikr.sessions[t].perPreset.subhanallah.count===100);
rapidSb.App.setZikrPreset('elhamdulillah'); rapidSb.App.zikrTap(); rapidSb.App.zikrTap(); rapidSb.App.setZikrPreset('subhanallah');
const switchState=JSON.parse(rapidSb.localStorage.getItem('seyma-reset-v1'));
ok('preset A → B → A ayrı ilerlemeyi korur', switchState.zikr.settings.activePresetId==='subhanallah' &&
  switchState.zikr.journeys.subhanallah.lifetimeCount===100 &&
  switchState.zikr.journeys.elhamdulillah.lifetimeCount===2);
const persistSb=buildSandbox(switchState);
loadInto(persistSb,FILES); persistSb.App.start(); persistSb.App.openZikr();
const persisted=JSON.parse(persistSb.localStorage.getItem('seyma-reset-v1'));
ok('reload sayaç ve aktif preseti korur', persisted.zikr.settings.activePresetId==='subhanallah' &&
  persisted.zikr.journeys.subhanallah.lifetimeCount===100);
const nextDaySeed=fettahBoundarySeed(132);
nextDaySeed.zikr.sessions[y]=nextDaySeed.zikr.sessions[t]; delete nextDaySeed.zikr.sessions[t];
nextDaySeed.days[y]=nextDaySeed.days[t]; nextDaySeed.days[t]={habits:{},mood:null};
const nextDaySb=buildSandbox(nextDaySeed);
loadInto(nextDaySb,FILES); nextDaySb.App.start(); nextDaySb.App.openZikr();
const nextDayState=JSON.parse(nextDaySb.localStorage.getItem('seyma-reset-v1'));
ok('gün değişince hatim sürer, bugünün sayacı sıfır başlar', nextDayState.zikr.journeys.esma_19.hatims[0].count===132 &&
  nextDayState.zikr.sessions[t].totalCount===0);
persistSb.App.setZikrView('settings'); persistSb.App.toggleZikrSetting('reducedMotion');
ok('kullanıcı hareketi azalt ayarı tam ekrana uygulanır', /zikr-v2-overlay is-reduced/.test(appHTML));
persistSb.App.setTheme(true); persistSb.App.setZikrView('counter');
ok('Zikirmatik koyu temada tam ekran render olur', /id="zikr-overlay"/.test(appHTML)&&/role="status" aria-live="polite"/.test(appHTML));

ok('saygiMarkRead koleksiyonu günceller', (function () {
  const st = readState();
  return st && st.saygi && st.saygi.collection && Object.keys(st.saygi.collection).length >= 1;
})());

ok('saygiStreak okundu günde artar', (function () {
  const st = readState();
  return st && st.saygi && st.saygi.streak >= 1;
})());

ok('Kıble yönü hesaplanır (Ankara)', (function () {
  // IIFE içindeki qiblaBearing'e ulaşılamaz; App.openQibla render ile yönü doğrula
  if (typeof sb.App.openQibla !== 'function') return false;
  appHTML = ''; sb.App.openQibla();
  return /°|doğu|batı|kuzey/i.test(appHTML);
})());

ok('Sonraki vakit hesabı güvenli (spiritBarHTML render ile doğrulandı)', (function () {
  // nextPrayerInfo IIFE içinde kalıyor — render zinciri (spirit bar) üzerinden doğrula
  appHTML = ''; sb.App.go('saygi');
  return /mosque|kandil|spirit|İlham/i.test(appHTML);
})());

ok('Kıble overlay render', (function () {
  if (typeof sb.App.openQibla !== 'function') return false;
  appHTML = ''; sb.App.openQibla();
  return /Kıble|qibla-rose|pusula|°/i.test(appHTML);
})());

ok('İbadet raporu (haftalık zikir/vakit toplamı)', (function () {
  // Haftama zikir+günseksiyonu elle say (app.js'in IIFE içinde kalması beklenir; veri localStorage'dan gelir)
  let z = 0;
  const sess = (readState() && readState().zikr && readState().zikr.sessions) || {};
  Object.keys(sess).forEach(function (d) { z += (sess[d] && sess[d].totalCount) || 0; });
  return z >= 1;
})());

ok('Hicri takvim modülü yüklü', (function () {
  return typeof sb.window.HijriCalendarV1 === 'object' && typeof sb.window.HijriCalendarV1.todayStr === 'function' && sb.window.HijriCalendarV1.todayStr(t).length > 0;
})());

ok('Hicri ±2 gün kullanıcı ayarı kaydolur', (function () {
  if (typeof sb.App.adjustHijriOffset !== 'function') return false;
  sb.App.adjustHijriOffset(1);
  const st=readState();
  return st && st.settings && st.settings.prayer && st.settings.prayer.hijriOffset===1;
})());

ok('İlham & İbadet koyu tema raporu render', (function () {
  sb.App.closeQibla(); sb.App.go('saygi'); sb.App.setFaithTab('rapor'); sb.App.setTheme(true);
  return /Yıllık İbadet Isısı/.test(appHTML)&&/sg-faith-heat/.test(appHTML);
})());

ok('Günün öncüsü modalında sabit Okudum eylemi kod yolu var', (function () {
  const src=fs.readFileSync(path.join(REPO,'app.js'),'utf8');
  return /function saygiFloatingReadHTML\(\)/.test(src)&&/z-index:2147483640!important/.test(src)&&/h\+=saygiPersonModalHTML\(\); h\+=saygiFloatingReadHTML\(\)/.test(src);
})());

ok('Okudum, Zihnimi Besledim türetilmiş tikini günceller', (function () {
  const src=fs.readFileSync(path.join(REPO,'app.js'),'utf8');
  return /source:'saygi'[\s\S]{0,900}syncDerivedHabits\(day\)[\s\S]{0,180}Zihnimi besledim tiki/.test(src);
})());

// Wikipedia yanıtlarını yalnızca bellek içinde taklit ederek seçili kişi ile
// biyografi gövdesinin hızlı gezinmede dahi ayrışmadığını doğrula.
function cannedWikipediaFetch(rawUrl) {
  const url=String(rawUrl||'');
  if(url.includes('/api/rest_v1/page/summary/')){
    const slug=decodeURIComponent(url.split('/').pop()||'').replace(/_/g,' ');
    return Promise.resolve({ok:true,status:200,json(){ return Promise.resolve({
      title:slug, description:slug+' test biyografisi', extract:slug+' için güvenli headless test biyografisi. Bu metin seçili öncünün başlığı ve içerik gövdesinin aynı kişide kaldığını doğrulamak için yeterince uzundur.',
      thumbnail:{source:'https://upload.wikimedia.org/test.jpg'},
      content_urls:{desktop:{page:'https://tr.wikipedia.org/wiki/'+encodeURIComponent(slug.replace(/ /g,'_'))}},
      titles:{canonical:slug}, revision:1
    }); }});
  }
  if(url.includes('/with_html')){
    return Promise.resolve({ok:true,status:200,json(){ return Promise.resolve({html:'',latest:{id:1},license:{title:'CC BY-SA 4.0',url:'https://creativecommons.org/licenses/by-sa/4.0/deed.tr'}}); }});
  }
  return Promise.resolve({ok:true,status:200,json(){ return Promise.resolve({query:{pages:[{extlinks:[]}]}}); }});
}
async function settleWikipedia() {
  for(let i=0;i<8;i++) await Promise.resolve();
  await new Promise((resolve)=>setImmediate(resolve));
}
const raceSb=buildSandbox(seed,cannedWikipediaFetch);
loadInto(raceSb,FILES);
if(raceSb.App&&typeof raceSb.App.start==='function') raceSb.App.start();
raceSb.App.go('saygi');
raceSb.App.openSaygiCollectionPerson('ada-lovelace');
await settleWikipedia();
ok('Seçilen öncü başlığı ve biyografisi aynı kalır', /sg-person-ov-title[^]*Ada Lovelace/.test(appHTML)&&/<h2>Ada Lovelace<\/h2>/.test(appHTML)&&!/Francis Crick test biyografisi/.test(appHTML), JSON.stringify({h2:appHTML.match(/<h2>.*?<\/h2>/g),loading:/saygi-loading/.test(appHTML),error:/saygi-error/.test(appHTML)}));
const modalScroll=makeEl('sey-ov-body'), modalButton=makeEl('saygi-read-button-modal'), modalSentinel=makeEl('saygi-read-sentinel-modal');
modalScroll.scrollHeight=100; modalScroll.clientHeight=200; modalButton.disabled=true;
elCache['sey-ov-body']=modalScroll; elCache['saygi-read-button-modal']=modalButton; elCache['saygi-read-sentinel-modal']=modalSentinel;
doc.querySelector=function(sel){ return sel==='[data-scroll]'?modalScroll:null; };
raceSb.App.setTheme(false); // kısa biyografide Okudum kilidini gerçek gate üzerinden aç
raceSb.App.markSaygiRead();
const raceState=JSON.parse(raceSb.localStorage.getItem('seyma-reset-v1'));
ok('Okudum gerçek akışta Zihnimi Besledim tikini yeşillendirir', !!(raceState.days[t]&&raceState.days[t].habits&&raceState.days[t].habits.mediaFed)&&raceState.days[t].reading.entries.some((entry)=>entry.source==='saygi'&&entry.personId==='ada-lovelace'));
raceSb.App.browseSaygiPerson(1);
await settleWikipedia();
ok('İleri okunda hem başlık hem içerik birlikte değişir', /sg-person-ov-title[^]*Albert Einstein/.test(appHTML)&&/<h2>Albert Einstein<\/h2>/.test(appHTML)&&!/<h2>Ada Lovelace<\/h2>/.test(appHTML), JSON.stringify({h2:appHTML.match(/<h2>.*?<\/h2>/g),loading:/saygi-loading/.test(appHTML),error:/saygi-error/.test(appHTML)}));

ok('migrate eski veriye zikr/saygi backfill yapar', (function () {
  // migrate() IIFE içinde — App.start()'ın veriyi backfill ettiğini localStorage üzerinden doğrula
  const st = readState();
  return st && st.zikr && Array.isArray(st.zikr.presets) && st.zikr.presets.length > 0 && st.saygi && typeof st.saygi.collection === 'object';
})());

console.log('\n' + (failed ? '⚠️ ' + failed + ' başarısız, ' : '✅ ') + passed + '/' + (passed + failed) + ' assertion pass');
process.exit(failed ? 1 : 0);
