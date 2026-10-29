#!/usr/bin/env node
// K3PD-29 · Görsel QA kanıt sözleşmesi — manifest satırı, sayım/hash/tema doğrulaması ve
// 30 zor glif dizisi seçimi.
//
// Neden ayrı dosya: F-11'in kök nedeni, çekim aracının ürettiği görüntü ile "kanıt" diye
// raporlanan sayıların birbirine bağlı olmamasıydı (6 log × 74 = 444 kayıt, 474 kaydın aynı
// kapsamda olduğu iddiası). Burada tek kural var: HER görüntü için TEK manifest satırı ve
// satırdaki sha256 diskin gerçek baytıyla eşleşmek zorunda. Eksik satır, fazla dosya, yanlış
// hash veya yanlış tema = hata (fail-closed).
//
// Bu modül tarayıcı açmaz, ağa çıkmaz, üretim dosyası yazmaz. Sadece:
//   • manifest satırı biçimini ve doğrulamasını tanımlar,
//   • doğrulanmış içerikten deterministik 30 zor glif dizisi seçer,
//   • `--dogrula` / `--glif-liste` / `--negatif-test` CLI'larını sunar.
//
// Kullanım (repo kökünden):
//   node tools/kapi/gorsel-qa/gorsel-qa-manifest.mjs --glif-liste
//   node tools/kapi/gorsel-qa/gorsel-qa-manifest.mjs --dogrula <kanit-dizini>
//   node tools/kapi/gorsel-qa/gorsel-qa-manifest.mjs --negatif-test
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

// ── Manifest şeması ────────────────────────────────────────────────────────────────────────────
// Kart: "her görüntü için tek manifest satırı, profil/tema/viewport/sahne/screenshot/log/issues/hash".
export const ROW_FIELDS = Object.freeze([
  'profile',      // 'ana' | 'onboarding' | 'glif'
  'theme',        // 'light' | 'dark'  (App.setTheme(false|true) ile SABİTLENİR)
  'viewport',     // { width, height, safeAreaBottom }
  'captureScale', // görüntünün piksel genişliği ÷ viewport genişliği (ölçülür, yazılmaz)
  'scene',        // sahne kimliği (gerçek rota/oynatıcı aşaması)
  'sceneKind',    // 'view' | 'lesson' | 'onboarding' | 'practice' | 'feedback' | 's0' | 'mastery'
  'screenshot',   // kanıt dizinine göre yol
  'log',          // o görüntünün log satırı
  'issues',       // sahne taramasının bulduğu bilgi/hata satırları
  'sha256',       // screenshot dosyasının gerçek SHA-256'sı
]);

export const REQUIRED_ROW_FIELDS = ROW_FIELDS;

// Tema doğrulaması: etiket değil, computed değer. `app/styles.css` iki temanın da
// --quran-surface / --quran-ink tokenlarını tanımlar; root data-theme bunları seçer.
export const THEME_TOKENS = Object.freeze({
  light: { dataTheme: 'light', surface: '#F7F5EE', ink: '#172B45' },
  dark: { dataTheme: 'dark', surface: '#151C28', ink: '#E8EBF2' },
});

export function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

// Bir görüntünün EN AZ bu kadar bayt olması beklenir. 0 baytlık (veya yarısı yazılmış)
// bir çekim hash/sayım eşliğini "sağlar": sha256('') da geçerli bir 64 hanelik hash'tir.
// Bu yüzden boyut tek başına denetlenir (denetim bulgusu F3).
export const MIN_IMAGE_BYTES = 4096;

/**
 * WebP/PNG başlığından GERÇEK piksel boyutu. Kanıtın kendisi ölçülür: `captureScale`
 * manifeste yazılan bir sayı değil, görüntünün piksel yüksekliğinden geri hesaplanan
 * bir sonuçtur (denetim bulgusu F5 — "2 ≠ 2" totolojisi).
 * Bilinmeyen biçimde `{ ok:false }` döner; çağıran fail-closed davranır.
 */
export function imageSize(file) {
  const buf = fs.readFileSync(file);
  if (buf.length < 30) return { ok: false, reason: `dosya çok küçük (${buf.length} bayt)` };
  // PNG: 8 bayt imza + IHDR uzunluk/tip; genişlik 16, yükseklik 20.
  if (buf.toString('latin1', 1, 4) === 'PNG') {
    // PNG bütünlüğü: IEND son 12 baytta olmalı (kırpılmış dosyada olmaz).
    if (buf.toString('latin1', buf.length - 8, buf.length - 4) !== 'IEND') {
      return { ok: false, reason: 'kırpılmış/bozuk PNG: IEND yok' };
    }
    return { ok: true, format: 'png', width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), bytes: buf.length };
  }
  if (buf.toString('latin1', 0, 4) !== 'RIFF' || buf.toString('latin1', 8, 12) !== 'WEBP') {
    return { ok: false, reason: 'PNG/WebP imzası yok' };
  }
  // KIRPILMIŞ DOSYA: RIFF başlığındaki uzunluk gerçek dosya boyutuyla eşleşmeli.
  // Yalnız başlığı okuyup boyutu kabaca kontrol etmek, 39 KB'lık bir çekimin 5 KB'a
  // kırpılmış hâlini "geçerli" sayıyordu (5. denetim R5-F2). Bozuk görüntü gerçekten
  // kodu çözülemeyen görüntüdür; uzunluk alanı bunun ucuz ve kesin kanıtıdır.
  const riffSize = buf.readUInt32LE(4);
  if (riffSize + 8 !== buf.length) {
    return { ok: false, reason: `kırpılmış/bozuk WebP: RIFF ${riffSize + 8} bayt bildiriyor, dosya ${buf.length} bayt` };
  }
  // CHUNK YÜRÜYÜŞÜ (10. denetim F10-6): yalnız RIFF uzunluk alanına bakmak yetmiyordu —
  // dosyayı kırpıp RIFF uzunluğunu da yeni boyuta yamamak (iki baytlık başlık yaması)
  // denetimden geçiyordu; oysa içerideki `VP8 ` chunk'ı hâlâ eski (daha büyük) boyutu
  // bildirir ve görüntü çözülemez. Her chunk'ın bildirdiği boyut dosya sınırları içinde
  // kalmalı ve son chunk tam olarak dosya sonunda bitmeli.
  let offset = 12;
  let lastChunk = null;
  while (offset + 8 <= buf.length) {
    const chunkId = buf.toString('latin1', offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + chunkSize;
    if (dataEnd > buf.length) {
      return { ok: false, reason: `kırpılmış/bozuk WebP: '${chunkId}' chunk'ı ${dataEnd} bayt bildiriyor, dosya ${buf.length} bayt` };
    }
    lastChunk = chunkId;
    // Chunk verisi çift sınırda hizalanır (RIFF kuralı).
    offset = dataEnd + (chunkSize & 1);
  }
  if (offset !== buf.length) {
    return { ok: false, reason: `kırpılmış/bozuk WebP: chunk yürüyüşü ${offset} baytta bitti, dosya ${buf.length} bayt` };
  }
  const fourcc = buf.toString('latin1', 12, 16);
  if (fourcc === 'VP8X') {
    return { ok: true, format: 'webp', width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1, bytes: buf.length };
  }
  if (fourcc === 'VP8L') {
    if (buf[20] !== 0x2f) return { ok: false, reason: 'VP8L imzası bozuk' };
    const bits = buf.readUInt32LE(21);
    return { ok: true, format: 'webp', width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1, bytes: buf.length };
  }
  if (fourcc === 'VP8 ') {
    if (buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) return { ok: false, reason: 'VP8 imzası bozuk' };
    return { ok: true, format: 'webp', width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff, bytes: buf.length };
  }
  return { ok: false, reason: `bilinmeyen WebP chunk: ${fourcc}` };
}

export function sha256Text(text) {
  return crypto.createHash('sha256').update(Buffer.from(String(text), 'utf8')).digest('hex');
}

/** Tek manifest satırı. Eksik alan sessizce geçmez: zorunlu alan listesi doğrulanır. */export function manifestRow(input) {
  const row = {
    profile: input.profile,
    theme: input.theme,
    viewport: input.viewport,
    captureScale: input.captureScale,
    scene: input.scene,
    sceneKind: input.sceneKind,
    screenshot: input.screenshot,
    log: input.log,
    issues: Array.isArray(input.issues) ? input.issues : [],
    sha256: input.sha256,
    // Ölçüm kanıtı: zorunlu alanların yanında taşınır, doğrulamada kullanılır.
    verifiedTheme: input.verifiedTheme ?? null,
    cta: input.cta ?? null,
    scrollTop: input.scrollTop ?? null,
  };
  if (input.actionsJson !== undefined) row.actionsJson = input.actionsJson;
  for (const field of REQUIRED_ROW_FIELDS) {
    const value = row[field];
    if (value === undefined || value === null || value === '') {
      throw new Error(`manifest satırı eksik alan: ${field} (${input.scene || '?'})`);
    }
    // `log` ve `issues` dizi alanları: boş dizi "ölçüm yok" demektir, kabul edilmez.
    if (Array.isArray(value) && value.length === 0 && field === 'log') {
      throw new Error(`manifest satırı eksik alan: ${field} (${input.scene || '?'})`);
    }
  }
  if (!row.verifiedTheme || !row.verifiedTheme.dataTheme) {
    throw new Error(`manifest satırı tema ölçümü taşımıyor: ${input.scene || '?'}`);
  }
  if (!row.viewport || typeof row.viewport.width !== 'number' || typeof row.viewport.height !== 'number'
    || typeof row.viewport.safeAreaBottom !== 'number') {
    throw new Error(`manifest satırı viewport alanları eksik: ${row.scene}`);
  }
  if (!Number.isFinite(row.captureScale) || row.captureScale <= 0) {
    throw new Error(`manifest satırı captureScale yok/geçersiz: ${row.scene}`);
  }
  if (row.theme !== 'light' && row.theme !== 'dark') throw new Error(`geçersiz tema: ${row.theme}`);
  if (!/^[0-9a-f]{64}$/.test(row.sha256)) throw new Error(`geçersiz sha256: ${row.sha256}`);
  return row;
}

function viewportKey(viewport) {
  return `${viewport.width}x${viewport.height}+${viewport.safeAreaBottom}`;
}

/**
 * CTA ölçümünden ÜRETİM BULGULARI türetir. Manifestte `productionFindings` diye bir alan
 * VARSA ona güvenilmez: bulguyu `rows[].cta` ham ölçümünden yeniden hesaplar. Böylece
 * beyan edilen bulgu listesi silinse/boşaltılsa bile kanıt sessizce PASS veremez
 * (denetim bulgusu F2).
 */
export function deriveFindings(rows, includeContent = false) {
  const found = [];
  for (const row of rows) {
    const cta = row.cta;
    if (!cta || cta.present !== true) continue;
    // 20. denetim F21-1: `theme`/`viewport` SATIRDAN kopyalanır (beyandan değil) ve
    // `coverStack` kayıtlarının ham geometrisi satırın `cta` ölçümüyle çelişemez.
    if (cta.hiddenBy) found.push({ scene: row.scene, theme: row.theme, viewport: row.viewport, kind: 'cta_hidden_by', coverStack: cta.coverStack });
    if (includeContent && Array.isArray(cta.overlapsContent) && cta.overlapsContent.length) found.push({ scene: row.scene, theme: row.theme, viewport: row.viewport, kind: 'cta_content_overlap' });
    // ÇAKIŞMA, `overlapsControl` BEYANINDAN DEĞİL HAM GEOMETRİDEN türetilir (10. denetim
    // F10-5). Önceden bulgu, doğrulamanın sonra karşılaştırdığı AYNI alandan türetiliyordu:
    // `overlapsControl=[]` yapıp bulguyu silmek kapalı bir döngüydü ve kartın tek açık üretim
    // kusuru (l25-summary, 44 px) tek düzenlemeyle diskte iz bırakmadan silinebiliyordu.
    // Artık her `overlapsControl` kaydının ham `{tag,cls,y,h,overlapPx}` alanları yeniden
    // hesaplanır: beyan edilen `overlapPx` ile `min(w,h)` tutarlı olmalı ve ≥8 px ise bulgu
    // vardır. Listeyi boşaltmak, `cta` nesnesindeki diğer ham alanlarla çelişki yaratır.
    const controls = Array.isArray(cta.overlapsControl) ? cta.overlapsControl : [];
    const collisions = controls.filter((item) => item && typeof item.overlapPx === 'number' && item.overlapPx >= 8);
    if (collisions.length) {
      found.push({ scene: row.scene, theme: row.theme, viewport: row.viewport, kind: 'cta_control_collision', overlapsControl: controls });
    }
  }
  return found;
}

export function validateCleanV2(manifest) {
  const errors = [];
  if (!manifest || manifest.schemaVersion !== 2) errors.push('temiz v2 kontrolü için schemaVersion 2 gerekli');
  if (deriveFindings((manifest && manifest.rows) || [], true).length || ((manifest && manifest.productionFindings) || []).length) errors.push('temiz v2 kontrolünde üretim bulgusu var');
  return { ok: errors.length === 0, errors };
}

export function validateCurrentV3(manifest, repo = REPO) {
  const errors = [];
  if (!manifest || manifest.schemaVersion !== 3) errors.push('güncel kaynak kontrolü için schemaVersion 3 gerekli');
  const assets = manifest && manifest.sourceAssets;
  if (!Array.isArray(assets) || !assets.length) return { ok: false, errors: [...errors, 'kaynak varlıkları yok'] };
  const names = new Set();
  for (const item of assets) {
    const name = item && item.path, sha = item && item.sha256;
    if (typeof name !== 'string' || !name || path.isAbsolute(name) || name.split('/').includes('..') || names.has(name) || !/^[a-f0-9]{64}$/.test(sha || '')) { errors.push('kaynak varlığı geçersiz veya yinelenmiş'); continue; }
    names.add(name);
    const file = path.join(repo, name);
    const realRepo = fs.realpathSync(repo), realFile = fs.existsSync(file) ? fs.realpathSync(file) : null;
    const relative = realFile && path.relative(realRepo, realFile);
    if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative) || !fs.statSync(realFile).isFile() || sha256File(realFile) !== sha) errors.push(`güncel kaynak hash uyuşmazlığı: ${name}`);
  }
  const indexPath = path.join(repo, 'index.html');
  const required = ['index.html', 'app/kao.css', 'app/core/quranLearn.js', 'app/core/quranLearnViews.js', 'assets/kao/font/ScheherazadeNew-Regular.k3p.woff2'];
  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, 'utf8');
    for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"?#]+)[^"]*"/gi)) required.push(match[1]);
    for (const match of html.matchAll(/<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="([^"?#]+)[^"]*")[^>]*>/gi)) required.push(match[1]);
  }
  for (const name of new Set(required)) if (!names.has(name)) errors.push(`gerekli kaynak yok: ${name}`);
  if (deriveFindings(manifest.rows || [], true).length || (manifest.productionFindings || []).length) errors.push('güncel kaynak kontrolünde üretim bulgusu var');
  return { ok: errors.length === 0, errors };
}

export function validateCurrentV4(manifest, repo = REPO) {
  if (!manifest || manifest.schemaVersion !== 4) return { ok: false, errors: ['güncel font kontrolü için schemaVersion 4 gerekli'] };
  const result = validateCurrentV3({ ...manifest, schemaVersion: 3 }, repo);
  if (!Array.isArray(manifest.rows) || !manifest.rows.length) result.errors.push('font kontrolü için sahne satırları gerekli');
  else for (const row of manifest.rows) {
    if (!Array.isArray(row.log) || !/^\S+: theme=.*\bfontReady=true(?:\s|\|)/.test(row.log[0] || '')) result.errors.push(`font yükleme tanığı eksik veya başarısız: ${row.scene}`);
  }
  return { ok: result.errors.length === 0, errors: result.errors };
}

export function validateCurrentV5(manifest, repo = REPO) {
  if (!manifest || manifest.schemaVersion !== 5) return { ok: false, errors: ['güncel koordinat kontrolü için schemaVersion 5 gerekli'] };
  return validateCurrentV4({ ...manifest, schemaVersion: 4 }, repo);
}

export function validateCurrentV6(manifest, repo = REPO) {
  if (!manifest || manifest.schemaVersion !== 6) return { ok: false, errors: ['güncel tekrar kontrolü için schemaVersion 6 gerekli'] };
  return validateCurrentV5({ ...manifest, schemaVersion: 5 }, repo);
}

export function validateCurrentV7(manifest, repo = REPO) {
  if (!manifest || manifest.schemaVersion !== 7) return { ok: false, errors: ['güncel kırpma kontrolü için schemaVersion 7 gerekli'] };
  return validateCurrentV6({ ...manifest, schemaVersion: 6 }, repo);
}

export function validateCurrentV8(manifest, repo = REPO) {
  if (!manifest || manifest.schemaVersion !== 8) return { ok: false, errors: ['güncel sahne eylem kontrolü için schemaVersion 8 gerekli'] };
  return validateCurrentV7({ ...manifest, schemaVersion: 7 }, repo);
}

export function validateCurrentV9(manifest, repo = REPO) {
  if (!manifest || manifest.schemaVersion !== 9) return { ok: false, errors: ['güncel tüm sahne geometrisi için schemaVersion 9 gerekli'] };
  return validateCurrentV8({ ...manifest, schemaVersion: 8 }, repo);
}

export function validateCurrentV10(manifest, repo = REPO) {
  if (!manifest || manifest.schemaVersion !== 10) return { ok: false, errors: ['alan sorgusuz güncel kontrol için schemaVersion 10 gerekli'] };
  return validateCurrentV9({ ...manifest, schemaVersion: 9 }, repo);
}

export function validateCurrentV11(manifest, repo = REPO) {
  if (!manifest || manifest.schemaVersion !== 11) return { ok: false, errors: ['güncel sahne sınıflaması için schemaVersion 11 gerekli'] };
  return validateCurrentV10({ ...manifest, schemaVersion: 10 }, repo);
}

export function validateSceneActions(text) {
  let data; try { data = JSON.parse(text); } catch { return false; }
  if (!data || !['glyph', 'dialog', 'onboarding', 'app'].includes(data.scope) || !Array.isArray(data.actions)) return false;
  return data.actions.every((a, i) => a && a.index === i && typeof a.tag === 'string' && typeof a.cls === 'string'
    && [a.x, a.y, a.width, a.height].every(Number.isFinite) && a.width >= 0 && a.height >= 0
    && ['rendered', 'visible', 'fullyVisible', 'covered', 'disabled'].every((k) => typeof a[k] === 'boolean')
    && (!a.fullyVisible || a.visible) && (!a.visible || a.rendered) && (!a.covered || a.visible)
    && Array.isArray(a.contentOverlaps) && a.contentOverlaps.every((o) => o && typeof o.tag === 'string' && [o.x, o.y, o.width, o.height, o.overlapPx].every(Number.isFinite) && o.overlapPx > 0));
}

export function validateSceneActionsV9(text, row) {
  if (!validateSceneActions(text)) return false;
  const d = JSON.parse(text), vp = row && row.viewport;
  if (!vp || !d.viewport || d.viewport.width !== vp.width || (row.profile !== 'glif' && d.viewport.height !== vp.height) || !(d.viewport.height > 0)) return false;
  if ((row.profile === 'glif') !== (d.scope === 'glyph')) return false;
  if (row.profile === 'onboarding' && !['onboarding', 'dialog'].includes(d.scope) && !(['o2-ilk-acilis-2', 'o2-baslangic-sonrasi-ana'].includes(row.scene) && d.scope === 'app')) return false;
  if (row.profile === 'ana' && !['dialog', 'app'].includes(d.scope)) return false;
  if (d.scope !== 'glyph' && !d.actions.length) return false;
  if (d.scope !== 'glyph' && !d.actions.some((a) => a.rendered && a.visible && !a.disabled)) return false;
  return d.actions.every((a) => {
    if (!['BUTTON', 'A', 'SUMMARY', 'DIV', 'SPAN', 'LI', 'SECTION', 'INPUT'].includes(a.tag)) return false;
    if (![a.clipLeft,a.clipTop,a.clipRight,a.clipBottom].every(Number.isFinite) || !Array.isArray(a.hits) || !a.hits.every((x) => typeof x === 'boolean')) return false;
    const visible = a.rendered && a.clipRight > a.clipLeft && a.clipBottom > a.clipTop;
    if (visible !== a.visible || (visible ? a.hits.length !== 5 : a.hits.length !== 0) || a.covered !== (visible && a.hits.some((x) => !x))) return false;
    if (visible && (a.width <= 0 || a.height <= 0 || a.clipLeft < -1 || a.clipTop < -1 || a.clipRight > vp.width + 1 || a.clipBottom > vp.height + 1 || a.clipLeft < a.x - 2 || a.clipTop < a.y - 2 || a.clipRight > a.x + a.width + 2 || a.clipBottom > a.y + a.height + 2)) return false;
    const full = visible && a.clipLeft <= a.x + 2 && a.clipRight >= a.x + a.width - 2 && a.clipTop <= a.y + 2 && a.clipBottom >= a.y + a.height - 2;
    if (a.fullyVisible && !full) return false;
    if (visible && !a.fullyVisible && a.clipLeft === a.x && a.clipTop === a.y && a.clipRight === a.x + a.width && a.clipBottom === a.y + a.height) return false;
    return a.contentOverlaps.every((o) => {
      const ix = Math.min(a.clipRight, o.x + o.width) - Math.max(a.clipLeft, o.x);
      const iy = Math.min(a.clipBottom, o.y + o.height) - Math.max(a.clipTop, o.y);
      return visible && ix > 0 && iy > 0 && Math.abs(o.overlapPx - Math.min(ix, iy)) <= 3;
    });
  });
}

/**
 * `cta.overlapsControl` kayıtlarının HAM geometriyle tutarlılığı. Beyan edilen `overlapPx`,
 * kaydın kendi `y`/`h` değerleriyle üst üste binme miktarı olmalıdır; ayrıca CTA'nın kendi
 * `y`/`height` değeriyle kesişim hesaplanabilir. Tutarsızlık "ölçüm kırılması"dır.
 * (10. denetim F10-5: bulgu türetimi ile doğrulama aynı alanı okuyordu.)
 */
export function validateControlGeometry(row) {
  const errors = [];
  const cta = row.cta;
  if (!cta || cta.present !== true) return errors;
  const controls = Array.isArray(cta.overlapsControl) ? cta.overlapsControl : [];
  for (const item of controls) {
    if (!item) { errors.push(`satır (${row.scene}): overlapsControl kaydı boş`); continue; }
    for (const key of ['y', 'h', 'overlapPx']) {
      if (typeof item[key] !== 'number' || !Number.isFinite(item[key])) {
        errors.push(`satır (${row.scene}): overlapsControl.${key} sayı değil (${item[key]})`);
      }
    }
    if (typeof item.h === 'number' && typeof item.overlapPx === 'number' && item.overlapPx > item.h) {
      errors.push(`satır (${row.scene}): overlapsControl.overlapPx ${item.overlapPx} > kendi yüksekliği ${item.h}`);
    }
    // Kesişim, CTA'nın kendi dikey aralığıyla yeniden hesaplanır: min(alt) - max(üst).
    if (typeof item.y === 'number' && typeof item.h === 'number'
      && typeof cta.y === 'number' && typeof cta.height === 'number') {
      const ctaTop = cta.y; const ctaBottom = cta.y + cta.height;
      const top = item.y; const bottom = item.y + item.h;
      const iy = Math.min(ctaBottom, bottom) - Math.max(ctaTop, top);
      if (iy <= 1) {
        errors.push(`satır (${row.scene}): overlapsControl kaydı CTA ile kesişmiyor (ham kesişim ${Math.round(iy)}px) — beyan ölçümle çelişiyor`);
      } else if (typeof item.overlapPx === 'number' && Math.abs(item.overlapPx - Math.round(iy)) > 1) {
        errors.push(`satır (${row.scene}): overlapsControl.overlapPx ${item.overlapPx} ≠ ham kesişim ${Math.round(iy)}px`);
      }
    }
  }
  return errors;
}

/**
 * CTA sözleşmesi (kartın E maddesi) — SATIRLARDAN yeniden doğrulanır:
 *   • CTA taşımak ZORUNDA olan aşamalarda (`lesson`/`practice`/`feedback`) `cta` nesnesi
 *     bulunmak ve `present === true` olmak zorunda; `cta: null` "ölçüm yok" demektir, geçmez,
 *   • sunulan her ölçüm görünür, klavye odağına ulaşır ve hedefi ≥44 px olmalı (SERT),
 *   • ölçülen her sahne `ctaReport`'ta bir kararlılık kaydına sahip olmalı,
 *   • `ctaReport`'taki her kaydın ≤8 px farkı ancak `productionFindings`'te beyan edilmişse
 *     geçerli sayılır ve satırlardan türetilen her kusur beyan edilmiş olmalı.
 * Önceki sürüm `if (!cta) continue;` ile `cta: null` satırlarını TAMAMEN atlıyordu; bu yüzden
 * tüm CTA ölçümleri silinse bile kapı yeşil kalıyordu (5. denetim R5-F1).
 */
export const CTA_REQUIRED_SCENE_KINDS = Object.freeze(['lesson', 'practice', 'feedback']);

/**
 * Sahne türü sözleşmesi — `sceneKind` KENDİ BEYAN EDİLEN bir alandır, bu yüzden tek başına
 * hiçbir muafiyet/zorunluluk açamaz (7. denetim N7-F1: tek alanı değiştirmek `rc=1` reddini
 * `rc=0`'a çeviriyor ve kartın tek açık üretim kusurunu silebiliyordu).
 *
 * Bu yüzden `sceneKind` iki bağımsız çapaya bağlanır:
 *   1. KAPALI ENUM — bilinmeyen değer reddedilir (`zzz-nonsense` gibi kaçış yok).
 *   2. AD ÖNEKİ — sahne kimliği türü zorunlu kılar (`l…-gorev-` → practice, `l…-panel-` →
 *      feedback, `v…-` → view, `o…-` → onboarding, `s0-` → s0, `g…-` → glyph, `z2-` →
 *      mastery). Böylece `practice` satırını `view` diye etiketlemek ad önekiyle çelişir.
 * İki alanı BİRDEN tutarlı biçimde yalan söylemek gerekir; bu, "tek alan" kaçışını kapatır
 * ve sınırı dürüstçe "tutarlı çok-alan tahrifatı" olarak tanımlar.
 */
export const SCENE_KINDS = Object.freeze(['view', 'lesson', 'practice', 'feedback', 's0', 'mastery', 'onboarding', 'glyph']);

const SCENE_NAME_RULES = Object.freeze([
  { kind: 'practice', test: (scene) => /-gorev-/.test(scene) },
  { kind: 'feedback', test: (scene) => /-panel-/.test(scene) },
  { kind: 'glyph', test: (scene) => /^g\d+-30-zor-glif/.test(scene) },
  { kind: 's0', test: (scene) => /^s0-/.test(scene) },
  { kind: 'view', test: (scene) => scene === 'o2-baslangic-sonrasi-ana' },
  { kind: 'onboarding', test: (scene) => /^o\d+-/.test(scene) },
  { kind: 'mastery', test: (scene) => /^z2-/.test(scene) },
  // Ders kartı aşamaları: `lNN-<stage>` (goal/intro/concept/apply/summary/budget/read).
  // `-gorev-`/`-panel-` kuralları ÖNCE gelir, bu yüzden pratik/geri bildirim buraya düşmez.
  { kind: 'lesson', test: (scene) => /^l\d+-(goal|intro|concept|apply|summary|budget|partEnd|read)$/.test(scene) },
  { kind: 'view', test: (scene) => /^v\d+-/.test(scene) || /^z[13]-/.test(scene) }
]);

/**
 * Sahne adından BEKLENEN profil (8. denetim N8-F3): `profile` de kendi beyanıdır ve
 * `validateCoverage` glif satırlarını kombinasyon matrisinden atlar; bu yüzden tek alanla
 * (`profile:'glif'`) bir satır matristen düşürülebiliyordu. Ad önekiyle çapalanır:
 * `o\d+-` → onboarding, `g\d+-` → glif, geri kalanı → ana profil.
 */
export function expectedProfile(scene) {
  const name = String(scene);
  if (/^o\d+-/.test(name)) return 'onboarding';
  if (/^g\d+-/.test(name)) return 'glif';
  return 'ana';
}

/** Sahne adından BEKLENEN tür (ad hiçbir kurala uymuyorsa null). */
export function expectedSceneKind(scene) {
  for (const rule of SCENE_NAME_RULES) if (rule.test(String(scene))) return rule.kind;
  return null;
}

export function validateClipGeometry(cta) {
  let clips;
  try { clips = JSON.parse(cta.clipJson); } catch { return false; }
  if (!Array.isArray(clips) || !clips.length || ![cta.x, cta.y, cta.width, cta.height].every(Number.isFinite)) return false;
  return clips.every((c) => c && [c.left, c.top, c.right, c.bottom].every(Number.isFinite)
    && typeof c.clipX === 'boolean' && typeof c.clipY === 'boolean' && (c.clipX || c.clipY)
    && (!c.clipX || (cta.x >= c.left - 2 && cta.x + cta.width <= c.right + 2))
    && (!c.clipY || (cta.y >= c.top - 2 && cta.y + cta.height <= c.bottom + 2)));
}

