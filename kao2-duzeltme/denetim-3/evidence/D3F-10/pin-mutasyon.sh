#!/usr/bin/env bash
# D3F-10 · test_asset_pin_freshness.js mutasyon sınaması (yeniden üretilebilir; ağ yok, depoya yazmaz).
# HEAD $TMPDIR'e klonlanır (D3F-10 commit'inden SONRA koşulur: senaryolar commit'lenmiş pinlere dayanır).
#   bash kao2-duzeltme/denetim-3/evidence/D3F-10/pin-mutasyon.sh
set -u
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
TEST=tests/app/test_asset_pin_freshness.js
H="$(mktemp -d "${TMPDIR:-/tmp}/d3f10-mut.XXXXXX")"
BAD=0
G() { git -c user.name=mut -c user.email=mut@example.invalid "$@"; }
fresh() { local d="$H/$1"; git clone -q ${2:-} "file://$REPO" "$d" && cp "$REPO/$TEST" "$d/$TEST"; printf '%s' "$d"; }
expect() { # expect <ad> <PASS|FAIL> <dizin> [çıktıda aranacak metin]
  local out rc; out="$(cd "$3" && node "$TEST" 2>&1)"; rc=$?
  local got=PASS; [ "$rc" -ne 0 ] && got=FAIL
  if [ "$got" = "$2" ] && { [ -z "${4:-}" ] || printf '%s' "$out" | grep -q -- "$4"; }; then echo "PASS  $1 → $got"
  else echo "FAIL  $1 → beklenen $2${4:+ (\"$4\")}, gelen $got"; printf '%s\n' "$out" | grep -v '^    at' | sed 's/^/      /' | head -6; BAD=1; fi
}
J=app/core/journal.js
JV="$(grep -o 'app/core/journal\.js?v=[0-9a-z]*' "$REPO/index.html" | head -1)"

# M0 · düzeltilmiş hâl: 60 bağlantı taze
d=$(fresh M0); expect "M0 düzeltilmiş" PASS "$d" 'benzersiz ?v= bağlantısı taze'

# M1 · F-10'un kendisi: state.js pini eski değerine döner (commit'li)
d=$(fresh M1); (cd "$d" && perl -pi -e 's/app\/core\/state\.js\?v=\w+/app\/core\/state.js?v=20260910b/g' index.html sw.js && G commit -qam "mut: eski pin")
expect "M1 state.js eski pin" FAIL "$d" 'app/core/state.js?v=20260910b'

# M2 · dosya commit'lenmeden değişir, pini aynı kalır
d=$(fresh M2); (cd "$d" && printf '\n// mut\n' >> "$J")
expect "M2 çalışma ağacı değişikliği" FAIL "$d" "$JV.*çalışma ağacında"

# M3 · dosya değişip commit'lenir, pini aynı kalır
d=$(fresh M3); (cd "$d" && printf '\n// mut\n' >> "$J" && G commit -qam "mut: pinsiz değişiklik")
expect "M3 pinsiz commit" FAIL "$d" "$JV.*1 commit"

# M4 · M3 + pin yükseltilir (commit'lenmemiş yeni pin) → taze
(cd "$d" && perl -pi -e 's/app\/core\/journal\.js\?v=\w+/app\/core\/journal.js?v=29991231z/g' index.html sw.js)
expect "M4 pin yükseltilince taze" PASS "$d"

# M5 · sığ klon: sessiz PASS değil, açık SKIP
d=$(fresh M5 "--depth=1"); expect "M5 sığ klon" PASS "$d" 'SKIP  sığ klon'

rm -rf "$H"
[ "$BAD" = 0 ] && echo "d3f10 mutasyon: 6/6 PASS" || { echo "d3f10 mutasyon: FAIL"; exit 1; }
