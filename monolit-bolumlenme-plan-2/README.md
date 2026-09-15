# Şeyma — `app.js` Kabuk İnceltme Programı (MON2)

**Sürüm:** 1.0 · **Tarih:** 2026-09-15 · **Durum:** `in_progress` · **Kart:** 6/8 · **Dalga 1 + Dalga 2 + Dalga 3 (MON2-06) kapandı** · **Aktif:** `MON2-07` · **Devir:** [`DEVIR-MON2-07.md`](DEVIR-MON2-07.md)

MON serisi (60 kart) `app.js`'i 18.957 → 13.139 satıra indirdi ama satır sayısı
hiçbir kartın hedefi değildi; kapanış belgesi 13.144'ü yalnız *baseline* olarak
kaydetti. Bu program, aynı I1–I6 / S1–S8 sözleşmesi altında, **ölçülen** bir
kabuk bütçesiyle `app.js`'i ~7.8k satıra indirir. Sekiz kart; her kart tek
yerel commit; her kabul `node tools/shell-inventory.mjs --gate` ile sayısal.

Bu program MON serisinin devamı değildir: kendi state/kanıt zinciri vardır
(`MON2-STATE.json`, `.anti-amnesia/`). Dal `premium-fx-gorsel-yuzey`
LOCAL-ONLY kalır; push/merge/tag/deploy/`seyma-data` yazımı ayrı onaydır.

## 1. Teşhis (2026-09-14, `node tools/shell-inventory.mjs`)

| Ölçüm | Değer | Dalga 1 sonrası | MON2-06 sonrası | Yorum |
|---|---:|---:|---:|---|
| `app.js` toplam / kod satırı | 13.139 / 11.839 | 9.771 / 8.532 | **7.797 / 6.766** | 1.140 → 1.031 yorum |
| Sütun-0 fonksiyon | 1.867 | 1.676 | 1.652 | |
| Shim (≤2 kod satırı) | 1.091 fn / 1.148 satır | 1.268 fn / 1.280 satır | 1.383 fn / 1.390 satır | 146 alan gövdesi 1-liner shim'e indi |
| Küçük gövde (3–10) | 530 fn / 2.950 satır | 250 fn / 1.458 satır | 171 fn / 981 satır | |
| Büyük gövde (≥11) | 246 fn / 5.107 satır | 158 fn / 3.425 satır | 98 fn / 1.990 satır | |
| `App.*` handler gövdesi | 554 fn / 2.430 satır | 554 fn / 2.145 satır | 554 fn / 1.638 satır | envanter sabit; gövdeler modülde |
| `*Legacy` çift gövde | 22 fn / 208 satır | 0 / 0 | 0 / 0 | MON2-01'de emekli (K1) |
| `*HTML()` builder (>2 satır) | 60 fn / 1.129 satır | 6 fn / 97 satır | 6 fn / 97 satır | hedef 150 sağlandı |
| **Reminder ayak izi** | **529 fn / 3.247 satır + 120 sabit / 288 satır** | **355 fn / 408 satır + 121 sabit / 289 satır** | 355 / 408 + 121 / 289 | sabit |
| Reminder yalnız-iç fonksiyon | 293 fn / 1.770 satır | 69 fn / 72 satır | 69 / 72 | sabit |

Alan gövdeleri (MON2-06 sonrası, `--domain`): quran 96 fn / 277 · zikr 119 fn / 140 ·
profile 47 fn / 62 · psych 23 fn / 23 — hepsi 1-liner shim. Taşınan gövdeler
`app/core/zikir.js` 1.724 · `app/core/quran.js` 876 · `app/core/profile.js` 1.447.
Planın (c)+(d) sınıfı — `data` rebind, B1 getter, timer/listener kaydı,
`window.App`, 554 `App.x=` ataması, ~180 `App.reminderX=reminderX` alias
satırı — ≈ 3–4k satırdır; gerçekçi alt sınır ~7k'dır.

Kök neden: MON standardı "her taşınan gövdeye 1 satır shim" dedi; 1–2 satırlık
fonksiyonlarda kazanç sıfır. Reminder alanında ayrıca registry-yoksa-Legacy çift
gövde deseni seçildi ve fixture'ların çoğu `reminders.js`'siz boot ettiği için
MON-40..43 yalnız 360 satır taşıyabildi.

## 2. Hedef ve bütçe

| Kart sonrası | `app.js` ≤ | `*Legacy` | reminder gövde ≤ | `*HTML` builder ≤ | Ölçülen |
|---|---:|---:|---:|---:|---:|
| MON2-01 | 13.200 | 22 | 3.300 | 1.150 | 13.150 |
| MON2-02 | 11.300 | 0 | 1.500 | 1.150 | 10.277 |
| MON2-03 | 10.300 | 0 | 450 | 950 | 9.771 |
| MON2-04 | 10.300 | 0 | 450 | 950 | 9.771 |
| MON2-05 | 9.400 | 0 | 450 | 150 | 8.969 |
| **MON2-06** | **8.500** | **0** | **450** | **150** | **7.797 ✅** |
| MON2-07 | 8.000 | 0 | 450 | 150 | — |
| MON2-08 | 8.000 | 0 | 450 | 150 | — |

