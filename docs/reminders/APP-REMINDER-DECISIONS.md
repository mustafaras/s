# APP-REMINDER-UX — Karar ve Discrepancy Günlüğü

Bu günlük, hatırlatma programında geri dönmesi zor ürün, privacy, mimari,
intentional removal ve plan-kod discrepancy kararlarının append-only sahibidir.
Rutin commit veya her test çıktısı buraya yazılmaz; onlar ledger ve Git’te
tutulur.

## 1. Karar formatı

Her yeni kayıt şu alanları taşımalıdır:

- **ID:** `REM-ADR-XXX` veya `REM-DISC-XXX`
- **Tarih:** ISO tarih
- **Durum:** proposed / accepted / rejected / superseded / discrepancy / deferred
- **Soru:** Hangi geri dönülmez veya kapsam etkili karar ele alınıyor?
- **Kanıt:** Dosya, fonksiyon, test veya receipt yolu
- **Karar:** Tek cümlelik uygulanabilir sonuç
- **Etkiler:** State, sync, panel, privacy, UX, test ve deployment etkisi
- **Sonraki adım:** Hangi prompt / owner ilerleyecek?

## 2. Başlangıç kararları

### REM-ADR-001 — Hatırlatmalar ÆON inbox’tan ayrıdır

- **Tarih:** 2026-08-13
- **Durum:** accepted for planning
- **Soru:** Mevcut data.notifications genel reminder delivery günlüğü olarak kullanılmalı mı?
- **Kanıt:** UX planı §3.3; mevcut app.js ÆON inbox / shownNotificationIds akışı.
- **Karar:** Hayır. ÆON gelen ileti akışı sosyal bildirim olarak kalır; kullanıcı kurduğu reminder tanımları, oluşumları ve delivery kayıtları ayrı sözleşmeye sahiptir.
- **Etkiler:** ID çakışması, merge ve notification budget karışması engellenir.
- **Sonraki adım:** REM-01 contract, REM-09 delivery.

### REM-ADR-002 — Statik PWA background guarantee yoktur

- **Tarih:** 2026-08-13
- **Durum:** accepted for planning
- **Soru:** Uygulama kapalıyken her local reminder kesin zamanda çalışacak mı?
- **Kanıt:** AGENTS data safety; run-seyma/SKILL.md; sw.js mevcut static PWA sınırı; UX planı §4.5 ve §8.8.
- **Karar:** Hayır. İlk güvenilir kanal foreground scheduler + in-app catch-up’tır. Native notification yalnız platform ve permission desteklediğinde kullanılır; background schedule garanti edilmez.
- **Etkiler:** UI capability state’i dürüstçe anlatır; device acceptance ayrı evidence olur.
- **Sonraki adım:** REM-10, REM-22–24, REM-29.

### REM-ADR-003 — Preference / delivery privacy ayrımı

- **Tarih:** 2026-08-13
- **Durum:** proposed; REM-01 ve REM-04 kod kanıtı bekliyor
- **Soru:** Reminder preference ve device delivery logu nasıl saklanacak?
- **Kanıt:** Root technical principle tek data objesi; UX planı §8.2 ve §13.2.
- **Karar:** Preference canonical app state içinde additive tutulabilir; sync sanitize ile uzak payload’dan çıkarılmalıdır. Device delivery log kısa ömürlü local-only olabilir. Cihazlar arası preference sync varsayılan değildir.
- **Etkiler:** migrate additive, sync privacy, local retention ve panel redaction gate’leri zorunlu olur.
- **Sonraki adım:** REM-04, REM-09, REM-25.

### REM-ADR-004 — İlk çekirdek kapsam

- **Tarih:** 2026-08-13
- **Durum:** accepted for planning
- **Soru:** İlk kullanıcıya hangi reminder yüzeyleri sunulacak?
- **Kanıt:** UX planı §17 ve §20.
- **Karar:** Önce Reminder Center, policy/engine, in-app inbox, namaz, zikir, terapi mikro-pratiği, Saygı/okuma ve tek akşam kapanışı; care, medication, special day ve native kanal daha sonra fazlanır.
- **Etkiler:** Bildirim yorgunluğu ve klinik risk azaltılır; core flow önce kanıtlanır.
- **Sonraki adım:** REM-05–18.

### REM-ADR-005 — Açık kullanıcı onayı olmadan canlıya alma yok

- **Tarih:** 2026-08-13
- **Durum:** accepted for planning
- **Soru:** Testler ve local release packet hazır olduğunda ajan kendiliğinden push / merge / Pages yapabilir mi?
- **Kanıt:** APP-REMINDER-APPROVAL-GATE.md; root AGENTS.md / CLAUDE.md release sınırları; UX planı §19 teslim kapısı.
- **Karar:** Hayır. Kullanıcının mevcut konuşmada açık eylem ve kapsam belirten exact onayı olmadan push, merge, tag, Pages, dış sistem write ve canlı doğrulaması yasaktır. `mustafaras/seyma-data` yazımı ayrıca açık veri yazma onayı ister.
- **Etkiler:** `STATE.json.releaseApproval` varsayılan `not_approved` kalır; REM-42 approval_required, REM-43 yalnız approved scope ile çalışır; test PASS release yetkisi değildir.
- **Sonraki adım:** REM-41 release packet, REM-42 exact scope, REM-43 controlled execution.

### REM-ADR-006 — Context kaynaklarının makinece parity kontrolü

- **Tarih:** 2026-08-13
- **Durum:** accepted for planning
- **Soru:** Session bağımsız ajanlar plan, prompt, ledger, state ve test kapsamının aynı sürümünü nasıl kullanacak?
- **Kanıt:** APP-REMINDER-TRACEABILITY-MATRIX.md; verify-reminder-context.mjs; APP-REMINDER-CONTEXT.md.
- **Karar:** Prompt ID’leri contiguous ve ledger ile aynı tutulur; plan section’ları traceability matrix’e bağlanır; validator her prompt öncesi / sonrası çalışır; fail durumunda ilerleme durur.
- **Etkiler:** Prompt ekleme, kapsam değişikliği, approval scope değişikliği ve test yolu değişikliği birlikte güncellenir; eski veya kopyalanmış context canonical state’i geçersiz kılamaz.
- **Sonraki adım:** REM-40 reconciliation ve her yeni promptun parity receipt’i.

### REM-ADR-007 — App runtime ve current panel ayrı teslim hatlarıdır

- **Tarih:** 2026-08-13
- **Durum:** accepted for planning
- **Soru:** Reminder özelliği uygulama ve panelde tek, genel bir “UI işi” olarak mı yürütülmeli?
- **Kanıt:** `APP-REMINDER-APP-PANEL-SURFACE-MAP.md`; `app.js` ile `panel.js` bağımsız runtime’lar; current panel / Panel-v2 fixture ayrımı.
- **Karar:** Hayır. REM-44–REM-54 app runtime, REM-55–REM-66 current observer panel, REM-67–REM-72 cross-surface integration olarak ayrı prompt ve acceptance zincirleridir. Panel-v2 ayrı regression yüzeyidir.
- **Etkiler:** Her yüzey kendi state, render, transport, privacy ve test sahibine sahip olur; bir yüzeyin PASS’ı diğerinin PASS’ı sayılmaz.
- **Sonraki adım:** Surface map gap register ve R12–R14 promptları.

### REM-ADR-008 — Panel reminder yansıması explicit no-op veya güvenli aggregate olur

- **Tarih:** 2026-08-13
- **Durum:** accepted for planning
- **Soru:** Panelde kullanıcı reminder tercihi, occurrence, snooze, mute veya private detail gösterilmeli mi?
- **Kanıt:** Root data safety; `panelCoverageManifest.js` redaction / coverage sözleşmesi; panel observer action sınırı.
- **Karar:** Varsayılan panel davranışı no-op’tur. Ürün kararı güvenli bir aggregate gerektirirse yalnız coverage manifestinde açıkça sınıflanmış, private detail içermeyen bir özet gösterilebilir; panel reminder yazma authority’si değildir.
- **Etkiler:** Panel card, timeline, projection ve negative privacy testleri zorunlu olur; “panelde görünmüyor” tek başına bug sayılmaz.
- **Sonraki adım:** REM-56–REM-64 ve decisions discrepancy kaydı.

