# CLAUDE.md

Guidance for AI assistants (Claude Code and others) working in this repository.

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
index.html      Thin HTML shell. Loads styles.css, motivationProgramV2.js,
                 app.js, sync.js with cache-busting `?v=YYYYMMDDx` query
                 strings.
app.js           The entire Şeyma app (single IIFE, ~4.3k lines). Owns state,
                 rendering, and all feature logic.
motivationProgramV2.js  Standalone IIFE data module: 120-day "motivation
                 program" content (per-day Faz/task objects) plus helpers,
                 exposed as `window.MotivationProgramV2`. Loaded before
                 app.js but not yet consumed by it — UI/data-model
                 integration into app.js and panel.html is still in
                 progress (rollout plan lives in the untracked, local-only
                 `seyma_motivation_v2_package/` directory — don't commit it).
sync.js          Separate IIFE. Debounced push of `data` to the GitHub
                 Contents API (data/latest.json + data/gunluk/<date>.json).
panel.html       Standalone "ÆON · Orchestration Core" observer dashboard.
                 Independent app — does NOT share code with app.js. Fetches
                 data/latest.json from GitHub with its own token/localStorage
                 key, dark/gold theme, can write to
                 data/observer-inbox.json / data/aeon-outbox.json.
styles.css       Shared CSS variables (light/dark theme) + small set of
                 global rules/keyframes used by index.html's app.
GELISTIRME-PLANI.md  Living Turkish roadmap/spec doc with a feature status
                 table (✅/🟡/❌) and the "teknik ilkeler" (technical
                 principles) new features must follow. Read it before adding
                 a feature; update its status table/changelog when a listed
                 item ships.
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
`sync.js`) catches JS syntax errors before you even open a browser. To
validate a change beyond that:

- Serve the repo locally, e.g. `python3 -m http.server 8765`, then open
  `http://localhost:8765/index.html` (and `/panel.html` if relevant) —
  opening via `file://` can hit CORS issues on the GitHub API calls
  sync.js/panel.html make. Exercise the affected flow manually, in **both
  light and dark** theme.
- Watch the browser console for errors.
- If the change touches synced/persisted data, confirm `migrate()` still
  produces a valid object from an old (pre-change) save, and that the panel
  renders the new field sensibly (or at least doesn't break) when it's
  absent.

## Git / deploy

- `main` is the production branch — every push to it redeploys GitHub Pages
  via `.github/workflows/pages.yml` (no build, no tests gate the deploy).
- Feature branches are commonly named after the "Faz" (phase) of
  `GELISTIRME-PLANI.md` being implemented; commit messages are short,
  Turkish, and describe the phase/feature (e.g. `"Faz 7: iki haftada bir
  psikolojik tarama anketi"`).
