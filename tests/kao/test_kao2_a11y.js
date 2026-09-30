'use strict';

// KAO2-26 · Erişilebilirlik ve kontrast denetimi (06 §6, §7 · 02 T-24…T-26).
// Sentetik VM; ağ, tarayıcı, gerçek kullanıcı verisi yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const repoRoot = require('../repo-root');

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const decode = (h) => h.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');
const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1', 'quranMahrecSchemasV1',
  'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];

// 06 §6: modal içinde odak döngüsü + Escape; kapanışta tetikleyiciye dönüş.
function boot({ seeded = false } = {}) {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const n of CONTENT) vm.runInContext(read(`app/content/${n}.js`), box, { filename: n });
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(read(f), box, { filename: f });
  }
  const data = { settings: {}, days: {}, quranLearn: null, lastOpenedDate: '2026-09-30' };
  const ui = { kaoOpen: true, kaoView: 'home', kaoStack: [] };
  const calls = { lock: 0, unlock: 0, focus: [], restore: [], mount: 0 };
  const api = box.window.SeymaQuranLearn;
  api.registerQuranLearn({ data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-30', esc, icon: () => '', getDay: () => ({}) });
  api.registerQuranLearnSurface({
    toast() {}, isQuietTime: false, mount() { calls.mount += 1; },
    lockBody() { calls.lock += 1; }, unlockBody() { calls.unlock += 1; },
    focusDialog(id) { calls.focus.push(id); }, restoreFocus(id) { calls.restore.push(id); },
    activeElementId: () => 'kao-hub-entry', sheetClose(e, bk, done) { calls.sheet = [e, bk]; done && done(); },
    taskElement: () => null
  });
  const q = api.ensureQuranLearn(data);
  q.onboarding.doneAt = '2026-09-20T00:00:00.000Z';
  if (seeded) {
    const lemmas = box.window.QuranLexiconV1.lemmas;
    for (const lemma of lemmas.slice(0, 20)) for (const dir of ['ar>tr', 'tr>ar']) q.cards[`w:${lemma.id}:${dir}`] = { state: 'review', s: 40, reps: 6 };
    q.daily['2026-09-29'] = { answered: 12, correct: 10, new: 4, reviewed: 8 };
    q.milestones.half = '2026-09-28T10:00:00.000Z';
  }
  return { api, box, data, ui, q, calls, NOW: '2026-09-30T12:00:00.000Z' };
}

const VIEWS = ['home', 'units', 'word', 'reader', 'settings', 'gate', 'phonics', 'ayah', 'prayer', 'stats', 'grammar', 'roots', 's0', 'sources', 'sources'];

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

// ---- (1) Her düğme erişilebilir ada sahip ------------------------------
check('tüm görünümlerde her düğme erişilebilir ada sahip (boş + tohumlu)', () => {
  for (const seeded of [false, true]) {
    const t = boot({ seeded });
    for (const view of VIEWS) {
      t.ui.kaoOpen = true; t.ui.kaoView = view;
      let html;
      if (view === 'word') { t.ui.kaoWordId = t.box.window.QuranLexiconV1.lemmas[0].id; html = t.api.kaoWordHTML(); }
      else if (view === 'reader') { t.ui.kaoSurahId = 112; html = t.api.kaoReaderHTML(); }
      else if (view === 'grammar') { html = t.api.kaoOverlayHTML(t.NOW); }
      else { html = t.api.kaoOverlayHTML(t.NOW); }
      const buttons = [...decode(html).matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)].map((m) => m[0]);
      assert.ok(buttons.length > 0, `${view}/${seeded}: düğme yok`);
      for (const button of buttons) {
        const open = button.match(/<button\b[^>]*>/)[0];
        const inner = button.replace(/<button\b[^>]*>/, '').replace(/<\/button>$/, '').replace(/<[^>]+>/g, '').trim();
        const named = /aria-label="[^"]+"/.test(open) || /aria-labelledby="[^"]+"/.test(open) || inner.length > 0;
        assert.ok(named, `${view}/${seeded}: adsız düğme → ${open.slice(0, 110)}`);
      }
    }
  }
});

// ---- (2) Modal odak sözleşmesi ----------------------------------------
check('modal açılışı: gövde kilitlenir, odak diyaloğa gider; kapanışta tetikleyiciye döner', () => {
  const t = boot();
  t.ui.kaoOpen = false;
  assert.equal(t.api.kaoOpen('home'), true);
  assert.equal(t.calls.lock, 1, 'lockBody çağrılmadı');
  assert.deepEqual(t.calls.focus, ['sey-ov-card'], 'odak diyaloğa gitmedi');
  assert.equal(t.ui.kaoReturnFocusId, 'kao-hub-entry', 'dönüş kimliği kaydedilmedi');
  assert.equal(t.api.kaoClose(), true);
  assert.deepEqual(t.calls.sheet, ['sey-ov-card', 'sey-ov-back'], 'sheetClose sözleşmesi bozuk');
  assert.equal(t.calls.unlock, 1, 'unlockBody çağrılmadı');
  assert.deepEqual(t.calls.restore, ['kao-hub-entry'], 'tetikleyiciye dönülmedi');
});

