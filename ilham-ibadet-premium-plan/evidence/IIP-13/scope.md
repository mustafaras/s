# IIP-13 · scope gate

## İzlenen kapsam

**Üretim (allowlist):** `app/core/prayer.js`, `app/core/saygi.js`
**Test (allowlist):** `tests/app/test_saygi_boundary.js`, `tests/app/test_prayer_boundary.js`, `tests/app/test_iip_13.js`

## Gerçek değişiklik

| Dosya | Değişiklik |
|---|---|
| `app/core/prayer.js` | IIP-13 salt-okur tazelik/kapsam yardımcıları (7 yeni export) |
| `app/core/saygi.js` | `faithPrayerFetchMeta` zenginleştirildi; `faithCoverageMeta` eklendi; çekmeceye koşullu **Kapsam** hücresi |
| `tests/app/test_iip_13.js` | **YENİ** — 80 kontrol |
| `tests/app/test_prayer_boundary.js` | **Değişmedi** (19/19 geçer) |
| `tests/app/test_saygi_boundary.js` | **Değişmedi** (20/20 geçer) |
| `ilham-ibadet-premium-plan/**` | Plan kaydı + kanıt (kapsam içi, kilitsiz) |

## Allowlist dışına çıkmama kanıtı

- `app.js` **değiştirilmedi** (izinli değil). GPS/permission akışı, konum izni,
  `App.refreshPrayerTimes` ve hata yolu dokunulmadı.
- `app/styles.css` **değiştirilmedi**; yeni CSS sınıfı yazılmadı. Kapsam hücresi
  mevcut `.sg-tool-meta-grid` düzenini ve stilli `is-ready/is-error/is-idle`
  durum sınıflarını yeniden kullanır.
- Yeni zorunlu bağımlılık eklenmedi: `SAYGI_DEPENDENCIES` 15, `PRAYER_DEPENDENCIES`
  10 öğede sabit kaldı (fixture bekçisiyle sabitlenmiştir). Yeni yardımcılar
  mevcut `window.SeymaPrayer` kanalından çözülür.
- `index.html` cache-bust: **bump gerekti** (`prayer.js` ve `saygi.js` değişti) ve
  entegratör yayın işi olarak yapıldı; kartın izin listesi dışında olduğu için
  kanıt `changedFiles` listesine **yazılmadı** (IIP-12'de plan-check'in doğru
  şekilde reddettiği nokta).

## Kilit / sahiplik

- Kilit: **yok** (`plannedWriteFiles` boş, `locks` boş).
- Veri yazıcısı: **false**. Kaynak kilidi: yok. Başka kartın kilidi sahiplenilmedi.

## Ağ / depo / veri

- Fixture'lar ve kanıt üreteci **no-network, no-DOM**'dur; `fetch` daima reddeden
  bir stub, `localStorage` bellek içi, timer'lar no-op.
- Gerçek token, GPS, kişisel veri veya `seyma-data` yazımı **yoktur**.
- Sentetik artifact (`render-matrix.html`) yasaklı alan taramasından geçmiştir
  (token/anahtar/koordinat parametresi/localStorage yok).

## Kapsam dışı işaretlenenler

- Vakit **satırı** saatlerinin kayıt karşısında doğrulanması.
- Türkiye dışı için gerçek yerel saat hesabı.
- Cihaz/ekran okuyucu/tarayıcı/yayın kabulü.
