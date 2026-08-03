# PANEL-REVIZE: Bilgi Mimarisi ve Sevkıyat

> Hangi veri nerede, hangi derinlikte ve hangi gizlilik seviyesinde görünecek?

## 1. Veri sınıflandırması

Şeyma veri modeli, panel için üç sınıfa ayrılır:

| Sınıf | Tanım | Örnek | Panelde gösterim |
|-------|-------|-------|------------------|
| **A — Sinyal** | Gözlemcinin ilk bakışta görmesi gereken | Mod, SOS, uyku, senkron durumu | Hero / top-level kartlar |
| **B — Özet** | Trend ve karşılaştırma için | 7g uyku ortalaması, adım trendi, anomali listesi | Summary kartlar / grafikler |
| **C — Detay** | Belirli günün tam içeriği | Öğünler, notlar, terapi, konum segmentleri | Detay sekmesi / açılır panel |
| **D — Arşiv** | Zamanla biriken uzun listeler | Kütüphane, izleme, dinleme, alıntılar | Arşiv sekmesi / alt-sekmeler |
| **R — Redacted** | Observer'a gösterilmeyecek | Ham GPS, ham konum geçmişi, profil ham cevapları, gizli medya | Gizli veya anonimleştirilmiş özet |

## 2. Yeni sekmeli yapı

Mevcut 5 bölüm yerine, yeni panel şu ana sekmeleri kullanır:

### Sekme 1: Genel Bakış (Today)
- Bugünün sinyal kartları.
- 7 günlük trend strip'i.
- Hızlı notlar / terapi paylaşımları (varsa).
- Senkron durum rozeti (minimal).

### Sekme 2: Trendler & Uyarılar
- 7/14/30 günlük trend kartları.
- Anomali listesi.
- Eksik gün / kaynak uyarıları.
- Dönemsel özet (regl, ibadet, ruh hali dağılımı).

### Sekme 3: Gün Detayı
- Tarih seçici / takvim ısı haritası.
- Seçili günün kategorize edilmiş tüm girdileri.
- Ruh hali notu, öğünler, ibadet, hareket, terapi, içerik.

### Sekme 4: Arşivler
- Kütüphane (kitap okuma).
- İzleme (film/dizi).
- Dinleme (müzik/podcast).
- Alıntılar / öğrenme notları.

### Sekme 5: Sistem & Mesajlar
- Senkron detayları (audit modu burada).
- Observer inbox / outbox mesajları.
- Coverage / provenance durumu (opsiyonel).
- Ayarlar (density, tema, token refresh).

## 3. Veri-sekme eşleşmesi

| Veri kaynağı | Ana sekme | Alt bölüm | Not |
|--------------|-----------|-----------|-----|
| `data.days[date].mood.value` | Genel Bakış / Gün Detayı | Sinyal kartı / Ruh hali | Günün modu |
| `data.days[date].mood.note` | Gün Detayı | Ruh hali notu | Uzun metin |
| `data.days[date].sos` | Genel Bakış / Trendler | Anomali kartı / SOS listesi | Sayı + zaman |
| `data.days[date].sleep.duration` | Genel Bakış / Trendler | Uyku kartı / trend | Saat |
| `data.days[date].sleep.quality` | Gün Detayı | Uyku detayı | 1-5 |
| `data.days[date].steps` | Genel Bakış / Trendler | Adım kartı | Sayı |
| `data.days[date].water` | Genel Bakış | Su kartı | Bardak |
| `data.days[date].prayer` | Gün Detayı / Trendler | İbadet bölümü | Namaz/zikir/Kuran |
| `data.days[date].meal[]` | Gün Detayı | Öğün listesi | Makro özet |
| `data.days[date].symptom[]` | Gün Detayı / Trendler | Semptomlar / Anomali | Şiddet |
| `data.days[date].therapy` | Gün Detayı / Sistem | Terapi / Mesajlar | Paylaşım durumu |
| `data.days[date].location.track[]` | Gün Detayı | Konum rotası (özet) | Ham GPS redacted |
| `data.days[date].media.read` | Arşivler | Kütüphane | Listeleme |
| `data.days[date].media.watch` | Arşivler | İzleme | Listeleme |
| `data.days[date].media.listen` | Arşivler | Dinleme | Listeleme |
| `data.days[date].quotes` | Arşivler | Alıntılar | Listeleme |
| `data.settings` | Sistem | Ayarlar özeti | Secrets hariç |
| Senkron durumu | Sistem | Sync audit | Teknik detay |

