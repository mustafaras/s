---
name: run-seyma
description: Run, launch, drive, verify, or screenshot the Şeyma mood-tracking web app and its app.js render path. Use when asked to run/start the app, check that a change renders, or exercise a tab/card/overlay — WITHOUT opening a browser (which can clobber real data). Covers app.js (the core) and panel.html.
---

# Run Şeyma (data-safe headless driver)

Şeyma 🦩 is a single-user, client-side wellness/mood web app. There is **no
build step, no bundler, no framework, no test suite** — just static files
(`index.html` loads `styles.css`, `motivationProgramV2.js`, `app.js`, `sync.js`;
`panel.html` is a standalone observer dashboard). Almost all logic lives in
`app.js` (~6.4k lines, one IIFE) which builds the UI as HTML strings and does
`#app.innerHTML = …`.

## ⛔ DO NOT open the app in a browser to "check it runs"

This is the one hard rule of this repo (see `CLAUDE.md` → "DATA SAFETY"). If this
Mac's browser holds a stale `seyma-reset-v1` localStorage state with a valid
`ghToken`, simply loading `index.html` calls `save()` → `SeySync.schedule()` and
**pushes that stale state to the private `mustafaras/seyma-data` repo, wiping the
real data** (this happened 2026-07-10). `sync.js` full-replaces, never merges.

So there is **no `python3 -m http.server` + `open` step in this skill**, on
purpose. Drive the app the safe way instead: the headless Node `vm` harness
below. It runs the real `app.js` render path with a browser stub, and `fetch`
never resolves → **zero network, nothing can ever be pushed.**

> Paths below are relative to the repo root (`<repo>/`). The driver lives at
> `.claude/skills/run-seyma/driver.mjs`.

## Prerequisites

Node only — no `npm install`, no packages. Verified with Node v26.

```bash
node --version    # v26.x here; anything with node:vm (v14+) is fine
```

## Run (agent path) — the driver

```bash
# from repo root:
node .claude/skills/run-seyma/driver.mjs
```

What it does, and the output you should see:

```
== boot: onboarding (no saved data) ==
PASS  onboarding render produced HTML
PASS  window.App exposed
== boot: seeded state ==
PASS  seeded render produced HTML
PASS  has bottom nav (bugun tab)
== drive: interactions ==
PASS  App.go("rapor") re-rendered
PASS  theme toggle re-rendered (dark)
Done.
```

It loads `motivationProgramV2.js` then `app.js` inside `node:vm` twice — once
with empty localStorage (onboarding), once with a seeded one-day `data` object —
then **drives real interactions**: `App.go('rapor')` (tab switch),
`App.toggleCard('habits')`, `App.setTheme(true)` (dark re-render). Any
`FAIL` line, or an uncaught `ReferenceError`/`TypeError` with an `app.js:<line>`
stack, is a real render bug — `node --check app.js` will NOT catch these.

**Non-zero exit** on any failed assertion, so it's CI-able.

### Inspect the rendered HTML

To see the actual generated markup for a tab (dumps captured `#app.innerHTML`):

```bash
node .claude/skills/run-seyma/driver.mjs --dump bugun   # → /tmp/seyma-dump.html (~84 KB)
```

Tab ids: `bugun`, `rapor`, `takvim`, `mesaj`, `ayarlar` (grep `App.go(` in the
dump to confirm the current set). Cards render **collapsed** by default, so a
card's body (e.g. habits) is absent until you `App.toggleCard('<key>')` then
force a re-render (`App.setTheme(...)` or `App.go(...)`) — the driver already
does this for `habits`; copy that pattern to inspect another card.

### Verifying your own change

Edit the driver's `seedState()` or add `App.<handler>(…)` calls to reach the
code you touched, then re-run. The pattern is always: mutate/interact → clear
`appHTML` → trigger a render → assert on the captured string.

## panel.html (the ÆON observer dashboard)

`panel.html` is a separate, self-contained app that does **not** share code with
`app.js`, so the `app.js` driver does not cover it. It is far less risky (it
mostly *reads* `seyma-data`; its writes go to `observer-inbox.json` /
`aeon-outbox.json`, not `latest.json`). For a change to `panel.html`, syntax +
structure check without a browser:

```bash
node --check app.js && node --check sync.js          # JS syntax gate
node -e "const s=require('fs').readFileSync('panel.html','utf8'); \
  const o=(s.match(/<script/g)||[]).length, c=(s.match(/<\/script>/g)||[]).length; \
  console.log('script tags', o, c, o===c?'OK':'MISMATCH')"
```

For real panel interaction you'd need a browser; if you must, use a fresh
profile with **no** `seyma-panel-*` token so it can't write. Prefer describing
the change and eyeballing the diff over launching it.

## Gotchas (battle scars from building this driver)

- **`app.js` boot immediately calls `render()`**, which hard-requires both
  `#app` and `#root` in the DOM. The stub provides exactly those two; every
  other `getElementById` returns `null` on purpose — the app guards those with
  `if(el)`, so null exercises the same "fresh render" path the real browser
  takes. Adding stubs for them would *hide* bugs.
- **`#root` is `document.documentElement`** here — `render()` does
  `root.setAttribute('data-theme', …)`. Missing it → `Cannot read properties of
  null (reading 'setAttribute')` at `app.js:1815`. That was the first crash.
- **Timers must be no-ops.** `app.js` ends with `setTimeout(pollRemote,1500)` /
  `setInterval(pollRemote,30000)` / `setTimeout(replayAnswerPopup,900)`. Real
  timers would fire network polls; the stub makes `setTimeout/setInterval`
  return `0` without running the callback.
- **`fetch` returns a never-settling Promise** — not a rejection. `sync.js`'s
  `pollRemote`/push code awaits it forever, so no request is ever made. This is
  the load-bearing safety property; don't "fix" it to resolve.
- **`DOMParser` is stubbed** (returns empty nodes) so the Saygi/Wikipedia HTML
  parser (`app.js:~798`) doesn't throw; it just yields no blocks, which is fine
  for render verification.
- **`sync.js` is intentionally NOT loaded** by the driver. `app.js` guards every
  call with `if(window.SeySync)`, so leaving it undefined means `save()` never
  even reaches the push code. (Even if loaded, `location.hostname` is
  `localhost` → sync.js's own Guard 1 blocks the push, and `fetch` is dead.)

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot read properties of null (reading 'setAttribute')` at `app.js:1815` | `#root` missing from `elCache` — the driver defines it; only happens if you edit `makeSandbox`. |
| `App is not defined` / `window.App` FAIL | `app.js` threw before `window.App=App` (line ~5161). Read the stack — it's a real error in the IIFE body. |
| A `FAIL` with big HTML still produced | Assertion substring changed (e.g. tab id renamed). Update the assertion in `driver.mjs`, not the app. |
| Want to test old-save migration | Seed `seedState()` with a pre-change shape and assert `migrate()` still yields a valid object (see `CLAUDE.md`). |
