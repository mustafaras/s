// MON-36 · SeymaProfile registry, frozen content, consent/progress and scoring parity.
// Yalnız node:vm sentetik verisi kullanır; browser, ağ, gerçek localStorage ve sync yok.
'use strict';

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const profileSource = fs.readFileSync(path.join(repoRoot, 'app/core/profile.js'), 'utf8');
const contentSource = fs.readFileSync(path.join(repoRoot, 'app/content/profileAssessmentV1.js'), 'utf8');
// MON-36 baseline is the parent of this card commit. Using HEAD here would
// compare the extracted module against the already-shimmed post-commit app.js.
const headAppSource = childProcess.execFileSync('git', ['show', 'HEAD^:app.js'], {
  cwd: repoRoot,
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});
const oldStart = headAppSource.indexOf('// ---------- Profil Değerlendirmesi: veri modeli ve migration');
const oldEnd = headAppSource.indexOf('\nvar BOOK_GENRES', oldStart);
assert(oldStart >= 0 && oldEnd > oldStart, 'HEAD profile baseline block bulunamadı');
const baselineSource = headAppSource.slice(oldStart, oldEnd);

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function makeData() {
  return {
    settings: { profileAssessmentInactive: false },
    profileAssessment: {
      schemaVersion: 2, instrumentVersion: '1.0.0', deliveryMode: 'single_session', status: 'active',
      startedAt: '2026-09-11T09:00:00.000Z', completedAt: null, currentItemIndex: 1,
      consent: { version: '1.0.0', informationShownAt: '2026-09-11T09:00:00.000Z', acceptedAt: '2026-09-11T09:00:05.000Z', profileProcessingAccepted: true, sensitiveDataAccepted: true, panelSummarySharingAccepted: true },
      responses: {}, moduleProgress: {}, scores: {}, quality: {}, report: {}, panelSummary: {},
    },
  };
}

function makeContext(kind) {
  const data = makeData();
  const ui = { profileConsent: { read: false, processing: false, sensitive: false, notDiagnosis: false }, profileConsentPrivacyNote: false, profileAssessmentAnswerLocked: false, profileAssessmentReviewIndex: null, profileAssessmentCompletionShown: false, profileAssessmentSOS: false, profileItemShownAt: {} };
  const sandbox = { console, Date, JSON, Array, Object, String, Number, Boolean, Math, isNaN, data, ui, save() {}, icon(name, size) { return '<i data-icon="' + name + '" data-size="' + (size || 20) + '"></i>'; }, esc };
  sandbox.window = sandbox;
  const context = vm.createContext(sandbox);
  vm.runInContext(contentSource, context, { filename: 'profileAssessmentV1.js' });
  const ids = context.ProfileAssessmentV1.sessions[0].items.map((item) => item.id);
  data.profileAssessment.responses = kind === 'consent' || kind === 'empty' || kind === 'module-empty' ? {} : { [ids[0]]: { value: 4 } };
  if (kind === 'empty' || kind === 'module-empty') data.profileAssessment.currentItemIndex = 0;
  if (kind === 'consent') data.profileAssessment.consent.acceptedAt = null;
  if (kind === 'module' || kind === 'module-empty') {
    vm.runInContext(profileSource, context, { filename: 'profile.js' });
    vm.runInContext("window.SeymaProfile.registerProfile({data:function(){return data;},ui:function(){return ui;},save:save,icon:icon,esc:esc})", context);
  } else {
    vm.runInContext(baselineSource, context, { filename: 'app-profile-baseline.js' });
  }
  return { context, data, ui, ids };
}

function run(kind, expression) {
  const fixture = makeContext(kind);
  return { fixture, value: vm.runInContext(expression, fixture.context) };
}

console.log('\n=== MON-36 — profile boundary ===\n');

