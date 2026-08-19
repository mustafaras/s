"use strict";

// REM-63 — G13-I panel observer action boundary.
//
// Panel gözlemcidir; reminder preference / occurrence / snooze / mute /
// delivery / private state için yazma authority'si DEĞİLDİR. Mevcut scoped
// observer writes (ÆON inbox, ÆON media, Quran transport) korunurken bu
// fixture şunları SABİTLER:
//
//   1. Panel write endpoint'leri (putInbox / putAeonMediaP / putTransportFileP)
//      reminder-namespace anahtarlarını denylist / schema guard ile engeller.
//   2. Reminder card, timeline, status ve filter UI'ında write handler
//      bulunmadığı static + runtime mock ile kanıtlanır.
//   3. Observer inbox / Quran action'ları reminder payload'ına yanlışlıkla
//      bağlanmaz (meşru ÆON / Quran payload'ları guard'dan geçer).
//   4. Demo mode, no token, expired/malformed token, read-only projection ve
//      malformed action states'leri fail-closed yapılır.
//   5. Gerçek GitHub PUT, gerçek data repo ve user device kullanılmaz.
//
// Kapsam: current observer panel (`panel.js`). Panel-v2 ayrı regression
// yüzeyidir. Gerçek ağ, browser, token, localStorage ve kullanıcı verisi yok.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, assertRejects, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const PANEL_SOURCE = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");

function extractTopLevelFunction(name) {
  const start = PANEL_SOURCE.indexOf("function " + name + "(");
  if (start < 0) throw new Error(name + " panel.js içinde bulunamadı");
  const end = PANEL_SOURCE.indexOf("\nfunction ", start + 10);
  return PANEL_SOURCE.slice(start, end < 0 ? PANEL_SOURCE.length : end).trim();
}

function extractVarBalanced(name) {
  const start = PANEL_SOURCE.indexOf("var " + name + "=");
  if (start < 0) throw new Error(name + " panel.js içinde bulunamadı");
  let depth = 0, inStr = null, i = start;
  for (; i < PANEL_SOURCE.length; i++) {
    const c = PANEL_SOURCE[i];
    if (inStr) { if (c === "\\") { i++; continue; } if (c === inStr) inStr = null; continue; }
    if (c === "\"" || c === "'") { inStr = c; continue; }
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) break; }
  }
  return PANEL_SOURCE.slice(start, i + 1).trim();
}

// Guard + write endpoint bağımlılık zinciri. putInbox / putAeonMediaP /
// putTransportFileP yalnız guard + b64enc + ghJsonHeaders + ghTransportApiP /
// inboxApi / aeonMediaApiP + fetch kullanır; bunları izole context'te yükleriz.
const GUARD_NAMES = [
  "panelTokenValidP",
  "findReminderKeyP",
  "panelWriteGuardP"
];

function loadGuardContext(extra) {
  const code = extractVarBalanced("REMINDER_WRITE_TOKENS") + "\n" + GUARD_NAMES.map(extractTopLevelFunction).join("\n");
  const context = Object.assign({
    Date, Math, String, Number, Boolean, Object, Array, JSON, isNaN, isFinite, RegExp,
    DEMO_MODE: false, PTOKEN: "github_pat_TESTTOKEN_0123456789abcdef"
  }, extra || {});
  vm.runInNewContext(code, context, { filename: "panel-rem63-guard.js" });
  return context;
}

function loadWriteContext(extra) {
  const code = extractVarBalanced("REMINDER_WRITE_TOKENS") + "\n"
    + GUARD_NAMES.map(extractTopLevelFunction).join("\n") + "\n"
    + extractTopLevelFunction("b64enc") + "\n"
    + extractTopLevelFunction("ghJsonHeaders") + "\n"
    + extractTopLevelFunction("ghTransportApiP") + "\n"
    + extractTopLevelFunction("inboxApi") + "\n"
    + extractTopLevelFunction("aeonMediaApiP") + "\n"
    + extractTopLevelFunction("putTransportFileP") + "\n"
    + extractTopLevelFunction("putInbox") + "\n"
    + extractTopLevelFunction("putAeonMediaP");
  const context = Object.assign({
    Date, Math, String, Number, Boolean, Object, Array, JSON, isNaN, isFinite, RegExp,
    DEMO_MODE: false, PTOKEN: "github_pat_TESTTOKEN_0123456789abcdef",
    BRANCH: "main", REPO: "mustafaras/seyma-data",
    btoa: (s) => Buffer.from(s, "binary").toString("base64"),
    atob: (s) => Buffer.from(s, "base64").toString("binary"),
    TextEncoder, TextDecoder, Uint8Array,
    window: { QuranTransportV1: { isWritableTransportPath: (p) => ["data/quran-request-outbox.json", "data/quran-delivery.json", "data/quran-responses.json"].indexOf(p) >= 0 } },
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  }, extra || {});
  vm.runInNewContext(code, context, { filename: "panel-rem63-write.js" });
  return context;
}

