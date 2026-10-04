'use strict';

// Görsel QA (modal tarama): ekran görüntüsünde bulunan yerleşim kusurlarının CSS sözleşmesi + ders akışı koruması.
// Sentetik VM; tarayıcı, ağ, gerçek veri yok. Gerçek yerleşimi `kao2-duzeltme/tools/gorsel-qa/audit-modal.mjs` ölçer.
const assert = require('node:assert/strict');
const h = require('./helpers/kao-harness');

const css = h.read('app/kao.css');
const blocks = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selectors: m[1].split(',').map((x) => x.trim()), body: m[2] }));
const rulesFor = (selector) => blocks.filter((rule) => rule.selectors.includes(selector));
const bodyOf = (selector) => rulesFor(selector).map((rule) => rule.body).join(';');
const remValue = (body, prop) => { const m = new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([\\d.]+)rem`).exec(body); return m ? Number(m[1]) : null; };

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

check('(a) yeni kelime kartında Arapça hero: seçici `.kao-lesson-card p` (0,1,1) kuralını yener, boyut clamp ile ≥2,6rem', () => {
  assert.equal(rulesFor('.kao-lesson-ar').length, 0, 'çıplak .kao-lesson-ar (0,1,0) `.kao-lesson-card p` tarafından ezilirdi');
  const body = bodyOf('.kao-lesson-card .kao-lesson-ar');
  assert.match(body, /font-size:clamp\(2\.6rem,12vw,4\.2rem\)/);
  assert.ok(rulesFor('.kao-lesson-card p').some((rule) => /font-size:/.test(rule.body)), 'ezen kural hâlâ var: seçici özgüllüğü gerekli');
});

check('(b) Seviye 0 örnek kelime listesi tam genişlikte; Dinle düğmesi kompakt (kelime kartı sıfıra büzülmez)', () => {
  assert.match(bodyOf('.kao-s0-words'), /(?:^|;)width:100%/);
  const btn = bodyOf('.kao-s0-words li .kao-secondary');
  assert.match(btn, /(?:^|;)width:auto/, '.kao-secondary genel kuralı width:100% — liste satırında ezilmeli');
  assert.ok(Number(/min-width:(\d+)px/.exec(btn)[1]) >= 80);
  assert.match(bodyOf('.kao-s0-words li .kao-s0-word'), /min-width:0/);
});

check('(c) Seviye 0 işaret simgesi ve harf kutuları okunur boyutta', () => {
  assert.ok(remValue(bodyOf('.kao-s0-glyph'), 'font-size') >= 1.75, 'işaret simgesi ≥1,75rem');
  assert.match(bodyOf('.kao-s0-letters li'), /font-size:var\(--f-large\)/);
  assert.match(bodyOf('.kao-s0-letters li'), /min-height:56px/);
});

check('(d) ünite ilerleme kutusu: eski ince çubuk kuralı (height:5px + overflow:hidden) kalmadı, kutu büzülmez', () => {
  const rules = rulesFor('.kao-unit-progress');
  assert.ok(rules.some((rule) => /(?:^|;)display:flex/.test(rule.body)), 'ünite ilerleme kutusu satır düzeni');
  for (const rule of rules) assert.doesNotMatch(rule.body, /(?:^|;)\s*(?:height|overflow)\s*:/, 'hiçbir .kao-unit-progress kuralı height/overflow taşımaz');
  assert.equal(rulesFor('.kao-unit-progress i').length, 0, 'eski iç çubuk kuralı da yok');
});

check('(e) kelime detayı kök harfleri ve namaz kelime hedefi okunur/dokunulur', () => {
  assert.match(bodyOf('.kao-root-pair .kao-arabic-text'), /font-size:var\(--f-title1\)/);
  assert.match(bodyOf('.kao-prayer-word'), /min-width:44px;min-height:44px/);
  assert.ok(Number(/min-width:(\d+)px/.exec(bodyOf('.kao-path-unit-index'))[1]) >= 56, '"Ünite 12" rozeti');
});

check('(f) NavBar başlıkları kısa: "‹ Kur’an Arapçası" geri etiketi uzun başlıkla iki satıra bölünmez', () => {
  const t = h.bootKao();
  for (const [view, expected] of [['prayer', 'Namaz'], ['sources', 'Hakkında']]) {
    assert.equal(t.api.kaoNav(view), true, view);
    const html = t.api.kaoOverlayHTML(new Date('2026-09-28T09:00:00'));
    assert.ok(html.includes(`class="kao-navbar-title" title="${expected}">${expected}</`), `${view}: NavBar başlığı ${expected}`);
    t.api.kaoSetView('home');
  }
});

check('(g) 109 dersin hiçbirinde ardışık aynı kart, aynı soru ya da aynı gramer türü yok (doğru cevapla hepsi, yanlış cevapla ünite başı dersleri; K4-04 "Ek çöz ×2")', () => {
  const lessonIds = h.bootKao().win.QuranCurriculumV2.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id));
  assert.equal(lessonIds.length, 109);
  let tasks = 0;
  // Doğru cevapla 109 dersin tamamı; yanlış cevapla (tekrar kuyruğu) her ünitenin ilk dersi — süreyi ~yarıya indirir.
  const firstOfUnit = h.bootKao().win.QuranCurriculumV2.units.map((unit) => unit.lessons[0].id);
  for (const answer of ['correct', 'wrong']) {
    for (const id of answer === 'correct' ? lessonIds : firstOfUnit) {
      const t = h.bootKao(), seq = [];
      assert.equal(h.walkLesson(t, id, { answer, visit: (task) => seq.push({ card: task.cardId, type: task.type, grammarType: task.grammarType, shown: `${task.prompt}|${task.stimulus}|${task.answer}` }) }), true, `${id} oynandı`);
      tasks += seq.length;
      for (let i = 1; i < seq.length; i += 1) {
        const where = `${id} (${answer}) görev ${i + 1}`;
        assert.notEqual(seq[i].card, seq[i - 1].card, `${where}: aynı kart ardışık`);
        assert.notEqual(seq[i].shown, seq[i - 1].shown, `${where}: aynı soru ardışık`);
        if (seq[i].type === 'grammar' && seq[i - 1].type === 'grammar') assert.notEqual(seq[i].grammarType, seq[i - 1].grammarType, `${where}: aynı gramer türü ardışık`);
      }
    }
  }
  assert.ok(tasks > 1200, `yeterli görev yürüdü (${tasks})`);
});

check('(h) 114 sûre ısı haritası: 320 px\'te de hücre ≥44 px (sabit 6 sütun 40 px\'e düşüyordu)', () => {
  const grid = bodyOf('.kao-map-grid');
  assert.match(grid, /grid-template-columns:repeat\(auto-fill,minmax\(44px,1fr\)\)/);
  assert.doesNotMatch(grid, /repeat\(6,/);
});

check('(i) halka boyutu yazı boyutuyla ölçeklenir (rem): %200 yazıda "%20" halkadan taşmaz', () => {
  for (const [size, rem] of [[28, '1.75rem'], [44, '2.75rem'], [64, '4rem']]) {
    const body = bodyOf(`.kao-progress-ring-${size}`);
    assert.match(body, new RegExp(`width:${rem};height:${rem}`), `halka ${size}`);
  }
  assert.doesNotMatch(css, /\.kao-progress-ring-svg\{[^}]*(?:width|height):\d+px/);
});

check('(j) dar ekran / büyük yazıda NavBar geri etiketi sarmaz: ≤23rem\'de yan sütunlar içeriğe göre (taban simetri sözleşmesi korunur)', () => {
  assert.match(bodyOf('.kao-navbar'), /grid-template-columns:minmax\(0,1fr\) minmax\(0,auto\) minmax\(0,1fr\)/, 'taban sözleşme değişmedi');
  const m = /@media\(max-width:23rem\)\{\.kao-navbar\{grid-template-columns:minmax\(0,auto\) minmax\(0,1fr\) minmax\(0,auto\)\}\}/.exec(css);
  assert.ok(m, 'dar ekran NavBar kuralı');
  assert.doesNotMatch(bodyOf('.kao-navbar') + bodyOf('.kao-navbar-action') + bodyOf('.kao-navbar-title'), /white-space:nowrap/, 'NavBar metni tek satıra zorlanmaz (genel yasak test_kao_render\'da)');
});

check('(k) Seviye 0 alıştırmada Arapça şık harfleri okunur boyutta (öğrenilen içerik düğme metninden küçük kalmaz)', () => {
  const body = bodyOf('.kao-s0-choice [lang="ar"]');
  assert.match(body, /font-size:var\(--f-title1\)/);
  assert.match(body, /line-height:1\.4/);
});

check('(l) Seviye 0 örnek/okuma kelimeleri ve harf konum biçimleri okunur boyutta', () => {
  assert.match(bodyOf('.kao-s0-word span'), /font-size:var\(--f-title1\)/);
  assert.match(bodyOf('.kao-s0-word span'), /line-height:1\.6/);
  assert.ok(rulesFor('.kao-s0-pos-row li b').some((rule) => /font-size:var\(--f-title1\)/.test(rule.body)), '2×2 "aynı harf dört yerde" biçimleri');
  assert.match(css, /\.kao-s0-pos-row li b\{font-size:var\(--f-title2\)\}/, '28 harf tablosu (4 sütun) biçimleri');
  assert.doesNotMatch(css, /\.kao-s0-pos-row li b\{font-size:var\(--f-title3\)\}/, 'eski küçük boyut kalmadı');
});

check('(m) Kavram tablolarında Arapça hücre lang="ar" dir="rtl" taşır ve okunur boyutta (düz <td> değil)', () => {
  const t = h.bootKao();
  assert.equal(t.api.kaoLesson('start', 'u02.01'), true);
  assert.equal(h.playLesson(t, { stopAt: 'concept' }), true);
  const html = t.api.kaoOverlayHTML(new Date('2026-09-28T09:00:00')), tables = html.match(/<table class="kao-lesson-table">[\s\S]*?<\/table>/g) || [];
  assert.equal(tables.length, 1, 'kavram tablosu çizildi');
  const arabic = /[\u0600-\u06FF]/, cells = tables[0].match(/<td[^>]*>[^<]*<\/td>/g) || [];
  const arCells = cells.filter((cell) => arabic.test(cell));
  assert.ok(arCells.length >= 3, `Arapça hücre sayısı ${arCells.length}`);
  assert.ok(arCells.every((cell) => /^<td lang="ar" dir="rtl" class="kao-lesson-ar-cell">/.test(cell)), 'her Arapça hücre lang/dir/sınıf taşır');
  assert.equal(cells.filter((cell) => !arabic.test(cell) && /lang="ar"/.test(cell)).length, 0, 'Arapça olmayan hücre ar etiketi almaz');
  assert.match(bodyOf('.kao-lesson-ar-cell'), /font-size:var\(--f-title3\)/);
});

console.log(`KAO modal yerleşim: PASS (${passed} kontrol)`);
