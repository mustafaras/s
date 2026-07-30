#!/usr/bin/env node
// verify-zikir-migration-v3.mjs — ZP-04 kabul kapısı: data.zikr V3 şema
// yükseltmesinin (editorialVersion, journeys/hatims/sessions/activeSession/
// settings ayrımı, orphan preset arşivleme) BOŞ/V1/V2/kısmi/bozuk kayıt
// fixture'larında kayıpsız ve idempotent çalıştığını headless doğrular.
//
// DATA SAFETY: app.js + yardımcı modüller `node:vm` sandbox'ında, gerçek
// DOM/ağ olmadan boot edilir (zikr-harness.mjs ile birebir aynı buildSandbox/
// loadInto deseni — localStorage yalnız bellek içi bir stub). Gerçek tarayıcı
// açılmaz, sunucu başlatılmaz, seyma-data'ya yazılmaz.
//
// Usage:
//   node .claude/skills/run-seyma/verify-zikir-migration-v3.mjs
//
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function today() { const d = new Date(); const p = n => (n < 10 ? '0' : '') + n; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
function yesterday() { const d = new Date(Date.now() - 864e5); const p = n => (n < 10 ? '0' : '') + n; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
const t = today(), y = yesterday();

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail ? ' — ' + JSON.stringify(detail) : '')); }
}

