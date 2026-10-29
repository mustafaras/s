#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PLAN_REL = 'kao3-premium/duzeltme-plani';
const CARD_ID = 'K3PD-28';
const BRANCH = 'k3pd-denetim-duzeltmeleri';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const STATE_PATH = `${PLAN_REL}/DURUM.json`;
const PROMPT_PATH = `${PLAN_REL}/PROMPTLAR.md`;
const EVIDENCE_DIR = `${PLAN_REL}/kanit/${CARD_ID}`;
const COMMANDS_PATH = `${EVIDENCE_DIR}/COMMANDS.json`;
const PROTECTED_HASHES = Object.freeze({
  'kao3-premium/KAPANIS.md': 'd8e8419e2849b9eec922e537bca7100149fdfee6120ce850fda77128f8af9bcd',
  'kao3-premium/README.md': '1aee47cdd05726f4a5966748ae3f786bd79d2e394dd37f3ec7b083f2d36eed0f',
  'kao3-premium/kanit/sonraki/GORSEL-KANIT.md': 'd7627027bba21007550f0a5c76130a4d9f11b7b896d001a60e9333c81ffeed28',
  'kao3-premium/kanit/sonraki/GORSEL-KANIT.pdf': '05ae0071c87c7bad4ed5f050cbb07479e022e912a67ad401b59e00b52ca8811b',
});
const FROZEN_HASHES = Object.freeze({
  'app/content/quranLexiconV1.js': 'ae32ed0dd26b6ab51867f4bca6d713ec72561ae5a5339d4b92f3dc9d22d02d7f',
  'app/content/quranGrammarV1.js': '53808c0565af4d7d9057aecc03f0bfbd7b0f0b0e962a98ffbcaa62390ed530ea',
  'app/content/quranShortSurahsV1.js': 'adb56a326bd27ffa490e57c21bae8030ddf824debc1d14449d6867ae4ee307ca',
  'app/content/quranPhonicsV1.js': '3dfead88d140844266ecc007dc860c5eb7e720985556cd502669a478d8b3c7b9',
  'assets/kao/font/ScheherazadeNew-Regular.k3p.woff2': 'cdf29cccf459341b9b59744ea2f728b589c839d1175fa094ecdd2bff3eb7a2c6',
});
const G1 = [
  'tests/kao/test_kao_migration.js',
  'tests/kao/test_kao2_migration.js',
  'tests/kao/test_kao_fsrs.js',
  'tests/kao/test_kao_queue.js',
  'tests/kao/test_kao_requirements.js',
  'tests/kao/test_kao_render.js',
  'tests/kao/test_kao2_navigation.js',
  'tests/kao/test_kao2_a11y.js',
  'tests/kao/test_kao2_inventory.js',
  'tests/kao/test_kao2_design_contract.js',
  'tests/kao/test_kao_pronunciation_contract.js',
  'tests/kao/test_kao_phonics_contract.js',
  'tests/kao/test_k3p_mount.js',
  'tests/kao/test_k3p_focus_lock.js',
  'tests/app/test_asset_pin_freshness.js',
  'tests/app/test_iip_22.js',
  'tests/kao/test_kao2_perf_budget.js',
  'tools/kao/kao-plan-check.mjs',
  'tools/kao/kao-verify-contrast.mjs',
];
const G2 = [
  'tests/kao/test_kao2_lesson_flow.js',
  'tests/kao/test_kao2_lesson_coherence.js',
  'tests/kao/test_kao2_mastery.js',
  'tests/kao/test_kao2_grammar_tasks.js',
  'tests/kao/test_kao2_denetim.js',
  'tests/kao/test_kao2_kabul.js',
  'tests/kao/test_k3p_rhythm.js',
  'tests/kao/test_k3p_distractors.js',
  'tests/kao/test_k3p_ladder.js',
  'tests/kao/test_k3p_build.js',
  'tests/kao/test_k3p_cloze.js',
  'tests/kao/test_k3p_budget.js',
  'tests/kao/test_k3p_resume.js',
  'tests/kao/test_k3p_lesson_ayah.js',
];
const ACCEPTED_RECOGNITION_REF = 'K3PD-25#recognition-deviation:seq139';
const ACCEPTED_TOUCH_REF = 'K3PD-23#goalException';

const hashFile = (file, root = ROOT) => createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const fileExists = (file) => fs.existsSync(path.join(ROOT, file)) && fs.statSync(path.join(ROOT, file)).isFile();
const safeEnv = (slow) => {
  const env = {
    PATH: process.env.PATH || '/usr/bin:/bin',
    LANG: process.env.LANG || 'C',
    LC_ALL: process.env.LC_ALL || 'C',
    TZ: 'UTC',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_TERMINAL_PROMPT: '0',
  };
  if (slow) env.KAO2_ACCEPT_SLOW_HOST = '1';
  return env;
};

function parseJson(file, label) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8')); }
  catch (error) { throw new Error(`${label}: ${error.message}`); }
}

// Gerçek atlama bildirimi satır başında "SKIP" ile başlar (ör. "SKIP local input missing", "[SKIP] ...").
// Test adının içinde geçen "skip" kelimesi (örn. "skip targets", "yoksa SKIP") atlama sayılmaz.
export function detectSkipMarker(stdout, stderr) {
  return /^[ \t]*\[?SKIP\]?(?::|\s|$)/m.test(`${stdout}\n${stderr}`);
}