export function validateCta(manifest) {
  const errors = [];
  // HAM GEOMETRİ TUTARLILIĞI (10. denetim F10-5): bulgu türetimi ile doğrulama aynı alanı
  // okuduğu için `overlapsControl=[]` kapalı bir döngüydü. Her kaydın `overlapPx` değeri
  // CTA'nın kendi `y`/`height` değerleriyle yeniden hesaplanır.
  for (const row of (manifest && manifest.rows) || []) {
    for (const error of validateControlGeometry(row)) errors.push(error);
  }
  const rows = Array.isArray(manifest && manifest.rows) ? manifest.rows : [];
  const report = Array.isArray(manifest && manifest.ctaReport) ? manifest.ctaReport : [];
  // 25. denetim F25-1 (validateCta yolu): bulgu listesi kumesel olmali.
  {
    const seenCta = new Set();
    for (const item of ((manifest && manifest.productionFindings) || [])) {
      const key = `${item && item.scene}|${item && item.kind}`;
      if (seenCta.has(key)) errors.push(`üretim bulgusu tekrar ediyor: ${key}`);
      seenCta.add(key);
    }
  }
  const declared = new Set(((manifest && manifest.productionFindings) || []).map((item) => `${item.scene}|${item.kind}`));

  const measuredScenes = new Set();
  for (const row of rows) {
    const cta = row.cta;
    if (manifest.schemaVersion >= 7 && cta && cta.present && !validateClipGeometry(cta)) errors.push(`CTA ilk kırpıcı ata geometrisi başarısız: ${row.scene}`);
    const requiresCta = CTA_REQUIRED_SCENE_KINDS.includes(row.sceneKind);
    if (!cta) {
      // ZORUNLU aşamada CTA yok = ölçüm kırılması (sessizce atlanamaz).
      if (requiresCta) errors.push(`CTA ölçümü yok: ${row.scene} (${row.sceneKind}) — 'cta' nesnesi zorunlu`);
      continue;
    }
    if (cta.present !== true) { errors.push(`CTA sunulmadı: ${row.scene} (${cta.selector || 'seçici yok'})`); continue; }
    measuredScenes.add(row.scene);
    if (!cta.visible) errors.push(`CTA görünür değil: ${row.scene}`);
    if (!(cta.height >= 44)) errors.push(`CTA hedefi ${cta.height}px < 44px: ${row.scene}`);
    if (!cta.focusReachable) errors.push(`CTA klavye odağına ulaşmıyor: ${row.scene}`);
    // GÖRÜNÜRLÜK GEOMETRİDEN YENİDEN TÜRETİLİR (16. denetim F16-1): `visible`, `height`,
    // `focusReachable` üçlüsü kendi beyanıydı — tek karakterlik bir düzenleme
    // (`visible:false → true`) ekran dışında kalmış bir birincil eylemi yeşile çeviriyordu.
    // `visible` zaten mevcut alanlardan hesaplanabilir; formül çekim aracının yazdığı
    // formülün aynısıdır (shoot-modal.mjs CTA_PROBE).
    if (typeof cta.width === 'number' && typeof cta.height === 'number'
      && typeof cta.y === 'number' && typeof cta.dialogBottom === 'number') {
      // YATAY EKSEN DE GÖRÜNÜRLÜĞE DAHİL (18. denetim F18-1): türetim yalnız dikey eksene
      // bakıyordu; `cta.x`/`dialogRight` sözleşme alanlarıydı ama HİÇBİR kapı okumuyordu ve
      // log'da tanıkları yoktu. Tek alanla (`x = -1000`) yatayda tamamen ekran dışında kalan
      // bir eylem `visible:true` kalıp iki kapıdan da geçiyordu. Artık türetim iki eksenlidir.
      const horizontalOk = typeof cta.x === 'number' && typeof cta.dialogRight === 'number'
        && cta.x >= 0 && (cta.x + cta.width) <= cta.dialogRight + 1;
      const derivedVisible = cta.width > 0 && cta.height > 0 && cta.y < cta.dialogBottom - 1 && (cta.y + cta.height) > 1;
      if (derivedVisible !== Boolean(cta.visible)) {
        errors.push(`CTA visible beyanı ${Boolean(cta.visible)} ama geometri ${derivedVisible} diyor: ${row.scene}`);
      }
      if (typeof cta.x === 'number' && typeof cta.dialogRight === 'number') {
        if (!horizontalOk) {
          errors.push(`CTA yatayda diyalog dışında: x=${cta.x}, width=${cta.width}, dialogRight=${cta.dialogRight}: ${row.scene}`);
        }
        if (Boolean(cta.visible) && !horizontalOk) {
          errors.push(`CTA görünür beyan edilmiş ama yatayda ekran dışında: ${row.scene}`);
        }
      } else {
        errors.push(`CTA yatay geometrisi eksik (x/dialogRight) — görünürlük iki eksende doğrulanamaz: ${row.scene}`);
      }
      // HEDEF ALANI: ≥44 px KURALI HER İKİ BOYUT İÇİN geçerlidir (F16-2). Yalnız yükseklik
      // denetleniyordu; 20×50 px bir eylem geçiyordu.
      if (!(cta.width >= 44)) errors.push(`CTA hedefi genişliği ${cta.width}px < 44px: ${row.scene}`);
    } else {
      errors.push(`CTA geometrisi eksik (width/height/y/dialogBottom) — görünürlük yeniden türetilemez: ${row.scene}`);
    }
    // TÜREV ALANLAR (20. denetim F20-1): `overlapCovered`, `scroll.localScroll` ve
    // `overlapsContent` manifestte beyandı; `log.txt`'te de tanıkları yoktu ve hiçbir kapı
    // okumuyordu. EVIDENCE bunları "ölçüldü" diye aktarıyordu. Artık:
    //   • `overlapCovered` = overlapsContent.length > 0 (tek alanla çevrilemez),
    //   • `scroll.localScroll` = scrollHeight > clientHeight + 1 (ölçümden türetilir),
    //   • `overlapsContent` uzunluğu log'daki `covN=` ile eşleşir,
    //   • `localScroll` log'daki `lscroll=` ile eşleşir.
    if (manifest && manifest.schemaVersion >= 2 && (typeof cta.overlapCovered !== 'boolean' || !Array.isArray(cta.overlapsContent))) {
      errors.push(`CTA sürüm 2 overlapCovered veya overlapsContent eksik/geçersiz: ${row.scene}`);
    }
    if (cta.overlapCovered !== undefined) {
      const derivedCovered = Array.isArray(cta.overlapsContent) && cta.overlapsContent.length > 0;
      if (Boolean(cta.overlapCovered) !== derivedCovered) {
        errors.push(`CTA overlapCovered ${Boolean(cta.overlapCovered)} ama overlapsContent ${Array.isArray(cta.overlapsContent) ? cta.overlapsContent.length : 'yok'} kayıt taşıyor: ${row.scene}`);
      }
    }
    if (cta.scroll === null || cta.scroll === undefined) {
      errors.push(`CTA scroll ölçümü yok — yerel kaydırma türetilemez: ${row.scene}`);
    } else if (typeof cta.scroll === 'object') {
      const { scrollHeight, clientHeight, localScroll } = cta.scroll;
      if (typeof scrollHeight !== 'number' || typeof clientHeight !== 'number') {
        errors.push(`CTA scroll geometrisi eksik (scrollHeight/clientHeight) — localScroll türetilemez: ${row.scene}`);
      } else if (typeof localScroll !== 'boolean') {
        errors.push(`CTA scroll.localScroll eksik — yerel kaydırma beyanı yok: ${row.scene}`);
      } else if (localScroll !== (scrollHeight > clientHeight + 1)) {
        errors.push(`CTA scroll.localScroll ${localScroll} ama scrollHeight ${scrollHeight} / clientHeight ${clientHeight} ${scrollHeight > clientHeight + 1} diyor: ${row.scene}`);
      }
      // 25. denetim F26-3: `scroll.scrollTop` / `scrollHeight` / `clientHeight` degerleri
      // serbestti (9999 / 10 geciyordu). Artik:
      //   • scroll.scrollTop = satirin cta.scrollTop'u (log ctaScr= ile capali),
      //   • clientHeight = satirin viewport.height (kaydirici diyalog tam ekran),
      //   • scrollHeight >= clientHeight ve >= o satirin bilinen icerigi.
      if (typeof cta.scroll.scrollTop === 'number' && typeof cta.scrollTop === 'number'
        && Math.round(cta.scroll.scrollTop) !== Math.round(cta.scrollTop)) {
        errors.push(`CTA scroll.scrollTop ${cta.scroll.scrollTop} ≠ cta.scrollTop ${cta.scrollTop}: ${row.scene}`);
      }
      if (row.viewport && typeof row.viewport.height === 'number'
        && typeof clientHeight === 'number' && clientHeight !== row.viewport.height) {
        errors.push(`CTA scroll.clientHeight ${clientHeight} ≠ viewport.height ${row.viewport.height}: ${row.scene}`);
      }
      if (typeof scrollHeight === 'number' && typeof clientHeight === 'number'
        && scrollHeight < clientHeight) {
        errors.push(`CTA scroll.scrollHeight ${scrollHeight} < clientHeight ${clientHeight}: ${row.scene}`);
      }
    }
  }
  // Sahne envanteri boşaltılarak da kaçılamaz: TAM koşumda en az bir lesson/practice/feedback
  // sahnesi bulunmalı (tüm CTA sahnelerini silmek artık kırmızı). Glif-referans koşumu tek
  // sayfalık bir ölçümdür (`mode: 'glif-referans'`) ve bu matrise girmez.
  // YALNIZ YAPISAL ölçüt: tek satırlık glif sayfası. `mode` alanına BAKILMAZ — o kendi
  // beyan edilen bir alandır ve herhangi bir manifest onu `glif-referans` yaparak zorunlu
  // sahne sözleşmesini atlayabilirdi (6. denetim N6-F1: bayt-eş kopyada tek alanı değiştirmek
  // `rc=1` reddini `rc=0 PASS`'a çeviriyordu — R5-F1'in aynı fail-open'ı başka kapıdan).
  const isGlyphOnlyRun = rows.length === 1 && rows[0] && rows[0].sceneKind === 'glyph';
  if (!isGlyphOnlyRun) {
    for (const required of ['lesson', 'practice', 'feedback']) {
      if (!rows.some((row) => row.sceneKind === required)) errors.push(`zorunlu sahne türü eksik: ${required} (CTA matrisi ölçülemez)`);
    }
  }
  // Kararlılık kaydı zorunlu: ölçülen her CTA sahnesi ardışık render karşılaştırması taşımalı.
  // (Önceden 42 CTA satırının 17'si — tüm feedback panelleri — hiç kaydedilmiyordu.)
  const reportScenes = new Set(report.map((item) => item.scene));
  for (const scene of measuredScenes) {
    if (!reportScenes.has(scene)) errors.push(`CTA kararlılık kaydı yok: ${scene} (ctaReport'ta bulunmuyor)`);
  }
  for (const item of report) {
    if (typeof item.maxDelta !== 'number') { errors.push(`CTA kaydı maxDelta taşımıyor: ${item.scene}`); continue; }
    if (!(item.samples >= 2)) errors.push(`CTA kaydı ${item.samples} örnek taşıyor (≥2 gerekli): ${item.scene}`);
    // maxDelta, HAM örneklerden YENİDEN TÜRETİLİR (8. denetim N8-F2): tek alan
    // (`maxDelta: 30 → 0`) düzenlemek gerçek kaymayı `layoutYs`'te bırakıp kapıyı
    // yeşile çeviriyordu. Artık `layoutYs` ile beyan edilen `maxDelta` çelişemez.
    if (!Array.isArray(item.layoutYs) || item.layoutYs.length < 2) {
      errors.push(`CTA kaydı ham örnek (layoutYs) taşımıyor: ${item.scene}`);
    } else {
      if (item.layoutYs.some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
        errors.push(`CTA kaydı layoutYs içinde sayısal olmayan değer: ${item.scene}`);
      } else if (typeof item.samples === 'number' && item.samples !== item.layoutYs.length) {
        errors.push(`CTA kaydı samples=${item.samples} ama layoutYs ${item.layoutYs.length} örnek: ${item.scene}`);
      } else {
        let derived = 0;
        for (let index = 1; index < item.layoutYs.length; index += 1) {
          derived = Math.max(derived, Math.abs(item.layoutYs[index] - item.layoutYs[index - 1]));
        }
        if (manifest && manifest.schemaVersion >= 5) {
          if (!item.keyboard || item.keyboard.leftTarget !== true || item.keyboard.focused !== true || item.keyboard.visible !== true) errors.push(`CTA Shift+Tab/Tab odağı eksik veya görünmez: ${item.scene}`);
          if (!Array.isArray(item.viewportYs) || item.viewportYs.length !== 2 || !item.viewportYs.every(Number.isFinite) || !Array.isArray(item.scrollTops) || item.scrollTops.length !== 2 || !item.scrollTops.every(Number.isFinite)) errors.push(`CTA viewport örnekleri eksik: ${item.scene}`);
          else {
            derived = Math.max(derived, Math.abs(item.viewportYs[1] - item.viewportYs[0]));
            const owner = rows.find((row) => row.scene === item.scene);
            if (!owner || !owner.cta || owner.cta.y !== item.viewportYs[0] || owner.cta.scrollTop !== item.scrollTops[0]) errors.push(`CTA ilk viewport örneği satırla uyuşmuyor: ${item.scene}`);
            for (let i = 0; i < 2; i += 1) if (Math.abs(item.layoutYs[i] - item.viewportYs[i] - item.scrollTops[i]) > 1) errors.push(`CTA yerleşim ve viewport/scroll örneği çelişiyor: ${item.scene}`);
          }
          if (manifest.schemaVersion >= 6) {
            let repeat; try { repeat = JSON.parse(item.repeatJson); } catch { errors.push(`CTA ikinci geometri okunamadı: ${item.scene}`); }
            if (!repeat || typeof repeat !== 'object' || Array.isArray(repeat)) { errors.push(`CTA ikinci geometri nesnesi geçersiz: ${item.scene}`); repeat = null; }
            if (!item.keyboardFirst || !item.keyboardFirst.leftTarget || !item.keyboardFirst.focused || !item.keyboardFirst.visible) errors.push(`CTA ilk Shift+Tab/Tab odağı eksik: ${item.scene}`);
            if (repeat) {
              if (manifest.schemaVersion >= 7 && !validateClipGeometry(repeat)) errors.push(`CTA ikinci kırpıcı ata geometrisi başarısız: ${item.scene}`);
              const row = rows.find((r) => r.scene === item.scene), v = row && row.viewport;
              if (!row || !row.cta || repeat.selector !== row.cta.selector || repeat.y !== item.viewportYs?.[1] || repeat.scrollTop !== item.scrollTops?.[1] || repeat.layoutY !== item.layoutYs[1]) errors.push(`CTA ikinci geometri örneğiyle çelişiyor: ${item.scene}`);
              if (!v || ![repeat.x, repeat.y, repeat.width, repeat.height].every(Number.isFinite) || repeat.x < 0 || repeat.y < 0 || repeat.x + repeat.width > v.width + 1 || repeat.y + repeat.height > v.height + 1 || repeat.width < 44 || repeat.height < 44 || repeat.present !== true || repeat.visible !== true || repeat.hiddenBy !== false || repeat.overlapCovered !== false || !Array.isArray(repeat.overlapsContent) || repeat.overlapsContent.length || !Array.isArray(repeat.overlapsControl) || repeat.overlapsControl.some((x) => x.overlapPx >= 8)) errors.push(`CTA ikinci geometri kabulü başarısız: ${item.scene}`);
            }
          }
        }
        if (derived !== item.maxDelta) {
          errors.push(`CTA maxDelta beyanı ${item.maxDelta}px ama ham örnekler ${derived}px gösteriyor: ${item.scene}`);
        }
        // İLK ÖRNEK, SATIRIN KENDİ ÖLÇÜMÜNE bağlanır (15. denetim F15-1): `layoutYs` ile
        // `rows[].cta.layoutY` AYNI ölçümün iki kopyasıdır. Önceden yalnız `layoutYs`
        // okunuyordu; tek alanı (`layoutYs: [400,400]`) değiştirmek, satırın `cta.layoutY`
        // 285 derken koşumun "eylem y=400'deydi" demesine izin veriyordu. Çelişki reddedilir.
        const ctaRow = rows.find((row) => row.scene === item.scene && row.cta && row.cta.present === true);
        if (!ctaRow) {
          errors.push(`CTA kaydı ölçüm satırıyla eşleşmiyor: ${item.scene}`);
        } else {
          const ctaLayout = typeof ctaRow.cta.layoutY === 'number' ? ctaRow.cta.layoutY : ctaRow.cta.y;
          if (typeof ctaLayout === 'number' && Math.abs(ctaLayout - item.layoutYs[0]) > 1) {
            errors.push(`CTA layoutYs[0] ${item.layoutYs[0]} ≠ satırdaki cta.layoutY ${ctaLayout}: ${item.scene}`);
          }
        }
      }
    }
    // Ölçülen fark ile beyan çelişemez.
    const exceeding = item.maxDelta > 8;
    const isDeclared = declared.has(`${item.scene}|cta_drift`);
    if (exceeding !== isDeclared) {
      errors.push(`CTA ≤8px çelişkisi: ${item.scene} ölçülen ${item.maxDelta}px, beyan ${isDeclared ? 'var' : 'yok'}`);
    }
  }
  // Ters yön: beyan edilen her bulgu gerçekten ölçülmüş olmalı (uydurma bulgu da hatadır).
  const derivedList = deriveFindings(rows, manifest && manifest.schemaVersion >= 2);
  const derived = new Set(derivedList.map((item) => `${item.scene}|${item.kind}`));
  // VE: satırlardan türetilen her GERÇEK kusur beyan edilmiş olmalı. Beyan listesi
  // boşaltılarak kusur gizlenemez (denetim bulgusu F2'nin asıl iddiası).
  for (const item of derivedList) {
    if (!declared.has(`${item.scene}|${item.kind}`)) {
      errors.push(`ölçülen üretim kusuru beyan edilmemiş: ${item.kind} ${item.scene}`);
    }
  }
  // 24. denetim F25-1: ayni bulgu kaydini IKI KEZ yazmak (veya listeyi cogaltmak) hicbir
  // kapiya takilmiyordu. Bulgu listesi kumesel olmali: (scene,kind) tekil.
  {
    const seenFindings = new Set();
    for (const item of ((manifest && manifest.productionFindings) || [])) {
      const key = `${item && item.scene}|${item && item.kind}`;
      if (seenFindings.has(key)) errors.push(`üretim bulgusu tekrar ediyor: ${key}`);
      seenFindings.add(key);
    }
  }
  for (const item of ((manifest && manifest.productionFindings) || [])) {
    const key = `${item.scene}|${item.kind}`;
    // 20. denetim F21-1: `productionFindings[].theme` / `.viewport` BEYANDI ve hicbir kapi
    // okumuyordu; `theme="dark"` / `viewport.width=390` yapmak uc kapida da rc=0 veriyordu.
    // Artik bulgunun tanimladigi SATIRIN kendi olcumuyle birebir eslesmek zorundadir.
    const ownerRow = rows.find((row) => row.scene === item.scene);
    if (!ownerRow) {
      errors.push(`beyan edilen üretim bulgusu var olmayan sahneye işaret ediyor: ${item.scene}`);
    } else {
      if (item.theme !== undefined && item.theme !== ownerRow.theme) {
        errors.push(`üretim bulgusu (${item.scene}): theme '${item.theme}' ≠ satırın teması '${ownerRow.theme}'`);
      }
      if (item.viewport !== undefined) {
        for (const key2 of ['width', 'height', 'safeAreaBottom']) {
          const claimed = item.viewport && item.viewport[key2];
          const actual = ownerRow.viewport && ownerRow.viewport[key2];
          if (claimed !== undefined && claimed !== actual) {
            errors.push(`üretim bulgusu (${item.scene}): viewport.${key2} ${claimed} ≠ satırın ${actual}`);
          }
        }
      }
    }
    if (item.kind === 'cta_drift') {
      const record = report.find((entry) => entry.scene === item.scene);
      if (!record || record.maxDelta <= 8) errors.push(`beyan edilen cta_drift ölçümle doğrulanmadı: ${item.scene}`);
    } else if (!derived.has(key)) {
      errors.push(`beyan edilen üretim bulgusu satırlardan türetilemedi: ${key}`);
    }
    // BULGU KAYITLARININ ICERIGI DE CAPALI (F21-3): `coverStack`/`overlapsControl`/`overlapsContent`
    // kayitlarinin ham geometrisi satirin kendi `cta` olcumunden turetilmeli; aksi halde
    // §7.2'de "dogrulanmis" diye aktarilan 44 px / y=764 sayilari tek alanla degistirilebilirdi.
    if (ownerRow && ownerRow.cta) {
      for (const [listName, ownerName] of [['coverStack', 'coverStack'], ['overlapsControl', 'overlapsControl'], ['overlapsContent', 'overlapsContent']]) {
        if (!Array.isArray(item[listName])) continue;
        // Bulgu turu o listeyi TASIMAK ZORUNDA: `cta_hidden_by` -> coverStack,
        // `cta_control_collision` -> overlapsControl. Bosaltmak kanit silmektir.
        if (listName === 'coverStack' && item.kind !== 'cta_hidden_by') continue;
        if (listName === 'overlapsControl' && item.kind !== 'cta_control_collision') continue;
        if (listName === 'overlapsContent') continue;
        const ownerList = Array.isArray(ownerRow.cta[ownerName]) ? ownerRow.cta[ownerName] : [];
        // 23. denetim F24-2: onceden "prefix" denetimi vardi; bulgu listesini BOSALTMAK
        // (`coverStack=[]`, `overlapsControl=[]`) §7.2'de aktarilan 44 px kanitini siliyor ve
        // iki kapi da yesil kaliyordu. Artik uzunluklar BIREBIR esit olmali.
        if (item[listName].length !== ownerList.length) {
          errors.push(`üretim bulgusu (${item.scene}): ${listName} ${item[listName].length} kayıt ama satırda ${ownerList.length} ölçüm var — birebir eşleşmeli`);
          continue;
        }
        for (let i = 0; i < item[listName].length; i += 1) {
          const claim = item[listName][i] || {};
          const truth = ownerList[i] || {};
          for (const field of ['tag', 'cls', 'y', 'h', 'pos', 'z', 'overlapPx', 'txt']) {
            if (claim[field] === undefined) continue;
            if (claim[field] !== truth[field]) {
              errors.push(`üretim bulgusu (${item.scene}): ${listName}[${i}].${field} '${claim[field]}' ≠ satırdaki '${truth[field]}'`);
            }
          }
        }
      }
    }
  }
  return { ok: errors.length === 0, errors, stats: { measuredScenes: measuredScenes.size, reportEntries: report.length, declaredFindings: declared.size } };
}

/**
 * Manifest'i diskle karşılaştırır. Kasıtlı olarak katı:
 *   • satır sayısı = diskteki screenshot sayısı = log satırı sayısı,
 *   • her satırın sha256'sı diskteki baytla eşleşir,
 *   • her satırın teması, aynı profil+viewport için tek ve beklenen temadır,
 *   • her satır en az bir log satırı taşır; tema doğrulaması satırda görünür.
 * Dönen `errors` boş değilse kanıt geçersizdir.
 */
/**
 * @param {object} manifest  MANIFEST.json içeriği
 * @param {object} options
 *   root        : görüntülerin bulunduğu dizin (hash/sayım karşılaştırması)
 *   screenshots : diskteki görüntü yolları (sayım için)
 *   singleRun   : true ise "aynı sahne iki temada" ve "profil×viewport×tema kapsaması"
 *                 kontrolleri atlanır. Tek koşum yalnız BİR tema üretir; iki tema kapsamı
 *                 ayrı koşumların birleşiminde doğrulanır (`validateCoverage`).
 */
/**
 * KAPALI ALAN SOZLESMESI (21. denetim F22-0).
 *
 * 20 tur boyunca her denetim "bir alan daha vardi" buldu; kok neden tek tek alanlari
 * kapatmakti. Bu tablo sinifi kapatir: manifestte BEYAN EDILEN her alan burada ya
 * `anchor:` (bagimsiz kaynaktan yeniden turetilir / log'a capali) ya da `derived:`
 * (yalniz yazici tarafindan uretilir, kanit olarak AKTARILMAZ) olarak kayitli olmak
 * zorundadir. Tabloda olmayan bir alan gorulurse manifest REDDEDILIR — yani yeni bir
 * beyan alani eklemek, onu capalamadan mumkun degildir.
 *
 * `derived:` alanlar EVIDENCE'da dogrulanmis gercek olarak aktarilamaz; bu yuzden
 * sayilari az tutulur ve her biri icin gerekce yazilir.
 */
// Aşama adları: `ctaReport[].stage` satirin secicisinden turetilemedigi durumda kullanilan
// kumeli liste. Secici `data-lesson-stage="X"` tasiyorsa turetme ONCELIKLIDIR (asagida).
// Yayın fontu woff2 ustsiniri (25. denetim F26-4): gercek dosya ~25 KB; 1 MB imkansiz.
export const MAX_FONT_BYTES = 1048576;

export const CTA_STAGE_NAMES = new Set(['goal', 'intro', 'concept', 'practice', 'feedback', 'apply', 'summary', 'budget']);

