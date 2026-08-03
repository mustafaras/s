# ÆON Paneli — PANEL-07 D0 Bilgi Mimarisi ve Wireframe

**Sequence:** `PANEL-009`
**Durum:** `ready_for_review`
**Tarih:** 2026-08-03
**Kapsam:** Kod yazmadan bilgi mimarisi, ekran akışı, card anatomy ve drawer sınırı
**Kaynak:** [PANEL-07 promptu](../prompts/07-PANEL-D0-IA-WIREFRAME-PROMPTU.md)

Bu belge PANEL-07’nin kodsuz teslimatıdır. `panel.html`, `panel.css`, JavaScript,
runtime state, sync davranışı ve relay değişmez. Ölçüler yerleşim sözleşmesidir;
semantic token ve component API sözleşmesi D1’de çıkarılacaktır.

## 1. D0 karar özeti

ÆON panelinin tek canonical akışı şöyledir:

```text
Command header
  → Sync health ribbon
  → Şimdi hero
  → Son değişiklikler
  → Kritik / risk
  → Bölüm navigasyonu
  → Feature kartları
  → Gün / olay / kaynak audit drawer’ı
```

Üst bölümde yalnızca şu dört soru cevaplanır:

1. Şeyma şu an nasıl?
2. Son ne değişti?
3. Senkron gerçekten kabul edildi mi?
4. Şimdi hangi eylem veya inceleme gerekiyor?

Her kart tek bir karar cümlesine sahiptir. Aynı canonical değer başka bir kartta
ikinci kez üretilmez; tekrar gereken yerde kart yalnızca ilgili drawer’a bağlanır.
Kaynak, zaman, revision ve privacy sınıfı kartın özetinde veya bağlı ayrıntıda
korunur.

## 2. Card anatomy ve coverage eşleşmesi

| ID / katman | Kart | Tek karar cümlesi | Güvenli görünen özet | Kaynak / provenans | Drawer sınırı |
|---|---|---|---|---|---|
| `CH` | Command header | “Şu anda paneli açıp bir işlem yapmam gerekiyor mu?” | ÆON kimliği, tek canonical durum rozeti, yenile, tarih/filtre ve yoğunluk | `observer`, `derived` | Ham veri yok; yalnız güvenli durum ve eylem |
| `SR` | Sync health ribbon | “Uzak kayıt gerçekten kabul edildi mi ve panel ne kadar geride?” | local save, remote accepted, projection ready, panel poll zamanları; revision; lag; pending/error | `user`, `delivery`, `observer`, `derived` | Token, secret, raw payload yok; receipt tuple ve allowlist hata kodu var |
| `NOW-R` | Şimdi / Ruh | “Bugün duygusal olarak dikkat gerektiren bir eşik var mı?” | mod, enerji, stres, mood trendi, güvenli SOS özeti | `user`, `derived` | Hassas terapi metni açılmaz |
| `NOW-B` | Şimdi / Beden | “Beden durumu bugün takip veya müdahale gerektiriyor mu?” | uyku, kafein, hareket, sağlık ve güvenli konum özeti | `user`, `derived`, `redacted` | Ham GPS track ve tıbbi dosya içeriği yok |
| `NOW-C` | Şimdi / Süreklilik | “Bugünkü kayıt ve rutin sürekliliği korunuyor mu?” | son kayıt, aktif seri, tamamlanma özeti, gün seçimi | `user`, `derived` | Gün ayrıntısı ayrı day drawer’da |
| `NOW-S` | Şimdi / Senkron | “Panelde gördüğüm veri denetlenebilir bir kabul zincirine bağlı mı?” | revision, source SHA özeti, projection/legacy durumu, coverage sayıları | `delivery`, `observer`, `derived` | SHA/token dışında güvenli metadata; raw projection yok |
| `EV` | Son değişiklikler | “En son hangi olay oldu, kaynağı ne ve kabul edildi mi?” | son 5/20/100 event, zaman, event türü, source/privacy/status, correlation | `observer`, `user`, `delivery`, `external` | Event payload değil; allowlist summary, eventId ve revision |
| `RISK` | Kritik / risk | “Şu anda gecikme, çatışma veya kullanıcı ilgisi gerektiren risk var mı?” | stale, conflict-blocked, retry/error, eşik ve güvenli açıklama | `derived`, `observer`, `delivery` | Riskin ham nedeni veya terapi metni yok |
| `NAV` | Bölüm navigasyonu | “Hangi bölüme gitmeliyim?” | Şimdi, Senkron, Son değişiklikler, Ruh ve risk, Beden, İçerik, Terapi, İletişim, Arşiv | `observer` | Navigasyon eylemidir; veri taşımaz |
| `MOD-RUH` | Ruh ve risk | “Duygu/enerji/stres tarafında hangi özet takip edilmeli?” | trend, eşik, gün ve kaynak badge’i | `user`, `derived` | Hassas cevaplar redacted özet olarak kalır |
| `MOD-BEDEN` | Beden ve hareket | “Uyku, kafein, sağlık veya hareketten hangisi izlenmeli?” | uyku, kafein, sağlık, movement aggregate, konum zamanları | `user`, `derived`, `redacted` | GPS koordinatı/track ve lab binary yok |
| `MOD-ICERIK` | İçerik ve öğrenme | “Bugün hangi içerik/pratik teslim edildi veya sürdürüldü?” | okuma, izleme, dinleme, öğrenme, Kur’an, Zihin-Beden teslim özeti | `user`, `external`, `delivery` | Harici içerik ham gövdesi yalnız izinli kaynak linki olarak kalır |
| `MOD-TERAPI` | Terapi ve profil | “Terapi/profil akışında güvenli olarak hangi ilerleme biliniyor?” | thought count, completion, profile progress, consent, provenance badge’i | `user`, `derived`, `redacted` | Raw therapy text ve profile response hiçbir drawer’da gösterilmez |
| `MOD-ILETISIM` | İletişim | “ÆON/Luna/bildirim zincirinde teslim veya yanıt bekliyor mu?” | created, inbox, device, delivered, read, retry/error aşamaları | `delivery`, `observer` | Mesaj gövdesi/özel not varsayılan gizli |
| `MOD-ARSIV` | Arşiv ve kaynak | “Kök modül veya kaynak tarafında doğrulanması gereken bir kayıt var mı?” | `dailyPhoto`, `roomContentHistory`, kök/günlük Saygı, `locNudge`, konum zamanları, root lifecycle/settings özeti | `external`, `user`, `observer`, `redacted` | Lisans/kaynak metadata’sı görünür; medya/base64/raw GPS yok |

