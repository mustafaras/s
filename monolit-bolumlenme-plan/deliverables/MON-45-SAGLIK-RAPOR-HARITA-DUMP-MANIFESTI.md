# MON-45 — Sağlık, Rapor ve Harita render registry manifesti

Tarih: 2026-09-12
Dal: `premium-fx-gorsel-yuzey` (LOCAL-ONLY)
Öncül: MON-44 (`e8a771f25b72555c1c1a0c73ba7af5503865784f`)

## Karar ve sahiplik

`app/core/render.js` içindeki yüklemede yan etkisiz `window.SeymaRender`, üç
signature-preserving delegeyi ekler: `saglikHTML`, `raporHTML`, `haritaHTML`.
Her biri yalnız dependency bag içindeki sırasıyla `healthTabHTML`,
`reportTabHTML`, `mapTabHTML` resolverına çağrı yapar.

| Tab | app.js shim / app-owned iş | Render resolverı | Korunan domain sahibi |
|---|---|---|---|
| Sağlık | aynı ad/imza/dönüş | `SEYMA_RENDER.saglikHTML` | `SEYMA_HEALTH.saglikHTML` |
| Rapor | aynı ad/imza/dönüş | `SEYMA_RENDER.raporHTML` | `SEYMA_REPORT.raporHTML` |
| Harita | `ui.calMonth` lazy ilklemeyi app.js'te yapar | `SEYMA_RENDER.haritaHTML` | `SEYMA_MAP.haritaHTML` |

Yön tek yönlüdür: `app.js → SeymaRender → domain registry`; registry cycle
yoktur. Health/Report/Map gövdeleri, `App.go`, `render()`, `#root/#app`
`innerHTML` sahipliği, CSS, save/state/migrate/getDay/default, `sync.js`,
network ve handler yüzeyi değiştirilmedi. Var olan `render.js` kullanıldığı
için driver/zikr/state-rebind FILES listeleri değişmedi; indexte aynı script
sırası korundu, yalnız render/app cache-bustları `20260912a` oldu.

## Deterministik dump parity

Baseline, çalışma ağacına dokunmadan ayrı `/private/tmp` HEAD arşivinden
alındı. Her iki tarafta da yalnız harness komutunda sabit `Math.random`
preloadu kullanıldı; üretim dosyası veya state değiştirilmedi.

| Tab | UTF-8 byte | SHA-256 | `cmp` |
|---|---:|---|---:|
| Sağlık | 65,868 | `1c9dd4e814bdd7e655bc7e80e23b875ea8d787369811c4d485441a7bbc8bb438` | 0 |
| Rapor | 139,456 | `f7fc2ef0d3a38a7cd9fc98721dd15e915150736cd65c843f2ba4ea7db187eaa2` | 0 |
| Harita | 29,125 | `1c6f3c77f2668ff290f7aaa9af43ea1f201a172b6b8c88539b1e054678bd993c` | 0 |

`driver --dump <tab>` her üç tab için gerçek `App.go(<tab>)` yolunu kullandı.
Standart driver ayrıca onboarding, seeded boot, Bugün tabı ve `App.go('rapor')`
smoke yolunu PASS verdi. `test_map_boundary.js` lazy konum/network sınırını ve
map HTML üretimini PASS doğruladı; registry boot VM testi document, storage,
fetch ve timer olmadan PASS verdi ve eksik/tekrar kayıtları fail-closed reddetti.

## Değişmezlik delta tablosu

| Ölçüm | HEAD baseline | MON-45 sonrası | Delta |
|---|---:|---:|---:|
| `App.*=function` | 556 | 556 | 0 |
| tüm `App.*=` | 721 | 721 | 0 |
| benzersiz `App.*` | 718 | 718 | 0 |
| literal `onclick=` | 156 | 156 | 0 |
| literal `data-fx=` | 29 | 29 | 0 |
| `data=` tokenı (app.js + render) | 18 | 18 | 0 |
| `App.go` / `render()` / root-app innerHTML diff satırı | 0 | 0 | 0 |

## Kapılar

- `node --check app.js`, `node --check sync.js` ve tüm `app/core/*.js`: PASS.
- driver, zikr **95/95**, modularization **101/101**, state-rebind **37/37**,
  Faz10 **69/69**, ÆON expand **24/24**, premium 9 fixture, reminder smoke 21,
  B1/B2/B3 (**0/67/20 failure**) PASS.
- Health **30/30**, Report ve Map boundary fixture'ları PASS; Health/Report
  fixture'lar yalnız yeni `SeymaRender` shim sahipliğini ifade edecek şekilde
  güncellendi.
- `git diff --check`: PASS. Production diff yalnız `app.js`, `app/core/render.js`
  ve gerekli cache-bust; fixture diff yalnız iki ilgili boundary assertionı.

`releaseApproval=not_approved` korunur. Browser/device acceptance, native
permission/notification, remote veya `mustafaras/seyma-data` işlemi,
push/merge/tag/deploy yapılmadı. MON-46 ayrı kullanıcı yönü gerektirir.
