// PROMPT-28 — Polling and request telemetry headless fixture.
// No browser, network, token disclosure or user data is used.
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

async function settle(flushPromises) {
  await flushPromises();
  await flushPromises();
}

async function main() {
  const { ctx, dom, AeonV2, flushPromises, runIntervals, intervalInfo } = boot();
  AeonV2.init();

  assert(AeonV2.getPollingState().intervalId === null, "Token yokken polling başlamıyor");
  assert(AeonV2.syncStatus.pollingIntervalMs === 60000, "Varsayılan polling aralığı 60000ms");

  let fetchCalls = 0;
  ctx.fetch = function() {
    fetchCalls += 1;
    return Promise.resolve({
      status: 200,
      ok: true,
      headers: { get: function(name) {
        if (name === "ETag") return '"fixture-etag"';
        if (name === "X-RateLimit-Remaining") return "4920";
        if (name === "X-RateLimit-Limit") return "5000";
        if (name === "X-RateLimit-Reset") return "1790000000";
        return null;
      } },
      json: function() {
        return Promise.resolve({
          days: { "2026-08-11": { mood: 4 } },
          syncReceipt: { snapshotRevision: "rev-p28", sourceUpdatedAt: "2026-08-11T07:00:00Z" }
        });
      }
    });
  };

  AeonV2.setPanelToken("ghp_fixture_token");
  assert(AeonV2.getPollingState().intervalId !== null, "Token gelince polling başlıyor");
  assert(intervalInfo().filter(function(x) { return x.active; }).length === 1, "Tek polling interval'ı bağlanıyor");
  assert(AeonV2.getPollingState().intervalMs === 60000, "Polling interval'ı 60 saniye");

  runIntervals();
  await settle(flushPromises);
  assert(fetchCalls === 1, "Polling tick tek fetch çağrısı yapıyor");
  assert(AeonV2.syncStatus.totalFetchCount === 1, "Başarılı fetch sayılıyor");
  assert(AeonV2.syncStatus.errorCount === 0, "Başarılı fetch hata sayısını artırmıyor");
  assert(AeonV2.syncStatus.consecutiveErrors === 0, "Başarılı fetch ardışık hatayı sıfırlıyor");
  assert(AeonV2.syncStatus.lastSuccessAt, "Başarılı fetch zamanı kaydediliyor");
  assert(AeonV2.syncStatus.lastFetchDurationMs !== null, "Son fetch süresi kaydediliyor");
  assert(AeonV2.syncStatus.apiRateLimitRemaining === 4920, "Rate-limit remaining header okunuyor");
  assert(AeonV2.syncStatus.apiRateLimitReset, "Rate-limit reset header okunuyor");
  assert(AeonV2.getPollingState().lastRunAt, "Polling son çalışma zamanı kaydediliyor");

  AeonV2.syncStatus._latencyWindow = [];
  [100, 200, 300, 400].forEach(function(ms) { AeonV2.updateLatencyTelemetry(ms); });
  assert(AeonV2.syncStatus.p50LatencyMs === 200, "p50 son latency penceresinden hesaplanıyor");
  assert(AeonV2.syncStatus.p95LatencyMs === 400, "p95 son latency penceresinden hesaplanıyor");
  for (let i = 0; i < 25; i += 1) AeonV2.updateLatencyTelemetry(1000 + i);
  assert(AeonV2.syncStatus._latencyWindow.length === 20, "Latency penceresi son 20 istekte sınırlı");

  const old = new Date(Date.now() - 125000).toISOString();
  assert(AeonV2.dataAgeMinutes(old, Date.now()) === 2, "Veri yaşı dakika olarak hesaplanıyor");
  AeonV2.updateStatus({ lastSyncedAt: old });
  AeonV2.setTab("system");
  assert(/Veri tazeliği/.test(dom.html), "Durum sayfasında veri tazeliği satırı var");
  assert(/2 dk önce/.test(dom.html), "Durum sayfası veri yaşını görünür gösteriyor");
  assert(/Toplam istek/.test(dom.html) && /Ardışık hata/.test(dom.html), "Telemetry sayaçları durum sayfasında var");

  ctx.fetch = function() { return Promise.reject(new Error("network fixture")); };
  await AeonV2.load();
  assert(AeonV2.syncStatus.errorCount === 1, "Network hatası errorCount artırıyor");
  assert(AeonV2.syncStatus.consecutiveErrors === 1, "Network hatası consecutiveErrors artırıyor");

  ctx.fetch = function() {
    return Promise.resolve({ status: 304, ok: false, headers: { get: function() { return '"fixture-etag"'; } } });
  };
  await AeonV2.load();
  assert(AeonV2.syncStatus.notModifiedCount === 1, "304 yanıtı notModified olarak işleniyor");
  assert(AeonV2.syncStatus.consecutiveErrors === 0, "304 başarılı kontrol olarak hatayı sıfırlıyor");

  AeonV2.logout();
  assert(AeonV2.getPollingState().intervalId === null, "Logout polling'i durduruyor");
  assert(intervalInfo().filter(function(x) { return x.active; }).length === 0, "Logout interval'ı temizliyor");

  console.log("\n✅ Prompt 28 polling/telemetry fixture — TÜM TESTLER BAŞARILI");
}

main().catch(function(error) {
  console.error("❌ FAIL: " + error.message);
  process.exitCode = 1;
});
