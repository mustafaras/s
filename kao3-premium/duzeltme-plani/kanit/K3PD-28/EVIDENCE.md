# K3PD-28 — Ölçü ve regresyon kapısı

## Güncel durum

Kart **done/PASS**; tam yavaş K3PD-28 kapısı, exact-scope/hash kapanış kontrolleri ve güncel diff için taze bağımsız salt-okur denetim PASS. Denetim PASS vermeden kart kapanışı ve commit yok.

- Branch: `k3pd-denetim-duzeltmeleri`
- Base HEAD: `9d618532cb9c4c2aed4e93bd81fb465886502ec6`
- nextPrompt=K3PD-28; releaseApproval=NOT_APPROVED; candidateSha=null
- Kullanıcının 2026-10-25 yetkisi: tüm gerekli gereklilikler ile commit/push/merge/deploy. Bu K3PD-28 kapsam genişletmesini ve sonraki kartlarda sıralı ilerlemeyi kapsar; K3PD-32/33 aday ve onay sırası korunur.
- K3PD-28 allowlist’ine `app/core/quranLearnViews.js`, `tests/kao/test_k3p_lesson_ayah.js` ve erişilebilirlik beklentisi için `tests/kao/test_kao2_a11y.js` eklendi. Mevcut içerik, `data`, migration ve `App.*` handler yüzeyi değişmedi.
- Dört önceden kirli korunan dosya kapsam/stage dışında; başlangıç SHA-256 değerleri aynı.

## Düzeltme

Hedef görünümünde tam Tezhip satırı, ders başlığı ve “Daha fazla” özeti aynı anda görünüyordu. Başlık korunup tam satır, hedef açıklaması ve vaat tek `<details>` bölmesine alındı; özet “Hedefi ve metni gör”. Kaynak içerik değişmeden kullanıcı tam metne erişebilir. Ölçüm, açık details özetini görünür kabul eder.

Legacy K3PD-20 taraması artık sentetik title’sız plan yerine gerçek `kaoLesson('start')` açılışını kullanır; 109 dersin başlığı, açık özetleri ve ilk görünür metni ölçülür. Aynı tam Tezhip satırının apply ekranında korunduğu doğrulanır.

## Hedefli doğrulama

| Komut | Sonuç |
| --- | --- |
| `node --check app/core/quranLearnViews.js` | Exit 0 |
| `node --check tests/kao/test_k3p_lesson_ayah.js` | Exit 0 |
| `node tests/kao/test_k3p_lesson_ayah.js` | Exit 0; 21 kontrol |
| `node --check tests/kao/test_kao2_a11y.js && node tests/kao/test_kao2_a11y.js` | Exit 0; 14 kontrol; goal summary güncel etiketi doğrulandı |
| `env -u KAO2_WRITE_BASELINE -u KAO2_EVIDENCE_OUT node tests/kao/test_kao2_kabul.js` | Exit 0; A-9 220/220; A-10 limitleri PASS |
| `node kao3-premium/araclar/akis-olc.cjs --json` | Exit 0; fresh ve established 109/109, her hedef ekranı 5–10 sözcük, 0 boş, 0 >25 |
| `node tests/kao/test_k3pd_control.js` | Exit 0; 33 kontrol negatif vakası, 34 K3PD ve 6 legacy pin policy kontrolü |

| Gerçek akış metriği | Taze | Yerleşik |
| --- | ---: | ---: |
| Goal ekranı | 109; max 10/25; aşım 0 | 109; max 10/25; aşım 0 |
| Intro ekranı | 518; max 42/45; aşım 0 | 499; max 42/45; aşım 0 |
| Concept ekranı | 25; max 41/45; aşım 0 | 25; max 41/45; aşım 0 |
| Ders coverage | 109/109 başladı ve tamamlandı | 109/109 başladı ve tamamlandı |

İlk açılış 2 dokunuşta göreve ulaşıyor. Taze profilde açılış çifti hedef+ilk tanış olarak kaldı. Kabul edilmiş 42 dokunuş ve eski tanıma sapmaları ham NOT_MET durumunda kalır; PASS toplamına katılmaz.

## Önceki ölçüm ve audit

Kayıt seq158’deki ilk tam yavaş koşu, hedef ekranı 33 sözcük ve 72/109 ile 69/109 aşım bulduğu için FAIL idi. Seq159 bağımsız denetimi o ilk diff için PARTIAL verdi; title/summary eksik synthetic fixture farkını doğruladı. UI düzeltmesi o denetimden sonra yapıldı; bu nedenle seq159 güncel diff için kabul sayılmaz ve yeni bağımsız denetimin yerini tutmaz.

