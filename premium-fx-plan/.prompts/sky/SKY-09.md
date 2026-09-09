# SKY-09 — Sis bantları + fırtına şimşeği

**Kart 9/15 · Faz 2 (Hava) · Dosya: `app/core/skyFx.js` + test bloğu**

> **Önce `SKY-00-ONBILGI.md` oku.** Bu kartta SADECE aşağıdaki iş var.
> Başka dosyaya dokunma. Karar gerekiyorsa DUR ve kullanıcıya sor.

---

## 1. AMAÇ

Üç hızda yatay sis bandı (hacim hissi) ve **yönlü** şimşek patlaması.

**Neden:** eski sis tek düz katmandı; eski şimşek `filter:brightness()` ile tüm katmanı parlatıyordu — ışık kaynağı yoktu.

## 2. SAHNE SÖZLEŞMESİ

`sc.time` · `sc.weather` · `sc.isDay` · `sc.intensity` (0–1) · `sc.seed` (0–1)
· `sc.solar` (0–1) · `sc.wind` (km/sa). Ayrıntı: `SKY-04.md` §2.

## 3. NE YAPACAKSIN

### Adım 1 — sis bantları ve şimşeği ekle

`function draw(` satırının **ÜSTÜNE** ekle:

```javascript
  // Sis: 3 yatay bant, farklı hız ve opaklık → hacim hissi.
  function drawFog(ctx, w, h, sc, t){
    if (sc.weather !== 'amb-wx-fog') return;
    var night = (sc.time === 'amb-time-night');
    ctx.save();
    for (var i = 0; i < 3; i++){
      var speed = 0.004 + i * 0.0035;
      var off = ((t * speed) % (w + 300)) - 150;
      var by = h * (0.34 + i * 0.20);
      var bh = h * (0.16 + i * 0.05);
      var g = ctx.createLinearGradient(off, by, off + w * 0.9, by);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.5, night ? 'rgba(150,162,180,0.30)' : 'rgba(236,240,246,0.42)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 0.55 - i * 0.11;
      ctx.fillStyle = g;
      ctx.fillRect(off, by - bh / 2, w * 0.9, bh);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  // Şimşek: TÜM katmanı parlatan filtre DEĞİL — yönlü ışık patlaması.
  // Seyrek (>=30 sn) ve gecikmeli ikincil parlama (gök gürültüsü ritmi).
  function drawLightning(ctx, w, h, sc, t){
    if (sc.weather !== 'amb-wx-storm') return;
    var CYCLE = 31000;
    var ph = t % CYCLE;
    var a = 0;
    if (ph < 110) a = 1 - ph / 110;                 // ana çakış
    else if (ph > 320 && ph < 430) a = 0.42 * (1 - (ph - 320) / 110);  // ikincil
    if (a <= 0.01) return;
    var seed = typeof sc.seed === 'number' ? sc.seed : 0.5;
    var cx = w * (0.25 + 0.5 * seed);
    ctx.save();
    var g = ctx.createRadialGradient(cx, h * 0.12, 0, cx, h * 0.12, h * 1.15);
    g.addColorStop(0, 'rgba(226,236,255,' + (0.85 * a).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(226,236,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
```

### Adım 2 — `draw()` içinden çağır

Sis yağıştan sonra, şimşek en üstte:

```javascript
    drawSnow(ctx, w, h, sc, t);
    drawFog(ctx, w, h, sc, t);
    drawLightning(ctx, w, h, sc, t);
```

(`// SKY-09 katmanı buraya eklenecek` yorumunu sil.)


### Son adım — teste blok ekle

`tests/app/test_sky_fx.js` içinde `// === SKY test bloğu buraya eklenir`
satırını bul, **ÜSTÜNE** ekle:

```javascript
/* SKY-09 — sis ve şimşek */
console.log('\n[SKY-09] sis ve şimşek');
{
  const f = makeEnv();
  f.Sky.mount(f.host, scene({ weather: 'amb-wx-fog' }));
  f.ctx.reset(); f.frames(1);
  ok('sis 3 bant çiziyor', f.ctx.count('fillRect') >= 3);

  const c = makeEnv();
  c.Sky.mount(c.host, scene({ weather: 'amb-wx-clear' }));
  c.ctx.reset(); c.frames(1);
  ok('açık havada sis yok', c.ctx.count('fillRect') === 0);
}
{
  const e = makeEnv();
  e.Sky.mount(e.host, scene({ weather: 'amb-wx-storm', seed: 0.42 }));
  let flashFrames = 0, quietFrames = 0;
  for (let i = 0; i < 260; i++){         // ~4,2 sn
    e.ctx.reset(); e.frames(1);
    if (e.ctx.count('fillRect') > 0) flashFrames++; else quietFrames++;
  }
  ok('şimşek SEYREK (kare çoğunluğu sakin)', quietFrames > flashFrames * 8);
  ok('brightness filtresi kullanılmıyor', CODE.indexOf("filter") === -1 || CODE.indexOf('brightness') === -1);
}

```

## 4. DOĞRULAMA

```bash
node --check app/core/skyFx.js
node tests/app/test_sky_fx.js
for t in tests/app/*.js; do node "$t" >/dev/null 2>&1 || echo "FAIL $t"; done
```

**Beklenen:** `SKY FIXTURE PASS: 38 geçti, 0 düştü` · başka FAIL yok

## 5. DUR VE SOR

- "şimşek SEYREK" düşerse: `CYCLE` değerini küçültmüş olabilirsin, 31000 ms bırak.
- "brightness kullanılmıyor" düşerse: `ctx.filter` ile parlaklık ayarlamışsın — radyal gradient kullan.

## 6. BİTİRME

```bash
git add app/core/skyFx.js tests/app/test_sky_fx.js
git commit -m "sky: SKY-09 uc hizda sis bandi + yonlu simsek patlamasi

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

`SKY-STATE.json` → `"SKY-09": "done"`
