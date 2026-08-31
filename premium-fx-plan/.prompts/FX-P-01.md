---
code: FX-P-01
name: Yerel branch oluştur ve temel modül iskeletini hazırla
phase: Faz -1.1
agent: mimar / modülerleştirme uzmanı
prerequisites:
  - Kullanıcı onayı: Premium FX uygulaması başlasın.
  - Çalışma dizini: /Users/m_ras/Desktop/seyma
  - Hiçbir uygulama kodu henüz değiştirilmemiş.
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/index.html
  - /Users/m_ras/Desktop/seyma/app/core/constants.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/MODULARIZATION.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/API-TRANSITION-GUIDE.md
output_files:
  - /Users/m_ras/Desktop/seyma/app/core/dateUtils.js
  - /Users/m_ras/Desktop/seyma/app/core/helpers.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
  - /Users/m_ras/Desktop/seyma/index.html
forbidden:
  - app.js dosyasını silme veya kaldırma
  - index.html'de app.js script tag'ini kaldırma
  - app.js içindeki herhangi bir fonksiyonu değiştirme
  - save() / migrate() / sync.js dokunma
  - git push / PR / deploy
---

# FX-P-01 · Yerel branch oluştur ve temel modül iskeletini hazırla

## Amaç

`app.js`’i kaldırmadan, sadece yeni modülleri `app/core/` altına oluştur ve `index.html`’de bunların script taglerini `app.js`’ten **önce** ekle. Hiçbir handler bu yeni modülleri kullanmamalı; bu prompt yalnızca API yüzeyini expose etmek.

## Girdi

- `app.js` içindeki mevcut fonksiyonlar:
  - `fmt`, `todayStr`, `addDays`, `diffDays`, `pad2`, `shortDate`, `dayIndexFor`, `activeDate`, `curDay`, `dateLabelTR` → `dateUtils.js`
  - `segTabs`, `progBar`, `starRow`, `miniBars`, `statTile`, `collapsibleCardHTML`, `toast`, `confetti`, `haptic` → `helpers.js`
  - `SeyAudio`, `SeyHaptics`, `SeyFx` iskeleti → `mediaFx.js` (henüz boş fonksiyonlar)
  - `SeyTimeTheme` iskeleti → `timeTheme.js`

## Adımlar

1. Branch kontrolü:
   ```bash
   cd /Users/m_ras/Desktop/seyma
   git status --short
   git branch --show-current
   ```
   Eğer `premium-fx-local` yoksa oluştur:
   ```bash
   git checkout -b premium-fx-local
   ```
   Varsa switch et:
   ```bash
   git checkout premium-fx-local
   ```

2. `FX-PROMPT-STATE.json` güncelle: `activePrompt: "FX-P-01"`.

3. `app/core/dateUtils.js` oluştur:
   - IIFE veya nesne literal; `window.SeymaDateUtils = { ... }` expose et.
   - İçinde `fmt`, `todayStr`, `addDays`, `diffDays`, `pad2`, `shortDate`, `dayIndexFor`, `activeDate`, `curDay`, `dateLabelTR` fonksiyonları yer alsın.
   - Fonksiyonların **implementasyonunu `app.js`’ten kopyala** (satır numaraları `CODE-MAP.md`§2.1’de).
   - Hiçbir yeni davranış ekleme.

4. `app/core/helpers.js` oluştur:
   - `window.SeymaHelpers = { segTabs, progBar, starRow, miniBars, statTile, collapsibleCardHTML, toast, confetti, haptic }`.
   - `haptic` fonksiyonu `app.js`’ten kopyalanır (line ~6375).
   - `SeymaHelpers` bağımlılığı `state.js` ve `dateUtils.js` olduğunu belirt (henüz çözülmeyecek; bu prompt sadece expose).

5. `app/core/mediaFx.js` oluştur:
   - `window.SeyAudio = { ctx: null, tap(){}, success(){}, warning(){}, bell(){}, voice(text){}, ambient(type){} }`
   - `window.SeyHaptics = { tap(){}, success(){}, error(){}, refresh(){}, streak(){}, water(){} }`
   - `window.SeyFx = { isPremiumFxEnabled(){}, prefersReducedMotion(){}, countUp(options){}, ripple(event, color){}, shimmer(element){}, shouldAnimate(){}, ambientAllowed(){} }`
   - Tüm fonksiyonlar **güvenli no-op** olmalı (örn. `if (!this.ctx) return;`).

6. `app/core/timeTheme.js` oluştur:
   - `window.SeyTimeTheme = { apply(){}, classForHour(h){}, seasonalClass(){}, applySeasonal(){} }`
   - `classForHour` mevcut mantığı kopyala (dawn/day/dusk/night).

7. `index.html` güncelle:
   - `app/core/constants.js` tag’inden hemen sonra, `app.js` tag’inden önce şu sırayla ekle:
     ```html
     <script src="app/core/dateUtils.js?v=2026083101"></script>
     <script src="app/core/state.js?v=2026083101"></script>
     <script src="app/core/helpers.js?v=2026083101"></script>
     <script src="app/core/mediaFx.js?v=2026083101"></script>
     <script src="app/core/timeTheme.js?v=2026083101"></script>
     ```
   - `app.js` tag’i yerinde kalmalı; sadece yeni tagler ekleniyor.

8. `node --check` her yeni dosya için çalıştır.

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/dateUtils.js
node --check app/core/helpers.js
node --check app/core/mediaFx.js
node --check app/core/timeTheme.js
node --check app.js
node --check index.html || true
node tests/app/test_modularization_boundary.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
node tests/panel/test_faz11_panel.js
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done
```

Ek kanıt:
```bash
grep -c 'src="app.js' index.html   # sonuç 1 olmalı
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l  # önceki ile aynı
grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c  # önceki ile aynı
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e seq 19 ekle:
  ```markdown
  | 19 | 2026-08-31 | GitHub Copilot | FX-P-01 | ✅ TAMAMLANDI | <yerel commit hash> | S5 geçti | Faz -1.1 temel modül iskeletleri oluşturuldu; app.js hâlâ yüklü. |
  ```
- `.anti-amnesia/CURRENT-STATE.md` güncelle: `currentPhase: "Faz -1.1"`, sıradaki `FX-P-02`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-01"`, `currentPhase: "Faz -1.1"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-01 Faz -1.1 temel modül iskeletleri (dateUtils, helpers, mediaFx, timeTheme)"
```

**Push yapma.**

## Rollback

Başarısız olursa:
```bash
git checkout -- .
git clean -fd app/core/dateUtils.js app/core/helpers.js app/core/mediaFx.js app/core/timeTheme.js
git reset HEAD~1
```

## Handoff Notu

Bir sonraki ajan (FX-P-02) `state.js` ve `syncGlue.js` iskeletini oluşturacak. `app.js` hâlâ yüklü ve değişmemiş. `index.html`’de yeni script tagleri var ama `app.js` henüz kaldırılmadı.
