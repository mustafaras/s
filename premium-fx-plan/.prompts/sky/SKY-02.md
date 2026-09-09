# SKY-02 — Modül iskeleti + kayıt + gating

**Kart 2/15 · Faz 0 · Yeni dosya + 1 satır `index.html` · Kod TAM VERİLDİ**

> **Önce `SKY-00-ONBILGI.md` oku.** Bu kartta SADECE aşağıdaki iş var.
> Başka hiçbir dosyaya dokunma. Karar gerekiyorsa DUR ve kullanıcıya sor.

---

## 1. AMAÇ

`app/core/skyFx.js` modülünü oluştur, `index.html`'e kaydet. Bu kart
**hiçbir şey çizmez** — yalnız canvas'ı kurar ve gating'i doğru yapar.

## 2. DOSYALAR

1. `app/core/skyFx.js` — **yeni dosya**
2. `index.html` — **tek satır** ekleme + tek `?v=` bump

## 3. NE YAPACAKSIN

### Adım 1 — modülü oluştur

`app/core/skyFx.js` dosyasını oluştur, aşağıdaki kodu **birebir** yapıştır.

### Adım 2 — `index.html`'e kaydet

`index.html` içinde `app/core/timeTheme.js` satırını bul. **Hemen ALTINA**
şu satırı ekle (girintiyi eşleştir):

```html
<script src="app/core/skyFx.js?v=20260909a"></script>
```

> `skyFx.js`, `app.js`'den **ÖNCE** yüklenmeli. `timeTheme.js` zaten
> app.js'den önce olduğu için altına eklemek doğrudur.

### Adım 3 — doğrula

## 4. KOD (birebir kopyala)

```javascript
(function(){
  'use strict';
  function settings(){ try{ return (window.SeymaState&&window.SeymaState.data&&window.SeymaState.data.settings)||{}; }catch(e){ return {}; } }
  function premiumOn(){ return !!settings().premiumAtmosphere; }
  function reducedMotion(){
    try{ return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
    catch(e){ return false; }
  }
  var S = { canvas:null, ctx:null, host:null, scene:null, running:false, raf:0, dpr:1, w:0, h:0 };

  function mount(host, scene){
    if(!host || !premiumOn()) return false;
    S.host = host; S.scene = scene || S.scene;
    var cv = (host.querySelector && host.querySelector('canvas')) || null;
    if(!cv){
      cv = document.createElement('canvas');
      cv.className = 'sey-hdr-canvas';
      cv.style.position='absolute'; cv.style.inset='0';
      cv.style.width='100%'; cv.style.height='100%';
      cv.style.pointerEvents='none';
      host.appendChild(cv);
    }
    S.canvas = cv;
    S.ctx = cv.getContext ? cv.getContext('2d') : null;
    if(!S.ctx) return false;
    resize();
    return true;
  }
  function resize(){
    if(!S.canvas || !S.host) return;
    var r = S.host.getBoundingClientRect ? S.host.getBoundingClientRect() : {width:0,height:0};
    S.dpr = Math.min(window.devicePixelRatio||1, 2);
    S.w = Math.max(1, Math.round(r.width)); S.h = Math.max(1, Math.round(r.height));
    S.canvas.width = Math.round(S.w*S.dpr); S.canvas.height = Math.round(S.h*S.dpr);
  }
  function update(scene){ if(scene) S.scene = scene; return true; }
  function pause(){ S.running=false; return true; }
  function resume(){ if(reducedMotion()) return false; S.running=true; return true; }
  function unmount(){
    S.running=false;
    if(S.canvas && S.canvas.remove) { try{ S.canvas.remove(); }catch(e){} }
    S.canvas=null; S.ctx=null; S.host=null;
    return true;
  }
  window.SeySkyFx = { mount:mount, update:update, pause:pause, resume:resume, unmount:unmount, _state:S };
})();
```

## 5. DOĞRULAMA

```bash
node --check app/core/skyFx.js
node tests/app/test_sky_fx.js
grep -c 'app/core/skyFx.js' index.html
grep -c '<script src="app.js' index.html
node .claude/skills/run-seyma/driver.mjs 2>&1 | grep -c '^FAIL'
```

**Beklenen:**
- `test_sky_fx.js` → `SKY FIXTURE PASS: 10 geçti, 0 düştü`
- `grep -c skyFx` → `1`
- `grep -c app.js script` → `1`
- driver → `0`

## 6. DUR VE SOR

- driver `0` değilse: DUR. `index.html` satırını yanlış yere koymuş olabilirsin.
- `10 geçti` değilse: DUR, kodu kartla karşılaştır.

## 7. BİTİRME

```bash
git add app/core/skyFx.js index.html
git commit -m "sky: SKY-02 skyFx modul iskeleti + index.html kaydi

Canvas host kurulumu, DPR olcegi, premium gating. Henuz cizim yok.
Dogrulama: test_sky_fx 10/10 PASS, driver 0 FAIL.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

`SKY-STATE.json` → `"SKY-02": "done"`
