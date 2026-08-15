#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const reminderDir = path.join(root, "docs", "reminders");
const releaseApproved = process.argv.includes("--release-approved");
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

const required = [
  "docs/README.md",
  "docs/plans/APP-HATIRLATMA-VE-BILDIRIM-UX-PLANI.md",
  "docs/reminders/README.md",
  "docs/reminders/APP-REMINDER-CONTEXT.md",
  "docs/reminders/APP-REMINDER-STATE.json",
  "docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md",
  "docs/reminders/APP-REMINDER-PROMPTLARI.md",
  "docs/reminders/APP-REMINDER-TEST-MATRIX.md",
  "docs/reminders/APP-REMINDER-TRACEABILITY-MATRIX.md",
  "docs/reminders/APP-REMINDER-APP-PANEL-SURFACE-MAP.md",
  "docs/reminders/APP-REMINDER-APPROVAL-GATE.md",
  "docs/reminders/APP-REMINDER-DECISIONS.md",
  "docs/reminders/SESSION-HANDOFF-TEMPLATE.md",
  "docs/reminders/EVIDENCE-RECEIPT-TEMPLATE.md",
  "docs/reminders/verify-reminder-context.mjs",
  "docs/reminders/verify-reminder-closure.mjs"
];
for (const file of required) read(file);

const promptText = read("docs/reminders/APP-REMINDER-PROMPTLARI.md");
const ledgerText = read("docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md");
const traceabilityText = read("docs/reminders/APP-REMINDER-TRACEABILITY-MATRIX.md");
const stateText = read("docs/reminders/APP-REMINDER-STATE.json");
let state = null;
try {
  state = JSON.parse(stateText);
} catch {
  failures.push("APP-REMINDER-STATE.json is not valid JSON");
}

