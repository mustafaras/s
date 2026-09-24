'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

function loadApi() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (const relative of ['app/content/quranLexiconV1.js', 'app/content/quranGrammarV1.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), sandbox, { filename: relative });
  }
  return sandbox.window.SeymaQuranLearn;
}

const api = loadApi();
assert.equal(typeof api.kaoBuildQueue, 'function');
assert.equal(typeof api.kaoBuildTask, 'function');
assert.equal(typeof api.kaoPickDistractors, 'function');

const now = '2026-09-24T12:00:00.000Z';
const cards = {};
const candidates = [];
for (let i = 0; i < 90; i += 1) {
  const type = i % 9 === 0 ? 'grammar' : i % 13 === 0 ? 'fragment' : 'word';
  const id = type === 'grammar' ? `g:g${i}:slot` : type === 'fragment' ? `s:112:1:${i}` : `w:lemma-${i}:ar>tr`;
  cards[id] = { state: 'review', s: 25 + i, due: `2026-09-${String(1 + i % 23).padStart(2, '0')}T00:00:00.000Z`, reps: 4 };
  candidates.push({ id, type, pos: 'N', root: `r${i}`, meanings: [`m${i}`] });
}
for (let i = 0; i < 30; i += 1) {
  const id = `w:new-${i}:ar>tr`;
  candidates.push({ id, type: 'word', isNew: true, pos: 'N', root: `nr${i}`, meanings: [`new${i}`] });
}
candidates.push(
  { id: 'w:l_aAmana_966a5c:ar>tr', type: 'word', isNew: true },
  { id: 'w:l_kafara_af1746:ar>tr', type: 'word', isNew: true }
);

const data = { quranLearn: { settings: { dailyNew: 10 }, cards, daily: {} } };
const opts = { candidates, sessionId: 'fixture-a' };
const first = JSON.parse(JSON.stringify(api.kaoBuildQueue(data, now, opts)));
const second = JSON.parse(JSON.stringify(api.kaoBuildQueue(data, now, opts)));
assert.deepEqual(first, second, 'aynı gün+kart kimlikleri deterministik olmalı');
assert.ok(first.length > 0);
assert.ok(first.filter((item) => !item.isNew).length <= 60, 'due üst sınırı 60');
assert.ok(first.filter((item) => item.isNew).length <= 10, 'yeni üst sınırı dailyNew');
assert.ok(first.filter((item) => item.type === 'grammar').length <= 4, 'KAO-12 gramer üst sınırı 4');
assert.ok(first.filter((item) => item.type === 'fragment').length <= 2, 'parça üst sınırı 2');
for (let i = 2; i < first.length; i += 1) {
  assert.ok(first[i].type === 'grammar' || !(first[i].type === first[i - 1].type && first[i].type === first[i - 2].type), 'gramer dışı aynı tür ardışık en çok 2');
}
assert.ok(!first.some((item) => item.cardId === 'w:l_aAmana_966a5c:ar>tr') || !first.some((item) => item.cardId === 'w:l_kafara_af1746:ar>tr'), 'aynı semantik kümeden iki yeni kart aynı oturumda olmamalı');

const semanticPairs = [
  ['l_qaAla_657dd3', 'l_amor_9fbe48'], ['l_aAmana_966a5c', 'l_kafara_af1746'],
  ['l_Ealima_ceb6d7', 'l_Ealiym_c50d0d'], ['l_Ea_aAb_4b9936', 'l_Eamila_50319c'],
  ['l_nafos_fde475', 'l_qalob_e14dcc'], ['l_daEaA_f5ec67', 'l_Eabod_3558c0'],
  ['l_t_aqaY_bc8006', 'l_xaAfa_29d6b0'], ['l_hadaY_a88771', 'l_aDal_a_5ed954'],
  ['l_ZaAlim_fae7dd', 'l_r_aHiym_ecdbe9'], ['l_n_aZara_cdb6f4', 'l_samiEa_640570'],
  ['l_Hayaw_p_e08aa3', 'l_mawot_7aa65a'], ['l_aTaAEa_74ca26', 'l_Sabara_34dfc2']
];
for (const pair of semanticPairs) {
  const queue = api.kaoBuildQueue({ quranLearn: { settings: { dailyNew: 10 }, cards: {} } }, now, {
    candidates: pair.map((id) => ({ id: `w:${id}:ar>tr`, isNew: true }))
  });
  assert.equal(queue.length, 1, `doğrulanmış semantik küme ayrılmalı: ${pair.join('/')}`);
}
const sameRootQueue = api.kaoBuildQueue({ quranLearn: { settings: { dailyNew: 10 }, cards: {} } }, now, {
  candidates: [{ id: 'w:l_ll_ah_d0a09b:ar>tr', isNew: true }, { id: 'w:l_ila_h_3366e5:ar>tr', isNew: true }]
});
assert.equal(sameRootQueue.length, 1, 'donmuş sözlük kök dizini aynı-kök yeni kartları ayırmalı');

