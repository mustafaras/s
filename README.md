<div align="center">

<img src="docs/media/readme-header.svg" alt="ŞEYMA · ÆON — private signals and evidence-first observation" width="100%">

<p>
  <a href="https://mustafaras.github.io/s/"><img src="https://img.shields.io/badge/live-GitHub%20Pages-111827?style=for-the-badge&logo=githubpages&logoColor=white" alt="Live on GitHub Pages"></a>
  <a href="https://github.com/mustafaras/s/actions/workflows/pages.yml"><img src="https://github.com/mustafaras/s/actions/workflows/pages.yml/badge.svg?branch=main" alt="Pages deployment workflow"></a>
  <img src="https://img.shields.io/badge/runtime-static-0f172a?style=for-the-badge&logo=github&logoColor=white" alt="Static runtime">
  <img src="https://img.shields.io/badge/stack-vanilla%20JS-f7df1e?style=for-the-badge&logo=javascript&logoColor=111827" alt="Vanilla JavaScript">
  <img src="https://img.shields.io/badge/verification-headless%20Node%20VM-7c3aed?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Headless Node VM verification">
  <img src="https://img.shields.io/badge/privacy-local--first-00a884?style=for-the-badge" alt="Local first privacy boundary">
  <img src="https://img.shields.io/badge/build-none-64748b?style=for-the-badge" alt="No build step">
</p>

<table>
  <tr>
    <td align="center"><b>PRIVATE BY DEFAULT</b><br><sub>personal detail stays local</sub></td>
    <td align="center"><b>STATIC BY DESIGN</b><br><sub>inspectable source, no hidden server</sub></td>
    <td align="center"><b>EVIDENCE-GATED</b><br><sub>claims retain their provenance</sub></td>
  </tr>
</table>

</div>

<div align="center">

> **The product principle:** observe carefully, preserve uncertainty, protect
> private context, and make every operational claim traceable to a source.

</div>

## Navigation

