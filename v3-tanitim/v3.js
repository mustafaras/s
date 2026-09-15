/* ═══════════════════════════════════════════════════════════════════════════
   Şeyma 3.0 — "Hoş Geldin" tanıtım sayfası · davranış katmanı

   Sorumlulukları (yalnız üç tane):
     1. "Okudum, anladım" işaretini kalıcı olarak yazmak (ve yazıldığını
        DOĞRULAMAK — bkz. markSeen).
     2. Kademeli scroll-reveal.
     3. Hiçbir şeyi bozmadan, hiçbir yere yazmadan çalışmak.

   DOKUNMADIĞI ŞEYLER (bilinçli):
     • localStorage anahtarı `seyma-reset-v1` DEĞİL — kendi namespace'i.
     • app.js / render.js / appSurface.js / sync.js — hiçbiri yüklenmez.
     • panel* yüzeyleri — bu sayfa onlardan tamamen ayrıdır.
     • Hiçbir ağ çağrısı yok; bu dosya fetch/XHR kullanmaz.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Sözleşme: kalıcılık anahtarı ────────────────────────────────────────
     Sürümden bağımsız, tek değerli, kendi namespace'inde. `seyma-reset-v1`
     (uygulamanın kendi verisi) ile hiçbir ilişkisi yoktur; "Verileri sıfırla"
     bu anahtarı silmez, ki §"bir daha çıkmaz" kuralı tam da bunu gerektirir. */
  var SEEN_KEY = 'seyma-v3-welcome-v1';
  var SEEN_VALUE = 'done';

  /* Tek seferlik kaçış parametresi. YALNIZ localStorage yazılamadığında
     kullanılır; kalıcılık iddiası taşımaz, sadece aynı oturumdaki canlı
     döngüyü kırar (index.html bootstrap'ı bu bayrağı görünce bir kez atlar). */
  var ESCAPE_PARAM = 'v3done';
  var HOME = '../index.html';

  /* ── Kalıcılık ───────────────────────────────────────────────────────────*/
  function isSeen() {
    try { return window.localStorage.getItem(SEEN_KEY) === SEEN_VALUE; }
    catch (_) { return false; }
  }

  /* İşaretle ve GERÇEKTEN yazıldığını doğrula.
     Gizli mod / dolu kota / kapalı çerez durumunda `setItem` ya fırlatır ya da
     sessizce yutmaz — bu yüzden geri okuma yapılır. Doğrulanamazsa `false`
     döner ve çağıran taraf `?v3done=1` kaçışına geçer; aksi hâlde
     index → v3 → index → … sonsuz döngüsü oluşurdu. */
  function markSeen() {
    try {
      window.localStorage.setItem(SEEN_KEY, SEEN_VALUE);
      return window.localStorage.getItem(SEEN_KEY) === SEEN_VALUE;
    } catch (_) {
      return false;
    }
  }

  /* ── Kapanış eylemi ──────────────────────────────────────────────────────
     location.replace: geri tuşu bu tanıtım sayfasına dönmez (tarayıcı
     geçmişini kirletmez — kullanıcı bir daha görmek istemiyor). */
  function finish(button) {
    if (button && button.getAttribute('aria-disabled') === 'true') return;
    if (button) {
      button.setAttribute('aria-disabled', 'true');
      button.textContent = 'Tamam';
    }
    var persisted = markSeen();
    try {
      window.location.replace(persisted ? HOME : HOME + '?' + ESCAPE_PARAM + '=1');
    } catch (_) {
      /* Navigasyon engellendiyse kullanıcıyı düğmeyle baş başa bırak. */
      if (button) {
        button.removeAttribute('aria-disabled');
        button.textContent = 'Okudum, anladım';
      }
    }
  }

  /* ── Hareket izni ────────────────────────────────────────────────────────
     Tek bir yerde sorulur; efekt katmanı ve sayaçlar bunu paylaşır. */
  function motionAllowed() {
    try {
      return !(window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (_) {
      return true;
    }
  }

  /* ── Kademeli giriş ──────────────────────────────────────────────────────
     JS'in çalıştığını CSS'e bildir. Bu sınıf OLMADAN `.v3-reveal` gizlenmez;
     betik hata verse bile içerik görünür kalır. */
  function wireReveal() {
    var root = document.documentElement;
    if (!root) return;

    var reduced = false;
    try {
      reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (_) {}

    var nodes = document.querySelectorAll('.v3-reveal');
    if (!nodes.length) return;

    /* Hareket azaltma ya da IntersectionObserver yokluğu: gizleme yok. */
    if (reduced || typeof window.IntersectionObserver !== 'function') {
      for (var i = 0; i < nodes.length; i++) nodes[i].classList.add('is-in');
      return;
    }

    root.classList.add('v3-js');

    var observer = new window.IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) {
          entries[j].target.classList.add('is-in');
          observer.unobserve(entries[j].target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    for (var k = 0; k < nodes.length; k++) observer.observe(nodes[k]);

    /* Emniyet ağı: gözlemci kuruldu ama 1.6 sn içinde hiçbir şey açılmadıysa
       (bilinmeyen bir tarayıcı arızası, gömülü webview tuhaflığı) hepsini
       görünür yap. İçerik gizli kalmaktan daha kötü bir arıza yoktur. */
    window.setTimeout(function () {
      var still = document.querySelectorAll('.v3-reveal:not(.is-in)');
      for (var n = 0; n < still.length; n++) still[n].classList.add('is-in');
    }, 1600);
  }

  /* ── Kaydırma ilerleme çubuğu ────────────────────────────────────────────
     rAF ile kısıtlanır; kaydırma olayında DOM'a yalnızca bir genişlik
     yazılır (ölçüm bir kez, yazma bir kez — layout thrash yok). */
  function wireProgress() {
    var bar = document.getElementById('v3-progressbar');
    if (!bar) return;

    var queued = false;

    function paint() {
      queued = false;
      var doc = document.documentElement;
      var max = (doc.scrollHeight - window.innerHeight);
      var ratio = max > 0 ? (window.pageYOffset || doc.scrollTop || 0) / max : 0;
      if (ratio < 0) ratio = 0;
      if (ratio > 1) ratio = 1;
      bar.style.width = (ratio * 100).toFixed(2) + '%';
    }

    function onScroll() {
      if (queued) return;
      queued = true;
      if (typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(paint);
      } else {
        window.setTimeout(paint, 60);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    paint();
  }

  /* ── Sayaç animasyonu ────────────────────────────────────────────────────
     data-count taşıyan her öğe hedef değerine sayar. Nihai metin HTML'de
     ZATEN yazılıdır; JS kapalıysa da doğru görünür ve sayı asla "0"a düşmez.
     hareket azaltma açıkken hiç dokunulmaz. */
  function wireCounters() {
    var nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length) return;

    for (var i = 0; i < nodes.length; i++) {
      nodes[i].dataset.v3Target = nodes[i].textContent;
    }

    if (!motionAllowed() || typeof window.IntersectionObserver !== 'function') return;

    function run(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) return;
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = target > 100 ? 1150 : 820;
      var start = null;

      function step(now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - t, 3);   /* easeOutCubic */
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) window.requestAnimationFrame(step);
        else el.textContent = el.dataset.v3Target;
      }
      window.requestAnimationFrame(step);
    }

    var seen = new window.IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) {
          run(entries[j].target);
          seen.unobserve(entries[j].target);
        }
      }
    }, { threshold: 0.5 });

    for (var k = 0; k < nodes.length; k++) seen.observe(nodes[k]);
  }

  /* ── Konfeti ─────────────────────────────────────────────────────────────
     Kutlama edası: altın/pembe tonlarda yukarıdan süzülen hafif parçacıklar.
     Tamamen kendi canvas'ında; DOM'a ve depoya dokunmaz. Parçacık sayısı
     viewport'a göre ölçeklenir ve üst sınırlıdır. Hareket kapalıysa canvas
     HİÇ kurulmaz (ne çizim ne rAF maliyeti). */
  function wireConfetti() {
    var canvas = document.getElementById('v3-confetti');
    if (!canvas || !motionAllowed()) return;
    if (typeof canvas.getContext !== 'function') return;

    var ctx;
    try { ctx = canvas.getContext('2d'); } catch (_) { return; }
    if (!ctx) return;

    /* Renkler app/styles.css token'larından OKUNUR — kopyalanmış sabit yok. */
    function token(name, fallback) {
      try {
        var v = getComputedStyle(document.getElementById('root'))
          .getPropertyValue(name).trim();
        return v || fallback;
      } catch (_) { return fallback; }
    }
    var PALETTE = [
      token('--gold-1', '#F7ECD8'),
      token('--gold-2', '#F0DBB8'),
      token('--gold-3', '#E3C08A'),
      token('--room', '#F0AAC7'),
      token('--text', '#F8F8FA')
    ];

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, parts = [];

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticle(seeded) {
      return {
        x: Math.random() * w,
        /* seeded → ilk karede ekranın her yerinde (üst taraftan boş başlamasın) */
        y: seeded ? Math.random() * h : -14 - Math.random() * 40,
        r: 1.1 + Math.random() * 2.4,
        vy: 0.22 + Math.random() * 0.55,
        vx: (Math.random() - 0.5) * 0.34,
        spin: (Math.random() - 0.5) * 0.05,
        rot: Math.random() * Math.PI,
        alpha: 0.28 + Math.random() * 0.5,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        shape: Math.random() < 0.34 ? 'rect' : 'dot'
      };
    }

    function build() {
      var count = w < 420 ? 42 : w < 700 ? 66 : 88;
      parts = [];
      for (var i = 0; i < count; i++) parts.push(makeParticle(true));
    }

    var running = true, raf = null;

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.y * 0.012 + p.r) * 0.24;  /* süzülme */
        p.rot += p.spin;

        if (p.y > h + 20) { parts[i] = makeParticle(false); continue; }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      raf = window.requestAnimationFrame(frame);
    }

    function start() {
      if (raf !== null) return;
      running = true;
      raf = window.requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf !== null) {
        window.cancelAnimationFrame(raf);
        raf = null;
      }
    }

    resize();
    build();
    start();

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () { resize(); build(); }, 180);
    }, { passive: true });

    /* Sekme arkada kalınca dur — pil ve CPU dostu. */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
  }

  /* ── Kurulum ─────────────────────────────────────────────────────────────*/
  function init() {
    wireReveal();
    wireProgress();
    wireCounters();
    wireConfetti();

    var button = document.getElementById('v3-done');
    if (button) button.addEventListener('click', function () { finish(button); });
  }

  /* Fixture'lar için salt-okur yüzey; DOM'a veya depoya dokunmaz. */
  window.SeymaV3Welcome = {
    SEEN_KEY: SEEN_KEY,
    SEEN_VALUE: SEEN_VALUE,
    ESCAPE_PARAM: ESCAPE_PARAM,
    HOME: HOME,
    isSeen: isSeen,
    markSeen: markSeen,
    motionAllowed: motionAllowed
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
