# D3F-01 — F-01: g21-k1 "Aynı kökten üç kelime" artık gerçekten aynı kökten

Oturum: claude-opus-5-5 · 2026-10-08 · D3F-01

## Kök neden
`gramPatternRecipe` (g21 dalı) tablonun ilk üç satırını aldı: عَلَّمَ (ʿ-l-m), أَنزَلَ (n-z-l), ٱسْتَغْفَرَ (ġ-f-r). Şablon
`grammar.verified.json` g21-k1 aynı kökten üç lemmayı (`lemmas`: gafara, istagfara, gafûr — kök غفر) zaten taşıyordu,
ama dondurma aracı şablonlardan yalnız id/type/prompt alıyordu.

## Yapılan
- `tools/kao-content-freeze.mjs`: "Kalıp eşle" şablonlarının `lemmas`'ı `[ar, okunuş, anlam, kök]` olarak dondurulur
  (Arapça/anlam/kök sözlük `resolved` alanından aynen; okunuş D-12 projeksiyonu; eksik alan → araç hata verir).
  `app/content/quranGrammarV1.js` yalnız `--freeze-grammar` ile yeniden üretildi (elle Arapça yok).
- `app/core/quranLearn.js`: g21 tarifi şablon lemmalarından kurulur; lemmalar tek kökten değilse görev kurulmaz.
  Yönerge tek şıklı arayüze uygun: "Aynı kökten üç kelime: bu kelimenin anlamı hangisi?" (eski "eşleştir" yanıltıcıydı).
- `kaoGrammarTaskValid`: "aynı kök" diyen ve ≥2 Arapça bağlamı olan görevde bağlam + uyaran şablonun tek kökten
  lemmaları değilse görev reddedilir (fail-closed). K2F-10 doğrulayıcısının kaçırdığı sınıf.
- Pin `20261007b` → `20261008a` (index, sw SW_VERSION/SW_OFFLINE_VERSION, panel-v2, 12 pin testi).

## TDD
- RED: F1 "lemma listesi dondurulmalı" FAIL (değişiklikten önce).
- GREEN: `test_kao2_grammar_tasks.js` 37/37 (F1 kaynakla eşitlik, F2 200 tohumda tek kök + doğrulayıcı, F3 mutasyon:
  başka kökten bağlam/uyaran → reddedilir; eski doğrulayıcı ikisini de kabul ederdi).

## Kapılar
`bash kao2-duzeltme/tools/kapilar.sh` (bayraksız, 13:36): TÜM KAPILAR YEŞİL, exit 0 → `kapilar.txt`.
Not: koşuda "perf satırı okunamadı" çıktı (F-03, kapı bunu saymıyor); perf testi tek başına PASS → `perf.txt`.

## Ölçümler
- Denetim örnekleme betiği (`evidence/grammar-sample.cjs`) u11.01: bağlam غَفَرَ · ٱسْتَغْفَرَ · غَفُور, doğru şık uyaranın anlamı → `g21-k1-sonrasi.json`.
- quranGrammarV1.js gzip 18 999 → 19 127 bayt; perf: içerik 183,94 KiB · runtime 117,71 KiB · p95 4,9 ms.

## Bilerek değişen testler
12 pin testi yalnız pin dizgisi; `test_kao2_grammar_tasks.js` F bölümü eklendi.

## Kanıt düzeyleri
kaynak/test ✓ · yayın — (push yok) · canlı — · cihaz —

## Sürprizler
`test_kao2_grammar_tasks.js` F2'de VM dizisiyle ana süreç dizisi deepEqual'da realm farkı verdi; `Array.from` ile çözüldü.
Commit sonrası (`fd588903`) `kao-plan-check` FAIL verdi: D3F öneki tanınmıyordu (`kapilar.txt` commit öncesi koşuydu).
D3F-00 ek commit'iyle giderildi; commit sonrası tam koşu `evidence/D3F-00/kapilar-commit-sonrasi.txt`.
