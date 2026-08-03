# ÆON Paneli — PANEL-13 D6 QA, Release ve Kullanıcı Onayı Kapısı

**Sequence:** `PANEL-015`
**Durum:** `ready_for_review`
**Tarih:** 2026-08-03
**Önkoşul:** PANEL-014 D5 responsive/a11y/motion teslimi

## Sonuç

D6 kapısı, yeşil test sonucunu tek başına release izni saymadan; kod,
projection mahremiyeti, headless davranış, rollback ve kullanıcı onayı
sınırlarını birlikte doğrular. Tüm zorunlu teknik ve sentetik senaryo
kontrolleri geçti; dış release eylemi yapılmadı.

## Kanıt matrisi

| Kapı | Sonuç |
|---|---|
| `node --check` app/sync/panel/coverage | PASS |
| panel script-tag balance + CSS brace + `git diff --check` | PASS |
| coverage manifest validator | PASS; unmapped sentetik fixture yok |
| projection redaction/secret/GPS/media scanner | PASS; sentinel sızmadı |
| offline/reconnect, 409/422 bounded retry, anti-clobber | PASS; mevcut sync fixture + source contract |
| empty/full/stale/error/redacted projection | PASS; P1/P3/P4/D4 fixture’ları |
| 1000 event timeline | PASS; 1000 satır, güvenli özet, 5 saniye altında |
| input-focused polling/draft defer | PASS; polling fixture ve source contract |
| mobile/desktop/contrast/reduced-motion | PASS; D5 fixture **24/24** |
| D6 özel QA fixture | **16/16 PASS** |
| tam komut kapısı | **22 command check PASS** |
| supplemental Kur’an catalog/transport/flow/a11y regressions | **8 command PASS** |

## Backup ve rollback sınırı

- Doğrulanmış mevcut production/base SHA: `b6ba580b00660c5c9475caaacb6d68904a9f95dd`.
- `origin/main` aynı SHA’da; D6 çalışma değişiklikleri henüz commit edilmedi.
- Rollback yolu: release yapılırsa ilgili merge SHA’sını `git revert` ile geri
  almak; bu turda rollback komutu çalıştırılmadı.
- `data/`, `data/events/`, `mustafaras/seyma-data`, localStorage ve observer
  write kanalları değişmedi.

## Release kararı

Testlerin yeşil olması commit/push/merge/deploy yetkisi vermez. Kullanıcı
açıkça yetkilendirmeden dış release eylemi yapılmayacak.

**Sonraki güvenli adım:** Kullanıcıya kısa kanıt özeti sunmak; yalnız açık
kullanıcı onayından sonra release veya sonraki fazı başlatmak.
