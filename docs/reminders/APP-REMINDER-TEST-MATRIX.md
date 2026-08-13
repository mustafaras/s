# APP-REMINDER-UX — Test ve Acceptance Matrix

Bu belge, promptların hangi evidence gate'lerini geçmesi gerektiğini tanımlar. Test adı bir promptta geçiyorsa o prompt testin kapsam sahibidir; test sonucu ledger'a kısa receipt olarak yazılır.

## Kanıt politikası

- Her reminder fixture sentetik, ağsız ve token'sız çalışır.
- Headless pass, kullanıcı cihazı pass veya production deploy kanıtı değildir.
- Bilinen tarihsel test sayıları güncel kanıt sayılmaz; her prompt kendi testini yeniden çalıştırır.
- Test başarısızsa prompt blocked olur. Testi zayıflatmak, assertion silmek veya failure'ı known diye gizlemek kabul edilmez.
- Test fixture'ları gerçek localStorage, gerçek data, gerçek notification body veya gerçek sync endpoint kullanmaz.

## Test katmanları

| Katman | Amaç | Kanıt komutu / araç |
|---|---|---|
| T0 | Plan ve contract | contract / catalog fixture |
| T1 | Saf policy / engine | scheduler, policy, timezone, budget fixture |
| T2 | State / migration | reminder migration, B1/B2 sınır fixture'ları |
| T3 | App render / interaction | run-seyma driver, zikr harness, reminder VM |
| T4 | Native / SW mock | Notification, permission, click, SW fixture |
| T5 | Privacy / sync / panel | sanitize, redaction, no-write fixture |
| T6 | Full regression | root tests, Panel-v2 tests, syntax |
| T7 | Device acceptance | Kullanıcının clean profile üzerinde kendi cihazı |

## Fixture sözleşmesi

Her reminder fixture şu mock boundary'leri kullanmalıdır:

- now: test tarafından enjekte edilen saat; gerçek wall clock kullanılmaz.
- timezone: default Europe/Istanbul; test gerektiğinde açıkça değiştirir.
- localStorage: memory-only; gerçek browser profile kullanılmaz.
- Notification: call recorder; body / options assertion yapar, cihaz bildirimi göstermez.
- fetch: never-settling veya explicit mock response; gerçek network yok.
- DOM: yalnız testin ihtiyacı olan markup; gerçek app browser açılmaz.
- data: minimal synthetic state; private user payload içermez.
- logger: whitelist reason; ham error ve kişisel metin yazmaz.

## Gate matrisi

