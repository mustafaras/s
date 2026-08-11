// PROMPT-31 — Notification lifecycle projection/timeline + inbox transport fixture.
// Tamamen sentetik veri ve mock Contents API kullanır; gerçek repo/data yazmaz.
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

function countMatches(html, pattern) {
  return (html.match(pattern) || []).length;
}

const { dom, ctx, AeonV2 } = boot();
const base = "2026-08-11T12:30:00.000Z";
const lifecycle = {
  id: "notification-life-01",
  title: "Nasılsın?",
  text: "Bugün nasıl gidiyor?",
  ts: base,
  sentAt: "2026-08-11T12:30:05.000Z",
  inboxAt: "2026-08-11T12:30:07.000Z",
  deliveredAt: "2026-08-11T12:30:10.000Z",
  readAt: "2026-08-11T12:35:00.000Z",
  repliedAt: "2026-08-11T12:35:30.000Z",
  synced: true,
  error: "SECRET_ERROR_MUST_NOT_PROJECT"
};

const data = {
  lastOpenedDate: "2026-08-11",
  days: {},
  notifications: [lifecycle],
  aeon: { qa: [] }
};

AeonV2.init();
AeonV2.setPanelToken("panel_lifecycle_fixture");
AeonV2.setData(data);
AeonV2.setTab("system");
AeonV2.setSystemSubTab("messages");
let html = dom.html;

const projected = ctx.PanelCoverageV1.notificationEventProjection(lifecycle, "notification", {});
assert(projected.sentAt === lifecycle.sentAt && projected.repliedAt === lifecycle.repliedAt, "Canonical projection sent/replied zamanlarını koruyor");
assert(projected.stages.some(stage => stage.name === "gönderildi") && projected.stages.some(stage => stage.name === "yanıtlandı"), "Projection gönderildi/yanıtlandı aşamalarını taşıyor");
assert(lifecycle.error === "SECRET_ERROR_MUST_NOT_PROJECT" && !JSON.stringify(projected).includes("SECRET_ERROR_MUST_NOT_PROJECT"), "Projection ham hata metnini taşımıyor");
assert(/PanelCoverageV1 projection/.test(html), "Mesaj görünümü canonical projection kaynağını belirtiyor");
assert(countMatches(html, /class="notification-timeline__item /g) === 5, "Beş lifecycle aşaması render ediliyor");
assert(countMatches(html, /notification-timeline__item--complete/g) === 5, "Tam lifecycle dot'ları tamamlandı durumunda");
assert(/Oluşturuldu/.test(html) && /Gönderildi/.test(html) && /Cihaza ulaştı/.test(html) && /Okundu/.test(html) && /Yanıtlandı/.test(html), "Beş lifecycle etiketi görünür");
assert(/Toplam süre/.test(html) && /5dk 30sn/.test(html), "Toplam lifecycle süresi hesaplanıyor");
assert(/notification-timeline__time[^>]*>[^<]*\d{2}:\d{2}:\d{2}/.test(html), "Aşamalar saat bilgisi taşıyor");
assert(!html.includes("SECRET_ERROR_MUST_NOT_PROJECT"), "Ham projection hata metni DOM'a sızmıyor");

AeonV2.setData({ lastOpenedDate: "2026-08-11", days: {}, notifications: [{ id: "partial", ts: base, text: "Bekleyen mesaj" }], aeon: { qa: [] } });
html = dom.html;
assert(/notification-timeline__item--complete/.test(html), "Eksik lifecycle oluşturulma aşamasını tamamlandı gösteriyor");
assert(/notification-timeline__item--current/.test(html), "Eksik lifecycle ilk bekleyen aşamayı current gösteriyor");
assert(/notification-timeline__item--pending/.test(html), "Eksik lifecycle sonraki aşamaları pending gösteriyor");
assert(/Bekliyor/.test(html), "Eksik aşamalar için saat yerine Bekliyor gösteriliyor");

let putCalls = 0;
let getCalls = 0;
let putBodies = [];
ctx.fetch = function(url, options) {
  options = options || {};
  if (options.method === "PUT") {
    putCalls += 1;
    putBodies.push(JSON.parse(options.body));
    return Promise.resolve({ status: 200, ok: true });
  }
  getCalls += 1;
  return Promise.resolve({ status: 404, ok: false });
};

AeonV2.setMessageDraft("Kısa bir gözlemci mesajı");
return AeonV2.sendMessage().then(function(result) {
  assert(result === true, "Mock observer inbox gönderimi başarılı dönüyor");
  assert(getCalls === 1 && putCalls === 1, "Inbox gönderimi GET+PUT ile yapılıyor");
  assert(putBodies[0].message === "observer: mesaj guncelle", "Contents commit mesajı sabit ve güvenli");
  assert(!JSON.stringify(putBodies[0]).includes("panel_lifecycle_fixture"), "GitHub token PUT gövdesine taşınmıyor");
  const encoded = putBodies[0].content;
  const payload = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  assert(payload.messages.length === 1 && payload.messages[0].text === "Kısa bir gözlemci mesajı", "Inbox payload mesaj metnini koruyor");
  assert(payload.messages[0].createdAt && payload.messages[0].sentAt, "Gönderilen mesaj lifecycle başlangıç zamanlarını taşıyor");
  assert(AeonV2.ui.messageDraft === "" && AeonV2.ui.messageSending === false, "Başarılı gönderim taslağı temizliyor");

  let conflictPhase = 0;
  ctx.fetch = function(url, options) {
    options = options || {};
    if (!options.method) {
      conflictPhase += 1;
      return Promise.resolve({ status: 200, ok: true, json: function() { return Promise.resolve({ sha: "sha-old", content: Buffer.from(JSON.stringify({ messages: [] })).toString("base64") }); } });
    }
    if (conflictPhase === 1) {
      conflictPhase += 1;
      return Promise.resolve({ status: 409, ok: false });
    }
    return Promise.resolve({ status: 200, ok: true });
  };
  AeonV2.setMessageDraft("Çakışma sonrası güvenli mesaj");
  return AeonV2.sendMessage().then(function(retried) {
    assert(retried === true && conflictPhase >= 2, "409 Contents çakışması bounded GET+PUT retry ile çözülüyor");
    console.log("\n✅ Prompt 31 notification lifecycle fixture — TÜM TESTLER BAŞARILI");
  });
});
