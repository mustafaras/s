# KAO2-06 — Geri bildirim paneli ve Devam
Tarih: 2026-09-28 · Dal: kao2-yeniden-tasarim · Önceki commit: 2c94f1d404a3543c70e9d62415a464e783fa2649

## Yapılan
- `kaoAnswer` FSRS ve günlük sayaç etkilerini cevap anında yazar, görev indeksini sabit tutar ve tüm görev türlerinde geri bildirim paneli açar. Doğru/yanlış/soluk şıklar kilitlenir; doğru cevap ve varsa kognat açıklaması gösterilir.
- `kaoContinue()` paneli kapatır, indeksi artırır, sonraki görevi çizer ve otomatik ses davranışını korur. `kaoUndo()` panel açıkken cevap etkilerini geri yükler; üç saniyelik zaman aşımı yoktur. `order` ara seçimleri panel açmaz, son seçim açar.
- `autoAdvance` migration/ensure yolunda `false` varsayılanıdır; yalnız ayar açık ve cevap doğruysa sahte saatte 900 ms sonra devam eder.
- İlerleme çubuğu görev başına taşındı; erişilebilir “n / toplam” bilgisi kaldı. Basılı tutarak dinleme korundu, “Doğal hız” ikincil düğmesi eklendi.
- `app.js` içinde yalnız `App.kaoContinue` shim'i eklendi. App function assignment sayısı 596→597, benzersiz App yüzeyi 758→759 oldu.

## TDD
- Kırmızı: `node tests/kao/test_kao2_feedback.js` → `AssertionError: cevap indeks artırmadan geri bildirimde kalmalı` (`1 !== 0`).
- Yeşil: `node tests/kao/test_kao2_feedback.js` → `KAO2-06 feedback PASS`.
- Blokajın kırmızısı: `test_app_surface_daily_boundary.js` eski 596 atama/758 yüzey pininde; `test_v3_welcome.js` eski 758 pininde başarısız oldu. “Blocked sorununu çöz” talebiyle yalnız bu iki dosyadaki sayısal beklentiler ölçülen 597/759 değerlerine güncellendi.
- Pin düzeltme sonrası hedefli PASS: günlük App surface **19/19**, v3 karşılama **287 kontrol**.
- Etkilenen KAO beklentileri: cevap sonrası otomatik indeks artışı yerine açık `kaoContinue()`; undo artık milestone etkisini de geri alıyor. Kognat/link cevabı mevcut fixture'ın HTML escape bağımlılıkları nedeniyle panel model alanından sınanıyor; gerçek HTML metni yeni fixture'da doğrulanıyor.

## Kapılar (P3)
| Kapı | Sonuç |
|---|---|
| Sözdizimi: quranLearn.js, quranLearnViews.js, app.js | PASS |
| KAO testleri | 22/22 PASS |
| Uygulama testleri | 77/77 PASS |
| Panel / panel-v2 | 23/23 PASS · 27/27 PASS |
| Quran | 9/9 PASS |
| Reminder smoke | 21 seçili fixture PASS |
| run-seyma driver / zikr harness | PASS · 95/95 assertion PASS |
| Kontrast | 382 çift, eşik altı 0 PASS |
| `kao2-sync-check` | PASS · nextCard KAO2-07, seq26 |

## Ölçümler
- `test_kao2_perf_budget.js`: içerik gzip 158.372 KiB · runtime 54.923 KiB · CSS 7.460 KiB · VM p95 4.318 ms.
- `test_kao_user_tasks.js`: geçiş p50 0.134 ms / max 0.907 ms; içerik gzip 162173 B; kalibrasyon ECE 0.0131; gece oturumu 8 kart.
- App KAO function shim sayısı: 38. Kontrastta 382 çift (açık/koyu tema dâhil), eşik altı 0.

## Bilerek değişen testler
- `tests/kao/test_kao_queue.js`, `test_kao_requirements.js`, `test_kao_user_tasks.js`: cevap ile devamı ayırmak için test akışına `kaoContinue()` eklendi.
- `tests/kao/test_kao_requirements.js`: milestone undo eski “bir kez kazanıldıysa kalır” davranışından, bu paneldeki cevabın tüm etkilerini geri alma davranışına güncellendi.
- Üç izinli FX2 pin testi ve `tests/app/test_app_surface_daily_boundary.js`: KAO2-06 shim'i için ölçülen 597/759 App yüzeyini bekler. `tests/app/test_v3_welcome.js` App yüzeyini 759 bekler. Tıklama sayısı 393 kaldı.

## Blokaj çözümü ve durum
- Önceki seq24 P6 kaydı, izinli kapsam onayı gelene kadar değişmeden kaldı. Seq25 FIX kaydıyla iki sayısal uygulama pini eşlendi; hedefli ve tam P3 yeniden PASS oldu. Seq26 CARD kaydıyla KAO2-06 `done` kapandı.
- P3 paralel koşusunda performans ölçümü 7.904 ms, ilk izole tekrarda 6.468 ms ölçülüp eşik aşıldı; sonraki izole ölçüm 4.318 ms PASS verdi ve seri KAO ailesi 22/22 PASS tamamlandı.

## Kanıt düzeyleri
- Kaynak/test: tam P3 PASS.
- Yayın: yok; release yetkisi KAO2-04'e kadar.
- Cihaz: doğrulanmadı; tarayıcı açılmadı, sunucu başlatılmadı.

## Sürprizler / backlog
- `kuran-ogreniyorum-v2/README.md` eski satırında KAO2-03 sıradaki gösteriliyor; canlı `KAO2-STATE.json`, CURRENT-STATE ve seçili prompt şimdi KAO2-07'ye ilerledi. README kartın Dokun listesinde olmadığından değiştirilmedi; senkron kapısını engellemedi.
