# KAO2-FIX denetim-2 · LEDGER

Yalnız sona ekleme. Kayıt başlığı: `## seq N · YYYY-MM-DD · PROMPT|GATE|NOTE|BLOCKED · D2F-NN`.
Kurallar: [`ORTAK-KURALLAR.md`](ORTAK-KURALLAR.md) · senkron: `node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs`.

## seq 1 · 2026-10-07 · PROMPT · D2F-01
- başlık: Başlangıç ve ölçüm — program kayıt düzeni kuruldu, başlangıç ölçümü alındı.
- oturum: https://claude.ai/code/session_014qMpdeGfsHqM16zgcXbCwT
- baseCommit: `cbe0d604` (2d260251'i içerir; dal `claude/happy-newton-okecaw` `36015f08`'den `origin/claude/keen-tesla-npy1og`'a hızlı ileri sarıldı — denetim-2 belgeleri yalnız orada vardı).
- yeni dosyalar: D2F-STATE.json · CURRENT-STATE.md · LEDGER.md · tools/d2f-sync-check.mjs · evidence/D2F-01/KANIT.md.
- ölçüm: kapilar.sh (bayraksız, tam, 14 dk 32 sn) çıkış 1 — yalnız `test_kao2_kabul.js` + `test_kao2_perf_budget.js` kırmızı (beklenen; göreli p95 bandı). tekrar-uret-2 0/9 · tekrar-uret 10/10.
- pinler (araçla): App.kao* 45 · yüzey 766 · atama 604 · onclick 393 · yayın 20261006e.
- sürpriz: konteyner sığ klonla gelmişti (53 commit) ve `rsync` yoktu → ilk koşuda 4 ek kırmızı; `git fetch --unshallow` + `rsync` kurulumu sonrası koşu yinelendi (ayrıntı KANIT §Sürprizler).
- evidence: kao2-duzeltme/denetim-2/evidence/D2F-01/KANIT.md
- next: D2F-02

## seq 2 · 2026-10-07 · PROMPT · D2F-02
- başlık: Kapı araçları — plan-check istisnası tek commit'e daraldı, kapılar yavaş makinede dürüstçe yeşil.
- oturum: https://claude.ai/code/session_018iQKmY6Zw9KwXkn632WQoN
- dal: `claude/jolly-ride-9ltui4` (`36015f08` → `10537d18` ff-only, sonra bu commit).
- değişen: kao-plan-check.mjs (genel `K2F-NN ek:` izni kaldırıldı; tek hash istisnası 65e94db2; D2F-01…16 tanınır) · kao-plan-check.test.mjs (+8 vaka, 38/38) · kapilar.sh (`KAO2_ACCEPT_SLOW_HOST=1` açıkça geçirilir, perf satırı denetlenir) · test_kao2_perf_budget.js (bayrakla yalnız göreli bant atlanır, stdout'a yazılır).
- kapılar: bayraksız çıkış 1 (yalnız göreli p95: kabul + perf) · bayraklı çıkış 0 "SONUÇ: TÜM KAPILAR YEŞİL". tekrar-uret-2 0/9 · tekrar-uret 10/10.
- mutasyon: sahte runtime (>128 KiB) bayraklı perf FAIL · istisna listesi boş → self-test FAIL · D2F aralığı genişletilince FAIL.
- evidence: kao2-duzeltme/denetim-2/evidence/D2F-02/KANIT.md
- next: D2F-03
