"use strict";

function serialize(value) {
  try {
    return JSON.stringify(value === undefined ? null : value);
  } catch {
    return "[unserializable]";
  }
}

function findLeaks(value, corpus) {
  const text = serialize(value);
  return (Array.isArray(corpus) ? corpus : []).filter((needle) => text.includes(needle));
}

function findStaticMatches(source, patterns) {
  const text = String(source || "");
  return (Array.isArray(patterns) ? patterns : []).filter((pattern) => {
    if (pattern instanceof RegExp) return pattern.test(text);
    return text.includes(String(pattern));
  });
}

function writeVerbs(source) {
  return findStaticMatches(source, [
    /method\s*:\s*["'](?:PUT|POST|PATCH|DELETE)["']/,
    /localStorage\.(?:setItem|removeItem)\s*\(/,
    /SeySync\.schedule\s*\(/,
    /fetch\s*\(/u
  ]);
}

module.exports = { serialize, findLeaks, findStaticMatches, writeVerbs };