Bütçe `MON2-STATE.json → shellBudget` alanındadır; her kart kapanışında
**ölçülen değer + %2** ile daraltılır ve **asla gevşetilmez**. Tahmin tutmazsa
kart bütçeyi ölçülen değere çeker ve sapmayı LEDGER'a yazar; kart bloke olmaz.

## 3. Kararlar MON2-K1…K9 (bağlayıcı)

1. **K1 — Legacy emekli:** `SEYMA_REMINDERS.x ? x : xLegacy` çift deseni
   kaldırılır; `SeymaReminders` diğer 23 registry gibi fail-closed olur
   (`registerReminders` başarısızsa `throw`). Gerekçe: `index.html`, iki harness
   ve `test_state_rebind_boundary` zaten `reminders.js` yüklüyor; hiçbir fixture
   Legacy yolunu assert etmiyor (`grep -rnE "SeymaReminders\s*[:=]\s*null" tests/` boş).
2. **K2 — Shim'siz iç taşıma:** Yalnız aynı domain'in fonksiyonlarından çağrılan
   gövdeler app.js'te **hiç iz bırakmadan** taşınır. Shim yalnız (a) domain dışı
   koddan, (b) `App.x=fn` alias satırından, (c) registration bag'inden, (d)
   timer/listener kaydından çağrılan adlar için kalır — 1 satır, imza-koruyan:
   `function x(){ return SEYMA_REMINDERS.x.apply(null,arguments); }`.
   Ölçüm: `node tools/shell-inventory.mjs --domain <ad>` → "yalnız-iç" listesi.
