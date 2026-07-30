(function(){
  'use strict';

  // QuranTransportV1 — Raşit ile Kur’an Yolculuğu taşıma sözleşmeleri (QY-04).
  //
  // ÜÇ AYRI DOSYA, latest.json ZİNCİRİNDEN TAMAMEN BAĞIMSIZ:
  //   data/quran-request-outbox.json   uygulama yazar, GitHub Actions okur
  //   data/quran-delivery.json         GitHub Actions yazar, uygulama okur
  //   data/quran-responses.json        Gmail Apps Script yazar, uygulama okur
  //
  // DEĞİŞTİRİLEMEZ KURAL: Hiçbir otomasyon data/latest.json'u yazamaz veya
  // full-replace edemez. isWritableTransportPath() bunun tek kapısıdır; yazan
  // her taraf (QY-08 sync, QY-10 Apps Script, QY-15 panel) buradan geçmelidir.
  //
  // Bu modül SAF'tır: ağ yok, depolama yok, DOM yok, Date.now() yok. Zaman
  // damgaları çağırandan gelir. Tüm parse fonksiyonları ASLA throw etmez —
  // bozuk dosya uygulamayı çökertemez, boş sözleşme + hata listesi döner.

  var SCHEMA_VERSION = 1;

  var PATHS = Object.freeze({
    outbox: 'data/quran-request-outbox.json',
    delivery: 'data/quran-delivery.json',
    responses: 'data/quran-responses.json'
  });
  // Kur’an otomasyonunun asla dokunamayacağı yollar.
  var FORBIDDEN_PATHS = Object.freeze([
    'data/latest.json', 'data/gunluk', 'data/observer-inbox.json',
    'data/aeon-outbox.json', 'data/profile-outbox.json', 'data/aeon-media'
  ]);

  var REQUEST_ID_RE = /^qr_[A-Za-z0-9_-]{8,64}$/;
  var RESPONSE_ID_RE = /^qrr_[A-Za-z0-9_-]{8,64}$/;
  var SURAH_ID_RE = /^[a-z]+(-[a-z]+)*$/;
  var VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;
  // replyToken tahmin edilemez olmalı: en az 32 karakter base64url.
  var REPLY_TOKEN_RE = /^[A-Za-z0-9_-]{32,128}$/;
  var ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
  var FINGERPRINT_RE = /^[a-f0-9]{16,64}$/;

  var DELIVERY_STATUSES = ['sent', 'failed'];
  var RESPONSE_STATUSES = ['ready', 'revoked'];
  var RESPONSE_SOURCES = ['gmail_reply', 'panel_manual'];

  // Sınırlar: bu dosyalar sürekli büyüyen kuyruklar değil, çalışan kayıtlardır.
  var MAX_OUTBOX = 50;
  var MAX_DELIVERY = 200;
  var MAX_RESPONSES = 200;

  // Yalnız https ve yalnız gerçek video yolları. Kanal, profil, playlist,
  // javascript:, data: ve YouTube dışı her şey buradan geçemez.
  var YT_PATTERNS = [
    /^https:\/\/(?:www\.|m\.)?youtube\.com\/watch\?(?:[^#\s]*&)?v=([A-Za-z0-9_-]{11})(?:[&#]|$)/,
    /^https:\/\/youtu\.be\/([A-Za-z0-9_-]{11})(?:[?#]|$)/,
    /^https:\/\/(?:www\.|m\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{11})(?:[?#]|$)/
  ];

  // ── küçük yardımcılar ───────────────────────────────────────────────────
  function isPlainObject(v){ return !!v && typeof v === 'object' && !Array.isArray(v); }
  function str(v){ return (typeof v === 'string' && v) ? v : null; }
  function isoOrNull(v){ return (typeof v === 'string' && ISO_RE.test(v)) ? v : null; }
  function isValidRequestId(v){ return typeof v === 'string' && REQUEST_ID_RE.test(v); }
  function isValidResponseId(v){ return typeof v === 'string' && RESPONSE_ID_RE.test(v); }
  function isValidSurahId(v){ return typeof v === 'string' && SURAH_ID_RE.test(v); }
  function isValidVideoId(v){ return typeof v === 'string' && VIDEO_ID_RE.test(v); }
  function isValidReplyToken(v){ return typeof v === 'string' && REPLY_TOKEN_RE.test(v); }

  // Sabit zamanlı karşılaştırma denemesi. DÜRÜST NOT: JavaScript motorunda
  // gerçek sabit zaman garanti edilemez; asıl token karşılaştırması sunucu
  // tarafında (QY-10 Apps Script) yapılır. Buradaki amaç, istemci/panel
  // tarafında erken-çıkışlı naif karşılaştırmayı önlemektir.
  function tokensEqual(a, b){
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;
    var diff = 0;
    for (var i = 0; i < a.length; i++) diff |= (a.charCodeAt(i) ^ b.charCodeAt(i));
    return diff === 0;
  }

  function isWritableTransportPath(p){
    var s = String(p || '');
    for (var k in PATHS) {
      if (Object.prototype.hasOwnProperty.call(PATHS, k) && PATHS[k] === s) return true;
    }
    return false;
  }
  function isForbiddenPath(p){
    var s = String(p || '');
    for (var i = 0; i < FORBIDDEN_PATHS.length; i++) {
      if (s === FORBIDDEN_PATHS[i] || s.indexOf(FORBIDDEN_PATHS[i] + '/') === 0) return true;
    }
    return false;
  }

  // ── YouTube bağlantı doğrulama (Apps Script, uygulama ve panel ortak kullanır) ──
  function parseYouTubeVideoId(url){
    if (typeof url !== 'string' || !url) return null;
    var u = url.trim();
    for (var i = 0; i < YT_PATTERNS.length; i++) {
      var m = u.match(YT_PATTERNS[i]);
      if (m) return m[1];
    }
    return null;
  }
  // İnsanlar bağlantıyı cümlenin içine yazar: "işte anlatım: <link>." Sondaki
  // noktalama URL'nin parçası değildir ve kırpılmazsa geçerli bir bağlantı
  // "video yok" sayılır. Bir URL asla bu karakterlerle bitmez, bu yüzden
  // kırpmak güvenlidir. Baştaki tırnak/parantez de aynı nedenle temizlenir.
  var URL_LEAD_RE = /^[«“„"'(\[<¡¿]+/;
  var URL_TRAIL_RE = /[.,;:!?…«»“”„‟'"’)\]>}]+$/;
  function trimUrlEdges(token){
    return String(token).replace(URL_LEAD_RE, '').replace(URL_TRAIL_RE, '');
  }
  // Serbest metinden TAM OLARAK bir video kimliği çıkarır.
  // Aynı video farklı biçimlerde tekrar geçse bile tek sayılır; iki FARKLI
  // video varsa cevap belirsizdir ve reddedilir (plan §9).
  function extractSingleVideoId(text){
    if (typeof text !== 'string' || !text) return { ok: false, videoId: null, reason: 'no_video' };
    var tokens = text.split(/[\s<>"'()\[\]]+/);
    var found = [], seen = {};
    for (var i = 0; i < tokens.length; i++) {
      var id = parseYouTubeVideoId(trimUrlEdges(tokens[i]));
      if (id && !Object.prototype.hasOwnProperty.call(seen, id)) { seen[id] = true; found.push(id); }
    }
    if (found.length === 0) return { ok: false, videoId: null, reason: 'no_video' };
    if (found.length > 1) return { ok: false, videoId: null, reason: 'multiple_videos' };
    return { ok: true, videoId: found[0], reason: 'ok' };
  }

  // ── boş sözleşmeler ─────────────────────────────────────────────────────
  function emptyOutbox(){ return { schemaVersion: SCHEMA_VERSION, updatedAt: null, requests: {} }; }
  function emptyDelivery(){ return { schemaVersion: SCHEMA_VERSION, updatedAt: null, requests: {} }; }
  function emptyResponses(){ return { schemaVersion: SCHEMA_VERSION, updatedAt: null, responses: {} }; }

  // Ham girdiyi (JSON metni veya nesne) güvenle çözer. Asla throw etmez.
  function coerceRoot(raw, errors){
    if (typeof raw === 'string') {
      if (!raw.trim()) { errors.push('empty_file'); return null; }
      try { raw = JSON.parse(raw); }
      catch (e) { errors.push('invalid_json'); return null; }
    }
    if (!isPlainObject(raw)) { errors.push('not_an_object'); return null; }
    return raw;
  }
  // Sürüm politikası: bilinmeyen/eski sürümde ÇÖKME yok. Bilinen alanlar
  // okunur, durum errors ile bildirilir; çağıran isterse kullanıcıya
  // "bu kayıt daha yeni bir sürümden" diyebilir.
  function readVersion(root, errors){
    var v = root.schemaVersion;
    if (typeof v !== 'number' || !isFinite(v)) { errors.push('missing_schema_version'); return SCHEMA_VERSION; }
    if (v < SCHEMA_VERSION) errors.push('older_schema_version');
    if (v > SCHEMA_VERSION) errors.push('newer_schema_version');
    return v;
  }
  function eachEntry(map, errors, keyValid, normalize, out, label){
    if (!isPlainObject(map)) { if (map !== undefined) errors.push(label + '_not_an_object'); return; }
    var keys = Object.keys(map);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (!keyValid(k)) { errors.push('bad_key:' + label); continue; }
      var rec = normalize(k, map[k], errors);
      if (rec) out[k] = rec;
    }
  }

  // ── outbox ──────────────────────────────────────────────────────────────
  function normOutboxEntry(key, v, errors){
    if (!isPlainObject(v)) { errors.push('bad_outbox_entry'); return null; }
    if (v.requestId !== undefined && v.requestId !== key) { errors.push('outbox_key_mismatch'); return null; }
    if (!isValidSurahId(v.surahId)) { errors.push('bad_surah_id'); return null; }
    if (!isValidReplyToken(v.replyToken)) { errors.push('bad_reply_token'); return null; }
    var order = v.revelationOrder;
    if (typeof order !== 'number' || order < 1 || order > 114 || order !== Math.floor(order)) {
      errors.push('bad_revelation_order'); return null;
    }
    var requestedAt = isoOrNull(v.requestedAt);
    if (!requestedAt) { errors.push('bad_requested_at'); return null; }
    return {
      requestId: key, surahId: v.surahId, revelationOrder: order,
      surahName: str(v.surahName) || v.surahId,
      requestedAt: requestedAt, replyToken: v.replyToken
    };
  }
  function parseOutbox(raw){
    var errors = [], out = emptyOutbox();
    var root = coerceRoot(raw, errors);
    if (!root) return { ok: false, value: out, errors: errors };
    out.schemaVersion = readVersion(root, errors);
    out.updatedAt = isoOrNull(root.updatedAt);
    eachEntry(root.requests, errors, isValidRequestId, normOutboxEntry, out.requests, 'requests');
    return { ok: errors.length === 0, value: out, errors: errors };
  }

  // ── delivery ────────────────────────────────────────────────────────────
  function normDeliveryEntry(key, v, errors){
    if (!isPlainObject(v)) { errors.push('bad_delivery_entry'); return null; }
    if (DELIVERY_STATUSES.indexOf(v.status) < 0) { errors.push('bad_delivery_status'); return null; }
    return {
      status: v.status,
      sentAt: isoOrNull(v.sentAt),
      // Sağlayıcı mesaj kimliği: retry'de aynı isteğin iki kez postalanmadığını
      // kanıtlayan idempotency çıpası (QY-09).
      providerMessageId: str(v.providerMessageId),
      // Hata YALNIZ kısa kod olarak taşınır; stack trace / adres / token yasak.
      error: str(v.error) ? String(v.error).slice(0, 80) : null
    };
  }
  function parseDelivery(raw){
    var errors = [], out = emptyDelivery();
    var root = coerceRoot(raw, errors);
    if (!root) return { ok: false, value: out, errors: errors };
    out.schemaVersion = readVersion(root, errors);
    out.updatedAt = isoOrNull(root.updatedAt);
    eachEntry(root.requests, errors, isValidRequestId, normDeliveryEntry, out.requests, 'requests');
    return { ok: errors.length === 0, value: out, errors: errors };
  }

  // ── responses ───────────────────────────────────────────────────────────
  // requestId ile anahtarlanır: aynı isteğe gelen ikinci cevap yeni kayıt
  // AÇMAZ, mevcut kaydın yerine geçer (idempotency + supersede tek yerde).
  function normResponseEntry(key, v, errors){
    if (!isPlainObject(v)) { errors.push('bad_response_entry'); return null; }
    if (v.requestId !== undefined && v.requestId !== key) { errors.push('response_key_mismatch'); return null; }
    if (!isValidResponseId(v.responseId)) { errors.push('bad_response_id'); return null; }
    if (!isValidSurahId(v.surahId)) { errors.push('bad_surah_id'); return null; }
    if (!isValidVideoId(v.videoId)) { errors.push('bad_video_id'); return null; }
    if (RESPONSE_SOURCES.indexOf(v.source) < 0) { errors.push('bad_source'); return null; }
    if (RESPONSE_STATUSES.indexOf(v.status) < 0) { errors.push('bad_response_status'); return null; }
    var validatedAt = isoOrNull(v.validatedAt);
    if (!validatedAt) { errors.push('bad_validated_at'); return null; }
    // senderFingerprint DÜZ E-POSTA ADRESİ OLAMAZ; yalnız hex özet kabul edilir.
    // '@' içeren bir değer sözleşme ihlalidir ve kayıt reddedilir (plan §7).
    var fp = str(v.senderFingerprint);
    if (fp && !FINGERPRINT_RE.test(fp)) { errors.push('bad_sender_fingerprint'); return null; }
    return {
      responseId: v.responseId, requestId: key, surahId: v.surahId, videoId: v.videoId,
      source: v.source, receivedAt: isoOrNull(v.receivedAt), validatedAt: validatedAt,
      senderFingerprint: fp, status: v.status
    };
  }
  function parseResponses(raw){
    var errors = [], out = emptyResponses();
    var root = coerceRoot(raw, errors);
    if (!root) return { ok: false, value: out, errors: errors };
    out.schemaVersion = readVersion(root, errors);
    out.updatedAt = isoOrNull(root.updatedAt);
    eachEntry(root.responses, errors, isValidRequestId, normResponseEntry, out.responses, 'responses');
    return { ok: errors.length === 0, value: out, errors: errors };
  }

  // ── saf yazma yardımcıları (hepsi YENİ nesne döndürür) ──────────────────
  function cloneMap(m){
    var out = {}, keys = Object.keys(m || {});
    for (var i = 0; i < keys.length; i++) out[keys[i]] = m[keys[i]];
    return out;
  }
  function newestFirst(map, stampOf){
    return Object.keys(map).sort(function(a, b){
      var sa = stampOf(map[a]) || '', sb = stampOf(map[b]) || '';
      if (sa === sb) return a < b ? -1 : 1;
      return sa > sb ? -1 : 1;
    });
  }
  function capMap(map, max, stampOf){
    var keys = Object.keys(map);
    if (keys.length <= max) return map;
    var ordered = newestFirst(map, stampOf).slice(0, max), out = {};
    for (var i = 0; i < ordered.length; i++) out[ordered[i]] = map[ordered[i]];
    return out;
  }

  // Outbox tek slot DEĞİL, requestId ile anahtarlı bir defterdir: iki farklı
  // sûre arka arkaya istenirse ikinci istek birinciyi EZMEZ (QY-00 riski).
  function upsertOutboxRequest(outbox, entry, at){
    var base = isPlainObject(outbox) ? outbox : emptyOutbox();
    var errors = [];
    var rec = (isPlainObject(entry) && isValidRequestId(entry.requestId))
      ? normOutboxEntry(entry.requestId, entry, errors) : null;
    if (!rec) return { ok: false, value: base, errors: errors.length ? errors : ['bad_entry'] };
    var requests = cloneMap(base.requests);
    requests[rec.requestId] = rec;
    requests = capMap(requests, MAX_OUTBOX, function(r){ return r.requestedAt; });
    return {
      ok: true,
      value: { schemaVersion: SCHEMA_VERSION, updatedAt: isoOrNull(at) || base.updatedAt || null, requests: requests },
      errors: []
    };
  }

  // Henüz postalanmamış istekler. GitHub Actions bunları gönderir; delivery
  // receipt'i olan istek TEKRAR postalanmaz (retry çift mail üretmesin, QY-09).
  function pendingOutboxRequests(outbox, delivery){
    var ob = isPlainObject(outbox) ? (outbox.requests || {}) : {};
    var dl = isPlainObject(delivery) ? (delivery.requests || {}) : {};
    var out = [], keys = newestFirst(ob, function(r){ return r.requestedAt; });
    for (var i = keys.length - 1; i >= 0; i--) {   // eskiden yeniye: istek sırası korunur
      var k = keys[i], receipt = dl[k];
      if (receipt && receipt.status === 'sent') continue;
      out.push(ob[k]);
    }
    return out;
  }

  // Postalanmış VE cevabı gelmiş istekleri defterden düşürür; cevabı
  // beklenenler ASLA düşmez (istek kaybolmasın).
  function pruneOutbox(outbox, delivery, responses){
    var base = isPlainObject(outbox) ? outbox : emptyOutbox();
    var dl = isPlainObject(delivery) ? (delivery.requests || {}) : {};
    var rs = isPlainObject(responses) ? (responses.responses || {}) : {};
    var keys = Object.keys(base.requests || {}), requests = {};
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i], sent = !!(dl[k] && dl[k].status === 'sent'), answered = !!rs[k];
      if (sent && answered) continue;
      requests[k] = base.requests[k];
    }
    return { schemaVersion: SCHEMA_VERSION, updatedAt: base.updatedAt || null, requests: requests };
  }

  // Doğrulanmış cevabı deftere idempotent biçimde işler.
  // Aynı cevap ikinci kez gelirse hiçbir şey değişmez.
  function applyResponse(responses, resp, at){
    var base = isPlainObject(responses) ? responses : emptyResponses();
    var errors = [];
    var key = isPlainObject(resp) ? resp.requestId : null;
    if (!isValidRequestId(key)) return { ok: false, changed: false, value: base, errors: ['bad_request_id'] };
    var rec = normResponseEntry(key, resp, errors);
    if (!rec) return { ok: false, changed: false, value: base, errors: errors };
    var prev = (base.responses || {})[key];
    if (prev && prev.responseId === rec.responseId && prev.videoId === rec.videoId && prev.status === rec.status) {
      return { ok: true, changed: false, value: base, errors: [] };
    }
    var map = cloneMap(base.responses);
    map[key] = rec;
    map = capMap(map, MAX_RESPONSES, function(r){ return r.validatedAt; });
    return {
      ok: true, changed: true,
      value: { schemaVersion: SCHEMA_VERSION, updatedAt: isoOrNull(at) || base.updatedAt || null, responses: map },
      errors: []
    };
  }

  function applyDeliveryReceipt(delivery, requestId, receipt, at){
    var base = isPlainObject(delivery) ? delivery : emptyDelivery();
    var errors = [];
    if (!isValidRequestId(requestId)) return { ok: false, changed: false, value: base, errors: ['bad_request_id'] };
    var rec = normDeliveryEntry(requestId, receipt, errors);
    if (!rec) return { ok: false, changed: false, value: base, errors: errors };
    var prev = (base.requests || {})[requestId];
    // Gönderildi bilgisi geri alınamaz: retry'den gelen 'failed' bir 'sent'i ezemez.
    if (prev && prev.status === 'sent' && rec.status !== 'sent') {
      return { ok: true, changed: false, value: base, errors: ['sent_is_final'] };
    }
    if (prev && prev.status === rec.status && prev.providerMessageId === rec.providerMessageId) {
      return { ok: true, changed: false, value: base, errors: [] };
    }
    var map = cloneMap(base.requests);
    map[requestId] = rec;
    map = capMap(map, MAX_DELIVERY, function(r){ return r.sentAt; });
    return {
      ok: true, changed: true,
      value: { schemaVersion: SCHEMA_VERSION, updatedAt: isoOrNull(at) || base.updatedAt || null, requests: map },
      errors: []
    };
  }

  // Bir cevabın gerçekten bu isteğe ait olduğunu çapraz doğrular.
  // requestId, replyToken ve surahId üçü birden tutmalı (sahte gönderici ve
  // yanlış sûre eşleme tehdidi — QY-00 tehdit modeli).
  function verifyResponseAgainstOutbox(outbox, claim){
    if (!isPlainObject(claim)) return { ok: false, reason: 'bad_claim' };
    var ob = isPlainObject(outbox) ? (outbox.requests || {}) : {};
    var req = Object.prototype.hasOwnProperty.call(ob, String(claim.requestId)) ? ob[claim.requestId] : null;
    if (!req) return { ok: false, reason: 'unknown_request' };
    if (!tokensEqual(String(claim.replyToken || ''), req.replyToken)) return { ok: false, reason: 'token_mismatch' };
    if (claim.surahId !== req.surahId) return { ok: false, reason: 'surah_mismatch' };
    if (!isValidVideoId(claim.videoId)) return { ok: false, reason: 'bad_video_id' };
    return { ok: true, reason: 'ok', surahId: req.surahId, revelationOrder: req.revelationOrder };
  }

  // Uygulamaya/panele gidecek yükte secret kalmadığını kanıtlar.
  function containsSecret(payload){
    var s;
    try { s = JSON.stringify(payload); } catch (e) { return true; }
    if (!s) return false;
    if (/"replyToken"/.test(s)) return true;
    if (/ghToken|openaiKey|MAIL_PASSWORD|Bearer\s/i.test(s)) return true;
    if (/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(s)) return true;
    return false;
  }

  window.QuranTransportV1 = Object.freeze({
    SCHEMA_VERSION: SCHEMA_VERSION,
    PATHS: PATHS,
    FORBIDDEN_PATHS: FORBIDDEN_PATHS,
    LIMITS: Object.freeze({ outbox: MAX_OUTBOX, delivery: MAX_DELIVERY, responses: MAX_RESPONSES }),
    isWritableTransportPath: isWritableTransportPath,
    isForbiddenPath: isForbiddenPath,
    isValidRequestId: isValidRequestId,
    isValidResponseId: isValidResponseId,
    isValidSurahId: isValidSurahId,
    isValidVideoId: isValidVideoId,
    isValidReplyToken: isValidReplyToken,
    tokensEqual: tokensEqual,
    parseYouTubeVideoId: parseYouTubeVideoId,
    extractSingleVideoId: extractSingleVideoId,
    emptyOutbox: emptyOutbox,
    emptyDelivery: emptyDelivery,
    emptyResponses: emptyResponses,
    parseOutbox: parseOutbox,
    parseDelivery: parseDelivery,
    parseResponses: parseResponses,
    upsertOutboxRequest: upsertOutboxRequest,
    pendingOutboxRequests: pendingOutboxRequests,
    pruneOutbox: pruneOutbox,
    applyResponse: applyResponse,
    applyDeliveryReceipt: applyDeliveryReceipt,
    verifyResponseAgainstOutbox: verifyResponseAgainstOutbox,
    containsSecret: containsSecret
  });
})();
