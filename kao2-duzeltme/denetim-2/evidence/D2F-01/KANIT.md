# D2F-01 · Başlangıç ve ölçüm · KANIT

Oturum: https://claude.ai/code/session_014qMpdeGfsHqM16zgcXbCwT
Tarih: 2026-10-07 · baseCommit `cbe0d604ffb1fcd20168c9214f590771ec878fbc`

## İlerleme günlüğü
1. `git status` temiz. Dal `claude/happy-newton-okecaw` `36015f08`'deydi; `2d260251` HEAD'de **yoktu** ve
   `kao2-duzeltme/denetim-2/` klasörü yoktu. `git fetch` → `2d260251` yalnız `origin/claude/keen-tesla-npy1og`'da;
   dalımız onun katı atasıydı (3 commit geride, 0 ileride). `git merge --ff-only origin/claude/keen-tesla-npy1og` →
   HEAD `cbe0d604` (yalnız denetim-2 belge commit'leri: `fad6f2ae`, `2d260251`, `cbe0d604`). Ağaç temiz.
2. ORTAK-KURALLAR, DENETIM-RAPORU §1/§2/§7, `tools/fix-sync-check.mjs`, `tekrar-uret-2.cjs`, `kapilar.sh` okundu.
3. Kapı koşusu #1 (bayraksız, tam) — 4 beklenmeyen kırmızı (bkz. Sürprizler); ortam düzeltildi, ağaç değişmedi.
4. Kapı koşusu #2 (bayraksız, tam) — beklenen tablo. tekrar-uret-2 ve tekrar-uret koşuldu.
5. Kayıt dosyaları ve `d2f-sync-check.mjs` (kapı koşuları sırasında scratchpad'de hazırlandı, koşu bitince ağaca kondu).

## Yapılan
- `D2F-STATE.json`: program "KAO2-FIX denetim-2", status active, baseCommit `cbe0d604`, nextPrompt D2F-02,
  prompts D2F-01…D2F-16 (title/status/evidence/session), n N-01…N-09 = fail, pins (ölçülmüş), userGates D2F-12/15/16,
  releaseApproval not_approved.
- `tools/d2f-sync-check.mjs` (salt okur, ağsız): STATE yapısı (16 prompt, 9 N, userGates) · prompt sırası/nextPrompt tekliği ·
  done promptun KANIT'ı var ve `Oturum:` satırı taşıyor · CURRENT-STATE `d2f-sync` bloğu ↔ STATE · LEDGER kesintisiz seq,
  biçimi bozuk başlık yok, son seq ve son `- next:` ↔ STATE · pinler koddan ölçülür (App.kao* `fix-sync-check` kalıbı;
  yüzey/atama `test_app_surface_daily_boundary` kalıbı; onclick `test_fx2_touch_coverage` combinedSource kümesi;
  yayın = index.html quranLearn.js pini, `sw.js` SW_VERSION ile eşit olmalı) · `--clean` ağaç temiz · `--repro`
  tekrar-uret-2: STATE pass olan N gerçekten PASS (gerileme), gerçek PASS ama STATE fail ise de hata (güncellenmemiş STATE).
- `LEDGER.md` seq 1, `CURRENT-STATE.md`.

## TDD
Bu prompt yalnız kayıt aracı kurar; üretim kodu değişmedi. Aracın kendisi için negatif sınama (scratchpad kopyasında,
çalışma ağacında değil) — bkz. Ölçümler "d2f-sync-check".

## Kapılar
Koşu #2 (`bash kao2-duzeltme/tools/kapilar.sh`, bayraksız, 2026-10-07T08:25:04Z → 08:39:37Z, real 14m32s), çıktı aynen:
```
== KAO2-FIX kapıları ==
node --check quranLearn.js         PASS
node --check quranLearnFlow.js     PASS
node --check quranLearnViews.js    PASS
node --check quranCurriculumV2.js  PASS
node --check quranGrammarV1.js     PASS
tests/kao (54)                     FAIL: test_kao2_kabul.js test_kao2_perf_budget.js
tests/app (77)                     PASS
tests/panel (23)                   PASS
tests/panel-v2 (27)                PASS
tests/quran (9)                    PASS
reminders smoke                    PASS
run-seyma driver                   PASS
run-seyma zikr                     PASS
kontrast                           PASS
l2-paket --check                   PASS
kao-plan-check                     PASS
fix-sync-check --repro             PASS
== tekrar-uret özeti ==
KAO2 denetim tekrar üretimi: 10/10 PASS · 0 FAIL
== perf ==
perf satırı okunamadı
SONUÇ: KIRMIZI KAPI VAR
EXIT=1
```
Beklenen kırmızılar, ayrı koşuda ilk anlamlı satır:
- `node tests/kao/test_kao2_perf_budget.js` (çıkış 1): `AssertionError [ERR_ASSERTION]: steady p95 10.458 ms exceeds baseline +25% (5.087625000000003 ms)`
- `node tests/kao/test_kao2_kabul.js` (çıkış 1): `AssertionError [ERR_ASSERTION]: A-10 FAIL — bütçe testi kırmızı:` / `steady p95 10.766 ms exceeds baseline +25% (5.087625000000003 ms)`
- "perf satırı okunamadı": perf testi assert ile özet satırından önce düştüğü için (D2F-02'nin konusu).

## Ölçümler
- `node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs` → çıkış 9:
```
FAIL  N-01 (D2-01) · g:g16:g16-k2: aynı görünen sıra → "Doğru cevap: فَإِن · لَّمْ · تَفْعَلُوا۟ · وَلَن · تَفْعَلُو"
FAIL  N-02 (D2-02) · R-01 koşulu (kayıt var mı) masteryAt=null skor=0 iken PASS veriyor
FAIL  N-03 (D2-03) · girintili koşulsuz yazım R-10 kalıbınca YAKALANMIYOR
FAIL  N-04 (D2-04) · CLAUDE.md "L1 … onayı kullanıcıda"=true · veri: {"sourced":158}
FAIL  N-05 (D2-05) · 54 dosya · envanterde olmayan: test_kao_pronunciation_contract.js
FAIL  N-06 (D2-06) · K2F-43 GATE kaydı=false · KANIT.md=false
FAIL  N-07 (D2-07) · "Canlı gerçekler" tarihi 2026-10-03 · "Kalan kapı: K2F-43" · K2F-38 oturum başlatıcısı bekleyen iş · dal satırı dc3f3f06 · CSS payı 0,39 KiB (güncel ≈0,97)
FAIL  N-08 (D2-08) · panel-v2.html styles.css?v=20260811a · styles.css son değişiklik 8bf8f658 pin commit'inden sonra=true
FAIL  N-09 (D2-09) · g:g1:g1-k1 ≡ g:g1:g1-k2

KAO2-FIX denetim-2 tekrar üretimi: 0/9 PASS · 9 FAIL
```
- `node kao2-duzeltme/denetim/tekrar-uret.cjs` → çıkış 0: `KAO2 denetim tekrar üretimi: 10/10 PASS · 0 FAIL`
- Pinler (d2f-sync-check ölçümü): App.kao* 45 · App yüzeyi 766 · atama 604 · onclick 393 · yayın `20261006e` (sw.js SW_VERSION aynı).
- `node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs` → çıkış 0:
  `D2F senkron: PASS · 1/16 prompt done · nextPrompt D2F-02 · ledger seq 1 · N 0/9 pass · App.kao* 45 · yüzey 766 · atama 604 · onclick 393 · pin 20261006e`
  `--repro` ile de aynı satır, çıkış 0. `--clean` commit sonrası koşulur (commit öncesi yeni dosyalar izlenmediği için kırmızıdır).
- d2f-sync-check negatif sınaması (scratchpad'deki depo kopyasında; her biri tek bozulma, sonra geri alındı), hepsi `FAIL`:
  - N-01'i STATE'te `pass` yap + `--repro` → `N-01: STATE pass, gerçek fail (GERİLEME)`
  - `pins.kaoHandlers` 46 → `pins.kaoHandlers 46 ≠ ölçülen 45`
  - CURRENT-STATE `lastSeq: 2` → `CURRENT-STATE lastSeq 2 ≠ STATE 1`
  - LEDGER `- next: D2F-03` → `LEDGER son next D2F-03 ≠ STATE D2F-02`
  - KANIT'tan `Oturum:` satırını sil → `D2F-01: KANIT'ta "Oturum:" satırı yok`
  - izlenmeyen dosya varken `--clean` → `çalışma ağacı temiz değil`

## Bilerek değişen testler
Yok.

## Kanıt düzeyleri
- **kaynak/test:** yukarıdaki tüm koşular bu oturumda, bu konteynerde (yavaş makine; göreli p95 bandı bu yüzden kırmızı).
- **yayın:** bu prompt yayın yapmadı; yayın pini `20261006e` yalnız depodan okundu, canlı doğrulanmadı.
- **cihaz:** yok.

## Sürprizler
1. **HEAD 2d260251'i içermiyordu.** Atanmış dal denetim-2 belgelerinden önceki `36015f08`'deydi. Dal, belgeleri taşıyan
   `origin/claude/keen-tesla-npy1og`'un katı atası olduğu için yalnız hızlı ileri sarıldı (yeniden yazım yok, kendi commit'imiz yoktu).
2. **Konteyner sığ klon + `rsync` yok.** Koşu #1 (08:10:13Z → 08:24:37Z, real 14m24s) beklenenlere ek 4 kırmızı verdi:
   - `test_profile_boundary.js`: `AssertionError [ERR_ASSERTION]: MON-36 commiti bulunamadı`
   - `test_settings_boundary.js`: `Error: Command failed: git show 364de8313398b9254e7afa9c3e8119771c17344b^:app.js`
   - `kao-plan-check`: `FAIL plan-check tabanı d19b4576… bulunamadı`
   - `test_deploy_surface_contract.js`: `✗ gerçek rsync koştu (yürütülebilir kanıt) — status=null`
   Neden: `git rev-parse --is-shallow-repository` → true (53 commit), `which rsync` → yok. Düzeltme yalnız ortamda:
   `git fetch --unshallow origin` (1565 commit) + `apt-get install -y rsync`; çalışma ağacı değişmedi. Koşu #2 temiz tablo verdi.
   Sonraki oturumlar için CURRENT-STATE "Ortam notu"na yazıldı.
