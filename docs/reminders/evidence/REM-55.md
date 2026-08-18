# REM-55 — Panel source authority ve projection seçim sözleşmesi

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-55
- **Tarih:** 2026-08-18
- **Commit:** `0a3b819`
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `ff9d482` (REM-54 kapanış kanıtı, ledger ve STATE)
- **Bitiş HEAD:** `0a3b819` (+ kapanış receipt docs commit)
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none`

## Kapsam

- **Allowlist:** `panel.js` (source selection), `panelCoverageManifest.js`
  `chooseProjection` sınırı (**değiştirilmedi** — aşağıya bakınız),
  `tests/reminders/test_reminder_panel_source.js` (yeni G13-A gate),
  mevcut panel projection fixture'ları (`test_panel_p1_projection.js`,
  `test_panel_p0_sync.js` — değiştirilmedi, regression olarak koşuldu)
- **Closure records:** `docs/reminders/evidence/REM-55.md`,
  `docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md`, `docs/reminders/APP-REMINDER-STATE.json`
- **Protected paths changed:** `no`
- **App runtime dosyası değişikliği:** `no` (`app.js`, `sync.js`, `index.html`,
  `app/core/*` diff'te yok)
- **Panel-v2:** ayrı regression olarak koşuldu, değiştirilmedi

## Bulunan gerçek kusur — kaynak nedeni yanlış nesneden okunuyordu

`panel.js` `load()` içindeki `Promise.all` sırası şudur:

| index | yükleyici | dönen şekil |
|---|---|---|
| `res[3]` | `loadSyncReceiptP()` | **normalize sync receipt** — `status`, `lastErrorCode`, `acceptedAt`, `sourceLatestSha` … |
| `res[4]` | `loadObserverProjectionP()` | **projection yükleme sonucu** — `{snapshot, sha, reason}` |

Seçim bloğu, kaba `projection_missing` sonucunu yükleyicinin daha özgül
nedeniyle yükseltmeye çalışıyordu — fakat `res[4]` yerine **`res[3]`**
okuyordu:

```js
if(chosen&&chosen.reason==='projection_missing'&&res[3]&&res[3].reason&& … ) chosen.reason=res[3].reason;
```

`normalizeSyncReceiptP()` sabit bir şekil üretir ve içinde **`reason` alanı hiç
yoktur**. Dolayısıyla koşul her zaman falsy'ydi ve yükseltme **hiçbir zaman
çalışmadı** — ölü koddu.

**Kullanıcıya yansıyan sonuç:** `data/observer-snapshot.json` bir **401 / 403
(permission)** veya ağ hatasıyla çekilemediğinde `chooseProjection`'a `null`
gider, kaba neden `projection_missing` olur ve panel `b-dim` tonunda
**"Projection yok — Eski latest.json güvenli redaction fallback olarak
kullanılıyor"** gösterir. Yani bir **yetki/ağ arızası**, "zaten projection
yapılandırılmamış" gibi **zararsız** okunur. `projectionStatusP` doğru ayrımı
(`projection_permission` / `projection_network` → `b-warn`, "Projection
okunamadı") zaten tanımlıyordu; o dal hiç beslenmiyordu.

Bu tam olarak REM-55 Görev 2 (receipt ile projection alanlarını karıştırma) ve
Görev 3 (yok / stale / pending / error ayrımını koru) ihlalidir.

## Yapılan

**Görev 1 — altı ayrı, deterministik source state.** Yeni fixture altı durumu
ayrı ayrı sabitler ve **başarının yalnız tek bir yoldan** geldiğini kanıtlar:

| Girdi | `source` | `reason` |
|---|---|---|
| geçerli projection + accepted receipt (sha & revision eşleşiyor) | `projection` | `ready` |
| `sourceLatestSha` **veya** `snapshotRevision` uyuşmuyor | `legacy_fallback` | `projection_stale` |
| projection yok (`null`) | `legacy_fallback` | `projection_missing` |
| bozuk gövde (şema/hash/ISO/`data` hatası, geçersiz JSON) | `legacy_fallback` | `projection_invalid` |
| `acceptedAt` **veya** `sourceLatestSha` olmayan receipt | `legacy_fallback` | `receipt_missing` |
| yükleyici hatası (401/403/ağ/parse) | `legacy_fallback` | `projection_permission` / `projection_network` / `projection_parse_failed` |

Fixture ayrıca `source === 'projection'` ile `reason === 'ready'`in **birbirinin
tam karşılığı** olduğunu (biri diğeri olmadan olamaz) ve beş temel durumun beş
**ayrık** neden ürettiğini sabitler. Stale bir snapshot **tanı için** korunur,
**veri kaynağı olarak kullanılmaz**.

**Görev 2 — alanlar karışmaz.** `sourceLatestSha`, `snapshotRevision`,
`sourceUpdatedAt`, `projectionBuiltAt` ve `serverAcceptedAt` beş ayrı alandır.
Fixture ikisini yer değiştirmenin **başarı değil `projection_stale`** ürettiğini
gösterir. `projectionBuiltAt` ile `serverAcceptedAt` **eşit olabilir** —
sözleşme ayrı alanlar olmalarıdır, eşitsizlikleri değil; fixture bunu bu şekilde
ifade eder.

**Görev 3 — durum ayrımı korunur (kusur düzeltmesi).** Gömülü ve hatalı neden
çözümlemesi, `projectionStatusP`'nin yanına konan adlandırılmış ve test
edilebilir bir fonksiyona taşındı:

```js
function projectionSourceStateP(chosen,projectionLoad){ … }
```

- Yalnız kaba `projection_missing` durumunu yükseltir.
- `ready`, `projection_stale`, `receipt_missing` **asla ezilmez**.
- Yükleyici sonucu yoksa / boşsa / yanlış şekildeyse fail-closed: kaba neden
  korunur, exception atılmaz.
- Bir sync **receipt**'i buraya neden kaynağı olarak geçemez (fixture bunu
  `status: 'permission'`, `lastErrorCode: 'unauthorized'` taşıyan receipt-benzeri
  bir nesneyle ayrıca dener; sonuç değişmez).
- `load()` artık `res[3]` yerine **`res[4]`** (projection yükleme sonucu) verir.

**Görev 4 — fallback safe shape.** Dört fallback durumunun hepsinde
`chosen.data` ham `latest` nesnesinin **kendisi değildir** ve `redactForObserver`
çıktısıdır. Fixture düşman bir `latest.json` kurar (GitHub token, OpenAI key,
sync URL, ham profil cevabı, base64 medya, GPS lat/lon, **ilaç adı, ham bildirim
gövdesi, occurrence id**) ve bu sentinel'lerin `data`, `sections` ve `coverage`
çıktılarının hiçbirinde bulunmadığını doğrular. Yedi reminder kökü
(`reminders`, `delivery`, `deliveryLog`, `reminderDelivery`, `reminderDeliveries`,
`reminderHistory`, `notificationDelivery`) fallback sırasında **yeni bir yüzey
açmaz**. Aynı kontrol projection yolunda da uygulanır.

**Görev 5 — read-only.** `chooseProjection` dört farklı çağrı boyunca `latest`,
`receipt` ve `projection` girdilerinin hiçbirini mutate etmez (derin
karşılaştırma). Reminder tercih kökü aynen korunur. Panelin app state'ine veya
reminder tercihine **yazma yolu yoktur**: `latest.json`/`data/reminder*` için
`PUT` yok, `setReminderEnabled` / `setReminderProfile` / `reminderSyncPayload` /
`snoozeReminderDelivery` / `muteReminderToday` gibi app yazıcıları panel
kaynağında hiç geçmiyor ve seçim fonksiyonunun kendisi `fetch` / `localStorage` /
`putInbox` / `putTransportFileP` içermiyor.

**`panelCoverageManifest.js` neden değişmedi.** REM-55'in allowlist'i
`chooseProjection` sınırını açıyor, fakat bu sınır zaten doğru kurulmuştu: altı
durumu ayırıyor, başarıyı yalnız receipt kanıtıyla veriyor ve fallback'i
`redactForObserver`'dan geçiriyor. Kusur manifest'te değil, panel tarafındaki
**neden çözümlemesindeydi**. Kozmetik bir değişiklik yapmak yerine mevcut sınır
319 assertion'lık fixture'la sabitlendi. Bu bilinçli bir no-op karardır.

## Doğrulama

| Kapı | Sonuç |
|---|---|
| `tests/reminders/test_reminder_panel_source.js` (yeni) | PASS · 319 assertion · 12 senaryo |
| `tests/test_panel_p1_projection.js` | PASS |
| `tests/test_panel_p0_sync.js` | PASS |
| `node --check panel.js` | PASS |
| `node --check panelCoverageManifest.js` | PASS |
| Root fixture (`tests/test_*.js`) | PASS · 33/33 |
| Reminder fixture (`tests/reminders/`) | PASS · 56/56 |
| Panel-v2 **ayrı** regression (`tests/panel-v2/`) | PASS · 27/27 |
| **Toplam fixture** | **PASS · 116/116** |
| Headless harness (driver, zikr, B1/B2/B3) | PASS · 5/5 |
| `git diff --check` | PASS |

Gerçek tarayıcı, gerçek GitHub çağrısı, gerçek token, gerçek kullanıcı verisi ve
`mustafaras/seyma-data` yazması **yok**.

## Kapanış

PANEL-01 source gap'in kaynak-seçim yarısı kapandı (coverage sınıflandırma
yarısı REM-56/REM-57'de). `activePrompt=REM-56`,
`lastCompletedPrompt=REM-55`. Release `not_approved`; S5 kullanıcı-cihaz kabulü
pending.

## Discrepancy — gap register satırı

Surface map §5'te `PANEL-01` yalnız *coverage kararı* olarak tarif edilir ve
prompt hattı `REM-56, REM-57` gösterir; REM-55'in kapanış cümlesi ise
"PANEL-01 source gap kapanır" der. §2 "Source selection" satırı doğrulama
sahibini açıkça `REM-55` olarak verdiği için çelişki gerçek bir kapsam
belirsizliği değil, gap register satırının eksik prompt listesidir. Belge
allowlist dışında olduğu için burada **kayda geçirildi**, düzenlenmedi; REM-56
gap register'a dokunduğunda `PANEL-01` prompt sütununa `REM-55` eklenmelidir.
