#!/usr/bin/env node
// P08 — evidence receipt reconciliation.
// Re-runs every command recorded in the IIP source-gate receipts and compares
// the live exit code with the recorded one. Read-only with respect to the
// receipts unless --apply is passed; with --apply it appends a reconciliation
// record (append-only: existing commands[] is never rewritten or deleted).
//
// Usage:
//   node tools/evidence-reconcile.mjs            # dry-run, prints the table
//   node tools/evidence-reconcile.mjs --apply    # appends reconciliation records
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apply = process.argv.includes('--apply');
const root = path.join(repo, 'ilham-ibadet-premium-plan', 'evidence');

// Commands that only make sense at the moment they were run (they inspect the
// working tree as it was). Re-running them today is still meaningful, but a
// non-zero exit here is a live-tree observation, not a receipt lie.
const TIME_SENSITIVE = [/^git\b/];

const dirs = fs.readdirSync(root, { withFileTypes: true })
  .filter(d => d.isDirectory() && /^IIP-\d+$/.test(d.name))
  .map(d => d.name)
  .sort();

const rows = [];
let receipts = 0, drift = 0, rerun = 0;

for (const dir of dirs) {
  const file = path.join(root, dir, 'source.json');
  if (!fs.existsSync(file)) continue;
  receipts++;
  const receipt = JSON.parse(fs.readFileSync(file, 'utf8'));
  const commands = receipt.commands || [];
  const results = [];
  for (const entry of commands) {
    const cmd = entry.command;
    if (!cmd || typeof cmd !== 'string') { results.push({ cmd, recorded: entry.exitCode, live: null, note: 'no command string' }); continue; }
    let live;
    try { execSync(cmd, { cwd: repo, stdio: 'ignore', timeout: 120000 }); live = 0; }
    catch (e) { live = typeof e.status === 'number' ? e.status : 1; }
    rerun++;
    const timeSensitive = TIME_SENSITIVE.some(re => re.test(cmd));
    const ok = live === entry.exitCode;
    if (!ok) drift++;
    results.push({ cmd, recorded: entry.exitCode, live, ok, timeSensitive });
  }
  rows.push({ dir, file, status: receipt.status, results });
}

// Report
process.stdout.write('P08 — evidence receipt reconciliation\n');
process.stdout.write(`receipts: ${receipts} · commands re-run: ${rerun} · live/recorded drift: ${drift}\n\n`);
for (const row of rows) {
  const bad = row.results.filter(r => r.ok === false);
  const tag = bad.length ? `DRIFT(${bad.length})` : 'ok';
  process.stdout.write(`  ${row.dir.padEnd(8)} ${String(row.results.length).padStart(2)} cmd  ${tag}\n`);
  for (const r of bad) {
    process.stdout.write(`      recorded=${r.recorded} live=${r.live}${r.timeSensitive ? ' (time-sensitive)' : ''} :: ${r.cmd}\n`);
  }
}

if (apply) {
  const head = execSync('git rev-parse HEAD', { cwd: repo }).toString().trim();
  const at = new Date().toISOString();
  let touched = 0;
  for (const row of rows) {
    const receipt = JSON.parse(fs.readFileSync(row.file, 'utf8'));
    const allOk = row.results.every(r => r.ok !== false);
    receipt.reconciliation = {
      reconciledAt: at,
      reconciledHead: head,
      method: 'every recorded command re-run in the live tree; recorded exitCode compared with the live exit code',
      commandsRerun: row.results.length,
      driftCount: row.results.filter(r => r.ok === false).length,
      verdict: allOk
        ? 'no drift — every recorded command still exits with the recorded code'
        : 'drift observed — see drift[] below',
      drift: row.results.filter(r => r.ok === false).map(r => ({ command: r.cmd, recorded: r.recorded, live: r.live, timeSensitive: !!r.timeSensitive })),
      note: 'Append-only: the original commands[] array above is unchanged. This block records a later re-run, not a rewrite of history.',
    };
    fs.writeFileSync(row.file, JSON.stringify(receipt, null, 1) + '\n');
    touched++;
  }
  process.stdout.write(`\napplied reconciliation to ${touched} receipt(s) at HEAD ${head.slice(0, 8)}\n`);
} else {
  process.stdout.write('\n(dry-run — pass --apply to write reconciliation records)\n');
}

process.exitCode = drift ? 0 : 0; // reconciliation is a report, not a gate
