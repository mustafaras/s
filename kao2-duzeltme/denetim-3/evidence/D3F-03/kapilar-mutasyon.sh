#!/usr/bin/env bash
# D3F-03 · kapilar.sh mekanik mutasyon sınaması (yeniden üretilebilir; ağ yok, depo yazımı yok).
# kapilar.sh'ın KENDİ metninden gate/family/keep_log fonksiyonları ve perf bloğu çıkarılır, $TMPDIR'deki sahte
# testlerle 5 senaryo koşulur. Her senaryonun beklenen sonucu sınanır; biri tutmazsa çıkış 1.
#   bash kao2-duzeltme/denetim-3/evidence/D3F-03/kapilar-mutasyon.sh [kapilar.sh yolu]
set -u
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
K="${1:-$REPO/kao2-duzeltme/tools/kapilar.sh}"
H="$(mktemp -d "${TMPDIR:-/tmp}/kapilar-mut.XXXXXX")"
sed -n '/^FAILED=0$/,/^echo "== KAO2-FIX kapıları =="$/p' "$K" | sed '$d' > "$H/funcs.sh"
sed -n '/^PERF_OUT=/,/kırmızı çıktılar/p' "$K" > "$H/perf.sh"
[ -s "$H/funcs.sh" ] && [ -s "$H/perf.sh" ] || { echo "kapilar.sh'tan fonksiyon/perf bloğu çıkarılamadı"; exit 1; }

BAD=0
scen() { # scen <ad> <beklenen FAILED> <perf testi gövdesi> [ikinci aile dosyası gövdesi] [kötü kapı=1]
  local n="$1" want="$2" d="$H/$1"
  mkdir -p "$d/tests/kao" "$d/fam" "$d/tmp"
  echo 'console.log("ok")' > "$d/fam/test_a.js"
  printf '%s\n' "$3" > "$d/tests/kao/test_kao2_perf_budget.js"
  [ -n "${4:-}" ] && printf '%s\n' "$4" > "$d/fam/test_b.js"
  local out
  out="$(cd "$d" && BADGATE="${5:-0}" TMPDIR="$d/tmp" bash -c '
    set -u; SLOW=0; source "$1/funcs.sh"; LOG_DIR="$PWD/log"
    gate "iyi kapi" true
    [ "$BADGATE" = 1 ] && gate "kotu kapi" node -e "console.error(\"kotu-kapi-izi\");process.exit(3)"
    family "fam" "fam/test_*.js"
    source "$1/perf.sh"
    echo "FAILED=$FAILED"' _ "$H" 2>&1)"
  local got; got="$(printf '%s\n' "$out" | sed -n 's/^FAILED=//p')"
  local leftover; leftover="$(ls -A "$d/tmp")"
  local logs; logs="$(ls "$d/log" 2>/dev/null | tr '\n' ' ')"
  local ok=1
  [ "$got" = "$want" ] || ok=0
  [ -z "$leftover" ] || ok=0                                  # geçici çıktı dosyası artığı kalmaz
  if [ "$want" = 0 ]; then [ -z "$logs" ] || ok=0; else [ -n "$logs" ] || ok=0; fi
  [ "$n" = M3 ] && { grep -q "aile-izi-123" "$d"/log/* 2>/dev/null || ok=0; }
  [ "$n" = M4 ] && { grep -q "kotu-kapi-izi" "$d"/log/* 2>/dev/null || ok=0; }
  if [ "$ok" = 1 ]; then echo "PASS  $n  FAILED=$got  günlük: ${logs:-yok}"; else echo "FAIL  $n  beklenen FAILED=$want, gelen ${got:-?} · günlük: ${logs:-yok} · artık: ${leftover:-yok}"; printf '%s\n' "$out" | sed 's/^/      /'; BAD=1; fi
}
OKP='console.log("KAO2 perf: PASS (sahte)")'
scen M0 0 "$OKP"                                                        # her şey yeşil → günlük yok
scen M1 1 'process.exit(1)'                                             # perf satırı yok, çıkış 1 (eski kapı: FAILED=0)
scen M2 1 'console.log("KAO2 perf: PASS (sahte)");process.exit(1)'      # satır var ama çıkış ≠ 0
scen M3 1 "$OKP" 'console.error("aile-izi-123");process.exit(1)'        # aile dosyası kırık → çıktısı günlükte
scen M4 1 "$OKP" '' 1                                                   # tek kapı kırık → çıktısı günlükte
rm -rf "$H"
[ "$BAD" = 0 ] && echo "kapilar mutasyon: 5/5 PASS" || { echo "kapilar mutasyon: FAIL"; exit 1; }
