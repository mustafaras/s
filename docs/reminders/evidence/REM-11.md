# REM-11 — Catch-up, grouping ve conflict resolution evidence

**Tarih:** 2026-08-21 (geriye dönük düzenlenen makbuz)<br>
**Durum:** tamamlandı<br>
**Commit:** `82cea9d` — `REM-11: reminder catch-up ve lifecycle kapanışı`

> **Not:** Bu makbuz ledger'ın REM-11 satırından türetilmiştir; test sonuçları
> yeniden çalıştırılarak doğrulanmıştır.

## Uygulanan sözleşme

- Açılış catch-up penceresi, gruplama ve çakışma çözümü tek bir deterministik
  sırayla uygulanır.
- Care occurrence'ları native günlük üst sınırı paylaşır ve seçili kategori
  bütçesini genişletmez.
- Özet ve yerel journal native ve hassas alanları dışarıda bırakır.

## Acceptance ve test receipt'leri

| Kapı | Kanıt |
|---|---|
| Catch-up / gruplama / çakışma | `node tests/reminders/test_reminder_catchup.js` — PASS, 46 assertion |
| Bütçe sınırı | `node tests/reminders/test_reminder_budget.js` — PASS, 15 assertion |
| Tam regresyon | reminder + root + Panel-v2 suite, privacy, driver, syntax, context, diff — PASS |
| Commit geçmişte mevcut | `git show -s 82cea9d` PASS |

## Sınırlar

Gerçek browser açılmadı, veri repo'suna yazılmadı, testte gerçek ağ
kullanılmadı.