| Gate | Test | Kapsam | PASS şartı | İlk prompt |
|---|---|---|---|---|
| G0-A | test_reminder_contract.js | Tanım ve helper şekli | Zorunlu alanlar, clone ve unknown preservation | REM-02 |
| G0-B | test_reminder_catalog.js | Catalog id, copy ve deep-link | Tüm kayıtlar valid ve private copy safe | REM-03 |
| G0-C | REM-00 audit receipt | Source / plan capability | Kodla plan uyumu kayıtlı | REM-00 |
| G1-A | test_reminder_migration.js | Minimal, malformed, rich, second boot | Additive deep parity | REM-04 |
| G1-B | test_reminder_privacy.js | Local state ve hassas alanlar | Native / remote / log leakage yok | REM-04 |
| G1-C | test_reminder_center.js | Settings shell | Permission istemeden render | REM-05 |
| G1-D | test_reminder_profiles.js | Preset / toggles | User override kaybolmuyor | REM-06 |
| G1-E | test_reminder_permission.js | Permission explanation | State machine ve no-loop | REM-06 / REM-22 |
| G1-F | test_reminder_policy.js | Priority / cap / mode | Saf policy deterministic | REM-07 |
| G1-G | test_reminder_quiet_hours.js | Quiet / daily cap | Boundary ve exception doğru | REM-07 |
| G2-A | test_reminder_scheduler.js | Occurrence | ID, trigger, date deterministic | REM-08 |
| G2-B | test_reminder_timezones.js | Midnight / DST / Hicri | Europe/Istanbul ve offset PASS | REM-08 |
| G2-C | test_reminder_delivery.js | Dedupe / retention | Same occurrence ve 30-day cap PASS | REM-09 |
| G2-D | test_reminder_lifecycle.js | Boot / focus / page / online | Duplicate yok, network yok | REM-10 |
| G2-E | test_reminder_catchup.js | Reopen / grouping | Tek catch-up, replay yok | REM-11 |
| G2-F | test_reminder_budget.js | Coalescing | P1/P2/P3 ve max 3 doğru | REM-07 / REM-11 |
| G3-A | test_reminder_inbox.js | App card | Empty, single, grouped, suppressed render | REM-12 |
| G3-B | test_reminder_actions.js | Snooze / mute / disable | State ve delivery doğru | REM-13 |
| G3-C | test_reminder_deeplinks.js | In-app / native click | Allowlisted target | REM-13 / REM-23 |
| G4-A | test_reminder_prayer.js | Prayer integration | Vakit, stale, method, city, privacy | REM-14 |
| G4-B | test_reminder_zikr.js | Zikr integration | Journey, reflection, feature flag | REM-15 |
| G4-C | test_reminder_therapy.js | Therapy safety | Opt-in, low-capacity, negative privacy | REM-16 |
| G4-D | test_reminder_saygi.js | Saygı / reading | Article loading, read gate, race | REM-17 |
| G4-E | test_reminder_evening.js | Journal / reading / zikr coalescing | One evening primary | REM-18 |
| G5-A | test_reminder_care.js | Water / sleep / caffeine / movement | Existing nudge duplicate yok | REM-19 |
| G5-B | test_reminder_medication.js | User-entered health schedule | Dose / treatment advice yok | REM-20 |
| G5-C | test_reminder_special_days.js | Hicri / special days | Opt-in / offset | REM-21 |
| G6-A | test_reminder_native.js | Notification adapter | Permission / cap / safe body | REM-22 / REM-23 |
| G6-B | test_reminder_sw.js | SW click | Target allowlist / no schedule claim | REM-24 |
| G7-A | test_reminder_sync_privacy.js | Sanitize / merge | Zero real network, no private remote field | REM-25 |
| G7-B | test_reminder_panel_projection.js | Panel redaction | No private reminder routine | REM-26 |
| G8-A | test_reminder_accessibility.js | Semantic / focus / target | Keyboard / AT contract | REM-27 |
| G8-B | test_reminder_copy.js | Turkish language / shame / privacy | Negative copy checks | REM-27 |
| G8-C | test_reminder_contrast.js | Light / dark WCAG | Normal >=4.5:1, large >=3:1 | REM-27 |
| G8-D | Full root tests | Existing app / sync / quran | No unrelated regression | REM-28 |
| G8-E | Full Panel-v2 tests | Panel-v2 regression | All current fixtures pass | REM-28 |
| G8-F | Release receipt | Source / test / deployment separation | User device and live claims separated | REM-29 |
| G9-A | test_reminder_metrics.js | Başarı ölçütleri | Ölçüm hassas profil / telemetry üretmiyor | REM-30 |
| G9-B | test_reminder_daily_flows.js | Sabah / gün içi / akşam / low-capacity | Akışlar coalesce ve duplicate üretmiyor | REM-31 |
| G9-C | test_reminder_center_advanced.js | Preview, history, override, reset | Gerçek notification / private body yok | REM-32 |
| G9-D | test_reminder_system_status.js | Stale, offline, permission, recovery | Yanlış capability vaadi ve replay yok | REM-33 |
| G9-E | test_reminder_personalization.js | Opt-in adaptation | Hassas çıkarım ve silent mutation yok | REM-34 |
| G9-F | test_reminder_digest.js | Haftalık sakin özet | Local-only, optional, score-free | REM-35 |
| G9-G | test_reminder_copy.js | Canonical Turkish lexicon | Shame / clinical authority / private leakage yok | REM-36 |
| G9-H | test_reminder_visual.js + test_reminder_performance.js | Premium responsive / render cost | İki tema, <=460px, reduced motion, no-op render | REM-37 |
| G9-I | test_reminder_concurrency.js | Multi-tab / offline / anti-clobber | Duplicate ve full-replace data loss yok | REM-38 |
| G9-J | test_reminder_retention.js | Retention / export / clear / reset | Private residue ve replay yok | REM-39 |
| G10-A | verify-reminder-context.mjs | Plan / prompt / ledger / state parity | 44 ID, link, pointer ve approval default PASS | REM-40 |
| G10-B | Release candidate receipt | Full evidence freeze | `not_approved`, canlı işlem yok | REM-41 |
| G10-C | Approval scope receipt | Exact user approval | User evidence + exact scope kaydedilmiş | REM-42 |
| G11-A | verify-reminder-context.mjs --release-approved | Approved release precondition | Yalnız user-approved scope açılır | REM-43 |
| G11-B | Remote / CI / Pages / live receipt | Deployment evidence | Kaynak, test, deploy ve device ayrı | REM-43 |
| G12-A | test_reminder_app_boot.js | App script order / global adapter | Constants, catalog, engine ve sync sırası deterministic | REM-44 |
| G12-B | test_reminder_app_state.js | State ownership / migration | Additive migration, unknown preservation, local delivery ayrımı | REM-45 |
| G12-C | test_reminder_app_engine.js | Clock / timezone / occurrence adapter | Injected clock, timezone, DST ve stale input deterministic | REM-46 |
| G12-D | test_reminder_app_event_lifecycle.js | Save / commit / event log | One action, one safe event, no raw body, idempotent retry | REM-47 |
| G12-E | test_reminder_app_navigation.js | Center / overlay / deep-link | Focus, back, draft ve target contract PASS | REM-48 |
| G12-F | test_reminder_app_render.js | Render lifecycle | Empty / stale / pending / error states; unchanged no-op render | REM-49 |
| G12-G | test_reminder_app_lifecycle.js | Foreground scheduler integration | visibility, focus, pageshow, online ve timer duplicate üretmiyor | REM-50 |
| G12-H | test_reminder_app_surface_conformance.js | Ritual / care / reading handlers | Her target gerçek handler’a bağlı; unavailable state dürüst | REM-51 |
| G12-I | test_reminder_app_native_boundary.js | Permission / native / ÆON separation | Private copy, permission ve social channel isolation | REM-52 |
| G12-J | test_reminder_app_privacy.js | Local / sync / error privacy | Token, note, therapy, medication ve raw body leak yok | REM-53 |
| G12-K | test_reminder_app_acceptance.js | App runtime final gate | App syntax, VM, migration, a11y, privacy ve cache-bust PASS | REM-54 |
| G13-A | test_reminder_panel_source.js | Projection / legacy selection | Latest, receipt, projection, legacy ve broken source status’ları ayrık | REM-55 |
| G13-B | test_reminder_panel_manifest.js | Coverage classification | Full / summary / redacted / unmapped fields fail-closed | REM-56 |
| G13-C | test_reminder_panel_redaction.js | Redaction / no-op | Sensitive paths never reach card, DOM, export or error | REM-57 |
| G13-D | test_reminder_panel_transport.js | ETag / 304 / draft safety | Conditional read, unchanged snapshot, draft and focus preservation | REM-58 |
| G13-E | test_reminder_panel_partial.js | Partial / stale / failure | Healthy sections survive unrelated fetch failure | REM-59 |
| G13-F | test_reminder_panel_status.js | Provenance / operational health | Source, freshness, coverage, privacy and capability separate | REM-60 |
| G13-G | test_reminder_panel_card.js | Card / explicit no-op | Safe aggregate or intentional no-op; empty / stale / error safe | REM-61 |
| G13-H | test_reminder_panel_timeline.js | Event detail / lifecycle | Safe event summaries, filters, drawer and date views deterministic | REM-62 |
| G13-I | test_reminder_panel_write_boundary.js | Observer action isolation | Reminder preference / delivery writes impossible from panel | REM-63 |
| G13-J | test_reminder_panel_privacy.js | Panel negative privacy / secret scan | Therapy, medication, mood, prayer, journal, GPS, token leaks absent | REM-64 |
| G13-K | test_reminder_panel_a11y.js + test_panel_p5_responsive_a11y.js | Responsive / a11y / performance | Current panel themes, focus, motion and unchanged render PASS | REM-65 |
| G13-L | test_reminder_panel_fixture_architecture.js | Current panel / Panel-v2 separation | Root panel and Panel-v2 suites are distinct, deterministic and no-network | REM-66 |
| G14-A | test_reminder_lineage.js | App to panel lineage | Synthetic action survives each safe boundary with receipt IDs | REM-67 |
| G14-B | test_reminder_cross_surface_status.js | Status / failure semantics | No contradictory success; layer and blocker are explicit | REM-68 |
| G14-C | test_reminder_cross_surface_schema.js | Schema / migration compatibility | Legacy, missing, future and unknown fields fail safely | REM-69 |
| G14-D | test_reminder_integrated_privacy.js | End-to-end no-write / privacy | No browser, token, data repo or external write; negative suite PASS | REM-70 |
| G14-E | test_reminder_integrated_ux.js | App / panel UX and a11y | User and operator surfaces remain distinct and accessible | REM-71 |
| G14-F | REM-72 release packet | App / panel candidate evidence | Separate source, tests, deploy, live, device evidence; `not_approved` | REM-72 |

