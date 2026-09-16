const fs = require("fs");
const src = fs.readFileSync("app/core/reminders.js", "utf8");
const re = /function\s+(\w+)\s*\(/g;
let m; const names = [];
while ((m = re.exec(src))) names.push({ name: m[1], idx: m.index });
function bodyOf(idx) {
  const i = src.indexOf("{", idx); let d = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === "{") d++;
    else if (src[j] === "}") { d--; if (d === 0) return src.slice(idx, j + 1); }
  }
  return "";
}
const pats = [
  [/\bsave\s*\(/, "save("],
  [/\brender\s*\(/, "render("],
  [/\bsaveLocal\s*\(/, "saveLocal("],
  [/\bappendEvent\s*\(/, "appendEvent("],
  [/\bdata\.\w+\s*=/, "data.x="],
  [/\bui\.\w+\s*=/, "ui.x="],
  [/\bdata\s*=/, "data="],
  [/\bui\s*=/, "ui="]
];
const bad = [];
for (const n of names) {
  const b = bodyOf(n.idx);
  const hits = pats.filter(p => p[0].test(b));
  if (hits.length) bad.push({ name: n.name, pats: hits.map(p => p[1]).join(","), lines: b.split("\n").length });
}
console.log("KIRMIZI CIZGI (data/ui yazan, save/render cagiran) modulde:");
bad.forEach(x => console.log("  -", x.name, "(" + x.lines + " satir) ->", x.pats));
const app = fs.readFileSync("app.js", "utf8");
console.log("");
console.log("app.js'te hala tanimli mi:");
for (const x of bad) {
  console.log("  -", x.name, new RegExp("function\\s+" + x.name + "\\s*\\(").test(app) ? "VAR" : "YOK");
}