# REM-52 — App permission, native adapter ve ÆON boundary

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-52
- **Tarih:** 2026-08-18
- **Commit:** `8ebd5e0`
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `bc2a7b0` (`5798641` üzerine fast-forward edilmiş `origin/main`)
- **Bitiş HEAD:** `8ebd5e0` (+ kapanış receipt docs commit)
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none`

## Kapsam

- **Allowlist:** `app.js` (notification adapter), `app/core/reminderDelivery.js` (yeni),
  `sw.js` (click adapter), `tests/reminders/test_reminder_app_notification_boundary.js` (yeni),
  `tests/reminders/test_reminder_native.js`, `tests/reminders/test_reminder_sw.js`
- **Closure records:** `docs/reminders/evidence/REM-52.md`,
  `docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md`, `docs/reminders/APP-REMINDER-STATE.json`
- **Protected paths changed:** `no`
- **Kapsam dışı değişiklik:** `index.html` yalnız kapanış commit'inde cache-bust
  için (CLAUDE.md ilke 5, REM-51 ile aynı precedent)

## Yapılan

**Görev 1 — kanal ayrımı.** Yeni saf modül `app/core/reminderDelivery.js`
(`window.ReminderDeliveryV1`) iki bildirim kanalını sözleşme olarak tanımlar:

| Alan | ÆON (sosyal) | Reminder (kişisel) |
|---|---|---|
| permission | `data.settings.aeonNotifyPermission` (synced) | `localStorage:seyma-reminder-permission-v1` (local-only) |
| id / history | `data.aeon.shownNotificationIds` (synced) | `localStorage:seyma-reminder-actions-v1` (local-only) |
| tag | `aeon-` | `seyma-reminder-v1:` + `reminder-preview-v1` |
| cap | `AEON_NOTIFY_COOLDOWN_MS` (session cooldown) | `data.reminders.policy.nativeDailyCap` (günlük) |
| gövde | mesaj içeriği | katalog private copy |
| push | var | yok |

`disjointReport()` bu beş alanın hiçbirinin paylaşılmadığını ve her tag /
payload tipinin tam olarak tek kanala çözüldüğünü doğrular. Modül opsiyoneldir
— `index.html` script wiring'i REM-54'ün kapsamındadır — bu yüzden `app.js`
aynı sınırı üreten bir fallback taşır ve fixture **iki yolu da** ayrı ayrı
çalıştırır (`withModule: true|false`).

**Görev 2 — native gövde.** Native yüzey yalnız `title / body / tag / deepLink`
taşır ve kaynağı katalog private copy'sidir. REM-51'in surface teşhis alanları
(`requiredState`, `surfaceState`, `unavailableReason`), occurrence detayı ve
kullanıcının girdiği ilaç etiketi/notu native payload'da hiç geçmiyor;
fixture bunu sentetik `SENTETIK-ILAC-ETIKETI` / `SENTETIK-ILAC-NOTU`
dizeleriyle serialize edilmiş çağrı üzerinde arıyor.

**Görev 3 — permission durumları.** `prompt` artık `default`in eş anlamlısı
(Permissions API yazımı) ve **yeni** `revoked` durumu eklendi: daha önce
verilmiş bir izin tarayıcıda geri alındığında uygulama bunu "henüz sorulmadı"
gibi göstermiyor. Hatırlama, local-only permission anahtarındaki `everGranted`
alanında tutulur ve reminder full reset ile temizlenir. Hiçbir durum
kendiliğinden izin istemez: `reminderPermissionCanRequest` yalnız
`default / revoked / temporary-error` için açıktır ve yalnız açık kullanıcı
eylemi tarayıcı diyalogunu açar. 25 ardışık snapshot + Reminder Center açılışı
sonrasında `requestCount = 0`.

**Görev 4 — click target allowlist (gerçek bir sızıntı kapatıldı).** Bir
bildirimin hatırlatma kanalına ait olması için **payload tipi VEYA tag'i**
yeterli. Önceki `sw.js` yalnız `data.type === 'reminder'` bakıyordu; uygulama
içi önizleme bildirimi (`reminder-preview-v1`) tıklandığında ÆON `aeon-open-mesaj`
rotasına düşüyordu. Artık hatırlatma namespace'indeki her tıklama — payload
bozuk olsa bile — düşürülür, asla ÆON rotasına indirgenmez. Ters yön de kapalı:
hatırlatma gövdesi ÆON tag'i üzerinde gelirse namespace çakışması sayılıp
reddedilir. 14 malformed payload için `App.handleReminderServiceWorkerClick`
`ok:false` döner ve `seyma-reset-v1` + üç local-only anahtarın JSON'u byte
düzeyinde değişmez.

**Görev 5 — dürüst capability.** `SW_CAPABILITIES` (sw.js) ve
`App.reminderNotificationBoundary().capabilities` aynı şeyi söyler:
`backgroundScheduling:false`, `backgroundReplay:false`,
`closedAppTimedDelivery:false`, `reminderPush:false`, `aeonPush:true`,
`serviceWorkerRole:'click-transport-only'`. Kaynak taraması `setTimeout`,
`setInterval`, `fetch(`, `periodicSync`, `showTrigger`/`TimestampTrigger`
yüzeylerinin sw.js'te bulunmadığını doğrular. Sistem durumu satırına da
`revoked` için açık bir Türkçe metin eklendi (katalog lexicon'ı bu promptun
allowlist'i dışında olduğu için app.js içinde honest fallback olarak).

**ÆON regresyon sınırı.** ÆON tarafında davranış değişmedi: sosyal push,
`aeon-message` / `aeon-answer` tıklama rotası ve permission alanı aynen
çalışıyor. Eklenen tek şey gönderici tarafındaki namespace koruması. 2 dakikalık
ÆON re-ask döngüsü (`startAeonPermissionLoop`) REM-22'den beri çağrılmıyor;
fixture bunu kaynak üzerinde tek tanım / sıfır call-site olarak sabitliyor.

## Doğrulama

| Kapı | Sonuç |
|---|---|
| `test_reminder_app_notification_boundary.js` (yeni) | PASS · 197 assertion · 11 senaryo |
| `test_reminder_native.js` | PASS · 80 (66 → 80, iki yeni REM-52 senaryosu) |
| `test_reminder_sw.js` | PASS · 95 (57 → 95, üç yeni REM-52 senaryosu) |
| `test_reminder_permission.js` | PASS · 63 |
| `test_reminder_system_status.js` | PASS · 65 |
| `test_reminder_copy.js` | PASS · 793 |
| Tüm fixture (`tests/reminders`, `tests`, `tests/panel-v2`) | PASS · 113/113 |
| Headless harness (driver, zikr, B1/B2/B3) | PASS · 5/5 |
| `node --check` (app, sw, sync, panel, reminderDelivery) | PASS |
| `git diff --check` | PASS |
| `verify-reminder-context.mjs` | PASS · 73 prompt, 66 link |

Gerçek tarayıcı, gerçek ağ çağrısı, gerçek kullanıcı localStorage'ı ve
`mustafaras/seyma-data` yazması **yok**.

## Not

`index.html` içindeki `sw.js?v=2026080402` kayıt damgası bu promptun
allowlist'i dışında olduğu için bumplanmadı. Bu bir teslim riski değildir:
tarayıcı Service Worker script'ini aynı URL için byte karşılaştırır, GitHub
Pages CDN TTL'i dolduğunda yeni sw.js'i alır ve güncellenir. Deploy edilen
dosyanın teşhisi için `SW_VERSION` `20260718j` → `20260818a` bumplandı.

## Kapanış

APP-04 notification boundary kapandı. `activePrompt=REM-53`,
`lastCompletedPrompt=REM-52`. Release `not_approved`; S5 kullanıcı-cihaz
kabulü pending.

## Standing delivery receipt

- **Closure commit:** `e2d6991` — `HEAD` = `origin/main` = `git ls-remote origin main` (fast-forward, PR yok)
- **Workflow:** `32169076824` · `success`
- **Pages deployment:** `5968443257` · status `16976686254` · `success`
- **Live:** `https://mustafaras.github.io/s/index.html` HTTP `200`, `app.js?v=20260818d`; `sw.js` HTTP `200`
- **Deployed marker doğrulaması:** canlı `app.js` içinde `reminderNotificationBoundary`,
  `reminderPermissionCanRequest`, `REMINDER_PERMISSION_ALIASES`, `everGranted`, `revoked`,
  `channel-boundary`; canlı `sw.js` içinde `SW_CAPABILITIES`, `swNotificationChannel`,
  `backgroundScheduling: false`, `SW_VERSION = '20260818a'` bulundu
- **`mustafaras/seyma-data`:** bu teslimatta **yazılmadı**
- **Kapsam:** standing `after_each_prompt` tüketildi; `releaseApproval` `not_approved` olarak kaldı;
  S5 kullanıcı-cihaz kabulü pending

## Kapanış sonrası düzeltme (`fec66e4`)

Kapanıştan sonra yapılan "tam ve kusursuz mu?" denetiminde REM-52'nin Görev 3'ü
**eksik uygulanmış** bulundu ve düzeltildi.

**Kusur.** `revoked` durumu hesaplanıyor, açıklanıyor ve raporlanıyordu; fakat
`reminderPermissionExplanationHTML` içinde bu duruma ait bir dal yoktu. Tarayıcı
izni geri aldığında kullanıcı açıklamayı görüyor, hiçbir düğme görmüyordu —
üstelik metin "İstersen buradan yeniden verebilirsin" diyerek render edilmeyen
bir eylemi vaat ediyordu. `reminderPermissionCanRequest('revoked')` `true`
olduğu hâlde UI bunu kullanılabilir kılmıyordu.

**Düzeltme.** `revoked` için açık istek düğmesi (yalnız kullanıcı dokunuşuyla)
ve caution ikonu eklendi.

**Fixture'daki iki zayıflık.** Kusurun kaçmasının sebebi testti, koda bakış
değil:

1. Boundary fixture'ının sandbox'ında `navigator.geolocation` yoktu, bu yüzden
   uygulamanın **konum hard gate'i** her render'ı kesiyordu. "Reminder Center'ı
   aç ve izin istenmediğini doğrula" iddiaları bu yüzden **boş doğruydu** —
   merkez hiç render edilmiyordu. Gate artık karşılanıyor.
2. Yeni değişmez eklendi: *bir durum, istek kontrolünü ancak ve ancak tarayıcı
   diyalogunu gerçekten açabiliyorsa render eder.* Altı durumun tamamı
   (`unsupported`, `denied`, `granted`, `default`, `revoked`,
   `temporary-error`) gerçek markup üzerinde kontrol ediliyor; `temporary-error`
   fırlatan bir `requestPermission` ile üretiliyor ve tekrar render tekrar
   istek üretmiyor.

**Regresyon kanıtı.** Dal geri alındığında yeni senaryo FAIL, geri konduğunda
PASS. Boundary fixture 197 → 233 assertion; tüm fixture 114/114, headless 5/5,
`node --check` PASS.

### Düzeltmenin teslim makbuzu

- **Commit:** `553354a` — `HEAD` = `origin/main` = `git ls-remote origin main`
- **Workflow:** `32172164251` · `success`
- **Pages deployment:** `5968978172` · status `16978041688` · `success`
- **Live:** HTTP `200`, `app.js?v=20260818f`; canlı asset içinde
  `c.state==='revoked'` dalı, `revokedAction`, `revokedNote` ve
  "Native kanalı yeniden aç" düğme metni bulundu
- **`mustafaras/seyma-data`:** yazılmadı
