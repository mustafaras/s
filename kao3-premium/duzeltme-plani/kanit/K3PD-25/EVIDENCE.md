# K3PD-25 — Onaylı tanıma hedefini uygula ve bütün oranları kapıya bağla

**Durum: KAPANDI · bağımsız hüküm ACCEPTED_DEVIATION (seq147).** Ham genel totalMC sonuçları NOT_MET olarak kalır; kullanıcı yalnız bu iki eski hedefin gate disposition’ını kabul etti. Eski PARTIAL (seq137) bu karardan önceki kapı sözleşmesine aittir ve tarihsel olarak korunur. Seq139 kullanıcı yanıtını, seq147 bağımsız hükmü kaydeder. K3PD-26 başlatılmadı.

## Yetki ve karar

- Başlangıç HEAD: `7e3fc159cf899675e12f084f2fca3d5d1905040f`; dal `k3pd-denetim-duzeltmeleri`.
- K3PD-24 A’nın temel ölçüm sözleşmesi geçerlidir. Seq 139 kullanıcının “evet uyguala kapat ve canlıya al” yanıtıyla seçilen dar gate-disposition ekidir: eski genel `toplamMC≤%60` pay/payda ve ham `NOT_MET` statüsü aynen görünür; yalnız `legacyGeneralFresh` ve `legacyGeneralEstablished` için disposition `ACCEPTED_DEVIATION`, atıf `K3PD-25#recognition-deviation:seq139` olur. Etkin hedef olgun tekrar R1≤%60’tır (`isNew=false`, sabit `s=5/12/40`, A/B birlikte, bütün R1+R2+R3+R4 tekrar word tasks paydası). Bu, genel ölçünün PASS’i değildir.
- Kullanıcı, parser uyumlu exact allowlist düzeltmesi ve K3PD-25 gerekliliklerinin uygulanmasına “tüm gereklilikleri yapabilirsin” diyerek izin verdi. `PROMPTLAR.md` yalnız bu kartın allowlist satırını kapsama ek exact yolları gösterecek şekilde değiştirilmiştir.
- Bu kararla iki eski genel hedef ham `NOT_MET` kalır ve makine çıktısında ayrıca sapma referansı/disposition taşır; yalnız bu iki hedef gate ihlali sayılmaz. Olgun tekrar R1 hedefi hâlâ bağlayıcıdır. Boş görev, eksik ders yürüyüşü, integrity, yinelenen/unknown task veya bozuk şık havuzu her durumda gate’i nonzero yapar; atıfsız ACCEPTED_DEVIATION de reddedilir.
- `app/core/quranLearn.js`, `app/core/quranLearnFlow.js`, `app/core/quranLearnViews.js`, scheduler, FSRS `s/due/reps`, A/B hash’i, grading, UI ve `K3P-STATE.json` değişmedi. Kapsam motor/ölçüm değil, ölçüm sözleşmesi ile izinli test/kanıt düzeltmeleridir.

## Pay/payda sözleşmesi

| Ölçü | Pay | Payda / kohort |
| --- | --- | --- |
| R1/R2/R3/R4 dağılımı | Gerçekte gösterilen ilgili word-task rung ziyaretleri | Aynı kohorttaki bütün word-task ziyaretleri; fresh, established, mixed-repeat ayrı |
| İlk tanış | `isNew=true` word-task ziyaretleri | Aynı kohorttaki bütün word-task ziyaretleri; R1–R4 ile çapraz boyut |
| Eski genel toplamMC hedefi | R1+R2+R4 cevap görevleri | Bütün geçerli cevap-task ziyaretleri; kelime dışı ve `isNew` görevler dahil; fresh ve established ayrı; özgün ≤%60 hedefi seq139 ile gate açısından ACCEPTED_DEVIATION, ham NOT_MET görünür |
| Karma tekrar toplamMC | R1+R2+R4 | Aynı mixed-repeat tekrar word-task ziyaretleri; tanısal, eski genel hedefin yerine geçmez |
| Olgun tekrar R1 hedefi | R1 tekrar word-task ziyaretleri | R1+R2+R3+R4 tekrar word-task ziyaretleri; `isNew=false`, s=5/12/40, A/B birlikte; bağlayıcı ≤%60 |
| Fallback / fırsat | Gerçek rung’ın A/B beklenen rung’ından farklı gösterildiği tekrar | Hem bütün repeat word tasks hem beklenen R3/R4 fırsatları ayrı raporlanır; boş payda N/A/NOT_MEASURED |

