# Şeyma 🦩 — AI Agent Guidelines

**Project:** Private mood-tracking web app (Turkish, warm/informal tone) + ÆON observer dashboard  
**Deployment:** Static GitHub Pages (no build step)  
**Stack:** Vanilla JS/HTML/CSS, no bundler, no backend, no `package.json`

---

## ⚠️ DATA SAFETY — CRITICAL (read before any action)

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
   harness instead (see "Verification" below and `CLAUDE.md`). Opening the
   app is the single most dangerous thing you can do here.
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
4. **Always stop any local server you start** before ending your turn
   (`pkill -f http.server` on macOS/Linux; on Windows:
   `Get-Process -Name python* | Stop-Process` or `Ctrl+C` the terminal).

**Recovery (if data is clobbered anyway):** No data is truly lost — restore it.
The real data survives in (a) `seyma-data` git history — find the last
`sync: data/latest.json` commit that still has the full day set and restore its
blob to `data/latest.json` via the Contents API; and (b) the untouched
`data/gunluk/<date>.json` full snapshots (each wraps the entire `data` object
under keys `app/date/savedAt/data`). The user's phone is push-only source of
truth and is *not* cleared by a clobber, so it re-heals on its next sync — tell
the user to reopen the app there (and not to tap "Verileri sıfırla").

### Multi-Agent Coordination Rules

When working with multiple AI agents in parallel:

1. **One agent at a time for data-affecting changes** — Only one agent should make changes that touch `data` persistence, `sync.js`, or migration logic. Parallel changes risk race conditions in validation and testing.

2. **Handoff protocol** — Before ending your turn, update the top of
   `docs/archive/AGENTS-HANDOFF-LOG.md` (en üstten yeni giriş) and optionally
   session memory; root `AGENTS.md` yalnız güncel kuralları taşır:
   - What files you changed
   - What you tested (syntax check, migration, panel)
   - What still needs verification
   - Any concerns or edge cases you noticed

3. **Verify before handoff** — Each agent must complete full validation cycle before handing off:
   - `node --check app.js` (or `sync.js`)
   - Clean browser test in both light + dark themes (using headless harness)
   - Migration test with old data structure
   - Panel rendering test
   - Console error check

4. **Cache-bump coordination** — If multiple agents are editing CSS/JS files, coordinate the `?v=` version bump in `index.html`. Only bump once after all changes are merged, not per-agent.

5. **Session memory for state tracking** — Use `/memories/session/` to track:
   - Current phase from `GELISTIRME-PLANI.md`
   - Files modified in this session
   - Test results and screenshots taken
   - Known issues or TODOs for next agent

6. **Never assume another agent tested** — Each agent should re-run the full validation cycle even if the previous agent claimed it was tested. Trust but verify.

7. **Stop servers you start** — If you run a local server, you are responsible
   for stopping it before ending your turn (`pkill -f http.server` on
   macOS/Linux; `Get-Process -Name python* | Stop-Process` or `Ctrl+C` on
   Windows). Don't leave servers running for the next agent.

## Project Structure

