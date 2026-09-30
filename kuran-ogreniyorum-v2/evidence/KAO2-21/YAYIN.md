# KAO2-21 — Canlı yayın kanıtı
Tarih: 2026-09-30 · Dal `kao2-yeniden-tasarim` = `main` · Commit **`98e8f2df`**

## Yayın
- Action: **run 36697504567** → **success**. Pin: `20260930d` → **`20260930e`**.

## Canlı doğrulama (SHA-256, byte-eşleşme)
`app/core/quranLearn.js` · `app/kao.css` · `sw.js` · `index.html` ·
`app/content/quranMahrecSchemasV1.js` · `app/content/quranCurriculumV2.js`
→ **6/6 EŞLEŞTİ, 0 farklı**.

## Gizlilik
`KAO2-STATE.json` → **404** · `evidence/KAO2-21/KANIT.md` → **404**.

## Kanıt düzeyleri
- **Kaynak/test:** PASS — KAO 39/39 · app 77/77 · panel 23/23 · panel-v2 27/27 ·
  quran 9/9 · reminders/driver/zikr/contrast/iip_22 PASS.
- **Yayın:** PASS — run success, 6/6 byte-eş, gizlilik 404, pin `20260930e`.
- **Cihaz kabulü:** **YAPILMADI** (gerçek ses dinlemesi ve ekran okuyucu dâhil).

## Açık risk
Çalışma zamanı bütçesi **87.423 / 88 KiB (%99.3, pay 0.6 KiB)**. Sonraki kart yeni
çalışma zamanı kodu getirmemeli.
