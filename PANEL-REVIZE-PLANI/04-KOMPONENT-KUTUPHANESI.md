# PANEL-REVIZE: Komponent Kütüphanesi

> Yeni panelin kart, sekme, durum ve yardımcı bileşenleri.

## 1. Bileşen felsefesi

Yeni panel, mevcut monolitik `render()` yerine küçük, saf ve tekrar kullanılabilir bileşenler üzerine kurulur. Her bileşen:

- Tek bir sorumluluk taşır.
- Saf HTML string döner (mevcut vanilla JS/HTML/CSS yapısına uygun).
- Inline style kullanmaz; CSS class'larına bağlıdır.
- Mobil ve masaüstü için aynı class setiyle çalışır.

## 2. Sekme sistemi

### `Tabs`

Ana navigasyon: 5 sekme.

```html
<nav class="ae-tabs" role="tablist" aria-label="Ana bölümler">
  <button class="ae-tab is-active" role="tab" aria-selected="true">Genel Bakış</button>
  <button class="ae-tab" role="tab" aria-selected="false">Trendler & Uyarılar</button>
  <button class="ae-tab" role="tab" aria-selected="false">Gün Detayı</button>
  <button class="ae-tab" role="tab" aria-selected="false">Arşivler</button>
  <button class="ae-tab" role="tab" aria-selected="false">Sistem</button>
</nav>
```

Mobilde sekmeler yatay scroll olur. Aktif sekme altın çizgi ile belirtilir.

### `SubTabs`

Arşivler ve Sistem sekmeleri için iç sekme.

```html
<div class="ae-subtabs">
  <button class="ae-subtab is-active">Kütüphane</button>
  <button class="ae-subtab">İzleme</button>
  <button class="ae-subtab">Dinleme</button>
</div>
```

## 3. Kart kütüphanesi

### 3.1 HeroCard

Günlük sinyaller için. Tek sayı + etiket + mini trend.

```html
<article class="ae-card ae-card--hero">
  <header class="ae-card__eyebrow">Bugün</header>
  <div class="ae-card__metric">3</div>
  <div class="ae-card__label">SOS kaydı</div>
  <div class="ae-card__spark" aria-hidden="true"><!-- 7 günlük mini sparkline --></div>
</article>
```

### 3.2 SummaryCard

Trend ve karşılaştırma için. Orta büyüklükte metrik, trend yönü, kısa açıklama.

```html
<article class="ae-card ae-card--summary">
  <div class="ae-card__top">
    <span class="ae-card__title">Uyku ortalaması</span>
    <span class="ae-trend ae-trend--down">-0.8s</span>
  </div>
  <div class="ae-card__value">6s 12d</div>
  <div class="ae-card__caption">Son 7 gün; hedefin altında 3 gün.</div>
</article>
```

### 3.3 AnomalyCard

Öne çıkan uyarılar için. Renkli sol border, başlık, açıklama, aksiyon linki.

```html
<article class="ae-card ae-card--anomaly ae-card--warn">
  <div class="ae-card__stripe" aria-hidden="true"></div>
  <div class="ae-card__body">
    <div class="ae-card__title">Uyku düşüş trendi</div>
    <div class="ae-card__desc">Son 4 günde ortalama 5s 45d altına düştü.</div>
    <a class="ae-card__action" href="#" onclick="App.gotoDate('...')">İlgili güne git →</a>
  </div>
</article>
```

### 3.4 DetailSection

Gün detayı sekmesinde kategoriler için. Başlık + içerik listesi + boş durum.

```html
<section class="ae-detail-section">
  <h3 class="ae-detail-section__title">Öğünler</h3>
  <ul class="ae-detail-section__list">...items...</ul>
  <div class="ae-empty-state">Bu gün için öğün kaydı yok.</div>
</section>
```

### 3.5 ArchiveList

Arşiv sekmelerinde uzun listeler için. Minimal satırlar, pagination veya lazy scroll.

```html
<div class="ae-archive-list">
  <div class="ae-archive-row">
    <span class="ae-archive-row__title">Kitap Adı</span>
    <span class="ae-archive-row__meta">12 dk · 2026-07-20</span>
  </div>
</div>
```

### 3.6 StatusBadge

Tek senkron durum rozeti.

```html
<div class="ae-status" data-status="ok">
  <span class="ae-status__dot" aria-hidden="true"></span>
  <span class="ae-status__text">Güncel</span>
</div>
```

