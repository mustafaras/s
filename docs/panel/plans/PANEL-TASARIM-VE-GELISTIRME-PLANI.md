# ÆON Paneli — Tasarım ve Kullanıcı Deneyimi Geliştirme Planı

**Belge türü:** Ayrı panel tasarım/UX/uygulanabilir geliştirme planı
**Kapsam:** `panel.html` gözlemci arayüzü; bilgi mimarisi, estetik, okunabilirlik, erişilebilirlik, responsive davranış ve senkron verinin görünür sunumu
**Tarih:** 2026-08-02
**Durum:** D2–D4 kabul edildi; D5 responsive/a11y/motion hazır; kullanıcı review’ı bekleniyor

> Teknik veri kapsamı ve senkron sözleşmesi için
> [PANEL-GOZLEMLENEBILIRLIK-VE-SENKRON-PLANI.md](PANEL-GOZLEMLENEBILIRLIK-VE-SENKRON-PLANI.md)
> temel alınır. Bu belge panelin “ne gösterdiği” kadar “nasıl takip
> ettirdiği”ni tanımlar.

---

## 1. Tasarım hedefi

ÆON paneli yalnızca veri kartlarının bulunduğu koyu bir ekran olmamalı;
Şeyma’nın durumunu hızlıca anlayan, değişiklikleri kaçırmayan, gerektiğinde
ayrıntıya inen ve her metrikte kaynağı/yaşı belli olan sakin bir gözlemci
komuta merkezi olmalıdır.

### Hedef cümle

> Kullanıcı paneli açtığında 10 saniye içinde “Şeyma şu an nasıl, son ne
> değişti, senkron sağlıklı mı, hangi konuya bakmalıyım?” sorularının cevabını
> almalı; 60 saniye içinde seçtiği güne veya olaya tam ayrıntıyla inmeli.

### Tasarım ilkeleri

1. **Önce durum, sonra ayrıntı:** Kritik durumlar ilk bakışta; ham ayrıntı
   kademeli açılır.
2. **Bir kart = bir karar:** Her kartın “ne oluyor?” ve “neden önemli?” cevabı
   olmalı.
3. **Kaynak her zaman görünür:** Kullanıcı girdisi, türetilmiş hesap ve dış
   kaynak aynı görsel dilde karıştırılmamalı.
4. **Gecikme saklanmaz:** Panel stale ise sakin ama belirgin biçimde söyler.
5. **Mahremiyet varsayılan kapalı:** Hassas ayrıntı yalnızca izinli drawer’da.
6. **Tekrar değil bağlam:** Aynı metriği farklı kartlarda tekrar etmek yerine
   tek bir canonical değer ve ona bağlı drill-down kullanılmalı.
7. **Mobil önce, masaüstü büyüyebilir:** iPhone’da rahat; geniş ekranda boşluk
   değil anlamlı paralel kolonlar oluşmalı.
8. **Animasyon bilgiye hizmet eder:** Yeni event, durum değişimi ve loading
   dışında hareket kullanılmamalı; reduced-motion korunmalı.

---

## 2. Mevcut panel UX araştırması

### Güçlü taraflar

- Koyu-altın ÆON kimliği tutarlı.
- CSS değişkenleriyle güçlü renk token sistemi var.
- Kartlar özet + akordeon detay desenini kullanıyor.
- Bölüm atlama şeridi ve sticky bölüm başlıkları var.
- Kur’an paneli teslim edilen videoları, durum zamanlarını ve notları gösteriyor.
- Seçili gün ayrıntısı kapsamlı.
- ÆON/Luna konuşmaları WhatsApp benzeri okunabilir bir modele taşınmış.
- Reduced-motion ve dar ekran kuralları mevcut.

### Gözlenen UX sorunları

