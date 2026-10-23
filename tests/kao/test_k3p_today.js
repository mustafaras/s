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

// ══ K3PD-22 · Açılıştan ilk göreve iki dokunuş ════════════════════════════════════════════════
// Ölçüm GERÇEK kullanıcı eylemlerini sayar: hub açılışı (1) + Bugün birincil CTA (1) = 2.
// Başlangıç dokunuşu ve hedef görünürlüğü sayaçtan ÇIKARILMAZ (hard stop).
const { freshUser } = require('./helpers/kao-harness');

function openToFirstTask() {
  const t = bootKao({ seeded: true });
  t.ui.kaoStack = [];
  t.api.kaoOpen('home');            // 1. dokunuş: hub açılışı
  const hero = t.api.kaoOverlayHTML(t.NOW);
  // CTA markup'ı HTML-kaçışlı gelir: App.kaoLesson(&quot;start&quot;,&quot;u01.01&quot;,&quot;h&quot;)
  const primary = /App\.kaoLesson\(&quot;start&quot;,&quot;([^&]+)&quot;,&quot;h&quot;\)/.exec(hero)
    || /App\.kaoLesson\('start','([^']+)','h'\)/.exec(hero);
  return { t, hero, primary };
}

check('K3PD-22 açılış → ilk cevaplanabilir görev ≤2 dokunuş', () => {
  const { t, primary } = openToFirstTask();
  assert.ok(primary, 'Bugün birincil CTA ana-ekran modunu (h) kullanmıyor');
  // 2. dokunuş: birincil CTA
  assert.equal(t.api.kaoLesson('start', primary[1], 'h'), true, 'CTA dersi başlatmalı');
  const state = t.ui.kaoLesson;
  assert.ok(state, 'ders durumu yok');
  const item = state.plan[state.at];
  assert.ok(['practice', 'review'].includes(state.phase) || ['intro', 'concept'].includes(item.kind),
    `ilk görev/öğretim adımına ulaşılmadı (phase=${state.phase}, kind=${item.kind})`);
  // Goal ekranı ATLANDI: plan[0] hedef öğesidir (goal/partGoal) ve state.at onu geçmiş olmalı.
  // (K3PD-22 regresyonu: yalnız 'goal' aranınca 'partGoal' planlarında atlama sessizce çalışmıyordu.)
  assert.ok(['goal', 'partGoal'].includes(state.plan[0].kind), `plan[0] hedef değil: ${state.plan[0].kind}`);
  assert.equal(state.at, 1, `hedef ekranı atlanmadı (at=${state.at})`);
  assert.equal(item.kind, 'practice', `ilk cevaplanabilir görev practice olmalı, ${item.kind} geldi`);
});

check('K3PD-22 hedef sunumu KORUNUR: Bugün hero’su ders + âyet satırı + görev sayısını gösterir', () => {
  const { hero } = openToFirstTask();
  assert.match(hero, /kao-today-title/, 'hero ders başlığı yok');
  assert.match(hero, /kao-tezhip-word/, 'hero âyet satırı (Tezhip) yok');
  assert.match(hero, /görev/, 'hero görev sayısı yok');
  // Aynı ders ve aynı satır: hero'daki Tezhip satırı dersin goal satırıyla aynı kaynaktan gelir.
  const t = bootKao({ seeded: true });
  t.ui.kaoStack = [];
  t.api.kaoOpen('home');
  const heroHtml = t.api.kaoOverlayHTML(t.NOW);
  const heroWords = [...heroHtml.matchAll(/class="kao-tezhip-word[^"]*"[^>]*aria-label="([^,]+),/g)].map((m) => m[1]);
  assert.ok(heroWords.length > 0, 'hero satırı kelime taşımıyor');
  t.api.kaoLesson('start', 'u01.01');
  const goalHtml = t.api.kaoOverlayHTML(t.NOW);
  const goalWords = [...goalHtml.matchAll(/class="kao-tezhip-word[^"]*"[^>]*aria-label="([^,]+),/g)].map((m) => m[1]);
  // Hero, dersin satırını KAPSAR (sûrenin tamamını gösterir; dersin hedef kelimeleri içinde).
  // Kart "öğrenilecek kelimeleri gerçekten önceden gösterdiğini kanıtla" diyor: kapsama yeterli.
  const missing = goalWords.filter((w) => !heroWords.includes(w));
  assert.deepEqual(missing, [], `hero dersin kelimelerini göstermiyor: ${missing.join(', ')}`);
  assert.ok(heroWords.length >= goalWords.length, 'hero satırı dersin satırından kısa olmamalı');
});

