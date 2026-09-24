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

console.log('KAO privacy: PASS (ağ/depo yok, assets/kao-only ses, preload none, fail-soft sessiz mod)');
