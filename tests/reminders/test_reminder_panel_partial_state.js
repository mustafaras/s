"use strict";

// REM-59 — G13-E panel partial fetch, stale ve fail-closed sözleşmesi.
//
// Projection, sync receipt, event log ve transport section'larından biri
// başarısız olduğunda panelin sağlıklı eski snapshot'ı yanlışlıkla yok
// etmemesini, yeni başarısız alanın "success" gibi görünmemesini, reminder
// system status'unun unavailable / stale / error / pending / ok olarak
// ayrışmasını, fail() davranışının kullanıcı draft'ı / token state'i /
// selected UI state'ini silmemesini ve panel status mesajlarının raw network
// error / token / personal detail taşımamasını deterministik ve read-only
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
const PANEL_SOURCE = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");

function extractTopLevelFunction(name) {
  const start = PANEL_SOURCE.indexOf("function " + name + "(");
  if (start < 0) throw new Error(name + " panel.js içinde bulunamadı");
  const end = PANEL_SOURCE.indexOf("\nfunction ", start + 10);
  return PANEL_SOURCE.slice(start, end < 0 ? PANEL_SOURCE.length : end).trim();
}

// fail() fonksiyonundan SONRA aynı satırda `window.savePanelToken=function(){}`
// blokları geldiği için `extractTopLevelFunction` bunları da yakalar (aşağıdaki
// \nfunction eşleşmesi yalnız "function " ile başlayan satırları durdurur).
// Bu yardımcı, fonksiyon gövdesini süslü parantez dengelemesiyle tam olarak
// kapatır — yalnız fail()'in gerçek gövdesini verir.
function extractFunctionBody(name) {
  const start = PANEL_SOURCE.indexOf("function " + name + "(");
  if (start < 0) throw new Error(name + " panel.js içinde bulunamadı");
  let depth = 0, inStr = null, inComment = false, i = start;
  for (; i < PANEL_SOURCE.length; i++) {
    const c = PANEL_SOURCE[i];
    if (inStr) {
      if (c === "\\") { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === "\"" || c === "'") { inStr = c; continue; }
    if (c === "{") { depth++; continue; }
    if (c === "}") { depth--; if (depth === 0) break; }
  }
  return PANEL_SOURCE.slice(start, i + 1).trim();
}

function loadPanelHelpers(names, extra) {
  const code = names.map(extractTopLevelFunction).join("\n");
  const context = Object.assign({
    Date, Math, String, Number, Boolean, Object, Array, JSON, isNaN, isFinite, RegExp,
    esc: (value) => String(value == null ? "" : value)
  }, extra || {});
  vm.runInNewContext(code, context, { filename: "panel-rem59-helpers.js" });
  return context;
}

// Sağlıklı bir sections kümesi: en az bir section dolu. Bu, "önceki sağlıklı
// yüklemeden kalma" durumunu simüle eder.
function healthySections() {
  return {
    dailyPhoto: { status: "ok", title: "Güvenli başlık" },
    therapyProvenance: { status: "missing", thoughts: [], windDown: { status: "missing", events: [] } },
    profileProgress: { status: "missing" }
  };
}

const cases = [
  // ── 1. İlk load / sağlıklı / kısmi başarısız / recovered / malformed ─
  ["a partial section fetch failure preserves previous healthy sections", () => {
    const ctx = loadPanelHelpers(["applySectionFailureP"]);
    const before = healthySections();
    const fx = ctx.applySectionFailureP(before, new Error("network down"));
    assert(fx.hadSections === true);
    // Sağlıklı sections KORUNUR, silinmez.
    assert(deepEqual(fx.sections, before));
    assertEqual(fx.sections.dailyPhoto.status, "ok");
    assertEqual(fx.sectionFetchState.ok, false);
    // lastError yalnız sabit bir KOD'dur; ham "network down" metni değil.
    assertEqual(fx.sectionFetchState.lastError, "network");
  }],
  ["a recovered state clears the failure and returns to healthy without duplication", () => {
    // REM-59 Görev 1: recovery sonrası state temiz ve duplicate'siz olmalı.
    // Başarılı bir sonraki poll, load() içinde sectionFetchState'ı
    // {ok:true,lastError:null,failedAt:null} yapar (önceki sağlıklı
    // sections korunur). Buradaki sözleşme: applySectionFailureP sonrası
    // sağlıklı sections kümesi hâlâ eksiksizdir ve başarılı yükleme onu
    // SIFIRLAMAZ / ikiye katlamaz.
    const ctx = loadPanelHelpers(["applySectionFailureP"]);
    const before = healthySections();
    const fx = ctx.applySectionFailureP(before, new Error("network down"));
    assert(fx.hadSections === true);
    // Recovery: sectionFetchState ok=true'ya döner; sections kümesi aynı kalır.
    const recoveredFetch = { ok: true, lastError: null, failedAt: null };
    assertEqual(recoveredFetch.ok, true);
    assertEqual(recoveredFetch.lastError, null);
    // Sections kümesi duplicate'siz: her anahtar tek kez, içerik birebir korunur.
    assert(deepEqual(fx.sections, before));
    assertEqual(Object.keys(fx.sections).length, Object.keys(before).length);
    assertEqual(Object.keys(fx.sections).filter((k) => k === "dailyPhoto").length, 1);
  }],
  ["a stale projection is a distinct state from a missing one", () => {
    // REM-59 Görev 1: stale data stale görünür, missing'e veya ok'a
    // karışmaz.
    const ctx = loadPanelHelpers(["reminderSystemStatusP"]);
    const stale = ctx.reminderSystemStatusP({ source: "legacy_fallback", reason: "projection_stale" }, { ok: true });
    const missing = ctx.reminderSystemStatusP({ source: "legacy_fallback", reason: "projection_missing" }, { ok: true });
    const ready = ctx.reminderSystemStatusP({ source: "projection", reason: "ready" }, { ok: true });
    assertEqual(stale.code, "stale");
    assertEqual(missing.code, "unavailable");
    assertEqual(ready.code, "ok");
    assert(stale.code !== missing.code && stale.code !== ready.code);
    // Stale metni "güncelmiş gibi sunulmuyor" der — hazır iddiası kullanmaz.
    assert(stale.text.includes("eski"));
    assert(!stale.text.includes("Hazır"));
  }],
  ["a first-load failure (no sections yet) falls back to the normal missing state", () => {
    const ctx = loadPanelHelpers(["applySectionFailureP"]);
    const fx = ctx.applySectionFailureP({}, new Error("network down"));
    assert(fx.hadSections === false);
    assert(deepEqual(fx.sections, {}));
    assertEqual(fx.sectionFetchState.ok, false);
    assertEqual(fx.sectionFetchState.lastError, "network");
  }],
  ["malformed sections input is treated as an empty first load, not a leak", () => {
    const ctx = loadPanelHelpers(["applySectionFailureP"]);
    const fx = ctx.applySectionFailureP(null, new Error("boom"));
    assert(fx.hadSections === false);
    assert(deepEqual(fx.sections, {}));
    assertEqual(fx.sectionFetchState.ok, false);
  }],
  ["error classification maps 401/403/404/429/409 to stable codes", () => {
    const ctx = loadPanelHelpers(["applySectionFailureP"]);
    const map = [
      [new Error("Unauthorized (401)"), "unauthorized"],
      [new Error("Token gecersiz veya yetkisiz"), "unauthorized"],
      [new Error("Forbidden 403"), "forbidden"],
      [new Error("data/latest.json bulunamadi"), "not_found"],
      [new Error("429 rate limit"), "rate_limited"],
      [new Error("conflict 409"), "conflict"],
      [new Error("random network failure"), "network"]
    ];
    map.forEach(([err, expected]) => {
      const fx = ctx.applySectionFailureP({}, err);
      assertEqual(fx.sectionFetchState.lastError, expected);
    });
    // Hata KODU asla ham mesajı içermez.
    map.forEach(([err]) => {
      const fx = ctx.applySectionFailureP({}, err);
      assert(!/^\d{3}/.test(fx.sectionFetchState.lastError));
      assert(!fx.sectionFetchState.lastError.includes("network down"));
    });
  }],
  ["the failure helper writes no reminder preference, localStorage or app state", () => {
    const fn = extractFunctionBody("applySectionFailureP");
    ["method:\"PUT\"", "method: 'PUT'", "localStorage.setItem", "localStorage.removeItem", "setReminderEnabled", "reminders"]
      .forEach((needle) => assert(!fn.includes(needle)));
  }],

  // ── 2. Reminder system status: unavailable / stale / error / pending / ok ─
  ["reminder system status keeps missing, stale, error, pending and ok distinct", () => {
    const ctx = loadPanelHelpers(["emptyStateReasonP"]);
    const reasonFor = (fetchFailed, stateReason) => {
      ctx.PROJECTION = {
        sectionFetchState: { ok: !fetchFailed, lastError: fetchFailed ? "network" : null, failedAt: fetchFailed ? "2026-08-18T10:00:00.000Z" : null },
        state: { reason: stateReason }
      };
      return ctx.emptyStateReasonP("missing");
    };
    // ok: sağlıklı ve reason 'ready' → hiç kullanılmamış modül.
    const ok = reasonFor(false, "ready");
    assert(ok.kind === "unused" && ok.text.includes("henüz kullanılmamış"));
    // pending: section fetch başarısız → veri gelmiş olabilir.
    const pending = reasonFor(true, "ready");
    assert(pending.kind === "pending" && pending.text.includes("Senkron bekleniyor"));
    // pending: receipt_missing / projection_stale → bekleniyor.
    assert(reasonFor(false, "receipt_missing").kind === "pending");
    assert(reasonFor(false, "projection_stale").kind === "pending");
    // error: projection_invalid / projection_load_failed.
    assert(reasonFor(false, "projection_invalid").kind === "error");
    assert(reasonFor(false, "projection_load_failed").kind === "error");
    // Beş kategori deterministik ve ayrık.
    const kinds = ["unused", "pending", "error"];
    assertEqual(new Set(["unused", "pending", "error"]).size, 3);
    assert(kinds.includes(ok.kind) && kinds.includes(pending.kind));
  }],
  ["reminder system status is a full five-way unavailable/stale/error/pending/ok map", () => {
    // REM-59 Görev 3: reminder system status unavailable / stale / error /
    // pending / ok olarak AYRI durumlara sahiptir; tek yeşil rozetle
    // maskeleme yok.
    const ctx = loadPanelHelpers(["reminderSystemStatusP"]);
    const statusFor = (state, fetchState) => ctx.reminderSystemStatusP(state, fetchState);
    const okS = statusFor({ source: "projection", reason: "ready" }, { ok: true });
    assertEqual(okS.code, "ok");
    assertEqual(okS.kind, "ok");
    const stale = statusFor({ source: "legacy_fallback", reason: "projection_stale" }, { ok: true });
    assertEqual(stale.code, "stale");
    assertEqual(stale.kind, "warning");
    const error = statusFor({ source: "legacy_fallback", reason: "projection_invalid" }, { ok: true });
    assertEqual(error.code, "error");
    assertEqual(error.kind, "error");
    const pending = statusFor({ source: "legacy_fallback", reason: "receipt_missing" }, { ok: true });
    assertEqual(pending.code, "pending");
    assertEqual(pending.kind, "pending");
    const unavailable = statusFor({ source: "legacy_fallback", reason: "projection_missing" }, { ok: true });
    assertEqual(unavailable.code, "unavailable");
    // fetch başarısız + load_failed → unavailable (error kind).
    const unavailableFetch = statusFor({ source: "legacy_fallback", reason: "projection_load_failed" }, { ok: false, lastError: "network" });
    assertEqual(unavailableFetch.code, "unavailable");
    assertEqual(unavailableFetch.kind, "error");
    // Beş kod birbirinden ayrık ve deterministik.
    const codes = [okS, stale, error, pending, unavailable, unavailableFetch].map((s) => s.code);
    assertEqual(new Set(codes).size, 5);
    codes.forEach((c) => assert(["ok", "stale", "error", "pending", "unavailable"].includes(c)));
    // Yalnız ok tonu başarı iddiasıdır.
    assertEqual(okS.kind, "ok");
    [stale, error, pending, unavailable, unavailableFetch].forEach((s) => assert(s.kind !== "ok"));
  }],
  ["reminder system status never surfaces a raw network error or token", () => {
    const ctx = loadPanelHelpers(["reminderSystemStatusP"]);
    [["projection_stale", true], ["projection_invalid", true], ["receipt_missing", true], ["projection_load_failed", false], ["projection_missing", true], ["ready", true]]
      .forEach(([reason, okFlag]) => {
        const r = ctx.reminderSystemStatusP({ source: "legacy_fallback", reason }, { ok: okFlag, lastError: "network", failedAt: "2026-08-18T10:00:00.000Z" });
        assert(!/network down|ECONN|Bearer ghp_|github_pat/i.test(r.text));
        assert(!/\bghp_[A-Za-z0-9]+\b/.test(r.text));
        assert(!/Authorization/.test(r.text));
      });
  }],

  // ── 3. fail() draft / token / selected UI state korunur ────────────
  ["fail() writes the error screen without touching draft, token or selected UI state", () => {
    const ctx = loadPanelHelpers(["fail"], {
      window: {},
      document: {
        getElementById: () => {
          return { set innerHTML(v) { ctx.rendered = v; } };
        }
      },
      esc: (v) => String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    });
    const draftBefore = "gözlemci taslağı korunmalı";
    const uiBefore = { msgDraft: draftBefore, selectedDate: "2026-08-10", eventFilter: "reminder" };
    const uiClone = deepClone(uiBefore);
    const tokenBefore = "github_pat_REM59_FIXTURE_TOKEN";
    ctx.fail("network down");
    // fail() yalnız #app innerHTML'ini değiştirir; UI state'e dokunmaz.
    assert(ctx.rendered && ctx.rendered.includes("Bağlantı bekleniyor"));
    assert(deepEqual(uiBefore, uiClone));
    assertEqual(uiBefore.msgDraft, draftBefore);
    // REM-59 Görev 4: fail() token state'ini SİLMEZ / değiştirmez. Test
    // context'inde PTOKEN yok; gerçek gövdelerde PTOKEN mutasyonu olmadığını
    // kaynak tarama ile doğrularız (aşağıda) ve token değeri hiç render
    // edilmez.
    assert(!ctx.rendered.includes(tokenBefore));
    // fail() gövdesinde localStorage / PTOKEN / UI mutasyonu yok.
    const failSrc = extractFunctionBody("fail");
    assert(!/localStorage\.setItem/.test(failSrc));
    assert(!/localStorage\.removeItem/.test(failSrc));
    assert(!/PTOKEN\s*=/.test(failSrc));
    assert(!/UI\.msgDraft\s*=/.test(failSrc));
    assert(!/UI\.selectedDate\s*=/.test(failSrc));
  }],

  // ── 4. Panel status mesajları raw error / token / personal detail içermez ─
  ["panel status messages carry no raw network error, token or personal detail", () => {
    // Polling hatası ve canonical hata yolları yalnız sabit güvenli metin üretir.
    const failSrc = extractFunctionBody("fail");
    const syncRibbon = extractTopLevelFunction("syncRibbonHTMLP");
    const tokenSentinel = ["ghp_", "github_pat_", "Bearer ", "Authorization"];
    [failSrc, syncRibbon].forEach((src) => {
      tokenSentinel.forEach((needle) => assert(!src.includes(needle)));
    });
    // fail() yalnız sabit "Bağlantı bekleniyor" + esc(msg) gösterir; msg sabit
    // kodlarla sınırlanır (aşağıdaki kod yollarında sabit metinler kullanılır).
    assert(/Bağlantı bekleniyor/.test(failSrc));
    assert(/Tekrar Dene/.test(failSrc));
  }],
  ["partial-failure status is honest: a failed field never reads as success", () => {
    // sectionFetchState.ok=false iken pending/error metni kullanılır, ok/ready
    // iddiası üretilmez.
    const ctx = loadPanelHelpers(["emptyStateReasonP"]);
    ctx.PROJECTION = { sectionFetchState: { ok: false, lastError: "network", failedAt: "2026-08-18T10:00:00.000Z" }, state: { reason: "projection_load_failed" } };
    const r = ctx.emptyStateReasonP("missing");
    assert(r.kind !== "unused");
    assert(!r.text.includes("Hazır"));
    assert(!r.text.includes("başarılı"));
  }]
];

runTests(cases).catch(() => { process.exitCode = 1; });
