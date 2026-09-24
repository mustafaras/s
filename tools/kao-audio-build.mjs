#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const BUDGET_BYTES = 16 * 1024 * 1024;
const CONCURRENCY = 8;

function fail(message, code = 1) {
  const error = new Error(message);
  error.exitCode = code;
  throw error;
}

function parseArgs(argv) {
  const args = { manifest: 'kuran-ogreniyorum/content/audio-manifest.json' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--self-test') args.selfTest = true;
    else if (arg === '--source' || arg === '--out' || arg === '--manifest') {
      if (!argv[i + 1]) fail(`${arg} için değer gerekli`);
      args[arg.slice(2)] = argv[++i];
    } else fail(`Bilinmeyen argüman: ${arg}`);
  }
  return args;
}

function run(command, args, options = {}) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'], ...options });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', chunk => { stdout += chunk; });
    child.stderr?.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolveRun({ stdout, stderr });
      else reject(Object.assign(new Error(`${command} exit ${code}: ${stderr.trim()}`), { exitCode: code }));
    });
  });
}

async function requireFfmpeg() {
  try {
    await run('ffmpeg', ['-version']);
    await run('ffprobe', ['-version']);
  } catch {
    fail('ffmpeg/ffprobe bulunamadı. macOS: brew install ffmpeg; Debian/Ubuntu: sudo apt install ffmpeg', 2);
  }
}

function validateIndex(index) {
  if (index?.schemaVersion !== 1 || !Array.isArray(index.sources) || !Array.isArray(index.outputs)) {
    fail('source/index.json schemaVersion=1, sources[] ve outputs[] içermeli');
  }
  const sourceKeys = new Set();
  for (const source of index.sources) {
    if (!source.key || sourceKeys.has(source.key)) fail(`Geçersiz/yinelenen source key: ${source.key}`);
    sourceKeys.add(source.key);
    if (!source.audio || !source.sourceDataset || !source.sourceUrl || !source.license || !source.readerName) {
      fail(`Eksik köken/lisans alanı: ${source.key}`);
    }
  }
  const outputIds = new Set();
  for (const output of index.outputs) {
    if (!output.id || outputIds.has(output.id)) fail(`Geçersiz/yinelenen output id: ${output.id}`);
    outputIds.add(output.id);
    if (output.kind === 'lemma' && !/^w-[A-Za-z0-9_]+-(measured|flowing)$/.test(output.id)) fail(`Lemma adı geçersiz: ${output.id}`);
    if (output.kind === 'short-surah' && !/^s-\d+-\d+-\d+$/.test(output.id)) fail(`Kısa sûre adı geçersiz: ${output.id}`);
    if (output.kind === 'minimal-pair' && !/^p-[A-Za-z0-9_]+$/.test(output.id)) fail(`Minimal çift adı geçersiz: ${output.id}`);
    if (output.kind === 'minimal-pair') {
      if (!Array.isArray(output.parts) || output.parts.length !== 2 || output.parts.some(id => !outputIds.has(id))) {
        fail(`Minimal çift parçaları önce tanımlanmış iki klip olmalı: ${output.id}`);
      }
    } else {
      if (!sourceKeys.has(output.sourceKey)) fail(`Bilinmeyen sourceKey (${output.id}): ${output.sourceKey}`);
      if (!(Number.isFinite(output.start) && Number.isFinite(output.end) && output.start >= 0 && output.end > output.start)) {
        fail(`Geçersiz zaman aralığı: ${output.id}`);
      }
    }
  }
}

async function sha256(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

async function durationMs(path) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', path
  ]);
  const duration = Number(stdout.trim());
  if (!Number.isFinite(duration) || duration <= 0) fail(`Süre okunamadı: ${path}`);
  return Math.round(duration * 1000);
}

async function mapLimit(items, limit, worker) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      await worker(item);
    }
  });
  await Promise.all(workers);
}

