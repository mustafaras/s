// QY-04 — Kur’an taşıma sözleşmeleri doğrulama harness'i (ağ YOK, tarayıcı YOK)
// quranTransportV1.js dosyasını yalnız `window` içeren çıplak bir node:vm
// sandbox'ında çalıştırır. Sandbox'ta localStorage/fetch/document bulunmadığı
// için modül bunlara dokunursa test anında patlar.
// Çalıştırma: node test_quran_transport.js

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var SRC_FILE = 'quranTransportV1.js';
var AT = '2026-07-30T12:00:00.000Z';
var AT2 = '2026-07-30T13:00:00.000Z';
var RID = 'qr_abcd1234', RID2 = 'qr_efgh5678', RID3 = 'qr_ijkl9012';
var RESP = 'qrr_abcd1234', RESP2 = 'qrr_efgh5678';
var VID = 'aaaaaaaaaaa', VID2 = 'bbbbbbbbbbb';
// Sentetik yer tutucu — gerçek bir token DEĞİL.
var TOK = 'TESTtokenTESTtokenTESTtokenTESTtoken1234';
var TOK2 = 'BASKAtokenBASKAtokenBASKAtokenBASKAtok12';
var FP = 'a1b2c3d4e5f60718';

var pass = 0, fail = 0;
function ok(cond, label, detail) {
  if (cond) { pass++; return true; }
  fail++;
  console.error('  ✗ ' + label + (detail !== undefined ? ' — ' + JSON.stringify(detail) : ''));
  return false;
}
function section(t) { console.log('\n' + t); }

// ── yükleme ve izolasyon ────────────────────────────────────────────────────
var src = fs.readFileSync(path.join(__dirname, SRC_FILE), 'utf8');

section('1. İzolasyon ve yükleme');
var code = src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[\r\n])\s*\/\/[^\r\n]*/g, '$1');
['localStorage', 'fetch(', 'XMLHttpRequest', 'document.', 'Date.now', 'Math.random', 'require(']
  .forEach(function (n) { ok(code.indexOf(n) < 0, 'çalışan kod "' + n + '" içermiyor'); });

var sandbox = { window: {} };
vm.createContext(sandbox);
var loadErr = null;
try { vm.runInContext(src, sandbox, { filename: SRC_FILE, timeout: 5000 }); } catch (e) { loadErr = e; }
ok(!loadErr, 'çıplak sandbox’ta hatasız yüklendi', loadErr && loadErr.message);
if (loadErr) process.exit(1);
ok(Object.keys(sandbox.window).length === 1, 'window’a yalnız tek global yazıldı', Object.keys(sandbox.window));

var T = sandbox.window.QuranTransportV1;
ok(!!T && Object.isFrozen(T), 'QuranTransportV1 tanımlı ve donmuş');
if (!T) process.exit(1);

// ── yol koruması: latest.json asla yazılamaz ────────────────────────────────
section('2. Yol koruması (latest.json dokunulmaz)');
ok(T.isWritableTransportPath('data/quran-request-outbox.json'), 'outbox yolu yazılabilir');
ok(T.isWritableTransportPath('data/quran-delivery.json'), 'delivery yolu yazılabilir');
ok(T.isWritableTransportPath('data/quran-responses.json'), 'responses yolu yazılabilir');
['data/latest.json', 'data/gunluk/2026-07-30.json', 'data/observer-inbox.json',
 'data/aeon-outbox.json', 'data/profile-outbox.json', 'data/aeon-media/x.json',
 '', 'latest.json', 'data/quran-responses.json.bak', '../data/latest.json'
].forEach(function (p) {
  ok(T.isWritableTransportPath(p) === false, 'yazılamaz: ' + JSON.stringify(p));
});
ok(T.isForbiddenPath('data/latest.json'), 'latest.json açıkça yasaklı');
ok(T.isForbiddenPath('data/gunluk/2026-07-30.json'), 'günlük snapshot yolu yasaklı');
ok(T.isForbiddenPath('data/aeon-media/abc.json'), 'aeon-media yolu yasaklı');
ok(T.isForbiddenPath('data/quran-responses.json') === false, 'kendi transport yolu yasaklı değil');
ok(Object.keys(T.PATHS).length === 3, 'tam üç transport yolu tanımlı');

