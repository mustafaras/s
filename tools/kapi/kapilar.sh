#!/usr/bin/env bash
# KAO2-FIX · tüm kapı komutları tek yerde (PROMPTLAR.md P3). Salt okur: ağ yok, tarayıcı yok, push yok.
# Kullanım (repo kökünden):  bash tools/kapi/kapilar.sh
# Çıkış kodu: 0 = hepsi yeşil · 1 = en az bir kapı kırmızı. Her kapı ayrı değerlendirilir (boru yok).
# D3F-03 (denetim-3 F-03): kırmızı kapının/dosyanın tam çıktısı depo DIŞINA yazılır ve yolu satırda gösterilir
#   (varsayılan $TMPDIR/kapilar-<zaman>-<pid>/, değiştirmek için KAPILAR_LOG_DIR). Perf satırı okunamazsa ya da perf testi
#   sıfırdan farklı çıkarsa kapı KIRMIZIDIR (önceden "okunamadı" yazıp geçiyordu).
# Yavaş makine (D2F-02):  KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh
#   Bayrak kabul testine (A-10) ve bütçe testine açıkça geçirilir; YALNIZ göreli p95 bandı (KAO2-01 makinesine bağlı) atlanır
#   ve perf satırı bunu yazar. Mutlak tavanlar (içerik ≤256 · runtime ≤128 · css ≤14 KiB · p95 ≤40 ms) aynen zorunludur.
#   Bayraksız koşu değişmez: göreli bant da kapıdır.
set -u
cd "$(dirname "$0")/../.." || exit 1

if [ "${KAO2_ACCEPT_SLOW_HOST:-}" = "1" ]; then export KAO2_ACCEPT_SLOW_HOST=1; SLOW=1; else unset KAO2_ACCEPT_SLOW_HOST; SLOW=0; fi

FAILED=0
LOG_DIR="${KAPILAR_LOG_DIR:-${TMPDIR:-/tmp}/kapilar-$(date +%Y%m%d-%H%M%S)-$$}"
row() { printf '%-34s %s\n' "$1" "$2"; }
slug() { printf '%s' "$1" | tr -c 'A-Za-z0-9._-' '_'; }
keep_log() { # keep_log <ad> <geçici çıktı dosyası> → kalıcı günlük yolunu yazar
  mkdir -p "$LOG_DIR"
  local dest="$LOG_DIR/$(slug "$1").log"
  mv "$2" "$dest" && printf '%s' "$dest"
}
gate() { # gate <ad> <komut...>
  local name="$1"; shift
  local out; out="$(mktemp "${TMPDIR:-/tmp}/kapi.XXXXXX")"
  if "$@" >"$out" 2>&1; then row "$name" "PASS"; rm -f "$out"
  else row "$name" "FAIL → $(keep_log "$name" "$out")"; FAILED=1; fi
}
family() { # family <ad> <glob>
  local name="$1" pattern="$2" n=0 fails="" out
  for f in $pattern; do
    [ -f "$f" ] || continue
    n=$((n + 1))
    out="$(mktemp "${TMPDIR:-/tmp}/kapi.XXXXXX")"
    if node "$f" >"$out" 2>&1; then rm -f "$out"
    else fails="$fails $(basename "$f")"; keep_log "$f" "$out" >/dev/null; fi
  done
  if [ -z "$fails" ]; then row "$name ($n)" "PASS"; else row "$name ($n)" "FAIL:$fails → $LOG_DIR"; FAILED=1; fi
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
gate "l2-paket --check"  node tools/kapi/l2-paket-build.mjs --check

gate "kao-plan-check" node docs/kuran-ogreniyorum/tools/kao-plan-check.mjs
# F-19 taşıması (2026-10-09): kayıt senkron kapıları (fix-sync, d2f-sync, D3F-STATE pin) kayıtlarla birlikte özel arşive (mustafaras/seyma-arsiv) gitti.
# Burada yalnız yayın pini tutarlılığı kalır: index.html quranLearn.js ?v= = sw.js SW_VERSION.
gate "pin senkronu" node -e "const fs=require('fs');const i=(/app\/core\/quranLearn\.js\?v=(\w+)/.exec(fs.readFileSync('index.html','utf8'))||[])[1];const w=(/SW_VERSION\s*=\s*['\"]([^'\"]+)/.exec(fs.readFileSync('sw.js','utf8'))||[])[1];if(!i||!w||!w.includes(i)){console.error('pin: index '+i+' sw '+w);process.exit(1)}"

echo "== tekrar-uret özeti =="
node tools/kapi/tekrar-uret.cjs 2>/dev/null | tail -1
echo "== perf =="
PERF_OUT="$(mktemp "${TMPDIR:-/tmp}/kapi.XXXXXX")"
node tests/kao/test_kao2_perf_budget.js >"$PERF_OUT" 2>&1; PERF_RC=$?
PERF_LINE="$(grep 'KAO2 perf:' "$PERF_OUT")"
if [ -z "$PERF_LINE" ] || [ "$PERF_RC" -ne 0 ]; then
  [ -n "$PERF_LINE" ] && echo "$PERF_LINE"
  echo "perf: KIRMIZI (çıkış $PERF_RC$([ -z "$PERF_LINE" ] && printf ', satır okunamadı')) → $(keep_log perf "$PERF_OUT")"; FAILED=1; PERF_OUT=""
elif [ "$SLOW" = "1" ] && ! printf '%s' "$PERF_LINE" | grep -q 'GÖRELİ BANT ATLANDI (yavaş makine)'; then
  echo "$PERF_LINE"; echo "perf: bayrak verildi ama satırda 'GÖRELİ BANT ATLANDI (yavaş makine)' yok"; FAILED=1
else echo "$PERF_LINE"; fi
[ -n "$PERF_OUT" ] && rm -f "$PERF_OUT"
[ -d "$LOG_DIR" ] && [ -n "$(ls -A "$LOG_DIR" 2>/dev/null)" ] && echo "kırmızı çıktılar: $LOG_DIR"

if [ "$FAILED" -eq 0 ]; then echo "SONUÇ: TÜM KAPILAR YEŞİL"; else echo "SONUÇ: KIRMIZI KAPI VAR"; fi
exit "$FAILED"
