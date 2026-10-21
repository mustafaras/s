# K3PD-14 — Yaldızlama sesini ayar ve sessiz saatle sınırla

## Durum ve başlangıç

- Kart done / ACCEPTED_DEVIATION; bu hüküm bağımsız denetim PASS’i değildir. Kullanıcı bu oturumda açıkça “canlıya al o zaman” dedi ve ardından prompt kurallarını çözmemizi istedi; buna dayanarak yalnız K3PD-14 istisnası uygulandı.
- Başlangıç HEAD 8b98d5dea1509716e41ad56efc11aec5b21669b8, K3PD-13 commit’i. Paylaşılan quranLearn.js farkı K3PD-13’ten temiz ayrıdır. Aday commit 613a19c087e5311d0ecd324caaf470bbada065f7; remote main aynı SHA’dadır.
- K3PD-14 exact kapsamı 11 yoldur. Korunan KAPANIS, README, GORSEL-KANIT.md ve PDF kapsam dışıdır; başlangıç SHA-256’ları aynı kaldı.
- Eski K3P state ayrı tutuldu: 37/37 completed, nextPrompt null ve tarihsel release approval K3PD release onayı değildir.

## Kaynak sözleşmesi ve düzeltme

- Canlı `app.js` dependency bag’inde `isQuietTime:function(){...SeyAudio.isQuietTime()...}` kullanılır. Yani uygulama sözleşmesi function’dır; resolver boolean döndürür. Gerçek saat kullanılmadı.
- `kaoAudioEnabled()` ortak `q.settings.audio` iznini ve isQuietTime resolver’ını kullanır; resolver yok/hatalıysa ses kapalı kalır. `premiumAtmosphere` veya görsel animasyon izni sese bağlanmaz.
- `kaoGild()` yalnız yaldız sesini bu izne bağlar. `kaoPlaySequence()` genel izin gate’i yapılmadı; var olan açık ses eylemleri ve K3P-21’in ◖ Yavaş / ◗ Doğal düğmeleri etkilenmez. Audio oluşturma/çalma hataları yakalanır, okuma tamamlanır.
- Reduced-motion görsel timer’ı kapatır/statik yaldız üretir. Ses ayarı açıksa ve sessiz saat değilse ses çalmaya devam eder.

## Kırmızı → yeşil ve gerçek çağrı ölçüsü

- Kaynak düzeltmesinden önce 2×2×2 davranış testi exit 1 verdi: ayar kapalıyken ses nesnesi oluşturuluyordu.
- İlk ara düzeltme gate’i ortak sekans fonksiyonuna koydu; `test_kao_queue.js` exit 1 ile bağımsız açık ses yolunun engellendiğini gösterdi. Gate `kaoGild()` içine daraltıldı.
- Son `node tests/kao/test_k3p_lesson_ayah.js`: exit 0, 7 kontrol. Ayar kapalı 4 hücrenin tamamı 0/0; izinli 2 hücre 8 create/8 play; sessiz saat açık 2 hücre 0/0. Reduced-motion açık izinli hücrede ses 8/8.
- `missing`, null audio, createAudio throw, play throw ve error event senaryolarında okuma/yaldız tamamlanır.

## Kart testleri ve kaynak kapıları

| Komut | Exit | Ölçüm |
| --- | ---: | --- |
| `node tests/kao/test_k3p_lesson_ayah.js` | 0 | 7 kontrol; 8 hücre; izinli create/play 8/8; red edilen 6 hücre 0/0 |
| `node tests/kao/test_k3p_audio_buttons.js` | 0 | 6 kontrol; iki görünür ses düğmesi; `App.kao*` 45 |
| `node tests/kao/test_k3p_dda.js` | 0 | 14/14 |
| `node tests/kao/test_kao_phonics_contract.js` | 0 | grammar 72,297 B; surah 87,335 B; phonics 9,552 B |
| `node tests/kao/test_kao2_reader.js` | 0 | 14 kontrol; sessiz saatte okuma sürer |
| `node tests/app/test_iip_22.js` | 0 | 14 kontrol; ortak pin `20261021a` |
| `node --check app/core/quranLearn.js` | 0 | syntax clean |
| `node --check tests/kao/test_k3p_lesson_ayah.js` | 0 | syntax clean |
| `node --check sw.js` | 0 | syntax clean |
| `node --check tests/app/test_iip_22.js` | 0 | syntax clean |

G0/G1, asset freshness ve perf kapıları aday commit üzerinde son kez çalıştırılıp sonraki kayda eklenecek.

## G0/G1 ve canlı yayın sonucu

- Beş kart testi, IIP-22 14/14, K3PD control 33 negatif + 34 kart politikası + 6 legacy-pin politikası, G0 ve G1 kapıları exit 0. Ayrıntılı gerçek komut/env/exit/ölçüler KAYIT seq89 ve DURUM.json.cards.K3PD-14.checks içindedir.
- Pin freshness: 63/63 taze, 0 ertelenmiş, 0 engelleyici bayat. Perf: içerik 184.591 KiB, runtime 137.186/137.25 KiB, CSS 15.922 KiB, p95 8.964 ms, steady 3.707 ms; baseline yazılmadı, slow-host istisnası kullanılmadı.
- GitHub Actions Pages run [39616251782](https://github.com/mustafaras/s/actions/runs/39616251782), head 613a19c087e5311d0ecd324caaf470bbada065f7: validate success, deploy success; uzak main aynı SHA. No-cache SHA-256 taramasıyla 68/68 statik URL eşleşti; eksik/hata 0. index.html, sw.js, quranLearn.js, quranLearnFlow.js ayrıca HTTP 200 ve SHA eşliği verdi. K3PD DURUM.json public path’i 404; plan runtime yayınına dahil değildir.
- GitHub Pages build_type=workflow; pages/builds/latest API’si 2026-06-24 tarihli, 529d448... commit’ine ait eski legacy-builder errored kaydı döndürür. Bu güncel Actions workflow’una ait değildir; mevcut workflow sonucu ve canlı SHA ölçümü success’tir.

## Yetki, yayın ve kalan dış kabuller

- Aday bazlı release approval yalnız 613a19c087e5311d0ecd324caaf470bbada065f7 ve bu kartın 11 exact yoluna bağlandı. Kayıt yanıtı kullanıcının “canlıya al o zaman” talimatıdır; ACCEPTED_DEVIATION bağımsız audit olarak sunulmaz.
- remoteParity=verified. Cihaz, gerçek ekran okuyucu, L2, 230 kayıt ve 14/30 günlük öğrenme etkisi kullanıcı kapıları pending. K3PD-11/K3PD-29 görsel kabulü de bu kart dışında pending.
- K3PD-15 yalnız next candidate olarak kaldı; başlamadı. Push sonrası yerel makbuz yalnız DURUM/GUNCEL-DURUM/KAYIT/EVIDENCE yollarında tutulacak. Tag, merge, screenshot, kullanıcı verisi veya başka kart değişikliği yok.
- Korunan başlangıç hashleri: KAPANIS d8e8419e2849b9eec922e537bca7100149fdfee6120ce850fda77128f8af9bcd; README 1aee47cdd05726f4a5966748ae3f786bd79d2e394dd37f3ec7b083f2d36eed0f; GORSEL-KANIT.md d7627027bba21007550f0a5c76130a4d9f11b7b896d001a60e9333c81ffeed28; PDF 05ae0071c87c7bad4ed5f050cbb07479e022e912a67ad401b59e00b52ca8811b.