// ── kimlik ve token doğrulayıcıları ─────────────────────────────────────────
section('3. Kimlik / token doğrulayıcıları');
ok(T.isValidRequestId(RID), 'geçerli requestId kabul');
['qr_kisa', 'xx_abcd1234', 'qr_', 'qr_abcd 1234', 'qr_abcd!234', '', null, 42, 'QR_abcd1234']
  .forEach(function (v) { ok(!T.isValidRequestId(v), 'geçersiz requestId reddedildi: ' + JSON.stringify(v)); });
ok(T.isValidResponseId(RESP), 'geçerli responseId kabul');
ok(!T.isValidResponseId(RID), 'requestId responseId yerine geçemez');
ok(T.isValidVideoId(VID), 'geçerli videoId kabul');
['aaaaaaaaaa', 'aaaaaaaaaaaa', 'aaaaaaaaaa/', '', null].forEach(function (v) {
  ok(!T.isValidVideoId(v), 'geçersiz videoId reddedildi: ' + JSON.stringify(v));
});
ok(T.isValidReplyToken(TOK), '32+ karakter token kabul');
['kisa', new Array(32).join('a'), new Array(131).join('a'), new Array(41).join('a') + '!', ''].forEach(function (v) {
  ok(!T.isValidReplyToken(v), 'zayıf/bozuk token reddedildi (uzunluk ' + String(v).length + ')');
});
ok(T.tokensEqual(TOK, TOK) === true, 'aynı token eşleşiyor');
ok(T.tokensEqual(TOK, TOK2) === false, 'farklı token eşleşmiyor');
ok(T.tokensEqual(TOK, TOK.slice(0, 10)) === false, 'farklı uzunluk eşleşmiyor');
ok(T.tokensEqual(null, null) === false, 'null token eşleşmiyor');

// ── YouTube bağlantı doğrulama ──────────────────────────────────────────────
section('4. YouTube bağlantı doğrulama');
[['https://www.youtube.com/watch?v=' + VID, VID],
 ['https://youtube.com/watch?v=' + VID, VID],
 ['https://m.youtube.com/watch?v=' + VID, VID],
 ['https://www.youtube.com/watch?feature=share&v=' + VID, VID],
 ['https://www.youtube.com/watch?v=' + VID + '&t=30s', VID],
 ['https://youtu.be/' + VID, VID],
 ['https://youtu.be/' + VID + '?t=5', VID],
 ['https://www.youtube.com/shorts/' + VID, VID]
].forEach(function (c) { ok(T.parseYouTubeVideoId(c[0]) === c[1], 'kabul: ' + c[0]); });

['http://www.youtube.com/watch?v=' + VID,               // https değil
 'https://www.youtube.com/@kanaladi',                    // kanal
 'https://www.youtube.com/channel/UCabcdefghij',         // kanal
 'https://www.youtube.com/playlist?list=PLabc',          // playlist
 'https://www.youtube.com/watch?v=kisa',                 // bozuk id
 'https://evil.com/watch?v=' + VID,                      // başka host
 'https://youtube.com.evil.com/watch?v=' + VID,          // host taklidi
 'javascript:alert(1)',
 'data:text/html,<script>alert(1)</script>',
 'https://vimeo.com/123456',
 '', null, undefined, 42
].forEach(function (u) { ok(T.parseYouTubeVideoId(u) === null, 'reddedildi: ' + JSON.stringify(u)); });