3. **K3 — Sabitler gövdeyle gider:** `var REMINDER_*` (120 blok / 288 satır) ve
   diğer alanların salt-okur sabitleri modüle taşınır; app.js'te yalnız
   registration bag'inin ihtiyaç duyduğu referans kalır. Mutable alan
   değişkenleri (`reminderPermissionTransientState`, `reminderPermissionRequestInFlight`,
   `reminderPermissionEverGranted`, `reminderPermissionGrantObserved`,
   `reminderLifecycleState`, `reminderSchedulerInstance`, `reminderLifecycleTimerId`,
   `reminderMigrationStatus`, `_reminderBody*`) **app.js'te kalır** ve modüle
   `get/set` dep çifti olarak verilir (S5: registry'de yazılabilir state yok).
4. **K4 — Handler gövdeleri appSurface deseniyle:** `App.x=function(){…}` ataması
   app.js'te kalır (I2); gövde `SeymaReminderSurface` / ilgili registry'ye
   `liveData()/liveUi()/call('save')/call('render')` dep bag'iyle taşınır —
   `app/core/appSurface.js` MON-50 deseni birebir. `App.reminderX=reminderX`
   alias satırları **değişmez** (kaynak-metin assert'leri var).
5. **K5 — İki dosya, tek kez liste:** Reminder için `app/core/reminders.js`
   büyür (saf + görünüm) ve **tek yeni dosya** `app/core/reminderSurface.js`
   açılır (yan etkili + handler gövdeleri). Dört yükleme listesi (`index.html`,
   `driver.mjs` FILES, `zikr-harness.mjs` FILES, `test_state_rebind_boundary.js`)
   yalnız MON2-01'de bir kez güncellenir. Dalga 2–3 yeni dosya açmaz.
   **MON2-06 amend (2026-09-15):** Dalga 3'te alan registry'leri (`zikir.js`,
   `quran.js`, `profile.js`) **kendi içinde** bir yüzey bölümü barındırır
   (ikinci sloppy-mode IIFE, `with(SCOPE)`, canlı property-getter'lar) — yeni
   dosya açılmaz, K5 aynen korunur. **Kritik koşul:** bu bölümler
   DOM/timer/sync'e ÇIPLAK GLOBAL ile değil **dep-bag takma adıyla** erişir
   (`document`→`doc`, `setTimeout`→`defer`, `window.SeySync`→`sync`), böylece
   domain dosyaları hiçbir tarayıcı globali adı taşımaz ve MON-20/21/22/36
   saflık sözleşmeleri (`test_zikir_boundary`, `test_quran_boundary`,
   `test_profile_boundary`) zayıflatılmadan PASS eder. Bag üyeleri app.js'te
   `doc:function(){return document;}`, `defer:function(){return setTimeout;}`,
   `sync:function(){return window.SeySync||null;}` biçimindedir.
6. **K6 — Fixture yükleme paritesi:** app.js'i bütün olarak `vm`'de çalıştıran
   her fixture, `reminders.js` + `reminderSurface.js`'i yükler. Bu MON2-01'de
   ileriye dönük yapılır (gövdeler taşınmadan önce de çalışır). Liste MON2-01'de.
7. **K7 — `test_modularization_boundary.js [1]` çevrilir:** "app.js 10.000+
   satır (monolit hâlâ var)" assert'i, MON2-01'de "app.js mevcut ve
   `shellBudget.maxTotalLines` altında" olarak değiştirilir. Bu, testin
   mantığını değil MON döneminin varsayımını günceller; LEDGER'a yazılır.
   `premium-fx-plan/MODULARIZATION.md` **dokunulmaz** (`[7]` v2.1/24 modül
   assert'i); 25. modül bu README §6'da kayıtlıdır.
8. **K8 — Kaynak-metin assert'leri:** Yalnız `tests/reminders/test_reminder_cross_surface_status.js:57`
   app.js'ten reminder gövdesi **adla çıkarıyor** (`extractFunction(APP_SOURCE, …)`:
   `reminderCrossSurface*` ×6 + `reminderSystemStatusCopy`). MON2-01'de
   `APP_SOURCE` yerine `app.js + reminders.js + reminderSurface.js` birleşik
   kaynağı verilir. Kalması gereken snippet'ler app.js'te kalır:
   `scheduleMoveSync(){ var payload=reminderSyncPayload(data);` (privacy:253),
   `reminderNotificationChannel({tag:opts.tag||'aeon-message'})` (notification:600),
   `window.ReminderEngineV1` referansı (boot:243), `App.reminderCrossSurfaceStatus=reminderCrossSurfaceStatus`
   (cross_surface:256). `sey-reminder-inbox-live` (integrated_ux:317) taşınırsa
   assert birleşik kaynağa alınır.
9. **K9 — Frozen sınır:** `reminderCatalog/Engine/Scheduler/Delivery.js`,
   `sync.js`, `sw.js`, `panel*`, `app/content/*` ve `docs/reminders/*`
   program/approval belgeleri değişmez. `ReminderDeliveryV1` yokken çalışan
   adaptör davranışı (`test_reminder_app_notification_boundary.js withModule:false`)
   modül içinde aynen korunur.

Devralınan sözleşme: MON `S1–S8`, `I1–I6`, `M1–M4`, `MON-K1…K8`
(`monolit-bolumlenme-plan/UYGULAMA-PROMPTLARI.md`). Burada yeniden yazılmaz.

## 4. Dalga ve kart haritası

| Dalga | Kart | Kapsam | Beklenen `app.js` |
|---|---|---|---:|
| 1 Reminder | MON2-01 | Karar, iskelet, 4 liste, fixture paritesi, kapı aracı | 13.1k |
| | MON2-02 | Sabitler + saf gövdeler + görünüm → `reminders.js`; Legacy emekli | ~11.1k |
| | MON2-03 | Yan etkili gövdeler + 126 handler gövdesi → `reminderSurface.js` | ~10.1k |
| | MON2-04 | Dalga 1 kapanışı: tam regression + doküman senkronu | ~10.1k |
| 2 Görünüm | MON2-05 | 60 kart `*HTML()` builder → `render.js` | ~9.2k |
| 3 Alan | MON2-06 | quran / zikr / profile / psych gövdeleri → ilgili registry (**kapatıldı: 7.797**) | ~8.3k |
| | MON2-07 | aeon / location / header / weather / photo / habit gövdeleri → `appSurface.js` | ~7.8k |
| Kapanış | MON2-08 | Seri kapanış belgesi, bütçe dondurma | ~7.8k |

## 5. Kartlar

Her kartın ortak biçimi: **Amaç · Kapsam · Adımlar · Yasak · Kapı · Kabul**.
Kapı = §7 ortak komut + kartta yazan ek fixture'lar; tamamı exit 0 olmadan
commit yok. Kabul = bütçe satırı + kartın kendi ölçümü; LEDGER'a önce/sonra
`shell-inventory` çıktısı yapıştırılır.

### MON2-01 · Karar, iskelet ve fixture hazırlığı

**Amaç:** Gövde taşımadan önce her zemini bir kez hazırlamak, böylece 02–03
yalnız taşıma yapsın.

**Kapsam / Adımlar (tek commit):**
1. `app/core/reminderSurface.js` iskeleti: IIFE, `window.SeymaReminderSurface`,
   `registerReminderSurface(deps)` (MON-50 `registerAppSurface` birebir; zorunlu
   dep listesi MON2-03'te), `call/dep/liveData/liveUi`. Yüklemede DOM/ağ/timer yok.
2. Dört liste: `index.html` (`reminders.js` sonrası, `?v=20260914a`),
   `.claude/skills/run-seyma/driver.mjs` FILES, `zikr-harness.mjs` FILES,
   `tests/app/test_state_rebind_boundary.js` boot listesi. `reminders.js` ve
   `app.js` cache-bust bump. (`.claude/skills` yazımı sandbox'ta izin isteyebilir.)
3. app.js: `var SEYMA_REMINDER_SURFACE=window.SeymaReminderSurface||null;` +
   boş `registerReminderSurface({...})` çağrısı (fail-closed `throw`), MON-50
   `registerAppSurface` bloğunun hemen ardında.
4. K6 fixture paritesi — bu 11 dosyanın yükleme listesine `app/core/reminders.js`
   ve `app/core/reminderSurface.js` eklenir (`appSurface.js`'in hemen önü):
   `tests/reminders/test_reminder_app_notification_boundary.js`,
   `test_reminder_app_privacy.js`, `test_reminder_boot.js`,
   `test_reminder_cross_surface_schema.js`, `test_reminder_end_to_end_lineage.js`,
   `test_reminder_integrated_privacy.js`, `tests/app/test_app_surface_boot_boundary.js`,
   `test_app_surface_domain_boundary.js`, `test_app_surface_lifecycle_boundary.js`,
   `test_app_surface_overlay_boundary.js`, `test_premium_fx_utils.js`.
   Zaten yükleyenler (`test_reminder_app_acceptance.js`, `test_state_rebind_boundary.js`,
   `test_zikr_manual_entry.js`, `verify-state-migration-boundary.mjs`) yalnız
   `reminderSurface.js` alır. Keşif komutu (listeyi yeniden doğrula):
   ```bash
   for f in tests/reminders/*.js tests/app/*.js .claude/skills/run-seyma/*.mjs; do
     grep -qE 'runIn(New)?Context\(\s*(APP_SOURCE|appSource)\b|filename:\s*.app\.js.' "$f" || continue
     printf "%-64s rem:%s surf:%s\n" "$f" "$(grep -c 'app/core/reminders\.js' "$f")" "$(grep -c 'reminderSurface\.js' "$f")"
   done
   ```
5. K8: `test_reminder_cross_surface_status.js` `APP_SOURCE` → birleşik kaynak
   (`[app.js, app/core/reminders.js, app/core/reminderSurface.js].map(read).join('\n')`)
   yalnız `extractFunction` çağrısında; `includes` assert'leri app.js'te kalır.
6. K7: `tests/app/test_modularization_boundary.js [1]` → `lines.length > 0 &&
   lines.length <= shellBudget.maxTotalLines` (state JSON'dan okur).
7. `MON2-STATE.json` `shellBudget` = 13.200 / 22 / 3.300 / 1.150; `tools/shell-inventory.mjs`
   zaten repoda (bu planla geldi) — `--gate` PASS.
8. CURRENT-STATE + LEDGER seq 1.

**Yasak:** Gövde taşıma yok; `reminders.js` içeriği değişmez; MODULARIZATION.md
değişmez.

**Kapı:** §7 ortak + `node tests/reminders/run-reminder-smoke.mjs` +
`for f in tests/app/test_app_surface_*.js; do node "$f"; done`.

**Kabul:** `shell-inventory --gate` PASS; `grep -c reminderSurface.js` dört
listede ve 15 fixture'da ≥1; driver/zikr harness PASS; app.js delta ≤ +10 satır.

### MON2-02 · Sabitler, saf gövdeler ve görünüm → `reminders.js`

**Amaç:** Reminder alanının (a) saf ve (b) B1 salt-okur gövdelerini ve
sabitlerini tek registry'ye taşımak; Legacy'yi emekli etmek. Beklenen delta
≈ −2.0k.

**Kapsam (app.js'ten çıkacak gruplar; sayı = fn/kod satırı, 2026-09-14):**
- `var REMINDER_*` sabitleri (120/288) → modül üstü `const` blokları; app.js'te
  yalnız `registerReminders` bag'inin verdiği `policyDefaults/channels/
  quietBehaviors/capacityModes/priorityRank` referansları kalır — bunlar da
  modüle taşınıp bag'den **kaldırılır** (bag küçülür).
- `reminderPolicy*` (19/122) — 9 Legacy + 9 çift shim → tek shim/yok.
- `reminderEngine*`, `reminderEngineAdapter*` (16/94), `reminderDelivery*`
  adaptörleri (28/183; `ReminderDeliveryV1` yok-fallback'i korunur, K9),
  `reminderScheduler*` saf üyeleri (3/13).
- `reminderCatchup*` (9/76), `reminderDailyFlow*` + `reminderEvening*` (23/170),
  `reminderLocal*` + `mergeReminderLocalState` + `reminderMerge*` (11/88),
  `normalizeReminder*` (11/111), `migrateReminderState` (1/33),
  `mergePersistedReminderState` (1/8; `data` yazmıyorsa — doğrula, yazıyorsa MON2-03).
- `reminderPersonalization*` (18/72), `reminderCrossSurface*` (6/44),
  `reminderPrivacy*` (4/31), `reminderDigest*` (5/30), `reminderSchema*`,
  `reminderStateContract`, `reminderSyncPayload`, `reminderExport*`,
  `reminderRetention*` (≈8/40).
- Kaynak adaptörleri: `reminderPrayer*` (10/74), `reminderZikr*` (15/92),
  `reminderTherapy*` (15/57), `reminderSaygi*` (11/47), `reminderSpecial*` (9/39),
  `reminderMedication*` saf üyeleri (13/40), `reminderCare*` (9/44),
  `reminderNative*` saf üyeleri (6/33).
- Etiketler: `reminderCategory*`, `reminderChannel*`, `reminderWindow*`,
  `reminderCapacity*`, `reminderCopy`, `reminderDefinitions`, `reminderQuiet*`,
  `reminderProfile*`, `reminderDeepLinkTarget(s)`, `reminderSnoozePlan` (≈20/80).
- Görünüm: 19 `reminder*HTML` (204) + `reminderCenterHistoryEntries/StatusLabel`
  + `reminderSystemStatus*` (7/86) → `registerReminderView` **sections bag'i
  kaldırılır**; bölümler modül içinden üretilir. `App.reminderInboxCardHTML`
  alias'ı kalır.
- `reminder*Legacy` ×22 silinir; `previewSafeCopy:reminderPreviewSafeCopyLegacy`
  (app.js:1505) modül üyesine bağlanır.

**Dış bağımlılık (bag'e eklenecek; ölçüldü):** `esc`, `icon`, `todayStr`,
`activeDate`, `minToHHMM`, `hhmmToMin`, `prayerSettings`, `prayerMethod`,
`prayerLocation`, `prayerLocationHash`, `syncConfigured`, `normalizeSyncReceipt`,
`featuresLive`, `saygiPersonById`, `saygiCurrentPerson`, `saygiArticleReadableFor`,
`saygiPeople`, `caffeineTargetBed`, `caffeineCutoffTime`, `PRAYER_NAMES`,
`ZIKR_V2_VISIBLE`, `EVENT_LOG_SCHEMA_VERSION`, `KEY`; state için `data`/`ui`
B1 getter'ları. `render/save/toast/document/localStorage/Notification` bu
kartta **yok** — onlar MON2-03.

**Adımlar:** (1) `--domain reminder` "yalnız-iç" listesini al → shim'siz;
kalanlar 1 satır shim. (2) Grup grup taşı; her grupta `node --check` +
`run-reminder-smoke`. (3) Legacy sil, çift shim'leri tek forma indir.
(4) `reminders.js` cache-bust; app.js cache-bust. (5) Bütçeyi ölçülen+%2'ye çek.

**Yasak:** `data`/`ui` yazan, `save()`/`render()` çağıran, `document/
localStorage/Notification/navigator/setTimeout` kullanan gövde bu kartta
taşınmaz (MON2-03). Frozen dört modül, K9 dosyaları değişmez.

**Kapı:** §7 ortak + `run-reminder-smoke` + `tests/app/test_app_surface_*.js`.

**Kabul:** `--gate` PASS (≤11.300 / 0 Legacy / ≤1.500 reminder gövde);
`grep -c 'Legacy' app.js` = 0; `test_reminder_ui_boundary.js` regex'i
(`function reminderCenterOverlayHTML(){…SEYMA_REMINDERS.reminderCenterOverlayHTML`)
hâlâ eşleşir; driver `--dump bugun` ve `--dump ayarlar` çıktısı önce/sonra bayt-eşit.

### MON2-03 · Yan etkili gövdeler ve handler gövdeleri → `reminderSurface.js`

**Amaç:** (c) mutasyon ve (d) DOM/timer/storage sınıfı reminder gövdelerini ve
126 `App.*reminder*` handler gövdesini MON-50 deseniyle taşımak. Beklenen
delta ≈ −1.0k.

**Kapsam:**
- (d) 40 fn / 338 satır: `reminderPermission{State,Snapshot,StorageRead,
  StorageWrite,Request}`, `reminderPreviewNotification`, `reminderNativeDisplay`,
  `reminderLifecycle{DefaultContext,WindowDue,DraftActive,ReplaceTarget,UpdateLive}`,
  `reminderSchedulerFallbackCreate`, `reminderDeliveryStorage{Read,Write}`,
  `reminderDeliveryClear`, `reminderActionStorage{Read,Write}`,
  `reminder{Lock,Unlock}BodyScroll`, `reminderActiveElementId`, `reminderRestoreFocus`,
  `reminderMedicationClearHistory`, `reminderRemoveLocalKey`, `reminderSpecialDayLookup`,
  `reminderSystemOffline`, kaynak `*WindowDue/*Occurrence` üyeleri (zikr/therapy/saygi/care/evening).
- (b) 35 fn / 447 satır: `reminderLifecycle{BuildCandidates,Evaluate,Target,
  TargetedUpdate,RenderPolicy,OverlayOpen}`, `reminderEvaluateReminders`,
  `reminderInboxBuildItems`, `reminderSurface{Root,State,Table}`,
  `reminderActionCommit`, `reminderRetentionSummary`, `reminderSystem{Status,
  PrayerStatus,SyncStatus}`, `reminderDigestBuild`, `appendReminderEvent`,
  `persistReminderEvent`, `reminderNotificationChannel`, `stepReminder`.
- (c) 5 fn / 42 satır: `reminderCurrentRoot`, `updateReminderPolicy`,
  `reminderSetEnabled`, `reminderCloseForTarget`, `mergePersistedReminderState`
  (02'de taşınmadıysa).
- 126 `App.*` handler: ≥2 satır gövdesi olanlar (≈60 fn / 350 satır) →
  `App.x=function(){ return SEYMA_REMINDER_SURFACE.x.apply(null,arguments); }`;
  1 satırlık alias/`return fn()` biçimleri **olduğu gibi kalır**.
- Kalan app.js sahipliği (taşınmaz): `reminderLifecycleTick` timer kaydı
  (app.js:~13109), `reconcileReminderStorageEvent` listener kaydı (~13116),
  `scheduleMoveSync`, 9 mutable `reminder*` değişkeni (K3), `registerReminders/
  registerReminderView/registerReminderSurface` bag'leri, `App.reminderX=…` alias'ları.

**Dep bag (`registerReminderSurface` zorunlu listesi):** `data`, `ui`, `app`,
`save`, `saveLocal`, `render`, `toast`, `todayStr`, `activeDate`, `editing`,
`download`, `appendEvent`, `ensureEventLog`, `zikrUnlockBodyScroll`,
`quranUnlockBodyScroll`, `document`, `localStorage`, `notification`
(`function(){ return typeof Notification!=='undefined'?Notification:null; }`),
`navigator`, `setTimeout`, `clearTimeout`, `now`, ve K3 get/set çiftleri:
`permissionTransient/setPermissionTransient`, `permissionInFlight/setPermissionInFlight`,
`permissionEverGranted/set…`, `permissionGrantObserved/set…`, `lifecycleState/set…`,
`schedulerInstance/set…`, `lifecycleTimerId/set…`, `migrationStatus/set…`,
`bodyLock/setBodyLock`. Modül `SeyHaptics/SeyAudio/SeyFx`'i `window` üzerinden
guard'lı okur (MON-K5).

**Adımlar:** (1) Bag'i app.js'te doldur, `throw` fail-closed. (2) (d)→(b)→(c)→
handler sırasıyla taşı; her adımda `run-reminder-smoke` + `test_modal_focus_containment`
+ `test_reminder_ui_boundary`. (3) `reminderSurface.js` cache-bust. (4) Bütçe.

**Yasak:** Timer/listener **kaydı** app.js'ten çıkmaz; `Notification.requestPermission`
çağrısı taşınır ama kim tetikler (`App.requestReminderPermission`) değişmez;
`data=` rebind yok; modal Tab/Shift+Tab/Escape sözleşmesi değişmez.

**Kapı:** §7 ortak + `run-reminder-smoke` + `test_app_surface_*` +
`tests/app/test_modal_focus_containment.js` + `tests/app/test_aeon_message_expand.js`.

**Kabul:** `--gate` PASS (≤10.300 / ≤450 reminder gövde); `App.*` fonksiyon
sayısı 554'te sabit (`grep -cE '^App\.[A-Za-z0-9_]+\s*=\s*function' app.js`);
inline onclick sayısı 391'de sabit; `withModule:false` senaryosu PASS.

### MON2-04 · Dalga 1 kapanışı

**Amaç:** Tam regression + doküman senkronu; runtime delta yok.

**Adımlar:** §7 tam set + `tests/panel/*.js` + `tests/quran/*.js` +
`for f in tests/panel-v2/test_panel_v2_*.js`. CLAUDE.md/AGENTS.md "Repo layout"
`reminders.js` satırı ("keeps 22 reminder*Legacy…" cümlesi silinir,
`reminderSurface.js` satırı eklenir), `docs/GELISTIRME-PLANI.md` changelog,
`tests/README.md` envanteri, bu README §1 tablosu "Dalga 1 sonrası" kolonuyla.
`deliverables/MON2-DALGA1-KAPANIS.md`: önce/sonra envanter, taşınan fonksiyon
sayısı, shim sayısı, silinen Legacy listesi, fixture değişiklik listesi.

**Kabul:** Tam set PASS; `--gate` PASS; kod dosyası diff'i yalnız yorum/doküman.

### MON2-05 · Kart `*HTML()` builder'ları → `render.js`

**Amaç:** `SeymaRender` sözleşmesini ("her tab/shell/modal builder") kart
seviyesine indirmek. 60 fn / 1.129 satır; beklenen delta ≈ −0.9k.

**Kapsam:** `psychHTML`(64) `psychSosHTML` `psychOptions` `psychBuildQA`;
`vacationCardHTML`(59); `heroTargetsHTML`(54) `heroPremiumStatsHTML`(32)
`heroStatsHTML` `heroScienceLine`; `healthSetupCardHTML`(49); `hubTilesHTML`(47);
`dailyPhotoCardHTML`(45); `habitsCardHTML`(39) `habitRowHTML` `habitProgress`;
`headerSceneHTML`(35) `appHeaderMeta`(61) `headerSyncSubtitle`;
`quranDetailBodyHTML`(34) `quranJourneyHubCardHTML`(31) `quranVideoCardHTML`(27);
`authGateHTML`(31) `locationGateHTML`; `reportHTML`(25); `moodCardHTML`;
`notifCardHTML`; `energyStressBlock`; `lunaDayLine`; `cycleStats` + kalan
`*HTML` (>2 satır) — tam liste: `grep -nE '^function [A-Za-z0-9_]+HTML\(' app.js`.

**Kural:** Builder yalnız `data/ui` okur ve string döndürür; `document`
okuyan builder (`appHeaderMeta` gibi) önce okuma kısmı app.js'te bir
`call('headerDomState')` dep'ine alınır. `render.js` dep bag'i genişler
(mevcut `registerRender` listesine ekle; yeni dosya yok — K5).
`skySceneNow`/`mountSkyCanvas` (canvas) taşınmaz.

**Kapı:** §7 ortak + `tests/app/test_render_*_boundary.js` +
`test_today_card_preferences.js` + `test_daily_photo_history.js` +
`test_motivation_room_accessibility.js` + `tests/quran/*.js` + `run-reminder-smoke`.

**Kabul:** `--gate` PASS (≤9.400 / `*HTML` builder ≤150); driver `--dump`
`bugun/rapor/ayarlar/hub` önce/sonra bayt-eşit; `test_fx2_ambience.js` PASS
(`amb-wx-` yorum tuzağına dikkat).

### MON2-06 · Alan gövdeleri: quran / zikr / profile / psych — **KAPATILDI (2026-09-15)**

**Sonuç:** `app.js` 8.969 → **7.797** (−1.172); bütçe 8.500'ü 703 satır marjla geçti.
Taşınan **146 gövde**: quran 52 → `app/core/quran.js` (363→876), zikr 57 →
`app/core/zikir.js` (1.044→1.724), profile 17 + psych 20 →
`app/core/profile.js` (879→1.447). MON-50 appSurface deseni (sloppy IIFE +
`with(SCOPE)` + canlı property-getter); app.js'te 124 1-liner shim + dep bag'leri.
**Kök düzeltme:** 37 yan-etkili gövde çıplak global kullanıyordu
(`document`/`setTimeout`/`window.SeySync`) → dep-bag takma adlarına çevrildi
(`doc`/`defer`/`sync`); saflık fixture'ları zayıflatılmadan PASS. Detay ve
sapmalar: `.anti-amnesia/LEDGER.md` seq 7.

**Amaç:** Registry'si olan alanların app.js'te kalan (a)/(b) gövdelerini ve
handler gövdelerini kendi registry'sine taşımak. quran 107 fn/750 satır
(65 yalnız-iç), zikr ≈ 250, profile ≈ 217, psych ≈ 175; beklenen delta ≈ −0.9k.

**Kapsam:** `--domain quran|zikr|profile|psych` "yalnız-iç" listeleri shim'siz;
dış-referanslılar 1 satır shim; `App.*` gövdeleri (`App.profileAnswer`(97),
`App.zikrTap`(48), `App.zikrUndo`(37), `App.refreshQuranUpdates`(35),
`App.confirmZikrResetToday`, `App.profileItemKeydown`, `App.profilePrevious`…)
K4 deseniyle ilgili registry'ye (`SeymaQuran/SeymaZikr/SeymaProfile`);
psych'in registry'si yoksa `SeymaHealth`'e (monolit haritası: psych = sağlık
alt alanı — `docs/monolit-bolumlenme-haritasi.md` ile doğrula, aksi halde dur).
`quranJourneySubmitProceed`/`App.quranJourneySubmit` (ağ: pull+apply) ve
`zikrSyncWakeLock` **app.js'te kalır**.

**Kapı:** §7 ortak + `tests/quran/*.js` + `tests/app/test_zikir_*.js` +
`test_zikr_manual_entry.js` + profile fixture'ları (`rg --files tests | grep -i profile`
ile doğrula) + zikr-harness.

**Kabul:** `--gate` PASS (≤8.500); `App.*` sayısı 554; zikr-harness dump'ları
bayt-eşit.

### MON2-07 · Yan etkili alan gövdeleri → `appSurface.js`

**Amaç:** aeon (345), location (208), header/weather/photo/habit/hero
kalanları, `mergeInbox`, `lunaContext`, `psychScore`, `streamAsk` sarmalayıcıları —
ağ/GPS/notification **çağrısı** app.js'te, hazırlık/parse/apply gövdesi
`SeymaAppSurface`'e. Beklenen delta ≈ −0.5k.

**Kural:** `fetch(`, `navigator.geolocation`, `Notification`, `EventSource/
ReadableStream` içeren satır app.js'te kalır; gövde "request builder" +
"response applier" olarak ikiye bölünür ve iki saf parça taşınır
(`fetchWeather` → `weatherRequest(data)` + `applyWeather(data,json)`).
`showNativeAeonNotification` içindeki `reminderNotificationChannel(...)`
snippet'i app.js'te kalır (K8). `sha256` WebCrypto sarmalayıcısı olduğu için
kalır; `lunaContext`/`psychScore` saf → taşınır.

**Kapı:** §7 ortak + `test_aeon_message_expand.js` + `test_messaging_boundary.js`
+ `test_daily_photo_history.js` + `run-reminder-smoke` + notification boundary.

**Kabul:** `--gate` PASS (≤8.000); `test_reminder_app_notification_boundary.js`
kaynak-metin assert'leri PASS.

### MON2-08 · Seri kapanışı

Tam set + panel/panel-v2 + quran + reminder smoke. `deliverables/MON2-SERI-KAPANIS.md`:
son envanter, 25 modül API/owner tablosu (24 + `reminderSurface`; büyüyen
`reminders/render/appSurface`), shim envanteri (kaç 1-satır shim kaldı ve neden),
bütçe dondurma (`shellBudget` son değerler), açık kalanlar. `MON2-STATE.json`
`status=completed`, `nextPrompt=null`, `releaseApproval=not_approved`.
CLAUDE.md/AGENTS.md modularization bullet'ı "MON2 complete" ile güncellenir.

## 6. Modül haritası (MON2 sonrası)

| Dosya | Sahip olduğu | Yeni? |
|---|---|---|
| `app/core/reminders.js` | reminder sabitleri, policy/engine/delivery adaptörleri, catchup/dailyFlow/local/normalize/migrate, kaynak adaptörleri, etiketler, Center/Inbox/Digest görünümü | büyür (~2.3k) |
| `app/core/reminderSurface.js` | permission/native/lifecycle/action/inbox yan etkili gövdeler + 126 `App.*reminder*` handler gövdesi | **evet** (~1.2k) |
| `app/core/render.js` | + 60 kart builder | büyür |
| `app/core/quran.js` · `zikir.js` · `profile.js` · `health.js` | + alan gövdeleri ve handler gövdeleri | büyür |
| `app/core/appSurface.js` | + aeon/location/header/weather/photo saf parçalar | büyür |
| `app.js` | `data/ui/dark`, 9 rebind, B1 getter, register bag'leri, timer/listener kaydı, `window.App` + 554 `App.x=` shim/alias, ağ/GPS/notification çağrı satırları, sync callback'leri | ~7.8k |

## 7. Ortak kapı komutu

```bash
node --check app.js && node --check sync.js && for f in app/core/*.js; do node --check "$f" || exit 1; done
node tools/shell-inventory.mjs --gate
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_modularization_boundary.js
node tests/app/test_state_rebind_boundary.js
node tests/app/test_faz_minus11_boundary.js
node tests/app/test_faz10_sync.js
node tests/app/test_syncGlue_save_boundary.js
for f in tests/app/test_premium_*.js tests/app/test_fx2_*.js; do node "$f" || exit 1; done
node tests/reminders/run-reminder-smoke.mjs
```

Dalga kapanışlarında ek: `tests/panel/*.js`, `tests/quran/*.js`,
`tests/panel-v2/test_panel_v2_*.js`, `.claude/skills/run-seyma/verify-state-*.mjs`.
Dosya yoksa komut uydurulmaz (`rg --files` ile doğrula).

## 8. Oturum protokolü

1. `MON2-STATE.json` → `activePrompt`; `.anti-amnesia/CURRENT-STATE.md` ve
   `LEDGER.md` son satırı. `blockedPrompt` doluysa dur.
2. `node tools/shell-inventory.mjs` çıktısını LEDGER'a "önce" olarak yapıştır.
3. Yalnız aktif kartı uygula; kapılar geçmeden commit yok. Commit = kod +
   cache-bust + state + CURRENT-STATE + LEDGER (aynı commit).
4. Kapanışta "sonra" envanteri, bütçe daraltma, `nextPrompt`.
5. Push/merge/tag/deploy/browser/gerçek veri/`seyma-data` yok (CLAUDE.md
   DATA SAFETY). Yerel PASS cihaz kabulü değildir.

## 9. Dosya ağacı

| Yol | Rol |
|---|---|
| `README.md` | Bu belge: teşhis, kararlar, 8 kart, kapılar |
| `MON2-STATE.json` | Makine-okur durum + `shellBudget` (kapı aracı okur) |
| `.anti-amnesia/CURRENT-STATE.md` | İnsan-okur durum |
| `.anti-amnesia/LEDGER.md` | Yalnız-eklemeli kayıt (seq · kart · önce/sonra · kapı · sapma) |
| `deliverables/` | MON2-04 ve MON2-08 kapanış belgeleri |
| `DEVIR-MON2-02.md` | Soğuk-başlangıç brief'i (MON2-02'den devam); her kart kapanışında bir sonraki karta güncellenir |
| `tools/shell-inventory.mjs` (repo kökü) | Ölçüm/kapı aracı; ağsız, salt-okur |