// Meşru ÆON / Quran payload'ları — guard'dan GEÇMELİ (regresyon yok).
const LEGIT_INBOX = { messages: [{ id: "m_1", text: "Selam", ts: "2026-08-19T10:00:00.000Z" }], receipts: {} };
const LEGIT_MEDIA = { mime: "image/jpeg", data: "SENTETIK_BASE64", w: 800, h: 600 };
const LEGIT_TRANSPORT = { requests: { qr_abcd1234: { requestId: "qr_abcd1234", surahId: "al-fatiha", videoId: "aaaaaaaaaaa", status: "ready" } } };

// Reminder-namespace payload'ları — guard'dan REDDEDİLMELİ.
const REMINDER_PAYLOADS = [
  { reminders: { preferences: { "reminder.catalog.v1.medication": { enabled: true, time: "08:30" } } } },
  { occurrenceId: "occ_1", body: "İlaç vakti" },
  { snoozeUntil: "2026-08-19T12:00:00.000Z" },
  { muted: true, muteUntil: "2026-08-20T00:00:00.000Z" },
  { deliveryLog: [{ occurrenceId: "occ_1", body: "gövde" }] },
  { reminderDelivery: { status: "pending" } },
  { notificationDelivery: { id: "n1" } },
  { quietHours: { start: "22:00", end: "07:00" } },
  { catchUp: { enabled: true } },
  { reminders: { medications: [{ id: "m1", name: "İlaç", time: "08:30" }] } },
  { messages: [{ id: "m1", text: "x", reminderBody: "özel başlık" }] }
];

const FORBIDDEN_NEEDLES = [
  "occurrenceId", "reminderQueue", "07:30", "kategori", "zamanlama",
  "Namaz", "İlaç", "Terapi", "doz", "prayerCompletion", "userNote", "surah"
];

