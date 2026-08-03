# PANEL-REVIZE: Uygulama Yapısı Analizi

> ÆON panel revizyonu için mevcut uygulamanın veri, senkronizasyon ve panel mimarisinin net görünümü.

## 1. Proje özeti

| Öğe | Değer |
|-----|-------|
| Proje adı | Şeyma 🦩 + ÆON Observer Dashboard |
| Deployment | Statik GitHub Pages, repo root'tan doğrudan |
| Stack | Vanilla JS/HTML/CSS, tek IIFE'ler, no bundler, no backend |
| Mobil hedef | ≤460px viewport, iOS Safari / Chrome |
| Veri deposu | `mustafaras/seyma-data` private repo, GitHub Contents API |
| Senkronizasyon | `sync.js` IIFE: debounced push, anti-clobber, event log merge |
| Testler | `node` headless fixtures, `.claude/skills/run-seyma/` harness'leri |

## 2. Kök veri modeli (`data`)

`data`, `app.js` içinde tek global mutable objedir. `localStorage` key `seyma-reset-v1` altında saklanır; her açılışta `migrate(d)` çalıştırılır.

| Alan | Tür | Amaç | Panelde gösterim |
|------|-----|------|------------------|
| `version` | number | Şema versiyonu | Meta |
| `startDate` | string (ISO date) | İlk kayıt günü | Kullanıcı gün sayısı |
| `lastOpenedDate` | string | Son açılış günü | Tazelik rozeti |
| `lastOpenedAt` | string (ISO) | Son açılış zamanı | Tazelik rozeti |
| `savedAt` | string (ISO) | Son kayıt zamanı | Senkron durumu |
| `settings` | object | Kullanıcı tercihleri, secrets, hedefler | Ayarlar özeti (secrets hariç) |
| `days` | object `{date: DayRecord}` | Günlük kayıtlar | Panelin ana verisi |
| `location` | object `{lat,lng,...}` | Son bilinen konum | Redacted özet |
| `locationHistory` | array | Ham GPS kayıtları | Redacted / gizli |
| `locationLastTs` | string | Son konum işleme zamanı | Timestamp |
| `library` | object | Kitap arşivi | Arşiv |
| `watchlist` | object | Film/dizi arşivi | Arşiv |
| `music` | object | Müzik/podcast arşivi | Arşiv |
| `soulArchive` | object | Pilates/ney/binicilik arşivi | Arşiv |
| `zikr` | object | Zikirmatik yolculukları | İbadet/İlham |
| `quranJourney` | object | Kur'an yolculuk istekleri | İbadet/İlham |
| `saygi` | object | 100 öncü koleksiyonu | İbadet/İlham |
| `profileAssessment` | object | Bilimsel profil değerlendirmesi | % tamamlanma, consent |
| `scientificProfile` | object | Profil raporu özeti | Terapi/Profilim |
| `dailyPhoto` | object | Günün fotoğrafı metadata | Görsel kart |
| `roomContentHistory` | object | Terapi odası içerik geçmişi | Terapi |
| `locNudge` | object | Konum nudge audit | Konum durumu |
| `eventLog` | object | Append-only event log | Sistem/Audit |
| `notifications` | object | Bildirim yaşam döngüsü | Sistem |
| `aeon` | object | ÆON outbox / shown ids | Sistem |
| `labResults` | object | Tahlil sonuçları | Sağlık/Vücut |
| `cycle` | object | Regl/döngü verisi | Döngü tahmini |
| `vacation` | object | Tatil modu ayarları | Tatil rozeti |
| `syncReceipt` | object | Son senkron kabul makbuzu | Senkron durum |

## 3. Günlük kayıt (`data.days[YYYY-MM-DD]`)

Her gün aşağıdaki alanları taşır. Panelin yeni tasarımı bu alanları kategorilere ayırır.

| Kategori | Alanlar | Tipik içerik |
|----------|---------|--------------|
| **Ruh hali** | `mood`, `mood.note`, `journal`, `note`, `intention`, `gratitude`, `feelings` | Mod etiketi, günlük notu, niyet, şükran |
| **Beden** | `sleep`, `water`, `symptoms`, `health`, `meds`, `cravingSOSCount`, `sos` | Uyku süresi/kalitesi, su, semptomlar, adım, ilaç |
| **Beslenme** | `meals`, `mealItems` | Öğün metinleri, makro detay |
| **Hareket** | `walk`, `health.steps`, `movement.track` | Adım, yürüyüş, GPS segmentleri |
| **İbadet** | `prayer`, `saygi`, `zikr` | Namaz vakitleri, günün öncüsü, zikir sayaç |
| **Terapi** | `therapy.thoughts`, `therapy.decision`, `therapy.share`, `therapy.breath`, `therapy.dailyWin`, `therapy.selfCompassion`, `therapy.firstStep` | CBT kayıtları, güvenli paylaşım |
| **İçerik** | `reading`, `watching`, `listening`, `quotes` | Kitap/dizi/müzik girişleri ve alıntılar |
| **Zihin-Beden** | `soulActivities` | Pilates, ney, binicilik |
| **Diğer** | `media`, `crisis`, `dailyWin` | Medya, kriz kaydı, günün kazanımı |