function clipSource(output, source) {
  return {
    dataset: source.sourceDataset,
    url: source.sourceUrl,
    license: source.license,
    reader: {
      id: source.reciterId,
      name: source.readerName,
      origin: source.readerOrigin || null
    },
    sourceAudio: source.audioFilename || basename(source.audio),
    recitationStyle: source.recitationStyle || null,
    surah: output.surah,
    ayah: output.ayah,
    word: output.word,
    startMs: Math.round(output.start * 1000),
    endMs: Math.round(output.end * 1000),
    alignment: output.alignment || source.alignment || 'dataset-word-alignment'
  };
}

async function build({ sourceDir, outDir, manifestPath }) {
  const indexPath = join(sourceDir, 'index.json');
  const index = JSON.parse(await readFile(indexPath, 'utf8'));
  validateIndex(index);
  if (existsSync(outDir) && (await readdir(outDir)).length) fail(`Çıktı klasörü boş değil: ${outDir}`);
  await mkdir(outDir, { recursive: true });

  const sources = new Map(index.sources.map(source => [source.key, source]));
  for (const source of index.sources) {
    const audioPath = resolve(sourceDir, source.audio);
    if (!existsSync(audioPath)) fail(`Kaynak ses yok: ${source.audio}`);
    source.absoluteAudio = audioPath;
  }

  const regular = index.outputs.filter(output => output.kind !== 'minimal-pair');
  await mapLimit(regular, CONCURRENCY, async output => {
    const source = sources.get(output.sourceKey);
    const target = join(outDir, `${output.id}.m4a`);
    await run('ffmpeg', [
      '-v', 'error', '-y', '-ss', output.start.toFixed(3), '-to', output.end.toFixed(3),
      '-i', source.absoluteAudio, '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'aac', '-b:a', '32k',
      '-movflags', '+faststart', '-map_metadata', '-1', target
    ]);
  });

  const pairs = index.outputs.filter(output => output.kind === 'minimal-pair');
  await mapLimit(pairs, CONCURRENCY, async output => {
    const [first, second] = output.parts.map(id => join(outDir, `${id}.m4a`));
    const target = join(outDir, `${output.id}.m4a`);
    await run('ffmpeg', [
      '-v', 'error', '-y', '-i', first, '-f', 'lavfi', '-t', '0.25', '-i', 'anullsrc=r=16000:cl=mono',
      '-i', second, '-filter_complex', '[0:a][1:a][2:a]concat=n=3:v=0:a=1[out]', '-map', '[out]',
      '-ac', '1', '-ar', '16000', '-c:a', 'aac', '-b:a', '32k', '-movflags', '+faststart',
      '-map_metadata', '-1', target
    ]);
  });

  const clips = {};
  for (const output of index.outputs) {
    const file = `assets/kao/audio/${output.id}.m4a`;
    const absolute = join(outDir, `${output.id}.m4a`);
    const info = await stat(absolute);
    const base = {
      file,
      kind: output.kind,
      durationMs: await durationMs(absolute),
      bytes: info.size,
      sha256: await sha256(absolute)
    };
    if (output.kind === 'minimal-pair') {
      clips[output.id] = { ...base, pairId: output.pairId, parts: output.parts };
    } else {
      const source = sources.get(output.sourceKey);
      clips[output.id] = {
        ...base,
        ...(output.lemmaId ? { lemmaId: output.lemmaId, style: output.style } : {}),
        source: clipSource(output, source)
      };
    }
  }

  const files = await readdir(outDir);
  if (files.some(file => !file.endsWith('.m4a'))) fail('Çıktı klasöründe .m4a dışı dosya var');
  if (files.length !== Object.keys(clips).length) fail(`Manifest/dosya sayısı farklı: ${Object.keys(clips).length}/${files.length}`);
  const totalBytes = Object.values(clips).reduce((sum, clip) => sum + clip.bytes, 0);
  if (totalBytes > BUDGET_BYTES) fail(`Ses bütçesi aşıldı: ${totalBytes} > ${BUDGET_BYTES}`);

  const counts = Object.values(clips).reduce((acc, clip) => {
    acc.total += 1;
    acc[clip.kind] = (acc[clip.kind] || 0) + 1;
    return acc;
  }, { total: 0 });
  const manifest = {
    schemaVersion: 1,
    version: 'kao-audio-v1',
    generatedBy: 'tools/kao-audio-build.mjs',
    generatedAt: index.generatedAt || new Date().toISOString().slice(0, 10),
    policy: {
      networkDuringBuild: false,
      codec: 'AAC-LC',
      bitrateKbps: 32,
      sampleRateHz: 16000,
      channels: 1,
      preload: 'none',
      quranicTts: false,
      styleLabels: {
        measured: '0,20–4,00 sn kalite penceresindeki adayların 75. yüzdeliğine yakın kayıt; kanonik kıraat sınıfı iddiası değildir.',
        flowing: 'Farklı okuyucudan, aynı kalite penceresindeki adayların 25. yüzdeliğine yakın kayıt; kanonik kıraat sınıfı iddiası değildir.'
      }
    },
    datasets: index.datasets || [],
    selection: index.selection || null,
    counts,
    totalBytes,
    budgetBytes: BUDGET_BYTES,
    budgetMet: true,
    clips
  };
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

async function selfTest() {
  const root = await mkdtemp(join(tmpdir(), 'kao-audio-self-test-'));
  try {
    const sourceDir = join(root, 'source');
    const audioDir = join(sourceDir, 'audio');
    const outDir = join(root, 'out');
    const manifestPath = join(root, 'manifest.json');
    await mkdir(audioDir, { recursive: true });
    for (const [name, frequency] of [['a', '440'], ['b', '660']]) {
      await run('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `sine=frequency=${frequency}:duration=1`, '-ar', '16000', '-ac', '1', join(audioDir, `${name}.wav`)]);
    }
    const sourceBase = {
      sourceDataset: 'self-test', sourceUrl: 'https://example.invalid/self-test', license: 'CC0-1.0', readerName: 'fixture'
    };
    const index = {
      schemaVersion: 1,
      generatedAt: '2000-01-01',
      datasets: [{ id: 'self-test', license: 'CC0-1.0' }],
      sources: [
        { key: 'a', audio: 'audio/a.wav', reciterId: 'a', ...sourceBase },
        { key: 'b', audio: 'audio/b.wav', reciterId: 'b', ...sourceBase }
      ],
      outputs: [
        { id: 'w-l_fixture-measured', kind: 'lemma', lemmaId: 'l_fixture', style: 'measured', sourceKey: 'a', surah: 1, ayah: 1, word: 1, start: 0.1, end: 0.6 },
        { id: 'w-l_fixture-flowing', kind: 'lemma', lemmaId: 'l_fixture', style: 'flowing', sourceKey: 'b', surah: 1, ayah: 1, word: 1, start: 0.2, end: 0.5 },
        { id: 's-95-1-1', kind: 'short-surah', sourceKey: 'a', surah: 95, ayah: 1, word: 1, start: 0, end: 0.4 },
        { id: 'p-mp_fixture', kind: 'minimal-pair', pairId: 'mp_fixture', parts: ['w-l_fixture-measured', 'w-l_fixture-flowing'] }
      ]
    };
    await writeFile(join(sourceDir, 'index.json'), JSON.stringify(index));
    const manifest = await build({ sourceDir, outDir, manifestPath });
    if (manifest.counts.total !== 4 || manifest.counts.lemma !== 2 || manifest.counts['minimal-pair'] !== 1) fail('self-test sayımları yanlış');
    console.log(`kao-audio-build self-test: PASS (${manifest.counts.total} klip, ${manifest.totalBytes} bayt)`);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await requireFfmpeg();
  if (args.selfTest) return selfTest();
  if (!args.source || !args.out) fail('Kullanım: node tools/kao-audio-build.mjs --source <yerel klasör> --out assets/kao/audio [--manifest <yol>]');
  const manifest = await build({
    sourceDir: resolve(args.source),
    outDir: resolve(args.out),
    manifestPath: resolve(args.manifest)
  });
  console.log(`kao-audio-build: PASS (${manifest.counts.total} klip, ${manifest.totalBytes} bayt / ${manifest.budgetBytes})`);
}

main().catch(error => {
  console.error(`kao-audio-build: FAIL — ${error.message}`);
  process.exit(error.exitCode || 1);
});
