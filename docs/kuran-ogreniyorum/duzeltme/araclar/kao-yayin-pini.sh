#!/bin/sh
# KAO yayın pini (PIN-P, FIX-PROMPTLARI §Ö2).
# Kullanım:  sh docs/kuran-ogreniyorum/duzeltme/araclar/kao-yayin-pini.sh 20260927h
# 9 dosyayı (index.html, sw.js, 7 tests/app) birlikte yükseltir; eski pin kalırsa exit 9.
# KURAL: yalnız `quranLearn.js`/`kao.css`/içerik modülü/`app.js` değişirse koşulur.
#        `quranPhonicsV1.js`'in AYRI pini vardır (20260924b) — bu betik ona dokunmaz.
ROOT=$(cd "$(dirname "$0")/../../../.." && pwd)
cd "$ROOT" || exit 1
TMP=${TMPDIR:-/tmp}
NEW=$1
[ -n "$NEW" ] || { echo "kullanım: $0 <yeni-pin, ör. 20260927h>"; exit 2; }
OLD=$(grep -o 'quranLearn.js?v=[0-9a-z]*' index.html | cut -d= -f2)
[ -n "$OLD" ] || { echo "eski pin okunamadı"; exit 2; }
[ "$OLD" != "$NEW" ] || { echo "aynı pin ($OLD)"; exit 9; }

grep -rlF "$OLD" index.html sw.js tests/app >"$TMP/kao-pinfiles.txt"
n=$(wc -l <"$TMP/kao-pinfiles.txt" | tr -d ' ')
echo "$OLD -> $NEW ($n dosya)"
[ "$n" -ge 9 ] || { echo "UYARI: beklenen 9 dosya, bulunan $n"; }
xargs sed -i '' "s/$OLD/$NEW/g" <"$TMP/kao-pinfiles.txt"

echo "sw.js yeni=$(grep -c "$NEW" sw.js) · eski pin kalan=$(grep -rlF "$OLD" index.html sw.js tests/app | wc -l | tr -d ' ')"
