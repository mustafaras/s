# PANEL-REVIZE-PLANI

> ÆON Observer Dashboard için premium, pro ve veri-kaybetmeyen yeniden tasarım planı.

## Bu klasörün amacı

`PANEL-REVIZE-PLANI/` klasörü, mevcut [panel.html](panel.html) / [panel.js](panel.js) / [panel.css](panel.css) üzerine **hiçbir kod değişikliği yapmadan**, yeni panel deneyiminin tasarım, mimari, estetik, uygulama planını ve anti-amnesia süreç yönetimini içeren kaynak belgelerini barındırır. Tüm dosyalar proje kökündedir; böylece [AGENTS.md](AGENTS.md) / [CLAUDE.md](CLAUDE.md) yönlendirmelerinde referans verilebilir.

## 1. Giriş ve koordinasyon

| # | Dosya | İçerik | Okuma sırası |
|---|-------|--------|--------------|
| 00 | [00-PANEL-ANA-PROMPT.md](00-PANEL-ANA-PROMPT.md) | **Master prompt.** Agent'ın her turda takip etmesi gereken çalışma prensibi, kısıtlar, rapor formatı ve çıkış kriterleri. | **İlk okunacak.** |
| 00 | [00-UYGULAMA-YAPISI-ANALIZI.md](00-UYGULAMA-YAPISI-ANALIZI.md) | Mevcut uygulamanın veri modeli, senkronizasyon akışı, panel mimarisi ve test altyapısının net analizi. | 2 |

## 2. Plan dosyaları

| # | Dosya | İçerik |
|---|-------|--------|
| 01 | [01-MEVCUT-SORUNLAR-ANALIZI.md](01-MEVCUT-SORUNLAR-ANALIZI.md) | Mevcut paneldeki UX, mimari, veri ve estetik sorunlarının somut tespitleri. |
| 02 | [02-TASARIM-ILKELERI-VE-VIZYON.md](02-TASARIM-ILKELERI-VE-VIZYON.md) | Yeni panelin vizyonu, duygusal tonu, premium tanımı ve tasarım prensipleri. |
| 03 | [03-BILGI-MIMARISI-VE-SEVKIYAT.md](03-BILGI-MIMARISI-VE-SEVKIYAT.md) | Veri katmanları, hangi verinin nerede görüneceği, redaction ve sevkıyat kuralları. |
| 04 | [04-KOMPONENT-KUTUPHANESI.md](04-KOMPONENT-KUTUPHANESI.md) | Kart kütüphanesi, sekmeler, modüller ve fonksiyon sözleşmeleri. |
| 05 | [05-ESTETIK-DESIGN-SISTEMI.md](05-ESTETIK-DESIGN-SISTEMI.md) | Renk, tipografi, grid, spacing, animasyon ve dark-gold premium design system. |
| 06 | [06-VERI-GUVENLIGI-VE-HATA-DURUMLARI.md](06-VERI-GUVENLIGI-VE-HATA-DURUMLARI.md) | Privacy, redaction, fail-safe, bozuk/eksik veri senaryoları ve kurtarma. |
| 07 | [07-UYGULAMA-FAZLARI-VE-KABUL-KAPISI.md](07-UYGULAMA-FAZLARI-VE-KABUL-KAPISI.md) | Implementasyon fazları, test planı, acceptance criteria ve cache-bump kuralları. |

## 3. Anti-amnesia ve süreç yönetim dosyaları

Bu dosyalar, çok parçalı görevleri ve tur-tur ilerlemeyi takip etmek için kullanılır. Agent her tur sonunda `panel-revize-state.json` günceller.