## Required time matrix

Her ilgili prompt sentetik olarak aşağıdaki zamanları çalıştırır:

- exact threshold minus one second;
- exact threshold;
- exact threshold plus one second;
- midnight before / after;
- quiet hours start / end;
- Europe/Istanbul ordinary day;
- daylight-saving transition fixture where runtime supports it;
- Hicri offset -2, 0, +2;
- stale prayer cache;
- method or city change;
- offline boot, online recovery;
- app reopen after one day and after seven days;
- repeated visibility / focus / pageshow;
- two tabs with same occurrence;
- clock moving backward;
- malformed or missing preference.

## Required privacy matrix

Her release öncesi şu negatif assertions bulunmalıdır:

- Native title / body therapy detail taşımıyor.
- Native title / body medication name or dose taşımıyor.
- Native title / body mood, journal, prayer completion or personal note taşımıyor.
- Delivery log raw body taşımıyor.
- sync sanitize token, secret, private reminder preference detail ve user note taşımıyor.
- Panel projection therapy, medication, schedule, occurrence id ve note taşımıyor.
- Debug output raw payload taşımıyor.
- Fixture gerçek data/latest.json veya mustafaras/seyma-data çağırmıyor.

## Required accessibility matrix

- Light theme contrast.
- Dark theme contrast.
- Normal text 4.5:1 veya üstü.
- Large text 3:1 veya üstü.
- Keyboard focus order.
- Modal escape / back.
- Screen-reader heading and button names.
- 44 CSS px hedef alanı veya mevcut repo standardı.
- Color is not the only status signal.
- Reduced motion.
- Long Turkish copy wraps without clipping at <=460px.
- Native private copy remains understandable without emoji.

