# MON-46 — Saygı ve Terapi render/focus manifesti

Tarih: 2026-09-12
Dal: `premium-fx-gorsel-yuzey` (LOCAL-ONLY)
Öncül: `d6235053e5e06d13abb7234407c86c7dc2326325` (MON-45)

## Karar ve sahiplik

`app/core/render.js` içindeki load-safe `window.SeymaRender` üç render
girişini ekler: `saygiHTML`, `motivationTodayCardHTML`, `roomOverlayHTML`.
Her giriş, yalnız app.js dependency bagindeki aşağıdaki doğrudan domain
resolverına çağrı yapar:

| Giriş | app.js shim | Render resolverı | Domain sahibi |
|---|---|---|---|
| Saygı tabı | `SEYMA_RENDER.saygiHTML` | `saygiTabHTML` | `SeymaSaygi.saygiHTML` |
| Terapi Bugün kartı | `SEYMA_RENDER.motivationTodayCardHTML` | `motivationTodayEntryHTML` | `SeymaMotivation.motivationTodayCardHTML` |
| Terapi modal girişi | `SEYMA_RENDER.roomOverlayHTML` | `roomOverlayEntryHTML` | `SeymaMotivation.roomOverlayHTML` |

Yön tek yönlüdür: `app.js → SeymaRender → Saygi/Motivation`; registry cycle
yoktur. `roomBodyHTML`, rich içerik üreticileri, Saygı/Motivation domain
gövdeleri ve content paketleri değişmedi. `App.openRoom/closeRoom/updateRoom`,
`App.onReminderKeydown`, `focusModalDialog`, dialog DOM sahipliği, body-scroll,
timer, focus return ve keyboard sözleşmesi app.js'te kaldı. CSS, state,
migrate/getDay/default/save, sync.js ve network davranışı değişmedi.

Var olan `render.js` FILES sırası korundu; yeni çekirdek dosya yoktur.
`driver.mjs` yalnız sentetik `--dump room` rotasını, gerçek app-owned
`App.openRoom()` yolu üzerinden markup yakalamak için ekledi. index cache-bust
`render.js` ve `app.js` için `20260912b` oldu.

## Deterministik markup parity

Baseline, çalışma ağacına dokunmadan ayrı `/private/tmp` HEAD arşivinden
alındı. Sabit `Math.random` preloadu yalnız harness komutunda kullanıldı.

| Yüzey | UTF-8 byte | SHA-256 | `cmp` |
|---|---:|---|---:|
| Saygı (`driver --dump saygi`) | 20,593 | `f4c0fc3a949e1eb50577061f73df0e2d87a27f4451c50b3cf925cb0107882599` | 0 |
| Bugün / Terapi kart girişi (`--dump bugun`) | 112,402 | `540f103dc6bf1f3067bd8821cfa9e555eb531d77f44b1e447a53de0baf07930d` | 0 |
| Terapi dialog girişi (`--dump room`) | 136,095 | `6947c9c4543fc9daf862972d076825dcece12bcb05dc9b676313e9a8597883ac` | 0 |

Terapi focus fixture'ı dialog semantiğini (`role=dialog`, `aria-modal`,
`aria-labelledby`, `tabindex=-1`), non-focusable backdrop, ortak Tab/Shift+Tab
sarma, Escape, açılış focusu, kapatma hedefi ve reflection inputunda render
olmamasını PASS doğruladı. Saygı fixture'ı lazy SaygiPeople/Hijri resolverları,
üç modalın ARIA/keyboard kontratını ve floating Okudum eylemini PASS doğruladı.

## Değişmezlik ve kapılar

| Ölçüm | HEAD | Sonra | Delta |
|---|---:|---:|---:|
| `App.*=function` | 556 | 556 | 0 |
| tüm / benzersiz `App.*=` | 721 / 718 | 721 / 718 | 0 / 0 |
| literal `onclick=` / `data-fx=` | 156 / 29 | 156 / 29 | 0 / 0 |
| `data=` tokenı (app.js + render) | 18 | 18 | 0 |
| `App.go`/render/root-app/modal-owner diff satırı | 0 | 0 | 0 |

- Syntax: app.js, sync.js, tüm `app/core/*.js`, driver PASS.
- Driver onboarding+seeded, zikr **95/95**, modularization **101/101**,
  state-rebind **37/37**, Faz10 **69/69**, ÆON **24/24**, premium 9 fixture,
  reminder smoke 21, B1/B2/B3 (**0/67/20 failure**) PASS.
- Saygı **20/20**, Terapi accessibility **13 PASS**, ortak modal-focus **41 PASS**
  ve Bugün kart preference **8/8** PASS.
- Registry VM boot document/storage/fetch/timer olmadan PASS; eksik ve tekrar
  registration fail-closed. `git diff --check` PASS.

`releaseApproval=not_approved` korunur. Browser/device acceptance, native
permission/notification, remote veya `mustafaras/seyma-data` işlemi,
push/merge/tag/deploy yapılmadı. MON-47 için yeni açık kullanıcı yönü gerekir.
