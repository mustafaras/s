# APP-REMINDER-UX — Plan / Prompt / Test İzlenebilirlik Matrisi

Bu dosya, ürün planındaki her ana bölümün en az bir uygulanabilir prompta,
test kapısına ve kanıt sahibine bağlandığını kontrol eder. Prompt listesi,
ledger, state ve bu matris birlikte güncellenir; biri değişip diğerleri
değişmezse context consistency validator bunu hata sayar.

Gerçek runtime sahiplikleri ve app → sync → projection → panel lineage için
[`APP-REMINDER-APP-PANEL-SURFACE-MAP.md`](APP-REMINDER-APP-PANEL-SURFACE-MAP.md)
canonical surface authority’dir.

| Plan bölümü | Kapsam | Promptlar | Test / kanıt | Durum |
|---|---|---|---|---|
| §1 Yönetici özeti | Ürün amacı ve core scope | REM-00, REM-01, REM-40 | REM-00 audit, trace receipt | planned |
| §2 Hedef / başarı | Ürün, sakinlik, kontrol, mahremiyet metrikleri | REM-30, REM-40 | measurement contract | planned |
| §3 Mevcut mimari | app.js, sync, SW, PWA sınırı | REM-00, REM-25, REM-26, REM-44–REM-54 | capability / app runtime / privacy receipts | planned |
| §4 İlkeler | Dil, seçenek, kapasite, mahremiyet, capability | REM-07, REM-31, REM-36, REM-37 | copy, policy, UX QA | planned |
| §5 Bilgi mimarisi | kategori, priority, canonical fields | REM-01, REM-03, REM-07 | contract / catalog / policy | planned |
| §6 Reminder Center | shell, profile, permission, preview, history | REM-05, REM-06, REM-32, REM-48–REM-49 | center / permission / navigation / render tests | planned |
| §7 Hatırlatma kataloğu | prayer, zikir, therapy, Saygı, reading, care, health, special, system | REM-14–REM-21, REM-33 | feature-specific fixtures | planned |
| §8 Engine | state, occurrence, scheduler, dedupe, grouping, budget, catch-up | REM-04, REM-08–REM-11, REM-38, REM-45–REM-50 | engine / time / lifecycle / concurrency matrix | planned |
| §9 Bildirim tasarımı | channels, native, private copy, card, snooze | REM-12, REM-13, REM-22–REM-24, REM-36, REM-52 | native / SW / copy / UX tests | planned |
| §10 Günlük akış | sabah, gün içi, akşam, zor gün | REM-18, REM-31, REM-33 | flow / capacity / system tests | planned |
| §11 Kişiselleştirme | onboarding, opt-in, guardrails, feedback | REM-06, REM-34 | personalization / privacy tests | planned |
| §12 Erişilebilirlik | contrast, focus, motion, language | REM-27, REM-37 | accessibility / contrast tests | planned |
| §13 Gizlilik / etik | body privacy, sync, crisis, retention, panel redaction | REM-09, REM-16, REM-20, REM-25, REM-26, REM-39, REM-53, REM-57, REM-64, REM-70 | privacy / retention / projection / no-write | planned |
| §14 Faz planı | R0–R14 sequence and gates | REM-00–REM-72 | ledger phase gates | planned |
| §15 Test planı | fixtures, time matrix, app/panel evidence | REM-02, REM-28, REM-54, REM-66, REM-67, REM-72 | full test receipt | planned |
| §16 Marka / copy | Turkish tone and attention intensity | REM-36, REM-37 | copy / theme QA | planned |
| §17 Önceliklendirme | P0–P3, first delivery package | REM-01, REM-40, REM-41 | release scope receipt | planned |
| §18 Açık kararlar | unresolved product decisions | REM-01, REM-34, REM-40 | decisions log | planned |
| §19 Kabul kapıları | product, technical, privacy, a11y, clinical, app, panel, delivery, explicit approval | REM-27–REM-43, REM-54, REM-66, REM-70–REM-72 | all gate receipts | planned |
| §20 İlk teslim paketi | core first package + app / panel delivery boundary | REM-14–REM-18, REM-41, REM-54, REM-66, REM-72 | release candidate matrix | planned |
| §21 Sonuç | “önce güven, sonra kanal” principle | REM-40–REM-43, REM-67–REM-72 | lineage + trace + approval receipt | planned |

| §3 App runtime surface | boot, state, persistence, render, lifecycle, native boundary | REM-44–REM-54 | app surface receipts + headless fixtures | planned |
| §3 Panel runtime surface | source, coverage, redaction, transport, provenance | REM-55–REM-60 | current panel receipts | planned |
| §6–§13 Panel presentation | card, timeline, observer write boundary, privacy, a11y | REM-61–REM-66 | panel card / privacy / fixture gates | planned |
| §8 / §13 Cross-surface lineage | app → sync → projection → panel | REM-67–REM-70 | synthetic lineage and negative suites | planned |
| §12 / §19 Cross-surface UX | app copy, panel operator view, responsive / a11y | REM-71–REM-72 | integrated UX + release packet | planned |

## Prompt coverage rule

Her prompt en az bir plan section, bir test matrix gate, bir allowlist ve bir
ledger satırına sahip olmalıdır. Bir plan section “planned” kalabilir; ancak
prompt / test / evidence owner’ı boş bırakılamaz.

## Senkron güncelleme sırası

1. Plan kapsamı değişirse önce bu matrix, surface map ve decisions güncellenir.
2. Prompt eklenir / bölünürse ledger satırı ve state nextSafeAction güncellenir.
3. Test adı değişirse test matrix, ilgili prompt ve README command listesi birlikte güncellenir.
4. Release kapsamı değişirse approval gate scope’u yeniden `not_approved` yapılır.
5. `verify-reminder-context.mjs` çalıştırılmadan prompt `ready` yapılamaz.
6. Her app / panel promptu surface map’teki gerçek owner ve gap register
   satırına bağlanır; owner değişirse prompt, ledger ve test matrix birlikte
   güncellenir.

## Surface ve senkron güncelleme sırası

1. Önce `APP-REMINDER-APP-PANEL-SURFACE-MAP.md` içindeki owner / gap kaydı.
2. Sonra plan section ve decisions.
3. Sonra prompt listesi, ledger, state ve test matrix.
4. En son README, context ve evidence / handoff referansları.
5. Validator ve `git diff --check` geçmeden yeni prompt ready yapılmaz.

## Makinece doğrulanan prompt envanteri

REM-00, REM-01, REM-02, REM-03, REM-04, REM-05, REM-06, REM-07, REM-08,
REM-09, REM-10, REM-11, REM-12, REM-13, REM-14, REM-15, REM-16, REM-17,
REM-18, REM-19, REM-20, REM-21, REM-22, REM-23, REM-24, REM-25, REM-26,
REM-27, REM-28, REM-29, REM-30, REM-31, REM-32, REM-33, REM-34, REM-35,
REM-36, REM-37, REM-38, REM-39, REM-40, REM-41, REM-42, REM-43, REM-44,
REM-45, REM-46, REM-47, REM-48, REM-49, REM-50, REM-51, REM-52, REM-53,
REM-54, REM-55, REM-56, REM-57, REM-58, REM-59, REM-60, REM-61, REM-62,
REM-63, REM-64, REM-65, REM-66, REM-67, REM-68, REM-69, REM-70, REM-71,
REM-72.
