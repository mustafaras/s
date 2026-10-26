'use strict';

// K3PD-00 · ağsız/sentetik repo üzerinde gerçek durum.mjs CLI davranış testi.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');

const repoRoot = require('../repo-root');
const {
  resolveK3pdDeferredFiles,
  resolveLegacyK3pDeferredFiles,
} = require('../app/test_asset_pin_freshness');
const toolSource = path.join(repoRoot, 'kao3-premium/duzeltme-plani/araclar/durum.mjs');
const planRel = 'kao3-premium/duzeltme-plani';
const branch = 'k3pd-denetim-duzeltmeleri';
const ids = Array.from({ length: 34 }, (_, index) => `K3PD-${String(index).padStart(2, '0')}`);
const K3PD_BRANCH = 'k3pd-denetim-duzeltmeleri';
const PINNED_ASSET = 'app/core/quranLearn.js';
const ACCEPTED_RECOGNITION_REF = 'K3PD-25#recognition-deviation:seq139';
const runEnv = {
  PATH: process.env.PATH || '/usr/bin:/bin',
  LANG: process.env.LANG || 'C',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_COUNT: '1',
  GIT_CONFIG_KEY_0: 'commit.gpgsign',
  GIT_CONFIG_VALUE_0: 'false',
  GIT_AUTHOR_NAME: 'K3PD fixture',
  GIT_AUTHOR_EMAIL: 'k3pd-fixture@example.invalid',
  GIT_COMMITTER_NAME: 'K3PD fixture',
  GIT_COMMITTER_EMAIL: 'k3pd-fixture@example.invalid',
};

function git(cwd, args) {
  const result = spawnSync('git', args, { cwd, env: runEnv, encoding: 'utf8' });
  assert.equal(result.error, undefined, `git ${args.join(' ')} spawn: ${result.error?.message}`);
  assert.equal(result.status, 0, `git ${args.join(' ')} failed: ${result.stderr}`);
  return result.stdout.trim();
}

function promptText() {
  return ids.map((id) => [
    `<!-- PROMPT ${id} -->`,
    `## ${id} — synthetic fixture`,
    `Body for ${id}; synthetic only.`,
    `<!-- /PROMPT ${id} -->`,
  ].join('\n')).join('\n\n');
}

function emptyCard(id) {
  return {
    id,
    status: 'todo',
    baseHead: null,
    changedPaths: [],
    checks: [],
    auditVerdict: null,
    evidenceRefs: [],
    acceptanceDependencies: [],
  };
}

function decision(topic) {
  return {
    status: 'pending', topic, proposal: null, options: [], response: null,
    answeredAt: null, sourceRef: 'PROMPTLAR.md synthetic fixture', scope: 'synthetic only',
  };
}

function makeState() {
  const cards = Object.fromEntries(ids.map((id) => [id, emptyCard(id)]));
  cards['K3PD-00'] = {
    id: 'K3PD-00', status: 'in_progress', baseHead: 'a'.repeat(40),
    changedPaths: [
      `${planRel}/PROMPTLAR.md`, `${planRel}/DENETLEYICI.md`,
      `${planRel}/DURUM.json`, `${planRel}/GUNCEL-DURUM.md`,
      `${planRel}/KAYIT.md`, `${planRel}/araclar/durum.mjs`,
      'tests/kao/test_k3pd_control.js', 'tests/kao/README.md',
      `${planRel}/kanit/K3PD-00/EVIDENCE.md`,
    ],
    checks: [{ command: 'synthetic check', env: {}, exitCode: 0, measurements: { ids: 34 } }],
    auditVerdict: 'NOT_MEASURED',
    evidenceRefs: [],
    acceptanceDependencies: [],
  };
  const legacyOrder = Array.from({ length: 37 }, (_, index) => `K3P-${String(index).padStart(2, '0')}`);
  return {
    program: 'K3PD', planVersion: 1, branch, baselineHead: 'a'.repeat(40), status: 'active',
    executionOrder: ids, nextPrompt: 'K3PD-00', cards,
    decisions: { h4: decision('H4'), timeBudget: decision('time'), recognition: decision('recognition') },
    releaseApproval: {
      status: 'NOT_APPROVED', candidateSha: null, scope: [], response: null,
      approvedAt: null, sourceRef: 'synthetic fixture only',
    },
    pinDeferral: { branch, until: 'K3PD-32', files: [], mainExceptions: [] },
    externalGates: Object.fromEntries(
      ['device', 'screenReader', 'L2', 'audio230', 'study14', 'study30', 'remoteParity']
        .map((id) => [id, { status: 'pending', evidenceLevel: 'none', owner: 'user', agentVerified: false }]),
    ),
    legacyProgram: {
      program: 'K3P', statePath: 'kao3-premium/K3P-STATE.json', status: 'completed',
      nextPrompt: null, releaseApproval: 'APPROVED-2026-10-18', completedCards: 37, totalCards: 37,
    },
    legacyOrder,
  };
}

function makeRecord(state) {
  return {
    seq: 1, cardId: 'K3PD-00', type: 'card', date: '2026-10-18',
    baseHead: state.cards['K3PD-00'].baseHead,
    scope: state.cards['K3PD-00'].changedPaths,
    commands: [{ command: 'synthetic check', env: {}, exitCode: 0 }],
    measurements: { promptIds: 34 }, auditVerdict: 'NOT_MEASURED',
    evidenceRefs: [],
    openAcceptances: ['synthetic audit pending'], nextCandidate: 'K3PD-00',
    cardStatus: 'in_progress',
  };
}

