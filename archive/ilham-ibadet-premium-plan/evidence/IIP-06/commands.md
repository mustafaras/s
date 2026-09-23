# IIP-06 komut özeti

| Komut | Sonuç |
|---|---|
| `node ilham-ibadet-premium-plan/tools/plan-check.mjs --render` | PASS |
| `node --check app/core/saygi.js` | PASS |
| `node --check tests/app/test_iip_06.js` | PASS |
| `node tests/app/test_iip_06.js` | 21/21 PASS |
| `node tests/app/test_saygi_boundary.js` | 20/20 PASS |
| `node tests/app/test_prayer_boundary.js` | 19/19 PASS |
| `node .claude/skills/run-seyma/zikr-harness.mjs` | 95/95 PASS |
| `node .claude/skills/run-seyma/driver.mjs` | PASS |
| `node tools/shell-inventory.mjs --gate` | PASS |
| `git -c core.fsmonitor=false diff --check` | PASS |

İlgili regresyon ekleri: IIP-04 25/25, IIP-05 28/28, modal focus PASS. Başarısız komut kalmadı. Sunucu/browser başlatılmadı; gerçek token, localStorage, kişisel veri ve `seyma-data` yazımı yok.
