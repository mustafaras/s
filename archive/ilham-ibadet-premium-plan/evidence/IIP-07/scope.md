# IIP-07 scope kanıtı

Kart: IIP-07 · Zikir ve Kur’an geçiş tutarlılığı

Bu oturumda yalnız kartın canlı brief allowlist’i kullanıldı:

- `app/core/zikir.js`
- `app/core/render.js`
- `app/styles.css`
- `tests/app/test_iip_07.js`

Zikir sayaç/manual/undo/not ve Kur’an video/not/remote durumlarının mevcut ID,
handler ve hedefli boyama sınırları korunmuştur. `app.js`, `app/core/quran.js`,
data/migration/sync ve hesap/sensör davranışı değiştirilmedi. Browser, ağ,
gerçek token, localStorage, kişisel veri ve canlı veri deposu kullanılmadı.
