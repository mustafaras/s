#!/usr/bin/env node
'use strict';

// IIP-22 capability spike + regression fixture. Entirely synthetic: no browser,
// network, localStorage, token, personal JSON, or real CacheStorage is used.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = require('../repo-root');
const swSource = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

class SyntheticResponse {
  constructor(body, init) { this.body = body; this.status = init && init.status || 200; }
  clone() { return new SyntheticResponse(this.body, { status: this.status }); }
}
class SyntheticRequest {
  constructor(url, init) { this.url = String(url); this.method = init && init.method || 'GET'; this.mode = init && init.mode || 'same-origin'; }
}

function cacheStorage(options) {
  options = options || {};
  const stores = new Map();
  function store(name) {
    if (!stores.has(name)) stores.set(name, new Map());
    const map = stores.get(name);
    return {
      async addAll(urls) {
        for (let i = 0; i < urls.length; i++) {
          if (options.failAddAt === i) throw Object.assign(new Error('synthetic interrupted download'), { name: 'NetworkError' });
          map.set(String(urls[i]), new SyntheticResponse('asset:' + urls[i]));
        }
      },
      async keys() { return Array.from(map.keys()).map(url => new SyntheticRequest(url)); },
      async match(request) { return map.get(typeof request === 'string' ? request : request.url); },
      async put(request, response) {
        if (options.failPut) throw Object.assign(new Error('synthetic quota'), { name: 'QuotaExceededError' });
        map.set(typeof request === 'string' ? request : request.url, response.clone());
      }
    };
  }
  return {
    _stores: stores,
    _options: options,
    async open(name) { return store(name); },
    async keys() { return Array.from(stores.keys()); },
    async delete(name) {
      if (options.undeletable && name === options.undeletable) return false;
      return stores.delete(name);
    },
    async match(request, config) {
      const cache = config && config.cacheName ? stores.get(config.cacheName) : null;
      return cache && cache.get(typeof request === 'string' ? request : request.url);
    }
  };
}

function loadSw(options) {
  const listeners = {};
  const messages = [];
  const sandbox = {
    console, URL, Promise, Object, Array, String, Number, Boolean, RegExp, Error,
    Set, Map, JSON, Date, Request: SyntheticRequest, Response: SyntheticResponse,
    caches: cacheStorage(options), clients: { claim: async () => {}, matchAll: async () => [], openWindow: async () => null },
    self: {
      location: { origin: 'https://example.test', pathname: '/s/sw.js' },
      registration: { scope: 'https://example.test/s/', showNotification: async () => {} },
      addEventListener(type, fn) { listeners[type] = fn; },
      skipWaiting() { messages.push('skipWaiting'); }
    }
  };
  sandbox.globalThis = sandbox.self;
  vm.runInContext(swSource, vm.createContext(sandbox), { filename: 'sw.js' });
  return { sandbox, listeners, messages, caches: sandbox.caches };
}

let passed = 0;
function test(name, fn) {
  return Promise.resolve().then(fn).then(() => {
    passed++; console.log('PASS  ' + name);
  }, error => {
    console.error('FAIL  ' + name + ' — ' + error.message);
    process.exitCode = 1;
  });
}

