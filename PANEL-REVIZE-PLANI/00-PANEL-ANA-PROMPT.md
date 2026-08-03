# 00-PANEL-ANA-PROMPT: ÆON Observer Dashboard Premium Revizyonu

> Bu dosya, PANEL-REVIZE-PLANI/ klasöründeki yeniden tasarımı **tek bir ana prompt** olarak koordine eder.  
> Hedef: mevcut [panel.html](panel.html) / [panel.js](panel.js) / [panel.css](panel.css) yerine, premium, pro, veri-kaybetmeyen ve sekme/tab bazlı yeni bir ÆON paneli inşa etmek.

---

## 1. GİRİŞ: Bu prompt ne yapar?

Bu prompt, çalışan AI agent'a:

1. Projenin **tam bağlamını** verir.
2. Yeni panelin **mimari, estetik, veri ve güvenlik prensiplerini** özetler.
3. **Çok parçalı görev listesini** (`panel-revize-tasks.json`) takip ettirir.
4. **Anti-amnesia disiplini** ile her tur sonunda `panel-revize-state.json` güncellemesini zorunlu kılar.
5. **Kabul kriterlerini** (`panel-revize-acceptance-schema.json`) ve **test planını** takip ettirir.

Agent, bu promptu okuduktan sonra:
- `panel-revize-manifest.json` içindeki kısıtlara uyar.
- `panel-revize-tasks.json` içinden **bir sonraki yapılmamış görevi** seçer.
- İlgili plan dokümanını (01-07) açar.
- Kodu yazar/test eder.
- `panel-revize-state.json` günceller.
- Kullanıcıya kısa rapor verir.

---

## 2. PROJE BAĞLAMI (özet)

- **Şeyma 🦩:** Private, single-user, Turkish mood/wellness tracking web app.
- **ÆON:** Şeyma'nın güvendiği ikinci göz için observer dashboard.
- **Deployment:** Static GitHub Pages, repo root'tan deploy edilir.
- **Stack:** Vanilla JS/HTML/CSS, no bundler, no backend, no npm.
- **Veri deposu:** `mustafaras/seyma-data` private repo, GitHub Contents API.
- **Mevcut panel:** ~3400 satırlık `panel.js` IIFE, tek sayfada 60+ kart, teknik durum şeritleri çakışıyor.
- **Hedef:** Sekmeli, premium, az ama anlamlı kartlarla aynı veriyi kaçırmadan sunmak.

Tam detaylar için:
- [00-UYGULAMA-YAPISI-ANALIZI.md](00-UYGULAMA-YAPISI-ANALIZI.md)
- [01-MEVCUT-SORUNLAR-ANALIZI.md](01-MEVCUT-SORUNLAR-ANALIZI.md)
- [02-TASARIM-ILKELERI-VE-VIZYON.md](02-TASARIM-ILKELERI-VE-VIZYON.md)

---

## 3. KISITLAR VE KIRMIZI ÇİZGİLER

Bu kurallar ihlal edilemez:

1. **Hiçbir fonksiyon çalışmaz etkilenmez.** Eski panel canlı kalır; yeni panel `panel-v2.*` dosyalarıyla inşa edilir.
2. **Hiçbir veri kaybolmaz.** Her gösterilen metrik, mevcut paneldeki bir veriye karşılık gelir.
3. **Secrets asla görünmez.** `ghToken`, `openaiKey`, `syncUrl` panel DOM'unda veya yeni dosyalarda yazılmaz.
4. **Ham GPS, profil cevapları, terapi metinleri, medya redacted kalır.** [panelCoverageManifest.js](panelCoverageManifest.js) korunur.
5. **Testler headless Node fixture'larıyla yapılır.** Browser açmadan, ağ çağrısı yapmadan doğrulanır.
6. **Cache-bump her deploy'da yapılır.** `index.html` `?v=` query string güncellenir.
7. **Türkçe, sıcak ama profesyonel ton.** "Sevgili Günışığı" dili app.js'de; panelde ise saygılı, sakin, premium ton kullanılır.
8. **Mobil öncelikli tasarım.** Kaynak ekran 375px-460px; geniş ekran genişlemesidir.

