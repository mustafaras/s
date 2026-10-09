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

// K2F-37: görünüm listesi KAYNAKTAN türetilir (Flow VIEWS ∪ KAO_VIEW_TITLES; tekrarsız). Yeni bir görünüm eklenince matris onu kendiliğinden kapsar.
const FLOW_VIEWS = [...read('app/core/quranLearnFlow.js').match(/var VIEWS=\{([^}]*)\}/)[1].matchAll(/([a-z0-9]+):true/g)].map((m) => m[1]);
const ROUTE_VIEWS = [...read('app/core/quranLearn.js').match(/var KAO_VIEW_TITLES=\{([^}]*)\}/)[1].matchAll(/(?:^|,)\s*([a-z0-9]+):/g)].map((m) => m[1]);
const VIEWS = [...new Set(FLOW_VIEWS.concat(ROUTE_VIEWS))];
const ALIAS = { map: 'stats' }; // kaoViewAlias: 'map' ayrı ekran değil, İlerleme'ye yönlenir

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

// ---- Mini HTML ayrıştırıcı (miras alınan lang/dir ve kimlikler için) ---------------------------------
const VOID = new Set(['br', 'img', 'input', 'hr', 'meta', 'link', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'use']);
function parse(html) {
  const nodes = [], stack = [];
  for (const m of String(html).matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g)) {
    if (m[4] !== undefined) { // metin
      const top = stack[stack.length - 1];
      nodes.push({ type: 'text', text: m[4], lang: top ? top.lang : null, dir: top ? top.dir : null, hidden: stack.some((n) => n.hidden) });
      continue;
    }
    const closing = m[1] === '/', name = m[2].toLowerCase(), raw = m[0];
    if (closing) { for (let k = stack.length - 1; k >= 0; k -= 1) if (stack[k].name === name) { stack.length = k; break; } continue; }
    const attr = (key) => { const a = raw.match(new RegExp(`\\s${key}="([^"]*)"`)); return a ? decode(a[1]) : null; };
    const parent = stack[stack.length - 1];
    const node = { type: 'tag', name, raw, attr, id: attr('id'), lang: attr('lang') !== null ? attr('lang') : (parent ? parent.lang : null), dir: attr('dir') !== null ? attr('dir') : (parent ? parent.dir : null),
      hidden: attr('aria-hidden') === 'true' || (parent ? parent.hidden : false), parentName: parent ? parent.name : null };
    nodes.push(node);
    if (!VOID.has(name) && !/\/>$/.test(raw)) stack.push(node);
  }
  return nodes;
}
const textOf = (html) => decode(String(html).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const SHELL_IDS = new Set(['sey-ov-back', 'sey-ov-card']);

// Her yüzeye uygulanan erişilebilirlik kuralları; ihlal dizgileri döner.
function audit(html) {
  const out = [], nodes = parse(html), tags = nodes.filter((n) => n.type === 'tag');
  const ids = tags.map((n) => n.id).filter(Boolean);
  // (a) düğme adı: aria-label/aria-labelledby ya da görünür metin (kapanışa kadar)
  const buttons = [...String(html).matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)].map((m) => m[0]);
  for (const b of buttons) {
    const open = b.match(/<button\b[^>]*>/)[0];
    const inner = decode(b.replace(/<button\b[^>]*>/, '').replace(/<\/button>$/, '').replace(/<[^>]+>/g, '')).trim();
    if (!(/aria-label="[^"]+"/.test(open) || /aria-labelledby="[^"]+"/.test(open) || inner.length > 0)) out.push(`adsız düğme ${open.slice(0, 90)}`);
  }
  // (b) tıklanabilir öğe düğme/bağlantı olmalı (kabuk/arka plan hariç)
  for (const n of tags) if (/\sonclick="/.test(n.raw) && !['button', 'a'].includes(n.name) && !SHELL_IDS.has(n.id)) out.push(`onclick düğme dışı <${n.name} ${n.raw.slice(0, 70)}`);
  // (c) yinelenen id ve kırık aria-labelledby/aria-describedby/aria-controls hedefi
  const dup = ids.filter((x, k) => ids.indexOf(x) !== k);
  if (dup.length) out.push(`yinelenen id ${[...new Set(dup)].join(',')}`);
  for (const n of tags) for (const key of ['aria-labelledby', 'aria-describedby', 'aria-controls']) { const v = n.attr(key); if (v) for (const id of v.split(/\s+/)) if (!ids.includes(id)) out.push(`${key} hedefi yok: ${id}`); }
  // (d) form alanı etiketi
  for (const n of tags) if (['input', 'select', 'textarea'].includes(n.name) && !/type="(hidden|submit|button)"/.test(n.raw)) {
    const labelled = n.attr('aria-label') || n.attr('aria-labelledby') || (n.id && new RegExp(`<label[^>]*for="${n.id}"`).test(decode(html)));
    if (!labelled) out.push(`etiketsiz alan ${n.raw.slice(0, 80)}`);
  }
  // (e) Arapça metin: miras alınan lang="ar" + dir="rtl"; gizli (aria-hidden) süs metni hariç
  for (const n of nodes) if (n.type === 'text' && /[؀-ۿ]/.test(n.text) && !n.hidden) {
    if (n.lang !== 'ar') out.push(`Arapça lang!=ar: ${n.text.trim().slice(0, 30)}`);
    else if (n.dir !== 'rtl') out.push(`Arapça dir!=rtl: ${n.text.trim().slice(0, 30)}`);
  }
  // (f) canlı bölge yalnız polite
  for (const n of tags) { const v = n.attr('aria-live'); if (v && v !== 'polite') out.push(`aria-live=${v}`); }
  // (g) aria-current="step" en çok bir; pozitif tabindex yok; role=img adlı; img alt'lı
  if (tags.filter((n) => n.attr('aria-current') === 'step').length > 1) out.push('aria-current="step" birden çok');
  for (const n of tags) {
    const ti = n.attr('tabindex'); if (ti !== null && Number(ti) > 0) out.push(`tabindex=${ti}`);
    if (n.attr('role') === 'img' && !n.attr('aria-label') && !n.attr('aria-labelledby')) out.push(`role=img adsız ${n.raw.slice(0, 70)}`);
    if (n.name === 'img' && n.attr('alt') === null) out.push('img alt yok');
  }
  // (h) tek diyalog kabuğu: role=dialog + aria-modal tam bir kez; NavBar ≤1; dolgulu birincil düğme ≤1
  const dialogs = tags.filter((n) => n.attr('role') === 'dialog');
  if (dialogs.length !== 1 || dialogs[0].attr('aria-modal') !== 'true') out.push(`diyalog kabuğu: ${dialogs.length} adet`);
  else if (!(dialogs[0].attr('aria-labelledby') || dialogs[0].attr('aria-label'))) out.push('diyalog adı yok (aria-labelledby/aria-label)');
  const klass = (n) => (n.attr('class') || '').split(/\s+/);
  if (tags.filter((n) => klass(n).includes('kao-navbar')).length > 1) out.push('NavBar birden çok');
  if (tags.filter((n) => klass(n).includes('kao-primary')).length > 1) out.push('dolgulu birincil düğme birden çok');
  return out;
}

// ---- Yüzey matrisi: görünüm × durum + oturum aşamaları + ilk açılış + S0 + ustalık/onarım + odak/panel -----------
const { bootKao, freshUser, seed, openView, walkLesson } = require('./helpers/kao-harness');
function buildMatrix() {
  const surfaces = [];
  const counts = new Map();
  const add = (label, html) => { const n = (counts.get(label) || 0) + 1; counts.set(label, n); surfaces.push({ label: n === 1 ? label : `${label}#${n}`, html: String(html) }); };
  for (const state of ['boş', 'tohumlu']) {
    const t = bootKao();
    if (state === 'tohumlu') seed(t); else freshUser(t);
    const lex = t.win.QuranLexiconV1, grammar = t.win.QuranGrammarV1;
    const params = { unit: 1, word: lex.lemmas[0].id, reader: 112, concept: grammar.concepts[0].id };
    for (const view of VIEWS) {
      const r = openView(t, view, params[view]);
      assert.equal(r.ok, true, `${state}/${view} açılamadı`);
      add(`${state}/${view}`, r.html);
    }
    if (state === 'tohumlu') { // ek: ayarlar alt durumları, yol/ünite detayı, kök araması, farklı sûre ve kavramlar
      for (const id of [1, 2, 3, 12]) { const r = openView(t, 'unit', id); add(`tohumlu/unit-${id}`, r.html); }
      for (const id of [112, 113, 114, 1]) {
        const r = openView(t, 'reader', id); add(`tohumlu/reader-${id}`, r.html);
        // D3F-16: anlam paneli açık yüzey de matriste (kural h: tek diyalog kabuğu).
        t.api.kaoReader('word', 0); add(`tohumlu/reader-${id}-anlam-paneli`, t.api.kaoOverlayHTML(t.NOW));
        t.api.kaoReader('close');
      }
      for (const c of grammar.concepts.slice(0, 6)) { const r = openView(t, 'concept', c.id); add(`tohumlu/concept-${c.id}`, r.html); }
      for (const l of lex.lemmas.slice(1, 6)) { const r = openView(t, 'word', l.id); add(`tohumlu/word-${l.id}`, r.html); }
    }
  }
  // İlk açılış: adım 1, 2, yerleştirme (okuma + dinleme), 3
  {
    const t = bootKao(); t.data.quranLearn = null; t.api.kaoOpen('home');
    add('ilk-açılış/1', t.api.kaoOverlayHTML(t.NOW));
    t.api.kaoOnboard('next'); add('ilk-açılış/2', t.api.kaoOverlayHTML(t.NOW));
    t.api.kaoOnboard('choose', 'slow'); add('ilk-açılış/yerleştirme-okuma', t.api.kaoOverlayHTML(t.NOW));
    const tasks = t.api.kaoPlacementTasks();
    tasks.reading.forEach((task) => t.api.kaoOnboard('answer', task.answer));
    add('ilk-açılış/yerleştirme-dinleme', t.api.kaoOverlayHTML(t.NOW));
    tasks.listening.forEach((task) => t.api.kaoOnboard('answer', task.answer));
    add('ilk-açılış/3', t.api.kaoOverlayHTML(t.NOW));
    const legacy = bootKao(); freshUser(legacy); legacy.data.quranLearn.onboarding.doneAt = 'legacy'; legacy.ui.kaoStack = []; legacy.api.kaoOpen('home');
    add('ilk-açılış/legacy-yenilikler', legacy.api.kaoOverlayHTML(legacy.NOW));
    const change = bootKao(); freshUser(change); change.api.kaoOnboard('change-start'); add('ilk-açılış/başlangıcı-değiştir', change.api.kaoOverlayHTML(change.NOW));
  }
  // Ders oynatıcı: farklı ders türleri; her aşama ve görev + panel-açık (doğru ve yanlış cevap) + özet
  {
    const t = bootKao(); freshUser(t);
    const cur = t.win.QuranCurriculumV2;
    const lessonIds = [cur.units[0].lessons[0].id, cur.units[3].lessons[0].id, cur.units[9].lessons[0].id, cur.units[11].lessons[0].id];
    for (const lessonId of lessonIds) {
      assert.equal(t.api.kaoLesson('start', lessonId), true, `ders ${lessonId} açılamadı`);
      let wrongNext = false;
      for (let guard = 0; guard < 120; guard += 1) {
        const st = t.ui.kaoLesson, item = st.plan[st.at];
        if (st.phase === 'practice') {
          const queued = t.ui.kaoQueue[t.ui.kaoTaskIndex], task = queued && t.ui.kaoTasks[queued.id];
          if (!task) break;
          add(`ders/${lessonId}/görev-${task.kind}`, t.api.kaoOverlayHTML(t.NOW));
          if (task.kind === 'order') (task.choices || []).slice().sort((a, b) => a.ordinal - b.ordinal).forEach((c) => t.api.kaoAnswer(task.id, c.choiceId));
          else t.api.kaoAnswer(task.id, (wrongNext ? (task.choices.find((c) => !c.correct) || task.choices[0]) : (task.choices.find((c) => c.correct) || task.choices[0])).choiceId);
          wrongNext = !wrongNext;
          add(`ders/${lessonId}/panel-açık-${task.kind}`, t.api.kaoOverlayHTML(t.NOW));
          t.api.kaoContinue();
          continue;
        }
        add(`ders/${lessonId}/${item.kind}`, t.api.kaoOverlayHTML(t.NOW));
        if (item.kind === 'summary') break;
        t.api.kaoLesson('next');
      }
      t.api.kaoLesson('finish');
    }
    // Tekrar oturumu (odak modu): kaoStart
    const r = bootKao(); seed(r);
    assert.ok(r.api.kaoStart(), 'tekrar oturumu başlamadı');
    add('tekrar/görev', r.api.kaoOverlayHTML(r.NOW));
    // Ustalık ve onarım
    const m = bootKao(); freshUser(m);
    m.win.QuranCurriculumV2.units[0].lessons.forEach((l) => { walkLesson(m, l.id); m.api.kaoLesson('finish'); });
    assert.equal(m.api.kaoLesson('start', 1), true); add('ustalık/başlangıç', m.api.kaoOverlayHTML(m.NOW));
    walkLesson(m, 1, { answer: 'wrong' }); add('ustalık/özet-kaldı', m.api.kaoOverlayHTML(m.NOW)); m.api.kaoLesson('finish');
    if (m.api.kaoLesson('start', 'repair:1')) add('onarım/başlangıç', m.api.kaoOverlayHTML(m.NOW));
  }
  // S0 harf dersleri: her ders için her aşama
  {
    const t = bootKao(); freshUser(t, { start: 's0' });
    const lessons = t.win.QuranCurriculumV2.s0.lessons;
    for (const l of lessons.slice(0, 12)) {
      assert.equal(t.api.kaoS0('start', l.id), true, `${l.id} başlamadı`);
      const seen = new Set();
      for (let guard = 0; guard < 40; guard += 1) {
        const html = t.api.kaoOverlayHTML(t.NOW), stage = (decode(html).match(/Aşama (\d+) \/ \d+/) || [])[1] || String(guard);
        if (!seen.has(stage + (t.ui.kaoS0.drill ? ':' + t.ui.kaoS0.drill.index + ':' + (t.ui.kaoS0.drill.picked !== null) : ''))) add(`s0/${l.id}/aşama-${stage}`, html);
        seen.add(stage + (t.ui.kaoS0.drill ? ':' + t.ui.kaoS0.drill.index + ':' + (t.ui.kaoS0.drill.picked !== null) : ''));
        const drill = t.ui.kaoS0.drill;
        if (drill && drill.picked === null) { const q = drill.items[drill.index]; t.api.kaoS0('answer', q.choices.find((c) => c.correct).id); continue; }
        if (!t.api.kaoS0('next')) break;
      }
    }
  }
  return surfaces;
}
const MATRIX = buildMatrix();

check(`matris: ${MATRIX.length} yüzey (görünümler kaynaktan türetildi: ${VIEWS.join(',')}) ve her kural her yüzeyde`, () => {
  assert.ok(VIEWS.length >= 17, `görünüm listesi kaynaktan okunamadı (${VIEWS.length})`);
  for (const v of ['home', 'units', 'unit', 'word', 'reader', 'settings', 'stats', 'gate', 'session', 'grammar', 'concept', 'roots', 's0', 'sources']) assert.ok(VIEWS.includes(v), `${v} görünüm listesinde yok`);
  assert.ok(MATRIX.length >= 150, `matris küçük: ${MATRIX.length}`);
  const kinds = new Set(MATRIX.map((s) => s.label.split('/')[0]));
  for (const k of ['boş', 'tohumlu', 'ilk-açılış', 'ders', 'tekrar', 'ustalık', 's0']) assert.ok(kinds.has(k), `matriste ${k} yok`);
  const violations = [];
  for (const surface of MATRIX) for (const v of audit(surface.html)) violations.push(`${surface.label}: ${v}`);
  assert.deepEqual(violations.slice(0, 40), [], `a11y ihlali (${violations.length}): ${violations.slice(0, 4).join(' | ')}`);
});

// ---- Dokunma hedefi (≥44 px): yüzeylerde çizilen HER düğme/bağlantı için CSS'ten çözülen en küçük yükseklik ----------
// Seçici eşleştirme sade ve tutucudur: yalnız .sınıf / etiket birleşikleri ve boşluk/">" bağlaçları (sözde sınıflı kurallar dışarıda).
// Çözülemeyen (hiçbir kuralın yükseklik vermediği) denetimler TOUCH_EXEMPT listesindedir ve gerekçesi yazılıdır.
const CSS_TEXT = read('app/kao.css').replace(/\/\*[\s\S]*?\*\//g, '');
const CSS_VARS = {};
for (const m of CSS_TEXT.matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*(\d+)px/g)) CSS_VARS[m[1]] = Number(m[2]);
for (const m of read('app/styles.css').matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*(\d+)px/g)) if (!(m[1] in CSS_VARS)) CSS_VARS[m[1]] = Number(m[2]);
const px = (value) => {
  const v = String(value).trim(), m = v.match(/^(\d+(?:\.\d+)?)px$/), variable = v.match(/^var\((--[a-zA-Z0-9-]+)(?:\s*,\s*([^)]+))?\)$/);
  if (m) return Number(m[1]);
  if (variable) return variable[1] in CSS_VARS ? CSS_VARS[variable[1]] : (variable[2] ? px(variable[2]) : null);
  const clamp = v.match(/^(?:max|clamp)\(([^)]*)\)$/); if (clamp) { const parts = clamp[1].split(',').map(px).filter((n) => n !== null); return parts.length ? Math.max(...parts) : null; }
  return null;
};
const RULES = [];
for (const m of CSS_TEXT.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
  let min = null;
  for (const d of m[2].matchAll(/(?:^|;)\s*(min-height|height)\s*:\s*([^;]+)/g)) { const v = px(d[2]); if (v !== null) min = Math.max(min || 0, v); }
  if (min === null) continue;
  for (const sel of m[1].split(',')) { const t = sel.trim(); if (t && !/[:\[*+~]/.test(t)) RULES.push({ sel: t.split(/\s*>\s*|\s+/).filter(Boolean), child: / > /.test(t), min }); }
}
function matchesCompound(node, compound) {
  const tag = (compound.match(/^[a-z][a-z0-9]*/) || [null])[0], classes = [...compound.matchAll(/\.([a-zA-Z0-9_-]+)/g)].map((x) => x[1]);
  if (tag && node.name !== tag) return false;
  const have = (node.attr('class') || '').split(/\s+/);
  return classes.every((c) => have.includes(c));
}
function touchHeight(node, chain) { // chain: kökten düğmeye ata zinciri (düğme dahil son eleman)
  let best = 0;
  for (const rule of RULES) {
    const last = rule.sel[rule.sel.length - 1];
    if (!matchesCompound(node, last)) continue;
    let ok = true, at = chain.length - 2;
    for (let k = rule.sel.length - 2; k >= 0 && ok; k -= 1) { while (at >= 0 && !matchesCompound(chain[at], rule.sel[k])) at -= 1; if (at < 0) ok = false; else at -= 1; }
    if (ok) best = Math.max(best, rule.min);
  }
  return best;
}
function touchTargets(html) { // [{signature, height, label}]
  const out = [], stack = [];
  for (const m of String(html).matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g)) {
    const closing = m[1] === '/', name = m[2].toLowerCase(), raw = m[0];
    if (closing) { for (let k = stack.length - 1; k >= 0; k -= 1) if (stack[k].name === name) { stack.length = k; break; } continue; }
    const attr = (key) => { const a = raw.match(new RegExp(`\\s${key}="([^"]*)"`)); return a ? decode(a[1]) : null; };
    const node = { name, raw, attr };
    stack.push(node);
    if (['button', 'a'].includes(name) && /\sonclick="|\shref="/.test(raw)) out.push({ signature: `${name}.${(attr('class') || '(sınıfsız)').split(/\s+/).sort().join('.')}`, height: touchHeight(node, stack.slice()), raw: raw.slice(0, 90) });
    if (['input', 'img', 'br', 'hr'].includes(name) || /\/>$/.test(raw)) stack.pop();
  }
  return out;
}
// Gerekçeli istisnalar: satır içi/yardımcı denetimler; her biri başka bir 44 px hedefin parçası ya da bilinçli kompakt öğedir.
const TOUCH_EXEMPT = {};
check('dokunma hedefi: yüzeylerdeki her düğme/bağlantı CSS\'ten ≥44 px çözülür (istisnalar gerekçeli)', () => {
  const found = new Map();
  for (const surface of MATRIX) for (const target of touchTargets(surface.html)) if (!found.has(target.signature)) found.set(target.signature, { ...target, surfaces: 0 });
  for (const surface of MATRIX) for (const target of touchTargets(surface.html)) found.get(target.signature).surfaces += 1;
  const small = [...found.values()].filter((t) => t.height < 44 && !(t.signature in TOUCH_EXEMPT));
  assert.deepEqual(small.map((t) => `${t.signature}=${t.height}px (${t.surfaces} yüzey) ${t.raw}`), [], 'çözülemeyen ya da 44 px altı dokunma hedefi');
  assert.ok(found.size >= 25, `dokunma hedefi imzaları az: ${found.size}`);
  if (process.env.KAO2_A11Y_VERBOSE === '1') for (const t of [...found.values()].sort((a, b) => a.height - b.height)) console.log(String(t.height).padStart(4), String(t.surfaces).padStart(4), t.signature);
});

