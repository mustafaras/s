# IIP-24 gereksinim kanıtı

## REQ-047 / TC-047 — Yayın adayı izlenebilirliği

Özellik→test→kanıt→revizyon matrisi:

| Alan | Test/kanıt | Sonuç |
|---|---|---|
| Seçili kart ve bağımlılık | `session-brief.mjs IIP-24`, IIP-23 `done` | PASS |
| State/owner/lock | `plan-check.mjs` scope/approval/lock doğrulaması | PASS |
| Gereksinim→receipt | `evidence/IIP-24/{scope,requirements,review}.json` | PASS |
| Generated görünüm | `plan-check.mjs --render` + salt-okur tekrar | PASS |
| Geri alma | Bu kartta production/test diff’i yok; state/evidence diff’i geri alınabilir | PASS |
| Bilinen sınırlar | remote SHA/live asset, deploy, gerçek cihaz ve yayın kanıtı ayrı bekler | kayıtlı |

Olumlu senaryolar: boş başlangıç, mevcut 23/24 state, tüm receipt’lerin hash ve REQ kapsamının eşleşmesi. Olumsuz senaryolar: sahte `done`, eksik gate/receipt, eski dependency, döngü, çakışan lock ve generated-view drift’i `plan-check` tarafından reddedilir. App/current-panel/Panel-v2 için mevcut headless fixture’ların empty/loading/error/return akışları yeniden çalıştırıldı; bu kart yeni davranış eklemedi.

## REQ-048 / TC-048 — Ajan takip tutarlılığı

Tek canonical state `IIP-STATE.json`, append-only `LEDGER.jsonl`, generated `CURRENT-STATE.md`/`TRACEABILITY.md` ve IIP-24 receipt’leri aynı canlı HEAD’i (`bc4372fb02d42f89521740569195f0133dc5ee2a`) gösterir. IIP-23 tamamlanmadan IIP-24’ün çalıştırılamadığı dependency gate ile kanıtlandı; bu oturumda IIP-25’e geçilmedi.

Olumsuz senaryo seti: sahte tamamlanma, missing evidence, invalid approval, dependency cycle, lock/resource conflict ve receipt hash mismatch plan-check’in fail-closed kontrollerindedir. Yayın yetkisi/dağıtılmış sürüm sonucu bu yerel receipt’in yerine geçirilmemiştir.
