# APP-REMINDER-UX — Anti-Amnesia Ledger

Bu ledger, hatırlatma programının canlı durumunun tek insan-okunabilir
sahibidir. Sohbet geçmişi, tahmin, eski screenshot veya prompt metni canlı
durum kanıtı değildir.

**Program:** `APP-REMINDER-UX`
**Plan:** [`../plans/APP-HATIRLATMA-VE-BILDIRIM-UX-PLANI.md`](../plans/APP-HATIRLATMA-VE-BILDIRIM-UX-PLANI.md)
**State:** [`APP-REMINDER-STATE.json`](APP-REMINDER-STATE.json)
**Prompt seti:** [`APP-REMINDER-PROMPTLARI.md`](APP-REMINDER-PROMPTLARI.md)
**Başlangıç tarihi:** 2026-08-13
**Başlangıç durumu:** `planned` — uygulama kodu bu kit için henüz değiştirilmedi
**Başlangıç HEAD:** `477c830b1d0e4406f1f64bc4dd3694eef6f31103`
**Release approval:** `NOT_APPROVED` — kullanıcı açık ve güncel kapsam vermeden canlıya alma yok

## 1. Ledger ilkeleri

1. Aynı anda yalnız bir satır `in-progress` olabilir.
2. `blocked` satır çözülmeden sonraki satır başlatılamaz.
3. `done`, yalnız görev + ilgili testler + privacy / migration / accessibility
   kapıları + commit kanıtı tamamlandığında kullanılabilir.
4. `verified`, test kanıtının var olduğunu; `deployed`, Pages kanıtının var
   olduğunu ifade eder. Bunlar birbirinin yerine geçmez.
5. “Kod yazıldı” bir kanıt değildir; komut, sonuç ve SHA gerekir.
6. Her satırın allowlist’i prompt içinde yazılıdır. Allowlist dışı dosya
   değişirse satır otomatik olarak `blocked` olur.
7. Her satırda gerçek kullanıcı verisi, token, raw notification body veya
   `mustafaras/seyma-data` payload’ı tutulmaz.
8. Commit’ler dar kapsamlıdır. `git add -A`, `git add .` ve ilgisiz dosyaların
   birlikte commit edilmesi yasaktır.
9. Kullanıcının mevcut konuşmadaki açık release onayı olmadan push, merge, tag,
   Pages, dış sistem write veya canlı doğrulaması yapılamaz. Test PASS, local
   commit veya eski mesaj onay yerine geçmez.
10. `mustafaras/seyma-data` yazma izni release onayından ayrıdır; ayrıca açık
    veri yazma onayı yoksa bu depo değiştirilemez.
11. `REM-02`–`REM-72` boyunca dar kapsamlı local commitler serbesttir; program
    zinciri ve kullanıcı cihaz kontrolü bitmeden push, merge, tag, Pages, deploy
    veya external write yapılamaz. Final canlı işlemi yeni exact approval ister.

## 2. Durum sözlüğü

| Durum | Anlam |
|---|---|
| `planned` | Kapsamı ve bağımlılığı biliniyor; henüz sıraya alınmadı |
| `ready` | Ön koşullar tamam; yalnız bu satır başlatılabilir |
| `in-progress` | Ajan görev üzerinde çalışıyor |
| `blocked` | Güvenli ilerleme mümkün değil; exact kanıt ve çözüm bekliyor |
| `verified` | Görev ve testler tamam; commit / phase gate henüz kapanmadı |
| `done` | Commit, ledger ve state güncel; satır tamamlandı |
| `deployed` | `done` üzerine CI / Pages / canlı kanıtı da var |
| `deferred` | Bilinçli olarak sonraki kapsama bırakıldı |
| `approval_required` | Teknik hazırlık tamamlanabilir; kullanıcıdan exact release eylemi ve kapsamı bekleniyor |

## 3. Program kapıları