const cold = { window: {}, console, Date, JSON, Array, Object, String, Number, Boolean, Math, isNaN };
vm.runInNewContext(profileSource, cold, { filename: 'app/core/profile.js#cold' });
assert.equal(typeof cold.window.SeymaProfile, 'object');
assert.equal(typeof cold.window.SeymaProfile.registerProfile, 'function');
assert.equal(typeof cold.document, 'undefined');
assert.equal(typeof cold.localStorage, 'undefined');
console.log('PASS  load-safe registry yalnız namespace kuruyor');

const moduleFixture = makeContext('module');
assert.equal(moduleFixture.ids.length, 174);
assert.equal(moduleFixture.context.SeymaProfile.profileAssessmentItems().length, 174);
assert.equal(moduleFixture.context.SeymaProfile.profileAssessmentComputeCurrentIndex(moduleFixture.data.profileAssessment.responses), 1);
assert.equal(moduleFixture.context.SeymaProfile.PROFILE_CONSENT_VERSION, '1.0.0');
console.log('PASS  frozen content 174/174 ve currentIndex parity');

const baselineProgress = run('progress', 'renderProfileAssessmentGate()');
const moduleProgress = run('module', 'window.SeymaProfile.renderProfileAssessmentGate()');
assert.equal(moduleProgress.value, baselineProgress.value);
assert.match(moduleProgress.value, /2 \/ 174 · %1/);
assert.match(moduleProgress.value, /aria-label="Profil değerlendirmesi"/);
console.log('PASS  progress UI dump baseline ile birebir eşit (' + moduleProgress.value.length + ' byte)');

const baselineEmptyProgress = run('empty', 'renderProfileAssessmentGate()');
const moduleEmptyProgress = run('module-empty', 'window.SeymaProfile.renderProfileAssessmentGate()');
assert.equal(moduleEmptyProgress.value, baselineEmptyProgress.value);
assert.match(moduleEmptyProgress.value, /1 \/ 174 · %0/);
console.log('PASS  boş-session progress dump baseline ile birebir eşit (' + moduleEmptyProgress.value.length + ' byte)');

const baselineConsent = run('consent', 'renderProfileConsent()');
const moduleConsent = run('module', 'window.SeymaProfile.renderProfileConsent()');
assert.equal(moduleConsent.value, baselineConsent.value);
assert.match(moduleConsent.value, /Profil verilerimin işlenmesini kabul ediyorum/);
assert.match(moduleConsent.value, /Hassas verilerin/);
assert.match(moduleConsent.value, /Kabul et ve başla/);
console.log('PASS  consent/privacy UI baseline ile birebir eşit');

const allIds = moduleFixture.ids;
const allResponses = {};
allIds.forEach((id, index) => { allResponses[id] = { value: (index % 7) + 1, responseMs: 5000, revisionCount: 0 }; });
const baselineScores = run('progress', 'scoreProfileAssessment(' + JSON.stringify(allResponses) + ')');
const moduleScores = run('module', 'window.SeymaProfile.scoreProfileAssessment(' + JSON.stringify(allResponses) + ')');
assert.equal(JSON.stringify(moduleScores.value), JSON.stringify(baselineScores.value));
const baselineQuality = run('progress', 'scoreProfileAssessmentQuality(' + JSON.stringify(allResponses) + ')');
const moduleQuality = run('module', 'window.SeymaProfile.scoreProfileAssessmentQuality(' + JSON.stringify(allResponses) + ')');
assert.equal(JSON.stringify(moduleQuality.value), JSON.stringify(baselineQuality.value));
console.log('PASS  scoring + quality baseline ile deep-equal');

assert(!profileSource.includes('window.SeySync'));
assert(!profileSource.includes('localStorage'));
assert(!profileSource.includes('fetch('));
assert(!profileSource.includes('window.App'));
console.log('PASS  profile modülü sync/panel/network/DOM sahipliğine taşmıyor');

console.log('\nMON-36 profile boundary: PASS\n');
