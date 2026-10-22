import {describe,expect,it} from 'vitest';
import {advanceRoastPractice,freshRoast,roastActionForecast,roastMovesLeft,roastV2Intent,type Roast,type RoastAction} from '../src/domain/roast';

const now=new Date('2026-10-22T16:00:00Z');
const fresh=()=>freshRoast('clarity',['CC001','CC008','CC015'],'steady',now,2);
const intent=(kind:'rant'|'heckle'|'tantrum')=>{const r=fresh();while(roastV2Intent(r).kind!==kind)r.turn++;return r;};
const move=(r:Roast,action:RoastAction)=>advanceRoastPractice(r,{type:'roast-act',matchId:r.id,step:r.step,action},now);

describe('readable full-exchange forecasts',()=>{
 it('shows the damage actually taken after an interruption or defense',()=>{
  const rant=intent('rant');
  expect(roastActionForecast(rant,{type:'reply',tone:'bait'})).toMatchObject({incoming:0,interrupted:true});
  const tantrum=intent('tantrum'),base=roastV2Intent(tantrum).damage;
  expect(roastActionForecast(tantrum,{type:'reply',tone:'deadpan'})!.incoming).toBe(Math.round(base*.4));
  expect(roastActionForecast(tantrum,{type:'reply',tone:'jab'})!.incoming).toBe(base);
 });
 it('shows applause after the automatic response rather than promising the initial gain',()=>{
  const r=intent('heckle');
  expect(roastActionForecast(r,{type:'reply',tone:'jab'})!.crowd).toBe(7);
  r.crowd=100;
  expect(roastActionForecast(r,{type:'reply',tone:'jab'})!.crowd).toBe(-5);
 });
 it('does not forecast a return hit from an opponent defeated by the reply',()=>{
  const r=intent('heckle');r.enemyHp=1;r.crowd=50;
  const preview=roastActionForecast(r,{type:'reply',tone:'jab'})!,next=move(r,{type:'reply',tone:'jab'});
  expect(preview).toMatchObject({damage:1,incoming:0,actCleared:true});
  expect(preview.crowd).toBe(next.crowd-50);
  expect(preview.hype).toBe(next.team[0].hype-r.team[0].hype);
 });
 it('accounts for repeated delivery and the resulting stronger return hit',()=>{
  const r=intent('heckle');r.lastMove='reply:jab';r.repeat=1;
  const preview=roastActionForecast(r,{type:'reply',tone:'jab'})!;
  expect(preview.crowd).toBe(-27);
  expect(preview.incoming).toBe(24);
  expect(preview.damage).toBeLessThan(roastActionForecast(intent('heckle'),{type:'reply',tone:'jab'})!.damage);
 });
 it('includes copium damage when the absorbed return hit clears an act',()=>{
  const r=intent('heckle');r.copium=true;r.enemyHp=20;
  const preview=roastActionForecast(r,{type:'reply',tone:'deadpan'})!;
  expect(preview).toMatchObject({damage:20,incoming:0,actCleared:true});
 });
 it('caps damage at the resident’s remaining composure and warns about a knockout',()=>{
  const r=intent('heckle');r.team[0].hp=1;
  expect(roastActionForecast(r,{type:'reply',tone:'jab'})).toMatchObject({incoming:1,knockout:true});
  r.team[1].hp=0;r.team[2].hp=0;
  expect(roastActionForecast(r,{type:'reply',tone:'jab'})).toMatchObject({incoming:1,knockout:true,lost:true});
 });
 it('exposes the final move limit and does not invent a reply after closing',()=>{
  const r=fresh();r.turn=35;
  expect(roastMovesLeft(r)).toBe(1);
  const preview=roastActionForecast(r,{type:'switch',slot:1})!;
  expect(preview).toMatchObject({incoming:0,timeout:true});
  const closed=move(r,{type:'switch',slot:1});
  expect(roastMovesLeft(closed)).toBe(0);
  expect(roastActionForecast(closed,{type:'reply',tone:'jab'})).toBeNull();
  const legacy=freshRoast('old',['CC001','CC008','CC015'],'steady',now);legacy.turn=35;
  expect(roastMovesLeft(legacy)).toBe(25);
 });
 it('leaves the real show unchanged and does not preview illegal Specials or enemy turns',()=>{
  const r=fresh(),snapshot=structuredClone(r);
  expect(roastActionForecast(r,{type:'special'})).toBeNull();
  roastActionForecast(r,{type:'reply',tone:'jab'});
  expect(r).toEqual(snapshot);
  expect(roastActionForecast(move(r,{type:'reply',tone:'jab'}),{type:'reply',tone:'bait'})).toBeNull();
 });
});
