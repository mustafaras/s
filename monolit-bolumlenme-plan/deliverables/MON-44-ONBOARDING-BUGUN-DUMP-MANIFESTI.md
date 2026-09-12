# MON-44 — onboarding ve Bugün render registry manifesti

**Tarih:** 2026-09-12
**Kapsam:** yalnız `onboardingHTML` ve `bugunHTML`; yerel çalışma, release yok.

## Sahiplik ve bağımlılık sınırı

`app/core/render.js`, yüklenirken yalnız `window.SeymaRender` ile üç üyeli
(`registerRender`, `onboardingHTML`, `bugunHTML`) bir IIFE registry kurar.
`registerRender` eksik veya yeniden verilen dependency bag'i reddeder. Registry
yüklenirken `document`, `fetch`, `localStorage`, timer veya resolver çağrısı
yoktur.

| Gövde | Salt-okur resolverlar | app.js'te kalan sahiplik |
|---|---|---|
| `onboardingHTML` | canlı `dark`, `icon` | `App.toggleTheme`, `App.start`, `#app` yazımı |
| `bugunHTML` | canlı `data`, tarih/seri/hesap resolverları ve domain card builder'ları | `syncDerivedHabits(rec)` mutasyonu, tüm `App.*` handlerları, `render()` ve `#app` yazımı |

`app.js`teki iki fonksiyon aynı ad/imza/dönüşle shimdir. `bugunHTML` delegeden
önce mevcut türetilmiş-habit eşlemesini yürütür; registry `data=` ataması,
`save`, DOM, timer veya ağ işi yapmaz.

## Yükleme ve parity

`render.js`, `messaging.js` ile `app.js` arasına eklendi. Aynı sıra
`index.html`, `driver.mjs`, `zikr-harness.mjs` ve
`test_state_rebind_boundary.js` FILES listesinde vardır. Cache sürümleri
`render.js?v=20260911a` ve `app.js?v=20260911b`dir.

## Dump ve değişmezlik kanıtı

`HEAD` (`07425877284c9bd2b8c18304f9ed395add183e31`) ayrı `/private/tmp`
arşivinde çalıştırıldı. Günışığı skoru rastgeleliğini dışarıda bırakmak için
iki ayrı Node sürecinde aynı geçici deterministik `Math.random` preload'u
kullanıldı; üretim/harness kaynağı değişmedi.

| Kanıt | HEAD | MON-44 çalışma ağacı | Sonuç |
|---|---:|---:|---|
| `driver --dump bugun` UTF-8 byte | 112402 | 112402 | eşit |
| SHA-256 | `540f103dc6bf1f3067bd8821cfa9e555eb531d77f44b1e447a53de0baf07930d` | aynı | eşit |
| `cmp -s` | — | exit 0 | markup aynı |
| App fn / tüm / unique atama | 556 / 721 / 718 | 556 / 721 / 718 | delta 0 |
| literal inline `onclick="App.` | 135 | 135 | delta 0 |
| FX occurrence (`Audio/Haptics/Fx/TimeTheme`) | 78 / 63 / 58 / 6 | aynı | delta 0 |
| state-rebind / registry `data=` | 37/37 fixture PASS / 0 | aynı / 0 | delta 0 |

`render()`, `App.go`, `#root`/`#app` innerHTML akışı, modal/focus sözleşmesi,
`migrate`, `getDay`, default state, `save` ve `sync.js` değiştirilmedi.

## Kapılar

- `node --check app.js`, `node --check sync.js`, tüm `app/core/*.js`: PASS.
- driver onboarding + seeded boot; `--dump bugun`: PASS.
- zikr harness **95/95**; modularization **101/101**; state-rebind **37/37**;
  Faz10 sync **69/69**; ÆON expand **24/24**: PASS.
- premium aile: 9 fixture, tamamı PASS; reminder smoke: **21** curated fixture PASS.
- B1 **0 failure**, B2 **67/67**, B3 **20/20**: PASS.
- `git diff --check`: PASS.

İki eski kaynak-locator fixture'ı (`test_premium_fx_utils`,
`test_today_card_preferences`), aynı assertion'ı birleşik production boot
grafiğinde/registry gövdesinde arayacak şekilde taşınan markup konumuna
hizalandı; assertion semantiği değişmedi.

## Gated sınırlar

`releaseApproval.status=not_approved` korundu. Browser/device acceptance,
native permission, notification, remote, push/merge/tag/deploy ve
`mustafaras/seyma-data` işlemi yapılmadı. MON-45 için yeni açık kullanıcı
onayı gerekir.
