# KAO · Tam regresyon ve ölçüm raporu (KAO-20)

**Tarih:** 2026-09-26 · **Taban:** `kuran-ogreniyorum` dalı, KAO-19 sonrası · **Kanıt düzeyi:** kaynak/headless fixture (cihaz kabulü **bekliyor**)

Bu rapor ölçümle yazıldı: sayıların tamamı `node tests/kao/test_kao_user_tasks.js --report` ve aşağıdaki aile komutlarının çıktısından alınmıştır.

## 1. Test aileleri

| Aile | Komut | Dosya | Hata | Sonuç |
|---|---|---|---|---|
| kao | `for f in tests/kao/*.js; do node $f; done` | 14 | 0 | PASS |
| app | `for f in tests/app/*.js; do node $f; done` | 76 | 0 | PASS |
| panel | `for f in tests/panel/*.js; do node $f; done` | 23 | 0 | PASS |
| panel-v2 | `for f in tests/panel-v2/test_*.js; do node $f; done` | 27 | 0 | PASS |
| quran | `for f in tests/quran/*.js; do node $f; done` | 9 | 0 | PASS |
| premium | `for f in tests/app/test_premium_*.js; do node $f; done` | 9 | 0 | PASS |
| hatırlatıcı smoke | `node tests/reminders/run-reminder-smoke.mjs` | 21 fixture | 0 | PASS (exit 0) |
| driver | `node .claude/skills/run-seyma/driver.mjs` | — | 0 | PASS (exit 0) |
| zikr | `node .claude/skills/run-seyma/zikr-harness.mjs` | 95 kontrol | 0 | PASS |
| state rebind | `node tests/app/test_state_rebind_boundary.js` | 37 kontrol | 0 | PASS |
| shell bütçesi | `node tools/shell-inventory.mjs --gate` | — | — | PASS (app.js 7.799 / 7.800) |
| verify-state-* | `node .claude/skills/run-seyma/verify-*.mjs` | 3 | 0 | PASS |
| KAO kontrast | `node kuran-ogreniyorum/tools/kao-verify-contrast.mjs` | 328 çift | 0 | PASS |
| sözlük aracı | `node tools/kao-lexicon-build.mjs --self-test` | — | 0 | PASS |
| fx-coverage | `node tools/fx-coverage.mjs --gate` | 13 ölçüt | 5 | **exit 1 — KAO öncesinden kalan** (§5.3) |

## 2. Üç kullanıcı görevi (R-C9, headless)

| Görev | Ölçüm | Sınır | Sonuç |
|---|---|---|---|
| (a) Hub kartından bugünkü oturuma | 2 dokunuş (hub → E1 → oturum); Ayarlar'dan 2 | ≤ 3 adım | PASS |
| (b) Kelime kartından kök ağacına | E5'ten 1, ünite listesinden 2 dokunuş | ≤ 2 | PASS |
| (c) Ses kapalı tam oturum | 10 görev bitti, 0 ses nesnesi; sessiz saatte de aynı | oturum sonu ekranına ulaşır | PASS |

"90 saniye içinde başlama" ve gerçek dokunma deneyimi yalnız cihazda doğrulanabilir → **kullanıcı cihaz kabulü bekliyor** (KAO-22).

## 3. Performans ve boyut (R-C5)

- **Görev geçişi:** tam oturumda 10 ölçüm; p50 0,093 ms, en yavaş 0,543 ms (bütçe 50 ms). Geçişler tam `render()` çağırmaz (hedefli DOM). Ölçüm Node VM'de; cihazdaki boyama süresi dahil değildir.
- **İlk açılışta ses indirilmez:** tüm ses nesneleri `preload="none"` (fixture).
- **4 içerik modülü gzip:** quranLexiconV1.js 116,8 KB · quranGrammarV1.js 12,7 KB · quranShortSurahsV1.js 23,8 KB · quranPhonicsV1.js 2,8 KB → **toplam 156,1 KB**. Bütçe 130,0 KB → **26,1 KB AŞILDI** (§5.1).

## 4. Kalibrasyon ve tutunma (R-A3) · gece tekrarı (R-A1)

**Simülasyon:** kalibre sentetik öğrenici (gerçek olasılık = FSRS öngörüsü), 300 kart (30 gün × 10), 42 gün, vadesi gelenin yüzde 60'ı o gün tekrar edilir, tohum 20260926. Toplam 955 tekrar; beklenen kalibrasyon hatası (ECE) **0,0131**.

