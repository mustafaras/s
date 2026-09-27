#!/bin/sh
# KAO yayın sonrası Pages koşusunu bekler (FIX-PROMPTLARI §Ö7 kanıt düzeyi: "yayın").
# Kullanım:  sh kuran-ogreniyorum/duzeltme/araclar/kao-pages-izle.sh <commit-kısa-hash>
# `gh` gerektirir; yalnız okur.
ROOT=$(cd "$(dirname "$0")/../../.." && pwd)
cd "$ROOT" || exit 1
H=$1
[ -n "$H" ] || { echo "kullanım: $0 <commit-kısa-hash>"; exit 2; }
sleep 10
id=$(gh run list --branch main --limit 8 --json databaseId,headSha --jq ".[] | select(.headSha|startswith(\"$H\")) | .databaseId" | head -1)
[ -n "$id" ] || { echo "koşu bulunamadı ($H)"; exit 1; }
gh run watch "$id" --exit-status >/dev/null 2>&1
echo "run $id watch exit $?"
gh run view "$id" --json conclusion,jobs --jq '.conclusion + " · " + ([.jobs[]|.name+":"+.conclusion]|join(" "))'
