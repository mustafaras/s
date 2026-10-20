# K3PD-07 Kanıtı

Tarih: 2026-10-20
Başlangıç HEAD: 9a0a4f7592657d8e4043d62e59507948854c26eb
Dal: k3pd-denetim-duzeltmeleri
Başlangıç HEAD...origin/main: 1 ahead / 0 behind

## Kapsam ve korunma

DURUM.json ve KAYIT.md kartın sekiz exact yolunu içeriyor. Son çalışma ağacında yalnız bu sekiz karta ait yol ve önceden kirli üç koruma dosyası bulunuyor. Koruma dosyaları değiştirilmedi, karta veya stage'e alınmadı:

- kao3-premium/KAPANIS.md — SHA-256 d8e8419e2849b9eec922e537bca7100149fdfee6120ce850fda77128f8af9bcd
- kao3-premium/README.md — SHA-256 1aee47cdd05726f4a5966748ae3f786bd79d2e394dd37f3ec7b083f2d36eed0f
- kao3-premium/kanit/sonraki/GORSEL-KANIT.md — SHA-256 d7627027bba21007550f0a5c76130a4d9f11b7b896d001a60e9333c81ffeed28

## Uygulama davranışı

- Sıkılma yalnız kayan UI penceresinde en az 8 sonuç ve p > .92 olduğunda açılır. Boş pencere, 0/1, 7/7, sekizinci sonuç ve p=.92 sınırları sınanıyor.
- Sıkılma kolundaki Latin okunuş ilk görünümde kapalı yerel disclosure içinde tutulur. Okunuş eşliğinin kaynak Arapçası korunur. Ayar kapalıysa görev/şık Latin'i HTML ve erişilebilir ad/ARIA'ya çizilmez.
- Katlı şık okunuşları tek details öğesinde, tüm cevap düğmelerinden sonra kardeş düğüm olarak çizilir. Böylece disclosure tıklaması cevap handler'ına kabarmaz.
- Mevcut K3PD-03 H4 görev izleyicisi yeniden kullanılır; açılma izi yalnız UI durumunda kalır. Kalıcı alan, şema/migration, App.kao handler'ı yoktur.
- H4 s=20 görünür / s=21 katlı sınırı, cloze erişilebilir adındaki telaffuz ve build/cloze görev uygunluğu korunur. Genel pronunciation contract gevşetilmedi.

## Negatif sınama ve tekrar üretim

Gerçek görev HTML'i ve DOM izleme sınamaları eski nested disclosure kusurlarını kırmızı üretti: DDA sınaması eski markup ile cevap düğmesi içinde disclosure bulunduğundan exit 1 verdi; translit=false sentinel sınaması eski kodda Latin'in DOM/ARIA'ya sızmasıyla exit 1 verdi; H4 s=21 build sınaması tek kardeş disclosure olmadığından exit 1 verdi; cloze sınaması disclosure'ın cevap düğmesine gömülü olduğundan exit 1 verdi. Son düzeltmede disclosure cevap düğmelerinin sonrasındaki kardeş konuma taşındı; cloze telaffuzu ARIA adında kaldı, görsel disclosure düğmeye gömülmedi.

Son kaynak üzerindeki davranış kanıtı:

- node tests/kao/test_k3p_dda.js — exit 0, 7 kontrol; sonuç penceresi sınırları, gerçek katlı okunuş, ARIA ve ayar-kapalı yokluğu.
- node tests/kao/test_k3p_pronunciation_fold.js — exit 0, 15 kontrol; H4 görev izleyicisi, çok adımlı build ve cloze sibling containment, s20/s21.
- node tests/kao/test_kao_pronunciation_contract.js — exit 0, 524/524 kaynak, görev ve görünür eşleşme.
- node tests/kao/test_kao_requirements.js — exit 0; hedefli güncelleme 3.752 ms (<50 ms), DIA 524/524.
- node tests/kao/test_k3p_build.js ve test_k3p_cloze.js — her biri exit 0, 7/7.

DENETLEYICI §4 G0 ve G1'in son kaynak değişikliğinden sonraki tüm komutları exit 0 verdi. G1'in 18 perf dışı komutu ve izole perf ölçümü tamamlandı. Driver PASS; zikr harness 95/95; a11y 14 kontrol; pin freshness 61 taze / 2 K3PD dalında ertelenmiş / 0 engelleyici bayat; IIP-22 14/14; kontrast 756 çift / 0 eşik altı. Ertelenmiş iki dal pini release PASS değildir.

## Perf kapısı

Son izole koşu: env -u KAO2_WRITE_BASELINE node tests/kao/test_kao2_perf_budget.js — exit 0. İçerik 184.591 KiB, runtime 135.809 KiB, CSS 15.877 KiB, p95 6.430 ms, steady 4.244 ms. Perf fixture göreli ve mutlak bütçeleri PASS verdi. KAO2_WRITE_BASELINE kullanılmadı; baseline yazılmadı. Önceki denemelerdeki başarısız göreli/p95 ölçüleri tarihçede korunmuştur, bu koşunun yerine geçirilmemiştir.

## Sözleşme sınırları

- App.kao* ataması 45. app.js, sync.js, app/core/state.js, quranLearnFlow.js, quranLearnViews.js, index.html, sw.js, schema ve migration yüzeylerinde diff yok.
- Çalışma zamanı modülünün yayın pini değiştirilmedi; releaseApproval NOT_APPROVED.
- Screenshot, tarayıcı profili, kişisel veri, token, ağ/hesap, push, merge, tag veya deploy kullanılmadı.

## Durum

Bağımsız salt-okur denetim güncel kaynak, diff ve son G0/G1/perf makbuzları için PASS verdi; bloklayıcı bulgu kalmadı. Kart DURUM.json ve KAYIT seq60 içinde done / PASS olarak kapatıldı. Tek mantıksal yerel commit kapanış kapılarından sonra oluşturuluyor. Sıradaki aday K3PD-08'dir; bu PASS ve aday satırı K3PD-08'e uygulama yetkisi vermez. ReleaseApproval NOT_APPROVED; yayın eylemi yok.
