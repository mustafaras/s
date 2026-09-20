# IIP-04 kaynak fişi

Tarih: 2026-09-20 · Baseline HEAD: `fe8b35a82525cfb137a0fabf504a775285d4bbc5`

Bu fiş yalnız kaynak/CSS ve sentetik test sözleşmesini okur; kişisel veri, localStorage, token, remote data veya cihaz yüzeyi kullanılmamıştır.

## Korunan akış

- `app/core/saygi.js:239-241` mevcut hub çağrı sırasını korur: `faithNavHTML()` → `spiritBarHTML()` → `qiblaHubCardHTML()` → `quranHub()` → `saygiPreviewHubHTML()`.
- Beşli görünür nav sırası `Öz → Öncü → İman → Zikir → Rapor`; zikir gizliyken mevcut dört öğeli fallback korunur.
- `App.setFaithTab(x[0])` çağrısı aynen korunur. Seçili öğe `aria-current="page"` ve `aria-pressed="true"`; seçili olmayanlarda `aria-current=false` üretilmez.
- `saygiPreviewHubHTML` içindeki Öz/Öncü/İman/Zikir/Rapor dalları; `saygiLoadingHTML`, hata/yeniden dene ve `saygiComingSoonHTML` durumları korunur.

## IIP-04 görsel düzeltmeleri

- `app/styles.css:141,685`: sayfa ve preview hub ortak dikey aralığı 12px'e çekildi.
- `app/styles.css:900-919`: dört/beş öğeli nav için auto-fit grid, dar/büyük metin için sarılabilir etiket ve kart durumları, seçili öğe için renk+şekil+metin vurgusu, görünür focus, kart footer/metric sarma ve reduced-motion koruması uygulandı.
- Hesap, state/data şekli, handler gövdesi, network ve render çağrı sırası değiştirilmedi.