function writeFixture(root, { currentBranch = branch } = {}) {
  const plan = path.join(root, planRel);
  const toolPath = path.join(plan, 'araclar/durum.mjs');
  fs.mkdirSync(path.dirname(toolPath), { recursive: true });
  fs.mkdirSync(path.join(plan, 'kanit/K3PD-00'), { recursive: true });
  fs.mkdirSync(path.join(root, 'tests/kao'), { recursive: true });
  fs.mkdirSync(path.join(root, 'kao3-premium/.anti-amnesia'), { recursive: true });
  fs.writeFileSync(path.join(root, 'kao3-premium/.anti-amnesia/CURRENT-STATE.md'), 'synthetic completed K3P state\n');
  fs.writeFileSync(path.join(root, 'kao3-premium/.anti-amnesia/LEDGER.md'), 'synthetic frozen K3P ledger\n');
  fs.writeFileSync(toolPath, fs.readFileSync(toolSource, 'utf8'));
  fs.writeFileSync(path.join(plan, 'PROMPTLAR.md'), `# Synthetic plan\n\n${promptText()}\n`);
  fs.writeFileSync(path.join(plan, 'DENETLEYICI.md'), '# Synthetic controller\n');
  fs.writeFileSync(path.join(plan, 'GUNCEL-DURUM.md'), 'Sıradaki aday: K3PD-00\n');
  fs.writeFileSync(path.join(plan, 'araclar-placeholder.txt'), 'synthetic\n');
  fs.writeFileSync(path.join(plan, 'kanit/K3PD-00/EVIDENCE.md'), 'synthetic evidence\n');
  fs.writeFileSync(path.join(root, 'tests/kao/test_k3pd_control.js'), 'synthetic test\n');
  fs.writeFileSync(path.join(root, 'tests/kao/README.md'), '`test_k3pd_control.js`\n');
  const legacy = {
    program: 'K3P', status: 'completed', nextPrompt: null,
    releaseApproval: 'APPROVED-2026-10-18', executionOrder: makeState().legacyOrder,
    cards: Array.from({ length: 37 }, (_, index) => ({ id: `K3P-${index}`, status: 'done' })),
  };
  fs.writeFileSync(path.join(root, 'kao3-premium/K3P-STATE.json'), `${JSON.stringify(legacy, null, 2)}\n`);
  const state = makeState();
  delete state.legacyOrder;
  fs.writeFileSync(path.join(plan, 'DURUM.json'), `${JSON.stringify(state, null, 2)}\n`);
  const record = makeRecord(state);
  fs.writeFileSync(path.join(plan, 'KAYIT.md'), [
    '# K3PD append-only fixture log',
    '',
    `## seq 1 · K3PD-00 · KART`,
    `<!-- K3PD-RECORD ${JSON.stringify(record)} -->`,
    '',
    'Synthetic fixture record.',
    '',
  ].join('\n'));
  git(root, ['init', '-b', currentBranch]);
  git(root, ['add', '.']);
  git(root, ['commit', '-m', 'synthetic K3PD control fixture']);
  const baselineHead = git(root, ['rev-parse', 'HEAD']);
  state.baselineHead = baselineHead;
  state.cards['K3PD-00'].baseHead = baselineHead;
  fs.writeFileSync(path.join(plan, 'DURUM.json'), `${JSON.stringify(state, null, 2)}\n`);
  let log = fs.readFileSync(path.join(plan, 'KAYIT.md'), 'utf8');
  log = log.replace(/^<!-- K3PD-RECORD (\{[^\n]+\}) -->$/m, (_, raw) => {
    const record = JSON.parse(raw);
    record.baseHead = baselineHead;
    return '<!-- K3PD-RECORD ' + JSON.stringify(record) + ' -->';
  });
  fs.writeFileSync(path.join(plan, 'KAYIT.md'), log);
  git(root, ['add', '.']);
  git(root, ['commit', '-m', 'synthetic K3PD baseline reference']);
  return root;
}

function runCli(root, args = ['--check']) {
  return spawnSync(process.execPath, [path.join(root, planRel, 'araclar/durum.mjs'), ...args], {
    cwd: root, env: runEnv, encoding: 'utf8',
  });
}

function setSyntheticOwnerDecision(decision) {
  decision.status = 'approved';
  decision.proposal = 'synthetic option';
  decision.options = ['synthetic option'];
  decision.response = 'synthetic owner response';
  decision.answeredAt = '2026-10-18';
}

