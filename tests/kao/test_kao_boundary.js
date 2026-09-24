'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const relative = 'app/core/quranLearn.js';
const source = fs.readFileSync(path.join(repoRoot, relative), 'utf8');
const touched = [];
const denied = new Proxy({}, { get(_target, key) { touched.push(String(key)); throw new Error(`forbidden global read: ${String(key)}`); } });
const sandbox = { window: {}, document: denied, localStorage: denied, sessionStorage: denied, indexedDB: denied, fetch() { touched.push('fetch'); throw new Error('fetch'); } };
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: relative });
assert.deepEqual(touched, [], 'registry yükte DOM/ağ/depo erişmemeli');
assert.deepEqual(Object.keys(sandbox.window), ['SeymaQuranLearn'], 'yükte tek global yazılmalı');

const api = sandbox.window.SeymaQuranLearn;
assert.equal(api.registerQuranLearn(null), false);
assert.equal(api.registerQuranLearn({}), false);
const deps = Object.fromEntries(['data', 'ui', 'save', 'render', 'todayStr', 'esc', 'icon', 'getDay'].map((name) => [name, function fixture() {}]));
assert.equal(api.registerQuranLearn(deps), true);
assert.equal(api.registerQuranLearn(deps), false, 'ikinci kayıt reddedilmeli');

function listFrom(relativePath) {
  const text = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
  return [...text.matchAll(/['"](app\/(?:content|core)\/[^'"?]+\.js)(?:\?[^'"]+)?['"]/g)].map((match) => match[1]);
}
const expectedPair = ['app/core/quran.js', 'app/core/quranLearn.js', 'app/core/saygi.js'];
for (const file of ['index.html', '.claude/skills/run-seyma/driver.mjs', '.claude/skills/run-seyma/zikr-harness.mjs', 'tests/app/test_state_rebind_boundary.js']) {
  const list = listFrom(file);
  const quranIndex = list.indexOf('app/core/quran.js');
  assert.ok(quranIndex >= 0, `${file}: quran.js bulunmalı`);
  assert.deepEqual(list.slice(quranIndex, quranIndex + 3), expectedPair, `${file}: KAO registry yükleme sırası`);
  assert.equal(list.filter((item) => item === 'app/core/quranLearn.js').length, 1, `${file}: tek quranLearn kaydı`);
}
assert.match(fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8'), /app\/core\/quranLearn\.js\?v=\d{8}[a-z]/);

const appSource = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
assert.match(appSource, /function ensureQuranLearn\(d\)\{ return window\.SeymaQuranLearn\.ensureQuranLearn\.apply\(null,arguments\); \}/);
assert.match(appSource, /registerQuranLearn\(\{data:function\(\)\{ return data; \},ui:function\(\)\{ return ui; \},save:save,render:render,todayStr:todayStr,esc:esc,icon:icon,getDay:getDay\}\)/);

console.log('KAO boundary: PASS (load purity, fail-closed deps, four lists, shims)');
