# IIP-20 — Yer imleri ve okuyucu tercihi

**Paket:** C · **Rol:** data · **Boyut:** L · **Durum:** yalnız [IIP-STATE.json](../IIP-STATE.json) üzerinden okunur.

## Bağlam ve sınır

Şeyma statik vanilla JS uygulamasında İlham & İbadet alanı geliştirilir. Kaynak sahipleri mevcut registry yapısındadır; kullanıcı verisi veya canlı hesap bu kartın girdisi değildir. Bu kart dosyası uygulama izni değildir. Oturumdaki geçerli kullanıcı yetkisi state kaydıyla uzlaştırılır; verilen yetki için tekrar soru sorulmaz.

Ön koşullar aşağıdaki üretilmiş yürütme sözleşmesindedir.

## Bağlamı seçerek oku

Normal giriş [tek prompt dosyası](../UYGULAMA-PROMPTLARI.md) ve `session-brief.mjs` çıktısıdır. Brief'teki kaynak rotasının yalnız ilgili başlıklarını oku; bütün plan/ledger/spec veya bu kartı tekrar yükleme. Bir sözleşme çelişkisi varsa bu ayrıntılı kartı aç.

## Görevler

Görev metninin tek kaynağı: [UYGULAMA-PROMPTLARI.md](../UYGULAMA-PROMPTLARI.md), **IIP-20** bölümü. Normal oturumda `session-brief.mjs IIP-20` bu bölümü ve aşağıdaki canlı sözleşmeyi birlikte verir; kartın tamamını ayrıca okumak gerekmez.

<!-- CONTRACT:START -->
## Yürütme sözleşmesi — üretilmiş

**Bağımlılıklar:** IIP-19.

**Rol:** data · **Kararlar:** DEC-05.

**Üretim allowlist:** `app/core/state.js`, `app/core/saygi.js`, `sync.js`, `panel/panel.js`, `panel/panelCoverageManifest.js`, `app.js`.

**Test allowlist:** `tests/app/test_saygi_boundary.js`, `tests/app/test_faz10_sync.js`, `tests/app/test_state_rebind_boundary.js`, `tests/app/test_iip_20.js`.

**Gerekli gate:** scope, requirements, review, source, visual, data. **Veri etkili yazıcı:** true.

Plan artifactleri: `evidence/IIP-20/`. State/ledger tek yazarı integratör. Allowlist dışı üretim değişimi ve canlı veri yazımı yok. Yeni dosya ihtiyacı kapsam kaydıyla çözülür; var olan yetki tekrar sorulmaz.

### REQ-039 / TC-039 — Yer imi kalıcılığı

Yer imi ve okuyucu tercihleri tek şemada; silme ve geri dönüş tanımlı.

Olumsuz kontrol: İki cihaz çatışması, eski istemci ve migration ikinci çalışması test edilir.

### REQ-040 / TC-040 — Okuma konumu sürümü

Konum contentId+revision+blockId ile; sürüm uyuşmazlığında güvenli başa dönüş.

Olumsuz kontrol: Eski paragraf numarası yeni metinde rastgele konuma atlatmaz.
<!-- CONTRACT:END -->

## Doğrulama

Repo kökünden; yalnız yetkili değişimin ilgili komutlarını çalıştır. Bütün uygulama testleri no-network/sentetik olmalı.

```sh
node ilham-ibadet-premium-plan/tools/plan-check.mjs
node --check app/core/state.js
node --check app/core/saygi.js
node --check sync.js
node --check panel/panel.js
node --check panel/panelCoverageManifest.js
node tests/app/test_saygi_boundary.js
node tests/app/test_faz10_sync.js
node tests/app/test_state_rebind_boundary.js
node .claude/skills/run-seyma/zikr-harness.mjs
node tools/shell-inventory.mjs --gate
git -c core.fsmonitor=false diff --check
```

Komut geçmesi yeni davranışın bütün kabulünü tek başına kanıtlamaz. [REQ/TC matrisi](../tracking/TRACEABILITY.md) ve [kalite protokolü](../specs/05-KALITE-SKOR-KARTI.md) uygulanır.

## Kanıt ve teslim

Gerekli receipt türleri üretilmiş yürütme sözleşmesinde. Her receipt gerçek artifact yolu, kart, REQ/TC, zaman, HEAD, diff hash, artifact SHA-256 ve reviewer içermeli. [Kanıt şablonu](../templates/EVIDENCE.json) ve [devir](../templates/HANDOFF.md) kullanılır.

Kod bittiğinde `implemented`; inceleme sürerken `in_review`; gerekli yerel kanıtlar ve bağımlılıklar tamamlanınca `done`. Cihaz kabulü ve yayın ayrıca bekleyebilir; bunlar done kelimesinden çıkarılamaz.

## Geri alma ve durma

Önceden var olan dirty dosyalar korunur. Görsel/oturumluk değişim dar commit veya incelenmiş diff ile geri alınır. Yeni kalıcı veri varsa kod geri alma tek başına yeterli değildir; IIP-19 uyumluluk sözleşmesi uygulanır. Eksik dış karar varsa kart `blocked`, neden+çözüm sahibi yazılır. Başka kartı tahminen tamamlanmış sayma.

Oturum biterken sahiplik/lock durumu, son başarılı komut, hata imzası, uygulanmış ama doğrulanmamış değişim ve sonraki yetkili eylem devirde bulunur.
