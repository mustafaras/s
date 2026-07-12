#!/usr/bin/env node
// verify-profile-assessment.mjs — headless structural validator for
// profileAssessmentV1.js (Şeyma tek oturumlu 174 maddelik profil değerlendirmesi).
//
// WHY THIS EXISTS: profileAssessmentV1.js is a frozen, hand-authored data module
// (like motivationProgramV2.js). There is no build step to catch a mis-numbered
// item or a duplicate id, so this script loads it exactly the way index.html
// does (`window.ProfileAssessmentV1 = ...`) and asserts its structural
// invariants. No DOM, no fetch, no localStorage — pure data validation.
//
// Usage:
//   node .claude/skills/run-seyma/verify-profile-assessment.mjs
//
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = process.env.SEYMA_REPO ||
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function assert(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) process.exitCode = 1;
}

const src = fs.readFileSync(path.join(REPO, 'profileAssessmentV1.js'), 'utf8');
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: 'profileAssessmentV1.js' });
const PA = sandbox.window.ProfileAssessmentV1;

assert('window.ProfileAssessmentV1 var', !!PA);
if (!PA) {
  console.log('Done (aborted — data global missing).');
  process.exit(1);
}

assert('deliveryMode === "single_session"', PA.deliveryMode === 'single_session');
assert('totalItems === 174', PA.totalItems === 174);
assert('tek session ("sessions" uzunluğu 1)', Array.isArray(PA.sessions) && PA.sessions.length === 1);

const session = PA.sessions[0] || {};
assert('session.id === "SINGLE"', session.id === 'SINGLE');

const items = Array.isArray(session.items) ? session.items : [];
assert('session.items uzunluğu 174', items.length === 174);

// ── benzersiz kimlikler ──
const ids = items.map((it) => it.id);
const idSet = new Set(ids);
assert('tüm itemId benzersiz', idSet.size === ids.length);

// ── sıra bütünlüğü: 1..174, kesintisiz, tekrarsız ──
const orders = items.map((it) => it.order).slice().sort((a, b) => a - b);
let orderContinuous = orders.length === 174;
if (orderContinuous) {
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== i + 1) { orderContinuous = false; break; }
  }
}
assert('order değerleri 1–174 aralığında kesintisiz ve tekrarsız', orderContinuous);

// ── tüm scaleId değerleri tanımlı ──
const scaleIds = new Set(Object.keys(PA.scales || {}));
const allScalesDefined = items.every((it) => scaleIds.has(it.scaleId));
assert('tüm scaleId değerleri PA.scales içinde tanımlı', allScalesDefined);

// ── reverse alanı boolean ──
const allReverseBoolean = items.every((it) => typeof it.reverse === 'boolean');
assert('tüm madde.reverse boolean', allReverseBoolean);

// ── 9 modül sınırı, kapsayıcı ve kesintisiz ──
const mb = Array.isArray(session.moduleBoundaries) ? session.moduleBoundaries : [];
assert('9 moduleBoundary tanımlı', mb.length === 9);
let boundariesContinuous = true, expectedStart = 1, sumItemCount = 0;
for (const b of mb) {
  if (b.startOrder !== expectedStart) { boundariesContinuous = false; break; }
  if (b.endOrder - b.startOrder + 1 !== b.itemCount) { boundariesContinuous = false; break; }
  sumItemCount += b.itemCount;
  expectedStart = b.endOrder + 1;
}
assert('moduleBoundary aralıkları 1–174 arasını kesintisiz kapsıyor', boundariesContinuous && expectedStart === 175);
assert('moduleBoundary itemCount toplamı 174', sumItemCount === 174);

// ── mola noktaları (pausePolicy.softBreakAfterOrders) geçerliliği ──
const pp = PA.pausePolicy || {};
const breaks = Array.isArray(pp.softBreakAfterOrders) ? pp.softBreakAfterOrders : [];
const moduleEndOrders = mb.slice(0, -1).map((b) => b.endOrder); // son modülden sonra mola yok
const breaksMatchModuleEnds = breaks.length === moduleEndOrders.length &&
  breaks.every((v, i) => v === moduleEndOrders[i]);
assert('softBreakAfterOrders son modül hariç her modül sınırıyla eşleşiyor (8 nokta)', breaksMatchModuleEnds);
assert('mainAppLockedUntilComplete === true', pp.mainAppLockedUntilComplete === true);
assert('resumeFromLastItem === true', pp.resumeFromLastItem === true);

console.log('Done.');
