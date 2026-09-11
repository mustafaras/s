'use strict';

// FX2-10 — Dokunma kapsamı fixture'ı.
// Gerçek app/core/mediaFx.js VM'de, ağ/browser/localStorage olmadan yüklenir.

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const appSource = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
// MON-26/MON-27/MON-28/MON-36: domain gövdeleri registry'lerinde; onclick sayımları
// birleşik kaynakta yapılır (App handler atamaları app.js'te kalır).
const motivationSource = fs.readFileSync(path.join(repoRoot, 'app/core/motivation.js'), 'utf8');
const crisisSource = fs.readFileSync(path.join(repoRoot, 'app/core/crisis.js'), 'utf8');
const journalSource = fs.readFileSync(path.join(repoRoot, 'app/core/journal.js'), 'utf8');
const healthSource = fs.readFileSync(path.join(repoRoot, 'app/core/health.js'), 'utf8');
const librarySource = fs.readFileSync(path.join(repoRoot, 'app/core/library.js'), 'utf8');
const reportSource = fs.readFileSync(path.join(repoRoot, 'app/core/report.js'), 'utf8');
const mapSource = fs.readFileSync(path.join(repoRoot, 'app/core/map.js'), 'utf8');
const profileSource = fs.readFileSync(path.join(repoRoot, 'app/core/profile.js'), 'utf8');
const combinedSource = appSource + motivationSource + crisisSource + journalSource + healthSource + librarySource + reportSource + mapSource + profileSource;
const mediaSource = fs.readFileSync(path.join(repoRoot, 'app/core/mediaFx.js'), 'utf8');
let passed = 0;
let failed = 0;