### 2.1 Coverage zorunluluğu

`PanelCoverageV1` içindeki her kalıcı alan bu IA’da aşağıdaki dört sonuçtan
birine düşer: `full`, `summary`, `redacted` veya `missing`. Yeni/henüz karta
bağlanmamış bir alan `unmapped` olarak kalamaz; `SR` içindeki coverage
özetinde alarm olarak görünür ve ilgili modül `missing / mapping bekliyor`
durumuna düşer. Böylece “görünmüyor” ile “bilinçli redacted” birbirine
karışmaz.

## 3. Ana ekran wireframe’leri

Wireframe’lerde `[A]` eylem butonu, `[S]` source/provenance badge’i,
`[T]` zaman/yaş, `[P]` privacy badge’i, `[D]` drawer bağlantısıdır.

### 3.1 Mobil — 375–430px, tek kolon

```text
┌──────────────────────────────────────┐
│ ÆON                                  │  ← CH: kimlik + yoğunluk + yenile
│ Şeyma gözlem paneli       [Standart] │
│ [Senkron kabul edildi]        [A]    │  ← tek canonical durum
├──────────────────────────────────────┤
│ Uzak kabul r1842 · 12:00:01           │  ← SR: source + revision + yaş
│ Panel çekimi 12:00:04 · 3 sn geride  │
│ Hata yok · 0 bekleyen · [coverage]   │
├──────────────────────────────────────┤
│ [ŞİMDİ] [SENKRON] [SON DEĞİŞİKLİK]   │  ← tek sticky nav bandı
├──────────────────────────────────────┤
│ ŞİMDİ                                 │
│ Ruh       mod · enerji · stres [S][T]│  ← NOW-R
│ Beden     uyku · kafein · hareket[S] │  ← NOW-B
│ Süreklilik seri · son kayıt [S][T]   │  ← NOW-C
│ Senkron   rev · lag · hata [S][T]    │  ← NOW-S
├──────────────────────────────────────┤
│ KRİTİK / RİSK                         │
│ 1 çatışma engellendi · nedeni [D]    │  ← RISK; renk + metin + ikon
├──────────────────────────────────────┤
│ SON DEĞİŞİKLİKLER              [20]  │
│ ● olay özeti · kabul edildi [S][T][D]│
│ ● olay özeti · redacted [P][T][D]    │
│ ● olay özeti · bekliyor [S][T][D]   │
├──────────────────────────────────────┤
│ BÖLÜMLER                             │
│ Ruh ve risk · Beden · İçerik         │
│ Terapi · İletişim · Arşiv            │  ← NAV; yatay taşma yok
├──────────────────────────────────────┤
│ FEATURE KARTLARI                     │
│ Ruh ve risk                 [A][D]   │
│ Beden ve hareket            [A][D]   │
│ İçerik ve öğrenme           [A][D]   │
│ Terapi ve profil            [A][D]   │
│ İletişim                    [A][D]   │
│ Arşiv ve kaynak             [A][D]   │
└──────────────────────────────────────┘
```

