# Handoff — ÆON Panel-v2 Premium — Prompt 34

## Prompt Bilgisi

- **Prompt No:** `34`
- **Prompt Kısa Adı:** `Sistem Sekmesi Sub-tab Yeniden Düzenleme`
- **Uygulayan Ajan:** `OpenAI Codex (GPT-5)`
- **Tarih:** `2026-08-11`
- **Oturum ID:** *(yok)*
- **Başlangıç Commit:** `dfdd83c`
- **Bitiş Commit:** `8542b66` (ledger/handoff ve build hash metadata commit'i ayrıca)

## Yapılanlar

- [x] Ana görev tamamlandı
- [x] Tüm alt maddeler tamamlandı
- [x] Panel-v2 testleri çalıştırıldı
- [x] Commit yapıldı
- [x] Push yapıldı (`8542b66` → `main`)

### Özet

Sistem sekmesi tek bir `SYSTEM_SUB_TABS` kaynağından `Durum → Olaylar → Denetim → Mesajlar → Ayarlar` sırasını üretir ve her seçimi doğru render fonksiyonuna bağlar. Generic `SubTabs()` helper'ı sistem için benzersiz tab/panel ID'leri, `aria-controls`, `aria-labelledby` ve erişilebilir tablist etiketi üretir. Sub-tab değişimi yalnızca seçim anında `system-panel--subtab-enter` sınıfını ekler; bir sonraki renderda temizlenir ve reduced-motion ortamında animasyon kapanır.

### Değiştirilen Dosyalar

- `panel-v2.js` — `SYSTEM_SUB_TABS`, erişilebilir `SubTabs()`, `setSystemSubTab()`, `renderSystem()` ve export
- `panel-v2.css` — `aeSystemSubtabEnter` ve reduced-motion istisnası
- `panel-v2.html` — CSS/JS cache-bust `20260811i`
- `tests/test_panel_v2_system.js` — Denetim etiketi, ARIA bağları ve geçiş regression kontratları
- `tests/test_panel_v2_system_subtabs.js` — Prompt 34 kanonik sıra/panel/animasyon fixture'ı
- `tests/test_panel_v2_css.js` — sub-tab animasyon/reduced-motion CSS kontratları
- `tests/test_panel_v2_hit_areas.js` — cache-bust kontratı
- `tests/test_panel_v2_settings.js` — hakkında kartı feature commit hash kontratı
- `PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/LEDGER.md` — Prompt 34 ✅, `currentStep: 35`

### Önemli Teknik Kararlar

| Karar | Gerekçe |
|-------|---------|
| Sub-tab listesi `SYSTEM_SUB_TABS` ile tek kaynaktan yönetiliyor | Setter validasyonu, label sırası ve render eşlemeleri drift etmemeli |
| Sistem tabları benzersiz panel ID'leriyle render ediliyor | `aria-controls`/`aria-labelledby` bağı ve headless doğrulanabilir DOM sözleşmesi sağlanıyor |
| Geçiş state'i `systemSubTabTransition` ile tek render tüketiliyor | Polling veya normal re-render sırasında animasyonun sürekli tekrarlaması engelleniyor |
| Animasyon `transform/opacity` ile 0.22 saniye ve reduced-motion kapısı ile uygulanıyor | Hafif, layout reflow oluşturmayan ve kullanıcı hareket tercihine saygılı geçiş |
| `Denetim` etiketi kullanılıyor, internal id `audit` korunuyor | Türkçe kullanıcı yüzeyi ile mevcut audit render/route sözleşmesi birlikte korunuyor |

## Test Sonuçları

```text
Çalıştırılan testler:
- node --check panel-v2.js                         → PASS
- node --check panelCoverageManifest.js            → PASS
- for f in tests/test_panel_v2_*.js; do node "$f"; done → 22/22 PASS
- node tests/test_panel_p2_event_log.js            → 11/11 PASS
- node tests/test_panel_p4_provenance.js           → 28/28 PASS
- node .claude/skills/run-seyma/driver.mjs        → PASS
- git diff --check                                 → PASS
- tüm tests/test_*.js                              → 51/54 PASS
  - 3 known legacy failures: test_panel_p5_responsive_a11y.js,
    test_panel_p6_qa_release.js, test_quran_panel_parity.js
  - Bunlar değişiklik kapsamı dışındaki eski panel.html/panel.js ve
    quran parity cache sürümü beklentileridir; Panel-v2 kaynaklarına bağlı değildir.
- Pages workflow run `31495640851`                         → SUCCESS
- Pages deploy işi                                           → SUCCESS
- canlı HTTP                                               → 200
- canlı cache                                              → `panel-v2.css?v=20260811i`, `panel-v2.js?v=20260811i`
- canlı URL                                                → `https://mustafaras.github.io/s/`
- gerçek tarayıcı testi                                    → çalıştırılmadı (data-safety lock)
```

### Hatalar ve Çözümleri

İlk genel suite çalıştırmasında Prompt 33 fixture'ı eski `9ad1ad3` hakkında hash'ini bekliyordu; feature commit `8542b66` ile hizalandı. Üç legacy testteki cache beklentileri bu Prompt kapsamına girmeyen `panel.html/panel.js` ve eski quran parity sözleşmelerine ait olduğu için kaynak dosyalara dokunulmadı.

## Sıradaki Adım

- **Bir sonraki prompt:** `35 — Polling & Telemetry Testleri`
- **Tahmini risk:** Polling altyapısı Prompt 33’te çalışıyor; Prompt 35 testleri interval yeniden kurulumunu, timer cleanup'ı, ETag/304 davranışını ve visibility/input sınırlarını birlikte korumalı.
- **Öneri:** Önce bu handoff ve güncel `LEDGER.md` satırını oku; Panel-v2 testlerini 22+ fixture olarak çalıştır, legacy 3 cache failure'ını Panel-v2 kabul kapısıyla karıştırma.

## Context / Token Notu

- Bu prompt sonundaki context kullanımı: orta düzey
- `/compact` önerisi: Hayır
- Yeni oturum önerisi: Hayır

## Ek Notlar

- `panel-v2.html` gerçek tarayıcıda açılmadı; UI doğrulaması headless fixture/VM, deploy doğrulaması statik HTTP/cache kontrolüyle yapıldı.
- `data/latest.json`, `data/`, `app.js`, `sync.js`, `panel.html`, `panel.js` ve `mustafaras/seyma-data` kapsam dışı bırakıldı.
- Kullanıcı verisine yazma yapılmadı; sub-tab geçişi yalnızca UI state/render sınırında kaldı.
- Bir sonraki ajan için bu handoff dosyasının yolu: `PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/handoff-PROMPT-34.md`