## 3. Başlangıç discrepancy kayıtları

Şu anda bu bölümde yalnız doğrulama sırasında gerçek bir fark bulunduğunda
append-only kayıt açılır. Planın varsayımları canlı kod kanıtı yerine geçmez.

## 4. Intentional removal / yeniden oluşturma yasağı

Bu program kapsamında aşağıdaki yaklaşımlar onay olmadan geri getirilemez:

| Yaklaşım | Durum | Gerekçe | Yerine |
|---|---|---|---|
| Her kategori için ayrı, sınırsız native alarm | Yasak | Notification fatigue ve platform sınırı | Common policy + budget + grouping |
| Therapy / mood metnini kilit ekranına yazmak | Yasak | Mahremiyet ve klinik risk | Private generic copy |
| İlaç dozunu reminder motorunun hesaplaması | Yasak | Tıbbi karar sınırı | User-entered time-only reminder |
| Uygulama kapalıyken kesin local schedule iddiası | Yasak | Static PWA capability sınırı | Foreground + honest catch-up |
| Reminder’ları data.notifications içine yazmak | Yasak | ÆON merge / social channel karışması | Ayrı reminder delivery contract |

## 6. REM-00 closure reconciliation

### REM-ADR-009 — REM-00 kapanışı pointer’ı REM-01’e taşır

- **Tarih:** 2026-08-13
- **Durum:** accepted
- **Soru:** REM-00 audit’i tamamlandığında state aktif prompt olarak REM-00’da
  kalmalı mı?
- **Kanıt:** `APP-REMINDER-PROMPTLARI.md` REM-00 kapanış kuralı; ledger §8;
  `APP-REMINDER-STATE.json`; `APP-REMINDER-ANTI-AMNESIA-LEDGER.md` REM-00 / REM-01 satırları.
- **Karar:** Hayır. REM-00 `done`, `lastCompletedPrompt=REM-00`,
  `activePrompt=REM-01`, `REM-01=ready` olmalıdır; blocker yoksa
  `blockedPrompt=null` kalır.
- **Etkiler:** Session bağımsız başlangıç bir sonraki güvenli contract promptuna
  deterministik taşınır; REM-01 runtime uygulaması bu closure turunda yapılmaz.
- **Sonraki adım:** REM-01 state / privacy / delivery contract freeze.

### REM-DISC-006 — İlk REM-00 receipt’i release sonrasında stale kaldı

- **Tarih:** 2026-08-13
- **Durum:** discrepancy → reconciled
- **Soru:** Baseline sırasında yazılan `not_approved / no remote / no deploy`
  ifadeleri sonraki approved push ve Pages deployment’tan sonra final receipt
  olarak bırakılabilir mi?
- **Kanıt:** Eski `evidence/REM-00.md` receipt’i; state approval scope;
  remote equality `a887dd653ede3468ab8625609ebaa928baba3abf`;
  Pages workflow `31691645455`; deployment `5884689099`.
- **Karar:** Hayır. Baseline ve closure evidence ayrıştırıldı; final receipt
  actual approval, remote, CI/Pages ve live HTTP katmanlarını ayrı kaydediyor.
- **Etkiler:** Source/test/deploy/device claims birbirine karıştırılmıyor;
  historical baseline `not_approved` olarak korunurken closure state actual
  approved scope’u gösteriyor.
- **Sonraki adım:** REM-01; yeni release action ancak yeni exact scope ile.

## 5. REM-00 discrepancy kayıtları

### REM-DISC-001 — “PWA local notifications” genel reminder capability’si değil

- **Tarih:** 2026-08-13
- **Durum:** discrepancy
- **Soru:** Roadmap item 12’deki PWA/local notification işareti genel reminder
  delivery olarak kabul edilebilir mi?
- **Kanıt:** `GELISTIRME-PLANI.md` item 12; `app.js:12449,12647,12671`
  (`mergeInbox`, `startAeonPermissionLoop`, `showNativeAeonNotification`);
  `sw.js:18–34`.
- **Karar:** Hayır. Mevcut kanal ÆON inbox/answer notification’ıdır; genel
  reminder scheduler ve generic delivery yoktur.
- **Etkiler:** Native capability `kısmi`, background scheduled reminder `yok`;
  REM-01 sonrası generic reminder varsayımı yapılamaz.
- **Sonraki adım:** REM-01 contract; REM-10 ve REM-22–24 delivery sınırları.

### REM-DISC-002 — Prayer reminder alanları capability değildir

- **Tarih:** 2026-08-13
- **Durum:** discrepancy
- **Soru:** `settings.prayer.remindersEnabled` alanı mevcut prayer reminder
  desteği anlamına gelir mi?
- **Kanıt:** `app.js:1454–1580` migrate; `app.js:77–187` prayer calculation;
  `app.js:4347–4394` prayer handlers; UX planı §5 / §8.
- **Karar:** Hayır. Alan backfill edilir ama occurrence/delivery scheduler bu
  alanı tüketmez.
- **Etkiler:** State semantics ve migration kararı REM-01’e; runtime varsayımı
  üretilemez.
- **Sonraki adım:** REM-01 state/privacy/delivery contract.

### REM-DISC-003 — Mevcut sanitize genel reminder privacy boundary’si değildir

- **Tarih:** 2026-08-13
- **Durum:** discrepancy
- **Soru:** Mevcut `sanitize()` reminder preference ve delivery log privacy’sini
  karşılıyor mu?
- **Kanıt:** `app.js:3177–3194` save → `SeySync.schedule`; `sync.js:766–775`
  sanitize; UX planı §8.2 / §13.2.
- **Karar:** Hayır. Yalnız bilinen secret alanları çıkarılır; reminder-specific
  local-only veya redaction sözleşmesi yoktur.
- **Etkiler:** REM-04/REM-09 öncesi sync exclusion, retention ve panel redaction
  dondurulmalıdır.
- **Sonraki adım:** REM-01 contract; REM-04 migration; REM-09 delivery log.

### REM-DISC-004 — SW push handler erişilebilir delivery yolu anlamına gelmez

- **Tarih:** 2026-08-13
- **Durum:** discrepancy
- **Soru:** `sw.js` içindeki `push` handler app kapalıyken scheduled reminder
  garantisi verir mi?
- **Kanıt:** `sw.js:1–6,18–34`; UX planı §3.2 / §4.5 / §14.
- **Karar:** Hayır. Handler payload gösterebilir; subscription, sender,
  scheduler veya periodic sync yoktur.
- **Etkiler:** “SW var” sonucu background guarantee olarak raporlanamaz;
  device acceptance ayrı kalır.
- **Sonraki adım:** REM-10 capability state; REM-22–24 native/device gates.

### REM-DISC-005 — Panel mevcut olsa da reminder projection yok

- **Tarih:** 2026-08-13
- **Durum:** discrepancy
- **Soru:** Mevcut observer projection ve Panel-v2 reminder panel desteği sayılır
  mı?
- **Kanıt:** `panelCoverageManifest.js:461–515`; `panel.js:114,534–555`;
  `panel-v2.html`, `panel-v2.js`, `tests/panel-v2/README.md`.
- **Karar:** Hayır. Mevcut projection ÆON/inbox ve app observer alanları içindir;
  reminder definition/occurrence/delivery aggregate’i yoktur.
- **Etkiler:** Panel capability yalnız mevcut surface için `kısmi`; reminder
  desteği REM-56–REM-64’te explicit no-op veya güvenli aggregate olmalıdır.
- **Sonraki adım:** REM-55–REM-66 current panel hattı; REM-67–REM-72 integration.

## 7. REM-01 state / privacy / delivery contract freeze

### REM-ADR-010 — Tek reminder state ve privacy boundary’si

- **Tarih:** 2026-08-13
- **Durum:** accepted for planning
- **Soru:** Reminder tanımı, kullanıcı tercihi, oluşum, teslimat ve susturma
  bağlamı hangi tekil sahiplik sınırlarıyla tutulmalı?
