const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

(async function () {
  const gate = await import('../../jev-gate/tools/jev-gate.mjs');
  const state = JSON.parse(fs.readFileSync(path.join(__dirname, '../../jev-gate/JEV-GATE-STATE.json'), 'utf8'));

  assert.deepEqual(gate.validateState(state), []);

  const unsafeState = { ...state, liveInference: true, selectedUseCase: 'free_text_advice' };
  const stateErrors = gate.validateState(unsafeState).join('\n');
  assert.match(stateErrors, /liveInference must be false/);
  assert.match(stateErrors, /selectedUseCase must be null/);

  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'seyma-jev-gate-'));
  try {
    fs.mkdirSync(path.join(fixture, 'app'));
    fs.writeFileSync(path.join(fixture, 'index.html'), '<script src="app/safe.js"></script>');
    fs.writeFileSync(path.join(fixture, 'app/safe.js'), 'window.Safe = true;');
    assert.deepEqual(gate.scanBrowserSources(fixture), []);

    fs.writeFileSync(path.join(fixture, 'app/unsafe.js'), 'const key = "TYPESAFE_API_KEY";');
    assert.match(gate.scanBrowserSources(fixture).join('\n'), /TypeSafe API credential/);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }

  console.log('JEV-GATE fixture PASS (5 assertions)');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

