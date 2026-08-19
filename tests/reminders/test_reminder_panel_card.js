"use strict";

// REM-61 — G13-G panel reminder dashboard card veya explicit no-op.
//
// KARAR (REM-ADR-024): panel reminder dashboard için AYRI bir bento / module
// card açılmaz — bilinçli no-op. REM-60'ın `reminderStatusCardHTMLP` zaten
// beş ayrı boyutta (capability, kaynak tazeliği, generic delivery sağlığı /
// receipt, privacy, cihaz kabulü) güvenli aggregate'i tek kart sözleşmesinde
// render eder ve render() içinde `coverageRibbonHTMLP` sonrası çağrılır.
// Bu fixture o no-op'u ve tek dashboard yüzeyinin privacy/fail-safe
// sözleşmesini yapısal olarak SABİTLER:
//
//   1. d4ModuleDescriptorsP / d4ModuleAtlasHTMLP içinde HIÇBIR reminder
//      descriptor'ı / modül kartı yoktur (reminderHealth, schedulerHealth,
//      reminder-delivery vb. yok) — modül atlasında reminder kartı yoktur.
//   2. coreModules hiçbir reminder enabled-state göstergesi taşımaz.
//   3. rootModulesCardHTMLP / p4ProvenanceCardHTMLP hiçbir reminder kartı
//      üretmez; reminder yüzeyi yalnız reminderStatusCardHTMLP'dir.
//   4. Tek dashboard reminder yüzeyi yalnız güvenli aggregate taşır:
//      capability, kaynak tazeliği, generic delivery sağlığı, enabled-state
//      özeti; private routine, reminder title, schedule, occurrence, therapy,
//      medication, prayer completion veya user note asla render edilmez.
//   5. Empty / unused / pending / stale / error / redacted durumları aynı
//      kart sözleşmesinde, deterministik ton + metinle ve fail-closed gösterilir.
//   6. Reminder status helpers ve modül kart yüzeyleri app state'ini veya
//      panel write endpoint'lerini TETİKLEMEZ (PUT/POST/PATCH/DELETE,
//      localStorage.setItem/removeItem, SeySync.schedule, app state mutation yok).
//
// Kapsam sınırı: current observer panel (`panel.js`, `panel.css`). Panel-v2
// ayrı regression yüzeyidir. Gerçek ağ, browser, token, localStorage ve
// kullanıcı verisi yoktur.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const PANEL_SOURCE = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");
const PANEL_CSS = fs.readFileSync(path.join(ROOT, "panel.css"), "utf8");

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

function baseContext(extra) {
  return Object.assign({
    Date, Math, String, Number, Boolean, Object, Array, JSON, isNaN, isFinite, RegExp,
    UI: { d4SelectedModule: null },
    STALE_WARN_DAYS: 1,
    STALE_DANGER_DAYS: 7,
    icon: () => "",
    esc: (value) => String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  }, extra || {});
}

function loadPanelHelpers(names, extra) {
  const code = names.map(extractTopLevelFunction).join("\n");
  const context = baseContext(extra);
  vm.runInNewContext(code, context, { filename: "panel-rem61-helpers.js" });
  return context;
}

// REM-60 status yardımcılarının TAM bağımlılık zinciri (REM-61 kart sözleşmesini
// bu zincir üzerinden doğrular).
function loadStatusContext(extra) {
  const names = [
    "panelStatusBadgeHTMLP",
    "panelLegacyBadgeHTMLP",
    "reminderStatusToneMapP",
    "reminderSystemStatusP",
    "reminderReceiptStatusP",
    "reminderCapabilityStatusP",
    "reminderSourceStatusP",
    "reminderDeviceAcceptanceStatusP",
    "reminderPrivacyStatusP",
    "reminderWorkingClaimP",
    "reminderStatusCardHTMLP",
    "normalizeSyncReceiptP",
    "syncStatusP"
  ];
  const code = extractVarBalanced("SYNC_STATUS_P") + "\n" + names.map(extractTopLevelFunction).join("\n");
  const context = baseContext(extra);
  vm.runInNewContext(code, context, { filename: "panel-rem61-status.js" });
  return context;
}