| Kapı | Geçiş şartı |
|---|---|
| G0 Authority | Root talimatları, roadmap, plan, current code ve test baseline’ı çelişkisiz |
| G1 Contract | Reminder state, occurrence, delivery, privacy ve copy sözleşmeleri kilitli |
| G2 Engine | Zaman, timezone, duplicate, budget, quiet hours ve catch-up deterministik |
| G3 UX | Hatırlatma merkezi, deep-link, erteleme, bugün sustur ve kapasite modu erişilebilir |
| G4 Core rituals | Namaz, zikir, terapi, Saygı / okuma ve akşam kapanışı bağımsız yönetilebilir |
| G5 Care / health | Su / uyku / ilaç akışları bütçeli ve klinik sınırları korunmuş |
| G6 Native | Permission, private copy, SW click ve foreground kanıtı; background vaadi yok |
| G7 Privacy / panel | Sanitize, local-only, redaction, panel ve sync sınırları geçiyor |
| G8 Release | Full regression, accessibility, migration, source/test/deploy packet hazır |
| G9 Product depth | Ölçüm, günlük akış, gelişmiş merkez, system status, personalization, copy, visual, concurrency ve retention kapıları |
| G10 Release authority | Traceability reconciliation, release candidate freeze ve exact kullanıcı onayı |
| G11 Deployment evidence | Yalnız G10 onayı sonrasında remote, CI, Pages, live ve device kanıtlarının ayrı tutulması |
| G12 App runtime | Boot, state, clock, persistence, event log, navigation, render, lifecycle, feature surface, native boundary ve headless acceptance |
| G13 Current panel | Source, coverage, redaction, transport, partial failure, provenance, card, timeline, observer write boundary, privacy, a11y ve fixture architecture |
| G14 Cross-surface integration | App → sync → projection → panel lineage, status semantics, schema compatibility, integrated privacy / UX ve user approval packet |

## 4. Prompt durum tablosu

`ready` satırı, yalnız önceki faz kapısı geçilmişse başlatılabilir. Başlangıçta
yalnız `REM-00` ready’di; REM-00 kapanışıyla R0 içindeki sonraki güvenli satır
`REM-01` ready durumuna alınmıştır.