section('5. Metinden tek video çıkarma');
{
  var one = T.extractSingleVideoId('Selam, işte anlatım: https://youtu.be/' + VID + ' kolay gelsin.');
  ok(one.ok && one.videoId === VID, 'tek video bulundu', one);
  var dupe = T.extractSingleVideoId('https://youtu.be/' + VID + ' ve https://www.youtube.com/watch?v=' + VID);
  ok(dupe.ok && dupe.videoId === VID, 'aynı video iki biçimde geçse de tek sayılıyor', dupe);
  var two = T.extractSingleVideoId('https://youtu.be/' + VID + ' ayrıca https://youtu.be/' + VID2);
  ok(!two.ok && two.reason === 'multiple_videos', 'iki FARKLI video belirsiz sayılıp reddedildi', two);
  var none = T.extractSingleVideoId('Merhaba, bugün gönderemedim.');
  ok(!none.ok && none.reason === 'no_video', 'video yoksa reddedildi', none);
  var htmlish = T.extractSingleVideoId('<a href="https://youtu.be/' + VID + '">tıkla</a>');
  ok(htmlish.ok && htmlish.videoId === VID, 'HTML içinden de yalnız videoId çıkarılıyor', htmlish);
  ok(!T.extractSingleVideoId('https://www.youtube.com/@kanal').ok, 'kanal bağlantısı video sayılmıyor');
}

// İnsanlar bağlantıyı cümlenin İÇİNE yazar. Bu blok, gerçek bir e-posta
// cevabının nasıl görüneceğini taklit eder — önceki sürüm bunların çoğunda
// "video yok" diyordu.
section('5b. Gerçekçi e-posta gövdeleri (cümle içi bağlantı)');
{
  var bodies = [
    'Selam, buyur: https://youtu.be/' + VID + '.',
    'İşte anlatım: https://youtu.be/' + VID + ', kolay gelsin.',
    'Link: https://www.youtube.com/watch?v=' + VID + '.',
    'Bak buna https://youtu.be/' + VID + '\nSevgiler',
    'Şuna bir bak: https://youtu.be/' + VID + '!',
    'Bunu mu demiştin: https://youtu.be/' + VID + '?',
    'Video (https://youtu.be/' + VID + ') hazır.',
    '“https://youtu.be/' + VID + '”',
    'Alak sûresi… https://www.youtube.com/watch?v=' + VID + '…',
    'Kısa hâli: https://www.youtube.com/shorts/' + VID + '.',
    'Zamanlı: https://youtu.be/' + VID + '?t=90.',
    '<a href="https://youtu.be/' + VID + '">Alak</a>.',
    'Merhaba,\n\nhttps://youtu.be/' + VID + '\n\nRaşit'
  ];
  bodies.forEach(function (b) {
    var r = T.extractSingleVideoId(b);
    ok(r.ok && r.videoId === VID, 'cümle içi bağlantı bulundu: ' + JSON.stringify(b.slice(0, 46)), r.reason);
  });
  // Kırpma güvenliği: noktalama temizliği yanlış kabule yol açmamalı.
  ok(!T.extractSingleVideoId('https://www.youtube.com/@kanal.').ok, 'noktalı kanal bağlantısı hâlâ reddediliyor');
  ok(!T.extractSingleVideoId('https://evil.com/watch?v=' + VID + '.').ok, 'noktalı yabancı host hâlâ reddediliyor');
  ok(!T.extractSingleVideoId('http://youtu.be/' + VID + '.').ok, 'noktalı http bağlantısı hâlâ reddediliyor');
  ok(!T.extractSingleVideoId('https://youtu.be/kisa.').ok, 'noktalı bozuk kimlik hâlâ reddediliyor');
  var twoInSentence = T.extractSingleVideoId('Biri: https://youtu.be/' + VID + ', diğeri: https://youtu.be/' + VID2 + '.');
  ok(!twoInSentence.ok && twoInSentence.reason === 'multiple_videos', 'cümle içinde iki farklı video hâlâ belirsiz sayılıyor');
}

