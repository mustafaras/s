# K3PD-13 — Yavaş doğru şeridinde gerçek duraklatma

## Yetki ve başlangıç

- Başlangıç branch’i `k3pd-denetim-duzeltmeleri`; HEAD `b422af7062b1b5e10365238fd5d16daef5ec0978`; başlangıç `HEAD...origin/main` `2/0`.
- Başlangıç `durum.mjs --check` PASS, `--sonraki` K3PD-13 gösterdi. K3PD-12 `done`; bu kart K3PD-13’tür. `--sonraki` tek başına çalışma yetkisi sayılmaz.
- Başlangıç K3PD `releaseApproval.status=NOT_APPROVED`, `candidateSha=null`; K3P tarihsel `37/37`, `nextPrompt=null`, `APPROVED-2026-10-18` kaydı ayrı tutuldu. Bunlar bu kart için yayın yetkisi değildir.
- Kullanıcı 2026-10-21’de yalnız K3PD-13 allowlist’ine `tests/kao/test_kao2_perf_budget.js` eklenmesini ve runtime gzip tavanının 137’den 137.25 KiB’ye yükseltilmesini onayladı. Yayın ve K3PD-14 yetkisi vermedi.

## Başlangıç davranışı ve düzeltme

- HEAD’de yavaş doğru şeridi bir durum paragrafı ve tek Devam düğmesi gösteriyor; aynı Devam çoğaltıcısı, 1.600 ms otomatik geçişi iptal ederken görevi de hemen ilerletiyordu.
- Son kaynakta otomatik geçiş açık yavaş doğru için erişilebilir adlı gerçek düğme gösteriliyor. İlk etkinleştirme bekleyen timer’ı temizleyip aynı panel/görevde `paused` durumunu kuruyor ve Devam’a odak veriyor. İkinci Devam tek adım ilerletiyor.
- Timer mevcut panel nesnesini token olarak yakalıyor. Eski callback yeni paneli ilerletemiyor; kapatmada panel eşzamanlı geçersizleniyor. Hızlı doğru 600 ms kolu, yanlış-manuel kolu ve `autoAdvance=false` tek Devam yolu korunuyor.
- Yeni `App.kao*` ataması yok; `App.kao*` sayısı 45. `data`, şema/migrate, içerik, yeni handler, pin, `index.html`, `sw.js` ve Flow/Views modüllerinde diff yok.

## Kart testleri

| Komut | Sonuç |
| --- | --- |
| `node tests/kao/test_k3p_feedback_arms.js` | exit 0; hızlı/yavaş/yanlış/kapalı kollar, 1.600 ms timer iptali, ilk aktivasyonda aynı görev, ikinci aktivasyonda tek ilerleme, çift aktivasyon, eski callback ve modal kapatma yarışı geçti. |
| `node tests/kao/test_k3p_feedback_copy.js` | exit 0; doğru 126, yanlış 122, dizme 11, özet 6, şerit 86 ve hızlı kol 40 ölçümü geçti; native düğme adı/canlı durum sözleşmesi doğrulandı. |
| `node tests/kao/test_k3p_rhythm.js` | exit 0; 109 ders, 5/5 ritim/yarıda kalma kontrolü. |
| `node tests/kao/test_k3p_resume.js` | exit 0; 7 kontrol. |
| `node tests/kao/test_kao2_settings.js` | exit 0; 15 kontrol, `autoAdvance` ayarı ve varsayılanı. |
| `node tests/kao/test_k3p_lesson_moment.js` | exit 0. |
| `node tests/kao/test_kao_migration.js` | exit 0. |
| `node tests/kao/test_kao2_migration.js` | exit 0; 15 kontrol, şema değişmedi. |

## G0 + G1

Canlı `DENETLEYICI.md §4` tam G0 ve G1 komut listeleri bu çalışma ağacında yeniden çalıştırıldı; her komut exit 0 verdi. G0’da status/HEAD/diff, app/sync/quranLearn/Flow/Views sözdizimi, driver, zikr harness (95/95), `durum --check/--sonraki` ve `test_k3pd_control` (33 negatif kontrol; 34 kart politikası; 6 legacy pin politikası) geçti.

