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

// KAO-FIX-11 (O-5, M09): 40 yeni aday varken kuyruktaki yeni kart sayısı tam olarak dailyNew.
// Türler dönüşümlü (meaning/arabic): ardışık aynı tür ≤2 kuralı sınırı gizlemesin.
for (const dailyNew of [5, 10, 15]) {
  const fresh = Array.from({ length: 40 }, (_, i) => ({ id: `w:budget-${i}:${i % 2 ? 'tr>ar' : 'ar>tr'}`, type: i % 2 ? 'arabic' : 'meaning', isNew: true, pos: 'N', root: `br${i}`, meanings: [`b${i}`] }));
  const queue = api.kaoBuildQueue({ quranLearn: { settings: { dailyNew }, cards: {}, daily: {} } }, now, { candidates: fresh, sessionId: `budget-${dailyNew}` });
  assert.equal(queue.filter((item) => item.isNew).length, dailyNew, `dailyNew=${dailyNew}: yeni kart sayısı tam olarak ${dailyNew}`);
}
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


// KAO-28 · E9 kaoPickAyah: yalnız kısa sûreler, kapsam ≥%95, görülmemiş öncelikli, deterministik; understood ≤400.
{
  const box = { window: {} };
  vm.createContext(box);
  for (const relative of ['app/content/quranLexiconV1.js', 'app/content/quranShortSurahsV1.js', 'app/core/quranLearn.js']) vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), box, { filename: relative });
  const e9 = box.window.SeymaQuranLearn, shorts = box.window.QuranShortSurahsV1;
  const groups = e9.kaoAyahGroups();
  assert.ok(groups.length > 100 && groups.every((group) => group.words.every((word) => word.surahId === group.surahId && word.ayah === group.ayah && word.pronunciation && word.tr)), 'âyet grupları yalnız kısa sûre verisinden ve eksiksiz');
  assert.equal(e9.kaoPickAyah({ quranLearn: { cards: {} } }, '2026-09-25'), null, 'bilinen kelime yokken âyet yok');
  // KAO-FIX-07 (02 §3): bilinen = iki yönde review ∧ s≥21.
  const durable = { state: 'review', s: 21, reps: 6 };
  const knowAll = (keys) => { const cards = {}; for (const group of groups.filter((item) => keys.includes(item.key))) for (const word of group.words) { cards[`w:${word.lemmaId}:ar>tr`] = durable; cards[`w:${word.lemmaId}:tr>ar`] = durable; } return cards; };
  const target = groups.find((group) => group.words.length >= 20) || groups.reduce((a, b) => (b.words.length > a.words.length ? b : a));
  const cards = knowAll([target.key]);
  const pickedFull = e9.kaoPickAyah({ quranLearn: { cards } }, '2026-09-25');
  assert.ok(pickedFull && pickedFull.coverage.ratio >= 0.95);
  // Eşik: tam 1 kelime eksik — oran ≥0,95 ise seçilir, değilse seçilmez.
  const oneMissing = Object.assign({}, cards); delete oneMissing[`w:${target.words[0].lemmaId}:ar>tr`];
  const sharedLemma = target.words.filter((word) => word.lemmaId === target.words[0].lemmaId).length;
  const ratio = (target.words.length - sharedLemma) / target.words.length;
  const picked = e9.kaoPickAyah({ quranLearn: { cards: oneMissing } }, '2026-09-25');
  const pickedKeys = groups.filter((group) => e9.kaoCoverage({ quranLearn: { cards: oneMissing } }, group.words).ratio >= 0.95).map((group) => group.key);
  assert.equal(pickedKeys.includes(target.key), ratio >= 0.95, `eşik ${ratio.toFixed(3)}`);
  if (picked) assert.ok(e9.kaoCoverage({ quranLearn: { cards: oneMissing } }, picked.words).ratio >= 0.95);
  // Determinizm + görülmemiş önceliği.
  const many = knowAll(groups.map((group) => group.key));
  const a = e9.kaoPickAyah({ quranLearn: { cards: many } }, '2026-09-25'), b = e9.kaoPickAyah({ quranLearn: { cards: many } }, '2026-09-25');
  assert.equal(a.key, b.key, 'aynı gün aynı âyet');
  const days = new Set(Array.from({ length: 14 }, (_, i) => e9.kaoPickAyah({ quranLearn: { cards: many } }, `2026-10-${String(i + 1).padStart(2, '0')}`).key));
  assert.ok(days.size > 7, 'günler arasında dönüşüm');
  const allButOne = groups.map((group) => group.key).filter((key) => key !== groups[5].key);
  assert.equal(e9.kaoPickAyah({ quranLearn: { cards: many, ayahs: { understood: allButOne } } }, '2026-09-25').key, groups[5].key, 'görülmemiş âyet önce');
  assert.ok(e9.kaoPickAyah({ quranLearn: { cards: many, ayahs: { understood: groups.map((group) => group.key) } } }, '2026-09-25'), 'hepsi görüldüyse yine bir âyet');
  // "Anladım" kaydı: tekil, en çok 400, E1 sayacında.
  const data = { quranLearn: { cards: many, ayahs: { understood: Array.from({ length: 400 }, (_, i) => `x:${i}`) } }, settings: {} };
  const ui = { kaoOpen: true, kaoView: 'ayah' };
  let saves = 0;
  assert.equal(e9.registerQuranLearn({ data() { return data; }, ui() { return ui; }, save() { saves += 1; }, render() {}, todayStr() { return '2026-09-25'; }, esc(value) { return String(value); }, icon() { return ''; }, getDay() { return {}; } }), true);
  const today = e9.kaoPickAyah(data, '2026-09-25');
  assert.equal(e9.kaoAyahHTML().includes(today.words[0].tr), true, 'E9 günün seçimini gösterir');
  assert.equal(e9.kaoAyah('understood'), true); assert.equal(e9.kaoAyah('understood'), true);
  assert.equal(data.quranLearn.ayahs.understood.length, 400); assert.equal(data.quranLearn.ayahs.understood.at(-1), today.key);
  assert.equal(data.quranLearn.ayahs.understood.filter((key) => key === today.key).length, 1, 'tekil'); assert.equal(saves, 2);
  assert.match(e9.kaoAyahHTML(), new RegExp(today.words[0].tr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'Anladım sonrası günün âyeti değişmez');
  const html = e9.kaoAyahHTML();
  assert.match(html, /aria-labelledby="kao-ayah-title"/); assert.match(html, /Anladın ✓/);
  assert.equal((html.match(/App\.kaoAyah\('play',\d+\)/g) || []).length, today.words.length, 'kelime kelime ses');
  assert.equal((html.match(/kao-ayah-tr/g) || []).length, today.words.length, 'kelime kelime Türkçe');
  assert.match(e9.kaoHomeHTML('2026-09-25T10:00:00'), /Bugün anlayabildiğin âyet[\s\S]*App\.kaoOpenAyah\(\)/, 'E1 satırı');
  assert.match(e9.kaoHomeHTML('2026-09-25T10:00:00'), /Anlaşılan âyet sayısı: <strong>400<\/strong>/, 'sayaç E1’de');
  assert.match(e9.kaoHubCardHTML(), /Bugün anlayabildiğin âyet:/, 'hub kartı satırı');
  const emptyData = { quranLearn: { cards: {} }, settings: {} };
  data.quranLearn = emptyData.quranLearn; ui.kaoAyahToday = null;
  assert.match(e9.kaoAyahHTML(), /Henüz hazır âyet yok[\s\S]*En yakın âyet/, 'hazır âyet yokken yol gösterir');
  assert.equal(e9.kaoAyah('understood'), false, 'âyet yokken kayıt yok');
  // R-C2: ses yoksa metinle sürer.
  data.quranLearn = { cards: many, ayahs: { understood: [] } };
  assert.equal(e9.registerQuranLearnSurface({ lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return ''; }, restoreFocus() {}, sheetClose(_c, _b, body) { body(); }, mount() {}, createAudio(src) { const l = {}; return { src, addEventListener(n, f) { l[n] = f; }, play() { l.error(); return { catch() {} }; } }; } }), true);
  assert.equal(e9.kaoAyah('play', 'all'), true);
  assert.equal(ui.kaoAudioFailed, true); assert.match(e9.kaoAyahHTML(), /Ses yüklenemedi/);
  assert.ok(shorts.words.length === 618);
}


