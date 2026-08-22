#!/usr/bin/env node
// test_transport_parity.mjs — QY-10 "sıfır kayma" kanıtı: bu klasördeki
// QuranTransportV1.gs (Apps Script uyarlaması), mustafaras/s köküdeki
// quranTransportV1.js (QY-04, uygulamanın gerçekten kullandığı modül) ile
// AYNI girdi setinde AYNI sonuçları üretiyor mu?
//
// Amaç: iki kopya arasında mantık driftini imkânsız kılmak. Tek beklenen
// fark, dosyanın en son satırındaki dışa aktarım mekanizmasıdır
// (window.X = ... vs. var X = (IIFE)()); GÖVDE birebir aynı olmalı ve bu
// test bunu ÇALIŞTIRARAK kanıtlar, yalnızca metin karşılaştırmasıyla değil.
//
// Çalıştırma: node test_transport_parity.mjs

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(DIR, '..', '..', '..', '..');

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail !== undefined ? ' — ' + JSON.stringify(detail) : '')); }
}
function section(t) { console.log('\n' + t); }

// Gerçek modül `window.QuranTransportV1 = ...` yazar — minimal bir window stub'ı yeterli.
const appSandbox = { console, window: {} };
appSandbox.window.window = appSandbox.window;
vm.createContext(appSandbox);
vm.runInContext(fs.readFileSync(path.join(REPO, 'app/content/quranTransportV1.js'), 'utf8'), appSandbox, { filename: 'app/content/quranTransportV1.js' });
const RealT = appSandbox.window.QuranTransportV1;

// Apps Script kopyası hiçbir ambient global beklemez — düz üst seviye var.
const gsSandbox = { console };
vm.createContext(gsSandbox);
vm.runInContext(fs.readFileSync(path.join(DIR, 'QuranTransportV1.gs'), 'utf8'), gsSandbox, { filename: 'QuranTransportV1.gs' });
const GsT = gsSandbox.QuranTransportV1;

console.log('\n=== QY-10 — QuranTransportV1.gs ↔ quranTransportV1.js sıfır-kayma kanıtı ===\n');

section('1. Dışa aktarılan yüzey birebir aynı');
{
  const realKeys = Object.keys(RealT).sort();
  const gsKeys = Object.keys(GsT).sort();
  ok('aynı anahtar kümesi', JSON.stringify(realKeys) === JSON.stringify(gsKeys), { real: realKeys, gs: gsKeys });
  ok('SCHEMA_VERSION eşit', RealT.SCHEMA_VERSION === GsT.SCHEMA_VERSION);
  ok('PATHS eşit', JSON.stringify(RealT.PATHS) === JSON.stringify(GsT.PATHS));
  ok('FORBIDDEN_PATHS eşit', JSON.stringify(RealT.FORBIDDEN_PATHS) === JSON.stringify(GsT.FORBIDDEN_PATHS));
  ok('LIMITS eşit', JSON.stringify(RealT.LIMITS) === JSON.stringify(GsT.LIMITS));
}

const AT = '2026-07-31T09:00:00.000Z', AT2 = '2026-07-31T10:00:00.000Z';
const TOK = 'a'.repeat(40), TOK2 = 'b'.repeat(40);
const VID = 'dQw4w9WgXcQ', VID2 = 'aaaaaaaaaaa';
const RID = 'qr_' + 'x'.repeat(24), RID2 = 'qr_' + 'y'.repeat(24);
const RESP = 'qrr_' + 'z'.repeat(24);

function bothSame(name, fn) {
  const r = fn(RealT), g = fn(GsT);
  ok(name, JSON.stringify(r) === JSON.stringify(g), { real: r, gs: g });
}

