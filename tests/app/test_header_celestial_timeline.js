'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');
const source = fs.readFileSync(path.join(repoRoot, 'app/core/appSurface.js'), 'utf8');
const css = fs.readFileSync(path.join(repoRoot, 'app/styles.css'), 'utf8');
const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
let passed = 0, failed = 0;
function check(name, condition){
  if(condition){ passed++; console.log('PASS '+name); }
  else { failed++; console.log('FAIL '+name); }
}

check('gece ilerlemesi gün batımından ertesi doğuma hesaplanıyor',
  source.includes('if(t>=ss){ start=ss; end=sr+86400000; }') &&
  source.includes('else if(t<=sr){ start=ss-86400000; end=sr; }'));
check('gece ve gündüz farklı doğru ilerleme fonksiyonlarını kullanıyor',
  source.includes('var prog=isNight?headerNightProgress(spot):headerSolarProgress(spot);'));
check('yörünge ufuk, iki uç, hale ve ilerleme noktası taşıyor',
  source.includes('sey-hdr-horizon') && source.includes('sey-hdr-orbit-edge') &&
  source.includes('sey-hdr-arc-halo') && source.includes('sey-hdr-arc-dot'));
check('gece yolculuğu metinsel olarak da açıklanıyor', source.includes("isNight?'Gece yolculuğu':'Gün ışığı'"));
check('sağ kapsül ikon, ad, saat ve olay açıklaması taşıyor',
  source.includes('sey-hdr-phase-glyph') && source.includes('sey-hdr-phase-copy') &&
  source.includes("isNight?'gün doğumu':'gün batımı'"));
check('sahne üç kolonlu çakışmasız grid',
  /\.sey-hdr-scene\s*\{[^}]*display:grid[^}]*grid-template-columns:auto minmax\(64px,1fr\) auto/s.test(css));
check('vakit kapsülü dinamik zeminden ayrışan malzeme',
  css.includes('.sey-hdr-phase{') && css.includes('backdrop-filter:blur(10px)') &&
  css.includes('min-width:88px'));
check('dar ekran vakit açıklamasını kademeli sadeleştiriyor',
  css.includes('@media(max-width:389px)') && css.includes('.sey-hdr-phase-time em{ display:none; }'));
check('gece kapsülü açık temada korumalı koyu zemin alıyor',
  css.includes('sky-time-night ~ .sey-hdr-scene .sey-hdr-phase{'));
/* IIP-21 okuma levhası styles.css pinini yükseltti; appSurface pini değişmedi. */
check('CSS ve appSurface cache sürümleri yükseltildi',
  html.includes('app/styles.css?v=20260924c') && html.includes('app/core/appSurface.js?v=20260924d'));

console.log('Passed: '+passed+' / '+(passed+failed));
if(failed) process.exit(1);