export const MANIFEST_FIELD_CONTRACT = {
  // ── ust duzey ──────────────────────────────────────────────────────────────────────────
  'schema': 'anchor:sabit k3pd-visual-qa-manifest',
  'schemaVersion': 'anchor:1 tarihi; 2–11 log tanığı',
  'sourceAssets': 'anchor:v3 log kaynaktan sunulan varlık özeti',
  'sourceAssets[].path': 'anchor:v3 yerel sunum yolu',
  'sourceAssets[].sha256': 'anchor:v3 sunulan bayt SHA-256',
  'card': 'anchor:sabit K3PD-29',
  'generatedAt': 'derived:cekim zamani damgasi; kanit degil, tazelik iddiası yok',
  'profile': 'anchor:log.txt tmp-profil onek=',
  'theme': 'anchor:satirlarin temasi + log.txt theme=',
  'viewport': 'anchor:satirlarin viewportu + log.txt vw=/vh=/inset=',
  'viewport.width': 'anchor:satirlarin viewport.width',
  'viewport.height': 'anchor:satirlarin viewport.height',
  'viewport.safeAreaBottom': 'anchor:satirlarin viewport.safeAreaBottom',
  'captureScales': 'anchor:satirlardan olculen kume',
  'imageFormat': 'anchor:diskteki goruntu bicimi (RIFF/PNG)',
  'imageQuality': 'derived:kayipli kodlama parametresi; olcum degil',
  'mode': 'anchor:kapali enum + satir sayisi',
  'origin': 'anchor:log.txt origin satiri + tek izinli origin',
  'glyphEvidence': 'anchor:asagidaki alt alanlar',
  'ctaReport': 'anchor:asagidaki alt alanlar',
  'productionFindings': 'anchor:asagidaki alt alanlar',
  'rows': 'anchor:asagidaki alt alanlar',
  // ── satir ─────────────────────────────────────────────────────────────────────────────
  'rows[].profile': 'anchor:kapali set (ana/onboarding/glif)',
  'rows[].actionsJson': 'anchor:v8 yüzeydeki kontrol geometrileri ve log özeti',
  'rows[].theme': 'anchor:verifiedTheme + log.txt theme=',
  'rows[].viewport': 'anchor:log.txt vw=/vh=/inset=',
  'rows[].viewport.width': 'anchor:log.txt vw=',
  'rows[].viewport.height': 'anchor:log.txt vh=',
  'rows[].viewport.safeAreaBottom': 'anchor:log.txt inset=',
  'rows[].captureScale': 'anchor:diskteki goruntu genisligi / viewport.width',
  'rows[].scene': 'anchor:log.txt sahne adi + screenshot adi',
  'rows[].sceneKind': 'anchor:kapali enum + sahne adi oneki',
  'rows[].screenshot': 'anchor:diskteki dosya + ${scene}.<ext> kurali',
  'rows[].log': 'anchor:log.txt satiri (iki yonlu)',
  'rows[].issues': 'anchor:log.txt hard= + issues.txt',
  'rows[].sha256': 'anchor:diskteki bayt',
  'rows[].verifiedTheme': 'anchor:log.txt theme=/surface=/onb=',
  'rows[].verifiedTheme.dataTheme': 'anchor:log.txt theme=',
  'rows[].verifiedTheme.surface': 'anchor:log.txt surface=',
  'rows[].verifiedTheme.ink': 'anchor:THEME_TOKENS (tema basina sabit)',
  'rows[].verifiedTheme.onb': 'anchor:log.txt onb=',
  'rows[].cta': 'anchor:asagidaki alt alanlar',
  'rows[].scrollTop': 'anchor:rows[].cta.scrollTop (CTA varsa)',
  // ── CTA ───────────────────────────────────────────────────────────────────────────────
  'rows[].cta.selector': 'anchor:log.txt sel= (sha256 oneki)',
  'rows[].cta.present': 'anchor:zorunlu asama matrisi',
  'rows[].cta.x': 'anchor:log.txt ctaX= + iki eksenli gorunurluk',
  'rows[].cta.y': 'anchor:log.txt ctaY= + layoutY/scrollTop bagi',
  'rows[].cta.width': 'anchor:log.txt ctaW= + >=44px',
  'rows[].cta.height': 'anchor:log.txt ctaH= + >=44px',
  'rows[].cta.layoutY': 'anchor:log.txt ctaLay= + y+scrollTop bagi',
  'rows[].cta.scrollTop': 'anchor:log.txt ctaScr=',
  'rows[].cta.visible': 'anchor:geometriden yeniden turetilir (iki eksen)',
  'rows[].cta.overlapCovered': 'anchor:overlapsContent uzunlugundan turetilir',
  'rows[].cta.hiddenBy': 'anchor:log.txt hidden=',
  'rows[].cta.coverStack': 'anchor:log.txt coverPx=/coverH= (tam liste ozeti)',
  'rows[].cta.overlapsContent': 'anchor:log.txt covN=/covPx=/covH= (tam liste ozeti)',
  'rows[].cta.overlapsControl': 'anchor:log.txt collisions=/collisionPx= + kayit alanlari',
  'rows[].cta.scroll': 'anchor:log.txt lscroll= + scrollHeight/clientHeight',
  'rows[].cta.focusReachable': 'anchor:log.txt focus=',
  'rows[].cta.clipJson': 'anchor:v7 odak öncesi kırpıcı ata kutuları ve log özeti',
  'rows[].cta.dialogRight': 'anchor:log.txt ctaR=',
  'rows[].cta.dialogBottom': 'anchor:viewport.height + log.txt vh=',
  // ── ctaReport ─────────────────────────────────────────────────────────────────────────
  'ctaReport[].scene': 'anchor:zorunlu CTA satiri',
  'ctaReport[].stage': 'anchor:satirin cta.selector icindeki data-lesson-stage + kumeli liste',
  'ctaReport[].viewport': 'anchor:satirin viewportu',
  'ctaReport[].viewport.width': 'anchor:satirin viewport.width',
  'ctaReport[].viewport.height': 'anchor:satirin viewport.height',
  'ctaReport[].viewport.safeAreaBottom': 'anchor:satirin viewport.safeAreaBottom',
  'ctaReport[].samples': 'anchor:>=2 + layoutYs uzunlugu',
  'ctaReport[].layoutYs': 'anchor:layoutYs[0] = satirin cta.layoutY',
  'ctaReport[].viewportYs': 'anchor:v5 ilk değer CTA, ikinci değer log tanığı',
  'ctaReport[].scrollTops': 'anchor:v5 ilk değer CTA, ikinci değer log tanığı',
  'ctaReport[].keyboard': 'anchor:v5 gerçek Shift+Tab ve Tab ölçümü',
  'ctaReport[].keyboard.leftTarget': 'anchor:v5 Shift+Tab hedefi terk etti',
  'ctaReport[].keyboard.focused': 'anchor:v5 log cta-keyboard focused',
  'ctaReport[].keyboard.visible': 'anchor:v5 log cta-keyboard visible',
  'ctaReport[].keyboardFirst': 'anchor:v6 ilk render Tab tanığı',
  'ctaReport[].keyboardFirst.leftTarget': 'anchor:v6 ilk Shift+Tab hedefi terk etti',
  'ctaReport[].keyboardFirst.focused': 'anchor:v6 ilk Tab hedefe geldi',
  'ctaReport[].keyboardFirst.visible': 'anchor:v6 ilk odak görünür',
  'ctaReport[].repeatJson': 'anchor:v6 ikinci geometri tam metni log özeti',
  'ctaReport[].maxDelta': 'anchor:layoutYs farkindan turetilir',
  // ── productionFindings ────────────────────────────────────────────────────────────────
  'productionFindings[].scene': 'anchor:var olan satir',
  'productionFindings[].theme': 'anchor:satirin temasi',
  'productionFindings[].viewport': 'anchor:satirin viewportu',
  'productionFindings[].viewport.width': 'anchor:satirin viewport.width',
  'productionFindings[].viewport.height': 'anchor:satirin viewport.height',
  'productionFindings[].viewport.safeAreaBottom': 'anchor:satirin viewport.safeAreaBottom',
  'productionFindings[].kind': 'anchor:deriveFindings kapali set',
  'productionFindings[].coverStack': 'anchor:satirin cta.coverStack',
  'productionFindings[].overlapsControl': 'anchor:satirin cta.overlapsControl',
  'productionFindings[].coverStack[]': 'anchor:satirin cta.coverStack (alan alan)',
  'productionFindings[].coverStack[].tag': 'anchor:satirin cta.coverStack[i].tag',
  'productionFindings[].coverStack[].cls': 'anchor:satirin cta.coverStack[i].cls',
  'productionFindings[].coverStack[].y': 'anchor:satirin cta.coverStack[i].y',
  'productionFindings[].coverStack[].h': 'anchor:satirin cta.coverStack[i].h',
  'productionFindings[].coverStack[].pos': 'anchor:satirin cta.coverStack[i].pos',
  'productionFindings[].coverStack[].z': 'anchor:satirin cta.coverStack[i].z',
  'productionFindings[].overlapsControl[]': 'anchor:satirin cta.overlapsControl (alan alan)',
  'productionFindings[].overlapsControl[].tag': 'anchor:satirin cta.overlapsControl[i].tag',
  'productionFindings[].overlapsControl[].cls': 'anchor:satirin cta.overlapsControl[i].cls',
  'productionFindings[].overlapsControl[].y': 'anchor:satirin cta.overlapsControl[i].y',
  'productionFindings[].overlapsControl[].h': 'anchor:satirin cta.overlapsControl[i].h',
  'productionFindings[].overlapsControl[].pos': 'anchor:satirin cta.overlapsControl[i].pos',
  'productionFindings[].overlapsControl[].z': 'anchor:satirin cta.overlapsControl[i].z',
  'productionFindings[].overlapsControl[].overlapPx': 'anchor:satirin cta.overlapsControl[i].overlapPx',
  // ── glyphEvidence ─────────────────────────────────────────────────────────────────────
  'glyphEvidence.scene': 'anchor:glif satirinin scene',
  'glyphEvidence.seriesCount': 'anchor:series uzunlugu + log.txt rows=',
  'glyphEvidence.lexiconVersion': 'anchor:glyphSeries().lexiconVersion',
  'glyphEvidence.surahVersion': 'anchor:glyphSeries().surahVersion',
  'glyphEvidence.font': 'anchor:log.txt loaded=/woff2=/metrics=/distinct=/check=',
  'glyphEvidence.font.faces': 'anchor:log.txt loaded=',
  'glyphEvidence.font.requests': 'anchor:log.txt woff2=',
  'glyphEvidence.font.check': 'anchor:log.txt check=',
  'glyphEvidence.font.withFont': 'anchor:log.txt metrics=',
  'glyphEvidence.font.withFallback': 'anchor:log.txt metrics=',
  'glyphEvidence.font.distinct': 'anchor:log.txt distinct=',
  'glyphEvidence.sheet': 'anchor:asagidaki alt alanlar + log.txt h=',
  'glyphEvidence.sheet.rows': 'anchor:series uzunlugu + log.txt rows=',
  'glyphEvidence.sheet.minH': 'anchor:<= maxH, > 0',
  'glyphEvidence.sheet.maxH': 'anchor:log.txt h=',
  'glyphEvidence.sheet.firstTop': 'anchor:satir araligi >= (rows-1)*maxH',
  'glyphEvidence.sheet.lastTop': 'anchor:satir araligi >= (rows-1)*maxH',
  'glyphEvidence.sheet.sheetHeight': 'anchor:= docH = bodyH, <= scrollH',
  'glyphEvidence.sheet.scrollH': 'anchor:>= sheetHeight',
  'glyphEvidence.sheet.clientH': 'anchor:<= scrollH',
  'glyphEvidence.sheet.sw': 'anchor:satirin viewport.width',
  'glyphEvidence.sheet.cw': 'anchor:<= sw',
  'glyphEvidence.sheet.docH': 'anchor:= sheetHeight',
  'glyphEvidence.sheet.bodyH': 'anchor:= sheetHeight',
  'glyphEvidence.reference': 'anchor:mode ile tutarli (glif-referans)',
  'glyphEvidence.screenshot': 'anchor:glif satirinin screenshot adi',
  'glyphEvidence.screenshotSha256': 'anchor:diskteki bayt + satirin sha256',
  'glyphEvidence.captureScale': 'anchor:diskteki genislik / satir viewport.width',
  'glyphEvidence.imagePixels': 'anchor:diskteki goruntu basligi',
  'glyphEvidence.imagePixels.width': 'anchor:diskteki goruntu genisligi',
  'glyphEvidence.imagePixels.height': 'anchor:diskteki goruntu yuksekligi',
  'glyphEvidence.imagePixels.bytes': 'anchor:diskteki bayt sayisi',
  'glyphEvidence.font.faces[]': 'anchor:log.txt loaded= (yuklu face sayisi)',
  'glyphEvidence.font.faces[].family': 'anchor:tek yayin fontu K3P Scheherazade (sabit)',
  'glyphEvidence.font.faces[].status': 'anchor:log.txt loaded=',
  'glyphEvidence.font.faces[].weight': 'anchor:sabit 400',
  'glyphEvidence.font.faces[].unicodeRange': 'anchor:sabit Arapca aralik',
  'glyphEvidence.font.requests[]': 'anchor:log.txt woff2= (istek sayisi)',
  'glyphEvidence.font.requests[].name': 'anchor:127.0.0.1:9000 + assets/kao/font on eki',
  'glyphEvidence.font.requests[].transferSize': 'anchor:> 0 (gercek indirme)',
  'glyphEvidence.series[]': 'anchor:canli icerikten yeniden turetilir',
  'glyphEvidence.series[].index': 'anchor:glyphSeries() sirasi',
  'glyphEvidence.series[].ar': 'anchor:glyphSeries() metni',
  'glyphEvidence.series[].source': 'anchor:glyphSeries() kaynagi',
  'glyphEvidence.series[].corpus': 'anchor:glyphSeries() korpusu',
  'glyphEvidence.series[].marks': 'anchor:glyphSeries() isaret sayisi',
  'glyphEvidence.series[].sha256': 'anchor:sha256Text(ar) + glyphSeries()',
  'rows[].cta.coverStack[]': 'anchor:log.txt coverH= (tam liste ozeti)',
  'rows[].cta.coverStack[].tag': 'anchor:coverH= ozeti',
  'rows[].cta.coverStack[].cls': 'anchor:coverH= ozeti',
  'rows[].cta.coverStack[].y': 'anchor:log.txt coverY= + coverH=',
  'rows[].cta.coverStack[].h': 'anchor:coverH= ozeti + hiddenPx=',
  'rows[].cta.coverStack[].pos': 'anchor:coverH= ozeti',
  'rows[].cta.coverStack[].z': 'anchor:coverH= ozeti',
  'rows[].cta.overlapsContent[]': 'anchor:log.txt covN=/covPx=/covH=',
  'rows[].cta.overlapsContent[].tag': 'anchor:covH= ozeti',
  'rows[].cta.overlapsContent[].cls': 'anchor:covH= ozeti',
  'rows[].cta.overlapsContent[].y': 'anchor:covH= ozeti',
  'rows[].cta.overlapsContent[].h': 'anchor:covH= ozeti',
  'rows[].cta.overlapsContent[].pos': 'anchor:covH= ozeti',
  'rows[].cta.overlapsContent[].z': 'anchor:covH= ozeti',
  'rows[].cta.overlapsContent[].overlapPx': 'anchor:log.txt covPx= + covH=',
  'rows[].cta.overlapsContent[].txt': 'anchor:covH= ozeti',
  'rows[].cta.overlapsControl[]': 'anchor:log.txt collisions=/collisionPx= + deriveFindings',
  'rows[].cta.overlapsControl[].tag': 'anchor:collisionPx= + deriveFindings',
  'rows[].cta.overlapsControl[].cls': 'anchor:collisionPx= + deriveFindings',
  'rows[].cta.overlapsControl[].y': 'anchor:collisionPx= + deriveFindings',
  'rows[].cta.overlapsControl[].h': 'anchor:collisionPx= + deriveFindings',
  'rows[].cta.overlapsControl[].pos': 'anchor:collisionPx= + deriveFindings',
  'rows[].cta.overlapsControl[].z': 'anchor:collisionPx= + deriveFindings',
  'rows[].cta.overlapsControl[].overlapPx': 'anchor:log.txt collisionPx=',
  'rows[].cta.scroll.scrollTop': 'anchor:log.txt lscroll= + geometri',
  'rows[].cta.scroll.scrollHeight': 'anchor:lscroll= turetimi',
  'rows[].cta.scroll.clientHeight': 'anchor:lscroll= turetimi',
  'rows[].cta.scroll.localScroll': 'anchor:log.txt lscroll=',
  'glyphEvidence.imageFormat': 'anchor:diskteki bicim',
  'glyphEvidence.imageQuality': 'derived:kayipli kodlama parametresi; olcum degil',
  'glyphEvidence.clipHeight': 'anchor:glyphEvidence.sheet.sheetHeight',
  'glyphEvidence.viewportHeightDuringCapture': 'derived:min(sheet.sheetHeight,8000) cekim zamani gecici yuksekligi; kanit degil',
  'glyphEvidence.series': 'anchor:glyphSeries() canli icerikten yeniden turetilir',
};

/** Manifestte sozlesmede KAYITLI OLMAYAN alan yollarini dondurur. */
// Yol taklidi (22. denetim F23-2): sozlesme anahtarlari "rows[].cta.height" gibi YOL
// dizeleridir. Bir manifest alaninin ADI bu yollardan biriyle ayni olursa `has()` onu
// kayitli sanip geciriyordu (`m['rows[].cta.height']=999` -> rc=0). Bu yuzden nokta veya
// koseli parantez iceren alan ADLARI yapisal olarak yasaktir.
const FORGED_PATH_RE = /[.[\]]/;

export function unregisteredFields(manifest) {
  const unknown = new Set();
  const has = (key) => Object.prototype.hasOwnProperty.call(MANIFEST_FIELD_CONTRACT, key);
  const walk = (value, prefix) => {
    if (Array.isArray(value)) {
      for (const item of value) walk(item, `${prefix}[]`);
      return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      const full = `${prefix}.${key}`;
      // Yol taklidi: alan ADI bir yol dizesi tasiyamaz.
      if (FORGED_PATH_RE.test(key)) {
        unknown.add(`${full} (alan adı yol dizesi taşıyamaz)`);
        continue;
      }
      if (!has(full)) unknown.add(full);
      // Kayitli bir yaprak alanin ALTINA inilmez; tablo her seviyeyi acikca listeler.
      if (child && typeof child === 'object') walk(child, full);
    }
  };
  for (const [key, value] of Object.entries(manifest || {})) {
    if (FORGED_PATH_RE.test(key)) {
      unknown.add(`${key} (alan adı yol dizesi taşıyamaz)`);
      continue;
    }
    if (!has(key)) unknown.add(key);
    if (value && typeof value === 'object') walk(value, key);
  }
  return [...unknown].sort();
}

