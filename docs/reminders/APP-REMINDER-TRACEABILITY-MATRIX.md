# APP-REMINDER-UX — Plan / Prompt / Test / Evidence Traceability Matrix

Bu dosya REM-40 reconciliation’ının canonical sahibidir. Planın her ana
bölümü ayrı satırda; her REM ID ise ayrı sahiplik satırında tutulur. `covered`
yalnız prompt, test gate, allowlist ve evidence owner’ının tanımlı olduğunu;
`done` ise ilgili promptun ledger/evidence/commit ile kapandığını belirtir.
`planned` veya `deferred`, gelecekteki uygulama / kabul işinin yapılmış olduğu
anlamına gelmez.

## 1. Plan section-level reconciliation

| Plan bölümü | Section-level kapsam | Prompt sahibi | Test / kanıt sahibi | Karar / risk sahibi | Sonraki bağımlılık | Durum |
|---|---|---|---|---|---|---|
| §1 Yönetici özeti | Ortak reminder modeli; sakin eşlik, sakin core scope, no-background/clinical overclaim | REM-00, REM-01, REM-40–43 | G0-C, G10-A–C; `evidence/REM-00.md`, `evidence/REM-40.md` | REM-ADR-001/002/004/005 | REM-41 freeze; REM-42 exact approval | covered; release pending |
| §2 Hedef ve başarı ölçütü | Kontrol, sakinlik, eyleme geçiricilik, mahremiyet, güven, esneklik ve telemetry’siz ölçüm | REM-00, REM-30, REM-34, REM-40 | G0-C, G9-A/E, G10-A; REM-30/34/40 evidence | REM-ADR-019/020 | REM-41 source/test packet | covered; S5 pending |
| §3 Mevcut ürün ve mimari | Vanilla/PWA sınırı, app state, sync, SW, ÆON ayrımı, mevcut surface inventory | REM-00, REM-02, REM-25/26, REM-40, REM-44–45, REM-55/56 | G0-C, G0-A, G7-A/B, G10-A, G12-A/B, G13-A/B | REM-DISC-001–005, REM-ADR-007/017/018 | R12/R13 fixture implementation | covered for baseline; runtime integration planned |
| §4 Temel ürün ilkeleri | Nazik dil, seçenek, kapasite, privacy default, capability honesty | REM-07, REM-27, REM-30/31/34/36/37/40 | G1-F/G, G8-A/B/C, G9-A/B/E/G/H, G10-A | REM-ADR-002/005/014/019/020 | REM-41 freeze; no release inference | covered through R9 |
| §5 Bilgi mimarisi | Kategori, priority, canonical fields, trigger/channel/privacy/suppression/snooze | REM-01/03/04, REM-07–11, REM-40, REM-45/46 | G0-D, G0-B, G1-A/B/F/G, G2-A–F, G10-A, G12-B/C | REM-ADR-010/011/015 | R12 state/engine adapters | covered through R9; app adapter planned |
| §6 Hatırlatma Merkezi | Summary, profiles, category/detail, first-use, permission states | REM-05/06/12/13/32, REM-40, REM-48/49 | G1-C–E, G3-A–C, G9-C, G10-A, G12-E/F | REM-ADR-010/011; REM-40 audit | REM-41; R12 navigation/render | covered through R9; runtime conformance planned |
| §7 Önerilen hatırlatma kataloğu | Namaz, zikir, terapi, Saygı, reading, daily, care, health, special, ÆON/system | REM-03, REM-14–21, REM-33/40, REM-51 | G0-B, G4-A–E, G5-A–C, G9-D, G10-A, G12-H | REM-ADR-004/014/020; REM-DISC-002 | R12 surface adapter; R14 lineage | covered through R9; future integrated proof planned |
| §8 Hatırlatma motoru | Definition/preference/occurrence/delivery, local boundary, scheduler, ID, grouping, budget, quiet, catch-up | REM-01/04, REM-07–11/38/39/40, REM-45/46/50/67/69 | G0-D, G1-A/B, G1-F/G, G2-A–F, G9-I/J, G10-A, G12-B/C/G, G14-A/C | REM-ADR-003/010–012/015/017; REM-DISC-003 | R12 app state/engine; R14 lineage/schema | covered through R9; cross-surface deferred |
| §9 Bildirim ve app içi kart | Channel hierarchy, native safe copy, card, snooze, deep-link | REM-03, REM-09/12/13/22–24/36/52, REM-40 | G0-B, G2-C, G3-A–C, G6-A/B, G9-G, G10-A, G12-I | REM-ADR-002/013/014; REM-DISC-004 | R12 native boundary | covered through R9; app acceptance planned |
| §10 Günlük deneyim akışı | Sabah, gün içi, akşam, zor gün ve low-capacity coalescing | REM-11, REM-18/31/33/35/40, REM-50/62/71 | G2-E/F, G4-E, G9-B/D/F, G10-A, G12-G, G13-H, G14-E | REM-ADR-019/020 | R12 lifecycle; R13 timeline; R14 UX | covered through R9; integration planned |
| §11 Kişiselleştirme ve öneri | Minimum onboarding, explicit opt-in, safe signals, suggestion-only adaptation | REM-06/07/30/34/35/40, REM-45/51 | G1-D/F/G, G9-A/E/F, G10-A, G12-B/H | REM-ADR-019/020 | R12 state/surface conformance | covered through R9; app proof planned |
| §12 Erişilebilirlik | Contrast, focus, motion, target size, semantic language and separate panel UX | REM-05/27/36/37/40, REM-48/49/54/65/71 | G1-C, G8-A–C, G9-G/H, G10-A, G12-E/F/K, G13-K, G14-E | REM-ADR-005; evidence owners per prompt | R12/R13 a11y fixtures | covered for current surfaces; future integration planned |
| §13 Gizlilik, güvenlik ve etik | Native body, sync/panel boundary, crisis/clinical boundary, retention/clear/reset | REM-01/04/09/16/20/25/26/30/34/35/36/38/39/40, REM-52/53/57/63/64/70 | G0-D, G1-B, G2-C, G4-C, G5-B, G7-A/B, G9-A/E–J, G10-A, G12-I/J, G13-C/I/J, G14-D | REM-DISC-001–005/007; REM-ADR-002/003/005/008/014/017–020 | REM-41 privacy packet; future projection schema only by decision | covered through R9; panel/integration deferred |
| §14 Uygulama planı ve fazlar | R0–R14 sequence, gates, release/device separation | REM-00–72; REM-40 owner | G0–G14 gate set; ledger + state + evidence | REM-ADR-006/007/016; REM-DISC-008 | Strict next-prompt order; no auto-advance | 21/21 phase sections mapped; R12–R14 planned |
| §15 Test ve kalite planı | Proposed fixtures, time matrix, headless boundary, S5 device acceptance | REM-02/28/40/41/54/66/72 | G0-A, G8-D/E, G10-A/B, G12-K, G13-L, G14-F | REM-ADR-006/016; REM-DISC-008 | Create future fixtures only in their prompt allowlist | current R0–R9 evidence; R12–R14 fixtures absent/deferred |
| §16 İçerik ve marka | Turkish tone, category lexicon, attention intensity and visual calm | REM-03/27/36/37/40, REM-71 | G0-B, G8-A–C, G9-G/H, G10-A, G14-E | REM-ADR-014/019 | R14 integrated UX | covered through R9; integration planned |
| §17 Önceliklendirme | P0–P3, first delivery package, later health/automation boundaries | REM-01/03/07/14–18/20/21/30/40/41 | G0-B, G1-F/G, G4/G5, G9-A, G10-A/B | REM-ADR-004/019; REM-DISC-008 | REM-41 freeze; no R12/R14 claim | covered as plan/ledger scope |
| §18 Açık ürün kararları | 17 unresolved product/release questions and explicit defaults | REM-01/06/21/22/30/34/40–43 | G0-D, G9-A/E, G10-A–C | REM-ADR-005/019/020; REM-DISC-009 | Owner decision before any affected release scope | covered as decision inventory; unresolved items deferred |
| §19 Kabul kapıları | Product, technical, privacy, a11y, clinical and delivery gates | REM-27–43, REM-54/66/70/72, REM-40/41 | G8-A–F, G9-G/H/J, G10-A–C, G12-K, G13-L, G14-D/F | REM-ADR-005/016; REM-DISC-008/009 | REM-41 packet; REM-42 exact approval; REM-43 only approved scope | gate owners present; release not approved |
| §20 İlk teslim paketi | Center, local policy, foreground core, native opt-in, core ritual and headless evidence | REM-05–24, REM-28/29/40/41/54/72 | G1–G6, G8-D/F, G10-A/B, G12-K, G14-F | REM-ADR-004/005/016 | R12 app acceptance then R14 packet | source/test core through R9; runtime acceptance planned |
| §21 Sonuç | Control/privacy/in-app reliability before native, health and automation | REM-40–43, REM-67–72 | G10-A–C, G11-A/B, G14-A–F | REM-ADR-005/007/016; REM-DISC-008/009 | Exact approval is the only release dependency | mapped; not a release authorization |

