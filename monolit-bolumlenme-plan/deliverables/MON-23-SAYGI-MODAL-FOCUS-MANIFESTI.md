# MON-23 · Saygı domain / modal-focus manifesti

Tarih: 2026-09-04
Durum: ✅ TAMAMLANDI
Öncül: MON-22 · `SeymaQuran` registry
Sınıf: saygi domain
Delege: `window.SeymaSaygi`
Dal: `zikirmatik-manuel-zikir` · LOCAL-ONLY

## Karar

Saygı/Öncü, İman, kıble, Hicri/Kandil ve biyografi-okuma yardımcıları
`app/core/saygi.js` içindeki tek bir load-safe registry'ye ayrıldı. `app.js`
aynı global isimleri ve imzaları koruyan delegeleri, canlı dependency bag kaydını,
App handlerlarını, gerçek state rebind'lerini, ortak modal focus altyapısını ve
kıble permission/sensör DOM akışını korur.

`SaygiPeople` ve `HijriCalendarV1` content registryleri lazy okunur. `saygi.js`
yüklenirken storage, fetch, DOM, timer, GPS veya permission çağrısı yapılmaz.
Prayer modülü, content dosyaları, panel ve modal altyapısı bu kartta değişmemiştir.

## Bağ sınıflandırması

| Bağ / yüzey | Sahip | Sınıf | Karar |
|---|---|---|---|
| `emptySaygiRoot`, `ensureSaygiRoot`, `emptySaygi`, `ensureSaygiDay` | `SeymaSaygi` + app canlı `data` resolver | B1/state-okur | Registryde; gerçek `data` rebind app.js'te |
| Öncü seçimi, koleksiyon/seri, okuma cache ve makale dönüşümü | `SeymaSaygi` | saf + lazy content | Registryde; Wikipedia fetch yalnız açık çağrıda |
| `saygiHTML`, preview/collection/source/article yardımcıları | `SeymaSaygi` | saf HTML | Registryde; `icon`, `esc`, tarih, feature ve render resolver ile |
| İman kartı/overlay, prayer row, Hicri/Kandil rozetleri | `SeymaSaygi` + `SeymaPrayer` | saf HTML + named prayer resolver | Prayer gövdesi ve GPS sahipliği değişmedi |
| Kıble bearing/distance/metrics/alignment ve overlay | `SeymaSaygi` | saf hesap + saf HTML | Cihaz sensörü/permission app.js'te |
| `qiblaSmoothAngle`, `qiblaPaintLive`, orientation listener | app.js | DOM/sensör yan etkisi | Registryye taşınmadı |
| `App.openSaygi*`, `App.markSaygiRead`, `App.openQibla`, `App.closeQibla` | app.js | mutation/rebind/handler | Inline `App.*` yüzeyi korunuyor |
| `wireSaygiReadGate` / `saygiDisconnectReadObserver` | `SeymaSaygi` | DOM gate adapter | Ortak modal keyboard handlerını çağırmaz; app.js wiring'i aynı |
| modal `role=dialog`, `aria-modal`, focus açılışı, Tab/Escape | app.js + HTML registry çıktısı | I4 accessibility contract | Üç yeni registry çıktısı ortak contract ile eşit |

## Taşınan ve korunan kaynaklar

- Taşınan: Saygı root/day yardımcıları; people/date/cache/article helpers;
  `saygiHTML` ailesi; İman kart/overlay ve rapor yardımcıları; kıble saf
  hesap/overlay; Hicri/Kandil shims; `wireSaygiReadGate` ve floating Okudum
  üreticisi.
- App.js'te korunan: canlı `data`/`ui`, `render`, tüm Saygı `App.*` handlerları,
  `qiblaSmoothAngle`, `qiblaPaintLive`, orientation listener/permission/GPS,
  ortak `onModalKeydown` ve `focusModalDialog`.
- Dokunulmayan yasaklı yüzeyler: `app/content/saygiPeople.js`,
  `app/content/hijriCalendar.js`, `app/core/prayer.js`, panel dosyaları ve
  modal altyapısı.

## Yükleme / cache / fixture etkisi

`index.html` sırası `zikir → quran → saygi → mediaFx` oldu:

- `app/core/saygi.js?v=20260904a`
- `app.js?v=20260904f`

Production FILES paritesi driver ve zikr-harness'a; app.js boot eden state,
ÆON, zikir-manual ve reminder fixture'larına aynı `saygi.js` girişiyle taşındı.
Quran-only, panel, content ve prayer fixture'ları kapsam dışı bırakıldı.

## Dump ve keyboard parity

Parent MON-22 `saygiPreviewCardHTML` ile MON-23 registry çıktısı aynı sentetik
`icon`/`esc` bag'i ve Grace Hopper fixture'ı ile karşılaştırıldı: 1219 byte,
SHA-256 `c69bee63eadfd109b8daa51b438e580ea6e88e7339356b21bfd534e0a853cf86`.

İman, Kıble ve Öncü modal çıktılarının her biri şu ortak işaretleri taşır:
`role="dialog"`, `aria-modal="true"`, `tabindex="-1"` ve
`onkeydown="App.onModalKeydown(event,...)`. Hiçbir modal backdrop'u
`role="button" tabindex="0"` değildir. Sabit modal Okudum düğmesi ve read-gate
sentinel'ı korunmuştur. `test_modal_focus_containment.js` ortak Tab,
Shift+Tab ve Escape davranışını 39/39 geçer.

## Kapı kanıtı

Bu manifest kapanmadan önce ağsız Node/VM doğrulaması yapıldı:

- `test_saygi_boundary.js`: 20/20; lazy SaygiPeople/HijriCalendar, root/read,
  kıble, modal contract, no-load-side-effect ve dump hash.
- `zikr-harness.mjs`: 95/95; Saygı/İman/Kıble render, canlı sensör DOM yolu,
  Okudum ve migration regressions.
- `driver.mjs`: exit 0; onboarding, location gate, seeded boot, reminder
  deep-link ve render regression.
- state B1/B2/rebind, modal focus, modularization/Faz−1.1, tüm app fixture'ları
  ve `tests/app/test_premium_*.js`: exit 0; premium toplamı 249/249.
- `sync.js` syntax, Quran/reminder/panel regression ve `git diff --check`:
  exit 0.

Preflight farkları saklanmadı: B1 isolated helper fixture'ı yeni `SeymaSaygi`
registry'sini yüklemediği için bir kez fail etti; modal ve zikr fixture'larındaki
eski kaynak aralığı da yeni sahipliğe göre güncellendi. Yükleme sırası için
yorumlarda anılan `verify-load-order.mjs` dosyası bu checkout'ta yoktu (invocation
`MODULE_NOT_FOUND`); driver, zikr-harness ve state-rebind içindeki gerçek
index/FILES fail-fast assertions eşdeğer kanıt olarak yeniden PASS verdi. Bu
düzeltmeler yalnız fixture/evidence routing'dir; üretim saygı, prayer, content,
modal veya veri davranışı bu sebeple geri/ileri alınmadı.

S1–S8, I1–I6 ve M1–M4 açısından tek sahip, doğru script sırası, hedef suite
kanıtı ve handler/state/migration/sync sınırları korunmuştur. Browser/device,
push, merge, tag, deploy, remote ve `mustafaras/seyma-data` yazımı yapılmadı.
Sıradaki kart MON-24'tür; yeni açık kullanıcı yönü olmadan başlatılmaz.