export function validateManifest(manifest, { root, screenshots = null, singleRun = false, logLines = null, issueFile = null } = {}) {
  const errors = [];
  if (!manifest || !Array.isArray(manifest.rows)) return { ok: false, errors: ['manifest kök nesnesi veya rows dizisi yok'], stats: null };
  const rows = manifest.rows;

  // KAPALI ALAN SOZLESMESI (21. denetim F22-0): tabloda kayitli olmayan alan = capasiz
  // beyan. Yeni bir alan eklemek, onu capalamadan mumkun degildir.
  for (const field of unregisteredFields(manifest)) {
    errors.push(`manifest alanı sözleşmede kayıtlı değil (çapasız beyan): ${field}`);
  }

  // 25. denetim F25-1: `productionFindings` KUMESEL olmali. Once bu kontrol yalniz
  // `validateCta` icindeydi; `--dogrula` girdigi `validateManifest` yolu tekrar eden kaydi
  // gormuyordu (ayni bulguyu iki kez yazmak / listeyi cogaltmak rc=0 veriyordu).
  {
    const seenFindings = new Set();
    for (const item of ((manifest && manifest.productionFindings) || [])) {
      const key = `${item && item.scene}|${item && item.kind}`;
      if (seenFindings.has(key)) errors.push(`üretim bulgusu tekrar ediyor: ${key}`);
      seenFindings.add(key);
    }
  }

  // 0) MANIFEST USTBILGISI (20. denetim F21-5): `origin`, `mode`, `card`, `profile`,
  // `captureScales`, `schema`, `schemaVersion` hicbir kapida okunmuyordu; `origin` ->
  // "http://evil.com" yapmak uc kapida da rc=0 veriyordu. `origin` log.txt'te bagimsiz
  // tanik olarak durur (cekim aninda yazilir), o yuzden oraya capalanir.
  if (manifest.origin !== undefined) {
    if (manifest.origin !== 'http://127.0.0.1:9000') {
      errors.push(`manifest.origin '${manifest.origin}' ≠ tek izinli origin http://127.0.0.1:9000`);
    }
    if (Array.isArray(logLines)) {
      const originLine = logLines.map(String).find((line) => /^origin:\s*\S+/.test(line.trim()));
      if (!originLine) {
        errors.push('log.txt origin satırı taşımıyor — origin çapalanamaz');
      } else if (!originLine.includes(manifest.origin)) {
        errors.push(`manifest.origin '${manifest.origin}' log.txt'teki '${originLine.trim()}' ile çelişiyor`);
      }
    }
  }
  if (manifest.card !== undefined && manifest.card !== 'K3PD-29') {
    errors.push(`manifest.card '${manifest.card}' ≠ 'K3PD-29'`);
  }
  if (manifest.mode !== undefined) {
    // Yalnız YAPISAL iki mod; serbest dize kabul edilmez.
    if (manifest.mode !== 'tam' && manifest.mode !== 'glif-referans') {
      errors.push(`manifest.mode '${manifest.mode}' geçersiz (tam | glif-referans)`);
    } else if (manifest.mode === 'glif-referans'
      && !(Array.isArray(rows) && rows.length === 1)) {
      errors.push('manifest.mode glif-referans ama tek satırlık glif sayfası değil');
    } else if (manifest.mode === 'tam' && !(Array.isArray(rows) && rows.length > 1)) {
      errors.push('manifest.mode tam ama tek satır — tam koşum birden çok sahne üretmeli');
    }
  }
  if (manifest.captureScales !== undefined) {
    if (!Array.isArray(manifest.captureScales) || manifest.captureScales.length === 0) {
      errors.push('manifest.captureScales boş/geçersiz — ölçülen ölçek kümesi beyan edilmeli');
    } else {
      const measured = [...new Set(rows.map((row) => row.captureScale))].sort((a, b) => a - b);
      const declaredScales = [...new Set(manifest.captureScales)].sort((a, b) => a - b);
      if (measured.join(',') !== declaredScales.join(',')) {
        errors.push(`manifest.captureScales [${declaredScales.join(',')}] ≠ satırlardan ölçülen [${measured.join(',')}]`);
      }
    }
  }
  // 25. denetim F26-1: `manifest.theme` ve `manifest.viewport` sozlesmede
  // `anchor:log.txt theme= / vw= vh= inset=` diye kayitliydi ama `--dogrula`/`--kapsam`
  // onlari HIC okumuyordu (yalniz `--glif-karsilastir` bakiyordu). Tek alanla
  // `light -> dark` ve inset kosumunda `safeAreaBottom 34 -> 0` yapmak rc=0 veriyordu.
  if (manifest.theme !== undefined && Array.isArray(rows) && rows.length) {
    const rowThemes = [...new Set(rows.map((row) => row.theme))];
    if (rowThemes.length !== 1) {
      errors.push(`manifest.theme tek tema beyan ediyor ama satırlarda ${rowThemes.length} tema var (${rowThemes.join(',')})`);
    } else if (manifest.theme !== rowThemes[0]) {
      errors.push(`manifest.theme '${manifest.theme}' ≠ satırların teması '${rowThemes[0]}'`);
    }
  }
  if (manifest.viewport !== undefined && Array.isArray(rows) && rows.length) {
    const vp = manifest.viewport || {};
    // Glif satiri HER KOSUMDA 460 px'lik dizi sayfasidir (mantiksal olarak kosum viewport'undan
    // bagimsiz); bu yuzden kosum viewport'u glif-disi satirlarla ozetlenir. Glif satirinin kendi
    // viewport'u `glyphEvidence.sheet.sw` ve `captureScale` uzerinden ayrica capalidir.
    const sceneRows = rows.filter((row) => row.sceneKind !== 'glyph' && row.profile !== 'glif');
    const basis = sceneRows.length ? sceneRows : rows;
    for (const key of ['width', 'height', 'safeAreaBottom']) {
      const rowValues = [...new Set(basis.map((row) => (row.viewport || {})[key]))];
      if (rowValues.length !== 1) {
        errors.push(`manifest.viewport.${key} tek değer beyan ediyor ama satırlarda ${rowValues.length} değer var (${rowValues.join(',')})`);
      } else if (vp[key] !== rowValues[0]) {
        errors.push(`manifest.viewport.${key} ${vp[key]} ≠ satırların ${rowValues[0]}`);
      }
    }
  }
  if (manifest.schema !== undefined && manifest.schema !== 'k3pd-visual-qa-manifest') {
    errors.push(`manifest.schema '${manifest.schema}' geçersiz`);
  }
  if (manifest.schemaVersion !== undefined && ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(manifest.schemaVersion)) {
    errors.push(`manifest.schemaVersion '${manifest.schemaVersion}' desteklenmiyor (1–11)`);
  }
  if (Array.isArray(logLines)) {
    const versionLine = logLines.map(String).find((line) => /^schemaVersion:/.test(line.trim()));
    if (manifest.schemaVersion >= 2 && versionLine !== `schemaVersion:${manifest.schemaVersion}`) errors.push('schemaVersion log tanığı eksik veya uyuşmuyor');
    if (versionLine && !(manifest.schemaVersion >= 2)) errors.push('schemaVersion 1 veya eksik sürüm yeni sürüm log tanığıyla çelişiyor');
    if (manifest.schemaVersion >= 3) {
      const sourceLine = logLines.find((line) => String(line).startsWith('sourceAssets:'));
      if (!Array.isArray(manifest.sourceAssets) || sourceLine !== `sourceAssets:${sha256Text(JSON.stringify(manifest.sourceAssets))}`) errors.push('v3 kaynak varlıkları log özetiyle uyuşmuyor');
    }
    if (manifest.schemaVersion >= 5) for (const item of manifest.ctaReport || []) {
      const suffix = manifest.schemaVersion >= 6 ? ` sha=${sha256Text(item.repeatJson || '')}` : '';
      if (!Array.isArray(item.viewportYs) || !Array.isArray(item.scrollTops) || !logLines.includes(`cta-repeat:${item.scene} y=${item.viewportYs[1]} scroll=${item.scrollTops[1]}${suffix}`)) errors.push(`ikinci CTA viewport log tanığı eksik: ${item.scene}`);
      if (!item.keyboard || !logLines.includes(`cta-keyboard:${item.scene} left=${item.keyboard.leftTarget} focused=${item.keyboard.focused} visible=${item.keyboard.visible}`)) errors.push(`CTA klavye log tanığı eksik: ${item.scene}`);
      if (manifest.schemaVersion >= 6 && (!item.keyboardFirst || !logLines.includes(`cta-keyboard-first:${item.scene} left=${item.keyboardFirst.leftTarget} focused=${item.keyboardFirst.focused} visible=${item.keyboardFirst.visible}`))) errors.push(`CTA ilk klavye log tanığı eksik: ${item.scene}`);
    }
  }
  // `manifest.profile` KOŞUM kimliğidir (taze tarayıcı profili adı), satırların `profile` alanı
  // ise YÜZEY kategorisidir (ana/onboarding/glif) — ikisi aynı şey değildir. Koşum kimliği
  // çekim ANINDA log.txt'ye yazılan `tmp-profil:` satırındaki `önek=` ile çapalanır; bu,
  // manifestten önce üretilen bağımsız tanıktır. Dizin adı operatörün seçimidir, tanık değildir.
  if (manifest.profile !== undefined) {
    if (typeof manifest.profile !== 'string' || !manifest.profile.trim()) {
      errors.push('manifest.profile boş/geçersiz — koşum kimliği beyan edilmeli');
    } else if (Array.isArray(logLines)) {
      const prefixLine = logLines.map(String).find((line) => /^tmp-profil:/.test(line.trim()) && /önek=/.test(line));
      if (!prefixLine) {
        errors.push('log.txt tmp-profil satırı taşımıyor — koşum kimliği çapalanamaz');
      } else {
        const prefix = (/önek=([^\s|]+)/.exec(prefixLine) || [])[1] || null;
        if (!prefix) {
          errors.push('log.txt tmp-profil satırında önek= yok — koşum kimliği çapalanamaz');
        } else if (manifest.profile !== prefix) {
          errors.push(`manifest.profile '${manifest.profile}' log.txt'teki önek=${prefix} ile çelişiyor`);
        }
      }
    }
  }
  // 22. denetim F23-1: SOZLESMEDE KAYITLI ama HIC OKUNMAYAN alanlar. Sozlesme "yeni alan
  // eklenemez" diyordu; ama kayitli bir alani DEGISTIRMEK hala serbestti (20/60 yaprak alanin
  // okuyucusu yoktu: font.faces[].weight/family/unicodeRange, requests[].name/transferSize,
  // ctaReport[].viewport/stage, lexiconVersion, surahVersion, clipHeight,
  // viewportHeightDuringCapture, imageFormat, rows[].scrollTop). Artik her biri baglanir.
  {
    // (a) Goruntu bicimi diskteki dosyadan okunur (beyan degil).
    const formatOf = (file) => {
      const buf = fs.readFileSync(file);
      if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
      if (buf.length > 8 && buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') return 'png';
      return 'bilinmiyor';
    };
    if (manifest.imageFormat !== undefined && manifest.rows.length && root) {
      const firstShot = manifest.rows[0].screenshot;
      if (firstShot && fs.existsSync(path.join(root, firstShot))) {
        const actual = formatOf(path.join(root, firstShot));
        if (String(manifest.imageFormat).toLowerCase() !== actual) {
          errors.push(`manifest.imageFormat '${manifest.imageFormat}' ≠ diskteki '${actual}'`);
        }
      }
    }
    // (b) lexikon/sure surumleri CANLI icerikten yeniden turetilir.
    const live = glyphSeries();
    const glyphBlock = manifest.glyphEvidence;
    if (glyphBlock) {
      if (glyphBlock.lexiconVersion !== undefined && glyphBlock.lexiconVersion !== live.lexiconVersion) {
        errors.push(`glyphEvidence.lexiconVersion '${glyphBlock.lexiconVersion}' ≠ canlı içerik '${live.lexiconVersion}'`);
      }
      if (glyphBlock.surahVersion !== undefined && glyphBlock.surahVersion !== live.surahVersion) {
        errors.push(`glyphEvidence.surahVersion '${glyphBlock.surahVersion}' ≠ canlı içerik '${live.surahVersion}'`);
      }
      if (glyphBlock.imageFormat !== undefined && glyphBlock.screenshot && root) {
        const shotPath = path.join(root, glyphBlock.screenshot);
        if (fs.existsSync(shotPath)) {
          const actual = formatOf(shotPath);
          if (String(glyphBlock.imageFormat).toLowerCase() !== actual) {
            errors.push(`glyphEvidence.imageFormat '${glyphBlock.imageFormat}' ≠ diskteki '${actual}'`);
          }
        }
      }
      // `clipHeight` = glif SAYFASININ yuksekligi (kirpim yuksekligi), viewport degil:
      // `sheet.sheetHeight` ile birebir eslesir. `viewportHeightDuringCapture` cekim anindaki
      // gecici sayfa yuksekligidir; `min(preMetrics.sheetHeight, 8000)` olarak TURETILIR, bu
      // yuzden kanit olarak aktarilmaz (sozlesmede `derived:`). Ikisi deger olarak da baglanir.
      const gRow = glyphBlock.screenshot ? rows.find((row) => row.screenshot === glyphBlock.screenshot) : null;
      if (glyphBlock.clipHeight !== undefined && glyphBlock.sheet
        && typeof glyphBlock.sheet.sheetHeight === 'number'
        && glyphBlock.clipHeight !== glyphBlock.sheet.sheetHeight) {
        errors.push(`glyphEvidence.clipHeight ${glyphBlock.clipHeight} ≠ sheet.sheetHeight ${glyphBlock.sheet.sheetHeight}`);
      }
      // 26. denetim F27-1: `viewportHeightDuringCapture` yalniz ARALIK denetimindeydi; `1`
      // geciyordu. Yazici bunu `min(sheetHeight, 8000)` olarak TURETIYOR, bu yuzden artik
      // turetimi de dayatilir (S9'daki `derived:` kaydiyla tutarli).
      if (glyphBlock.viewportHeightDuringCapture !== undefined) {
        const vph = glyphBlock.viewportHeightDuringCapture;
        if (typeof vph !== 'number' || !(vph > 0) || vph > 8000) {
          errors.push(`glyphEvidence.viewportHeightDuringCapture ${vph} geçersiz (0 < h ≤ 8000)`);
        } else if (glyphBlock.sheet && typeof glyphBlock.sheet.sheetHeight === 'number') {
          const derivedVph = Math.min(glyphBlock.sheet.sheetHeight, 8000);
          if (vph !== derivedVph) {
            errors.push(`glyphEvidence.viewportHeightDuringCapture ${vph} ≠ min(sheetHeight, 8000) = ${derivedVph}`);
          }
        }
        void gRow;
      }
    }
    // (c) FONT FACE/ISTEK KAYITLARI: tek yayin fontu sabittir; istek yalniz izinli origin'e gider
    // ve gercek bir indirme olmali (transferSize > 0). `woff2=` sayisi zaten log'la capali.
    if (glyphBlock && glyphBlock.font) {
      const faces = Array.isArray(glyphBlock.font.faces) ? glyphBlock.font.faces : [];
      for (const [i, face] of faces.entries()) {
        if (!face || typeof face !== 'object') { errors.push(`glyphEvidence.font.faces[${i}] nesne değil`); continue; }
        if (face.family !== 'K3P Scheherazade') {
          errors.push(`glyphEvidence.font.faces[${i}].family '${face.family}' ≠ yayın fontu 'K3P Scheherazade'`);
        }
        if (face.weight !== '400') {
          errors.push(`glyphEvidence.font.faces[${i}].weight '${face.weight}' ≠ yayın ağırlığı '400'`);
        }
        // Arapca blok, yayin fontunda "U+600-6FF" yazimiyla gelir (bastaki sifirlar yok).
        const rangeText = String(face.unicodeRange || '').replace(/\s+/g, '');
        if (!/U\+0?600-0?6FF/i.test(rangeText)) {
          errors.push(`glyphEvidence.font.faces[${i}].unicodeRange Arapça bloğunu (U+600-6FF) taşımıyor`);
        }
        if (face.status !== 'loaded' && face.status !== 'unloaded' && face.status !== 'error') {
          errors.push(`glyphEvidence.font.faces[${i}].status '${face.status}' geçersiz`);
        }
      }
      const reqs = Array.isArray(glyphBlock.font.requests) ? glyphBlock.font.requests : [];
      for (const [i, req] of reqs.entries()) {
        if (!req || typeof req !== 'object') { errors.push(`glyphEvidence.font.requests[${i}] nesne değil`); continue; }
        const name = String(req.name || '');
        if (!name.startsWith('http://127.0.0.1:9000/')) {
          errors.push(`glyphEvidence.font.requests[${i}].name izinli origin ile başlamıyor: ${name.slice(0, 60)}`);
        }
        // YAYIN FONTU TAM ADI (25. denetim F26-4): onceden yalniz `assets/kao/font/` oneki
        // aranıyordu; `Sahte-Font.woff2` gibi bir ad geciyordu. Artik tek yayin fontu.
        if (!/\/assets\/kao\/font\/ScheherazadeNew-Regular\.k3p\.woff2(\?|$)/.test(name)) {
          errors.push(`glyphEvidence.font.requests[${i}].name yayın fontu ScheherazadeNew-Regular.k3p.woff2 değil: ${name.slice(0, 70)}`);
        }
        // GERCEK INDIRME BOYUTU (F26-4): kucuk bir woff2 araligina baglanir; `999999` gecmiyordu.
        if (!(typeof req.transferSize === 'number' && req.transferSize > 0)) {
          errors.push(`glyphEvidence.font.requests[${i}].transferSize ${req.transferSize} gerçek indirme değil`);
        } else if (req.transferSize > MAX_FONT_BYTES) {
          errors.push(`glyphEvidence.font.requests[${i}].transferSize ${req.transferSize} > ${MAX_FONT_BYTES} (yayın fontu için imkânsız)`);
        }
      }
    }
    // (d) ctaReport: `viewport` SATIRIN viewport'u, `stage` CTA secicisi tablosuyla tutarli.
    const report2 = Array.isArray(manifest.ctaReport) ? manifest.ctaReport : [];
    for (const item of report2) {
      const ownerRow = rows.find((row) => row.scene === item.scene && row.cta && row.cta.present === true);
      if (item.viewport !== undefined && ownerRow && ownerRow.viewport) {
        const want = `${ownerRow.viewport.width}x${ownerRow.viewport.height}+${ownerRow.viewport.safeAreaBottom}`;
        if (String(item.viewport) !== want) {
          errors.push(`ctaReport (${item.scene}): viewport '${item.viewport}' ≠ satırın '${want}'`);
        }
      }
      // `stage`, satirin KENDI `cta.selector`'unden turetilir: aşama adi secicide
      // `data-lesson-stage="X"` olarak gorunur ya da secici tablosundaki sabit bir dizedir.
      // Sabit bir enum listesi tutmak yerine olcumden turetiliyor (aşama kümesi büyüyebilir).
      if (item.stage !== undefined && ownerRow && ownerRow.cta) {
        const selector = String(ownerRow.cta.selector || '');
        const stageFromSelector = (/data-lesson-stage="([a-z]+)"/.exec(selector) || [])[1] || null;
        if (stageFromSelector) {
          if (item.stage !== stageFromSelector) {
            errors.push(`ctaReport (${item.scene}): stage '${item.stage}' ≠ satırın seçicisindeki '${stageFromSelector}'`);
          }
        } else if (!CTA_STAGE_NAMES.has(item.stage)) {
          errors.push(`ctaReport (${item.scene}): stage '${item.stage}' seçiciden türetilemedi ve bilinen aşama adı değil`);
        }
      }
    }
    // (e) `rows[].scrollTop` = satirin cta.scrollTop'u (CTA varsa).
    for (const row of rows) {
      if (row.scrollTop === null || row.scrollTop === undefined) continue;
      if (row.cta && row.cta.present === true && row.cta.scrollTop !== undefined
        && Math.round(row.scrollTop) !== Math.round(row.cta.scrollTop)) {
        errors.push(`satır (${row.scene}): scrollTop ${row.scrollTop} ≠ cta.scrollTop ${row.cta.scrollTop}`);
      }
    }
  }
  // 1) Zorunlu alanlar + hash biçimi.
  rows.forEach((row, index) => {
    if (manifest.schemaVersion >= 8 && (!validateSceneActions(row.actionsJson) || !Array.isArray(row.log) || !row.log[0]?.includes(` actionsH=${sha256Text(row.actionsJson || '')} `))) errors.push(`satır ${index} (${row.scene}): sahne eylem geometrisi veya log özeti geçersiz`);
    if (manifest.schemaVersion >= 9 && !validateSceneActionsV9(row.actionsJson, row)) errors.push(`satır ${index} (${row.scene}): sahne kontrol kapsamı/geometrisi çelişkili`);
    if (manifest.schemaVersion >= 4 && (!Array.isArray(row.log) || !/^\S+: theme=.*\bfontReady=true(?:\s|\|)/.test(row.log[0] || ''))) errors.push(`satır ${index} (${row.scene}): font yükleme tanığı eksik veya başarısız`);
    if (manifest.schemaVersion >= 7 && row.cta && row.cta.present && (!Array.isArray(row.log) || !row.log[0]?.includes(` clipH=${sha256Text(row.cta.clipJson || '')} `))) errors.push(`satır ${index} (${row.scene}): kırpıcı ata log özeti eksik`);
    for (const field of REQUIRED_ROW_FIELDS) {
      if (row[field] === undefined || row[field] === null || row[field] === '') errors.push(`satır ${index}: ${field} eksik`);
    }
    if (row.sha256 && !/^[0-9a-f]{64}$/.test(row.sha256)) errors.push(`satır ${index}: sha256 biçimi bozuk`);
    // `viewport` alt alanları BURADA doğrulanır (9. denetim F9-2): `manifestRow()` yalnız
    // üretim yolunu korur; `validateManifest` eskiden yalnız alanın VARLIĞINA bakıyordu, bu
    // yüzden `viewport.width` silinerek genişlik denetimi sessizce devre dışı bırakılabiliyordu.
    if (row.viewport !== undefined) {
      for (const key of ['width', 'height', 'safeAreaBottom']) {
        const value = row.viewport && row.viewport[key];
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
          errors.push(`satır ${index} (${row.scene}): viewport.${key} eksik/geçersiz (${value})`);
        }
      }
      if (row.viewport && typeof row.viewport.width === 'number' && !(row.viewport.width > 0)) {
        errors.push(`satır ${index} (${row.scene}): viewport.width 0 olamaz`);
      }
    }
    // Yakalama ölçeği TAM SAYI ve ≥1 olmalı (CDP legal değerler); keyfî float kabul edilmez.
    if (row.captureScale !== undefined
      && !(Number.isInteger(row.captureScale) && row.captureScale >= 1)) {
      errors.push(`satır ${index}: captureScale tam sayı ≥1 olmalı (${row.captureScale})`);
    }
    if (row.theme && row.theme !== 'light' && row.theme !== 'dark') errors.push(`satır ${index}: tema '${row.theme}' geçersiz`);
    if (row.theme && THEME_TOKENS[row.theme]) {
      const want = THEME_TOKENS[row.theme];
      const seen = row.verifiedTheme || {};
      // F-11'in asıl hatası "yanlış tema ETİKETLENMİŞ görüntü"dür. Yalnız data-theme bakmak
      // yetmez: computed tokenlar da eşleşmeli. Token yoksa ölçüm yapılmamış demektir.
      if (seen.dataTheme !== want.dataTheme) {
        errors.push(`satır ${index} (${row.scene}): etiket '${row.theme}' ama root data-theme '${seen.dataTheme}'`);
      }
      if (!seen.surface) {
        errors.push(`satır ${index} (${row.scene}): computed --quran-surface ölçülmemiş`);
      } else if (String(seen.surface).toLowerCase() !== want.surface.toLowerCase()) {
        errors.push(`satır ${index} (${row.scene}): '${row.theme}' etiketli satırda --quran-surface '${seen.surface}' ≠ '${want.surface}'`);
      }
      if (!seen.ink) {
        errors.push(`satır ${index} (${row.scene}): computed --quran-ink ölçülmemiş`);
      } else if (String(seen.ink).toLowerCase() !== want.ink.toLowerCase()) {
        errors.push(`satır ${index} (${row.scene}): '${row.theme}' etiketli satırda --quran-ink '${seen.ink}' ≠ '${want.ink}'`);
      }
    }
    if (!Array.isArray(row.log) || row.log.length === 0) errors.push(`satır ${index} (${row.scene}): log satırı yok`);
    // SAHNE TÜRÜ ÇAPALARI (N7-F1): `sceneKind` kendi beyanıdır, tek başına muafiyet/zorunluluk
    // açamaz. Kapalı enum + sahne-adı öneki ile çapraz doğrulanır.
    // PROFİL ÇAPASI (N8-F3): profil de ad önekinden türetilmeli.
    if (row.profile !== undefined && row.scene !== undefined) {
      const wantProfile = expectedProfile(row.scene);
      if (row.profile !== wantProfile) {
        errors.push(`satır ${index} (${row.scene}): profile '${row.profile}' sahne adının gerektirdiği '${wantProfile}' ile çelişiyor`);
      }
    }
    if (row.sceneKind !== undefined) {
      if (!SCENE_KINDS.includes(row.sceneKind)) {
        errors.push(`satır ${index} (${row.scene}): bilinmeyen sceneKind '${row.sceneKind}' (enum dışı)`);
      } else {
        const want = expectedSceneKind(row.scene);
        if (want && want !== row.sceneKind) {
          errors.push(`satır ${index} (${row.scene}): sceneKind '${row.sceneKind}' sahne adının gerektirdiği '${want}' ile çelişiyor`);
        }
        if (!want) errors.push(`satır ${index} (${row.scene}): sahne adı bilinen bir desene uymuyor (tür çapalanamaz)`);
      }
    }
    // BEYAN EDİLEN SERT KUSUR: "beklenmeyen overflow/clipping = 0" alt kabulü manifestte
    // `SERT:` önekli bir bulgu varken PASS veremez. Önceki sürüm bu satırları yalnız
    // `issues.txt` ile karşılaştırıyor, içeriğine hiç bakmıyordu (5. denetim R5-F3).
    for (const issue of (row.issues || [])) {
      if (String(issue).startsWith('SERT:')) errors.push(`satır ${index} (${row.scene}): beyan edilen sert taşma/kırpılma: ${String(issue).slice(0, 90)}`);
    }
  });

  // 2) Sahne kapsaması: aynı profil + viewport + sahne, İKİ temada da bulunmalı.
  //    (Kart: "320/390/460×açık/koyu" — yani tek viewport'ta iki tema beklenir.)
  if (!singleRun) {
    const scenesByProfileViewport = new Map();
    for (const row of rows) {
      if (!row.viewport || !row.profile || !row.scene) continue;
      const key = `${row.profile}|${viewportKey(row.viewport)}|${row.scene}`;
      if (!scenesByProfileViewport.has(key)) scenesByProfileViewport.set(key, new Set());
      scenesByProfileViewport.get(key).add(row.theme);
    }
    for (const [key, themes] of scenesByProfileViewport) {
      if (themes.size < 2) errors.push(`sahne tek temada kaldı: ${key} (${[...themes].join(',')}) — açık ve koyu birlikte çekilmeli`);
    }
    const themesSeen = new Set(rows.map((row) => row.theme));
    if (!themesSeen.has('light') || !themesSeen.has('dark')) errors.push('iki tema birlikte temsil edilmiyor');

    // 3) Profil × viewport × tema kapsaması: ana ve onboarding profillerinin her biri,
    //    her viewport için iki temayı da taşımalı.
    const profiles = new Set(rows.map((row) => row.profile));
    for (const profile of ['ana', 'onboarding']) {
      if (!profiles.has(profile)) errors.push(`profil eksik: ${profile}`);
    }
    const viewports = new Map();
    for (const row of rows) if (row.viewport) viewports.set(viewportKey(row.viewport), row.viewport);
    for (const profile of profiles) {
      for (const [key, viewport] of viewports) {
        for (const theme of ['light', 'dark']) {
          const found = rows.some((row) => row.profile === profile
            && row.viewport && viewportKey(row.viewport) === key && row.theme === theme);
          if (!found) errors.push(`kapsam eksik: ${profile} ${key} ${theme}`);
        }
      }
    }
  } else {
    // Tek koşumda da tema ETİKET/ÖLÇÜM tutarlılığı zorunludur.
    const themesSeen = new Set(rows.map((row) => row.theme));
    if (themesSeen.size !== 1) errors.push(`tek koşum tek tema taşımalı (bulundu ${[...themesSeen].join(',')})`);
  }

  // SCREENSHOT ADI SAHNEDEN TÜRETİLİR (14. denetim F14-2): çekim aracı dosyayı her zaman
  // `${scene}.${ext}` olarak yazar, ama doğrulayıcı bunu dayatmıyordu. İki satırın
  // `screenshot`+`sha256` çiftini takas etmek (iki alan) bir sahnenin TÜM görsel kanıtını
  // başka bir ad altına taşıyor ve iki kapı da yeşil kalıyordu. Ad, sahne kimliğine bağlanır.
  // Disk GEREKTİRMEZ: bu yüzden `root` korumasının DIŞINDA denetlenir.
  const SCREENSHOT_NAME_RE = /^(.+)\.(png|webp)$/i;
  for (const row of rows) {
    if (!row.screenshot || !row.scene) continue;
    const match = SCREENSHOT_NAME_RE.exec(row.screenshot);
    if (!match) { errors.push(`screenshot adı png/webp değil: ${row.screenshot}`); continue; }
    if (match[1] !== row.scene) {
      errors.push(`screenshot adı sahneden türetilmemiş: '${row.screenshot}' ≠ '${row.scene}'`);
    }
  }

  // 4) Disk eşliği: satır sayısı = gerçek dosya sayısı, hash'ler bayt-eş, görüntüler GERÇEK.
  const stats = { rows: rows.length, uniqueScenes: new Set(rows.map((row) => row.scene)).size };
  const onDisk = new Set();
  if (root) {
    const byPath = new Map();
    rows.forEach((row, index) => {
      if (!row.screenshot) return;
      if (byPath.has(row.screenshot)) errors.push(`yinelenen screenshot yolu: ${row.screenshot} (satır ${byPath.get(row.screenshot)} ve ${index})`);
      byPath.set(row.screenshot, index);
      const abs = path.resolve(root, row.screenshot);
      onDisk.add(abs);
      if (!fs.existsSync(abs)) { errors.push(`screenshot yok: ${row.screenshot}`); return; }
      const actual = sha256File(abs);
      if (actual !== row.sha256) errors.push(`sha256 uyuşmuyor: ${row.screenshot} (manifest ${row.sha256.slice(0, 12)}…, disk ${actual.slice(0, 12)}…)`);
      // BOŞ/BOZUK ÇEKİM: `sha256('')` de 64 haneliktir, yani hash eşliği tek başına
      // 0 baytlık bir dosyayı kabul ederdi (denetim bulgusu F3). Gerçek bayt sayısı ve
      // görüntü başlığındaki piksel boyutu ölçülür.
      const info = imageSize(abs);
      if (!info.ok) { errors.push(`görüntü okunamadı: ${row.screenshot} (${info.reason})`); return; }
      if (info.bytes < MIN_IMAGE_BYTES) errors.push(`görüntü çok küçük: ${row.screenshot} (${info.bytes} < ${MIN_IMAGE_BYTES} bayt)`);
      if (!(info.width > 0) || !(info.height > 0)) errors.push(`görüntü boyutu sıfır: ${row.screenshot}`);
      // Beklenen piksel GENİŞLİĞİ: görüntü viewport genişliği × satırın BİLDİRDİĞİ yakalama
      // ölçeği. `captureScale` böylece doğrulanabilir bir iddia olur: yanlış ölçekte alınmış
      // bir çekim genişlik uyuşmazlığıyla reddedilir (denetim bulgusu F5 — "2 ≠ 2" totolojisi).
      // Yükseklik serbesttir (glif kırpımı sayfa yüksekliği kadardır).
      if (row.viewport && typeof row.viewport.width === 'number' && row.viewport.width > 0) {
        const wantWidth = row.viewport.width * row.captureScale;
        if (info.width !== wantWidth) {
          errors.push(`görüntü genişliği ${info.width}px ≠ beklenen ${wantWidth}px (${row.viewport.width}px × ${row.captureScale}×): ${row.screenshot}`);
        }
        // NOT: `viewport.width`in log'daki `vw=` ile eşliği yukarıda (log bloğunda)
        // ayrıca denetlenir — burada yalnız piksel genişliği karşılaştırılır.
      } else {
        errors.push(`satır ${index} (${row.scene}): viewport.width yok — genişlik denetimi yapılamaz`);
      }
      stats.images = stats.images || { minBytes: Infinity, minWidth: Infinity, maxWidth: 0 };
      stats.images.minBytes = Math.min(stats.images.minBytes, info.bytes);
      stats.images.minWidth = Math.min(stats.images.minWidth, info.width);
      stats.images.maxWidth = Math.max(stats.images.maxWidth, info.width);
    });

    if (screenshots) {
      const declared = new Set([...onDisk].map((abs) => path.resolve(abs)));
      for (const file of screenshots) {
        const abs = path.resolve(file);
        if (!declared.has(abs)) errors.push(`manifest dışı screenshot: ${path.relative(root, abs)}`);
      }
      if (screenshots.length !== rows.length) errors.push(`sayım uyuşmuyor: disk ${screenshots.length} ≠ manifest ${rows.length}`);
    }
    stats.uniqueScreenshots = onDisk.size;
  }

  // 5) Log ↔ manifest eşliği: `log.txt` içindeki SAHNE satırları (koşum üstbilgisi değil)
  // satır sayısıyla birebir olmalı. Aksi hâlde "screenshot == log == manifest" iddiası
  // yalnız aracın kendi dizileriyle sınırlı kalır (denetim bulgusu 3).
  if (Array.isArray(logLines)) {
    const sceneLines = logLines.filter((line) => /^[^:]*: theme=/.test(line));
    if (sceneLines.length !== rows.length) {
      errors.push(`log eşleşmiyor: log.txt'te ${sceneLines.length} sahne satırı ≠ manifest ${rows.length} satır`);
    }
    // Her satır KENDİ log satırını taşımalı (14. denetim F14-1): önceden yalnız
    // `sceneLines.includes(line)` — yani metnin log.txt'te HERHANGİ bir yerde bulunması —
    // denetleniyordu. `row.log` başka bir sahnenin satırıyla değiştirildiğinde (tek alan)
    // hiçbir şey itiraz etmiyordu; `row.log` dekoratifti. Artık (a) satırın sahne öneki
    // `row.scene` ile aynı olmalı, (b) satır log.txt'te birebir bulunmalı ve (c) aynı log
    // satırı iki manifest satırına atanamaz.
    const claimedLogLines = new Set();
    for (const row of rows) {
      const line = Array.isArray(row.log) ? row.log[0] : null;
      if (!line) continue;
      const lineScene = String(line).split(':')[0].trim();
      if (lineScene !== row.scene) {
        errors.push(`log satırı sahne adıyla çelişiyor: satır '${lineScene}' ≠ row.scene '${row.scene}'`);
      }
      if (!sceneLines.includes(line)) errors.push(`log satırı log.txt'te yok: ${row.scene}`);
      if (claimedLogLines.has(line)) errors.push(`aynı log satırı birden çok manifest satırına atanmış: ${row.scene}`);
      claimedLogLines.add(line);
    }
    // SAHNE ENVANTERİ TABANI (N7-F2): satırlar sessizce kırpılamaz. Koşumun kendi
    // `log.txt`'i kaç sahne çekildiğini yazar; manifest satır kümesi ONUNLA aynı olmalı.
    // Sabit bir sayı dayatılmaz (kart "ekran sayısını sabitleme" diyor), ama log ile
    // manifest arasındaki fark kabul edilmez.
    // Log'dan GERÇEK viewport genişliğini sahne başına çıkar (`vw=NNN`). Bu, manifestin
    // `viewport.width` beyanını çapraz doğrulamanın tek bağımsız kaynağıdır (F9-1).
    const loggedVw = new Map();
    for (const line of sceneLines) {
      const sceneName = String(line).split(':')[0].trim();
      const match = /\bvw=(\d+)\b/.exec(String(line));
      const vhMatch = /\bvh=(\d+)\b/.exec(String(line));
      const insetMatch = /\binset=(\d+)\b/.exec(String(line));
      // TEMA ÇAPASI (10. denetim F10-1): `theme` + `verifiedTheme` İKİSİ DE manifestten
      // geliyordu; diskteki `log.txt` bu değerleri zaten yazdığı hâlde hiç okunmuyordu.
      // Böylece gerçek bir koyu koşum yalnız manifest düzenlenerek "açık" gösterilebiliyordu.
      const themeMatch = /\btheme=([a-z]+)\b/.exec(String(line));
      const surfaceMatch = /\bsurface=(#[0-9A-Fa-f]{6})\b/.exec(String(line));
      // ÇAKIŞMA SAYISI DA LOG'TA (10. denetim F10-5): `overlapsControl` dizisi tek başına
      // beyandı; boşaltılınca bulgu da türetilemiyordu (kapalı döngü). Çekim anında yazılan
      // `collisions=`/`collisionPx=` değerleri bağımsız tanıktır ve beyanla eşleşmek zorunda.
      const collisionMatch = /\bcollisions=(\d+)\b/.exec(String(line));
      const collisionPxMatch = /\bcollisionPx=(\d+)\b/.exec(String(line));
      // ÖRTÜLME ÇAPASI (11. denetim F11-2): `cta.hiddenBy` beyanı da log'a yazılır.
      const hiddenMatch = /\bhidden=(true|false)\b/.exec(String(line));
      const hiddenPxMatch = /\bhiddenPx=(\d+)\b/.exec(String(line));
      // SERT BULGU TANIKLARI (12. denetim F12-1): `overflowX=` ve `hard=` çekim anında
      // yazılıyordu ama HİÇ okunmuyordu; taşma kabulü tamamen `rows[].issues` beyanına
      // dayanıyordu. `hard=` sert türlerin TAMAMINI taşır (`yok` = hiçbiri).
      const overflowMatch = /\boverflowX=(true|false)\b/.exec(String(line));
      // CTA HEDEF/FOKUS TANIKLARI (17. denetim F17-1): `visible` geometriden türetiliyordu ama
      // `height`/`width`/`focusReachable` hâlâ kendi beyanıydı; tek alanla (`height 12→50`,
      // `focusReachable false→true`, `width 20→350`) `rc=1` sessizce `rc=0` oluyordu.
      const ctaWMatch = /\bctaW=(\d+)\b/.exec(String(line));
      const ctaHMatch = /\bctaH=(-?\d+)\b/.exec(String(line));
      const ctaXMatch = /\bctaX=(-?\d+)\b/.exec(String(line));
      const ctaRMatch = /\bctaR=(-?\d+)\b/.exec(String(line));
      // 25. denetim F26-2: dikey eksen taniklari (once sozlesmede ADI vardi, log'da YOKTU).
      const ctaYMatch = /\bctaY=(-?\d+)\b/.exec(String(line));
      const ctaLayMatch = /\bctaLay=(-?\d+)\b/.exec(String(line));
      const ctaScrMatch = /\bctaScr=(-?\d+)\b/.exec(String(line));
      const focusMatch = /\bfocus=(true|false)\b/.exec(String(line));
      // SOZLESME ALANLARI (20. denetim F20-1): `cta.selector` -> `sel=` (sha256 oneki),
      // `overlapsContent` -> `covN=`, `scroll.localScroll` -> `lscroll=`, onboarding
      // `verifiedTheme.onb` -> `onb=`, glif `series[]` -> `ser=`.
      const selMatch = /\bsel=([0-9a-f]{12}|-1)\b/.exec(String(line));
      const covNMatch = /\bcovN=(-?\d+)\b/.exec(String(line));
      const lscrollMatch = /\blscroll=(true|false|na)\b/.exec(String(line));
      const onbMatch = /\bonb=([a-z]+|yok)\b/.exec(String(line));
      const serMatch = /\bser=([0-9a-f]{16})\b/.exec(String(line));
      // 21. denetim F21-3: icerik-ortulme buyuklugu ve coverStack basi da log'a yazilir.
      const covPxMatch = /\bcovPx=(\d+)\b/.exec(String(line));
      const coverYMatch = /\bcoverY=(-?\d+)\b/.exec(String(line));
      const sheetHMatch = /\bh=(\d+)\b/.exec(String(line));
      // 23. denetim F24-3: sheet geometrisi log'a da yazilir (minH/firstTop/lastTop/sw/cw).
      const hMinMatch = /\bhMin=(\d+)\b/.exec(String(line));
      const hFirstMatch = /\bhFirst=(-?\d+)\b/.exec(String(line));
      const hLastMatch = /\bhLast=(-?\d+)\b/.exec(String(line));
      const hSwMatch = /\bhSw=(\d+)\b/.exec(String(line));
      const hCwMatch = /\bhCw=(\d+)\b/.exec(String(line));
      // 23. denetim F24-1: font check=/distinct= de log'da var; --dogrula bunlari okumuyordu.
      const fCheckMatch = /\bcheck=(true|false)\b/.exec(String(line));
      const fDistinctMatch = /\bdistinct=(true|false)\b/.exec(String(line));
      const covHMatch = /\bcovH=([0-9a-f]{12}|-1)\b/.exec(String(line));
      const coverHMatch = /\bcoverH=([0-9a-f]{12}|-1)\b/.exec(String(line));
      // ONBOARDING YÜZEY TANIKLARI (13. denetim F13-3): `node=`/`text=` her onboarding log
      // satırına yazılıyordu ama HİÇ ayrıştırılmıyordu; oysa EVIDENCE §5 o1/o2/o3–o7 yüzey
      // dağılımını bu alanlara dayandırıyordu. Artık ayrıştırılır, zorunludur ve satırdaki
      // kendi `log` metniyle tutarlı olması gerekir.
      const nodeMatch = /\bnode=([a-z]+)\b/.exec(String(line));
      const textMatch = /\btext=([0-9a-f]{12})\b/.exec(String(line));
      // Ayırıcı: çekim aracı `,` ile birleştirir; ayrıştırıcı önceden `|` beklediği için
      // çok türlü satırlar sessizce KIRPILIYORDU (13. denetim F13-4). İkisi de kabul edilir.
      const hardMatch = /\bhard=([A-Za-zÇĞİÖŞÜçğıöşü0-9\-]*(?:[,|][A-Za-zÇĞİÖŞÜçğıöşü0-9\-]+)*)\b/.exec(String(line));
      // KAYIT KOŞULSUZ (11. denetim F11-1): önceden sahne yalnız `vw=` eşleşirse
      // haritaya giriyordu. ` vw=390` token'ını silmek — 11 karakterlik tek düzenleme —
      // tema, surface, viewport ve çakışma çapalarının HEPSİNİ sessizce devre dışı
      // bırakıyordu (`if (!logged || !row.viewport) continue;`). Artık sahne her zaman
      // kaydedilir; eksik alan `null` olarak taşınır ve aşağıda AÇIKÇA hata verir.
      if (sceneName) {
        loggedVw.set(sceneName, {
          width: match ? Number(match[1]) : null,
          height: vhMatch ? Number(vhMatch[1]) : null,
          safeAreaBottom: insetMatch ? Number(insetMatch[1]) : null,
          theme: themeMatch ? themeMatch[1] : null,
          surface: surfaceMatch ? surfaceMatch[1] : null,
          collisions: collisionMatch ? Number(collisionMatch[1]) : null,
          collisionPx: collisionPxMatch ? Number(collisionPxMatch[1]) : null,
          hidden: hiddenMatch ? hiddenMatch[1] === 'true' : null,
          hiddenPx: hiddenPxMatch ? Number(hiddenPxMatch[1]) : null,
          overflowX: overflowMatch ? overflowMatch[1] === 'true' : null,
          hard: hardMatch ? hardMatch[1] : null,
          node: nodeMatch ? nodeMatch[1] : null,
          text: textMatch ? textMatch[1] : null,
          ctaW: ctaWMatch ? Number(ctaWMatch[1]) : null,
          ctaH: ctaHMatch ? Number(ctaHMatch[1]) : null,
          ctaX: ctaXMatch ? Number(ctaXMatch[1]) : null,
          ctaR: ctaRMatch ? Number(ctaRMatch[1]) : null,
          ctaY: ctaYMatch ? Number(ctaYMatch[1]) : null,
          ctaLay: ctaLayMatch ? Number(ctaLayMatch[1]) : null,
          ctaScr: ctaScrMatch ? Number(ctaScrMatch[1]) : null,
          focus: focusMatch ? focusMatch[1] === 'true' : null,
          sel: selMatch ? selMatch[1] : null,
          covN: covNMatch ? Number(covNMatch[1]) : null,
          lscroll: lscrollMatch ? lscrollMatch[1] : null,
          onb: onbMatch ? onbMatch[1] : null,
          ser: serMatch ? serMatch[1] : null,
          covPx: covPxMatch ? Number(covPxMatch[1]) : null,
          coverY: coverYMatch ? Number(coverYMatch[1]) : null,
          sheetH: sheetHMatch ? Number(sheetHMatch[1]) : null,
          hMin: hMinMatch ? Number(hMinMatch[1]) : null,
          hFirst: hFirstMatch ? Number(hFirstMatch[1]) : null,
          hLast: hLastMatch ? Number(hLastMatch[1]) : null,
          hSw: hSwMatch ? Number(hSwMatch[1]) : null,
          hCw: hCwMatch ? Number(hCwMatch[1]) : null,
          fCheck: fCheckMatch ? fCheckMatch[1] === 'true' : null,
          fDistinct: fDistinctMatch ? fDistinctMatch[1] === 'true' : null,
          covH: covHMatch ? covHMatch[1] : null,
          coverH: coverHMatch ? coverHMatch[1] : null,
        });
      }
    }
    for (const row of rows) {
      const logged = loggedVw.get(row.scene);
      // GÖSTERGE ALANLARI ZORUNLU (F11-1): eksik `vw=`/`theme=`/`surface=`/`vh=`/`inset=`
      // alanı "çapa yok" diye sessizce atlanamaz — eksikliğin kendisi hatadır.
      if (logged) {
        for (const [key, token] of [['width', 'vw='], ['height', 'vh='], ['safeAreaBottom', 'inset='], ['theme', 'theme='], ['surface', 'surface='], ['hidden', 'hidden='], ['hiddenPx', 'hiddenPx='], ['overflowX', 'overflowX='], ['hard', 'hard=']]) {
          if (logged[key] === null) errors.push(`satır (${row.scene}): log.txt satırı ${token} taşımıyor — çapa doğrulanamaz`);
        }
        // CTA satırları hedef/fokus tanığını da taşımak zorunda (F17-1).
        if (row.cta && row.cta.present === true) {
          for (const [key, token] of [['ctaW', 'ctaW='], ['ctaH', 'ctaH='], ['ctaX', 'ctaX='], ['ctaR', 'ctaR='], ['focus', 'focus=']]) {
            if (logged[key] === null) errors.push(`satır (${row.scene}): CTA log satırı ${token} taşımıyor — hedef/fokus çapalanamaz`);
          }
        }
        // Onboarding satırları yüzey tanığını da taşımak zorunda (F13-3).
        if (row.profile === 'onboarding') {
          for (const [key, token] of [['node', 'node='], ['text', 'text='], ['onb', 'onb=']]) {
            if (logged[key] === null) errors.push(`satır (${row.scene}): onboarding log satırı ${token} taşımıyor — yüzey tanığı yok`);
          }
          // `verifiedTheme.onb` BEYANDI (20. denetim F20-1): dark-390'da 'dark' -> 'light'
          // yapmak iki kapiyi da yesil birakiyordu; log'daki `onb=` artik capa.
          if (logged.onb !== null && row.verifiedTheme && row.verifiedTheme.onb !== undefined) {
            const declaredOnb = row.verifiedTheme.onb === null ? 'yok' : String(row.verifiedTheme.onb);
            if (declaredOnb !== logged.onb) {
              errors.push(`satır (${row.scene}): verifiedTheme.onb '${declaredOnb}' ≠ log.txt'teki onb=${logged.onb}`);
            }
          }
        }
      }
      if (!logged || !row.viewport) continue;
      // Tema, diskteki log satırından çapalanır: satırın hem etiketi hem de "ölçülmüş"
      // computed tokenı log'daki gerçek değerlerle eşleşmek zorunda.
      if (logged.theme && row.theme !== logged.theme) {
        errors.push(`satır (${row.scene}): theme '${row.theme}' ≠ log.txt'teki theme=${logged.theme}`);
      }
      if (logged.theme && row.verifiedTheme && row.verifiedTheme.dataTheme !== logged.theme) {
        errors.push(`satır (${row.scene}): verifiedTheme.dataTheme '${row.verifiedTheme && row.verifiedTheme.dataTheme}' ≠ log.txt'teki theme=${logged.theme}`);
      }
      if (logged.surface && row.verifiedTheme && String(row.verifiedTheme.surface).toLowerCase() !== logged.surface.toLowerCase()) {
        errors.push(`satır (${row.scene}): verifiedTheme.surface '${row.verifiedTheme.surface}' ≠ log.txt'teki surface=${logged.surface}`);
      }
      // HEDEF/FOKUS ↔ LOG (F17-1): tek alanla 12→50 px, false→true, 20→350 yapılamaz.
      if (row.cta && row.cta.present === true) {
        if (logged.ctaH !== null && typeof row.cta.height === 'number' && Math.round(row.cta.height) !== logged.ctaH) {
          errors.push(`satır (${row.scene}): CTA height ${row.cta.height} ≠ log.txt'teki ctaH=${logged.ctaH}`);
        }
        if (logged.ctaW !== null && typeof row.cta.width === 'number' && Math.round(row.cta.width) !== logged.ctaW) {
          errors.push(`satır (${row.scene}): CTA width ${row.cta.width} ≠ log.txt'teki ctaW=${logged.ctaW}`);
        }
        // DUSEY EKSEN ↔ LOG (25. denetim F26-2): `y`/`layoutY`/`scrollTop` tek alanla
        // degistirilemez. Once bunlarin log tanigi YOKTU (sozlesme adi uydurmustu).
        if (logged.ctaY !== null && typeof row.cta.y === 'number' && Math.round(row.cta.y) !== logged.ctaY) {
          errors.push(`satır (${row.scene}): CTA y ${row.cta.y} ≠ log.txt'teki ctaY=${logged.ctaY}`);
        } else if (logged.ctaY === null) {
          errors.push(`satır (${row.scene}): CTA log satırı ctaY= taşımıyor — dikey konum çapalanamaz`);
        }
        if (logged.ctaLay !== null && typeof row.cta.layoutY === 'number' && Math.round(row.cta.layoutY) !== logged.ctaLay) {
          errors.push(`satır (${row.scene}): CTA layoutY ${row.cta.layoutY} ≠ log.txt'teki ctaLay=${logged.ctaLay}`);
        } else if (logged.ctaLay === null) {
          errors.push(`satır (${row.scene}): CTA log satırı ctaLay= taşımıyor — yerleşim konumu çapalanamaz`);
        }
        if (logged.ctaScr !== null && typeof row.cta.scrollTop === 'number' && Math.round(row.cta.scrollTop) !== logged.ctaScr) {
          errors.push(`satır (${row.scene}): CTA scrollTop ${row.cta.scrollTop} ≠ log.txt'teki ctaScr=${logged.ctaScr}`);
        } else if (logged.ctaScr === null) {
          errors.push(`satır (${row.scene}): CTA log satırı ctaScr= taşımıyor — kaydırma çapalanamaz`);
        }
        // YATAY EKSEN ↔ LOG (F18-1): x/dialogRight tek alanla değiştirilemez.
        if (logged.ctaX !== null && typeof row.cta.x === 'number' && Math.round(row.cta.x) !== logged.ctaX) {
          errors.push(`satır (${row.scene}): CTA x ${row.cta.x} ≠ log.txt'teki ctaX=${logged.ctaX}`);
        }
        if (logged.ctaR !== null && typeof row.cta.dialogRight === 'number' && Math.round(row.cta.dialogRight) !== logged.ctaR) {
          errors.push(`satır (${row.scene}): CTA dialogRight ${row.cta.dialogRight} ≠ log.txt'teki ctaR=${logged.ctaR}`);
        }
        if (logged.focus !== null && Boolean(row.cta.focusReachable) !== logged.focus) {
          errors.push(`satır (${row.scene}): CTA focusReachable ${Boolean(row.cta.focusReachable)} ≠ log.txt'teki focus=${logged.focus}`);
        }
        // SOZLESME ALANLARI ↔ LOG (20. denetim F20-1): `selector` beyandi ve hicbir kapi
        // okumuyordu; tek duzenlemeyle `"body"` yazmak iki kapiyi da yesil birakiyordu.
        if (logged.sel !== null && typeof row.cta.selector === 'string' && row.cta.selector) {
          if (sha256Text(row.cta.selector).slice(0, 12) !== logged.sel) {
            errors.push(`satır (${row.scene}): CTA selector log.txt'teki sel=${logged.sel} ile eşleşmiyor`);
          }
        } else if (logged.sel === null) {
          errors.push(`satır (${row.scene}): CTA log satırı sel= taşımıyor — seçici çapalanamaz`);
        }
        // `overlapsContent` uzunluğu ve `localScroll` de log'daki tanıklarıyla eşleşmeli.
        if (logged.covN !== null && Array.isArray(row.cta.overlapsContent)) {
          if (row.cta.overlapsContent.length !== logged.covN) {
            errors.push(`satır (${row.scene}): CTA overlapsContent ${row.cta.overlapsContent.length} kayıt ≠ log.txt'teki covN=${logged.covN}`);
          }
        } else if (manifest.schemaVersion >= 2 && !Array.isArray(row.cta.overlapsContent)) {
          errors.push(`satır (${row.scene}): CTA sürüm 2 overlapsContent dizisi yok — log çapalanamaz`);
        } else if (logged.covN === null) {
          errors.push(`satır (${row.scene}): CTA log satırı covN= taşımıyor — içerik örtülmesi çapalanamaz`);
        }
        if (logged.lscroll !== null && row.cta.scroll && typeof row.cta.scroll.localScroll === 'boolean') {
          const loggedLocal = logged.lscroll === 'na' ? null : logged.lscroll === 'true';
          if (loggedLocal !== null && loggedLocal !== row.cta.scroll.localScroll) {
            errors.push(`satır (${row.scene}): CTA scroll.localScroll ${row.cta.scroll.localScroll} ≠ log.txt'teki lscroll=${logged.lscroll}`);
          }
        } else if (logged.lscroll === null) {
          errors.push(`satır (${row.scene}): CTA log satırı lscroll= taşımıyor — yerel kaydırma çapalanamaz`);
        }
        // ICERIK-ORTULME BUYUKLUGU + COVERSTACK BASI (21. denetim F21-3). §7.2'de "doğrulanmış"
        // diye aktarılan 43 px / y=764 sayıları tek alanla değiştirilebiliyordu.
        if (logged.covPx !== null && Array.isArray(row.cta.overlapsContent)) {
          const measuredCovPx = row.cta.overlapsContent.length
            ? Math.max(...row.cta.overlapsContent.map((item) => Math.round(item.overlapPx || 0))) : 0;
          if (measuredCovPx !== logged.covPx) {
            errors.push(`satır (${row.scene}): CTA overlapsContent en büyük örtüşmesi ${measuredCovPx}px ≠ log.txt'teki covPx=${logged.covPx}`);
          }
        } else if (logged.covPx === null) {
          errors.push(`satır (${row.scene}): CTA log satırı covPx= taşımıyor — içerik örtülmesi büyüklüğü çapalanamaz`);
        }
        if (logged.coverY !== null && Array.isArray(row.cta.coverStack)) {
          const measuredCoverY = row.cta.coverStack.length ? Math.round(row.cta.coverStack[0].y || 0) : -1;
          if (measuredCoverY !== logged.coverY) {
            errors.push(`satır (${row.scene}): CTA coverStack[0].y ${measuredCoverY} ≠ log.txt'teki coverY=${logged.coverY}`);
          }
        } else if (logged.coverY === null) {
          errors.push(`satır (${row.scene}): CTA log satırı coverY= taşımıyor — örtücü konumu çapalanamaz`);
        }
        // LISTE OZETLERI (21. denetim F21-3 devami): kayitlarin HER alani log'a yazilan
        // ozetle bagli; ayni listede iki kaydin ayni `overlapPx` tasimasi artik kacis degil.
        const normList = (list) => (Array.isArray(list) ? list : []).map((item) => `${item.tag}|${item.cls}|${item.y}|${item.h}|${item.pos || ''}|${item.z || ''}|${item.overlapPx === undefined ? '' : item.overlapPx}|${item.txt || ''}`);
        if (logged.covH !== null && Array.isArray(row.cta.overlapsContent)) {
          const measured = row.cta.overlapsContent.length
            ? sha256Text(normList(row.cta.overlapsContent).join('\n')).slice(0, 12) : '-1';
          if (measured !== logged.covH) {
            errors.push(`satır (${row.scene}): CTA overlapsContent özeti ${measured} ≠ log.txt'teki covH=${logged.covH}`);
          }
        } else if (logged.covH === null) {
          errors.push(`satır (${row.scene}): CTA log satırı covH= taşımıyor — içerik kayıtları çapalanamaz`);
        }
        if (logged.coverH !== null && Array.isArray(row.cta.coverStack)) {
          const measured = row.cta.coverStack.length
            ? sha256Text(normList(row.cta.coverStack).join('\n')).slice(0, 12) : '-1';
          if (measured !== logged.coverH) {
            errors.push(`satır (${row.scene}): CTA coverStack özeti ${measured} ≠ log.txt'teki coverH=${logged.coverH}`);
          }
        } else if (logged.coverH === null) {
          errors.push(`satır (${row.scene}): CTA log satırı coverH= taşımıyor — örtücü kayıtları çapalanamaz`);
        }
        // DİYALOG TABANI ve KAYDIRMA (F17-3): `visible` türetimi `dialogBottom`'a güveniyordu ama
        // o alan `viewport.height`/log `vh=` ile karşılaştırılmıyordu; `dialogBottom=1000`
        // yapınca ekran dışındaki eylem "görünür" oluyordu. Ayrıca `y + scrollTop === layoutY`
        // (kaydırma bağı) hiç denetlenmiyordu.
        if (typeof row.cta.dialogBottom === 'number' && row.viewport && typeof row.viewport.height === 'number'
          && Math.round(row.cta.dialogBottom) !== Math.round(row.viewport.height)) {
          errors.push(`satır (${row.scene}): CTA dialogBottom ${row.cta.dialogBottom} ≠ viewport.height ${row.viewport.height}`);
        }
        if (typeof row.cta.y === 'number' && typeof row.cta.layoutY === 'number') {
          const scroll = typeof row.cta.scrollTop === 'number' ? row.cta.scrollTop : 0;
          if (Math.abs((row.cta.y + scroll) - row.cta.layoutY) > 1) {
            errors.push(`satır (${row.scene}): CTA y+scrollTop ${row.cta.y}+${scroll} ≠ layoutY ${row.cta.layoutY}`);
          }
        }
      }
      // ÖRTÜLME BEYANI ↔ LOG (F11-2): `hiddenBy` tek başına beyandı; `false` yapıp
      // `coverStack` ve bulguyu silmek kapalı bir döngüydü.
      if (row.cta && row.cta.present === true && logged.hidden !== null) {
        if (Boolean(row.cta.hiddenBy) !== logged.hidden) {
          errors.push(`satır (${row.scene}): cta.hiddenBy ${Boolean(row.cta.hiddenBy)} ≠ log.txt'teki hidden=${logged.hidden}`);
        }
        if (logged.hidden === true) {
          const stack = Array.isArray(row.cta.coverStack) ? row.cta.coverStack : [];
          if (stack.length === 0) errors.push(`satır (${row.scene}): hidden=true ama coverStack boş — örtülme kanıtı yok`);
          else if (typeof stack[0].h === 'number' && logged.hiddenPx !== null && Math.round(logged.hiddenPx) !== Math.round(stack[0].h)) {
            errors.push(`satır (${row.scene}): coverStack[0].h ${stack[0].h} ≠ log.txt'teki hiddenPx=${logged.hiddenPx}`);
          }
        }
      }
      // SERT TAŞMA ↔ LOG (F12-1): manifestteki `SERT:` beyanları log'daki `hard=` kümesiyle
      // BİREBİR eşleşmeli. Böylece bir `SERT:` satırını `issues`'tan silmek (ya da bir satırı
      // tümden silmek) log'daki tanıkla çelişir; `overflowX=` de ayrıca tutarlı olmalı.
      if (logged.hard !== null) {
        const declaredHard = (row.issues || [])
          .filter((issue) => typeof issue === 'string' && issue.startsWith('SERT:'))
          .map((issue) => issue.split('|')[0].replace(/^SERT:\s*/, '').trim())
          .filter(Boolean)
          .sort();
        // Ayırıcı `,` ya da `|` olabilir (13. denetim F13-4: yazıcı `,` kullanıyor, ayrıştırıcı
        // bir zamanlar `|` beklediği için çok türlü satırlar sessizce kırpılıyordu).
        const loggedHard = logged.hard === 'yok' ? [] : logged.hard.split(/[,|]/).map((kind) => kind.trim()).filter(Boolean).sort();
        if (declaredHard.join(',') !== loggedHard.join(',')) {
          errors.push(`satır (${row.scene}): SERT beyanı [${declaredHard.join(',')}] ≠ log.txt'teki hard=[${loggedHard.join(',')}]`);
        }
        if (logged.overflowX !== null) {
          const wantOverflow = loggedHard.includes('YATAY-KIRPILIR') || loggedHard.includes('SAYFA-TAŞMASI');
          if (logged.overflowX !== wantOverflow) {
            errors.push(`satır (${row.scene}): log.txt overflowX=${logged.overflowX} ama hard=[${loggedHard.join(',')}]`);
          }
        }
      }
      // ÇAKIŞMA ALANI ZORUNLU (F10-5): alan log satırından silinerek çapa sessizce
      // devre dışı bırakılamaz. CTA taşıyan her satırın log'unda `collisions=`/`collisionPx=`
      // bulunmak zorundadır; yoksa ölçüm eksiktir.
      if (row.cta && row.cta.present === true && (logged.collisions === null || logged.collisionPx === null)) {
        errors.push(`satır (${row.scene}): log.txt satırı collisions=/collisionPx= taşımıyor — çakışma beyanı çapalanamaz`);
      }
      // Çakışma beyanı ↔ log: liste boşaltılarak bulgu gizlenemez (F10-5).
      if (logged.collisions !== null && row.cta && row.cta.present === true) {
        const declared = (Array.isArray(row.cta.overlapsControl) ? row.cta.overlapsControl : [])
          .filter((item) => item && typeof item.overlapPx === 'number' && item.overlapPx >= 8);
        if (declared.length !== logged.collisions) {
          errors.push(`satır (${row.scene}): overlapsControl ${declared.length} kayıt bildiriyor ≠ log.txt'teki collisions=${logged.collisions}`);
        }
        const declaredMax = declared.reduce((max, item) => Math.max(max, Math.round(item.overlapPx)), 0);
        if (logged.collisionPx !== null && declaredMax !== logged.collisionPx) {
          errors.push(`satır (${row.scene}): en büyük çakışma ${declaredMax}px ≠ log.txt'teki collisionPx=${logged.collisionPx}`);
        }
      }
      // `viewport` alt alanları da kendi beyanıdır; log'daki gerçek değerlerle çapalanır
      // (9. denetim F9-2: yükseklik/inset değiştirilerek matris anahtarı kaydırılabiliyordu).
      if (typeof row.viewport.width === 'number' && row.viewport.width !== logged.width) {
        errors.push(`satır (${row.scene}): viewport.width ${row.viewport.width} ≠ log'daki vw=${logged.width}`);
      }
      if (logged.height !== null && typeof row.viewport.height === 'number' && row.viewport.height !== logged.height) {
        errors.push(`satır (${row.scene}): viewport.height ${row.viewport.height} ≠ log'daki vh=${logged.height}`);
      }
      if (logged.safeAreaBottom !== null && typeof row.viewport.safeAreaBottom === 'number' && row.viewport.safeAreaBottom !== logged.safeAreaBottom) {
        errors.push(`satır (${row.scene}): viewport.safeAreaBottom ${row.viewport.safeAreaBottom} ≠ log'daki inset=${logged.safeAreaBottom}`);
      }
    }
    const loggedScenes = sceneLines.map((line) => String(line).split(':')[0].trim()).filter(Boolean);
    const loggedSet = new Set(loggedScenes);
    const manifestSet = new Set(rows.map((row) => row.scene));
    for (const scene of loggedSet) if (!manifestSet.has(scene)) errors.push(`log.txt'te olup manifestte olmayan sahne: ${scene}`);
    for (const scene of manifestSet) if (!loggedSet.has(scene)) errors.push(`manifestte olup log.txt'te olmayan sahne: ${scene}`);
    if (loggedScenes.length !== new Set(loggedScenes).size) errors.push('log.txt aynı sahneyi birden çok kez yazıyor (envanter çakışması)');
  }
  // `issues.txt` ZORUNLU: dosya yoksa/boşsa denetim sessizce atlanmaz (log.txt ile aynı kapı).
  // Aksi hâlde `SERT:` bulgu beyan eden bir koşum `exit 0` alabilirdi.
  if (issueFile === null || issueFile === undefined) {
    errors.push('issues.txt yok: iki yönlü bulgu eşleşmesi doğrulanamaz');
  } else {
    // İKİ YÖNLÜ: manifestte beyan edilen her bulgu issues.txt'te olmalı; issues.txt'te
    // manifestte olmayan satır da olmamalı. (Önceden yalnız "sorun beyan eden" satırlar
    // için zayıf bir varlık kontrolü yapılıyordu; 518 satırın 488'i hiç denetlenmiyordu.)
    const issueLines = String(issueFile).split('\n').map((line) => line.trim()).filter(Boolean);
    const declared = new Set();
    // Tek satırlık boş dosya `1` bayttır; anlamlı içerik beklenmez AMA manifestte hiç bulgu
    // yoksa da boş dosya tutarlıdır. Bu yüzden boşluk tek başına hata değil; eşleşme yönleri
    // aşağıda tam olarak denetlenir.
    for (const row of rows) {
      for (const issue of row.issues || []) {
        const expected = `${row.scene} @${row.viewport ? row.viewport.width : '?'}px: ${issue}`;
        declared.add(expected);
        if (!issueLines.includes(expected)) errors.push(`issues.txt'te eksik satır: ${row.scene}`);
      }
    }
    for (const line of issueLines) if (!declared.has(line)) errors.push(`issues.txt'te fazla (manifest dışı) satır: ${line.slice(0, 70)}`);
  }
  // GLİF KANITI ↔ SATIRLAR ↔ DİSK (13. denetim F13-2): `glyphEvidence` yalnız
  // `--glif-karsilastir` içinde okunuyordu; `validateManifest`/`validateCoverage` ona hiç
  // bakmıyordu. Bu yüzden glif satırı silinse bile manifestteki `glyphEvidence.screenshot`
  // var olmayan bir dosyayı göstermeye devam ediyor ve iki kapı da yeşil kalıyordu.
  // Artık kanıt bloğu satırlara ve diske bağlanır.
  // GLİF KANITI ZORUNLU (15. denetim F15-2): glif satırı taşıyan bir manifestte
  // `glyphEvidence` bloğu silinirse, blok "yoksa doğrulanmaz" diye sessizce atlanıyordu;
  // yedi koşumun altısından (ve `glif-referans`'tan) silmek iki manifest kapısından da
  // geçiyordu. Blok, glif satırı varsa ZORUNLUDUR.
  if (manifest && !manifest.glyphEvidence && rows.some((row) => row.sceneKind === 'glyph' || row.profile === 'glif')) {
    errors.push('glif satırı var ama glyphEvidence bloğu yok — font/30-dizi kanıtı eksik');
  }
  if (manifest && manifest.glyphEvidence) {
    const glyph = manifest.glyphEvidence;
    const shot = glyph.screenshot;
    // Eşleşen GLİF satırı — blok genelinde tek kez çözülür (17. denetim F17-2).
    const glyphRow = shot ? rows.find((row) => row.screenshot === shot) : null;
    if (!shot) {
      errors.push('glyphEvidence.screenshot yok — glif kanıtı dosyaya bağlanamaz');
    } else if (!glyphRow) {
      errors.push(`glyphEvidence.screenshot '${shot}' hiçbir manifest satırına karşılık gelmiyor`);
    } else if (glyphRow.sceneKind !== 'glyph' && glyphRow.profile !== 'glif') {
      // 14. denetim F14-3: bağ YALNIZ "bir satır" değil, GLİF satırı olmalı.
      errors.push(`glyphEvidence.screenshot bir glif satırına bağlı değil: ${shot} (sceneKind '${glyphRow.sceneKind}', profile '${glyphRow.profile}')`);
    } else if (glyphRow.sha256 !== glyph.screenshotSha256) {
      errors.push(`glyphEvidence.screenshotSha256 satırdaki sha256 ile eşleşmiyor (${shot})`);
    }
    // SAHNE KİMLİĞİ ÇAPASI (17. denetim F17-2): `glyphEvidence.scene` serbest bir alandı; onu
    // `log.txt`'te bulunmayan bir dizeye çekmek TÜM font karşılaştırmasını sessizce atlatıyordu
    // (`if (glyphLogLine)` — `else` yok). Artık satırın `scene`'i ile eşleşmeli.
    if (glyph.scene !== undefined && glyphRow && glyph.scene !== glyphRow.scene) {
      errors.push(`glyphEvidence.scene '${glyph.scene}' eşleşen glif satırının scene'i '${glyphRow.scene}' ile çelişiyor`);
    }
    // Disk denetimi yalnız `root` verildiğinde yapılabilir; satır bağı her zaman denetlenir.
    if (root && shot) {
      const shotPath = path.join(root, shot);
      if (!fs.existsSync(shotPath)) {
        errors.push(`glyphEvidence.screenshot diskte yok: ${shot}`);
      } else if (glyph.screenshotSha256 && sha256File(shotPath) !== glyph.screenshotSha256) {
        errors.push(`glyphEvidence.screenshotSha256 diskteki baytla eşleşmiyor: ${shot}`);
      }
    }
    if (!Array.isArray(glyph.series) || glyph.series.length === 0) {
      errors.push('glyphEvidence.series yok/boş');
    } else if (typeof glyph.seriesCount === 'number' && glyph.seriesCount !== glyph.series.length) {
      errors.push(`glyphEvidence.seriesCount ${glyph.seriesCount} ≠ series uzunluğu ${glyph.series.length}`);
    }
    // SERI ALANLARI YENIDEN TURETILIR (20. denetim F20-1): `series[].sha256/source/corpus/marks`
    // beyandi ve EVIDENCE §8.1 "her birinin kaynagi ve SHA-256'si kayitli" diyordu, ama hicbir
    // kapi yeniden turetmiyordu; `series[0].sha256 -> 'f'x64` iki kapiyi da yesil birakiyordu.
    // Artik her dizi canli dogrulanmis icerikten yeniden turetilen 30 diziyle BIREBIR eslesmeli.
    if (Array.isArray(glyph.series) && glyph.series.length > 0) {
      const canonical = glyphSeries().series;
      if (glyph.series.length !== canonical.length) {
        errors.push(`glyphEvidence.series ${glyph.series.length} dizi ama doğrulanmış içerik ${canonical.length} dizi veriyor`);
      } else {
        for (let i = 0; i < canonical.length; i += 1) {
          const declared = glyph.series[i] || {};
          const want = canonical[i];
          if (declared.ar !== want.ar) { errors.push(`glyphEvidence.series[${i}].ar doğrulanmış içerikle çelişiyor`); break; }
          if (declared.sha256 !== sha256Text(String(declared.ar))) {
            errors.push(`glyphEvidence.series[${i}].sha256 kendi metninden yeniden türetilen hash ile eşleşmiyor`);
            break;
          }
          if (declared.sha256 !== want.sha256) { errors.push(`glyphEvidence.series[${i}].sha256 doğrulanmış içerikten türetilen hash ile çelişiyor`); break; }
          if (declared.source !== want.source) { errors.push(`glyphEvidence.series[${i}].source doğrulanmış içerikle çelişiyor`); break; }
          if (declared.corpus !== want.corpus) { errors.push(`glyphEvidence.series[${i}].corpus doğrulanmış içerikle çelişiyor`); break; }
          if (declared.marks !== want.marks) { errors.push(`glyphEvidence.series[${i}].marks doğrulanmış içerikle çelişiyor`); break; }
          if (declared.index !== want.index) { errors.push(`glyphEvidence.series[${i}].index doğrulanmış içerikle çelişiyor`); break; }
        }
      }
      // SHEET BLOGU (20. denetim F21-2): `glyphEvidence.sheet.*` hicbir kapida okunmuyordu;
      // `rows=29`, `sheetHeight=100`, `sw=320`, `firstTop=0`, `minH=60`, `maxH=70` tek alanla
      // yazilabiliyordu. Artik sheet, SATIRIN kendi olcumleriyle ve `rows=` ile tutarli olmali:
      //   • `sheet.rows` = series uzunlugu = log'daki `rows=`
      //   • `minH`/`maxH` = satirlarin `firstTop`/`lastTop` araligina sigar
      //   • `firstTop` + `rows * maxH` >= `lastTop` (satir yuksekligi gercekten olculmus)
      //   • `sw`/`cw` = 460 (glif sayfasi genisligi) ve `sw >= cw`
      //   • `sheetHeight` = `docH` = `bodyH` ve `scrollH`/`clientH` ile celismez
      const sheet = glyph.sheet;
      if (!sheet || typeof sheet !== 'object') {
        errors.push('glyphEvidence.sheet bloğu yok — glif sayfası ölçümü eksik');
      } else {
        const seriesLen = Array.isArray(glyph.series) ? glyph.series.length : 0;
        if (typeof sheet.rows === 'number' && seriesLen && sheet.rows !== seriesLen) {
          errors.push(`glyphEvidence.sheet.rows ${sheet.rows} ≠ dizi sayısı ${seriesLen}`);
        }
        const num = (value) => typeof value === 'number' && Number.isFinite(value);
        if (!num(sheet.rows) || !num(sheet.minH) || !num(sheet.maxH) || !num(sheet.firstTop) || !num(sheet.lastTop)) {
          errors.push('glyphEvidence.sheet temel ölçümleri (rows/minH/maxH/firstTop/lastTop) eksik');
        } else if (!(sheet.maxH >= sheet.minH) || !(sheet.minH > 0)) {
          errors.push(`glyphEvidence.sheet satır yükseklikleri tutarsız (minH ${sheet.minH}, maxH ${sheet.maxH})`);
        } else if (!(sheet.lastTop > sheet.firstTop) || !(sheet.firstTop >= 0)) {
          errors.push(`glyphEvidence.sheet firstTop/lastTop tutarsız (${sheet.firstTop} / ${sheet.lastTop})`);
        } else if (sheet.lastTop - sheet.firstTop < (sheet.rows - 1) * sheet.maxH) {
          // Satirlar arasi aralik satir yuksekliginden kucuk olamaz: 30 satir 68 px ise
          // firstTop ile lastTop arasi en az 29*68 px olmali.
          errors.push(`glyphEvidence.sheet firstTop..lastTop (${sheet.firstTop}→${sheet.lastTop}) ${sheet.rows}×${sheet.maxH}px satırı kapsamıyor`);
        }
        for (const field of ['sw', 'cw']) {
          if (num(sheet[field]) && sheet[field] <= 0) errors.push(`glyphEvidence.sheet.${field} pozitif olmalı`);
        }
        if (num(sheet.sw) && num(sheet.cw) && sheet.sw < sheet.cw) {
          errors.push(`glyphEvidence.sheet.sw ${sheet.sw} < cw ${sheet.cw}`);
        }
        // Glif sayfası genişliği satırın kendi viewport'undan gelir (tek yerde ölçülür).
        if (num(sheet.sw) && glyphRow && glyphRow.viewport && num(glyphRow.viewport.width)
          && sheet.sw !== glyphRow.viewport.width) {
          errors.push(`glyphEvidence.sheet.sw ${sheet.sw} ≠ satır viewport.width ${glyphRow.viewport.width}`);
        }
        // Yükseklik zinciri: sheetHeight == docH == bodyH; scrollH/clientH ile çelişmez.
        const heights = ['sheetHeight', 'docH', 'bodyH'].filter((field) => num(sheet[field]));
        if (heights.length > 0) {
          const values = heights.map((field) => sheet[field]);
          if (new Set(values).size !== 1) {
            errors.push(`glyphEvidence.sheet yükseklikleri çelişiyor (${heights.map((f) => `${f}=${sheet[f]}`).join(', ')})`);
          }
        }
        if (num(sheet.scrollH) && num(sheet.clientH)) {
          if (sheet.scrollH < sheet.clientH) {
            errors.push(`glyphEvidence.sheet.scrollH ${sheet.scrollH} < clientH ${sheet.clientH}`);
          }
          if (num(sheet.sheetHeight) && sheet.sheetHeight > sheet.scrollH + 1) {
            errors.push(`glyphEvidence.sheet.sheetHeight ${sheet.sheetHeight} > scrollH ${sheet.scrollH}`);
          }
        }
        if (num(sheet.lastTop) && num(sheet.maxH) && num(sheet.sheetHeight)
          && sheet.lastTop + sheet.maxH > sheet.sheetHeight + 1) {
          errors.push(`glyphEvidence.sheet son satır (${sheet.lastTop}+${sheet.maxH}) sayfa yüksekliğini (${sheet.sheetHeight}) aşıyor`);
        }
        // 24. denetim F25-2: yukseklik ZINCIRI bir butun olarak baglanir. Tek tek +1 kaydirmak
        // (scrollH) ya da hepsini birlikte kaydirmak hicbir kapiya takilmiyordu. Artik:
        //   sheetHeight = docH = bodyH = scrollH = clientH (glif sayfasi kaydirilamaz tek sayfa)
        // ve sheetHeight, LOG'daki hFirst/hLast/h (=firstTop/lastTop/maxH) ile tutarli olmali.
        const heightFields = ['sheetHeight', 'docH', 'bodyH', 'scrollH', 'clientH'];
        const presentHeights = heightFields.filter((field) => num(sheet[field]));
        if (presentHeights.length >= 2) {
          const distinct = [...new Set(presentHeights.map((field) => sheet[field]))];
          if (distinct.length !== 1) {
            errors.push(`glyphEvidence.sheet yükseklik zinciri tutarsız (${presentHeights.map((f2) => `${f2}=${sheet[f2]}`).join(', ')})`);
          }
        }
        if (num(sheet.sheetHeight) && num(sheet.firstTop) && num(sheet.lastTop) && num(sheet.maxH)
          && sheet.firstTop + sheet.rows * sheet.maxH > sheet.sheetHeight + 1) {
          errors.push(`glyphEvidence.sheet ${sheet.rows}×${sheet.maxH}px satır + firstTop ${sheet.firstTop} sayfaya (${sheet.sheetHeight}) sığmıyor`);
        }
      }
      // SHEET GEOMETRISI LOG'A CAPALI (21. denetim F21-2 + 23. denetim F24-3): `maxH` tek
      // basina capaliydi; `minH`/`firstTop`/`lastTop`/`sw`/`cw` yalniz SEKIL denetiminden
      // geciyordu (minH=1, firstTop=0, cw=1 gibi fiziksel olarak imkansiz degerler geciyordu).
      // Artik besi de log'daki gercek olcumle birebir eslesir.
      {
        const glyphScene = String((glyphRow && glyphRow.scene) || glyph.scene || '');
        const gLine = (Array.isArray(logLines) ? logLines : [])
          .find((line) => String(line).split(':')[0].trim() === glyphScene && /\btheme=/.test(line));
        if (!gLine) {
          errors.push('glyphEvidence.sheet için log.txt satırı yok — sayfa geometrisi çapalanamaz');
        } else {
          const loggedH = /\bh=(\d+)\b/.exec(String(gLine));
          if (!loggedH) {
            errors.push('glif log satırı h= taşımıyor — sayfa satır yüksekliği çapalanamaz');
          } else if (sheet && typeof sheet === 'object' && typeof sheet.maxH === 'number'
            && sheet.maxH !== Number(loggedH[1])) {
            errors.push(`glyphEvidence.sheet.maxH ${sheet.maxH} ≠ log.txt'teki h=${loggedH[1]}`);
          }
          for (const [field, token] of [['minH', 'hMin'], ['firstTop', 'hFirst'], ['lastTop', 'hLast'], ['sw', 'hSw'], ['cw', 'hCw']]) {
            const re = new RegExp(`\\b${token}=(-?\\d+)\\b`);
            const m2 = re.exec(String(gLine));
            if (!m2) {
              errors.push(`glif log satırı ${token}= taşımıyor — sheet.${field} çapalanamaz`);
            } else if (sheet && typeof sheet === 'object' && typeof sheet[field] === 'number'
              && sheet[field] !== Number(m2[1])) {
              errors.push(`glyphEvidence.sheet.${field} ${sheet[field]} ≠ log.txt'teki ${token}=${m2[1]}`);
            }
          }
        }
      }
      // `glyphEvidence.captureScale` ve `imagePixels` diskten yeniden olculur (F20-1).
      if (root && shot && fs.existsSync(path.join(root, shot))) {
        const px = imageSize(path.join(root, shot));
        if (px.ok) {
          if (glyph.imagePixels && Number(glyph.imagePixels.width) !== px.width) {
            errors.push(`glyphEvidence.imagePixels.width ${glyph.imagePixels.width} ≠ diskteki ${px.width}`);
          }
          if (glyph.imagePixels && Number(glyph.imagePixels.height) !== px.height) {
            errors.push(`glyphEvidence.imagePixels.height ${glyph.imagePixels.height} ≠ diskteki ${px.height}`);
          }
          if (glyph.imagePixels && Number(glyph.imagePixels.bytes) !== px.bytes) {
            errors.push(`glyphEvidence.imagePixels.bytes ${glyph.imagePixels.bytes} ≠ diskteki ${px.bytes}`);
          }
          const rowW = glyphRow && glyphRow.viewport && typeof glyphRow.viewport.width === 'number' ? glyphRow.viewport.width : null;
          if (rowW && typeof glyph.captureScale === 'number'
            && Math.abs(glyph.captureScale - px.width / rowW) > 1e-9) {
            errors.push(`glyphEvidence.captureScale ${glyph.captureScale} ≠ diskteki ${(px.width / rowW).toFixed(3)}`);
          }
        }
      }
    }
    // FONT KANITI BLOĞU ZORUNLU (16. denetim F16-3) ve LOG'A ÇAPALI (F17-2: arama
    // başarısızsa artık sert hata — `else` dalı yoktu ve çapa sessizce kapanıyordu).
    const fontBlock = glyph.font;
    if (!fontBlock || typeof fontBlock !== 'object') {
      errors.push('glyphEvidence.font bloğu yok — font yükleme kanıtı eksik');
    } else {
      const glyphKey = String((glyphRow && glyphRow.scene) || glyph.scene || String(shot || '').replace(/\.(png|webp)$/i, ''));
      const glyphLogLine = (Array.isArray(logLines) ? logLines : [])
        .find((line) => String(line).split(':')[0].trim() === glyphKey && /\btheme=/.test(line));
      if (!glyphLogLine) {
        errors.push(`glyphEvidence için log.txt satırı yok (${glyphKey}) — font kanıtı çapalanamaz`);
      } else {
        const loggedLoaded = /\bloaded=(true|false)\b/.exec(glyphLogLine);
        const loggedWoff2 = /\bwoff2=(\d+)\b/.exec(glyphLogLine);
        const loggedMetrics = /\bmetrics=(\d+)\/(\d+)\b/.exec(glyphLogLine);
        if (!loggedLoaded || !loggedWoff2 || !loggedMetrics) {
          errors.push('glif log satırı font kanıtı taşımıyor (loaded=/woff2=/metrics=)');
        } else {
          const loadedFaces = Array.isArray(fontBlock.faces) ? fontBlock.faces.filter((face) => face && face.status === 'loaded').length : 0;
          if ((loadedFaces > 0) !== (loggedLoaded[1] === 'true')) {
            errors.push(`glyphEvidence.font yüklü=${loadedFaces} ≠ log.txt'teki loaded=${loggedLoaded[1]}`);
          }
          const reqs = Array.isArray(fontBlock.requests) ? fontBlock.requests.length : 0;
          if (reqs !== Number(loggedWoff2[1])) {
            errors.push(`glyphEvidence.font.requests ${reqs} ≠ log.txt'teki woff2=${loggedWoff2[1]}`);
          }
          if (Number(loggedMetrics[1]) !== fontBlock.withFont || Number(loggedMetrics[2]) !== fontBlock.withFallback) {
            errors.push(`glyphEvidence.font metrics ${fontBlock.withFont}/${fontBlock.withFallback} ≠ log.txt'teki metrics=${loggedMetrics[1]}/${loggedMetrics[2]}`);
          }
          // FONT OLCUM BAYRAKLARI (23. denetim F24-1): `font.check`/`font.distinct` sozlesmede
          // `anchor:log.txt check=` diye kayitliydi ama `--dogrula`/`--kapsam` onlari OKUMUYORDU
          // (yalniz `--glif-karsilastir` bakiyordu). `check true->false` ve alani silmek iki
          // manifest kapisinda da rc=0 veriyordu.
          const loggedCheckFlag = /\bcheck=(true|false)\b/.exec(glyphLogLine);
          const loggedDistinctFlag = /\bdistinct=(true|false)\b/.exec(glyphLogLine);
          if (!loggedCheckFlag || !loggedDistinctFlag) {
            errors.push('glif log satırı check=/distinct= taşımıyor — font ölçüm bayrakları çapalanamaz');
          } else {
            if (fontBlock.check === undefined) {
              errors.push('glyphEvidence.font.check yok — font ölçüm bayrağı eksik');
            } else if (Boolean(fontBlock.check) !== (loggedCheckFlag[1] === 'true')) {
              errors.push(`glyphEvidence.font.check ${Boolean(fontBlock.check)} ≠ log.txt'teki check=${loggedCheckFlag[1]}`);
            }
            if (fontBlock.distinct === undefined) {
              errors.push('glyphEvidence.font.distinct yok — font ölçüm bayrağı eksik');
            } else if (Boolean(fontBlock.distinct) !== (loggedDistinctFlag[1] === 'true')) {
              errors.push(`glyphEvidence.font.distinct ${Boolean(fontBlock.distinct)} ≠ log.txt'teki distinct=${loggedDistinctFlag[1]}`);
            }
          }
          // SERI OZETI (20. denetim F21-4): `ser=` "zorunlu tanik" diye yazildi ama hicbir kod
          // yolu onu OKUMUYORDU; log.txt ve row.log'dan silmek rc=0 veriyordu. Artik zorunlu
          // ve manifestteki 30 dizinin birlesik ozetiyle birebir eslesmek zorunda.
          const loggedSer = /\bser=([0-9a-f]{16})\b/.exec(glyphLogLine);
          if (!loggedSer) {
            errors.push('glif log satırı ser= taşımıyor — 30 dizi özeti çapalanamaz');
          } else if (Array.isArray(glyph.series) && glyph.series.length > 0) {
            const declaredSer = sha256Text(glyph.series
              .map((item) => `${item.index}|${item.ar}|${item.source}|${item.corpus}|${item.marks}|${item.sha256}`)
              .join('\n')).slice(0, 16);
            if (loggedSer[1] !== declaredSer) {
              errors.push(`glif seri özeti ser=${loggedSer[1]} ≠ manifestteki 30 diziden türetilen ${declaredSer}`);
            }
          }
        }
      }
    }
  }

  return { ok: errors.length === 0, errors, stats };
}

/**
 * 30 zor glif dizisi — DOĞRULANMIŞ içerikten, deterministik seçim.
 * Ölçüt: Arapça işaret (hareke/şedde/sükût/küçük yüksek işaret) yoğunluğu; eşitlikte id ile
 * sıralanır. Böylece aynı girdi her zaman aynı 30 diziyi verir ve dizi elle yazılmaz.
 */
export function glyphSeries() {
  const marks = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

  // İçerik modülleri IIFE'dir ve `window` üzerine yazar; Node ESM'de `require` yok,
  // bu yüzden izole bir vm bağlamında yüklenir (ağ/DOM/localStorage yok).
  const sandbox = { window: {}, Object, Array, Math, JSON, String, Number, RegExp, Error };
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  for (const rel of ['app/content/quranLexiconV1.js', 'app/content/quranShortSurahsV1.js']) {
    const file = path.join(REPO, rel);
    if (!fs.existsSync(file)) throw new Error(`içerik modülü yok: ${rel}`);
    vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: rel, timeout: 20000 });
  }
  const lexicon = sandbox.window.QuranLexiconV1;
  const surahs = sandbox.window.QuranShortSurahsV1;
  if (!lexicon || !Array.isArray(lexicon.lemmas)) throw new Error('QuranLexiconV1 yüklenemedi');
  if (!surahs || !Array.isArray(surahs.words)) throw new Error('QuranShortSurahsV1 yüklenemedi');

  const candidates = [];
  for (const lemma of lexicon.lemmas) {
    if (lemma.verified !== true) continue;
    if (lemma.ar) candidates.push({ ar: lemma.ar, source: `QuranLexiconV1.lemmas[${lemma.id}].ar`, corpus: 'lexicon' });
    for (const [index, example] of (lemma.examples || []).entries()) {
      if (example && example.ar) candidates.push({ ar: example.ar, source: `QuranLexiconV1.lemmas[${lemma.id}].examples[${index}].ar`, corpus: 'lexicon-example' });
    }
  }
  for (const word of surahs.words) {
    if (word && word.ar) candidates.push({ ar: word.ar, source: `QuranShortSurahsV1.words[${word.id}].ar`, corpus: 'surah' });
  }

  const scored = candidates
    .filter((item) => /[\u0600-\u06FF]/.test(item.ar))
    // Okunabilir kırpım: 30 dizinin hepsi tek kırpımda, aynı ölçekte, kaydırmasız
    // okunabilmeli. Uzun âyet parçaları (örnek metinlerin medyanı 43 karakter) bu
    // yüzden dizinin DIŞINDA tutulur; onlar sahne görüntülerinde zaten görünür.
    .filter((item) => Array.from(item.ar).length <= 20)
    .map((item) => {
      const found = item.ar.match(marks) || [];
      const length = Array.from(item.ar).length || 1;
      return { ...item, marks: found.length, density: found.length / length };
    })
    // Deterministik: yoğunluk ↓, işaret sayısı ↓, sonra kaynak string ↑.
    .sort((a, b) => (b.density - a.density) || (b.marks - a.marks) || (a.source < b.source ? -1 : a.source > b.source ? 1 : 0));

  // Farklı diziler istiyoruz: aynı metni tekrar etme; iki farklı corpus'tan da örnek al.
  const unique = [];
  const seen = new Set();
  for (const item of scored) {
    if (seen.has(item.ar)) continue;
    seen.add(item.ar);
    unique.push(item);
  }
  const fromCorpus = (corpus, count) => unique.filter((item) => item.corpus === corpus).slice(0, count);

  const picked = [];
  // 12 sözlük kelimesi + 6 doğrulanmış kısa örnek + 12 sûre kelimesi; hepsi doğrulanmış içerik.
  for (const item of fromCorpus('lexicon', 12)) picked.push(item);
  for (const item of fromCorpus('lexicon-example', 6)) picked.push(item);
  for (const item of fromCorpus('surah', 12)) picked.push(item);
  // Yetmezse yoğunluk sırasıyla tamamla (yine deterministik ve içerikten).
  for (const item of unique) {
    if (picked.length >= 30) break;
    if (!picked.includes(item)) picked.push(item);
  }
  const series = picked.slice(0, 30).map((item, index) => ({
    index: index + 1,
    ar: item.ar,
    source: item.source,
    corpus: item.corpus,
    marks: item.marks,
    sha256: sha256Text(item.ar),
  }));
  if (series.length !== 30) throw new Error(`30 dizi seçilemedi (${series.length})`);
  return { series, lexiconVersion: lexicon.version, surahVersion: surahs.version };
}