- **Kanıt:** UX planı §5.3, §8.1–8.8 ve §13.1–13.4; `app.js:1454` `migrate`,
  `app.js:3177–3196` `save` / `commit`, `sync.js:495–557,716–775`
  `merge*` / `sanitize`; REM-00 evidence.
- **Karar:** `ReminderDefinition` statik katalog sahibidir;
  `ReminderPreference` additive `data.reminders.preferences` canonical state
  sahibidir ve remote payload’dan `sanitize` ile çıkarılır;
  `ReminderOccurrence` scheduler’ın yeniden hesaplanabilir derived state’idir;
  `ReminderDelivery` yalnız `seyma-reminder-delivery-v1` local key’inde bounded
  cihaz logudur; `SuppressionContext` yalnız anlık evaluation context’idir.
- **Etkiler:** Tek app `data` objesi korunur; private preference remote full-
  replace zincirine çıkmaz; delivery logu sync/panel merge’ine girmez; yeni
  alanlar runtime başlamadan önce owner, retention ve negative privacy testine
  bağlanır.
- **Sonraki adım:** REM-02 contract fixture; REM-04 migration; REM-09 delivery;
  REM-25 sync privacy.

### REM-ADR-011 — Contract alanları, owner, retention ve privacy sınıfları

**Privacy sınıfları:** `P0 catalog-safe` kullanıcıya özel olmayan sabit katalog
verisi; `P1 operational` kısa ömürlü cihaz/runtime metadata’sı; `P2
private-local` kullanıcı rutini, zamanlaması veya davranışı; `P3
sensitive-content` terapi, sağlık, mood, journal, prayer completion veya raw
detail; `P4 secret` token / credential. `P2–P4` remote payload ve panel için
varsayılan olarak yasaktır; native kanal yalnız güvenli `privateTitle` kullanır.

| Contract | Alan | Zorunluluk | Tek owner | Saklama | Privacy |
|---|---|---|---|---|---|
| `ReminderDefinition` | `id` / `category` / `priority` | zorunlu | Product reminder catalog | Kod/katalog sürümleri boyunca | P0 |
| `ReminderDefinition` | `purposeKey` / `titleKey` / `privateTitleKey` / `bodyKey` | zorunlu | Product reminder catalog | Katalog sürümü; raw rendered detail kalıcı state değildir | Key P0; rendered `body` P3 |
| `ReminderDefinition` | `deepLink` / `triggerType` / `frequency` | zorunlu | Product reminder catalog | Katalog sürümü | P0 |
| `ReminderDefinition` | `defaultWindow` / `defaultChannel` | zorunlu | Product reminder catalog | Katalog sürümü | P0 |
| `ReminderDefinition` | `snoozeOptions` / `suppressionRules` | opsiyonel | Product reminder catalog + policy owner | Katalog sürümü | P0 |
| `ReminderDefinition` | `definitionVersion` | zorunlu | Product reminder catalog | Her tanımla birlikte kalıcı | P0 |
| `ReminderPreference` | `reminderId` | zorunlu | User preference map (`data.reminders.preferences`) | Kullanıcı değiştirene veya clear/reset’e kadar | P2 |
| `ReminderPreference` | `enabled` / `privacyMode` | zorunlu | User preference map | Aynı | P2; default privacy-safe |
| `ReminderPreference` | `daysOfWeek` / `timeWindow` / `offsetMinutes` | opsiyonel | User preference map | Aynı; absent = definition default | P2 |
| `ReminderPreference` | `timezone` | opsiyonel | User preference map / injected clock boundary | Aynı; yalnız IANA timezone | P2 |
| `ReminderPreference` | `channel` / `quietHoursBehavior` / `maxPerDay` / `snoozeOptions` | opsiyonel | User preference map | Aynı; absent = policy/default | P2 |
| `ReminderPreference` | `lastEditedAt` | düzenlendiyse zorunlu | User preference map | Preference ile birlikte | P2 metadata |
| `ReminderOccurrence` | `reminderId` / `occurrenceId` | zorunlu | Foreground scheduler (derived) | Evaluation/queue süresi; canonical history değil | `reminderId` P0; `occurrenceId` P2 |
| `ReminderOccurrence` | `localDate` / `scheduledAt` / `timezone` | zorunlu | Foreground scheduler (derived) | Evaluation/queue süresi | P2 |
| `ReminderOccurrence` | `sourceRevision` / `priority` | zorunlu | Foreground scheduler + definition catalog | Evaluation/queue süresi | P1 |
| `ReminderDelivery` | `occurrenceId` / `channel` / `status` | zorunlu | Device delivery log (`seyma-reminder-delivery-v1`) | Son 30 gün veya son 200 occurrence | P2 |
| `ReminderDelivery` | `shownAt` / `actedAt` | opsiyonel | Device delivery log | Aynı bounded retention | P2 |
| `ReminderDelivery` | `reason` | opsiyonel; yalnız enum | Device delivery log / policy | Aynı; raw error yok | P1/P2 |
| `SuppressionContext` | `quietHours` / `dailyBudgetRemaining` / `recentCategoryDeliveries` | evaluation için zorunlu | Policy evaluator (derived) | Yalnız tek evaluation | P2 |
| `SuppressionContext` | `todayMode` / `completedSignals` / `staleDataSignals` | opsiyonel | Policy evaluator (derived from app state) | Yalnız tek evaluation | P2/P3; persist edilmez |
| `SuppressionContext` | `permissionState` / `visibilityState` | evaluation için zorunlu | Device capability + app lifecycle | Yalnız tek evaluation | P1 |

Bu tabloda her alanın tek bir canonical owner’ı vardır. `ReminderOccurrence`
ve `SuppressionContext` `data` içine kalıcı ikinci state olarak yazılmaz;
`ReminderDelivery` de `data.notifications` içine yazılmaz.

### REM-ADR-012 — Canonical preference, local delivery logu ve sync ayrımı

- **Tarih:** 2026-08-13
- **Durum:** accepted for planning
- **Soru:** Tek `data` objesi ilkesi ile local-only delivery logu nasıl
  uzlaştırılacak?
- **Kanıt:** Root teknik ilke; plan §8.2; `app.js:1451–1454,3177–3194`;
  `sync.js:766–775`.
- **Karar:** Kullanıcının reminder tercihleri gelecekte additive
  `data.reminders.preferences` altında canonical app state olarak tutulur ve
  mevcut `seyma-reset-v1` local persistence ile saklanır. `SeySync.schedule`
  çağrısı bu tercihi remote payload’a taşımadan önce sanitize etmek zorundadır.
  Delivery logu ayrı `seyma-reminder-delivery-v1` localStorage key’inde tutulur;
  `data`, `data.notifications`, remote latest, event log ve panel projection’a
  girmez. Cihazlar arası preference sync varsayılan değildir.
- **Etkiler:** Local canonical preference ile remote sanitized projection
  deliberately farklı olabilir; full-replace sync preference’ı silemez veya
  başka cihazdan geri yazamaz. Açık “cihazlar arasında senkronize et” seçeneği
  gelmeden merge/sync yapılmaz.
- **Sonraki adım:** REM-04 additive migration; REM-09 bounded delivery log;
  REM-25 sanitize / merge negative fixture.

### REM-DISC-007 — Planın “ayrı localStorage key” ifadesi preference owner ile uzlaştırıldı

- **Tarih:** 2026-08-13
- **Durum:** discrepancy → resolved for planning
- **Soru:** Plan §8.2’de kategori tercihlerinin ayrı localStorage key’inde
  tutulması ile tek data objesi + additive canonical preference kararı çelişiyor
  mu?
- **Kanıt:** Plan §8.2; REM-01 kullanıcı talimatındaki “kullanıcı tercihleri
  additive canonical state alanında, uzak payload sanitize dışında” kararı;
  root data ilkesi; mevcut `app.js:1451–1454,3177–3194`.
- **Karar:** Bu program için canonical owner `data.reminders.preferences`tir;
  “ayrı local key” kuralı delivery logu ve browser permission gibi cihaz
  metadata’sı için uygulanır. Preference’ın remote’dan sanitize edilmesi local
  privacy sınırını sağlar. Plan sahibi ileride farklı storage seçerse bu
  karar ve migration contract birlikte revize edilmelidir.