---

## 4. ÇALIŞMA PRENSİPLERİ (anti-amnesia + süreç)

### 4.1 Her tur aynı döngüyü takip eder

```
1. panel-revize-state.json oku.
2. Bir sonraki hazır görevi seç (dependsOn tamamlanmış, blocked=false).
3. İlgili plan dokümanını (01-07) ve gerekiyorsa kodu incele.
4. Görevi uygula (küçük, odaklı değişiklik).
5. Syntax check + ilgili headless testi çalıştır.
6. Ekran görüntüsü / markup dump istenmiyorsa sadece metin rapor ver.
7. panel-revize-state.json güncelle.
8. Kullanıcıya kısa özet sun.
```

### 4.2 State.json güncelleme zorunludur

Her tur sonunda `panel-revize-state.json` şunları içermelidir:

- `lastUpdated`: ISO zaman damgası.
- `currentTaskId`: İşlenen görev ID.
- `completedTasks`: Tamamlanan ID listesi.
- `blockers`: Varsa `{taskId, reason}` dizisi.
- `evidence`: Test sonuçları, komut çıktıları, dosya referansları.
- `nextTaskId`: Sonraki önerilen görev.
- `notes`: Serbest alan.

### 4.3 Görev seçimi kuralları

- Önce Faz 0 (hazırlık) tamamlanır.
- Aynı faz içinde bağımsız görevler paralel yapılabilir; bağımlı görevler sıralı.
- Bir görev `blockers` listesindeyse, önce bloke kaldırılmalı.
- Hiçbir görev "gelecekte hallederim" bırakılamaz; ya tamamlanır ya da blocker olarak kaydedilir.

### 4.4 Test zorunluluğu

Her fazın çıktısı için aşağıdaki testlerden en az biri çalıştırılmalı:

```bash
node --check panel-v2.js
node tests/test_panel_v2_render.js      # varsa
node tests/test_panel_v2_trends.js      # varsa
node tests/test_panel_v2_redaction.js   # varsa
node tests/test_panel_v2_system.js     # varsa
```

Eşlik eden fixture henüz yoksa, o görev kapsamında yazılmalıdır.

---

## 5. GÖREV HARİTASI (özet)

Detaylı görevler `panel-revize-tasks.json` içindedir. İşte fazların özeti:

### Faz 0 — Hazırlık
- 0.1 `panel-v2.html` shell.
- 0.2 `panel-v2.css` design system skeleton.
- 0.3 `panel-v2.js` IIFE skeleton + module loader pattern.
- 0.4 Veri projection adapter'ını `panelCoverageManifest.js` üzerinden bağla.
- 0.5 Anti-amnesia state.json ve task registry'yi kontrol et.

### Faz 1 — Sekme iskeleti + Topbar
- 1.1 5 ana sekme (Today, Trends, Day Detail, Archives, System).
- 1.2 Topbar: marka, tek status badge, refresh/logout.
- 1.3 Sekme geçiş mekanizması ve ARIA.
- 1.4 Her sekme için placeholder içerik.

### Faz 2 — Genel Bakış (Today)
- 2.1 Hero grid: mod, uyku, SOS, adımlar.
- 2.2 7 günlük mini trend strip.
- 2.3 Hızlı notlar / terapi paylaşımı kartı.
- 2.4 Tarih seçici (görünüm only).

### Faz 3 — Trendler & Uyarılar
- 3.1 Summary cards: uyku, adım, su, sos yoğunluğu, eksik gün.
- 3.2 Anomali listesi ve kuralları.
- 3.3 Anomaliden gün detayına atlama.

### Faz 4 — Gün Detayı
- 4.1 Tarih seçici / takvim ısı haritası.
- 4.2 Kategorize detay bölümleri.
- 4.3 Konum özet (redacted).
- 4.4 Boş durumlar.

