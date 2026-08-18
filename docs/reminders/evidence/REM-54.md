# REM-54 — App module, cache-bust ve headless acceptance

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-54
- **Tarih:** 2026-08-18
- **Commit:** `78d17a8`
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `e34196e` (REM-52 düzeltme: teslim makbuzu)
- **Bitiş HEAD:** `78d17a8` (+ kapanış receipt docs commit)
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none`

## Kapsam

- **Allowlist:** `tests/reminders/test_reminder_app_acceptance.js` (yeni G12-K gate),
  `tests/reminders/test_reminder_boot.js` (REM-44 sözleşmesi güncellendi),
  `.claude/skills/run-seyma/driver.mjs` ve `zikr-harness.mjs` (reminder fixture
  assertion'ları), `index.html` + `app.js` (yalnız ilgili remediation)
- **Closure records:** `docs/reminders/evidence/REM-54.md`,
  `docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md`, `docs/reminders/APP-REMINDER-STATE.json`
- **Protected paths changed:** `no`
- **Panel dosyası değişikliği:** `no` (`panel.js`, `panel.html`, `panel.css`,
  `panelCoverageManifest.js` diff'te yok)

## Bulunan gerçek kusur — G12-K'nın asıl getirisi

Bu prompt bir "yeşil testleri tekrar koştur" turu değildi. Acceptance gate'i
**canlıda çalışan bir yalanı** ortaya çıkardı:

`app/core/reminderEngine.js` (REM-46), `app/core/reminderScheduler.js` (REM-50)
ve `app/core/reminderDelivery.js` (REM-52) diske yazıldı, ayrı ayrı test edildi
ve receipt'lerde "modül ve fallback yolunda doğrulandı" diye raporlandı —
**fakat hiçbiri `index.html`'e bağlanmamıştı.** `app.js` üçünü de çalışma anında
tercih ediyordu:

| Modül | app.js erişimi | index.html |
|---|---|---|
| `ReminderCatalogV1` | `window.ReminderCatalogV1` | ✅ yüklü |
| `ReminderEngineV1` | `window[key]`, `key='ReminderEngineV1'` | ❌ **yüklü değil** |
| `ReminderSchedulerV1` | `window.ReminderSchedulerV1` | ❌ **yüklü değil** |
| `ReminderDeliveryV1` | `window.ReminderDeliveryV1` | ❌ **yüklü değil** |

Sonuç: üretimde **her zaman inline fallback** çalışıyordu; üç modül dosyası ölü
kod olarak deploy ediliyordu.

Kusur bu kadar uzun süre görünmez kaldı, çünkü REM-44 boot fixture'ı tam tersini
donduruyordu (`assert(!INDEX.includes('app/core/reminderEngine.js'))` ve
`assert(!APP_SOURCE.includes("window.ReminderEngineV1"))`). İkinci iddia yalnızca
`app.js`'in `var key='ReminderEngineV1'; window[key]` **dolaylı erişimi**
sayesinde geçiyordu — yani string literal kaçamağı bir testi sessizce atlatıyordu.

## Yapılan

**Görev 1 — fixture matrisi.** Yeni `test_reminder_app_acceptance.js` (19 senaryo,
487 assertion) şu boot'ları gerçek `node:vm` içinde sürer: kilitli boot,
reminder-onboarding, seeded, light, dark, mobil genişlik (360px), overlay +
draft, offline, permission (granted / denied / default / unsupported / revoked)
ve modülsüz boot.

> **Vakumluk önlemi (REM-52 dersi).** Her render iddiasından önce
> `assertReminderCenterRendered()` ekranın DOLU olduğunu kanıtlar. Bu, fixture'ı
> yazarken hemen işe yaradı: konum hard gate'i ve auth kapısı her render'ı
> engelliyordu, dolayısıyla "içerik sızmıyor" iddiaları boş ekranda sessizce
> doğru çıkacaktı. Fixture kapıyı açık bir kullanıcı eylemiyle geçer.

**Görev 2 — driver ve zikr harness.** İki harness artık `index.html` ile **aynı
boot setini** yükler. `driver.mjs`: Reminder Center açılış/kapanış, sistem durum
bloğu, faith köşesi, okuma hub'ı, deep-link tablosu, bildirim kanalı
sınıflandırması ve `moduleLoaded === true` (modülün gerçekten canlı sınır sahibi
olduğunun doğrudan kanıtı). `zikr-harness.mjs`: zikir ve Saygı deep-link
hedefleri, zikir hatırlatmasını açmanın sayımı/streak'i değiştirmediği ve
kanal ayrıklığı.

**Görev 3 — regression.** Root fixture'lar, migration/helper boundary ve
Panel-v2 ayrı regression olarak yeniden koşuldu.

**Görev 4 — remediation (modül ↔ fallback denkliği önce kanıtlandı).** Modülleri
bağlamak üretim davranışını değiştirebileceği için **önce denklik kanıtlandı,
sonra kablolama yapıldı**:

| Modül | Denklik kanıtı |
|---|---|
| delivery | fallback, modülün **değerce özdeş alt kümesi**; beş payload için sınıflandırma birebir aynı |
| engine | dört giriş (normal, saatli, artık yıl, tümüyle geçersiz) için occurrence ve `occurrenceId` birebir aynı |
| scheduler | 8 tetiklik dizide `receivedCount/evaluateCount/coalescedCount/deliveryCount`, matris sayaçları ve trigger sırası aynı |

> Delivery modülü fallback'ten **daha zengindir** (`owner`, `idField`, `tags`,
> `payloadTypes`, `capKind` ek alanları). Sözleşme "birebir aynı nesne" değil,
> "fallback modülün değerce özdeş alt kümesi + davranış aynı"dır; fixture bunu
> bu şekilde ifade eder.
> Scheduler karşılaştırması `lastAtMs` duvar saatini **bilerek** dışarıda
> bırakır; iki ardışık boot doğal olarak milisaniye farkıyla ayrılır.

Denklik yeşil olduktan sonra:

- `index.html`: üç modül `reminderCatalog.js`'den sonra, `app.js`'den önce,
  `?v=20260818a` cache-bust ile eklendi.
- `index.html`: `app.js` cache-bust `20260818f → 20260818g` (CLAUDE.md ilke 5).
- `app.js`: `reminderEngineModule()` dolaylı `window[key]` erişimi doğrudan
  `window.ReminderEngineV1` referansına çevrildi — test kaçamağı kaldırıldı,
  davranış aynı.
- `test_reminder_boot.js`: eski negatif iddialar pozitif sözleşmeye çevrildi
  (üç modül cache-bust ile yüklü **olmalı**). Hiç yazılmamış `reminderState`
  modülünün uydurulmadığı iddiası korundu.

**Görev 5 — app-only scope.** Diff yalnız `app.js`, `index.html`,
`tests/reminders/*` ve iki harness'a dokunur. `panel.js` / `panel.html` /
`panel.css` / `panelCoverageManifest.js` **değişmedi**. Fixture ayrıca app
runtime'ının panel yazıcılarına (`putInbox`, `putTransportFileP`,
`loadObserverProjectionP`, `observer-snapshot.json`, `PanelCoverageV1`,
`coverageForData`, `redactForObserver`) hiç referans vermediğini sabitler.

> **Dürüst kapsam notu — "no-network".** Konum kapısını açık kullanıcı eylemiyle
> geçmek app'in **önceden var olan** namaz/konum özelliğini tetikler ve 2 fetch
> üretir. Bu reminder'a ait değildir. Bu yüzden iddia "hiç fetch yok" değil,
> **"reminder yolu sıfır ağ çağrısı ekler"**dir: fixture konum grant'ından sonra
> bir baseline alır, tüm reminder etkileşimlerinden sonra sayacın değişmediğini
> ve kaydedilen hiçbir URL'in reminder adresi taşımadığını ayrı ayrı doğrular.
> Modül yüklemeyen boot'larda mutlak sayaç zaten 0'dır.

## Doğrulama

| Kapı | Sonuç |
|---|---|
| `test_reminder_app_acceptance.js` (yeni) | PASS · 487 assertion · 19 senaryo |
| `test_reminder_boot.js` (güncellendi) | PASS · 40 assertion |
| `node --check` (app, sync, sw, panel, panelCoverageManifest, 4 app/core modülü, constants) | PASS · 10/10 |
| `driver.mjs` | PASS (17 yeni REM-54 assertion dahil) |
| `zikr-harness.mjs` | PASS · 95/95 (90 → 95) |
| `verify-state-helper-boundary.mjs` | PASS · 0 failure |
| `verify-state-migration-boundary.mjs` | PASS · 32/32 |
| `verify-state-adapter-contract.mjs` | PASS · 20/20 |
| Root fixture (`tests/test_*.js`) | PASS · 33/33 |
| Reminder fixture (`tests/reminders/`) | PASS · 55/55 |
| Panel-v2 ayrı regression (`tests/panel-v2/`) | PASS · 27/27 |
| **Toplam fixture** | **PASS · 115/115** |
| Script tag balance (`index.html`) | PASS · 20 açılış / 20 kapanış |
| Cache-bust | PASS · `src`'li her klasik script `?v=` taşıyor |
| Console error / warn | PASS · her senaryoda 0 |
| `git diff --check` | PASS |

Gerçek tarayıcı, gerçek ağ çağrısı, gerçek kullanıcı localStorage'ı,
deployment ve `mustafaras/seyma-data` yazması **yok**.

## Kapanış

R12 app gate ve APP-01 (boot / namespace / cache-bust) kapandı.
`activePrompt=REM-55`, `lastCompletedPrompt=REM-54`. Release `not_approved`;
S5 kullanıcı-cihaz kabulü pending.