- **Etkiler:** Aynı preference alanının iki sahibi oluşmaz; REM-04 fixture’ı
  local deep parity ve remote absence’i birlikte test eder.
- **Sonraki adım:** REM-02 schema fixture; REM-04 migration.

### REM-ADR-013 — `data.notifications` ÆON sosyal kanalı olarak ayrıdır

- **Tarih:** 2026-08-13
- **Durum:** accepted for planning
- **Soru:** Reminder delivery, mevcut `data.notifications` dizisine yazılabilir
  mi?
- **Kanıt:** `app.js:3496–3498` default `notifications`; `app.js:12260–12261`
  `notifList`; `app.js:12449–12476` `mergeInbox`; `sync.js:495–557,716–762`
  notification merge; REM-00 `REM-DISC-001`.
- **Karar:** Hayır. `data.notifications` yalnız ÆON observer/inbox mesajları,
  read/seen/synced yaşam döngüsü ve sosyal native notification akışının
  sahibidir. Reminder delivery kendi key/status/occurrence/dedupe alanına
  sahip olur ve ÆON bütçesiyle birleşmez.
- **Etkiler:** `occurrenceId` ile ÆON `id` çakışmaz; mergeById, popup, native
  cooldown, panel timeline ve remote receipt reminder geçmişini yanlışlıkla
  tüketmez.
- **Sonraki adım:** REM-09 delivery; REM-25 sync privacy; REM-55–REM-64 panel
  no-op/redaction.

### REM-ADR-014 — Native private title ve in-app detail body negatif sözleşmesi

- **Tarih:** 2026-08-13
- **Durum:** accepted for planning
- **Soru:** Native bildirim ile uygulama içi ayrıntı hangi test edilebilir
  sınırla ayrılmalı?
- **Kanıt:** Plan §13.1, §13.3–13.4; plan §5.3; REM-00 native capability
  `kısmi` bulgusu; mevcut `app.js:12647–12719` ÆON-only native yolu.
- **Karar:** Native adapter yalnız allowlisted `privateTitleKey` sonucunu
  kullanır; `bodyKey` ile çözülen detail body yalnız app içi card/detail
  yüzeyine gider. Native title/body, delivery log, sync receipt, event log,
  panel projection ve debug output içinde raw detail bulunamaz.
- **Etkiler:** Therapy/mood/journal/prayer completion, medication name/dose,
  GPS, personal note ve raw user text negative assertion ile yasaklanır;
  permission reddedilse bile in-app detail çalışır.
- **Sonraki adım:** REM-06 permission; REM-22/23 native; REM-25 sync privacy;
  REM-26 panel projection.

### REM-ADR-015 — Migration, timezone, duplicate, multi-tab ve retention invariant’ları

- **Tarih:** 2026-08-13
- **Durum:** accepted for planning
- **Soru:** Contract runtime’a çevrilirken hangi veri bütünlüğü invariant’ları
  zorunlu olmalı?
- **Kanıt:** Plan §8.3–8.8, §13.2–13.4; test matrix required time/privacy
  matrix; mevcut full-replace sync ve localStorage sınırları.
- **Karar:** Migration additive ve unknown-preserving olmalı; malformed veya
  missing reminder state güvenli default’a dönmeli; ikinci boot deep parity
  vermeli. `occurrenceId` şu bileşenlerden deterministic türetilmeli:
  `reminderId + localDate + scheduledAt + timezone + definitionVersion`.
  Aynı occurrence iki tab, reopen veya retry ile ikinci delivery üretmemeli.
  `scheduledAt` instant, `localDate` takvim günü, `timezone` açık IANA alanı
  olarak test edilmeli; midnight, DST, Europe/Istanbul ve Hicri offset
  senaryoları zorunlu. Delivery log yalnız son 30 gün veya 200 occurrence
  tutulmalı; clear/reset bunu silmeli; raw body hiçbir yere yazılmamalı.
- **Etkiler:** `merge` veya full-replace delivery history’yi uzaktan geri
  getiremez; multi-tab race ve clock-backward durumları blocked/duplicate
  üretmeden görünür status vermelidir.
- **Sonraki adım:** REM-02 contract fixture; REM-04 migration; REM-08 timezone;
  REM-09 delivery; REM-38 concurrency; REM-39 retention.

### REM-ADR-016 — Local commit serbest, canlıya alma program sonuna ertelenir

- **Tarih:** 2026-08-13
- **Durum:** accepted
- **Soru:** Reminder programının geri kalanında commit, push ve canlıya alma
  hangi sırayla yürütülecek?
- **Kanıt:** Kullanıcının güncel talimatı: “bundan sonraki işlemleri commit
  etmeyeceğiz ... hatta düzenli commit yapabilirsin ama canlıya almazsın ...
  tüm zincir sonunda ben kontrol ettikten sonra canlıya alacağız”; mevcut
  `APP-REMINDER-APPROVAL-GATE.md`, `APP-REMINDER-CONTEXT.md` ve root data-safety
  kuralları.
- **Karar:** `REM-02`–`REM-72` boyunca yalnız dar kapsamlı local commitler
  yapılabilir. Program zinciri, final testleri, güvenli local server doğrulaması
  ve kullanıcının kendi cihaz kontrolü bitmeden push, merge, tag, Pages, deploy
  veya external write yapılmaz. Final canlı işlemi için yeni exact user approval
  gerekir.
- **Etkiler:** Local commit history ilerleyebilir; remote ve canlı kanıtı bilinçli
  olarak geride kalır. Önceki `main`/Pages approval scope’u tüketilmiş sayılır;
  `STATE.releaseApproval` tekrar `not_approved` tutulur. Port 9000 local server
  istisnasında kullanıcı browser açar, ajan açmaz ve server durdurulur.
- **Sonraki adım:** Her prompt local commit + no-push handoff; REM-41–43 final
  release packet ve yalnız yeni final approval sonrası controlled release.

### REM-ADR-017 — Sync sanitize ve local-only reminder sınırı

- **Tarih:** 2026-08-16
- **Durum:** accepted
- **Soru:** Reminder preference, occurrence, delivery ve private copy mevcut
  full-replace sync zincirinden nasıl kesin olarak ayrılmalı?
- **Kanıt:** UX planı §8.2, §13.1–13.4; REM-ADR-010–012; `sync.js`
  `mergeData` / `sanitize` / `pushWithCfg`; `tests/reminders/test_reminder_sync_privacy.js`.
- **Karar:** `sanitize` remote projectiondan `data.reminders` ve bilinen
  reminder/delivery köklerini çıkarır; settings secret’larını ve ham receipt
  detail’ini normalize eder. `mergeData` remote girdiyi aynı sanitize
  sınırından geçirir, local-only kökleri başka cihazdan import etmez ve boş
  cihazda da secret taşımaz. Pre-push backup yalnız sanitized projectionı
  kullanır. Local canonical state ve `seyma-reminder-delivery-v1` cihazda
  kalır; cihazlar arası reminder preference sync varsayılan değildir.
- **Etkiler:** Full-replace payload güvenli gün/observer alanlarını korurken
  therapy, medication, occurrence, body, note ve delivery ayrıntılarını
  taşımaz; sync regression davranışı korunur. Bu karar gerçek data repo write
  veya canlı release izni vermez.
- **Sonraki adım:** REM-26 panel mirror / redacted system health.

### REM-ADR-018 — Current panel reminder mirror’ı bilinçli no-op

- **Tarih:** 2026-08-16
- **Durum:** accepted
- **Soru:** Current Panel reminder tarafında enabled category count, stale
  prayer flag, permission health veya scheduler health gösterilmeli mi?
- **Kanıt:** REM-ADR-017; `sync.js` local-only root listesi ve sanitize/merge
  sınırı; `panelCoverageManifest.js` mevcut projection sözleşmesi;
  `tests/reminders/test_reminder_panel_projection.js` sentetik negative fixture;
  mevcut Panel-v1 / Panel-v2 kapsam ayrımı.
