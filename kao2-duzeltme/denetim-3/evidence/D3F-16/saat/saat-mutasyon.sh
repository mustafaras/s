#!/usr/bin/env bash
# D3F-16 ek · KAO test düzeneği saati (bootKao `now` → VM Date) mutasyon sınaması (ağ yok, depoya yazmaz).
# HEAD $TMPDIR'e klonlanır; düzenek ve gramer görevleri testi ÇALIŞMA AĞACINDAKİ hâliyle klona kopyalanır.
#   bash kao2-duzeltme/denetim-3/evidence/D3F-16/saat/saat-mutasyon.sh
set -u
REPO="$(cd "$(dirname "$0")/../../../../.." && pwd)"
SRC=tests/kao/helpers/kao-harness.js
TEST=tests/kao/test_kao2_grammar_tasks.js
H="$(mktemp -d "${TMPDIR:-/tmp}/d3f16-saat.XXXXXX")"
BAD=0; N=0
fresh() { local d="$H/$1"; git clone -q "$REPO" "$d" && cp "$REPO/$SRC" "$d/$SRC" && cp "$REPO/$TEST" "$d/$TEST"; printf '%s' "$d"; }
mutate() { # mutate <dizin> <eski> <yeni>
  (cd "$1" && OLD="$2" NEW="$3" node -e "const fs=require('fs');const p='$SRC';const s=fs.readFileSync(p,'utf8');
    if(!s.includes(process.env.OLD)){console.error('mutasyon noktası yok: '+process.env.OLD);process.exit(2)}
    fs.writeFileSync(p,s.split(process.env.OLD).join(process.env.NEW))") || { echo "mutasyon noktası yok — betik eski"; rm -rf "$H"; exit 2; }
}
expect() { # expect <ad> <PASS|FAIL> <dizin> [çıktıda aranacak metin]
  N=$((N+1))
  local out rc; out="$(cd "$3" && node "$TEST" 2>&1)"; rc=$?
  local got=PASS; [ "$rc" -ne 0 ] && got=FAIL
  if [ "$got" = "$2" ] && { [ -z "${4:-}" ] || printf '%s' "$out" | grep -q -- "$4"; }; then echo "PASS  $1 → $got"
  else echo "FAIL  $1 → beklenen $2${4:+ (\"$4\")}, gelen $got"; printf '%s\n' "$out" | grep -E 'Error|FAIL' | sed 's/^/      /' | head -4; BAD=1; fi
}

# M0 · düzeltilmiş hâl (D4 dahil yeşil)
d=$(fresh M0); expect "M0 düzeltilmiş" PASS "$d" 'kontrol PASS'

# M1 · eski davranış: VM'e gerçek Date verilir (bulgunun kendisi)
d=$(fresh M1); mutate "$d" 'Date: clockAt(now) }' 'Date }'
expect "M1 gerçek Date" FAIL "$d" 'anından başlamalı'

# M2 · yalnız Date.now kayar, argümansız new Date() gerçek saatte kalır
d=$(fresh M2); mutate "$d" 'if (args.length === 0) super(Real.now() + offset); else super(...args);' 'super(...args);'
expect "M2 new Date() kaymaz" FAIL "$d" 'VM new Date() tarihi'

# M3 · yalnız new Date() kayar, Date.now gerçek saatte kalır
d=$(fresh M3); mutate "$d" '    static now() { return Real.now() + offset; }
' ''
expect "M3 Date.now kaymaz" FAIL "$d" 'anından başlamalı'

rm -rf "$H"
[ "$BAD" = 0 ] && echo "d3f16-saat mutasyon: $N/$N PASS" || { echo "d3f16-saat mutasyon: FAIL"; exit 1; }
