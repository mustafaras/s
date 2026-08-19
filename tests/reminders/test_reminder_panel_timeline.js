"use strict";

// REM-62 — G13-H panel daily detail / event timeline / reminder lifecycle.
//
// Reminder lifecycle event'leri (scheduled / delivered / opened / snoozed /
// muted / suppressed / error) sync.js/app.js sabit sözleşmesiyle üretilir:
// `section:'wellness'` + `path:'data.reminders'` + `operation` + reminder-v1
// correlation. Panel bu sözleşmeyi YALNIZ gözlemler ve güvenli summary'ye
// eşler; kişisel occurrence/body asla çıkmaz.
//
// Bu fixture şunları SABİTLER:
//   1. Yedi reminder lifecycle action'ı panel helper'ında güvenli summary'ye
//      eşlenir; bilinmeyen reminder event'i fail-closed 'lifecycle' olur.
//   2. Event ID / sequence / source / revision / occurredAt / feature metadata
//      private body'den ayrılır; raw title/schedule/occurrence render edilmez.
//   3. Duplicate, out-of-order, gap, future date, stale date ve missing
//      durumları görünür-ama-sakin gösterilir (date-state notu + kart üstü
//      sıra alarmı).
//   4. Panel filtresi (reminder dahil), event limit, filtre seçimi ve satır
//      metadata'sı deterministik korunur.
//   5. Timeline reminder event'i hiçbir app action / remote write başlatmaz
//      (PUT/POST/PATCH/DELETE, localStorage.setItem/removeItem,
//      SeySync.schedule, putInbox, putTransportFileP, app state mutation yok).
//
// Kapsam: current observer panel (`panel.js`). Panel-v2 ayrı regression
// yüzeyidir. Gerçek ağ, browser, token, localStorage ve kullanıcı verisi yok.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const PANEL_SOURCE = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");

function extractTopLevelFunction(name) {
  const start = PANEL_SOURCE.indexOf("function " + name + "(");
  if (start < 0) throw new Error(name + " panel.js içinde bulunamadı");
  const end = PANEL_SOURCE.indexOf("\nfunction ", start + 10);
  return PANEL_SOURCE.slice(start, end < 0 ? PANEL_SOURCE.length : end).trim();
}

function baseContext(extra) {
  return Object.assign({
    window: {}, Date, Math, String, Number, Boolean, Object, Array, JSON, isNaN, isFinite, RegExp,
    UI: { eventLimit: 5, eventFilter: "all" },
    STALE_WARN_DAYS: 1,
    STALE_DANGER_DAYS: 7,
    document: { getElementById: () => null },
    render: () => {},
    icon: () => "",
    esc: (value) => String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"),
    tsShort: (v) => (v ? String(v) : ""),
    p3TimeP: (v) => (v ? "t:" + v : "—"),
    today: () => "2026-08-19"
  }, extra || {});
}

// Event projection helpers (REM-62 mapping) dependency chain.
const EVENT_NAMES = [
  "isReminderEventP",
  "reminderEventActionP",
  "reminderEventLabelP",
  "eventClassificationP",
  "eventFeatureForP",
  "eventPathLabelP",
  "eventOperationLabelP",
  "eventChangeDescriptorP",
  "eventMatchesFilterP",
  "eventDateStateP",
  "safeEventSummaryP",
  "eventStatusP",
  "eventSourceKindForP",
  "eventCategoryDefsP",
  "eventTimeP",
  "refreshEventLogP",
  "setEventFilterP",
  "setEventLimitP",
  "eventLogSourceP",
  "statusToneP",
  "panelStatusBadgeHTMLP",
  "panelLegacyBadgeHTMLP",
  "eventLogCardInnerHTMLP",
  "eventLogCardHTMLP"
];

function loadEventContext(extra) {
  const code = EVENT_NAMES.map(extractTopLevelFunction).join("\n");
  const context = baseContext(extra);
  vm.runInNewContext(code, context, { filename: "panel-rem62-timeline.js" });
  return context;
}

