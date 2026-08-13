# REM-00 — Authority, baseline ve capability audit receipt

- **Program:** `APP-REMINDER-UX`
- **Prompt:** `REM-00`
- **Tarih:** `2026-08-13`
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `477c830b1d0e4406f1f64bc4dd3694eef6f31103`
- **Local commit:** `d34b42c` (`REM-00: baseline capability audit`)
- **Kapsam:** Yalnızca authority, mevcut kod yüzeyleri, capability sınırları ve test baseline’ı.
- **Allowlist:** `APP-REMINDER-ANTI-AMNESIA-LEDGER.md`, `APP-REMINDER-STATE.json`, `APP-REMINDER-DECISIONS.md`, `evidence/REM-00.md`
- **Protected paths changed:** `no`
- **Canonical state:** `activePrompt=REM-00`, `blockedPrompt=null`, `currentPhase=R0`, `releaseApproval.status=not_approved`

## 1. Authority ve güvenli çalışma kanıtı

Zorunlu okuma sırası tamamlandı: `AGENTS.md`, `CLAUDE.md`,
`GELISTIRME-PLANI.md` §0 / teknik ilkeler / §11–13 / §16–18,
`.claude/skills/run-seyma/SKILL.md`, `tests/README.md`, reminders README,
context, state, ledger, REM-00 prompt bloğu ve UX planı §3 / §5 / §8 /
§13–15.

İlk güvenli komut receipt’i:

```text
pwd
/Users/m_ras/Desktop/seyma

git status --short --branch
## main...origin/main
 M AGENTS.md
 M CLAUDE.md
?? docs/

git rev-parse HEAD
477c830b1d0e4406f1f64bc4dd3694eef6f31103

node docs/reminders/verify-reminder-context.mjs
REMINDER CONTEXT PASS: 73 prompts, 65 local links, approval=not_approved
```

Mevcut `AGENTS.md`, `CLAUDE.md` değişiklikleri ve `docs/` ağacındaki
kullanıcıya ait içerik korunmuştur. Preflight PASS olmadan reminder runtime
ve production dosyası düzenlenmemiştir.

## 2. Kaynak yüzeyi ve gerçek sahipler

Satır numaraları bu receipt’in üretildiği checkout’a aittir; sahiplik `rg -n`
ve bounded source okumalarıyla doğrulandı.

| Yüzey | Gerçek kaynak / fonksiyon sahibi | REM-00 gözlemi |
|---|---|---|
| App state / migration | `app.js:1454` `migrate`; `app.js:1919–1961` `getDay`, `emptyTherapy`, `ensureTherapyDay`; `app.js:3177–3196` `save`, `commit` | Tek ana `data` objesi ve additive migration vardır. Reminder definition / occurrence / delivery state yoktur. |
| Render / lifecycle | `app.js:4956` `render`; `app.js:12247` visibility/session; `app.js:12448` `pollRemote`; `app.js:13864–13888` poll, visibility, focus, pageshow, online ve ÆON permission loop | Foreground lifecycle ve yaklaşık 30 saniyelik remote poll vardır; ortak reminder scheduler yoktur. |
| Notification | `app.js:12449` `mergeInbox`; `app.js:12647` `startAeonPermissionLoop`; `app.js:12671` `showNativeAeonNotification` | Yalnız ÆON inbox/answer mesajını popup/native notification olarak gösterir; genel reminder delivery değildir. |
| Prayer | `app.js:77–187` prayer names/times; `app.js:4347–4394` `App.openFaithCorner`, `App.togglePrayer` ve ilgili handler’lar | `settings.prayer.remindersEnabled` ve offset alanı migrate edilir; zamanlanmış reminder motoru yoktur. |
| Zikr | `app.js:294`, `app.js:449–628` root/migration/tick; `app.js:3936–3967` `App.openZikr`, `App.zikrTap` | Açılan sayaç ve session davranışıdır; reminder scheduler yoktur. |
| Therapy | `app.js:1931–1961` therapy schema; `app.js:6889–6999` first-step, breath, decision, thought/share handler’ları | Şimdi başlatılan mikro-pratikler vardır; geleceğe zamanlama veya delivery logu yoktur. |
| Saygı / reading | `app.js:637–638`, `app.js:914`, `app.js:2089`; `app.js:3549–3595` Saygı handler’ları; `app.js:3699–3747` reading handler’ları | Okuma kaydı ve read state vardır; reminder occurrence/delivery ile bağ yoktur. |
| Journal | `app.js:4487–4492` modal ve `App.saveJournal` | Günlük kaydı `day.journal` içine kaydedilir; reminder scheduling yoktur. |
| App handlers | `App.*` inline handler yüzeyi; örnekleri `App.openFaithCorner`, `App.togglePrayer`, `App.openZikr`, `App.zikrTap`, `App.openSaygiReading`, `App.markSaygiRead`, `App.openReading`, `App.saveJournal` | Mevcut feature handler’ları gerçek sahiplerdir; REM-00’da yeni handler eklenmedi. |
| Persistence | `app.js:3177–3194` `localStorage.setItem(KEY, ...)`, `KEY=seyma-reset-v1`; `app.js:12076–12077` local save/sync helper’ları | localStorage mevcut; reminder-specific local key/schema henüz yoktur. |

