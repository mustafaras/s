# IIP-12 · scope gate

## İzlenen kapsam

**Üretim (allowlist):** `app/core/saygi.js`, `app/core/render.js`
**Test (allowlist):** `tests/app/test_saygi_boundary.js`, `tests/app/test_zikir_boundary.js`,
`tests/app/test_quran_boundary.js`, `tests/app/test_iip_12.js`

## Gerçek değişiklik

| Dosya | Değişiklik |
|---|---|
| `app/core/saygi.js` | IIP-12 kürasyon + devam katmanı; hub bağlantısı; NS dışa aktarım |
| `tests/app/test_iip_12.js` | **YENİ** — 92 kontrol |
| `app/core/render.js` | **Değişmedi** (pass-through; gövde `saygi.js`'te yaşar) |
| `ilham-ibadet-premium-plan/**` | Plan kaydı + kanıt (kapsam içi, kilitsiz) |

## Allowlist dışına çıkmama kanıtı

- `app.js` ve `app/styles.css` **değiştirilmedi**. Yeni `App.*` üyesi ve yeni CSS
  sınıfı eklenmedi; bu ikisi fixture'da bekçiyle sabitlenmiştir
  (`Bekçi — yeni App.* handler ve yeni CSS sınıfı yok`).
- `render.js` içinde üretim davranışı eklenmedi; kartın izin listesinde olması bir
  zorunluluk değil, sınır güvencesidir.

## Kilit / sahiplik

- Kilit: **yok** (`plannedWriteFiles` boş, `locks` boş).
- Veri yazıcısı: **false**.
- Kaynak kilidi: yok. Başka kartın kilidi sahiplenilmedi.

## Ağ / depo / veri

- Fixture ve kanıt üreteci **no-network, no-DOM, no-storage**'dır; `node:vm`
  içinde `fetch`/`localStorage`/timer sayaçları kapalıdır.
- Gerçek token, GPS, kişisel veri veya `seyma-data` yazımı **yoktur**.
- Sentetik görsel artifact `render-matrix.html` yasaklı alan taramasından
  geçmiştir (token/anahtar/koordinat yok).

## Kapsam dışı işaretlenenler

- "Geç / başka içerik" eylemi (REQ kapsamında değil; `app.js` gerekir).
- Tematik seçki içeriği (plana göre içerik yazılmamış; uydurulmadı).
- Cihaz/ekran okuyucu/tarayıcı/yayın kabulü.
