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

### 2026-07-24 — 🌴 Tatil Modu Genişletme: kafein %25 + kriz odası dinleniyor + bilgi kutusu (onay bekliyor)

**Branch:** `mustafaras-fluffy-disco` → `main` squash-merge **yalnızca kullanıcı onayıyla** yapılacak; şu an canlıya alınmadı.

**Bu session'da değişen dosyalar:**
- `app.js`
  - `caffeineLimit(date,mode)` artık tarih alır ve `isVacationDay(date)` true ise mod limitini %25 artırır: standart 400→500, hassas 300→375, hamile 200→250 mg.
  - `habitProgress` ve `caffeineBlock` ilgili çağrılara aktif tarihi geçirir; kafein buton etiketleri dinamik limiti gösterir ("Standart 500").
  - Limit aşımı uyarısı tatil günü için özel mesajla ayrılır; yatmadan 6 saat önce son kafein hatırlatması korunur.
  - `App.openCrisis` tatil günlerinde modal açılışını engeller ("Tatil modunda kriz desteği dinleniyor 🦩").
  - `rasitActionsHTML()` tatil günlerinde kahve/tatlı/yemek kriz butonlarını gizler, yerine nazik "kriz odası dinleniyor" kartı gösterir.
  - `vacationCardHTML()` açıkken "neler esnetildi" bilgi kutusu ekler: su hedefi, uyku, adım, kafein ve gizli kriz butonları; altında nazik "Yine de yatmadan 6 saat önce son kafein" notu.
- `panel.html`
  - `caffeineInfoP(rec,date)` imzası tarih alır; `isVacationDayP(date)` true ise %25 artırılmış limiti döner.
  - `habitProgP` ve gün-detay çağrıları tarih geçirir.
  - Gün-detay kafein satırı tatil gününde "Kafein · tatilde esnetildi" ve limit değeri gösterir.
- `index.html`
  - Cache-bump: `?v=20260724a`.
- `GELISTIRME-PLANI.md`
  - Faz 31 satırı "Tatil Modu — premium pause + su hedefi 10 bardak + kafein/crisis genişletme" olarak güncellendi.
  - 2026-07-24 changelog girişi eklendi.
- `AGENTS.md`
  - Bu Agent Handoff Log girişi eklendi.

**Oluşturulan session artifact'leri (commit edilmeyecek):**
- `vacation-expansion-spec.md` — onaylı tasarım spec'i (kullanıcı tercihleri: sadece kafein esnet, kriz gizli, gerisi aynen kalsın).
- `vacation-expansion-harness.mjs` — headless Node `vm` testi; 19 assertion (kafein limit tatilde 400→500 / pasifte 400, kriz butonları tatilde gizli / pasifte görünür, bilgi kutusu render, `App.openCrisis` güvenli) tamamı PASS.

**Test/doğrulama sonuçları:**
- `node --check app.js` ✅
- `node --check sync.js` ✅
- `panel.html` inline script syntax check (4/4 script tag) ✅
- `vacation-expansion-harness.mjs` (headless Node `vm`) ✅: 19/19 assertion PASS.
- `.claude/skills/run-seyma/driver.mjs` (genel render regresyonu) ✅
- Herhangi bir tarayıcı açılmadı; `seyma-data`'ya yazma yapılmadı.
- Yerel demo server çalıştırılmadı.

**Bir sonraki adım / deploy öncesi notlar:**
- Kullanıcı onayı alınmadan `main`’e merge / canlıya deploy **yapılmayacak**.
- Onay öncesi: `vacation-expansion-harness.js` ve `run-seyma/driver.mjs` çalıştırılıp sonuçları eklenecek; eğer regresyon varsa düzeltilecek.
- Canlıya alındıktan sonra gerçek iPhone'da: Tatil kartı açılınca bilgi kutusunun göründüğü, kafein butonlarının dinamik limiti gösterdiği, kriz butonlarının tatil gününde gizlendiği, kapalı/planlanmamış günlerde eski haline döndüğü manuel test edilmeli.

---

### 2026-07-23 (fix) — Tatil Modu yerel testi: su hedefi + rozet senkronizasyonu düzeltildi

**Branch:** `mustafaras-panel-archive-sync` → `main` squash-merge **yapıldı**, canlıya alındı.

