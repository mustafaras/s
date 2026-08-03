# ÆON Paneli — PANEL-08 D1 Semantic Token ve Component Sözleşmesi

**Sequence:** `PANEL-010`
**Durum:** `ready_for_review`
**Tarih:** 2026-08-03
**Kapsam:** `panel.css`, `panel.js` ve panel shell cache-bust’i
**Önkoşul:** [PANEL-D0-IA-WIREFRAME.md](PANEL-D0-IA-WIREFRAME.md)

Bu belge D1’in canonical component API’sidir. Legacy `--s1`, `--s2`, `--green`
ve `b-ok` gibi class/token adları geriye dönük uyumluluk için tutulur; yeni
component çıktıları bunların yanında semantic `data-component`, `status-*`,
`source-*` ve `privacy-*` sınıflarını taşır.

## 1. Token sözleşmesi

### 1.1 Surfaces

| Token | Anlam | Kullanım |
|---|---|---|
| `--surface-background` | Sayfa zemini | `html`, `body`, page arka planı |
| `--surface-section` | Bölüm yüzeyi | nav, nested section, boş durum |
| `--surface-card` | Ana kart yüzeyi | bento ve feature kartları |
| `--surface-nested` | Kart içi yüzey | satır, input, event row |
| `--surface-audit` | Denetim yüzeyi | sync ribbon, detail drawer, audit vurgu |

### 1.2 Status

Her status bileşeni foreground/background/border üçlüsü kullanır. Status rengi
feature accent’ten bağımsızdır.

| Semantic token | Görsel dil | İkon anlamı |
|---|---|---|
| `--status-ok-*` | yeşil | `✓` |
| `--status-pending-*` | altın | `◷` |
| `--status-warning-*` | amber | `△` |
| `--status-danger-*` | kırmızı/pembe | `!` |
| `--status-muted-*` | nötr gri | `·` |

### 1.3 Source

Source badge’leri status sonucu iddia etmez; yalnız verinin nereden geldiğini
anlatır.

`source-user`, `source-derived`, `source-external`, `source-delivery` ve
`source-observer` sınıfları sırasıyla kullanıcı girdisi, uygulama hesabı, dış
kaynak, teslimat workflow’u ve gözlemci/panel üretimini belirtir.

### 1.4 Privacy

`privacy-redacted`, veri mevcutken ayrıntının bilinçli olarak gizlendiğini;
`privacy-restricted`, hassas yüzeyin daha güçlü bir sınırla kapalı olduğunu
belirtir. Hiçbir privacy class raw terapi/profil/GPS/media verisini DOM’a
getirmez.

### 1.5 Feature accents

Feature accent’leri yalnız içerik kimliği içindir: `--feature-quran`,
`--feature-faith`, `--feature-zikr`, `--feature-soul`, `--feature-journal`.
Bir feature accent hiçbir zaman `ok`, `pending`, `warning` veya `danger`
durumunun yerine kullanılamaz.

### 1.6 Accessibility/motion

`--focus-ring`, `--touch-min: 44px`, `--motion-fast`, `--motion-standard`,
`--motion-slow` ve `--ease-standard` ortak davranış token’larıdır. Reduced-motion
aktifken component transition/animation’ları kapanır; status metni ve ikonları
kalır.

## 2. Component API

### 2.1 `sync-ribbon`

```html
<section class="sync-ribbon" data-component="sync-ribbon"
         aria-label="Senkron sağlık özeti">
  <span class="badge status-badge status-ok b-ok"
        data-component="status-badge" data-status="ok">Senkron kabul edildi</span>
</section>
```

Zorunlu anlam: local, remote, projection ve panel poll zamanlarını; revision,
lag ve güvenli error/status bilgisini birlikte taşır. Receipt yoksa success
badge üretemez.

### 2.2 `status-badge`

```html
<span class="badge status-badge status-warning b-warn"
      data-component="status-badge" data-status="warning">Projection eski</span>
```

`data-status`: `ok | pending | warning | danger | muted`. Her varyant ikon +
metin taşır. Status yalnız renk ile anlatılmaz.

### 2.3 `source-badge` / `privacy-badge`

```html
<span class="p3-badge source-badge source-derived"
      data-component="source-badge" data-source-kind="derived">projection</span>
<span class="p3-badge privacy-badge privacy-restricted"
      data-component="privacy-badge" data-privacy-kind="restricted">GPS redacted</span>
```

Source ve privacy aynı badge’in semantic yerine geçmez; gerektiğinde ikisi
yan yana gösterilir.

### 2.4 `timeline-row`

