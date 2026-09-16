// MON2-02: modülde kalan 379 gövdeyi brief §1 "taşınmaz" kurallarına göre tarar.
// Kurallar: acceptance impureApis + bare data/ui YAZMA + save()/render() çağrısı
// + reassigned app.js state var'larına bare yazma. Çıktı: RESTORE-ADD listesi.
const fs = require('fs');
const mod = fs.readFileSync('app/core/reminders.js', 'utf8');
const lines = mod.split('\n');

// reassigned (rebind edilen) app.js state varları — snapshot/getter ile çözülemez
const REASSIGNED = new Set([
  'reminderSchedulerInstance', 'reminderPermissionTransientState',
  'reminderPermissionEverGranted', 'reminderMigrationStatus', 'reminderLifecycleTickPending'
]);
// stable-identity (property-mutation) state varları — modülde OKUMA serbest, yazma değil
const STABLE_STATE = new Set(['reminderLifecycleState']);

const fns = [];
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^  function ([A-Za-z_$][\w$]*)\(/);
  if (m) fns.push({ name: m[1], start: i + 1, sigLine: lines[i] });
}
// brace-dengeli gövde sonu (satır bazında kaba sayım; string/regex false-pozitifleri kabul edilebilir,
// yanlış-pozitif gövdeleri elle damgalayacağız)
// gövde sonu: tek satırlık fn satırı `}` ile biter; çok satırlı fn ilk `^  }` (else değil) ile kapanır
function bodyOf(f) {
  const sig = f.sigLine;
  const t = sig.replace(/\s+$/, '');
  if (t.endsWith('}')) return sig; // tek satır
  const buf = [sig];
  for (let i = f.start; i < lines.length; i++) {
    const l = lines[i];
    buf.push(l);
    if (/^  \}(?!\s*else\b)/.test(l)) break;
    if (buf.length > 400) break;
  }
  return buf.join('\n');
}
const impureApi = [
  [/\bfetch\s*\(/, 'fetch('], [/\bXMLHttpRequest\b/, 'XMLHttpRequest'],
  [/localStorage\s*\./, 'localStorage.'], [/\bdocument\s*\./, 'document.'],
  [/\bsetTimeout\s*\(/, 'setTimeout('], [/\bsetInterval\s*\(/, 'setInterval('],
  [/\bnavigator\s*\./, 'navigator.'], [/\bNotification\s*\(/, 'Notification('],
];
const writePatterns = [
  [/\bdata\s*\.\s*[A-Za-z_$][\w$]*\s*=/, 'data.x='],
  [/\bui\s*\.\s*[A-Za-z_$][\w$]*\s*=/, 'ui.x='],
  [/\bdata\s*=\s*(?!==)/, 'data='],
  [/\bui\s*=\s*(?!==)/, 'ui='],
  [/\bsave\s*\(/, 'save('], [/\brender\s*\(/, 'render('],
  [/\bsaveLocal\s*\(/, 'saveLocal('],
];
const out = [];
for (const f of fns) {
  const body = bodyOf(f);
  const hits = [];
  for (const [re, label] of impureApi) if (re.test(body)) hits.push(label);
  for (const [re, label] of writePatterns) if (re.test(body)) hits.push(label);
  for (const name of REASSIGNED) {
    const re = new RegExp('\\b' + name + '\\s*=[^=]');
    if (re.test(body)) hits.push(name + '= (write)');
  }
  for (const name of STABLE_STATE) {
    const re = new RegExp('\\b' + name + '\\s*=[^=]');
    if (re.test(body)) hits.push(name + '= (stable-write!)');
  }
  if (hits.length) out.push({ name: f.name, line: f.start, hits: hits.join(',') });
}
console.log('impure/taşınmaz aday sayısı:', out.length);
for (const o of out) console.log('  ' + o.name + ' (L' + o.line + ') -> ' + o.hits);