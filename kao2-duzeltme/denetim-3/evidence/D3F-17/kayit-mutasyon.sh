#!/usr/bin/env bash
# D3F-17 · kayıt denetimi mutasyon sınaması (ağ yok, depoya yazmaz). Tek taze klon; denetim-2 kayıtları ÇALIŞMA AĞACINDAN kopyalanır.
#   bash kao2-duzeltme/denetim-3/evidence/D3F-17/kayit-mutasyon.sh
set -u
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
D2=kao2-duzeltme/denetim-2; AUD=kao2-duzeltme/denetim-3/evidence/D3F-17/kayit-denetimi.mjs
H="$(mktemp -d "${TMPDIR:-/tmp}/d3f17-mut.XXXXXX")"; R="$H/r"; BAD=0; N=0
git clone -q "$REPO" "$R" || exit 2
reset() { for f in "$D2/LEDGER.md" "$D2/D2F-STATE.json" "$D2/CURRENT-STATE.md" "$AUD"; do mkdir -p "$R/$(dirname "$f")"; cp "$REPO/$f" "$R/$f"; done; }
mutate() { (cd "$R" && F="$1" OLD="$2" NEW="$3" node -e "const fs=require('fs');const p=process.env.F;const s=fs.readFileSync(p,'utf8');
  if(!s.includes(process.env.OLD)){console.error('mutasyon noktası yok: '+process.env.OLD);process.exit(2)}
  fs.writeFileSync(p,s.split(process.env.OLD).join(process.env.NEW))") || { echo "mutasyon noktası yok — betik eski"; rm -rf "$H"; exit 2; }; }
expect() { N=$((N+1)); local out rc; out="$(node "$R/$AUD" --root "$R" 2>&1)"; rc=$?; local got=PASS; [ "$rc" -ne 0 ] && got=FAIL
  if [ "$got" = "$2" ] && printf '%s' "$out" | grep -q -- "$3"; then echo "PASS  $1 → $got"; else echo "FAIL  $1 → beklenen $2 (\"$3\"), gelen $got"; printf '%s\n' "$out" | sed 's/^/      /' | head -4; BAD=1; fi; }
reset; expect "M0 kayıtlı hâl" PASS 'kayıt denetimi: PASS'
reset; mutate "$D2/LEDGER.md" 'Düzeltme notu (denetim-3 F-17)' 'Düzeltme notu'; expect "M1 not F-17'yi anmıyor" FAIL 'düzeltme notu yok'
reset; mutate "$D2/D2F-STATE.json" '"ledgerLastSeq": ' '"ledgerLastSeq": 9'; expect "M2 STATE senkron değil" FAIL 'ledgerLastSeq 9'
reset; mutate "$D2/LEDGER.md" 'D2F-16 önekli 2 commit oldu' 'D2F-16 önekli commit oldu'; expect "M3 commit sayısı yok" FAIL 'commit sayısını (2)'
reset; mutate "$D2/LEDGER.md" '`128ab06d` (NOTE' '(NOTE'; expect "M4 commit hash'i yok" FAIL "commit'ini (128ab06d)"
rm -rf "$H"
[ "$BAD" = 0 ] && echo "d3f17 mutasyon: $N/$N PASS" || { echo "d3f17 mutasyon: FAIL"; exit 1; }