```html
<button class="timeline-row event-log-row" data-component="timeline-row">
  <span class="event-log-seq">#42</span>
  <span class="event-log-main">…</span>
  <span class="status-badge …">Uzak kabul</span>
</button>
```

Button semantics, minimum 44px hedef, klavye focus ve event summary’nin
metadata-only kalması zorunludur.

### 2.5 `empty-state` / `error-state` / `stale-banner`

- `empty-state`: “kayıt yok”, “sync gelmedi”, “consent kapalı” ve `missing`
  ayrımını metinle belirtir.
- `error-state`: güvenli hata kodu, son başarılı zaman ve izinli retry action’ı
  taşır; başarı iddiası taşımaz.
- `stale-banner`: source/visible revision veya yaş bilgisini gösterir; eski
  veriyi güncel gibi boyamaz.

```html
<div class="empty empty-state" data-component="empty-state">Henüz kayıt yok</div>
<div class="error-state" data-component="error-state" role="alert">…</div>
<div class="sync-ribbon-note stale-banner" data-component="stale-banner">…</div>
```

### 2.6 `detail-drawer`

`detail-drawer` yalnız allowlist metadata gösterir: eventId, correlationId,
sequence, revision, source/privacy, zamanlar, güvenli özet ve whitelist hata
kodu. Ham payload, terapi/profile cevapları, GPS track, base64 media ve secret
gösterilmez.

```html
<div class="detail-drawer event-drawer" data-component="detail-drawer"
     role="dialog" aria-label="Event ayrıntısı">
  …
</div>
```

Mobilde tam ekran, geniş ekranda sağdan overlay’dir. Focus başlığa gider; `Esc`
ve kapat button’ı çalışır; ana scroll konumu korunur.

### 2.7 `density-toggle`

```html
<div class="density-toggle" data-component="density-toggle"
     role="group" aria-label="Görünüm yoğunluğu">
  <button aria-pressed="false">Hızlı</button>
  <button aria-pressed="true">Standart</button>
  <button aria-pressed="false">Audit</button>
</div>
```

`quick | standard | audit` state’i `data-density` üzerinde tutulur; desktop ve
mobile aynı anlamı taşır. Hızlı mod ilk 5 event’i, standart ilk 20’yi, audit
20/50/100 filtreleri ve audit drawer metadata’sını öne çıkarır.

## 3. Variant/state matrisi

| Component | Default | Loading | Empty | Stale | Error | Redacted |
|---|---|---|---|---|---|---|
| sync-ribbon | status + dört zaman | projection hazırlanıyor | receipt yok | yaş/revision görünür | error code + önceki görünüm | privacy nedeni |
| status-badge | ikon + metin | pending | muted | warning | danger | muted/privacy |
| source-badge | source kind | derived bekliyor | missing source | source zamanı eski | external/observer error | — |
| privacy-badge | redacted/restricted | — | consent kapalı | — | açık redaction nedeni |
| timeline-row | event summary | skeleton | empty-state | event yaşı | error-state | summary allowlist |
| detail-drawer | safe metadata | loading | missing | source revision | error code | raw veri yok |
| density-toggle | standard | — | — | — | — | — |

## 4. Desktop/mobile invariants

- 375–430px ve desktop aynı `data-component` ve `data-status` semantiğini
  kullanır; yalnız yerleşim değişir.
- Tüm interactive component’ler minimum 44×44px’tir.
- Status foreground/background/border token’ları feature accent token’larından
  ayrıdır.
- Source/privacy badge’leri metinle birlikte görünür; renk tek başına anlam
  taşımaz.
- `prefers-reduced-motion: reduce` altında animasyon yoktur; focus ve status
  görünürlüğü korunur.
- Türkçe uzun metinlerde yatay taşma oluşmaz; summary drawer’a yönlendirir.

## 5. D1 çıkış kanıtı

- `panel.css` semantic token katmanlarını ve 10 component’in ortak stillerini
  içerir.
- `panel.js` status/source/privacy/timeline/drawer/density component API’sini
  üretir.
- `panel.html` cache-bust’i `20260803b` ile CSS/JS değişikliğini alır.
- Legacy `b-*` class’ları korunur; yeni semantic class’lar aynı markup’ta
  bulunur, böylece mevcut fixture uyumluluğu sürer.
- CSS syntax, JS syntax, script-tag balance, headless panel fixture ve
  responsive/component markup kontrolleri yeşil olmalıdır.

**Sonraki güvenli adım:** Kullanıcı D1 review’ı; Prompt 09 / PANEL-011 D2
command center çalışması ayrı paired ledger sequence’i olarak uygulanmıştır.