function runRaw(program, args, slow = false, timeout = 300_000) {
  const binary = program === 'node' ? process.execPath : program;
  const result = spawnSync(binary, args, {
    cwd: ROOT,
    env: safeEnv(slow),
    encoding: 'utf8',
    timeout,
    maxBuffer: 32 * 1024 * 1024,
  });
  const childExitCode = Number.isInteger(result.status) ? result.status : null;
  const exitCode = childExitCode === null ? (result.error?.code === 'ETIMEDOUT' ? 124 : 127) : childExitCode;
  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  return {
    command: [program, ...args].join(' '),
    exitCode,
    childExitCode,
    signal: result.signal || null,
    timedOut: result.error?.code === 'ETIMEDOUT',
    timeoutMs: timeout,
    spawnError: result.error ? String(result.error.code || result.error.name) : null,
    stdoutBytes: Buffer.byteLength(stdout),
    stderrBytes: Buffer.byteLength(stderr),
    hasSkipMarker: detectSkipMarker(stdout, stderr),
    stdout,
    stderr,
  };
}

function publicCommand(result, group, env) {
  return {
    command: result.command,
    env: { group, KAO2_WRITE_BASELINE: 'unset', KAO2_EVIDENCE_OUT: 'unset', KAO2_ACCEPT_SLOW_HOST: env.slow ? '1' : 'unset' },
    exitCode: result.exitCode,
    childExitCode: result.childExitCode,
    signal: result.signal,
    timedOut: result.timedOut,
    timeoutMs: result.timeoutMs,
    stdoutBytes: result.stdoutBytes,
    stderrBytes: result.stderrBytes,
    skipMarker: result.hasSkipMarker,
  };
}

function currentBranch() {
  const result = runRaw('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  return result.exitCode === 0 ? result.stdout.trim() : '';
}

function parsePromptAllowlist(id) {
  const prompt = fs.readFileSync(path.join(ROOT, PROMPT_PATH), 'utf8');
  const match = prompt.match(new RegExp(`<!-- PROMPT ${id} -->([\\s\\S]*?)<!-- \\/PROMPT ${id} -->`));
  if (!match) return { paths: [], error: 'active prompt marker missing' };
  const section = match[1].match(/\*\*Yazma allowlist’i:\*\*([\s\S]*?)(?=\n\*\*Uygula:\*\*)/);
  if (!section) return { paths: [], error: 'allowlist section missing' };
  const paths = [];
  for (const [, raw] of section[1].matchAll(/`([^`]+)`/g)) {
    const candidate = raw.trim();
    if (!candidate || candidate.includes('*') || candidate.includes(' ')) continue;
    paths.push(candidate.startsWith('../') ? path.posix.normalize(`${PLAN_REL}/${candidate}`)
      : candidate.includes('/') ? candidate : `${PLAN_REL}/${candidate}`);
  }
  return { paths: [...new Set(paths)], error: null };
}

function normalizePromptAllowlist(source, id = CARD_ID) {
  const startMarker = `<!-- PROMPT ${id} -->`;
  const endMarker = `<!-- /PROMPT ${id} -->`;
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) return null;
  const sectionEnd = end + endMarker.length;
  const section = source.slice(start, sectionEnd);
  const lines = section.match(/^\*\*Yazma allowlist’i:\*\*.*$/gm) || [];
  if (lines.length !== 1) return null;
  const normalized = section.replace(/^\*\*Yazma allowlist’i:\*\*.*$/m, '**Yazma allowlist’i:** [normalized]');
  return source.slice(0, start) + normalized + source.slice(sectionEnd);
}

export function sameExceptPromptAllowlist(before, after, id = CARD_ID) {
  const normalizedBefore = normalizePromptAllowlist(before, id);
  const normalizedAfter = normalizePromptAllowlist(after, id);
  return normalizedBefore !== null && normalizedAfter !== null && normalizedBefore === normalizedAfter;
}

function gitPaths(args) {
  const result = spawnSync('git', args, {
    cwd: ROOT,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_CONFIG_NOSYSTEM: '1', GIT_OPTIONAL_LOCKS: '0' },
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} exit ${result.status ?? result.error?.code ?? 1}`);
  return (result.stdout || '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

export function compareExactScope(state, commandsEvidence, root = ROOT) {
  const id = state?.nextPrompt;
  const card = state?.cards?.[id];
  const issues = [];
  if (id !== CARD_ID && id !== 'K3PD-31') issues.push(`active card is not a supported gate mode: ${id || 'missing'}`);
  if (!card || !/^[a-f0-9]{40}$/.test(card.baseHead || '')) issues.push('active card baseHead missing');
  if (!commandsEvidence?.baseline?.protectedFiles || typeof commandsEvidence.baseline.protectedFiles !== 'object') {
    issues.push('protected-file baseline missing');
  }
  const allow = parsePromptAllowlist(id || CARD_ID);
  if (allow.error) issues.push(allow.error);
  const allowed = new Set(allow.paths);
  let changed = [];
  let protectedVerified = 0;
  if (card?.baseHead) {
    try {
      const tracked = gitPaths(['diff', '--name-only', card.baseHead, '--']);
      const untracked = gitPaths(['ls-files', '--others', '--exclude-standard']);
      changed = [...new Set([...tracked, ...untracked])].sort();
      const actualScope = [];
      for (const rel of changed) {
        if (Object.hasOwn(PROTECTED_HASHES, rel)) {
          const expected = commandsEvidence?.baseline?.protectedFiles?.[rel];
          const current = fs.existsSync(path.join(root, rel)) ? hashFile(rel, root) : null;
          if (!expected || current !== expected || current !== PROTECTED_HASHES[rel]) issues.push(`protected file changed: ${rel}`);
          else protectedVerified += 1;
          continue;
        }
        actualScope.push(rel);
        const cardEvidence = rel.startsWith(`${PLAN_REL}/kanit/${id}/`);
        if (!allowed.has(rel) && !cardEvidence) issues.push(`path outside active exact allowlist: ${rel}`);
      }
      if (id === CARD_ID && changed.includes(PROMPT_PATH)) {
        const basePrompt = spawnSync('git', ['show', `${card.baseHead}:${PROMPT_PATH}`], {
          cwd: ROOT,
          env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_CONFIG_NOSYSTEM: '1', GIT_OPTIONAL_LOCKS: '0' },
          encoding: 'utf8',
          maxBuffer: 8 * 1024 * 1024,
        });
        const currentPrompt = fs.readFileSync(path.join(root, PROMPT_PATH), 'utf8');
        if (basePrompt.status !== 0 || !sameExceptPromptAllowlist(basePrompt.stdout || '', currentPrompt, CARD_ID)) {
          issues.push('PROMPTLAR.md may change only the K3PD-28 allowlist line');
        }
      }
      const declared = Array.isArray(card?.changedPaths) ? [...card.changedPaths].sort() : [];
      if (JSON.stringify(actualScope.sort()) !== JSON.stringify(declared)) issues.push('DURUM changedPaths differs from Git exact scope');
      const staged = gitPaths(['diff', '--cached', '--name-only', card.baseHead, '--']);
      if (staged.length) issues.push('staged paths are forbidden before independent acceptance');
    } catch (error) { issues.push(`Git scope inspection failed: ${error.message}`); }
  }
  return { ok: issues.length === 0, activeCard: id || null, baseHead: card?.baseHead || null,
    declaredPaths: Array.isArray(card?.changedPaths) ? [...card.changedPaths].sort() : [],
    changedPaths: changed, allowedPathCount: allowed.size, protectedVerified, issues };
}

export function validatePinPolicy(pinDeferral) {
  if (!pinDeferral || pinDeferral.branch !== BRANCH || pinDeferral.until !== 'K3PD-32'
    || !Array.isArray(pinDeferral.files) || !Array.isArray(pinDeferral.mainExceptions)
    || pinDeferral.mainExceptions.length !== 0) return false;
  const seen = new Set();
  for (const file of pinDeferral.files) {
    if (typeof file !== 'string' || !file || file.includes('*') || file.includes('?') || file.endsWith('/')
      || path.posix.normalize(file) !== file || file.startsWith('/') || file.split('/').includes('..') || seen.has(file)) return false;
    seen.add(file);
  }
  return true;
}

export function parseMeasurementPayload(stdout, exitCode, schema, schemaVersion = 1) {
  if (exitCode !== 0) return { ok: false, issue: `child exit ${exitCode}` };
  if (typeof stdout !== 'string' || !stdout.trim() || /(?:^|\s)SKIP(?:\b|\s)/i.test(stdout)) {
    return { ok: false, issue: 'empty or SKIP measurement output' };
  }
  let value;
  try { value = JSON.parse(stdout.trim()); }
  catch { return { ok: false, issue: 'measurement JSON parse failed' }; }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, issue: 'measurement root must be an object' };
  if (value.schema !== schema || value.schemaVersion !== schemaVersion) return { ok: false, issue: 'measurement schema/version mismatch' };
  return { ok: true, value };
}