section('2. Doğrulayıcılar (isValid*) aynı sonuç veriyor');
{
  const ids = [RID, 'bad', '', null, undefined, 'qr_ab', 'qr_' + 'x'.repeat(90)];
  ids.forEach((v) => bothSame('isValidRequestId(' + JSON.stringify(v) + ')', (T) => T.isValidRequestId(v)));
  ['alak', 'fatiha-suresi', 'BAD', '', '123', null].forEach((v) =>
    bothSame('isValidSurahId(' + JSON.stringify(v) + ')', (T) => T.isValidSurahId(v)));
  [VID, 'kisa', 'x'.repeat(11), null, 12].forEach((v) =>
    bothSame('isValidVideoId(' + JSON.stringify(v) + ')', (T) => T.isValidVideoId(v)));
  [TOK, 'kisa', '', null].forEach((v) =>
    bothSame('isValidReplyToken(' + JSON.stringify(v) + ')', (T) => T.isValidReplyToken(v)));
}

section('3. YouTube URL ayrıştırma aynı sonuç veriyor');
{
  const urls = [
    'https://www.youtube.com/watch?v=' + VID,
    'https://youtu.be/' + VID,
    'https://www.youtube.com/shorts/' + VID,
    'https://vimeo.com/12345',
    'https://www.youtube.com/@rasit',
    'not a url',
    null,
  ];
  urls.forEach((u) => bothSame('parseYouTubeVideoId(' + JSON.stringify(u) + ')', (T) => T.parseYouTubeVideoId(u)));

  const bodies = [
    'https://www.youtube.com/watch?v=' + VID,
    'iki video: https://youtu.be/' + VID + ' ve https://youtu.be/' + VID2,
    'aynı video iki kez: https://youtu.be/' + VID + ' https://youtu.be/' + VID,
    'hiç video yok',
    '',
    'İşte: https://youtu.be/' + VID + '.',
  ];
  bodies.forEach((b) => bothSame('extractSingleVideoId(' + JSON.stringify(b) + ')', (T) => T.extractSingleVideoId(b)));
}

section('4. tokensEqual aynı sonuç veriyor');
{
  [[TOK, TOK], [TOK, TOK2], [TOK, ''], ['', ''], [null, TOK]].forEach(([a, b]) =>
    bothSame('tokensEqual(' + JSON.stringify(a) + ',' + JSON.stringify(b) + ')', (T) => T.tokensEqual(a, b)));
}

section('5. parseOutbox / parseDelivery / parseResponses aynı sonuç veriyor');
{
  const goodOutbox = { schemaVersion: 1, updatedAt: AT, requests: {} };
  goodOutbox.requests[RID] = { requestId: RID, surahId: 'alak', revelationOrder: 1, mushafOrder: 96, surahName: 'Alak', requestedAt: AT, replyToken: TOK };
  bothSame('parseOutbox geçerli dosya', (T) => T.parseOutbox(goodOutbox));

  const brokenOutbox = { schemaVersion: 1, requests: { 'kotu-key': {} } };
  bothSame('parseOutbox bozuk dosya', (T) => T.parseOutbox(brokenOutbox));
  bothSame('parseOutbox tamamen bozuk girdi', (T) => T.parseOutbox('{bozuk json'));
  bothSame('parseOutbox null girdi', (T) => T.parseOutbox(null));

  const goodDelivery = { schemaVersion: 1, requests: {} };
  goodDelivery.requests[RID] = { status: 'sent', sentAt: AT, providerMessageId: 'x', error: null };
  bothSame('parseDelivery geçerli dosya', (T) => T.parseDelivery(goodDelivery));

  const goodResponses = { schemaVersion: 1, responses: {} };
  goodResponses.responses[RID] = { responseId: RESP, requestId: RID, surahId: 'alak', videoId: VID, source: 'gmail_reply', receivedAt: AT, validatedAt: AT, senderFingerprint: 'a'.repeat(64), status: 'ready' };
  bothSame('parseResponses geçerli dosya', (T) => T.parseResponses(goodResponses));

  const spoofedFp = { schemaVersion: 1, responses: {} };
  spoofedFp.responses[RID] = Object.assign({}, goodResponses.responses[RID], { senderFingerprint: 'birisi@ornek.com' });
  bothSame('parseResponses düz e-posta fingerprint reddi', (T) => T.parseResponses(spoofedFp));
}

