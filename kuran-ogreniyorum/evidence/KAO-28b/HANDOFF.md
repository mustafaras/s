# KAO-28b · Devir

**Tarih:** 2026-09-25 · **Doğrulama tabanı:** `59a53d9875790a469c9274218fc071067db2f980` · **Durum:** done

## Ne yapıldı

- E10 Mushaf ısı haritası (`App.kaoOpenMap()`, E1'den “Mushaf ısı haritası”): 114 hücre, her hücrede sûre numarası + anlaşılan yüzde; renk tek taşıyıcı değil.
- Veri yoksa hücre boş; 7 gün sonraki testte 4/5 ve üstü alan sûre koyu (%100 · kesinleşti); 4/5 altı listede “tekrar oku”.
- Eşdeğer metin listesi: veri olan sûreler yüzde, âyet oranı ve test durumuyla; kısa sûre hücreleri okuyucuyu açar.

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| R-B1 | done | render fixture: 114 hücre, aria, boş hücre, liste |
| R-C6 | done | KAO-16 kaydı + harita yansıması (requirements fixture) |

## Sınırlar

Cihaz kabulü yok.

## Sonraki yetkili eylem

`node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-16b`.
