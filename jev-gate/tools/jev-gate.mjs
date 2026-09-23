#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const STATE_PATH = path.join(REPO, 'jev-gate', 'JEV-GATE-STATE.json');

const REQUIRED_FALSE = [
  'liveInference',
  'networkEnabled',
  'realUserDataAllowed',
  'browserCredentialAllowed',
  'serverAdapterApproved',
  'externalWritesAllowed'
];

const BROWSER_FILES = [
  'index.html',
  'app.js',
  'sync.js',
  'panel.html',
  'panel-v2.html'
];
const BROWSER_DIRS = ['app', 'panel', 'v3-tanitim'];
const FORBIDDEN = [
  { name: 'TypeSafe API endpoint', pattern: /api\.typesafe\.ai/i },
  { name: 'TypeSafe browser SDK', pattern: /@typesafe-ai\/sdk/i },
  { name: 'TypeSafe API credential', pattern: /TYPESAFE_API_KEY/i },
  { name: 'Jev API credential', pattern: /JEV_API_KEY/i }
];

function walkJsHtml(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...walkJsHtml(full));
    else if (/\.(?:js|mjs|html)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

export function validateState(state) {
  const errors = [];
  if (!state || state.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (state.programId !== 'JEV-GATE') errors.push('programId must be JEV-GATE');
  if (state.status !== 'discovery' || state.currentGate !== 0) {
    errors.push('initial state must remain discovery / Gate 0');
  }
  if (state.selectedUseCase !== null) errors.push('Gate 0 selectedUseCase must be null');
  for (const key of REQUIRED_FALSE) {
    if (state[key] !== false) errors.push(`${key} must be false at Gate 0`);
  }
  if (!Array.isArray(state.prohibitedDecisions) || state.prohibitedDecisions.length < 6) {
    errors.push('prohibitedDecisions is incomplete');
  }
  return errors;
}

export function scanBrowserSources(repoRoot = REPO) {
  const files = BROWSER_FILES.map((name) => path.join(repoRoot, name))
    .concat(BROWSER_DIRS.flatMap((name) => walkJsHtml(path.join(repoRoot, name))))
    .filter((file, index, all) => fs.existsSync(file) && all.indexOf(file) === index);
  const errors = [];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    for (const rule of FORBIDDEN) {
      if (rule.pattern.test(source)) {
        errors.push(`${path.relative(repoRoot, file)} contains ${rule.name}`);
      }
    }
  }
  return errors;
}

export function runGate({ repoRoot = REPO, statePath = STATE_PATH } = {}) {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  return [...validateState(state), ...scanBrowserSources(repoRoot)];
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const errors = runGate();
  if (errors.length) {
    console.error(`JEV-GATE FAIL (${errors.length})`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log('JEV-GATE PASS — Gate 0 discovery; inference/network/real data disabled');
  }
}

