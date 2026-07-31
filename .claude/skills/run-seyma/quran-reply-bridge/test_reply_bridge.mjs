#!/usr/bin/env node
// test_reply_bridge.mjs — QY-10 kabul kapısı: ReplyBridgeLogic.gs'in saf
// evaluateReply() karar mantığının fixture testleri.
//
// GERÇEK GMAIL/YOUTUBE/GITHUB ÇAĞRISI YOK — sha256Hex ve checkVideoExists
// tamamen enjekte edilmiş sahte fonksiyonlardır. QuranTransportV1.gs ve
// ReplyBridgeLogic.gs, gerçek Apps Script çalışma zamanı OLMADAN, düz
// `node:vm` içinde çalıştırılır (Apps Script'in kendisi zaten `window`
// kullanmaz, bu yüzden ekstra bir DOM stub'a gerek yoktur).
//
// Kapsam — plan QY-10 DOĞRULAMA listesiyle BİREBİR:
// geçerli cevap, spoof sender, yanlış token, iki URL, bozuk URL,
// tekrar cevap, silinmiş video — artı ek dayanıklılık/gizlilik testleri.
//
// Çalıştırma: node test_reply_bridge.mjs

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail !== undefined ? ' — ' + JSON.stringify(detail) : '')); }
}
function section(t) { console.log('\n' + t); }

const sandbox = { console };
vm.createContext(sandbox);
for (const f of ['QuranTransportV1.gs', 'ReplyBridgeLogic.gs']) {
  vm.runInContext(fs.readFileSync(path.join(DIR, f), 'utf8'), sandbox, { filename: f });
}
const T = sandbox.QuranTransportV1;
const evaluateReply = sandbox.evaluateReply;
const parseRequestSubject = sandbox.parseRequestSubject;
const isAllowedSender = sandbox.isAllowedSender;
const normalizeEmailAddress = sandbox.normalizeEmailAddress;

// Gerçek Apps Script'te Utilities.computeDigest(SHA_256,...) hex döner;
// Node'un crypto modülüyle davranışça eşdeğer (aynı uzunluk/karakter seti).
const sha256Hex = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

const AT = '2026-07-31T09:00:00.000Z';
const ALLOWED = 'rasit@example.com';
const TOKEN = 'a'.repeat(40);
const VID = 'dQw4w9WgXcQ';
const VID2 = 'aaaaaaaaaaa';

function outboxWith(requestId, surahId, order, token) {
  const requests = {};
  requests[requestId] = {
    requestId, surahId, revelationOrder: order, mushafOrder: null,
    surahName: surahId, requestedAt: AT, replyToken: token || TOKEN,
  };
  return { schemaVersion: 1, updatedAt: AT, requests };
}
function ctxFor(overrides) {
  return Object.assign({
    fromHeader: 'Raşit <' + ALLOWED + '>',
    subject: '[KURAN-REQ:qr_' + 'x'.repeat(24) + ':' + TOKEN + '] 1. Durak · Alak',
    bodyText: 'https://www.youtube.com/watch?v=' + VID,
    outbox: outboxWith('qr_' + 'x'.repeat(24), 'alak', 1),
    allowedSenderEmail: ALLOWED,
    sha256Hex, checkVideoExists: () => true,
    gmailMessageId: 'msg-1', nowIso: '2026-07-31T10:00:00.000Z',
  }, overrides);
}

console.log('\n=== QY-10 Gmail cevap köprüsü — saf karar mantığı ===\n');

// ── 1) Geçerli cevap ────────────────────────────────────────────────────
section('1. Geçerli cevap kabul edilir');
{
  const d = evaluateReply(ctxFor({}));
  ok('accepted:true', d.accepted === true, d);
  ok('doğru requestId', d.requestId === 'qr_' + 'x'.repeat(24));
  ok('doğru videoId', d.videoId === VID);
  ok('response.responseId QY-04 desenine uyuyor', T.isValidResponseId(d.response.responseId), d.response && d.response.responseId);
  ok('response.surahId outbox kaydından geldi', d.response.surahId === 'alak');
  ok('response.source gmail_reply', d.response.source === 'gmail_reply');
  ok('response.status ready', d.response.status === 'ready');
  ok('senderFingerprint QY-04 sözleşmesine uyuyor (64 hex)', /^[a-f0-9]{64}$/.test(d.response.senderFingerprint));
  ok('response QuranTransportV1.applyResponse’tan hatasız geçiyor',
    T.applyResponse(T.emptyResponses(), d.response, AT).ok);
  ok('kabul edilen sonuçta ham gövde/adres YOK (yalnız sanitize edilmiş alanlar)',
    JSON.stringify(d).indexOf(ALLOWED) < 0 && JSON.stringify(d).indexOf('youtube.com') < 0);
}

