# SKY-08 — Kar

**Kart 8/15 · Faz 2 (Hava) · Dosya: `app/core/skyFx.js` + test bloğu**

> **Önce `SKY-00-ONBILGI.md` oku.** Bu kartta SADECE aşağıdaki iş var.
> Başka dosyaya dokunma. Karar gerekiyorsa DUR ve kullanıcıya sor.

---

## 1. AMAÇ

Yavaş, değişken boyutlu, sinüs savrulmalı kar taneleri.

**Neden:** eski CSS 3 döşenmiş `radial-gradient` noktası kullanıyordu — hepsi aynı boyut ve hızda olduğu için puantiye gibi görünüyordu.

## 2. SAHNE SÖZLEŞMESİ

`sc.time` · `sc.weather` · `sc.isDay` · `sc.intensity` (0–1) · `sc.seed` (0–1)
· `sc.solar` (0–1) · `sc.wind` (km/sa). Ayrıntı: `SKY-04.md` §2.

## 3. NE YAPACAKSIN

### Adım 1 — kar parçacıklarını ekle

`function draw(` satırının **ÜSTÜNE** ekle:

```javascript
  // Kar: yavaş, DEĞİŞKEN boyutlu, sinüs savrulmalı. Aynı boyutta ve düz düşen
  // taneler "puantiye" gibi görünür — eski CSS'in hatası buydu.
  function newFlake(w, h, atTop){
    var d = 0.3 + Math.random() * 0.7;
    return { x: Math.random()*w, y: atTop ? -6 : Math.random()*h,
             d: d, r: 0.8 + d*2.0, sp: 0.35 + d*0.85,
             ph: Math.random()*Math.PI*2, amp: 6 + d*16 };
  }
  function ensureFlakes(sc, w, h){
    var inten = typeof sc.intensity === 'number' ? sc.intensity : 0.4;
    var want = (sc.weather === 'amb-wx-snow') ? Math.round(45 + 55*inten) : 0;
    var arr = S.flakes || (S.flakes = []);
    while (arr.length > want) arr.pop();
    while (arr.length < want) arr.push(newFlake(w, h, false));
    return arr;
  }
  function drawSnow(ctx, w, h, sc, t){
    var arr = ensureFlakes(sc, w, h);
    if (!arr.length) return;
    var windPx = Math.max(-0.4, Math.min(0.4, (sc.wind || 0) / 70));
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    for (var i = 0; i < arr.length; i++){
      var p = arr[i];
      p.y += p.sp;
      p.ph += 0.012 + p.d * 0.010;
      var sway = Math.sin(p.ph) * p.amp * 0.06;
      var x = p.x + sway + windPx * p.sp * 6;
      if (p.y > h + 4){ arr[i] = newFlake(w, h, true); continue; }
      ctx.globalAlpha = 0.35 + 0.5 * p.d;
      ctx.beginPath(); ctx.arc(x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
```

### Adım 2 — `draw()` içinden çağır

```javascript
    drawRain(ctx, w, h, sc, t);
    drawSnow(ctx, w, h, sc, t);
    // SKY-09 katmanı buraya eklenecek
```


### Son adım — teste blok ekle

`tests/app/test_sky_fx.js` içinde `// === SKY test bloğu buraya eklenir`
satırını bul, **ÜSTÜNE** ekle:

```javascript
/* SKY-08 — kar */
console.log('\n[SKY-08] kar');
{
  const s = makeEnv();
  s.Sky.mount(s.host, scene({ weather: 'amb-wx-snow', intensity: 0.7, time: 'amb-time-day' }));
  s.ctx.reset(); s.frames(1);
  const snowArcs = s.ctx.count('arc');

  const c = makeEnv();
  c.Sky.mount(c.host, scene({ weather: 'amb-wx-clear', time: 'amb-time-day' }));
  c.ctx.reset(); c.frames(1);

  ok('karda çok sayıda tane çiziliyor', snowArcs >= c.ctx.count('arc') + 40);
  ok('kar taneleri değişken yarıçapta', (function(){
    const rs = s.ctx.calls.filter(x => x.fn === 'arc').map(x => x.args[2]);
    return new Set(rs.map(v => Math.round(v * 10))).size >= 8;
  })());
}
{
  const e = makeEnv();
  e.Sky.mount(e.host, scene({ weather: 'amb-wx-snow', intensity: 0.6 }));
  e.ctx.reset(); e.frames(1);
  const x1 = e.ctx.calls.filter(c => c.fn === 'arc').map(c => c.args[0].toFixed(2));
  e.ctx.reset(); e.frames(1);
  const x2 = e.ctx.calls.filter(c => c.fn === 'arc').map(c => c.args[0].toFixed(2));
  ok('taneler yatayda savruluyor (sinüs)', JSON.stringify(x1) !== JSON.stringify(x2));
}

```

## 4. DOĞRULAMA

```bash
node --check app/core/skyFx.js
node tests/app/test_sky_fx.js
for t in tests/app/*.js; do node "$t" >/dev/null 2>&1 || echo "FAIL $t"; done
```

**Beklenen:** `SKY FIXTURE PASS: 34 geçti, 0 düştü` · başka FAIL yok

## 5. DUR VE SOR

- "değişken yarıçap" düşerse: `p.r` hesabında `d` çarpanını kullanmıyorsun demektir.
- "savruluyor" düşerse: `p.ph` güncellemesini atlamışsın.

## 6. BİTİRME

```bash
git add app/core/skyFx.js tests/app/test_sky_fx.js
git commit -m "sky: SKY-08 degisken boyutlu, sinus savrulmali kar

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

`SKY-STATE.json` → `"SKY-08": "done"`