## 4. Senkronizasyon akışı

```
app.js save()
  ↓
localStorage.setItem('seyma-reset-v1', JSON.stringify(data))
  ↓
window.SeySync.schedule(data)
  ↓
sync.js sanitize(data)  ← secrets çıkarılır
  ↓
GitHub Contents API PUT data/latest.json
  ↓
 Günlük snapshot: data/gunluk/<date>.json
  ↓
 syncReceipt güncellenir
```

### Önemli mekanizmalar

- **Anti-clobber (Guard 2):** Yerel gün sayısı uzaktan azsa push durur.
- **Sanitize:** `ghToken`, `openaiKey`, `syncUrl`, `auth`, `token`, vb. silinir.
- **Merge:** `mergeProfileAssessment`, `mergeZikr`, event log union.
- **Polling:** ETag/304 ile conditional GET; p50/p95 latency takibi.
- **Fallback:** Coverage projection, eski latest summary kullanılabilir.

## 5. Mevcut panel mimarisi

| Katman | Dosya | Sorumluluk |
|--------|-------|------------|
| Shell | [panel.html](panel.html) | CSS/JS yükleri, Leaflet harita, boş başlangıç mesajı |
| Runtime | [panel.js](panel.js) | ~3400 satırlık IIFE; render, olaylar, API çağrıları |
| Styles | [panel.css](panel.css) | Dark/gold theme, bento grid, kart/ribbon/drawer stilleri |
| Adapter | [panelCoverageManifest.js](panelCoverageManifest.js) | Redaction, projection, coverage, event log normalize |

### panel.js içindeki ana fonksiyon grupları

- `canonicalStatusP()` / `syncRibbonHTMLP()` / `coverageRibbonHTMLP()` — teknik durum şeritleri.
- `commandCenterHeroesHTMLP()` / `commandRiskHTMLP()` — üst hero/risk kartları.
- `d4ModuleDescriptorsP()` / `d4ModuleAtlasHTMLP()` / `d4ModuleDrawerHTMLP()` — modül atlası.
- `rootModulesCardHTMLP()` — kök modül coverage kartı.
- `p4ProvenanceCardHTMLP()` — terapi/profil/bildirim provenance kartı.
- `eventLogCardHTMLP()` — event log kartı.
- `aeonThreadCardHTMLP()` / `lunaThreadCardHTMLP()` — mesajlaşma kartları.
- `render()` — tüm UI'ı tek HTML string olarak üretir.

### Mevcut panelin 5 bölümü

1. Bugün Özeti
2. Ruh Hali & Enerji
3. Hareket & Konum
4. Vücut & Tahlil
5. İçgörü & Risk

Bunlar yeni tasarımda **5 ana sekme**ye dönüşür.

## 6. Test altyapısı

| Grup | Fixture'lar | Amaç |
|------|-------------|------|
| Sync | `test_faz10_sync.js`, `test_panel_p2_sync.js` | Anti-clobber, merge, event log senkronu |
| Panel | `test_faz11_panel.js`, `test_panel_p*.js` | Panel helper, projection, provenance, root modules, polling, event log |
| Quran | `test_quran_*.js` | Kur'an katalog, taşıma, merge, delivery, a11y |
| Harness | `.claude/skills/run-seyma/*.mjs` | app.js render, zikirmatik, state boundary |

Yeni panel için benzer headless fixture'lar oluşturulmalıdır.

## 7. Yeni panel için çıkarımlar

### 7.1 Veri yönetimi

- `data` objesi read-only tüketilir; panel sadece `data/observer-inbox.json` / `data/aeon-outbox.json` yazar.
- `panelCoverageManifest.js` zaten redaction yapar; yeni panel yalnızca projection çıktısını görselleştirir.
- `migrate()` panelde çalıştırılmaz; `data` zaten migrate edilmiş gelir.

### 7.2 Bileşen ayrımı

- Mevcut `render()` monolitik yapısı kırılmalı.
- Her sekme kendi render fonksiyonuna sahip olmalı.
- Kartlar `AeCard` varyantları ile üretilmeli.

### 7.3 Premium his