// ── 2) Spoof sender ─────────────────────────────────────────────────────
section('2. Sahte gönderici reddedilir');
{
  const d = evaluateReply(ctxFor({ fromHeader: 'Saldırgan <evil@example.com>' }));
  ok('unauthorized_sender', d.accepted === false && d.reason === 'unauthorized_sender', d);
  ok('requestId sızdırılmadı (henüz doğrulanmadı)', d.requestId === null);

  const d2 = evaluateReply(ctxFor({ allowedSenderEmail: '' }));
  ok('allowedSenderEmail boşsa KİMSE izinli değil', d2.accepted === false && d2.reason === 'unauthorized_sender');

  const d3 = evaluateReply(ctxFor({ fromHeader: 'RASIT@EXAMPLE.COM' }));
  ok('adres karşılaştırması case-insensitive', d3.accepted === true, d3);
}

// ── 3) Yanlış token ──────────────────────────────────────────────────────
section('3. Yanlış/eski token reddedilir');
{
  const badSubject = '[KURAN-REQ:qr_' + 'x'.repeat(24) + ':' + 'b'.repeat(40) + '] 1. Durak · Alak';
  const d = evaluateReply(ctxFor({ subject: badSubject }));
  ok('token_mismatch', d.accepted === false && d.reason === 'token_mismatch', d);
  ok('requestId yine de biliniyor (audit için)', d.requestId === 'qr_' + 'x'.repeat(24));
}

// ── 4) İki URL (belirsiz cevap) ───────────────────────────────────────────
section('4. Cümle içinde iki farklı video belirsiz sayılır');
{
  const body = 'Birini izle: https://youtu.be/' + VID + ' ya da https://youtu.be/' + VID2 + '.';
  const d = evaluateReply(ctxFor({ bodyText: body }));
  ok('multiple_videos', d.accepted === false && d.reason === 'multiple_videos', d);

  // Aynı video birden fazla biçimde tekrar etse bile TEK sayılır (belirsiz değil).
  const sameTwice = 'https://www.youtube.com/watch?v=' + VID + ' aynı video: https://youtu.be/' + VID;
  const d2 = evaluateReply(ctxFor({ bodyText: sameTwice }));
  ok('aynı video tekrar etse de kabul edilir', d2.accepted === true, d2);
}

// ── 5) Bozuk URL ──────────────────────────────────────────────────────────
section('5. Bozuk/geçersiz bağlantı reddedilir');
{
  const d = evaluateReply(ctxFor({ bodyText: 'İşte anlatım: https://vimeo.com/12345.' }));
  ok('YouTube dışı URL → no_video', d.accepted === false && d.reason === 'no_video', d);

  const d2 = evaluateReply(ctxFor({ bodyText: 'Kanalıma bak: https://www.youtube.com/@rasit' }));
  ok('kanal/profil URL’si → no_video', d2.accepted === false && d2.reason === 'no_video', d2);

  const d3 = evaluateReply(ctxFor({ bodyText: 'Kısa bağlantı: https://youtu.be/kisa.' }));
  ok('geçersiz (kısa) video kimliği → no_video', d3.accepted === false && d3.reason === 'no_video', d3);

  const d4 = evaluateReply(ctxFor({ bodyText: '' }));
  ok('boş gövde → no_video', d4.accepted === false && d4.reason === 'no_video');

  const d5 = evaluateReply(ctxFor({ bodyText: 'javascript:alert(1) hiçbir video yok burada' }));
  ok('javascript: gibi tehlikeli şema → no_video', d5.accepted === false && d5.reason === 'no_video');
}

// ── 6) Tekrar cevap (idempotency) ────────────────────────────────────────
section('6. Aynı e-posta ikinci kez işlense state değişmez');
{
  const d1 = evaluateReply(ctxFor({ gmailMessageId: 'msg-42' }));
  const d2 = evaluateReply(ctxFor({ gmailMessageId: 'msg-42' }));
  ok('aynı gmailMessageId AYNI responseId üretir (deterministik)',
    d1.response.responseId === d2.response.responseId, [d1.response.responseId, d2.response.responseId]);

  let responses = T.emptyResponses();
  const r1 = T.applyResponse(responses, d1.response, AT);
  responses = r1.value;
  const r2 = T.applyResponse(responses, d2.response, AT);
  ok('ikinci uygulama state’i değiştirmiyor (changed:false)', r2.changed === false, r2);
  ok('tek kayıt var (iki değil)', Object.keys(responses.responses).length === 1);
}