export function assessUpperBound(id, value, limit, deviation = null) {
  if (!Number.isFinite(value) || value < 0 || !Number.isFinite(limit) || limit < 0) {
    return { id, value: Number.isFinite(value) ? value : null, limit, status: 'NOT_MEASURED', disposition: 'NOT_MEASURED', countedAsPass: false };
  }
  const status = value <= limit ? 'PASS' : 'NOT_MET';
  const accepted = status === 'NOT_MET' && deviation?.status === 'approved'
    && Number.isFinite(deviation.maximum) && value <= deviation.maximum && typeof deviation.reference === 'string'
    && deviation.reference.length > 0;
  return { id, value, limit, status, disposition: accepted ? 'ACCEPTED_DEVIATION' : status,
    deviationRef: accepted ? deviation.reference : null, countedAsPass: status === 'PASS' };
}

function validFlow(flow) {
  const issues = [];
  if (flow?.schema !== 'k3pd.flow-measurement' || flow?.schemaVersion !== 1) issues.push('flow schema/version');
  if (flow?.source !== 'kaoOverlayHTML:first-view') issues.push('flow is not a real visible first-view render');
  const selected = flow?.selectedLesson;
  if (!selected || selected.reachedFirstTask !== true || !Number.isSafeInteger(selected.openingToFirstTaskTouches)
    || selected.openingToFirstTaskTouches < 0 || !Number.isSafeInteger(selected.taskCount) || selected.taskCount < 1
    || !Number.isSafeInteger(selected.maxPassiveRun) || selected.maxPassiveRun < 0
    || !Number.isSafeInteger(selected.maxNoveltyTouch) || selected.maxNoveltyTouch < 0) {
    issues.push('entry measurement missing');
  }
  for (const profileName of ['fresh', 'established']) {
    const profile = flow?.profiles?.[profileName];
    if (!profile || profile.lessonCount !== 109 || profile.startedLessons !== 109 || profile.completedLessons !== 109
      || profile.coverageComplete !== true) issues.push(`${profileName} flow coverage incomplete`);
    if (!Number.isSafeInteger(profile?.maxPassiveRun) || profile.maxPassiveRun < 0
      || !Number.isSafeInteger(profile?.maxNoveltyTouch) || profile.maxNoveltyTouch < 0
      || !Number.isSafeInteger(profile?.introductions) || profile.introductions < 1) {
      issues.push(`${profileName} rhythm metric missing`);
    }
    if (profileName === 'fresh' && typeof profile?.freshOpeningPairOnly !== 'boolean') issues.push('fresh passive opening contract missing');
    for (const [kind, limit] of Object.entries({ goal: 25, intro: 45, concept: 45 })) {
      const metric = profile?.visibleText?.[kind];
      if (!metric || !Number.isSafeInteger(metric.screens) || metric.screens < 1
        || !Number.isSafeInteger(metric.minWords) || metric.minWords < 1
        || !Number.isSafeInteger(metric.maxWords) || metric.maxWords < metric.minWords || metric.limit !== limit
        || !Number.isSafeInteger(metric.emptyScreens) || metric.emptyScreens !== 0
        || !Number.isSafeInteger(metric.overLimit) || metric.overLimit < 0 || metric.overLimit > metric.screens) {
        issues.push(`${profileName} ${kind} visible metric missing`);
      }
      if (metric && ((metric.maxWords > limit && metric.overLimit < 1) || (metric.maxWords <= limit && metric.overLimit !== 0))) {
        issues.push(`${profileName} ${kind} over-limit count disagrees with maximum`);
      }
    }
    if (profile?.visibleText?.goal?.screens !== 109) issues.push(`${profileName} goal first-view coverage is not 109/109`);
    if (profile?.visibleText?.intro?.screens !== profile?.introductions) issues.push(`${profileName} intro count and render coverage differ`);
  }
  return { ok: issues.length === 0, issues };
}

