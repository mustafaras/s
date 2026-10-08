#!/usr/bin/env bash
# D3F-08 · pages-kayit-denetimi.mjs mutasyon sınaması (yeniden üretilebilir; ağ yok, depoya yazmaz).
# HEAD $TMPDIR'e klonlanır; denetim-2 kayıtlarının ve D3F-08 betik/anlık görüntüsünün ÇALIŞMA AĞACINDAKİ hâli klona kopyalanır.
#   bash kao2-duzeltme/denetim-3/evidence/D3F-08/pages-mutasyon.sh
set -u
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
EV=kao2-duzeltme/denetim-3/evidence/D3F-08
TOOL=$EV/pages-kayit-denetimi.mjs
SNAP=$EV/pages-runs.json
D2=kao2-duzeltme/denetim-2
H="$(mktemp -d "${TMPDIR:-/tmp}/d3f08-mut.XXXXXX")"
BAD=0
fresh() { # fresh <ad> → klon yolu
  local d="$H/$1"
  git clone -q "$REPO" "$d" && mkdir -p "$d/$EV" && for f in "$TOOL" "$SNAP" $D2/LEDGER.md $D2/CURRENT-STATE.md $D2/D2F-STATE.json; do cp "$REPO/$f" "$d/$f"; done
  printf '%s' "$d"
}
expect() { # expect <ad> <PASS|FAIL|ERR> <dizin> [çıktıda aranacak metin]
  local out rc; out="$(cd "$3" && node "$TOOL" 2>&1)"; rc=$?
  local got=PASS; [ "$rc" -eq 1 ] && got=FAIL; [ "$rc" -ge 2 ] && got=ERR
  if [ "$got" = "$2" ] && { [ -z "${4:-}" ] || printf '%s' "$out" | grep -q -- "$4"; }; then echo "PASS  $1 → $got"
  else echo "FAIL  $1 → beklenen $2${4:+ (\"$4\")}, gelen $got"; printf '%s\n' "$out" | sed 's/^/      /' | head -6; BAD=1; fi
}

# M0 · düzeltilmiş kayıtlar: 4/4
d=$(fresh M0); expect "M0 düzeltilmiş kayıtlar" PASS "$d" '4/4 run kayıtlı'

# M1 · düzeltme öncesi kayıtlar (LEDGER + CURRENT-STATE, D3F-07 commit'indeki hâl; F-08'in kendisi): 3 kayıtsız
d=$(fresh M1); (cd "$d" && git show 13a6d345:$D2/LEDGER.md > $D2/LEDGER.md && git show 13a6d345:$D2/CURRENT-STATE.md > $D2/CURRENT-STATE.md)
expect "M1 not öncesi" FAIL "$d" '3/4 run denetim-2 kayıtlarında yok'

# M2 · yalnız F-08'in run'ı (37647239210) kayıtlardan silinir
d=$(fresh M2); (cd "$d" && perl -pi -e 's/37647239210/RUN-SILINDI/g' $D2/LEDGER.md $D2/CURRENT-STATE.md)
expect "M2 3f3b28cd run'ı silindi" FAIL "$d" 'KAYITSIZ  run 37647239210'

# M3 · dönemde kayıtsız yeni bir run (sahte kimlik, head 3f3b28cd)
d=$(fresh M3); (cd "$d" && node -e "const fs=require('fs');const p='$SNAP';const j=JSON.parse(fs.readFileSync(p,'utf8'));const r=j.runs.find(x=>x.id===37647239210);j.runs.push(Object.assign({},r,{id:11111111111}));fs.writeFileSync(p,JSON.stringify(j,null,2))")
expect "M3 sahte kayıtsız run" FAIL "$d" 'KAYITSIZ  run 11111111111'

# M4 · anlık görüntü dönemi kapsamıyor → sessizce PASS değil, hata
d=$(fresh M4); (cd "$d" && node -e "const fs=require('fs');const p='$SNAP';const j=JSON.parse(fs.readFileSync(p,'utf8'));j.runs=j.runs.filter(x=>x.created_at>'2026-10-08');fs.writeFileSync(p,JSON.stringify(j,null,2))")
expect "M4 boş dönem" ERR "$d" 'dönemde run bulunamadı'

rm -rf "$H"
[ "$BAD" = 0 ] && echo "d3f08 mutasyon: 5/5 PASS" || { echo "d3f08 mutasyon: FAIL"; exit 1; }
