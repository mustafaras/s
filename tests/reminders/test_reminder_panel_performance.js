"use strict";

// REM-65 — current panel polling/render stability fixture.
// Sentetik helper sınırı: fetch, browser, token, localStorage ve kişisel veri yok.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const PANEL_SOURCE = fs.readFileSync(path.join(ROOT, "panel/panel.js"), "utf8");

function extractTopLevelFunction(name) {
  const start = PANEL_SOURCE.indexOf("function " + name + "(");
  if (start < 0) throw new Error(name + " panel.js içinde bulunamadı");
  const open = PANEL_SOURCE.indexOf("{", start);
  let depth = 0;
  let quote = null;
  let lineComment = false;
  let blockComment = false;
  for (let index = open; index < PANEL_SOURCE.length; index += 1) {
    const char = PANEL_SOURCE[index];
    const next = PANEL_SOURCE[index + 1];
    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") { blockComment = false; index += 1; }
      continue;
    }
    if (quote) {
      if (char === "\\") { index += 1; continue; }
      if (char === quote) quote = null;
      continue;
    }
    if (char === "/" && next === "/") { lineComment = true; index += 1; continue; }
    if (char === "/" && next === "*") { blockComment = true; index += 1; continue; }
    if (char === "\"" || char === "'" || char === "`") { quote = char; continue; }
    if (char === "{") depth += 1;
    if (char === "}" && --depth === 0) return PANEL_SOURCE.slice(start, index + 1).trim();
  }
  throw new Error(name + " dengeli gövde olmadan kaldı");
}

function load(names, extra) {
  const context = Object.assign({
    Date, Math, String, Number, Boolean, Object, Array, JSON, RegExp,
    isNaN, isFinite,
    PANEL_LAST_DIAG: { status: null, kind: null, attempts: 0, at: null, resetAt: null, retryAfterMs: null, stage: null, errName: null },
    PANEL_STAGE: 'idle',
    PANEL_FIRST_PAINT: true, PANEL_DEFER_SINCE: null, PANEL_DEFER_MAX_MS: 60000,
    UI: { msgSending: false, msgDraft: "", eventFilter: "all", motivationFilter: "all", selectedDate: null, expandedCards: {}, d4SelectedModule: null },
    D4_DRAWER_RETURN_ID: null,
    document: { activeElement: null },
    panelBusyTyping: () => false,
    today: () => "2026-08-20",
    PANEL_POLL_STATE: { pendingRender: false },
    pollRecordP: () => {}, updatePollRibbonP: () => {}, render: () => {},
    LAST_RENDERED_POLL_OUTCOME: "idle", LASTSIG: null
  }, extra || {});
  vm.runInNewContext(names.map(extractTopLevelFunction).join("\n"), context, {
    filename: "rem-65-panel-performance.js"
  });
  return context;
}

function freshPollContext() {
  const records = [];
  let renders = 0;
  let ribbonUpdates = 0;
  const ctx = load(["panelDraftActiveP", "panelInteractionActiveP", "panelShouldDeferRenderP", "panelNoteStageP", "panelSafeRenderP", "applyPollRenderP"], {
    pollRecordP: (outcome) => records.push(outcome),
    updatePollRibbonP: () => { ribbonUpdates += 1; },
    render: () => { renders += 1; }
  });
  return { ctx, records, get renders() { return renders; }, get ribbonUpdates() { return ribbonUpdates; } };
}

