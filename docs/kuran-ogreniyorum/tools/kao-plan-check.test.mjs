#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const PLAN = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const STATE_PATH = path.join(PLAN, 'KAO-STATE.json');
const LOAD_LISTS = ['index.html', '.claude/skills/run-seyma/driver.mjs', '.claude/skills/run-seyma/zikr-harness.mjs', 'tests/app/test_state_rebind_boundary.js'];

export function runSelfTests({ check, cardSummary, commitCounts, resolvePlanBase }, base) {
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
    ['kapılı kart onaysız', (() => { const s = clone(); s.lastCompletedPrompt = 'KAO-23'; s.activePrompt = 'KAO-24'; s.cards['KAO-24'].status = 'active'; delete s.cards['KAO-24'].gateApproval; return s; })(), ctx0, (r) => r.fails.some(f => f.includes('gateApproval'))],
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
    // KAO-FIX-17 (O-11): KAO dosya kümesine dokunan commit, konu önekinden bağımsız görülür.
    ['taban sonrası tanınmayan önek KAO dosyasına dokunamaz', clone(), { ...ctx0, commits: [{ hash: 'f1xu1000aa', subject: 'fix(ui): kuyruk', files: ['app/core/quranLearn.js'], afterBase: true }] }, (r) => r.fails.some(f => f.includes('f1xu100') && f.includes('tanınmayan önek'))],
    ['KAO-FIX commit sözlüğe dokunabilir', clone(), { ...ctx0, commits: [{ hash: 'f1x0500bbb', subject: 'KAO-FIX-05: başlıklar', files: ['app/content/quranLexiconV1.js'], afterBase: true }] }, (r) => r.fails.length === 0 && !r.warns.some(w => w.includes('f1x0500'))],
    ['taban öncesi KAO dışı commit yalnız WARN', clone(), { ...ctx0, commits: [{ hash: 'a9fa40cccc', subject: 'fix(ui): move Quran learning into faith hub', files: ['app/core/quranLearn.js'], afterBase: false }] }, (r) => !r.fails.some(f => f.includes('a9fa40c')) && r.warns.some(w => w.includes('a9fa40c') && w.includes('taban öncesi'))],
    // K2F-01 (M-10): KAO2-FIX programı önekleri ve plan-check tabanı.
    ['K2F-07 commit KAO dosyasına dokunabilir', clone(), { ...ctx0, commits: [{ hash: 'k2f0700aaa', subject: 'K2F-07: masteryAt kaydı', files: ['app/core/quranLearn.js', 'tests/kao/test_kao2_x.js'], afterBase: true }] }, (r) => r.fails.length === 0 && !r.warns.some(w => w.includes('k2f0700'))],
    // D2F-13 NOT: MediaRecorder uyarısı elle incelemeden deterministik kapıya çevrildi.
    ['gölgeleme kayıt bloğu temiz → hata yok', clone(), { ...ctx0, readSource: (f) => f === 'app/core/quranLearn.js' ? 'new MediaRecorder(s); function kaoShadowCleanup(){} function kaoShadowRecord(){} function kaoShadowVerdict(){ kaoSave(); }' : (LOAD_LISTS.includes(f) ? 'quranLearn.js' : null) }, (r) => r.fails.length === 0 && !r.warns.some(w => w.includes('MediaRecorder'))],
    ['gölgeleme kaydı save çağırırsa FAIL', clone(), { ...ctx0, readSource: (f) => f === 'app/core/quranLearn.js' ? 'new MediaRecorder(s); function kaoShadowCleanup(){} function kaoShadowRecord(){ kaoSave(); } function kaoShadowVerdict(){}' : (LOAD_LISTS.includes(f) ? 'quranLearn.js' : null) }, (r) => r.fails.some(f => f.includes('gölgeleme kayıt bloğunda'))],
    ['MediaRecorder var, blok sınırı yok → FAIL', clone(), { ...ctx0, readSource: (f) => f === 'app/core/quranLearn.js' ? 'new MediaRecorder(s); save();' : (LOAD_LISTS.includes(f) ? 'quranLearn.js' : null) }, (r) => r.fails.some(f => f.includes('sınırları'))],
    ['K2F-43 (üst sınır) tanınır', clone(), { ...ctx0, commits: [{ hash: 'k2f4300aaa', subject: 'K2F-43: yayın', files: ['app/kao.css'], afterBase: true }] }, (r) => r.fails.length === 0],
    ['K2F-7 (tek hane) reddedilir', clone(), { ...ctx0, commits: [{ hash: 'k2f7000aaa', subject: 'K2F-7: kısa', files: ['app/core/quranLearn.js'], afterBase: true }] }, (r) => r.fails.some(f => f.includes('k2f7000') && f.includes('tanınmayan önek'))],
    ['K2FX-07 reddedilir', clone(), { ...ctx0, commits: [{ hash: 'k2fx700aaa', subject: 'K2FX-07: yanlış önek', files: ['app/core/quranLearn.js'], afterBase: true }] }, (r) => r.fails.some(f => f.includes('k2fx700') && f.includes('tanınmayan önek'))],
    ['K2F-44 (aralık dışı) reddedilir', clone(), { ...ctx0, commits: [{ hash: 'k2f4400aaa', subject: 'K2F-44: yok', files: ['app/core/quranLearn.js'], afterBase: true }] }, (r) => r.fails.some(f => f.includes('k2f4400') && f.includes('tanınmayan önek'))],
    // D2F-02 (D2-12): denetim-2 düzeltme önekleri; "K2F-NN ek:" yalnız 65e94db2 için tek hash istisnası.
    ['D2F-03 commit KAO dosyasına dokunabilir', clone(), { ...ctx0, commits: [{ hash: 'd2f0300aaa', subject: 'D2F-03: kelime dizme', files: ['app/core/quranLearn.js', 'tests/kao/test_kao2_grammar_tasks.js'], afterBase: true }] }, (r) => r.fails.length === 0 && !r.warns.some(w => w.includes('d2f0300'))],
    ['D2F-16 (üst sınır) tanınır', clone(), { ...ctx0, commits: [{ hash: 'd2f1600aaa', subject: 'D2F-16: kapanış', files: ['tests/kao/test_kao2_x.js'], afterBase: true }] }, (r) => r.fails.length === 0],
    ['D2F-3 (tek hane) reddedilir', clone(), { ...ctx0, commits: [{ hash: 'd2f3000aaa', subject: 'D2F-3: kısa', files: ['app/core/quranLearn.js'], afterBase: true }] }, (r) => r.fails.some(f => f.includes('d2f3000') && f.includes('tanınmayan önek'))],
    ['D2FX-03 reddedilir', clone(), { ...ctx0, commits: [{ hash: 'd2fx300aaa', subject: 'D2FX-03: yanlış önek', files: ['app/core/quranLearn.js'], afterBase: true }] }, (r) => r.fails.some(f => f.includes('d2fx300') && f.includes('tanınmayan önek'))],
    ['D2F-17 (aralık dışı) reddedilir', clone(), { ...ctx0, commits: [{ hash: 'd2f1700aaa', subject: 'D2F-17: yok', files: ['app/core/quranLearn.js'], afterBase: true }] }, (r) => r.fails.some(f => f.includes('d2f1700') && f.includes('tanınmayan önek'))],
    ['"K2F-38 ek:" 65e94db2 için kabul', clone(), { ...ctx0, commits: [{ hash: '65e94db29eda6d81753dd70a7c5785e10052ebed', subject: 'K2F-38 ek: NavBar geri etiketi', files: ['app/kao.css'], afterBase: true }] }, (r) => r.fails.length === 0],
    ['"K2F-38 ek:" başka hash\'te reddedilir', clone(), { ...ctx0, commits: [{ hash: 'e4e4e4e4e4aa', subject: 'K2F-38 ek: başka iş', files: ['app/kao.css'], afterBase: true }] }, (r) => r.fails.some(f => f.includes('e4e4e4e') && f.includes('tanınmayan önek'))],
    ['"K2F-07 ek:" başka hash\'te reddedilir', clone(), { ...ctx0, commits: [{ hash: 'e5e5e5e5e5aa', subject: 'K2F-07 ek: ara durum', files: ['app/core/quranLearn.js'], afterBase: true }] }, (r) => r.fails.some(f => f.includes('e5e5e5e') && f.includes('tanınmayan önek'))],
    ['plan taban öncesi tanınmayan önek taranmaz', clone(), { ...ctx0, commits: [{ hash: 'old0000aaa', subject: 'KAO2-A: bütçe', files: ['tests/kao/test_kao2_perf_budget.js'], afterBase: true, beforePlanBase: true }] }, (r) => r.fails.length === 0 && !r.warns.some(w => w.includes('old0000'))],
    ['plan taban öncesi chore(kao) kapsamı taranmaz', clone(), { ...ctx0, commits: [{ hash: 'old1111bbb', subject: 'chore(kao): eski', files: ['index.html'], beforePlanBase: true }] }, (r) => r.fails.length === 0],
    ['plan taban sonrası tanınmayan önek FAIL', clone(), { ...ctx0, commits: [{ hash: 'new2222ccc', subject: 'wip: kuyruk', files: ['app/core/quranLearn.js'], afterBase: true, beforePlanBase: false }] }, (r) => r.fails.some(f => f.includes('new2222') && f.includes('tanınmayan önek'))],
    ['çözülemeyen plan tabanı FAIL (sessiz atlama yok)', clone(), { ...ctx0, planBase: 'deadbee', planBaseMissing: true }, (r) => r.fails.some(f => f.includes('deadbee') && f.includes('bulunamadı'))],
    ['commitCounts K2F kartını sayar', clone(), ctx0, () => { const c = commitCounts([{ subject: 'K2F-07: a' }, { subject: 'K2F-07: b' }, { subject: 'K2F-7: c' }]); return c['K2F-07'] === 2 && Object.keys(c).length === 1; }],
    ['planBase çözümü: --since önce, sonra STATE, yoksa null', clone(), ctx0, () => resolvePlanBase(['--since', 'abc1234'], { planCheckBase: 'def5678' }) === 'abc1234' && resolvePlanBase([], { planCheckBase: 'def5678' }) === 'def5678' && resolvePlanBase([], { planCheckBase: null }) === null && resolvePlanBase([], null) === null && resolvePlanBase(['--since'], { planCheckBase: 'def5678' }) === 'def5678'],
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