| Goal | Start here |
| --- | --- |
| Understand the product and its scientific posture | [Product thesis](#product-thesis) and [Evidence architecture](#evidence-architecture) |
| See the interface language | [Interface gallery](#interface-gallery) |
| Understand the system | [Architecture](#architecture) and [Data lifecycle](#data-lifecycle) |
| Resume safe repository work | [Agent entrypoint](#agent-entrypoint) and [`AGENTS.md`](AGENTS.md) |
| Run verification | [Verification](#verification) |
| Change reminders or notification UX | [`docs/reminders/README.md`](docs/reminders/README.md) |
| Change a roadmap item | [`docs/GELISTIRME-PLANI.md`](docs/GELISTIRME-PLANI.md) |
| Inspect historical design evidence | [`archive/`](archive/) |

## Product thesis

Şeyma is a private, Turkish-language application for mood, daily-life signals,
reflection, habits, reading, listening, faith-related routines and optional
reminders. ÆON is a separate observer surface: it consumes an approved,
redacted projection and presents operational context without becoming a second
source of truth.

The system deliberately separates four things that are often collapsed into a
single “dashboard”:

1. **What a person entered** — the local record.
2. **What the software normalized** — the canonical state and migration result.
3. **What the observer is allowed to see** — the projection and redaction contract.
4. **What has actually been proven** — fixture, deployment and device evidence.

This is a reflection product, not a diagnostic product. It does not infer a
clinical condition, prescribe treatment, make dose decisions, or convert a
personal routine into a score of human worth.

## At a glance

| Surface | Purpose | Trust boundary |
| --- | --- | --- |
| **Şeyma** | Private mood, rhythm, notes, routines and reflection | Local personal source of truth |
| **ÆON Current Panel** | Readable observer summaries and operational status | Redacted projection; read-only observer surface |
| **ÆON Panel-v2 Premium** | Premium visual system for trends, archives and system state | Independent panel runtime and contract suite |
| **Sync layer** | Explicit, sanitized transport and conflict-aware merge | Guarded full-replace boundary with receipts |
| **Verification layer** | Deterministic Node fixtures and VM harnesses | Synthetic data, mocked transport, no browser boot |

## Evidence architecture

The repository uses a layered evidence model inspired by scientific workflow:
separate observation from transformation, transformation from interpretation,
and interpretation from release claims.

```mermaid
flowchart LR
    O["01 · Observe<br/>human-entered local signals"] --> N["02 · Normalize<br/>migration + canonical state"]
    N --> P["03 · Protect<br/>privacy, consent, redaction"]
    P --> X["04 · Project<br/>fresh / stale / missing / error"]
    X --> V["05 · Verify<br/>deterministic fixtures + VM"]
    V --> D["06 · Deliver<br/>CI, Pages, live receipt"]

    O -. "never clinical authority" .-> G["Guardrail: no diagnosis<br/>no treatment decisions"]
    P -. "private detail stays local" .-> G
    X -. "uncertainty remains visible" .-> G

    classDef source fill:#31242d,stroke:#ff7c8d,color:#fff;
    classDef transform fill:#202d35,stroke:#8fbce9,color:#fff;
    classDef protect fill:#24362f,stroke:#73d6b2,color:#fff;
    classDef verify fill:#302a42,stroke:#b9a0ff,color:#fff;
    classDef deliver fill:#3a3022,stroke:#e9bb70,color:#fff;
    classDef guard fill:#2d2023,stroke:#e8959e,color:#fff;
    class O source;
    class N transform;
    class P,X protect;
    class V verify;
    class D deliver;
    class G guard;
```

### The scientific posture

| Layer | Question | Allowed claim | Explicitly not claimed |
| --- | --- | --- | --- |
| **Observation** | What was entered or recorded? | “A local record exists.” | “This explains the person.” |
| **Normalization** | How was the record made compatible? | “The state passed migration and shape checks.” | “The normalized value is clinically valid.” |
| **Projection** | What can the observer safely see? | “This redacted projection is fresh/stale/missing/error.” | “Hidden content is absent.” |
| **Interpretation** | What pattern is visible? | “This bounded window shows a change in recorded signals.” | “The change has a causal explanation.” |
| **Action** | What should the product do? | “Offer an optional, user-owned next step.” | “Prescribe, diagnose, shame or escalate automatically.” |

### Evidence levels

Repository health is reported in separate levels. A passing fixture is not a
deployment receipt, and a deployment receipt is not user-device acceptance.

```mermaid
sequenceDiagram
    autonumber
    participant S as Source contract
    participant T as Synthetic test
    participant C as CI / Pages
    participant U as User device

    S->>T: deterministic fixture exercises the contract
    T-->>S: source/test evidence
    T->>C: validated commit reaches main
    C-->>T: workflow + deployment receipt
    C->>U: deployed static surface becomes available
    U-->>C: device confirmation remains separate

    Note over S,T: PASS means the named contract passed.
    Note over C,U: No repository result silently promotes device acceptance.
```

## Interface gallery

These source-controlled interface previews are intentionally composed from the
verified runtime surfaces, terminology and privacy boundaries. They contain no
user data and are not live account screenshots. Keeping them versioned makes
the README readable on GitHub without opening the application or introducing a
browser into repository verification.

<table>
  <tr>
    <td width="33%" align="center"><img src="docs/media/seyma-today.svg" alt="Şeyma Today interface preview" width="100%"><br><sub><b>ŞEYMA · TODAY</b><br>Private reflection and daily rhythm</sub></td>
    <td width="33%" align="center"><img src="docs/media/aeon-observer.svg" alt="ÆON Current Panel interface preview" width="100%"><br><sub><b>ÆON · CURRENT PANEL</b><br>Source-aware observer projection</sub></td>
    <td width="33%" align="center"><img src="docs/media/aeon-panel-v2.svg" alt="ÆON Panel-v2 Premium interface preview" width="100%"><br><sub><b>ÆON · PANEL-V2 PREMIUM</b><br>Premium trends and operational context</sub></td>
  </tr>
</table>

### Product surfaces

```mermaid
flowchart TB
    subgraph APP["ŞEYMA · private application"]
        TODAY["Today / daily rhythm"]
        REFLECT["Mood + reflection"]
        FAITH["İlham & İbadet"]
        REM["Reminder Center<br/>local-only, optional"]
    end

    subgraph CORE["canonical runtime"]
        STATE["one data object"]
        MIGRATE["additive migrate()"]
        SAVE["local persistence"]
    end

    subgraph OBS["ÆON · observer surfaces"]
        P1["Current Panel<br/>projection + status"]
        P2["Panel-v2 Premium<br/>trends + archives + system"]
    end

    TODAY --> STATE
    REFLECT --> STATE
    FAITH --> STATE
    REM -. "separate privacy contract" .-> STATE
    STATE --> MIGRATE --> SAVE
    SAVE --> PROJ["sanitized projection"]
    PROJ --> P1
    PROJ --> P2

    classDef app fill:#34262e,stroke:#ff7c8d,color:#fff;
    classDef core fill:#202d35,stroke:#8fbce9,color:#fff;
    classDef panel fill:#3a3022,stroke:#e9bb70,color:#fff;
    class TODAY,REFLECT,FAITH,REM app;
    class STATE,MIGRATE,SAVE,PROJ core;
    class P1,P2 panel;
```

## Architecture

The repository is deliberately boring at runtime: classic scripts, explicit
ownership, no bundler and no hidden server. That makes the privacy and state
boundaries inspectable by both humans and deterministic fixtures.

```mermaid
flowchart LR
    HTML["index.html<br/>public shell"] --> APP["app.js<br/>Şeyma runtime"]
    HTML --> CONTENT["app/content/*<br/>frozen content modules"]
    HTML --> CORE["app/core/*<br/>constants + reminder adapters"]
    APP --> STORE["localStorage<br/>seyma-reset-v1"]
    APP --> SYNC["sync.js<br/>sanitize · merge · receipt"]
    SYNC --> REMOTE["approved transport boundary"]
    REMOTE --> PROJ["redacted projection"]
    PROJ --> PANEL["panel/panel.js<br/>Current Panel"]
    PROJ --> V2["panel/v2/panel-v2.js<br/>Premium Panel-v2"]
    PANEL --> CSS1["panel/panel.css"]
    V2 --> CSS2["panel/v2/panel-v2.css"]
    CI[".github/workflows/pages.yml"] --> SITE["GitHub Pages<br/>runtime-only staging"]
    SITE --> HTML

    classDef shell fill:#31242d,stroke:#ff7c8d,color:#fff;
    classDef runtime fill:#202d35,stroke:#8fbce9,color:#fff;
    classDef storage fill:#24362f,stroke:#73d6b2,color:#fff;
    classDef observer fill:#3a3022,stroke:#e9bb70,color:#fff;
    classDef delivery fill:#302a42,stroke:#b9a0ff,color:#fff;
    class HTML,CONTENT,CORE shell;
    class APP,SYNC runtime;
    class STORE,REMOTE,PROJ storage;
    class PANEL,V2,CSS1,CSS2 observer;
    class CI,SITE delivery;
```

### Runtime ownership

| Surface | Owns | Must not silently own |
| --- | --- | --- |
| [`app.js`](app.js) | UI, state reads/writes, migration entrypoint and `App` handlers | A second persistent store or Panel-v2 rendering |
| [`sync.js`](sync.js) | Sanitized transport, merge helpers, receipts and bounded retries | Raw secrets or unapproved data-repository writes |
| [`app/core/`](app/core/) | Boot constants and reminder runtime contracts | Panel projection or native detail leakage |
| [`app/content/`](app/content/) | Frozen catalogs and domain content modules | Runtime persistence, network or secret discovery |
| [`panel/panel.js`](panel/panel.js) | Current Panel observer projection and UI | Panel-v2 component contracts |
| [`panel/v2/panel-v2.js`](panel/v2/panel-v2.js) | Premium observer rendering, polling, charts and controls | Şeyma local-save semantics |
| [`panel/panelCoverageManifest.js`](panel/panelCoverageManifest.js) | Coverage, redaction and safe projection adapter | Network, DOM mutation or raw secret discovery |
| [`tests/`](tests/) | Synthetic contracts, regression fixtures and parity checks | Production runtime behavior |

## Data lifecycle

Persistent state follows one additive, inspectable path. The migration contract
is idempotent: an old save can be upgraded without deleting unknown fields, and
running the same migration again should not create a new meaning.

```mermaid
flowchart TD
    A["old or new local save"] --> B{"migrate()"}
    B --> C["canonical data object"]
    C --> D["existing App surface"]
    D --> E["save() / local persistence"]
    E --> F{"explicit sync path?"}
    F -- "no" --> L["local-only state"]
    F -- "yes" --> G["sanitize()"]
    G --> H["conflict-aware merge"]
    H --> I["receipt + revision"]
    I --> J["redacted observer projection"]
    J --> K["fresh / stale / missing / error"]

    G -. "remove" .-> X["tokens · private notes · raw GPS · sensitive detail"]
    J -. "never expose" .-> X

    classDef state fill:#202d35,stroke:#8fbce9,color:#fff;
    classDef safe fill:#24362f,stroke:#73d6b2,color:#fff;
    classDef forbidden fill:#2d2023,stroke:#e8959e,color:#fff;
    class A,B,C,D,E,L state;
    class F,G,H,I,J,K safe;
    class X forbidden;
```

### Projection states are first-class

ÆON does not flatten every failure into an empty dashboard or a reassuring
green badge.

| State | Meaning | UI obligation |
| --- | --- | --- |
| `fresh` | Projection matches the accepted source boundary | Show freshness context and revision/source metadata |
| `stale` | A prior safe projection exists but is older than policy | Show the age and avoid current-state language |
| `missing` | No usable projection is available | Show an honest empty state; never invent zeros |
| `error` | Transport, parse or compatibility failure | Show a bounded diagnosis and retry path |
| `redacted` | Presence is known but content is intentionally withheld | Explain privacy without implying data loss |

## Privacy and safety contracts

The most important feature is the boundary itself.

- **Local-first:** personal state is owned by the app’s local data model.
- **Explicit sync:** transport is opt-in and guarded; a stale device must not
  silently clobber a newer remote snapshot.
- **Projection redaction:** private notes, therapy text, raw profile responses,
  secrets, raw GPS and sensitive reminder detail do not cross the observer
  boundary.
- **Reminder separation:** reminders are local-only, optional,
  non-judgmental and private. Native copy is generic; detailed context stays
  in the app.
- **No clinical authority:** the product does not choose doses, interactions,
  treatment, catch-up actions or missed-dose decisions.
- **No browser verification:** opening the app in a browser can load stale
  localStorage and schedule a full replacement. Verification uses the committed
  Node VM harnesses instead.

```mermaid
flowchart LR
    subgraph LOCAL["device-local boundary"]
        DETAIL["private detail<br/>notes · therapy · reminder body · raw GPS"]
        APPSTATE["canonical app state"]
        DETAIL --> APPSTATE
    end

    APPSTATE --> SAN["sanitize + allowlist"]
    SAN --> SAFE["safe summary / receipt / projection"]
    SAFE --> OBSERVER["ÆON observer surfaces"]
    DETAIL -. "blocked" .-> SAFE
    DETAIL -. "blocked" .-> OBSERVER
    APPSTATE -. "no automatic clinical action" .-> ACTION["user-owned optional action"]

    classDef local fill:#34262e,stroke:#ff7c8d,color:#fff;
    classDef safe fill:#24362f,stroke:#73d6b2,color:#fff;
    classDef observer fill:#3a3022,stroke:#e9bb70,color:#fff;
    classDef guard fill:#2d2023,stroke:#e8959e,color:#fff;
    class DETAIL,APPSTATE local;
    class SAN,SAFE safe;
    class OBSERVER observer;
    class ACTION guard;
```

## Verification

There is no `package.json`, bundler, framework, npm test script or linter. The
repository favors inspectable source and deterministic, committed contracts.

### Fast safe checks

```bash
# JavaScript syntax
node --check app.js
node --check sync.js
node --check sw.js

# App VM surfaces; no browser, no real network, no user localStorage
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs

# Focused Panel-v2 suite
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || exit $?; done

# Current Panel and Quran suites
for f in tests/panel/test_*.js tests/quran/test_*.js; do node "$f" || exit $?; done

# State boundary contracts
node .claude/skills/run-seyma/verify-state-helper-boundary.mjs
node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
node .claude/skills/run-seyma/verify-state-adapter-contract.mjs

# Diff hygiene
git diff --check
```

### Test architecture

| Family | Location | Contract |
| --- | --- | --- |
| App and sync | [`tests/app/`](tests/app/) | Migration, merge, anti-clobber and transport safety |
| Current Panel | [`tests/panel/`](tests/panel/) | Projection, redaction, polling, boot resilience and observer UI |
| Panel-v2 Premium | [`tests/panel-v2/`](tests/panel-v2/) | Tokens, components, accessibility, performance and page contracts |
| Quran transport | [`tests/quran/`](tests/quran/) | Catalog, outbox, delivery, response, merge and panel parity |
| Reminder program | [`tests/reminders/`](tests/reminders/) | Local-only UX, permission, privacy, sync and current-panel boundaries |
| State harnesses | [`.claude/skills/run-seyma/`](.claude/skills/run-seyma/) | Isolated VM boot, migration and dependency-bag contracts |

Test evidence is synthetic and deterministic. It is deliberately not a claim
that a particular person’s device, browser profile or private account has been
accepted.

## Release model

`main` is the production branch. GitHub Pages stages the runtime-only public
surface and deploys it without a build step.

```mermaid
flowchart LR
    W["working tree"] --> Q["local syntax + deterministic fixtures"]
    Q --> C["commit on main"]
    C --> CI["Pages workflow<br/>validate + runtime asset guard"]
    CI --> DEP["GitHub Pages deployment"]
    DEP --> LIVE["live HTTP receipt"]
    LIVE -. "still separate" .-> DEVICE["user-device acceptance"]

    classDef local fill:#202d35,stroke:#8fbce9,color:#fff;
    classDef delivery fill:#3a3022,stroke:#e9bb70,color:#fff;
    classDef separate fill:#2d2023,stroke:#e8959e,color:#fff;
    class W,Q local;
    class C,CI,DEP,LIVE delivery;
    class DEVICE separate;
```

Every release claim should identify its evidence level:

1. **Source/test evidence** — local code and deterministic fixtures.
2. **Deployment evidence** — CI run, deployment state and live HTTP response.
3. **User-device evidence** — confirmation from the user’s own clean device
   context; never inferred from the first two levels.

## Repository map

```text
.
├── index.html / panel.html      public Şeyma and Current Panel shells
├── panel-v2.html                Premium observer shell
├── app/                         app core, content modules and shared styles
├── panel/                       Current Panel + Panel-v2 implementation assets
├── app.js / sync.js / sw.js     runtime entrypoints and guarded synchronization
├── assets/                      public ÆON/PWA icons
├── tests/                       committed headless Node fixtures by surface
├── docs/                        roadmap, contracts, summaries and previews
├── archive/                     completed work and historical context
├── .claude/skills/run-seyma/    data-safe VM verification harnesses
├── AGENTS.md / CLAUDE.md        operational and engineering guidance
└── README.md                   product, architecture and verification entrypoint
```

The root is intentionally small. Runtime entrypoints stay discoverable for a
static deployment; content, panel implementations, tests, documents and
historical artifacts have explicit ownership directories.

## Agent entrypoint

Before changing anything:

1. Read [`AGENTS.md`](AGENTS.md) for data-safety, browser, sync and handoff rules.
2. Read [`CLAUDE.md`](CLAUDE.md) for the detailed engineering contract.
3. Read [`docs/GELISTIRME-PLANI.md`](docs/GELISTIRME-PLANI.md) for roadmap scope.
4. For reminders, read [`docs/reminders/README.md`](docs/reminders/README.md)
   and its approval gate before any release action.
5. Inspect `git status --short --branch`; preserve existing user changes.
6. Use synthetic headless evidence. Never open the Şeyma app in a browser to
   “check whether it runs.”

When a change touches persisted state, extend `migrate()` additively, preserve
unknown fields, decide the sync/projection class explicitly and add fixtures for
present, missing, stale and malformed shapes.

## Further reading

- [`AGENTS.md`](AGENTS.md) — operational safety and repository rules
- [`CLAUDE.md`](CLAUDE.md) — detailed architecture and development guidance
- [`docs/GELISTIRME-PLANI.md`](docs/GELISTIRME-PLANI.md) — living roadmap and technical principles
- [`docs/reminders/README.md`](docs/reminders/README.md) — reminder state, contracts and gates
- [`tests/README.md`](tests/README.md) — test inventory and safe execution notes
- [`archive/README.md`](archive/README.md) — historical context and archive policy

<div align="center">

<sub>Built as an inspectable static system: warm on the surface, strict at the boundary.</sub>

</div>
