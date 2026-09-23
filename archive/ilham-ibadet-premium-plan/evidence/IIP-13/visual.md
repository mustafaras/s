# IIP-13 · visual gate

## Artifact

`render-matrix.html` — **8 sahne**, gerçek `app/core/prayer.js` +
`app/core/saygi.js` registry çıktısından `build-render-matrix.js` ile üretilir
(no-DOM, no-network, no-storage). Statik bir anlık görüntüdür; onu üreten tek
seferlik araç kanıt dizininden çıkarılmıştır (yeniden üretim, fixture §1–§5'teki
VM kurulumuyla yapılabilir).

Artifact **sentetiktir**; kişisel veri, token, GPS veya cihaz depolaması içermez.
Yasaklı alan taraması: `ghToken`, `openaiKey`, `syncUrl`, `Authorization`,
`Bearer`, `password`, `latitude=`, `longitude=`, `localStorage` → **YOK**.

## Sahne listesi

| Sahne | Ne gösterir | Beklenen etiket |
|---|---|---|
| S01 | Taze, eşleşen kayıt + TR içi konum | `Bugüne ait` · `Türkiye kapsamı içinde` |
| S02 | Gece yarısı (kayıt 03, gün 04) | `Başka güne ait` |
| S03 | Yöntem uyuşmazlığı (kayıt MWL, seçili Diyanet) | `Yöntem uyuşmuyor` + iki ad |
| S04 | Konum uyuşmazlığı (kayıt Ankara, seçili İstanbul) | `Konum uyuşmuyor` |
| S05 | Timeout / güncelleme hatası | `Güncelleme hatası` + "eski saatler gösterilmiyor" |
| S06 | Kayıt yok | `Saatler bekleniyor` |
| S07 | GPS yurtdışı (Berlin) | `Türkiye dışı` + "yerel saat olarak sunulmaz" |
| S08 | Kapsam karar tablosu (5 konum) | İstanbul/Ankara içinde · Berlin/Londra dışında · konum yok |

Doğrulama taraması (üretim sonrası): `Bugüne ait` 3 · `Başka güne ait` 1 ·
`Yöntem uyuşmuyor` 1 · `Konum uyuşmuyor` 1 · `Güncelleme hatası` 1 ·
`Saatler bekleniyor` 2 · `Türkiye dışı` 3 · `Türkiye kapsamı içinde` 9 ·
`Konum yok` 2 · `yerel saat olarak sunulmaz` 3.

## Tasarım sözleşmesine uygunluk

| `03-TASARIM-SISTEMI.md` kuralı | Durum |
|---|---|
| **Vakit satırı:** saat tabular-nums; **kaynak ayrı metada** | Çekmece kaynak/yöntem/konum/kapsam hücrelerini **ayırır** (S01–S07) |
| **Kaynak çekmecesi:** kısa başlık ve güvenilir bağlantı | Başlık + 4 hücre; her hücrede etiket/değer/ayrıntı üçlüsü |
| **Renk tek bilgi taşıyıcısı değil** | Durum **metinle** yazılır (`Başka güne ait`), renk yalnız destekler |
| Zaman/kaynak durumları **kayıt durumundan ayrı** | "Veri durumu" hücresi kayıttan bağımsızdır; ibadet kaydı ayrı satırlarda |
| Boş/yükleniyor/hata/hazır durumları | S06 (boş), S01 (hazır), S05 (hata), S02–S04 (eski) |
| Hareket: sürekli nabız/otomatik kayma yok | Statik çekmece; yeni animasyon eklenmedi |
| Erişilebilirlik: klavye, ekran okuyucu | Bölüm `aria-label="Vakit yöntemi ve veri durumu"` taşır; hücreler okunabilir metin |

## Yeniden kullanılan görsel dil (yeni CSS yok)

Çekmece mevcut `.sg-tool-meta` + `.sg-tool-meta-grid` düzenini kullanır ve durum
sınıfları olarak mevcut stilli `is-ready` / `is-error` / `is-idle` seçilir —
`app/styles.css` bu kartın izin listesinde olmadığı için yeni sınıf **yazılmadı**.
"stale" durumu mevcut `is-error` ile gösterilir (uyarı niteliği); gerekçe
`review.md` IIP13-REV-02'dedir. Fixture bunu bekçiyle sabitler.

## Tema / viewport matrisi

Bu kart **yeni renk veya ölçü kuralı eklemediğinden** ve tamamen mevcut token
tabanlı sınıfları yeniden kullandığından, tema/viewport davranışı **miras alınır**
ve burada yeniden ölçülmemiştir. Dördüncü hücre (Kapsam) eklendiğinde ızgara
`repeat(3, …)` yerine satır kaydırmalı akar; 320 px'de `.sg-tool-meta-grid` zaten
tek sütuna düşer (mevcut medya kuralı). Ölçülmemiş değerler **pending**'dir;
uydurulmaz.

## Sınır beyanı

Bu bir **sentetik render** artifact'ıdır. Gerçek ekran görüntüsü, gerçek tarayıcı
paint'i, ekran okuyucu, cihaz ölçümü ve yayın doğrulaması **yapılmamıştır**; bu
fixture'ın kapsamı dışındadır ve "görsel PASS" olarak sayılamaz.
