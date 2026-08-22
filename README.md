<div align="center">

<img src="aeon-icon-192.png" alt="ÆON" width="96" height="96">

# ŞEYMA · ÆON

### Personal signals, observed with care.

Private mood tracking for Şeyma — with ÆON as the evidence-first observation
layer.

<p>
  <code>VANILLA JS</code>&nbsp; · &nbsp;<code>STATIC WEB</code>&nbsp; · &nbsp;<code>HEADLESS QA</code>&nbsp; · &nbsp;<code>DATA-SAFE</code>
</p>

</div>

<div align="center">

> A quiet personal system for noticing patterns without turning a life into a
> dashboard of guesses.

</div>

## Reading map

| If you need to... | Start here |
| --- | --- |
| Understand the product | [Product shape](#product-shape) |
| Resume an agent session | [Agent başlangıç protokolü](#ajan-başlangıç-protokolü) |
| Run the safe test surface | [Verification](#verification) and [Detailed test matrix](#detailed-test-matrix) |
| Change persisted state | [Data and privacy boundary](#data-and-privacy-boundary) and [State contract](#state-contract) |
| Change Panel-v2 | [ÆON Panel-v2 Premium](#æon-panel-v2-premium) and [Panel-v2 maintenance](#panel-v2-maintenance) |
| Understand historical decisions | [Archive policy](#archive-policy) |
| Report delivery honestly | [Evidence levels](#evidence-levels) |

## Product shape

Şeyma is a private, Turkish-language mood and daily-life tracking application.
ÆON is its observer surface: a separate dashboard that projects approved,
redacted signals into a readable operational picture.

| Layer | Role | Boundary |
| --- | --- | --- |
| **Şeyma** | Mood, habits, notes, reflection, daily records | Personal source of truth |
| **ÆON Panel** | Observer dashboard and operational summaries | Readable projection; not the source data store |
| **Sync layer** | Sanitized GitHub Contents API transport | Full-replace writes are guarded and consent-bound |
| **Verification** | Node/VM fixtures and deterministic contracts | No real browser boot for app verification |

## Operational status

| Surface | Current state | What this means |
| --- | --- | --- |
| Şeyma application | Active product surface | Changes follow the living roadmap and migration rules |
| Legacy Panel 1 | Maintained observer surface | Existing fixtures and projection contracts remain relevant |
| ÆON Panel-v2 Premium | 40/40 complete and archived | No implicit Prompt 41; new work needs an explicit scope |
| Headless verification | Committed and runnable | Tests are synthetic, deterministic and network-bounded |
| User-device acceptance | Separate / not assumed | Repository evidence does not replace user confirmation |
| Git / release state | Inspect first | Existing dirty changes belong to the user until proven otherwise |

The current state is split between living repository guidance and archived
completion evidence. This keeps the root readable without deleting the decision
history that explains how the current surfaces were produced.

## ÆON Panel-v2 Premium

The Panel-v2 Premium design and implementation sequence is closed at **40/40
prompts** with final QA and deployment evidence recorded. The implementation
package is intentionally archived so a new agent does not ingest its entire
history by default.

- Canonical state: [`archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/CURRENT-STATE.md`](archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/CURRENT-STATE.md)
- Evidence ledger: [`archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/LEDGER.md`](archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/LEDGER.md)
- Current fixtures: [`tests/panel-v2/`](tests/panel-v2/)
- User-device acceptance: separate evidence level; not claimed by repository tests

## Technical profile

| Property | Decision |
| --- | --- |
| Runtime | Vanilla HTML, CSS and JavaScript |
| Build | None; static files are deployed as-is |
| Backend | None in this repository |
| Hosting | GitHub Pages workflow |
| State | Local app state with explicit sanitized sync paths |
| Design target | Mobile Safari/Chrome first, with a responsive desktop surface |
| Language | Turkish product copy; English technical identifiers where useful |

There is no `package.json`, bundler, framework or npm test script. This is
intentional: the repository favors inspectable source, small deterministic
fixtures and a low-friction deployment surface.

## Repository map

```text
.
├── index.html                 Şeyma application shell
├── app.js / sync.js           app runtime and guarded synchronization
├── panel-v2.html              ÆON observer shell
├── panel-v2.js / panel-v2.css Premium observer runtime and design system
├── panelCoverageManifest.js   redaction and coverage projection contract
├── tests/                     committed headless Node fixtures
├── .claude/skills/run-seyma/  data-safe VM verification harnesses
├── archive/                   completed plans, ledgers and historical context
├── AGENTS.md                  operational rules for AI agents
├── CLAUDE.md                  detailed engineering guidance
└── GELISTIRME-PLANI.md        living Turkish roadmap and technical principles
```

The archived design package is historical context, not a new implementation
queue. Do not start a nonexistent Prompt 41.

## Verification

Run the focused Panel-v2 suite:

```bash
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done
```

Run the root fixture suite:

```bash
for f in tests/test_*.js; do node "$f"; done
```

Run syntax and safe application harness checks when the change requires them:

```bash
node --check panel-v2.js
node --check panelCoverageManifest.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
git diff --check
```

Do not open `index.html` or a local Panel/Şeyma page in a real browser for
verification. The app can load stale localStorage and automatically schedule a
full data replacement. Use the headless VM fixtures instead.

## Data and privacy boundary

- Never write to `mustafaras/seyma-data` without explicit user consent.
- Never expose `ghToken`, `openaiKey`, `syncUrl`, personal notes, therapy data,
  raw GPS or other secrets in public-ish projections.
- Treat source/test evidence, deployment evidence and user-device confirmation
  as separate claims.
- Preserve dirty worktrees, frozen evidence and user-owned files.

Read [`AGENTS.md`](AGENTS.md) before changing the repository and
[`GELISTIRME-PLANI.md`](GELISTIRME-PLANI.md) before adding a feature.

---

## Engineering reference

This section is the compact technical contract for maintainers. It records the
relationships that are easiest to lose when a large vanilla repository is
opened after a context change.

### Architecture at a glance

~~~text
                 ┌────────────────────────────┐
                 │ ŞEYMA application          │
                 │ index.html + app.js         │
                 └──────────────┬─────────────┘
                                │
                 local state + explicit save intent
                                │
                                ▼
                 ┌────────────────────────────┐
                 │ sync.js                     │
                 │ sanitize / merge / receipt  │
                 └──────────────┬─────────────┘
                                │
                    approved projection only
                                │
                                ▼
     ┌─────────────────────────────────────────────────────────┐
     │ ÆON observer surfaces                                   │
     │ panel.html/js/css       legacy Panel 1                  │
     │ panel-v2.html/js/css    independent Premium Panel-v2    │
     └─────────────────────────────────────────────────────────┘
                                │
                                ▼
     ┌─────────────────────────────────────────────────────────┐
     │ Headless verification                                   │
     │ Node fixtures · VM harnesses · syntax · diff checks    │
     │ no real browser boot · no secret · no private push       │
     └─────────────────────────────────────────────────────────┘
~~~

### Runtime ownership

| File / surface | Owns | Must not silently own |
| --- | --- | --- |
| <code>app.js</code> | Şeyma UI, state reads/writes, migration entrypoint, App handlers | Panel-v2 rendering or a second persistent store |
| <code>sync.js</code> | Sanitized transport, receipts and conflict/merge helpers | Raw secret output or unapproved data-repo writes |
| <code>panel.js</code> | Legacy Panel 1 projection and observer UI | Panel-v2 component contracts |
| <code>panel-v2.js</code> | Premium observer rendering, polling, charts and controls | Şeyma’s local save semantics |
| <code>panel-v2.css</code> | Premium tokens, layout, motion and responsive rules | Hard-coded theme behavior outside the token system |
| <code>panelCoverageManifest.js</code> | Coverage, redaction and safe projection adapter | Network, DOM mutation or secret discovery |
| <code>tests/panel-v2/</code> | Panel-v2 headless contracts and shared helper | Production runtime behavior |

### State contract

Persisted fields move through this contract:

~~~text
default model
    │
    ├── migrate(old save)
    │       │
    │       └── additive, idempotent, backward-compatible shape
    │
    ├── UI mutation through the existing App surface
    │
    ├── save() and local persistence
    │
    ├── sanitize / merge / receipt boundary
    │
    └── panel projection, redaction and rendering
~~~

When adding a field:

1. Add a safe default to the canonical data model.
2. Extend <code>migrate()</code> for old saves.
3. Decide whether the field is local-only, syncable or projection-safe.
4. Add deterministic fixtures for old and new shapes.
5. Add Panel behavior for present, missing, stale and redacted states when the
   field is persistent and observable.
6. Review secret, privacy and raw-location exposure before delivery.

<code>ui</code> is ephemeral view state. It is not a second persistence layer.
The one-data-object rule keeps migration, sync and Panel projection auditable.

### Projection contract

ÆON should make source condition visible rather than flattening every case into
a number or a green status:

| Projection state | Display intent | Forbidden shortcut |
| --- | --- | --- |
| <code>fresh</code> | Current readable data with freshness context | Hiding the source timestamp |
| <code>stale</code> | Existing data with an explicit age warning | Presenting stale data as current |
| <code>missing</code> | Honest empty or unavailable state | Inventing zero values |
| <code>error</code> | Bounded error classification and retry state | Converting errors into “no data” |
| <code>redacted</code> | Presence known, content intentionally withheld | Treating privacy as a broken fetch |

### Sync and transport boundaries

The sync layer is security-sensitive because a full replacement can overwrite a
remote snapshot if a stale device is allowed to push. Guarded behavior includes:

- local-origin and anti-clobber protections,
- sanitized payload construction,
- receipt and revision evidence,
- conflict-aware merge helpers,
- bounded retry and error classification,
- independent Quran request, delivery and response contracts.

The Quran transport path is deliberately separate from the ordinary
<code>data/latest.json</code> chain:

~~~text
request outbox
      │
      ▼
workflow / reminder / email
      │
      ▼
delivery state
      │
      ▼
response state → idempotent apply → visible status
~~~

Request ID, response ID, revision and timestamp values are provenance fields.
They are not decorative UI metadata.

---

## Detailed test matrix

### Test families

| Family | Location | Primary question |
| --- | --- | --- |
| Panel-v2 visual contracts | <code>tests/panel-v2/test_panel_v2_css.js</code> and component fixtures | Are tokens, components, states and reduced-motion rules present? |
| Panel-v2 page contracts | <code>today</code>, <code>trends</code>, <code>day_detail</code>, <code>archives</code>, <code>system</code>, <code>settings</code> | Do pages render useful and honest data views? |
| Interaction contracts | <code>tabs</code>, <code>swipe</code>, <code>pull_refresh</code>, <code>hit_areas</code> | Are mobile and keyboard interactions bounded and accessible? |
| Polling and telemetry | <code>polling_tests</code>, <code>polling_telemetry</code>, <code>sync_health</code> | Are 304, timeout, freshness, latency and lifecycle states correct? |
| Event and audit | <code>event_log</code>, <code>audit</code>, <code>history</code> | Are sequence, revision, filtering and redaction contracts preserved? |
| Accessibility | <code>accessibility</code>, <code>contrast</code> | Do both themes and keyboard/screen-reader surfaces meet the contract? |
| Legacy Panel / sync | <code>tests/test_panel_*.js</code>, <code>tests/test_panel_p*.js</code> | Does the existing observer and projection surface remain stable? |
| Quran transport | <code>tests/test_quran_*.js</code> | Are catalog, outbox, response, merge and parity contracts safe? |
| Şeyma harnesses | <code>.claude/skills/run-seyma/</code> | Can the app and state boundaries be exercised without a browser? |

### Minimal validation matrix

| Change type | Minimum checks |
| --- | --- |
| README/docs only | <code>git diff --check</code> plus local link existence |
| Panel-v2 CSS/JS | Syntax, focused fixture and all 27 Panel-v2 fixtures |
| Root Panel/sync | Syntax, focused root fixtures and all 32 root fixtures |
| App state/migration | App syntax, driver, migration boundary and relevant sync tests |
| Zikir/faith hub | Driver, zikr harness and relevant migration/sync/Panel fixtures |
| Secret/privacy/sync | Redaction/merge tests plus full relevant suite; no live write |
| Release/deploy | Local checks plus CI/Pages/live evidence as separate layers |

### Determinism rules

- Set dates explicitly in date-sensitive tests.
- Use fixture data, mocked fetch and bounded timers.
- Do not use a browser to create a “manual” pass for a repository gate.
- A historical test count is context, not current evidence; rerun it before
  claiming the current state.

---

## Panel-v2 maintenance

Panel-v2 is complete as a design program, but production maintenance remains
possible when a new, explicitly scoped request arrives. The archived package is
the source of historical context; the live production files remain at the
repository root.

### Maintenance checklist

Before editing:

- Read the root agent rules and current test README.
- Read the archived <code>CURRENT-STATE.md</code> and <code>LEDGER.md</code>
  only for Panel-v2-specific context.
- Inspect <code>git status --short --branch</code>.
- Confirm whether the request changes production, tests, docs or delivery.
- Identify the relevant focused fixture before touching code.

After editing:

- Run the focused fixture.
- Run all Panel-v2 fixtures.
- Run syntax checks for changed JavaScript.
- Run <code>git diff --check</code>.
- Bump asset query strings once per coordinated change when required.
- Update the relevant living status document without rewriting historical
  handoffs.

### Cache busting

The static app uses explicit <code>?v=...</code> asset versions. When
<code>panel-v2.css</code>, <code>panel-v2.js</code>, <code>styles.css</code>,
<code>app.js</code> or <code>sync.js</code> changes:

1. Identify the exact asset reference in the relevant HTML shell.
2. Coordinate a single version bump for the combined change.
3. Verify source and generated/live asset separately when delivery is in scope.
4. Do not use an old cache marker as evidence of a current deployment.

### Responsive and accessibility baseline

Panel-v2 work treats these as contracts, not optional polish:

- mobile viewport behavior at narrow widths,
- touch targets and safe-area spacing,
- keyboard focus and roving navigation,
- visible focus and screen-reader labels,
- light and dark token contrast,
- reduced-motion behavior,
- honest loading, stale, empty and error states.

---

## Ajan başlangıç protokolü

### Required reading order

1. [AGENTS.md](AGENTS.md) — data safety and repository boundaries.
2. [CLAUDE.md](CLAUDE.md) — architecture and verification detail.
3. [GELISTIRME-PLANI.md](GELISTIRME-PLANI.md) — roadmap and technical principles.
4. [tests/README.md](tests/README.md) — current fixture inventory.
5. [tests/panel-v2/README.md](tests/panel-v2/README.md) — Panel-v2 test scope.
6. [CURRENT-STATE.md](archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/CURRENT-STATE.md) — only for Panel-v2 work.
7. [LEDGER.md](archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/LEDGER.md) — only when historical evidence is needed.
8. <code>git status --short --branch</code> — before any edit.

### Handoff content

Every non-trivial maintenance handoff should state:

- changed files,
- source and test evidence,
- remaining verification,
- privacy or data boundaries checked,
- deployment/push status,
- unresolved edge cases,
- the exact first safe action for the next agent.

Root <code>AGENTS.md</code> stays operational and concise. Historical handoffs
belong in <code>archive/</code>; they do not get copied into root instructions.

---

## Evidence levels

Reports use separate evidence layers:

| Level | Meaning | Example |
| --- | --- | --- |
| **S0 · Source** | File content, diff and syntax | <code>node --check panel-v2.js</code> |
| **S1 · Headless** | Deterministic fixture or VM harness | Panel-v2 27/27 |
| **S2 · CI / deploy** | Workflow and deployment record | Pages workflow run |
| **S3 · Live** | HTTP, asset bytes, cache and runtime observation | Cache-busted asset verification |
| **S4 · Device** | User-controlled real-device acceptance | User confirmation on Safari/Chrome |

S0–S3 are not a substitute for S4. The repository does not claim a device
acceptance result that has not been performed and recorded.

For a release-style report:

~~~text
source → local tests → CI/workflow → Pages/deployment → live assets → device
~~~

Each arrow requires its own evidence. A green local suite does not prove that a
deployment happened; a deployment does not prove that a user device accepted
the behavior.

---

## Security operating rules

### Never do

- Open the real Şeyma app in a browser as a generic smoke test.
- Open Panel-v2 in a browser when headless verification is sufficient.
- Write to <code>mustafaras/seyma-data</code> without explicit consent.
- Ask for or paste secrets into chat.
- Automate token, password, 2FA or account fields.
- Disable local-origin or anti-clobber guards.
- Use <code>git reset --hard</code> or broad destructive cleanup on an unclear
  working tree.
- Call a stale Pages record current without revalidation.

### Recovery principle

If a data write is ever suspected to have clobbered a remote snapshot, stop
further writes, preserve evidence and recover through the data repository’s Git
history and daily snapshots. Do not repair the situation by resetting the
user’s device or clearing its local state.

---

## Repository change policy

### New feature

1. Find the roadmap item and technical principle.
2. Extend the canonical data model and migration if state is persistent.
3. Preserve the existing vanilla JS interaction pattern.
4. Mirror persistent observer-visible records in the appropriate Panel surface.
5. Add both theme tokens and responsive/accessibility behavior.
6. Add deterministic tests before delivery.
7. Update the living roadmap and handoff state.

### Bug fix

1. Locate the smallest relevant function or selector with <code>rg</code>.
2. Read bounded ranges in large files.
3. Make the smallest safe change.
4. Add or update the regression fixture.
5. Run focused and full relevant suites.
6. Separate local proof from deploy and device proof.

### Documentation or archive change

1. Keep root documents short and navigational.
2. Move completed plans and historical handoffs under <code>archive/</code>.
3. Update every active link to the new location.
4. Preserve historical bytes unless there is a clear deletion request.
5. Check local targets and run <code>git diff --check</code>.

### Delivery boundary

Commit, push, deploy, plugin installation and external account writes are
separate actions. They are not inferred from a request to edit or document the
repository.

---

## Archive policy

The root should answer “where do I start?” in seconds. It should not require a
new agent to ingest completed promptbooks or dozens of historical handoffs.

~~~text
archive/
├── README.md
├── panel-denetim-merkezi/              legacy Panel 1 work summary
└── PANEL-V2-PREMIUM-TASARIM/
    ├── WORK-SUMMARY.md                  40/40 completion summary
    └── .anti-amnesia/
        ├── CURRENT-STATE.md              canonical current state
        └── LEDGER.md                     canonical prompt evidence ledger
~~~

The working tree keeps only agent-useful summaries and canonical state. Detailed
historical plans, promptbooks and handoffs remain recoverable from Git history.

---

## Quick command matrix

| Goal | Command |
| --- | --- |
| Inspect dirty state | <code>git status --short --branch</code> |
| Run Panel-v2 suite | <code>for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done</code> |
| Run root fixtures | <code>for f in tests/test_*.js; do node "$f"; done</code> |
| Check Panel-v2 syntax | <code>node --check panel-v2.js</code> |
| Check projection syntax | <code>node --check panelCoverageManifest.js</code> |
| Check Şeyma runtime | <code>node --check app.js && node --check sync.js</code> |
| Run app VM harness | <code>node .claude/skills/run-seyma/driver.mjs</code> |
| Run faith hub harness | <code>node .claude/skills/run-seyma/zikr-harness.mjs</code> |
| Check state boundaries | <code>node .claude/skills/run-seyma/verify-state-helper-boundary.mjs</code> |
| Check migration boundary | <code>node .claude/skills/run-seyma/verify-state-migration-boundary.mjs</code> |
| Check adapter boundary | <code>node .claude/skills/run-seyma/verify-state-adapter-contract.mjs</code> |
| Check patch whitespace | <code>git diff --check</code> |

No install step is required for the committed fixture suite.

## Design language

ÆON uses a dark observatory vocabulary: deep page tones, restrained gold
signals, glass surfaces, mono data readouts and motion that yields to reduced
motion preferences. The visual system is premium because it is coherent and
measured — not because it hides uncertainty behind decoration.

<div align="center">

**ÆON / ORCHESTRATION CORE**<br>
`observe` · `redact` · `project` · `verify`

</div>
