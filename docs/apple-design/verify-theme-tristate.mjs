// AD-31 · Üç durumlu tema sözleşmesi doğrulayıcısı
//
// Neden ayrı bir fixture: AD-31, uygulamanın tema modelini iki durumdan üçe
// çıkardı ve bunun sözleşmesi başka hiçbir yerde test edilmiyor —
// driver.mjs yalnızca `App.setTheme(true)`'yu bir kez çağırıp yeniden
// render olduğuna bakar. Burada korunan asıl şeyler:
//
//   1. `App.setTheme(true|false)` ESKİ davranışı birebir sürdürür (I2).
//   2. `'system'` = `seyma-theme` anahtarının YOKLUĞU — eski kayıtlar bozulmaz.
//   3. Cihaz teması dinleyicisi yalnızca `themePref==='system'` iken boyar
//      ve yalnızca çözülmüş değer gerçekten değiştiyse.
//   4. `matchMedia` yoksa çökmeden açık temaya düşer.
//
// Veri güvenliği (CLAUDE.md): app.js BOOT EDİLMEZ. Yalnızca iki kod bloğu
// metin olarak çıkarılıp yalıtılmış bir `node:vm` bağlamında çalıştırılır;
// gerçek localStorage, fetch, zamanlayıcı ve ağ erişimi yoktur.
//
// Çalıştır: node docs/apple-design/verify-theme-tristate.mjs

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const src = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');

// Bloklar app.js içinde yorum çıpalarıyla işaretli. Çıpa kaydıysa sessizce
// yanlış şey test etmek yerine yüksek sesle başarısız ol.
function slice(startMark, endMark, label) {
  const a = src.indexOf(startMark);
  if (a < 0) throw new Error(`Çıpa bulunamadı (${label}): ${startMark}\n` +
    `app.js yeniden düzenlenmiş olabilir — bu fixture'ı güncelle, sessizce atlama.`);
  const b = src.indexOf(endMark, a);
  if (b < 0) throw new Error(`Bitiş çıpası bulunamadı (${label}): ${endMark}`);
  return src.slice(a, b);
}

const themeBlock = slice('// ── Tema: üç durumlu tercih', '// ── Kilit ekranı', 'tema durum bloğu');
const setThemeBlock = slice('// AD-31: argüman alanı', 'App.toggleTheme=function', 'App.setTheme');

// Kontrol edilebilir bir matchMedia ile yalıtılmış bağlam kur.
function makeCtx({ stored, systemDark }) {
  const store = new Map();
  if (stored !== undefined) store.set('seyma-theme', stored);
  let listener = null;
  let renders = 0;

  const ctx = {
    TKEY: 'seyma-theme',
    App: {},
    render() { renders++; },
    renderCalls: () => renders,
    document: { getElementById: () => ({}) },
    localStorage: {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, v),
      removeItem: k => store.delete(k),
      has: k => store.has(k),
    },
    fireSchemeChange(nowDark) { systemDark = nowDark; if (listener) listener(); },
  };
  ctx.window = ctx;
  ctx.matchMedia = () => ({
    get matches() { return systemDark; },
    addEventListener: (_e, fn) => { listener = fn; },
    addListener: fn => { listener = fn; },
  });

  vm.createContext(ctx);
  vm.runInContext(`${themeBlock}\n${setThemeBlock}`, ctx);
  return ctx;
}

let pass = 0;
let fail = 0;
const t = (name, cond) => {
  if (cond) { pass++; console.log('  ✓', name); }
  else { fail++; console.log('  ✗', name); }
};

console.log('\n[1] Hiç seçim yok — sistemi takip eder');
let c = makeCtx({ stored: undefined, systemDark: true });
t('themePref = system', c.themePref === 'system');
t('cihaz koyu → dark=true', c.dark === true);
c = makeCtx({ stored: undefined, systemDark: false });
t('cihaz açık → dark=false', c.dark === false);

console.log('\n[2] Eski kayıtlar korunur (geriye dönük uyum)');
c = makeCtx({ stored: 'dark', systemDark: false });
t('stored=dark → pref=dark, sistem açık olsa da koyu', c.themePref === 'dark' && c.dark === true);
c = makeCtx({ stored: 'light', systemDark: true });
t('stored=light → pref=light, sistem koyu olsa da açık', c.themePref === 'light' && c.dark === false);

