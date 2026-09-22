// P08 helper: verifies every inline <script> in index.html parses.
// Extracted from the placeholder "node -e index-inline-script-syntax-check"
// recorded in evidence/IIP-22/source.json, which was never a runnable command.
const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
  .map(m => m[1]).filter(s => s.trim());
if (!scripts.length) { console.error('no inline scripts found'); process.exit(1); }
scripts.forEach((s, i) => {
  try { new vm.Script(s, { filename: `index-inline-${i + 1}` }); }
  catch (e) { console.error(`inline script ${i + 1} syntax: ${e.message}`); process.exit(1); }
});
console.log(`inline scripts OK: ${scripts.length}`);
