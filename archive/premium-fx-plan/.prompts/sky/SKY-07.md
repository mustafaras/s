# SKY-07 — Yağmur ve çisenti

**Kart 7/15 · Faz 2 (Hava) · Dosya: `app/core/skyFx.js` + test bloğu**

> **Önce `SKY-00-ONBILGI.md` oku.** Bu kartta SADECE aşağıdaki iş var.
> Başka dosyaya dokunma. Karar gerekiyorsa DUR ve kullanıcıya sor.

---

## 1. AMAÇ

Derinlik tabanlı damla havuzu: her damlanın hızı, boyu ve opaklığı derinliğinden türer. Rüzgâr açısı `sc.wind`den gelir; yakın damlalar yere çarpınca sıçrar.

**Neden:** eski CSS `repeating-linear-gradient` çizgileri tek hız/tek açı olduğu için diyagonal şerit gibi görünüyordu.

## 2. SAHNE SÖZLEŞMESİ

`sc.time` · `sc.weather` · `sc.isDay` · `sc.intensity` (0–1) · `sc.seed` (0–1)
· `sc.solar` (0–1) · `sc.wind` (km/sa). Ayrıntı: `SKY-04.md` §2.

## 3. NE YAPACAKSIN

### Adım 1 — yağmur parçacıklarını ekle

`function draw(` satırının **ÜSTÜNE** ekle:

```javascript
  // Damla havuzu. Her damlanın DERİNLİĞİ (d) var: hız, boy ve opaklık ondan
  // türer — hepsi aynı hızda düşerse şerit gibi görünür (eski CSS'in hatası).
  function newDrop(w, h, atTop){
    var d = 0.35 + Math.random() * 0.65;
    return { x: Math.random()*w*1.25 - w*0.15,
             y: atTop ? -10 : Math.random()*h,
             d: d, len: 6 + d*14, sp: 2.2 + d*5.2 };
  }
  function ensureDrops(sc, w, h){
    var wx = sc.weather, inten = typeof sc.intensity === 'number' ? sc.intensity : 0.4;
    var want = 0;
    if (wx === 'amb-wx-rain' || wx === 'amb-wx-storm') want = Math.round(70 + 90*inten);
    else if (wx === 'amb-wx-drizzle') want = Math.round(26 + 26*inten);
    var arr = S.drops || (S.drops = []);
    while (arr.length > want) arr.pop();
    while (arr.length < want) arr.push(newDrop(w, h, false));
    return arr;
  }
  function drawRain(ctx, w, h, sc, t){
    var arr = ensureDrops(sc, w, h);
    if (!arr.length) return;
    var windPx = Math.max(-0.5, Math.min(0.5, (sc.wind || 0) / 60));
    var storm = (sc.weather === 'amb-wx-storm');
    ctx.save();
    ctx.lineCap = 'round';
    for (var i = 0; i < arr.length; i++){
      var p = arr[i];
      p.y += p.sp * (storm ? 1.35 : 1);
      p.x += windPx * p.sp * 2.4;
      if (p.y > h){
        if (p.d > 0.75){                       // yakın damlalar sıçrar
          ctx.globalAlpha = 0.18 * p.d;
          ctx.strokeStyle = '#DCEBFF'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(p.x, h - 1, 2.2, Math.PI, 0); ctx.stroke();
        }
        arr[i] = newDrop(w, h, true);
        continue;
      }
      ctx.globalAlpha = 0.16 + 0.42 * p.d;
      ctx.strokeStyle = storm ? '#CFE0F8' : '#DCE9FB';
      ctx.lineWidth = 0.7 + p.d * 0.9;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - windPx * p.len * 2.2, p.y - p.len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
```

### Adım 2 — `draw()` içinden çağır

Yağış bulutların **ÜSTÜNDE**:

```javascript
    drawClouds(ctx, w, h, sc, t);
    drawRain(ctx, w, h, sc, t);
    // SKY-08..09 katmanları buraya eklenecek
```


### Son adım — teste blok ekle

`tests/app/test_sky_fx.js` içinde `// === SKY test bloğu buraya eklenir`
satırını bul, **ÜSTÜNE** ekle:

```javascript
/* SKY-07 — yağmur ve çisenti */
console.log('\n[SKY-07] yağmur ve çisenti');
{
  const r = makeEnv();
  r.Sky.mount(r.host, scene({ weather: 'amb-wx-rain', intensity: 0.8, wind: 20 }));
  r.ctx.reset(); r.frames(1);
  const rainLines = r.ctx.count('lineTo');

  const c = makeEnv();
  c.Sky.mount(c.host, scene({ weather: 'amb-wx-clear' }));
  c.ctx.reset(); c.frames(1);

  const d = makeEnv();
  d.Sky.mount(d.host, scene({ weather: 'amb-wx-drizzle', intensity: 0.3 }));
  d.ctx.reset(); d.frames(1);
  const drizLines = d.ctx.count('lineTo');

  ok('yağmurda çok sayıda damla çizgisi', rainLines >= 100);
  ok('açık havada damla yok', c.ctx.count('lineTo') === 0);
  ok('çisenti yağmurdan seyrek', drizLines > 0 && drizLines < rainLines);
}
{
  const e = makeEnv();
  e.Sky.mount(e.host, scene({ weather: 'amb-wx-rain', intensity: 0.6 }));
  e.ctx.reset(); e.frames(1);
  const y1 = e.ctx.calls.filter(c => c.fn === 'moveTo').map(c => Math.round(c.args[1]));
  e.ctx.reset(); e.frames(1);
  const y2 = e.ctx.calls.filter(c => c.fn === 'moveTo').map(c => Math.round(c.args[1]));
  ok('damlalar kareler arası düşüyor', JSON.stringify(y1) !== JSON.stringify(y2));
}

```

## 4. DOĞRULAMA

```bash
node --check app/core/skyFx.js
node tests/app/test_sky_fx.js
for t in tests/app/*.js; do node "$t" >/dev/null 2>&1 || echo "FAIL $t"; done
```

**Beklenen:** `SKY FIXTURE PASS: 31 geçti, 0 düştü` · başka FAIL yok

## 5. DUR VE SOR

- `lineTo >= 100` düşerse: `ensureDrops` içindeki `want` hesabını kontrol et.
- "kareler arası düşüyor" düşerse: `p.y += p.sp` satırını atlamış olabilirsin.

## 6. BİTİRME

```bash
git add app/core/skyFx.js tests/app/test_sky_fx.js
git commit -m "sky: SKY-07 derinlik tabanli yagmur + ruzgar acisi + sicrama

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

`SKY-STATE.json` → `"SKY-07": "done"`