```
index.html      Thin HTML shell. Loads styles.css, data modules,
                 app/core/constants.js, app.js, sync.js with cache-busting
                 `?v=YYYYMMDDx` query strings. Registers sw.js.
app/core/constants.js  Classic script loaded immediately before app.js;
                 owns the extracted icon map and boot constants through
                 `window.SeymaConstants`.
app.js           The Şeyma runtime (single IIFE). It keeps the existing state,
                 rendering, feature logic, and `App` surface while the L2
                 extraction proceeds incrementally.
motivationProgramV2.js  Standalone IIFE data module: 120-day "motivation
                 program" content (per-day Faz/task objects) plus helpers,
                 exposed as `window.MotivationProgramV2`. Loaded before
                 app.js but not yet consumed by it — UI/data-model
                 integration into app.js and panel.html is still in
                 progress (rollout plan lives in the untracked, local-only
                 `seyma_motivation_v2_package/` directory — don't commit it).
motivationNarratives.js Standalone narrative content module
                 (`window.MotivationNarratives`) for the motivation program.
saygiPeople.js   Frozen data module of 100 "günün öncüsü" inspirational
                 figures (`window.SaygiPeople`) powering the Saygı /
                 İlham & İbadet tab (daily figure, Wikipedia article fetch,
                 read-tracking).
profileAssessmentV1.js Frozen, hand-authored data module: single-session
                 174-item scientific profile assessment
                 (`window.ProfileAssessmentV1`) — sessions, consent schema,
                 instruments. Consumed by app.js's profile engine and
                 merged across devices by sync.js's
                 `SeySync.mergeProfileAssessment`. Do not hand-edit item
                 content; it is versioned (`version` field).
hijriCalendar.js Standalone Hicri (Islamic) calendar module
                 (`window.HijriCalendarV1`) — offset-based Miladi→Hicri
                 conversion + mübarek gün (holy day) lookup, consumed by
                 app.js's `hijriTodayStr`/`kandilBadgeFor`. User-adjustable
                 ±2 day offset via `settings.prayer.hijriOffset` for local
                 hilal (crescent) variance.
sync.js          Separate IIFE. Debounced push of `data` to the GitHub
                 Contents API (data/latest.json + data/gunluk/<date>.json).
                 Also owns conflict-merge helpers (e.g.
                 `SeySync.mergeProfileAssessment`).
panel.html       Standalone "ÆON · Orchestration Core" observer dashboard.
                 Independent app — does NOT share code with app.js. Fetches
                 data/latest.json from GitHub with its own token/localStorage
                 key, dark/gold theme, can write to
                 data/observer-inbox.json / data/aeon-outbox.json.
panel.css        Panel-only stylesheet extracted from panel.html; loaded by
                 the panel shell with an explicit cache-busting version.
panel.js         Panel observer IIFE extracted from panel.html; preserves the
                 existing helper names, inline App-free handlers and API flow.
styles.css       Shared CSS variables (light/dark theme) + small set of
                 global rules/keyframes used by index.html's app.
sw.js            Service worker (PWA install + notificationclick routing).
manifest.json    PWA manifest. aeon-icon-*.png are the ÆON/panel icons.
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
test_faz10_sync.js   Commit-ted headless Node harness: sync.js conflict-merge
                 tests with mocked window/localStorage/fetch (no network).
                 Run: `node test_faz10_sync.js`.
test_faz11_panel.js  Headless Node harness for panel.html helper/render
                 logic. Run: `node test_faz11_panel.js`.
.claude/skills/run-seyma/verify-state-helper-boundary.mjs
                 L2-b/B1 read-only empty/normalizer helper fixture; no app boot,
                 localStorage, sync.js or network. Run from repo root.
.claude/skills/run-seyma/verify-state-migration-boundary.mjs
                 L2-b/B2 synthetic black-box migrate parity fixture; memory-only
                 localStorage, no sync/network/private data.
.claude/skills/run-seyma/state-adapter-scratch.mjs + verify-state-adapter-contract.mjs
                 L2-b/B3 scratch-only dependency-bag contract; production graph dışı.
.claude/skills/run-seyma/  Data-safe headless verification skill — see
                 "Verification" below. `driver.mjs` is the core app.js
                 render harness; `zikr-harness.mjs` covers the İlham &
                 İbadet hub (zikirmatik, kıble, hicri takvim, ibadet rapor).
                 Both run app.js in `node:vm` with fetch/timers stubbed dead,
                 so zero network calls are possible — nothing can be pushed.
AGENTS.md        Parallel, tool-agnostic restatement of CLAUDE.md's rules
                 (same conventions, generic Agents-format doc). Keep both in
                 sync when a convention changes.
CLAUDE.md        Detailed AI assistant guidance — read for complex tasks.
.impeccable/     Local-only AI agent working notes (see its own docs).
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

## Conventions

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
`grep_search` to locate the relevant function/section by name before reading, and
read files in bounded line ranges rather than in full.

## Verification

There's no automated test suite or linter, but `node --check app.js` (or
`sync.js`, `hijriCalendar.js`, etc.) catches JS syntax errors first. Beyond
that, **do not serve+open the app in a browser** (see "DATA SAFETY" above) —
use the `run-seyma` skill's headless Node `vm` harnesses instead (also see
"Development Commands" below):

- `node .claude/skills/run-seyma/driver.mjs` — boots constants + `app.js` twice
  (onboarding + seeded state) and drives real interactions (tab switch,
  card toggle, theme toggle), asserting on the rendered HTML. Add
  `--dump <tabId>` to dump a tab's generated markup for inspection.
- `node .claude/skills/run-seyma/zikr-harness.mjs` — same approach for the
  İlham & İbadet hub (zikirmatik, kıble, hicri takvim, ibadet rapor).
- `panel.html` shares no code with `app.js`, so neither harness covers it;
  verify it with the syntax/script-tag-balance check documented in
  `.claude/skills/run-seyma/SKILL.md`, or read the diff carefully.
- If the change touches synced/persisted data, confirm `migrate()` still
  produces a valid object from an old (pre-change) save, and that the panel
  would render the new field sensibly (or at least not break) when it's
  absent.

## Git / deploy

- `main` is the production branch — every push to it redeploys GitHub Pages
  via `.github/workflows/pages.yml` (no build, no tests gate the deploy).
- Feature branches are commonly named after the "Faz" (phase) of
  `GELISTIRME-PLANI.md` being implemented; commit messages are short,
  Turkish, and describe the phase/feature (e.g. `"Faz 7: iki haftada bir
  psikolojik tarama anketi"`).

