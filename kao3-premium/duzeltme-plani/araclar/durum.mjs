#!/usr/bin/env node
// K3PD control-plane reader. This command never writes to the repository.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const PLAN_REL = 'kao3-premium/duzeltme-plani';
const EXPECTED_BRANCH = 'k3pd-denetim-duzeltmeleri';
const EXPECTED_RELEASE = 'NOT_APPROVED';
const LEGACY_STATE_REL = 'kao3-premium/K3P-STATE.json';
const PROTECTED_PATHS = new Set([
  'kao3-premium/KAPANIS.md',
  'kao3-premium/README.md',
  'kao3-premium/kanit/sonraki/GORSEL-KANIT.md',
]);
const CARD_STATUSES = new Set([
  'todo', 'in_progress', 'ready_for_audit', 'source_ready', 'done',
  'awaiting_owner_decision', 'blocked',
]);
const PROGRAM_STATUSES = new Set([
  'planned', 'active', 'awaiting_owner_decision', 'local_verified',
  'release_candidate', 'awaiting_release_approval', 'released', 'blocked',
]);
const VERDICTS = new Set([
  'PASS', 'PARTIAL', 'FAIL', 'UNVERIFIABLE', 'ACCEPTED_DEVIATION',
  'EVIDENCE_PENDING', 'NOT_MEASURED', 'BLOCKED', 'AWAITING_OWNER_DECISION',
]);
const DECISION_STATUSES = new Set(['pending', 'proposed', 'approved', 'rejected']);
const EXTERNAL_GATES = ['device', 'screenReader', 'L2', 'audio230', 'study14', 'study30', 'remoteParity'];
const EXPECTED_IDS = Array.from({ length: 34 }, (_, index) => `K3PD-${String(index).padStart(2, '0')}`);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '../../..');
const planDir = path.join(root, PLAN_REL);
const files = {
  prompt: path.join(planDir, 'PROMPTLAR.md'),
  controller: path.join(planDir, 'DENETLEYICI.md'),
  state: path.join(planDir, 'DURUM.json'),
  current: path.join(planDir, 'GUNCEL-DURUM.md'),
  log: path.join(planDir, 'KAYIT.md'),
  legacy: path.join(root, LEGACY_STATE_REL),
};

function issue(message) {
  return `✕ ${message}`;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isSha(value) {
  return typeof value === 'string' && /^[0-9a-f]{40}$/i.test(value);
}

function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function safeRepoPath(value) {
  if (typeof value !== 'string' || !value || value.includes('\\') || value.includes('*')) return false;
  if (path.posix.isAbsolute(value) || value.endsWith('/')) return false;
  const normalized = path.posix.normalize(value);
  if (normalized !== value || normalized === '.' || normalized.split('/').includes('..')) return false;
  const resolved = path.resolve(root, value);
  return resolved.startsWith(`${root}${path.sep}`) && fs.existsSync(resolved) && fs.statSync(resolved).isFile();
}

function parsePromptBlocks(markdown, errors) {
  const blocks = new Map();
  const headings = new Map();
  const lines = markdown.split(/\r?\n/);
  let open = null;
  let body = [];
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const marker = line.match(/^<!-- (\/)?PROMPT (K3PD-\d{2}) -->$/);
    if (marker) {
      const closing = marker[1] === '/';
      const id = marker[2];
      if (!closing) {
        if (open !== null) errors.push(issue(`iç içe prompt işareti: ${open} → ${id}`));
        if (blocks.has(id) || open === id) errors.push(issue(`yinelenen başlangıç işareti: ${id}`));
        open = id;
        body = [];
        continue;
      }
      if (open === null) {
        errors.push(issue(`eşleşmeyen bitiş işareti: ${id}`));
      } else if (open !== id) {
        errors.push(issue(`işaret eşleşmiyor: ${open} başladı, ${id} bitti`));
        open = null;
        body = [];
      } else {
        const text = body.join('\n').trim();
        blocks.set(id, text);
        const title = text.split('\n').find((candidate) => candidate.startsWith(`## ${id} `));
        if (!title) errors.push(issue(`${id} başlığı işaretler arasında yok`));
        headings.set(id, title || id);
        open = null;
        body = [];
      }
      continue;
    }
    if (open !== null) body.push(line);
  }
  if (open !== null) errors.push(issue(`bitiş işareti eksik: ${open}`));
  const ids = Array.from(blocks.keys());
  if (ids.length !== EXPECTED_IDS.length || EXPECTED_IDS.some((id, index) => ids[index] !== id)) {
    errors.push(issue(`prompt işaretleri 34 ID ve doğru sırada olmalı (bulundu ${ids.length})`));
  }
  return { blocks, headings };
}

