# IIP-09 kaynak kanıtı

Kaynak davranışı ve regresyon sözleşmesi şu komutlarla doğrulandı:

- `node --check app/core/saygi.js`
- `node --check app/core/render.js`
- `node --check app.js`
- `node tests/app/test_iip_09.js` — 22/22
- `node tests/app/test_saygi_boundary.js` — 20/20
- `node .claude/skills/run-seyma/zikr-harness.mjs` — 95/95; iki eski ortak-rail assertion’ı DEC-02 sekme sahipliğine uyarlandı
- `node tools/shell-inventory.mjs --gate` — PASS
- `git -c core.fsmonitor=false diff --check` — PASS

Source gate PASS. Kanıt ağsız/sentetiktir; cihaz, VoiceOver ve canlı kullanıcı kabulü değildir.