check('diyalog kabuğu role=dialog aria-modal taşır; arka plan odaklanabilir değil', () => {
  const t = boot();
  const html = decode(t.api.kaoOverlayHTML(t.NOW));
  assert.match(html, /role="dialog"/, 'role=dialog yok');
  assert.match(html, /aria-modal="true"/, 'aria-modal yok');
  // Backdrop odaklanabilir OLMAMALI (CLAUDE.md modal klavye sözleşmesi).
  const backdrop = html.match(/<[^>]*class="[^"]*sey-ov-back[^"]*"[^>]*>/g) || [];
  for (const tag of backdrop) {
    assert.doesNotMatch(tag, /role="button"/, 'backdrop role=button olamaz');
    assert.doesNotMatch(tag, /tabindex="0"/, 'backdrop odaklanabilir olamaz');
  }
});

// ---- (3) Görünüm değişince odak başlığa -------------------------------
check('görünüm değişiminde odak hedefi belirlenir (LargeTitle ya da soru)', () => {
  const t = boot();
  for (const view of ['home', 'units', 'stats', 'settings']) {
    t.ui.kaoView = view;
    const html = decode(t.api.kaoOverlayHTML(t.NOW));
    assert.match(html, /class="kao-largetitle"/, `${view}: LargeTitle yok`);
  }
  // Odak modunda (ders oynatıcı) soru odak hedefidir.
  assert.match(read('app/core/quranLearn.js'), /focusDialog|kaoFocusTarget|data-kao-focus/, 'odak hedefi kancası yok');
});

// ---- (4) aria-live yalnız panel ve özette -----------------------------
check('aria-live yalnız geri bildirim panelinde ve özet ekranında', () => {
  const t = boot();
  const live = (html) => [...html.matchAll(/aria-live="([a-z]+)"/g)].map((m) => m[1]);
  t.ui.kaoView = 'home';
  const home = decode(t.api.kaoOverlayHTML(t.NOW));
  assert.deepEqual(live(home), [], `ana ekranda aria-live olmamalı: ${live(home).join(',')}`);
  const source = read('app/core/quranLearn.js');
  const levels = [...source.matchAll(/aria-live="([a-z]+)"/g)].map((m) => m[1]);
  assert.ok(levels.length > 0, 'hiç canlı bölge yok');
  assert.ok(levels.every((level) => level === 'polite'), `canlı bölge "polite" olmalı (kesici assertive yasak): ${[...new Set(levels)].join(',')}`);
  // Geri bildirim panelinde canlı bölge şart (06 §6).
  assert.match(source, /kao-panel[^>]*aria-live|aria-live[^>]*kao-panel|class="kao-live" aria-live/, 'geri bildirim panelinde aria-live yok');
  // Canlı bölge yalnız metin taşımalı (düğme/içerik karışmasın).
  for (const match of source.matchAll(/aria-live="polite"[^>]*>[^<]*</g)) assert.ok(match[0].length < 300, 'canlı bölge aşırı büyük');
});

// ---- (5) aria-current="step" StepList ve Yol --------------------------
check('aria-current="step" yalnız StepList ve Yol akışında kullanılır', () => {
  const t = boot({ seeded: true });
  t.ui.kaoView = 'units';
  const path = decode(t.api.kaoOverlayHTML(t.NOW));
  const units = [...path.matchAll(/aria-current="step"/g)].length;
  assert.ok(units <= 1, `Yol'da en çok bir adım işaretlenmeli: ${units}`);
  const source = read('app/core/quranLearnViews.js');
  assert.match(source, /aria-current="step"/, 'StepList aria-current taşımıyor');
});

// ---- (6) Arapça öğeler lang/dir --------------------------------------
check('tüm Arapça metin öğeleri lang="ar" dir="rtl" taşır', () => {
  const t = boot({ seeded: true });
  const checked = [];
  for (const [label, html] of [
    ['home', t.api.kaoOverlayHTML(t.NOW)],
    ['word', (t.ui.kaoWordId = t.box.window.QuranLexiconV1.lemmas[0].id, t.api.kaoWordHTML())],
    ['reader', (t.ui.kaoSurahId = 112, t.api.kaoReaderHTML())]
  ]) {
    const text = decode(html);
    // Arapça blokları: içinde Arabic harfi geçen etiketler lang="ar" taşımalı.
    for (const match of text.matchAll(/<(p|span|h1|h2|h3|li|div)([^>]*)>([^<]*[\u0600-\u06FF][^<]*)</g)) {
      const attrs = match[2], inner = match[3];
      if (!/[\u0600-\u06FF]/.test(inner)) continue;
      checked.push(label);
      assert.match(attrs, /lang="ar"/, `${label}: Arapça blok lang="ar" taşımıyor → ${match[0].slice(0, 110)}`);
      assert.match(attrs, /dir="rtl"/, `${label}: Arapça blok dir="rtl" taşımıyor → ${match[0].slice(0, 110)}`);
    }
  }
  assert.ok(checked.length >= 2, `Arapça blok taranmadı (${checked.length})`);
});

