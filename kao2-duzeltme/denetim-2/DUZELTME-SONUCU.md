# KAO2-FIX denetim-2 · Düzeltme sonucu (D2F-13)

Ölçüm tarihi: 2026-10-07 · dal `main` · başlangıç `cbe0d604` · yayın pini `20261007a`.
Bu belgedeki her satır bu oturumda **yeniden ölçüldü**; önceki KANIT'lardan kopyalanmış "kapandı" damgası yoktur.
Kanıt düzeyleri ayrıdır: **K** = kaynak/test (bu oturumda koşturuldu) · **Y** = yayın (git kaydı) · **C** = cihaz (yalnız kullanıcı beyanı).

## 1. Kapılar (bu oturum, K)

| Kapı | Sonuç |
|---|---|
| `KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh` | **TAM, "SONUÇ: TÜM KAPILAR YEŞİL"**, çıkış 0 (tests/kao 55 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · run-seyma driver+zikr · kontrast · l2-paket · plan-check · fix-sync · d2f strict) |
| `bash kao2-duzeltme/tools/kapilar.sh` (bayraksız) | **TAM, "SONUÇ: TÜM KAPILAR YEŞİL"**, çıkış 0; göreli perf de yeşil (p95 5,536 ms · steady 3,693 ms) |
| `tekrar-uret-2.cjs` | **9/9 PASS** (beklenen 8/9'dan **fazla**: N-08 de geçiyor, bkz. D2-08) |
| `tekrar-uret.cjs` | 10/10 PASS |
| `tests/kao/test_kao2_denetim.js` | 10/10 PASS (R-01 gerçek ustalık geçişi, R-10 girintiden bağımsız) |
| `kao-plan-check.mjs` | **PASS (0 warn)**; self-test 41/41. Eski `MediaRecorder`+`save` uyarısı sahte alarm çıktı; kayıt bloğunu denetleyen deterministik kapıya çevrildi (seq 21) |
| `d2f-sync-check.mjs --strict` | PASS · 14/14 kayıtlı istisna (seq 21 NOT commit'i dahil) |
| `perf-ab.cjs` (cari ↔ `git archive 07802fa6`) | best3 **1,098** · p50 1,072 · p95 0,939 (cari p50 3,19 ms / taban 2,97 ms) — denetimdeki 1,111–1,139'dan iyi, bandın içinde |
| `test_kao2_kabul.js` | **A-1…A-10 PASS · P10 PASS**; A-11/A-12 cihazda (ölçülmedi) → [evidence/D2F-13/A-KABUL.md](evidence/D2F-13/A-KABUL.md) |
| Bütçeler | runtime 117,350 KiB ≤ 128 · css 13,035 ≤ 14 · içerik 183,837 ≤ 256 |
| Pinler | `App.kao*` 45 · yüzey 766 · atama 604 · onclick 393 · `SW_VERSION` `20261007a` (`app.js` bu programda dokunulmadı) |

## 2. D2-01…D2-12

| ID | Bulgu | Prompt | Commit | Bu oturumdaki ölçüm | Durum |
|---|---|---|---|---|---|
| D2-01 | Dizme: aynı etiketli çipler yer değişince yanlış sayılıyor | D2F-03 (+D2F-04 ek) | `cd614eb6`, `16d87a77` | N-01 PASS (aynı etiketli çip yer değişince "Doğru"); `test_kao2_grammar_tasks` tests/kao içinde yeşil | **Kapandı (K)** |
| D2-02 | R-01 başarısız ustalıkta da PASS | D2F-05 | `467ab6fa` | N-02 PASS; `test_kao2_denetim` R-01: `masteryAt` dolu + `next-unit` / yanlışta `repair` | **Kapandı (K)** |
| D2-03 | R-10 girintili yazımı kaçırıyor | D2F-05 | `467ab6fa` | N-03 PASS (2 kanıt yazımı, koşulsuz 1 → yakalanıyor); R-10 koşulsuz=0 | **Kapandı (K)** |
| D2-04 | L1 onay kaynağı / belge↔veri çelişkisi | D2F-11→12 | `27f72852`, `2fe3abf6` | Veri: 158 kayıt `sourced/ai-delegated/delegatedBy:owner`, `owner` 0; CLAUDE.md ve AGENTS.md'de "L1 onayı kullanıcıda" 0 | **Kapandı (K)** — kullanıcı onayı değil, **devirle Claude kararı** (LEDGER seq 17–19) |
| D2-05 | `tests/kao/README.md` envanteri eksik | D2F-08 | `e20ee8c3` | N-05 PASS (55 dosya, envanterde olmayan yok); `test_kao2_inventory.js` yeşil | **Kapandı (K)** |
| D2-06 | K2F-43 GATE/KANIT yok; canlı bayt eşitliği doğrulanmadı | D2F-10 (kayıt), D2F-14→16 | `618791e9` | N-06 PASS (GATE kaydı ve KANIT.md var). **Canlı bayt eşitliği ölçülmedi** | **Kayıt kısmı kapandı (K); canlı doğrulama AÇIK** (D2F-16, kullanıcı komutu) |
| D2-07 | Bayat CURRENT-STATE / FIX-STATE / README | D2F-10 | `618791e9` | N-07 PASS (bayat satır yok) | **Kapandı (K)** |
| D2-08 | `panel-v2.html` eski `styles.css` pini | planlı D2F-15; fiilen erken yayın | `59abe97b` | `panel-v2.html` ve `index.html` ikisi de `styles.css?v=20261007a`; N-08 PASS | **Kapandı (K, Y)** — plandan önce, kullanıcının tek seferlik erken yayınıyla (LEDGER seq 7) |
| D2-09 | Aynı derste aynı gramer sorusu | D2F-04 | `16d87a77` | N-09 PASS (tekrar yok) | **Kapandı (K)** |
| D2-10 | u09.01 başlığı içerikle uyuşmuyor | D2F-11→12 | `2fe3abf6` | Başlık "Anmak, yemek, vermek: fiil kökleri"; hedef geçmiş-zaman fiil kartlarıyla uyumlu; `test_kao2_lesson_coherence` yeşil | **Kapandı (K)** — metin devirle yazıldı; review kaydı `ai-delegated`, L2 yok |
| D2-11 | Müfredat eşleme sayfası bayat | D2F-07 | `7ad82a93` | `MUFREDAT-ESLEME.md`: "taslaktır" 0, "Karar bekleyen" 0; durum satırı "133 metin · draft 0 · sourced 133"; `test_kao2_curriculum` yeşil | **Kapandı (K)** |
| D2-12 | Kapsam dışı commit + gevşek plan-check | D2F-02, D2F-10, D2F-13 NOT | `2edc9810`, `618791e9` | Plan-check istisnası tek-hash'e daralmış, genel "K2F-NN ek:" izni yok; `8bf8f658` içeriği (8 fixture) tam kapıda yeşil. **Karar (seq 21): geri alınmadı** — düzeltme içeriyor, yayında; geri alma yayını bozar | **Kapandı (K) kayıtla; kod geri alınmadı.** İstenirse `git revert 8bf8f658` ayrı onayla |
| — | Ses görevi şık ekranı doğrulanamadı | D2F-06 | `79eca899` | `test_kao2_components` yeşil (ses görevi üretilebilir, şık bloğu bayt-eş) | **Kapandı (K)** |
| — | Süreç hataları M-05/M-07/M-12 | D2F-09 | `e36e96ad` | `d2f-sync-check --strict` PASS; `--audit-k2f` geçmişi yalnız raporlar | **Önleme araçla var (K)**; geçmiş ihlaller (28 çok commit'li prompt, 21 plan dışı pin) silinmedi |
| — | Perf göreli bant | D2F-02 | `2edc9810` | Bayraklı ve bayraksız perf yeşil; A/B 1,098 | **Kapandı (K)** |

Programın kendi süreç sapmaları (dürüstlük): D2F-03/04/05/06/08/11/12 birden çok commit'tir, D2F-04 erken yayın kuralı istisnasıyla (ORTAK-KURALLAR §9) yapıldı, D2F-11 kapısı yetki devriyle (§10) kapatıldı. Bunlar `strictExceptions`'ta (13 kayıt) gerekçeleriyle durur.

## 3. Kanıt düzeyleri

- **Kaynak/test (K):** bu belgedeki tüm "kapandı" satırları; yukarıdaki kapılar bu oturumda koşuldu.
- **Yayın (Y):** pin `20261007a`, `main` — yalnız git kaydından (`59abe97b`); **canlıda bayt eşitliği bu oturumda doğrulanmadı.**
- **Cihaz (C):** hiçbiri. A-11/A-12 ölçülmedi.
- **Kullanıcı onayı:** D2-04/D2-10 kararları kullanıcı onayı değil; yazılı devirle Claude kararıdır (seq 17); uygulayıcı Claude değil Copilot CLI oturumudur (seq 18–19, düzeltme notu LEDGER seq 25) (geri alma: `2fe3abf6` revert ya da kullanıcının kendi cevabı).

## 4. Kullanıcıda / uzmanda kalanlar (Claude kapatamaz)

1. **L2 alan uzmanı onayı** — INCELEME-17/18'de 37 satırın L2 kutusu 0/37 işaretli (bu oturumda sayıldı).
2. **13 eşlenmeyen namaz kelimesi** — uzman kararı; tahminle eşleme Arapça kuralına aykırı.
3. **Hece sesi kayıtları (K-3)** — kayıt bekliyor.
4. **Cihaz kabulü (A-11/A-12, K3)** ve **ekran okuyucu turu.**
5. **Canlı bayt eşitliği (D2-06 geri kalanı, D2F-16)** — komutu kullanıcı çalıştırır.
6. D2-12 `8bf8f658` kalıcı geri alınmak istenirse: ayrı ve açık onay (canlı arayüzü değiştirir).
7. D2F-14/15 (yayın özeti, yayın): D2F-15 yayın adımı yalnız kullanıcı kararıyla; erken yayın zaten çıktı.

## 5. Canlı doğrulama (D2F-16, 2026-10-07)

- Pin `20261007b`, `main` = `origin/main` = `b468d9a3`. Pages run **37664767297** success.
- Canlı bayt eşitliği: **20/20 EŞİT, 0 FARKLI** (index.html, sw.js, panel-v2.html ve `?v=` taşıyan 17 dosya). Gizlilik yolları (`kao2-duzeltme/FIX-STATE.json`, `denetim-2/DENETIM-RAPORU.md`, `archive/README.md`, `texts.tr.json`) **4/4 404**.
- Referans perf (bu makine): PASS · content 183,837 KiB · runtime 117,350 KiB · css 13,035 KiB · p95 4,198 ms · steady 2,885 ms.
- Komutu kullanıcı yerine Claude çalıştırdı (devir: LEDGER seq 23). Kanıt düzeyi: kaynak/test ✓ · yayın ✓ · canlı bayt eşitliği ✓ · cihaz —. §4 madde 5 (canlı bayt eşitliği) kapandı; kalan maddeler kullanıcı/uzmandadır.
