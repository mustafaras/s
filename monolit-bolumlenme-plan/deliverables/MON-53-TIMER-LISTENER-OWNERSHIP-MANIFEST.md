# MON-53 — Timer/listener/foreground sahiplik manifesti

**Kart:** MON-53 · **Durum:** tamamlandı · **Tarih:** 2026-09-13
**Kapsam:** yalnız `SeymaAppSurface` global timer/listener/foreground
köprüleri ve app.js kayıt kabuğu. Yerel-only; release onayı yoktur.

## Karar

`app/core/appSurface.js` içindeki yeni lifecycle registry, callback gövdelerini
load-time yan etki üretmeden taşır. `app.js` canlı dependency bag’ini bir kez
kaydeder ve timer/listener kayıtlarını aynı sırada, aynı sürelerle ve aynı
browser event türleriyle yapmaya devam eder. Registry yüklenirken DOM, timer,
storage, fetch, sync veya başka callback çağrısı yapılmaz; eksik ya da ikinci
lifecycle kaydı fail-closed reddedilir.

## Sahiplik tablosu

| Yüzey | Registry callbacki | Kayıt sahibi | Korunan davranış |
|---|---|---|---|
| Session activity | `onUserActivity` | `app.js` | `click`, `input`, `keydown`, `scroll`, capture=true |
| Session heartbeat | `sessionHeartbeat` | `app.js` | `setInterval(...,60000)`, idle eşikleri ve `updateLiveSession()` |
| Session teardown | `finalizeSession` | `app.js` | `beforeunload` → `pagehide` sırası; ambiyans stop + session save |
| Session visibility | `onSessionVisibilityChange` | `app.js` | ilk visibility listener; hidden/focus dönüşü, location resume, nudge |
| App polling | `pollRemote`, `maybeRetrySync` | `app.js` | ilk 1500 ms, 30 s ÆON/sağlık/Quran polling ve 5 dk retry watchdog |
| Background scene | `ambienceRefresh` | `app.js` | ayrı 30 s timer; hidden iken no-op, görünürken `syncHeaderScene()` |
| Reminder timer | `reminderLifecycleTimer` | `app.js` | reminder timer’ı app poll’dan ayrı, mevcut interval sabit |
| Storage/foreground | `reconcileReminderStorageEvent`, `onDocumentVisibilityChange`, `onWindowFocus`, `onWindowPageshow`, `onWindowOnline`, `onWindowOffline` | `app.js` | `storage`, `visibilitychange`, `focus`, `pageshow`, `online`, `offline` türleri ve kayıt sırası |
| Boot greeting | `maybeVoiceGreeting` | `app.js` | 2200 ms boot callbacki, quiet-time ve mevcut throttle/persistence |

Özellik-içi timer/listener gövdeleri bu karta alınmadı: room/nefes/karar
timer’ları, Quran bounded timeout’ları, modal focus/transition timer’ları,
Qibla sensor listener’ları, ÆON medya timer’ları, splash/replay timer’ları ve
service-worker message listener. `sync.js` online listener’ı, Guard 1/2,
`SeyOnSyncState`/`SeyOnSynced`, transport ve gerçek network sahipliği de
değişmedi.

## Kaynak delta ve parity

| Ölçüm | HEAD baseline | MON-53 current | Sonuç |
|---|---:|---:|---|
| app.js bytes / lines | 1,123,106 / 13,249 | 1,120,785 / 13,190 | yalnız callback body/shim neticesi |
| `App.*` function / all / unique | 556 / 721 / 718 | 556 / 721 / 718 | eşit |
| app.js timer registrations (`setInterval`, `setTimeout`) | 10 / 42 | 10 / 42 | eşit |
| app.js listener registrations / removals | 24 / 3 | 24 / 3 | eşit |
| canonical data assignment | 9 source lines / 11 tokens | 9 / 11 | eşit |
| `app/core/appSurface.js` | 170 lines / 14,602 bytes | 359 / 23,916 | lifecycle registry eklendi |

Inline caller/App yüzeyi, `data`/`ui`/`dark` rebindleri, `migrate()`,
`render()`, `save()`, sync.js, persistence schema, timer hızları, listener
türleri, network retry ve Premium FX çağrı semantiği değiştirilmedi.

`index.html` yalnız değişen `appSurface.js` ve app.js için tek cache-bust
artışıyla `20260913a` oldu. Yeni core dosyası eklenmedi; driver, zikr-harness,
state-rebind ve diğer FILES dizilerinin sırası değişmedi.

## Kanıt

- `tests/app/test_app_surface_lifecycle_boundary.js`: **16/16** — cold-load
  no-op, dependency contract, incomplete/duplicate fail-closed, callback
  invocation, timer/listener ownership and cache-bust parity.
- `tests/app/test_aeon_message_expand.js`: **24/24** — ÆON expansion remains
  stable across poll/reminder/foreground renders; source trigger inventory
  accepts the registry-owned focus bridge.
- `node .claude/skills/run-seyma/driver.mjs`: PASS.
- `node .claude/skills/run-seyma/zikr-harness.mjs`: **95/95**.
- `node tests/app/test_faz10_sync.js`: **69/69**; no fetch/network path.
- State/rebind: **37/37**, B1/B2/B3 PASS; `test_modularization_boundary`:
  **101/101**; all `tests/app/test_*.js`: **51 files, exit 0**.
- Premium family: all `tests/app/test_premium_*.js` exit 0; affected voice
  static assertion now checks the actual registry owner as well as app.js.
- Quran **9 files**, current panel **23 files**, Panel-v2 **27 files** and
  reminder smoke **21 curated fixtures** exit 0.
- `node --check app.js`, `node --check sync.js`, `node --check
  app/core/appSurface.js`, `git diff --check`: PASS.

All evidence is synthetic/headless and local. No browser profile, real
localStorage, token, remote read/write, `mustafaras/seyma-data`, push, deploy,
device acceptance or release clearance was performed.
