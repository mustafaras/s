const fs = require("fs");
const src = fs.readFileSync("app/core/reminders.js", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const bad = [
  [/\bdocument\s*\./, "document."],
  [/\blocalStorage\s*\./, "localStorage."],
  [/\bsetTimeout\s*\(/, "setTimeout("],
  [/\bsetInterval\s*\(/, "setInterval("],
  [/\bnavigator\s*\./, "navigator."],
  [/\bNotification\s*\(/, "Notification("],
  [/\bfetch\s*\(/, "fetch("]
];
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
const impure = [];
for (const n of names) {
  const b = bodyOf(n.idx);
  const hits = bad.filter(p => p[0].test(b));
  if (hits.length) impure.push({ name: n.name, pats: hits.map(p => p[1]).join(","), lines: b.split("\n").length });
}
console.log("IMPURE fonksiyonlar (modulde olmamali):");
impure.forEach(x => console.log("  -", x.name, "(" + x.lines + " satir) ->", x.pats));
console.log("");
console.log("app.js'te hala tanimli mi:");
for (const x of impure) {
  const reF = new RegExp("function\\s+" + x.name + "\\s*\\(");
  console.log("  -", x.name, reF.test(app) ? "VAR" : "YOK");
}