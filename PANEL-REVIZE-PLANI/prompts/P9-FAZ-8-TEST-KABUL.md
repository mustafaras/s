# P9 — FAZ 8: Test ve Kabul

Bu prompt, tüm yeni panelin **test ve kabul sürecini** yönetmek için verilir. Faz 7 tamamlanmış olmalıdır.

## Faz hedefi

Tüm headless fixture'ları yazmak/çalıştırmak, mevcut panel ile yeni panel arasındaki veri doğruluğunu karşılaştırmak ve kabul kriterlerini denetlemek.

## Bu fazda ele alınacak görevler

- `8.1` — panel-v2 için headless fixture seti
- `8.2` — Veri doğruluğu karşılaştırması
- `8.3` — Kabul kriterleri audit'ı

## Önceki faz kontrolü

- `completedTasks` içinde `7.1`…`7.4` var mı?
- `panel-v2.js`, `panel-v2.css`, `panel-v2.html` tam mı?

## Yapılacaklar (checklist)

### 8.1 — Headless fixture seti

Aşağıdaki fixture'ların tümü PASS olmalı:

```bash
node tests/test_panel_v2_skeleton.js
node tests/test_panel_v2_tabs.js
node tests/test_panel_v2_today.js
node tests/test_panel_v2_trends.js
node tests/test_panel_v2_day_detail.js
node tests/test_panel_v2_archives.js
node tests/test_panel_v2_system.js
```

Ortak test helper (`tests/helpers/panel-v2-test-helper.js`) oluştur; DOM, localStorage ve fetch mock'ları burada toplansın.

### 8.2 — Veri doğruluğu karşılaştırması

- Aynı `data` objesiyle mevcut panelin (`panel.js`) ve yeni panelin (`panel-v2.js`) hesapladığı temel KPI'ları karşılaştır.
- Karşılaştırılacak metrikler: bugün mod, dün uyku, bugün adım, 7 günlük su, SOS sayısı, eksik gün.
- Fark varsa `PANEL-REVIZE-PLANI/08-VERI-KARSILASTIRMASI.md` oluştur ve nedenlerini belirt.

### 8.3 — Kabul kriterleri audit'ı

- `PANEL-REVIZE-PLANI/panel-revize-acceptance-schema.json` yapısına uygun bir `PANEL-REVIZE-PLANI/panel-revize-acceptance.json` oluştur.
- Her fazın kriterlerini işaretle: not-checked / passed / failed / blocked.
- Eksikler varsa blocker olarak kaydet.

## Testler

```bash
cd /Users/m_ras/Desktop/seyma
node --check panel-v2.js
node tests/test_panel_v2_*.js
```

## State güncelleme

```json
{
  "completedTasks": ["...", "8.1", "8.2", "8.3"],
  "nextTaskId": "9.1"
}
```

## Tur raporu formatı

```markdown
## Faz 8 — Tamamlandı

- **İşlenen görevler:** 8.1, 8.2, 8.3
- **Değiştirilen dosyalar:** tests/test_panel_v2_*.js, tests/helpers/panel-v2-test-helper.js, PANEL-REVIZE-PLANI/08-VERI-KARSILASTIRMASI.md, PANEL-REVIZE-PLANI/panel-revize-acceptance.json
- **Fixture sonuçları:** ...
- **Sonraki prompt:** P10-FAZ-9-GECIS-DEPLOY.md
```

## Çıkış kriterleri

- [ ] Tüm fixture'lar PASS.
- [ ] Veri doğruluğu karşılaştırması yapıldı.
- [ ] Kabul kriterleri audit'ı tamamlandı.
- [ ] Blokeler varsa kaydedildi.
- [ ] `panel-revize-state.json` güncellendi.

---

Sonraki prompt: [P10-FAZ-9-GECIS-DEPLOY.md](P10-FAZ-9-GECIS-DEPLOY.md)