1. `.bento` adı kullanılmasına rağmen 480px `max-width` nedeniyle masaüstünde
   kartların büyük bölümü tek sütunda akıyor; geniş ekran gözlemciye paralel
   karşılaştırma avantajı vermiyor. [panel.html#L161](../../../panel.html#L161)
2. Üst command bar; marka, freshness, risk, konum, son açılış, son kayıt ve
   eylemleri aynı yatay/katmanlı alana sıkıştırıyor.
3. “Canlı” durum ile “son yerel kayıt” aynı zihinsel hizada; server receipt ve
   panel poll yaşı ayrı görünmüyor.
4. Jump-nav bölüm isimlerini gösteriyor ama içeride hangi kartın kritik,
   hangisinin bilgi amaçlı olduğu ayrışmıyor.
5. Çok uzun detaylar akordeonda açılıyor; açılan kartın sayfadaki konumu,
   filtre bağlamı ve son güncelleme bilgisi kaybolabiliyor.
6. Tarih seçici var; ancak “son değişen”, “sadece sorunlu”, “bugün güncellenen”
   gibi gözlemci filtreleri yok.
7. Panel polling input odaklanınca atlıyor; bu iyi bir taslak koruması fakat
   kullanıcıya arka planda veri geldiği görünmüyor.
8. Boş durumlar genellikle “kayıt yok” diyor; bunun “henüz kullanılmadı”,
   “senkron gelmedi”, “consent kapalı” veya “veri reddedildi” olduğu ayrışmıyor.
9. Çok sayıda renkli accent mevcut; semantic status ile feature accent aynı
   görsel ağırlığı alabiliyor.
10. Panel tek bir yoğunluk seviyesine sahip; günlük hızlı bakış ile audit
    incelemesi aynı kart yoğunluğunda.

---

## 3. Hedef bilgi mimarisi

### 3.1 Yeni ana akış

```text
ÆON command header
  → Sync health ribbon
  → “Şimdi” özeti
  → Son değişiklikler zaman çizelgesi
  → Kritik durumlar / dikkat gerektirenler
  → Bölüm navigasyonu
  → Ayrıntı kartları
  → Gün / olay / kaynak drawer’ları
```

### 3.2 Ana bölümler

| Bölüm | Amacı | İlk bakış kartları |
|---|---|---|
| Şimdi | Bugünkü genel durum | mod, uyku, enerji, SOS, kullanım |
| Senkron | Verinin güvenilirliği | local/remote/projection/panel zamanı, revision, hata |
| Son Değişiklikler | Kaçırılmaması gereken olaylar | son 20 event, filtre, kaynak |
| Ruh ve risk | Duygu, enerji, stres, kriz | trend, eşik, açıklama |
| Beden ve hareket | Uyku, kafein, sağlık, konum | durum + güvenli özet |
| İçerik ve öğrenme | Okuma, izleme, dinleme, Kur’an, Zihin-Beden | teslimat, not, arşiv |
| Terapi ve profil | Terapi araçları, profil ilerlemesi | consent kontrollü özet |
| İletişim | ÆON/Luna/bildirim | teslim/okunma/yanıt zinciri |
| Arşiv ve kaynak | Saygı, fotoğraf, lab, hedefler | kaynak, lisans, metadata |

### 3.3 Masaüstü ve mobil yerleşim

**Mobil ≤600px:**

- tek kolon,
- üstte compact command header,
- sticky “Şimdi / Senkron / Son değişiklikler” sekmeleri,
- kritik kartlar açık, ikincil kartlar kapalı,
- drawer tam ekran.

**Tablet 601–1000px:**

- 2 kolon,
- sol kolon durum/timeline,
- sağ kolon seçili bölüm ayrıntısı.

**Masaüstü >1000px:**

- 12 kolonlu gerçek bento grid,
- sol 4 kolon: persistent health rail,
- orta 5 kolon: timeline ve seçili gün,
- sağ 3 kolon: risk/sync/observer actions,
- genişlik 1180–1320px aralığında; 480px sınırı yalnız mobilde uygulanmalı.

---

## 4. Yeni command center tasarımı

### 4.1 Üst başlık

Üst bar üç katmanlı olmalı:

1. **Kimlik:** ÆON markası + “Şeyma gözlem paneli” alt başlığı.
2. **Durum:** `Senkron kabul edildi`, `Gecikmiş`, `Çakışma engellendi`,
   `Projection eski` gibi tek canonical badge.
3. **Eylem:** yenile, yoğunluk modu, tarih/filtre, kilit/çıkış.

“Son açılış” ve “son kayıt” header’da küçük metadata olarak kalabilir; ancak
ana bilgi olmaktan çıkarılıp senkron kartına taşınmalı.

### 4.2 Sync health ribbon

Header’ın hemen altında sürekli görünen ince ribbon:

```text
Uzak veri kabul edildi · r1842 · 12:00:01
Panel çekimi · 12:00:04 · 3 sn geride
Hata yok · 0 bekleyen değişiklik
```

Renkler:

- yeşil: kabul edildi ve güncel,
- altın: bekleyen/işleniyor,
- amber: stale veya retry,
- kırmızı: conflict/permission/error,
- gri: yapılandırılmamış/henüz veri yok.

### 4.3 “Şimdi” hero

Altı küçük KPI yerine üstte dört anlamlı hero:

- **Ruh:** mod + enerji + stres,
- **Beden:** uyku + kafein + adım,
- **Süreklilik:** aktif seri + son kayıt,
- **Senkron:** revision + gecikme + hata.

Diğer metrikler bu hero’ların altında açılır. Böylece panel açılışında sayı
kalabalığı azalır; ayrıntı kaybolmaz.

---

## 5. Son değişiklikler zaman çizelgesi

### Kart davranışı

Her event satırı şunları göstermeli:

- saat ve tarih,
- feature iconu,
- kısa olay özeti,
- kaynak etiketi (`kullanıcı`, `hesap`, `dış kaynak`, `teslimat`),
- durum etiketi (`yerel`, `kuyrukta`, `kabul edildi`, `çakışma`, `redacted`),
- ayrıntı drawer’ı.

### Filtreler

- Tümü,
- yalnız dikkat gerektiren,
- yalnız senkron,
- yalnız terapi/profil,
- yalnız Kur’an/video,
- yalnız iletişim,
- kullanıcı girdisi,
- türetilmiş değer,
- dış kaynak.

### Gruplama

Aynı değişikliğin şu zinciri tek olay grubunda gösterilmeli:

```text
Yerelde kaydedildi
  → push kuyruğuna girdi
  → uzak kabul edildi
  → projection üretildi
  → panelde göründü
```

Bu, bir özelliğin “uygulamada göründü ama panelde yok” sorununu doğrudan
teşhis ettirir.

---

## 6. Kart tasarım sistemi

### 6.1 Ortak kart anatomisi

Her kartta aynı sıra kullanılmalı:

1. icon + başlık,
2. durum badge’i,
3. tek cümle bağlam,
4. ana metrik veya son olay,
5. kaynak/zaman satırı,
6. “Ayrıntıyı aç” eylemi.

### 6.2 Kart türleri

| Tür | Kullanım | Varsayılan durum |
|---|---|---|
| Hero | Kritik anlık durum | Açık |
| Timeline | Olay ve değişiklik | Açık, son 5 |
| Summary | Bölüm toplamı | Açık |
| Audit | Kaynak, revision, receipt | Kapalı ama badge görünür |
| Sensitive | Terapi/profil/GPS | Redacted summary |
| Archive | Geçmiş ve metadata | Kapalı |
| Error | Hata ve tekrar deneme | Hata varsa açık |

### 6.3 Boş durumlar

Her boş durum tek tip “kayıt yok” olmamalı:

- **Henüz kullanılmadı:** uygulamada veri oluşmamış.
- **Senkron bekliyor:** local var, remote receipt yok.
- **Projection eski:** kaynak değişmiş, panel modeli bekliyor.
- **Consent kapalı:** veri var fakat gösterim izni yok.
- **Harici kaynak bekleniyor:** API/medya erişimi tamamlanmamış.
- **Gerçekten boş:** kayıt yok ve bekleyen süreç yok.

Her durum için açıklama + güvenli sonraki adım gösterilmeli.

---

## 7. Ayrıntı drawer ve gezinme modeli

### 7.1 Drawer seviyeleri

**Seviye 1 — hızlı ayrıntı:**

- ilgili gün,
- son olay,
- kaynak,
- revision,
- 3–5 temel alan.

**Seviye 2 — feature ayrıntısı:**

- terapi geçmişi,
- bildirim yaşam döngüsü,
- Kur’an video/not zinciri,
- Saygı koleksiyonu,
- günlük fotoğraf kaynağı.

**Seviye 3 — audit/provenance:**

- event ID,
- sequence,
- local/remote/projection zamanları,
- merge/conflict sonucu,
- redaction nedeni.

### 7.2 Drawer kuralları

- Mobilde tam ekran, masaüstünde sağdan açılan 420–520px panel.
- Açılınca odak drawer başlığına taşınır.
- `Esc` ve close button ile kapanır.
- URL hash veya history state ile geri/ileri desteklenebilir.
- Panelin ana scroll konumu korunur.
- Drawer içindeki veri yeniden çekilmez; mevcut projection’dan açılır.

---

## 8. Senkron verisinin kullanıcı dostu sunumu

### 8.1 İnsan dili

Teknik değerler yanında Türkçe açıklama kullanılmalı:

| Teknik | Kullanıcı metni |
|---|---|
| `accepted` | Uzak kayda alındı |
| `queued` | Gönderilmek üzere bekliyor |
| `conflict_blocked` | Veri kaybını önlemek için çakışma durduruldu |
| `projection_pending` | Panel özeti hazırlanıyor |
| `redacted` | Mahremiyet nedeniyle ayrıntı gizlendi |
| `stale` | Bu bölüm güncel kaydın gerisinde |

### 8.2 Gecikme gösterimi

Her senkron zamanında hem mutlak hem göreli gösterim olmalı:

```text
Uzak kabul: 12:00:01
Panel çekimi: 12:00:04
Gecikme: 3 sn
```

“Canlı” badge’i yalnızca gecikme eşik altındaysa kullanılmalı. Eşikler
configurable olmalı; örnek:

- 0–30 sn: güncel,
- 31–180 sn: hafif gecikmiş,
- 3–36 saat: eski,
- 36 saat+: kritik eski.

### 8.3 Yeni veri bildirimi

Panel yeni event aldığında:

- sayfanın üstünde küçük “3 yeni değişiklik” chip’i,
- otomatik scroll yapılmaması,
- kullanıcının seçebileceği “son değişikliklere git”,
- input/taslak durumunda sessiz arka plan güncellemesi

uygulanmalı.

---

## 9. Renk, tipografi ve yüzey sistemi

Mevcut koyu-altın dil korunmalı; ancak renkler bilgi türüne göre ayrıştırılmalı.

### Semantic token katmanı

```text
--status-ok
--status-pending
--status-warning
--status-danger
--status-muted
--source-user
--source-derived
--source-external
--source-delivery
--privacy-redacted
```

Feature accent’leri (`--quranp`, `--faith`, `--zikr`, `--soul`, `--journal`)
status renginin yerine geçmemeli; örneğin Kur’an kartı mavi olabilir ama
“hata” yine kırmızı semantic token kullanmalıdır.

### Tipografi

- Hero sayılar: tek veya iki ana değer, daha az 38px sayı kalabalığı.
- Gövde: minimum 14–15px.
- Micro metadata: 11px altına düşmemeli; kritik bilgiler micro font’a
  saklanmamalı.
- Tabular numerals yalnızca sayı ve zamanlarda.
- Uzun metinler için satır uzunluğu 60–75 karakter.

### Yüzey hiyerarşisi

1. Page background,
2. section surface,
3. card surface,
4. nested detail surface,
5. audit surface.

Her katmanda sınır ve gölge farkı küçük ama tutarlı olmalı; her kartta güçlü
glass blur kullanmak yerine kritik yüzeylerde kullanılmalı.

---

## 10. Kullanıcı dostu filtre ve arama

### Hızlı filtre satırı

- Bugün,
- son 24 saat,
- son 7 gün,
- seçili tarih,
- yalnız sorunlar,
- yalnız yeni değişiklikler.

### Arama

Arama şu alanlarda çalışmalı:

- not ve günlük metni,
- terapi özetleri,
- Kur’an sûre adı/notu,
- ÆON/Luna mesajı,
- arşiv başlığı,
- event özeti.

Arama ham hassas metni yetkisiz drawer’a sızdırmamalı. Sonuç satırında
redacted hit için yalnız “hassas içerik bulundu” denmeli.

### Tarih navigasyonu

- tarih input’u,
- “bugün” ve “son değişiklik” kısayolları,
- önceki/sonraki dolu gün,
- aylık takvimde event yoğunluk noktaları.

---

## 11. Responsive ve erişilebilirlik planı

### Dokunma ve klavye

- Tüm eylemler minimum 44×44px.
- Accordion başlıkları gerçek button semantics taşımalı.
- Tab ve drawer focus trap.
- `aria-expanded`, `aria-controls`, `aria-current` doğru kullanılmalı.
- Yeni event için `aria-live="polite"`; hata için kontrollü `assertive`.
- Renk tek başına status anlamı taşımamalı; icon + metin birlikte olmalı.

### Görsel erişilebilirlik

- Normal metin WCAG AA kontrast.
- Koyu zeminde altın metin yalnız güvenli tonlarda.
- Grafikler text summary ile eşlenmeli.
- Hover’a bağımlı bilgi olmamalı.
- Reduced-motion’da timeline/accordion geçişleri anlık ve stabil olmalı.

### Ekran boyutları

Test hedefleri:

- iPhone SE/375px,
- iPhone 390–430px,
- tablet 768px,
- masaüstü 1280px,
- geniş ekran 1440px.

Her genişlikte header, sticky nav ve drawer birbiriyle çakışmamalı.

---

## 12. Yoğunluk modları

Panel üç görünüm yoğunluğu sunmalı:

### Hızlı bakış

- yalnız hero, sync ribbon, son 5 event,
- kartların çoğu kapalı,
- 10 saniyelik gözlem için.

### Standart

- mevcut panelin geliştirilmiş hali,
- özet kartlar açık,
- seçili bölüm ayrıntıları erişilebilir.

### Audit

- event ID, sequence, source, revision,
- receipt ve retry ayrıntıları,
- redaction nedenleri,
- daha yoğun tablo/listeler.

Yoğunluk tercihi panel localStorage’ında tutulabilir; kullanıcı verisine
karışmamalıdır.

---

## 13. Geliştirme fazları

### Tasarım Faz D0 — Bilgi mimarisi ve wireframe

- Yeni command center, sync ribbon, timeline ve section akışını wireframe’e
  dök.
- Mobil ve masaüstü iki ayrı layout onayla.
- Card anatomy ve status taxonomy’yi sabitle.
- Hassas alanların drawer/redaction sınırını çiz.

**D0 teslimatı (2026-08-03):**
[PANEL-D0-IA-WIREFRAME.md](PANEL-D0-IA-WIREFRAME.md) içinde 375–430px,
768px ve 1280px wireframe’leri; 10/60 saniyelik akışlar; hızlı/standart/audit
yoğunluk modları; loading/empty/stale/error/conflict/redacted durumları;
coverage/provenance eşleşmesi ve hassas drawer sınırları sabitlendi.

**Çıkış kriteri:** Kod yazmadan tüm ana ekran ve drawer durumlarının metinsel
ve görsel wireframe’i hazır.

### Tasarım Faz D1 — Token ve component sözleşmesi

- semantic status token’ları,
- source/privacy badge’leri,
- card, drawer, timeline row, empty state, error state,
- loading/skeleton ve stale banner.

**D1 teslimatı (2026-08-03):**
[PANEL-D1-TOKEN-COMPONENT.md](PANEL-D1-TOKEN-COMPONENT.md) ile semantic
surface/status/source/privacy/feature token’ları; `sync-ribbon`,
`status-badge`, source/privacy badge, `timeline-row`, empty/error/stale,
`detail-drawer` ve `density-toggle` API’leri `panel.css`/`panel.js` içine
bağlandı. Legacy class’lar fixture uyumluluğu için korunuyor; status renkleri
feature accent’lerden ayrıldı.

**Çıkış kriteri:** Yeni kartların inline stil yerine ortak sınıflarla
üretilebilmesi.

### Geliştirme Faz D2 — Header ve senkron yüzeyi

- command header’ı sadeleştir,
- sync health ribbon ekle,
- revision/receipt/lag göster,
- yoğunluk modlarını ekle.

**Çıkış kriteri:** Panel açıldığında senkron durumu ilk bakışta anlaşılır.

**D2 teslimatı (2026-08-03):**
[PANEL-D2-COMMAND-CENTER.md](PANEL-D2-COMMAND-CENTER.md) ile header marka /
canonical status / eylem katmanlarına ayrıldı; local/remote/projection/panel
poll zamanları receipt ve revision kanıtıyla görünür kılındı. Ruh, Beden,
Süreklilik ve Senkron hero’ları; ayrı risk/stale/conflict/error bandı;
erişilebilir tarih/pencere/yenile/çıkış eylemleri; manuel yönlendirmeli `N yeni
değişiklik` chip’i eklendi. Desktop genişliği ve mobil sticky çakışması için
responsive kurallar uygulandı.

**D2 kabulü (2026-08-03):** Kullanıcı command center ve sync ribbon teslimini
onayladı; paired ledger kaydı `PANEL-011` olarak append edildi.

### Geliştirme Faz D3 — Son değişiklikler timeline’ı

- event projection tüketimi,
- filtreler,
- “yeni değişiklik” chip’i,
- event detail drawer,
- input odaklı polling sırasında taslak koruma.

**Çıkış kriteri:** Uygulamadaki yeni bir değişiklik panelde kaynak ve zaman
bilgisiyle izlenebilir.

**D3 teslimatı (2026-08-03):**
[PANEL-D3-TIMELINE-DRAWER.md](PANEL-D3-TIMELINE-DRAWER.md) ile event satırları
saat + feature + güvenli özet + source + status + revision + drawer eylemi
taşıyacak şekilde yenilendi. Correlation ID zincirleri tek grupta gösteriliyor;
dokuz filtre `aria-pressed` ile görünür; drawer hızlı özet / feature ayrıntısı /
audit seviyelerine ayrılıyor. Desktop sağ paneli ve mobil tam ekran davranışı,
Esc/close/focus trap, ana odağa iade, raw redaction, taslak koruması ve
reduced-motion kuralları uygulandı.

**D3 çıkış kanıtı:** `test_panel_p3_timeline_drawer.js` **13/13**, mevcut event
fixture **13/13**, tüm P0–P4/Polling/Faz 10–11/headless migration kapıları yeşil;
paired ledger sequence `PANEL-012` `completed`.

### Geliştirme Faz D4 — Eksik ve özet modül kartları

**D4 teslimatı (2026-08-03):**
[PANEL-D4-MODUL-KARTLARI.md](PANEL-D4-MODUL-KARTLARI.md) ile terapi/profil,
bildirim teslimatı, Kur’an teslimatı, Saygı kanıtı, Günün Fotoğrafı, Konum
Audit ve Zihin-Beden/arşiv provenance modülleri ortak `module-card` +
`detail-drawer` sistemine bağlandı. Her kart canonical metric, cross-check,
source/time, status, privacy ve `Tam/Özet/Redacted/Eksik` coverage rozeti taşır;
boş/bozuk/stale durumlar fail-closed görünür.

**D4 çıkış kanıtı:** `test_panel_p4_module_cards.js` **13/13**; P3 root **26/26**,
P4 provenance **19/19**, D3 timeline **13/13**, P2 sync **8/8**, P2 polling
**15/15** ve tüm headless/migration/syntax kapıları yeşil; paired ledger
sequence `PANEL-013` `ready_for_review`.

### D4 uygulama sırası (teslim kapsamı)

Sırayla:

1. Terapi ve profil,
2. Bildirim teslimatı,
3. Kur’an event zinciri,
4. Saygı kök arşivi,
5. Günün Fotoğrafı,
6. Konum nudge/audit,
7. Zihin-Beden ve diğer arşivler.

### Geliştirme Faz D5 — Responsive desktop/mobile pass

- `PANEL-D5-RESPONSIVE-A11Y.md` ile 375/390/430/768/1280/1440 viewport
  sözleşmeleri uygulandı; 480px üst sınırı yalnız mobil koşuluna taşındı.
- Desktop 12 kolon bento, tablet iki kolon, mobil tek kolon; header, sticky
  nav, section header ve drawer çakışma kapıları düzeltildi.
- 44px action target, native accordion, ARIA current/controls/expanded/live,
  focus ring, AA contrast ve reduced-motion CSS/JS davranışı uygulandı.
- D5 çıkış kanıtı: `test_panel_p5_responsive_a11y.js` **24/24**; paired ledger
  sequence `PANEL-014` `ready_for_review`.

### Geliştirme Faz D6 — Erişilebilirlik ve kalite

- `PANEL-D6-QA-RELEASE-GATE.md` ile D5 sonrası QA/release kapısı tamamlandı:
  syntax, script/CSS, coverage validator, projection redaction/secret scan,
  offline/reconnect, 409/422 retry, anti-clobber, input polling, 1000 event ve
  responsive/contrast/reduced-motion kanıtları kaydedildi.
- D6 fixture **16/16**, tam komut kapısı **22/22 PASS**; backup SHA
  `b6ba580b00660c5c9475caaacb6d68904a9f95dd`; paired ledger sequence
  `PANEL-015` `ready_for_review`.
- Yeşil test release yetkisi değildir; kullanıcı açık onayı olmadan dış eylem
  yapılmaz.

### Geliştirme Faz D7 — Görsel polish ve yayın kapısı

- spacing/radius/shadow birliği,
- ikon optik hizası,
- accent/status ayrımı,
- micro-animation yalnız gerekli event’lerde,
- açık/koyu veya high-contrast seçenek kararı.

---

## 14. Test planı

### Fonksiyonel

- Her yeni kart boş, dolu, stale, error ve redacted fixture ile render edilir.
- Timeline event sırası ve filtreleri doğrulanır.
- Drawer aç/kapa, history, Esc ve focus test edilir.
- Projection yoksa legacy fallback güvenli çalışır.
- Yeni veri geldiğinde input taslağı korunur.

### Görsel

- 375, 390, 430, 768, 1280 ve 1440px screenshot seti.
- Koyu tema ve varsa high-contrast tema.
- Kartlar arası görsel ritim ve üst üste sticky yüzeyler.
- Uzun metin, Türkçe karakter, boş/çok büyük sayılar.

### Erişilebilirlik

- WCAG AA kontrast.
- 44px dokunma hedefi.
- Tab sırası.
- Screen reader label ve live region.
- Reduced-motion.

### Performans

- İlk meaningful paint.
- Projection parse süresi.
- 1000 event timeline render süresi.
- Polling sırasında gereksiz full render sayısı.
- Büyük günlük ve medya metadata fixture’ı.

---

## 15. Tasarım başarı ölçütleri

Panel tasarımının başarılı sayılması için:

- ilk bakışta senkron durumu ve gecikme anlaşılır olmalı,
- 10 saniyede temel durum özeti alınabilmeli,
- son değişikliğe en fazla iki etkileşimde ulaşılabilmeli,
- seçili güne en fazla iki etkileşimde gidilebilmeli,
- hiçbir kritik durum yalnız renkle anlatılmamalı,
- masaüstünde paralel bilgi takibi mümkün olmalı,
- mobilde yatay taşma ve sticky çakışma olmamalı,
- uzun ayrıntı ana akışı boğmadan drawer/accordion’da kalmalı,
- hassas veri redaction durumu açıkça anlaşılmalı,
- paneldeki her kritik sayı kaynak ve zaman etiketi taşımalı.

### Önerilen gözlem metrikleri

- İlk anlamlı durum görünene kadar geçen süre,
- “son değişikliğe ulaşma” tıklama sayısı,
- stale/conflict durumunu fark etme oranı,
- yanlış/eksik veri bildirimi sayısı,
- mobilde yatay overflow hataları,
- accessibility regression sayısı,
- panel full render yerine hedefli güncelleme oranı.

---

## 16. Uygulamaya başlamadan önce kesinleştirilecekler

1. Panel tek gözlemci için mi kalacak, yoksa ileride rol/izin modeli olacak mı?
2. Masaüstünde 1180px geniş layout kabul ediliyor mu?
3. Terapi ayrıntıları hangi consent seviyesinde açılacak?
4. High-contrast/light tema gerekli mi, yoksa dark ÆON kimliği korunacak mı?
5. Gerçek zamanlı relay için ayrı servis yetkisi var mı?
6. Audit event’leri ham metin içerecek mi, yoksa yalnız özet mi?
7. Paneldeki observer action’lar için ayrı bir “işlem geçmişi” bölümü olacak mı?

Bu kararlar alınmadan doğrudan CSS polish’e başlamak yerine önce D0 wireframe,
P0 senkron makbuzu ve coverage sözleşmesi birlikte onaylanmalıdır.