## 2. Prompt-level ownership audit (REM-00…REM-72)

`Allowlist` hücresindeki `PROMPT-XX exact` ifadesi, ilgili prompt bloğundaki
`**Allowlist:**` satırını canonical kaynak olarak gösterir; burada kısa bir
tekrar kullanılmasının nedeni allowlist’i prompttan ayırıp genişletmemektir.
`Evidence owner` dosyası her REM için zorunlu adrestir; `planned` satırlarda
dosyanın henüz yazılmamış olması beklenen deferred durumdur.

| REM | Plan § | Test gate | Allowlist | Evidence owner | Next dependency | Durum |
|---|---|---|---|---|---|---|
| REM-00 | §1–4, §8, §13–15, §19 | G0-C | PROMPT-00 exact | evidence/REM-00.md | REM-01 | done |
| REM-01 | §2, §5, §8, §13, §18 | G0-D | PROMPT-01 exact | evidence/REM-01.md | REM-02 | done |
| REM-02 | §3, §8, §15 | G0-A | PROMPT-02 exact | evidence/REM-02.md | REM-03 | done |
| REM-03 | §5, §7, §9, §16 | G0-B | PROMPT-03 exact | evidence/REM-03.md | REM-04 | done |
| REM-04 | §8, §13, §14 | G1-A/B | PROMPT-04 exact | evidence/REM-04.md | REM-05 | done |
| REM-05 | §6, §12, §15, §20 | G1-C | PROMPT-05 exact | evidence/REM-05.md | REM-06 | done |
| REM-06 | §6, §11, §12 | G1-D/E | PROMPT-06 exact | evidence/REM-06.md | REM-07 | done |
| REM-07 | §4–5, §8–11 | G1-F/G | PROMPT-07 exact | evidence/REM-07.md | REM-08 | done |
| REM-08 | §8, §15 | G2-A/B | PROMPT-08 exact | evidence/REM-08.md | REM-09 | done |
| REM-09 | §8, §9, §13 | G2-C | PROMPT-09 exact | evidence/REM-09.md | REM-10 | done |
| REM-10 | §8, §10, §15 | G2-D | PROMPT-10 exact | evidence/REM-10.md | REM-11 | done |
| REM-11 | §8–10, §15 | G2-E/F | PROMPT-11 exact | evidence/REM-11.md | REM-12 | done |
| REM-12 | §6, §9, §15, §20 | G3-A | PROMPT-12 exact | evidence/REM-12.md | REM-13 | done |
| REM-13 | §6, §9, §15, §19 | G3-B/C | PROMPT-13 exact | evidence/REM-13.md | REM-14 | done |
| REM-14 | §7, §14, §20 | G4-A | PROMPT-14 exact | evidence/REM-14.md | REM-15 | done |
| REM-15 | §7, §14, §20 | G4-B | PROMPT-15 exact | evidence/REM-15.md | REM-16 | done |
| REM-16 | §7, §13, §14, §19 | G4-C | PROMPT-16 exact | evidence/REM-16.md | REM-17 | done |
| REM-17 | §7, §14 | G4-D | PROMPT-17 exact | evidence/REM-17.md | REM-18 | done |
| REM-18 | §7, §10, §14, §20 | G4-E | PROMPT-18 exact | evidence/REM-18.md | REM-19 | done |
| REM-19 | §7, §14 | G5-A | PROMPT-19 exact | evidence/REM-19.md | REM-20 | done |
| REM-20 | §7, §13–14, §17 | G5-B | PROMPT-20 exact | evidence/REM-20.md | REM-21 | done |
| REM-21 | §7, §14, §17 | G5-C | PROMPT-21 exact | evidence/REM-21.md | REM-22 | done |
| REM-22 | §6, §9, §12, §14 | G6-A | PROMPT-22 exact | evidence/REM-22.md | REM-23 | done |
| REM-23 | §9, §14 | G6-A | PROMPT-23 exact | evidence/REM-23.md | REM-24 | done |
| REM-24 | §3, §9, §14 | G6-B | PROMPT-24 exact | evidence/REM-24.md | REM-25 | done |
| REM-25 | §3, §8, §13–14, §19 | G7-A | PROMPT-25 exact | evidence/REM-25.md | REM-26 | done |
| REM-26 | §3, §13–14, §19 | G7-B | PROMPT-26 exact | evidence/REM-26.md | REM-27 | done |
| REM-27 | §4, §6, §9, §12–13, §16, §19 | G8-A/B/C | PROMPT-27 exact | evidence/REM-27.md | REM-28 | done |
| REM-28 | §8, §12–15, §19 | G8-D/E | PROMPT-28 exact | evidence/REM-28.md | REM-29 | done |
| REM-29 | §14, §19 | G8-F | PROMPT-29 exact | evidence/REM-29.md | REM-30 | done |
| REM-30 | §2, §4, §11, §13–14, §17 | G9-A | PROMPT-30 exact | evidence/REM-30.md | REM-31 | done |
| REM-31 | §4, §10, §14 | G9-B | PROMPT-31 exact | evidence/REM-31.md | REM-32 | done |
| REM-32 | §6, §9, §14 | G9-C | PROMPT-32 exact | evidence/REM-32.md | REM-33 | done |
| REM-33 | §4, §8–10, §13–14 | G9-D | PROMPT-33 exact | evidence/REM-33.md | REM-34 | done |
| REM-34 | §2, §4, §11, §13–14, §18 | G9-E | PROMPT-34 exact | evidence/REM-34.md | REM-35 | done |
| REM-35 | §2, §10, §14, §17 | G9-F | PROMPT-35 exact | evidence/REM-35.md | REM-36 | done |
| REM-36 | §4, §9, §12–13, §16 | G9-G | PROMPT-36 exact | evidence/REM-36.md | REM-37 | done |
| REM-37 | §4, §9, §12–13, §16 | G9-H | PROMPT-37 exact | evidence/REM-37.md | REM-38 | done |
| REM-38 | §8, §13–14 | G9-I | PROMPT-38 exact | evidence/REM-38.md | REM-39 | done |
| REM-39 | §8, §13–14, §19 | G9-J | PROMPT-39 exact | evidence/REM-39.md | REM-40 | done |
| REM-40 | §1–21 | G10-A | PROMPT-40 exact | evidence/REM-40.md | REM-41 | done |
| REM-41 | §19–21 | G10-B | PROMPT-41 exact | evidence/REM-41.md | REM-42 | ready; not started |
| REM-42 | §14, §19, §21 | G10-C | PROMPT-42 exact | evidence/REM-42.md | REM-43 | approval_required |
| REM-43 | §14, §19, §21 | G11-A/B | PROMPT-43 exact | evidence/REM-43.md | explicit exact user approval | approval_required |
| REM-44 | §3, §6, §8, §12, §14–15, §19–20 | G12-A | PROMPT-44 exact | evidence/REM-44.md | REM-45 | planned; fixture deferred |
| REM-45 | §3, §8, §13–14 | G12-B | PROMPT-45 exact | evidence/REM-45.md | REM-46 | planned; fixture deferred |
| REM-46 | §8, §14–15 | G12-C | PROMPT-46 exact | evidence/REM-46.md | REM-47 | planned; fixture deferred |
| REM-47 | §8–9, §14–15 | G12-D | PROMPT-47 exact | evidence/REM-47.md | REM-48 | planned; fixture deferred |
| REM-48 | §6, §9, §12, §15, §19 | G12-E | PROMPT-48 exact | evidence/REM-48.md | REM-49 | planned; fixture deferred |
| REM-49 | §6, §9, §12, §15 | G12-F | PROMPT-49 exact | evidence/REM-49.md | REM-50 | planned; fixture deferred |
| REM-50 | §8, §10, §14–15 | G12-G | PROMPT-50 exact | evidence/REM-50.md | REM-51 | planned; fixture deferred |
| REM-51 | §7, §10, §14, §20 | G12-H | PROMPT-51 exact | evidence/REM-51.md | REM-52 | planned; fixture deferred |
| REM-52 | §9, §12–14, §19 | G12-I | PROMPT-52 exact | evidence/REM-52.md | REM-53 | planned; fixture deferred |
| REM-53 | §3, §8, §13–14, §19 | G12-J | PROMPT-53 exact | evidence/REM-53.md | REM-54 | planned; fixture deferred |
| REM-54 | §3, §12, §14–15, §19–20 | G12-K | PROMPT-54 exact | evidence/REM-54.md | REM-55 | planned; fixture deferred |
| REM-55 | §3, §13–14, §19 | G13-A | PROMPT-55 exact | evidence/REM-55.md | REM-56 | planned; fixture deferred |
| REM-56 | §3, §5, §13–14, §19 | G13-B | PROMPT-56 exact | evidence/REM-56.md | REM-57 | planned; fixture deferred |
| REM-57 | §9, §13–14, §19 | G13-C | PROMPT-57 exact | evidence/REM-57.md | REM-58 | planned; fixture deferred |
| REM-58 | §3, §13–14, §19 | G13-D | PROMPT-58 exact | evidence/REM-58.md | REM-59 | planned; fixture deferred |
| REM-59 | §3, §13–14, §19 | G13-E | PROMPT-59 exact | evidence/REM-59.md | REM-60 | planned; fixture deferred |
| REM-60 | §13–14, §19 | G13-F | PROMPT-60 exact | evidence/REM-60.md | REM-61 | planned; fixture deferred |
| REM-61 | §13–14, §19 | G13-G | PROMPT-61 exact | evidence/REM-61.md | REM-62 | planned; fixture deferred |
| REM-62 | §8, §10, §13–14 | G13-H | PROMPT-62 exact | evidence/REM-62.md | REM-63 | planned; fixture deferred |
| REM-63 | §13–14, §19 | G13-I | PROMPT-63 exact | evidence/REM-63.md | REM-64 | planned; fixture deferred |
| REM-64 | §13–14, §19 | G13-J | PROMPT-64 exact | evidence/REM-64.md | REM-65 | planned; fixture deferred |
| REM-65 | §12–14, §16, §19 | G13-K | PROMPT-65 exact | evidence/REM-65.md | REM-66 | planned; fixture deferred |
| REM-66 | §3, §13–15, §19 | G13-L | PROMPT-66 exact | evidence/REM-66.md | REM-67 | planned; fixture deferred |
| REM-67 | §8, §13–14, §19–21 | G14-A | PROMPT-67 exact | evidence/REM-67.md | REM-68 | planned; fixture deferred |
| REM-68 | §13–14, §19, §21 | G14-B | PROMPT-68 exact | evidence/REM-68.md | REM-69 | planned; fixture deferred |
| REM-69 | §3, §8, §13–14, §19 | G14-C | PROMPT-69 exact | evidence/REM-69.md | REM-70 | planned; fixture deferred |
| REM-70 | §13–14, §19, §21 | G14-D | PROMPT-70 exact | evidence/REM-70.md | REM-71 | planned; fixture deferred |
| REM-71 | §12–14, §16, §19, §21 | G14-E | PROMPT-71 exact | evidence/REM-71.md | REM-72 | planned; fixture deferred |
| REM-72 | §14, §19–21 | G14-F | PROMPT-72 exact | evidence/REM-72.md | final approval packet; no auto-release | planned; fixture deferred |

