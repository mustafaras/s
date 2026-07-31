// Code.gs — QY-10 Apps Script giriş noktası ("ince yapıştırıcı" katman).
//
// BU DOSYA BİRİM TEST EDİLEMEZ (GmailApp/UrlFetchApp/PropertiesService/
// Utilities gerçek Apps Script çalışma zamanı dışında yoktur). Bilinçli
// tasarım kuralı: HİÇBİR karar mantığı burada YAZILMAZ — her şey
// ReplyBridgeLogic.gs'teki saf evaluateReply()'e delege edilir (o dosya
// test_reply_bridge.mjs ile 100% Node'da test edilir). Burası yalnız:
// Gmail'den okur → ctx kurar → evaluateReply çağırır → sonucu GitHub'a yazar
// → thread'i etiketler.
//
// KRİTİK İZOLASYON: data/latest.json'a bu script'in HİÇBİR satırı dokunmaz;
// yalnız data/quran-responses.json güncellenir (GET+merge+PUT, sha çakışmasında
// yeniden dener — data/quran-request-outbox.json'dan SALT OKUNUR alınır).
//
// Kurulum (bkz. bu klasördeki README.md):
//   1. script.google.com'da yeni bir proje aç, bu üç .gs dosyasını yapıştır
//      (QuranTransportV1.gs, ReplyBridgeLogic.gs, Code.gs).
//   2. Project Settings → Script Properties'e ekle:
//        GITHUB_TOKEN          (Contents API push izni olan bir PAT)
//        ALLOWED_SENDER_EMAIL  (Raşit'in gerçek e-posta adresi)
//        GITHUB_OWNER          (opsiyonel, varsayılan: mustafaras)
//        GITHUB_REPO           (opsiyonel, varsayılan: seyma-data)
//        GITHUB_BRANCH         (opsiyonel, varsayılan: main)
//   3. Editörden BİR KEZ elle çalıştır: installTimeTrigger()
//      (her 10 dakikada bir processQuranReplies()'i tetikler)

var LABEL_DONE_NAME = 'Kuran-Yolculugu/Islendi';
var MAX_THREADS_PER_RUN = 20;

function getConfig_() {
  var p = PropertiesService.getScriptProperties();
  return {
    githubToken: p.getProperty('GITHUB_TOKEN') || '',
    owner: p.getProperty('GITHUB_OWNER') || 'mustafaras',
    repo: p.getProperty('GITHUB_REPO') || 'seyma-data',
    branch: p.getProperty('GITHUB_BRANCH') || 'main',
    allowedSenderEmail: p.getProperty('ALLOWED_SENDER_EMAIL') || ''
  };
}

function sha256Hex_(str) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  var hex = '';
  for (var i = 0; i < bytes.length; i++) {
    var b = (bytes[i] + 256) % 256; // Apps Script imzalı byte döner
    hex += (b < 16 ? '0' : '') + b.toString(16);
  }
  return hex;
}

// Kesin bir cevap verir: true (var), false (KESİN yok/erişilemez — 404/400/401),
// veya belirsiz durumlarda (5xx, zaman aşımı) THROW eder — çağıran bunu
// "şimdilik karar veremedim, sonraki çalıştırmada tekrar dene" olarak okur;
// thread bu durumda ASLA "işlendi" damgalanmaz.
function checkVideoExists_(videoId) {
  var url = 'https://www.youtube.com/oembed?url=' +
    encodeURIComponent('https://www.youtube.com/watch?v=' + videoId) + '&format=json';
  var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
  var code = resp.getResponseCode();
  if (code === 200) return true;
  if (code === 404 || code === 400 || code === 401) return false;
  throw new Error('oembed_ambiguous_status_' + code);
}

