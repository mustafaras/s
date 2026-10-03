# K2F-25 — Tanış kartı katmanları
Tarih: 2026-10-03 · Dal: kao2-duzeltme · Önceki commit: 4e9b5f7a · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K5-05 · K7-01 (karar kaydı) · R değişimi: yok (10/10 korunur)

## İlerleme günlüğü
- [x] P1: sync PASS (25/44, seq 73, pin 20261003b), dal kao2-duzeltme, FIX-STATE in_progress
- [x] Kırmızı test (lesson_flow: örnek âyet + "Neden böyle?")
- [x] quranLearn.js intro modeli + quranLearnViews.js + kao.css
- [x] LEDGER DECISION (D-12 kognat turu ertelendi, seq 74)
- [x] Kapılar, tekrar-uret, P4 kapanış

## Yapılan
- `app/core/quranLearn.js`: `kaoIntroExample` (yalnız `verified===true` ve `ar/tr/ref/pronunciation` tam olan `examples[0]`) ve `kaoIntroWhy` (`QuranGrammarV1.unit11.roots` ile `lemma.root` eşleşirse kök okunuşu + anlamı + Türkçe türevler; `cognate.shift` varsa uyarı); intro modeline `example` ve `why` eklendi. Kognat kayması artık "Türkçedeki akrabası" satırında değil, "Neden böyle?" katmanında.
- `app/core/quranLearnViews.js`: `introExample` (uygula adımındaki `.kao-lesson-sentence*` kart biçiminin aynısı, yeni CSS yok) ve `introWhy` (`<details class="kao-lesson-why"><summary>Neden böyle?</summary>…`); içerik yoksa katman hiç çizilmez; yeni birincil düğme yok.
- `app/kao.css`: yalnız `.kao-lesson-why` (3 kural, `--kao-*`/`--f-*` tokenları; özet satırı ≥44px).
- Veri kapsamı (524 lemma): 162 lemma unit11 köküne, 113 lemma kognat kaymasına sahip; 524'ünün doğrulanmış okunuşlu örneği var.
- Karar: D-12 kognat turu ertelendi (LEDGER seq 74).

## TDD
- Kırmızı: `node tests/kao/test_kao2_lesson_flow.js` → `AssertionError: l_som_585f33: örnek Arapça yok` (12 ünitenin ilk dersi, gerçek akış)
- Yeşil: `node tests/kao/test_kao2_lesson_flow.js` → PASS (22 kontrol; +3: örnek âyet · "Neden böyle?" kök/türev/kayma, ≤1 details, ≤1 kao-primary · doğrulanmamış örnek gizli + pozitif kontrol)

## Kapılar (P3)
kapilar.sh: tests/kao 52 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · l2-paket · plan-check · sync PASS — SONUÇ: TÜM KAPILAR YEŞİL
tekrar-uret: 10/10 PASS (önceki 10/10)

## Ölçümler
- Bütçe: içerik 185,235 KiB (tavan 256) · runtime 112,810 → 113,511 KiB (tavan 128) · css 13,605 → 13,639 KiB (tavan 14; kalan ≈0,37 KiB — sonraki CSS işleri dar) · p95 4,3 ms.
- Pinler değişmedi: App.kao* 44 · yüzey 765 · atama 603 · yayın 20261003b. Yeni handler yok (native `<details>`).

## Bilerek değişen testler
- yok

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok (değişen yayın varlıkları: quranLearn.js · quranLearnViews.js · kao.css; pin yükseltilmedi) · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- CSS payı dar (≈0,37 KiB): K2F-27/28/29 CSS eklerse tavan 14 KiB'a dayanabilir; mevcut sınıfları yeniden kullanın ya da kullanılmayan kuralları temizleyin.
- Kök anlamı yalnız unit11 köklerinde (162/524 lemma) var; diğerlerinde katman yalnız kognat kayması varsa çıkar (113 lemma), ikisi de yoksa hiç çıkmaz.
- Gerçek akışla ölçülen 12 ünitenin ilk dersi; 109 dersin tamamı için ayrı render taraması yapılmadı (içerik koşullu ve Flow/Views aynı yoldan geçer).
- Kod incelemesi (`code-reviewer`): CRITICAL/HIGH/MEDIUM 0, APPROVE; 3 LOW → (1) `summary:focus-visible` halkası eklendi, (3) `derivatives.map` açık işlevle yazıldı, (2) `display:flex` üçgeni gizler ama `.kao-lesson-term summary` ile tutarlı → bilerek bırakıldı. Kapılar bu düzeltmelerden sonra yeniden yeşil.
