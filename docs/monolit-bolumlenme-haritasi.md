# Şeyma `app.js` Monoliti — Bölünme Haritası

> **Kaynak:** graphify grafik analizi (`graphify-out/graph.json`), 2026-09-01.
> **Amaç:** 18.805 satırlık tek `app.js` dosyasının gerçek iş bölümlerini, graphify'nin yanıltıcı "topluluk" etiketleri yerine **fonksiyon gerçek amacına** göre ortaya koymak. Bu belge, L2/monolit ayrıştırma çalışmasına (reminder %28 vb.) girdi sağlar.

---

## 1. Neden graphify topluluk etiketlerine güvenilmez (bu repo için)

Şeyma'da `app.js` 1.323 fonksiyon tek dosyada barındırıyor. Graphify'nin topluluk algoritması bu tek dosyayı çok sayıda yapay alt-gruba böler ve bunlara "Today View", "Quran Journey", "Cycle/Discomfort" gibi **aynı `app.js` içindeki** adlar atar.

Ölçüm:
| Düğüm | Gösterilen "bağlı topluluk" sayısı | Komşularının aynı `app.js`'te oranı | Karar |
|---|---|---|---|
| `app_render` (render) | 10 | 37/38 (%97) | 🟠 Monolit artefaktı |
| `app_render_paint` (paint) | 8 | 19/19 (%100) | 🔴 Sahte köprü |
| `app_aeonensuremedialoaded_paint` | 3 | 6/6 (%100) | 🔴 Sahte köprü |
| `app_quranapplyremoteupdates_apply` | 6 | 5/6 | 🔴 Monolit artefaktı |
| `app_el` | 2 | 2/3 | 🟠 Çoğunlukla artefakt |

**Sonuç:** Raporun "çok topluluklu köprü" dediği düğümler gerçek mimari bağlantı değil; tek bir dosyanın iç yapısının algoritma yan ürünü. Bu yüzden aşağıdaki harita **dosya sınırı + fonksiyon amacı** üzerine kuruludur.

---

## 2. Dosya → node dağılımı (gerçek modül sınırları)

| Dosya | Node | Role |
|---|---|---|
| `app.js` | **1323** | Şeyma monoliti (tek dosya) |
| `panel/panel.js` | 430 | ÆON / Panel observer |
| `panel/v2/panel-v2.js` | 369 | ÆON Panel-v2 Premium |
| `sync.js` | 78 | GitHub senkronizasyonu |
| `panel/panelCoverageManifest.js` | 69 | P1 coverage/kırmızılama |
| `app/content/quranTransportV1.js` | 38 | Kur'an iletimi |
| `app/content/*` + `app/core/*` | ~200 | İçerik/state modülleri |

> `panel.js` ve `panel-v2.js` zaten app.js'ten **ayrı** dosyalar — onlar kendi iç sınırlarını net gösteriyor. Asıl sorun yalnızca `app.js`'in içindedir.

---

## 3. `app.js` gerçek iş bölümleri (1323 fonksiyon)

Fonksiyonların id/label adlarından gerçek amaca göre sınıflandırma:

| İş alanı | Fonksiyon | % (≈) | Ayrıştırma önerisi |
|---|---|---|---|
| **Reminder / Hatırlatma** | **373** | **%28** | → `app/core/reminder*` ayrı modül |
| **Zikir** | 93 | %7 | → `app/content/zikir*` |
| **Kur'an Yolculuğu** | 93 | %7 | → `app/content/quran*` |
| **Saygı / öncüler** | 69 | %5 | → `app/content/saygi*` |
| **ÆON / Luna** | 50 | %4 | → panel dünyası |
| **Profil değerlendirme** | 34 | %3 | → `app/content/profileAssessmentV1*` |
| Okuma / Kitap | 29 | %2 | → hub (reading) |
| Namaz / Vakit | 25 | %2 | → `app/content/hijri*` + prayer |
| Su takibi | 21 | %2 | → küçük veri bloğu |
| Sync | 18 | %1 | → `sync.js` (zaten ayrı) |
| İzleme / Dinleme | 17 + 16 | %2.5 | → medya hub'ları |
| Fotoğraf / Günlük | 12 | %1 | → daily photo |
| Kıble / Enerji / Sağlık / Alışkanlık | 11–2 | küçük | → ilham/ibadet + sağlık |
| Tema / Terapi | 1 + 1 | <1 | → `timeTheme`/terapi |
| **Diğer (state, render, yardımcı)** | **419** | **%32** | → core çekirdek |
| **TOPLAM** | **1323** | **100%** | |

---

## 4. Öncelikli ayrıştırma sırası (reminder %28 + core %32 = %60)

Eğer ayrıştırma yapılacaksa en yüksek getiri:

1. **Reminder alt sistemi (373 fonksiyon)** → `app/core/reminderEngine.js`, `reminderScheduler.js`, `reminderDelivery.js`, `reminderCatalog.js` zaten ayrı; kalan 373 çağrı noktasını bunlara taşı.
2. **Zikir + Kur'an + Esmâ (186 fonksiyon)** → `app/content/zikirCoreContentV1.js` vb.'ne.
3. **State / render / yardımcı çekirdek (419 fonksiyon)** → `app/core/state.js`, `helpers.js`, `dateUtils.js`, `constants.js` zaten ayrı.

> Her ayrıştırmada **I1–I6** korunmalı: `data` şekli değişmez, `App.<name>` yüzeyi değişmez, `migrate()`, `save()`/`sync.js`, `app.js` script tag'i, ve her adım tek yerel commit olur.

---

## 5. Metodoloji ve sınırlar (dürüstlük notu)

- Sınıflandırma, graphify `graph.json` içindeki node id/label'larının prefix regex eşleşmesine dayanır (`reminder*`, `zikr*`, `quran*`...). Bazı genel fonksiyonlar (`render`, `save`, yardımcılar) "Diğer" grubuna düşer.
- "Diğer" %32 doğrudan bir iş alanına ait değil; state/UI katmanıdır.
- Bu harita **kod ölçüsüdür**, değiştirilmiş bir çıktı değildir; `graphify-out/graph.json` temiz kullanılmıştır.