- **Karar:** Hayır, REM-26 için current Panel reminder mirror’ı bilinçli
  no-op’tur. `data.reminders` ve delivery kökleri remote latest/projection’a
  çıkmadığı için enabled category count güvenilir biçimde hesaplanamaz;
  browser permission cihaz-local, foreground scheduler health geçici evaluation
  state’idir. `settings.prayer.remindersEnabled` da tek başına capability veya
  stale-prayer health kanıtı değildir (REM-DISC-002). Yokluğu `0`, `healthy` ya
  da `stale=false` diye sunmak yanlış gözlem olur.
- **Privacy sınırı:** Manifest, legacy veya hatalı sentetik input’ta bile
  `reminders`, delivery log/delivery history köklerini fail-closed redacted
  eder. Private schedule, therapy/medication detail, mood, notes, body,
  secret, raw profile ve occurrence ID panel projection’a girmez.
- **Etkiler:** Panel-v1’e yeni reminder kartı, app-state mutation, reminder
  scheduler importu veya reminder-specific write network eklenmedi. Panel-v2
  regression yüzeyi bu prompta dahil edilmedi. Gelecekte güvenilir aggregate
  için önce yeni bir remote-safe schema ve açık ürün kararı gerekir.
- **Sonraki adım:** REM-27 accessibility, copy ve theme QA; daha ayrıntılı
  current-panel reminder kararları REM-55–REM-66 surface hattında yeniden
  değerlendirilebilir.

### REM-ADR-019 — Privacy-safe measurement contract ve telemetry yasağı

- **Tarih:** 2026-08-16
- **Durum:** accepted
- **Soru:** R9 ürün hedefleri kullanıcıyı izleyen bir engagement telemetry’si
  olmadan nasıl ölçülebilir?
- **Kanıt:** UX planı §2.1–§2.3, Faz R9 telemetry’siz observability çıkış
  kapısı, §17 P0–P3; `tests/reminders/test_reminder_metrics.js`;
  `docs/reminders/evidence/REM-30.md`; test matrix G9-A ve traceability §2.
- **Karar:** REM-30 ölçüm sözleşmesi yalnız sentetik fixture, cihazda kalan
  local aggregate ve kullanıcının açıkça verdiği geri bildirim bucket’larını
  kullanır. Analytics servisi, production telemetry, gerçek kullanıcı verisi,
  kimlik, kategori, mood, terapi, journal, ibadet/prayer, ilaç, raw metin,
  reminder/occurrence ID ve cross-device profil çıkarımı yasaktır. Click-through
  ve completion ikincil sinyaldir; dismiss, snooze, mute ve düşük bildirim
  yoğunluğu güvenlik/kontrol sinyalidir ve daha fazla bildirim gerekçesi olamaz.
- **Etkiler:** `data`, sync, panel ve release state’e yeni telemetry alanı
  eklenmez; metrik sözleşmesi local-only ve no-write kalır. Her metrikte yanlış
  yorum riski ve source/evidence seviyesi yazılır; source/test PASS deploy veya
  cihaz PASS sayılmaz. `releaseApproval` `not_approved` kalır.
- **Sonraki adım:** REM-31 günlük akışları bu düşük yoğunluk ve çıkış sinyali
  sözleşmesini koruyarak ele alır; REM-40 traceability reconciliation’da
  ölçüm contract’ını yeniden kontrol eder.

### REM-ADR-020 — Opt-in kişiselleştirme yalnız explicit ve öneri-tabanlıdır

- **Tarih:** 2026-08-16
- **Durum:** accepted
- **Soru:** Reminder uyarlaması hangi sinyalleri kullanabilir ve ayarları ne
  zaman değiştirebilir?
- **Kanıt:** UX planı §2.2, §4.2, §11.1–§11.4, §13.3, §18; REM-ADR-010–012,
  REM-ADR-019; `app.js` REM-34 personalization boundary;
  `tests/reminders/test_reminder_personalization.js`,
  `test_reminder_privacy.js` ve `test_reminder_policy.js`.
- **Karar:** Uyarlama varsayılan olarak kapalıdır. Kullanıcı açıkça opt-in
  edip yerel geçmişi açmadıkça kategori, saat, erteleme veya feedback sinyali
  tutulmaz. Tutulan kayıtlar yalnız allowlist edilmiş kaynak/value alanlarını
  taşır; mood, terapi, ibadet, sağlık, günlük metni ve sessizlik çıkarım
  kaynağı olamaz. Motor yalnız daha düşük yoğunluklu veya uygulama içi kanal
  önerir; hiçbir öneriyi kendiliğinden uygulamaz. Uygulama, neden + kaynak +
  geri alma yolunu gösterir; reset/opt-out/no-history geçmişi temizler.
- **Guardrail etkisi:** Öneri üretimi pure ve deterministiktir; native cap,
  quiet hours, low-capacity ve günlük bütçe policy katmanına devredilir.
  Uygulama yalnız `native -> in_app` veya mevcut modu `light` yapabilir;
  mevcut kullanıcı değişikliği üzerine yazmaz ve undo sırasında değer değişmişse
  fail-closed döner. Sinyaller `data.reminders` local-only sınırında kalır;
  sync, panel, native copy ve external telemetry yüzeylerine çıkmaz.
- **Sonraki adım:** REM-35 haftalık sakin özet bu opt-in, score-free ve
  local-only sözleşmeyi değiştirmeden ele alır.

### REM-DISC-008 — R12–R14 fixture ve runtime sahipleri henüz uygulanmış kanıt değildir

- **Tarih:** 2026-08-17
- **Durum:** deferred
- **Soru:** Prompt/test matrix’te sahipleri yazılı olan app runtime, current
  panel ve cross-surface integration işleri mevcut source/test tree’de
  uygulanmış sayılabilir mi?
- **Kanıt:** UX planı §14 R12–R14; `APP-REMINDER-TEST-MATRIX.md` G12–G14;
  `APP-REMINDER-APP-PANEL-SURFACE-MAP.md`; `tests/reminders/` envanteri;
  `app.js`, `sync.js`, `sw.js`, `panel.js`; REM-39 evidence sınırı.
- **Karar:** Hayır. `test_reminder_app_*`, gelecekteki
  `test_reminder_panel_*` ve lineage/cross-surface/integrated fixture aileleri
  henüz mevcut değil; prompt ve gate satırlarının bulunması PASS veya runtime
  teslimi kanıtı değildir. REM-44–REM-72 planlı kalır ve her biri kendi
  allowlist’i içinde source/test/evidence üretmeden ready/done sayılamaz.
- **Etkiler:** R0–R9/REM-39 kanıtı yalnız mevcut reminder davranışını kapsar;
  app runtime adapterı, current panel reminder surface’i ve
  app→sync→projection→panel zinciri ileriye dönük bırakılır. Panel-v2 ayrı
  regression kanıtıdır. Bu kayıt runtime/data değiştirme izni vermez.
- **Sonraki adım:** REM-41 evidence freeze; daha sonra sıralı olarak REM-44,
  REM-55 ve REM-67 hatları.

### REM-DISC-009 — Plan §18 açık ürün kararları release approval değildir

- **Tarih:** 2026-08-17
- **Durum:** deferred
- **Soru:** Plan §18’deki 17 açık ürün / release sorusu, mevcut planning
  kararlarıyla kullanıcı tarafından karara bağlanmış kabul edilebilir mi?
- **Kanıt:** UX planı §18; `APP-REMINDER-DECISIONS.md` REM-ADR-004/005/019/020;
  `APP-REMINDER-APPROVAL-GATE.md`; `APP-REMINDER-STATE.json` release approval.
- **Karar:** Hayır. Planning default’ları ve safety guardrail’leri karar
  günlüğünde tutulur; bunlar exact kullanıcı release eylemi, branch kapsamı,
  cihaz kabulü veya `releaseApproval=approved` yerine geçmez. Karar gerektiren
  kapsamlar REM-41’de listelenir, REM-42’de exact approval olmadan açılmaz.
- **Etkiler:** REM-40 yalnız traceability ve evidence sahipliğini kapatır;
  REM-41 freeze olabilir, REM-42 `approval_required` kalır, REM-43
  çalıştırılamaz. Push, merge, tag, Pages, canlı browser ve external write
  yapılmaz.
