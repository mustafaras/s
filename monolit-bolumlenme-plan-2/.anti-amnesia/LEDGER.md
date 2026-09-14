# MON2 · LEDGER (yalnız-eklemeli)

| seq | tarih | kart | önce (app.js / Legacy / reminder gövde / HTML) | sonra | kapı | sapma / not |
|---:|---|---|---|---|---|---|
| 0 | 2026-09-14 | plan | 13.139 / 22 / 3.247 / 1.129 | — | `shell-inventory --gate` PASS (13.200 bütçesi) | Plan yazıldı; `tools/shell-inventory.mjs` eklendi; kod taşınmadı. Teşhis: MON serisi satır hedefi koymadı; 1-satır shim standardı + reminder Legacy çift gövdesi + fixture'ların `reminders.js`'siz boot etmesi MON-40..43'ü 360 satırla sınırladı. |