R2 eşleme MC’dir ve tabloda ayrıca görünür; R4 cloze MC’dir; çok çipli R3 build üretimdir ve MC payına girmez. İlk tanış görevleri genel MC pay/paydasında kalır. Cevap görevi bir defa sayılır; intro/konsept ekranı cevap görevi sayılmaz.

## Deterministik sayım

Tekrar üretim: `node kao3-premium/araclar/cift-sik.cjs` (insan okunur) ve `node tests/kao/test_k3p_recognition_gate.js` (aynı aracın `--json` çıktısını, exit kodunu ve kesin fixture ölçülerini doğrular). Harness ağsız sentetik VM’dir. Hiçbir onboarding-dakika veya task-latency override’ı yoktur. Varsayılan bütçede `partEnd` oluştuğunda aynı kayıtlı resume işaretçisi üzerinden, ekranda mevcut olan “süre aşımını kabul ederek devam et” eylemiyle aynı planın kalan görevleri tamamlanır; tam örneklemde görev atlanmaz. Eski K3PD-24 varsayılan ziyaretleri ayrı ve açıkça `PARTIAL_BY_DEFAULT_BUDGET_PART_END` olarak tutulur.

| Tam ders kohortu | Geçerli cevap görevleri | Word tasks | İlk tanış | R1 / R2 / R3 / R4 (word-task paydası) | Genel toplamMC | Hedef |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| Fresh | 1087 | 1010 | 1010/1010 (%100) | 912/1010 (%90,30) · 98/1010 (%9,70) · 0 · 0 | 1010/1087 (%92,92) | NOT_MET |
| Established | 1125 | 1031 | 972/1031 (%94,28) | 902/1031 (%87,49) · 123/1031 (%11,93) · 6/1031 (%0,58) · 0 | 1025/1125 (%91,11) | NOT_MET |
| Mixed repeat | 1324 | 1324 | 0/1324 | 648/1324 (%48,94) · 388/1324 (%29,31) · 238/1324 (%17,98) · 50/1324 (%3,78) | 1086/1324 (%82,02), tanısal | Uygulanmaz |

### Tarihsel oranlarla güncel kohortları karıştırmama

K3PD-24/DENETLEYICI’deki tarihsel başlangıç referansı fresh `92,92%`, established `91,57%`, mixed-repeat R1 `48,94%` idi. Fresh/established değerleri eski genel totalMC ölçüsüdür; mixed-repeat R1 farklı ölçüdür. Eski established genel ölçüsünde ayrıca kayıt uyuşmazlığı vardır: DENETLEYICI `91,57%` derken K3P-STATE/LEDGER `1030/1127=%91,39` kaydeder; bu tarihsel fark çözülmemiştir. K3PD-25’in güncel tam ders koşusu fresh `1010/1087=%92,92`, established `1025/1125=%91,11` verdi. K3P-18’de tarihsel mixed-repeat R1 `648/1324=%48,94` olarak kaydedilmiş; güncel tam mixed-repeat koşusu da `648/1324=%48,94` üretti. Bu iki R1 sayımı aynı pay/payda ölçüsünü verir, ancak her biri ayrı tarihsel/current-HEAD kanıtıdır. R1 payı yalnız R1 tekrar kelime görevleri; paydası sabit `s=5/12/40` karma tekrar kohortundaki bütün R1+R2+R3+R4 görevleridir. Hiçbiri fresh/established genel totalMC oranı değildir ve onun yerine geçmez. Her tarihsel genel MC, güncel genel MC ve karma tekrar R1 ölçüsü kendi cohort/pay/payda/HEAD etiketiyle kalır.