function validTouch(touch) {
  const issues = [];
  if (touch?.schema !== 'k3pd.touch-measurement' || touch?.schemaVersion !== 1) issues.push('touch schema/version');
  if (touch?.scope !== 'all-current-lessons' || touch?.expectedLessonCount !== 109) issues.push('touch is not the complete 109-lesson cohort');
  if (touch?.selectedLesson?.lessonId !== 'u01.01') issues.push('canonical u01.01 full-lesson measurement missing');
  for (const name of ['autoAdvanceOff', 'autoAdvanceOn', 'autoAdvanceOnFromHome']) {
    const selected = touch?.selectedLesson?.[name];
    if (!selected || selected.started !== true || selected.completed !== true
      || !Number.isSafeInteger(selected.total) || selected.total < 0) {
      issues.push(`u01.01 ${name} full-lesson measurement incomplete`);
    }
  }
  for (const name of ['autoAdvanceOff', 'autoAdvanceOn', 'autoAdvanceOnFromHome']) {
    const profile = touch?.profiles?.[name];
    if (!profile || profile.lessonCount !== 109 || profile.startedLessons !== 109 || profile.completedLessons !== 109
      || profile.validLessons !== 109 || profile.coverageComplete !== true
      || !Number.isSafeInteger(profile.maxTouches) || !Number.isSafeInteger(profile.minTouches)
      || !Number.isFinite(profile.meanTouches)) {
      issues.push(`${name} full-lesson coverage incomplete`);
    }
    if (!Number.isSafeInteger(profile?.above40) || profile.above40 < 0 || profile.above40 > 109
      || !Number.isSafeInteger(profile?.above42) || profile.above42 < 0 || profile.above42 > profile.above40
      || profile.minTouches < 0 || profile.maxTouches < profile.minTouches
      || profile.meanTouches < profile.minTouches || profile.meanTouches > profile.maxTouches) {
      issues.push(`${name} 109-lesson distribution summary invalid`);
    }
  }
  return { ok: issues.length === 0, issues };
}

function validateTarget(target, id, maximum, decisionRef = null, dispositionExpected = null) {
  const issues = [];
  const numerator = target?.numerator, denominator = target?.denominator, maxShare = target?.maxShare;
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator) || denominator <= 0 || numerator < 0 || numerator > denominator
    || !Number.isFinite(maxShare) || !Number.isFinite(target?.share)) return { ok: false, issues: [`${id} missing/invalid numerator, denominator or share`] };
  const share = Number((numerator / denominator).toFixed(6));
  const raw = share <= maximum ? 'PASS' : 'NOT_MET';
  if (Math.abs(share - target.share) > 0.000001 || target.status !== raw || Math.abs(maxShare - maximum) > 0.000001) {
    issues.push(`${id} raw ratio/status differs from recomputation`);
  }
  if (decisionRef && target.decisionRef !== decisionRef) issues.push(`${id} decision reference mismatch`);
  if (dispositionExpected && target.disposition !== dispositionExpected) issues.push(`${id} disposition mismatch`);
  return { ok: issues.length === 0, issues, metric: { id, numerator, denominator, share, limit: maximum,
    status: raw, disposition: target.disposition, countedAsPass: raw === 'PASS', deviationRef: target.approvedDeviationRef || null } };
}

function validRecognition(report, decisions) {
  const issues = [];
  if (report?.schema !== 'k3pd.recognition-gate' || report?.schemaVersion !== 1) issues.push('recognition schema/version');
  if (report?.gate?.status !== 'PASS' || report?.gate?.exitCode !== 0 || !Array.isArray(report?.gate?.violations) || report.gate.violations.length) {
    issues.push('recognition child gate not PASS');
  }
  if (report?.decisionRef !== 'K3PD-24#recognition:A') issues.push('recognition decision ref mismatch');
  for (const cohort of ['fresh', 'established', 'mixedRepeat']) {
    const row = report?.cohorts?.[cohort];
    const runs = row?.lessonRuns;
    if (!row || row.lessonCount !== 109 || !Number.isSafeInteger(row.validTaskCount) || row.validTaskCount < 1
      || !Number.isSafeInteger(row.invalidTaskCount) || row.invalidTaskCount !== 0
      || !runs || runs.plannedLessons !== 109 || runs.startedLessons !== 109 || runs.completedLessons !== 109
      || runs.coverageComplete !== true) issues.push(`${cohort} cohort or 109-lesson fixture coverage incomplete`);
  }
  const decision = decisions?.recognition;
  const ref = decision?.approvedDeviationRef;
  if (decision?.status !== 'approved' || ref !== ACCEPTED_RECOGNITION_REF) issues.push('seq139 recognition deviation decision missing or unauthorized');
  const metrics = [];
  for (const id of ['legacyGeneralFresh', 'legacyGeneralEstablished']) {
    const check = validateTarget(report?.targets?.[id], id, 0.60, 'K3PD-24#recognition:A', 'ACCEPTED_DEVIATION');
    issues.push(...check.issues);
    if (check.metric) {
      if (check.metric.status !== 'NOT_MET' || check.metric.deviationRef !== ref) issues.push(`${id} raw NOT_MET / seq139 record changed`);
      metrics.push({ ...check.metric, countedAsPass: false });
    }
  }
  const operative = validateTarget(report?.targets?.matureRepeatR1, 'matureRepeatR1', 0.60, 'K3PD-24#recognition:A', 'PASS');
  issues.push(...operative.issues);
  if (operative.metric) {
    if (report.targets.matureRepeatR1.binding !== true || report.targets.matureRepeatR1.denominator < 1) issues.push('mature R1 target is not binding or empty');
    metrics.push(operative.metric);
  }
  const approved = report?.approvedDeviation;
  if (approved?.status !== 'APPROVED' || approved.reference !== ref || approved.disposition !== 'ACCEPTED_DEVIATION'
    || approved.operativeTarget !== 'matureRepeatR1'
    || !['legacyGeneralFresh', 'legacyGeneralEstablished'].every((id) => approved.appliesTo?.includes(id))) {
    issues.push('recognition accepted-deviation metadata is incomplete');
  }
  return { ok: issues.length === 0, issues, metrics };
}

