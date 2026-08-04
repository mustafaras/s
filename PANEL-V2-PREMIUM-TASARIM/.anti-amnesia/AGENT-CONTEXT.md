# ÆON Panel-v2 Premium — Bağımsız Ajan Bağlam Kartı

> Bu dosya, herhangi bir ajan ilk defa bu projeyle karşılaştığında okuması gereken **minimum bağlamı** içerir.  
> Ajan kimliği, oturum ID’si veya model versiyonu fark etmeksizin, yapıyı anlamak için bu dosya yeterlidir.

---

## Proje Kimliği

| Öğe | Değer |
|-----|-------|
| Proje adı | Şeyma 🦩 — AI destekli ruh hali / wellness takip uygulaması |
| Repo | `mustafaras/s` |
| Deploy | GitHub Pages, `main` branch üzerinden otomatik |
| Hedef artifact | `panel-v2.html`, `panel-v2.js`, `panel-v2.css`, `panelCoverageManifest.js` |
| Dil | Kullanıcı arayüzü Türkçe, teknik dokümanlar karışık (Türkçe + İngilizce) |
| Stack | Vanilla JS/HTML/CSS, build step yok, framework yok, `package.json` yok |
| Veri güvenliği | **Asla tarayıcıda `index.html` açma**; testler headless VM ile yapılır |

---

## Temel Dosyalar

| Dosya | Görev |
|-------|-------|
| `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` | Premium tasarım vizyonu ve mimari ilkeler |
| `PANEL-V2-PREMIUM-TASARIM/01-GOREV-LISTESI.md` | Görev listesi (fazlar ve kabul kriterleri) |
| `PANEL-V2-PREMIUM-TASARIM/02-TASARIM-REFERANSI.md` | Tasarım referansları, component örnekleri |
| `PANEL-V2-PREMIUM-TASARIM/03-BILGI-AKISI-KONTROL-TAKIP.md` | Bilgi akışı, polling, event log, audit |
| `PANEL-V2-PREMIUM-TASARIM/04-40-PROMPT.md` | 40 sıralı uygulama promptu |
| `panel-v2.html` | Dashboard giriş noktası |
| `panel-v2.js` | Dashboard çalışma zamanı (IIFE, `window.AeonV2`) |
| `panel-v2.css` | Dashboard stilleri (custom property design system) |
| `panelCoverageManifest.js` | Veri kapsama / redaksiyon adaptörü |
| `tests/test_panel_v2_*.js` | Headless VM test fixture’ları |
| `tests/helpers/panel-v2-test-helper.js` | Test sandbox yardımcısı |

---

## Çalışma Düzeni

1. **Önce `LEDGER.md`’yi oku.** `currentStep` değeri senin başlayacağın promptu söyler.
2. **Sonra `04-40-PROMPT.md`’de ilgili Prompt’u oku.** Her promptun altında detaylı yapılacaklar listesi vardır.
3. **Kod değişikliği yap.** `panel-v2.css`, `panel-v2.js`, `panel-v2.html` üzerinde çalış.
4. **Test et.** Her promptun en altında hangi test(ler)i çalıştırman gerektiği yazar.
5. **Commit ve push.** Her 5 promptta bir `git push origin main`; arada commitler lokalde tutulabilir.
6. **Ledger güncelle.** `LEDGER.md`’de durumu, commit hash’ini, test sonucunu ve notları güncelle.
7. **Handoff yaz.** `HANDOFF-TEMPLATE.md` şablonunu kullanarak `handoff-PROMPT-XX.md` oluştur.

---

## Veri Güvenliği — KATI KURAL

- **Şeyma uygulamasını (`index.html`) asla tarayıcıda açma.** Eski `localStorage` durumu canlı `seyma-data` reposunu silebilir.
- Panel-v2 testleri için sadece `tests/test_panel_v2_*.js` ve `run-seyma` skill harness’lerini kullan.
- `panel-v2.html` kendi `localStorage` anahtarını (`aeon-v2-token`) kullanır ve uygulamadan ayrıdır.
- `panelCoverageManifest.js` hiçbir ham profil, GPS, medya veya secret veri çıkarmaz.

---

## Tasarım İlkeleri

- **Dark-first:** Koyu tema birincil, aydınlık tema ikincil.
- **Premium his:** Cam efektler (glassmorphism), altın/amber accent (`#D4AF6E`), yumuşak gölgeler, gradient butonlar.
- **Veri yoğunluk:** Her kullanıcı girdisi panelde bir karşılık bulmalı.
- **Bilgi akışı takibi:** Polling, latency telemetry, event log, audit, notification lifecycle görünür olmalı.
- **Test-first:** Her değişiklik sonrası ilgili test fixture geçmeli.

---

## Sık Kullanılan Komutlar

```bash
# Tüm panel-v2 testlerini çalıştır
for f in tests/test_panel_v2_*.js; do node "$f"; done

# Tüm panel P* testlerini çalıştır
for f in tests/test_panel_p*.js; do node "$f"; done

# Syntax kontrolü
node --check panel-v2.js
node --check panelCoverageManifest.js

# Headless app doğrulama (run-seyma skill)
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs

# Git durumu
git status --short --branch
git log --oneline -5
```

---

## Sık Sorulanlar

**Soru:** Önceki ajan bir şey yapmış ama göremiyorum?  
**Cevap:** `LEDGER.md`’de `currentStep` ve `done` sütunlarına bak. Eğer bir adımın commit hash’i yoksa henüz bitmemiştir.

**Soru:** Aynı anda başka bir ajan çalışıyor mu?  
**Cevap:** `LEDGER.md`’deki `lastUpdated` ve `lastAgent` alanlarına bak. Eğer şüphe varsa, `git status` ile çalışma ağacını kontrol et.

**Soru:** Context doluyor, ne yapmalıyım?  
**Cevap:** `TOKEN-BUDGET.md`’ye göz at. Her 5 promptta bir `/compact` veya yeni oturum önerilir.

**Soru:** Testlerden biri geçmiyor ama kodum doğru görünüyor?  
**Cevap:** Test fixture’ını çalıştır ve çıktıyı oku. Testler VM içinde çalışır; DOM stub davranışlarını `tests/helpers/panel-v2-test-helper.js`’den öğren.

---

## İletişim ve Kanıt Seviyeleri

| Seviye | Anlamı | Örnek |
|--------|--------|-------|
| Source/test evidence | Kod/test ile kanıtlanmış | `node tests/test_panel_v2_css.js` PASS |
| Deploy evidence | GitHub Pages’e yansıdı | commit push edildi, Pages build yeşil |
| User-device confirmation | Kullanıcı canlıda gördü | kullanıcı panel-v2.html’i açıp doğruladı |

Hiçbir davranışı “kesin düzeldi” deme, eşleşen kanıt seviyesi yoksa.
