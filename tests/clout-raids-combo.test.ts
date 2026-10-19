import {describe,expect,it} from 'vitest';
import {createMatch,takeTurn,crewFor,attackPower,matchSchema,LOANERS} from '../src/domain/battle';
import {initialSave,applyCommand,decodeSave,Save} from '../src/domain/game';

const now=new Date('2026-10-19T12:00:00Z');
let nonce=0;
const act=(s:Save,c:Parameters<typeof applyCommand>[1])=>applyCommand(s,c,now,()=>0,`cmd-${++nonce}`,s.revision);

describe('Clout currency, combo multiplier, and rival raids', ()=>{
 it('initializes career with zero clout and saves clout across decode', ()=>{
  const s=initialSave(now,'test-user');
  expect(s.career.clout).toBe(0);
  const raw=JSON.parse(JSON.stringify(s));
  expect(decodeSave(raw).career.clout).toBe(0);
 });

 it('earns clout from street schemes and timeline ratios', ()=>{
  let s=initialSave(now,'schemer');
  s=act(s,{type:'clout-scheme',scheme:'safe'});
  expect(s.career.clout).toBe(40);
  expect(s.totalXp).toBe(10);

  s=act(s,{type:'clout-scheme',scheme:'risk'});
  expect(s.career.clout).toBe(290);
  expect(s.totalXp).toBe(45);
  expect(s.packBalance).toBe(4);

  s=act(s,{type:'clout-scheme',scheme:'grift'});
  expect(s.career.clout).toBe(440);
  expect(s.totalXp).toBe(65);

  s=act(s,{type:'timeline-ratio',threadId:'post-1'});
  expect(s.career.clout).toBe(475);
  expect(s.totalXp).toBe(70);

  // Replaying ratio on same thread does not duplicate reward
  s=act(s,{type:'timeline-ratio',threadId:'post-1'});
  expect(s.career.clout).toBe(475);
 });

 it('applies combo multiplier to attack damage in takeTurn', ()=>{
  const m=createMatch('combo-match','street',LOANERS);
  const basePower=attackPower('CC001','street','player');
  const enemyStartHp=m.enemy[0].hp;

  // 1-card turn (no combo)
  const turn1=takeTurn(m,'player',{type:'attack'});
  expect(turn1.enemy[0].hp).toBe(enemyStartHp-basePower);
  expect(turn1.events[0].title).toBe('CALLED OUT!');

  // 2-card turn (combo: 2 -> 1.35x multiplier)
  const turnCombo2=takeTurn(m,'player',{type:'attack',combo:2});
  const expectedCombo2Dmg=Math.round(basePower*1.35);
  expect(turnCombo2.enemy[0].hp).toBe(enemyStartHp-expectedCombo2Dmg);
  expect(turnCombo2.events[0].title).toBe('CALLED OUT! [2X COMBO!]');
  expect(turnCombo2.events[0].passive).toContain('COMBO x2');

  // 3-card turn (combo: 3 -> 1.70x multiplier)
  const turnCombo3=takeTurn(m,'player',{type:'attack',combo:3});
  const expectedCombo3Dmg=Math.round(basePower*1.70);
  expect(turnCombo3.enemy[0].hp).toBe(enemyStartHp-expectedCombo3Dmg);
  expect(turnCombo3.events[0].title).toBe('CALLED OUT! [3X COMBO!]');
  expect(turnCombo3.events[0].damage).toBe(expectedCombo3Dmg);
 });

 it('reinforces guard when played as part of a combo', ()=>{
  const m=createMatch('guard-match','street',LOANERS);
  const turnComboGuard=takeTurn(m,'player',{type:'guard',combo:2});
  expect(turnComboGuard.player[0].guard).toBe(0.6);
  expect(turnComboGuard.events[0].title).toBe('PR SHIELD [2X COMBO!]');
  expect(turnComboGuard.events[0].passive).toContain('PR SHIELD');
 });

 it('resolves rival raid crew and validates matchSchema', ()=>{
  const challengeKey='rival:@SOLANA_WHALE_99:CC031,CC023,CC063:450';
  const crew=crewFor('crypto','campaign',challengeKey);
  expect(crew).toEqual(['CC031','CC023','CC063']);

  const match=createMatch('raid-1','crypto',LOANERS,{version:3,mode:'campaign',challengeKey});
  expect(match.enemy.map(f=>f.cardId)).toEqual(['CC031','CC023','CC063']);
  expect(matchSchema.safeParse(match).success).toBe(true);
 });

 it('pays the rival bounty in Clout upon defeating the rival crew', ()=>{
  let s=initialSave(now,'raider');
  const challengeKey='rival:@SOLANA_WHALE_99:CC031,CC023,CC063:450';
  s=act(s,{type:'battle-start',matchId:'raid-battle',districtId:'crypto',team:LOANERS,challengeKey});

  expect(s.battle.active?.challengeKey).toBe(challengeKey);
  expect(s.battle.active?.enemy.map(f=>f.cardId)).toEqual(['CC031','CC023','CC063']);

  // Bring enemy fighters to 0 HP except active has 1 HP
  s.battle.active!.enemy[1].hp=0;
  s.battle.active!.enemy[2].hp=0;
  s.battle.active!.enemy[0].hp=1;

  // Deliver the finishing hit
  s=act(s,{type:'battle-act',matchId:'raid-battle',step:0,action:{type:'attack'}});

  expect(s.battle.active?.phase).toBe('finished');
  expect(s.battle.active?.winner).toBe('player');
  // 50 (standard win) + 450 (rival bounty) = 500 Clout!
  expect(s.career.clout).toBe(500);
  expect(s.battle.wins).toBe(1);
 });
});