**Sorun:** Kullanıcı "Tatil Modu açık ama hiçbir yerde değişiklik olmuyor" şeklinde geri bildirdi. Yerel sunucu (`localhost:9000`) ve browser canvas ile test edildiğinde iki hata teşhis edildi:
1. **Su hedefi senkronizasyonu eksik:** `App.setVacationEnabled` / `setVacationStart` / `setVacationEnd` sadece `updateCardByKey('vacation')` çağırıyordu. Su kartı ve hero Su tile'ı ayrı render edildiği için tatil durumu değişse bile su hedefi 8/10 olarak kalmıyordu.
2. **Rozet/buton UX karışıklığı:** `enabled` switch ile `AKTİF` rozet aynı anlama geliyordu; bugün tatil aralığında olmayan açık bir tatil "KAPALI" gözüküyordu.

**Bu session'da değişen dosyalar:**
- `app.js`
  - `App.setVacationEnabled`, `App.setVacationStart`, `App.setVacationEnd` artık `render()` çağırıyor (eski `updateCardByKey('vacation')` yerine). Böylece tatil durumu değişince su hedefi (Su kartı + hero Su tile'ı), seri sayacı ve diğer türetilmiş göstergeler anında güncelleniyor.
  - Rozet durumları ayrıştırıldı: bugün tatil aralığındaysa `AKTİF`, açık ama gelecekteyse `Planlandı`, kapalıysa `Kapalı`. Buton metni `Aç`/`Kapat`.
  - `ensureVacationSettings()` referans güvenliği korunuyor.
- `index.html`
  - Cache-bump: `?v=20260723b`.
- `GELISTIRME-PLANI.md`
  - 2026-07-23 changelog girişi güncellendi (yerel test fix notları).
- `AGENTS.md`
  - Bu Agent Handoff Log girişi eklendi / güncellendi.

**Oluşturulan session artifact'leri (commit edilmeyecek):**
- `C:\Users\m_ras\.copilot\session-state\4079ff2f-3bea-48af-8b3f-598e3bfe4b8d\files\vacation-harness.js` — headless Node `vm` testi; 25 assertion (su hedefi 8→10→8, rozet durumları, kart render/expand, migrate backfill, tatil gününde streak pause) tamamı PASS.

**Test/doğrulama sonuçları:**
- `node --check app.js` ✅
- `node --check sync.js` ✅
- `vacation-harness.js` (headless Node `vm`) ✅: 25/25 assertion PASS.
- `.claude/skills/run-seyma/driver.mjs` (genel render regresyonu) ✅
- Browser canvas (`http://localhost:9000/index.html`) ✅: AKTİF durumda Su 0/10, Kapalı durumda Su 0/8, Planlandı durumda Su 0/8 doğrulandı.
- Herhangi bir tarayıcı açılmadı (browser canvas kullanıldı); `seyma-data`'ya yazma yapılmadı.
- Yerel demo server `python3 -m http.server 9000` başlatılıp test edildi; session kapanmadan önce durduruldu.

**Bir sonraki adım / deploy öncesi notlar:**
- Canlıya alındıktan sonra gerçek iPhone'da tatil kartının Günışığı hava kartının hemen üstünde göründüğü, açılıp tarih/preset/not girişi yapılabildiği, su hedefinin otomatik 10 bardağa çıktığı ve kapalı/planlandı durumlarında 8 kaldığı manuel test edilmeli.

---

### 2026-07-23 — 🌴 Tatil Modu: premium pause + su hedefi 10 bardak + panel aynası (canlıya alındı)

**Branch:** `mustafaras-panel-archive-sync` → `main` squash-merge **yapıldı**, canlıya alındı. (Aynı branch üzerinde daha önceki panel arşiv senkronizasyonu + boot persistence fix'i zaten `main`de.)

**Bu session'da değişen dosyalar:**
- `app.js`
  - `migrate()` içine `data.settings.vacation` backfill eklendi (`enabled`, `startAt`, `endAt`, `preset`, `reason`).
  - `VACATION_WATER_GOAL=10` sabiti ve `waterGoalCups(date)` helper eklendi; su hedefi `WATER_GOAL` sabitini kullanan tüm render/hesaplama noktalarına dinamik çevrildi.
  - `isVacationDay(date)` / `vacationSettings()` helper'ları eklendi.
  - `currentStreak()` ve `bestStreak()` içine tatil günü pause mantığı eklendi; seri kırılmıyor, sadece duraklıyor.
  - Günışığı hava durumu kartının hemen üstüne `vacationCardHTML()` fonksiyonu eklendi; ince, premium, nefes/shimmer'lı kart tasarımı. `CARD_BUILDERS['vacation']` kaydı ve `App.toggleCard('vacation')` / `App.toggleVacation()` / `App.setVacation(...)` handler'ları eklendi.
  - Kart açıkken tarih inputları (`startAt`, `endAt`), preset seçici (`relaxed`/`moderate`/`active`) ve not alanı görünür; kapalıyken sadece badge + özet görünür.
  - `App.toggleCard` DOM'da kartı bulamazsa tam `render()` yapma fallback'i eklendi (headless test uyumluluğu + robustluk).
- `styles.css`
  - Açık ve koyu tema `:root` bloklarına `--vacation` accent değişkenleri ve `seyShimmer` keyframe eklendi.
- `panel.html`
  - Panel `:root` içine `--vacation` değişkenleri eklendi.
  - `vacationSettingsP()` / `isVacationDayP()` / `waterGoalCupsP()` helper'ları eklendi; su hedefi ve streak pause mantığı panelde de çalışıyor.
  - Yeni "🌴 Tatil Modu" bento KPI kartı eklendi: aktif/pasif durum, başlangıç-bitiş tarihleri, preset ve not.
  - Seçili gün detayında tatil günü rozet chip'i eklendi.
- `index.html`
  - Cache-bump: `?v=20260723b`.
- `GELISTIRME-PLANI.md`
  - Faz 31 "🌴 Tatil Modu — premium pause + su hedefi 10 bardak" satırı ✅ olarak eklendi; changelog ve son güncelleme tarihi güncellendi.
- `AGENTS.md`
  - Bu Agent Handoff Log girişi eklendi.

**Oluşturulan session artifact'leri (commit edilmeyecek):**
- `session-state/.../files/vacation-harness.js` — headless Node `vm` testi; 25 assertion (su hedefi 8→10, kart render/expand, migrate backfill, tatil gününde streak pause) tamamı PASS.

**Test/doğrulama sonuçları:**
- `node --check app.js` ✅
- `node --check sync.js` ✅
- `node --check motivationProgramV2.js` ✅
- `node --check saygiPeople.js` ✅
- `node --check motivationNarratives.js` ✅
- `vacation-harness.js` (headless Node `vm`) ✅: 25/25 assertion PASS.
- `.claude/skills/run-seyma/driver.mjs` (genel render regresyonu) ✅
- Herhangi bir tarayıcı açılmadı; `seyma-data`'ya yazma yapılmadı.
- Yerel demo server çalıştırılmadı.

**Bir sonraki adım / deploy öncesi notlar:**
- Canlıya alındıktan sonra gerçek iPhone'da tatil kartının Günışığı hava kartının hemen üstünde göründüğü, açılıp tarih/preset/not girişi yapılabildiği, su hedefinin otomatik 10 bardağa çıktığı ve streak hesabının tatil günlerini kırmadığı manuel test edilmeli.
- Eski kayıtlarda `data.settings.vacation` olmayan kullanıcı verileri `migrate()` ile otomatik backfill alacak; boot persistence fix'i sayesinde açılışta `save()` ile senkronize olacak.

---

### 2026-07-22 (fix) — Panel arşiv senkronizasyonu: migrate backfill boot'ta kalıcılaştırılıyor

**Branch:** `mustafaras-panel-archive-sync` → `main` squash-merge **yapıldı**, canlıya alındı.

**Sorun:** Kullanıcı deploy sonrası panelde eski okuma/izleme/dinleme kayıtlarının hâlâ görünmediğini bildirdi. Neden: `migrate()` içindeki `backfillArchivesFromDays(d)` arşiv kataloglarını sadece bellekte (in-memory) dolduruyordu; uygulama açılışında `render()`'dan sonra otomatik `save()` çağrısı olmadığı için değişiklik localStorage'a ve `seyma-data` GitHub reposuna senkronize olmuyordu.

**Bu session'da değişen dosyalar:**
- `app.js`
  - Açılış sonunda `render();` çağrısından hemen sonra `if(data){ save(); }` eklendi. Böylece `migrate()` sonrası oluşan arşiv backfill'i ilk açılışta kalıcılaşıyor ve senkronize ediliyor.
- `index.html`
  - Cache-bump: `?v=20260722e`.
- `AGENTS.md`
  - Bu Agent Handoff Log girişi eklendi.

**Oluşturulan session artifact'leri (commit edilmeyecek):**
- `session-state/.../files/boot-persist-harness.js` — headless Node `vm` testi; eski veride yalnızca günlük kaydı olan günlerle boot edildiğinde, `migrate()` arşiv kataloglarını doldurduktan sonra `save()` çağrısının bu katalogları localStorage'a yazdığını ve `SeySync.schedule(data)` ile senkronizasyonun tetiklendiğini doğrular.

**Test/doğrulama sonuçları:**
- `node --check app.js` ✅
- `node --check sync.js` ✅
- `archive-sync-harness.js` (headless Node `vm`) ✅: 27/27 assertion PASS.
- `boot-persist-harness.js` (headless Node `vm`) ✅: 8/8 assertion PASS.
- `.claude/skills/run-seyma/driver.mjs` (genel render regresyonu) ✅
- Herhangi bir tarayıcı açılmadı; `seyma-data`'ya yazma yapılmadı.
- Yerel demo server çalıştırılmadı.

**Deploy durumu:**
- `main`e squash-merge edildi ve pushlandı. GitHub Pages otomatik deploy edecek (`app.js?v=20260722e`).

**Bir sonraki adım / kullanıcıya not:**
- Telefonda uygulamayı bir kez kapatıp açmak yeterli. Yeni `app.js` yüklendiğinde `migrate()` eski günlük kayıtlarını arşiv kataloglarına aktaracak, ardından `save()` ile localStorage + `seyma-data`'ya yazacak.
- Paneli bir dakika sonra yenileyince Kütüphane / İzleme Arşivi / Dinleme Arşivi kartlarının dolmaya başladığı görülebilir.
- Eğer hâlâ görünmezse telefon tarayıcı/PWA önbelleğinin henüz güncellenmemiş olması muhtemeldir; bu durumda sayfayı yenilemek veya uygulamayı kapatıp açmak gerekir.

---

### 2026-07-22 — Panel arşiv senkronizasyonu: okuma/izleme/dinleme kayıtları otomatik arşive promote ediliyor (onay bekliyor)

**Branch:** `mustafaras-panel-archive-sync` → `main` squash-merge **yapıldı**, canlıya alındı (ilk deploy sonrası kullanıcı geri bildirimiyle yukarıdaki fix eklendi).

**Bu session'da değişen dosyalar:**
- `app.js`
  - Günlük kayıtlar (okuma/izleme/dinleme) ile arşiv katalogları arasında otomatik senkronizasyon eklendi.
  - Yeni helper'lar: `normalizeMatch`, `findBookByEntry`, `findTitleByEntry`, `findTrackByEntry`, `syncEntryToLibrary`, `syncEntryToWatchlist`, `syncEntryToMusic`, `backfillArchivesFromDays`.
  - `App.addReading`: günlük okuma kaydı girildiğinde mevcut kitapla eşleştirir veya yeni `library.books` öğesi oluşturur; `bookId` bağlantısı kurar ve `bumpBookProgress` ile ilerlemeyi günceller.
  - `App.addWatching`: günlük izleme kaydı girildiğinde mevcut başlıkla eşleştirir veya yeni `watchlist.items` öğesi oluşturur; `itemId` bağlantısı kurar, filmleri otomatik `finished`, dizileri bölüm sayısına göre günceller.
  - `App.addListening`: günlük dinleme kaydı girildiğinde mevcut parçayla eşleştirir veya yeni `music.items` öğesi oluşturur; `itemId` bağlantısı kurar.
  - `migrate()`: eski kayıtlardaki günlük reading/watching/listening girişlerini geriye dönük olarak arşiv kataloglarına promote eder ve her girişi ilgili arşiv öğesine bağlar.
- `index.html`
  - Cache-bump: `app.js?v=20260722d`.
- `AGENTS.md`
  - Bu Agent Handoff Log girişi eklendi.

**Oluşturulan session artifact'leri (commit edilmeyecek):**
- `session-state/.../files/archive-render-harness.js` — panel.html arşiv kartlarının sadece `library.books` / `watchlist.items` / `music.items`'den okuduğunu ve günlük kayıtlarla otomatik doldurulmadığını gösteren diagnostic simülasyon (önceki phase'den).
- `session-state/.../files/archive-sync-harness.js` — headless Node `vm` testi; `App.addReading`/`addWatching`/`addListening` ile girilen yeni kayıtların arşiv kataloglarına otomatik eklendiğini, aynı başlık/yazar/artist/tür'e sahip girişlerin kopya oluşturmadığını, `migrate()`'in eski günlük kayıtları geriye dönük bağladığını ve bu sayede panel arşiv kartlarının dolu göründüğünü doğrular.

**Test/doğrulama sonuçları:**
- `node --check app.js` ✅
- `node --check sync.js` ✅
- `archive-sync-harness.js` (headless Node `vm`) ✅: 27/27 assertion PASS.
- `.claude/skills/run-seyma/driver.mjs` (genel render regresyonu) ✅
- Herhangi bir tarayıcı açılmadı; `seyma-data`'ya yazma yapılmadı.
- Yerel demo server çalıştırılmadı.

**Bir sonraki session / deploy öncesi notlar / TODO:**
- Kullanıcı onayı alınmadan `main`’e merge / canlıya deploy **yapılmayacak**.
- Onay sonrası merge öncesi son bir kez `node --check app.js` + `archive-sync-harness.js` + `driver.mjs` çalıştırılmalı.
- Gerçek iPhone'da Bugün ekranından yeni okuma/izleme/dinleme kaydı girildiğinde ilgili arşiv öğesinin oluştuğu ve paneldeki Kütüphane / İzleme Arşivi / Dinleme Arşivi kartlarında göründüğü manuel test edilmeli.
- Eski veride yalnızca günlük kaydı olan (arşiv öğesi olmayan) günlerin, uygulama açıldığında `migrate()` ile otomatik arşive promote edildiği canlı veride gözlemlenmeli.
- Bu değişiklik CSS veya panel.html içermiyor; panel arşiv kartları zaten kataloglardan okuduğu için otomatik olarak doluyor.

---

### 2026-07-22 (devam) — Günlük Işığı: premium lavanta journal + 8 bilimsel mod + panel aynası (onay bekliyor)

**Branch:** `mustafaras-reimagined-train` → `main` squash-merge **yalnızca kullanıcı onayıyla** yapılacak; şu an canlıya alınmadı. Kriz modalı revizyonuyla aynı branch üzerinde ilerleniyor, ikisi birlikte veya ayrı ayrı deploy edilebilir.

**Bu session'da değişen dosyalar:**
- `app.js`
  - `data.days[date].journal` veri modeli eklendi (`text`, `mode`, `promptUsed`, `wordCount`, `charCount`, `savedAt`, `streakAtSave`, `metGoal`); `migrate()` ile eski kayıtlara backfill.
  - 8 bilimsel günlük modu: Serbest Akış, Duygu Adlandırma, 3 Güzel Şey, Günün Kazanımı, Öz-Şefkat, Bilişsel Yeniden Değerleme, Değer Bağlantısı, Dürtü Dalga Geçişi. Her modun kısa bilimsel ipucu kartı var.
  - 120 günlük motivasyon programı fazına göre otomatik prompt önerisi (`journalActivePhase()`).
  - Günlük yazma hedefi (30 kelime / 140 karakter) ve üst üste gün streak'i; hedefe ulaşınca `metGoal` rozetleniyor.
  - Bugün ekranındaki not kartına belirgin "Günlük Işığı'nı aç 🦩" butonu; yazılmış günlük varsa durum değişiyor.
  - Günışığı kartının altına ince, animasyonlu, nefes alan glow'lu "Günlük Işığı" satır kartı eklendi.
  - Tam ekran modal (kriz modalı iskeleti): header, faz rozet kartı, mod seçici chip grid, prompt alanı, bilimsel ipucu, büyük textarea, kelime/karakter sayısı ve hedef ilerleme çubuğu, kaydet/güncelle butonu.
  - `journaled` tiki `data.days[date].note` veya `data.days[date].journal.text` varlığına göre otomatik yeşilleniyor (`syncDerivedHabits`).
- `styles.css`
  - Lavanta accent değişkenleri `--journal`, `--journal2`, `--journal-bg`, `--journal-glow` (hem açık hem koyu tema).
  - İnce animasyonlu Günlük Işığı kartı, modal mod chip'leri, textarea glow ve shimmer keyframes.
- `panel.html`
  - Yeni "Günlük Işığı" bento KPI kartı: aktif journal streak, bu ay kaç gün yazıldı, toplam kelime, son entry tarihi ve aktif 120-gün fazı.
  - `journaled` tiki artık `rec.note || rec.journal.text` varlığını kabul ediyor.
  - Seçili gün detayında "Günün Notu / Günlük Işığı" bölümü: eski not ve yeni journal ayrı ayrı, journal için lavanta accent kutusu.
  - "Son Notlar" kartı artık journal metinlerini de listeliyor; journal girişleri "🪶 Günlük Işığı" etiketiyle, eski notlar "📝 Not" etiketiyle ayrılıyor.
  - Panel CSS `:root` içine `--journal` lavanta değişkenleri eklendi.
- `index.html`
  - Cache-bump: `styles.css?v=20260722c`, `app.js?v=20260722c`, `sync.js?v=20260722c`.
- `AGENTS.md`
  - Bu Agent Handoff Log girişi eklendi.

**Oluşturulan session artifact'leri (commit edilmeyecek):**
- `session-state/.../files/journal-harness.mjs` — headless Node `vm` testi; Günlük Işığı kartının ve modalının render edildiğini, 8 mod chip'inin varlığını, prompt/ilerleme çubuğunun çalıştığını, metin kaydının `data.days[date].journal`'e yazıldığını, `journaled` tikinin otomatik yeşillendiğini ve re-open'da kaydedilmiş metni gösterdiğini doğrular.

**Test/doğrulama sonuçları:**
- `node --check app.js` ✅
- `node --check sync.js` ✅
- `panel.html` inline script syntax check (4/4 script tag) ✅
- `.claude/skills/run-seyma/driver.mjs` (genel render regresyonu) ✅
- `journal-harness.mjs` (headless Node `vm`) ✅: tüm assertion PASS.
- `crisis-harness.mjs` önceki session'dan ✅ (kriz modalı değişikliği bozulmadı).
- Herhangi bir tarayıcı açılmadı; `seyma-data`'ya yazı yapılmadı.
- Yerel demo server durdurulmuş durumda.

**Son düzeltmeler (bu session devamı):**
- Günlük Işığı ince kartı Günışığı hava durumu kartının hemen altına taşındı (`bugunHTML` sıralaması: `weatherHeaderHTML` → `journalLightCardHTML` → `dailyPhotoCardHTML` → `rasitBubbleHTML`).
- Faz etiketindeki "Faz 1 — Faz 1 — Fark Etme" tekrarı giderildi: yeni `phaseDisplay()` ve `phaseShortTitle()` helper'ları, `motivationProgramV2.js`'nin zaten "Faz X — Başlık" formatında dönen `phaseTitle`'ını doğal şekilde kısaltıyor veya eksikse ön ekliyor.
- Düzeltmeler sonrası `node --check app.js` + `journal-harness.mjs` + `run-seyma/driver.mjs` tekrar PASS; kart sırası dump üzerinden doğrulandı.

**Bir sonraki session / deploy öncesi notlar / TODO:**
- Kullanıcı onayı alınmadan `main`’e merge / canlıya deploy **yapılmayacak**.
- Kriz modalı revizyonu ve Günlük Işığı aynı branch'te; kullanıcı isterse tek squash-merge ile birlikte, isterse önce kriz modallarını ayrı deploy edip sonra Günlük Işığı ekleyebiliriz.
- Onay sonrası merge öncesi son bir kez `node --check app.js` + `crisis-harness.mjs` + `journal-harness.mjs` + `driver.mjs` çalıştırılmalı.
- Gerçek iPhone'da Günlük Işığı butonu, modal açılışı, mod switch, textarea, kaydetme, hedef rozet ve ince kart animasyonu manuel test edilmeli.
- `panel.html` canlı veride journal KPI kartı ve gün detayının düzgün render edildiği gözlemlenmeli; eski sadece `note` içeren günlerde uyumlu kaldığı doğrulanmalı.

---

### 2026-07-22 — Kriz modalları: sayaçsız, duygu-öncelikli, premium dropdown'lu otomatik tamamlama (onay bekliyor)

**Branch:** `mustafaras-reimagined-train` → `main` squash-merge **yalnızca kullanıcı onayıyla** yapılacak; şu an canlıya alınmadı.

**Bu session'da değişen dosyalar:**
- `app.js`
  - `CRISES` konfigürasyonundan `secs`, `clockLabel`, `startLabel`, `doneToast` gibi tüm sayaç alanları kaldırıldı; kahve, tatlı ve yemek kriz metinleri duygu farkındalığına (affect labeling) odaklanacak şekilde yeniden yazıldı.
  - `crisisModalHTML()` içindeki büyük sayaç/geri sayım bloğu tamamen çıkarıldı.
  - "Şu an içinde ne hissediyorsun?" not kartı Raşit sözünün hemen altına taşındı; gradient accent border, belirgin textarea ve bilimsel teşvik metni (amigdala → prefrontal korteks) ile öne çıkarıldı.
  - "Bu krizi ne tetikliyor?" ve "Şu an ne denedin?" bölümleri premium açılır/kapanır dropdown kartlara alındı. Her dropdown başlığında seçim özeti, dönen chevron, seçili durumda accent border/gölge ve mevcut tasarım diline uygun yuvarlak checkbox'lar var.
  - Alt sabit eylem çubuğundaki "başlat/söz ver" butonu kaldırıldı; yerine her zaman aktif "Krizi kaydet" butonu kondu. Modal kapandığında "Tamam, kapat" butonu gösteriliyor.
  - `App.openCrisis`: modal açıldığında `cravingSOSCount` artırır ve kaydeder; aynı zamanda dropdown durumlarını (`ui.crisisTrigOpen`, `ui.crisisTriedOpen`) sıfırlar.
  - `App.toggleCrisisDropdown('trig' | 'tried')`: dropdown kartları açıp kapatır; `ui` state'inde `crisisTrigOpen` / `crisisTriedOpen` tutulur.
  - `App.completeCrisis`: idempotent tamamlama fonksiyonu; ilk girişte toast gösterir, sonraki güncellemelerde sessizce kaydeder. Seçili tetikleyiciler, stratejiler ve not ilgili `data.days[date]` alanlarına (`cravingTriggers`, `cravingOptionsUsed`, `cravingTriggerNote`) yazar; `craving10MinDone` / `foodCravingDone` / `coffeeCravingDone` alanlarını `true` yapar.
  - `App.toggleCrisisTrigger`, `App.toggleCrisisOpt` ve `App.onCrisisNote` (debounced 700 ms) artık her kullanıcı girişinde otomatik olarak `App.completeCrisis()` çağırır; yani tetikleyici seçmek, strateji seçmek veya not yazmak ilgili kriz tiki anında yeşillendirir.
  - `App.resetCrisis`: sadece modal içi geçici seçimleri (`ui.crisisTriggers`, `ui.crisisOpts`, `ui.crisisNote`) ve dropdown durumlarını temizler; tiklenmiş kaydı silmez.
  - `crisisInterval` global değişkeni ve `ui.crisisLeft` / `ui.crisisTiming` kaldırıldı.
- `index.html`
  - Cache-bump: tüm asset `?v=20260722b`.
- `AGENTS.md`
  - Bu Agent Handoff Log girişi eklendi / güncellendi.

**Oluşturulan session artifact'leri (commit edilmeyecek):**
- `session-state/.../files/crisis-harness.mjs` — headless Node `vm` testi; kriz modalının sayaç içermediğini, duygu/not bölümü ve premium dropdown'ları render ettiğini, tetikleyici/strateji/not girişlerinin ilgili tiki otomatik yeşillendirdiğini doğrular.

**Test/doğrulama sonuçları:**
- `node --check app.js` ✅
- `node --check sync.js` ✅
- `.claude/skills/run-seyma/driver.mjs` (genel render regresyonu) ✅: onboarding, seeded state, tab/theme geçişleri çalışıyor.
- `crisis-harness.mjs` (headless Node `vm`) ✅: 14/14 assertion PASS.
- Herhangi bir tarayıcı açılmadı; `seyma-data`'ya yazı yapılmadı.
- Kullanıcı isteğiyle yerel demo server `python3 -m http.server 8765` çalışıyor; session kapanmadan önce durdurulacak.

**Bir sonraki session / deploy öncesi notlar / TODO:**
- Kullanıcı onayı alınmadan `main`’e merge / canlıya deploy **yapılmayacak**.
- Onay sonrası merge öncesi son bir kez `node --check app.js` + `crisis-harness.mjs` + `driver.mjs` çalıştırılmalı.
- Gerçek iPhone'da kahve/tatlı/yemek kriz butonlarına dokunulduğunda modalın açıldığı, not alanının ve dropdown'ların premium göründüğü, herhangi bir girişin tiki yeşillendirdiği manuel test edilmeli.
- Panel (`panel.html`) bu değişiklikten etkilenmedi; kriz tetikleyici notları zaten gün detayında gösterilmiyordu. İstenirse panelde kriz kayıtlarına ayrı bir bento kart eklenebilir.

---

### 2026-07-21 — Faz 30: ÆON bildirim spam fix (canlıya alınacak)

**Branch:** `mustafaras-crispy-couscous` → `main` squash-merge edilecek.

**Bu session'da değişen dosyalar:**
- `app.js`
  - ÆON native bildirim spam fix: `showNativeAeonNotification()` artık `opts.id` bazlı oturum içi `aeonShownThisSession` set'i ve kalıcı `data.aeon.shownNotificationIds` dizisini kontrol ediyor; daha önce gösterilmiş mesaj tekrar gösterilmiyor. 5 sn cooldown (`AEON_NOTIFY_COOLDOWN_MS`) eklenerek ardışık farklı mesajların patlaması engellendi. `renotify` `false` yapıldı. `shownNotificationIds` en fazla 50 id tutacak şekilde sınırlandı.
  - Kullanıcı zaten `mesaj` sekmesini açık görüyorsa native bildirim atlanıyor (`ui.tab==='mesaj'` kontrolü).
  - `mergeInbox()` çağrı noktaları korundu; aynı mesaj/yanıt için ikinci native notify tetiklenmiyor.
- `index.html`
  - Cache-bump: `styles.css?v=20260721b`, `app.js?v=20260721b`, `sync.js?v=20260721b`.
- `GELISTIRME-PLANI.md`
  - 2026-07-21 changelog girişi güncellendi; Faz 30 satırı "🔔 ÆON bildirim spam fix" olarak yeniden adlandırıldı. Uygulama askıya alma ekranı bu sürüme dahil edilmedi.
- `AGENTS.md`
  - Bu Agent Handoff Log girişi eklendi.

**Test/doğrulama sonuçları:**
- `node --check app.js` ✅
- `node --check sync.js` ✅
- `notification_dedup_harness.js` (headless Node `vm`) ✅: aynı id tekrar gösterilmiyor, farklı id 5 sn cooldown bekliyor, `renotify:false`, 50 id limiti, mesaj sekmesi aktifken notify atlamıyor.
- Herhangi bir yerel sunucu açılmadı; tarayıcı açılmadı.

**Bir sonraki session / deploy öncesi notlar / TODO:**
- Kullanıcı onayı ile `main` squash-merge edilecek; GitHub Pages otomatik deploy edecek.
- Canlıya alındıktan sonra gerçek iPhone'da ÆON mesajı geldiğinde aynı mesajın tekrarlanmadığı doğrulanmalı.
- Uygulamayı askıya alma (dondurma) ekranı ayrıca değerlendirilecek; şu anki branch'te dondurma kodu kalmadı.

---

### 2026-07-20 — Faz 29: Terapi Odası Premium Genişletme canlıya alındı

**Branch:** `mustafaras-bilimsel-profil-terapi-odasi` → `main` squash-merge edildi.  
**Live sürüm:** `https://mustafaras.github.io/s/index.html` (`app.js?v=20260720f`)

**Bu session'da değişen dosyalar:**
- `app.js`
  - Terapi Odası overlay'i 3 sekmeye (`Yol`, `Araçlar`, `Profilim`) bölündü.
  - `ROOM_CONTENT_CATALOG` eklendi (~88 öğe: kitap, izleme, podcast). İçerikler her gerçek takvim gününe göre `roomCalendarDayIndex()` ile döner; `data.roomContentHistory` ile hangi gün ne gösterildiği izlenir.
  - Tüm öneri bağlantıları Türkçe/güvenilir kaynaklara çevrildi (idefix, Netflix TR, Disney+ TR, Prime Video TR, Spotify TR) ve `target="_blank" rel="noopener noreferrer"` ile yeni sekmede açılıyor.
  - `App.updateRoom()` ile soft DOM güncellemesi eklendi; sekme değişimi ve araç kartı açılış/kapanış tam `render()` yenilemesi yapmadan `#sey-room-body` ve `#sey-room-tabs` içeriğini değiştirir. Bu sayede flash/flicker önlendi.
  - Demo-only kodlar temizlendi: `App.demoAuthBypass` ve butonu kaldırıldı; `migrate()` içindeki demo bilimsel profil backfill'i boş iskelete indirgendi (prod'da kullanıcı "Profili çek" ile kendi raporunu getirir).