Mobil kuralları:

- Tek kolon; hero kartları da dikey sıralanır, yatay bento zorlanmaz.
- Header yalnız bir satır eylem alanına sahiptir; metadata ribbon’a taşınır.
- Sticky olan tek yüzey bölüm nav’ıdır. Nav, header bloğunun altındaki ölçülmüş
  offset’te kalır; ikinci bir sticky başlık oluşturulmaz.
- Varsayılan `Standart` modda ilk 5 event görünür; `[20]` filtre düğmesiyle
  timeline’a gidilir.
- Drawer tam ekran açılır; ana sayfanın scroll konumu korunur.

### 3.2 Tablet — 768px, iki kolon

```text
┌──────────────────────────────────────────────────────────────┐
│ ÆON · Şeyma gözlem paneli   [Senkron kabul edildi] [Standart][A]│
├──────────────────────────────────────────────────────────────┤
│ Sync ribbon: uzak kabul · projection · panel poll · lag · error │
├──────────────────────────────────────────────────────────────┤
│ [ŞİMDİ] [SENKRON] [SON DEĞİŞİKLİK] [RUH] [BEDEN] [İÇERİK] ...   │
├───────────────────────────────┬──────────────────────────────┤
│ SOL: DURUM + TIMELINE         │ SAĞ: SEÇİLİ BÖLÜM             │
│ Şimdi hero: Ruh                │ Ruh ve risk                  │
│ Beden                          │ trend / eşik / kaynak       │
│ Süreklilik                     │ [S] [T] [P] [D]              │
│ Senkron                        │                              │
│                               │ Beden ve hareket              │
│ Kritik / risk                 │ İçerik ve öğrenme             │
│                               │ Terapi ve profil              │
│ Son değişiklikler 5/20        │ İletişim / Arşiv              │
│ [event] [event] [D]           │ (kartlar kapalı/özet)          │
└───────────────────────────────┴──────────────────────────────┘
```

Tablet kuralları:

- Sol kolon yaklaşık 7/12, sağ kolon 5/12 anlam alanıdır; iki kolon içerik
  karşılaştırması içindir, header ve ribbon tam genişliktedir.
- Nav tek satır yatay kaydırılabilir; kartların üstüne binmez.
- Sağ kolonda tek bir seçili bölüm açık, diğer modüller güvenli özet olarak
  kapalı kalır. Seçim `NAV` üzerinden yapılır.
- Drawer sağ kolonun üzerine açılır ve arka planı inert yapar; kritik başlık,
  sticky nav ve drawer başlığı aynı hizada üst üste gelmez.

