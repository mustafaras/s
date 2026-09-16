const fs = require("fs");
const src = fs.readFileSync("app/core/reminders.js", "utf8");
const lines = src.split("\n");
const re = /function\s+(\w+)\s*\(/g;
let m; const defs = [];
lines.forEach((l, i) => {
  const mm = /function\s+(\w+)\s*\(/g;
  let r;
  while ((r = mm.exec(l))) defs.push({ name: r[1], line: i + 1 });
});
const pats = [
  [/\bsave\s*\(/, "save("],
  [/\brender\s*\(/, "render("],
  [/\bsaveLocal\s*\(/, "saveLocal("],
  [/\bappendEvent\s*\(/, "appendEvent("],
  [/[^.\w]data\.\w+\s*=[^=]/, "data.x="],
  [/[^.\w]ui\.\w+\s*=[^=]/, "ui.x="]
];
function endOf(startLine) {
  let d = 0;
  for (let j = startLine - 1; j < lines.length; j++) {
    const l = lines[j];
    for (const ch of l) { if (ch === "{") d++; else if (ch === "}") { d--; if (d === 0) return j + 1; } }
    if (j === startLine - 1) {
      // find first { in the def line
      const idx = l.indexOf("{");
      if (idx < 0) return startLine;
      d = 0;
      for (const ch of l.slice(idx)) { if (ch === "{") d++; else if (ch === "}") { d--; if (d === 0) return j + 1; } }
    }
  }
  return lines.length;
}
for (let k = 0; k < defs.length; k++) {
  const def = defs[k];
  const end = endOf(def.line);
  const hits = [];
  for (let i = def.line; i <= end; i++) {
    const l = lines[i - 1];
    for (const p of pats) if (p[0].test(l)) hits.push("L" + i + ": " + l.trim().slice(0, 110));
  }
  if (hits.length) {
    console.log("## " + def.name + " (L" + def.line + "-" + end + ")");
    hits.slice(0, 4).forEach(h => console.log("   " + h));
  }
}