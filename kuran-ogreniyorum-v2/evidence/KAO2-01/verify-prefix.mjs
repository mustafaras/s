import assert from 'node:assert/strict';
import fs from 'node:fs';
import { check, commitCounts } from '../../../docs/kuran-ogreniyorum/tools/kao-plan-check.mjs';
const state=JSON.parse(fs.readFileSync(new URL('../../../docs/kuran-ogreniyorum/KAO-STATE.json',import.meta.url)));
function rejected(subject){
 const result=check(state,{commits:[{hash:'fixture123',subject,afterBase:true,files:['tests/kao/test_example.js']}]});
 return result.fails.some(s=>s.includes('tanınmayan önek'));
}
for(let n=0;n<28;n++){
 const id='KAO2-'+String(n).padStart(2,'0');
 for(const suffix of [': tamam',': BLOCKED — neden']) assert.equal(rejected(id+suffix),false,id+suffix);
 assert.deepEqual(commitCounts([{subject:id+': tamam'}]),{[id]:1});
}
for(const subject of ['KAO2-28: x','KAO2-99: x','KAO2-001: x','KAO2-1: x','KAO2-00x: x','KAO2-00 x','feat: x']) assert.equal(rejected(subject),true,subject);
for(const subject of ['KAO2-28: x','KAO2-99: x','KAO2-001: x','KAO2-1: x','KAO2-00x: x']) assert.deepEqual(commitCounts([{subject}]),{});
for(const subject of ['KAO-01: x','KAO-FIX-17: x','KAO-ARSIV: x']) assert.equal(rejected(subject),false,subject);
console.log('KAO2 prefix: PASS (28 valid cards; BLOCKED; counts; malformed/unknown rejected; legacy preserved)');
