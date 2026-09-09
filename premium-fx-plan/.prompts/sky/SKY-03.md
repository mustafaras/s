# SKY-03 — rAF döngüsü + duraklatma

**Kart 3/15 · Faz 0 · Tek dosya · ~50 satır**

> **Önce `SKY-00-ONBILGI.md` oku.** Bu kartta SADECE aşağıdaki iş var.
> Başka hiçbir dosyaya dokunma. Karar gerekiyorsa DUR ve kullanıcıya sor.

---

## 1. AMAÇ

Canvas'a bir `requestAnimationFrame` çizim döngüsü ekle. Bu kart hâlâ
görsel bir şey çizmez — yalnız her karede canvas'ı **temizler** ve
duraklatma kurallarını uygular.

## 2. DOSYA

`app/core/skyFx.js` — SADECE bu dosya.

## 3. NE YAPACAKSIN

### Adım 1 — döngü fonksiyonlarını ekle

`var S = {...}` satırının ALTINA, `function mount` satırının ÜSTÜNE ekle:

```javascript
  // Kare döngüsü. setInterval YASAK — yalnız rAF (SKY-00 §3 değişmezi).
  function frame(ts){
    if(!S.running || !S.ctx) return;
    S.last = ts || 0;
    draw(S.ctx, S.w, S.h, S.scene || {}, S.last);
    S.raf = window.requestAnimationFrame(frame);
  }
  // Tek kare çiz (reduced-motion veya duraklatma için).
  function drawOnce(){
    if(!S.ctx) return false;
    draw(S.ctx, S.w, S.h, S.scene || {}, S.last || 0);
    return true;
  }
  // Katman çizimi. Sonraki kartlar buraya katman EKLER.
  function draw(ctx, w, h, sc, t){
    ctx.clearRect(0, 0, S.canvas.width, S.canvas.height);
    ctx.save();
    ctx.scale(S.dpr, S.dpr);
    // SKY-04..09 katmanları buraya eklenecek
    ctx.restore();
  }
```

### Adım 2 — `mount` sonunu değiştir

`mount` içindeki `resize();` `return true;` satırlarını şununla değiştir:

```javascript
    resize();
    if(reducedMotion()){ drawOnce(); return true; }   // renk kalır, hareket durur
    resume();
    return true;
```

### Adım 3 — `resume` ve `pause`'u değiştir

```javascript
  function pause(){
    S.running = false;
    if(S.raf) { try{ window.cancelAnimationFrame(S.raf); }catch(e){} S.raf = 0; }
    return true;
  }
  function resume(){
    if(!S.ctx || reducedMotion()) return false;
    if(S.running) return true;
    S.running = true;
    S.raf = window.requestAnimationFrame(frame);
    return true;
  }
```

### Adım 4 — `S` nesnesine iki alan ekle

`var S = {` satırındaki nesneye `last:0` ekle (varsa atla).

### Adım 5 — sekme gizlenince duraklat

Dosyanın en altına, `window.SeySkyFx = {...}` satırının **ÜSTÜNE**:

```javascript
  if(typeof document !== 'undefined' && document.addEventListener){
    document.addEventListener('visibilitychange', function(){
      if(document.hidden) pause(); else resume();
    });
  }
```

### Adım 6 — teste blok ekle

`tests/app/test_sky_fx.js` içinde
`// === SKY test bloğu buraya eklenir` satırını bul, **ÜSTÜNE** ekle:

```javascript
/* SKY-03 — döngü ve duraklatma */
console.log('\n[SKY-03] döngü ve duraklatma');
{
  const e = makeEnv();
  ok('mount true döner', e.Sky.mount(e.host, scene()) === true);
  ok('canvas eklendi', e.host.children.length === 1);
  ok('mount sonrası rAF kuyruğa girdi', e.pending() >= 1);
  e.ctx.reset();
  e.frames(3);
  ok('her karede clearRect çağrılıyor', e.ctx.count('clearRect') >= 3);
  ok('DPR ölçeği uygulanıyor', e.ctx.count('scale') >= 3);
  e.Sky.pause();
  const before = e.ctx.count('clearRect');
  e.frames(3);
  ok('pause sonrası çizim durdu', e.ctx.count('clearRect') === before);
  ok('resume tekrar başlatıyor', e.Sky.resume() === true);
}
{
  const e = makeEnv({ reducedMotion: true });
  e.Sky.mount(e.host, scene());
  ok('reduced-motion → döngü başlamaz', e.pending() === 0);
  ok('reduced-motion → yine de tek kare çizildi', e.ctx.count('clearRect') >= 1);
}
```

## 4. DOĞRULAMA

```bash
node --check app/core/skyFx.js
node tests/app/test_sky_fx.js
grep -c 'setInterval' app/core/skyFx.js
```

**Beklenen:** `SKY FIXTURE PASS: 19 geçti, 0 düştü` · `setInterval` → `0`

## 5. DUR VE SOR

- `setInterval` sayısı 0 değilse: DUR, rAF kullan.
- Test `19 geçti` demiyorsa: hangi assert düştüğüne bak, kodu düzelt.
  **Testi değiştirme.**

## 6. BİTİRME

```bash
git add app/core/skyFx.js tests/app/test_sky_fx.js
git commit -m "sky: SKY-03 rAF cizim dongusu + duraklatma

Kare dongusu, DPR olcegi, visibilitychange duraklatmasi, reduced-motion
tek-kare yolu. Henuz gorsel katman yok.
Dogrulama: test_sky_fx 19/19 PASS.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

`SKY-STATE.json` → `"SKY-03": "done"`
