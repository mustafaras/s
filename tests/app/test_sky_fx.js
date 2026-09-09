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

// === SKY test bloğu buraya eklenir (yeni kartlar bu satırın ÜSTÜNE ekler) ===

console.log('\n' + (fail === 0 ? 'SKY FIXTURE PASS' : 'SKY FIXTURE FAIL') + ': ' + pass + ' geçti, ' + fail + ' düştü');
process.exit(fail === 0 ? 0 : 1);