// ---- (7) Sabit px yükseklik yok (min-height kullanılır) ---------------
// Kural (06 §6): METİN taşıyan denetimler sabit yükseklik kullanamaz — dinamik metin
// %200'de kırpılır. Boyutlu İÇERİK (çubuk, nokta, ikon, svg, diyalog kabuğu) sabit
// yükseklik taşıyabilir; ikisi karıştırılmamalı.
// Boyutlu İÇERİK seçicileri (çubuk, nokta, ilerleme, ikon, svg, halka, mühür, diyalog
// kabuğu, işaret): sabit yükseklik meşru. Ölçek dışı metin denetimleri değildir.
const SIZED_CONTENT = /(?:bar|dot|progress|legend|icon|svg|ring|seal|dialog|mark|chip|path)/;
check('metin taşıyan KAO denetimleri sabit px yükseklik kullanmaz', () => {
  const css = read('app/kao.css');
  const bad = [];
  for (const match of css.matchAll(/([^{}]*)\{([^}]*)\}/g)) {
    const selector = match[1].trim(), body = match[2];
    for (const decl of body.matchAll(/(?:^|;)\s*height\s*:\s*([^;}]+)/g)) {
      const value = decl[1].trim();
      if (/^(auto|100%|100dvh|inherit|unset|initial)$/.test(value)) continue;
      if (/var\(/.test(value)) continue;
      if (SIZED_CONTENT.test(selector)) continue; // boyutlu içerik: sabit yükseklik meşru
      bad.push(`${selector} { height: ${value} }`);
    }
  }
  assert.deepEqual(bad, [], `metin denetiminde sabit px yükseklik: ${bad.slice(0, 4).join(' | ')}`);
  // Ters yön de doğrulanmalı: metin denetimleri min-height kullanıyor.
  const textControls = ['.kao-live', '.kao-back', '.kao-primary', '.kao-secondary', '.kao-choices button', '.kao-hub-card'];
  for (const sel of textControls) {
    const block = css.match(new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(' ', '\\s*') + '\\{([^}]*)\\}'));
    if (!block) continue;
    assert.ok(!/(?<!min-)height\s*:/.test(block[1]), `${sel}: metin denetimi sabit yükseklik taşıyor`);
  }
});

// ---- (8) Kontrast: araç PASS ------------------------------------------
check('kontrast aracı tüm token çiftlerinde eşiği geçer', () => {
  const out = execFileSync(process.execPath, [path.join(repoRoot, 'docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs'), '--json'], { encoding: 'utf8' });
  const report = JSON.parse(out);
  const below = (report.failures || report.below || []).filter(Boolean);
  assert.equal(below.length, 0, `eşik altı çift: ${JSON.stringify(below).slice(0, 200)}`);
  assert.ok((report.pairs || report.checked || 0) > 600, 'denetlenen çift sayısı düştü');
});

// ---- (9) Odak halkası ve dokunma hedefi -------------------------------
check('odak halkası ve ≥44px dokunma hedefi CSS sözleşmesinde', () => {
  const css = read('app/kao.css');
  assert.match(css, /:focus-visible/, 'odak halkası kuralı yok');
  assert.match(css, /outline[^;]*var\(--kao-(?:accent|tint)\)/, 'odak halkası token kullanmıyor');
  // 44px kuralı: tıklanabilir öğelerde min-height 44 ya da padding ile sağlanır.
  const touch = [...css.matchAll(/min-height:\s*(\d+)px/g)].map((m) => Number.parseInt(m[1], 10));
  assert.ok(touch.some((n) => n >= 44), '44px dokunma hedefi yok');
});

// ---- (10) 320 px / %200 metin ----------------------------------------
check('dar genişlik ve büyük metin için yatay kaydırma koruması var', () => {
  const css = read('app/kao.css');
  assert.match(css, /overflow-wrap|word-break|min-width:\s*0/, 'uzun sözcük taşması koruması yok');
  assert.match(css, /@media[^{]*\(max-width:\s*(?:3\d\d|4\d\d)px\)/, 'dar ekran sorgusu yok');
});

console.log(`\nKAO2-26 erişilebilirlik: ${passed} kontrol PASS`);
