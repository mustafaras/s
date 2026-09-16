# SKY-06 — Bulut katmanı (2 parallax düzlem)

**Kart 6/15 · Faz 2 (Hava) · Dosya: `app/core/skyFx.js` + test bloğu**

> **Önce `SKY-00-ONBILGI.md` oku.** Bu kartta SADECE aşağıdaki iş var.
> Başka dosyaya dokunma. Karar gerekiyorsa DUR ve kullanıcıya sor.

---

## 1. AMAÇ

Bulutlu/yağışlı sahnelerde iki parallax düzlemde hacimli bulut çiz. Her bulut üst üste binen 5 elipsten oluşur — tek blob değil, kenarı organik.

## 2. SAHNE SÖZLEŞMESİ (tüm çizim kartlarında aynı)

`draw()` fonksiyonuna gelen `sc` nesnesi:

| Alan | Tip | Örnek |
|---|---|---|
| `sc.time` | string | `'amb-time-dawn'` \| `'amb-time-day'` \| `'amb-time-dusk'` \| `'amb-time-night'` |
| `sc.weather` | string | `'amb-wx-clear'` \| `cloud` \| `fog` \| `drizzle` \| `rain` \| `snow` \| `storm` \| `none` |
| `sc.isDay` | boolean | `true` |
| `sc.intensity` | 0–1 | `0.5` (yağış/rüzgâr şiddeti) |
| `sc.seed` | 0–1 | `0.42` (gün içinde SABİT) |
| `sc.solar` | 0–1 | `0.5` (doğuş→batış ilerlemesi) |
| `sc.wind` | km/sa | `12` |

## 3. NE YAPACAKSIN

### Adım 1 — bulut katmanını ekle

`function draw(` satırının **ÜSTÜNE** ekle:

```javascript
  // İki parallax düzlemde hacimli bulut. Her bulut üst üste binen elipslerden
  // oluşur (tek blob DEĞİL) — kenarı organik görünsün.
  function cloudPuff(ctx, x, y, s, alpha, tint){
    ctx.globalAlpha = alpha;
    ctx.fillStyle = tint;
    var pts = [[0,0,1],[-0.62,0.12,0.72],[0.60,0.14,0.76],[-0.30,-0.24,0.66],[0.32,-0.20,0.62]];
    for (var i = 0; i < pts.length; i++){
      ctx.beginPath();
      ctx.arc(x + pts[i][0]*s, y + pts[i][1]*s, s*pts[i][2], 0, Math.PI*2);
      ctx.fill();
    }
  }
  function drawClouds(ctx, w, h, sc, t){
    var wx = sc.weather;
    if (wx !== 'amb-wx-cloud' && wx !== 'amb-wx-rain' && wx !== 'amb-wx-drizzle' &&
        wx !== 'amb-wx-storm' && wx !== 'amb-wx-snow') return;
    var night = (sc.time === 'amb-time-night');
    var storm = (wx === 'amb-wx-storm');
    var tint = storm ? (night ? '#2A2740' : '#6E6A86')
                     : (night ? '#3A4358' : '#E6EAF2');
    var seed = typeof sc.seed === 'number' ? sc.seed : 0.5;
    ctx.save();
    // uzak düzlem — yavaş, küçük, soluk
    var far = (t * 0.006) % (w + 260);
    for (var i = 0; i < 3; i++){
      var fx = ((far + i * (w / 2.4) + seed * 180) % (w + 260)) - 130;
      cloudPuff(ctx, fx, h * (0.26 + 0.06 * frac(seed * (i + 3))), h * 0.17, 0.30, tint);
    }
    // yakın düzlem — hızlı, büyük, belirgin
    var near = (t * 0.014) % (w + 340);
    for (var j = 0; j < 2; j++){
      var nx = ((near + j * (w / 1.5) + seed * 90) % (w + 340)) - 170;
      cloudPuff(ctx, nx, h * (0.40 + 0.08 * frac(seed * (j + 7))), h * 0.25, 0.46, tint);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
```

### Adım 2 — `draw()` içinden çağır

Bulutlar gök cisminin **ÜSTÜNDE**, yağıştan **ÖNCE**:

```javascript
    drawStars(ctx, w, h, sc, t);
    drawCelestial(ctx, w, h, sc, t);
    drawClouds(ctx, w, h, sc, t);
    // SKY-07..09 katmanları buraya eklenecek
```


### Son adım — teste blok ekle

`tests/app/test_sky_fx.js` içinde `// === SKY test bloğu buraya eklenir`
satırını bul, **ÜSTÜNE** ekle:

```javascript
/* SKY-06 — bulut katmanı */
console.log('\n[SKY-06] bulut katmanı');
{
  const cl = makeEnv();
  cl.Sky.mount(cl.host, scene({ weather: 'amb-wx-clear' }));
  cl.ctx.reset(); cl.frames(1);
  const clearArc = cl.ctx.count('arc');

  const cd = makeEnv();
  cd.Sky.mount(cd.host, scene({ weather: 'amb-wx-cloud' }));
  cd.ctx.reset(); cd.frames(1);
  const cloudArc = cd.ctx.count('arc');

  ok('bulutlu sahne 5 düzlemde puf çiziyor (>=25 arc fark)', cloudArc >= clearArc + 25);
  ok('açık havada bulut çizilmiyor', clearArc < 10);
}
{
  const e = makeEnv();
  e.Sky.mount(e.host, scene({ weather: 'amb-wx-cloud' }));
  e.ctx.reset(); e.frames(1);
  const f1 = e.ctx.calls.filter(c => c.fn === 'arc').map(c => Math.round(c.args[0]));
  e.ctx.reset(); e.frames(1);
  const f2 = e.ctx.calls.filter(c => c.fn === 'arc').map(c => Math.round(c.args[0]));
  ok('bulutlar kareler arası HAREKET ediyor', JSON.stringify(f1) !== JSON.stringify(f2));
}

```

## 4. DOĞRULAMA

```bash
node --check app/core/skyFx.js
node tests/app/test_sky_fx.js
for t in tests/app/*.js; do node "$t" >/dev/null 2>&1 || echo "FAIL $t"; done
```

**Beklenen:** `SKY FIXTURE PASS: 27 geçti, 0 düştü` · başka FAIL yok

## 5. DUR VE SOR

- "kareler arası HAREKET ediyor" düşerse: `t` parametresini konum hesabında kullanmıyorsun demektir.
- Açık havada bulut çıkıyorsa: `wx` kontrol listesini gözden geçir.

## 6. BİTİRME

```bash
git add app/core/skyFx.js tests/app/test_sky_fx.js
git commit -m "sky: SKY-06 iki parallax duzlemde hacimli bulut

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

`SKY-STATE.json` → `"SKY-06": "done"`
