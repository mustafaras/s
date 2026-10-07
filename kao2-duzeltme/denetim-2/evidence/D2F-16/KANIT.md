# D2F-16 · Canlı doğrulama ve kapanış · KANIT

Oturum: claude-code:ce2f6bb4-fb96-4b22-99e4-f9da04d481ee
Tarih: 2026-10-07 · önceki commit `b468d9a3` · dal `main`.

## İlerleme günlüğü
1. Kullanıcı "uygula ve canlıya al" dedi; komutu Claude çalıştırdı (kullanıcı devri, LEDGER seq 23).
2. `main` = `origin/main` = `b468d9a3`; komut pin `20261007b` ile koşuldu.
3. Pages run API ile `head_sha`'ya göre bulundu: 37664767297 success.

## Yapılan
- `evidence/D2F-16/CANLI.md` (komut çıktısı birebir), bu KANIT, STATE/CURRENT-STATE/LEDGER, DUZELTME-SONUCU "Canlı doğrulama" bölümü.
- Uygulama kodu, pin ve `main` değişmedi.

## TDD
Kayıt promptu; yeni davranış yok.

## Kapılar
`d2f-sync-check --strict` ve `--repro` commit öncesi koşuldu (sonuç LEDGER seq 24).

## Ölçümler
- Canlı bayt eşitliği: **20/20 EŞİT, 0 FARKLI**; gizlilik yolları **4/4 404**.
- Pages run **37664767297** completed/success.
- Perf (bu makine): PASS · content 183,837 KiB · runtime 117,350 KiB · css 13,035 KiB · p95 4,198 ms · steady 2,885 ms.

## Bilerek değişen testler
Yok.

## Kanıt düzeyleri
kaynak/test ✓ · yayın ✓ · **canlı bayt eşitliği ✓** (komutu Claude çalıştırdı) · cihaz —

## Sürprizler
- `gh` TLS hatası verdi (sandbox sertifika); run numarası `curl` + GitHub API ile okundu.
- Komut çıktısındaki `tee` yalnız son döngüyü yakaladı; CANLI.md'ye tam çıktı tool sonucundan, değiştirilmeden işlendi.
