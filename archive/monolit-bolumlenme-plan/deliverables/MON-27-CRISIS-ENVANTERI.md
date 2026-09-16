# MON-27 — Crisis domain envanteri ve parity kanıtı

**Tarih:** 2026-09-09
**Öncül:** MON-26
**Sınıf:** crisis domain
**Delege / registry:** `SeymaCrisis` / `window.SeymaCrisis`
**Durum:** tamamlandı; yalnız yerel değişiklik, push/deploy/device acceptance yok

## Sınır ve güvenlik-kritik envanter

MON-27 baseline'ı parent `a71ae17` içindeki canlı `app.js` üzerinden alındı.
`rg -n 'CRISES|openCrisis|crisisModal|craving' app.js | head -160` ile şu yüzey
envanterlendi:

| Parent kaynak | Baseline rolü | MON-27 sonucu |
|---|---|---|
| `app.js:498-572` `CRISES` | Tatlı/yemek/kahve katalog kopyası, option ve trigger listeleri | `app/core/crisis.js:30-102`, tek sahip |
| `app.js:571` `CRISIS_ORDER` | Üç kriz sırası | `app/core/crisis.js:103` |
| `app.js:8430-8437` `App.openCrisis` + craving handlerları | SOS sayacı, done alanı, trigger/note/option state yazımı | `app.js:8369-8376`, app-owned kaldı; yalnız katalog `crisisFor()` resolver'ından okunuyor |
| `app.js:10925-10955` `rasitActionsHTML` | Bugün yüzeyindeki üç SOS tile ve tatil gating görünümü | `app/core/crisis.js:105-136`, salt HTML |
| `app.js:11399-11542` `crisisModalHTML` | Tam ekran kriz modalı, safety copy, option/trigger expander, footer | `app/core/crisis.js:138-282`, salt HTML |
| `app.js:7456-7458`, `10993`, `14856` | Habit tile, Bugün kartı ve render çağrı noktaları | İmzalar/call site'lar korundu; app.js shimleri üzerinden çalışıyor |

Kopya manifesti: `CRISES` içinde 3 katalog, toplam 17 option ve 15 trigger
korundu. `hero`, `sciTitle`, `sci`, `winTitle`, `winText`, option label/icon ve
trigger id/icon/label/sci alanları değişmedi. Ayrıca modalın mevcut HALT metni,
kahve saat uyarısı, duygu adlandırma ipucu ve “Krizi kaydet” açıklaması yeni
metin eklenmeden taşındı. Yeni klinik öneri, reminder, network veya modal
altyapısı eklenmedi.

## Dependency ve sahiplik kararı

`app/core/crisis.js:11` dokuz dar, canlı resolver dependency'si ilan eder:
`data`, `ui`, `dark`, `todayStr`, `isVacationDay`, `icon`, `esc`, `find`,
`pad`. Registry yüklemesi storage/DOM/timer/ağ erişimi başlatmaz; `registerCrisis`
eksik bag'i ve ikinci kaydı reddeder. `rasitActionsHTML` yalnız `data`/`dark`
okur; `crisisModalHTML` yalnız `ui` okur. Registry içinde `save`, `commit`,
`render`, `fetch` çağrısı ve `data`/`ui` alan yazımı yoktur.

App kabuğunda kalan mutation/handler sınırı:

- `App.openCrisis`: vacation gate, haptic, `cravingSOSCount`, `savedAt`,
  `save()`, modal UI state reseti, `render()` ve `focusModalDialog`.
- `App.closeCrisis`, dropdown/option/trigger toggles, note debounce,
  `App.completeCrisis` ve `App.resetCrisis`: mevcut state write, save/commit,
  derived-habit ve render sırası aynen app.js'te.
- `focusModalDialog` ve `App.onModalKeydown` ortak altyapısı değiştirilmedi;
  dialog `role="dialog"`, `aria-modal="true"`, `tabindex="-1"` ve mevcut
  `App.onModalKeydown(event,App.closeCrisis)` yolu korunuyor.

## Parity kanıtı

Parent gövdeleri ile current registry çıktıları aynı sentetik resolver bag'i ve
aynı UI/data fixture'ı ile karşılaştırıldı:

| Yüzey | Parent → current çıktı |
|---|---:|
| sweet SOS tile | `4114 → 4114` byte, exact |
| food SOS tile | `4114 → 4114` byte, exact |
| coffee SOS tile | `4114 → 4114` byte, exact |
| sweet crisis modal | `20162 → 20162` byte, exact |
| food crisis modal | `20439 → 20439` byte, exact |
| coffee crisis modal | `20261 → 20261` byte, exact |
| combined `onclick=` count | `391 → 391` |
| combined unique `App.*` assignment surface | `718 → 718` |
| combined `App.*=function` count | `720 → 720` |

Catalog block SHA-256 (indentation/trailing newline normalize edilerek)
`ccf0d27230454c59`; crisis modal block SHA-256
`06365247b4457a55b4b258c1bf466c19a73d49c044d36d7b5768e144c19aa8f7`.
Modal parent/current block exact; catalog ve tile karşılaştırmalarında yalnız
modül wrapper indentation/trailing newline normalize edilmiştir.

## Load-order ve anti-amnesia etkisi

Yeni dosya aynı commit içinde dört zorunlu sıraya eklendi:

- `index.html:79` — `motivation.js` sonrasında, `mediaFx.js` öncesinde
  `app/core/crisis.js?v=20260909a`.
- `.claude/skills/run-seyma/driver.mjs` FILES ve
  `.claude/skills/run-seyma/zikr-harness.mjs` FILES aynı konum.
- `tests/app/test_state_rebind_boundary.js` boot listesi aynı konum.
- `verify-state-migration-boundary.mjs`, `test_aeon_message_expand.js`,
  `test_zikr_manual_entry.js` ve sekiz reminder app fixture'ının app boot
  listeleri de yeni zorunlu registry ile hizalandı. FX combined-source
  fixture'ları crisis kaynağını sayım/parity bag'ine aldı.

`tests/app/test_crisis_boundary.js` yeni 40 assertion'lı fixture'tır: load-safe
registry, dependency reddi/tek-kayıt, üç catalog/safety-copy, light tile,
üç modal, no-write, app-owned handler ve shim sınırlarını denetler.

## Kapı sonucu

Bu kartın final koşusunda exit 0:

- `node --check app.js`, `node --check sync.js`, `node --check app/core/crisis.js`;
- `node .claude/skills/run-seyma/driver.mjs --dump sos` — SOS dump üretildi,
  `/tmp/seyma-dump.html`, `8072` byte;
- `test_crisis_boundary` `40/40`, modal focus `41/41`,
  `test_motivation_room_accessibility` `24/24`, `test_faz10_sync` `69/69`;
- driver normal, zikr-harness `95/95`, modularization `72/72`, B1/B2/B3,
  state rebind `37/37`, save `19/19`, all app fixture loop;
- FX2, Premium, Quran, current panel, Panel-v2 ve reminder smoke aileleri;
- `git diff --check`.

Browser/device acceptance, remote push, merge, tag, Pages deploy ve
`mustafaras/seyma-data` yazımı yapılmadı. MON-28'a geçiş yapılmadı; sonraki
sıralı adım yalnız yeni açık kullanıcı yönüyle MON-28'dir.
