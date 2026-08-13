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
