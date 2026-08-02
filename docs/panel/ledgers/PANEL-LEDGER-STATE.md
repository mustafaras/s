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

## Aktif faz

```text
active_phase: DOCS-PACK
active_sequence: PANEL-002
status: ready_for_review
implementation_started: false
external_write_authorized: false
next_safe_action: kullanıcı onayıyla 01-PANEL-P0-SENKRON-MAKBUZU-PROMPTU.md dosyasını okumak ve başlatmak
```

## Ledger eşleşme kapısı

Bir sequence yalnız şu durumda ilerletilebilir:

```text
Operations ledger aynı sequence’i içeriyor
AND State ledger aynı sequence’i içeriyor
AND prompt kabul kriterleri kanıtlandı
AND dış eylem izni ayrıca mevcut
```
