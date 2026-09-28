#!/bin/sh
# KAO canlı doğrulama (yayın sonrası, FIX-PROMPTLARI §Ö7 kanıt düzeyi: "yayın").
# Kullanım:  sh docs/kuran-ogreniyorum/duzeltme/araclar/kao-canli-dogrula.sh
#            sh docs/kuran-ogreniyorum/duzeltme/araclar/kao-canli-dogrula.sh app.js
# Pages'in CDN'e yayması birkaç saniye sürer: her dosya için 5 deneme / 8 sn.
# Yalnız GET + `cmp`; hiçbir şey yazmaz, token kullanmaz.
ROOT=$(cd "$(dirname "$0")/../../../.." && pwd)
cd "$ROOT" || exit 1
TMP=${TMPDIR:-/tmp}
BASE=${KAO_LIVE_BASE:-https://mustafaras.github.io/s}
OUT="$TMP/kao-live"
mkdir -p "$OUT"
if [ -n "$1" ]; then
  FILES="$*"
else
  FILES="index.html sw.js app/core/quranLearn.js app/kao.css panel/v2/panel-v2.js"
fi
fail=0
for f in $FILES; do
  name=$(echo "$f" | tr / _)
  ok=1
  i=1
  while [ "$i" -le 5 ]; do
    curl -sf "$BASE/$f?cb=$(date +%s)$i" -o "$OUT/$name" && cmp -s "$OUT/$name" "$f" && { ok=0; break; }
    i=$((i + 1))
    [ "$i" -le 5 ] && sleep 8
  done
  if [ "$ok" = 0 ]; then echo "OK    $f"; else echo "FARK  $f"; fail=1; fi
done
echo "canlı pin $(grep -o 'quranLearn.js?v=[0-9a-z]*' "$OUT/index.html" 2>/dev/null)"
exit $fail
