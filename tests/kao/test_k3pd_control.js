'use strict';

// K3PD-00 · ağsız/sentetik repo üzerinde gerçek durum.mjs CLI davranış testi.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
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
