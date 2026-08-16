// REM-26 — current Panel reminder no-op + fail-closed projection fixture.
// Synthetic only: no browser, localStorage, fetch, GitHub or real data.
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const repoRoot = path.resolve(__dirname, '../..');
const manifestSource = fs.readFileSync(path.join(repoRoot, 'panelCoverageManifest.js'), 'utf8');
const panelSource = fs.readFileSync(path.join(repoRoot, 'panel.js'), 'utf8');
const panelHtml = fs.readFileSync(path.join(repoRoot, 'panel.html'), 'utf8');

let passed = 0;
let failed = 0;
function ok(name, condition, detail) {
  if (condition) {
    passed += 1;
    console.log('  ✓ ' + name);
  } else {
    failed += 1;
    console.log('  ✗ ' + name + (detail ? ' — ' + detail : ''));
  }
}
function bootManifest() {
  const context = {
    window: {}, Date, JSON, Array, Object, String, Number, Boolean, Math,
    isNaN, isFinite
  };
  vm.runInNewContext(manifestSource, context, { filename: 'panelCoverageManifest.js' });
  return context.window.PanelCoverageV1;
}
function richFixture() {
  return {
    version: 2,
    startDate: '2026-08-16',
    lastOpenedDate: '2026-08-16',
    savedAt: '2026-08-16T10:00:00.000Z',
    settings: {
      ghToken: 'REM26_SECRET_TOKEN',
      openaiKey: 'REM26_OPENAI_SECRET',
      syncUrl: 'https://private.invalid/sync',
      auth: { session: 'REM26_AUTH_SECRET' },
      prayer: { remindersEnabled: true }
    },
    reminders: {
      preferences: {
        'reminder.therapy': {
          enabled: true,
          timeWindow: '09:30',
          therapyText: 'REM26_THERAPY_TEXT',
          userNote: 'REM26_USER_NOTE',
          mood: 'REM26_MOOD',
          note: 'REM26_NOTE',
          body: 'REM26_BODY'
        },
        'reminder.medication': {
          enabled: true,
          medicationName: 'REM26_MEDICATION_NAME',
          dose: 'REM26_DOSE'
        }
      },
      policy: { quietHours: { start: '22:30', end: '07:30' } },
      medications: [{ name: 'REM26_MEDICATION_NAME', label: 'REM26_MEDICATION_LABEL' }]
    },
    delivery: {
      entries: [{
        occurrenceId: 'REM26_OCCURRENCE_ID',
        body: 'REM26_PRIVATE_BODY',
        status: 'delivered'
      }]
    },
    deliveryLog: { entries: [{ occurrenceId: 'REM26_OCCURRENCE_ID' }] },
    reminderDelivery: { occurrenceId: 'REM26_OCCURRENCE_ID' },
    reminderDeliveries: [{ occurrenceId: 'REM26_OCCURRENCE_ID' }],
    reminderHistory: [{ occurrenceId: 'REM26_OCCURRENCE_ID' }],
    notificationDelivery: { body: 'REM26_PRIVATE_BODY' },
    profileAssessment: { responses: { item_1: 'REM26_PROFILE_RAW' } },
    location: { lat: 41.01, lon: 28.97 },
    days: {
      '2026-08-16': {
        mood: 'iyi',
        note: 'legacy-safe-day-note',
        therapy: { thoughts: ['REM26_THERAPY_TEXT'] },
        body: { weight: 68.2 }
      }
    },
    notifications: [{ id: 'observer-safe', kind: 'observer', message: 'safe summary' }]
  };
}
function receipt() {
  return {
    status: 'accepted',
    snapshotRevision: 'b'.repeat(40),
    sourceUpdatedAt: '2026-08-16T10:00:00.000Z',
    submittedAt: '2026-08-16T10:00:01.000Z',
    acceptedAt: '2026-08-16T10:00:02.000Z',
    sourceLatestSha: 'c'.repeat(40)
  };
}
function containsAny(value, needles) {
  const serialized = JSON.stringify(value);
  return needles.some((needle) => serialized.includes(needle));
}

