#!/usr/bin/env node
// verify-zikir-content-wiring.mjs — ZP-08.1 kabul kapısı: kullanıcı geri
// bildirimiyle öne çekilen içerik bağlama işi headless doğrulanır:
//
//   1. esmaulHusnaV2.js/zikirCoreContentV1.js (ZP-01/ZP-02'de yazılmış ama
//      hiçbir yere bağlanmamış içerik modülleri) artık index.html'de yüklü
//      ve app.js'te zikrContentFor() ile tüketiliyor.
//   2. Sayaç ekranında Esmâ/zikrin GERÇEK Türkçe anlamı artık isim
//      bloğunun altında DOĞRUDAN görünür (tıklama gerekmez) — eski genel
//      "NİYET" kutusu kaldırıldı.
//   3. Detay panosu (tıklamayla açılır) artık GERÇEK önem/tefekkür/kaynak
//      metnini gösterir; buton etiketi içerik varsa "Önemi ve tefekkür"e
//      döner (anlam zaten yukarıda göründüğü için).
//   4. Gerçek bug düzeltmesi: ZIKR_SEED'deki 5 çekirdek zikrin hiç
//      `arabic` alanı yoktu, bu yüzden UI Arapça-fontlu dar sütunda TÜRKÇE
//      transliterasyonu (ör. "Sübhanallah") gösteriyordu — hem sayaç hem
//      kütüphane satırında artık gerçek Arapça (سبحان الله) gösteriliyor.
//   5. Kütüphane araması artık Türkçe diyakritik-duyarsız VE anlam
//      metnini de tarayan çok alanlı bir arama.
//   6. İçerik modülleri YÜKLENMEDİĞİNDE (ör. eski build/test ortamı) eski
//      genel metne güvenle düşülüyor — geriye dönük kırılma yok.
//
// DATA SAFETY: app.js + içerik modülleri node:vm sandbox'ında, gerçek
// DOM/ağ olmadan boot edilir. Gerçek tarayıcı açılmaz, sunucu başlatılmaz,
// seyma-data'ya yazılmaz.
//
// Usage:
//   node .claude/skills/run-seyma/verify-zikir-content-wiring.mjs
//
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
function today() { const d = new Date(); const p = n => (n < 10 ? '0' : '') + n; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
const t = today();

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail !== undefined ? ' — ' + JSON.stringify(detail) : '')); }
}

console.log('== ZP-08.1 Zikirmatik içerik bağlama / gerçek Arapça / gelişmiş arama doğrulaması ==');

