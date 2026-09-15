/* ═══════════════════════════════════════════════════════════════════════════
   Şeyma 3.0 · SALT-OKUR uzak kaynak köprüsü
   ───────────────────────────────────────────────────────────────────────────
   SORUN (2026-09-15): Tanıtım sayfası yalnız tarayıcının kendi deposunu
   (`seyma-reset-v1`) okuyordu. Uygulama açılışta uzak veriyi ÇEKMİYOR — yalnız
   kendi verisini GÖNDERİYOR (sync.js `schedule`). Dolayısıyla deposu boş ya da
   eski olan bir cihazda sayfa eksik/yanlış görünüyordu; kullanıcı ise
   `mustafaras/seyma-data` içindeki GERÇEK veriyi görmek istiyor.

   ÇÖZÜM: uygulamanın ZATEN sakladığı kimlik bilgileri (`settings.ghToken` /
   `ghRepo` / `ghBranch`) varsa `data/latest.json`'ı bir kez, salt-okur olarak
   çeker — REPO ESASTIR, cihazda kayıt olsa bile (cihaz kaydı bayat olabilir).
   Cihaz deposu yalnız kimlik yoksa ya da ağ/okuma hatasında YEDEKTİR.

   DEĞİŞMEZ KURALLAR
   ─────────────────
   • YALNIZ GET. Bu dosyada PUT/PATCH/POST/DELETE yoktur; `sync.js` yüklenmez.
   • DEPOYA YAZMAZ. `localStorage.setItem` bu dosyada hiç geçmez. Uzak veri
     yalnız bellekte durur ve bir sonraki sayfa açılışında yeniden çekilir.
     (Bilinçli tercih: bu sayfa 3.0 tanıtımıdır; uygulamanın deposunu yazma
     yetkisi onun kendi akışında kalır.)
   • TOKEN SIZMAZ. Kimlik bilgisi yalnız isteğin `Authorization` başlığında
     yaşar; console'a, DOM'a veya metne asla yazılmaz.
   • TEK YÖNLÜ KÖPRÜ. v3-data.js salt-okur kalır (fixture onu ağdan men eder);
     ağ yalnız BURADA, izole bir modülde yapılır.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var KEY = 'seyma-reset-v1';
  var DEFAULT_REPO = 'mustafaras/seyma-data';
  var PATH = 'data/latest.json';
  /* 2,2 MB'lık blob mobil bağlantıda 9 s'yi aşabiliyordu → sessizce cihaz
     kaydına düşülüyordu. 30 s: yavaş ağda da gerçek veri gelsin. */
  var TIMEOUT_MS = 30000;

  /* Uzak okuma NEDEN başarısız oldu? Sayfa bunu kullanıcıya söyler —
     "eşitlenmiş veriye ulaşılamadı" tek başına teşhis ettirmiyordu.
     Kodlar: no-creds · http_<n> · blob-http_<n> · timeout · network ·
     empty · parse. Token/ham veri asla buraya yazılmaz. */
  var FAIL = '';
  function setFail(code) { FAIL = String(code || ''); }
  function lastFailure() { return FAIL; }

  /* ── Kimlik bilgisi: yalnız cihazın kendi deposundan ────────────────────
     Kullanıcıya sorulmaz, ağdan alınmaz. Yok ise çekme denemesi yapılmaz. */
  function creds() {
    var raw;
    try { raw = window.localStorage.getItem(KEY); } catch (_) { return null; }
    if (!raw) return null;

    var data;
    try { data = JSON.parse(raw); } catch (_) { return null; }
    if (!data || typeof data !== 'object') return null;

    var s = (data.settings || {});
    var token = (s.ghToken || '').trim();
    var repo = (s.ghRepo || DEFAULT_REPO).trim() || DEFAULT_REPO;
    if (!token || repo.indexOf('/') <= 0) return null;

    var parts = repo.split('/');
    if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) return null;

    return {
      token: token,
      owner: parts[0].trim(),
      repo: parts[1].trim(),
      branch: (s.ghBranch || 'main').trim() || 'main'
    };
  }

  /* Cihazın kendi deposunda GERÇEKTEN veri var mı? Yalnız teşhis/karar
     yardımcısı — uzak okuma yolu artık buna bağlı değil. */
  function hasLocalData() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return false;
      var d = JSON.parse(raw);
      return !!(d && d.days && typeof d.days === 'object' &&
        Object.keys(d.days).length > 0);
    } catch (_) {
      return false;
    }
  }

  /* ── UTF-8 base64 çözücü ────────────────────────────────────────────────
     `atob` tek başına Türkçe karakterleri bozar; sync.js ile aynı yol. */
  function b64decodeUtf8(s) {
    try {
      var bin = atob(String(s).replace(/\s+/g, ''));
      var by = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) by[i] = bin.charCodeAt(i);
      return new TextDecoder().decode(by);
    } catch (_) {
      return '';
    }
  }

  function headers(c, accept) {
    return {
      'Authorization': 'Bearer ' + c.token,
      'Accept': accept || 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  function get(url, h, signal) {
    return fetch(url, { headers: h, signal: signal, cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) return { ok: false, status: r.status, text: '' };
        return r.text().then(function (t) { return { ok: true, status: r.status, text: t }; });
      })
      .catch(function (e) {
        var aborted = !!(e && (e.name === 'AbortError' || e.code === 20));
        return { ok: false, status: 0, text: '', err: aborted ? 'timeout' : 'network' };
      });
  }
  function failOf(res, prefix) {
    if (!res) return 'network';
    if (res.err) return res.err;
    if (!res.ok) return (prefix || '') + 'http_' + (res.status || 0);
    return 'empty';
  }

  /* ── GitHub Contents API → gerekirse Blobs API'ye düş ───────────────────
     KEŞİF (2026-08-18, sync.js): data/latest.json 1 MB'ı aşınca Contents API
     200 döner ama `content` BOŞ gelir (`encoding:"none"`). Çözüm, `sha` ile
     `git/blobs/<sha>` ham içeriğini çekmektir. Aynı yol burada da gereklidir,
     aksi hâlde 2,2 MB'lık gerçek dosya sessizce boş okunurdu. */
  function fetchLatest() {
    var c = creds();
    setFail('');
    if (!c) { setFail('no-creds'); return Promise.resolve(null); }

    var base = 'https://api.github.com/repos/' +
      encodeURIComponent(c.owner) + '/' + encodeURIComponent(c.repo);
    var ctrl = null, timer = null, signal;
    try {
      ctrl = new AbortController();
      signal = ctrl.signal;
      timer = setTimeout(function () { try { ctrl.abort(); } catch (_) {} }, TIMEOUT_MS);
    } catch (_) { /* AbortController yoksa zaman aşımı olmadan devam */ }

    function done(v) {
      if (timer) clearTimeout(timer);
      return v;
    }

    return get(base + '/contents/' + PATH + '?ref=' + encodeURIComponent(c.branch),
      headers(c), signal)
      .then(function (res) {
        if (!res || !res.ok || !res.text) { setFail(failOf(res)); return null; }
        var g;
        try { g = JSON.parse(res.text); } catch (_) { setFail('parse'); return null; }
        if (!g) { setFail('parse'); return null; }

        if (g.content) {
          var body = b64decodeUtf8(g.content);
          var got = body ? parse(body) : null;
          if (!got) setFail('parse');
          return got;
        }

        /* Gövde yok (>1 MB) — sha ile ham blob'u çek. */
        if (!g.sha) { setFail('empty'); return null; }
        return get(base + '/git/blobs/' + encodeURIComponent(g.sha),
          headers(c, 'application/vnd.github.raw'), signal)
          .then(function (bres) {
            if (!bres || !bres.ok || !bres.text) { setFail(failOf(bres, 'blob-')); return null; }
            var raw = bres.text, out = null;
            /* Bazı vekiller raw Accept'i yok sayıp JSON döndürür. */
            if (raw.charAt(0) === '{' && raw.indexOf('"encoding"') >= 0 &&
                raw.indexOf('"content"') >= 0) {
              try {
                var j = JSON.parse(raw);
                if (j && j.encoding === 'base64' && typeof j.content === 'string') {
                  out = parse(b64decodeUtf8(j.content));
                }
              } catch (_) {}
            } else {
              out = parse(raw);
            }
            if (!out) setFail('parse');
            return out;
          });
      })
      .then(done)
      .catch(function () { setFail('network'); return done(null); });
  }

  /* Bozuk/eksik gövde asla "veri var" sayılmaz. */
  function parse(txt) {
    try {
      var d = JSON.parse(txt);
      if (!d || typeof d !== 'object') return null;
      if (!d.days || typeof d.days !== 'object') return null;
      if (!Object.keys(d.days).length) return null;
      return d;
    } catch (_) {
      return null;
    }
  }

  /* ── Kurulum ────────────────────────────────────────────────────────────
     Bu sayfa ÖMÜR BOYU BİR KEZ gösterilir ("Okudum, anladım" sonrası bir daha
     çıkmaz). Dolayısıyla bir kez ağdan okumanın maliyeti ihmal edilebilir;
     buna karşılık GÖSTERİLEN SAYILARIN `seyma-data` ile birebir olması esastır.

     · Kimlik bilgisi YOKSA: ağ imkânsız → cihaz deposuyla çiz.
     · Kimlik VARSA: repo esastır → çek; başarılıysa onu kullan.
       (Ağ/kimlik hatasında cihaz deposuna düşülür — sayfa asla bozulmaz.)

     Her yolda son adım aynıdır: gün sayısı metinlerini GERÇEK sayıya göre
     düzelt (statik HTML yalnız bir varsayılan taşır; veri ne diyorsa o yazılır). */
  function boot() {
    var charts = window.SeymaV3Charts;
    if (!charts || typeof charts.init !== 'function') return;

    function report(code) {
      var V3 = window.SeymaV3Data;
      if (V3 && typeof V3.setRemoteFailure === 'function') V3.setRemoteFailure(code);
    }
    function settle() {
      charts.init();
      try { updateDynamicText(); } catch (_) {}
    }

    /* Gömülü anlık görüntü varsa ağa yalnız İYİLEŞTİREBİLECEKSE çıkılır:
       cihaz deposu anlık görüntüden taze/eşitse (telefon) → ağ yok, cihaz
       kazanır (istatistikler zamanla güncellenir). Cihaz bayatsa ve kimlik
       varsa → uzak okuma denenir; en taze olan kazanır (v3-data.js). */
    if (window.SeymaV3Snapshot) {
      var V3f = window.SeymaV3Data;
      var fr = (V3f && typeof V3f.freshness === 'function') ? V3f.freshness() : null;
      var deviceWins = !!(fr && fr.device && (!fr.snapshot || V3f.fresher(fr.device, fr.snapshot)));
      if (deviceWins || !creds()) {
        settle();
        return;
      }
    }

    if (!creds()) {
      report('no-creds');
      settle();
      return;
    }

    fetchLatest()
      .then(function (remote) {
        if (remote && window.SeymaV3Data &&
            typeof window.SeymaV3Data.setData === 'function') {
          window.SeymaV3Data.setData(remote);
        } else {
          report(lastFailure() || 'empty');
        }
        settle();
      })
      .catch(function () {
        /* Ağ/Kimlik hatası → cihaz deposuna düş: sayfa yine çizilir. */
        report(lastFailure() || 'network');
        settle();
      });
  }

  /* Sayfa iskeletindeki gün sayısı metinleri (hero/kapanış/footer) — veri
     geldiyse gerçek sayıya göre yeniden yazılır. Veri yoksa DOKUNULMAZ:
     statik HTML her zaman geçerli bir varsayılan taşır (JS kapalıyken de). */
  function updateDynamicText() {
    var V3 = window.SeymaV3Data;
    if (!V3 || typeof V3.dynamic !== 'function') return;
    var d = V3.dynamic();
    if (!d || !d.dayCount) return;

    set('v3-lead', d.lead);
    set('v3-counter-note', d.counterNote);
    set('v3-veri-baslik', d.dataHeading);
    set('v3-kapanis-baslik', d.closingTitle);
    set('v3-footer-days', d.footer);

    var num = document.getElementById('v3-counter-num');
    if (num) {
      num.setAttribute('data-count', String(d.dayCount));
      num.textContent = String(d.dayCount);
      /* v3.js sayaç animasyonu hedefini data-count'tan her karede okur ve
         bitişte v3Target'a sabitler; ikisi de güncellenmezse animasyon
         uzak veri geldikten SONRA eski (statik) sayıyı geri yazardı. */
      try { num.dataset.v3Target = String(d.dayCount); } catch (_) {}
    }
    var ord = document.getElementById('v3-counter-ordinal');
    if (ord) ord.textContent = d.dayCount + '.';
  }

  function set(id, text) {
    var n = document.getElementById(id);
    if (n && text) n.textContent = text;
  }

  /* Ağ yoksa da hero'daki gün sözcüğü cihaz verisiyle düzeltilsin diye
     ilk boyamada da çalışır. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.SeymaV3Source = {
    DEFAULT_REPO: DEFAULT_REPO,
    PATH: PATH,
    creds: creds,
    hasLocalData: hasLocalData,
    fetchLatest: fetchLatest,
    lastFailure: lastFailure,
    boot: boot,
    updateDynamicText: updateDynamicText,
    b64decodeUtf8: b64decodeUtf8
  };
})();
