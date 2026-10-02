'use strict';

// KAO2-18 · K-4 onay taşıma kapısı (L0).
//
// NEDEN VAR: İnceleme sayfası ve UYGULAMA-PROMPTLARI KAO2-17 §3, onayın
// `--apply-review` ile metin kaynağına taşındığını SÖYLÜYORDU; ancak araçta
// böyle bir seçenek yoktu ve bilinmeyen argüman sessizce yok sayılıyordu
// (exit 0). Yani kullanıcı onay verse bile metinler `draft` kalıyordu.
// Bu fixture yolun GERÇEKTEN var olduğunu ve doğru çalıştığını zorlar.
//
// Kapsam: sentetik + geçici dizin; gerçek ağa çıkılmaz, gerçek metin
// dosyasına yazılmaz. Onay yalnız `--apply-review` çağrısıyla taşınır.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const repoRoot = require('../repo-root');

const TOOL = path.join(repoRoot, 'tools/kao2-curriculum-build.mjs');
const SHEET_17 = 'docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md';
const SHEET_18 = 'docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-18.md';
const TEXTS = 'docs/kuran-ogreniyorum/kao2/content/texts.tr.json';

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };
const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');

// --- aracın sözleşmesi -------------------------------------------------------
check('araç --apply-review seçeneğini gerçekten uygular', () => {
  const src = read('tools/kao2-curriculum-build.mjs');
  assert.match(src, /--apply-review/, 'araç --apply-review bilir');
  assert.match(src, /applyReview|apply-review/, 'işleyen bir dal var');
});

check('inceleme sayfası vaadi araçla tutarlı (belge ≠ kod olamaz)', () => {
  const src = read('tools/kao2-curriculum-build.mjs');
  // Sayfada geçen her bayrak araçta da geçmeli.
  for (const rel of [SHEET_17, SHEET_18]) {
    const flags = new Set(String(read(rel)).match(/--[a-z-]+/g) || []);
    for (const flag of flags) assert.ok(src.includes(flag), `${rel}: "${flag}" araçta yok`);
  }
});

// --- davranış: geçici kopya üzerinde uçtan uca -------------------------------
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kao2-apply-'));
const copyIn = (rel) => {
  const dst = path.join(tmp, path.basename(rel));
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(path.join(repoRoot, rel), dst);
  return dst;
};
const applyReview = (textsPath, sheetPath) => execFileSync(process.execPath, [
  TOOL, '--apply-review', '--texts', textsPath, '--sheet', sheetPath, '--out-dir', tmp
], { encoding: 'utf8' });

const runApply = () => {
  const textsPath = copyIn(TEXTS);
  // Gerçek inceleme sayfasını kopyala ve TÜM onay kutularını işaretle.
  const sheetPath = path.join(tmp, 'SHEET-18.md');
  fs.writeFileSync(sheetPath, read(SHEET_18).replace(/- \[ \]/g, '- [x]'));
  applyReview(textsPath, sheetPath);
  return JSON.parse(fs.readFileSync(textsPath, 'utf8'));
};

let applied = null;
check('onaylanan kavramlar sourced olur; onaylanmayan draft kalır', () => {
  applied = runApply();
  const ids = Object.keys(applied.concepts);
  assert.ok(ids.length > 0, 'kavram var');
  const drafted = ids.filter((id) => applied.concepts[id].review.level === 'draft');
  const sourced = ids.filter((id) => applied.concepts[id].review.level === 'sourced');
  assert.equal(drafted.length, 0, `işaretli tüm kutular taşınmalı (kalan draft: ${drafted.join(', ')})`);
  assert.equal(sourced.length, ids.length, 'tamamı sourced');
  for (const id of sourced) {
    const r = applied.concepts[id].review;
    assert.equal(r.by, 'owner', `${id}: rol kodu owner`);
    assert.match(String(r.at || ''), /^\d{4}-\d{2}-\d{2}$/, `${id}: tarih`);
  }
});

check('onay metni ve içeriği bozmaz', () => {
  const before = JSON.parse(read(TEXTS));
  for (const id of Object.keys(before.concepts)) {
    assert.equal(applied.concepts[id].workedTr, before.concepts[id].workedTr, `${id}: workedTr korunur`);
    assert.equal(applied.concepts[id].errorTr, before.concepts[id].errorTr, `${id}: errorTr korunur`);
  }
  assert.deepEqual(applied.units, before.units, 'üniteler değişmez');
  assert.equal(applied.version, before.version, 'sürüm korunur');
});

