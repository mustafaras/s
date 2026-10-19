'use strict';
// K3P-A2 (A-6, D-8) · odak kilidi: KAO dersi açıkken başka modüllerin toast'ı DOM'a eklenmez, kuyruğa alınır
// (en çok 3, tekrar eden bir kez); urgent (kriz/güvenlik) ve own (odaktaki yüzeyin kendi cevabı) ertelenmez;
// ders özetinde, çıkışta ya da kapatınca kuyruk tek bir birleşik toast olur. helpers.js sahte document ile vm içinde. Ağsız.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const H = require('./helpers/kao-harness');
const root = require('../repo-root');

const helpersSrc = fs.readFileSync(path.join(root, 'app/core/helpers.js'), 'utf8');

// Sahte document: yalnız toast'ın kullandığı yüzey; eklenen her #sey-toast kaydedilir.
function fakeDocument() {
  const shown = [];
  let current = null;
  const doc = {
    shown,
    getElementById: (id) => (id === 'sey-toast' ? current : null),
    createElement: () => ({ id: '', attrs: {}, style: {}, textContent: '', parentNode: null, setAttribute(n, v) { this.attrs[n] = v; }, remove() { if (current === this) current = null; this.parentNode = null; } }),
    body: { appendChild(el) { el.parentNode = doc.body; current = el; shown.push(el); } }
  };
  return doc;
}
function loadHelpers(box) {
  box.document = fakeDocument();
  box.setTimeout = () => 0; box.clearTimeout = () => {};
  vm.runInContext(helpersSrc, box, { filename: 'helpers.js' });
  return box.window.SeymaHelpers;
}
function startLessonForFixture(t, lessonId) {
  return t.api.kaoLesson('start', lessonId)
    || t.api.kaoLesson('start', lessonId, 'budget-overrun');
}
function playLessonAcrossParts(t, options = {}) {
  for (let guard = 0; guard < 40; guard += 1) {
    const state = t.ui.kaoLesson;
    if (!state) return false;
    const from = state.at || 0;
    const boundary = state.plan.findIndex((item, index) => index >= from && item.kind === 'partEnd');
    const target = options.stopAt
      ? state.plan.findIndex((item, index) => index >= from && item.kind === options.stopAt)
      : -1;
    const stopAt = target >= 0 && (boundary < 0 || target < boundary) ? options.stopAt : (boundary >= 0 ? 'partEnd' : options.stopAt);
    if (!H.playLesson(t, Object.assign({}, options, { stopAt }))) return false;
    const currentState = t.ui.kaoLesson, current = currentState && currentState.plan[currentState.at || 0];
    if (current && current.kind === 'partEnd') {
      if (!t.api.kaoLesson('budget-overrun')) return false; // synthetic user explicitly accepts the displayed overrun
      continue;
    }
    return true;
  }
  return false;
}

// 1) helpers.js tek başına: kilit, kuyruk sınırı, tekrar, urgent/own, boşaltma.
{
  const box = { window: {} };
  vm.createContext(box);
  const helpers = loadHelpers(box);
  const doc = box.document;
  let locked = false;
  box.window.SeymaQuranLearn = { kaoFocusLocked: () => locked };
  assert.equal(helpers.toast('Kilit yokken'), true);
  assert.equal(doc.shown.length, 1, 'kilit yokken toast gösterilir');
  assert.equal(doc.shown[0].id, 'sey-toast');
  assert.equal(doc.shown[0].attrs.role, 'status', 'görünüm/erişilebilirlik aynı');
  assert.equal(helpers.flushToasts(), false, 'kuyruk boşken boşaltma bir şey göstermez');
  locked = true;
  assert.equal(helpers.toast('Hatırlatma: su iç', 2000), false);
  assert.equal(helpers.toast('Hatırlatma: su iç', 4000), false);
  assert.equal(doc.shown.length, 1, 'kilit açıkken #sey-toast eklenmez');
  assert.equal(helpers.toast('Kriz desteği burada', 3000, { urgent: true }), true);
  assert.equal(doc.shown.length, 2, 'urgent mesaj ertelenmez');
  assert.equal(doc.shown[1].textContent, 'Kriz desteği burada');
  assert.equal(helpers.toast('Teşekkürler', undefined, { own: true }), true, 'odaktaki yüzeyin kendi cevabı ertelenmez');
  helpers.toast('B'); helpers.toast('C'); helpers.toast('D');
  assert.equal(doc.shown.length, 3, 'kuyruğa alınanlar görünmez');
  assert.equal(helpers.flushToasts(), true);
  assert.equal(doc.shown.length, 4, 'boşaltmada tek bir toast çıkar');
  assert.equal(doc.shown[3].textContent, 'B · C · D', 'kuyruk en çok 3 mesaj tutar (en eskisi düşer), birleşik metin');
  assert.equal(helpers.flushToasts(), false, 'boşaltmadan sonra kuyruk boş');
  helpers.toast('X', 2000); helpers.toast('X', 5000);
  helpers.flushToasts();
  assert.equal(doc.shown[4].textContent, 'X', 'tekrar eden mesaj bir kez saklanır');
  box.window.SeymaQuranLearn = { kaoFocusLocked() { throw new Error('bozuk'); } };
  assert.equal(helpers.toast('Sorgu bozuksa'), true, 'kilit sorgusu bozuksa toast kaybolmaz');
}

