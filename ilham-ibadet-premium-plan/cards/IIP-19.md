# IIP-19 — Kalıcı genişletme sözleşmesi

**Paket:** C · **Rol:** data · **Boyut:** L · **Durum:** yalnız [IIP-STATE.json](../IIP-STATE.json) üzerinden okunur.

## Bağlam ve sınır

Şeyma statik vanilla JS uygulamasında İlham & İbadet alanı geliştirilir. Kaynak sahipleri mevcut registry yapısındadır; kullanıcı verisi veya canlı hesap bu kartın girdisi değildir. Bu kart dosyası uygulama izni değildir. Oturumdaki geçerli kullanıcı yetkisi state kaydıyla uzlaştırılır; verilen yetki için tekrar soru sorulmaz.

Ön koşullar aşağıdaki üretilmiş yürütme sözleşmesindedir.

## Bağlamı seçerek oku

Normal giriş [tek prompt dosyası](../UYGULAMA-PROMPTLARI.md) ve `session-brief.mjs` çıktısıdır. Brief'teki kaynak rotasının yalnız ilgili başlıklarını oku; bütün plan/ledger/spec veya bu kartı tekrar yükleme. Bir sözleşme çelişkisi varsa bu ayrıntılı kartı aç.

## Görevler

Görev metninin tek kaynağı: [UYGULAMA-PROMPTLARI.md](../UYGULAMA-PROMPTLARI.md), **IIP-19** bölümü. Normal oturumda `session-brief.mjs IIP-19` bu bölümü ve aşağıdaki canlı sözleşmeyi birlikte verir; kartın tamamını ayrıca okumak gerekmez.

<!-- CONTRACT:START -->
## Yürütme sözleşmesi — üretilmiş

**Bağımlılıklar:** IIP-18.

**Rol:** data · **Kararlar:** DEC-05.

**Üretim allowlist:** yok.

**Test allowlist:** `tests/app/test_faz10_sync.js`, `tests/app/test_state_rebind_boundary.js`.

**Gerekli gate:** scope, requirements, review, data. **Veri etkili yazıcı:** false.

Plan artifactleri: `evidence/IIP-19/`. State/ledger tek yazarı integratör. Allowlist dışı üretim değişimi ve canlı veri yazımı yok. Yeni dosya ihtiyacı kapsam kaydıyla çözülür; var olan yetki tekrar sorulmaz.

### REQ-037 / TC-037 — Kalıcı veri tasarımı

Yeni alanlar için kimlik/sürüm/tombstone/merge/eski istemci/rollback tanımlı.

Olumsuz kontrol: Aynı içerik için çift depo ve tarihsel veri kaybı tasarım incelemesinde engellenir.

### REQ-038 / TC-038 — Paylaşım sınırı

Yeni her alan için cihaz/data/panel/snapshot matrisi ve kullanıcı kararı var.

Olumsuz kontrol: Özel not ya da tercih otomatik observer snapshot kapsamına eklenmez.
<!-- CONTRACT:END -->

## Doğrulama

Repo kökünden; yalnız yetkili değişimin ilgili komutlarını çalıştır. Bütün uygulama testleri no-network/sentetik olmalı.

```sh
node ilham-ibadet-premium-plan/tools/plan-check.mjs
node tests/app/test_faz10_sync.js
node tests/app/test_state_rebind_boundary.js
git -c core.fsmonitor=false diff --check
```

Komut geçmesi yeni davranışın bütün kabulünü tek başına kanıtlamaz. [REQ/TC matrisi](../tracking/TRACEABILITY.md) ve [kalite protokolü](../specs/05-KALITE-SKOR-KARTI.md) uygulanır.

## Kanıt ve teslim

Gerekli receipt türleri üretilmiş yürütme sözleşmesinde. Her receipt gerçek artifact yolu, kart, REQ/TC, zaman, HEAD, diff hash, artifact SHA-256 ve reviewer içermeli. [Kanıt şablonu](../templates/EVIDENCE.json) ve [devir](../templates/HANDOFF.md) kullanılır.

Kod bittiğinde `implemented`; inceleme sürerken `in_review`; gerekli yerel kanıtlar ve bağımlılıklar tamamlanınca `done`. Cihaz kabulü ve yayın ayrıca bekleyebilir; bunlar done kelimesinden çıkarılamaz.

## Geri alma ve durma

Önceden var olan dirty dosyalar korunur. Görsel/oturumluk değişim dar commit veya incelenmiş diff ile geri alınır. Yeni kalıcı veri varsa kod geri alma tek başına yeterli değildir; IIP-19 uyumluluk sözleşmesi uygulanır. Eksik dış karar varsa kart `blocked`, neden+çözüm sahibi yazılır. Başka kartı tahminen tamamlanmış sayma.

Oturum biterken sahiplik/lock durumu, son başarılı komut, hata imzası, uygulanmış ama doğrulanmamış değişim ve sonraki yetkili eylem devirde bulunur.
