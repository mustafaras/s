'use strict';

// KAO2-22 · Hece sesi hattı (K-3 kademe A). Sentetik VM; ağ, kayıt ve ffmpeg yok.
// Bu kart SES üretmez; K-3 kademe A'nın **hattını** kurar ve zorlar. Kayıt yoksa
// hat `awaiting-recording` bildirir ve uygulama kademe B (harf kelime içinde) ile
// çalışmaya devam eder — K-3 bilimi: fonik, harf-ses eşlemesini gerçek kelimeyle
// birleştirdiğinde etkilidir (Ehri 2005); iki ses çok-konuşmacı genellemesi
// (Logan, Lively & Pisoni 1991; Thomson 2018) HEDEF, ama ses olmadan da öğretim sürer.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const repoRoot = require('../repo-root');

const TOOL = path.join(repoRoot, 'tools/kao2-syllable-audio.mjs');
const MANIFEST = path.join(repoRoot, 'docs/kuran-ogreniyorum/content/audio-manifest.json');
const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };
const runTool = (args) => {
  try {
    return { code: 0, out: execFileSync(process.execPath, [TOOL].concat(args), { encoding: 'utf8', stdio: 'pipe' }) };
  } catch (error) {
    return { code: error.status || 1, out: String((error.stdout || '') + (error.stderr || '')) };
  }
};

// ---- K-3 envanteri: 28 harf × (3 hareke + sükûn) + 3 med, iki ses ------------
const VOWELS = ['fatha', 'kasra', 'damma'];
const LETTER_COUNT = 28;
const MADD = ['madd_alef', 'madd_waw', 'madd_ya'];
const VOICES = ['m', 'f'];

check('envanter K-3 kademe A ile birebir: 115 klip × 2 ses = 230', () => {
  // 28 × 3 hareke = 84 + 28 sükûn = 112 + 3 med = 115 (tek ses).
  const perVoice = LETTER_COUNT * VOWELS.length + LETTER_COUNT * 1 + MADD.length;
  assert.equal(perVoice, 115, 'tek ses klip sayısı 115');
  assert.equal(perVoice * VOICES.length, 230, 'iki ses 230');
  const inv = runTool(['--inventory']);
  assert.equal(inv.code, 0, '--inventory çalışır');
  const parsed = JSON.parse(inv.out);
  assert.equal(parsed.perVoice, 115, 'araç envanteri 115 der');
  assert.equal(parsed.total, 230, 'araç envanteri 230 der');
  assert.deepEqual(parsed.voices, VOICES, 'iki ses: m ve f');
  assert.deepEqual(parsed.marks, VOWELS.concat(['sukun']).concat(MADD), 'işaret kümesi K-3 ile aynı');
});

// ---- (a) Ad biçimi + self-test ---------------------------------------------
check('(a) --self-test ad biçimini, sha256 ve lisans zorunluluğunu doğrular', () => {
  const st = runTool(['--self-test']);
  assert.equal(st.code, 0, `self-test geçer (çıktı: ${st.out.slice(0, 200)})`);
  assert.match(st.out, /ad biçimi/i, 'ad biçimi denetlenir');
  assert.match(st.out, /sha256/i, 'sha256 denetlenir');
  assert.match(st.out, /lisans/i, 'lisans zorunluluğu denetlenir');
  assert.match(st.out, /rol/i, 'recordedBy yalnız rol');
});

check('(a) araç klip adı doğrulayıcısı K-3 biçimini kabul eder, başkasını reddeder', () => {
  const good = ['y-ba_fatha-m', 'y-ba_kasra-f', 'y-ya_damma-m', 'y-mim_sukun-f', 'y-alef_madd_alef-m', 'y-waw_madd_waw-f', 'y-ya_madd_ya-m'];
  const bad = ['w-l_x_123456', 'y-ba-m', 'y-ba_fatha-x', 'y-_fatha-m', 'y-ba_fatha', 'ba_fatha-m', 'y-qaf_madd_alef-m'];
  const src = read('tools/kao2-syllable-audio.mjs');
  // Doğrulayıcı araçta tek yerde tanımlı olmalı (kopya yok).
  assert.equal((src.match(/function isValidSyllableClipId/g) || []).length, 1, 'tek doğrulayıcı');
  // Doğrulayıcı GERÇEK araç üzerinden koşulur (--validate).
  for (const id of good) {
    const r = runTool(['--validate', id]);
    assert.equal(r.code, 0, `kabul edilmeli: ${id} (${r.out.slice(0, 80)})`);
    assert.match(r.out, /^valid/m, `valid bildirir: ${id}`);
  }
  for (const id of bad) {
    const r = runTool(['--validate', id]);
    assert.notEqual(r.code, 0, `reddedilmeli: ${id}`);
    assert.match(r.out, /^invalid/m, `invalid bildirir: ${id}`);
  }
});