## Full regression command set

Prompt REM-28 kendi ortamında gerçek final command setini current tests/README.md ile tekrar doğruladıktan sonra çalıştırır:

    node --check app.js
    node --check sync.js
    node --check sw.js
    node --check panel.js
    node --check panelCoverageManifest.js
    node .claude/skills/run-seyma/driver.mjs
    node .claude/skills/run-seyma/zikr-harness.mjs
    node .claude/skills/run-seyma/verify-state-helper-boundary.mjs
    node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
    for f in tests/reminders/test_*.js; do node "$f"; done
    for f in tests/test_*.js; do node "$f"; done
    for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done
    git diff --check

Bu komutların herhangi biri ortamda mevcut olmayan bir fixture nedeniyle çalışmıyorsa ajan bunu oluşturur veya exact blocker kaydeder; komutu sessizce atlamaz.

## Context consistency command set

Her prompt başlangıcında ve kapanışında çalıştır:

    node docs/reminders/verify-reminder-context.mjs

Bu command prompt / ledger / traceability / state / local link parity’sini ve
default approval lock’unu doğrular. `--release-approved` yalnız kullanıcıdan
exact current approval alındıktan, scope state’e kaydedildikten ve REM-43
precondition’ları sağlandıktan sonra kullanılabilir. Planlama sırasında bu
flag’i kullanmak veya state’i `approved` yapmak kontrol ihlalidir.

## Live release prohibition

