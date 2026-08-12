// ÆON Observer Dashboard v2 — Prompt 12 count-up fixture
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

const { ctx, AeonV2 } = boot();

assert(typeof AeonV2.animateCountUp === "function", "animateCountUp fonksiyonu export ediliyor");

function fakeElement(format) {
  const attrs = { "data-count-format": format || "number" };
  return {
    textContent: "0",
    __aeCountAnimation: null,
    getAttribute: function(key) { return attrs[key] === undefined ? null : attrs[key]; },
    setAttribute: function(key, value) { attrs[key] = String(value); }
  };
}

const reduced = fakeElement("integer");
ctx.matchMedia = function() { return { matches: true }; };
AeonV2.animateCountUp(reduced, 8432, 650);
assert(reduced.textContent === "8.432", "Reduced-motion count-up doğrudan hedef değere gider");

const hours = fakeElement("hours");
AeonV2.animateCountUp(hours, 7.5, 0);
assert(hours.textContent === "7sa 30dk", "Saat formatı count-up sonunda korunuyor");

const animated = fakeElement("decimal");
ctx.matchMedia = function() { return { matches: false }; };
const frameTimes = [0, 325, 650];
ctx.requestAnimationFrame = function(callback) {
  callback(frameTimes.shift());
  return 1;
};
AeonV2.animateCountUp(animated, 12.5, 650);
assert(animated.textContent === "12,5", "Normal count-up animasyonu hedef değerde tamamlanıyor");

console.log("\n🦩 Prompt 12 count-up fixture — TÜM TESTLER BAŞARILI");
