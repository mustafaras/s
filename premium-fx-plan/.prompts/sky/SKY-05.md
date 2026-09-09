# SKY-05 — Yıldız alanı (gece)

**Kart 5/15 · Faz 1 (Gök cisimleri) · Dosya: `app/core/skyFx.js` + test bloğu**

> **Önce `SKY-00-ONBILGI.md` oku.** Bu kartta SADECE aşağıdaki iş var.
> Başka dosyaya dokunma. Karar gerekiyorsa DUR ve kullanıcıya sor.

---

## 1. AMAÇ

Gece sahnesinde 46 yıldızlık deterministik bir alan çiz. Dağılım `sc.seed`den türer (gün içinde sabit, gün gün farklı), parıldama zamana bağlıdır.

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

### Adım 1 — yıldız alanını ekle

`function draw(` satırının **ÜSTÜNE** ekle:

```javascript
  // Yıldız alanı: yalnız gece. Dağılım sc.seed'den DETERMİNİSTİK üretilir —
  // gün içinde sabit, gün gün farklı. Parıldama zamana bağlı.
  function drawStars(ctx, w, h, sc, t){
    if (sc.time !== 'amb-time-night') return;
    var seed = typeof sc.seed === 'number' ? sc.seed : 0.5;
    var n = 46;
    ctx.save();
    for (var i = 1; i <= n; i++){
      var r1 = frac(Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453);
      var r2 = frac(Math.sin(i * 39.3468 + seed * 11.135) * 24634.6345);
      var x = r1 * w, y = r2 * h * 0.70;
      var tw = 0.55 + 0.45 * Math.sin(t / 680 + i);
      ctx.globalAlpha = (0.22 + 0.55 * r2) * tw;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(x, y, 0.6 + r1 * 1.0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
```

### Adım 2 — `draw()` içinden çağır

Yıldızlar gök cisminin **ALTINDA** kalmalı, yani ondan **ÖNCE** çizilir:

```javascript
    drawStars(ctx, w, h, sc, t);
    drawCelestial(ctx, w, h, sc, t);
    // SKY-06..09 katmanları buraya eklenecek
```


### Son adım — teste blok ekle

`tests/app/test_sky_fx.js` içinde `// === SKY test bloğu buraya eklenir`
satırını bul, **ÜSTÜNE** ekle:

```javascript
/* SKY-05 — yıldız alanı */
console.log('\n[SKY-05] yıldız alanı');
{
  const night = makeEnv();
  night.Sky.mount(night.host, scene({ time: 'amb-time-night', isDay: false, seed: 0.42 }));
  night.ctx.reset(); night.frames(1);
  const nArc = night.ctx.count('arc');

  const day = makeEnv();
  day.Sky.mount(day.host, scene({ time: 'amb-time-day', seed: 0.42 }));
  day.ctx.reset(); day.frames(1);
  const dArc = day.ctx.count('arc');

  ok('gece belirgin şekilde daha çok daire çiziyor (yıldızlar)', nArc >= dArc + 30);
  ok('gündüz yıldız çizilmiyor', dArc < 10);
}

```

## 4. DOĞRULAMA

```bash
node --check app/core/skyFx.js
node tests/app/test_sky_fx.js
for t in tests/app/*.js; do node "$t" >/dev/null 2>&1 || echo "FAIL $t"; done
```

**Beklenen:** `SKY FIXTURE PASS: 24 geçti, 0 düştü` · başka FAIL yok

## 5. DUR VE SOR

- `gece >= gündüz + 30` düşerse: yıldız sayısını veya `sc.time` kontrolünü gözden geçir.
- Gündüz yıldız çiziliyorsa: erken `return` koşulunu kontrol et.

## 6. BİTİRME

```bash
git add app/core/skyFx.js tests/app/test_sky_fx.js
git commit -m "sky: SKY-05 gece yildiz alani (deterministik seed)

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

`SKY-STATE.json` → `"SKY-05": "done"`
