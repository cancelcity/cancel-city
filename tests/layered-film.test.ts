import {describe,expect,it} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import {LAYERED_FILMS,filmForPlayback} from '../src/data/layered-films';
import {PresentationGate} from '../src/domain/presentation-gate';
import {previewSpecial} from '../src/domain/cinematic';
import {CARDS} from '../src/data/cards';

describe('layered special presentation',()=>{
 it('uses full films for normal solo playback and keeps quick, reduced, duo and equipped-prop scenes',()=>{
  const p=previewSpecial('CC010');expect(filmForPlayback(p,'full',false)?.slug).toBe('homelesslander');
  expect(filmForPlayback(p,'quick',false)).toBeUndefined();expect(filmForPlayback(p,'off',false)).toBeUndefined();expect(filmForPlayback(p,'full',true)).toBeUndefined();
  expect(filmForPlayback({...p,duoId:'any'},'full',false)).toBeUndefined();expect(filmForPlayback({...p,propId:'any'},'full',false)).toBeUndefined();
 });
 it('reveals a committed result exactly once across video impact, fallback, skip and completion',()=>{
  let impacts=0,completions=0;const gate=new PresentationGate(),hit=()=>impacts++,done=()=>completions++;
  gate.impact(hit);gate.impact(hit);gate.complete(hit,done);gate.complete(hit,done);gate.impact(hit);expect([impacts,completions]).toEqual([1,1]);
  const skipped=new PresentationGate();skipped.complete(hit,done);skipped.complete(hit,done);expect([impacts,completions]).toEqual([2,2]);
 });
 it('contains six contiguous shots and decoded exact-length media for each released card',()=>{
  for(const film of LAYERED_FILMS){
   expect(CARDS.some(c=>c.id===film.cardId)).toBe(true);expect(film.shots).toHaveLength(6);expect(film.shots[0].start).toBe(0);expect(film.shots.at(-1)?.end).toBe(film.duration);
   for(let i=1;i<film.shots.length;i++)expect(film.shots[i].start).toBe(film.shots[i-1].end);
   expect(film.impact).toBeGreaterThan(film.shots[3].start);expect(film.impact).toBeLessThan(film.shots[3].end);
   for(const url of [film.video,film.poster,film.captions,...film.shots.map(s=>s.thumbnail)])expect(existsSync(`public${url}`),url).toBe(true);
   const report=JSON.parse(readFileSync(`docs/art/layered-specials/${film.slug}/render-report.json`,'utf8'));
   expect(report.verification.decoded).toBe(true);expect(Number(report.probe.format.duration)).toBeCloseTo(film.duration,2);expect(report.frames).toBe(Math.round(film.duration*60));expect(report.drawings).toBeGreaterThanOrEqual(12);expect(report.backgroundStability.every((s:{lockedBackgroundIdentical:boolean})=>s.lockedBackgroundIdentical)).toBe(true);
  }
 });
});
