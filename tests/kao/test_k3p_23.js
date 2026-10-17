'use strict';
// K3P-23 · Okuyucu: senkron yaldız ve "Kartlarıma ekle". Sentetik node:vm; ağ, tarayıcı, depo yok.
// Ölçülenler:
//   1) YALDIZ (yalnız CSS): çalan kelime (`aria-current="true"`) altın halkayla (--quran-gold) gösterilir;
//      kural yalnız renk/çerçeve taşır. Halka gerçek dokunma yolunu bozmaz (kelime çipi hâlâ tek tıklama).
//      Hareket azaltmada halka kalır ama geçiş/animasyon kapanır (M7 uyumu).
//   2) KARTLARIMA EKLE: açılan anlam balonunda "Kartlarıma ekle" düğmesi `App.kaoReader('add', index)`
//      çağırır (yeni App.kao* handler YOK — mevcut çoğaltıcıya eylem).
//   3) ŞEMA: eklenen kart `kaoLessonMarkIntro` ile AYNI şemayı taşır (state:'new' + introducedAt, reps:0) —
//      yeni alan uydurulmaz; `test_kao2_migration` şemayı ayrıca denetler.
//   4) İDEMPOTENT: iki kez eklemek TEK kart üretir ve ikinci çağrı yeni alan/isim yazmaz.
//   5) DURUM: lemma kartlarındaysa düğme "Kartlarında var" olur ve DEVRE DIŞIDIR (tekrar eklenmez).
//   6) DOĞRULANMAMIŞ: `lemma.verified !== true` ise ekleme yapılmaz.
//   7) AYRIŞMA: okurken anlam açmak (`readerUnknown`, state:'learning') ekleme sayılmaz; ekleme ondan AYRI bir
//      bilinçli yoldur (state:'new'). Mevcut `readerUnknown` davranışı bu kartta değişmez.
//   8) YÜZEY: `App.kao*` sayısı 45 kalır.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { bootKao, openView, freshUser } = require('./helpers/kao-harness');

const repoRoot = require('../repo-root');
const kaoCss = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
const styles = fs.readFileSync(path.join(repoRoot, 'app/styles.css'), 'utf8');
const engine = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