console.log('\n=== REM-26 — Panel reminder no-op + redaction fixture ===\n');
const P = bootManifest();
const fixture = richFixture();
const sensitive = [
  'REM26_SECRET_TOKEN', 'REM26_OPENAI_SECRET', 'REM26_AUTH_SECRET',
  'REM26_THERAPY_TEXT', 'REM26_USER_NOTE', 'REM26_MEDICATION_NAME',
  'REM26_MEDICATION_LABEL', 'REM26_DOSE', 'REM26_PRIVATE_BODY',
  'REM26_OCCURRENCE_ID', 'REM26_PROFILE_RAW', 'REM26_MOOD',
  'REM26_NOTE', 'REM26_BODY', '41.01', '28.97'
];
const localOnlyRoots = [
  'reminders', 'delivery', 'deliveryLog', 'reminderDelivery',
  'reminderDeliveries', 'reminderHistory', 'notificationDelivery'
];

console.log('[1] Local-only root and private-field redaction');
const safe = P.redactForObserver(fixture);
localOnlyRoots.forEach((key) => ok('local-only root redacted: ' + key, !Object.prototype.hasOwnProperty.call(safe, key)));
ok('secret, private copy, occurrence, profile, mood, note, body and GPS values redacted', !containsAny(safe, sensitive));
const coverage = P.coverageForData(fixture);
localOnlyRoots.forEach((key) => ok('coverage records redacted root: ' + key, coverage.redacted.includes(key)));

console.log('[2] Observer snapshot stays redacted and does not invent reminder health');
const rec = receipt();
const snapshot = P.buildObserverSnapshot(fixture, rec, '2026-08-16T10:00:03.000Z');
const snapshotJson = JSON.stringify(snapshot);
ok('snapshot schema remains v1', snapshot.schemaVersion === 1 && snapshot.manifestVersion === 'panel-coverage-v1');
ok('snapshot keeps receipt revision/SHA metadata', snapshot.snapshotRevision === rec.snapshotRevision && snapshot.sourceLatestSha === rec.sourceLatestSha);
ok('snapshot data has no local-only roots', !localOnlyRoots.some((key) => Object.prototype.hasOwnProperty.call(snapshot.data, key)));
ok('snapshot JSON has no private reminder or user values', !sensitive.some((value) => snapshotJson.includes(value)));
ok('snapshot has no reminder aggregate section', !snapshot.sections || !Object.prototype.hasOwnProperty.call(snapshot.sections, 'reminders'));

console.log('[3] Chosen current-panel projection remains a deliberate no-op');
const chosen = P.chooseProjection(snapshot, fixture, rec);
ok('accepted projection is selectable', chosen.source === 'projection' && chosen.reason === 'ready');
ok('chosen projection has no reminder roots', !localOnlyRoots.some((key) => Object.prototype.hasOwnProperty.call(chosen.data, key)));
ok('chosen projection has no private reminder values', !containsAny(chosen.data, sensitive));
ok('no reminder scheduler/permission health is inferred without a remote source', !chosen.sections.reminderHealth && !chosen.sections.schedulerHealth && !chosen.sections.permissionHealth);

console.log('[4] Panel-v1 / Panel-v2 boundary and read-only source audit');
ok('current panel does not read reminder local-only roots', !/data\.(?:reminders|deliveryLog|reminderDelivery|reminderDeliveries|reminderHistory|notificationDelivery)|\boccurrenceId\b/.test(panelSource));
ok('current panel does not schedule reminder writes', !/SeySync\.schedule|putReminder|saveReminder/.test(panelSource));
ok('current panel has no new reminder-specific PUT path', !/reminder[^\n]{0,120}method\s*:\s*["']PUT/i.test(panelSource));
ok('Panel-v2 fixture directory is not imported by current panel', !/panel-v2|Panel-v2/.test(panelSource + panelHtml));

console.log('\nREM-26 fixture result: ' + (failed ? 'FAIL' : 'PASS') + ' (' + passed + ' passed, ' + failed + ' failed)');
if (failed) process.exitCode = 1;