### 3.7 DatePicker

Tarih seçici ve takvim ısı haritası.

```html
<div class="ae-datebar">
  <button class="ae-btn--icon" onclick="App.prevDay()">←</button>
  <span class="ae-datebar__current">22 Temmuz 2026 Salı</span>
  <button class="ae-btn--icon" onclick="App.nextDay()">→</button>
  <button class="ae-btn--ghost" onclick="App.openCalendar()">Takvim</button>
</div>
```

### 3.8 MiniTrend

KPI kartlarındaki 7 günlük mini trend.

```html
<div class="ae-mini-trend" aria-label="Son 7 gün: 6, 7, 5, 6, 4, 5, 3">
  <svg></polyline></svg>
</div>
```

### 3.9 EmptyState

Merkezi boş durum.

```html
<div class="ae-empty">
  <div class="ae-empty__icon" aria-hidden="true">⊘</div>
  <div class="ae-empty__title">Henüz kayıt yok</div>
  <div class="ae-empty__desc">Bu pencerede henüz veri görünmüyor.</div>
</div>
```

## 4. Bileşen hiyerarşisi

```
App.render()              # sekmeye göre ana konteyner seçer
  ├─ renderToday()         # hero grid + mini trends + hızlı notlar
  ├─ renderTrends()        # summary cards + anomaly list
  ├─ renderDayDetail()     # datebar + detail sections
  ├─ renderArchives()      # subtabs + archive lists
  └─ renderSystem()        # status drawer + messages + audit

Her render fonksiyonu:
  ├─ SectionHeader         # bölüm başlığı
  ├─ Grid (auto-fit)       # kart grid'i
  └─ Card components       # hero/summary/anomaly/archive/status
```

## 5. Fonksiyon sözleşmeleri

Yeni `panel.js` içinde her bileşen fonksiyonu şu imzayı takip eder:

```js
/**
 * @param {Object} props
 * @param {string} props.title
 * @param {number|string} props.value
 * @param {string} [props.caption]
 * @param {string} [props.variant] // 'default' | 'hero' | 'summary' | 'anomaly' | 'archive'
 * @param {string} [props.status]  // 'ok' | 'warn' | 'risk' | 'neutral'
 * @returns {string} HTML string
 */
function AeCard(props) { ... }
```

Aynı şekilde:

```js
function AeTabs(tabs, activeIndex) { ... }
function AeStatusBadge(status, detail) { ... }
function AeMiniTrend(values, target) { ... }
function AeDetailSection(title, rows, emptyText) { ... }
function AeArchiveList(items, page, pageSize) { ... }
```

## 6. CSS class isimlendirme

BEM-benzeri, tek bir önek ile:

- `.ae-*` — tüm panel bileşenleri.
- `.ae-card` — kart temeli.
- `.ae-card--hero`, `.ae-card--summary`, `.ae-card--anomaly` — varyantlar.
- `.ae-tab`, `.ae-subtab`, `.ae-status`, `.ae-empty` — diğer bileşenler.

Mevcut `.command-*`, `.bento-*`, `.seg-*`, `.card-exp-*` gibi class'lar aşamalı olarak kaldırılır.

## 7. Etkileşim modeli

- Sekme değişimi: `App.setTab(tabId)` → `render()`.
- Tarih değiştirme: `App.prevDay()`, `App.nextDay()`, `App.gotoDate(iso)`.
- Kart detay açma: `App.expandCard(cardId)` yalnızca gerekli kartlarda.
- Mesaj gönderme: `App.sendObserverMessage()` Sistem sekmesinde.
- Density / tema: Sistem sekmesinde yer alır.

## 8. Komponent kütüphanesinden çıkan kurallar

1. **Tek `render()` yerine sekme başlığı render fonksiyonları.**
2. **Her kart bir `AeCard` varyantıdır.**
3. **Inline style yok.** Tüm görsel tercih class veya CSS variable üzerinden.
4. **Bileşenler saf HTML string döner.** Framework yok.
5. **ARIA rolleri yeni bileşenlere gömülür.**

---

Önceki: [03-BILGI-MIMARISI-VE-SEVKIYAT.md](03-BILGI-MIMARISI-VE-SEVKIYAT.md)  
Sonraki: [05-ESTETIK-DESIGN-SISTEMI.md](05-ESTETIK-DESIGN-SISTEMI.md)
