"use strict";

// REM-55 — G13-A panel source authority ve projection seçim sözleşmesi.
//
// Panelin latest / receipt / observer projection / legacy fallback arasında
// HANGİ kaynağı NEDEN seçtiğini deterministik, provenance'lı ve read-only
// olarak sabitler. Panel bir gözlemcidir: bu fixture hiçbir yazma yolu,
// gerçek GitHub çağrısı, browser veya kullanıcı verisi kullanmaz.
//
// Kapsam sınırı: current observer panel (`panel.js`, `panelCoverageManifest.js`).
// Panel-v2 ayrı bir regression yüzeyidir ve buraya dahil değildir.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepClone, deepEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const COVERAGE_SOURCE = fs.readFileSync(path.join(ROOT, "panelCoverageManifest.js"), "utf8");
const PANEL_SOURCE = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");

const SHA_LATEST = "b".repeat(40);
const SHA_OTHER = "f".repeat(40);
const REV_SNAPSHOT = "c".repeat(40);
const REV_OTHER = "9".repeat(40);
const SOURCE_UPDATED_AT = "2026-08-18T14:58:00.000Z";
const SUBMITTED_AT = "2026-08-18T14:59:00.000Z";
const ACCEPTED_AT = "2026-08-18T15:00:00.000Z";
const PROJECTION_BUILT_AT = "2026-08-18T15:00:05.000Z";

function loadCoverage() {
  const context = {
    window: {}, Date, JSON, Array, Object, String, Number, Boolean, Math, isNaN, isFinite
  };
  vm.runInNewContext(COVERAGE_SOURCE, context, { filename: "panelCoverageManifest.js" });
  const api = context.window.PanelCoverageV1;
  if (!api) throw new Error("PanelCoverageV1 yüklenemedi");
  return api;
}

// panel.js tek büyük IIFE; p0/p1 fixture'larının yaptığı gibi yalnız ilgili
// top-level fonksiyonları çıkarıp izole bir context'te çalıştırıyoruz.
function extractTopLevelFunction(name) {
  const start = PANEL_SOURCE.indexOf("function " + name + "(");
  if (start < 0) throw new Error(name + " panel.js içinde bulunamadı");
  const end = PANEL_SOURCE.indexOf("\nfunction ", start + 10);
  return PANEL_SOURCE.slice(start, end < 0 ? PANEL_SOURCE.length : end).trim();
}

function loadPanelHelpers(names) {
  const code = names.map(extractTopLevelFunction).join("\n");
  const context = {
    Date, Math, String, Number, Boolean, Object, Array, JSON, isNaN, isFinite, RegExp,
    esc: (value) => String(value == null ? "" : value)
  };
  vm.runInNewContext(code, context, { filename: "panel-rem55-helpers.js" });
  return context;
}

function makeLatest() {
  return {
    version: 2,
    startDate: "2026-08-17",
    lastOpenedDate: "2026-08-18",
    savedAt: SOURCE_UPDATED_AT,
    settings: {
      nickname: "Günışığı", ghRepo: "owner/repo", ghBranch: "main",
      ghToken: "SENTETIK_GH_TOKEN", openaiKey: "SENTETIK_OPENAI_KEY",
      syncUrl: "https://sentetik.example/sync"
    },
    profileAssessment: {
      status: "completed",
      responses: { item_1: { answer: "SENTETIK_PROFIL_CEVABI", answeredAt: SOURCE_UPDATED_AT } },
      panelSummary: { confidenceScore: 71 }
    },
    location: { lat: 41.01, lon: 28.97, accuracy: 5, ts: SOURCE_UPDATED_AT, source: "gps" },
    locationHistory: [{ lat: 41.01, lon: 28.97, ts: SOURCE_UPDATED_AT }],
    days: {
      "2026-08-18": {
        savedAt: SOURCE_UPDATED_AT, note: "güvenli not",
        media: { type: "photo", data: "SENTETIK_MEDYA_BASE64" }
      }
    },
    // REM-53: bu kökler cihazda local-only'dir ve sync sınırını geçmez. Panel
    // yine de düşman bir latest.json ile karşılaşabilir; fallback bunları
    // YENİ BİR YÜZEYE taşımamalıdır.
    reminders: {
      schemaVersion: 1,
      preferences: { "reminder.catalog.v1.medication": { enabled: true, time: "08:30" } },
      medications: [{ id: "m1", name: "SENTETIK_ILAC_ADI", time: "08:30" }]
    },
    deliveryLog: [{ occurrenceId: "SENTETIK_OCCURRENCE", body: "SENTETIK_HAM_GOVDE" }],
    notifications: [{ id: "n1", status: "pending" }]
  };
}

