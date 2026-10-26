import {describe,expect,it} from 'vitest';
import {createMatch,LOANERS,type Match} from '../src/domain/battle';
import {initialSave} from '../src/domain/game';
import {freshRoast} from '../src/domain/roast';
import {battleRewardPreview,battleRewardResult,formatReward,roastRewardPreview,roastRewardResult,type RewardPresentation} from '../src/domain/rewards';

const now=new Date('2026-10-26T12:00:00Z');
const save=()=>initialSave(now,'reward-reader');
const total=(r:RewardPresentation,key:'tickets'|'xp'|'clout')=>r.lines.reduce((n,line)=>n+(line.amounts[key]??0),0);
function finished(packs:number,xp:number,overrides:Partial<Match>={}){
 return {...createMatch('reward-match','street',LOANERS,{version:5}),phase:'finished' as const,winner:'player' as const,reward:{packs,xp},...overrides};
}
describe('readable reward offers and saved receipts',()=>{
 it('shows first-clear rewards plus only the mastery milestones this crew can earn next',()=>{
  const s=save();s.career.mastery={[LOANERS[0]]:2,[LOANERS[1]]:9,[LOANERS[2]]:0};s.awardedRewardIds.push(`mastery:${LOANERS[1]}:3`);
  const offer=battleRewardPreview(s,{mode:'campaign',districtId:'street',team:LOANERS});
  expect(total(offer,'tickets')).toBe(3);expect(total(offer,'xp')).toBe(90);expect(total(offer,'clout')).toBe(50);
  expect(offer.mastery?.map(f=>f.remaining)).toEqual([1,1,3]);
 });
 it('does not promise a campaign reward or mastery milestone already paid',()=>{
  const s=save();s.awardedRewardIds.push('battle:street',`mastery:${LOANERS[0]}:3`);s.career.mastery[LOANERS[0]]=3;
  const offer=battleRewardPreview(s,{mode:'campaign',districtId:'street',team:LOANERS});
  expect(total(offer,'tickets')).toBe(0);expect(total(offer,'xp')).toBe(0);expect(total(offer,'clout')).toBe(50);
  expect(offer.mastery?.[0].remaining).toBe(7);
 });
 it('keeps daily first-win eligibility separate from replay mastery',()=>{
  const s=save();s.awardedRewardIds.push('daily-battle:2026-10-26');s.career.mastery[LOANERS[0]]=2;
  const offer=battleRewardPreview(s,{mode:'daily',districtId:'street',team:LOANERS,challengeKey:'2026-10-26'});
  expect(total(offer,'tickets')).toBe(1);expect(total(offer,'xp')).toBe(20);expect(total(offer,'clout')).toBe(50);
  expect(total(battleRewardPreview(s,{mode:'daily',districtId:'street',team:LOANERS,challengeKey:'2026-10-27'}),'xp')).toBe(45);
 });
 it('includes unpaid mastery thresholds in older imported progress, as the reducer does',()=>{
  const s=save();s.career.mastery[LOANERS[0]]=10;
  const offer=battleRewardPreview(s,{mode:'campaign',districtId:'street',team:LOANERS});
  expect(total(offer,'tickets')).toBe(3);expect(total(offer,'xp')).toBe(90);
  expect(offer.mastery?.[0].remaining).toBe(0);
 });
 it('uses sorted enemy identities for one-time rival rewards',()=>{
  const s=save(),input={mode:'campaign' as const,districtId:'street' as const,team:LOANERS,challengeKey:'rival:link',enemyTeam:[...LOANERS].reverse()};
  expect(total(battleRewardPreview(s,input),'clout')).toBe(500);
  s.awardedRewardIds.push('rival-crew:'+ [...LOANERS].sort().join(','));
  expect(total(battleRewardPreview(s,input),'clout')).toBe(50);expect(total(battleRewardPreview(s,input),'tickets')).toBe(0);
 });
 it('reconciles base and simultaneous mastery bonuses to the exact saved totals',()=>{
  for(const [mode,xp] of [['campaign',50],['daily',25]] as const){
   const match=finished(4,xp+60,{mode}),receipt=battleRewardResult(match);
   expect(total(receipt,'tickets')).toBe(match.reward.packs);expect(total(receipt,'xp')).toBe(match.reward.xp);
   expect(receipt.lines.some(l=>l.label.includes('3 milestones'))).toBe(true);
  }
 });
 it('recognizes mastery-only replays and ordinary wins without inventing pack rewards',()=>{
  const mastery=battleRewardResult(finished(1,20));
  expect(total(mastery,'tickets')).toBe(1);expect(total(mastery,'xp')).toBe(20);expect(total(mastery,'clout')).toBe(50);
  expect(mastery.lines.some(l=>l.label.includes('district'))).toBe(false);
  const replay=battleRewardResult(finished(0,0));
  expect(total(replay,'tickets')).toBe(0);expect(total(replay,'clout')).toBe(50);expect(replay.note).toContain('mastery win');
 });
 it('retains legacy or unrecognized receipts verbatim without reconstructed history',()=>{
  for(const match of [finished(1,50,{rulesVersion:4}),finished(2,87)]){
   const receipt=battleRewardResult(match);
   expect(total(receipt,'tickets')).toBe(match.reward.packs);expect(total(receipt,'xp')).toBe(match.reward.xp);
   expect(total(receipt,'clout')).toBe(0);expect(receipt.lines).toHaveLength(1);expect(receipt.note).toContain('no detailed reward receipt');
  }
 });
 it('never promises account rewards in practice or on losses',()=>{
  expect(battleRewardPreview(save(),{mode:'practice',districtId:'street',team:LOANERS}).lines).toEqual([]);
  expect(battleRewardResult(finished(0,0,{mode:'practice'})).lines).toEqual([]);
  expect(battleRewardResult(finished(0,0,{winner:'enemy'})).lines).toEqual([]);
 });
 it('distinguishes Roast first clear, encore, and separate practice',()=>{
  const s=save();expect(total(roastRewardPreview(s),'tickets')).toBe(1);
  s.awardedRewardIds.push('encounter:roast-night');expect(roastRewardPreview(s).lines).toEqual([]);
  const roast={...freshRoast('show',LOANERS,'steady',now,2),winner:'player' as const,rewarded:true};
  expect(total(roastRewardResult(roast),'xp')).toBe(60);expect(roastRewardResult(roast,true).lines).toEqual([]);
  expect(roastRewardResult({...roast,rewarded:false}).title).toBe('ENCORE COMPLETE');
 });
 it('keeps ticket, XP, Trash and Clout units distinct',()=>{
  expect(formatReward({tickets:1,xp:50})).toBe('1 TICKET · 50 XP');
  expect(formatReward({tickets:2,trash:6,clout:50})).toBe('2 TICKETS · 6 TRASH · 50 CLOUT');
 });
});
