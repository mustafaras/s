# Handoff — ÆON Panel-v2 Premium — Prompt 32

## Prompt Bilgisi

- **Prompt No:** `32`
- **Prompt Kısa Adı:** `Sıra Denetimi & Revizyon Geçmişi`
- **Uygulayan Ajan:** `OpenAI Codex (GPT-5)`
- **Tarih:** `2026-08-11`
- **Oturum ID:** *(yok)*
- **Başlangıç Commit:** `8e96576`
- **Bitiş Commit:** `9ad1ad3` (ledger/handoff metadata commit'i ayrıca)

## Yapılanlar

- [x] Ana görev tamamlandı
- [x] Tüm alt maddeler tamamlandı
- [x] Testler çalıştırıldı
- [x] Commit yapıldı
- [x] Push yapıldı (`9ad1ad3` → `main`)

### Özet

Denetim sekmesine canonical `PanelCoverageV1.eventSequenceAudit` kullanan sıra denetimi eklendi. Event kayıtları UI listesinin ters sırasından bağımsız olarak kronolojik kopyada denetleniyor; out-of-order olay, gerçek sequence gap eksik olay sayısı ve duplicate sequence ayrı metrikler olarak, sorunlu cihaz/sequence aralıklarıyla detay raporda gösteriliyor.

Revizyon geçmişi event metadata’sındaki güvenli `snapshotRevision` hash’lerini tekilleştirip son 20 kayıtla sınırlandırıyor. Güncel `syncStatus.snapshotRevision` ayrıca “Güncel” olarak işaretleniyor; event/revision yoksa panel güvenli boş durum gösteriyor. Ham event summary, token ve GPS benzeri içerik DOM’a taşınmıyor.

### Değiştirilen Dosyalar

- `panel-v2.js` — `auditSequenceReport`, sıra issue metinleri, sıra denetimi kartı, revision history render’ı ve helper export’ları
- `panel-v2.css` — sıra metrikleri, detay issue listesi, revision rows ve mobil responsive düzen
- `panel-v2.html` — CSS/JS cache-bust `20260811g`
- `tests/test_panel_v2_audit.js` — canonical out-of-order/gap/duplicate ve revision history fixture’ı
- `tests/test_panel_v2_css.js` — audit kartı CSS kontratları
- `tests/test_panel_v2_hit_areas.js` — cache-bust kontratı
- `tests/test_panel_v2_system.js` — audit sequence/revision regression kontratları
- `PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/LEDGER.md` — Prompt 32 ✅, `currentStep: 33`

### Önemli Teknik Kararlar

| Karar | Gerekçe |
|-------|---------|
| `eventSequenceAudit` kronolojik kopya üzerinde çağrılıyor | Panel event listesi en yeni olaydan eskiye render edildiği için görsel sıralama audit sonucunu kirletmemeli |
| Eksik olay sayısı `sequence_gap` aralığından `to - from - 1` olarak hesaplanıyor | Tek gap sinyali ile gerçek atlanan sequence adedini birbirinden ayırmak |
| Revision geçmişi yalnızca güvenli hash ve metadata gösteriyor | Snapshot revision’ı görünür kılarken raw event summary/token/GPS sızıntısını engellemek |
| Event/revision yokluğu boş durum olarak render ediliyor | İlk kurulum veya geçici event-file eksikliğini hata gibi göstermemek |

## Test Sonuçları

```text
Çalıştırılan testler:
- node --check panel-v2.js                         → PASS
- node --check panelCoverageManifest.js            → PASS
- node tests/test_panel_p2_event_log.js           → 11/11 PASS
- node tests/test_panel_v2_audit.js               → 17/17 PASS
- for f in tests/test_panel_v2_*.js; do node "$f"; done → 20/20 PASS
- node tests/test_panel_p4_provenance.js          → 28/28 PASS
- node .claude/skills/run-seyma/driver.mjs        → PASS
- git diff --check                                 → PASS
- Pages workflow run `31487032434`                 → SUCCESS
- Pages deploy işi                                   → SUCCESS
- canlı HTTP                                       → 200
- canlı cache                                      → `panel-v2.css?v=20260811g`, `panel-v2.js?v=20260811g`
- canlı URL                                        → `https://mustafaras.github.io/s/`
- gerçek tarayıcı testi                            → çalıştırılmadı (data-safety lock)
```

### Hatalar ve Çözümleri

İlk fixture revision row sayımında CSS alt sınıfları ana row sınıfıyla eşleşiyordu; test selector’ı yalnızca gerçek `audit-revision-row` item’larını sayacak şekilde sınırlandı. Boş event fixture’ında revision listesi yerine güvenli empty state beklenmesi de regression sözleşmesine eklendi.

## Sıradaki Adım

- **Bir sonraki prompt:** `33 — Ayarlar & Tanı Araçları`
- **Tahmini risk:** Polling ayarları mevcut `pollingState` ve conditional fetch davranışıyla uyumlu tutulmalı; tanı araçları gerçek veri yazma sınırlarını açmamalı.
- **Öneri:** Önce bu handoff ve güncel `LEDGER.md` satırını oku; Prompt 33’te polling seçeneklerini ayrı ephemeral panel ayarı olarak tasarla ve `data/latest.json`/observer inbox yazma sınırlarını koru.

## Context / Token Notu

- Bu prompt sonundaki context kullanımı: orta düzey
- `/compact` önerisi: Hayır
- Yeni oturum önerisi: Hayır

## Ek Notlar

- `panel-v2.html` gerçek tarayıcıda açılmadı; UI doğrulaması headless fixture ve statik canlı cache kontrolüyle yapıldı.
- `data/latest.json`, `data/`, `app.js`, `sync.js`, `panel.html`, `panel.js` ve `mustafaras/seyma-data` kapsam dışı bırakıldı.
- Pages workflow/deploy işi ve canlı HTTP kanıtı kaynak/test kanıtından ayrı doğrulandı; kullanıcı cihazı doğrulaması yapılmadı.
- Bir sonraki ajan için bu handoff dosyasının yolu: `PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/handoff-PROMPT-32.md`
