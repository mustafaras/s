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

1. **NEVER open or serve+open the Şeyma app in a browser to "check it runs."**
   Use the headless Node `vm` render harness instead (see "Verification" below
   and `CLAUDE.md`). Opening the app is the single most dangerous thing you can
   do here.
2. If you *must* use a real browser, it now self-protects: `sync.js` **blocks
   all pushes from `localhost`/`127.0.0.1`/`file:`/`*.local`** (Guard 1) and
   **blocks any push whose day-count is lower than the remote** (Guard 2,
   anti-clobber). Do not defeat these. The deliberate escape hatch is
   `localStorage.setItem('seyma-sync-force','1')` or `?forceSync=1` — only set
   it if you *intend* to overwrite real data and have a backup.
3. **Never write to `mustafaras/seyma-data` without explicit user consent.** It
   holds the only live copy of personal data. Reads are fine.
4. **Always stop any local server you start** (`pkill -f http.server`) before
   ending your turn.

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

2. **Handoff protocol** — Before ending your turn, update `AGENTS.md` § "Agent Handoff Log" (en üstten yeni giriş) and optionally session memory:
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

7. **Stop servers you start** — If you run `python3 -m http.server 8765`, you are responsible for `pkill -f http.server` before ending your turn. Don't leave servers running for the next agent.

## Project Structure

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
motivationProgramV2.js  120-day motivation program data module (window.MotivationProgramV2)
motivationNarratives.js Motivation program narrative content
saygiPeople.js          Respect/People module
sync.js                 GitHub Contents API sync (debounced push to data/latest.json)
panel.html              ÆON observer dashboard (independent app, reads data repo)
styles.css              CSS variables (light/dark themes) + global rules
GELISTIRME-PLANI.md     Living roadmap with feature status table (✅/🟡/❌) + technical principles
CLAUDE.md               Detailed AI assistant guidance (read for complex tasks)
.github/workflows/pages.yml  Deploys repo root to GitHub Pages on push to main
seyma_motivation_v2_package/  Local-only planning package (DO NOT COMMIT)
```

**No `package.json`, no bundler, no framework, no test suite, no linter.** Everything is hand-written vanilla JS/HTML/CSS targeting mobile Safari/Chrome (viewport ≤460px).

---

## Development Commands

**No install required.** All files are static.

### Syntax validation
```bash
node --check app.js
node --check sync.js
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

### Stop server
```bash
pkill -f http.server
```

> ⚠️ **Prefer headless render harness** over browser testing. See `CLAUDE.md` "Verification" section.

---

## Architecture (`app.js`)

**Single mutable `data` object** = entire app state:
- `data.days[date]` — per-day records (mood, sleep, food, steps, cycle, caffeine, gratitude, intention, etc.)
- `data.settings` — user preferences (ghToken, ghRepo, theme, haptics, etc.)
- `data.cycle`, `data.library`, `data.watchlist`, `data.music`, `data.luna`, `data.aeon`, etc.

**Key patterns:**
1. **Load:** `localStorage` key `seyma-reset-v1` → passed through `migrate(d)` to backfill new fields
2. **Save:** `save()` → localStorage + `window.SeySync.schedule(data)` if sync loaded
3. **Render:** `render()` rebuilds visible tab as HTML string → `#app.innerHTML` (no virtual DOM)
4. **Handlers:** Inline `onclick="App.xxx(...)"` → `App.<name> = function(...)` (global handlers)
5. **Ephemeral state:** `ui` object (which tab, overlay open, draft text) — NOT persisted
6. **Overlay pattern:** `openX()`/`closeX()` + `ui.xView` + `segTabs` (reading/watching/listening hubs)

**Always extend `migrate()` when adding new `data` fields** — never assume they exist on old saves.

---

## Coding Conventions

Follow existing style in `app.js`, `panel.html`, `styles.css`:

1. **One `data` object** — add new fields to `data`, not separate store (sync + panel auto-pick up)
2. **CSS variables** for colors — `--read`, `--watch`, `--listen`, `--ok`, `--drop`, `--pause`, `--text`, `--muted`. Define new accents in both light + dark blocks in `styles.css`.
3. **Overlay pattern** — mirror reading/watching/listening template exactly for new hubs
4. **Panel mirror** — new persistent records must render in `panel.html` (bento card or day-detail row)
5. **Cache busting** — bump `?v=` on `styles.css`, `app.js`, `sync.js` in `index.html` every deploy
6. **Privacy** — secrets (`ghToken`, `openaiKey`, `syncUrl`) stripped by `sync.js` `sanitize()` before push
7. **Language & tone** — Turkish, warm/informal ("Sevgili Günışığı", emoji-heavy). Match existing voice.
8. **Escape dynamic HTML** with `esc()` function
9. **No `addEventListener`** — use inline `onclick` + global `App.<handler>` pattern

---

## Testing & Verification

**No automated test suite.** Validate manually:

1. **Syntax:** `node --check app.js` (or `sync.js`)
2. **Clean browser context** — test affected flow in both light + dark themes
3. **Watch console** for errors
4. **Migration test** — confirm `migrate()` produces valid object from old (pre-change) save
5. **Panel test** — verify new field renders sensibly (or doesn't break) when absent
6. **Screenshot harness** — use `files/shot/` for visual regression (both themes)

---

## Git & Deployment

- **`main` = production** — every push redeploys GitHub Pages (no build/test gate)
- **Feature branches** — named after "Faz" (phase) from `GELISTIRME-PLANI.md`
- **Commit messages** — short, Turkish, feature-focused: `Faz 7: iki haftada bir psikolojik tarama anketi`
- **PRs** — include changed files, manual test notes, screenshots for UI changes, data migration impact

---

## Security

- **Never commit** real personal data, tokens, localStorage dumps, or private repo payloads
- **Runtime data** belongs in `mustafaras/seyma-data` (must remain private)
- **Keep `sync.js` sanitization** aligned with any new secret fields in `settings`

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

## Large Files

`app.js` (~4.3k lines), `index.html`, `panel.html` are large. Some lines extremely long (base64 icons).

**Strategy:**
- Use `grep_search` to locate function/section by name
- Read in bounded line ranges (not whole file)
- Use `replace_string_in_file` with 3-5 lines of context before/after

---

## Agent Handoff Log

> **Talimat:** Her session sonunda bu bölümün EN ÜSTÜNE yeni bir giriş ekle.
> Girişte: tarih, branch, değişen dosyalar, test sonuçları, deploy durumu ve
> bir sonraki session için kalan TODO'lar / bilinen sorunlar yazılsın.
> Böylece sonraki agentlar tüm repoyu okumak zorunda kalmaz.

---

### 2026-07-19 — Faz 12 (ÆON bildirimleri) + Faz 25 (Günün Fotoğrafı güvenilirliği)

**Branch:** `mustafaras-pwa-aeon-bildirim` → `main` squash-merge edildi.  
**Live sürüm:** `https://mustafaras.github.io/s/index.html` (`app.js?v=20260719b`)

**Bu session'da değişen dosyalar:**
- `app.js`
  - ÆON native bildirim izni banner'ı + Mesaj sekmesi nudge'ı (aç/kapa yok, tek dokunuşlu).
  - 2 dakikalık sessiz izin tekrar döngüsü (`startAeonPermissionLoop`).
  - `mergeInbox()` yeni gelen ÆON mesajı/yanıtı için `showNativeAeonNotification()` çağırır.
  - `migrate()`: `data.aeon.lastNotificationShownAt`, `data.settings.aeonNotifyPermission`, `data.settings.aeonNotifyBannerDismissedAt` backfill.
  - Günün Fotoğrafı güvenilirliği: gün değişince `data.dailyPhoto.fetchedAt` sıfırlanır; `visibilitychange`/`focus`/`pageshow` ile uygulamaya dönünce yeniden kontrol edilir; `maybeFetchDailyPhoto()` bugün güncelse erken çıkar.
- `index.html`
  - Cache-bump: `app.js?v=20260719b`, `sw.js?v=20260719a`, `manifest.json?v=20260719a`.
- `GELISTIRME-PLANI.md`
  - Faz 12 ve Faz 25 changelog girişleri eklendi.
- `AGENTS.md`
  - Bu "Agent Handoff Log" bölümü eklendi.

**Test/doğrulama sonuçları:**
- `node --check app.js` ✅
- `node --check sync.js` ✅
- `notification_harness.js` senaryoları ✅ (izin isteme, banner render, dismiss, Mesaj nudge)
- `daily_photo_harness.js` senaryoları ✅ (migrate fetchedAt sıfırlama, stale fetch, redundant fetch engelleme)
- GitHub Pages deploy başarılı (~12 sn).

**Bir sonraki session için notlar / TODO:**
- ÆON bildirimleri: gerçek iOS cihazda izin dialogu ve kilit ekranı görünümü henüz canlı test edilmedi (sadece headless harness). Kullanıcı isterse gerçek telefon testi planlanmalı.
- Günün Fotoğrafı: Wikimedia Commons API bozulursa/çevap vermezse fallback mekanizması yok; istenirse sabit bir yedek görsel listesi eklenebilir.
- `sw.js` `notificationclick` handler'ı ÆON mesaj sekmesine yönlendiriyor; desktop testi yapılmadı.
- `GELISTIRME-PLANI.md` durum tablosu güncel; yeni Faz seçilirse önce oradan devam edilir.

---

## Related Documentation

- [`CLAUDE.md`](CLAUDE.md) — Detailed AI assistant guidance, architecture deep-dive
- [`GELISTIRME-PLANI.md`](GELISTIRME-PLANI.md) — Feature roadmap + technical principles (Turkish)
- [`seyma_motivation_v2_package/README.md`](seyma_motivation_v2_package/README.md) — Motivation V2 package overview
