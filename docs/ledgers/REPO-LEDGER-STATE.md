# Şeyma Repo — State Ledger

**Ledger türü:** Repo organizasyonu ve modülerleştirme faz durumu
**Eş ledger:** [REPO-LEDGER-OPERATIONS.md](REPO-LEDGER-OPERATIONS.md)
**Kural:** Append-only; her sequence Operations ledger’da birebir bulunmalı.

## Durum sözlüğü

- `planned`: henüz başlamadı.
- `in_progress`: kullanıcı tarafından başlatıldı, kanıt toplama sürüyor.
- `blocked`: aynı dış blokaj üç ardışık goal turn’de tekrarlandı ve ilerleme yok.
- `ready_for_review`: faz kanıtı tamam, kullanıcı incelemesi bekleniyor.
- `completed`: kabul kapısı ve eş ledger kanıtı tamamlandı.

## Kayıtlar

| Sequence | Tarih | Faz | Durum | Önkoşul | Kabul/kanıt | Sonraki güvenli adım |
|---|---|---|---|---|---|---|
| REPO-M000 | 2026-08-02 | M0 Markdown inventory | completed | Repo organizasyon planı | Markdown manifestosu; 35 dosya, 73 link, yeni kırık link yok | Kullanıcı onayı olmadan taşıma yapma |
| REPO-L000 | 2026-08-02 | L0 runtime dependency map | completed | M0 manifestosu | Runtime giriş grafiği; index/panel/app/sync ölçümü; syntax ve panel 50/50 | Kullanıcı onayı olmadan L1 refactor yapma |
| REPO-M001 | 2026-08-02 | M1 historical Markdown move | completed | REPO-M000 | Üç dosya hash eşleşmesi; canonical dizinler; güncel link taraması; runtime/data değişikliği yok | Kullanıcı seçimi olmadan M2 veya L1 başlatma |
| REPO-M002 | 2026-08-02 | M2 roadmap move | completed | REPO-M001 | Dört roadmap canonical `docs/roadmaps/` altında; hash/link/syntax/headless kanıtları tamam | Kullanıcı seçimi olmadan M3 veya L1 başlatma |
| REPO-M003 | 2026-08-02 | M3 AGENTS handoff archive | completed | REPO-M002 | Handoff gövdesi byte/hash korunarak archive’a alındı; root talimatlar korundu; syntax/link/headless kanıtı tamam | Kullanıcı seçimi olmadan L1 panel ayrıştırması başlatma |
| REPO-L001 | 2026-08-02 | L1 panel split | completed | REPO-M003 | Panel shell/CSS/JS ayrıldı; helper/API/script order ve 50/50 panel kapıları geçti | Kullanıcı seçimi olmadan L2 app.js çekirdek ayrıştırması başlatma |
| REPO-L002 | 2026-08-02 | L2-a app constants/icons split | ready_for_review | REPO-L001 | `app/core/constants.js` yükleme sırası, ikon byte gövdesi hash eşleşmesi, app/fixture syntax ve headless/migration/panel kapıları tamam | Kullanıcı seçimiyle `app/core/state.js` için yalnız read-only sınır çıkarımı |
| REPO-L003 | 2026-08-02 | L2-b state/migrate boundary inventory | ready_for_review | REPO-L002 | `data` boot/migrate/default sınırları, doğrudan bağımlılık tablosu, side-effect riskleri ve beş sınıflı migration fixture kapısı kayda alındı; runtime taşıması yok | B1: empty/normalizer helper’ları için yalnız read-only fixture; persistence yok |
| REPO-L004 | 2026-08-02 | L2-b/B1 state helper read-only fixture | ready_for_review | REPO-L003 | Explicit dependency-bag VM’de 11 helper, unknown-field ve idempotence parity; 64/64; app boot/persistence/network yok | B2: sentetik migrate parity fixture; state.js/save entegrasyonu yok |
| REPO-L005 | 2026-08-02 | L2-b/B2 synthetic migration parity | ready_for_review | REPO-L004 | Minimal/kısmi/zengin/bozuk sentetik boot ve ikinci geçiş projection parity; 32/32; fetch=0; runtime taşıması yok | Scratch dependency-bag adapter tasarımı; üretim state.js/save entegrasyonu yok |
| REPO-L006 | 2026-08-02 | L2-b/B3 dependency-bag adapter scratch | ready_for_review | REPO-L005 | Frozen dependency bag + clone boundary + wrapper contract; 20/20; production graph/storage/network yok | Kullanıcı review; gerçek migrate adapter parity ve production state.js ayrı kapı |
| REPO-L007 | 2026-08-02 | L2 review acceptance | completed | REPO-L002–L006 | Kullanıcı REPO-L002–L006 kanıtlarını kontrol ederek kabul etti; paired kabul kaydı eklendi | Kullanıcı açıkça başlatırsa `PANEL-003` / Prompt 01; production state.js/save hâlâ ayrı kapı |

