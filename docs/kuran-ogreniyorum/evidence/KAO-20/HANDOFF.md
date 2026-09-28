# KAO-20 · Devir

**Tarih:** 2026-09-26 · **Doğrulama tabanı:** `9f604a873923319f162d60309ec1b21a82a47cd2` · **Durum:** done

## Ne yapıldı

- `tests/kao/test_kao_user_tasks.js`: R-C9 üç görev (a/b/c), görev geçişi süresi, içerik boyutu, tohumlu 6 haftalık kalibrasyon simülasyonu, gece tekrarı + istatistik senaryosu; `--report` ölçüm JSON'u verir.
- `deliverables/KAO-REGRESYON.md`: tüm aileler komut/sayı/sonuç, ölçümler, bilinen sınırlar.
- Eksik tamamlandı: R-A1 gece oturumu (≤8 tekrar, sayaç, ertesi tekrar karşılaştırması) ve R-A3 bantlı kalibrasyon + E1 İstatistik ekranı.

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| R-A1 | done (headless) | gece senaryosu; gerçek etki kullanım verisiyle |
| R-A3 | done | bantlı kayıt + İstatistik + simülasyon tablosu |
| R-C5 | partial | geçiş/preload PASS; içerik gzip 159,9 KB > 130 KB — karar bekliyor |
| R-C9 | partial | headless PASS; cihaz kabulü KAO-22/kullanıcı |

## Karar bekleyen

İçerik boyutu bütçesi: (1) bütçeyi ~160 KB'a güncelle, (2) kelime başına 2 örnek, (3) örnekleri kelime kartında yüklenen ayrı modüle böl.

## Sonraki yetkili eylem

`node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-21`.
