'use strict';
// K3P-A1 (A-7, D-0, K-M) · KAO overlay yerinde güncellenir: kaoSplitOverlay birim testleri ve küçük sahte DOM ile
// mount (app.js) + paint (render.js) taklidi. Bir derste aşama geçişleri boyunca overlay düğümü aynı kalır,
// açılış animasyonu (yeni eklenen overlay) yalnız bir kez oynar, kaydırma ve odak korunur. Ağsız; gerçek veri yok.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const H = require('./helpers/kao-harness');
const root = require('../repo-root');

// ── Sahte DOM: yalnız mount/paint'in kullandığı yüzey. ──
function makeDoc() {
  const doc = { inserts: 0, activeElement: null };
  class El {
    constructor(id, className, attrs) { this.id = id || ''; this.className = className || ''; this.attrs = Object.assign({}, attrs); this.children = []; this.parentNode = null; this.html = ''; this.scrollTop = 0; this.ephemeral = new Map(); }
    get firstChild() { return this.children[0] || null; }
    get firstElementChild() { return this.children[0] || null; }
    get nextSibling() { const p = this.parentNode; return p ? p.children[p.children.indexOf(this) + 1] || null : null; }
    setAttribute(n, v) { this.attrs[n] = String(v); }
    removeAttribute(n) { delete this.attrs[n]; }
    getAttribute(n) { return Object.prototype.hasOwnProperty.call(this.attrs, n) ? this.attrs[n] : null; }
    contains(node) { for (let n = node; n; n = n.parentNode) if (n === this) return true; return false; }
    removeChild(c) { if (c.contains(doc.activeElement)) doc.activeElement = doc.body; this.children.splice(this.children.indexOf(c), 1); c.parentNode = null; return c; }
    adopt(nodes, at) { nodes.forEach((n, i) => { n.parentNode = this; this.children.splice(at + i, 0, n); }); }
    insertAdjacentHTML(pos, html) {
      const nodes = parse(html);
      if (pos === 'beforeend') this.adopt(nodes, this.children.length);
      else if (pos === 'beforebegin') this.parentNode.adopt(nodes, this.parentNode.children.indexOf(this));
      else throw new Error('desteklenmeyen konum ' + pos);
    }
    set innerHTML(v) {
      if (doc.activeElement && doc.activeElement !== this && this.contains(doc.activeElement)) doc.activeElement = doc.body;
      this.children.forEach((c) => { c.parentNode = null; }); this.children = []; this.ephemeral = new Map(); this.html = String(v);
      this.scrollTop = 0; // en kötü durum: içerik değişince tarayıcı kaydırmayı sıfırlayabilir
    }
    get innerHTML() { return this.html; }
    querySelector(sel) {
      assert.equal(sel, '.kao-overlay', 'mount yalnız .kao-overlay arar');
      for (const c of this.children) { if (/\bkao-overlay\b/.test(c.className)) return c; const deep = c.querySelector(sel); if (deep) return deep; }
      return null;
    }
    focus() { doc.activeElement = this; }
    find(id) {
      if (this.id === id) return this;
      for (const c of this.children) { const hit = c.find(id); if (hit) return hit; }
      if (new RegExp(`\\sid="${id}"`).test(this.html)) { if (!this.ephemeral.has(id)) { const e = new El(id); e.parentNode = this; this.ephemeral.set(id, e); } return this.ephemeral.get(id); }
      return null;
    }
  }
  const attrsOf = (tag) => Object.fromEntries([...tag.matchAll(/([a-z][\w-]*)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
  function parse(html) {
    const m = /^<div id="sey-ov-back"([^>]*)><div id="sey-ov-card"([^>]*)><div id="sey-ov-body"([^>]*)>([\s\S]*)<\/div><\/div><\/div>$/.exec(html);
    if (!m) { const e = new El('', 'app-content'); e.html = html; return [e]; }
    doc.inserts += 1;
    const a = attrsOf(m[1]), b = attrsOf(m[2]), c = attrsOf(m[3]);
    const back = new El('sey-ov-back', a.class, a), card = new El('sey-ov-card', b.class, b), body = new El('sey-ov-body', c.class, c);
    back.adopt([card], 0); card.adopt([body], 0); body.html = m[4];
    return [back];
  }
  doc.body = new El('', 'body');
  doc.app = new El('app');
  doc.getElementById = (id) => doc.app.find(id);
  return doc;
}

// ── Sahne: gerçek KAO motoru, app.js render sarmalı + render.js paint taklidi + app.js mount. ──
function stage(observe) {
  const doc = makeDoc();
  let renders = 0, t = null;
  t = H.bootKao({
    seeded: true,
    deps: {
      render() { // render.js paint (K3P-A1 satırı) + app.js render sarmalı
        renders += 1;
        const html = `<main class="app-shell">sekme ${renders}</main>`;
        const kept = !!(t.ui.kaoOpen && t.api.kaoPaintApp(doc.app, html));
        if (!kept) doc.app.innerHTML = html;
        if (t.ui.kaoOpen) t.api.kaoMount();
        if (observe && t.ui.kaoOpen) observe();
      }
    },
    surface: { mount(html) { t.api.kaoPatchOverlay(doc, html); }, focusDialog(id) { const el = doc.getElementById(id); if (el) el.focus(); } }
  });
  t.ui.kaoOpen = false; t.ui.kaoStack = []; t.ui.kaoView = 'home';
  return { t, doc, rerender: () => t.api.kaoMount(), live: () => doc.app.querySelector('.kao-overlay') };
}

// 1) Bağlantı: app.js mount ve render.js paint yeni yola devreder; App.* eklenmedi.
{
  const appJs = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const renderJs = fs.readFileSync(path.join(root, 'app/core/render.js'), 'utf8');
  assert.match(appJs, /mount:function\(html\)\{ window\.SeymaQuranLearn\.kaoPatchOverlay\(document,html\); \}/, 'app.js mount kaoPatchOverlay\'a devreder');
  assert.match(renderJs, /window\.SeymaQuranLearn\.kaoPaintApp\(app,html\)\);\n {2}if\(!kaoKept\) app\.innerHTML=html;/, 'render.js paint açık KAO düğümünü korur');
  assert.doesNotMatch(appJs, /App\.kao(SplitOverlay|PatchOverlay|PaintApp)\b/, 'yeni işlevler App.* değildir');
}

// 2) kaoSplitOverlay: biçim, nitelikler ve ekran anahtarı; aynı anahtar → aynı görünüm.
{
  const t = H.bootKao({ seeded: true });
  const split = t.api.kaoSplitOverlay;
  assert.equal(split(''), null);
  assert.equal(split('<main>başka</main>'), null);
  const lemmaId = t.win.QuranLexiconV1.lemmas[0].id;
  const views = [['home'], ['units'], ['units', 1], ['word', lemmaId], ['reader', 112], ['reader', 113], ['settings'], ['gate'], ['phonics'], ['ayah'], ['prayer'], ['stats'], ['grammar'], ['roots'], ['s0'], ['sources']];
  const byKey = new Map();
  for (const [view, param] of views) {
    const opened = H.openView(t, view, param);
    assert.equal(opened.ok, true, `${view} açılmalı`);
    const s = split(opened.html);
    assert.ok(s, `${view}: ayrıştırılmalı`);
    assert.equal(split(t.api.kaoOverlayHTML(t.NOW)).screenKey, s.screenKey, `${view}: aynı durum aynı anahtar`);
    const cls = /class="kao-screen kao-screen-([a-z0-9-]+)"/.exec(opened.html)[1];
    assert.ok(s.screenKey.startsWith(cls + '|'), `${view}: anahtar ekran sınıfından türer (${s.screenKey})`);
    assert.ok(s.cardAttrs['aria-labelledby'] || s.cardAttrs['aria-label'], `${view}: diyalog adı`);
    assert.equal(typeof s.cardAttrs.style, 'string');
    assert.ok(!('role' in s.cardAttrs) && !('onkeydown' in s.cardAttrs), `${view}: role/onkeydown dış kartta kalır, taşınmaz`);
    assert.ok(s.body.startsWith('<section class="kao-screen'), `${view}: gövde içeriği`);
    const label = `${view}:${param === undefined ? '' : param}`;
    assert.ok(!byKey.has(s.screenKey) || byKey.get(s.screenKey) === label, `aynı anahtar iki görünüme denk geldi: ${s.screenKey}`);
    byKey.set(s.screenKey, label);
  }
  assert.equal(byKey.size, views.length, 'her görünümün kendi anahtarı var');
  // Ders: görevler session ekranında; aynı görev durumunda anahtar kararlı.
  t.ui.kaoOpen = false; t.api.kaoOpen('home');
  assert.equal(t.api.kaoLesson('start', 'u01.02'), true);
  let seen = 0;
  H.playLesson(t, {
    visit() {
      const key = split(t.api.kaoOverlayHTML(t.NOW)).screenKey;
      assert.match(key, /^session\|/, 'ders görevleri session ekranı');
      assert.equal(split(t.api.kaoOverlayHTML(t.NOW)).screenKey, key, 'aynı görev durumunda anahtar kararlı');
      seen += 1;
    }
  });
  assert.ok(seen > 0, 'ders görevleri görüldü');
}

// 3) Mount: aşama geçişleri boyunca overlay düğümü aynı, yeniden kurulum 0, animasyon 1 kez.
{
  let first = null, transitions = 0, last = '', renders = 0;
  const steps = new Set();
  const sc = stage(() => {
    renders += 1;
    const back = sc.live();
    if (!first) first = back;
    assert.equal(back, first, 'overlay düğümü aynı kalmalı');
    const step = back.firstElementChild.firstElementChild.getAttribute('data-kao-step');
    if (step !== last) { transitions += 1; last = step; }
    steps.add(step);
  });
  const { t, doc, live } = sc;
  assert.equal(t.api.kaoOpen('home'), true);
  assert.ok(first, 'overlay eklendi');
  assert.equal(doc.inserts, 1, 'açılışta tek ekleme (animasyon bir kez)');
  assert.equal(doc.app.children[doc.app.children.length - 1], first, 'overlay #app içinde son çocuk');
  assert.equal(first.firstElementChild.attrs.role, 'dialog');
  assert.equal(first.firstElementChild.attrs.onkeydown, 'App.onModalKeydown(event,App.kaoClose)');
  assert.equal(t.api.kaoLesson('start', 'u01.02'), true);
  assert.equal(H.playLesson(t), true, 'ders özete kadar oynandı');
  const lessonStages = [...steps].filter((s) => /\|lesson:\d+$/.test(s));
  assert.ok(lessonStages.length >= 7, `en az 7 ders aşaması görüldü (${lessonStages.length})`);
  assert.ok(transitions >= 7, `en az 7 aşama geçişi (${transitions})`);
  assert.equal(doc.inserts, 1, `ders boyunca overlay yeniden kurulumu 0 (ekleme ${doc.inserts}, render ${renders})`);
  assert.equal(live(), first);
  // Kapatınca overlay kalkar; yeniden açılış yeni ekleme (açılış animasyonu yeniden oynar).
  t.api.kaoLesson('exit'); t.api.kaoClose();
  assert.equal(live(), null, 'kapatınca overlay kalkar');
  first = null; t.api.kaoOpen('home');
  assert.equal(doc.inserts, 2, 'yeniden açılış yeni ekleme');
  console.log(`  mount: ${renders} render, ${lessonStages.length} ders aşaması, ${transitions} ekran geçişi, yeniden kurulum 0`);
}

// 4) Kaydırma ve odak: aynı ekranda korunur; ekran değişince kaydırma 0. Kart nitelikleri güncellenir.
{
  const { t, doc, rerender, live } = stage();
  t.api.kaoOpen('home');
  const body = () => live().firstElementChild.firstElementChild;
  body().scrollTop = 120;
  rerender();
  assert.equal(body().scrollTop, 120, 'aynı ekranda kaydırma korunur');
  const target = /\sid="([^"]+)"/.exec(body().innerHTML)[1];
  doc.getElementById(target).focus();
  const before = doc.activeElement;
  rerender();
  assert.equal(doc.activeElement.id, target, 'odak aynı id\'ye geri verilir');
  assert.notEqual(doc.activeElement, before, 'odak yeni içerikteki öğede');
  const card = live().firstElementChild;
  card.focus(); rerender();
  assert.equal(doc.activeElement, card, 'kart odağı korunur');
  t.api.kaoNav('settings');
  assert.equal(body().scrollTop, 0, 'ekran değişince kaydırma 0');
  assert.equal(card.getAttribute('aria-labelledby'), /aria-labelledby="([^"]+)"/.exec(t.api.kaoOverlayHTML(t.NOW))[1], 'diyalog adı güncellendi');
  assert.equal(card.getAttribute('role'), 'dialog', 'role dış kartta kalır');
  assert.match(body().getAttribute('data-kao-step'), /^settings:/);
  t.api.kaoNav('reader', 112); body().scrollTop = 80; t.api.kaoNav('reader', 113);
  assert.equal(body().scrollTop, 0, 'aynı görünüm, farklı parametre → yeni ekran');
  assert.equal(doc.inserts, 1);
}

console.log('test_k3p_mount: PASS');
