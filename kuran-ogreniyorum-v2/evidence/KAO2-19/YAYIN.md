# KAO2-19 — Canlı yayın kanıtı
Tarih: 2026-09-30 · Dal `kao2-yeniden-tasarim` = `main` · Commit **`fcb1306b`**

## Yayın
- Push: `origin main` + `origin kao2-yeniden-tasarim` (aynı commit).
- Action: **run 36676853283** (`Deploy static content to Pages`) → **success**.
- Pin: `20260929g` → **`20260930a`**.

## Canlı doğrulama (SHA-256, byte-eşleşme)
`app/core/quranLearn.js` · `quranLearnFlow.js` · `quranLearnViews.js` · `app.js` ·
`app/content/quranCurriculumV2.js` · `app/kao.css` · `sw.js` · `index.html`
→ **8/8 EŞLEŞTİ, 0 farklı**.

Okuyucu v2 kodu canlı dosyada mevcut (`kaoReaderPlayWords` → 2 geçiş).

## Gizlilik
`kuran-ogreniyorum-v2/KAO2-STATE.json` → **404** ·
`kuran-ogreniyorum-v2/inceleme/INCELEME-KAO2-19.md` → **404**.

## Canlı pin teyidi
`index.html` → `quranLearn.js?v=20260930a` · `sw.js` → `SW_VERSION = '20260930a'`.

## Kanıt düzeyleri (ayrı tutulur)
- **Kaynak/test:** PASS — KAO 37/37 · app 77/77 · panel 23/23 · panel-v2 27/27 ·
  quran 9/9 · reminders/driver/zikr/contrast PASS · perf PASS.
- **Yayın:** PASS — run success, 8/8 byte-eş, gizlilik 404, pin `20260930a`.
- **Cihaz kabulü:** **YAPILMADI.** Gerçek telefonda okuyucu v2 açılmadı; ses dinlemesi
  ve ekran okuyucu testi ajan tarafından yapılmadı.
