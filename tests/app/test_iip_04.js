#!/usr/bin/env node
// IIP-04 — hub hiyerarşisi, dar/büyük metin ve navigation semantics contract.
// Kaynak/CSS okur; browser, ağ, localStorage, token ve kişisel veri kullanmaz.

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'app/core/saygi.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'app/styles.css'), 'utf8');
const navStart = source.indexOf('function faithNavHTML');
const navEnd = source.indexOf('function saygiHTML', navStart);
const nav = source.slice(navStart, navEnd);
const hubStart = source.indexOf('function saygiPreviewHubHTML');
const hubEnd = source.indexOf('function faithNavHTML', hubStart);
const hub = source.slice(hubStart, hubEnd);
let checks = 0;

function check(condition, message) {
  assert.ok(condition, message);
  checks += 1;
}

check(navStart >= 0 && navEnd > navStart, 'faith navigation function remains an isolated source boundary');
check(nav.includes("[['oz','Bugün','Öz'],['oncu','İlham','Öncü'],['iman','İbadet','İman'],['zikir','Zikir','Zikir'],['rapor','Ritim','Rapor']]"),
  'five legacy hub ids remain in order behind the approved visible names');
check(nav.includes("[['oz','Bugün','Öz'],['oncu','İlham','Öncü'],['iman','İbadet','İman'],['rapor','Ritim','Rapor']]"),
  'feature-hidden fallback keeps the four legacy ids in order');
check(/onclick="App\.setFaithTab\(\\'.*?x\[0\].*?\\'\)"/.test(nav), 'existing tab handler call graph is preserved');
check(nav.includes("aria-current=\"'+(on?'page':'false')+'\""), 'selected section keeps explicit current-page semantics');
check(nav.includes("aria-pressed=\"'+(on?'true':'false')+'\""), 'selected section has a machine-readable pressed state');
check(nav.includes("aria-current=\"'+(on?'page':'false')+'\""), 'unselected sections preserve the existing aria-current=false contract');
check(!nav.includes('role="tab"'), 'no partial ARIA tab pattern was introduced');

check(hub.includes("tab==='oncu'"), 'Öncü positive state remains routed');
check(hub.includes("tab==='iman'"), 'İman positive state remains routed');
check(hub.includes("tab==='zikir'&&zikrVisible()"), 'Zikir visibility guard and return state remain routed');
check(hub.includes("tab==='rapor'"), 'Rapor positive state remains routed');
check(source.includes('function saygiLoadingHTML(){return \'<div class="saygi-loading" role="status">'),
  'loading state keeps a local status surface');
check(source.includes('class="saygi-error"') && source.includes('App.refreshSaygi()'),
  'source-error state keeps visible retry behavior');
check(source.includes('Yakında açılıyor'), 'empty/not-live state remains explicit');
check(source.includes("return '<section class=\"saygi-page\">'+faithNavHTML()+spiritBarHTML()+saygiPreviewHubHTML"),
  'hub shell order remains nav, spirit bar and selected section');
check(/tab==='iman'.*qiblaHubCardHTML\(\)/.test(hub) && /else body=.*quranHub\(\)/.test(hub),
  'approved IIP-09 ownership keeps qibla in worship and Quran in today');

check(css.includes('grid-template-columns:repeat(auto-fit,minmax(0,1fr))'),
  'four- and five-section navs share the same compact responsive grid');
check(css.includes('white-space:normal;line-height:1.1;overflow-wrap:anywhere;text-align:center'),
  'nav labels can wrap at 320px and 200% text');
check(css.includes('.faith-v2-nav button.on::after'), 'selected section has shape plus text/color emphasis');
check(css.includes('.faith-v2-nav button:focus-visible'), 'nav keyboard focus remains visible');
check(css.includes('max-width:8.5em;line-height:1.1;text-align:center;white-space:normal;overflow-wrap:anywhere'),
  'card status pills wrap instead of clipping narrow layouts');
check(css.includes('font-variant-numeric:tabular-nums;line-height:1.15;overflow-wrap:anywhere'),
  'card metrics wrap instead of forcing clipped single-line text');
check(css.includes('overflow-wrap:anywhere;white-space:normal}.hub-v2-preview-foot b'),
  'card footer copy and action share a wrap-safe spacing contract');
check(css.includes('.saygi-page{') && css.includes('gap:12px;padding:2px 0 12px;') &&
  css.includes('.saygi-preview-hub{display:flex;flex-direction:column;gap:12px;margin:0 0 12px;}'),
  'hub/common-tool vertical spacing is unified at 12px');
check(css.includes('@media(max-width:389px)') && css.includes('@media(prefers-reduced-motion:reduce)'),
  'narrow layout and reduced-motion variants remain explicit');

console.log(`IIP-04 source/style contract: PASS (${checks} checks; no personal data read)`);
