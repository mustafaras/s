# P6 — FAZ 5: Arşivler

Bu prompt, **Arşivler** sekmesini oluşturmak için verilir. Faz 4 tamamlanmış olmalıdır.

## Faz hedefi

Kütüphane, izleme, dinleme ve alıntı arşivlerini alt sekmelerde listeleyerek göstermek; büyük listelerde performansı korumak.

## Bu fazda ele alınacak görevler

- `5.1` — SubTabs komponenti
- `5.2` — Kütüphane arşivi listesi
- `5.3` — İzleme arşivi listesi
- `5.4` — Dinleme arşivi listesi
- `5.5` — Alıntılar arşivi listesi
- `5.6` — Arşiv performansı: pagination veya lazy scroll
- `5.7` — Arşivler test fixture'ı

## Önceki faz kontrolü

- `completedTasks` içinde `4.1`…`4.8` var mı?
- `AeCard`, `DetailSection` komponentleri var mı?

## Yapılacaklar (checklist)

### 5.1 — SubTabs

- `SubTabs({ tabs, active, onChange })` komponenti.
- Arşivler sekmesi altında: Kütüphane, İzleme, Dinleme, Alıntılar.
- Sistem sekmesinde de kullanılabilir.

### 5.2 — Kütüphane

- `data.library` + günlük `reading` kayıtlarını birleştir.
- Liste satırı: başlık, yazar, son okuma tarihi, sayfa/ilerleme.

### 5.3 — İzleme

- `data.watchlist` + günlük `watching` kayıtlarını birleştir.
- Liste satırı: başlık, tür, sezon/bölüm veya film, toplam dakika.

### 5.4 — Dinleme

- `data.music` + günlük `listening` kayıtlarını birleştir.
- Liste satırı: başlık, tür (müzik/podcast), toplam dakika, parça sayısı.

### 5.5 — Alıntılar

- `library`, `watchlist`, `music` içindeki `quotes` alanlarını birleştir.
- Liste satırı: alıntı metni, kaynak.
- Alıntılar kısa ve kullanıcı tarafından açıkça paylaşılmış olmalı; gizli not değil.

### 5.6 — Performans

- 100+ kayıt olduğunda takılmamalı.
- Basit pagination: sayfa başına 20 kayıt.
- Veya lazy scroll: viewport içindeki satırları render et.
- Sekme geçişi ≤150ms altında kalmalı.

### 5.7 — Test fixture

- `tests/test_panel_v2_archives.js` yaz.
- Her alt sekme render ediliyor mu?
- Pagination çalışıyor mu?
- Boş arşiv durumu doğru mu?

## Testler

```bash
cd /Users/m_ras/Desktop/seyma
node --check panel-v2.js
node tests/test_panel_v2_archives.js
```

## State güncelleme

```json
{
  "completedTasks": ["...", "5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7"],
  "nextTaskId": "6.1"
}
```

## Tur raporu formatı

```markdown
## Faz 5 — Tamamlandı

- **İşlenen görevler:** 5.1…5.7
- **Değiştirilen dosyalar:** panel-v2.js, panel-v2.css, tests/test_panel_v2_archives.js
- **Sonraki prompt:** P7-FAZ-6-SISTEM-MESAJLAR.md
```

## Çıkış kriterleri

- [ ] 4 alt sekme çalışıyor.
- [ ] Listeler doğru birleştiriliyor.
- [ ] Pagination/lazy scroll 100+ kaydı yönetebiliyor.
- [ ] Boş arşiv durumu doğru.
- [ ] `tests/test_panel_v2_archives.js` PASS.
- [ ] `panel-revize-state.json` güncellendi.

---

Sonraki prompt: [P7-FAZ-6-SISTEM-MESAJLAR.md](P7-FAZ-6-SISTEM-MESAJLAR.md)