Bu matrisin PASS olması canlıya alma yetkisi değildir. Kullanıcının açık,
güncel ve kapsamı belirli onayı yoksa `git push`, merge, tag, Pages deploy,
production write, canlı browser doğrulaması ve dış sistem write yapılmaz.
`mustafaras/seyma-data` için ayrıca açık veri yazma onayı gerekir. Release
receipt’te approval status, scope ve evidence yoksa sonuç `NOT_APPROVED` olarak
kalır.

## REM-01 Contract Freeze — zorunlu invariant ve test sahipliği

REM-01 kod yazmaz; aşağıdaki kayıtlar contract’ın tek sahibi ve sonraki
fixture gate’lerinin bağlayıcı acceptance yüzeyidir.

| REM-01 kapsamı | Beklenen negatif / deterministik assertion | Test sahibi / ilk prompt |
|---|---|---|
| Tek owner | Beş contract’ın alanı iki ayrı canonical state’te tanımlanamaz; unknown alanlar owner’sız kalamaz | `test_reminder_contract.js` / REM-02 |
| Canonical preference | `data.reminders.preferences` additive migrate edilir; local state korunur; remote projectionda preference subtree yoktur | `test_reminder_migration.js` / REM-04 + `test_reminder_sync_privacy.js` / REM-25 |
| Local delivery | `seyma-reminder-delivery-v1` dışında delivery kaydı yok; `data.notifications`, event log, latest ve panel delivery içermez | `test_reminder_delivery.js` / REM-09 + panel privacy / REM-26 |
| Native privacy | Notification title yalnız allowlisted `privateTitleKey`; detail body, therapy, mood, journal, prayer completion, medication, GPS ve raw note native çağrıya girmez | `test_reminder_native.js` / REM-22–23 |
| Migration | Minimal, malformed, rich, unknown-field ve second-boot fixture’larında additive deep parity; delivery log `data` migrationından import edilmez | `test_reminder_migration.js` / REM-04 |
| Sanitize / merge | Token/secret ve `data.reminders.preferences`, delivery key, occurrence schedule/id, raw body/note remote payloada çıkmaz; existing state merge’i kayıp üretmez | `test_reminder_sync_privacy.js` / REM-25 |
| Multi-tab | Aynı occurrence iki tabda tek dedupe kaydı ve tek terminal delivery üretir; preference değişikliği sessizce kaybolmaz | `test_reminder_concurrency.js` / REM-38 |
| Timezone | `localDate`, `scheduledAt`, IANA `timezone` ayrımı; Europe/Istanbul, midnight, DST, clock-backward ve Hicri offset deterministic | `test_reminder_timezones.js` / REM-08 |
| Duplicate / lifecycle | Stable occurrence ID aynı boot, reopen, visibility, pageshow, online ve retry akışında replay üretmez | `test_reminder_delivery.js` + `test_reminder_lifecycle.js` / REM-09–10 |
| Retention | Delivery log son 30 gün veya 200 occurrence ile bounded; clear/reset sonrası private residue ve raw body kalmaz | `test_reminder_retention.js` / REM-39 |
| Panel boundary | Panelde preference, schedule, occurrenceId, delivery body/status detail, therapy/medication/journal/routine görünmez; yalnız explicit safe aggregate veya no-op | `test_reminder_panel_projection.js` / REM-26 + REM-57–64 |

### REM-01 contract acceptance rules

1. Contract alanı eklenmeden önce owner, storage, retention ve privacy class
   tablosuna eklenir; tablo dışı alan fixture’da fail eder.
2. `ReminderDefinition` ve policy katalogları user payload taşımaz.
3. `ReminderPreference` canonical app state’tir; remote sanitize sınırı
   uygulanmadan cihazlar arası sync varsayılan olarak kapalıdır.
4. `ReminderOccurrence` ve `SuppressionContext` derived/ephemeral’dır;
   kalıcı ikinci state sahibi oluşturulamaz.
5. `ReminderDelivery` yalnız local bounded logdur; `data.notifications` ile
   ortak ID, budget, merge veya lifecycle kullanamaz.
6. Native private title ile in-app detail body ayrımı her native/privacy,
   sync ve panel fixture’ında negative assertion olarak tekrar edilir.
