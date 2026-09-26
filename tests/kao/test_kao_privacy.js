'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const relative = 'app/core/quranLearn.js';
const source = fs.readFileSync(path.join(repoRoot, relative), 'utf8');
assert.doesNotMatch(source, /\bfetch\s*\(|\blocalStorage\b|\bSeySync\b/, 'KAO çekirdeği ağ/depo/senkron sınırına dokunmamalı');

const sandbox = { window: {}, Date, Math, Number, String, Object, Array, JSON };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranLexiconV1.js'), 'utf8'), sandbox);
vm.runInContext(source, sandbox, { filename: relative });
const api = sandbox.window.SeymaQuranLearn;
const data = { quranLearn: null };
const ui = { kaoAudioFailed: false };
assert.equal(api.registerQuranLearn({
  data() { return data; }, ui() { return ui; }, save() {}, render() {}, todayStr() { return '2026-09-24'; }, esc(value) { return String(value); }, icon() { return ''; }, getDay() { return {}; }
}), true);
api.ensureQuranLearn(data);
const created = [];
assert.equal(api.registerQuranLearnSurface({
  lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return ''; }, restoreFocus() {}, sheetClose(_card, _back, body) { body(); }, mount() {},
  taskElement() { return null; },
  createAudio(src) {
    const listeners = {};
    const audio = { src, preload: 'auto', addEventListener(name, fn) { listeners[name] = fn; }, play() { if (listeners.error) listeners.error(); throw new Error('fixture load failure'); } };
    created.push(audio);
    return audio;
  },
  isQuietTime() { return false; }, setTimer() { return 1; }, clearTimer() {}
}), true);

assert.equal(api.kaoPlay('../token', 'measured'), false, 'yol kaçışı reddedilmeli');
assert.equal(created.length, 0);
const audio = api.kaoPlay('w-l_min_1f6fa6', 'flowing');
assert.ok(audio);
assert.equal(created.length, 1);
assert.equal(created[0].src, 'assets/kao/audio/w-l_min_1f6fa6-flowing.m4a');
assert.equal(created[0].preload, 'none', 'R-C5: ilk açılışta ses indirmemeli');
assert.equal(ui.kaoAudioFailed, true, 'yükleme hatası sessiz moda düşmeli');
assert.ok(created.every((item) => /^assets\/kao\/audio\/[A-Za-z0-9_-]+\.m4a$/.test(item.src)), 'ses yalnız paketli same-origin varlıktan gelmeli');


// KAO-17 · R-C4: CSV yalnız yerel Blob; ağ yok; Blob URL indirme sonrası iptal edilir.
{
  const exportSource = source.slice(source.indexOf('function kaoExportCsv'), source.indexOf('function kaoSegHTML'));
  assert.doesNotMatch(exportSource, /fetch|XMLHttpRequest|sendBeacon|save\(|SeymaSave|localStorage/, 'CSV dışa aktarma ağ/depo kullanmaz');
  const blobs = [], created = [], revoked = [], timers = [], links = [];
  const box = { window: {}, Date, Math, Number, String, Object, Array, JSON };
  box.window.Blob = function Blob(parts, options) { this.parts = parts; this.type = options && options.type; blobs.push(this); };
  box.window.URL = { createObjectURL(blob) { created.push(blob); return 'blob:kao-' + created.length; }, revokeObjectURL(url) { revoked.push(url); } };
  vm.createContext(box);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranLexiconV1.js'), 'utf8'), box);
  vm.runInContext(source, box, { filename: relative });
  const csvApi = box.window.SeymaQuranLearn;
  const lemmaId = box.window.QuranLexiconV1.lemmas[0].id;
  const csvData = { quranLearn: { cards: { ['w:' + lemmaId + ':ar>tr']: { state: 'review', s: 21, reps: 6 }, ['w:' + lemmaId + ':tr>ar']: { state: 'review', s: 21, reps: 6 } } } };
  const csvUi = {};
  assert.equal(csvApi.registerQuranLearn({ data() { return csvData; }, ui() { return csvUi; }, save() { throw new Error('CSV kaydetmemeli'); }, render() {}, todayStr() { return '2026-09-25'; }, esc(value) { return String(value); }, icon() { return ''; }, getDay() { return {}; } }), true);
  assert.equal(csvApi.kaoExportCsv(), false, 'yüzey bağımlılığı yokken indirme yok');
  assert.equal(csvApi.registerQuranLearnSurface({ lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return ''; }, restoreFocus() {}, sheetClose(_c, _b, body) { body(); }, mount() {}, createLink() { const link = { clicked: 0, click() { this.clicked += 1; } }; links.push(link); return link; }, setTimer(fn, ms) { timers.push({ fn, ms }); return timers.length; }, clearTimer() {} }), true);
  assert.equal(csvApi.kaoExportCsv(), true);
  assert.equal(blobs.length, 1); assert.equal(blobs[0].type, 'text/csv;charset=utf-8');
  assert.ok(blobs[0].parts[0].startsWith('﻿ar,tr,translit,root,tags\r\n'), 'UTF-8 BOM + Anki başlığı');
  assert.equal(links[0].href, 'blob:kao-1'); assert.equal(links[0].download, 'kuran-kelimelerim-2026-09-25.csv'); assert.equal(links[0].clicked, 1);
  assert.deepEqual(revoked, [], 'indirme başlamadan URL iptal edilmez');
  assert.equal(timers.length, 1); timers[0].fn();
  assert.deepEqual(revoked, ['blob:kao-1'], 'Blob URL iptal edilir');
  assert.equal(csvUi.kaoSettingsNote, '1 kelime CSV olarak indirildi.');
  // Yüzey tek kez kurulur; tıklama hatası yolu ayrı bağlamda sınanır.
  const failBox = { window: { Blob: box.window.Blob, URL: box.window.URL }, Date, Math, Number, String, Object, Array, JSON };
  vm.createContext(failBox);
  vm.runInContext(source, failBox, { filename: relative });
  const failApi = failBox.window.SeymaQuranLearn;
  assert.equal(failApi.registerQuranLearn({ data() { return csvData; }, ui() { return csvUi; }, save() {}, render() {}, todayStr() { return '2026-09-25'; }, esc(value) { return String(value); }, icon() { return ''; }, getDay() { return {}; } }), true);
  assert.equal(failApi.registerQuranLearnSurface({ lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return ''; }, restoreFocus() {}, sheetClose(_c, _b, body) { body(); }, mount() {}, createLink() { return { click() { throw new Error('engellendi'); } }; }, setTimer() { throw new Error('zamanlayıcı çağrılmamalı'); } }), true);
  assert.equal(failApi.kaoExportCsv(), false);
  assert.equal(revoked[revoked.length - 1], 'blob:kao-' + created.length, 'hata yolunda da URL hemen iptal edilir');
  assert.equal(csvUi.kaoSettingsNote, 'CSV indirilemedi; tekrar dene.');
  const injected = csvApi.kaoCsv({ quranLearn: { cards: {} } });
  assert.equal(injected, 'ar,tr,translit,root,tags\r\n', 'bilinen kart yoksa yalnız başlık');
}


