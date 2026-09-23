#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const PLAN = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const STATE_PATH = path.join(PLAN, 'KAO-STATE.json');
const LOAD_LISTS = ['index.html', '.claude/skills/run-seyma/driver.mjs', '.claude/skills/run-seyma/zikr-harness.mjs', 'tests/app/test_state_rebind_boundary.js'];

export function runSelfTests({ check, cardSummary }, base) {
  const clone = () => JSON.parse(JSON.stringify(base));
  const ctx0 = { prompts: null, ledger: '| 1 | d | e | k |', reqDoc: null, evidenceExists: () => true, readSource: () => null, commits: [] };
  const orderedPrompts = (state) => state.promptOrder.map(id => `## ${id}`).join('\n');
  const cases = [
    ['temiz state ve başlanabilir kart özeti', clone(), ctx0, (r, state) => {
      const summary = cardSummary(state, 'KAO-02');
      return r.fails.length === 0
        && summary.startable === true
        && summary.dependencyStatuses.length === 1
        && summary.dependencyStatuses[0].status === 'done'
        && summary.gateStatus.approved === true;
    }],
    ['bağımlılık sırası', (() => { const s = clone(); s.cards['KAO-01'].deps = ['KAO-22']; return s; })(), ctx0, (r) => r.fails.some(f => f.includes('sırada sonra'))],
    ['sahipsiz gereksinim', (() => { const s = clone(); for (const c of Object.values(s.cards)) c.req = (c.req || []).filter(r => r !== 'R-C9'); return s; })(), ctx0, (r) => r.fails.some(f => f.includes('R-C9'))],
    ['sıra atlama', (() => { const s = clone(); s.lastCompletedPrompt = 'KAO-01'; s.activePrompt = 'KAO-05'; return s; })(), ctx0, (r) => r.fails.some(f => f.includes('sıradaki değil'))],
    ['kapılı kart onaysız', (() => { const s = clone(); s.lastCompletedPrompt = 'KAO-23'; s.activePrompt = 'KAO-24'; s.cards['KAO-24'].status = 'active'; return s; })(), ctx0, (r) => r.fails.some(f => f.includes('gateApproval'))],
    ['done ama evidence yok', (() => { const s = clone(); s.cards['KAO-01'].status = 'done'; return s; })(), { ...ctx0, evidenceExists: () => false }, (r) => r.fails.some(f => f.includes('EVIDENCE.json'))],
    ['commit kapsamı', clone(), { ...ctx0, commits: [{ hash: 'abc1234def', subject: 'KAO-08: fsrs', files: ['app/core/saygi.js'] }] }, (r) => r.fails.some(f => f.includes('kapsam dışı'))],
    ['fetch yasağı + yükleme listesi', clone(), { ...ctx0, readSource: (f) => f === 'app/core/quranLearn.js' ? 'fetch("https://x")' : (LOAD_LISTS.includes(f) ? 'quranLearn.js' : null) }, (r) => r.fails.some(f => f.includes('fetch yalnız')) && !r.fails.some(f => f.includes('yükleme listesinde'))],
    ['yükleme listesi eksik', clone(), { ...ctx0, readSource: (f) => f === 'app/core/quranLearn.js' ? '' : (LOAD_LISTS.includes(f) ? '' : null) }, (r) => r.fails.filter(f => f.includes('yükleme listesinde')).length === 4],
    ['verified:false paket', clone(), { ...ctx0, readSource: (f) => f === 'app/content/quranLexiconV1.js' ? '{verified:false}' : (LOAD_LISTS.includes(f) ? 'quranLexiconV1.js' : null) }, (r) => r.fails.some(f => f.includes('verified:false'))],
    ['P00 kapsamı', clone(), { ...ctx0, commits: [{ hash: 'p00p00p00', subject: 'KAO-P00: iskelet', files: ['app.js'] }] }, (r) => r.fails.some(f => f.includes('kapsam dışı'))],
    ['chore(kao) kapsamı', clone(), { ...ctx0, commits: [{ hash: 'c0c0c0c0c', subject: 'chore(kao): state', files: ['app.js'] }] }, (r) => r.fails.some(f => f.includes('chore(kao) kapsam dışı'))],
    ['ledger seq atlama', clone(), { ...ctx0, ledger: '| 1 | a | b | c |\n| 3 | a | b | c |' }, (r) => r.fails.some(f => f.includes('seq atlıyor'))],
    ['KAO commit IIP dosyasına yazamaz', clone(), { ...ctx0, commits: [{ hash: 'iip1234567', subject: 'KAO-02: aday liste', files: ['archive/ilham-ibadet-premium-plan/IIP-STATE.json'] }] }, (r) => r.fails.some(f => f.includes('KAO-02') && f.includes('IIP-STATE.json') && f.includes('izinli kapsam'))],
    ['SeyAudio.say yasak ifade', clone(), { ...ctx0, readSource: (f) => f === 'app/core/quranLearn.js' ? 'SeyAudio.say("ayet")' : (LOAD_LISTS.includes(f) ? 'quranLearn.js' : null) }, (r) => r.fails.some(f => f.includes('SeyAudio.say'))],
    ['promptOrder ile başlık sırası bozuk', clone(), (() => {
      const state = clone();
      const headings = state.promptOrder.slice();
      [headings[0], headings[1]] = [headings[1], headings[0]];
      return { ...ctx0, prompts: orderedPrompts({ promptOrder: headings }) };
    })(), (r) => r.fails.some(f => f.includes('prompt sırası STATE ile uyuşmuyor'))],
  ];

  let ok = 0;
  for (const [name, state, ctx, predicate] of cases) {
    let pass = false;
    try { pass = predicate(check(state, ctx), state); } catch { pass = false; }
    console.log(`${pass ? 'PASS' : 'FAIL'} self-test: ${name}`);
    if (pass) ok++;
  }
  console.log(`self-test ${ok}/${cases.length}`);
  return ok === cases.length;
}

const IS_MAIN = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (IS_MAIN) {
  const api = await import('./kao-plan-check.mjs');
  const base = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  process.exitCode = runSelfTests(api, base) ? 0 : 1;
}
