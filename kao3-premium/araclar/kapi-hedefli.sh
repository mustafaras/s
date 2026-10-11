#!/usr/bin/env bash
# K3P hedefli kapı (K-Q, kullanıcı kararı 2026-10-11): kart kapanışında ≤ 3 dk. Sözdizimi + navigation/a11y/inventory/design_contract
# + argümanla verilen kartın tests/kao dosyaları + tests/app ailesi + run-seyma driver + perf. Dalga sonunda kapi-hizli ve kapilar.sh ayrıca zorunlu.
# Kullanım: bash kao3-premium/araclar/kapi-hedefli.sh tests/kao/test_k3p_X.js ...  · Çıktıda FAIL varsa kapı kırmızıdır.
cd "$(dirname "$0")/../.." || exit 1
L="${TMPDIR:-/tmp}/k3p-hedefli-$$"; mkdir -p "$L"; t0=$(date +%s)
for f in app.js sync.js app/core/quranLearn.js app/core/quranLearnFlow.js app/core/quranLearnViews.js app/core/helpers.js app/core/render.js; do node --check "$f" || echo "SÖZDİZİMİ FAIL $f" >> "$L/fail"; done
fam(){ local name="$1"; shift; local n=0 f=""; for t in "$@"; do [ -f "$t" ] || continue; n=$((n+1)); node "$t" > "$L/$(basename "$t").log" 2>&1 || f="$f $(basename "$t")"; done; echo "$name ($n): ${f:-PASS}"; }
( fam app tests/app/test_*.js > "$L/s1" ) &
( fam kao tests/kao/test_kao2_navigation.js tests/kao/test_kao2_a11y.js tests/kao/test_kao2_inventory.js tests/kao/test_kao2_design_contract.js "$@" > "$L/s2" ) &
( node .claude/skills/run-seyma/driver.mjs >/dev/null 2>&1 && echo "driver PASS" > "$L/s3" || echo "driver FAIL" > "$L/s3"; KAO2_ACCEPT_SLOW_HOST=1 node tests/kao/test_kao2_perf_budget.js 2>&1 | grep 'KAO2 perf' | cut -c1-120 >> "$L/s3" ) &
wait
cat "$L"/s1 "$L"/s2 "$L"/s3 "$L"/fail 2>/dev/null; echo "süre $(( $(date +%s) - t0 )) sn · günlük $L"
