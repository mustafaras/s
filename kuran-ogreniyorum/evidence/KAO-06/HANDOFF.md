# KAO-06 · Devir

**Tarih:** 2026-09-24 · **Başlangıç HEAD:** `0f7ce3b7b47fcd7db390b4ae274de2b96cd18217` · **Durum:** done

## Ne yapıldı

- Tek ağsız ve hash-pimli `tools/kao-content-freeze.mjs` aracı üç eksik dondurma komutunun sahibi oldu.
- `QuranGrammarV1`: 25 kavram (G0.5 + G1–G24), tablolar, 86 görev şablonu ve Ünite 11'in 73 kök/242 Türkçe türevi.
- `QuranShortSurahsV1`: 95–114 arasındaki 20 sûre, 618/618 kelime, pinned Tanzil'de bu sûrelerde bulunan 6/6 vakıf işareti ve sekiz aşamalı `prayerTexts`.
- `QuranPhonicsV1`: 28 harf, 12 minimal çift, 7 okuma kuralı ve 28 anahtarlı okunuş/DİA tabloları.
- GAP-07 ölçümle kapandı: 190 sûre tokenı ana 524 lemma dışında olduğundan yanlış eşleme yapılmadı; kaynak kayıtlı tamamlayıcı lemma dizini ve birleşik `lemmaById()` çözümleyicisi kullanıldı.
- Üç modül `index.html`, driver, zikr harness ve state-rebind listelerine aynı sırada eklendi; tarayıcı cache sürümü `20260924b` oldu.

## Doğrulama

- Modül boyutları: 47.442 / 75.678 / 9.552 bayt; bütçeler: 60 / 90 / 40 KiB.
- Art arda iki üretimde üç modülün SHA-256 değerleri değişmedi.
- KAO içerik fixture'ı PASS; sözlük fixture'ı ana 524 lemma ve 618 sûre bağlantısının tamamında PASS.
- Driver PASS; zikr harness 95/95; state-rebind 37/37; shell-inventory PASS; plan-check PASS; diff-check temiz.

## Kalan sınırlar

- R-A6'nın renkli/dokunulabilir vakıf arayüzü KAO-16'ya, R-B2'nin ekranı KAO-16b'ye aittir; bu nedenle ikisi `partial`dır.
- Gerçek cihaz kabulü yapılmadı.
- KAO-06 için push, merge, tag veya deploy yapılmadı.

## Sonraki yetkili eylem

Sıradaki kart KAO-07'dir; bu devir KAO-07 uygulaması veya yayın için yetki vermez.
