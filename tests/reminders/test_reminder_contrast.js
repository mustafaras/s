"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const css = fs.readFileSync(path.join(rootDir, "styles.css"), "utf8");

function blockAfter(marker) {
  const start = css.lastIndexOf(marker);
  assert(start >= 0);
  const end = css.indexOf("}", start);
  assert(end > start);
  return css.slice(start, end + 1);
}

function token(block, name) {
  const match = block.match(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ":(#[0-9A-Fa-f]{6})"));
  assert(match);
  return match[1];
}

function luminance(hex) {
  const rgb = hex.slice(1).match(/.{2}/g).map((part) => parseInt(part, 16) / 255).map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(foreground, background) {
  const light = luminance(foreground);
  const dark = luminance(background);
  return (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05);
}

function assertAA(foreground, background, minimum, label) {
  assert(contrast(foreground, background) >= minimum, label + ": " + foreground + " on " + background);
}

runTests([
  ["light reminder text tokens pass normal and large-text AA", () => {
    const light = blockAfter("#root{--reminder-strong");
    const strong = token(light, "--reminder-strong");
    const care = token(light, "--reminder-care-strong");
    const inbox = token(light, "--reminder-inbox-strong");
    assertAA(strong, "#FFF8F3", 4.5, "light strong");
    assertAA(care, "#FFF8F3", 4.5, "light care");
    assertAA(inbox, "#FFF8F3", 4.5, "light inbox");
    assertAA("#FFFFFF", "#76577F", 4.5, "light primary action");
    assert(contrast(strong, "#FFF8F3") >= 3);
    assert(contrast(care, "#FFF8F3") >= 3);
  }],
  ["dark reminder text tokens do not reuse low-contrast light ink", () => {
    const dark = blockAfter('#root[data-theme="dark"]{--reminder-strong');
    const strong = token(dark, "--reminder-strong");
    const care = token(dark, "--reminder-care-strong");
    const inbox = token(dark, "--reminder-inbox-strong");
    assertAA(strong, "#111114", 4.5, "dark strong");
    assertAA(care, "#111114", 4.5, "dark care");
    assertAA(inbox, "#111114", 4.5, "dark inbox");
    assertAA("#D2CBD5", "#111114", 4.5, "dark muted");
    assertAA("#FFFFFF", "#76577F", 4.5, "dark primary action");
    assert(!dark.includes("#684B73"));
    assert(!dark.includes("#39766D"));
  }],
  ["reminder focus, targets, status semantics and reduced motion are explicit", () => {
    assert(css.includes(".sey-reminder-care-choice{min-height:44px}"));
    assert(css.includes(".sey-reminder-actions button{appearance:none;min-width:0;min-height:48px"));
    assert(css.includes(".sey-reminder-close{appearance:none;width:42px;height:42px"));
    assert(css.includes(".sey-reminder-category select{min-height:32px"));
    assert(css.includes(".sey-reminder-category-toggle:focus-visible"));
    assert(css.includes(".sey-reminder-close:focus-visible"));
    assert(css.includes("@media (prefers-reduced-motion:reduce){.sey-reminder-overlay,.sey-reminder-screen"));
    assert(css.includes(".sey-reminder-care-choice,.sey-reminder-care-toggle{animation:none!important;transition:none!important}"));
  }],
  ["contrast fixture itself is deterministic and uses the two app surfaces", () => {
    assertEqual(contrast("#684B73", "#FFF8F3").toFixed(2), "7.03");
    assertEqual(contrast("#E8D5F1", "#111114").toFixed(2), "13.66");
  }]
]);
