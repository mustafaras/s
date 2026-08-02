# Raşit ile Kur’an Yolculuğu — Ürün, İletişim ve Uygulama Planı

> **Durum:** QY-18 teslimat kapısı tamamlandı; QY-19 video/WhatsApp eylem
> düzeltmesi, QY-20 koşulsuz WhatsApp eylemi ve QY-21 video not/panel aynası
> 2026-08-02'de uygulandı
> (commit/push/deploy edilmedi).
> **Tarih:** 2026-07-30
> **Hedef:** Kıble kartının altında, sûreleri nüzul sırasıyla sunan; kullanıcı
> isteğini Raşit’e e-postayla ileten, e-posta yanıtındaki doğrulanmış YouTube
> videosunu otomatik yayınlayan ve video durumundan bağımsız WhatsApp üzerinden
> soru sormayı sağlayan kalıcı bir Kur’an yolculuğu.

---

## 1. Onaylanmış ürün kararları

1. Sûreler, Diyanet/TDV temelli yaygın **nüzul sırasına** göre sunulacak.
2. Raşit’in e-posta yanıtındaki geçerli YouTube bağlantısı panel onayı
   beklemeden **doğrudan** ilgili sûreye bağlanacak.
3. “Raşit’e sor” eylemi ayrıntı modalında her zaman görünecek ve her durumda
   etkin olacak; görünürlüğü veya çalışması video izlenme durumuna bağlı değil.
4. Bu eylem, önceden hazırlanmış sûre bağlamıyla şu WhatsApp numarasına
   yönlendirecek: `+90 506 602 00 98`.
5. Katalogdaki bütün sûreler görülebilecek; sıra, keşfi düzenleyecek fakat
   kullanıcıyı yapay biçimde kilitlemeyecek.
6. Aynı sûre için cevap beklerken ikinci bir istek gönderilemeyecek.

### Kabul edilen mimari sonuç

Bu proje statik GitHub Pages üzerinde çalıştığı için gelen e-posta cevabı
tarayıcı tarafından alınamaz. Bu nedenle güvenli bir gelen-e-posta köprüsü
zorunludur. Önerilen çözüm:

- Giden bildirim: mevcut GitHub Actions → e-posta deseni.
- Gelen cevap: Gmail Apps Script zaman tetikleyicisi.
- Yayın: yalnız doğrulanmış `videoId` → ayrı Kur’an yanıt dosyası.
- Uygulama: yanıt dosyasını salt-okunur alır ve ilgili istekle eşleştirir.

Bu karar ileride ayrıca bir ADR’ye dönüştürülebilir; bu belge şimdilik ürün ve
uygulama planının tek kaynağıdır.

---

## 2. Değiştirilemez güvenlik ilkeleri

- Gelen e-posta otomasyonu `data/latest.json` dosyasını **asla yazmayacak**.
- Kur’an istekleri, günlük ruh hâli/not/zikir verisinden ayrı dosyalarda
  taşınacak.
- Gmail, GitHub ve e-posta servis anahtarları istemci koduna yazılmayacak.
- Gelen cevap yalnız izin verilen Raşit e-posta adresinden gelirse kabul
  edilecek.
- Konu içindeki istek kimliği, aktif bir istekle birebir eşleşmek zorunda.
- Yalnız doğrulanmış YouTube video kimliği saklanacak; ham iframe veya HTML
  kabul edilmeyecek.
- `javascript:`, rastgele yönlendirme, kanal, profil ve geçersiz playlist
  bağlantıları reddedilecek.
- Aynı cevap tekrar işlense bile ikinci kayıt oluşmayacak; işlem idempotent
  olacak.
- Yerel tarayıcıyla doğrulama yapılmayacak; mevcut headless `node:vm`
  harness’leri genişletilecek.
- `mustafaras/seyma-data` üzerinde gerçek yazma testi açık kullanıcı izni
  olmadan yapılmayacak.

### Telefon numarası görünürlüğü

GitHub Pages istemci kodunda kullanılan WhatsApp hedef numarası teknik olarak
sayfa kaynağını gören biri tarafından okunabilir. Statik bir uygulamada bunu
gerçek anlamda gizlemek mümkün değildir. Uygulama aşamasında numara tek bir
merkezî sabitte tutulmalı, gereksiz veri kayıtlarına veya e-postalara
çoğaltılmamalıdır.

---

## 3. Bilgi mimarisi

İlham & İbadet ana akışındaki sıra:

1. Vakit ve Hicri tarih şeridi
2. Bilimsel Kıble kartı
3. **Raşit ile Kur’an Yolculuğu kartı**
4. `Öz · Öncü · İman · Zikir · Rapor` sekmeleri

Kur’an kartı başka bir kartın içine gömülmeyecek. Kıble kartıyla aynı hizada,
tam genişlikte ve bağımsız bir ana eylem olacak.

### Ana kartın bilgi önceliği

Kart ilk bakışta şu dört soruyu cevaplamalı:

1. Şu an hangi sûredeyim?
2. Bu sûre nüzul yolculuğunda kaçıncı durak?
3. İsteğim/video durumum ne?
4. Bir sonraki anlamlı eylem ne?

Örnek:

```text
RAŞİT İLE KUR’AN YOLCULUĞU
1. DURAK · ALAK SÛRESİ
“Oku” çağrısıyla başlayan yolculuk

1 / 114 sûre                         %0
[ Raşit’ten iste ]
```

Kart durumları:

- `Başlamaya hazır`
- `Raşit’e iletiliyor`
- `İstek kaydedildi`
- `Raşit’e haber verildi`
- `Raşit’in cevabı bekleniyor`
- `Yeni anlatım hazır`
- `İzleniyor`
- `İzlendi · Sorunu Raşit’e iletebilirsin`

---

## 4. Sûre kütüphanesi

Katalog ayrı ve dondurulmuş bir içerik modülü olmalı:

```text
quranRevelationOrderV1.js
```

Her kayıt:

```js
{
  id: "alak",
  revelationOrder: 1,
  mushafOrder: 96,
  nameTr: "Alak",
  nameAr: "العلق",
  revelationPlace: "Mekke",
  ayahCount: 19,
  themeTr: "...",
  sourceRefs: ["..."],
  editorialStatus: "reviewed"
}
```

### Editoryal kurallar

- 114 kayıt eksiksiz olmalı.
- `revelationOrder` 1–114 arasında benzersiz olmalı.
- `mushafOrder` 1–114 arasında benzersiz olmalı.
- Arapça adlar insan gözüyle kontrol edilmeli.
- Tema özeti tefsir hükmü veya kesin nüzul sebebi uydurmamalı.
- Kaynak farkı olan sıralar için katalog seviyesinde yöntem notu bulunmalı.
- İçerik modülü kullanıcı verisine ve sync’e karıştırılmamalı.

### Kütüphane görünümü

- Yatay kaydırma kullanılmayacak.
- Sûreler nüzul sırasıyla alt alta listelenecek.
- Her satırda nüzul no, sûre adı, Mekki/Medeni, ayet sayısı ve durum bulunacak.
- Arama; Türkçe ad, Arapça ad, mushaf no ve tema üzerinde çalışacak.
- Filtreler: `Tümü`, `İstenmedi`, `Bekleniyor`, `Hazır`, `İzlendi`.
- Filtreler estetik bir expander içinde alt alta veya dar ekranda güvenli grid
  halinde sunulacak.

---

## 5. Sûre ayrıntısı ve istek deneyimi

Bir sûreye dokunulduğunda ayrıntı görünümü açılacak:

- Arapça ve Türkçe sûre adı
- Nüzul ve mushaf sıra numarası
- Mekki/Medeni bilgisi
- Ayet sayısı
- Kısa tema özeti
- Raşit içeriğinin güncel durumu
- Tek ve anlamlı ana eylem

### Duruma göre ana eylem

| Durum | Eylem |
|---|---|
| Hiç istenmedi | `Raşit’ten iste` |
| Gönderiliyor | Pasif `İletiliyor…` |
| Kaydedildi | `İstek kaydedildi` |
| E-posta teslim edildi | `Raşit’in cevabı bekleniyor` |
| Video hazır | `İzlemeye başla` |
| Video izlendi | `Raşit’e sor` |
| Bağlantı geçersiz | `Bağlantı yenileniyor` / güvenli hata |

### Kullanıcı iletişimi

Sistem gerçekleştirmediği şeyi söylememeli:

- Outbox yazıldıysa: **“İsteğin kaydedildi.”**
- Workflow teslim kaydı geldiyse: **“Raşit’e haber verildi.”**
- Geçerli cevap işlendiğinde: **“Raşit’in anlatımı hazır.”**
- Yalnız workflow başarılı oldu diye “Raşit okudu” denmeyecek.
- Gmail cevabı gelmeden “Video hazırlanıyor” gibi kesin olmayan vaat
  kullanılmayacak.

---

## 6. Durum makinesi

Tek bir isteğin durumları:

```text
idle
  → submitting
  → queued
  → notified
  → awaiting_reply
  → validating_reply
  → ready
  → watching
  → watched
  → question_opened
```

Hata dalları:

```text
submitting → request_error
queued → notification_error
validating_reply → invalid_reply
ready → video_unavailable
```

Kurallar:

- `awaiting_reply` durumundaki sûre tekrar istenemez.
- Yeniden yükleme veya cihaz değişimi durumu geriye götüremez.
- `watched` durumu monotoniktir; eski cihaz bunu `ready` durumuna çekemez.
- Aynı e-posta cevabı ikinci kez işlendiğinde state değişmez.
- Yeni ve geçerli bir Raşit cevabı, kaldırılmış videonun yerine geçebilir;
  önceki video geçmişte tutulur.

---

## 7. Veri modeli

Kullanıcının kalıcı yolculuk verisi:

```js
data.quranJourney = {
  schemaVersion: 1,
  catalogVersion: "quran-revelation-tr-v1",
  startedAt: null,
  activeSurahId: "alak",
  requests: {
    alak: {
      requestId: "qr_...",
      status: "awaiting_reply",
      requestedAt: "...",
      notifiedAt: "...",
      responseId: null,
      videoId: null,
      readyAt: null,
      startedWatchingAt: null,
      watchedAt: null,
      questionOpenedAt: null,
      updatedAt: "..."
    }
  }
}
```

### Ayrı transport dosyaları

```text
data/quran-request-outbox.json
data/quran-delivery.json
data/quran-responses.json
```