| ID | Faz | İş paketi | Durum | Commit | Test / kanıt | Blocker / not |
|---|---|---|---|---|---|---|
| REM-00 | R0 | Authority, baseline ve capability audit | `done` | `d34b42c`, `798b9ec`, `d880db4`, `a887dd6`, `0d17a81` | `evidence/REM-00.md`; source, syntax, headless, 32 root, 27 Panel-v2, remote ve Pages receipt’leri | Blocker yok; closure state `activePrompt=REM-01`; runtime uygulanmadı |
| REM-01 | R0 | State / privacy / delivery contract freeze | `done` | `ee0d3e5` | `APP-REMINDER-DECISIONS.md` REM-ADR-010..015 / REM-DISC-007; `APP-REMINDER-TEST-MATRIX.md` REM-01 section; owner parity 48; syntax/JSON/context/diff PASS | Blocker yok; runtime kodu değişmedi; `activePrompt=REM-02` |
| REM-02 | R0 | Synthetic test harness contract | `done` | `10d8010` | `tests/reminders` contract PASS; timezone skeleton PASS; helper/contract syntax PASS; git diff --check PASS; evidence/REM-02.md | Blocker yok; production/runtime/data değişmedi; push/merge/deploy yok |
| REM-03 | R1 | Reminder catalog ve private-copy sözleşmesi | `done` | `4d4a0f1` | `app/core/reminderCatalog.js`; catalog PASS (7 case / 423 assertion); private-copy negative PASS; app.js öncesi script/cache-bust PASS; syntax/diff PASS; evidence/REM-03.md | Blocker yok; production/runtime/data değişmedi; push/merge/deploy yok |
| REM-04 | R1 | Preference state + additive migration | `done` | `15f1ba8` | `evidence/REM-04.md`; migration 5 case / 50 assertion; privacy 2 case / 19 assertion; B2 32/32; driver, syntax ve diff PASS | Blocker yok; sync.js reminder-specific sanitize/merge REM-25’e açık; `activePrompt=REM-05`; push/merge/deploy yok |
| REM-05 | R1 | Reminder Center shell ve erişilebilir bilgi mimarisi | `done` | `6327c74` | `evidence/REM-05.md`; center 6 case / 97 assertion; catalog 423; contract 74; timezone 3; migration 50; privacy 19; B2 32/32; driver, root, Panel-v2, syntax ve diff PASS | Blocker yok; native permission, preference/delivery state ve sync kapsam dışı; `activePrompt=REM-06`; push/merge/deploy yok |
| REM-06 | R1 | Profiles, category toggles ve permission explanation | `done` | `ec55913` | `evidence/REM-06.md`; profiles 35 assertion; permission 40 assertion; reminder regression, driver, syntax ve diff PASS | Blocker yok; native permission istemez; `activePrompt=REM-07` |
| REM-07 | R1 | Quiet hours, daily budget ve capacity mode | `done` | `05a067d` | `evidence/REM-07.md`; policy 71 assertion; quiet-hours 28 assertion; full reminder suite, driver, syntax ve diff PASS | Blocker yok; G1 contract kanıtı tamam; `activePrompt=REM-08` |
| REM-08 | R2 | Occurrence / timezone / DST engine | `done` | `10870c0` | `evidence/REM-08.md`; scheduler 54 assertion; timezones 23 assertion; full reminder/root/Panel-v2/B2/driver/syntax/diff PASS | Blocker yok; stale prayer fail-closed ve native replay yok; `activePrompt=REM-09` |
| REM-09 | R2 | Suppression, dedupe ve delivery journal | `done` | `82cea9d` | `tests/reminders/test_reminder_delivery.js` PASS (38 assertion); privacy PASS (30); scoped local commit | Commit closure tamamlandı; browser/data repo/push yok |
| REM-10 | R2 | Foreground scheduler lifecycle | `done` | `82cea9d` | `tests/reminders/test_reminder_lifecycle.js` PASS (36 assertion); `node --check app.js`; driver PASS; scoped local commit | Commit closure tamamlandı; browser açılmadı |
| REM-11 | R2 | Catch-up, grouping ve conflict resolution | `done` | `82cea9d` | `tests/reminders/test_reminder_catchup.js` PASS (46 assertion); `tests/reminders/test_reminder_budget.js` PASS (15 assertion); full reminder/root/Panel-v2 suite, privacy, driver, syntax, context and diff PASS | Closure tamamlandı; sonraki REM-12/13 kayıtları daha sonra canonical olarak uzlaştırıldı |
| REM-12 | R3 | In-app reminder inbox / card surface | `done` | `e5a1a6e` | `evidence/REM-12.md`; inbox 40 assertion; driver, full reminder/root/Panel-v2, boundary, syntax ve diff PASS | Blocker yok; native olmadan core card kapandı; REM-13 kapanışı tamamlandı |
| REM-13 | R3 | Snooze, today mute, disable ve deep-link | `done` | `fdc6617` | `evidence/REM-13.md`; actions 39 + deeplinks 63 assertion; delivery/lifecycle/privacy regressions, driver, full reminder/root/Panel-v2, boundary, syntax ve diff PASS | Blocker yok; REM-14 sıradaki güvenli prompt; release `not_approved` |
| REM-14 | R4 | Namaz / İman Köşesi integration | `done` | `494baab` | `evidence/REM-14.md`; prayer 48 + timezone 28 assertion; zikr 90/90; scheduler 54; full reminder/root/Panel-v2, B1/B2/B3, driver, syntax, context ve diff PASS | Blocker yok; release `not_approved`; browser/network/data write yok |
| REM-15 | R4 | Zikir / tefekkür integration | `done` | `e5a162f` | `evidence/REM-15.md`; zikir 35 + privacy 30; zikr harness 90/90; full reminder/root/Panel-v2, B1/B2/B3, driver, syntax, context ve diff PASS | Blocker yok; release `not_approved`; browser/network/data write yok |
| REM-16 | R4 | Terapi odası support integration | `done` | `8b9daf2` | `evidence/REM-16.md`; therapy 82 + privacy 30; deep-links 63; inbox 40; all 21 reminder fixtures, driver, zikr harness, root, Panel-v2, B1/B2/B3, syntax/context/diff PASS | Blocker yok; safety discrepancy yok; release `not_approved`; browser/network/data write yok |
| REM-17 | R4 | Saygı / Günün Öncüsü reading integration | `done` | `58d8490` | `evidence/REM-17.md`; Saygı 54 assertion; zikr harness 90/90; privacy 30; all 22 reminder fixtures; therapy/deeplinks/inbox, driver, root, Panel-v2, B1/B2/B3, syntax/context/diff PASS | Blocker yok; article loading/race/read gate/private copy fail-closed; REM-18 ready; release `not_approved`; browser/network/data write yok |
| REM-18 | R4 | Reading / journal / evening coalescing | `planned` | — | — | Tek akşam daveti |
| REM-19 | R5 | Water / sleep / caffeine / movement budget | `planned` | — | — | Nudge çakışması |
| REM-20 | R5 | Medication / supplement guarded flow | `planned` | — | — | Clinical safety gate |
| REM-21 | R5 | Hijri / special-day preferences | `planned` | — | — | Opt-in defaults |
| REM-22 | R6 | Notification permission state machine | `planned` | — | — | Browser izinleri |
| REM-23 | R6 | Foreground native delivery + click routing | `planned` | — | — | Background guarantee yok |
| REM-24 | R6 | Service Worker, retry ve no-spam boundary | `planned` | — | — | `sw.js` dar scope |
| REM-25 | R7 | Sync sanitize / local-only privacy audit | `planned` | — | — | Gerçek data repo yok |
| REM-26 | R7 | Panel mirror / redacted system health | `planned` | — | — | Hassas rutin yok |
| REM-27 | R8 | Accessibility, copy ve theme QA | `planned` | — | — | Light/dark 4.5:1 |
| REM-28 | R8 | Full regression, migration ve time matrix | `planned` | — | — | G8 ön koşulu |
| REM-29 | R8 | Release packet, user-device acceptance prep | `planned` | — | — | Push yetkisi ayrıca gerekir |
| REM-30 | R9 | Başarı ölçütleri ve privacy-safe observability | `planned` | — | — | G9-A |
| REM-31 | R9 | Sabah / gün içi / akşam / düşük kapasite akışları | `planned` | — | — | G9-B |
| REM-32 | R9 | Reminder Center gelişmiş kontrol yüzeyi | `planned` | — | — | G9-C |
| REM-33 | R9 | Sistem durumu, stale veri ve dürüst uyarı | `planned` | — | — | G9-D |
| REM-34 | R9 | Opt-in kişiselleştirme guardrail’leri | `planned` | — | — | G9-E |
| REM-35 | R9 | Haftalık sakin özet ve yansıma | `planned` | — | — | G9-F |
| REM-36 | R9 | Türkçe copy lexicon ve privacy negative suite | `planned` | — | — | G9-G |
| REM-37 | R9 | Premium visual, responsive ve performans QA | `planned` | — | — | G9-H |
| REM-38 | R9 | Multi-tab concurrency ve anti-clobber | `planned` | — | — | G9-I |
| REM-39 | R9 | Retention, export, clear ve reset lifecycle | `planned` | — | — | G9-J |
| REM-40 | R10 | Plan reconciliation ve traceability audit | `planned` | — | — | G10-A |
| REM-41 | R10 | Release candidate freeze ve evidence packet | `planned` | — | — | G10-B |
| REM-42 | R10 | Exact kullanıcı approval scope doğrulaması | `approval_required` | — | — | Kullanıcı onayı olmadan release yok |
| REM-43 | R11 | Approved scope release execution | `approval_required` | — | — | G11; yalnız exact user approval sonrası |
| REM-44 | R12 | App boot, script order ve global adapter | `planned` | — | — | G12-A |
| REM-45 | R12 | App state schema, ownership ve additive migration | `planned` | — | — | G12-B |
| REM-46 | R12 | App clock, timezone ve engine adapter | `planned` | — | — | G12-C |
| REM-47 | R12 | App save, commit ve event-log lifecycle | `planned` | — | — | G12-D |
| REM-48 | R12 | App Reminder Center navigation, overlay ve deep-link | `planned` | — | — | G12-E |
| REM-49 | R12 | App render lifecycle ve targeted update boundary | `planned` | — | — | G12-F |
| REM-50 | R12 | App foreground lifecycle ve scheduler orchestration | `planned` | — | — | G12-G |
| REM-51 | R12 | App feature surface adapter ve deep-link conformance | `planned` | — | — | G12-H |
| REM-52 | R12 | App permission, native adapter ve ÆON boundary | `planned` | — | — | G12-I |
| REM-53 | R12 | App local privacy, sanitize ve sync adapter | `planned` | — | — | G12-J |
| REM-54 | R12 | App module, cache-bust ve headless acceptance | `planned` | — | — | G12-K |
| REM-55 | R13 | Panel source authority ve projection selection | `planned` | — | — | G13-A |
| REM-56 | R13 | Panel coverage manifest ve schema classification | `planned` | — | — | G13-B |
| REM-57 | R13 | Panel redaction ve explicit no-op / aggregate karar | `planned` | — | — | G13-C |
| REM-58 | R13 | Panel transport, ETag / 304 ve draft safety | `planned` | — | — | G13-D |
| REM-59 | R13 | Panel partial fetch, stale ve fail-closed | `planned` | — | — | G13-E |
| REM-60 | R13 | Panel status, provenance ve operational health | `planned` | — | — | G13-F |
| REM-61 | R13 | Panel reminder dashboard card veya explicit no-op | `planned` | — | — | G13-G |
| REM-62 | R13 | Panel daily detail, event timeline ve reminder lifecycle | `planned` | — | — | G13-H |
| REM-63 | R13 | Panel observer action boundary | `planned` | — | — | G13-I |
| REM-64 | R13 | Panel privacy, redaction ve secret scanner | `planned` | — | — | G13-J |
| REM-65 | R13 | Panel responsive, accessibility ve render performance | `planned` | — | — | G13-K |
| REM-66 | R13 | Panel fixture architecture ve current / Panel-v2 regression | `planned` | — | — | G13-L |
| REM-67 | R14 | Uçtan uca reminder data lineage fixture | `planned` | — | — | G14-A |
| REM-68 | R14 | Cross-surface status ve failure semantics | `planned` | — | — | G14-B |
| REM-69 | R14 | Schema version, migration ve legacy panel compatibility | `planned` | — | — | G14-C |
| REM-70 | R14 | Integrated privacy, security ve no-write acceptance | `planned` | — | — | G14-D |
| REM-71 | R14 | Integrated UX, accessibility ve visual acceptance | `planned` | — | — | G14-E |
| REM-72 | R14 | App + panel release candidate ve user approval packet | `planned` | — | — | G14-F |

