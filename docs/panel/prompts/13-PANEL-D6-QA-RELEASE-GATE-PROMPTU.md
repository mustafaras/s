# PANEL-13 — D6 QA, Release ve Kullanıcı Onayı Kapısı Prompt’u

## Amaç

Panel planının uygulama sonrası güvenli kapanışını yapmak; teknik olarak
yeşil görünen fakat kanıtsız veya mahremiyet sınırlarını aşan sonuçları
release saymamak.

## Zorunlu kontroller

### Kod/sözleşme

- `node --check app.js`
- `node --check sync.js`
- panel inline script/script-tag balance kontrolü
- CSS brace ve `git diff --check`
- coverage manifest validator
- projection redaction/secret scanner

### Headless davranış

- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/test_faz10_sync.js`
- `node tests/test_faz11_panel.js`
- yeni sync/receipt/event/projection testleri

### Senaryo

- eski snapshot/migration,
- empty/full/stale/error/redacted projection,
- offline/reconnect,
- 409/422 retry,
- anti-clobber,
- input odaklı polling,
- 1000 event timeline,
- mobile/desktop/contrast/reduced-motion.

## Release sınırı

Yeşil test, commit/push/merge/deploy izni değildir. Kullanıcı açıkça
yetkilendirmeden dış eylem yapılmaz. Kullanıcı verisinin zarar görmediği,
backup SHA’sı ve rollback yolu ayrıca raporlanır.

## Kabul kapısı

- Her iki ledger’da aynı sequence için `ready_for_review` kanıtı vardır.
- Kullanıcıya kısa ve kanıtlı değişiklik özeti verilir.
- Sonraki adım yalnız açık kullanıcı onayıdır.

Tüm sonuçları kaydet, `completed` durumunu yalnız gerçekten tüm kapılar
geçtiyse yaz, aksi halde `ready_for_review` ile DUR.