- `styles.css` ve `panel.css` zaten dark/gold token'lara sahip.
- Yeni `panel-v2.css` bu token'ları daraltıp disiplinli hale getirecek.
- Inline style kullanımı kaldırılacak.

### 7.4 Veri güvenliği

- Ham GPS, profil cevapları, terapi notları, medya asla görünmez.
- Token alanı kullanıcı tarafından doldurulur; agent otomatik doldurmaz.
- `sanitize()` ve `panelCoverageManifest.js` kuralları korunur.

## 8. Anti-amnesia ve koordinasyon dosyaları

| Dosya | Görev |
|-------|-------|
| [PANEL-REVIZE-PLANI/00-PANEL-ANA-PROMPT.md](PANEL-REVIZE-PLANI/00-PANEL-ANA-PROMPT.md) | **Master prompt:** her turda takip edilecek çalışma prensibi, rapor formatı, çıkış kriterleri. |
| [PANEL-REVIZE-PLANI/panel-revize-manifest.json](PANEL-REVIZE-PLANI/panel-revize-manifest.json) | Proje kimliği, kısıtlar, canonical doküman listesi, anti-amnesia kuralları. |
| [PANEL-REVIZE-PLANI/panel-revize-tasks.json](PANEL-REVIZE-PLANI/panel-revize-tasks.json) | 9 faz × 52 atomik görev; bağımlılıklar, kabul kriterleri, etki aldığı dosyalar. |
| [PANEL-REVIZE-PLANI/panel-revize-state-schema.json](PANEL-REVIZE-PLANI/panel-revize-state-schema.json) | `panel-revize-state.json` formatının JSON Schema'sı. |
| [PANEL-REVIZE-PLANI/panel-revize-state-example.json](PANEL-REVIZE-PLANI/panel-revize-state-example.json) | İlk state şablonu. |
| [PANEL-REVIZE-PLANI/panel-revize-state.json](PANEL-REVIZE-PLANI/panel-revize-state.json) | **Çalışan state:** her tur sonunda güncellenir. |
| [PANEL-REVIZE-PLANI/panel-revize-acceptance-schema.json](PANEL-REVIZE-PLANI/panel-revize-acceptance-schema.json) | Faz bazlı kabul kriterlerinin yapı şeması. |

## 9. Diğer referans dosyaları

| Dosya | Görev |
|-------|-------|
| [AGENTS.md](AGENTS.md) | Veri güvenliği, agent routing, çalışma kuralları |
| [CLAUDE.md](CLAUDE.md) | Detaylı AI rehberi, mimari açıklamaları |
| [GELISTIRME-PLANI.md](GELISTIRME-PLANI.md) | Ürün yol haritası, teknik ilkeler |
| [PANEL-REVIZE-PLANI/README.md](PANEL-REVIZE-PLANI/README.md) | Revizyon planı indeksi |
| [PANEL-REVIZE-PLANI/01-MEVCUT-SORUNLAR-ANALIZI.md](PANEL-REVIZE-PLANI/01-MEVCUT-SORUNLAR-ANALIZI.md) | Mevcut sorunlar |
| [PANEL-REVIZE-PLANI/02-TASARIM-ILKELERI-VE-VIZYON.md](PANEL-REVIZE-PLANI/02-TASARIM-ILKELERI-VE-VIZYON.md) | Yeni vizyon |
| [PANEL-REVIZE-PLANI/03-BILGI-MIMARISI-VE-SEVKIYAT.md](PANEL-REVIZE-PLANI/03-BILGI-MIMARISI-VE-SEVKIYAT.md) | Veri-sekme eşleşmesi |
| [PANEL-REVIZE-PLANI/04-KOMPONENT-KUTUPHANESI.md](PANEL-REVIZE-PLANI/04-KOMPONENT-KUTUPHANESI.md) | Kart kütüphanesi |
| [PANEL-REVIZE-PLANI/05-ESTETIK-DESIGN-SISTEMI.md](PANEL-REVIZE-PLANI/05-ESTETIK-DESIGN-SISTEMI.md) | Design system |
| [PANEL-REVIZE-PLANI/06-VERI-GUVENLIGI-VE-HATA-DURUMLARI.md](PANEL-REVIZE-PLANI/06-VERI-GUVENLIGI-VE-HATA-DURUMLARI.md) | Privacy, fail-safe |
| [PANEL-REVIZE-PLANI/07-UYGULAMA-FAZLARI-VE-KABUL-KAPISI.md](PANEL-REVIZE-PLANI/07-UYGULAMA-FAZLARI-VE-KABUL-KAPISI.md) | Fazlar ve kabul kapısı |

---

Bu analiz, master prompt ve anti-amnesia dosyalarının temelini oluşturur.
