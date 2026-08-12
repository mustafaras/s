// ÆON Panel v2 — Prompt 26 pull-to-refresh headless fixture
// Gerçek tarayıcı açmadan mobil touch akışını ve 60px sözleşmesini doğrular.
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

function touchEvent(type, x, y, target) {
  const point = { clientX: x, clientY: y };
  return {
    type,
    touches: type === "touchend" || type === "touchcancel" ? [] : [point],
    changedTouches: [point],
    target: target || {},
    cancelable: type === "touchmove",
    defaultPrevented: false,
    preventDefault: function() { this.defaultPrevented = true; }
  };
}

function pull(dom, startY, endY, target) {
  dom.dispatchAppEvent(touchEvent("touchstart", 120, startY, target));
  const move = touchEvent("touchmove", 120, endY, target);
  dom.dispatchAppEvent(move);
  dom.dispatchAppEvent(touchEvent("touchend", 120, endY, target));
  return move;
}

async function main() {
  const { dom, ctx, AeonV2, flushPromises } = boot();
  ctx.matchMedia = function(query) {
    return { matches: query === "(max-width: 460px)" };
  };
  AeonV2.setData({ days: { "2026-08-10": { mood: 4 } }, startDate: "2026-01-01" });
  AeonV2.render();

  assert(dom.appListenerCount("touchstart") === 1, "Mobilde ortak touchstart listener'ı bağlandı");
  assert(dom.appListenerCount("touchmove") === 1, "Mobilde ortak touchmove listener'ı bağlandı");
  assert(dom.appListenerCount("touchend") === 1, "Mobilde ortak touchend listener'ı bağlandı");
  assert(dom.html.includes('id="ae-pull-refresh"'), "Pull-to-refresh göstergesi render edildi");
  assert(dom.html.includes('data-state="idle"'), "Pull göstergesi başlangıçta idle");
  assert(AeonV2.getPullRefreshState().threshold === 60, "Pull eşiği 60px");

  const shortMove = pull(dom, 100, 159);
  assert(shortMove.defaultPrevented, "Dikey pull hareketi varsayılan scroll'u engelliyor");
  assert(AeonV2.getPullRefreshState().mode === "idle", "59px hareket yenilemeyi tetiklemiyor");

  let fetchCalls = 0;
  let resolveFetch;
  ctx.fetch = function() {
    fetchCalls += 1;
    return new Promise(function(resolve) { resolveFetch = resolve; });
  };
  AeonV2.setPanelToken("ghp_demo_token");

  dom.dispatchAppEvent(touchEvent("touchstart", 120, 100));
  const thresholdMove = touchEvent("touchmove", 120, 160);
  dom.dispatchAppEvent(thresholdMove);
  assert(thresholdMove.defaultPrevented, "60px pull hareketi varsayılan scroll'u engelliyor");
  assert(AeonV2.getPullRefreshState().mode === "ready", "60px eşiğinde gösterge hazır durumuna geçiyor");
  dom.dispatchAppEvent(touchEvent("touchend", 120, 160));

  assert(fetchCalls === 1, "60px eşiğinde tek refresh fetch çağrısı yapılıyor");
  assert(AeonV2.getPullRefreshState().refreshing === true, "Refresh sırasında loading state tutuluyor");
  assert(AeonV2.getPullRefreshState().mode === "refreshing", "Refresh sırasında spinner durumu render ediliyor");

  resolveFetch({
    status: 200,
    ok: true,
    headers: { get: function() { return null; } },
    json: function() { return Promise.resolve({ days: { "2026-08-10": { mood: 5 } } }); }
  });
  await flushPromises();
  await flushPromises();
  assert(AeonV2.getPullRefreshState().refreshing === false, "Fetch tamamlanınca refresh state kapanıyor");
  assert(AeonV2.getPullRefreshState().mode === "idle", "Fetch tamamlanınca gösterge idle'a dönüyor");

  dom.getElementById("app").scrollTop = 10;
  const beforeBlocked = fetchCalls;
  pull(dom, 100, 180);
  assert(fetchCalls === beforeBlocked, "Sayfa üstte değilken pull-to-refresh çalışmıyor");
  dom.getElementById("app").scrollTop = 0;

  const interactiveTarget = { closest: function() { return {}; } };
  pull(dom, 100, 180, interactiveTarget);
  assert(fetchCalls === beforeBlocked, "Etkileşimli eleman üzerindeki pull yok sayılıyor");

  const desktop = boot();
  desktop.ctx.matchMedia = function() { return { matches: false }; };
  desktop.AeonV2.render();
  assert(desktop.dom.appListenerCount("touchstart") === 0, "460px üstünde pull touchstart listener'ı bağlanmıyor");
  assert(desktop.AeonV2.getPullRefreshState().threshold === 60, "Desktop bağlanmasa da eşik sözleşmesi sabit");

  console.log("\n🦩 Prompt 26 pull-to-refresh fixture — TÜM TESTLER BAŞARILI");
}

main().catch(function(error) {
  console.error("❌ FAIL: " + error.message);
  process.exitCode = 1;
});
