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
