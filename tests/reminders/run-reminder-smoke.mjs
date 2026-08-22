#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const tests = [
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

for (const test of tests) {
  console.log(`== ${test} ==`);
  const result = spawnSync(process.execPath, [path.join(root, "tests", "reminders", test)], {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit"
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log(`REMINDER SMOKE PASS: ${tests.length} curated fixtures`);
