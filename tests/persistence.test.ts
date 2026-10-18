import {beforeEach,describe,expect,it,vi} from 'vitest';
import {initialSave,saveSchema} from '../src/domain/game';
class MemoryStorage {
 data=new Map<string,string>();fail=false;
 getItem(key:string){return this.data.get(key)||null;}
 setItem(key:string,value:string){if(this.fail)throw new Error('Quota exceeded');this.data.set(key,value);}
 removeItem(key:string){this.data.delete(key);}
}
let storage:MemoryStorage;
beforeEach(()=>{
 vi.stubGlobal('location',{hostname:'localhost'});storage=new MemoryStorage();vi.stubGlobal('localStorage',storage);
 let queue=Promise.resolve();
 vi.stubGlobal('navigator',{locks:{request:(_name:string,fn:()=>unknown)=>{const result=queue.then(fn);queue=result.then(()=>undefined,()=>undefined);return result;}}});
 vi.resetModules();
});
describe('saved commands',()=>{
 it('initialises once and survives remount',async()=>{const {useGame,SAVE_KEY}=await import('../src/state/store');useGame.getState().hydrate();expect(await useGame.getState().enter()).toBe(true);const first=storage.getItem(SAVE_KEY);expect(await useGame.getState().enter()).toBe(true);expect(storage.getItem(SAVE_KEY)).toBe(first);useGame.getState().hydrate();expect(useGame.getState().save?.packBalance).toBe(3);});
 it('publishes no reward when writing fails',async()=>{const {useGame}=await import('../src/state/store');useGame.getState().hydrate();await useGame.getState().enter();storage.fail=true;expect(await useGame.getState().run({type:'open',sessionId:'x'})).toBe(false);expect(useGame.getState().save?.packBalance).toBe(3);expect(useGame.getState().save?.inventory).toEqual({});});
 it('rejects invalid imports without overwriting data',async()=>{const {useGame,SAVE_KEY}=await import('../src/state/store');useGame.getState().hydrate();await useGame.getState().enter();const before=storage.getItem(SAVE_KEY);expect(await useGame.getState().importSave('{bad')).toBe(false);expect(storage.getItem(SAVE_KEY)).toBe(before);});
 it('preserves corrupted data during hydration',async()=>{const {useGame,SAVE_KEY}=await import('../src/state/store');storage.data.set(SAVE_KEY,'{bad');useGame.getState().hydrate();expect(useGame.getState().error).toContain('could not be read');expect(storage.getItem(SAVE_KEY)).toBe('{bad');});
 it('serialises competing tabs and credits a daily claim once',async()=>{const one=await import('../src/state/store');storage.setItem(one.SAVE_KEY,JSON.stringify(initialSave(new Date(),'player')));one.useGame.getState().hydrate();vi.resetModules();const two=await import('../src/state/store');two.useGame.getState().hydrate();const result=await Promise.all([one.useGame.getState().run({type:'daily'}),two.useGame.getState().run({type:'daily'})]);expect(result.filter(Boolean)).toHaveLength(1);const saved=saveSchema.parse(JSON.parse(storage.getItem(one.SAVE_KEY)!));expect(saved.packBalance).toBe(6);expect(saved.awardedRewardIds.filter(id=>id.startsWith('daily:'))).toHaveLength(1);});
 it('upgrades a legacy save only after a successful persisted command',async()=>{const {useGame,SAVE_KEY}=await import('../src/state/store');const base=initialSave(new Date(),'legacy');const legacy=JSON.stringify({...base,schemaVersion:1,activity:undefined,onboardingSeen:undefined});storage.setItem(SAVE_KEY,legacy);useGame.getState().hydrate();expect(useGame.getState().save?.schemaVersion).toBe(2);expect(storage.getItem(SAVE_KEY)).toBe(legacy);storage.fail=true;expect(await useGame.getState().run({type:'finish-onboarding'})).toBe(false);expect(storage.getItem(SAVE_KEY)).toBe(legacy);storage.fail=false;useGame.getState().clearError();expect(await useGame.getState().run({type:'finish-onboarding'})).toBe(true);expect(JSON.parse(storage.getItem(SAVE_KEY)!).schemaVersion).toBe(2);});
 it('serialises a competing job claim and grants the reward once',async()=>{const one=await import('../src/state/store');const save=initialSave(new Date(),'player');save.activity.dailyOpened=2;storage.setItem(one.SAVE_KEY,JSON.stringify(save));one.useGame.getState().hydrate();vi.resetModules();const two=await import('../src/state/store');two.useGame.getState().hydrate();const result=await Promise.all([one.useGame.getState().run({type:'claim-mission',missionId:'daily-open'}),two.useGame.getState().run({type:'claim-mission',missionId:'daily-open'})]);expect(result.filter(Boolean)).toHaveLength(1);const saved=saveSchema.parse(JSON.parse(storage.getItem(one.SAVE_KEY)!));expect(saved.packBalance).toBe(5);expect(saved.awardedRewardIds.filter(id=>id.startsWith('job:daily-open:'))).toHaveLength(1);});
 it('refuses mutations when browser coordination is unavailable',async()=>{vi.stubGlobal('navigator',{});const {useGame,SAVE_KEY}=await import('../src/state/store');storage.setItem(SAVE_KEY,JSON.stringify(initialSave(new Date(),'player')));useGame.getState().hydrate();const before=storage.getItem(SAVE_KEY);expect(await useGame.getState().run({type:'daily'})).toBe(false);expect(storage.getItem(SAVE_KEY)).toBe(before);expect(useGame.getState().error).toContain('cannot safely save');});
 it('resumes a saved battle and applies competing AI ticks exactly once',async()=>{
  const one=await import('../src/state/store');one.useGame.getState().hydrate();await one.useGame.getState().enter();
  await one.useGame.getState().run({type:'battle-start',matchId:'fight',districtId:'street',team:['CC001','CC008','CC015']});
  await one.useGame.getState().run({type:'battle-act',matchId:'fight',step:0,action:{type:'attack'}});
  const before=one.useGame.getState().save!;vi.resetModules();const two=await import('../src/state/store');two.useGame.getState().hydrate();
  expect(two.useGame.getState().save?.battle.active?.phase).toBe('enemy');
  await Promise.all([one.useGame.getState().run({type:'battle-enemy',matchId:'fight',step:1}),two.useGame.getState().run({type:'battle-enemy',matchId:'fight',step:1})]);
  const stored=saveSchema.parse(JSON.parse(storage.getItem(one.SAVE_KEY)!));expect(stored.battle.active?.step).toBe(2);expect(stored.revision).toBe(before.revision+1);expect(stored.battle.active?.events.filter(e=>e.side==='enemy')).toHaveLength(1);expect(two.useGame.getState().error).toBeNull();
 });
 it('credits no battle win or clear reward when persistence fails',async()=>{
  const {useGame,SAVE_KEY}=await import('../src/state/store');useGame.getState().hydrate();await useGame.getState().enter();await useGame.getState().run({type:'battle-start',matchId:'fight',districtId:'street',team:['CC001','CC008','CC015']});
  const s=structuredClone(useGame.getState().save!);s.battle.active!.enemy.forEach(f=>f.hp=0);s.battle.active!.enemy[0].hp=1;storage.setItem(SAVE_KEY,JSON.stringify(s));useGame.getState().hydrate();const before=storage.getItem(SAVE_KEY);storage.fail=true;
  expect(await useGame.getState().run({type:'battle-act',matchId:'fight',step:0,action:{type:'attack'}})).toBe(false);expect(storage.getItem(SAVE_KEY)).toBe(before);expect(useGame.getState().save?.battle.wins).toBe(0);expect(useGame.getState().save?.packBalance).toBe(3);
 });

});
describe('local city persistence failures',()=>{
 it('does not publish a founded city when the browser write fails',async()=>{const {useGame}=await import('../src/state/store');useGame.getState().hydrate();await useGame.getState().enter();storage.fail=true;expect(await useGame.getState().run({type:'city-start'})).toBe(false);expect(useGame.getState().save!.city).toBeNull();});
 it('does not publish uncommitted Influence on storage failure',async()=>{const {useGame}=await import('../src/state/store');useGame.getState().hydrate();await useGame.getState().enter();await useGame.getState().run({type:'city-start'});storage.fail=true;expect(await useGame.getState().run({type:'city-collect'})).toBe(false);expect(useGame.getState().save!.city!.influence).toBe(200);expect(useGame.getState().save!.city!.lastProductionDay).toBeNull();});
});
describe('prop save recovery',()=>{
 it('does not publish a prop or a reward marker when a write fails',async()=>{const {useGame,SAVE_KEY}=await import('../src/state/store');useGame.getState().hydrate();await useGame.getState().enter();const before=storage.getItem(SAVE_KEY);storage.fail=true;expect(await useGame.getState().run({type:'prop-claim',propId:'P001'})).toBe(false);expect(useGame.getState().save?.props.ownedIds).toEqual([]);expect(useGame.getState().save?.awardedRewardIds).not.toContain('prop:P001');expect(storage.getItem(SAVE_KEY)).toBe(before);});
 it('recovers owned equipment and prevents a failed equip or display from appearing',async()=>{const {useGame,SAVE_KEY}=await import('../src/state/store');useGame.getState().hydrate();await useGame.getState().enter();await useGame.getState().run({type:'prop-claim',propId:'P001'});await useGame.getState().run({type:'prop-equip',residentId:'CC001',propId:'P001'});await useGame.getState().run({type:'city-start'});await useGame.getState().run({type:'prop-display',propId:'P001'});const before=storage.getItem(SAVE_KEY);useGame.getState().hydrate();expect(useGame.getState().save?.props).toMatchObject({ownedIds:['P001'],loadout:{CC001:'P001'},cityDisplay:'P001'});storage.fail=true;expect(await useGame.getState().run({type:'prop-equip',residentId:'CC001',propId:null})).toBe(false);expect(useGame.getState().save?.props.loadout.CC001).toBe('P001');useGame.getState().clearError();expect(await useGame.getState().run({type:'prop-display',propId:null})).toBe(false);expect(useGame.getState().save?.props.cityDisplay).toBe('P001');expect(storage.getItem(SAVE_KEY)).toBe(before);});
});