---

## Development Commands

**No install required.** All files are static.

### Syntax validation
```bash
node --check app.js
node --check sync.js
```

### Committed headless tests (no network, safe to run)
```bash
node test_faz10_sync.js   # sync.js conflict-merge harness (mocked fetch)
node test_faz11_panel.js  # panel.html helper/render harness
node test_quran_catalog.js # quranRevelationOrderV1.js katalog doğrulaması
node test_quran_transport.js # quranTransportV1.js taşıma sözleşmeleri
node .claude/skills/run-seyma/verify-state-helper-boundary.mjs
                            # L2-b/B1 isolated helper boundary fixture
node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
                            # L2-b/B2 synthetic migrate parity fixture
node .claude/skills/run-seyma/verify-state-adapter-contract.mjs
                            # L2-b/B3 scratch dependency-bag contract
```

### Local server (use sparingly — see DATA SAFETY)
```bash
python3 -m http.server 8765
# Access: http://localhost:8765/index.html (app), /panel.html (observer)
```

### Git checks
```bash
git status --short --branch
```

### Stop server (before ending your turn)
```bash
pkill -f http.server                          # macOS/Linux
Get-Process -Name python* | Stop-Process      # Windows PowerShell
```

> ⚠️ **Prefer the headless render harness** over browser testing — see the
> `.claude/skills/run-seyma/` skill (`driver.mjs` renders `app.js` inside a
> Node `vm` sandbox with mocked DOM/localStorage, both themes). Never open
> the app in a real browser to "check it runs" (see DATA SAFETY).

---

## Agent Workflows

### Adding a new feature
1. Read `GELISTIRME-PLANI.md` → check status table + "Uyulacak teknik ilkeler"
2. Add new fields to `data` object + extend `migrate()`
3. Add UI in appropriate tab/hub (follow overlay pattern if full-screen)
4. Mirror in `panel.html` (bento card or day-detail)
5. Update `styles.css` if new accent colors needed
6. Bump cache-busting `?v=` in `index.html`
7. Test: syntax check → clean browser → both themes → migration → panel
8. Update `GELISTIRME-PLANI.md` status table + changelog

### Fixing a bug
1. Grep for function/variable name in `app.js`
2. Read bounded line ranges (file is huge)
3. Make minimal change following existing patterns
4. Syntax check + manual test in clean browser
5. Verify no console errors

### Working with motivation program V2
- See `seyma_motivation_v2_package/` for integration plans, schemas, agent prompts
- **DO NOT COMMIT** this directory (local-only planning)
- Use `DETAILED_AGENT_PROMPT_PACK.md` for 30-step implementation workflow
- Data lives in `window.MotivationProgramV2` (exposed globally, not yet consumed by app.js)

---

## Historical Handoff Archive

The append-only tarihsel handoff kayıtları bu dosyaya taşındı. Güncel
çalışma ve veri güvenliği kuralları kök `AGENTS.md` içinde kalır.

Yeni handoff kayıtları yalnız bu arşive eklenir; eski bölümler değiştirilmez.

Arşiv taşıma sınırı REPO-M003 makbuzunda hash ile kanıtlanmıştır.

---
## Related Documentation

- [`CLAUDE.md`](CLAUDE.md) — Detailed AI assistant guidance, architecture deep-dive
- [`GELISTIRME-PLANI.md`](GELISTIRME-PLANI.md) — Feature roadmap + technical principles (Turkish)
- [`docs/README.md`](docs/README.md) — Root Markdown inventory and canonical documentation index
- [`docs/panel/README.md`](docs/panel/README.md) — ÆON panel anti-amnesia prompt order and paired ledgers
- [`docs/archive/AGENTS-HANDOFF-LOG.md`](docs/archive/AGENTS-HANDOFF-LOG.md) — append-only historical handoff archive
- [`seyma_motivation_v2_package/README.md`](seyma_motivation_v2_package/README.md) — Motivation V2 package overview
