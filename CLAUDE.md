# CLAUDE.md

Guidance for AI assistants (Claude Code and others) working in this repository.

## ⚠️ DATA SAFETY — READ FIRST (do not skip)

**The problem (happened 2026-07-10):** An agent ran `open http://localhost:8765`
to "verify the app runs." The browser at that origin still held a **stale,
partial `seyma-reset-v1` state in localStorage with a valid `ghToken`**. On load
the app called `save()` → `SeySync.schedule()` and **pushed that stale 3-day
state to `mustafaras/seyma-data`, overwriting `data/latest.json` and wiping 17
days of real mood/notes/ticks** (4395 lines → 229). `sync.js` does a *full
replace*, not a merge, so any device/tab that saves overwrites the whole file.

**Hard rules — every agent, every session:**

1. **Never serve or open Şeyma generically to "check it runs."** The headless
   Node `vm` render harness remains the canonical default — use the
   `run-seyma` skill (`.claude/skills/run-seyma/driver.mjs`; see
   "Verification" below). **Controlled local visual QA exception:** when the
   user asks for agent-taken screenshots, an agent may start a plain static
   server bound only to `127.0.0.1:9000` and open it in a disposable,
   agent-controlled browser profile. Before doing so, verify the current
   `sync.js` Guard 1 source/test, use a URL without `forceSync=1`, never set
   `seyma-sync-force`, and never attach/read/fill any real token, password or
   existing browser profile. Guard 1 blocks remote pushes from localhost
   independently of token state; token absence is not itself a safety control.
   Capture only redacted local screenshots, report them separately from device
   acceptance, and stop the server per rule 4 before ending the turn. This
   exception is scoped to port 9000 only; it does not authorize production,
   file:, non-loopback, force-sync or real-account browser actions.
2. If you *must* use a real browser, it now self-protects: `sync.js` **blocks
   all pushes from `localhost`/`127.0.0.1`/`file:`/`*.local`** (Guard 1) and
   **blocks any push whose day-count is lower than the remote** (Guard 2,
   anti-clobber). Do not defeat these. The deliberate escape hatch is
   `localStorage.setItem('seyma-sync-force','1')` or `?forceSync=1` — only set
   it if you *intend* to overwrite real data and have a backup.
3. **Never write to `mustafaras/seyma-data` without explicit user consent.** It
   holds the only live copy of personal data. Reads are fine.
4. **Always stop any local server you start** (`pkill -f http.server` on
  macOS/Linux; `Get-Process -Name python* | Stop-Process` or `Ctrl+C` in its
  terminal on Windows) before ending your turn.
5. **Never ask the user to paste, send, or disclose secrets** such as GitHub
  tokens, passwords, 2FA codes, API keys, or private data in chat. The user
  must enter them directly into the intended local UI or terminal.
6. **Never use browser automation to read or fill token, password, GitHub,
  Apps Script, or 2FA fields.** Treat live-account setup as user-performed;
  use mocked/headless fixtures for repository verification.
7. **Separate evidence levels in status reports.** Distinguish source/test
  evidence, deploy evidence, and user-device confirmation; do not call a
  device-side or production behavior “definitely fixed” without the matching
  evidence.

**Recovery (if data is clobbered anyway):** No data is truly lost — restore it.
The real data survives in (a) `seyma-data` git history — find the last
`sync: data/latest.json` commit that still has the full day set and restore its
blob to `data/latest.json` via the Contents API; and (b) the untouched
`data/gunluk/<date>.json` full snapshots (each wraps the entire `data` object
under keys `app/date/savedAt/data`). The user's phone is push-only source of
truth and is *not* cleared by a clobber, so it re-heals on its next sync — tell
the user to reopen the app there (and not to tap "Verileri sıfırla").

## What this is

**Şeyma 🦩** is a private, single-user personal wellness/mood-tracking web app
(Turkish language, warm/informal tone) plus **ÆON**, a companion read-only
observer dashboard (`panel.html`) that lets a trusted second person follow the
tracked data and exchange messages.

There is no separate backend. Şeyma runs entirely client-side and, if
configured with a GitHub token, syncs its state directly to a **private data
repo** (`mustafaras/seyma-data`, not this repo) via the GitHub Contents API.
The panel reads that same data repo the same way, with its own token.

This repo (`mustafaras/s`) contains only the app *code* — it is deployed as a
static site to GitHub Pages. It should never contain real personal data
(mood logs, cycle data, medication, discomfort maps, psych screening
answers, tokens, etc.) — that all lives in `seyma-data` or the user's own
`localStorage`.

## Agent Routing

