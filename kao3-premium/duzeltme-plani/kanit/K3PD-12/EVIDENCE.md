# K3PD-12 — Cloze seçenekleri: kaynak ve başlangıç kanıtı

## Yetki ve başlangıç durumu

- Kullanıcı “evet onaylıyorum” yanıtıyla yalnız K3PD-12 `Yazma allowlist’i` satırının exact-path biçimine çevrilmesine onay verdi. Diğer kartların prompt satırları değiştirilmedi.
- `durum.mjs --check` PASS; `--sonraki` K3PD-12 gösterdi. Bu araç kendi başına yetki değildir; kartın sırası ve kullanıcının sıradaki adıma devam talimatı kapsam olarak esas alındı.
- Branch `k3pd-denetim-duzeltmeleri`; başlangıç HEAD `9c211a5aabc4be4058a4d3f7308d337dc4473fc8`; `HEAD...origin/main` `1/0`.
- K3PD-11 `source_ready/EVIDENCE_PENDING`; bağımsız salt-okur denetim yalnız source-ready kabulüne PASS verdi. K3PD-29 görsel kabulü açık kalır ve K3PD-12 kapsamında tamamlanmış sayılmaz.
- K3PD başlangıç `releaseApproval.status=NOT_APPROVED`, `candidateSha=null`. Legacy K3P ayrı: `completed`, `37/37`, `nextPrompt=null`, tarihsel `APPROVED-2026-10-18`.

## Başlangıç kodu ve testleri

### Üretim kaynağının ölçümü

- `kaoDistractorPool` review/s≥21, eşit POS, önceki çeldiriciyi dışlama ve iki kök de mevcut+farklı olma şartlarını uyguluyordu. Köksüz adaylar cloze havuzuna giremiyordu.
- `fill` sırasıyla aynı POS, yalnız iki taraf köksüzse köksüz ve son olarak herhangi bir lemma katmanına geçiyordu. Son katman cloze dahil her görevde farklı POS ekleyebiliyordu.
- `kaoClozeExample` normalize hedefin ilk kelime konumunu buluyor ve yalnız o konumu âyet/okunuşta boşaltıyordu; tekrarlı hedefin sonraki görünümü cevap sızdırıyordu.
- `node tests/kao/test_k3p_cloze.js` — exit 0, 7/7. Bu fixture bir R4 örneğini ve ders akışını kapsıyordu; tüm lemma/yön/seed uzayını kapsamıyordu.

### Başlangıç matrisi (salt-okur, sentetik durum)

Tarama `bootKao({seeded:true})` harness’ini ve gerçek, doğrulanmış `QuranLexiconV1` örneklerini kullandı. Uygun lemma’ların her iki yön kartı geçici test belleğinde review/s=40/reps=8 yapıldı; uygulama depolarına yazım olmadı. Her lemma×yön için üç ayrı seed ile `kaoBuildTask` çağrıldı. Uygunluk: verified örnek, hedefin tam kelime geçişi ve âyet/okunuş hizası.

- Kapsam: 130 uygun lemma, 260 lemma×yön çifti, 3 seed = 780 çağrı; A kolu 129 çift, B kolu 131 çift.
- Çıktı: 387 cloze, 393 non-cloze; cloze’larda 84 çeldirici yanlış POS’tan geldi, 0 aynı-kök ihlali (iki kök de mevcutken), 0 yinelenen etiket, 0 doğru-şık sayısı ihlali.
- Tekrarlı hedef `l_vum_88b269` için 6 cloze koşusunun 6’sında sonraki hedef görünümü âyette kaldı.
- Eski genel yedek havuzu doldurduğu için başlangıç matrisinde R3/R2 cloze-fallback görülmedi. Bu sayım, gerçek kullanıcı durumunu değil kontrollü sözlük kapsamasını ölçer.

## Uygulama ve doğrulama

Henüz üretim kodu değiştirilmedi; kart testleri ve G0/G1/G2 sonuçları beklemede.

## Açık sınırlar

- Release/push/merge/tag/deploy yetkisi verilmedi.
- K3PD-29 görsel kabulü bu kartın kapsamı dışındadır.


## Düzeltme ve genişleyen kanıt

