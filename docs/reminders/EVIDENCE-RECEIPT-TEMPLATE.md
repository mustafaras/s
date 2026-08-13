# APP-REMINDER-UX — Kanıt Makbuzu Şablonu

Her prompt için uzun terminal logu yerine bu kısa, tekrarlanabilir receipt
tutulur. Büyük loglar repo içine kopyalanmaz.

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-XX
- **Tarih:** YYYY-MM-DD
- **Commit:** SHA veya `not committed`
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** SHA
- **Bitiş HEAD:** SHA
- **Release approval:** `NOT_APPROVED` / `approved`
- **Approval evidence:** Exact user message + date + scope veya `none`

## Kapsam

- Allowlist:
  - `path`
- Protected paths changed: `no` / `yes — blocked`

## Komut sonuçları

| Katman | Komut | Sonuç | Kısa kanıt |
|---|---|---|---|
| Syntax | `...` | PASS / FAIL | assertion / exit |
| Unit / pure | `...` | PASS / FAIL | count |
| Headless UI | `...` | PASS / FAIL / N/A | state |
| Migration | `...` | PASS / FAIL / N/A | parity |
| Privacy | `...` | PASS / FAIL / N/A | negative check |
| Panel | `...` | PASS / FAIL / N/A | projection |
| Diff | `git diff --check` | PASS / FAIL | whitespace |

## Evidence seviyeleri

- Source evidence: S0 / S1
- Synthetic test evidence: S2
- Commit / remote evidence: S3
- CI / Pages evidence: S4 / N/A
- User-device evidence: S5 / N/A

## Release hard gate

- Push / merge / tag / Pages / external write: performed / not performed
- `mustafaras/seyma-data` write: performed / not performed / separately authorized
- If approval is not exact and current, the receipt must remain `NOT_APPROVED`.

## Sonuç

- **Durum:** done / blocked / deferred
- **Blocker:** `none` veya exact test / policy / scope reason
- **Sonraki prompt:** REM-XX
- **Not:** Canlı, cihaz veya kullanıcı sonucu yalnız ilgili evidence seviyesiyle ifade edilir.