// ---- (b) safeClipId yeni biçimi kabul eder ---------------------------------
check('(b) safeClipId yeni hece biçimini kabul eder, başka biçimi reddeder', () => {
  const b = { window: {}, Date };
  vm.createContext(b);
  for (const n of ['quranLexiconV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranMahrecSchemasV1']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), b, { filename: n });
  }
  for (const f of ['app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), b, { filename: f });
  }
  const api = b.window.SeymaQuranLearn;
  assert.equal(typeof api.safeClipId, 'function', 'safeClipId dışa açık');
  assert.equal(api.safeClipId('w-l_min_1f6fa6'), true, 'kelime biçimi hâlâ geçerli');
  assert.equal(api.safeClipId('y-ba_fatha-m'), true, 'hece biçimi kabul');
  assert.equal(api.safeClipId('y-ba_kasra-f'), true, 'hece biçimi kabul (f)');
  assert.equal(api.safeClipId('y-ba-m'), false, 'eksik hareke reddedilir');
  assert.equal(api.safeClipId('y-ba_fatha-x'), false, 'geçersiz ses reddedilir');
  assert.equal(api.safeClipId('x-ba_fatha-m'), false, 'yanlış önek reddedilir');
  assert.equal(api.safeClipId(''), false, 'boş reddedilir');
});

// ---- (c) Manifest: awaiting-recording dataset girdisi ----------------------
check('(c) manifest yeni dataset girdisini awaiting-recording ile taşır', () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  // datasets[] = kaynaklı/yayınlanmış (lisans+atıf+url zorunlu, ayarlara yansır).
  // Kaydedilmemiş malzeme planned[] altında durur; ayarlar bölümünü kirletmez.
  assert.ok(Array.isArray(manifest.planned), 'planned listesi');
  const syllable = manifest.planned.filter((d) => d.kind === 'syllable' || /syllable|hece/i.test(String(d.id || '')))[0];
  assert.ok(syllable, 'hece girdisi planned[] içinde');
  assert.equal(manifest.datasets.filter((d) => d.kind === 'syllable').length, 0, 'kaydedilmemiş hece datasets[] içinde DEĞİL');
  assert.equal(syllable.status, 'awaiting-recording', 'kayıt bekliyor (uydurma kayıt yok)');
  assert.equal(syllable.kind, 'syllable', 'tür: syllable');
  assert.equal(syllable.voices.length, 2, 'iki ses (m + f)');
  assert.deepEqual(syllable.voices.map((v) => v.role), ['reciter-male', 'reciter-female'], 'roller kişisel veri değil');
  assert.deepEqual(syllable.license.required, ['CC BY 4.0', 'süresiz kullanım hakkı'], 'lisans zorunluluğu K-3');
  assert.equal(syllable.protocol.sampleRateHz, 48000, '48 kHz');
  assert.equal(syllable.protocol.bitDepth, 24, '24-bit');
  assert.equal(syllable.protocol.integratedLufs, -18, '−18 LUFS');
  assert.equal(syllable.protocol.truePeakDbtp, -1, '−1 dBTP');
  assert.match(syllable.clipName, /^y-<.*>_<.*>-<m\|f>\.m4a$/, 'ad biçimi belgeli');
  assert.ok(syllable.clipNameExample.includes('y-ba_fatha-m'), 'örnek ad verilmiş');
  assert.deepEqual(syllable.medCarriers, ['alef', 'waw', 'ya'], 'med taşıyıcıları beyan edilmiş');
  assert.equal(syllable.expectedClips, 230, 'beklenen 230 klip');
  assert.equal(syllable.qa.reviewer, 'L2', 'L2 mahreç dinlemesi');
});

check('(c) mevcut kelime klipleri bozulmadı (toplam ve bütçe)', () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  assert.equal(manifest.counts.total, 1678, 'klip sayısı değişmedi');
  assert.equal(manifest.budgetBytes, 24 * 1024 * 1024, 'bütçe 24 MB (K-1)');
  assert.ok(manifest.totalBytes < manifest.budgetBytes, 'bütçe altında');
  assert.equal(manifest.policy.quranicTts, false, 'TTS yasak (K-3 kademe C)');
});

