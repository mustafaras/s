# IIP-12 · visual gate

## Artifact

`render-matrix.html` — **8 sahne**, gerçek `app/core/saygi.js` registry çıktısından
`build-render-matrix.js` ile üretilir (no-DOM, no-network, no-storage).
Artifact **sentetiktir**; kişisel veri, token, GPS veya cihaz depolaması içermez.

Artifact yasaklı alan taraması: `ghToken`, `openaiKey`, `syncUrl`, `Authorization`,
`Bearer`, `password`, `latitude`, `longitude`, `localStorage` → **YOK**.

## Sahne listesi

| Sahne | Ne gösterir |
|---|---|
| S01 | Odak kartı — gün→**öncü** kaynağı (etiket + süre + gerekçe + CTA) |
| S02 | Odak kartı — gün→**âyet** kaynağı (farklı gün, deterministik geçiş) |
| S03 | Odak — **içerik yok** → dürüst boş hâl, CTA yok |
| S04 | Devam — zikir hatimi (**%25 · hatim ilerliyor**) + Kur’an **izleniyor** |
| S05 | Devam — yalnız Kur’an **anlatım hazır** (tek satır) |
| S06 | Devam — bozuk (`request_error`) + **arşivlenmiş** hatim → **bölüm YOK** |
| S07 | **Bugün sekmesi tam hub** — odak + rota rayı + zikir kartı + Devam |
| S08 | **Öncü sekmesi** — odak ve Devam **görünmez** (sekme kapsamı) |

## Tasarım sözleşmesine uygunluk

| `03-TASARIM-SISTEMI.md` kuralı | Durum |
|---|---|
| **Günlük odak:** tek büyük başlık, en çok iki meta, tek CTA | Tek kart, iki meta (süre + gerekçe), **tek** CTA; fixture `GÜNÜN ODAĞI` sayısını 1'e sabitler |
| **Günlük odak durumları:** boş/yükleniyor/hata/hazır/tamamlandı | Hazır (S01/S02), boş (S03), yükleniyor+hata (fixture §8 — ağ durumundan bağımsız) |
| **Devam satırı:** küçük simge, ad, gerçek durum | 19px simge + ad + gerçek durum metni (S04/S05) |
| **Devam satırı:** yoksa görünmez; **sahte ilerleme yok** | S06 bölümü hiç basmaz; oran yalnız gerçek `count/target`'tan |
| **Hareket:** uzun metin üstünde parıltı/otomatik kayma/kalp atışı yok | Statik kartlar; yeni animasyon eklenmedi |
| **Erişilebilirlik:** klavye, görünür focus | Öğeler `<button>`; `aria-label` gerçek durum taşır; satır içi odak stili yok (tarayıcı varsayılanı korunur) |
| **320 px / %200 metin** | Kart içeriği `min-width:0` akışlı `flex`; mevcut stilli desen küçük ekranda zaten sarar |

## Yeniden kullanılan görsel dil (yeni CSS yok)

Kart, kaynak çekmecesinin stilli desenini kullanır:
`saygi-source-card` (kenarlık + `color-mix` ton + `border-radius:15px`) +
`saygi-link-thumb` (42×42 simge kutusu) + `saygi-link-copy/label/sub` +
`saygi-link-arrow`. Yalnız buton font eşitlemesi (`font:inherit`) satır içi verilir
— bu sınıf normalde `<a>` için yazılmıştır.

Bu seçim **bilinçli bir kapsam kararıdır**: `app/styles.css` bu kartın izin
listesinde değildir; yeni sınıf yazmak IIP-11 REV-03 hatasını (stillsiz sınıf)
tekrarlardı. Fixture bunu bekçiyle sabitler.

## Tema / viewport matrisi

`03-TASARIM-SISTEMI.md` 320/390/430/768/1280 px ve açık/koyu tema ister. Bu kart
**yeni renk veya ölçü kuralı eklemediğinden** ve tamamen mevcut token tabanlı
sınıfları yeniden kullandığından, tema/viewport davranışı **miras alınır** ve
burada yeniden ölçülmemiştir. Ölçülmemiş değer **pending**'dir; uydurulmaz.

## Sınır beyanı

Bu bir **sentetik render** artifact'ıdır. Gerçek ekran görüntüsü, gerçek tarayıcı
paint'i, ekran okuyucu, cihaz ölçümü ve yayın doğrulaması **yapılmamıştır**; bu
fixture'ın kapsamı dışındadır ve "görsel PASS" olarak sayılamaz.