function group(name, condition, detail) {
  if (condition) {
    passed += 1;
    console.log(`PASS ${name}`);
  } else {
    failed += 1;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function classList() {
  const values = new Set();
  return {
    add: (value) => values.add(value),
    remove: (value) => values.delete(value),
    contains: (value) => values.has(value)
  };
}

function target(options) {
  const settings = options || {};
  const classes = classList();
  const element = {
    dataset: settings.fx ? { fx: settings.fx } : {},
    disabled: false,
    style: {},
    className: settings.className || '',
    classList: classes,
    appendCount: 0,
    appendChild: function() { this.appendCount += 1; },
    getAttribute: function(name) { return (settings.attributes || {})[name] || null; },
    getBoundingClientRect: function() {
      return { left: 0, top: 0, width: settings.width == null ? 48 : settings.width, height: settings.height == null ? 48 : settings.height };
    },
    matches: function() { return false; }
  };
  element.closest = function() { return element; };
  return element;
}

function audioContextFactory(counter, initialState) {
  function audioNode() {
    return {
      connect: function() {},
      start: function() {},
      stop: function() {},
      frequency: { setValueAtTime: function() {} },
      gain: { setValueAtTime: function() {}, linearRampToValueAtTime: function() {}, exponentialRampToValueAtTime: function() {} }
    };
  }
  return function FakeAudioContext() {
    counter.created += 1;
    counter.contexts.push(this);
    this.state = initialState || 'running';
    this.currentTime = 0;
    this.sampleRate = 44100;
    this.destination = {};
    this.createOscillator = audioNode;
    this.createGain = audioNode;
    this.createBuffer = function(channels, length) {
      counter.buffers += 1;
      return { getChannelData: function() { return new Float32Array(length); } };
    };
    this.createBufferSource = function() {
      counter.bufferSources += 1;
      return audioNode();
    };
    this.resume = function() { counter.resumes += 1; this.state = 'running'; };
    this.suspend = function() { counter.suspends += 1; this.state = 'suspended'; };
  };
}

function loadMediaFx(options) {
  const opts = options || {};
  const rootListeners = [];
  const windowListeners = [];
  const documentListeners = [];
  const root = {
    addEventListener: function(type, handler, config) { rootListeners.push({ type, handler, config }); }
  };
  const document = {
    hidden: false,
    addEventListener: function(type, handler, config) { documentListeners.push({ type, handler, config }); },
    getElementById: function(id) { return id === 'root' ? root : null; },
    createElement: function() {
      return { className: '', style: {}, classList: classList(), addEventListener: function() {}, remove: function() {} };
    },
    querySelectorAll: function() { return []; },
    querySelector: function() { return null; }
  };
  const clock = { now: 1000 };
  const audio = { created: 0, contexts: [], buffers: 0, bufferSources: 0, resumes: 0, suspends: 0 };
  const win = {
    SeymaState: { data: { settings: opts.settings || {} } },
    matchMedia: function() { return { matches: !!opts.reducedMotion }; },
    addEventListener: function(type, handler, config) { windowListeners.push({ type, handler, config }); },
    AudioContext: audioContextFactory(audio, opts.audioState),
    requestAnimationFrame: function() {},
    setTimeout: function() { return 0; },
    clearTimeout: function() {}
  };
  const context = vm.createContext({
    window: win,
    document,
    navigator: { vibrate: function() { return true; } },
    Date: { now: function() { return clock.now; } },
    Math,
    Number,
    String,
    Object,
    Array,
    JSON,
    setTimeout: win.setTimeout,
    clearTimeout: win.clearTimeout,
    getComputedStyle: function() { return { position: opts.position || 'relative' }; }
  });
  vm.runInContext(mediaSource, context, { timeout: 5000 });
  return { win, root, rootListeners, windowListeners, documentListeners, document, clock, audio };
}

function pointerDown(runtime, element) {
  const down = runtime.rootListeners.find((listener) => listener.type === 'pointerdown' && listener.config && listener.config.capture && !listener.config.once);
  if (!down) return false;
  runtime.clock.now += 100;
  down.handler({ pointerType: 'touch', target: element, clientX: 10, clientY: 10 });
  return true;
}

function count(pattern, source) {
  return (source.match(pattern) || []).length;
}

// 1. Katman API'si gerçek modülden gelir.
const apiRuntime = loadMediaFx();
group(
  'FX2-10.1 SeyTouch katmanı var',
  !!apiRuntime.win.SeyTouch &&
    typeof apiRuntime.win.SeyTouch.install === 'function' &&
    typeof apiRuntime.win.SeyTouch.SELECTOR === 'string' &&
    apiRuntime.win.SeyTouch._installed === false
);

// 2. İkinci kurulum dinleyici eklemez.
const idempotentRuntime = loadMediaFx();
const firstInstall = idempotentRuntime.win.SeyTouch.install(idempotentRuntime.root);
const firstListenerCount = idempotentRuntime.rootListeners.length + idempotentRuntime.windowListeners.length + idempotentRuntime.documentListeners.length;
const secondInstall = idempotentRuntime.win.SeyTouch.install(idempotentRuntime.root);
const secondListenerCount = idempotentRuntime.rootListeners.length + idempotentRuntime.windowListeners.length + idempotentRuntime.documentListeners.length;
group('FX2-10.2 install idempotent', firstInstall && secondInstall && firstListenerCount === 6 && secondListenerCount === firstListenerCount);

// 3. Seçici bütün zorunlu etkileşim türlerini kapsar.
const selector = apiRuntime.win.SeyTouch.SELECTOR;
group('FX2-10.3 seçici kapsamı', ['button', '[role="button"]', '[data-fx]', '[onclick]'].every((part) => selector.includes(part)));

// 4. Statik butonların tamamı button seçicisiyle kapsanır.
const buttons = count(/<button\b/gi, appSource);
const staticCoverage = buttons && selector.includes('button') ? 100 : 0;
group('FX2-10.4 statik dokunma kapsamı >= %95', staticCoverage >= 95, `buton=${buttons}, kapsam=%${staticCoverage}`);

// 5. Dokunma katmanı kaydırmayı iptal etmez.
const touchBlock = mediaSource.slice(mediaSource.indexOf('var TOUCH_SELECTOR'));
group('FX2-10.5 SeyTouch preventDefault kullanmaz', !/preventDefault\s*\(/.test(touchBlock));

// 6. FX2-13 kilit açma dahil root/window dinleyicileri passive'dir.
group(
  'FX2-10.6 beş passive dokunma dinleyicisi var',
  count(/\.addEventListener\(/g, touchBlock) === 6 && count(/passive\s*:\s*true/g, touchBlock) === 5
);

// 7. Premium kapalıyken erişilebilir basma durumu kalır; ses/ripple üretimi yoktur.
const offRuntime = loadMediaFx({ settings: { premiumAtmosphere: false, uiSounds: true } });
offRuntime.win.SeyTouch.install(offRuntime.root);
const offElement = target();
const offDown = pointerDown(offRuntime, offElement);
group(
  'FX2-10.7 premium kapalıyken basma erişilebilir, FX sessiz',
  offDown && offElement.classList.contains('sey-press') && offRuntime.audio.created === 0 && offElement.appendCount === 0
);

// 8. Reduced-motion ripple'ı susturur, ancak bilinçli tap sesi devam eder.
const reduceRuntime = loadMediaFx({ settings: { premiumAtmosphere: true, uiSounds: true }, reducedMotion: true });
reduceRuntime.win.SeyTouch.install(reduceRuntime.root);
const reduceElement = target();
const reduceDown = pointerDown(reduceRuntime, reduceElement);
group(
  'FX2-10.8 reduced-motion ripple yok, tap sesi var',
  reduceDown && reduceRuntime.audio.created === 1 && reduceElement.appendCount === 0
);

// 9. FX2 dokunuşları eski App yüzeyini değiştirmez.
const handlers = new Set((appSource.match(/App\.[A-Za-z0-9_]+\s*=[^=]/g) || []).map((value) => value.match(/App\.[A-Za-z0-9_]+/)[0]));
group('FX2-10.9 App ve onclick sözleşmesi (FX2-15 + _goTimer)', handlers.size === 718 && count(/onclick=/g, combinedSource) === 391);

// 10. Yüksek değerli niyetler sözlükte bulunur; none erken dönüşle sessizdir.
const intentBody = (mediaSource.match(/var FX_INTENT\s*=\s*\{([\s\S]*?)\n\s*\};/) || [])[1] || '';
const intentKeys = new Set([...intentBody.matchAll(/^\s*([a-z]+)\s*:/gm)].map((match) => match[1]));
const fxValues = [...new Set([...combinedSource.matchAll(/data-fx="([a-z]+)"/g)].map((match) => match[1]))];
group(
  'FX2-10.10 niyet haritası bağlı',
  count(/data-fx="[a-z]+"/g, combinedSource) >= 40 &&
    fxValues.length >= 6 &&
    fxValues.every((value) => intentKeys.has(value)) &&
    /if\s*\(k\s*===\s*'none'\)\s*return\s+null;/.test(mediaSource) &&
    /var it\s*=\s*intentFor\(el\);\s*if\s*\(!it\)\s*return;/.test(mediaSource)
);

// 11. Gerçek ripple ölçüsüz hedefi atlar ve static konumu güvenle düzeltir.
const rippleRuntime = loadMediaFx({ settings: { premiumAtmosphere: true }, position: 'static' });
const tiny = target({ width: 7, height: 7 });
rippleRuntime.win.SeyFx.ripple({ currentTarget: tiny, clientX: 1, clientY: 1 });
const staticElement = target({ width: 48, height: 48 });
rippleRuntime.win.SeyFx.ripple({ currentTarget: staticElement, clientX: 1, clientY: 1 });
group('FX2-10.11 ripple ölçü ve position güvenliği', tiny.appendCount === 0 && staticElement.appendCount === 1 && staticElement.style.position === 'relative');

// 12. Boot'ta tek bağlama vardır ve render gövdesi bunun dışında kalır.
group(
  'FX2-10.12 boot bağlantısı render dışında ve tek',
  count(/window\.SeyTouch\.install\(/g, appSource) === 1 &&
    /\nrender\(\);\s*\ntry\{\s*if\(window\.SeyTouch[\s\S]{0,140}?SeyTouch\.install\(/.test(appSource)
);

// 13. FX2-13: ilk pointer jesti tek seferlik sessiz buffer ile iOS sesini açar.
const iosRuntime = loadMediaFx({ settings: { premiumAtmosphere: true, uiSounds: true }, audioState: 'suspended' });
iosRuntime.win.SeyTouch.install(iosRuntime.root);
const unlock = iosRuntime.rootListeners.find((listener) => listener.type === 'pointerdown' && listener.config && listener.config.once === true);
const touch = iosRuntime.rootListeners.find((listener) => listener.type === 'pointerdown' && listener.config && listener.config.capture && !listener.config.once);
unlock.handler();
group(
  'FX2-13.1 iOS kilit açma once + sessiz buffer',
  !!unlock && !!touch && iosRuntime.rootListeners.indexOf(unlock) < iosRuntime.rootListeners.indexOf(touch) &&
    iosRuntime.win.SeyAudio._unlocked === true && iosRuntime.audio.created === 1 &&
    iosRuntime.audio.resumes === 1 && iosRuntime.audio.buffers === 1 && iosRuntime.audio.bufferSources === 1 &&
    iosRuntime.win.SeyAudio.isAudible() === true
);

// 14. Gizlenen sekme ambiyansı durdurur/bağlamı askıya alır; önceden açılmış
// bağlam görünür dönüşte sürdürülür.
let ambientStops = 0;
iosRuntime.win.SeyAudio.ambient = { isPlaying: function() { return true; }, stop: function() { ambientStops += 1; } };
const visibility = iosRuntime.documentListeners.find((listener) => listener.type === 'visibilitychange');
iosRuntime.document.hidden = true;
visibility.handler();
const suspended = iosRuntime.audio.suspends === 1 && ambientStops === 1;
iosRuntime.document.hidden = false;
visibility.handler();
group('FX2-13.2 visibility suspend/resume yönetimi', !!visibility && suspended && iosRuntime.audio.resumes === 2);

console.log(`Passed: ${passed} / ${passed + failed}`);
if (failed > 0) process.exit(1);