// --- renk matematiği (WCAG) — token değerleri CSS'ten okunur, sabitlenmez ---
const channel = (v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const ratio = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const themeBlock = () => { const i = styles.indexOf('#root[data-theme="dark"]'); return { light: styles.slice(0, i), dark: styles.slice(i) }; };
const token = (block, name) => { const m = block.match(new RegExp(`--${name}\\s*:\\s*([^;}]+)`)); return m ? m[1].trim() : null; };

const readerIndex = (t, sid, i) => {
  t.ui.kaoSurahId = sid;
  t.api.kaoSetView('reader');
  return i;
};
const panelHtml = (t) => t.api.kaoReaderHTML();
const openWord = (t, index) => { assert.equal(t.api.kaoReader('word', index), true, 'kelime açılmalı'); return panelHtml(t); };
const cardOf = (t, lemmaId) => t.data.quranLearn.cards[`w:${lemmaId}:ar>tr`];
const wordAt = (t, sid, index) => t.win.QuranShortSurahsV1.words.filter((w) => w.surahId === sid).sort((a, b) => a.ayah - b.ayah || a.i - b.i)[index];

// ---- (1) Senkron yaldız: yalnız CSS, çalan kelime altın halkalı --------------
const RING_SEL = '.kao-reader-word[aria-current="true"]>button:first-child';
// Aynı seçici iki yerde geçer (gerçek halka kuralı + reduce kuralı); halka kuralını `outline` ile ayırırız.
const ringRule = (css) => [...css.matchAll(new RegExp(`\\${RING_SEL.replace(/[[\]"]/g, (c) => '\\' + c)}\\{([^}]*)\\}`, 'g'))]
  .map((m) => m[1]).find((body) => /outline\s*:/.test(body)) || null;

check('çalan kelime altın halkayla gösterilir (yalnız CSS, --quran-gold)', () => {
  const body = ringRule(kaoCss);
  assert.ok(body, 'çalan kelime halka kuralı var');
  assert.match(body, /outline:\s*2px solid var\(--quran-gold\)/, 'altın halka');
  assert.match(body, /outline-offset:\s*2px/, 'halka içerikten ayrılır');
  // Yaldız yalnız çalarken görünür; `aria-current` işareti motorda zaten var.
  assert.match(engine, /\(index===playing\?' aria-current="true"':''\)/, 'çalan kelime işaretlenir (motor)');
});

check('yaldız halkası metin/kenarlık rengini bozmaz (yalnız çerçeve)', () => {
  const css = kaoCss.replace(/\/\*[\s\S]*?\*\//g, '');
  const body = ringRule(css);
  assert.ok(body, 'halka kuralı var');
  assert.doesNotMatch(body, /(?:^|;)\s*color\s*:/, 'halka kuralı metin rengi yazmaz');
  assert.doesNotMatch(body, /(?:^|;)\s*background\s*:/, 'halka kuralı zemin yazmaz (kelime çipi korunur)');
});

check('yaldız tokenı her iki temada okunur kontrast verir (ölçülmüş)', () => {
  const { light, dark } = themeBlock();
  const pairs = [
    ['açık tema', token(light, 'quran-gold'), token(light, 'quran-surface')],
    ['koyu tema', token(dark, 'quran-gold'), token(dark, 'quran-surface')]
  ];
  for (const [label, gold, surface] of pairs) {
    assert.ok(/^#[0-9a-fA-F]{6}$/.test(gold), `${label}: --quran-gold hex değil`);
    assert.ok(/^#[0-9a-fA-F]{6}$/.test(surface), `${label}: --quran-surface hex değil`);
    // WCAG 1.4.11: arayüz bileşeni (çerçeve) ≥ 3:1.
    assert.ok(ratio(hex(gold), hex(surface)) >= 3, `${label}: altın halka zemine karşı ≥3:1 olmalı`);
  }
});

// ---- (2) Hareket azaltma: yalnız renk değişir, animasyon/geçiş kapanır -------
check('hareket azaltmada yaldız halkası kalır ama animasyon/geçiş kapanır (M7)', () => {
  const scannable = kaoCss.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@font-face\{[^{}]*\}/g, '');
  const reduceSelectors = new Set();
  for (const m of scannable.matchAll(/@media\s*\(prefers-reduced-motion:\s*reduce\)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g)) {
    for (const r of m[1].matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (/(?:^|;)\s*(?:animation|transition)\s*:\s*none/.test(r[2])) r[1].split(',').forEach((s) => reduceSelectors.add(s.trim()));
    }
  }
  const sel = '.kao-reader-word[aria-current="true"]>button:first-child';
  assert.ok(reduceSelectors.has(sel), 'yaldız seçicisi reduce bloğunda kapanmalı');
  // Halka `outline` ile çizilir (renk); animasyon `animation:kao-reader-gild` ile gelir ve reduce'da kapanır.
  const rule = ringRule(scannable.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@font-face\{[^{}]*\}/g, ''));
  assert.ok(rule, 'yaldız halka kuralı var');
  assert.match(rule, /outline:\s*2px solid var\(--quran-gold\)/, 'reduce altında da renk kalır (outline)');
  assert.match(rule, /animation:kao-reader-gild/, 'geçiş animasyonu jetonlarla sınırlı');
  assert.match(scannable, /@keyframes kao-reader-gild\{from\{outline-color:transparent\}\}/, 'animasyon keyframe var');
  // Gerçek hareket taşıyan hiçbir seçici reduce dışında kalmamalı.
  const uncovered = [];
  for (const m of scannable.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
    if (!/(?:^|;)\s*(?:animation|transition)\s*:/.test(m[2])) continue;
    if (/(?:^|;)\s*(?:animation|transition)\s*:\s*none/.test(m[2])) continue;
    for (const s of m[1].split(',').map((x) => x.trim()).filter(Boolean)) if (!reduceSelectors.has(s)) uncovered.push(s);
  }
  assert.ok(!uncovered.includes(sel), 'yaldız seçicisi reduce kapsamı dışında');
});

// ---- (3) "Kartlarıma ekle": balonda eylem, doğru düğme ----------------------
check('anlam balonunda "Kartlarıma ekle" düğmesi App.kaoReader(\'add\', index) çağırır', () => {
  const t = bootKao();
  freshUser(t);
  const index = 0;
  readerIndex(t, 95, index);
  const html = openWord(t, index);
  assert.match(html, /class="kao-reader-panel"/, 'anlam balonu açık');
  assert.match(html, /<button type="button" class="kao-secondary" onclick="App\.kaoReader\('add',0\)">Kartlarıma ekle<\/button>/, 'ekle düğmesi eylemi');
  // Yeni handler yok: aynı eylem adı mevcut çoğaltıcıda.
  assert.match(engine, /if\(action==='add'\) return kaoReaderAdd\(value\)/, 'eylem mevcut kaoReader çoğaltıcısına bağlı');
});

check('"Kartlarıma ekle" kartı ders tanıtımıyla AYNI şemayla yazar (state:\'new\' + introducedAt)', () => {
  const t = bootKao();
  freshUser(t);
  readerIndex(t, 95, 0);
  openWord(t, 0);
  const word = wordAt(t, 95, 0);
  // Okurken anlam açmak (openWord) yarının kuyruğuna ALIR (mevcut tasarım) ama "kartlarıma eklendi" SAYILMAZ.
  const marker = cardOf(t, word.lemmaId);
  assert.ok(marker, 'anlam açmak yarının kuyruğuna alır (mevcut tasarım korunur)');
  assert.equal(marker.readerUnknown, true, 'okuma işareti readerUnknown taşır');
  assert.equal(t.api.kaoReader('add', 0), true, 'ekleme yapılır');
  const card = cardOf(t, word.lemmaId);
  assert.ok(card, 'kart oluştu');
  assert.equal(card.state, 'new', 'state: new (ders tanıtımıyla aynı)');
  assert.equal(card.reps, 0, 'reps: 0');
  assert.ok(typeof card.introducedAt === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(card.introducedAt), 'introducedAt yazıldı');
  // Okurken-anlam (readerUnknown) yoluna ait alanlar bilinçli kartta KALMAZ.
  assert.equal(card.readerUnknown, undefined, 'bilinçli kart readerUnknown taşımaz');
  assert.equal(card.tomorrowReason, undefined, 'bilinçli kart tomorrowReason taşımaz');
  // Yeni alan uydurulmadı: anahtarlar ders tanıtım şemasıyla sınırlı.
  assert.deepEqual(Object.keys(card).sort(), ['due', 'introducedAt', 'l', 'reps', 's', 'state'], 'yalnız ders tanıtım şeması');
});

check('ders tanıtımı ile ekleme AYNI kart kurucusundan geçer (tek kaynak)', () => {
  assert.match(engine, /function kaoNewWordCard\(now\)\{ return \{state:'new',due:now,reps:0,l:0,s:0,introducedAt:now\}; \}/, 'tek kurucu');
  assert.match(engine, /q\.cards\[cardId\]=Object\.assign\(kaoNewWordCard\(nowIso\),card,\{introducedAt:nowIso\}\)/, 'tanıtım kurucuyu kullanır');
  assert.match(engine, /if\(!kaoWordCardGenuine\(card\)\) q\.cards\[cardId\]=kaoNewWordCard\(new Date\(\)\.toISOString\(\)\)/, 'ekleme aynı kurucuyu kullanır');
});

// ---- (4) İdempotent --------------------------------------------------------
check('iki kez eklemek TEK kart üretir; ikinci çağrı yeni alan yazmaz', () => {
  const t = bootKao();
  freshUser(t);
  readerIndex(t, 95, 0);
  openWord(t, 0);
  const word = wordAt(t, 95, 0);
  t.api.kaoReader('add', 0);
  const first = JSON.stringify(cardOf(t, word.lemmaId));
  t.api.kaoReader('add', 0);
  const second = JSON.stringify(cardOf(t, word.lemmaId));
  assert.equal(first, second, 'ikinci çağrı kartı değiştirmez');
  const ids = Object.keys(t.data.quranLearn.cards).filter((id) => id === `w:${word.lemmaId}:ar>tr`);
  assert.equal(ids.length, 1, 'tek kart kimliği');
});

// ---- (5) Zaten kartlarındaysa düğme devre dışı ------------------------------
check('lemma kartlarındaysa düğme "Kartlarında var" olur ve devre dışıdır', () => {
  const t = bootKao();
  const q = freshUser(t);
  const word = wordAt(t, 95, 0);
  q.cards[`w:${word.lemmaId}:ar>tr`] = { state: 'review', s: 30, reps: 5, introducedAt: '2026-09-01T00:00:00.000Z' };
  readerIndex(t, 95, 0);
  const html = openWord(t, 0);
  assert.match(html, /<button type="button" class="kao-secondary" disabled>Kartlarında var<\/button>/, 'devre dışı "Kartlarında var"');
  assert.doesNotMatch(html, /Kartlarıma ekle/, 'ekle düğmesi yok');
  // Devre dışı düğme tıklanamaz (onclick yok).
  const btn = /<button type="button" class="kao-secondary" disabled>Kartlarında var<\/button>/.exec(html)[0];
  assert.doesNotMatch(btn, /onclick=/, 'devre dışı düğmede eylem yok');
});

// ---- (6) Doğrulanmamış lemma eklenemez --------------------------------------
check('doğrulanmamış lemma eklenemez (lemma.verified === true değilse)', () => {
  const t = bootKao();
  freshUser(t);
  // Okuyucu lemmasını geçici olarak doğrulanmamış yap (test kopyası; repo verisi ve donmuş modül değişmez).
  const shorts = t.win.QuranShortSurahsV1;
  const word = wordAt(t, 95, 0);
  const original = shorts.lemmaById(word.lemmaId);
  assert.ok(original && original.verified === true, 'tohum lemma doğrulanmış olmalı');
  const stub = Object.assign({}, original, { verified: false });
  const patched = Object.assign({}, shorts, { lemmaById: (id) => (id === word.lemmaId ? stub : shorts.lemmaById(id)) });
  t.win.QuranShortSurahsV1 = patched;
  readerIndex(t, 95, 0);
  const html = openWord(t, 0);
  assert.doesNotMatch(html, /Kartlarıma ekle/, 'doğrulanmamış lemmada ekle düğmesi çizilmez');
  assert.doesNotMatch(html, /Kartlarında var/, 'kart yokken "var" düğmesi de çizilmez');
  assert.equal(t.api.kaoReader('add', 0), false, 'ekleme reddedilir');
  t.win.QuranShortSurahsV1 = shorts;
  // Panel açmak okuma işareti yazar (readerUnknown); ekleme bunu BİLİNÇLİ karta çevirmez.
  const card = cardOf(t, word.lemmaId);
  assert.equal(card.readerUnknown, true, 'doğrulanmamış lemmada bilinçli kart yazılmaz');
  assert.equal(card.state, 'learning', 'okuma işareti durumu korunur');
});

// ---- (7) Okurken gösterme ≠ kartlarıma ekleme --------------------------------
check('okurken anlam açmak (readerUnknown) ekleme DEĞİLDİR; ekleme ondan ayrıdır', () => {
  const t = bootKao();
  freshUser(t);
  const word = wordAt(t, 95, 0);
  readerIndex(t, 95, 0);
  // Okurken anlam açma yolu: mevcut davranış korunur (learning + readerUnknown) → yarının kuyruğuna alır.
  openWord(t, 0);
  const revealed = cardOf(t, word.lemmaId);
  assert.ok(revealed, 'anlam açmak yarının kuyruğuna alır (mevcut tasarım)');
  assert.equal(revealed.state, 'learning', 'anlam açma learning yazar');
  assert.equal(revealed.readerUnknown, true, 'anlam açma readerUnknown işaretler');
  assert.equal(revealed.tomorrowReason, 'reader_unknown', 'neden yarın');
  // Okuma işareti "kartlarıma eklendi" saymaz → düğme hâlâ "Kartlarıma ekle".
  const html = openWord(t, 0);
  assert.match(html, /Kartlarıma ekle/, 'okuma işareti ekleme sayılmaz (düğme açık)');
  // "Kartlarıma ekle" ayrı yol: bilinçli ekleme ders şemasına geçirir (state:new), readerUnknown temizlenir.
  t.api.kaoReader('add', 0);
  const after = cardOf(t, word.lemmaId);
  assert.equal(after.state, 'new', 'bilinçli ekleme ders şemasına geçirir');
  assert.equal(after.readerUnknown, undefined, 'bilinçli ekleme okuma işaretini temizler');
  // Şimdi düğme "Kartlarında var" ve kapalı.
  const afterHtml = openWord(t, 0);
  assert.match(afterHtml, /Kartlarında var/, 'ekleme sonrası düğme durum değiştirir');
  assert.doesNotMatch(afterHtml, /Kartlarıma ekle/, 'ekle düğmesi kalkar');
});

// ---- (8) Yüzey: yeni handler yok --------------------------------------------
check('yüzey: App.kao* sayısı 45 kalır (yeni handler eklenmedi)', () => {
  const appSrc = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
  const assigned = new Set([...appSrc.matchAll(/App\.(kao[A-Za-z0-9]+) *= *function/g)].map((m) => m[1]));
  assert.equal(assigned.size, 45, `App.kao* 45 kalmalı (ölçülen ${assigned.size})`);
  assert.ok(assigned.has('kaoReader'), 'mevcut çoğaltıcı kullanılır');
});

console.log(`test_k3p_23: PASS (${passed} kontrol — senkron yaldız yalnız CSS + "Kartlarıma ekle", aynı şema, idempotent, doğrulanmamış reddi, 45 yüzey)`);
