# IIP-13 · requirements gate

Fixture: `tests/app/test_iip_13.js` — **80 kontrol, 80 PASS / 0 FAIL**
Ağsız `node:vm`; sentetik `data`/`ui`; gerçek `app/core/prayer.js` + `app/core/saygi.js`.

## REQ-025 / TC-025 — Tazelik

**Kabul:** Tarih/şehir/yöntem eşleşmeyen cache açıkça eski olarak gösterilir.
**Olumsuz:** Gece yarısı, şehir değişimi, timeout ve yöntem değişimi **sahte güncel saat** üretmez.

| Senaryo | Beklenen | Sonuç |
|---|---|---|
| Hiç önbellek yok | `none`, "güncel" denmez, kullanılamaz | PASS |
| Taze kayıt (aynı gün/konum/yöntem) | `fresh`, `usable=true`, yaş taşır | PASS |
| 48 saati aşan kayıt (72 sa) | `stale`, `usable=false`, etiket "Eski" | PASS |
| **Yöntem uyuşmazlığı** (kayıt Diyanet, sorgu MWL) | `mismatch`, kullanılamaz, iki yöntem adı | PASS |
| **Şehir değişimi** (kayıt İstanbul, sorgu Ankara) | kayıt **bulunmaz** (`none`); sızma yok | PASS |
| **Gün değişimi** (dünkü kayıt bugün için) | kayıt bulunmaz | PASS |
| **Gece yarısı** (`prayerDayFreshness`, kayıt dün 23:50) | `otherday`, `dayMatch=false`, iki tarih | PASS |
| Aynı gün kaydı | `fresh`, `dayMatch=true` | PASS |
| Kayıt yok | `none`, stale | PASS |
| Bozuk zaman damgası | `stale`, `ageH=null` | PASS |

Overlay (kullanıcının gördüğü yüzey) senaryoları:

| Kayıt durumu | Basılan etiket | Sonuç |
|---|---|---|
| `fetchError` (timeout/hata) | `Güncelleme hatası` + "eski saatler gösterilmiyor"; "Önbellek hazır"/"Bugüne ait" **yazmaz** | PASS |
| Başka güne ait | `Başka güne ait`, "Bugüne ait" **yazmaz** | PASS |
| Yöntem uyuşmazlığı | `Yöntem uyuşmuyor` + iki yöntem adı | PASS |
| Konum uyuşmazlığı | `Konum uyuşmuyor` | PASS |
| Taze + eşleşen | `Bugüne ait`, `is-ready` | PASS |
| Kayıt yok | `Saatler bekleniyor`, `is-idle` | PASS |

Salt-okur kanıtı: tazelik yardımcıları çalışırken depo **yazımı** ve `save()`
**çağrısı** artmaz, `fetch` **0** kalır.

## REQ-026 / TC-026 — Kapsam

**Kabul:** Türkiye kapsamı açık; seyahat için otomatik destek iddiası yok.
**Olumsuz:** GPS yurtdışında olsa bile **Istanbul saati yerel saat diye sunulmaz**.

| Senaryo | Beklenen | Sonuç |
|---|---|---|
| İstanbul / Ankara koordinatı | TR kutusunda `true` | PASS |
| Berlin / Londra | TR kutusunda `false` | PASS |
| Geçersiz koordinat | TR sayılmaz | PASS |
| TR içi kapsam | `inside`, ayrıntıda **81 il + Diyanet**, `needsOwnTimezone=false` | PASS |
| Yurtdışı kapsam | `outside`, **"yerel saat olarak sunulmaz"**, `needsOwnTimezone=true` | PASS |
| Konum yok | `none` | PASS |
| **GPS Berlin** overlay'de | `Türkiye dışı` + yerel saat iddiası reddi; **"Türkiye kapsamı içinde" YAZMAZ** | PASS |
| GPS İstanbul overlay'de | `Türkiye kapsamı içinde` | PASS |
| Konum yokken hücre | `Konum yok`, tam **1 kez** basılır | PASS |

## Durum matrisi (brief: boş/yükleniyor/hata/dönüş)

| Durum | Beklenen | Sonuç |
|---|---|---|
| **boş** (kayıt yok) | `none`, hiç "güncel" denmez | PASS |
| **yükleniyor** (yazma→okuma) | `fresh` döner (ağ yok, sentetik) | PASS |
| **hata** (depoda bozuk JSON) | çökmez, `none` döner | PASS |
| **dönüş** (aynı girdi) | tazelik ve kapsam çıktısı **deterministik** | PASS |

## Determinizm bekçisi (IIP13-REV-01)

| Kontrol | Kanıt |
|---|---|
| Render tazelik yolu gerçek-saat yaş hesabı **kullanmaz** | `faithPrayerFetchMeta` gövdesinde `prayerAgeInfo`/`Date.now` **yok** |
| Render yolu gün/metot/konum eşleşmesini kullanır | `slice(0,10)!==today`, `fetchedMethod`, `fetchedFor` |
| Yaşa dayalı bayatlama açıkça `prayerCacheFreshness(nowMs)` ile | `prayer.js`'te `nowMs` parametreli |

Mutasyon kanıtı: `prayerAgeInfo` render yoluna geri konunca fixture **5 FAIL**
verdi (kusur yakalandı), geri alınınca yeniden **80/80**.
