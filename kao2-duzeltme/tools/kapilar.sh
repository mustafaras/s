#!/usr/bin/env bash
# KAO2-FIX · tüm kapı komutları tek yerde (PROMPTLAR.md P3). Salt okur: ağ yok, tarayıcı yok, push yok.
# Kullanım (repo kökünden):  bash kao2-duzeltme/tools/kapilar.sh
# Çıkış kodu: 0 = hepsi yeşil · 1 = en az bir kapı kırmızı. Her kapı ayrı değerlendirilir (boru yok).
# Yavaş makine (D2F-02):  KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh
#   Bayrak kabul testine (A-10) ve bütçe testine açıkça geçirilir; YALNIZ göreli p95 bandı (KAO2-01 makinesine bağlı) atlanır
#   ve perf satırı bunu yazar. Mutlak tavanlar (içerik ≤256 · runtime ≤128 · css ≤14 KiB · p95 ≤40 ms) aynen zorunludur.
#   Bayraksız koşu değişmez: göreli bant da kapıdır.
set -u
cd "$(dirname "$0")/../.." || exit 1

if [ "${KAO2_ACCEPT_SLOW_HOST:-}" = "1" ]; then export KAO2_ACCEPT_SLOW_HOST=1; SLOW=1; else unset KAO2_ACCEPT_SLOW_HOST; SLOW=0; fi

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
if [ "$SLOW" = "1" ]; then echo "mod: YAVAŞ MAKİNE (KAO2_ACCEPT_SLOW_HOST=1) — yalnız göreli p95 bandı atlanır, mutlak tavanlar zorunlu"; fi
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
gate "d2f-sync-check --strict" node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs --strict
# D3F-00: kapanmış programlar 128ab06d'de dondu; canlı yayın pini D3F-STATE.pins.release = index.html quranLearn.js ?v= = sw.js SW_VERSION
gate "d3f pin senkronu" node -e "const fs=require('fs');const s=JSON.parse(fs.readFileSync('kao2-duzeltme/denetim-3/D3F-STATE.json','utf8'));const i=(/app\/core\/quranLearn\.js\?v=(\w+)/.exec(fs.readFileSync('index.html','utf8'))||[])[1];const w=(/SW_VERSION\s*=\s*'(\w+)'/.exec(fs.readFileSync('sw.js','utf8'))||[])[1];if(!(s.pins&&s.pins.release&&s.pins.release===i&&i===w)){console.error('D3F pin: STATE '+(s.pins&&s.pins.release)+' · index '+i+' · sw '+w);process.exit(1);}"

echo "== tekrar-uret özeti =="
node kao2-duzeltme/denetim/tekrar-uret.cjs 2>/dev/null | tail -1
echo "== perf =="
PERF_LINE="$(node tests/kao/test_kao2_perf_budget.js 2>/dev/null | grep 'KAO2 perf:')"
if [ -z "$PERF_LINE" ]; then echo "perf satırı okunamadı"
elif [ "$SLOW" = "1" ] && ! printf '%s' "$PERF_LINE" | grep -q 'GÖRELİ BANT ATLANDI (yavaş makine)'; then
  echo "$PERF_LINE"; echo "perf: bayrak verildi ama satırda 'GÖRELİ BANT ATLANDI (yavaş makine)' yok"; FAILED=1
else echo "$PERF_LINE"; fi

if [ "$FAILED" -eq 0 ]; then echo "SONUÇ: TÜM KAPILAR YEŞİL"; else echo "SONUÇ: KIRMIZI KAPI VAR"; fi
exit "$FAILED"
