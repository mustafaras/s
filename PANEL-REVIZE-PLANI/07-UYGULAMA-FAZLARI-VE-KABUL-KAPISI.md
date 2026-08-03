# PANEL-REVIZE: Uygulama Fazları ve Kabul Kapısı

> Yeni panelin kodlanması, test edilmesi ve canlıya alınması için aşamalı plan.

## 1. Genel yaklaşım

Yeni panel mevcut `panel.html` / `panel.js` / `panel.css` üzerine **yeni dosyalar** olarak inşa edilebilir; böylece mevcut panel canlı kalır ve aşamalı geçiş yapılır.

Önerilen dosya yapısı:

```
panel.html              # mevcut panel (geçiş aşamasında korunur)
panel-v2.html           # yeni panel shell
panel-v2.js             # yeni panel runtime
panel-v2.css            # yeni panel design system
panelCoverageManifest.js # ortak, değişmez
```

Geçiş tamamlandığında `panel.html` yeniden adlandırılabilir veya `panel-v2.html` `panel.html` yapılabilir.

## 2. Fazlar

### Faz 0 — Hazırlık ve izolasyon

- [ ] Yeni `panel-v2.html`, `panel-v2.css`, `panel-v2.js` iskelet dosyaları oluştur.
- [ ] Yeni CSS design system'i ([05-ESTETIK-DESIGN-SISTEMI.md](05-ESTETIK-DESIGN-SISTEMI.md)) temel class'larıyla başlat.
- [ ] Veri okuma katmanını `panelCoverageManifest.js` üzerinden izole et.
- [ ] `index.html` cache-bump henüz **yapılmaz**.

**Çıktı:** Boş ama iskeleti tam yeni panel dosyaları.

### Faz 1 — Sekme iskeleti ve topbar

- [ ] `render()` içinde 5 sekme arasında geçiş.
- [ ] Topbar: marka, tek status badge, yenile/çıkış butonları.
- [ ] `Genel Bakış` sekmesinde basit "veri yok" placeholder.

**Test:**
- `node --check panel-v2.js`
- Sekme geçişleri headless fixture ile kontrol edilir.

### Faz 2 — Genel Bakış sekmesi

- [ ] 4 hero kart: mod, uyku, SOS, adımlar (veya günün sinyalleri).
- [ ] 7 günlük mini trend strip.
- [ ] Hızlı notlar / terapi paylaşımı (varsa) L1 kartı.
- [ ] Tarih seçici (sadece gösterim; detay henüz açılmaz).

**Test:**
- Seeded data ile hero kart değerleri doğru mu?
- Boş data ile `ae-empty` gösteriliyor mu?

### Faz 3 — Trendler & Uyarılar sekmesi

- [ ] Summary cards: uyku ortalaması, adım ortalaması, su, sos yoğunluğu, eksik gün.
- [ ] Anomaly listesi: son 14/30 gündeki uyarılar.
- [ ] Anomaliye tıklayınca Gün Detayı sekmesine ve ilgili güne atlama.

**Test:**
- Anomali kuralları (uyku düşüş, SOS artış, MOH ≥ 10, eksik gün) doğru çalışıyor mu?
- Masaüstü ve mobil grid hatasız mı?

### Faz 4 — Gün Detayı sekmesi

- [ ] Tarih seçici / takvim ısı haritası (opsiyonel).
- [ ] Kategorize detay bölümleri: ruh hali, öğün, ibadet, hareket, terapi, içerik.
- [ ] Boş durumlar merkezi `ae-empty` ile.
- [ ] Konum özet (ham GPS redacted).

**Test:**
- Her kategori eksik/boş data ile çökmez.
- Konum segmentleri ham koordinat göstermez.

### Faz 5 — Arşivler sekmesi

- [ ] Alt sekmeler: Kütüphane, İzleme, Dinleme, Alıntılar.
- [ ] Uzun listeler için pagination veya lazy scroll.
- [ ] Minimal satır tasarımı.

**Test:**
- 100+ kayıt listesi performanslı render ediliyor mu?
- Boş arşiv durumu doğru mu?

### Faz 6 — Sistem & Mesajlar sekmesi

- [ ] Tek status badge detayı.
- [ ] Senkron detayları çekmecesi: revision, SHA, ETag, p50/p95.
- [ ] Observer inbox / outbox mesajlaşma.
- [ ] Ayarlar: density, tema, token alanı.

**Test:**
- `panelCoverageManifest.js` fallback durumları sessizce işleniyor mu?
- Token alanı DOM'a yazılırken gizli mi?

### Faz 7 — Tasarım sonuçlandırma ve premium polish

- [ ] Tüm kartlar design system'e uygun.
- [ ] Animasyonlar optimize edilir.
- [ ] Mobil testler tamamlanır.
- [ ] `panel-v2.css` finalleştirilir.

