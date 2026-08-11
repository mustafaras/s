// PROMPT-35 — Polling lifecycle and telemetry regression fixture.
// No browser, network, token disclosure or user data is used.
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

async function settle(flushPromises) {
  await flushPromises();
  await flushPromises();
}

function headers(values) {
  return {
    get: function(name) {
      return values[name] === undefined ? null : values[name];
    }
  };
}

function response(status, payload, headerValues) {
  return {
    status: status,
    ok: status >= 200 && status < 300,
    headers: headers(headerValues || {}),
    json: function() { return Promise.resolve(payload); }
  };
}

function installRenderCounter(ctx) {
  const app = ctx.document.getElementById("app");
  let html = "";
  let renderCount = 0;
  Object.defineProperty(app, "innerHTML", {
    configurable: true,
    get: function() { return html; },
    set: function(value) {
      html = String(value);
      renderCount += 1;
    }
  });
  return {
    count: function() { return renderCount; },
    reset: function() { renderCount = 0; },
    html: function() { return html; }
  };
}

async function main() {
  const { ctx, AeonV2, flushPromises, intervalInfo } = boot();
  AeonV2.init();

  assert(AeonV2.getPollingState().intervalId === null, "Token yokken polling interval'ı başlamıyor");
  AeonV2.setPanelToken("ghp_prompt35_fixture");
  assert(AeonV2.getPollingState().intervalId !== null, "Token ile polling başlatılıyor");
  assert(AeonV2.getPollingState().intervalMs === 60000, "Polling varsayılanı 60 saniye");
  assert(intervalInfo().filter(function(item) { return item.active; }).length === 1, "Polling tek aktif interval bağlıyor");
  AeonV2.startPolling();
  assert(intervalInfo().filter(function(item) { return item.active; }).length === 1, "Polling tekrar başlatılınca interval çoğalmıyor");
  AeonV2.stopPolling();
  assert(AeonV2.getPollingState().intervalId === null, "Polling durdurulunca interval kimliği temizleniyor");
  assert(intervalInfo().filter(function(item) { return item.active; }).length === 0, "Polling durdurulunca aktif interval kalmıyor");

  AeonV2.syncStatus._latencyWindow = [];
  [80, 120, 100, 200, 90, 110, 150, 70, 130, 180, 95, 105, 140, 160, 85, 115, 125, 135, 145, 190].forEach(function(ms) {
    AeonV2.updateLatencyTelemetry(ms);
  });
  assert(AeonV2.syncStatus.p50LatencyMs === 120, "20 örnekten p50 hesaplanıyor");
  assert(AeonV2.syncStatus.p95LatencyMs === 190, "20 örnekten p95 hesaplanıyor");
  AeonV2.updateLatencyTelemetry(999);
  assert(AeonV2.syncStatus._latencyWindow.length === 20, "Latency penceresi 20 örnekte tutuluyor");

  ctx.fetch = function() {
    return Promise.resolve(response(200, {
      days: { "2026-08-11": { mood: 4 } },
      syncReceipt: { snapshotRevision: "rev-p35", sourceUpdatedAt: "2026-08-11T07:00:00Z" }
    }, {
      ETag: '"prompt35-etag"',
      "X-RateLimit-Remaining": "4920",
      "X-RateLimit-Limit": "5000",
      "X-RateLimit-Reset": "1790000000"
    }));
  };
  await AeonV2.fetchLatest("mustafaras/seyma-data", "main");
  assert(AeonV2.syncStatus.apiRateLimitRemaining === 4920, "API rate-limit kalan kotası okunuyor");
  assert(AeonV2.syncStatus.apiLimitTotal === 5000, "API rate-limit toplam kotası okunuyor");
  assert(AeonV2.syncStatus.apiRateLimitReset === new Date(1790000000 * 1000).toISOString(), "API rate-limit reset zamanı okunuyor");

  const now = Date.now();
  const old = new Date(now - 125000).toISOString();
  assert(AeonV2.dataAgeMinutes(old, now) === 2, "Veri tazeliği dakika olarak hesaplanıyor");
  assert(AeonV2.dataFreshnessLabel(old).indexOf("dk önce") !== -1, "Veri tazeliği etiketi üretiliyor");

  const renders = installRenderCounter(ctx);
  renders.reset();
  ctx.fetch = function() {
    return Promise.resolve(response(304, null, {
      ETag: '"prompt35-etag"',
      "X-RateLimit-Remaining": "4919",
      "X-RateLimit-Limit": "5000",
      "X-RateLimit-Reset": "1790000000"
    }));
  };
  await AeonV2.fetchLatest("mustafaras/seyma-data", "main");
  assert(AeonV2.syncStatus.notModifiedCount === 1, "304 yanıtı notModified olarak sayılıyor");
  assert(renders.count() === 0, "Doğrudan 304 yanıtında render tetiklenmiyor");

  renders.reset();
  await AeonV2.load();
  await settle(flushPromises);
  assert(renders.count() === 1, "load 304 akışında yalnızca başlangıç durumu render ediliyor");

  AeonV2.logout();
  assert(AeonV2.getPollingState().intervalId === null, "Logout polling'i durduruyor");

  console.log("\n✅ Prompt 35 polling/telemetry test fixture — TÜM TESTLER BAŞARILI");
}

main().catch(function(error) {
  console.error("❌ FAIL: " + error.message);
  process.exitCode = 1;
});
