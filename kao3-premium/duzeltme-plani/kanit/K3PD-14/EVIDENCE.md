# K3PD-14 — Yaldızlama sesini ayar ve sessiz saatle sınırla

## Durum ve başlangıç

- Kart `ready_for_audit / NOT_MEASURED`; kullanıcı doğrudan bu oturumda canlıya alma talimatı verdi. Denetim PASS’i uydurulmayacak; izin verilen istisna kullanıcı sapması olarak kaydedilecek.
- K3PD-13 commit’i `8b98d5dea1509716e41ad56efc11aec5b21669b8`; dirty `app/core/quranLearn.js` farkı yalnız K3PD-14’tür. Dal `k3pd-denetim-duzeltmeleri`; başlangıç `HEAD...origin/main=3/0`.
- Eski `K3P-STATE.json` ayrı okundu: 37/37 `completed`, `nextPrompt=null`, tarihsel release approval `APPROVED-2026-10-18`. K3PD release approval başlangıçta `NOT_APPROVED` idi.
- K3PD-13’ün paylaşılan kaynak dosyasındaki değişiklik committed `HEAD`’de ayrıdır. K3PD-14’ün 11 exact yazma yolu DURUM.json ve prompt allowlist’inde eşleşir.

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

## Yetki ve sınırlar

- Prompt ve denetleyiciye eklenen bir defalık istisna yalnız bu K3PD-14 adayı içindir. Kullanıcının “canlıya al o zaman” ve prompt kapısını düzeltme talimatı bağımsız denetim ve K3PD-32/33 sırası için açık sapma yetkisi sayılır; ajan bunu bağımsız PASS olarak göstermeyecek.
- Public Pages kaynak/varlık SHA paritesi ve doğru SHA’ya ait workflow olmadan canlı teslim tamamlandı denmeyecek. Gerçek hesap browser’ı, ekran görüntüsü, kişisel veri, token, `seyma-data`, tag ve K3PD-15 kapsam dışıdır.
- Korunan dirty yolların başlangıç hashleri: KAPANIS `d8e8419e2849b9eec922e537bca7100149fdfee6120ce850fda77128f8af9bcd`; README `1aee47cdd05726f4a5966748ae3f786bd79d2e394dd37f3ec7b083f2d36eed0f`; GORSEL-KANIT.md `d7627027bba21007550f0a5c76130a4d9f11b7b896d001a60e9333c81ffeed28`; PDF `05ae0071c87c7bad4ed5f050cbb07479e022e912a67ad401b59e00b52ca8811b`.
