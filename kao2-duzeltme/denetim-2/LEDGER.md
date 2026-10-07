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

## seq 5 · 2026-10-07 · NOTE · D2F-03
- başlık: seq 4 NOT'unun yeri — kullanıcı kararı: D2F-04'e eklenir.
- oturum: https://claude.ai/code/session_018WK6EKGxUJbKAaNFboTVpv
- kullanıcı cevabı (birebir): "04 e eklensin"
- değişen: DUZELTME-PROMPTLARI.md Prompt 4'e adım 4 (dizme "zaten sıralı" kontrolü yazıya dayansın; test 18 şablon × ≥2000 tohum),
  commit konusu ve BİTTİ ölçütü genişletildi. Dokunulacak dosyalar aynı (`app/core/quranLearn.js`, `tests/kao/test_kao2_grammar_tasks.js`).
- kod değişmedi.
- next: D2F-04

## seq 6 · 2026-10-07 · PROMPT · D2F-04
- başlık: Aynı derste aynı gramer sorusu bir kez (D2-09) + "Kelime dizme" çözülmüş açılmaz (seq 4 NOT, seq 5 kararıyla eklendi).
- oturum: https://claude.ai/code/session_01FSbk3dCn8vUh1pAKQR11qA
- dal: `claude/cool-bardeen-6k6fgo` (`36015f08` → `6b6cf333` ff-only, sonra bu commit).
- değişen: `app/core/quranLearn.js` (yeni `kaoGrammarTaskSignature`; `kaoLessonSafePlan` ders içi tekrar soruyu K2F-10 ikame yoluyla
  kelime alıştırmasına çevirir; `gramOrderRecipe` "zaten çözülmüş" kontrolü `kaoOrderLabels` yazı dizisiyle) ·
  `tests/kao/test_kao2_grammar_tasks.js` (bölüm E: E1–E3, 31 → 34; B3 bilerek uyarlandı — gerekçe KANIT).