// ── fixture üreticileri ─────────────────────────────────────────────────────
function outboxEntry(rid, surah, order, tok, at) {
  return { requestId: rid, surahId: surah, revelationOrder: order, surahName: surah,
           requestedAt: at || AT, replyToken: tok || TOK };
}
function responseEntry(rid, respId, surah, vid, at) {
  return { responseId: respId, requestId: rid, surahId: surah, videoId: vid,
           source: 'gmail_reply', receivedAt: at || AT, validatedAt: at || AT,
           senderFingerprint: FP, status: 'ready' };
}

// ── parse: bozuk dosya çökertmiyor ──────────────────────────────────────────
section('6. Bozuk dosyada çökme yok');
[undefined, null, '', '   ', '{bozuk json', '[]', '"metin"', 42, [], { requests: [] }, { requests: 'x' }]
  .forEach(function (raw) {
    var threw = false, r = null;
    try { r = T.parseOutbox(raw); } catch (e) { threw = true; }
    ok(!threw, 'parseOutbox throw etmedi: ' + JSON.stringify(raw));
    ok(r && r.value && typeof r.value.requests === 'object', 'boş sözleşme döndü: ' + JSON.stringify(raw));
    ok(r && r.ok === false && r.errors.length > 0, 'hata bildirildi: ' + JSON.stringify(raw));
  });
['parseDelivery', 'parseResponses'].forEach(function (fn) {
  var threw = false;
  try { T[fn]('{bozuk'); T[fn](null); T[fn]([]); } catch (e) { threw = true; }
  ok(!threw, fn + ' bozuk girdide throw etmiyor');
});

section('7. Sürüm politikası');
{
  var good = T.parseOutbox({ schemaVersion: 1, requests: {} });
  ok(good.ok && good.errors.length === 0, 'geçerli v1 temiz geçiyor', good.errors);
  var old = T.parseOutbox({ schemaVersion: 0, requests: {} });
  ok(old.errors.indexOf('older_schema_version') >= 0, 'eski sürüm işaretlendi ama çökmedi');
  var futureRaw = { schemaVersion: 99, requests: {} };
  futureRaw.requests[RID] = outboxEntry(RID, 'alak', 1);
  var future = T.parseOutbox(futureRaw);
  ok(future.errors.indexOf('newer_schema_version') >= 0, 'yeni sürüm işaretlendi');
  ok(!!future.value.requests[RID], 'yeni sürümde bilinen alanlar yine okundu (güvenli fallback)');
  var missing = T.parseOutbox({ requests: {} });
  ok(missing.errors.indexOf('missing_schema_version') >= 0, 'sürüm yoksa bildirildi');
  ok(missing.value.schemaVersion === 1, 'sürüm yoksa v1 varsayıldı');
}

section('8. Kayıt doğrulama (kötü kayıt sessizce içeri girmiyor)');
{
  var raw = { schemaVersion: 1, updatedAt: AT, requests: {} };
  raw.requests[RID] = outboxEntry(RID, 'alak', 1);
  raw.requests['kotu-anahtar'] = outboxEntry('kotu-anahtar', 'alak', 1);
  raw.requests[RID2] = outboxEntry(RID2, 'alak', 999);              // sıra dışı
  raw.requests[RID3] = { surahId: 'alak', revelationOrder: 1, requestedAt: AT, replyToken: 'kisa' };
  var p = T.parseOutbox(raw);
  ok(Object.keys(p.value.requests).length === 1 && !!p.value.requests[RID], 'yalnız geçerli kayıt kaldı', Object.keys(p.value.requests));
  ok(p.errors.indexOf('bad_revelation_order') >= 0, 'sıra dışı nüzul numarası bildirildi');
  ok(p.errors.indexOf('bad_reply_token') >= 0, 'zayıf token bildirildi');
  ok(!p.ok, 'kirli dosya ok:false');

  var mism = { schemaVersion: 1, requests: {} };
  mism.requests[RID] = outboxEntry(RID2, 'alak', 1);                // anahtar ≠ requestId
  ok(T.parseOutbox(mism).errors.indexOf('outbox_key_mismatch') >= 0, 'anahtar/requestId uyuşmazlığı yakalandı');

  var rr = { schemaVersion: 1, responses: {} };
  rr.responses[RID] = responseEntry(RID, RESP, 'alak', VID);
  rr.responses[RID].senderFingerprint = 'birisi@ornek.com';         // düz adres YASAK
  ok(T.parseResponses(rr).errors.indexOf('bad_sender_fingerprint') >= 0, 'düz e-posta adresi fingerprint olarak reddedildi');
  ok(Object.keys(T.parseResponses(rr).value.responses).length === 0, 'adres taşıyan cevap kaydı içeri alınmadı');

  var badVid = { schemaVersion: 1, responses: {} };
  badVid.responses[RID] = responseEntry(RID, RESP, 'alak', 'kotu-id');
  ok(T.parseResponses(badVid).errors.indexOf('bad_video_id') >= 0, 'geçersiz videoId taşıyan cevap reddedildi');
}

