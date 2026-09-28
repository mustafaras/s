# KAO-25 · Devir

**Tarih:** 2026-09-23 · **Başlangıç HEAD:** `3113d3c0eb16d327481987ec1ba333f807e80f7c` · **Durum:** done

## Ne yapıldı

- Denetleyicide gömülü duran 13 self-test vakası `kao-plan-check.test.mjs` dosyasına taşındı.
- IIP dosyasına yazan KAO commit'i, `SeyAudio.say` ve prompt başlık sırası kayması için üç regresyon eklendi; toplam 16 vaka doğrudan ve `--self-test` üzerinden geçiyor.
- Kapsam ihlali mesajına kart kimliği, ihlal eden dosya ve izinli kapsam desenleri eklendi.
- `--card` çıktısı `dependencyStatuses`, `gateStatus` ve bunlardan türetilen `startable` alanlarını veriyor.
- STATE/CURRENT-STATE/LEDGER KAO-25 kapanışı ve sıradaki kart KAO-02 olacak şekilde eşitlendi.

## Kontrol sonuçları

- `node --check kuran-ogreniyorum/tools/kao-plan-check.mjs` → exit 0
- `node --check kuran-ogreniyorum/tools/kao-plan-check.test.mjs` → exit 0
- `node kuran-ogreniyorum/tools/kao-plan-check.test.mjs` → exit 0 → 16/16 PASS
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs --self-test` → exit 0 → 16/16 PASS
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-02` → exit 0 → `startable=true`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs` → exit 0 → PASS (0 warn)
- `node tests/quran/test_quran_catalog.js` → exit 0 → 70/70 PASS
- `git -c core.fsmonitor=false diff --check` → exit 0

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| — | n/a | KAO-25 bağlayıcı R-id kapatmaz. |

## Kalan iş / bilinen sınır

- Üretim dosyası, canlı veri, uzak depo veya cihaz davranışı değiştirilmedi.
- Push, merge, tag ve deploy yapılmadı.

## Sonraki yetkili eylem

KAO-02 bağımlılık ve kapı bakımından başlanabilir; bu oturumda başlatılmadı. Yeni kullanıcı yetkisiyle yalnız KAO-02 ele alınır.
