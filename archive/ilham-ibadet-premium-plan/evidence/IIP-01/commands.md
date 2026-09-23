# IIP-01 doğrulama makbuzu

Çalışma tarihi: 2026-09-19
HEAD: `e794e7bcc637b2431dcfae29f645ef1b02a2b51c`

| Komut | Exit | Sonuç |
|---|---:|---|
| `node --check app.js && node --check sync.js && node --check app/core/{saygi,prayer,zikir,quran,render}.js` | 0 | Syntax PASS |
| `node ilham-ibadet-premium-plan/tools/plan-check.mjs` | 0 | 24 kart, 48 requirement, DAG/scope/approval/evidence/link PASS |
| `node .claude/skills/run-seyma/zikr-harness.mjs` | 0 | 95/95 assertion PASS; light/dark, hub, overlay, migration, reminder bridge |
| `node tools/shell-inventory.mjs --gate` | 0 | 7.610 satır; 554 App handler; 0 Legacy; 408 reminder; bütçe PASS |
| `node tests/app/test_saygi_boundary.js` | 0 | 20 PASS |
| `node tests/app/test_prayer_boundary.js` | 0 | 19/19 PASS |
| `node tests/app/test_zikir_boundary.js` | 0 | 17/17 PASS |
| `node tests/app/test_zikir_view_boundary.js` | 0 | 17/17 PASS |
| `node tests/app/test_zikr_manual_entry.js` | 0 | 21 PASS |
| `node tests/app/test_quran_boundary.js` | 0 | 20/20 PASS |
| `node tests/app/test_report_boundary.js` | 0 | registry, deterministic report, shim/load order PASS |
| `node tests/reminders/run-reminder-smoke.mjs` | 0 | 21 curated fixtures; integrated reminder assertions PASS |
| `node tests/panel/test_faz11_panel.js` | 0 | 50 PASS |
| `git -c core.fsmonitor=false diff --check` | 0 | whitespace PASS |

Tüm uygulama doğrulamaları no-network/sentetik sınırda çalıştırıldı. Browser/server başlatılmadı; gerçek veri, token ve localStorage kullanılmadı.
