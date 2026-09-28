'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
assert.ok(fs.existsSync(path.join(__dirname, 'perf-baseline.json')), 'performans tabanı eksik');
const b = JSON.parse(read('perf-baseline.json'));
assert.deepEqual(Object.keys(b).sort(), ['date','node','p95Ms','contentGzip','runtimeGzip','cssGzip'].sort());
assert.ok(b.p95Ms > 0 && b.p95Ms <= 40);
for (const key of ['contentGzip','runtimeGzip','cssGzip']) assert.ok(Number.isInteger(b[key]) && b[key] > 0);
const empty = read('before-empty-home.html'), seeded = read('before-seeded-home.html');
for (const html of [empty, seeded]) { assert.match(html, /role="dialog"/); assert.match(html, /kao/); assert.ok(html.length > 1000); }
assert.notEqual(empty, seeded, 'boş ve ilerlemeli durum farklı olmalı');
const hub = read('before-hub.html'); assert.match(hub, /kao-hub/);
console.log('KAO2-01 evidence: PASS (baseline schema, empty/seeded dialogs, hub)');
