'use strict';

// FX2-14 — Ses motoru kapanış fixture'ı.
// Gerçek app/core/mediaFx.js, ağsız node:vm ve kayıt tutan sahte AudioContext
// içinde yürütülür. Spec kopyalanmaz; graph ve ses çağrıları gerçek kaynakta
// oluşur.

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');
const mediaSource = fs.readFileSync(path.join(repoRoot, 'app/core/mediaFx.js'), 'utf8');

let passed = 0;
let failed = 0;
function group(name, condition, detail) {
  if (condition) { passed += 1; console.log(`PASS ${name}`); }
  else { failed += 1; console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`); }
}

function makeTrace() {
  return {
    nodes: [], edges: [], buffers: [], stops: [], detunes: [],
    counts: Object.create(null), contexts: [], fetchCalls: 0, nodeId: 0
  };
}

function audioContextFactory(trace, initialState) {
  function param(trace, name, node) {
    let value = 0;
    return {
      get value() { return value; },
      set value(next) { value = next; if (name === 'detune') trace.detunes.push(next); },
      setValueAtTime: function(value, time) { this.value = value; node.events.push({ name, value, time }); },
      linearRampToValueAtTime: function(value, time) { this.value = value; node.events.push({ name, value, time }); },
      exponentialRampToValueAtTime: function(value, time) { this.value = value; node.events.push({ name, value, time }); },
      cancelScheduledValues: function(time) { node.events.push({ name: `${name}:cancel`, time }); }
    };
  }
  function node(kind) {
    const item = { _kind: kind, _id: `${kind}-${++trace.nodeId}`, events: [] };
    item.connect = function(destination) {
      trace.edges.push({ from: item._kind, to: destination && destination._kind ? destination._kind : 'destination' });
      return destination;
    };
    item.disconnect = function() {};
    item.start = function(time) { item.startedAt = time == null ? 0 : time; };
    item.stop = function(time) { item.stoppedAt = time == null ? 0 : time; trace.stops.push({ kind, time: item.stoppedAt, node: item }); };
    item.frequency = param(trace, 'frequency', item);
    item.Q = param(trace, 'Q', item);
    item.gain = param(trace, 'gain', item);
    item.detune = param(trace, 'detune', item);
    item.threshold = param(trace, 'threshold', item);
    item.ratio = param(trace, 'ratio', item);
    item.attack = param(trace, 'attack', item);
    item.release = param(trace, 'release', item);
    trace.nodes.push(item);
    trace.counts[kind] = (trace.counts[kind] || 0) + 1;
    return item;
  }
  return function FakeAudioContext() {
    const ctx = this;
    ctx.state = initialState || 'running';
    ctx.currentTime = 0;
    ctx.sampleRate = 100;
    ctx.destination = { _kind: 'destination' };
    ctx.createGain = function() { return node('gain'); };
    ctx.createDynamicsCompressor = function() { return node('compressor'); };
    ctx.createWaveShaper = function() { return node('waveShaper'); };
    ctx.createConvolver = function() { return node('convolver'); };
    ctx.createOscillator = function() { return node('oscillator'); };
    ctx.createBiquadFilter = function() { return node('filter'); };
    ctx.createBufferSource = function() { return node('bufferSource'); };
    ctx.createBuffer = function(channels, length, sampleRate) {
      const buffer = { channels, length, sampleRate, getChannelData: function() { return new Float32Array(length); } };
      trace.buffers.push(buffer);
      return buffer;
    };
    ctx.resume = function() { ctx.state = 'running'; };
    ctx.suspend = function() { ctx.state = 'suspended'; };
    trace.contexts.push(ctx);
  };
}

function runtime(options) {
  const opts = options || {};
  const trace = makeTrace();
  const rootListeners = [];
  const documentListeners = [];
  const root = { addEventListener: function(type, handler, config) { rootListeners.push({ type, handler, config }); } };
  const doc = {
    hidden: false,
    addEventListener: function(type, handler, config) { documentListeners.push({ type, handler, config }); },
    getElementById: function(id) { return id === 'root' ? root : null; },
    createElement: function() { return { style: {}, play: function() { return { catch: function() {} }; }, pause: function() {} }; },
    querySelector: function() { return null; },
    querySelectorAll: function() { return []; }
  };
  let randomIndex = 0;
  const math = Object.create(Math);
  math.random = function() { randomIndex += 1; return (randomIndex % 97) / 96; };
  const hour = opts.hour == null ? 12 : opts.hour;
  function FakeDate() { return { getHours: function() { return hour; } }; }
  FakeDate.now = function() { return 1000; };
  const win = {
    SeymaState: { data: { settings: Object.assign({ premiumAtmosphere: true, uiSounds: true }, opts.settings || {}) } },
    AudioContext: audioContextFactory(trace, opts.state),
    matchMedia: function() { return { matches: !!opts.reducedMotion }; },
    addEventListener: function() {},
    requestAnimationFrame: function() {},
    setTimeout: function() { return 0; },
    clearTimeout: function() {}
  };
  const sandbox = {
    window: win, document: doc, navigator: { vibrate: function() {} },
    Date: FakeDate, Math: math, Float32Array, Number, String, Object, Array, JSON,
    Promise, Error, RegExp, isFinite, isNaN,
    setTimeout: function() { return 0; }, clearTimeout: function() {},
    getComputedStyle: function() { return { position: 'relative' }; },
    fetch: function() { trace.fetchCalls += 1; return Promise.reject(new Error('fixture network forbidden')); }
  };
  vm.runInNewContext(mediaSource, sandbox, { filename: 'app/core/mediaFx.js', timeout: 5000 });
  return { win, trace, root, rootListeners, doc, documentListeners };
}

function soundNodes(trace) { return trace.nodes.filter((node) => node._kind === 'oscillator' || node._kind === 'bufferSource'); }
function near(actual, expected) { return Math.abs(actual - expected) < 0.0001; }

// 1. Master bus graph is the required serial path.
{
  const r = runtime(); r.win.SeyAudio.tap();
  const edges = r.trace.edges;
  group('FX2-14.1 master graph bus → compressor → limiter → destination',
    edges.some((edge) => edge.from === 'gain' && edge.to === 'compressor') &&
    edges.some((edge) => edge.from === 'compressor' && edge.to === 'waveShaper') &&
    edges.some((edge) => edge.from === 'waveShaper' && edge.to === 'destination'));
}

// 2. Reverb impulse is generated in memory, once, with no fetch.
{
  const r = runtime(); r.win.SeyAudio.tap();
  group('FX2-14.2 reverb convolver + kod içi impulse',
    r.trace.counts.convolver === 1 && r.trace.buffers.some((buffer) => buffer.channels === 2 && buffer.length === 90) && r.trace.fetchCalls === 0);
}

// 3. Ten sounds share one master graph setup.
{
  const r = runtime();
  ['tick','tap','toggleOn','toggleOff','nav','sheetOpen','sheetClose','success','bell','warning'].forEach((name) => r.win.SeyAudio[name]());
  group('FX2-14.3 master bus tek kez kurulur', r.trace.counts.compressor === 1 && r.trace.counts.waveShaper === 1 && r.trace.counts.convolver === 1);
}

// 4. 12 taps create 24 voice sources, but reserveVoice fades oldest and holds six.
{
  const r = runtime();
  for (let i = 0; i < 12; i += 1) r.win.SeyAudio.tap();
  const created = soundNodes(r.trace).length;
  const forced = r.trace.stops.filter((entry) => near(entry.time, 0.02)).length;
  group('FX2-14.4 polifoni en çok altı aktif kök tutar', created === 24 && forced === 18 && created - forced <= 6, `created=${created}, forced=${forced}`);
}

// 5. Jittered detune values must actually vary across repeated notes.
{
  const r = runtime();
  for (let i = 0; i < 5; i += 1) r.win.SeyAudio.nav();
  group('FX2-14.5 detune varyasyonu gerçek', new Set(r.trace.detunes.map((value) => value.toFixed(4))).size >= 3);
}

// 6. Fast tick/tap timings stay within their accessibility/performance budgets.
{
  const r = runtime(); r.win.SeyAudio.tap(); r.win.SeyAudio.tick();
  group('FX2-14.6 tap ≤60ms ve tick ≤30ms',
    r.trace.stops.some((entry) => entry.kind === 'oscillator' && entry.time <= 0.06) &&
    r.trace.stops.some((entry) => entry.kind === 'bufferSource' && entry.time > 0.02 && entry.time <= 0.03));
}

// 7. Bell uses the documented inharmonic ratios, not a pure single sine.
{
  const r = runtime(); r.win.SeyAudio.bell();
  const freqs = r.trace.nodes.filter((node) => node._kind === 'oscillator').map((node) => node.frequency.value / 880);
  const expected = [1, 2.76, 5.40, 8.93, 13.34, 18.40];
  group('FX2-14.7 bell altı inharmonik parsiyel taşır', expected.every((ratio) => freqs.some((value) => near(value, ratio))));
}

// 8. Warning must remain a soft triangle and no sawtooth source can return.
{
  const r = runtime(); r.win.SeyAudio.warning();
  const types = r.trace.nodes.filter((node) => node._kind === 'oscillator').map((node) => node.type);
  group('FX2-14.8 warning sawtooth değildir', types.includes('triangle') && !mediaSource.includes('sawtooth'));
}

// 9. Gating matrix: UI audio is independent from quiet time, while voice/ambient are not.
{
  const offPremium = runtime({ settings: { premiumAtmosphere: false, uiSounds: true } });
  ['tap','tick','success','bell'].forEach((name) => offPremium.win.SeyAudio[name]());
  const offUi = runtime({ settings: { premiumAtmosphere: true, uiSounds: false } });
  ['tap','tick','success','bell'].forEach((name) => offUi.win.SeyAudio[name]());
  const reduced = runtime({ reducedMotion: true });
  reduced.win.SeyAudio.tap(); reduced.win.SeyAudio.tick();
  const reducedAfterAllowed = soundNodes(reduced.trace).length;
  reduced.win.SeyAudio.success(); reduced.win.SeyAudio.bell();
  const quiet = runtime({ hour: 23, settings: { voiceGuidance: true, ambientSounds: true } });
  quiet.win.SeyAudio.tap();
  const quietUi = soundNodes(quiet.trace).length > 0;
  const quietVoice = quiet.win.SeyAudio.voice('sessiz zaman');
  const quietAmbient = quiet.win.SeyAudio.ambient.start('rain');
  group('FX2-14.9 gating matrisi (premium/ui/reduce/quiet)',
    soundNodes(offPremium.trace).length === 0 && soundNodes(offUi.trace).length === 0 &&
    reducedAfterAllowed > 0 && soundNodes(reduced.trace).length === reducedAfterAllowed &&
    quietUi && quietVoice === false && quietAmbient === false && quiet.trace.fetchCalls === 0);
}

// 10. Suspended contexts stay silent until the once-only iOS unlock gesture.
{
  const r = runtime({ state: 'suspended' });
  r.win.SeyTouch.install(r.root);
  let threw = false;
  try { r.win.SeyAudio.tap(); } catch (error) { threw = true; }
  const onceUnlock = r.rootListeners.filter((listener) => listener.type === 'pointerdown' && listener.config && listener.config.once === true);
  group('FX2-14.10 iOS suspended sessiz no-op + once kilit', !threw && soundNodes(r.trace).length === 0 && onceUnlock.length === 1);
}

// 11. UI sound path never reaches fetch; sole fetch site belongs to CLOUD_TTS.
{
  const r = runtime(); ['tap','success','bell','warning'].forEach((name) => r.win.SeyAudio[name]());
  group('FX2-14.11 UI ses yolunda ağ yok', (mediaSource.match(/\bfetch\s*\(/g) || []).length === 1 && r.trace.fetchCalls === 0);
}

// 12. I2 external API names stay available.
{
  const r = runtime();
  const required = ['tap','success','warning','bell','voice','speakLocal','isVoiceEnabled','isQuietTime','isAudible','greeting','guides','ambient','ctx'];
  group('FX2-14.12 I2 ses API yüzeyi korundu', required.every((name) => name in r.win.SeyAudio));
}

console.log(`Passed: ${passed} / ${passed + failed}`);
if (failed) process.exit(1);