- **Sonraki adım:** REM-41 packet; kullanıcı kararı gerekiyorsa REM-42 exact
  scope receipt.

### REM-DISC-010 — G10-A ID sayısı 44 değil 73’tür

- **Tarih:** 2026-08-17
- **Durum:** discrepancy
- **Soru:** G10-A test matrix satırındaki “44 ID” ifadesi canonical prompt
  inventory ile uyumlu mu?
- **Kanıt:** `APP-REMINDER-TEST-MATRIX.md` eski G10-A satırı;
  `verify-reminder-context.mjs` içindeki `expectedIds` REM-00…REM-72;
  prompt/ledger envanteri ve REM-40 traceability matrix.
- **Karar:** Uyumlu değildi; REM-40 auditinde G10-A şartı `73 contiguous ID`
  olarak düzeltildi. Validatorın beklediği prompt sayısı ve sırası değişmedi.
- **Etkiler:** Test gate artık 73 prompt, link/pointer parity ve
  `not_approved` default’unu açıkça ifade eder. Bu yalnız dokümantasyon
  düzeltmesidir; prompt eklenmedi, runtime/data değişmedi.
- **Sonraki adım:** REM-41 release packet içinde aynı 73-ID receipt’ini
  kullanmak; yeni prompt eklenirse matrix, prompt, ledger, state ve validator
  birlikte güncellenir.

### REM-UX-011 — Retention kartında bilgi hiyerarşisi ve yıkıcı aksiyon ayrımı

- **Tarih:** 2026-08-17
- **Durum:** decided
- **Soru:** Reminder Center “Saklama ve çıkış” kartındaki sıkışık metrikler ve
  aynı ağırlıktaki aksiyonlar release candidate’a kalabilir mi?
- **Kanıt:** Kullanıcının 2026-08-17 tarihli ekran görüntüsü; `app.js`
  `reminderCenterRetentionHTML`; `styles.css` REM-37 visual block;
  `tests/reminders/test_reminder_visual.js`; `evidence/REM-41.md`.
- **Karar:** Hayır. Etiket/değer/meta blokları ayrılacak, güvenli ve geri
  alınabilir işlemler birlikte gruplanacak, reminder-only sıfırlama ayrı dikkat
  alanında gösterilecek. Copy kısa tutulacak; davranış ve privacy sınırı aynı
  kalacak.
- **Etkiler:** `a0e8909` yalnız reminder retention HTML/CSS/cache-bust ve
  ilgili headless visual assertion’ını değiştirir; `data/`, sync sözleşmesi,
  reset/undo davranışı ve gerçek veri deposu etkilenmez.
- **Sonraki adım:** REM-42 exact user approval scope; sonra yalnız onaylanan
  main/Pages release adımları.

### REM-GATE-001 — Exact current approval main + Pages release ile sınırlı

- **Tarih:** 2026-08-17
- **Durum:** decided
- **Soru:** Kullanıcının “tümünü push commit merge yapalım ... canlıya alarak
  devam ederiz” mesajı hangi dış eylemleri yetkilendiriyor?
- **Kanıt:** `docs/reminders/evidence/REM-42.md`; `APP-REMINDER-APPROVAL-GATE.md`;
  güncel `APP-REMINDER-STATE.json`; kullanıcı mesajı.
- **Karar:** Mevcut local `main` commit zincirinin `origin/main`e push edilmesi,
  fast-forward remote eşitliği, Pages workflow/deployment ve canlı
  HTTP/cache-bust kanıtı açıkça scope içidir. `mustafaras/seyma-data`, tag,
  force-push, history rewrite, başka remote ve cihaz kabulü scope dışıdır.
- **Etkiler:** `releaseApproval=approved` yalnız REM-43 execution precondition’ı
  olarak tutulur; deployment sonrası state tekrar `not_approved` yapılır.
  Source/test, remote/Pages ve S5 cihaz kanıtı birbirine yükseltilmez.
- **Sonraki adım:** REM-43 yalnız bu scope ile yürütülecek.

### REM-GATE-002 — Release tamamlandı, approval tekrar tüketildi

- **Tarih:** 2026-08-17
- **Durum:** decided
- **Soru:** Approved scope release tamamlandıktan sonra release state nasıl
  tutulmalı?
- **Kanıt:** `docs/reminders/evidence/REM-43.md`; Pages workflow 32020308731;
  deployment 5943212723; live `index.html`, `styles.css`, `app.js` HTTP receipt.
- **Karar:** `main` push, remote equality, Pages success ve live cache-bust
  kanıtlandıktan sonra approval tek kullanımlık kabul edilip
  `STATE.releaseApproval` tekrar `not_approved`, boş scope, null evidence ve
  null approvedAt olur. S5 kullanıcı cihazı kabulü ayrı pending kalır.
- **Etkiler:** `mustafaras/seyma-data` değişmedi; yeni bir dış release için yeni
  exact user approval gerekir. `REM-44` yalnız local/runtime prompt olarak
  açılır, release yetkisi taşımaz.
- **Sonraki adım:** REM-44 app runtime adapter preflight.

### REM-GATE-003 — Her başarılı prompt sonrası bounded main/Pages teslimatı

- **Tarih:** 2026-08-17
- **Durum:** decided
- **Soru:** Kullanıcının “her prompttan sonra bu yapılsın bunu düzenler misin”
  talimatı prompt zincirinin dış teslimat sırasını değiştiriyor mu?
- **Kanıt:** exact current user message; `APP-REMINDER-APPROVAL-GATE.md`;
  `APP-REMINDER-CONTEXT.md`; `APP-REMINDER-STATE.json`.
- **Karar:** Evet. Her prompt closure validator PASS sonrası dar commit,
  `main` fast-forward push/merge, GitHub Pages workflow/deploy, remote equality,
  deployment status ve live HTTP/cache-bust receipt aynı kapanış akışının zorunlu
  parçasıdır. `releaseApproval` bu standing scope için `approved` yapılmaz;
  ad hoc/final release kilidi `not_approved` kalır.
- **Dışarıda:** `mustafaras/seyma-data`, başka remote, tag, force-push, history
  rewrite, arbitrary external write ve kullanıcı cihazı acceptance.
- **Sonraki adım:** REM-50 ve sonraki her başarılı prompt bu delivery policy ile
  kapanır; Pages/remote failure promptu blocked bırakır.

### REM-ADR-021 — Panel reminder yüzeyi no-op olarak yeniden onaylandı (REM-57)

- **Tarih:** 2026-08-19
- **Durum:** accepted
- **Soru:** ÆON panelinde reminder verisi gösterilmeli mi; gösterilecekse
  hangi minimum redacted aggregate ile?
- **Kanıt:** `APP-REMINDER-APP-PANEL-SURFACE-MAP.md` §2 ve §4; UX planı §13.2;
  REM-ADR-017 / REM-ADR-018; `app.js` `REMINDER_SYNC_BLOCKED_ROOTS` (yedi kök)
  ve `REMINDER_PRIVACY_SCHEMAS`; `panelCoverageManifest.js`
  `MANIFEST.reminderCoverage` (REM-56); `tests/reminders/test_reminder_panel_redaction.js`
  (163 assertion / 6 senaryo).
- **Karar:** Hayır — panel reminder yüzeyi **no-op** kalır. Üç gerekçe ayrı ayrı
  geçerlidir: **feature** — panelin sahip olduğu hiçbir kullanıcı akışı reminder
  tercihine bağlı değildir, gözlemci hatırlatma kurmaz/erteleme yapmaz;
  **operator** — yedi reminder kökü sync sınırını geçmediği için panelde
  hesaplanabilecek her "sağlık" değeri kanıtsız tahmindir (yokluğu `0` veya
  `healthy` diye sunmak yanlış gözlemdir, REM-ADR-018); **privacy** — reminder
  yüzeyi kullanıcının kendi kelimeleriyle yazdığı başlık, gövde, ilaç adı,
  terapi notu ve ritüel saatini taşır, bunların hiçbirinin ikinci bir kişiye
  görünmesi için ürün gerekçesi yoktur.
