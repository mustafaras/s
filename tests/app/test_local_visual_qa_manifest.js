#!/usr/bin/env node
// K3PD-29 · Görsel QA kanıt sözleşmesi fixture'ı (ağsız, tarayıcısız, sentetik).
//
// Neyi korur: F-11'in kök nedeni, çekilen görüntü ile "kanıt" diye raporlanan sayıların
// birbirine bağlı olmamasıydı (6 log × 74 = 444 kayıt; 474 kaydın aynı kapsamda olduğu iddiası
// yanlış). Bu fixture manifest satırı ↔ disk ↔ log üçlüsünün koptuğu HER durumda kırmızı olur.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');

const repoRoot = require('../repo-root');

function ok(condition, name) {
  assert.equal(condition, true, name);
  console.log('PASS  ' + name);
}

function okEqual(actual, expected, name) {
  assert.deepEqual(actual, expected, name);
  console.log('PASS  ' + name);
}

function okRejects(fn, pattern, name) {
  assert.throws(fn, pattern, name);
  console.log('PASS  ' + name);
}

(async () => {
  const mod = await import(pathToFileURL(path.join(repoRoot, 'tools/kapi/gorsel-qa/gorsel-qa-manifest.mjs')).href);
  const {
    manifestRow, validateManifest, validateCoverage, validateCta, deriveFindings, validateCleanV2, validateCurrentV3, validateCurrentV4, validateCurrentV5, validateCurrentV6, validateCurrentV7, validateCurrentV8, validateCurrentV9, validateCurrentV10, validateCurrentV11, validateClipGeometry, validateSceneActions, validateSceneActionsV9,
    negativeSelfTest, glyphSeries, imageSize, sha256File, sha256Text, THEME_TOKENS,
    REQUIRED_ROW_FIELDS, MIN_IMAGE_BYTES, SCENE_KINDS, expectedSceneKind, expectedProfile,
    validateControlGeometry, unregisteredFields, MANIFEST_FIELD_CONTRACT,
  } = mod;

  console.log('== K3PD-29 görsel QA kanıt sözleşmesi ==\n');
  const shooterSource = fs.readFileSync(path.join(repoRoot, 'tools/kapi/gorsel-qa/shoot-modal.mjs'), 'utf8');
  ok(!/\bghToken\b/.test(shooterSource), 'görsel çekim aracı token alanını okumaz');
  ok(!/input\[type=password\]/.test(shooterSource), 'görsel çekim aracı parola alanını sorgulamaz');
  ok(!/querySelectorAll\('\*'\)/.test(shooterSource), 'genel tarama tüm form alanlarını dolaşmaz');
  ok(/function gotoReady\(page, url\)/.test(shooterSource) && /Date\.now\(\) \+ 30000/.test(shooterSource) && /uygulama başlangıcı 30 saniyede tamamlanmadı/.test(shooterSource), 'uygulama başlangıcı sabit gecikme yerine sınırlı fail-closed beklenir');

  // Sentetik ama GERÇEK bir PNG: imza + IHDR doğru, piksel boyutu okunabilir ve boyut
  // MIN_IMAGE_BYTES'i aşar. 0 baytlık dosyalar artık reddedildiği için (denetim bulgusu F3)
  // gerçek boyut/piksel üreten bir yardımcı gerekir.
  const fakePng = (w, h, fill = 0) => {
    const head = Buffer.alloc(33);
    head.write('\x89PNG\r\n\x1a\n', 0, 'latin1');
    head.writeUInt32BE(13, 8);
    head.write('IHDR', 12, 'latin1');
    head.writeUInt32BE(w, 16);
    head.writeUInt32BE(h, 20);
    head[24] = 8; head[25] = 2; head[26] = 0; head[27] = 0; head[28] = 0;
    // IEND son-izi ZORUNLU: doğrulayıcı kırpılmış PNG'yi bu izle yakalar (R5-F2).
    const iend = Buffer.alloc(12);
    iend.writeUInt32BE(0, 0);
    iend.write('IEND', 4, 'latin1');
    return Buffer.concat([head, Buffer.alloc(Math.max(MIN_IMAGE_BYTES, 8192), fill), iend]);
  };

  // ── 1. Şema: kartın saydığı alanların hepsi zorunlu ──────────────────────────────────────────
  okEqual([...REQUIRED_ROW_FIELDS].sort(), [
    'captureScale', 'issues', 'log', 'profile', 'scene', 'sceneKind', 'screenshot', 'sha256', 'theme', 'viewport',
  ], 'manifest satırı kartın saydığı 7 alanı + sahne kimliği, türü ve ÖLÇÜLEN yakalama ölçeğini taşır');

  const baseRow = () => ({
    profile: 'ana', theme: 'light', viewport: { width: 390, height: 844, safeAreaBottom: 0 },
    captureScale: 1,
    scene: 'v01-home', sceneKind: 'view', screenshot: 'v01-home.webp',
    log: ['v01-home: theme=light'],
    issues: [], sha256: 'a'.repeat(64),
    verifiedTheme: { dataTheme: 'light', surface: '#F7F5EE', ink: '#172B45' },
  });

  okRejects(() => manifestRow({ ...baseRow(), sha256: undefined }), /eksik alan: sha256/, 'sha256 olmadan satır üretilemez');
  okRejects(() => manifestRow({ ...baseRow(), log: [] }), /eksik alan: log/, 'log satırı olmadan satır üretilemez');
  okRejects(() => manifestRow({ ...baseRow(), theme: 'auto' }), /geçersiz tema/, 'geçersiz tema reddedilir');
  okRejects(() => manifestRow({ ...baseRow(), sha256: 'kisa' }), /geçersiz sha256/, 'bozuk hash biçimi reddedilir');
  okRejects(() => manifestRow({ ...baseRow(), verifiedTheme: null }), /tema ölçümü taşımıyor/, 'tema ÖLÇÜMÜ olmadan satır üretilemez (etiket yetmez)');

  // ── 2. Tema doğrulaması: etiket ile ölçülen data-theme çelişirse kırmızı ────────────────────
  const light = baseRow();
  const dark = { ...baseRow(), theme: 'dark', scene: 'v01-home', verifiedTheme: { dataTheme: 'dark', surface: '#151C28', ink: '#E8EBF2' }, screenshot: 'v01-home-dark.webp' };
  okEqual(Object.keys(THEME_TOKENS).sort(), ['dark', 'light'], 'iki tema için beklenen token çifti tanımlı');
  ok(THEME_TOKENS.light.surface !== THEME_TOKENS.dark.surface,
    'açık/koyu temaların yüzey renkleri farklı (etiket değil ölçüm ayırt eder)');
  const contradicted = validateManifest({ rows: [light, { ...dark, theme: 'light', verifiedTheme: { dataTheme: 'dark', surface: '#151C28', ink: '#E8EBF2' } }] }, { singleRun: true, issueFile: '' });
  ok(!contradicted.ok && contradicted.errors.some((error) => /root data-theme/.test(error)),
    'tema etiketi root data-theme ile çelişirse manifest reddedilir');

  // ── 3. Hash ↔ disk eşliği: gerçek dosyalarla ────────────────────────────────────────────────
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'k3pd29-manifest-'));
  try {
    // Dosya adı sahneden türetilir (14. denetim F14-2): `${scene}.png`.
    fs.writeFileSync(path.join(dir, 'v01-home.png'), fakePng(390, 844, 0x11));
    fs.writeFileSync(path.join(dir, 'v02-units.png'), fakePng(390, 844, 0x22));
    const rowA = manifestRow({ ...baseRow(), screenshot: 'v01-home.png', sha256: sha256File(path.join(dir, 'v01-home.png')), scene: 'v01-home' });
    const rowB = manifestRow({ ...baseRow(), screenshot: 'v02-units.png', sha256: sha256File(path.join(dir, 'v02-units.png')), scene: 'v02-units' });
    const good = validateManifest({ rows: [rowA, rowB] }, { root: dir, singleRun: true, issueFile: '' });
    ok(good.ok, 'disk ile birebir eşleşen manifest kabul edilir (bulgu yoksa boş issues.txt tutarlı)');
    okEqual(good.stats.rows, 2, 'satır sayısı raporlanır');

    // Bozulmuş tek bayt bile yakalanır.
    fs.writeFileSync(path.join(dir, 'v02-units.png'), fakePng(390, 844, 0x33));
    const tampered = validateManifest({ rows: [rowA, rowB] }, { root: dir, singleRun: true, issueFile: '' });
    ok(!tampered.ok && tampered.errors.some((error) => /sha256 uyuşmuyor/.test(error)),
      'diskteki bayt değişince hash uyuşmazlığı kırmızı olur');

    // Sayım: manifestte olmayan dosya da hatadır.
    fs.writeFileSync(path.join(dir, 'v03-c.png'), fakePng(390, 844, 0x44));
    const extra = validateManifest({ rows: [rowA, rowB] }, {
      root: dir, singleRun: true, issueFile: '',
      screenshots: ['v01-home.png', 'v02-units.png', 'v03-c.png'].map((name) => path.join(dir, name)),
    });
    ok(!extra.ok && extra.errors.some((error) => /manifest dışı screenshot/.test(error)),
      'manifestte satırı olmayan görüntü kırmızı olur (sayım eşliği)');

    // Satır var, dosya yok.
    const missing = validateManifest({
      rows: [rowA, manifestRow({ ...baseRow(), screenshot: 'v03-unit.png', sha256: 'b'.repeat(64), scene: 'v03-unit' })],
    }, { root: dir, singleRun: true, issueFile: '' });
    ok(!missing.ok && missing.errors.some((error) => /screenshot yok/.test(error)), 'eksik görüntü dosyası kırmızı olur');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }

  // ── 4. Tek koşum modu: 6 kombinasyon kapsamı ayrı doğrulanır ────────────────────────────────
  // Gerçek koşum TEK tema üretir (her koşum bir tema × bir viewport çeker).
  const single = validateManifest({ rows: [light] }, { singleRun: true, issueFile: '' });
  ok(single.ok, 'tek koşum (tek tema) singleRun modunda kabul edilir');
  const twoThemesInOneRun = validateManifest({ rows: [light, dark] }, { singleRun: true, issueFile: '' });
  ok(!twoThemesInOneRun.ok && twoThemesInOneRun.errors.some((error) => /tek koşum tek tema/.test(error)),
    'tek koşumda iki tema karışırsa reddedilir (koşum kimliği belirsizleşir)');

  const viewports = [
    { width: 320, height: 844, safeAreaBottom: 0 },
    { width: 390, height: 844, safeAreaBottom: 0 },
    { width: 460, height: 844, safeAreaBottom: 0 },
    { width: 390, height: 844, safeAreaBottom: 34 },
  ];

  // Glif satırını temsil eden sentetik satırlar.
  const glyphRow = (theme) => manifestRow({
    profile: 'glif', theme, viewport: { width: 460, height: 844, safeAreaBottom: 0 }, captureScale: 4,
    scene: 'g1-30-zor-glif', sceneKind: 'glyph', screenshot: `g1-${theme}.webp`,
    log: [`g1: ${theme}`], issues: [], sha256: 'c'.repeat(64),
    verifiedTheme: { dataTheme: theme, surface: THEME_TOKENS[theme].surface, ink: THEME_TOKENS[theme].ink },
  });

  const runs = [];
  for (const viewport of viewports) {
    for (const theme of ['light', 'dark']) {
      const rows = [];
      for (const name of ['v01-home', 'v02-units']) {
        rows.push(manifestRow({
          profile: 'ana', theme, viewport, captureScale: 1, scene: name, sceneKind: 'view',
          screenshot: `${name}-${theme}-${viewport.width}-${viewport.safeAreaBottom}.webp`,
          log: [`${name}: ${theme}`], issues: [], sha256: 'd'.repeat(64),
          verifiedTheme: { dataTheme: theme, surface: THEME_TOKENS[theme].surface, ink: THEME_TOKENS[theme].ink },
        }));
        rows.push(manifestRow({
          profile: 'onboarding', theme, viewport, captureScale: 1, scene: 'o1-ilk-acilis-1', sceneKind: 'onboarding',
          screenshot: `o1-${theme}-${viewport.width}-${viewport.safeAreaBottom}.webp`,
          log: [`o1: ${theme}`], issues: [], sha256: 'e'.repeat(64),
          verifiedTheme: { dataTheme: theme, surface: THEME_TOKENS[theme].surface, ink: THEME_TOKENS[theme].ink },
        }));
      }
      rows.push(glyphRow(theme));
      runs.push({ rows });
    }
  }
  const coverage = validateCoverage(runs);
  ok(coverage.ok, 'tam 3 viewport × 2 tema × (ana+onboarding+glif) kapsamı kabul edilir');
  okEqual(coverage.stats.runs, 8, 'koşum sayısı raporlanır');
  okEqual(coverage.stats.viewports.length, 4, 'viewport matrisi 4 satır (320/390/460 + sentetik inset)');
  // Kart 6 kombinasyon ister (3 genişlik × 2 tema); sentetik inset ek ölçümdür, kapsamı büyütmez.
  const sixOnly = validateCoverage(runs.filter((run) => run.rows[0].viewport.safeAreaBottom === 0));
  ok(sixOnly.ok, '6 kombinasyon (320/390/460 × açık/koyu) safe-area olmadan da yeterli');
  const missingWidth = validateCoverage(runs.filter((run) => run.rows[0].viewport.width !== 460));
  ok(!missingWidth.ok && missingWidth.errors.some((error) => /zorunlu genişlik eksik: 460px/.test(error)),
    'zorunlu genişlik eksikse kapsam kırmızı olur');

  // Eksik kombinasyon: koyu 320 koşumu listeden düşer.
  const missingCombo = validateCoverage(runs.filter((run) => !(run.rows[0].theme === 'dark' && run.rows[0].viewport.width === 320)));
  ok(!missingCombo.ok && missingCombo.errors.some((error) => /eksik kombinasyon/.test(error)), 'eksik viewport×tema kombinasyonu kırmızı olur');

  // Eksik onboarding profili.
  const missingOnboarding = validateCoverage(runs.map((run) => ({
    rows: run.rows.filter((row) => !(row.profile === 'onboarding' && row.theme === 'dark')),
  })));
  ok(!missingOnboarding.ok && missingOnboarding.errors.some((error) => /eksik profil/.test(error)), 'onboarding profili eksikse kapsam kırmızı olur');

  // Eksik glif teması.
  const missingGlyph = validateCoverage(runs.map((run) => ({ rows: run.rows.filter((row) => !(row.profile === 'glif' && row.theme === 'dark')) })));
  ok(!missingGlyph.ok && missingGlyph.errors.some((error) => /glif kanıtı eksik/.test(error)), 'glif kanıtı tek temada kalırsa kapsam kırmızı olur');

  // Ana sahne envanteri kombinasyonlar arasında değişirse (sahne sayısı sabitlenmemiş ama
  // envanter aynı olmalı) kırmızı.
  const drifted = runs.map((run, index) => (index === 0
    ? { rows: [...run.rows, manifestRow({
      profile: 'ana', theme: 'light', viewport: viewports[0], captureScale: 1, scene: 'v99-fazladan', sceneKind: 'view',
      screenshot: 'v99.webp', log: ['v99'], issues: [], sha256: 'f'.repeat(64),
      verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
    })] }
    : run));
  ok(!validateCoverage(drifted).ok, 'ana sahne envanteri kombinasyonlar arasında kayarsa kapsam kırmızı olur');

  // Tek koşumla kapsam iddia edilemez.
  ok(!validateCoverage([runs[0]]).ok, 'tek koşumla tam kapsam iddia edilemez');

  // ── 5. Negatif öz-test (modülün kendi matrisi) ──────────────────────────────────────────────
  const cases = negativeSelfTest();
  ok(cases.length >= 10, 'negatif öz-test en az 10 vaka içerir');
  // `expect:'accept'` → reddedilmemeli; `expect:'reject'` → reddedilmeli.
  const acceptCases = cases.filter((item) => item.expect === 'accept');
  const rejectCases = cases.filter((item) => item.expect === 'reject');
  ok(acceptCases.length >= 2 && acceptCases.every((item) => item.rejected === false),
    'negatif öz-testteki geçerli manifestler kabul edilir');
  ok(rejectCases.length >= 20 && rejectCases.every((item) => item.rejected === true),
    `negatif öz-testteki ${rejectCases.length} bozuk vaka reddedilir`);

  // ── 6. 30 zor glif dizisi: doğrulanmış içerikten, deterministik ────────────────────────────
  const glyph = glyphSeries();
  okEqual(glyph.series.length, 30, '30 zor glif dizisi seçilir');
  ok(glyph.series.every((item) => /[\u0600-\u06FF]/.test(item.ar)), 'her dizi Arapça kod noktası içerir');
  ok(glyph.series.every((item) => Array.from(item.ar).length <= 20), 'her dizi tek kırpımda okunabilir uzunlukta (≤20 karakter)');
  ok(glyph.series.every((item) => typeof item.source === 'string' && item.source.length > 0), 'her dizinin kaynağı kayıtlı (elle yazılmadı)');
  ok(glyph.series.every((item) => /^Quran(LexiconV1|ShortSurahsV1)\./.test(item.source)), 'kaynak doğrulanmış içerik modüllerine işaret eder');
  ok(glyph.series.every((item) => item.sha256 === sha256Text(item.ar)), 'her dizinin hash\'i metniyle birebir eşleşir');
  okEqual(new Set(glyph.series.map((item) => item.ar)).size, 30, '30 dizi birbirinden farklı');
  ok(glyph.series.some((item) => item.marks >= 3), 'diziler gerçekten "zor" glif içerir (işaret yoğunluğu)');
  okEqual(glyphSeries().series.map((item) => item.ar), glyph.series.map((item) => item.ar), 'seçim deterministik (aynı girdi → aynı 30 dizi)');

  // ── 6b. THEME_TOKENS app/styles.css ile pinli mi? (denetim bulgusu 5) ──────────────────────
  // Araçtaki sabit çift, gerçek CSS tokenlarıyla eşleşmezse "yanlış temayı doğru sandı" hatası
  // sessizce geri gelir. Bu kontrol sabiti canlı CSS'e bağlar.
  const css = fs.readFileSync(path.join(repoRoot, 'app/styles.css'), 'utf8');
  const darkBlock = (css.match(/#root\[data-theme="dark"\]\{([\s\S]*?)\}/) || [])[1] || '';
  // Işık tokenları `#root{…}` bloğunda tanımlı (denetimde doğrulandı; `:root` değil).
  const lightBlock = (css.match(/(?:^|\n)\s*#root\{([\s\S]*?)\}/) || [])[1] || '';
  const cssToken = (block, name) => {
    const found = block.match(new RegExp('--' + name + ':\\s*([^;]+);'));
    return found ? found[1].trim() : null;
  };
  okEqual(cssToken(lightBlock, 'quran-surface'), THEME_TOKENS.light.surface, 'açık tema yüzey tokenı app/styles.css ile aynı');
  okEqual(cssToken(lightBlock, 'quran-ink'), THEME_TOKENS.light.ink, 'açık tema metin tokenı app/styles.css ile aynı');
  okEqual(cssToken(darkBlock, 'quran-surface'), THEME_TOKENS.dark.surface, 'koyu tema yüzey tokenı app/styles.css ile aynı');
  okEqual(cssToken(darkBlock, 'quran-ink'), THEME_TOKENS.dark.ink, 'koyu tema metin tokenı app/styles.css ile aynı');

  // ── 6c. Doğrulayıcı etiketle yetinmiyor: computed token çelişkisi kırmızı ─────────────────
  const surfaceMismatch = validateManifest({
    rows: [manifestRow({ ...baseRow(), verifiedTheme: { dataTheme: 'light', surface: '#151C28', ink: '#E8EBF2' } })],
  }, { singleRun: true, issueFile: '' });
  ok(!surfaceMismatch.ok && surfaceMismatch.errors.some((error) => /quran-surface/.test(error)),
    'etiket light ama computed yüzey koyu ise manifest reddedilir');
  const inkMismatch = validateManifest({
    rows: [manifestRow({ ...baseRow(), verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: '#E8EBF2' } })],
  }, { singleRun: true, issueFile: '' });
  ok(!inkMismatch.ok && inkMismatch.errors.some((error) => /quran-ink/.test(error)),
    'etiket light ama computed metin rengi koyu ise manifest reddedilir');
  const noTokens = validateManifest({
    rows: [manifestRow({ ...baseRow(), verifiedTheme: { dataTheme: 'light' } })],
  }, { singleRun: true, issueFile: '' });
  ok(!noTokens.ok && noTokens.errors.some((error) => /ölçülmemiş/.test(error)),
    'computed token ölçülmemişse manifest reddedilir');

  // ── 6d. log.txt / issues.txt çapraz kontrolü ──────────────────────────────────────────────
  const logDir = fs.mkdtempSync(path.join(os.tmpdir(), 'k3pd29-log-'));
  try {
    fs.writeFileSync(path.join(logDir, 'v01-home.png'), fakePng(390, 844, 0x55));
    const row = manifestRow({
      ...baseRow(), screenshot: 'v01-home.png', sha256: sha256File(path.join(logDir, 'v01-home.png')),
      verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
      log: ['v01-home: theme=light surface=#F7F5EE vw=390 vh=844 inset=0 hidden=false hiddenPx=0 collisions=0 collisionPx=0 overflowX=false hard=yok | özet'],
    });
    const goodLog = validateManifest({ rows: [row] }, {
      root: logDir, singleRun: true, issueFile: '',
      logLines: ['origin: http://127.0.0.1:9000 token:false', row.log[0]],
    });
    ok(goodLog.ok, 'log.txt sahne satırı manifestle eşleşince kabul edilir');

    const missingLogLine = validateManifest({ rows: [row] }, { root: logDir, singleRun: true, logLines: ['origin: x'], issueFile: '' });
    ok(!missingLogLine.ok && missingLogLine.errors.some((error) => /log eşleşmiyor|log satırı log.txt/.test(error)),
      'log.txt satırı eksikse manifest reddedilir');

    const extraLogLine = validateManifest({ rows: [row] }, {
      root: logDir, singleRun: true, issueFile: '',
      logLines: [row.log[0], 'v02-units: theme=light surface=#F7F5EE vw=390 vh=844 inset=0 hidden=false hiddenPx=0 collisions=0 collisionPx=0 overflowX=false hard=yok | x'],
    });
    ok(!extraLogLine.ok, 'log.txt manifestte olmayan sahne satırı taşırsa reddedilir');
  } finally {
    fs.rmSync(logDir, { recursive: true, force: true });
  }

  // ── 6e. issues.txt iki yönlü eşleşme ──────────────────────────────────────────────────────
  const issDir = fs.mkdtempSync(path.join(os.tmpdir(), 'k3pd29-iss-'));
  try {
    fs.writeFileSync(path.join(issDir, 'v01-home.png'), fakePng(390, 844, 0x66));
    const row = manifestRow({
      ...baseRow(), screenshot: 'v01-home.png', sha256: sha256File(path.join(issDir, 'v01-home.png')),
      verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
      log: ['v01-home: theme=light surface=#F7F5EE vw=390 vh=844 inset=0 hidden=false hiddenPx=0 collisions=0 collisionPx=0 overflowX=false hard=yok | x'],
      issues: ['KAYDIRMALI-ALAN(bilgi) | div.kao-surah-picker | sûre | sw=1519 cw=358'],
    });
    const expectedLine = 'v01-home @390px: KAYDIRMALI-ALAN(bilgi) | div.kao-surah-picker | sûre | sw=1519 cw=358';
    const base = { root: issDir, singleRun: true, logLines: [row.log[0]] };

    ok(validateManifest({ rows: [row] }, { ...base, issueFile: expectedLine }).ok,
      'issues.txt satırı manifestle birebir eşleşince kabul edilir');
    const missing = validateManifest({ rows: [row] }, { ...base, issueFile: 'baska-bir-sey' });
    ok(!missing.ok && missing.errors.some((error) => /issues\.txt'te eksik satır/.test(error)),
      'issues.txt satırı eksikse reddedilir');
    const extra = validateManifest({ rows: [row] }, { ...base, issueFile: `${expectedLine}\nv02-units @390px: fazladan-bulgu` });
    ok(!extra.ok && extra.errors.some((error) => /fazla \(manifest dışı\) satır/.test(error)),
      'issues.txt manifestte olmayan satır taşırsa reddedilir');
    // issues.txt hiç verilmezse denetim sessizce atlanmamalı (fail-open kapalı).
    const noIssuesFile = validateManifest({ rows: [row] }, base);
    ok(!noIssuesFile.ok && noIssuesFile.errors.some((error) => /issues\.txt yok/.test(error)),
      'issues.txt yoksa doğrulama reddedilir (denetim atlanmaz)');
  } finally {
    fs.rmSync(issDir, { recursive: true, force: true });
  }

  // ── 6f. --glif-karsilastir: iki kez çekim reddedilir, canlı içerikten türetme zorunlu ─────
  const cm = await import(pathToFileURL(path.join(repoRoot, 'tools/kapi/gorsel-qa/gorsel-qa-manifest.mjs')).href);
  ok(typeof cm.glyphSeries === 'function', 'glif dizisi canlı içerikten türetilebiliyor (karşılaştırma bunu kullanır)');
  const canonicalAr = cm.glyphSeries().series.map((item) => item.ar).join('|');
  ok(canonicalAr.length > 200, 'türetilen 30 dizinin birleşimi boş değil');
  // İki manifest aynı yanlış diziye elle çevrilirse kaynak yeniden türetme bunu yakalar.
  const badSeries = cm.glyphSeries().series.map((item, index) => ({ ...item, ar: index === 0 ? 'XXX' : item.ar }));
  ok(badSeries.map((item) => item.ar).join('|') !== canonicalAr, 'elle bozulmuş dizi kümesi kanonik kümeden farklı (denetim mümkün)');

  // ── 6g. --dogrula çoklu dizin: fazladan arg sessizce yutulmaz ─────────────────────────────
  const src = fs.readFileSync(path.join(repoRoot, 'tools/kapi/gorsel-qa/gorsel-qa-manifest.mjs'), 'utf8');
  ok(/const dirs = args\.slice\(verifyIndex \+ 1\)/.test(src), '--dogrula verilen TÜM dizinleri toplar');
  ok(/for \(const dir of dirs\)/.test(src), '--dogrula her dizini tek tek doğrular');

  // ── 6h. Boş/bozuk görüntü reddi (F3) ─────────────────────────────────────────────────────
  const zeroDir = fs.mkdtempSync(path.join(os.tmpdir(), 'k3pd29-zero-'));
  try {
    fs.writeFileSync(path.join(zeroDir, 'empty.png'), Buffer.alloc(0));
    const emptySha = sha256File(path.join(zeroDir, 'empty.png'));
    const zeroRow = manifestRow({
      ...baseRow(), screenshot: 'empty.png', sha256: emptySha,
      verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
    });
    const zeroResult = validateManifest({ rows: [zeroRow] }, { root: zeroDir, singleRun: true, issueFile: '' });
    ok(!zeroResult.ok && zeroResult.errors.some((error) => /görüntü okunamadı|çok küçük/.test(error)),
      '0 baytlık görüntü hash eşliğine rağmen reddedilir');
    // Gerçek PNG ama yanlış GENİŞLİK: captureScale iddiası yanlışsa yakalanır (F5).
    fs.writeFileSync(path.join(zeroDir, 'wrong.png'), fakePng(195, 422));
    const wrongRow = manifestRow({
      ...baseRow(), screenshot: 'wrong.png', sha256: sha256File(path.join(zeroDir, 'wrong.png')), captureScale: 1,
      verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
    });
    const wrongResult = validateManifest({ rows: [wrongRow] }, { root: zeroDir, singleRun: true, issueFile: '' });
    ok(!wrongResult.ok && wrongResult.errors.some((error) => /görüntü genişliği/.test(error)),
      'görüntünün piksel genişliği captureScale ile uyuşmazsa reddedilir');
  } finally {
    fs.rmSync(zeroDir, { recursive: true, force: true });
  }

  // ── 6i. CTA sözleşmesi satırlardan doğrulanır (F2) ────────────────────────────────────────
  const ctaRow = (over = {}) => manifestRow({
    ...baseRow(), scene: 'l01-goal', sceneKind: 'lesson',
    verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
    // Geometri zorunlu: `visible` bundan yeniden türetilir (F16-1), ≥44 px her iki boyutta (F16-2).
    cta: { present: true, selector: '.x', x: 20, y: 100, width: 350, height: 50, dialogBottom: 844, dialogRight: 390, visible: true, focusReachable: true, hiddenBy: false, overlapsControl: [], overlapCovered: false, overlapsContent: [], scroll: { scrollTop: 0, scrollHeight: 844, clientHeight: 844, localScroll: false }, ...over },
  });
  // Zorunlu üç aşama temsil edilmeli (lesson/practice/feedback), aksi hâlde doğrulayıcı
  // "zorunlu sahne türü eksik" der (R5-F1).
  const mkCta = (sceneKind, scene, over = {}) => manifestRow({
    ...baseRow(), scene, sceneKind,
    verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
    // Geometri zorunlu: `visible` bundan yeniden türetilir (F16-1), ≥44 px her iki boyutta (F16-2).
    cta: { present: true, selector: '.x', x: 20, y: 100, width: 350, height: 50, dialogBottom: 844, dialogRight: 390, visible: true, focusReachable: true, hiddenBy: false, overlapsControl: [], overlapCovered: false, overlapsContent: [], scroll: { scrollTop: 0, scrollHeight: 844, clientHeight: 844, localScroll: false }, ...over },
  });
  const ctaBase = {
    rows: [ctaRow(), mkCta('practice', 'l02-gorev-word'), mkCta('feedback', 'l02-panel-dogru')],
    ctaReport: [
      { scene: 'l01-goal', stage: 'goal', samples: 2, layoutYs: [100, 100], maxDelta: 0 },
      { scene: 'l02-gorev-word', stage: 'practice', samples: 2, layoutYs: [100, 100], maxDelta: 0 },
      { scene: 'l02-panel-dogru', stage: 'feedback', samples: 2, layoutYs: [100, 100], maxDelta: 0 },
    ],
    productionFindings: [],
  };
  ok(validateCta(ctaBase).ok, 'geçerli CTA ölçümü kabul edilir');
  const contentRow = ctaRow({ overlapCovered: true, overlapsContent: [{ tag: 'P', cls: 'hint', y: 125, h: 20, pos: 'static', z: 'auto', overlapPx: 20, txt: 'örnek' }] });
  const contentManifest = { ...ctaBase, schemaVersion: 2, rows: [contentRow, ...ctaBase.rows.slice(1)] };
  okEqual(deriveFindings([contentRow], true).map((item) => item.kind), ['cta_content_overlap'], 'sürüm 2 görünür içerik örtüşmesini üretim bulgusu olarak türetir');
  ok(!validateCta(contentManifest).ok, 'sürüm 2 örtüşme bulgusu gizlenirse reddedilir');
  const missingCoveredRow = structuredClone(contentRow);
  delete missingCoveredRow.cta.overlapCovered;
  okEqual(deriveFindings([missingCoveredRow], true).map((item) => item.kind), ['cta_content_overlap'], 'örtüşme bayrağı silinse de ham içerikten türetilir');
  ok(!validateCta({ ...contentManifest, rows: [missingCoveredRow, ...ctaBase.rows.slice(1)] }).ok, 'sürüm 2 örtüşme bayrağının silinmesi reddedilir');
  const missingContentRow = structuredClone(contentRow);
  delete missingContentRow.cta.overlapsContent;
  missingContentRow.cta.overlapCovered = false;
  ok(!validateCta({ ...contentManifest, rows: [missingContentRow, ...ctaBase.rows.slice(1)] }).ok, 'sürüm 2 örtüşme listesinin silinmesi reddedilir');
  ok(validateCta({ ...contentManifest, productionFindings: deriveFindings([contentRow], true) }).ok, 'ölçülen içerik örtüşmesi beyan edildiğinde doğrulanır');
  okEqual(deriveFindings([contentRow]).length, 0, 'tarihi sürüm 1 sınıflaması korunur');
  ok(!validateCleanV2({ ...ctaBase, schemaVersion: 1 }).ok, 'temiz v2 kontrolü tarihsel sürümü reddeder');
  ok(!validateCleanV2({ ...ctaBase }).ok, 'temiz v2 kontrolü eksik sürümü reddeder');
  ok(!validateCleanV2(contentManifest).ok, 'temiz v2 kontrolü beyan silinse bile ham içerik örtüşmesini reddeder');
  ok(validateCleanV2({ ...ctaBase, schemaVersion: 2 }).ok, 'bulgusuz sürüm 2 temiz v2 ön koşulunu karşılar');
  const indexSource = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
  const sourceNames = [...new Set(['index.html', 'app/kao.css', 'app/core/quranLearn.js', 'app/core/quranLearnViews.js', 'app/styles.css', 'assets/kao/font/ScheherazadeNew-Regular.k3p.woff2', ...[...indexSource.matchAll(/<script\b[^>]*\bsrc="([^"?#]+)[^"]*"/gi)].map((match) => match[1])])];
  const sourceAssets = sourceNames.map((name) => ({ path: name, sha256: sha256File(path.join(repoRoot, name)) }));
  const v3 = { ...ctaBase, schemaVersion: 3, sourceAssets };
  ok(validateCurrentV3(v3).ok, 'v3 gerçek kaynak hashleri güncel kabul filtresinden geçer');
  ok(!validateCurrentV3({ ...v3, sourceAssets: sourceAssets.slice(1) }).ok, 'v3 eksik zorunlu kaynağı reddeder');
  ok(!validateCurrentV3({ ...v3, sourceAssets: [{ ...sourceAssets[0], sha256: '0'.repeat(64) }, ...sourceAssets.slice(1)] }).ok, 'v3 değiştirilmiş kaynak hashini reddeder');
  ok(!validateCurrentV3({ ...v3, sourceAssets: [...sourceAssets, sourceAssets[0]] }).ok, 'v3 yinelenen kaynak yolunu reddeder');
  ok(!validateCurrentV3({ ...v3, sourceAssets: [{ path: '../outside', sha256: '0'.repeat(64) }, ...sourceAssets] }).ok, 'v3 repo dışı kaynak yolunu reddeder');
  const v4 = { ...v3, schemaVersion: 4, rows: v3.rows.map((row) => ({ ...row, log: [`${row.scene}: theme=light fontReady=true | test`] })) };
  ok(validateCurrentV4(v4).ok, 'v4 kaynak hashleri kabul filtresinden geçer');
  ok(!validateCurrentV4(v3).ok, 'v4 filtresi eski sürümü reddeder');
  const absentFont = structuredClone(v4); absentFont.rows[0].log[0] = absentFont.rows[0].log[0].replace('fontReady=true', 'fontReady=false');
  ok(validateManifest(absentFont).errors.some((error) => /font yükleme tanığı/.test(error)), 'v4 başarısız sahne fontunu reddeder');
  const missingFont = structuredClone(v4); missingFont.rows[0].log[0] = missingFont.rows[0].log[0].replace('fontReady=true', '');
  ok(validateManifest(missingFont).errors.some((error) => /font yükleme tanığı/.test(error)), 'v4 eksik sahne fontunu reddeder');
  ok(validateCurrentV5({ ...v4, schemaVersion: 5 }).ok, 'v5 kaynak ve font ön koşulları geçer');
  ok(!validateCurrentV5(v4).ok, 'v5 filtresi eski sürümü reddeder');
  const viewportV5 = structuredClone(ctaBase); viewportV5.schemaVersion = 5;
  viewportV5.rows.forEach((row) => { row.cta.scrollTop = 0; });
  viewportV5.ctaReport.forEach((item) => { item.viewportYs = [100, 100]; item.scrollTops = [0, 0]; item.keyboard = { leftTarget: true, focused: true, visible: true }; });
  ok(validateCta(viewportV5).ok, 'v5 iki ekran koordinatını ve scroll ölçüsünü kabul eder');
  const viewportMissing = structuredClone(viewportV5); delete viewportMissing.ctaReport[0].viewportYs;
  ok(!validateCta(viewportMissing).ok, 'v5 eksik ekran koordinatını reddeder');
  const viewportDrift = structuredClone(viewportV5); viewportDrift.ctaReport[0].viewportYs[1] = 130;
  ok(!validateCta(viewportDrift).ok, 'v5 yerleşim sabitken ekrandaki 30px kaymayı reddeder');
  const keyboardLost = structuredClone(viewportV5); keyboardLost.ctaReport[0].keyboard.focused = false;
  ok(!validateCta(keyboardLost).ok, 'v5 gerçek Tab odağı başarısızsa reddeder');
  const keyboardDidNotLeave = structuredClone(viewportV5); keyboardDidNotLeave.ctaReport[0].keyboard.leftTarget = false;
  ok(!validateCta(keyboardDidNotLeave).ok, 'v5 Shift+Tab hedefi terk etmezse reddeder');
  const wrongScroll = structuredClone(viewportV5); wrongScroll.ctaReport[0].scrollTops[1] = 10;
  ok(!validateCta(wrongScroll).ok, 'v5 ekran y, scroll ve yerleşim ilişkisi bozuksa reddeder');
  const repeatMissing = validateManifest(viewportV5, { singleRun: true, logLines: ['schemaVersion:5'] });
  ok(repeatMissing.errors.some((error) => /ikinci CTA viewport log tanığı/.test(error)), 'v5 ikinci ekran ölçümü log tanığı olmadan reddedilir');
  ok(validateCurrentV6({ ...v4, schemaVersion: 6 }).ok, 'v6 kaynak ve font ön koşulları geçer');
  const viewportV6 = structuredClone(viewportV5); viewportV6.schemaVersion = 6;
  viewportV6.ctaReport.forEach((item) => {
    const row = viewportV6.rows.find((r) => r.scene === item.scene);
    item.repeatJson = JSON.stringify({ ...row.cta, layoutY: 100 });
    item.keyboardFirst = { leftTarget: true, focused: true, visible: true };
  });
  ok(validateCta(viewportV6).ok, 'v6 iki tam geometri ve iki klavye denemesini kabul eder');
  const missingSecond = structuredClone(viewportV6); delete missingSecond.ctaReport[0].repeatJson;
  ok(!validateCta(missingSecond).ok, 'v6 ikinci geometri olmadan reddeder');
  const nullSecond = structuredClone(viewportV6); nullSecond.ctaReport[0].repeatJson = 'null';
  ok(!validateCta(nullSecond).ok, 'v6 null ikinci geometriyi reddeder');
  const hiddenSecond = structuredClone(viewportV6); const repeat = JSON.parse(hiddenSecond.ctaReport[0].repeatJson); repeat.hiddenBy = true; hiddenSecond.ctaReport[0].repeatJson = JSON.stringify(repeat);
  ok(!validateCta(hiddenSecond).ok, 'v6 ikinci render örtülmüşse reddeder');
  const noFirstTab = structuredClone(viewportV6); noFirstTab.ctaReport[0].keyboardFirst.leftTarget = false;
  ok(!validateCta(noFirstTab).ok, 'v6 ilk render Tab denemesi başarısızsa reddeder');
  ok(validateCurrentV7({ ...v4, schemaVersion: 7 }).ok, 'v7 kaynak ve font ön koşulları geçer');
  const clippedTest = { x: 20, y: 100, width: 100, height: 50, clipJson: JSON.stringify([{ left: 0, top: 0, right: 200, bottom: 200, clipX: true, clipY: true }]) };
  ok(validateClipGeometry(clippedTest), 'v7 hedef kırpıcı ata içinde kabul edilir');
  ok(!validateClipGeometry({ ...clippedTest, y: 180 }), 'v7 hedefin alt kenar kırpılması reddedilir');
  ok(!validateClipGeometry({ ...clippedTest, clipJson: '[]' }), 'v7 kırpıcı ata ölçümü silinirse reddedilir');
  ok(validateCurrentV8({ ...v4, schemaVersion: 8 }).ok, 'v8 kaynak ve font ön koşulları geçer');
  const sceneAction = JSON.stringify({ scope: 'dialog', actions: [{ index: 0, tag: 'BUTTON', cls: 'primary', x: 1, y: 2, width: 80, height: 50, rendered: true, visible: true, fullyVisible: true, covered: false, disabled: false, contentOverlaps: [] }] });
  ok(validateSceneActions(sceneAction), 'v8 sahne kontrol geometrisini kabul eder');
  ok(validateSceneActions(JSON.stringify({ scope: 'glyph', actions: [] })), 'v8 kontrolsüz glif yüzeyini açıkça kaydeder');
  ok(!validateSceneActions('{'), 'v8 bozuk sahne geometrisini reddeder');
  ok(!validateSceneActions(sceneAction.replace('"visible":true', '"visible":false')), 'v8 görünürlük çelişkisini reddeder');
  const missingActions = validateManifest({ ...v4, schemaVersion: 8 }, { singleRun: true });
  ok(missingActions.errors.some((error) => /sahne eylem geometrisi/.test(error)), 'v8 sahne ölçümü olmayan manifesti reddeder');
  ok(validateCurrentV9({ ...v4, schemaVersion: 9 }).ok, 'v9 kaynak ve font ön koşulları geçer');
  ok(validateCurrentV10({ ...v4, schemaVersion: 10 }).ok, 'v10 kaynak ve font ön koşulları geçer');
  ok(validateCurrentV11({ ...v4, schemaVersion: 11 }).ok, 'v11 kaynak ve font ön koşulları geçer');
  const actionV9 = JSON.parse(sceneAction); actionV9.viewport = { width: 390, height: 844 };
  Object.assign(actionV9.actions[0], { clipLeft: 1, clipTop: 2, clipRight: 81, clipBottom: 52, hits: [true,true,true,true,true] });
  const actionRow = { profile: 'ana', viewport: { width: 390, height: 844 } };
  ok(validateSceneActionsV9(JSON.stringify(actionV9), actionRow), 'v9 sahne kutu ve hit geometrisi tutarlıysa kabul edilir');
  const emptyDialog = structuredClone(actionV9); emptyDialog.actions = [];
  ok(!validateSceneActionsV9(JSON.stringify(emptyDialog), actionRow), 'v9 boş diyalog envanterini reddeder');
  const invisibleOnly = structuredClone(actionV9); Object.assign(invisibleOnly.actions[0], { rendered:false, visible:false, fullyVisible:false, covered:false, hits:[] });
  ok(!validateSceneActionsV9(JSON.stringify(invisibleOnly), actionRow), 'v9 yalnız görünmez kontrollü diyalog envanterini reddeder');
  const offscreen = structuredClone(actionV9); offscreen.actions[0].x = -10000;
  ok(!validateSceneActionsV9(JSON.stringify(offscreen), actionRow), 'v9 ekran dışı kontrolün görünürlük çelişkisini reddeder');
  const falseCover = structuredClone(actionV9); falseCover.actions[0].covered = true;
  ok(!validateSceneActionsV9(JSON.stringify(falseCover), actionRow), 'v9 örtülme beyanını nokta ölçümleriyle eşler');
  const falseOverlap = structuredClone(actionV9); falseOverlap.actions[0].contentOverlaps = [{ tag:'P', x:300, y:300, width:2, height:2, overlapPx:999 }];
  ok(!validateSceneActionsV9(JSON.stringify(falseOverlap), actionRow), 'v9 imkânsız içerik örtüşmesini reddeder');
  const missingSourceLog = validateManifest(v3, { singleRun: true, logLines: ['schemaVersion:3'] });
  ok(missingSourceLog.errors.some((error) => /kaynak varlıkları log özetiyle uyuşmuyor/.test(error)), 'v3 kaynak listesi log tanığı olmadan reddedilir');
  const downgrade = validateManifest({ schemaVersion: 1, rows: [contentRow] }, { singleRun: true, logLines: ['schemaVersion:2'] });
  ok(downgrade.errors.some((error) => /yeni sürüm log tanığıyla çelişiyor/.test(error)), 'sürüm 2 logu sürüm 1 manifestine indirgenemez');
  const missingVersion = validateManifest({ rows: [contentRow] }, { singleRun: true, logLines: ['schemaVersion:2'] });
  ok(missingVersion.errors.some((error) => /eksik sürüm yeni sürüm log tanığıyla çelişiyor/.test(error)), 'sürüm 2 loguyla manifest sürümü silinemez');
  ok(!validateCta({ ...ctaBase, rows: [ctaRow({ visible: false }), ...ctaBase.rows.slice(1)] }).ok, 'görünmez CTA reddedilir');
  ok(!validateCta({ ...ctaBase, rows: [ctaRow({ height: 12 }), ...ctaBase.rows.slice(1)] }).ok, '44px altı CTA hedefi reddedilir');
  ok(!validateCta({ ...ctaBase, rows: [ctaRow({ focusReachable: false }), ...ctaBase.rows.slice(1)] }).ok, 'odaklanamayan CTA reddedilir');
  ok(!validateCta({ ...ctaBase, ctaReport: [] }).ok, 'kararlılık kaydı olmayan CTA reddedilir');
  ok(!validateCta({ ...ctaBase, ctaReport: [
      { scene: 'l01-goal', samples: 2, layoutYs: [10, 40], maxDelta: 30 },
      ...ctaBase.ctaReport.slice(1),
    ] }).ok, 'beyan edilmemiş >8px CTA farkı reddedilir');
  ok(!validateCta({ ...ctaBase, productionFindings: [{ scene: 'l01-goal', kind: 'cta_hidden_by' }] }).ok,
    'ölçümle doğrulanmayan uydurma üretim bulgusu reddedilir');
  // F2 asıl iddiası: `productionFindings` boşaltılsa bile türetme yakalar.
  const hidden = ctaRow({ hiddenBy: true, coverStack: [{ tag: 'BUTTON', cls: 'x', y: 1, h: 44 }] });
  ok(!validateCta({ ...ctaBase, rows: [hidden, ...ctaBase.rows.slice(1)], productionFindings: [] }).ok,
    'CTA örtülmesi beyan silinse bile reddedilir (beyana güvenmez)');
  okEqual(deriveFindings([hidden]).length, 1, 'örtülme satırdan yeniden türetilir');

  // ── 6j. Ölçülen yakalama ölçeği: sabit sayı değil (F5) ───────────────────────────────────
  ok(typeof imageSize === 'function', 'görüntü başlığı okuyucusu dışa açık');
  const probeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'k3pd29-size-'));
  try {
    fs.writeFileSync(path.join(probeDir, 's.png'), fakePng(780, 1688));
    const got = imageSize(path.join(probeDir, 's.png'));
    ok(got.ok && got.width === 780 && got.height === 1688, 'PNG piksel boyutu başlıktan okunur (390×2 → 780)');
    okEqual(got.width / 390, 2, 'yakalama ölçeği görüntüden hesaplanır');
  } finally {
    fs.rmSync(probeDir, { recursive: true, force: true });
  }

  // ── 6k. Beşinci denetim: kapı sertleştirmeleri (R5-F1/F2/F3) ───────────────────────────────
  // (a) CTA nesnesi ZORUNLU aşamalarda `cta: null` = ölçüm kırılması (eskiden sessizce atlanıyordu).
  const lessonRow = (over = {}) => manifestRow({
    ...baseRow(), scene: 'l01-goal', sceneKind: 'lesson',
    verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
    ...over,
  });
  const practiceRow = manifestRow({
    ...baseRow(), scene: 'l02-gorev-word', sceneKind: 'practice',
    verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
    cta: { present: true, selector: '.kao-choices button', x: 20, y: 100, width: 350, height: 56, dialogBottom: 844, dialogRight: 390, visible: true, focusReachable: true, hiddenBy: false, overlapsControl: [], overlapCovered: false, overlapsContent: [], scroll: { scrollTop: 0, scrollHeight: 844, clientHeight: 844, localScroll: false } },
  });
  const feedbackRow = manifestRow({
    ...baseRow(), scene: 'l02-panel-dogru', sceneKind: 'feedback',
    verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
    cta: { present: true, selector: '.kao-feedback-continue', x: 20, y: 100, width: 350, height: 44, dialogBottom: 844, dialogRight: 390, visible: true, focusReachable: true, hiddenBy: false, overlapsControl: [], overlapCovered: false, overlapsContent: [], scroll: { scrollTop: 0, scrollHeight: 844, clientHeight: 844, localScroll: false } },
  });
  const fullSet = {
    rows: [lessonRow({ cta: { present: true, selector: '.kao-lesson-next', x: 20, y: 100, width: 350, height: 50, dialogBottom: 844, dialogRight: 390, visible: true, focusReachable: true, hiddenBy: false, overlapsControl: [], overlapCovered: false, overlapsContent: [], scroll: { scrollTop: 0, scrollHeight: 844, clientHeight: 844, localScroll: false } } }), practiceRow, feedbackRow],
    ctaReport: [
      { scene: 'l01-goal', stage: 'goal', samples: 2, layoutYs: [100, 100], maxDelta: 0 },
      { scene: 'l02-gorev-word', stage: 'practice', samples: 2, layoutYs: [100, 100], maxDelta: 0 },
      { scene: 'l02-panel-dogru', stage: 'feedback', samples: 2, layoutYs: [100, 100], maxDelta: 0 },
    ],
    productionFindings: [],
  };
  ok(validateCta(fullSet).ok, 'tam CTA matrisi (lesson+practice+feedback) kabul edilir');
  ok(!validateCta({ ...fullSet, rows: [lessonRow({ cta: null }), practiceRow, feedbackRow] }).ok,
    'lesson satırında cta:null reddedilir (CTA ölçümü zorunlu)');
  ok(!validateCta({ ...fullSet, rows: [fullSet.rows[0], practiceRow] }).ok,
    'feedback sahneleri tamamen silinirse reddedilir (zorunlu sahne türü)');
  ok(!validateCta({ ...fullSet, rows: [practiceRow, feedbackRow] }).ok,
    'lesson sahneleri tamamen silinirse reddedilir');
  // (b) Beyan edilen SERT taşma manifestte varsa PASS verilemez.
  const sertRow = manifestRow({
    ...baseRow(), screenshot: 'x.png',
    verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
    issues: ['SERT:SAYFA-TAŞMASI | html | test | sw=999 cw=390'],
  });
  const sertResult = validateManifest({ rows: [sertRow] }, { singleRun: true, issueFile: 'v01-home @390px: SERT:SAYFA-TAŞMASI | html | test | sw=999 cw=390' });
  ok(!sertResult.ok && sertResult.errors.some((error) => /beyan edilen sert taşma/.test(error)),
    'manifestte beyan edilen SERT taşma reddedilir');
  // (c) Kırpılmış görüntü: RIFF uzunluğu dosya boyutuyla uyuşmuyorsa reddedilir.
  const truncDir = fs.mkdtempSync(path.join(os.tmpdir(), 'k3pd29-trunc-'));
  try {
    const full = fakePng(390, 844, 0x77);
    fs.writeFileSync(path.join(truncDir, 't.png'), full.subarray(0, 500));
    const truncated = imageSize(path.join(truncDir, 't.png'));
    ok(truncated.ok === false, 'kırpılmış PNG reddedilir (IEND yok)');
    // WebP: RIFF uzunluğu yanlış
    const webp = Buffer.alloc(64);
    webp.write('RIFF', 0, 'latin1');
    webp.writeUInt32LE(200, 4);       // 200 + 8 = 208 ≠ 64
    webp.write('WEBP', 8, 'latin1');
    webp.write('VP8X', 12, 'latin1');
    webp.writeUIntLE(389, 24, 3); webp.writeUIntLE(843, 27, 3);
    fs.writeFileSync(path.join(truncDir, 't.webp'), webp);
    const truncatedWebp = imageSize(path.join(truncDir, 't.webp'));
    ok(truncatedWebp.ok === false && /kırpılmış/.test(truncatedWebp.reason), 'kırpılmış WebP reddedilir (RIFF uzunluğu)');
  } finally {
    fs.rmSync(truncDir, { recursive: true, force: true });
  }

  // ── 6l. Sahne türü çapaları (N7-F1) — self-declared alan tek başına muafiyet açamaz ──────
  okEqual([...SCENE_KINDS].sort(), ['feedback','glyph','lesson','mastery','onboarding','practice','s0','view'],
    'sceneKind kapalı enum tanımlı (bilinmeyen değer kabul edilmez)');
  okEqual(expectedSceneKind('l02-gorev-word'), 'practice', 'sahne adı practice türünü zorunlu kılar');
  okEqual(expectedSceneKind('l03-panel-dogru'), 'feedback', 'sahne adı feedback türünü zorunlu kılar');
  okEqual(expectedSceneKind('l14-concept'), 'lesson', 'ders aşaması adı lesson türünü zorunlu kılar');
  okEqual(expectedSceneKind('o2-baslangic-sonrasi-ana'), 'view', 'başlangıç sonrası ana ekran onboarding sahnesi sayılmaz');
  okEqual(expectedSceneKind('v01-home'), 'view', 'görünüm adı view türünü zorunlu kılar');
  okEqual(expectedSceneKind('o3-kao-ilk-acilis-1'), 'onboarding', 'onboarding adı türünü zorunlu kılar');
  okEqual(expectedSceneKind('g1-30-zor-glif'), 'glyph', 'glif adı türünü zorunlu kılar');
  okEqual(expectedSceneKind('bilinmeyen-ad'), null, 'tanınmayan sahne adı tür çapası üretmez');

  const dir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'k3pd29-kind-'));
  try {
    fs.writeFileSync(path.join(dir2, 'v01-home.png'), fakePng(390, 844, 0x12));
    const mk = (scene, sceneKind) => manifestRow({
      ...baseRow(), scene, sceneKind, screenshot: 'v01-home.png',
      sha256: sha256File(path.join(dir2, 'v01-home.png')),
      verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
    });
    const okKind = validateManifest({ rows: [mk('v01-home', 'view')] }, { root: dir2, singleRun: true, issueFile: '' });
    ok(okKind.ok, 'sahne adıyla tutarlı sceneKind kabul edilir');
    const badEnum = validateManifest({ rows: [mk('v01-home', 'zzz-nonsense')] }, { root: dir2, singleRun: true, issueFile: '' });
    ok(!badEnum.ok && badEnum.errors.some((e) => /bilinmeyen sceneKind/.test(e)), 'enum dışı sceneKind reddedilir');
    const badPair = validateManifest({ rows: [mk('l02-gorev-word', 'view')] }, { root: dir2, singleRun: true, issueFile: '' });
    ok(!badPair.ok && badPair.errors.some((e) => /çelişiyor/.test(e)),
      'practice sahnesini view diye etiketlemek reddedilir (tür çapası)');
  } finally {
    fs.rmSync(dir2, { recursive: true, force: true });
  }
  // Envanter tabanı (N7-F2): log'da olup manifestte olmayan sahne reddedilir.
  const invDir = fs.mkdtempSync(path.join(os.tmpdir(), 'k3pd29-inv-'));
  try {
    fs.writeFileSync(path.join(invDir, 'v01-home.png'), fakePng(390, 844, 0x13));
    const invRow = manifestRow({
      ...baseRow(), screenshot: 'v01-home.png', sha256: sha256File(path.join(invDir, 'v01-home.png')),
      verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
    });
    const invBad = validateManifest({ rows: [invRow] }, {
      root: invDir, singleRun: true, issueFile: '',
      logLines: [invRow.log[0], 'v02-units: theme=light surface=#F7F5EE vw=390 inset=0 overflowX=false hard=yok | x'],
    });
    ok(!invBad.ok && invBad.errors.some((e) => /log.txt'te olup manifestte olmayan sahne/.test(e)),
      "log.txt'de olup manifestte olmayan sahne reddedilir (envanter kirpalamaz)");
  } finally {
    fs.rmSync(invDir, { recursive: true, force: true });
  }

  // ── 6m. Sekizinci denetim: maxDelta türetimi + profil çapası + kapsam tam doğrulaması ──────
  // (a) maxDelta HAM örneklerden türetilir (N8-F2): tek alanla 30→0 yapmak yakalanır.
  const driftRows = [
    ctaRow(),
    mkCta('practice', 'l02-gorev-word'),
    mkCta('feedback', 'l02-panel-dogru'),
  ];
  const forged = {
    rows: driftRows,
    ctaReport: [
      { scene: 'l01-goal', stage: 'goal', samples: 2, layoutYs: [100, 130], maxDelta: 0 },
      { scene: 'l02-gorev-word', stage: 'practice', samples: 2, layoutYs: [100, 100], maxDelta: 0 },
      { scene: 'l02-panel-dogru', stage: 'feedback', samples: 2, layoutYs: [100, 100], maxDelta: 0 },
    ],
    productionFindings: [],
  };
  const forgedResult = validateCta(forged);
  ok(!forgedResult.ok && forgedResult.errors.some((e) => /maxDelta beyanı/.test(e)),
    'maxDelta beyanı ham layoutYs ile çelişirse reddedilir (tek alanla 30→0 yapılamaz)');
  const samplesMismatch = {
    ...forged,
    ctaReport: [{ scene: 'l01-goal', stage: 'goal', samples: 3, layoutYs: [100, 100], maxDelta: 0 },
      ...forged.ctaReport.slice(1)],
  };
  ok(!validateCta(samplesMismatch).ok, 'samples ↔ layoutYs uzunluğu uyuşmazsa reddedilir');
  const noLayout = { ...forged, ctaReport: [{ scene: 'l01-goal', stage: 'goal', samples: 2, maxDelta: 0 }, ...forged.ctaReport.slice(1)] };
  ok(!validateCta(noLayout).ok, 'ham örnek (layoutYs) yoksa reddedilir');

  // (b) profile ad önekinden türetilir (N8-F3)
  okEqual(expectedProfile('v01-home'), 'ana', 'ana görünüm profili ana');
  okEqual(expectedProfile('l25-summary'), 'ana', 'ders satırı ana profilde');
  okEqual(expectedProfile('o1-ilk-acilis-1'), 'onboarding', 'onboarding adı onboarding profili');
  okEqual(expectedProfile('g1-30-zor-glif'), 'glif', 'glif adı glif profili');
  const profDir = fs.mkdtempSync(path.join(os.tmpdir(), 'k3pd29-prof-'));
  try {
    fs.writeFileSync(path.join(profDir, 'v01-home.png'), fakePng(390, 844, 0x21));
    const badProfile = validateManifest({
      rows: [manifestRow({
        ...baseRow(), scene: 'l25-summary', sceneKind: 'lesson', profile: 'glif', screenshot: 'v01-home.png',
        sha256: sha256File(path.join(profDir, 'v01-home.png')),
        verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
      })],
    }, { root: profDir, singleRun: true, issueFile: '' });
    ok(!badProfile.ok && badProfile.errors.some((e) => /profile .* çelişiyor/.test(e)),
      'profil ad önekiyle çelişirse reddedilir (matristen düşürülemez)');
  } finally {
    fs.rmSync(profDir, { recursive: true, force: true });
  }

  // (c) --kapsam tam doğrulama yapar (N8-F1): kaynak düzeyinde kanıt.
  const manifestSrc = fs.readFileSync(path.join(repoRoot, 'tools/kapi/gorsel-qa/gorsel-qa-manifest.mjs'), 'utf8');
  const kapsamBlock = manifestSrc.slice(manifestSrc.indexOf("args.indexOf('--kapsam')"), manifestSrc.indexOf("args.indexOf('--glif-karsilastir')"));
  ok(/validateManifest\(manifests\[index\]/.test(kapsamBlock),
    '--kapsam her dizin için validateManifest çağırır (yalnız envanter/CTA değil)');
  ok(/logLines/.test(kapsamBlock) && /issueFile/.test(kapsamBlock) && /screenshots/.test(kapsamBlock),
    '--kapsam log/issues/görüntü eşliğini de denetler');

  // ── 6n. Dokuzuncu denetim: captureScale + viewport çapaları (F9-1/F9-2) ──────────────────
  const floatNaN = () => Number.NaN;
  // (a) captureScale tam sayı ≥1 olmalı; keyfî float reddedilir.
  const scDir = fs.mkdtempSync(path.join(os.tmpdir(), 'k3pd29-scale-'));
  try {
    fs.writeFileSync(path.join(scDir, 'v01-home.png'), fakePng(780, 1688, 0x31));
    const mkScale = (captureScale) => manifestRow({
      ...baseRow(), screenshot: 'v01-home.png', captureScale,
      sha256: sha256File(path.join(scDir, 'v01-home.png')),
      verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
    });
    const okScale = validateManifest({ rows: [mkScale(2)] }, { root: scDir, singleRun: true, issueFile: '' });
    ok(okScale.ok, 'tam sayı captureScale (2) ve eşleşen piksel genişliği kabul edilir');
    const floatScale = validateManifest({ rows: [mkScale(1.21875)] }, { root: scDir, singleRun: true, issueFile: '' });
    ok(!floatScale.ok && floatScale.errors.some((e) => /captureScale tam sayı/.test(e)),
      'keyfî float captureScale reddedilir (390→320 hilesi)');
    okRejects(() => mkScale(0), /captureScale yok\/geçersiz/, 'captureScale 0 satır üretiminde reddedilir');
    okRejects(() => mkScale(floatNaN()), /captureScale/, 'sayısal olmayan captureScale reddedilir');
  } finally {
    fs.rmSync(scDir, { recursive: true, force: true });
  }
  // (b) viewport alt alanları validateManifest'te doğrulanır; log vw/vh/inset ile çapalanır.
  const vpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'k3pd29-vp-'));
  try {
    fs.writeFileSync(path.join(vpDir, 'v01-home.png'), fakePng(390, 844, 0x32));
    const logLine = 'v01-home: theme=light surface=#F7F5EE vw=390 vh=844 inset=0 hidden=false hiddenPx=0 collisions=0 collisionPx=0 overflowX=false hard=yok | x';
    const mkVp = (viewport) => manifestRow({
      ...baseRow(), screenshot: 'v01-home.png', viewport, log: [logLine],
      sha256: sha256File(path.join(vpDir, 'v01-home.png')),
      verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
    });
    // Log satırı manifest satırının kendi log metniyle AYNI olmalı (yinelenen sahne hatası olmasın).
    const rowVp = mkVp({ width: 390, height: 844, safeAreaBottom: 0 });
    okEqual(rowVp.log[0], logLine, 'test log satırı manifest satırıyla aynı');
    const goodVp = validateManifest({ rows: [rowVp] }, { root: vpDir, singleRun: true, issueFile: '', logLines: [logLine] });
    ok(goodVp.ok, 'log ile eşleşen viewport kabul edilir');
    const badHeight = validateManifest({ rows: [mkVp({ width: 390, height: 9999, safeAreaBottom: 0 })] }, {
      root: vpDir, singleRun: true, issueFile: '', logLines: [logLine],
    });
    ok(!badHeight.ok && badHeight.errors.some((e) => /viewport\.height .* vh=/.test(e)),
      'viewport.height log vh= ile çelişirse reddedilir');
    const badInset = validateManifest({ rows: [mkVp({ width: 390, height: 844, safeAreaBottom: 34 })] }, {
      root: vpDir, singleRun: true, issueFile: '', logLines: [logLine],
    });
    ok(!badInset.ok && badInset.errors.some((e) => /safeAreaBottom .* inset=/.test(e)),
      'viewport.safeAreaBottom log inset= ile çelişirse reddedilir');
    // Satır kurucusu eksik viewport'u zaten reddediyor; burada ASIL denetlenen validateManifest'in
    // kendi görmediği (elle kurulmuş) bir satırda da eksik genişliği yakalaması.
    okRejects(() => mkVp({ height: 844, safeAreaBottom: 0 }), /viewport alanları eksik/,
      'satır kurucusu eksik viewport.width ile satır üretmez');
    const missingWidth = validateManifest({ rows: [{ ...rowVp, viewport: { height: 844, safeAreaBottom: 0 } }] }, {
      root: vpDir, singleRun: true, issueFile: '', logLines: [logLine],
    });
    ok(!missingWidth.ok && missingWidth.errors.some((e) => /viewport\.width/.test(e)),
      'viewport.width eksikse reddedilir (genişlik denetimi sessizce kapanamaz)');
  } finally {
    fs.rmSync(vpDir, { recursive: true, force: true });
  }

  // ── 6o. Onuncu denetim (F10): tema, çakışma, font ve WebP bütünlüğü çapaları ───────────────
  {
    // (a) HAM GEOMETRİ: `overlapsControl` kaydının `overlapPx` değeri CTA'nın kendi
    //     `y`/`height` değerleriyle yeniden hesaplanır (F10-5). Önceden bulgu türetimi ile
    //     doğrulama AYNI alanı okuyordu; listeyi boşaltmak kapalı bir döngüydü.
    const geoRow = {
      scene: 'l25-summary', theme: 'light',
      cta: {
        present: true, y: 758, height: 50, x: 20, width: 350,
        overlapsControl: [{ tag: 'BUTTON', cls: 'kao-lesson-more', y: 764, h: 44, overlapPx: 44 }],
      },
    };
    okEqual(validateControlGeometry(geoRow).length, 0, 'ham geometriyle tutarlı çakışma kabul edilir');
    const badGeo = JSON.parse(JSON.stringify(geoRow));
    badGeo.cta.overlapsControl[0].overlapPx = 4;
    ok(validateControlGeometry(badGeo).some((e) => /ham kesişim/.test(e)),
      'beyan edilen overlapPx ham kesişimle çelişirse reddedilir');
    const noIntersect = JSON.parse(JSON.stringify(geoRow));
    noIntersect.cta.overlapsControl[0].y = 100;
    noIntersect.cta.overlapsControl[0].h = 44;
    noIntersect.cta.overlapsControl[0].overlapPx = 44;
    ok(validateControlGeometry(noIntersect).some((e) => /kesişmiyor/.test(e)),
      'CTA ile kesişmeyen çakışma kaydı reddedilir');
    const overHeight = JSON.parse(JSON.stringify(geoRow));
    overHeight.cta.overlapsControl[0].overlapPx = 999;
    ok(validateControlGeometry(overHeight).some((e) => /kendi yüksekliği/.test(e)),
      'overlapPx kendi yüksekliğinden büyükse reddedilir');

    // (b) WebP CHUNK YÜRÜYÜŞÜ (F10-6): yalnız RIFF uzunluk alanına bakmak yetmiyordu —
    //     dosyayı kırpıp RIFF uzunluğunu da yamamak denetimden geçiyordu.
    const wDir = fs.mkdtempSync(path.join(os.tmpdir(), 'k3pd29-wt-'));
    try {
      const mkWebp = (vp8Size, declaredTotal, tailPad = 0) => {
        const header = Buffer.alloc(20);
        header.write('RIFF', 0, 'latin1');
        header.writeUInt32LE(declaredTotal - 8, 4);
        header.write('WEBP', 8, 'latin1');
        header.write('VP8 ', 12, 'latin1');
        header.writeUInt32LE(vp8Size, 16);
        const body = Buffer.alloc(Math.min(vp8Size, 8192), 3);
        body[3] = 0x9d; body[4] = 0x01; body[5] = 0x2a;
        body.writeUInt16LE(460, 6); body.writeUInt16LE(844, 8);
        return Buffer.concat([header, body, Buffer.alloc(tailPad, 0)]);
      };
      const goodBuf = mkWebp(8192, 20 + 8192);
      fs.writeFileSync(path.join(wDir, 'good.webp'), goodBuf);
      ok(imageSize(path.join(wDir, 'good.webp')).ok === true, 'tutarlı WebP chunk yürüyüşü kabul edilir');

      // RIFF toplamı dosya boyuna EŞİT ama içteki VP8 chunk'ı dosyadan büyük → kırpılmış.
      const patchBuf = mkWebp(999999, 20 + 8192);
      fs.writeFileSync(path.join(wDir, 'patch.webp'), patchBuf);
      const patchInfo = imageSize(path.join(wDir, 'patch.webp'));
      ok(patchInfo.ok === false && /chunk/.test(patchInfo.reason),
        'RIFF uzunluğu yamalanmış kırpık WebP reddedilir (chunk yürüyüşü)');

      // Chunk'lar dosya sonunda bitmiyorsa (artık bayt) da bozuktur.
      const trailing = Buffer.concat([goodBuf, Buffer.alloc(16, 0)]);
      fs.writeFileSync(path.join(wDir, 'trail.webp'), trailing);
      ok(imageSize(path.join(wDir, 'trail.webp')).ok === false,
        'chunk yürüyüşü dosya sonunda bitmiyorsa reddedilir');
    } finally {
      fs.rmSync(wDir, { recursive: true, force: true });
    }

    // (c) KAYNAK SÖZLEŞMESİ: tema ve çakışma çapaları ile font kanıtı.
    const validator = fs.readFileSync(path.join(repoRoot, 'tools/kapi/gorsel-qa/gorsel-qa-manifest.mjs'), 'utf8');
    ok(/theme=\(\[a-z\]\+\)/.test(validator) || /theme=\(\[a-z\]\+\)/.test(validator) || /\btheme=\(\[a-z\]\+\)\b/.test(validator),
      'tema log.txt\'teki theme= değerinden çapalanıyor');
    ok(/collisions=/ .test(validator) && /collisionPx=/.test(validator),
      'çakışma sayısı log.txt\'teki collisions=/collisionPx= ile çapalanıyor');
    ok(/loadedFaces\(after\) === 0/.test(validator) || /loadedFaces\(after\)/.test(validator),
      'font yükleme kanıtı faces[].status üzerinden ölçülüyor (distinct tek başına yetmez)');
    ok(/fontRequests\(after\) === 0/.test(validator) || /fontRequests\(after\)/.test(validator),
      'font indirmesi woff2 istekleriyle ölçülüyor');
    const shooterSrc = fs.readFileSync(path.join(repoRoot, 'tools/kapi/gorsel-qa/shoot-modal.mjs'), 'utf8');
    ok(/collisions=\$\{collisions\.length\} collisionPx=\$\{maxOverlapPx\}/.test(shooterSrc),
      'çekim aracı her sahne log satırına collisions=/collisionPx= yazıyor');
    ok(/theme: theme\.dataTheme/.test(shooterSrc),
      'manifest tema etiketi İSTENEN değil ÖLÇÜLEN data-theme\'dir');
    ok(/scene: GLYPH_ONLY \? 'g0-30-zor-glif-referans' : 'g1-30-zor-glif'/.test(shooterSrc),
      'glyphEvidence kendi sahne kimliğini taşır (glif karşılaştırması log satırını bulabilir)');
    // ── 11. denetim F11: eksik token çapayı sessizce kapatamaz ────────────────────────────
    // Önceden sahne log haritasına yalnız `vw=` eşleşirse giriyordu; ` vw=390` silmek tema,
    // surface, viewport ve çakışma çapalarının HEPSİNİ devre dışı bırakıyordu.
    ok(/log\.txt satırı \$\{token\} taşımıyor/.test(validator),
      'eksik gösterge tokenı (vw=/vh=/inset=/theme=/surface=/hidden=) açık hata verir');
    ok(/if \(sceneName\) \{\s*\n\s*loggedVw\.set/.test(validator),
      'log haritasına sahne `vw=` eşleşmesinden BAĞIMSIZ kaydedilir');
    ok(/\\bhidden=\(true\|false\)\\b/.test(validator) && /\\bhiddenPx=\(\\d\+\)\\b/.test(validator),
      'örtülme (hidden=/hiddenPx=) log.txt\'ten çapalanıyor');
    ok(/\\bmetrics=\(\\d\+\)\\\/\(\\d\+\)\\b/.test(validator),
      'font metrikleri (metrics=) log.txt\'ten çapalanıyor');
    ok(/hiddenPx=\$\{hiddenPx\}/.test(shooterSrc) && /hidden=\$\{hiddenFlag\}/.test(shooterSrc),
      'çekim aracı her sahne log satırına hidden=/hiddenPx= yazıyor');
    ok(/shotsOnDisk\.length !== manifest\.length/.test(shooterSrc),
      'çekim aracı disk/manifest sayımını yazmadan önce fail-closed doğrular');
    // ── 12. denetim F12 ────────────────────────────────────────────────────────────────────
    // (a) Sert taşma kabulü artık yalnız `issues` beyanına dayanmıyor: log'daki `hard=`
    //     sert türlerin TAMAMINI taşır ve `SERT:` beyanıyla birebir eşleşir.
    ok(/\\bhard=\(/.test(validator) && /log\.txt'teki hard=/.test(validator),
      'SERT: beyanı log.txt hard= kümesiyle doğrulanıyor');
    ok(/\\boverflowX=\(true\|false\)\\b/.test(validator),
      'log.txt overflowX= alanı ayrıştırılıp hard= ile tutarlılığı denetleniyor');
    ok(/hard=\$\{hardKinds\.length \? hardKinds\.join\(','\) : 'yok'\}/.test(shooterSrc)
      && /hard=\$\{obHardKinds\.length \? obHardKinds\.join\(','\) : 'yok'\}/.test(shooterSrc),
      'çekim aracı ana ve onboarding log satırlarına hard= yazıyor');
    // (b) Kapsam envanteri artık `o*` ve `g*` sahnelerini DIŞLAMIYOR; tek koşumdan
    //     onboarding/glyph satırı silmek yakalanır.
    ok(/profil bazlı sahne envanteri kombinasyonlar arasında farklı/.test(validator),
      'profil bazlı sahne envanteri de kombinasyonlar arasında karşılaştırılıyor');
    ok(!/!scene\.startsWith\('o'\) && !scene\.startsWith\('g'\)/.test(validator),
      'kapsam envanteri o*/g* sahnelerini dışlamıyor');
    // ── 13. denetim F13 ────────────────────────────────────────────────────────────────────
    // (a) Glif satırı matrise girmez ama ENVANTERE girer; tek koşumdan silinmesi yakalanır.
    ok(/glif sahne envanteri koşumlar arasında farklı/.test(validator),
      'glif sahne envanteri koşumlar arasında karşılaştırılıyor');
    ok(/bir koşumda hiç glif satırı yok/.test(validator),
      'glif satırı hiç olmayan koşum reddedilir');
    // (b) glyphEvidence satırlara ve DİSKE bağlanır (yalnız --glif-karsilastir'da değil).
    ok(/glyphEvidence\.screenshot diskte yok/.test(validator)
      && /glyphEvidence\.screenshotSha256 satırdaki sha256 ile eşleşmiyor/.test(validator),
      'glyphEvidence validateManifest içinde satır ve diskle eşleştiriliyor');
    // (c) node=/text= ayrıştırılıp onboarding satırlarında zorunlu.
    // Kaynakta `\bnode=(` ardışık olduğu için `\b` eşleşmez; imleç `node=(` ile aranır.
    ok(/node=\(\[a-z\]\+\)/.test(validator) && /onboarding log satırı \$\{token\} taşımıyor/.test(validator),
      'onboarding yüzey tanığı (node=/text=) ayrıştırılıp zorunlu tutuluyor');
    // (d) hard= çok türlü satırlarda doğru ayrıştırılır (yazıcı ',' kullanır).
    ok(/split\(\/\[,\|\]\/\)/.test(validator),
      'hard= ayırıcısı , ve | için de doğru çalışıyor');
    // ── 14. denetim F14: sahne ↔ log ↔ screenshot ↔ glif kanıtı kimliği ───────────────────
    // `row.log` önceden yalnız "log.txt'te bir yerde var mı" diye denetleniyordu; başka bir
    // sahnenin satırı atanabiliyordu. Artık satırın sahne öneki `row.scene` olmalı.
    ok(/log satırı sahne adıyla çelişiyor/.test(validator)
      && /aynı log satırı birden çok manifest satırına atanmış/.test(validator),
      'satırın log metni kendi sahnesine bağlı (başka sahnenin satırı atanamaz)');
    // `screenshot`+`sha256` takası bir sahnenin tüm kanıtını taşıyordu; ad artık sahneden türer.
    ok(/screenshot adı sahneden türetilmemiş/.test(validator),
      'screenshot adı sahneden türetilmiş olmak zorunda (satır kanıtı takas edilemez)');
    ok(/glyphEvidence\.screenshot bir glif satırına bağlı değil/.test(validator),
      'glyphEvidence yalnız GLİF satırına bağlanabilir');
    // ── 15. denetim F15 ────────────────────────────────────────────────────────────────────
    // (a) `layoutYs` satırın kendi `cta.layoutY` ölçümüne bağlı; tek alanla kayma silinemez.
    ok(/CTA layoutYs\[0\]/.test(validator) && /cta\.layoutY/.test(validator),
      'CTA layoutYs[0] satırdaki cta.layoutY ile çapalanıyor');
    // (b) Glif satırı varsa `glyphEvidence` zorunlu (blok silinerek kanıt düşürülemez).
    ok(/glif satırı var ama glyphEvidence bloğu yok/.test(validator),
      'glif satırı varsa glyphEvidence zorunlu');
    // ── 16. denetim F16 ────────────────────────────────────────────────────────────────────
    // (a) Görünürlük geometriden YENİDEN türetilir; tek alanla (visible false->true) ekran
    //     dışındaki bir eylem yeşile çevrilemez.
    ok(/CTA visible beyanı .* ama geometri .* diyor/.test(validator),
      'CTA visible beyanı geometriden yeniden türetilip karşılaştırılıyor');
    // (b) ≥44 px kuralı HER İKİ boyutta geçerli.
    ok(/CTA hedefi genişliği .* < 44px/.test(validator),
      'CTA hedefi genişliği de 44px eşiğinden geçiyor');
    // (c) glif font bloğu --dogrula/--kapsam'da da log'a çapalı (yalnız --glif-karsilastir'da değil).
    ok(/glyphEvidence\.font bloğu yok/.test(validator)
      && /glyphEvidence\.font yüklü=/.test(validator),
      'glyphEvidence.font blok ve log çapası --dogrula içinde de denetleniyor');
    // ── 17. denetim F17 ────────────────────────────────────────────────────────────────────
    // (a) Hedef/fokus artık log'daki `ctaW=`/`ctaH=`/`focus=` ile çapalı.
    ok(/CTA height .* log\.txt'teki ctaH=/.test(validator)
      && /CTA focusReachable .* log\.txt'teki focus=/.test(validator),
      'CTA height/width/focusReachable log tokenlarıyla çapalı');
    // (b) `glyphEvidence.scene` eşleşen glif satırına bağlı; log araması başarısızsa sert hata.
    ok(/glyphEvidence\.scene .* eşleşen glif satırının scene/.test(validator)
      && /glyphEvidence için log\.txt satırı yok/.test(validator),
      'glyphEvidence.scene glif satırına bağlı, log araması başarısızsa hata');
    // (c) `visible` türetiminin girdileri de çapalı.
    ok(/CTA dialogBottom .* viewport\.height/.test(validator)
      && /CTA y\+scrollTop/.test(validator),
      'dialogBottom ve y+scrollTop bağı denetleniyor');
    // ── 18. denetim F18 ────────────────────────────────────────────────────────────────────
    // (a) YATAY eksen de (x/dialogRight) doğrulanır: `x = -1000` ile ekran dışına taşınan eylem
    //     artık "görünür" sayılamaz (dikey eksen çapalıydı, yatay eksen hiç okunmuyordu).
    ok(/CTA yatayda diyalog dışında/.test(validator) && /cta\.dialogRight/.test(validator),
      'CTA yatay geometrisi (x/dialogRight) doğrulanıyor');
    // (b) Yatay eksenin log tanığı var: tek alanla `cta.x` değiştirilemez.
    ok(/CTA x .* log\.txt'teki ctaX=/.test(validator)
      && /CTA dialogRight .* log\.txt'teki ctaR=/.test(validator),
      'CTA x/dialogRight log ctaX=/ctaR= tokenlarıyla çapalı');
    // (c) Davranışsal: sahte `cta.x` reddedilir, `dialogRight` taşması da reddedilir.
    ok(!validateCta({ ...ctaBase, rows: [ctaRow({ x: -1000 }), ...ctaBase.rows.slice(1)] }).ok,
      'yatayda ekran dışına taşınan CTA (x=-1000) reddedilir');
    ok(!validateCta({ ...ctaBase, rows: [ctaRow({ width: 900 }), ...ctaBase.rows.slice(1)] }).ok,
      'sağ kenarı diyalog dışına taşan CTA reddedilir');
    ok(!validateCta({ ...ctaBase, rows: [ctaRow({ dialogRight: undefined }), ...ctaBase.rows.slice(1)] }).ok,
      'yatay geometrisi eksik CTA reddedilir (iki eksen zorunlu)');
    // ── 20. denetim F20 ──────────────────────────────────────────────────────────────────
    // (a) Türev sözleşme alanları tek alanla çevrilemez: `overlapCovered` overlapsContent'ten,
    //     `scroll.localScroll` scrollHeight/clientHeight'tan yeniden türetilir.
    ok(!validateCta({ ...ctaBase, rows: [ctaRow({ overlapsContent: [], overlapCovered: true }), ...ctaBase.rows.slice(1)] }).ok,
      'overlapCovered overlapsContent ile çelişirse reddedilir');
    ok(!validateCta({ ...ctaBase, rows: [ctaRow({ scroll: { scrollTop: 0, scrollHeight: 900, clientHeight: 844, localScroll: false } }), ...ctaBase.rows.slice(1)] }).ok,
      'scroll.localScroll geometriyle çelişirse reddedilir');
    // (b) `selector` log'daki sel= ile çapalı; glif seri alanları içerikten yeniden türetilir.
    ok(/CTA selector log\.txt'teki sel=/.test(validator),
      'CTA selector log sel= ile çapalı');
    ok(/glyphEvidence\.series\[\$\{i\}\]\.sha256 kendi metninden yeniden türetilen/.test(validator),
      'glif seri sha256 kendi metninden yeniden türetilip karşılaştırılıyor');
    ok(/glyphEvidence\.imagePixels\.width .* diskteki/.test(validator),
      'glyphEvidence.imagePixels diskteki görüntüden yeniden ölçülüyor');
    ok(/verifiedTheme\.onb .* log\.txt'teki onb=/.test(validator),
      'onboarding verifiedTheme.onb log onb= ile çapalı');
    // ── 21. denetim F21 ──────────────────────────────────────────────────────────────────
    // (a) `productionFindings[].theme/.viewport` satırın kendi ölçümüne bağlı.
    ok(/üretim bulgusu \(\$\{item\.scene\}\): theme/.test(validator)
      && /üretim bulgusu \(\$\{item\.scene\}\): viewport\./.test(validator),
      'üretim bulgusu theme/viewport satırın ölçümüyle çapalı');
    // (b) `glyphEvidence.sheet.*` doğrulanıyor (rows ≠ dizi sayısı yakalanır).
    ok(/glyphEvidence\.sheet\.rows .* dizi sayısı/.test(validator)
      && /glyphEvidence\.sheet\.maxH .* log\.txt'teki h=/.test(validator),
      'glyphEvidence.sheet satır sayısı ve yüksekliği çapalı');
    // (c) `ser=` zorunlu VE kullanılıyor (silinirse kırmızı).
    ok(/glif log satırı ser= taşımıyor/.test(validator)
      && /glif seri özeti ser=/.test(validator),
      'glif seri özeti ser= zorunlu ve doğrulanıyor');
    // (d) Manifest üstbilgisi çapalı: origin / card / mode / captureScales / schema.
    ok(/manifest\.origin .* tek izinli origin/.test(validator)
      && /manifest\.card '\$\{manifest\.card\}' ≠ 'K3PD-29'/.test(validator)
      && /manifest\.mode .* geçersiz/.test(validator)
      && /manifest\.captureScales .* satırlardan ölçülen/.test(validator),
      'manifest üstbilgisi (origin/card/mode/captureScales) doğrulanıyor');
    // (e) Liste kayıtlarının TAMAMI özetle çapalı (tek kayıt bile değişemez).
    ok(/CTA overlapsContent özeti .* covH=/.test(validator)
      && /CTA coverStack özeti .* coverH=/.test(validator),
      'overlapsContent/coverStack liste özetleri log ile çapalı');
    // (f) Davranışsal: manifest.origin sahte olursa reddedilir.
    ok(!validateManifest({ ...ctaBase, origin: 'http://evil.com', rows: ctaBase.rows },
      { issueFile: '', singleRun: true }).ok,
      'manifest.origin sahte origin ile reddedilir');
    // ── 22. denetim F22-0: KAPALI ALAN SÖZLEŞMESİ ──────────────────────────────────────
    // Sınıfı kapatır: sözleşmede kayıtlı olmayan bir alan manifestte görünürse reddedilir.
    // Böylece "bir alan daha vardı" turu yapısal olarak sona erer.
    ok(typeof unregisteredFields === 'function', 'kapalı alan sözleşmesi dışa açık');
    ok(typeof MANIFEST_FIELD_CONTRACT === 'object' && Object.keys(MANIFEST_FIELD_CONTRACT).length > 40,
      'alan sözleşmesi tablosu dolu (>40 kayıt)');
    ok(unregisteredFields({ brandNewClaim: 1 }).includes('brandNewClaim'),
      'yeni üst düzey alan çapasız beyan olarak işaretlenir');
    ok(unregisteredFields({ rows: [{ brandNewClaim: 1 }] }).some((p2) => /brandNewClaim/.test(p2)),
      'satır içindeki yeni alan çapasız beyan olarak işaretlenir');
    ok(!validateManifest({ ...ctaBase, rows: [ctaRow({ brandNewClaim: 1 }), ...ctaBase.rows.slice(1)] },
      { issueFile: '', singleRun: true }).ok,
      'çapasız yeni satır alanı manifesti reddettirir');
    // Her sözleşme değeri ya `anchor:` ya `derived:` olmalı; gerekçesiz kayıt yok.
    const contractValues = Object.values(MANIFEST_FIELD_CONTRACT);
    ok(contractValues.every((v) => typeof v === 'string' && /^(anchor:|derived:)/.test(v) && v.length > 10),
      'her sözleşme kaydı anchor: veya derived: gerekçesi taşıyor');
    ok(contractValues.filter((v) => v.startsWith('derived:')).length <= 6,
      'derived: alanlar azınlıkta (kanıt olarak aktarılmayan alanlar)');
    // ── 23. denetim F23 ──────────────────────────────────────────────────────────────────
    // (a) Sözleşme "yeni alan eklenemez" diyordu; kayıtlı bir alanı DEĞİŞTİRMEK de kapanmalı.
    //     Denetçi 20/60 yaprağın okuyucusu olmadığını buldu; hepsi artık bağlı.
    ok(/font\.faces\[.*\]\.weight '\$\{face\.weight\}' ≠ yayın ağırlığı/.test(validator),
      'font face ağırlığı yayın ağırlığına bağlı');
    ok(/font\.faces\[.*\]\.family '\$\{face\.family\}' ≠ yayın fontu/.test(validator),
      'font face ailesi yayın fontuna bağlı');
    ok(/font\.faces\[.*\]\.unicodeRange Arapça bloğunu/.test(validator),
      'font face unicodeRange Arapça bloğuna bağlı');
    ok(/font\.requests\[.*\]\.name izinli origin ile başlamıyor/.test(validator)
      && /font\.requests\[.*\]\.transferSize .* gerçek indirme değil/.test(validator),
      'font istek adı izinli origin\'e, boyutu gerçek indirmeye bağlı');
    ok(/ctaReport .*viewport '.*' ≠ satırın/.test(validator) && /ctaReport .*stage '.*' geçersiz|ctaReport .*stage '.*' ≠ satırın seçicisindeki/.test(validator),
      'ctaReport viewport/stage satıra bağlı');
    ok(/lexiconVersion '\$\{glyphBlock\.lexiconVersion\}' ≠ canlı içerik/.test(validator)
      && /surahVersion '\$\{glyphBlock\.surahVersion\}' ≠ canlı içerik/.test(validator),
      'lexicon/surah sürümleri canlı içerikten yeniden türetiliyor');
    ok(/clipHeight \$\{glyphBlock\.clipHeight\} ≠ sheet\.sheetHeight/.test(validator),
      'clipHeight sheet.sheetHeight ile bağlı');
    ok(/manifest\.imageFormat '\$\{manifest\.imageFormat\}' ≠ diskteki/.test(validator),
      'imageFormat diskteki dosyaya bağlı');
    ok(/scrollTop \$\{row\.scrollTop\} ≠ cta\.scrollTop/.test(validator),
      'rows[].scrollTop cta.scrollTop ile bağlı');
    // (b) Yol taklidi: adı bir sözleşme yolu olan alan geçemez.
    ok(/alan adı yol dizesi taşıyamaz/.test(validator),
      'yol dizesi taşıyan alan adı reddediliyor');
    ok(unregisteredFields({ 'rows[].cta.height': 999 }).some((p3) => /yol dizesi/.test(p3)),
      'üst düzey sahte yol anahtarı yakalanır');
    ok(unregisteredFields({ rows: [{ 'cta.width': 1 }] }).some((p3) => /yol dizesi/.test(p3)),
      'satır içi noktalı anahtar yakalanır');
    // ── 24. denetim F24: şekil denetimi yetmez, DEĞER bağımsız kaynakla karşılaştırılmalı ──
    ok(/font\.check .* ≠ log\.txt'teki check=/.test(validator)
      && /font\.distinct .* ≠ log\.txt'teki distinct=/.test(validator),
      'font check/distinct log ile çapalı (--dogrula içinde)');
    ok(/glyphEvidence\.font\.check yok — font ölçüm bayrağı eksik/.test(validator),
      'eksik font.check sert hata');
    ok(/sheet\.\$\{field\} .* ≠ log\.txt'teki \$\{token\}=/.test(validator)
      && /\['minH', 'hMin'\], \['firstTop', 'hFirst'\]/.test(validator),
      'sheet minH/firstTop/lastTop/sw/cw log ölçümüyle çapalı');
    ok(/birebir eşleşmeli/.test(validator)
      && /kayıt ama satırda .* ölçüm var/.test(validator),
      'üretim bulgusu liste uzunlukları birebir eşleşmeli (boşaltılamaz)');
    // ── 25. denetim F25 ──────────────────────────────────────────────────────────────────
    ok(/üretim bulgusu tekrar ediyor/.test(validator),
      'üretim bulgusu listesi kümesel (tekrar eden kayıt reddedilir)');
    ok(/yükseklik zinciri tutarsız/.test(validator),
      'sheet yükseklik zinciri (sheetHeight/docH/bodyH/scrollH/clientH) bütün olarak bağlı');
    // ── 26. denetim F26 ──────────────────────────────────────────────────────────────────
    // (a) manifest.theme / manifest.viewport artık satırlardan türetiliyor.
    ok(/manifest\.theme '\(\$\{manifest\.theme\}\)' ≠ satırların teması|manifest\.theme .* ≠ satırların teması/.test(validator),
      'manifest.theme satırların temasına bağlı');
    ok(/manifest\.viewport\.\$\{key\} .* ≠ satırların/.test(validator),
      'manifest.viewport satırların viewport\'una bağlı');
    // (b) Dikey eksen tanıkları artık GERÇEKTEN log'da (önce yalnız adı vardı).
    ok(/CTA y .* ≠ log\.txt'teki ctaY=/.test(validator)
      && /CTA layoutY .* ≠ log\.txt'teki ctaLay=/.test(validator)
      && /CTA scrollTop .* ≠ log\.txt'teki ctaScr=/.test(validator),
      'CTA y/layoutY/scrollTop log ctaY=/ctaLay=/ctaScr= ile çapalı');
    // (c) cta.scroll iç alanları türetiliyor.
    ok(/scroll\.scrollTop .* ≠ cta\.scrollTop/.test(validator)
      && /scroll\.clientHeight .* ≠ viewport\.height/.test(validator),
      'cta.scroll.scrollTop/clientHeight türetiliyor');
    // (d) Font isteği tek yayın fontu + makul boyut.
    ok(/yayın fontu ScheherazadeNew-Regular\.k3p\.woff2 değil/.test(validator)
      && /yayın fontu için imkânsız/.test(validator),
      'font isteği tek yayın fontuna ve makul boyuta bağlı');
    // (e) derived: alanı da türetimiyle çapalı (aralık denetimi yetmez).
    ok(/viewportHeightDuringCapture .* ≠ min\(sheetHeight, 8000\)/.test(validator),
      'viewportHeightDuringCapture türetimiyle çapalı (min(sheetHeight,8000))');
  }

  // ── 7. Çekim aracı: SKIP'e yutma ve tema kapısı kaynak sözleşmesi ───────────────────────────
  const shooter = fs.readFileSync(path.join(repoRoot, 'tools/kapi/gorsel-qa/shoot-modal.mjs'), 'utf8');
  ok(!/SKIP\s*\$\{/.test(shooter) && !/catch\s*\([^)]*\)\s*\{\s*log\.push\([^)]*SKIP/.test(shooter),
    'çekim hatası SKIP olarak yutulmuyor (fail-closed)');
  // CTA kapısı: ölçüm kırılması (seçici yok / <44 px / görünmez / odak yok) ARAÇ HATASI olmalı,
  // üretim bulgusu değil. Tasarım: İKİ AYRI DİZİ (`failures` varsayılan, `findings` açık).
  // Metin aramasıyla sınıflandırma yok — bu yüzden sınıflandırıcı aranmaz, dizi ayrımı aranır.
  ok(/const failures = \[\];\s*\nconst findings = \[\];/.test(shooter),
    'ölçüm kırılması (`failures`) ile üretim bulgusu (`findings`) AYRI dizilerde');
  ok(!/isMeasureBreak/.test(shooter), 'metin aramasına dayalı sınıflandırıcı kaldırıldı');
  ok(/const captureFailures = failures;/.test(shooter), 'tüm çekim hataları tek kanaldan (failures) gelir');
  ok(/if \(captureFailures\.length\)[\s\S]{0,200}process\.exit\(1\)/.test(shooter),
    'failures doluysa exit 1');
  // CTA ölçüm kırılması satırları findings'e DEĞİL failures'a yazmalı.
  const ctaMeasureSites = shooter.split('\n').filter((line) => /failures\.push/.test(line) && /CTA (seçicisi|dokunma|görünür|klavye)/.test(line));
  ok(ctaMeasureSites.length >= 4, 'CTA ölçüm kırılması siteleri failures dizisine yazıyor');
  // Yalnız gerçek üretim kusurları findings'e yazılmalı.
  const findingSites = shooter.split('\n').filter((line) => /findings\.push/.test(line));
  ok(findingSites.length >= 3 && findingSites.every((line) => /hiddenBy|overlapCovered|controlCollisions|y-farkı/.test(line)),
    'findings dizisine yalnız gerçek üretim kusurları yazılıyor');
  ok(/ancestor\.tagName==='DETAILS'&&!ancestor\.open/.test(shooter) && /summary\.contains\(other\)/.test(shooter),
    'kapalı details içeriği görünür örtüşme sayılmaz; summary korunur');
  ok(/if \(!themeCheck\.ok\)[\s\S]{0,200}process\.exit\(1\)/.test(shooter) || /themeCheckProblems\.length[\s\S]{0,240}process\.exit\(1\)/.test(shooter),
    'tema doğrulanmazsa çekim exit 1 ile başarısız olur');
  // forceSync=1 yalnız YASAK olarak geçebilir: ya bir `throw`/`exit` ile reddedilir ya da
  // URL'de görülürse çekim durur. Kullanım (ayarlama) hiçbir yerde olmamalı.
  const forceOccurrences = [...shooter.matchAll(/forceSync=1/g)].length;
  ok(forceOccurrences > 0, 'araç forceSync=1 ifadesini tanır');
  ok(!/setItem\([^)]*forceSync/.test(shooter) && !/forceSync=1'?\)?;?\s*$/.test(shooter.replace(/\n/g, '')),
    'araç forceSync bayrağını AYARLAMAZ (yalnız reddeder)');
  ok(/forceSync=1\/.test\(obOrigin\.href\)|\/\[\?&\]forceSync=1\//.test(shooter), 'araç ?forceSync=1 URL bayrağını reddeder');
  ok(/seyma-sync-force/.test(shooter), 'araç seyma-sync-force ayarını reddeder');
  ok(/127\.0\.0\.1:9000/.test(shooter), 'tek origin 127.0.0.1:9000');
  ok(/ORIGIN/.test(shooter) && !/localhost/.test(shooter.replace(/\/\/[^\n]*/g, '')),
    'origin sabiti kullanılır, localhost yedeği yok');

  // Guard 1 gerçekten geçerli mi? (Bu fixture tarayıcı açmaz; kaynak sözleşmesini doğrular.)
  const sync = fs.readFileSync(path.join(repoRoot, 'sync.js'), 'utf8');
  ok(sync.includes("function devOrigin(){") && sync.includes("h==='127.0.0.1'"),
    'sync.js Guard 1 loopback originini kapsıyor');

  console.log('\nDone.');
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