section('6. upsertOutboxRequest / pendingOutboxRequests aynı sonuç veriyor');
{
  const entry1 = { requestId: RID, surahId: 'alak', revelationOrder: 1, mushafOrder: 96, surahName: 'Alak', requestedAt: AT, replyToken: TOK };
  const entry2 = { requestId: RID2, surahId: 'kalem', revelationOrder: 2, mushafOrder: 68, surahName: 'Kalem', requestedAt: AT2, replyToken: TOK2 };
  bothSame('upsertOutboxRequest tek kayıt', (T) => T.upsertOutboxRequest(T.emptyOutbox(), entry1, AT));

  function buildOutbox(T) {
    let ob = T.upsertOutboxRequest(T.emptyOutbox(), entry1, AT).value;
    ob = T.upsertOutboxRequest(ob, entry2, AT2).value;
    return ob;
  }
  bothSame('upsertOutboxRequest iki farklı sûre', buildOutbox);

  const delivery = { schemaVersion: 1, requests: {} };
  delivery.requests[RID] = { status: 'sent', sentAt: AT, providerMessageId: 'x', error: null };
  bothSame('pendingOutboxRequests bir gönderilmiş bir bekleyen', (T) => T.pendingOutboxRequests(buildOutbox(T), delivery));
}

section('7. applyResponse / applyDeliveryReceipt idempotency aynı sonuç veriyor');
{
  const resp = { responseId: RESP, requestId: RID, surahId: 'alak', videoId: VID, source: 'gmail_reply', receivedAt: AT, validatedAt: AT, senderFingerprint: 'a'.repeat(64), status: 'ready' };
  bothSame('applyResponse ilk uygulama', (T) => T.applyResponse(T.emptyResponses(), resp, AT));
  function appliedTwice(T) {
    const r1 = T.applyResponse(T.emptyResponses(), resp, AT);
    return T.applyResponse(r1.value, resp, AT2);
  }
  bothSame('applyResponse ikinci kez aynı cevap → changed:false', appliedTwice);

  const rec = { status: 'sent', sentAt: AT, providerMessageId: 'msg1', error: null };
  bothSame('applyDeliveryReceipt ilk uygulama', (T) => T.applyDeliveryReceipt(T.emptyDelivery(), RID, rec, AT));
  function sentThenFailed(T) {
    const d1 = T.applyDeliveryReceipt(T.emptyDelivery(), RID, rec, AT);
    return T.applyDeliveryReceipt(d1.value, RID, { status: 'failed', sentAt: null, providerMessageId: null, error: 'x' }, AT2);
  }
  bothSame('sent→failed reddi (sent_is_final) aynı davranış', sentThenFailed);
}

section('8. verifyResponseAgainstOutbox aynı sonuç veriyor');
{
  const outbox = { schemaVersion: 1, requests: {} };
  outbox.requests[RID] = { requestId: RID, surahId: 'alak', revelationOrder: 1, mushafOrder: 96, surahName: 'Alak', requestedAt: AT, replyToken: TOK };

  const claims = [
    { requestId: RID, replyToken: TOK, surahId: 'alak', videoId: VID },
    { requestId: RID, replyToken: TOK2, surahId: 'alak', videoId: VID },
    { requestId: RID, replyToken: TOK, surahId: 'kalem', videoId: VID },
    { requestId: RID, replyToken: TOK, surahId: 'alak', videoId: 'kotu' },
    { requestId: 'qr_' + 'z'.repeat(24), replyToken: TOK, surahId: 'alak', videoId: VID },
  ];
  claims.forEach((c, i) => bothSame('verifyResponseAgainstOutbox claim #' + i, (T) => T.verifyResponseAgainstOutbox(outbox, c)));
}

section('9. containsSecret aynı sonuç veriyor');
{
  const payloads = [
    { requestId: RID, surahName: 'Alak' },
    { replyToken: TOK },
    { note: 'Bearer abc123' },
    { note: 'mustafarasit@gmail.com' },
    { fine: 'nothing secret here' },
  ];
  payloads.forEach((p, i) => bothSame('containsSecret payload #' + i, (T) => T.containsSecret(p)));
}

console.log('\n' + (failed === 0 ? '✅ ' : '❌ ') + passed + ' geçti, ' + failed + ' kaldı.');
process.exit(failed === 0 ? 0 : 1);