#### `quran-request-outbox.json`

```js
{
  schemaVersion: 1,
  requestId: "qr_...",
  surahId: "alak",
  revelationOrder: 1,
  surahName: "Alak",
  requestedAt: "...",
  replyToken: "yüksek-entropili-tekil-token"
}
```

#### `quran-delivery.json`

```js
{
  requests: {
    "qr_...": {
      status: "sent",
      sentAt: "...",
      providerMessageId: "..."
    }
  }
}
```

#### `quran-responses.json`

```js
{
  schemaVersion: 1,
  responses: {
    "qr_...": {
      responseId: "qrr_...",
      surahId: "alak",
      videoId: "dQw4w9WgXcQ",
      source: "gmail_reply",
      receivedAt: "...",
      validatedAt: "...",
      senderFingerprint: "...",
      status: "ready"
    }
  }
}
```

`senderFingerprint`, düz e-posta adresi yerine denetim amaçlı güvenli bir özet
olmalı. İstemciye gereksiz kişisel adres taşınmamalı.

---

## 8. E-posta isteği

Kullanıcı `Raşit’ten iste` dediğinde:

1. İstemci güçlü ve benzersiz `requestId` üretir.
2. Aynı sûre için açık istek olup olmadığı tekrar kontrol edilir.
3. Yerel `data.quranJourney.requests[surahId]` atomik güncellenir.
4. Genel veri sync’i ayrı yürür.
5. Özel `pushQuranRequest()` yalnız outbox dosyasını yazar.
6. GitHub Actions yalnız bu dosyanın değişimini dinler.
7. Workflow e-postayı gönderir.
8. Başarılı gönderimde delivery receipt yazılır.
9. Uygulama receipt’i gördüğünde metni “Raşit’e haber verildi” yapar.

### E-posta konusu

```text
[KURAN-REQ:{requestId}:{replyToken}] {nüzulNo}. Durak · {sûreAdı}
```

### E-posta gövdesi

```text
Raşit, Kur’an Yolculuğu için yeni bir anlatım isteği var.

Sûre: Alak
Nüzul sırası: 1
Mushaf sırası: 96
İstek zamanı: ...

Cevaplamak için bu e-postaya yalnızca tek bir YouTube video bağlantısıyla
yanıt vermen yeterli.

Kabul edilen örnekler:
https://www.youtube.com/watch?v=...
https://youtu.be/...
```

Kullanıcıya ait özel notlar veya diğer uygulama verileri e-postaya eklenmemeli.

---

## 9. E-posta cevabının otomatik işlenmesi

Panel onayı yoktur; buna karşılık otomatik doğrulama katı olmalıdır.

### Önerilen Gmail Apps Script akışı

1. Zaman tetikleyicisi belirli aralıkla yalnız ilgili label/thread’leri tarar.
2. Yalnız yapılandırılmış izinli gönderici adresi kabul edilir.
3. Konudan `requestId` ve `replyToken` çıkarılır.
4. Token, açık istekle sabit zamanlı karşılaştırılır.
5. Gövdedeki URL’ler ayrıştırılır.
6. Tam olarak bir geçerli YouTube video URL’si seçilir.
7. URL güvenli biçimde `videoId` değerine normalize edilir.
8. YouTube oEmbed veya güvenli metadata isteğiyle video varlığı doğrulanır.
9. Sonuç `quran-responses.json` içine idempotent biçimde yazılır.
10. E-posta işlendi label’ı alır; tekrar taramada yeniden yayınlanmaz.

### Kabul edilen bağlantılar

- `https://www.youtube.com/watch?v={videoId}`
- `https://youtu.be/{videoId}`
- Karar verilirse `https://www.youtube.com/shorts/{videoId}`

### Reddedilecek durumlar

- İzin verilmeyen gönderici
- Eşleşmeyen/eskimiş token
- Bilinmeyen istek kimliği
- Aynı cevapta birden fazla belirsiz video
- Kanal veya profil URL’si
- YouTube dışı URL
- Geçersiz video kimliği
- Silinmiş veya erişilemeyen video
- HTML/iframe/script içeren cevap

### Doğrudan yayınlama güvencesi

“Onaysız yayın” ham e-postanın doğrudan DOM’a basılması anlamına gelmez.
Yalnızca doğrulanmış 11 karakterli `videoId` yayınlanır. Başlık, açıklama ve
thumbnail gibi dış metadata güvenilmeyen metin olarak ele alınır ve escape
edilir.

---

## 10. Video deneyimi

Video kartı:

- “Raşit’in anlatımı hazır” rozeti
- Sûre ve durak adı
- Güvenli thumbnail
- Video hazır tarihi
- `İzlemeye başla`

### Embed ilkeleri

- İlk render’da iframe yüklenmeyecek; önce kapak/izin katmanı gösterilecek.
- Kullanıcı dokununca `youtube-nocookie.com` embed kullanılacak.
- Otomatik oynatma varsayılan olarak kapalı olacak.
- `referrerpolicy`, dar `allow` listesi ve güvenli `sandbox` değerlendirilerek
  uygulanacak.
- Video alanı sabit aspect-ratio taşıyacak; yükleme sırasında sayfa kaymayacak.
- Video başlığı uzun olsa bile taşmayacak.
- Kaldırılmış video için kırık iframe yerine anlaşılır hata gösterilecek.

