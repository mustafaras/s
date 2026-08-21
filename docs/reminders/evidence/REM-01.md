# REM-01 — State / privacy / delivery contract freeze evidence

**Tarih:** 2026-08-21 (geriye dönük düzenlenen makbuz)<br>
**Durum:** tamamlandı<br>
**Commit:** `ee0d3e5` — `REM-01: freeze reminder state privacy contract`

> **Not:** Bu makbuz, promptun kapandığı gün yazılmamıştı. İçeriği anti-amnesia
> ledger'ın REM-01 satırından ve commit'in kendisinden türetilmiştir; test
> sonuçları makbuzun yazıldığı gün **yeniden çalıştırılarak** doğrulanmıştır.

## Uygulanan sözleşme

- Reminder state şeması, gizlilik sınırı ve teslimat sözleşmesi donduruldu;
  kararlar `APP-REMINDER-DECISIONS.md` içinde REM-ADR-010..015 ve REM-DISC-007
  olarak kayda geçti.
- `APP-REMINDER-TEST-MATRIX.md` REM-01 bölümü, sonraki promptların kapıları
  için referans hâline getirildi.
- Runtime kodu değiştirilmedi; bu prompt yalnız sözleşme/plan katmanıdır.

## Acceptance ve test receipt'leri

| Kapı | Kanıt |
|---|---|
| Karar kaydı | `APP-REMINDER-DECISIONS.md` REM-ADR-010..015 / REM-DISC-007 |
| Test matrisi | `APP-REMINDER-TEST-MATRIX.md` REM-01 bölümü |
| Owner parity | 48 madde eşleşti |
| Syntax / JSON / context / diff | PASS |
| Commit geçmişte mevcut | `git show -s ee0d3e5` PASS |

## Sınırlar

Gerçek browser açılmadı, `mustafaras/seyma-data` yazılmadı, token veya özel
veri istenmedi, testte gerçek ağ kullanılmadı.
