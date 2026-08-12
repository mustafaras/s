# ÆON Panel-v2 — Bilgi Akışı & Kontrol Takip Sistemi

> **Hedef:** Panel-v2'nin bilgi akışı, senkronizasyon durumu, olay günlüğü ve kontrol mekanizmalarını profesyonel bir "komuta merkezi" seviyesine yükseltmek.
> **Tarih:** 2026-08-04
> **Durum:** ✅ Uygulandı — Faz A–F tamamlandı; Prompt 28–35 ve 40 QA kayıtları
> `PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/LEDGER.md` içindedir (2026-08-12).

---

## İçindekiler

1. [Mevcut Durum Analizi](#1-mevcut-durum-analizi)
2. [Hedef Mimari](#2-hedef-mimari)
3. [Bileşen Detayları](#3-bileşen-detayları)
4. [Sistem Sayfası Yeniden Tasarımı](#4-sistem-sayfası-yeniden-tasarımı)
5. [Uygulama Fazları](#5-uygulama-fazları)
6. [Kabul Kriterleri](#6-kabul-kriterleri)

---

## 1. Mevcut Durum Analizi

### 1.1. Güçlü Yanlar (Korunacak)

- ✅ ETag tabanlı koşullu istek (304 yanıtı ile bant genişliği tasarrufu)
- ✅ Token yönetimi (localStorage, maskeleme, temizleme)
- ✅ Hata durumu kodları (unauthorized, not_found, rate_limited)
- ✅ `panelCoverageManifest.js`'de zengin event/audit/projection altyapısı
- ✅ `data.eventLog.events[]` ve `data/events/<date>.json` ile olay kaydı
- ✅ `syncStatus` nesnesi (status, etag, revision, lastSyncedAt)

### 1.2. Tarihsel zayıf yanlar (2026-08-04 baseline)

> Bu tablo uygulama öncesi baseline’dır; güncel durum için Faz A–F kapanış
> kaydı ve `.anti-amnesia/CURRENT-STATE.md` esas alınır.

| # | Sorun | Etki |
|---|-------|------|
| 1 | **Otomatik polling yok** | Veri sadece ↻ butonuna basınca güncellenir |
| 2 | **Olay günlüğü görüntüleyicisi yok** | `data.eventLog.events` ve `data/events/*.json` asla gösterilmez |
| 3 | **p50/p95 metrikleri boş** | UI'da alanlar var ama hiç doldurulmaz |
| 4 | **Veri tazelik göstergesi yok** | "Son güncelleme: X dakika önce" gibi bir ibare yok |
| 5 | **Senkron sağlık paneli yok** | Push başarı/başarısızlık oranı, yeniden deneme sayısı gösterilmez |
| 6 | **Bildirim yaşam döngüsü yok** | Bildirimlerin oluşturulma → iletilme → okunma süreci görünmez |
| 7 | **Sıra denetimi yok** | Olayların sıra dışı/eksik/çift kaydedilmesi tespit edilmez |
| 8 | **Revizyon geçmişi yok** | Hangi revizyonda neyin değiştiği görülmez |
| 9 | **API durumu yok** | GitHub API limiti, token sağlığı gösterilmez |
| 10 | **Tanı araçları yok** | Test bağlantısı, zorla yeniden senkron, veri doğrulama yok |

---

## 2. Hedef Mimari

### 2.1. Veri Akışı (Hedef)

```
┌─────────────────────────────────────────────────────────────┐
│                    ÆON Control Tower                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  GitHub (mustafaras/seyma-data)                             │
│    ├─ data/latest.json ──────► fetchLatest() ──► appData   │
│    ├─ data/events/<date>.json ──► fetchEvents() ──► events │
│    └─ data/observer-inbox.json ◄── pushMessage()           │
│                                                             │
│  Polling Engine (setInterval)                               │
│    ├─ Her 60sn: ETag ile latest.json kontrolü               │
│    ├─ Her 300sn: events/<date>.json kontrolü                │
│    └─ Değişiklik varsa → render()                           │
│                                                             │
│  Telemetry                                                  │
│    ├─ İstek süresi → p50/p95 latency                       │
│    ├─ Push başarı oranı → health score                     │
│    └─ Hata sayısı → error rate                             │
│                                                             │
│  Event Log Engine                                           │
│    ├─ data.eventLog.events[] → son 200 olay                 │
│    ├─ data/events/<date>.json → günlük dosyalar            │
│    └─ panelCoverageManifest.js → normalizasyon + denetim   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2. Bileşen Mimarisi

```
syncStatus (genişletilmiş)
├── status: idle|saving|accepted|error|...
├── lastErrorCode: string|null
├── snapshotRevision: string|null
├── sourceUpdatedAt: string|null
├── etag: string|null
├── lastSyncedAt: string|null
├── notModifiedCount: number
├── p50LatencyMs: number|null       ← YENİ: doldurulacak
├── p95LatencyMs: number|null       ← YENİ: doldurulacak
├── lastFetchDurationMs: number|null ← YENİ
├── totalFetchCount: number          ← YENİ
├── errorCount: number              ← YENİ
├── consecutiveErrors: number        ← YENİ
├── lastSuccessAt: string|null       ← YENİ
├── dataAgeMinutes: number           ← YENİ: hesaplanan
├── apiRateLimitRemaining: number|null ← YENİ
├── apiRateLimitReset: string|null   ← YENİ
└── pollingIntervalMs: number        ← YENİ: varsayılan 60000

eventViewer (yeni)
├── events: event[]                  ← data.eventLog.events
├── filters: { section, operation, dateRange }
├── sortOrder: asc|desc
├── page: number
├── pageSize: 20|50|100
└── selectedEvent: event|null       ← detay drawer'ı için

notificationLifecycle (yeni)
├── notifications: notification[]
├── selectedNotif: notification|null
└── timeline: stage[]               ← oluşturma → iletme → okuma
```

---

## 3. Bileşen Detayları

### 3.1. Otomatik Polling Sistemi

```javascript
// Yeni: polling motoru
var pollingState = {
  intervalId: null,
  intervalMs: 60000,        // 60 saniye
  eventIntervalMs: 300000,  // 5 dakika
  isPaused: false,
  lastEventFetch: null
};

function startPolling() {
  if (pollingState.intervalId) return;
  pollingState.intervalId = setInterval(function() {
    if (!pollingState.isPaused && ui.panelToken) {
      var start = Date.now();
      load().then(function() {
        var duration = Date.now() - start;
        syncStatus.lastFetchDurationMs = duration;
        updateLatencyTelemetry(duration);
      }).catch(function() {
        syncStatus.consecutiveErrors = (syncStatus.consecutiveErrors || 0) + 1;
      });
    }
  }, pollingState.intervalMs);
}

function updateLatencyTelemetry(durationMs) {
  // Basit p50/p95 hesaplama (son 20 istek)
  var latencies = syncStatus._latencyWindow || [];
  latencies.push(durationMs);
  if (latencies.length > 20) latencies.shift();
  syncStatus._latencyWindow = latencies;
  var sorted = latencies.slice().sort(function(a,b) { return a-b; });
  syncStatus.p50LatencyMs = sorted[Math.floor(sorted.length * 0.5)] || null;
  syncStatus.p95LatencyMs = sorted[Math.floor(sorted.length * 0.95)] || null;
}
```

### 3.2. Olay Günlüğü Görüntüleyicisi

```
┌────────────────────────────────────────────────────────────┐
│  📋 Olay Günlüğü                           [20] [50] [100] │
│                                                             │
│  Filtre: [Tümü ▼] [İşlem ▼] [Tarih aralığı ▼]             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ⏱ 12:34:56  📝 Günlük kaydedildi    ✓ rev-abc123   │   │
│  │ ⏱ 12:30:00  🌤 Mod güncellendi       ✓ rev-abc122   │   │
│  │ ⏱ 12:15:00  🕌 Namaz kaydedildi      ✓ rev-abc121   │   │
│  │ ⏱ 11:45:00  🔄 Senkronize edildi     ✓ rev-abc120   │   │
│  │ ⏱ 11:30:00  💭 Düşünce kaydedildi    ✓ rev-abc119   │   │
│  │ ...                                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ◀ 1 / 10 ▶                                                │
│                                                             │
│  [Seçili Olay Detayı]                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Olay ID:     evt_abc123                             │   │
│  │ Korelasyon:  cor_xyz789                             │   │
│  │ Sıra:        1.542                                  │   │
│  │ Bölüm:       wellness › mood                        │   │
│  │ İşlem:       update                                 │   │
│  │ Zaman:       12:34:56                               │   │
│  │ Revizyon:    rev-abc123                             │   │
│  │ Kaynak:      iPhone 15 Pro                          │   │
│  │ Gizlilik:    public                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### 3.3. Senkron Sağlık Paneli

```
┌────────────────────────────────────────────────────────────┐
│  📊 Senkron Sağlığı                                        │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Durum    │ │ Gecikme  │ │ Hata     │ │ Veri     │     │
│  │ ✅       │ │ p50 230ms│ │ Oranı    │ │ Tazeliği │     │
│  │ Sağlıklı │ │ p95 890ms│ │ %2.1     │ │ 3dk önce │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ⏱ Son 24 Saat — İstek Süresi (ms)                   │   │
│  │  ██░░████░░██░░████░░██░░████░░██░░                  │   │
│  │  09:00    12:00    15:00    18:00    21:00           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ API Durumu                                           │   │
│  │ Kalan limit:  4.850 / 5.000                          │   │
│  │ Sıfırlanma:  12:34                                  │   │
│  │ Token:       github_pat_••••••••••••••••            │   │
│  │ Son başarı:  12:30:45                                │   │
│  │ Art arda hata: 0                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### 3.4. Bildirim Yaşam Döngüsü

```
┌────────────────────────────────────────────────────────────┐
│  💬 Mesaj Detayı                                           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Başlık:  "Nasılsın?"                                │   │
│  │ Gönderen: Observer                                   │   │
│  │                                                      │   │
│  │ ⏱ Zaman Çizelgesi                                   │   │
│  │                                                      │   │
│  │ ● 12:30 — Oluşturuldu                               │   │
│  │ ● 12:30:05 — Gönderildi                             │   │
│  │ ● 12:30:10 — Cihaza ulaştı                          │   │
│  │ ● 12:35:00 — Okundu                                 │   │
│  │ ● 12:35:30 — Yanıtlandı                             │   │
│  │                                                      │   │
│  │ Toplam süre: 5dk 30sn                               │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### 3.5. Sıra Denetimi & Revizyon Geçmişi

```
┌────────────────────────────────────────────────────────────┐
│  🔍 Sıra Denetimi                                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Durum: ⚠️ Uyarı                                     │   │
│  │                                                      │   │
│  │ Tespit edilen sorunlar:                              │   │
│  │ • 2 olay sıra dışı (seq 1.540 → 1.543)              │   │
│  │ • 1 eksik olay (seq 1.538 bulunamadı)               │   │
│  │ • 0 çift kayıt                                      │   │
│  │                                                      │   │
│  │ Son 50 olayda hata oranı: %4                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📜 Revizyon Geçmişi                                 │   │
│  │                                                      │   │
│  │ rev-def456  12:35  Günlük eklendi                   │   │
│  │ rev-def455  12:30  Mod güncellendi                  │   │
│  │ rev-def454  12:15  Senkronize edildi                │   │
│  │ rev-def453  11:45  Terapi kaydedildi                │   │
│  │ ...                                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Sistem Sayfası Yeniden Tasarımı

### 4.1. Yeni Sekme Yapısı

| Sekme | Mevcut | Hedef |
|-------|--------|-------|
| **Durum** | Statik tablo + oturum bilgisi | Canlı gösterge paneli + sağlık metrikleri |
| **Olaylar** | — | **YENİ**: Olay günlüğü görüntüleyicisi + filtreler + detay drawer'ı |
| **Denetim** | Coverage istatistikleri | Coverage + sıra denetimi + revizyon geçmişi |
| **Mesajlar** | Bildirim listesi + token girişi | Bildirim yaşam döngüsü + gönderme + timeline |
| **Ayarlar** | Yoğunluk + tema + çıkış | Tüm ayarlar + polling yapılandırması + tanı araçları |

### 4.2. Durum Sekmesi (Yeni Tasarım)

```
┌────────────────────────────────────────────────────────────┐
│  📊 Kontrol Paneli                                         │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ ✅       │ │ ⏱ 230ms  │ │ 📦 142   │ │ 🔄 3dk   │     │
│  │ Sağlıklı │ │ Gecikme  │ │ Gün      │ │ Tazelik  │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ⏱ İstek Geçmişi (son 24 saat)                       │   │
│  │  ██░░████░░██░░████░░██░░████░░██░░                  │   │
│  │  0ms    500ms   1000ms                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ API      │ │ Token    │ │ Hata     │ │ Polling  │     │
│  │ 4.850/5k │ │ ✅ Geçerli│ │ %2.1     │ │ 60sn     │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📱 Uygulama Oturumu                                 │   │
│  │ Başlangıç: 15.01.2026  │  Son açılış: 04.08.2026   │   │
│  │ Açılış: 08:30          │  Son kayıt: 12:00         │   │
│  │ Toplam gün: 202                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### 4.3. Olaylar Sekmesi (YENİ)

```
┌────────────────────────────────────────────────────────────┐
│  📋 Olay Günlüğü                                           │
│                                                             │
│  Filtreler:                                                 │
│  [Tüm bölümler ▼] [Tüm işlemler ▼] [Son 24 saat ▼]        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ⏱ 12:34  📝 Günlük         create   ✓ rev-abc123   │   │
│  │ ⏱ 12:30  🌤 Mod            update   ✓ rev-abc122   │   │
│  │ ⏱ 12:15  🕌 Namaz          create   ✓ rev-abc121   │   │
│  │ ⏱ 11:45  🔄 Senkron        accepted ✓ rev-abc120   │   │
│  │ ⏱ 11:30  💭 Düşünce        create   ✓ rev-abc119   │   │
│  │ ⏱ 11:00  🍽 Beslenme       update   ✓ rev-abc118   │   │
│  │ ⏱ 10:45  👟 Hareket        update   ✓ rev-abc117   │   │
│  │ ⏱ 10:30  🧘 Pratik         create   ✓ rev-abc116   │   │
│  │ ⏱ 10:15  💧 Su             update   ✓ rev-abc115   │   │
│  │ ⏱ 10:00  🔄 Senkron        accepted ✓ rev-abc114   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ◀ 1 / 20 ▶  [20] [50] [100]                               │
│                                                             │
│  ┌─ Seçili Olay Detayı ─────────────────────────────────┐   │
│  │ 📝 Günlük kaydedildi                                 │   │
│  │                                                      │   │
│  │ Olay ID:     evt_a1b2c3d4                            │   │
│  │ Korelasyon:  cor_x1y2z3                              │   │
│  │ Sıra:        1.542                                    │   │
│  │ Bölüm:       wellness › journal                      │   │
│  │ İşlem:       create                                  │   │
│  │ Zaman:       12:34:56                                │   │
│  │ Revizyon:    rev-abc123                              │   │
│  │ Kaynak:      iPhone 15 Pro                           │   │
│  │ Gizlilik:    public                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### 4.4. Denetim Sekmesi (Geliştirilmiş)

```
┌────────────────────────────────────────────────────────────┐
│  🔍 Denetim                                                │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Coverage Durumu                                      │   │
│  │                                                      │   │
│  │ Full alan:     142                                   │   │
│  │ Summary alan:  23                                    │   │
│  │ Redacted:      8                                     │   │
│  │ Eksik:         2                                     │   │
│  │                                                      │   │
│  │ [Coverage Raporu] [Redaksiyon Detayı]                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 🔄 Sıra Denetimi                                    │   │
│  │                                                      │   │
│  │ Durum: ⚠️ Uyarı — 2 sıra dışı olay, 1 eksik        │   │
│  │                                                      │   │
│  │ • Sıra dışı: seq 1.540 → 1.543 (2 atlama)          │   │
│  │ • Eksik: seq 1.538 (bulunamadı)                     │   │
│  │ • Çift: yok                                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📜 Revizyon Geçmişi (son 10)                        │   │
│  │                                                      │   │
│  │ rev-def456  12:35  Günlük eklendi                  │   │
│  │ rev-def455  12:30  Mod güncellendi                  │   │
│  │ rev-def454  12:15  Senkronize edildi                │   │
│  │ ...                                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### 4.5. Mesajlar Sekmesi (Geliştirilmiş)

```
┌────────────────────────────────────────────────────────────┐
│  💬 Mesajlar                                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Gelen Kutusu (3)                                     │   │
│  │                                                      │   │
│  │ ● Observer  "Nasılsın?"          12:30  ○ Okunmadı │   │
│  │ ● Observer  "Bugün nasıl geçti?"  10:15  ✓ Okundu  │   │
│  │ ● Observer  "Spor yaptın mı?"    09:00  ✓ Okundu  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Seçili Mesaj Detayı ───────────────────────────────┐   │
│  │ Başlık: "Nasılsın?"                                 │   │
│  │ Gönderen: Observer → Sen                            │   │
│  │                                                      │   │
│  │ ⏱ Zaman Çizelgesi                                   │   │
│  │ ● 12:30:00 — Oluşturuldu                           │   │
│  │ ● 12:30:05 — Gönderildi                            │   │
│  │ ● 12:30:10 — Cihaza ulaştı                         │   │
│  │ ● 12:35:00 — Okundu                                │   │
│  │                                                      │   │
│  │ Toplam: 5dk                                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ✉️ Yeni Mesaj                                       │   │
│  │ ┌────────────────────────────────────────────────┐   │   │
│  │ │ Mesajınızı yazın...                           │   │   │
│  │ └────────────────────────────────────────────────┘   │   │
│  │ [Gönder]                                             │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### 4.6. Ayarlar Sekmesi (Geliştirilmiş)

```
┌────────────────────────────────────────────────────────────┐
│  ⚙️ Ayarlar                                               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Görünüm                                              │   │
│  │                                                      │   │
│  │ Yoğunluk:  [Sıkı] [Rahat] [Geniş]                   │   │
│  │ Tema:      [🌙 Koyu] [☀️ Aydınlık]                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Senkronizasyon                                      │   │
│  │                                                      │   │
│  │ Polling aralığı:  [30sn] [60sn] [5dk] [Kapalı]     │   │
│  │ Otomatik yenileme: [✅ Açık]                        │   │
│  │                                                      │   │
│  │ [🔄 Şimdi senkronize et]                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Tanı Araçları                                       │   │
│  │                                                      │   │
│  │ [🔗 Test Bağlantısı]  [📋 Veri Doğrulama]           │   │
│  │ [🗑️ Önbellek Temizle]  [📤 Zorla Senkron]          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Hakkında                                             │   │
│  │                                                      │   │
│  │ ÆON Observer v2.0                                   │   │
│  │ Panel-v2 · 2026                                     │   │
│  │ [Oturumu sonlandır]                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Uygulama Fazları

> **Kapanış notu:** Polling, olay günlüğü, senkron sağlığı, bildirim yaşam
> döngüsü, sıra/revizyon denetimi ve ayarlar/tanı yüzeyleri uygulandı. Güncel
> test yolları `tests/panel-v2/` altındadır; eski handoff’lar tarihsel dosya
> yollarını korur.

### Faz A: Polling & Telemetry Altyapısı (Tahmini: 1 oturum)

- [x] `syncStatus` nesnesini genişlet (p50, p95, errorCount, consecutiveErrors, apiRateLimit)
- [x] Otomatik polling motorunu ekle (`setInterval` tabanlı)
- [x] İstek süresi telemetrisini ekle (p50/p95 hesaplama)
- [x] Veri tazelik göstergesini ekle ("X dk önce")
- [x] API rate limit takibini ekle (GitHub `x-ratelimit-remaining` header'ı)
- [x] Polling'i token varlığına göre otomatik başlat/durdur
- [x] Mevcut testlerin geçtiğini doğrula

### Faz B: Olay Günlüğü Görüntüleyicisi (Tahmini: 2 oturum)

- [x] `data.eventLog.events`'i okuyup render eden fonksiyon
- [x] Filtreleme (bölüm, işlem, tarih aralığı)
- [x] Sayfalama (20/50/100)
- [x] Olay detay drawer'ı (eventId, correlationId, sequence, path, revision)
- [x] `panelCoverageManifest.js`'deki `normalizeEvent` ve `parseEventLog`'u kullan
- [x] Sistem sekmesine "Olaylar" sub-tab'ı ekle
- [x] Test ekle

### Faz C: Senkron Sağlık Paneli (Tahmini: 1 oturum)

- [x] Sağlık metrik kartları (durum, gecikme, hata oranı, tazelik)
- [x] İstek geçmişi mini grafiği (son 24 saat)
- [x] API durumu kartı (limit, token, son başarı)
- [x] Hata geçmişi listesi
- [x] Test ekle

### Faz D: Bildirim Yaşam Döngüsü (Tahmini: 1 oturum)

- [x] `panelCoverageManifest.js`'deki `notificationEventProjection`'u kullan
- [x] Bildirim zaman çizelgesi görselleştirmesi
- [x] Okunma/iletilme durumu göstergeleri
- [x] Mesaj gönderme arayüzü (observer-inbox.json'a yazma)
- [x] Test ekle

### Faz E: Sıra Denetimi & Revizyon Geçmişi (Tahmini: 1 oturum)

- [x] `panelCoverageManifest.js`'deki `eventSequenceAudit`'i kullan
- [x] Sıra denetimi kartı (sıra dışı, eksik, çift olay tespiti)
- [x] Revizyon geçmişi listesi
- [x] Denetim sekmesini güncelle
- [x] Test ekle

### Faz F: Ayarlar & Tanı Araçları (Tahmini: 1 oturum)

- [x] Polling yapılandırması (aralık, aç/kapa)
- [x] Tanı araçları (test bağlantısı, veri doğrulama, önbellek temizleme)
- [x] Hakkında bölümü
- [x] Ayarlar sekmesini güncelle
- [x] Test ekle

---

## 6. Kabul Kriterleri

> Kaynak ve headless/deploy kanıtı tamamlandı. Kullanıcı cihazı gözlemi bu
> listenin dışında ayrı bir kanıt seviyesidir.

### 6.1. Fonksiyonel

- [x] Veri otomatik olarak her 60 saniyede güncelleniyor
- [x] Olay günlüğü filtrelenebiliyor ve sayfalanabiliyor
- [x] Olay detayları görüntülenebiliyor
- [x] Senkron sağlık metrikleri canlı gösteriliyor
- [x] Bildirim yaşam döngüsü görselleştiriliyor
- [x] Sıra denetimi çalışıyor
- [x] Revizyon geçmişi gösteriliyor
- [x] Tanı araçları çalışıyor

### 6.2. Performans

- [x] Polling 304 yanıtında render tetiklemiyor
- [x] Olay günlüğü 200+ olayda akıcı
- [x] p50/p95 hesaplaması 20 istekte kararlı
- [x] Bellek kullanımı mevcut seviyeyi geçmiyor

### 6.3. Test

- [x] Tüm mevcut testler geçiyor
- [x] Yeni polling testleri
- [x] Yeni olay günlüğü testleri
- [x] Yeni sağlık paneli testleri
- [x] Yeni bildirim testleri
- [x] Yeni denetim testleri

---

## Ek: Mevcut vs Hedef Karşılaştırması

| Özellik | Mevcut | Hedef |
|---------|--------|-------|
| Polling | Manuel (↻ butonu) | Otomatik (60sn) + yapılandırılabilir |
| Gecikme metrikleri | p50/p95 alanları boş | Gerçek zamanlı hesaplanan |
| Olay günlüğü | Yok | Filtrelenebilir, sayfalanabilir, detaylı |
| Senkron sağlığı | Sadece durum metni | 4 metrik kartı + grafik + API durumu |
| Bildirim takibi | Sadece liste | Yaşam döngüsü + zaman çizelgesi |
| Sıra denetimi | Yok | Otomatik tespit + rapor |
| Revizyon geçmişi | Sadece hash | Tarih + işlem listesi |
| Tanı araçları | Yok | Test bağlantısı, doğrulama, temizleme |
| Ayarlar | 3 seçenek | 10+ seçenek + yapılandırma |