### “İzlendi” kararı

Birincil yol:

- YouTube IFrame API `ENDED` olayı güvenle alınırsa video `watched` yapılır.

Erişilebilir yedek:

- API engellenirse veya kullanıcı videoyu YouTube’da açarsa görünür
  **“İzledim”** butonu bulunur.

Kullanıcı açıkça “İzledim” demeden yalnız sayfanın açılması izlenmiş sayılmaz.

---

## 11. “Raşit’e sor” WhatsApp akışı

### Görünürlük

Buton ayrıntı modalında her durumda görünür ve etkindir. YouTube oynatıcının
`ENDED` olayı, kullanıcının `İzledim` onayı veya başka cihazdaki `watchedAt`
değeri bu eylemin açılmasını koşullamaz.

### Buton

```text
[ WhatsApp ikonu ] Raşit’e sor
```

Alt açıklama:

```text
Bu sûreyle ilgili sorunu doğrudan Raşit’e ilet.
```

### Hedef

```text
https://wa.me/905066020098?text={encodeURIComponent(message)}
```

### Hazır mesaj şablonu

```text
Selam Raşit, Kur’an Yolculuğu’nda {sûreAdı} Sûresi
({nüzulNo}. durak) hakkında sana şunu sormak istiyorum:
```

Mesaj soru uydurmayacak. İmleç son satırda kalacak ve kullanıcı kendi sorusunu
WhatsApp’ta yazacak.

### Teknik ve erişilebilirlik kuralları

- Numara E.164 biçiminde, `+` olmadan URL’ye yazılır.
- Mesaj mutlaka `encodeURIComponent` ile kodlanır.
- Bağlantı yeni sekmede açılır.
- `rel="noopener noreferrer"` kullanılır.
- WhatsApp yüklü değilse web.whatsapp.com/wa.me akışı çalışabilmeli.
- Butona basılması `questionOpenedAt` olarak kaydedilebilir; mesajın gerçekten
  gönderildiği iddia edilmez.
- Arayüz “Sorun gönderildi” demeyecek; uygulama WhatsApp gönderimini
  doğrulayamaz. Doğru metin: **“WhatsApp açıldı.”**

---

## 12. Panel aynası

ÆON panelinde “Kur’an Yolculuğu” bölümü:

- Toplam 114 sûre
- İstenen, bekleyen, hazır ve izlenen sayıları
- Son etkinlik
- Açık istek listesi
- Gelen video kimliği ve güvenli YouTube bağlantısı
- Geçersiz cevap/otomasyon hata durumu
- Tekrar e-posta bildirimi
- Yanlış videoyu kaldırma veya yeni cevap bekleme
- İşlem geçmişi

Panel onayı yayın için şart değildir. Panel yalnız gözlem, hata giderme ve
gerektiğinde geri alma yüzeyidir.

Manuel video ekleme yedek yolu bulunabilir; manuel kayıt da aynı URL doğrulama
fonksiyonunu kullanmalı ve otomatik cevaptan daha gevşek olmamalıdır.

---

## 13. Sync ve migration

### Migration

Eski kullanıcıda:

```js
data.quranJourney = {
  schemaVersion: 1,
  catalogVersion: "quran-revelation-tr-v1",
  startedAt: null,
  activeSurahId: "alak",
  requests: {}
}
```

additive biçimde oluşturulmalı.

### Birleştirme kuralları

- Farklı sûre istekleri union.
- Aynı istek `updatedAt` ile LWW, fakat durum geriye gidemez.
- `ready`, `watched` tarafından geriye çekilemez.
- `watchedAt` bir kez oluştuysa eski cihaz silemez.
- Aynı `requestId` iki kez eklenemez.
- Yanıt/video geçmişi kaybolmaz.
- Ayrı response dosyası ana kullanıcı verisiyle full-replace edilmez.

---

## 14. Tasarım yönü

**Amaç:** Günlük kullanılan sakin bir yolculuk aracı.
**Ton:** Vakur, sıcak, editoryal ve güvenilir.
**Hatırlanabilir detay:** Her sûreyi “durak” olarak gösteren ince bir nüzul
yolculuğu çizgisi.
**Kaçınılacaklar:** İç içe kartlar, parlak cam/blur sisi, aşırı altın, hareketli
gradient, yatay kaydırma, birbirine rakip CTA’lar.

### Görsel sistem

- Kıble kartıyla akraba ama ondan ayırt edilen koyu mürekkep/emerald, sıcak
  parşömen ve kontrollü altın.
- Metin arkasında blur/opacity filtresi yok.
- Arapça sûre adı belirgin ve kontrastlı.
- Bütün metinler 370–460px aralığında taşmadan çalışır.
- `prefers-reduced-motion` bütün ilerleme ve video geçişlerini sakinleştirir.
- Hazır video durumu renge ek olarak ikon ve metinle anlaşılır.

---

## 15. Bildirim ve hata dili

