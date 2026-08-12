# Handoff — ÆON Panel-v2 Premium — Prompt 28

## Prompt Bilgisi

- **Prompt No:** `28`
- **Prompt Kısa Adı:** `Polling & Telemetry Altyapısı`
- **Uygulayan Ajan:** `OpenAI Codex (GPT-5)`
- **Tarih:** `2026-08-11`
- **Oturum ID:** *(yok)*
- **Başlangıç Commit:** `96d845f`
- **Bitiş Commit:** `bc37559` (metadata commit'i ayrıca)

## Yapılanlar

- [x] Ana görev tamamlandı
- [x] Tüm alt maddeler tamamlandı
- [x] Testler çalıştırıldı
- [x] Commit yapıldı
- [x] Push yapıldı (`bc37559` → `main`)

### Özet

Panel-v2 sistem durumuna token varken çalışan 60 saniyelik otomatik polling ve token yokken kapanan yaşam döngüsü eklendi. Her gerçek fetch için son 20 istek üzerinden p50/p95 latency, son istek süresi, toplam/hata/ardışık hata sayaçları, son başarılı zaman, veri tazeliği ve GitHub rate-limit header telemetrisi tutulup Sistem görünümünde gösteriliyor; 304 yanıtları başarılı kontrol olarak sayılıyor.

### Değiştirilen Dosyalar

- `panel-v2.js` — `syncStatus`, polling lifecycle, latency/rate-limit telemetry, freshness ve sistem metrikleri
- `panel-v2.css` — masaüstünde dört kolonlu sistem canlı metrik grid'i
- `panel-v2.html` — CSS/JS cache-bust `20260811c`
- `tests/helpers/panel-v2-test-helper.js` — deterministic interval fixture desteği
- `tests/test_panel_v2_hit_areas.js` — güncel cache-bust kontratı
- `tests/test_panel_v2_polling_telemetry.js` — Prompt 28 polling/telemetry headless fixture

### Önemli Teknik Kararlar

| Karar | Gerekçe |
|-------|---------|
| Polling yalnızca normalize edilmiş panel token'ı varken başlıyor | Token yokken gereksiz fetch ve sessiz auth hatası üretmemek |
| Latency penceresi son 20 istekle bounded tutuluyor | Uzun oturumlarda sınırsız bellek büyümesini önlemek ve p50/p95'i güncel tutmak |
| 304 yanıtı başarılı fetch olarak kaydediliyor | ETag ile veri değişmese bile bağlantı/sağlık kontrolünün telemetriye yansıması |
| `updateStatus()` mevcut `syncStatus` nesnesini mutate ediyor | Dışarıya export edilmiş status referansını ve telemetry alanlarını korumak |
| Fetch süresi hata, parse ve 304 yollarında da kaydediliyor | Başarılı yanıtlar lehine ölçüm yanlılığını önlemek |

## Test Sonuçları

```text
Çalıştırılan testler:
- node --check panel-v2.js                         → PASS
- node --check panelCoverageManifest.js            → PASS
- node tests/test_panel_v2_tabs.js                → PASS
- node tests/test_panel_v2_system.js              → PASS
- node tests/test_panel_v2_polling_telemetry.js   → PASS
- for f in tests/test_panel_v2_*.js; do node "$f"; done → 16/16 PASS
- node .claude/skills/run-seyma/driver.mjs         → PASS
- git diff --check                                 → PASS
- GitHub Actions Pages run `31474396733`           → SUCCESS
- Pages deployment `5847191031`                   → success
- canlı URL                                       → `https://mustafaras.github.io/s/`
- gerçek tarayıcı testi                            → çalıştırılmadı (data-safety lock)
```

### Hatalar ve Çözümleri

İlk tam suite çalıştırmasında Prompt 27 hit-area fixture'ı eski `panel-v2.css?v=20260811b` beklentisiyle durdu. Ürün cache-bust'i `20260811c` olarak güncellendi ve fixture beklentisi aynı kanonik sürüme taşındı; fail-closed tam suite yeniden çalıştırıldığında 16/16 PASS oldu.

## Sıradaki Adım

- **Bir sonraki prompt:** `29 — Olay Günlüğü Görüntüleyicisi`
- **Tahmini risk:** `data.eventLog.events` okunurken mevcut redaction/provenance ve read-only sınırı korunmalı; olay filtreleri polling state'inden bağımsız tutulmalı.
- **Öneri:** Önce `LEDGER.md` ve bu handoff'u oku; Prompt 29'u yalnızca Sistem sekmesi, `panel-v2` ve ilgili headless fixture kapsamıyla başlat.

## Context / Token Notu

- Bu prompt sonundaki context kullanımı: orta düzey
- `/compact` önerisi: Hayır
- Yeni oturum önerisi: Hayır

## Ek Notlar

- `panel-v2.html` gerçek tarayıcıda açılmadı; tüm doğrulama headless/statik fixture'larla yapıldı.
- `index.html`, `app.js`, `sync.js`, `panel.html`, `panel.js`, `data/` ve `mustafaras/seyma-data` kapsam dışı bırakıldı.
- GitHub Pages deployment kanıtı kaynak/test kanıtından ayrı doğrulandı; kullanıcı cihazı doğrulaması yapılmadı.