function testK3pdPinDeferralMatrix() {
  assert.equal(typeof resolveK3pdDeferredFiles, 'function', 'asset pin test must expose its pure K3PD deferral resolver');
  const stateFor = (overrides = {}) => {
    const cards = Object.fromEntries(ids.map((id) => [id, { id, status: 'todo' }]));
    return {
      program: 'K3PD', planVersion: 1, branch: K3PD_BRANCH, baselineHead: 'a'.repeat(40),
      status: 'active', executionOrder: ids.slice(), nextPrompt: 'K3PD-01', cards,
      releaseApproval: {
        status: 'NOT_APPROVED', candidateSha: null, scope: [], response: null, approvedAt: null,
      },
      pinDeferral: { branch: K3PD_BRANCH, until: 'K3PD-32', files: [PINNED_ASSET], mainExceptions: [] },
      ...overrides,
    };
  };
  const pinnedAssets = new Set([PINNED_ASSET]);
  const valid = stateFor();
  assert.deepEqual(resolveK3pdDeferredFiles(valid, K3PD_BRANCH, pinnedAssets), [PINNED_ASSET], 'only the exact active K3PD path should defer on its branch');
  assert.deepEqual(resolveK3pdDeferredFiles(stateFor({ pinDeferral: { ...valid.pinDeferral, files: [] } }), K3PD_BRANCH, pinnedAssets), [], 'empty initial list defers nothing');

  const invalid = [
    ['main runtime branch', valid, 'main'],
    ['other runtime branch', valid, 'other-feature-branch'],
    ['fake suffix runtime branch', valid, `${K3PD_BRANCH}-fake`],
    ['state branch mismatch', stateFor({ branch: 'main' }), K3PD_BRANCH],
    ['fake state branch', stateFor({ branch: `${K3PD_BRANCH}-fake` }), K3PD_BRANCH],
    ['legacy program state', stateFor({ program: 'K3P' }), K3PD_BRANCH],
    ['missing plan version', stateFor({ planVersion: undefined }), K3PD_BRANCH],
    ['bad baseline', stateFor({ baselineHead: 'not-a-sha' }), K3PD_BRANCH],
    ['closed program', stateFor({ status: 'completed' }), K3PD_BRANCH],
    ['release candidate state', stateFor({ status: 'release_candidate' }), K3PD_BRANCH],
    ['missing execution order', stateFor({ executionOrder: undefined }), K3PD_BRANCH],
    ['wrong execution order', stateFor({ executionOrder: ids.slice(1) }), K3PD_BRANCH],
    ['missing card set', stateFor({ cards: undefined }), K3PD_BRANCH],
    ['missing close card', stateFor({ cards: Object.fromEntries(ids.slice(0, -1).map((id) => [id, { id, status: 'todo' }])) }), K3PD_BRANCH],
    ['K3PD-32 already done', stateFor({ cards: { ...valid.cards, 'K3PD-32': { id: 'K3PD-32', status: 'done' } } }), K3PD_BRANCH],
    ['release approval carried', stateFor({ releaseApproval: { status: 'APPROVED' } }), K3PD_BRANCH],
    ['missing release approval', stateFor({ releaseApproval: undefined }), K3PD_BRANCH],
    ['missing pin deferral', stateFor({ pinDeferral: undefined }), K3PD_BRANCH],
    ['wrong deferral branch', stateFor({ pinDeferral: { ...valid.pinDeferral, branch: 'main' } }), K3PD_BRANCH],
    ['wrong closing card', stateFor({ pinDeferral: { ...valid.pinDeferral, until: 'K3PD-33' } }), K3PD_BRANCH],
    ['non-array file list', stateFor({ pinDeferral: { ...valid.pinDeferral, files: PINNED_ASSET } }), K3PD_BRANCH],
    ['missing main-exception list', stateFor({ pinDeferral: { ...valid.pinDeferral, mainExceptions: undefined } }), K3PD_BRANCH],
    ['main exception present', stateFor({ pinDeferral: { ...valid.pinDeferral, mainExceptions: ['index.html'] } }), K3PD_BRANCH],
    ['wildcard path', stateFor({ pinDeferral: { ...valid.pinDeferral, files: ['app/*.js'] } }), K3PD_BRANCH],
    ['directory path', stateFor({ pinDeferral: { ...valid.pinDeferral, files: ['app/core/'] } }), K3PD_BRANCH],
    ['parent traversal', stateFor({ pinDeferral: { ...valid.pinDeferral, files: ['../app/core/quranLearn.js'] } }), K3PD_BRANCH],
    ['absolute path', stateFor({ pinDeferral: { ...valid.pinDeferral, files: ['/app/core/quranLearn.js'] } }), K3PD_BRANCH],
    ['query path', stateFor({ pinDeferral: { ...valid.pinDeferral, files: [`${PINNED_ASSET}?v=pin`] } }), K3PD_BRANCH],
    ['unreferenced exact file', stateFor({ pinDeferral: { ...valid.pinDeferral, files: ['app/core/not-pinned.js'] } }), K3PD_BRANCH],
    ['duplicate exact path', stateFor({ pinDeferral: { ...valid.pinDeferral, files: [PINNED_ASSET, PINNED_ASSET] } }), K3PD_BRANCH],
    ['malformed null state', null, K3PD_BRANCH],
    ['array state', [], K3PD_BRANCH],
  ];
  for (const [label, state, branch] of invalid) {
    assert.deepEqual(resolveK3pdDeferredFiles(state, branch, pinnedAssets), [], `${label} must fail closed`);
  }
  const legacyDeferral = { branch: 'kao3-premium', until: 'K3P-27', files: [PINNED_ASSET] };
  const legacyCases = [
    ['legacy K3P branch exact match', legacyDeferral, 'kao3-premium', [PINNED_ASSET]],
    ['legacy K3P does not carry to K3PD branch', legacyDeferral, K3PD_BRANCH, []],
    ['main is always strict', { branch: 'main', until: 'K3P-27', files: [PINNED_ASSET] }, 'main', []],
    ['legacy K3P wrong branch', legacyDeferral, 'some-other-branch', []],
    ['legacy K3P missing state', null, 'kao3-premium', []],
    ['legacy K3P malformed file list', { branch: 'kao3-premium', files: PINNED_ASSET }, 'kao3-premium', []],
  ];
  for (const [label, deferral, branch, expected] of legacyCases) {
    assert.deepEqual(resolveLegacyK3pDeferredFiles(deferral, branch), expected, `${label} regression`);
  }
  return { k3pd: invalid.length + 2, legacy: legacyCases.length };
}

function writeSourceReadyFixture(root, targetId) {
  writeFixture(root);
  const plan = path.join(root, planRel);
  const statePath = path.join(plan, 'DURUM.json');
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const targetIndex = ids.indexOf(targetId);
  assert.ok([11, 21].includes(targetIndex), 'source_ready fixture only covers K3PD-11/21');
  const evidenceFor = (id) => {
    const rel = planRel + '/kanit/' + id + '/EVIDENCE.md';
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), 'synthetic evidence for ' + id + '\n');
    return rel;
  };
  for (let index = 0; index <= targetIndex; index += 1) {
    const id = ids[index];
    const isDeferredSource = id === 'K3PD-11' || id === 'K3PD-21';
    const card = state.cards[id];
    const evidenceRef = evidenceFor(id);
    card.baseHead = state.baselineHead;
    card.changedPaths = id === 'K3PD-00' ? card.changedPaths : [evidenceRef];
    card.checks = [{ command: 'synthetic card check', env: {}, exitCode: 0, measurements: { id } }];
    card.evidenceRefs = [evidenceRef];
    card.acceptanceDependencies = isDeferredSource ? ['K3PD-29'] : [];
    card.auditVerdict = isDeferredSource ? 'EVIDENCE_PENDING' : 'PASS';
    card.status = isDeferredSource ? 'source_ready' : 'done';
  }
  setSyntheticOwnerDecision(state.decisions.h4);
  setSyntheticOwnerDecision(state.decisions.timeBudget);
  state.nextPrompt = ids[targetIndex + 1];
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
  fs.writeFileSync(path.join(plan, 'GUNCEL-DURUM.md'), 'Sıradaki aday: ' + state.nextPrompt + '\n');

  let log = fs.readFileSync(path.join(plan, 'KAYIT.md'), 'utf8');
  for (let index = 0; index <= targetIndex; index += 1) {
    const id = ids[index];
    const card = state.cards[id];
    const record = {
      seq: index + 2, cardId: id, type: 'card', date: '2026-10-18',
      baseHead: card.baseHead, scope: card.changedPaths,
      commands: card.checks.map(({ command, env, exitCode }) => ({ command, env, exitCode })),
      measurements: { synthetic: true }, auditVerdict: card.auditVerdict,
      evidenceRefs: card.evidenceRefs,
      openAcceptances: card.status === 'source_ready' ? ['K3PD-29 visual evidence'] : [],
      nextCandidate: ids[index + 1] || null, cardStatus: card.status,
    };
    log += '\n## seq ' + record.seq + ' · ' + id + ' · SYNTHETIC\n'
      + '<!-- K3PD-RECORD ' + JSON.stringify(record) + ' -->\n';
  }
  for (const [decisionId, cardId] of [['h4', 'K3PD-02'], ['timeBudget', 'K3PD-04']]) {
    const decision = state.decisions[decisionId];
    const card = state.cards[cardId];
    const record = {
      seq: log.split('<!-- K3PD-RECORD ').length - 1 + 1,
      cardId, type: 'decision', decisionId, decisionStatus: decision.status,
      date: decision.answeredAt, baseHead: card.baseHead, scope: card.changedPaths,
      commands: card.checks.map(({ command, env, exitCode }) => ({ command, env, exitCode })),
      measurements: { synthetic: true }, auditVerdict: card.auditVerdict,
      evidenceRefs: card.evidenceRefs, openAcceptances: [],
      nextCandidate: state.nextPrompt, cardStatus: card.status,
      response: decision.response, sourceRef: decision.sourceRef,
    };
    log += '\n## seq ' + record.seq + ' · ' + cardId + ' · DECISION\n'
      + '<!-- K3PD-RECORD ' + JSON.stringify(record) + ' -->\n';
  }
  fs.writeFileSync(path.join(plan, 'KAYIT.md'), log);
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function appendStateRecord(markdown, state) {
  const card = state.cards['K3PD-00'];
  const record = {
    seq: 2, cardId: 'K3PD-00', type: 'card', date: '2026-10-18',
    baseHead: card.baseHead, scope: card.changedPaths,
    commands: card.checks.map(({ command, env, exitCode }) => ({ command, env, exitCode })),
    measurements: { synthetic: true }, auditVerdict: card.auditVerdict,
    evidenceRefs: card.evidenceRefs, openAcceptances: [],
    nextCandidate: state.nextPrompt, cardStatus: card.status,
  };
  return markdown + '\n## seq 2 · K3PD-00 · SYNTHETIC\n'
    + '<!-- K3PD-RECORD ' + JSON.stringify(record) + ' -->\n';
}

