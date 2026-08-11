// PROMPT-30 — Synchronization health dashboard headless fixture.
// Synthetic telemetry only: no browser, network, token or user data.
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

function countMatches(html, pattern) {
  return (html.match(pattern) || []).length;
}

const { dom, AeonV2 } = boot();
const now = Date.now();
const requestHistory = [];
for (let i = 0; i < 24; i += 1) {
  requestHistory.push({
    at: new Date(now - (23 - i) * 60 * 60 * 1000 - 1000).toISOString(),
    durationMs: 100 + i * 10,
    success: i !== 7,
    status: i === 7 ? 500 : 200
  });
}
const errorHistory = [];
for (let i = 0; i < 12; i += 1) {
  errorHistory.push({
    at: new Date(now - i * 60 * 1000).toISOString(),
    code: i % 2 ? "network" : "http_500",
    status: i % 2 ? null : 500
  });
}

AeonV2.init();
AeonV2.setPanelToken("panel_health_fixture");
AeonV2.updateStatus({
  status: "accepted",
  lastSyncedAt: new Date(now - 7 * 60 * 1000).toISOString(),
  p50LatencyMs: 120,
  p95LatencyMs: 480,
  totalFetchCount: 20,
  errorCount: 2,
  consecutiveErrors: 0,
  lastSuccessAt: new Date(now - 7 * 60 * 1000).toISOString(),
  requestHistory: requestHistory,
  errorHistory: errorHistory,
  apiRateLimitRemaining: 4820,
  apiLimitTotal: 5000,
  apiRateLimitReset: new Date(now + 45 * 60 * 1000).toISOString(),
  tokenIssuedAt: new Date(now - 10 * 86400000).toISOString(),
  tokenExpiresAt: new Date(now + 20 * 86400000).toISOString()
});
AeonV2.setTab("system");
AeonV2.setSystemSubTab("status");
let html = dom.html;

assert(countMatches(html, /class="sync-health-metric(?:\s|\")/g) === 4, "Dört senkron sağlık KPI kartı render ediliyor");
assert(/Durum/.test(html) && /Gecikme/.test(html) && /Hata oranı/.test(html) && /Veri tazeliği/.test(html), "Dört sağlık KPI etiketi görünür");
assert(/Sağlıklı/.test(html), "Kabul edilmiş senkron sağlıklı gösteriliyor");
assert(/120 \/ 480 ms/.test(html), "p50/p95 gecikme KPI'da gösteriliyor");
assert(/10,0%|10\.0%/.test(html), "Hata oranı yüzde olarak hesaplanıyor");
assert(/7 dk/.test(html), "Veri tazeliği dakika olarak gösteriliyor");

assert(/sync-request-history/.test(html), "İstek geçmişi kartı var");
assert(/İstek gecikmesi son 24 saat/.test(html), "24 saatlik SVG sparkline erişilebilir etiketi var");
assert(/ae-sparkline--info/.test(html), "İstek geçmişi sparkline bilgi rengini kullanıyor");
assert(/24 istek/.test(html), "24 saatlik istek sayısı özeti var");

assert(/sync-api-health/.test(html), "API sağlık kartı var");
assert(/4820 \/ 5000/.test(html), "API kalan limit kartta gösteriliyor");
assert(/Sıfırlanma/.test(html) && /Token durumu/.test(html), "API reset ve token durumu kartta var");
assert(/Token ayarlı/.test(html), "Token durumu token değeri açığa çıkmadan gösteriliyor");

assert(/sync-error-history/.test(html), "Hata geçmişi kartı var");
assert(/Hata geçmişi/.test(html) && /SON 10/.test(html), "Son 10 hata başlığı var");
assert(countMatches(html, /class="sync-error-history__row"/g) === 10, "Hata geçmişi son 10 kayıtla sınırlı");
assert(!html.includes("panel_health_fixture") && !html.includes("sk-"), "Sağlık paneli secret taşımıyor");

AeonV2.updateStatus({ status: "error", errorCount: 4, totalFetchCount: 20, consecutiveErrors: 3, lastErrorCode: "rate_limited" });
html = dom.html;
assert(/Kritik/.test(html), "Ardışık kritik hata sağlık durumunu Kritik yapıyor");
assert(/rate_limited/.test(html), "Son hata kodu görünür");

AeonV2.logout();
AeonV2.setTab("system");
AeonV2.setSystemSubTab("status");
html = dom.html;
assert(/Bekliyor/.test(html), "Logout sonrası sağlık durumu Bekliyor oluyor");
assert(/Henüz senkron hatası yok/.test(html), "Logout sonrası hata geçmişi temizleniyor");
assert(/ae-sparkline--empty/.test(html), "Logout sonrası istek grafiği boş durumu gösteriyor");

console.log("\n✅ Prompt 30 sync-health fixture — TÜM TESTLER BAŞARILI");