function acceptedReceipt() {
  return {
    schemaVersion: 1, status: "accepted",
    snapshotRevision: REV_SNAPSHOT, sourceUpdatedAt: SOURCE_UPDATED_AT,
    submittedAt: SUBMITTED_AT, acceptedAt: ACCEPTED_AT,
    sourceLatestSha: SHA_LATEST, lastErrorCode: null
  };
}

function validProjection(overrides) {
  return Object.assign({
    schemaVersion: 1,
    snapshotRevision: REV_SNAPSHOT,
    sourceLatestSha: SHA_LATEST,
    projectionBuiltAt: PROJECTION_BUILT_AT,
    serverAcceptedAt: ACCEPTED_AT,
    sourceUpdatedAt: SOURCE_UPDATED_AT,
    coverage: { full: ["version"], summary: [], redacted: ["settings.ghToken"], missing: [], unmappedPaths: [] },
    data: { version: 2, startDate: "2026-08-17", days: {}, settings: { nickname: "Günışığı" } }
  }, overrides || {});
}

const SECRET_SENTINELS = [
  "SENTETIK_GH_TOKEN", "SENTETIK_OPENAI_KEY", "sentetik.example",
  "SENTETIK_PROFIL_CEVABI", "SENTETIK_MEDYA_BASE64",
  "SENTETIK_ILAC_ADI", "SENTETIK_OCCURRENCE", "SENTETIK_HAM_GOVDE"
];

function assertSafeShape(value) {
  const json = JSON.stringify(value);
  SECRET_SENTINELS.forEach((needle) => assert(!json.includes(needle)));
  assert(!/\b28\.97\b/.test(json));
  assert(!/\b41\.01\b/.test(json));
}