// ── QY-00 riski: iki farklı sûre birbirini ezmemeli ─────────────────────────
section('9. Outbox defteri — istek ezilmesi yok (QY-00 riski)');
{
  var a = T.upsertOutboxRequest(T.emptyOutbox(), outboxEntry(RID, 'alak', 1), AT);
  ok(a.ok, 'ilk istek eklendi', a.errors);
  var b = T.upsertOutboxRequest(a.value, outboxEntry(RID2, 'kalem', 2, TOK2, AT2), AT2);
  ok(b.ok, 'ikinci istek eklendi', b.errors);
  ok(Object.keys(b.value.requests).length === 2, 'İKİ istek de defterde duruyor — ezme yok',
     Object.keys(b.value.requests));
  ok(b.value.requests[RID].surahId === 'alak' && b.value.requests[RID2].surahId === 'kalem', 'her istek kendi sûresini koruyor');
  ok(Object.keys(a.value.requests).length === 1, 'girdi nesnesi mutasyona uğramadı (saflık)');
  ok(b.value !== a.value && b.value.requests !== a.value.requests, 'yeni nesne döndü');

  var bad = T.upsertOutboxRequest(b.value, { requestId: 'kotu', surahId: 'alak', revelationOrder: 1, requestedAt: AT, replyToken: TOK });
  ok(!bad.ok && bad.value === b.value, 'geçersiz istek defteri değiştirmiyor');

  var many = T.emptyOutbox();
  for (var i = 0; i < 60; i++) {
    many = T.upsertOutboxRequest(many, outboxEntry('qr_test' + String(i + 100000), 'alak', 1, TOK,
      '2026-07-30T12:' + (i < 10 ? '0' + i : i) + ':00.000Z')).value;
  }
  ok(Object.keys(many.requests).length <= T.LIMITS.outbox, 'defter üst sınırla korunuyor', Object.keys(many.requests).length);
}

section('10. Bekleyen istekler ve budama');
{
  var ob = T.upsertOutboxRequest(T.emptyOutbox(), outboxEntry(RID, 'alak', 1, TOK, AT), AT).value;
  ob = T.upsertOutboxRequest(ob, outboxEntry(RID2, 'kalem', 2, TOK2, AT2), AT2).value;

  ok(T.pendingOutboxRequests(ob, T.emptyDelivery()).length === 2, 'receipt yokken iki istek de bekliyor');
  ok(T.pendingOutboxRequests(ob, null).length === 2, 'delivery dosyası hiç yoksa çökmüyor');
  ok(T.pendingOutboxRequests(ob, T.emptyDelivery())[0].requestId === RID, 'sıra eskiden yeniye korunuyor');

  var dl = T.applyDeliveryReceipt(T.emptyDelivery(), RID, { status: 'sent', sentAt: AT, providerMessageId: 'msg-1' }, AT).value;
  var pending = T.pendingOutboxRequests(ob, dl);
  ok(pending.length === 1 && pending[0].requestId === RID2, 'postalanan istek tekrar postalanmıyor (çift mail yok)',
     pending.map(function (p) { return p.requestId; }));

  var failed = T.applyDeliveryReceipt(dl, RID2, { status: 'failed', error: 'smtp_timeout' }, AT2).value;
  ok(T.pendingOutboxRequests(ob, failed).length === 1, 'başarısız gönderim tekrar denenmek üzere bekliyor');

  var rs = T.applyResponse(T.emptyResponses(), responseEntry(RID, RESP, 'alak', VID), AT).value;
  var pruned = T.pruneOutbox(ob, dl, rs);
  ok(!pruned.requests[RID], 'postalanmış + cevaplanmış istek defterden düştü');
  ok(!!pruned.requests[RID2], 'cevabı beklenen istek ASLA düşmüyor');
  ok(Object.keys(ob.requests).length === 2, 'pruneOutbox girdiyi mutasyona uğratmadı');
}

