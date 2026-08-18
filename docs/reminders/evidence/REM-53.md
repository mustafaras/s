# REM-53 — App local privacy, sanitize ve sync adapter

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-53
- **Tarih:** 2026-08-18
- **Commit:** `6c1a4b0`
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `8a173e2` (REM-52 standing delivery receipt)
- **Bitiş HEAD:** `6c1a4b0` (+ kapanış receipt docs commit)
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none`

## Kapsam

- **Allowlist:** `app.js` (privacy adapter), `sync.js` (sanitize / merge boundary — **değiştirilmedi**, aşağıya bakınız),
  `tests/reminders/test_reminder_app_privacy.js` (yeni), `tests/reminders/test_reminder_sync_privacy.js`,
  mevcut sync fixture'ları (`tests/test_faz10_sync.js`, `tests/test_panel_p0_sync.js` — değiştirilmedi, regression olarak koşuldu)
- **Closure records:** `docs/reminders/evidence/REM-53.md`,
  `docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md`, `docs/reminders/APP-REMINDER-STATE.json`
- **Protected paths changed:** `no`
- **Kapsam dışı değişiklik:** `index.html` yalnız kapanış commit'inde cache-bust için (CLAUDE.md ilke 5)

## Yapılan

**Görev 1 — beş ayrı şema.** Reminder bilgisi taşıyan yüzeyler tek bir "gizli
veri" yığını değildir; her biri farklı depolama sınıfı, farklı sync sınıfı ve
farklı alan kuralı taşır. `REMINDER_PRIVACY_SCHEMAS` bunu açık sözleşme yapar:

| Şema | Depolama | Sync | Alan kuralı |
|---|---|---|---|
| `localOnlyKey` | `localStorage:` delivery / actions / permission | **hayır** | allowlist |
| `canonicalPreference` | `localStorage:seyma-reset-v1` → `data.reminders` | **hayır** | additive-local-only |
| `safeEventSummary` | `data.eventLog` | **evet** | sabit özet + hash'li correlation |
| `projectionSummary` | türetilmiş özet / export | **hayır** | yalnız toplam |
| `nativeCopy` | işletim sistemi bildirim merkezi | **hayır** | `title,body,tag,deepLink` |

Fixture beşinden **yalnız birinin** (`safeEventSummary`) sync sınırını geçtiğini
tek tek doğrular. `canonicalPreference` bilinçli olarak allowlist'siz kalır —
REM-45 bilinmeyen alanları korur — ve tam bu yüzden her sync payload'ından
çıkarılır. `App.reminderPrivacyReport(schemaId, value, samples)` bir kapı olarak
davranır: yasak alan adı, allowlist dışı alan ve sızan sentetik dize ayrı ayrı
raporlanır; `medicationName:false` gibi *boş bir sınır bayrağı* ihlal sayılmaz,
değer taşıyan bir alan sayılır.

**Görev 2 — negatif fixture'lar.** Terapi detayı, ilaç adı / etiketi / notu, ruh
hâli notu, namaz tamamlama, günlük metni, serbest not, GitHub token, OpenAI key,
sync URL, GPS etiketi ve ham bildirim gövdesi sentetik `SENTETIK_*` dizeleriyle
seed edilir ve dört yüzeyde birden aranır.

> **Dürüst kapsam notu.** `data.location`, `data.locationHistory` ve gün
> kayıtları app seviyesinde **meşru biçimde senkronlanan** alanlardır; panel
> bunları ayrıca redakte eder. REM-53'ün iddiası "GPS cihazdan çıkmıyor"
> değildir — iddia, bu alanların hiçbir **reminder** yüzeyine (local-only
> journal, safe event summary, projection summary, native copy) girmediğidir.
> Fixture bunu ayrı ayrı ifade eder.

**Görev 3 — sync durumu ↔ UI durumu.** `disabled / offline / pending / error /
synced` durumlarının beşi de ayrı bir app UI durumuna eşlenir; her biri için
kullanıcıya gösterilen metin ayrı, teknik olmayan ve token/secret içermez.
Bilinmeyen bir status `idle`'a, bilinmeyen bir error code `null`'a fail-closed
düşer. Bir projection / receipt hatası uygulama içi reminder yolunu kapatmaz
(`capability.inApp === 'available'`), arka plan yine dürüstçe `unsupported`
kalır. Receipt tarafında `lastErrorDetail` senkronlanan projeksiyonda `null`'a
indirilir; `accepted` receipt bile hiçbir reminder kimliği (`seyma-reminder-v1:`,
`reminder-preview-v1`) taşımaz.

**Görev 4 — full-replace kayıp sınırı.** App'in ürettiği payload'da reminder
kökü hiç yoktur, dolayısıyla bir full-replace snapshot'ı onu geri indiremez.
`mergeData` düşman bir remote snapshot reminder kökü taşısa bile onu içeri
almaz; cihaz kendi kökünü aynen korur, `sanitize` ise push'tan önce tümüyle
siler. Reminder kökü olmayan bir cihaz remote'tan bir tane kazanmaz. Fail-closed
tarafı da kanıtlı: serileştirilemeyen / yanlış tipte bir state için
`reminderSyncPayload` **kısmi bir payload değil, `null`** döner.

**Görev 5 — gerçek sistem yok.** Tüm doğrulama `node:vm` içinde sentetik state
ile çalışır; fetch sayacı 0, yazılan localStorage anahtarları yalnız
`seyma-reset-v1`, `seyma-event-device-v1` ve üç local-only reminder anahtarıdır.

**Gerçek tutarsızlık düzeltildi.** `scheduleMoveSync()` ham `data`yı doğrudan
`SeySync.schedule`'a veriyordu; yani app tarafında iki farklı sözleşme vardı.
Ağ sınırı hiç açılmamıştı — `sync.js`'in `sanitize()`'i local-only kökleri her
durumda siliyor — fakat tek geçit ilkesi kırıktı. Artık her iki yol da
`reminderSyncPayload`'dan geçer ve fixture kaynak üzerinde
`SeySync.schedule(data)` çağrısının **sıfır** kaldığını sabitler.

**`sync.js` neden değişmedi.** REM-53'ün allowlist'i `sync.js` sanitize / merge
sınırını açıyor, fakat bu sınır REM-25 (local-only key + conflict merge) ve
REM-38 (anti-clobber + receipt) ile zaten doğru kurulmuştu. Kanıtlanması gereken
şey davranış değil, **zincirin bütünüydü**; kozmetik bir değişiklik yapmak yerine
mevcut sınır app tarafıyla birlikte 347 assertion'a kadar genişletilmiş
fixture'la doğrulandı. Bu bilinçli bir no-op karardır.

## Doğrulama

| Kapı | Sonuç |
|---|---|
| `test_reminder_app_privacy.js` (yeni) | PASS · 198 assertion · 10 senaryo |
| `test_reminder_sync_privacy.js` | PASS · 347 (97 → 347, dört yeni REM-53 senaryosu) |
| `test_faz10_sync.js` | PASS · 64/64 |
| `test_panel_p0_sync.js` | PASS · 31/31 |
| `test_reminder_privacy.js` / `test_reminder_app_state.js` / `test_reminder_retention.js` | PASS · 58 / 52 / 58 |
| Tüm fixture (`tests/reminders`, `tests`, `tests/panel-v2`) | PASS · 114/114 |
| Headless harness (driver, zikr, B1/B2/B3) | PASS · 5/5 |
| `node --check` (app, sync, sw, panel, reminderDelivery) | PASS |
| `git diff --check` | PASS |
| `verify-reminder-context.mjs` | PASS · 73 prompt, 66 link |

Gerçek tarayıcı, gerçek ağ çağrısı, gerçek kullanıcı localStorage'ı ve
`mustafaras/seyma-data` yazması **yok**.

## Kapanış

APP-02 privacy ve APP-04 sync kısmı kapandı. `activePrompt=REM-54`,
`lastCompletedPrompt=REM-53`. Release `not_approved`; S5 kullanıcı-cihaz kabulü
pending.