### 3.3 Masaüstü — 1280px, 12 kolon

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ ÆON / Şeyma gözlem paneli  [Senkron kabul edildi] [Hızlı|Standart|Audit] [A]│
├────────────────────────────────────────────────────────────────────────────┤
│ SYNC RIBBON · remote accepted · projection ready · panel poll · lag · error │
├────────────────────────────────────────────────────────────────────────────┤
│ [ŞİMDİ] [SENKRON] [SON DEĞİŞİKLİKLER] [RUH] [BEDEN] [İÇERİK] [TERAPİ] ...    │
├───────────────┬─────────────────────────┬──────────────────────────────────┤
│ 1–4           │ 5–9                     │ 10–12                            │
│ HEALTH RAIL   │ TIMELINE / DAY          │ RISK + OBSERVER ACTIONS           │
│               │                         │                                  │
│ Şimdi hero    │ Son değişiklikler       │ Kritik / risk                     │
│ Ruh           │ son 20 event            │ stale / conflict / retry          │
│ Beden         │ filtre + sıra           │                                  │
│ Süreklilik    │                         │ Senkron özeti                     │
│ Senkron       │ Seçili gün özeti        │ revision / coverage / provenance │
│               │ [gün drawer]            │                                  │
│               │                         │ Observer actions                  │
│               │                         │ yenile / tarih / yoğunluk / kilit│
├───────────────┴─────────────────────────┴──────────────────────────────────┤
│ FEATURE MODULES: Ruh · Beden · İçerik · Terapi · İletişim · Arşiv           │
└────────────────────────────────────────────────────────────────────────────┘
```

Masaüstü kuralları:

- 1180–1320px içerik genişliği içinde gerçek 12 kolon grid kullanılır; eski
  `480px` sınırı yalnız mobil davranışa aittir.
- Sol 4 kolon persistent durum rail’i, orta 5 kolon timeline/gün, sağ 3 kolon
  risk/senkron/observer action alanıdır.
- Header, ribbon ve nav tam genişlikte; sticky nav header’ın altındaki tek
  sticky bandır. Kolon içerikleri bu bandın altında başlar.
- Audit drawer 480px’e kadar sağdan açılır; grid kolonlarını yeniden akıtmaz,
  içerik üzerine kontrollü overlay olur. Drawer açıldığında odak drawer
  başlığına geçer ve arka plan etkileşime kapanır.

## 4. 10 saniyelik bakış akışı

Kullanıcı herhangi bir etkileşim yapmadan şu sırayı görür:

| Süre | Görsel odak | Kullanıcının aldığı karar |
|---:|---|---|
| 0–2 sn | `CH` + canonical durum badge’i | Acil durum veya hata var mı? |
| 2–4 sn | `SR` sync ribbon | Uzak veri kabul edilmiş mi, kaç saniye geride? |
| 4–7 sn | `NOW-R/B/C/S` hero | Şeyma’nın ruhu, bedeni, sürekliliği ve sync özeti nasıl? |
| 7–9 sn | `RISK` | Hangi risk/çatışma/stale durumu aksiyon istiyor? |
| 9–10 sn | `EV` ilk olay satırı | Son ne değişti ve nereden geldi? |

Bu akışta ana cevaplar iki etkileşimden fazla uzakta değildir: bir bölüm
seçimi ve bir drawer açılışı yeterlidir. Hızlı modda feature kartları ilk
bakışı boğmaz; `RISK` boşsa “Aksiyon gerektiren kritik durum yok” metni açıkça
görünür.

## 5. 60 saniyelik audit akışı

```text
0–10 sn  CH → SR → Şimdi → Risk → son değişiklik
10–20 sn Yoğunluk = Audit; Son Değişiklikler filtresi 20/50/100
20–35 sn Bir event seç; event drawer’da eventId/correlation/revision/source/time
35–45 sn Gün veya kaynak drawer’ına geç; projection/legacy ve coverage durumunu oku
45–60 sn Privacy badge, redaction nedeni, hata kodu ve kabul zincirini doğrula
```

Audit akışında gösterilen şey ham payload değil, allowlist’lenmiş gözlem
kanıtıdır. “Kanıt yok” durumu başarıya yükseltilmez; receipt yoksa `Senkron
kabul edildi` rozeti gösterilmez.

## 6. Yoğunluk modları

Yoğunluk seçimi `CH` içindeki tek eylemdir. Mod değişimi layout’u bozmaz;
kartların görünür ayrıntı seviyesini değiştirir.

| Mod | Ne zaman | Açık yüzey | Kapalı/ertelenen yüzey | Hedef |
|---|---|---|---|---|
| `Hızlı bakış` | Günlük 10 saniyelik kontrol | CH, SR, dört hero, RISK, son 5 event | Feature ayrıntıları ve coverage detayları | Durumu tek ekranda almak |
| `Standart` | Varsayılan gözlem | Hızlı yüzey + son 20 event + seçili feature özeti | İkincil modüller özet/accordion | Günlük takip ve kısa inceleme |
| `Audit` | Çatışma, stale veya geçmiş araştırması | Son 100 event filtresi, source/time/revision/privacy, coverage ve drawer | Ham hassas veri her zaman kapalı | Denetlenebilir kanıt zincirini izlemek |

Mobilde varsayılan `Standart`, masaüstünde kullanıcı son seçimini koruyan
`Standart` açılır; `Audit` hiçbir zaman otomatik açılmaz. Polling sırasında
aktif input veya taslak varsa mod değişimi taslağı silmez ve arka plan render’ı
taslak güvenlik kuralına uyar.

## 7. Durum wireframe’i ve fail-closed sözleşmesi

Her `SR`, `RISK`, `EV` ve feature kartı aşağıdaki durum dilini kullanır. Renk
tek başına anlam taşımaz; ikon + metin + zaman/provenance birlikte kullanılır.

| Durum | Kart metni | Görsel davranış | İzinli eylem | Yasak iddia |
|---|---|---|---|---|
| `loading` | “Projection hazırlanıyor” | Skeleton; eski veri varsa “stale” etiketi korunur | Yenile / bekle | Yeni veri hazırmış gibi gösterme |
| `empty-not-used` | “Henüz kayıt yok” | Boş durum; neden açık | Bölüme git | Kullanıcı hiç kullanmadı yerine sync hatası yazma |
| `empty-not-synced` | “Kayıt var; panele ulaşmadı” | Gri/amber kaynak badge’i | Yenile | Başarılı sync iddiası |
| `empty-consent-off` | “Rıza kapalı; ayrıntı gösterilmiyor” | Privacy badge | Ayarlar/izin bilgisi | Redacted veriyi missing sanma |
| `missing` | “Bu alan bu snapshot’ta yok” | Coverage missing alarmı | Legacy/fallback bilgisi | Alanı sessizce yok sayma |
| `stale` | “Projection eski · son kaynak zamanı …” | Amber stale banner, veri yaşı görünür | Yenile / drawer | Eski veriyi güncel diye sunma |
| `error` | “Panel verisi alınamadı · kod …” | Kırmızı metin + kod + son başarılı zaman | Retry / hata ayrıntısı | Başarı rozeti veya uydurma veri |
| `conflict_blocked` | “Çakışma engellendi; veri kaybı önlendi” | Kırmızı/amber risk satırı | Hata/receipt drawer’ı | PUT başarılı demek |
| `redacted` | “Mevcut · ayrıntı mahremiyet nedeniyle gizli” | `P` badge ve redaction nedeni | Güvenli metadata drawer’ı | Raw text/GPS/profile/media göstermek |
| `near_follow` | “Yakın takip · 304 / input ertelendi” | Sakin status chip’i | Kullanıcı input’unu sürdür | Yeni snapshot geldi iddiası |

Durum geçişleri aynı kartın içinde kalır; layout yeniden sıçramaz. `304`
gövdesi yeniden parse edilmez, taslak varken yeni snapshot DOM’u zorla
ezmez. Bu davranış D0’da görünür durum sözleşmesidir; uygulama detayı D2/D3
prompt’larında yapılacaktır.

## 8. Drawer ve hassasiyet sınırları

### 8.1 Drawer seviyeleri

```text
Kart özeti (L0)
  → Güvenli audit drawer (L1: event/gün/kaynak metadata)
    → Redacted boundary (L2: mevcut ama ham ayrıntı yok)
