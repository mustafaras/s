---
code: FX-P-84
name: SeyOnSynced kristal bell
phase: FX-WAVE-2 / Dalwa 9
agent: integration
prerequisites:
  - FX-P-83 tamamlandi
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
forbidden:
  - SeyOnSynced'in diger satirlarina dokunma
  - save()/sync.js duzenleme (I4)
  - git push / PR / deploy
---

# FX-P-84 · `SeyOnSynced()` kristal bell

## Amaç

Plandaki §4.1.3 + §4.6.3: sync başarısında çan sesi — ama **yalnızca kullanıcının elle tetiklediği eşitlemede** (arka plan otomatik save'lerde gürültü olmasın).

## Kesin Bağlantı Noktaları (doğrulanmış)

- `app.js:5407`: `window.SeyOnSynced=function(receipt){` — gövde satır 5407-5425.
- `app.js:5414-5419`: `if(ui.saveActionPending){ ui.saveState='synced'; ... toast('Panel ile eşitlendi'); }` — çan **yalnız bu dalın içine** girecek.
- Desen referansı: `app.js:7291` (`App.zikrTap` içindeki guard'lı bell) — **aynı desen**.

## Adımlar

1. **`FX-PROMPT-STATE.json`:** `activePrompt: "FX-P-84"`.

2. **`app.js:5414-5419`** bölgesinde, `try{ toast('Panel ile eşitlendi'); }catch(e){}` satırının **hemen üstüne** tek satır ekle:
   ```js
   if(window.SeyAudio&&typeof window.SeyAudio.bell==='function'){ try{ window.SeyAudio.bell(); }catch(e){} }
   ```
   Sonuç şöyle görünmeli:
   ```js
   if(ui.saveActionPending){
     ui.saveState='synced'; ui.saveActionPending=false;
     try{ clearTimeout(ui.syncedDecayTimer); ui.syncedDecayTimer=setTimeout(function(){ if(ui.saveState==='synced'){ ui.saveState='clean'; updateHeaderSave(); } },2600); }catch(e){}
     if(window.SeyAudio&&typeof window.SeyAudio.bell==='function'){ try{ window.SeyAudio.bell(); }catch(e){} }
     try{ toast('Panel ile eşitlendi'); }catch(e){}
   }
   ```
   **Başka hiçbir satıra dokunma.** `else if(ui.saveState==='saving')` dalı, `mergePersistedReminderState`, `localStorage` yazımı, `updateHeaderSave`/`updateSaveBanner` değişmez.

3. **Kapsam kararı (kasıtlı, değiştirme):** çan yalnız `ui.saveActionPending` dalında — bu, kullanıcının elle "Kaydet/Eşitle" eyleminin onaylandığı tek yerdir (QY-22 yorumu). Arka plan `save(false)` çağrıları çan çalmaz.

4. **Cache-bump (S9):** `index.html` → `app.js?v=20260906a`.

## Yasaklar

`SeyOnSynced`'in başka satırı; `save()` gövdesi; `sync.js` (I4); toast metnini değiştirmek.

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs          # 95/95
node tests/app/test_faz10_sync.js                        # sync davranışı değişmedi
node tests/app/test_premium_audio_fx.js
```

`tests/app/test_premium_audio_fx.js`'e 1 assertion (mevcut string-level desenle):
- `app.js` metninde `SeyOnSynced` gövdesi ile `toast('Panel ile eşitlendi')` arasında guard'lı `SeyAudio.bell` çağrısı geçiyor (regex: `SeyOnSynced[\s\S]{0,900}?SeyAudio\.bell[\s\S]{0,200}Panel ile eşitlendi`).

## S6 Değişmezlik Kanıtı

```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l   # değişmedi (SeyOnSynced window.* zaten)
grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c  # değişmedi
```

## Bitiş (S7/S8)

LEDGER + `CURRENT-STATE.md` + durum makinesi; commit: `premium-fx: FX-P-84 sync başarı bell'i`. **Push yok.**