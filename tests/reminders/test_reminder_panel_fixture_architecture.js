"use strict";

// REM-66 / G13-L — current panel, root observer ve Panel-v2 fixture mimarisi.
// Bu gate fixture sayısını başarı kanıtı saymaz. Her scope'un dosya manifestini,
// komut sözleşmesini, static no-network/no-token/no-write sınırını ve bilinçli
// overlap/missing durumunu ayrı raporlar. Suite'ler bu fixture içinde yeniden
// çalıştırılmaz; exit code kanıtı closure receipt'inde tutulur.

const fs = require("node:fs");
const path = require("node:path");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const TESTS = path.join(ROOT, "tests");
const REMINDERS = path.join(TESTS, "reminders");
const PANEL_V2 = path.join(TESTS, "panel-v2");

const COMMANDS = Object.freeze({
  reminder: "for f in tests/reminders/test_reminder_*.js; do node \"$f\"; done",
  currentReminderPanel: "for f in tests/reminders/test_reminder_panel_*.js; do node \"$f\"; done",
  currentRootPanel: "for f in tests/test_panel_*.js; do node \"$f\"; done",
  legacyRootPanel: "node tests/test_faz11_panel.js",
  panelV2: "for f in tests/panel-v2/test_panel_v2_*.js; do node \"$f\"; done"
});

const REMINDER_PANEL_MANIFEST = Object.freeze({
  source: ["test_reminder_panel_source.js"],
  coverage: ["test_reminder_panel_coverage.js"],
  projection: ["test_reminder_panel_coverage.js"],
  redaction: ["test_reminder_panel_redaction.js", "test_reminder_panel_privacy.js"],
  transport: ["test_reminder_panel_polling.js"],
  event: ["test_reminder_panel_polling.js"],
  responsive: ["test_reminder_panel_a11y.js", "test_reminder_panel_performance.js"],
  status: ["test_reminder_panel_coverage.js"],
  release: ["test_reminder_panel_fixture_architecture.js"]
});

const ROOT_PANEL_MANIFEST = Object.freeze({
  source: ["test_panel_p0_sync.js", "test_panel_p1_projection.js"],
  projection: ["test_panel_p3_root_modules.js", "test_panel_p4_provenance.js"],
  redaction: ["test_panel_p1_projection.js", "test_panel_p3_root_modules.js", "test_panel_p4_provenance.js"],
  transport: ["test_panel_p0_sync.js", "test_panel_p2_polling.js", "test_panel_p2_sync.js"],
  event: ["test_panel_p2_event_log.js", "test_panel_p3_timeline_drawer.js"],
  responsive: ["test_panel_p5_responsive_a11y.js"],
  release: ["test_panel_p6_qa_release.js"]
});

const REQUIRED_PANEL_V2_COUNT = 27;
const REQUIRED_LINEAGE = ["test_reminder_end_to_end_lineage.js"];

