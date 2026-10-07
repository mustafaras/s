'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');
const source = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearnViews.js'), 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: 'app/core/quranLearnViews.js' });
const api = sandbox.window.SeymaQuranLearnViews;
assert.equal(typeof api.groupedList, 'function', 'groupedList bileşeni olmalı');
assert.equal(typeof api.switchRow, 'function', 'switchRow bileşeni olmalı');
assert.equal(typeof api.progressRing, 'function', 'progressRing bileşeni olmalı');
assert.equal(typeof api.choice, 'function', 'choice bileşeni olmalı');
assert.equal(typeof api.feedbackSheet, 'function', 'feedbackSheet bileşeni olmalı');
assert.equal(typeof api.primaryButton, 'function', 'primaryButton bileşeni olmalı');

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);
assert.equal(api.register({ esc, icon: () => '<svg aria-hidden="true"><path></path></svg>' }), true);
assert.equal(api.register({ esc, icon: () => '' }), false, 'bağımlılıklar ikinci kez değişmemeli');

const list = api.groupedList([{
  title: '<Ayarlar>',
  rows: [
    { icon: 'gear', title: 'Ad & değer', value: '<önizleme>', action: 'kaoOpen' },
    { icon: 'book', title: 'İç bağlantı', value: 'Aç', href: '#reader' },
    { icon: 'gear', title: 'Pasif', value: '', action: 'kaoOpen();alert(1)' },
    { icon: 'book', title: 'Güvensiz bağlantı', value: '', href: 'javascript:alert(1)' },
    { icon: 'book', title: 'Parametreli eylem', value: '', action: { name: 'App.kaoNav', args: ['settings', 7] } },
    { icon: 'book', title: 'Güvensiz parametre', value: '', action: { name: 'kaoNav', args: [{}] } }
  ],
  footer: 'Güvenli & kısa'
}]);
assert.match(list, /&lt;Ayarlar&gt;/);
assert.match(list, /Ad &amp; değer/);
assert.match(list, /&lt;önizleme&gt;/);
assert.match(list, /Güvenli &amp; kısa/);
assert.match(list, /<button type="button" class="kao-group-row"[^>]*onclick="App\.kaoOpen\(\)"/);
assert.match(list, /<a class="kao-group-row" href="#reader"/);
assert.match(list, /<button type="button" class="kao-group-row" disabled/);
assert.match(list, /onclick="App\.kaoNav\(&quot;settings&quot;,7\)"/);
assert.doesNotMatch(list, /alert\(1\)/);
assert.doesNotMatch(list, /javascript:/);
assert.equal((list.match(/class="kao-group-row"/g) || []).length, 6);
assert.equal((list.match(/class="kao-group-separator"/g) || []).length, 5, 'ayırıcı son ikon sütunundan sonra satır boyunca sürmeli');

const switchOn = api.switchRow({ label: '<Ses>', on: true, action: 'kaoToggleSound' });
const switchOff = api.switchRow({ label: 'Ses', on: false, action: 'notAHandler' });
assert.match(switchOn, /role="switch" aria-checked="true"/);
assert.match(switchOn, /aria-label="&lt;Ses&gt;"/);
assert.match(switchOn, /onclick="App\.kaoToggleSound\(\)"/);
assert.match(switchOff, /role="switch" aria-checked="false"/);
assert.doesNotMatch(switchOff, /onclick=/);

const ringLow = api.progressRing(-20, 28, '<Tamamlanma>');
const ringHigh = api.progressRing(120, 64, 'İlerleme');
assert.match(ringLow, /role="img" aria-label="&lt;Tamamlanma&gt;: %0"/);
assert.match(ringLow, /class="kao-progress-ring-svg kao-progress-ring-28"/);
assert.match(ringLow, /width="28" height="28"/);
assert.match(ringLow, /aria-hidden="true"/);
assert.match(ringHigh, /aria-label="İlerleme: %100"/);
assert.match(ringHigh, /class="kao-progress-ring-text" aria-hidden="true">%100</, "K2F-35: görünür halka metni %N");
assert.match(ringHigh, /class="kao-progress-ring-svg kao-progress-ring-64"/);
assert.match(ringHigh, /width="64" height="64"/);
assert.equal((api.progressRing(47, 999, 'İlerleme').match(/kao-progress-ring-44/g) || []).length, 1);

