#!/usr/bin/env node
// Ağsız, anahtarsız ÆON panel demosu. Yalnızca sentetik panel HTML'ini sunar;
// uygulama dosyaları, GitHub API ve dış CDN bağlantıları erişilemez.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = process.env.SEYMA_REPO || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const port = Number(process.env.PORT || 8766);

function demoHTML() {
  let html = fs.readFileSync(path.join(repo, 'panel.html'), 'utf8');
  html = html
    .replace('<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>\n', '')
    .replace('<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>\n', '')
    .replace('var DEMO_MODE=qs.get("demo")==="1";', 'var DEMO_MODE=true;');
  const csp = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; img-src data: blob:; connect-src \'none\'; media-src blob: data:; object-src \'none\'">';
  return html.replace('</head>', csp + '\n</head>');
}

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url || '/', 'http://127.0.0.1').pathname;
  if (req.method !== 'GET' || (pathname !== '/' && pathname !== '/index.html')) {
    res.writeHead(pathname === '/' ? 405 : 404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bu sunucu yalnızca ağsız ÆON demo panelini sunar.');
    return;
  }
  const body = Buffer.from(demoHTML());
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`ÆON güvenli demo: http://127.0.0.1:${port}/`);
  console.log('Sentetik veri · token yok · connect-src none · diğer rotalar 404');
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
