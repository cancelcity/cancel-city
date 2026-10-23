import {z} from 'zod';
import {describe,it,expect} from 'vitest';
import {cityCommandShapes} from '../src/domain/city';
import {applyCommand,initialSave,decodeSave,saveSchema,type Save,type Command} from '../src/domain/game';

const now=new Date('2026-10-23T12:00:00Z');let sequence=0;
const run=(save:Save,command:Command,id=`corner-${sequence++}`)=>applyCommand(save,command,now,()=>0,id,save.revision);
const founded=()=>run(initialSave(now,'corner-player'),{type:'city-start'});
const investigated=()=>run(run(founded(),{type:'city-corner-clue',clueId:'receipt'}),{type:'city-corner-clue',clueId:'statement'});

describe('the Cloutside loyalty inspection',()=>{
 it('migrates older saves with no clues without touching existing buildings, endings or rewards',()=>{
  const before=run(founded(),{type:'city-zone-choice',zoneId:'kfc',choice:1});
  const old=JSON.parse(JSON.stringify(before));delete old.city.cornerClues;
  const restored=decodeSave(old,now);
  expect(restored.city!.cornerClues).toEqual([]);
  expect(restored).toEqual(before);
 });

 it('requires a founded City and permits only the two authored clues',()=>{
  const commands=z.discriminatedUnion('type',[...cityCommandShapes]);
  expect(()=>run(initialSave(now,'not-founded'),{type:'city-corner-clue',clueId:'receipt'})).toThrow('Found');
  for(const clueId of ['fake','constructor','__proto__']){
   expect(commands.safeParse({type:'city-corner-clue',clueId}).success).toBe(false);
   expect(()=>run(founded(),{type:'city-corner-clue',clueId:clueId as 'receipt'})).toThrow('receipt');
  }
 });

 it('collects clues in either order without spending or awarding anything and safely repeats them',()=>{
  for(const order of [['receipt','statement'],['statement','receipt']] as const){
   const before=founded();let save=before;
   for(const clueId of order){save=run(save,{type:'city-corner-clue',clueId});save=run(save,{type:'city-corner-clue',clueId});}
   expect(save.city!.cornerClues).toEqual([...order]);
   expect(save.packBalance).toBe(before.packBalance);
   expect(save.city!.influence).toBe(before.city!.influence);
   expect(save.career.scrap).toBe(before.career.scrap);
   expect(save.awardedRewardIds).toEqual(before.awardedRewardIds);
   expect(decodeSave(JSON.parse(JSON.stringify(save)),now)).toEqual(save);
  }
 });

 it('blocks all endings until the receipt and statement have both been read',()=>{
  const before=founded();
  for(const clueId of [null,'receipt','statement'] as const){
   const save=clueId?run(before,{type:'city-corner-clue',clueId}):before;
   for(const choice of [0,1,2] as const)expect(()=>run(save,{type:'city-zone-choice',zoneId:'probable-cause',choice})).toThrow('receipt inside');
   expect(save.city!.zoneEndings).toEqual({});expect(save.awardedRewardIds).toEqual(before.awardedRewardIds);
  }
 });

 it('saves one aftermath and its exact reward, never rewarding another ending or a retry',()=>{
  for(const choice of [0,1,2] as const){
   const before=investigated(),id=`ending-${sequence++}`,command:Command={type:'city-zone-choice',zoneId:'probable-cause',choice};
   const save=run(before,command,id);
   expect(save.city!.zoneEndings['probable-cause']).toBe(choice);
   expect(save.packBalance-before.packBalance).toBe(choice===0?1:0);
   expect(save.city!.influence-before.city!.influence).toBe(choice===1?25:0);
   expect(save.career.scrap-before.career.scrap).toBe(choice===2?8:0);
   expect(save.awardedRewardIds.filter(marker=>marker==='city-zone:probable-cause')).toHaveLength(1);
   expect(applyCommand(save,command,now,()=>0,id,before.revision)).toBe(save);
   expect(()=>run(save,{...command,choice:choice===0?1:0})).toThrow('already saved');
   expect(decodeSave(JSON.parse(JSON.stringify(save)),now)).toEqual(save);
  }
 });

 it('rejects duplicate/unknown clues and fabricated or incomplete ending receipts',()=>{
  const duplicate=founded();duplicate.city!.cornerClues=['receipt','receipt'];expect(saveSchema.safeParse(duplicate).success).toBe(false);
  const unknown=founded();unknown.city!.cornerClues=['forged' as 'receipt'];expect(saveSchema.safeParse(unknown).success).toBe(false);
  const phantom=investigated();phantom.awardedRewardIds.push('city-zone:probable-cause');expect(saveSchema.safeParse(phantom).success).toBe(false);
  const completed=run(investigated(),{type:'city-zone-choice',zoneId:'probable-cause',choice:0});
  const missing=structuredClone(completed);missing.awardedRewardIds=missing.awardedRewardIds.filter(marker=>marker!=='city-zone:probable-cause');expect(saveSchema.safeParse(missing).success).toBe(false);
  const incomplete=structuredClone(completed);incomplete.city!.cornerClues=['receipt'];expect(saveSchema.safeParse(incomplete).success).toBe(false);
  const commands=z.discriminatedUnion('type',[...cityCommandShapes]);
  const parsed=commands.parse({type:'city-zone-choice',zoneId:'probable-cause',choice:2,reward:{packs:99,scrap:999,influence:999}});
  const before=investigated(),save=run(before,parsed);
  expect(save.career.scrap-before.career.scrap).toBe(8);expect(save.packBalance).toBe(before.packBalance);expect(save.city!.influence).toBe(before.city!.influence);
 });
});
