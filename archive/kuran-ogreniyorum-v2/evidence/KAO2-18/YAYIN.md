# KAO2-18 — Canlı yayın kanıtı
Tarih: 2026-09-29 · Dal `kao2-yeniden-tasarim` = `main` · Commit **`5df049a5`**

## Yayın
- Push: `origin main` + `origin kao2-yeniden-tasarim` (fast-forward, aynı commit).
- Action: **run 36599610574** (`Deploy static content to Pages`) → **success**.
- Pin: `20260929f` → **`20260929g`** (`index.html` + `sw.js`, ortak).

## Canlı doğrulama (SHA-256, byte-eşleşme)
| Dosya | Sonuç |
|---|---|
| `app/core/quranLearn.js` | EŞLEŞTİ |
| `app/core/quranLearnFlow.js` | EŞLEŞTİ |
| `app/core/quranLearnViews.js` | EŞLEŞTİ |
| `app/content/quranCurriculumV2.js` | EŞLEŞTİ |
| `app/content/quranConceptTextsV1.js` (yeni) | EŞLEŞTİ |
| `app/kao.css` | EŞLEŞTİ |
| `sw.js` | EŞLEŞTİ |
| `index.html` | EŞLEŞTİ |

**8/8 eşleşti, 0 farklı.**

## Gizlilik
Özel malzeme yayında **404** olmalı — doğrulandı:
`kuran-ogreniyorum-v2/KAO2-STATE.json` → 404 · `content/texts.tr.json` → 404 ·
`.anti-amnesia/LEDGER.md` → 404.

## Canlı pin teyidi
`index.html` → `quranLearn.js?v=20260929g` · `sw.js` → `SW_VERSION = '20260929g'`.

## Kanıt düzeyleri (ayrı tutulur)
- **Kaynak/test:** PASS — KAO 35/35 · app 77/77 · panel 23/23 · panel-v2 27/27 ·
  quran 9/9 · reminders/driver/zikr/contrast PASS · `git diff --check` temiz.
- **Yayın:** PASS — run success, 8/8 byte-eş, gizlilik 404, pin `20260929g`.
- **Cihaz kabulü:** **YAPILMADI.** Bu belge cihazda çalıştığını iddia etmez;
  gerçek telefonda KAO2-17/18 yüzeyi hiç açılmadı.
