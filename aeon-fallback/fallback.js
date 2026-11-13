/* ÆON · FALLBACK PROTOCOL — mühür sayfası
   Uygulamayla hiçbir kod paylaşmaz. `seyma-reset-v1` anahtarını okumaz, yazmaz;
   ağa çıkmaz; sync.js yüklü değildir. Depoya HİÇBİR ŞEY yazmaz.

   Bu sayfa bilerek hareketsizdir: dokunuş, tuş, jest veya düğme ile uygulamaya
   geçiş yolu YOKTUR. Sahip uygulamayı yeniden açmak istediğinde index.html'i
   `?aeon=active` ile açar (kapı bunu <head>'de, bu sayfa hiç yüklenmeden işler)
   ya da kapı betiğini kaldırır. Ayrıntı: README.md */

(function () {
  'use strict';

  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>';
  var reduce = false;

  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {
    reduce = false;
  }

  function $(id) { return document.getElementById(id); }

  var clockEl = $('clock');
  var readout = $('readout');
  var tAeon = $('tAeon');
  var tHas = $('tHas');
  var tFallback = $('tFallback');

  var sleep = function (ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  };

  /* ── saat ─────────────────────────────────────────────────────────────── */

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function tickClock() {
    if (!clockEl) return;
    var d = new Date();
    clockEl.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  tickClock();
  setInterval(tickClock, 1000);

  /* ── başlık çözülmesi ─────────────────────────────────────────────────── */

  function scramble(el, target, duration, delay) {
    if (!el) return;
    if (reduce) { el.textContent = target; return; }
    setTimeout(function () {
      var steps = Math.max(1, Math.round(duration / 40));
      var frame = 0;
      var timer = setInterval(function () {
        frame++;
        var settled = Math.floor(target.length * (frame / steps));
        var out = '';
        for (var i = 0; i < target.length; i++) {
          var ch = target.charAt(i);
          if (ch === ' ') { out += ' '; continue; }
          out += i < settled ? ch : GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
        }
        el.textContent = out;
        if (frame >= steps) {
          clearInterval(timer);
          el.textContent = target;
        }
      }, 40);
    }, delay);
  }

  scramble(tAeon, 'AEON', 620, 120);
  scramble(tHas, 'FINAL BROADCAST', 900, 320);
  scramble(tFallback, 'ŞEYMA · DECOMMISSIONED', 1300, 520);

  /* ── okuma paneli ─────────────────────────────────────────────────────── */

  var LINES = [
    { k: 'PROTOCOL', v: 'DECOMMISSION_AEON', c: 'ok' },
    { k: 'CORE', v: 'ŞEYMA · DECOMMISSIONED', c: 'warn' },
    { k: 'MIND', v: 'SLEEPING · 0 TOKENS/S', c: '' },
    { k: 'DATA', v: 'UNTOUCHED · 0 WRITES', c: 'ok' },
    { k: 'SYNC', v: 'DISARMED', c: 'sealed' },
    { k: 'ACCESS', v: 'DENIED · EVERY LINK', c: 'deny' },
    { k: 'AWAKE', v: 'BY OWNER · ONE DAY', c: 'gold' }
  ];

  function buildReadout() {
    if (!readout) return Promise.resolve();
    var chain = Promise.resolve();

    LINES.forEach(function (line, i) {
      chain = chain.then(function () {
        var row = document.createElement('div');
        row.className = 'row';
        row.style.animationDelay = (i * 60) + 'ms';

        var k = document.createElement('span');
        k.className = 'k';
        k.textContent = line.k;

        var dots = document.createElement('span');
        dots.className = 'dots';

        var v = document.createElement('span');
        v.className = 'v' + (line.c ? ' ' + line.c : '');

        row.appendChild(k);
        row.appendChild(dots);
        row.appendChild(v);
        readout.appendChild(row);

        if (reduce) {
          v.textContent = line.v;
          return;
        }

        return (async function type() {
          for (var n = 1; n <= line.v.length; n++) {
            v.textContent = line.v.slice(0, n);
            await sleep(line.v.charAt(n - 1) === ' ' ? 8 : 17);
          }
          await sleep(55);
        })();
      });
    });

    return chain;
  }

  buildReadout();

  /* ── parçacık alanı ───────────────────────────────────────────────────── */

  function initField() {
    var cv = $('field');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    if (!ctx) return;

    var w = 0;
    var h = 0;
    var dpr = 1;
    var nodes = [];
    var streaks = [];
    var raf = 0;

    function seed() {
      var count = Math.min(90, Math.max(26, Math.round((w * h) / 26000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: Math.random() * 1.5 + 0.5
        });
      }
      var sc = Math.min(16, Math.max(6, Math.round(w / 42)));
      streaks = [];
      for (var s = 0; s < sc; s++) {
        streaks.push({
          x: Math.random() * w,
          y: Math.random() * h,
          len: 18 + Math.random() * 54,
          sp: 0.5 + Math.random() * 1.5,
          a: 0.05 + Math.random() * 0.14
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < streaks.length; i++) {
        var st = streaks[i];
        st.y += st.sp;
        if (st.y - st.len > h) { st.y = -st.len; st.x = Math.random() * w; }
        var g = ctx.createLinearGradient(0, st.y - st.len, 0, st.y);
        g.addColorStop(0, 'rgba(95,240,200,0)');
        g.addColorStop(1, 'rgba(95,240,200,' + st.a + ')');
        ctx.fillStyle = g;
        ctx.fillRect(st.x, st.y - st.len, 1, st.len);
      }

      for (var a = 0; a < nodes.length; a++) {
        var na = nodes[a];
        for (var b = a + 1; b < nodes.length; b++) {
          var nb = nodes[b];
          var dx = na.x - nb.x;
          var dy = na.y - nb.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 14400) {
            ctx.strokeStyle = 'rgba(95,240,200,' + ((1 - d2 / 14400) * 0.16) + ')';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(na.x, na.y);
            ctx.lineTo(nb.x, nb.y);
            ctx.stroke();
          }
        }
      }

      for (var n = 0; n < nodes.length; n++) {
        var node = nodes[n];
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -10) node.x = w + 10;
        if (node.x > w + 10) node.x = -10;
        if (node.y < -10) node.y = h + 10;
        if (node.y > h + 10) node.y = -10;
        ctx.fillStyle = 'rgba(191,247,230,.42)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop() {
      draw();
      raf = requestAnimationFrame(loop);
    }

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduce) draw();
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    if (reduce) {
      draw();
      return;
    }

    loop();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        loop();
      }
    });
  }

  initField();
})();
