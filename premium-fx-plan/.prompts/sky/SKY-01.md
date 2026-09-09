# SKY-01 — Test fixture'ı (güvenlik ağı)

**Kart 1/15 · Faz 0 · Yeni dosya · Kod TAM VERİLDİ, sadece kopyala**

> **Önce `SKY-00-ONBILGI.md` oku.** Bu kartta SADECE aşağıdaki iş var.
> Başka hiçbir dosyaya dokunma. Karar gerekiyorsa DUR ve kullanıcıya sor.

---

## 1. AMAÇ

Sonraki tüm kartların doğrulanabilmesi için, çizim çağrılarını **kaydeden**
sahte bir canvas context ile çalışan ağsız bir test dosyası oluştur.

Bu fixture sayesinde "yağmur çizildi mi?" sorusu beğeni değil, **sayılabilir**
bir sinyal olur. Sonraki her kart buraya kendi assert bloğunu ekleyecek.

## 2. DOSYA

`tests/app/test_sky_fx.js` — **yeni dosya**. Başka dosyaya dokunma.

## 3. NE YAPACAKSIN

1. `tests/app/test_sky_fx.js` dosyasını oluştur.
2. Aşağıdaki kodu **birebir, hiçbir şey değiştirmeden** içine yapıştır.
3. Doğrulama komutlarını çalıştır.

> Bu kod test edilmiştir: modül yokken `SKIP` yazıp `exit 0` döner,
> modül geldiğinde 10 assert'i geçer. **Kodu "iyileştirmeye" çalışma.**

## 4. KOD (birebir kopyala)

