# ÆON Paneli — Görünürlük, Gözlemlenebilirlik ve Senkronizasyon Planı

**Belge türü:** Araştırma + uygulama planı
**Kapsam:** Yalnızca `panel.html`, panelin okuduğu veri sözleşmeleri ve bu veriyi panele taşıyan senkron/read-model katmanı
**Kapsam dışı:** Şeyma uygulamasının görsel/işlevsel yeniden tasarımı; gerçek kod uygulaması; commit, push ve deploy
**Tarih:** 2026-08-02
**Durum:** Araştırma tamamlandı; uygulama planı bekliyor

> Bu belge uygulama tarafında üretilen fakat ÆON panelinde hiç görünmeyen,
> yalnızca özetlenen veya denetim açısından güvenilir zaman damgası olmayan
> ayrıntıları kataloglar. İkinci belge olan
> [PANEL-TASARIM-VE-GELISTIRME-PLANI.md](PANEL-TASARIM-VE-GELISTIRME-PLANI.md)
> bu teknik planın üstüne kullanıcı deneyimi ve görsel tasarım katmanını koyar.

---

## 1. Yönetici özeti

Panel bugün veri bakımından zayıf bir ekran değildir. Seçili gün ayrıntısında
uyku, kafein, kriz, okuma, izleme, dinleme, öğrenme, zikir tefekkürleri,
İman Köşesi, terapi araçları, magnezyum, şükran ve günlük gibi birçok alan
gösterilir. Kur’an paneli de kullanıcıya gönderilen videoları, video durum
zamanlarını ve notları gösterir.

Asıl sorun, panelin bir **durum görüntüsü** olması; bir **değişiklik, teslimat,
provenans ve senkron denetim sistemi** olmamasıdır. Şu sorular bugün güvenilir
biçimde cevaplanamıyor:

1. Bu bilgi ne zaman uygulamada değişti?
2. Sunucu bunu hangi revision ile kabul etti?
3. Değişiklik hangi cihazdan geldi?
4. İki cihaz arasında çakışma oldu mu?
5. Panelin gördüğü veri kaç saniye/dakika geriden geliyor?
6. Alan panelde yok mu, yoksa mahremiyet nedeniyle bilinçli mi gizlendi?
7. Kullanıcı girdisi ile türetilmiş panel özeti birbirinden ayrılabiliyor mu?

### Öncelik sırası

| Öncelik | Amaç | Sonuç |
|---|---|---|
| P0 | Gerçek senkron makbuzu ve gecikme görünürlüğü | Panel “canlı” iddiasını kanıtla gösterir |
| P0 | Veri kapsamı sözleşmesi | Hiçbir kalıcı alan sessizce kaybolmaz |
| P1 | Eksik kök modüllerin projection’a alınması | `dailyPhoto`, `roomContentHistory`, kök `saygi`, nudge ve audit kayıtları görünür olur |
| P1 | Append-only olay günlüğü | Son değişiklikler ve kaynak/provenans takip edilir |
| P1 | Bildirim, terapi ve profil denetim yüzeyleri | Özet yerine güvenli ayrıntı ve durum geçmişi oluşur |
| P2 | Koşullu/gerçek zamanlı taşıma | GitHub polling sınırı aşılmak istenirse relay/SSE yolu açılır |

---

## 2. Araştırma yöntemi ve kanıt sınırı

Bu araştırmada:

- `app.js` migration, runtime state, günlük veri modeli ve feature kayıtları
  tarandı.
- `panel.html` içindeki `D.<alan>` referansları ve seçili gün render akışı
  tarandı.
- `sync.js` sanitize, debounce, full-replace, anti-clobber ve merge davranışı
  incelendi.
- Panelin polling ve render engelleme koşulları incelendi.
- Mevcut panel headless testi çalıştırıldı: **50/50 geçti**.
- `node --check app.js` ve `node --check sync.js` geçti.
- Çalışma ağacı temiz kaldı; veri reposuna, kullanıcı verisine veya gerçek
  tarayıcıya dokunulmadı.

### Temel referanslar

