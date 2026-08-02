# ZP-00 — Zikirmatik Redesign Denetimi

> **Branch:** `zikirmatik-iphone16-redesign` (main ile 0 fark; henüz kod değişikliği yok)
> **Tarih:** 2026-07-29
> **Kapsam:** Kod değişikliği yok. Bu belge yalnız envanter + koru/değiştir/ekle/kaldır kararlarının kanıtıdır.
> **Sonuç özeti:** Zikirmatik'in matematik/veri/sayaç çekirdeği (Z1–Z9,
> `ZIKIRMATIK-GELISTIRME-PLANI.md`) **zaten üretim kalitesinde uygulanmış** ve
> yalnız `ZIKR_V2_VISIBLE` / `ZIKR_V2_VISIBLE_P` bayraklarıyla canlıdan
> gizlenmiş durumda. Bu redesign işi sıfırdan inşa değil; **(a) eksik 99 Esmâ
> içerik katmanı, (b) opak/tipografi/genişlik tasarım borcu, (c) erişilebilirlik
> ince ayarları** üzerine kurulu bir iyileştirmedir.

---

## 0. Doğrulama — "önce" durumu (kod değişmeden önce)

```
node --check app.js                              → OK
node --check sync.js                             → OK
node --check esmaulHusnaV1.js                    → OK
node .claude/skills/run-seyma/driver.mjs         → PASS (6/6 adım)
node .claude/skills/run-seyma/zikr-harness.mjs   → 42/42 PASS
node test_faz10_sync.js                          → 50/50 PASS
node test_faz11_panel.js                         → 39/39 PASS
```

Tüm baseline testler yeşil. `git status` temiz, `zikirmatik-iphone16-redesign`
branch'i `main` ile aynı SHA'da (henüz commit yok).

---

## 1. `app.js` zikir kod zinciri (11.551 satır içinde 3 küme)

Kodun tamamı üç blokta yaşıyor: **314–509** (şema/matematik/migration),
**3260–3420** (runtime helper + `App.zikr*` handler'ları), **8668–8793**
(view/template fonksiyonları). Bayrak kontrolü ayrıca **9735**'te.

### 1.1 `data.zikr` şeması
- `emptyZikrRoot` (335-342): `schemaVersion:2`, `migrationVersion:'zikr_v2'`,
  `presets[]`, `journeys{}`, `sessions{}`, `activeSession`, `settings{...}`,
  `streak`, `streakDate`.
- `emptyZikrDay` (343): `{totalCount, completedSets, perPreset, lastAt}`.
- `emptyZikrPresetDay` (344): **tanımlı ama hiç çağrılmıyor** — ölü kod adayı;
  eşdeğer şekil `zikrPresetDay` (450) içinde ad-hoc üretiliyor.
- `zikrSeedPreset` (349-351): preset alanları — `id, name, phrase, target,
  color, favorite, createdAt, builtIn, kind, arabic, ebced, countDirection,
  hatimMode`.
- Journey şekli (458/427): `{presetId, lifetimeCount, activeHatimId, lastAt,
  lastSessionId, completedHatims, legacyCompletedHatims, hatims[]}`.
- Hatim şekli (`zikrNewHatim`, 364-367): `{id, mode, baseTarget, target, count,
  startedAt, completedAt, status}` (`status` ayrıca ad-hoc `'archived'` alıyor,
  3372).
- Bu şema, `ZIKIRMATIK-GELISTIRME-PLANI.md §2.1`'deki v2 tasarımıyla **birebir
  örtüşüyor** — ZP-04'ün istediği "V3" alanlarının (journeys/hatims/sessions/
  activeSession/settings) hepsi zaten mevcut. Fark: `editorialVersion` alanı
  yok (99 içerik modülü henüz olmadığı için).

### 1.2 Migration
- `migrate()` (948-1121) → zikir kısmı yalnız **993-995**:
  `if(!d.zikr) d.zikr=emptyZikrRoot(); migrateZikrV2(d)`. Her boot'ta
  **koşulsuz** çağrılıyor; idempotency `migrateZikrV2` içinde.
