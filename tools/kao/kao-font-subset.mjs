#!/usr/bin/env node
// K3P-07 (K-B) · Kur'an yazı tipi alt küme aracı (salt-okur sayım + isteğe bağlı üretim).
//
//   node tools/kao/kao-font-subset.mjs
//       İçerik modüllerinde ve KAO çalışma zamanında geçen Arapça kod noktalarını sayar,
//       her zaman gereken Kur'an işaretleri + noktalama ile birleştirir ve `unicodes` listesini basar.
//
//   node tools/kao/kao-font-subset.mjs --build <ScheherazadeNew-Regular.ttf>
//       pyftsubset (fonttools) ile `assets/kao/font/ScheherazadeNew-Regular.k3p.woff2` üretir,
//       üretilen fontun cmap'ini okuyup gereken kod noktalarının %100 kapsandığını doğrular.
//
// Ağ yok. Uygulama verisine, depoya veya tarayıcıya dokunmaz; yalnız metin okur ve
// (--build ile) tek bir ikili varlık yazar.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = 'assets/kao/font';
const OUT_FILE = OUT_DIR + '/ScheherazadeNew-Regular.k3p.woff2';

// Sayım kaynakları: doğrulanmış içerik modülleri + KAO motoru (işaretleme metni buradan gelir).
const SOURCES = [
  'app/content/quranLexiconV1.js',
  'app/content/quranGrammarV1.js',
  'app/content/quranShortSurahsV1.js',
  'app/content/quranPhonicsV1.js',
  'app/content/quranCurriculumV2.js',
  'app/content/quranConceptTextsV1.js',
  'app/content/quranMahrecSchemasV1.js',
  'app/content/quranRevelationOrderV1.js',
  'app/content/quranStrikingVersesV1.js',
  'app/core/quranLearn.js',
  'app/core/quranLearnFlow.js',
  'app/core/quranLearnViews.js',
];

// Her zaman alt kümeye giren Kur'an işaretleri (içerikte o an geçmese de metin doğru çizilsin).
const ALWAYS_RANGES = [
  [0x0610, 0x061a], // Arapça işaretler (sükût, şedde varyantları)
  [0x064b, 0x065f], // harekeler (fetha…hemze üstü)
  [0x0670, 0x0670], // üst elif (elif-hançer)
  [0x06d6, 0x06ed], // Kur'an işaretleri (secde, hizb, küçük yüksek harfler)
];
// Noktalama ve sayı işaretleri (Arapça virgül/noktalı virgül/soru, ayet sonu, yüzdeler).
const ALWAYS_SINGLES = [0x0640, 0x060c, 0x061b, 0x061f, 0x066a, 0x066b, 0x066c, 0x066d, 0x06d4];

// Arapça blokları (K-B `unicode-range` ile aynı aile).
const isArabic = (o) =>
  (o >= 0x0600 && o <= 0x06ff) ||
  (o >= 0x0750 && o <= 0x077f) ||
  (o >= 0x08a0 && o <= 0x08ff) ||
  (o >= 0xfb50 && o <= 0xfdff) ||
  (o >= 0xfe70 && o <= 0xfeff);

function collectUsed() {
  const used = new Set();
  const perFile = [];
  for (const rel of SOURCES) {
    const abs = path.join(repo, rel);
    if (!fs.existsSync(abs)) continue;
    const before = used.size;
    for (const ch of fs.readFileSync(abs, 'utf8').toString()) {
      const o = ch.codePointAt(0);
      if (o > 0x7f && isArabic(o)) used.add(o);
    }
    perFile.push([rel, used.size - before]);
  }
  return { used, perFile };
}

function requiredSet(used) {
  const req = new Set(used);
  for (const [lo, hi] of ALWAYS_RANGES) for (let o = lo; o <= hi; o += 1) req.add(o);
  for (const o of ALWAYS_SINGLES) req.add(o);
  return req;
}

