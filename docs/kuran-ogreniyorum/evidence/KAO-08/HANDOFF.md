# KAO-08 · Devir

**Tarih:** 2026-09-24 · **Başlangıç HEAD:** `4d71eb19bdd22d54974b65b8951b5df5665dddb9` · **Durum:** done

## Ne yapıldı

- `kaoSchedule(card, grade, now)` saf JS olarak eklendi; 19 sabit parametre, hedef hatırlama 0,90 ve en çok 36.500 günlük aralık kullanır.
- New/Learning/Review/Relearning durumları, kısa süreli öğrenme adımları ve DSR formülleri `ts-fsrs@4.5.2` BasicScheduler ile eşlendi.
- `kaoGrade(correct, responseMs, reps)` yanlış→Again, doğru ve >8 s→Hard, olağan doğru→Good, doğru ve <2,5 s ve `reps≥3`→Easy eşlemesini uygular.
- Dönen kart `predictedR ∈ (0,1]` taşır; KAO-13 bunu günlük kalibrasyon toplamına bağlayacaktır.
- Dosya başında yayımlanmış kaynağın tam MIT bildirimi, sürüm etiketi ve commit kimliği yer alır.

## Kaynak doğrulaması

- npm `ts-fsrs@4.5.2`: lisans `MIT`, `gitHead=cdd9158eedf81f3b962bf63f8d49346fcdccf8e6`.
- Uzak Git etiketi `v4.5.2` aynı commit'e çözüldü.
- Yayımlanmış `__tests__/FSRSV5.test.ts` dizilerinden 24 vektör, değişmez npm paketiyle çıkarıldı; elle beklenen sayı üretilmedi.
- Planın “FSRS-4.5 / 19 parametre” ifadesindeki ad çelişkisi gizlenmedi: uygulama `ts-fsrs v4.5.2 using FSRS-5.0` olarak kaydedildi.

## Kontrol sonuçları

- `node --check app/core/quranLearn.js` → 0 → PASS
- `node --check tests/kao/test_kao_fsrs.js` → 0 → PASS
- `node tests/kao/test_kao_fsrs.js` → 0 → 24 vektör `±1e-6`, monotonluk, grade ve predictedR PASS
- `node tests/kao/test_kao_boundary.js` → 0 → registry sınırı PASS
- `node tests/kao/test_kao_migration.js` → 0 → migration regresyonu PASS
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs` → 0 → PASS (0 warn)
- `git -c core.fsmonitor=false diff --check` → 0 → çıktı yok

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| R-A3 | partial | Referans-doğrulanmış `predictedR` hazır; günlük toplam KAO-13, 2/6 haftalık rapor KAO-20 kapsamındadır. |

## Kalan sınırlar

- Bu kart UI üretmez ve cihaz kabulü iddia etmez.
- Push, merge, tag veya deploy yapılmadı.

## Sonraki yetkili eylem

Sıradaki kart `KAO-09`dur; bu devir KAO-09 uygulaması veya herhangi bir yayın işlemi için yetki vermez.
