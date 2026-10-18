import {describe,it,expect} from 'vitest';
import {CARDS} from '../src/data/cards';
import {KITS} from '../src/data/combat-kit';
import {createMatch,chooseEnemyAction,takeTurn,LOANERS,DISTRICTS,maxHp} from '../src/domain/battle';
import {applyCommand,decodeSave,EXCHANGE,initialSave,Save,Command} from '../src/domain/game';
const now=new Date('2026-10-11T12:00:00Z');let nonce=0;
const apply=(s:Save,c:Command)=>applyCommand(s,c,now,()=>0,`upgrade-${++nonce}`,s.revision);
describe('authored combat',()=>{
 it('gives each resident a different kit',()=>expect(new Set(Object.values(KITS).map(k=>JSON.stringify(k))).size).toBe(CARDS.length));
 it('applies squad bonuses at start',()=>{const mono=createMatch('m','street',['CC001','CC002','CC003'],{version:2});expect(mono.player.every(f=>f.charge===2&&f.guard===0)).toBe(true);const mixed=createMatch('m','street',LOANERS,{version:2});expect(mixed.player.every(f=>f.guard===.35)).toBe(true);});
 it('handles every authored special without exceeding health or turn bounds',()=>{for(const card of CARDS){const m=createMatch('m','street',[card.id,...LOANERS.filter(id=>id!==card.id)].slice(0,3),{version:2});m.player[0].charge=3;m.player.forEach(f=>f.hp-=25);const result=takeTurn(m,'player',{type:'ability'});result.player.forEach(f=>expect(f.hp).toBeLessThanOrEqual(maxHp(f.cardId,'street','player')));expect(result.step).toBe(1);}});
 it('exposure increases exactly one hit and is consumed',()=>{const m=createMatch('m','street',LOANERS,{version:2});m.enemy[0].guard=0;m.enemy[0].exposed=true;const exposed=takeTurn(m,'player',{type:'attack'});const normal=structuredClone(m);normal.enemy[0].exposed=false;expect(exposed.events.at(-1)!.damage).toBeGreaterThan(takeTurn(normal,'player',{type:'attack'}).events.at(-1)!.damage);expect(exposed.enemy[0].exposed).toBe(false);});
 it.each(DISTRICTS.map(d=>[d.id] as const))('v2 AI finishes legal combat in %s',id=>{for(const team of [LOANERS,['CC006','CC007','CC008'],['CC021','CC026','CC030']]){let m=createMatch('m',id,team,{version:2});while(m.phase!=='finished')m=takeTurn(m,m.phase,m.phase==='enemy'?chooseEnemyAction(m):{type:m.player[m.playerActive].charge===3?'ability':'attack'});expect(m.step).toBeLessThanOrEqual(80);}});
 it('keeps old battle rules when decoding legacy saves',()=>{const s=initialSave(now,'p');s.battle.active=createMatch('old','city-hall',LOANERS);expect(decodeSave(JSON.parse(JSON.stringify(s))).battle.active!.rulesVersion).toBe(1);});
});
describe('scrap and presets',()=>{
 it('preserves the last copy and refuses unknown ids',()=>{const s=initialSave(now,'p');s.inventory.CC001={regular:1,foil:0};s.discoveredCardIds=['CC001'];expect(()=>apply(s,{type:'recycle',cardId:'CC001'})).toThrow('at least one');expect(()=>apply(s,{type:'craft',cardId:'missing'})).toThrow();});
 it('crafting consumes more scrap than recycling produces and does not fake pack pulls',()=>{let s=initialSave(now,'p');s.inventory.CC001={regular:11,foil:0};s.discoveredCardIds=['CC001'];for(let i=0;i<10;i++)s=apply(s,{type:'recycle',cardId:'CC001'});expect(s.career.scrap).toBe(20);s=apply(s,{type:'craft',cardId:'CC001'});expect(s.career.scrap).toBe(0);expect(s.inventory.CC001.regular).toBe(2);expect(s.lifetimeCardsPulled).toBe(0);for(const rate of Object.values(EXCHANGE))expect(rate.craft).toBeGreaterThan(rate.recycle);});
 it('blocks exchanges during pack openings and live battles',()=>{let s=initialSave(now,'p');s=apply(s,{type:'open',sessionId:'p'});expect(()=>apply(s,{type:'craft',cardId:'CC001'})).toThrow('Finish');});
 it('saves slot three without invalid sparse arrays',()=>{const s=apply(initialSave(now,'p'),{type:'preset',slot:2,team:LOANERS});expect(decodeSave(s).career.presets[2]).toEqual(LOANERS);});
});
describe('bounded campaign and mastery rewards',()=>{
 const victory=(s:Save,mode:'campaign'|'daily'|'practice'='campaign')=>{s=apply(s,{type:'battle-start',matchId:`win-${++nonce}`,districtId:'street',team:LOANERS,mode});s.battle.active!.enemy.forEach(f=>f.hp=0);s.battle.active!.enemy[0].hp=1;s.battle.active!.enemyActive=0;return apply(s,{type:'battle-act',matchId:s.battle.active!.id,step:0,action:{type:'attack'}});};
 it('awards three resident mastery milestones once after the third campaign win',()=>{let s=initialSave(now,'p');s=victory(s);s=victory(s);expect(s.packBalance).toBe(4);s=victory(s);expect(s.packBalance).toBe(7);expect(s.battle.active!.reward).toEqual({packs:3,xp:60});s=victory(s);expect(s.packBalance).toBe(7);expect(s.battle.active!.reward).toEqual({packs:0,xp:0});});
 it('awards the daily remix only once per UTC day',()=>{let s=victory(initialSave(now,'p'),'daily');expect(s.packBalance).toBe(4);expect(s.battle.clearedDistrictIds).toEqual([]);s=victory(s,'daily');expect(s.packBalance).toBe(4);expect(s.awardedRewardIds.filter(id=>id.startsWith('daily-battle:'))).toHaveLength(1);});
 it('practice never grants XP, packs, mastery or scored wins',()=>{const s=victory(initialSave(now,'p'),'practice');expect(s.packBalance).toBe(3);expect(s.totalXp).toBe(0);expect(s.battle.wins).toBe(0);expect(s.career.mastery).toEqual({});});
 it('requires the preceding district before campaign progress',()=>{const s=initialSave(now,'p');expect(()=>apply(s,{type:'battle-start',matchId:'locked',districtId:'media',team:LOANERS})).toThrow('preceding');expect(apply(s,{type:'battle-start',matchId:'practice',districtId:'algorithm',team:LOANERS,mode:'practice'}).battle.active!.districtId).toBe('algorithm');});
});