const cases = [
  // ── 1. Altı ayrı, deterministik source state ────────────────────────
  ["a matching projection and accepted receipt is the only path to success", () => {
    const P = loadCoverage();
    const chosen = P.chooseProjection(validProjection(), makeLatest(), acceptedReceipt());
    assertEqual(chosen.source, "projection");
    assertEqual(chosen.reason, "ready");
    assert(chosen.snapshot && chosen.snapshot.schemaVersion === 1);
    // Basari YALNIZ receipt + projection kanitiyla gosterilir.
    assertEqual(chosen.snapshot.sourceLatestSha, SHA_LATEST);
    assertEqual(chosen.snapshot.snapshotRevision, REV_SNAPSHOT);
    // Deterministik: ayni girdi ayni sonucu verir.
    const again = P.chooseProjection(validProjection(), makeLatest(), acceptedReceipt());
    assertEqual(again.source, chosen.source);
    assertEqual(again.reason, chosen.reason);
  }],
  ["a stale projection falls back and never reports success", () => {
    const P = loadCoverage();
    const bySha = P.chooseProjection(validProjection({ sourceLatestSha: SHA_OTHER }), makeLatest(), acceptedReceipt());
    assertEqual(bySha.source, "legacy_fallback");
    assertEqual(bySha.reason, "projection_stale");
    // Stale snapshot TANI icin korunur, veri kaynagi olarak KULLANILMAZ.
    assert(bySha.snapshot && bySha.snapshot.sourceLatestSha === SHA_OTHER);

    const byRevision = P.chooseProjection(validProjection({ snapshotRevision: REV_OTHER }), makeLatest(), acceptedReceipt());
    assertEqual(byRevision.source, "legacy_fallback");
    assertEqual(byRevision.reason, "projection_stale");
  }],
  ["a missing projection is distinct from an invalid one", () => {
    const P = loadCoverage();
    const missing = P.chooseProjection(null, makeLatest(), acceptedReceipt());
    assertEqual(missing.source, "legacy_fallback");
    assertEqual(missing.reason, "projection_missing");
    assertEqual(missing.snapshot, null);

    [
      validProjection({ schemaVersion: 2 }),
      validProjection({ snapshotRevision: "kisa" }),
      validProjection({ projectionBuiltAt: "not-an-iso-date" }),
      validProjection({ data: null }),
      "{ bozuk json"
    ].forEach((broken) => {
      const invalid = P.chooseProjection(broken, makeLatest(), acceptedReceipt());
      assertEqual(invalid.source, "legacy_fallback");
      assertEqual(invalid.reason, "projection_invalid");
      assertEqual(invalid.snapshot, null);
    });
  }],
  ["a projection without an accepted receipt is never promoted to success", () => {
    const P = loadCoverage();
    [
      Object.assign(acceptedReceipt(), { acceptedAt: null }),
      Object.assign(acceptedReceipt(), { sourceLatestSha: null }),
      Object.assign(acceptedReceipt(), { status: "queued", acceptedAt: null }),
      null,
      {}
    ].forEach((receipt) => {
      const chosen = P.chooseProjection(validProjection(), makeLatest(), receipt);
      assertEqual(chosen.source, "legacy_fallback");
      assertEqual(chosen.reason, "receipt_missing");
      assertEqual(chosen.snapshot, null);
    });
  }],
  ["every source state is one of the declared, non-overlapping outcomes", () => {
    const P = loadCoverage();
    const states = [
      P.chooseProjection(validProjection(), makeLatest(), acceptedReceipt()),
      P.chooseProjection(validProjection({ sourceLatestSha: SHA_OTHER }), makeLatest(), acceptedReceipt()),
      P.chooseProjection(null, makeLatest(), acceptedReceipt()),
      P.chooseProjection(validProjection({ schemaVersion: 9 }), makeLatest(), acceptedReceipt()),
      P.chooseProjection(validProjection(), makeLatest(), null)
    ];
    const reasons = states.map((state) => state.reason);
    assertEqual(new Set(reasons).size, 5);
    states.forEach((state) => {
      assert(state.source === "projection" || state.source === "legacy_fallback");
      assert(typeof state.reason === "string" && state.reason.length > 0);
      assert(state.coverage && typeof state.coverage === "object");
      assert(state.data && typeof state.data === "object");
      // Basari yalnizca 'projection' kaynaginda ve yalnizca 'ready' ile.
      assertEqual(state.source === "projection", state.reason === "ready");
    });
  }],

  // ── 2. Alanlar birbirine karışmaz ───────────────────────────────────
  ["source sha, snapshot revision, sourceUpdatedAt and builtAt stay separate", () => {
    const P = loadCoverage();
    const chosen = P.chooseProjection(validProjection(), makeLatest(), acceptedReceipt());
    const snapshot = chosen.snapshot;
    // Dort alan dort ayri anlam tasir; hicbiri digerinin yerine gecmez.
    assertEqual(snapshot.sourceLatestSha, SHA_LATEST);
    assertEqual(snapshot.snapshotRevision, REV_SNAPSHOT);
    assertEqual(snapshot.sourceUpdatedAt, SOURCE_UPDATED_AT);
    assertEqual(snapshot.projectionBuiltAt, PROJECTION_BUILT_AT);
    assertEqual(snapshot.serverAcceptedAt, ACCEPTED_AT);
    assert(snapshot.sourceLatestSha !== snapshot.snapshotRevision);
    assert(snapshot.projectionBuiltAt !== snapshot.sourceUpdatedAt);
    assert(snapshot.projectionBuiltAt !== snapshot.serverAcceptedAt);

    // Alanlari yer degistirmek BASARI degil, stale uretir.
    const swapped = P.chooseProjection(
      validProjection({ sourceLatestSha: REV_SNAPSHOT, snapshotRevision: SHA_LATEST }),
      makeLatest(), acceptedReceipt()
    );
    assertEqual(swapped.reason, "projection_stale");

    // Receipt'in acceptedAt'i projection builtAt yerine kullanilamaz.
    const builtEqualsAccepted = P.chooseProjection(
      validProjection({ projectionBuiltAt: ACCEPTED_AT }), makeLatest(), acceptedReceipt()
    );
    assertEqual(builtEqualsAccepted.reason, "ready");
    assert(builtEqualsAccepted.snapshot.projectionBuiltAt === ACCEPTED_AT);
    assert(builtEqualsAccepted.snapshot.serverAcceptedAt === ACCEPTED_AT);
    // Esit OLABILIRLER; sozlesme ayri ALANLAR olmalari, esitsizlikleri degil.
    assert(Object.prototype.hasOwnProperty.call(builtEqualsAccepted.snapshot, "projectionBuiltAt"));
    assert(Object.prototype.hasOwnProperty.call(builtEqualsAccepted.snapshot, "serverAcceptedAt"));
  }],

  // ── 3. Panel durum ayrımı: yok / stale / pending / error ────────────
  ["panel status keeps missing, stale, pending and error visually distinct", () => {
    const panel = loadPanelHelpers(["projectionStatusP"]);
    const statusFor = (state) => panel.projectionStatusP(state);
    const ready = statusFor({ source: "projection", reason: "ready" });
    const missing = statusFor({ source: "legacy_fallback", reason: "projection_missing" });
    const stale = statusFor({ source: "legacy_fallback", reason: "projection_stale" });
    const pending = statusFor({ source: "legacy_fallback", reason: "receipt_missing" });
    const broken = statusFor({ source: "legacy_fallback", reason: "projection_invalid" });
    const permission = statusFor({ source: "legacy_fallback", reason: "projection_permission" });
    const network = statusFor({ source: "legacy_fallback", reason: "projection_network" });

    const all = [ready, missing, stale, pending, broken, permission];
    all.forEach((status) => {
      assert(status && typeof status.label === "string" && status.label.length > 0);
      assert(typeof status.cls === "string" && status.cls.length > 0);
      assert(typeof status.note === "string" && status.note.length > 0);
    });
    // "Yok" ile "okunamadi" ayni sey DEGILDIR.
    assert(missing.label !== permission.label);
    assert(missing.cls !== permission.cls);
    assert(missing.label !== stale.label);
    assert(missing.label !== pending.label);
    assert(missing.label !== broken.label);
    assert(stale.label !== pending.label);
    assertEqual(permission.label, network.label);
    // Yalnizca hazir durum "ok" tonundadir.
    assertEqual(ready.cls, "b-ok");
    [missing, stale, pending, broken, permission].forEach((status) => assert(status.cls !== "b-ok"));
  }],
  ["the loader's specific failure reason survives into the panel source state", () => {
    // panel.js `load()` icinde chooseProjection'in kaba 'projection_missing'
    // sonucu, projection YUKLEYICISININ daha ozgul nedeniyle (permission /
    // network / invalid) yukseltilmelidir. Aksi hâlde bir 401/403, panelde
    // "Projection yok" gibi ZARARSIZ gorunur.
    const panel = loadPanelHelpers(["projectionSourceStateP", "projectionStatusP"]);
    const coarse = { source: "legacy_fallback", reason: "projection_missing", snapshot: null, data: {}, coverage: {} };

    [
      ["projection_permission", "projection_permission"],
      ["projection_network", "projection_network"],
      ["projection_invalid", "projection_invalid"],
      ["projection_parse_failed", "projection_parse_failed"],
      ["projection_unavailable", "projection_unavailable"]
    ].forEach(([loaderReason, expected]) => {
      const resolved = panel.projectionSourceStateP(deepClone(coarse), { snapshot: null, sha: null, reason: loaderReason });
      assertEqual(resolved.reason, expected);
      assertEqual(resolved.source, "legacy_fallback");
    });

    // Yukleyici de 'projection_missing' diyorsa kaba neden korunur.
    const stillMissing = panel.projectionSourceStateP(deepClone(coarse), { snapshot: null, sha: null, reason: "projection_missing" });
    assertEqual(stillMissing.reason, "projection_missing");

    // Basarili / stale / receipt_missing durumlari ASLA ezilmez.
    ["ready", "projection_stale", "receipt_missing"].forEach((reason) => {
      const source = reason === "ready" ? "projection" : "legacy_fallback";
      const resolved = panel.projectionSourceStateP({ source, reason, snapshot: null, data: {}, coverage: {} }, { snapshot: null, sha: null, reason: "projection_permission" });
      assertEqual(resolved.reason, reason);
      assertEqual(resolved.source, source);
    });

    // Yukleyici sonucu hic yoksa fail-closed: kaba neden korunur, throw yok.
    assertEqual(panel.projectionSourceStateP(deepClone(coarse), null).reason, "projection_missing");
    assertEqual(panel.projectionSourceStateP(deepClone(coarse), {}).reason, "projection_missing");

    // Bir sync RECEIPT'i buraya neden kaynagi olarak GECEMEZ; normalize
    // edilmis receipt'te `reason` alani hic yoktur.
    const receiptLike = { schemaVersion: 1, status: "permission", lastErrorCode: "unauthorized", acceptedAt: null };
    assertEqual(panel.projectionSourceStateP(deepClone(coarse), receiptLike).reason, "projection_missing");

    // Ve panel bu ozgul nedeni gorsel olarak da ayirir.
    const resolved = panel.projectionSourceStateP(deepClone(coarse), { snapshot: null, sha: null, reason: "projection_permission" });
    assert(panel.projectionStatusP(resolved).label !== panel.projectionStatusP(coarse).label);
  }],

  // ── 4. Fallback safe shape ──────────────────────────────────────────
  ["legacy fallback serves a redacted safe shape, never the raw latest object", () => {
    const P = loadCoverage();
    const latest = makeLatest();
    ["projection_missing", "projection_stale", "receipt_missing", "projection_invalid"].forEach((expected) => {
      const chosen = expected === "projection_missing" ? P.chooseProjection(null, latest, acceptedReceipt())
        : expected === "projection_stale" ? P.chooseProjection(validProjection({ sourceLatestSha: SHA_OTHER }), latest, acceptedReceipt())
        : expected === "receipt_missing" ? P.chooseProjection(validProjection(), latest, null)
        : P.chooseProjection(validProjection({ schemaVersion: 3 }), latest, acceptedReceipt());
      assertEqual(chosen.reason, expected);
      assert(chosen.data !== latest);
      assertSafeShape(chosen.data);
      assertSafeShape(chosen.sections);
      assertSafeShape(chosen.coverage);
      // Reminder kökleri fallback'te YENİ bir yüzey açmaz.
      ["reminders", "delivery", "deliveryLog", "reminderDelivery", "reminderHistory", "notificationDelivery"]
        .forEach((rootKey) => assert(!chosen.data[rootKey] || Object.keys(chosen.data[rootKey]).length === 0));
    });
  }],
  ["the projection path is redacted too and adds no reminder surface", () => {
    const P = loadCoverage();
    const hostile = validProjection({
      data: Object.assign(makeLatest(), { savedAt: SOURCE_UPDATED_AT })
    });
    const chosen = P.chooseProjection(hostile, makeLatest(), acceptedReceipt());
    assertEqual(chosen.source, "projection");
    assertSafeShape(chosen.data);
    ["reminders", "deliveryLog", "notificationDelivery"]
      .forEach((rootKey) => assert(!chosen.data[rootKey] || Object.keys(chosen.data[rootKey]).length === 0));
  }],

  // ── 5. Read-only: seçim hiçbir şeyi mutate etmez ────────────────────
  ["source selection mutates neither latest, receipt nor the projection input", () => {
    const P = loadCoverage();
    const latest = makeLatest();
    const receipt = acceptedReceipt();
    const projection = validProjection();
    const latestBefore = deepClone(latest);
    const receiptBefore = deepClone(receipt);
    const projectionBefore = deepClone(projection);

    P.chooseProjection(projection, latest, receipt);
    P.chooseProjection(null, latest, receipt);
    P.chooseProjection(validProjection({ sourceLatestSha: SHA_OTHER }), latest, receipt);
    P.chooseProjection(projection, latest, null);

    assert(deepEqual(latest, latestBefore));
    assert(deepEqual(receipt, receiptBefore));
    assert(deepEqual(projection, projectionBefore));
    // Reminder tercih koku aynen korunur.
    assertEqual(latest.reminders.preferences["reminder.catalog.v1.medication"].time, "08:30");
  }],
  ["the panel owns no write path to app state or reminder preference", () => {
    // Panel gozlemcidir: latest.json'a veya reminder tercihine yazamaz.
    assert(!/data\/latest\.json[\s\S]{0,200}method:\s*["']PUT/u.test(PANEL_SOURCE));
    assert(!/data\/reminder[\s\S]{0,200}method:\s*["']PUT/u.test(PANEL_SOURCE));
    ["setReminderEnabled", "setReminderCategoryEnabled", "setReminderProfile",
     "reminderSyncPayload", "snoozeReminderDelivery", "muteReminderToday"]
      .forEach((needle) => assert(!PANEL_SOURCE.includes(needle)));
    // Secim fonksiyonu, panelin yazma yardimcilarina hic dokunmaz.
    const selection = extractTopLevelFunction("projectionSourceStateP");
    ["putInbox", "putTransportFileP", "fetch(", "localStorage"]
      .forEach((needle) => assert(!selection.includes(needle)));
  }]
];

runTests(cases).catch(() => { process.exitCode = 1; });