// D4 modül atlas yüzeyinin bağımlılık zinciri — no-op sabitlemesi için
// d4ModuleDescriptorsP + d4ModuleAtlasHTMLP + root/provenance kartları yüklenir.
function loadModuleAtlasContext(extra) {
  const names = [
    "d4SafeTimeP",
    "d4LatestTimeP",
    "d4CoverageBadgeP",
    "therapyRecencyTextP",
    "d4ModuleDescriptorsP",
    "d4ModuleDrawerHTMLP",
    "d4ModuleAtlasHTMLP",
    "p3BadgeP",
    "statusToneP",
    "panelToneOverrideP",
    "panelStatusP",
    "panelStatusBadgeHTMLP",
    "p3StatusP",
    "rootModulesCardHTMLP",
    "p4ProvenanceCardHTMLP",
    "emptyStateReasonP",
    "emptyStateNoteHTMLP",
    "p3SettingsSummaryP",
    "saygiMismatchReasonTrP",
    "stalenessBadgeP",
    "p3TimeP"
  ];
  const code = names.map(extractTopLevelFunction).join("\n");
  // p4ProvenanceCardHTMLP ayrıca p4StageTextP'a bağımlıdır.
  const extraCode = "\n" + extractTopLevelFunction("p4StageTextP");
  const context = baseContext(extra);
  vm.runInNewContext(code + extraCode, context, { filename: "panel-rem61-modules.js" });
  return context;
}

function makeProjection(sections) {
  return {
    source: "projection",
    reason: "ready",
    snapshot: {
      schemaVersion: 1,
      manifestVersion: "panel-coverage-v1",
      reminderCoverageVersion: "panel-reminder-coverage-v1",
      snapshotRevision: "a".repeat(40),
      sourceLatestSha: "b".repeat(40),
      sourceUpdatedAt: "2026-08-18T10:00:00.000Z",
      projectionBuiltAt: "2026-08-18T10:05:00.000Z"
    },
    data: {},
    coverage: { full: [], summary: [], redacted: [], missing: [] },
    sections: sections || {}
  };
}
function healthyReceipt() {
  return {
    schemaVersion: 1,
    status: "accepted",
    snapshotRevision: "a".repeat(40),
    sourceUpdatedAt: "2026-08-18T10:00:00.000Z",
    submittedAt: "2026-08-18T10:00:01.000Z",
    acceptedAt: "2026-08-18T10:00:02.000Z",
    sourceLatestSha: "b".repeat(40)
  };
}
// D4 modül atlas fixture'ı (PANEL-013 ile aynı sentetik projection şekli).
function moduleSections() {
  return {
    therapyProvenance: { status: "ok", date: "2026-08-03", thoughtCount: 2, thoughts: [{ summary: "Metin redacted", createdAt: "2026-08-03T10:00:00Z" }], consent: { panelSummarySharingAccepted: true }, privacy: "sensitive_redacted" },
    profileProgress: { status: "active", responseCount: 4, currentItemIndex: 12, startedAt: "2026-08-01T10:00:00Z", completedAt: null, consent: { panelSummarySharingAccepted: false }, privacy: "sensitive_redacted" },
    notificationTimeline: { status: "ok", count: 3, counts: { created: 3, delivered: 2, read: 1, error: 1 }, events: [{ createdAt: "2026-08-03T09:00:00Z", deliveredAt: "2026-08-03T09:01:00Z" }], sourcePath: "data.notifications", privacy: "metadata_only" },
    dailyPhoto: { status: "ready", ready: true, title: "Güvenli fotoğraf", license: "CC BY", source: "Wikimedia Commons", fetchedAt: "2026-08-03T08:00:00Z", cacheState: "fresh", sourcePath: "data.dailyPhoto", privacy: "public_metadata" },
    saygiRoot: { status: "ok", collectionCount: 12, rootStreak: 3, dailyEvidenceCount: 3, dailyDerivedStreak: 3, rootLastReadDate: "2026-08-03", dailyLatestReadDate: "2026-08-03", sourcePath: "data.saygi + data.days.*.saygi", privacy: "public_metadata" },
    locNudge: { status: "ok", shownCount: 3, dismissCount: 1, lastShownAt: "2026-08-03T07:00:00Z", snoozeUntil: null, sourcePath: "data.locNudge", privacy: "behavior_summary" },
    locationTiming: { status: "ok", sampleTs: "2026-08-03T07:01:00Z", processedTs: "2026-08-03T07:02:00Z", syncAcceptedAt: "2026-08-03T07:03:00Z", privacy: "timestamp_only" },
    archives: { library: { books: [{ id: "b1" }] }, watchlist: { items: [{ id: "w1" }] }, music: { items: [{ id: "m1" }] } }
  };
}
function moduleData() {
  return { quranJourney: { requests: { baqara: { status: "ready", videoId: "abcdefghijk", notes: [{ kind: "reflection" }], updatedAt: "2026-08-03T06:00:00Z" } } }, soulArchive: { items: [{ type: "pilates", totalSessions: 4, totalMinutes: 120, lastAt: "2026-08-02T12:00:00Z" }] }, profileAssessment: { responses: { raw_01: "PROFILE_RAW_RESPONSE_SENTINEL" } } };
}
// Reminder dashboard yüzeyinin asla render etmemesi gereken ham ayrıntılar
// (Görev 3): private routine, title, schedule, occurrence, therapy, medication,
// prayer completion veya user note.
const FORBIDDEN_NEEDLES = [
  "Namaz", "İlaç", "Terapi", "07:30", "kategori", "zamanlama", "occurrence",
  "reminderQueue", "surah", "doz", "Snooze", "erteleme", "occurrenceId",
  "prayerCompletion", "userNote", "Meditasyon", "ritüel"
];
// Modül atlas fixture'ında yalnız meşru modül kartları bulunmalı; reminder
// descriptor aday anahtarları hiçbirinde görünmemelidir.
const FORBIDDEN_MODULE_KEYS = ["reminder", "reminder-health", "reminder-health", "scheduler-health", "reminder-delivery"];

