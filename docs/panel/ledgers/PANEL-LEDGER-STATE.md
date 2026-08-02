# ÆON Panel — State Ledger

**Ledger türü:** Append-only faz/state kanıtı
**Eş ledger:** [PANEL-LEDGER-OPERATIONS.md](PANEL-LEDGER-OPERATIONS.md)
**Kapsam:** Faz önkoşulları, kabul kapıları, blokajlar ve güvenli sonraki adım

## Durum sözlüğü

- `planned`: planlandı, uygulanmadı.
- `in_progress`: kullanıcı tarafından başlatıldı, doğrulama sürüyor.
- `blocked`: aynı blokaj en az üç ardışık goal turn’de tekrarlandı ve dış
  değişiklik olmadan ilerleme yok.
- `ready_for_review`: faz işi ve testleri tamam, kullanıcı incelemesi bekliyor.
- `completed`: kabul kapısı ve kanıtları tamamlandı.

## Kayıtlar

| Sequence | Tarih | Faz | Durum | Önkoşul | Kabul/kanıt | Sonraki güvenli adım |
|---|---|---|---|---|---|---|
| PANEL-000 | 2026-08-02 | BASELINE | completed | Yok | Araştırma tamamlandı; 50/50 panel testi ve syntax kontrolleri geçti | Belgeleri anti-amnesia pakete dönüştür |
| PANEL-001 | 2026-08-02 | DOCS-PACK | ready_for_review | PANEL-000 | Teknik/tasarım planı + 00–13 prompt sırası + eşli ledger oluşturuldu; `git diff --check` temiz | Kullanıcı onayıyla yalnız `01-PANEL-P0-SENKRON-MAKBUZU-PROMPTU.md` başlat |
| PANEL-002 | 2026-08-02 | DOCS-INDEX | ready_for_review | PANEL-001 | Kök MD index’i ve canonical `docs/panel/` bağlantıları oluşturuldu; prompt/ledger sıraları doğrulandı | Kullanıcı onayıyla yalnız `01-PANEL-P0-SENKRON-MAKBUZU-PROMPTU.md` başlat |
| PANEL-003 | 2026-08-02 | P0-SYNC-RECEIPT | ready_for_review | PANEL-002; kullanıcı Prompt 01’i açıkça başlattı | `snapshotRevision`, `sourceUpdatedAt`, `submittedAt`, `acceptedAt`, `sourceLatestSha`, whitelist `lastErrorCode`; ayrı `data/sync-receipt.json`; local/server callback ayrımı; panel local/remote/projection/panelPoll; anti-clobber güvenli hata makbuzu; eski alan fallback’i; P0 fixture 25/25 ve tüm regresyon kapıları yeşil | Kullanıcı review’ı; açık kabul/“devam” olmadan PANEL-004 veya Prompt 02 başlatma |
| PANEL-004 | 2026-08-02 | P1-COVERAGE-PROJECTION | in_progress | PANEL-003 ready_for_review; kullanıcı Prompt 02’yi açıkça başlattı | Coverage manifest, observer snapshot ve redaction kapıları henüz inceleniyor | Prompt 02 kapsamını tamamla; gerçek workflow veya dış servis yazma |
| PANEL-004 | 2026-08-02 | P1-COVERAGE-PROJECTION | ready_for_review | PANEL-003 ready_for_review; kullanıcı Prompt 02’yi açıkça başlattı | Her persistent fixture alanı `full/summary/redacted/missing` sınıflanıyor; secret/raw profile/GPS/base64 media redaction; projection parse/missing/stale fallback; receipt revision/SHA eşleşmesi; panel latest yazma kapısı; P1 35/35 ve tüm regresyon kapıları yeşil | Kullanıcı review’ı; açık kabul/“devam” olmadan PANEL-005 veya Prompt 03 başlatma |
| PANEL-005 | 2026-08-02 | P1-MISSING-ROOT-MODULES | in_progress | PANEL-004 ready_for_review; kullanıcı Prompt 03’ü açıkça başlattı | Root-modül projection/render kapısı açıldı; dolu/eski/yok/bozuk fixture ve mutation/privacy kanıtı hazırlanıyor | Prompt 03 hedef alanlarını tamamla; gerçek workflow veya dış servis yazma |
| PANEL-005 | 2026-08-02 | P1-MISSING-ROOT-MODULES | ready_for_review | PANEL-004 ready_for_review; kullanıcı Prompt 03’ü açıkça başlattı | `dailyPhoto`, room history, Saygı root/daily mismatch, `locNudge`, sample/process/accepted location timing, `lastOpenedDate`/root `savedAt`/settings summary; source/privacy badges; no render backfill; P3 26/26 ve tüm regression kapıları yeşil | Kullanıcı review’ı; açık kabul/“devam” olmadan Prompt 04 veya PANEL-006 başlatma |
| PANEL-006 | 2026-08-02 | P1-TERAPI-BILDIRIM-PROVENANS | in_progress | PANEL-005 ready_for_review; kullanıcı Prompt 04’ü açıkça başlattı | Therapy/profil/bildirim/provenance projection kapısı açıldı; hassas metin redaction ve lifecycle fixture hazırlanıyor | Prompt 04 hedeflerini tamamla; gerçek workflow veya dış servis yazma |
| PANEL-006 | 2026-08-02 | P1-TERAPI-BILDIRIM-PROVENANS | ready_for_review | PANEL-005 ready_for_review; kullanıcı Prompt 04’ü açıkça başlattı | `therapyProvenance`, `profileProgress`, `notificationTimeline`, `externalSources`; raw therapy/profile redaction; delivered/read ayrımı; answerReadAt/observer receipt; external error code; provenance/privacy badges; P4 19/19 ve tüm regression kapıları yeşil | Kullanıcı review’ı; açık kabul/“devam” olmadan Prompt 05 veya PANEL-007 başlatma |
| PANEL-006 | 2026-08-02 | RELEASE-PUBLICATION | ready_for_review | PANEL-006 uygulaması ve kullanıcı publish/merge/deploy talimatı | `631dd6d` feature commit’i push edildi; `ba98b74` merge commit’i `main`’e push edildi; Pages run `30761174707` `success` | Yayın doğrulandı; kullanıcı review’ı sürüyor; açık kabul/“devam” olmadan Prompt 05 veya PANEL-007 başlatma |

## Aktif faz

```text
active_phase: P1-TERAPI-BILDIRIM-PROVENANS
active_sequence: PANEL-006
status: ready_for_review
implementation_started: true
external_write_authorized: false
next_safe_action: PANEL-006 kanıtını kullanıcıya sunup review beklemek; açık kabul/“devam” olmadan Prompt 05’e geçmemek
```

## Ledger eşleşme kapısı

Bir sequence yalnız şu durumda ilerletilebilir:

```text
Operations ledger aynı sequence’i içeriyor
AND State ledger aynı sequence’i içeriyor
AND prompt kabul kriterleri kanıtlandı
AND dış eylem izni ayrıca mevcut
```