### sync.js sınırları

- `sync.js:41–83` local receipt ve whitelisted failure detail yazar; ham secret/error
  ayrıntısı receipt’e konmaz.
- `sync.js:175–205` GitHub config ile Guard 1 (`file:`, localhost, loopback,
  `.local`) sınırlarını belirler.
- `sync.js:225–240` `ghPut` Contents API PUT zinciridir.
- `sync.js:256–293` `putLatestGuarded` remote latest okur, `mergeData` ve
  `sanitize` uygular; remote day sayısı yerelden büyükse Guard 2
  `anti_clobber` ile durur.
- `sync.js:294–333` `pushWithCfg` latest, backup, receipt, observer projection,
  günlük snapshot ve event log yazma zinciridir.
- `sync.js:495–557` `mergeById`, `mergeSettings`; `sync.js:716–762`
  `mergeData` mevcut uygulama state’ini birleştirir.
- `sync.js:766–775` `sanitize` `ghToken`, `syncUrl`, `openaiKey`, `auth` gibi
  mevcut secret alanlarını çıkarır. Reminder-specific local-only alan veya
  delivery privacy sözleşmesi henüz tanımlı değildir.
- `sync.js:777–807` `doPush`; `sync.js:988–1023` `window.SeySync.schedule`,
  `pushNow`, receipt ve `retryIfPending`. Gerçek remote write bu zincirde
  yapılandırılmış token/repo ve guard’lar geçerse mümkündür; bu auditte
  çağrılmamıştır.

### sw.js sınırları

- `sw.js:1–6` static GitHub Pages bağlamında klasik Web Push server olmadığını
  ve dışarıdan scheduled push tetiklenemeyeceğini açıklar.
- `sw.js:8–14` yalnız install/activate (`skipWaiting`, `clients.claim`) yapar.
- `sw.js:18–34` `push` event’i varsa payload parse edip
  `self.registration.showNotification` çağırır; schedule, `periodicsync`,
  subscription veya reminder catalog yoktur.
- `sw.js:36–61` `notificationclick` ile açık `index.html` client’ına
  `aeon-open-mesaj` mesajı gönderir veya pencere açar. Bu, reminder
  scheduler ya da uygulama kapalıyken kesin zaman garantisi değildir.

## 3. Plan ↔ mevcut kod capability matrix

Durum sözlüğü: `mevcut` = kaynakta doğrudan var; `kısmi` = bir alt yüzey var
ama REM-00 capability’sini tamamlamıyor; `yok` = ilgili runtime sözleşmesi
bulunmadı; `belirsiz` = bu audit kanıt seviyesiyle karar verilemez.