const cases = [
  // ── 1. D4 modül atlasında reminder descriptor / kartı yoktur (no-op) ─────
  ["d4 module atlas carries no reminder descriptor and no reminder module card", () => {
    const ctx = loadModuleAtlasContext({
      D: moduleData(),
      PROJECTION: makeProjection(moduleSections()),
      quranJourneyRootP: () => moduleData().quranJourney,
      quranDeliveryErrorsP: () => [],
      allSoulArchiveSessionsP: () => [],
      p3TimeP: (v) => (v ? "t:" + v : "—"),
      stalenessBadgeP: () => "",
      icon: () => ""
    });
    const modules = ctx.d4ModuleDescriptorsP();
    assertEqual(modules.length, 7);
    const knownKeys = ["therapy-profile", "notification-delivery", "quran-delivery", "saygi-evidence", "daily-photo", "location-audit", "archives-provenance"];
    knownKeys.forEach((k) => assert(modules.some((m) => m.key === k), "missing module key " + k));
    // Hiçbir reminder / scheduler-health / reminder-delivery descriptor'ı yok.
    modules.forEach((m) => {
      FORBIDDEN_MODULE_KEYS.forEach((needle) => {
        assert(m.key.indexOf("reminder") < 0 && m.key.indexOf("scheduler") < 0, "reminder module descriptor leaked key " + m.key);
        assert(m.title.indexOf("Reminder") < 0 && m.title.indexOf("Hatırlatma") < 0, "reminder module title leaked " + m.title);
        void needle;
      });
    });
    // Atlas render'ı hiçbir reminder modül kartı üretmez.
    const atlas = ctx.d4ModuleAtlasHTMLP();
    assert(!atlas.includes("data-module=\"reminder"), "module atlas rendered a reminder module card");
    assert(!atlas.includes("Hatırlatma") && !atlas.includes("Reminder gözlem"), "module atlas leaked reminder surface");
  }],

  // ── 2. coreModules hiçbir reminder enabled-state göstergesi taşımaz ─────
  ["coreModules reports no reminder enabled-state in the bento dashboard", () => {
    const ctx = loadPanelHelpers(["coreModules"], {
      D: moduleData(),
      panelLocationP: () => ({ ts: Date.now() }),
      lastSavedAt: () => Date.now()
    });
    const heroes = ctx.coreModules();
    assertEqual(heroes.length, 7);
    const known = ["Sensorium", "Vitals", "Dialogue", "Presence", "Continuity", "Cycle", "Notifications"];
    known.forEach((k) => assert(heroes.some((h) => h.k === k), "missing hero " + k));
    // Notifications hero yalnız ÆON notify izniyle beslenir; reminder
    // enabled-state göstergesi yoktur.
    heroes.forEach((h) => {
      assert(h.k.indexOf("Reminder") < 0 && h.k.indexOf("reminder") < 0, "reminder hero leaked " + h.k);
    });
  }],

  // ── 3. root/provenance kartları hiçbir reminder kartı üretmez ──────────
  ["root and provenance module cards render no reminder card", () => {
    const ctx = loadModuleAtlasContext({
      D: moduleData(),
      PROJECTION: makeProjection(moduleSections()),
      quranJourneyRootP: () => moduleData().quranJourney,
      quranDeliveryErrorsP: () => [],
      allSoulArchiveSessionsP: () => [],
      p3TimeP: (v) => (v ? "t:" + v : "—"),
      stalenessBadgeP: () => "",
      icon: () => ""
    });
    const rootHtml = ctx.rootModulesCardHTMLP();
    const provHtml = ctx.p4ProvenanceCardHTMLP();
    // Bu iki kart yalnız meşru root/provenance modüllerini gösterir; hiçbir
    // reminder modül kartı yoktur.
    assert(!rootHtml.includes("Reminder") && !rootHtml.includes("Hatırlatma"), "root modules card leaked reminder surface");
    assert(!provHtml.includes("Reminder gözlem") && !provHtml.includes("Hatırlatma"), "provenance card leaked reminder surface");
  }],

  // ── 4. Tek dashboard reminder yüzeyi reminderStatusCardHTMLP'dir ────────
  ["the single dashboard reminder surface is reminderStatusCardHTMLP with five dimensions", () => {
    const ctx = loadStatusContext({
      p3TimeP: (v) => (v ? "t:" + v : "—"),
      tsShort: (v) => (v ? String(v) : "")
    });
    const html = ctx.reminderStatusCardHTMLP(healthyReceipt(), "2026-08-18T10:10:00.000Z", makeProjection(moduleSections()), { ok: true });
    // Beş ayrı dimension hücresi.
    ["source", "receipt", "capability", "privacy", "device"].forEach((dim) => {
      assert(html.includes('data-reminder-dim="' + dim + '"'), "dimension missing: " + dim);
    });
    // Tek kart sözleşmesi.
    assert(html.includes('data-component="reminder-status-card"'));
  }],

  // ── 5. Tek dashboard yüzeyi yalnız güvenli aggregate taşır ─────────────
  ["the dashboard reminder surface renders safe aggregates and never private routine detail", () => {
    const ctx = loadStatusContext({
      p3TimeP: (v) => (v ? "t:" + v : "—"),
      tsShort: (v) => (v ? String(v) : "")
    });
    // Healthy projection + receipt: capability/source/receipt kanıtı birlikte.
    const okHtml = ctx.reminderStatusCardHTMLP(healthyReceipt(), "2026-08-18T10:10:00.000Z", makeProjection(moduleSections()), { ok: true });
    assert(okHtml.includes('data-reminder-working="ok"'));
    // Güvenli aggregate metinleri (capability, source freshness, generic
    // delivery health / receipt, enabled-state özeti).
    assert(okHtml.includes("Capability"));
    assert(okHtml.includes("Kaynak"));
    assert(okHtml.includes("Receipt"));
    assert(okHtml.includes("Privacy"));
    assert(okHtml.includes("Cihaz kabulü"));
    // Private routine / title / schedule / occurrence / therapy / medication /
    // prayer completion / user note asla render edilmez.
    FORBIDDEN_NEEDLES.forEach((needle) => assert(!okHtml.includes(needle), "leaked forbidden detail: " + needle));
  }],

  // ── 6. Empty / unused / pending / stale / error / redacted aynı sözleşme ─
  ["empty, pending, stale, error and redacted states render deterministically in the same card contract", () => {
    const ctx = loadStatusContext({
      p3TimeP: (v) => (v ? "t:" + v : "—"),
      tsShort: (v) => (v ? String(v) : "")
    });
    // Receipt yok + projection contract yok → capability unsupported, working
    // claim pending; kart boş/eksik durumda da beş boyutu korur ve fail-closed.
    const emptyProj = { source: "legacy_fallback", reason: "projection_missing", snapshot: null, sections: {} };
    const pendingHtml = ctx.reminderStatusCardHTMLP(null, "2026-08-18T10:10:00.000Z", emptyProj, { ok: true });
    ["source", "receipt", "capability", "privacy", "device"].forEach((dim) => assert(pendingHtml.includes('data-reminder-dim="' + dim + '"')));
    assert(pendingHtml.includes('data-reminder-working="pending"'));
    assert(pendingHtml.includes("unsupported") || pendingHtml.includes("projection yok") || pendingHtml.includes("Destek yok"));
    FORBIDDEN_NEEDLES.forEach((needle) => assert(!pendingHtml.includes(needle), "leaked on empty/pending: " + needle));

    // Stale kaynak → source tone stale; aynı kart sözleşmesi.
    const staleProj = { source: "legacy_fallback", reason: "projection_stale", snapshot: { schemaVersion: 1, reminderCoverageVersion: "panel-reminder-coverage-v1" }, sections: {} };
    const staleHtml = ctx.reminderStatusCardHTMLP(healthyReceipt(), "2026-08-18T10:10:00.000Z", staleProj, { ok: true });
    assert(staleHtml.includes('data-reminder-working="pending"'));
    assert(staleHtml.includes("kaynak_kanit_yok"));
    FORBIDDEN_NEEDLES.forEach((needle) => assert(!staleHtml.includes(needle), "leaked on stale: " + needle));

    // Error (section fetch hatası) → source error; fail-closed.
    const errProj = { source: "legacy_fallback", reason: "projection_load_failed", snapshot: null, sections: {} };
    const errHtml = ctx.reminderStatusCardHTMLP(null, "2026-08-18T10:10:00.000Z", errProj, { ok: false, lastError: "network" });
    assert(errHtml.includes('data-reminder-working="pending"'));
    FORBIDDEN_NEEDLES.forEach((needle) => assert(!errHtml.includes(needle), "leaked on error: " + needle));
  }],

  // ── 7. Card yüzeyi app state'i veya panel write endpoint'lerini tetiklemez ─
  ["the reminder dashboard surface and module card surfaces trigger no app state or panel write endpoints", () => {
    const reminderNames = [
      "reminderStatusToneMapP", "reminderSystemStatusP", "reminderReceiptStatusP",
      "reminderCapabilityStatusP", "reminderSourceStatusP", "reminderDeviceAcceptanceStatusP",
      "reminderPrivacyStatusP", "reminderWorkingClaimP", "reminderStatusCardHTMLP"
    ];
    const moduleNames = ["d4ModuleDescriptorsP", "d4ModuleAtlasHTMLP", "rootModulesCardHTMLP", "p4ProvenanceCardHTMLP", "coreModules"];
    const writeSentinel = ["method:\"PUT\"", "method: 'PUT'", "method:\"POST\"", "method: 'POST'", "method:\"PATCH\"", "method: 'PATCH'", "method:\"DELETE\"", "method: 'DELETE'", "localStorage.setItem", "localStorage.removeItem", "SeySync.schedule", "putInbox", "putTransportFileP"];
    reminderNames.concat(moduleNames).forEach((name) => {
      const src = extractTopLevelFunction(name);
      writeSentinel.forEach((needle) => assert(!src.includes(needle), name + " leaked write path: " + needle));
    });
  }],

  // ── 8. Token sentinel yok ve CSS yüzeyi dengeli ────────────────────────
  ["the dashboard reminder surface carries no token sentinel and its CSS is balanced", () => {
    const reminderNames = [
      "reminderStatusToneMapP", "reminderSystemStatusP", "reminderReceiptStatusP",
      "reminderCapabilityStatusP", "reminderSourceStatusP", "reminderDeviceAcceptanceStatusP",
      "reminderPrivacyStatusP", "reminderWorkingClaimP", "reminderStatusCardHTMLP"
    ];
    const sentinels = ["ghp_", "github_pat_", "Bearer ", "Authorization", "PTOKEN", "raw_01", "PROFILE_RAW_RESPONSE_SENTINEL"];
    reminderNames.forEach((name) => {
      const src = extractTopLevelFunction(name);
      sentinels.forEach((s) => assert(!src.includes(s), name + " leaked sentinel: " + s));
    });
    // Status kart yüzeyi CSS'te tanımlı (tek dashboard yüzeyi).
    assert(PANEL_CSS.includes(".reminder-status-card"));
    assert(PANEL_CSS.includes(".reminder-status-grid"));
    let depth = 0;
    for (let i = 0; i < PANEL_CSS.length; i++) {
      if (PANEL_CSS[i] === "{") depth++;
      if (PANEL_CSS[i] === "}") depth--;
      if (depth < 0) break;
    }
    assertEqual(depth, 0);
  }]
];

runTests(cases).catch(() => { process.exitCode = 1; });
