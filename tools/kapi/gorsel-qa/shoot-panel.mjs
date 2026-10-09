// usage: node shoot-panel.mjs <root> <outDir> <profileName> [width]
// panel.html ve panel-v2.html için YALNIZ ilk açılış (token yok) görünümü. Token/parola alanlarına dokunulmaz, doldurulmaz;
// dış istekler kesik olduğundan canlı veri yoktur. Sentetik-boş durum kanıtıdır, panelin veri görünümü doğrulanmış olmaz.
import { launch } from './cdp.mjs';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
const [root, out, prof, widthArg] = process.argv.slice(2);
const width = Number(widthArg) || 390;
fs.mkdirSync(out, { recursive: true });
const b = await launch(root, path.join(os.tmpdir(), prof), { width, height: 844 });
const log = [];
for (const page of ['panel.html', 'panel-v2.html']) {
  try {
    await b.goto(`http://127.0.0.1:9000/${page}`);
    await b.wait(1500);
    const info = await b.eval(`(function(){var de=document.documentElement;return {sw:de.scrollWidth,w:innerWidth,h:de.scrollHeight,text:document.body.innerText.replace(/\\s+/g,' ').slice(0,160)}})()`);
    const steps = Math.min(4, Math.max(1, Math.ceil(info.h / 844)));
    for (let i = 0; i < steps; i += 1) {
      await b.eval(`window.scrollTo(0,${i * 800})`); await b.wait(300);
      await b.shot(path.join(out, `${page.replace('.html', '')}-${i + 1}.png`));
    }
    log.push(`${page} @${width}px: sw=${info.sw} w=${info.w} yatayTaşma=${info.sw > info.w + 1} · ${steps} görüntü · ${info.text}`);
  } catch (e) { log.push(`${page}: SKIP ${String(e.message).slice(0, 140)}`); }
}
fs.writeFileSync(path.join(out, 'log.txt'), log.join('\n') + '\n');
console.log(log.join('\n'));
await b.close();
