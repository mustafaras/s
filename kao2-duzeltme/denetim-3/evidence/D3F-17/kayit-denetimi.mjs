// D3F-17 · F-17 kayıt denetimi: D2F-16 ölçütü ("CANLI.md kullanıcı çıktısıyla · tek commit") ile gerçek arasındaki fark
// denetim-2 LEDGER'ında bir düzeltme NOTE'u olarak, VERİDEN türetilen olgularla kayıtlı mı? Ağ yok, yazmaz.
//   node kao2-duzeltme/denetim-3/evidence/D3F-17/kayit-denetimi.mjs [--root <dizin>]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const argRoot = process.argv.indexOf('--root');
const root = argRoot > 0 ? process.argv[argRoot + 1] : path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const D2 = 'kao2-duzeltme/denetim-2';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

// Olgular veriden: D2F-16 önekli commit'ler ve CANLI.md başlığı.
const commits = execFileSync('git', ['-C', root, 'log', '--format=%h', '--abbrev=8', '--grep=^D2F-16'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const canli = read(`${D2}/evidence/D2F-16/CANLI.md`);
const ranByClaude = /Claude tarafından|komutu kullanıcı yerine Claude çalıştırdı/.test(canli);
ok(commits.length >= 2, `ön koşul: D2F-16 önekli commit sayısı ${commits.length} (≥2 bekleniyordu)`);
ok(ranByClaude, 'ön koşul: D2F-16 CANLI.md komutu Claude çalıştırdı demiyor');

const ledger = read(`${D2}/LEDGER.md`);
const seqs = [...ledger.matchAll(/^## seq (\d+) · /gm)].map((m) => Number(m[1]));
const last = Math.max(...seqs);
const blocks = ledger.split(/^(?=## seq \d+ · )/m);
const note = blocks.find((b) => /^## seq \d+ · [0-9-]+ · NOTE · D2F-16\b/.test(b) && /^- başlık:.*denetim-3 F-17\b/m.test(b)); // not başlıktan tanınır (gövdede geçen anma sayılmaz; D3F-18 M1 dersi)
ok(note, 'denetim-2 LEDGER: "NOTE · D2F-16" + "denetim-3 F-17" düzeltme notu yok');
const noteSeq = note ? Number(note.match(/^## seq (\d+)/)[1]) : -1;
if (note) {
  // Sayı ve hash'ler aynı satırda: not başka bir yerde (ör. closeCommit) hash geçse de bu satır eksikse kırmızı (D3F-17 M4 dersi).
  const countLine = (note.split("\n").find((l) => /önekli \d+ commit oldu/.test(l)) || "");
  ok(new RegExp(`önekli ${commits.length} commit oldu`).test(countLine), `not commit sayısını (${commits.length}) yazmıyor`);
  for (const h of commits) ok(countLine.includes(h), `not D2F-16 commit'ini (${h}) sayı satırında adıyla anmıyor`);
  ok(/Claude çalıştırdı/.test(note), 'not komutu Claude çalıştırdığını yazmıyor');
  ok(/geçmiş satırlar değişmedi/i.test(note), 'not geçmiş satırların değişmediğini yazmıyor');
}
const state = JSON.parse(read(`${D2}/D2F-STATE.json`));
ok(state.ledgerLastSeq === last, `D2F-STATE.ledgerLastSeq ${state.ledgerLastSeq} ≠ LEDGER son seq ${last}`);
const cur = read(`${D2}/CURRENT-STATE.md`);
ok(new RegExp(`^lastSeq: ${last}$`, 'm').test(cur), `CURRENT-STATE lastSeq ${last} değil`);
ok(new RegExp(`seq ${noteSeq}, D3F-17\\b`).test(cur), `CURRENT-STATE "Son güncelleme" seq ${noteSeq} (D3F-17) notunu anmıyor`);

if (fails.length) { for (const f of fails) console.log(`FAIL  ${f}`); console.log(`d3f17 kayıt denetimi: FAIL (${fails.length})`); process.exit(1); }
console.log(`d3f17 kayıt denetimi: PASS (D2F-16 commit ${commits.join(', ')} · LEDGER son seq ${last} · STATE/CURRENT senkron)`);