| Olay | Kullanıcı metni |
|---|---|
| Yerel kayıt başarılı | `İsteğin kaydedildi.` |
| Outbox yazılamadı | `İstek şu an iletilemedi. Kaydın duruyor; yeniden deneyebilirsin.` |
| E-posta receipt geldi | `Raşit’e haber verildi.` |
| Cevap bekleniyor | `Raşit’in cevabı bekleniyor.` |
| Video hazır | `{Sûre} anlatımı hazır.` |
| Video geçersiz | `Gelen bağlantı doğrulanamadı. Güvenli bir bağlantı bekleniyor.` |
| Video kaldırılmış | `Bu video artık erişilebilir değil. Raşit’ten yeni bağlantı istenecek.` |
| WhatsApp açıldı | `WhatsApp açıldı; sorun henüz gönderilmiş sayılmaz.` |

Hata mesajları e-posta adresi, token, GitHub yolu veya teknik stack trace
göstermemeli.

---

## 16. Başarı ölçütleri

- Kullanıcı üç dokunuşu geçmeden bir sûre için istek oluşturabilir.
- Aynı sûre için yanlışlıkla çift mail oluşmaz.
- E-posta cevabındaki geçerli link otomatik olarak doğru sûreye bağlanır.
- Geçersiz gönderen veya token uygulamada video yayınlayamaz.
- Yanıt otomasyonu ana kullanıcı veri dosyasını yazamaz.
- Video hazır olduğunda uygulama yeniden kurulum gerektirmeden gösterir.
- WhatsApp CTA’sı video izlenme durumundan bağımsız açılır.
- WhatsApp mesajı doğru sûre ve nüzul sıra bağlamıyla hazırlanır.
- Uygulama WhatsApp mesajının gönderildiğine dair yanlış iddiada bulunmaz.
- Yolculuk ilerlemesi cihazlar arasında geriye gitmez.

---

# 17. Sıralı Uygulama Prompt’ları

> Bu prompt’lar sırayla yürütülmelidir. Her prompt kendi doğrulamasını bitirmeden
> sonraki prompt’a geçilmez. Her aşamada `AGENTS.md` ve ilgili plan belgeleri
> okunur. Gerçek tarayıcı açılmaz; `seyma-data` yazılmaz.

---

## QY-00 — Mevcut mimari ve tehdit modeli denetimi

```text
ROL
Kıdemli vanilla JS mimarı ve veri güvenliği denetçisisin.

AMAÇ
Raşit ile Kur’an Yolculuğu özelliği için kod yazmadan önce mevcut app.js,
sync.js, panel.html, .github/workflows ve veri reposu e-posta desenini incele.

ZORUNLU ÇIKTILAR
1. Mevcut request/outbox/inbox akışlarının haritası.
2. latest.json’a dokunmadan kullanılabilecek ayrı dosya deseni.
3. E-posta spoofing, token sızıntısı, tekrar işleme ve yanlış sûre eşleme
   tehdit modeli.
4. Gmail Apps Script ile GitHub Actions arasındaki kesin sorumluluk sınırı.
5. Uygulanacak dosya listesi ve test matrisi.

YASAKLAR
- Kod değiştirme.
- Gerçek mail gönderme.
- Gerçek veri reposuna yazma.
- Tarayıcı açma.

KABUL
Her dış yazma noktası, secret konumu ve geri alma yolu belgelenmiş olmalı.
```

---

## QY-01 — Diyanet/TDV temelli nüzul kataloğu

```text
ROL
Kaynak hassasiyetli içerik mühendisi ve Türkçe editörsün.

AMAÇ
114 sûreyi Diyanet/TDV temelli yaygın nüzul sırasıyla dondurulmuş bir içerik
modülüne dönüştür.

GEREKSİNİMLER
- id, revelationOrder, mushafOrder, nameTr, nameAr, revelationPlace,
  ayahCount, themeTr, sourceRefs, editorialStatus.
- Kaynak farklarını yöntem notuyla açıkla.
- Arapça ve sıra değerlerini otomatik test et.
- Aynı sıra veya eksik sûre olmasın.

DOĞRULAMA
- 114/114 kayıt.
- Nüzul ve mushaf sıra kümeleri tam 1..114.
- Türkçe/Arapça adlar boş değil.
- Kaynak referansı olmayan kayıt yok.
- İçerik uygulama state’ine karışmıyor.
```

---

## QY-02 — V1 veri şeması ve migration

```text
ROL
Şema ve backward compatibility mühendisisin.

AMAÇ
data.quranJourney V1 şemasını additive ve idempotent migration ile ekle.

GEREKSİNİMLER
- requests sûre id’sine göre tutulmalı.
- Durum, request/video/izleme zamanları açık olmalı.
- Eski veri hiçbir alanını kaybetmemeli.
- Aynı migrate iki kez çalışınca derin eşdeğer sonuç vermeli.

DOĞRULAMA
Boş, eski, kısmi ve bozuk fixture’larla headless migration testi yaz.
```

---

## QY-03 — Saf durum makinesi

```text
ROL
Deterministik state-machine mühendisisin.

AMAÇ
idle → request → reply → ready → watched → question_opened akışını saf
fonksiyonlarla tanımla.

GEREKSİNİMLER
- Geçersiz durum sıçramalarını reddet.
- Bekleyen istekte çift gönderimi engelle.
- ready/watched geriye gitmesin.
- Aynı olay iki kez işlendiğinde idempotent olsun.
- Hata ve retry dallarını açık tut.

DOĞRULAMA
Her geçiş ve her reddedilen geçiş için test yaz.
```

---