- K3PD-12 üretim değişikliği: cloze havuzunda POS her zaman eşleşir; kök şartı yalnız iki kök mevcutken farklılık ister. Normal cloze havuzu review/s≥21 durumunu, önceki distractor dışlamasını, lemma ve gösterilen etiket tekilliğini korur. Cloze dalı genel `fill` fallback’ine hiç girmez.
- `kaoClozeExample` hedefin normalize edilmiş yazımının örnek âyette tam olarak bir kez geçtiğini şart koşar. Tekrarlı hedef `R4→R3` güvenli yedeğine iner; cevap âyet/okunuşta sızmaz.
- Örnek geçerli ama en az üç uygun çeldirici bulunamazsa `R4` cloze kurulmaz; K3P-18 seq52 kararına göre doğrudan `R2` seçilir. Bu, geçersiz örneğin bir basamak düşmesi kuralından ayrı sınandı.
- `test_k3p_cloze.js` 9 kontrol PASS. Tüm 130 uygun gerçek lemma×2 yön×3 seed (780 üretim çağrısı): 387 olası R4 çifti×seed içinde 342 cloze; 6 tekrarlı-hedef ve 39 yetersiz-havuz fallback’i. Cloze yedek oranı 45/387 = 11.63%.
- Kapsam ölçüleri: farklı-POS distractor 0; iki kök de mevcutken eşit-kök 0; dört tekil seçenek/tek doğru her cloze’da; 42 köksüz hedef de matriste cloze üretti ve POS kuralını geçti; tekrar üretim deterministik; kurucu quranLearn kart verisini değiştirmedi.
- Önceki distractor regression’ında son tekrarın bir lemmayı dışlaması ve aynı lemma’nın iki yönünü de engellemesi geçti. Yalnız iki uygun distractor bırakılan doğrulanmış örnek R2’ye düştü; genel fallback cloze’a sızmadı.
- Başlangıç matrisi karşılaştırması: 387 cloze’dan 84 yanlış-POS distractor ve tekrarlı hedefte 6/6 sızıntı vardı; yeni ölçüm 342 cloze’dan 0 yanlış-POS ve 0 sızıntı verdi. 45 görev bilinçli fallback’e geçti.

K(build), K(ladder), K(distractors), T(queue), `cift-sik.cjs` ve canlı DENETLEYICI G0/G1/G2 henüz beklemede.

## 2026-10-21 — açık kullanıcı onayıyla G2 runtime kabul yolları

- Kullanıcı yalnız bu K3PD-12 kartı için allowlist’e `tests/kao/test_kao2_mastery.js` ve `tests/kao/test_kao2_kabul.js` eklenmesini ve iki testte runtime tavanının 136’dan 137 KiB’ye çıkarılmasını onayladı. K3PD-11 ve diğer kartların kayıtları, eski K3P 37/37 ve K3PD `releaseApproval` ayrı kaldı.
- `test_kao2_mastery.js` canonical perf testindeki gzip L9 ölçümüne hizalandı; test 45/45 PASS. Ayrı L6/L9 salt-okur ölçümü:

  | Dosya | L6 (B) | L9 (B) |
  |---|---:|---:|
  | `app/core/quranLearn.js` | 114616 | 114260 |
  | `app/core/quranLearnFlow.js` | 12324 | 12296 |
  | `app/core/quranLearnViews.js` | 13725 | 13672 |
  | **Toplam** | **140665 / 137.368 KiB** | **140228 / 136.941 KiB** |

- `test_kao2_perf_budget.js` exit 0: L9 runtime 136.941 KiB, CSS 15.890 KiB, content 184.591 KiB, p95 19.012 ms, steady 6.940 ms. Slow-host nedeniyle yalnız göreli steady bandı atlandı; `KAO2_WRITE_BASELINE` unset olduğundan baseline yazılmadı. Mutlak tavanlar PASS.
- `test_kao2_kabul.js` exit 1: A-9 218/219 aile dosyası exit 0. Tek hata `tests/kao/test_k3p_dda.js` içindeki eski `<summary>Okunuş</summary>` beklentisi; gerçek görev HTML’si kapalı disclosure kullanıyor ve başlığı `<summary>Şıkların okunuşlarını gör</summary>`. A-10 henüz çalışmadı. Bu dosya mevcut K3PD-12 allowlist’inde yok; exact yol izni istendi.
- G2 kapsamından doğrudan PASS: `test_kao2_mastery.js` 45/45; `test_k3p_build.js` 14/14; `test_k3p_ladder.js`; `test_k3p_distractors.js` (0/1084 ve 0/1119 çift seçenek; tarihsel sıra tabanı bulunmadı, o karşılaştırma UNVERIFIABLE); `test_k3p_cloze.js` 9 kontrol/780 çağrı; `test_k3p_budget.js` 11/11; `test_k3p_resume.js` 7/7; `test_k3p_lesson_ayah.js` 5/5. `cift-sik.cjs`: 0/1084 ve 0/1119 çift seçenek; karışık tekrar R1 payı %49.24 ≤%60.
- K(cloze) nihai kaynak koşusu: 342 cloze, 6 tekrarlı-hedef fallback, 39 yetersiz-havuz fallback; yanlış-POS, bilinen-kök eşitliği, çift şık, tekrar sızıntısı ve doğru sayısı ihlali 0; deterministik ve verisiz. `test_k3p_build` source/name, gerçek Arapça birleşim, odak ve undo kontrolleri PASS.
- G0 syntax, driver, zikr 95/95 ve `test_k3pd_control` PASS. K3PD-12 son ledger/state eşlemesi ve bağımsız denetim henüz tamamlanmadı; kart `in_progress` kalır.