(async function () {
  const base = loadSw();
  await test('capability spike API ve sürümlü manifesti sağlar', () => {
    assert.equal(typeof base.sandbox.swManifestDescriptor, 'function');
    const descriptor = base.sandbox.swManifestDescriptor();
    assert.match(descriptor.version, /^iip22-/);
    assert.ok(descriptor.entries.length > 20);
    assert.ok(descriptor.estimatedBytes > 0 && descriptor.estimatedBytes <= 10 * 1024 * 1024);
    assert.equal(new Set(Array.from(descriptor.entries)).size, descriptor.entries.length);
  });
  await test('manifest yalnız aynı-origin genel kabuk/içeriktir', () => {
    const entries = Array.from(base.sandbox.swManifestDescriptor().entries);
    assert.ok(entries.includes('./index.html') && entries.some(item => item.startsWith('./app/styles.css?v=')));
    assert.ok(entries.some(item => item.includes('app/content/quranStrikingVersesV1.js')));
    assert.ok(entries.every(item => !/data\/|panel|token|auth|video|latest\.json|observer/i.test(item)));
  });
  await test('index çalışma zamanı varlıkları offline allowlist ile birebir eşleşir', () => {
    const entries = new Set(Array.from(base.sandbox.swManifestDescriptor().entries).map(item => item.replace(/^\.\//, '')));
    const runtimeAssets = Array.from(indexSource.matchAll(/(?:src|href)="([^"#]+\?v=[^"]+)"/g))
      .map(match => match[1])
      // Panel manifesti kişisel gözlem yüzeyine aittir ve IIP-22 sözleşmesi
      // gereği kontrollü genel offline paketine bilinçli olarak alınmaz.
      .filter(item => !item.startsWith('panel/'));
    assert.deepEqual(runtimeAssets.filter(item => !entries.has(item)), []);
  });
  await test('tokenlı, kişisel, panel, video ve dış URL cache dışıdır', () => {
    const key = base.sandbox.swOfflineRequestKey;
    assert.equal(key(new SyntheticRequest('https://example.test/s/index.html?token=secret')), '');
    assert.equal(key(new SyntheticRequest('https://example.test/s/data/latest.json')), '');
    assert.equal(key(new SyntheticRequest('https://example.test/s/panel.html')), '');
    assert.equal(key(new SyntheticRequest('https://example.test/s/movie.mp4')), '');
    assert.equal(key(new SyntheticRequest('https://api.example.org/content')), '');
    assert.equal(key(new SyntheticRequest('https://example.test/s/app.js?v=20260924c')), 'https://example.test/s/app.js?v=20260924c');
  });
  await test('install atomiktir; kesik indirme geçici cache bırakmaz', async () => {
    const runtime = loadSw({ failAddAt: 2 });
    await assert.rejects(runtime.sandbox.swInstallOfflinePackage(), /interrupted/);
    assert.deepEqual((await runtime.caches.keys()).filter(name => name.includes('temp')), []);
  });
  await test('kota hatası yeni paketi bırakmaz ve eski sürümü korur', async () => {
    const runtime = loadSw();
    const old = await runtime.caches.open('seyma-offline-v1-iip22-old');
    await old.put('./index.html', new SyntheticResponse('old'));
    runtime.caches._options.failPut = true;
    await assert.rejects(runtime.sandbox.swInstallOfflinePackage(), /quota/);
    const names = await runtime.caches.keys();
    assert.ok(names.includes('seyma-offline-v1-iip22-old'));
    assert.ok(!names.includes(runtime.sandbox.swManifestDescriptor().cacheName));
  });
  await test('eski sürüme dönüş exact allowlist isteğini kullanıma açık tutar', async () => {
    const runtime = loadSw();
    const old = await runtime.caches.open('seyma-offline-v1-iip22-old');
    const url = 'https://example.test/s/app.js?v=20260924c';
    await old.put(url, new SyntheticResponse('old-shell'));
    const response = await runtime.sandbox.swMatchOfflineRequest(new SyntheticRequest(url));
    assert.equal(response.body, 'old-shell');
  });
  await test('kaldırılamayan cache raporlanır ama kaldırma akışı kilitlenmez', async () => {
    const runtime = loadSw({ undeletable: 'seyma-offline-v1-iip22-stuck' });
    await runtime.caches.open('seyma-offline-v1-iip22-stuck');
    await runtime.caches.open('seyma-offline-v1-iip22-old');
    const result = await runtime.sandbox.swRemoveOfflinePackage();
    assert.equal(result.status, 'partial');
    assert.deepEqual(Array.from(result.failed), ['seyma-offline-v1-iip22-stuck']);
  });
  await test('başarılı install paketi atomik kurar; yeni SW yarışı skipWaiting veya zorla reload üretmez', async () => {
    let installTask;
    base.listeners.install({ waitUntil(task) { installTask = task; } });
    await installTask;
    const status = await base.sandbox.swOfflineStatus();
    assert.equal(status.status, 'ready');
    assert.deepEqual(base.messages, []);
    assert.doesNotMatch(indexSource, /controllerchange[\s\S]{0,200}(reload|location\s*=)/);
    assert.doesNotMatch(indexSource, /\.skipWaiting\s*\(/);
  });
  await test('kalıcı yüzen Offline paneli kaldırılır; güvenli SW kaydı korunur', () => {
    for (const token of ['sey-offline-tools', 'sey-offline-panel', 'Offline araçları', 'Offline paketi kaldır']) assert.ok(!indexSource.includes(token), token);
    assert.match(indexSource, /navigator\.serviceWorker\.register\('sw\.js\?v=20260924e'\)/);
    assert.doesNotMatch(indexSource, /SEYMA_OFFLINE_(?:STATUS|INSTALL|REMOVE)/);
  });
  await test('fetch politikası geniş runtime cache yakalaması yapmaz', () => {
    assert.doesNotMatch(swSource, /cache\.put\s*\([^)]*event\.request/);
    assert.doesNotMatch(swSource, /respondWith\s*\([^;]*(?:fetch\s*\(|\.add\s*\()/);
    assert.match(swSource, /swOfflineRequestKey/);
    assert.match(swSource, /swNetworkFirstNavigation/);
    assert.match(swSource, /event\.request\.mode === 'navigate'/);
    assert.doesNotMatch(swSource, /swNetworkFirstNavigation[\s\S]{0,500}cache\.put/);
  });
  await test('aktif sayaç/not durumu SW güncellemesinden bağımsızdır', () => {
    const registrationBlock = indexSource.slice(indexSource.indexOf("navigator.serviceWorker.register('sw.js?v=20260924e')"));
    assert.doesNotMatch(registrationBlock, /location\.reload|skipWaiting/);
    assert.doesNotMatch(indexSource, /controllerchange/);
    assert.doesNotMatch(indexSource, /sey-offline-tools/);
  });
  if (process.exitCode) process.exit(1);
  console.log('\nPASS: IIP-22 ' + passed + '/12');
}());
