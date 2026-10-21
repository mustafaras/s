# K3PD-14 — Yaldızlama sesini ayar ve sessiz saatle sınırla

## Güncel düzeltme adayı

- Durum ready_for_audit / NOT_MEASURED. Bu, bağımsız kabul hükmü değildir.
- Taban HEAD 5105b42eaf3b6880173135639c28ffe59e4aee81, branch k3pd-denetim-duzeltmeleri. Yalnız K3PD-14 kaynak/test ve kayıt yolları değiştirildi; uygulama/test değişiklikleri commit edilmedi.
- Önceki yayımlanmış A adayı 613a19c087e5311d0ecd324caaf470bbada065f7 ve ona bağlı yayın makbuzu tarihsel olarak korunur. Yeni yerel kaynak değişikliği A onayına dahil değildir; releaseApproval bu aday için NOT_APPROVED.

## Kaynak sözleşmesi ve düzeltme

Canlı app.js, isQuietTime alanını function olarak verir ve SeyAudio.isQuietTime() sonucunu boolean'a çevirir. Yüzeyin eski tüketicileri açık boolean biçimini de kullanır. kaoAudioEnabled şöyle çalışır:
- ayar q.settings.audio kapalıysa sesi engeller;
- function sonucu false veya açık boolean false ise izin verir;
- function sonucu true, boolean true, eksik sağlayıcı, function dışı değer, boolean dışı function sonucu veya exception varsa sesi engeller.
Gerçek saat kullanılmadı. premiumAtmosphere ve görsel animasyon izni ses kararına sokulmadı. kaoPlaySequence genel bir sessiz-saat gate'ine çevrilmedi; açık eski ses yolları korunuyor.

kaoGild reduced-motion açıkken bütün satırı statik yaldızlar ve yeni görsel timer kurmaz; izinli ses yine oynar. Ses kapalı/sessiz/hatalı olduğunda okuma ve görsel yaldız sürer. Audio create/play hata kipleri okuma akışını kesmez. App.kao* atamaları 45, K3PD-21 iki ses düğmesi yerinde.

## Kırmızı → yeşil davranış kanıtı

- Yeni sözleşme sınır testi eklenmeden önce test_k3p_lesson_ayah exit 1 verdi: isQuietTime sağlayıcısı yokken createAudio=8 ve play=8. Bu, eksik sessiz-saat bağımlılığında fail-open davranışını üretti.
- Function-only ara gate, sentetik DDA fixture'ındaki açık boolean false bağımlılığını reddedip test_k3p_dda'yı 2 kontrol kırmızı yaptı. Canlı app function sözleşmesi korunurken eski yüzeylerdeki açık boolean true/false biçimi de doğrulandı; son DDA koşusu 14/14 geçti.
- Düzeltmeden sonra sessiz-saat doğrulaması function ve boolean biçimlerini kapsıyor: true/missing/bozuk sağlayıcı createAudio=0/play=0; açık false ve function→false izin verir.
- 2×2×2 ses matrisi: kapalı ayar veya sessiz saatte 6 hücrenin tamamı createAudio=0/play=0; izinli iki hücrede her biri 8/8. Reduced-motion izinli hücrede ses 8/8 sürer ve görsel timer 0 olur.
- Ses yokluğu, null audio, createAudio exception, play exception ve error event durumlarında yaldız/okuma timer ile tamamlanır.

## Kart testleri

| Komut | Exit | Ölçüm |
| --- | ---: | --- |
| node tests/kao/test_k3p_lesson_ayah.js | 0 | 8 kontrol; 8 matris hücresi; 6 engelli hücre 0/0; iki izinli hücre 8/8; function/boolean sınırları |
| node tests/kao/test_k3p_audio_buttons.js | 0 | 6 kontrol; iki görünür ses düğmesi; App.kao* 45 |
| node tests/kao/test_k3p_dda.js | 0 | 14/14; yardım/yeniden tanış ses yolları |
| node tests/kao/test_kao_phonics_contract.js | 0 | grammar 72,297 B; surahs 87,335 B; phonics 9,552 B |
| node tests/kao/test_kao2_reader.js | 0 | 14 kontrol; sessiz saatte okuma sürüyor |

## G0 + G1