const cases = [
  ["draft and active interaction gates are fetch/render-safe", () => {
    const { ctx } = freshPollContext();
    ctx.UI.msgDraft = "Uzun ama henüz gönderilmemiş taslak";
    assertEqual(ctx.panelDraftActiveP(), true);
    assertEqual(ctx.panelInteractionActiveP(), true);
    ctx.UI.msgDraft = "";
    ctx.UI.d4SelectedModule = "therapy-profile";
    assertEqual(ctx.panelInteractionActiveP(), true);
    ctx.UI.d4SelectedModule = null;
    ctx.UI.eventFilter = "reminder";
    assertEqual(ctx.panelInteractionActiveP(), true);
    ctx.UI.eventFilter = "all";
    ctx.UI.motivationFilter = "active";
    assertEqual(ctx.panelInteractionActiveP(), true);
    ctx.UI.motivationFilter = "all";
    ctx.UI.selectedDate = "2026-08-19";
    assertEqual(ctx.panelInteractionActiveP(), true);
    ctx.UI.selectedDate = null;
    ctx.UI.expandedCards = { insights: true };
    assertEqual(ctx.panelInteractionActiveP(), true);
  }],
  ["unchanged polling updates only the ribbon and never performs a full render", () => {
    const out = freshPollContext();
    const rendered = out.ctx.applyPollRenderP("same-signature", false, "unchanged", 0, {});
    assertEqual(rendered, false);
    assertEqual(out.renders, 0);
    assertEqual(out.ribbonUpdates, 1);
    assertEqual(out.records[0], "unchanged");
    assertEqual(out.ctx.PANEL_POLL_STATE.pendingRender, false);
  }],
  ["changed polling renders once and records the visible signature", () => {
    const out = freshPollContext();
    const rendered = out.ctx.applyPollRenderP("changed-signature", true, "changed", 0, {});
    assertEqual(rendered, true);
    assertEqual(out.renders, 1);
    assertEqual(out.ctx.LASTSIG, "changed-signature");
    assertEqual(out.ctx.LAST_RENDERED_POLL_OUTCOME, "changed");
  }],
  ["drawer/filter interaction defers changed data, then applies one queued render safely", () => {
    const out = freshPollContext();
    out.ctx.UI.eventFilter = "reminder";
    assertEqual(out.ctx.applyPollRenderP("queued", true, "changed", 0, {}), false);
    assertEqual(out.renders, 0);
    assertEqual(out.ctx.PANEL_POLL_STATE.pendingRender, true);
    assertEqual(out.records[0], "deferred_draft");
    out.ctx.UI.eventFilter = "all";
    assertEqual(out.ctx.applyPollRenderP("queued", false, "not_modified", 0, {}), true);
    assertEqual(out.renders, 1);
    assertEqual(out.ctx.PANEL_POLL_STATE.pendingRender, false);
    assertEqual(out.ctx.LASTSIG, "queued");
  }],
  ["draft defer preserves the pending render boundary without mutating source state", () => {
    const out = freshPollContext();
    const before = JSON.stringify(out.ctx.UI);
    out.ctx.UI.msgSending = true;
    assertEqual(out.ctx.applyPollRenderP("drafted", true, "changed", 0, {}), false);
    assertEqual(out.renders, 0);
    assertEqual(out.ctx.PANEL_POLL_STATE.pendingRender, true);
    assertEqual(JSON.stringify(out.ctx.UI), JSON.stringify(Object.assign(JSON.parse(before), { msgSending: true })));
    out.ctx.UI.msgSending = false;
  }],
  ["304 and polling defer branches are explicit and avoid an unconditional render", () => {
    assert(PANEL_SOURCE.includes("if(j&&j.notModified)"));
    // 304 taslak kapısı da ilk boyamadan önce devre dışıdır: boot'ta ertelenecek
    // bir görünüm yoktur ve erteleme panelin hiç açılmamasına yol açardı.
    assert(PANEL_SOURCE.includes("if(PANEL_FIRST_PAINT&&panelDraftActiveP()){ markPollSkippedP('deferred_draft'); PANEL_POLL_STATE.pendingRender=true; return D; }"));
    // KÖK SEBEP regresyonu: erteleme kararı tek kapıdan (panelShouldDeferRenderP)
    // geçer ve İLK boyamadan önce asla ertelemez. Doğrudan
    // panelInteractionActiveP() çağrısı bu dalda artık kullanılmaz.
    assert(PANEL_SOURCE.includes("if(hadPending){ if(panelShouldDeferRenderP())"));
    assert(PANEL_SOURCE.includes("if(!PANEL_FIRST_PAINT){ PANEL_DEFER_SINCE=null; return false; }"));
    assert(PANEL_SOURCE.includes("else { LAST_RENDERED_POLL_OUTCOME='not_modified'; updatePollRibbonP(); }"));
    // Poll turundaki her render KORUMALI çağrılır: render içindeki bir istisna
    // artık zincirin ağ hatası dalına düşüp "Bağlantı bekleniyor" göstermez.
    assert(PANEL_SOURCE.includes("if(shouldRender){ LASTSIG=sig; panelNoteStageP('render',null); panelSafeRenderP(); } else updatePollRibbonP();"));
    assert(!/\brender\(\);\s*\}\s*else updatePollRibbonP/.test(PANEL_SOURCE));
  }],
  ["panel signature is data-bound, UI interaction changes do not cause false polling changes", () => {
    const ctx = load(["panelSig"], {
      D: { status: "accepted", value: 1 },
      PANEL_LOCATION_CONTEXT: { fix: null, history: [], tracks: {} },
      SYNC_RECEIPT: { status: "accepted" },
      PROJECTION: { snapshot: { snapshotRevision: "rev-1" } },
      OBSINBOX: [], OBSSHA: null, OBSRECEIPTS: {},
      QDELIVERY: {}, QRESPONSES: {}, QTRANSPORT: {},
      EVENT_LOG_STATE: { events: [] }, UI: { eventFilter: "all" }
    });
    const first = ctx.panelSig();
    ctx.UI.eventFilter = "reminder";
    assertEqual(ctx.panelSig(), first);
    ctx.D.status = "stale";
    assert(ctx.panelSig() !== first);
  }],
  ["repeated unchanged signatures stay bounded under a deterministic fixture budget", () => {
    const ctx = load(["panelSig"], {
      D: { days: {}, syncReceipt: { snapshotRevision: "r" } },
      PANEL_LOCATION_CONTEXT: { fix: null, history: [], tracks: {} },
      SYNC_RECEIPT: { status: "accepted" },
      PROJECTION: { snapshot: { snapshotRevision: "r" } },
      OBSINBOX: [], OBSRECEIPTS: {}, QDELIVERY: {}, QRESPONSES: {}, QTRANSPORT: {},
      EVENT_LOG_STATE: { events: [] }
    });
    const start = process.hrtime.bigint();
    let signature = null;
    for (let index = 0; index < 10000; index += 1) signature = ctx.panelSig();
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
    assert(typeof signature === "string" && signature.length > 0);
    assert(elapsedMs < 1000);
    console.log("REM-65 panelSig: " + elapsedMs.toFixed(2) + "ms/10000 signatures");
  }]
];

runTests(cases).catch(() => { process.exitCode = 1; });
