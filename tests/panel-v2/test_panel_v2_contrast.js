// PANEL-REVIZE — Prompt 36 WCAG AA renk kontrastı kontratı
// CSS token'larını iki tema için deterministik olarak çözer; gerçek tarayıcı/DOM yoktur.
"use strict";

const { read, assert } = require("./helpers/panel-v2-test-helper");

const css = read("panel/v2/panel-v2.css");

function blockFor(selector) {
  const selectorStart = css.indexOf(selector);
  assert(selectorStart >= 0, "Tema bloğu var: " + selector);
  const open = css.indexOf("{", selectorStart);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error("Tema bloğu kapanmıyor: " + selector);
}

function declarations(block) {
  const result = {};
  const re = /(--ae-[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let match;
  while ((match = re.exec(block))) result[match[1]] = match[2].trim();
  return result;
}

function hex(raw) {
  const match = String(raw).match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  assert(match, "Kontrast tokenı doğrudan hex renk: " + raw);
  const value = match[1].length === 3
    ? match[1].split("").map(function(ch) { return ch + ch; }).join("")
    : match[1];
  return [0, 2, 4].map(function(offset) {
    return parseInt(value.slice(offset, offset + 2), 16) / 255;
  });
}

function luminance(raw) {
  return hex(raw).map(function(channel) {
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  }).reduce(function(sum, channel, index) {
    return sum + channel * [0.2126, 0.7152, 0.0722][index];
  }, 0);
}

function contrast(foreground, background) {
  const fg = luminance(foreground);
  const bg = luminance(background);
  return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
}

function mixSrgb(first, firstWeight, second, secondWeight) {
  const a = hex(first);
  const b = hex(second);
  return "#" + a.map(function(channel, index) {
    return Math.round((channel * firstWeight + b[index] * secondWeight) * 255).toString(16).padStart(2, "0");
  }).join("");
}

const rootVars = declarations(blockFor(":root"));
const darkVars = declarations(blockFor('#root[data-theme="dark"]'));
const themes = {
  light: rootVars,
  dark: Object.assign({}, rootVars, darkVars)
};

const textTokens = [
  "--ae-text", "--ae-muted", "--ae-faint",
  "--ae-accent", "--ae-accent2", "--ae-accent3",
  "--ae-ok", "--ae-warn", "--ae-drop", "--ae-info", "--ae-pause"
];
const backgroundTokens = [
  "--ae-page", "--ae-bg", "--ae-surface", "--ae-elevated", "--ae-card-bg"
];
const aliasTargets = {
  light: {
    "--ae-chip-text": "--ae-accent",
    "--ae-nav-active-text": "--ae-accent",
    "--ae-empty-icon": "--ae-accent"
  },
  dark: {
    "--ae-chip-text": "--ae-accent2",
    "--ae-nav-active-text": "--ae-accent2",
    "--ae-empty-icon": "--ae-accent"
  }
};

Object.keys(themes).forEach(function(themeName) {
  const vars = themes[themeName];
  const values = {};
  textTokens.concat(backgroundTokens, ["--ae-drop-bg", "--ae-warn"]).forEach(function(token) {
    assert(vars[token], themeName + " tokenu tanımlı: " + token);
    values[token] = vars[token];
  });

  textTokens.forEach(function(foregroundToken) {
    backgroundTokens.forEach(function(backgroundToken) {
      const ratio = contrast(values[foregroundToken], values[backgroundToken]);
      assert(
        ratio >= 4.5,
        themeName + " " + foregroundToken + " / " + backgroundToken + " WCAG AA: " + ratio.toFixed(2)
      );
    });
  });

  Object.keys(aliasTargets[themeName]).forEach(function(alias) {
    const target = aliasTargets[themeName][alias];
    backgroundTokens.forEach(function(backgroundToken) {
      const ratio = contrast(values[target], values[backgroundToken]);
      assert(
        ratio >= 4.5,
        themeName + " " + alias + " -> " + target + " / " + backgroundToken + " WCAG AA: " + ratio.toFixed(2)
      );
    });
  });

  const dropButtonRatio = contrast("#FFFFFF", values["--ae-drop-bg"]);
  assert(dropButtonRatio >= 4.5, themeName + " drop butonu beyaz metin kontrastı: " + dropButtonRatio.toFixed(2));
  const dropButtonHover = mixSrgb(values["--ae-drop-bg"], 0.88, "#FFFFFF", 0.12);
  const dropButtonHoverRatio = contrast("#FFFFFF", dropButtonHover);
  assert(dropButtonHoverRatio >= 4.5, themeName + " drop hover beyaz metin kontrastı: " + dropButtonHoverRatio.toFixed(2));

  const primaryTextRatios = ["--ae-accent", "--ae-accent2"].map(function(backgroundToken) {
    return contrast(values["--ae-page"], values[backgroundToken]);
  });
  assert(Math.min.apply(Math, primaryTextRatios) >= 4.5, themeName + " primary buton metin kontrastı WCAG AA");

  ["--ae-drop", "--ae-warn", "--ae-accent", "--ae-ok", "--ae-accent2"].forEach(function(heatmapBackground) {
    const heatmapRatio = contrast(values["--ae-page"], values[heatmapBackground]);
    assert(heatmapRatio >= 4.5, themeName + " ısı haritası " + heatmapBackground + " tarih metni kontrastı: " + heatmapRatio.toFixed(2));
  });

  console.log(themeName + " minimum metin kontrastı: " + Math.min.apply(Math, textTokens.flatMap(function(fg) {
    return backgroundTokens.map(function(bg) { return contrast(values[fg], values[bg]); });
  })).toFixed(2));
});

const literalTextColors = Array.from(css.matchAll(/(?:^|[;{])\s*color\s*:\s*(#[0-9a-f]{3,8})\b/gi))
  .map(function(match) { return match[1].toLowerCase(); });
assert(literalTextColors.every(function(color) { return color === "#fff" || color === "#ffffff"; }),
  "Metin renkleri WCAG tokenlarıyla yönetiliyor; yalnızca güvenli drop butonu beyazı literal olabilir");
const usedColorTokens = Array.from(css.matchAll(/(?:^|[;{])\s*(?:color|fill)\s*:\s*var\((--ae-[a-z0-9-]+)/gim))
  .map(function(match) { return match[1]; });
const allowedColorTokens = new Set(textTokens.concat([
  "--ae-page", "--ae-chip-text", "--ae-nav-active-text", "--ae-empty-icon",
  "--ae-chart-color", "--ae-spark-color", "--ae-toast-tone"
]));
assert(usedColorTokens.every(function(token) { return allowedColorTokens.has(token); }),
  "Tüm CSS metin/vektör renk kullanımları kayıtlı tokenlardan geliyor");
assert(css.includes("--ae-drop-bg"), "Drop butonu için metin-kontrastlı koyu zemin tokenı var");

console.log("\n✅ Prompt 36 WCAG AA kontrast fixture — TÜM TESTLER BAŞARILI");
