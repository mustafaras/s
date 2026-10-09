// D3F-18 · F-18 kayıt denetimi: `8bf8f658` süreç sapmaları ve seq 21'deki sayım yanlışı denetim-2 LEDGER'ında, VERİDEN türetilen
// olgularla bir düzeltme NOTE'u olarak kayıtlı mı? Ağ yok, yazmaz.
//   node kao2-duzeltme/denetim-3/evidence/D3F-18/kayit-denetimi.mjs [--root <dizin>]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const argRoot = process.argv.indexOf('--root');
const root = argRoot > 0 ? process.argv[argRoot + 1] : path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8' });
const D2 = 'kao2-duzeltme/denetim-2', C = '8bf8f658';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

// Olgular commit'in kendisinden.
const files = git('show', '--name-only', '--format=', C).trim().split('\n').filter(Boolean);
const tests = files.filter((f) => f.startsWith('tests/'));
const msg = git('show', '-s', '--format=%B', C);
const pin = (git('show', C, '--', 'index.html').match(/^\+.*\?v=(\d{8}[a-z])/m) || [])[1];
const qa = files.filter((f) => f.startsWith('kao2-duzeltme/tools/gorsel-qa/'));
const qaSafe = qa.every((f) => { const s = git('show', `${C}:${f}`); return s.includes('127.0.0.1:9000') && !/setItem\(['"]seyma-sync-force/.test(s) && !/forceSync=1/.test(s); });
ok(/ara durum|test koşusu sürüyor/i.test(msg), 'ön koşul: commit mesajı ara durum/test sürüyor demiyor');
ok(pin, 'ön koşul: commit index.html pinini okuyamadım');
ok(qa.length > 0 && qaSafe, 'ön koşul: görsel QA betikleri yok ya da 127.0.0.1:9000/force kuralına uymuyor');

const ledger = read(`${D2}/LEDGER.md`);
const last = Math.max(...[...ledger.matchAll(/^## seq (\d+) · /gm)].map((m) => Number(m[1])));
const note = ledger.split(/^(?=## seq \d+ · )/m).find((b) => /^## seq \d+ · [0-9-]+ · NOTE · D2F-13\b/.test(b) && /^- başlık:.*denetim-3 F-18\b/m.test(b)); // not başlıktan tanınır (gövdede geçen anma sayılmaz; D3F-18 M1 dersi)
ok(note, 'denetim-2 LEDGER: "NOTE · D2F-13" + "denetim-3 F-18" düzeltme notu yok');
const noteSeq = note ? Number(note.match(/^## seq (\d+)/)[1]) : -1;
if (note) {
  const countLine = note.split('\n').find((l) => /test dosyası/.test(l)) || '';
  ok(new RegExp(`\\b${tests.length} test dosyası`).test(countLine), `not ölçülen test dosyası sayısını (${tests.length}) yazmıyor`);
  ok(/seq 21[^\n]*8 fixture/.test(note), 'not seq 21\'deki "8 fixture" ifadesini düzeltme olarak anmıyor');
  for (const t of tests) ok(note.includes(path.basename(t)), `not değişen testi (${path.basename(t)}) adıyla anmıyor`);
  ok(note.includes(pin), `not plan dışı pini (${pin}) yazmıyor`);
  ok(/testlerden önce/.test(note), 'not commit\'in testlerden önce atıldığını yazmıyor');
  ok(/127\.0\.0\.1:9000/.test(note), 'not görsel QA betiklerinin kural uyumunu yazmıyor');
  ok(/geçmiş satırlar değişmedi/i.test(note), 'not geçmiş satırların değişmediğini yazmıyor');
}
ok(JSON.parse(read(`${D2}/D2F-STATE.json`)).ledgerLastSeq === last, `D2F-STATE.ledgerLastSeq ≠ LEDGER son seq ${last}`);
const cur = read(`${D2}/CURRENT-STATE.md`);
ok(new RegExp(`^lastSeq: ${last}$`, 'm').test(cur), `CURRENT-STATE lastSeq ${last} değil`);
ok(new RegExp(`seq ${noteSeq}, D3F-18\\b`).test(cur), `CURRENT-STATE "Son güncelleme" seq ${noteSeq} (D3F-18) notunu anmıyor`);

if (fails.length) { for (const f of fails) console.log(`FAIL  ${f}`); console.log(`d3f18 kayıt denetimi: FAIL (${fails.length})`); process.exit(1); }
console.log(`d3f18 kayıt denetimi: PASS (${C}: ${tests.length} test dosyası · pin ${pin} · QA ${qa.length} betik kurala uygun · LEDGER son seq ${last})`);
