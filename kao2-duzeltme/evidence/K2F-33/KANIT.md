# K2F-33 — Kelime detayı ders bağlantısı
Tarih: 2026-10-04 · Dal: kao2-duzeltme · Önceki commit: 19ed250f · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K6-05 · R değişimi: yok (10/10)

## İlerleme günlüğü
- [x] P1: sync PASS, nextPrompt K2F-33, dal kao2-duzeltme
- [x] kırmızı: test_kao2_word.js `ders satırı yok: Besmele`
- [x] `kaoWordLessonRowHTML` (lemmaToLesson + byLesson + kaoSafeLessonTitle), "Derse git" → kaoNav('unit',N)
- [x] ekran görüntüsünde iki benzer düğme ve yapışık bölüm görüldü → ders bağlantısı varken "Derse dön" gösterilmez, `.kao-word-learning` margin-top (kırmızı→yeşil)
- [x] kapılar YEŞİL, bağımsız code-reviewer APPROVE (CRITICAL/HIGH/MEDIUM 0)

## Yapılan
- Kelime detayı "Öğrenme durumu"nda "Bu kelimenin dersi: Ünite N · <ders başlığı>" + "Derse git". Başlık draft'ta güvenli etikete düşer (kaoSafeLessonTitle). lemmaToLesson'da olmayan lemmada satır gizli, genel "Derse dön" yedeği kalır.
- Yeni handler yok (mevcut kaoNav), pinler 45/766/604 sabit.

## TDD
- Kırmızı: `node tests/kao/test_kao2_word.js` → `ders satırı yok: Besmele`
- Yeşil: 13 kontrol PASS (+2) · test_kao2_design_contract.js PASS (+spacing sözleşmesi)

## Kapılar (P3)
kapilar.sh: TÜM KAPILAR YEŞİL (kao 53 · app 77 · panel 23 · panel-v2 27 · quran 9 …) · tekrar-uret 10/10 · css 13,604 KiB · runtime 115,787 KiB

## Kanıt düzeyleri
- Kaynak/test ✓ · yerel görsel ✓ (`sonra-09-kelime-detayi.png`) · Yayın: yok · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- Reviewer'ın eşzamanlı koşumunda perf_budget kırmızı gördü; yük kaynaklı, tek başına kapı koşumunda PASS.
