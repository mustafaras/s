# ÆON Panel-v2 Premium — Anti-Amnesia Ledger

> Bu dosya, PANEL-V2-PREMIUM-TASARIM planının 40 promptluk uygulamasının **gerçek kaynak durumunu (source of truth)** tutar.  
> Her bağımsız ajan, oturum veya model değişimi sonrası **önce bu dosyayı okumalı**, sonra kendi adımını çalıştırmalı ve bitince **bu dosyayı güncellemelidir**.

---

## Proje Özeti

- **Repo:** `mustafaras/s` (GitHub Pages statik deploy)
- **Hedef:** `panel-v2.html/js/css`’i profesyonel, premium bir ÆON Observer Dashboard’a dönüştürmek.
- **Plan klasörü:** `PANEL-V2-PREMIUM-TASARIM/`
- **40 sıralı prompt:** `PANEL-V2-PREMIUM-TASARIM/04-40-PROMPT.md`
- **Veri güvenliği kuralı:** Şeyma uygulamasını asla tarayıcıda açma; testler için `run-seyma` skill’inin headless VM harness’lerini veya `tests/test_panel_v2_*.js`’leri kullan.

---

## Ledger Formatı

Her satır bir prompta karşılık gelir. Yeni bir ajan devraldığında:

1. `currentStep` değerini kontrol et.
2. `done` sütununa bakarak tamamlananları gör.
3. Kendi adımını uygula.
4. `done=true`, `commit`, `tests`, `notes` alanlarını doldur.
5. `currentStep`’i bir ileri al.
6. `HANDOFF-TEMPLATE.md`’yi kopyalayıp doldur ve aynı klasöre `handoff-PROMPT-XX.md` olarak kaydet.

```markdown
| Step | Prompt | Durum | Commit | Testler | Notlar |
|------|--------|-------|--------|---------|--------|
```

---

## Prompt Durum Tablosu

| Step | Prompt Kısa Adı | Durum | Commit | Testler | Notlar |
|------|-----------------|-------|--------|---------|--------|
| 0 | Başlangıç / Ledger kurulum | ✅ TAMAMLANDI | `704da96` üzerine ekleme | `node tests/test_panel_v2_*.js` | Anti-amnesia dosyaları oluşturuldu |
| 1 | Renk Paleti & Tasarım Token'ları | ✅ TAMAMLANDI | `96c64cf` | `node --check panel-v2.js`; `node --check panelCoverageManifest.js`; `tests/test_panel_v2_*.js` (9/9 PASS) | Premium açık/koyu token sistemi, cache bump ve deterministik tarih fixture düzeltmeleri |
| 2 | Tipografi Sistemi & Font Yükleme | ✅ TAMAMLANDI | `f1131eb` | `node --check panel-v2.js`; `node --check panelCoverageManifest.js`; `tests/test_panel_v2_*.js` (9/9 PASS); literal font-size audit | Inter/JetBrains Mono, scale tokenları, mono veri yüzeyleri ve CSS cache bump tamamlandı |
| 3 | Glassmorphism Kart Sistemi | ✅ TAMAMLANDI | `cc61b19`, `6402408` | `node --check panel-v2.js`; `node --check panelCoverageManifest.js`; `tests/test_panel_v2_*.js` (9/9 PASS); rendered variants PASS; live cache verification PASS | AeCard glass/solid/gradient/outline varyantları, mevcut kart eşlemeleri ve CSS/JS cache bump tamamlandı |
| 4 | Buton & Status Badge Sistemi | 🔒 BEKLEMEDE | - | - | - |
| 5 | Animasyon Kütüphanesi | 🔒 BEKLEMEDE | - | - | - |
| 6 | Skeleton & Tooltip | 🔒 BEKLEMEDE | - | - | - |
| 7 | AeMetric & AeProgressRing | 🔒 BEKLEMEDE | - | - | - |
| 8 | AeSparkline SVG Grafik | 🔒 BEKLEMEDE | - | - | - |
| 9 | AeDivider & AeToast | 🔒 BEKLEMEDE | - | - | - |
| 10 | Gün Detayı Bölümlerini Ayır | 🔒 BEKLEMEDE | - | - | - |
| 11 | Mevcut Komponentleri Taşı | 🔒 BEKLEMEDE | - | - | - |
| 12 | Count-up Animasyonu | 🔒 BEKLEMEDE | - | - | - |
| 13 | Trend Strip Sparkline | 🔒 BEKLEMEDE | - | - | - |
| 14 | Summary Grid Mini Sparkline | 🔒 BEKLEMEDE | - | - | - |
| 15 | Büyük SVG Line Chart (Mod) | 🔒 BEKLEMEDE | - | - | - |
| 16 | SVG Area Chart (Uyku/Adım/Su) | 🔒 BEKLEMEDE | - | - | - |
| 17 | Isı Haritası İyileştirme | 🔒 BEKLEMEDE | - | - | - |
| 18 | Genel Bakış Sayfası Yenileme | 🔒 BEKLEMEDE | - | - | - |
| 19 | Trendler Sayfası Yenileme | 🔒 BEKLEMEDE | - | - | - |
| 20 | Gün Detayı Akordeon Düzeni | 🔒 BEKLEMEDE | - | - | - |
| 21 | Arşivlere Arama & Filtre | 🔒 BEKLEMEDE | - | - | - |
| 22 | Sistem Sayfası Görsel İyileştirme | 🔒 BEKLEMEDE | - | - | - |
| 23 | Staggered Giriş & Sayfa Geçişleri | 🔒 BEKLEMEDE | - | - | - |
| 24 | Mobil Bottom Tab Bar | 🔒 BEKLEMEDE | - | - | - |
| 25 | Swipe Gesture | 🔒 BEKLEMEDE | - | - | - |
| 26 | Pull-to-Refresh | 🔒 BEKLEMEDE | - | - | - |
| 27 | Touch-friendly Hit Areas | 🔒 BEKLEMEDE | - | - | - |
| 28 | Polling & Telemetry Altyapısı | 🔒 BEKLEMEDE | - | - | - |
| 29 | Olay Günlüğü Görüntüleyicisi | 🔒 BEKLEMEDE | - | - | - |
| 30 | Senkron Sağlık Paneli | 🔒 BEKLEMEDE | - | - | - |
| 31 | Bildirim Yaşam Döngüsü | 🔒 BEKLEMEDE | - | - | - |
| 32 | Sıra Denetimi & Revizyon Geçmişi | 🔒 BEKLEMEDE | - | - | - |
| 33 | Ayarlar & Tanı Araçları | 🔒 BEKLEMEDE | - | - | - |
| 34 | Sistem Sekmesi Sub-tab | 🔒 BEKLEMEDE | - | - | - |
| 35 | Polling & Telemetry Testleri | 🔒 BEKLEMEDE | - | - | - |
| 36 | WCAG AA Renk Kontrastı | 🔒 BEKLEMEDE | - | - | - |
| 37 | Klavye Navigasyonu & Screen Reader | 🔒 BEKLEMEDE | - | - | - |
| 38 | CSS Containment & Performans | 🔒 BEKLEMEDE | - | - | - |
| 39 | Yeni Komponent Testleri | 🔒 BEKLEMEDE | - | - | - |
| 40 | Son QA & Deploy | 🔒 BEKLEMEDE | - | - | - |

