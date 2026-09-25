# KAO-15 · Devir

**Tarih:** 2026-09-25 · **Doğrulama tabanı:** `4e4ec3639ecb221e9e68e20c8e1bed16d680cba0` · **Durum:** done + telaffuz onarımı

## Ne yapıldı

- 20 okunuş sorusu için 18, 12 minimal çift için 10 eşiği olan iki parçalı Seviye 0 kapısı eklendi.
- Ses açılamazsa ikinci bölüm erteleniyor; 18/20 okuma başarısı korunuyor ve T0 ilk ses erişimine bırakılıyor.
- Dondurulmuş `QuranPhonicsV1` kaynağından 12 mini ders üretildi; hiçbir ders üçten fazla yeni ses göstermiyor.
- Saf renkli-hareke sarıcısı fetha, kesra ve dammayı ayrı sınıflara alıyor; etiketler çıkarıldığında Arapça metin birebir aynı kalıyor.
- Satır aralığı `1.9/2.2/2.5`, kelime boşluğu normal/geniş ve renkli hareke ayarı `--kao-ar-*` değişkenleriyle çalışıyor.
- E5 kelime kartında doğrulanmış Latin harfli okunuş ve erişilebilir “Telaffuzu dinle” kontrolü görünür.
- Âyet bağlamları okunuş alanı taşır: Arapça metni alan-sahibi onaylı pilotla tam eşleşen kayıtta âyet okunuşu, diğerlerinde doğrulanmış hedef-kelime okunuşu ve açık doğrulama sınırı gösterilir; hiçbir tam âyet okunuşu uydurulmaz.

## Kontrol sonuçları

- KAO render, migration, requirements, privacy, boundary ve independence fixture'ları → PASS.
- FX2 tab/overlay/touch → 7/7, 7/7, 14/14.
- Driver → PASS; Zikir → 95/95; state-rebind → 37/37; shell → PASS.
- Plan-check → PASS (0 warn); diff-check → exit 0.

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| R-A9 | partial | Davranış ve değişkenler tamam; 3 ton × 2 tema kontrast ölçümü KAO-18'de |

## Kalan sınır

Fiziksel cihaz, VoiceOver ve gerçek ses dinleme kabulü yapılmadı. Kullanıcı 2026-09-25'te KAO-15 ile telaffuz onarımının push/fast-forward merge/Pages yayınını açıkça yetkilendirdi; yayın makbuzu işlem sonunda ayrıca raporlanır.

## Sonraki yetkili eylem

`node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-16` yalnız yeni kullanıcı yetkisiyle uygulanır.
