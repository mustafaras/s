#!/usr/bin/env node
// KAO2 anti-amnezi senkron denetimi: KAO2-STATE.json, .anti-amnesia/CURRENT-STATE.md
// ve .anti-amnesia/LEDGER.md birbiriyle tutarlı mı? Salt okur; ağ, tarayıcı, depo yok.
// Çıkış: 0 = uyumlu, 1 = uyumsuz (hatalar listelenir).
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLAN_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = resolve(PLAN_DIR, '..');
const CARD_COUNT = 28;
const CARD_STATUSES = ['todo', 'in_progress', 'done', 'blocked'];
const PROGRAM_STATUSES = ['planning', 'active', 'blocked', 'completed'];
const LEDGER_HEAD = /^## seq (\d+) · (\d{4}-\d{2}-\d{2}) · ([A-Z-]+) · (\S+)\s*$/;

const errors = [];
const fail = (message) => errors.push(message);

function readText(relative) {
  const full = join(PLAN_DIR, relative);
  if (!existsSync(full)) { fail(`eksik dosya: kuran-ogreniyorum-v2/${relative}`); return ''; }
  return readFileSync(full, 'utf8');
}

function parseState() {
  const raw = readText('KAO2-STATE.json');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (error) { fail(`KAO2-STATE.json JSON değil: ${error.message}`); return null; }
}

function expectedCardIds() {
  return Array.from({ length: CARD_COUNT }, (_unused, index) => `KAO2-${String(index).padStart(2, '0')}`);
}

function checkState(state) {
  if (state.program !== 'KAO2') fail(`program "KAO2" değil: ${state.program}`);
  if (!PROGRAM_STATUSES.includes(state.status)) fail(`geçersiz program durumu: ${state.status}`);
  const ids = expectedCardIds();
  const cards = state.cards || {};
  const cardIds = Object.keys(cards);
  if (cardIds.join(',') !== ids.join(',')) fail(`kart listesi KAO2-00…KAO2-27 sırasıyla birebir olmalı (bulunan ${cardIds.length})`);
  Object.entries(state.decisions || {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') fail(`karar boş: decisions.${key}`);
  });
  let inProgress = 0;
  ids.forEach((id) => {
    const card = cards[id];
    if (!card) return;
    if (!CARD_STATUSES.includes(card.status)) fail(`${id}: geçersiz durum ${card.status}`);
    if (card.status === 'in_progress') inProgress += 1;
    if (card.status === 'done') {
      if (!card.evidence) fail(`${id}: done ama evidence yolu yok`);
      else if (!existsSync(join(REPO_ROOT, card.evidence))) fail(`${id}: evidence dosyası yok: ${card.evidence}`);
    }
  });
  if (inProgress > 1) fail(`aynı anda birden çok in_progress kart var (${inProgress})`);
  const firstOpen = ids.find((id) => cards[id] && cards[id].status !== 'done') || null;
  if (state.nextCard !== firstOpen) fail(`nextCard ${state.nextCard} olmalı: ${firstOpen} (ilk tamamlanmamış kart)`);
  if (firstOpen === null && state.status !== 'completed') fail('tüm kartlar done ama program durumu completed değil');
  if (firstOpen !== null) {
    ids.slice(ids.indexOf(firstOpen) + 1).forEach((id) => {
      if (cards[id] && cards[id].status === 'done') fail(`${id} sıra dışı done: ${firstOpen} henüz tamamlanmadı`);
    });
  }
}

function parseLedger() {
  const text = readText('.anti-amnesia/LEDGER.md');
  const entries = [];
  let current = null;
  text.split('\n').forEach((line) => {
    const head = LEDGER_HEAD.exec(line);
    if (head) {
      current = { seq: Number(head[1]), date: head[2], type: head[3], card: head[4], body: [] };
      entries.push(current);
    } else if (current) current.body.push(line);
  });
  return entries;
}

function checkLedger(state, entries) {
  if (!entries.length) { fail('LEDGER boş'); return; }
  entries.forEach((entry, index) => {
    if (entry.seq !== index + 1) fail(`LEDGER seq ${entry.seq} beklenen ${index + 1} (ardışık olmalı, silme/araya ekleme yok)`);
    if (index && entry.date < entries[index - 1].date) fail(`LEDGER seq ${entry.seq} tarihi geriye gidiyor`);
    const body = entry.body.join('\n');
    if (!/^- status: /m.test(body)) fail(`LEDGER seq ${entry.seq}: "- status:" satırı yok`);
    if (!/^- next: /m.test(body)) fail(`LEDGER seq ${entry.seq}: "- next:" satırı yok`);
  });
  const last = entries[entries.length - 1];
  if (state.ledgerLastSeq !== last.seq) fail(`STATE.ledgerLastSeq ${state.ledgerLastSeq} ≠ LEDGER son seq ${last.seq}`);
  const nextLine = /^- next: (\S+)/m.exec(last.body.join('\n'));
  const nextValue = nextLine ? nextLine[1] : null;
  const expectedNext = state.nextCard === null ? 'none' : state.nextCard;
  if (nextValue !== expectedNext) fail(`LEDGER son kaydın next değeri ${nextValue}, STATE.nextCard ${expectedNext}`);
  expectedCardIds().forEach((id) => {
    const card = (state.cards || {})[id];
    if (!card || card.status !== 'done') return;
    const closed = entries.some((entry) => entry.type === 'CARD' && entry.card === id && /^- status: done/m.test(entry.body.join('\n')));
    if (!closed) fail(`${id} STATE'te done ama LEDGER'da "CARD · ${id}" + "status: done" kaydı yok`);
  });
}

function checkCurrentState(state) {
  const text = readText('.anti-amnesia/CURRENT-STATE.md');
  const block = /<!-- kao2-sync\n([\s\S]*?)-->/.exec(text);
  if (!block) { fail('CURRENT-STATE.md içinde <!-- kao2-sync … --> bloğu yok'); return; }
  const fields = Object.fromEntries(block[1].split('\n').map((line) => line.split(': ')).filter((pair) => pair.length === 2).map(([key, value]) => [key.trim(), value.trim()]));
  const expected = { nextCard: state.nextCard === null ? 'none' : state.nextCard, lastSeq: String(state.ledgerLastSeq), status: state.status };
  Object.entries(expected).forEach(([key, value]) => {
    if (fields[key] !== value) fail(`CURRENT-STATE ${key}=${fields[key]} ≠ beklenen ${value}`);
  });
}

const state = parseState();
if (state) {
  checkState(state);
  checkLedger(state, parseLedger());
  checkCurrentState(state);
}

if (errors.length) {
  console.error(`KAO2 senkron: FAIL (${errors.length})`);
  errors.forEach((message) => console.error(`  ✗ ${message}`));
  process.exit(1);
}
const done = Object.values(state.cards).filter((card) => card.status === 'done').length;
console.log(`KAO2 senkron: PASS · ${done}/${CARD_COUNT} kart done · nextCard ${state.nextCard} · ledger seq ${state.ledgerLastSeq}`);
