'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

function loadApi(extraDeps) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (const relative of ['app/content/quranLexiconV1.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), sandbox, { filename: relative });
  }
  const api = sandbox.window.SeymaQuranLearn;
  const deps = Object.fromEntries(['data', 'ui', 'save', 'render', 'todayStr', 'esc', 'icon', 'getDay'].map((name) => [name, function fixture() {}]));
  Object.assign(deps, extraDeps || {});
  assert.equal(api.registerQuranLearn(deps), true);
  return api;
}

const noHealth = loadApi();
assert.equal(noHealth.kaoNightWindow({ settings: { targetBed: '23:30' } }, '2026-09-24T22:30:00'), false, 'health dep yoksa öneri yok');

const api = loadApi({ caffeineTargetBed() { return '23:30'; } });
assert.equal(api.kaoNightWindow({ settings: {} }, '2026-09-24T22:30:00'), false, 'açık targetBed yoksa öneri yok');
assert.equal(api.kaoNightWindow({ settings: { targetBed: '23:30' } }, '2026-09-24T21:59:00'), false);
assert.deepEqual(JSON.parse(JSON.stringify(api.kaoNightWindow({ settings: { targetBed: '23:30' } }, '2026-09-24T22:00:00'))), {
  active: true, targetBed: '23:30', startsAt: '22:00', durationMinutes: 3, maxCards: 8, reviewOnly: true
});
assert.ok(api.kaoNightWindow({ settings: { targetBed: '23:30' } }, '2026-09-24T23:30:00'));
assert.equal(api.kaoNightWindow({ settings: { targetBed: '23:30' } }, '2026-09-24T23:31:00'), false);
const midnightApi = loadApi({ caffeineTargetBed() { return '00:30'; } });
assert.equal(midnightApi.kaoNightWindow({ settings: { targetBed: '00:30' } }, '2026-09-24T22:59:00'), false);
assert.ok(midnightApi.kaoNightWindow({ settings: { targetBed: '00:30' } }, '2026-09-24T23:00:00'), 'gece yarısını aşan pencere açılmalı');
assert.ok(midnightApi.kaoNightWindow({ settings: { targetBed: '00:30' } }, '2026-09-25T00:30:00'));
assert.equal(midnightApi.kaoNightWindow({ settings: { targetBed: '00:30' } }, '2026-09-25T00:31:00'), false);

const catalog = { target: { pos: 'N', root: 'target', meanings: ['hedef'] } };
const cards = { target: { state: 'review', s: 35 } };
for (let i = 0; i < 30; i += 1) {
  const id = `safe-${i}`;
  catalog[id] = { pos: 'N', root: `root-${i}`, meanings: [`güvenli-${i}`] };
  cards[id] = { state: 'review', s: 21 + i };
}
catalog.newUnsafe = { pos: 'N', root: 'unsafe-new', meanings: ['yeni'] };
catalog.lowUnsafe = { pos: 'N', root: 'unsafe-low', meanings: ['düşük'] };
catalog.posUnsafe = { pos: 'V', root: 'unsafe-pos', meanings: ['fiil'] };
catalog.rootUnsafe = { pos: 'N', root: 'target', meanings: ['aynı kök'] };
cards.newUnsafe = { state: 'new', s: 100 };
cards.lowUnsafe = { state: 'review', s: 20.999999 };
cards.posUnsafe = { state: 'review', s: 100 };
cards.rootUnsafe = { state: 'review', s: 100 };
const data = { quranLearn: { cards } };
let previous = [];
let violations = 0;
for (let session = 0; session < 1000; session += 1) {
  const picked = api.kaoPickDistractors(data, 'target', 3, { catalog, seed: `session-${session}`, previousDistractors: { target: previous } });
  for (const item of picked) {
    const card = cards[item.cardId], meta = catalog[item.cardId];
    if (card.state !== 'review' || card.s < 21 || meta.pos !== 'N' || meta.root === 'target' || previous.includes(item.cardId)) violations += 1;
  }
  previous = picked.map((item) => item.cardId);
}
assert.equal(violations, 0, 'R-A2: 1.000 sentetik oturum ihlal 0');

let neighborViolations = 0;
for (let session = 0; session < 1000; session += 1) {
  const queue = api.kaoBuildQueue({ quranLearn: { settings: { dailyNew: 10 }, cards: {} } }, `2026-09-${String(1 + session % 28).padStart(2, '0')}T12:00:00.000Z`, {
    sessionId: `neighbor-${session}`,
    candidates: [
      { id: 'w:l_aAmana_966a5c:ar>tr', isNew: true },
      { id: 'w:l_kafara_af1746:ar>tr', isNew: true },
      { id: `w:neutral-${session}:ar>tr`, isNew: true }
    ]
  });
  if (queue.some((item) => item.cardId === 'w:l_aAmana_966a5c:ar>tr') && queue.some((item) => item.cardId === 'w:l_kafara_af1746:ar>tr')) neighborViolations += 1;
}
assert.equal(neighborViolations, 0, 'R-A5: 1.000 sentetik oturum ihlal 0');

console.log('KAO requirements: PASS (R-A1 night window, R-A2 1000 sessions, R-A5 1000 sessions)');
