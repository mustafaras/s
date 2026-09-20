# IIP-02 kapsam kapısı

## Yetkili değişim

Kullanıcının güncel mesajı yalnız IIP-02 tasarım adımını yetkilendirir. Kartın production/test allowlist'leri boştur. Bu nedenle değişiklikler yalnız plan artifact'leri, IIP-STATE, append-only ledger ve generated current-state görünümüdür.

## Değişen dosya seti

- `ilham-ibadet-premium-plan/evidence/IIP-02/` altındaki tasarım, prototype, receipt ve devir dosyaları.
- `ilham-ibadet-premium-plan/IIP-STATE.json` yalnız IIP-02 owner/status/evidence/authorization kayıtları için.
- `ilham-ibadet-premium-plan/tracking/LEDGER.jsonl` yalnız IIP-02 olayları için append-only.
- `ilham-ibadet-premium-plan/tracking/CURRENT-STATE.md` ve `ilham-ibadet-premium-plan/tracking/TRACEABILITY.md` yalnız `plan-check --render` çıktısı olarak.

`app/`, `tests/`, `data/`, `sync.js`, browser profili ve uzak repo değişmedi. Lock yok; üretim/test yazarı yok. Tasarımın gerçek uygulamaya taşınması bu kartta yapılmadı.

## Kapsam sonucu

Scope PASS: 12 ekranın A/B kompozisyonları, ortak sentetik veri, token haritası, 8 bileşen varyant fişi, kalite yeniden işlemesi ve prototype sınırı üretildi. `DEC-01` kararı hâlâ proposed olduğu için kart kapanış statüsü `blocked` olarak tutuldu; bu scope gate'ini geçersiz kılmaz, `done` iddiasını engeller.
