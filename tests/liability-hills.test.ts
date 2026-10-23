import {z} from 'zod';
import {describe,it,expect} from 'vitest';
import {cityCommandShapes} from '../src/domain/city';
import {applyCommand,initialSave,decodeSave,saveSchema,type Save,type Command} from '../src/domain/game';

const now=new Date('2026-10-23T12:00:00Z');let sequence=0;
const run=(save:Save,command:Command,id=`harbour-${sequence++}`)=>applyCommand(save,command,now,()=>0,id,save.revision);
const founded=()=>run(initialSave(now,'harbour-player'),{type:'city-start'});
const investigated=()=>run(run(founded(),{type:'city-harbour-clue',clueId:'invoice'}),{type:'city-harbour-clue',clueId:'guest-list'});

describe('the Liability Hills charity gala',()=>{
 it('preserves all three pre-investigation yacht endings, balances and reward markers',()=>{
  for(const choice of [0,1,2] as const){
   // This is the shape of a legitimate save produced before harbour clues existed.
   const before=founded();before.city!.zoneEndings['yacht-club']=choice;
   before.awardedRewardIds.push('city-zone:yacht-club');
   if(choice===0)before.packBalance+=1;
   if(choice===1)before.city!.influence+=30;
   if(choice===2)before.career.scrap+=8;
   const old=JSON.parse(JSON.stringify(before));delete old.city.harbourClues;
   const restored=decodeSave(old,now);
   expect(restored.city!.harbourClues).toEqual([]);
   expect(restored).toEqual(before);
   expect(()=>run(restored,{type:'city-zone-choice',zoneId:'yacht-club',choice:choice===0?1:0})).toThrow('already saved');
  }
 });

 it('requires a founded City and accepts only the invoice and guest-list commands',()=>{
  const commands=z.discriminatedUnion('type',[...cityCommandShapes]);
  expect(()=>run(initialSave(now,'not-founded'),{type:'city-harbour-clue',clueId:'invoice'})).toThrow('Found');
  for(const clueId of ['fake','receipt','constructor','__proto__']){
   expect(commands.safeParse({type:'city-harbour-clue',clueId}).success).toBe(false);
   expect(()=>run(founded(),{type:'city-harbour-clue',clueId:clueId as 'invoice'})).toThrow('harbour invoice');
  }
 });

 it('saves either clue order idempotently without changing money, rewards or the Cloutside investigation',()=>{
  for(const order of [['invoice','guest-list'],['guest-list','invoice']] as const){
   const before=run(founded(),{type:'city-corner-clue',clueId:'receipt'});let save=before;
   for(const clueId of order){save=run(save,{type:'city-harbour-clue',clueId});save=run(save,{type:'city-harbour-clue',clueId});}
   expect(save.city!.harbourClues).toEqual([...order]);
   expect(save.city!.cornerClues).toEqual(['receipt']);
   expect(save.packBalance).toBe(before.packBalance);
   expect(save.city!.influence).toBe(before.city!.influence);
   expect(save.career.scrap).toBe(before.career.scrap);
   expect(save.awardedRewardIds).toEqual(before.awardedRewardIds);
   expect(decodeSave(JSON.parse(JSON.stringify(save)),now)).toEqual(save);
  }
 });

 it('requires both harbour clues for new yacht resolutions without gating the other venues',()=>{
  for(const clueId of [null,'invoice','guest-list'] as const){
   const before=founded(),save=clueId?run(before,{type:'city-harbour-clue',clueId}):before;
   for(const choice of [0,1,2] as const)expect(()=>run(save,{type:'city-zone-choice',zoneId:'yacht-club',choice})).toThrow('invoice in the harbour office');
   expect(save.city!.zoneEndings).toEqual({});
   expect(run(save,{type:'city-zone-choice',zoneId:'oil-manor',choice:1}).city!.influence-save.city!.influence).toBe(30);
  }
 });

 it('keeps the existing yacht rewards exact and grants only one saved ending',()=>{
  for(const choice of [0,1,2] as const){
   const before=investigated(),id=`ending-${sequence++}`,command:Command={type:'city-zone-choice',zoneId:'yacht-club',choice};
   const save=run(before,command,id);
   expect(save.city!.zoneEndings['yacht-club']).toBe(choice);
   expect(save.packBalance-before.packBalance).toBe(choice===0?1:0);
   expect(save.city!.influence-before.city!.influence).toBe(choice===1?30:0);
   expect(save.career.scrap-before.career.scrap).toBe(choice===2?8:0);
   expect(save.awardedRewardIds.filter(marker=>marker==='city-zone:yacht-club')).toHaveLength(1);
   expect(applyCommand(save,command,now,()=>0,id,before.revision)).toBe(save);
   expect(()=>run(save,{...command,choice:choice===0?1:0})).toThrow('already saved');
   expect(decodeSave(JSON.parse(JSON.stringify(save)),now)).toEqual(save);
  }
 });

 it('rejects duplicate/unknown clues and fabricated reward markers while ignoring client-supplied rewards',()=>{
  const duplicate=founded();duplicate.city!.harbourClues=['invoice','invoice'];expect(saveSchema.safeParse(duplicate).success).toBe(false);
  const unknown=founded();unknown.city!.harbourClues=['forged' as 'invoice'];expect(saveSchema.safeParse(unknown).success).toBe(false);
  const phantom=investigated();phantom.awardedRewardIds.push('city-zone:yacht-club');expect(saveSchema.safeParse(phantom).success).toBe(false);
  const completed=run(investigated(),{type:'city-zone-choice',zoneId:'yacht-club',choice:0});
  const missing=structuredClone(completed);missing.awardedRewardIds=missing.awardedRewardIds.filter(marker=>marker!=='city-zone:yacht-club');expect(saveSchema.safeParse(missing).success).toBe(false);
  const commands=z.discriminatedUnion('type',[...cityCommandShapes]);
  const parsed=commands.parse({type:'city-zone-choice',zoneId:'yacht-club',choice:2,reward:{packs:99,scrap:999,influence:999}});
  const before=investigated(),save=run(before,parsed);
  expect(save.career.scrap-before.career.scrap).toBe(8);expect(save.packBalance).toBe(before.packBalance);expect(save.city!.influence).toBe(before.city!.influence);
 });
});
