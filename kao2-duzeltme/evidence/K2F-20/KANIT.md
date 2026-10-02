# K2F-20 — Müfredat yeniden dağıtımı (G2 kapısı)
Tarih: 2026-10-01 · Dal: kao2-duzeltme · Önceki commit: c21d76d3 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K5-03 (2/3, kısmen) · K3-07 (belge) · R değişimi: yok · **Durum: waiting_user (G2)**

## İlerleme günlüğü
- [x] P1: sync PASS, nextPrompt K2F-20, dal kao2-duzeltme
- [x] fizibilite: kategori başına sözlükteki lemma sayısı ölçüldü (zamir 1, ilgi 2, ancak 1, yardımcı fiil 2, olumsuzluk 3 ve Ünite 1/3'te)
- [x] kapı yeniden kullanılabilir yapıldı (`measures`/`shortfall` tek ölçüm kaynağı; birleşik başlık = birleşim kuralı; yardımcı fiil kapalı küme)
- [x] takas araması (benzetimli tavlama, tohumlu): ders boyutları ve sınıf kuralı (fiil↔fiil, isim↔isim, Ü10–11 serbest) sabit, Ünite 1–3 donuk, anlam komşusu çakışmasız
- [x] spec: Ünite 4–12 `focus` (tam sıra) + `lessonSizes`; araç `lessonSizes` destekler, `mastery:false`, eski yol metni düzeltildi
- [x] iki üretim bayt-eşit; 109 ders, 524/524 lemma tek sefer; ders kimlikleri/sıraları/boyutları sabit
- [x] A-6 ilerleme koruması: `carryOver` (Flow) + migration testleri
- [x] MUFREDAT-ESLEME.md yeniden üretildi ("değişenler" + G2 karar noktaları)
- [x] kapilar.sh YEŞİL
- [ ] G2 kullanıcı onayı (bekleniyor)

## Yapılan
- Kelimeler başlık/kavrama göre yeniden dağıtıldı: 26 ders değişti, 41 lemma taşındı (ayrıntı `docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md` "K2F-20 ile değişenler").
- `tools/kao2-curriculum-build.mjs`: spec `lessonSizes` (açık ders sınırları), içerik dersi `mastery:false`, yol metni `docs/kuran-ogreniyorum/kao2/...`, "değişenler" + G2 karar noktaları bölümü (`curriculum.before-k2f20.json` ile karşılaştırma).
- `app/core/quranLearnFlow.js`: `carryOver` — tamamlanmış derse sonradan taşınan ve tanışılmamış kelimeler sıradaki dersin planına eklenir (A-6).
- `tests/kao/test_kao2_lesson_coherence.js`: ölçümler tek kaynak, birleşik başlık kuralı, yardımcı fiil kapalı küme, ANLAM kapsamı genişletildi.

## TDD
- Kırmızı: `node tests/kao/test_kao2_migration.js` (A-6) → AssertionError: taşınan kelime l_a_ad_4fecc8 sıradaki derste tanıştırılır
- Yeşil: aynı komut → PASS (14 kontrol)

## Kapılar (P3)
kapilar.sh: SONUÇ: TÜM KAPILAR YEŞİL (tests/kao 51 · app 77 · panel 23 · panel-v2 27 · quran 9 · fix-sync PASS) · perf: content 184,213 KiB · runtime 111,073 KiB · css 13,560 KiB
tekrar-uret: 9/10 PASS (önceki 9/10)
Not: uzun kapı koşuları arka planda dondurulabiliyor; kapılar ön planda (≈213 sn) koşturuldu.

## Ölçümler
| Ölçüm | Önce (K2F-19 sonu) | Sonra |
|---|---|---|
| ETİKET (kategori/kavram/kök) | 18 ders | 11 ders |
| ÖRNEK (gösterilen âyette hedef kip) | 11 ders | 2 ders (u07.01 %58, u09.02) |
| ANLAM (başlık↔lemma anlamı) | 1 (u06.20) | 1 (u08.07; u06.20 düzeldi) |
- Kalan 11 ETİKET dersi yapısal sınırdır (donmuş ünite, sözlükte yeterli lemma yok, sınıf kuralı); G2'de karar verilir (MUFREDAT-ESLEME.md "G2 karar noktaları").
- `KNOWN_MISMATCH` boş OLAMADI (prompt kabulü): yukarıdaki yapısal sınırlar sözlük/donmuş ünite/başlık metni kararı gerektirir.
- Bütçe: curriculum modülü gzip ≤48 KiB testi PASS.

## Bilerek değişen testler
- test_kao2_curriculum.js: `mastery yalnız son derste` → `içerik dersi mastery:true taşımaz` · gerekçe: ustalık ünite düzeyinde (K2F-05) · K5-03
- test_kao2_lesson_coherence.js: listeler 18/11/1 → 11/2/1; FIXED_SINCE_AUDIT = u09.01, u11.04

## Kanıt düzeyleri
- Kaynak/test ✓ · Yayın yok (değişen yayın varlıkları: quranCurriculumV2.js, quranLearnFlow.js — sonraki YAYIN'da pin) · Cihaz yok

## Sürprizler / sonraki promptlara not
- Ders içerikleri frekans sırasıyla bölündüğü için eski başlıklar lemma-spesifik değildi; yeniden dağıtım başlıkları bozan toplam 26 ders değişikliği K2F-21'de (başlık/hedef yeniden yazımı) tamamlanmalı.
- Benzetimli tavlama bazı eşlerde fayda sağlamayan komşu takasları da yaptı (ör. u04.02 av↔yavma'iz); G2'de yorumlanabilir, onay sonrası K2F-21 metinleri gerçek içeriğe göre yazar.
