import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {CinematicClock,cinematicDuration,previewSpecial} from '../src/domain/cinematic';
import {filmForPlayback} from '../src/data/layered-films';
import {PREMIERE} from '../src/data/premiere';

describe('restored Karen motion-comic playback',()=>{
 it('uses the original shared runtime, with no articulated route override',()=>{
  const source=readFileSync('src/components/special-cinematic.tsx','utf8');
  expect(source).not.toContain("from './karen-cinematic'");
  expect(source).not.toContain('isKarenBenchmark');
  expect(filmForPlayback(previewSpecial('CC026'),'full',false)).toBeUndefined();
  expect(source).toContain('<LiveCanvas scene={{kind:\'special\',playback');
 });
 it('keeps Karen on the restored renderer and original film while promoting the new gallery',()=>{
  const page=readFileSync('src/components/karen-showcase.tsx','utf8');
  expect(page).toContain('<SpecialCinematic');
  expect(page).not.toContain('KarenCinematic');
  expect(page).not.toContain('unlockKarenAudio');
  const invitation=readFileSync('src/components/cinema-showcase.tsx','utf8');
  expect(invitation).not.toContain('/cinema/karen/');
  expect(invitation).toContain('return <Link href="/cinema/specials/"');
  expect(invitation).toContain('<source src={PREMIERE.video}');
  expect(PREMIERE.video).toBe('/assets/cinema/cancel-city-premiere.mp4');
 });
 it('restores original full/quick durations and exactly-once skip semantics',()=>{
  expect(cinematicDuration('full',false)).toBe(4800);
  expect(cinematicDuration('quick',false)).toBe(1200);
  const playback=previewSpecial('CC026'),before=JSON.stringify(playback),clock=new CinematicClock('full',false);
  expect(clock.skip()).toMatchObject({emitImpact:true,emitComplete:true});
  expect(clock.skip()).toMatchObject({emitImpact:false,emitComplete:false});
  expect(JSON.stringify(playback)).toBe(before);
 });
});
