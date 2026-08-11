# Handoff — ÆON Panel-v2 Premium — Prompt 33

## Prompt Bilgisi

- **Prompt No:** `33`
- **Prompt Kısa Adı:** `Ayarlar & Tanı Araçları`
- **Uygulayan Ajan:** `OpenAI Codex (GPT-5)`
- **Tarih:** `2026-08-11`
- **Oturum ID:** *(yok)*
- **Başlangıç Commit:** `39f3900`
- **Bitiş Commit:** `4f0fc1a` (ledger/handoff ve build hash metadata commit'i ayrıca)

## Yapılanlar

- [x] Ana görev tamamlandı
- [x] Tüm alt maddeler tamamlandı
- [x] Testler çalıştırıldı
- [x] Commit yapıldı
- [x] Push yapıldı (`4f0fc1a` → `main`)

### Özet

Ayarlar sekmesi görünüm, polling, tanı, hakkında ve güvenli çıkış kartlarına ayrıldı. Polling 30 saniye, 60 saniye, 5 dakika ve kapalı seçenekleriyle yeniden kurulabilir; otomatik yenileme token varlığına bağlı ve tercihleri yalnızca panel localStorage'ında saklanır. Tanı araçları bağlantı/veri doğrulama, in-memory snapshot/ETag temizleme ve ETag'siz read-only zorla senkron akışlarını çalıştırır; hakkında kartı sürüm, tarih ve feature commit hash'ini gösterir.

### Değiştirilen Dosyalar

- `panel-v2.js` — polling yapılandırması, diagnostic state/actions, `renderSettings()` ve hakkında kartı
- `panel-v2.css` — polling seçenekleri, switch, tanı sonucu, about rows ve mobil düzen
- `panel-v2.html` — CSS/JS cache-bust `20260811h`
- `tests/test_panel_v2_settings.js` — Prompt 33 polling/tanı davranış fixture'ı
- `tests/test_panel_v2_system.js` — settings regression kontratları
- `tests/test_panel_v2_css.js` — settings CSS kontratları
- `tests/test_panel_v2_hit_areas.js` — yeni settings hit-area/cache kontratları
- `PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/LEDGER.md` — Prompt 33 ✅, `currentStep: 34`

### Önemli Teknik Kararlar

| Karar | Gerekçe |
|-------|---------|
| Polling ayarı `configurePolling()` üzerinden yeniden kuruluyor | Aralık değişiminde eski `setInterval` timer'ı kalmamalı; aynı anda tek aktif timer korunmalı |
| Polling tercihi yalnızca panel localStorage'ında tutuluyor | Kullanıcı tercihi korunurken token, snapshot ve Şeyma verisi observer reposuna yazılmıyor |
| Cache temizleme yalnızca in-memory snapshot/ETag alanlarını sıfırlıyor | Geniş CacheStorage veya kullanıcı verisi silme riski açmadan panel tanısını anlamlı tutmak |
| Zorla senkron ETag'i temizleyip `refresh()` çağırıyor | Taze read yapılırken observer inbox veya canlı veri reposuna yazma sınırı korunuyor |
| Tanı sonucu bounded, escaped ve DOM'a güvenli yazılıyor | Hata/diagnostic metni token, GPS veya ham snapshot içeriği sızdırmamalı |

## Test Sonuçları

```text
Çalıştırılan testler:
- node --check panel-v2.js                         → PASS
- node --check panelCoverageManifest.js            → PASS
- node tests/test_panel_v2_system.js              → PASS
- node tests/test_panel_v2_settings.js            → PASS
- for f in tests/test_panel_v2_*.js; do node "$f"; done → 21/21 PASS
- node tests/test_panel_p2_event_log.js            → 11/11 PASS
- node tests/test_panel_p4_provenance.js           → 28/28 PASS
- node .claude/skills/run-seyma/driver.mjs        → PASS
- git diff --check                                 → PASS
- Pages workflow run `31489910967`                 → SUCCESS
- Pages deploy işi                                   → SUCCESS
- canlı HTTP                                       → 200
- canlı cache                                      → `panel-v2.css?v=20260811h`, `panel-v2.js?v=20260811h`
- canlı URL                                        → `https://mustafaras.github.io/s/`
- gerçek tarayıcı testi                            → çalıştırılmadı (data-safety lock)
```

### Hatalar ve Çözümleri

Polling selector'ının `Kapalı` metin değerini kabul etmesi ve settings butonlarının 44px hit-area kontratına girmesi için iki küçük regression düzeltmesi yapıldı. Tanı fixture'ı async GitHub fetch mock'u ile bağlantı ve zorla senkronın ETag davranışını da doğruluyor.

## Sıradaki Adım

- **Bir sonraki prompt:** `34 — Sistem Sekmesi Sub-tab Yeniden Düzenleme`
- **Tahmini risk:** Mevcut 5 sub-tab yapısı zaten aktif; Prompt 34'te yalnızca navigasyon/label kontratını netleştirirken settings state ve polling lifecycle'ı bozmamak gerekir.
- **Öneri:** Önce bu handoff ve güncel `LEDGER.md` satırını oku; Prompt 34 testlerinde 5 sub-tab sırasını ve mevcut `systemSubTab` geçişlerini koru.

## Context / Token Notu

- Bu prompt sonundaki context kullanımı: orta düzey
- `/compact` önerisi: Hayır
- Yeni oturum önerisi: Hayır

## Ek Notlar

- `panel-v2.html` gerçek tarayıcıda açılmadı; UI ve etkileşim doğrulaması headless fixture/VM ile, deploy doğrulaması statik HTTP/cache kontrolüyle yapıldı.
- `data/latest.json`, `data/`, `app.js`, `sync.js`, `panel.html`, `panel.js` ve `mustafaras/seyma-data` kapsam dışı bırakıldı.
- Tanı araçları read-only veya panel in-memory state kapsamındadır; canlı kullanıcı verisine yazma yapılmadı.
- Bir sonraki ajan için bu handoff dosyasının yolu: `PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/handoff-PROMPT-33.md`