- Start new sessions with [`docs/GELISTIRME-PLANI.md`](docs/GELISTIRME-PLANI.md); treat it as the product roadmap and technical-principles source.
- Use [`.claude/skills/run-seyma/SKILL.md`](.claude/skills/run-seyma/SKILL.md) for data-safe app verification and [`tests/README.md`](tests/README.md) for the current root fixture inventory.
- For Panel-v2 Premium work, read the archived canonical state in [`archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/CURRENT-STATE.md`](archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/CURRENT-STATE.md) before the ledger; current fixtures live under [`tests/panel-v2/`](tests/panel-v2/). The public repository overview is [`README.md`](README.md).
- For the frozen reminder / notification UX program, read [`docs/reminders/README.md`](docs/reminders/README.md) and [`docs/reminders/APP-REMINDER-WORK-SUMMARY.md`](docs/reminders/APP-REMINDER-WORK-SUMMARY.md). `APP-REMINDER-STATE.json` is the machine-readable status; do not revive the retired REM-00..REM-72 prompt chain from chat history or old Git files.
- For reminder app / panel work, use [`docs/reminders/APP-REMINDER-APP-PANEL-SURFACE-MAP.md`](docs/reminders/APP-REMINDER-APP-PANEL-SURFACE-MAP.md): REM-44–54 are app runtime, REM-55–66 are current panel, REM-67–72 are integration; Panel-v2 remains a separate regression surface.
- For any reminder release or live action, read [`docs/reminders/APP-REMINDER-APPROVAL-GATE.md`](docs/reminders/APP-REMINDER-APPROVAL-GATE.md). `releaseApproval` remains `NOT_APPROVED`; this frozen program has no active prompt delivery. Push, deploy, tag, force-push, other remotes, external writes and `mustafaras/seyma-data` remain separately gated.
- For any UI/design work on either surface, start at [`docs/apple-design/APPLE-DESIGN-STATE.json`](docs/apple-design/APPLE-DESIGN-STATE.json) — it names the next prompt and whether anything is blocked. The audit and the binding functionality contract (I1–I6: no design change may alter `data`, `migrate()`, or the `App.<name>` handler surface) live in [`docs/apple-design/IOS27-TASARIM-PLANI.md`](docs/apple-design/IOS27-TASARIM-PLANI.md); the 52 sequential prompts in [`docs/apple-design/UYGULAMA-PROMPTLARI.md`](docs/apple-design/UYGULAMA-PROMPTLARI.md). Run prompts strictly in order and update `.anti-amnesia/LEDGER.md`, `.anti-amnesia/CURRENT-STATE.md` and the state JSON in the same commit. The series is complete (AD-52 done); push/deploy/device acceptance remain separately gated.
- For modularization / monolith-splitting work (the `app.js` IIFE, split 18,957 → ~13.1k lines into 24 `app/core/*` registries): start from [`monolit-bolumlenme-plan/`](monolit-bolumlenme-plan/README.md) — the single planning authority (60 prompt/12 waves, machine state in `MON-STATE.json`; **COMPLETE — 60/60, Dalga 1–12 closed 2026-09-13, `status=completed`, `nextPrompt=null`; closure record [`MON-SERI-KAPANIS-BELGESI.md`](monolit-bolumlenme-plan/deliverables/MON-SERI-KAPANIS-BELGESI.md), post-closure code audit 2026-09-14 in LEDGER seq 82**). Its evidence base is [`docs/monolit-bolumlenme-haritasi.md`](docs/monolit-bolumlenme-haritasi.md) (graphify-derived true business-domain split) and [`premium-fx-plan/MODULARIZATION.md`](premium-fx-plan/MODULARIZATION.md) is the execution strategy (24-module map; asserted live by `tests/app/test_modularization_boundary.js [7]`). **Trigger:** whenever a task plans to move code out of `app.js`, touch `migrate()`, or add a new `app/core/*` / `app/content/*` module, first read the monolith map and confirm the move follows the recorded domain split (and I1–I6). All premium-FX/SKY/PREM series are complete and archived under [`premium-fx-plan/deliverables/MONOLIT-TARAMASI-20260909.md`](premium-fx-plan/deliverables/MONOLIT-TARAMASI-20260909.md); the FX→modularization handoff is closed. **Load-order lesson (MON-25):** a new `app/core/*` file must be added to FOUR lists in the same commit — `index.html` script order, `.claude/skills/run-seyma/driver.mjs` FILES, `.claude/skills/run-seyma/zikr-harness.mjs` FILES, and the `tests/app/test_state_rebind_boundary.js` boot list (SKY missed driver.mjs; driver fail-closed with MON-04 exit 1 until fixed). The series is closed: any further extraction is a new program that needs its own explicit approval and state/evidence chain; the branch stays LOCAL-ONLY, no push/deploy. **That successor program exists — and it **COMPLETED**: MON2** — [`monolit-bolumlenme-plan-2/`](monolit-bolumlenme-plan-2/README.md) (8 cards, `MON2-STATE.json`, planned 2026-09-14, `status=completed` (8/8 kart, Dalga 1–4 kapandı 2026-09-15) — MON2-06: 146 alan gövdesi quran/zikr/profile/psych registry'lerine, app.js 8.969→7.797; MON2-07: 24 yan-etkili alan gövdesi appSurface.js alan yüzey bölümüne, app.js 7.797→7.603); 37 yan-etkili gövde çıplak global yerine dep-bag takma adı kullanır — `doc`/`defer`/`sync`), `nextPrompt=null`, `releaseApproval=not_approved`; closure record [`deliverables/MON2-SERI-KAPANIS.md`](monolit-bolumlenme-plan-2/deliverables/MON2-SERI-KAPANIS.md) — 13.139 → **7.603** satır, −5.536 /%42**)**. MON never set a line target; MON2 does: a measured shell budget enforced by `node tools/shell-inventory.mjs --gate` (13.139 → ~7.8k lines), retiring the 22 `reminder*Legacy` dual bodies (K1), moving domain-internal functions without shims (K2), constants with bodies (K3), handler bodies via the MON-50 appSurface pattern (K4), one new file `app/core/reminderSurface.js` (K5). Read its README §3 decisions before touching reminder code in `app.js`.
- For premium FX work (ses/hareket/tema in `app/core/mediaFx.js` + `app/core/timeTheme.js`): **the FX-2 series is complete** — 28 cards across 8 waves (2026-09-06→09-08), closing the gap FX-1 left (FX-1 shipped an FX API nobody called: `SeyAudio.tap` had 0 call sites, ripple was untriggerable, `.sey-ripple/.sey-shimmer/.sey-enter` never reached markup, haptics were a no-op on iOS, 4 premium settings shipped off — yet 9/9 fixtures were green; root cause in [`premium-fx-plan/TESHIS.md`](premium-fx-plan/TESHIS.md)). Start at [`premium-fx-plan/deliverables/FX2-KAPANIS.md`](premium-fx-plan/deliverables/FX2-KAPANIS.md) — the closure record: full before/after M1–M13 coverage table (12/13 metrics met; M7 at the user-approved 0.62 ceiling, not the coverage tool's literal 0.80), the final API inventory (`SeyTouch`, `SeyAmbience`, `SeyAudio`, `SeyFx`, `SeyHaptics`, `SeyTimeTheme`), `settings` defaults, fixture inventory, and known limits. Background: [`premium-fx-plan/PLAN-FX2.md`](premium-fx-plan/PLAN-FX2.md) (waves, invariants I1–I8, contract S1–S8), [`premium-fx-plan/KAPSAM-OLCUMU.md`](premium-fx-plan/KAPSAM-OLCUMU.md) (the coverage-metric methodology), [`premium-fx-plan/RENK-VE-ZEMIN.md`](premium-fx-plan/RENK-VE-ZEMIN.md) (colour decision — pink → champagne gold — and the live-background contract: 4 solar-time × 8 WMO-weather × 6 season = 192 scenes, driven entirely by the already-live `data.weather`, no new network call), `SES-TASARIMI.md`/`HAREKET-SISTEMI.md` (audio/motion specs), `SAFEGUARDS.md`, `LOCAL-ONLY-IMPLEMENTATION.md`. FX-1 history is condensed in [`premium-fx-plan/arsiv/FX1-OZET.md`](premium-fx-plan/arsiv/FX1-OZET.md); its closure record stays at the frozen `deliverables/FX-SERI-KAPANIS-BELGESI.md` (do not edit retroactively — it documents FX-1-era files intentionally). **No push, no merge to `main`, no tag, no deploy without explicit user approval**; device acceptance (K3) is separately pending. This closes the precondition for the FX→modularization handoff (see the modularization bullet above).
- For the **header live weather/time scene and remaining premium cosmetics**: **SKY + PREM series is complete** — 15/15 cards (SKY-01…12 + PREM-01…03, 2026-09-09, LOCAL-ONLY on `premium-fx-gorsel-yuzey`), closing GÖREV A/B of the devir. The header weather effects are now a canvas particle engine (`app/core/skyFx.js`, `window.SeySkyFx` with `mount/update/pause/resume/unmount`, rAF-only, seeded stars, depth-based rain/snow, 2-plane clouds, 3-band fog, directed 31 s lightning) wired into `app.js` via `skySceneNow()`+`mountSkyCanvas()`; the old CSS `sky-wx-*` textures, `ambRainHdr`/`ambSnowHdr` keyframes and the empty `.sey-hdr-sky::after` are deleted (sky gradient + 8 `sky-time-*` palettes remain). `SeyFx.transition` is removed (0 call sites). M7 stays at the user-approved **0.62** ceiling — every real-valued transition/animation in `styles.css` is already token-based; the 77 non-compliant payda items are accessibility `none` declarations (analysis: [`premium-fx-plan/deliverables/PREM-02-M7-ANALIZ.md`](premium-fx-plan/deliverables/PREM-02-M7-ANALIZ.md)). The staggered tab entry now also sets `.sey-stagger` + `--i` (single motion system, `SeyFx.enter` kept). **Evidence:** [`premium-fx-plan/deliverables/HEADER-V2-20260909.md`](premium-fx-plan/deliverables/HEADER-V2-20260909.md) — 56 screenshots (7 wx × 4 time × 2 theme), time-separation ×2.3 vs the old CSS (24.97 vs 10.87), 60.2 fps (0 long tasks), contrast 11.58/11.14, series audit in [`premium-fx-plan/deliverables/PROMPT-SERI-TARAMASI-20260909.md`](premium-fx-plan/deliverables/PROMPT-SERI-TARAMASI-20260909.md). **Hardest constraint:** `tests/app/test_fx2_ambience.js` requires `amb-wx-*` selectors to target only `#sey-aurora::after` with opacity ≤ 0.30 — the header stays in its own `sky-time-*`/`sky-wx-*` namespace. Never mention `amb-wx-`/`amb-time-` inside a CSS comment: the contract scanner is a plain text scan and will misattribute the following block. `fx-coverage --gate` genuinely exits 1 (M7 below the 0.80 threshold, an approved ceiling) — do not read `$?` after a pipe. New `app/core/*` modules must also be added to the load-order contract lists in `tests/app/test_state_rebind_boundary.js`, `.claude/skills/run-seyma/driver.mjs` and `.claude/skills/run-seyma/zikr-harness.mjs` (all three already include `skyFx.js`; SKY originally missed driver.mjs and the driver fail-closed with MON-04 exit 1 until MON-25 fixed it). No push, no deploy; K3 device acceptance comes only from the user.
- Keep root guidance operational and concise; link to canonical documents instead of copying their full contents into new instructions.
- **v3.0 tanıtım + kutlama sayfası** (`v3-tanitim/`, sürüm tanıtımı): ayrı bir yüzeydir, `app.js`'e hiç dokunmaz. Açılışta tanıtım görülmediyse `index.html`'in `<head>`'indeki tek inline bootstrap `location.replace` ile yönlendirir ve `app.js` hiç *çalışmaz* — ilk açılışta veri/push riski doğmaz (tarayıcı `<body>` betiklerini ön-indirebilir; indirmek çalıştırmak değildir). **Kalıcılık:** `seyma-v3-welcome-v1` (uygulamanın `seyma-reset-v1` anahtarından ayrı namespace; "Verileri sıfırla" silmez). **Sonsuz döngü koruması:** `v3.js` işareti yazdığını geri okuyarak doğrular; depo yazılamıyorsa `?v3done=1` ile döner ve bootstrap bir kez atlar. **Uygulama içi sürüm:** Ayarlar → Hakkında **v3.0** + "3.0'da neler değişti?" köprüsü (düz `<a>`) ve başlangıç ekranı rozeti v3.0. **Gün sayısı SABİT DEĞİL:** `dayCount = diffDays(data.startDate, bugün) + 1` ile türetilir (gerçek veri: `startDate=2026-06-24` → **84**); statik HTML yalnız geçerli bir *varsayılan* taşır, JS gerçek sayıya düzeltir (hero/sayaç/kapanış/footer + `trWords()` Türkçe sayı sözcüğü). **Salt-okur uzak kaynak:** `v3-source.js` uygulamanın zaten sakladığı `settings.ghToken`/`ghRepo` varsa `data/latest.json`'ı **yalnız-GET** çeker (**repo esastır**; cihaz kaydı yalnız kimlik yokken ya da ağ hatasında yedektir — cihaz kaydı bayat olabilir) (1 MB üstü için `git/blobs` yedeği, UTF-8 `TextDecoder`); **yazmaz**, diske kaydetmez, token'ı yalnız `Authorization` başlığında tutar; kimlik yoksa ağa hiç çıkmaz. Statik HTML varsayılanı gerçek `startDate`'e sabittir (24 Haziran 2026 / 84). **Tuzak:** fx2 fixture'ları App yüzeyini (718) ve tıklama sayısını (391) **düz metin** taramasıyla sabitler; `settings.js`/`render.js` bu taramaya dâhildir ve tarama **yorumları da sayar** — yorumda `App.<ad>=` veya tıklama niteliği adı yazmak pini kaydırır (bir kez yaşandı). Bu sayfayı değiştirmeden önce [`docs/v3-tanitim/README.md`](docs/v3-tanitim/README.md) ve devir/denetim belgesi [`docs/v3-tanitim/DEVIR-PROMPTU.md`](docs/v3-tanitim/DEVIR-PROMPTU.md) oku; doğrulama `node tests/app/test_v3_welcome.js` (273 kontrol) + DEVIR-PROMPTU §6 köprü senaryosu.

## Repo layout

```
index.html      Thin HTML shell. Loads app/styles.css, all app/content/*.js
                 data modules, all app/core/*.js modules, app.js, sync.js with
                 cache-busting `?v=YYYYMMDDx` query strings. Registers sw.js.
app/core/constants.js  First app/core script; owns the extracted icon map and
                 boot constants through `window.SeymaConstants`.
app/core/mediaFx.js    Premium FX runtime: `window.SeyAudio` (WebAudio taps,
                 voice guidance incl. cloud TTS, quiet-time 23–07 gating),
                 `window.SeyHaptics` (vibration patterns) and `window.SeyFx`
                 (gating + countUp/ripple/shimmer). Heavily consumed by app.js.
app/core/timeTheme.js  `window.SeyTimeTheme` — hour class (dawn/day/dusk/night)
                 + seasonal overlay applied to `#root` (guarded call in app.js).
app/core/state.js · syncGlue.js · dateUtils.js · helpers.js
                 MON-07…18 core registries (`window.SeymaState`,
                 `window.SeymaSave`, `window.SeymaDateUtils`,
                 `window.SeymaHelpers`). They own the real bodies of
                 `migrate()`/`getDay()`/`createDefaultData()`, `save()`, the
                 date helpers and the 12 view/interaction helpers; app.js
                 registers dependency bags at boot (fail-closed `register*`
                 calls throw) and keeps signature-preserving shims.
app/core/{prayer,zikir,quran,saygi,motivation,crisis,journal,health,
  library,report,map,profile,settings,reminders,messaging}.js
                 MON-19…43 domain registries (`window.Seyma<Domain>`;
                 zikir's is `SeymaZikr`). Each installs one registry at load
                 with no DOM/network/timer/storage access, holds the domain's
                 pure/HTML bodies, and reads app.js closure state only through
                 B1 getters or `call('name', args)` resolver bags. Mutations,
                 `data` rebinds and `App.*` handlers stay in app.js.
                 `reminders.js` sits on top of the frozen REM×4 modules.
app/core/reminderSurface.js
                 MON2-03 module (`window.SeymaReminderSurface`): owns the 35
                 reminder side-effect functions and the 51 `App.*reminder*`
                 handler bodies via the MON-50 appSurface pattern (123-dep
                 bag + with(SCOPE)); app.js keeps 1-liner shims and the
                 retired 22 `reminder*Legacy` dual bodies are gone (MON2-01).
app/core/render.js · appSurface.js
                 MON-44…54. `SeymaRender` owns every tab/shell/modal HTML
                 builder and `render()` itself (app.js `render()` is a shim);
                 `SeymaAppSurface` owns the daily/domain/overlay handler
                 bodies, lifecycle callbacks and boot bridges. Timer/listener
                 *registration*, `window.App=App` and all `App.x=function`
                 assignments remain in app.js as shims.
app/core/reminder*.js  Frozen REM program modules (`ReminderCatalogV1`,
                 `ReminderEngineV1`, `ReminderSchedulerV1`,
                 `ReminderDeliveryV1`): pure engine/scheduler/delivery
                 boundaries consumed by app.js; copy lexicon in
                 reminderCatalog.js.
app.js           The Şeyma runtime shell (single IIFE, ~9.0k lines after the
                 MON-01…60 split + MON2 Dalga 1–2). Still the sole owner of `var data/ui/dark`
                 and the 9 `data=` rebind sites, the 7 B1 live getters, the
                 `SeyOnSyncState`/`SeyOnSynced` callbacks, all timer/listener
                 registrations, `window.App=App` and the 554 `App.x=function`
                 handler assignments; bodies are delegated to the registries
                 above through ~500 signature-preserving shims.
app/content/motivationProgramV2.js  Standalone IIFE data module: 120-day "motivation
                 program" content (per-day Faz/task objects) plus helpers,
                 exposed as `window.MotivationProgramV2`; consumed by app.js
                 (Terapi Odası engine) and narrated by motivationNarratives.js.
                 Rollout plans live in the untracked, local-only
                 `seyma_motivation_v2_package/` directory — don't commit it.
app/content/motivationNarratives.js Standalone narrative content module
                 (`window.MotivationNarratives`) for the program.
app/content/saygiPeople.js   Frozen data module of 100 "günün öncüsü" inspirational
                 figures (`window.SaygiPeople`) powering the Saygı /
                 İlham & İbadet tab (daily figure, Wikipedia fetch,
                 read-tracking).
app/content/profileAssessmentV1.js Frozen, hand-authored data module: single-session
                 174-item scientific profile assessment
                 (`window.ProfileAssessmentV1`) — sessions, consent schema,
                 instruments. Consumed by app.js's profile engine and merged
                 across devices by sync.js's `SeySync.mergeProfileAssessment`.
                 Do not hand-edit item content; it is versioned (`version`).
app/content/hijriCalendar.js Standalone Hicri (Islamic) calendar module
                 (`window.HijriCalendarV1`) — offset-based Miladi→Hicri
                 conversion + mübarek gün (holy day) lookup, consumed by
                 app.js's `hijriTodayStr`/`kandilBadgeFor`. User-adjustable
                 ±2 day offset via `settings.prayer.hijriOffset` for local
                 hilal (crescent) variance.
app/content/quranRevelationOrderV1.js  Frozen 114-sûre nüzul (revelation) order
                 catalog (`window.QuranRevelationOrderV1`) for the Kur'an
                 Yolculuğu.
app/content/quranStrikingVersesV1.js  Frozen 100 human-verified âyet rotating
                 showcase (`window.QuranStrikingVersesV1`).
app/content/esmaulHusnaV1.js / esmaulHusnaV2.js  Frozen 99 Esmâü'l-Hüsnâ
                 catalogs (`window.EsmaulHusnaV1` Diyanet order + ebced
                 targets; V2 = meaning/reflection content layer keyed by
                 `order`).
app/content/zikirCoreContentV1.js  Frozen content layer
                 (`window.ZikirCoreContentV1`) for the 5 core zikr presets,
                 keyed to `ZIKR_SEED[i].id`.
sync.js          Separate IIFE. Debounced push of `data` to the GitHub
                 Contents API (data/latest.json + data/gunluk/<date>.json).
                 Also owns conflict-merge helpers
                 (`SeySync.mergeProfileAssessment`). Failure receipts
                 (`data/sync-receipt.json`) carry a whitelisted
                 `lastErrorDetail` (e.g. `http_500`) alongside the existing
                 coarse `lastErrorCode`, purely for diagnosis — never raw
                 data. `SeySync.retryIfPending` (already wired to the
                 browser `online` event) is also called from app.js's
                 30s foreground poll loop as a throttled (5 min) watchdog,
                 so a push stuck in error state doesn't sit unresolved
                 indefinitely if the tab is never backgrounded/refocused.
app/content/quranTransportV1.js  Pure QY-04 transport contract for "Raşit ile Kur'an
                 Yolculuğu": three files fully independent of the
                 latest.json chain — `data/quran-request-outbox.json`
                 (app writes, GitHub Actions in the seyma-data repo reads
                 and emails a reminder via `.github/workflows/quran-mail.yml`),
                 `data/quran-delivery.json` (that Action writes back),
                 `data/quran-responses.json` (a Gmail Apps Script writes
                 after the user replies with a video link). app.js's
                 `App.quranJourneySubmit` pulls+applies the latest
                 delivery/response state (read-only, idempotent) before
                 allowing a new request, so a stale tab/device can't refire
                 a duplicate request+email for a surah already answered
                 elsewhere.
panel/panelCoverageManifest.js  Pure P1 coverage/redaction adapter. Defines the
                 manifest and builds/parses `data/observer-snapshot.json`;
                 no network, DOM, localStorage or raw secret/GPS/profile/media
                 output.
panel.html       Standalone "ÆON · Orchestration Core" observer dashboard.
                 Independent app — does NOT share code with app.js. Fetches
                 data/latest.json from GitHub with its own token/localStorage
                 key, dark/gold theme, can write to
                 data/observer-inbox.json / data/aeon-outbox.json.
panel/panel.css        Panel-only stylesheet extracted from panel.html.
panel/panel.js         Panel observer IIFE extracted from panel.html; helper names
                 and API flow remain compatible with the panel harness.
panel/v2/panel-v2.js   Premium observer runtime; independent from current panel.
panel/v2/panel-v2.css  Premium observer design tokens, components and responsive rules.
panel-v2.html    Premium ÆON observer shell (repo root); loads only
                 quranRevelationOrderV1.js, panelCoverageManifest.js and
                 panel/v2/panel-v2.js — a third, separate regression surface.
premium-fx-plan/ Premium FX program docs. **FX-2 series complete**
                 ("hissedilir premium", 28 cards, 8 waves, 2026-09-06→09-08):
                 TESHIS.md (root-cause audit), PLAN-FX2.md (waves +
                 invariants), KAPSAM-OLCUMU.md (coverage metrics), SES-TASARIMI.md
                 + HAREKET-SISTEMI.md (audio/motion specs), .prompts/FX2-KATALOG.md
                 + 28 FX2-NN.md cards (historical — series closed), RENK-VE-ZEMIN.md
                 (champagne-gold palette + 192-scene live background),
                 tools/fx-coverage.mjs (network-free coverage-metric CLI;
                 `--gate`/`--save`/`--json`), .anti-amnesia/ (FX2-STATE.json +
                 CURRENT-STATE.md + LEDGER.md), deliverables/FX2-KAPANIS.md
                 (series closure record) + FX2-KAPSAM-RAPORU.md (final
                 regression report). MODULARIZATION.md (module-split strategy —
                 first input for the FX→modularization handoff; do NOT edit,
                 tests/app/test_modularization_boundary.js asserts on it),
                 SAFEGUARDS.md + LOCAL-ONLY-IMPLEMENTATION.md (no-push/
                 no-deploy gates), arsiv/FX1-OZET.md + deliverables/
                 FX-SERI-KAPANIS-BELGESI.md (FX-1 history, frozen). New fixture
                 families from the series: tests/app/test_fx2_*.js
                 (palette/touch/audio/tab-transition/overlay-motion/ambience,
                 6 files) + expanded test_premium_*.js.
files/           Local maintenance area (yedek/ JSON backups, bakim/ scripts).
graphify-out/    graphify knowledge-graph output for app.js — evidence base
                 behind docs/monolit-bolumlenme-haritasi.md.
archive/         Frozen program archives (Panel-v2 Premium design, panel
                 denetim merkezi, demos) with their own .anti-amnesia/ states.
app/styles.css       Shared CSS variables (light/dark theme) + small set of
                 global rules/keyframes used by index.html's app.
assets/aeon-icon-*.png PWA and ÆON panel icon assets referenced by manifest.json.
sw.js            Service worker (PWA install + notificationclick routing);
                 manifest.json is the PWA manifest, aeon-icon-*.png the icons.
docs/GELISTIRME-PLANI.md  Living Turkish roadmap/spec doc with a feature status
                 table (✅/🟡/❌) and the "teknik ilkeler" (technical
                 principles) new features must follow. Read it before adding
                 a feature; update its status table/changelog when a listed
                 item ships.
tests/app/test_faz10_sync.js   Committed headless Node harness: sync.js conflict-merge
                 tests with mocked window/localStorage/fetch (no network).
                 Run: `node tests/app/test_faz10_sync.js`.
tests/app/test_aeon_message_expand.js  ÆON/Luna sohbetinde uzun mesajın "Tümünü
                 göster" durumunun render'lar arasında yaşadığını doğrulayan ağsız
                 node:vm fixture'ı. Kırpılmış balonun kimliği eskiden her render'da
                 artan bir sayaçtan üretiliyor, açık/kapalı bilgisi yalnızca DOM'da
                 tutuluyordu; bu yüzden her arka plan render'ı (30 sn ÆON yoklaması,
                 reminder timer'ı, foreground dönüşü, yeni mesaj, panel makbuzu)
                 mesajı kullanıcı okurken kapatıyordu.
                 Run: `node tests/app/test_aeon_message_expand.js`.
tests/panel/test_faz11_panel.js  Headless Node harness for panel.html helper/render
                 logic. Run: `node tests/panel/test_faz11_panel.js`.
tests/panel/test_panel_p0_sync.js Headless Node fixture for PANEL-01 receipt/revision,
                 anti-clobber and panel time/status projection. Run:
                 `node tests/panel/test_panel_p0_sync.js`.
tests/panel/test_panel_p1_projection.js Headless Node fixture for PANEL-02 coverage,
                 redaction, stale projection and legacy fallback. Run:
                 `node tests/panel/test_panel_p1_projection.js`.
tests/panel/test_panel_p3_root_modules.js Headless Node fixture for PANEL-03 root-module
                 projection/render, stale/missing/broken states, Saygı mismatch,
                 settings summary, privacy and no-mutation boundary. Run:
                 `node tests/panel/test_panel_p3_root_modules.js`.
tests/panel/test_panel_p4_provenance.js Headless Node fixture for PANEL-04 therapy
                 redaction, profile progress, notification lifecycle and
                 external fetch provenance. Run: `node tests/panel/test_panel_p4_provenance.js`.
tests/panel/test_panel_p2_event_log.js Headless Node fixture for PANEL-05 event contract,
                 redaction, sequence audit, panel filters and revision drawer.
                 Run: `node tests/panel/test_panel_p2_event_log.js`.
tests/panel/test_panel_p2_sync.js Headless Node fixture for PANEL-05 daily event-file
                 merge, duplicate idempotence and receipt-bound push. Run:
                 `node tests/panel/test_panel_p2_sync.js`.
tests/panel/test_panel_p2_polling.js Headless Node fixture for PANEL-06 conditional
                 polling, ETag/304, draft safety, status map and p50/p95.
                 Run: `node tests/panel/test_panel_p2_polling.js`.
tests/panel/test_panel_boot_resilience.js Headless Node fixture guarding the panel
                 boot/poll resilience contract: per-request fetch timeout with a
                 real AbortController cancel, the `load()` single-flight lock,
                 bounded concurrency for `data/events/<date>.json` day files,
                 consecutive-error backoff, and the "stuck on Çekirdek
                 başlatılıyor…" regression. Run:
                 `node tests/panel/test_panel_boot_resilience.js`.
tests/panel-v2/           ÆON Panel-v2 Premium test suite (27 fixtures);
                         see `tests/panel-v2/README.md` and its `helpers/`.
tests/quran/              9 fixtures for the Kur'an modules (catalog,
                 transport, merge, outbox sync, striking verses, panel parity).
tests/reminders/          20 frozen-program maintenance fixtures; run the
                 whole family via `node tests/reminders/run-reminder-smoke.mjs`.
tests/app/ + tests/panel/ Remaining families: modularization/B1 boundary
                 fixtures (test_modularization_boundary.js,
                 test_faz_minus11_boundary.js, test_date_utils_boundary.js,
                 test_helpers_boundary.js), premium FX fixtures
                 (test_premium_*.js), modal focus + accessibility fixtures,
                 and the PANEL-01..06 observer regression family. See
                 `tests/README.md`.
.claude/skills/run-seyma/verify-state-helper-boundary.mjs
                 L2-b/B1 read-only empty/normalizer helper fixture; no app boot,
                 localStorage, sync.js or network.
.claude/skills/run-seyma/verify-state-migration-boundary.mjs
                 L2-b/B2 synthetic black-box migrate parity fixture; memory-only
                 localStorage, no sync/network/private data.
.claude/skills/run-seyma/state-adapter-scratch.mjs
                 L2-b/B3 scratch-only dependency-bag contract, not production.
.claude/skills/run-seyma/verify-state-adapter-contract.mjs
                 B3 synthetic contract harness; no app.js/sync.js loading.
.claude/skills/run-seyma/  Data-safe headless verification skill — see
                 "Verification" below. `driver.mjs` is the core app.js
                 render harness; `zikr-harness.mjs` covers the İlham &
                 İbadet hub (zikirmatik, kıble, hicri takvim, ibadet rapor).
                 Both run app.js in `node:vm` with fetch/timers stubbed dead,
                 so zero network calls are possible — nothing can be pushed.
AGENTS.md        Parallel, tool-agnostic restatement of this file's rules
                 (same conventions, generic Agents-format doc). Keep both in
                 sync when a convention changes.
.github/workflows/pages.yml  GitHub Pages deploy: on push to `main`, uploads
                 the whole repo root as-is and deploys it. No build step.
```

There is **no `package.json`, bundler, framework, npm test script, or
linter**. Committed headless Node fixtures live under `tests/` and
`.claude/skills/run-seyma/`; everything else is hand-written vanilla
JS/HTML/CSS targeting mobile Safari/Chrome (viewport ≤460px design).

## Architecture of `app.js`

- A single global mutable `data` object is the entire app state
  (`data.days[date]` per-day records, plus `settings`, `cycle`, `library`,
  `watchlist`, `music`, `luna`, `aeon`, etc.). It's loaded from
  `localStorage` under key `seyma-reset-v1` and passed through `migrate(d)`
  on load to backfill new fields for old saves — **always extend `migrate()`
  when adding a new field**, never assume it exists on old data.
- `save()` persists `data` to `localStorage` and calls
  `window.SeySync.schedule(data)` if sync.js is loaded.
- **B1 live-getter boundary (Faz 0):** app.js defines
  `Object.defineProperty(window, 'data'|'ui'|'dark'|'migrate'|'getDay'|
  'createDefaultData'|'save', {get: ...})` so external modules
  (`window.SeymaState`, `window.SeymaSave`) always read the fresh closure
  value even after `data` is reassigned (reset/import/lock). Never replace
  these with one-shot references — `data` is rebound 6+ times during boot.
- **Premium FX modules:** UI sounds/haptics/visual micro-FX go through
  `window.SeyAudio` / `SeyHaptics` / `SeyFx` (`app/core/mediaFx.js`) and the
  hour/season theme through `window.SeyTimeTheme` (`app/core/timeTheme.js`);
  they self-gate on settings + reduced motion + quiet time (23–07), so call
  them instead of hand-rolling WebAudio/vibrate code.
- `render()` rebuilds the visible tab's HTML as a big string and sets
  `#app.innerHTML`. There is no virtual DOM/diffing — UI functions like
  `bugunHTML()`, `raporHTML()`, `mesajHTML()` etc. return HTML strings.
- User interaction is wired via inline `onclick="App.xxx(...)"` attributes
  in the generated HTML. All handlers are attached as `App.<name> =
  function(...)`. Follow this pattern for new interactive elements — don't
  introduce `addEventListener`-based wiring or a component framework.
- `ui` is a separate global object for ephemeral view state (which tab,
  which overlay is open, draft text, etc.) — it is **not** persisted.
- Overlay/hub features (📖 reading, 🎬 watching, 🎧 listening) follow a
  copy-paste template: `openX()`/`closeX()` + `ui.xView` + `segTabs`. Reuse
  this pattern for any new full-screen hub rather than inventing a new one.
- **Modal keyboard contract** — every dismissible overlay uses the shared
  `App.onModalKeydown` path: its backdrop is never focusable, the inner
  `role="dialog" aria-modal="true"` owns Tab/Escape, and the focus list includes
  enabled buttons, inputs, selects, textareas, links and positive tabindex
  nodes. Opening transfers focus to the dialog or its intended first field.
  Add a headless Tab, Shift+Tab and Escape regression (including a text field
  when present) before adding another modal; never make a backdrop
  `role="button" tabindex="0"`.

## Conventions (see `docs/GELISTIRME-PLANI.md` §"Uyulacak teknik ilkeler" for the
canonical Turkish version)

1. **One `data` object** — add new fields to `data`, not a separate store,
   so sync and the panel pick them up automatically.
2. **Theme via CSS variables**, not hardcoded hex — use `--read`, `--watch`,
   `--listen`, `--ok`, `--drop`, `--pause`, `--text`, `--muted`, etc. New
   accents need definitions in both the light block and the
   `#root[data-theme="dark"]` block in `app/styles.css`.
3. **Overlay pattern** for new hubs: mirror the reading/watching/listening
   template exactly (open/close handlers, `ui.xView`, segmented tabs).
4. **Panel mirror** — any new persistent user record should also render
   somewhere in `panel.html` (a bento card or a day-detail row), since the
   observer only ever sees what's reflected there.
5. **Cache busting** — bump the `?v=` query string in `index.html` (and
   `panel-v2.html` for panel files) for **every** asset you change —
   `app/styles.css`, `app.js`, `sync.js`, and each `app/core/*` /
   `app/content/*` module carries its own version — or the PWA/Pages CDN
   can serve stale assets.
6. **Privacy** — secrets (`ghToken`, `openaiKey`, `syncUrl`) must stay out
   of anything written to the (public-ish) data repo; `sync.js`'s
   `sanitize()` strips them before every push — keep that in sync if you
   add new secret fields to `settings`.
7. **Language & tone** — UI copy, comments, and commit messages in this
   project are predominantly Turkish, warm and informal (pet name
   "Sevgili Günışığı", emoji-heavy). Match the existing voice when touching
   user-facing strings; don't switch it to English or a neutral tone.

## Working in the huge files

`app.js`, `index.html`, and `panel.html` are large (index.html/panel.html
have some extremely long single lines — e.g. base64-embedded icons). Prefer
`Grep` to locate the relevant function/section by name before reading, and
read files in bounded line ranges rather than in full.

## Verification

For the completed Panel-v2 Premium surface, the canonical fixture directory is
`tests/panel-v2/` (27 headless Node/VM tests) with the shared helper at
`tests/panel-v2/helpers/panel-v2-test-helper.js`. Run:

```bash
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done
```

For the completed Premium FX series, the equivalent family is
`tests/app/test_premium_*.js` (audio/haptics/reduced-motion/launch-splash/
time-theme/fx-utils/voice/settings):

```bash
for f in tests/app/test_premium_*.js; do node "$f"; done
```

The remaining committed families: modularization/B1 boundary fixtures
(`tests/app/test_modularization_boundary.js`, `test_faz_minus11_boundary.js`,
`test_date_utils_boundary.js`, `test_helpers_boundary.js`), the PANEL-01..06
observer family under `tests/panel/`, the Kur'an modules under `tests/quran/`,
and the frozen reminder program via
`node tests/reminders/run-reminder-smoke.mjs`. See
[`tests/README.md`](tests/README.md) for the authoritative inventory.

There's no automated test suite or linter, but `node --check app.js` (or
`sync.js`, `app/content/hijriCalendar.js`, etc.) catches JS syntax errors first. Beyond
that, **do not serve+open the app in a browser** (see "DATA SAFETY" above) —
use the `run-seyma` skill's headless Node `vm` harnesses instead:

- `node .claude/skills/run-seyma/driver.mjs` — boots constants + `app.js` twice
  (onboarding + seeded state) and drives real interactions (tab switch,
  card toggle, theme toggle), asserting on the rendered HTML. Add
  `--dump <tabId>` to dump a tab's generated markup for inspection.
- `node .claude/skills/run-seyma/zikr-harness.mjs` — same approach for the
  İlham & İbadet hub (zikirmatik, kıble, hicri takvim, ibadet rapor).
- `node .claude/skills/run-seyma/verify-state-helper-boundary.mjs` — extracts
  only the current empty/normalizer helper declarations into a dependency-bag
  VM; this is B1 read-only evidence, not runtime state/migrate integration.
- `node .claude/skills/run-seyma/verify-state-migration-boundary.mjs` — boots
  synthetic minimal/partial/rich/malformed states and checks migration
  preservation/idempotence; persistence is an in-memory observation only.
- `node .claude/skills/run-seyma/verify-state-adapter-contract.mjs` — verifies
  the scratch dependency-bag adapter contract without loading production state,
  persistence, or sync code.
- `panel.html` shares no code with `app.js`, so neither harness covers it;
  verify it with the syntax/script-tag-balance check documented in
  `.claude/skills/run-seyma/SKILL.md`, or read the diff carefully.
- If the change touches synced/persisted data, confirm `migrate()` still
  produces a valid object from an old (pre-change) save, and that the panel
  would render the new field sensibly (or at least not break) when it's
  absent.

`.claude/skills/run-seyma/SKILL.md` has the full harness details, gotchas
(why timers/fetch/DOMParser are stubbed dead), and a troubleshooting table.

## Git / deploy

- `main` is the production branch — every push to it redeploys GitHub Pages
  via `.github/workflows/pages.yml` (no build, no tests gate the deploy).
- Feature branches are commonly named after the "Faz" (phase) of
  `docs/GELISTIRME-PLANI.md` being implemented; commit messages are short,
  Turkish, and describe the phase/feature (e.g. `"Faz 7: iki haftada bir
  psikolojik tarama anketi"`).