function ghHeaders_(cfg) {
  return {
    Authorization: 'Bearer ' + cfg.githubToken,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
}
function ghContentsUrl_(cfg, path) {
  return 'https://api.github.com/repos/' + encodeURIComponent(cfg.owner) + '/' +
    encodeURIComponent(cfg.repo) + '/contents/' + path;
}

// GET: {sha, obj} — dosya yoksa/bozuksa {sha:null, obj:<boş sözleşme>}.
// GitHub token yalnız header'da taşınır, hiçbir JSON gövdesine girmez.
function ghGetJson_(cfg, path, emptyFactory, parseFn) {
  var resp = UrlFetchApp.fetch(ghContentsUrl_(cfg, path) + '?ref=' + encodeURIComponent(cfg.branch) +
    '&t=' + Date.now(), { headers: ghHeaders_(cfg), muteHttpExceptions: true });
  if (resp.getResponseCode() !== 200) return { sha: null, obj: emptyFactory() };
  var g = JSON.parse(resp.getContentText());
  var decoded = Utilities.newBlob(Utilities.base64Decode(g.content)).getDataAsString('UTF-8');
  var parsed = parseFn(decoded);
  return { sha: g.sha, obj: parsed.value };
}

// PUT: sha çakışmasında (409/422) sha'yı yeniden okuyup sınırlı sayıda dener
// (QY-08/09 ile aynı desen).
function ghPutJson_(cfg, path, obj, message, attempt) {
  attempt = attempt || 0;
  var current = ghGetJson_(cfg, path, function(){ return null; }, function(raw){ return { value: null }; });
  var contentStr = JSON.stringify(obj, null, 2);
  var body = { message: message, content: Utilities.base64Encode(contentStr, Utilities.Charset.UTF_8), branch: cfg.branch };
  if (current.sha) body.sha = current.sha;
  var headers = ghHeaders_(cfg);
  headers['Content-Type'] = 'application/json';
  var resp = UrlFetchApp.fetch(ghContentsUrl_(cfg, path), {
    method: 'put', headers: headers, payload: JSON.stringify(body), muteHttpExceptions: true
  });
  var code = resp.getResponseCode();
  if (code >= 200 && code < 300) return;
  if ((code === 409 || code === 422) && attempt < 3) { ghPutJson_(cfg, path, obj, message, attempt + 1); return; }
  throw new Error('github_put_failed_' + code);
}

function plainBodyOf_(message) {
  try { return message.getPlainBody() || ''; } catch (e) { return ''; }
}

// Ana giriş noktası — zaman tetikleyicisiyle çalışır (bkz. installTimeTrigger).
function processQuranReplies() {
  var cfg = getConfig_();
  if (!cfg.githubToken || !cfg.allowedSenderEmail) {
    Logger.log('GITHUB_TOKEN / ALLOWED_SENDER_EMAIL tanımlı değil — atlanıyor.');
    return;
  }

  var outboxState = ghGetJson_(cfg, QuranTransportV1.PATHS.outbox, QuranTransportV1.emptyOutbox, QuranTransportV1.parseOutbox);
  var responsesState = ghGetJson_(cfg, QuranTransportV1.PATHS.responses, QuranTransportV1.emptyResponses, QuranTransportV1.parseResponses);
  var responses = responsesState.obj;
  var responsesChanged = false;
  var nowIso = new Date().toISOString();

  var query = 'subject:"[KURAN-REQ:" -label:"' + LABEL_DONE_NAME + '"';
  var threads = GmailApp.search(query, 0, MAX_THREADS_PER_RUN);
  var doneLabel = GmailApp.getUserLabelByName(LABEL_DONE_NAME) || GmailApp.createLabel(LABEL_DONE_NAME);

  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    try {
      var messages = thread.getMessages();
      var msg = messages[messages.length - 1]; // en son mesaj (Raşit'in en güncel cevabı)

      var ctx = {
        fromHeader: msg.getFrom(),
        subject: msg.getSubject(),
        bodyText: plainBodyOf_(msg),
        outbox: outboxState.obj,
        allowedSenderEmail: cfg.allowedSenderEmail,
        sha256Hex: sha256Hex_,
        checkVideoExists: checkVideoExists_,
        gmailMessageId: msg.getId(),
        nowIso: nowIso
      };

      // NOT: ctx.bodyText/fromHeader HİÇBİR ZAMAN log'a veya GitHub'a yazılmaz;
      // yalnız kısa requestId + reason kodu loglanır (plan §7: kişisel veri
      // sızdırmama, ham gövdenin repoya yazılmaması).
      var decision = evaluateReply(ctx);

      if (decision.accepted) {
        var res = QuranTransportV1.applyResponse(responses, decision.response, nowIso);
        if (res.changed) { responses = res.value; responsesChanged = true; }
        Logger.log('Kabul edildi: ' + decision.requestId);
      } else {
        Logger.log('Reddedildi: ' + (decision.requestId || '(bilinmiyor)') + ' — ' + decision.reason);
      }

      // Karar KESİN (kabul veya red) — thread'i işlendi olarak damgala,
      // böylece bir sonraki çalıştırma aynı e-postayı tekrar görmez.
      thread.addLabel(doneLabel);
    } catch (e) {
      // Belirsiz/geçici hata (ör. checkVideoExists_'in fırlattığı ambiguous
      // durum, ya da beklenmeyen bir Gmail/ağ hatası): thread ETİKETLENMEZ,
      // bir sonraki çalıştırmada yeniden denenir. Hata metni kısa tutulur.
      Logger.log('Geçici hata, thread pending kaldı: ' + String(e).slice(0, 120));
    }
  }

  if (responsesChanged) {
    ghPutJson_(cfg, QuranTransportV1.PATHS.responses, responses, 'quran-responses: doğrulanmış cevap eklendi');
  }
}

// Editörden BİR KEZ elle çalıştırılır — 10 dakikada bir processQuranReplies()'i
// tetikleyen bir zaman tetikleyicisi kurar. Aynı isimde tetikleyici zaten
// varsa yeniden eklemez (çift tetikleyici = çift işlem riski).
function installTimeTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'processQuranReplies') {
      Logger.log('Tetikleyici zaten kurulu — atlanıyor.');
      return;
    }
  }
  ScriptApp.newTrigger('processQuranReplies').timeBased().everyMinutes(10).create();
  Logger.log('Tetikleyici kuruldu: her 10 dakikada bir processQuranReplies().');
}
