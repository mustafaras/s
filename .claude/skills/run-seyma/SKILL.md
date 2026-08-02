---
name: run-seyma
description: Run, launch, drive, verify, or screenshot the Şeyma mood-tracking web app and its app.js render path. Use when asked to run/start the app, check that a change renders, or exercise a tab/card/overlay — WITHOUT opening a browser (which can clobber real data). Covers app/core/constants.js, app.js (the core), and the panel.html/panel.js shell.
---

# Run Şeyma (data-safe headless driver)

Şeyma 🦩 is a single-user, client-side wellness/mood web app. There is **no
build step, no bundler, no framework, no test suite** — just static files
(`index.html` loads `styles.css`, frozen content modules,
`app/core/constants.js`, `app.js`, `sync.js`; `panel.html` is a shell that
loads `panel.css` and `panel.js`). Almost all runtime logic still lives in
`app.js` (one IIFE) which builds the UI as HTML strings and does
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

It loads `motivationProgramV2.js`, `app/core/constants.js`, then `app.js` inside
`node:vm` twice — once
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

### Kur'an Yolculuğu (QY-06 / QY-07)

```bash
node .claude/skills/run-seyma/verify-quran-library-ui.mjs
node .claude/skills/run-seyma/verify-quran-library-ui.mjs --dump library
node .claude/skills/run-seyma/verify-quran-library-ui.mjs --dump detail:alak
```

127 assertions over the full-screen surah library and the surah detail:
markup order in the İlham & İbadet hub, the 114-row revelation list, search
(Turkish/Arabic name, mushaf no, theme), the five status filters, the fact
that filter/search taps **do not** trigger a global `render()`, list scroll
restoration, the per-status single-CTA table, request de-duplication /
double-tap guard / safe retry, plan §15 wording, and the CSS layout +
accessibility contract.

Two seed fields are load-bearing and easy to forget when copying this
harness: `settings.auth` (else `needsAuth()` paints the lock screen) and
`settings.profileAssessmentInactive` (else `render()` paints the assessment
gate). Without them `#app` never contains the hub at all and every markup
assertion fails for the wrong reason.

Its DOM stub resolves `getElementById` **only** for ids present in the last
painted markup, and reads the most recently written region — that is what
makes "targeted repaint instead of full render" actually measurable rather
than vacuously true.

The other Kur'an gates are pure-function level and much faster:
`verify-quran-migration-v1.mjs` (QY-02 schema) and
`verify-quran-state-machine.mjs` (QY-03 transitions), plus repo-root
`node test_quran_catalog.js` and `node test_quran_transport.js`.

### L2-b/B1 state helper boundary (read-only)

```bash
node .claude/skills/run-seyma/verify-state-helper-boundary.mjs
```

This fixture extracts only the current `empty*` and archive normalizer
declarations from `app.js` into an isolated `node:vm` dependency bag. It does
not boot `app.js`, call `migrate()`, touch localStorage, load `sync.js`, or
perform network I/O. A green result is helper-shape evidence only; it does not
authorize moving runtime state/persistence code.

### L2-b/B2 migration parity (synthetic black-box)

```bash
node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
```

This harness boots only synthetic minimal, partial, rich and malformed states
with the real `app.js` in a VM. It observes the post-migration JSON through an
in-memory localStorage stub, asserts unknown-field/data preservation and a
second-boot deep parity projection, and confirms zero fetch calls. It does not
authorize `app/core/state.js` extraction or any real persistence/sync write.

### L2-b/B3 dependency-bag adapter (scratch-only)

```bash
node .claude/skills/run-seyma/verify-state-adapter-contract.mjs
```

`state-adapter-scratch.mjs` is deliberately outside the production script
graph. It defines the future `now`/`uid`/catalog/feature-migration/logger bag,
clones inputs at the boundary, and proves caller-state isolation. The harness
does not load `app.js`, `sync.js`, `localStorage`, or a real migration function;
green output is contract evidence only, not a production state-module release.

### Kur'an Yolculuğu outbox writer (QY-08)

```bash
node test_quran_outbox_sync.js
```

Repo-root harness (mirrors `test_faz10_sync.js`'s `eval`-in-mocked-globals
style, not the `node:vm` driver style above) that mock-`fetch`-tests
`sync.js`'s `window.SeySync.pushQuranRequest(payload, cb)` — the QY-08
dedicated writer for `data/quran-request-outbox.json`. 54 assertions: the
write path never touches `data/latest.json`/`data/gunluk`; the outbox
content round-trips through `QuranTransportV1.parseOutbox`; the GitHub
token never appears in any PUT body (only in the `Authorization` header);
409/422 conflicts retry with a re-fetched `sha` (bounded to 3 retries);
two different pending surah requests coexist in the same file without
clobbering each other; offline/network-rejecting and even
synchronously-throwing `fetch` mocks all resolve through `cb(err)` without
an uncaught exception; and Guard 1 (dev-origin) blocks the push with zero
`fetch` calls on `localhost`/`file:`, while the existing
`seyma-sync-force`/`?forceSync=1` escape hatch still works. No real network
call is ever made — everything runs against an in-memory mock.

