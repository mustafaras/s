# P5 — FAZ 4: Gün Detayı

Bu prompt, **Gün Detayı** sekmesini oluşturmak için verilir. Faz 3 tamamlanmış olmalıdır.

## Faz hedefi

Seçili günün tüm girdilerini kategorilere ayırarak göstermek; ham GPS, profil cevapları, terapi metinleri ve medyayı redact etmek.

## Bu fazda ele alınacak görevler

- `4.1` — Tarih seçici / takvim ısı haritası
- `4.2` — DetailSection komponenti
- `4.3` — Ruh hali ve terapi bölümü
- `4.4` — Beslenme ve öğün bölümü
- `4.5` — İbadet ve Saygı bölümü
- `4.6` — Hareket ve konum özet bölümü
- `4.7` — İçerik bölümü
- `4.8` — Gün Detayı redaction ve test fixture'ı

## Önceki faz kontrolü

- `completedTasks` içinde `3.1`…`3.6` var mı?
- `AeCard` komponenti var mı?

## Yapılacaklar (checklist)

### 4.1 — Tarih seçici / takvim ısı haritası

- Üstte büyük tarih ve önceki/sonraki gün butonları.
- Opsiyonel: küçük ısı haritası (son 30 gün mood/adım renk skalası).
- `ui.date` ISO date string olarak tutulsun.

### 4.2 — DetailSection

- `DetailSection({ id, title, icon, children, emptyText })` komponenti.
- Her bölüm ayrı ayrı collapsible olabilir (opsiyonel, V1'de sabit açık da kalabilir).

### 4.3 — Ruh hali ve terapi

- Mod, journal/note, intention, gratitude.
- Therapy: thoughts count, decision, share varlığı, breath, dailyWin, selfCompassion, firstStep.
- **Redaction:** `therapy.thoughts[].text`, `therapy.share.note`, `journal` uzun metinleri gösterme; varlık/sayı/kategori yeterli.

### 4.4 — Beslenme ve öğün

- `meals` listesi, `mealItems` makro özeti.
- Su bardak sayısı.
- Kafein bilgisi varsa göster.

### 4.5 — İbadet ve Saygı

- Namaz vakitleri (`prayer`) durum özeti.
- Zikir (`zikr`) sayaç/gün.
- Günün öncüsü (`saygi`) isim ve okuma durumu.
- Kur'an yolculuğu istekleri (`quranJourney`) varlık.

### 4.6 — Hareket ve konum

- Adım, yürüyüş süresi, kat edilen mesafe.
- Konum segmentleri kategori olarak (ev, iş, dışarı, vb.); **ham lat/lng yok**.

### 4.7 — İçerik

- Reading, watching, listening, quotes listeleri.
- Boş durum merkezi.

### 4.8 — Test fixture

- `tests/test_panel_v2_day_detail.js` yaz.
- Testler:
  - Seçili gün değişince render değişiyor mu?
  - Ham GPS string'i DOM'da yok mu?
  - Terapi metinleri redacted mı?
  - Boş gün mesajı doğru mu?

## Testler

```bash
cd /Users/m_ras/Desktop/seyma
node --check panel-v2.js
node tests/test_panel_v2_day_detail.js
```

## State güncelleme

```json
{
  "completedTasks": ["...", "4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8"],
  "nextTaskId": "5.1"
}
```

## Tur raporu formatı

```markdown
## Faz 4 — Tamamlandı

- **İşlenen görevler:** 4.1…4.8
- **Değiştirilen dosyalar:** panel-v2.js, panel-v2.css, tests/test_panel_v2_day_detail.js
- **Sonraki prompt:** P6-FAZ-5-ARSIVLER.md
```

## Çıkış kriterleri

- [ ] Seçili tarih değiştirilebiliyor.
- [ ] Tüm kategoriler redaction kurallarına uygun.
- [ ] Boş gün mesajı doğru.
- [ ] Ham GPS/profil/terapi/medya görünmüyor.
- [ ] `tests/test_panel_v2_day_detail.js` PASS.
- [ ] `panel-revize-state.json` güncellendi.

---

Sonraki prompt: [P6-FAZ-5-ARSIVLER.md](P6-FAZ-5-ARSIVLER.md)
