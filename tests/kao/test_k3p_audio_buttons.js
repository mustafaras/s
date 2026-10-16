'use strict';
// K3P-21 · Görünür ses kontrolleri (ANALIZ §4 "ses düğmesi"; Dalga 3 sonu). Sentetik node:vm; ağ/depo yok.
// Ölçülenler:
//   1) GİZLİ DAVRANIŞ KALKTI: görev HTML'inde uzun basma (350 ms) ve satır içi ok fonksiyonu YOK;
//      ses denetiminde hiç `onpointerdown` yok.
//   2) İKİ GÖRÜNÜR DÜĞME: ◖ Yavaş → measured, ◗ Doğal → flowing; her biri kendi `aria-label`'ını taşır.
//   3) YÜZEY: `App.kao*` sayısı 45 kalır (yeni handler eklenmedi; mevcut `kaoPlay` kullanılır).
//   4) DOKUNMA HEDEFİ: iki düğme de CSS'ten ≥44 px çözülür (a11y sözleşmesi).
//   5) KLAVYE/SES: düğmeler gerçek `<button type="button">`; tek dokunuş yeterli, basılı tutma gerekmez.
//   6) K3P-20 SINIRI: çip sürükleme `onpointerdown`'ı YALNIZ dizme görevlerinin çiplerindedir; ses
//      denetimi ve düz seçim görevi ondan etkilenmez (iki kart birbirini bozmaz).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { bootKao, repoRoot } = require('./helpers/kao-harness');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`PASS  ${name}`); }

const t = bootKao({ seeded: true });
const api = t.api;
const flow = t.win.SeymaQuranLearnFlow;
const q = t.data.quranLearn;
const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');

// Görev kurulurken kart durumu elle yazılır (rung kayması ölçüyü bozmasın).
function taskAt(stability, isNew) {
  const cardId = Object.keys(q.cards).find((id) => /^w:/.test(id) && flow.ladderArm(id) === 'A');
  q.cards[cardId] = { state: 'review', s: stability, reps: isNew ? 0 : 6, due: '2026-09-29T00:00:00.000Z' };
  return api.kaoBuildTask({ id: `k3p-21:${stability}:${isNew}`, cardId, isNew: !!isNew }, t.data, { seed: 'k3p-21' });
}
// Ses denetimi yalnız KELİME görevinde çizilir (clipId taşıyan yol); A kolu + düşük s ile güvenli.
const audioTask = () => {
  for (const stability of [1, 5, 12, 40]) {
    const task = taskAt(stability, true);
    if (task && task.clipId) return { task, stability };
  }
  return { task: null, stability: null };
};
const audioBlock = (html) => (String(html).match(/<div class="kao-audio-actions">[\s\S]*?<\/div>/) || [''])[0];

check('gizli uzun basma kalktı: ses denetiminde 350 ms ya da onpointerdown yok', () => {
  const { task, stability } = audioTask();
  assert.ok(task && task.clipId, `ses denetimli kelime görevi bulunmalı (s=${stability})`);
  const html = api.kaoTaskHTML(task);
  const block = audioBlock(html);
  assert.ok(block, 'ses denetimi çizildi');
  assert.ok(!/onpointerdown/.test(block), 'ses denetiminde onpointerdown yok');
  assert.ok(!/350/.test(block), 'uzun basma eşiği (350 ms) yok');
  assert.ok(!/basılı tut/.test(block), 'uzun basma metni yok');
  assert.ok(!/setTimeout/.test(block), 'satır içi zamanlayıcı yok');
  assert.ok(!/event\.shiftKey/.test(block), 'satır içi ok fonksiyonu (shiftKey) yok');
  // Düz seçim görevinde hiç onpointerdown olmamalı (K3P-20 çip sürüklemesi dizme görevine özgüdür).
  assert.equal((html.match(/onpointerdown=/g) || []).length, 0, 'düz görev HTML\'inde onpointerdown yok');
});

