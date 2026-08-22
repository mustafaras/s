#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const failures = [];

function read(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) {
    failures.push(`missing file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const stateText = read("docs/reminders/APP-REMINDER-STATE.json");
const summaryText = read("docs/reminders/APP-REMINDER-WORK-SUMMARY.md");
read("docs/reminders/APP-REMINDER-APPROVAL-GATE.md");
read("docs/reminders/APP-REMINDER-APP-PANEL-SURFACE-MAP.md");
let state = null;
try {
  state = JSON.parse(stateText);
} catch {
  failures.push("APP-REMINDER-STATE.json is not valid JSON");
}

assert(summaryText.includes("# Reminder / Notification UX"), "summary heading missing");
assert(summaryText.includes("REM-00..REM-72"), "summary must record the frozen prompt range");
assert(summaryText.includes("not_approved"), "summary must preserve the release approval lock");

if (state) {
  assert(state.programId === "APP-REMINDER-UX", "state programId mismatch");
  assert(state.activePrompt === null, "frozen state must have activePrompt=null");
  assert(state.blockedPrompt === null, "frozen state must have blockedPrompt=null");
  assert(state.lastCompletedPrompt === "REM-72", "frozen state must end at REM-72");
  assert(state.summary === "docs/reminders/APP-REMINDER-WORK-SUMMARY.md", "state summary path mismatch");
  assert(state.releaseApproval?.status === "not_approved", "release approval must remain not_approved");
  assert(state.freezeValidator === "docs/reminders/verify-reminder-freeze.mjs", "freeze validator path mismatch");
}

const curatedTests = [
  "test_reminder_boot.js",
  "test_reminder_migration.js",
  "test_reminder_app_acceptance.js",
  "test_reminder_app_privacy.js",
  "test_reminder_app_notification_boundary.js",
  "test_reminder_sync_privacy.js",
  "test_reminder_concurrency.js",
  "test_reminder_panel_source.js",
  "test_reminder_panel_coverage.js",
  "test_reminder_panel_redaction.js",
  "test_reminder_panel_polling.js",
  "test_reminder_panel_privacy.js",
  "test_reminder_panel_a11y.js",
  "test_reminder_panel_performance.js",
  "test_reminder_panel_fixture_architecture.js",
  "test_reminder_end_to_end_lineage.js",
  "test_reminder_cross_surface_schema.js",
  "test_reminder_cross_surface_status.js",
  "test_reminder_integrated_privacy.js",
  "test_reminder_integrated_ux.js"
];
for (const file of curatedTests) {
  assert(fs.existsSync(path.join(root, "tests", "reminders", file)), `missing curated test: ${file}`);
}

if (failures.length) {
  console.error(`REMINDER FREEZE FAIL (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`REMINDER FREEZE PASS: REM-00..REM-72 frozen; ${curatedTests.length} curated tests; release=not_approved`);
