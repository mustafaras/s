'use strict';
// K3P-08 · Arapça tipografi sistemi sözleşmesi (TASARIM §5.3, TASARIM §5.4 kuralı).
// Salt okur; ağ, tarayıcı, depo veya gerçek saat yok. Yalnız `app/kao.css` metin taraması.
//
// 1) Arapça seçicilerde sahte kalın yok: `font-weight:700` = 0 (Arapça hep 400).
// 2) Arapça `font-size` yalnız üç kademeden gelir: `--kao-ar-hero`, `--kao-ar-body`, `--kao-ar-inline`.
// 3) Oran: her kademe yanındaki Latin ölçüsünün ≥ 1,3 katıdır (hero ≥ 1,3 × başlık; body/inline ≥ 1,3 × gövde).
// 4) Dokunma hedefi: şık düğmeleri ≥ 56 px.
// 5) Arapça ölçek/kalınlık sınıf-kuralıyla değil, kural düzeyinde tek yerden gelir (miras sızmasına karşı taban).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const repoRoot = require('../repo-root');

const css = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
// Tanımlayıcı bloklar (yorum + @font-face) kural sayılmaz; @media içindeki gerçek seçiciler kalır.
const scannable = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@font-face\{[^{}]*\}/g, '');
const rules = [...scannable.matchAll(/([^{}@]+)\{([^{}]*)\}/g)].map((m) => ({ selectors: m[1].split(',').map((s) => s.trim()), body: m[2] }));
const prop = (body, name) => { const found = body.match(new RegExp(`(?:^|;)\\s*${name}\\s*:\\s*([^;]+)`)); return found ? found[1].trim() : null; };

// Arapça seçici: doğrudan dil niteliği, `*-ar` sınıfı, `kao-arabic-text` ya da yalın `kao-ar`.
// `:not([lang="ar"])` Latin eşleşidir; önce düşülür ki Arapça sayılmasın.
const isArabicSelector = (sel) => {
  const bare = sel.replace(/:not\([^)]*\)/g, '');
  return /\[lang="ar"\]/.test(bare) || /\.kao-[\w-]*-ar\b/.test(bare) || /\bkao-arabic-text\b/.test(bare) || /\bkao-ar\b/.test(bare);
};

const arabicRules = rules.filter((r) => r.selectors.some(isArabicSelector));

// 1 · Sahte kalın yok.
const boldArabic = arabicRules
  .filter((r) => /(?:^|;)\s*font-weight\s*:\s*700/.test(r.body))
  .map((r) => r.selectors.join(','));
assert.deepEqual(boldArabic, [], 'Arapça kuralında font-weight:700 kaldı: ' + boldArabic.join(' '));

// Arapça ölçek, sarmalayıcı kutuların kalınlığından etkilenmez: tek taban kuralı 400 demeli.
const arabicBase = rules.find((r) => r.selectors.length === 1 && r.selectors[0] === '.kao-dialog [lang="ar"]');
assert.ok(arabicBase, '.kao-dialog [lang="ar"] kalınlık tabanı tanımlı');
assert.equal(prop(arabicBase.body, 'font-weight'), '400', 'Arapça kalınlık tabanı 400');

// 2 · Ölçek yalnız üç kademeden; başka sayısal ölçek yok.
const ALLOWED = new Set(['var(--kao-ar-hero)', 'var(--kao-ar-body)', 'var(--kao-ar-inline)']);
const sized = arabicRules.filter((r) => prop(r.body, 'font-size') !== null);
assert.ok(sized.length >= 15, 'Arapça ölçek kuralları sayısı beklenenden az (' + sized.length + ')');
const offScale = sized
  .filter((r) => !ALLOWED.has(prop(r.body, 'font-size')))
  .map((r) => `${r.selectors.join(',')} → ${prop(r.body, 'font-size')}`);
assert.deepEqual(offScale, [], 'Arapça font-size yalnız --kao-ar-* kademelerinden gelmeli: ' + offScale.join(' | '));

// Her kademe en az bir kuralla gerçekten kullanılıyor (tanımlı ama kullanılmayan kademe yok).
for (const token of ALLOWED) {
  assert.ok(sized.some((r) => prop(r.body, 'font-size') === token), 'kademe kullanılmıyor: ' + token);
}

// 3 · Oran ≥ 1,3 × Latin (Arapça x-yüksekliği daha küçüktür). Kademe değerleri kaynaktan okunur.
const tokenDef = (name) => {
  const found = scannable.match(new RegExp(`--${name}\\s*:\\s*([^;}]+)`));
  return found ? found[1].trim() : null;
};
// Latin karşılaştırma ölçüsü: KAO gövde metni (--f-body) — kademelerin karşılaştırıldığı taban.
const fBody = (() => {
  const styles = fs.readFileSync(path.join(repoRoot, 'app/styles.css'), 'utf8');
  const found = styles.match(/--f-body\s*:\s*([\d.]+)rem/);
  return found ? Number(found[1]) : null;
})();
assert.ok(fBody && fBody > 0, '--f-body kaynaktan okunamadı');
const heroMin = Number((tokenDef('kao-ar-hero').match(/clamp\(([\d.]+)rem/) || [])[1]);
const bodyVal = Number((tokenDef('kao-ar-body').match(/([\d.]+)rem/) || [])[1]);
const inlineVal = Number((tokenDef('kao-ar-inline').match(/([\d.]+)em/) || [])[1]);
assert.ok(heroMin > 0 && bodyVal > 0 && inlineVal > 0, 'kademe değerleri okunamadı');
assert.ok(heroMin >= fBody * 1.3, `hero ${heroMin}rem ≥ 1,3 × gövde ${fBody}rem (${(fBody * 1.3).toFixed(2)})`);
assert.ok(bodyVal >= fBody * 1.3, `body ${bodyVal}rem ≥ 1,3 × gövde ${fBody}rem (${(fBody * 1.3).toFixed(2)})`);
assert.ok(inlineVal >= 1.3, `inline ${inlineVal}em ≥ 1,3 × komşu Latin`);
// Arapça, aynı yüzeydeki Latin yığınından (gövde) her kademede büyük kalır.
assert.ok(heroMin > bodyVal && bodyVal > fBody, 'kademeler küçükten büyüğe artmalı: inline/gövde < body < hero');

// 4 · Şıklar ≥ 56 px.
const choiceRule = rules.find((r) => r.selectors.length === 1 && r.selectors[0] === '.kao-choices button');
assert.ok(choiceRule, '.kao-choices button kuralı bulundu');
const choiceMin = Number((prop(choiceRule.body, 'min-height').match(/(\d+)px/) || [])[1]);
assert.ok(choiceMin >= 56, `şıklar ≥ 56 px (bulunan ${choiceMin}px)`);

console.log('K3P-08 typography: PASS (Arapça 700 = 0 · ölçek yalnız --kao-ar-* · oran ≥ 1,3 · şık ≥ 56 px)');