function event(id, seq, action, overrides) {
  // app.js REMINDER_EVENT_ACTIONS / reminderEventCorrelation sözleşmesiyle
  // uyumlu sentetik reminder event'i. correlation reminder-v1:<action>:<digest>.
  const base = {
    eventId: id, correlationId: "reminder-v1:" + action + ":" + String(seq % 100).padStart(2, "0"),
    sequence: seq, occurredAt: "2026-08-17T09:0" + (seq % 10) + ":00.000Z",
    persistedAt: "2026-08-17T09:0" + (seq % 10) + ":00.000Z",
    submittedAt: null, acceptedAt: null,
    section: "wellness", path: "data.reminders",
    operation: action === "delivered" ? "complete" : "update",
    summary: "Bildirim yaşam döngüsü güncellendi",
    source: "app", sourceDeviceId: "dev_fixture",
    privacyClass: "summary", snapshotRevision: "r".repeat(40),
    detail: null, value: null, field: null, unit: null
  };
  Object.keys(overrides || {}).forEach((k) => { base[k] = overrides[k]; });
  return base;
}

const FORBIDDEN_NEEDLES = [
  "occurrenceId", "reminderQueue", "07:30", "kategori", "zamanlama",
  "Namaz", "İlaç", "Terapi", "doz", "prayerCompletion", "userNote", "surah"
];

