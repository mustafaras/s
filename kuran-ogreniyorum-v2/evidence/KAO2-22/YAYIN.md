# KAO2-22 — Canlı yayın kanıtı
Tarih: 2026-09-30 · Dal `kao2-yeniden-tasarim` = `main` · Commit **`f7ee8250`**

## Yayın
- Action: **run 36703079196** → **success**. Pin: `20260930e` → **`20260930f`**.

## Canlı doğrulama (SHA-256, byte-eşleşme)
`app/core/quranLearn.js` · `app/kao.css` · `sw.js` · `index.html` ·
`app/content/quranCurriculumV2.js` → **5/5 EŞLEŞTİ, 0 farklı**.

## Gizlilik / yüzey ayrımı
`kuran-ogreniyorum-v2/KAO2-STATE.json` → **404** ·
`tools/kao2-syllable-audio.mjs` → **404** (araç PWA yüzeyine girmez — doğru).

## Kanıt düzeyleri
- **Kaynak/test:** PASS — KAO 40/40 · app 77/77 · panel 23/23 · panel-v2 27/27 ·
  quran 9/9 · reminders/driver/zikr/contrast/iip_22 PASS.
- **Yayın:** PASS — run success, 5/5 byte-eş, gizlilik 404, pin `20260930f`.
- **Cihaz kabulü:** **YAPILMADI.**

## Açık risk
Çalışma zamanı bütçesi **87.900 / 88 KiB (pay 0.1 KiB)**. Sonraki kart yeni
çalışma zamanı kodu getirmemeli.
