# KAO-FIX-16 · Plan ve belge hizası (O-8, D-1, D-3) — kanıt

Dal `kao-duzeltme`, taban `5c076c6` (= origin/main). Yalnız belge; kod, pin ve test değişmedi.

## Ölçümler (2026-09-27)
- `wc -l app/core/quranLearn.js` → 1.857 · `wc -c app/kao.css` → 40.209
- `wc -c` içerik: sözlük 324.328 · gramer 51.353 · kısa sûreler 87.463 · telaffuz 9.552 · toplam 472.696
- gzip (`zlib` düzey 9, dosya başına; `test_kao_user_tasks.js` yöntemi) → 162.177 B
- `kao-sim` 365 g (FIX-15 koşumu): oturum min 2 · medyan 23 · maks 47; `quranLearn` 469,5 KB, 1.054 kart
- `grep -n "ts-fsrs" app/core/quranLearn.js` → "ts-fsrs v4.5.2 (FSRS-5.0)"; hata sayaçları yalnız artar (kümülatif), `state/reps/lapses` uzun adlar

## Değişiklikler
1. 05 §1: sözlük ≤340 KB (KAO-15), quranLearn.js ≤1.900 satır, kao.css ≤42 KB (KF-2), ölçülen değerler; dört modül ≤480 KB + gzip notu; bölme sonraki program.
2. 06 §5: "üç dosya ≤410 KB / gzip ~120 KB" → dört modül, ham tavan KF-2, gzip kullanıcı kararı (KAPANIŞ §6.1).
3. 02 §2.4: KF-4 notu (12–16 tipik; bağlayıcı sınırlar 05 §6) + KF-9.
4. 05 §5: ts-fsrs v4.5.2 varsayılan parametreleri (FSRS-5, 19 sayı).
5. 05 §2: kısa anahtar notu (FIX-15 m.6), KF-10 (budama yok, `stateBudgetKB` kalktı), hata sayaçları. 05 §6: gramer ≤4 (KF-3), serpiştirme gramer dahil (KF-9).
6. README: başlık "0/0" → kapandı + düzeltme programı; "Şu an ne hazır" bölümü bağlantılı; onay kapısı `APPROVED` (STATE, KAPANIŞ §8).
7. Yeni `deliverables/KAO-KAPANIS-EK-1.md` (70 satır): denetim özeti, bulgu→kart tablosu, O-8 bütçe, D-1, D-3 (KF-5), yayın kaydı, KAPANIŞ §1 geçersiz kılma.

Sapma: promptun 5. adımı "`daily` budama + `calibTotals` (FIX-09)" diyor; FIX-09'da KF-10 (kullanıcı) budamayı kaldırdı ve `calibTotals` yazılmadı. Belgeye gerçek durum yazıldı. `eighty` taşı (tuzak 16) EK-1'e açık karar olarak işlendi; kod değişmedi.

## Yayın kaydı kaynağı
- `git reflog show --date=iso origin/main | grep 7693528` → `7693528 refs/remotes/origin/main@{2026-09-26 15:03:34 +0300}: update by push`
- `git merge-base --is-ancestor d6d4e77 7693528` → exit 0 (KAO-22 kapanışı yayında); `7693528..kuran-ogreniyorum` = yalnız `58e0ceb` (ÆON)

## Kontroller
- `grep -c "0/0" kuran-ogreniyorum/README.md` → 0
- Göreli bağlantılar (değişen 5 belge): 44, kırık 0
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs | tail -1` → PASS (1 warn, önceden var)
- `tests/kao/*.js` 17/17 · belgeleri okuyan test/araç yok (`grep -rl`) · `diff --check` ok
- V8: `KAO-KAPANIS.md`, `KAO-STATE.json`, eski `.anti-amnesia/**`, `evidence/**` değişmedi

## Kalan risk
- Gzip bütçesi, `eighty` eşiği ve cihaz kabulü kullanıcı kararında.
