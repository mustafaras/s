"use strict";

// REM-60 — G13-F panel status, provenance ve operational health.
//
// Reminder gözlem durumunu panelde KAYNAK (source freshness), RECEIPT (uzak
// kabul), CAPABILITY (projection contract), PRIVACY (yerel/redacted) ve CİHAZ
// (S5 kullanıcı cihazı kabulü) olarak AYRI status alanlarına ayırdığını
// deterministik ve read-only sabitler. 8 ton (accepted, stale, pending,
// missing, projection_invalid, error, unsupported, redacted) tek bir kaynaktan
// eşlenir; status color tek anlam kaynağı değildir (text + icon + source time
// + privacy label birlikte). "Reminder çalışıyor" iddiası yalnız source +
// receipt + capability kanıtı birlikteyse doğrulanır (working-claim). Status
// card hiçbir raw reminder category / schedule / body taşımaz.
//
// Kapsam sınırı: current observer panel (`panel.js`, `panel.css`). Panel-v2
// ayrı regression yüzeyidir. Gerçek ağ, browser, token, localStorage, kullanıcı
// verisi yoktur.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const PANEL_SOURCE = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");
const PANEL_CSS = fs.readFileSync(path.join(ROOT, "panel.css"), "utf8");

function extractTopLevelFunction(name) {
  const start = PANEL_SOURCE.indexOf("function " + name + "(");
  if (start < 0) throw new Error(name + " panel.js içinde bulunamadı");
  const end = PANEL_SOURCE.indexOf("\nfunction ", start + 10);
  return PANEL_SOURCE.slice(start, end < 0 ? PANEL_SOURCE.length : end).trim();
}

// SYNC_STATUS_P nesne değişkeni içinde noktalı virgül içeren string literaller
// var ('Sunucu sınırı; sonra...'), bu yüzden regex yerine süslü parantez
// dengelemeli bir extractor kullanır.
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
    esc: (value) => String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  }, extra || {});
}

function loadPanelHelpers(names, extra) {
  const code = names.map(extractTopLevelFunction).join("\n");
  const context = baseContext(extra);
  vm.runInNewContext(code, context, { filename: "panel-rem60-helpers.js" });
  return context;
}

// REM-60 status yardımcılarının TAM bağımlılık zinciri. reminderSourceStatusP
// reminderSystemStatusP'a, reminderReceiptStatusP syncStatusP /
// normalizeSyncReceiptP'a (ve syncStatusP de SYNC_STATUS_P varına) bağımlıdır;
// kart fonksiyonu panelStatusBadgeHTMLP / panelLegacyBadgeHTMLP'a bağımlıdır.
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
  vm.runInNewContext(code, context, { filename: "panel-rem60-status.js" });
  return context;
}