G1’de iki migration, FSRS (24 yayın vektörü), queue (1.000 araya girme vakası), requirements, render, navigation, a11y (14 kontrol), inventory (83 test + 4 yardımcı/fixture), design, pronunciation (524/524), phonics, mount (19 render), focus lock, asset pins, IIP-22 (14/14), perf, plan-check ve contrast (756 çift, eşik altında 0) geçti. Asset-pin kapısı üç erteleme bildirdi; bu yerel kart PASS’idir, yayın PASS’i değildir.

`node tools/kao/kao-plan-check.mjs` exact allowlist satırı ve kapsamla PASS verdi. `git diff --check`, değişen JS sözdizimi ve yasaklı/sabit yolların diff kontrolü PASS. Baseline fixture SHA-256 `302cfcc85422c346a62fb2e9b62df8a9f64c8ec362099adc5d40a35bce29d384` olarak kaldı; yazılmadı.

## Performans ölçümü

- Canonical gzip L9: içerik 184.591 KiB, runtime 137.096 KiB, CSS 15.922 KiB. Yeni 137.25 KiB runtime tavanına göre 158 bayt boşluk var. Mutlak p95 sınırı 40 ms; G1 ölçümü p95 15.134 ms, steady 8.600 ms.
- Ortamın baseline göreli bandı steady 6.360 ms olduğundan normal koşu bu göreli bandı aşarak exit 1 verdi (10.476 ms). Belgelenmiş `KAO2_ACCEPT_SLOW_HOST=1` yalnız göreli bandı atlamak için kullanıldı; bir yüklü ölçüm mutlak p95’i 467.833 ms verip exit 1 oldu. İzole tekrar ve G1 tekrarı exit 0 verdi (p95 sırasıyla 38.325 ms ve 15.134 ms). Mutlak 40 ms sınırı hiç atlanmadı. `KAO2_WRITE_BASELINE` unset idi; baseline dosyası değişmedi.

## Korunan kirli dosyalar ve sınırlar

- `kao3-premium/KAPANIS.md`: `d8e8419e2849b9eec922e537bca7100149fdfee6120ce850fda77128f8af9bcd`
- `kao3-premium/README.md`: `1aee47cdd05726f4a5966748ae3f786bd79d2e394dd37f3ec7b083f2d36eed0f`
- `kao3-premium/kanit/sonraki/GORSEL-KANIT.md`: `d7627027bba21007550f0a5c76130a4d9f11b7b896d001a60e9333c81ffeed28`
- Üç hash başlangıç değerleriyle aynı kaldı; bu yollar K3PD-13 kapsamına/stage’e alınmadı. Var olan PDF de korunuyor.
- Davranış kanıtı Node/VM fixture’ları ve kaynak incelemesidir. Gerçek tarayıcı, ekran okuyucu, kullanıcı cihazı veya görsel kabul yapılmadı. K3PD-29 görsel kabulü K3PD-11 için ayrı açık bağımlılıktır.
- Kart `ready_for_audit`; bağımsız salt-okur PASS bekliyor. `done`, commit, push, merge, tag, deploy ve K3PD-14’e geçiş yapılmadı. Program `releaseApproval=NOT_APPROVED`.

## Kapanış: kullanıcı beyanı

Kullanıcı, bağımsız denetimleri kendisinin yaptığını ve “devam et” sinyalinin denetim sonrasında geleceğini belirtti. Bu sinyal alındı ve önceki mutabakat uyarınca K3PD-13 bağımsız kabul kapısı kullanıcı beyanı (`user_attested`) olarak PASS kaydedildi. Denetçi raporu, madde madde bulgular veya komut dökümü paylaşılmadı; ajan bağımsız denetim yapmış gibi gösterilmedi. Genel device, screenReader ve diğer dış kabul kapıları bu kartın kabulünden bağımsız olarak pending kalır.
