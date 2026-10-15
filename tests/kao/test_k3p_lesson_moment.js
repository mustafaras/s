'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');
const { bootKao, freshUser } = require('./helpers/kao-harness');

function particles(colors) {
  const timers = [], wrappers = [];
  const document = {
    createElement() { return { style: {}, children: [], appendChild(child) { this.children.push(child); }, remove() { this.removed = true; } }; },
    body: { appendChild(element) { wrappers.push(element); } }
  };
  const box = { window: {}, document, Math: Object.assign(Object.create(Math), { random: () => 0.5 }), setTimeout(fn, ms) { timers.push({ fn, ms }); } };
  vm.runInNewContext(fs.readFileSync(path.join(repoRoot, 'app/core/helpers.js'), 'utf8'), box);
  box.window.SeymaHelpers.confetti(colors);
  return { wrap: wrappers[0], timers };
}

for (const colors of [undefined, []]) {
  const result = particles(colors);
  assert.equal(result.wrap.children.length, 48);
  const defaults = ['#E9AFC1', '#C9B8FF', '#FFE8A3', '#F7DDE5', '#6B4A3A'];
  result.wrap.children.forEach((particle, index) => {
    assert.ok(particle.style.cssText.includes('background:' + defaults[index % defaults.length] + ';'));
    assert.match(particle.style.cssText, /animation:seyConfetti 2\.8s 0\.175s/);
  });
  assert.equal(result.timers[0].ms, 4400);
}
const custom = particles(['#123456', '#abcdef']);
custom.wrap.children.forEach((particle, index) => {
  assert.ok(particle.style.cssText.includes('background:' + ['#123456', '#abcdef'][index % 2] + ';'));
  assert.match(particle.style.cssText, /animation:seyConfetti 0\.8s 0\.175s/);
});
assert.equal(custom.timers[0].ms, 1200);
custom.timers[0].fn();
assert.equal(custom.wrap.removed, true);

function summary({ animate = true, tokens = true, earned = true, promoted = true } = {}) {
  let mountedSummary = false;
  const harness = bootKao({ deps: { render() {
    mountedSummary = harness.api.kaoOverlayHTML(harness.NOW).includes('kao-lesson-summary-coverage');
  } } }), root = freshUser(harness);
  const paletteCalls = [], counterCalls = [];
  const lexicon = harness.win.QuranLexiconV1;
  const [oldWord, newWord, partialWord] = lexicon.lemmas.slice(0, 3);
  const durable = (lemma) => {
    for (const direction of ['ar>tr', 'tr>ar']) root.cards[`w:${lemma.id}:${direction}`] = { state: 'review', s: 40, reps: 6 };
  };
  durable(oldWord);
  harness.win.SeyFx = { shouldAnimate: () => animate, countUp(options) { counterCalls.push(options); } };
  harness.win.SeymaHelpers = { confetti(colors) { paletteCalls.push(Array.from(colors)); } };
  const counter = { getAttribute: () => String(expectedGain) };
  harness.box.document = { querySelector(selector) { return selector.includes('data-countup') ? (mountedSummary ? counter : null) : {}; }, documentElement: {} };
  if (tokens) harness.win.getComputedStyle = () => ({ getPropertyValue(token) { return token === '--quran' ? ' #4777B6 ' : ' #E4C54A '; } });
  const lesson = harness.win.QuranCurriculumV2.units[0].lessons[0];
  assert.equal(harness.api.kaoLesson('start', lesson.id, 'intro'), true);
  const before = harness.api.kaoCoverage(harness.data).ratio;
  if (promoted) durable(newWord);
  root.cards[`w:${partialWord.id}:ar>tr`] = { state: 'review', s: 40, reps: 6 };
  durable({ id: 'not-in-lexicon' });
  root.path.lessons[lesson.id].introducedLemmas = [newWord.id];
  const state = harness.ui.kaoLesson;
  state.plan = [{ kind: 'apply', lessonId: lesson.id }, { kind: 'summary', lessonId: lesson.id, newLemmaIds: [newWord.id] }];
  state.at = 0;
  state.phase = 'lesson';
  state.earnedMilestones = earned ? ['first_lesson'] : [];
  const expectedGain = Number((Math.max(0, harness.api.kaoCoverage(harness.data).ratio - before) * 100).toFixed(2));
  assert.equal(harness.api.kaoLesson('next'), true);
  const html = harness.api.kaoOverlayHTML(harness.NOW);
  assert.ok(html.includes('data-countup="' + expectedGain + '">' + expectedGain.toFixed(2)));
  if (promoted) {
    assert.match(html, /İlk kez yaldızlananlar/);
    const strip = html.slice(html.indexOf('İlk kez yaldızlananlar'), html.indexOf('kao-lesson-summary-coverage'));
    assert.ok(strip.includes(newWord.ar));
    assert.ok(!strip.includes('>' + oldWord.ar + '<'));
    assert.ok(!strip.includes('>' + partialWord.ar + '<'));
  } else {
    assert.ok(!html.includes('İlk kez yaldızlananlar'));
    assert.equal(expectedGain, 0);
  }
  assert.equal(paletteCalls.length, animate && earned ? 1 : 0);
  assert.equal(counterCalls.length, animate ? 1 : 0);
  if (counterCalls.length) {
    assert.equal(counterCalls[0].to, expectedGain);
    assert.equal(counterCalls[0].duration, 800);
    assert.equal(counterCalls[0].formatter(0.45), '0.45');
  }
  harness.api.kaoOverlayHTML(harness.NOW);
  assert.equal(paletteCalls.length, animate && earned ? 1 : 0);
  assert.equal(counterCalls.length, animate ? 1 : 0);
  return paletteCalls;
}

assert.deepEqual(summary()[0], ['#4777B6', '#E4C54A']);
assert.deepEqual(summary({ tokens: false })[0], ['#1C3A5F', '#C9A227']);
summary({ animate: false });
summary({ earned: false });
summary({ promoted: false, earned: false });
console.log('K3P-14: PASS — eski konfeti korunur; CSS paleti, ≤1.2 sn, gerçek kapsam, yeni yaldız, reduced-motion ve tek tetik');