```

L1 drawer’da yalnız şu alanlar bulunabilir:

- eventId, correlationId, sequence ve event türü,
- local/remote/projection/panel zamanları,
- revision ve source SHA’nın güvenli tanımlayıcısı,
- source class, privacy class ve redaction nedeni,
- allowlist summary, sayılar, durum ve whitelist hata kodu,
- external source adı, lisans/kaynak URL’si ve fetch zamanı.

Aşağıdaki alanlar hiçbir varsayılan veya audit drawer’ına taşınmaz:

- terapi düşüncesi, karar notu, paylaşım notu ve profil ham cevapları,
- ham GPS koordinatları, `movement.track` ve konum izi,
- base64 medya, lab binary ve tıbbi dosya gövdesi,
- token, secret, sync URL’si, OpenAI anahtarı veya benzeri kimlik bilgileri,
- bildirim/mesaj gövdesi ve güvenli özet allowlist’inde olmayan metin.

“Hassas drawer” adı ham veriye erişim izni anlamına gelmez. Bu D0’da yalnızca
redaction nedenini ve güvenli metadata’yı görünür kılan bir sınırdır; profile
response ve raw GPS için gösterim kapısı yoktur. Yeni bir raw erişim modeli
ancak ayrı kullanıcı kararı, consent ve teknik güvenlik planıyla açılabilir.

### 8.2 Drawer etkileşimi

| Ekran | Yerleşim | Odak / kapanış | Scroll ve sticky sınırı |
|---|---|---|---|
| Mobil 375–430 | Tam ekran, başlık + içerik + sabit kapat | Açılışta başlığa focus; `Esc`/kapat | Ana sayfa scroll konumu korunur; header/nav drawer’ın altına girmez |
| Tablet 768 | Sağ kolon üstü overlay | Başlık focus; `Esc`/kapat | Arka plan inert; sticky nav görünür ama etkileşimsiz |
| Masaüstü 1280 | Sağdan ≤480px drawer | Başlık focus; `Esc`/kapat | Grid reflow yok; drawer üst katmanda, header ve nav ile çakışmayan offset |

Tüm drawer açma eylemleri gerçek button semantics, minimum 44×44px hedef,
`aria-expanded` ve `aria-controls` kullanır. D0 wireframe’de `[D]` işareti
drawer’ın güvenli metadata mı yoksa redaction durumu mu taşıdığını açıkça
belirtir.

## 9. Responsive ve çakışma kontrol listesi

| Kontrol | Mobil | Tablet | Masaüstü |
|---|---|---|---|
| Header/nav | Nav header altındaki tek sticky band | Tam genişlik header + nav | Tam genişlik header + nav |
| Ana grid | 1 kolon | 2 kolon, yaklaşık 7/5 | 12 kolon, 4/5/3 |
| Hero | Dikey dört kart | Sol kolonda dört özet | Sol health rail’de dört özet |
| Timeline | İlk 5, filtreyle 20/100 | Sol kolon 5/20 | Orta kolon 20/100 |
| Feature kartları | Sıralı ve kapalı özet | Sağ kolonda seçili + özet | Alt tam genişlik modül bandı |
| Drawer | Tam ekran | Sağ kolon overlay | Sağdan ≤480px overlay |
| Kritik durum | Hero’dan hemen sonra | Sol kolonda hero altında | Sağ risk rail’inde, header’dan sonra |

Çakışmama invariant’ları:

1. Header, ribbon ve section nav üç ayrı içerik bandıdır; aynı sticky offset’i
   paylaşmaz.
2. Drawer açıldığında header/nav zemininde eylem yapılmaz ve içerik scroll’u
   drawer tarafından kapatılmaz.
3. 375px genişlikte hiçbir kart veya badge yatay taşma oluşturmaz; uzun Türkçe
   metin satır kırar, event summary ellipsis ile değil drawer bağlantısıyla
   tamamlanır.
4. 1280px’te paralel kolonlar aynı vertical başlangıç çizgisini kullanır;
   sağ rail’in yüksekliği orta timeline’ı zorla kısaltmaz.
5. Reduced-motion açıkken yalnız görünür durum değişimi için opacity/renk
   değişimi kalır; layout giriş animasyonu yoktur.

## 10. D0 kabul kapısı

- [x] Mobil 375–430px, tablet 768px ve desktop 1280px wireframe’i çıkarıldı.
- [x] 10 saniyelik bakış ve 60 saniyelik audit akışları ayrıldı.
- [x] Hızlı bakış, standart ve audit yoğunluk modları konumlandırıldı.
- [x] Loading, empty varyantları, stale, error, conflict, redacted ve
  near-follow durumları gösterildi.
- [x] Her kart için tek karar/amaç cümlesi yazıldı.
- [x] Hassas drawer sınırları ve raw veri yasakları belirlendi.
- [x] Coverage/provenance alanları `SR`, `NOW-S`, `EV`, `MOD-ARSIV`,
  `MOD-TERAPI` ve `MOD-ILETISIM` kartlarına bağlandı.
- [x] Header/sticky nav/drawer çakışma invariant’ları yazıldı.
- [x] CSS, panel HTML ve runtime koduna dokunulmadı.

**Sonraki güvenli adım:** Kullanıcı review’ı. Açık kabul olmadan D1 token /
component prompt’una geçilmez; wireframe kabul edilmeden CSS veya `panel.html`
refactor’ı yapılmaz.