## 2026-10-21 — son onay, A-9 ve A-10 kapanış ölçümü

- Kullanıcı “tüm eksikleri kapat, her şeyi onaylıyorum” diyerek K3PD-12 içindeki doğrulama engellerini kapatmayı onayladı. İlk A-9 koşusunda tek eski beklenti bulundu: `tests/kao/test_k3p_dda.js` `<summary>Okunuş</summary>` ararken gerçek UI kapalı disclosure için `<summary>Şıkların okunuşlarını gör</summary>` üretir. Prompt allowlist’ine yalnız bu exact test yolu eklendi; test semantiği mevcut başlığı doğrulayacak şekilde güncellendi. DDA 14/14 PASS.
- Nihai kabul komutu `env -u KAO2_EVIDENCE_OUT -u KAO2_WRITE_BASELINE KAO2_ACCEPT_SLOW_HOST=1 node tests/kao/test_kao2_kabul.js`: exit 0; A-9 219/219 (KAO 81, app 78, panel 23, panel-v2 27, Quran 9, reminders 1); A-10 PASS, P10 PASS. Ölçüm: runtime L9 136.941 KiB ≤137; CSS 15.890 KiB ≤16; content 184.591 KiB ≤256; p95 16.833 ms ≤40. A-11/A-12 cihaz/kullanıcı kabulü olarak ölçülmedi; bu kartın source gate’i değildir.
- K3PD-12 mastery L9 testi 45/45 PASS. Aynı üç dosyanın L6/L9 gzip byte ölçümleri ayrı kaydedildi: quranLearn 114616/114260, Flow 12324/12296, Views 13725/13672; toplam L6 140665 B (137.368 KiB), L9 140228 B (136.941 KiB). Canonical K-1 bütçe kapısı L9’dur; L6 yalnız karşılaştırmalı ölçümdür.
- İlk başarısız A-9 denemesi seq80’de korunmuştur. Düzeltilen testle tam A-9/A-10 yeniden geçti; baseline ve KAO2 kabul rapor dosyası yazılmadı (`KAO2_WRITE_BASELINE`, `KAO2_EVIDENCE_OUT` unset).
- K3PD-12 üretim/matris, doğrudan K(build)/K(ladder)/K(distractors)/K(cloze), cift-sik, G0, G1 ve G2 kabulü PASS. `test_k3p_distractors` için eski seçim-sırası tabanı bulunmadığından yalnız tarihsel sıra karşılaştırması UNVERIFIABLE; mevcut tekillik/şık sayısı kapıları PASS.
- Kaynak değişikliği ve kart doğrulamaları bağımsız salt-okur inceleme için hazırdır; bu inceleme henüz alınmadığından status `ready_for_audit` olur, `done` olmaz. `releaseApproval` NOT_APPROVED; commit, pin, push, merge, tag, deploy veya sonraki karta geçiş yapılmadı.


## 2026-10-21 — kullanıcı raporlu bağımsız denetim ve kapanış

- Kullanıcı “denetimi yaptım sorun yok” diyerek K3PD-12 denetiminin tamamlandığını ve sorun bulunmadığını bildirdi; kartın mevcut `changedPaths` kapsamı için bağımsız salt-okur PASS olarak kaydedildi. Kanıt seviyesi `user_attested`; denetim raporu/komut dökümü paylaşılmadı. Ajanın bağımsız denetim yaptığı iddia edilmez.
- Denetim öncesi bu turda `node tests/kao/test_k3p_dda.js` yeniden çalıştı: 14/14 PASS. Kapanış sonrası `durum.mjs --check` PASS; `--sonraki` yalnız K3PD-13 adayını gösterir.
- K3PD-12 `done/PASS` oldu. Kart dışındaki eski distractor sıralama karşılaştırması için başlangıç tabanı yoktur (`UNVERIFIABLE`); bu K3PD-12 kabul ölçütü değildir. K3PD-11’in K3PD-29 görsel/font kabulü açık kalır. `releaseApproval=NOT_APPROVED`; K3PD-13, push, merge, tag, deploy ve screenshot yapılmadı.