- `migrateZikrV2` (404-438): (1) `zikrNormalizeRoot` ile şekli garantile, (2)
  her `sessions[date]` için `perPreset` toplamlarını **yalnız
  falsy/0 ise** yeniden hesapla (güvenli, `||` fallback), (3)
  `migrationVersion!==ZIKR_MIGRATION_VERSION` ise `journeys[pid]`'i **tamamen
  sıfırdan yeniden inşa et** (432), (4) `schemaVersion`'ı işaretle.
- **Tespit edilen veri kaybı riski:** Adım 3, `migrationVersion` sabiti
  yeniden ileri alınmadıkça bir daha çalışmaz (doğru davranış). Ancak
  `migrationVersion` bir şekilde sıfırlanır/geri düşerse (bozuk yedek geri
  yükleme veya gelecekte yeni bir migration sabiti eklenirse), bu blok
  **gerçek `hatims[]` geçmişini (birden fazla tamamlanmış/arşivlenmiş hatim)
  atıp günlük toplamlardan tek bir hatim olarak yeniden kurar** — çoklu hatim
  geçmişi olan kullanıcılarda geriye dönük veri kaybı riski. ZP-04'te V3'e
  geçilirken bu path'e **dokunulmamalı veya ayrı bir versiyon sabitiyle**
  ele alınmalı.

### 1.3 Saf matematik / helper fonksiyonlar
`zikrInt`(334, saf), `zikrSeedPreset`(349-351, saf), `zikrBaseTarget`(352,
saf), `zikrHatimTarget`(353, saf), **`zikrMath`(354-363, saf — asıl
hedef/ilerleme motoru)**, `zikrWeek`(455, günlük toplamlar), `zikrTouchTick`
(477-501, ana "tap" mutasyonu), `zikrPaintLive`(3293-3307, DOM'a doğrudan
dokunan hızlı-yol — tam `render()` yerine kullanılan optimizasyon).
Ebced hesaplama **app.js'te değil**, `esmaulHusnaV1.js`'te (VALUES tablosu +
`ebced()`); app.js yalnız önceden hesaplanmış değeri tüketiyor.

### 1.4 `App.openZikr` ve handler zinciri
`App.openZikr` (3308): flag kapalıyken sessizce reddedip toast gösteriyor
("Zikirmatik yenileniyor..."); açıkken `ui.zikrOpen=true`, `render()`,
wake-lock senkronu, `#zikr-screen`'e focus.

**18 `App.zikr*` handler'ı** tam liste (hepsi mevcut, kayıp yok):
`openZikr, closeZikr, setZikrView, onZikrKeydown, zikrTap, zikrUndo,
setZikrPreset, setZikrPresetFilter, toggleZikrSetting, toggleZikrPause,
startNewZikrHatim, openZikrPresetAdd, cancelZikrPresetAdd, onZikrPresetField,
saveZikrPreset, deleteZikrPreset, toggleZikrFavorite, zikrResetToday`.

### 1.5 Template zinciri
`zikroverlayHTML`(8786-8793) → header + `segTabs` (Sayaç/Esmâ/Hatimlerim/Özet)
→ `zikrCounterViewHTML`(8696-8729) / `zikrPresetsViewHTML`(8730-8753) /
`zikrHatimsViewHTML`(8754-8768) / `zikrStatsViewHTML`(8769-8785).
Çağrı zinciri: `render()` → `modalsHTML()`(9722) → satır **9735**
`if(ui.zikrOpen && ZIKR_V2_VISIBLE) h+=zikroverlayHTML()`.
Önizleme kartı: `zikrPreviewCardHTML`(8679-8695), `saygiPreviewHubHTML`
içinden çağrılıyor (8673, 8675), o da yalnız flag açıkken.

### 1.6 Bayrak noktaları
`ZIKR_V2_VISIBLE` (331) = `window.__SEYMA_TEST_ZIKR__===true` (prod'da
false). 6 kontrol noktası: 3308, 8670, 8673, 8675, 8676, 9735.
`ZIKR_V2_VISIBLE_P` **app.js'te yok**, yalnız `panel.html:448`.

### 1.7 Diğer bulgular
- `settings.defaultMode` ve `settings.confirmReset` şemada tanımlı ama
  **hiçbir yerde okunmuyor/dallanmıyor** — kullanılmayan alan; ZP-04/ZP-15'te
  ya bağlanmalı ya da kaldırılmalı.