// 2) Uçtan uca: gerçek KAO motoru + helpers.js aynı vm'de. Ders sırasında dış toast bekler, özette tek bildirim.
{
  let t = null, flushes = 0;
  t = H.bootKao({
    seeded: true,
    deps: { render() { if (t.ui.kaoOpen) t.api.kaoMount(); } },
    surface: {
      mount() {},
      toast(msg, ms, opts) { return t.win.SeymaHelpers.toast(msg, ms, opts); },
      flushToasts() { flushes += 1; return t.win.SeymaHelpers.flushToasts(); }
    }
  });
  const helpers = loadHelpers(t.box);
  const doc = t.box.document;
  t.ui.kaoOpen = false; t.ui.kaoStack = []; t.ui.kaoView = 'home';
  assert.equal(t.api.kaoFocusLocked(), false, 'kapalıyken kilit yok');
  t.api.kaoOpen('home');
  assert.equal(t.api.kaoFocusLocked(), false, 'ana ekranda kilit yok');
  assert.equal(startLessonForFixture(t, 'u01.02'), true);
  assert.equal(t.api.kaoFocusLocked(), true, 'ders sırasında kilit');
  helpers.toast('Hatırlatma: su iç');
  helpers.toast('ÆON: yeni mesaj');
  assert.equal(doc.shown.length, 0, 'ders sırasında KAO dışı DOM eklemesi 0');
  assert.equal(playLessonAcrossParts(t), true, 'ders özete kadar oynandı');
  const st = t.ui.kaoLesson, item = st && st.plan[st.at || 0];
  assert.ok(item && item.kind === 'summary', 'ders özette');
  assert.equal(doc.shown.length, 1, 'özette tek birleşik bildirim');
  assert.equal(doc.shown[0].textContent, 'Hatırlatma: su iç · ÆON: yeni mesaj');
  helpers.toast('Özetteyken gelen');
  assert.equal(doc.shown.length, 1, 'özet de dersin parçası: yeni dış toast bekler');
  t.api.kaoLesson('exit');
  assert.equal(t.api.kaoFocusLocked(), false, 'çıkınca kilit kalkar');
  assert.equal(doc.shown.length, 2, 'çıkışta bekleyen bildirim gösterilir');
  assert.equal(doc.shown[1].textContent, 'Özetteyken gelen');
  // "Bugün yeter" (finish) da ana ekrana döner: kilit kalkar.
  assert.equal(startLessonForFixture(t, 'u01.03'), true);
  assert.equal(t.api.kaoFocusLocked(), true);
  assert.equal(playLessonAcrossParts(t), true);
  assert.equal(t.api.kaoLesson('finish'), true);
  assert.equal(t.api.kaoFocusLocked(), false, 'finish sonrası kilit yok');
  // Ders ortasında kapatma da boşaltır.
  assert.equal(startLessonForFixture(t, 'u01.02'), true);
  helpers.toast('Kapatınca görünmeli');
  assert.equal(doc.shown.length, 2);
  t.api.kaoClose();
  assert.equal(t.api.kaoFocusLocked(), false);
  assert.equal(doc.shown.length, 3, 'kapatınca bekleyen bildirim gösterilir');
  assert.equal(doc.shown[2].textContent, 'Kapatınca görünmeli');
  assert.ok(flushes >= 3, 'boşaltma özet, çıkış ve kapatmada çağrıldı');
}

// 3) Bağlantı: app.js yüzeyi flushToasts'ı geçirir, güvenlik toast'ı urgent; KAO'nun kendi toast'ları own. App.* eklenmedi.
{
  const appJs = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const kao = fs.readFileSync(path.join(root, 'app/core/quranLearn.js'), 'utf8');
  assert.match(appJs, /toast:toast,flushToasts:function\(\)\{ return window\.SeymaHelpers\.flushToasts\(\); \}\}\)\) throw new Error\('KAO-10/);
  assert.match(appJs, /App\.continueEmergency=function\(\)\{[^\n]*toast\([^\n]*,3000,\{urgent:true\}\); \};/);
  assert.equal((kao.match(/quranLearnSurfaceDeps\.toast\([^;]*\{own:true\}\)/g) || []).length, 3, 'KAO\'nun 3 kendi toast\'ı own');
  assert.doesNotMatch(appJs, /App\.kaoFocusLocked\b|App\.flushToasts\b/, 'yeni sorgu App.* değildir');
  assert.match(appJs, /function toast\(msg,ms\)\{ return window\.SeymaHelpers\.toast\.apply\(null,arguments\); \}/, 'app.js köprüsü opts\'u arguments ile geçirir');
}

console.log('test_k3p_focus_lock: PASS');
