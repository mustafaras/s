# KAO2-20 — Canlı yayın kanıtı
Tarih: 2026-09-30 · Dal `kao2-yeniden-tasarim` = `main` · Commit **`326c01ed`**

## Yayın
- Push: `origin main` + `origin kao2-yeniden-tasarim`.
- Action: **run 36678178666** (`Deploy static content to Pages`) → **success**.
- Pin: `20260930a` → **`20260930b`**.

## Canlı doğrulama (SHA-256, byte-eşleşme)
`app/core/quranLearn.js` · `app.js` · `app/kao.css` · `sw.js` · `index.html`
→ **5/5 EŞLEŞTİ, 0 farklı**.

## Gizlilik
`kuran-ogreniyorum-v2/KAO2-STATE.json` → **404** · plan klasörü yayında değil.

## Canlı pin teyidi
`sw.js` → `SW_VERSION = '20260930b'`.

## Kanıt düzeyleri (ayrı tutulur)
- **Kaynak/test:** PASS — KAO 38/38 · app 77/77 · panel 23/23 · panel-v2 27/27 ·
  quran 9/9 · reminders/driver/zikr/contrast PASS · perf PASS.
- **Yayın:** PASS — run success, 5/5 byte-eş, gizlilik 404, pin `20260930b`.
- **Cihaz kabulü:** **YAPILMADI.**

## Açık risk
Çalışma zamanı bütçesi **86.032 / 88 KiB (%98)**. KAO2-21+ için bütçe revizyonu
kullanıcı kararıdır.