function expectRejected(root, baseline, mutate, pattern, label) {
  const state = cloneValue(baseline.state);
  const prompt = baseline.prompt;
  const legacy = cloneValue(baseline.legacy);
  const log = baseline.log;
  const changed = mutate({ state, prompt, legacy, log });
  fs.writeFileSync(path.join(root, planRel, 'DURUM.json'), `${JSON.stringify(state, null, 2)}\n`);
  if (changed.prompt !== undefined) fs.writeFileSync(path.join(root, planRel, 'PROMPTLAR.md'), changed.prompt);
  if (changed.legacy !== undefined) fs.writeFileSync(path.join(root, 'kao3-premium/K3P-STATE.json'), `${JSON.stringify(changed.legacy, null, 2)}\n`);
  if (changed.log !== undefined) fs.writeFileSync(path.join(root, planRel, 'KAYIT.md'), changed.log);
  const result = runCli(root);
  const output = `${result.stdout}${result.stderr}`;
  assert.notEqual(result.status, 0, `${label} should fail closed`);
  assert.match(output, pattern, `${label} diagnostic missing; got:\n${output}`);
  fs.writeFileSync(path.join(root, planRel, 'DURUM.json'), `${JSON.stringify(baseline.state, null, 2)}\n`);
  fs.writeFileSync(path.join(root, planRel, 'PROMPTLAR.md'), baseline.prompt);
  fs.writeFileSync(path.join(root, 'kao3-premium/K3P-STATE.json'), `${JSON.stringify(baseline.legacy, null, 2)}\n`);
  fs.writeFileSync(path.join(root, planRel, 'KAYIT.md'), baseline.log);
}

