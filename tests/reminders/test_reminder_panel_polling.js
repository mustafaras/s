"use strict";

// REM-58 — G13-A panel transport, ETag / 304 ve draft safety sözleşmesi.
//
// Panelin conditional polling (200 / 304 / ETag değişti / boş / bozuk /
// network hatası / rate limit), kullanıcı etkileşimi sırasında render
// erteleme (draft, textarea focus, drawer, filtre, seçili tarih, açık kart),
// deferred snapshot'ın tek kontrollü uygulanması, değişmeyen reminder
// status'unda tam render yapmama ve hiçbir reminder preference / localStorage
// / app state write yapmama sözleşmesini deterministik ve read-only olarak
// sabitler. Panel bir gözlemcidir: bu fixture hiçbir yazma yolu, gerçek
// GitHub çağrısı, browser veya kullanıcı verisi kullanmaz.
//
// Kapsam sınırı: current observer panel (`panel.js`). Panel-v2 ayrı bir
// regression yüzeyidir ve buraya dahil değildir.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepClone, deepEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const PANEL_SOURCE = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");

// panel.js tek büyük IIFE; p0/p1/REM-55 fixture'larının yaptığı gibi yalnız
// ilgili top-level fonksiyonları çıkarıp izole bir context'te çalıştırıyoruz.
function extractTopLevelFunction(name) {
  const start = PANEL_SOURCE.indexOf("function " + name + "(");
  if (start < 0) throw new Error(name + " panel.js içinde bulunamadı");
  const end = PANEL_SOURCE.indexOf("\nfunction ", start + 10);
  return PANEL_SOURCE.slice(start, end < 0 ? PANEL_SOURCE.length : end).trim();
}

function loadPanelHelpers(names, extra) {
  const code = names.map(extractTopLevelFunction).join("\n");
  const context = Object.assign({
    Date, Math, String, Number, Boolean, Object, Array, JSON, isNaN, isFinite, RegExp,
    PANEL_LAST_DIAG: { status: null, kind: null, attempts: 0, at: null, resetAt: null, retryAfterMs: null, stage: null, errName: null },
    PANEL_STAGE: 'idle',
    PANEL_FIRST_PAINT: true, PANEL_DEFER_SINCE: null, PANEL_DEFER_MAX_MS: 60000,
    TextEncoder, TextDecoder, atob, btoa,
    Promise, Error, setTimeout, clearTimeout, AbortController, encodeURIComponent,
    PANEL_FETCH_TIMEOUT_MS: 30000, PANEL_TRANSPORT_TIMEOUT_MS: 30000,
    PANEL_FETCH_ATTEMPTS: 3, PANEL_RETRY_DELAY_MS: 5, PANEL_TIMEOUT_GROWTH: 1.5,
    esc: (value) => String(value == null ? "" : value)
  }, extra || {});
  vm.runInNewContext(code, context, { filename: "panel-rem58-helpers.js" });
  return context;
}

function makeResponse(status, etag, body, headers) {
  const h = Object.assign({}, headers || {});
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: {
      get(name) {
        const key = String(name).toLowerCase();
        if (key === "etag") return etag || null;
        return h[key] || null;
      }
    },
    json() {
      return Promise.resolve(body);
    },
    text() {
      return Promise.resolve(typeof body === "string" ? body : JSON.stringify(body));
    }
  };
}

// UTF-8 güvenli base64: btoa yalnız Latin-1 destekler, Türkçe karakterlerde
// patlar. panel.js'in b64dec'i TextDecoder ile UTF-8 çözer; bu yüzden test
// gövdesi de UTF-8 base64 ile üretilmelidir.
function utf8B64(str) {
  return Buffer.from(String(str), "utf8").toString("base64");
}