## QY-04 — Ayrı transport sözleşmeleri

```text
ROL
Dağıtık veri sözleşmesi tasarımcısısın.

AMAÇ
quran-request-outbox, quran-delivery ve quran-responses dosyalarının sürümlü
JSON sözleşmelerini tanımla.

KRİTİK KURAL
Hiçbir otomasyon latest.json’u yazamaz veya full-replace edemez.

GEREKSİNİMLER
- JSON schema veya eşdeğer validator.
- requestId ve replyToken doğrulaması.
- Response idempotency.
- Eski schemaVersion için güvenli fallback.
- Bozuk dosyada uygulama çökmesin.
```

---

## QY-05 — Kur’an Yolculuğu ana kartı

```text
ROL
Mobil ürün tasarımcısı ve erişilebilir vanilla CSS geliştiricisisin.

AMAÇ
Bilimsel Kıble kartının hemen altına bağımsız Raşit ile Kur’an Yolculuğu kartını
ekle.

GEREKSİNİMLER
- Vakit/Hicri → Kıble → Kur’an → sekmeler sırası.
- Nüzul durağı, sûre, ilerleme ve tek CTA.
- 370/390/430/460px taşmasız grid.
- Light/dark ve reduced-motion.
- Blur/flu metin yok.
- Başlamaya hazır, bekleniyor, hazır ve izlendi durumları.

DOĞRULAMA
Headless markup sırası, metin fit sözleşmesi ve durum snapshot testleri.
```

---

## QY-06 — Tam ekran sûre kütüphanesi

```text
ROL
Bilgi mimarisi ve mobil liste deneyimi uzmanısın.

AMAÇ
114 sûreyi nüzul sırasıyla sunan erişilebilir tam ekran yolculuk görünümünü
oluştur.

GEREKSİNİMLER
- Alt alta liste; yatay kaydırma yok.
- Türkçe/Arapça ad, nüzul no, mushaf no, Mekki/Medeni, ayet sayısı.
- Arama ve durum filtreleri.
- Filtreler premium expander içinde.
- Uzun Arapça/Türkçe adlarda çakışma yok.
- Liste scroll konumu korunur.
- Sekme/filtre tıklaması global app render’ı yapmaz.
```

---

## QY-07 — Sûre ayrıntısı ve istek CTA’sı

```text
ROL
Etkileşim tasarımcısı ve güvenilir UI state geliştiricisisin.

AMAÇ
Sûre ayrıntısını ve duruma göre tek ana CTA’yı uygula.

GEREKSİNİMLER
- Raşit’ten iste yalnız idle durumda aktif.
- submitting sırasında çift dokunma engeli.
- Kullanıcıya gerçek delivery durumuna uygun metin.
- Aynı sûrede açık istek varsa ikinci kayıt yok.
- Hata sonrası güvenli retry.
```

---

## QY-08 — Outbox yazma ve sync izolasyonu

```text
ROL
GitHub Contents API ve veri güvenliği mühendisisin.

AMAÇ
Kur’an isteğini dedicated outbox’a yazan işlevi ekle.

KRİTİK
- latest.json full replace zincirinden bağımsız olsun.
- Dev-origin ve anti-clobber korumalarını zayıflatma.
- GitHub token hiçbir payload’a girmez.
- Outbox yazılamazsa yerel istek kaybolmaz.

DOĞRULAMA
Mock fetch ile path, payload, retry, duplicate ve offline testleri.
Gerçek ağ çağrısı yapma.
```

---

## QY-09 — GitHub Actions e-posta bildirimi

```text
ROL
GitHub Actions ve transactional email mühendisisin.

AMAÇ
Outbox değişikliğinde Raşit’e tek, açık ve yanıtlanabilir e-posta gönder.

GEREKSİNİMLER
- Yalnız quran-request-outbox değişiminde tetiklen.
- Subject requestId + replyToken taşısın.
- Sûre/nüzul/mushaf bağlamı ve tek URL ile cevap talimatı.
- Başarı/başarısızlık delivery receipt’e yazılsın.
- Workflow retry aynı isteği iki mail yapmasın.
- Secret’lar yalnız GitHub Actions Secrets içinde.

DOĞRULAMA
Fixture payload ve dry-run; gerçek e-posta ancak açık kullanıcı izniyle.
```

---

## QY-10 — Gmail Apps Script gelen cevap köprüsü

```text
ROL
Gmail otomasyon ve güvenli webhook mühendisisin.

AMAÇ
Raşit’in e-posta cevabını otomatik olarak doğrulanmış quran-responses kaydına
dönüştür.

GEREKSİNİMLER
- İzinli sender allowlist.
- requestId/replyToken birebir doğrulama.
- Thread/label tabanlı tekrar engeli.
- Tek YouTube video URL’si ayrıştırma.
- videoId normalize + oEmbed varlık kontrolü.
- GitHub token yalnız Apps Script Properties’te.
- Ham e-posta gövdesi repoya yazılmasın.
- Hata audit log’u kişisel veri sızdırmasın.

DOĞRULAMA
Geçerli cevap, spoof sender, yanlış token, iki URL, bozuk URL, tekrar cevap,
silinmiş video fixture’ları.
```

---

## QY-11 — Yanıt polling ve otomatik yayın

