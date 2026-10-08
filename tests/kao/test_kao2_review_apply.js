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
const applyDelegatedReview = (textsPath, sheetPath) => execFileSync(process.execPath, [
  TOOL, '--apply-review', '--texts', textsPath, '--sheet', sheetPath, '--out-dir', tmp,
  '--by', 'ai-delegated', '--delegated-by', 'owner', '--delegated-at', '2026-10-02'
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

check('yetki devri mevcut sourced kayıtları dürüst metadata ile dönüştürür', () => {
  const textsPath = copyIn(TEXTS);
  const sheetPath = path.join(tmp, 'SHEET-DELEGATED.md');
  fs.writeFileSync(sheetPath, `${read(SHEET_17)}\n${read(SHEET_18)}`);
  applyDelegatedReview(textsPath, sheetPath);
  const after = JSON.parse(fs.readFileSync(textsPath, 'utf8'));
  const entries = [
    ...Object.values(after.units),
    ...Object.values(after.lessons),
    ...Object.values(after.s0),
    ...Object.values(after.concepts)
  ];
  assert.equal(entries.length, 158, '158 inceleme kaydı');
  for (const entry of entries) {
    assert.equal(entry.review.level, 'sourced');
    assert.equal(entry.review.by, 'ai-delegated');
    assert.equal(entry.review.delegatedBy, 'owner');
    assert.equal(entry.review.delegatedAt, '2026-10-02');
  }
});

// D3F-09 (F-09): metni değişmiş, zaten görünür bir kaydı yeniden onaylamak için tek kutulu sayfa + açık --at kullanılır.
// (1) açık --at yeni inceleme tarihini yazar (eskiden yalnız draft → sourced geçişinde yazılıyordu);
// (2) kısmi sayfa, çıktı inceleme sayfasındaki öteki kayıtların işaretlerini düşürmez (sourced ⇔ işaretli bozulmaz).
// Tarih verideki değerden FARKLI seçilir; aynı olsaydı araç tarihi yazmasa da test geçerdi (D3F-09 mutasyonu M3 gösterdi).
const REAPPLY_AT = '2026-10-08';
const reapplyOne = (id, outName) => {
  const textsPath = copyIn(TEXTS);
  const before = JSON.parse(fs.readFileSync(textsPath, 'utf8'));
  const sheetPath = path.join(tmp, `SHEET-17-ONE-${outName}.md`);
  fs.writeFileSync(sheetPath, read(SHEET_17).replace(/\[x\]/gi, '[ ]').split('\n')
    .map((line) => (line.startsWith(`| ${id} |`) ? line.replace('- [ ]', '- [x]') : line)).join('\n'));
  const out = path.join(tmp, outName);
  execFileSync(process.execPath, [TOOL, '--apply-review', '--texts', textsPath, '--sheet', sheetPath, '--out-dir', out,
    '--at', REAPPLY_AT, '--by', 'ai-delegated', '--delegated-by', 'owner', '--delegated-at', REAPPLY_AT], { encoding: 'utf8' });
  return { before, after: JSON.parse(fs.readFileSync(textsPath, 'utf8')), out };
};

check('D3F-09: açık --at, görünür bir kaydı yeniden onaylarken inceleme tarihini yazar; ötekilere dokunmaz', () => {
  const { before, after } = reapplyOne('u09.01', 'reapply-at');
  assert.notEqual(before.lessons['u09.01'].review.at, REAPPLY_AT, 'sınama tarihi verideki tarihten farklı olmalı');
  assert.equal(after.lessons['u09.01'].review.at, REAPPLY_AT, 'açık --at yazılmadı');
  assert.equal(after.lessons['u09.01'].review.delegatedAt, REAPPLY_AT);
  assert.equal(after.lessons['u09.01'].review.level, 'sourced');
  const others = (t) => { const c = JSON.parse(JSON.stringify(t)); delete c.lessons['u09.01']; return c; };
  assert.deepEqual(others(after), others(before), 'öteki kayıtlar değişmemeli');
});

check('D3F-09: kısmi sayfayla onay, çıktı inceleme sayfasındaki öteki işaretleri düşürmez', () => {
  const { out } = reapplyOne('u09.01', 'reapply-marks');
  const sheet = fs.readFileSync(path.join(out, SHEET_17), 'utf8');
  const boxes = (text) => (text.match(/- \[x\]/g) || []).length;
  assert.equal(boxes(sheet), boxes(read(SHEET_17)), 'çıktı sayfasında işaret sayısı düştü');
  assert.match(sheet, /^\| u09\.01 \|.*\| - \[x\] \|$/m, 'u09.01 kutusu işaretli değil');
  assert.equal(fs.readFileSync(path.join(out, SHEET_18), 'utf8'), read(SHEET_18), 'INCELEME-18 işaretleri korunmadı');
});

check('onaylanmamış kutu draft bırakır', () => {
  const textsPath = copyIn(TEXTS);
  const sheetPath = path.join(tmp, 'SHEET-18-PARTIAL.md');
  const blankSheet = read(SHEET_18).replace(/\[x\]/gi, '[ ]');
  const sheet = blankSheet.split('\n');
  let seen = 0;
  fs.writeFileSync(sheetPath, sheet.map((line) => {
    if (!/- \[ \]/.test(line) || !/^### /.test(line)) return line;
    seen += 1;
    return seen <= 1 ? line.replace(/- \[ \]/g, '- [x]') : line;
  }).join('\n'));
  // İlk başlıktan sonra gelen kutuları işaretle: yalnız o kavram sourced olmalı.
  const partial = (() => {
    const out = blankSheet.split('\n');
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

// --- K2F-24 ek tur · üretici araç işaretli inceleme kutularını SİLMEZ ---------------------------------
// Eskiden araç her çalışmada iki inceleme sayfasını sıfırdan yazıp [x] kutularını siliyordu (elle `git checkout` gerekiyordu).
const regenerate = (outDir) => execFileSync(process.execPath, [TOOL, '--out-dir', outDir], { encoding: 'utf8' });
const flipFirst = (text, pattern, replacement) => {
  assert.match(text, pattern, 'çevrilecek kutu satırı bulunamadı');
  return text.replace(pattern, replacement);
};

check('K2F-24 ek tur: önceki sayfadaki işaretler (ders satırı, yalnız-L2 ünite/kavram kutusu) yeniden üretimde korunur', () => {
  const out = path.join(tmp, 'carry');
  const sheets = [SHEET_17, SHEET_18].map((rel) => path.join(out, rel));
  sheets.forEach((target) => fs.mkdirSync(path.dirname(target), { recursive: true }));
  // Depodaki sayfalarda tüm L1 kutuları işaretli, L2 kutuları boş: bir ders işaretini kaldır, bir L2 kutusunu işaretle.
  const edited17 = flipFirst(flipFirst(read(SHEET_17), /(\| (?:u\d\d|s0)\.\d\d \|[^\n]*?\| )- \[x\] \|/, '$1- [ ] |'),
    /- \[x\] L1 metin uygun {3}- \[ \] L2/, '- [x] L1 metin uygun   - [x] L2');
  const edited18 = flipFirst(read(SHEET_18), /- \[x\] L1 metin uygun {3}- \[ \] L2/, '- [x] L1 metin uygun   - [x] L2');
  fs.writeFileSync(sheets[0], edited17);
  fs.writeFileSync(sheets[1], edited18);
  regenerate(out);
  assert.equal(fs.readFileSync(sheets[0], 'utf8'), edited17, 'INCELEME-17: işaretler korunmadı');
  assert.equal(fs.readFileSync(sheets[1], 'utf8'), edited18, 'INCELEME-18: işaretler korunmadı');
});

check('K2F-24 ek tur: araç ikinci kez çalışınca iki sayfa bayt-eş kalır', () => {
  const out = path.join(tmp, 'twice');
  regenerate(out);
  const first = [SHEET_17, SHEET_18].map((rel) => fs.readFileSync(path.join(out, rel), 'utf8'));
  regenerate(out);
  const second = [SHEET_17, SHEET_18].map((rel) => fs.readFileSync(path.join(out, rel), 'utf8'));
  assert.deepEqual(second, first);
});

check('K2F-24 ek tur: boş --out-dir önceki sayfayı depodan taşır (depodaki onaylı kutular kaybolmaz)', () => {
  const out = path.join(tmp, 'fromrepo');
  regenerate(out);
  for (const rel of [SHEET_17, SHEET_18]) {
    assert.equal(fs.readFileSync(path.join(out, rel), 'utf8'), read(rel), `${rel}: depo ile bayt-eş değil`);
  }
});

check('K2F-24 ek tur: taşınamayan işaret (kimlik kayboldu ya da kutu sayısı değişti) sessizce düşmez, uyarı verir', () => {
  const { carryReviewMarks } = require('../../tools/kao2-curriculum-build.mjs');
  const previous = ['### Ünite 1 · A', '', '- [x] L1 metin uygun   - [x] L2 (dinî bağlam) uygun', '',
    '### Ünite 2 dersleri', '', '| ders | başlık | onay |', '|---|---|---|', '| u02.01 | x | - [x] |', '| u99.01 | silindi | - [x] |'].join('\n');
  const next = ['### Ünite 1 · A', '', '- [ ] L1 metin uygun', '',
    '### Ünite 2 dersleri', '', '| ders | başlık | onay |', '|---|---|---|', '| u02.01 | x | - [ ] |'].join('\n');
  const warnings = [];
  const original = console.warn;
  console.warn = (message) => warnings.push(String(message));
  let out;
  try { out = carryReviewMarks(previous, next, 'sayfa'); } finally { console.warn = original; }
  assert.match(out, /\| u02\.01 \| x \| - \[x\] \|/, 'kimliği duran satırın işareti taşınır');
  assert.match(out, /- \[ \] L1 metin uygun$/m, 'kutu sayısı değişen satır taşınmaz (yanlış kutuya işaret yazılmaz)');
  assert.equal(warnings.length, 1, 'tek uyarı');
  assert.match(warnings[0], /u1.*u99\.01|u99\.01.*u1/, 'uyarı taşınamayan her iki kimliği de sayar');
});

check('K2F-24 ek tur: metni değişen satırın işareti TAŞINMAZ (yeni metin görülmeden onaylı görünmez); yalnız düzey sütunu/İnceleme satırı değişirse taşınır', () => {
  const { carryReviewMarks } = require('../../tools/kao2-curriculum-build.mjs');
  const sheet = (title, level, vaad, m = ' ') => ['### Ünite 1 · A', '', `- Vaad: ${vaad}`, `- İnceleme: \`${level}\``, `- [${m}] L1 metin uygun   - [${m}] L2 (dinî bağlam) uygun`, '',
    '### Ünite 1 dersleri', '', '| ders | başlık | hedef | inceleme | onay |', '|---|---|---|---|---|', `| u01.01 | ${title} | h | \`${level}\` | - [${m}] |`].join('\n');
  const run = (previous, next) => {
    const warnings = [];
    const original = console.warn;
    console.warn = (message) => warnings.push(String(message));
    try { return { out: carryReviewMarks(previous, next, 'sayfa'), warnings }; } finally { console.warn = original; }
  };
  const same = run(sheet('Eski', 'draft', 'v', 'x'), sheet('Eski', 'sourced', 'v'));
  assert.equal(same.out, sheet('Eski', 'sourced', 'v', 'x'), 'yalnız düzey değişti: iki işaret de taşınır');
  assert.equal(same.warnings.length, 0);
  const title = run(sheet('Eski', 'draft', 'v', 'x'), sheet('Yeni', 'draft', 'v'));
  assert.match(title.out, /\| u01\.01 \| Yeni \| h \| `draft` \| - \[ \] \|/, 'ders başlığı değişti: işaret taşınmaz');
  assert.match(title.out, /- \[x\] L1 metin uygun {3}- \[x\] L2/, 'ünite metni aynı: ünite işareti taşınır');
  assert.equal(title.warnings.length, 1);
  const vaad = run(sheet('Eski', 'draft', 'v', 'x'), sheet('Eski', 'draft', 'yeni vaat'));
  assert.match(vaad.out, /- \[ \] L1 metin uygun {3}- \[ \] L2/, 'ünite vaadi değişti: işaret taşınmaz');
  assert.match(vaad.out, /\| u01\.01 \| Eski \| h \| `draft` \| - \[x\] \|/, 'ders satırı aynı: işareti kalır');
});

check('K2F-24 ek tur: aynı kimlikli birden çok kutu satırı belirsizdir → taşınmaz ve uyarılır', () => {
  const { carryReviewMarks } = require('../../tools/kao2-curriculum-build.mjs');
  const dup = ['### g1 · X', '', '- [x] L1 metin uygun', '- [ ] L1 metin uygun'].join('\n');
  const warnings = [];
  const original = console.warn;
  console.warn = (message) => warnings.push(String(message));
  let out;
  try { out = carryReviewMarks(dup, dup.replace(/\[x\]/, '[ ]'), 'sayfa'); } finally { console.warn = original; }
  assert.doesNotMatch(out, /\[x\]/, 'belirsiz işaret hiçbir satıra yazılmaz');
  assert.equal(warnings.length, 1);
});

check('K2F-24 ek tur: araç sembolik bağ üzerinden çalıştırılınca da üretir (sessizce hiçbir şey yapmaz)', () => {
  const link = path.join(tmp, 'tool-link.mjs');
  fs.symlinkSync(TOOL, link);
  const out = path.join(tmp, 'viaSymlink');
  execFileSync(process.execPath, [link, '--out-dir', out], { encoding: 'utf8' });
  assert.ok(fs.existsSync(path.join(out, 'app/content/quranCurriculumV2.js')), 'sembolik bağ üzerinden çıktı üretilmedi');
});

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`KAO2 review-apply: PASS (${passed} kontrol)`);