const pinDeferralCases = testK3pdPinDeferralMatrix();
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'k3pd-control-'));
try {
  writeFixture(tempRoot);
  const plan = path.join(tempRoot, planRel);
  const baseline = {
    state: JSON.parse(fs.readFileSync(path.join(plan, 'DURUM.json'), 'utf8')),
    prompt: fs.readFileSync(path.join(plan, 'PROMPTLAR.md'), 'utf8'),
    legacy: JSON.parse(fs.readFileSync(path.join(tempRoot, 'kao3-premium/K3P-STATE.json'), 'utf8')),
    log: fs.readFileSync(path.join(plan, 'KAYIT.md'), 'utf8'),
  };
  const stateBytesBeforeReadOnlyModes = fs.readFileSync(path.join(plan, 'DURUM.json'), 'utf8');
  const logBytesBeforeReadOnlyModes = fs.readFileSync(path.join(plan, 'KAYIT.md'), 'utf8');

  const check = runCli(tempRoot);
  assert.equal(check.status, 0, `valid synthetic state should pass: ${check.stderr}`);
  assert.match(check.stdout, /PASS K3PD state\/prompt\/log uyumlu · 34 kart · nextPrompt=K3PD-00/);

  const next = runCli(tempRoot, ['--sonraki']);
  assert.equal(next.status, 0, next.stderr);
  assert.match(next.stdout, /Sıradaki aday: K3PD-00/);
  assert.doesNotMatch(next.stdout, /Body for K3PD-00/);

  const list = runCli(tempRoot, ['--liste']);
  assert.equal(list.status, 0, list.stderr);
  assert.equal((list.stdout.match(/^K3PD-\d{2}\t/gm) || []).length, 34);
  assert.match(list.stdout, /K3PD-00\tdone|K3PD-00\tin_progress/);

  const prompt = runCli(tempRoot, ['--prompt', 'K3PD-01']);
  assert.equal(prompt.status, 0, prompt.stderr);
  assert.match(prompt.stdout, /## K3PD-01 — synthetic fixture/);
  assert.doesNotMatch(prompt.stdout, /Body for K3PD-02/);
  assert.equal(fs.readFileSync(path.join(plan, 'DURUM.json'), 'utf8'), stateBytesBeforeReadOnlyModes);
  assert.equal(fs.readFileSync(path.join(plan, 'KAYIT.md'), 'utf8'), logBytesBeforeReadOnlyModes);

  const mutations = [
    ['missing execution ID', ({ state }) => { state.executionOrder.pop(); return {}; }, /executionOrder K3PD-00/],
    ['duplicate execution ID', ({ state }) => { state.executionOrder[2] = state.executionOrder[1]; return {}; }, /executionOrder K3PD-00/],
    ['out-of-order IDs', ({ state }) => { [state.executionOrder[0], state.executionOrder[1]] = [state.executionOrder[1], state.executionOrder[0]]; return {}; }, /executionOrder K3PD-00/],
    ['missing card record', ({ state }) => { delete state.cards['K3PD-33']; return {}; }, /cards anahtarları 34/],
    ['wrong nextPrompt', ({ state }) => { state.nextPrompt = 'K3PD-02'; return {}; }, /nextPrompt=K3PD-02/],
    ['missing decision', ({ state }) => { delete state.decisions.h4; return {}; }, /decisions.h4 eksik/],
    ['decision without logged owner response', ({ state }) => {
      state.decisions.h4.status = 'approved';
      state.decisions.h4.proposal = 'synthetic option';
      state.decisions.h4.options = ['synthetic option'];
      state.decisions.h4.response = 'synthetic owner response';
      state.decisions.h4.answeredAt = '2026-10-18';
      return {};
    }, /h4 karar state’i gerçek KAYIT karar makbuzuyla eşleşmiyor/],
    ['unaudited done card', ({ state }) => { state.cards['K3PD-01'].status = 'done'; return {}; }, /K3PD-01 done için bağımsız kabul hükmü gerekir/],
    ['done card without evidence', ({ state }) => { state.cards['K3PD-00'].status = 'done'; state.cards['K3PD-00'].auditVerdict = 'PASS'; return {}; }, /K3PD-00 done için evidenceRefs gerekir/],
    ['done card without passing checks', ({ state }) => { state.cards['K3PD-00'].status = 'done'; state.cards['K3PD-00'].auditVerdict = 'PASS'; state.cards['K3PD-00'].checks = []; state.cards['K3PD-00'].evidenceRefs = [planRel + '/kanit/K3PD-00/EVIDENCE.md']; return {}; }, /K3PD-00 done için tamamlanmış, exit 0 doğrulama kayıtları gerekir/],
    ['ready-for-audit without evidence', ({ state, log }) => {
      state.cards['K3PD-00'].status = 'ready_for_audit';
      state.cards['K3PD-00'].evidenceRefs = [];
      return { log: appendStateRecord(log, state) };
    }, /K3PD-00 ready_for_audit için evidenceRefs gerekir/],
    ['ready-for-audit without passing checks', ({ state, log }) => {
      state.cards['K3PD-00'].status = 'ready_for_audit';
      state.cards['K3PD-00'].checks = [];
      return { log: appendStateRecord(log, state) };
    }, /K3PD-00 ready_for_audit için tamamlanmış, exit 0 doğrulama kayıtları gerekir/],
    ['later card starts early', ({ state }) => { state.cards['K3PD-01'].status = 'in_progress'; state.cards['K3PD-01'].baseHead = 'b'.repeat(40); return {}; }, /K3PD-01 ilerletilmiş, önceki kartlar kapanmamış/],
    ['unauthorized source_ready', ({ state }) => { state.cards['K3PD-01'].status = 'source_ready'; return {}; }, /source_ready yalnız K3PD-11\/21/],
    ['source_ready finaled before K3PD-29', ({ state }) => { state.cards['K3PD-11'].status = 'done'; return {}; }, /K3PD-11 done için K3PD-29 görsel kabulü tamamlanmalı/],
    ['K3PD-29 closed before deferred cards', ({ state }) => { state.cards['K3PD-29'].status = 'done'; return {}; }, /K3PD-29 done iken K3PD-11 geç kanıt kapanmamış/],
    ['wrong state branch', ({ state }) => { state.branch = 'main'; return {}; }, /branch k3pd-denetim-duzeltmeleri olmalı/],
    ['main pin exception', ({ state }) => { state.pinDeferral.mainExceptions = ['index.html']; return {}; }, /main pin istisnası yasak/],
    ['wildcard pin path', ({ state }) => { state.pinDeferral.files = ['app/*.js']; return {}; }, /pinDeferral exact file yolu geçersiz/],
    ['unapproved candidate scope carryover', ({ state }) => { state.releaseApproval.scope = ['app/core/quranLearn.js']; return {}; }, /NOT_APPROVED yayın eski\/onaysız aday kapsamı/],
    ['verified external gate without evidence', ({ state }) => { state.externalGates.device.status = 'verified'; return {}; }, /kanıtsız verified olamaz/],
    ['unauthorized protected path', ({ state }) => { state.cards['K3PD-00'].changedPaths.push('kao3-premium/KAPANIS.md'); return {}; }, /korunmuş yol değiştiremez/],
    ['unknown source path', ({ state }) => { state.cards['K3PD-00'].changedPaths.push('app/core/quranLearn.js'); return {}; }, /K3PD-00 allowlist dışı yol/],
  ['missing end marker', ({ prompt }) => ({ prompt: prompt.replace('<!-- /PROMPT K3PD-00 -->', '<!-- missing end -->') }), /iç içe prompt işareti|işaret eşleşmiyor/],
    ['duplicate start marker', ({ prompt }) => ({ prompt: prompt.replace('<!-- PROMPT K3PD-00 -->', '<!-- PROMPT K3PD-00 -->\n<!-- PROMPT K3PD-00 -->') }), /yinelenen başlangıç işareti: K3PD-00/],
    ['legacy release drift', ({ legacy }) => { legacy.releaseApproval = 'NOT_APPROVED'; return { legacy }; }, /eski K3P 37\/37 completed/],
    ['release without owner approval', ({ state }) => { state.releaseApproval.status = 'APPROVED'; return {}; }, /APPROVED yayın için aday SHA/],
    ['released before K3PD-33', ({ state }) => { state.status = 'released'; return {}; }, /released için K3PD-33/],
    ['append-only log rewrite', ({ log }) => ({ log: log.replace('Synthetic fixture record.', 'Rewritten prior record.') }), /KAYIT.md önceki Git içeriğini korumuyor/],
  ];
  for (const [label, mutate, pattern] of mutations) expectRejected(tempRoot, baseline, mutate, pattern, label);

  const badArg = runCli(tempRoot, ['--sonraki', '--liste']);
  assert.equal(badArg.status, 2, 'ambiguous CLI mode should be rejected');
  const missingPromptId = runCli(tempRoot, ['--prompt']);
  assert.equal(missingPromptId.status, 2, 'missing --prompt ID should be rejected');
  const unknownPrompt = runCli(tempRoot, ['--prompt', 'K3PD-99']);
  assert.equal(unknownPrompt.status, 1, 'unknown prompt ID should be rejected');
  assert.match(`${unknownPrompt.stdout}${unknownPrompt.stderr}`, /Prompt bulunamadı: K3PD-99/);

  for (const [sourceId, nextId] of [['K3PD-11', 'K3PD-12'], ['K3PD-21', 'K3PD-22']]) {
    const sourceReadyRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'k3pd-source-ready-'));
    try {
      writeSourceReadyFixture(sourceReadyRoot, sourceId);
      const sourceReadyCheck = runCli(sourceReadyRoot);
      assert.equal(sourceReadyCheck.status, 0, `${sourceId} with K3PD-29 dependency may be source_ready: ${sourceReadyCheck.stderr}`);
      const sourceReadyNext = runCli(sourceReadyRoot, ['--sonraki']);
      assert.equal(sourceReadyNext.status, 0, sourceReadyNext.stderr);
      assert.match(sourceReadyNext.stdout, new RegExp('Sıradaki aday: ' + nextId));
    } finally {
      fs.rmSync(sourceReadyRoot, { recursive: true, force: true });
    }
  }

  const wrongBranchRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'k3pd-branch-'));
  try {
    writeFixture(wrongBranchRoot, { currentBranch: 'main' });
    const wrongBranch = runCli(wrongBranchRoot);
    assert.notEqual(wrongBranch.status, 0, 'main branch must fail closed');
    assert.match(`${wrongBranch.stdout}${wrongBranch.stderr}`, /canlı Git dalı k3pd-denetim-duzeltmeleri değil: main/);
  } finally {
    fs.rmSync(wrongBranchRoot, { recursive: true, force: true });
  }

  console.log(`PASS test_k3pd_control: valid CLI modes + ${mutations.length + 4} control negative cases + ${pinDeferralCases.k3pd} K3PD and ${pinDeferralCases.legacy} legacy pin-policy cases; source_ready K3PD-11→12 and K3PD-21→22; 34 synthetic prompt IDs; no network or task-checkout writes`);
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

