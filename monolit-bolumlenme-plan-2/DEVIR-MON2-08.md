# Devir — MON2-07'den MON2-08'e (Seri Kapanışı)

**Tarih:** 2026-09-15 · **Son commit:** bkz. `git log -1` (MON2-07 Dalga 3 kapanışı) · **Dal:** `premium-fx-gorsel-yuzey` (LOCAL-ONLY)
**Durum:** MON2-07 tamam (7/8). Aktif kart **MON2-08** — seri kapanışı. Çalışma ağacı temiz.

## 0. İlk 2 dakika

1. Oku (bu sırayla): `monolit-bolumlenme-plan-2/README.md` §2 (bütçe tablosu) ve §5
   **MON2-08 kartı**; `MON2-STATE.json`; `.anti-amnesia/CURRENT-STATE.md`;
   `.anti-amnesia/LEDGER.md` son satır (seq 8).
2. Ölç: `node tools/shell-inventory.mjs` — beklenen **7.603 / 0 / 408 / 57**.
3. Aktif bütçe **7.800 / 0 / 450 / 150** (7.603'e 197 satır marj). MON2-08 kod
   taşımaz: yalnız kapanış belgesi + bütçe dondurma + state `completed`.

## 1. Kırmızı çizgiler (değişmedi)

- Push/merge/tag/deploy/tarayıcı/gerçek token/gerçek veri/`mustafaras/seyma-data` **yok**.
- Dokunma: `sync.js`, `sw.js`, `panel*`, `app/content/*`, `docs/reminders/*`,
  `premium-fx-plan/MODULARIZATION.md`.
- `App.x=function` = **554 sabit**; inline onclick kombine kaynakta **391 sabit**.
- `data=` **9 rebind satırı** app.js'te kalır (S3/I1); `test_state_rebind_boundary`
  bunu 9 satır + 11 token olarak assert eder.
- `data` rebind içeren gövde ASLA modüle taşınmaz — MON2-07'de `locationGateGranted`
  bu yüzden geri alındı (LEDGER seq 8).
- **Bag üyeleri değer-üretici olmalı:** `X:function(){ return X; }` — çıplak fn
  referansı getter tarafından çağrılıp sonucu değer sanılır (MON2-07 kök düzeltmesi).
- Domain/alan yüzey bölümleri DOM'a **dep-bag takma adıyla** erişir (`doc`/`defer`/`sync`);
  çıplak `document`/`setTimeout(`/`window.SeySync` YAZMA.

## 2. Seri durumu (doğrulanmış, MON2-07)

- `app.js` **7.603** satır (6.589 kod) · `*Legacy` 0 · reminder gövde 408 · builder 4 fn / 57
- Taşıma hacimleri: `zikir.js` 1.724 · `quran.js` 876 · `profile.js` 1.447 ·
  `appSurface.js` 840 · `reminders.js` 4.189 · `render.js` 1.843 · `reminderSurface.js` 1.004
- `appSurface.js` üç bölümden oluşur: MON-50 daily, MON-51/52/53/54 dispatchers,
  **MON2-07 alan yüzey bölümü** (dosya sonunda, sloppy IIFE)
- Cache-bust: `appSurface.js?v=20260915b`, `app.js?v=20260915b` + 5 app_surface pin'i
- Kapı: smoke 21/21 · `--gate` PASS · driver+zikr **95/95** · verify-state B1/B2/B3 ·
  tests/app **52/52** · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders 21/21 ·
  sync 69/69 · `App.x=554` · onclick=391 · dump **6/6 BAYT-EŞİT**
- Bilinen koşum nondeterminizmi (önceden var): `app/core/health.js` `calculateMgNudge`
  `Math.random` skoru — dump kanıtı için geçici tmp sabitleme.

## 3. MON2-08 iş sırası (README §5)

**Kod taşıma YOK.** Sadece kapanış:

1. **Tam kapı seti** koş: syntax · `--gate` · smoke · driver+zikr · verify-state ×3 ·
   tests/app · panel · panel-v2 · quran · reminders · dump parity.
2. **`deliverables/MON2-SERI-KAPANIS.md`** yaz:
   - son envanter tablosu (13.139 → 7.603; her kartın ölçümü)
   - **25 modül API/owner tablosu** (24 + `reminderSurface`; büyüyen
     `reminders`/`render`/`appSurface`)
   - **shim envanteri** (kaç 1-satır shim kaldı, neden: 1.405 fn / 1.411 satır)
   - bütçe dondurma (`shellBudget` son değerler)
   - açık kalanlar (ağ/GPS gövdeleri app.js'te; cihaz kabulü ayrı kapı)
3. **`MON2-STATE.json`**: `status=completed`, `nextPrompt=null`,
   `activePrompt=null`, `completedPrompts=8`, `releaseApproval=not_approved`,
   `shellBudget` dondurulmuş son değerler, `measurements.MON2-08`.
4. **CLAUDE.md / AGENTS.md** modularization bullet'ı "MON2 **complete**" ile
   güncellenir (kapanış belgesine link).
5. **README** başlığı `status=completed`, §2 tablosuna MON2-08 satırı,
   `deliverables/` listesine kapanış belgesi.
6. `docs/GELISTIRME-PLANI.md` changelog + durum tablosu satırı `✅`.
7. LEDGER seq 9 · CURRENT-STATE final bölümü · tek yerel commit.
8. **Kullanıcı onayı bekle** — MON2 sonrası yeni program/cihaz kabulü/push ayrı karar.

## 4. Bilinen tuzaklar (MON2-07'den devralınan dersler)

- **`with` yalnız sloppy modda çalışır.** `appSurface.js`'in ana IIFE'si `'use strict'`
  taşır; yeni bir `with` bloğu ancak **dosya sonunda ayrı IIFE** olarak eklenebilir.
- **app_surface cache-bust pin'i 5 tanedir:** `test_app_surface_{boot,domain,lifecycle,overlay}_boundary.js`
  (+ `daily_boundary` regex tabanlı). `grep -rn 'app\\\.js\\?v=' tests/` ile tara.
  **sed ile toplu değişim fazla kaçış ekler** (`appSurface\\.js\\?v=`) — `perl -pi -e` kullan
  veya değişiklikten sonra pin'i mutlaka çalıştırıp doğrula.
- **fx2 üçlüsü** (`test_fx2_{overlay_motion,tab_transition,touch_coverage}`)
  `combinedSource`'a modül ekler → onclick/App sayımı kayar. Yeni bir görünüm bölümü
  taşırsan sayımı yeniden ölç (`onclick=391`, `App.x unique=718`).
- **Taşımadan önce data-rebind denetimi yap:** hedef gövdede
  `data\s*=(?!=)` / `ui\s*=` / `localStorage` var mı? Varsa o gövde app.js'te kalır.
- Bağımlılık analizinde tanımlayıcı listesine körlemesine güvenme (`find` dersi,
  LEDGER seq 6 sapma 3); fail-closed bag bunu yakalar ama önce düzelt.
- Fixture devirlerinde K8 ilkesi: **pin gövdeyi izler** — gövdeyi slice'layan fixture'ı
  taşınan dosyaya çevir.
- Smoke kümesi **21** fixture; `REMINDER CONTRACT PASS` + sessiz PASS şeklinde yorumlanmalı.
