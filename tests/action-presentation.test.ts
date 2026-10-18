import {describe,it,expect} from 'vitest';
import {createMatch,takeTurn,LOANERS} from '../src/domain/battle';
import {CinematicClock,cinematicDuration,cinematicImpactAt} from '../src/domain/cinematic';
import {actionTiming} from '../src/domain/action-presentation';
import {liveSceneAssets,specialOutcome} from '../src/components/live-scene-painter';
import {previewSpecial} from '../src/domain/cinematic';
import {CARDS} from '../src/data/cards';
import {existsSync} from 'node:fs';

describe('live ordinary-action presentation',()=>{
 it('holds the previous health until contact, then presents the committed result once',()=>{
  const before=createMatch('contact','street',LOANERS,{version:2}),after=takeTurn(before,'player',{type:'attack'}),saved=JSON.stringify(after);
  const clock=new CinematicClock('full',false,actionTiming('attack'));let display=before,impacts=0;
  while(clock.elapsed<actionTiming('attack').impact-20){const next=clock.tick(20);if(next.emitImpact){display=after;impacts++;}}
  expect(display.enemy[0].hp).toBe(before.enemy[0].hp);
  for(let i=0;i<100;i++){const next=clock.tick(20);if(next.emitImpact){display=after;impacts++;}}
  expect(impacts).toBe(1);expect(display).toBe(after);expect(JSON.stringify(after)).toBe(saved);
 });
 it('freezes an ordinary action while a dialog or hidden tab pauses it',()=>{const clock=new CinematicClock('full',false,actionTiming('attack'));clock.tick(70);for(let i=0;i<50;i++)clock.tick(80,true);expect(clock.elapsed).toBe(70);expect(clock.skip()).toMatchObject({emitImpact:true,emitComplete:true});expect(clock.skip()).toMatchObject({emitImpact:false,emitComplete:false});});
 it('shortens guard, switch and attacks while keeping contact at the same fraction',()=>{for(const kind of ['guard','switch','attack'] as const){const timing=actionTiming(kind);expect(cinematicDuration('quick',false,timing)).toBeLessThan(cinematicDuration('full',false,timing));expect(Math.abs(cinematicImpactAt('quick',false,timing)/timing.short-timing.impact/timing.full)).toBeLessThan(.002);expect(cinematicDuration('full',true,timing)).toBe(0);expect(cinematicDuration('off',false,timing)).toBe(0);}});
 it('keeps support and combined damage/healing result text faithful to actual values',()=>{const p=previewSpecial('CC008');expect(specialOutcome({...p,heal:24})).toBe('+24 RESTORED');expect(specialOutcome({...p,damage:17,heal:8})).toBe('−17 COMPOSURE / +8 RESTORED');});
 it('has loadable visual assets for every playable resident, including their target',()=>{for(const card of CARDS){for(const url of liveSceneAssets({kind:'special',playback:previewSpecial(card.id),progress:0,reduced:false}))expect(existsSync(`public${url}`),url).toBe(true);}});
});