Tam kohortların her birinde 109/109 ders `summary`’ye ulaştı. Fresh bir, established bir ve mixed-repeat bir devam sınırı gördü; sırasıyla 3, 22 ve 20 görev kaydedilmiş resume devamında görüldü. Integrity ihlali 0; geçerli görev sayısı sıfır değil; unknown rung, yinelenen task ID, yinelenen şık veya bozuk seçenek havuzu 0.

K3PD-24’te kabul edilmiş varsayılan-bütçe sayımı aynen ayrıca üretildi; bu satırlar tam kohort oranlarıyla karıştırılmamalıdır:

| K3PD-24 varsayılan bütçe anlık görüntüsü | Durum / görevler | R1 / R2 / R3 / R4 | Genel toplamMC |
| --- | --- | --- | ---: |
| Fresh | 109 ders başlatıldı, 108 summary, 1 `partEnd`; 1084 geçerli, 1010 word task | 912 / 98 / 0 / 0 | 1010/1084 (%93,17) NOT_MET |
| Established | 109 başlatıldı, 108 summary, 1 `partEnd`; 1119 geçerli, 1028 word task | 900 / 122 / 6 / 0 | 1022/1119 (%91,33) NOT_MET |
| Mixed repeat | 812 kart, 1316 tekrar word task; 108 summary, 1 `partEnd` | 648 / 403 / 224 / 41 | 1092/1316 (%82,98), tanısal; R1=648/1316 (%49,24) |

Karma **tam** tekrar cohort’unda olgun R1 hedefi **648/1324=%48,94 PASS**. Kol dökümü: A=676 görev (R1/R2/R3/R4=`0/388/238/50`, fallback=265); B=648 görev (`648/0/0/0`, fallback=0). B’nin her görevi R1 olarak kalmıştır.

Fallback tam örneklemi: fresh `0/0`, N/A; established `36/59=%61,02` bütün repeat word task’larda ve `36/36=%100` R3/R4 fırsatlarında (36 beklenen R4’ün 6’sı R3’e, 30’u R2’ye düştü); mixed-repeat `265/1324=%20,02` bütün tekrar görevlerinde ve `265/450=%58,89` fırsatta. Karma fırsat paydası: beklenen R3=226, bunlardan 91’i R2’ye düştü; beklenen R4=224, bunlardan 103’ü R3’e ve 71’i R2’ye düştü.

İzole R3 örneği: 26 A/R3 aday kartından 6 build (%23,08) ve 20 fallback (%76,92); bozuk build/fallback answer pool 0. Şık yinelenmesi fresh/established/mixed `0/0/0`; bozuk answer pool `0/0/0`. Bu kontrollerde sıfır görev veya bozuk havuz PASS değildir.

## Kapı çıktısı ve durum

`node kao3-premium/araclar/cift-sik.cjs --json` stdout’ta tek `schema="k3pd.recognition-gate"`, `schemaVersion=1` JSON belgesi üretir. K3PD-28’in tüketeceği toplu sözleşme `cohorts`, `targets`, `lessonRuns`, `fallback`, `byArm`, `buildCoverage`, `defaultBudgetSnapshot`, yapılandırılmış `approvedDeviation` ve `gate` alanlarını kapsar. Sayım zaman damgası, kelime/kart/ders kimliği veya task ID taşımaz. Makine fixture’ı ham hedef statülerini, seq139 referansını, R1–R4, R2’nin MC oluşunu, isNew paydasını, tam devamı, boş görev havuzlarını, fallback’ı, şema ve strict exit’i kontrol eder.

