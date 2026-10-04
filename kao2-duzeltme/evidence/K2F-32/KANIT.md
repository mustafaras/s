# K2F-32 — İlerleme ekranı başlığı ve kalibrasyon
Tarih: 2026-10-04 · Dal: kao2-duzeltme · Önceki commit: 51d8f505 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K6-04 · R değişimi: yok (10/10)

## İlerleme günlüğü
- [x] P1: sync PASS, nextPrompt K2F-32, dal kao2-duzeltme
- [x] kırmızı test görüldü (2 yeni kontrol)
- [x] `kaoStatsHTML`: başlık h2 "İlerleme", eski üst etiket/başlık kalktı
- [x] R-bandı tablosu `Tekrar doğruluğu` bölümü içinde kapalı `<details class="kao-flag">`
- [x] mutasyon: `open` eklenince test kırılıyor; geri alındı
- [x] kapılar YEŞİL, tekrar-uret 10/10
- [x] bağımsız code-reviewer: APPROVE (CRITICAL/HIGH/MEDIUM 0)

## Yapılan
- `app/core/quranLearn.js` `kaoStatsHTML`: başlık "İlerleme" (eyebrow "İstatistik" ve "Tutunma ve kalibrasyon" kaldırıldı), alt metin kullanıcı dilinde.
- 10 R-bandı tablosu kapalı `<details>` içine taşındı; özeti tek cümle ("Öngörü ile gerçek 10 R-bandında nasıl örtüşüyor (son 6 hafta)"); "Yalnız tekrar cevapları sayılır…" açıklaması katlanan bölümün içine indi. "Son 2/6 hafta" doğruluk satırları görünür kalır.
- Yeni CSS, yeni handler yok; mevcut `.kao-flag` sınıfı yeniden kullanıldı.

## TDD
- Kırmızı: `node tests/kao/test_kao2_progress.js` → `Expected values to be strictly equal: 'Tutunma ve kalibrasyon'`
- Yeşil: `node tests/kao/test_kao2_progress.js` → 16 kontrol PASS

## Kapılar (P3)
kapilar.sh: kao 53 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · l2-paket · plan-check · sync PASS — SONUÇ: TÜM KAPILAR YEŞİL
tekrar-uret: 10/10 PASS (önceki 10/10)

## Ölçümler
- Pinler: App.kao* 45 · yüzey 766 · atama 604 (değişmedi). CSS 13,442 KiB (tavan 14), runtime 115,549 KiB (tavan 128).

## Bilerek değişen testler
- yok (2 kontrol eklendi)

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok · Cihaz: yok (kullanıcıda; katlanan bölümün görünümü/dokunma hedefi gözlenmedi)

## Sürprizler / sonraki promptlara not
- Eski test "İlerleme başlığı tek ve tutarlı" tek h2 şartını koruyor; değişmedi.