- **Tek istisna:** REM-53'ün `safeEventSummary` sözleşmesi. `data.eventLog`
  içindeki sabit `Bildirim yaşam döngüsü güncellendi` özeti + `reminder-v1:`
  correlation prefix'i zaten sync sınırını geçer ve manifestte `summary`
  sınıfındadır. Bu bir reminder aggregate'i değil, mevcut event log'un bir
  satırıdır; yeni alan, sayaç veya kart açmaz.
- **Reddedilen alternatif:** "minimum redacted aggregate" (system health,
  enabled category count, safe delivery status). Üçü de ya cihaz-local veriden
  türetilemez ya da türetilse bile kategori kümesi üzerinden sağlık/iman
  rutinini ifşa eder. Coverage ribbon'ında bir `unmapped` sayacı göstermek
  ileride değerlendirilebilir; bu REM-60 (status/provenance) kapsamıdır ve
  `panel.html` cache-bust'ı gerektirdiği için REM-57'de yapılmadı.
- **Etkiler:** `panel.js`, `panel.html` ve `panel.css` REM-57'de değişmedi
  (bilinçli no-op). Karar artık yalnız belge değil, yapısal olarak zorlanıyor:
  manifestin üretmediği bir section anahtarı (`reminderHealth`,
  `schedulerHealth`) uzak projection'dan gelse bile panele adopt edilmez.
- **Sonraki adım:** REM-58 transport; reminder aggregate ihtiyacı doğarsa önce
  yeni remote-safe schema + açık ürün kararı, sonra REM-60/REM-61.

### REM-ADR-022 — Uzak projection untrusted input'tur; sections/coverage/snapshot sanitize edilir

- **Tarih:** 2026-08-19
- **Durum:** accepted
- **Soru:** `data/observer-snapshot.json` içeriğinin hangi kısmına güvenilir?
- **Kanıt:** `panelCoverageManifest.js` `chooseProjection` (REM-57 öncesi hâli);
  `panel.js` `PROJECTION.sections=PROJECTION.state.sections||{}`;
  `tests/reminders/test_reminder_panel_redaction.js` 3. senaryo.
- **Karar:** Hiçbirine körü körüne güvenilmez. `data` zaten yeniden redakte
  ediliyordu; `sections`, `coverage` ve dönen `snapshot` **aynen kopyalanıyordu**.
  Artık: (a) yerelde yeniden kurulabilen ayna bölümler her zaman yerelden
  kurulur, (b) yalnız app'in ham kaynaktan hesapladığı beş bölüm
  (`dailyPhoto`, `therapyProvenance`, `profileProgress`, `notificationTimeline`,
  `externalSources`) adopt edilir ve bunlarda secret / blob / reminder-namespace
  anahtarları ayıklanır, (c) manifestin üretmediği her section anahtarı düşer,
  (d) uzak `coverage` güncel sınıflandırmadan yeniden geçirilir ve reminder
  girdileri maskelenir, (e) dönen `snapshot` yalnız metadata + sanitize edilmiş
  data/sections/coverage taşır.
- **Gerekçe:** Projection dosyası veri deposunda yaşar ve **eski veya hatalı bir
  app sürümü** tarafından yazılmış olabilir; panelin sözleşmesi "okuduğunu
  yeniden redakte et"tir, yarısı uygulanmış hâli sözleşme değildir.
- **Etkiler:** Zengin raw-derived değerler (thoughtCount, responseCount,
  notification lifecycle sayaçları) korunur; 118/118 fixture PASS. Adoption
  kararı `chosen.adoption` raporu ile denetlenebilir.
- **Sonraki adım:** REM-58/REM-59 transport ve partial fetch bu sanitize edilmiş
  sections sözleşmesinin üzerine kurulur.

### REM-ADR-023 — Manifest ve projection schema sürüm politikası

- **Tarih:** 2026-08-19
- **Durum:** accepted
- **Soru:** REM-56 sınıflandırma sözleşmesi `schemaVersion` / `manifestVersion`
  bump'ı gerektiriyor mu?
- **Kanıt:** `panelCoverageManifest.js` `MANIFEST.reminderCoverage`,
  `buildObserverSnapshot`, `parseObserverSnapshot`;
  `tests/test_panel_p1_projection.js` [1b]; `docs/reminders/evidence/REM-56.md`.
- **Karar:** Hayır. Değişiklik yalnız yayımlanabilir alan kümesini **daraltıyor**
  ve zaten deklare edilmiş `unmappedPaths` listesini dolduruyor; wire kırılmadı,
  bu yüzden `schemaVersion` 1 ve `manifestVersion` `panel-coverage-v1` kalır.
  Sınıflandırma kendi `contractVersion`'ını taşır
  (`panel-reminder-coverage-v1`) ve projection'a additive
  `reminderCoverageVersion` alanı olarak yazılır; `parseObserverSnapshot` bu
  alanı zorunlu tutmaz, böylece eski projection dosyaları hâlâ okunur.
- **Kural:** Gözlemci yüzeyini **genişleten** (daraltmayan) bir sonraki manifest
  değişikliği `panel-coverage-v2` bump'ı ve panel tarafında explicit sürüm
  kontrolü ister. Daraltıcı değişiklikler yalnız `contractVersion` bump'ı ile
  gider.
- **Etkiler:** Panel/Panel-v2 tüketicileri aynı adapter'ı sürüm kırılmadan
  okumaya devam eder; teslimatta üç yüzeyin `?v=` cache-bust'ı bumplandı.
- **Sonraki adım:** REM-60 status/provenance yüzeyi sürüm alanını görünür
  kılmayı değerlendirebilir.

### REM-DISC-011 — Belge parity farkları: surface map PANEL-01 satırı ve test matrisi G13-B adı

- **Tarih:** 2026-08-19
- **Durum:** discrepancy
- **Soru:** Belgeler ile uygulanan gerçek arasındaki iki fark nasıl kapanacak?
- **Kanıt:** `APP-REMINDER-APP-PANEL-SURFACE-MAP.md` §5 `PANEL-01` satırı
  (prompt sütunu `REM-56, REM-57`), aynı belgenin §2 satırı (REM-55 sayılıyor);
  `APP-REMINDER-TEST-MATRIX.md` G13-B satırı (`test_reminder_panel_manifest.js`)
  ile REM-56 promptunun allowlist/doğrulama komutu
  (`tests/reminders/test_reminder_panel_coverage.js`).
- **Karar:** İkisi de belge tarafı farkıdır, kod tarafı prompt sözleşmesini
  izler. Her iki dosya da REM-55/REM-56/REM-57 allowlist'lerinde olmadığı için
  bu promptlarda düzeltilmedi.
- **Etkiler:** Gerçek fixture yolları: `test_reminder_panel_source.js` (G13-A),
  `test_reminder_panel_coverage.js` (G13-B), `test_reminder_panel_redaction.js`
  (G13-C). PANEL-01 gap'i fiilen REM-55 + REM-56 + REM-57 ile kapandı.
- **Sonraki adım:** Surface map / test matrisi allowlist'i açık olan ilk prompt
  (REM-66 panel QA veya matris sahibi) iki satırı gerçek yola çeker.

### REM-DISC-012 — Adopt edilen raw-derived bölümlerde reminder dışı ham metin hâlâ mümkün

- **Tarih:** 2026-08-19
- **Durum:** deferred
- **Soru:** REM-57 sanitizasyonu uzak projection'daki TÜM hassas içeriği kapatıyor mu?
- **Kanıt:** `panelCoverageManifest.js` `sanitizeAdoptedValue` (secret / blob /
  reminder-namespace anahtarlarını düşürür); `tests/reminders/test_reminder_panel_redaction.js`
  3. senaryo (reminder ve secret alanları düşüyor, `thoughtCount` korunuyor).
- **Karar:** Hayır, tamamı değil. Beş raw-derived bölüm (`dailyPhoto`,
  `therapyProvenance`, `profileProgress`, `notificationTimeline`,
  `externalSources`) **meşru anahtarlarının içine** konmuş reminder-dışı ham
  metni (ör. `therapyProvenance.thoughts[*].summary` alanına ham terapi cümlesi)
  hâlâ adopt edebilir; bu alanların değer düzeyinde yeniden doğrulanması
  reminder sınırı değil terapi/profil redaction sınırıdır.
