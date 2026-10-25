import {describe,expect,it} from 'vitest';
import {DECK_RECIPES,TACTICAL_DECK,allTactics,tacticDeckSchema,districtRecipe,districtTacticDeck,detectDeckRecipe} from '../src/domain/duel-rules';
import {createMatch,LOANERS,matchSchema,takeTurn,type BattleAction} from '../src/domain/battle';
import {applyCommand,initialSave} from '../src/domain/game';
import {trainingMatch,applyTrainingMove,trainerAction,type TrainingLesson} from '../src/domain/duel-training';

describe('build and play a tactics deck',()=>{
 it('validates twelve cards, known identities and at most two copies, including every recipe',()=>{
  for(const recipe of DECK_RECIPES)expect(tacticDeckSchema.safeParse(recipe.cards).success).toBe(true);
  expect(tacticDeckSchema.safeParse(TACTICAL_DECK.slice(1)).success).toBe(false);
  expect(tacticDeckSchema.safeParse(TACTICAL_DECK.map((id,i)=>i===5?'receipt':id)).success).toBe(false);
  expect(tacticDeckSchema.safeParse([...TACTICAL_DECK.slice(1),'unknown']).success).toBe(false);
 });
 it('snapshots the selected deck into the cloud match and preserves composition through play and reload',()=>{
  const now=new Date('2026-10-21T12:00:00Z'),deck=[...DECK_RECIPES[2].cards];let s=initialSave(now,'custom-deck');
  s=applyCommand(s,{type:'battle-start',rulesVersion:5,tacticDeck:deck,matchId:'custom',districtId:'street',team:LOANERS},now,()=>0,'start',0);
  let m=s.battle.active!;expect(allTactics(m.duel!.player).sort()).toEqual([...deck].sort());expect(allTactics(m.duel!.enemy).sort()).toEqual([...TACTICAL_DECK].sort());
  m=takeTurn(m,'player',{type:'attack'});m=matchSchema.parse(JSON.parse(JSON.stringify(m)));
  expect(allTactics(m.duel!.player).sort()).toEqual([...deck].sort());
  expect(()=>createMatch('bad','street',LOANERS,{version:5,tacticDeck:Array(12).fill('receipt')})).toThrow();
 });
 it('keeps original fixed-deck saves valid',()=>{expect(matchSchema.safeParse(createMatch('old','street',LOANERS,{version:5})).success).toBe(true);expect(matchSchema.safeParse(createMatch('legacy','street',LOANERS,{version:4})).success).toBe(true);});
 it('equips each district boss and rival challenge with its thematic tactics recipe',()=>{
  expect(districtRecipe('street').id).toBe('balanced');
  expect(districtRecipe('media').id).toBe('pressure');
  expect(districtRecipe('corporate').id).toBe('control');
  expect(districtRecipe('crypto').id).toBe('consequences');
  expect(districtRecipe('city-hall').id).toBe('control');
  expect(districtRecipe('algorithm').id).toBe('slop-cycle');
  for(const d of ['street','media','corporate','crypto','city-hall','algorithm'] as const){
   const m=createMatch(`district-${d}`,d,LOANERS,{version:5});
   expect(allTactics(m.duel!.enemy).sort()).toEqual([...districtTacticDeck(d)].sort());
   expect(matchSchema.safeParse(m).success).toBe(true);
  }
  const rival=createMatch('rival-deck','street',LOANERS,{version:5,challengeKey:'rival:Tester:CC001,CC006,CC023:450:consequences'});
  expect(allTactics(rival.duel!.enemy).sort()).toEqual([...DECK_RECIPES[4].cards].sort());
  for(const r of DECK_RECIPES)expect(detectDeckRecipe(r.cards).id).toBe(r.id);
 });
});
describe('guided real-rule rehearsal',()=>{
 it('teaches attack, spell plus attack, a reacting trap and Special without a dead end',()=>{
  let m=trainingMatch('lesson'),lesson:TrainingLesson='attack';
  const reply=()=>{let safety=0;while(m.phase==='enemy'){expect(++safety).toBeLessThan(4);m=takeTurn(m,'enemy',trainerAction(m));}expect(m.phase).toBe('player');};
  const move=(action:BattleAction)=>{({match:m,lesson}=applyTrainingMove(m,lesson,action));reply();expect(matchSchema.safeParse(m).success).toBe(true);};
  expect(()=>applyTrainingMove(m,lesson,{type:'guard'})).toThrow('lesson');
  move({type:'attack'});expect(lesson).toBe('spell');move({type:'play',cardId:'receipt'});expect(m.phase).toBe('player');move({type:'attack'});
  move({type:'play',cardId:'note'});expect(m.duel!.player.trap).toBe('note');move({type:'guard'});
  expect(m.events.some(e=>e.reaction==='Community Note')).toBe(true);expect(m.player[0].charge).toBe(3);
  move({type:'ability'});expect(lesson).toBe('replacement-ready');
 });
 it('explains an empty frontline and replaces the KO without consuming the attack',()=>{
  let m=trainingMatch('replacement',true),lesson:TrainingLesson='replace';expect(m.duel!.player.lp).toBe(80);expect(m.player[0].hp).toBe(0);
  ({match:m,lesson}=applyTrainingMove(m,lesson,{type:'summon',slot:1}));expect(m.phase).toBe('player');expect(m.playerActive).toBe(1);
  ({match:m,lesson}=applyTrainingMove(m,lesson,{type:'attack'}));expect(lesson).toBe('done');expect(m.events.at(-1)?.damage).toBeGreaterThan(0);
 });
});