- [app.js#L1460](../../../app.js#L1460) — `migrate()` ile kök state ve audit alanları.
- [app.js#L1524](../../../app.js#L1524) — `dailyPhoto` modeli.
- [app.js#L1559](../../../app.js#L1559) — `roomContentHistory` backfill.
- [app.js#L1896](../../../app.js#L1896) — günlük kayıt alanlarının ana şeması.
- [app.js#L4519](../../../app.js#L4519) — konum nudge state’i ve davranış sayımları.
- [app.js#L5830](../../../app.js#L5830) — günün fotoğrafı fetch/cache akışı.
- [app.js#L6697](../../../app.js#L6697) — günlük içerik geçmişinin yazılması.
- [panel.html#L1195](../../../panel.html#L1195) — panelin son kayıt/freshness hesabı.
- [panel.html#L2365](../../../panel.html#L2365) — Saygı panelinin günlük kayıtlardan yeniden
  hesaplanması.
- [panel.html#L3235](../../../panel.html#L3235) — Terapi Odası seçili gün özetinin sınırı.
- [panel.html#L4056](../../../panel.html#L4056) — panel latest/inbox/delivery yükleme akışı.
- [panel.html#L4108](../../../panel.html#L4108) — 15 saniyelik polling ve input sırasında atlama.
- [sync.js#L582](../../../sync.js#L582) — sanitize ve full replace zinciri.
- [sync.js#L772](../../../sync.js#L772) — debounce’lu schedule/push davranışı.

---

## 3. Mevcut veri ve taşıma mimarisi

### 3.1 Uygulamanın kaynak modeli

Şeyma’nın tek kalıcı state’i `data` objesidir. Günlük kayıtlar
`data.days[date]` altında tutulur; kök modüller aynı objeye eklenir. `save()`
localStorage’a yazar ve `SeySync.schedule(data)` çağırır.

Bu mimarinin güçlü yanı tek kaynaklı olmasıdır. Zayıf yanı ise tek bir
`latest.json` dosyasının birçok farklı özelliğin değişimini full-replace
mantığıyla taşımasıdır. Alan bazında değişiklik sırası, kaynak cihazı ve
sunucu kabulü ayrı bir kayıt olarak tutulmadığında panel yalnızca en son
birleşmiş görüntüyü görür.

### 3.2 Senkron zinciri

Mevcut zincir yaklaşık olarak şöyledir:

```text
UI eylemi
  → data değişir
  → localStorage yazılır
  → SeySync.schedule()
  → 4 sn debounce
  → sanitize()
  → data/backups/<timestamp>.json
  → data/latest.json full replace + merge/anti-clobber
  → data/gunluk/<date>.json
  → panel 15 sn polling
```

Bu zincirde panelin gördüğü `latest.json` ile uygulamanın yerel `save()` anı
arasında ölçülebilir, imzalı ve kalıcı bir makbuz bulunmuyor.

### 3.3 Yardımcı veri dosyaları

Panelin latest dışında okuduğu veya yazdığı kanallar ayrı sınıflandırılmalı:

| Kanal | Kullanım | Plan notu |
|---|---|---|
| `data/latest.json` | Ana kullanıcı snapshot’ı | Kaynak veri olarak korunur |
| `data/gunluk/<date>.json` | Günlük snapshot/yedek | Gün ayrıntısının geri dönüş noktası |
| `data/backups/<timestamp>.json` | Push öncesi yedek | Denetim ve rollback kanıtı |
| `data/quran-delivery.json` | Kur’an teslim durumu | Panel ayrı okuyor; projection’a bağlanmalı |
| `data/quran-responses.json` | Kur’an cevapları | Durum makinesi ile ilişkilendirilmeli |
| `data/observer-inbox.json` | ÆON → kullanıcı iletileri | Bildirim teslimatıyla tek timeline’a bağlanmalı |
| `data/aeon-outbox.json` | Panel/observer → workflow sorusu | Gönderim receipt’i ile bağlanmalı |
| `data/aeon-media/<id>.json` | Ses/fotoğraf/belge medyası | Metadata projection’da; binary varsayılan gizli |
| `data/profile-outbox.json` | Profil tamamlanma tetikleyicisi | Güvenli durum sinyali olarak projection’a alınmalı |

---

## 4. Ayrıntılı görünürlük envanteri

### 4.1 Tamamen görünmeyen kök alanlar

| Veri yolu | Uygulamadaki anlamı | Panel durumu | Önerilen görünürlük |
|---|---|---|---|
| `data.dailyPhoto` | Günün fotoğrafı, Wikimedia başlık/sanatçı/lisans/açıklama/kaynak/fetch zamanı | Panelde doğrudan referans yok | Kaynak, lisans, tarih, hata ve cache durumu gösterilsin |
| `data.roomContentHistory` | Terapi Odası’nda gösterilen kitap/izleme/podcast içeriklerinin gün bazlı geçmişi | Panelde doğrudan referans yok | İçerik gösterildi mi, kullanıcı açtı mı, kaynağı neydi ayrıştırılsın |
| `data.locNudge` | Konum nudge gösterim, erteleme, dismiss, backoff, opt-out geçmişi | Panelde doğrudan referans yok | İzin kararından ayrı, davranış/audit kartı olarak gösterilsin |
| `data.locationLastTs` | Konum akışının son işlenme zamanı | Panel yalnız `data.location.ts` kullanıyor | Son örnek, son işleme ve son senkron ayrı gösterilsin |
| `data.saygi` | Koleksiyon, seri, son okuma ve kök ilerleme | Panel günlüklerden yeniden hesaplıyor | Kök state + türetilmiş günlük kanıt birlikte gösterilsin |
| `data.lastOpenedDate` | Uygulamanın son açıldığı gün | Panel bunu dolaylı olarak `lastOpenedAt`/session’dan çıkarıyor | Kaynak alan ve çıkarılmış değer ayrıştırılsın |
| `data.lastSyncDate` | Uygulama callback’inde yerel senkron günü | Panelde yok; gerçek server receipt’i de değil | Yerel callback ve server kabulü ayrı alanlar olsun |
| `data.savedAt` | Bazı ayar değişikliklerinde yazılan kök zaman damgası | Panel `days[].savedAt` maksimumunu kullanıyor | Kök değişiklikler freshness hesabına girmeli |

### 4.2 Panelde yalnızca özetlenen alanlar

| Veri yolu | Şu an görülen | Görünmeyen ayrıntı | Mahremiyet kararı |
|---|---|---|---|
| `days[].therapy.thoughts[]` | Düşünce kayıt adedi | Durum, alternatif düşünce, kanıt ve zaman çizelgesi | Varsayılan özet; açık audit drawer’da redakte ayrıntı |
| `days[].therapy.decision` | Seçilen seçenek | `optionA`, `optionB`, karar notu, tamamlanma zamanı | Metin gösterilebilir; ayrı hassasiyet etiketi |
| `days[].therapy.share` | Gönderim zamanı | Güvenli paylaşım notu ve teslim sonucu | Not varsayılan gizli; teslim metadata görünür |
| `days[].sleep.windDown` | Adımlar, son dakika, oturum sayısı | `events[]` içeriği ve her event’in zamanı | Kullanıcı rızasıyla ayrıntı |
| `days[].movement` | Mesafe, süre, hız, örnek sayısı | `track[]` ham koordinatları ve örnek zamanları | Ham GPS kilitli; yalnız kümelenmiş özet |
| `days[].notifications` | Okundu/silindi/iletildi statüsü | `synced`, push deneme, hata, retry, native bildirim zamanı | Metadata görünür, içerik mevcut kurallarla korunur |
| `profileAssessment` | İlerleme ve consent kontrollü güvenli özet | Revision, son cevap zamanı, kalite sinyalleri, in-progress audit | Ham cevaplar kesinlikle gösterilmez |
| `library/watchlist/music` | Katalog ve bazı alıntılar | Kayıt değişiklik geçmişi, silme/ara verme nedenleri, kaynak zamanı | İçerik görünür; olay geçmişi ayrı |
| `settings.targets` | Hedefler ve yüzdeler | Son hesaplama nedeni, input provenance ve sürüm | Kişisel ölçüler özetlenir |
| `labResults` | Sonuç ve dosya metadata’sı | İşleme/erişim geçmişi, media fetch hatası | Tıbbi dosya içeriği varsayılan kapalı |

### 4.3 Panelde görünse de kaynak doğruluğu zayıf alanlar

1. **Freshness:** Panel `days[].savedAt` içindeki en yeni zamanı baz alıyor;
   root ayar değişikliklerini ve server kabul zamanını hesaba katmıyor.
2. **Saygı:** Kök `data.saygi` yerine günlüklerden yeniden hesaplama yapılıyor.
   Bu, türetilmiş değer ile kaynak state’in ayrışmasını gizleyebilir.
3. **Zihin-Beden arşivi:** Panel render sırasında günlüklerden arşiv backfill’i
   yapabiliyor. Bu değer panel belleğinde üretilmiş olabilir; kaynak snapshot’a
   geri yazılmış bir kanıt değildir.
4. **Hava durumu:** Panel `data.location` üzerinden ayrıca Open-Meteo çağrısı
   yapıyor. Böylece paneldeki canlı hava ile synced `data.weather` aynı anı
   temsil etmeyebilir.
5. **ÆON medya:** Mesaj metadata’sı snapshot/inbox’tan, binary içerik ayrı
   media dosyasından gelir. Panel bu iki kaynağın erişim hatasını tek statüde
   birleştirmiyor.

---

## 5. Denetim boşlukları

### 5.1 Zaman modeli

Her modül kendi zaman alanlarını kullanıyor: `savedAt`, `updatedAt`, `readAt`,
`answeredAt`, `receivedAt`, `fetchedAt`, `startedAt`, `completedAt`. Bunların
üzerinde ortak bir event sırası yok.

Gerekli ortak alanlar:

```text
eventId              benzersiz değişiklik kimliği
sequence             monotonik sıra numarası
occurredAt           uygulamada meydana gelme zamanı
persistedAt          localStorage’a yazılma zamanı
submittedAt          senkron gönderim zamanı
acceptedAt           uzak kaynak tarafından kabul zamanı
sourceDeviceId       cihaz sırrı olmayan anonim cihaz kimliği
schemaVersion        olay sözleşmesi sürümü
```

### 5.2 Kaynak/provenans modeli

Panel her değerin hangi türden olduğunu ayırmalı:

- `user_input`: kullanıcının elle girdiği metin/sayı/seçim,
- `derived`: uygulama tarafından hesaplanan özet,
- `external`: Wikimedia, hava, sağlık Gist’i veya başka dış kaynak,
- `observer`: panel/ÆON tarafından üretilen olay,
- `delivery`: workflow veya inbox teslimatı,
- `redacted`: veri mevcut fakat mahremiyet nedeniyle gösterilmiyor.

Bu etiket olmadan paneldeki “risk”, “seri”, “ortalama” ve “durum” değerleri
kullanıcı girdisi gibi algılanabilir.

### 5.3 Çakışma ve kayıp görünürlüğü

`sync.js` anti-clobber ve merge korumaları uyguluyor; ancak panelde şu
sonuçlar görünmüyor:

- local < remote koruması tetiklendi mi,
- hangi alanlar merge edildi,
- hangi cihazın değeri kazandı,
- kaç değişiklik beklemede,
- son push hangi dosyalarda başarılı oldu,
- backup oluşturulabildi mi,
- 409/422/401/403/404 gibi hata sınıfı neydi.

### 5.4 Panelin kendi gecikmesi

Panel polling’i şu durumlarda atlıyor:

- ÆON mesajı gönderilirken,
- herhangi bir `input` veya `textarea` odaktayken,
- panel sekmesi görünür değilken.

Bu taslak kaybını önleyen iyi bir UX kararıdır; fakat denetim paneli bunu
“güncelleme durdu” diye göstermediği için kullanıcı panelin canlı olduğunu
zannedebilir. Çözüm, DOM’u yeniden kurmadan data projection’ı güncellemek ve
taslağı korumaktır.

---

## 6. Hedef teknik sözleşme

### 6.1 `observer-snapshot.json`

Panelin tüketmesi için read-only projection önerisi:

```json
{
  "schemaVersion": 1,
  "snapshotRevision": 1842,
  "sourceLatestSha": "…",
  "sourceUpdatedAt": "2026-08-02T12:00:00.000Z",
  "projectionBuiltAt": "2026-08-02T12:00:02.000Z",
  "serverAcceptedAt": "2026-08-02T12:00:01.000Z",
  "lag": { "sourceToProjectionMs": 2000, "projectionToPanelMs": null },
  "sync": {
    "state": "accepted",
    "lastErrorCode": null,
    "conflict": false,
    "pendingCount": 0
  },
  "coverage": { "full": [], "summary": [], "redacted": [], "missing": [] },
  "sections": {
    "today": {},
    "therapy": {},
    "notifications": {},
    "quran": {},
    "saygi": {},
    "location": {},
    "archives": {}
  }
}
```

Projection ham snapshot’ın yerine geçmez; `latest.json` ve günlük backup’lar
silinmez. Panel için güvenli, küçük ve kaynakları açıkça etiketlenmiş bir
okuma modelidir.

PANEL-004 uygulamasında bu sözleşme `panelCoverageManifest.js` içindeki
`window.PanelCoverageV1` ile korunur. `data` alanı panel parity’sini bozmamak
için legacy-shaped fakat redacted bir görünüm taşır; panel projection’ı yalnız
receipt’in `sourceLatestSha` + `snapshotRevision` değerleriyle eşleştiğinde
kullanır. Projection yok, bozuk veya eskiyse panel aynı adapter üzerinden
secret/GPS/profile raw/media verisini ayıklanmış legacy fallback’e düşer.

PANEL-005 / Prompt 03 ile aynı adapter’in `sections` read-modeline kök
`dailyPhoto`, `roomContentHistory`, `saygi` root/günlük karşılaştırması,
`locNudge`, konum sample/process/accepted zamanları ve lifecycle/settings
özeti eklendi. Panel kartı source value ile türetilmiş durumu ayrı badge’lerle
gösterir; eski cache lisans/kaynak doğrulanmadan hazır sayılmaz, günlük konum
track’i projection’a girmez ve render sırasında soul-archive backfill’i
çalıştırılmaz. Root Saygı ile günlük read kanıtı uyuşmazlığı alarm olarak kalır.

PANEL-006 / Prompt 04 ile `sections.therapyProvenance`, `profileProgress`,
`notificationTimeline` ve `externalSources` eklenmiştir. Terapi thought/note
alanları observer modelinden redacted olur; seçim, tamamlanma, gönderim/teslim
ve wind-down event agregatı metadata olarak kalır. Bildirim timeline’ı
oluşturulma, inbox, cihaz teslimi, okuma/görülme, silme, sync ve retry/error
stage’lerini aynı event altında taşır; `receivedAt` okundu kanıtı sayılmaz.
Profil response raw değerleri ve terapi hassas metni DOM’a girmez. Dış kaynak
fetch hataları `error` + whitelist code olarak görünür; missing ile sessizce
birleştirilmez. Her event/metric provenance sınıfını ve privacy sınıfını taşır.

### 6.2 `observer-events/YYYY-MM-DD.jsonl`

Append-only event satırı:

```json
{
  "eventId": "evt_…",
  "sequence": 1842,
  "occurredAt": "2026-08-02T12:00:00.000Z",
  "acceptedAt": "2026-08-02T12:00:01.000Z",
  "section": "therapy",
  "path": "days.2026-08-02.therapy.decision",
  "operation": "updated",
  "summary": "Karar aracı güncellendi",
  "source": "user_input",
  "sourceDeviceId": "device_anon_…",
  "privacyClass": "private_summary"
}
```

Event günlüğü ham metni, tokenı, tam GPS koordinatını veya profil raw
cevabını taşımamalıdır. Gerekirse ayrıntı snapshot içinde değil, yetkili
ve ayrı bir erişim katmanında açılır.

### 6.3 Sync state machine

```text
idle
  → local_saved
  → queued
  → uploading
  → remote_read
  → merged / conflict_blocked
  → accepted
  → projection_pending
  → projection_ready
  → panel_visible
```

Hata durumları ayrı kodlanmalıdır:

```text
offline, unauthorized, forbidden, not_found, conflict, anti_clobber,
validation, rate_limited, projection_failed, media_unavailable
```

---

## 7. Uygulama fazları

### Faz P0 — Senkron kalp atışı ve kabul makbuzu

**Amaç:** “Son kayıt” yerine kanıtlanabilir “son kabul” göstermek.

**İşler:**

- `snapshotRevision` ve `sourceLatestSha` tanımla.
- Push denemesi, başarılı push, hata kodu ve conflict sonucu için güvenli
  receipt üret.
- `lastSyncDate` benzeri yerel callback alanlarını server receipt’inden ayır.
- Panelde `local`, `remote`, `projection`, `panel poll` zamanlarını ayrı göster.
- `freshness()` yalnız günlük `savedAt` değil, receipt ve root değişiklikleriyle
  hesaplanmalı.

**Kabul:** Sentetik local/remote çatışmasında panel “çatışma engellendi”yi,
başarılı push’ta server revision’ı ve gecikmeyi gösterir.

### Faz P1 — Coverage manifest ve read-model temeli

**İşler:**

- `panelCoverageManifest` dosyasını ekle.
- Uygulama kök alanları, günlük alanları, auxiliary dosyaları ve media
  metadata’sını sınıflandır.
- Projection üreticisi yaz; raw secrets ve hassas alanları filtrele.
- Panel önce projection’ı, yoksa güvenli legacy fallback’i okusun.
- Projection oluşturma hatasını panelde görünür yap.

**Kabul:** Fixture içindeki her kalıcı alan `full`, `summary`, `redacted` veya
`missing` olarak raporlanır; sessiz kayıp kalmaz.

### Faz P1 — Eksik kök modüller

Sırayla:

1. `dailyPhoto` kaynak/lisans/cache kartı,
2. `roomContentHistory` içerik gösterim geçmişi,
3. kök `saygi` koleksiyon/seri kartı,
4. `locNudge` davranış ve izin audit kartı,
5. `locationLastTs` işleme/senkron zamanı,
6. root `savedAt` ve ayar değişikliklerinin freshness’a katılması.

### Faz P1 — Ayrıntılı güvenli denetim

- Terapi Odası günlük ve dönem arşivi.
- Bildirim yaşam döngüsü: oluşturuldu, teslim edildi, okundu, silindi,
  senkronlandı, hata/yeniden deneme.
- Profil değerlendirmesi: başlangıç, ilerleme, consent, tamamlanma,
  paylaşım izni, revision; ham cevap yok.
- Kur’an delivery, response, notification ve kullanıcı video notlarını tek
  olay zaman çizelgesinde ilişkilendir.

### Faz P2 — Event log ve son değişiklikler

- Append-only event dosyaları.
- Son 20/50/100 değişiklik filtresi.
- Tarih, bölüm, kaynak ve privacy class filtreleri.
- Aynı olayın retry/merge/accepted zincirini tek grup altında göster.

### Faz P2 — Polling optimizasyonu

- ETag/SHA conditional fetch.
- `observer-snapshot.json` için küçük payload.
- Input odaklıyken snapshot’ı arka planda al, yalnız DOM’u yeniden kurma.
- Panelde “taslak korunuyor; veri arka planda güncelleniyor” göstergesi.

### Faz P3 — Gerçek zamanlı relay kararı

GitHub Pages sınırı nedeniyle iki seçenek belgelenmeli:

| Seçenek | Artı | Eksi |
|---|---|---|
| 10–15 sn polling + ETag | Backend yok, mevcut model korunur | Gerçek anlık değildir; API limitine bağlıdır |
| Read-only SSE/WebSocket relay | Saniye altı güncelleme mümkün | Yeni servis, kimlik doğrulama, mahremiyet ve maliyet gerekir |

Bu karar alınmadan panele “real-time” etiketi konulmamalıdır.

---

## 8. Mahremiyet ve veri güvenliği sınırları

### Varsayılan olarak gösterilmeyecekler

- `settings.ghToken`, `settings.openaiKey`, auth ve repo sırları,
- profil değerlendirmesinin ham item cevapları,
- tam GPS `movement.track`,
- tahlil dosyasının ham binary içeriği,
- mesaj medyasının base64 gövdesi.

### Panelde gösterilebilecek güvenli özetler

- anonimleştirilmiş cihaz kimliği,
- yaklaşık konum yaşı ve nokta sayısı,
- hareketin kümelenmiş mesafe/süre özeti,
- profil güven seviyesi ve tamamlanma durumu,
- medya türü, boyutu, teslim zamanı ve erişilebilirlik durumu,
- olayın privacy class’ı ve redaction nedeni.

### Fail-closed kuralları

1. Projection üretilemezse panel eski projection’ı “stale” olarak gösterir;
   yeni veri uydurmaz.
2. Bir alanın schema doğrulaması geçmezse yalnız o bölüm kırmızı/eksik olur;
   bütün panel boşaltılmaz.
3. Receipt yoksa “senkron başarılı” yazılmaz.
4. Türetilmiş metrik kaynak kanıtı yoksa “hesaplanamadı” gösterilir.
5. Panel hiçbir koşulda `latest.json` veya `gunluk` yazmaz.

---

## 9. Test ve doğrulama planı

### Sözleşme testleri

- Coverage manifest ile app schema karşılaştırması.
- Eksik alan ve bilinmeyen alan alarmı.
- Projection redaction testi.
- Secret/token DOM ve JSON sızıntısı testi.

### Senkron testleri

- İlk push.
- Offline → online reconnect.
- 409/422 retry.
- 401/403/404 hata sınıfları.
- Anti-clobber.
- İki cihazın aynı günü farklı alanlarda değiştirmesi.
- Aynı alanın farklı zamanlarda değiştirilmesi.
- Receipt’in idempotent yazılması.

### Panel testleri

- 0 günlük veri.
- Eski migration snapshot’ı.
- Tüm yeni alanların dolu fixture’ı.
- Kırık/eksik projection.
- Stale projection.
- Büyük event listesi ve filtreleme.
- Input odaklı polling sırasında taslak korunması.
- Koyu tema, yüksek kontrast, reduced-motion, mobil 375px ve masaüstü.

### Ölçülecek metrikler

- `local_saved → remote_accepted` p50/p95,
- `remote_accepted → projection_ready` p50/p95,
- `projection_ready → panel_visible` p50/p95,
- stale projection sayısı,
- conflict/anti-clobber sayısı,
- projection parse/redaction hatası,
- panel polling error ve rate-limit oranı.

---

## 10. Geri alma ve veri güvenliği planı

- `latest.json` mevcut kaynak olarak korunur.
- Projection ve event dosyaları append-only veya sürümlü yazılır.
- Projection bozulursa son geçerli projection’a dönülür.
- Event log hiçbir zaman `latest.json` üzerine yazmaz.
- Yeni alanların migration’ı additive ve idempotent olur.
- Her rollout öncesi backup SHA’sı ve projection checksum’ı kaydedilir.
- Kullanıcı verisi zarar görmeden yalnız panel read-model’i geri alınabilir.

---

## 11. Başarı tanımı

Bu planın tamamlandığı kabul edilmesi için:

- panelde her kalıcı veri yolu görünürlük sınıfına sahip olmalı,
- “görünmüyor” ile “bilinçli redacted” ayrımı görünür olmalı,
- son local kayıt, uzak kabul, projection ve panel çekimi ayrı zamanlarla
  izlenebilmeli,
- son değişiklikler event sırasıyla izlenebilmeli,
- çakışma, anti-clobber ve retry sonuçları kullanıcıdan saklanmamalı,
- hassas veri sınırları korunmalı,
- gerçek gecikme ölçülmeden “anlık/canlı” iddiası kullanılmamalı,
- mevcut kullanıcı verisi ve `latest.json` yazım güvenliği bozulmamalıdır.

---

## 12. Açık kararlar

Uygulamaya geçmeden önce şu kararlar netleştirilmeli:

1. Projection GitHub Action ile mi, uygulama push zincirinde mi üretilecek?
2. Event log her değişiklikte mi, anlamlı feature değişikliklerinde mi yazılacak?
3. Tam zamanlı relay için ayrı servis yetkisi ve bütçesi var mı?
4. Terapi ayrıntıları panelde hangi consent seviyesinde açılacak?
5. GPS için yalnız kümelenmiş özet mi, geçici yetkili raw görünüm mü olacak?
6. Panelde tek kullanıcı mı kalacak, ileride çoklu gözlemci rolleri olacak mı?

Bu kararlar verilmeden yeni kart eklemek yerine önce P0 senkron makbuzu ve
coverage manifest uygulanmalıdır.
