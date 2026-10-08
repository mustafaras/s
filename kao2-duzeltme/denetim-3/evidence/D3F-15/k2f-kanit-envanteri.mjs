#!/usr/bin/env node
// D3F-15 · F-15 K2F KANIT envanteri (salt okur, ağsız). Aracın `--audit-k2f` sayısını dosya dosya açar ve kayıtlarla eşler.
//   node kao2-duzeltme/denetim-3/evidence/D3F-15/k2f-kanit-envanteri.mjs           → denetim (çıkış 0/1)
//   node kao2-duzeltme/denetim-3/evidence/D3F-15/k2f-kanit-envanteri.mjs --write   → K2F-KANIT-ENVANTERI.md'yi yeniden üretir
// Bölüm listesi ve K2F aralığı araçtan (d2f-sync-check.mjs) okunur; burada kopyası tutulmaz.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const TOOL = 'kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs';
const INVENTORY = 'kao2-duzeltme/denetim-3/evidence/D3F-15/K2F-KANIT-ENVANTERI.md';
const LEDGER = 'kao2-duzeltme/.anti-amnesia/LEDGER.md';
const CURRENT = 'kao2-duzeltme/.anti-amnesia/CURRENT-STATE.md';
const read = (rel) => readFileSync(join(REPO, rel), 'utf8');
const git = (argv) => execFileSync('git', argv, { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
const fails = [];
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : ` — ${detail}`}`); if (!ok) fails.push(name); };

// 1 · Araçtan: bölüm listesi, K2F tabanı; D2F-STATE'ten K2F döneminin sonu; FIX-STATE'ten kapanış commit'i
const toolSrc = read(TOOL);
const sectionsSrc = (/^const KANIT_SECTIONS = (\[[^\]]*\]);/m.exec(toolSrc) || [])[1];
const base = (/^const K2F_BASE = '([0-9a-f]+)';/m.exec(toolSrc) || [])[1];
if (!sectionsSrc || !base) { console.error('araçta KANIT_SECTIONS ya da K2F_BASE bulunamadı'); process.exit(1); }
const SECTIONS = JSON.parse(sectionsSrc.replace(/'/g, '"'));
const eraEnd = JSON.parse(read('kao2-duzeltme/denetim-2/D2F-STATE.json')).baseCommit;
const fixState = JSON.parse(read('kao2-duzeltme/FIX-STATE.json'));

// 2 · Ölçüm: aracın kümesiyle aynı (K2F_BASE..baseCommit aralığında commit'i olan K2F prompt'ları)
const ids = [...new Set(git(['log', '--format=%s', `${base}..${eraEnd}`]).split('\n')
  .filter((s) => !s.startsWith('KAO2-FIX denetim-2')).map((s) => (/^(K2F-\d{2})\b/.exec(s) || [])[1]).filter(Boolean))].sort();
const rows = ids.map((id) => {
  const rel = `kao2-duzeltme/evidence/${id}/KANIT.md`;
  if (!existsSync(join(REPO, rel))) return { id, rel, absent: true, missing: [], session: false, headings: [] };
  const text = read(rel);
  return {
    id, rel, absent: false,
    session: /^Oturum:\s*\S+/m.test(text),
    missing: SECTIONS.filter((name) => !new RegExp(`^## ${name}(?=\\s|$)`, 'm').test(text)),
    headings: [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim()),
  };
});
const present = rows.filter((r) => !r.absent);
const withSession = present.filter((r) => r.session).map((r) => r.id);
const noSession = present.length - withSession.length;
const gaps = present.filter((r) => r.missing.length);