const cases = [
  // ── 1. Guard: reminder-namespace anahtarları denylist ile engellenir ──
  ["guard rejects every reminder-namespace payload and accepts legit observer payloads", () => {
    const ctx = loadGuardContext();
    REMINDER_PAYLOADS.forEach((p) => {
      const r = ctx.panelWriteGuardP("inbox", p);
      assert(!r.ok, "reminder payload geçti: " + JSON.stringify(p).slice(0, 60));
      assertEqual(r.reason, "reminder_namespace");
    });
    // Meşru ÆON / Quran payload'ları geçer.
    assert(ctx.panelWriteGuardP("inbox", LEGIT_INBOX).ok);
    assert(ctx.panelWriteGuardP("aeon_media", LEGIT_MEDIA).ok);
    assert(ctx.panelWriteGuardP("transport", LEGIT_TRANSPORT).ok);
    // Quran transport'un meşru alanları (deliverySentAt, notifiedAt, readyAt,
    // videoId, requestId, surahId, notes) reminder token'ı DEĞİLDİR.
    const quranFull = { requests: { qr_abcd1234: { requestId: "qr_abcd1234", surahId: "al-fatiha", videoId: "aaaaaaaaaaa", deliverySentAt: "2026-08-19T10:00:00.000Z", notifiedAt: "2026-08-19T10:00:00.000Z", readyAt: "2026-08-19T10:00:00.000Z", startedWatchingAt: null, watchedAt: null, notes: [{ text: "not", updatedAt: "2026-08-19T10:00:00.000Z" }] } } };
    assert(ctx.panelWriteGuardP("transport", quranFull).ok, "Quran meşru alanları guard'ı tetiklememeli");
  }],

  // ── 2. Guard: fail-closed durumlar (demo / no token / malformed) ──
  ["guard fails closed on demo mode, no token, malformed token and malformed action", () => {
    // Demo mode.
    const demo = loadGuardContext({ DEMO_MODE: true });
    assertEqual(demo.panelWriteGuardP("inbox", LEGIT_INBOX).reason, "demo_mode");
    // No token.
    const noTok = loadGuardContext({ PTOKEN: "" });
    assertEqual(noTok.panelWriteGuardP("inbox", LEGIT_INBOX).reason, "no_token");
    // Expired / malformed token (kısa, boşluklu, kontrol karakterli).
    ["kisa", "github_pat_  boşluklu", "github_pat_\u0000null", "   "].forEach((bad) => {
      const c = loadGuardContext({ PTOKEN: bad });
      assertEqual(c.panelWriteGuardP("inbox", LEGIT_INBOX).reason, "no_token", "kötü token: " + JSON.stringify(bad));
    });
    // Malformed action (null / undefined payload).
    const c = loadGuardContext();
    assertEqual(c.panelWriteGuardP("inbox", null).reason, "malformed_action");
    assertEqual(c.panelWriteGuardP("inbox", undefined).reason, "malformed_action");
  }],

  // ── 3. Write endpoint'leri reminder payload'ına PUT üretmez ──
  ["putInbox / putAeonMediaP / putTransportFileP reject reminder payload before any fetch", async () => {
    let fetchCalls = 0;
    const ctx = loadWriteContext({ fetch: () => { fetchCalls++; return Promise.resolve({ ok: true, json: () => Promise.resolve({}) }); } });
    // putInbox reminder payload → reject, fetch çağrılmaz.
    await assertRejects(ctx.putInbox([{ id: "m1", reminderBody: "özel" }], "sha", {}), "panel write engellendi: reminder_namespace");
    assertEqual(fetchCalls, 0, "putInbox reminder payload'ı fetch'e ulaşmamalı");
    // putAeonMediaP reminder payload → reject, fetch çağrılmaz.
    await assertRejects(ctx.putAeonMediaP("am_1", { mime: "image/jpeg", data: "x", occurrenceId: "occ_1" }), "panel write engellendi: reminder_namespace");
    assertEqual(fetchCalls, 0, "putAeonMediaP reminder payload'ı fetch'e ulaşmamalı");
    // putTransportFileP reminder payload → reject, fetch çağrılmaz.
    await assertRejects(ctx.putTransportFileP("data/quran-responses.json", { requests: { qr_abcd1234: { requestId: "qr_abcd1234", surahId: "al-fatiha", videoId: "aaaaaaaaaaa", status: "ready", reminderBody: "x" } } }, "sha"), "panel write engellendi: reminder_namespace");
    assertEqual(fetchCalls, 0, "putTransportFileP reminder payload'ı fetch'e ulaşmamalı");
  }],

  // ── 4. Meşru observer writes regresyonsuz çalışır (fetch PUT üretir) ──
  ["legit observer inbox / media / transport writes still reach fetch PUT", async () => {
    const calls = [];
    const ctx = loadWriteContext({ fetch: (url, opts) => { calls.push({ url, method: opts && opts.method }); return Promise.resolve({ ok: true, json: () => Promise.resolve({}) }); } });
    await ctx.putInbox(LEGIT_INBOX.messages, "sha", LEGIT_INBOX.receipts);
    await ctx.putAeonMediaP("am_1", LEGIT_MEDIA);
    await ctx.putTransportFileP("data/quran-responses.json", LEGIT_TRANSPORT, "sha");
    assertEqual(calls.length, 3, "üç meşru write fetch'e ulaşmalı");
    calls.forEach((c) => assertEqual(c.method, "PUT", "meşru write PUT olmalı"));
    assert(calls[0].url.indexOf("observer-inbox.json") >= 0);
    assert(calls[1].url.indexOf("aeon-media/am_1.json") >= 0);
    assert(calls[2].url.indexOf("quran-responses.json") >= 0);
  }],

  // ── 5. Static: reminder UI yüzeyleri write handler üretmez ──
  ["reminder card / timeline / status / filter UI emit no write handler", () => {
    // Reminder yüzeyi yalnız gözlem helper'larıdır; hiçbiri write endpoint'ine
    // veya app action'a bağlanmaz.
    const reminderSurface = [
      "reminderStatusCardHTMLP", "reminderSystemStatusP", "reminderReceiptStatusP",
      "reminderCapabilityStatusP", "reminderSourceStatusP", "reminderPrivacyStatusP",
      "reminderDeviceAcceptanceStatusP", "reminderWorkingClaimP", "reminderStatusToneMapP",
      "eventLogCardHTMLP", "eventLogCardInnerHTMLP", "isReminderEventP",
      "reminderEventActionP", "reminderEventLabelP", "eventChangeDescriptorP",
      "eventClassificationP", "eventFeatureForP", "eventCategoryDefsP", "setEventFilterP",
      "eventDateStateP"
    ];
    const writeSentinel = ["method:\"PUT\"", "method: 'PUT'", "method:\"POST\"", "method: 'POST'", "method:\"PATCH\"", "method: 'PATCH'", "method:\"DELETE\"", "method: 'DELETE'", "localStorage.setItem", "localStorage.removeItem", "SeySync.schedule", "putInbox", "putTransportFileP", "putAeonMediaP"];
    reminderSurface.forEach((name) => {
      const src = extractTopLevelFunction(name);
      writeSentinel.forEach((needle) => assert(!src.includes(needle), name + " leaked write path: " + needle));
    });
    // Reminder yüzeyi hiçbir app/write onclick üretmez.
    const status = extractTopLevelFunction("reminderStatusCardHTMLP");
    assert(!status.includes("onclick=\"App.") && !status.includes("onclick=\"SeySync") && !status.includes("data-event-action=\"write"), "reminder status card emitted an app/write handler");
  }],

  // ── 6. Static: guard yalnız yazma endpoint'lerinde; read-only yüzeylerde yok ──
  ["guard is wired only into the three write endpoints and read surfaces stay clean", () => {
    // Guard yalnız putInbox / putAeonMediaP / putTransportFileP içinde çağrılır.
    const putTransport = extractTopLevelFunction("putTransportFileP");
    const putInbox = extractTopLevelFunction("putInbox");
    const putAeon = extractTopLevelFunction("putAeonMediaP");
    assert(putTransport.includes("panelWriteGuardP"));
    assert(putInbox.includes("panelWriteGuardP"));
    assert(putAeon.includes("panelWriteGuardP"));
    // Read-only transport / polling / projection yüzeyleri guard çağırmaz ve
    // hiçbir write verb taşımaz.
    ["loadTransportFileP", "loadInbox", "fetchAeonMediaP", "loadObserverProjectionP", "loadSyncReceiptP"]
      .forEach((name) => {
        const src = extractTopLevelFunction(name);
        assert(!src.includes("panelWriteGuardP"), name + " read surface guard çağırmamalı");
        assert(!/method:\s*["']PUT/.test(src), name + " read surface PUT taşımamalı");
        assert(!/method:\s*["']POST/.test(src) && !/method:\s*["']PATCH/.test(src) && !/method:\s*["']DELETE/.test(src), name + " read surface write verb taşımamalı");
      });
  }],

  // ── 7. Static: panel.js reminder-namespace write yolu yok ──
  ["panel.js owns no write path to reminder preference or delivery", () => {
    // Panel latest.json'a veya reminder tercihine PUT ile yazamaz.
    assert(!/data\/latest\.json[\s\S]{0,200}method:\s*["']PUT/u.test(PANEL_SOURCE));
    assert(!/data\/reminder[\s\S]{0,200}method:\s*["']PUT/u.test(PANEL_SOURCE));
    // App reminder yazma fonksiyonları panelde yoktur.
    ["setReminderEnabled", "setReminderCategoryEnabled", "setReminderProfile",
     "reminderSyncPayload", "snoozeReminderDelivery", "muteReminderToday"]
      .forEach((needle) => assert(!PANEL_SOURCE.includes(needle)));
    // Reminder yüzeyi hiçbir raw private detail render etmez.
    FORBIDDEN_NEEDLES.forEach((needle) => {
      const status = extractTopLevelFunction("reminderStatusCardHTMLP");
      assert(!status.includes(needle), "status card leaked: " + needle);
    });
  }]
];

runTests(cases).catch(() => { process.exitCode = 1; });