check('iki görünür düğme: ◖ Yavaş → measured, ◗ Doğal → flowing; her birinin aria-label\'ı var', () => {
  const { task } = audioTask();
  const block = audioBlock(api.kaoTaskHTML(task));
  const buttons = block.match(/<button type="button"[^>]*>[\s\S]*?<\/button>/g) || [];
  assert.equal(buttons.length, 2, 'tam iki düğme');
  assert.match(buttons[0], /class="kao-audio"/, 'ilk düğme yavaş');
  assert.match(buttons[0], /◖ Yavaş/, 'yavaş etiketi görünür');
  assert.match(buttons[0], /aria-label="Yavaş oku"/, 'yavaş aria-label');
  assert.match(buttons[0], new RegExp(`onclick="App\\.kaoPlay\\('${task.clipId}','measured'\\)"`), 'yavaş → measured');
  assert.match(buttons[1], /class="kao-audio-natural"/, 'ikinci düğme doğal');
  assert.match(buttons[1], /◗ Doğal/, 'doğal etiketi görünür');
  assert.match(buttons[1], /aria-label="Doğal hızda oku"/, 'doğal aria-label');
  assert.match(buttons[1], new RegExp(`onclick="App\\.kaoPlay\\('${task.clipId}','flowing'\\)"`), 'doğal → flowing');
  // İki düğme de gerçek <button type="button">: klavye ve ekran okuyucu yolu doğal.
  for (const button of buttons) assert.match(button, /^<button type="button"/, 'gerçek düğme');
});

check('yüzey: App.kao* sayısı 45 kalır (yeni handler yok, mevcut kaoPlay kullanılır)', () => {
  const appSource = read('app.js');
  const surface = read('app/core/appSurface.js');
  const kaoAssignments = (appSource + surface).match(/App\.kao[A-Za-z0-9_]+\s*=/g) || [];
  assert.equal(kaoAssignments.length, 45, `App.kao* 45 kalmalı (ölçülen ${kaoAssignments.length})`);
  // Ses düğmeleri mevcut tek eylemi çağırır; yeni bir oynatma handler'ı doğmadı.
  const engine = read('app/core/quranLearn.js');
  assert.match(engine, /onclick="App\.kaoPlay\(/, 'mevcut App.kaoPlay kullanılır');
  assert.equal((engine.match(/function\s+kaoPlay\b/g) || []).length, 1, 'tek oynatma işlevi');
});

check('dokunma hedefi: iki ses düğmesi CSS\'ten ≥44 px çözülür', () => {
  const css = read('app/kao.css');
  const heightOf = (selector) => {
    const block = css.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}[^{]*\\{([^}]*)\\}`));
    assert.ok(block, `${selector} kuralı bulunmalı`);
    const min = /min-height:(\d+)px/.exec(block[1]);
    assert.ok(min, `${selector} min-height taşımalı`);
    return Number(min[1]);
  };
  assert.ok(heightOf('\\.kao-audio') >= 44, 'yavaş düğmesi ≥44 px');
  assert.ok(heightOf('\\.kao-audio-natural') >= 44, 'doğal düğmesi ≥44 px');
});

check('K3P-20 sınırı: çip sürükleme onpointerdown\'ı yalnız dizme çiplerinde; iki kart birbirini bozmaz', () => {
  const engine = read('app/core/quranLearn.js');
  // Sürükleme kancası çip yolunda (order/build) koşullu; ses denetiminde geçmez.
  assert.match(engine, /onpointerdown:order&&disabled===false\?'window\.SeymaQuranLearn\.kaoDrag/, 'sürükleme çip yolunda koşullu');
  assert.ok(!/kao-audio[^']*kaoDrag/.test(engine), 'ses düğmesi sürükleme kancası taşımaz');
  // Dizme görevinde çipler sürüklenebilir; ses denetimi de orada aynı iki düğmedir.
  const buildTask = taskAt(12, false);
  if (buildTask && buildTask.kind === 'order' || (buildTask && buildTask.kind === 'build')) {
    const html = api.kaoTaskHTML(buildTask);
    assert.ok(/data-kao-drop=""/.test(html), 'dizme görevi bırakma bölgesi taşır');
    assert.ok((html.match(/onpointerdown="window\.SeymaQuranLearn\.kaoDrag/g) || []).length > 0, 'dizme çipleri sürüklenir');
    const block = audioBlock(html);
    assert.ok(!/onpointerdown/.test(block), 'aynı görevde ses denetimi yine onpointerdown taşımaz');
  }
});

check('ayarlar metni iki düğmeyi anlatır (uzun basma anlatısı kalktı)', () => {
  const engine = read('app/core/quranLearn.js');
  assert.ok(!/basılı tutmak doğal hızı çalar/.test(engine), 'eski ayar anlatısı yok');
  assert.match(engine, /◖ Yavaş ölçülü okur, ◗ Doğal akıcı okur/, 'ayar açıklaması iki düğmeyi anlatır');
});

console.log(`test_k3p_21: PASS (${passed} kontrol — uzun basma kalktı, iki görünür düğme, 45 yüzey, ≥44 px, K3P-20 sınırı, ayar metni)`);
