# KAO-14 · Devir

**Tarih:** 2026-09-24 · **Doğrulama tabanı:** `7012caed3d349c6d2dfd56060549445b0907d511` · **Durum:** done

## Ne yapıldı

- E4, kilitsiz 12 üniteyi ilerleme ve sıra önerisiyle gösteriyor.
- Kur'an Yolculuğu rozeti yalnız mevcut `watched`/`question_opened` durumunu okuyor; yolculuk verisine yazmıyor.
- E5 ilk açılışta yalnız Arapça, ses ve Türkçe; ikinci dokunuşta kök ağacı ve kalıp etiketli Türkçe akrabalar; üçüncü dokunuşta üç Kur'an örneği ve sonraki tekrar bilgisini gösteriyor.
- İçerik bayrağı yalnız sınırlı türleri `cards[id].flagged={at,kind}` biçiminde kaydediyor; serbest metin kabul etmiyor.
- K10 kapsam boşluğu onarıldı; FX2 sabit yüzeyi 730 `App.*` / 392 `onclick` olarak doğrulandı.

## Kontrol sonuçları

- KAO render ve requirements fixture'ları → exit 0.
- FX2 tab/overlay/touch fixture'ları → 7/7, 7/7, 14/14.
- Driver → exit 0; Zikir harness → 95/95; state-rebind → 37/37.
- Shell inventory → PASS, `app.js` 7800 satır.
- Plan-check → PASS (0 warn); `git diff --check` → exit 0.

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| R-A8 | met | 73 kökün kalıp etiketli türevleri; ≥60 fixture kapısı |
| R-B3 | met | Üç katmanın aynı anda DOM'da bulunmadığı fixture |
| R-B7 | met | Kognat kaymasında ton + simge + “dikkat” metni |
| R-C1 | partial | Kart bayrağı tamam; panel `flaggedCount` KAO-19'a ait |

## Kalan sınır

Fiziksel cihaz, VoiceOver ve gerçek ses dinleme kabulü ajan tarafından yapılmadı. Panel bayrak sayısı KAO-19 kapsamındadır.

## Sonraki yetkili eylem

Teslimat makbuzları doğrulandıktan sonra `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-15` ile yalnız KAO-15 uygulanır.