## 5. Kullanıcı onayı release hard gate’i

`APP-REMINDER-APPROVAL-GATE.md` ve `STATE.json.releaseApproval` birlikte
canonical kayıttır. Varsayılan değer `not_approved` olarak kalır. Aşağıdaki
durumlar teknik hazırlık tamamlanmış olsa bile canlı işlemi açmaz:

- testlerin PASS olması,
- local commit bulunması,
- release packet hazırlanması,
- `ready_for_user_approval` durumu,
- kullanıcının “tamam”, “devam”, “hazırla” veya “test et” demesi,
- geçmiş bir oturumdaki release isteği.

Exact kullanıcı mesajı, tarih ve izin verilen eylem scope’u state’e kaydedilmeden
REM-43 çalıştırılamaz. Push, merge, tag, Pages, canlı doğrulama ve dış sistem
write ayrı ayrı scope edilmelidir. `mustafaras/seyma-data` yazımı bu scope’tan
bağımsız, ayrıca açık veri yazma onayı ister. Ajan veya validator approval
state’ini kendisi üretemez.

## 6. Prompt başlatma / bitirme parity’si

Her prompt başlamadan ve kapanmadan şu validator çalışır:

    node docs/reminders/verify-reminder-context.mjs

Validator; prompt ID’lerinin contiguous olmasını, ledger ile eşleşmesini,
traceability coverage’ını, state pointer’larını, local linkleri, approval
default’unu ve markdown whitespace’ini kontrol eder. Bir tutarsızlık varsa
satır `blocked` veya `approval_required` kalır; sonraki prompt başlatılmaz.