// KAO-27 · D-10 gölgeleme: ayar kapalıyken mikrofon API'si hiç çağrılmaz; kayıt yalnız bellekte.
{
  const shadowSource = source.slice(source.indexOf('// KAO-27 · Gölgeleme'), source.indexOf('function kaoToggleShadowing'));
  assert.ok(shadowSource.includes('MediaRecorder') && shadowSource.includes('getUserMedia'));
  assert.doesNotMatch(shadowSource, /save\(|SeymaSave|localStorage|sessionStorage|indexedDB|SeySync|fetch|\.data\(\)/, 'kayıt bloğu data/depo/senkron/ağa dokunmaz');
  let userMedia = 0, denied = false, stoppedTracks = 0;
  const recorders = [], created = [], revoked = [], timers = [], audios = [];
  const box = { window: {}, Date, Math, Number, String, Object, Array, JSON, Promise };
  box.window.navigator = { mediaDevices: { getUserMedia(constraints) { userMedia += 1; assert.deepEqual(JSON.parse(JSON.stringify(constraints)), { audio: true }); return denied ? Promise.reject(new Error('NotAllowedError')) : Promise.resolve({ getTracks() { return [{ stop() { stoppedTracks += 1; } }]; } }); } } };
  box.window.MediaRecorder = function MediaRecorder(stream) { const listeners = {}; this.state = 'inactive'; this.mimeType = 'audio/mp4'; this.addEventListener = (name, fn) => { listeners[name] = fn; }; this.start = () => { this.state = 'recording'; }; this.stop = () => { this.state = 'inactive'; listeners.dataavailable({ data: { size: 4 } }); listeners.stop(); }; recorders.push(this); };
  box.window.Blob = function Blob(parts, options) { this.parts = parts; this.type = options.type; };
  box.window.URL = { createObjectURL(blob) { created.push(blob); return 'blob:shadow-' + created.length; }, revokeObjectURL(url) { revoked.push(url); } };
  vm.createContext(box);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/content/quranLexiconV1.js'), 'utf8'), box);
  vm.runInContext(source, box, { filename: relative });
  const shadowApi = box.window.SeymaQuranLearn;
  const shadowData = { settings: {}, quranLearn: null }, shadowUi = { kaoOpen: true, kaoView: 'phonics' };
  let saves = 0;
  assert.equal(shadowApi.registerQuranLearn({ data() { return shadowData; }, ui() { return shadowUi; }, save() { saves += 1; }, render() {}, todayStr() { return '2026-09-25'; }, esc(value) { return String(value); }, icon() { return ''; }, getDay() { return {}; } }), true);
  assert.equal(shadowApi.registerQuranLearnSurface({ lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return ''; }, restoreFocus() {}, sheetClose(_c, _b, body) { body(); }, mount() {},
    createAudio(src) { const listeners = {}; const audio = { src, preload: 'auto', addEventListener(name, fn) { listeners[name] = fn; }, play() { audios.push(src); if (listeners.ended) listeners.ended(); return { catch() {} }; } }; return audio; },
    setTimer(fn, ms) { timers.push({ fn, ms, cleared: false }); return timers.length; }, clearTimer(id) { if (timers[id - 1]) timers[id - 1].cleared = true; } }), true);
  const q = shadowApi.ensureQuranLearn(shadowData);
  const clip = 'w-' + box.window.QuranLexiconV1.lemmas[0].id;
  const flush = () => new Promise((resolve) => setImmediate(resolve));

  (async () => {
    assert.equal(q.settings.shadowing, false, 'D-10: varsayılan kapalı');
    assert.equal(shadowApi.kaoRecordStart(clip), false);
    assert.equal(userMedia, 0, 'ayar kapalıyken mikrofon API çağrılmaz');
    assert.match(shadowApi.kaoShadowHTML(clip), /Gölgeleme kapalı/);
    assert.equal(shadowApi.kaoToggleShadowing(), true); assert.equal(q.settings.shadowing, true);
    const savesBefore = saves, dataBefore = JSON.stringify(shadowData);
    assert.equal(shadowApi.kaoRecordStart('../x'), false, 'yalnız paketli klip kimliği');
    assert.equal(shadowApi.kaoRecordStart(clip), true);
    assert.deepEqual(audios, [`assets/kao/audio/${clip}-measured.m4a`, `assets/kao/audio/${clip}-measured.m4a`], 'model iki kez');
    await flush();
    assert.equal(userMedia, 1); assert.equal(shadowUi.kaoShadow.phase, 'recording');
    assert.equal(timers[0].ms, 10000, 'en çok 10 sn');
    timers[0].fn();
    assert.equal(shadowUi.kaoShadow.phase, 'recorded'); assert.equal(shadowUi.kaoShadow.url, 'blob:shadow-1');
    assert.equal(stoppedTracks, 1, 'kayıt bitince mikrofon kapanır');
    assert.match(shadowApi.kaoShadowHTML(clip), /App\.kaoRecordPlay\('self'\)[\s\S]*App\.kaoRecordDiscard\('near'\)[\s\S]*App\.kaoRecordDiscard\('again'\)/);
    assert.equal(shadowApi.kaoRecordPlay('self'), true); assert.equal(audios[audios.length - 1], 'blob:shadow-1');
    assert.equal(saves, savesBefore, 'kayıt akışı save çağırmaz'); assert.equal(JSON.stringify(shadowData), dataBefore, 'data değişmez');
    assert.doesNotMatch(JSON.stringify(shadowData), /blob:/);
    assert.equal(shadowApi.kaoRecordDiscard('again'), true); assert.deepEqual(revoked, ['blob:shadow-1'], 'tekrar: önceki kayıt iptal');
    await flush(); assert.equal(shadowUi.kaoShadow.phase, 'recording'); assert.equal(userMedia, 2);
    assert.equal(shadowApi.kaoRecordStop(), true); assert.equal(timers[1].cleared, true);
    assert.equal(shadowUi.kaoShadow.url, 'blob:shadow-2');
    shadowApi.kaoClose();
    assert.equal(shadowUi.kaoShadow, null); assert.deepEqual(revoked, ['blob:shadow-1', 'blob:shadow-2'], 'overlay kapanınca revoke');
    shadowUi.kaoOpen = true; denied = true;
    shadowApi.kaoRecordStart(clip); await flush();
    assert.equal(shadowUi.kaoShadow.phase, 'denied'); assert.match(shadowApi.kaoShadowHTML(clip), /izni verilmedi/);
    shadowApi.kaoRecordDiscard(); assert.equal(shadowUi.kaoShadow, null);
    denied = false; shadowApi.kaoRecordStart(clip); await flush();
    shadowApi.kaoToggleShadowing();
    assert.equal(shadowUi.kaoShadow, null, 'ayar kapatılınca kayıt anında atılır'); assert.equal(q.settings.shadowing, false);
    const mediaCalls = userMedia; assert.equal(shadowApi.kaoRecordStart(clip), false); assert.equal(userMedia, mediaCalls);
    delete box.window.MediaRecorder; shadowApi.kaoToggleShadowing(); shadowApi.kaoRecordStart(clip); await flush();
    assert.equal(shadowUi.kaoShadow.phase, 'unsupported'); assert.equal(userMedia, mediaCalls, 'desteksiz cihazda izin istenmez');
    console.log('KAO privacy · gölgeleme: PASS (varsayılan kapalı, 0 mikrofon çağrısı, model 2×, ≤10 sn, data/save yok, revoke)');
  })().catch((error) => { console.error(error); process.exit(1); });
}

console.log('KAO privacy: PASS (CSV yalnız yerel Blob + URL iptali, ağ/depo yok, assets/kao-only ses, preload none, fail-soft sessiz mod)');
