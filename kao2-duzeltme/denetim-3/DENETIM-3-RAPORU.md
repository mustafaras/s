# Denetim-3 · KAO2-FIX (K2F-00…43) ve denetim-2 (D2F-01…16) bağımsız denetimi

- **Tarih:** 2026-10-07, yerel saat 21:20–23:30 · **Dal:** `main` · **HEAD:** `128ab06d` = `origin/main`
- **Denetçi:** Claude Opus 5.5, salt-okur. Uygulama koduna, testlere, pinlere, `main`'e ve uzak depoya dokunulmadı; commit ve push yok. Yalnız bu klasöre yazıldı.
- **Yöntem:** önceki raporlara, LEDGER'a ve KANIT'lara güvenilmedi. Her iddia kod, test çıktısı, git geçmişi ve canlı bayt karşılaştırmasıyla yeniden ölçüldü. Ham çıktılar olduğu gibi `evidence/` altında.
- **Veri güvenliği:** tarayıcı açılmadı, sunucu kurulmadı, `seyma-data`'ya hiç istek atılmadı, gizli bilgi okunmadı. Ağ erişimi yalnız canlı Pages GET'i ve GitHub API okumasıyla sınırlı kaldı.

---

## 1. Özet karar

**KAPANIŞ KISMEN DOĞRU.**

İlk denetimin dört kritik kusuru kodda gerçekten kapanmış: Ünite 1 kilidi, boş Seviye 0 yolu, tanımsız `kaoS0` ve gramerdeki toplu yanlış eşleme. Bunları, yalnız ekrandaki birincil düğmeye basarak ilerleyen kendi senaryolarımla yeniden doğruladım. Ayrıca:

- canlı yayın yerelle bayt-eşit (65/65),
- veri güvenliği korumaları sağlam,
- yapısal pinler doğru,
- içerik araçları yeniden üretilebilir.

Ancak "kapandı" iddiasını olduğu gibi taşıyamayan noktalar var. İlk beşi:

| # | Bulgu | Ciddiyet |
|---|---|---|
| F-01 | u11.01'deki `g21-k1` gramer görevi "**Aynı kökten** üç kelimeyi eşleştir" diyor, ama her kullanıcıya **üç ayrı kökten** kelime gösteriyor: عَلَّمَ (ʿ-l-m), أَنزَلَ (n-z-l), ٱسْتَغْفَرَ (ġ-f-r). Bu yanlış öğretimdir; belirlenimci ve ana yolda. | **YÜKSEK** |
| F-02 | Kapılar saate bağlı. `test_kao_render.js` her akşam yaklaşık **21:30–23:29** arasında kırmızı veriyor. Zincir: `tests/kao` → kabul A-9 → `kapilar.sh` kırmızı. Denetim anındaki bayraksız tam koşu **KIRMIZI** çıktı. "TÜM KAPILAR YEŞİL" iddiası yalnız bu pencerenin dışında doğru. | **YÜKSEK** |
| F-03 | `kapilar.sh` perf bloğu hatayı geçiriyor: "perf satırı okunamadı" yazıyor ama kapıyı kırmızı saymıyor. Denetim koşusunda gerçekten oldu. | ORTA |
| F-04 | `d2f-sync-check --strict`'in "tam 1 commit" istisnaları prompt'u **sınırsız** muaf tutuyor. `D2F-16:` ya da `D2F-11:` önekli yeni commit'ler kapıdan geçiyor (mutasyonla gösterildi). | ORTA |
| F-05 · F-06 · F-07 | Onay ve uygulayıcı dürüstlüğü: (a) D2F-12'yi (158 L1 kaydı ve u09.01 metni) **Copilot CLI** oturumu uyguladı, ama kayıtlar "devirle Claude kararı" diyor. (b) İnceleme sayfası 133 `[x]` kutusunun yetki devriyle yapay zekâ tarafından işaretlendiğini söylemiyor. (c) `FIX-STATE.releaseApproval` "approved_through_K2F-43" diyor; oysa K2F-43 yayını hiçbir zaman açık onay almadı. | ORTA |

**Bulgu sayısı:** KRİTİK 0 · YÜKSEK 2 · ORTA 8 · DÜŞÜK 9 · toplam 19.

---

## 2. Ölçüm tablosu (bu oturumda koşuldu)