## 3. Reconciliation findings

| Finding | Classification | Evidence | Consequence |
|---|---|---|---|
| Plan §1–§21 previously had only broad section rows; this revision assigns each section’s concrete obligations, prompt owners, test gates and evidence owners. | resolved in REM-40 | This matrix §1; `docs/plans/APP-HATIRLATMA-VE-BILDIRIM-UX-PLANI.md` §1–§21 | No section remains ownerless; broad “all covered” language is not used. |
| Prompt, ledger and state inventory is contiguous REM-00…REM-72; current active prompt is REM-40 before closure and advances only to REM-41 after closure. | verified | `verify-reminder-context.mjs`; STATE; ledger; prompt set | No prompt is added or auto-advanced by this audit. |
| R12–R14 prompt/gate/allowlist/evidence owners are specified, but their app, current-panel and cross-surface implementation fixtures are not present in the current test tree. | deferred / discrepancy REM-DISC-008 | `tests/reminders/` inventory; test matrix G12–G14; plan §14 R12–R14 | REM-44–REM-72 remain planned; no runtime or panel completion claim. |
| UX plan §18 contains unresolved product/release questions. Planning decisions and safety defaults exist, but they are not user approval or release scope. | deferred REM-DISC-009 | Plan §18; `APP-REMINDER-DECISIONS.md`; STATE release approval | REM-41 may freeze evidence only; REM-42 remains approval_required. |
| G10-A test matrix text said “44 ID”, while validator enforces 73 contiguous IDs. | resolved discrepancy REM-DISC-010 | `APP-REMINDER-TEST-MATRIX.md`; `verify-reminder-context.mjs` | G10-A is corrected to 73 IDs; validator remains authoritative. |
| Current source/test behavior is implemented and evidenced through the R9/REM-39 boundary; the plan’s later R12–R14 runtime/panel/integration behavior is not inferred from historical R9 passes. | deferred / discrepancy REM-DISC-008 | `app.js`, `sync.js`, `sw.js`, `panel.js`; `tests/reminders/` inventory; REM-39 evidence | Future prompts must create their own source/test/evidence receipts. |

