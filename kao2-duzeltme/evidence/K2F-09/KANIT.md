# K2F-09 — Gramer 1/3 — dondurma hattı örnekleri taşır
Tarih: 2026-10-01 · Dal: kao2-duzeltme · Önceki commit: 4e6b4b6f · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K4-02 (1/3; kök neden) · R değişimi: yok (R-03 K2F-10'da)

## İlerleme günlüğü
- [x] P1: sync PASS, K2F-09 in_progress; `freezeGrammar`, `compactCell`, kaynak `grammar.verified.json` ve bütçe testleri okundu
- [x] Ölçüm (kırmızıdan önce): kaynakta 25 kavramın 25'i `examples` taşıyor (93 örnek, 329 kelime), 86 şablondan 43'ü `exampleId`'li ve 43'ü çözülebilir
- [x] Bütçe ölçümü: tahmini ham 77 KiB > 60 KiB tavan → P6 → kullanıcı kararı ("çok daha yükseğe çıkarabilirsin")
- [x] Kırmızı: `test_kao2_grammar_tasks.js` bölüm A → `g0_5: examples yok`
- [x] `freezeGrammar`: `examples` + `explanation`; koruma kuralları; kompakt dizi + yüklemede nesneye açma
- [x] İki dondurma bayt-eşit; bütçe pinleri güncellendi; kapilar.sh YEŞİL; P4

## Yapılan
- `tools/kao-content-freeze.mjs`
  - `compactExample`: Arapça `resolved` alanından aynen; okunuş yalnız QAC 0.4 yüzeyinin D-12 projeksiyonu (hücrelerle aynı yol). **Dondurma hata verir:** eksik alan · `ar` kelimelerin birleşimi değil · kelime indeksleri ardışık/`from..to` ile örtüşmüyor · kelime QAC'ta yok · Arapçası QAC yüzeyiyle (ünsüz iskeleti, `skeletonArabic`) örtüşmüyor · okunuş boş.
  - `freezeGrammar`: her kavrama `explanation[]` ve `examples[]` (kompakt `[id, ref, ilkKelime, tr, [[ar, okunuş]…]]`); yüklemede `{id, ref, tr, ar, words:[{w, ar, pronunciation}]}` nesnelerine açılır; `QuranGrammarV1.exampleById(id)` eklendi; sarkık `exampleId` varsa dondurma durur.
  - Ham tavan 60 → 128 KiB.
- `app/content/quranGrammarV1.js` (araç çıktısı, elle değişmedi): 51.353 → 71.693 bayt ham.
- Testler: `test_kao2_grammar_tasks.js` (yeni, 8 kontrol); bütçe sabitleri: `test_kao2_perf_budget.js`, `test_kao_user_tasks.js`, `test_kao_phonics_contract.js`; README satırı.

## TDD
- Kırmızı: `node tests/kao/test_kao2_grammar_tasks.js` → `AssertionError: g0_5: examples yok`
- Yeşil: `test_kao2_grammar_tasks (bölüm A): 8 kontrol PASS`; `test_kao_freeze_repro`: `4 modül bayt-eş`

## Kapılar (P3)
```
node --check (5 modül) PASS · tests/kao (49) · app (77) · panel (23) · panel-v2 (27) · quran (9) PASS
reminders · driver · zikr · kontrast · kao-plan-check · fix-sync-check --repro PASS
SONUÇ: TÜM KAPILAR YEŞİL
KAO2 perf: PASS (content 183.287 KiB · runtime 97.532 KiB · css 12.938 KiB)
```
tekrar-uret: 4/10 PASS (önceki 4/10)

## Ölçümler (bilimsel doğrulama)
- Hizalama: 329/329 örnek kelimesi QAC'ta bulundu (`s:a:w` anahtarı) ve ünsüz iskeleti QAC yüzeyiyle eşit. Tam yüzey eşitliği 328/329 idi: tek fark Kur'ân'a özgü küçük yâ işareti (U+06E6 ↔ U+06E7, ibrâhîm) — iskelete işaret aralığı (U+06D6–06ED) eklenerek çözüldü, kelimeler aynı.
- Türetilebilirlik: `ar` = kelimelerin birleşimi 93/93; `w` ardışık 93/93 ve `from..to` ile örtüşür 93/93 → yalnız ilk indeks saklandı.
- Bayt-eşit üretim: iki `--freeze-grammar` sha256 `3aff72057b8a3300…` aynı.
- Boyut: modül ham 51.353 → 71.693 B; gzip(9) 13.050 → 18.815 B. İçerik toplamı 177,657 → 183,287 KiB (tavan 256). Eski 4 modül gzip(9) 162.173 → 167.938 B (164 KiB = 167.936 B tavanını 2 bayt aştı → alt tavan 176 KiB; pay ~12,3 KiB).
- Kaynak pini (`grammar.verified.json` sha256) değişmedi; QAC girdi pini değişmedi.
- Pinler değişmedi: App.kao* 42 · yüzey 763 · atama 601 · yayın 20261001a (içerik değişti → sonraki yayında pin yükselmeli).

## Bilerek değişen testler
- `test_kao2_perf_budget.js`: eski 4 modül gzip tavanı `164 → 176 KiB` · kullanıcı kararı (seq 24) · K4-02.
- `test_kao_user_tasks.js`: aynı alt tavan `164 → 176 KiB`.
- `test_kao_phonics_contract.js`: gramer modülü ham tavanı `60 → 128 KiB`.

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok (canlıda hâlâ eski modül; K2F-10/11 görev düzeltmesiyle birlikte yayınlanmalı) · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- Davranış değişmedi: görev kurucu hâlâ eski (örnekleri kullanmıyor) — yanlış görevler K2F-10 (fail-closed) ve K2F-11 (örnekten kurma) ile kapanır; K4-02 canlıda sürer.
- Test içinde VM dizileri başka realm: `Array.from(...)`/`length` kontrolü kullanıldı.
- `explanation` alanı 25 kavramın tamamında 2–3 cümle; K2F-10/11 geri bildirim açıklamasında kullanılabilir.
