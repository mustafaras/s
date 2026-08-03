# P1 — FAZ 0: Hazırlık ve izolasyon

Bu prompt, ÆON panel revizyonunun **temel iskelet dosyalarını** oluşturmak için verilir. Bu faz tamamlanmadan başka fazlara geçilmez.

## Faz hedefi

Yeni paneli mevcut panelden bağımsız olarak başlatmak için gerekli üç dosyayı (shell, CSS skeleton, JS IIFE skeleton) ve veri projection bağlantısını oluşturmak.

## Bu fazda ele alınacak görevler

- `0.1` — `panel-v2.html` shell
- `0.2` — `panel-v2.css` design system skeleton
- `0.3` — `panel-v2.js` IIFE skeleton + `window.AeonV2`
- `0.4` — `panelCoverageManifest.js` projection adapter bağlantısı
- `0.5` — `panel-revize-state.json` başlatma (eğer mevcutsa doğrulama)

## Önceki faz kontrolü

Faz 0'un bağımlılığı yoktur. Ancak yine de:
- `PANEL-REVIZE-PLANI/panel-revize-state.json` dosyasının varlığını ve `status === "in-progress"` olduğunu doğrula.
- Eğer `completedTasks` içinde 1.* veya daha yüksek ID'ler varsa, bu faz muhtemelen tamamlanmış demektir; durumu rapor et ve kullanıcıya sor.

## Yapılacaklar (checklist)

- [ ] `panel-v2.html` oluştur.
  - `DOCTYPE`, `html lang="tr"`, `charset="UTF-8"`, `viewport`.
  - `title`: ÆON · Observer Dashboard v2
  - `styles.css?v=...` (ortak tema) ve `panel-v2.css?v=2026080301` yükle.
  - `panelCoverageManifest.js?v=...` yükle.
  - `panel-v2.js?v=2026080301` yükle (body sonunda).
  - `#app` konteyneri.
- [ ] `panel-v2.css` oluştur.
  - `:root` ve `#root[data-theme="dark"]` için `.ae-*` token'larını tanımla.
  - `.ae-app`, `.ae-card`, `.ae-tabs`, `.ae-tab` temel stilleri.
  - Mobil 2x2 grid için `.ae-grid--hero`.
  - Boş durum için `.ae-empty`.
- [ ] `panel-v2.js` oluştur.
  - IIFE yapısı.
  - `window.AeonV2` export: `{ render, setTab, init }`.
  - `ui` objesi: `{ tab, subTab, date, density, theme }`.
  - `render()` placeholder: sadece aktif sekmeyi `#app` içine yaz.
- [ ] `panelCoverageManifest.js` bağlantısı.
  - `typeof window.SeymaPanelCoverage !== "undefined"` kontrolü.
  - `window.SeymaPanelCoverage.coverageForData(data)` çağrısını saracak bir `projectData(data)` fonksiyonu.
  - `data` argümanı yoksa boş ama geçerli projection state döndür.
- [ ] `panel-revize-state.json` doğrula/güncelle.
  - Eğer yoksa `panel-revize-state-example.json` kopyası oluştur.
  - `currentTaskId` olarak `0.1` ayarla (eğer henüz başlanmadıysa).

## Testler (her görevden sonra çalıştır)

```bash
cd /Users/m_ras/Desktop/seyma
node --check panel-v2.js
node --check panelCoverageManifest.js  # zaten mevcutsa
```

Ek olarak basit bir headless fixture yaz (`tests/test_panel_v2_skeleton.js`) ve çalıştır:

```bash
node tests/test_panel_v2_skeleton.js
```

Fixture en az şunları test etsin:
- `panel-v2.html` içinde `#app` var.
- `panel-v2.css` içinde `.ae-card` var.
- `panel-v2.js` `window.AeonV2` export ediyor.
- `window.AeonV2.setTab('trends')` sonrası `#app` HTML'si değişiyor.

## State güncelleme

Bu faz tamamlandığında `PANEL-REVIZE-PLANI/panel-revize-state.json` şu şekilde güncellenir:

```json
{
  "currentTaskId": null,
  "completedTasks": ["0.1", "0.2", "0.3", "0.4", "0.5"],
  "pendingTasks": [
    "1.1", "1.2", "1.3", "1.4",
    ...diğerleri...
  ],
  "nextTaskId": "1.1",
  "status": "in-progress",
  "evidence": [
    {
      "recordedAt": "...",
      "taskId": "0.5",
      "kind": "test-pass",
      "summary": "Faz 0 skeleton + fixture PASS",
      "command": "node tests/test_panel_v2_skeleton.js",
      "files": ["panel-v2.html", "panel-v2.css", "panel-v2.js", "tests/test_panel_v2_skeleton.js"]
    }
  ]
}
```

## Tur raporu formatı

```markdown
## Faz 0 — Tamamlandı

- **İşlenen görevler:** 0.1, 0.2, 0.3, 0.4, 0.5
- **Değiştirilen dosyalar:** panel-v2.html, panel-v2.css, panel-v2.js, tests/test_panel_v2_skeleton.js
- **Testler:** `node --check panel-v2.js` ✅, `node tests/test_panel_v2_skeleton.js` ✅
- **Blokeler:** Yok
- **Sonraki prompt:** P2-FAZ-1-SEKME-ISKELETI.md
- **Notlar:** ...
```

## Çıkış kriterleri

- [ ] `panel-v2.html`, `panel-v2.css`, `panel-v2.js` oluşturuldu ve syntax hatasız.
- [ ] `window.AeonV2` export ediliyor.
- [ ] `panel-v2.css` içinde `.ae-*` class'ları var.
- [ ] Basit skeleton fixture PASS.
- [ ] `panel-revize-state.json` `0.1-0.5` tamamlandı olarak güncellendi.

---

Sonraki prompt: [P2-FAZ-1-SEKME-ISKELETI.md](P2-FAZ-1-SEKME-ISKELETI.md)
