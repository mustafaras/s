# ÆON Panel-v2 Premium — Headless test yüzeyi

Bu klasör `panel-v2.html`, `panel-v2.js`, `panel-v2.css` ve gerektiğinde
`panelCoverageManifest.js` için 27 sentetik Node/VM fixture’ını içerir.
Fixture’lar ağ kullanmaz, gerçek tarayıcı açmaz ve Şeyma’nın kişisel veri
senkronizasyon zincirine erişmez.

## Çalıştırma

Tek fixture:

```bash
node tests/panel-v2/test_panel_v2_today.js
```

Tüm Panel-v2 fixture’ları:

```bash
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done
```

Ortak helper:

```text
tests/panel-v2/helpers/panel-v2-test-helper.js
```

Helper repository root’unu kendi konumundan çözer; test komutunun hangi
directory’den çalıştırıldığı önemli değildir. Yeni Panel-v2 fixture’ları bu
klasöre eklenmeli, root `tests/` içine eklenmemelidir.

## Kapsam haritası

| Yüzey | Fixture örnekleri |
|---|---|
| Tasarım sistemi / komponent | `css`, `components`, `component_contracts`, `skeleton`, `count_up` |
| Sayfalar / veri görünümü | `today`, `trends`, `day_detail`, `archives`, `system`, `settings` |
| Mobil / erişilebilirlik | `tabs`, `swipe`, `pull_refresh`, `hit_areas`, `accessibility`, `contrast` |
| Polling / kontrol | `polling_tests`, `polling_telemetry`, `sync_health`, `event_log`, `audit`, `history`, `notification_lifecycle` |
| Regresyon / karşılaştırma | `compare`, `performance` |

Kapanış durumu ve bir sonraki güvenli işlem:
`../../archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/CURRENT-STATE.md`.