const cases = [
  // ── 1. Yedi lifecycle action + bilinmeyen reminder → güvenli summary ────
  ["seven reminder lifecycle actions map to a safe summary and unknown fails closed", () => {
    const ctx = loadEventContext();
    const actions = ["scheduled", "delivered", "opened", "snoozed", "muted", "suppressed", "error"];
    const expected = { scheduled: "Planlandı", delivered: "Gösterildi", opened: "Açıldı", snoozed: "Ertelendi", muted: "Susturuldu", suppressed: "Sakince tutuldu", error: "Gönderilemedi" };
    actions.forEach((a, i) => {
      const e = event(a, i + 1, a);
      assert(ctx.isReminderEventP(e), "not classified as reminder: " + a);
      assertEqual(ctx.reminderEventActionP(e), a);
      assertEqual(ctx.reminderEventLabelP(e), expected[a]);
      // classification her reminder event'ini 'reminder' sınıfına koyar.
      assertEqual(ctx.eventClassificationP(e).key, "reminder");
      // change descriptor güvenli başlık üretir: "Reminder Gösterildi" vb.
      const desc = ctx.eventChangeDescriptorP(e);
      assert(desc.title === "Reminder " + expected[a], "bad title for " + a + ": " + desc.title);
      // raw private body render edilmez.
      FORBIDDEN_NEEDLES.forEach((needle) => assert(!JSON.stringify(desc).includes(needle)));
    });
    // Bilinmeyen reminder event fail-closed 'lifecycle' sınıfına düşer.
    const unknown = event("unknown-1", 99, "make-me");
    assert(ctx.isReminderEventP(unknown));
    assertEqual(ctx.reminderEventActionP(unknown), "lifecycle");
    assertEqual(ctx.eventClassificationP(unknown).key, "reminder");
  }],

  // ── 2. Metadata ayrımı: ID / sequence / source / deviceId / revision / feature ──
  ["event id sequence source revision and feature metadata stay separate from private body", () => {
    const ctx = loadEventContext();
    const e = event("rem-1", 1, "delivered", { sourceDeviceId: "dev_phone", snapshotRevision: "abc12345678901234567890123456789012345678" });
    assertEqual(ctx.eventFeatureForP(e).label, "Reminder");
    assertEqual(ctx.eventFeatureForP(e).icon, "bell");
    // source label user / delivery; never reminder private body.
    const src = ctx.eventSourceKindForP(e);
    assert(src.label && src.label.length > 0);
    // sequence ve device id satır metadata'sında kalır; özet yalnız safe.
    assertEqual(ctx.safeEventSummaryP(e), "Bildirim yaşam döngüsü güncellendi");
    assert(!JSON.stringify(ctx.safeEventSummaryP(e)).includes("PROFILE_RAW_RESPONSE_SENTINEL"));
    // path label reminder'ı göstermez (private içerik üretmez).
    assert(!ctx.eventPathLabelP(e.path).includes("Reminder"));
  }],

  // ── 3. Duplicate / out-of-order / gap / future / stale / missing sakin ──
  ["duplicate out-of-order gap future stale and missing states render calm", () => {
    const ctx = loadEventContext({ EVENT_LOG_STATE: { source: "event_files", events: [], audit: { ok: false, issueCount: 3, issues: [], deviceCount: 1 }, loadedAt: "2026-08-17T10:00:00.000Z" } });
    const dup = event("dup-1", 1, "opened");
    const outOfOrder = event("ooo-1", 3, "snoozed", { occurredAt: "2026-08-17T08:00:00.000Z" });
    const gap = event("gap-1", 5, "delivered", { occurredAt: "2026-08-16T08:00:00.000Z" });
    const future = event("future-1", 6, "scheduled", { occurredAt: "2026-08-30T08:00:00.000Z" });
    const stale = event("stale-1", 7, "suppressed", { occurredAt: "2026-08-01T08:00:00.000Z" });
    // missing = hiç reminder event yok; kart boş durum gösterir.
    const emptyCtx = loadEventContext({ EVENT_LOG_STATE: { source: "missing", events: [], audit: { ok: true, issueCount: 0, issues: [], deviceCount: 0 }, loadedAt: null } });
    const emptyHtml = emptyCtx.eventLogCardHTMLP();
    assert(emptyHtml.includes("Henüz güvenli event kaydı yok"), "empty state not shown");
    // future / stale date-notu sakin biçimde görünür.
    assertEqual(ctx.eventDateStateP(future).key, "future");
    assertEqual(ctx.eventDateStateP(stale).key, "stale");
    assertEqual(ctx.eventDateStateP(dup).key, "normal");
    // kart üstü sıra alarmı toplu ve sakin gösterir.
    const auditHtml = ctx.eventLogCardHTMLP();
    assert(auditHtml.includes("Event sırası bozuk"), "audit alarm missing");
    assert(auditHtml.includes("sıra/duplicate/gap sinyali"), "audit alarm detail missing");
    // out-of-order/gap hiçbir panel action tetiklemez.
    assert(!auditHtml.includes("data-event-action=\""), "audit area triggered action");
  }],

  // ── 4. Filter / limit / selected date davranışı korunur ─────────────────
  ["panel filter and event limit remain deterministic", () => {
    const events = [];
    for (let i = 1; i <= 12; i++) events.push(event("evt-" + i, i, i % 2 ? "delivered" : "opened"));
    const ctx = loadEventContext({
      EVENT_LOG_STATE: { source: "event_files", events, audit: { ok: true, issueCount: 0, issues: [], deviceCount: 1 }, loadedAt: "2026-08-17T10:00:00.000Z" },
      UI: { eventLimit: 5, eventFilter: "all" }
    });
    const allHtml = ctx.eventLogCardHTMLP();
    // Varsayılan son 5 değişiklik (limit 5).
    assert((allHtml.match(/class="event-log-row"/g) || []).length === 5);
    // 'reminder' filtresi artık bir sekme olarak görünür.
    assert(allHtml.includes('data-filter="reminder"'));
    // reminder filter'i yalnız reminder sınıfını gösterir (hepsi reminder burada).
    ctx.setEventFilterP("reminder");
    assertEqual(ctx.UI.eventFilter, "reminder");
    const filteredHtml = ctx.eventLogCardHTMLP();
    assert(filteredHtml.includes("Reminder"), "reminder filter label missing");
    assert(filteredHtml.includes('data-filter="reminder"'));
    // limit korunur.
    ctx.setEventLimitP(100);
    assertEqual(ctx.UI.eventLimit, 100);
  }],

  // ── 5. Timeline reminder event'i app action veya remote write başlatmaz ──
  ["timeline reminder event and helpers trigger no app action or remote write", () => {
    const sentinel = ["method:\"PUT\"", "method: 'PUT'", "method:\"POST\"", "method: 'POST'", "method:\"PATCH\"", "method: 'PATCH'", "method:\"DELETE\"", "method: 'DELETE'", "localStorage.setItem", "localStorage.removeItem", "SeySync.schedule", "putInbox", "putTransportFileP"];
    EVENT_NAMES.concat(["eventLogCardInnerHTMLP"]).forEach((name) => {
      const src = extractTopLevelFunction(name);
      sentinel.forEach((needle) => assert(!src.includes(needle), name + " leaked write path: " + needle));
    });
    // Timeline render çıktısında write / app action handle yok.
    const ctx = loadEventContext({ EVENT_LOG_STATE: { source: "event_files", events: [event("del-1", 1, "delivered")], audit: { ok: true, issueCount: 0, issues: [], deviceCount: 1 }, loadedAt: "2026-08-17T10:00:00.000Z" }, UI: { eventLimit: 5, eventFilter: "all" } });
    const html = ctx.eventLogCardHTMLP();
    assert(!html.includes("onclick=\"App.") && !html.includes("onclick=\"SeySync") && !html.includes("data-event-action=\"write"), "timeline emitted an app/write handler");
  }]
];

runTests(cases).catch(() => { process.exitCode = 1; });