check('K3PD-22 resume bozulmaz: from-home olmadan yeniden başlatma aynı adıma döner', () => {
  const t = bootKao({ seeded: true });
  assert.equal(t.api.kaoLesson('start', 'u01.02'), true);
  t.api.kaoLesson('next');
  t.api.kaoLesson('next');
  const at = t.ui.kaoLesson.at;
  t.api.kaoLesson('exit');
  assert.equal(t.api.kaoLesson('start', 'u01.02'), true, 'yeniden başlatma');
  assert.equal(t.ui.kaoLesson.at, at, 'resume aynı adıma dönmeli');
});

check('K3PD-22 yarıda kalan ders ana ekrandan AYNI göreve döner (partGoal planı)', () => {
  // K3PD-22 regresyonu: kısmi ilerlemeden sonra plan yeniden kurulur ve plan[0] 'partGoal' olur.
  // Yalnız 'goal' aranınca atlama sessizce çalışmıyor, kullanıcı hedef ekranına geri düşüyordu.
  const t = bootKao({ seeded: true });
  t.ui.kaoStack = [];
  t.api.kaoOpen('home');
  assert.equal(t.api.kaoLesson('start', 'u01.01', 'h'), true);
  let done = 0;
  for (let g = 0; g < 200 && t.ui.kaoLesson && done < 8; g += 1) {
    if (t.ui.kaoLesson.phase === 'practice') {
      const task = t.ui.kaoTasks[t.ui.kaoQueue[t.ui.kaoTaskIndex].id];
      t.api.kaoAnswer(task.id, task.choices.find((c) => c.correct === true).id);
      t.api.kaoContinue();
      done += 1;
    } else t.api.kaoLesson('next');
  }
  const pending = t.ui.kaoQueue[t.ui.kaoTaskIndex].id;
  t.api.kaoLesson('exit');
  for (const k of Object.keys(t.ui)) delete t.ui[k];
  Object.assign(t.ui, { kaoOpen: false, kaoView: 'home', kaoStack: [] });
  t.api.kaoOpen('home');
  const hero = t.api.kaoOverlayHTML(t.NOW);
  const primary = /App\.kaoLesson\(&quot;start&quot;,&quot;([^&]+)&quot;,&quot;h&quot;\)/.exec(hero);
  assert.ok(primary, 'yeniden açılışta ana-ekran CTA yok');
  assert.equal(t.api.kaoLesson('start', primary[1], 'h'), true);
  const state = t.ui.kaoLesson;
  assert.ok(['goal', 'partGoal'].includes(state.plan[0].kind), `plan[0] hedef değil: ${state.plan[0].kind}`);
  assert.equal(state.at, 1, `hedef ekranı atlanmadı (at=${state.at})`);
  assert.equal(state.phase, 'practice', `göreve dönülmedi (phase=${state.phase})`);
  assert.equal(t.ui.kaoQueue[t.ui.kaoTaskIndex].id, pending, 'aynı göreve dönülmedi');
});

check('K3PD-22 mastery/repair rotaları bozulmaz', () => {
  const t = bootKao({ seeded: true });
  assert.equal(t.api.kaoLesson('start', '1'), true, 'ünite kimliği ustalık başlatmalı');
  assert.equal(t.ui.kaoLesson.kind, 'mastery', 'ustalık oturumu değil');
});

check('K3PD-22 onboarding/kilitli kullanıcı normal davranışı korunur', () => {
  const t = bootKao(); // onboarding bitmemiş
  t.ui.kaoStack = [];
  t.api.kaoOpen('home');
  const html = t.api.kaoOverlayHTML(t.NOW);
  // Onboarding bitmemişse hero "Başlayalım" (kaoOnboard) sunar; from-home ders CTA'sı YOK.
  assert.match(html, /kaoOnboard/, 'onboarding CTA yok');
  assert.doesNotMatch(html, /kaoLesson\(&quot;start&quot;,&quot;[^&]+&quot;,&quot;h&quot;\)/, 'onboarding bitmemişken ders CTA’sı sunulmamalı');
});

check('K3PD-22 Bugün ≤5 seçenek ve birincil CTA tek', () => {
  const { hero } = openToFirstTask();
  const screen = (/<main class="kao-today-screen[\s\S]*?<\/main>/.exec(hero) || [''])[0];
  const buttons = (screen.match(/<button/g) || []).length;
  assert.ok(buttons <= 5, `Bugün ekranında ${buttons} düğme (>5)`);
  const primaries = (screen.match(/class="kao-primary/g) || []).length;
  assert.equal(primaries, 1, `birincil CTA ${primaries} (tek olmalı)`);
});

console.log(`test_k3p_today: ${passed} kontrol PASS`);