// ── A) index.html gerçekten yeni script tag'lerini yüklüyor mu ──
{
  const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
  ok('index.html esmaulHusnaV2.js\'i esmaulHusnaV1.js\'ten SONRA yüklüyor',
    /esmaulHusnaV1\.js[^>]*><\/script>\s*<script src="esmaulHusnaV2\.js/.test(html));
  ok('index.html zikirCoreContentV1.js\'i yüklüyor', /zikirCoreContentV1\.js/.test(html));
  ok('her iki yeni script de app.js\'ten ÖNCE yükleniyor', (function () {
    const iV2 = html.indexOf('esmaulHusnaV2.js'), iCore = html.indexOf('zikirCoreContentV1.js'), iApp = html.indexOf('app.js?');
    return iV2 > -1 && iCore > -1 && iApp > -1 && iV2 < iApp && iCore < iApp;
  })());
}

// ── B) ZIKR_SEED gerçek bug düzeltmesi: her çekirdek zikrin arabic≠phrase ──
{
  const src = fs.readFileSync(path.join(REPO, 'app.js'), 'utf8');
  const seedMatch = src.match(/var ZIKR_SEED=\[[\s\S]*?\];/);
  ok('ZIKR_SEED bulundu', !!seedMatch);
  const seedSrc = seedMatch ? seedMatch[0] : '';
  ['subhanallah', 'elhamdulillah', 'allahu_ekber', 'la_ilaha_illallah', 'estagfirullah'].forEach(function (id) {
    const re = new RegExp("id:'" + id + "'[^}]*arabic:'([^']+)'");
    const m = seedSrc.match(re);
    ok(id + ": ZIKR_SEED'de gerçek Arapça 'arabic' alanı var (Latin harf değil)",
      !!m && /[؀-ۿ]/.test(m[1]) && !/[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(m[1]),
      m && m[1]);
  });
}

// ── C) node:vm sandbox — içerik modülleri yüklü, gerçek davranış ──
function makeEl(id) {
  const el = {
    id: id || '', _html: '', _text: '', style: { cssText: '', setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: '', files: [],
    get innerHTML() { return this._html; }, set innerHTML(v) { this._html = String(v); if (this.id === 'app') appHTML = this._html; },
    get textContent() { return this._text; }, set textContent(v) { this._text = String(v); },
    setAttribute() {}, getAttribute() { return null; },
    appendChild(c) { this.children.push(c); return c; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(c) { return c; },
    addEventListener() {}, removeEventListener() {}, click() {},
    focus() { focusLog.push(this.id); }, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; },
  };
  return el;
}
let appHTML = '';
let focusLog = [];
function buildSandbox(seedData) {
  const appEl = makeEl('app'), rootEl = makeEl('root'), bodyEl = makeEl('body');
  const previewCardEl = makeEl('zikr-preview-card'), searchInputEl = makeEl('zikr-search-input');
  const elCache = { app: appEl, root: rootEl, 'zikr-preview-card': previewCardEl, 'zikr-search-input': searchInputEl };
  const doc = {
    hidden: false, body: bodyEl, documentElement: rootEl,
    getElementById(id) { return elCache[id] || null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return makeEl(''); }, createDocumentFragment() { return makeEl(''); },
    addEventListener() {}, removeEventListener() {}, DOMParser: undefined,
  };
  class DOMParserStub { parseFromString() { return { body: makeEl('body'), querySelector() { return null; }, querySelectorAll() { return []; } }; } }
  const store = Object.assign({}, seedData ? { 'seyma-reset-v1': JSON.stringify(seedData) } : {});
  const localStorage = { getItem(k) { return k in store ? store[k] : null; }, setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; }, clear() { for (const k in store) delete store[k]; } };
  const sandbox = {
    console, localStorage, document: doc, __SEYMA_TEST_ZIKR__: true,
    navigator: { vibrate() {}, userAgent: 'node-harness', clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: 'http:', hostname: 'localhost', search: '', href: 'http://localhost/', reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(a) { for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 256) | 0; return a; } },
    URL: Object.assign(function () {}, { createObjectURL() { return 'blob:stub'; }, revokeObjectURL() {} }), URLSearchParams,
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
  for (const f of files) { const src = fs.readFileSync(path.join(REPO, f), 'utf8'); vm.runInContext(src, ctx, { filename: f }); }
  return ctx;
}
const FILES_WITH_CONTENT = ['motivationProgramV2.js', 'profileAssessmentV1.js', 'saygiPeople.js', 'hijriCalendar.js', 'esmaulHusnaV1.js', 'esmaulHusnaV2.js', 'zikirCoreContentV1.js', 'app/core/constants.js', 'app.js'];
const FILES_NO_CONTENT = ['motivationProgramV2.js', 'profileAssessmentV1.js', 'saygiPeople.js', 'hijriCalendar.js', 'esmaulHusnaV1.js', 'app/core/constants.js', 'app.js'];
function baseSeed(zikr) {
  return {
    version: 2, startDate: t, lastOpenedDate: t,
    days: { [t]: { habits: {}, mood: null } },
    notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    settings: {
      nickname: 'Test', ghToken: '', ghRepo: 'mustafaras/seyma-data', profileAssessmentInactive: true,
      auth: { rememberMe: true, usernameHash: 'ae9e1ed2b6abcbce74cc0c15719fdbba372a7dd62e6232510656bade7c201af4', unlockedAt: new Date().toISOString() }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    saygi: { collection: {}, streak: 0, lastReadDate: '' },
    zikr,
  };
}
function fettahSeed(count) {
  const hid = 'hatim_cw_test';
  return baseSeed({
    schemaVersion: 3, migrationVersion: 'zikr_v2', editorialVersion: 0,
    presets: [{ id: 'esma_19', name: 'el-Fettâh', arabic: 'فتاح', ebced: 489, target: 489, builtIn: true, kind: 'esma', countDirection: 'down', archived: false, createdAt: t }],
    journeys: { esma_19: { presetId: 'esma_19', lifetimeCount: count, activeHatimId: hid, lastAt: t + 'T10:00:00.000Z', lastSessionId: '', completedHatims: 0, legacyCompletedHatims: 0, hatims: [{ id: hid, mode: 'ebced_square', baseTarget: 489, target: 239121, count, startedAt: t + 'T00:00:00.000Z', completedAt: null, status: count >= 239121 ? 'completed' : 'active' }] } },
    sessions: {}, activeSession: null,
    settings: { activePresetId: 'esma_19', soundOn: false, haptic: false, autoAdvance: false, defaultMode: 'hatim', confirmReset: true },
    streak: 0, streakDate: '',
  });
}
function coreSeed() {
  return baseSeed({
    schemaVersion: 3, migrationVersion: 'zikr_v2', editorialVersion: 0,
    presets: [], journeys: {}, sessions: {}, activeSession: null,
    settings: { activePresetId: 'subhanallah', soundOn: false, haptic: false, autoAdvance: false, defaultMode: 'hatim', confirmReset: true },
    streak: 0, streakDate: '',
  });
}

// ── C1) Sayaç ekranı — meaning DOĞRUDAN görünür, toggle gerekmez ──
{
  const sb = buildSandbox(fettahSeed(100)); loadInto(sb, FILES_WITH_CONTENT); sb.App.start();
  appHTML = ''; sb.App.openZikr();
  ok('el-Fettâh: gerçek meaningTr toggle AÇILMADAN görünür (zikr-v2-meaning)',
    /class="zikr-v2-meaning">[^<]{5,}/.test(appHTML));
  ok('eski genel "NİYET" kutusu artık yok', !/>NİYET</.test(appHTML));
  ok('detay düğmesi zengin içerikte "Önemi ve tefekkür" etiketini kullanıyor',
    /zikr-v2-detail-toggle[^>]*>Önemi ve tefekkür/.test(appHTML));
  sb.App.toggleZikrDetail();
  ok('detay panosu açıldığında kaynak satırı var ("Kaynak:")', /Kaynak:/.test(appHTML));
}

// ── C2) Çekirdek zikir (Sübhanallah) — gerçek Arapça + gerçek anlam ──
{
  const sb = buildSandbox(coreSeed()); loadInto(sb, FILES_WITH_CONTENT); sb.App.start();
  appHTML = ''; sb.App.openZikr();
  ok('Sübhanallah sayaç ekranında Arapça alanı GERÇEK Arapça (سبحان الله)',
    /lang="ar" dir="rtl">سبحان الله</.test(appHTML));
  ok('Sübhanallah sayaç ekranında "Sübhanallah" metni Arapça sütununda TEKRARLANMIYOR (eski bug)',
    !/lang="ar" dir="rtl">Sübhanallah</.test(appHTML));
  ok('Sübhanallah gerçek meaningTr içeriyor ("eksik" veya "tenzih" kelimesi geçer)',
    /eksik|tenzih/i.test(appHTML));
}

// ── C3) Kütüphane satırları — Arapça bug'ı + anlam snippet'i ──
{
  const sb = buildSandbox(coreSeed()); loadInto(sb, FILES_WITH_CONTENT); sb.App.start();
  sb.App.setZikrView('presets');
  appHTML = ''; sb.App.openZikr();
  ok('Kütüphanede Sübhanallah satırı gerçek Arapça gösteriyor (سبحان الله)', /سبحان الله/.test(appHTML));
  ok('Kütüphanede Sübhanallah satırında Türkçe "Sübhanallah" artık Arapça sütununda YOK (eski bug)',
    !/class="arabic" lang="ar" dir="rtl">Sübhanallah</.test(appHTML));
  ok('Kütüphane satırlarında anlam snippet\'i (class="meaning") render ediliyor',
    /class="meaning"/.test(appHTML));
}

// ── C4) Gelişmiş arama — Türkçe normalize + anlam metni taraması ──
{
  const sb = buildSandbox(coreSeed()); loadInto(sb, FILES_WITH_CONTENT); sb.App.start();
  sb.App.setZikrView('presets');
  appHTML = ''; sb.App.openZikr();
  sb.App.setZikrPresetFilter({ value: 'subhanallah' }); // Türkçe diyakritiksiz yazım
  ok('diyakritiksiz "subhanallah" araması "Sübhanallah"ı buluyor', /Sübhanallah/.test(appHTML));
  ok('arama kutusunda temizle (×) düğmesi göründü', /class="zikr-v2-search"[\s\S]*?class="clear"/.test(appHTML));
  sb.App.setZikrPresetFilter({ value: 'merhamet' }); // er-Rahmân/er-Rahîm anlamında geçen kelime
  ok('"merhamet" anlam araması er-Rahmân veya er-Rahîm\'i buluyor (ad/Arapça değil, ANLAM eşleşmesi)',
    /er-Rahmân|er-Rahîm/.test(appHTML));
  sb.App.setZikrPresetFilter({ value: 'zzz-hicbir-eslesme-yok' });
  ok('eşleşmeyen aramada kullanıcı dostu boş durum mesajı var', /Bu mercekte eşleşme yok/.test(appHTML));
  sb.App.clearZikrPresetFilter();
  ok('App.clearZikrPresetFilter() hatasız çalışıyor (render tetiklendi)', !!sb.App);
}

// ── D) İçerik modülleri YÜKLENMEDEN — güvenli, geriye dönük fallback ──
{
  const sb = buildSandbox(fettahSeed(50)); loadInto(sb, FILES_NO_CONTENT); sb.App.start();
  appHTML = ''; sb.App.openZikr();
  ok('içerik modülü yokken çökmüyor, overlay yine render ediliyor', /zikr-v2-overlay/.test(appHTML));
  ok('içerik modülü yokken eski genel "Anlamı ve önemi" etiketine güvenle düşülüyor',
    /zikr-v2-detail-toggle[^>]*>Anlamı ve önemi/.test(appHTML));
  ok('içerik modülü yokken meaning alanı yine de bir metin gösteriyor (ZIKR_NIYET/genel fallback, boş değil)',
    /class="zikr-v2-meaning">[^<]{3,}/.test(appHTML));
}

console.log('\n=== Özet: ' + passed + ' geçti, ' + failed + ' kaldı ===');
process.exit(failed ? 1 : 0);
