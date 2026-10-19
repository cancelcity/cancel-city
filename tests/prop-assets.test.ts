import {describe,it,expect} from 'vitest';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PROPS} from '../src/data/props';
describe('deployable collectible artwork',()=>{
 it('ships every prop with an unchanged transparent source and a 768px WebP derivative',()=>{
  const manifest=JSON.parse(readFileSync('docs/art/props/asset-processing.json','utf8')) as {records:{id:string;source:string;sourceSha256:string;output:string;bytes:number}[]};
  expect(manifest.records.map(r=>r.id)).toEqual(PROPS.map(p=>p.id));
  for(const p of PROPS){const record=manifest.records.find(r=>r.id===p.id)!,webp=readFileSync(`public${p.art}`);if(existsSync(record.source)){const master=readFileSync(record.source);expect(createHash('sha256').update(master).digest('hex')).toBe(record.sourceSha256);expect(master.subarray(1,4).toString()).toBe('PNG');expect(master[25]).toBe(6);}expect(record.output).toBe(`public${p.art}`);expect(webp.subarray(0,4).toString()).toBe('RIFF');expect(webp.subarray(8,12).toString()).toBe('WEBP');expect(webp.subarray(12,16).toString()).toBe('VP8X');expect(webp.readUIntLE(24,3)+1).toBe(768);expect(webp.readUIntLE(27,3)+1).toBe(768);expect(webp[20]&16).toBe(16);expect(webp.length).toBe(record.bytes);expect(webp.length).toBeLessThan(220000);}
 });
});