- `syncZikrDayMirror`(503-508) günlük veriyi `data.days[date].zikr`'a
  kopyalıyor; `faithWeekKPIs`/`faithDayHeat` bu aynayı okuyor. Şema
  değişikliğinde bu ayna senkron kalmalı.
- CSS'te **iki ayrı zikir sınıf seti** var: eski `.sey-zikr-ov-*`/`.zikr-stage`/
  `.zikr-preset`/`.zikr-chip`/`.zikr-fab`/`.zikr-toggle` (579-609) — **hiçbir
  app.js fonksiyonu bu sınıfları artık üretmiyor** (ölü CSS adayı) — ve güncel
  `.zikr-v2-*` (646-673) — halen kullanılan.

---

## 2. `styles.css` — zikir sınıfları/token'lar

- Token'lar: `--zikr/--zikr2/--zikr-bg/--zikr-glow` — açık tema **214**, koyu
  tema **253**; her ikisi de `rgba()` yarı saydam.
- Eski set (579-609): `.sey-zikr-ov-back/-card`, `.zikr-stage` (+ `.ringbg`,
  `.halo`, `.core`, `.count`, `.tgt`), `.zikr-phrase`, `.zikr-niyet`,
  `.zikr-esma-name`, `.zikr-ebced-note/-method`, `.zikr-library-head`,
  `.zikr-esma-badge`, `.zikr-empty-search`, `.zikr-done-spark` (+ keyframe
  `zikrSpark`), `.zikr-preset`, `.zikr-chip`, `.zikr-fab`, `.zikr-toggle` —
  **kaldırılacak** (bkz. §6).
- Güncel set (646-673, `.zikr-v2-*`): preview kartı, overlay/screen, header,
  tabs, scroll, intention banner, isim bloğu, ana tap düğmesi + halka +
  progress, cycle-grid, session satırı, dock, tamamlanma kartı, sr-only +
  focus-mode + breathing animasyonu, section head, arama + preset listesi,
  custom preset formu, hatim kartları, stats/KPI/haftalık bar, ayarlar,
  koyu tema override'ları, `min-width:681px` masaüstü modu, `max-height:700px`
  kısa ekran modu, `prefers-reduced-motion` override'ı.

### 2.1 Şeffaflık/opaklık kanıtı (ZP-08 için kritik)
- **Gerçek `backdrop-filter: blur()` — 2 yer:** satır 659 (alt dock, 18px
  blur) ve satır 670 (`min-width:681px` masaüstü overlay, 12px blur).
- **Yaygın `color-mix(..., transparent)` / `rgba()` yarı saydamlık:** hemen
  hemen her `.zikr-v2-*` kuralında (593-668 arası tekrar tekrar) — kartlar,
  chip'ler, preset satırları, KPI kutuları hep tint'li yarı saydam yüzeyler.
  Yalnız `.zikr-v2-stats`/`.zikr-v2-kpis>div`/`.zikr-v2-week`/`.zikr-v2-top`
  (667) tam opak `var(--card)` kullanıyor — geri kalan yüzeylerin çoğu
  değil.
- **Gradient kullanımı:** düğme/aktif-durum/halka/kart arka planlarında
  yoğun (`linear-gradient`/`radial-gradient`, 582, 607, 608, 646-668).

