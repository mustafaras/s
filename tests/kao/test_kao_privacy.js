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
  const csvData = { quranLearn: { cards: { ['w:' + lemmaId + ':ar>tr']: { reps: 1 } } } };
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

console.log('KAO privacy: PASS (CSV yalnız yerel Blob + URL iptali, ağ/depo yok, assets/kao-only ses, preload none, fail-soft sessiz mod)');
