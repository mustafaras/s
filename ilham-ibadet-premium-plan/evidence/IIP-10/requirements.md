# IIP-10 gereksinim kanıtı — REQ-019 / REQ-020

Fixture: `node tests/app/test_iip_10.js` — **61 PASS, 0 FAIL**.
Tam ağsız `node:vm`; sentetik 100 kişilik koleksiyon; gerçek kişisel veri, token,
`localStorage`, ağ ve tarayıcı kullanılmaz. Tam komut kaydı:
`evidence/IIP-10/commands.log`.

## REQ-019 / TC-019 — Öncü keşfi

**Kabul:** 100 kişi isim/alan/okundu ile aranır; Türkçe normalizasyon yalnız arama
indeksine uygulanır.

### Olumlu durumlar

| Durum | Doğrulanan davranış |
|---|---|
| İsim araması | `einstein` tam olarak eşleşen tek kişiyi döndürür. |
| Boş sorgu | Filtresiz 100 kişilik tam koleksiyon; `hasLens=false`. |
| Alan sözcüğü | `matematik` birleşik alan etiketinin parçasını bulur. |
| Çok kelimeli alan | `matematik bilgisayar` birleşik etiketi bulur (her kelime ayrı aranır). |
| Çağ | `1900` çağ aralığını bulur. |
| Tür | `sanat` tür sözcüğünü bulur (50 Sanat). |
| Okundu filtresi | Yalnız depolanan 3 okunmuş kaydı döndürür. |
| Okunmadı filtresi | Okunanların tamamlayıcısı (97). |
| Alan filtresi | `Bilim` yalnız bilim yarısını verir (50). |
| Sorgu + filtre | `ibn` + `Bilim` birlikte daraltır, birbirini ezmez. |

### Olumsuz durumlar (kartın açıkça istediği dört vaka)

| Vaka | Doğrulanan davranış |
|---|---|
| **I/İ/ı/i** | `ibn` = `IBN` = `İbn Sina`; `ırmak` = `irmak` = `IRMAK`; `cigdem`/`sukru`/`omer` aksanlı adları bulur. |
| **Boş sorgu** | Çökmez, tam koleksiyonu döndürür, `saygiResultCountText` "hepsi listede" der. |
| **Birden fazla filtre** | `einstein` + `Sanat` + `Okunmadı` meşru biçimde sıfır sonuç verir; `activeCount=2`. |
| **Sıfır sonuç** | Sorgu metni korunur; sıfır sonuç kaybolmuş koleksiyon gibi gösterilmez (`total=100` kalır). |
| Tek karakter | Ölü sonuca düşmez: tam liste kalır + "iki harf yeter" açıklaması. |
| Bilinmeyen filtre | `Mars`/`maybe` sessizce "Tümü"ye iner; ölü sonuç yok. |
| Boş koleksiyon | Sınır durumu: `total=0`, sonuç yok, istisna yok. |

### Boş / yükleniyor / hata / dönüş

| Hâl | Doğrulanan davranış |
|---|---|
| Yükleniyor | İsimli liste ağ çağrısı **olmadan** render edilir (`counters.fetch===0`). |
| Sıfır sonuç | Ayrı boş görünüm + tek kurtarma eylemi ("Tüm filtreleri temizle"). |
| Hata | Kullanılamayan koleksiyon kendi görünümünde ("Koleksiyon henüz hazırlanıyor"). |
| Dönüş | Sorgu tam render sonrası korunur (`value="fizik"`); temizle/sıfırla odaklanır. |
| Kaçış | Sorgu metni kaçışlı geri yansıtılır (`&lt;img`), asla markup olarak yorumlanmaz. |
| Duyuru | Sonuç sayısı `role="status"` polite bölgedir; her tuşta uzun liste okunmaz. |

## REQ-020 / TC-020 — Koleksiyon ergonomisi

**Kabul:** İsimli liste birincil; grid ikincil özet; bütün kişiler eşdeğer
erişilebilir.

### Olumlu durumlar

| Durum | Doğrulanan davranış |
|---|---|
| Birincil yüzey | İsimli liste `<details>` özetinden **önce** gelir. |
| İkincil özet | Numara gridi kapalı `<details>` içinde; "İkincil özet görünümü". |
| Varsayılan | Grid kapalı açılır; yalnız hatırlanan oturum durumunda açık kalır. |
| Satır içeriği | Her kişi ad, alan, kısa açıklama ve okundu metni taşır. |
| Okundu beyanı | Satır ve `aria-label` gerçeği söyler (okundu / okunmadı ayrımı). |
| Bugünün öncüsü | `todayd` işareti birincil satırda, yalnız gridde değil. |

### Olumsuz durum

| Vaka | Doğrulanan davranış |
|---|---|
| **Klavye, 100 anlamsız numara zinciri** | İsimli listede 100 **adlı** satır vardır; filtre daralınca liste daralır, grid zorla açılmaz. |
| Tekrar | Bir kişi birincil listede tam olarak bir kez görünür. |
| Grid sınırı | Grid ikincil görünümde numara etiketlerini ve erişilebilir adı korur. |
| Tek yol yok | Grid ikincil kalır — kişiye erişim yalnız gridden geçmez. |
| Yalan beyan | Okundu ilerlemesi grid meta satırında ve liste alt satırında gerçeği söyler (3/100). |

## Kapsam sözleşmesi kontrolleri

- Sorgu yalnız mevcut `ui` kanalından okunur; yeni bag üyesi ve `'query'` literali
  yoktur.
- `app/core/saygi.js` hâlâ hiç `App.*` ataması ve depolama yazımı içermez.
- Her etkileşim **tek** dispatcher'a gider (`App.saygiLens`); altı ayrı handler
  reddedildi. Bilinmeyen eylem güvenli no-op'tur.
- Hedef bölge boyanır (`saygi-search-region`), bölge yoksa güvenli tam render'a
  düşer — yazarken odak ve caret sabit kalır.
- İsimli satır tek dokunma hedefidir (satır başına bir `<button>`, `<a>` yok).
