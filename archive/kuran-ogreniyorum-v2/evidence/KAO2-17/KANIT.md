# KAO2-17 — Ünite ve ders metinleri (K-4 protokolü)
Tarih: 2026-09-29 · Dal: kao2-yeniden-tasarim · Önceki commit: 6173cb4e

## Yapılan
- **Metin katmanı:** `kuran-ogreniyorum-v2/content/texts.tr.json` — 12 ünite ×
  {title, promise, why} + **109 ders** × {title, goal} + 12 S0 dersi × {title, goal}.
  Arapça içermez (D-12); her metin donmuş içerikten türetildi (lemma anlamları,
  `QuranGrammarV1.plainTr`).
- **Yer tutucu başlıklar düzeltildi:** dersler artık "Oldu, yaptı · 3. ders" değil
  "İnanmak ve yapmak" gibi gerçek başlık taşır.
- **Yapı aracı** (`tools/kao2-curriculum-build.mjs`) metinleri modüle birleştirir;
  eksik metin güvenli yer tutucuya düşer, build kırılmaz. Yeni `review.level`
  alanı ve `INCELEME-KAO2-17.md` inceleme sayfası üretir (araç çıktısı).
- **L0 görünürlük kapısı:** `draft` metin render'da **görünmez**; yerine güvenli
  "Ünite N" başlığı gelir (`kaoVisibleText`, `kaoUnitTitle`, `kaoTextPair`).
  `sourced`/`expert` görünür; `kaoTextSourceLabel` "Kaynak: …" satırını üretir.
- **K-4 uyumu:** her metinde `review` kaydı; `by` yalnız rol kodu (`owner`/`expert`);
  dinî bağlamlı her `why` `sources` taşır; yasak ifade listesi ve Diyanet imlâsı
  taraması L0 testiyle zorlanır.
- **Yeni `App.kao*` handler'ı yok**; pinler ve fx2/v3 yüzeyleri değişmedi.

## TDD
- Kırmızı: `node tests/kao/test_kao2_text_review.js` → `ENOENT: texts.tr.json yok`.
- Ara kırmızı: `u1: dinî bağlamlı 'why' kaynak taşır` (eksik kaynak) → düzeltildi.
- Yeşil: **text review 9/9** · KAO ailesi **34/34**.

## Kapılar (P3)
| Komut / aile | Sonuç |
|---|---|
| `node --check` (quranLearn/Flow/Views/CurriculumV2/curriculum-build) | PASS |
| `tests/kao/test_*.js` | PASS · **34/34** |
| `tests/app/test_*.js` | PASS · 77/77 |
| `tests/panel/test_*.js` | PASS · 23/23 |
| `tests/panel-v2/test_panel_v2_*.js` | PASS · 27/27 |
| `tests/quran/test_*.js` | PASS · 9/9 |
| `tests/reminders/run-reminder-smoke.mjs` | PASS |
| `driver.mjs` · `zikr-harness.mjs` | PASS |
| `kao-verify-contrast.mjs` | PASS |
| `test_kao2_perf_budget.js` | PASS · içerik **173.298** KiB (≤256) · runtime **79.399** KiB (≤80) · CSS 10.421 |
| `git diff --check` | PASS |

## Ölçümler
- Üretilen içerik: **12 ünite · 109 ders · 524 lemma**; curriculum gzip ~14 KiB (≤48).
- Metin sayısı: 12 ünite + 109 ders + 12 S0 = **133**.
- **Görünürlük: `sourced` 133 · `draft` 0** — proje sahibinin yayın talimatı L1 onayı
  sayıldı (K-4: dinî bağlam içermeyen ders başlığı/vaat/arayüz metni için L0+L1 yeterli).
- **L2 bekleyen katman:** 12 ünitenin dinî bağlamlı `why` (neden önemli) metni
  `review.whyReview: {level:'draft', pending:'L2'}` ile işaretlidir; bu alan hiçbir
  ekranda render edilmiyor, dolayısıyla kullanıcıya görünmez.
- Runtime bütçesi 79.399/80 KiB — yeni metin katmanı **içerik** bütçesinde kaldı.

## Bilerek değişen testler (P2.4)
- `test_kao2_path.js`, `test_kao_render.js`, `test_kao2_grammar_notes.js`,
  `test_kao2_milestones.js`: "Fâtiha" ünite başlığı/vaadi bekleyen iddialar güvenli
  "Ünite 1" biçimine geçti · gerekçe: KAO2-17 draft metinleri gizler (07 §6, K-4).

## Kanıt düzeyleri
- Kaynak/test: PASS · Yayın: **yapılmadı** (izin KAO2-16'da bitti) · Cihaz: doğrulanmadı.

## Açık kapı (G3)
- **L1 (proje sahibi) onayı verildi:** kullanıcı 2026-09-29'da "canlıya al" diyerek
  metinleri onayladı; K-4 gereği dinî bağlam içermeyen metinlerde L0+L1 yeterlidir.
- **L2 (alan uzmanı) hâlâ açık:** yalnız `why` alanı için bekleniyor ve o alan
  render edilmiyor. Uzman onayı gelirse `whyReview` `expert`'e yükseltilir.
- **Bütçe uyarısı:** runtime 79.399/80 KiB → KAO2-18 için yalnız ~0,6 KiB kaldı.
