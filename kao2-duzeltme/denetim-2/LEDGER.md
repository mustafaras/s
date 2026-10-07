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

## seq 3 · 2026-10-07 · PROMPT · D2F-03
- başlık: "Kelime dizme" aynı görünen çipler — sıra kontrolü çip kimliği yerine çip yazısına dayanır (D2-01).
- oturum: https://claude.ai/code/session_018WK6EKGxUJbKAaNFboTVpv
- dal: `claude/sharp-volta-l6ifgz` (`36015f08` → `2edc9810` ff-only, sonra bu commit).
- değişen: `app/core/quranLearn.js` (yeni yardımcı `kaoOrderLabels`; `applyAnswer` dizme doğruluğu ve `kaoTaskHTML` geri bildirim çip durumu yazıya dayanır; `kaoAnswerText` aynı yardımcıyı kullanır) · `tests/kao/test_kao2_grammar_tasks.js` (bölüm D, 4 kontrol: D1–D4; 27 → 31).
- dokunulmadı: FSRS (`kaoSchedule`), `kaoBuildQueue`, `kaoGrammarTaskValid`, `app.js`, pinler/sw.
- kapılar: bayraklı kapilar.sh çıkış 0 "SONUÇ: TÜM KAPILAR YEŞİL" (1437 sn) · tekrar-uret-2 0/9 → 1/9 (N-01 PASS) · tekrar-uret 10/10.
- mutasyon: (a) `selected.ordinal===index` geri → D1 FAIL ("geri bildirim: Doğru cevap: …"), D4 FAIL; (b) çip durumu ordinal'e geri → D1 FAIL ("çiplerden hiçbiri yanlış işaretlenmez").
- evidence: kao2-duzeltme/denetim-2/evidence/D2F-03/KANIT.md
- next: D2F-04

## seq 4 · 2026-10-07 · NOTE · D2F-03
- başlık: D2F-03 commit'inden (`cd614eb6`) sonra bulunan kardeş kusur — "Kelime dizme" görevi bazen çözülmüş sırayla açılır.
- oturum: https://claude.ai/code/session_018WK6EKGxUJbKAaNFboTVpv
- bulgu: `gramOrderRecipe` (`app/core/quranLearn.js:1379`) karıştırmadan sonra "zaten sıralı mı" kontrolünü çip kimliğiyle
  (`item.ordinal===index`) yapar. Aynı yazılı çipler yer değişmiş gelirse kimlikler sıralı görünmez, kaydırma yapılmaz; ama
  ekrandaki yazı dizisi tam cevaptır → kullanıcı soldan sağa dokunarak "Doğru" alır.
- ölçüm (bu oturum, scratchpad betiği, kaynak/test): 18 dizme şablonu × 2000 tohum = 36000 görev; çözülmüş görünen 22,
  hepsi `g:g16:g16-k2` (≈%1,1 bu kartta, diğer 17 şablonda 0). D2F-03 testleri (D1–D4) bunu kapsamıyor.
- önerilen düzeltme: 1379'daki kontrolü yazı dizisine çevir (`kaoOrderLabels` ile karşılaştır); test: 18 şablonun tüm
  tohumlarında gösterilen yazı dizisi hiçbir zaman doğru diziye eşit değil. Dosyalar: `app/core/quranLearn.js`,
  `tests/kao/test_kao2_grammar_tasks.js`. FSRS/`kaoBuildQueue` değişmez.
- durum: kod bu oturumda değiştirilmedi (ORTAK-KURALLAR §3); yeni prompt gerekir (ayrı ek prompt ya da D2F-04'e ekleme —
  kullanıcı kararı bekleniyor).
- next: D2F-04