// 3 · Araçla aynı sayı (bağımsız hesap ↔ `--audit-k2f`)
const audit = execFileSync('node', [TOOL, '--audit-k2f'], { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const d = /\(d\) (\d+) KANIT · (\d+) tanesinde "Oturum:" satırı yok · (\d+) tanesinde 8 bölümden eksik var/.exec(audit);
check('araç --audit-k2f (d) satırı okunuyor', !!d, 'çıktıda (d) satırı yok');
if (d) check(`araç ile bağımsız sayım aynı (${present.length} · ${noSession} · ${gaps.length})`,
  +d[1] === present.length && +d[2] === noSession && +d[3] === gaps.length, `araç ${d[1]} · ${d[2]} · ${d[3]}`);
check('K2F KANIT dosyası eksik değil', rows.every((r) => !r.absent), rows.filter((r) => r.absent).map((r) => r.id).join(', '));

// 4 · Tarihsel KANIT'lar kapanıştan beri değişmedi (oturum kimliği sonradan yazılmaz; çalışma ağacı dâhil)
const touched = git(['diff', '--name-only', fixState.closeCommit, '--', ...rows.map((r) => r.rel)]).trim();
check(`K2F KANIT'ları kapanıştan (${fixState.closeCommit.slice(0, 8)}) beri değişmedi`, touched === '', touched.split('\n').join(', '));

// 5 · Envanter dosyası ölçümden üretilir; elle yazılmaz
const tick = String.fromCharCode(96);
const code = (s) => `${tick}${s}${tick}`;
const render = () => [
  '# K2F KANIT envanteri (denetim-3 F-15)',
  '',
  `Bu dosya ${code('k2f-kanit-envanteri.mjs --write')} çıktısıdır; elle düzenlenmez. Ölçüm kümesi aracın ${code('--audit-k2f')} kümesidir:`,
  `${code(`${base}..${eraEnd.slice(0, 8)}`)} aralığında commit'i olan K2F prompt'ları. Bölüm listesi ${code(TOOL)} ${code('KANIT_SECTIONS')} sabitinden okunur.`,
  '',
  '## Özet',
  `- ${present.length} KANIT. ${noSession} tanesinde ${code('Oturum:')} satırı yok; satır yalnız ${withSession.join(', ') || '—'} dosyasında var.`,
  `- ${gaps.length} tanesinde ${SECTIONS.length} bölümden en az biri eksik (başlık birebir ${code('## <bölüm>')} olarak aranır).`,
  '- Tarihsel kayıtlar değiştirilmez: oturum kimliği sonradan uydurulamaz, eksik bölüm geriye dönük yazılmaz.',
  '',
  '## Bölümü eksik KANIT\'lar',
  '| Prompt | Eksik bölüm | Dosyadaki ## başlıkları |',
  '|---|---|---|',
  ...gaps.map((r) => `| ${r.id} | ${r.missing.join(', ')} | ${r.headings.join(' · ').replace(/\|/g, '\\|')} |`),
  '',
  `## ${code('Oturum:')} satırı olmayan KANIT'lar`,
  present.filter((r) => !r.session).map((r) => r.id).join(', '),
  '',
].join('\n');
const want = render();
if (process.argv.includes('--write')) { writeFileSync(join(REPO, INVENTORY), want); console.log(`yazıldı: ${INVENTORY}`); }
const have = existsSync(join(REPO, INVENTORY)) ? read(INVENTORY) : null;
check('envanter dosyası ölçümle aynı', have === want, have === null ? `${INVENTORY} yok` : 'envanter bayat (yeniden üret: --write)');

// 6 · FIX LEDGER düzeltme notu: ölçülen sayıları ve bölümü eksik her dosyayı anar, envantere bağlanır
const ledger = read(LEDGER);
const note = (/^## seq (\d+) · \d{4}-\d{2}-\d{2} · NOTE · [^\n]*\n- title:[^\n]*denetim-3 F-15[\s\S]*?(?=^## seq |(?![\s\S]))/m.exec(ledger) || []);
check('FIX LEDGER\'da denetim-3 F-15 NOTE kaydı var', !!note[0], 'title\'ında "denetim-3 F-15" geçen NOTE yok');
if (note[0]) {
  const body = note[0];
  check(`NOTE sayıları ölçümle aynı (${present.length} · ${noSession} · ${gaps.length})`,
    body.includes(`${present.length} KANIT`) && body.includes(`${noSession}/${present.length}`) && body.includes(`${gaps.length}/${present.length}`),
    `"${present.length} KANIT", "${noSession}/${present.length}", "${gaps.length}/${present.length}" aranıyor`);
  const unnamed = gaps.filter((r) => !body.includes(r.id)).map((r) => r.id);
  check('NOTE bölümü eksik her KANIT\'ı adıyla anar', unnamed.length === 0, `anılmayan: ${unnamed.join(', ')}`);
  check('NOTE envanter dosyasına bağlı', body.includes(INVENTORY), `${INVENTORY} yok`);
  check(`FIX-STATE.ledgerLastSeq NOTE'u kapsıyor (≥ ${note[1]})`, fixState.ledgerLastSeq >= +note[1], `ledgerLastSeq ${fixState.ledgerLastSeq}`);
}

// 7 · CURRENT-STATE "Canlı gerçekler": iki senkron satırındaki seq güncel (FIX-STATE ve D2F-STATE'ten)
const currentText = read(CURRENT);
const repro = (/^\| `fix-sync-check --repro` \| PASS \(\d+\/\d+ · seq (\d+)\)/m.exec(currentText) || [])[1];
check(`CURRENT-STATE "Canlı gerçekler" fix-sync-check satırı seq ${fixState.ledgerLastSeq}`, +repro === fixState.ledgerLastSeq, `satırdaki seq ${repro ?? 'yok'}`);
const d2fSeq = JSON.parse(read('kao2-duzeltme/denetim-2/D2F-STATE.json')).ledgerLastSeq;
const strict = (/^\| `d2f-sync-check --strict` \| PASS \(\d+\/\d+ · seq (\d+)/m.exec(currentText) || [])[1];
check(`CURRENT-STATE "Canlı gerçekler" d2f-sync-check satırı seq ${d2fSeq}`, +strict === d2fSeq, `satırdaki seq ${strict ?? 'yok'}`);

console.log(fails.length ? `d3f15 envanter: FAIL (${fails.length})` : `d3f15 envanter: PASS · ${present.length} KANIT · Oturum yok ${noSession} · bölüm eksik ${gaps.length}`);
process.exit(fails.length ? 1 : 0);