## 4. Coverage rules and update order

### Senkron güncelleme sırası

Plan section table ve decisions önce; prompt, test gate, ledger/state ve
evidence owner parity’si sonra; validator ve diff gate’leri en son çalıştırılır.
Surface owner değişirse surface map, prompt, test matrix, ledger ve state
birlikte güncellenir. Release kapsamı değişirse approval state yeniden
`not_approved` olur.

- Her prompt için en az bir plan section, bir test gate, prompt allowlist’i,
  `evidence/REM-XX.md` owner’ı ve sonraki bağımlılık bu matriste bulunur.
- A prompt’s `planned` row is not an implementation or release claim. The
  current source/test tree is the evidence boundary for executed prompts.
- Plan kapsamı değişirse önce section table ve decisions, sonra prompt/test/
  ledger/state; fixture adı değişirse test matrix ve ilgili prompt birlikte
  güncellenir.
- `verify-reminder-context.mjs` prompt/ledger/state/traceability parity’sini
  ve `releaseApproval=not_approved` kilidini doğrular. Bu audit validatorın
  73 contiguous ID sözleşmesini değiştirmez.
- App runtime (REM-44–54), current observer panel (REM-55–66), integration
  (REM-67–72) ve Panel-v2 regression evidence ayrı sahiplerdir; birinin PASS’ı
  diğerinin PASS’ı sayılamaz.

## 5. Makinece beklenen prompt envanteri

REM-00, REM-01, REM-02, REM-03, REM-04, REM-05, REM-06, REM-07, REM-08,
REM-09, REM-10, REM-11, REM-12, REM-13, REM-14, REM-15, REM-16, REM-17,
REM-18, REM-19, REM-20, REM-21, REM-22, REM-23, REM-24, REM-25, REM-26,
REM-27, REM-28, REM-29, REM-30, REM-31, REM-32, REM-33, REM-34, REM-35,
REM-36, REM-37, REM-38, REM-39, REM-40, REM-41, REM-42, REM-43, REM-44,
REM-45, REM-46, REM-47, REM-48, REM-49, REM-50, REM-51, REM-52, REM-53,
REM-54, REM-55, REM-56, REM-57, REM-58, REM-59, REM-60, REM-61, REM-62,
REM-63, REM-64, REM-65, REM-66, REM-67, REM-68, REM-69, REM-70, REM-71,
REM-72.