Seq158 ilk tam kapı, düzeltme öncesi hedef ölçüsü nedeniyle FAIL idi. Render düzeltmesi sonrası yavaş kapı hedef metriğini iki profilde 109/109, max 10/25 ve sıfır aşım ile ölçtü; o koşu G0 15/15, G2 14/14 iken G1 17/19 çıktı: erişilebilirlik assertion eski özeti bekliyor, A-9 buna bağlı olarak 219/220 sayıyordu. Assertion yeni etikete güncellendi; erişilebilirlik testi 14 kontrol, A-9 tekrar koşusu 220/220 PASS. Bu test düzeltmeleri sonrası tam yavaş kapı seq162’de exit 0 verdi; sonuçları aşağıdaki güncel kapı bölümündedir. Tarihsel R08 9/10, güncel R08 PASS. `--final`, K3PD-11/21/28/29/30 ve nextPrompt=K3PD-31 önkoşulları eksikken suite başlatmadan BLOCKED dönmüştü.

## Kalan işler

- Seq158 ve seq159 eski diff denetimleri tarihsel olarak korundu. Taze bağımsız `/root/k3pd28_audit` exact-diff denetimi PASS verdi; depo yazımı 0. Kapanış DURUM/KAYIT ile eşlendi; yalnız 14 izinli yol yerel commit edilecek.
- K3PD-11/21, K3PD-29/30 ve yayın öncesi final bağımlılıkları halen açık.
- K3PD-29 visual QA, K3PD-30 belge matrisi ve K3PD-31 final audit sıralı sonraki kartlardır; henüz başlamadılar.
- K3PD-32 exact candidate SHA hazırlar. K3PD-33 gerçek exact aday yanıtı olmadan yayın yapamaz. Genel yetki, aday SHA’ya bağlı releaseApproval alanını kendiliğinden APPROVED yapmaz.


## 2026-10-25 ara tekrar

Render düzeltmesi sonrası tam yavaş koşu, hedef metrikleri PASS ölçmesine rağmen eski erişilebilirlik özeti beklentisi nedeniyle G1 17/19 ve A-9 219/220 sonucu ile exit 1 verdi. tests/kao/test_kao2_a11y.js yeni goal özetini doğrulayacak şekilde güncellendi; 14/14 kontrol geçti. env üzerinden baseline ve evidence yazımı kapalı tutulan test_kao2_kabul.js tekrarında A-9 220/220, A-10 metrikleri PASS oldu. Bu iki onarım sonrası tam yavaş kapı hâlâ bekliyor; kart in_progress, bağımsız hüküm NOT_MEASURED.


## Tam K3PD-28 yavaş kapı — 2026-10-25

Güncel komut env: ağ kullanılmadı, gerçek kullanıcı verisi kullanılmadı, KAO2_WRITE_BASELINE ve KAO2_EVIDENCE_OUT unset, KAO2_ACCEPT_SLOW_HOST=1. Kapı yaklaşık 35 dakikada exit 0 verdi. G0 15/15, G1 19/19, G2 14/14; G5 güncel 6 ölçüm/fixture komutu exit 0. Tarihsel R08 tanılayıcısı 9/10 ve exit 1 olarak eski tarihsel sonuçta kaldı; ayrı güncel R08 PASS. Timeout 0, SKIP 0, baseline yazımı yok. Ölçüm matrisi: ham PASS 11, açıkça kabul edilmiş sapma 3, yapısal açılış çifti istisnası 1, engelleyici 0. Fresh/established hedef ekranı 109/109; max 10/25, aşım 0; intro 42/45, concept 41/45; current R08 ve gerçek 109 ders render kontrolü PASS. Fresh açılış çifti max passive run 2 olarak yapısal istisna; genel recognition fresh 1010/1087 ve established 1025/1125 ham NOT_MET, K3PD-25 seq139 onaylı sapma olarak pass sayılmıyor; mature repeat R1 648/1324=48.94% PASS. u01.01 42 dokunuş, K3PD-23 onaylı 42 hedefiyle sapma kaydıdır.

Son scope karşılaştırması PASS: 14 bildirilen kart yolu; Git’te 18 değişmiş yol (4 korunan dirty dosya dahil); dört korunan hash aynı; staged yol 0; issues 0. git diff --check PASS. K3PD-28 taze bağımsız salt-okur audit ile done/PASS oldu; denetçi 14 izinli yolu, dört korunan hash’i, boş staged alanı, güncel yavaş kapı ve state/diff kontrollerini doğruladı. Teknik kapı kullanıcı cihazı, ekran okuyucu, alan uzmanı, ses kayıtları veya gerçek öğrenme etkisini doğrulamaz.

K3PD-28 sonundaki negatif final önkoşul çağrısı exit 1 ile beklenen BLOCKED sonucunu verdi: nextPrompt K3PD-31 değil ve 11/21/28/29/30 kabul zinciri eksik; final fixture suite hiç başlamadı (0 komut). Bu beklenen engel, kartın kendi yavaş gate PASS sonucunu etkilemez ve final suite PASS gibi raporlanmaz.
