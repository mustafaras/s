# P7 — FAZ 6: Sistem & Mesajlar

Bu prompt, **Sistem & Mesajlar** sekmesini oluşturmak için verilir. Faz 5 tamamlanmış olmalıdır.

## Faz hedefi

Teknik durum, senkron detayları, observer mesajlaşması ve ayarları merkezi ve sade bir sekmede toplamak.

## Bu fazda ele alınacak görevler

- `6.1` — Tek status badge detayı
- `6.2` — Senkron audit çekmecesi
- `6.3` — Observer inbox/outbox mesajlaşma
- `6.4` — Ayarlar: density, tema, token alanı
- `6.5` — Sistem sekmesi test fixture'ı

## Önceki faz kontrolü

- `completedTasks` içinde `5.1`…`5.7` var mı?
- `SubTabs` ve `AeCard` komponentleri var mı?

## Yapılacaklar (checklist)

### 6.1 — Status badge detayı

- Topbar'daki badge tıklayınca veya Sistem sekmesinde açılınca detaylı sync durumu göster.
- Gösterilecekler: son sync zamanı, revision/SHA/ETag, gün sayısı, p50/p95 latency.
- Hata durumunda fallback mesaj.

### 6.2 — Senkron audit çekmecesi

- Tek çekmece içinde:
  - Coverage projection durumu
  - Provenance özet
  - Polling durumu (ETag, 304 sayısı)
  - Event log son kayıtları
- Kullanıcı dostu dil; teknik jargon sınırlı.

### 6.3 — Observer inbox/outbox

- `data/observer-inbox.json` okuma, `data/aeon-outbox.json` yazma.
- Mesaj listesi: gönderen, zaman, kısa metin.
- Yeni mesaj yazma alanı (yalnızca outbox).
- **Token alanı:** kullanıcı tarafından doldurulur; agent otomatik doldurmaz.

### 6.4 — Ayarlar

- Yoğunluk seçici (`compact`, `comfortable`, `spacious`).
- Light/dark tema geçişi.
- GitHub token alanı (gizli input veya masked).
- Panel oturumunu sonlandırma.

### 6.5 — Test fixture

- `tests/test_panel_v2_system.js` yaz.
- Testler:
  - Status badge detayı render ediliyor mu?
  - Token string'i DOM çıktısında yok mu?
  - Audit detayları var mı?
  - Mesajlaşma UI var mı?

## Testler

```bash
cd /Users/m_ras/Desktop/seyma
node --check panel-v2.js
node tests/test_panel_v2_system.js
```

## State güncelleme

```json
{
  "completedTasks": ["...", "6.1", "6.2", "6.3", "6.4", "6.5"],
  "nextTaskId": "7.1"
}
```

## Tur raporu formatı

```markdown
## Faz 6 — Tamamlandı

- **İşlenen görevler:** 6.1…6.5
- **Değiştirilen dosyalar:** panel-v2.js, panel-v2.css, tests/test_panel_v2_system.js
- **Sonraki prompt:** P8-FAZ-7-POLISH.md
```

## Çıkış kriterleri

- [ ] Status badge detayı açılıyor.
- [ ] Audit çekmecesi sade ve anlaşılır.
- [ ] Inbox/outbox UI var; token gizli.
- [ ] Density/tema ayarları çalışıyor.
- [ ] `tests/test_panel_v2_system.js` PASS.
- [ ] `panel-revize-state.json` güncellendi.

---

Sonraki prompt: [P8-FAZ-7-POLISH.md](P8-FAZ-7-POLISH.md)
