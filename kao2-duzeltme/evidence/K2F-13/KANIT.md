# K2F-13 — Seviye 0 2/4 — harfsiz dersler
Tarih: 2026-10-01 · Dal: kao2-duzeltme · Önceki commit: 3260f1cb · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K5-02 (iv) · R değişimi: R-06 fail→pass

## İlerleme günlüğü
- [x] P1: sync PASS (13/44, nextPrompt K2F-13, seq 41); K2F-13 in_progress
- [x] Ölçüm: çöken 6 ders (s0.01, .03, .07, .08, .09, .11) `flow.letters` boş → `kaoS0HTML` `flow.letters[0].id` korumasız; spec `s0` yalnız başlık dizisi
- [x] Kırmızı: `test_kao2_s0.js` (h) → `Got unwanted exception: s0.01: çizim çökmemeli`
- [x] Spec `s0Focus` (işaret kimlikleriyle, Arapça yok) · araç `focusFor` (belirlenimci örnek seçimi) · modül yeniden üretildi (iki üretim bayt-eşit)
- [x] `kaoS0Lesson` focus dersi · `kaoS0HTML` focus dalı + harf dersinde koruma · `audio` eylemi örnek indeksiyle · CSS
- [x] Kapılar, P4

## Yapılan
- `docs/kuran-ogreniyorum/kao2/content/curriculum.spec.json`: `s0Focus` (6 ders: marks fetha/damme/kesre · kesre/damme · positions · sükûn · şedde+hançer elif · tenvin+elif-lâm). İşaret Türkçe adları terminolojidir (L1 incelemesine açık, K-4).
- `tools/kao2-curriculum-build.mjs`: işaret kimliği → kod noktası (elle Arapça yok); örnek seçimi: ≤3 hece, klip diskte, Latin okunuşlu; en sık geçen önce; fetha/damme/kesre derslerinde yalnız o ünlüyü taşıyan ve öğretilmemiş başka işareti (şedde, sükûn, tenvin, hançer elif, med) olmayan kelimeler önce; tek işaretli derste 3, iki işaretlide 2'şer, üçlüde 1'er örnek; <3 örnek derleme hatasıdır.
- `app/content/quranCurriculumV2.js` (araç çıktısı): `s0.lessons[i].focus` + `examples[{wordId,ar,tr,translit,syllables,marks,file}]`.
- `app/core/quranLearn.js`: `kaoS0Lesson` focus dersi (`kind:'focus'`); `kaoS0HTML` focus dalı (işaretler + örnek kelimeler okunuşlu + her örnek için "Dinle" + konum dersinde 28 harflik tablo); harf dersinde `letters[0]` koruması; `kaoS0('audio', i)` örnek indeksiyle (olmayan indeks reddedilir).
- `app/kao.css`: işaret listesi, glyph, örnek satırı düzeni (yalnız token'lar).
- Testler: `test_kao2_s0.js` (h) 4 kontrol; `test_kao2_curriculum.js` S0 focus tutarlılığı.

## TDD
- Kırmızı: `node tests/kao/test_kao2_s0.js` → `AssertionError: Got unwanted exception: s0.01: çizim çökmemeli`
- Yeşil: `KAO2 s0: PASS (17 kontrol)` · `KAO2 curriculum: PASS (13 kontrol)`

## Kapılar (P3)
```
node --check (5 modül) PASS · tests/kao (49) · app (77) · panel (23) · panel-v2 (27) · quran (9) PASS
reminders · driver · zikr · kontrast · kao-plan-check · fix-sync-check --repro PASS
SONUÇ: TÜM KAPILAR YEŞİL
KAO2 perf: PASS (content 184.231 KiB · runtime 105.265 KiB · css 13.141 KiB · p95 4.211 ms · steady 2.850 ms)
```
tekrar-uret: 7/10 PASS (önceki 6/10)

## Ölçümler
- `tekrar-uret`: **7/10 PASS** (önceki 6/10) — R-06 fail→pass ("kaoS0HTML çöken dersler: yok"); kalan R-04, R-07, R-08.
- Örnekler (kimlik/okunuş/anlam sözlükten): s0.01 mâ·dûn·min · s0.03 min·fî·dûn·zû · s0.08 ard·yavm·kavm · s0.09 allah·inn·ʿalâ·ilâ · s0.11 huden·abun·allah·allazî; s0.07 28 harflik konum tablosu.
- Müfredat modülü gzip 20,2 KiB (≤48); iki üretim sha256 `31defc83…` aynı. Pinler değişmedi: App.kao* 43 · yüzey 764 · atama 602 · yayın 20261001e (yayınlanan `quranCurriculumV2.js`, `quranLearn.js`, `kao.css` değişti → sonraki yayında pin yükselmeli).

## Bilerek değişen testler
- yok (yalnız genişletme).

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- Giriş satırı (Keşfet → s0.01) artık çökmüyor; gerçek satır zinciri testle sabit.
- Harfsiz derslerde `drill` aşaması yok (aşamalar intro/listen/read); puanlı alıştırma ve aşama HTML'leri K2F-14'te.
- Sözlüğün 'ثُمَّ' için `translit` değeri 'summ' (önceden var olan içerik); seçimde çıkmadı ama sözlük okunuş kalitesi L1'de gözden geçirilebilir.
- S0 hâlâ yalnız kartı olan kullanıcıya Keşfet'te görünür; sıfır kartlı S0 öğrencisinin yolu K2F-15.