### 2.2 Safe-area / dvh / genişlik (ZP-09 için kritik)
- **Safe-area zaten var:** header `calc(12px + env(safe-area-inset-top))`
  (satır 12'nin karşılığı), scroll `calc(24px + env(safe-area-inset-bottom))`
  — ZP-09'un talep ettiği şey **sıfırdan eklenecek değil, doğrulanacak**.
- **100dvh zaten kullanılıyor** (ekran + masaüstü `calc(100dvh - 32px)`).
- **390/393/430/440px için özel regresyon breakpoint'i yok** — yalnız genel
  `min-width:681px` (masaüstü) ve `max-height:700px` (kısa ekran) var. Bu,
  ZP-09'un istediği dört genişlik sınıfı için **gerçek bir boşluk**.

### 2.3 Tipografi debt (ZP-08 §406 "11px altı metin oluşturma" ihlali)
11px altı `font-size` kullanan zikir kuralları (kanıt):
`.zikr-v2-kpis span{font-size:8px}`, `.zikr-v2-week .bars b/span{8px}`,
`.zikr-v2-top>div span b{9px}`, `.zikr-v2-cycle-grid span{8px}`,
`.zikr-v2-settings button small{9.5px}`, `.zikr-v2-preset .copy em{8.5px}`,
`.zikr-v2-tabs .seg button{10.5px}` ve benzeri ~15 kural. **Bu doğrudan
ihlal — ZP-08'de düzeltilmeli.**

### 2.4 Dokunma hedefi ölçümü (ZP-11/ZP-17 için)
- Ana tap düğmesi `.zikr-v2-tap`: **236×236px** (kısa ekranda 198×198px) —
  ZP-11'in istediği ≥48×48'in çok üzerinde, plan §3.4'ün 180×180 hedefini de
  karşılıyor.
- Kapat düğmesi `.zikr-v2-header .close`: **38×38px** — WCAG 24×24 alt
  sınırını geçiyor ama dokümanın istediği "ürün standardı 44-48px"in
  **altında** — küçük gap, ZP-08/ZP-17'de büyütülmeli.
- Ayarlar satırları `.zikr-v2-settings button`: `min-height:52px` — yeterli.

---

## 3. `panel.html` ve `sync.js`

### 3.1 Panel aynası (panel.html 438-505, KPI kart 2444-2463)
`ZIKR_SEED_P`(439-445, fallback preset'ler), `ZIKR_V2_VISIBLE_P=false`(448,
tek bayrak — kart tamamen bu bayrağa bağlı no-op), `zikrRootP`(449),
`zikrDayTotalP`(450), `zikrDaySetsP`(451), `zikrStreakP`(452),
`zikrPresetP`(453-457), **`zikrJourneySummaryP`(458-469 — en zengin helper,
aktif preset+journey+hatim+lifetime toplamlarını çözer)**,
`zikrWeekTotalP`(470-474), `faithWeekKPIsP`(475-485, zikir haftalık toplamını
genel ibadet KPI'sine katıyor), `faithDayHeatP`(486-493, ısı haritası
hücresine zikir verisini katıyor), `faithAnnualPanelCardP`(494-505+).
KPI kart (2444-2463): aktif Esmâ+tur, count/target Ebced², bugünkü set,
hafta toplamı, tamamlanan hatim, lifetime, haftalık namaz, cemaat sayısı.
**Tüm okuma yolu çalışıyor; yalnız görsel üretim bayrakla kapalı** — veri
kaybı yok.

### 3.2 sync.js — `mergeZikr` (375-427)
Kural: **sayımlar/toplamlar için monotonik max, zaman damgalı alanlar için
en-son-kazanır** (`lastAt`, `activeHatimId`, `activeSession`, tamamlanma
tie-break). Hatim id'leri union edilir (403-412); `status` iki taraftan
biri `completed` ise `completed` kazanır (409). `mergeData()`'ya bağlı
(450-452). **Şema değişikliğinde bu fonksiyon da güncellenmeli** — yeni
preset/journey/hatim alanları eklenirse `mergeZikr` onları otomatik
birleştirmez, yalnız bir taraftan kopyalar.
Anti-clobber/localhost guard'ları (27-32, 33-47, 96, 106-109, 480-482,
506, 516, 522, 537) yalnız konumlandı, **dokunulmadı**.

---

## 4. `esmaulHusnaV1.js` — 99 kayıt bütünlüğü

Tam dosya okundu (71 satır). Alanlar: **yalnız `id, order, name, arabic,
ebced`** — `transliterationTr, meaningTr, importanceTr, reflectionTr,
sourceRefs, editorialStatus` **hiçbiri yok**. `name` alanı zaten
transliterasyon işlevi görüyor (ör. `'er-Rahmân'`), ama Türkçe anlam/önem/
tefekkür/kaynak metni **tamamen eksik** — ZP-01'in ana iş kalemi budur.

- **99 kayıt doğrulandı**, `order` 1-99 aralığında benzersiz ve sıralı
  (düz `.map` üzerinden, boşluk/tekrar imkânsız).