function makeLatest(overrides) {
  return Object.assign({
    version: 2,
    startDate: "2026-08-17",
    lastOpenedDate: "2026-08-18",
    savedAt: "2026-08-18T14:58:00.000Z",
    settings: { nickname: "Günışığı" },
    days: { "2026-08-18": { savedAt: "2026-08-18T14:58:00.000Z", note: "güvenli not" } },
    syncReceipt: { snapshotRevision: "c".repeat(40), sourceUpdatedAt: "2026-08-18T14:58:00.000Z" }
  }, overrides || {});
}

const cases = [
  // ── 1. Transport yanıt sınıfları ayrı ve deterministik ─────────────
  ["200 returns the body and caches the ETag", () => {
    const ctx = loadPanelHelpers(["responseHeaderP", "pollConditionalDecisionP", "ghTransportApiP", "b64dec", "panelFetchP", "panelRetryableErrorP", "panelAttemptP", "panelAttemptTimeoutP", "loadTransportFileP"], {
      REPO: "owner/repo", BRANCH: "main", PTOKEN: "test-token",
      PANEL_TRANSPORT_CACHE: {}, ghJsonHeaders: () => ({})
    });
    const latest = makeLatest();
    let calls = 0;
    ctx.fetch = () => {
      calls += 1;
      return Promise.resolve(makeResponse(200, '"v1"', { content: utf8B64(JSON.stringify(latest)), sha: "sha1" }));
    };
    return ctx.loadTransportFileP("data/observer-snapshot.json").then((x) => {
      assertEqual(calls, 1);
      assert(x && x.raw && x.sha === "sha1" && x.etag === '"v1"');
      assert(!x.notModified);
      assertEqual(ctx.PANEL_TRANSPORT_CACHE["data/observer-snapshot.json"].etag, '"v1"');
    });
  }],
  ["304 with a warm cache returns notModified and does not re-parse the body", () => {
    const ctx = loadPanelHelpers(["responseHeaderP", "pollConditionalDecisionP", "ghTransportApiP", "b64dec", "panelFetchP", "panelRetryableErrorP", "panelAttemptP", "panelAttemptTimeoutP", "loadTransportFileP"], {
      REPO: "owner/repo", BRANCH: "main", PTOKEN: "test-token",
      PANEL_TRANSPORT_CACHE: { "data/observer-snapshot.json": { etag: '"v1"', raw: "cached-raw", sha: "sha1" } },
      ghJsonHeaders: () => ({})
    });
    let jsonCalls = 0;
    ctx.fetch = () => Promise.resolve(makeResponse(304, '"v1"', null));
    return ctx.loadTransportFileP("data/observer-snapshot.json").then((x) => {
      assert(x && x.notModified === true);
      assertEqual(x.raw, "cached-raw");
      assertEqual(x.sha, "sha1");
      assertEqual(jsonCalls, 0);
    });
  }],
  ["304 with a cold cache (etag known, body missing) fails closed instead of serving a phantom body", () => {
    // Gerçek "304 cache miss" yolu: cache'te etag var (If-None-Match gönderildi),
    // sunucu 304 döndü ama cache.raw yok. Panel bu durumda hayalet gövde
    // üretemez; fail-closed olarak reddeder.
    const ctx = loadPanelHelpers(["responseHeaderP", "pollConditionalDecisionP", "ghTransportApiP", "b64dec", "panelFetchP", "panelRetryableErrorP", "panelAttemptP", "panelAttemptTimeoutP", "loadTransportFileP"], {
      REPO: "owner/repo", BRANCH: "main", PTOKEN: "test-token",
      PANEL_TRANSPORT_CACHE: { "data/observer-snapshot.json": { etag: '"v1"', raw: null, sha: null } },
      ghJsonHeaders: () => ({})
    });
    ctx.fetch = () => Promise.resolve(makeResponse(304, '"v1"', null));
    return ctx.loadTransportFileP("data/observer-snapshot.json").then(
      () => { throw new Error("304 cache miss should reject"); },
      (e) => assert(/304 cache miss/.test(String(e.message)))
    );
  }],
  ["ETag changed returns a fresh body and updates the cache", () => {
    const ctx = loadPanelHelpers(["responseHeaderP", "pollConditionalDecisionP", "ghTransportApiP", "b64dec", "panelFetchP", "panelRetryableErrorP", "panelAttemptP", "panelAttemptTimeoutP", "loadTransportFileP"], {
      REPO: "owner/repo", BRANCH: "main", PTOKEN: "test-token",
      PANEL_TRANSPORT_CACHE: { "data/observer-snapshot.json": { etag: '"v1"', raw: "old", sha: "oldsha" } },
      ghJsonHeaders: () => ({})
    });
    const latest = makeLatest();
    ctx.fetch = () => Promise.resolve(makeResponse(200, '"v2"', { content: utf8B64(JSON.stringify(latest)), sha: "sha2" }));
    return ctx.loadTransportFileP("data/observer-snapshot.json").then((x) => {
      assert(x && x.raw && x.sha === "sha2" && x.etag === '"v2"');
      assert(!x.notModified);
      assertEqual(ctx.PANEL_TRANSPORT_CACHE["data/observer-snapshot.json"].etag, '"v2"');
    });
  }],
  ["empty body is served as null raw and never treated as a valid snapshot", () => {
    const ctx = loadPanelHelpers(["responseHeaderP", "pollConditionalDecisionP", "ghTransportApiP", "b64dec", "panelFetchP", "panelRetryableErrorP", "panelAttemptP", "panelAttemptTimeoutP", "loadTransportFileP"], {
      REPO: "owner/repo", BRANCH: "main", PTOKEN: "test-token",
      PANEL_TRANSPORT_CACHE: {}, ghJsonHeaders: () => ({})
    });
    // Boş content + sha yok: Blobs fallback tetiklenmez, raw null döner.
    ctx.fetch = () => Promise.resolve(makeResponse(200, '"v1"', { content: "", sha: null }));
    return ctx.loadTransportFileP("data/observer-snapshot.json").then((x) => {
      assert(x && x.raw === null && x.sha === null);
    });
  }],
  ["malformed body is surfaced as a parse failure, not a silent success", () => {
    // loadTransportFileP yalnız ham string döndürür; JSON parse tüketicide
    // (loadSyncReceiptP) olur. Bozuk gövde orada fail-closed: null döner,
    // hayalet receipt üretilmez.
    const ctx = loadPanelHelpers(["responseHeaderP", "pollConditionalDecisionP", "ghTransportApiP", "b64dec", "panelFetchP", "panelRetryableErrorP", "panelAttemptP", "panelAttemptTimeoutP", "loadTransportFileP", "loadSyncReceiptP", "normalizeSyncReceiptP"], {
      REPO: "owner/repo", BRANCH: "main", PTOKEN: "test-token",
      PANEL_TRANSPORT_CACHE: {}, ghJsonHeaders: () => ({}), SYNC_RECEIPT_PATH: "data/sync-receipt.json"
    });
    ctx.fetch = () => Promise.resolve(makeResponse(200, '"v1"', { content: utf8B64("{ bozuk json"), sha: "sha-bad" }));
    return ctx.loadSyncReceiptP().then((receipt) => {
      assert(receipt === null);
    });
  }],
  ["network failure rejects and leaves the previous cache intact", () => {
    const ctx = loadPanelHelpers(["responseHeaderP", "pollConditionalDecisionP", "ghTransportApiP", "b64dec", "panelFetchP", "panelRetryableErrorP", "panelAttemptP", "panelAttemptTimeoutP", "loadTransportFileP"], {
      REPO: "owner/repo", BRANCH: "main", PTOKEN: "test-token",
      PANEL_TRANSPORT_CACHE: { "data/observer-snapshot.json": { etag: '"v1"', raw: "old", sha: "oldsha" } },
      ghJsonHeaders: () => ({})
    });
    ctx.fetch = () => Promise.reject(new Error("network down"));
    return ctx.loadTransportFileP("data/observer-snapshot.json").then(
      () => { throw new Error("network failure should reject"); },
      (e) => {
        assert(/network down/.test(String(e.message)));
        assertEqual(ctx.PANEL_TRANSPORT_CACHE["data/observer-snapshot.json"].raw, "old");
      }
    );
  }],
  ["rate limit (429) is classified distinctly from a generic transport error", () => {
    const ctx = loadPanelHelpers(["responseHeaderP", "pollConditionalDecisionP", "ghTransportApiP", "b64dec", "panelFetchP", "panelRetryableErrorP", "panelAttemptP", "panelAttemptTimeoutP", "loadTransportFileP"], {
      REPO: "owner/repo", BRANCH: "main", PTOKEN: "test-token",
      PANEL_TRANSPORT_CACHE: {}, ghJsonHeaders: () => ({})
    });
    ctx.fetch = () => Promise.resolve(makeResponse(429, null, null));
    return ctx.loadTransportFileP("data/observer-snapshot.json").then(
      () => { throw new Error("429 should reject"); },
      (e) => {
        assert(e && e.rateLimited === true);
        assert(/rate_limited/.test(String(e.message)));
      }
    );
  }],
  ["a generic 5xx is not mislabeled as rate limit", () => {
    const ctx = loadPanelHelpers(["responseHeaderP", "pollConditionalDecisionP", "ghTransportApiP", "b64dec", "panelFetchP", "panelRetryableErrorP", "panelAttemptP", "panelAttemptTimeoutP", "loadTransportFileP"], {
      REPO: "owner/repo", BRANCH: "main", PTOKEN: "test-token",
      PANEL_TRANSPORT_CACHE: {}, ghJsonHeaders: () => ({})
    });
    ctx.fetch = () => Promise.resolve(makeResponse(500, null, null));
    return ctx.loadTransportFileP("data/observer-snapshot.json").then(
      () => { throw new Error("500 should reject"); },
      (e) => {
        assert(!e.rateLimited);
        assert(/transport 500/.test(String(e.message)));
      }
    );
  }],

  // ── 2. Kullanıcı etkileşimi sırasında render erteleme ──────────────
  ["a message draft defers the poll render", () => {
    const ctx = loadPanelHelpers(["panelDraftActiveP", "panelInteractionActiveP", "panelShouldDeferRenderP", "panelNoteStageP", "panelSafeRenderP", "applyPollRenderP"], {
      UI: { msgSending: false, msgDraft: "taslak korunmalı", selectedDate: null, eventFilter: "all", motivationFilter: "all", expandedCards: {} },
      D4_DRAWER_RETURN_ID: null, panelBusyTyping: () => false, today: () => "2026-08-18",
      PANEL_POLL_STATE: { pendingRender: false }, pollRecordP: () => {},
      updatePollRibbonP: () => {}, render: () => {}, LASTSIG: "sig", LAST_RENDERED_POLL_OUTCOME: "changed", Date
    });
    assert(ctx.panelDraftActiveP() === true);
    assert(ctx.panelInteractionActiveP() === true);
    const rendered = ctx.applyPollRenderP("new-sig", true, "changed", Date.now() - 10, {});
    assert(rendered === false);
    assert(ctx.PANEL_POLL_STATE.pendingRender === true);
  }],
  ["a focused textarea defers the poll render", () => {
    const ctx = loadPanelHelpers(["panelDraftActiveP", "panelInteractionActiveP", "panelShouldDeferRenderP", "panelNoteStageP", "panelSafeRenderP", "applyPollRenderP"], {
      UI: { msgSending: false, msgDraft: "", selectedDate: null, eventFilter: "all", motivationFilter: "all", expandedCards: {} },
      D4_DRAWER_RETURN_ID: null, panelBusyTyping: () => true, today: () => "2026-08-18",
      PANEL_POLL_STATE: { pendingRender: false }, pollRecordP: () => {},
      updatePollRibbonP: () => {}, render: () => {}, LASTSIG: "sig", LAST_RENDERED_POLL_OUTCOME: "changed", Date
    });
    assert(ctx.panelDraftActiveP() === true);
    assert(ctx.panelInteractionActiveP() === true);
    const rendered = ctx.applyPollRenderP("new-sig", true, "changed", Date.now() - 10, {});
    assert(rendered === false);
    assert(ctx.PANEL_POLL_STATE.pendingRender === true);
  }],
  ["an open drawer defers the poll render even without a text draft", () => {
    const ctx = loadPanelHelpers(["panelDraftActiveP", "panelInteractionActiveP", "panelShouldDeferRenderP", "panelNoteStageP", "panelSafeRenderP", "applyPollRenderP"], {
      UI: { msgSending: false, msgDraft: "", selectedDate: null, eventFilter: "all", motivationFilter: "all", expandedCards: {} },
      D4_DRAWER_RETURN_ID: "module-x", panelBusyTyping: () => false, today: () => "2026-08-18",
      PANEL_POLL_STATE: { pendingRender: false }, pollRecordP: () => {},
      updatePollRibbonP: () => {}, render: () => {}, LASTSIG: "sig", LAST_RENDERED_POLL_OUTCOME: "changed", Date
    });
    assert(ctx.panelDraftActiveP() === false);
    assert(ctx.panelInteractionActiveP() === true);
    const rendered = ctx.applyPollRenderP("new-sig", true, "changed", Date.now() - 10, {});
    assert(rendered === false);
    assert(ctx.PANEL_POLL_STATE.pendingRender === true);
  }],
  ["an active filter defers the poll render", () => {
    const ctx = loadPanelHelpers(["panelDraftActiveP", "panelInteractionActiveP", "panelShouldDeferRenderP", "panelNoteStageP", "panelSafeRenderP", "applyPollRenderP"], {
      UI: { msgSending: false, msgDraft: "", selectedDate: null, eventFilter: "reminder", motivationFilter: "all", expandedCards: {} },
      D4_DRAWER_RETURN_ID: null, panelBusyTyping: () => false, today: () => "2026-08-18",
      PANEL_POLL_STATE: { pendingRender: false }, pollRecordP: () => {},
      updatePollRibbonP: () => {}, render: () => {}, LASTSIG: "sig", LAST_RENDERED_POLL_OUTCOME: "changed", Date
    });
    assert(ctx.panelDraftActiveP() === false);
    assert(ctx.panelInteractionActiveP() === true);
    const rendered = ctx.applyPollRenderP("new-sig", true, "changed", Date.now() - 10, {});
    assert(rendered === false);
    assert(ctx.PANEL_POLL_STATE.pendingRender === true);
  }],
  ["a non-today selected date defers the poll render", () => {
    const ctx = loadPanelHelpers(["panelDraftActiveP", "panelInteractionActiveP", "panelShouldDeferRenderP", "panelNoteStageP", "panelSafeRenderP", "applyPollRenderP"], {
      UI: { msgSending: false, msgDraft: "", selectedDate: "2026-08-10", eventFilter: "all", motivationFilter: "all", expandedCards: {} },
      D4_DRAWER_RETURN_ID: null, panelBusyTyping: () => false, today: () => "2026-08-18",
      PANEL_POLL_STATE: { pendingRender: false }, pollRecordP: () => {},
      updatePollRibbonP: () => {}, render: () => {}, LASTSIG: "sig", LAST_RENDERED_POLL_OUTCOME: "changed", Date
    });
    assert(ctx.panelDraftActiveP() === false);
    assert(ctx.panelInteractionActiveP() === true);
    const rendered = ctx.applyPollRenderP("new-sig", true, "changed", Date.now() - 10, {});
    assert(rendered === false);
    assert(ctx.PANEL_POLL_STATE.pendingRender === true);
  }],
  ["an expanded card defers the poll render", () => {
    const ctx = loadPanelHelpers(["panelDraftActiveP", "panelInteractionActiveP", "panelShouldDeferRenderP", "panelNoteStageP", "panelSafeRenderP", "applyPollRenderP"], {
      UI: { msgSending: false, msgDraft: "", selectedDate: null, eventFilter: "all", motivationFilter: "all", expandedCards: { "d2-mood": true } },
      D4_DRAWER_RETURN_ID: null, panelBusyTyping: () => false, today: () => "2026-08-18",
      PANEL_POLL_STATE: { pendingRender: false }, pollRecordP: () => {},
      updatePollRibbonP: () => {}, render: () => {}, LASTSIG: "sig", LAST_RENDERED_POLL_OUTCOME: "changed", Date
    });
    assert(ctx.panelDraftActiveP() === false);
    assert(ctx.panelInteractionActiveP() === true);
    const rendered = ctx.applyPollRenderP("new-sig", true, "changed", Date.now() - 10, {});
    assert(rendered === false);
    assert(ctx.PANEL_POLL_STATE.pendingRender === true);
  }],
  ["a clean idle panel renders immediately (no deferral)", () => {
    const ctx = loadPanelHelpers(["panelDraftActiveP", "panelInteractionActiveP", "panelShouldDeferRenderP", "panelNoteStageP", "panelSafeRenderP", "applyPollRenderP"], {
      UI: { msgSending: false, msgDraft: "", selectedDate: null, eventFilter: "all", motivationFilter: "all", expandedCards: {} },
      D4_DRAWER_RETURN_ID: null, panelBusyTyping: () => false, today: () => "2026-08-18",
      PANEL_POLL_STATE: { pendingRender: false }, pollRecordP: () => {},
      updatePollRibbonP: () => {}, render: () => {}, LASTSIG: "sig", LAST_RENDERED_POLL_OUTCOME: "changed", Date
    });
    assert(ctx.panelDraftActiveP() === false);
    assert(ctx.panelInteractionActiveP() === false);
    const rendered = ctx.applyPollRenderP("new-sig", true, "changed", Date.now() - 10, {});
    assert(rendered === true);
    assert(ctx.PANEL_POLL_STATE.pendingRender === false);
  }],

  // ── 3. Deferred snapshot tek kontrollü uygulanır ──────────────────
  ["a deferred render is applied exactly once when the interaction clears", () => {
    const ctx = loadPanelHelpers(["panelDraftActiveP", "panelInteractionActiveP", "panelShouldDeferRenderP", "panelNoteStageP", "panelSafeRenderP", "applyPollRenderP"], {
      UI: { msgSending: false, msgDraft: "", selectedDate: null, eventFilter: "all", motivationFilter: "all", expandedCards: {} },
      D4_DRAWER_RETURN_ID: null, panelBusyTyping: () => false, today: () => "2026-08-18",
      PANEL_POLL_STATE: { pendingRender: true }, pollRecordP: () => {},
      updatePollRibbonP: () => {}, render: () => {}, LASTSIG: "old-sig", LAST_RENDERED_POLL_OUTCOME: "changed", Date
    });
    // İlk tur: etkileşim varken defer.
    ctx.UI.msgDraft = "yazılıyor";
    assert(ctx.applyPollRenderP("new-sig", true, "changed", Date.now() - 10, {}) === false);
    assert(ctx.PANEL_POLL_STATE.pendingRender === true);
    // İkinci tur: etkileşim temizlendi, pending render tek sefer uygulanır.
    ctx.UI.msgDraft = "";
    let renderCount = 0;
    ctx.render = () => { renderCount += 1; };
    const rendered = ctx.applyPollRenderP("new-sig", false, "unchanged", Date.now() - 10, {});
    assert(rendered === true);
    assertEqual(renderCount, 1);
    assert(ctx.PANEL_POLL_STATE.pendingRender === false);
  }],
  ["a deferred render is not applied while the interaction persists", () => {
    const ctx = loadPanelHelpers(["panelDraftActiveP", "panelInteractionActiveP", "panelShouldDeferRenderP", "panelNoteStageP", "panelSafeRenderP", "applyPollRenderP"], {
      UI: { msgSending: false, msgDraft: "", selectedDate: null, eventFilter: "all", motivationFilter: "all", expandedCards: {} },
      D4_DRAWER_RETURN_ID: "module-y", panelBusyTyping: () => false, today: () => "2026-08-18",
      PANEL_POLL_STATE: { pendingRender: true }, pollRecordP: () => {},
      updatePollRibbonP: () => {}, render: () => {}, LASTSIG: "old-sig", LAST_RENDERED_POLL_OUTCOME: "changed", Date
    });
    let renderCount = 0;
    ctx.render = () => { renderCount += 1; };
    const rendered = ctx.applyPollRenderP("new-sig", false, "unchanged", Date.now() - 10, {});
    assert(rendered === false);
    assertEqual(renderCount, 0);
    assert(ctx.PANEL_POLL_STATE.pendingRender === true);
  }],

  // ── 4. Değişmeyen reminder status'unda tam render yapılmaz ─────────
  ["an unchanged snapshot does not trigger a full panel render", () => {
    const ctx = loadPanelHelpers(["panelDraftActiveP", "panelInteractionActiveP", "panelShouldDeferRenderP", "panelNoteStageP", "panelSafeRenderP", "applyPollRenderP"], {
      UI: { msgSending: false, msgDraft: "", selectedDate: null, eventFilter: "all", motivationFilter: "all", expandedCards: {} },
      D4_DRAWER_RETURN_ID: null, panelBusyTyping: () => false, today: () => "2026-08-18",
      PANEL_POLL_STATE: { pendingRender: false }, pollRecordP: () => {},
      updatePollRibbonP: () => {}, render: () => {}, LASTSIG: "same-sig", LAST_RENDERED_POLL_OUTCOME: "changed", Date
    });
    let renderCount = 0, ribbonCount = 0;
    ctx.render = () => { renderCount += 1; };
    ctx.updatePollRibbonP = () => { ribbonCount += 1; };
    const rendered = ctx.applyPollRenderP("same-sig", false, "unchanged", Date.now() - 10, {});
    assert(rendered === false);
    assertEqual(renderCount, 0);
    assertEqual(ribbonCount, 1);
  }],
  ["a changed snapshot renders and updates the visible status", () => {
    const ctx = loadPanelHelpers(["panelDraftActiveP", "panelInteractionActiveP", "panelShouldDeferRenderP", "panelNoteStageP", "panelSafeRenderP", "applyPollRenderP"], {
      UI: { msgSending: false, msgDraft: "", selectedDate: null, eventFilter: "all", motivationFilter: "all", expandedCards: {} },
      D4_DRAWER_RETURN_ID: null, panelBusyTyping: () => false, today: () => "2026-08-18",
      PANEL_POLL_STATE: { pendingRender: false }, pollRecordP: () => {},
      updatePollRibbonP: () => {}, render: () => {}, LASTSIG: "old-sig", LAST_RENDERED_POLL_OUTCOME: "changed", Date
    });
    let renderCount = 0;
    ctx.render = () => { renderCount += 1; };
    const rendered = ctx.applyPollRenderP("new-sig", true, "changed", Date.now() - 10, {});
    assert(rendered === true);
    assertEqual(renderCount, 1);
    assertEqual(ctx.LASTSIG, "new-sig");
    assertEqual(ctx.LAST_RENDERED_POLL_OUTCOME, "changed");
  }],
  ["the new-changes ribbon is driven by the event delta, not a blind render", () => {
    // panel.js load() içinde: hadPreviousSnapshot && changed ise
    // UI.newChanges = min(99, max(1, newEventCount)). Bu, değişmeyen
    // snapshot'ta ribbon'ı artırmaz; yalnız gerçek yeni event sayısını yansıtır.
    const ctx = loadPanelHelpers(["panelDraftActiveP", "panelInteractionActiveP", "panelShouldDeferRenderP", "panelNoteStageP", "panelSafeRenderP", "applyPollRenderP"], {
      UI: { msgSending: false, msgDraft: "", selectedDate: null, eventFilter: "all", motivationFilter: "all", expandedCards: {} },
      D4_DRAWER_RETURN_ID: null, panelBusyTyping: () => false, today: () => "2026-08-18",
      PANEL_POLL_STATE: { pendingRender: false }, pollRecordP: () => {},
      updatePollRibbonP: () => {}, render: () => {}, LASTSIG: "same-sig", LAST_RENDERED_POLL_OUTCOME: "changed", Date
    });
    // Değişmeyen snapshot: render yok, ribbon güncellenmez.
    let renderCount = 0;
    ctx.render = () => { renderCount += 1; };
    ctx.applyPollRenderP("same-sig", false, "unchanged", Date.now() - 10, {});
    assertEqual(renderCount, 0);
    // Değişen snapshot: render olur ve yeni değişiklik sayacı görünür.
    ctx.LASTSIG = "old-sig";
    ctx.applyPollRenderP("new-sig", true, "changed", Date.now() - 10, {});
    assertEqual(renderCount, 1);
  }],

  // ── 5. Read-only: polling hiçbir şey yazmaz ───────────────────────
  ["panel polling owns no write path to reminder preference, localStorage or app state", () => {
    // Panel gözlemcidir: polling / transport sınırı hiçbir reminder tercihini,
    // localStorage'ı veya app state'i yazamaz.
    const pollingBoundary = [
      "panelFetchP", "panelRetryableErrorP", "panelAttemptP", "panelAttemptTimeoutP", "loadTransportFileP", "fetchLatest", "pollConditionalDecisionP",
      "panelDraftActiveP", "panelInteractionActiveP", "panelShouldDeferRenderP", "panelNoteStageP", "panelSafeRenderP", "applyPollRenderP"
    ].map(extractTopLevelFunction).join("\n");
    ["method:\"PUT\"", "method: 'PUT'", "localStorage.setItem", "localStorage.removeItem"]
      .forEach((needle) => assert(!pollingBoundary.includes(needle)));
    ["setReminderEnabled", "setReminderCategoryEnabled", "setReminderProfile",
     "reminderSyncPayload", "snoozeReminderDelivery", "muteReminderToday"]
      .forEach((needle) => assert(!pollingBoundary.includes(needle)));
    // applyPollRenderP yalnızca render / ribbon / pendingRender durumunu değiştirir;
    // veri nesnesine (D) veya reminder tercihine dokunmaz.
    const apply = extractTopLevelFunction("panelShouldDeferRenderP", "panelNoteStageP", "panelSafeRenderP", "applyPollRenderP");
    assert(!/D\.[a-zA-Z]/.test(apply));
    assert(!/reminders/.test(apply));
  }],
  ["the transport boundary never writes to the data repo", () => {
    const transport = extractTopLevelFunction("panelFetchP", "panelRetryableErrorP", "panelAttemptP", "panelAttemptTimeoutP", "loadTransportFileP");
    assert(!/method:\s*["']PUT/.test(transport));
    assert(!/method:\s*["']POST/.test(transport));
    assert(!/method:\s*["']PATCH/.test(transport));
    assert(!/method:\s*["']DELETE/.test(transport));
    // Yalnızca GET (Contents + Blobs) kullanılır; istekler zaman aşımı
    // sarmalayıcısından geçer, sarmalayıcı da yalnız GET yapar.
    assert(/panelFetchP\(/.test(transport));
    const wrapper = extractTopLevelFunction("panelFetchP");
    assert(/fetch\(/.test(wrapper));
    ["method:", "PUT", "POST", "PATCH", "DELETE", "body:"].forEach((needle) => assert(!wrapper.includes(needle)));
  }]
];

runTests(cases).catch(() => { process.exitCode = 1; });
