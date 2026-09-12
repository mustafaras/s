// MON-42 — SeymaMessaging read-only chronology/render boundary.
// The fixture loads only the new registry with synthetic resolvers: no app.js,
// browser, localStorage, network, provider key, panel or real media is used.
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const source = fs.readFileSync(path.join(repoRoot, 'app/core/messaging.js'), 'utf8');
const appSource = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
const forbidden = [
  /\bfetch\s*\(/, /XMLHttpRequest/, /localStorage/, /navigator/, /\bNotification\b/,
  /SeySync/, /pushNow/, /pushPing/, /\bghToken\b/, /\bopenaiKey\b/, /\bpanel\b/, /\breminder\b/i
];
forbidden.forEach((pattern) => assert.equal(pattern.test(source), false, `messaging registry purity: ${pattern}`));

const LONG = 'Uzun mesaj '.repeat(30).trim();
const today = '2026-09-11';
const data = {
  settings: {},
  luna: { qa: [{ question: LONG, answer: LONG, ts: `${today}T18:00:00.000Z` }] },
  aeon: { qa: [{ id: 'q-1', question: LONG, ts: `${today}T19:20:00.000Z`, answer: LONG, answerMsgId: 'source-1' }] },
};
const ui = {
  askKind: null, askQuestion: '', lunaError: null, aeonError: null, lunaDraft: '',
  aeonDraft: '', aeonRecActive: false, aeonUploading: false, aeonShowAllHistory: false,
  aeonExpanded: {},
};
const notifications = [
  { id: 'source-1', text: 'Kaynak cevap bildirimi', ts: `${today}T19:30:00.000Z`, read: true },
  { id: 'after-1', text: 'Sonraki yeni mesaj', ts: `${today}T19:40:00.000Z`, read: true },
];
let lastSeen = null;
let lastDate = null;
const context = {
  window: {}, console, Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, isNaN,
};
context.window.window = context.window;
context.window.SeymaMessaging = undefined;
vm.createContext(context);
vm.runInContext(source, context, { filename: 'app/core/messaging.js' });
const M = context.window.SeymaMessaging;

function icon(name) { return `<i data-icon="${name}"></i>`; }
function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, (x) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x])); }
function fmt(value) { const d = new Date(value); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`; }
function addDays(value, days) { const d = new Date(`${value}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return fmt(d); }

assert.equal(M.registerMessaging({}), false, 'registry fails closed on incomplete dependency bag');
assert.equal(M.registerMessaging({
  data: () => data, ui: () => ui, icon, esc, fmt, todayStr: () => today, addDays,
  notifList: () => notifications, lunaTodayCount: () => 0, dailyLimit: () => 5,
  hasLunaKey: () => false, attachmentAccept: () => '.pdf',
  shouldShowAeonNotifyBanner: () => false, aeonNotifyBannerHTML: () => '',
  getAeonLastSeenSort: () => lastSeen, setAeonLastSeenSort: (value) => { lastSeen = value; },
  getAeonLastRenderedDateStr: () => lastDate, setAeonLastRenderedDateStr: (value) => { lastDate = value; },
}), true, 'registry accepts the complete dependency bag exactly once');
assert.equal(M.registerMessaging({}), false, 'registry rejects a second registration');

const beforeData = JSON.stringify(data);
const beforeUi = JSON.stringify(ui);
const html = M.mesajHTML();
assert.match(html, /Luna modu/);
assert.match(html, /ÆON akışı/);
assert.match(M.aeonAttachSheetHTML(), /aeon-attach-dialog/);
assert.match(html, /id="aeon-file-input"[^>]*accept="\.pdf"/);
assert.equal(JSON.stringify(data), beforeData, 'render registry does not mutate conversation data');
assert.equal(JSON.stringify(ui), beforeUi, 'render registry does not mutate UI state');
assert.match(appSource, /function mesajHTML\(\)\{ return SEYMA_RENDER\.mesajHTML\.apply\(null,arguments\); \}/, 'app mesaj entry keeps the render shim');

const sourceIndex = html.indexOf('Kaynak cevap bildirimi');
const afterIndex = html.indexOf('Sonraki yeni mesaj');
assert.equal(sourceIndex, -1, 'answer source notification is deduped from the conversation');
assert.ok(afterIndex > -1, 'independent later notification remains visible');
assert.ok(html.indexOf('Uzun mesaj') > -1, 'long Luna/ÆON content remains complete in the HTML contract');

ui.aeonExpanded['aeon-bubble-a-q-1'] = true;
const expanded = M.mesajHTML();
assert.match(expanded, /id="aeon-bubble-a-q-1"[^>]*>[\s\S]*data-exp="1"/);
assert.ok(lastSeen, 'chronology resolver receives the newest sort key');
assert.ok(lastDate, 'chronology resolver receives the newest visible date');

console.log('MON-42 messaging boundary: PASS');
