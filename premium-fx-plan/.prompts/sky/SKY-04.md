# SKY-04 — Güneş / ay diski + halo

**Kart 4/15 · Faz 1 (Gök cisimleri) · Dosya: `app/core/skyFx.js` + test bloğu**

> **Önce `SKY-00-ONBILGI.md` oku.** Bu kartta SADECE aşağıdaki iş var.
> Başka dosyaya dokunma. Karar gerekiyorsa DUR ve kullanıcıya sor.

---

## 1. AMAÇ

Header yayıyla aynı Bézier eğrisi üzerinde konumlanan bir güneş (gündüz) veya ay (gece) diski çiz; etrafına yumuşak atmosferik halo ekle.

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

### Adım 1 — yardımcı ve çizim fonksiyonunu ekle

`function draw(` satırının **ÜSTÜNE** ekle:

```javascript
  // 0–1 kesirli parça (deterministik gürültü için).
  function frac(v){ return v - Math.floor(v); }
  // Güneş/ay: header yayıyla AYNI Bézier üzerinde konumlanır.
  function drawCelestial(ctx, w, h, sc, t){
    var p = Math.max(0, Math.min(1, typeof sc.solar === 'number' ? sc.solar : 0.5));
    var night = (sc.time === 'amb-time-night');
    var mt = 1 - p;
    var x = mt*mt*(0.06*w) + 2*mt*p*(0.50*w) + p*p*(0.94*w);
    var y = mt*mt*(0.86*h) + 2*mt*p*(-0.05*h) + p*p*(0.86*h);
    var r = night ? h*0.075 : h*0.095;
    ctx.save();
    var g = ctx.createRadialGradient(x, y, 0, x, y, r*3.4);
    g.addColorStop(0, night ? 'rgba(206,222,252,0.50)' : 'rgba(255,224,150,0.62)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r*3.4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = night ? '#E9EFFC' : '#FFEBAE';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
```

### Adım 2 — `draw()` içinden çağır

`draw()` içindeki `// SKY-04..09 katmanları buraya eklenecek` yorumunu bul,
onun yerine yaz:

```javascript
    drawCelestial(ctx, w, h, sc, t);
    // SKY-05..09 katmanları buraya eklenecek
```


### Son adım — teste blok ekle

`tests/app/test_sky_fx.js` içinde `// === SKY test bloğu buraya eklenir`
satırını bul, **ÜSTÜNE** ekle:

```javascript
/* SKY-04 — gök cismi */
console.log('\n[SKY-04] gök cismi');
{
  const e = makeEnv();
  e.Sky.mount(e.host, scene({ solar: 0.5 }));
  e.ctx.reset(); e.frames(1);
  ok('gündüz: disk + halo çiziliyor (>=2 arc)', e.ctx.count('arc') >= 2);
  ok('radyal gradient kullanılıyor', e.ctx.count('fill') >= 2);
}
{
  const e = makeEnv();
  e.Sky.mount(e.host, scene({ time: 'amb-time-night', isDay: false, solar: 0.1 }));
  e.ctx.reset(); e.frames(1);
  ok('gece: ay diski de çiziliyor', e.ctx.count('arc') >= 2);
}

```

## 4. DOĞRULAMA

```bash
node --check app/core/skyFx.js
node tests/app/test_sky_fx.js
for t in tests/app/*.js; do node "$t" >/dev/null 2>&1 || echo "FAIL $t"; done
```

**Beklenen:** `SKY FIXTURE PASS: 22 geçti, 0 düştü` · başka FAIL yok

## 5. DUR VE SOR

- Test `22 geçti` demiyorsa: `draw()` içinden `drawCelestial` çağrısını eklemeyi unutmuş olabilirsin.
- `arc` sayısı 0 ise: `draw()` gövdesindeki yorumu gerçekten değiştirdin mi?

## 6. BİTİRME

```bash
git add app/core/skyFx.js tests/app/test_sky_fx.js
git commit -m "sky: SKY-04 gunes/ay diski + atmosferik halo

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

`SKY-STATE.json` → `"SKY-04": "done"`
