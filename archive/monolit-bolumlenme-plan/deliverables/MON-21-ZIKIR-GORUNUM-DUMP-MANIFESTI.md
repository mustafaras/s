# MON-21 · Zikir görünüm dump manifesti

**Tarih:** 2026-09-04
**Öncül:** MON-20 (`b0ea75b2937c2681c474d73df57e73fca2f4968e`)
**Durum:** ✅ tamamlandı · LOCAL-ONLY
**Kapsam:** `app/core/zikir.js` görünüm registry'si ve `app.js` imza-koruyan shimleri

## Karar ve sınır

MON-21'de zikir view üreticileri, MON-20'de kurulan aynı `window.SeymaZikr`
registry'sine alındı. `app.js` yalnız resolver bag'i, imza-koruyan shimleri,
app-owned draft mutation'larını, overlay/focus kabuğunu, yerinde DOM paint'i,
render'ı ve `App.*` handler'larını taşır.

Taşınan 16 üye:

`zikrPreviewCardHTML`, `zikrDetailControlsHTML`, `zikrResetConfirmHTML`,
`zikrActionNoteHTML`, `zikrNoteEditorHTML`, `zikrManualAmountOf`,
`zikrManualQuickChips`, `zikrManualPreviewHTML`, `zikrManualSheetHTML`,
`zikrCounterViewHTML`, `zikrPresetsResultsHTML`, `zikrPresetsViewHTML`,
`zikrHatimsViewHTML`, `zikrHistoryViewHTML`, `zikrSettingsViewHTML`,
`zikrViewBodyHTML`.

`zikrNoteDraftFor` ve `zikrManualDraftFor` registry içinde yalnız resolver
köprüsüdür; `ui` başlatan mutation gövdeleri app.js'te kaldı.

## Canlı envanter

- Registry view/resolver bölümü: [`app/core/zikir.js:561-990`](../../app/core/zikir.js:561).
- Zikir view resolver bag'i: [`app.js:238-261`](../../app.js:238).
- İmza-koruyan view shimleri: [`app.js:13907-13921`](../../app.js:13907); body resolver shim'i [`app.js:13959`](../../app.js:13959).
- App-owned draft mutation'ları: [`app.js:13923-13938`](../../app.js:13923).
- Overlay, focus/keydown ve yerinde paint kabuğu: [`app.js:13939-13972`](../../app.js:13939).
- Registry load sırası `index.html` içinde korunmuştur; yeni dosya veya FILES
  üyesi yoktur. Değişen asset cache-bust değerleri: `zikir.js?v=20260904b`,
  `app.js?v=20260904d`.

## Önce/sonra sentetik dump parity

Parent kaynak `b0ea75b2937c2681c474d73df57e73fca2f4968e:app.js` görünüm
gövdeleri ile güncel `SeymaZikr` registry'si aynı sentetik root, sabit tarih,
resolver bag'i ve sabit hatim kimliğiyle üretildi. Her satırda byte, SHA-256 ve
inline `onclick`/`oninput`/`onkeydown` handler dizisi eşittir.

| Görünüm / body resolver | Önce byte | Sonra byte | Önce SHA-256 = Sonra SHA-256 | Önce/sonra handler |
|---|---:|---:|---|---:|
| counter | 8670 | 8670 | `7b5889d77a927463efe0aab16ad76b88384908fee0090a277f0ea4168e6a16a3` | 29 / 29 |
| presets | 8067 | 8067 | `dc1a3175dc54733001d67a9b8f147f36569c5827e60e938a446350102dbdef4b` | 29 / 29 |
| hatims | 1557 | 1557 | `7eebfdbfe2eafeda2518cc098b3d7f7c74b582d33deaea0eecf6e59bc9851c4d` | 4 / 4 |
| history | 2207 | 2207 | `60e0b7cd7cc21a4b21e33f97899103385f23e1d21d34661254883213d03a4755` | 1 / 1 |
| settings | 2260 | 2260 | `80dfd44d0225f18e32589f2e36154a08529e507779e80935e23b173bf9d47a26` | 7 / 7 |

`zikrViewBodyHTML` beş route için bu aynı satırları dispatch eder; fixture'da
counter route ayrıca body resolver üzerinden doğrulanır. Dolayısıyla tab
gövdesi çıktısında HTML, modal/onclick ve handler sırası farkı yoktur.

## Korunan yüzeyler

- `zikrTouchTick`, hedef/hatim/session/history/settings/manual motoru ve save
  sırası MON-20 registry'sinde aynen kaldı.
- `SeyAudio`/`SeyHaptics`/guide çağrıları ve guardları değiştirilmedi; yeni
  ses veya haptic eklenmedi.
- Frozen zikir content katalogları, `migrate()`, `render()` çekirdeği, `data`
  rebind'leri, `App.*` ad/imza yüzeyi, overlay focus sözleşmesi ve DOM paint
  kabuğu değiştirilmedi.
- `sync.js`, panel, `data/`, remote, push, merge, tag, deploy ve browser/device
  kabulü bu kartın dışında ve dokunulmamıştır.

## Kanıt kapıları

- [`tests/app/test_zikir_view_boundary.js`](../../tests/app/test_zikir_view_boundary.js):
  registry/no-side-effect/shim/mutation sınırı + sabit dump parity `17/17`.
- `node --check app.js`: PASS.
- `node --check app/core/zikir.js`: PASS.
- `node .claude/skills/run-seyma/zikr-harness.mjs`: `95/95`.
- `node .claude/skills/run-seyma/driver.mjs`: PASS.
- Premium audio/haptics/voice kapıları: PASS.

Bu belge kaynak ve headless VM kanıtıdır; canlı deploy veya gerçek cihaz kabulü
iddiası değildir. Sonraki sıralı kart `MON-22` olup yeni açık kullanıcı yönü
olmadan başlatılmaz.