check('onaylanmamış kutu draft bırakır', () => {
  const textsPath = copyIn(TEXTS);
  const sheetPath = path.join(tmp, 'SHEET-18-PARTIAL.md');
  const sheet = read(SHEET_18).split('\n');
  let seen = 0;
  fs.writeFileSync(sheetPath, sheet.map((line) => {
    if (!/- \[ \]/.test(line) || !/^### /.test(line)) return line;
    seen += 1;
    return seen <= 1 ? line.replace(/- \[ \]/g, '- [x]') : line;
  }).join('\n'));
  // İlk başlıktan sonra gelen kutuları işaretle: yalnız o kavram sourced olmalı.
  const partial = (() => {
    const out = read(SHEET_18).split('\n');
    const mark = new Set();
    let current = null;
    for (let i = 0; i < out.length; i += 1) {
      const m = /^### (\S+)/.exec(out[i]);
      if (m) current = m[1];
      if (current && /- \[ \]/.test(out[i]) && !mark.has(current)) { mark.add(current); out[i] = out[i].replace(/- \[ \]/g, '- [x]'); }
    }
    fs.writeFileSync(sheetPath, out.join('\n'));
    return mark;
  })();
  applyReview(textsPath, sheetPath);
  const after = JSON.parse(fs.readFileSync(textsPath, 'utf8'));
  const sourced = Object.keys(after.concepts).filter((id) => after.concepts[id].review.level === 'sourced');
  assert.deepEqual(sourced.sort(), [...partial].sort(), 'yalnız işaretli kavramlar taşınır');
});

check('taşıma idempotent: ikinci çalıştırma değişiklik üretmez', () => {
  const textsPath = copyIn(TEXTS);
  const sheetPath = path.join(tmp, 'SHEET-18-IDEMP.md');
  fs.writeFileSync(sheetPath, read(SHEET_18).replace(/- \[ \]/g, '- [x]'));
  applyReview(textsPath, sheetPath);
  const first = fs.readFileSync(textsPath, 'utf8');
  applyReview(textsPath, sheetPath);
  assert.equal(fs.readFileSync(textsPath, 'utf8'), first, 'ikinci tur bayt-eş');
});

check('bilinmeyen seçenek sessizce yok sayılmaz', () => {
  let threw = false;
  try {
    execFileSync(process.execPath, [TOOL, '--nope'], { encoding: 'utf8', stdio: 'pipe' });
  } catch { threw = true; }
  assert.equal(threw, true, 'bilinmeyen bayrak hata verir');
});

// --- K2F-22 · sourced ⇔ işaretli kutu (gerçek inceleme sayfası, gerçek metin) ---
// Kural (KR-4): ünite/ders/S0 metni yalnız inceleme sayfasında kutusu `[x]` ise
// `sourced`/`expert` olabilir; kutusu işaretsiz olan metin `draft`'tır.
const ticked17 = () => {
  const ids = new Set();
  let unit = null;
  for (const line of read(SHEET_17).split('\n')) {
    const h = /^### Ünite (\d+) ·/.exec(line);
    if (h) { unit = `u${h[1]}`; continue; }
    if (/^##? /.test(line)) { unit = null; continue; }
    if (unit && /^- \[x\] L1/i.test(line)) ids.add(unit);
    const row = /^\|\s*((?:u\d\d|s0)\.\d\d)\s*\|.*\|\s*- \[x\]\s*\|$/i.exec(line);
    if (row) ids.add(row[1]);
  }
  return ids;
};

check('K2F-22: sourced ⇔ işaretli kutu (üniteler, dersler, S0)', () => {
  const texts = JSON.parse(read(TEXTS));
  const ticked = ticked17();
  assert.ok(ticked.size > 0, 'inceleme sayfasında en az bir işaretli kutu var');
  const entries = [
    ...Object.keys(texts.units).map((k) => [`u${k}`, texts.units[k]]),
    ...Object.entries(texts.lessons),
    ...Object.entries(texts.s0)
  ];
  const visible = (e) => ['sourced', 'expert'].includes(e.review.level);
  const unticked = entries.filter(([id, e]) => visible(e) && !ticked.has(id)).map(([id]) => id);
  const missing = entries.filter(([id, e]) => !visible(e) && ticked.has(id)).map(([id]) => id);
  assert.deepEqual(unticked, [], `kutusuz ama sourced: ${unticked.join(', ')}`);
  assert.deepEqual(missing, [], `kutulu ama draft: ${missing.join(', ')}`);
  for (const [id] of entries.filter(([, e]) => visible(e))) assert.ok(ticked.has(id), id);
});

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`KAO2 review-apply: PASS (${passed} kontrol)`);
