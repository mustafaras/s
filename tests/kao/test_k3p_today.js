'use strict';
// K3P-12 · Bugün ekranı yeniden (K-F, §3.1). Sentetik VM, sahte saat; ağ/tarayıcı/gerçek veri yok.
//  - .kao-today-screen içinde en çok 5 etkileşimli öğe.
//  - Eski hedeflerin hepsine Bugün'den en çok 2 dokunuşla ulaşılır (tablo güdümlü; dokunuş sayısı KANITLANIR).
//  - Kütüphane keşfi tek alt sayfada toplar; İlerleme ve Ayarlar buradan.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const repoRoot = require('../repo-root');
const { bootKao, openView } = require('./helpers/kao-harness');

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

const t = bootKao({ seeded: true });
const todayScreen = (html) => (String(html).match(/<main class="kao-today-screen"[\s\S]*?<\/main>/) || [''])[0];
const buttonCount = (html) => (String(html).match(/<button/g) || []).length;
const calls = (html) => [...String(html).matchAll(/onclick="(App\.[A-Za-z0-9]+\([^"]*\))"/g)].map((m) => m[1]);

const home = openView(t, 'home', null, { mode: 'set' });
const lib = openView(t, 'library', null, { mode: 'set' });
const level1 = calls(todayScreen(home.html));
const level2 = calls(lib.html);
const labelsIn = (html) => [...String(html).matchAll(/<span class="kao-group-label">([^<]*)<\/span>/g)].map((m) => m[1]);

check('Bugün ekranı ≤ 5 etkileşimli öğe taşır (K-F)', () => {
  assert.ok(todayScreen(home.html).length > 0, 'Bugün kabuğu var');
  assert.ok(buttonCount(todayScreen(home.html)) <= 5, `Bugün ekranı ${buttonCount(todayScreen(home.html))} düğme`);
});

// Tablo güdümlü: her hedef, belirtilen dokunuş katmanında bir çağrıyla eşleşmeli.
const TABLE = [
  ['Ders (bugünkü adım)', 1, /^App\.kao(Lesson|S0|Onboard|OpenAyah)\(/],
  ['An kartı → okuyucu', 1, /^App\.kaoSetView\(&quot;reader&quot;\)$/],
  ['Namazda ne diyorum', 1, /^App\.kaoOpenPrayer\(\)$/],
  ['Kütüphane', 1, /^App\.kaoSetView\(&quot;library&quot;\)$/],
  ['Kısa sûreler', 2, /^App\.kaoOpenSurah\(/],
  ['Günün âyeti', 2, /^App\.kaoOpenAyah\(\)$/],
  ['Telaffuz stüdyosu', 2, /^App\.kaoOpenPhonics\(\)$/],
  ['Seviye 0 · Harfler', 2, /^App\.kaoSetView\(&quot;s0&quot;\)$/],
  ['Gramer notları', 2, /^App\.kaoSetView\(&quot;grammar&quot;\)$/],
  ['İlerleme', 2, /^App\.kaoSetView\(&quot;stats&quot;\)$/],
  ['Ayarlar', 2, /^App\.kaoSetView\(&quot;settings&quot;\)$/]
];
check('eski hedeflerin hepsine Bugün’den ≤ 2 dokunuşla ulaşılır (tablo güdümlü)', () => {
  for (const [label, max, re] of TABLE) {
    const at1 = level1.some((c) => re.test(c));
    const at2 = at1 || level2.some((c) => re.test(c));
    const used = at1 ? 1 : (at2 ? 2 : 99);
    assert.ok(used <= max, `${label}: ${used === 99 ? 'ulaşılamadı' : used + ' dokunuş'} (hedef ≤ ${max})`);
  }
});

check('Kütüphane keşfi tek alt sayfada toplanır', () => {
  const labels = labelsIn(lib.html);
  for (const label of ['Kısa sûreler', 'Günün âyeti', 'Namazda ne diyorum', 'Telaffuz stüdyosu', 'Seviye 0 · Harfler', 'Gramer notları', 'Kök aileleri']) {
    assert.ok(labels.includes(label), 'Kütüphane satırı: ' + label);
  }
});
check('İlerleme ve Ayarlar Kütüphane’den erişilir', () => {
  const labels = labelsIn(lib.html);
  assert.ok(labels.includes('İlerleme') && labels.includes('Ayarlar'));
});
check('yeni App.kao* handler eklenmedi (45 sabit)', () => {
  const src = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
  const assigned = new Set([...src.matchAll(/App\.(kao[A-Za-z0-9]+) *= *function/g)].map((m) => m[1]));
  assert.equal(assigned.size, 45, 'App.kao* sayısı 45 olmalı (' + assigned.size + ')');
});

console.log(`test_k3p_today: ${passed} kontrol PASS`);