console.log('\n[3] App.setTheme eski imzayı sürdürür (I2)');
c = makeCtx({ stored: undefined, systemDark: false });
c.App.setTheme(true);
t('setTheme(true) → dark=true, kalıcı "dark"', c.dark === true && c.localStorage.getItem('seyma-theme') === 'dark');
c.App.setTheme(false);
t('setTheme(false) → dark=false, kalıcı "light"', c.dark === false && c.localStorage.getItem('seyma-theme') === 'light');
t('her çağrı render() tetikledi', c.renderCalls() === 2);

console.log('\n[4] Üçüncü durum: system = anahtarın yokluğu');
c = makeCtx({ stored: 'dark', systemDark: true });
c.App.setTheme('system');
t("setTheme('system') → pref=system", c.themePref === 'system');
t('anahtar SİLİNDİ', c.localStorage.has('seyma-theme') === false);
t('cihaz koyu → dark=true', c.dark === true);

console.log('\n[5] Canlı cihaz teması değişimi');
c = makeCtx({ stored: undefined, systemDark: false });
t('başlangıç açık', c.dark === false);
c.fireSchemeChange(true);
t('sistem koyuya döndü → dark=true + tek render', c.dark === true && c.renderCalls() === 1);
c.fireSchemeChange(true);
t('değişiklik yoksa yeniden boyama YOK', c.renderCalls() === 1);
c = makeCtx({ stored: 'light', systemDark: false });
c.fireSchemeChange(true);
t('pref=light iken sistem değişimi YOKSAYILIR', c.dark === false && c.renderCalls() === 0);

console.log('\n[6] matchMedia yokken savunmacı davranış');
const ctx2 = {
  TKEY: 'seyma-theme', App: {}, render() {},
  document: { getElementById: () => ({}) },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
};
ctx2.window = ctx2;
vm.createContext(ctx2);
vm.runInContext(`${themeBlock}\n${setThemeBlock}`, ctx2);
t('çökmez, açık temaya düşer', ctx2.dark === false);

console.log('\n[7] CSS sözleşmesi: ikinci koyu blok OLMAMALI');
const css = fs.readFileSync(path.join(repoRoot, 'app', 'styles.css'), 'utf8');
t('app/styles.css içinde @media (prefers-color-scheme: dark) yok (AD-31 A seçeneği)',
  !/@media[^{]*prefers-color-scheme\s*:\s*dark/.test(css));
// Repoda tarihsel olarak üç adet bare `#root[data-theme="dark"]{` bloğu var:
// ana token bloğu (--page tanımlayan) + iki hatırlatma token bloğu. Burada
// korunan şey, AD-31'in ANA bloğu ikizlememiş olması.
const mainDarkBlocks = (css.match(/#root\[data-theme="dark"\]\s*\{[^}]*--page\s*:/g) || []).length;
t(`ana koyu token bloğu tek (--page tanımlayan), bulunan: ${mainDarkBlocks}`, mainDarkBlocks === 1);

console.log('\n[8] Boot öncesi flaş koruması (AD-31-FIX-2)');
const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const boot = html.match(/AD-31-FIX-2[\s\S]*?\}\)\(\);/);
t('index.html boyamadan önce temayı çözen blok taşıyor', !!boot);
if (boot) {
  const b = boot[0];
  t('  aynı localStorage anahtarını okuyor', b.includes("'seyma-theme'"));
  t('  aynı üç durumu ayırt ediyor', b.includes("'dark'") && b.includes("'light'") && b.includes('system'));
  t('  matchMedia ile sistemi çözüyor', /prefers-color-scheme:\s*dark/.test(b));
  t('  matchMedia yoksa çökmeyecek şekilde korumalı', b.includes('window.matchMedia &&'));
  t('  #root üzerine data-theme yazıyor', /setAttribute\('data-theme'/.test(b));
  t('  theme-color metasını da senkronluyor', b.includes('theme-color'));
}
t('#root JS\'siz yedek olarak hâlâ bir data-theme taşıyor', /<div id="root"[^>]*data-theme="/.test(html));

console.log(`\n=== ${pass} geçti, ${fail} kaldı ===`);
process.exit(fail ? 1 : 0);
