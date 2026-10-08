#!/usr/bin/env bash
# D3F-07 · fix-sync-check 5b (releaseApproval onay türü) mutasyon sınaması (yeniden üretilebilir; ağ yok, depoya yazmaz).
# HEAD $TMPDIR'e klonlanır; aracın, FIX-STATE'in, LEDGER'ın ve CURRENT-STATE'in ÇALIŞMA AĞACINDAKİ hâli klona kopyalanır.
# Her senaryo kendi klonunda FIX-STATE'i bozar ve aracı koşar. Beklenen sonuç ya da gerekçe tutmazsa çıkış 1.
#   bash kao2-duzeltme/denetim-3/evidence/D3F-07/onay-mutasyon.sh
set -u
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
TOOL=kao2-duzeltme/tools/fix-sync-check.mjs
STATE=kao2-duzeltme/FIX-STATE.json
H="$(mktemp -d "${TMPDIR:-/tmp}/d3f07-mut.XXXXXX")"
BAD=0
fresh() { # fresh <ad> → klon yolu
  local d="$H/$1"
  git clone -q "$REPO" "$d" && for f in "$TOOL" "$STATE" kao2-duzeltme/.anti-amnesia/LEDGER.md kao2-duzeltme/.anti-amnesia/CURRENT-STATE.md; do cp "$REPO/$f" "$d/$f"; done
  printf '%s' "$d"
}
edit() { # edit <dizin> <js> — js, s (FIX-STATE nesnesi) üzerinde çalışır
  (cd "$1" && JS="$2" node -e "const fs=require('fs');const p='$STATE';const s=JSON.parse(fs.readFileSync(p,'utf8'));eval(process.env.JS);fs.writeFileSync(p,JSON.stringify(s,null,2)+'\n')")
}
expect() { # expect <ad> <PASS|FAIL> <dizin> [çıktıda aranacak metin]
  local out rc; out="$(cd "$3" && node "$TOOL" 2>&1)"; rc=$?
  local got=PASS; [ "$rc" -ne 0 ] && got=FAIL
  if [ "$got" = "$2" ] && { [ -z "${4:-}" ] || printf '%s' "$out" | grep -q -- "$4"; }; then echo "PASS  $1 → $got"
  else echo "FAIL  $1 → beklenen $2${4:+ (\"$4\")}, gelen $got"; printf '%s\n' "$out" | sed 's/^/      /' | head -6; BAD=1; fi
}
R=s.releaseApprovalRecord

# M0 · düzeltilmiş kayıt yeşil
d=$(fresh M0); expect "M0 düzeltilmiş kayıt" PASS "$d"

# M1 · eski, türü gizleyen değer (F-07'nin kendisi)
d=$(fresh M1); edit "$d" "s.releaseApproval='approved_through_K2F-43'"
expect "M1 approved_through_K2F-43" FAIL "$d" 'biçiminde değil'

# M2 · K2F-43 "explicit" yazılır (LEDGER seq 123 closed-inferred)
d=$(fresh M2); edit "$d" "s.releaseApproval=s.releaseApproval.replace('inferred_2026-10-06_K2F-43','explicit_2026-10-06_K2F-43');$R['K2F-43'].kind='explicit'"
expect "M2 K2F-43 explicit" FAIL "$d" 'closed-inferred, ama releaseApproval onu inferred diye yazmıyor'

# M3 · K2F-43 hiç anılmaz (yalnız YAYIN-3)
d=$(fresh M3); edit "$d" "s.releaseApproval='ai-delegated_2026-10-07_YAYIN-3'"
expect "M3 K2F-43 düşürüldü" FAIL "$d" 'LEDGER seq 123: K2F-43'

# M4 · YAYIN-3 "inferred" yazılır (denetim-2 seq 23 devir der, closed-inferred demez)
d=$(fresh M4); edit "$d" "s.releaseApproval=s.releaseApproval.replace('ai-delegated_2026-10-07_YAYIN-3','inferred_2026-10-07_YAYIN-3');$R['YAYIN-3'].kind='inferred'"
expect "M4 YAYIN-3 inferred" FAIL "$d" 'inferred ama LEDGER seq 23 closed-inferred demiyor'

# M5 · YAYIN-3 kaydı yanlış LEDGER girdisine bağlanır (seq 22: hazırlık, devir yok)
d=$(fresh M5); edit "$d" "$R['YAYIN-3'].ledger.seq=22"
expect "M5 YAYIN-3 → seq 22" FAIL "$d" 'ai-delegated ama LEDGER seq 22 devirden söz etmiyor'

# M6 · kayıt yok
d=$(fresh M6); edit "$d" "delete $R['YAYIN-3']"
expect "M6 YAYIN-3 kaydı yok" FAIL "$d" 'releaseApprovalRecord.YAYIN-3 yok'

# M7 · LEDGER'da olmayan seq
d=$(fresh M7); edit "$d" "$R['K2F-43'].ledger.seq=999"
expect "M7 seq 999" FAIL "$d" 'LEDGER kaydı bulunamadı'

# M8 · tarih uyuşmazlığı
d=$(fresh M8); edit "$d" "$R['K2F-43'].at='2026-10-05'"
expect "M8 tarih ≠" FAIL "$d" '≠ releaseApproval'

# M9 · LEDGER girdisi yayını anmıyor (K2F-43 kaydı FIX seq 124'e: K2F-34 notu)
d=$(fresh M9); edit "$d" "$R['K2F-43'].ledger.seq=124"
expect "M9 başka yayının kaydı" FAIL "$d" 'bu yayını anmıyor'

rm -rf "$H"
[ "$BAD" = 0 ] && echo "d3f07 mutasyon: 10/10 PASS" || { echo "d3f07 mutasyon: FAIL"; exit 1; }
