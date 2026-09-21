'use strict';

// Açık tema + gece gökyüzü, görünüş adı "light" olsa da koyu bir yüzeydir.
// Header'ın tüm okunabilir metin/eylem katmanlarının sahneye göre uyarlanmasını
// ve seçilen sabit renklerin en koyu/açık gece duraklarında WCAG kontrastını kilitler.
const fs = require('node:fs');
const path = require('node:path');
const repoRoot = require('../repo-root');

const css = fs.readFileSync(path.join(repoRoot, 'app/styles.css'), 'utf8');
const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) { passed += 1; console.log('PASS ' + name); }
  else { failed += 1; console.log('FAIL ' + name); }
}

function rgb(value) {
  const hex = value.replace('#', '');
  return [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
}
function channel(value) {
  value /= 255;
  return value <= .03928 ? value / 12.92 : Math.pow((value + .055) / 1.055, 2.4);
}
function luminance(value) {
  const c = rgb(value).map(channel);
  return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
}
function ratio(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}

const scope = '#root:not([data-theme="dark"]) .sey-hdr-sky.sky-time-night ~ ';
[
  '.sey-header-top .sey-wordmark',
  '.sey-header-top .sey-header-mini',
  '.sey-header-top .sey-header-save',
  '.sey-header-main .sey-header-icon',
  '.sey-header-main .sey-header-kicker',
  '.sey-header-main .sey-header-title',
  '.sey-header-main .sey-header-sub',
  '.sey-header-main .sey-header-action',
  '.sey-hdr-scene',
  '.sey-hdr-scene .sey-hdr-wx',
  '.sey-hdr-scene .sey-hdr-wx-temp',
  '.sey-hdr-scene .sey-hdr-wx-label',
  '.sey-hdr-scene .sey-hdr-phase-name',
  '.sey-hdr-scene .sey-hdr-phase-time',
  '.sey-hdr-scene .sey-hdr-arc-track'
].forEach((selector) => check('gece kapsamı: ' + selector, css.includes(scope + selector)));

const nightStops = ['#243A6E', '#101A33'];
[
  ['ana metin', '#FAF8F4', 4.5],
  ['ikincil metin', '#D7DFEF', 4.5],
  ['altın vurgu', '#F4D98F', 4.5]
].forEach(([name, foreground, minimum]) => {
  nightStops.forEach((background) => check(
    name + ' / ' + background + ' >= ' + minimum,
    ratio(foreground, background) >= minimum
  ));
});

check('gündüz/şafak/akşam seçicileri gece override kapsamına alınmadı',
  !scope.includes('sky-time-day') && !scope.includes('sky-time-dawn') && !scope.includes('sky-time-dusk'));
check('stylesheet cache sürümü yükseltildi', html.includes('app/styles.css?v=20260921f'));

console.log('Passed: ' + passed + ' / ' + (passed + failed));
if (failed) process.exit(1);