```text
ROL
Dayanıklı istemci veri alma mühendisisin.

AMAÇ
Uygulamanın quran-delivery ve quran-responses dosyalarını güvenli okuyup yerel
duruma uygulamasını sağla.

GEREKSİNİMLER
- Cache-busting read.
- Bozuk/eksik dosyada çökme yok.
- response requestId/surahId eşleşmesi.
- Yalnız validator’dan geçen videoId.
- Aynı yanıt idempotent.
- Uygulama açılışında ve kullanıcı yenilemesinde kontrol.
- Arka planda agresif polling yok.
```

---

## QY-12 — Güvenli YouTube video kartı

```text
ROL
Web güvenliği, performans ve medya deneyimi uzmanısın.

AMAÇ
Doğrulanmış videoId’yi mahremiyet geliştirilmiş, stabil bir video kartında
göster.

GEREKSİNİMLER
- İlk yüklemede iframe yok; click-to-load.
- youtube-nocookie.com.
- Sabit aspect-ratio.
- Güvenli allow/referrerpolicy.
- Otomatik oynatma kapalı.
- Video erişilemiyorsa kırık alan yerine açıklama.
- Light/dark ve dar ekran.
```

---

## QY-13 — İzlenme doğrulaması

```text
ROL
Medya state ve erişilebilirlik mühendisisin.

AMAÇ
Video gerçekten tamamlandığında veya kullanıcı açıkça İzledim dediğinde sûreyi
watched durumuna geçir.

GEREKSİNİMLER
- IFrame API ENDED olayı.
- API engelinde görünür İzledim fallback’i.
- Sadece iframe açılması izlenme sayılmaz.
- watchedAt monotonik ve sync-safe.
- Tekrar izleme geçmişi temel durumu bozmaz.
```

---

## QY-14 — “Raşit’e sor” WhatsApp yönlendirmesi

```text
ROL
Mobil deep-link ve güvenilir kullanıcı iletişimi mühendisisin.

AMAÇ
Sûre ayrıntı modalında her zaman çalışan Raşit’e sor butonunu uygula.

SABİT HEDEF
+90 506 602 00 98
wa.me E.164: 905066020098

MESAJ
Selam Raşit, Kur’an Yolculuğu’nda {sûreAdı} Sûresi
({nüzulNo}. durak) hakkında sana şunu sormak istiyorum:

GEREKSİNİMLER
- URL encodeURIComponent ile kurulsun.
- Ayrıntı modalında her durumda görünsün ve etkin olsun; video durumuna göre
  `disabled` edilmesin.
- target blank + noopener noreferrer.
- WhatsApp uygulaması/web fallback.
- Tıklamada questionOpenedAt yazılabilir.
- “Mesaj gönderildi” denmesin; yalnız “WhatsApp açıldı.”

DOĞRULAMA
Türkçe karakter, Arapça sûre adı, boş soru ve özel karakter URL testleri.
```

---

## QY-15 — Panel aynası ve operasyon ekranı

```text
ROL
Operasyon paneli ve hata giderme deneyimi tasarımcısısın.

AMAÇ
Panelde yolculuk KPI’ları, istek/yanıt durumları ve hata denetimini göster.

GEREKSİNİMLER
- Bekleyen/hazır/izlendi toplamları.
- Sûre ve request bazlı durum.
- Otomasyon hata nedeni.
- Güvenli manuel video ekleme/kaldırma yedeği.
- Manuel işlem de ortak validator kullanmalı.
- Secret, token ve tam sender adresi DOM’a gelmemeli.
```

---

## QY-16 — Çoklu cihaz merge ve regresyon testleri

```text
ROL
Sync çatışma ve regresyon test mühendisisin.

AMAÇ
Kur’an yolculuğunun iki cihazda veri kaybetmeden birleştiğini kanıtla.

SENARYOLAR
- A cihazı istek gönderir, B bayat kalır.
- Cevap geldiğinde B eski state push eder.
- A watched, B ready.
- İki farklı sûre iki cihazda istenir.
- Aynı request iki response alır.
- Video değiştirilir.
- Offline istek sonra gönderilir.

KABUL
Hiçbir senaryoda watched/ready geriye gitmez, request/video kaybolmaz.
```

---

## QY-17 — Erişilebilirlik, responsive ve motion denetimi

```text
ROL
WCAG ve mobil kalite denetçisisin.

AMAÇ
Kart, kütüphane, video ve WhatsApp CTA’sını erişilebilirlik açısından kapat.

KONTROLLER
- 370/390/393/430/460px.
- Açık/koyu tema.
- 200% text zoom varsayımı.
- Klavye/odak sırası.
- Dialog semantiği ve focus return.
- Arapça lang/dir.
- Kontrast.
- Reduced motion.
- Loading/error/status aria-live.
- Dokunma hedefleri en az 44px.
```

---

## QY-18 — Teslimat kapısı, cache ve dokümantasyon

**Durum (2026-08-01): ✅ TAMAMLANDI — commit/push/deploy edilmedi.** QY-00–17
ile ardından onaylanan İlham & İbadet hub A-F yenilemesi aynı final kapısında
doğrulandı. Cache `20260801b` olarak tek seferde koordine edildi; uygulama
gerçek tarayıcıda açılmadı ve `seyma-data`'ya yazılmadı.