- `index.html`
  - Cache-bump: `styles.css?v=20260720f`, `app.js?v=20260720f`, `sync.js?v=20260720f`.
- `GELISTIRME-PLANI.md`
  - 2026-07-20 changelog girişi güncellendi; #29 Terapi Odası Premium ✅.
- `AGENTS.md`
  - Bu Agent Handoff Log girişi eklendi.

**Test/doğrulama sonuçları:**
- `node --check app.js` ✅
- `node --check sync.js` ✅
- `room_harness.js` (headless Node `vm`) ✅:
  - 3 sekme render ediyor.
  - Yol/Araçlar/Profilim içerikleri soft-update container'a yazılıyor.
  - `migrate()` eski veriye `scientificProfile`, `therapy`, `roomContentHistory` backfill ediyor.
- Demo/localhost artifaktları kalmadı (grep ile doğrulandı) ✅.
- GitHub Pages deploy başarılı.

**Bir sonraki session için notlar / TODO:**
- Gerçek iPhone'da Terapi Odası sekmeleri, araç kart akordeonları ve nefes animasyonu test edilmeli.
- `seyma-data` reposundaki bilimsel profil raporu dosya adı değişirse `App.fetchProfileForRoom()` path'i güncellenmeli.
- Yeni günlük içerik kataloğu zamanla genişletilebilir; her yeni URL'in güvenilir/Türkçe kaynak olduğu ve hâlâ açıldığı manuel kontrol edilmeli.

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
