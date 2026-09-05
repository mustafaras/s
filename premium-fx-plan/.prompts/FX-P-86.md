---
code: FX-P-86
name: Habits ring + motivation bar shimmer
phase: FX-WAVE-2 / Dalga 9
agent: integration
prerequisites:
  - FX-P-85 tamamlandi
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
forbidden:
  - progBar imzasini degistirmek
  - yeni keyframe (.sey-shimmer mevcut)
  - git push / PR / deploy
---

# FX-P-86 · Habits ring + motivation bar shimmer

## Amaç

Plandaki §4.5.3: çalışan `SeyFx.shimmer` motorunu iki eksik noktaya bağlamak — hedef tamamlanan habits ring'i ve tamamlanan motivasyon görevinin ilerleme barı.

## Kesin Bağlantı Noktaları (doğrulanmış)

- `app.js:11229` + `app.js:11478`: habits ring SVG üretim yerleri (r=26/r=42 circle). Ring'i saran konteyner `<div style="position:relative;...">` — **çevresine id eklemek I6 kapsamında katkısaldır.**
- `app.js:10674`: `h+='<div style="flex:1;">'+progBar(p.confidence,...)` — motivation bar üretim yeri.
- `App.completeMotivationTask` başarı dalı (`wasDone===false` iken) — FX-P-13'te `SeyAudio.success()` bu dala eklendi; shimmer aynı dala.
- Desen referansı: `app.js:7472` (`maybeStreak` içinde guard'lı `SeyFx.shimmer`).

## Adımlar

1. **`FX-PROMPT-STATE.json`:** `activePrompt: "FX-P-86"`.

2. **Ring konteynerine id ekle** (yalnız üretim satırında string'e `id="sey-habits-ring-wrap"`):
   - `app.js:11478` (96px hero ring): `<div style="position:relative;width:96px;height:96px;flex-shrink:0;">` → `<div id="sey-habits-ring-wrap" style="position:relative;width:96px;height:96px;flex-shrink:0;">`
   - `app.js:11229` (30px mini ring): aynı şekilde `id="sey-habits-ring-mini"`.
   - **Önce doğrula:** iki ring'in hangi handler'da güncellendiğini tespit et (ring yeniden çizen `render()` çağrısı hedef değil; **tamamlama anında** shimmer isteniyor). Hedef handler: `App.toggleHabit` (tüm hedefler dalı, `after>=ht && before<ht` — FX-P-13'ün success chime koşulu).

3. **`App.toggleHabit` tüm-hedefler dalında** (success chime + confetti'nin olduğu yer), chime satırının yanına:
   ```js
   if(window.SeyFx&&typeof window.SeyFx.shimmer==='function'){ try{ var rw=document.getElementById('sey-habits-ring-wrap'); if(rw) window.SeyFx.shimmer(rw); }catch(e){} }
   ```

4. **`App.completeMotivationTask` başarı dalında** (`wasDone===false`), `SeyAudio.bell()` çağrısının hemen yanına:
   ```js
   if(window.SeyFx&&typeof window.SeyFx.shimmer==='function'){ try{ var mb=document.getElementById('sey-motivation-bar'); if(mb) window.SeyFx.shimmer(mb); }catch(e){} }
   ```
   Ve `app.js:10674` bar satırına id ekle: `<div id="sey-motivation-bar" style="flex:1;">` (yalnız motivation confidence bar'ı — diğer `progBar` kullanımlarına dokunma).

5. **Gating:** `shimmer` zaten `isPremiumFxEnabled()` ile gated; çağrı noktaları yalnız guard'lı olur. Yeni gate yazma.

6. **Cache-bump (S9):** `index.html` → `app.js?v=20260906a`.

## Yasaklar

`progBar`/`ringSeg` imzalarını değiştirmek; `.sey-shimmer` CSS'ine dokunmak; diğer shimmer noktalarını değiştirmek.

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_premium_fx_utils.js
```

`tests/app/test_premium_fx_utils.js`'e 2 string-level assertion:
1. `app.js`'te `sey-habits-ring-wrap` id'si + guard'lı `SeyFx.shimmer` çağrısı birlikte geçiyor.
2. `sey-motivation-bar` id'si + guard'lı `SeyFx.shimmer` çağrısı birlikte geçiyor.

## S6 Değişmezlik Kanıtı

```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l   # değişmedi
grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c  # değişmedi
```

## Bitiş (S7/S8)

LEDGER + `CURRENT-STATE.md` + durum makinesi; commit: `premium-fx: FX-P-86 ring/bar shimmer bağlama`. **Push yok.**