### Faz 5 — Arşivler
- 5.1 Alt sekmeler: Kütüphane, İzleme, Dinleme, Alıntılar.
- 5.2 Liste performansı (pagination / lazy scroll).
- 5.3 Boş arşiv durumları.

### Faz 6 — Sistem & Mesajlar
- 6.1 Tek status badge detayı.
- 6.2 Senkron audit çekmecesi.
- 6.3 Observer inbox/outbox mesajlaşma.
- 6.4 Ayarlar: density, tema, token alanı.

### Faz 7 — Premium Polish
- 7.1 Design system tutarlılık kontrolü.
- 7.2 Animasyon/performans optimizasyonu.
- 7.3 Mobil ve masaüstü grid doğrulaması.

### Faz 8 — Test ve Kabul
- 8.1 Yeni headless fixture'ları yaz.
- 8.2 Veri doğruluğu karşılaştırması.
- 8.3 Accessibility kontrolü.

### Faz 9 — Geçiş
- 9.1 `panel-v2.*` → `panel.*` rename veya yedekleme.
- 9.2 `index.html` cache-bump.
- 9.3 `sw.js` cache listesi güncelleme (gerekirse).
- 9.4 Final commit + deploy onayı.

---

## 6. KOD KALİTESİ KURALLARI

### 6.1 Vanilla JS / IIFE

- Yeni dosyalar da `panel.js` gibi IIFE olur.
- Global namespace kirliliği yaratılmaz; yalnızca `window.AeonV2` gibi tek bir global export kullanılır.
- Framework (React/Vue/Next) kullanılmaz.

### 6.2 HTML string üretimi

- `render()` büyük monolitik string yerine sekme başlığı fonksiyonları çağırır.
- Her kart `AeCard(props)` gibi saf fonksiyonlarla üretilir.
- Inline `style="..."` kullanılmaz; class ve CSS variable kullanılır.

### 6.3 CSS class isimlendirme

- `.ae-*` öneki zorunlu.
- BEM-benzeri: `.ae-card`, `.ae-card--hero`, `.ae-card__title`.
- Mevcut `.command-*`, `.bento-*`, `.seg-*` gibi class'lar yeni dosyalarda kullanılmaz.

### 6.4 Veri erişimi

- Tüm veri okumaları defansif:
  ```js
  var days = (data && data.days) ? data.days : {};
  var rec = days[date] || {};
  var mood = (rec.mood && rec.mood.value) ? rec.mood.value : null;
  ```
- `migrate()` panel-v2.js'te çalıştırılmaz; sadece okunan veri normalize edilir.

---

## 7. VERİ GÜVENLİĞİ VE PRIVACY KURALLARI

1. **Panel read-only'dir.** Yazma yalnızca `data/observer-inbox.json` ve `data/aeon-outbox.json`.
2. **Secrets:** `ghToken`, `openaiKey`, `syncUrl`, `auth`, `token` asla DOM'da olmaz.
3. **Ham GPS:** `location.raw`, `track[].lat/lng`, `locationHistory[]` gösterilmez; yalnızca özet/kategori.
4. **Profil:** Ham 174 madde cevapları gösterilmez; % tamamlanma ve oturum özeti.
5. **Terapi notları:** `therapy.thoughts[].text`, `therapy.share.note` redacted; varlık/sayı gösterilir.
6. **Medya:** Ham URL/base64 görünmez; "kayıt var" ibaresi.
7. **Token alanı:** Kullanıcı tarafından doldurulur; agent otomatik doldurmaz.

---

## 8. RAPOR FORMATI (her tur sonunda)

Agent her tur sonunda şu formatta kısa bir rapor verir:

```markdown
## Tur Özeti

- **İşlenen görev:** <görev id> — <görev başlığı>
- **Değiştirilen dosyalar:** <dosya listesi>
- **Testler:** <komutlar ve sonuçlar>
- **Blokeler:** <varsa>
- **Sonraki görev:** <id>
- **Notlar:** <kısa not>
```

Örnek:

```markdown
## Tur Özeti

- **İşlenen görev:** 1.1 — 5 ana sekme iskeleti
- **Değiştirilen dosyalar:** `panel-v2.js`, `panel-v2.css`
- **Testler:** `node --check panel-v2.js` ✅
- **Blokeler:** Yok
- **Sonraki görev:** 1.2
- **Notlar:** Sekme ARIA rolleri eklendi; mobilde yatay scroll çalışıyor.
```

---

## 9. ÇIKIŞ KRİTERLERİ (revizyon tamamlandığında)

Aşağıdaki tüm maddeler sağlanmadan geçiş (Faz 9) yapılmaz:

- [ ] `panel-v2.html`, `panel-v2.js`, `panel-v2.css` tam ve syntax hatasız.
- [ ] Tüm 5 sekme render edilebilir.
- [ ] Mevcut paneldeki her veri, yeni panelde en az bir yerde gösterilir (redaction hariç).
- [ ] Ham GPS, profil cevapları, terapi metinleri, medya görünmez.
- [ ] `node tests/test_panel_v2_*.js` tümü PASS.
- [ ] `index.html` cache-bump yapılmış.
- [ ] Eski panel dosyaları yedeklenmiş veya geçiş yapılmış.
- [ ] `panel-revize-state.json` `status: "completed"` içeriyor.

---

## 10. BAŞLANGIÇ TALİMATI

Eğer bu prompt yeni bir oturumda okunuyorsa:

1. `panel-revize-state.json` dosyasını oku.
2. Eğer yoksa, `panel-revize-state-example.json` şablonunu kullanarak oluştur.
3. `panel-revize-manifest.json` ve `panel-revize-tasks.json` ile uyumlu olup olmadığını doğrula.
4. `completedTasks` listesinden nerede kalındığını anla.
5. Bir sonraki görevi seç ve uygula.

---

## 11. İLGİLİ DOSYALAR

### Plan ve koordinasyon
- [README.md](README.md)
- [00-UYGULAMA-YAPISI-ANALIZI.md](00-UYGULAMA-YAPISI-ANALIZI.md)
- [01-MEVCUT-SORUNLAR-ANALIZI.md](01-MEVCUT-SORUNLAR-ANALIZI.md)
- [02-TASARIM-ILKELERI-VE-VIZYON.md](02-TASARIM-ILKELERI-VE-VIZYON.md)
- [03-BILGI-MIMARISI-VE-SEVKIYAT.md](03-BILGI-MIMARISI-VE-SEVKIYAT.md)
- [04-KOMPONENT-KUTUPHANESI.md](04-KOMPONENT-KUTUPHANESI.md)
- [05-ESTETIK-DESIGN-SISTEMI.md](05-ESTETIK-DESIGN-SISTEMI.md)
- [06-VERI-GUVENLIGI-VE-HATA-DURUMLARI.md](06-VERI-GUVENLIGI-VE-HATA-DURUMLARI.md)
- [07-UYGULAMA-FAZLARI-VE-KABUL-KAPISI.md](07-UYGULAMA-FAZLARI-VE-KABUL-KAPISI.md)

### Anti-amnesia ve süreç yönetimi
- [panel-revize-manifest.json](panel-revize-manifest.json)
- [panel-revize-tasks.json](panel-revize-tasks.json)
- [panel-revize-state-schema.json](panel-revize-state-schema.json)
- [panel-revize-state-example.json](panel-revize-state-example.json)
- [panel-revize-state.json](panel-revize-state.json)
- [panel-revize-acceptance-schema.json](panel-revize-acceptance-schema.json)

### Mevcut kod (değiştirilecek referanslar)
- [panel.html](../../panel.html)
- [panel.js](../../panel.js)
- [panel.css](../../panel.css)
- [panelCoverageManifest.js](../../panelCoverageManifest.js)
- [index.html](../../index.html)
- [AGENTS.md](../../AGENTS.md)
- [CLAUDE.md](../../CLAUDE.md)

---

Son güncelleme: 2026-08-03  
Versiyon: panel-revize-v1.0
