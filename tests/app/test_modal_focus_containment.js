#!/usr/bin/env node
// Modal odak hapsi: tarayıcı, ağ, localStorage ve gerçek veri kullanmaz.
// Kaynak sözleşmesini ve ortak Tab/Shift+Tab/Escape davranışını sentetik VM'de
// doğrular; modal dışındaki normal sayfa alanlarını bilerek etkilemez.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('app.js', 'utf8');

function ok(name, condition) {
  assert.equal(condition, true, name);
  console.log('PASS  ' + name);
}

function section(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert(start >= 0 && end > start, startMarker + ' kaynak bölümü bulunamadı');
  return source.slice(start, end);
}

console.log('== Modal odak hapsi regresyonu ==\n');

const sharedStart = source.indexOf('var MODAL_FOCUS_SELECTOR=');
const sharedEnd = source.indexOf('\nApp.openReminderDigest=', sharedStart);
assert(sharedStart >= 0 && sharedEnd > sharedStart, 'ortak modal klavye sözleşmesi bulunamadı');
const sharedSource = source.slice(sharedStart, sharedEnd);

ok('odak seçicisi tüm metin denetimlerini kapsıyor',
  sharedSource.includes('input:not([disabled]):not([type="hidden"])') &&
  sharedSource.includes('select:not([disabled])') &&
  sharedSource.includes('textarea:not([disabled])') &&
  sharedSource.includes('a[href]'));
ok('ortak handler Tab olayını iç modala sınırlandırıyor',
  sharedSource.includes('if(e.stopPropagation) e.stopPropagation();') &&
  sharedSource.includes('modalFocusableNodes(e.currentTarget)'));

const modalSections = [
  ['Günlük Işığı', section('function journalModalHTML(){', '\nfunction updateJournalUI(){')],
  ['Kriz Odası', section('function crisisModalHTML(){', '\nfunction haritaHTML')],
  ['İman Köşesi', section('function faithCornerOverlayHTML(){', '\nfunction saygiPreviewHubHTML')],
  ['Kıble Pusulası', section('function qiblaOverlayHTML(){', '\nApp.openQibla=')],
  ['Günün Öncüsü', section('function saygiPersonModalHTML(){', '\nfunction saygiFloatingReadHTML')],
  ['Ortak hub kabuğu', section('function overlayShell(', '\nfunction soulOverlayShell(')],
  ['Zihin-beden hub kabuğu', section('function soulOverlayShell(', '\nfunction bookStatusChip')],
  ['Kısa düzenleme kabuğu', section('function compactModalShell(', '\nfunction bookEditModal')],
  ['ÆON ek sayfası', section('function aeonAttachSheetHTML(){', '\nApp.aeonOpenAttachSheet=')],
  ['Doğrudan uygulama modalları', section('function modalsHTML(){', '\n// boot')],
];

modalSections.forEach(([name, text]) => {
  ok(name + ' gerçek dialog semantiği taşıyor',
    text.includes('role="dialog"') && text.includes('aria-modal="true"') && text.includes('tabindex="-1"'));
  ok(name + ' ortak Tab/Escape handlerına bağlı', text.includes('App.onModalKeydown(event,'));
  ok(name + ' arka planı focusable button değil', !text.includes('role="button" tabindex="0"'));
});

const zikr = section('function zikroverlayHTML(){', '\nfunction zikrViewBodyHTML');
const quran = section('function quranJourneyOverlayHTML(){', '\nfunction quranRemoteStatusHTML');
ok('Zikirmatik ortak handlerdan yararlanıyor',
  zikr.includes('App.onZikrKeydown(event)') && source.includes('App.onZikrKeydown=function(e){\n  return App.onModalKeydown(e,App.closeZikr);'));
ok('Kur’an not alanları ortak handlerdan yararlanıyor',
  quran.includes('App.onQuranKeydown(event)') && source.includes('App.onQuranKeydown=function(e){'));

const state = { closed: 0 };
const documentStub = { activeElement: null };
const openingDialog = { focus() { documentStub.activeElement = openingDialog; } };
documentStub.getElementById = (id) => id === 'opening-dialog' ? openingDialog : null;
const sandbox = {
  App: {
    closeRoom() {},
    closeReminderCenter() {},
    closeZikr() {},
    closeQuranJourney() {},
    closeJournalModal() { state.closed += 1; },
  },
  document: documentStub,
};
vm.runInNewContext(sharedSource, sandbox, { filename: 'app.js#modal-focus-contract' });

sandbox.focusModalDialog('opening-dialog');
ok('modal açılışında odak dialoga devrediliyor', documentStub.activeElement === openingDialog);

function focusable(name, options = {}) {
  const node = {
    name,
    disabled: !!options.disabled,
    hidden: !!options.hidden,
    getAttribute(attr) { return attr === 'aria-hidden' ? (options.ariaHidden ? 'true' : null) : null; },
    focus() { documentStub.activeElement = node; },
  };
  return node;
}

const invisible = focusable('gizli', { ariaHidden: true });
const first = focusable('ilk-butonu');
const textarea = focusable('yansıma-textarea');
const last = focusable('son-select');
const disabled = focusable('pasif', { disabled: true });
const dialog = {
  querySelectorAll(selector) {
    assert.equal(selector, sandbox.MODAL_FOCUS_SELECTOR, 'yalnız merkezi odak seçicisi kullanılır');
    return [invisible, first, textarea, last, disabled];
  },
};

function eventFor(key, active, shiftKey = false) {
  documentStub.activeElement = active;
  let prevented = false;
  let stopped = false;
  return {
    key,
    shiftKey,
    currentTarget: dialog,
    preventDefault() { prevented = true; },
    stopPropagation() { stopped = true; },
    get prevented() { return prevented; },
    get stopped() { return stopped; },
  };
}

let event = eventFor('Tab', last);
sandbox.App.onModalKeydown(event, sandbox.App.closeJournalModal);
ok('Tab son selectten ilk etkin kontrole sarıyor', event.prevented && event.stopped && documentStub.activeElement === first);

event = eventFor('Tab', first, true);
sandbox.App.onModalKeydown(event, sandbox.App.closeJournalModal);
ok('Shift+Tab ilk kontrolden son selecte sarıyor', event.prevented && event.stopped && documentStub.activeElement === last);

event = eventFor('Tab', textarea);
sandbox.App.onModalKeydown(event, sandbox.App.closeJournalModal);
ok('Textarea içindeki ara Tab doğal sırayı koruyor', !event.prevented && event.stopped && documentStub.activeElement === textarea);

event = eventFor('Escape', textarea);
sandbox.App.onModalKeydown(event, sandbox.App.closeJournalModal);
ok('Escape yalnız aktif modalın mevcut kapatma davranışını çağırıyor', event.prevented && event.stopped && state.closed === 1);

const agentDocs = fs.readFileSync('AGENTS.md', 'utf8');
const claudeDocs = fs.readFileSync('CLAUDE.md', 'utf8');
ok('kalıcı ekip kuralı AGENTS.md içinde kayıtlı', agentDocs.includes('Modal keyboard contract') && agentDocs.includes('App.onModalKeydown'));
ok('kalıcı ekip kuralı CLAUDE.md içinde eşlenik', claudeDocs.includes('Modal keyboard contract') && claudeDocs.includes('App.onModalKeydown'));

console.log('\nDone.');
