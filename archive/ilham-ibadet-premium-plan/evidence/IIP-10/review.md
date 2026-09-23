# IIP-10 inceleme kaydı

## İnceleme

Sentetik/headless kaynak ve davranış incelemesi. Fiziksel cihaz, ekran okuyucu,
tarayıcı ve yayın kabulü **bu incelemenin kapsamı dışındadır**.

| Alan | Sonuç |
|---|---|
| Açık kritik bulgu | 0 |
| Açık yüksek bulgu | 0 |
| İncelenen kart | IIP-10 |
| İnceleyen | copilot (self-review; bağımsız insan incelemesi değildir) |

## İncelenen başlıklar

### 1. Veri ve sınır bütünlüğü

- Arama sorgusu ve filtreler yalnız `ui` oturumluk kanalında yaşar; `data`,
  geçiş (migration), `sync.js` ve depolama yazımı değişmedi.
- `app/core/saygi.js` hiç `App.*` ataması ve depolama yazımı içermez.
- Kayıtlı bağımlılık sözleşmesi (`SAYGI_DEPENDENCIES`) büyümedi.
- Arama indeksi **yalnız** görünüm çağrı anında üretilir; okuma yolu ağ/timer/
  depolama açmaz (fixture `counters` ile kanıtlar).

### 2. Erişilebilirlik

- İsimli satır tek dokunma hedefidir; sayı gridi ikincil `<details>` özetine
  indirildi ve varsayılan kapalıdır.
- Filtre çipleri `aria-pressed` taşır; seçili durum hem şekil hem metinle belirtilir.
- Sonuç sayısı `role="status"` polite bölgedir.
- Arama alanı görünür etiketli, `aria-describedby` açıklamalı ve `Enter` ile ilk
  sonuca götürür; `Escape` sorguyu temizler.
- Odak halkaları ve reduced-motion varyantı tanımlı.

### 3. Klavye ve durum dönüşü

- Klavye sırası 100 anlamsız numara zincirine mahkûm edilmez: birincil yüzey
  adlandırılmış 100 satırdır.
- Hedef-bölge boyama odak ve caret'i korur; bölge yoksa güvenli tam render.
- Bilinmeyen dispatcher eylemi güvenli no-op'tur (bayat HTML oturum durumunu
  bozmaz).

### 4. Pin ve sözleşme etkisi (bulgu → karar)

**Bulgu:** Kart, markup kuralı gereği en az bir yeni `App.*` handler'ı ekler.
Altı ayrı handler yerine **tek dispatcher** seçildi (`App.saygiLens`), fakat
`App.*` yüzeyi yine de 718 → 719 olur. Üç donmuş FX2 fixture'ı bu sayıyı
sabitler.

**Karar:** DEC-07 — pin ölçülen yeni değere taşınır; `onclick=391` korunur;
`app/core/saygi.js` pin ölçüm kaynağına girmez. Ayrıntı:
`evidence/IIP-10/decision-approval.md`.

### 5. Bilinen sınırlar

- Türkçe katlama elle yazılmış bir eşleme tablosudur; tam Unicode katlama
  (ör. `ß`, Arapça harfler) kapsam dışıdır. `SaygiPeople` içeriği Latin
  genişletilmiş harflerle sınırlıdır ve tablo bu kümeyi kapsar.
- Arama yalnız yereldir; sabit ağ araması **eklenmedi** (C07 gereği).
- Sorgu uzunluğu 80 karakterle sınırlıdır.
- Sanal klavye/ekran okuyucu davranışı cihaz kabulü gerektirir; burada iddia
  edilmez.

## Bulgu listesi

Yukarıdaki 4. başlık dışında kayda değer bulgu yoktur; o başlık da DEC-07 ile
kapatılmıştır ve açık kritik/yüksek bulgu bırakmaz.
