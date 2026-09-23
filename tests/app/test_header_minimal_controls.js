'use strict';

const fs = require('node:fs');
const path = require('node:path');
const repoRoot = require('../repo-root');
const css = fs.readFileSync(path.join(repoRoot, 'app/styles.css'), 'utf8');
const render = fs.readFileSync(path.join(repoRoot, 'app/core/render.js'), 'utf8');
const surface = fs.readFileSync(path.join(repoRoot, 'app/core/appSurface.js'), 'utf8');
let passed=0, failed=0;
function check(name, ok){ if(ok){passed++;console.log('PASS '+name);}else{failed++;console.log('FAIL '+name);} }

check('eşitle ve tema tek ortak kontrol adasında',
  /\.sey-header-tools\{[^}]*gap:0[^}]*padding:2px[^}]*border-radius:16px[^}]*backdrop-filter:blur\(12px\)/s.test(css));
check('tema kontrolü 44x44 erişilebilir hedef',
  /\.sey-header-mini\{[^}]*width:44px[^}]*height:44px/s.test(css));
check('eşitle kontrolü 44x44 erişilebilir hedef',
  /\.sey-header-save\{[^}]*width:44px[^}]*height:44px/s.test(css));
check('bağlamsal eylem 44x44 dairesel ikon kontrolü',
  /\.sey-header-action\{[^}]*width:44px[^}]*height:44px[^}]*border-radius:50%/s.test(css));
check('görsel etiketler erişilebilir biçimde gizleniyor',
  css.includes('.sey-header-action span,.sey-header-save__label{position:absolute!important;width:1px!important'));
check('eşitle durumları renkli nokta ile görünür',
  css.includes('.sey-header-save.is-dirty::after,.sey-header-save.is-error::after') &&
  css.includes('.sey-header-save.is-local::after,.sey-header-save.is-synced::after'));
check('erişilebilir adlar markup içinde korunuyor',
  render.includes('aria-label="Tema"') && surface.includes("aria-label=\"'+esc(a.label)+'\""));
check('dar ekran artık hedefleri 40px altına düşürmüyor',
  !/@media \(max-width:370px\)[^{]*\{[^}]*width:40px/s.test(css));

console.log('Passed: '+passed+' / '+(passed+failed));
if(failed) process.exit(1);
