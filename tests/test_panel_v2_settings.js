// ÆON Panel v2 — Prompt 33 Ayarlar & Tanı Araçları fixture
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

async function main() {
  const { dom, ctx, AeonV2, intervalInfo } = boot();
  AeonV2.init();
  AeonV2.setData({ days: { "2026-08-11": { mood: 4 } }, startDate: "2026-01-01" });
  AeonV2.setTab("system");
  AeonV2.setSystemSubTab("settings");

  let html = dom.html;
  assert(/Polling yapılandırması/.test(html), "Polling yapılandırma kartı var");
  assert(/30 sn/.test(html) && /60 sn/.test(html) && /5 dk/.test(html) && /Kapalı/.test(html), "Dört polling aralığı seçeneği var");
  assert(/Otomatik yenileme/.test(html) && /role="switch"/.test(html), "Otomatik yenileme erişilebilir toggle olarak var");
  assert(/Test Bağlantısı/.test(html) && /Veri Doğrulama/.test(html), "Bağlantı ve veri doğrulama tanı araçları var");
  assert(/Önbellek Temizle/.test(html) && /Zorla Senkron/.test(html), "Cache ve zorla senkron tanı araçları var");
  assert(/Hakkında/.test(html) && /ÆON Observer v2\.0/.test(html), "Hakkında sürüm bilgisi var");
  assert(/2026-08-11/.test(html) && /9ad1ad3/.test(html), "Hakkında tarih ve commit hash var");
  assert(/settings-diagnostic-result--idle/.test(html), "Tanı sonucu ilk durumda fail-safe boş görünür");

  assert(AeonV2.getPollingState().intervalMs === 60000, "Polling varsayılanı 60 saniye");
  assert(AeonV2.getPollingState().autoRefresh === true, "Otomatik yenileme varsayılanı açık");
  AeonV2.setPollingInterval(30000);
  assert(AeonV2.getPollingState().intervalMs === 30000, "30 saniye polling seçilebiliyor");
  assert(AeonV2.getPollingState().autoRefresh === true, "Aralık seçimi otomatik yenilemeyi açık tutuyor");
  assert(/30000/.test(ctx.localStorage.getItem("seyma-panel-settings-v1")), "Polling tercihi yalnızca yerel ayar olarak saklanıyor");

  AeonV2.setPanelToken("ghp_fixture_token");
  assert(intervalInfo().filter(function(item) { return item.active && item.ms === 30000; }).length === 1, "Token sonrası seçili aralıkta tek timer var");
  AeonV2.setPollingInterval(300000);
  assert(intervalInfo().filter(function(item) { return item.active; }).length === 1, "Polling aralığı değişince eski timer temizleniyor");
  assert(intervalInfo().filter(function(item) { return item.active; })[0].ms === 300000, "Polling 5 dakikaya yeniden kuruluyor");
  AeonV2.setAutoRefresh(false);
  assert(AeonV2.getPollingState().autoRefresh === false, "Otomatik yenileme kapatılabiliyor");
  assert(intervalInfo().filter(function(item) { return item.active; }).length === 0, "Toggle kapalıyken timer duruyor");
  AeonV2.setPollingInterval("off");
  assert(AeonV2.getPollingState().intervalMs === 0, "Kapalı polling seçeneği 0ms olarak uygulanıyor");
  AeonV2.setAutoRefresh(true);
  assert(AeonV2.getPollingState().intervalMs === 60000 && AeonV2.getPollingState().autoRefresh, "Kapalıdan açınca güvenli 60 saniye varsayılanına dönüyor");

  let report = AeonV2.validatePanelData();
  assert(report.ok && report.dayCount === 1, "Geçerli snapshot veri doğrulamasından geçiyor");
  report = AeonV2.runDataValidation();
  assert(report.ok && AeonV2.getDiagnosticState().status === "ok", "Veri doğrulama tanısı başarılı sonucu kaydediyor");

  const requests = [];
  ctx.fetch = function(url, options) {
    requests.push({ url: url, options: options || {} });
    return Promise.resolve({
      status: 200,
      ok: true,
      headers: { get: function(name) { return name === "ETag" ? '"fixture-etag"' : ""; } },
      json: function() {
        return Promise.resolve({
          days: { "2026-08-11": { mood: 5 } },
          syncReceipt: { snapshotRevision: "abcdef1234567", sourceUpdatedAt: "2026-08-11T12:00:00Z" }
        });
      }
    });
  };
  assert(await AeonV2.testConnection(), "Test bağlantısı başarılı fetch sonucunu raporluyor");
  assert(AeonV2.getDiagnosticState().action === "connection" && AeonV2.getDiagnosticState().status === "ok", "Bağlantı tanısı sonucu görünür duruma geçiyor");
  assert(await AeonV2.forceSync(), "Zorla senkron başarılı fetch sonucunu raporluyor");
  assert(requests.length >= 2 && !requests[requests.length - 1].options.headers["If-None-Match"], "Zorla senkron ETag koşulunu atlıyor");

  assert(AeonV2.clearPanelCache() === true, "Panel cache temizleme işlemi tamamlanıyor");
  assert(AeonV2.getDiagnosticState().action === "cache", "Cache tanısı son işlem olarak kaydediliyor");
  html = dom.html;
  assert(/Önbellek Temizle/.test(html) && /snapshot ve ETag önbelleği/.test(html), "Cache tanısı güvenli açıklamayla görünür kalıyor");

  AeonV2.logout();
  console.log("\n✅ Prompt 33 settings/diagnostics fixture — TÜM TESTLER BAŞARILI");
}

main().catch(function(error) {
  console.error(error);
  process.exitCode = 1;
});