/** Tek kod noktalarını bitişik aralıklara indirger; pyftsubset `--unicodes` biçimine çevirir. */
function toRanges(codepoints) {
  const sorted = [...codepoints].sort((a, b) => a - b);
  const ranges = [];
  for (const o of sorted) {
    const last = ranges[ranges.length - 1];
    if (last && o === last[1] + 1) last[1] = o;
    else ranges.push([o, o]);
  }
  return ranges;
}
const hex = (o) => '0x' + o.toString(16).toUpperCase().padStart(2, '0');
const toUnicodes = (codepoints) =>
  toRanges(codepoints).map(([lo, hi]) => (lo === hi ? 'U+' + hex(lo).slice(2) : `U+${hex(lo).slice(2)}-${hex(hi).slice(2)}`)).join(',');

/** Üretilen fontun cmap'ini fontTools ile okur (salt-okur, tek kod noktası listesi). */
function cmapOf(file) {
  const probe = `
import sys, json
from fontTools.ttLib import TTFont
f = TTFont(sys.argv[1])
c = set()
for t in f['cmap'].tables:
    c.update(t.cmap.keys())
# yalnız BMP Arapça ailesiyle ilgileniyoruz
print(json.dumps(sorted(o for o in c if o > 0x7f)))
`;
  const r = spawnSync('python3', ['-c', probe, file], { cwd: repo, encoding: 'utf8' });
  if (r.status !== 0) throw new Error('cmap okunamadı: ' + (r.stderr || '').trim());
  return new Set(JSON.parse(r.stdout));
}

function main() {
  const args = process.argv.slice(2);
  const buildAt = args.indexOf('--build');
  const { used, perFile } = collectUsed();
  const req = requiredSet(used);

  console.log('== K3P-07 · Kur’an yazı tipi alt kümesi ==');
  console.log(`kaynak dosya: ${perFile.length}`);
  for (const [rel, n] of perFile) console.log(`  · ${rel.padEnd(42)} +${n} kod noktası`);
  console.log(`içerikte geçen Arapça kod noktası: ${used.size}`);
  console.log(`her zaman gereken (işaret + noktalama): ${req.size - used.size}`);
  console.log(`alt küme hedefi: ${req.size} kod noktası · ${toRanges(req).length} aralık`);
  console.log('unicodes: ' + toUnicodes(req));

  if (buildAt < 0) {
    console.log('\n(üretim için: node tools/kao/kao-font-subset.mjs --build <Regular.ttf>)');
    return;
  }
  const ttf = args[buildAt + 1];
  if (!ttf || !fs.existsSync(ttf)) {
    console.error('kaynak TTF bulunamadı: ' + ttf);
    process.exit(2);
  }
  const outAbs = path.join(repo, OUT_FILE);
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  const r = spawnSync('python3', [
    '-m', 'fontTools.subset', path.resolve(ttf),
    '--unicodes=' + toUnicodes(req),
    '--layout-features=*',
    '--flavor=woff2',
    '--output-file=' + outAbs,
  ], { cwd: repo, encoding: 'utf8' });
  if (r.status !== 0) {
    console.error('pyftsubset başarısız: ' + (r.stderr || '').trim());
    process.exit(2);
  }
  const bytes = fs.statSync(outAbs).size;
  const kib = (bytes / 1024).toFixed(1);
  const covered = cmapOf(outAbs);
  const missing = [...req].filter((o) => !covered.has(o));
  console.log(`\nüretildi: ${OUT_FILE} · ${bytes} bayt (${kib} KiB) · tavan 150 KiB ${bytes <= 150 * 1024 ? '✓' : '✗ AŞILDI'}`);
  console.log(`kapsam: ${req.size - missing.length}/${req.size} kod noktası (%${(((req.size - missing.length) / req.size) * 100).toFixed(1)})`);
  if (missing.length) {
    console.error('eksik kod noktaları: ' + missing.map(hex).join(' '));
    process.exit(1);
  }
  console.log('K3P-07 alt küme: PASS (içerikteki kod noktalarının %100’ü kapsanıyor)');
}

main();
