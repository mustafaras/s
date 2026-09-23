# IIP-02 token ve bileşen eşlemesi

Bu harita tasarım prototipinin bağlayıcı sözleşmesidir. `mevcut` tokenlar `app/styles.css` içinden alınır; `öneri` tokenları henüz üretim CSS'ine eklenmemiş tasarım alias'larıdır. IIP-02 bunları kodda uygulamaz.

## Temel token sözlüğü

| Rol | Token / değer | Kaynak veya gerekçe | Kullanım sınırı |
|---|---|---|---|
| Sayfa zemini | `--bg` | mevcut; light/dark root karşılığı | tüm ekran, dekoratif gradient içerik arkasında kalır |
| Ana yüzey | `--card-solid` | mevcut AD-38 yüzeyi | görev kartı; içerik kartı cam olmaz |
| İkincil yüzey | `--field`, `--icon` | mevcut | input, monogram, düşük ağırlıklı yardımcı yüzey |
| Ana metin | `--text` | mevcut light/dark | başlık ve kritik bilgi |
| Yardımcı metin | `--text2`, `--muted`, `--faint` | mevcut light/dark | sıralı önem; `--faint` tek başına kritik bilgi değildir |
| Ana vurgu | `--accent`, `--accent-ink`, `--gold-1..5` | mevcut | tek dolu CTA ve seçim durumu; altın metin yalnız ölçümlü ink varyantında |
| Başarı / dikkat / hata | `--ok`, `--drop`, `--warn` + ilgili `*-ink` | mevcut | renk metnin yerine geçmez; durum başlığı ve açıklaması birlikte |
| Alan vurgu | `--quran-*`, `--zikr-*`, `--qibla-*` | mevcut domain tokenları | S07/S06/S09; diğer ekranlara sızmaz |
| Tipografi | `--f-caption2` → `--f-large` | mevcut rem merdiveni | başlıklar için semantik sıra; 34px üstü metin değildir |
| Boşluk | `iip.space.1=4px`, `.2=8px`, `.3=12px`, `.4=16px`, `.5=24px`, `.6=32px` | öneri; 4px tabanlı ölçülü alias | kart padding 16/24; ekran gap 12/16; rastgele değer yok |
| Radius | `iip.radius.control=10px`, `card=18px`, `hero=24px`, `pill=999px` | öneri; mevcut 11–20px ailesini tek sözlüğe indirir | ikon kutusu 12–14px; container radius'u eylem anlamına dönüşmez |
| İkon | `iip.icon.sm=16`, `md=20`, `lg=24`, `touch=44px` | mevcut `icon()` ailesi + C01 44px kontratı | ikon anlamı değişmez; dekoratif ikon `aria-hidden` |
| Hareket | `--dur-1..5`, `--ease-out`, `--ease-in`, `--ease-glide` | mevcut FX2 skalası | durum 120–200ms; kart 320ms; sheet 480ms; reduced-motion'da none |
| Yükseklik | `--elev-0..4` | mevcut light/dark varyantları | bilgi önceliğini gölgeyle tek başına anlatmaz |

## Renk ve kontrast kontrolü

Tasarım incelemesinde düz hex token çiftleri WCAG relative-luminance hesabıyla kontrol edildi. Alpha karışımları ve gerçek font ağırlıkları actual render kartında tekrar ölçülmelidir.

| Çift | Oran | Kullanım kararı |
|---|---:|---|
| light `--text` #2C2426 / `--card-solid` #FFFDFC | 14.93:1 | gövde ve başlık için PASS |
| light `--accent-ink` #886738 / #FFFDFC | 5.12:1 | 16px+ metin ve link için PASS; caption'da tekrar ölç |
| light `--text2` #5A4D52 / #FFFDFC | 7.91:1 | yardımcı metin için PASS |
| dark `--text` #F8F8FA / #000000 | 19.80:1 | gövde ve başlık için PASS |
| dark `--text2` #D8D8DE / #111114 | 13.28:1 | yardımcı metin için PASS |
| dark `--accent` #E3C08A / #111114 | 10.93:1 | vurgu metni için PASS |
| light `--gold-3` #B08D57 / #FFFDFC | 3.05:1 | yalnız dekoratif dolgu; normal metin olarak yasak |