| Öngörülen R bandı | Tekrar | Ortalama öngörü | Gerçek | Fark |
|---|---|---|---|---|
| 0.5–0.6 | 1 | 0.547 | 1 | +0.453 |
| 0.6–0.7 | 3 | 0.632 | 1 | +0.368 |
| 0.7–0.8 | 17 | 0.761 | 0.706 | -0.055 |
| 0.8–0.9 | 314 | 0.879 | 0.901 | +0.022 |
| 0.9–1.0 | 620 | 0.928 | 0.923 | -0.005 |

Boş bantlar gösterilmedi: FSRS tekrarları R ≈ 0,9 hedefinde zamanladığı için alt bantlara ancak geciken tekrarlar düşer; n < 30 olan bantların farkı istatistiksel olarak anlamsızdır.

| Hafta | Tekrar | Gerçek doğruluk |
|---|---|---|
| 1 | 61 | 0.918 |
| 2 | 164 | 0.902 |
| 3 | 178 | 0.916 |
| 4 | 236 | 0.903 |
| 5 | 200 | 0.925 |
| 6 | 116 | 0.914 |

Bu tablo **sentetik**tir: kalibre bir öğrenicide hesap zincirinin (öngörü → bant → gerçek) doğru çalıştığını gösterir, gerçek öğrenme etkisini değil. Gerçek veride aynı tablo artık uygulamada üretiliyor (aşağıda).

**Bu kartta tamamlanan eksikler:** önceki kartlarda R-A1 ve R-A3'ün uygulama tarafı yarımdı.
- R-A3: her tekrar cevabı `daily.calib.bands` altında 10 R-bandına (öngörü/gerçek/n) yazılır; E1 → **İstatistik** görünümü son 2 ve 6 haftanın tutunmasını, 10 bantlı öngörü–gerçek tablosunu gösterir.
- R-A1: hedef yatıştan önceki 90 dakikada oturum yalnız tekrar kartlarından, en çok 8 kart olur (senaryoda 8 kart); `daily.nightRev` sayılır; gece tekrar edilen kartın bir sonraki tekrarı `daily.nightFollow`, diğer tekrarlar `daily.dayFollow` olarak ayrı tutulur ve İstatistik ekranında karşılaştırılır. Hub kartı ve E1 gece önerisini gösterir.
- Gerçek gece tekrarı etkisi ancak gerçek kullanım verisiyle ölçülebilir; ekran en az 30 gece sonrası tekrar birikene kadar "anlamlı değil" uyarısı verir.

## 5. Bilinen sınırlar

### 5.1 İçerik boyutu bütçesi aşıldı — karar bekliyor

4 modül gzip toplamı 156,1 KB, bütçe 130 KB. Aşımın ana kaynağı sözlükteki örnek cümleler (Arapça + Türkçe + okunuş). "Her kelimeye üç örnek" kuralı kullanıcı kararıdır; bu yüzden içerik kısaltılmadı. Seçenekler:

1. Bütçeyi ölçülen değere güncelle (~160 KB gzip; tek seferlik, sonraki açılışlar önbellekten gelir).
2. Örnek sayısını kelime başına 2'ye indir (üç örnek kuralından geri adım).
3. Örnekleri ayrı bir modüle bölüp kelime kartı açılınca yükle (05 §4 "ses dışında ağ yok" ilkesinden istisna gerektirir).

Fixture, sessiz büyümeyi engellemek için 160 KB büyüme tavanı koyar ve aşımı her çalıştırmada yazar.

### 5.2 Cihaz kabulü

Gerçek ekranda okunabilirlik, VoiceOver, dokunma hedefleri, ses çalma, mikrofon izni ve CSV indirme yalnız kullanıcı cihazında doğrulanabilir → **bekliyor**.

### 5.3 fx-coverage ölçütleri (KAO dışı, önceden var)

`fx-coverage --gate` M2, M3, M4, M5 ve M7'de eşik altında (exit 1). Aynı değerler KAO-17 öncesi `35cb697` commit'inde de birebir aynıdır; KAO değişiklikleri bunları etkilemedi. Muhtemel neden: ölçüm aracı yalnız `app.js`'i tarıyor, MON/MON2 modülerleştirmesiyle dokunma/ses bağlantıları `app/core/*`'a taşındı (M1: 390 → 16 `onclick`). CLAUDE.md'deki "yalnız M7, 0,62 tavan" notu eskidir (M7 şu an 0,60). Bu, ayrı bir FX ölçüm programının konusudur.

## 6. Özet

Tüm test aileleri yeşil (fx-coverage KAO öncesinden bilinen durumuyla); R-C9'un headless kısmı PASS; R-C5'in performans kısmı PASS, boyut kısmı **karar bekliyor**; R-A1 ve R-A3 uygulama tarafı bu kartta tamamlandı.
