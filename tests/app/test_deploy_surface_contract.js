'use strict';
// Yayın yüzeyi sözleşmesi (2026-09-22).
//
// pages.yml depo kökünü "olduğu gibi" yayınlıyordu; zamanla iki tur iç
// malzeme sızdı:
//   1. tur — docs/ tests/ archive/ .claude/ (yorumda belgeli)
//   2. tur — tools/ files/ ilham-ibadet-premium-plan/ kuran-ogreniyorum/
//            jev-gate/  (canlıda 200 döndüğü curl ile doğrulandı)
//
// Bu fixture iddiayı METİN taramasıyla değil, pages.yml'den çıkarılan GERÇEK
// rsync bayraklarını çalıştırarak doğrular: iç dizinler staged ağaca sızarsa
// veya bir çalışma zamanı varlığı dışlanırsa FAIL eder. Guard adımının dizin
// listesi de rsync'in dışlama listesiyle tutarlı olmalıdır (aksi hâlde guard
// yanlışlıkla deploy'u düşürür).
//
// Çalıştırma: node tests/app/test_deploy_surface_contract.js

var fs = require('fs');
var os = require('os');
var path = require('path');
var child = require('child_process');
var repoRoot = require('../repo-root');

var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name + (detail ? ' — '+detail : '')); }
}

console.log('\n=== Yayın Yüzeyi Sözleşmesi (pages.yml) ===\n');

var workflowPath = path.join(repoRoot, '.github/workflows/pages.yml');
var raw = fs.readFileSync(workflowPath, 'utf8');

// ---------------------------------------------------------------------------
// 1. Yayınlanmaması gereken iç dizinler ve yayınlanması zorunlu varlıklar
// ---------------------------------------------------------------------------
var INTERNAL_DIRS = [
  'docs', 'tests', 'archive', '.claude', 'tools', 'files',
  'ilham-ibadet-premium-plan', 'kuran-ogreniyorum', 'jev-gate'
];

var REQUIRED_ASSETS = [
  'index.html', 'panel.html', 'panel-v2.html', 'app.js', 'sync.js',
  'app/styles.css', 'panel/panel.js', 'panel/panel.css', 'sw.js',
  'manifest.json', 'app/core/constants.js',
  'panel/panelCoverageManifest.js', 'panel/v2/panel-v2.js',
  'panel/v2/panel-v2.css', 'app/content/profileAssessmentV1.js',
  'app/content/quranRevelationOrderV1.js',
  'assets/aeon-icon-192.png', 'assets/aeon-icon-512.png',
  'profil-degerlendirme-174.html'
];

// ---------------------------------------------------------------------------
// 2. pages.yml içinden Stage adımını ve Guard adımını çıkar
// ---------------------------------------------------------------------------
function extractStep(name){
  var idx = raw.indexOf('name: ' + name);
  if (idx < 0) return null;
  var runIdx = raw.indexOf('run: |', idx);
  if (runIdx < 0) return null;
  // run bloğunu al: sonraki 6-boşluklu "      - name:" satırına kadar
  var rest = raw.slice(runIdx + 'run: |'.length);
  var endMatch = rest.match(/\n {6}- /);
  return endMatch ? rest.slice(0, endMatch.index) : rest;
}

var stageBody = extractStep('Stage runtime-only site');
var guardBody = extractStep('Guard runtime assets present');

ok('Stage runtime-only site adımı var', !!stageBody);
ok('Guard runtime assets present adımı var', !!guardBody);

// rsync'in GERÇEK --exclude bayrakları
var excludes = [];
if (stageBody) {
  var m, re = /--exclude\s+'([^']+)'/g;
  while ((m = re.exec(stageBody))) excludes.push(m[1]);
}
ok('rsync --exclude bayrakları okundu', excludes.length >= 10,
   excludes.length + ' adet');