const recentData = { quranLearn: { settings: { dailyNew: 10 }, cards: {
  'w:l_aAmana_966a5c:ar>tr': { state: 'review', s: 30, introducedAt: '2026-09-22T12:00:00.000Z' }
} } };
const blocked = api.kaoBuildQueue(recentData, now, { candidates: [{ id: 'w:l_kafara_af1746:ar>tr', isNew: true }] });
assert.equal(blocked.length, 0, '3 gün içindeki semantik komşu yeni kartı engellemeli');
recentData.quranLearn.cards['w:l_aAmana_966a5c:ar>tr'].introducedAt = '2026-09-21T12:00:00.000Z';
const allowed = api.kaoBuildQueue(recentData, now, { candidates: [{ id: 'w:l_kafara_af1746:ar>tr', isNew: true }] });
assert.equal(allowed.length, 1, 'tam 3 günlük ayrım yeni kartı açmalı');

const catalog = {
  target: { pos: 'N', root: 'root-target', meanings: ['hedef'] },
  safe1: { pos: 'N', root: 'root-1', meanings: ['güvenli 1'] },
  safe2: { pos: 'N', root: 'root-2', meanings: ['güvenli 2'] },
  unstable: { pos: 'N', root: 'root-3', meanings: ['kararsız'] },
  wrongPos: { pos: 'V', root: 'root-4', meanings: ['yanlış POS'] },
  sameRoot: { pos: 'N', root: 'root-target', meanings: ['aynı kök'] }
};
const distractorData = { quranLearn: { cards: {
  target: { state: 'review', s: 35 }, safe1: { state: 'review', s: 21 }, safe2: { state: 'review', s: 40 },
  unstable: { state: 'review', s: 20.999 }, wrongPos: { state: 'review', s: 50 }, sameRoot: { state: 'review', s: 50 }
} } };
const distractors = JSON.parse(JSON.stringify(api.kaoPickDistractors(distractorData, 'target', 2, { catalog, seed: 'fixture' })));
assert.deepEqual(new Set(distractors.map((item) => item.cardId)), new Set(['safe1', 'safe2']));
const task = JSON.parse(JSON.stringify(api.kaoBuildTask({ cardId: 'target', type: 'word', isNew: false }, distractorData, { catalog, seed: 'fixture' })));
assert.equal(task.cardId, 'target');
assert.equal(task.choices.filter((choice) => choice.correct).length, 1);
assert.ok(task.choices.every((choice) => typeof choice.label === 'string' && choice.label));

const grammarCandidates = JSON.parse(JSON.stringify(api.kaoGrammarCandidates()));
assert.equal(grammarCandidates.length, 4, 'dört gramer türü için birer donmuş şablon seçilmeli');
const grammarTypes = new Set();
const errorClasses = new Set();
for (const candidate of grammarCandidates) {
  const grammarTask = JSON.parse(JSON.stringify(api.kaoBuildGrammarTask({ id: `fixture:${candidate.id}`, cardId: candidate.id, type: 'grammar', isNew: true }, { quranLearn: { cards: {} } }, { seed: candidate.id })));
  assert.ok(grammarTask);
  grammarTypes.add(grammarTask.grammarType);
  errorClasses.add(grammarTask.errorClass);
  assert.equal(grammarTask.choices.filter((choice) => choice.correct).length, 1);
  assert.ok(grammarTask.choices.length >= 3 && grammarTask.choices.length <= 4);
  assert.ok(grammarTask.prompt && grammarTask.stimulus && grammarTask.answer);
  if (grammarTask.grammarType === 'Ek çöz') assert.match(grammarTask.answer, /^el \+ /);
  if (grammarTask.grammarType === 'Kalıp eşle') {
    assert.match(grammarTask.stimulus, /[\u0600-\u06ff]/);
    assert.equal(grammarTask.context.length, 3);
    assert.doesNotMatch(grammarTask.answer, /ism-i|masdar|bab/iu, 'kalıp eşle anlamla eşleştirmeli');
  }
}
assert.deepEqual([...grammarTypes].sort(), ['Ek çöz', 'Kalıp eşle', 'Kök bul', 'Çekim tablosu'].sort());
assert.deepEqual([...errorClasses].sort(), ['affix', 'root', 'rule']);

const grammarQueue = api.kaoBuildQueue({ quranLearn: { settings: { dailyNew: 10 }, cards: {} } }, now, { candidates: grammarCandidates, sessionId: 'grammar-four' });
assert.equal(grammarQueue.length, 4, 'dört gramer türü aynı oturuma girmeli');
assert.deepEqual(new Set(grammarQueue.map((item) => api.kaoBuildGrammarTask(item, { quranLearn: { cards: {} } }, { seed: item.id }).grammarType)), grammarTypes);
const mixedGrammarQueue = api.kaoBuildQueue({ quranLearn: { settings: { dailyNew: 10 }, cards: {} } }, now, {
  candidates: grammarCandidates.concat(Array.from({ length: 20 }, (_, i) => ({ id: `w:mixed-${i}:ar>tr`, type: 'word', isNew: true, pos: 'N', root: `mixed-root-${i}` }))),
  sessionId: 'grammar-mixed'
});
assert.equal(mixedGrammarQueue.filter((item) => item.type === 'grammar').length, 4, 'karma gerçek oturum dört gramer türünü korumalı');

console.log(`KAO queue: PASS (${first.length} deterministic tasks + 4 grammar types, budgets/interleave/semantic spacing)`);