| Capability | Durum | Kaynak kanıtı ve sınır |
|---|---|---|
| Foreground reminder | `yok` | `app.js:13864–13888` foreground poll/lifecycle var; ortak reminder clock, occurrence ve delivery akışı yok. |
| Background reminder | `yok` | `sw.js:18–34` push handler var, fakat scheduled local trigger, periodic sync ve push backend/subscription yok; static PWA’da kapalı-app zaman garantisi yok. |
| Native Notification | `kısmi` | `app.js:12647–12719` izin loopu ve `showNativeAeonNotification`; yalnız ÆON inbox/answer, generic reminder kanalı değil. |
| Service Worker | `mevcut` | `sw.js` install/activate/push/click yüzeyleri mevcut; reminder scheduling yeteneği yok. |
| localStorage | `mevcut` | `app.js:3177–3194`, `KEY=seyma-reset-v1`; ana app state’i yerelde saklanıyor, reminder-specific retention/log sözleşmesi yok. |
| sync sanitize | `kısmi` | `sync.js:766–775` mevcut secret sanitize; reminder preference/delivery için local-only exclusion ve redaction sözleşmesi yok. |
| Panel projection | `kısmi` | `panelCoverageManifest.js:461–515` redacted observer snapshot; `panel.js:114,534–555` projection okur. Reminder alanları/aggregate’i manifestte yok. |
| Panel-v2 | `kısmi` | `panel-v2.html`, `panel-v2.js` bağımsız dashboard; `tests/panel-v2/README.md` 27 synthetic fixture bildirir. Reminder-specific integration/projection yok. |
| Browser/device acceptance | `belirsiz` | Plan §15 ve run-seyma S5’i ayrı evidence ister; bu auditte browser/device açılmadı ve kabul testi yapılmadı. |
| Gerçek data repo write | `kısmi` | `sync.js:225–333` gerçek GitHub Contents write capability’si ve guard’lar var; bu auditte `mustafaras/seyma-data` okunmadı/yazılmadı, remote çağrı yapılmadı. |

## 4. Gerçek plan-kod discrepancies

### REM-DISC-001 — “PWA local notifications” genel reminder capability’si değil

- **Plan beklentisi:** `GELISTIRME-PLANI.md` item 12’de PWA/local notification
  yüzeyi `✅` görünür; UX planı §4.5 ve §8.8 ise static PWA’da closed-app
  schedule garantisini açıkça sınırlar.
- **Kod gözlemi:** `app.js:12449`, `12647`, `12671` yalnız ÆON inbox/answer
  mesajından native notification üretir; `sw.js:18` ancak harici bir PushEvent
  gelirse çalışır. Generic reminder engine veya scheduler bulunmadı.
- **Etkisi / karar:** Item 12’nin varlığı REM-01 sonrası genel reminder
  delivery varmış gibi kullanılamaz. Native channel `kısmi`, background
  scheduled reminder `yok` kalır.

### REM-DISC-002 — Prayer reminder alanları capability değildir

- **Plan beklentisi:** UX planı §5 ve §8 namazı ortak policy/scheduler/delivery
  kapsamına bağlar.
- **Kod gözlemi:** `app.js:1454–1580` migrate içinde
  `settings.prayer.remindersEnabled` ve `reminderOffsetMinutes` backfill edilir;
  `app.js:77–187` vakit hesabı ve `app.js:4347–4394` manuel prayer handler’ları
  vardır. Bu alanları tüketen occurrence/delivery scheduler yoktur.
- **Etkisi / karar:** Bu alanlar “namaz reminder’ı mevcut” diye raporlanamaz;
  REM-01 state contract’ında semantik ve migration kararı ayrıca alınmalıdır.

### REM-DISC-003 — Mevcut sanitize genel reminder privacy boundary’si değildir

- **Plan beklentisi:** UX planı §8.2 ve §13.2 preference/delivery kayıtlarının
  local-only veya açıkça redacted olmasını ister.
- **Kod gözlemi:** `app.js:3177–3194` her normal save’de bütün `data` payload’ını
  `SeySync.schedule`’a verir; `sync.js:766–775` yalnız bilinen secret alanlarını
  çıkarır. Reminder schema ve reminder-specific strip/manifest kuralı yoktur.
- **Etkisi / karar:** REM-04/REM-09’a geçmeden önce preference, delivery log,
  retention ve sync exclusion contract’ı dondurulmalıdır; mevcut sanitize
  tek başına reminder privacy kanıtı sayılamaz.

### REM-DISC-004 — SW push handler erişilebilir delivery yolu anlamına gelmez

