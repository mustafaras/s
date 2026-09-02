---
code: FX-P-70
name: Dalga -1…6 tam uygulama denetimi (Dalga 7 öncesi doğrulama)
phase: Faz 7 öncesi denetim
agent: QA lead
prerequisites:
  - FX-P-65 tamamlandı (Faz 6 kapanışı)
  - Branch: premium-fx-local
  - Uygulama koduna dokunulmaz — bu prompt yalnızca DOĞRULAMA yapar, düzeltme yapmaz
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/*.js
  - /Users/m_ras/Desktop/seyma/tests/
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/.anti-amnesia/*
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/deliverables/REVIEW-CHECKLIST.md
output_files:
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/deliverables/FX-VERIFY-RAPORU.md
forbidden:
  - Herhangi bir kaynak dosyayı değiştirmek (yalnızca RAPOR dosyası oluşturulur)
  - Testleri "düzeltmek" için kod yazmak — hata bulunursa DUR ve raporla
  - git push / PR / deploy
  - Uygulamayı tarayıcıda genel amaçlı açmak (S4 veri güvenliği)
---

# FX-P-70 · Dalga −1…6 Tam Uygulama Denetimi (Dalga 7 öncesi)

## Amaç

Dalga 7 (kapatma) öncesinde, Dalga −1'den Dalga 6'ya kadar tüm promptların gerçekten uygulandığını, kodun davranış olarak çalıştığını ve hiçbir regresyon olmadığını **bağımsız kanıtlarla** doğrula. Sonuç: her dalga için PASS/FAIL tablosu + tek bir nihai karar (DEPLOY-A-HAZIR / DEĞİL).

## Kural

- **Hiçbir kaynak dosya değiştirilmez.** Yalnızca `premium-fx-plan/deliverables/FX-VERIFY-RAPOR.md` oluşturulur.
- Bir adım FAIL verirse o dalgayı "❌" işaretle ve **dur**; kullanıcıya raporu göster. Kendi başına düzeltme deneme (bu bir denetim; düzeltme ayrı prompttur).

---

## Adım 0 · Ön koşullar (60 saniye)

```bash
cd /Users/m_ras/Desktop/seyma
git status --short --branch          # çalışma ağacı TEMİZ olmalı
git log --oneline -40                # dalga commit'leri görünür olmalı
cat premium-fx-plan/.anti-amnesia/FX-PROMPT-STATE.json
```

Beklenen: `lastCompletedPrompt: "FX-P-65"`, `currentPhase: "Faz 6 tamamlandı"`, `activePrompt: null`, dal `premium-fx-local`, ağaç temiz.

**Kontrol 0.1:** Ağaçta kaydedilmemiş değişiklik varsa → DENETİM BAŞLAMAZ; kullanıcıya bildir.

---

## Adım 1 · Değişmezler (I1–I6) — tek komut bloğu

```bash
# I1: data şekli — migrate idempotent (B2) + sync conflict-merge
node .claude/skills/run-seyma/verify-state-migration-boundary.mjs   # B2 PASS beklenir
node tests/app/test_faz10_sync.js                                   # 64 geçti beklenir

# I2: App.* yüzeyi
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l           # 705 beklenir (701 + toggleSetting + 3 voice handler)
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u > /tmp/app_now.txt
grep -q '^App.toggleSetting=' /tmp/app_now.txt && echo 'I2-EKLEME OK' # yalnız EKLEME olmalı

# I3/I4: migrate/save/sync davranışı
node .claude/skills/run-seyma/verify-state-helper-boundary.mjs      # B1 PASS
node .claude/skills/run-seyma/verify-state-adapter-contract.mjs     # B3 PASS

# I5: tek app.js tag
grep -c 'src="app.js' index.html                                    # 1 olmalı

# I6: commit zinciri — her dalga için en az bir "premium-fx: FX-P-NN" mesajı
git log --oneline | grep -c 'premium-fx: FX-P-'                     # ≥ 30 beklenir
```

**Başarı ölçütü:** B1/B2/B3 PASS, App.* = 705, `src="app.js"` = 1, toggleSetting mevcut, commit zinciri tam.
**I6 ekstra:** `git log --oneline | grep -E 'FX-P-(01|02|05|06|11|12|13|14|15|16|21|22|23|24|31|32|33|34|35|36|37|38|41|42|43|44|51|52|53|54|55|56|57|58|61|62|63|64|65)' | wc -l` → **≥ 34** (her promptun izi).

---

## Adım 2 · Dalga −1 (FX-P-01…04): modül iskeletleri

```bash
for f in app/core/dateUtils.js app/core/helpers.js app/core/mediaFx.js app/core/timeTheme.js app/core/state.js app/core/syncGlue.js app/core/constants.js; do
  node --check "$f" && echo "OK $f" || echo "FAIL $f"
done
node tests/app/test_date_utils_boundary.js        # 58/58
node tests/app/test_helpers_boundary.js           # 30/30
node tests/app/test_modularization_boundary.js    # 42/42
node tests/app/test_faz_minus11_boundary.js       # 18/18
grep -c 'app/core/' index.html                    # modül tag sayısı: 6 modül yükleniyor olmalı
```

**Doğrulanacak davranış (canlı VM):**

```bash
node -e "
global.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
global.window={addEventListener:function(){},matchMedia:function(){return{matches:false}}};
global.document={getElementById:()=>null};
require('./app/core/constants.js');
require('./app/core/dateUtils.js');
require('./app/core/helpers.js');
require('./app/core/timeTheme.js');
console.log('SeymaDateUtils.dayIndexFor tipi:', typeof window.SeymaDateUtils.dayIndexFor);
console.log('SeymaHelpers tipi:', typeof window.SeymaHelpers);
console.log('SeyTimeTheme.classForHour(12):', window.SeyTimeTheme.classForHour(12));
"
```

Beklenen: `function`, `object`, `theme-time-day`.

---

## Adım 3 · Dalga 0 (FX-P-05…06): migrate backfill + B1 canlı getter + mediaFx API yüzeyi

```bash
node tests/app/test_premium_fx_utils.js            # 26/26
node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
```

**Canlı kanıt — 6 premium settings alanı backfill'i:**

```bash
node -e "
const { execSync } = require('child_process');
// migrate() zincirini app.js'ten izole çağıramayacağımız için statik + fixture doğrulaması:
const src = require('fs').readFileSync('app.js','utf8');
const fields = ['premiumAtmosphere','uiSounds','voiceGuidance','ambientSounds','richHaptics','launchRitual','voiceCloudTts','voiceLocalFallback'];
fields.forEach(f => console.log(f, src.indexOf('d.settings.'+f+'==null') >= 0 ? '✓ migrate' : '✗ EKSİK'));
"
```

Beklenen: 7 alanın tamamı `✓ migrate`.
**mediaFx yüzeyi:** `node tests/app/test_premium_settings.js` içinde Test 1–4 zaten kapsar (31/31).

---

## Adım 4 · Dalga 1 (FX-P-11…16): Audio

```bash
node tests/app/test_premium_audio_fx.js            # 26/26 — tap 523Hz, success 2 osc, bell 2 osc, gating
```

**Canlı davranış kanıtı (AudioContext stub ile osilatör sayımı):**

```bash
node -e "
global.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
let osc=0;
global.window={addEventListener:function(){},matchMedia:()=>({matches:false}),AudioContext:function(){this.state='running';this.currentTime=1;this.destination='d';
 this.createOscillator=()=>{osc++;return{type:'',frequency:{value:0},connect:()=>{},start:()=>{},stop:()=>{}}};
 this.createGain=()=>({gain:{value:0,setValueAtTime:()=>{},linearRampToValueAtTime:()=>{},exponentialRampToValueAtTime:()=>{}},connect:()=>{}});
 this.resume=()=>Promise.resolve();},speechSynthesis:null,SeymaState:{data:{settings:{premiumAtmosphere:true,uiSounds:true}}},SeyAudio:null};
global.document={getElementById:()=>null};
require('./app/core/mediaFx.js');
window.SeyAudio.tap(); window.SeyAudio.success(); window.SeyAudio.bell();
console.log('UI sesleri osilatör üretimi: tap+success(2)+bell(2) ≥ 5 beklenir →', osc);
"
```

Beklenen: `≥ 5`. Ayrıca statik: `grep -c 'SeyAudio.success' app.js` ≥ 4, `SeyAudio.warning` ≥ 4, `SeyAudio.bell` ≥ 3 (FX-P-13/14/15 çağrı noktaları).

---

## Adım 5 · Dalga 2 (FX-P-21…24): Haptics

```bash
node tests/app/test_premium_haptics_fx.js          # 25/25
```

Statik: `grep -c 'SeyHaptics.tap' app.js` ≥ 15 (17 nokta), `SeyHaptics.streak` ≥ 3, `SeyHaptics.water` ≥ 1. Desenler FX-LIBRARY §2 ile eşleşmeli: `grep -n 'haptic(\[15\])' app/core/mediaFx.js`.

---

## Adım 6 · Dalga 3 (FX-P-31…38): Visual micro-FX

```bash
node tests/app/test_premium_fx_utils.js            # 26/26
```

Statik kanıt: `grep -c 'sey-ripple-wave' app/styles.css` ≥ 3, `grep -c 'sey-shimmer' app/styles.css` ≥ 3, `grep -c 'sey-enter' app/styles.css` ≥ 3, `grep -c 'will-change' app/styles.css` ≥ 1. FX-LIBRARY §3.8 katalog satırları mevcut: `grep -c '3.8 Visual FX Catalog' premium-fx-plan/FX-LIBRARY.md`.

---

## Adım 7 · Dalga 4 (FX-P-41…44): Time theme

```bash
node tests/app/test_premium_time_theme.js          # 49/49
```

Statik: `grep -c 'theme-time-dawn' app/styles.css` ≥ 2 (açık+koyu tokenlar), `grep -c 'theme-season-' app/styles.css` ≥ 6. app.js'te guard'lı çağrı: `grep -c "window.SeyTimeTheme && typeof window.SeyTimeTheme.apply" app.js` = 1.

---

## Adım 8 · Dalga 5 (FX-P-51…58): Voice guidance — en yoğun dalga

```bash
node tests/app/test_premium_voice.js               # 59/59
node tests/app/test_premium_reduced_motion.js      # 22/22
node tests/app/test_premium_launch_splash.js       # 11/11
```

**Yüzey envanteri (hepsi function olmalı):**

```bash
node -e "
global.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
global.window={addEventListener:function(){},matchMedia:()=>({matches:false}),speechSynthesis:{speaking:false,cancel:()=>{},speak:()=>{},getVoices:()=>[]},SeymaState:{data:{settings:{premiumAtmosphere:true,voiceGuidance:true}}},SeyAudio:null,SeyTimeTheme:{classForHour:()=> 'theme-time-day'}};
global.document={getElementById:()=>null};
global.SpeechSynthesisUtterance=function(t){this.text=t;};
require('./app/core/mediaFx.js');
const S=window.SeyAudio;
['voice','isVoiceEnabled','isQuietTime','greeting','speakLocal','cloudTtsEnabled','cloudTtsSpeak','cloudTtsStop','cloudTtsPlaying'].forEach(k=>console.log(k+':', typeof S[k]));
['zikirStart','zikirHalf','zikirComplete','suraOpen','suraBookmark'].forEach(k=>console.log('guides.'+k+':', typeof (S.guides&&S.guides[k])));
console.log('ambient.start/stop/isSupported/isEnabled:', typeof S.ambient.start, typeof S.ambient.stop, typeof S.ambient.isSupported, typeof S.ambient.isEnabled);
console.log('isQuietTime(23):', S.isQuietTime(23), '| isQuietTime(12):', S.isQuietTime(12));
"
```

Beklenen: tümü `function`; isQuietTime `true/false`.

**app.js entegrasyon noktaları (statik):** onboarding (1), streak (1), zikir complete (1), guides.zikirStart/Half (2), greeting boot+foreground (2), ayarlar kartı, migrate backfill satırları.

**Bulut TTS (kullanıcı kararı: hep bulut, yerel sese düşme yok):**

```bash
grep -c 'voiceLocalFallback==null) d.settings.voiceLocalFallback=false' app.js   # 1 — varsayılan KAPALI
grep -c 'voiceCloudTts==null) d.settings.voiceCloudTts=true' app.js              # 1 — bulut varsayılan AÇIK
node -e "
global.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
global.window={addEventListener:function(){},matchMedia:()=>({matches:false}),speechSynthesis:{speaking:false,cancel:()=>{},speak:()=>{},getVoices:()=>[]},SeymaState:{data:{settings:{premiumAtmosphere:true,voiceGuidance:true,voiceCloudTts:true,openaiKey:'sk-test'}}},SeyAudio:null};
global.document={getElementById:()=>null};
global.SpeechSynthesisUtterance=function(t){this.text=t;};
global.fetch=function(){ return Promise.reject(new Error('ağ yok')); };
require('./app/core/mediaFx.js');
// Anahtar var + bulut açık → voice() true döner ve fetch denenir; başarısızlıkta YEREL SENE DÜŞMEMELİ
let local=false; window.SeyAudio.speakLocal=function(){ local=true; return true; };
const r=window.SeyAudio.voice('test',{force:true});
setTimeout(()=>{ console.log('bulut-önce voice() true:', r===true); console.log('hata sonrası yerel sese düşmedi:', local===false); }, 300);
"
```

Beklenen: iki satır da `true` (yerel robotik ses ASLA duyulmaz — kullanıcı kararı).

---

## Adım 9 · Dalga 6 (FX-P-61…65): Ayarlar & panel

```bash
node tests/app/test_premium_settings.js            # 31/31
node tests/panel/test_panel_p3_root_modules.js     # PANEL-03 PASS
node tests/panel/test_panel_p1_projection.js       # PANEL-02 PASS
```

Statik kanıt:

```bash
grep -c '✨ Premium Atmosfer' app.js                            # ≥ 1 (ayarlar kartı)
grep -c 'App.toggleSetting' app.js                              # ≥ 8 (master + 5 satır + handler + beyaz liste)
grep -c 'voiceCloudTts:1' app.js                                # 1 (beyaz listede)
grep -c 'premiumAtmosphere:typeof' panel/panelCoverageManifest.js  # 1 (panel tracked)
grep -c "premiumAtmosphere:'Premium Atmosfer'" panel/panel.js   # 1 (panel özet etiketi)
grep -c 'aria-pressed' app.js | head -1                          # ayar satırlarında aria-pressed var
```

Panel redaksiyon güvenliği: `grep -n "settings.openaiKey" panel/panelCoverageManifest.js` — secret redacted satırı HÂLÂ mevcut olmalı (FX-P-64 izin verilen alanlar sadece boolean toggle'lar).

---

## Adım 10 · Tam regression — HER ŞEY BİRLİKTE

```bash
# Syntax (9 dosya)
for f in app.js sync.js sw.js panel/panel.js panel/panelCoverageManifest.js app/core/mediaFx.js app/core/timeTheme.js app/core/dateUtils.js app/core/helpers.js; do node --check "$f" || echo "SYNTAX FAIL: $f"; done

# Harness + tüm fixture'lar (exit kod toplama)
node .claude/skills/run-seyma/driver.mjs > /dev/null 2>&1; echo "driver exit=$?"
node .claude/skills/run-seyma/zikr-harness.mjs > /dev/null 2>&1; echo "zikr exit=$?"
for f in tests/app/*.js tests/panel/*.js tests/panel-v2/*.js tests/quran/*.js tests/reminders/*.js; do
  node "$f" > /dev/null 2>&1 || echo "REGRESSION FAIL: $f"
done
echo 'REGRESSION TAMAM'
```

**Başarı ölçütü:** Sıfır `FAIL` satırı. (13 app + 23 panel + 27 panel-v2 + quran + reminders fixture'ı.)

---

## Adım 11 · Demo sayfası (ses deneme) — kullanıcı yüzeyi

```bash
# Sadece dosya varlığı + yapı sağlamlığı (sayfa AÇILMAZ — S4 kuralı)
test -f premium-fx-plan/assets/ses-deneme.html && echo 'demo mevcut'
grep -c 'cloudTtsSpeak' premium-fx-plan/assets/ses-deneme.html   # ≥ 1
grep -c 'seyma_fx_demo_key' premium-fx-plan/assets/ses-deneme.html # ≥ 2 (kalıcı anahtar)
grep -c "voiceLocalFallback" app.js | head -1                     # migrate + voice guard
```

---

## Adım 12 · Anti-amnesia tutarlılığı

```bash
python3 - << 'EOF'
import json
st=json.load(open('premium-fx-plan/.anti-amnesia/FX-PROMPT-STATE.json'))
print('durum:', st)
assert st['lastCompletedPrompt'] in ('FX-P-65','FX-P-66','FX-P-67'), 'durum makinesi Faz 6 sonrası değil'
assert st['activePrompt'] in (None,'FX-P-70'), 'aktif prompt beklenmedik'
EOF
grep -c 'FX-P-5[2-8]\|FX-P-6[1-5]' premium-fx-plan/.anti-amnesia/LEDGER.md   # ≥ 13 ledger satırı
grep -c 'Dalga 6 Ayarlar' premium-fx-plan/deliverables/REVIEW-CHECKLIST.md   # 1 (Faz 6 kapanış bölümü)
```

CURRENT-STATE.md "Devam Eden" bölümü Faz 6 tamamlandı durumunu yansıtmalı.

---

## Nihai Karar Formatı

`premium-fx-plan/deliverables/FX-VERIFY-RAPOR.md` dosyasına şu tabloyu yaz:

```markdown
# FX-VERIFY RAPOR — <tarih>

| Dalga | Prompt aralığı | Kanıt | Sonuç |
|-------|----------------|-------|-------|
| −1 | FX-P-01…04 | Adım 2 çıktısı | ✅/❌ |
| 0 | FX-P-05…06 | Adım 3 | ✅/❌ |
| 1 | FX-P-11…16 | Adım 4 | ✅/❌ |
| 2 | FX-P-21…24 | Adım 5 | ✅/❌ |
| 3 | FX-P-31…38 | Adım 6 | ✅/❌ |
| 4 | FX-P-41…44 | Adım 7 | ✅/❌ |
| 5 | FX-P-51…58 | Adım 8 | ✅/❌ |
| 6 | FX-P-61…65 | Adım 9 | ✅/❌ |
| Değişmezler I1–I6 | — | Adım 1 | ✅/❌ |
| Tam regression | — | Adım 10 | ✅/❌ |

**NİHAİ:** <DEPLOY-A-HAZIR / BLOKE: <neden>>
```

## Rollback

Denetim salt-okurdur; `git checkout -- .` yalnız rapor dışı yanlışlıkla değişiklik olursa.

## Handoff Notu

PASS ise Dalga 7 (FX-P-71: test envanteri, FX-P-72: cache-bump, FX-P-73: handoff, FX-P-74: deploy öncesi değerlendirme) başlayabilir. FAIL varsa ilgili dalgaya ait prompt tekrar çalıştırılır.