// ---- D3F-16: okuyucu anlam paneli modal DEĞİL — açılır bölge (disclosure) sözleşmesi ----------------
check('okuyucu anlam paneli: role=region + aria-live=polite; kelime düğmesi aria-expanded/aria-controls; odak düğmede kalır ve kapanışta düğmeye döner', () => {
  const t = boot();
  t.ui.kaoSurahId = 95; t.api.kaoSetView('reader');
  const words = t.box.window.QuranShortSurahsV1.words.filter((w) => w.surahId === 95);
  assert.ok(words.length >= 3, 'okuyucu kelimeleri yok');
  const index = words.length - 1;
  const body = (html) => decode(html).replace(/^[\s\S]*?id="sey-ov-body"[^>]*>/, '');
  t.calls.restore.length = 0;
  t.api.kaoReader('word', index);
  const open = decode(t.api.kaoOverlayHTML(t.NOW));
  const panel = (open.match(/<section\b[^>]*class="kao-reader-panel"[^>]*>/) || [])[0];
  assert.ok(panel, 'anlam paneli çizilmedi');
  assert.doesNotMatch(panel, /role="dialog"/, 'satır içi panel role=dialog taşıyamaz (aria-modal/odak tuzağı/Escape yok)');
  assert.match(panel, /role="region"/, 'panel role=region değil');
  assert.match(panel, /aria-live="polite"/, 'panel aria-live=polite değil');
  assert.match(panel, /id="kao-reader-panel"/, 'panel kimliği yok');
  assert.match(panel, /aria-label="Kelime anlamı"/, 'panel adı yok');
  assert.equal((body(open).match(/role="dialog"/g) || []).length, 0, 'gövdede ikinci diyalog var');
  const trigger = (open.match(new RegExp(`<button\\b[^>]*id="kao-reader-w-${index}"[^>]*>`)) || [])[0];
  assert.ok(trigger, 'açan kelime düğmesinin kimliği yok');
  assert.match(trigger, /aria-expanded="true"/, 'açan düğme aria-expanded=true değil');
  assert.match(trigger, /aria-controls="kao-reader-panel"/, 'açan düğme panele bağlı değil');
  assert.equal((open.match(/aria-controls="kao-reader-panel"/g) || []).length, 1, 'panele yalnız açan düğme bağlanır');
  const ids = [...open.matchAll(/id="kao-reader-w-(\d+)"/g)].map((m) => Number(m[1]));
  assert.deepEqual(ids, Array.from({ length: words.length }, (_, k) => k), 'her kelime düğmesinin sıra kimliği tekil ve sıralı olmalı');
  assert.deepEqual(t.calls.restore, [`kao-reader-w-${index}`], 'yeniden çizimden sonra odak açan kelimeye dönmedi');
  t.api.kaoReader('close');
  const closed = decode(t.api.kaoOverlayHTML(t.NOW));
  assert.doesNotMatch(closed, /class="kao-reader-panel"/, 'panel kapanmadı');
  assert.doesNotMatch(closed, /aria-controls="kao-reader-panel"/, 'kapalı panele işaret eden aria-controls kaldı');
  assert.match(closed, new RegExp(`id="kao-reader-w-${index}"`), 'dönüş hedefi kapanış çiziminde yok');
  assert.deepEqual(t.calls.restore, [`kao-reader-w-${index}`, `kao-reader-w-${index}`], '"Kapat" sonrası odak açan kelimeye dönmedi');
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