// ── zikr-harness.mjs ile birebir aynı sandbox deseni ──
function makeEl(id) {
  const el = {
    id: id || '', _html: '', _text: '', style: { cssText: '', setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: '', files: [],
    get innerHTML() { return this._html; }, set innerHTML(v) { this._html = String(v); },
    get textContent() { return this._text; }, set textContent(v) { this._text = String(v); },
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
const appEl = makeEl('app'), rootEl = makeEl('root');
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
  return { getItem(k) { return k in store ? store[k] : null; }, setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; }, clear() { for (const k in store) delete store[k]; }, _store: store };
}
function buildSandbox(seedData) {
  const seed = seedData ? { 'seyma-reset-v1': JSON.stringify(seedData) } : {};
  const localStorage = makeLS(seed);
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
const FILES = ['motivationProgramV2.js', 'profileAssessmentV1.js', 'saygiPeople.js', 'hijriCalendar.js', 'esmaulHusnaV1.js', 'app.js'];

function baseSeed(zikr) {
  return {
    version: 2, startDate: y, lastOpenedDate: y,
    days: { [t]: { habits: {}, mood: null }, [y]: { habits: {}, mood: null } },
    notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    settings: { nickname: 'Test', ghToken: '', ghRepo: 'mustafaras/seyma-data' },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    saygi: { collection: {}, streak: 0, lastReadDate: '' },
    zikr,
  };
}
function boot(seedObj) {
  const sb = buildSandbox(seedObj);
  loadInto(sb, FILES);
  sb.App.start();
  return { sb, data: JSON.parse(sb.localStorage.getItem('seyma-reset-v1')) };
}
function esmaFettahPreset() {
  return { id: 'esma_19', name: 'el-Fettâh', arabic: 'فتاح', ebced: 489, target: 489, builtIn: true, kind: 'esma', countDirection: 'down', createdAt: t };
}

console.log('== ZP-04 V3 şema / kayıpsız migration doğrulaması ==');

// ── 1) BOŞ fixture: hiç zikir verisi yok ──
{
  const seedObj = baseSeed(undefined);
  delete seedObj.zikr;
  const { data } = boot(seedObj);
  ok('Boş fixture: zikr root otomatik oluşur, schemaVersion=3', data.zikr && data.zikr.schemaVersion === 3);
  ok('Boş fixture: editorialVersion=0', data.zikr.editorialVersion === 0);
  ok('Boş fixture: 104 preset (5 çekirdek + 99 Esmâ), hiçbiri archived değil', data.zikr.presets.length === 104 && data.zikr.presets.every(p => p.archived === false));
  ok('Boş fixture: journeys boş', Object.keys(data.zikr.journeys).length === 0);
}

// ── 2) V1 fixture: eski düz sayı formatı, hiç schemaVersion/migrationVersion/journeys yok ──
{
  const seedObj = baseSeed({
    presets: [esmaFettahPreset()],
    sessions: { [y]: { totalCount: 300, completedSets: 0, perPreset: { esma_19: 300 } }, [t]: { totalCount: 250, completedSets: 0, perPreset: { esma_19: 250 } } },
    settings: { activePresetId: 'esma_19', soundOn: false, haptic: true, autoAdvance: false },
    streak: 1, streakDate: y,
  });
  const { data } = boot(seedObj);
  const j = data.zikr.journeys.esma_19;
  ok('V1 fixture: schemaVersion=3, migrationVersion=zikr_v2', data.zikr.schemaVersion === 3 && data.zikr.migrationVersion === 'zikr_v2');
  ok('V1 fixture: editorialVersion=0 eklendi', data.zikr.editorialVersion === 0);
  ok('V1 fixture: iki günün toplamı (550) lifetimeCount\'a kayıpsız taşındı', j && j.lifetimeCount === 550);
  ok('V1 fixture: aktif hatim oluştu (esma, hedef altında)', j && j.activeHatimId && j.hatims.length === 1 && j.hatims[0].count === 550);
  ok('V1 fixture: aktif preset korundu', data.zikr.settings.activePresetId === 'esma_19');

  // ikinci boot (aynı migrated veriyle) — idempotent olmalı, toplam ARTMAMALI
  const { data: data2 } = boot(data);
  const j2 = data2.zikr.journeys.esma_19;
  ok('V1→V3 migration idempotent: ikinci boot lifetimeCount\'u artırmıyor', j2.lifetimeCount === 550);
  ok('V1→V3 migration idempotent: hatim sayısı değişmiyor', j2.hatims.length === 1 && j2.hatims[0].count === 550);
  ok('İki ardışık migration derin eşdeğer (zikr kısmı)', JSON.stringify(data.zikr) === JSON.stringify(data2.zikr));
}

// ── 3) V2 fixture: zaten tam V2 şeması (journeys/hatims dolu) — V3 yalnız EKLEME yapmalı ──
{
  const hid = 'hatim_v2_test';
  const seedObj = baseSeed({
    schemaVersion: 2, migrationVersion: 'zikr_v2',
    presets: [esmaFettahPreset()],
    journeys: {
      esma_19: {
        presetId: 'esma_19', lifetimeCount: 8445, activeHatimId: hid, lastAt: t + 'T10:00:00.000Z',
        lastSessionId: 'zs_1', completedHatims: 0, legacyCompletedHatims: 0,
        hatims: [{ id: hid, mode: 'ebced_square', baseTarget: 489, target: 239121, count: 8445, startedAt: y + 'T00:00:00.000Z', completedAt: null, status: 'active' }],
      },
    },
    sessions: { [t]: { totalCount: 132, completedSets: 1, perPreset: { esma_19: { count: 132, completedCycles: 1, lastAt: t + 'T10:00:00.000Z' } }, lastAt: t + 'T10:00:00.000Z' } },
    activeSession: null,
    settings: { activePresetId: 'esma_19', soundOn: false, haptic: true, autoAdvance: false, defaultMode: 'hatim' },
    streak: 3, streakDate: t,
  });
  const before = JSON.parse(JSON.stringify(seedObj.zikr));
  const { data } = boot(seedObj);
  const j = data.zikr.journeys.esma_19, h = j.hatims[0];
  ok('V2 fixture: schemaVersion 2 → 3', data.zikr.schemaVersion === 3);
  ok('V2 fixture: editorialVersion V3 alanı eklendi', data.zikr.editorialVersion === 0);
  ok('V2 fixture: lifetimeCount DEĞİŞMEDİ (8445)', j.lifetimeCount === before.journeys.esma_19.lifetimeCount);
  ok('V2 fixture: aktif hatim id/count DEĞİŞMEDİ', h.id === hid && h.count === before.journeys.esma_19.hatims[0].count);
  ok('V2 fixture: aktif preset ve aktif hatim korundu', data.zikr.settings.activePresetId === 'esma_19' && j.activeHatimId === hid);
  ok('V2 fixture: günlük toplam (132) korundu', data.zikr.sessions[t].totalCount === 132);
  ok('V2 fixture: streak (3) korundu', data.zikr.streak === 3);
  ok('V2 fixture: preset archived=false eklendi', data.zikr.presets.find(p => p.id === 'esma_19').archived === false);
}

// ── 4) KISMİ fixture: eksik/yarım alt alanlar (hatims yok, completedHatims yok, settings yarım, activeSession bozuk) ──
{
  const seedObj = baseSeed({
    schemaVersion: 2, migrationVersion: 'zikr_v2',
    presets: [esmaFettahPreset()],
    journeys: { esma_19: { presetId: 'esma_19', lifetimeCount: 150 } }, // hatims, activeHatimId, completedHatims YOK
    sessions: {},
    activeSession: 'BOZUK_STRING_DEGIL_OBJE',
    settings: { soundOn: true }, // haptic/autoAdvance/keepAwake/reducedMotion/breathGuide/confirmReset/focusMode/activePresetId YOK
    streak: 0, streakDate: '',
  });
  const { data } = boot(seedObj);
  const j = data.zikr.journeys.esma_19;
  ok('Kısmi fixture: çökmeden migrate oldu', !!data.zikr);
  ok('Kısmi fixture: eksik lifetimeCount korunuyor (150)', j.lifetimeCount === 150);
  ok('Kısmi fixture: eksik hatims[] güvenli []', Array.isArray(j.hatims) && j.hatims.length === 0);
  ok('Kısmi fixture: eksik completedHatims güvenli 0', j.completedHatims === 0);
  ok('Kısmi fixture: eksik activeHatimId güvenli ""', j.activeHatimId === '');
  ok('Kısmi fixture: bozuk activeSession güvenle null\'landı', data.zikr.activeSession === null);
  ok('Kısmi fixture: eksik settings alanları varsayılanla dolduruldu',
    typeof data.zikr.settings.haptic === 'boolean' && typeof data.zikr.settings.reducedMotion === 'boolean' &&
    typeof data.zikr.settings.confirmReset === 'boolean' && typeof data.zikr.settings.activePresetId === 'string' && !!data.zikr.settings.activePresetId);
}

// ── 5) BOZUK fixture: okunamaz hatim kayıtları, çakışan id, geçersiz activeHatimId, orphan+custom preset, çöp journey ──
{
  const seedObj = baseSeed({
    schemaVersion: 2, migrationVersion: 'zikr_v2',
    presets: [
      esmaFettahPreset(),
      { id: 'esma_100_removed', name: 'Eski İsim', arabic: 'قديم', ebced: 77, builtIn: true, kind: 'esma', countDirection: 'down', createdAt: t }, // artık katalogda yok
      { id: 'custom_1', name: 'Benim Zikrim', phrase: 'La havle', target: 50, builtIn: false, kind: 'custom', createdAt: t }, // kullanıcı özel preseti
    ],
    journeys: {
      esma_19: {
        presetId: 'esma_19', lifetimeCount: 550, activeHatimId: 'nonexistent_id', lastAt: t + 'T12:00:00.000Z',
        lastSessionId: 'zs_x', completedHatims: 1, legacyCompletedHatims: 1,
        hatims: [
          null, 'garbage_string',
          { id: 'h1', count: '250', status: 'weird', baseTarget: 'abc', startedAt: 123 },
          { id: 'h1', count: 300, status: 'active' }, // h1 ile çakışan id
        ],
      },
      garbage_journey: 'not_an_object',
    },
    sessions: {},
    activeSession: null,
    settings: { activePresetId: 'esma_19', soundOn: false, haptic: true, autoAdvance: false },
    streak: 0, streakDate: '',
  });
  const { data } = boot(seedObj);
  const j = data.zikr.journeys.esma_19;
  ok('Bozuk fixture: çökmeden migrate oldu', !!data.zikr);
  ok('Bozuk fixture: çöp journey anahtarı silindi', !('garbage_journey' in data.zikr.journeys));
  ok('Bozuk fixture: lifetimeCount/completedHatims DEĞİŞMEDİ (550/1)', j.lifetimeCount === 550 && j.completedHatims === 1);
  ok('Bozuk fixture: okunamaz (null/string) hatim kayıtları elendi, 2 geçerli hatim kaldı', j.hatims.length === 2);
  ok('Bozuk fixture: çakışan id yeni benzersiz id aldı (2 farklı id)', new Set(j.hatims.map(h => h.id)).size === 2);
  ok('Bozuk fixture: string count güvenle sayıya çevrildi (250)', j.hatims.some(h => h.count === 250));
  ok('Bozuk fixture: ikinci (duplicate) hatim count\'u korundu (300)', j.hatims.some(h => h.count === 300));
  ok('Bozuk fixture: geçersiz activeHatimId sıfırlandı ("")', j.activeHatimId === '');
  ok('Bozuk fixture: bozuk baseTarget güvenli varsayılana düştü (489)', j.hatims.every(h => h.baseTarget === 489));
  const orphan = data.zikr.presets.find(p => p.id === 'esma_100_removed');
  ok('Bozuk fixture: katalogdan düşen built-in preset SİLİNMEDİ, archived=true işaretlendi', !!orphan && orphan.archived === true);
  const custom = data.zikr.presets.find(p => p.id === 'custom_1');
  ok('Bozuk fixture: bilinmeyen/custom preset korundu ve archived=false (otomatik arşivlenmedi)', !!custom && custom.archived === false);

  // idempotency: aynı (artık migrate edilmiş) veriyi tekrar boot et
  const { data: data2 } = boot(data);
  ok('Bozuk fixture ikinci migration idempotent (zikr kısmı derin eşdeğer)', JSON.stringify(data.zikr) === JSON.stringify(data2.zikr));
}

// ── 6) panel.html eksik V3 alanında (editorialVersion/archived yok) kırılmaz ──
{
  const panelSrc = fs.readFileSync(path.join(REPO, 'panel.html'), 'utf8');
  function extract(re, label) { const m = panelSrc.match(re); if (!m) throw new Error('panel.html\'den çıkarılamadı: ' + label); return m[0]; }
  const ZIKR_SEED_P_SRC = extract(/var ZIKR_SEED_P=\[[\s\S]*?\];/, 'ZIKR_SEED_P');
  const zikrRootP_SRC = extract(/function zikrRootP\(\)\{[\s\S]*?\n\}/, 'zikrRootP');
  const zikrPresetP_SRC = extract(/function zikrPresetP\(id\)\{[\s\S]*?\n\}/, 'zikrPresetP');
  const zikrJourneySummaryP_SRC = extract(/function zikrJourneySummaryP\(\)\{[\s\S]*?\n\}/, 'zikrJourneySummaryP');
  const panelSandbox = { console, D: null };
  const panelCtx = vm.createContext(panelSandbox);
  vm.runInContext([ZIKR_SEED_P_SRC, zikrRootP_SRC, zikrPresetP_SRC, zikrJourneySummaryP_SRC].join('\n'), panelCtx, { filename: 'panel.html (extracted)' });

  // V3-öncesi şekil: editorialVersion/archived YOK — panel bu alanlara hiç bakmıyor olmalı
  panelSandbox.D = {
    zikr: {
      settings: { activePresetId: 'esma_19' },
      presets: [{ id: 'esma_19', kind: 'esma', ebced: 489, name: 'el-Fettâh' }], // archived alanı YOK
      journeys: { esma_19: { activeHatimId: 'h1', hatims: [{ id: 'h1', count: 8445 }], completedHatims: 0, lifetimeCount: 0 } },
      // editorialVersion alanı YOK
    },
  };
  let panelResult, threw = false;
  try { panelResult = panelCtx.zikrJourneySummaryP(); } catch (e) { threw = true; }
  ok('panel.html V3 alanları (editorialVersion/archived) olmadan çökmüyor', !threw);
  ok('panel.html eksik V3 alanında doğru sonucu üretmeye devam ediyor', panelResult && panelResult.count === 8445 && panelResult.cyclePosition === 132);
}

console.log(failed === 0 ? `\n✅ Tüm kontroller PASS (${passed}/${passed})` : `\n❌ ${failed} kontrol FAIL (${passed} geçti)`);
process.exitCode = failed === 0 ? 0 : 1;
