#!/usr/bin/env bash
# YAYIN-9 · canlı bayt eşitliği + gizlilik 404 (yalnız GET; hiçbir şey yazmaz, token kullanmaz).
#   bash kao2-duzeltme/denetim-3/evidence/YAYIN-9/canli-dogrula.sh
# Varlık listesi index.html + panel-v2.html içindeki ?v= referanslarından ve kabuk dosyalarından TÜRETİLİR; karşılaştırma `git show HEAD:`.
set -u
cd "$(dirname "$0")/../../../.." || exit 1
BASE=${KAO_LIVE_BASE:-https://mustafaras.github.io/s}
T="$(mktemp -d "${TMPDIR:-/tmp}/y9-canli.XXXXXX")"
same=0; diff=0
list() { { printf '%s\n' index.html sw.js panel-v2.html manifest.json; for h in index.html panel-v2.html; do grep -oE '(src|href)="[^"#]+\?v=[0-9a-z]+"' "$h" | sed -E 's/^(src|href)="//; s/"$//'; done; } | grep -v '^https\?:' | sort -u; }
while IFS= read -r ref; do
  path="${ref%%\?*}"; ok=1
  git show "HEAD:$path" > "$T/want" 2>/dev/null || { echo "YOK     $ref (HEAD'de yok)"; diff=$((diff+1)); continue; }
  for i in 1 2 3 4; do
    if curl -sf "$BASE/$ref$([ "$ref" = "$path" ] && echo '?' || echo '&')cb=$(date +%s)$i" -o "$T/got" && cmp -s "$T/got" "$T/want"; then ok=0; break; fi
    sleep 5
  done
  if [ "$ok" = 0 ]; then echo "EŞİT    $ref"; same=$((same+1)); else echo "FARKLI  $ref"; diff=$((diff+1)); fi
done < <(list)
priv=0; ptotal=0
for p in kao2-duzeltme/denetim-3/evidence/YAYIN-9/YAYIN.md kao2-duzeltme/denetim-3/D3F-STATE.json docs/kuran-ogreniyorum/kao2/content/texts.tr.json \
  tests/kao/test_kao2_grammar_tasks.js tools/kao2-curriculum-build.mjs kao2-duzeltme/denetim-2/LEDGER.md kao2-duzeltme/denetim-2/DUZELTME-SONUCU.md \
  docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md; do
  ptotal=$((ptotal+1)); code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/$p?cb=$(date +%s)"); echo "$code $p"; [ "$code" = 404 ] && priv=$((priv+1))
done
rm -rf "$T"
echo "canlı: $same EŞİT / $diff FARKLI · gizlilik $priv/$ptotal 404"
[ "$diff" = 0 ] && [ "$priv" = "$ptotal" ]
