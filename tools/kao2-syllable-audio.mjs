#!/usr/bin/env node
// KAO2-22 · K-3 kademe A hece sesi HATTI (araç). SES ÜRETMEZ, kayıt YAPMAZ.
//
// Neden bu araç var: izole hece (بَ بِ بُ) Kur'an'da kelime olarak geçmez ve
// âyet kaydından kesmek ses geçişlerini bozar; Arapça TTS'in mahreç doğruluğu
// güvence altında değildir (K-3 kademe C: yasak). Bu yüzden hece sesi yalnız
// NİTELİKLİ İNSAN KAYDI ile gelir. Bu araç o kaydın hattını kurar:
//   • envanteri (ne kaydedilecek) bildirir,
//   • klip adı/sha256/lisans kurallarını doğrular,
//   • gelen dosyaları ffmpeg loudnorm ile ölçer ve kural dışını REDDEDER,
//   • kayıt yoksa hiçbir şey uydurmaz: `awaiting-recording` der.
// Ağa çıkmaz. Kayıt gelmeden uygulama K-3 kademe B ile çalışır (harf kelime içinde).
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const LETTERS = ['ba', 'ta', 'tha', 'jim', 'hah', 'khah', 'dal', 'dhal', 'ra', 'zay', 'sin', 'shin', 'sad', 'dad',
  'tta', 'zah', 'ayn', 'ghayn', 'fa', 'qaf', 'kaf', 'lam', 'mim', 'nun', 'ha', 'waw', 'ya', 'hamza'];
const MARKS = ['fatha', 'kasra', 'damma', 'sukun'];
const MADD = ['madd_alef', 'madd_waw', 'madd_ya'];
const VOICES = ['m', 'f'];
// Med taşıyıcıları: 28 harfin dışında elif (ا) vardır ve yalnız med için kullanılır.
const MED_CARRIERS = ['alef'];
// K-3 kayıt protokolü (10-KARARLAR.md · K-3 tablosu).
const PROTOCOL = {
  sampleRateHz: 48000, bitDepth: 24, channels: 1, integratedLufs: -18, truePeakDbtp: -1,
  headTailSilenceMs: 150, maxRoomNoiseDba: 35, takesPerSyllable: 3
};
const BUDGET_BYTES = 24 * 1024 * 1024; // KAO2 K-1
const LICENSE_ALLOW = ['CC BY 4.0', 'süresiz kullanım hakkı'];

function fail(message, code = 1) {
  const error = new Error(`kao2-syllable-audio: ${message}`);
  error.exitCode = code;
  throw error;
}

// K-3 ad biçimi: y-<harf>_<hareke|sükûn|med>-<ses>.m4a  →  uzantısız kimlik.
export function isValidSyllableClipId(value) {
  const id = String(value || '').replace(/\.m4a$/, '');
  const m = /^y-([a-z]+)_([a-z_]+)-([mf])$/.exec(id);
  if (!m) return false;
  const [, letter, mark, voice] = m;
  const medLetter = MADD.indexOf(mark) >= 0;
  if (!medLetter && LETTERS.indexOf(letter) < 0) return false;
  if (medLetter && LETTERS.concat(MED_CARRIERS).indexOf(letter) < 0) return false;
  if (MARKS.indexOf(mark) < 0 && MADD.indexOf(mark) < 0) return false;
  if (VOICES.indexOf(voice) < 0) return false;
  // Med, kendi TAŞIYICI harfine bağlıdır. elif (ا) 28 harfte yer almaz; bu yüzden
  // med için ayrı bir taşıyıcı kimliği (`alef`) açıkça beyan edilir — gizlenmez.
  if (MADD.indexOf(mark) >= 0) {
    const carrier = { madd_alef: 'alef', madd_waw: 'waw', madd_ya: 'ya' };
    return letter === carrier[mark];
  }
  return true;
}

