# P3 — FAZ 2: Genel Bakış (Today)

Bu prompt, **Genel Bakış** sekmesini oluşturmak için verilir. Faz 1 tamamlanmış olmalıdır.

## Faz hedefi

Bugünün en önemli sinyallerini (mod, uyku, SOS, adım), son 7 günlük mini trendi ve hızlı not/terapi paylaşımını tek bakışta göstermek.

## Bu fazda ele alınacak görevler

- `2.1` — HeroCard komponenti ve hero grid
- `2.2` — 7 günlük mini trend strip
- `2.3` — Hızlı notlar / terapi paylaşımı kartı
- `2.4` — Tarih seçici (görünüm)
- `2.5` — Genel Bakış render testi

## Önceki faz kontrolü

- `completedTasks` içinde `1.1`, `1.2`, `1.3`, `1.4` var mı?
- `panel-v2.js` içinde `renderToday()` veya benzeri bir fonksiyon var mı?
- Eksik varsa rapor et ve önce P2 çalıştırılmasını öner.

## Yapılacaklar (checklist)

### 2.1 — HeroCard ve hero grid

- `AeCard(props)` fonksiyonu oluştur; `variant` parametresi alır.
- `HeroCard({ icon, title, value, unit, color, trend })` varyantı oluştur.
- Mobil 2x2 grid'de 4 hero kart:
  - **Mod**: bugün `mood.value` (örn. "🌤 Huzurlu")
  - **Uyku**: dün gece `sleep.duration` saat + kalite rozeti
  - **SOS**: bugün `cravingSOSCount` veya `sos.count`
  - **Adımlar**: bugün `health.steps`
- Değer yoksa "—" göster, kart pasif görünümde.

### 2.2 — 7 günlük mini trend strip

- Son 7 gün (dahil bugün) için küçük SVG veya CSS barlar.
- Gösterilecek metrikler: mod puanı, uyku, adım, su.
- Eksik günler boş bar olarak görünür.
- `todayDateOffset(days)` gibi bir yardımcı fonksiyon yaz.

### 2.3 — Hızlı notlar / terapi paylaşımı kartı

- Eğer seçili günde `journal`, `note`, `intention`, `gratitude` veya `therapy.share` varsa L1 summary kart göster.
- Terapi metinleri redacted; yalnızca varlık/kategori gösterilir.
- Yoksa kart tamamen gizlenir.

### 2.4 — Tarih seçici

- Üstte bugün tarihi ve önceki/sonraki gün butonları.
- `ui.date` ISO date string olarak tutulsun.
- Detay açma henüz Gün Detayı sekmesine yönlendirsin: `AeonV2.setTab('day'); AeonV2.setDate(date)`.

### 2.5 — Test fixture

- `tests/test_panel_v2_today.js` yaz.
- Testler:
  - Seeded data ile 4 hero kart değerleri doğru mu?
  - 7 günlük strip 7 bar gösteriyor mu?
  - Terapi paylaşımı redacted mı?
  - Boş data'da `ae-empty` görünür mü?

## Testler

```bash
cd /Users/m_ras/Desktop/seyma
node --check panel-v2.js
node tests/test_panel_v2_today.js
```

## State güncelleme

```json
{
  "completedTasks": ["...", "2.1", "2.2", "2.3", "2.4", "2.5"],
  "nextTaskId": "3.1"
}
```

## Tur raporu formatı

```markdown
## Faz 2 — Tamamlandı

- **İşlenen görevler:** 2.1, 2.2, 2.3, 2.4, 2.5
- **Değiştirilen dosyalar:** panel-v2.js, panel-v2.css, tests/test_panel_v2_today.js
- **Testler:** ✅
- **Sonraki prompt:** P4-FAZ-3-TRENDLER.md
```

## Çıkış kriterleri

- [ ] 4 hero kart render ediliyor ve değerler doğru.
- [ ] 7 günlük strip çalışıyor.
- [ ] Not/terapi kartı redaction kurallarına uygun.
- [ ] Tarih seçici state değiştiriyor.
- [ ] `tests/test_panel_v2_today.js` PASS.
- [ ] `panel-revize-state.json` güncellendi.

---

Sonraki prompt: [P4-FAZ-3-TRENDLER.md](P4-FAZ-3-TRENDLER.md)
