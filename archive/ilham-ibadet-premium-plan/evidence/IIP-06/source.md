# IIP-06 kaynak kanıtı

Başarılı komutlar:

- `node --check app/core/saygi.js`
- `node --check tests/app/test_iip_06.js`
- `node tests/app/test_iip_06.js`
- `node tests/app/test_iip_04.js`
- `node tests/app/test_iip_05.js`
- `node tests/app/test_saygi_boundary.js`
- `node tests/app/test_prayer_boundary.js`
- `node tests/app/test_modal_focus_containment.js`
- `node .claude/skills/run-seyma/zikr-harness.mjs` — 95/95
- `node .claude/skills/run-seyma/driver.mjs`
- `node tools/shell-inventory.mjs --gate`
- `git -c core.fsmonitor=false diff --check`

Kaynak gate no-network/headless kapsamındadır. Qibla hesap fonksiyonları, prayer registry, `data`, migration ve sync sınırları ayrı regresyonlarla korunmuştur; source PASS fiziksel render veya cihaz sensörü kanıtı değildir.