### Kur'an Yolculuğu request-email workflow (QY-09) — STAGED, not deployed here

```bash
cd .claude/skills/run-seyma/quran-mail-workflow
python test_quran_mail.py
```

`quran-mail-workflow/` holds a GitHub Actions workflow + Python script meant
for `mustafaras/seyma-data/.github/{workflows,scripts}/` — **not** this
repo. `data/quran-request-outbox.json` (QY-08's output) lives in that
private data repo, so the workflow watching it must live there too, mirroring
the existing `aeon-mail.yml`/`profile-completion-mail.yml` pattern (same
`MAIL_USERNAME`/`MAIL_PASSWORD`/`MAIL_TO` secrets — confirmed via read-only
`gh api` to already exist there, so copying this over needs **zero** new
secret setup and will start sending real email on the next outbox push).
See that folder's `README.md` before ever copying/merging it — it spells out
the explicit-consent gate this crosses (`CLAUDE.md`'s "never write to
`mustafaras/seyma-data` without explicit user consent").

`test_quran_mail.py` is a 12-test, zero-network `unittest` suite —
`smtplib.SMTP_SSL` is fully monkeypatched, no real SMTP connection is ever
attempted. It covers: exact plan §8 subject/body wording, the
`mushafOrder`-optional line, idempotent skip-if-already-`sent` (so a workflow
retry can't double-mail), a batch where one send fails and the rest still
process, secret redaction in error messages (not just truncation — a real
gap the test caught and `quran_mail.py`'s `redact_secrets()` now closes),
malformed-outbox-entry tolerance, and `main()`'s exact-`aeon_mail.py`-parity
behavior of touching `data/quran-delivery.json` **not at all** when
`MAIL_USERNAME`/`MAIL_PASSWORD` aren't set.

### Kur'an Yolculuğu Gmail reply bridge (QY-10) — STAGED, no deploy path exists

```bash
cd .claude/skills/run-seyma/quran-reply-bridge
node test_reply_bridge.mjs        # 46 assertions — pure decision logic
node test_transport_parity.mjs    # 69 assertions — zero-drift proof
```

Unlike QY-09 (which I could push via `gh`), **this one has no automatable
deploy path at all** — it's a Google Apps Script project (bound to whatever
Gmail account receives Raşit's replies), and no `clasp`/Apps Script API
access exists in this environment. Everything here is 100% manual
copy-paste by the user into script.google.com; see the folder's `README.md`
for exact setup steps (Script Properties, one manual `installTimeTrigger()`
run).

Three `.gs` files: `QuranTransportV1.gs` (a mechanical copy of the repo-root
`quranTransportV1.js` — same validation/parsing logic, only the final
export line differs since Apps Script has no `window`), `ReplyBridgeLogic.gs`
(the pure `evaluateReply()` decision function — takes `sha256Hex` and
`checkVideoExists` as injected functions, so it's fully Node-testable),
and `Code.gs` (the untestable Gmail/UrlFetchApp/PropertiesService glue,
kept deliberately thin — it contains no decision logic of its own).

`test_reply_bridge.mjs` covers the QY-10 plan's DOĞRULAMA list verbatim:
valid reply, spoofed sender, wrong/stale token, two URLs in one reply,
malformed URL, duplicate reply (same Gmail message ID → same deterministic
`responseId` → `applyResponse` no-ops), and video-unavailable — plus that
an *ambiguous* video-existence check (network hiccup) throws rather than
silently rejecting, so `Code.gs` knows not to permanently label that thread
processed. `test_transport_parity.mjs` proves — by actually running both,
not by diffing text — that the `.gs` copy of the transport module produces
identical output to the real `quranTransportV1.js` across every validator,
parser, and merge function.

## panel.html / panel.js (the ÆON observer dashboard)

`panel.html` is a shell for a separate app that does **not** share code with
`app.js`; its observer IIFE is in `panel.js`, so the `app.js` driver does not
cover it. It is far less risky (it
mostly *reads* `seyma-data`; its writes go to `observer-inbox.json` /
`aeon-outbox.json`, not `latest.json`). For a change to `panel.html`, syntax +
structure check without a browser:

```bash
node --check app.js && node --check panel.js && node --check sync.js  # JS syntax gate
node -e "const s=require('fs').readFileSync('panel.html','utf8'); \
  const o=(s.match(/<script/g)||[]).length, c=(s.match(/<\/script>/g)||[]).length; \
  console.log('script tags', o, c, o===c?'OK':'MISMATCH')"
```

For real panel interaction you'd need a browser; if you must, use a fresh
profile with **no** `seyma-panel-*` token so it can't write. Prefer describing
the change and eyeballing the diff over launching it.

## Gotchas (battle scars from building this driver)

- **`app/core/constants.js` must load before `app.js`**. The driver mirrors the
  production order; direct vm fixtures that boot `app.js` must include the
  constants module first.
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
