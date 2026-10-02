# K2F-23 — Uygula 1/2 — örnek cümleler
Tarih: 2026-10-02 · Dal: kao2-duzeltme · Önceki commit: b1e87886 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K3-01 · R değişimi: R-08 fail→pass (hedef)

## İlerleme günlüğü
- [x] P1: sync PASS (--clean --repro), dal kao2-duzeltme, nextPrompt K2F-23
- [x] ölçüm: 109 dersin 97'sinde `apply.kind="examples"` (kurucusu yok → içeriksiz), 6 prayer + 6 surah çapalı; 524/524 lemma `verified:true` ve `examples[0]` tam (ar, tr, ref, pronunciation)
- [x] TDD: 3 yeni kontrol yazıldı (test_kao2_lesson_flow.js) → kırmızı görüldü
- [x] Flow `applySentences` + apply `mode:'examples'`; motor model; görünüm `kao-lesson-sentences`; css 5 kural (yalnız token)
- [x] yeşil: lesson_flow 11 kontrol PASS; `tekrar-uret` 10/10; kapilar.sh YEŞİL
- [x] harness: `playLesson` `stopAt` seçeneği (geriye uyumlu)

## Yapılan
- `quranLearnFlow.js`: `applySentences(content, fresh, eligible)` — dersin lemmalarından (önce yeni, sonra diğerleri) en çok 3 doğrulanmış `examples[0]`; `apply.mode='examples'` + `apply.sentences[{lemmaId, ar, pronunciation, tr, ref, lemmaPronunciation}]`. Arapça/okunuş/çeviri yalnız lexicon'dan; `verified !== true` ya da eksik alanlı örnek atlanır.
- `quranLearn.js`: apply modeli `mode:'examples'` için başlık "Örnek cümleler" + cümleler.
- `quranLearnViews.js`: cümle kartı — Arapça, okunuş, Türkçe, "Âyet <ref> · Bu dersin kelimesi: <okunuş>"; liste boşsa liste çizilmez.
- `app/kao.css`: `.kao-lesson-sentence*` (yalnız --kao-*/--f-* tokenları).

## TDD
- Kırmızı: `node tests/kao/test_kao2_lesson_flow.js` → "uygula adımı içeriksiz" (97/109)
- Yeşil: `node tests/kao/test_kao2_lesson_flow.js` → 11 kontrol PASS; `node kao2-duzeltme/denetim/tekrar-uret.cjs` → R-08 PASS

## Kapılar (P3)
kapilar.sh: tests/kao 52 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync PASS
tekrar-uret: 10/10 PASS (önceki 9/10)

## Ölçümler
- Uygula adımı içerikli ders: 109/109 (97 örnek cümle · 12 çapa metni); içeriksiz: 0
- Cümle sayısı/ders: 1–3; tüm lemmalar `verified:true`
- Perf: runtime 112,597 KiB (tavan 128) · css 13,605 KiB (tavan 14) · içerik 184,986 KiB (tavan 256)

## Bilerek değişen testler
- Yok (yalnız genişletme: test_kao2_lesson_flow.js +3 kontrol; harness `stopAt`).

## Kanıt düzeyleri
- Kaynak/test ✓ · Yayın: yok (değişen yayın varlıkları: quranLearnFlow.js, quranLearn.js, quranLearnViews.js, kao.css; pin yükseltme yok) · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- Ders oynatıcıda "Uygula" adımı artık 97 derste cümle gösterir; telefonda gözle bakılmalı (Arapça cümle sağa yaslı, 3 satır alt metin).
- K2F-24 Ünite 2'nin 6 `prayer` çapasını `lp_*`→`l_*` eşlemesiyle bağlayacak.
