#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const failures = [];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return "";
  }
}

const promptArg = process.argv.find((arg) => /^REM-\d{2}$/.test(arg));
if (!promptArg) {
  console.error("Usage: node docs/reminders/verify-reminder-closure.mjs REM-XX");
  process.exit(2);
}

const promptText = read("docs/reminders/APP-REMINDER-PROMPTLARI.md");
const ledgerText = read("docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md");
const stateText = read("docs/reminders/APP-REMINDER-STATE.json");
const expectedIds = Array.from({ length: 73 }, (_, index) => `REM-${String(index).padStart(2, "0")}`).concat("null");
const promptIdRegex = /^### ((?:REM-\d{2})|null) /gm;
const ledgerIdRegex = /^\| ((?:REM-\d{2})|null) \|/gm;
const promptIds = [...promptText.matchAll(promptIdRegex)].map((match) => match[1]);
const ledgerIds = [...ledgerText.matchAll(ledgerIdRegex)].map((match) => match[1]);
let state = null;
try {
  state = JSON.parse(stateText);
} catch {
  failures.push("APP-REMINDER-STATE.json is not valid JSON");
}

assert(promptIds.join(",") === expectedIds.join(","), "prompt IDs are not contiguous REM-00..REM-72");
assert(ledgerIds.join(",") === expectedIds.join(","), "ledger IDs are not contiguous REM-00..REM-72");
assert(expectedIds.includes(promptArg), `unknown closure prompt: ${promptArg}`);

function ledgerRow(id) {
  const line = ledgerText.split(/\r?\n/).find((candidate) => candidate.startsWith(`| ${id} |`));
  if (!line) return null;
  const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
  return {
    id: cells[0] || "",
    status: cells[3] || "",
    commit: cells[4] || "",
    evidence: cells[5] || ""
  };
}

const targetIndex = expectedIds.indexOf(promptArg);
const nextPrompt = expectedIds[targetIndex + 1] || null;
const isFinal = nextPrompt === "null";
const targetRow = ledgerRow(promptArg);
const nextRow = nextPrompt ? ledgerRow(nextPrompt) : null;

assert(targetRow, `${promptArg} is missing from ledger`);
assert(targetRow?.status === "`done`", `${promptArg} ledger status must be done`);
assert(targetRow && /[0-9a-f]{7,40}/i.test(targetRow.commit), `${promptArg} ledger row must contain a commit SHA`);
assert(targetRow?.evidence.includes(`evidence/${promptArg}.md`), `${promptArg} ledger row must reference evidence/${promptArg}.md`);
const evidencePath = `docs/reminders/evidence/${promptArg}.md`;
const evidenceText = read(evidencePath);
assert(evidenceText.includes(`# ${promptArg} `), `${evidencePath} must have a ${promptArg} heading`);

if (state) {
  if (isFinal) {
    assert(state.status === "closure_pending_approval", "final closure state status must be closure_pending_approval");
    assert(state.activePrompt === null, "final closure requires state.activePrompt=null");
    assert(state.nextSafeAction === null, "final closure requires state.nextSafeAction=null");
  } else {
    assert(state.status === "in-progress", "closure state status must be in-progress while another prompt remains");
    assert(state.activePrompt === nextPrompt, `state.activePrompt must advance to ${nextPrompt}`);
    assert(typeof state.nextSafeAction === "string" && state.nextSafeAction.includes(nextPrompt), `state.nextSafeAction must name ${nextPrompt}`);
  }
  assert(state.lastCompletedPrompt === promptArg, `state.lastCompletedPrompt must be ${promptArg}`);
  assert(state.blockedPrompt === null, "closure cannot leave blockedPrompt set");
  if (promptArg === "REM-42") {
    assert(state.releaseApproval?.status === "approved", "REM-42 closure requires releaseApproval=approved");
    assert(Array.isArray(state.releaseApproval?.scope) && state.releaseApproval.scope.length > 0, "REM-42 approved release must have a non-empty scope");
    assert(state.releaseApproval?.evidence && state.releaseApproval?.approvedAt, "REM-42 approved release must have evidence and approvedAt");
    assert(state.releaseApproval?.approvedBy === "user", "REM-42 release approval must be user-authorized");
  } else {
    assert(state.releaseApproval?.status === "not_approved", "closure must preserve releaseApproval=not_approved");
  }
  assert(state.closure?.prompt === promptArg, `state.closure.prompt must be ${promptArg}`);
  assert(state.closure?.evidence === evidencePath, `state.closure.evidence must be ${evidencePath}`);
  const closureCommit = state.closure?.commit || "";
  assert(/^[0-9a-f]{7,40}$/i.test(closureCommit), "state.closure.commit must be a Git SHA");
  const resolvedClosureCommit = git(["show", "-s", "--format=%H", closureCommit]);
  assert(Boolean(resolvedClosureCommit), "state.closure.commit is not present in local Git history");
  assert(git(["show", "-s", "--format=%s", closureCommit]).includes(promptArg), "closure commit subject must name the closed prompt");
}

for (let index = 0; index <= targetIndex; index += 1) {
  const row = ledgerRow(expectedIds[index]);
  assert(row?.status === "`done`", `${expectedIds[index]} must be done before ${promptArg}; prompts cannot be skipped`);
}

if (!isFinal) {
  assert(nextRow, `${nextPrompt} is missing from ledger`);
  assert(nextRow && nextRow.status !== "`done`", `${nextPrompt} cannot already be done when ${promptArg} closes`);
}

if (failures.length) {
  console.error(`REMINDER CLOSURE FAIL (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`REMINDER CLOSURE PASS: ${promptArg} closed; next=${nextPrompt}; release=${state?.releaseApproval?.status || "unknown"}`);
