#!/usr/bin/env node
// Kontrollü yerel görsel QA sözleşmesi. Ağ, browser ve gerçek veri kullanmaz.

const assert = require('node:assert/strict');
const fs = require('node:fs');

const sync = fs.readFileSync('sync.js', 'utf8');
const agents = fs.readFileSync('AGENTS.md', 'utf8');
const claude = fs.readFileSync('CLAUDE.md', 'utf8');
const skill = fs.readFileSync('.claude/skills/run-seyma/SKILL.md', 'utf8');

function ok(name, condition) {
  assert.equal(condition, true, name);
  console.log('PASS  ' + name);
}

console.log('== Kontrollü yerel görsel QA güvenlik sözleşmesi ==\n');

const devStart = sync.indexOf('function devOrigin(){');
const devEnd = sync.indexOf('\nfunction syncForced(){', devStart);
const devOrigin = sync.slice(devStart, devEnd);
ok('Guard 1 loopback ana bilgisayarlarını kapsıyor',
  devOrigin.includes("h==='localhost'") &&
  devOrigin.includes("h==='127.0.0.1'") &&
  devOrigin.includes("h==='::1'"));

const pushStart = sync.indexOf('function doPushInner(data){');
const pushEnd = sync.indexOf('\n// QY-08', pushStart);
const push = sync.slice(pushStart, pushEnd);
ok('ana veri pushu Guard 1den sonra ancak uzak yazıya ulaşabiliyor',
  push.indexOf('if(devOrigin() && !syncForced())') >= 0 &&
  push.indexOf('if(devOrigin() && !syncForced())') < push.indexOf('pushWithCfg(c,data,pending)'));
ok('schedule Guard 1de yerel kuyruğu yazıya çevirmiyor',
  sync.includes('schedule:function(data){') &&
  sync.includes("if(devOrigin() && !syncForced()){ setStatus('idle'); return; }"));
ok('Kur’an outbox yazısı da Guard 1de engelleniyor',
  sync.includes("quran_outbox: yerel ortamdan push engellendi"));

[['AGENTS.md', agents], ['CLAUDE.md', claude], ['run-seyma', skill]].forEach(([name, text]) => {
  ok(name + ' kontrollü ajan ekran görüntüsü iznini kaydediyor',
    text.includes('127.0.0.1:9000') && text.includes('Guard 1'));
  ok(name + ' force-sync ve gerçek profil sınırını koruyor',
    text.includes('forceSync=1') && text.includes('seyma-sync-force') &&
    (text.includes('gerçek') || text.includes('real')));
});

console.log('\nDone.');
