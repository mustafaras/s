'use strict';
// K3P-10 · Hareket grameri sözleşmesi (TASARIM §5.4, D-5) — `app/kao.css` metin taraması.
// Salt okur; ağ, tarayıcı, depo veya gerçek saat yok.
//
// 1) Üç sınıf `--kao-dur-micro/transition/moment` + `--kao-ease` jetonlarına bağlıdır.
// 2) Görev geçişi 24 px yatay kayma + opaklıkla, en çok 240 ms (D-5 → --dur-2).
// 3) Şık basışı 120 ms küçülme (--dur-1) ve yumuşak eğri (--kao-ease).
// 4) ✓ işareti yaylanarak belirir.
// 5) Hareket azaltma: kao.css'teki GERÇEK her animasyon/geçiş (animation:none yazmayan)
//    `prefers-reduced-motion:reduce` bloğuyla kapanır; kapsanmayan tek seçici kalmaz.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const repoRoot = require('../repo-root');

const css = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
const tokens = fs.readFileSync(path.join(repoRoot, 'app/styles.css'), 'utf8');
// Tanımlayıcı bloklar (yorum + @font-face) kural sayılmaz; @media içindeki gerçek seçiciler kalır.
const scannable = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@font-face\{[^{}]*\}/g, '');
const rules = [...scannable.matchAll(/([^{}@]+)\{([^{}]*)\}/g)]
  .map((m) => ({ selectors: m[1].split(',').map((s) => s.trim()).filter(Boolean), body: m[2] }));
const prop = (body, name) => { const found = body.match(new RegExp(`(?:^|;)\\s*${name}\\s*:\\s*([^;]+)`)); return found ? found[1].trim() : null; };
const ruleFor = (sel) => rules.find((r) => r.selectors.includes(sel));
const tokenValue = (name) => { const found = tokens.match(new RegExp(`--${name}\\s*:\\s*([^;}]+)`)); return found ? found[1].trim() : null; };

// 1 · Üç sınıf jetonları tanımlı ve doğru kaynağa bağlı (yeni sayı yok).
assert.match(scannable, /--kao-dur-micro:var\(--dur-1\)/, '--kao-dur-micro --dur-1e bağlı');
assert.match(scannable, /--kao-dur-transition:var\(--dur-2\)/, '--kao-dur-transition --dur-2ye bağlı');
assert.match(scannable, /--kao-dur-moment:var\(--dur-5\)/, '--kao-dur-moment --dur-5e bağlı');
assert.match(scannable, /--kao-ease:cubic-bezier\(\.2,\.8,\.2,1\)/, '--kao-ease yumuşak eğri');

// 2 · D-5: geçiş sınıfı ≤240 ms (--dur-2 = 200 ms) ve 24 px yatay + opaklık.
const d2 = tokenValue('dur-2');
assert.equal(d2, '200ms', 'geçiş tokenı --dur-2 = 200 ms');
const ms = (v) => { const m = String(v).match(/^([\d.]+)ms$/); return m ? Number(m[1]) : NaN; };
assert.ok(ms(d2) <= 240, `geçiş ≤ 240 ms olmalı (${d2})`);
const taskIn = ruleFor('.kao-task-in');
assert.ok(taskIn, '.kao-task-in kuralı var');
assert.match(prop(taskIn.body, 'animation'), /kao-task-in var\(--kao-dur-transition\) var\(--kao-ease\)/, 'görev geçişi geçiş sınıfı + eğri ile');
const taskKf = /@keyframes kao-task-in\{([^@]*)/.exec(scannable);
assert.ok(taskKf, 'kao-task-in keyframe var');
assert.match(taskKf[1], /translateX\(24px\)/, 'görev 24 px yatay kayar');
assert.match(taskKf[1], /opacity:0/, 'görev opaklıkla gelir');

// 3 · Mikro sınıf: 120 ms (--dur-1) şık basışı + yumuşak eğri.
const d1 = tokenValue('dur-1');
assert.equal(d1, '120ms', 'mikro token --dur-1 = 120 ms');
const press = ruleFor('.kao-choices button');
assert.ok(press, '.kao-choices button kuralı var');
assert.match(prop(press.body, 'transition'), /transform var\(--kao-dur-micro\) var\(--kao-ease\)/, 'şık basışı mikro sınıf + eğri ile');
const active = ruleFor('.kao-choices button:active');
assert.ok(active, '.kao-choices button:active kuralı var');
assert.equal(prop(active.body, 'transform'), 'scale(.98)', 'şık 120 ms\'de küçülür');

// 4 · ✓ işareti yaylanarak belirir (mark keyframe + geçiş sınıfı).
const mark = ruleFor('.kao-choice-correct .kao-choice-mark');
assert.ok(mark, '✓ işareti kuralı var');
assert.match(prop(mark.body, 'animation'), /kao-mark-in var\(--kao-dur-transition\) var\(--kao-ease\)/, '✓ işareti yay animasyonuyla');
assert.match(scannable, /@keyframes kao-mark-in\{from\{opacity:0;transform:scale\(\.6\)\}60%\{transform:scale\(1\.15\)\}/, '✓ işareti aşma (%6+) ile belirir');

// 4b · Yanlışta sarsıntı sınıfı mikro sınıfla sınırlı (kalıcı hareket yok).
const shake = ruleFor('.kao-shake');
assert.ok(shake, '.kao-shake kuralı var');
assert.match(prop(shake.body, 'animation'), /kao-shake calc\(var\(--kao-dur-micro\)\*2\) var\(--kao-ease\)/, 'sarsıntı mikro sınıfın iki katı + eğri');
assert.match(scannable, /@keyframes kao-shake\{0%,100%\{transform:translateX\(0\)\}25%\{transform:translateX\(-4px\)\}/, 'sarsıntı yatay, ±4 px');

// 5 · Hareket azaltma: reduce bloğunun kapattığı seçiciler (animation|transition:none).
const reduceSelectors = new Set();
for (const m of scannable.matchAll(/@media\s*\(prefers-reduced-motion:\s*reduce\)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g)) {
  for (const r of m[1].matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (/(?:^|;)\s*(?:animation|transition)\s*:\s*none/.test(r[2])) r[1].split(',').forEach((s) => reduceSelectors.add(s.trim()));
  }
}
// Gerçek hareket taşıyan (animation/transition:none YAZMAYAN) her seçici reduce bloğunda kapanmalı.
const uncovered = [];
for (const r of rules) {
  if (!/(?:^|;)\s*(?:animation|transition)\s*:/.test(r.body)) continue;
  if (/(?:^|;)\s*(?:animation|transition)\s*:\s*none/.test(r.body)) continue; // açıkça kapatan istisna kural
  for (const sel of r.selectors) if (!reduceSelectors.has(sel)) uncovered.push(sel);
}
assert.deepEqual(uncovered, [], 'hareket azaltmada kapanmayan seçiciler: ' + uncovered.join(' | '));

// Yeni sınıfların üçü de ve K3P-10 öncesi kapsanmayan üç geçiş de reduce bloğunda.
for (const sel of ['.kao-task-in', '.kao-shake', '.kao-choice-correct .kao-choice-mark', '.kao-flag summary::after', '.kao-lesson-more summary::after', '.kao-lesson-seg>i']) {
  assert.ok(reduceSelectors.has(sel), `reduce kapsamıyor: ${sel}`);
}

console.log(`test_k3p_motion_css: PASS (geçiş ${ms(d2)} ms · mikro ${ms(d1)} ms · reduce kapsamı ${reduceSelectors.size} seçici · kapsanmayan 0)`);
