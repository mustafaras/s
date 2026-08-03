# PANEL-REVIZE: Veri Güvenliği ve Hata Durumları

> Yeni panelde privacy, redaction, bozuk/eksik veri ve fail-safe davranışları.

## 1. Genel güvenlik ilkesi

ÆON paneli **read-only gözlem arayüzüdür**. Yazma yetkisi yalnızca:

- `data/observer-inbox.json`
- `data/aeon-outbox.json`

ile sınırlıdır. Kullanıcının Şeyma verisini asla değiştiremez.

Mevcut kurallar [AGENTS.md](AGENTS.md) ve [CLAUDE.md](CLAUDE.md) içinde açıktır; bu doküman yeni panelin bu kuralları nasıl koruyup görselleştireceğini tanımlar.

## 2. Redaction katmanı

[panelCoverageManifest.js](panelCoverageManifest.js) zaten bir redaction manifestosu tanımlar. Yeni panel bu manifestoyu kullanır ve ek görsel kurallar uygular.

### 2.1 Redaction sınıfları

| Sınıf | Alanlar | Paneldeki gösterim |
|-------|---------|---------------------|
| `R1 — Koordinat ham verisi** | `location.raw`, `track[].lat`, `track[].lng`, `locationHistory[]` | Harita veya kategori özet; koordinat yok |
| `R2 — Medya ham içerik** | `media.photos[]`, `audio.base64` | "Medya kaydı var" ibaresi; önizleme yok |
| `R3 — Profil ham cevaplar** | `profileAssessment.sessions[].answers` | Tamamlanma oranı ve oturum özeti |
| `R4 — Hassas notlar** | `mood.note` içinde özel işaretlenmiş alanlar | Normal metin; ancak uygulama içi özel etiketler gizlenir |
| `R5 — Token / secrets** | `settings.ghToken`, `openaiKey`, `syncUrl` | Hiçbir zaman görünmez |

### 2.2 Konum örneği

```js
// Eski panelde ham gösterim:
"lat: 41.0082, lng: 28.9784, accuracy: 12m"

// Yeni panelde:
"Bugün 3 konum segmenti: ev → dışarıda → ev"
```

Harita üzerinde rotalar, anonimleştirilmiş poligonlarla gösterilir; pin etiketleri genel kategoriler içerir.

### 2.3 Profil değerlendirmesi örneği

```js
// Eski:
"Madde 47: 3 / Madde 48: 5 ..."

// Yeni:
"İlk profil değerlendirmesi %64 tamamlandı. Son oturum: 2026-07-20."
```

## 3. Fail-safe veri durumları

### 3.1 Veri kaynağı ulaşılamıyor

| Durum | Gösterim | Aksiyon |
|-------|----------|---------|
| GitHub API 4xx/5xx veya network yok | Topbar'da gri/amber status + "Son bilinen veriler gösteriliyor" | Cache'deki son `data` ile devam et; sessiz retry |
| Token geçersiz | Status kırmızı + "Erişim gerekiyor" | Sistem sekmesinde token yenileme alanı (kullanıcı tarafından doldurulur) |

### 3.2 Bozuk veya eksik `data` objesi

Yeni panel her okumada defansif davranır:

```js
const days = data && data.days ? data.days : {};
const today = days[isoToday] || {};
const mood = today.mood || { value: null, note: '' };
```

Hiçbir kart, eksik alt alan nedeniyle çökmez. `migrate()` panel tarafında çalıştırılmaz; `data` zaten Şeyma uygulamasında migrate edilmiş olarak gelir.

### 3.3 Coverage projection fallback

[panelCoverageManifest.js](panelCoverageManifest.js) fallback senaryolarında:

- Kullanıcıya kısa: "Veri güvenliği katmanı aktif."
- Detay: Sistem sekmesindeki audit çekmecesinde.
- Hiçbir zaman teknik SHA/revision/fallback mesajları ana ekranda görünmez.

### 3.4 Eski veri yapısı (legacy)

Panel, `data` içinde eski alan adları görürse yeni alanlara map eder. Örneğin `data.days[date].sosCount` yerine `data.days[date].sos` kullanılır; map fonksiyonu `normalizeDayRecord()` içinde toplanır.

## 4. Hata durumları ve kullanıcı mesajları

| Senaryo | Mesaj | Yeri |
|---------|-------|------|
| `data/latest.json` yok veya boş | "Henüz panel için senkronize veri yok." | Genel Bakış ortada |
| `days` objesi yok | "Günlük kayıtlara ulaşılamıyor." | Genel Bakış |
| Seçili gün yok | "Bu tarih için kayıt bulunamadı." | Gün Detayı |
| Konum verisi redacted | "Konum özeti gizlilik kurallarına göre gösteriliyor." | Gün Detayı konum bölümü |
| Profil değerlendirmesi yok | "Profil değerlendirmesi henüz başlamamış." | Trendler kartı |
| Event log boş | "Son aktivite kaydı yok." | Sistem sekmesi |
| Outbox gönderilemedi | "Mesaj gönderilemedi. Tekrar denenecek." | Sistem sekmesi |

## 5. Token yönetimi

- Panel, `localStorage` üzerinde kendi anahtarını (`aeon-gh-token`) saklar; Şeyma uygulamasının anahtarına erişmez.
- Token alanı Sistem sekmesinde yer alır.
- Token asla DOM dışında loglanmaz veya veri reposuna yazılmaz.
- Token yenileme, kullanıcı tarafından elle yapılır; agent tarafından otomatik doldurulmaz.

## 6. Gözlemci mesajları

- `observer-inbox.json` / `aeon-outbox.json` dışında hiçbir yazma yapılmaz.
- Mesajlar panelde Sistem sekmesinde listelenir.
- Hassas kullanıcı verisi içeren mesajlar uygulama tarafında redact edilebilir; panelde yalnızca güvenli metin gösterilir.

## 7. Veri güvenliğinden çıkan kurallar

1. **Panel read-only kalır.** Yazma yalnızca inbox/outbox.
2. **Ham GPS, medya, profil cevapları redacted gösterilir.**
3. **Secrets hiçbir zaman panelde görünmez.**
4. **Eksik/bozuk veri çökertmez; defansif okuma uygulanır.**
5. **Teknik fallback mesajları ana ekrandan uzak tutulur.**
6. **Token alanı kullanıcı kontrolündedir; otomatik doldurma yok.**

---

Önceki: [05-ESTETIK-DESIGN-SISTEMI.md](05-ESTETIK-DESIGN-SISTEMI.md)  
Sonraki: [07-UYGULAMA-FAZLARI-VE-KABUL-KAPISI.md](07-UYGULAMA-FAZLARI-VE-KABUL-KAPISI.md)
