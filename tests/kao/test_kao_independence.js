'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const source = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');
for (const forbidden of [
  /SeymaSaygi/, /app\/core\/saygi/, /archive\/ilham-ibadet-premium-plan/,
  /data\.saygi/, /data\.zikr/, /data\.prayer/, /data\.quranJourney/
]) assert.ok(!forbidden.test(source), `bağımsızlık ihlali: ${forbidden}`);
assert.ok(!/\b(?:localStorage|sessionStorage|indexedDB|XMLHttpRequest|fetch)\b/.test(source), 'registry ağ/depo API içermemeli');
let loadEffects = 0;
const sandbox = {
  window: {},
  document: new Proxy({}, { get() { loadEffects += 1; throw new Error('load-time DOM access'); } }),
  setTimeout() { loadEffects += 1; throw new Error('load-time timer'); },
  setInterval() { loadEffects += 1; throw new Error('load-time timer'); },
  requestAnimationFrame() { loadEffects += 1; throw new Error('load-time animation'); }
};
vm.runInContext(source, vm.createContext(sandbox), { filename: 'app/core/quranLearn.js' });
assert.equal(loadEffects, 0, 'registry yüklenirken DOM/timer etkisi açmamalı');
assert.equal(typeof sandbox.window.SeymaQuranLearn.kaoHubCardHTML, 'function');

// KAO-21 · hub bileşimi isteğe bağlı: kaoHubCardHTML yokken saygiHTML çıktısı bayt-eşit; varken tek kez, Kur'an Yolculuğu kartının ardından.
function saygiRender(kao) {
  const box = { window: {}, Date, Math, JSON, Object, Array, String, Number };
  vm.createContext(box);
  for (const relative of ['app/content/saygiPeople.js', 'app/core/saygi.js']) vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), box, { filename: relative });
  const deps = { data: () => ({ saygi: {}, days: {}, settings: {}, startDate: '2026-06-24' }), ui: () => ({ faithTab: 'oz' }), getDay: () => ({}), todayStr: () => '2026-09-26', addDays: (value) => value, diffDays: () => 0, dayIndexFor: () => 1, dateLabelTR: (value) => value, icon: (name) => `<i ${name}>`, esc: String, featuresLive: () => true, render() {}, quranJourneyHubCardHTML: () => '<qy-hub/>', zikrVisible: () => true, zikrPreviewCardHTML: () => '' };
  if (kao !== undefined) deps.kaoHubCardHTML = () => kao;
  assert.equal(box.window.SeymaSaygi.registerSaygi(deps), true, 'kaoHubCardHTML zorunlu bağımlılık değildir');
  return box.window.SeymaSaygi.saygiHTML();
}
const withoutKao = saygiRender(), emptyKao = saygiRender(''), probeKao = saygiRender('<kao-probe/>');
assert.ok(withoutKao.length > 1000 && withoutKao.includes('<qy-hub/>'));
assert.equal(emptyKao, withoutKao, 'kaoHubCardHTML boş/yokken saygiHTML bayt-eşit');
assert.equal(probeKao.split('<kao-probe/>').length - 1, 1); assert.ok(probeKao.includes('<qy-hub/><kao-probe/>'), 'bileşim quranHub() sonrası');
const saygiSource = fs.readFileSync(path.join(repoRoot, 'app/core/saygi.js'), 'utf8');
assert.equal((saygiSource.match(/kaoHub/g) || []).length, 3, 'saygi.js KAO izi: sarmalayıcı (2) + bileşim (1)');

console.log('KAO independence: PASS (saygiHTML bayt-eşit + tek bileşim, IIP/state/network coupling ve load-time DOM/timer etkisi yok)');