| Komut | Çıktı (özet) | Beklenen | Kanıt |
|---|---|---|---|
| `bash kao2-duzeltme/tools/kapilar.sh` (bayraksız, yerel 21:25–21:46) | **SONUÇ: KIRMIZI KAPI VAR**, exit 1. `tests/kao (55) FAIL: test_kao2_kabul.js test_kao_render.js`. Diğer tüm aileler PASS, tekrar-uret 10/10. "perf satırı okunamadı" (kapı bunu kırmızı saymadı) | YEŞİL | `evidence/01` |
| `test_kao_render.js`, saat sabitlenerek | 00:30–21:00 PASS · **21:30, 22:00, 23:00 FAIL** · 23:30 PASS. Gerçek saat 21:55'te, sabitleme olmadan da FAIL | saatten bağımsız PASS | `evidence/15` |
| `test_kao2_kabul.js` tek başına, bayraksız | exit 1, yalnız **A-9**: "189/190 dosya … KIRMIZI: tests/kao/test_kao_render.js" | PASS | `evidence/16` |
| `test_kao2_perf_budget.js` bayraksız ve bayraklı | ikisi de PASS · içerik 183,837 · çalışma zamanı 117,350 · css 13,035 KiB · p95 ≈8,4 ms | PASS | `evidence/16` |
| Tam `kapilar.sh`: `KAO2_ACCEPT_SLOW_HOST=1`, yalnız render testinin saati öğlene sabit | **TÜM KAPILAR YEŞİL**, exit 0 (ayrıntı §2a) | YEŞİL | `evidence/25` (+ `20`) |
| `fix-sync-check.mjs --repro` | PASS · 44/44 · seq 126 · App.kao* 45 · pin 20261007b | PASS | `02` |
| `d2f-sync-check.mjs --strict --clean --repro` | FAIL (1); tek neden "çalışma ağacı temiz değil" (bu denetimin klasörü ve önceden duran `DENETIM-3-PROMPTU.md`) | — | `03` |
| `d2f-sync-check.mjs --strict --repro` | PASS · 30 commit · 15/15 istisna kullanıldı | PASS | `03b` |
| `denetim-2/tekrar-uret-2.cjs` | **9/9 PASS** | 9/9 | `22` |
| `denetim/tekrar-uret.cjs` | **10/10 PASS** | 10/10 | `23` |
| `kao-plan-check.mjs` + öz-test | PASS (0 warn) · öz-test 41/41 | PASS | `24` |
| `d2f-sync-check --audit-k2f` | 128 commit · 16 tek commit'li / 28 çok commit'li prompt · 2 öneksiz commit · 21 plan dışı pin · 43/44 KANIT'ta "Oturum:" satırı yok · 7 KANIT'ta bölüm eksik | rapor | `13` |
| Bağımsız pin sayımı (ham ve yorumsuz) | App.kao* **45** · yüzey **766** · atama **604** · onclick **393**. Yorum satırlarında pini kaydıran `App.x=` ya da `onclick=` **yok** | 45/766/604/393 | `06` |
| Pin tutarlılığı: index ↔ sw ↔ panel-v2 | 56 ortak dosyada fark 0. `SW_VERSION` = `20261007b`, `SW_OFFLINE_VERSION` = `iip22-20261007b` | eşit | `04` |
| Müfredat aracı iki kez (`--out-dir` ×2) | 7 çıktının 7'si iki üretim arasında bayt-eşit **ve** depodakiyle aynı (`quranCurriculumV2.js`, `MUFREDAT-ESLEME.md` dahil) | eşit | `10` |
| Canlı bayt eşitliği (65 URL) | **65 EŞİT / 0 FARKLI** | eşit | `14` |
| Canlı gizlilik yolları (17 yol) | 17/17 **404** | 404 | `17` |
| Pages run'ları | son 5 run success; `128ab06d` → 37666380654 success | success | `18` |
| `sync.js` Guard 1, davranışsal (kendi harness'im) | localhost / 127.0.0.1 / ::1 / file: / *.local → **0 ağ çağrısı**. Pozitif kontrol (üretim kökeni): 4 çağrı, 2 PUT. PUT gövdelerinde ghToken/openaiKey/syncUrl **yok**. Guard 1'i bozulmuş kopya → FAIL | PASS, mutasyon FAIL | `07` |
| Gramer görevleri: 109 dersin yürüyüşünde gösterilen **tümü** (77) | 75 doğru · **1 yanlış (F-01)** · **1 muğlak (F-11)**. Ders içi birebir tekrar 0. Dizme görevinin "çözülmüş açılması" 0/16 | 0 yanlış | `09*` |
| Bağımsız yolculuk (yalnız birincil düğme, gün ilerleterek) | Seviye 1: `path.units[*].masteryAt` Ünite 1–5'te kayıtlı, Ünite 2…6'ya ilerledi. S0: 12/12 S0 dersi açıldı ve bitti, ardından u01.01'e geçti | kilit yok, S0 dolu | `11` |
| L1/L2 sayımı | 158 kayıt: `sourced` 158 · `by:ai-delegated` 158 · `delegatedBy:owner` 158 · `owner` 0 · `expert` 0. L2 kutuları 12 + 25 = **0/37** | — | `08` |
| Araç mutasyonları ($TMPDIR klonunda) | öneksiz commit → FAIL ✓ · yanlış önekle pin commit'i → FAIL ✓ · STATE'te sahte pin → FAIL ✓ · FIX-STATE'te sahte nextPrompt → FAIL ✓ · **D2F-16 / D2F-11 önekli ek commit → PASS ✗** · `denetim-3:` önekli commit → FAIL | hepsi FAIL | `21` |

### 2a. Bayraklı + saat sabit tam koşu

İki koşu yapıldı:

1. **`evidence/20` — tüm süreçlerde `Date` öğlene sabit:** KIRMIZI. Kırmızı dosyalar: `test_kao2_kabul`, `test_kao_requirements`, `test_map_boundary`, `test_panel_v2_polling_telemetry`, `test_panel_v2_sync_health`. Bu dört dosya gerçek saatle tek tek koşulduğunda **PASS**, dondurulmuş saatle FAIL (aynı dosyanın sonunda). Yani bu kırmızılar benim yöntemimin yan etkisi: dondurulmuş saat geçen süre ölçümlerini bozuyor. Bu koşuda `test_kao_render.js` kırmızı **değil**; öğlen PASS bir kez daha doğrulandı.
2. **`evidence/25` — yalnız `test_kao_render.js` sürecinde saat öğlene sabit, geri kalan her şey gerçek saatte:** **SONUÇ: TÜM KAPILAR YEŞİL**, exit 0. Tüm aileler (kao 55 · app 77 · panel 23 · panel-v2 27 · quran 9), reminders, driver/zikr, kontrast, l2-paket, plan-check, fix-sync ve d2f strict PASS; tekrar-uret 10/10; perf PASS.

**Sonuç:** denetim saatindeki kırmızının tek nedeni F-02. Saat bağımlılığı giderilince programın "tüm kapılar yeşil" iddiası (bayraklı) bu makinede yeniden üretiliyor.

**Perf notu:** bu koşuda steady 6,403 ms > göreli bant 6,360 ms. Bayraksız koşu olsaydı yalnız göreli bant yüzünden kırmızı olabilirdi; aynı test tek başına bayraksız koşulduğunda PASS verdi (`16`). Göreli bant bu makinede sınırda ve oynak.

---

## 3. Prompt-prompt tablo (60 satır)

Sütunlar:
- **Ölçüt:** prompt metnindeki "Kabul" ya da "BİTTİ SAYILIR" satırı.
- **Sağlandı mı:** bugünkü bağımsız ölçüme göre.
- **Kanıt:** commit listesi `evidence/19-prompt-commitleri.txt`'te.

"Tarihsel" ölçüt o günkü bir durumu anlatır (ör. "kapılar o gün yeşildi"); bugün yeniden ölçülemez, yalnız git ve KANIT kaydı vardır.

| Prompt | Ölçüt (özet) | Sağlandı mı | Kanıt / not |
|---|---|---|---|
| K2F-00 | kapılar yeşil · tekrar-uret 0/10 · plan-check 22 FAIL kayıtlı · 5/5 bayt-eşit · temiz ağaç | ÖLÇÜLEMEDİ (tarihsel) | `d19b4576`; KANIT var |
| K2F-01 | plan-check exit 0 · öz-test · kapilar plan-check'i koşar | EVET | `24`; kapilar satırı PASS |
| K2F-02 | view_resolution PASS · R-09 PASS | EVET | tests/kao'da kırmızı değil; tekrar-uret 10/10 |
| K2F-03 | handler_surface PASS · fark yalnız `kaoS0` | EVET | `App.kaoS0` tanımlı (app.js:3905); test PASS |
| K2F-04 | R-10 · test koşusu ağacı kirletmiyor | EVET | iki tam koşudan sonra `git status`'ta yalnız denetim dosyaları |
| K2F-05 | saf masteryPlan · bütçe | EVET | testler PASS; çalışma zamanı 117,35 ≤ 128 KiB |
| K2F-06 | ustalık kaydı · R-01/R-02 · migration | EVET | `11` (masteryAt Ünite 1–5) |
| K2F-07 | onarım / atla / sıradaki adım | EVET | next_step testleri PASS |
| K2F-08 | görünümler, taşlar, uçtan uca | EVET | path/today/milestones PASS; `11` |
| K2F-09 | örnekler dondurma hattından · bayt-eşit · bütçe | EVET | `test_kao_freeze_repro` ve grammar_tasks bölüm A PASS; elle Arapça yok (§4 sonu) |
| K2F-10 | fail-closed doğrulayıcı · R-03 · ders başına ≥6 alıştırma | EVET (ölçüt) | ölçüt sağlanıyor, ama doğrulayıcı F-01'i yakalamıyor |
| K2F-11 | görev örnekten/kavramdan kurulur · ≥60 gramer görevi gösterilir | **KISMEN** | 77 gösteriliyor; **F-01** (g21-k1 yanlış), **F-11** (g17-k2 muğlak) |
| K2F-12 | R-05 · handler listesi boş | EVET | tanımsız başvuru 0 |
| K2F-13 | harfsiz S0 dersleri · bayt-eşit | EVET | S0 testi PASS |
| K2F-14 | 12 ders × 4 aşama · 6–8 alıştırma | EVET | `11`: 12/12 S0 dersi uçtan uca |
| K2F-15 | R-04 · S0 ana yolu | EVET | `11` |
| K2F-16 | R-07 · pinler (44/765/603) | EVET | K2F-30 ile sonra 45/766/604 oldu |
| K2F-17 | kapılar yeşil · 9/10 · ara rapor | ÖLÇÜLEMEDİ (tarihsel) | — |
| K2F-18 | YAYIN-1: onay + canlı bayt-eşit | KISMEN | onay "onaylıyorum" (açık, ama beklenen birebir cümle değil); o günkü canlı eşitlik tarihsel |
| K2F-19 | tutarlılık kapısı + bilinen liste | EVET | coherence PASS |
| K2F-20 | coherence listesi boş · G2 kullanıcı onayı | EVET | LEDGER seq 58: "tüm önerilerini gerçekleştir" |
| K2F-21 | text_review/coherence · sayfa üretildi | EVET | `10` |
| K2F-22 | L1 kutularını **kullanıcı** işaretler · sourced ⇔ işaretli | **KISMEN** | Teknik eşleşme var, ama kutuları kullanıcı değil Claude işaretledi. LEDGER'da GATE kaydı yok (seq 64–65 yalnız PROMPT). Veri D2F-12'de `ai-delegated`'a çekildi; sayfadaki açıklama eksik (**F-06**) |
| K2F-23 | R-08 · lesson_flow | EVET | |
| K2F-24 | Ünite 2 namaz eşlemesi bayt-eşit · eşleşmeyen listesi | EVET | 13 eşleşmeyen kelime listede; `10`, `12` |
| K2F-25 | tanış kartı · a11y | EVET | |
| K2F-26 | reader · A-5 gerçek ölçüm · bütçe küçülür | EVET | kabul testinde A-5 kırmızı değil (tek kırmızı A-9) |
| K2F-27 | tek başlık çubuğu · kontrast | EVET | kontrast PASS |
| K2F-28 | odak modu | EVET | |
| K2F-29 | settings/design_contract/**render** PASS | **KISMEN** | `test_kao_render.js` saate bağlı (**F-02**) |
| K2F-30 | +kaoToggleAutoAdvance · pinler | EVET | 45/766/604 |
| K2F-31 | süre ölçümü | EVET | |
| K2F-32 | İlerleme ekranı | EVET | |
| K2F-33 | kelime detayı | EVET | |
| K2F-34 | yerleştirme şıkları | EVET | YAYIN.md D2F-10'da geriye dönük eklendi |
| K2F-35 | küçük metinler | EVET | 11 commit (süreç sapması) |
| K2F-36 | kabul testi PASS · gerçek değer · mutasyon | **KISMEN** | gece penceresinde A-9 kırmızı (**F-02**) |
| K2F-37 | a11y/design matrisi | EVET | ekran okuyucu kanıtlanmaz (§6) |
| K2F-38 | denetim fixture'ı 10/10 | EVET | |
| K2F-39 | CSS temizliği · kontrast · gzip küçüldü | EVET (kaynak) | önce/sonra ölçümü yeniden yapılmadı; css 13,035 ≤ 14 KiB |
| K2F-40 | K-2 katmanı · dökümler eşit | EVET | |
| K2F-41 | CLAUDE/AGENTS KAO satırları aynı · README envanteri | EVET | KAO, KAO2 ve KAO2-FIX satırları aynı; KAO-FIX satırında tek harf farkı ("bağlı" / "bagli") |
| K2F-42 | hepsi yeşil · kapanış belgesi | KISMEN | belge var; "hepsi yeşil" saate bağlı (**F-02**) |
| K2F-43 | YAYIN-2 kanıtı · completed | **KISMEN** | yayın var (run 37510458831); açık onay hiç alınmadı ve `releaseApproval` bunu yansıtmıyor (**F-07**) |
| D2F-01 | sync PASS · ölçüm · tek commit · temiz ağaç | EVET | `10537d18` |
| D2F-02 | öz-test · plan-check · bayraklı kapilar çıkış 0 | **KISMEN** | öz-test 41/41 ve plan-check PASS; bayraklı kapilar render saati sabitken exit 0 (`25`), gece penceresinde exit 1 (**F-02**); perf bloğu hatayı geçiriyor (**F-03**) |
| D2F-03 | N-01 · 10/10 | EVET | 3 commit (kayıtlı istisna) |
| D2F-04 | N-09 · A-2 · 0/36000 | EVET | `09c`: tekrar 0, çözülmüş açılan 0/16; E3 testi PASS |
| D2F-05 | denetim 10/10 · N-02/03 · iki mutasyon FAIL | EVET | mutasyon betiği depoda yok (**F-14**) |
| D2F-06 | components PASS | EVET | |
| D2F-07 | curriculum PASS · iki üretim aynı · yalnız MUFREDAT değişti | EVET | `10`. Araç ve test de değişti; üretilen içerikte değişen yalnız MUFREDAT |
| D2F-08 | N-05 · envanter testi | EVET | 55 dosya |
| D2F-09 | --strict PASS · 6 mutasyon FAIL · audit sayıları | **KISMEN** | sınırsız muafiyet deliği (**F-04**); mutasyon betiği yok (**F-14**) |
| D2F-10 | N-06/07 · fix-sync PASS | **KISMEN** | `releaseApproval` hâlâ abartılı (**F-07**) |
| D2F-11 | tek commit · GATE waiting · soru soruldu | KISMEN | 2 commit (kayıtlı istisna); soru soruldu |
| D2F-12 | N-04 · testler · iki belge satırı aynı · GATE closed | **KISMEN** | **F-05** (uygulayıcı Copilot) · **F-06** (sayfa açıklaması yok) · **F-09** (u09.01 tarih damgası) · **F-08** (kayıtsız push) |
| D2F-13 | tüm kapılar yeşil · 8/9 · her satır ölçülmüş | **KISMEN** | kapılar saate bağlı (**F-02**); belge sonradan bayatladı (**F-13**) |
| D2F-14 | tek commit · GATE waiting · pin ve main değişmedi | EVET | yerel `main` için doğru; `origin/main` daha önce `3f3b28cd`'ye push edilmişti (**F-08**) |
| D2F-15 | N-08 · 9/9 · main güncel · run | EVET | onay açık cümleyle değil devirle; kayıtta dürüstçe yazıyor |
| D2F-16 | CANLI.md **kullanıcı** çıktısıyla · tek commit | KISMEN | komutu Claude çalıştırdı, 2 commit oldu; canlı eşitliği bu denetim bağımsız doğruladı (65/65) |

**Toplam (60 satır):** EVET 44 · KISMEN 14 · HAYIR 0 · ÖLÇÜLEMEDİ 2.

---

## 4. Bulgular (ciddiyet sırasıyla)

### F-01 · YÜKSEK · `g21-k1` "Aynı kökten üç kelime" görevi üç farklı kök gösteriyor
- **Yer:** `app/core/quranLearn.js:1549-1552` (`gramPatternRecipe`, g21 dalı: `gramMeaningItems(gramRows(record)).slice(0,3)`). Şablon metni: `grammar.verified.json` g21-k1.
- **Yeniden üret:** `node kao2-duzeltme/denetim-3/evidence/grammar-sample.cjs "$PWD" $TMPDIR/g.json` → çıktıdaki #65 (u11.01).
- **Beklenen:** yönerge "Aynı kökten üç kelimeyi anlamlarıyla eşleştir" diyorsa üç kelime aynı kökten gelmeli (ör. aynı satırdaki I. bab ve türemiş bab). Ya da yönerge "Üç türemiş fiili anlamlarıyla eşleştir" olarak değişmeli.
- **Gerçek:** bağlamda عَلَّمَ (ʿ-l-m), أَنزَلَ (n-z-l) ve ٱسْتَغْفَرَ (ġ-f-r) var; üçü ayrı kök. Tarif tablonun ilk üç satırını aldığı için çıktı belirlenimci: u11.01'e gelen her kullanıcı aynı görevi görür. Ayrıca yönerge "eşleştir" diyor ama arayüz tek şıklı seçim.
- **Neden kaçtı:** K2F-10 doğrulayıcısı (`kaoGrammarTaskValid`) yalnız cevabın tablo satırıyla eşleştiğine bakıyor; yönergenin anlamsal iddiasını sınamıyor. Bu, ilk denetimin K4-02 sınıfına (yanlış öğretim) giren bir örnek.
- **Prompt:** K2F-11 (görev kurucu), K2F-10 (güvenlik ağı). Hüküm açık; uzman gerekmez.

### F-02 · YÜKSEK · Kapılar saate bağlı (yaklaşık 21:30–23:29 arası kırmızı)
- **Yer:** `tests/kao/test_kao_render.js:110-111`, `api.kaoHubCardHTML()`'yi saat argümanı vermeden çağırıyor; fonksiyon gerçek `Date`'i kullanıyor. `app/core/quranLearn.js:415-423`'teki `kaoNightWindow`, gece penceresinde hub metnini "Uyumadan önce N kart"a çeviriyor.
- **Yeniden üret:** `evidence/15-test_kao_render-tek.txt` (harness: argümansız `Date`'i sabitleyen ön-yükleme). `D3_HOUR=22:00` → FAIL, `D3_HOUR=12:00` → PASS. Gerçek saat 21:55'te ön-yükleme olmadan da FAIL.
- **Zincir:** render FAIL → `tests/kao` FAIL → kabul A-9 FAIL → `kapilar.sh` exit 1.
- **Karşı kanıt:** saat yalnız bu testin sürecinde öğlene sabitlendiğinde, tam bayraklı koşu kabul dahil **TÜM KAPILAR YEŞİL** veriyor (`evidence/25`). Yani gece kırmızısının tek nedeni bu test.
- **Etki:** D2F-13, DUZELTME-SONUCU ve CURRENT-STATE'teki "bayraklı ve bayraksız TÜM KAPILAR YEŞİL" iddiası günün yalnız belirli saatlerinde doğru. Akşam çalışan bir ajan bunu uygulama kusuru sanıp yanlış yeri "düzeltebilir". Uygulama doğru davranıyor; sorun testin saate bağımlılığı.
- **Prompt:** test KAO2-10 kökenli; K2F-29, K2F-36, K2F-42 ve D2F-13 ölçütlerini etkiliyor. `8e583a93`'teki "A-4 yerel saat" düzeltmesi bu testi kapsamadı.

### F-03 · ORTA · `kapilar.sh` perf bloğu hatayı geçiriyor
- **Yer:** `kao2-duzeltme/tools/kapilar.sh`, sondan bir önceki blok: `if [ -z "$PERF_LINE" ]; then echo "perf satırı okunamadı"`. Bu dalda `FAILED=1` atanmıyor.
- **Gerçekleşti:** `evidence/01` → "perf satırı okunamadı". Bu koşuda kapı zaten başka bir nedenle kırmızıydı; perf tek başına bozulsaydı kapı yeşil derdi.
- **Prompt:** D2F-02 (kapı araçları), K2F-04.

### F-04 · ORTA · `strictExceptions` (kural a) muafiyetleri sınırsız
- **Yer:** `d2f-sync-check.mjs` kural (a) ve `D2F-STATE.json.strictExceptions`.
- **Yeniden üret:** `evidence/21`. Yerel klonda `D2F-16: …` ve `D2F-11: …` önekli ek commit atıldığında araç **PASS** veriyor.
- **Beklenen:** istisna, kayıtlı commit sayısıyla sınırlı olmalı ("2 commit" yazıyorsa üçüncüsü FAIL).
- **Ek:** ilk dokuz istisna kaydının gerekçesinde "yeni ihlal bu listeye eklenemez, yalnız kullanıcı kararıyla" yazıyor; buna rağmen D2F-11, 12, 13 ve 16 kayıtları sonradan eklendi. D2F-16'nınki "yapabildiklerinin hepsini yap" cümlesine dayanıyor; bu açık bir istisna kararı değil.
- **Prompt:** D2F-09.

### F-05 · ORTA · Uygulayıcı yanlış etiketli (Copilot, "Claude kararı" olarak kayıtlı)
- **Kanıt:** LEDGER seq 18–19: `oturum: copilot-cli:4ec68470-d2f12`. `2fe3abf6`, `3f3b28cd`, `d0acd9b4` ve `347884fb` commit'lerinin trailer'ı `Co-authored-by: Copilot`. Aynı kayıtlar "kullanıcı onayı: devir (Claude kararı)" diyor.
- **Neden önemli:** seq 17'deki devir **Claude'a** verilmişti. 158 L1 kaydını ve dinî bağlamlı u09.01 metnini başka bir ajan değiştirdi; kayıt bunu "Claude kararı" diye sunuyor. Bu, devrin kapsamı sorusudur.
- **Prompt:** D2F-12 (ve iki merge commit'i).

### F-06 · ORTA · İnceleme sayfası `[x]` kutularını kimin işaretlediğini söylemiyor
- **Yer:** `docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md`. Satır 22–26'da "133 metin … Bunların hiçbiri senin kutu işaretinle onaylanmadı" yazıyor; aynı sayfanın tablolarında 133 adet `- [x] L1 metin uygun` var. Sayfada "ai-delegated", "devir" ya da "yapay zekâ" ifadesi **yok**.
- **Beklenen:** sayfa, işaretlerin yetki devriyle yapay zekâ tarafından konduğunu açıkça yazmalı. Veri tarafında (`texts.tr.json`) bu zaten dürüstçe yazıyor (`by:"ai-delegated"`).
- **Etki:** okuyan biri `[x]`'i kullanıcı onayı sanabilir. D2F-12'nin "kullanıcı incelemesi gibi gösterilmedi" iddiası veri için doğru, sayfa için kısmen yanlış.
- **Prompt:** D2F-12 ve D2F-07 (sayfa araç çıktısıdır).

### F-07 · ORTA · K2F-43 yayın onayı abartılı kayıtlı
- **Yer:** `kao2-duzeltme/FIX-STATE.json` → `"releaseApproval": "approved_through_K2F-43"`.
- **Gerçek:**
  - LEDGER seq 123: `closed-inferred` — "onay çıkarımla verildi; açık teyit D2F-15'te alınır".
  - D2F-15'teki onay da açık cümleyle değil, devirle verildi (seq 23).
  - LEDGER seq 22'deki "bu yayın K2F-43'teki yayını da açıkça onaylamış olur" koşulu bu yüzden gerçekleşmedi.
  - Sonuç: K2F-43 yayını hiçbir zaman açık kullanıcı onayı almadı.
- **Prompt:** K2F-43, D2F-10, D2F-15.

### F-08 · ORTA · Kayıtsız push ve deploy (YAYIN-3'ten önce)
- **Kanıt:** Pages run 37647239210, head `3f3b28cd` (D2F-12, Copilot oturumu), 2026-10-07 15:50Z, success. LEDGER'da bu push'a dair kayıt yok.
- **Etki:** deploy edilen kümede çalışma zamanı dosyası değişmemiş (`git diff 59abe97b 3f3b28cd`, rsync dışlamalarından sonra boş). İçerik açısından zararsız, ama YAYIN kapısı dışında `main`'e push ve deploy yapılmış.
- **Prompt:** D2F-12.

### F-09 · ORTA · u09.01'in inceleme damgası metinden eski
- **Yer:** `texts.tr.json` → `lessons["u09.01"].review`: `at: "2026-10-02"`, `delegatedAt: "2026-10-02"`.
- **Gerçek:** başlık ve hedef `2fe3abf6` ile 2026-10-07'de yeniden yazıldı; eski "Emir kipi" metninin damgası yeni metne taşındı. D2F-11 planı şunu diyordu: "yeni metin draft başlar; sourced'a D2F-12'de devirle geçer ve bu KANIT'a yazılır". Kayıt ise yeni metnin 2026-10-02'de incelendiğini ima ediyor.
- **Prompt:** D2F-12.

### F-10 · ORTA · KAO2-FIX öncesinden kalan, pini yükseltilmemiş değişiklikler (kapsam dışı, canlıda)
- **Kanıt:** `evidence/05`. Şu dosyalar pinleri değişmeden değişmiş:

  | Dosya | Değişiklik | Pin |
  |---|---|---|
  | `app/core/state.js` | KAO-07 migration kancası, 09-24 | `20260910b` |
  | `app/core/zikir.js` | 09-20 | `20260915a` |
  | `app/core/skyFx.js` | SKY-03…09 | `20260909a` |
  | `panel/panelCoverageManifest.js` | KAO2-25, 09-30 | `20260926a` |

- **Etki:** CLAUDE.md kural 5 ihlali. HTTP önbelleği ve önceden kurulmuş çevrimdışı paket eski sürümü sunabilir. Pages max-age kısa olduğu için risk düşük-orta. Önceki iki denetim bunu yakalamadı.
- **Prompt:** iki programın kapsamı dışında; bilgi için.

### F-11 · DÜŞÜK · `g17-k2` "Bu emir kime söylenmiş?" şıkları muğlak
- Görev #54 (u09.01): uyaran ٱعْبُدُوا۟; şıklar "siz (söz)", "sen", "sen (dua)", "siz (kulluk)". Kişiyi doğru tanıyan öğrenci iki "siz" şıkkı arasında ancak anlama bakarak seçim yapabiliyor; soru kişiyi değil anlamı sınıyor. Prompt: K2F-11.

### F-12 · DÜŞÜK · 12 ünitenin `why` metni `whyReview: draft`
- `texts.tr.json`'da ünite 1–12'nin `why` metni draft. "draft 0" sayımı bu alt düzeyi saymıyor. `why` çalışma zamanı modülüne giriyor ama hiçbir görünümde okunmuyor, bu yüzden kullanıcı etkisi yok. Prompt: K2F-21/22.

### F-13 · DÜŞÜK · Bayat ve çelişkili belgeler
- `denetim-2/CURRENT-STATE.md:12-13` "Program kapanmadı: D2F-14…16 pending" diyor; iki satır aşağıda "PROGRAM KAPANDI" yazıyor. Silinmiş `ORTAK-KURALLAR §9/§10`'a bağlantılar da duruyor.
- `DUZELTME-SONUCU.md`: §1'de "14/14 istisna" ve `SW_VERSION 20261007a`, §2'de "13 kayıt" yazıyor. Gerçek: 15 istisna, pin `20261007b`.
- CLAUDE.md'nin KAO satırı "içerik gzip 159,9 KB > 130 KB" için "açık karar" diyor. Karar KAO2 ve K2F-09'da kullanıcı alıntılarıyla verildi (toplam ≤256 KiB); artık açık değil.
- `DEVIR-LISTESI.md` §3 eşlenmeyen kelimeler için "uygulamada 'açık' görünürler" diyor. Gerçekte kapalı (•••) başlıyorlar ve dokununca açılıyorlar (`evidence/12`).

### F-14 · DÜŞÜK · D2F-05 ve D2F-09 mutasyon kanıtları depoda değil
- D2F-09 KANIT'ı "sahte git geçmişiyle mutasyon harness'i (scratchpad)" diyor. Betik commit edilmediği için "6 mutasyon FAIL" iddiası yeniden üretilemiyor. Bu denetim 5 mutasyonla kısmen yeniden üretti (`21`).

### F-15 · DÜŞÜK · K2F KANIT eksikleri
- `--audit-k2f`'e göre 44 KANIT'ın 43'ünde "Oturum:" satırı yok, 7'sinde 8 bölümden eksik var. Bu durum yalnız raporlanıyor; kapı değil.

### F-16 · DÜŞÜK · Okuyucu alt paneli `role="dialog"` taşıyor ama dialog gibi davranmıyor
- `app/core/quranLearn.js`'teki okuyucu "Kelime anlamı" panelinde `aria-modal`, odak taşıma ve Escape yok. Modal olmayan bir satır içi panel için `role="region"` + `aria-live` daha doğru olur. Ekran okuyucuda doğrulanmadı.

### F-17 · DÜŞÜK · D2F-16 ölçütü birebir sağlanmadı
- Ölçüt "CANLI.md kullanıcı çıktısıyla · tek commit". Komutu Claude çalıştırdı ve 2 commit oldu; kayıtta dürüstçe yazıyor. Canlı eşitliği bu denetim bağımsız doğruladı.

### F-18 · DÜŞÜK · `8bf8f658` süreç dışı, ama tutma kararı doğru
- **Süreç sapmaları:** commit öneksiz, "ara durum; tam test koşusu sürüyor" notuyla testlerden önce atılmış ve plan dışı pin `20261006c` taşıyor.
- **İçerik:** gerçek düzeltmeler — alt çubuk etiketi, Arapça sekmesi, Raşit kartları, panel-v2 dar ekran.
- **Değiştirdiği testler:** 6 test, yalnız pin dizgisi.
- **Görsel QA betikleri:** 127.0.0.1:9000, boş profil, token ve forceSync yok kuralına uyuyor.
- **Hüküm:** "tutuldu" kararı doğru; geri almak canlıdaki düzeltmeleri siler.

### F-19 · DÜŞÜK · Depo public: gizlilik yolları Pages'te 404, GitHub'da okunur
- Pages'te 17/17 yol 404 dönüyor; rsync dışlamaları çalışıyor. Ancak `mustafaras/s` **public** olduğu için `raw.githubusercontent.com/…/texts.tr.json` 200 dönüyor. Kişisel veri yok, yalnız plan, denetim ve içerik dosyaları. Bu bir gizlilik ihlali değil, kapsam kararı (CLAUDE.md: "Repo public olduğu için push kararı kullanıcınındır").

### Doğrulanan konular (bulgu yok)
- **Elle Arapça yok:** `07802fa6..HEAD` farklarında çalışma zamanı koduna eklenen Arapça dizgiler yalnız regex karakter sınıfları (`/[؀-ۿ]/` ve normalleştirme). İçerik modülleri araç çıktısıyla bayt-eşit (`10`).
- **Veri güvenliği:**
  - `sync.js` iki programda da değişmedi (yalnız pin).
  - Guard 1 davranışsal sınamada PASS ve mutasyonu yakalıyor (`07`).
  - Guard 2 (`test_sync_large_file.js` adım 3–4) ve Faz-10 merge testleri tests/app'te PASS.
  - Hiçbir düzeltme `seyma-data`'ya yeni yazma yolu açmadı: `quranLearn*` dosyalarında `fetch`, `localStorage` ya da GitHub çağrısı yok.
- **migrate():** `test_kao2_migration`, `test_kao_migration` ve tests/app 77/77 PASS. Kanıt test düzeyindedir.
- **Dört kritik kusur kapalı:** ustalık kaydı, kilit ve S0 yolu `11`'de; `kaoS0`'ın tanımlı olduğu ve tanımsız başvuru kalmadığı `06`'da. Gramer yanlış eşlemesi %58'den bu örneklemde 1/77 yanlışa (F-01) ve 1/77 muğlak göreve indi.
- **Ses dürüstlüğü:** ses yokken, sessiz saatte ya da ses yüklenemediğinde görünür bir not çıkıyor ("Bu cihazda ses kapalı…", "Ses yüklenemedi…"); düğme sahte başarı göstermiyor (kaynak okuması).
- **Namaz ekranı:** 94 kelime düğmesinin 94'ü dokununca açılıyor ve tekrara ekleniyor; sessiz no-op yok (`12`).
- **L2:** 0/37; hiçbir yerde `expert` düzeyi yok ve "uzman onaylı" iddiası bulunamadı.

---

## 5. Önceki raporların yanlış veya abartılı iddiaları

| İddia | Yer | Gerçek |
|---|---|---|
| "bayraklı ve bayraksız TÜM KAPILAR YEŞİL" | D2F-13, DUZELTME-SONUCU §1, CURRENT-STATE "Canlı gerçekler" | Saate bağlı; 21:30–23:29 arası kırmızı (F-02) |
| `releaseApproval: approved_through_K2F-43` | FIX-STATE.json | Onay çıkarımla; açık onay hiç alınmadı (F-07) |
| "bu yayın K2F-43'teki yayını da açıkça onaylamış olur" | LEDGER seq 22 | D2F-15'teki onay açık cümle değil, devir (F-07) |
| D2F-12 "devirle Claude kararı" | LEDGER seq 18–19, CURRENT-STATE | Uygulayan Copilot CLI oturumu (F-05) |
| "kullanıcı incelemesi gibi gösterilmedi" | D2F-12, CURRENT-STATE | Veride doğru; INCELEME-17 sayfasında açıklama yok (F-06) |
| "158 sourced · draft 0" | CURRENT-STATE | Sayı doğru, ama 12 ünitenin `whyReview`'u draft (F-12; kullanıcıya görünmüyor) |
| "14/14 istisna", "13 kayıt", `SW_VERSION 20261007a` | DUZELTME-SONUCU | 15 istisna, pin 20261007b (F-13) |
| "yeni ihlal bu listeye eklenemez" | strictExceptions gerekçeleri | Dört kayıt sonradan eklendi; muafiyet sınırsız (F-04) |
| "Program kapanmadı: D2F-14…16 pending" | denetim-2 CURRENT-STATE:12 | Bayat; program kapalı (F-13) |
| "6 mutasyon FAIL" | D2F-09 | Betik depoda yok; yeniden üretilemez (F-14) |
| KAO "130 KB açık karar" | CLAUDE.md | Karar KAO2 ve K2F-09'da verildi (F-13) |

**Doğru çıkan önceki iddialar:**
- canlı bayt eşitliği (önceden 20/20; bu denetimde 65/65),
- tekrar üretimler 9/9 ve 10/10,
- pinler 45/766/604/393,
- araçların bayt eşitliği,
- L1 kayıtlarının `ai-delegated` etiketi (158) ve L2'nin 0/37 olması,
- `8bf8f658` içeriğinin zararsızlığı,
- K2F süreç sayıları (128 commit · 16/28 · 21 plan dışı pin).

---

## 6. Doğrulanamayanlar ve neden

| Konu | Neden |
|---|---|
| Cihaz kabulü A-11/A-12 | Gerçek cihaz ve kullanıcı gerekir; headless sınama bu kanıtı üretmez |
| Ekran okuyucu (VoiceOver/TalkBack) | Headless fixture yalnız işaretlemeyi ve rol/etiket sözleşmesini sınar; gerçek okuma sırasını ve telaffuzu kanıtlamaz |
| L2 dinî bağlam doğruluğu (37 satır) ve 13 namaz kelimesinin eşlemesi | Alan uzmanı gerekir; denetçi hüküm vermez |
| Gramer görevlerindeki Arapça çevirilerin incelikleri (ör. #46 4:17'de "kâne" çevirisi, #52 2:6 parça çevirisi) | Kabul edilebilir buldum; ince tefsir/meal tercihi için **uzman gerekir** |
| Hece sesi K-3 | Kayıt yok; kaynağa göre araç kademe B ile çalışıyor |
| K2F-00 ve K2F-17'nin o günkü kapı durumu | Tarihsel; yalnız git ve KANIT kaydı var |
| Gerçek tarayıcıda Guard 1 | Kural gereği tarayıcı açılmadı; davranış node harness'iyle sınandı |
| F-10'un, çevrimdışı paketi kurulu cihazlardaki etkisi | Cihaz gerekir |

---

## 7. Önerilen düzeltme sırası (uygulama yok, yalnız öneri)

1. **F-01:** g21 tarifini düzelt. Yönerge "Aynı kökten" olarak kalacaksa, kelimeler aynı satırdan seçilmeli: I. bab + türemiş bab (+ varsa üçüncü biçim). Kalmayacaksa yönerge "Üç türemiş fiili anlamlarıyla eşleştir" olmalı; metin araç girdisinden gelmeli, elle Arapça yazılmamalı. Ayrıca `kaoGrammarTaskValid`'e "aynı kök" iddiası için kök eşitliği kuralı eklenmeli, bir mutasyon testiyle birlikte.
2. **F-02:** `test_kao_render.js`, `kaoHubCardHTML(now)`'u sabit bir saatle çağırmalı (ya da harness `Date`'i sabitlemeli). Böylece kabul A-9 ve `kapilar.sh` saatten bağımsız olur. Ardından "kapılar yeşil" iddiaları yeniden ölçülmeli.
3. **F-03:** `kapilar.sh` perf satırı bulunmazsa `FAILED=1` atamalı.
4. **F-04:** istisnalar commit sayısına (ya da hash listesine) bağlanmalı; sayı aşılırsa FAIL. Mutasyon betiği de depoya alınmalı (F-14).
5. **F-05, F-06, F-07, F-09 — kayıt düzeltmeleri:**
   - `releaseApproval` → `inferred_K2F-43 + ai-delegated_YAYIN-3`.
   - LEDGER'a D2F-12'yi Copilot'un uyguladığını belirten bir not.
   - INCELEME-17'ye araç çıktısı olarak şu satır: "L1 işaretleri yetki devriyle yapay zekâ tarafından kondu (2026-10-02)".
   - u09.01 için `review.at` = 2026-10-07.
6. **F-08:** LEDGER'a `3f3b28cd` push/deploy kaydı eklenmeli.
7. **F-10:** `state.js`, `zikir.js`, `skyFx.js` ve `panelCoverageManifest.js` pinleri bir sonraki onaylı yayında yükseltilmeli.
8. **F-11, F-12, F-13, F-15, F-16:** küçük içerik, belge ve a11y düzeltmeleri.
9. **Bu raporu commit ederken:** önek önemli. `d2f-sync-check --strict`, öneksiz ya da `denetim-3:` önekli bir commit'i **FAIL** sayar ve `kapilar.sh`'ı kırmızıya çevirir (mutasyonla gösterildi, `21`). Yeni program öneki aracın tanıdığı listeye eklenmeli ya da kayıtlı bir istisna olmalı.

---

## 8. Kanıt düzeyi tablosu

| Konu | Kaynak/test | Yayın (git/run) | Canlı bayt eşitliği | Cihaz |
|---|---|---|---|---|
| Ustalık kaydı / Ünite 1 kilidi | ✓ (`11`, testler) | ✓ | ✓ (65/65) | — |
| Seviye 0 ana yolu + `kaoS0` | ✓ | ✓ | ✓ | — |
| Gramer doğruluğu | kısmen ✓ (1 yanlış, 1 muğlak) | ✓ | ✓ | — |
| Ders içi tekrar / dizme çipleri | ✓ | ✓ | ✓ | — |
| Pin tutarlılığı | ✓ | ✓ | ✓ | — |
| Gizlilik yolları | — | ✓ (rsync) | ✓ 404 | — |
| Guard 1/2, sanitize | ✓ (davranışsal + fixture) | ✓ (değişmedi) | ✓ (sync.js eşit) | — |
| Kapıların yeşil olması | ✗ saate bağlı | — | — | — |
| L1 kaynağı (`ai-delegated`) | ✓ veri · ✗ sayfa açıklaması | ✓ | — | — |
| L2 | 0/37 (doğru biçimde açık) | — | — | uzman gerekir |
| Erişilebilirlik | ✓ kontrast, 44px kuralları, reduced-motion, modal fixture | — | — | ekran okuyucu yok |
| A-11/A-12 | — | — | — | kullanıcıda |

---

## Depo durumu (denetim sonu)

Bu denetim yalnız `kao2-duzeltme/denetim-3/` klasörünü ekledi. `DENETIM-3-PROMPTU.md` denetimden önce de izlenmeyen bir dosyaydı (`evidence/00-git-status-oncesi.txt`). Son `git status --porcelain` çıktısı:

```
$ git status --porcelain
?? kao2-duzeltme/denetim-2/DENETIM-3-PROMPTU.md
?? kao2-duzeltme/denetim-3/
$ git status -sb
## main...origin/main
```

İzlenen hiçbir dosya değişmedi. HEAD `128ab06d`, `origin/main` ile aynı. Geçici klon ve harness'ler yalnız `$TMPDIR/d3/` altında; harness kopyaları `evidence/` içinde (`guard1-harness.cjs`, `grammar-sample.cjs`, `journey.cjs`, `fixdate*.cjs`).