const expectedIds = Array.from({ length: 73 }, (_, index) => `REM-${String(index).padStart(2, "0")}`);
const promptIds = [...promptText.matchAll(/^### (REM-\d{2}) /gm)].map((match) => match[1]);
const ledgerIds = [...ledgerText.matchAll(/^\| (REM-\d{2}) \|/gm)].map((match) => match[1]);
const promptBlocks = promptIds.map((id, index) => {
  const start = promptText.indexOf(`### ${id}`);
  const nextHeading = index + 1 < promptIds.length
    ? promptText.indexOf(`### ${promptIds[index + 1]}`, start + 1)
    : promptText.indexOf("Bir fazın son promptu bitince:", start + 1);
  return [id, promptText.slice(start, nextHeading === -1 ? promptText.length : nextHeading)];
});

assert(promptIds.join(",") === expectedIds.join(","), "prompt IDs are not the expected contiguous REM-00..REM-72 sequence");
assert(ledgerIds.join(",") === expectedIds.join(","), "ledger IDs are not the expected contiguous REM-00..REM-72 sequence");
assert(new Set(promptIds).size === promptIds.length, "duplicate prompt ID");
assert(new Set(ledgerIds).size === ledgerIds.length, "duplicate ledger ID");
assert(promptBlocks.length === expectedIds.length, "prompt block count does not match prompt ID count");

const requiredPromptSections = ["**Hedef:**", "**Oku:**", "**Allowlist:**", "**Görev:**", "**Doğrulama:**", "**Kabul:**", "**Kapanış:**"];
for (const block of promptBlocks) {
  for (const section of requiredPromptSections) {
    assert(block[1].includes(section), `${block[0]} missing ${section}`);
  }
}

for (let section = 1; section <= 21; section += 1) {
  assert(traceabilityText.includes(`§${section} `), `traceability matrix missing plan section §${section}`);
}

for (const id of expectedIds) {
  assert(traceabilityText.includes(id), `traceability matrix does not mention ${id}`);
}

if (state) {
  assert(state.programId === "APP-REMINDER-UX", "state programId mismatch");
  assert(state.promptSet === "docs/reminders/APP-REMINDER-PROMPTLARI.md", "state promptSet mismatch");
  assert(state.ledger === "docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md", "state ledger mismatch");
  assert(state.testMatrix === "docs/reminders/APP-REMINDER-TEST-MATRIX.md", "state testMatrix mismatch");
  assert(state.traceability === "docs/reminders/APP-REMINDER-TRACEABILITY-MATRIX.md", "state traceability mismatch");
  assert(state.surfaceMap === "docs/reminders/APP-REMINDER-APP-PANEL-SURFACE-MAP.md", "state surfaceMap mismatch");
  assert(state.approvalGate === "docs/reminders/APP-REMINDER-APPROVAL-GATE.md", "state approvalGate mismatch");
  assert(state.contextValidator === "docs/reminders/verify-reminder-context.mjs", "state contextValidator mismatch");
  assert(state.closureValidator === "docs/reminders/verify-reminder-closure.mjs", "state closureValidator mismatch");
  assert(expectedIds.includes(state.activePrompt), `state activePrompt invalid: ${state.activePrompt}`);
  assert(state.blockedPrompt === null || expectedIds.includes(state.blockedPrompt), "state blockedPrompt invalid");
  assert(state.releaseApproval && typeof state.releaseApproval === "object", "state releaseApproval missing");
  assert(ledgerText.includes(`| ${state.activePrompt} |`), "state activePrompt missing from ledger");

  const approval = state.releaseApproval || {};
  if (releaseApproved) {
    assert(approval.status === "approved", "--release-approved requires releaseApproval.status=approved");
    assert(Array.isArray(approval.scope) && approval.scope.length > 0, "approved release must have a non-empty scope");
    assert(approval.evidence && approval.approvedAt, "approved release must have evidence and approvedAt");
    assert(approval.approvedBy === "user", "release approval must be user-authorized");
  } else {
    assert(approval.status === "not_approved", "planning validation requires releaseApproval.status=not_approved");
    assert(Array.isArray(approval.scope) && approval.scope.length === 0, "unapproved release must have an empty scope");
    assert(approval.evidence === null && approval.approvedAt === null, "unapproved release must have no approval evidence");
    assert(approval.approvedBy === "user", "unapproved release must reserve approval for user");
  }
}

assert(read("docs/reminders/APP-REMINDER-APPROVAL-GATE.md").includes("NOT_APPROVED"), "approval gate must default to NOT_APPROVED");
assert(read("docs/reminders/APP-REMINDER-CONTEXT.md").includes("Kullanıcı onayı olmadan canlılık kilidi"), "context must document the live approval lock");
assert(read("docs/reminders/APP-REMINDER-TRACEABILITY-MATRIX.md").includes("Senkron güncelleme sırası"), "traceability matrix must document sync order");
assert(read("docs/reminders/APP-REMINDER-APP-PANEL-SURFACE-MAP.md").includes("Gap register"), "app/panel surface map must contain the gap register");

const localDocs = [
  "docs/README.md",
  "docs/plans/APP-HATIRLATMA-VE-BILDIRIM-UX-PLANI.md",
  ...fs.readdirSync(reminderDir).filter((file) => file.endsWith(".md")).map((file) => path.join("docs/reminders", file))
];
let linkCount = 0;
for (const relativeFile of localDocs) {
  const text = read(relativeFile);
  assert(!/[ \t]+$/m.test(text), `trailing whitespace in ${relativeFile}`);
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const href = match[1].split("#")[0];
    if (!href || href.includes("://") || href.startsWith("mailto:")) continue;
    linkCount += 1;
    assert(fs.existsSync(path.resolve(root, path.dirname(relativeFile), href)), `${relativeFile} missing link target ${href}`);
  }
}

if (failures.length) {
  console.error(`REMINDER CONTEXT FAIL (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`REMINDER CONTEXT PASS: ${expectedIds.length} prompts, ${linkCount} local links, approval=${releaseApproved ? "approved" : "not_approved"}`);