const correct = api.choice({ label: '<Doğru>', state: 'correct' });
const wrong = api.choice({ label: 'Seçim', state: 'wrong' });
const dim = api.choice({ label: 'Diğer', state: 'dim' });
assert.match(correct, /class="kao-choice kao-choice-correct"/);
assert.match(correct, /aria-hidden="true">✓</);
assert.match(correct, /class="kao-sr-only">Doğru cevap</);
assert.match(correct, /&lt;Doğru&gt;/);
assert.match(wrong, /class="kao-choice kao-choice-wrong"/);
assert.match(wrong, /aria-hidden="true">✕</);
assert.match(wrong, /class="kao-sr-only">Senin seçimin</);
assert.match(dim, /class="kao-choice kao-choice-dim"/);
assert.match(api.choice({ label: 'Boş', state: 'unexpected' }), /class="kao-choice kao-choice-idle"/);

// K2F-40: görev şıkkı (düğme kipi) Views.choice'tan gelir; motorda kopya kalmaz.
const btnIdle = api.choice({ button: true, label: 'A<b>', onclick: "App.kaoAnswer('t','a')" });
assert.equal(btnIdle, `<button type="button" onclick="App.kaoAnswer('t','a')">A&lt;b&gt;</button>`, 'düğme kipi: idle şıkkta sınıf yok');
const btnWrong = api.choice({ button: true, state: 'wrong', label: 'x', extraClasses: ['kao-chip'], pressed: true, disabled: true, onclick: 'f()' });
assert.equal(btnWrong, '<button type="button" class="kao-choice-wrong kao-chip" aria-pressed="true" disabled onclick="f()"><span class="kao-choice-mark" aria-hidden="true">✕</span><span class="kao-sr-only">Senin seçimin</span>x</button>');
const btnAr = api.choice({ button: true, state: 'correct', label: 'ب', pronunciation: 'be', arabic: true, labelHtml: '<b>H</b>', pressed: false });
assert.match(btnAr, /aria-pressed="false"/);
assert.match(btnAr, / data-kao-ar aria-label="ب, okunuşu be, Doğru cevap"/);
assert.match(btnAr, /<\/span><b>H<\/b><\/button>$/, 'labelHtml olduğu gibi gelir');
assert.match(api.choice({ label: 'Boş' }), /^<div class="kao-choice kao-choice-idle">/, 'düğme kipi kapalıyken div çıktısı değişmez');
const engine = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');
const taskStart = engine.indexOf('function kaoTaskHTML(');
const taskBody = engine.slice(taskStart, engine.indexOf('function currentTask(', taskStart));
assert.ok(taskStart > 0 && taskBody.length > 500, 'kaoTaskHTML gövdesi bulunmalı');
assert.match(taskBody, /kaoViewsApi\(\)\.choice\(\{button:true/, 'görev şıkları Views.choice ile kurulmalı');
assert.doesNotMatch(taskBody, /kao-choice-mark|kao-sr-only/, 'şık işaret/ekran okuyucu HTML\'i motorda kopyalanmamalı');

const feedback = api.feedbackSheet({
  tone: 'success', title: '<Başlık>', body: 'Açıklama & not',
  actions: [{ label: 'Devam', action: 'kaoContinue' }, { label: 'Geçersiz', action: 'save' }]
});
assert.match(feedback, /role="status" aria-live="polite"/);
assert.match(feedback, /&lt;Başlık&gt;/);
assert.match(feedback, /Açıklama &amp; not/);
assert.match(feedback, /onclick="App\.kaoContinue\(\)"/);
assert.doesNotMatch(feedback, /onclick="App\.save/);
assert.equal((feedback.match(/class="kao-feedback-action"/g) || []).length, 2);

const primary = api.primaryButton({ label: '<Devam>', action: 'kaoContinue' });
assert.match(primary, /<button type="button" class="kao-primary"/);
assert.match(primary, /aria-label="&lt;Devam&gt;"/);
assert.match(primary, /onclick="App\.kaoContinue\(\)"/);
assert.equal((primary.match(/class="kao-primary"/g) || []).length, 1);
assert.doesNotMatch(api.primaryButton({ label: 'Tehlike', action: 'kaoClose();alert(1)' }), /alert\(1\)/);

const css = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
for (const selector of ['.kao-group-row', '.kao-switch-row', '.kao-choice', '.kao-feedback-action', '.kao-primary']) {
  const rule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(match => match[1].split(',').map(part => part.trim()).includes(selector));
  assert.ok(rule, `${selector} CSS kuralı olmalı`);
  assert.match(rule[2], /min-height\s*:/, `${selector} sabit yükseklik yerine min-height kullanmalı`);
  assert.doesNotMatch(rule[2], /(?:^|;)\s*height\s*:\s*\d+px/, `${selector} sabit yüksekliğe kilitlenmemeli`);
}
assert.match(css, /:focus-visible[^{}]*\{[^}]*outline\s*:\s*3px/);
assert.match(css, /\.kao-group-separator\{[^}]*left:\s*51px/);
assert.match(css, /@media \(forced-colors:active\)/);

// D2F-06 (denetim raporu §8 "doğrulanamayanlar"): K2F-40 "ses" (audioOnly) görevinin şık ekranını Views.choice düğme
// kipine taşıdı; denetim bu türü sentetik ortamda ürettiği için ekran doğrulanamamıştı. Görev burada GERÇEK kurucuyla
// (dersin gerçek oynatımı) üretilir; cevapsız/doğru/yanlış üç durumda şık ekranı sınanır. Görev nesnesi elle kurulmaz.
const kaoHarness = require('./helpers/kao-harness');
const AUDIO_LESSON = 'u01.01';
const AUDIO_BTN = '<button type="button" class="kao-audio" aria-label="Yavaş dinlemek için dokun; doğal hız için 350 milisaniye basılı tut"';

// Görevlerde şık bloklarını (Views.choice düğme kipinin ürettiği) görev bölümünden çeker.
function kaoChoicesBlock(html) {
  const match = /<div class="kao-choices">([\s\S]*?)<\/div><p class="kao-live"/.exec(html);
  return match ? match[1] : null;
}
// Views.choice düğme kipinin SÖZLEŞMESİ (ses görevi: etiketler Türkçe, sıra değil): motor çıktısını bu bağımsız
// orakula karşılaştırmak, gösterimin gerçekten düğme kipinden geldiğini ve sınıf/kapalılık sırasını doğrular.
function kaoExpectedChoices(task, panel, choiceId) {
  return task.choices.map((choice) => {
    const state = panel ? (choice.correct === true ? 'correct' : (choice.choiceId === choiceId ? 'wrong' : 'dim')) : 'idle';
    const mark = state === 'correct' ? '✓' : (state === 'wrong' ? '✕' : '');
    const screenText = state === 'correct' ? 'Doğru cevap' : (state === 'wrong' ? 'Senin seçimin' : '');
    const classes = state === 'idle' ? '' : ` class="kao-choice-${state}"`;
    const markHtml = mark ? `<span class="kao-choice-mark" aria-hidden="true">${mark}</span><span class="kao-sr-only">${screenText}</span>` : '';
    return `<button type="button"${classes}${panel ? ' disabled' : ''} onclick="App.kaoAnswer('${task.id}','${choice.choiceId}')">${markHtml}${esc(choice.label)}</button>`;
  }).join('');
}
// Ses görevini gerçek oynatımla yakalar: `answer` doğru ya da yanlış şıkkı seçtirir; görev nesnesi elle kurulmaz.
function kaoAudioShot(answer) {
  const t = kaoHarness.bootKao({ seeded: true });
  let shot = null;
  const walked = kaoHarness.walkLesson(t, AUDIO_LESSON, { answer, visit(task) {
    if (!task.audioOnly || shot) return;
    const idle = t.api.kaoOverlayHTML(t.NOW);
    const pick = answer === 'wrong' ? task.choices.find((c) => !c.correct) : task.choices.find((c) => c.correct);
    const result = t.api.kaoAnswer(task.id, pick.choiceId);
    shot = { task, idle, after: t.api.kaoOverlayHTML(t.NOW), result };
  }});
  assert.equal(walked, true, `${answer}: ses görevli ders baştan sona oynatılmalı`);
  assert.ok(shot, `${answer}: "ses" türü görev gerçek kurucuyla üretilebilmeli (rapor §8)`);
  assert.equal(!!(shot.result && shot.result.correct), answer !== 'wrong', `${answer}: cevap doğruluk durumu`);
  return shot;
}

const audioShots = { correct: kaoAudioShot('correct'), wrong: kaoAudioShot('wrong') };
for (const [ad, answer] of [['doğru', 'correct'], ['yanlış', 'wrong']]) {
  const { task, idle, after } = audioShots[answer];
  assert.ok(task.audioOnly === true && task.choices.length >= 2, `${ad}: ses görevi (audioOnly) en az iki şıklı`);
  assert.ok(task.choices.every((choice) => !/[\u0600-\u06ff]/.test(choice.label)), `${ad}: ses görevi şıkları Türkçe anlam (dinlenen kelime açığa çıkmaz)`);
  assert.match(idle, /Dinlediğin kelimenin anlamını seç/, `${ad}: ses görevi yönergesi`);
  const idleBlock = kaoChoicesBlock(idle), afterBlock = kaoChoicesBlock(after);
  assert.ok(idleBlock && afterBlock, `${ad}: görev şık bloğu render edilmeli`);
  // Cevapsız: şıklar Views.choice düğme kipinden, sınıfsız ve etkin; durum sınıfı/kapalılık/aria-pressed yok.
  assert.equal(idleBlock, kaoExpectedChoices(task, false, ''), `${ad}: cevapsız şıklar Views.choice düğme kipi çıktısı`);
  assert.equal(idleBlock, task.choices.map((choice) => api.choice({ button: true, label: choice.label, onclick: `App.kaoAnswer('${task.id}','${choice.choiceId}')` })).join(''), `${ad}: şıklar doğrudan Views.choice düğme kipinden gelir`);
  assert.doesNotMatch(idleBlock, /kao-choice-(?:correct|wrong|dim)| disabled| aria-pressed/);
  // Yanıt sonrası: tüm şıklar kapalı; doğru/yanlış/dim durum sınıfları yine Views.choice'dan gelir.
  const chosen = task.choices.find((choice) => (answer === 'wrong' ? !choice.correct : choice.correct));
  assert.equal(afterBlock, kaoExpectedChoices(task, true, chosen.choiceId), `${ad}: yanıt sonrası şıklar Views.choice düğme kipi çıktısı`);
  assert.equal((afterBlock.match(/ disabled\b/g) || []).length, task.choices.length, `${ad}: yanıt sonrası tüm şıklar kapalı`);
  assert.equal((afterBlock.match(/class="kao-choice-correct"/g) || []).length, 1, `${ad}: tek doğru şık işaretli`);
  assert.doesNotMatch(afterBlock, /aria-pressed/, `${ad}: ses görevi sıra görevi değil; aria-pressed yok`);
  if (answer === 'wrong') assert.equal((afterBlock.match(/class="kao-choice-wrong"/g) || []).length, 1, `${ad}: seçilen yanlış şık işaretli`);
  // Ses düğmesinin erişilebilir adı üç durumda da aynı ve doğru.
  assert.ok(idle.includes(AUDIO_BTN), `${ad}: cevapsız ses düğmesi erişilebilir adı`);
  assert.ok(after.includes(AUDIO_BTN), `${ad}: yanıt sonrası ses düğmesi erişilebilir adı`);
}
assert.match(audioShots.correct.after, /kao-feedback-success/, 'doğru: başarı geri bildirimi');
assert.match(audioShots.wrong.after, /kao-feedback-warning/, 'yanlış: uyarı geri bildirimi');

console.log('KAO2 components: PASS (escape, erişilebilirlik, güvenli eylem, ölçü, durum ve ses görevi şıkları)');
