#!/usr/bin/env bash
# D3F-04 · d2f-sync-check --strict mutasyon sınaması (yeniden üretilebilir; ağ yok, depoya yazmaz).
# HEAD $TMPDIR'e klonlanır; aracın ve D2F-STATE'in ÇALIŞMA AĞACINDAKİ hâli klona commit'lenmeden kopyalanır (aralığa sahte taban commit'i girmesin); her senaryo kendi klonunda
# sahte commit'lerle kurulur. Beklenen sonuç tutmazsa çıkış 1.
#   bash kao2-duzeltme/denetim-3/evidence/D3F-04/d2f-mutasyon.sh
set -u
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
TOOL=kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs
STATE=kao2-duzeltme/denetim-2/D2F-STATE.json
H="$(mktemp -d "${TMPDIR:-/tmp}/d2f-mut.XXXXXX")"
BAD=0
G() { git -c user.name=mut -c user.email=mut@example.invalid "$@"; }
CLOSE="$(node -e "process.stdout.write(require('$REPO/$STATE').closeCommit||'')")"
fresh() { # fresh <ad> [kapanış] → klon yolu; "kapanış" verilirse klon D2F kapanış commit'ine alınır (sonraki D3F commit'leri aralığa girmesin)
  local d="$H/$1"
  git clone -q "$REPO" "$d" && { [ -z "${2:-}" ] || (cd "$d" && git checkout -q "$CLOSE"); } && cp "$REPO/$TOOL" "$d/$TOOL" && cp "$REPO/$STATE" "$d/$STATE"
  printf '%s' "$d"
}
close_at_head() { node -e "const fs=require('fs');const p='$STATE';const s=JSON.parse(fs.readFileSync(p,'utf8'));s.closeCommit=require('child_process').execSync('git rev-parse HEAD').toString().trim();fs.writeFileSync(p,JSON.stringify(s,null,2)+'\n')"; }
expect() { # expect <ad> <PASS|FAIL> <dizin> [çıktıda aranacak metin]
  local out rc; out="$(cd "$3" && node "$TOOL" --strict 2>&1)"; rc=$?
  local got=PASS; [ "$rc" -ne 0 ] && got=FAIL
  if [ "$got" = "$2" ] && { [ -z "${4:-}" ] || printf '%s' "$out" | grep -q -- "$4"; }; then echo "PASS  $1 → $got"
  else echo "FAIL  $1 → beklenen $2${4:+ (\"$4\")}, gelen $got"; printf '%s\n' "$out" | sed 's/^/      /' | head -8; BAD=1; fi
}

# T0 · gerçek durum (dokunulmamış klon): yeşil
d=$(fresh T0); expect "T0 gerçek durum" PASS "$d"

# T1–T3: klon kapanış commit'inde; ek commit onun ardına atılır, kapanış ona kaydırılır.
# T1 · kapanmış aralığa kayıtlı istisnanın ötesinde ek D2F-16 commit'i (kapanış onu kapsayacak şekilde kaydırılır)
d=$(fresh T1 kapanış); (cd "$d" && G commit -q --allow-empty -m "D2F-16: üçüncü commit" && close_at_head); expect "T1 D2F-16 3. commit" FAIL "$d" "D2F-16"

# T2 · aynısı D2F-11 için
d=$(fresh T2 kapanış); (cd "$d" && G commit -q --allow-empty -m "D2F-11: üçüncü commit" && close_at_head); expect "T2 D2F-11 3. commit" FAIL "$d" "D2F-11"

# T3 · istisnasız tek commit'li bir prompt'a ikinci commit (D2F-14)
d=$(fresh T3 kapanış); (cd "$d" && G commit -q --allow-empty -m "D2F-14: ikinci commit" && close_at_head); expect "T3 D2F-14 2. commit" FAIL "$d" "D2F-14"

# T4 · kapanıştan SONRA kapanmış programın öneki (closeCommit kaydırılmaz)
d=$(fresh T4); (cd "$d" && G commit -q --allow-empty -m "D2F-16: kapanıştan sonra"); expect "T4 kapanış sonrası D2F öneki" FAIL "$d" "kapanmış"
d=$(fresh T5); (cd "$d" && G commit -q --allow-empty -m "K2F-43: kapanıştan sonra"); expect "T5 kapanış sonrası K2F öneki" FAIL "$d" "kapanmış"

# T6 · kapanıştan sonra yeni programın öneki serbest
d=$(fresh T6); (cd "$d" && G commit -q --allow-empty -m "D3F-99: yeni program"); expect "T6 kapanış sonrası D3F" PASS "$d"

# T7 · rule a istisnasında commits listesi yoksa kayıt geçersiz
d=$(fresh T7); (cd "$d" && node -e "const fs=require('fs');const p='$STATE';const s=JSON.parse(fs.readFileSync(p,'utf8'));s.strictExceptions.find(e=>e.rule==='a').commits=undefined;fs.writeFileSync(p,JSON.stringify(s,null,2)+'\n')"); expect "T7 commits'siz a istisnası" FAIL "$d" "commits"

rm -rf "$H"
[ "$BAD" = 0 ] && echo "d2f mutasyon: 8/8 PASS" || { echo "d2f mutasyon: FAIL"; exit 1; }
