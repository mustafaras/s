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

1. **NEVER open the Şeyma app in a browser yourself, and never serve+open it
   generically to "check it runs."** Use the headless Node `vm` render
   harness instead — the `run-seyma` skill
   (`.claude/skills/run-seyma/driver.mjs`; see "Verification" below). Opening
   the app is the single most dangerous thing you can do here.
   **Narrow exception (2026-08-01, standing user permission):** if the user
   asks you to serve the app on **port 9000**, you may start a plain static
   file server bound to that port (e.g. `python3 -m http.server 9000` from
   the repo root) — this is pre-approved, no need to ask again each time.
   You still must never navigate a browser to it yourself; the user opens it
   in their own browser. Tell them to prefer a clean/incognito profile (no
   prior `seyma-reset-v1` in that profile's localStorage) so Guard 1/2 below
   aren't the only line of defense. Stop the server per rule 4 before ending
   your turn. This exception is scoped to port 9000 only — other ports/generic
   "let's just run it" requests are still covered by the rule above.
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

## Repo layout

```
index.html      Thin HTML shell. Loads styles.css, data modules,
                 app/core/constants.js, app.js, sync.js with cache-busting
                 `?v=YYYYMMDDx` query strings. Registers sw.js.
app/core/constants.js  Classic script loaded immediately before app.js;
                 exposes the extracted icon map and boot constants through
                 `window.SeymaConstants`.
app.js           The Şeyma runtime (single IIFE). It retains state, rendering,
                 feature logic, and the existing `App` surface during the
                 incremental L2 extraction.
motivationProgramV2.js  Standalone IIFE data module: 120-day "motivation
                 program" content (per-day Faz/task objects) plus helpers,
                 exposed as `window.MotivationProgramV2`. Loaded before
                 app.js but not yet consumed by it — UI/data-model
                 integration into app.js and panel.html is still in
                 progress (rollout plan lives in the untracked, local-only
                 `seyma_motivation_v2_package/` directory — don't commit it).
motivationNarratives.js Standalone narrative content module
                 (`window.MotivationNarratives`) for the program.
saygiPeople.js   Frozen data module of 100 "günün öncüsü" inspirational
                 figures (`window.SaygiPeople`) powering the Saygı /
                 İlham & İbadet tab (daily figure, Wikipedia fetch,
                 read-tracking).
profileAssessmentV1.js Frozen, hand-authored data module: single-session
                 174-item scientific profile assessment
                 (`window.ProfileAssessmentV1`) — sessions, consent schema,
                 instruments. Consumed by app.js's profile engine and merged
                 across devices by sync.js's `SeySync.mergeProfileAssessment`.
                 Do not hand-edit item content; it is versioned (`version`).
hijriCalendar.js Standalone Hicri (Islamic) calendar module
                 (`window.HijriCalendarV1`) — offset-based Miladi→Hicri
                 conversion + mübarek gün (holy day) lookup, consumed by
                 app.js's `hijriTodayStr`/`kandilBadgeFor`. User-adjustable
                 ±2 day offset via `settings.prayer.hijriOffset` for local
                 hilal (crescent) variance.
sync.js          Separate IIFE. Debounced push of `data` to the GitHub
                 Contents API (data/latest.json + data/gunluk/<date>.json).
                 Also owns conflict-merge helpers
                 (`SeySync.mergeProfileAssessment`).
panelCoverageManifest.js  Pure P1 coverage/redaction adapter. Defines the
                 manifest and builds/parses `data/observer-snapshot.json`;
                 no network, DOM, localStorage or raw secret/GPS/profile/media
                 output.
panel.html       Standalone "ÆON · Orchestration Core" observer dashboard.
                 Independent app — does NOT share code with app.js. Fetches
                 data/latest.json from GitHub with its own token/localStorage
                 key, dark/gold theme, can write to
                 data/observer-inbox.json / data/aeon-outbox.json.
panel.css        Panel-only stylesheet extracted from panel.html.
panel.js         Panel observer IIFE extracted from panel.html; helper names
                 and API flow remain compatible with the panel harness.
styles.css       Shared CSS variables (light/dark theme) + small set of
                 global rules/keyframes used by index.html's app.
sw.js            Service worker (PWA install + notificationclick routing);
                 manifest.json is the PWA manifest, aeon-icon-*.png the icons.
GELISTIRME-PLANI.md  Living Turkish roadmap/spec doc with a feature status
                 table (✅/🟡/❌) and the "teknik ilkeler" (technical
                 principles) new features must follow. Read it before adding
                 a feature; update its status table/changelog when a listed
                 item ships.
docs/roadmaps/SEYMA-V2-PLAN.md Living v2.0 redesign roadmap ("İçsel Pusula & Terapi
                 Odası") — Turkish, checkbox-driven; complements
                 GELISTIRME-PLANI.md.
docs/roadmaps/ILHAM-IBADET-GELISTIRME-PLANI.md  Living Turkish roadmap for the İlham &
                 İbadet hub expansion (Faz 35+): Zikirmatik, kıble/pusula,
                 hicri takvim, mübarek gün rozetleri, ibadet rapor sekmesi —
                 complements GELISTIRME-PLANI.md.
docs/roadmaps/KURAN-YOLCULUGU-GELISTIRME-PLANI.md
                    Living Turkish roadmap for Raşit ile Kur’an Yolculuğu.
docs/roadmaps/ZIKIRMATIK-GELISTIRME-PLANI.md
                    Living Turkish roadmap for Zikirmatik v2.
docs/README.md      Root Markdown inventory and canonical documentation index.
docs/REPO-ORGANIZASYON-VE-MODULERLESTIRME-PLANI.md
                    Root documentation and runtime modularization plan.
docs/REPO-M0-MARKDOWN-MANIFEST.md
docs/REPO-L0-RUNTIME-DEPENDENCY-MAP.md
                    M0/L0 inventory evidence manifests.
docs/ledgers/        Repo organization paired operations/state ledgers.
docs/archive/        Append-only historical AGENTS handoff archive.
docs/panel/         ÆON panel research/design plans, ordered anti-amnesia
                    prompts, and paired append-only ledgers.
test_faz10_sync.js   Committed headless Node harness: sync.js conflict-merge
                 tests with mocked window/localStorage/fetch (no network).
                 Run: `node test_faz10_sync.js`.
test_faz11_panel.js  Headless Node harness for panel.html helper/render
                 logic. Run: `node test_faz11_panel.js`.
test_panel_p0_sync.js Headless Node fixture for PANEL-01 receipt/revision,
                 anti-clobber and panel time/status projection. Run:
                 `node test_panel_p0_sync.js`.
test_panel_p1_projection.js Headless Node fixture for PANEL-02 coverage,
                 redaction, stale projection and legacy fallback. Run:
                 `node test_panel_p1_projection.js`.
test_panel_p3_root_modules.js Headless Node fixture for PANEL-03 root-module
                 projection/render, stale/missing/broken states, Saygı mismatch,
                 settings summary, privacy and no-mutation boundary. Run:
                 `node test_panel_p3_root_modules.js`.
test_panel_p4_provenance.js Headless Node fixture for PANEL-04 therapy
                 redaction, profile progress, notification lifecycle and
                 external fetch provenance. Run: `node test_panel_p4_provenance.js`.
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

There is **no `package.json`, no bundler, no framework, no test suite, and
no linter**. Everything is hand-written vanilla JS/HTML/CSS targeting
mobile Safari/Chrome (viewport ≤460px design).

## Architecture of `app.js`

- A single global mutable `data` object is the entire app state
  (`data.days[date]` per-day records, plus `settings`, `cycle`, `library`,
  `watchlist`, `music`, `luna`, `aeon`, etc.). It's loaded from
  `localStorage` under key `seyma-reset-v1` and passed through `migrate(d)`
  on load to backfill new fields for old saves — **always extend `migrate()`
  when adding a new field**, never assume it exists on old data.
- `save()` persists `data` to `localStorage` and calls
  `window.SeySync.schedule(data)` if sync.js is loaded.
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

## Conventions (see `GELISTIRME-PLANI.md` §"Uyulacak teknik ilkeler" for the
canonical Turkish version)

1. **One `data` object** — add new fields to `data`, not a separate store,
   so sync and the panel pick them up automatically.
2. **Theme via CSS variables**, not hardcoded hex — use `--read`, `--watch`,
   `--listen`, `--ok`, `--drop`, `--pause`, `--text`, `--muted`, etc. New
   accents need definitions in both the light block and the
   `#root[data-theme="dark"]` block in `styles.css`.
3. **Overlay pattern** for new hubs: mirror the reading/watching/listening
   template exactly (open/close handlers, `ui.xView`, segmented tabs).
4. **Panel mirror** — any new persistent user record should also render
   somewhere in `panel.html` (a bento card or a day-detail row), since the
   observer only ever sees what's reflected there.
5. **Cache busting** — bump the `?v=` query string on `styles.css`,
   `app.js`, and/or `sync.js` in `index.html` on every deploy that changes
   them, or the PWA/Pages CDN can serve stale assets.
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

There's no automated test suite or linter, but `node --check app.js` (or
`sync.js`, `hijriCalendar.js`, etc.) catches JS syntax errors first. Beyond
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
  `GELISTIRME-PLANI.md` being implemented; commit messages are short,
  Turkish, and describe the phase/feature (e.g. `"Faz 7: iki haftada bir
  psikolojik tarama anketi"`).
