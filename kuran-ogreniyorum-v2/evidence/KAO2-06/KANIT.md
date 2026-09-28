# KAO2-06 — Geri bildirim paneli ve Devam
Tarih: 2026-09-28 · Dal: kao2-yeniden-tasarim · Önceki commit: fd751fcbbdd48917b23ddecec90f82dd7b03d887

## Yapılan
- `kaoAnswer` FSRS ve günlük sayaç etkilerini cevap anında yazar, görev indeksini sabit tutar ve tüm görev türlerinde geri bildirim paneli açar. Doğru/yanlış/soluk şıklar kilitlenir; doğru cevap ve varsa kognat açıklaması gösterilir.
- `kaoContinue()` paneli kapatır, indeksi artırır, sonraki görevi çizer ve otomatik ses davranışını korur. `kaoUndo()` panel açıkken cevap etkilerini geri yükler; üç saniyelik zaman aşımı yoktur. `order` ara seçimleri panel açmaz, son seçim açar.
- `autoAdvance` migration/ensure yolunda `false` varsayılanıdır; yalnız açık ayar ve doğru cevap sahte saatte 900 ms sonra devam eder.
- İlerleme çubuğu görev başına taşındı; erişilebilir “n / toplam” bilgisi kaldı. Basılı tutarak dinleme korundu, “Doğal hız” ikincil düğmesi eklendi.
- `app.js` içinde yalnız `App.kaoContinue` shim'i eklendi. README'deki eski KAO2-03 “sıradaki” satırı sürpriz olarak kaydedildi, README değiştirilmedi.

## TDD
- Kırmızı: `node tests/kao/test_kao2_feedback.js` → `AssertionError: cevap indeks artırmadan geri bildirimde kalmalı` (`1 !== 0`).
- Yeşil: `node tests/kao/test_kao2_feedback.js` → `KAO2-06 feedback PASS`.
- Etkilenen KAO beklentileri: cevap sonrası otomatik indeks artışı yerine açık `kaoContinue()`; undo artık milestone etkisini de geri alıyor. Kognat/link cevabı mevcut fixture'ın HTML escape bağımlılıkları nedeniyle panel model alanından sınanıyor; gerçek HTML metni yeni fixture'da doğrulanıyor.

## Kapılar (P3)
| Kapı | Sonuç |
|---|---|
| Sözdizimi: quranLearn.js, quranLearnViews.js | PASS |
| KAO testleri | 22/22 PASS |
| Uygulama testleri | 75/77 PASS; P6 BLOCKED: `test_app_surface_daily_boundary.js` eski 596 atama/758 yüzey pinini, `test_v3_welcome.js` eski 758 yüzey pinini bekliyor; ölçüm 597/759 |
| Panel / panel-v2 | 23/23 PASS · 27/27 PASS |
| Quran | 9/9 PASS |
| Reminder smoke | 21/21 seçili fixture PASS |
| run-seyma driver / zikr harness | PASS · 95/95 assertion PASS |
| Kontrast | 382 çift, eşik altı 0 PASS |
| `kao2-sync-check` | PASS · nextCard KAO2-06, seq24 |

## Ölçümler
- `test_kao_user_tasks.js`: geçiş p50 0.207 ms / max 1.022 ms; içerik gzip 162173 B; kalibrasyon ECE 0.0131; gece oturumu 8 kart.
- Kontrast: 382 çift (açık/koyu tema dâhil), eşik altı 0.

## Bilerek değişen testler
- `tests/kao/test_kao_queue.js`, `test_kao_requirements.js`, `test_kao_user_tasks.js`: cevap ile devamı ayırmak için test akışına `kaoContinue()` eklendi.
- `tests/kao/test_kao_requirements.js`: milestone undo eski “bir kez kazanıldıysa kalır” davranışından, bu paneldeki cevabın tüm etkilerini geri alma davranışına güncellendi.
- Üç izinli FX2 pin testi: KAO2-06 shim'i nedeniyle App yüzeyi 758→759; tıklama sayısı 393 kaldı.
- İki genel uygulama yüzey pin testi değiştirilmedi; yalnız sayısal güncelleme için kapsam onayı gerekecek.

## Durum ve P6
Uygulama ve kart testleri hazır; P3 uygulama ailesi iki kapsam dışı pin nedeniyle kırmızı olduğundan KAO2-06 `blocked` bırakıldı. Öneri: kullanıcı yalnız `tests/app/test_app_surface_daily_boundary.js` ve `tests/app/test_v3_welcome.js` sayısal pinlerini 596→597 / 758→759 eşlemeye kapsam onayı verirse aynı kartı FIX ile açıp bütün P3'ü tekrar çalıştır.

## Kanıt düzeyleri
- Kaynak/test: kart testleri PASS; tam P3 BLOCKED.
- Yayın: yok; release yetkisi KAO2-04'e kadar.
- Cihaz: doğrulanmadı; tarayıcı açılmadı, sunucu başlatılmadı.

## Sürprizler / backlog
- `kuran-ogreniyorum-v2/README.md` eski satırında KAO2-03 sıradaki gösteriliyor; canlı `KAO2-STATE.json`, CURRENT-STATE ve seçili prompt KAO2-06 ile eşleşiyor. README kartın Dokun listesinde olmadığından değiştirilmedi ve senkron kapısını engellemedi.