Tam sayımın ham oranları değişmez: fresh `1010/1087=%92,92 NOT_MET`, established `1025/1125=%91,11 NOT_MET`; olgun tekrar R1 `648/1324=%48,94 PASS`. Seq139 kararı ilk iki oranı görünür `ACCEPTED_DEVIATION` yapar; R1 hedefini etkin bırakır. Integrity ihlali 0 ise `cift-sik.cjs` exit 0 beklenir; integrity/coverage/pool/zero-task hatası veya R1 ihlali nonzero olmalıdır. Sapma kararı hedef tasarımını ya A/B ya da notlamayı değiştirme izni değildir.

Kapanış öncesi state/log/kanıt denetimi: `durum.mjs --check` exit 0; `--sonraki` yalnız K3PD-25’i gösterdi, K3PD-26 çalıştırılmadı; `test_k3pd_control.js` exit 0 (33 negatif kontrol); `git diff --check` exit 0; state’teki 22 exact path ile gerçek card diff 22/22 eşleşti; korunmuş dört dirty file hash’i 4/4 aynı; üretim, scheduler, FSRS, A/B, grading ve legacy state diff 0. State `ready_for_audit`; yeni bağımsız hüküm bekliyor.

## Doğrulama

- `node tests/kao/test_k3p_recognition_gate.js` — exit 0; gerçek CLI ölçüler, şema v1, pay/payda, iki katmanlı varsayılan/tam sayım, A/B, fallback, integrity ve fail-closed synthetic cases.
- G0 — güncel G0 + bütün değişen JS/CJS syntax: **29/29 komut exit 0**; 16 değişen JS dosyası `node --check`, default driver PASS, zikr harness 95/95, durum `--check/--sonraki`, K3PD kontrol fixture’ı PASS, whitespace 0.
- G1 — 19 komut sıralı yürütüldü; ilk batch 18/19 exit 0. Tek ilk başarısızlık perf göreli steady p95 `8.223 ms > 5.0876 ms`; ardından dış workspace’ten çalışan Playwright/Chromium yükü varken izole perf tekrarı p95 `60.815 ms > 40 ms` oldu. O dış sürece dokunulmadı. Sonra yük kalmadığını gözleyip, slow-host/baseline/evidence yazma env’leri unset iken yalnız perf testini tekrar çalıştırdım: **exit 0**, runtime `137.730 KiB`, CSS `15.922 KiB`, content `184.591 KiB`, p95 `4.402 ms`, steady p95 `2.905 ms`. Eşik değişmedi; slow-host istisnası kullanılmadı. Böylece G1’in 19 komutunun her biri en az bir güncel denemede exit 0 verdi; ilk iki kırmızı ölçüm de bu kanıtta tutulur.
- G2 — DENETLEYICI §4’teki 14 doğrudan komutun güncel, sıralı tekrarında **14/14 exit 0**. Lesson flow 30, coherence 9, mastery 45, grammar 39, denetim 10; `test_kao2_kabul.js` A-9 220/220 ve A-10 runtime `137.730≤137.75 KiB`, CSS `15.922≤16 KiB`, content `184.591≤256 KiB`, p95 `5.196≤40 ms`; rhythm5/5; distractors duplicate0; ladder A=522/1000/build32; build14; cloze9 (260 pair × 3 seed, wrong POS0); budget11; resume7; ayah21. Tarihsel distractor seçim sırası karşılaştırması baseline fixture yokluğu nedeniyle UNVERIFIABLE olarak kalır.
- A-10 düzeltmesi: K3PD-22’de kullanıcı onaylı canonical `137.75 KiB` runtime tavanı test_kao2_perf_budget.js assertion’ında zaten vardı; A-10 aggregator ise eski `137 KiB` değerinde kalmıştı. `test_kao2_kabul.js` yalnız bu stale label/assertion’ı 137.75’e hizaladı; perf eşiği değiştirilmedi. `test_kao2_perf_budget.js` içindeki error/help metin typo’ları da aynı onaylı sayıyı gösterir; assertion değişmedi.
- `env -u KAO2_EVIDENCE_OUT -u KAO2_WRITE_BASELINE -u KAO2_ACCEPT_SLOW_HOST node tests/kao/test_kao2_kabul.js` — güncel exit 0. A-9 çocuk aile koşusu PASS 220/220 (KAO 82, app 78, panel 23, panel-v2 27, quran 9, reminders 1). A-10 PASS: runtime 137.730≤137.75 KiB, CSS 15.922≤16, content 184.591≤256, p95 5.517≤40 ms. A-11/A-12 ölçülmedi; cihaz/kullanıcı çalışması olarak bekliyor. Slow-host istisnası kullanılmadı ve baseline/evidence yazma env’leri unset idi.
- `node tests/kao/test_kao2_inventory.js` — G1 içinde exit 0; 84 test + 4 helper/fixture.
- `node tests/kao/test_k3p_distractors.js` exit 0: mevcut çift şık 0 ve çeldirici kontrolleri PASS. Tarihsel seçim kararlılığı fixture’ı `k3p-01-secimler-onceki.json` Git geçmişinde veya çalışma ağacında bulunmadı; o alt karşılaştırma UNVERIFIABLE kaldı, uydurma baseline eklenmedi.

