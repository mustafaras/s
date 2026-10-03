# K2F-27 — Tek başlık çubuğu
Tarih: 2026-10-03 · Dal: kao2-duzeltme · Önceki commit: dd8a8594 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K2-01 · O-01 · T-06 · T-07 · K2-07 (başlık kalıntıları) · R değişimi: yok (10/10 korunur)

## İlerleme günlüğü
- [x] P1: sync PASS (27/44, seq 80, pin 20261003d), dal kao2-duzeltme
- [x] Kırmızı test (navigation: tüm görünümler; design_contract: eski seçiciler)
- [x] quranLearnViews.js + quranLearn.js + kao.css
- [x] Etkilenen 4 testin gerekçeli güncellemesi
- [x] code-reviewer (APPROVE), kapılar, P4 kapanış

## Yapılan
- `quranLearn.js` `kaoOverlayHTML`: `<header class="kao-header">` (eyebrow + sabit h1#kao-title + X) kaldırıldı. Dialog adı artık görünümün LargeTitle h2'sinin kimliğinden (`aria-labelledby`) gelir; LargeTitle yoksa (ders oynatıcı) `aria-label`.
- `quranLearnViews.js`: `largeTitle` kimliksiz ilk h2'ye `kao-title` kimliği verir; `renderScreen` oturum görünümünde (görev/özet; `kao-lesson-exit` yoksa) NavBar'a tek "Kapat" ekler; `navBar` oturumu kök sayar.
- `app/kao.css`: 9 kural (`.kao-header*`, `.kao-close`, medya kalıntıları) silindi.
- Escape/Tab sözleşmesi (`App.onModalKeydown(event,App.kaoClose)`, backdrop odaksız) değişmedi.

## TDD
- Kırmızı: `node tests/kao/test_kao2_navigation.js` → `AssertionError: home: eski modal başlığı/X kalmamalı`; `test_kao2_design_contract.js` → `strict tasarım ihlalleri` (removed selectors)
- Yeşil: navigation PASS (15 görünüm + 3 oturum adımı: tek NavBar, tek kapatma, etiket hedefi LargeTitle'da tek), design_contract PASS, a11y 11 kontrol PASS

## Kapılar (P3)
kapilar.sh: tests/kao 53 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · l2-paket · plan-check · sync PASS — SONUÇ: TÜM KAPILAR YEŞİL
tekrar-uret: 10/10 PASS (önceki 10/10)

## Ölçümler
- Bütçe: css 13,613 → 13,451 KiB (tavan 14, pay ≈0,55) · runtime 113,209 → 113,806 KiB (tavan 128) · içerik 183,544 (tavan 256).
- Pinler değişmedi: App.kao* 44 · yüzey 765 · atama 603 · yayın 20261003d.

## Bilerek değişen testler
- test_kao2_s0.js: `aria-labelledby="kao-title"` → dialog adı S0 ana bölgesinin başlık kimliği (daha güçlü) · sabit modal başlığı kalktı · K2-01. `buttons.length >= 3` (Kapat X + geri + birincil) → `>= 2` · X kalktı.
- test_kao2_view_resolution.js: "session NavBar'sızdır (başlık '')" → session NavBar başlığı `KAO_VIEW_TITLES.session` · X kalkınca tek kapatma kontrolü NavBar olmalı · K2-01.
- test_kao_render.js: 44 px listesinde `.kao-close` → `.kao-navbar-action` + `.kao-lesson-exit` (kapatma kontrolleri artık bunlar; kapsam genişledi).
- test_kao2_design_contract.js: kaldırılmış seçici listesine `.kao-header`, `.kao-header-copy`, `.kao-close` eklendi.

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok (değişen yayın varlıkları: quranLearn.js · quranLearnViews.js · kao.css; pin yükseltilmedi) · Cihaz: yok (kullanıcıda; NavBar üst boşluğu/safe-area gerçek cihazda gözlenmedi)

## Sürprizler / sonraki promptlara not
- code-reviewer: CRITICAL/HIGH 0 · MEDIUM 1 · LOW 3. MEDIUM: görev aşamasında NavBar "Kapat" `App.kaoClose()` (overlay kapanır, `ui.kaoLesson` bellekte kalır), ders ekranının "Kapat"ı `kaoLesson('exit')` (kaydet + ana ekran); Escape de `kaoClose`. Eski X ile aynı davranış, regresyon değil; ders ilerlemesinin görev aşamasında kapanışta kaydı ayrıca doğrulanmadı.
- LOW (cihazda bakılacak): `.kao-body` `padding-top:22px` NavBar'ın üstüne ek boşluk bırakabilir; NavBar arka planı (`--kao-bg`) ile dialog yüzeyi farklıysa bant görünebilir. Tarayıcı gözlemi yok.
- LOW: oturum NavBar başlığı sabit "Oturum"; ilk kimlikli h2 sonrası ikinci kimliksiz h2 olursa `kao-title` ona gider (zararsız, etiket ilk kimlikli h2'den alınır).