G0: değişen JS sözdizimi, app/sync temel sözdizimi, driver sentetik VM, zikr harness 95/95, K3PD kontrol politikası, durum kontrolü ve git diff --check exit 0.

G1: migration testleri, FSRS 24 vektör, queue 20 görev/1,000 interleave, requirements 524/524 (4.315 ms <50 ms), render, navigation, a11y 14 kontrol/552 yüzey, inventory 83 test +4 yardımcı, design contract, pronunciation 524/524, mount 19 render/9 aşama/18 geçiş, focus lock, IIP-22 14/14, plan check ve contrast 756 çift/0 alt eşik exit 0.

Performans: KAO2_WRITE_BASELINE ve KAO2_ACCEPT_SLOW_HOST unset; exit 0; content 184.591 KiB, runtime 137.187/137.25 KiB, CSS 15.922 KiB, p95 7.785 ms, steady 3.023 ms. Baseline değişmedi.

Pin tazeliği ilk ölçümde exit 1 ile çalışma ağacındaki kaynak değişikliğini doğru biçimde engelleyici bayat pin olarak buldu (62 taze, 0 ertelenmiş, 1 engelleyici). Exact release/pin yolları bu oturumun yazma kapsamı dışında ve yeni SHA onaysız olduğu için DURUM.json içinde yalnız app/core/quranLearn.js K3PD-32’ye kadar exact branch deferral olarak kaydedildi. Son ölçüm exit 0: 62 taze, 1 ertelenmiş, 0 engelleyici. Erteleme release PASS değildir; kaynak yeni pinle yayımlanmadı.

## Kapsam ve sınırlar

- Değişen uygulama yolları: app/core/quranLearn.js ve tests/kao/test_k3p_lesson_ayah.js.
- K3PD-13 değişiklikleri ayrı commit'te kaldı. Yeni App handler, şema/migrate, içerik, pin veya modül eklenmedi.
- Dış tarayıcı, gerçek kullanıcı verisi, token, ağ, seyma-data veya kişisel hesap kullanılmadı. Driver ve Zikr testleri sentetik VM/localStorage kullanır; test kaynakları önceden incelendi.
- Dört korunan kirli yol — kao3-premium/KAPANIS.md, README.md, kanit/sonraki/GORSEL-KANIT.md ve mevcut PDF — değiştirilmedi. Son SHA-256 değerleri başlangıç kayıtlarıyla eşleşti: KAPANIS d8e8419e2849b9eec922e537bca7100149fdfee6120ce850fda77128f8af9bcd; README 1aee47cdd05726f4a5966748ae3f786bd79d2e394dd37f3ec7b083f2d36eed0f; GORSEL-KANIT.md d7627027bba21007550f0a5c76130a4d9f11b7b896d001a60e9333c81ffeed28; PDF 05ae0071c87c7bad4ed5f050cbb07479e022e912a67ad401b59e00b52ca8811b.
- Önceki A yayımlanmış durumdadır; yeni düzeltme local-only, commit/push/deploy yoktur. Yeni aday için bağımsız denetim ve ayrı exact-SHA yayın onayı beklenir. K3PD-15 başlatılmadı.

## Kullanıcı beyanı ve kart kapanışı

Kullanıcı “sıradan devam et” sinyalini, bu oturumda K3PD-14 için açıkça bildirilen `devam et` denetim kuralı kapsamında verdi. Hüküm PASS / user_attested olarak kaydedildi: kullanıcı denetim kabulünü beyan etti; ayrı rapor veya komut dökümü sunulmadı. Ajan bağımsız denetim yapmadı ve bu kayıt ajan denetimi olarak sunulmaz.

Kapanış kapıları exit 0: `node kao3-premium/duzeltme-plani/araclar/durum.mjs --check` (done/PASS, nextPrompt K3PD-15), `--sonraki` (aday K3PD-15, authorizesWork=false), `git diff --check` ve korunan dört yolun SHA-256 eşliği. releaseApproval NOT_APPROVED ve kaynak pin deferral’i sürer; kart PASS’i yayın PASS’i değildir. Committen sonra yalnız exact kart yolları doğrulanacaktır; push/deploy yapılmayacak, K3PD-15 başlatılmayacaktır.
