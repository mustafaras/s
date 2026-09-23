# IIP — kısa ajan yönergesi

Kök AGENTS veri güvenliği kuralları geçerlidir. Varsayılan giriş **[UYGULAMA-PROMPTLARI.md](UYGULAMA-PROMPTLARI.md)** içindeki ortak bölüm ve kullanıcının seçtiği tek adımdır.

## Düşük bağlamla çalışma

- `node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-NN` çalıştır; canlı görev/kapsam/REQ/gate/karar bilgisini bir kez al.
- Tüm plan, 24 kart, state JSON, ledger, TRACEABILITY veya spec dosyalarını topluca okuma. Brief zaten gereken JSON dilimini ve görev metnini verir.
- Kaynakları `--section DOSYA "BAŞLIK"` ile dar oku. Gerçek kodda `rg` ve ilgili fonksiyon aralıkları; gereken doğrulamayı atlama.
- State/REQ/kararlar canonical; prompt görev metninin tek kaynağı. Detay kartını yalnız çelişki veya ek ihtiyaçta aç.

## Yetki ve devir

Kullanıcının güncel talimatı esas. Bu dosya uygulama yetkisi vermez; verilmiş kart yetkisini tekrar sorma. Yalnız seçili kart; numara sırasını atlama. Done kartı yeniden uygulama, yarım kartı devirden devam ettir. Commit/push/deploy ayrı yetki gerektirir.

Varsayılan tek ajan ve tek state/ledger yazarı. `plannedWriteFiles=locks`; veri etkili yazıcı `data-writer` kilidi alır. Başkasının değişimini/kilidini sahiplenme. Bağımlılıklar ve kabul kanıtı eksikken done verme. State/ledger/devir aynı teslimde güncellenir; eski ledger satırı değiştirilmez. Kod, görsel, içerik, cihaz ve yayın kanıtları ayrıdır.

Kapanışta yalnız gerekli [kanıt](templates/EVIDENCE-GATES.md) ve [devir](templates/HANDOFF.md) şablonunu oku. Owner/lock, HEAD+diff, son test/exit, kalan engel ve sonraki yetkili eylem kaydedilir. `plan-check.mjs --render` ardından salt-okur kontrol çalıştır.

Ayrıntılı durum/kilit/değişiklik protokolü yalnız gerektiğinde: [AGENT-PROTOCOL](tracking/AGENT-PROTOCOL.md). Güvenlik veya karar belirsizliğinde tasarruf uğruna eksik bağlamla işlem yapma.
