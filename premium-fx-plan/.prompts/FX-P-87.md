---
code: FX-P-87
name: voicePitch + voiceVoiceName UI ve backfill
phase: FX-WAVE-2 / Dalga 9
agent: integration
prerequisites:
  - FX-P-86 tamamlandi
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/state.js
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/state.js
forbidden:
  - mevcut setVoice* handler goto deistirmek
  - migrate() baska bolumlerine dokunma
  - git push / PR / deploy
---

# FX-P-87 · `voicePitch` + `voiceVoiceName` UI ve backfill

## Amaç

Envanter §8.10: iki ses alanını arayüze açmak. **Kritik keşif:** `voicePitch`/`voiceVoiceName` `state.js`'te backfill'li DEĞİL (kapanış belgesi hatalıydı — doğrulandı: `state.js`'te yalnız `voiceCloudTts`/`voiceCloudVoice` var). Bu prompt backfill'i de ekler.

## Kesin Bağlantı Noktaları (doğrulanmış)

- `app.js:12545-12558`: sesli rehberlik kartı — dil select (`sey-voice-lang`), hız slider (`sey-voice-rate`), bulut ses select (`sey-voice-cloud`) mevcut. Yeni kontroller bu kartın içine.
- `app/core/state.js:117-122` (migrate premium bloğu) ve `app/core/state.js:287-304` (createDefaultData premium bloğu) — yeni alanlar bu iki bloğa eklenir.
- `App.setVoiceRate` handler'ı (FX-P-57) desen referansı.

## Adımlar

1. **`FX-PROMPT-STATE.json`:** `activePrompt: "FX-P-87"`.

2. **`app/core/state.js` — migrate() premium bloğuna** (satır ~122'den sonra, blok içinde):
   ```js
   if(typeof d.settings.voicePitch!=='number') d.settings.voicePitch=1;
   if(typeof d.settings.voiceVoiceName!=='string') d.settings.voiceVoiceName='';
   ```
   **createDefaultData premium bloğuna** (satır ~304 civarı, `voiceCloudVoice` satırının yanına):
   ```js
   if(d.settings.voicePitch==null) d.settings.voicePitch=1;
   if(d.settings.voiceVoiceName==null) d.settings.voiceVoiceName='';
   ```
   Diğer hiçbir satıra dokunma. Idempotent + additive (I3 uyumlu desen).

3. **`app.js` — 2 additive handler** (mevcut `App.setVoiceCloudVoice` gövdesinin YANINA, onu değiştirmeden):
   ```js
   App.setVoicePitch=function(v){
     var x=parseFloat(v); if(isNaN(x)) return;
     data.settings.voicePitch=Math.min(1.3,Math.max(0.7,x));
     save(); render();
   };
   App.setVoiceVoiceName=function(v){
     if(typeof v!=='string') return;
     data.settings.voiceVoiceName=v||'';
     save(); render();
   };
   ```

4. **`app.js` — sesli rehberlik kartına 2 kontrol** (satır ~12558, bulut ses select'inin kapanış `</div>'`ından sonra, kart kapanmadan). **K1 uyarısı:** yeni kontrollerde emoji ikon KULLANMA — etiket düz metin (`Ton`, `Yerel ses`):
   ```js
   // FX-P-87: yerel TTS pitch + ses adı. Yalnız voiceCloudTts KAPALIyken etkin;
   // bulut açıkken disabled (bulut sesinde pitch/ses-adı geçersiz).
   var vCloudOn=!!(data.settings&&data.settings.voiceCloudTts);
   var vPitch=(data.settings&&data.settings.voicePitch!=null)?Number(data.settings.voicePitch):1;
   var vLock=vCloudOn?'opacity:.45;pointer-events:none;':'';
   h+='<div style="display:flex;align-items:center;gap:10px;'+vLock+'"><label for="sey-voice-pitch" style="font-size:var(--f-footnote);color:var(--text2);flex-shrink:0;">Ton</label><input id="sey-voice-pitch" type="range" min="0.7" max="1.3" step="0.05" value="'+vPitch+'" oninput="App.setVoicePitch(this.value)" style="flex:1;accent-color:var(--accent-ink);"><span style="font-size:var(--f-caption1);font-weight:800;color:var(--text);min-width:44px;text-align:right;">'+vPitch.toFixed(2)+'x</span></div>';
   h+='<div style="display:flex;align-items:center;gap:10px;'+vLock+'"><label for="sey-voice-vname" style="font-size:var(--f-footnote);color:var(--text2);flex-shrink:0;">Yerel ses</label><select id="sey-voice-vname" onchange="App.setVoiceVoiceName(this.value)" style="flex:1;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px;font-size:var(--f-footnote);outline:none;color:var(--text);"><option value="">Otomatik</option></select></div>';
   ```
   Yerel ses listesi: `render()` içinde `speechSynthesis` yoksa select gizlenmeyebilir ama **boş "Otomatik"** seçeneğiyle render edilir (iOS `getVoices` async boş döner — popülasyon `speechSynthesis.onvoiceschanged` ile yapılır):
   ```js
   try{
     if(window.speechSynthesis){
       var pop=function(){ var vs=speechSynthesis.getVoices().filter(function(v){ return v.lang&&v.lang.indexOf((data.settings.voiceLang||'tr-TR').slice(0,2))===0; }); var sel=document.getElementById('sey-voice-vname'); if(!sel) return; vs.slice(0,20).forEach(function(v){ var o=document.createElement('option'); o.value=v.name; o.textContent=v.name; if(v.name===data.settings.voiceVoiceName) o.selected=true; sel.appendChild(o); }); };
       pop(); speechSynthesis.onvoiceschanged=pop;
     }
   }catch(e){}
   ```
   Bu blok `render()` sonrasında çalışmalı (mevcut `setTimeout` desenleriyle) — inline render string'ine DEĞİL.

5. **`mediaFx.js` doğrula:** `voicePitch`/`voiceVoiceName`'i gerçekten okuyor mu? `grep -n 'voicePitch\|voiceVoiceName' app/core/mediaFx.js` — okumuyorsa `speakLocal` içinde `u.pitch=s.pitch||settings().voicePitch||1` benzeri **tek satır** hizala (mevcut davranışa dokunmadan). Okuyorsa hiçbir değişiklik yapma.

6. **Cache-bump (S9):** `index.html` → `app.js?v=20260906a`, `app/core/state.js?v=20260906a`.

## Yasaklar

`App.setVoiceGuidance/setVoiceLang/setVoiceRate/setVoiceCloudVoice` gövdelerini değiştirmek; `migrate()`'in premium dışı bölümleri; bulut TTS mantığı.

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js && node --check app/core/state.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_premium_voice.js
node .claude/skills/run-seyma/verify-state-migration-boundary.mjs   # I3: migrate değişimi uyumlu
node tests/app/test_faz10_sync.js                                    # settings sync akışı
```

`tests/app/test_premium_voice.js`'e 5 assertion:
1. `migrate()` çıktısında `voicePitch===1` (yeni eski-state).
2. `migrate()` çıktısında `voiceVoiceName===''`.
3. `App.setVoicePitch('1.9')` → settings değeri `1.3` (clamp üst sınır).
4. `App.setVoicePitch('0.2')` → `0.7` (alt sınır).
5. `App.setVoiceVoiceName('')` → boş string kabul; `App.setVoiceVoiceName(42)` → değer değişmez.

## S6 Değişmezlik Kanıtı

```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l   # +2 (setVoicePitch, setVoiceVoiceName) — BELGELE
grep -c 'src="app.js' index.html                             # 1
```

## Bitiş (S7/S8)

LEDGER + `CURRENT-STATE.md` + durum makinesi; commit: `premium-fx: FX-P-87 voice pitch/yerel ses arayüzü`. **Push yok.**