| Dosya | Şema/İçerik | Amaç |
|-------|-------------|------|
| [panel-revize-manifest.json](panel-revize-manifest.json) | JSON | Proje kimliği, kısıtlar, canonical doküman listesi, anti-amnesia kuralları. |
| [panel-revize-tasks.json](panel-revize-tasks.json) | JSON | 9 faz × 52 atomik görev; her görevin bağımlılıkları, kabul kriterleri, etki aldığı dosyalar ve karmaşıklığı. |
| [panel-revize-state-schema.json](panel-revize-state-schema.json) | JSON Schema | `panel-revize-state.json` dosyasının geçerli formatı. |
| [panel-revize-state-example.json](panel-revize-state-example.json) | JSON (örnek) | İlk state şablonu. `cp panel-revize-state-example.json panel-revize-state.json` ile başlatılır. |
| [panel-revize-state.json](panel-revize-state.json) | JSON (çalışan) | Anlık ilerleme; her tur sonunda güncellenir. |
| [panel-revize-acceptance-schema.json](panel-revize-acceptance-schema.json) | JSON Schema | Faz bazlı kabul kriterlerinin yapısı. |
| [prompts/00-INDEX.md](prompts/00-INDEX.md) | Markdown | Sıralı prompt kataloğu; hangi prompt ne zaman verilir. |
| [prompts/P0-SESSION-START.md](prompts/P0-SESSION-START.md) | Markdown | Her yeni session'da verilen başlangıç promptu. |
| [prompts/P1-FAZ-0-HAZIRLIK.md](prompts/P1-FAZ-0-HAZIRLIK.md) | Markdown | Faz 0 promptu: iskelet dosyaları. |
| [prompts/P2-FAZ-1-SEKME-ISKELETI.md](prompts/P2-FAZ-1-SEKME-ISKELETI.md) | Markdown | Faz 1 promptu: 5 sekme ve topbar. |
| [prompts/P3-FAZ-2-GENEL-BAKIS.md](prompts/P3-FAZ-2-GENEL-BAKIS.md) | Markdown | Faz 2 promptu: Genel Bakış. |
| [prompts/P4-FAZ-3-TRENDLER.md](prompts/P4-FAZ-3-TRENDLER.md) | Markdown | Faz 3 promptu: Trendler \& Uyarılar. |
| [prompts/P5-FAZ-4-GUN-DETAYI.md](prompts/P5-FAZ-4-GUN-DETAYI.md) | Markdown | Faz 4 promptu: Gün Detayı. |
| [prompts/P6-FAZ-5-ARSIVLER.md](prompts/P6-FAZ-5-ARSIVLER.md) | Markdown | Faz 5 promptu: Arşivler. |
| [prompts/P7-FAZ-6-SISTEM-MESAJLAR.md](prompts/P7-FAZ-6-SISTEM-MESAJLAR.md) | Markdown | Faz 6 promptu: Sistem \& Mesajlar. |
| [prompts/P8-FAZ-7-POLISH.md](prompts/P8-FAZ-7-POLISH.md) | Markdown | Faz 7 promptu: Premium polish. |
| [prompts/P9-FAZ-8-TEST-KABUL.md](prompts/P9-FAZ-8-TEST-KABUL.md) | Markdown | Faz 8 promptu: Test ve kabul. |
| [prompts/P10-FAZ-9-GECIS-DEPLOY.md](prompts/P10-FAZ-9-GECIS-DEPLOY.md) | Markdown | Faz 9 promptu: Geçiş ve deploy. |
| [prompts/PX-YARDIMCI-PROMPTLAR.md](prompts/PX-YARDIMCI-PROMPTLAR.md) | Markdown | Debug, karşılaştırma, rollback, data safety yardımcıları. |

## 4. Temel kısıtlar

- **Hiçbir fonksiyon çalışmaz etkilenmez.** Yeni panel `panel-v2.*` dosyaları olarak inşa edilir; geçiş son aşamada yapılır.
- **Hiçbir veri kaybolmaz.** Panel sadece görünürlük düzeyini değiştirir.
- **Mevcut `docs/` ve `archive` temizliği korunur.** Yeni planlar bu klasörde kalır.
- **Veri güvenliği kuralları değişmez.** [AGENTS.md](AGENTS.md) ve [CLAUDE.md](CLAUDE.md) hâlâ geçerlidir; secrets asla dışarı çıkmaz.
- **Mobil öncelikli.** Tasarım kaynağı dar ekrandır; geniş ekran genişlemesidir.

## 5. Nasıl kullanılır

1. Yeni oturumda önce [prompts/P0-SESSION-START.md](prompts/P0-SESSION-START.md) verilir; state okunur ve son durum raporlanır.
2. Ardından [00-PANEL-ANA-PROMPT.md](00-PANEL-ANA-PROMPT.md) okunur.
3. `panel-revize-state.json` yoksa `panel-revize-state-example.json`'dan oluşturulur.
4. [prompts/00-INDEX.md](prompts/00-INDEX.md) ile o sırada gelen faz prompt dosyası (`P1-…` ile `P10-…` arası) belirlenir.
5. İlgili plan dokümanı (01-07) ve `panel-revize-manifest.json` kısıtları takip edilir.
6. Görev uygulanır, test edilir, `panel-revize-state.json` güncellenir.
7. Rapor verilir.

---

Sonraki adım: [00-PANEL-ANA-PROMPT.md](00-PANEL-ANA-PROMPT.md)
