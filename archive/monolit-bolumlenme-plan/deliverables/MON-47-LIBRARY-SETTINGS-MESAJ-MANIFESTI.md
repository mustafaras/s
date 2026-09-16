# MON-47 — Kitaplık, Ayarlar ve Mesaj render manifesti

Tarih: 2026-09-12
Dal: `premium-fx-gorsel-yuzey` (LOCAL-ONLY)
Öncül: `2d7579f0e5891582accd257dd1a598f40b739855` (MON-46)

## Karar ve sahiplik

- `SeymaRender.readingOverlayHTML`, `watchOverlayHTML`, `listeningOverlayHTML`,
  `learningOverlayHTML`, `soulPracticePickerHTML`, `soulActivityOverlayHTML` ve
  `soulArchiveOverlayHTML`, app.js'in named resolver bag'i üzerinden yalnız
  `SeymaLibrary` domain registry gövdelerine delege eder.
- `SeymaRender.ayarlarHTML` yalnız `SeymaSettings.ayarlarHTML`,
  `SeymaRender.mesajHTML` yalnız `SeymaMessaging.mesajHTML` resolverına delege eder.
  Çağrı yönü `app.js → SeymaRender → domain registry`dir; registry yükleme anında
  resolver çağırmaz, cycle/missing/duplicate registration fail-closed kalır.
- Library domain gövdeleri, settings data/yazıcıları, message state/persistence ve
  stable bubble identity app.js/domain sahipliğinde kaldı. `App` handler adları ve
  imzaları, inline handlerlar, `render()`, `App.go`, `#root/#app` innerHTML,
  modal/focus/keyboard, CSS, state/migrate/save/sync/network değişmedi.

## Yükleme ve kapsam

- Yeni core dosyası yoktur; index, driver, zikr-harness ve state-rebind FILES sırası
  değişmedi. Driver'a yalnız app-owned `App.openReading()` kullanan sentetik
  `--dump reading` rotası eklendi.
- `index.html` render ve app cache-bust değerleri `20260912c` oldu.
- Production diff yalnız render registry, signature-preserving shimler, cache-bust,
  sentetik dump rotası, ilgili sınır fixtureları ve anti-amnesia kanıt zinciridir.

## Deterministik markup kanıtı

Ayrı `HEAD` arşivi ile güncel çalışma ağacı aynı seeded driver altında karşılaştırıldı.

| Yüzey | UTF-8 byte | SHA-256 | cmp |
|---|---:|---|---|
| Ayarlar | 46,190 | `ed7ec8bf02fad44dbfa805e8254b791c06255ff247da443dd7d53200d7316782` | `0` |
| Mesaj | 17,138 | `15df13b7138af356d7c5a4d9c80e0b5719eeb0e7d8b7d002bf1998c1b09394da` | `0` |
| Okuma modalı | 121,201 | `1539a78cad5ea25a39755876f43cff108bf93ce2aac685588701e1636d185805` | `0` |

Inline `onclick` SHA-256 değeri `dd582bbc5209cbe90cc2b152cd5d51fdf6773a756252cc5d02df822373fd38b7`;
App function/all/unique `556/721/718`, `onclick` `153`, FX `29` ve data-rebind
tokenı `18` önce/sonra delta `0`dır. `render()` çağrı grafiği, `App.go` ve
root/app ownership diff'i yoktur.

## Kapılar

- `node --check app.js`, `node --check sync.js` ve tüm `app/core/*.js`: PASS.
- Driver onboarding+seeded, Ayarlar/Mesaj/Okuma dump'ları; zikr harness `95/95`:
  PASS.
- Library, settings, messaging boundary; ÆON expand persistence `24/24`; modal
  focus; modularization `101/101`; state-rebind `37/37`; Faz10 `69/69`; premium
  9 fixture; reminder smoke `21`; B1/B2/B3: PASS.
- Registry boot no-network/no-storage; missing/duplicate fail-closed: PASS.
- `git diff --check`: PASS. Browser/device, native permission, live account,
  remote, push/merge/tag/deploy ve `mustafaras/seyma-data` yazımı yoktur;
  `releaseApproval=not_approved` korunmuştur.

MON-48 ayrı, yeni açık kullanıcı yönü gerektirir.