- **Plan beklentisi:** UX planı §3.2, §4.5 ve §14 background claim’inin
  platform/backend sınırıyla yazılmasını ister.
- **Kod gözlemi:** `sw.js:18–34` generic payload gösterebilir; fakat kaynakta
  push subscription, server sender, `periodicsync` veya scheduled event yok.
- **Etkisi / karar:** “SW var, dolayısıyla app kapalıyken reminder gelir” sonucu
  geçersizdir. Bu yalnız handler-level `kısmi` capability’dir ve device
  acceptance yapılmadan delivery claim’i kurulamaz.

### REM-DISC-005 — Panel mevcut olsa da reminder projection yok

- **Plan beklentisi:** UX planı §13–15 ve REM-55–REM-66 panel yüzeyinde
  reminder privacy/aggregate/no-op kararının explicit olmasını ister.
- **Kod gözlemi:** `panelCoverageManifest.js:461–515` redacted observer
  projection üretir; `panel.js:114,534–555` bunu okur; Panel-v2 ayrıca
  bağımsızdır. Manifestte reminder definition/occurrence/delivery aggregate’i
  bulunmadı; mevcut notification timeline ÆON/inbox akışıdır.
- **Etkisi / karar:** Panel capability’si mevcut/kısmi olarak raporlanır;
  reminder panel desteği yoktur. REM-56–REM-64 bunu explicit no-op veya
  güvenli aggregate olarak ele almalıdır.

## 5. Test baseline ve evidence seviyesi

| Katman | Komut | Sonuç |
|---|---|---|
| Syntax | `node --check app.js` | **PASS**, exit `0` |
| Syntax | `node --check sync.js` | **PASS**, exit `0` |
| Syntax | `node --check sw.js` | **PASS**, exit `0` |
| Diff | `git diff --check` | **PASS**, exit `0` |
| Context parity | `node docs/reminders/verify-reminder-context.mjs` | **PASS**, `73 prompts`, `65 local links`, `approval=not_approved` |

REM-00 reminder runtime fixture’ı çalıştırılmadı; çünkü runtime uygulanmadı.
Headless run-seyma sınırı korunmuş, browser/server/localStorage/device testi
yapılmamıştır. Panel-v2 README ve fixture inventory’si kaynak kanıtı olarak
okundu; reminder integration testi iddia edilmemektedir.

Evidence seviyeleri: source `S0/S1`; synthetic reminder test `N/A`;
commit/remote `S3` yalnız local commit varsa; CI/Pages `N/A`; user-device `S5`
`N/A`.

## 6. No-write ve release sınırı

- `app.js`, `sync.js`, `sw.js`, `index.html`, `styles.css`, `panel*`,
  `data/` ve protected path’lerde değişiklik yapılmadı.
- `git status` başlangıç ve audit sırasında mevcut `AGENTS.md`, `CLAUDE.md`
  değişiklikleri ile untracked `docs/` ağacı dışında production/runtime/data
  değişikliği göstermedi; hedefli `git diff --name-only -- app.js sync.js
  sw.js ... data` çıktısı boştur.
- Browser açılmadı, server başlatılmadı, gerçek localStorage kullanılmadı.
- `mustafaras/seyma-data` okunmadı ve yazılmadı; GitHub Contents API, remote,
  Pages, CI ve external system çağrısı yapılmadı.
- Push, merge, deploy, tag ve canlı/device doğrulaması yapılmadı.
- `releaseApproval.status` **`not_approved`** olarak korunmuştur; approval scope
  boş, evidence ve approvedAt null’dır.

## 7. Sonuç

- **REM-00 sonucu:** `done` — authority, baseline ve capability audit’i
  tamamlandı; en az beş gerçek discrepancy kaydedildi.
- **Blocker:** `none`; fakat closed-app background guarantee ve reminder
  privacy/sync contract bilinçli olarak sonraki promptlara bırakıldı.
- **Ledger / state:** REM-00 receipt’i ledger’a yazıldı; `activePrompt=REM-00`
  kullanıcı tarafından sabitlenen canonical durum olarak kaldı; sonraki güvenli
  adım `REM-01`.
- **Release:** `NOT_APPROVED`.