- **Etkiler:** Bugün gerçek bir sızıntı değildir — app tarafı bu alanlara sabit
  `Metin redacted` yazar ve `days.*.therapy.*` kökleri zaten redacted'tır. Risk
  yalnız eski/hatalı bir app sürümünün yazdığı projection dosyası için geçerlidir.
- **Sonraki adım:** REM-64 (panel redaction sahibi, surface map §2) bu beş
  bölümün alan düzeyinde yeniden doğrulanmasını üstlenir.

### REM-ADR-024 — Panel reminder dashboard card bilinçli no-op (REM-61)

- **Tarih:** 2026-08-19
- **Durum:** accepted
- **Soru:** ÆON panelinde reminder için ayrı bir bento / module dashboard card
  açılmalı mı?
- **Kanıt:** `panel.js` `reminderStatusCardHTMLP` (REM-60, render() içinde
  `coverageRibbonHTMLP` sonrası çağrılır), `d4ModuleDescriptorsP`,
  `d4ModuleAtlasHTMLP`, `coreModules`, `rootModulesCardHTMLP`,
  `p4ProvenanceCardHTMLP`; `panelCoverageManifest.js`
  `MANIFEST.reminderCoverage` (REM-56); REM-ADR-018 / REM-ADR-021;
  `tests/reminders/test_reminder_panel_status.js` (REM-60 gate, 223 assertion);
  surface map §2 (dashboard cards row) ve §4 (hard boundaries).
- **Karar:** Hayır — ayrı bir reminder dashboard card **açılmaz** (bilinçli
  no-op). Üç gerekçe ayrı ayrı geçerlidir: **feature** — panelin hiçbir mevcut
  kullanıcı akışı reminder tercihine bağlı değildir; gözlemci hatırlatma
  kurmaz/erteleme yapmaz (REM-ADR-021); **duplicate/operator** — REM-60'ın
  `reminderStatusCardHTMLP` zaten beş ayrı boyutta (capability, kaynak
  tazeliği, generic delivery sağlığı / receipt, privacy, cihaz kabulü) güvenli
  aggregate'i aynı kart sözleşmesinde render eder; ayrı bir modül kartı bu
  yüzeyi çoğaltır ve "kategori kümesi üzerinden sağlık/iman rutinini ifşa"
  etme riskini (REM-ADR-021 reddedilen alternatif) geri getirir; **privacy** —
  modül kartı yalnızca remote-safe aggregate'ten beslenebilir ama yedi reminder
  kökü sync sınırını geçmediği için panelde hesaplanabilecek her "sağlık"
  değeri kanıtsız tahmindir; REM-ADR-018 yokluğu `0`/`healthy` diye sunmayı
  yanlış gözlem sayar.
- **Yapısal olarak zorlanır:** `d4ModuleDescriptorsP` içinde hiçbir reminder
  modülü descriptor'ı yoktur; `d4ModuleAtlasHTMLP` reminder kartı üretmez;
  `coreModules` hiçbir reminder enabled-state göstergesi taşımaz. Panel,
  manifestin üretmediği bir section anahtarını (`reminderHealth`,
  `schedulerHealth`) uzak projection'dan gelse bile adopt etmez (REM-ADR-021 /
  REM-57). Bu no-op ayrıca REM-61'in yeni `test_reminder_panel_card.js` G13-G
  fixture'ı ile sabitlenir (d4ModuleDescriptorsP/coreModules/rootModulesCardHTMLP
  /p4ProvenanceCardHTMLP'de reminder descriptor yokluğu; status kartı hâlâ tek
  reminder dashboard yüzeyidir ve hiçbir raw reminder category / schedule / body
  taşımaz).
- **Etkiler:** `panel.js`, `panel.html`, `panel.css` ve
  `panelCoverageManifest.js` bu promptta **değişmez** (bilinçli no-op).
  Reminder gözleminin tek dashboard yüzeyi REM-60 status kartıdır; REM-61
  yalnız karar + negative proof ekler. Reminder tercih/oluşum/teslim cihaz
  yerel kalır; PANEL-03 dashboard gap'i kapanır.
- **Sonraki adım:** REM-62 panel daily detail / event timeline, ardından
  REM-63 observer action boundary. Yeni bir remote-safe reminder aggregate
  schema'sı doğarsa önce açık ürün kararı, sonra REM-61 sonrası bir prompt.

### REM-ADR-025 — Cross-surface status katmanları ve receipt proof gate (REM-68)

- **Tarih:** 2026-08-20
- **Durum:** accepted
- **Soru:** App, sync receipt, projection, panel ve device acceptance aynı olay için tek bir green/success iddiasına indirgenebilir mi?
- **Kanıt:** `app.js` `reminderCrossSurfaceStatus` / `reminderCrossSurfaceTransition`; `sync.js` `syncReceiptEvidence`; `panel.js` `syncReceiptEvidenceP` / `syncStatusP`; `tests/reminders/test_reminder_cross_surface_status.js` (84 assertion); `tests/reminders/test_reminder_system_status.js`; `tests/reminders/test_reminder_panel_status.js`; `tests/test_panel_p0_sync.js`.
- **Karar:** Hayır. Capability, local scheduled, delivered, sync accepted, projection built, panel visible ve device accepted yedi ayrı layer olarak kalır; her layer kendi `owner`, `code`, `reason` ve evidence alanını taşır. `accepted` receipt ancak `snapshotRevision + sourceLatestSha + acceptedAt` birlikte varsa kanıt sayılır. Panel 304 yalnız mevcut görünümü korur; yeni projection/panel success üretmez. Device acceptance explicit kullanıcı kanıtı yoksa `unverified` kalır.
- **Failure semantics:** Offline, native permission denied, stale prayer, sync conflict, projection missing, panel 304 ve device unverified ayrı branch’lerdir. Geri dönüşler `regression/lateral/advance` yönü ve sabit reason ile raporlanır; bir layer PASS’i diğerine propagate edilmez. App kullanıcı copy’si ve operator panel copy’si raw/private detail paylaşmaz.
- **Etkiler:** Legacy app system-status kontratı korunur; cross-surface adapter yalnız entegrasyon iddiası için yeni fail-closed kapıdır. `panel-v2` current panel acceptance yerine geçmez; current reminder, root panel ve Panel-v2 command setleri ayrı raporlanır. Release approval değişmez (`not_approved`), S5 device acceptance pending kalır.
- **Sonraki adım:** REM-69 schema version, migration ve legacy panel compatibility.

### REM-ADR-026 — Integrated privacy gate ve no-write boundary (REM-70)

- **Tarih:** 2026-08-20
- **Durum:** accepted
- **Soru:** App, native, SW, sync, projection, panel DOM/error/event/export ve
  panel write boundary'leri tek bir negative acceptance altında nasıl
  birleştirilecek?
- **Kanıt:** `tests/reminders/test_reminder_integrated_privacy.js` ve
  `tests/reminders/helpers/integrated-privacy-scanner.js`; REM-70 evidence;
  `test_reminder_app_privacy.js`, `test_reminder_panel_privacy.js` ve
  `test_panel_p6_qa_release.js` regression sonuçları.
- **Karar:** Tek sentetik corpus her surface'te taranır. Browser yalnız
  kullanıcıya ait local app surface olarak ayrı raporlanır; native, SW,
  sanitized sync, projection, operator panel, error, event/export ve external
  write boundary'leri strict fail-closed kalır. Panel reminder payload'ı
  reddetmeli ve reddedilen payload için external call sayısı sıfır olmalıdır.
- **Gerekçe:** Önceki REM-52/53/57/63/64 gate'leri ayrı yüzeylerde güçlüdür;
  integrated gate bunların birbirine yanlış green veya private detail
  propagation'ı yapmadığını tek receipt'te doğrular. Test production write,
  gerçek network, token, browser ve cihaz kullanmaz.
- **Etkiler:** `INT-02` privacy/security gap'i synthetic S2 kanıtıyla kapanır;
  `releaseApproval=not_approved`, S5 device acceptance `pending` kalır.
- **Sonraki adım:** REM-71 integrated UX, accessibility ve visual acceptance.
