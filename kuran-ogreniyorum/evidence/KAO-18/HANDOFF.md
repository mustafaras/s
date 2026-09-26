# KAO-18 · Devir

**Tarih:** 2026-09-26 · **Doğrulama tabanı:** `e578ae0ecca1c22ae8208afb24706cee3f74ec9e` · **Durum:** done

## Ne yapıldı

- : KAO yüzeyinin tüm metin renklerini açık/koyu temada WCAG ile ölçer (322 ölçüm, 0 hata).
- Yayındaki sürümde bulunan 34 düşük kontrast düzeltildi; en ağırı koyu temada neredeyse görünmeyen altın etiketlerdi (1,1:1).
- 3 hareke tonu × 2 tema, odak halkası, 44 px hedefler ve %200/320 px yeniden akış (statik) render fixture'ında sabit.

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| R-A9 | done | ayarlar (KAO-15/17) + 3 ton × 2 tema kontrast ölçümü |

## Sınırlar

Yeniden akış tarayıcıda değil CSS üzerinden statik denetlendi; cihazda %200 metin ve VoiceOver kabulü kullanıcıda.

## Sonraki yetkili eylem

`node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-19`.
