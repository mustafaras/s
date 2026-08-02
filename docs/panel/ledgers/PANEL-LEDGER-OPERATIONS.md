# ÆON Panel — Operations Ledger

**Ledger türü:** Append-only operasyon kanıtı
**Eş ledger:** [PANEL-LEDGER-STATE.md](PANEL-LEDGER-STATE.md)
**Kapsam:** Prompt oturumlarında yapılan read-only inceleme, dosya değişikliği,
test ve dış etki kayıtları

## Kurallar

1. Eski satırlar değiştirilmez; düzeltme gerekiyorsa yeni sequence eklenir.
2. Her kayıt `PANEL-###` kimliğiyle state ledger’da birebir bulunur.
3. “Test edildi” yalnız komut kanıtı varsa yazılır.
4. Commit/push/deploy yapılmadıysa yapılmış gibi yazılmaz.
5. Kullanıcı verisine/seyma-data’ya yazım olmadıysa açıkça belirtilir.
6. Her prompt sonunda bu ledger ve state ledger aynı sequence ile güncellenir.

## Kayıtlar

| Sequence | Tarih | Faz | Eylem | Dosya/alan | Kanıt | Dış etki |
|---|---|---|---|---|---|---|
| PANEL-000 | 2026-08-02 | BASELINE | Panel görünürlük, sync ve tasarım araştırması yapıldı | `app.js`, `panel.html`, `sync.js`, mevcut testler | `test_faz11_panel.js` 50/50; `node --check app.js`; `node --check sync.js` | Tarayıcı açılmadı; server açılmadı; veri reposuna yazılmadı |
| PANEL-001 | 2026-08-02 | DOCS-PACK | Teknik plan, tasarım planı, anti-amnesia prompt sırası ve eşli ledger paketi oluşturuldu | `docs/panel/` | `git diff --check`; yeni dosya envanteri | Kod, kullanıcı verisi, commit, push, merge ve deploy yok |
| PANEL-002 | 2026-08-02 | DOCS-INDEX | Kök Markdown envanteri eklendi; yaşayan roadmap ve operasyonel belgeler yerinde bırakılarak panel paketi canonical index’e bağlandı | `docs/README.md`, `docs/panel/README.md`, `AGENTS.md`, `CLAUDE.md`, `GELISTIRME-PLANI.md` | Ledger sequence eşleşmesi; prompt dosyası 14; whitespace/link envanteri | Uygulama kodu ve kullanıcı verisi değişmedi; commit/push/merge/deploy yok |
| PANEL-003 | 2026-08-02 | P0-SYNC-RECEIPT | Prompt 01 uygulandı: local save ile server receipt ayrıldı; revision/acceptedAt/source SHA ve güvenli hata durumları eklendi; panel dört zamanı ayrı gösteriyor | `app.js`, `sync.js`, `panel.js`, `panel.css`, `index.html`, `panel.html`, `test_panel_p0_sync.js`, `AGENTS.md`, `CLAUDE.md`, `docs/panel/README.md` | `test_panel_p0_sync.js` **25/25**; sync 64/64; panel 50/50; B1 64/64; B2 32/32; B3 20/20; app driver PASS; Zikirmatik 90/90; Kur’an 70/70 + transport 207/207; syntax ve `git diff --check` PASS | Gerçek browser/server/ağ, `data/`, localStorage kullanıcı state’i ve `seyma-data` değişmedi; yalnız sentetik mock fetch kullanıldı; commit/push/merge/deploy yok |

## Sonraki sequence

Bir sonraki kayıt kullanıcı review’ı ve açık devam talimatından sonra
`PANEL-004` olabilir. Prompt 02 kullanıcı açıkça başlatmadan yeni kod değişikliği yapılmamalıdır.