export function evaluateMeasurements(flow, touch, recognition, decisions) {
  const flowCheck = validFlow(flow), touchCheck = validTouch(touch), recognitionCheck = validRecognition(recognition, decisions);
  const issues = [...flowCheck.issues, ...touchCheck.issues, ...recognitionCheck.issues];
  const metrics = [];
  if (flowCheck.ok) {
    const profiles = flow.profiles;
    for (const cohort of ['fresh', 'established']) {
      for (const kind of ['goal', 'intro', 'concept']) {
        const metric = profiles[cohort].visibleText[kind];
        metrics.push(assessUpperBound(`${cohort}.${kind}FirstViewWords`, metric.maxWords, metric.limit));
      }
      metrics.push(assessUpperBound(`${cohort}.firstNoveltyTouch`, profiles[cohort].maxNoveltyTouch, 7));
    }
    metrics.push(assessUpperBound('established.maxPassiveRun', profiles.established.maxPassiveRun, 1));
    const freshPassive = assessUpperBound('fresh.maxPassiveRun', profiles.fresh.maxPassiveRun, 1);
    if (freshPassive.status === 'NOT_MET' && profiles.fresh.maxPassiveRun === 2 && profiles.fresh.freshOpeningPairOnly) {
      freshPassive.disposition = 'STRUCTURAL_OPENING_PAIR';
      freshPassive.deviationRef = 'test_k3p_rhythm.js:fresh goal+intro opening contract';
      freshPassive.countedAsPass = false;
    }
    metrics.push(freshPassive);
    metrics.push(assessUpperBound('entry.openingToFirstTaskTouches', flow.selectedLesson.openingToFirstTaskTouches, 2));
  }
  const touchDecision = decisions?.goalException;
  const touchDecisionOk = touchDecision?.status === 'approved' && touchDecision.response === 'A — Hedefi 42\'ye çek'
    && /42/.test(touchDecision.scope || '') && /2026-10-24/.test(touchDecision.sourceRef || '');
  if (touchCheck.ok) {
    const primary = touch.selectedLesson.autoAdvanceOn;
    const deviation = touchDecisionOk ? { status: 'approved', maximum: 42, reference: ACCEPTED_TOUCH_REF } : null;
    metrics.push(assessUpperBound('u01.01.fullLesson.autoAdvanceTouches', primary.total, 40, deviation));
    if (!touchDecisionOk && primary.total > 40) issues.push('42-touch deviation missing exact approved decision');
    if (primary.total > 42) issues.push('u01.01 full lesson exceeds approved structural maximum 42');
  }
  metrics.push(...recognitionCheck.metrics);
  const blocking = metrics.filter((metric) => !['PASS', 'ACCEPTED_DEVIATION', 'STRUCTURAL_OPENING_PAIR'].includes(metric.disposition));
  const touchDistribution = touchCheck.ok ? Object.fromEntries(
    ['autoAdvanceOff', 'autoAdvanceOn', 'autoAdvanceOnFromHome'].map((name) => {
      const { lessonCount, minTouches, maxTouches, meanTouches, above40, above42 } = touch.profiles[name];
      return [name, { scope: '109-lesson descriptive distribution; not the u01.01 acceptance sample',
        lessonCount, minTouches, maxTouches, meanTouches, above40, above42 }];
    }),
  ) : null;
  return {
    status: issues.length || blocking.length ? 'FAIL' : 'PASS',
    exitCode: issues.length || blocking.length ? 1 : 0,
    metrics,
    rawPassCount: metrics.filter((metric) => metric.status === 'PASS').length,
    acceptedDeviationCount: metrics.filter((metric) => metric.disposition === 'ACCEPTED_DEVIATION').length,
    structuralExceptionCount: metrics.filter((metric) => metric.disposition === 'STRUCTURAL_OPENING_PAIR').length,
    blockingCount: blocking.length,
    touchDistribution,
    issues,
  };
}

export function finalPrerequisites(state) {
  const blockers = [];
  if (state?.program !== 'K3PD' || state?.status !== 'active' || state?.branch !== BRANCH) blockers.push('program/status/branch must remain active K3PD on authorized branch');
  if (state?.nextPrompt !== 'K3PD-31') blockers.push('nextPrompt must be K3PD-31 before final regression suite');
  for (let index = 0; index <= 30; index += 1) {
    const id = `K3PD-${String(index).padStart(2, '0')}`;
    const card = state?.cards?.[id];
    if (card?.status !== 'done' || !['PASS', 'ACCEPTED_DEVIATION'].includes(card.auditVerdict)) blockers.push(`${id}:done+accepted-required`);
  }
  for (const key of ['h4', 'timeBudget', 'recognition', 'goalException']) {
    if (state?.decisions?.[key]?.status !== 'approved') blockers.push(`decision:${key}:approved-required`);
  }
  if (!validatePinPolicy(state?.pinDeferral)) blockers.push('pinDeferral:not-exact-or-not-limited-to-K3PD-32');
  if (state?.releaseApproval?.status !== 'NOT_APPROVED' || state?.releaseApproval?.candidateSha !== null) blockers.push('releaseApproval must remain NOT_APPROVED with candidateSha null');
  return [...new Set(blockers)];
}