```javascript
/* tests/app/test_sky_fx.js
 * SKY serisi sözleşmesi — header canvas gökyüzü motoru.
 * Ağsız, tarayıcısız: node:vm içinde, çizim çağrılarını KAYDEDEN sahte 2D
 * context ile app/core/skyFx.js yüklenir. "Yağmur çizildi mi?" sorusu
 * beğeni değil, sayılabilir bir sinyaldir.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const MODULE_PATH = path.join(__dirname, '..', '..', 'app', 'core', 'skyFx.js');

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name); }
}

if (!fs.existsSync(MODULE_PATH)) {
  console.log('SKIP app/core/skyFx.js henüz yok — SKY-02 bekleniyor.');
  process.exit(0);
}
const SRC = fs.readFileSync(MODULE_PATH, 'utf8');
/* Yorumları söküp tarama yap: bir YORUMDA 'setInterval' yazmak testi
   düşürmemeli. (Projede bu tuzağa daha önce düşüldü — bkz. SKY-00 §5.) */
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');

/* ---- sahte 2D context: her çizim çağrısını kaydeder ---- */
function makeCtx() {
  const calls = [];
  const rec = (n) => function () { calls.push({ fn: n, args: Array.prototype.slice.call(arguments) }); };
  const grad = { addColorStop: function () {} };
  const ctx = {
    calls: calls,
    count: function (fn) { let c = 0; for (let i = 0; i < calls.length; i++) if (calls[i].fn === fn) c++; return c; },
    reset: function () { calls.length = 0; },
    canvas: { width: 828, height: 340 },
    save: rec('save'), restore: rec('restore'),
    beginPath: rec('beginPath'), closePath: rec('closePath'),
    moveTo: rec('moveTo'), lineTo: rec('lineTo'), quadraticCurveTo: rec('quadraticCurveTo'),
    bezierCurveTo: rec('bezierCurveTo'),
    arc: rec('arc'), ellipse: rec('ellipse'), rect: rec('rect'),
    fill: rec('fill'), stroke: rec('stroke'),
    fillRect: rec('fillRect'), clearRect: rec('clearRect'), strokeRect: rec('strokeRect'),
    translate: rec('translate'), rotate: rec('rotate'), scale: rec('scale'),
    setTransform: rec('setTransform'), resetTransform: rec('resetTransform'),
    drawImage: rec('drawImage'),
    createLinearGradient: function () { return grad; },
    createRadialGradient: function () { return grad; }
  };
  ['fillStyle','strokeStyle','globalAlpha','lineWidth','lineCap','lineJoin',
   'filter','globalCompositeOperation','shadowBlur','shadowColor','font'].forEach(function (k) { ctx[k] = ''; });
  return ctx;
}

function makeEl(ctx) {
  return {
    tagName: 'DIV', className: '', style: {}, width: 0, height: 0, children: [],
    getContext: function () { return ctx; },
    getBoundingClientRect: function () { return { width: 414, height: 170, left: 0, top: 0, right: 414, bottom: 170 }; },
    appendChild: function (c) { this.children.push(c); c.parentNode = this; return c; },
    removeChild: function (c) { const i = this.children.indexOf(c); if (i > -1) this.children.splice(i, 1); return c; },
    remove: function () { if (this.parentNode) this.parentNode.removeChild(this); },
    querySelector: function () { return this.children.length ? this.children[0] : null; },
    setAttribute: function (k, v) { this[k] = v; },
    getAttribute: function (k) { return this[k] === undefined ? null : this[k]; },
    addEventListener: function () {}, removeEventListener: function () {}
  };
}

function makeEnv(opts) {
  opts = opts || {};
  const ctx = makeCtx();
  const rafQueue = [];
  let clock = 0;
  const host = makeEl(ctx);
  const win = {
    devicePixelRatio: 2, innerWidth: 414, innerHeight: 896,
    matchMedia: function (q) {
      return { matches: /prefers-reduced-motion/.test(q) ? !!opts.reducedMotion : false,
               media: q, addEventListener: function () {}, removeEventListener: function () {},
               addListener: function () {}, removeListener: function () {} };
    },
    requestAnimationFrame: function (cb) { rafQueue.push(cb); return rafQueue.length; },
    cancelAnimationFrame: function () {},
    performance: { now: function () { return Date.now(); } },
    SeymaState: { data: { settings: { premiumAtmosphere: opts.premium !== false } } }
  };
  const doc = {
    hidden: !!opts.hidden,
    createElement: function (tag) { const e = makeEl(ctx); e.tagName = String(tag).toUpperCase(); return e; },
    addEventListener: function () {}, removeEventListener: function () {},
    getElementById: function () { return null; },
    querySelector: function () { return host; }
  };
  win.window = win; win.document = doc; win.console = console;
  const sandbox = vm.createContext(win);
  vm.runInContext(SRC, sandbox, { filename: 'skyFx.js' });
  return {
    win: win, doc: doc, ctx: ctx, host: host, Sky: win.SeySkyFx,
    frames: function (n) {
      n = n || 1;
      for (let i = 0; i < n; i++) {
        clock += 16;
        const q = rafQueue.splice(0, rafQueue.length);
        q.forEach(function (cb) { cb(clock); });
      }
    },
    pending: function () { return rafQueue.length; }
  };
}

function scene(over) {
  const s = { time: 'amb-time-day', weather: 'amb-wx-clear', season: 'amb-season-autumn',
              isDay: true, intensity: 0.5, seed: 0.42, solar: 0.5, wind: 12 };
  if (over) Object.keys(over).forEach(function (k) { s[k] = over[k]; });
  return s;
}

/* SKY-01 — modül yüzeyi ve gating */
console.log('\n[SKY-01] modül yüzeyi ve gating');
{
  const e = makeEnv();
  ok('window.SeySkyFx tanımlı', typeof e.Sky === 'object' && e.Sky !== null);
  ['mount', 'update', 'pause', 'resume', 'unmount'].forEach(function (m) {
    ok('SeySkyFx.' + m + ' fonksiyon', e.Sky && typeof e.Sky[m] === 'function');
  });
  ok('ağ çağrısı yok (fetch geçmiyor)', CODE.indexOf('fetch(') === -1);
  ok('zamanlayıcı yok (yalnız rAF)', CODE.indexOf('setInter' + 'val') === -1);
}
{
  const e = makeEnv({ premium: false });
  const r = e.Sky.mount(e.host, scene());
  ok('premiumAtmosphere kapalı → mount false döner', r === false);
  ok('premium kapalı → canvas eklenmez', e.host.children.length === 0);
}

// === SKY test bloğu buraya eklenir (yeni kartlar bu satırın ÜSTÜNE ekler) ===

console.log('\n' + (fail === 0 ? 'SKY FIXTURE PASS' : 'SKY FIXTURE FAIL') + ': ' + pass + ' geçti, ' + fail + ' düştü');
process.exit(fail === 0 ? 0 : 1);
```

## 5. DOĞRULAMA

```bash
node --check tests/app/test_sky_fx.js
node tests/app/test_sky_fx.js; echo "exit=$?"
```

**Beklenen çıktı:**
```
SKIP app/core/skyFx.js henüz yok — SKY-02 bekleniyor.
exit=0
```

Bu **doğru** sonuçtur. Modül henüz yok, test kendini atlıyor.

## 6. DUR VE SOR

- `node --check` hata verirse: kopyalama eksik olmuştur, tekrar yapıştır.
- `exit=1` görürsen: DUR, kopyaladığın kodu kartla karşılaştır.

## 7. BİTİRME

```bash
git add tests/app/test_sky_fx.js
git commit -m "sky: SKY-01 canvas gökyüzü motoru test fixture'ı

Cizim cagrilarini kaydeden sahte 2D context ile agsiz sozlesme testi.
Modul yokken SKIP + exit 0; SKY-02 ile yesile doner.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

`premium-fx-plan/.anti-amnesia/SKY-STATE.json` → `"SKY-01": "done"`