## Kapsam ve sınırlamalar

### Seq 139 kararı sonrası güncel gate

`node kao3-premium/araclar/cift-sik.cjs` — **exit 0 / gate PASS**. Tam 109-ders örneklemi: fresh 1010/1087=%92,92 `NOT_MET/ACCEPTED_DEVIATION`; established 1025/1125=%91,11 `NOT_MET/ACCEPTED_DEVIATION`; olgun mixed-repeat R1 648/1324=%48,94 `PASS`. Sapma referansı `K3PD-25#recognition-deviation:seq139`. B kolu 648/648 R1 kalır; A 676 görevde R1/R2/R3/R4=0/388/238/50. Her cohort 109/109 summary; integrity 0; fallback, duplicate ve bozuk pool sayımları ayrıca basıldı. Ham genel hedefler NOT_MET kalır; disposition onların PASS olduğu anlamına gelmez. Test fixture bu exact raw status/ref, ölçüler, strict integrity ve CLI exit’ini ayrıca kontrol etti.

Değişen exact paths (22): `kao3-premium/araclar/cift-sik.cjs`; `tests/kao/test_k3p_recognition_gate.js`; `tests/kao/test_kao2_components.js`; `tests/kao/test_kao2_curriculum.js`; `tests/kao/test_kao2_feedback.js`; `tests/kao/test_kao2_today.js`; `tests/kao/test_kao2_kabul.js`; `tests/kao/test_kao2_perf_budget.js`; `tests/app/test_app_surface_boot_boundary.js`; `tests/app/test_app_surface_domain_boundary.js`; `tests/app/test_app_surface_lifecycle_boundary.js`; `tests/app/test_app_surface_overlay_boundary.js`; `tests/app/test_header_celestial_timeline.js`; `tests/app/test_header_night_contrast.js`; `tests/app/test_iip_09.js`; `tests/app/test_v3_welcome.js`; `tests/kao/README.md`; `kao3-premium/duzeltme-plani/PROMPTLAR.md`; `kao3-premium/duzeltme-plani/DURUM.json`; `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`; `kao3-premium/duzeltme-plani/KAYIT.md`; `kao3-premium/duzeltme-plani/kanit/K3PD-25/EVIDENCE.md`. PROMPTLAR’daki 26 exact yol yetki allowlist’idir; dört test yolu izinli kaldı fakat değiştirilmedi. Değişen yolların tamamı izin listesinde. Üretim/scheduler/UI/FSRS/A-B/grading/pin diff’i 0. Önceden kirli `KAPANIS.md`, README ve görsel kanıt dosyaları bu kart dışında bırakıldı.

