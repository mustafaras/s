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

console.log('KAO2 components: PASS (escape, erişilebilirlik, güvenli eylem, ölçü ve durum bileşenleri)');
