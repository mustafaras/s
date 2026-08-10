// ÆON Panel v2 — Prompt 25 swipe gesture headless fixture
// Gerçek tarayıcı açmadan touchstart/move/end sözleşmesini doğrular.
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

function touchEvent(type, x, y, target) {
  const point = { clientX: x, clientY: y };
  const event = {
    type,
    touches: type === "touchend" || type === "touchcancel" ? [] : [point],
    changedTouches: [point],
    target: target || {},
    cancelable: type === "touchmove",
    defaultPrevented: false,
    preventDefault: function() { this.defaultPrevented = true; }
  };
  return event;
}

function swipe(dom, startX, startY, endX, endY, target) {
  dom.dispatchAppEvent(touchEvent("touchstart", startX, startY, target));
  const move = touchEvent("touchmove", endX, endY, target);
  dom.dispatchAppEvent(move);
  dom.dispatchAppEvent(touchEvent("touchend", endX, endY, target));
  return move;
}

const { dom, ctx, AeonV2 } = boot();
ctx.matchMedia = function() { return { matches: true }; };
AeonV2.setDate("2026-08-10");
AeonV2.setData({ days: { "2026-08-10": { mood: 4 } }, startDate: "2026-01-01" });
AeonV2.setTab("day");

assert(dom.appListenerCount("touchstart") === 1, "Gün Detayı touchstart listener'ı bağlandı");
assert(dom.appListenerCount("touchmove") === 1, "Gün Detayı touchmove listener'ı bağlandı");
assert(dom.appListenerCount("touchend") === 1, "Gün Detayı touchend listener'ı bağlandı");

const leftMove = swipe(dom, 220, 120, 150, 124);
assert(leftMove.defaultPrevented, "Yatay touchmove varsayılan scroll'u engelliyor");
assert(AeonV2.ui.date === "2026-08-11", "Sola swipe sonraki güne geçiyor");

swipe(dom, 120, 120, 190, 124);
assert(AeonV2.ui.date === "2026-08-10", "Sağa swipe önceki güne geçiyor");

swipe(dom, 120, 120, 80, 190);
assert(AeonV2.ui.date === "2026-08-10", "Dikey scroll swipe olarak yorumlanmıyor");

swipe(dom, 120, 120, 165, 124);
assert(AeonV2.ui.date === "2026-08-10", "50px altı yatay hareket gün değiştirmiyor");

const interactiveTarget = { closest: function() { return {}; } };
swipe(dom, 220, 120, 140, 124, interactiveTarget);
assert(AeonV2.ui.date === "2026-08-10", "Etkileşimli eleman üzerindeki swipe yok sayılıyor");

AeonV2.setTab("today");
assert(dom.appListenerCount("touchstart") === 0, "Gün Detayı dışına çıkınca listener kaldırılıyor");
swipe(dom, 220, 120, 140, 124);
assert(AeonV2.ui.date === "2026-08-10", "Swipe yalnızca Gün Detayı'nda aktif");

const desktop = boot();
desktop.ctx.matchMedia = function() { return { matches: false }; };
desktop.AeonV2.setDate("2026-08-10");
desktop.AeonV2.setData({ days: { "2026-08-10": { mood: 4 } }, startDate: "2026-01-01" });
desktop.AeonV2.setTab("day");
assert(desktop.dom.appListenerCount("touchstart") === 0, "460px üstünde swipe listener'ı bağlanmıyor");

console.log("\n🦩 Prompt 25 swipe gesture fixture — TÜM TESTLER BAŞARILI");