function verifyPriorG3(state) {
  const issues = [];
  const card = state?.cards?.['K3PD-27'];
  if (card?.status !== 'done' || card.auditVerdict !== 'PASS') issues.push('K3PD-27 is not done/PASS');
  const evidenceFiles = [
    `${PLAN_REL}/kanit/K3PD-27/EVIDENCE.md`,
    `${PLAN_REL}/kanit/K3PD-27/DONDURMA-KANITI.md`,
    `${PLAN_REL}/kanit/K3PD-27/FONT-KANITI.md`,
    `${PLAN_REL}/kanit/K3PD-27/COMMANDS.json`,
  ];
  for (const file of evidenceFiles) if (!fileExists(file)) issues.push(`prior evidence missing: ${file}`);
  const currentHashes = {};
  for (const [file, expected] of Object.entries(FROZEN_HASHES)) {
    try {
      const actual = hashFile(file);
      currentHashes[file] = actual;
      if (actual !== expected) issues.push(`K3PD-27 receipt hash mismatch: ${file}`);
    } catch { issues.push(`K3PD-27 source/hash missing: ${file}`); }
  }
  try {
    const commands = parseJson(`${PLAN_REL}/kanit/K3PD-27/COMMANDS.json`, 'K3PD-27 command receipt');
    const freeze = commands.commands.find((item) => item.command.includes('test_kao_freeze_repro.js'));
    if (freeze?.exitCode !== 0) issues.push('K3PD-27 freeze receipt was not exit 0');
  } catch (error) { issues.push(error.message); }
  return { ok: issues.length === 0, issues, currentHashes, freezeRerun: false, reusedReceipt: true };
}

function recordBaseline() {
  try { return parseJson(COMMANDS_PATH, 'K3PD-28 command receipt'); }
  catch { return null; }
}

function makeSpec(file, group, args = []) {
  return { program: 'node', args: [file, ...args], group };
}

function runSpecs(specs, slow, commandLog, requiredFailures) {
  const results = {};
  for (const spec of specs) {
    const result = runRaw(spec.program || 'node', spec.args, slow, spec.timeout || 300_000);
    const record = publicCommand(result, spec.group, { slow });
    commandLog.push(record);
    results[spec.key || spec.args[0]] = { ...result, group: spec.group };
    if (spec.expectedExit !== undefined) {
      if (result.exitCode !== spec.expectedExit) requiredFailures.push(`${result.command}: expected exit ${spec.expectedExit}, got ${result.exitCode}`);
    } else if (result.exitCode !== 0) requiredFailures.push(`${result.command}: exit ${result.exitCode}`);
    if (spec.expectedExit !== 1 && result.hasSkipMarker) requiredFailures.push(`${result.command}: SKIP marker with exit ${result.exitCode}`);
  }
  return results;
}

function measurementChild(result, schema) {
  return parseMeasurementPayload(result?.stdout, result?.exitCode, schema, 1);
}

function buildG0() {
  return [
    { group: 'G0', args: ['--check', 'kao3-premium/duzeltme-plani/araclar/kapi.mjs'] },
    { group: 'G0', args: ['--check', 'kao3-premium/araclar/akis-olc.cjs'] },
    { group: 'G0', args: ['--check', 'kao3-premium/araclar/dokunus-olc.cjs'] },
    { group: 'G0', args: ['--check', 'tests/kao/test_k3pd_control.js'] },
    { group: 'G0', args: ['--check', 'app.js'] },
    { group: 'G0', args: ['--check', 'sync.js'] },
    { group: 'G0', args: ['--check', 'app/core/quranLearn.js'] },
    { group: 'G0', args: ['--check', 'app/core/quranLearnFlow.js'] },
    { group: 'G0', args: ['--check', 'app/core/quranLearnViews.js'] },
    { group: 'G0', args: ['.claude/skills/run-seyma/driver.mjs'] },
    { group: 'G0', args: ['.claude/skills/run-seyma/zikr-harness.mjs'] },
    { group: 'G0', args: [`${PLAN_REL}/araclar/durum.mjs`, '--check'] },
    { group: 'G0', args: [`${PLAN_REL}/araclar/durum.mjs`, '--sonraki'] },
    { group: 'G0', args: ['tests/kao/test_k3pd_control.js'] },
    { group: 'G0', args: ['-e', "const {spawnSync}=require('node:child_process');const r=spawnSync('git',['diff','--check'],{stdio:'inherit'});process.exit(r.status ?? 1)"] },
  ].map((spec) => ({ ...spec, key: spec.args.join(' ') }));
}

function buildFixtureSpecs(group, files) {
  return files.map((file) => ({ group, args: [file], key: file }));
}

function verifyHistoricalR08(result) {
  const output = result?.stdout || '';
  const hasLegacySummary = /KAO2 denetim tekrar üretimi:\s*9\/10 PASS\s*[·|]\s*1 FAIL/.test(output);
  const hasR08Fail = /FAIL\s+R-08\b/.test(output);
  return { ok: result?.exitCode === 1 && hasLegacySummary && hasR08Fail,
    exitCode: result?.exitCode ?? null, historicalSummary: hasLegacySummary ? '9/10 PASS · 1 FAIL' : 'UNVERIFIABLE',
    r08: hasR08Fail ? 'historical model-only FAIL' : 'UNVERIFIABLE', currentR08: 'separately tested by test_kao2_lesson_flow.js' };
}

