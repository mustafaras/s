#!/usr/bin/env bash
# KAO2-FIX · tüm kapı komutları tek yerde (PROMPTLAR.md P3). Salt okur: ağ yok, tarayıcı yok, push yok.
# Kullanım (repo kökünden):  bash kao2-duzeltme/tools/kapilar.sh
# Çıkış kodu: 0 = hepsi yeşil · 1 = en az bir kapı kırmızı. Her kapı ayrı değerlendirilir (boru yok).
set -u
cd "$(dirname "$0")/../.." || exit 1

FAILED=0
row() { printf '%-34s %s\n' "$1" "$2"; }
gate() { # gate <ad> <komut...>
  local name="$1"; shift
  if "$@" >/dev/null 2>&1; then row "$name" "PASS"; else row "$name" "FAIL"; FAILED=1; fi
}
family() { # family <ad> <glob>
  local name="$1" pattern="$2" n=0 fails=""
  for f in $pattern; do
    [ -f "$f" ] || continue
    n=$((n + 1))
    node "$f" >/dev/null 2>&1 || fails="$fails $(basename "$f")"
  done
  if [ -z "$fails" ]; then row "$name ($n)" "PASS"; else row "$name ($n)" "FAIL:$fails"; FAILED=1; fi
}

echo "== KAO2-FIX kapıları =="
for f in app/core/quranLearn.js app/core/quranLearnFlow.js app/core/quranLearnViews.js app/content/quranCurriculumV2.js app/content/quranGrammarV1.js; do
  gate "node --check $(basename "$f")" node --check "$f"
done
family "tests/kao"      "tests/kao/test_*.js"
family "tests/app"      "tests/app/test_*.js"
family "tests/panel"    "tests/panel/test_*.js"
family "tests/panel-v2" "tests/panel-v2/test_panel_v2_*.js"
family "tests/quran"    "tests/quran/test_*.js"
gate "reminders smoke"   node tests/reminders/run-reminder-smoke.mjs
gate "run-seyma driver"  node .claude/skills/run-seyma/driver.mjs
gate "run-seyma zikr"    node .claude/skills/run-seyma/zikr-harness.mjs
gate "kontrast"          node docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs
gate "l2-paket --check"  node kao2-duzeltme/tools/l2-paket-build.mjs --check

# kao-plan-check yalnız K2F-01 tamamlandıktan sonra kapıdır (öncesinde tarihsel 22 FAIL beklenir).
PLAN_READY="$(node -e "const s=require('./kao2-duzeltme/FIX-STATE.json');process.stdout.write(s.prompts&&s.prompts['K2F-01']&&s.prompts['K2F-01'].status==='done'?'1':'0')" 2>/dev/null)"
if [ "$PLAN_READY" = "1" ]; then gate "kao-plan-check" node docs/kuran-ogreniyorum/tools/kao-plan-check.mjs
else row "kao-plan-check" "ATLANDI (K2F-01 öncesi)"; fi

gate "fix-sync-check --repro" node kao2-duzeltme/tools/fix-sync-check.mjs --repro

echo "== tekrar-uret özeti =="
node kao2-duzeltme/denetim/tekrar-uret.cjs 2>/dev/null | tail -1
echo "== perf =="
node tests/kao/test_kao2_perf_budget.js 2>/dev/null | grep 'KAO2 perf:' || echo "perf satırı okunamadı"

if [ "$FAILED" -eq 0 ]; then echo "SONUÇ: TÜM KAPILAR YEŞİL"; else echo "SONUÇ: KIRMIZI KAPI VAR"; fi
exit "$FAILED"