section('11. Delivery receipt idempotensi ve monotonluğu');
{
  var d1 = T.applyDeliveryReceipt(T.emptyDelivery(), RID, { status: 'sent', sentAt: AT, providerMessageId: 'msg-1' }, AT);
  ok(d1.ok && d1.changed, 'ilk receipt yazıldı');
  var d2 = T.applyDeliveryReceipt(d1.value, RID, { status: 'sent', sentAt: AT, providerMessageId: 'msg-1' }, AT2);
  ok(d2.ok && d2.changed === false, 'aynı receipt ikinci kez değişiklik yapmıyor (retry güvenli)');
  var d3 = T.applyDeliveryReceipt(d1.value, RID, { status: 'failed', error: 'x' }, AT2);
  ok(d3.changed === false && d3.errors.indexOf('sent_is_final') >= 0, 'gönderildi bilgisi failed ile ezilemiyor');
  ok(d3.value.requests[RID].status === 'sent', 'sent korunuyor');
  var d4 = T.applyDeliveryReceipt(T.emptyDelivery(), 'kotu-id', { status: 'sent' }, AT);
  ok(!d4.ok && d4.errors.indexOf('bad_request_id') >= 0, 'geçersiz requestId reddedildi');
  var d5 = T.applyDeliveryReceipt(T.emptyDelivery(), RID, { status: 'uydurma' }, AT);
  ok(!d5.ok && d5.errors.indexOf('bad_delivery_status') >= 0, 'geçersiz durum reddedildi');
  var d6 = T.applyDeliveryReceipt(T.emptyDelivery(), RID, { status: 'failed', error: new Array(500).join('x') }, AT);
  ok(d6.value.requests[RID].error.length <= 80, 'hata metni kısaltılıyor (stack trace sızmasın)');
}

section('12. Response idempotensi ve supersede');
{
  var r1 = T.applyResponse(T.emptyResponses(), responseEntry(RID, RESP, 'alak', VID), AT);
  ok(r1.ok && r1.changed, 'ilk cevap yazıldı');
  var r2 = T.applyResponse(r1.value, responseEntry(RID, RESP, 'alak', VID), AT2);
  ok(r2.ok && r2.changed === false, 'aynı cevap ikinci kez işlenince değişiklik yok');
  ok(r2.value === r1.value, 'değişiklik yoksa aynı nesne döndü');
  var r3 = T.applyResponse(r1.value, responseEntry(RID, RESP2, 'alak', VID2, AT2), AT2);
  ok(r3.ok && r3.changed, 'yeni cevap supersede ediyor');
  ok(Object.keys(r3.value.responses).length === 1, 'aynı isteğe ikinci KAYIT açılmıyor (requestId anahtarlı)');
  ok(r3.value.responses[RID].videoId === VID2, 'yeni video yazıldı');
  ok(Object.keys(r1.value.responses).length === 1 && r1.value.responses[RID].videoId === VID, 'girdi mutasyona uğramadı');
  var bad = T.applyResponse(r1.value, responseEntry(RID, RESP2, 'alak', 'kotu'), AT2);
  ok(!bad.ok && bad.value === r1.value, 'geçersiz videoId defteri değiştirmiyor');
  var noKey = T.applyResponse(r1.value, { responseId: RESP2, surahId: 'alak', videoId: VID2 }, AT2);
  ok(!noKey.ok && noKey.errors.indexOf('bad_request_id') >= 0, 'requestId olmayan cevap reddedildi');
}

