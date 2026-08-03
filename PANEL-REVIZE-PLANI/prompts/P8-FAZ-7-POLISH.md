# P8 — FAZ 7: Premium Polish

Bu prompt, tüm panelin **premium kalite** kontrolünü yapmak için verilir. Faz 6 tamamlanmış olmalıdır.

## Faz hedefi

Design system tutarlılığını sağlamak, animasyon/geçişleri optimize etmek, responsive davranışı doğrulamak ve erişilebilirliği kontrol etmek.

## Bu fazda ele alınacak görevler

- `7.1` — Design system tutarlılık denetimi
- `7.2` — Animasyon ve geçiş kalitesi
- `7.3` — Mobil ve masaüstü grid doğrulaması
- `7.4` — Erişilebilirlik kontrolü

## Önceki faz kontrolü

- `completedTasks` içinde `6.1`…`6.5` var mı?
- Tüm 5 sekme render edilebiliyor mu?

## Yapılacaklar (checklist)

### 7.1 — Design system tutarlılık

- Tüm kartların `.ae-*` class'ları kullandığını doğrula.
- Inline `style="..."` kullanımını kaldır.
- Renkler sadece `05-ESTETIK-DESIGN-SISTEMI.md` ile sınırlı token setinden geliyor mu?
- Birimler, border-radius, spacing tutarlı mı?

### 7.2 — Animasyon ve geçiş

- Sekme geçişi ≤150ms.
- Kart hover hafif lift/shadow; ağır animasyon yok.
- Anomali pulse yavaş ve dikkat çekici ama rahatsız edici değil.
- `@media (prefers-reduced-motion: reduce)` desteği.

### 7.3 — Responsive

- 375px: hero 2x2, tek sütun kartlar.
- 460px: hero 2x2, tek sütun.
- 768px: summary kartları 2 sütun.
- 1200px: summary kartları 3 sütun.
- Yatay taşma yok.

### 7.4 — Erişilebilirlik

- Tüm sekmeler `role="tab"` ve `aria-selected`.
- Tüm butonlar erişilebilir; icon-only butonlarda `aria-label`.
- Kontrast oranları yeterli (4.5:1 minimum).
- Focus görünür.

## Testler

```bash
cd /Users/m_ras/Desktop/seyma
node --check panel-v2.js
node tests/test_panel_v2_tabs.js
node tests/test_panel_v2_today.js
node tests/test_panel_v2_trends.js
node tests/test_panel_v2_day_detail.js
node tests/test_panel_v2_archives.js
node tests/test_panel_v2_system.js
```

Opsiyonel: CSS stillerini test eden headless fixture (`tests/test_panel_v2_css.js`).

## State güncelleme

```json
{
  "completedTasks": ["...", "7.1", "7.2", "7.3", "7.4"],
  "nextTaskId": "8.1"
}
```

## Tur raporu formatı

```markdown
## Faz 7 — Tamamlandı

- **İşlenen görevler:** 7.1, 7.2, 7.3, 7.4
- **Değiştirilen dosyalar:** panel-v2.js, panel-v2.css
- **Sonraki prompt:** P9-FAZ-8-TEST-KABUL.md
```

## Çıkış kriterleri

- [ ] Inline style kalmamış.
- [ ] Animasyonlar reduced-motion'a duyarlı.
- [ ] Responsive gridler 4 breakpoint'te doğru.
- [ ] ARIA ve kontrast kontrolleri yapılmış.
- [ ] Mevcut tüm fixture'lar PASS.
- [ ] `panel-revize-state.json` güncellendi.

---

Sonraki prompt: [P9-FAZ-8-TEST-KABUL.md](P9-FAZ-8-TEST-KABUL.md)