## 4. Redaction ve privacy sevkıyatı

[panelCoverageManifest.js](panelCoverageManifest.js) mevcutta privacy kurallarını tanımlar. Yeni panelde bu kurallar korunur ve görsel olarak daha tutarlı uygulanır:

### 4.1 Konum verisi

- **Ham GPS koordinatları** (`location.raw`, `track[].lat/lng`) gösterilmez.
- **Yalnızca özet** gösterilir: "Ev / dışarıda / iş / toplu taşıma" gibi kategori veya harita üzerinde anonimleştirilmiş rota.
- `panelCoverageManifest.js` içindeki `redaction.location` kuralları aynen uygulanır.

### 4.2 Profil değerlendirmesi

- Ham 174 maddelik cevaplar gösterilmez.
- Yalnızca **tamamlanma oranı** ve **oturum özeti** gösterilir.
- `SeySync.mergeProfileAssessment` sonucu ile tutarlı kalınır.

### 4.3 Medya / fotoğraflar

- Ham medya URL'leri veya base64 içerikler gösterilmez.
- İşaretlenmiş medya varsa "görsel kaydı mevcut" ibaresi; detay sadece Şeyma uygulamasında.

### 4.4 Secrets

- `ghToken`, `openaiKey`, `syncUrl` gibi alanlar `sync.js` `sanitize()` ile de olduğu gibi asla veri deposuna veya panel görünümüne uğramaz.

## 5. Senkron durumunun sevkıyatı

Mevcut panelde senkron durumu çok yerde tekrarlanır. Yeni panelde tek bir yerde, sadeleştirilmiş:

| Durum | Kullanıcıya gösterilen | Yer |
|-------|------------------------|-----|
| Uzak veri güncel | Yeşil nokta + "Güncel" | Topbar |
| Yerel değişiklik bekliyor | Amber nokta + "Senkronize ediliyor" | Topbar |
| Çakışma / risk | Kırmızı nokta + "Dikkat gerekiyor" | Topbar + Sistem sekmesi |
| İlk yükleme / yok | Gri nokta + "Bağlanıyor" | Topbar |

Detaylar (revision, SHA, ETag, p50/p95) yalnızca **Sistem & Mesajlar** sekmesindeki "Senkron Detayları" çekmecesinde görünür.

## 6. Veri yok / bozuk senaryoları

| Senaryo | Kullanıcıya gösterilen | Davranış |
|---------|------------------------|----------|
| `data.latest.json` ulaşılamıyor | "Veri kaynağına ulaşılamıyor. Son bilinen veriler gösteriliyor." | Cache'deki son veriyi göster, tekrar dene |
| `data` objesi eksik alanlar | Kartlar eksik alan için "veri yok" durumu gösterir | `migrate()` çağrılmaz (panel read-only); defansif okuma |
| Coverage projection fallback | "Veri güvenliği katmanı aktif" (kısa) | Detay Sistem sekmesinde |
| Tarih seçili ama `days[date]` yok | "Bu tarih için kayıt yok" | Tarih seçici açık kalır |
| ETag 304 (değişim yok) | Hiçbir şey gösterme | Sessiz yenileme |

## 7. Bilgi mimarisinden çıkan kural seti

1. **Her veri birincil sekme sahibidir.** Aynı metrik birden fazla sekmede tekrarlanmaz.
2. **Detaylar isteğe bağlı açılır.** Başlangıç ekranında detay yığını yoktur.
3. **Redaction görsel olarak da uygulanır.** Sadece veri modelinde değil, panelde de ham veri gizlenir.
4. **Teknik durum tek noktada toplanır.** Sync/coverage/provenance ayrı ayrı şeritlerde değil, Sistem sekmesinde.
5. **Boş durumlar merkezi dille yönetilir.** Her kart kendi mesajını uydurmaz.

---

Önceki: [02-TASARIM-ILKELERI-VE-VIZYON.md](02-TASARIM-ILKELERI-VE-VIZYON.md)  
Sonraki: [04-KOMPONENT-KUTUPHANESI.md](04-KOMPONENT-KUTUPHANESI.md)
