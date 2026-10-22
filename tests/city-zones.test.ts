import {z} from 'zod';
import {describe,it,expect} from 'vitest';
import {CITY_ZONES,CITY_ZONE_BY_ID,type CityZoneId} from '../src/data/city-zones';
import {BUILDINGS} from '../src/data/city';
import {cityCommandShapes} from '../src/domain/city';
import {applyCommand,initialSave,decodeSave,saveSchema,type Save,type Command} from '../src/domain/game';

const now=new Date('2026-10-22T12:00:00Z');let sequence=0;
const run=(save:Save,command:Command,id=`zone-${sequence++}`)=>applyCommand(save,command,now,()=>0,id,save.revision);
const founded=()=>run(initialSave(now,'landmarks'),{type:'city-start'});

describe('fixed city landmark endings',()=>{
 it('loads an older city with no landmark field without changing its plots or rewards',()=>{
  const before=founded(),old=JSON.parse(JSON.stringify(before));delete old.city.zoneEndings;
  const next=decodeSave(old,now);
  expect(next.city!.zoneEndings).toEqual({});expect(next.city!.plots).toEqual(before.city!.plots);
  expect(next.packBalance).toBe(before.packBalance);expect(next.city!.influence).toBe(before.city!.influence);
  expect(next.awardedRewardIds).toEqual(before.awardedRewardIds);
  expect(next.city!.plots).toHaveLength(12);expect(BUILDINGS).toHaveLength(6);
 });

 it('persists each landmark choice with its authored reward and never rewards a retry or changed ending twice',()=>{
  for(const zone of CITY_ZONES)for(const choice of [0,1,2] as const){
   const before=founded(),id=`once-${sequence++}`,command:Command={type:'city-zone-choice',zoneId:zone.id,choice};
   const save=run(before,command,id),reward=CITY_ZONE_BY_ID[zone.id].choices[choice].reward;
   expect(save.city!.zoneEndings[zone.id]).toBe(choice);
   expect(save.packBalance-before.packBalance).toBe(reward.packs||0);
   expect(save.city!.influence-before.city!.influence).toBe(reward.influence||0);
   expect(save.career.scrap-before.career.scrap).toBe(reward.scrap||0);
   expect(save.awardedRewardIds.filter(marker=>marker===`city-zone:${zone.id}`)).toHaveLength(1);
   expect(applyCommand(save,command,now,()=>0,id,before.revision)).toBe(save);
   expect(()=>run(save,{...command,choice:choice===0?1:0})).toThrow('already saved');
   expect(decodeSave(JSON.parse(JSON.stringify(save)),now)).toEqual(save);
  }
 });

 it('rejects invalid landmarks, choices and broken reward receipts, and ignores client-supplied rewards',()=>{
  const commands=z.discriminatedUnion('type',[...cityCommandShapes]);
  expect(()=>run(initialSave(now,'unfounded'),{type:'city-zone-choice',zoneId:'kfc',choice:0})).toThrow('Found');
  for(const zoneId of ['constructor','__proto__','fake-landmark']){
   expect(commands.safeParse({type:'city-zone-choice',zoneId,choice:0}).success).toBe(false);
   expect(()=>run(founded(),{type:'city-zone-choice',zoneId:zoneId as CityZoneId,choice:0})).toThrow('four city landmarks');
  }
  expect(commands.safeParse({type:'city-zone-choice',zoneId:'kfc',choice:3}).success).toBe(false);
  expect(()=>run(founded(),{type:'city-zone-choice',zoneId:'kfc',choice:7 as 0})).toThrow('three landmark endings');
  const before=founded(),parsed=commands.parse({type:'city-zone-choice',zoneId:'kfc',choice:2,reward:{packs:999,influence:999999,scrap:999999}});
  const save=run(before,parsed);expect(save.packBalance).toBe(before.packBalance);expect(save.career.scrap-before.career.scrap).toBe(8);
  const missing=structuredClone(save);missing.awardedRewardIds=missing.awardedRewardIds.filter(marker=>marker!=='city-zone:kfc');
  expect(saveSchema.safeParse(missing).success).toBe(false);
  const phantom=founded();phantom.awardedRewardIds.push('city-zone:kfc');expect(saveSchema.safeParse(phantom).success).toBe(false);
  const wrongChoice=structuredClone(save);wrongChoice.city!.zoneEndings.kfc=4 as 0;expect(saveSchema.safeParse(wrongChoice).success).toBe(false);
 });
});