## 7. Prompt başlatma protokolü

Aktif ajanın ilk işi:

```text
READ: AGENTS.md -> GELISTIRME-PLANI.md ilgili bölüm -> run-seyma/SKILL.md
      -> tests/README.md -> reminders/README.md -> CONTEXT.md -> STATE.json
      -> bu ledger -> activePrompt bloğu
CHECK: git status --short --branch; git rev-parse HEAD
SET:   state.activePrompt = <ID>; ledger row = in-progress
STOP:  blockedPrompt doluysa veya allowlist belirsizse hiçbir edit yapma
```

## 8. Prompt bitirme protokolü

Bir satırın `done` olması için ajan:

1. Promptta yazan bütün testleri çalıştırır.
2. Test failure varsa exact output’u kısaltarak ledger’a yazar ve `blocked`
   olur.
3. `node --check` ve `git diff --check` sonucunu kaydeder.
4. Allowlist dışı dosya olmadığını doğrular.
5. Commit SHA’sını kaydeder.
6. State ile ledger’ı aynı aktif / sonraki prompt değerine getirir.
7. Handoff şablonunu doldurur.

### 6.1. Faz geçişi

Fazın tüm promptları `done` olmadan sonraki faz `ready` yapılamaz. Faz geçişi
ayrıca şu özetleri ister:

- faz kapsamındaki tüm commit SHA’ları,
- test matrix PASS özeti,
- migration / privacy / accessibility durumu,
- açık discrepancy ve deferred kayıtları,
- temiz working tree veya bilinen kullanıcı değişikliği,
- push / deploy yetkisi var mı yok mu.

## 9. Blocked protokolü

Bir test, güvenlik veya kapsam sorunu olduğunda:

1. Aktif prompt satırını `blocked` yap.
2. `STATE.json.blockedPrompt` değerini aynı ID yap.
3. Exact command, beklenen, gözlenen ve etkiyi yaz.
4. Yarım üretim kodunu commit etme.
5. Sonraki prompta geçme.
6. Çözüm gerekiyorsa yeni oturumun ilk güvenli eylemini `nextSafeAction`a
   yaz.
7. Karar gerekiyorsa `APP-REMINDER-DECISIONS.md` içine append-only kayıt ekle.

## 10. Tarihsel olay günlüğü

| Tarih | Olay | Kanıt / etki | Düzeltme |
|---|---|---|---|
| 2026-08-13 | Hatırlatma UX planı için yürütme kiti oluşturuldu | Docs-only; uygulama kodu, gerçek veri ve deploy değişmedi | REM-00 baseline ilk güvenli adım olarak açıldı |
| 2026-08-13 | Kullanıcı approval hard gate’i, 44 prompt ve traceability validator eklendi | Docs-only; release `NOT_APPROVED`; push / merge / deploy / data write yapılmadı | REM-30–REM-43 planlandı; validator her prompt için zorunlu |
| 2026-08-13 | App / panel surface map ve R12–R14 prompt hattı genişletildi | Docs-only; current app, current panel ve Panel-v2 ayrımı kanonikleştirildi; release `NOT_APPROVED` | REM-44–REM-72 planlandı; app / panel / integration gap’leri ayrı acceptance’a bağlandı |
| 2026-08-13 | REM-00 kapanış parity’si düzeltildi | Evidence eski planning receipt’inden actual source/test/remote/Pages receipt’ine güncellendi; REM-00 `done`, REM-01 `ready`, release approval explicit user scope ile `approved` | REM-01 state/privacy/delivery contract freeze için hazır; reminder runtime hâlâ değişmedi |
| 2026-08-13 | Program release timing policy kullanıcı talimatıyla sıkılaştırıldı | REM-02–REM-72 için local commit serbest; full chain + local verification + user device check bitmeden push / merge / Pages / deploy yok; `STATE.releaseApproval=not_approved` resetlendi | Her prompt no-push handoff; final release yalnız yeni exact approval ile |
| 2026-08-13 | REM-01 state/privacy/delivery contract freeze tamamlandı | Beş contract için tek owner, storage, retention ve privacy class kilitlendi; preference sanitize, local delivery, native negative rules ve risk-to-test mapping yazıldı; runtime/data değişmedi | REM-02 synthetic test harness contract için hazır |
| 2026-08-13 | REM-02 synthetic test harness contract tamamlandı | 15 case / 74 assertion contract PASS; timezone skeleton 3 assertion PASS; helper ve contract syntax PASS; fetch gerçek ağ açmıyor, assertion raporu secret/raw payload taşımıyor; production/runtime/data değişmedi | REM-03 ready; yalnız local test commit; push/merge/Pages/deploy yok |
| 2026-08-13 | REM-03 reminder catalog ve private-copy sözleşmesi tamamlandı | 7 case / 423 assertion PASS; yedi zorunlu catalog kaydı, reserved ID namespace, deep-freeze, private-copy negative rules ve DOM/network/Date/localStorage negatif sınırı doğrulandı; app.js/sync/sw/data değişmedi | REM-04 ready; yalnız local catalog/test commit; push/merge/Pages/deploy yok |
| 2026-08-13 | REM-04 preference state ve additive migration tamamlandı | `data.reminders.preferences` additive migration; malformed/default/unknown/second-boot parity; delivery key ve `data.notifications` ayrımı; app→sync projection’dan reminder subtree çıkarıldı; migration 50 + privacy 19 assertion, B2 32/32, driver/syntax/diff PASS | REM-05 ready; sync.js full sanitize/merge gate’i REM-25; local commit sonrası push/merge/Pages/deploy yok |
| 2026-08-13 | REM-05 Reminder Center shell tamamlandı | Ayarlar girişi, katalog kaynaklı 7 kart, normal/empty state, uygulama içi preview, ephemeral bugün mute, native izin placeholder, quiet hours/budget özeti ve light/dark responsive/a11y shell uygulandı; center 97 assertion, catalog/contract/timezone/migration/privacy/B2/driver/regression PASS; browser/server/real storage/network/external write yok | REM-06 hazır; release `not_approved`; local commit `6327c74`, push/merge/Pages/deploy yok |
| 2026-08-13 | REM-06 ve REM-07 kapanış kayıtları tamamlandı | Önceki local commitlerin eksik canonical evidence / ledger / STATE pointer’ları gerçek SHA ve test makbuzlarıyla kapatıldı; REM-06 profiles 35 + permission 40, REM-07 policy 71 + quiet-hours 28 assertion; release `not_approved` kaldı | REM-08 `in-progress`; docs-only closure commit; push/merge/Pages/deploy yok |
| 2026-08-13 | REM-08 deterministic occurrence / timezone engine tamamlandı | Fixed-time, day-part ve prayer-offset occurrence üretimi; deterministic occurrence ID; Europe/Istanbul midnight, DST, Hicri offset, exact threshold, stale prayer fail-closed ve geçmiş native replay yok sınırları fixture’larla doğrulandı; browser/network/external write yok | REM-09 hazır; local commit `10870c0`, release `not_approved`, push/merge/Pages/deploy yok |
| 2026-08-14 | REM-09/REM-10/REM-11 safe closure tamamlandı | Delivery journal, foreground lifecycle, catch-up/grouping ve precedence katmanları `82cea9d` local commit’inde kapatıldı; delivery 38, lifecycle 36, catch-up 46, budget 15, privacy 30 assertion; full reminder/root/Panel-v2, driver, B1/B2/B3, syntax, context ve diff kapıları PASS; browser/server/network/real data write yok | REM-12 `planned/not-ready`; release `not_approved`; push/merge/Pages/deploy/device acceptance yok |
| 2026-08-15 | REM-12/REM-13 canonical reconciliation tamamlandı | REM-12 inbox/card `e5a1a6e`, REM-13 action/deep-link `fdc6617` commitleri ve ilgili evidence dosyaları canonical state/ledger’a işlendi; inbox 40, actions 39, deeplinks 63, full reminder/root/Panel-v2, B1/B2/B3, driver, syntax, context ve diff kapıları PASS; browser/server/network/real data write yok | `activePrompt=REM-14`, `lastCompletedPrompt=REM-13`, REM-14 sıradaki güvenli prompt; release `not_approved`; push/merge/Pages/deploy/device acceptance yok |
| 2026-08-15 | REM-14 Namaz / İman Köşesi integration tamamlandı | `494baab` local commit’inde prayer adapterı, method/location-aware cache metadata, six-vakit offset occurrence üretimi, stale/missing/offline fail-closed ve privacy-safe faith deep-link tamamlandı; prayer 48, timezone 28, zikr 90/90, scheduler 54 assertion ile birlikte full reminder/root/Panel-v2, B1/B2/B3, driver, syntax, context ve diff PASS; browser/server/network/real data write yok | `activePrompt=REM-15`, `lastCompletedPrompt=REM-14`, REM-15 ready; release `not_approved`; push/merge/Pages/deploy/device acceptance yok |
| 2026-08-15 | REM-15 Zikir / tefekkür integration tamamlandı | `e5a162f` local commit’inde explicit zikir preference gating, tek günlük davet, haftalık veya seçilen pencerede düşük frekanslı journey dönüşü, interval-bucket cadence guard, optional in-app reflection, hidden/visible feature flag ve reflection/private-body redaction sınırları tamamlandı; zikir 35, privacy 30, zikr harness 90/90 ile birlikte full reminder/root/Panel-v2, B1/B2/B3, driver, syntax, context ve diff PASS; browser/server/network/real data write yok | `activePrompt=REM-16`, `lastCompletedPrompt=REM-15`, REM-16 ready; release `not_approved`; push/merge/Pages/deploy/device acceptance yok |
| 2026-08-15 | REM-16 Terapi odası support integration tamamlandı | `8b9daf2` local commit’inde explicit practice gating, four safe tool mapping, weekly/daily/selected-window low-frequency cadence, light/silent capacity suppression, generic native/private copy, sensitive lifecycle redaction ve tool-aware room deep-link tamamlandı; therapy 82, privacy 30, deeplinks 63, inbox 40, all 21 reminder fixtures, root/Panel-v2, B1/B2/B3, driver, zikr harness, syntax, context ve diff PASS; browser/server/network/real data write yok | `activePrompt=REM-17`, `lastCompletedPrompt=REM-16`, REM-17 ready; release `not_approved`; push/merge/Pages/deploy/device acceptance yok |
| 2026-08-15 | REM-17 Saygı / Günün Öncüsü reading integration tamamlandı | `58d8490` local commit’inde explicit selected reading window, deterministic tek günlük occurrence, article readiness/read gate, selected-person request race guard, generic native/private copy ve `saygi` modal deep-link tamamlandı; Saygı 54, zikr harness 90/90, privacy 30, all 22 reminder, root/Panel-v2, B1/B2/B3, driver, syntax, context ve diff PASS; browser/server/network/real data write yok | `activePrompt=REM-18`, `lastCompletedPrompt=REM-17`, REM-18 ready; release `not_approved`; push/merge/Pages/deploy/device acceptance yok |

Yeni kayıtlar append-only eklenir. Ham kullanıcı verisi veya secret yazılmaz.
