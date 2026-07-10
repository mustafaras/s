# Repository Guidelines

## Project Structure & Module Organization

This repository is a static, client-side app deployed directly to GitHub Pages. There is no bundler or backend.

- `index.html`: app shell; loads `styles.css`, `app.js`, and `sync.js`.
- `app.js`: main Şeyma app state, rendering, migrations, and UI actions.
- `sync.js`: GitHub Contents API sync layer for the private data repo.
- `panel.html`: standalone observer dashboard that reads the private data repo.
- `styles.css`: shared theme variables and global styling.
- `.github/workflows/pages.yml`: deploys the repo root to GitHub Pages on `main`.
- `seyma_motivation_v2_package/`: local-only planning package; do not commit.

## Build, Test, and Development Commands

No install step is required. Run locally with a static server:

```bash
python3 -m http.server 8765
```

Open `http://localhost:8765/index.html` for the app and `http://localhost:8765/panel.html` for the panel.

Useful checks:

```bash
node --check app.js
node --check sync.js
git status --short --branch
```

## Coding Style & Naming Conventions

Use vanilla JavaScript, HTML, and CSS. Follow the existing style: global `App.<action>` handlers, string-based render helpers, and a single mutable `data` object. Add persistent fields through migration/ensure logic; use `ui` only for temporary view state. Keep user-facing Turkish copy warm and consistent with existing tone. Escape dynamic HTML with `esc()`.

## Testing Guidelines

There is no automated test suite. Validate changes manually in a clean browser context. Check both `index.html` and `panel.html` when persisted data changes. Test old data without new fields, new-user startup, localStorage persistence, and browser console errors.

## Commit & Pull Request Guidelines

Commit messages are short, Turkish, and feature-focused, for example: `Konuma göre hava durumu: panel canlı konumdan çeksin`. PRs should include changed files, manual test notes, screenshots for visual UI changes, and any data migration impact.

## Security & Configuration Tips

Never commit real personal data, tokens, localStorage dumps, or private repo payloads. Runtime data belongs in `mustafaras/seyma-data`, which must remain private. Keep `sync.js` sanitization aligned with any new secret settings.
