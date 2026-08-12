# Handoff — ÆON Panel-v2 Premium — Prompt 31

## Prompt Bilgisi

- **Prompt No:** `31`
- **Prompt Kısa Adı:** `Bildirim Yaşam Döngüsü`
- **Uygulayan Ajan:** `OpenAI Codex (GPT-5)`
- **Tarih:** `2026-08-11`
- **Oturum ID:** *(yok)*
- **Başlangıç Commit:** `86eb3f3`
- **Bitiş Commit:** `b23e978` (ledger/handoff metadata commit'i ayrıca)

## Yapılanlar

- [x] Ana görev tamamlandı
- [x] Tüm alt maddeler tamamlandı
- [x] Testler çalıştırıldı
- [x] Commit yapıldı
- [x] Push yapıldı (`b23e978` → `main`)

### Özet

Mesajlar sekmesi artık `PanelCoverageV1.notificationEventProjection` üzerinden güvenli bildirim kayıtlarını seçilebilir mesaj listesi ve beş aşamalı lifecycle timeline olarak gösteriyor: oluşturuldu → gönderildi → cihaza ulaştı → okundu/görüldü → yanıtlandı. Her aşamada saat, tamamlandı/current/bekliyor dot durumu ve toplam süre görünür; eksik aşamalar fail-safe kalıyor.

Observer composer, mesajları yalnızca ayrı `data/observer-inbox.json` Contents API dosyasına GET+merge+PUT ile yazar. Token PUT gövdesine taşınmıyor, localhost/file/`*.local` originlerinde yazım fail-closed, 409/422 yarışları iki bounded retry ile çözülüyor; gerçek kullanıcı veri deposuna veya canlı inbox’a bu oturumda yazılmadı.

### Değiştirilen Dosyalar

- `panelCoverageManifest.js` — sent/replied alanları ve gönderildi/yanıtlandı projection aşamaları; public projection export'ları
- `panel-v2.js` — mesaj listesi, lifecycle timeline, süre/durum yardımcıları, composer ve güvenli observer-inbox transport
- `panel-v2.css` — mesaj seçici, timeline dot/line, detay ve composer responsive yüzeyleri
- `panel-v2.html` — CSS/manifest/JS cache-bust `20260811f` / `20260811b` / `20260811f`
- `tests/test_panel_v2_notification_lifecycle.js` — canonical projection, beş aşama, redaction, send ve conflict retry fixture'ı
- `tests/test_panel_v2_css.js` — lifecycle/composer CSS kontratları
- `tests/test_panel_v2_hit_areas.js` — yeni cache-bust kontratı
- `tests/test_panel_v2_system.js` — Mesajlar tabı timeline/composer regression kontratı
- `PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/LEDGER.md` — Prompt 31 ✅, `currentStep: 32`

### Önemli Teknik Kararlar

| Karar | Gerekçe |
|-------|---------|
| Timeline yalnızca `PanelCoverageV1.notificationEventProjection` çıktısını kullanıyor | Redaction/provenance sözleşmesini UI katmanında yeniden uygulamamak ve ham hata metni sızdırmamak |
| UI beş sabit aşama gösteriyor; `inbox` gibi ek projection olayları listeye taşınmıyor | Kullanıcı isteğindeki yaşam döngüsünü sade ve karşılaştırılabilir tutmak; canonical projection yine korunuyor |
| Mesaj gönderimi `data/observer-inbox.json` ile sınırlı | `data/latest.json` full-replace zincirine dokunmadan observer→Şeyma iletişim kanalı sağlamak |
| Yerel origin yazımı forceSync olmadan engelleniyor | Stale localStorage/token ile yanlışlıkla canlı repo yazılmasını önlemek |

## Test Sonuçları

```text
Çalıştırılan testler:
- node --check panel-v2.js                         → PASS
- node --check panelCoverageManifest.js            → PASS
- node tests/test_panel_v2_notification_lifecycle.js → 22/22 PASS
- node tests/test_panel_v2_system.js              → PASS
- node tests/test_panel_v2_css.js                 → PASS
- node tests/test_panel_v2_hit_areas.js           → PASS
- for f in tests/test_panel_v2_*.js; do node "$f"; done → 19/19 PASS
- node tests/test_panel_p4_provenance.js          → 28/28 PASS
- node .claude/skills/run-seyma/driver.mjs        → PASS
- git diff --check                                 → PASS
- Pages workflow run `31485940071`                 → SUCCESS
- Pages deployment `5849363881`                    → success
- canlı HTTP                                       → 200
- canlı cache                                      → `panel-v2.css?v=20260811f`, `panel-v2.js?v=20260811f`
- canlı URL                                        → `https://mustafaras.github.io/s/`
- gerçek tarayıcı testi                            → çalıştırılmadı (data-safety lock)
```

### Hatalar ve Çözümleri

İlk send fixture'ında mock `fetch` senkron exception'ı Promise zincirine girmeden dışarı çıkabiliyordu; append çağrısı `Promise.resolve().then(...)` ile güvenli async sınırına alındı. Ayrıca lifecycle mesaj id'si inline handler'a aktarılırken backslash/tırnak/yeni satır karakterleri `inlineArg` ile sınırlandı. Local origin guard ve token redaction transport fixture'ında doğrulandı.

## Sıradaki Adım

- **Bir sonraki prompt:** `32 — Sıra Denetimi & Revizyon Geçmişi`
- **Tahmini risk:** Event sequence/revision drawer mevcut `PanelCoverageV1` event sözleşmesiyle uyumlu tutulmalı; bildirim timeline'ı ayrı bir lifecycle görünümü olarak korunmalı.
- **Öneri:** Önce bu handoff ve güncel `LEDGER.md` satırını oku; Prompt 32'yi yalnızca sequence audit/revision geçmişi kapsamında uygula ve Prompt 31 composer'ını yeniden tasarlama.

## Context / Token Notu

- Bu prompt sonundaki context kullanımı: orta düzey
- `/compact` önerisi: Hayır
- Yeni oturum önerisi: Hayır

## Ek Notlar

- `panel-v2.html` gerçek tarayıcıda açılmadı; tüm UI doğrulaması headless fixture/statik kaynak incelemesiyle yapıldı.
- `data/latest.json`, `data/`, `app.js`, `sync.js`, `panel.html`, `panel.js` ve `mustafaras/seyma-data` kapsam dışı bırakıldı.
- Pages workflow/deployment kanıtı kaynak/test kanıtından ayrı doğrulandı; kullanıcı cihazı doğrulaması yapılmadı.
- Bir sonraki ajan için bu handoff dosyasının yolu: `PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/handoff-PROMPT-31.md`