// ---- (2) ffmpeg kapısı ve ölçüm -------------------------------------------
check('(2) ffmpeg yoksa açık hata; sessizce geçmez', () => {
  // Yol boş PATH ile koşulur → ffmpeg bulunamaz.
  let result;
  try {
    result = { code: 0, out: execFileSync(process.execPath, [TOOL, '--check', '--source', path.join(repoRoot, 'tools')], {
      encoding: 'utf8', stdio: 'pipe', env: Object.assign({}, process.env, { PATH: '/nonexistent' })
    }) };
  } catch (error) {
    result = { code: error.status || 1, out: String((error.stdout || '') + (error.stderr || '')) };
  }
  assert.notEqual(result.code, 0, 'ffmpeg yokken başarısız olur');
  assert.match(result.out, /ffmpeg/i, 'hatayı ffmpeg diye adlandırır');
  assert.match(result.out, /loudnorm|LUFS|dBTP/i, 'ölçüm beklentisini söyler');
});

check('(2) klip yoksa awaiting-recording; kayıt UYDURULMAZ', () => {
  // F-19: eskiden klipsiz örnek dizin olarak arşiv kanıt klasörü kullanılıyordu; artık hermetik, boş geçici dizin.
  const empty = fs.mkdtempSync(path.join(require('os').tmpdir(), 'kao-ses-bos-'));
  const r = runTool(['--check', '--source', empty]);
  assert.equal(r.code, 0, 'boş dizin hata değil, durum bildirir');
  assert.match(r.out, /awaiting-recording/, 'kayıt beklediğini söyler');
  assert.match(r.out, /kayıt bekliyor/i, 'Türkçe açıklama');
});

check('(2) var olmayan kaynak dizini net hata verir', () => {
  const r = runTool(['--check', '--source', path.join(require('os').tmpdir(), 'kao-ses-yok-' + process.pid, '__yok__')]);
  assert.notEqual(r.code, 0, 'var olmayan dizinde başarısız');
  assert.match(r.out, /kaynak bulunamadı/i, 'nedeni söyler');
});

// ---- (3) Kademe B yedeği: hece yoksa kelime içinde ses ---------------------
check('(3) hece klibi yokken S0 kademe B (kelime içinde ses) ile çalışır', () => {
  const b = { window: {}, Date };
  vm.createContext(b);
  for (const n of ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranMahrecSchemasV1',
    'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), b, { filename: n });
  }
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), b, { filename: f });
  }
  const api = b.window.SeymaQuranLearn;
  assert.equal(typeof api.kaoS0ClipPlan, 'function', 'klip planı motorda');
  const plan = api.kaoS0ClipPlan('ba');
  assert.equal(plan.tier, 'B', 'kayıt yokken kademe B');
  assert.match(plan.word.file, /^w-.*-measured\.m4a$/, 'kelime klibi kullanılır');
  assert.equal(plan.syllable, null, 'hece klibi uydurulmaz');
  // Kayıt gelince hat A'ya geçebilmeli (kapı hazır).
  assert.equal(typeof api.kaoS0SyllableClipId, 'function', 'hece kimliği üretilir');
  assert.equal(api.kaoS0SyllableClipId('ba', 'fatha', 'm'), 'y-ba_fatha-m', 'ad biçimi K-3');
});

check('(3) kayıt yokken çalışmayan hece oynatma kontrolü gösterilmez', () => {
  const b = { window: {}, Date };
  vm.createContext(b);
  for (const n of ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranMahrecSchemasV1',
    'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), b, { filename: n });
  }
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), b, { filename: f });
  }
  const data = { settings: {}, days: {}, quranLearn: null };
  const ui = { kaoOpen: true, kaoStack: [] };
  const api = b.window.SeymaQuranLearn;
  api.registerQuranLearn({ data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-30', esc: (v) => String(v ?? ''), icon: () => '', getDay: () => ({}) });
  api.registerQuranLearnSurface({
    createAudio: (src) => ({ preload: '', addEventListener() {}, play: () => undefined, src }),
    toast() {}, isQuietTime: false, mount() {}, lockBody() {}, unlockBody() {}, focusDialog() {}, restoreFocus() {},
    activeElementId: () => '', sheetClose(e, bk, done) { done && done(); }, taskElement: () => null
  });
  api.ensureQuranLearn(data).onboarding.doneAt = '2026-09-20T00:00:00.000Z';
  api.kaoS0Start('s0.02');
  api.kaoS0('next'); // K2F-14: ses düğmesi dinle-gör aşamasında (aşama 0 yalnız açıklama)
  const html = String(api.kaoS0HTML()).replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  assert.doesNotMatch(html, /y-[a-z]+_[a-z_]+-[mf]/, 'kayıt yokken hece klibi çağrılmaz');
  assert.match(html, /App\.kaoS0\('audio'\)/, 'kelime içi ses (kademe B) sunulur');
});

console.log(`KAO2 syllable-audio: PASS (${passed} kontrol)`);