```text
ROL
Release ve delivery gate sorumlususun.

AMAÇ
Özelliği commit/deploy öncesi eksiksiz doğrula.

ZORUNLU
- node --check app.js sync.js ve eklenen JS modülleri.
- driver.mjs.
- Genişletilmiş İlham & İbadet/Kur’an harness’i.
- Migration, state-machine, URL validator, email parser, sync merge testleri.
- panel script-tag/syntax kontrolü.
- CSS brace ve responsive sözleşme kontrolü.
- git diff --check.
- index.html cache bump yalnız finalde bir kez.
- GELISTIRME-PLANI ve ILHAM-IBADET plan güncellemesi.
- AGENTS.md handoff.

YASAK
- Gerçek tarayıcıyla app açma.
- Kullanıcı izni olmadan gerçek e-posta/WhatsApp/GitHub-data yazma testi.
- Test geçmeden commit/push/deploy.
```

---

## QY-19 — Kalıcı “Raşit’e sor” eylemi ve iframe oynatma koruması

**Durum (2026-08-02): ✅ TAMAMLANDI — commit/push/deploy edilmedi.** Ayrıntı
modalındaki WhatsApp eylemi artık istek eyleminin yanında her durumda görünür
ve etkindir; video izlenme durumuna bağlı değildir. `quranJourneyQuestion()` ve izlenme
durumu geçişleri yalnız `#quran-detail-status` ile
`#quran-detail-action-region` bölgelerini hedefli boyar. Böylece çalışan
YouTube iframe'i yeniden kurulmaz ve video konumu başa sarmaz.

Zorunlu kanıtlar:

- Hazır/istenmemiş/bekleyen durumlarda kalıcı etkin düğme ve WhatsApp SVG ikonu.
- `watched → question_opened` geçişinde iframe nesnesi kimlik olarak aynı.
- WhatsApp URL'si, target ve `noopener,noreferrer` sözleşmesi korunur.
- 389px/dark/reduced-motion CSS düzeni ve cache `20260802b`; headless UI kapısı
  216/216 güncel doğrulama ile geçti.

---

## QY-21 — Teslim edilen video çalışma notları ve panel aynası

**Durum (2026-08-02): ✅ TAMAMLANDI — commit/push/deploy edilmedi.** Kullanıcı,
kendisine gönderilen anlatım videosunu izlerken veya dinlerken not türü, video
saniyesi, etiket ve serbest metin kaydedebilir. Notlar ilgili sûre/video
kaydında tutulur; migration bilinmeyen alanları korur, sync iki cihazın notlarını
ID üzerinden birleştirir ve daha yeni aynı not sürümünü seçer. ÆON paneli,
kullanıcıya gönderilmiş geçerli videoları ayrı bir bölümde; hazır/izleme/tamam
zamanlarını, video kimliğini, not sayısını ve son not özetlerini gösterir.

Kabul kanıtları:

- Not kaydı hedefli boyama ile yalnız not bölgesini günceller; çalışan iframe
  nesnesi yeniden kurulmaz ve video başa sarmaz.
- `watch`, `listen`, `reflection` not türleri; opsiyonel saniye ve etiket;
  metin 2.000 karakter, kayıt 100 not ile sınırlıdır.
- `sync.js` not union/dedupe/updatedAt merge kurallarıyla bayat cihazın notu
  yeni cihazın notunu silemez.
- Panelde geçerli `videoId` kayıtları “Kullanıcıya gönderilen videolar”
  bölümünde görünür; not metinleri escape edilerek basılır.
- Video ulaşmadan önce de ayrıntıda kilitli not alanı ve “Video hazır olduğunda açılır” açıklaması görünür; geçerli video geldiğinde form etkinleşir.
- Headless UI 223/223, panel aynası 50/50 ve merge 38/38 geçti; migration
  59/59 korunuyor.

## 18. Definition of Done

Özellik ancak aşağıdakilerin tamamı gerçekleşince bitmiş sayılır:

- 114 sûre kaynaklı ve doğrulanmış nüzul kataloğunda.
- Kur’an kartı kıblenin altında doğru sırada.
- Sûre listesi ve ayrıntısı çakışmasız.
- İstek tekilleştirme çalışıyor.
- E-posta gerçekten yalnız bir kez gidiyor.
- Delivery receipt kullanıcı dilini doğru değiştiriyor.
- Raşit’in izinli e-posta cevabı otomatik işleniyor.
- Geçersiz/spoof cevap video yayınlayamıyor.
- YouTube embed güvenli ve click-to-load.
- İzlenme açık olay veya kullanıcı onayıyla kaydoluyor.
- “Raşit’e sor” her zaman görünür ve etkindir; WhatsApp deep-link’i video
  izlenme durumuna bağlı değildir.
- WhatsApp doğru numaraya, doğru sûre bağlamıyla yönleniyor.
- Uygulama mesajın gönderildiğini yanlış biçimde iddia etmiyor.
- Panel aynası ve hata denetimi hazır.
- Kullanıcıya gönderilen videolar panelde açıkça listelenir; izlerken/dinlerken
  alınan notlar iframe'i bozmadan kaydolur ve panelde takip edilir.
- Migration ve çoklu cihaz merge testleri yeşil.
- Ana kullanıcı veri dosyası e-posta otomasyonu tarafından hiç yazılmıyor.