// Sağlıklı projection + snapshot + receipt kombinasyonu.
function healthyProjection() {
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
    coverage: { full: [], summary: [], redacted: [], missing: [] }
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

const cases = [
  // ── 1. Sekiz ton deterministik ve fail-closed eşlenir ──────────────
  ["the eight reminder tones are deterministically mapped from a single source", () => {
    const ctx = loadPanelHelpers(["reminderStatusToneMapP"]);
    const codes = ["accepted", "stale", "pending", "missing", "projection_invalid", "error", "unsupported", "redacted"];
    assertEqual(codes.length, 8);
    codes.forEach((code) => {
      const r = ctx.reminderStatusToneMapP(code);
      assertEqual(r.code, code);
      assert(["ok", "warning", "pending", "danger", "muted"].includes(r.kind));
      assert(["ok", "warning", "pending", "danger", "muted"].includes(r.tone));
      assert(typeof r.label === "string" && r.label.length > 0);
      assert(typeof r.icon === "string" && r.icon.length > 0);
    });
    // Bilinmeyen kod fail-closed: muted "Durum bekleniyor"a düşer.
    const unknown = ctx.reminderStatusToneMapP("no_such_code");
    assertEqual(unknown.tone, "muted");
    assertEqual(unknown.label, "Durum bekleniyor");
    // Ok tonu yalnız accepted/redacted içindir; danger asla ok değildir.
    assertEqual(ctx.reminderStatusToneMapP("accepted").tone, "ok");
    assertEqual(ctx.reminderStatusToneMapP("error").tone, "danger");
    assert(ctx.reminderStatusToneMapP("error").kind !== "ok");
  }],
  ["color is never the only meaning: each tone carries text, icon and a stable code", () => {
    const ctx = loadStatusContext();
    // Kaynak boyutu stale/error/pending/missing'i ayrı ton + metinle taşır.
    const srcMap = [
      [{ source: "projection", reason: "ready" }, { ok: true }, "accepted"],
      [{ source: "legacy_fallback", reason: "projection_stale" }, { ok: true }, "stale"],
      [{ source: "legacy_fallback", reason: "projection_invalid" }, { ok: true }, "projection_invalid"],
      [{ source: "legacy_fallback", reason: "receipt_missing" }, { ok: true }, "pending"],
      [{ source: "legacy_fallback", reason: "projection_missing" }, { ok: true }, "missing"],
      [{ source: "legacy_fallback", reason: "projection_load_failed" }, { ok: false, lastError: "network" }, "error"],
      [null, { ok: true }, "missing"]
    ];
    srcMap.forEach(([st, fs, expectedTone]) => {
      const r = ctx.reminderSourceStatusP(st, fs);
      assertEqual(r.tone, expectedTone);
      assert(typeof r.text === "string" && r.text.length > 0);
      assert(typeof r.label === "string" && r.label.length > 0);
      assert(typeof r.icon === "string" && r.icon.length > 0);
    });
    // Receipt boyutu accepted/missing/error/pending ayrı tonla taşır.
    const rcpt = ctx.reminderReceiptStatusP(healthyReceipt());
    assertEqual(rcpt.tone, "accepted");
    assertEqual(ctx.reminderReceiptStatusP(null).tone, "missing");
    assertEqual(ctx.reminderReceiptStatusP({ status: "conflict", lastErrorCode: "conflict" }).tone, "error");
    assertEqual(ctx.reminderReceiptStatusP({ status: "offline", lastErrorCode: "offline" }).tone, "pending");
  }],
  ["capability is unsupported when the projection contract is absent", () => {
    const ctx = loadPanelHelpers(["reminderStatusToneMapP", "reminderCapabilityStatusP"]);
    const noSnap = ctx.reminderCapabilityStatusP({ source: "legacy_fallback", reason: "projection_missing" });
    assertEqual(noSnap.code, "unsupported");
    assertEqual(noSnap.tone, "muted");
    const noContract = ctx.reminderCapabilityStatusP({ source: "projection", reason: "ready", snapshot: { schemaVersion: 1 } });
    assertEqual(noContract.code, "unsupported");
    const withContract = ctx.reminderCapabilityStatusP(healthyProjection());
    assertEqual(withContract.code, "redacted");
    assertEqual(withContract.tone, "ok");
  }],
  ["device acceptance is always pending and never claims success", () => {
    const ctx = loadPanelHelpers(["reminderStatusToneMapP", "reminderDeviceAcceptanceStatusP"]);
    const d = ctx.reminderDeviceAcceptanceStatusP();
    assertEqual(d.code, "pending");
    assertEqual(d.kind, "pending");
    assert(d.kind !== "ok");
    assert(d.text.includes("S5") || d.text.includes("cihaz"));
  }],
  ["privacy dimension always reports local/redacted protection", () => {
    const ctx = loadPanelHelpers(["reminderStatusToneMapP", "reminderPrivacyStatusP"]);
    assertEqual(ctx.reminderPrivacyStatusP(healthyProjection()).code, "redacted");
    assertEqual(ctx.reminderPrivacyStatusP(healthyProjection()).tone, "ok");
    assertEqual(ctx.reminderPrivacyStatusP(null).code, "redacted");
    assertEqual(ctx.reminderPrivacyStatusP({ source: "none", reason: "projection_unavailable" }).code, "redacted");
  }],

  // ── 2. Working-claim: yalnız source + receipt + capability birlikte ──
  ["working-claim is true only when source, receipt and capability evidence all hold", () => {
    const ctx = loadStatusContext();
    const healthy = ctx.reminderWorkingClaimP(healthyReceipt(), healthyProjection(), { ok: true });
    assertEqual(healthy.ok, true);
    assertEqual(healthy.reason, null);
    // Receipt eksik → ok değil, reason receipt_kanit_yok.
    const noReceipt = ctx.reminderWorkingClaimP(null, healthyProjection(), { ok: true });
    assertEqual(noReceipt.ok, false);
    assertEqual(noReceipt.reason, "receipt_kanit_yok");
    // Kaynak eski → ok değil, reason kaynak_kanit_yok.
    const staleSrc = ctx.reminderWorkingClaimP(healthyReceipt(), { source: "legacy_fallback", reason: "projection_stale" }, { ok: true });
    assertEqual(staleSrc.ok, false);
    assertEqual(staleSrc.reason, "kaynak_kanit_yok");
    // Capability yok → ok değil, reason capability_kanit_yok.
    const noCap = ctx.reminderWorkingClaimP(healthyReceipt(), { source: "projection", reason: "ready", snapshot: { schemaVersion: 1 } }, { ok: true });
    assertEqual(noCap.ok, false);
    assertEqual(noCap.reason, "capability_kanit_yok");
  }],
  ["working-claim never reads as ok when any single evidence is missing", () => {
    const ctx = loadStatusContext();
    const combos = [
      [null, null, { ok: true }],
      [null, healthyProjection(), { ok: false, lastError: "network" }],
      [healthyReceipt(), null, { ok: true }],
      [healthyReceipt(), healthyProjection(), { ok: false, lastError: "network" }]
    ];
    combos.forEach(([rcpt, proj, fs]) => {
      const w = ctx.reminderWorkingClaimP(rcpt, proj, fs);
      assertEqual(w.ok, false);
    });
  }],

  // ── 3. Status card render: beş ayrı boyut + working claim + no raw detail ─
  ["status card renders source, receipt, capability, privacy and device as separate dimensions", () => {
    const ctx = loadStatusContext({
      p3TimeP: (v) => (v ? "t:" + v : "—"),
      tsShort: (v) => (v ? String(v) : "")
    });
    const html = ctx.reminderStatusCardHTMLP(healthyReceipt(), "2026-08-18T10:10:00.000Z", healthyProjection(), { ok: true });
    // Beş ayrı dimension hücresi.
    ["source", "receipt", "capability", "privacy", "device"].forEach((dim) => {
      assert(html.includes('data-reminder-dim="' + dim + '"'), "dimension missing: " + dim);
    });
    // Working claim ok (üç kanıt birlikte).
    assert(html.includes('data-reminder-working="ok"'));
    assert(!html.includes('data-reminder-working="pending"'));
    // Status-badge sözleşmesi.
    assert(html.includes('data-component="status-badge"'));
    assert(html.includes('data-component="reminder-status-card"'));
  }],
  ["status card never carries a raw reminder category, schedule or body", () => {
    const ctx = loadStatusContext({
      p3TimeP: (v) => (v ? "t:" + v : "—"),
      tsShort: (v) => (v ? String(v) : "")
    });
    const html = ctx.reminderStatusCardHTMLP(healthyReceipt(), "2026-08-18T10:10:00.000Z", healthyProjection(), { ok: true });
    // Raw reminder category / schedule / body asla render'a girmez.
    ["Namaz", "İlaç", "Terapi", "07:30", "kategori", "zamanlama", "body", "occurrence", "reminderQueue", "surah", "doz"]
      .forEach((needle) => assert(!html.includes(needle), "leaked: " + needle));
  }],
  ["status card shows a pending working-claim with reason when any evidence is missing", () => {
    const ctx = loadStatusContext({
      p3TimeP: (v) => (v ? "t:" + v : "—"),
      tsShort: (v) => (v ? String(v) : "")
    });
    // Receipt yok → pending claim + receipt_kanit_yok reason.
    const html = ctx.reminderStatusCardHTMLP(null, "2026-08-18T10:10:00.000Z", healthyProjection(), { ok: true });
    assert(html.includes('data-reminder-working="pending"'));
    assert(html.includes("receipt_kanit_yok"));
    assert(!html.includes('data-reminder-working="ok"'));
  }],

  // ── 4. Source time / privacy label / icon render (color değil tek anlam) ─
  ["the card pairs every dimension with a source time or a privacy label", () => {
    const ctx = loadStatusContext({
      p3TimeP: (v) => (v ? "t:" + v : "—"),
      tsShort: (v) => (v ? String(v) : "")
    });
    const html = ctx.reminderStatusCardHTMLP(healthyReceipt(), "2026-08-18T10:10:00.000Z", healthyProjection(), { ok: true });
    // Privacy hücresi 'yerel' etiketi taşır; kaynak hücresi bir zaman taşır.
    assert(html.includes("yerel"));
    assert(/data-reminder-dim="source"[\s\S]{0,600}?projeksiyon/.test(html));
    assert(html.includes("contract v1"));
    // Her hücrede status-badge (text + icon) vardır.
    assert((html.match(/data-component="status-badge"/g) || []).length >= 6);
  }],

  // ── 5. Source scanning: raw secret/token ve yazma yolu yok ──────────
  ["the reminder status helpers write no reminder preference, localStorage or app state", () => {
    const names = ["reminderStatusToneMapP", "reminderReceiptStatusP", "reminderCapabilityStatusP", "reminderSourceStatusP", "reminderDeviceAcceptanceStatusP", "reminderPrivacyStatusP", "reminderWorkingClaimP", "reminderStatusCardHTMLP"];
    names.forEach((name) => {
      const src = extractTopLevelFunction(name);
      ["method:\"PUT\"", "method: 'PUT'", "localStorage.setItem", "localStorage.removeItem", "setReminderEnabled", "SeySync.schedule"].forEach((needle) => {
        assert(!src.includes(needle), name + " leaked: " + needle);
      });
    });
  }],
  ["panel reminder status surfaces carry no token sentinel", () => {
    const names = ["reminderStatusToneMapP", "reminderReceiptStatusP", "reminderCapabilityStatusP", "reminderSourceStatusP", "reminderDeviceAcceptanceStatusP", "reminderPrivacyStatusP", "reminderWorkingClaimP", "reminderStatusCardHTMLP"];
    const sentinels = ["ghp_", "github_pat_", "Bearer ", "Authorization", "PTOKEN"];
    names.forEach((name) => {
      const src = extractTopLevelFunction(name);
      sentinels.forEach((s) => assert(!src.includes(s), name + " leaked: " + s));
    });
  }],
  ["the reminder status card CSS is present and balanced", () => {
    assert(PANEL_CSS.includes(".reminder-status-card"));
    assert(PANEL_CSS.includes(".reminder-status-grid"));
    assert(PANEL_CSS.includes(".reminder-working-ok"));
    assert(PANEL_CSS.includes(".reminder-working-pending"));
    // CSS brace balance.
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