async function testK3pdGateContracts() {
  const gatePath = path.join(repoRoot, 'kao3-premium/duzeltme-plani/araclar/kapi.mjs');
  const gate = await import(pathToFileURL(gatePath).href);
  const promptBefore = '<!-- PROMPT K3PD-28 -->\n**Yazma allowlist’i:** old paths\n**Uygula:** body\n<!-- /PROMPT K3PD-28 -->\n';
  const promptAfter = promptBefore.replace('old paths', 'new exact paths');
  assert.equal(gate.sameExceptPromptAllowlist(promptBefore, promptAfter), true, 'only K3PD-28 allowlist line may change');
  assert.equal(gate.sameExceptPromptAllowlist(promptBefore, promptAfter.replace('**Uygula:** body', '**Uygula:** altered')), false,
    'changes outside the K3PD-28 allowlist must fail');
  assert.deepEqual(gate.parseArgs(['--kart', 'K3PD-28', '--yavas']), { mode: 'kart', slow: true });
  assert.deepEqual(gate.parseArgs(['--final', '--yavas']), { mode: 'final', slow: true });
  for (const args of [[], ['--kart', 'K3PD-29'], ['--final', 'K3PD-28'], ['--kart', 'K3PD-28', '--kart', 'K3PD-28'],
    ['--kart', 'K3PD-28', '--yavas', '--yavas'], ['--final', '--unknown']]) {
    assert.ok(gate.parseArgs(args).error, `invalid gate args should fail: ${args.join(' ')}`);
  }
  const inventoryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'k3pd-final-inventory-'));
  try {
    assert.throws(() => gate.collectFinalFixtureFiles(inventoryRoot), /required fixture directory missing/,
      'missing final test family must fail closed');
    for (const dir of ['tests/kao', 'tests/app', 'tests/panel', 'tests/panel-v2', 'tests/quran']) {
      fs.mkdirSync(path.join(inventoryRoot, dir), { recursive: true });
    }
    assert.throws(() => gate.collectFinalFixtureFiles(inventoryRoot), /required fixture family has zero tests/,
      'zero final fixtures must fail closed');
    for (const [dir, name] of [['tests/kao', 'test_fixture.js'], ['tests/app', 'test_fixture.js'],
      ['tests/panel', 'test_fixture.js'], ['tests/panel-v2', 'test_panel_v2_fixture.js'], ['tests/quran', 'test_fixture.js']]) {
      fs.writeFileSync(path.join(inventoryRoot, dir, name), '// synthetic fixture inventory only\n');
    }
    fs.writeFileSync(path.join(inventoryRoot, 'tests/kao/test_kao_freeze_repro.js'), '// included fixture\n');
    const inventory = gate.collectFinalFixtureFiles(inventoryRoot);
    assert.equal(inventory.files.length, 6);
    assert.equal(inventory.inventory['tests/kao'], 2);
  } finally {
    fs.rmSync(inventoryRoot, { recursive: true, force: true });
  }
  const accepted = gate.assessUpperBound('synthetic full lesson', 42, 40,
    { status: 'approved', maximum: 42, reference: 'K3PD-23#goalException' });
  assert.equal(accepted.status, 'NOT_MET', 'accepted deviation must preserve raw target miss');
  assert.equal(accepted.disposition, 'ACCEPTED_DEVIATION');
  assert.equal(accepted.countedAsPass, false, 'accepted deviation must not increase PASS count');
  assert.equal(gate.assessUpperBound('synthetic missing', Number.NaN, 25).disposition, 'NOT_MEASURED');
  assert.equal(gate.assessUpperBound('synthetic overflow', 43, 40,
    { status: 'approved', maximum: 42, reference: 'K3PD-23#goalException' }).disposition, 'NOT_MET');

  const flowProfile = (fresh) => ({
    lessonCount: 109, startedLessons: 109, completedLessons: 109, coverageComplete: true,
    maxPassiveRun: fresh ? 2 : 1, maxNoveltyTouch: 7, introductions: 109,
    freshOpeningPairOnly: fresh ? true : null,
    visibleText: {
      goal: { screens: 109, minWords: 19, maxWords: 25, emptyScreens: 0, limit: 25, overLimit: 0 },
      intro: { screens: 109, minWords: 39, maxWords: 45, emptyScreens: 0, limit: 45, overLimit: 0 },
      concept: { screens: 109, minWords: 39, maxWords: 45, emptyScreens: 0, limit: 45, overLimit: 0 },
    },
  });
  const flow = {
    schema: 'k3pd.flow-measurement', schemaVersion: 1, source: 'kaoOverlayHTML:first-view',
    selectedLesson: { openingToFirstTaskTouches: 2, reachedFirstTask: true, taskCount: 30, maxPassiveRun: 1, maxNoveltyTouch: 2 },
    profiles: { fresh: flowProfile(true), established: flowProfile(false) },
  };
  const touchArm = (maxTouches) => ({ lessonCount: 109, startedLessons: 109, completedLessons: 109, validLessons: 109,
    coverageComplete: true, minTouches: 30, maxTouches, meanTouches: 40.2,
    above40: maxTouches > 40 ? 24 : 0, above42: maxTouches > 42 ? 7 : 0 });
  const touch = {
    schema: 'k3pd.touch-measurement', schemaVersion: 1,
    source: 'kaoLesson/kaoAnswer/kaoContinue actual handler sequence', expectedLessonCount: 109, scope: 'all-current-lessons',
    selectedLesson: { lessonId: 'u01.01',
      autoAdvanceOff: { started: true, completed: true, total: 72 },
      autoAdvanceOn: { started: true, completed: true, total: 42 },
      autoAdvanceOnFromHome: { started: true, completed: true, total: 43 } },
    profiles: { autoAdvanceOff: touchArm(76), autoAdvanceOn: touchArm(46), autoAdvanceOnFromHome: touchArm(47) },
  };
  const recognitionTarget = (numerator, denominator, disposition, deviationRef = null) => {
    const share = Number((numerator / denominator).toFixed(6));
    return { numerator, denominator, share, percent: Number((share * 100).toFixed(2)), maxShare: 0.6, maxPercent: 60,
      status: share <= 0.6 ? 'PASS' : 'NOT_MET', approvedDeviationRef: deviationRef, disposition,
      decisionRef: 'K3PD-24#recognition:A', binding: disposition === 'PASS' };
  };
  const fullRuns = { plannedLessons: 109, startedLessons: 109, completedLessons: 109, coverageComplete: true };
  const recognition = {
    schema: 'k3pd.recognition-gate', schemaVersion: 1, decisionRef: 'K3PD-24#recognition:A',
    gate: { status: 'PASS', exitCode: 0, violations: [] },
    cohorts: Object.fromEntries(['fresh', 'established', 'mixedRepeat'].map((name) => [name,
      { lessonCount: 109, validTaskCount: 100, invalidTaskCount: 0, lessonRuns: { ...fullRuns } }])),
    targets: {
      legacyGeneralFresh: recognitionTarget(1010, 1087, 'ACCEPTED_DEVIATION', ACCEPTED_RECOGNITION_REF),
      legacyGeneralEstablished: recognitionTarget(1025, 1125, 'ACCEPTED_DEVIATION', ACCEPTED_RECOGNITION_REF),
      matureRepeatR1: recognitionTarget(648, 1324, 'PASS'),
    },
    approvedDeviation: { status: 'APPROVED', reference: ACCEPTED_RECOGNITION_REF, disposition: 'ACCEPTED_DEVIATION',
      operativeTarget: 'matureRepeatR1', appliesTo: ['legacyGeneralFresh', 'legacyGeneralEstablished'] },
  };
  const decisions = {
    goalException: { status: 'approved', response: 'A — Hedefi 42\'ye çek', scope: 'limit ≤40 yerine 42', sourceRef: 'Kullanıcı yanıtı 2026-10-24' },
    recognition: { status: 'approved', approvedDeviationRef: ACCEPTED_RECOGNITION_REF },
  };
  const result = gate.evaluateMeasurements(flow, touch, recognition, decisions);
  assert.equal(result.status, 'PASS', JSON.stringify(result.issues));
  assert.equal(result.acceptedDeviationCount, 3, 'canonical full-lesson and two recognition deviations remain separate from raw PASS');
  assert.equal(result.rawPassCount, result.metrics.filter((item) => item.status === 'PASS').length);
  assert.ok(result.metrics.filter((item) => item.disposition === 'ACCEPTED_DEVIATION').every((item) => !item.countedAsPass));

  const violations = [
    ['goal', (f) => { f.profiles.fresh.visibleText.goal.maxWords = 26; }],
    ['intro', (f) => { f.profiles.established.visibleText.intro.maxWords = 46; }],
    ['concept', (f) => { f.profiles.fresh.visibleText.concept.maxWords = 46; }],
    ['passive', (f) => { f.profiles.established.maxPassiveRun = 2; }],
    ['novelty', (f) => { f.profiles.established.maxNoveltyTouch = 8; }],
    ['entry', (f) => { f.selectedLesson.openingToFirstTaskTouches = 3; }],
    ['canonical full lesson over approved deviation', (_f, t) => { t.selectedLesson.autoAdvanceOn.total = 43; }],
    ['new user missing opening policy', (f) => { f.profiles.fresh.freshOpeningPairOnly = false; }],
    ['missing measure', (f) => { delete f.profiles.established.visibleText.concept; }],
    ['NaN measure', (f) => { f.profiles.fresh.visibleText.goal.maxWords = Number.NaN; }],
    ['empty visible render', (f) => { f.profiles.fresh.visibleText.goal.minWords = 0; f.profiles.fresh.visibleText.goal.emptyScreens = 1; }],
    ['missing render metric', (f) => { delete f.profiles.fresh.visibleText.goal.minWords; }],
    ['zero fixtures', (f) => { f.profiles.established.completedLessons = 0; f.profiles.established.coverageComplete = false; }],
  ];
  for (const [name, mutate] of violations) {
    const f = structuredClone(flow), t = structuredClone(touch);
    mutate(f, t);
    const changed = gate.evaluateMeasurements(f, t, recognition, decisions);
    assert.equal(changed.status, 'FAIL', `${name} must fail closed`);
  }
  const badDecision = structuredClone(decisions);
  badDecision.goalException.status = 'pending';
  assert.equal(gate.evaluateMeasurements(flow, touch, recognition, badDecision).status, 'FAIL', 'missing deviation decision must fail');
  const badRecognition = structuredClone(recognition);
  badRecognition.targets.matureRepeatR1.numerator = 900;
  badRecognition.targets.matureRepeatR1.share = Number((900 / 1324).toFixed(6));
  badRecognition.targets.matureRepeatR1.percent = Number((900 / 1324 * 100).toFixed(2));
  badRecognition.targets.matureRepeatR1.status = 'NOT_MET';
  badRecognition.targets.matureRepeatR1.disposition = 'NOT_MET';
  badRecognition.gate = { status: 'FAIL', exitCode: 1, violations: [{ type: 'target' }] };
  assert.equal(gate.evaluateMeasurements(flow, touch, badRecognition, decisions).status, 'FAIL', 'recognition target miss must fail');
  const missingRecognitionCount = structuredClone(recognition);
  delete missingRecognitionCount.cohorts.fresh.validTaskCount;
  assert.equal(gate.evaluateMeasurements(flow, touch, missingRecognitionCount, decisions).status, 'FAIL', 'missing recognition numerator must fail');
  const fractionalRecognitionCount = structuredClone(recognition);
  fractionalRecognitionCount.targets.matureRepeatR1.numerator = 648.5;
  assert.equal(gate.evaluateMeasurements(flow, touch, fractionalRecognitionCount, decisions).status, 'FAIL', 'fractional recognition count must fail');

  assert.equal(gate.parseMeasurementPayload('SKIP local input missing', 0, 'k3pd.flow-measurement').ok, false, 'SKIP exit 0 is missing evidence');
  assert.equal(gate.parseMeasurementPayload('{"schema":"k3pd.flow-measurement","schemaVersion":2}', 0, 'k3pd.flow-measurement').ok, false, 'wrong version must fail');
  assert.equal(gate.parseMeasurementPayload('{"schema":"k3pd.flow-measurement","schemaVersion":1}', 1, 'k3pd.flow-measurement').ok, false, 'child exit 1 must fail');
  assert.equal(gate.parseMeasurementPayload('', 0, 'k3pd.flow-measurement').ok, false, 'empty report must fail');
  assert.equal(gate.parseMeasurementPayload('{"schema":"k3pd.flow-measurement","schemaVersion":1,"value":NaN}', 0, 'k3pd.flow-measurement').ok, false, 'non-JSON NaN must fail');

  const completeState = { program: 'K3PD', status: 'active', branch: K3PD_BRANCH, nextPrompt: 'K3PD-31',
    cards: Object.fromEntries(Array.from({ length: 31 }, (_unused, i) => {
    const id = `K3PD-${String(i).padStart(2, '0')}`; return [id, { status: 'done', auditVerdict: 'PASS' }];
  })), decisions: Object.fromEntries(['h4', 'timeBudget', 'recognition', 'goalException'].map((id) => [id, { status: 'approved' }])),
    pinDeferral: { branch: K3PD_BRANCH, until: 'K3PD-32', files: ['app/core/quranLearn.js'], mainExceptions: [] },
    releaseApproval: { status: 'NOT_APPROVED', candidateSha: null } };
  assert.deepEqual(gate.finalPrerequisites(completeState), []);
  const missingFinal = structuredClone(completeState);
  missingFinal.cards['K3PD-29'].status = 'todo';
  missingFinal.cards['K3PD-30'].status = 'todo';
  missingFinal.cards['K3PD-21'].status = 'source_ready';
  assert.ok(gate.finalPrerequisites(missingFinal).some((item) => item.startsWith('K3PD-29')));
  assert.ok(gate.finalPrerequisites(missingFinal).some((item) => item.startsWith('K3PD-30')));
  assert.ok(gate.finalPrerequisites(missingFinal).some((item) => item.startsWith('K3PD-21')));
  const wrongFinalCard = structuredClone(completeState);
  wrongFinalCard.nextPrompt = 'K3PD-30';
  assert.ok(gate.finalPrerequisites(wrongFinalCard).some((item) => item.includes('nextPrompt')));
  const unauthorizedDeferral = structuredClone(completeState);
  unauthorizedDeferral.pinDeferral.files = ['app/core/*.js'];
  assert.equal(gate.validatePinPolicy(unauthorizedDeferral.pinDeferral), false, 'wildcard pin deferral must fail');
  unauthorizedDeferral.pinDeferral = { ...completeState.pinDeferral, branch: 'main' };
  assert.equal(gate.validatePinPolicy(unauthorizedDeferral.pinDeferral), false, 'main pin deferral must fail');
  unauthorizedDeferral.decisions.recognition.status = 'pending';
  assert.ok(gate.finalPrerequisites(unauthorizedDeferral).some((item) => item.startsWith('decision:recognition')));

  const canaries = ['SYNTHETIC_WORD_CANARY', 'SYNTHETIC_ID_CANARY', 'SYNTHETIC_NOTE_CANARY', 'SYNTHETIC_TOKEN_CANARY', 'SYNTHETIC_FILE_CANARY'];
  flow.debugText = canaries.join(' '); touch.debugText = canaries.join(' '); recognition.debugText = canaries.join(' ');
  const publicResult = JSON.stringify(gate.evaluateMeasurements(flow, touch, recognition, decisions));
  for (const canary of canaries) assert.equal(publicResult.includes(canary), false, `${canary} must not leak into the report`);
  const parseFailure = JSON.stringify(gate.parseMeasurementPayload(`${canaries.join(' ')} SKIP`, 0, 'k3pd.flow-measurement'));
  for (const canary of canaries) assert.equal(parseFailure.includes(canary), false, `${canary} must not leak in diagnostics`);
  console.log(`PASS K3PD gate contracts: thresholds ${violations.length}/13 fail-closed; empty render/invalid count/CLI/PROMPT scope; child/SKIP/version/NaN; accepted deviation raw NOT_MET; final evidence and exact pin policy; 5 synthetic leak canaries`);
}

testK3pdGateContracts().catch((error) => {
  console.error(`FAIL K3PD gate contracts: ${error.stack || error.message}`);
  process.exitCode = 1;
});