// Guard adımının denetlediği dizin listesi — 'for d in ...; do' yapısından
// ayrıştırılır (satır devamı '\' ve yeni satırlar temizlenir).
var guardDirs = [];
if (guardBody) {
  var gm = guardBody.match(/for\s+d\s+in\s+([\s\S]*?);\s*do/);
  if (gm) {
    guardDirs = gm[1].replace(/\\/g, ' ').split(/\s+/).filter(Boolean);
  }
}
ok('guard dizin listesi ayrıştırıldı', guardDirs.length >= 8,
   guardDirs.length + ' adet');

// ---------------------------------------------------------------------------
// 3. Metin sözleşmesi: her iç dizin dışlanmalı, her varlık guard'da olmalı
// ---------------------------------------------------------------------------
INTERNAL_DIRS.forEach(function(d){
  ok('rsync dışlıyor: ' + d, excludes.indexOf(d) >= 0,
     'exclude listesinde yok');
  ok('guard da kontrol ediyor: ' + d, guardDirs.indexOf(d) >= 0,
     'guard dizin listesinde yok');
});

REQUIRED_ASSETS.forEach(function(a){
  ok('guard zorunlu tutuyor: ' + a, guardBody && guardBody.indexOf(a) >= 0,
     'guard varlık listesinde yok');
});

ok("guard '.md' kalmadığını doğruluyor",
   !!guardBody && /find _site -name '\*\.md'/.test(guardBody));

// ---------------------------------------------------------------------------
// 4. YÜRÜTÜLEBİLİR sözleşme: gerçek rsync bayraklarıyla staged ağacı kur
// ---------------------------------------------------------------------------
var tmp = null;
try {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'seyma-deploy-'));
} catch (e) {
  ok('geçici dizin oluşturulabildi', false, String(e && e.message));
}

if (tmp && excludes.length) {
  var args = ['-a'];
  excludes.forEach(function(x){ args.push('--exclude', x); });
  args.push('./', tmp + path.sep);
  var res;
  try {
    res = child.spawnSync('rsync', args, { cwd: repoRoot, encoding: 'utf8' });
  } catch (e) {
    res = { status: -1, stderr: String(e && e.message) };
  }
  ok('gerçek rsync koştu (yürütülebilir kanıt)', res.status === 0,
     'status=' + res.status + ' ' + String(res.stderr || '').trim().slice(0, 120));

  if (res.status === 0) {
    INTERNAL_DIRS.forEach(function(d){
      ok('staged ağaçta YOK: ' + d, !fs.existsSync(path.join(tmp, d)),
         'sızdı');
    });

    // archive/ dışlanmış olsa da tek istisna dosya install ile geri konur
    var standaloneSrc = path.join(repoRoot, 'archive/demos/profil-degerlendirme-174.html');
    var standaloneDst = path.join(tmp, 'profil-degerlendirme-174.html');
    if (fs.existsSync(standaloneSrc)) {
      fs.copyFileSync(standaloneSrc, standaloneDst);
      ok('istisna sayfa geri konunca mevcut: profil-degerlendirme-174.html',
         fs.existsSync(standaloneDst));
    }

    REQUIRED_ASSETS.forEach(function(a){
      ok('staged ağaçta VAR: ' + a, fs.existsSync(path.join(tmp, a)),
         'dışlanmış (deploy sessizce bozulurdu)');
    });

    // staged ağaçta hiç .md kalmamalı
    var mdStack = [tmp], mdFound = [];
    while (mdStack.length) {
      var cur = mdStack.pop();
      fs.readdirSync(cur, { withFileTypes: true }).forEach(function(e){
        var p = path.join(cur, e.name);
        if (e.isDirectory()) mdStack.push(p);
        else if (/\.md$/i.test(e.name)) mdFound.push(path.relative(tmp, p));
      });
    }
    ok('staged ağaçta .md kalmadı', mdFound.length === 0,
       mdFound.slice(0, 3).join(', '));
  }
}

if (tmp) {
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* yut */ }
}

// ---------------------------------------------------------------------------
console.log('\n' + (failed === 0 ? '✓' : '✗') + ' ' + passed + ' geçti, ' +
            failed + ' başarısız\n');
process.exit(failed === 0 ? 0 : 1);
