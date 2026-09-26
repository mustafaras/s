# KAO-21 · Devir

**Tarih:** 2026-09-26 · **Doğrulama tabanı:** `0de4d043f15fba09bc37f2bd9895a9c94ed20c82` · **Durum:** done

## Ne yapıldı

- Kapı: IIP main'de (status=done, etkin kart yok) → açık; saygi.js'te değişiklik gerekmedi (bileşim a9fa40c ile zaten vardı).
- `test_kao_independence.js`: `kaoHubCardHTML` yokken `saygiHTML` bayt-eşit, varken tek kez Kur'an Yolculuğu kartının ardından.
- E7 → Görünürlük: kartı gizle/göster; gizliyken uygulama Ayarları → Gizlenen kartlar → “Kur’an Arapçası kartını geri getir”.

## Atlananlar (prompt gereği)

- Kur'an Yolculuğu satırına “kelimelerini öğren” köprüsü ve Esmâ kök notu: başka programların dosyalarına (quran.js, Esmâ) dokunmayı gerektirir. Ayrı onayla yapılabilir.

## Sınırlar

Cihaz kabulü yok.

## Sonraki yetkili eylem

`node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-22`.