export function collectFinalFixtureFiles(root = ROOT) {
  const fixtures = [];
  const inventory = {};
  const patterns = [
    ['tests/kao', /^test_.*\.js$/, () => true],
    ['tests/app', /^test_.*\.js$/, () => true],
    ['tests/panel', /^test_.*\.js$/, () => true],
    ['tests/panel-v2', /^test_panel_v2_.*\.js$/, () => true],
    ['tests/quran', /^test_.*\.js$/, () => true],
  ];
  for (const [dir, pattern, include] of patterns) {
    const absolute = path.join(root, dir);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isDirectory()) throw new Error(`required fixture directory missing: ${dir}`);
    const names = fs.readdirSync(absolute).sort().filter((name) => pattern.test(name) && include(name));
    if (!names.length) throw new Error(`required fixture family has zero tests: ${dir}`);
    inventory[dir] = names.length;
    for (const name of names) fixtures.push({ dir, name });
  }
  return { files: fixtures, inventory };
}

function getFinalTestSpecs() {
  const { files, inventory } = collectFinalFixtureFiles();
  const specs = files.map(({ dir, name }) => {
    const spec = makeSpec(`${dir}/${name}`, 'FINAL');
    if (name === 'test_kao2_kabul.js') spec.timeout = 900_000;
    return spec;
  });
  if (!fileExists('tests/reminders/run-reminder-smoke.mjs')) throw new Error('required reminder smoke fixture missing');
  specs.push(makeSpec('tests/reminders/run-reminder-smoke.mjs', 'FINAL'));
  specs.push(makeSpec('.claude/skills/run-seyma/driver.mjs', 'G0'));
  specs.push(makeSpec('.claude/skills/run-seyma/zikr-harness.mjs', 'G0'));
  inventory['tests/reminders/run-reminder-smoke.mjs'] = 1;
  inventory['.claude/skills/run-seyma'] = 2;
  return { specs, inventory };
}

function validateStartingCard(state, id) {
  const issues = [];
  if (currentBranch() !== BRANCH) issues.push(`branch must be ${BRANCH}`);
  if (state?.nextPrompt !== id) issues.push(`nextPrompt must be ${id}`);
  if (state?.cards?.['K3PD-27']?.status !== 'done' || state?.cards?.['K3PD-27']?.auditVerdict !== 'PASS') issues.push('K3PD-27 predecessor must be accepted');
  if (state?.releaseApproval?.status !== 'NOT_APPROVED' || state?.releaseApproval?.candidateSha !== null) issues.push('release boundary changed');
  if (!validatePinPolicy(state?.pinDeferral)) issues.push('pin deferral is not authorized exact scope');
  if (!['in_progress', 'ready_for_audit'].includes(state?.cards?.[id]?.status)) issues.push(`${id} must be in_progress or ready_for_audit`);
  const baseline = recordBaseline();
  const scope = compareExactScope(state, baseline);
  issues.push(...scope.issues);
  return { issues, scope };
}

function runK3pdCard(slow) {
  const report = { schema: 'k3pd.regression-gate', schemaVersion: 1, mode: 'kart', card: CARD_ID, slowHost: slow,
    environment: { networkRequested: false, realUserData: false, KAO2_WRITE_BASELINE: 'unset', KAO2_EVIDENCE_OUT: 'unset' },
    commands: [], blockers: [], exactScope: null, priorG3: null, measurements: null, historicalR08: null };
  let state;
  try { state = parseJson(STATE_PATH, 'DURUM.json'); }
  catch (error) { report.blockers.push(error.message); return finish(report, 1); }
  const starting = validateStartingCard(state, CARD_ID);
  report.exactScope = starting.scope;
  report.blockers.push(...starting.issues);
  report.priorG3 = verifyPriorG3(state);
  report.blockers.push(...report.priorG3.issues);
  if (report.blockers.length) return finish(report, 1);

  const requiredFailures = [];
  const g0 = runSpecs(buildG0(), slow, report.commands, requiredFailures);
  const g1 = runSpecs(buildFixtureSpecs('G1', G1.map((file) => file.startsWith('tools/') ? file : file)), slow, report.commands, requiredFailures);
  const g2Specs = buildFixtureSpecs('G2', G2);
  for (const spec of g2Specs) if (spec.args[0] === 'tests/kao/test_kao2_kabul.js') spec.timeout = 900_000;
  const g2 = runSpecs(g2Specs, slow, report.commands, requiredFailures);
  const g5Specs = [
    makeSpec('tests/kao/test_k3p_recognition_gate.js', 'G5'),
    { ...makeSpec('kao3-premium/araclar/cift-sik.cjs', 'G5', ['--json']), key: 'kao3-premium/araclar/cift-sik.cjs' },
    { ...makeSpec('kao3-premium/araclar/akis-olc.cjs', 'G5', ['--json']), key: 'kao3-premium/araclar/akis-olc.cjs' },
    { ...makeSpec('kao3-premium/araclar/dokunus-olc.cjs', 'G5', ['--all', '--json']), key: 'kao3-premium/araclar/dokunus-olc.cjs' },
    makeSpec('kao3-premium/araclar/okunus-denetim.cjs', 'G5'),
    makeSpec('kao3-premium/araclar/deney-rapor.cjs', 'G5', ['--ornek']),
    { group: 'G5-HISTORICAL', args: ['tools/kapi/tekrar-uret.cjs'], expectedExit: 1, key: 'tools/kapi/tekrar-uret.cjs' },
  ].map((spec) => ({ ...spec, timeout: 900_000 }));
  const g5 = runSpecs(g5Specs, slow, report.commands, requiredFailures);
  report.historicalR08 = verifyHistoricalR08(g5['tools/kapi/tekrar-uret.cjs']);
  if (!report.historicalR08.ok) requiredFailures.push('historical R08 diagnostic differs from exact 9/10 record');
  const flow = measurementChild(g5['kao3-premium/araclar/akis-olc.cjs'], 'k3pd.flow-measurement');
  const touch = measurementChild(g5['kao3-premium/araclar/dokunus-olc.cjs'], 'k3pd.touch-measurement');
  const recognition = measurementChild(g5['kao3-premium/araclar/cift-sik.cjs'], 'k3pd.recognition-gate');
  report.measurements = flow.ok && touch.ok && recognition.ok
    ? evaluateMeasurements(flow.value, touch.value, recognition.value, state.decisions)
    : { status: 'FAIL', exitCode: 1, metrics: [], rawPassCount: 0, acceptedDeviationCount: 0,
      structuralExceptionCount: 0, blockingCount: 1, issues: [flow.issue, touch.issue, recognition.issue].filter(Boolean) };
  requiredFailures.push(...report.measurements.issues);
  if (report.measurements.exitCode !== 0) requiredFailures.push(`measurement gate status ${report.measurements.status}`);
  report.commandCounts = { G0: Object.keys(g0).length, G1: Object.keys(g1).length, G2: Object.keys(g2).length, G5: Object.keys(g5).length };
  report.currentR08 = { command: 'node tests/kao/test_kao2_lesson_flow.js', exitCode: g2['tests/kao/test_kao2_lesson_flow.js']?.exitCode ?? null,
    status: g2['tests/kao/test_kao2_lesson_flow.js']?.exitCode === 0 ? 'PASS' : 'FAIL' };
  report.render109 = { command: 'node tests/kao/test_k3p_rhythm.js', exitCode: g2['tests/kao/test_k3p_rhythm.js']?.exitCode ?? null,
    status: g2['tests/kao/test_k3p_rhythm.js']?.exitCode === 0 ? 'PASS' : 'FAIL' };
  report.blockers.push(...requiredFailures);
  return finish(report, report.blockers.length ? 1 : 0);
}

