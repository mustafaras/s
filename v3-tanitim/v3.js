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

  /* ── Kurulum ─────────────────────────────────────────────────────────────*/
  function init() {
    wireReveal();

    var button = document.getElementById('v3-done');
    if (button) button.addEventListener('click', function () { finish(button); });

    /* Okuma yardımı: kapanış bölümü görünür olduğunda düğmeye odaklanmıyoruz —
       odak kullanıcıyı kendi akışında takip eder (a11y §5.4). */
  }

  /* Fixture'lar için salt-okur yüzey; DOM'a veya depoya dokunmaz. */
  window.SeymaV3Welcome = {
    SEEN_KEY: SEEN_KEY,
    SEEN_VALUE: SEEN_VALUE,
    ESCAPE_PARAM: ESCAPE_PARAM,
    HOME: HOME,
    isSeen: isSeen,
    markSeen: markSeen
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