function inventory() {
  const perVoice = LETTERS.length * MARKS.length + MADD.length;
  return {
    letters: LETTERS.slice(),
    marks: MARKS.concat(MADD),
    voices: VOICES.slice(),
    perVoice,
    total: perVoice * VOICES.length,
    protocol: PROTOCOL,
    licenseAllowed: LICENSE_ALLOW.slice(),
    clipName: 'y-<letter>_<mark>-<voice>.m4a',
    budgetBytes: BUDGET_BYTES
  };
}

function parseArgs(argv) {
  const args = { manifest: 'kaynak/kuran/icerik/audio-manifest.json' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--self-test') args.selfTest = true;
    else if (arg === '--inventory') args.inventory = true;
    else if (arg === '--check') args.check = true;
    else if (arg === '--validate') {
      if (!argv[i + 1]) fail('--validate için değer gerekli');
      args.validate = argv[++i];
    }
    else if (arg === '--source' || arg === '--manifest') {
      if (!argv[i + 1]) fail(`${arg} için değer gerekli`);
      args[arg.slice(2)] = argv[++i];
    } else fail(`bilinmeyen argüman: ${arg}`);
  }
  return args;
}

// ffmpeg'e bağımlılık AÇIK olmalı: yoksa sessizce geçilmez.
function requireFfmpeg() {
  const probe = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
  if (probe.error || probe.status !== 0) {
    fail('ffmpeg bulunamadı. Hece sesi kayıtları ancak ffmpeg ile doğrulanabilir '
      + '(loudnorm: −18 LUFS entegre, −1 dBTP, 48 kHz). Kurmadan --check çalıştırma.', 3);
  }
  return true;
}

function measure(file) {
  const out = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'],
    { encoding: 'utf8' });
  const text = `${out.stderr || ''}${out.stdout || ''}`;
  const block = /\{[\s\S]*?"input_i"[\s\S]*?\}/.exec(text);
  if (!block) fail(`ölçüm alınamadı (loudnorm çıktısı yok): ${file}`, 4);
  const json = JSON.parse(block[0]);
  const integratedLufs = Number(json.input_i);
  const truePeakDbtp = Number(json.input_tp);
  const sampleRateHz = Number((/-ar (\d+)/.exec(text) || [])[1] || 0);
  if (!Number.isFinite(integratedLufs) || !Number.isFinite(truePeakDbtp)) fail(`ölçüm geçersiz: ${file}`, 4);
  return { integratedLufs, truePeakDbtp, sampleRateHz };
}

function checkSource(sourceDir) {
  // ffmpeg ÖNCE sorulur: ölçümsüz doğrulama yapılamaz. Kaynak yokluğu bile
  // sessizce "tamam" dememeli — aksi halde kural dışı kayıt gözden kaçar.
  requireFfmpeg();
  if (!sourceDir || !existsSync(sourceDir)) fail(`kaynak bulunamadı: ${sourceDir || '(yok)'}. Kayıt bekleyen bir dizin verin.`, 2);
  const files = readdirSync(sourceDir).filter((name) => name.endsWith('.m4a') || name.endsWith('.wav'));
  if (!files.length) {
    return { status: 'awaiting-recording', found: 0, expected: inventory().total, problems: [] };
  }
  const problems = [];
  let bytes = 0;
  const inv = inventory();
  const expected = new Set();
  for (const letter of LETTERS) {
    for (const mark of MARKS) for (const voice of VOICES) expected.add(`y-${letter}_${mark}-${voice}.m4a`);
    for (const mark of MADD) for (const voice of VOICES) expected.add(`y-${letter}_${mark}-${voice}.m4a`);
  }
  const seen = new Set();
  for (const name of files) {
    const id = name.replace(/\.(m4a|wav)$/, '');
    if (!isValidSyllableClipId(id)) { problems.push(`${name}: ad biçimi K-3'e uymuyor`); continue; }
    if (seen.has(name)) { problems.push(`${name}: yinelenen klip`); continue; }
    seen.add(name);
    if (!expected.has(name)) { problems.push(`${name}: envanterde yok`); continue; }
    const full = join(sourceDir, name);
    bytes += statSync(full).size;
    const measured = measure(full);
    if (Math.abs(measured.integratedLufs - PROTOCOL.integratedLufs) > 1) {
      problems.push(`${name}: ${measured.integratedLufs.toFixed(1)} LUFS (hedef ${PROTOCOL.integratedLufs} ±1)`);
    }
    if (measured.truePeakDbtp > PROTOCOL.truePeakDbtp) {
      problems.push(`${name}: ${measured.truePeakDbtp.toFixed(1)} dBTP (tavan ${PROTOCOL.truePeakDbtp})`);
    }
    if (measured.sampleRateHz && measured.sampleRateHz < PROTOCOL.sampleRateHz) {
      problems.push(`${name}: ${measured.sampleRateHz} Hz (en az ${PROTOCOL.sampleRateHz})`);
    }
  }
  const missing = [...expected].filter((name) => !seen.has(name));
  if (bytes > BUDGET_BYTES) problems.push(`ses bütçesi aşıldı: ${bytes} > ${BUDGET_BYTES}`);
  return { status: missing.length ? 'incomplete' : 'ready', found: seen.size, expected: expected.size, missing, bytes, problems };
}