export function finalPrerequisiteReport(state) {
  return { status: finalPrerequisites(state).length ? 'BLOCKED' : 'READY', blockers: finalPrerequisites(state) };
}

function runFinal(slow) {
  const report = { schema: 'k3pd.regression-gate', schemaVersion: 1, mode: 'final', slowHost: slow,
    environment: { networkRequested: false, realUserData: false, KAO2_WRITE_BASELINE: 'unset', KAO2_EVIDENCE_OUT: 'unset' },
    commands: [], blockers: [], suiteStarted: false, suiteCount: 0 };
  let state;
  try { state = parseJson(STATE_PATH, 'DURUM.json'); }
  catch (error) { report.blockers.push(error.message); return finish(report, 1); }
  const stateCheck = runRaw('node', [`${PLAN_REL}/araclar/durum.mjs`, '--check'], slow);
  report.commands.push(publicCommand(stateCheck, 'FINAL-STATE', { slow }));
  if (stateCheck.exitCode !== 0) report.blockers.push(`DURUM state control exit ${stateCheck.exitCode}`);
  report.prerequisites = finalPrerequisiteReport(state);
  report.blockers.push(...report.prerequisites.blockers);
  if (report.blockers.length) return finish(report, 1);
  const scope = compareExactScope(state, recordBaseline());
  report.exactScope = scope;
  report.blockers.push(...scope.issues);
  if (report.blockers.length) return finish(report, 1);
  report.suiteStarted = true;
  const failures = [];
  let inventory;
  let specs;
  try { ({ specs, inventory } = getFinalTestSpecs()); }
  catch (error) { report.blockers.push(error.message); return finish(report, 1); }
  report.suiteInventory = inventory;
  report.suiteCount = specs.length;
  runSpecs(specs, slow, report.commands, failures);
  report.blockers.push(...failures);
  return finish(report, report.blockers.length ? 1 : 0);
}

function finish(report, code) {
  report.gate = { status: code === 0 ? 'PASS' : report.mode === 'final' && !report.suiteStarted ? 'BLOCKED' : 'FAIL', exitCode: code };
  console.log(JSON.stringify(report));
  return code;
}

export function parseArgs(argv) {
  const args = [...argv];
  const slow = args.includes('--yavas');
  const modes = args.filter((arg) => arg === '--final' || arg === '--kart');
  if (args.filter((arg) => arg === '--yavas').length > 1 || modes.length !== 1) return { error: 'one of --kart ID or --final, optionally --yavas' };
  const unknown = args.filter((arg) => !['--yavas', '--final', '--kart'].includes(arg) && !/^K3PD-\d{2}$/.test(arg));
  if (unknown.length) return { error: `unknown argument: ${unknown.join(' ')}` };
  if (args.filter((arg) => /^K3PD-\d{2}$/.test(arg)).length > 1) return { error: 'one card ID only' };
  if (args.includes('--final') && args.some((arg) => /^K3PD-\d{2}$/.test(arg))) return { error: '--final takes no card ID' };
  if (args.includes('--kart')) {
    const index = args.indexOf('--kart');
    const id = args[index + 1];
    if (!id || !/^K3PD-\d{2}$/.test(id)) return { error: '--kart requires K3PD-NN' };
    if (id !== CARD_ID) return { error: `--kart supports ${CARD_ID} only` };
    if (args.some((arg, i) => /^K3PD-\d{2}$/.test(arg) && i !== index + 1)) return { error: 'unexpected card ID' };
  } else if (args.some((arg) => /^K3PD-\d{2}$/.test(arg))) return { error: 'card ID requires --kart' };
  return { mode: args.includes('--final') ? 'final' : 'kart', slow };
}

export function runGate(args = process.argv.slice(2)) {
  const parsed = parseArgs(args);
  if (parsed.error) {
    console.error(`Kullanım: node kao3-premium/duzeltme-plani/araclar/kapi.mjs --kart K3PD-28 [--yavas] | --final [--yavas] · ${parsed.error}`);
    return 2;
  }
  return parsed.mode === 'final' ? runFinal(parsed.slow) : runK3pdCard(parsed.slow);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = runGate();
}