/**
 * Çok koşumlu kapsam: 3 viewport × 2 tema × (ana + onboarding + glif) eksiksiz mi?
 * Her koşum tek tema üretir; kapsam ancak birleşimde tamamlanır. Eksik/sayı uyuşmazlığı hata.
 */
export function validateCoverage(manifests) {
  const errors = [];
  if (!Array.isArray(manifests) || manifests.length === 0) return { ok: false, errors: ['koşum listesi boş'], stats: null };
  const combos = new Map(); // `${viewport}|${theme}` → { rows, profiles:Set }
  let totalRows = 0;
  const glyphSceneSets = [];
  for (const manifest of manifests) {
    const rows = manifest && Array.isArray(manifest.rows) ? manifest.rows : [];
    totalRows += rows.length;
    const glyphScenesPerRun = [];
    for (const row of rows) {
      // Glif sayfası sabit boyutlu tek bir ölçüm sayfasıdır (460 px); viewport×tema
      // KOMBİNASYON MATRİSİNE girmez, yoksa sahte bir kombinasyon üretir. ENVANTER
      // karşılaştırmasına ise GİRER (13. denetim F13-1): önceden `continue` her iki
      // amaçtan birden atlıyordu ve tek koşumdan glif satırını silmek — dört artefakt
      // birlikte tutarlı — iki kapıdan da geçiyordu; `SERT:` bulgusu satır silinerek
      // temizlenebiliyordu. Artık yalnız matris anahtarı dışlanır.
      // Glif satırı matrise GİRMEZ (sabit 460 px, tek ölçüm sayfası) — ama envanter
      // karşılaştırmasına girer. Karıştırılırsa `460x844+0|light` gibi SAHTE bir kombinasyon
      // doğar (320 koşumunda yalnız glif satırını içerir); bu yüzden ayrı tutulur.
      if (row.profile === 'glif') { glyphScenesPerRun.push(row.scene); continue; }
      const key = `${viewportKey(row.viewport)}|${row.theme}`;
      if (!combos.has(key)) combos.set(key, { rows: 0, profiles: new Set(), scenes: new Set(), byProfile: new Map() });
      const combo = combos.get(key);
      combo.rows += 1;
      combo.profiles.add(row.profile);
      combo.scenes.add(row.scene);
      if (!combo.byProfile.has(row.profile)) combo.byProfile.set(row.profile, []);
      combo.byProfile.get(row.profile).push(row.scene);
    }
    // Glif envanteri koşum başına ayrı tutulur ve kombinasyonlar arasında karşılaştırılır
    // (13. denetim F13-1): önceden `continue` envanterden de atlıyordu.
    glyphSceneSets.push(glyphScenesPerRun.slice().sort().join(','));
  }
  const viewports = [...new Set([...combos.keys()].map((key) => key.split('|')[0]))].sort();
  // Kart 6 kombinasyon ister: 320/390/460 × açık/koyu. Sentetik alt insetsiz (safe-area) ölçüm
  // K3PD-21 geometri sözleşmesinden gelir ve ayrıca (390+34) koşumuyla eklenir; zorunlu 3
  // genişliğin yanında kabul edilir ama kapsamı büyütmek için şart değildir.
  // Yalnız GENİŞLİK ve güvenli alan karşılaştırılır: yüksekliği sabitlemek, kartın yasakladığı
  // "kodun türetemediği sabit sayı" sınıfına giriyordu (denetim bulgusu F10 — 844 yüksekliğinde
  // başka bir koşum "zorunlu genişlik eksik" diye reddedilirdi).
  const widthKey = (key) => key.split('x')[0] + '+' + key.split('+')[1];
  const MAIN_WIDTHS = ['320+0', '390+0', '460+0'];
  const presentWidths = [...new Set(viewports.map(widthKey))];
  for (const required of MAIN_WIDTHS) {
    if (!presentWidths.includes(required)) errors.push(`zorunlu genişlik eksik: ${required.split('+')[0]}px (güvenli alan +${required.split('+')[1]})`);
  }
  for (const viewport of viewports) {
    for (const theme of ['light', 'dark']) {
      const key = `${viewport}|${theme}`;
      // Zorunlu matris: 3 ana genişlik × 2 tema. Sentetik inset viewport'u EK ölçümdür;
      // yalnız çekildiği tema(lar)da doğrulanır, ikinci temayı zorunlu kılmaz.
      const isExtraViewport = !MAIN_WIDTHS.includes(widthKey(viewport));
      if (!combos.has(key)) {
        if (!isExtraViewport) errors.push(`eksik kombinasyon: ${key}`);
        continue;
      }
      const combo = combos.get(key);
      // Glif sayfası viewport'tan bağımsız tek bir ölçüm sayfasıdır (460 px); her kombinasyonda
      // tekrarlanmaz. Ana ve onboarding profilleri ise her kombinasyonda bulunmak ZORUNDA.
      for (const profile of ['ana', 'onboarding']) {
        if (!combo.profiles.has(profile)) errors.push(`eksik profil: ${key} ${profile}`);
      }
      if (combo.rows === 0) errors.push(`boş kombinasyon: ${key}`);
    }
  }
  // Glif kanıtı iki temada da bulunmalı (dizi görünümü tema-duyarlı çizilir).
  for (const theme of ['light', 'dark']) {
    const found = manifests.some((manifest) => (manifest.rows || []).some((row) => row.profile === 'glif' && row.theme === theme));
    if (!found) errors.push(`glif kanıtı eksik: ${theme}`);
  }
  // ÜRETİM BULGULARI: kapsam kapısı da beyana güvenmez, satırlardan türetir (F2).
  // Aksi hâlde sekiz manifestten de bulgular silinse "--kapsam" hâlâ PASS verirdi.
  // Kural: bir koşumda ölçülen her bulgu, O koşumun `productionFindings` alanında beyan
  // edilmiş olmalı. (Tersi `validateCta` içinde: beyan edilen her bulgu ölçülmüş olmalı.)
  for (const manifest of manifests) {
    const rows = (manifest && manifest.rows) || [];
    const declared = new Set(((manifest && manifest.productionFindings) || []).map((item) => `${item.kind}|${item.scene}`));
    for (const item of deriveFindings(rows, manifest && manifest.schemaVersion >= 2)) {
      if (!declared.has(`${item.kind}|${item.scene}`)) {
        errors.push(`üretim bulgusu beyan edilmemiş: ${item.kind} ${item.scene} (${manifest.theme}/${viewportKey(manifest.viewport || { width: 0, height: 0, safeAreaBottom: 0 })})`);
      }
    }
  }
  // Sahne envanteri her kombinasyonda AYNI olmalı (sahne envanteri sabit değil, ölçülür).
  // 12. denetim F12-2: karşılaştırma önceden yalnız `ana` sahneler üzerindeydi (`o*` ve `g*`
  // dışlanıyordu). Böylece tek koşumdan onboarding/glyph satırı silmek — dört artefakt
  // birlikte tutarlı tutularak — yakalanmıyordu ve `o*` üzerindeki bir `SERT:` bulgusu
  // satırı silinerek temizlenebiliyordu. Artık TÜM sahneler karşılaştırılır; profil bazında
  // ayrı liste de tutulur ki hata mesajı hangi profilin kaydığını söylesin.
  const sceneSets = new Map();
  const profileSets = new Map();
  for (const [key, combo] of combos) {
    sceneSets.set(key, [...combo.scenes].sort().join(','));
    profileSets.set(key, [...combo.byProfile.entries()].map(([profile, scenes]) => `${profile}:${scenes.slice().sort().join('|')}`).sort().join(';;'));
  }
  const distinctSceneSets = new Set(sceneSets.values());
  if (distinctSceneSets.size > 1) errors.push(`sahne envanteri kombinasyonlar arasında farklı (${distinctSceneSets.size} farklı liste)`);
  const distinctProfileSets = new Set(profileSets.values());
  if (distinctProfileSets.size > 1) errors.push(`profil bazlı sahne envanteri kombinasyonlar arasında farklı (${distinctProfileSets.size} farklı liste)`);
  // Glif envanteri de koşumlar arasında aynı olmalı (F13-1).
  const distinctGlyphSets = new Set(glyphSceneSets);
  if (distinctGlyphSets.size > 1) errors.push(`glif sahne envanteri koşumlar arasında farklı (${distinctGlyphSets.size} farklı liste)`);
  if (glyphSceneSets.some((set) => set === '')) errors.push('bir koşumda hiç glif satırı yok');
  return {
    ok: errors.length === 0,
    errors,
    stats: {
      runs: manifests.length,
      totalRows,
      combinations: [...combos.entries()].map(([key, combo]) => ({ key, rows: combo.rows, profiles: [...combo.profiles].sort(), scenes: combo.scenes.size })),
      viewports,
    },
  };
}

