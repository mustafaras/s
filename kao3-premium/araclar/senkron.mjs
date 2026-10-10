// K3P · anti-amnezi uyum denetimi ve prompt dağıtıcı (salt-okur; hiçbir dosyaya yazmaz).
//
//   node kao3-premium/araclar/senkron.mjs             → uyum denetimi (uyumsuzlukta exit 1)
//   node kao3-premium/araclar/senkron.mjs --sonraki   → denetim + sıradaki prompt'un TAM METNİ (kopyala-yapıştır)
//   node kao3-premium/araclar/senkron.mjs --prompt K3P-A3   → o prompt'un metni
//   node kao3-premium/araclar/senkron.mjs --liste     → sıra ve durum tablosu
//
// Denetlenenler: K3P-STATE.json ↔ PROMPTLAR.md ↔ .anti-amnesia/CURRENT-STATE.md ↔ .anti-amnesia/LEDGER.md ↔ git log.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const base = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.join(base, '..');
const read = (rel) => fs.readFileSync(path.join(base, rel), 'utf8');
const args = process.argv.slice(2);
const errors = [];

const state = JSON.parse(read('K3P-STATE.json'));
const prompts = read('PROMPTLAR.md');
const current = read('.anti-amnesia/CURRENT-STATE.md');
const ledger = read('.anti-amnesia/LEDGER.md');
const order = state.executionOrder || [];
const cards = new Map((state.cards || []).map((c) => [c.id, c]));

// 1) Sıra ve kart kümesi
if (new Set(order).size !== order.length) errors.push('executionOrder içinde tekrar eden kimlik var');
for (const id of order) if (!cards.has(id)) errors.push(`executionOrder'daki ${id} cards içinde yok`);
for (const id of cards.keys()) if (!order.includes(id)) errors.push(`cards'taki ${id} executionOrder içinde yok`);
const inProgress = order.filter((id) => cards.get(id)?.status === 'in-progress');
if (inProgress.length > 1) errors.push(`birden çok in-progress kart: ${inProgress.join(', ')}`);

// 2) nextPrompt = sıradaki bitmemiş kart
const expectedNext = order.find((id) => !['done', 'skipped'].includes(cards.get(id)?.status)) || null;
if ((state.nextPrompt || null) !== expectedNext) errors.push(`STATE.nextPrompt=${state.nextPrompt} ama sıradaki bitmemiş kart ${expectedNext}`);
for (const [i, id] of order.entries()) {
  if (cards.get(id)?.status === 'done') {
    const earlierOpen = order.slice(0, i).filter((x) => !['done', 'skipped'].includes(cards.get(x)?.status));
    if (earlierOpen.length) errors.push(`${id} done ama daha önceki ${earlierOpen.join(', ')} bitmemiş (sıra atlanmış)`);
  }
}

// 3) PROMPTLAR.md blokları: her kimlik için tam bir blok, dosyada executionOrder sırasıyla
const blockRe = /<!-- PROMPT (K3P-[0-9A-Z]+) -->\n([\s\S]*?)\n<!-- \/PROMPT \1 -->/g;
const blocks = new Map();
const fileOrder = [];
for (const m of prompts.matchAll(blockRe)) { blocks.set(m[1], m[2].trim()); fileOrder.push(m[1]); }
for (const id of order) if (!blocks.has(id)) errors.push(`PROMPTLAR.md içinde ${id} bloğu yok`);
for (const id of fileOrder) if (!order.includes(id)) errors.push(`PROMPTLAR.md'deki ${id} executionOrder içinde yok`);
if (fileOrder.join() !== order.filter((id) => blocks.has(id)).join()) errors.push('PROMPTLAR.md blok sırası executionOrder ile aynı değil');

// 4) CURRENT-STATE ve LEDGER'ın gösterdiği sıradaki
const shown = (current.match(/^Sıradaki prompt:\s*(\S+)/m) || [])[1];
if ((shown === '—' ? null : shown) !== expectedNext) errors.push(`CURRENT-STATE "Sıradaki prompt: ${shown}" ama beklenen ${expectedNext}`);
const ledgerNexts = [...ledger.matchAll(/^- Sıradaki:\s*(\S+)/gm)].map((m) => m[1]);
const lastLedgerNext = ledgerNexts.length ? ledgerNexts[ledgerNexts.length - 1] : null;
if ((lastLedgerNext === '—' ? null : lastLedgerNext) !== expectedNext) errors.push(`LEDGER son kaydı "Sıradaki: ${lastLedgerNext}" ama beklenen ${expectedNext}`);

// 5) Bitmiş her kartın LEDGER kaydı ve commit'i (kapanıştaki kart "(bu commit)" der, henüz commit'i yoktur)
const seqs = [...ledger.matchAll(/^## seq (\d+) · (\S+) · (\S+)/gm)].map((m) => ({ seq: Number(m[1]), id: m[2], kind: m[3] }));
seqs.forEach((s, i) => { if (s.seq !== i + 1) errors.push(`LEDGER seq sırası bozuk: ${i + 1}. kayıt seq ${s.seq}`); });
const lastEntry = ledger.slice(ledger.lastIndexOf('\n## seq '));
const closing = /- Commit: \(bu commit\)/.test(lastEntry) ? (lastEntry.match(/^\n## seq \d+ · (\S+)/) || [])[1] : null;
let gitLog = '';
try { gitLog = execFileSync('git', ['log', '--format=%s', '-n', '400'], { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { gitLog = null; }
for (const id of order.filter((x) => cards.get(x)?.status === 'done')) {
  if (!seqs.some((s) => s.id === id && s.kind === 'KART')) errors.push(`${id} done ama LEDGER'da "· ${id} · KART" kaydı yok`);
  if (gitLog !== null && id !== closing && !gitLog.split('\n').some((line) => line.startsWith(id + ':'))) errors.push(`${id} done ama git log'da "${id}:" commit'i yok`);
}

// Çıktı
if (args.includes('--liste')) {
  for (const id of order) { const c = cards.get(id); console.log(`${id === expectedNext ? '▶' : ' '} ${id.padEnd(7)} dalga ${String(c.wave).padEnd(2)} ${c.status.padEnd(12)} ${c.gate || ''}`); }
}
if (errors.length) {
  console.error('SENKRON: UYUMSUZ');
  for (const e of errors) console.error('  ✕ ' + e);
  process.exit(1);
}
const done = order.filter((id) => cards.get(id)?.status === 'done').length;
const want = args.includes('--prompt') ? args[args.indexOf('--prompt') + 1] : (args.includes('--sonraki') ? expectedNext : null);
if (want) {
  if (!blocks.has(want)) { console.error(`${want} için prompt yok`); process.exit(1); }
  console.log(blocks.get(want));
} else {
  console.log(`SENKRON: UYUMLU · ${done}/${order.length} kart bitti · sıradaki prompt: ${expectedNext || 'yok (program tamam)'}`);
}