Örneklemler sentetik VM kohortlarıdır; gerçek kullanıcı davranışı, bilimsel kalıcılık/retention veya nedensel öğrenme etkisi çıkarımı değildir. Genel ≤%60 oranları iki kohortta NOT_MET kalır; bu karar onları PASS diye yeniden etiketlemez. Bağımsız hüküm `ACCEPTED_DEVIATION` yalnız seq139’da belirtilen iki eski genel hedef için geçerlidir. Tarihsel distractor seçim sırası karşılaştırması baseline yokluğundan UNVERIFIABLE’dir. Cihaz/öğrenme çalışmaları ayrı pending’dir. `releaseApproval=NOT_APPROVED`; bu karta dayalı live runtime değişikliği yoktur. K3PD-26 yalnız adaydır ve burada başlatılmaz.


## Bilimsel yorum ve sonraki ölçüm gereği

Bu kartın R1–R4 payları ve toplamMC oranı **görev bileşimi göstergeleridir**. Sentetik VM sayımı görev seçimini ve kapı davranışını denetler; gerçek öğrencide öğrenme, gecikmeli kalıcılık, aktarım veya bir görev biçiminin üstünlüğünü ölçmez. Bu nedenle %60 eşiği bu kanıttan “bilimsel optimum” diye gerekçelendirilemez. A/B ve notlama bu kartta sabit kalır; kabul edilecek sapma da özgün genel oranı PASS yapmaz.

Birincil çalışmaların kapsamı:

| Kaynak | Doğrudan bulgu | Buradaki sınırı |
| --- | --- | --- |
| Karpicke & Roediger (2008), *Science*, [DOI](https://doi.org/10.1126/science.1152408) | Yabancı dil kelime öğreniminde, doğru üretimden sonra tekrar test etme gecikmeli hatırlamayı artırdı; yalnız tekrar çalışma aynı etkiyi göstermedi. | Bu sonuç görevlerin %60'tan az MC olması gerektiğini, bu uygulamanın etkisini veya K3P A/B farkını ölçmez. |
| Butler (2010), *Journal of Experimental Psychology: Learning, Memory, and Cognition*, [DOI](https://doi.org/10.1037/a0019902) | Dört deneyde tekrar test etme, bir hafta sonraki hatırlama ve bazı yeni çıkarım sorularındaki aktarımda tekrar çalışmadan üstündü. | İçerik düzyazıydı; mevcut A/B görev dağılımı ve bu ürün için etki tahmini değildir. |
| van Wijk et al. (2024), *BMC Medical Education*, [DOI](https://doi.org/10.1186/s12909-024-06538-0) | Küçük, ders-bağlamlı randomize çapraz çalışmada (n=45; geri bildirim yok) çok kısa yanıt ve çoktan seçmeli alıştırma biçimleri arasında son testte anlamlı fark bulunmadı. | Örneklem ve bağlam dardır; “biçimler eşdeğerdir” veya başka içeriklerde üstünlük yoktur kanıtı değildir. |

Bir öğrenme iddiası için ayrı, önkayıtlı insan çalışması gerekir: hedef lemmalar ve maruziyet/geri bildirim/aralıklar kollarda eşlenmeli; görev biçimi karşılaştırması randomize veya dengeli çaprazlanmalı; ana sonuç seçenek göstermeyen gecikmeli üretim/hatırlama olmalı (ör. 7 günlük), yeni âyet/bağlamda anlama veya kullanım aktarımı ayrı sonuç olarak ölçülmeli; cevaplar kimliği görmeyen rubrikli değerlendiricilerce puanlanmalı; örneklem gücü, dışlama, eksik takip ve güven aralıkları önceden yazılmalıdır. Anlık R1/R2/R3/R4 dağılımı süreç sonucu olarak raporlanabilir, öğrenme sonucu yerine kullanılamaz. Bu çalışma K3PD-25 kapsamında yapılmadı; gerçek katılımcı verisi yoktur.