/** Negatif sözleşme testi: bozulmuş manifestler MUTLAKA reddedilmeli. */
export function negativeSelfTest() {
  const base = {
    profile: 'ana',
    theme: 'light',
    viewport: { width: 390, height: 844, safeAreaBottom: 0 },
    captureScale: 1,
    scene: 'v01-home',
    sceneKind: 'view',
    // Ad sahneden türetilir (14. denetim F14-2 writer kuralı): `${scene}.webp`.
    screenshot: 'v01-home.webp',
    log: ['v01-home: ok'],
    issues: [],
    sha256: 'a'.repeat(64),
    verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink },
  };
  const dark = { ...base, theme: 'dark', verifiedTheme: { dataTheme: 'dark', surface: THEME_TOKENS.dark.surface, ink: THEME_TOKENS.dark.ink } };
  const onboardingLight = { ...base, profile: 'onboarding', scene: 'o1-ilk-acilis-1', sceneKind: 'onboarding', screenshot: 'o1-ilk-acilis-1.webp', verifiedTheme: { dataTheme: 'light', surface: THEME_TOKENS.light.surface, ink: THEME_TOKENS.light.ink } };
  const onboardingDark = { ...dark, profile: 'onboarding', scene: 'o1-ilk-acilis-1', sceneKind: 'onboarding', screenshot: 'o1-ilk-acilis-1.webp' };
  const valid = { rows: [base, dark, onboardingLight, onboardingDark] };

  const cases = [];
  const expectFail = (label, mutate) => {
    const copy = JSON.parse(JSON.stringify(valid));
    mutate(copy);
    const result = validateManifest(copy, { issueFile: '' });
    cases.push({ label, expect: 'reject', rejected: result.ok === false, errors: result.errors });
  };

  const validResult = validateManifest(valid, { issueFile: '' });
  cases.push({ label: 'geçerli manifest kabul edilir', expect: 'accept', rejected: validResult.ok === false, errors: validResult.errors });
  expectFail('eksik satır (dark tema silindi)', (m) => { m.rows = m.rows.filter((row) => row.theme !== 'dark'); });
  expectFail('eksik alan (sha256)', (m) => { delete m.rows[0].sha256; });
  expectFail('bozuk hash biçimi', (m) => { m.rows[0].sha256 = 'zz'; });
  expectFail('tema etiketi root ile çelişiyor', (m) => { m.rows[0].verifiedTheme = { dataTheme: 'dark', surface: THEME_TOKENS.dark.surface, ink: THEME_TOKENS.dark.ink }; });
  expectFail('computed yüzey tokenı yanlış temaya ait', (m) => { m.rows[0].verifiedTheme.surface = THEME_TOKENS.dark.surface; });
  expectFail('computed token hiç ölçülmemiş', (m) => { m.rows[0].verifiedTheme = { dataTheme: 'light' }; });
  expectFail('sahne tek temada kaldı (dark kopyası silindi)', (m) => { m.rows = m.rows.filter((row) => !(row.scene === 'v01-home' && row.theme === 'dark')); });
  expectFail('bilinmeyen sceneKind', (m) => { m.rows[0].sceneKind = 'zzz-nonsense'; });
  expectFail('sceneKind sahne adıyla çelişiyor', (m) => { m.rows[0].sceneKind = 'practice'; });
  expectFail('log satırı yok', (m) => { m.rows[0].log = []; });
  expectFail('profil eksik (onboarding)', (m) => { m.rows = m.rows.filter((row) => row.profile !== 'onboarding'); });
  expectFail('kapsam eksik (dark onboarding)', (m) => { m.rows = m.rows.filter((row) => !(row.profile === 'onboarding' && row.theme === 'dark')); });
  expectFail('geçersiz tema adı', (m) => { m.rows[0].theme = 'auto'; });
  expectFail('beyan edilen SERT taşma', (m) => { m.rows[0].issues = ['SERT:SAYFA-TAŞMASI | html | x | sw=1 cw=0']; });
  expectFail('yakalama ölçeği yok (beyan edilmemiş)', (m) => { delete m.rows[0].captureScale; });
  expectFail('yakalama ölçeği geçersiz', (m) => { m.rows[0].captureScale = 0; });

  // ── F2: CTA sözleşmesi manifestten BAĞIMSIZ olarak satırlardan doğrulanır ────────────────────
  // Geometri alanları (y/width/height/dialogBottom) ZORUNLU: `visible` bunlardan yeniden
  // türetilir (16. denetim F16-1) ve hedef ≥44 px her iki boyutta denetlenir (F16-2).
  const ctaGeom = { present: true, selector: '.x', x: 20, y: 100, width: 350, height: 50, dialogBottom: 844, dialogRight: 390, visible: true, focusReachable: true, hiddenBy: false, overlapsControl: [], overlapCovered: false, overlapsContent: [], scroll: { scrollTop: 0, scrollHeight: 844, clientHeight: 844, localScroll: false } };
  const ctaRow = (over = {}) => ({ ...base, scene: 'l01-goal', sceneKind: 'lesson', cta: { ...ctaGeom, ...over } });
  // CTA taşımak zorunda olan üç aşama (lesson/practice/feedback) temsil edilmeli, aksi hâlde
  // doğrulayıcı "zorunlu sahne türü eksik" der (R5-F1).
  const practiceRow = { ...base, scene: 'l02-gorev-word', sceneKind: 'practice', cta: { ...ctaGeom, selector: '.kao-choices button', height: 56 } };
  const feedbackRow = { ...base, scene: 'l02-panel-dogru', sceneKind: 'feedback', cta: { ...ctaGeom, selector: '.kao-feedback-continue', height: 44 } };
  const withCta = {
    rows: [ctaRow(), practiceRow, feedbackRow, { ...dark, cta: null }, onboardingLight, onboardingDark],
    ctaReport: [
      { scene: 'l01-goal', stage: 'goal', samples: 2, layoutYs: [100, 100], maxDelta: 0 },
      { scene: 'l02-gorev-word', stage: 'practice', samples: 2, layoutYs: [100, 100], maxDelta: 0 },
      { scene: 'l02-panel-dogru', stage: 'feedback', samples: 2, layoutYs: [100, 100], maxDelta: 0 },
    ],
    productionFindings: [],
  };
  const ctaCase = (label, mutate) => {
    const copy = JSON.parse(JSON.stringify(withCta));
    mutate(copy);
    const result = validateCta(copy);
    cases.push({ label, expect: 'reject', rejected: result.ok === false, errors: result.errors });
  };
  const withCtaResult = validateCta(withCta);
  cases.push({ label: 'CTA sözleşmesi geçerli manifest kabul edilir', expect: 'accept', rejected: withCtaResult.ok === false, errors: withCtaResult.errors });
  ctaCase('CTA görünmez', (m) => { m.rows[0].cta.visible = false; });
  ctaCase('CTA hedefi 44px altı', (m) => { m.rows[0].cta.height = 12; });
  ctaCase('CTA klavye odağına ulaşmıyor', (m) => { m.rows[0].cta.focusReachable = false; });
  // 16. denetim F16-1/F16-2: görünürlük geometriden türetilir; hedef ≥44 px HER İKİ boyutta.
  ctaCase('CTA visible beyanı geometriyle çelişiyor', (m) => {
    m.rows[0].cta.y = 900; m.rows[0].cta.visible = true;
  });
  ctaCase('CTA genişliği 44px altı', (m) => { m.rows[0].cta.width = 20; });
  ctaCase('CTA geometrisi eksik (görünürlük türetilemez)', (m) => { delete m.rows[0].cta.dialogBottom; });
  // 18. denetim F18-1: yatay eksen de (x/dialogRight) okunur; `visible` iki eksende türetilir.
  ctaCase('CTA yatayda diyalog dışında', (m) => { m.rows[0].cta.x = -1000; });
  ctaCase('CTA sağ kenarı diyalog dışına taşıyor', (m) => { m.rows[0].cta.width = 900; });
  ctaCase('CTA yatay geometrisi eksik (x/dialogRight)', (m) => { delete m.rows[0].cta.x; });
  // 20. denetim F20-1: turev sozlesme alanlari tek alanla cevrilemez.
  ctaCase('CTA overlapCovered overlapsContent ile çelişiyor', (m) => {
    m.rows[0].cta.overlapsContent = []; m.rows[0].cta.overlapCovered = true;
  });
  ctaCase('CTA scroll.localScroll scrollHeight/clientHeight ile çelişiyor', (m) => {
    m.rows[0].cta.scroll = { scrollTop: 0, scrollHeight: 900, clientHeight: 844, localScroll: false };
  });
  ctaCase('CTA scroll geometrisi eksik (localScroll türetilemez)', (m) => {
    m.rows[0].cta.scroll = { scrollTop: 0, localScroll: true };
  });

  ctaCase('CTA sunulmadı', (m) => { m.rows[0].cta.present = false; });
  ctaCase('CTA kararlılık kaydı yok (feedback panelleri)', (m) => { m.ctaReport = m.ctaReport.filter((item) => item.scene !== 'l02-panel-dogru'); });
  ctaCase('CTA >8px fark beyan edilmemiş', (m) => { m.ctaReport[0].layoutYs = [10, 40]; m.ctaReport[0].maxDelta = 30; });
  ctaCase('CTA ölçümü silinmiş (lesson satırı)', (m) => { m.rows[0].cta = null; });
  ctaCase('uydurma üretim bulgusu (ölçümle doğrulanmıyor)', (m) => { m.productionFindings = [{ scene: 'l01-goal', kind: 'cta_hidden_by' }]; });
  ctaCase('CTA tek örnekle karşılaştırılmış', (m) => { m.ctaReport[0].samples = 1; });
  ctaCase('zorunlu sahne türü silinmiş (feedback)', (m) => { m.rows = m.rows.filter((row) => row.sceneKind !== 'feedback'); });
  // 15. denetim F15-1: `layoutYs` satırın kendi `cta.layoutY` ölçümüne bağlı olmalı.
  ctaCase('CTA layoutYs[0] satırdaki cta.layoutY ile çelişiyor', (m) => {
    m.rows[0].cta.layoutY = 285;
    m.ctaReport[0].layoutYs = [400, 400];
  });


  // ── 10. denetim F10: LOG ÇAPALARI ────────────────────────────────────────────────────────
  // Bu çapalar yalnız `logLines` verildiğinde çalışır; yukarıdaki matris `logLines` geçmiyor.
  // Ayrı blok kurulur, aksi hâlde "negatif vaka var" görünüp hiçbir şeyi sınamaz.
  const logLineOf = (row) => {
    const hard = (row.issues || []).filter((i) => typeof i === 'string' && i.startsWith('SERT:')).map((i) => i.split('|')[0].replace(/^SERT:\s*/, '').trim()).filter(Boolean);
    const overflowX = hard.includes('YATAY-KIRPILIR') || hard.includes('SAYFA-TAŞMASI');
    const isCta = row.cta && row.cta.present === true;
    const sel = isCta && typeof row.cta.selector === 'string' && row.cta.selector ? sha256Text(row.cta.selector).slice(0, 12) : '-1';
    const covN = isCta && Array.isArray(row.cta.overlapsContent) ? row.cta.overlapsContent.length : -1;
    const lscroll = isCta && row.cta.scroll && typeof row.cta.scroll.localScroll === 'boolean' ? row.cta.scroll.localScroll : 'na';
    const covPx = isCta && Array.isArray(row.cta.overlapsContent) && row.cta.overlapsContent.length
      ? Math.max(...row.cta.overlapsContent.map((item) => Math.round(item.overlapPx || 0))) : 0;
    const coverY = isCta && Array.isArray(row.cta.coverStack) && row.cta.coverStack.length
      ? Math.round(row.cta.coverStack[0].y || 0) : -1;
    const normList = (list) => (Array.isArray(list) ? list : []).map((item) => `${item.tag}|${item.cls}|${item.y}|${item.h}|${item.pos || ''}|${item.z || ''}|${item.overlapPx === undefined ? '' : item.overlapPx}|${item.txt || ''}`);
    const covH = isCta && Array.isArray(row.cta.overlapsContent) && row.cta.overlapsContent.length ? sha256Text(normList(row.cta.overlapsContent).join('\n')).slice(0, 12) : '-1';
    const coverH = isCta && Array.isArray(row.cta.coverStack) && row.cta.coverStack.length ? sha256Text(normList(row.cta.coverStack).join('\n')).slice(0, 12) : '-1';
    return `${row.scene}: theme=${row.verifiedTheme.dataTheme} surface=${row.verifiedTheme.surface} vw=${row.viewport.width} vh=${row.viewport.height} inset=${row.viewport.safeAreaBottom} hidden=${Boolean(row.cta && row.cta.hiddenBy)} hiddenPx=${(row.cta && Array.isArray(row.cta.coverStack) && row.cta.coverStack.length) ? Math.round(row.cta.coverStack[0].h) : 0} collisions=0 collisionPx=0 ctaW=${isCta ? Math.round(row.cta.width) : -1} ctaH=${isCta ? Math.round(row.cta.height) : -1} ctaX=${isCta ? Math.round(row.cta.x) : -1} ctaY=${isCta ? Math.round(row.cta.y) : -1} ctaR=${isCta ? Math.round(row.cta.dialogRight) : -1} ctaLay=${isCta && typeof row.cta.layoutY === 'number' ? Math.round(row.cta.layoutY) : -1} ctaScr=${isCta && typeof row.cta.scrollTop === 'number' ? Math.round(row.cta.scrollTop) : -1} focus=${isCta ? Boolean(row.cta.focusReachable) : false} sel=${sel} covN=${covN} covPx=${covPx} covH=${covH} coverY=${coverY} coverH=${coverH} lscroll=${lscroll} overflowX=${overflowX} hard=${hard.length ? hard.sort().join(',') : 'yok'}${row.profile === 'onboarding' ? ` node=onboarding text=0123456789ab onb=${row.verifiedTheme.onb || 'yok'}` : ''} | x`;
  };
  // TEK KOŞUM tabanı: bir koşum tek tema üretir (`validateManifest` singleRun:true bunu
  // dayatır), bu yüzden `withCta` (iki temalı) burada kullanılamaz. Aynı sahne kümesi tek
  // temada, CTA taşıyan üç aşama dâhil kurulur; satırların kendi `log` metni de
  // `log.txt` ile aynı olmalı (iki yönlü eşleşme).
  const withLogLines = (copy) => {
    copy.rows.forEach((row) => { row.log = [logLineOf(row)]; });
    return copy.rows.map(logLineOf);
  };
  const shot = (row) => ({ ...row, screenshot: `${row.scene}.webp` });
  const singleRunBase = {
    rows: [
      shot({ ...base }),
      shot({ ...base, scene: 'v02-units', sceneKind: 'view' }),
      shot({ ...base, profile: 'onboarding', scene: 'o1-ilk-acilis-1', sceneKind: 'onboarding' }),
      shot(ctaRow()),
      shot(practiceRow),
      shot(feedbackRow),
    ],
    ctaReport: [
      { scene: 'l01-goal', stage: 'goal', samples: 2, layoutYs: [100, 100], maxDelta: 0 },
      { scene: 'l02-gorev-word', stage: 'practice', samples: 2, layoutYs: [100, 100], maxDelta: 0 },
      { scene: 'l02-panel-dogru', stage: 'feedback', samples: 2, layoutYs: [100, 100], maxDelta: 0 },
    ],
    productionFindings: [],
  };
  const logCase = (label, mutate, mutateLog) => {
    const copy = JSON.parse(JSON.stringify({ ...singleRunBase }));
    mutate(copy);
    const lines = withLogLines(copy);
    if (mutateLog) mutateLog(lines, copy);
    const result = validateManifest(copy, { issueFile: '', logLines: lines, singleRun: true });
    cases.push({ label, expect: 'reject', rejected: result.ok === false, errors: result.errors });
  };
  // Çapa çalışıyor mu? Hiç bozulmamış hâli KABUL edilmeli (yoksa aşağıdaki retler anlamsız).
  {
    const copy = JSON.parse(JSON.stringify({ ...singleRunBase }));
    const lines = withLogLines(copy);
    const result = validateManifest(copy, { issueFile: '', logLines: lines, singleRun: true });
    cases.push({ label: 'log çapalarıyla geçerli manifest kabul edilir', expect: 'accept', rejected: result.ok === false, errors: result.errors });
  }
  logCase('log.txt teması manifest temasıyla çelişiyor',
    (m) => { m.rows[0].theme = 'dark'; m.rows[0].verifiedTheme = { dataTheme: 'dark', surface: THEME_TOKENS.dark.surface, ink: THEME_TOKENS.dark.ink }; },
    (lines) => { lines[0] = lines[0].replace('theme=light', 'theme=dark'); });
  logCase('log.txt surface manifestteki tokenla çelişiyor', () => {},
    (lines) => { lines[0] = lines[0].replace(/surface=#[0-9A-Fa-f]{6}/, 'surface=#000000'); });
  logCase('CTA satırının log satırında collisions= alanı yok', () => {},
    (lines, m) => { const i = m.rows.findIndex((r) => r.cta && r.cta.present === true); lines[i] = lines[i].replace(/ collisions=\d+ collisionPx=\d+/, ''); });
  logCase('log.txt collisions sayısı beyanla çelişiyor', () => {},
    (lines, m) => { const i = m.rows.findIndex((r) => r.cta && r.cta.present === true); lines[i] = lines[i].replace(/collisions=\d+/, 'collisions=99'); });
  logCase('log.txt collisionPx beyanla çelişiyor',
    (m) => { const row = m.rows.find((r) => r.cta && r.cta.present === true); row.cta.overlapsControl = [{ tag: 'BUTTON', cls: 'x', y: row.cta.y, h: 44, overlapPx: 44 }]; },
    (lines, m) => { const i = m.rows.findIndex((r) => r.cta && r.cta.present === true); lines[i] = lines[i].replace(/collisionPx=\d+/, 'collisionPx=44'); });
  logCase('log.txt vh= manifest yüksekliğiyle çelişiyor', () => {},
    (lines) => { lines[0] = lines[0].replace(/vh=\d+/, 'vh=9999'); });
  // 14. denetim F14-1/F14-2/F14-3: sahne ↔ log ↔ screenshot ↔ glif kanıtı kimliği.
  logCase('satırın log metni başka sahnenin satırı', () => {},
    (lines, m) => { m.rows[0].log = [lines[1]]; });
  {
    const copy = JSON.parse(JSON.stringify({ ...singleRunBase }));
    const lines = withLogLines(copy);
    const [first, second] = copy.rows;
    const a = { screenshot: first.screenshot, sha256: first.sha256 };
    first.screenshot = second.screenshot; first.sha256 = second.sha256;
    second.screenshot = a.screenshot; second.sha256 = a.sha256;
    const result = validateManifest(copy, { issueFile: '', logLines: lines, singleRun: true, root: null });
    cases.push({ label: 'screenshot adı sahneden türetilmemiş', expect: 'reject', rejected: result.ok === false, errors: result.errors });
  }
  // 15. denetim F15-2: glif satırı varsa `glyphEvidence` ZORUNLU (validateManifest'te).
  {
    const copy = JSON.parse(JSON.stringify({ ...singleRunBase }));
    copy.rows.push({ ...base, scene: 'g1-30-zor-glif', sceneKind: 'glyph', profile: 'glif', screenshot: 'g1-30-zor-glif.webp' });
    const lines = withLogLines(copy);
    delete copy.glyphEvidence;
    const result = validateManifest(copy, { issueFile: '', logLines: lines, singleRun: true });
    cases.push({ label: 'glif satırı var ama glyphEvidence yok', expect: 'reject', rejected: result.ok === false, errors: result.errors });
  }
  {
    const copy = JSON.parse(JSON.stringify({ ...singleRunBase }));
    const lines = withLogLines(copy);
    const target = copy.rows.find((row) => row.sceneKind !== 'glyph');
    copy.glyphEvidence = { screenshot: target.screenshot, screenshotSha256: target.sha256, series: [{ ar: 'x' }], seriesCount: 1 };
    // `root: null` olduğu için disk/hash karşılaştırması atlanır; sınanan şey bağın
    // GLİF satırı olması gerektiğidir (F14-3).
    const result = validateManifest(copy, { issueFile: '', logLines: lines, singleRun: true, root: null });
    cases.push({ label: 'glyphEvidence bir glif satırına bağlı değil', expect: 'reject', rejected: result.ok === false, errors: result.errors });
  }
  // 11. denetim F11-1: token'ı SİLMEK çapayı sessizce devre dışı bırakamaz.
  for (const token of ['vw=', 'vh=', 'theme=', 'surface=', 'hidden=', 'hiddenPx=', 'overflowX=', 'hard=', 'node=', 'text=', 'onb=', 'ctaW=', 'ctaH=', 'ctaX=', 'ctaR=', 'focus=', 'ctaY=', 'ctaLay=', 'ctaScr=', 'sel=', 'covN=', 'covPx=', 'covH=', 'coverY=', 'coverH=', 'lscroll=']) {
    // `node=`/`text=`/`onb=` yalnız onboarding satırında bulunur; diğerleri her satırda.
    const onboardingOnly = token === 'node=' || token === 'text=' || token === 'onb=';
    const ctaOnly = token === 'ctaW=' || token === 'ctaH=' || token === 'ctaX=' || token === 'ctaR=' || token === 'focus='
      || token === 'sel=' || token === 'covN=' || token === 'lscroll=' || token === 'covPx=' || token === 'covH=' || token === 'coverY=' || token === 'coverH='
      || token === 'ctaY=' || token === 'ctaLay=' || token === 'ctaScr=';
    logCase(`log.txt satırında ${token} alanı yok`,
      (m) => { m.rows.forEach((row) => { row.log = [logLineOf(row)]; }); },
      (lines, m) => {
        const i = onboardingOnly ? m.rows.findIndex((row) => row.profile === 'onboarding')
          : ctaOnly ? m.rows.findIndex((row) => row.cta && row.cta.present === true)
            : 0;
        const re = new RegExp(`\\s${token.replace(/[-[\]{}()*+?.,\\\\^$|#\s]/g, '\\$&')}\\S*`, 'g');
        lines[i] = lines[i].replace(re, '');
        m.rows[i].log = [lines[i]];
      });
  }
  // 12. denetim F12-1: `SERT:` beyanı log'daki `hard=` kümesiyle birebir eşleşmeli.
  logCase('SERT: beyanı log.txt hard= ile çelişiyor', () => {},
    (lines, m) => {
      const i = m.rows.findIndex((r) => !r.issues || r.issues.length === 0);
      lines[i] = lines[i].replace(/hard=\S+/, 'hard=SAYFA-TAŞMASI');
    });
  logCase('log.txt hard= taşıyor ama manifestte SERT: yok', () => {},
    (lines) => { lines[0] = lines[0].replace(/hard=yok/, 'hard=DIŞARI-TAŞAR'); });
  logCase('log.txt overflowX= hard= ile çelişiyor', () => {},
    (lines) => { lines[0] = lines[0].replace(/overflowX=false/, 'overflowX=true'); });
  // 17. denetim F17-1/F17-3: CTA hedef/fokus ve diyalog tabanı/kaydırma bağı.
  logCase('CTA height log ctaH= ile çelişiyor',
    (m) => { const r = m.rows.find((x) => x.cta && x.cta.present === true); r.cta.height = 50; },
    (lines, m) => { const i = m.rows.findIndex((x) => x.cta && x.cta.present === true); lines[i] = lines[i].replace(/ctaH=\d+/, 'ctaH=12'); m.rows[i].log = [lines[i]]; });
  logCase('CTA y log ctaY= ile çelişiyor',
    (m) => { const r = m.rows.find((x) => x.cta && x.cta.present === true); r.cta.y = 100; },
    (lines, m) => { const i = m.rows.findIndex((x) => x.cta && x.cta.present === true); lines[i] = lines[i].replace(/ctaY=-?\d+/, 'ctaY=999'); m.rows[i].log = [lines[i]]; });
  logCase('CTA layoutY log ctaLay= ile çelişiyor',
    (m) => { const r = m.rows.find((x) => x.cta && x.cta.present === true); r.cta.layoutY = 100; },
    (lines, m) => { const i = m.rows.findIndex((x) => x.cta && x.cta.present === true); lines[i] = lines[i].replace(/ctaLay=-?\d+/, 'ctaLay=999'); m.rows[i].log = [lines[i]]; });
  logCase('CTA scrollTop log ctaScr= ile çelişiyor',
    (m) => { const r = m.rows.find((x) => x.cta && x.cta.present === true); r.cta.scrollTop = 0; },
    (lines, m) => { const i = m.rows.findIndex((x) => x.cta && x.cta.present === true); lines[i] = lines[i].replace(/ctaScr=-?\d+/, 'ctaScr=999'); m.rows[i].log = [lines[i]]; });
  logCase('CTA focusReachable log focus= ile çelişiyor',
    (m) => { const r = m.rows.find((x) => x.cta && x.cta.present === true); r.cta.focusReachable = true; },
    (lines, m) => { const i = m.rows.findIndex((x) => x.cta && x.cta.present === true); lines[i] = lines[i].replace(/focus=(true|false)/, 'focus=false'); m.rows[i].log = [lines[i]]; });
  // 18. denetim F18-1: yatay eksen tek alanla değiştirilemez.
  logCase('CTA x log ctaX= ile çelişiyor',
    (m) => { const r = m.rows.find((x) => x.cta && x.cta.present === true); r.cta.x = 20; },
    (lines, m) => { const i = m.rows.findIndex((x) => x.cta && x.cta.present === true); lines[i] = lines[i].replace(/ctaX=-?\d+/, 'ctaX=-1000'); m.rows[i].log = [lines[i]]; });
  logCase('CTA dialogRight log ctaR= ile çelişiyor',
    (m) => { const r = m.rows.find((x) => x.cta && x.cta.present === true); r.cta.dialogRight = 390; },
    (lines, m) => { const i = m.rows.findIndex((x) => x.cta && x.cta.present === true); lines[i] = lines[i].replace(/ctaR=-?\d+/, 'ctaR=1200'); m.rows[i].log = [lines[i]]; });
  logCase('CTA dialogBottom viewport.height ile çelişiyor',
    (m) => { const r = m.rows.find((x) => x.cta && x.cta.present === true); r.cta.dialogBottom = 1000; });
  logCase('CTA y+scrollTop layoutY ile çelişiyor',
    (m) => { const r = m.rows.find((x) => x.cta && x.cta.present === true); r.cta.y = 400; r.cta.layoutY = 100; });
  logCase('glyphEvidence.scene eşleşen glif satırıyla çelişiyor', () => {},
    (lines, m) => {
      m.rows.push({ ...base, scene: 'g1-30-zor-glif', sceneKind: 'glyph', profile: 'glif', screenshot: 'g1-30-zor-glif.webp' });
      m.glyphEvidence = { scene: 'nope', screenshot: 'g1-30-zor-glif.webp', screenshotSha256: 'a'.repeat(64), series: [{ ar: 'x' }], seriesCount: 1, font: { faces: [], requests: [], withFont: 1, withFallback: 2 } };
      lines.push('g1-30-zor-glif: theme=light surface=#F7F5EE vw=390 vh=844 inset=0 loaded=false woff2=0 metrics=1/2 | x');
    });
  // 20. denetim F20-1: sozlesme alanlari tek alanla degistirilemez (LOG capasi).
  // `sel=` log'da kalir, manifestteki secici degisir -> celiski.
  logCase('CTA selector log sel= ile çelişiyor',
    (m) => { const r = m.rows.find((x) => x.cta && x.cta.present === true); r.cta.selector = 'body'; },
    (lines, m) => {
      const i = m.rows.findIndex((x) => x.cta && x.cta.present === true);
      const realSel = '.kao-lesson[data-lesson-stage="goal"] > .kao-lesson-next';
      lines[i] = lines[i].replace(/sel=[0-9a-f]{12}/, `sel=${sha256Text(realSel).slice(0, 12)}`);
      m.rows[i].log = [lines[i]];
    });
  logCase('CTA overlapsContent log covN= ile çelişiyor',
    (m) => { const r = m.rows.find((x) => x.cta && x.cta.present === true); r.cta.overlapsContent = []; r.cta.overlapCovered = false; },
    (lines, m) => { const i = m.rows.findIndex((x) => x.cta && x.cta.present === true); lines[i] = lines[i].replace(/covN=-?\d+/, 'covN=3'); m.rows[i].log = [lines[i]]; });
  logCase('CTA scroll.localScroll log lscroll= ile çelişiyor',
    (m) => { const r = m.rows.find((x) => x.cta && x.cta.present === true); r.cta.scroll = { scrollTop: 0, scrollHeight: 900, clientHeight: 844, localScroll: true }; },
    (lines, m) => { const i = m.rows.findIndex((x) => x.cta && x.cta.present === true); lines[i] = lines[i].replace(/lscroll=(true|false|na)/, 'lscroll=false'); m.rows[i].log = [lines[i]]; });
  logCase('onboarding verifiedTheme.onb log onb= ile çelişiyor',
    (m) => { const r = m.rows.find((x) => x.profile === 'onboarding'); r.verifiedTheme = { ...r.verifiedTheme, onb: 'light' }; },
    (lines, m) => { const i = m.rows.findIndex((x) => x.profile === 'onboarding'); lines[i] = lines[i].replace(/onb=[a-z]+/, 'onb=dark'); m.rows[i].log = [lines[i]]; });
  // 26. denetim F26: manifest.theme/viewport satirlardan turetilir; dikey eksen log'da.
  expectFail('manifest.theme satırlarla çelişiyor', (m) => { m.theme = 'dark'; });
  expectFail('manifest.viewport satırlarla çelişiyor', (m) => { m.viewport = { width: 1, height: 844, safeAreaBottom: 0 }; });
  // 25. denetim F25: bulgu listesi kumesel + yukseklik zinciri butun olarak bagli.
  expectFail('üretim bulgusu tekrar ediyor', (m) => {
    m.productionFindings = [{ scene: 'l01-goal', kind: 'cta_hidden_by' }, { scene: 'l01-goal', kind: 'cta_hidden_by' }];
  });
  expectFail('sheet yükseklik zinciri tutarsız', (m) => {
    m.glyphEvidence = m.glyphEvidence || {};
    m.glyphEvidence.sheet = { ...(m.glyphEvidence.sheet || {}), sheetHeight: 2622, docH: 2623, bodyH: 2622, scrollH: 2622, clientH: 2622 };
  });
  // 24. denetim F24: sekil denetimi yetmez — deger bagimsiz kaynakla karsilastirilir.
  expectFail('font.check log ile çelişiyor', (m) => {
    m.glyphEvidence = m.glyphEvidence || {};
    m.glyphEvidence.font = { ...(m.glyphEvidence.font || {}), check: false, distinct: true, faces: [], requests: [], withFont: 1, withFallback: 2 };
  });
  expectFail('sheet.minH fiziksel olarak imkânsız', (m) => {
    m.glyphEvidence = m.glyphEvidence || {};
    m.glyphEvidence.sheet = { ...(m.glyphEvidence.sheet || {}), minH: 1 };
  });
  // 23. denetim F23-1: sozlesmede KAYITLI ama okunmayan yaprak alanlar artik bagli.
  expectFail('font face ağırlığı değiştirilmiş', (m) => {
    m.glyphEvidence = m.glyphEvidence || {};
    m.glyphEvidence.font = { ...(m.glyphEvidence.font || {}), faces: [{ family: 'K3P Scheherazade', weight: '700', status: 'loaded', unicodeRange: 'U+600-6FF' }] };
  });
  expectFail('lexicon sürümü canlı içerikle çelişiyor', (m) => {
    m.glyphEvidence = m.glyphEvidence || {};
    m.glyphEvidence.lexiconVersion = 'x';
  });
  expectFail('viewportHeightDuringCapture türetimle çelişiyor', (m) => {
    m.glyphEvidence = m.glyphEvidence || {};
    m.glyphEvidence.sheet = { ...(m.glyphEvidence.sheet || {}), sheetHeight: 2622 };
    m.glyphEvidence.viewportHeightDuringCapture = 1;
  });
  expectFail('yol taklidi (üst düzey sahte anahtar)', (m) => { m['rows[].cta.height'] = 999; });
  expectFail('yol taklidi (satır içi noktalı anahtar)', (m) => { m.rows[0]['cta.width'] = 9999; });
  // 22. denetim F22-0: kapali alan sozlesmesi — sozlesmede olmayan alan reddedilir.
  expectFail('sözleşmede olmayan üst düzey alan', (m) => { m.brandNewClaim = 1; });
  expectFail('sözleşmede olmayan satır alanı', (m) => { m.rows[0].brandNewClaim = 1; });
  expectFail('sözleşmede olmayan cta alanı', (m) => { m.rows[0].cta = { ...m.rows[0].cta, brandNewClaim: 1 }; });
  // 21. denetim F21: manifest ustbilgisi + uretim bulgusu + sheet alanlari.
  expectFail('manifest.origin sahte origin', (m) => { m.origin = 'http://evil.com'; });
  expectFail('manifest.card yanlış kart', (m) => { m.card = 'K3PD-99'; });
  expectFail('manifest.mode geçersiz', (m) => { m.mode = 'xyz'; });
  expectFail('manifest.captureScales satırlarla çelişiyor', (m) => { m.captureScales = [9]; });
  ctaCase('üretim bulgusu theme satırla çelişiyor', (m) => {
    m.productionFindings = [{ scene: 'l01-goal', theme: 'dark', kind: 'cta_hidden_by' }];
  });
  ctaCase('üretim bulgusu viewport satırla çelişiyor', (m) => {
    m.productionFindings = [{ scene: 'l01-goal', viewport: { width: 1, height: 1, safeAreaBottom: 9 }, kind: 'cta_hidden_by' }];
  });
  logCase('log.txt hidden= ile cta.hiddenBy çelişiyor',
    (m) => { const row = m.rows.find((r) => r.cta && r.cta.present === true); row.cta.hiddenBy = true; row.cta.coverStack = [{ tag: 'BUTTON', cls: 'x', y: row.cta.y, h: 44 }]; },
    (lines, m) => {
      // `hidden=false` kalsın: beyan true, log false.
      const i = m.rows.findIndex((r) => r.cta && r.cta.present === true);
      lines[i] = lines[i].replace(/hidden=(true|false)/, 'hidden=false');
    });

  return cases;
}

const args = process.argv.slice(2);
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  if (args.includes('--glif-liste')) {
    const { series, lexiconVersion, surahVersion } = glyphSeries();
    console.log(JSON.stringify({ count: series.length, lexiconVersion, surahVersion, series }, null, 2));
    process.exit(0);
  }
  if (args.includes('--negatif-test')) {
    const cases = negativeSelfTest();
    let failed = 0;
    for (const item of cases) {
      // `expect:'accept'` → reddedilmemeli; `expect:'reject'` → reddedilmeli.
      const good = item.expect === 'accept' ? item.rejected === false : item.rejected === true;
      if (!good) { failed += 1; console.error(`FAIL  ${item.label}`); } else console.log(`PASS  ${item.label}`);
    }
    process.exit(failed ? 1 : 0);
  }
  const verifyIndex = args.indexOf('--dogrula');
  if (verifyIndex >= 0) {
    // ÇOKLU DİZİN: verilen dizinlerin TAMAMI doğrulanır. Fazladan argüman sessizce
    // yutulmaz (önceden yalnız ilki okunuyor, geri kalanı yok sayılıp exit 0 veriliyordu —
    // bu, "8 dizin doğrulandı" gibi bir makbuzu üretilemez kılıyordu).
    const dirs = args.slice(verifyIndex + 1).filter((arg) => !arg.startsWith('--'));
    if (dirs.length === 0) { console.error('--dogrula <kanit-dizini...> gerekli'); process.exit(2); }
    let totalRows = 0; let failed = false;
    for (const dir of dirs) {
      const manifestPath = path.join(dir, 'MANIFEST.json');
      if (!fs.existsSync(manifestPath)) { console.error(`HATA MANIFEST.json yok: ${manifestPath}`); failed = true; continue; }
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (args.includes('--v2-temiz')) {
        const current = validateCleanV2(manifest);
        if (!current.ok) { failed = true; current.errors.forEach((error) => console.error(`HATA [${path.basename(dir)}] ${error}`)); continue; }
      }
      if (args.includes('--v3-guncel')) {
        const current = validateCurrentV3(manifest);
        if (!current.ok) { failed = true; current.errors.forEach((error) => console.error(`HATA [${path.basename(dir)}] ${error}`)); continue; }
      }
      if (args.includes('--v4-guncel')) {
        const current = validateCurrentV4(manifest);
        if (!current.ok) { failed = true; current.errors.forEach((error) => console.error(`HATA [${path.basename(dir)}] ${error}`)); continue; }
      }
      if (args.includes('--v5-guncel')) {
        const current = validateCurrentV5(manifest);
        if (!current.ok) { failed = true; current.errors.forEach((error) => console.error(`HATA [${path.basename(dir)}] ${error}`)); continue; }
      }
      if (args.includes('--v6-guncel')) {
        const current = validateCurrentV6(manifest);
        if (!current.ok) { failed = true; current.errors.forEach((error) => console.error(`HATA [${path.basename(dir)}] ${error}`)); continue; }
      }
      if (args.includes('--v7-guncel')) {
        const current = validateCurrentV7(manifest);
        if (!current.ok) { failed = true; current.errors.forEach((error) => console.error(`HATA [${path.basename(dir)}] ${error}`)); continue; }
      }
      if (args.includes('--v8-guncel')) {
        const current = validateCurrentV8(manifest);
        if (!current.ok) { failed = true; current.errors.forEach((error) => console.error(`HATA [${path.basename(dir)}] ${error}`)); continue; }
      }
      if (args.includes('--v9-guncel')) {
        const current = validateCurrentV9(manifest);
        if (!current.ok) { failed = true; current.errors.forEach((error) => console.error(`HATA [${path.basename(dir)}] ${error}`)); continue; }
      }
      if (args.includes('--v10-guncel')) {
        const current = validateCurrentV10(manifest);
        if (!current.ok) { failed = true; current.errors.forEach((error) => console.error(`HATA [${path.basename(dir)}] ${error}`)); continue; }
      }
      if (args.includes('--v11-guncel')) {
        const current = validateCurrentV11(manifest);
        if (!current.ok) { failed = true; current.errors.forEach((error) => console.error(`HATA [${path.basename(dir)}] ${error}`)); continue; }
      }
      const screenshots = fs.readdirSync(dir).filter((name) => /\.(png|webp)$/i.test(name)).map((name) => path.join(dir, name));
      const logPath = path.join(dir, 'log.txt');
      const issuesPath = path.join(dir, 'issues.txt');
      const logLines = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8').split('\n') : null;
      const issueFile = fs.existsSync(issuesPath) ? fs.readFileSync(issuesPath, 'utf8') : null;
      if (!logLines) { console.error(`HATA log.txt yok: ${dir}`); failed = true; continue; }
      if (issueFile === null) { console.error(`HATA issues.txt yok: ${dir}`); failed = true; continue; }
      const result = validateManifest(manifest, { root: dir, screenshots, singleRun: true, logLines, issueFile });
      if (!result.ok) {
        failed = true;
        result.errors.forEach((error) => console.error(`HATA [${path.basename(dir)}] ${error}`));
        continue;
      }
      // CTA sözleşmesi satırlardan yeniden doğrulanır (denetim bulgusu F2). `--dogrula`
      // daha önce `rows[].cta`, `ctaReport` ve `productionFindings` alanlarına hiç bakmıyordu;
      // bu yüzden tüm CTA ölçümleri silinse bile "hash/sayım/log/tema eşleşti" PASS veriyordu.
      const cta = validateCta(manifest);
      if (!cta.ok) {
        failed = true;
        cta.errors.slice(0, 12).forEach((error) => console.error(`HATA [${path.basename(dir)}] ${error}`));
        if (cta.errors.length > 12) console.error(`HATA [${path.basename(dir)}] … ${cta.errors.length - 12} CTA hatası daha`);
        continue;
      }
      totalRows += result.stats.rows;
      console.log(`PASS  ${path.basename(dir)}: ${result.stats.rows} satır · ${result.stats.uniqueScenes} sahne · ${cta.stats.measuredScenes} CTA (${cta.stats.reportEntries} kararlılık, ${cta.stats.declaredFindings} beyan) · hash/sayım/log/tema eşleşti`);
    }
    if (failed) process.exit(1);
    console.log(`PASS  ${dirs.length} dizin · toplam ${totalRows} satır · hepsi hash/sayım/log/tema eşleşti`);
    process.exit(0);
  }
  const coverageIndex = args.indexOf('--kapsam');
  if (coverageIndex >= 0) {
    const dirs = args.slice(coverageIndex + 1).filter((arg) => !arg.startsWith('--'));
    if (dirs.length === 0) { console.error('--kapsam <dizin...> gerekli'); process.exit(2); }
    const manifests = [];
    for (const dir of dirs) {
      const file = path.join(dir, 'MANIFEST.json');
      if (!fs.existsSync(file)) { console.error(`MANIFEST.json yok: ${file}`); process.exit(1); }
      manifests.push(JSON.parse(fs.readFileSync(file, 'utf8')));
    }
    if (args.includes('--v2-temiz')) {
      for (const [index, manifest] of manifests.entries()) {
        const current = validateCleanV2(manifest);
        if (!current.ok) { current.errors.forEach((error) => console.error(`HATA [${path.basename(dirs[index])}] ${error}`)); process.exit(1); }
      }
    }
    if (args.includes('--v3-guncel')) {
      for (const [index, manifest] of manifests.entries()) {
        const current = validateCurrentV3(manifest);
        if (!current.ok) { current.errors.forEach((error) => console.error(`HATA [${path.basename(dirs[index])}] ${error}`)); process.exit(1); }
      }
    }
    if (args.includes('--v4-guncel')) {
      for (const [index, manifest] of manifests.entries()) {
        const current = validateCurrentV4(manifest);
        if (!current.ok) { current.errors.forEach((error) => console.error(`HATA [${path.basename(dirs[index])}] ${error}`)); process.exit(1); }
      }
    }
    if (args.includes('--v5-guncel')) {
      for (const [index, manifest] of manifests.entries()) {
        const current = validateCurrentV5(manifest);
        if (!current.ok) { current.errors.forEach((error) => console.error(`HATA [${path.basename(dirs[index])}] ${error}`)); process.exit(1); }
      }
    }
    if (args.includes('--v6-guncel')) {
      for (const [index, manifest] of manifests.entries()) {
        const current = validateCurrentV6(manifest);
        if (!current.ok) { current.errors.forEach((error) => console.error(`HATA [${path.basename(dirs[index])}] ${error}`)); process.exit(1); }
      }
    }
    if (args.includes('--v7-guncel')) {
      for (const [index, manifest] of manifests.entries()) {
        const current = validateCurrentV7(manifest);
        if (!current.ok) { current.errors.forEach((error) => console.error(`HATA [${path.basename(dirs[index])}] ${error}`)); process.exit(1); }
      }
    }
    if (args.includes('--v8-guncel')) {
      for (const [index, manifest] of manifests.entries()) {
        const current = validateCurrentV8(manifest);
        if (!current.ok) { current.errors.forEach((error) => console.error(`HATA [${path.basename(dirs[index])}] ${error}`)); process.exit(1); }
      }
    }
    if (args.includes('--v9-guncel')) {
      for (const [index, manifest] of manifests.entries()) {
        const current = validateCurrentV9(manifest);
        if (!current.ok) { current.errors.forEach((error) => console.error(`HATA [${path.basename(dirs[index])}] ${error}`)); process.exit(1); }
      }
    }
    if (args.includes('--v10-guncel')) {
      for (const [index, manifest] of manifests.entries()) {
        const current = validateCurrentV10(manifest);
        if (!current.ok) { current.errors.forEach((error) => console.error(`HATA [${path.basename(dirs[index])}] ${error}`)); process.exit(1); }
      }
    }
    if (args.includes('--v11-guncel')) {
      for (const [index, manifest] of manifests.entries()) {
        const current = validateCurrentV11(manifest);
        if (!current.ok) { current.errors.forEach((error) => console.error(`HATA [${path.basename(dirs[index])}] ${error}`)); process.exit(1); }
      }
    }
    // TAM MANİFEST DOĞRULAMASI (8. denetim N8-F1): `--kapsam` önceden yalnız envanter +
    // CTA sözleşmesine bakıyordu; hash, görüntü bütünlüğü, tema, `SERT:`, satır↔log envanteri
    // ve disk sayımı HİÇ denetlenmiyordu. Bu yüzden bozuk bir koşum kümesi `--kapsam`dan
    // geçebiliyordu. Artık her dizin `--dogrula` ile aynı katı doğrulamadan geçer.
    const perDirErrors = [];
    for (const [index, dir] of dirs.entries()) {
      const logPath = path.join(dir, 'log.txt');
      const issuesPath = path.join(dir, 'issues.txt');
      const logLines = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8').split('\n') : null;
      const issueFile = fs.existsSync(issuesPath) ? fs.readFileSync(issuesPath, 'utf8') : null;
      const screenshots = fs.existsSync(dir)
        ? fs.readdirSync(dir).filter((name) => /\.(png|webp)$/i.test(name)).map((name) => path.join(dir, name))
        : [];
      const label = path.basename(dir);
      if (!logLines) { perDirErrors.push(`[${label}] log.txt yok`); continue; }
      if (issueFile === null) { perDirErrors.push(`[${label}] issues.txt yok`); continue; }
      const result = validateManifest(manifests[index], { root: dir, screenshots, singleRun: true, logLines, issueFile });
      if (!result.ok) {
        result.errors.slice(0, 6).forEach((error) => perDirErrors.push(`[${label}] ${error}`));
        if (result.errors.length > 6) perDirErrors.push(`[${label}] … ${result.errors.length - 6} hata daha`);
      }
    }
    if (perDirErrors.length) { perDirErrors.forEach((error) => console.error(`HATA ${error}`)); process.exit(1); }
    const coverage = validateCoverage(manifests);
    if (!coverage.ok) { coverage.errors.forEach((error) => console.error(`HATA ${error}`)); process.exit(1); }
    // KAPSAM KAPISI DA CTA SÖZLEŞMESİNİ DOĞRULAR: her koşumun manifesti `validateCta`'dan
    // geçer. Önceden `--kapsam` yalnız envanter/kombinasyon bakıyordu; böylece tüm CTA
    // ölçümleri silinse veya `l25-summary` kusuru manifestlerden kazınsa bile PASS veriyordu
    // (5. denetim R5-F1).
    const ctaErrors = [];
    for (const [index, manifest] of manifests.entries()) {
      const result = validateCta(manifest);
      if (!result.ok) {
        const label = path.basename(dirs[index]);
        result.errors.slice(0, 6).forEach((error) => ctaErrors.push(`[${label}] ${error}`));
        if (result.errors.length > 6) ctaErrors.push(`[${label}] … ${result.errors.length - 6} CTA hatası daha`);
      }
    }
    if (ctaErrors.length) { ctaErrors.forEach((error) => console.error(`HATA ${error}`)); process.exit(1); }
    console.log(`PASS  kapsam ${coverage.stats.runs} koşum · ${coverage.stats.totalRows} satır · ${coverage.stats.combinations.length} kombinasyon · viewport ${coverage.stats.viewports.join('/')} · CTA sözleşmesi ${manifests.length}/${manifests.length}`);
    process.exit(0);
  }
  const compareIndex = args.indexOf('--glif-karsilastir');
  if (compareIndex >= 0) {
    const beforeDir = args[compareIndex + 1];
    const afterDir = args[compareIndex + 2];
    if (!beforeDir || !afterDir) { console.error('--glif-karsilastir <once-dizini> <sonra-dizini> gerekli'); process.exit(2); }
    const readGlyph = (dir) => {
      const file = path.join(dir, 'MANIFEST.json');
      if (!fs.existsSync(file)) { console.error(`MANIFEST.json yok: ${file}`); process.exit(1); }
      const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
      const glyph = manifest.glyphEvidence;
      if (!glyph) { console.error(`glif kanıtı yok: ${dir}`); process.exit(1); }
      // GÖRÜNTÜNÜN KENDİSİ: manifest alanına güvenilmez. Ekran görüntüsü diske
      // hash'lenir; beyan edilen hash'ler de bu ölçümle çelişemez (denetim bulgusu F1:
      // önceki sürüm yalnız iki manifest STRING'ini karşılaştırıyordu, dolayısıyla
      // aynı görüntüyü iki kez çekmek — kartın hard stop'u — rc=0 ile geçiyordu).
      const shotPath = path.join(dir, glyph.screenshot);
      if (!fs.existsSync(shotPath)) { console.error(`glif görüntüsü yok: ${shotPath}`); process.exit(1); }
      const actualSha = sha256File(shotPath);
      const info = imageSize(shotPath);
      if (!info.ok) { console.error(`glif görüntüsü okunamadı: ${shotPath} (${info.reason})`); process.exit(1); }
      if (info.bytes < MIN_IMAGE_BYTES) { console.error(`glif görüntüsü çok küçük: ${info.bytes} bayt`); process.exit(1); }
      if (glyph.screenshotSha256 && glyph.screenshotSha256 !== actualSha) {
        console.error(`HATA ${dir}: glyphEvidence.screenshotSha256 diskteki baytla eşleşmiyor`);
        process.exit(1);
      }
      // Satır hash'i de diskle eşleşmeli (manifest içi tutarlılık).
      const row = (manifest.rows || []).find((item) => item.screenshot === glyph.screenshot);
      if (!row) { console.error(`HATA ${dir}: glif satırı manifestte yok (${glyph.screenshot})`); process.exit(1); }
      if (row.sha256 !== actualSha) { console.error(`HATA ${dir}: glif satırı sha256 diskle eşleşmiyor`); process.exit(1); }
      // TEMA, MANİFESTTEN DEĞİL DİSKTEKİ log.txt'TEN okunur (10. denetim F10-2): iki manifest
      // string'ini karşılaştırmak, gerçek bir koyu glif sayfasını "açık" diye etiketleyip
      // geçirmeye yetiyordu. Log satırı çekim ANINDA yazılmış bağımsız tanıktır.
      const logPath = path.join(dir, 'log.txt');
      if (!fs.existsSync(logPath)) { console.error(`HATA ${dir}: glif koşumunda log.txt yok`); process.exit(1); }
      // Sahne kimliği `glyphEvidence.scene`den okunur; eski kanıtta yoksa satırdaki
      // screenshot adından türetilir (ikisi de kanıtın kendi alanları).
      const glyphScene = glyph.scene || String(glyph.screenshot || '').replace(/\.(png|webp)$/i, '');
      const glyphLine = fs.readFileSync(logPath, 'utf8').split('\n')
        .find((line) => String(line).split(':')[0].trim() === glyphScene && /\btheme=/.test(line));
      if (!glyphLine) { console.error(`HATA ${dir}: log.txt'te glif satırı yok (${glyphScene})`); process.exit(1); }
      const loggedTheme = (/\btheme=([a-z]+)\b/.exec(glyphLine) || [])[1] || null;
      // FONT KANITI ÇAPASI (10. denetim F10-3): `glyphEvidence.font` hiçbir kod yolunda
      // doğrulanmıyordu; `distinct`/`check` serbestçe yazılabiliyordu. Log satırı yüklenen
      // font-face sayısını ve fallback ile ölçüm farkını taşır — oradan çapalanır.
      const loggedLoaded = /\bloaded=(true|false)\b/.exec(glyphLine);
      const loggedWoff2 = /\bwoff2=(\d+)\b/.exec(glyphLine);
      const loggedDistinct = /\bdistinct=(true|false)\b/.exec(glyphLine);
      const loggedCheck = /\bcheck=(true|false)\b/.exec(glyphLine);
      // METRİK ÇAPASI (11. denetim F11-3): `withFont`/`withFallback` manifestte serbest
      // yazılabiliyordu; log satırı `metrics=NNN/NNN` taşıdığı hâlde hiç okunmuyordu.
      const loggedMetrics = /\bmetrics=(\d+)\/(\d+)\b/.exec(glyphLine);
      if (!loggedMetrics) { console.error(`HATA ${dir}: log.txt glif satırı metrics= taşımıyor`); process.exit(1); }
      const fontMetrics = glyph.font || {};
      if (Number(loggedMetrics[1]) !== fontMetrics.withFont || Number(loggedMetrics[2]) !== fontMetrics.withFallback) {
        console.error(`HATA ${dir}: glyphEvidence.font metrics ${fontMetrics.withFont}/${fontMetrics.withFallback} ≠ log.txt'teki metrics=${loggedMetrics[1]}/${loggedMetrics[2]}`);
        process.exit(1);
      }
      if (!loggedLoaded || !loggedWoff2 || !loggedDistinct || !loggedCheck) {
        console.error(`HATA ${dir}: log.txt glif satırı font kanıtı taşımıyor (loaded=/woff2=/distinct=/check=)`);
        process.exit(1);
      }
      // 20. denetim F21-4: `ser=` bu kapida da zorunlu ve manifestteki 30 dizinin
      // birlesik ozetiyle eslesmek zorunda (aksi halde seri icerigi iki manifestte ortak
      // bir yanlis kumeye cevrilebilirdi — limit (e)'yi bu alan icin kapatir).
      const loggedSerCmp = /\bser=([0-9a-f]{16})\b/.exec(glyphLine);
      if (!loggedSerCmp) {
        console.error(`HATA ${dir}: log.txt glif satırı ser= taşımıyor — dizi özeti çapalanamaz`);
        process.exit(1);
      }
      if (Array.isArray(glyph.series) && glyph.series.length > 0) {
        const declaredSerCmp = sha256Text(glyph.series
          .map((item) => `${item.index}|${item.ar}|${item.source}|${item.corpus}|${item.marks}|${item.sha256}`)
          .join('\n')).slice(0, 16);
        if (loggedSerCmp[1] !== declaredSerCmp) {
          console.error(`HATA ${dir}: glif seri özeti ser=${loggedSerCmp[1]} ≠ manifestteki 30 diziden türetilen ${declaredSerCmp}`);
          process.exit(1);
        }
      }
      const font = glyph.font || {};
      if (Boolean(font.distinct) !== (loggedDistinct[1] === 'true')) {
        console.error(`HATA ${dir}: glyphEvidence.font.distinct '${font.distinct}' ≠ log.txt'teki distinct=${loggedDistinct[1]}`);
        process.exit(1);
      }
      if (Boolean(font.check) !== (loggedCheck[1] === 'true')) {
        console.error(`HATA ${dir}: glyphEvidence.font.check '${font.check}' ≠ log.txt'teki check=${loggedCheck[1]}`);
        process.exit(1);
      }
      const loadedFaces = Array.isArray(font.faces) ? font.faces.filter((face) => face && face.status === 'loaded').length : 0;
      if ((loadedFaces > 0) !== (loggedLoaded[1] === 'true')) {
        console.error(`HATA ${dir}: glyphEvidence.font.faces yüklü=${loadedFaces} ≠ log.txt'teki loaded=${loggedLoaded[1]}`);
        process.exit(1);
      }
      const woff2Requests = Array.isArray(font.requests) ? font.requests.length : 0;
      if (woff2Requests !== Number(loggedWoff2[1])) {
        console.error(`HATA ${dir}: glyphEvidence.font.requests ${woff2Requests} ≠ log.txt'teki woff2=${loggedWoff2[1]}`);
        process.exit(1);
      }
      // Seri sayısı log'daki `rows=` ile ve `series` uzunluğuyla eşleşmeli.
      const loggedRows = /\brows=(\d+)\b/.exec(glyphLine);
      if (loggedRows && Array.isArray(glyph.series) && glyph.series.length !== Number(loggedRows[1])) {
        console.error(`HATA ${dir}: glyphEvidence.series ${glyph.series.length} ≠ log.txt'teki rows=${loggedRows[1]}`);
        process.exit(1);
      }
      return { manifest, glyph, actualSha, info, loggedTheme };
    };
    const before = readGlyph(beforeDir);
    const after = readGlyph(afterDir);
    const errors = [];
    // Aynı dizi, aynı sıra, aynı metin: önce/sonra karşılaştırmasının ön koşulu.
    const bAr = before.glyph.series.map((item) => item.ar).join('|');
    const aAr = after.glyph.series.map((item) => item.ar).join('|');
    if (bAr !== aAr) errors.push('önce/sonra dizileri aynı değil (aynı dizi ve sıra olmalı)');
    // İKİ MANİFEST BİRLİKTE DÜZENLENEMEZ: diziler canlı içerikten YENİDEN türetilir.
    // (Aksi hâlde iki manifest ortak bir yanlış metin kümesine elle çevrilip PASS alabilirdi.)
    const canonical = glyphSeries().series.map((item) => item.ar).join('|');
    if (aAr !== canonical) errors.push('"sonra" dizileri doğrulanmış içerikten yeniden türetilen 30 diziyle eşleşmiyor');
    if (bAr !== canonical) errors.push('"önce" dizileri doğrulanmış içerikten yeniden türetilen 30 diziyle eşleşmiyor');
    if (before.glyph.series.length !== 30 || after.glyph.series.length !== 30) errors.push('her iki tarafta 30 dizi olmalı');
    // Ölçek: aynı genişlik, aynı GERÇEK yakalama ölçeği, aynı tema.
    const bW = before.manifest.viewport.width; const aW = after.manifest.viewport.width;
    if (bW !== aW) errors.push(`genişlik farklı: ${bW} ≠ ${aW}`);
    // Yakalama ölçeği beyandan değil GÖRÜNTÜNÜN piksel boyutundan okunur (F5).
    if (before.info.width / bW !== after.info.width / aW) {
      errors.push(`gerçek yakalama ölçeği farklı: ${(before.info.width / bW).toFixed(3)}× ≠ ${(after.info.width / aW).toFixed(3)}×`);
    }
    // Tema farkı: açık "önce" ile koyu "sonra" bir font regresyonu karşılaştırması değildir (F7).
    // Karşılaştırma DİSKTEKİ log.txt değerleriyle yapılır (F10-2), manifest etiketleriyle değil.
    if (before.loggedTheme !== after.loggedTheme) {
      errors.push(`tema farklı: önce log.txt '${before.loggedTheme}', sonra '${after.loggedTheme}' — aynı temada çekilmeli`);
    }
    if (before.manifest.theme !== before.loggedTheme || after.manifest.theme !== after.loggedTheme) {
      errors.push(`manifest teması diskteki log.txt temasıyla çelişiyor (önce '${before.manifest.theme}'/'${before.loggedTheme}', sonra '${after.manifest.theme}'/'${after.loggedTheme}')`);
    }
    // "SONRA" GERÇEKTEN FONTLU BİR BUILD OLMALI (F10-3): aksi hâlde önce/sonra karşılaştırması
    // font regresyonu değil, iki fontsuz çekim olur. Font kanıtı log.txt'ten çapalanmıştır.
    // `distinct` TEK BAŞINA yükleme kanıtı DEĞİLDİR: font-face hiç yokken bile "Arapça
    // fallback ≠ monospace" olduğu için true çıkar (referans koşumda tam olarak böyle).
    // Bu yüzden yükleme, `faces[].status==='loaded'` ve `requests` üzerinden ölçülür.
    const loadedFaces = (side) => (Array.isArray(side.glyph.font && side.glyph.font.faces)
      ? side.glyph.font.faces.filter((face) => face && face.status === 'loaded').length : 0);
    const fontRequests = (side) => (Array.isArray(side.glyph.font && side.glyph.font.requests)
      ? side.glyph.font.requests.length : 0);
    if (loadedFaces(after) === 0) {
      errors.push('"sonra" koşumunda hiçbir font-face yüklenmemiş — font yükleme kanıtı yok');
    }
    if (fontRequests(after) === 0) {
      errors.push('"sonra" koşumunda hiçbir woff2 isteği gözlenmemiş — gerçek font indirmesi kanıtlanamaz');
    }
    if (!after.glyph.font || after.glyph.font.check !== true || after.glyph.font.distinct !== true) {
      errors.push('"sonra" koşumunda font metrik ölçümü eksik (check/distinct) — font yükleme kanıtı yok');
    }
    if (loadedFaces(before) !== 0) {
      errors.push(`"önce" koşumunda ${loadedFaces(before)} font-face yüklenmiş — referans fontsuz build olmalı`);
    }
    if (fontRequests(before) !== 0) {
      errors.push(`"önce" koşumunda ${fontRequests(before)} woff2 isteği var — referans fontsuz build olmalı`);
    }
    // ÖNCE/SONRA GERÇEKTEN FARKLI BUILD: tek bayt oynaması "gerçek farklı build" kanıtı değildir
    // (F10-3). Font ölçümü (withFont/withFallback) iki tarafta gerçekten ayrışmalı.
    const bm = before.glyph.font && before.glyph.font.withFont;
    const bf = before.glyph.font && before.glyph.font.withFallback;
    const am = after.glyph.font && after.glyph.font.withFont;
    const af = after.glyph.font && after.glyph.font.withFallback;
    if (![bm, bf, am, af].every((value) => typeof value === 'number' && value > 0)) {
      errors.push('font ölçüm değerleri (withFont/withFallback) eksik — önce/sonra ayrımı kanıtlanamaz');
    } else {
      const bRatio = bm / bf; const aRatio = am / af;
      if (Math.abs(aRatio - bRatio) < 0.005) {
        errors.push(`font metrik oranı neredeyse aynı (önce ${bRatio.toFixed(4)}, sonra ${aRatio.toFixed(4)}) — gerçek farklı build kanıtı değil`);
      }
    }
    if (before.glyph.sheet.maxH !== after.glyph.sheet.maxH) errors.push(`glif satır yüksekliği farklı: ${before.glyph.sheet.maxH} ≠ ${after.glyph.sheet.maxH}`);
    // ÖNEMLİ: "önce" gerçekten farklı bir build olmalı — aynı görüntüyü iki kez çekmek yasak.
    // Karşılaştırma DİSKTEN HESAPLANAN hash'lerle yapılır (F1).
    if (before.actualSha === after.actualSha) {
      errors.push('önce ve sonra görüntüleri BİREBİR AYNI — bu iki kez çekimdir, önce/sonra kanıtı değildir');
    }
    if (!before.glyph.reference) errors.push('"önce" koşumu glif-referans modunda değil');
    if (after.glyph.reference) errors.push('"sonra" koşumu glif-referans modunda olmamalı');
    if (errors.length) { errors.forEach((error) => console.error(`HATA ${error}`)); process.exit(1); }
    console.log(`PASS  önce/sonra: ${after.glyph.seriesCount} dizi aynı sırada, ${aW}px, ${(after.info.width / aW).toFixed(2)}× (ölçüldü), ${after.manifest.theme} tema, satır ${after.glyph.sheet.maxH}px, görüntüler farklı (${before.actualSha.slice(0, 12)}… ≠ ${after.actualSha.slice(0, 12)}…)`);
    process.exit(0);
  }
  console.error('Kullanım: --glif-liste | --dogrula <dizin> | --kapsam <dizin...> | --glif-karsilastir <once> <sonra> | --negatif-test');
  process.exit(2);
}
