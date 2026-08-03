# P2 — FAZ 1: Sekme iskeleti ve topbar

Bu prompt, ÆON panelin **5 ana sekmesini** ve üst topbar'ı oluşturmak için verilir. Faz 0 tamamlanmış olmalıdır.

## Faz hedefi

Kullanıcının 5 ana görünüm arasında geçiş yapabileceği bir iskelet kurmak ve topbar'da teknik durumu tek rozette göstermek.

## Bu fazda ele alınacak görevler

- `1.1` — 5 ana sekme iskeleti
- `1.2` — Topbar: marka, tek status badge, eylemler
- `1.3` — Placeholder içerik ve boş durum dili
- `1.4` — Sekme geçiş test fixture'ı

## Önceki faz kontrolü

Başlamadan önce şunları doğrula:
- `PANEL-REVIZE-PLANI/panel-revize-state.json` içinde `completedTasks` dizisi `0.1`, `0.2`, `0.3`, `0.4`, `0.5` içeriyor mu?
- `panel-v2.html`, `panel-v2.css`, `panel-v2.js` dosyaları var mı?
- `window.AeonV2` export ediliyor mu?

Eksik varsa, durumu rapor et ve kullanıcıya "Önce P1-FAZ-0-HAZIRLIK.md çalıştırılmalı" de.

## Yapılacaklar (checklist)

### 1.1 — 5 ana sekme iskeleti

- `panel-v2.js` içinde sekme listesini tanımla:
  ```js
  var TABS = [
    { id: 'today', label: 'Genel Bakış', icon: '◐' },
    { id: 'trends', label: 'Trendler', icon: '◑' },
    { id: 'day', label: 'Gün Detayı', icon: '◎' },
    { id: 'archives', label: 'Arşivler', icon: '◈' },
    { id: 'system', label: 'Sistem', icon: '◉' }
  ];
  ```
- Her sekme için ayrı render fonksiyonu: `renderToday()`, `renderTrends()`, `renderDay()`, `renderArchives()`, `renderSystem()`.
- `render()` ana fonksiyonu: `aeTopbar()`, `aeTabs()`, aktif sekme render'ını birleştir.
- ARIA: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`.

### 1.2 — Topbar

- `.ae-topbar` oluştur.
- Sol: ÆON markası (metin veya minimal logo).
- Orta/sağ: **tek** status badge (senkron durumu).
- Sağ: yenile butonu, çıkış/logout butonu.
- Yoğunluk seçiciyi Sistem sekmesine bırak (burada sadece yer tutucu olarak gösterme).

### 1.3 — Placeholder içerik

- Her sekme için minimal placeholder metin veya `AeEmpty` bileşeni kullan.
- Boş durum mesajları standartlaştırılmış olsun:
  ```js
  AeEmpty({ icon: '◌', title: 'Henüz veri yok', message: '...' })
  ```

### 1.4 — Test fixture

- `tests/test_panel_v2_tabs.js` yaz.
- Testler:
  - 5 sekme butonu render ediliyor mu?
  - `AeonV2.setTab('trends')` çağrısı `ui.tab === 'trends'` yapıyor mu?
  - `#app` içeriği değişiyor mu?
  - ARIA attribute'ları var mı?

## Testler

```bash
cd /Users/m_ras/Desktop/seyma
node --check panel-v2.js
node tests/test_panel_v2_tabs.js
```

## State güncelleme

Faz tamamlandığında:

```json
{
  "currentTaskId": null,
  "completedTasks": ["0.1", "0.2", "0.3", "0.4", "0.5", "1.1", "1.2", "1.3", "1.4"],
  "pendingTasks": ["2.1", "2.2", ...],
  "nextTaskId": "2.1",
  "status": "in-progress"
}
```

## Tur raporu formatı

```markdown
## Faz 1 — Tamamlandı

- **İşlenen görevler:** 1.1, 1.2, 1.3, 1.4
- **Değiştirilen dosyalar:** panel-v2.js, panel-v2.css, tests/test_panel_v2_tabs.js
- **Testler:** `node --check panel-v2.js` ✅, `node tests/test_panel_v2_tabs.js` ✅
- **Blokeler:** Yok
- **Sonraki prompt:** P3-FAZ-2-GENEL-BAKIS.md
```

## Çıkış kriterleri

- [ ] 5 sekme render ediliyor.
- [ ] Sekme geçişleri çalışıyor.
- [ ] Topbar'da marka, tek status badge, eylemler var.
- [ ] Her sekmede placeholder/boş durum var.
- [ ] `tests/test_panel_v2_tabs.js` PASS.
- [ ] `panel-revize-state.json` güncellendi.

---

Sonraki prompt: [P3-FAZ-2-GENEL-BAKIS.md](P3-FAZ-2-GENEL-BAKIS.md)
