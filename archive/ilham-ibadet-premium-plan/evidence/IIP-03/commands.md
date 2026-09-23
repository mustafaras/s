# IIP-03 komut makbuzu

2026-09-20, `/Users/m_ras/Desktop/seyma` içinde, gerçek veri okumadan çalıştırıldı:

- `node --check app/core/saygi.js` — exit 0
- `node --check panel/panel.js` — exit 0
- `node tests/app/test_iip_03.js` — exit 0, 14/14
- `node tests/app/test_saygi_boundary.js` — exit 0, 20/20
- `node tests/app/test_prayer_boundary.js` — exit 0, 19/19
- `node ilham-ibadet-premium-plan/tools/plan-check.mjs` — exit 0, 24 cards / 48 requirements
- `node .claude/skills/run-seyma/zikr-harness.mjs` — exit 0, 95/95
- `node tools/shell-inventory.mjs --gate` — exit 0, 7,610 total / 0 legacy / 408 reminder function lines / 57 HTML-builder lines
- `git -c core.fsmonitor=false diff --check` — exit 0

Bu aşamada server, browser, token, localStorage, remote read/write ve cihaz kabulü kullanılmadı.
