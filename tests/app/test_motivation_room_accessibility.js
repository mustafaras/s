#!/usr/bin/env node
// Terapi Odası modalının klavye/focus sözleşmesi.
// Kaynak sözleşmesi + sentetik handler davranışı; browser, ağ ve gerçek veri yok.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('app.js', 'utf8');
const roomStart = source.indexOf('function roomOverlayHTML(){');
const roomEnd = source.indexOf('\nfunction roomBodyHTML', roomStart);
assert(roomStart >= 0 && roomEnd > roomStart, 'roomOverlayHTML bulunamadı');
const roomSource = source.slice(roomStart, roomEnd);

const handlerStart = source.indexOf('App.onReminderKeydown=function(e){');
const handlerEnd = source.indexOf('\nApp.openReminderDigest=', handlerStart);
assert(handlerStart >= 0 && handlerEnd > handlerStart, 'ortak modal keydown handler bulunamadı');
const handlerSource = source.slice(handlerStart, handlerEnd);

function ok(name, condition) {
  assert.equal(condition, true, name);
  console.log('PASS  ' + name);
}

console.log('== Terapi Odası klavye/focus sözleşmesi ==\n');

ok('modal dış kabuk focus sırasına alınmıyor',
  roomSource.includes('id="sey-room-overlay"') &&
  !roomSource.includes('id="sey-room-overlay" onclick="App.closeRoom()" role="button"') &&
  !roomSource.includes('id="sey-room-overlay" onclick="App.closeRoom()" tabindex="0"'));
ok('modal içeriği gerçek dialog semantiği taşıyor',
  roomSource.includes('id="sey-room-dialog" role="dialog"') &&
  roomSource.includes('aria-modal="true"') &&
  roomSource.includes('aria-labelledby="sey-room-title"') &&
  roomSource.includes('tabindex="-1"'));
ok('dialog ortak Escape/Tab handlerına bağlı',
  roomSource.includes('onkeydown="App.onReminderKeydown(event)"'));
ok('kapanış animasyonu yeni dialog kabuğunu hedefliyor',
  source.includes("getElementById('sey-room-dialog')") && !source.includes("getElementById('sey-room-sheet')"));
ok('oda açılırken dialog focus alıyor',
  source.slice(source.indexOf('App.openRoom=function(){'), source.indexOf('\nApp.closeRoom=', source.indexOf('App.openRoom=function(){')))
    .includes("getElementById('sey-room-dialog')"));
ok('yansıma yazarken handler yeniden render etmiyor',
  !source.slice(source.indexOf('App.setMotivationReflection=function(el){'), source.indexOf('\nApp.toggleMotivationExamples=', source.indexOf('App.setMotivationReflection=function(el){'))).includes('render()'));

const state = { roomClosed: 0, reminderClosed: 0 };
const documentStub = { activeElement: null };
const sandbox = {
  App: {
    closeRoom() { state.roomClosed += 1; },
    closeReminderCenter() { state.reminderClosed += 1; },
  },
  document: documentStub,
};
vm.runInNewContext(handlerSource, sandbox, { filename: 'app.js#onReminderKeydown' });

const first = { focus() { documentStub.activeElement = first; } };
const middle = { focus() { documentStub.activeElement = middle; } };
const last = { focus() { documentStub.activeElement = last; } };
const roomDialog = {
  id: 'sey-room-dialog',
  querySelectorAll() { return [first, middle, last]; },
};

function eventFor(key, active, shiftKey = false, currentTarget = roomDialog) {
  documentStub.activeElement = active;
  let prevented = false;
  return {
    key,
    shiftKey,
    currentTarget,
    preventDefault() { prevented = true; },
    get prevented() { return prevented; },
  };
}

let e = eventFor('Tab', last);
sandbox.App.onReminderKeydown(e);
ok('Tab son kontrolden ilk kontrole sarıyor', e.prevented && documentStub.activeElement === first);

e = eventFor('Tab', first, true);
sandbox.App.onReminderKeydown(e);
ok('Shift+Tab ilk kontrolden son kontrole sarıyor', e.prevented && documentStub.activeElement === last);

e = eventFor('Tab', middle);
sandbox.App.onReminderKeydown(e);
ok('Tab ara kontrolde doğal ilerlemeyi bozmuyor', !e.prevented && documentStub.activeElement === middle);

e = eventFor('Escape', middle);
sandbox.App.onReminderKeydown(e);
ok('Escape Terapi Odasını kapatıyor', e.prevented && state.roomClosed === 1 && state.reminderClosed === 0);

e = eventFor('Escape', middle, false, { id: 'sey-reminder-screen', querySelectorAll() { return [first, last]; } });
sandbox.App.onReminderKeydown(e);
ok('Reminder Center Escape davranışı korunuyor', e.prevented && state.reminderClosed === 1 && state.roomClosed === 1);

console.log('\nDone.');