section('13. Çapraz doğrulama (sahte gönderici / yanlış sûre)');
{
  var ob = T.upsertOutboxRequest(T.emptyOutbox(), outboxEntry(RID, 'alak', 1, TOK, AT), AT).value;
  var good = T.verifyResponseAgainstOutbox(ob, { requestId: RID, replyToken: TOK, surahId: 'alak', videoId: VID });
  ok(good.ok && good.revelationOrder === 1, 'doğru istek + token + sûre kabul', good);
  ok(T.verifyResponseAgainstOutbox(ob, { requestId: RID, replyToken: TOK2, surahId: 'alak', videoId: VID }).reason === 'token_mismatch',
     'yanlış token reddedildi');
  ok(T.verifyResponseAgainstOutbox(ob, { requestId: RID, replyToken: TOK, surahId: 'kalem', videoId: VID }).reason === 'surah_mismatch',
     'yanlış sûre eşlemesi reddedildi');
  ok(T.verifyResponseAgainstOutbox(ob, { requestId: RID2, replyToken: TOK, surahId: 'alak', videoId: VID }).reason === 'unknown_request',
     'bilinmeyen istek reddedildi');
  ok(T.verifyResponseAgainstOutbox(ob, { requestId: RID, replyToken: TOK, surahId: 'alak', videoId: 'kotu' }).reason === 'bad_video_id',
     'geçersiz video reddedildi');
  ok(T.verifyResponseAgainstOutbox(ob, { requestId: 'toString', replyToken: TOK, surahId: 'alak', videoId: VID }).reason === 'unknown_request',
     'prototype anahtarı istek gibi çözülmüyor');
  ok(T.verifyResponseAgainstOutbox(ob, null).reason === 'bad_claim', 'boş iddia reddedildi');
  ok(T.verifyResponseAgainstOutbox(null, { requestId: RID }).reason === 'unknown_request', 'outbox yoksa çökmüyor');
}

section('14. Secret sızıntı denetimi');
{
  var ob = T.upsertOutboxRequest(T.emptyOutbox(), outboxEntry(RID, 'alak', 1, TOK, AT), AT).value;
  ok(T.containsSecret(ob) === true, 'outbox replyToken taşır → istemciye GÖNDERİLEMEZ');
  var rs = T.applyResponse(T.emptyResponses(), responseEntry(RID, RESP, 'alak', VID), AT).value;
  ok(T.containsSecret(rs) === false, 'responses dosyası secret taşımıyor → istemciye güvenli');
  var dl = T.applyDeliveryReceipt(T.emptyDelivery(), RID, { status: 'sent', sentAt: AT, providerMessageId: 'msg-1' }, AT).value;
  ok(T.containsSecret(dl) === false, 'delivery dosyası secret taşımıyor');
  ok(T.containsSecret({ note: 'birisi@ornek.com' }) === true, 'e-posta adresi yakalanıyor');
  ok(T.containsSecret({ ghToken: 'x' }) === true, 'ghToken yakalanıyor');
  ok(T.containsSecret({ h: 'Bearer abc' }) === true, 'Bearer başlığı yakalanıyor');
  var circular = {}; circular.self = circular;
  ok(T.containsSecret(circular) === true, 'serileştirilemeyen yük güvenli tarafta (true) sayılıyor');
}

console.log('\n' + (fail === 0 ? '✅' : '❌') + ' Kur’an transport: ' + pass + '/' + (pass + fail) + ' geçti');
process.exit(fail === 0 ? 0 : 1);
