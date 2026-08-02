# REPO-L0 — Runtime Girişleri ve Bağımlılık Haritası

**Tarih:** 2026-08-02
**Durum:** `completed` — yalnızca read-only envanter
**Kapsam:** Build’siz GitHub Pages runtime’ı, app/panel sınırları ve uzun
dosya modül adayları
**Kod değişikliği:** Yok
**Kullanıcı verisi:** Okunmadı/yazılmadı

## 1. Runtime giriş grafiği

```text
index.html
├── styles.css?v=...
├── frozen content modules
│   ├── motivationProgramV2.js
│   ├── motivationNarratives.js
│   ├── saygiPeople.js
│   ├── profileAssessmentV1.js
│   ├── hijriCalendar.js
│   ├── quranRevelationOrderV1.js
│   ├── quranTransportV1.js
│   ├── quranStrikingVersesV1.js
│   ├── esmaulHusnaV1.js
│   ├── esmaulHusnaV2.js
│   └── zikirCoreContentV1.js
├── app.js?v=20260802d
├── sync.js?v=20260802c
└── sw.js?v=20260802c  (service worker registration)

panel.html
├── external Leaflet 1.9.4 script
├── local content/transport modules (panel-specific cache versions)
└── one inline style block + one inline application script block
```

`index.html` script sırası davranışsal bir sözleşmedir: içerik modülleri
`app.js`’ten önce, `sync.js` ise `app.js`’ten sonra yüklenir. Bu sırayı
değiştirecek her modül ayırma işleminde yeni bir harness kapısı gerekir.

### L2-a sonrası sıra notu

Bu L0 belgesi başlangıç envanteridir. `REPO-L002` sonrasında güncel girişte
`app/core/constants.js` içerik modüllerinden sonra ve `app.js`ten hemen önce
yüklenir; kritik sıra artık `constants.js → app.js → sync.js` şeklindedir.
L2-a ayrıntılı byte/hash kanıtı [`REPO-L2-CONSTANTS-RECEIPT.md`](REPO-L2-CONSTANTS-RECEIPT.md)
içindedir.

## 2. Mevcut ölçüm

| Dosya | Satır | Ölçüm | Risk |
|---|---:|---|---|
| `app.js` | 13.606 | 852 function, 441 `App.*` handler ataması, 281 HTML/render çağrısı | Global state ve inline handler bağımlılığı çok yüksek |
| `panel.html` | 4.114 | 1 inline `<style>` (21.042 karakter), 1 büyük inline script (317.203 karakter), 34 `onclick` | CSS/JS/HTML sınırı görünmüyor |
| `styles.css` | 1.230 | Ortak token, tema, layout, component ve overlay kuralları | Sıra değişimi tema/overlay regresyonu doğurabilir |
| `sync.js` | 809 | `window.SeySync`, full-replace/merge, anti-clobber ve outbox sınırları | Veri kaybı riski; ilk modülerleştirme adayı değil |
| `motivationProgramV2.js` | 5.192 | Frozen content module | İçerik hash/version bütünlüğü |
| `profileAssessmentV1.js` | 4.186 | Frozen scientific assessment content | Item/score değişimi bilimsel veri riski |

## 3. Bağımlılık sınırları

### `app.js`

- Tek IIFE içinde `data`, `ui`, `App`, `ICONS`, `render`, `save` ve tüm
  feature helper’ları birlikte yaşıyor.
- En yoğun kalıcı kökler `data.days`, `data.settings`, `data.aeon`,
  `data.weather`, `data.cycle`, `data.saygi`, `data.profileAssessment`.
- En yoğun ephemeral kökler `ui.tab`, `ui.quran*`, `ui.zikr*`, `ui.saygi*`,
  `ui.room*`, `ui.crisis*`.
- Dış modül sınırları `window.MotivationProgramV2`,
  `window.MotivationNarratives`, `window.ProfileAssessmentV1`,
  `window.HijriCalendarV1`, `window.QuranTransportV1` ve
  `window.SeySync` üzerinden kurulmuş.
- `onclick="App..."` kullanımı nedeniyle `App` adlarını korumadan dosya
  bölmek davranış değişikliği olur.

### `sync.js`

- `window.SeySync` public API’sini sağlar.
- `app.js` tarafından `schedule(data)` ve profile/Qur’an yardımcılarıyla
  çağrılır.
- Localhost/file guard, anti-clobber guard, sanitize, merge ve outbox yazımı
  aynı sınırda bulunur.
- Bu fazda `sync.js` taşınmadı ve içeriği yeniden düzenlenmedi.

### `panel.html`

- Panel, `app.js` ile kod paylaşmayan bağımsız observer uygulamasıdır.
- `D`, `UI`, panel tokenı ve GitHub Contents API erişimi inline script içinde.
- Panelin veri yazma yüzeyi observer inbox/outbox dosyalarıdır; bu envanter
  sırasında hiçbir çağrı çalıştırılmadı.
- `test_faz11_panel.js` mevcut helper/render isimlerini doğrudan doğrular;
  CSS/JS ayırma öncesi bu sözleşme sabitlenmelidir.

## 4. Güvenli modül sınırı adayları

Uygulanmadı; yalnızca sonraki faz için sınır önerisidir:

```text
app/core/constants.js       # ICONS, sabit kataloglar, salt yardımcılar
app/core/state.js            # default data, migrate, normalize
app/core/persistence.js      # localStorage, save, sync schedule
app/core/render.js           # tab/overlay orkestrasyonu
app/features/quran.js        # QY state machine + UI
app/features/faith.js        # namaz, hicri, kıble
app/features/zikr.js         # Zikirmatik state + UI
app/features/saygi.js        # Saygı/Wikipedia state + UI
app/entry.js                 # mevcut global App yüzeyi

panel.html                   # shell
panel.css                    # inline style extraction
panel.js                     # inline script extraction
```

İlk gerçek refactor `panel.html` CSS/JS ayrımıdır. `app.js` için önce L0
haritası, sonra tek bir düşük-riskli core extraction yapılmalıdır. `sync.js`
ve frozen içerik modülleri bu zincirin dışında tutulmalıdır.

## 5. Runtime güvenlik kuralları

- `seyma-reset-v1`, `ghToken`, `syncUrl`, profil ham cevapları ve GPS ham
  izleri değiştirilmez.
- `sync.js` full-replace/merge/anti-clobber semantiği bu temizlikte
  değiştirilemez.
- `index.html` script sırası ve cache-bust değerleri, gerçek modül taşıması
  olmadan güncellenmez.
- `panel.html` ayrıştırılırsa önce helper isimleri, inline handler’lar ve
  `test_faz11_panel.js` fixture’ları korunur.
- Browser/server açılmaz; headless harness kullanılır.

## L0 kabul kapısı

- [x] `index.html` kaynak sırası çıkarıldı.
- [x] `panel.html` inline style/script sınırı ölçüldü.
- [x] `app.js` global/handler/render yoğunluğu ölçüldü.
- [x] `sync.js` veri güvenliği sınırı belirlendi.
- [x] Frozen içerik modülleri refactor dışı bırakıldı.
- [x] Runtime dosyaları taşınmadı veya değiştirilmedi.
- [x] Kullanıcı verisi, localStorage, `seyma-data` ve ağ yazımı yok.

**L0 sonucu:** `completed`; L1 panel ayrıştırması ayrıca onay ve kendi ledger
sequence’i olmadan başlatılmayacak.
