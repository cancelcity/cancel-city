import {describe,expect,it} from 'vitest';
import {CARDS} from '../src/data/cards';
import {CITY_EVENTS} from '../src/data/city-events';
import {applyCommand,initialSave,type Save,type Command} from '../src/domain/game';
import {levelForXp,levelProgress,missionsFor} from '../src/domain/progression';
import {cityProduction,cityUpgradePreview,nextStreetBeef} from '../src/domain/city';

const now=new Date('2026-10-22T12:00:00Z');
let sequence=0;
const command=(save:Save,value:Command)=>applyCommand(save,value,now,()=>0,`world-${sequence++}`,save.revision);

describe('world progression and city consistency',()=>{
 it('uses the displayed level scale for rewards while preserving earlier claimed rewards',()=>{
  let save=initialSave(now,'level');save.totalXp=400;
  expect(levelProgress(save.totalXp)).toEqual({level:1,current:400,required:1000,percent:40});
  expect(()=>command(save,{type:'claim-mission',missionId:'level-five'})).toThrow('Finish this job');
  save.totalXp=3999;expect(levelForXp(save.totalXp)).toBe(4);
  save.totalXp=4000;expect(levelProgress(save.totalXp)).toEqual({level:5,current:0,required:1000,percent:0});
  const rewarded=command(save,{type:'claim-mission',missionId:'level-five'});
  expect(rewarded.packBalance).toBe(save.packBalance+2);
  const earlier=initialSave(now,'earlier');earlier.totalXp=400;earlier.awardedRewardIds.push('job:level-five:once');
  expect(missionsFor(earlier,now).find(job=>job.id==='level-five')?.claimed).toBe(true);
  expect(()=>command(earlier,{type:'claim-mission',missionId:'level-five'})).toThrow('already collected');
 });

 it('counts newly crafted residents toward the weekly discovery reward exactly once',()=>{
  let save=initialSave(now,'craft');save.career.scrap=200;
  const cards=CARDS.filter(card=>card.rarity==='nobody').slice(0,5);
  for(const card of cards)save=command(save,{type:'craft',cardId:card.id});
  expect(save.activity.weeklyDiscoveries).toBe(5);
  save=command(save,{type:'craft',cardId:cards[0].id});
  expect(save.activity.weeklyDiscoveries).toBe(5);
  expect(missionsFor(save,now).find(job=>job.id==='weekly-discover')?.progress).toBe(5);
  const rewarded=command(save,{type:'claim-mission',missionId:'weekly-discover'});
  expect(rewarded.packBalance).toBe(save.packBalance+3);
 });

 it('advances through every Street Beef without waiting for its atmosphere to expire',()=>{
  let save=command(initialSave(now,'beef'),{type:'city-start'});
  // A directory-selected unfinished event must remain available to settle, even if it is not first.
  save=command(save,{type:'city-event-start',eventId:'EV07'});
  expect(nextStreetBeef(save.city)?.id).toBe('EV07');
  const seen=new Set<string>();
  for(let i=0;i<CITY_EVENTS.length;i++){
   const event=nextStreetBeef(save.city)!;expect(event).not.toBeNull();expect(seen.has(event.id)).toBe(false);
   seen.add(event.id);
   if(save.city!.activeEvent?.eventId!==event.id)save=command(save,{type:'city-event-start',eventId:event.id});
   save=command(save,{type:'city-event-choice',eventId:event.id,choice:0});
   expect(Date.parse(save.city!.activeEvent!.endsAt)).toBeGreaterThan(now.getTime());
  }
  expect(seen.size).toBe(CITY_EVENTS.length);expect(nextStreetBeef(save.city)).toBeNull();
  expect(save.packBalance).toBe(3+CITY_EVENTS.length);
 });

 it('previews actual collectible upgrade income below and at the city cap without mutating it',()=>{
  let save=command(initialSave(now,'upgrade'),{type:'city-start'});
  expect(cityUpgradePreview(save.city!,0)).toMatchObject({level:2,cost:120,incomeBefore:50,incomeAfter:60,incomeGain:10,capped:false});
  expect(save.city!.plots[0]!.level).toBe(1);
  save.city!.influence=10000;
  for(let i=1;i<4;i++){
   const id=`CC00${i+1}`;save.inventory[id]={regular:1,foil:0};save.discoveredCardIds.push(id);
   save=command(save,{type:'city-build',plot:i,kind:'feed'});
   save=command(save,{type:'city-assign',plot:i,residentId:id});
  }
  expect(cityProduction(save.city!)).toBe(160);
  expect(cityUpgradePreview(save.city!,0)).toMatchObject({buildingBefore:50,buildingAfter:60,incomeBefore:160,incomeAfter:160,incomeGain:0,capped:true});
  save=command(save,{type:'city-upgrade',plot:0});
  expect(cityProduction(save.city!)).toBe(160);expect(save.city!.plots[0]!.level).toBe(2);
 });
});