## Aktif güvenli sınır

```text
active_phase: L1-PANEL-SPLIT
active_sequences: REPO-L001
status: ready_for_review
implementation_started: false
external_write_authorized: false
data_mutation_authorized: false
next_safe_action: kullanıcı onayıyla L2 app.js çekirdek ayrıştırmasını başlatmak
```

## Güncel aktif sınır — REPO-L002

```text
active_phase: L2-A-CONSTANTS-ICONS
active_sequences: REPO-L002
status: ready_for_review
implementation_started: true
external_write_authorized: false
data_mutation_authorized: false
next_safe_action: app/core/state.js için migrate/state read-only sınır ve fixture planını çıkarmak; kalıcı taşıma yapmamak
```

## Güncel aktif sınır — REPO-L003

```text
active_phase: L2-B-STATE-MIGRATE-BOUNDARY
active_sequences: REPO-L003
status: ready_for_review
implementation_started: false
external_write_authorized: false
data_mutation_authorized: false
next_safe_action: B1 empty/normalizer helper read-only fixture; app.js state/migrate taşıması ve persistence yok
```

## Güncel aktif sınır — REPO-L004

```text
active_phase: L2-B1-STATE-HELPER-READONLY
active_sequences: REPO-L004
status: ready_for_review
implementation_started: true
external_write_authorized: false
data_mutation_authorized: false
next_safe_action: B2 sentetik migrate parity fixture; app/core/state.js ve persistence entegrasyonu yok
```

## Güncel aktif sınır — REPO-L005

```text
active_phase: L2-B2-STATE-MIGRATE-PARITY
active_sequences: REPO-L005
status: ready_for_review
implementation_started: true
external_write_authorized: false
data_mutation_authorized: false
next_safe_action: dependency-bag adapter scratch tasarımı; production state.js/save entegrasyonu yok
```

## Güncel aktif sınır — REPO-L006

```text
active_phase: L2-B3-STATE-ADAPTER-SCRATCH
active_sequences: REPO-L006
status: ready_for_review
implementation_started: true
external_write_authorized: false
data_mutation_authorized: false
next_safe_action: kullanıcı review; gerçek migrate adapter parity ve production state.js/save entegrasyonu yok
```

## Eşleşme kapısı

Bir sonraki faz yalnız şu koşullar birlikte sağlanırsa açılabilir:

```text
Operations ledger aynı sequence’i içeriyor
AND State ledger aynı sequence’i içeriyor
AND dosya/link/hash kanıtı mevcut
AND app/sync/panel/headless testleri geçiyor
AND kullanıcı verisi ve dış yazma sınırı korunuyor
```

## Güncel kabul sınırı — REPO-L007

```text
active_phase: L2-REVIEW-ACCEPTANCE
active_sequences: REPO-L007
status: completed
implementation_started: false
external_write_authorized: false
data_mutation_authorized: false
next_safe_action: kullanıcı açıkça PANEL-003 / 01-PANEL-P0-SENKRON-MAKBUZU-PROMPTU.md başlatırsa yalnız o promptu okumak ve uygulamak; production state.js/save entegrasyonunu başlatmamak
```

## REPO-M004 test fixture taşıma kabulü (append-only)

| Sequence | Tarih | Faz | Durum | Önkoşul | Kabul/kanıt | Sonraki güvenli adım |
|---|---|---|---|---|---|---|
| REPO-M004 | 2026-08-03 | M4 test fixture organization | completed | REPO-L007 completed; kullanıcı test klasörü taşıması ve release akışını açıkça istedi | Feature commit `dde41245`; PR #103; `main` merge `db00ada3f6f97835b7fd9694d3afe691c3228633`; Pages `30818312034` success; 21/21 fixture iki cwd’den ve migration/headless kapıları PASS | Yeni repo taşıması yalnız ayrı kullanıcı onayıyla başlatılacak |

## Güncel aktif sınır — REPO-M004

```text
active_phase: M4-TEST-FIXTURE-ORGANIZATION
active_sequences: REPO-M004
status: completed
implementation_started: true
external_write_authorized: false
data_mutation_authorized: false
next_safe_action: Yeni bir repo/runtime taşıması başlatmadan kullanıcının açık sonraki talebini beklemek
```
