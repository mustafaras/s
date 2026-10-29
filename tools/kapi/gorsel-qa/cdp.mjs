// Disposable-profile Chrome driven over CDP pipe. No listening socket, no network:
// http://127.0.0.1:9000/* is fulfilled from a local directory, everything else is failed.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

// KAO_QA_CHROME: başka makinede/konteynerde Chrome yolu; KAO_QA_NO_SANDBOX=1: root konteynerinde (yalnız boş geçici profil).
const CHROME = process.env.KAO_QA_CHROME || `${os.homedir()}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const ORIGIN = 'http://127.0.0.1:9000';
const MIME = { html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', json: 'application/json', png: 'image/png', svg: 'image/svg+xml', webmanifest: 'application/manifest+json' };

// `insets` (K3PD-29): sentetik güvenli alan alt inseti. Chrome `env(safe-area-inset-bottom)`i
// gerçekten hesaplar; değer manifestte ve ölçümde doğrulanır. Verilmezse davranış eskisi gibi.
// `scale`: deviceScaleFactor (varsayılan 2 = Retina çekim). Yalnız görüntü ölçeğini etkiler.
export async function launch(root, profileDir, { width = 390, height = 844, insets = null, scale = 2, sourceInventory = null } = {}) {
  fs.mkdirSync(profileDir, { recursive: true });
  const realRoot = fs.realpathSync(root);
  const child = spawn(CHROME, [...(process.env.KAO_QA_NO_SANDBOX === '1' ? ['--no-sandbox'] : []), '--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--remote-debugging-pipe',
    `--user-data-dir=${profileDir}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] });
  const wIn = child.stdio[3], rOut = child.stdio[4];
  let id = 0, buf = '';
  const pending = new Map(), listeners = [];
  rOut.on('data', (d) => {
    buf += d.toString('utf8');
    let i;
    while ((i = buf.indexOf('\0')) >= 0) {
      const msg = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1);
      if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.rej(new Error(JSON.stringify(msg.error))) : p.res(msg.result); }
      else listeners.forEach((l) => l(msg));
    }
  });
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
    const n = ++id; pending.set(n, { res, rej });
    wIn.write(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) }) + '\0');
  });
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const cmd = (m, p) => send(m, p, sessionId);
  const blocked = [];
  listeners.push(async (msg) => {
    if (msg.method !== 'Fetch.requestPaused' || msg.sessionId !== sessionId) return;
    const { requestId, request } = msg.params;
    const u = new URL(request.url);
    if (u.origin === ORIGIN) {
      const rel = decodeURIComponent(u.pathname).replace(/^\/+/, '') || 'index.html';
      const file = path.resolve(realRoot, rel);
      const relative = path.relative(realRoot, file);
      const inside = relative && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
      const realFile = inside && fs.existsSync(file) ? fs.realpathSync(file) : null;
      const realRelative = realFile && path.relative(realRoot, realFile);
      const realInside = realRelative && realRelative !== '..' && !realRelative.startsWith(`..${path.sep}`) && !path.isAbsolute(realRelative);
      if (realInside && fs.statSync(realFile).isFile()) {
        const ext = file.split('.').pop();
        const bytes = fs.readFileSync(realFile);
        if (sourceInventory) {
          const sha = crypto.createHash('sha256').update(bytes).digest('hex');
          if (sourceInventory.files[rel] && sourceInventory.files[rel] !== sha) sourceInventory.conflicts.push(rel);
          sourceInventory.files[rel] = sha;
        }
        return cmd('Fetch.fulfillRequest', { requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: MIME[ext] || 'application/octet-stream' }, { name: 'Cache-Control', value: 'no-store' }], body: bytes.toString('base64') });
      }
      return cmd('Fetch.fulfillRequest', { requestId, responseCode: 404, body: '' });
    }
    if (!request.url.startsWith('data:') && !request.url.startsWith('blob:')) blocked.push(request.url);
    return cmd('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' });
  });
  await cmd('Page.enable'); await cmd('Runtime.enable');
  await cmd('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  await cmd('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: true });
  let safeAreaApplied = null;
  if (insets) {
    try {
      await cmd('Emulation.setSafeAreaInsetsOverride', { insets: { top: insets.top || 0, left: insets.left || 0, bottom: insets.bottom || 0, right: insets.right || 0 } });
      safeAreaApplied = { top: insets.top || 0, left: insets.left || 0, bottom: insets.bottom || 0, right: insets.right || 0 };
    } catch (error) {
      throw new Error(`safe-area insets istendi ama CDP reddetti: ${error && error.message ? error.message : error}`);
    }
  }
  const api = {
    blocked,
    safeAreaApplied,
    async goto(url) { await cmd('Page.navigate', { url }); await new Promise((r) => setTimeout(r, 1800)); },
    async eval(expr) { const r = await cmd('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval error'); return r.result.value; },
    async tab({ shift = false } = {}) {
      const key = { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9, modifiers: shift ? 8 : 0 };
      await cmd('Input.dispatchKeyEvent', { type: 'keyDown', ...key });
      await cmd('Input.dispatchKeyEvent', { type: 'keyUp', ...key });
    },
    // K3PD-29: biçim/ölçek seçilebilir. Üretim kodundaki hiçbir şey değişmez; yalnız çekim
    // çıktısının biçimi. WebP, UI ekran görüntülerinde PNG'ye göre ~%85 küçük; kanıt deposu
    // makul boyutta kalırken metin keskinliği korunur.
    async shot(file, { format = 'png', quality } = {}) {
      const params = { format };
      if (format === 'webp' && Number.isFinite(quality)) params.quality = quality;
      const r = await cmd('Page.captureScreenshot', params);
      fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
    },
    // Okunabilir kırpım (K3PD-29 glif kanıtı): viewport koordinatlarında clip.
    async shotClip(file, clip, captureScale = 2, { format = 'png', quality } = {}) {
      const params = { format, clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height, scale: captureScale } };
      if (format === 'webp' && Number.isFinite(quality)) params.quality = quality;
      const r = await cmd('Page.captureScreenshot', params);
      fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
    },
    async wait(ms) { await new Promise((r) => setTimeout(r, ms)); },
    // K3PD-29: uzun tek parça görüntü için görüntü alanını geçici olarak büyüt.
    // Headless Chrome yalnız görüntü alanı yüksekliği kadar boyar; 30 satırlık glif sayfası
    // viewport'ta kalırsa alt satırlar BOŞ çıkar. Yüksekliği sayfaya eşitleyip boyatıyoruz.
    async setViewportSize(w, h) {
      await cmd('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: scale, mobile: true });
      if (insets) {
        await cmd('Emulation.setSafeAreaInsetsOverride', { insets: { top: insets.top || 0, left: insets.left || 0, bottom: insets.bottom || 0, right: insets.right || 0 } });
      }
    },
    async close() { try { await send('Browser.close'); } catch {} child.kill(); }
  };
  return api;
}
