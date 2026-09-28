#!/bin/sh
# KAO kapıları — STANDART KONTROL SETİ (FIX-PROMPTLARI §Ö4).
# Kullanım:  sh docs/kuran-ogreniyorum/duzeltme/araclar/kao-kapilar.sh
# Çıkış: her satır "<kapı> <durum>"; FAIL satırı varsa exit 1.
# Not: bu betik yalnız KOŞAR; hiçbir dosyayı değiştirmez (salt-okur kapı seti).
ROOT=$(cd "$(dirname "$0")/../../../.." && pwd)
cd "$ROOT" || exit 1
TMP=${TMPDIR:-/tmp}
fail=0

# Aileler
for f in tests/kao/*.js; do
  node "$f" >/dev/null 2>&1 || { echo "FAIL kao $f"; fail=1; }
done
echo "kao PASS ($(ls tests/kao/*.js | wc -l | tr -d ' ') dosya)"
for d in app panel panel-v2 quran; do
  n=0; k=0
  for f in tests/$d/*.js; do
    n=$((n + 1))
    if node "$f" >/dev/null 2>&1; then k=$((k + 1)); else echo "FAIL $d $f"; fail=1; fi
  done
  echo "$d $k/$n"
done
node tests/reminders/run-reminder-smoke.mjs 2>&1 | tail -1

# STD
node .claude/skills/run-seyma/driver.mjs >"$TMP/kao-d.log" 2>&1; echo "driver $?"
node .claude/skills/run-seyma/zikr-harness.mjs >"$TMP/kao-z.log" 2>&1
echo "zikr $? $(tail -1 "$TMP/kao-z.log")"
node tests/app/test_state_rebind_boundary.js >/dev/null 2>&1; echo "rebind $?"
node tools/shell-inventory.mjs --gate 2>&1 | tail -1 | cut -c1-40
node docs/kuran-ogreniyorum/tools/kao-plan-check.mjs 2>&1 | tail -1
node docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs 2>&1 | tail -1 | cut -c1-80

# Hijyen
git -c core.fsmonitor=false diff --check 2>/dev/null && echo diffcheck-ok

# Yüzey pinleri (yorumda değil, kodda aranır)
echo "App.kao=$(grep -o 'App\.kao[A-Za-z0-9_]*=function' app.js | sort -u | wc -l | tr -d ' ') · quranLearn.js $(wc -l <app/core/quranLearn.js | tr -d ' ') satır"

exit $fail
