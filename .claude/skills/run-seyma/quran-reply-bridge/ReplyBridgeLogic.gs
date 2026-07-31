// ReplyBridgeLogic.gs — QY-10 saf karar mantığı.
//
// GmailApp/UrlFetchApp/PropertiesService'e HİÇ dokunmaz — hepsi ctx üzerinden
// enjekte edilir (sha256Hex, checkVideoExists). Bu sayede Node'da, gerçek
// Apps Script çalışma zamanı OLMADAN test edilebilir (bkz. test_reply_bridge.mjs).
//
// QuranTransportV1.gs TEK doğrulama kaynağıdır — regex/URL ayrıştırma veya
// token karşılaştırma mantığı burada TEKRAR YAZILMAZ; hepsi oradan çağrılır.
//
// Tehdit modeli (plan QY-00/QY-10):
//   - Sahte gönderici  → isAllowedSender
//   - Yanlış/eski token → QuranTransportV1.verifyResponseAgainstOutbox
//   - Yanlış sûre eşleme → aynı fonksiyon (claim.surahId outbox kaydından gelir,
//     yani e-postadan gelen bağımsız bir iddia değil — bu akışta sûre kimliği
//     her zaman requestId üzerinden outbox'tan türetilir, asla e-posta
//     gövdesinden okunmaz)
//   - Belirsiz/sahte video → QuranTransportV1.extractSingleVideoId + isValidVideoId
//   - Silinmiş video → ctx.checkVideoExists (gerçekte YouTube oEmbed)

var QURAN_REPLY_SUBJECT_RE = /\[KURAN-REQ:([^:\]]+):([^:\]]+)\]/;

function parseRequestSubject(subject) {
  var m = String(subject || '').match(QURAN_REPLY_SUBJECT_RE);
  if (!m) return null;
  return { requestId: m[1], replyToken: m[2] };
}

// "Raşit <rasit@example.com>" → "rasit@example.com" (küçük harf, kırpılmış).
// Başlıkta köşeli parantez yoksa (yalnız çıplak adres) olduğu gibi kullanılır.
function normalizeEmailAddress(raw) {
  var s = String(raw || '');
  var m = s.match(/<([^>]+)>/);
  var addr = m ? m[1] : s;
  return addr.trim().toLowerCase();
}

function isAllowedSender(fromHeader, allowedSenderEmail) {
  if (!allowedSenderEmail) return false; // Script Properties yapılandırılmadıysa KİMSE izinli değildir
  return normalizeEmailAddress(fromHeader) === normalizeEmailAddress(allowedSenderEmail);
}

// evaluateReply(ctx) tek bir e-posta hakkında kesin bir karar döner:
//   kabul  → { accepted:true,  requestId, videoId, response:{...quran-responses.json kaydı...} }
//   ret    → { accepted:false, requestId:string|null, reason:'unauthorized_sender'|'missing_request_id'
//              |'unknown_request'|'token_mismatch'|'surah_mismatch'|'bad_video_id'
//              |'no_video'|'multiple_videos'|'video_unavailable' }
//
// ctx alanları — HİÇBİRİ Apps Script'e özel değildir, hepsi düz değer/fonksiyon:
//   fromHeader           e-postanın ham "From" başlığı
//   subject              e-postanın konu satırı (Gmail "Re:" önekini korur, sorun değil)
//   bodyText              düz metin gövde (HTML değil)
//   outbox                QuranTransportV1.parseOutbox(...).value — ZATEN ayrıştırılmış
//   allowedSenderEmail    Script Properties'ten okunan tek izinli adres
//   sha256Hex(str)        enjekte edilen özet fonksiyonu (gerçekte Utilities.computeDigest)
//   checkVideoExists(id)  enjekte edilen varlık kontrolü (gerçekte YouTube oEmbed GET)
//   gmailMessageId        Gmail mesaj kimliği — deterministik responseId için kullanılır
//                         (AYNI e-posta iki kez işlenirse AYNI responseId üretir, böylece
//                         QuranTransportV1.applyResponse zaten no-op yapar — plan §6/§9
//                         "aynı cevap ikinci kez işlendiğinde state değişmez")
//   nowIso                çağırandan gelen zaman damgası (Date.now() burada YOK)
function evaluateReply(ctx) {
  var T = QuranTransportV1;

  if (!isAllowedSender(ctx.fromHeader, ctx.allowedSenderEmail)) {
    return { accepted: false, reason: 'unauthorized_sender', requestId: null };
  }

  var parsed = parseRequestSubject(ctx.subject);
  if (!parsed) {
    return { accepted: false, reason: 'missing_request_id', requestId: null };
  }

  var video = T.extractSingleVideoId(ctx.bodyText);
  if (!video.ok) {
    return { accepted: false, reason: video.reason, requestId: parsed.requestId };
  }

  var req = (ctx.outbox && ctx.outbox.requests) ? ctx.outbox.requests[parsed.requestId] : null;
  if (!req) {
    return { accepted: false, reason: 'unknown_request', requestId: parsed.requestId };
  }

  // surahId E-POSTADAN OKUNMAZ — her zaman bulunan outbox kaydından gelir.
  // Bu, "yanlış sûre eşleme" tehdidini yapısal olarak imkânsız kılar: saldırgan
  // doğru requestId+token'ı bilse bile başka bir sûreye video eşleyemez.
  var claim = {
    requestId: parsed.requestId,
    replyToken: parsed.replyToken,
    surahId: req.surahId,
    videoId: video.videoId
  };
  var verify = T.verifyResponseAgainstOutbox(ctx.outbox, claim);
  if (!verify.ok) {
    return { accepted: false, reason: verify.reason, requestId: parsed.requestId };
  }

  if (!ctx.checkVideoExists(video.videoId)) {
    return { accepted: false, reason: 'video_unavailable', requestId: parsed.requestId };
  }

  var responseId = 'qrr_' + ctx.sha256Hex(parsed.requestId + ':' + (ctx.gmailMessageId || '')).slice(0, 40);
  var senderFingerprint = ctx.sha256Hex(normalizeEmailAddress(ctx.fromHeader));

  return {
    accepted: true,
    requestId: parsed.requestId,
    videoId: video.videoId,
    response: {
      responseId: responseId,
      requestId: parsed.requestId,
      surahId: req.surahId,
      videoId: video.videoId,
      source: 'gmail_reply',
      receivedAt: ctx.nowIso,
      validatedAt: ctx.nowIso,
      senderFingerprint: senderFingerprint,
      status: 'ready'
    }
  };
}
