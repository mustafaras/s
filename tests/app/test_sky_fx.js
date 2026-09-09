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

// === SKY test bloğu buraya eklenir (yeni kartlar bu satırın ÜSTÜNE ekler) ===

console.log('\n' + (fail === 0 ? 'SKY FIXTURE PASS' : 'SKY FIXTURE FAIL') + ': ' + pass + ' geçti, ' + fail + ' düştü');
process.exit(fail === 0 ? 0 : 1);