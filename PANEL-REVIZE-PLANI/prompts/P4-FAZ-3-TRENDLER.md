# P4 — FAZ 3: Trendler & Uyarılar

Bu prompt, **Trendler & Uyarılar** sekmesini oluşturmak için verilir. Faz 2 tamamlanmış olmalıdır.

## Faz hedefi

7/14/30 günlük özet kartları ve anomali tespiti ile kullanıcının dikkat çekmesi gereken durumları net bir şekilde sunmak.

## Bu fazda ele alınacak görevler

- `3.1` — SummaryCard komponenti
- `3.2` — 7/14/30 günlük trend kartları
- `3.3` — Anomali tespit motoru
- `3.4` — AnomalyCard komponenti ve anomali listesi
- `3.5` — Anomaliden Gün Detayı'na atlama
- `3.6` — Trendler test fixture'ı

## Önceki faz kontrolü

- `completedTasks` içinde `2.1`, `2.2`, `2.3`, `2.4`, `2.5` var mı?
- `AeCard` ve `HeroCard` komponentleri var mı?

## Yapılacaklar (checklist)

### 3.1 — SummaryCard

- `SummaryCard({ title, value, unit, windowDays, trend, delta, status })` varyantı.
- Trend yönü için ↑ ↓ → ikonları.
- Durum badge: normal / dikkat / risk.

### 3.2 — Trend kartları

Aşağıdaki metrikler için 7/14/30 gün penceresi seçici ile kartlar:
- **Uyku ortalaması**
- **Adım ortalaması**
- **Su ortalaması**
- **SOS yoğunluğu** (günlük ortalama)
- **Eksik gün sayısı** (kayıt yapılmamış gün)
- **MOH gün sayısı** (mood-only hızlı kayıt)

Hesaplamalar mevcut paneldeki hesaplarla uyumlu olmalı; fark varsa `PANEL-REVIZE-PLANI/08-VERI-KARSILASTIRMASI.md` oluştur.

### 3.3 — Anomali tespit motoru

Kurallar:
- Uyku son 7 günde ≥%20 düşüş
- SOS sayısı son 7 günde artış
- MOH ≥ 10 gün arka arkaya
- Eksik gün ≥ 3 arka arkaya
- Su veya adım hedefin %50 altında (hedef `settings.goals` içinde aranır)

Her anomali:
```js
{ id, kind, severity, message, dates, linkDate }
```

### 3.4 — AnomalyCard

- Sol border rengi severity'e göre (sarı/turuncu/kırmızı).
- Kısa açıklama ve tarih.
- "Detay gör" linki ilgili güne yönlendirir.

### 3.5 — Anomaliden Gün Detayı'na atlama

- Anomaliye tıklayınca `AeonV2.setTab('day'); AeonV2.setDate(linkDate)` çağrılır.
- Gün Detayı ilgili tarihle açılır.

### 3.6 — Test fixture

- `tests/test_panel_v2_trends.js` yaz.
- Seeded data ile summary değerleri ve anomali listesini doğrula.
- Anomali senaryoları: uyku düşüşü, SOS artışı, eksik gün.

## Testler

```bash
cd /Users/m_ras/Desktop/seyma
node --check panel-v2.js
node tests/test_panel_v2_trends.js
```

## State güncelleme

```json
{
  "completedTasks": ["...", "3.1", "3.2", "3.3", "3.4", "3.5", "3.6"],
  "nextTaskId": "4.1"
}
```

## Tur raporu formatı

```markdown
## Faz 3 — Tamamlandı

- **İşlenen görevler:** 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
- **Değiştirilen dosyalar:** panel-v2.js, panel-v2.css, tests/test_panel_v2_trends.js
- **Sonraki prompt:** P5-FAZ-4-GUN-DETAYI.md
```

## Çıkış kriterleri

- [ ] Summary kartları 7/14/30 penceresiyle çalışıyor.
- [ ] Anomali tespit kuralları tanımlı ve test edilmiş.
- [ ] Anomali listesi boşken ae-empty gösteriyor.
- [ ] Anomaliden Gün Detayı'na atlama çalışıyor.
- [ ] `tests/test_panel_v2_trends.js` PASS.
- [ ] `panel-revize-state.json` güncellendi.

---

Sonraki prompt: [P5-FAZ-4-GUN-DETAYI.md](P5-FAZ-4-GUN-DETAYI.md)
