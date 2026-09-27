# KAO-FIX-17 · plan-check sertleştirme (O-11) — kanıt

Dal `kao-duzeltme`, taban `e955181` (= origin/main). Yalnız araç: uygulama kodu ve pin (`20260926m`) değişmedi.

## Önce kırmızı
- 3 yeni vaka eklendi, eski araçla `node kuran-ogreniyorum/tools/kao-plan-check.test.mjs` → exit 1, **17/19**:
  (a) "taban sonrası tanınmayan önek" FAIL, (c) "taban öncesi yalnız WARN" FAIL.
  (b) "KAO-FIX commit sözlüğe dokunabilir" eski araçta da geçer (eski araç KAO-FIX commit'lerini hiç görmüyordu); yeni kuralın yanlış pozitif vermediğini korur.

## Değişiklikler (`kao-plan-check.mjs`)
1. `KAO_FILE_SCOPE`: quranLearn.js, kao.css, 4 içerik modülü, `tools/kao-*.mjs`, `tests/kao/**`, `assets/kao/**`.
2. Konu önekinden bağımsız: bu kümeye dokunan commit `KAO_SUBJECT_RE`'ye uymazsa taban (`58e0ceb`) sonrası **FAIL**, öncesi **WARN**. `afterBase` = `git rev-list 58e0ceb..HEAD`; taban bulunamazsa WARN ve hepsi taban öncesi sayılır.
3. `--commits`: kart başına commit sayısı (yalnız bilgi; `commitCounts` dışa açık).
4. `auditStatus` ∈ `pass|fail|findings`, aksi FAIL; `findings` için `auditFindingsAccepted[<D>]` gerekçesi yoksa WARN. Eski STATE yalnız okunur (V8).

Sapma (gerekçeli): promptun önek listesi `KAO-\d+b?: · KAO-FIX-\d+(/[A-D])?: · KAO-DENETIM: · chore(kao)`.
Buna `KAO-FIX-NN (ek):` ile `KAO-P00:` ve `KAO-Dn:` eklendi. `2ad2a4c` (KAO-FIX-05 (ek)) ve `b6754ff`
(KAO-FIX-11 (ek)) taban sonrası geçerli düzeltme commit'leri; prompt listesiyle FAIL olurlardı
(`node -e` ile doğrulandı: prompt-regex false). `70923c4 KAO-P00:` taban öncesi yanlış WARN verirdi.

## Kontroller
- `node kuran-ogreniyorum/tools/kao-plan-check.test.mjs | tail -1` → `self-test 19/19` (exit 0); `--self-test` aynı
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs | tail -3` → PASS (6 warn), 0 FAIL:
  - taban öncesi 2 WARN: `ecc7ac7` (feat(quran)…), `a9fa40c` (fix(ui)…) — beklenen ikili
  - `KAO-D1`, `KAO-D5`, `KAO-D6` findings gerekçesiz (3 WARN; eski STATE'e yazılamaz, V8)
  - MediaRecorder+save (önceden var)
- `--commits`: KAO-02 10 · KAO-03 5 · KAO-01 3 · KAO-15 3 · KAO-16/16b/18/20/25 2 — denetimin O-11 sayımıyla aynı
- Taban sonrası 33 commit'in hiçbiri FAIL vermez (KAO dosyasına dokunanların hepsi tanınan önekli)
- `node --check` iki dosya · `git diff --check` ok

## Kalan risk
- `-n 400` penceresi: taban öncesi eski commit'ler zamanla pencereden çıkar (yalnız WARN'ı etkiler).
- `KAO-FIX:` (numarasız) önek KAO dosyasına dokunursa FAIL — bugüne kadar yalnız `duzeltme/` belgelerinde kullanıldı.
