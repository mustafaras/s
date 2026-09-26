# KAO-19 · Devir

**Tarih:** 2026-09-26 · **Doğrulama tabanı:** `4692e96f24a4ecfd6b24ec3697b6b99f5b7ce1bc` · **Durum:** done

## Ne yapıldı

- Uygulama her kayıtta küçük bir `quranLearn.summary` yazar (kapsam %, bilinen kelime, anlaşılan âyet, son çalışma günü, seri, en çok karışan ses sınıfı, bayrak sayısı).
- Manifest `quranLearn` satırı: gözlemciye yalnız bu 9 izinli anahtar çıkar; kartlar, hatalar, telaffuz yanlışları ve kelime kimlikleri çıkmaz. Önceden hepsi olduğu gibi çıkıyordu (sızıntı kapatıldı).
- Panelde “Kur’an Arapçası” bento kartı; veri yokken boş durum, çökme yok.

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| R-C1 | done | projeksiyonda flaggedCount (KAO-14 bayrağı) |
| R-C8 | done | izinli alan listesi dışı anahtar yok (fixture) |

## Sınırlar

Özet, uygulama bir sonraki kaydı yaptığında oluşur; eski veride özet yokken panel boş durum gösterir. Gerçek panel görünümü cihazda doğrulanmadı.

## Sonraki yetkili eylem

`node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-20`.