// ── 7) Silinmiş/erişilemez video ─────────────────────────────────────────
section('7. Silinmiş video reddedilir, ancak belirsiz durum thread’i etkilemez');
{
  const d = evaluateReply(ctxFor({ checkVideoExists: () => false }));
  ok('video_unavailable', d.accepted === false && d.reason === 'video_unavailable', d);

  // checkVideoExists BELİRSİZ bir durumda (ör. gerçek Code.gs'te ağ hatası)
  // fırlatmalıdır — evaluateReply bunu YAKALAMAZ, çağıranın (Code.gs) thread'i
  // "işlendi" damgalamadan bir sonraki çalıştırmaya bırakmasını sağlar.
  let threw = false;
  try {
    evaluateReply(ctxFor({ checkVideoExists: () => { throw new Error('ambiguous'); } }));
  } catch (e) { threw = true; }
  ok('belirsiz kontrol evaluateReply’den dışarı fırlar (yutulmaz)', threw);
}

// ── 8) Bilinmeyen istek ────────────────────────────────────────────────────
section('8. Bilinmeyen/eski requestId reddedilir');
{
  const emptyOb = T.emptyOutbox();
  const d = evaluateReply(ctxFor({ outbox: emptyOb }));
  ok('unknown_request', d.accepted === false && d.reason === 'unknown_request', d);
}

// ── 9) Konu satırında istek kimliği yok ───────────────────────────────────
section('9. Konu satırında [KURAN-REQ:...] yoksa reddedilir');
{
  const d = evaluateReply(ctxFor({ subject: 'Re: merhaba, işte video' }));
  ok('missing_request_id', d.accepted === false && d.reason === 'missing_request_id', d);
  ok('requestId null (hiçbir şey ayrıştırılamadı)', d.requestId === null);
}

// ── 10) Gizlilik: reddedilen sonuçlar da ham içerik sızdırmaz ────────────
section('10. Reddedilen sonuçlarda ham gövde/adres/token asla yok');
{
  const rejections = [
    evaluateReply(ctxFor({ fromHeader: 'Kötü <evil@example.com>' })),
    evaluateReply(ctxFor({ subject: 'Re: konu yok' })),
    evaluateReply(ctxFor({ bodyText: 'https://vimeo.com/x' })),
    evaluateReply(ctxFor({ outbox: T.emptyOutbox() })),
  ];
  rejections.forEach((d, i) => {
    const s = JSON.stringify(d);
    ok('red #' + i + ' — sadece {accepted,reason,requestId} alanları var',
      Object.keys(d).sort().join(',') === 'accepted,reason,requestId', d);
    ok('red #' + i + ' — TOKEN metni yok', s.indexOf(TOKEN) < 0);
  });
}

// ── 11) parseRequestSubject / isAllowedSender / normalizeEmailAddress ────
section('11. Yardımcı ayrıştırıcılar');
{
  ok('parseRequestSubject temel biçimi ayrıştırıyor',
    JSON.stringify(parseRequestSubject('[KURAN-REQ:qr_abc:tok123] 1. Durak · Alak')) === JSON.stringify({ requestId: 'qr_abc', replyToken: 'tok123' }));
  ok('Gmail “Re:” önekiyle de çalışıyor',
    !!parseRequestSubject('Re: [KURAN-REQ:qr_abc:tok123] 1. Durak · Alak'));
  ok('bilinmeyen biçimde null döner', parseRequestSubject('rastgele konu') === null);
  ok('normalizeEmailAddress köşeli parantezi ayıklıyor',
    normalizeEmailAddress('Raşit <Rasit@Example.COM>') === 'rasit@example.com');
  ok('normalizeEmailAddress çıplak adreste de çalışıyor',
    normalizeEmailAddress('RASIT@EXAMPLE.COM') === 'rasit@example.com');
  ok('isAllowedSender eşleşmeyen adreste false', isAllowedSender('x@y.com', ALLOWED) === false);
  ok('isAllowedSender boş allowlist’te false', isAllowedSender(ALLOWED, '') === false);
}

console.log('\n' + (failed === 0 ? '✅ ' : '❌ ') + passed + ' geçti, ' + failed + ' kaldı.');
process.exit(failed === 0 ? 0 : 1);