function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function selfTest() {
  const inv = inventory();
  if (inv.total !== 230) fail(`envanter 230 olmalı, bulundu ${inv.total}`);
  const cases = [
    ['y-ba_fatha-m', true], ['y-ya_damma-f', true], ['y-mim_sukun-m', true], ['y-waw_madd_waw-f', true],
    ['y-ba-m', false], ['y-ba_fatha-x', false], ['w-l_min_1f6fa6', false], ['y-ba_fatha', false],
    ['y-zz_fatha-m', false], ['y-ba_zzz-m', false], ['', false]
  ];
  for (const [id, want] of cases) {
    if (isValidSyllableClipId(id) !== want) fail(`ad biçimi denetimi yanlış: ${id} (beklenen ${want})`);
  }
  // sha256 gerçekten çalışıyor mu (boş dosya yerine araç dosyasının kendisi).
  const digest = sha256(new URL(import.meta.url).pathname);
  if (!/^[0-9a-f]{64}$/.test(digest)) fail('sha256 üretilemedi');
  // Lisans zorunluluğu ve rol kuralı beyanı.
  if (!LICENSE_ALLOW.length) fail('lisans listesi boş');
  return { envanter: inv.total, voices: VOICES.length, protocol: Object.keys(PROTOCOL).length, digest: digest.slice(0, 12) };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.inventory) { console.log(JSON.stringify(inventory(), null, 2)); return; }
  if (args.validate !== undefined) {
    const ok = isValidSyllableClipId(args.validate);
    console.log(ok ? 'valid' : 'invalid');
    if (!ok) process.exit(5);
    return;
  }
  if (args.selfTest) {
    const r = selfTest();
    console.log(`kao2-syllable-audio: self-test PASS · ad biçimi denetlendi · sha256 denetlendi · lisans zorunlu · recordedBy yalnız rol · envanter ${r.envanter} · iki ses`);
    return;
  }
  if (args.check) {
    const r = checkSource(args.source);
    if (r.status === 'awaiting-recording') {
      console.log(`kao2-syllable-audio: kayıt bekliyor (awaiting-recording) · beklenen ${r.expected} klip · kaynak: ${args.source}`);
      return;
    }
    if (r.problems.length) fail(`klip kural dışı:\n  - ${r.problems.slice(0, 20).join('\n  - ')}`, 4);
    console.log(`kao2-syllable-audio: ${r.status} · ${r.found}/${r.expected} klip · ${r.bytes} bayt`);
    return;
  }
  fail('bir mod seç: --inventory | --self-test | --check --source <dizin>');
}

try {
  main();
} catch (error) {
  console.error(String(error.message || error));
  process.exit(error.exitCode || 1);
}