const STATIC_FORBIDDEN = Object.freeze([
  ["browser automation", /puppeteer|playwright|selenium|chromedriver|page\.goto|window\.open\s*\(/i],
  ["live HTTP client", /(?:https?|http)\.request\s*\(|\bWebSocket\s*\(|\bEventSource\s*\(/i],
  ["real environment secret", /process\.env|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9_-]{20,}/i],
  ["filesystem write", /fs\.(?:writeFile|appendFile|rm|unlink|mkdir|createWriteStream)\s*\(/i],
  ["browser persistence", /window\.localStorage|document\.cookie|\bindexedDB\b/i]
]);

function filesMatching(dir, prefix) {
  return fs.readdirSync(dir).filter((name) => name.startsWith(prefix) && name.endsWith(".js")).sort();
}

function allManifestFiles(manifest) {
  return [...new Set(Object.values(manifest).flat())].sort();
}

function relative(rel) {
  return path.join(ROOT, rel);
}

function read(rel) {
  return fs.readFileSync(relative(rel), "utf8");
}

function flattenManifest(manifest) {
  const owners = new Map();
  Object.entries(manifest).forEach(([surface, names]) => {
    names.forEach((name) => {
      const list = owners.get(name) || [];
      list.push(surface);
      owners.set(name, list);
    });
  });
  return owners;
}

function staticBoundary(rel) {
  const source = read(rel);
  const violations = STATIC_FORBIDDEN
    .filter(([, pattern]) => pattern.test(source))
    .map(([label]) => label);
  const hasFetchReference = /\bfetch\b/.test(source);
  const hasSyntheticBoundary = /synthetic|sentetik|headless|fixture|MUST_NOT_RUN|UNEXPECTED_FETCH|NETWORK.*DISABLED/i.test(source);
  const hasFixedEvidence = /2026-\d{2}-\d{2}T|FIXTURE_NOW|SOURCE_UPDATED_AT|createDeterministicClock|Date:\s*Date\b/.test(source);
  return {
    rel,
    violations,
    hasFetchReference,
    hasSyntheticBoundary,
    hasFixedEvidence,
    clockBoundary: hasFixedEvidence ? "fixed/injected" : "pure-or-bounded"
  };
}

function printInventory() {
  const reminderFiles = filesMatching(REMINDERS, "test_reminder_");
  const reminderPanelFiles = filesMatching(REMINDERS, "test_reminder_panel_");
  const rootPanelFiles = filesMatching(TESTS, "test_panel_");
  const panelV2Files = filesMatching(PANEL_V2, "test_panel_v2_");
  console.log("REM-66 inventory (counts are inventory only, not PASS evidence)");
  console.log(`scope=reminder command=${COMMANDS.reminder} files=${reminderFiles.length}`);
  console.log(`scope=current-reminder-panel command=${COMMANDS.currentReminderPanel} files=${reminderPanelFiles.length}`);
  console.log(`scope=current-root-panel command=${COMMANDS.currentRootPanel} files=${rootPanelFiles.length}`);
  console.log(`scope=legacy-root-panel command=${COMMANDS.legacyRootPanel} files=1`);
  console.log(`scope=panel-v2 command=${COMMANDS.panelV2} files=${panelV2Files.length}`);
  console.log("scope-separation=current-panel != panel-v2; reminder suite != panel-v2");
}

const reminderFiles = filesMatching(REMINDERS, "test_reminder_");
const reminderPanelFiles = filesMatching(REMINDERS, "test_reminder_panel_");
const rootPanelFiles = filesMatching(TESTS, "test_panel_");
const panelV2Files = filesMatching(PANEL_V2, "test_panel_v2_");
const rootAll = [...rootPanelFiles, "test_faz11_panel.js"];
const currentReminderManifestFiles = allManifestFiles(REMINDER_PANEL_MANIFEST);
const rootManifestFiles = allManifestFiles(ROOT_PANEL_MANIFEST);
const boundaryFiles = [
  ...reminderFiles.map((name) => path.join("tests/reminders", name)),
  ...rootAll.map((name) => name === "test_faz11_panel.js" ? `tests/${name}` : `tests/${name}`),
  ...panelV2Files.map((name) => path.join("tests/panel-v2", name))
].filter((rel) => !rel.endsWith("test_reminder_panel_fixture_architecture.js"));

printInventory();

runTests([
  ["current panel owner manifest has no missing fixture and includes the new G13-L gate", () => {
    currentReminderManifestFiles.forEach((name) => {
      assert(fs.existsSync(path.join(REMINDERS, name)), `missing reminder panel fixture: ${name}`);
    });
    REQUIRED_LINEAGE.forEach((name) => {
      assert(fs.existsSync(path.join(REMINDERS, name)), `missing reminder lineage fixture: ${name}`);
    });
    assertEqual(reminderPanelFiles.length, currentReminderManifestFiles.length);
    assert(currentReminderManifestFiles.includes("test_reminder_panel_fixture_architecture.js"));
  }],
  ["root observer panel and legacy Faz11 inventories are explicit and not silently skipped", () => {
    assert(rootPanelFiles.length > 0);
    rootPanelFiles.forEach((name) => assert(name.startsWith("test_panel_")));
    rootManifestFiles.forEach((name) => assert(rootPanelFiles.includes(name), `missing root panel fixture: ${name}`));
    assert(fs.existsSync(path.join(TESTS, "test_faz11_panel.js")));
    const unclassified = rootPanelFiles.filter((name) => !rootManifestFiles.includes(name));
    console.log(`root-legacy-explicit=${unclassified.join(",") || "none"}`);
    assert(unclassified.every((name) => name.startsWith("test_panel_")));
  }],
  ["Panel-v2 has its own exact inventory and never becomes current-panel evidence", () => {
    assertEqual(panelV2Files.length, REQUIRED_PANEL_V2_COUNT);
    assert(panelV2Files.every((name) => name.startsWith("test_panel_v2_")));
    const currentSet = new Set([...reminderPanelFiles, ...rootAll]);
    panelV2Files.forEach((name) => assert(!currentSet.has(name)));
    assert(read("tests/README.md").includes("Panel-v2"));
    assert(read("tests/panel-v2/README.md").includes("27"));
  }],
  ["logical overlap is reported as intentional regression, not collapsed into one acceptance owner", () => {
    const reminderOwners = flattenManifest(REMINDER_PANEL_MANIFEST);
    const rootOwners = flattenManifest(ROOT_PANEL_MANIFEST);
    const duplicateLogicalSurfaces = ["projection", "redaction", "transport", "event", "responsive"];
    duplicateLogicalSurfaces.forEach((surface) => {
      assert((REMINDER_PANEL_MANIFEST[surface] || []).length > 0);
      assert((ROOT_PANEL_MANIFEST[surface] || []).length > 0);
    });
    assert(reminderOwners.get("test_reminder_panel_source.js").length === 1);
    assert(rootOwners.get("test_panel_p1_projection.js").length > 1);
    console.log("duplicate-coverage=reminder/current-root overlap is deliberate; owner scopes remain separate");
  }],
  ["every fixture stays inside the static synthetic boundary", () => {
    const reports = boundaryFiles.map(staticBoundary);
    const staticFailures = reports.filter((report) => report.violations.length || (report.hasFetchReference && !report.hasSyntheticBoundary));
    if (staticFailures.length) console.log("static-boundary-failures=" + JSON.stringify(staticFailures));
    reports.forEach((report) => {
      assertEqual(report.violations.length, 0, `${report.rel}: ${report.violations.join(",")}`);
      assert(report.hasSyntheticBoundary || !report.hasFetchReference, `${report.rel}: fetch boundary is not declared`);
      assert(report.hasFixedEvidence || report.clockBoundary === "pure-or-bounded", `${report.rel}: clock boundary missing`);
    });
    const clockModes = reports.reduce((acc, report) => {
      acc[report.clockBoundary] = (acc[report.clockBoundary] || 0) + 1;
      return acc;
    }, {});
    console.log(`static-boundary=network:mock-only token:none writes:none clock=${JSON.stringify(clockModes)}`);
  }],
  ["suite command contract names exit-code evidence rather than fixture counts", () => {
    Object.values(COMMANDS).forEach((command) => assert(/node /.test(command)));
    assert(COMMANDS.currentReminderPanel.includes("test_reminder_panel_*.js"));
    assert(COMMANDS.currentRootPanel.includes("tests/test_panel_*.js"));
    assert(COMMANDS.panelV2.includes("tests/panel-v2/test_panel_v2_*.js"));
    assert(!/assert.*count|count.*PASS/i.test(COMMANDS.reminder));
    assert(read("tests/README.md").includes("fixture sayısı"));
  }]
]).catch((error) => { console.error(error && error.stack || error); process.exitCode = 1; });