- dokunulmadı: `quranLearnFlow.js`, FSRS, `kaoBuildQueue`, `kaoGrammarTaskValid`, `app.js`, pinler/sw.
- ölçüm: gösterilen gramer 78 → 77 (ikame 1 = çift sayısı) · ders içi tekrar 1 → 0 · alıştırma sayıları aynı · dizme çözülmüş açılış
  21/36000 → 0/36000 (yalnız g16-k2'nin 21 görevi değişti).
- kapılar: bayraklı kapilar.sh çıkış 0 "SONUÇ: TÜM KAPILAR YEŞİL" (21 dk 57 sn) · tekrar-uret-2 1/9 → 2/9 (N-09 PASS) · tekrar-uret 10/10 · kabul A-2 PASS.
- mutasyon: (a) tekrar kontrolü kapalı → E1 FAIL; (b) dizme kontrolü kimliğe geri → E3 FAIL `{"g:g16:g16-k2":21}`.
- kapsam dışı (önerildi, dokunulmadı): parça dizmesi (`kaoBuildFragmentTask`) çözülmüş açılış kontrolü yok — `s:95:4:1` 5/500.
- evidence: kao2-duzeltme/denetim-2/evidence/D2F-04/KANIT.md
- next: D2F-05

## seq 7 · 2026-10-07 · GATE · D2F-04
- başlık: Tek seferlik erken yayın — kullanıcı, ortam değişikliği nedeniyle yayın kuralını bir kereliğine değiştirdi.
- oturum: https://claude.ai/code/session_01FSbk3dCn8vUh1pAKQR11qA
- status: closed (yalnız bu yayın için)
- kullanıcı cevabı (birebir): "programı tek seferlik değiştirelim ortam değiştireceğiz buyuzden tumu push commit ve merge ve deploy yapılmalı"
- önceki istek (reddedilmişti, §6/§7): "tümünü canlıya al ve vs code içinde devam edeceğim şekilde …" — bu cevapla birlikte açık yönerge oldu.
- uygulanan: pin `20261006e` → `20261007a` (index.html, sw.js, panel-v2.html — `app/styles.css` dahil, N-08 kapsamı —, pin taşıyan 12 test);
  FIX-STATE/D2F-STATE `pins.release`; ORTAK-KURALLAR §9 (istisna kaydı). Kod değişmedi.
- DOĞRU DURUM: program **kapanmadı** — D2F-05…16 `pending`, N-02…N-08 açık; yayında olanlar: D2F-01…04 (dizme çip yazısı, ders içi aynı
  gramer sorusu, çözülmüş açılmayan dizme, kapı araçları). Canlı bayt eşitliği ve cihaz doğrulaması kullanıcıda.
- next: D2F-05

## seq 8 · 2026-10-07 · PROMPT · D2F-05
- başlık: Denetim kontrollerini güçlendir — R-01 gerçek ustalık geçişini, R-10 girintili koşulsuz yazımı yakalar (D2-02, D2-03).
- oturum: https://claude.ai/code/session_d0d6d6d9-c277-497f-98ea-e3c237d4db72
- dal: `d2f-05` (D2F-04 commit'i `59abe97b` üzerinde; baseCommit `cbe0d604`).
- değişen: `tests/kao/test_kao2_denetim.js` (import +`playLesson`; R-01 gerçek `walkLesson`+`kaoLesson('finish')`+`playLesson`,
  elle `st.at/st.phase` yok, doğru→`masteryAt` dolu/skor≥0,8/`next-unit`, yanlış→`masteryAt` boş/`repair`; R-10 girintiden
  bağımsız yazım + `KAO2_EVIDENCE_OUT` koşul denetimi) · `tekrar-uret-2.cjs` (N-03 aynı kalıp) · `denetim/tekrar-uret.cjs`
  (yalnız başa yorum). Dokunulmadı: `app.js`, `app/core/*`, pinler/sw, `test_kao2_kabul.js`.
- test: `test_kao2_denetim.js` **10/10 PASS** (çıkış 0) · `tekrar-uret-2.cjs` **5/9 PASS** (N-01, N-02, N-03, N-08, N-09;
  D2F-04'te 2/9 idi — azalmadı) · `tekrar-uret.cjs` 10/10.
- mutasyon (scratchpad, commit edilmedi): (a) `quranLearn.js` `masteryAt` yazımı kapatıldı → R-01 FAIL
  (`doğru: masteryAt=false skor=1 adım=mastery`); (b) `test_kao2_kabul.js`'e girintili koşulsuz A-KABUL.md yazımı → R-10 FAIL
  (`2 kanıt yazımı · koşulsuz=1`).
- kapılar (bayraklı kapilar.sh): **çıkış 1, "SONUÇ: KIRMIZI KAPI VAR"** — iki kırmızı da ortam kaynaklı ve prompt kapsamı dışı:
  `test_kao2_kabul.js` A-4 (`night-review`; `kaoNightWindow` yerel saat, bu makine +03 → `TZ=UTC` ile geçiyor) ·
  `test_settings_boundary.js` (ajan ana makinesi kök kontrol-noktası ref'i `625eba07` `git log --all`'ı kirletiyor; `main` atası değil).
  Diğer satırlar yeşil (panel/panel-v2/quran/reminders/driver/zikr/kontrast/l2/plan-check/fix-sync + perf PASS).
- kayıt: `D2F-STATE.json` D2F-05 done · `nextPrompt` D2F-06 · `ledgerLastSeq` 8 · N-02/N-03 `pass` · **N-08 `fail`→`pass`**
  (seq 7 erken yayını panel-v2.html pinini `20261007a` yapıp pin tazeliğini kapattı; `d2f-sync-check --repro` "gerçek pass ama STATE fail" verdi).
  `d2f-sync-check.mjs` (düz + `--repro`) **PASS** (N 5/9 pass).
- evidence: kao2-duzeltme/denetim-2/evidence/D2F-05/KANIT.md
- next: D2F-06