---

## Global Durum

- **currentStep:** 4
- **totalSteps:** 40
- **lastUpdated:** 2026-08-09
- **lastAgent:** OpenAI Codex (GPT-5)
- **branch:** main
- **baseCommit:** `704da96`
- **dataSafetyLock:** true (tarayıcıda açma, headless VM/sandbox test kullan)

---

## Son Kararlar (Decision Log)

1. **Ledger lokasyonu:** `PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/` içinde tutulacak; repo köküne dağılmayacak.
2. **Handoff formatı:** Her prompt bitiminde `handoff-PROMPT-XX.md` dosyası oluşturulacak.
3. **Context/token yönetimi:** Her 5 promptta bir `/compact` veya yeni oturum önerilecek; ayrıntılar `TOKEN-BUDGET.md`’de.
4. **Çok ajan koordinasyonu:** Aynı anda sadece bir ajan `panel-v2.js/css/html` yazmalı; paralel çalışma farklı test dosyaları üzerinde yapılabilir.
5. **Deploy frekansı:** Her 5 promptta bir `git push origin main`.

---

## İlgili Skill’ler ve Ajanlar

- **run-seyma** — Güvenli headless app.js doğrulama
- **context-budget** — Token/context bloat denetimi
- **strategic-compact** — `/compact` önerileri
- **unified-memory** — Ajanlar arası el sıkışma (isteğe bağlı ECC Memory Vault)
- **team-agent-orchestration** — Çok ajan Kanban ve kontrol pane
- **recursive-decision-ledger** — Karar/mark geçmişi (bu dosyanın mantığı)
- **agentic-engineering** — Eval-first, 15 dakikalık birimler, model routing
- **tdd-workflow** — Test-first zorunluluğu
- **code-reviewer** — Her kod değişikliği sonrası
- **security-reviewer** — Auth/secret alanları değişirse

---

## Nasıl Devam Edilir?

1. `currentStep` değerine bak.
2. `04-40-PROMPT.md`’de ilgili Prompt bölümünü oku.
3. `AGENT-CONTEXT.md`’den minimum bağlamı al.
4. `TOKEN-BUDGET.md`’den context limiti ve compact önerisini kontrol et.
5. Promptu uygula, test et, commit/push yap.
6. `HANDOFF-TEMPLATE.md`’yi doldur ve `handoff-PROMPT-XX.md` olarak kaydet.
7. Bu `LEDGER.md`’de durumu güncelle ve `currentStep`’i ilerlet.
