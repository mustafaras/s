#!/usr/bin/env bash
# D3F-18 · kayıt denetimi mutasyon sınaması (ağ yok, depoya yazmaz). Tek taze klon; denetim-2 kayıtları ÇALIŞMA AĞACINDAN kopyalanır.
#   bash kao2-duzeltme/denetim-3/evidence/D3F-18/kayit-mutasyon.sh
set -u
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
D2=kao2-duzeltme/denetim-2; AUD=kao2-duzeltme/denetim-3/evidence/D3F-18/kayit-denetimi.mjs
H="$(mktemp -d "${TMPDIR:-/tmp}/d3f18-mut.XXXXXX")"; R="$H/r"; BAD=0; N=0
git clone -q "$REPO" "$R" || exit 2
reset() { for f in "$D2/LEDGER.md" "$D2/D2F-STATE.json" "$D2/CURRENT-STATE.md" "$AUD"; do mkdir -p "$R/$(dirname "$f")"; cp "$REPO/$f" "$R/$f"; done; }
mutate() { (cd "$R" && F="$1" OLD="$2" NEW="$3" node -e "const fs=require('fs');const p=process.env.F;const s=fs.readFileSync(p,'utf8');
  if(!s.includes(process.env.OLD)){console.error('mutasyon noktası yok: '+process.env.OLD);process.exit(2)}
  fs.writeFileSync(p,s.split(process.env.OLD).join(process.env.NEW))") || { echo "mutasyon noktası yok — betik eski"; rm -rf "$H"; exit 2; }; }
expect() { N=$((N+1)); local out rc; out="$(node "$R/$AUD" --root "$R" 2>&1)"; rc=$?; local got=PASS; [ "$rc" -ne 0 ] && got=FAIL
  if [ "$got" = "$2" ] && printf '%s' "$out" | grep -q -- "$3"; then echo "PASS  $1 → $got"; else echo "FAIL  $1 → beklenen $2 (\"$3\"), gelen $got"; printf '%s\n' "$out" | sed 's/^/      /' | head -4; BAD=1; fi; }
reset; expect "M0 kayıtlı hâl" PASS 'kayıt denetimi: PASS'
reset; mutate "$D2/LEDGER.md" 'Düzeltme notu (denetim-3 F-18)' 'Düzeltme notu'; expect "M1 not F-18'i anmıyor" FAIL 'düzeltme notu yok'
reset; mutate "$D2/D2F-STATE.json" '"ledgerLastSeq": ' '"ledgerLastSeq": 9'; expect "M2 STATE senkron değil" FAIL 'ledgerLastSeq ≠'
reset; mutate "$D2/LEDGER.md" 'Doğrusu: 6 test dosyası' 'Doğrusu: 8 test dosyası'; expect "M3 yanlış sayı" FAIL 'test dosyası sayısını (6)'
reset; mutate "$D2/LEDGER.md" '`test_iip_09.js`, ' ''; expect "M4 bir test adı eksik" FAIL '(test_iip_09.js)'
reset; mutate "$D2/LEDGER.md" 'plan dışı pin `20261006c`' 'plan dışı bir pin'; expect "M5 pin yazılmamış" FAIL 'plan dışı pini (20261006c)'
reset; mutate "$D2/LEDGER.md" 'commit testlerden önce atıldı' 'commit erken atıldı'; expect "M6 testlerden önce yok" FAIL 'testlerden önce atıldığını'
# M7 · sağlamlık: sonraya başka bir not eklenir ve STATE/CURRENT senkronlanır → denetim YEŞİL kalmalı (D3F-17'nin ilk sürüm hatası).
reset; (cd "$R" && printf '\n## seq 99 · 2026-12-31 · NOTE · D2F-01\n- başlık: sentetik sonraki not\n' >> "$D2/LEDGER.md") ; mutate "$D2/D2F-STATE.json" '"ledgerLastSeq": 31,' '"ledgerLastSeq": 99,'; mutate "$D2/CURRENT-STATE.md" 'lastSeq: 31' 'lastSeq: 99'
expect "M7 sonraki not eklenir (yeşil kalmalı)" PASS 'kayıt denetimi: PASS'
rm -rf "$H"
[ "$BAD" = 0 ] && echo "d3f18 mutasyon: $N/$N PASS" || { echo "d3f18 mutasyon: FAIL"; exit 1; }