- `id` = `esma_01`…`esma_99`, benzersiz.
- `ebced()` normalize + harf-değer toplamı olarak hesaplanıyor (hard-code
  değil); kaynaklar (`sources.names`, `sources.ebced`) Diyanet + TDV İslam
  Ansiklopedisi'ne işaret ediyor — ZP-01/ZP-13'ün istediği kaynak
  referanslarıyla uyumlu, yeniden kullanılabilir.
- Örnek kayıt (satır 9, 13): `Allah/الله`, `el-Fettâh/فتاح` (ebced 489,
  harness'in sınır testinde kullanılan değer).

---

## 5. `zikr-harness.mjs` — 42 assertion, kategorilere ayrılmış

Dosya 425 satır, **tam 42** `ok(...)` çağrısı doğrulandı.

| Kategori | Satır aralığı | Adet |
|---|---|---|
| Genel render (hub sekmesi, önizleme kartı) | 129-158 | 4 |
| Rapor/heatmap/koleksiyon (Saygı — zikir dışı) | 137-152 | 4 |
| Zikirmatik overlay render | 161 | 1 |
| Esmâ preset kütüphanesi/geri sayım | 170-176 | 2 |
| Ana sayaç (tap/set/streak) | 195-211 | 3 |
| Migration (v1→v2, idempotent) | 229-241 | 2 |
| el-Fettâh 489/239.121 sınırları | 260-279 | 5 |
| Hızlı tap / preset izolasyonu | 289-293 | 2 |
| Reload kalıcılığı | 299 | 1 |
| Gün değişimi | 307 | 1 |
| Erişilebilirlik/reduced-motion/koyu tema | 310-312 | 2 |
| Saygı/koleksiyon (zikir dışı) | 314-319 | 2 |
| Kıble/vakit/hicri/rapor (zikir dışı, karışık) | 324-362 | 7 |
| Saygı okuma akışı (zikir dışı) | 367-416 | 5 |
| Genel migration/backfill | 418 | 1 |

**~21/42 doğrudan zikir-spesifik** (overlay, esmâ, tap/set/streak, migration,
Fettâh sınırları, hızlı tap, reload, gün değişimi, a11y/tema); kalan ~21'i
aynı dosyaya paketlenmiş Saygı/Kıble/Hicri/İbadet-rapor testleri. **ZP-19'da
yeni zikir testleri eklenirken bu dosyanın zikir-dışı 21 assertion'ı
kırılmamalı** (regresyon riski — aynı harness'i paylaşıyorlar).

`driver.mjs` (253 satır) genel render/regresyon harness'i, zikir-spesifik
değil, `esmaulHusnaV1.js`'i bile yüklemiyor.

---

## 6. Koru / Değiştir / Ekle / Kaldır tablosu

| Karar | Kapsam | Kanıt/gerekçe |
|---|---|---|
| **KORU** | `data.zikr` şema v2 (journeys/hatims/sessions/activeSession/settings) | ZIKIRMATIK-GELISTIRME-PLANI §2.1 ile birebir örtüşüyor; ZP-04'ün istediği alanların hepsi mevcut |
| **KORU** | `zikrMath`, `zikrTouchTick`, atomik tap/undo/pause/resume mantığı | 42/42 harness geçiyor; Fettâh 489/239.121 sınırları doğru |
| **KORU** | `mergeZikr` (sync.js) monotonik merge kuralı | 50/50 sync testi geçiyor; anti-clobber'a dokunulmadı |
| **KORU** | Panel aynası okuma helper'ları (`zikrJourneySummaryP` vb.) | 39/39 panel testi geçiyor, salt-okunur, veri kaybı yok |
| **KORU** | safe-area/`100dvh` altyapısı (zaten var) | §2.2 kanıtı |
| **KORU** | `esmaulHusnaV1.js` ebced hesap motoru + kaynaklar | Deterministik, kaynaklı, ZP-03 sözleşmesiyle uyumlu |
| **DEĞİŞTİR** | `.zikr-v2-*` CSS: şeffaflık/color-mix/gradient → opak yüzeyler | §2.1 kanıtı — ZP-08 kapsamı |
| **DEĞİŞTİR** | 11px altı font-size kuralları (~15 yer) → ≥11px | §2.3 kanıtı — ZP-08 kapsamı |
| **DEĞİŞTİR** | Kapat düğmesi 38×38 → 44-48px | §2.4 kanıtı — ZP-08/ZP-17 kapsamı |
| **DEĞİŞTİR** | Sayaç ekranında eşzamanlı 4 metrik (bugün/oturum/tur/hatim) → doküman kuralına göre en fazla 3 seviye | ZIKIRMATIK-IPHONE16-PREMIUM-PROMPT-PAKETI §3 vs mevcut `zikrCounterViewHTML` çıktısı — ZP-07/ZP-11'de karar gerekir |
| **EKLE** | 99 Esmâ için `meaningTr/importanceTr/reflectionTr/sourceRefs/editorialStatus` (V2 içerik modülü) | §4 kanıtı — ZP-01, en büyük iş kalemi |
| **EKLE** | Çekirdek 5 preset (Sübhanallah vb.) için `meaningTr/importanceTr/sourceRefs` | ZP-02 kapsamı; `ZIKR_SEED`/`ZIKR_NIYET`'te şu an yok |
| **EKLE** | 390/393/430/440px için özel regresyon breakpoint'i/testi | §2.2 kanıtı — ZP-09 kapsamı |
| **EKLE** | `editorialVersion` alanı (data.zikr şemasına) | ZP-04'ün V3 sözleşmesi istiyor, şu an yok |
| **KALDIR** (kanıtlanmış, güvenle) | Eski `.sey-zikr-ov-*`/`.zikr-stage`/`.zikr-preset`/`.zikr-chip`/`.zikr-fab`/`.zikr-toggle` CSS (579-609) | §1.7 — hiçbir app.js fonksiyonu bu sınıfları artık üretmiyor (grep doğrulandı) |
| **KARAR GEREKİR** | `emptyZikrPresetDay` (çağrılmayan fabrika fonksiyonu) | Ölü kod adayı; kaldırmadan önce ikinci bir grep ile teyit edilmeli |
| **KARAR GEREKİR** | `settings.defaultMode`/`settings.confirmReset` (tanımlı ama hiç okunmuyor) | Ya ZP-15'te bağlanmalı ya da şemadan çıkarılmalı |

---

## 7. Tasarım borcu özeti (kanıta dayalı)

1. **Şeffaflık:** 2 gerçek `backdrop-filter` + düzinelerce `color-mix(...,
   transparent)`/`rgba()` yarı saydam yüzey — ZP-08'in "opak yüzey" kuralına
   aykırı (§2.1).
2. **Genişlik regresyonu:** 390/393/430/440px için özel test/breakpoint yok,
   yalnız `min-width:681px`/`max-height:700px` var (§2.2).
3. **Safe-area:** zaten uygulanmış, ek iş gerekmiyor — yalnız doğrulama
   (§2.2).
4. **Tipografi:** ~15 kuralda 11px altı metin (§2.3).
5. **Taşma/eylem hiyerarşisi:** Sayaç ekranında doküman kuralı (max 3
   seviye) ile mevcut UI (4 metrik: bugün/oturum/tur/hatim) arasında
   çelişki — ZP-07'de netleştirilmeli (§6 "KARAR GEREKİR" değil, açık
   ürün kararı).
6. **Dokunma hedefi:** ana buton mükemmel (236px), kapat düğmesi sınırda
   (38px) (§2.4).

---

## 8. Kabul kontrolü (ZP-00 KABUL maddeleri)

- [x] Kod değişikliği yok.
- [x] Feature flag kapalı (`ZIKR_V2_VISIBLE`/`ZIKR_V2_VISIBLE_P` ikisi de
      prod'da false; yalnız `window.__SEYMA_TEST_ZIKR__` ile test modunda
      açılıyor).
- [x] 99 kayıt, sıra (1-99) ve benzersiz id kontrolü yukarıda (§4).
- [x] Veri kaybı riski taşıyan nokta ayrı işaretli (§1.2 — `migrateZikrV2`
      adım 3'ün versiyon-sıfırlama senaryosunda hatim geçmişini ezme
      riski).
- [x] `node --check app.js` ve mevcut zikr harness sonucu kayıtlı (§0).

**ZP-00 tamamlandı.** Sonraki adım ZP-01 (99 Esmâ içerik modülü) —
kullanıcı onayı ile devam edilecek.
