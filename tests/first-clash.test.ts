import {describe,expect,it} from 'vitest';
import {ROAST_SCRIPT,roastExchange} from '../src/data/roast-script';
import {advanceRoastPractice} from '../src/domain/roast';
import {clashSeed,createFirstClash,FIRST_CLASH_EXCHANGE,FIRST_CLASH_SEED,freshFirstClashSession,parseFirstClashSession,resolveFirstClash} from '../src/domain/first-clash';

describe('one real exchange before entering Cancel City',()=>{
 it('opens on the deliberately selected joke and preserves it across challenge reloads',()=>{
  const before=createFirstClash();
  expect(before.id).toBe(FIRST_CLASH_SEED);
  expect(roastExchange(before.round,before.turn,before.id).id).toBe(FIRST_CLASH_EXCHANGE);
  expect(createFirstClash(clashSeed(FIRST_CLASH_SEED))).toEqual(before);
  expect(clashSeed('untrusted-random-show')).toBe(FIRST_CLASH_SEED);
  expect(clashSeed('x'.repeat(10000))).toBe(FIRST_CLASH_SEED);
 });
 it('uses the authored reply and both real reducer turns for each tone',()=>{
  const authored=ROAST_SCRIPT[0].find(e=>e.id===FIRST_CLASH_EXCHANGE)!;
  for(const tone of ['jab','bait','deadpan'] as const){
   const {before,playerBeat,after,result}=resolveFirstClash(tone);
   const expected=advanceRoastPractice(playerBeat,{type:'roast-enemy',matchId:playerBeat.id,step:playerBeat.step},new Date('2026-01-01T00:00:01Z'));
   expect(after).toEqual(expected);
   expect(result.reply).toBe(authored.responses.find(r=>r.id===tone)!.line);
   expect(result.retort).toBe(authored.responses.find(r=>r.id===tone)!.reaction);
   expect(result.damage).toBe(before.enemyHp-after.enemyHp);
   expect(result.incoming).toBe(before.team[0].hp-after.team[0].hp);
   expect(result.crowd).toBe(after.crowd);
   expect(before.events).toEqual([]);
  }
 });
 it('finishes a personal exchange without claiming a match victory or rewards',()=>{
  const results=['jab','bait','deadpan'].map(t=>resolveFirstClash(t as 'jab'|'bait'|'deadpan'));
  expect(new Set(results.map(r=>r.result.verdict)).size).toBe(3);
  for(const {after,result} of results){
   expect(after.step).toBe(2);expect(after.turn).toBe(1);expect(after.phase).toBe('player');
   expect(after.winner).toBeNull();expect(after.rewarded).toBe(false);
   expect(result.damage).toBeGreaterThan(0);expect(result.incoming).toBeGreaterThanOrEqual(0);
   expect('tickets' in result).toBe(false);expect('reward' in result).toBe(false);
  }
 });
 it('restores a chosen line and keeps completion separate from reaching a result',()=>{
  const session={...freshFirstClashSession(),phase:'result' as const,tone:'deadpan' as const};
  expect(parseFirstClashSession(JSON.stringify(session))).toEqual(session);
  const restored=parseFirstClashSession(JSON.stringify({...session,completed:true}))!;
  expect(restored.completed).toBe(true);
  expect(resolveFirstClash(restored.tone!,restored.seed).result).toEqual(resolveFirstClash('deadpan').result);
  expect(parseFirstClashSession(JSON.stringify({...session,tone:'spam'}))).toBeNull();
  expect(parseFirstClashSession(JSON.stringify({...session,tone:undefined}))).toBeNull();
  expect(parseFirstClashSession(JSON.stringify({...session,seed:'arbitrary-show'}))).toBeNull();
  expect(parseFirstClashSession('{broken')).toBeNull();
 });
});