function cardZeroAllowlist() {
  return new Set([
    `${PLAN_REL}/PROMPTLAR.md`,
    `${PLAN_REL}/DENETLEYICI.md`,
    `${PLAN_REL}/DURUM.json`,
    `${PLAN_REL}/GUNCEL-DURUM.md`,
    `${PLAN_REL}/KAYIT.md`,
    `${PLAN_REL}/araclar/durum.mjs`,
    `${PLAN_REL}/kanit/K3PD-00/EVIDENCE.md`,
    'tests/kao/test_k3pd_control.js',
    'tests/kao/README.md',
  ]);
}

function allowedPathsFor(id, promptBody) {
  if (id === 'K3PD-00') return cardZeroAllowlist();
  const result = new Set([`${PLAN_REL}/kanit/${id}`]);
  const match = promptBody.match(/\*\*Yazma allowlist’i:\*\*([\s\S]*?)(?=\n\*\*Uygula:\*\*)/);
  if (!match) return result;
  for (const [, raw] of match[1].matchAll(/`([^`]+)`/g)) {
    let candidate = raw.trim();
    if (!candidate || candidate.includes('*') || candidate.includes(' ')) continue;
    if (candidate.startsWith('../')) candidate = path.posix.normalize(`${PLAN_REL}/${candidate}`);
    else if (!candidate.includes('/')) candidate = `${PLAN_REL}/${candidate}`;
    result.add(candidate);
  }
  return result;
}

function readJson(file, label, errors) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push(issue(`${label} okunamadı: ${error.message}`));
    return null;
  }
}

function validateState(state, promptBlocks, errors) {
  if (!isObject(state)) {
    errors.push(issue('DURUM.json kök nesne değil'));
    return;
  }
  if (state.program !== 'K3PD') errors.push(issue('program K3PD değil'));
  if (state.planVersion !== 1) errors.push(issue('planVersion 1 değil'));
  if (state.branch !== EXPECTED_BRANCH) errors.push(issue(`branch ${EXPECTED_BRANCH} olmalı`));
  if (!isSha(state.baselineHead)) errors.push(issue('baselineHead 40 haneli SHA değil'));
  if (!PROGRAM_STATUSES.has(state.status)) errors.push(issue(`geçersiz program status: ${state.status}`));
  if (!Array.isArray(state.executionOrder)
    || state.executionOrder.length !== EXPECTED_IDS.length
    || EXPECTED_IDS.some((id, index) => state.executionOrder[index] !== id)) {
    errors.push(issue('executionOrder K3PD-00…K3PD-33 sırasındaki 34 ID olmalı'));
  }
  if (!isObject(state.cards)) {
    errors.push(issue('cards nesne olmalı'));
  } else {
    const ids = Object.keys(state.cards);
    if (ids.length !== EXPECTED_IDS.length || EXPECTED_IDS.some((id) => !Object.hasOwn(state.cards, id))) {
      errors.push(issue('cards anahtarları 34 tekil prompt ID’si olmalı'));
    }
    for (const id of EXPECTED_IDS) {
      const card = state.cards[id];
      if (!isObject(card)) {
        errors.push(issue(`${id} kart kaydı nesne değil`));
        continue;
      }
      for (const key of ['id', 'status', 'baseHead', 'changedPaths', 'checks', 'auditVerdict', 'evidenceRefs', 'acceptanceDependencies']) {
        if (!Object.hasOwn(card, key)) errors.push(issue(`${id}.${key} eksik`));
      }
      if (card.id !== id) errors.push(issue(`${id}.id anahtarla eşleşmiyor`));
      if (!CARD_STATUSES.has(card.status)) errors.push(issue(`${id} geçersiz status: ${card.status}`));
      if (card.baseHead !== null && !isSha(card.baseHead)) errors.push(issue(`${id}.baseHead SHA/null olmalı`));
      for (const field of ['changedPaths', 'checks', 'evidenceRefs', 'acceptanceDependencies']) {
        if (!Array.isArray(card[field])) errors.push(issue(`${id}.${field} dizi olmalı`));
      }
      if (Array.isArray(card.changedPaths)) {
        const duplicates = card.changedPaths.filter((value, index, values) => values.indexOf(value) !== index);
        if (duplicates.length) errors.push(issue(`${id} changedPaths yineleniyor`));
        const allowlist = allowedPathsFor(id, promptBlocks.get(id) || '');
        for (const candidate of card.changedPaths) {
          if (!safeRepoPath(candidate)) errors.push(issue(`${id} güvenli/var olan repo yolu değil: ${candidate}`));
          if (PROTECTED_PATHS.has(candidate)) errors.push(issue(`${id} korunmuş yol değiştiremez: ${candidate}`));
          const isEvidence = candidate.startsWith(`${PLAN_REL}/kanit/${id}/`);
          const isCardZeroEvidence = id === 'K3PD-00' && candidate.startsWith(`${PLAN_REL}/kanit/K3PD-00/`);
          if (!allowlist.has(candidate) && !isEvidence && !isCardZeroEvidence) {
            errors.push(issue(`${id} allowlist dışı yol: ${candidate}`));
          }
        }
      }
      if (Array.isArray(card.checks)) {
        for (const [index, check] of card.checks.entries()) {
          if (!isObject(check) || typeof check.command !== 'string' || !check.command.trim()
            || !isObject(check.env) || !Number.isInteger(check.exitCode)
            || !isObject(check.measurements)) {
            errors.push(issue(`${id}.checks[${index}] command/env/exitCode/measurements sözleşmesine uymuyor`));
          }
        }
      }
      if (Array.isArray(card.evidenceRefs)) {
        for (const ref of card.evidenceRefs) {
          if (typeof ref !== 'string' || !ref || ref.includes('..')) errors.push(issue(`${id} geçersiz evidenceRef`));
          else if (!fs.existsSync(path.join(root, ref))) errors.push(issue(`${id} evidenceRef bulunamadı: ${ref}`));
        }
      }
      if (Array.isArray(card.acceptanceDependencies)) {
        for (const dependency of card.acceptanceDependencies) {
          if (!EXPECTED_IDS.includes(dependency)) errors.push(issue(`${id} bilinmeyen acceptanceDependency: ${dependency}`));
        }
      }
      if (card.status === 'todo' && card.baseHead !== null) errors.push(issue(`${id} todo iken baseHead boş olmalı`));
      if (card.status === 'done') {
        if (!isSha(card.baseHead)) errors.push(issue(`${id} done için baseHead gerekir`));
        if (!Array.isArray(card.changedPaths) || card.changedPaths.length === 0) errors.push(issue(`${id} done için changedPaths gerekir`));
        if (!Array.isArray(card.checks) || card.checks.length === 0
          || card.checks.some((check) => !Number.isInteger(check?.exitCode) || check.exitCode !== 0)) {
          errors.push(issue(`${id} done için tamamlanmış, exit 0 doğrulama kayıtları gerekir`));
        }
        if (!Array.isArray(card.evidenceRefs) || card.evidenceRefs.length === 0) errors.push(issue(`${id} done için evidenceRefs gerekir`));
        if (!['PASS', 'ACCEPTED_DEVIATION'].includes(card.auditVerdict)) errors.push(issue(`${id} done için bağımsız kabul hükmü gerekir`));
      }
      if (card.status === 'ready_for_audit' && !['NOT_MEASURED', 'UNVERIFIABLE'].includes(card.auditVerdict)) {
        errors.push(issue(`${id} ready_for_audit iken bağımsız verdict bekleniyor durumunu korumalı`));
      }
      if (card.status === 'ready_for_audit') {
        if (!isSha(card.baseHead) || !Array.isArray(card.changedPaths) || card.changedPaths.length === 0) {
          errors.push(issue(`${id} ready_for_audit için baseHead ve changedPaths gerekir`));
        }
        if (!Array.isArray(card.checks) || card.checks.length === 0
          || card.checks.some((check) => !Number.isInteger(check?.exitCode) || check.exitCode !== 0)) {
          errors.push(issue(`${id} ready_for_audit için tamamlanmış, exit 0 doğrulama kayıtları gerekir`));
        }
        if (!Array.isArray(card.evidenceRefs) || card.evidenceRefs.length === 0) {
          errors.push(issue(`${id} ready_for_audit için evidenceRefs gerekir`));
        }
      }
      if (card.status === 'source_ready') {
        if (!['K3PD-11', 'K3PD-21'].includes(id)) errors.push(issue(`source_ready yalnız K3PD-11/21 için geçerli: ${id}`));
        if (card.auditVerdict !== 'EVIDENCE_PENDING') errors.push(issue(`${id} source_ready için EVIDENCE_PENDING gerekir`));
        if (!Array.isArray(card.checks) || card.checks.length === 0
          || card.checks.some((check) => !Number.isInteger(check?.exitCode) || check.exitCode !== 0)
          || !Array.isArray(card.evidenceRefs) || card.evidenceRefs.length === 0) {
          errors.push(issue(`${id} source_ready için kaynak kontrolleri ve kanıt referansı gerekir`));
        }
        if (!Array.isArray(card.acceptanceDependencies) || !card.acceptanceDependencies.includes('K3PD-29')) {
          errors.push(issue(`${id} source_ready K3PD-29 bağımlılığını taşımalı`));
        }
      }
    }
  }

  const actualBranch = currentBranch(errors);
  if (actualBranch !== EXPECTED_BRANCH) errors.push(issue(`canlı Git dalı ${EXPECTED_BRANCH} değil: ${actualBranch || '(boş)'}`));
  if (isSha(state.baselineHead)) {
    try {
      execFileSync('git', ['cat-file', '-e', `${state.baselineHead}^{commit}`], {
        cwd: root, stdio: ['ignore', 'ignore', 'ignore'],
      });
    } catch {
      errors.push(issue('baselineHead bu Git deposunda commit olarak bulunamadı'));
    }
  }

  validateDecisions(state.decisions, state.cards, errors);
  validateRelease(state.releaseApproval, errors);
  validatePinDeferral(state.pinDeferral, errors);
  validateExternalGates(state.externalGates, errors);
  validateLegacySnapshot(state.legacyProgram, state.baselineHead, errors);
  validateProgramStatus(state, errors);
  validateSourceReadyClosure(state.cards, errors);

  if (isObject(state.cards)) {
    const inFlight = EXPECTED_IDS.filter((id) => ['in_progress', 'ready_for_audit', 'awaiting_owner_decision', 'blocked'].includes(state.cards[id]?.status));
    if (inFlight.length > 1) errors.push(issue(`birden fazla açık kart var: ${inFlight.join(', ')}`));
    const order = Array.isArray(state.executionOrder) ? state.executionOrder : [];
    for (const [index, id] of order.entries()) {
      const card = state.cards[id];
      if (card && card.status !== 'todo') {
        const earlierOpen = order.slice(0, index).filter((previous) => {
          const previousStatus = state.cards[previous]?.status;
          return previousStatus !== 'done'
            && !(previousStatus === 'source_ready' && ['K3PD-11', 'K3PD-21'].includes(previous));
        });
        if (earlierOpen.length) errors.push(issue(`${id} ilerletilmiş, önceki kartlar kapanmamış: ${earlierOpen.join(', ')}`));
      }
      if (card?.status === 'done') {
        const earlierOpen = order.slice(0, index).filter((previous) => {
          const previousStatus = state.cards[previous]?.status;
          return previousStatus !== 'done'
            && !(previousStatus === 'source_ready' && ['K3PD-11', 'K3PD-21'].includes(previous));
        });
        if (earlierOpen.length) errors.push(issue(`${id} done, önceki açık kart var: ${earlierOpen.join(', ')}`));
      }
    }
    for (const id of ['K3PD-03', 'K3PD-05', 'K3PD-06', 'K3PD-25']) {
      const card = state.cards[id];
      if (card && card.status !== 'todo') {
        const requiredDecision = id === 'K3PD-03' ? state.decisions?.h4
          : ['K3PD-05', 'K3PD-06'].includes(id) ? state.decisions?.timeBudget
            : state.decisions?.recognition;
        if (!requiredDecision || !['approved', 'rejected'].includes(requiredDecision.status)) {
          errors.push(issue(`${id} açılmış fakat gerekli gerçek kullanıcı kararı çözülmemiş`));
        }
      }
    }
    const calculatedNext = deriveNext(state.cards);
    if (state.nextPrompt !== calculatedNext) errors.push(issue(`nextPrompt=${state.nextPrompt}; doğru aday ${calculatedNext}`));
  }
}

function currentBranch(errors) {
  try {
    execFileSync('git', ['rev-parse', '--verify', 'HEAD'], { cwd: root, encoding: 'utf8' });
    return execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim();
  } catch (error) {
    errors.push(issue(`Git dalı okunamadı: ${error.message}`));
    return '';
  }
}

function validateDecisions(decisions, cards, errors) {
  if (!isObject(decisions)) {
    errors.push(issue('decisions nesnesi eksik'));
    return;
  }
  for (const id of ['h4', 'timeBudget', 'recognition']) {
    const decision = decisions[id];
    if (!isObject(decision)) {
      errors.push(issue(`decisions.${id} eksik`));
      continue;
    }
    if (!DECISION_STATUSES.has(decision.status)) errors.push(issue(`decisions.${id}.status geçersiz`));
    if (typeof decision.topic !== 'string' || !decision.topic.trim()) errors.push(issue(`decisions.${id}.topic eksik`));
    if (decision.proposal !== null && typeof decision.proposal !== 'string') errors.push(issue(`decisions.${id}.proposal string/null olmalı`));
    if (!Array.isArray(decision.options) || decision.options.some((option) => typeof option !== 'string')) {
      errors.push(issue(`decisions.${id}.options string[] olmalı`));
    }
    if (decision.response !== null && typeof decision.response !== 'string') errors.push(issue(`decisions.${id}.response string/null olmalı`));
    if (decision.answeredAt !== null && !isIsoDate(decision.answeredAt)) errors.push(issue(`decisions.${id}.answeredAt YYYY-MM-DD/null olmalı`));
    if (typeof decision.sourceRef !== 'string' || !decision.sourceRef.trim()) errors.push(issue(`decisions.${id}.sourceRef eksik`));
    if (typeof decision.scope !== 'string' || !decision.scope.trim()) errors.push(issue(`decisions.${id}.scope eksik`));
    if (['approved', 'rejected'].includes(decision.status) && (!decision.response || !decision.answeredAt)) {
      errors.push(issue(`decisions.${id} ${decision.status} iken gerçek yanıt/tarih eksik`));
    }
    if (decision.status !== 'pending'
      && (typeof decision.proposal !== 'string' || !decision.proposal.trim()
        || !Array.isArray(decision.options) || decision.options.length === 0)) {
      errors.push(issue(`decisions.${id} proposed/closed iken öneri ve seçenekler gerekir`));
    }
    if (['pending', 'proposed'].includes(decision.status) && (decision.response !== null || decision.answeredAt !== null)) {
      errors.push(issue(`decisions.${id} ${decision.status} iken yanıt/tarih taşıyamaz`));
    }
  }
  for (const [id, decision] of Object.entries(decisions)) {
    if (['h4', 'timeBudget', 'recognition'].includes(id)) continue;
    if (id !== 'goalException' && !/^schema-[a-z0-9-]+$/.test(id)) errors.push(issue(`bilinmeyen karar anahtarı: ${id}`));
    if (!isObject(decision) || !DECISION_STATUSES.has(decision.status)
      || typeof decision.topic !== 'string' || !decision.topic.trim()
      || (decision.proposal !== null && typeof decision.proposal !== 'string')
      || !Array.isArray(decision.options) || decision.options.some((option) => typeof option !== 'string')
      || (decision.response !== null && typeof decision.response !== 'string')
      || (decision.answeredAt !== null && !isIsoDate(decision.answeredAt))
      || typeof decision.sourceRef !== 'string' || !decision.sourceRef.trim()
      || typeof decision.scope !== 'string' || !decision.scope.trim()) {
      errors.push(issue(`${id} karar kaydı eksik veya geçersiz`));
    } else if (['approved', 'rejected'].includes(decision.status)
      && (!decision.response || !decision.answeredAt || !decision.proposal || decision.options.length === 0)) {
      errors.push(issue(`${id} kararında gerçek yanıt, tarih, öneri ve seçenekler zorunlu`));
    } else if (['pending', 'proposed'].includes(decision.status)
      && (decision.response !== null || decision.answeredAt !== null)) {
      errors.push(issue(`${id} kararında pending/proposed iken cevap/tarih bulunamaz`));
    }
  }
  if (cards?.['K3PD-02']?.status !== 'todo' && decisions.h4?.status === 'pending') {
    errors.push(issue('K3PD-02 başlatılmadan önce h4 kararı pending olmalı; kart açık/kapalı uyumsuz'));
  }
}

function validateRelease(release, errors) {
  if (!isObject(release)) {
    errors.push(issue('releaseApproval nesnesi eksik'));
    return;
  }
  if (!['NOT_APPROVED', 'APPROVED'].includes(release.status)) errors.push(issue('releaseApproval.status geçersiz'));
  if (release.status === 'APPROVED') {
    if (!isSha(release.candidateSha) || !Array.isArray(release.scope) || release.scope.length === 0
      || typeof release.response !== 'string' || !release.response.trim()
      || !isIsoDate(release.approvedAt) || typeof release.sourceRef !== 'string' || !release.sourceRef.trim()) {
      errors.push(issue('APPROVED yayın için aday SHA, exact scope ve gerçek onay/tarih/kaynak gerekir'));
    }
  } else if (release.candidateSha !== null || release.response !== null || release.approvedAt !== null
    || !Array.isArray(release.scope) || release.scope.length !== 0) {
    errors.push(issue('NOT_APPROVED yayın eski/onaysız aday kapsamı veya yanıtı taşıyamaz'));
  }
}

function validatePinDeferral(pin, errors) {
  if (!isObject(pin)) {
    errors.push(issue('pinDeferral nesnesi eksik'));
    return;
  }
  if (pin.branch !== EXPECTED_BRANCH) errors.push(issue('pinDeferral.branch ardıl dal olmalı'));
  if (pin.until !== 'K3PD-32') errors.push(issue('pinDeferral.until K3PD-32 olmalı'));
  if (!Array.isArray(pin.files)) errors.push(issue('pinDeferral.files dizi olmalı'));
  else {
    const unique = new Set(pin.files);
    if (unique.size !== pin.files.length) errors.push(issue('pinDeferral.files yinelenen yol içeriyor'));
    for (const file of pin.files) if (!safeRepoPath(file)) errors.push(issue(`pinDeferral exact file yolu geçersiz: ${file}`));
  }
  if (!Array.isArray(pin.mainExceptions) || pin.mainExceptions.length !== 0) {
    errors.push(issue('main pin istisnası yasak; mainExceptions boş dizi olmalı'));
  }
}

function validateExternalGates(gates, errors) {
  if (!isObject(gates)) {
    errors.push(issue('externalGates nesnesi eksik'));
    return;
  }
  for (const id of EXTERNAL_GATES) {
    const gate = gates[id];
    if (!isObject(gate) || typeof gate.status !== 'string' || !['pending', 'unknown', 'verified', 'blocked'].includes(gate.status)
      || typeof gate.evidenceLevel !== 'string' || !['none', 'source', 'test', 'visual', 'remote', 'user_attested', 'agent_verified'].includes(gate.evidenceLevel)
      || typeof gate.owner !== 'string' || !gate.owner.trim() || typeof gate.agentVerified !== 'boolean') {
      errors.push(issue(`externalGates.${id} durum/kanıt/owner/agentVerified sözleşmesine uymuyor`));
    }
    if (isObject(gate) && gate.status !== 'verified' && gate.agentVerified) {
      errors.push(issue(`externalGates.${id} verified değilken agentVerified=true`));
    }
    if (isObject(gate) && gate.status === 'verified' && gate.evidenceLevel === 'none') {
      errors.push(issue(`externalGates.${id} kanıtsız verified olamaz`));
    }
  }
  const keys = Object.keys(gates).sort();
  if (keys.join('|') !== [...EXTERNAL_GATES].sort().join('|')) errors.push(issue('externalGates anahtar kümesi sözleşmeyle eşleşmiyor'));
}

function validateLegacySnapshot(snapshot, baselineHead, errors) {
  if (!isObject(snapshot)) {
    errors.push(issue('legacyProgram dondurulmuş kayıt özeti eksik'));
    return;
  }
  const legacy = readJson(files.legacy, LEGACY_STATE_REL, errors);
  if (!isObject(legacy)) return;
  const doneCount = Array.isArray(legacy.cards) ? legacy.cards.filter((card) => card?.status === 'done').length : -1;
  const legacyCount = Array.isArray(legacy.executionOrder) ? legacy.executionOrder.length : -1;
  const expected = {
    program: 'K3P', status: 'completed', nextPrompt: null,
    releaseApproval: 'APPROVED-2026-10-18', completedCards: 37, totalCards: 37,
  };
  for (const [key, value] of Object.entries(expected)) {
    if (snapshot[key] !== value) errors.push(issue(`legacyProgram.${key} tarihsel K3P kapanışından farklı`));
  }
  if (legacy.program !== 'K3P' || legacy.status !== 'completed' || legacy.nextPrompt !== null
    || legacy.releaseApproval !== snapshot.releaseApproval || legacyCount !== 37 || doneCount !== 37) {
    errors.push(issue('eski K3P 37/37 completed / nextPrompt=null / tarihsel onay sözleşmesi bozuk'));
  }
  const frozenPaths = [
    LEGACY_STATE_REL,
    'kao3-premium/.anti-amnesia/CURRENT-STATE.md',
    'kao3-premium/.anti-amnesia/LEDGER.md',
  ];
  for (const relativePath of frozenPaths) {
    try {
      const baselineBytes = execFileSync('git', ['show', `${baselineHead}:${relativePath}`], {
        cwd: root, encoding: 'buffer', stdio: ['ignore', 'pipe', 'ignore'],
      });
      const liveBytes = fs.readFileSync(path.join(root, relativePath));
      if (!liveBytes.equals(baselineBytes)) errors.push(issue(`kapanmış K3P dosyası baseline’dan değişmiş: ${relativePath}`));
    } catch (error) {
      errors.push(issue(`kapanmış K3P baseline okunamadı (${relativePath}): ${error.message}`));
    }
  }
}

function validateProgramStatus(state, errors) {
  const cardStatus = (id) => state.cards?.[id]?.status;
  if (state.status === 'local_verified' && cardStatus('K3PD-31') !== 'done') {
    errors.push(issue('local_verified yalnız K3PD-31 kabulü tamamlandığında kullanılabilir'));
  }
  if (state.status === 'release_candidate' && cardStatus('K3PD-32') !== 'done') {
    errors.push(issue('release_candidate yalnız K3PD-32 tamamlandığında kullanılabilir'));
  }
  if (state.status === 'awaiting_release_approval'
    && (cardStatus('K3PD-32') !== 'done' || state.releaseApproval?.status !== 'NOT_APPROVED')) {
    errors.push(issue('awaiting_release_approval için K3PD-32 adayı hazır ve onay bekliyor olmalı'));
  }
  if (state.status === 'released'
    && (cardStatus('K3PD-33') !== 'done' || state.releaseApproval?.status !== 'APPROVED'
      || state.externalGates?.remoteParity?.status !== 'verified')) {
    errors.push(issue('released için K3PD-33, aday bazlı açık onay ve remoteParity kanıtı gerekir'));
  }
  if (state.status === 'awaiting_owner_decision'
    && !EXPECTED_IDS.some((id) => cardStatus(id) === 'awaiting_owner_decision')) {
    errors.push(issue('awaiting_owner_decision program durumunda bekleyen kart yok'));
  }
  if (state.status === 'blocked' && !EXPECTED_IDS.some((id) => cardStatus(id) === 'blocked')) {
    errors.push(issue('blocked program durumunda blocked kart yok'));
  }
}

function validateSourceReadyClosure(cards, errors) {
  if (!isObject(cards)) return;
  for (const id of ['K3PD-11', 'K3PD-21']) {
    if (cards[id]?.status === 'done' && cards['K3PD-29']?.status !== 'done') {
      errors.push(issue(`${id} done için K3PD-29 görsel kabulü tamamlanmalı`));
    }
    if (cards['K3PD-29']?.status === 'done' && cards[id]?.status !== 'done') {
      errors.push(issue(`K3PD-29 done iken ${id} geç kanıt kapanmamış`));
    }
  }
}

function deriveNext(cards) {
  for (const id of EXPECTED_IDS) {
    const status = cards[id]?.status;
    if (status === 'done') continue;
    if (status === 'source_ready' && ['K3PD-11', 'K3PD-21'].includes(id)) continue;
    return id;
  }
  return null;
}

function parseLog(markdown, errors) {
  const records = [];
  const marker = /^<!-- K3PD-RECORD (\{[^\n]+\}) -->$/gm;
  for (const match of markdown.matchAll(marker)) {
    try {
      records.push(JSON.parse(match[1]));
    } catch (error) {
      errors.push(issue(`KAYIT makbuzu JSON değil: ${error.message}`));
    }
  }
  const headings = Array.from(markdown.matchAll(/^## seq \d+ · /gm));
  if (!records.length || headings.length !== records.length) errors.push(issue('KAYIT başlık/makbuz sayısı eşleşmiyor veya kayıt yok'));
  let prior = 0;
  for (const record of records) {
    if (!isObject(record) || !Number.isInteger(record.seq) || record.seq !== prior + 1) {
      errors.push(issue('KAYIT seq alanı 1’den başlayarak artan ve tekil olmalı'));
      break;
    }
    prior = record.seq;
    if (!EXPECTED_IDS.includes(record.cardId) || !['card', 'audit', 'decision', 'release'].includes(record.type)
      || !isIsoDate(record.date) || !isSha(record.baseHead) || !Array.isArray(record.scope)
      || !Array.isArray(record.commands) || !isObject(record.measurements)
      || !VERDICTS.has(record.auditVerdict) || !Array.isArray(record.openAcceptances)
      || !Array.isArray(record.evidenceRefs)
      || (record.nextCandidate !== null && !EXPECTED_IDS.includes(record.nextCandidate))
      || !CARD_STATUSES.has(record.cardStatus)) {
      errors.push(issue(`KAYIT seq ${record?.seq ?? '?'} zorunlu alanları taşımıyor`));
      continue;
    }
    for (const [index, command] of record.commands.entries()) {
      if (!isObject(command) || typeof command.command !== 'string' || !command.command.trim()
        || !isObject(command.env) || !Number.isInteger(command.exitCode)) {
        errors.push(issue(`KAYIT seq ${record.seq} commands[${index}] gerçek komut/env/exitCode değil`));
      }
    }
  }
  return records;
}

function validateLog(state, promptBlocks, errors) {
  let markdown;
  try {
    markdown = fs.readFileSync(files.log, 'utf8');
  } catch (error) {
    errors.push(issue(`KAYIT.md okunamadı: ${error.message}`));
    return;
  }
  const records = parseLog(markdown, errors);
  const latest = records.at(-1);
  if (!latest || !isObject(state.cards)) return;
  const card = state.cards[latest.cardId];
  if (!card) {
    errors.push(issue(`son KAYIT kartı state’te yok: ${latest.cardId}`));
    return;
  }
  if (latest.cardStatus !== card.status || latest.baseHead !== card.baseHead
    || latest.auditVerdict !== card.auditVerdict || latest.nextCandidate !== state.nextPrompt
    || JSON.stringify(latest.scope) !== JSON.stringify(card.changedPaths)
    || JSON.stringify(latest.evidenceRefs) !== JSON.stringify(card.evidenceRefs)) {
    errors.push(issue('son KAYIT makbuzu DURUM.json son kartıyla uyuşmuyor'));
  }
  const title = promptBlocks.headings.get(latest.cardId);
  if (!title) errors.push(issue('son KAYIT kartı prompt işaretinde yok'));

  const latestByCard = new Map();
  for (const record of records) latestByCard.set(record.cardId, record);
  for (const id of EXPECTED_IDS) {
    const cardState = state.cards[id];
    if (!cardState || cardState.status === 'todo') continue;
    const record = latestByCard.get(id);
    if (!record || record.cardStatus !== cardState.status || record.baseHead !== cardState.baseHead
      || record.auditVerdict !== cardState.auditVerdict
      || JSON.stringify(record.scope) !== JSON.stringify(cardState.changedPaths)
      || JSON.stringify(record.evidenceRefs) !== JSON.stringify(cardState.evidenceRefs)) {
      errors.push(issue(`${id} DURUM.json ile KAYIT.md içinde eşleşen son makbuz yok`));
    }
  }
  validateDecisionRecords(state, records, errors);
  validateReleaseRecord(state, records, errors);

  // A committed prior record must remain byte-for-byte at the start of the current log.
  try {
    const trackedPath = execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD', '--', `${PLAN_REL}/KAYIT.md`], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (trackedPath) {
      const prior = execFileSync('git', ['show', `HEAD:${PLAN_REL}/KAYIT.md`], {
        cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
      });
      if (!markdown.startsWith(prior)) errors.push(issue('KAYIT.md önceki Git içeriğini korumuyor (append-only ihlali)'));
    }
  } catch (error) {
    errors.push(issue(`KAYIT append-only tabanı okunamadı: ${error.message}`));
  }
}

function validateDecisionRecords(state, records, errors) {
  if (!isObject(state.decisions)) return;
  for (const [id, decision] of Object.entries(state.decisions)) {
    if (!isObject(decision) || decision.status === 'pending') continue;
    const record = records.filter((item) => item.type === 'decision' && item.decisionId === id).at(-1);
    if (!record || record.decisionStatus !== decision.status || record.sourceRef !== decision.sourceRef
      || record.response !== decision.response || record.date !== (decision.answeredAt || record.date)) {
      errors.push(issue(`${id} karar state’i gerçek KAYIT karar makbuzuyla eşleşmiyor`));
    }
  }
}

function validateReleaseRecord(state, records, errors) {
  const release = state.releaseApproval;
  if (!isObject(release) || release.status !== 'APPROVED') return;
  const record = records.filter((item) => item.type === 'release').at(-1);
  if (!record || record.candidateSha !== release.candidateSha
    || JSON.stringify(record.releaseScope) !== JSON.stringify(release.scope)
    || record.response !== release.response || record.date !== release.approvedAt
    || record.sourceRef !== release.sourceRef) {
    errors.push(issue('yeni yayın onayı KAYIT.md içinde aday bazlı gerçek yanıt makbuzuyla eşleşmiyor'));
  }
}

function validateFiles(state, errors) {
  for (const [label, file] of Object.entries(files)) {
    if (!fs.existsSync(file)) errors.push(issue(`${label} dosyası yok: ${path.relative(root, file)}`));
  }
  if (!isObject(state)) return;
  const current = fs.existsSync(files.current) ? fs.readFileSync(files.current, 'utf8') : '';
  const expectedLine = `Sıradaki aday: ${state.nextPrompt || 'yok'}`;
  if (!current.includes(expectedLine)) errors.push(issue(`GUNCEL-DURUM.md içinde '${expectedLine}' yok`));
}

function getModel() {
  const errors = [];
  const promptText = fs.existsSync(files.prompt) ? fs.readFileSync(files.prompt, 'utf8') : '';
  const controllerText = fs.existsSync(files.controller) ? fs.readFileSync(files.controller, 'utf8') : '';
  if (!promptText) errors.push(issue('PROMPTLAR.md boş/yok'));
  if (!controllerText) errors.push(issue('DENETLEYICI.md boş/yok'));
  const parsedPrompts = parsePromptBlocks(promptText, errors);
  const state = readJson(files.state, 'DURUM.json', errors);
  validateFiles(state, errors);
  validateState(state, parsedPrompts.blocks, errors);
  validateLog(state, parsedPrompts, errors);
  return { errors, state, prompts: parsedPrompts };
}

function usage() {
  return 'Kullanım: node durum.mjs --check | --sonraki | --liste | --prompt K3PD-NN';
}

function main(args) {
  let mode = '--check';
  let promptId = null;
  if (args.length) {
    mode = args[0];
    if (mode === '--prompt') {
      promptId = args[1] || null;
      if (args.length !== 2 || !promptId) {
        console.error(usage());
        process.exitCode = 2;
        return;
      }
    } else if (args.length !== 1 || !['--check', '--sonraki', '--liste'].includes(mode)) {
      console.error(usage());
      process.exitCode = 2;
      return;
    }
  }
  const model = getModel();
  if (model.errors.length) {
    console.error('K3PD DURUM: FAIL');
    for (const error of model.errors) console.error(`  ${error}`);
    process.exitCode = 1;
    return;
  }
  const { state, prompts } = model;
  if (mode === '--prompt') {
    const text = prompts.blocks.get(promptId);
    if (!text) {
      console.error(`Prompt bulunamadı: ${promptId}`);
      process.exitCode = 1;
      return;
    }
    console.log(text);
    return;
  }
  if (mode === '--sonraki') {
    const next = state.nextPrompt;
    if (next === null) console.log('K3PD tamamlandı; sonraki aday yok.');
    else console.log(`Sıradaki aday: ${next} · ${prompts.headings.get(next).replace(/^##\s*/, '')}`);
    return;
  }
  if (mode === '--liste') {
    console.log('ID\tDURUM\tPROMPT');
    for (const id of state.executionOrder) console.log(`${id}\t${state.cards[id].status}\t${prompts.headings.get(id)}`);
    return;
  }
  console.log(`PASS K3PD state/prompt/log uyumlu · ${state.executionOrder.length} kart · nextPrompt=${state.nextPrompt || 'null'}`);
}

main(process.argv.slice(2));