## Sekiz bileşen için varyant fişi

| Bileşen | Tüketen ekranlar | Renk / font / boşluk / radius / hareket | Varyantlar | Focus / 200% / dark / reduced-motion / durum |
|---|---|---|---|---|
| **C01 Bölüm gezintisi** | S01–S12 ortak shell | `--nav`, `--text`, `--accent-ink`; `--f-footnote`; 4/8/12 gap; control radius; selected 200ms | normal, dar kontrollü sarma, selected, focus, large type | `aria-current`; 44px hitbox; dark ink; hareket none; disabled değil |
| **C02 Editoryal odak kartı** | S01, S02, S03, S08 | `--card-solid`, `--text`, `--accent-ink`; title2/title1; 16/24; card/hero radius; enter 320ms | portreli, metin odaklı, loading, source-error, completed | anlamlı/dekoratif alt; focus CTA; 200% dikey; dark surface; loading shimmer none; empty/error açıklaması |
| **C03 Devam satırı** | S01, S06, S12 | `--field`, `--text2`, `--ok`/`--pause`; `--f-subhead`; 12/16; control radius; 120ms | active, paused, complete, archived/hidden, focus | durum metni sayaçtan önce; tabular nums; 44px satır; dark contrast; none |
| **C04 Vakit ve kayıt satırı** | S04, S05, S09 | `--qibla-*`/`--accent-ink`; footnote/subhead; 8/12/16; control radius; 200ms | future, current, past, old-cache, unknown-time | zaman ile kayıt ayrı; klavye açıklığı; dark surface; none; stale/error açıklaması |
| **C05 Okuyucu araç ve eylem alanı** | S03, S07, S08, S11 | `--nav`, `--card-solid`, `--accent`; callout/body; 12/16/24; hero radius; sheet 480ms | compact, modal, bottom action, Aa open, locked | focus return; 320px sarma; safe-area; dark; trap yok; loading/error/disabled nedeni görünür |
| **C06 Kaynak ve içerik türü** | S02, S03, S07, S08, S11 | `--text2`, `--muted`, `--accent-ink`; caption/footnote; 4/8/12; control radius; 120ms | verified-source text, external link, language, license, unavailable | ikon yanında görünür metin; URL sanitize; dark; none; source error ana içeriği silmez |
| **C07 Arama, filtre ve sonuç** | S02, S11 | `--field`, `--field-bd`, `--text`; body/footnote; 8/12/16; control radius; 200ms | idle, typing, active-filter, empty, no-result, image-fallback | composition/caret korunur; label + polite result; 200% sarma; dark; debounce animasyonu yok |
| **C08 Durum, geri bildirim ve veri görselleştirme** | S04, S06, S07, S09, S10, S12 | `--ok`, `--warn`, `--drop`, `--text2`; footnote/body; 8/12/16; card radius; 200/320ms | loading, empty, error+retry, success-inline, chart+list, offline | toast tek başına bilgi değil; lejant + metin; keyboard list; dark; reduced-motion none |

## İkon dili

Tek dil mevcut `icon()` / `iconHtml()` çizgi ikonlarıdır. C01–C08 için ikon yalnız eylem veya anlamı destekler; dolu/çizgi ikon ailesi karıştırılmaz. İkon tek başına renk kodu değildir. Yeni ikon çizimi, emoji veya dekoratif unicode IIP-02 hedef yüzeyine eklenmedi.

## Gerçek üretime devredilecek token işleri

`app/core/settings.js` inline renk/radius örnekleri ve `app/core/saygi.js:170` kaynak tonu sonraki production kartında mevcut semantic tokenlara taşınır. Bu kartta bunları düzenlemek scope dışıdır; açık hardcoded risk olarak review'e yazılmıştır.