// KAO-FIX-06 (Y-2): kelime düzeyinde iki yön — gerçek kaoStart/kaoAnswer akışıyla 120 günlük birikimli tarama.
// Her yeni lemma önce ar>tr, en erken ertesi takvim günü tr>ar kartı alır; yeni kart bütçesi iki yön için ortaktır.
{
  const DAILY_NEW = 10;
  let clock = new Date(2026, 0, 1, 8, 0, 0).getTime();
  const RealDate = Date;
  class FixedDate extends RealDate { constructor(...args) { super(...(args.length ? args : [clock])); } static now() { return clock; } }
  const box = { window: {}, Date: FixedDate, Math, Number, String, Object, Array, JSON };
  vm.createContext(box);
  for (const relative of ['app/content/quranLexiconV1.js', 'app/content/quranGrammarV1.js', 'app/content/quranShortSurahsV1.js', 'app/core/quranLearn.js']) vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), box, { filename: relative });
  const sweepApi = box.window.SeymaQuranLearn, sweepUi = {};
  const pad = (n) => String(n).padStart(2, '0');
  const localDay = (value) => { const d = new RealDate(value); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const sweepData = { quranLearn: null };
  assert.equal(sweepApi.registerQuranLearn({ data() { return sweepData; }, ui() { return sweepUi; }, save() {}, render() {}, todayStr() { return localDay(clock); }, esc: String, icon() { return ''; }, getDay() { return {}; } }), true);
  assert.equal(sweepApi.registerQuranLearnSurface({ lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId() { return ''; }, restoreFocus() {}, sheetClose(_c, _b, body) { body(); }, mount() {}, taskElement() { return null; }, createAudio() { return { addEventListener() {}, play() { return { catch() {} }; } }; }, isQuietTime() { return false; }, setTimer() {}, clearTimer() {}, toast() {} }), true);
  sweepApi.ensureQuranLearn(sweepData);
  sweepData.quranLearn.settings.dailyNew = DAILY_NEW;
  const oneWay = [], overBudget = [];
  for (let day = 0; day < 120; day += 1) {
    clock = new Date(2026, 0, 1 + day, 8, 0, 0).getTime();
    sweepApi.kaoStart();
    const newCount = sweepUi.kaoQueue.filter((item) => item.isNew).length;
    if (newCount > DAILY_NEW) overBudget.push(`${localDay(clock)}:${newCount}`);
    const directions = new Set(sweepUi.kaoQueue.map((item) => (String(item.cardId).match(/:(ar>tr|tr>ar)$/) || [])[1]).filter(Boolean));
    if (day > 0 && directions.size < 2) oneWay.push(localDay(clock));
    for (let guard = 0; sweepUi.kaoTaskIndex < sweepUi.kaoQueue.length && guard < 200; guard += 1) {
      const item = sweepUi.kaoQueue[sweepUi.kaoTaskIndex];
      sweepUi.kaoTasks[item.id] = sweepUi.kaoTasks[item.id] || sweepApi.kaoBuildTask(item, sweepData, { seed: item.id });
      const task = sweepUi.kaoTasks[item.id];
      clock += 4000;
      if (task.kind === 'order') {
        for (const choice of task.choices.slice().sort((a, b) => a.ordinal - b.ordinal)) sweepApi.kaoAnswer(task.id, choice.choiceId);
      } else {
        assert.notEqual(sweepApi.kaoAnswer(task.id, task.choices.find((choice) => choice.correct).choiceId), false, `${task.id}: cevap kaydedilmeli`);
      }
    }
  }
  const cards = sweepData.quranLearn.cards, lemmaDirs = {};
  for (const id of Object.keys(cards)) { const m = id.match(/^w:(.+):(ar>tr|tr>ar)$/); if (m) (lemmaDirs[m[1]] = lemmaDirs[m[1]] || {})[m[2]] = cards[id]; }
  const lemmas = Object.keys(lemmaDirs), both = lemmas.filter((id) => lemmaDirs[id]['ar>tr'] && lemmaDirs[id]['tr>ar']);
  assert.ok(lemmas.length >= 100, `120 günde yeterli lemma görülmeli (${lemmas.length})`);
  assert.ok(both.length / lemmas.length >= 0.95, `(a) kartı olan lemmaların ≥%95'i iki yönlü olmalı (${both.length}/${lemmas.length})`);
  const early = both.filter((id) => localDay(lemmaDirs[id]['tr>ar'].introducedAt) <= localDay(lemmaDirs[id]['ar>tr'].introducedAt));
  assert.deepEqual(early, [], '(b) tr>ar, ar>tr ile aynı gün ya da önce sunulmamalı');
  assert.deepEqual(lemmas.filter((id) => !lemmaDirs[id]['ar>tr']), [], 'tr>ar yalnız ar>tr kartı olan lemmada açılır');
  assert.deepEqual(overBudget, [], '(c) günlük yeni kart (iki yön dâhil) ≤ dailyNew');
  assert.deepEqual(oneWay, [], 'R-A2: ilk günden sonra her oturum iki yönü taşır');
}

console.log(`KAO queue: PASS (${first.length} deterministic tasks + 4 grammar types, budgets/interleave/semantic spacing)`);
