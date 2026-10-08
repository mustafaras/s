# D3F-00 — denetim-3 altyapısı

Oturum: claude-opus-5-5 · 2026-10-08 · D3F-00

## Yapılan
- `0105cbe7`: denetim-3 raporu + evidence + denetim promptu depoya alındı. FIX-STATE ve D2F-STATE'e
  `closeCommit=128ab06d`; `fix-sync-check` ve `d2f-sync-check` kod pinlerini o commit'ten ölçer, D2F strict aralığı orada biter.
- Ek commit (D3F-01 sonrası doğrulamada bulunan iki boşluk):
  1. `kao-plan-check` KAO dosyasına dokunan `D3F-NN:` commit'ini "tanınmayan önek" sayıyordu → `D3F-(?:[01]\d|20)` tanındı;
     öz-teste 5 vaka (D3F-01 kabul, D3F-20 üst sınır, D3F-21 / D3F-1 / "denetim-3:" red).
  2. Canlı pin artık hiçbir kapıda STATE ile karşılaştırılmıyordu → `kapilar.sh` "d3f pin senkronu" kapısı
     (D3F-STATE.pins.release = index.html quranLearn.js ?v= = sw.js SW_VERSION).
  3. CLAUDE.md/AGENTS.md "yayın pini FIX-STATE.json.pins.release" (artık donmuş) → D3F-STATE göstergesi; iki satır aynı.

## TDD
- plan-check öz-test: RED 44/46 (D3F-01, D3F-20 tanınmıyor) → GREEN 46/46.
- pin kapısı: gerçek PASS · STATE bayat → FAIL · sw.js geride → FAIL.
- D2F/FIX dondurma: $TMPDIR klonunda D3F commit + pin yükseltmesi PASS; kapanış öneksiz commit'e kaydırılınca FAIL.

## Kapılar
Commit SONRASI temiz HEAD'de tam koşu → `kapilar-commit-sonrasi.txt`.

## Ölçümler
fix-sync `--clean --repro` PASS (10/10) · d2f `--strict --clean --repro` PASS (9/9, 15/15 istisna) · plan-check PASS.

## Bilerek değişen testler
`kao-plan-check.test.mjs` +5 vaka.

## Kanıt düzeyleri
kaynak/test ✓ · yayın — · canlı — · cihaz —

## Sürprizler
D3F-00 iki commit oldu: plan-check boşluğu, D3F-01 commit'lenene kadar görünmedi (kapı commit'ten önce koşmuştu).
Ders: kapı koşusu commit'ten SONRA, temiz ağaçta tekrarlanır.