### Faz 8 — Test ve kabul kapısı

- [ ] Tüm `tests/test_panel_p*.js` fixture'ları yeni panel için genişletilir veya yeni `tests/test_panel_v2_*.js` dosyaları yazılır.
- [ ] `node --check panel-v2.js`
- [ ] Headless render testleri: light/dark, boş data, seeded data, anomali, redaction.
- [ ] Mevcut panelle karşılaştırmalı veri doğruluğu kontrolü.

### Faz 9 — Geçiş

- [ ] `panel-v2.html` → `panel.html` (veya mevcut panel yedeğe alınır).
- [ ] `panel-v2.js` → `panel.js`, `panel-v2.css` → `panel.css`.
- [ ] `index.html` cache-bump `?v=` güncellenir.
- [ ] Git commit: "Faz PANEL-REVIZE: yeni premium observer paneli".

## 3. Kabul kriterleri (Acceptance Criteria)

Her fazın tamamlanması için aşağıdaki kriterler geçer:

### AC-1 — Veri kaybı yok

- [ ] Yeni panelde gösterilen her veri, mevcut panelde de gösterilebiliyordu (redaction hariç).
- [ ] Hiçbir gün kaydı veya metrik "unutulmamış".

### AC-2 — Redaction korunur

- [ ] Ham GPS koordinatları görünmez.
- [ ] Profil ham cevapları görünmez.
- [ ] Secrets (token, key) hiçbir DOM elementinde yok.

### AC-3 — Performans

- [ ] İlk render ≤ 300ms (mobil CPU profili).
- [ ] Sekme geçişleri ≤ 150ms.
- [ ] 100+ günlük arşiv listesi takılmaz.

### AC-4 — Erişilebilirlik

- [ ] Sekmeler `role="tablist"` / `role="tab"` ile.
- [ ] Durum rozeti `aria-live` ile güncellenir.
- [ ] Tüm interaktif elementler klavye ile erişilebilir.

### AC-5 — Görsel tutarlılık

- [ ] Tüm kartlar design system class'larını kullanır; inline style yok.
- [ ] Renkler 05-ESTETIK-DESIGN-SISTEMI.md ile sınırlı setten.
- [ ] Mobil 375px'de çalışır; 768px+ masaüstü grid çalışır.

### AC-6 — Senkron durumu

- [ ] Tek status badge yeterli.
- [ ] Detaylı audit Sistem sekmesindedir.
- [ ] ETag/304 durumları sessizce işlenir; kullanıcıya gereksiz bilgi vermez.

## 4. Test planı

### 4.1 Syntax check

```bash
node --check panel-v2.js
node --check panelCoverageManifest.js
```

### 4.2 Headless fixtures

```bash
node tests/test_panel_v2_render.js      # genel render, sekmeler, boş data
node tests/test_panel_v2_trends.js      # anomaly detection, trend kartları
node tests/test_panel_v2_redaction.js   # privacy / redaction kuralları
node tests/test_panel_v2_system.js      # sync status, token gizliliği
```

### 4.3 Veri doğruluğu

- Mevcut `data/latest.json` yapısı ile yeni panelde hesaplanan KPI'lar, mevcut paneldekiyle eşleşmeli.
- Eşleşme farkı varsa, farkın nedeni açıkça belgelenmeli (örneğin redaction nedeniyle).

## 5. Cache-bump ve deploy

- [ ] `index.html` içinde `panel-v2.css` ve `panel-v2.js` için cache-bump query string eklenir.
- [ ] Geçiş tamamlandığında `index.html` `panel.html` linki güncellenir ve `?v=` yeniden bump edilir.
- [ ] `sw.js` cache listesi güncellenirse revize edilir.

## 6. Rollback planı

- [ ] Eski `panel.html`, `panel.js`, `panel.css` yedekleri `panel-v1-backup/` altında saklanır.
- [ ] Eğer yeni panelde kritik veri kaybı veya çökme tespit edilirse, eski panel dosyaları geri yüklenir.
- [ ] Cache-bump tekrar yapılarak eski sürümün PWA cache'den temizlenmesi sağlanır.

## 7. Uygulama fazlarından çıkan özet

1. **Yeni dosyalarla başla**, mevcut paneli bozma.
2. **Aşamalı inşa:** iskelet → sekmeler → kartlar → detaylar → arşivler → sistem.
3. **Her fazda test ve acceptance criteria** geç.
4. **Geçiş sonrası** cache-bump ve yedekleme planı hazır olsun.

---

Önceki: [06-VERI-GUVENLIGI-VE-HATA-DURUMLARI.md](06-VERI-GUVENLIGI-VE-HATA-DURUMLARI.md)  
Dönüş: [README.md](README.md)
